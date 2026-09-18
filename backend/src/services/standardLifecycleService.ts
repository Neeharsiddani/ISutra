// ============================================================
// ISutra: Phase 9B — Standard Lifecycle & Amendment Service
// Exposes curated, evidence-backed BIS lifecycle and amendment intelligence
// Consumes verifiedStandardLifecycles.ts and verifiedStandardAmendments.ts
// Does NOT modify verifiedStandards.ts
// ============================================================

import {
  getVerifiedLifecycle,
  VerifiedStandardLifecycle,
} from '../database/verifiedStandardLifecycles';
import {
  getVerifiedAmendments,
  VerifiedStandardAmendment,
} from '../database/verifiedStandardAmendments';
import { VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';

export interface StandardLifecycleCoverage {
  lifecycle_verified: boolean;
  amendments_verified: boolean;
  amendment_count: number;
}

export interface StandardLifecycleResult {
  lifecycle: VerifiedStandardLifecycle | null;
  amendments: VerifiedStandardAmendment[];
  coverage: StandardLifecycleCoverage;
  notice: string;
}

/**
 * Retrieves curated BIS lifecycle and amendment intelligence for a standard.
 *
 * @param standardId - Standard identifier or standard number
 * @returns Clean lifecycle, ordered amendments, coverage indicators, and provenance notice
 */
export function getStandardLifecycle(standardId: string): StandardLifecycleResult {
  const cleanId = decodeURIComponent(standardId).trim().toLowerCase();

  // Match against verified standards catalogue to resolve canonical standard ID
  const matchedStd = VERIFIED_BIS_STANDARDS.find(
    (s) =>
      s.id.toLowerCase() === cleanId ||
      s.standard_number.toLowerCase() === cleanId ||
      s.standard_number.toLowerCase().replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
  );

  const canonicalId = matchedStd ? matchedStd.id : standardId;
  const lifecycle = getVerifiedLifecycle(canonicalId) || null;
  const rawAmendments = getVerifiedAmendments(canonicalId);

  // Deterministic chronological ordering strictly by positive integer amendment_number
  const amendments = [...rawAmendments].sort((a, b) => a.amendment_number - b.amendment_number);

  const lifecycleVerified = lifecycle !== null;
  const amendmentsVerified = amendments.length > 0;

  let notice = '';
  if (lifecycleVerified && amendmentsVerified) {
    notice = `Curated lifecycle and amendment evidence verified from official BIS records for ${lifecycle.standard_number}.`;
  } else if (lifecycleVerified) {
    notice = `Curated lifecycle evidence verified for ${lifecycle.standard_number}. No verified amendment record in the current ISutra reference dataset for this edition.`;
  } else {
    notice =
      'Lifecycle evidence not currently available in the curated ISutra reference dataset. Verify edition, revision, reaffirmation, withdrawal, and supersession status from the official BIS source.';
  }

  return {
    lifecycle,
    amendments,
    coverage: {
      lifecycle_verified: lifecycleVerified,
      amendments_verified: amendmentsVerified,
      amendment_count: amendments.length,
    },
    notice,
  };
}
