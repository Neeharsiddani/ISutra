// ============================================================
// ISutra: Phase 9A — Verified BIS Lifecycle & Amendment Test Suite
// Rigorous evidence audit for lifecycle, reaffirmation, and amendment datasets
// ============================================================

import assert from 'node:assert';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import {
  VERIFIED_STANDARD_LIFECYCLES,
  getVerifiedLifecycle,
} from './dist/database/verifiedStandardLifecycles.js';
import {
  VERIFIED_STANDARD_AMENDMENTS,
  getVerifiedAmendments,
} from './dist/database/verifiedStandardAmendments.js';
import { VERIFIED_RELATIONSHIPS } from './dist/database/verifiedRelationships.js';
import { DEMO_AMENDMENTS } from './dist/database/demoData.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE 9A — EVIDENCE AUDIT & VERIFICATION SUITE');
console.log('===========================================================');

let passCount = 0;
function testAssert(condition, message) {
  assert(condition, message);
  passCount++;
  console.log(`  ✓ ${message}`);
}

async function runPhase9ATests() {
  // ------------------------------------------------------------
  // TEST A & J: Standard Dataset Protection & Integrity
  // ------------------------------------------------------------
  console.log('\nTest A & J: Verifying Verified Standards Dataset Invariance...');
  testAssert(
    VERIFIED_BIS_STANDARDS.length === 40,
    `verifiedStandards.ts must remain completely frozen with 40 records (found: ${VERIFIED_BIS_STANDARDS.length})`
  );

  const stdMap = new Map(VERIFIED_BIS_STANDARDS.map((s) => [s.id, s]));

  // ------------------------------------------------------------
  // TEST A: Lifecycle Standard ID & Number Consistency
  // ------------------------------------------------------------
  console.log('\nTest A: Verifying Lifecycle Standard IDs & Numbers Match Frozen Dataset...');
  for (const lc of VERIFIED_STANDARD_LIFECYCLES) {
    testAssert(
      stdMap.has(lc.standard_id),
      `Lifecycle standard_id '${lc.standard_id}' must exist in verifiedStandards.ts`
    );
    const matchedStd = stdMap.get(lc.standard_id);
    testAssert(
      matchedStd && matchedStd.standard_number === lc.standard_number,
      `Lifecycle standard_number '${lc.standard_number}' must exactly match standard_number in verifiedStandards.ts`
    );
  }

  // ------------------------------------------------------------
  // TEST B: Amendment Standard ID & Number Consistency
  // ------------------------------------------------------------
  console.log('\nTest B: Verifying Amendment Standard IDs & Numbers Match Frozen Dataset...');
  for (const amd of VERIFIED_STANDARD_AMENDMENTS) {
    testAssert(
      stdMap.has(amd.standard_id),
      `Amendment standard_id '${amd.standard_id}' must exist in verifiedStandards.ts`
    );
    const matchedStd = stdMap.get(amd.standard_id);
    testAssert(
      matchedStd && matchedStd.standard_number === amd.standard_number,
      `Amendment standard_number '${amd.standard_number}' must exactly match standard_number in verifiedStandards.ts`
    );
  }

  // ------------------------------------------------------------
  // TEST C: Lifecycle Records Source Evidence & Metadata
  // ------------------------------------------------------------
  console.log('\nTest C: Verifying Lifecycle Records Have Authentic Evidence & Metadata...');
  for (const lc of VERIFIED_STANDARD_LIFECYCLES) {
    testAssert(
      lc.evidence_description && lc.evidence_description.trim().length >= 25,
      `Lifecycle record ${lc.id} must have descriptive evidence text`
    );
    testAssert(
      lc.verified_source_url && lc.verified_source_url.startsWith('https://'),
      `Lifecycle record ${lc.id} must have valid authoritative HTTPS source URL`
    );
    testAssert(
      typeof lc.edition_year === 'number' && lc.edition_year >= 1950 && lc.edition_year <= 2030,
      `Lifecycle record ${lc.id} must have a valid edition_year`
    );
    testAssert(
      lc.last_verified_at && /^\d{4}-\d{2}-\d{2}$/.test(lc.last_verified_at),
      `Lifecycle record ${lc.id} must have valid ISO audit date in last_verified_at`
    );
    testAssert(
      ['current', 'reaffirmed', 'amended', 'under_revision', 'superseded', 'withdrawn', 'not_verified'].includes(
        lc.lifecycle_status
      ),
      `Lifecycle record ${lc.id} must have valid lifecycle_status enum value`
    );
  }

  // ------------------------------------------------------------
  // TEST D: Amendment Records Source Evidence & Provenance
  // ------------------------------------------------------------
  console.log('\nTest D: Verifying Amendment Records Have Authentic Evidence & Provenance...');
  for (const amd of VERIFIED_STANDARD_AMENDMENTS) {
    testAssert(
      amd.summary && amd.summary.trim().length >= 15,
      `Amendment ${amd.id} must have substantive summary text`
    );
    testAssert(
      amd.verified_source_url && amd.verified_source_url.startsWith('https://'),
      `Amendment ${amd.id} must have valid authoritative HTTPS source URL`
    );
    testAssert(
      amd.verification_status === 'verified',
      `Amendment ${amd.id} verification_status must strictly be 'verified'`
    );
    testAssert(
      Array.isArray(amd.affected_clauses),
      `Amendment ${amd.id} affected_clauses must be an array`
    );
  }

  // ------------------------------------------------------------
  // TEST E: Date Precision & No Fabricated Full Dates
  // ------------------------------------------------------------
  console.log('\nTest E: Verifying Date Precision (No Fabricated Days on Partial Dates)...');
  const dateRegex = /^\d{4}$|^\d{4}-\d{2}$|^\d{4}-\d{2}-\d{2}$/;
  for (const amd of VERIFIED_STANDARD_AMENDMENTS) {
    if (amd.publication_date) {
      testAssert(
        dateRegex.test(amd.publication_date),
        `Amendment ${amd.id} publication_date '${amd.publication_date}' must be valid YYYY, YYYY-MM, or YYYY-MM-DD`
      );
    }
    if (amd.establishment_date) {
      testAssert(
        dateRegex.test(amd.establishment_date),
        `Amendment ${amd.id} establishment_date '${amd.establishment_date}' must be valid YYYY, YYYY-MM, or YYYY-MM-DD`
      );
    }
    if (amd.effective_date) {
      testAssert(
        dateRegex.test(amd.effective_date),
        `Amendment ${amd.id} effective_date '${amd.effective_date}' must be valid YYYY, YYYY-MM, or YYYY-MM-DD`
      );
    }
  }

  // ------------------------------------------------------------
  // TEST F: Non-Exhaustive Zero-Amendment Statements (No "0 amendments exist")
  // ------------------------------------------------------------
  console.log('\nTest F: Verifying Non-Exhaustive Language on Standards Without Amendments...');
  for (const lc of VERIFIED_STANDARD_LIFECYCLES) {
    const desc = lc.evidence_description.toLowerCase();
    testAssert(
      !desc.includes('0 amendments issued') && !desc.includes('no amendments exist'),
      `Lifecycle ${lc.id} must not make an exhaustive negative claim (no "0 amendments issued")`
    );
  }

  // ------------------------------------------------------------
  // TEST G: One-to-Many Amendment Architecture & Cardinality Separation
  // ------------------------------------------------------------
  console.log('\nTest G: Verifying Separate Lifecycle and Amendment Cardinality...');
  const is456Amendments = getVerifiedAmendments('bis-is-456-2000');
  testAssert(
    is456Amendments.length === 6,
    `IS 456:2000 must have exactly 6 distinct amendment records (got: ${is456Amendments.length})`
  );
  testAssert(
    is456Amendments.map((a) => a.amendment_number).join(',') === '1,2,3,4,5,6',
    'IS 456:2000 amendments must be numbered 1 through 6 in chronological order'
  );

  const is1786Amendments = getVerifiedAmendments('bis-is-1786-2008');
  testAssert(
    is1786Amendments.length === 4,
    `IS 1786:2008 must have exactly 4 distinct amendment records (got: ${is1786Amendments.length})`
  );

  // ------------------------------------------------------------
  // TEST H: Reaffirmation is Never Represented as an Amendment
  // ------------------------------------------------------------
  console.log('\nTest H: Verifying Reaffirmation is Never Stored as an Amendment...');
  for (const amd of VERIFIED_STANDARD_AMENDMENTS) {
    const label = amd.amendment_label.toLowerCase();
    const summary = amd.summary.toLowerCase();
    testAssert(
      !label.includes('reaffirm') && !summary.startsWith('reaffirm'),
      `Amendment ${amd.id} must be an authentic amendment, not a reaffirmation`
    );
  }
  const is456Lifecycle = getVerifiedLifecycle('bis-is-456-2000');
  testAssert(
    is456Lifecycle && is456Lifecycle.lifecycle_status === 'reaffirmed' && is456Lifecycle.reaffirmation_year === 2025,
    'Reaffirmation of IS 456:2000 is correctly recorded in lifecycle dataset (2025)'
  );

  // ------------------------------------------------------------
  // TEST I: Revision / Supersession Directionality & Truthful Representation
  // ------------------------------------------------------------
  console.log('\nTest I: Verifying Revision and Supersession Directionality...');
  const is7098Amendments = getVerifiedAmendments('bis-is-7098-1-2025');
  testAssert(
    is7098Amendments.length === 0,
    'IS 7098 (Part 1):2025 has 0 amendments because it is a new revision, not an amendment'
  );
  const is7098Lifecycle = getVerifiedLifecycle('bis-is-7098-1-2025');
  testAssert(
    is7098Lifecycle && is7098Lifecycle.supersedes_standard_number === 'IS 7098 (Part 1):1988',
    'IS 7098 (Part 1):2025 correctly supersedes 1988 edition, not reverse direction'
  );
  testAssert(
    is7098Lifecycle && is7098Lifecycle.transition_end_date === '2025-12-09',
    'IS 7098 (Part 1):2025 transition cutoff is precisely 2025-12-09 from BIS circular'
  );

  // ------------------------------------------------------------
  // TEST J: Phase 8B Relationships Invariance
  // ------------------------------------------------------------
  console.log('\nTest J: Verifying Phase 8B Verified Relationships Invariance...');
  testAssert(
    VERIFIED_RELATIONSHIPS.length === 6,
    `VERIFIED_RELATIONSHIPS must remain unchanged with exactly 6 records (got: ${VERIFIED_RELATIONSHIPS.length})`
  );

  // ------------------------------------------------------------
  // TEST K: No Demo Data Leakage into Verified Amendments
  // ------------------------------------------------------------
  console.log('\nTest K: Verifying Zero Demo Data Leakage into Verified Datasets...');
  for (const amd of VERIFIED_STANDARD_AMENDMENTS) {
    testAssert(
      !amd.id.startsWith('demo-'),
      `Verified amendment ${amd.id} must not use demo ID prefix`
    );
    testAssert(
      !DEMO_AMENDMENTS.some((da) => da.id === amd.id || da.amendment_number === amd.amendment_label),
      `Verified amendment ${amd.id} must not collide with demo amendment records`
    );
  }

  // ------------------------------------------------------------
  // TEST L: No Empty / Fabricated URLs
  // ------------------------------------------------------------
  console.log('\nTest L: Verifying No Empty or Fabricated URLs...');
  const allUrls = [
    ...VERIFIED_STANDARD_LIFECYCLES.map((l) => l.verified_source_url),
    ...VERIFIED_STANDARD_AMENDMENTS.map((a) => a.verified_source_url),
  ];
  for (const url of allUrls) {
    testAssert(
      url && (url.includes('bis.gov.in') || url.includes('services.bis.gov.in')),
      `URL '${url}' must point to an official BIS portal`
    );
  }

  // ------------------------------------------------------------
  // TEST M: No Lifecycle Record Claims "Latest" Solely from edition_year
  // ------------------------------------------------------------
  console.log('\nTest M: Verifying No Lifecycle Record Claims "Latest" Solely from edition_year...');
  for (const lc of VERIFIED_STANDARD_LIFECYCLES) {
    testAssert(
      lc.lifecycle_status !== 'latest',
      `Lifecycle record ${lc.id} must use precise lifecycle_status enum, never generic 'latest'`
    );
    testAssert(
      lc.evidence_description && lc.evidence_description.trim().length >= 25,
      `Lifecycle record ${lc.id} must ground status in substantive descriptive evidence, not bare year`
    );
    if (lc.lifecycle_status === 'current') {
      testAssert(
        Boolean(lc.supersedes_standard_number || lc.transition_end_date || lc.evidence_description.includes('Revision') || lc.evidence_description.includes('Published')),
        `Current lifecycle record ${lc.id} must cite explicit supersession, transition, or revision evidence`
      );
    }
  }

  // ------------------------------------------------------------
  // DATA QUALITY SUMMARY
  // ------------------------------------------------------------
  console.log('\n===========================================================');
  console.log('📊 PHASE 9A DATA QUALITY SUMMARY');
  console.log('===========================================================');

  const lifecycleStdIds = new Set(VERIFIED_STANDARD_LIFECYCLES.map((l) => l.standard_id));
  const amendmentStdIds = new Set(VERIFIED_STANDARD_AMENDMENTS.map((a) => a.standard_id));
  const totalStandards = VERIFIED_BIS_STANDARDS.length;
  const unamendedStandardsCount = totalStandards - amendmentStdIds.size;

  console.log(`Verified lifecycle records: ${VERIFIED_STANDARD_LIFECYCLES.length}`);
  console.log(`Verified amendment records: ${VERIFIED_STANDARD_AMENDMENTS.length}`);
  console.log(`Standards with lifecycle evidence: ${lifecycleStdIds.size}`);
  console.log(`Standards with amendment evidence: ${amendmentStdIds.size}`);
  console.log(`Standards without verified amendment evidence: ${unamendedStandardsCount}`);
  console.log('===========================================================');

  console.log(`\n🎉 ALL ${passCount} PHASE 9A ASSERTIONS PASSED SUCCESSFULLY!`);
}

runPhase9ATests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
