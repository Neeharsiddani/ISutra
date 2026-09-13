// ============================================================
// ISutra — TypeScript Type Definitions
// Phase 2: AI Requirement Understanding & Standards Intelligence
// ============================================================

// --- Enums & Literal Types ---

export type InputType = 'product_description' | 'technical_specification' | 'tender_document';

export type AnalysisStatus = 'idle' | 'processing' | 'completed' | 'error';

export type ConfidenceLevel = 'high' | 'medium' | 'needs_review';

export type StandardStatus = 'active' | 'withdrawn' | 'superseded' | 'under_revision' | 'demo';

export type RelationshipType =
  | 'normative_reference'
  | 'test_method'
  | 'safety_standard'
  | 'installation_standard'
  | 'terminology'
  | 'related_product'
  | 'allied_standard';

export type CertificationType =
  | 'BIS Product Certification'
  | 'CRS'
  | 'Hallmarking'
  | 'Other';

export type RecommendationCategory =
  | 'recommended'
  | 'related'
  | 'normative_reference'
  | 'testing'
  | 'safety'
  | 'installation'
  | 'certification';

// --- Phase 2: Structured Requirements Data Models ---

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
  clarification_questions: ClarificationQuestion[];
  overall_confidence: ConfidenceLevel;
  ready_for_matching: boolean;
  confirmed?: boolean;
}

export interface AIAnalysisResult {
  analysis_id: string;
  status: 'completed' | 'processing' | 'error';
  input_type: InputType;
  input_text: string;
  file_name?: string | null;
  requirements: StructuredRequirements;
  missing_information: string[];
  clarification_questions: ClarificationQuestion[];
  ready_for_matching: boolean;
  confirmed?: boolean;
  created_at: string;
  provider_used?: string;
  demo?: boolean;
  warning?: string;
  message?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  analysis_id: string;
  input_type: InputType;
  product_name: string;
  short_description: string;
  parameters_count: number;
  status: string;
  confirmed: boolean;
  created_at: string;
}

// --- Phase 1: Standards & Relationships Models (retained) ---

export interface Standard {
  id: string;
  standard_number?: string;
  is_number: string;
  title: string;
  category: string;
  subcategory?: string;
  product_types?: string[];
  keywords?: string[];
  scope?: string;
  technical_parameters?: Record<string, unknown> | null;
  safety_requirements?: string | Record<string, unknown> | null;
  performance_requirements?: string | Record<string, unknown> | null;
  testing_requirements?: string | Record<string, unknown> | null;
  related_standards?: string[];
  edition_year?: number | string;
  status: StandardStatus | string;
  source_organization?: string;
  source_url: string;
  last_verified?: string;
  edition?: string;
  publication_date?: string;
  last_updated?: string;
  source_name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface StandardRelationship {
  id: string;
  source_standard_id: string;
  target_standard_id: string;
  relationship_type: RelationshipType;
  description: string;
  created_at: string;
  target_standard?: Standard;
}

export interface Amendment {
  id: string;
  standard_id: string;
  amendment_number: string;
  title: string;
  publication_date: string;
  status: string;
  source_url: string;
  description: string;
}

export interface Certification {
  id: string;
  standard_id: string;
  certification_type: CertificationType;
  requirement: string;
  description: string;
  source_url: string;
}

export interface AnalysisRequest {
  id: string;
  input_type: InputType;
  input_text: string;
  file_name: string | null;
  status: AnalysisStatus;
  created_at: string;
}

export interface Recommendation {
  id: string;
  analysis_request_id: string;
  standard_id: string;
  relevance_score: number;
  reason: string;
  rank: number;
  created_at: string;
  category: RecommendationCategory;
  standard?: Standard;
}

// --- API Response Types ---

export interface ApiResponse<T> {
  data: T;
  demo?: boolean;
  message?: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: AnalysisStatus;
  requirements?: StructuredRequirements;
  missing_information?: string[];
  clarification_questions?: ClarificationQuestion[];
  ready_for_matching?: boolean;
  recommendations?: Recommendation[];
  demo: boolean;
  provider_used?: string;
}

export interface StandardsSearchParams {
  search?: string;
  is_number?: string;
  standard_number?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  keyword?: string;
  product_type?: string;
  status?: StandardStatus | string;
  edition_year?: number | string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface StandardsSearchResponse {
  standards: Standard[];
  total: number;
  page: number;
  limit: number;
  demo: boolean;
}

// --- UI State Types ---

export interface UploadedFile {
  file: File;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'uploaded' | 'error';
}

export interface InputTypeOption {
  value: InputType;
  label: string;
  description: string;
  icon: string;
}
