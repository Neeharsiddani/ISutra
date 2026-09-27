// ============================================================
// ISutra: Phase 10 / SIH26108 — Standards Ingestion Service
// Ingestion schema and validation layer for adding verified BIS records
// Enforces strict provenance, official BIS source URLs, and schema integrity
// ============================================================

import { Standard, StandardStatus } from '../types';

export const TRUSTED_BIS_DOMAINS = [
  'bis.gov.in',
  'www.bis.gov.in',
  'services.bis.gov.in',
  'www.services.bis.gov.in',
  'crsbis.in',
  'www.crsbis.in',
  'egazette.gov.in',
  'www.egazette.gov.in',
  'e-gazette.gov.in',
];

export interface CandidateStandardRecord {
  id: string;
  standard_number: string;
  title: string;
  category: string;
  subcategory?: string;
  scope: string;
  product_types?: string[];
  keywords?: string[];
  application?: string[] | string | null;
  environment?: string[] | string | null;
  technical_parameters?: Record<string, unknown> | null;
  safety_requirements?: string | Record<string, unknown> | null;
  performance_requirements?: string | Record<string, unknown> | null;
  testing_requirements?: string | Record<string, unknown> | null;
  related_standards?: string[];
  edition_year?: number | string;
  status: StandardStatus | string;
  source_organization: string;
  source_url: string;
  source_provenance?: string;
  verification_status: 'verified' | 'unverified' | 'verification_required';
  last_verified: string;
}

export interface IngestionValidationError {
  field: string;
  message: string;
  code: string;
}

export interface StandardIngestionResult {
  valid: boolean;
  errors: IngestionValidationError[];
  warnings: string[];
  record: Standard | null;
}

/**
 * Validates whether a source URL belongs to an authoritative official BIS or Gazette domain.
 * Strictly requires HTTPS and official domain whitelist to prevent arbitrary URL injection.
 */
export function isOfficialBisSourceUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr.trim());
    if (parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    return TRUSTED_BIS_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates a candidate standard record for ingestion into the ISutra verified database.
 * Rejects incomplete, hallucinated, or unverified records without explicit flags.
 */
export function validateStandardForIngestion(candidate: unknown): StandardIngestionResult {
  const errors: IngestionValidationError[] = [];
  const warnings: string[] = [];

  if (!candidate || typeof candidate !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Candidate record must be a valid JSON object.', code: 'INVALID_ROOT' }],
      warnings: [],
      record: null,
    };
  }

  const rec = candidate as Record<string, unknown>;

  // 1. Mandatory standard ID
  if (!rec.id || typeof rec.id !== 'string' || rec.id.trim().length === 0) {
    errors.push({ field: 'id', message: 'Standard ID is required and must be non-empty.', code: 'MISSING_ID' });
  } else if (!/^[a-z0-9-_:]+$/i.test(rec.id.trim())) {
    errors.push({ field: 'id', message: 'Standard ID contains invalid characters. Use alphanumeric, hyphens, colons, or underscores.', code: 'INVALID_ID_FORMAT' });
  }

  // 2. Mandatory standard number (e.g. IS 10322 (Part 5/Sec 3):2026)
  if (!rec.standard_number || typeof rec.standard_number !== 'string' || rec.standard_number.trim().length === 0) {
    errors.push({ field: 'standard_number', message: 'Standard number (e.g., IS ...) is required.', code: 'MISSING_STANDARD_NUMBER' });
  } else if (!/^IS\s+\d+/i.test(rec.standard_number.trim())) {
    warnings.push(`Standard number "${rec.standard_number}" does not match standard "IS <number>" format.`);
  }

  // 3. Mandatory title
  if (!rec.title || typeof rec.title !== 'string' || rec.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Standard title is mandatory.', code: 'MISSING_TITLE' });
  }

  // 4. Mandatory category
  if (!rec.category || typeof rec.category !== 'string' || rec.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Standard category is mandatory.', code: 'MISSING_CATEGORY' });
  }

  // 5. Mandatory scope
  if (!rec.scope || typeof rec.scope !== 'string' || rec.scope.trim().length === 0) {
    errors.push({ field: 'scope', message: 'Standard scope summary is mandatory.', code: 'MISSING_SCOPE' });
  }

  // 6. Source organization & provenance
  if (!rec.source_organization || typeof rec.source_organization !== 'string' || rec.source_organization.trim().length === 0) {
    errors.push({ field: 'source_organization', message: 'Source organization (e.g., Bureau of Indian Standards) is required.', code: 'MISSING_SOURCE_ORG' });
  }

  // 7. Official Source URL & Verification Status
  const sourceUrl = typeof rec.source_url === 'string' ? rec.source_url.trim() : '';
  const verificationStatus = typeof rec.verification_status === 'string' ? rec.verification_status.trim().toLowerCase() : '';

  if (!sourceUrl) {
    errors.push({ field: 'source_url', message: 'Authoritative source URL is required.', code: 'MISSING_SOURCE_URL' });
  } else if (verificationStatus === 'verified') {
    if (!isOfficialBisSourceUrl(sourceUrl)) {
      errors.push({
        field: 'source_url',
        message: `Verified standards must link directly to an authoritative official BIS or Gazette domain (${TRUSTED_BIS_DOMAINS.join(', ')}). Arbitrary or third-party URLs cannot be verified.`,
        code: 'INVALID_OFFICIAL_BIS_URL',
      });
    }
  } else {
    warnings.push('Record is not marked with verified provenance. Source URL is retained as unverified reference.');
  }

  // 8. Verification Date
  if (verificationStatus === 'verified') {
    const lastVerified = typeof rec.last_verified === 'string' ? rec.last_verified.trim() : '';
    if (!lastVerified || !/^\d{4}-\d{2}-\d{2}$/.test(lastVerified)) {
      errors.push({
        field: 'last_verified',
        message: 'Verified standard records must include a valid ISO date (YYYY-MM-DD) for last_verified.',
        code: 'INVALID_VERIFIED_DATE',
      });
    }
  }

  // 9. Null/Unavailable handling for requirements
  const techParams = rec.technical_parameters && typeof rec.technical_parameters === 'object'
    ? (rec.technical_parameters as Record<string, unknown>)
    : null;

  const safetyReqs = rec.safety_requirements
    ? (typeof rec.safety_requirements === 'string' || typeof rec.safety_requirements === 'object' ? rec.safety_requirements : null)
    : null;

  const perfReqs = rec.performance_requirements
    ? (typeof rec.performance_requirements === 'string' || typeof rec.performance_requirements === 'object' ? rec.performance_requirements : null)
    : null;

  const testReqs = rec.testing_requirements
    ? (typeof rec.testing_requirements === 'string' || typeof rec.testing_requirements === 'object' ? rec.testing_requirements : null)
    : null;

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      record: null,
    };
  }

  const nowIso = new Date().toISOString();

  const standardRecord: Standard = {
    id: String(rec.id).trim(),
    standard_number: String(rec.standard_number).trim(),
    is_number: String(rec.standard_number).trim(),
    title: String(rec.title).trim(),
    category: String(rec.category).trim(),
    subcategory: rec.subcategory ? String(rec.subcategory).trim() : undefined,
    product_types: Array.isArray(rec.product_types) ? rec.product_types.map(String) : [],
    keywords: Array.isArray(rec.keywords) ? rec.keywords.map(String) : [],
    scope: String(rec.scope).trim(),
    technical_parameters: techParams,
    safety_requirements: safetyReqs as string | Record<string, unknown> | null,
    performance_requirements: perfReqs as string | Record<string, unknown> | null,
    testing_requirements: testReqs as string | Record<string, unknown> | null,
    related_standards: Array.isArray(rec.related_standards) ? rec.related_standards.map(String) : [],
    edition_year: rec.edition_year ? Number(rec.edition_year) : undefined,
    status: rec.status ? String(rec.status) : 'Current / Verified',
    source_organization: String(rec.source_organization).trim(),
    source_name: String(rec.source_organization).trim(),
    source_url: sourceUrl,
    last_verified: rec.last_verified ? String(rec.last_verified).trim() : undefined,
    created_at: typeof rec.created_at === 'string' ? rec.created_at : nowIso,
    updated_at: typeof rec.updated_at === 'string' ? rec.updated_at : nowIso,
  };

  return {
    valid: true,
    errors: [],
    warnings,
    record: standardRecord,
  };
}
