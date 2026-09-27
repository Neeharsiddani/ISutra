// ============================================================
// ISutra — Document Extraction Service
// Phase F: Real Procurement Document Ingestion (PDF / DOCX)
// Safe, offline, zero-external-API document text parser
// Note: Document parsers (pdf-parse, mammoth) are dynamically imported on-demand
// so they never crash serverless startup when handling text analysis requests.


export interface DocumentSection {
  title: string;
  content: string;
}

export interface DocumentExtractionResult {
  text: string;
  pageCount?: number;
  fileType: 'pdf' | 'docx' | 'doc';
  fileName: string;
  fileSize: number;
  extractionMethod: 'pdf-parse' | 'mammoth' | 'text' | 'fallback' | 'ocr';
  warnings: string[];
  isScannedOrEmpty: boolean;
  multipleProductsDetected: boolean;
  detectedProducts: string[];
  primaryProductAnalyzed?: string;
  sections?: DocumentSection[];
  isOcrDerived?: boolean;
  ocrEngine?: string;
  ocrPageCount?: number;
}

export interface DocumentUploadInput {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
  size?: number;
  enableOcr?: boolean;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];

/**
 * Sanitize filename to prevent directory traversal and injection attacks
 */
export function sanitizeFilename(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') {
    return 'uploaded_document.pdf';
  }

  // Strip path traversal sequences, directory separators, and control characters
  let clean = rawName
    .replace(/\.\.+/g, '')
    .replace(/[/\\]+/g, '')
    .replace(/[\x00-\x1f\x7f]/g, '')
    .trim();

  // Remove dangerous characters
  clean = clean.replace(/[^a-zA-Z0-9._\- ]/g, '_');

  if (!clean || clean === '.' || clean === '..') {
    clean = 'procurement_specification';
  }

  return clean;
}

/**
 * Inspect magic bytes / file signatures to verify file integrity
 */
export function validateFileSignature(buffer: Buffer, extension: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  if (extension === '.pdf') {
    // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46)
    return (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }

  if (extension === '.docx') {
    // DOCX is a ZIP archive: PK\x03\x04 (0x50 0x4B 0x03 0x04)
    return (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4B &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    );
  }

  if (extension === '.doc') {
    // Binary DOC (OLE CFB): \xD0\xCF\x11\xE0
    return (
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0
    );
  }

  return false;
}

/**
 * Clean and normalize extracted text while preserving technical values and paragraphs
 */
export function normalizeExtractedDocumentText(rawText: string): string {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null and non-printable control characters (except newline, tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace smart quotes and dashes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/–|—/g, '-')
    // Replace 3+ consecutive newlines with double newline (preserve paragraphs)
    .replace(/\n{3,}/g, '\n\n')
    // Remove repeated horizontal whitespace
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Detect multi-product requisitions or distinct lots within procurement documents
 */
export function detectMultipleProducts(text: string): {
  multipleDetected: boolean;
  products: string[];
  primaryProduct?: string;
  warning?: string;
} {
  const itemMatches: string[] = [];
  
  // Patterns for tender items / lots
  const itemRegex = /(?:Item|Lot|Schedule|Package)\s*(?:No\.?|#)?\s*([0-9A-Za-z]+)\s*[:\-–]\s*([^\n\r.;]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(text)) !== null) {
    const itemDesc = match[2].trim();
    if (itemDesc.length > 3 && itemDesc.length < 100) {
      itemMatches.push(itemDesc);
    }
  }

  // Cross-category mentions in distinct technical sections
  const productDomains: string[] = [];
  if (/cable|conductor|xlpe|armoured\s+cable/i.test(text)) productDomains.push('Electrical Cables');
  if (/luminaire|streetlight|floodlight|led\s+module/i.test(text)) productDomains.push('Luminaires & Lighting');
  if (/concrete\s+pipe|masonry\s+block|tmt\s+bar|reinforcement/i.test(text)) productDomains.push('Civil Construction Materials');
  if (/safety\s+footwear|protective\s+gloves|firefighter\s+clothing|respirator/i.test(text)) productDomains.push('Personal Protective Equipment');

  const multipleDetected = itemMatches.length > 1 || productDomains.length > 1;
  const products = itemMatches.length > 1 ? itemMatches : productDomains;
  const primaryProduct = products.length > 0 ? products[0] : undefined;

  let warning: string | undefined;
  if (multipleDetected && primaryProduct) {
    warning = `Document contains multiple distinct product specifications (${products.slice(0, 3).join(', ')}). Analyzing primary item: '${primaryProduct}'. Future updates will support multi-item lot processing.`;
  }

  return {
    multipleDetected,
    products,
    primaryProduct,
    warning,
  };
}

/**
 * Main Document Extraction Coordinator
 */
export async function extractDocument(input: DocumentUploadInput): Promise<DocumentExtractionResult> {
  const warnings: string[] = [];
  const safeName = sanitizeFilename(input.originalname);
  const fileSize = input.size || input.buffer.length;

  // 1. File Size Validation
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds maximum limit of 15 MB (uploaded: ${(fileSize / (1024 * 1024)).toFixed(2)} MB).`
    );
  }

  // 2. Extension Validation
  const extensionMatch = safeName.match(/\.[a-zA-Z0-9]+$/);
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : '';
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Unsupported file format '${extension || 'unknown'}'. Please upload a PDF (.pdf) or Word document (.docx).`
    );
  }

  // 3. Security / Signature Check
  const isValidSignature = validateFileSignature(input.buffer, extension);
  if (!isValidSignature) {
    throw new Error(
      `File content does not match extension '${extension}'. The file may be corrupted or disguised.`
    );
  }

  let extractedRawText = '';
  let pageCount: number | undefined;
  let extractionMethod: DocumentExtractionResult['extractionMethod'] = 'fallback';

  // 4. PDF Extraction
  if (extension === '.pdf') {
    try {
      const anyPdfLib: any = await import('pdf-parse');
      const ParserClass =
        anyPdfLib.PDFParse ||
        anyPdfLib.default?.PDFParse ||
        (typeof anyPdfLib.default === 'function' ? anyPdfLib.default : anyPdfLib);

      if (typeof ParserClass === 'function' && ParserClass.prototype && ParserClass.prototype.getText) {
        // Modern pdf-parse class API
        const parser = new ParserClass({ data: input.buffer });
        try {
          const res = await parser.getText();
          extractedRawText = (res && typeof res.text === 'string') ? res.text : (typeof res === 'string' ? res : '');
          pageCount = res?.total || (res?.pages ? res.pages.length : undefined);
        } finally {
          if (typeof parser.destroy === 'function') {
            await parser.destroy();
          }
        }
      } else if (typeof anyPdfLib === 'function') {
        // Classic function API: pdfParse(buffer)
        const pdfData = await anyPdfLib(input.buffer);
        extractedRawText = pdfData.text || '';
        pageCount = pdfData.numpages;
      } else if (typeof anyPdfLib.default === 'function') {
        const pdfData = await anyPdfLib.default(input.buffer);
        extractedRawText = pdfData.text || '';
        pageCount = pdfData.numpages;
      } else {
        throw new Error('PDF parser engine could not be initialized.');
      }
      extractionMethod = 'pdf-parse';
    } catch (pdfErr) {
      throw new Error(
        `Failed to parse PDF document: ${(pdfErr as Error).message || 'Malformed PDF structure'}.`
      );
    }
  }

  // 5. DOCX Extraction
  else if (extension === '.docx') {
    try {
      const mammothModule: any = await import('mammoth');
      const mammothLib = mammothModule.default || mammothModule;
      const docxResult = await mammothLib.extractRawText({ buffer: input.buffer });
      extractedRawText = docxResult.value || '';
      extractionMethod = 'mammoth';

      if (docxResult.messages && docxResult.messages.length > 0) {
        for (const msg of docxResult.messages) {
          if (msg.type === 'warning') {
            warnings.push(`DOCX parser note: ${msg.message}`);
          }
        }
      }
    } catch (docxErr) {
      throw new Error(
        `Failed to parse DOCX document: ${(docxErr as Error).message || 'Malformed DOCX archive'}.`
      );
    }
  }

  // 6. Legacy DOC Warning
  else if (extension === '.doc') {
    warnings.push(
      'Legacy binary .doc format detected. For best extraction fidelity, consider saving as .docx or .pdf.'
    );
    // Basic text extraction attempt for binary doc
    extractedRawText = input.buffer
      .toString('latin1')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s{2,}/g, ' ');
    extractionMethod = 'fallback';
  }

  // 7. Check for Empty or Scanned (Image-Only) Document
  let cleanedText = normalizeExtractedDocumentText(extractedRawText);
  let isScannedOrEmpty = cleanedText.replace(/\s/g, '').length < 25;
  let isOcrDerived = false;
  let ocrEngine: string | undefined = undefined;
  let ocrPageCount: number | undefined = undefined;

  // Optional real OCR processing when enabled via input flag or environment variable
  const ocrRequested = input.enableOcr ?? (process.env.ENABLE_OPTIONAL_OCR === 'true');
  if (isScannedOrEmpty && ocrRequested) {
    try {
      const ocrResult = await attemptOptionalOcrExtraction(input.buffer, extension);
      if (ocrResult && ocrResult.text && ocrResult.text.trim().length >= 25) {
        cleanedText = normalizeExtractedDocumentText(ocrResult.text);
        isScannedOrEmpty = false;
        isOcrDerived = true;
        ocrEngine = ocrResult.engine;
        ocrPageCount = ocrResult.pageCount || pageCount;
        extractionMethod = 'ocr';
        warnings.push(
          `Document text extracted using optional Optical Character Recognition (${ocrResult.engine}). Source text is identified as OCR-derived.`
        );
      } else {
        warnings.push(
          'Optional OCR engine executed but insufficient machine-readable text was detected in the scanned document.'
        );
      }
    } catch (ocrErr) {
      warnings.push(`Optional OCR attempt encountered an error: ${(ocrErr as Error).message}`);
    }
  }

  if (isScannedOrEmpty) {
    warnings.push(
      'This document appears to be scanned/image-based and no machine-readable text could be extracted. Please upload a machine-readable digital PDF or Word document.'
    );
  }

  // 8. Multi-Product Analysis
  const multiProductInfo = detectMultipleProducts(cleanedText);
  if (multiProductInfo.warning) {
    warnings.push(multiProductInfo.warning);
  }

  return {
    text: cleanedText,
    pageCount: ocrPageCount || pageCount,
    fileType: extension.replace('.', '') as 'pdf' | 'docx' | 'doc',
    fileName: safeName,
    fileSize,
    extractionMethod,
    warnings,
    isScannedOrEmpty,
    multipleProductsDetected: multiProductInfo.multipleDetected,
    detectedProducts: multiProductInfo.products,
    primaryProductAnalyzed: multiProductInfo.primaryProduct,
    isOcrDerived,
    ocrEngine,
    ocrPageCount,
  };
}

/**
 * Optional OCR Handler: Attempts extraction using Tesseract.js if available in the runtime,
 * or delegates to a configured test/service OCR handler. Returns null if OCR is not installed.
 */
export async function attemptOptionalOcrExtraction(
  buffer: Buffer,
  extension: string
): Promise<{ text: string; engine: string; pageCount?: number } | null> {
  // Support custom/test OCR handler registration
  const customOcr = (globalThis as any).__ISUTRA_OCR_HANDLER__;
  if (typeof customOcr === 'function') {
    return await customOcr(buffer, extension);
  }

  // Attempt dynamic import of tesseract.js if present in the runtime
  try {
    const tesseractMod = await import('tesseract.js' as any);
    const Tesseract = tesseractMod.default || tesseractMod;
    if (Tesseract && typeof Tesseract.recognize === 'function') {
      const { data } = await Tesseract.recognize(buffer, 'eng');
      return {
        text: data?.text || '',
        engine: 'tesseract.js',
      };
    }
  } catch {
    // Tesseract.js is not installed in this environment
  }

  return null;
}
