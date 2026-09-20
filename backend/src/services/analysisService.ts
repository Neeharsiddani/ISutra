// ============================================================
// ISutra — Analysis Service
// Phase 2: AI Requirement Extraction & Analysis Persistence
// ============================================================

import { getSupabaseClient, isSupabaseConfigured } from '../database/supabase';
import { runRequirementExtractionPipeline } from './ai/requirementExtractor';
import { validateAndSanitizeRequirements } from './ai/validation';
import type { StructuredRequirements, ClarificationQuestion } from './ai/types';
import type { LanguageMetadata } from './ai/multilingualService';
import type { InputType } from '../types';
import { extractDocument, DocumentUploadInput, DocumentExtractionResult } from './documentExtractionService';

export interface DocumentProvenance {
  source_type: 'direct_text' | 'document_upload';
  file_name?: string;
  file_type?: 'pdf' | 'docx' | 'doc';
  file_size?: number;
  page_count?: number;
  extraction_method?: string;
  extraction_warnings?: string[];
  multiple_products_detected?: boolean;
  detected_products?: string[];
  primary_product_analyzed?: string;
  extracted_preview?: string;
}

export interface StoredAnalysis {
  id: string;
  analysis_id: string;
  input_type: InputType;
  input_text: string;
  file_name: string | null;
  status: 'completed' | 'processing' | 'error';
  created_at: string;
  requirements: StructuredRequirements;
  missing_information: string[];
  blocking_missing_information: string[];
  clarification_questions: ClarificationQuestion[];
  ready_for_matching: boolean;
  confirmed: boolean;
  provider_used: string;
  demo: boolean;
  warning?: string;
  document_provenance?: DocumentProvenance;
  input_language?: string;
  language_metadata?: LanguageMetadata;
}

// In-memory analysis store for instant local development and fallback when Supabase is not configured
const inMemoryStore: Map<string, StoredAnalysis> = new Map();

export async function analyzeSpecification(
  inputType: InputType,
  inputText: string,
  inputLanguage?: string
) {
  const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  // Run AI Requirement Extraction Pipeline with language detection
  const extraction = await runRequirementExtractionPipeline(inputText, inputType, inputLanguage);
  const readyForMatching = Boolean(extraction.requirements.ready_for_matching);
  const blockingMissingInfo = extraction.requirements.blocking_missing_information || [];

  const storedRecord: StoredAnalysis = {
    id: analysisId,
    analysis_id: analysisId,
    input_type: inputType,
    input_text: inputText,
    file_name: null,
    status: 'completed',
    created_at: createdAt,
    requirements: extraction.requirements,
    missing_information: extraction.requirements.missing_information,
    blocking_missing_information: blockingMissingInfo,
    clarification_questions: extraction.requirements.clarification_questions,
    ready_for_matching: readyForMatching,
    confirmed: false,
    provider_used: extraction.provider_used,
    demo: extraction.demo,
    warning: extraction.warning,
    document_provenance: {
      source_type: 'direct_text',
    },
    input_language: extraction.input_language,
    language_metadata: extraction.language_metadata,
  };

  // Always save in inMemoryStore
  inMemoryStore.set(analysisId, storedRecord);

  // If Supabase is configured, persist to database
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('analysis_requests')
          .insert({
            id: analysisId,
            input_type: inputType,
            input_text: inputText,
            status: 'completed',
            created_at: createdAt,
          });

        const reqRows: any[] = [];
        for (const param of extraction.requirements.technical_parameters) {
          reqRows.push({
            analysis_request_id: analysisId,
            requirement_type: 'technical_parameter',
            requirement_name: param.parameter,
            requirement_value: param.value,
            unit: param.unit || null,
            confidence: param.confidence || 'medium',
            source_text: param.source_text || null,
          });
        }
        for (const mat of extraction.requirements.materials) {
          reqRows.push({
            analysis_request_id: analysisId,
            requirement_type: 'material',
            requirement_name: 'Material',
            requirement_value: mat.name,
            confidence: mat.confidence || 'medium',
            source_text: mat.source_text || null,
          });
        }
        for (const env of extraction.requirements.environment) {
          reqRows.push({
            analysis_request_id: analysisId,
            requirement_type: 'environment',
            requirement_name: 'Environmental Condition',
            requirement_value: env.name,
            confidence: env.confidence || 'medium',
            source_text: env.source_text || null,
          });
        }
        for (const inst of extraction.requirements.installation_requirements) {
          reqRows.push({
            analysis_request_id: analysisId,
            requirement_type: 'installation',
            requirement_name: 'Installation Requirement',
            requirement_value: inst.name,
            confidence: inst.confidence || 'medium',
            source_text: inst.source_text || null,
          });
        }

        if (reqRows.length > 0) {
          await supabase.from('analysis_requirements').insert(reqRows);
        }
      }
    } catch (dbErr) {
      console.warn('[ISutra DB] Supabase operation failed:', (dbErr as Error).message);
    }
  }

  return {
    analysis_id: analysisId,
    status: 'completed' as const,
    requirements: extraction.requirements,
    missing_information: extraction.requirements.missing_information,
    blocking_missing_information: blockingMissingInfo,
    clarification_questions: extraction.requirements.clarification_questions,
    ready_for_matching: readyForMatching,
    created_at: createdAt,
    provider_used: extraction.provider_used,
    demo: extraction.demo,
    warning: extraction.warning,
    input_language: extraction.input_language,
    language_metadata: extraction.language_metadata,
  };
}

export async function getAnalysisById(id: string): Promise<StoredAnalysis | null> {
  if (inMemoryStore.has(id)) {
    return inMemoryStore.get(id)!;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('analysis_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (data && !error) {
          const extraction = await runRequirementExtractionPipeline(data.input_text || '', data.input_type || 'product_description');
          const readyForMatching = Boolean(extraction.requirements.ready_for_matching);
          const blockingMissingInfo = extraction.requirements.blocking_missing_information || [];
          return {
            id: data.id,
            analysis_id: data.id,
            input_type: data.input_type,
            input_text: data.input_text,
            file_name: data.file_name,
            status: data.status,
            created_at: data.created_at,
            requirements: extraction.requirements,
            missing_information: extraction.requirements.missing_information,
            blocking_missing_information: blockingMissingInfo,
            clarification_questions: extraction.requirements.clarification_questions,
            ready_for_matching: readyForMatching,
            confirmed: false,
            provider_used: extraction.provider_used,
            demo: extraction.demo,
            warning: extraction.warning,
          };
        }
      }
    } catch (err) {
      console.warn('[ISutra DB] Error fetching analysis by id:', err);
    }
  }

  return null;
}

export async function updateAnalysisRequirements(
  id: string,
  updatedRequirements: Partial<StructuredRequirements>,
  confirmed: boolean = false
): Promise<StoredAnalysis | null> {
  const existing = await getAnalysisById(id);
  if (!existing) {
    return null;
  }

  const merged: StructuredRequirements = {
    ...existing.requirements,
    ...updatedRequirements,
  };

  // Re-validate and sanitize merged requirements to recalculate readiness
  const validated = validateAndSanitizeRequirements(merged, existing.input_text);
  const readyForMatching = Boolean(validated.ready_for_matching);
  const blockingMissing = validated.blocking_missing_information || [];

  const updatedRecord: StoredAnalysis = {
    ...existing,
    requirements: {
      ...validated,
      confirmed,
    },
    confirmed,
    ready_for_matching: readyForMatching,
    blocking_missing_information: blockingMissing,
    missing_information: validated.missing_information,
    clarification_questions: validated.clarification_questions,
  };

  inMemoryStore.set(id, updatedRecord);
  return updatedRecord;
}

export async function getAnalysisHistory(): Promise<Array<{
  id: string;
  analysis_id: string;
  input_type: InputType;
  product_name: string;
  short_description: string;
  parameters_count: number;
  status: string;
  confirmed: boolean;
  created_at: string;
}>> {
  const historyList = Array.from(inMemoryStore.values()).map((item) => ({
    id: item.id,
    analysis_id: item.analysis_id,
    input_type: item.input_type,
    product_name: item.requirements?.product?.name || 'Unspecified Product',
    short_description: item.input_text.length > 80 ? item.input_text.substring(0, 80) + '...' : item.input_text,
    parameters_count: item.requirements?.technical_parameters?.length || 0,
    status: item.status,
    confirmed: item.confirmed || false,
    created_at: item.created_at,
  }));

  return historyList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function analyzeDocument(
  fileInput?: DocumentUploadInput | string,
  inputLanguage?: string
) {
  // Check if real document upload buffer was provided
  if (fileInput && typeof fileInput === 'object' && 'buffer' in fileInput) {
    const extracted = await extractDocument(fileInput);

    if (extracted.isScannedOrEmpty) {
      const scannedMsg =
        'This document appears to be scanned/image-based and no machine-readable text could be extracted.';
      const err = new Error(scannedMsg);
      (err as any).statusCode = 422;
      (err as any).isScannedOrEmpty = true;
      throw err;
    }

    const analysisId = `doc-analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    // Run existing AI Requirement Extraction Pipeline on the real extracted document text
    const extraction = await runRequirementExtractionPipeline(extracted.text, 'tender_document', inputLanguage);
    const readyForMatching = Boolean(extraction.requirements.ready_for_matching);
    const blockingMissingInfo = extraction.requirements.blocking_missing_information || [];

    const provenance: DocumentProvenance = {
      source_type: 'document_upload',
      file_name: extracted.fileName,
      file_type: extracted.fileType,
      file_size: extracted.fileSize,
      page_count: extracted.pageCount,
      extraction_method: extracted.extractionMethod,
      extraction_warnings: extracted.warnings,
      multiple_products_detected: extracted.multipleProductsDetected,
      detected_products: extracted.detectedProducts,
      primary_product_analyzed: extracted.primaryProductAnalyzed,
      extracted_preview: extracted.text.length > 500 ? extracted.text.slice(0, 500) + '...' : extracted.text,
    };

    const record: StoredAnalysis = {
      id: analysisId,
      analysis_id: analysisId,
      input_type: 'tender_document',
      input_text: extracted.text,
      file_name: extracted.fileName,
      status: 'completed',
      created_at: createdAt,
      requirements: extraction.requirements,
      missing_information: extraction.requirements.missing_information,
      blocking_missing_information: blockingMissingInfo,
      clarification_questions: extraction.requirements.clarification_questions,
      ready_for_matching: readyForMatching,
      confirmed: false,
      provider_used: extraction.provider_used,
      demo: extraction.demo,
      warning: extracted.warnings.length > 0 ? extracted.warnings.join(' | ') : extraction.warning,
      document_provenance: provenance,
      input_language: extraction.input_language,
      language_metadata: extraction.language_metadata,
    };

    inMemoryStore.set(analysisId, record);

    return {
      analysis_id: analysisId,
      status: 'completed' as const,
      file_name: extracted.fileName,
      input_type: 'tender_document',
      input_text: extracted.text,
      requirements: extraction.requirements,
      missing_information: extraction.requirements.missing_information,
      blocking_missing_information: blockingMissingInfo,
      clarification_questions: extraction.requirements.clarification_questions,
      ready_for_matching: readyForMatching,
      created_at: createdAt,
      provider_used: extraction.provider_used,
      demo: extraction.demo,
      warning: extracted.warnings.length > 0 ? extracted.warnings.join(' | ') : extraction.warning,
      document_provenance: provenance,
      input_language: extraction.input_language,
      language_metadata: extraction.language_metadata,
    };
  }

  // Fallback demo document extract when no file buffer is supplied
  const demoFileName = typeof fileInput === 'string' && fileInput.trim() ? fileInput : 'Sample_Municipal_LED_Streetlight_Tender_Extract.pdf';
  const sampleExtractedText = `Demonstration Tender Extract (${demoFileName}):\nRequirement for Municipal LED Street Lighting Luminaire 100W, outdoor weather-resistant housing, pole mounted with surge protection 10kV, CCT 4000K, luminous efficacy >= 120 lm/W.`;

  const extraction = await runRequirementExtractionPipeline(sampleExtractedText, 'tender_document', inputLanguage);
  const analysisId = `doc-analysis-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const readyForMatching = Boolean(extraction.requirements.ready_for_matching);
  const blockingMissingInfo = extraction.requirements.blocking_missing_information || [];

  const demoProvenance: DocumentProvenance = {
    source_type: 'document_upload',
    file_name: demoFileName,
    file_type: 'pdf',
    file_size: 45200,
    page_count: 1,
    extraction_method: 'pdf-parse',
    extraction_warnings: [],
    multiple_products_detected: false,
    detected_products: ['LED Street Lighting Luminaire'],
    primary_product_analyzed: 'LED Street Lighting Luminaire',
    extracted_preview: sampleExtractedText,
  };

  const record: StoredAnalysis = {
    id: analysisId,
    analysis_id: analysisId,
    input_type: 'tender_document',
    input_text: sampleExtractedText,
    file_name: demoFileName,
    status: 'completed',
    created_at: createdAt,
    requirements: extraction.requirements,
    missing_information: extraction.requirements.missing_information,
    blocking_missing_information: blockingMissingInfo,
    clarification_questions: extraction.requirements.clarification_questions,
    ready_for_matching: readyForMatching,
    confirmed: false,
    provider_used: extraction.provider_used,
    demo: true,
    document_provenance: demoProvenance,
    input_language: extraction.input_language,
    language_metadata: extraction.language_metadata,
  };

  inMemoryStore.set(analysisId, record);

  return {
    analysis_id: analysisId,
    status: 'completed' as const,
    file_name: demoFileName,
    input_type: 'tender_document',
    input_text: sampleExtractedText,
    requirements: extraction.requirements,
    missing_information: extraction.requirements.missing_information,
    blocking_missing_information: blockingMissingInfo,
    clarification_questions: extraction.requirements.clarification_questions,
    ready_for_matching: readyForMatching,
    created_at: createdAt,
    provider_used: extraction.provider_used,
    demo: true,
    document_provenance: demoProvenance,
    input_language: extraction.input_language,
    language_metadata: extraction.language_metadata,
  };
}
