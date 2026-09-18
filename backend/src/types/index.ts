// ============================================================
// IS Standards AI — Backend Types
// Shared TypeScript type definitions
// ============================================================

export type InputType = 'product_description' | 'technical_specification' | 'tender_document';

export type AnalysisStatus = 'idle' | 'processing' | 'completed' | 'error';

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

export interface Standard {
  id: string;
  standard_number?: string;
  is_number?: string; // Backward compatibility alias
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
  relationship_type: RelationshipType | 'unspecified' | null;
  description: string;
  created_at: string;
  target_standard?: Standard;
  verification_status?: string;
  source_provenance?: string;
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

export interface AnalysisRequest {
  id: string;
  input_type: InputType;
  input_text: string;
  file_name: string | null;
  status: AnalysisStatus;
  created_at: string;
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
  page?: number;
  limit?: number;
}
