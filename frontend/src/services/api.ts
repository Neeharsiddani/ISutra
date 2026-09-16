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
  StandardsSearchParams,
  StandardsSearchResponse,
  RecommendationsResponse,
  GapAnalysisResponse,
  ComparisonResponse,
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
  inputText: string
): Promise<AIAnalysisResult> {
  const res = await fetchApi<AIAnalysisResult>('/analyze', {
    method: 'POST',
    body: JSON.stringify({ input_type: inputType, input_text: inputText }),
  });
  return res.data;
}

export async function uploadDocument(file: File): Promise<AIAnalysisResult> {
  const formData = new FormData();
  formData.append('document', file);

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
): Promise<{ data: StandardRelationship[]; demo: boolean }> {
  try {
    const res = await fetchApi<StandardRelationship[]>(`/standards/${id}/related`);
    return { data: res.data, demo: !!res.demo };
  } catch {
    const related = DEMO_RELATIONSHIPS.filter(
      (r) => r.source_standard_id === id
    );
    return { data: related, demo: true };
  }
}

export async function getAmendments(
  id: string
): Promise<{ data: Amendment[]; demo: boolean }> {
  try {
    const res = await fetchApi<Amendment[]>(`/standards/${id}/amendments`);
    return { data: res.data, demo: !!res.demo };
  } catch {
    const amendments = DEMO_AMENDMENTS.filter((a) => a.standard_id === id);
    return { data: amendments, demo: true };
  }
}

export async function getCertifications(
  id: string
): Promise<{ data: Certification[]; demo: boolean }> {
  try {
    const res = await fetchApi<Certification[]>(`/standards/${id}/certifications`);
    return { data: res.data, demo: !!res.demo };
  } catch {
    const certs = DEMO_CERTIFICATIONS.filter((c) => c.standard_id === id);
    return { data: certs, demo: true };
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
