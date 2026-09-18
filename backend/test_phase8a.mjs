// ============================================================
// ISutra: Phase 8A — Trust Correction & Safe Foundation Suite
// Automated verification of relationship, amendment, and certification provenance
// ============================================================

import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import {
  getRelatedStandards,
  getAmendments,
  getCertifications,
  getStandardById,
} from './dist/services/standardsService.js';
import { DEMO_AMENDMENTS, DEMO_CERTIFICATIONS } from './dist/database/demoData.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE 8A — TRUST CORRECTION & PROVENANCE VERIFICATION');
console.log('===========================================================');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runPhase8aTests() {
  // ------------------------------------------------------------
  // TEST 0: Dataset Protection & Integrity
  // ------------------------------------------------------------
  console.log('\nTest 0: Verifying Reference Standards Dataset Integrity...');
  assert(
    VERIFIED_BIS_STANDARDS.length === 40,
    `Dataset must contain exactly 40 standards, found: ${VERIFIED_BIS_STANDARDS.length}`
  );
  assert(
    VERIFIED_BIS_STANDARDS.every((s) => s.id && s.standard_number && s.title && s.source_url),
    'All 40 standards must retain required authentic metadata fields'
  );

  // ------------------------------------------------------------
  // TEST 1: Related Standards Provenance & Neutrality
  // ------------------------------------------------------------
  console.log('\nTest 1: Evaluating Associated References for Verified Standard...');
  // IS 10322 (Part 5/Sec 3) has related_standards: ['IS 10322 Part 1', 'IS 16107 (Part 2/Sec 2)']
  const verifiedId = 'bis-is-10322-5-3-2026';
  const relatedRes = await getRelatedStandards(verifiedId);

  assert(relatedRes !== null && typeof relatedRes === 'object', 'getRelatedStandards must return an object');
  assert(Array.isArray(relatedRes.data), 'related standards data must be an array');
  assert(relatedRes.data.length === 2, `Expected exactly 2 associated references, got: ${relatedRes.data.length}`);
  assert(relatedRes.demo === false, 'Verified standard relations must have demo: false');

  // Verify relationship_type is NOT hardcoded as normative_reference
  const hasNormative = relatedRes.data.some((r) => r.relationship_type === 'normative_reference');
  assert(!hasNormative, 'Relationships must NOT be hardcoded as normative_reference');

  // Verify relationship_type is explicitly unspecified / unclassified
  const allUnspecified = relatedRes.data.every((r) => r.relationship_type === 'unspecified');
  assert(allUnspecified, 'Relationship type must be explicitly unspecified in current reference dataset');

  // Verify description reflects associated reference rather than normative assertion
  assert(
    relatedRes.data.every((r) => r.description.includes('Associated reference cited in')),
    'Relationship description must state it is an associated reference'
  );
  assert(
    relatedRes.data.every((r) => r.description.includes('relationship type not classified in current reference dataset')),
    'Description must explicitly note relationship type is not classified'
  );
  assert(
    relatedRes.data.every((r) => r.verification_status === 'unclassified_reference'),
    'Verification status must be marked as unclassified_reference'
  );

  // Test demo standard relations fallback
  const demoRelRes = await getRelatedStandards('demo-std-001');
  assert(demoRelRes.demo === true, 'Demo standard query must return demo: true');

  // ------------------------------------------------------------
  // TEST 2: Amendment Quarantine & Truthful Status
  // ------------------------------------------------------------
  console.log('\nTest 2: Evaluating Amendment Quarantine & Truthful Response...');
  const amdVerifiedRes = await getAmendments(verifiedId);

  assert(Array.isArray(amdVerifiedRes.data), 'Amendments data must be an array');
  assert(amdVerifiedRes.data.length === 0, 'Verified standard amendments must be empty in curated dataset');
  assert(amdVerifiedRes.verified === false, 'Amendments verified flag must be strictly false');
  assert(amdVerifiedRes.demo === false, 'Verified standard amendments must have demo: false');
  assert(
    typeof amdVerifiedRes.notice === 'string' &&
      amdVerifiedRes.notice.includes('Amendment intelligence is not currently verified'),
    'Amendments notice must state intelligence is not currently verified'
  );

  // Ensure no DEMO_AMENDMENTS leaks into verified standards
  const leakedDemo = amdVerifiedRes.data.some((a) =>
    DEMO_AMENDMENTS.some((da) => da.amendment_number === a.amendment_number)
  );
  assert(!leakedDemo, 'No demo amendment records may leak into verified standards');

  // Demo standard query must NEVER return demo: false
  const amdDemoRes = await getAmendments('demo-std-001');
  assert(amdDemoRes.demo === true, 'Demo standard amendments must return demo: true');
  assert(amdDemoRes.verified === false, 'Demo standard amendments must NOT be labeled verified');
  assert(
    amdDemoRes.notice.includes('Demo data'),
    'Demo standard amendments must carry explicit demo notice'
  );

  // ------------------------------------------------------------
  // TEST 3: Certification Quarantine & Truthful Status
  // ------------------------------------------------------------
  console.log('\nTest 3: Evaluating Certification Quarantine & Truthful Response...');
  const certVerifiedRes = await getCertifications(verifiedId);

  assert(Array.isArray(certVerifiedRes.data), 'Certifications data must be an array');
  assert(certVerifiedRes.data.length === 0, 'Verified standard certifications must be empty in curated dataset');
  assert(certVerifiedRes.verified === false, 'Certifications verified flag must be strictly false');
  assert(certVerifiedRes.demo === false, 'Verified standard certifications must have demo: false');
  assert(
    typeof certVerifiedRes.notice === 'string' &&
      certVerifiedRes.notice.includes('Mandatory certification applicability is not verified in the current dataset'),
    'Certifications notice must state applicability is not verified'
  );
  assert(
    certVerifiedRes.notice.includes('Quality Control Orders (QCOs)'),
    'Notice must direct users to Ministry Quality Control Orders (QCOs)'
  );

  // Ensure no DEMO_CERTIFICATIONS leaks into verified standards
  const leakedCert = certVerifiedRes.data.some((c) =>
    DEMO_CERTIFICATIONS.some((dc) => dc.certification_type === c.certification_type)
  );
  assert(!leakedCert, 'No demo certification records may leak into verified standards');

  // Demo standard query must NEVER return demo: false
  const certDemoRes = await getCertifications('demo-std-001');
  assert(certDemoRes.demo === true, 'Demo standard certifications must return demo: true');
  assert(certDemoRes.verified === false, 'Demo standard certifications must NOT be labeled verified');
  assert(
    certDemoRes.notice.includes('Demo data'),
    'Demo standard certifications must carry explicit demo notice'
  );

  // ------------------------------------------------------------
  // TEST 4: Standard Details Truthful Verification Date
  // ------------------------------------------------------------
  console.log('\nTest 4: Evaluating Truthful Metadata in Standard Details...');
  const stdDetail = await getStandardById(verifiedId);
  assert(stdDetail !== null, 'Verified standard must be found by ID');
  assert(stdDetail.data.last_verified === '2026-09-13', 'Standard must return authentic stored last_verified');
  assert(stdDetail.data.source_url.startsWith('https://'), 'Standard must retain verified official source URL');
  assert(
    typeof stdDetail.data.edition_year === 'number',
    'Standard edition_year must be numeric reference year'
  );

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------
  console.log('\n===========================================================');
  console.log(`🎉 PHASE 8A COMPLETE: ${passCount} PASSED / ${failCount} FAILED`);
  console.log('===========================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runPhase8aTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
