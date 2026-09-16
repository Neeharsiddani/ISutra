// ============================================================
// ISutra — Analysis Service
// Phase 2: AI Requirement Extraction & Analysis Persistence
// ============================================================

import { getSupabaseClient, isSupabaseConfigured } from '../database/supabase';
import { runRequirementExtractionPipeline } from './ai/requirementExtractor';
import type { StructuredRequirements, ClarificationQuestion } from './ai/types';
import type { InputType } from '../types';

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
  clarification_questions: ClarificationQuestion[];
  ready_for_matching: boolean;
  confirmed: boolean;
  provider_used: string;
  demo: boolean;
  warning?: string;
}

// In-memory analysis store for instant local development and fallback when Supabase is not configured
const inMemoryStore: Map<string, StoredAnalysis> = new Map();

export async function analyzeSpecification(
  inputType: InputType,
  inputText: string
) {
  const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  // Run AI Requirement Extraction Pipeline
  const extraction = await runRequirementExtractionPipeline(inputText, inputType);

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
    clarification_questions: extraction.requirements.clarification_questions,
    ready_for_matching: true,
    confirmed: false,
    provider_used: extraction.provider_used,
    demo: extraction.demo,
    warning: extraction.warning,
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
    clarification_questions: extraction.requirements.clarification_questions,
    ready_for_matching: true,
    created_at: createdAt,
    provider_used: extraction.provider_used,
    demo: extraction.demo,
    warning: extraction.warning,
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
            clarification_questions: extraction.requirements.clarification_questions,
            ready_for_matching: true,
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

  const mergedRequirements: StructuredRequirements = {
    ...existing.requirements,
    ...updatedRequirements,
    confirmed,
    ready_for_matching: true,
  };

  const updatedRecord: StoredAnalysis = {
    ...existing,
    requirements: mergedRequirements,
    confirmed,
    missing_information: mergedRequirements.missing_information,
    clarification_questions: mergedRequirements.clarification_questions,
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

export async function analyzeDocument(fileName: string) {
  const sampleExtractedText = `Tender Specification Document: ${fileName}\nRequirement for Municipal LED Street Lighting Luminaire 100W, outdoor weather-resistant housing, pole mounted with surge protection.`;

  const extraction = await runRequirementExtractionPipeline(sampleExtractedText, 'tender_document');
  const analysisId = `doc-analysis-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const limitationWarning = 'Prototype limitation: arbitrary uploaded documents are not parsed in this version. Use procurement text input or the provided sample for demonstration.';

  const record: StoredAnalysis = {
    id: analysisId,
    analysis_id: analysisId,
    input_type: 'tender_document',
    input_text: sampleExtractedText,
    file_name: fileName,
    status: 'completed',
    created_at: createdAt,
    requirements: extraction.requirements,
    missing_information: extraction.requirements.missing_information,
    clarification_questions: extraction.requirements.clarification_questions,
    ready_for_matching: true,
    confirmed: false,
    provider_used: extraction.provider_used,
    demo: true,
    warning: limitationWarning,
  };

  inMemoryStore.set(analysisId, record);

  return {
    analysis_id: analysisId,
    status: 'completed' as const,
    file_name: fileName,
    requirements: extraction.requirements,
    missing_information: extraction.requirements.missing_information,
    clarification_questions: extraction.requirements.clarification_questions,
    ready_for_matching: true,
    created_at: createdAt,
    provider_used: extraction.provider_used,
    demo: true,
    warning: limitationWarning,
    message: `Demonstration tender extract processed. Note: arbitrary file parsing is disabled in this prototype.`,
  };
}
