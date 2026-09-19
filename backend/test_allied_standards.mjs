// ============================================================
// ISutra: SIH26108 Allied Standards Intelligence Test Suite
// Evidence-Backed Standards Relationship Explorer & Audit Verification
// ============================================================

import assert from 'node:assert';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { VERIFIED_RELATIONSHIPS } from './dist/database/verifiedRelationships.js';
import { getResolvedRelationships } from './dist/services/standardsRelationshipService.js';
import { getRelatedStandards } from './dist/services/standardsService.js';
import {
  generateProcurementReportData,
  generatePrintableHtmlReport,
} from './dist/services/procurementReportService.js';

console.log('===========================================================');
console.log('🔬 ISUTRA — ALLIED STANDARDS INTELLIGENCE TEST SUITE');
console.log('===========================================================');

let testCount = 0;
function testAssert(condition, message) {
  assert(condition, message);
  testCount++;
  console.log(`  ✓ ${message}`);
}

async function runAlliedStandardsTests() {
  // ------------------------------------------------------------
  // TEST 1: Verified Relationships with Strict Evidence Trail
  // ------------------------------------------------------------
  console.log('\nTest 1: Verifying Authoritative Evidence-Backed Relationships...');
  testAssert(VERIFIED_RELATIONSHIPS.length === 6, 'Exactly 6 verified relationship records exist in dataset');

  // Test IS 456:2000 relationships
  const is456Res = getResolvedRelationships('bis-is-456-2000');
  testAssert(is456Res.demo === false, 'IS 456 relationships must not be demo data');
  testAssert(is456Res.coverage.verified_count >= 3, 'IS 456 must have at least 3 verified relationships');

  const is383Rel = is456Res.data.find((r) => r.target_standard_number?.includes('383') || r.target_standard_id?.includes('383'));
  testAssert(is383Rel !== undefined, 'IS 456 must link to IS 383 (Aggregates)');
  testAssert(is383Rel.relationship_type === 'normative_reference', 'IS 383 is classified as normative_reference');
  testAssert(is383Rel.verification_status === 'verified', 'IS 383 is verified');
  testAssert(is383Rel.evidence_clause.includes('Clause 5.3'), 'IS 383 relationship cites Clause 5.3 evidence');
  testAssert(is383Rel.source_standard_id === 'bis-is-456-2000', 'IS 383 relationship contains source_standard_id');
  testAssert(is383Rel.source_standard_number === 'IS 456:2000', 'IS 383 relationship contains source_standard_number');
  testAssert(is383Rel.source_standard !== undefined, 'IS 383 relationship contains resolved source_standard');
  testAssert(is383Rel.target_standard !== undefined, 'IS 383 relationship contains resolved target_standard');
  testAssert(is383Rel.verified_source_url.startsWith('https://www.bis.gov.in'), 'IS 383 has official BIS source URL');

  const is1786Rel = is456Res.data.find((r) => r.target_standard_number?.includes('1786') || r.target_standard_id?.includes('1786'));
  testAssert(is1786Rel !== undefined, 'IS 456 must link to IS 1786 (TMT Rebars)');
  testAssert(is1786Rel.relationship_type === 'normative_reference', 'IS 1786 is classified as normative_reference');
  testAssert(is1786Rel.evidence_clause.includes('Clause 5.6.1'), 'IS 1786 relationship cites Clause 5.6.1 evidence');

  const is432Rel = is456Res.data.find((r) => r.target_standard_number?.includes('432') || r.target_standard_id?.includes('432'));
  testAssert(is432Rel !== undefined, 'IS 456 must link to IS 432 (Part 1)');
  testAssert(is432Rel.relationship_type === 'normative_reference', 'IS 432 is classified as normative_reference');
  testAssert(is432Rel.evidence_clause.includes('Clause 5.6.1'), 'IS 432 relationship cites Clause 5.6.1 evidence');

  // Test IS 6994 (Part 6) test method relationship
  const is6994Res = getResolvedRelationships('bis-is-6994-6-2021');
  const testMethodRel = is6994Res.data.find((r) => r.relationship_type === 'test_method');
  testAssert(testMethodRel !== undefined, 'IS 6994 (Part 6) has test_method relationship');
  testAssert(testMethodRel.target_standard_number.includes('Part 7'), 'IS 6994 (Part 6) test method links to Part 7');
  testAssert(testMethodRel.evidence_clause.includes('Clause 2'), 'IS 6994 (Part 6) test method cites Clause 2');

  // ------------------------------------------------------------
  // TEST 2: Associated Unclassified References Never Guess Normative
  // ------------------------------------------------------------
  console.log('\nTest 2: Verifying Associated Unclassified References Neutrality...');
  const is10322Res = getResolvedRelationships('bis-is-10322-5-3-2026');
  testAssert(is10322Res.data.length === 2, 'IS 10322 (Part 5/Sec 3) has 2 associated references');
  testAssert(
    is10322Res.data.every((r) => r.relationship_type === 'unspecified'),
    'Unclassified references must have relationship_type: unspecified'
  );
  testAssert(
    is10322Res.data.every((r) => r.verification_status === 'unclassified_reference'),
    'Unclassified references must have verification_status: unclassified_reference'
  );
  testAssert(
    is10322Res.data.every((r) => !r.evidence_clause),
    'Unclassified references must not fabricate an evidence_clause'
  );

  // ------------------------------------------------------------
  // TEST 3: Missing Relationship Evidence Handling
  // ------------------------------------------------------------
  console.log('\nTest 3: Verifying Missing & Non-Existent Standards Handling...');
  const nonexistentRes = getResolvedRelationships('bis-is-nonexistent-9999');
  testAssert(nonexistentRes.data.length === 0, 'Non-existent standard returns empty data array');
  testAssert(nonexistentRes.coverage.total === 0, 'Non-existent standard reports 0 total relationships');
  testAssert(nonexistentRes.coverage.verified_count === 0, 'Non-existent standard reports 0 verified relationships');
  testAssert(nonexistentRes.procurement_guidance.includes('Bureau of Indian Standards'), 'Non-existent standard includes BIS catalogue guidance');

  // ------------------------------------------------------------
  // TEST 4: Invalid/Fabricated Relationship Rejection
  // ------------------------------------------------------------
  console.log('\nTest 4: Verifying Fabricated Relationships Rejection...');
  const ppeRes = getResolvedRelationships('bis-is-15748-2022');
  const falseInstallationRel = ppeRes.data.find((r) => r.relationship_type === 'installation_standard');
  testAssert(falseInstallationRel === undefined, 'IS 15748 must NOT be incorrectly classified as installation_standard');

  const falseNormativeRel = ppeRes.data.find((r) => r.relationship_type === 'normative_reference');
  testAssert(falseNormativeRel === undefined, 'IS 15748 must NOT be incorrectly classified as normative_reference');

  // Ensure total verified relationships in all 40 standards exactly matches audited baseline
  let totalVerifiedInAllStandards = 0;
  for (const std of VERIFIED_BIS_STANDARDS) {
    const res = getResolvedRelationships(std.id);
    totalVerifiedInAllStandards += res.data.filter((r) => r.verification_status === 'verified').length;
  }
  testAssert(totalVerifiedInAllStandards === 6, `Total verified relationships across entire dataset must equal 6 (found ${totalVerifiedInAllStandards})`);

  // ------------------------------------------------------------
  // TEST 5: Deterministic Ordering
  // ------------------------------------------------------------
  console.log('\nTest 5: Verifying Deterministic Ordering...');
  const mixedRes = getResolvedRelationships('bis-is-456-2000');
  // Verified items should always precede unclassified items
  let seenUnclassified = false;
  let orderingIsConsistent = true;
  for (const rel of mixedRes.data) {
    if (rel.verification_status === 'unclassified_reference') {
      seenUnclassified = true;
    } else if (seenUnclassified && rel.verification_status === 'verified') {
      orderingIsConsistent = false;
      break;
    }
  }
  testAssert(orderingIsConsistent, 'Verified relationships are strictly ordered before unclassified references');

  // Repeated queries produce identical ordering
  const secondRun = getResolvedRelationships('bis-is-456-2000');
  testAssert(
    JSON.stringify(mixedRes.data.map((r) => r.id)) === JSON.stringify(secondRun.data.map((r) => r.id)),
    'Repeated relationship queries produce identical deterministic ordering'
  );

  // ------------------------------------------------------------
  // TEST 6: Official Source Preservation
  // ------------------------------------------------------------
  console.log('\nTest 6: Verifying Official Source URL Preservation...');
  for (const rel of VERIFIED_RELATIONSHIPS) {
    testAssert(
      rel.verified_source_url.startsWith('https://www.bis.gov.in') ||
        rel.verified_source_url.startsWith('https://services.bis.gov.in'),
      `Verified relationship ${rel.id} has valid HTTPS BIS source URL`
    );
  }

  for (const rel of mixedRes.data) {
    testAssert(
      rel.verified_source_url !== undefined && rel.verified_source_url.startsWith('https://'),
      `Relationship ${rel.id} preserves HTTPS official source URL (${rel.verified_source_url})`
    );
  }

  // ------------------------------------------------------------
  // TEST 7: Target Navigation Metadata
  // ------------------------------------------------------------
  console.log('\nTest 7: Verifying Relationship Navigation Metadata...');
  for (const rel of is456Res.data) {
    if (rel.target_standard) {
      testAssert(
        rel.target_standard.id && rel.target_standard.standard_number,
        `Target standard for ${rel.target_standard_number} is fully populated for navigation`
      );
    }
  }

  // ------------------------------------------------------------
  // TEST 8: Procurement Report Allied Standards Integration
  // ------------------------------------------------------------
  console.log('\nTest 8: Verifying Procurement Report Integration...');
  const mockReportData = {
    reportId: 'REP-ALLIED-001',
    generatedAt: new Date().toISOString(),
    analysisId: 'analysis-allied-001',
    executiveSummary: {
      procurementRequirement: 'Supply of structural concrete for bridge superstructure',
      productName: 'Structural Concrete',
      productCategory: 'Civil Construction',
      readinessStatus: 'ready',
      blockingGaps: [],
      analysisDate: '2026-09-19',
    },
    applicableStandards: [
      {
        standardNumber: 'IS 456:2000',
        title: 'Plain and Reinforced Concrete — Code of Practice',
        relevancePercentage: 88,
        whyMatched: ['Direct category match'],
        evidence: ['Reinforced concrete'],
        hasContradiction: false,
        associatedReferences: [
          {
            standardNumber: 'IS 383:2016',
            relationshipType: 'Normative Reference',
            isVerified: true,
            evidence: "IS 456:2000 Clause 5.3: 'Aggregates shall comply with IS 383.'",
            source: 'Official BIS Reference Clause Citation',
            verifiedSourceUrl: 'https://www.bis.gov.in/know-your-standard/?lang=en',
            parentStandard: 'IS 456:2000',
          },
          {
            standardNumber: 'IS 10262:2019',
            relationshipType: 'Associated reference — relationship type not classified',
            isVerified: false,
            source: 'Current verified reference dataset',
            verifiedSourceUrl: 'https://www.bis.gov.in/know-your-standard/?lang=en',
            parentStandard: 'IS 456:2000',
          },
        ],
      },
    ],
    requirementCoverage: [],
    missingInformation: [],
    limitations: [],
  };

  const html = generatePrintableHtmlReport(mockReportData);
  testAssert(
    html.includes('Associated References &amp; Allied Standards Trail') ||
      html.includes('Associated References & Allied Standards Trail'),
    'HTML report includes Associated References & Allied Standards Trail section'
  );
  testAssert(html.includes('IS 383:2016'), 'HTML report contains IS 383:2016');
  testAssert(html.includes('Normative Reference'), 'HTML report contains Normative Reference badge');
  testAssert(html.includes('Verify at BIS'), 'HTML report contains Verify at BIS action link');
  testAssert(html.includes('Clause 5.3'), 'HTML report contains Clause 5.3 evidence');

  console.log('\n===========================================================');
  console.log(`🎉 ALL ${testCount} ALLIED STANDARDS TESTS PASSED!`);
  console.log('===========================================================');
}

runAlliedStandardsTests().catch((err) => {
  console.error('\n❌ Allied Standards Test Failed:', err);
  process.exit(1);
});
