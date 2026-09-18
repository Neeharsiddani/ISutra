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
  | 'allied_standard'
  | 'unspecified';

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
  blocking_missing_information?: string[];
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
  blocking_missing_information?: string[];
  clarification_questions: ClarificationQuestion[];
  ready_for_matching: boolean;
  confirmed?: boolean;
  created_at: string;
  provider_used?: string;
  demo?: boolean;
  warning?: string;
  message?: string;
  document_provenance?: DocumentProvenance;
}

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
  target_standard_number?: string;
  relationship_type: RelationshipType | 'unspecified' | null;
  description: string;
  created_at: string;
  target_standard?: Standard;
  verification_status?: 'verified' | 'unclassified_reference' | string;
  source_provenance?: string;
  evidence_clause?: string;
  verified_source_url?: string;
  verified_at?: string;
}

export interface RelationshipCoverage {
  total: number;
  verified_count: number;
  unclassified_count: number;
  coverage_notice: string;
}

export interface RelationshipResolutionResponse {
  data: StandardRelationship[];
  coverage: RelationshipCoverage;
  procurement_guidance: string;
  demo: boolean;
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

// --- Phase 4: Matching Engine & Recommendation Models ---

export type FactorStatus = 'matched' | 'not_matched' | 'not_available' | 'contradiction';

export interface FactorDetail {
  status: FactorStatus;
  score: number;
  weight: number;
  contribution: number;
  evidence: string[];
  label: string;
}

export interface MatchedFactorsSummary {
  productCategory: boolean;
  keywords: string[];
  application: string[];
  environment: string[];
  technicalParameters: string[];
  safetyTesting: string[];
}

// ============================================================
// Phase 5: Evidence, Traceability & Trust Models
// ============================================================

export type EvidenceSourceType =
  | 'user_requirement'
  | 'extracted_requirement'
  | 'standard_data'
  | 'official_bis_source';

export interface MatchEvidenceItem {
  sourceType: EvidenceSourceType;
  label: string;
  value: string;
  matched: boolean;
  field?: string;
}

export type TraceabilityStage =
  | 'user_input'
  | 'extracted_requirement'
  | 'matching_signal'
  | 'bis_standard'
  | 'official_bis_source';

export interface TraceabilityChainStep {
  step: number;
  stage: TraceabilityStage;
  title: string;
  description: string;
  sourceType: EvidenceSourceType;
  badge?: string;
}

export interface RequirementStandardComparison {
  field: string;
  requirementValue: string | null;
  standardValue: string | null;
  status: FactorStatus;
  note?: string;
}

export interface StandardRecommendation {
  rank: number;
  standardId: string;
  standard: Standard;
  score: number;
  relevancePercentage: number;
  category: 'high' | 'related' | 'low';
  categoryLabel: 'HIGH RELEVANCE' | 'RELATED' | 'LOW RELEVANCE';
  matchedFactors: MatchedFactorsSummary;
  specificityTier?: number;
  specificityTierLabel?: string;
  specificationSpecificity?: any;
  factorStatuses: {
    productCategory: FactorDetail;
    keywordsTitleScope: FactorDetail;
    application: FactorDetail;
    environment: FactorDetail;
    technicalParameters: FactorDetail;
    safetyTesting: FactorDetail;
    specificationSpecificity?: any;
  };
  reason: string;
  evidence: MatchEvidenceItem[];
  traceabilityChain: TraceabilityChainStep[];
  comparison: RequirementStandardComparison[];
}

export interface MatchingMetadata {
  standardsEvaluated: number;
  matchingMethod: string;
  minimumThreshold: number;
  insufficientInformation: boolean;
  insufficientReason?: string;
  guidance?: string[];
  weightsUsed?: Record<string, number>;
  timestamp: string;
  datasetName?: string;
  datasetCount?: number;
  sourceProvenance?: string;
  disclaimer?: string;
}

export interface RecommendationsResponse {
  success: boolean;
  analysisId?: string;
  confirmed?: boolean;
  requirements?: StructuredRequirements;
  recommendations: StandardRecommendation[];
  metadata: MatchingMetadata;
}

// ============================================================
// Phase 6: Procurement Requirement Gap Analysis & Review Models
// ============================================================

export type RequirementGapStatus =
  | 'supported'
  | 'not_supported'
  | 'not_available'
  | 'needs_verification';

export interface RequirementGapItem {
  requirementId: string;
  category: 'product' | 'application' | 'environment' | 'installation' | 'technical_parameter' | 'material' | 'safety' | 'testing';
  requirementLabel: string;
  requirementValue: string;
  sourceText?: string;

  standardField?: string;
  standardEvidence?: string;

  status: RequirementGapStatus;
  statusLabel: string;

  explanation: string;

  evidence?: MatchEvidenceItem[];
}

export interface RequirementGapAnalysis {
  standardId: string;
  standardNumber: string;
  standardTitle: string;
  standardCategory: string;
  officialSourceUrl: string;

  totalRequirements: number;
  supportedCount: number;
  notSupportedCount: number;
  notAvailableCount: number;
  needsVerificationCount: number;

  referenceCoverage: number | null;
  referenceCoverageLabel: string;
  referenceCoverageExplanation: string;

  items: RequirementGapItem[];

  verificationActions: string[];

  disclaimer: string;
  metadata: {
    datasetName: string;
    standardsEvaluated: number;
    sourceProvenance: string;
    timestamp: string;
  };
}

export interface GapAnalysisResponse {
  success: boolean;
  analysisId?: string;
  gapAnalysis: RequirementGapAnalysis;
  error?: {
    message: string;
    statusCode: number;
    guidance?: string[];
  };
}

// ============================================================
// Phase 7: Procurement Standards Comparison Workspace Models
// ============================================================

export interface StandardOverviewItem {
  id: string;
  standardNumber: string;
  title: string;
  category: string;
  subcategory: string;
  editionYear: number;
  officialSourceUrl: string;
  productTypes: string[];
  keywords: string[];
  scope: string;
  referenceCoverage: number | null;
  referenceCoverageLabel: string;
}

export interface DimensionValue {
  value: string;
  evidenceSource: 'standard_record' | 'gap_analysis' | 'not_available';
  status?: RequirementGapStatus;
  statusLabel?: string;
}

export interface DimensionComparisonRow {
  dimensionId: string;
  dimensionLabel: string;
  dimensionGroup: 'metadata' | 'scope_and_products' | 'technical_and_testing' | 'requirement_alignment';
  values: Record<string, DimensionValue>;
  factualDifferenceNote?: string;
}

export interface StandardTechnicalDistinction {
  standardId: string;
  standardNumber: string;
  standardTitle: string;
  categoryClassification: string;
  documentedScope: string;
  uniqueProductTypes: string[];
  uniqueKeywords: string[];
}

export interface ConsolidatedVerificationAction {
  action: string;
  applicableStandards: string[];
}

export interface StandardsComparisonResult {
  standards: StandardOverviewItem[];
  matrixRows: DimensionComparisonRow[];
  technicalDistinctions: StandardTechnicalDistinction[];
  gapAnalyses: Record<string, RequirementGapAnalysis>;
  consolidatedVerificationActions: ConsolidatedVerificationAction[];
  disclaimer: string;
  metadata: {
    datasetName: string;
    standardsEvaluated: number;
    comparedCount: number;
    sourceProvenance: string;
    timestamp: string;
  };
}

export interface ComparisonResponse {
  success: boolean;
  analysisId?: string | null;
  comparison: StandardsComparisonResult;
  error?: {
    message: string;
    statusCode: number;
  };
}
