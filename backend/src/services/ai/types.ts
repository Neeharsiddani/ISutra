// ============================================================
// ISutra — AI Service Types
// Phase 2: Structured Procurement Requirement Extraction
// ============================================================

export type ConfidenceLevel = 'high' | 'medium' | 'needs_review';

export interface TechnicalParameterItem {
  id?: string;
  parameter: string;
  value: string;
  unit?: string;
  confidence: ConfidenceLevel;
  source_text?: string;
}

export interface TaggedRequirementItem {
  id?: string;
  name: string;
  confidence: ConfidenceLevel;
  source_text?: string;
}

export interface ClarificationQuestion {
  id: string;
  field: string;
  question: string;
  options: string[];
  suggestedAnswer?: string;
  selectedAnswer?: string;
}

export interface StructuredRequirements {
  product: {
    name: string;
    category: string;
    confidence: ConfidenceLevel;
    source_text?: string;
  };
  application: string | null;
  application_source?: string;
  industry: string | null;
  technical_parameters: TechnicalParameterItem[];
  materials: TaggedRequirementItem[];
  environment: TaggedRequirementItem[];
  safety_requirements: TaggedRequirementItem[];
  performance_requirements: TaggedRequirementItem[];
  testing_requirements: TaggedRequirementItem[];
  installation_requirements: TaggedRequirementItem[];
  certification_mentions: TaggedRequirementItem[];
  quantity: string | null;
  quantity_source?: string;
  additional_requirements: TaggedRequirementItem[];
  missing_information: string[];
  blocking_missing_information?: string[];
  clarification_questions: ClarificationQuestion[];
  overall_confidence: ConfidenceLevel;
  ready_for_matching: boolean;
  confirmed?: boolean;
}

export interface AIAnalysisResult {
  analysis_id: string;
  status: 'completed' | 'processing' | 'error';
  input_type: string;
  input_text: string;
  requirements: StructuredRequirements;
  missing_information: string[];
  blocking_missing_information?: string[];
  clarification_questions: ClarificationQuestion[];
  ready_for_matching: boolean;
  created_at: string;
  provider_used: string;
  demo?: boolean;
  warning?: string;
  message?: string;
}
