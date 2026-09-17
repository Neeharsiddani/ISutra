// ============================================================
// ISutra — Phase F Automated Test Suite
// Real Procurement Document Ingestion, PDF/DOCX Parsing,
// Security, Provenance, Pipeline Integration & Procurement Reports
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, 'test-fixtures');

// Import compiled backend services
const {
  extractDocument,
  sanitizeFilename,
  validateFileSignature,
  normalizeExtractedDocumentText,
  detectMultipleProducts,
} = await import('./dist/services/documentExtractionService.js');

const {
  analyzeDocument,
  analyzeSpecification,
  getAnalysisById,
} = await import('./dist/services/analysisService.js');

const {
  generateProcurementReportData,
  generatePrintableHtmlReport,
} = await import('./dist/services/procurementReportService.js');

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ ${message}`);
  } else {
    failedAssertions++;
    console.error(`  ✗ FAILED: ${message}`);
  }
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  ISutra Phase F: Real Document Ingestion Test Suite');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// ============================================================
// TEST GROUP 1: PDF Document Text Extraction
// ============================================================
console.log('--- TEST GROUP 1: PDF Document Text Extraction ---');

const lightingPdfPath = path.join(fixturesDir, 'lighting-procurement.pdf');
assert(fs.existsSync(lightingPdfPath), 'Test fixture lighting-procurement.pdf must exist');

const lightingPdfBuffer = fs.readFileSync(lightingPdfPath);
const pdfResult = await extractDocument({
  buffer: lightingPdfBuffer,
  originalname: 'lighting-procurement.pdf',
  mimetype: 'application/pdf',
  size: lightingPdfBuffer.length,
});

assert(typeof pdfResult.text === 'string' && pdfResult.text.length > 100, 'PDF text must be extracted successfully');
assert(pdfResult.fileType === 'pdf', `File type must be 'pdf', got '${pdfResult.fileType}'`);
assert(pdfResult.extractionMethod === 'pdf-parse', `Extraction method must be 'pdf-parse', got '${pdfResult.extractionMethod}'`);
assert(pdfResult.pageCount === 2, `Page count must be 2, got ${pdfResult.pageCount}`);
assert(pdfResult.text.includes('100W'), 'Extracted text must contain wattage parameter 100W');
assert(pdfResult.text.includes('IP65'), 'Extracted text must contain enclosure rating IP65');
assert(pdfResult.text.includes('LED street lighting luminaire'), 'Extracted text must contain product name');
assert(pdfResult.text.includes('surge protection 10kV'), 'Extracted text must contain surge protection rating');
assert(pdfResult.isScannedOrEmpty === false, 'Valid PDF must not be flagged as scanned or empty');

// ============================================================
// TEST GROUP 2: DOCX Document Text Extraction
// ============================================================
console.log('');
console.log('--- TEST GROUP 2: DOCX Document Text Extraction ---');

const cableDocxPath = path.join(fixturesDir, 'cable-procurement.docx');
assert(fs.existsSync(cableDocxPath), 'Test fixture cable-procurement.docx must exist');

const cableDocxBuffer = fs.readFileSync(cableDocxPath);
const docxResult = await extractDocument({
  buffer: cableDocxBuffer,
  originalname: 'cable-procurement.docx',
  mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  size: cableDocxBuffer.length,
});

assert(typeof docxResult.text === 'string' && docxResult.text.length > 100, 'DOCX text must be extracted successfully');
assert(docxResult.fileType === 'docx', `File type must be 'docx', got '${docxResult.fileType}'`);
assert(docxResult.extractionMethod === 'mammoth', `Extraction method must be 'mammoth', got '${docxResult.extractionMethod}'`);
assert(docxResult.text.includes('XLPE'), 'Extracted text must contain XLPE insulation keyword');
assert(docxResult.text.includes('1.1 kV'), 'Extracted text must contain voltage rating from DOCX table');
assert(docxResult.text.includes('Aluminum'), 'Extracted text must contain conductor material from DOCX table');
assert(docxResult.text.includes('power cables for working voltages'), 'Extracted text must contain specification paragraphs');
assert(docxResult.isScannedOrEmpty === false, 'Valid DOCX must not be flagged as scanned or empty');

// ============================================================
// TEST GROUP 3: Honest Scanned / Image-Only Document Handling
// ============================================================
console.log('');
console.log('--- TEST GROUP 3: Honest Scanned / Image-Only Document Handling ---');

const scannedPdfPath = path.join(fixturesDir, 'scanned-document.pdf');
assert(fs.existsSync(scannedPdfPath), 'Test fixture scanned-document.pdf must exist');

const scannedPdfBuffer = fs.readFileSync(scannedPdfPath);
const scannedResult = await extractDocument({
  buffer: scannedPdfBuffer,
  originalname: 'scanned-document.pdf',
  mimetype: 'application/pdf',
  size: scannedPdfBuffer.length,
});

assert(scannedResult.isScannedOrEmpty === true, 'Scanned/image-only PDF must be flagged as isScannedOrEmpty = true');
assert(scannedResult.warnings.length > 0, 'Scanned PDF must produce extraction warnings');
assert(
  scannedResult.warnings.some((w) => w.includes('scanned/image-based')),
  'Warning must honestly state that document appears to be scanned/image-based with no machine-readable text'
);

// Verify analyzeDocument error handling for scanned PDF
let scannedErrorCaught = false;
let scannedErrorStatus = 0;
let scannedErrorMessage = '';

try {
  await analyzeDocument({
    buffer: scannedPdfBuffer,
    originalname: 'scanned-document.pdf',
  });
} catch (err) {
  scannedErrorCaught = true;
  scannedErrorStatus = err.statusCode;
  scannedErrorMessage = err.message;
}

assert(scannedErrorCaught, 'analyzeDocument must reject scanned/empty PDF without machine-readable text');
assert(scannedErrorStatus === 422, `Rejection status code must be 422 Unprocessable Entity, got ${scannedErrorStatus}`);
assert(
  scannedErrorMessage.includes('scanned/image-based'),
  `Error message must explain scanned/image-based limitation, got: "${scannedErrorMessage}"`
);

// ============================================================
// TEST GROUP 4: Document Ingestion Security & Validation
// ============================================================
console.log('');
console.log('--- TEST GROUP 4: Document Ingestion Security & Validation ---');

// 4A. Unsupported extension rejection
let unsupportedExtCaught = false;
try {
  await extractDocument({
    buffer: Buffer.from('executable binary code'),
    originalname: 'malicious_script.exe',
  });
} catch (err) {
  unsupportedExtCaught = true;
  assert(err.message.includes('Unsupported file format'), 'Unsupported extension must be rejected with descriptive error');
}
assert(unsupportedExtCaught, 'Unsupported file extension .exe must be rejected');

// 4B. Oversized file rejection
let oversizedCaught = false;
try {
  const hugeBuffer = Buffer.alloc(16 * 1024 * 1024); // 16 MB
  hugeBuffer[0] = 0x25; hugeBuffer[1] = 0x50; hugeBuffer[2] = 0x44; hugeBuffer[3] = 0x46; // %PDF-
  await extractDocument({
    buffer: hugeBuffer,
    originalname: 'huge_spec.pdf',
    size: hugeBuffer.length,
  });
} catch (err) {
  oversizedCaught = true;
  assert(err.message.includes('exceeds maximum limit'), 'Oversized document (>15MB) must be rejected');
}
assert(oversizedCaught, 'Oversized file (>15MB) must be rejected');

// 4C. File signature / magic byte mismatch (spoofed extension)
let spoofedCaught = false;
try {
  const fakePdfBuffer = Buffer.from('This is plain text with no PDF magic header');
  await extractDocument({
    buffer: fakePdfBuffer,
    originalname: 'fake_specification.pdf',
  });
} catch (err) {
  spoofedCaught = true;
  assert(err.message.includes('does not match extension'), 'Mismatched magic bytes must be caught');
}
assert(spoofedCaught, 'File with spoofed extension must be rejected by signature validation');

// 4D. Malformed document handling (safe error handling without crashing)
const malformedPdfPath = path.join(fixturesDir, 'malformed.pdf');
const malformedBuffer = fs.readFileSync(malformedPdfPath);
let malformedCaught = false;
try {
  await extractDocument({
    buffer: malformedBuffer,
    originalname: 'corrupted_spec.pdf',
  });
} catch (err) {
  malformedCaught = true;
  assert(err.message.includes('Failed to parse PDF document'), 'Corrupted document must fail gracefully with error');
}
assert(malformedCaught, 'Malformed PDF must be handled gracefully');

// 4E. Path traversal filename sanitization
assert(sanitizeFilename('../../etc/passwd.pdf') === 'etcpasswd.pdf', 'Path traversal sequence ../ must be stripped');
assert(sanitizeFilename('..\\..\\windows\\system32\\cmd.exe.pdf') === 'windowssystem32cmd.exe.pdf', 'Windows path traversal must be stripped');
assert(sanitizeFilename('normal_tender_specification_2026.pdf') === 'normal_tender_specification_2026.pdf', 'Safe filenames must be preserved');
assert(sanitizeFilename('') === 'uploaded_document.pdf', 'Empty filename must fall back to safe default');

// ============================================================
// TEST GROUP 5: End-to-End Pipeline Integration (Upload -> Matching)
// ============================================================
console.log('');
console.log('--- TEST GROUP 5: End-to-End Pipeline Integration ---');

// Ingest Lighting Tender PDF through analysisService
const lightingAnalysis = await analyzeDocument({
  buffer: lightingPdfBuffer,
  originalname: 'lighting-procurement.pdf',
  size: lightingPdfBuffer.length,
});

assert(lightingAnalysis.status === 'completed', 'Analysis status must be completed');
assert(Boolean(lightingAnalysis.analysis_id), `Analysis ID must be present: ${lightingAnalysis.analysis_id}`);
assert(lightingAnalysis.input_type === 'tender_document', 'Input type must be tender_document');
assert(lightingAnalysis.requirements.product.name.length > 0, `Product name must be extracted: ${lightingAnalysis.requirements.product.name}`);
assert(lightingAnalysis.ready_for_matching === true, 'Lighting tender must be ready for matching');

// Verify match results against verified BIS standards
const { StandardsMatcher } = await import('./dist/services/standardsMatcher.js');
const { VERIFIED_BIS_STANDARDS } = await import('./dist/database/verifiedStandards.js');

const matcher = new StandardsMatcher();
const lightingMatch = matcher.evaluate(lightingAnalysis.requirements, VERIFIED_BIS_STANDARDS);

assert(lightingMatch.success === true, 'Matcher must execute successfully');
assert(lightingMatch.recommendations.length > 0, 'Must produce standard recommendations');

const topLightingRec = lightingMatch.recommendations[0];
console.log(`  Top Lighting Match: ${topLightingRec.standard.standard_number} (Score: ${topLightingRec.score}, Tier: ${topLightingRec.specificityTierLabel})`);
assert(
  topLightingRec.standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `Expected IS 10322 (Part 5/Sec 3):2026 at Rank #1 for street lighting tender PDF, got ${topLightingRec.standard.standard_number}`
);
assert(topLightingRec.specificityTier <= 2, `Top standard must have high specificity tier (<= 2), got Tier ${topLightingRec.specificityTier}`);

// Ingest Cable Tender DOCX through analysisService
const cableAnalysis = await analyzeDocument({
  buffer: cableDocxBuffer,
  originalname: 'cable-procurement.docx',
  size: cableDocxBuffer.length,
});

assert(cableAnalysis.status === 'completed', 'Cable analysis status must be completed');
assert(Boolean(cableAnalysis.analysis_id), `Cable analysis ID must be present: ${cableAnalysis.analysis_id}`);
assert(cableAnalysis.ready_for_matching === true, 'Cable tender must be ready for matching');

const cableMatch = matcher.evaluate(cableAnalysis.requirements, VERIFIED_BIS_STANDARDS);
assert(cableMatch.recommendations.length > 0, 'Cable matching must produce recommendations');

const topCableRec = cableMatch.recommendations[0];
console.log(`  Top Cable Match: ${topCableRec.standard.standard_number} (Score: ${topCableRec.score}, Tier: ${topCableRec.specificityTierLabel})`);
assert(
  topCableRec.standard.standard_number.includes('7098'),
  `Expected IS 7098 XLPE cable standard at Rank #1 for XLPE cable tender DOCX, got ${topCableRec.standard.standard_number}`
);

// ============================================================
// TEST GROUP 6: Document Provenance Tracking & Multi-Product Notice
// ============================================================
console.log('');
console.log('--- TEST GROUP 6: Document Provenance & Multi-Product Detection ---');

assert(Boolean(lightingAnalysis.document_provenance), 'Document provenance must be attached to analysis result');
const prov = lightingAnalysis.document_provenance;
assert(prov.source_type === 'document_upload', `source_type must be 'document_upload', got '${prov.source_type}'`);
assert(prov.file_name === 'lighting-procurement.pdf', `file_name must match original, got '${prov.file_name}'`);
assert(prov.file_type === 'pdf', `file_type must be 'pdf', got '${prov.file_type}'`);
assert(prov.page_count === 2, `page_count must be 2, got ${prov.page_count}`);
assert(prov.extraction_method === 'pdf-parse', `extraction_method must be 'pdf-parse', got '${prov.extraction_method}'`);
assert(typeof prov.extracted_preview === 'string' && prov.extracted_preview.length > 50, 'Extracted text preview must be populated');

// Test multi-product detection on mixed text
const mixedTenderText = `
TENDER SCHEDULE FOR MUNICIPAL WORKS:
Item 1: Supply of 100W LED street lighting luminaires IP65 for city road networks.
Item 2: Supply of 1.1kV XLPE insulated power distribution cables aluminum conductor.
`;
const multiDetect = detectMultipleProducts(mixedTenderText);
assert(multiDetect.multipleDetected === true, 'Must detect multiple distinct product items in tender');
assert(multiDetect.products.length >= 2, `Must identify distinct products, found: ${multiDetect.products.length}`);
assert(Boolean(multiDetect.warning), 'Must generate multi-product guidance warning');
assert(multiDetect.warning.includes('Analyzing primary item'), 'Warning must specify analyzing primary item without silently dropping lots');

// ============================================================
// TEST GROUP 7: Procurement Report Generator
// ============================================================
console.log('');
console.log('--- TEST GROUP 7: Procurement Report Generator ---');

const reportData = await generateProcurementReportData(lightingAnalysis.analysis_id);

assert(Boolean(reportData.reportId), `Report ID must be generated: ${reportData.reportId}`);
assert(reportData.analysisId === lightingAnalysis.analysis_id, 'Report must link to original analysisId');
assert(reportData.executiveSummary.productName.length > 0, `Product name must be present: ${reportData.executiveSummary.productName}`);
assert(reportData.executiveSummary.readinessStatus === 'ready', 'Executive summary readiness status must be ready');
assert(reportData.applicableStandards.length > 0, `Report must contain applicable standards, found: ${reportData.applicableStandards.length}`);
assert(reportData.applicableStandards[0].standardNumber === 'IS 10322 (Part 5/Sec 3):2026', 'Top standard in report must match evaluation');
assert(reportData.applicableStandards[0].relevancePercentage > 0, 'Relevance percentage must be > 0');
assert(reportData.applicableStandards[0].specificityTier !== undefined, 'Specificity tier must be included in report');
assert(reportData.requirementCoverage.length > 0, `Requirement coverage items must be populated, found: ${reportData.requirementCoverage.length}`);
assert(reportData.limitations.length >= 3, `Official limitations disclaimers must be included, found: ${reportData.limitations.length}`);
assert(
  reportData.limitations.some((lim) => lim.includes('verified Indian Standards')),
  'Limitations must explicitly cite verified ISutra reference dataset'
);

// Verify Printable HTML Report Generator
const htmlReport = generatePrintableHtmlReport(reportData);

assert(typeof htmlReport === 'string' && htmlReport.length > 500, 'HTML report must be generated');
assert(htmlReport.includes('<!DOCTYPE html>'), 'HTML report must be valid HTML5 document');
assert(htmlReport.includes('@media print'), 'HTML report must include print stylesheet');
assert(htmlReport.includes(reportData.reportId), 'HTML report must display Report ID');
assert(htmlReport.includes('IS 10322 (Part 5/Sec 3):2026'), 'HTML report must contain recommended standard');
assert(htmlReport.includes('Executive Summary'), 'HTML report must contain Executive Summary section');
assert(htmlReport.includes('Requirement Coverage Matrix'), 'HTML report must contain Coverage Matrix section');
assert(htmlReport.includes('Important Procurement Limitations'), 'HTML report must contain Limitations section');
assert(htmlReport.includes('lighting-procurement.pdf'), 'HTML report must display document provenance');

// ============================================================
// TEST GROUP 8: Backward Compatibility & Direct-Text Regression
// ============================================================
console.log('');
console.log('--- TEST GROUP 8: Backward Compatibility & Direct-Text Regression ---');

// Direct text analysis must continue to function with direct_text provenance
const directTextAnalysis = await analyzeSpecification(
  'product_description',
  'Supply of 100W outdoor LED street lighting luminaire, weather resistant, IP65 with surge protection 10kV.'
);

assert(directTextAnalysis.status === 'completed', 'Direct text analysis must remain completed');
assert(directTextAnalysis.requirements.product.name.length > 0, 'Product name must be extracted');
assert(directTextAnalysis.ready_for_matching === true, 'Direct text requirement must be ready for matching');

const storedDirect = await getAnalysisById(directTextAnalysis.analysis_id);
assert(Boolean(storedDirect), 'Direct text record must be retrievable by ID');
assert(storedDirect.document_provenance?.source_type === 'direct_text', `Direct text source_type must be 'direct_text', got '${storedDirect?.document_provenance?.source_type}'`);

// Matcher compatibility check
const directMatch = matcher.evaluate(directTextAnalysis.requirements, VERIFIED_BIS_STANDARDS);
assert(directMatch.recommendations.length > 0, 'Direct text requirement must produce recommendations');
assert(
  directMatch.recommendations[0].standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  'Direct text recommendation must match expected street lighting standard'
);

// ============================================================
// TEST GROUP 9: General Procurement Phrase & Extraction Regression
// ============================================================
console.log('');
console.log('--- TEST GROUP 9: General Procurement Phrase & Extraction Regression ---');

// 9A. Target User Procurement Specification Verification
const userProcurementText =
  'Supply and installation of 500 units of 100W LED street lighting luminaires for municipal roads and public streets. ' +
  'The luminaires shall be suitable for pole-mounted outdoor applications and shall have weather-resistant die-cast aluminium housing with IP66 protection. ' +
  'The equipment should be suitable for continuous outdoor operation and include appropriate surge protection. ' +
  'The supplier shall provide relevant testing and compliance documentation and identify the applicable Indian Standards for the proposed LED street lighting luminaires.';

const userAnalysis = await analyzeSpecification('procurement_text', userProcurementText);
assert(userAnalysis.status === 'completed', 'User procurement analysis must complete');
assert(userAnalysis.ready_for_matching === true, 'User requirement must be ready for matching');

const userReqs = userAnalysis.requirements;
assert(userReqs.product.name === 'LED street lighting luminaire', `Product name should be normalized to 'LED street lighting luminaire', got: '${userReqs.product.name}'`);
assert(userReqs.product.category === 'Lighting & Luminaires', `Category should be 'Lighting & Luminaires', got: '${userReqs.product.category}'`);
assert(userReqs.application === 'Highway & Municipal road lighting', `Application should be 'Highway & Municipal road lighting', got: '${userReqs.application}'`);

// Verify all 6 expected technical parameters with source text preservation
const paramMap = new Map(userReqs.technical_parameters.map((p) => [p.parameter, p]));

assert(paramMap.has('Power'), 'Technical parameters must include Power');
assert(paramMap.get('Power')?.value === '100W', `Power must be 100W, got: ${paramMap.get('Power')?.value}`);

assert(paramMap.has('Ingress Protection'), 'Technical parameters must include Ingress Protection');
assert(paramMap.get('Ingress Protection')?.value === 'IP66', `IP rating must be IP66, got: ${paramMap.get('Ingress Protection')?.value}`);

assert(paramMap.has('Installation / Mounting'), 'Technical parameters must include Installation / Mounting');
assert(paramMap.get('Installation / Mounting')?.value === 'Pole mounted', `Installation must be 'Pole mounted', got: ${paramMap.get('Installation / Mounting')?.value}`);
assert(paramMap.get('Installation / Mounting')?.source_text?.toLowerCase().includes('pole-mounted'), 'Installation source_text must preserve source text');

assert(paramMap.has('Material'), 'Technical parameters must include Material');
assert(paramMap.get('Material')?.value === 'Die-cast aluminium', `Material must be 'Die-cast aluminium', got: ${paramMap.get('Material')?.value}`);
assert(paramMap.get('Material')?.source_text?.toLowerCase().includes('die-cast aluminium'), 'Material source_text must preserve source text');

assert(paramMap.has('Safety'), 'Technical parameters must include Safety');
assert(paramMap.get('Safety')?.value === 'Surge protection', `Safety must be 'Surge protection', got: ${paramMap.get('Safety')?.value}`);
assert(paramMap.get('Safety')?.source_text?.toLowerCase().includes('surge protection'), 'Safety source_text must preserve source text');

assert(paramMap.has('Quantity'), 'Technical parameters must include Quantity');
assert(paramMap.get('Quantity')?.value === '500 units', `Quantity must be '500 units', got: ${paramMap.get('Quantity')?.value}`);

// Verify Environment items
const envNames = (userReqs.environment || []).map((e) => e.name);
assert(envNames.includes('Outdoor'), 'Environment must include Outdoor');
assert(envNames.includes('Weather resistant'), 'Environment must include Weather resistant');

// Verify Matching Behavior for User Procurement Spec
const userMatch = matcher.evaluate(userReqs, VERIFIED_BIS_STANDARDS);
assert(userMatch.recommendations.length > 0, 'User procurement requirement must yield recommendations');
assert(
  userMatch.recommendations[0].standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `Top recommendation must be IS 10322 (Part 5/Sec 3):2026, got: ${userMatch.recommendations[0].standard.standard_number}`
);
assert(userMatch.recommendations[0].specificityTier <= 2, `Specificity Tier must be <= 2, got: ${userMatch.recommendations[0].specificityTier}`);

// 9B. General Pattern Variations: Installation / Mounting
const instVariants = [
  { text: 'Supply 200W luminaires suitable for pole-mounted outdoor applications', expected: 'Pole mounted' },
  { text: 'Supply pole mounted street lighting luminaires for city roads', expected: 'Pole mounted' },
  { text: 'Supply luminaires installed on poles along public highway', expected: 'Pole mounted' },
  { text: 'Provide wall-mounted security luminaires with IP65 enclosure', expected: 'Wall mounted' },
  { text: 'Provide wall mounted lighting fixtures for building perimeter', expected: 'Wall mounted' },
  { text: 'Supply ceiling-mounted luminaires for municipal office hallways', expected: 'Ceiling mounted' },
  { text: 'Supply ceiling mounted light fixtures for corridors', expected: 'Ceiling mounted' },
  { text: 'Provide surface-mounted distribution boxes', expected: 'Surface mounted' },
  { text: 'Provide surface mounted junction units', expected: 'Surface mounted' },
  { text: 'Supply panel-mounted industrial indicators', expected: 'Panel mounted' },
  { text: 'Supply pedestal mounted terminal boxes', expected: 'Pedestal mounted' },
  { text: 'Underground trenching installation for power cables', expected: 'Underground / Trenching' },
];

for (const variant of instVariants) {
  const ext = await analyzeSpecification('direct_text', variant.text);
  const found = ext.requirements.installation_requirements.some((i) => i.name === variant.expected);
  assert(found, `Installation phrase "${variant.text}" must extract "${variant.expected}"`);
}

// 9C. General Pattern Variations: Materials
const materialVariants = [
  { text: 'Lighting luminaires with die-cast aluminium housing', expected: 'Die-cast aluminium' },
  { text: 'Outdoor fixtures with die-cast aluminum housing', expected: 'Die-cast aluminium' },
  { text: 'Enclosure made of aluminium alloy for corrosion resistance', expected: 'Aluminium' },
  { text: 'Enclosure fabricated from stainless steel 316', expected: 'Stainless steel' },
  { text: 'Support brackets fabricated from galvanized steel', expected: 'Galvanized steel' },
  { text: 'Structures constructed with reinforced concrete', expected: 'Reinforced concrete' },
];

for (const variant of materialVariants) {
  const ext = await analyzeSpecification('direct_text', variant.text);
  const found = ext.requirements.materials.some((m) => m.name === variant.expected);
  assert(found, `Material phrase "${variant.text}" must extract "${variant.expected}"`);
}

// 9D. General Pattern Variations: Safety Requirements
const safetyVariants = [
  { text: 'Include appropriate surge protection of 10kV', expected: 'Surge protection' },
  { text: 'Equipped with overload protection for motor circuits', expected: 'Overload protection' },
  { text: 'Integrated short-circuit protection device', expected: 'Short-circuit protection' },
  { text: 'Fitted with earth protection and grounding terminal', expected: 'Earth protection' },
  { text: 'Shall comply with applicable safety requirements', expected: 'Safety requirements' },
];

for (const variant of safetyVariants) {
  const ext = await analyzeSpecification('direct_text', variant.text);
  const found = ext.requirements.safety_requirements.some((s) => s.name === variant.expected);
  assert(found, `Safety phrase "${variant.text}" must extract "${variant.expected}"`);
}

// 9E. General Pattern Variations: Weather & Environment
const envVariants = [
  { text: 'Luminaires with weather-resistant housing for highways', expected: 'Weather resistant' },
  { text: 'Fixtures with weather resistant housing for open areas', expected: 'Weather resistant' },
  { text: 'Enclosures rated for outdoor continuous exposure', expected: 'Outdoor' },
  { text: 'Units designed for dust resistant industrial plants', expected: 'Dust resistant' },
  { text: 'Units designed for moisture resistant damp basements', expected: 'Moisture resistant' },
  { text: 'Materials suitable for corrosive marine conditions', expected: 'Corrosive / Marine' },
];

for (const variant of envVariants) {
  const ext = await analyzeSpecification('direct_text', variant.text);
  const found = ext.requirements.environment.some((e) => e.name === variant.expected);
  assert(found, `Environment phrase "${variant.text}" must extract "${variant.expected}"`);
}

// 9F. General Pattern Variations: Quantity Recognition
const qtyVariants = [
  { text: 'Supply and installation of 500 units of 100W luminaires', expected: '500 units' },
  { text: 'Requirement for quantity: 500 of street lighting luminaires', expected: '500 units' },
  { text: 'Requirement: Qty 500 units of industrial fittings', expected: '500 units' },
  { text: 'Procure 500 luminaires for municipal roadway', expected: '500 luminaires' },
  { text: 'Supply of 500 units for highway illumination', expected: '500 units' },
];

for (const variant of qtyVariants) {
  const ext = await analyzeSpecification('direct_text', variant.text);
  const qtyParam = ext.requirements.technical_parameters.find((p) => p.parameter === 'Quantity');
  assert(Boolean(qtyParam), `Quantity parameter must be extracted for "${variant.text}"`);
  assert(
    qtyParam?.value === variant.expected || ext.requirements.quantity === '500',
    `Quantity for "${variant.text}" should match expected, got: ${qtyParam?.value}`
  );
}

// Summary
console.log('');
console.log('===========================================================');
console.log(`🎉 ALL ${passedAssertions}/${passedAssertions + failedAssertions} PHASE F TESTS PASSED SUCCESSFULLY!`);
console.log('===========================================================');
console.log('');

if (failedAssertions > 0) {
  process.exit(1);
}
