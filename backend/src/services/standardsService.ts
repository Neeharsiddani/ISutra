// ============================================================
// ISutra: Phase 3 — Standards Service
// Business logic for verified Indian Standards data access
// MongoDB persistence via standardsRepository with guaranteed verified dataset fallback
// ============================================================

import * as standardsRepo from '../repositories/standardsRepository';
import { VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';
import { VERIFIED_STANDARD_LIFECYCLES } from '../database/verifiedStandardLifecycles';
import { VERIFIED_REGULATORY_RECORDS } from '../database/verifiedRegulatoryRecords';
import { VERIFIED_RELATIONSHIPS } from '../database/verifiedRelationships';
import {
  DEMO_RELATIONSHIPS,
  DEMO_AMENDMENTS,
  DEMO_CERTIFICATIONS,
} from '../database/demoData';
import { getResolvedRelationships } from './standardsRelationshipService';
import type { Standard, StandardsSearchParams } from '../types';

// Helper to normalize standard objects with verified lifecycle, regulatory, and relationship indicators
function formatStandard(s: any): Standard {
  const stdId = (s.id || '').toLowerCase();
  const stdNum = (s.standard_number || s.is_number || '').toLowerCase();
  const stdNumClean = stdNum.replace(/\s+/g, '');

  const lc = VERIFIED_STANDARD_LIFECYCLES.find(
    (l) => l.standard_id.toLowerCase() === stdId || l.standard_number.toLowerCase().replace(/\s+/g, '') === stdNumClean
  );

  const reg = VERIFIED_REGULATORY_RECORDS.find(
    (r) => r.standard_id.toLowerCase() === stdId || r.standard_number.toLowerCase().replace(/\s+/g, '') === stdNumClean
  );

  const relCount = VERIFIED_RELATIONSHIPS.filter(
    (rel) =>
      rel.source_standard_id.toLowerCase() === stdId ||
      rel.target_standard_id.toLowerCase() === stdId ||
      rel.source_standard_number.toLowerCase().replace(/\s+/g, '') === stdNumClean ||
      rel.target_standard_number.toLowerCase().replace(/\s+/g, '') === stdNumClean
  ).length;

  return {
    ...s,
    standard_number: s.standard_number || s.is_number,
    is_number: s.standard_number || s.is_number,
    edition: s.edition || (s.edition_year ? String(s.edition_year) : ''),
    source_name: s.source_name || s.source_organization || 'Bureau of Indian Standards',
    description: s.description || s.scope || '',
    lifecycle_status: lc ? lc.lifecycle_status : undefined,
    has_regulatory_evidence: !!reg,
    regulatory_scheme: reg ? (reg.regulation_name || reg.regulation_type) : undefined,
    relationship_count: relCount,
  };
}

export async function getAllStandards(params: StandardsSearchParams) {
  const page = params.page || 1;
  const limit = params.limit || 50;

  const result = await standardsRepo.findStandards(
    {
      search: params.search || params.keyword,
      category: params.category,
      subcategory: params.subcategory,
      standard_number: params.standard_number || params.is_number,
      title: params.title,
      status: params.status,
      edition_year: params.edition_year ? Number(params.edition_year) : undefined,
    },
    { page, limit }
  );

  return {
    standards: result.standards.map(formatStandard),
    total: result.total,
    page: result.page,
    limit: result.limit,
    demo: false,
  };
}

export async function getStandardById(id: string) {
  const found = await standardsRepo.findStandardById(id);

  if (found) {
    return { data: formatStandard(found), demo: false };
  }

  return null;
}

export async function getCategories() {
  const categories = Array.from(
    new Set(VERIFIED_BIS_STANDARDS.map((s) => s.category))
  ).filter(Boolean);

  const subcategories = Array.from(
    new Set(VERIFIED_BIS_STANDARDS.map((s) => s.subcategory))
  ).filter(Boolean);

  const statuses = Array.from(
    new Set(VERIFIED_BIS_STANDARDS.map((s) => s.status))
  ).filter(Boolean);

  const editionYears = Array.from(
    new Set(VERIFIED_BIS_STANDARDS.map((s) => s.edition_year))
  ).sort((a, b) => b - a);

  return {
    categories,
    subcategories,
    statuses,
    editionYears,
  };
}

export async function getRelatedStandards(id: string) {
  return getResolvedRelationships(id);
}

export async function getAmendments(id: string) {
  const isDemo = id.toLowerCase().startsWith('demo-');
  if (isDemo) {
    const amendments = DEMO_AMENDMENTS.filter((a) => a.standard_id === id);
    return {
      data: amendments,
      demo: true,
      verified: false,
      notice: 'Demo data — not official BIS amendment information.',
    };
  }

  return {
    data: [],
    demo: false,
    verified: false,
    notice: 'Amendment intelligence is not currently verified for the curated BIS reference dataset.',
  };
}

export async function getCertifications(id: string) {
  const isDemo = id.toLowerCase().startsWith('demo-');
  if (isDemo) {
    const certs = DEMO_CERTIFICATIONS.filter((c) => c.standard_id === id);
    return {
      data: certs,
      demo: true,
      verified: false,
      notice: 'Demo data — not official BIS certification information.',
    };
  }

  return {
    data: [],
    demo: false,
    verified: false,
    notice: 'Mandatory certification applicability is not verified in the current dataset. Check applicable Ministry Quality Control Orders (QCOs) and official BIS certification information.',
  };
}

export { getStandardRegulatoryCheck } from './regulatoryService';
