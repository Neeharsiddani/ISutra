// ============================================================
// ISutra — API Service
// Phase 2: AI Requirement Understanding & Standards API
// ============================================================

import type {
  AIAnalysisResult,
  AnalysisHistoryItem,
  StructuredRequirements,
  Standard,
  Amendment,
  Certification,
  StandardRelationship,
  RelationshipCoverage,
  StandardsSearchParams,
  StandardsSearchResponse,
  RecommendationsResponse,
  GapAnalysisResponse,
  ComparisonResponse,
  StandardLifecycleResponse,
  RegulatoryAssessmentResponse,
} from '../types';
import {
  DEMO_STANDARDS,
  DEMO_AMENDMENTS,
  DEMO_CERTIFICATIONS,
  DEMO_RELATIONSHIPS,
} from '../data/demoData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper for generic API requests
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T; demo?: boolean; message?: string }> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message || `API error: ${response.status}`);
  }

  return await response.json();
}

// --- Phase 2: AI Requirement Extraction Endpoints ---

export async function analyzeSpecification(
  inputType: string,
  inputText: string,
  inputLanguage?: string
): Promise<AIAnalysisResult> {
  const res = await fetchApi<AIAnalysisResult>('/analyze', {
    method: 'POST',
    body: JSON.stringify({
      input_type: inputType,
      input_text: inputText,
      input_language: inputLanguage,
    }),
  });
  return res.data;
}

export async function uploadDocument(
  file: File,
  inputLanguage?: string
): Promise<AIAnalysisResult> {
  const formData = new FormData();
  formData.append('document', file);
  if (inputLanguage) {
    formData.append('input_language', inputLanguage);
  }

  const response = await fetch(`${API_BASE_URL}/analysis/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Upload error: ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}

export async function getAnalysisById(id: string): Promise<AIAnalysisResult> {
  const res = await fetchApi<AIAnalysisResult>(`/analysis/${id}`);
  return res.data;
}

export async function updateAnalysisRequirements(
  id: string,
  requirements: Partial<StructuredRequirements>,
  confirmed: boolean = false
): Promise<AIAnalysisResult> {
  const res = await fetchApi<AIAnalysisResult>(`/analysis/${id}/requirements`, {
    method: 'PUT',
    body: JSON.stringify({ requirements, confirmed }),
  });
  return res.data;
}

export async function getAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
  try {
    const res = await fetchApi<AnalysisHistoryItem[]>('/analysis/history');
    return res.data || [];
  } catch (err) {
    console.warn('Unable to load history from backend:', err);
    return [];
  }
}

// --- Phase 3: Standards Endpoints ---

export async function getStandardsCategories(): Promise<{
  categories: string[];
  subcategories: string[];
  statuses: string[];
  editionYears: number[];
}> {
  try {
    const res = await fetchApi<{
      categories: string[];
      subcategories: string[];
      statuses: string[];
      editionYears: number[];
    }>('/standards/categories');
    return res.data;
  } catch {
    return {
      categories: ['Electrical → Lighting'],
      subcategories: [
        'Luminaires',
        'Road & Street Lighting',
        'Floodlighting',
        'Handlamps',
        'Emergency Lighting',
        'LED Luminaire Performance',
        'LED Street Lighting Performance',
        'LED Testing',
        'LED Lamps',
        'LED Modules',
      ],
      statuses: ['Current / Verified', 'Verified / Monitor for revision'],
      editionYears: [2026, 2025, 2017, 2012],
    };
  }
}

export async function getStandards(
  params?: StandardsSearchParams
): Promise<StandardsSearchResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.keyword) searchParams.set('keyword', params.keyword);
    if (params?.standard_number) searchParams.set('standard_number', params.standard_number);
    if (params?.is_number) searchParams.set('is_number', params.is_number);
    if (params?.title) searchParams.set('title', params.title);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.subcategory) searchParams.set('subcategory', params.subcategory);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.edition_year) searchParams.set('edition_year', String(params.edition_year));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const result = await fetchApi<StandardsSearchResponse>(
      `/standards${query ? `?${query}` : ''}`
    );
    return result.data;
  } catch {
    return {
      standards: [],
      total: 0,
      page: 1,
      limit: 20,
      demo: false,
    };
  }
}

export async function getStandardById(
  id: string
): Promise<{ data: Standard; demo: boolean }> {
  try {
    const res = await fetchApi<Standard>(`/standards/${id}`);
    return { data: res.data, demo: !!res.demo };
  } catch {
    const standard = DEMO_STANDARDS.find((s) => s.id === id);
    if (!standard) throw new Error('Standard not found');
    return { data: standard, demo: true };
  }
}

export async function getRelatedStandards(
  id: string
): Promise<{
  data: StandardRelationship[];
  coverage?: RelationshipCoverage;
  procurement_guidance?: string;
  demo: boolean;
}> {
  try {
    const res = await fetchApi<StandardRelationship[]>(`/standards/${id}/related`);
    return {
      data: res.data,
      coverage: (res as any).coverage,
      procurement_guidance: (res as any).procurement_guidance,
      demo: !!res.demo,
    };
  } catch {
    const isDemo = id.toLowerCase().startsWith('demo-');
    const related = DEMO_RELATIONSHIPS.filter(
      (r) => r.source_standard_id === id
    );
    return {
      data: related,
      coverage: {
        total: related.length,
        verified_count: 0,
        unclassified_count: related.length,
        coverage_notice: 'Demo data — relationship intelligence not verified.',
      },
      procurement_guidance:
        'Demo standards relationship data. Not official BIS relationship information.',
      demo: isDemo,
    };
  }
}

export async function getStandardLifecycle(
  id: string
): Promise<StandardLifecycleResponse> {
  try {
    const res = await fetchApi<StandardLifecycleResponse>(`/standards/${id}/lifecycle`);
    return (res as any).data && (res as any).coverage ? (res as any) : res.data;
  } catch {
    return {
      lifecycle: null,
      amendments: [],
      coverage: {
        lifecycle_verified: false,
        amendments_verified: false,
        amendment_count: 0,
      },
      notice:
        'Lifecycle evidence not currently available in the curated ISutra reference dataset. Verify edition, revision, reaffirmation, withdrawal, and supersession status from the official BIS source.',
    };
  }
}

export async function getAmendments(
  id: string
): Promise<{ data: Amendment[]; demo: boolean; verified?: boolean; notice?: string }> {
  try {
    const res = await fetchApi<Amendment[]>(`/standards/${id}/amendments`);
    return {
      data: res.data,
      demo: !!res.demo,
      verified: (res as any).verified,
      notice: (res as any).notice,
    };
  } catch {
    const isDemo = id.toLowerCase().startsWith('demo-');
    const amendments = isDemo
      ? DEMO_AMENDMENTS.filter((a) => a.standard_id === id)
      : [];
    return {
      data: amendments,
      demo: isDemo,
      verified: false,
      notice: isDemo
        ? 'Demo data — not official BIS amendment information.'
        : 'Amendment intelligence is not currently verified for the curated BIS reference dataset.',
    };
  }
}

export async function getCertifications(
  id: string
): Promise<{ data: Certification[]; demo: boolean; verified?: boolean; notice?: string }> {
  try {
    const res = await fetchApi<Certification[]>(`/standards/${id}/certifications`);
    return {
      data: res.data,
      demo: !!res.demo,
      verified: (res as any).verified,
      notice: (res as any).notice,
    };
  } catch {
    const isDemo = id.toLowerCase().startsWith('demo-');
    const certs = isDemo
      ? DEMO_CERTIFICATIONS.filter((c) => c.standard_id === id)
      : [];
    return {
      data: certs,
      demo: isDemo,
      verified: false,
      notice: isDemo
        ? 'Demo data — not official BIS certification information.'
        : 'Mandatory certification applicability is not verified in the current dataset. Check applicable Ministry Quality Control Orders (QCOs) and official BIS certification information.',
    };
  }
}

export async function getRegulatoryCheck(
  id: string
): Promise<RegulatoryAssessmentResponse> {
  try {
    const res = await fetchApi<RegulatoryAssessmentResponse>(
      `/standards/${id}/regulatory`
    );
    return res.data;
  } catch {
    const isDemo = id.toLowerCase().startsWith('demo-');
    return {
      standard_id: id,
      standard_number: id,
      standard_title: isDemo ? '[DEMO] Demonstration Standard' : 'Standard',
      is_verified_standard: !isDemo,
      is_demo: isDemo,
      has_verified_requirement: false,
      verified_requirements_count: 0,
      schemes: [
        {
          scheme_code: 'bis_product_certification',
          scheme_name: 'BIS Product Certification (Scheme I / ISI Mark & QCOs)',
          scheme_category: 'Product Certification Scheme I',
          status: 'verification_required',
          status_label: 'Verification required',
          reason: 'No verified regulatory applicability record is stored for this product in the current ISutra reference dataset.',
          source_url: 'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/',
        },
        {
          scheme_code: 'crs',
          scheme_name: 'Compulsory Registration Scheme (CRS — Scheme II)',
          scheme_category: 'Self-Declaration of Conformity',
          status: 'no_verified_record',
          status_label: 'No Verified Regulatory Record',
          reason: 'No verified Compulsory Registration Scheme (CRS) record is stored for this product in the current ISutra reference dataset.',
          source_url: 'https://www.crsbis.in/BIS/products-lic.do',
        },
        {
          scheme_code: 'hallmarking',
          scheme_name: 'Hallmarking Scheme (Scheme IV)',
          scheme_category: 'Precious Metals Certification',
          status: 'no_verified_record',
          status_label: 'No Verified Regulatory Record',
          reason: 'Hallmarking (Scheme IV) applies exclusively to precious metal articles (gold and silver). It is not applicable to this product domain.',
          source_url: 'https://www.bis.gov.in/hallmarking-overview/',
        },
      ],
      disclaimer:
        'Certification applicability is based only on curated authoritative regulatory evidence available in the ISutra reference dataset. Absence of a record does not establish that no legal requirement exists. Verify applicable Government/BIS orders before procurement.',
      notice: isDemo ? 'Demo data — not official regulatory information.' : undefined,
    };
  }
}

// --- Phase 4: Recommendations Endpoints ---

export async function getRecommendations(
  requirements: StructuredRequirements
): Promise<RecommendationsResponse> {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Recommendations error: ${response.status}`);
  }

  return await response.json();
}

export async function getAnalysisRecommendations(
  analysisId: string
): Promise<RecommendationsResponse> {
  const response = await fetch(`${API_BASE_URL}/recommendations/analysis/${analysisId}`);

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Recommendations error: ${response.status}`);
  }

  return await response.json();
}

// --- Phase 6: Requirement Gap Analysis Endpoints ---

export async function getRequirementGapAnalysis(
  analysisId: string,
  standardId: string
): Promise<GapAnalysisResponse> {
  const response = await fetch(
    `${API_BASE_URL}/analysis/${analysisId}/recommendations/${standardId}/gap-analysis`
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Gap analysis error: ${response.status}`);
  }

  return await response.json();
}

export async function analyzeRequirementGapsDirect(
  requirements: StructuredRequirements,
  standardId: string
): Promise<GapAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/recommendations/gap-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements, standardId }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Gap analysis error: ${response.status}`);
  }

  return await response.json();
}

// --- Phase 7: Standards Comparison Workspace Endpoints ---

export async function getStandardsComparison(
  analysisId: string,
  standardIds: string[]
): Promise<ComparisonResponse> {
  const query = `standards=${encodeURIComponent(standardIds.join(','))}`;
  const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}/compare?${query}`);

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Comparison error: ${response.status}`);
  }

  return await response.json();
}

export async function compareStandardsDirect(
  requirements: StructuredRequirements,
  standardIds: string[]
): Promise<ComparisonResponse> {
  const response = await fetch(`${API_BASE_URL}/recommendations/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements, standardIds }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Comparison error: ${response.status}`);
  }

  return await response.json();
}

// --- Phase F: Procurement Report Endpoints ---

export async function getProcurementReport(analysisId: string): Promise<any> {
  const res = await fetchApi<any>(`/analysis/${analysisId}/report`);
  return res.data || res;
}

export function getProcurementReportHtmlUrl(analysisId: string): string {
  return `${API_BASE_URL}/analysis/${analysisId}/report/html`;
}

