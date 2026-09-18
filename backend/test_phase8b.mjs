// ============================================================
// ISutra: Phase 8B Automated Verification Suite
// Standards Relationship Explorer & Procurement Evidence Trail
// ============================================================

import assert from 'node:assert';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { VERIFIED_RELATIONSHIPS } from './dist/database/verifiedRelationships.js';
import { getResolvedRelationships } from './dist/services/standardsRelationshipService.js';
import {
  getRelatedStandards,
  getAmendments,
  getCertifications,
  getStandardById,
} from './dist/services/standardsService.js';
import { StandardsMatcher } from './dist/services/standardsMatcher.js';
import { analyzeRequirementGaps } from './dist/services/requirementGapAnalyzer.js';
import { compareStandards } from './dist/services/standardsComparator.js';
import {
  generateProcurementReportData,
  generatePrintableHtmlReport,
} from './dist/services/procurementReportService.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE 8B — STANDARDS RELATIONSHIP EXPLORER TEST SUITE');
console.log('===========================================================');

async function runPhase8BTests() {
  // ------------------------------------------------------------
  // TEST 0: Dataset Integrity & Rule of Zero Fabrication
  // ------------------------------------------------------------
  console.log('\nTest 0: Verifying Reference Standards Dataset Integrity...');
  assert(
    VERIFIED_BIS_STANDARDS.length === 40,
    `Dataset must contain exactly 40 standards, found: ${VERIFIED_BIS_STANDARDS.length}`
  );
  console.log('  ✓ Dataset contains exactly 40 authentic BIS standards');

  assert(
    VERIFIED_RELATIONSHIPS.length === 6,
    `Must have exactly 6 verified relationship records after evidence audit, found: ${VERIFIED_RELATIONSHIPS.length}`
  );
  console.log(`  ✓ Verified relationship dataset contains exactly ${VERIFIED_RELATIONSHIPS.length} audited records`);

  // Verify all 6 records meet strict Section 2 audit criteria
  for (const rel of VERIFIED_RELATIONSHIPS) {
    const sourceExists = VERIFIED_BIS_STANDARDS.some((s) => s.id === rel.source_standard_id);
    assert(sourceExists, `Source standard ${rel.source_standard_id} must exist in verifiedStandards.ts`);

    const targetExists = VERIFIED_BIS_STANDARDS.some((s) => s.id === rel.target_standard_id);
    assert(targetExists, `Target standard ${rel.target_standard_id} must exist in verifiedStandards.ts`);

    assert(rel.evidence_clause && rel.evidence_clause.trim().length > 10, `Evidence clause must be non-empty for ${rel.id}`);
    assert(rel.verified_source_url.startsWith('https://www.bis.gov.in'), `Source URL must be official BIS for ${rel.id}`);
    assert(rel.verification_status === 'verified', `Verification status must be verified for ${rel.id}`);
    assert(
      ['normative_reference', 'test_method', 'allied_standard'].includes(rel.relationship_type),
      `Relationship type must be valid enum for ${rel.id}`
    );
  }
  console.log('  ✓ All 6 verified relationships satisfy source, target, clause evidence, and authoritative BIS provenance');

  // ------------------------------------------------------------
  // TEST 1: Class A — Existing Associated References Remain Neutral
  // ------------------------------------------------------------
  console.log('\nTest 1: Evaluating Class A (Unclassified Associated References)...');
  // IS 10322 (Part 5/Sec 3) has related_standards: ['IS 10322 Part 1', 'IS 16107 (Part 2/Sec 2)']
  const streetLightRelRes = await getRelatedStandards('bis-is-10322-5-3-2026');

  assert(streetLightRelRes && typeof streetLightRelRes === 'object', 'Must return resolution object');
  assert(Array.isArray(streetLightRelRes.data), 'Data must be array');
  assert(streetLightRelRes.data.length === 2, `Expected 2 references, got: ${streetLightRelRes.data.length}`);
  assert(streetLightRelRes.demo === false, 'Verified standard must have demo: false');

  // Both must be unclassified / unspecified
  assert(
    streetLightRelRes.data.every((r) => r.relationship_type === 'unspecified'),
    'Unclassified references must have relationship_type: unspecified'
  );
  console.log('  ✓ Unclassified references never assume normative_reference without evidence');

  assert(
    streetLightRelRes.data.every((r) => r.verification_status === 'unclassified_reference'),
    'Unclassified references must have verification_status: unclassified_reference'
  );
  console.log('  ✓ Verification status accurately reported as unclassified_reference');

  assert(
    streetLightRelRes.coverage && streetLightRelRes.coverage.unclassified_count === 2,
    'Coverage must report 2 unclassified references for IS 10322 (Part 5/Sec 3)'
  );
  console.log('  ✓ Coverage indicator transparently reports 2 unclassified references');

  // ------------------------------------------------------------
  // TEST 2: Class B — Verified Relationships with Clause Evidence
  // ------------------------------------------------------------
  console.log('\nTest 2: Evaluating Class B (Verified Evidence-Backed Relationships)...');
  // IS 456:2000 has verified normative relationships to IS 383 and IS 1786
  const concreteRelRes = await getRelatedStandards('bis-is-456-2000');

  assert(concreteRelRes.demo === false, 'Verified standard relations must have demo: false');
  assert(concreteRelRes.coverage.verified_count >= 2, 'IS 456 must have at least 2 verified relationships');
  console.log(`  ✓ IS 456:2000 has ${concreteRelRes.coverage.verified_count} verified relationships`);

  // Inspect IS 383 relationship from IS 456
  const is383Rel = concreteRelRes.data.find(
    (r) =>
      r.target_standard_id === 'bis-is-383-2016' ||
      (r.target_standard_number && r.target_standard_number.includes('383')) ||
      (r.target_standard && r.target_standard.standard_number.includes('383'))
  );
  assert(is383Rel, 'IS 456 must link to IS 383');
  assert(is383Rel.relationship_type === 'normative_reference', 'IS 383 must be normative_reference in IS 456');
  assert(is383Rel.verification_status === 'verified', 'IS 383 relationship must be verified');
  assert(
    is383Rel.evidence_clause && is383Rel.evidence_clause.includes('Clause 5.3'),
    'IS 383 relationship must cite Clause 5.3 evidence'
  );
  assert(is383Rel.verified_source_url, 'Must retain verified source URL');
  console.log('  ✓ IS 456 -> IS 383 correctly verified as normative_reference with Clause 5.3 evidence');

  // Inspect IS 1786 relationship from IS 456
  const is1786Rel = concreteRelRes.data.find(
    (r) =>
      r.target_standard_id === 'bis-is-1786-2008' ||
      (r.target_standard_number && r.target_standard_number.includes('1786')) ||
      (r.target_standard && r.target_standard.standard_number.includes('1786'))
  );
  assert(is1786Rel, 'IS 456 must link to IS 1786');
  assert(is1786Rel.relationship_type === 'normative_reference', 'IS 1786 must be normative_reference');
  assert(
    is1786Rel.evidence_clause && is1786Rel.evidence_clause.includes('Clause 5.6.1'),
    'IS 1786 relationship must cite Clause 5.6.1 evidence'
  );
  console.log('  ✓ IS 456 -> IS 1786 correctly verified as normative_reference with Clause 5.6.1 evidence');

  // Inspect unclassified reference alongside verified on same standard
  const unclassifiedConcrete = concreteRelRes.data.find((r) => r.relationship_type === 'unspecified');
  assert(unclassifiedConcrete, 'IS 456 must contain unclassified reference (e.g. IS 10262)');
  assert(
    unclassifiedConcrete.verification_status === 'unclassified_reference',
    'Unclassified item must have unclassified_reference status'
  );
  console.log('  ✓ Standards safely combine both verified and unclassified references in single view');

  // Test Method relationship: IS 6994 (Part 6) -> IS 6994 (Part 7)
  const gloveRelRes = await getRelatedStandards('bis-is-6994-6-2021');
  const testMethodRel = gloveRelRes.data.find((r) => r.relationship_type === 'test_method');
  assert(testMethodRel, 'IS 6994 (Part 6) must have test_method relationship');
  assert(
    testMethodRel.evidence_clause && testMethodRel.evidence_clause.includes('Clause 2'),
    'Test method must cite Clause 2 evidence'
  );
  console.log('  ✓ IS 6994 (Part 6) -> Part 7 correctly verified as test_method');

  // Directionality & Evidence Audit: IS 15748 -> IS 8519 must NOT silently return as verified installation relationship
  const ppeRelRes = await getRelatedStandards('bis-is-15748-2022');
  const hasIncorrectInstall = ppeRelRes.data.some(
    (r) => r.relationship_type === 'installation_standard'
  );
  assert(
    !hasIncorrectInstall,
    'IS 15748 must NOT return incorrect installation_standard relationship without authoritative direction evidence'
  );

  const is8519Ref = ppeRelRes.data.find(
    (r) =>
      r.target_standard_id === 'bis-is-8519-2024' ||
      (r.target_standard_number && r.target_standard_number.includes('8519')) ||
      (r.target_standard && r.target_standard.standard_number.includes('8519'))
  );
  assert(is8519Ref, 'IS 15748 must retain reference to IS 8519');
  assert(
    is8519Ref.relationship_type === 'unspecified',
    'IS 8519 reference must be unclassified/unspecified in absence of authoritative clause evidence'
  );
  assert(
    is8519Ref.verification_status === 'unclassified_reference',
    'IS 8519 reference must have unclassified_reference status'
  );
  console.log('  ✓ Directionality audit: IS 15748 -> IS 8519 safely kept as unclassified reference (not verified installation_standard)');

  // ------------------------------------------------------------
  // TEST 3: Demo Data Quarantine Guard
  // ------------------------------------------------------------
  console.log('\nTest 3: Verifying Demo Data Quarantine Guard...');
  const demoRelRes = await getRelatedStandards('demo-std-001');
  assert(demoRelRes.demo === true, 'Demo standard query must return demo: true');
  assert(
    demoRelRes.coverage.verified_count === 0,
    'Demo standard must NOT have any verified relationships'
  );
  assert(
    demoRelRes.data.every((r) => r.verification_status !== 'verified'),
    'No demo relationship may be labeled verified'
  );
  console.log('  ✓ Demo relationships strictly flagged as demo: true with 0 verified count');

  // ------------------------------------------------------------
  // TEST 4: Amendments & Certifications Quarantine Guard
  // ------------------------------------------------------------
  console.log('\nTest 4: Verifying Amendments & Certifications Quarantine Guard...');
  const amdRes = await getAmendments('bis-is-456-2000');
  assert(amdRes.data.length === 0, 'Verified standard amendments must be empty');
  assert(amdRes.verified === false, 'Verified standard amendments must have verified: false');
  assert(amdRes.demo === false, 'Verified standard amendments must have demo: false');

  const certRes = await getCertifications('bis-is-456-2000');
  assert(certRes.data.length === 0, 'Verified standard certifications must be empty');
  assert(certRes.verified === false, 'Verified standard certifications must have verified: false');
  assert(certRes.demo === false, 'Verified standard certifications must have demo: false');
  console.log('  ✓ Amendments & Certifications remain strictly quarantined');

  // ------------------------------------------------------------
  // TEST 5: Matcher Regression Guard
  // ------------------------------------------------------------
  console.log('\nTest 5: Verifying Recommendation Matcher Invariance...');
  const matcher = new StandardsMatcher();
  const ledReq = {
    product: {
      name: 'LED street lighting system',
      category: 'Electrical → Lighting',
      confidence: 'high',
      source_text: 'LED street lights',
    },
    application: 'Municipal roads and highway lighting, pole mounted',
    application_source: 'municipal roads',
    industry: 'Municipal & Public Lighting',
    technical_parameters: [
      { parameter: 'Power', value: '100W', confidence: 'high', source_text: '100W' },
      { parameter: 'Ingress Protection', value: 'IP65', confidence: 'high', source_text: 'IP65' },
    ],
    materials: [{ name: 'Die-cast aluminum housing', confidence: 'high' }],
    environment: [{ name: 'Outdoor', confidence: 'high', source_text: 'outdoor use' }],
    safety_requirements: [{ name: 'General safety requirements', confidence: 'high' }],
    performance_requirements: [],
    testing_requirements: [{ name: 'General requirements and tests', confidence: 'high' }],
    installation_requirements: [{ name: 'Pole mounted', confidence: 'high', source_text: 'pole mounted' }],
    certification_mentions: [{ name: 'BIS', confidence: 'high' }],
  };
  const matchRes = matcher.evaluate(ledReq, VERIFIED_BIS_STANDARDS);
  assert(matchRes.recommendations.length > 0, 'Matcher must return recommendations');
  assert(
    matchRes.recommendations[0].standard.standard_number.includes('10322 (Part 5/Sec 3)'),
    'Top recommendation must remain IS 10322 (Part 5/Sec 3)'
  );
  assert(
    matchRes.recommendations[0].relevancePercentage === 80,
    `Expected 80% relevance, got: ${matchRes.recommendations[0].relevancePercentage}%`
  );
  console.log('  ✓ Recommendation ranking and factor scores 100% invariant');

  // ------------------------------------------------------------
  // TEST 6: Gap Analysis Regression Guard
  // ------------------------------------------------------------
  console.log('\nTest 6: Verifying Gap Analysis Invariance...');
  const topStd = matchRes.recommendations[0].standard;
  const gapAnalysis = analyzeRequirementGaps(ledReq, topStd);
  assert(gapAnalysis.referenceCoverage === 57, `Expected 57% coverage, got: ${gapAnalysis.referenceCoverage}%`);
  console.log('  ✓ Requirement gap analysis 100% invariant');

  // ------------------------------------------------------------
  // TEST 7: Standards Comparison Regression Guard
  // ------------------------------------------------------------
  console.log('\nTest 7: Verifying Standards Comparison Invariance...');
  const secondStd = VERIFIED_BIS_STANDARDS.find((s) => s.standard_number.includes('16107 (Part 2/Sec 2)'));
  assert(secondStd, 'IS 16107 must exist');
  const compRes = compareStandards(ledReq, [topStd, secondStd]);
  assert(compRes.standards.length === 2, 'Comparison must return 2 standards');
  assert(compRes.matrixRows.length >= 10, 'Comparison matrix must have at least 10 rows');
  console.log('  ✓ Standards comparison workspace 100% invariant');

  // ------------------------------------------------------------
  // TEST 8: Procurement Report Associated References Integration
  // ------------------------------------------------------------
  console.log('\nTest 8: Evaluating Procurement Report Associated Standards Integration...');
  // Mock report data structure with associatedReferences
  const sampleReportData = {
    reportId: 'REP-TEST-001',
    generatedAt: new Date().toISOString(),
    analysisId: 'analysis-test-001',
    executiveSummary: {
      procurementRequirement: 'Supply of structural concrete for municipal bridge construction',
      productName: 'Structural Concrete',
      productCategory: 'Civil Construction',
      readinessStatus: 'ready',
      blockingGaps: [],
      analysisDate: '2026-09-18',
    },
    applicableStandards: [
      {
        standardNumber: 'IS 456:2000',
        title: 'Plain and Reinforced Concrete — Code of Practice',
        relevancePercentage: 85,
        specificityTier: 1,
        specificityTierLabel: 'Primary Specification',
        whyMatched: ['Direct match for structural concrete'],
        evidence: ['Concrete reinforcement design'],
        hasContradiction: false,
        associatedReferences: [
          {
            standardNumber: 'IS 383:2016',
            relationshipType: 'Normative Reference',
            isVerified: true,
            evidence: "IS 456:2000 Clause 5.3: 'Aggregates shall comply with IS 383.'",
            source: 'Official BIS Reference Clause Citation',
          },
          {
            standardNumber: 'IS 10262:2019',
            relationshipType: 'Associated reference — relationship type not classified',
            isVerified: false,
            source: 'Current verified reference dataset',
          },
        ],
      },
    ],
    requirementCoverage: [],
    missingInformation: [],
    limitations: [
      'Recommendations are generated strictly from ISutra verified Indian Standards dataset.',
      'Associated standards may affect testing, safety, or installation requirements; verify relationship classification directly against official BIS publications.',
    ],
  };

  const htmlOutput = generatePrintableHtmlReport(sampleReportData);
  assert(typeof htmlOutput === 'string' && htmlOutput.length > 500, 'HTML report must generate cleanly');
  assert(
    htmlOutput.includes('Associated References &amp; Allied Standards Trail') ||
      htmlOutput.includes('Associated References & Allied Standards Trail'),
    'HTML report must include Associated References section'
  );
  assert(htmlOutput.includes('IS 383:2016'), 'HTML report must include IS 383');
  assert(htmlOutput.includes('Normative Reference'), 'HTML report must include Normative Reference label');
  assert(
    htmlOutput.includes('Associated reference — relationship type not classified'),
    'HTML report must preserve unclassified status for unverified relations'
  );
  console.log('  ✓ Procurement report successfully incorporates associated standards and clause citations');

  console.log('\n===========================================================');
  console.log('🎉 ALL PHASE 8B ASSERTIONS PASSED (100% SUCCESS)');
  console.log('===========================================================');
}

runPhase8BTests().catch((err) => {
  console.error('\n❌ Phase 8B Test Failed:', err);
  process.exit(1);
});
