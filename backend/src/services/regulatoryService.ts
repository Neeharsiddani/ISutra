// ============================================================
// ISutra — Regulatory & Certification Evidence Service
// SIH26108: Suggest mandatory certification requirements where applicable
// (e.g. BIS Product Certification, CRS, Hallmarking).
// Strictly evidence-backed: No inference from title/keywords/LLM alone.
// ============================================================

import {
  VERIFIED_REGULATORY_RECORDS,
  VerifiedRegulatoryRecord,
  RegulationType,
  VerificationStatus,
} from '../database/verifiedRegulatoryRecords';
import { VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';

export type SchemeCode = 'bis_product_certification' | 'crs' | 'hallmarking';

export type AssessmentState =
  | 'verified_requirement'
  | 'verification_required'
  | 'no_verified_record'
  | 'not_assessed';

export interface SchemeAssessment {
  scheme_code: SchemeCode;
  scheme_name: string;
  scheme_category: string;
  status: AssessmentState;
  status_label: string;
  reason?: string;
  evidence_order?: string;
  authority?: string;
  effective_date?: string;
  last_verified_date?: string;
  source?: string;
  source_url: string;
  notes_limitations?: string;
  record?: VerifiedRegulatoryRecord;
}

export interface RegulatoryAssessmentResponse {
  standard_id: string;
  standard_number: string;
  standard_title: string;
  is_verified_standard: boolean;
  is_demo: boolean;
  has_verified_requirement: boolean;
  verified_requirements_count: number;
  schemes: SchemeAssessment[];
  disclaimer: string;
  notice?: string;
}

export const REGULATORY_DISCLAIMER =
  'Certification applicability is based only on curated authoritative regulatory evidence available in the ISutra reference dataset. Absence of a record does not establish that no legal requirement exists. Verify applicable Government/BIS orders before procurement.';

function normalizeStandardNumber(s: string): string {
  return s.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Get regulatory / certification assessment for a specific standard.
 */
export async function getStandardRegulatoryCheck(
  idOrNumber: string
): Promise<RegulatoryAssessmentResponse> {
  const isDemo = idOrNumber.toLowerCase().startsWith('demo-');

  if (isDemo) {
    return {
      standard_id: idOrNumber,
      standard_number: idOrNumber,
      standard_title: '[DEMO] Demonstration Standard',
      is_verified_standard: false,
      is_demo: true,
      has_verified_requirement: false,
      verified_requirements_count: 0,
      schemes: [],
      disclaimer: REGULATORY_DISCLAIMER,
      notice: 'Demo data — not official regulatory or certification information. Quarantined.',
    };
  }

  const normTarget = normalizeStandardNumber(idOrNumber);
  const matchedStd = VERIFIED_BIS_STANDARDS.find(
    (s) =>
      s.id.toLowerCase() === idOrNumber.toLowerCase() ||
      normalizeStandardNumber(s.standard_number) === normTarget
  );

  if (!matchedStd) {
    return {
      standard_id: idOrNumber,
      standard_number: idOrNumber,
      standard_title: 'Standard not found in reference dataset',
      is_verified_standard: false,
      is_demo: false,
      has_verified_requirement: false,
      verified_requirements_count: 0,
      schemes: [
        {
          scheme_code: 'bis_product_certification',
          scheme_name: 'BIS Product Certification (Scheme I / ISI Mark & QCOs)',
          scheme_category: 'Product Certification Scheme I',
          status: 'not_assessed',
          status_label: 'Not Assessed',
          reason: 'Standard record is not present in the curated reference dataset.',
          source_url: 'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/',
        },
      ],
      disclaimer: REGULATORY_DISCLAIMER,
      notice: 'Standard not found in reference dataset. Verify with official BIS catalogue.',
    };
  }

  // Find any verified regulatory records for this standard
  const stdRecords = VERIFIED_REGULATORY_RECORDS.filter(
    (r) =>
      r.standard_id.toLowerCase() === matchedStd.id.toLowerCase() ||
      normalizeStandardNumber(r.standard_number) === normalizeStandardNumber(matchedStd.standard_number)
  );

  const schemes: SchemeAssessment[] = [];

  // 1. BIS Product Certification (Scheme I / ISI Mark & QCOs)
  const bisCertRecord = stdRecords.find(
    (r) => r.regulation_type === 'bis_product_certification' || r.regulation_type === 'qco'
  );

  if (bisCertRecord && bisCertRecord.verification_status === 'verified') {
    schemes.push({
      scheme_code: 'bis_product_certification',
      scheme_name: 'BIS Product Certification (Scheme I / ISI Mark & QCOs)',
      scheme_category: 'Compulsory Certification via Quality Control Order (QCO)',
      status: 'verified_requirement',
      status_label: 'Verified applicability',
      evidence_order: bisCertRecord.regulation_name,
      authority: bisCertRecord.authority,
      effective_date: bisCertRecord.effective_date,
      last_verified_date: bisCertRecord.last_verified_date,
      source: bisCertRecord.source,
      source_url: bisCertRecord.source_url,
      notes_limitations: bisCertRecord.notes_limitations,
      record: bisCertRecord,
    });
  } else {
    schemes.push({
      scheme_code: 'bis_product_certification',
      scheme_name: 'BIS Product Certification (Scheme I / ISI Mark & QCOs)',
      scheme_category: 'Product Certification Scheme I',
      status: 'verification_required',
      status_label: 'Verification required',
      reason: 'No verified regulatory applicability record is stored for this product in the current ISutra reference dataset.',
      source_url: matchedStd.source_url || 'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/',
    });
  }

  // 2. Compulsory Registration Scheme (CRS - Scheme II)
  const crsRecord = stdRecords.find((r) => r.regulation_type === 'crs');

  if (crsRecord && crsRecord.verification_status === 'verified') {
    schemes.push({
      scheme_code: 'crs',
      scheme_name: 'Compulsory Registration Scheme (CRS — Scheme II)',
      scheme_category: 'Self-Declaration of Conformity for IT & Electronic Goods',
      status: 'verified_requirement',
      status_label: 'Verified applicability',
      evidence_order: crsRecord.regulation_name,
      authority: crsRecord.authority,
      effective_date: crsRecord.effective_date,
      last_verified_date: crsRecord.last_verified_date,
      source: crsRecord.source,
      source_url: crsRecord.source_url,
      notes_limitations: crsRecord.notes_limitations,
      record: crsRecord,
    });
  } else {
    // If not in CRS registry
    schemes.push({
      scheme_code: 'crs',
      scheme_name: 'Compulsory Registration Scheme (CRS — Scheme II)',
      scheme_category: 'Self-Declaration of Conformity',
      status: 'no_verified_record',
      status_label: 'No Verified Regulatory Record',
      reason: 'No verified Compulsory Registration Scheme (CRS) record is stored for this product in the current ISutra reference dataset.',
      source_url: 'https://www.crsbis.in/BIS/products-lic.do',
    });
  }

  // 3. Hallmarking (Scheme IV)
  const hallmarkingRecord = stdRecords.find((r) => r.regulation_type === 'hallmarking');

  if (hallmarkingRecord && hallmarkingRecord.verification_status === 'verified') {
    schemes.push({
      scheme_code: 'hallmarking',
      scheme_name: 'Hallmarking Scheme (Scheme IV)',
      scheme_category: 'Precious Metals Certification',
      status: 'verified_requirement',
      status_label: 'Verified applicability',
      evidence_order: hallmarkingRecord.regulation_name,
      authority: hallmarkingRecord.authority,
      effective_date: hallmarkingRecord.effective_date,
      last_verified_date: hallmarkingRecord.last_verified_date,
      source: hallmarkingRecord.source,
      source_url: hallmarkingRecord.source_url,
      notes_limitations: hallmarkingRecord.notes_limitations,
      record: hallmarkingRecord,
    });
  } else {
    // Strictly report no verified record / domain limitation for non-precious metals
    schemes.push({
      scheme_code: 'hallmarking',
      scheme_name: 'Hallmarking Scheme (Scheme IV)',
      scheme_category: 'Precious Metals Certification',
      status: 'no_verified_record',
      status_label: 'No Verified Regulatory Record',
      reason: 'Hallmarking (Scheme IV) applies exclusively to precious metal articles (gold and silver). It is not applicable to this product domain.',
      source_url: 'https://www.bis.gov.in/hallmarking-overview/',
    });
  }

  const verifiedCount = schemes.filter((s) => s.status === 'verified_requirement').length;

  return {
    standard_id: matchedStd.id,
    standard_number: matchedStd.standard_number,
    standard_title: matchedStd.title,
    is_verified_standard: true,
    is_demo: false,
    has_verified_requirement: verifiedCount > 0,
    verified_requirements_count: verifiedCount,
    schemes,
    disclaimer: REGULATORY_DISCLAIMER,
  };
}

/**
 * Get all stored verified regulatory records
 */
export function getAllVerifiedRegulatoryRecords(): VerifiedRegulatoryRecord[] {
  return [...VERIFIED_REGULATORY_RECORDS];
}
