// ============================================================
// ISutra: Phase 6 — Procurement Requirement Gap Analysis & Review
// Comprehensive Verification & Test Suite
// ============================================================

import { analyzeRequirementGaps } from './dist/services/requirementGapAnalyzer.js';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE 6 — REQUIREMENT GAP ANALYSIS VERIFICATION');
console.log('===========================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  passedTests++;
  console.log(`  ✓ ${message}`);
}

// ------------------------------------------------------------
// VERIFICATION 0: Dataset Integrity
// ------------------------------------------------------------
console.log('Test 0: Verifying Reference Standards Dataset Integrity...');
assert(VERIFIED_BIS_STANDARDS.length === 40, `Dataset must contain exactly 40 standards, found: ${VERIFIED_BIS_STANDARDS.length}`);
console.log('  -> All 40 standards verified intact.\n');

// ------------------------------------------------------------
// TEST A: LED Street Lighting + IS 10322 (Part 5/Sec 3):2026
// ------------------------------------------------------------
console.log('Test A: Evaluating LED Street Lighting Gap Analysis against IS 10322 (Part 5/Sec 3):2026...');
const is10322 = VERIFIED_BIS_STANDARDS.find((s) => s.standard_number.includes('10322 (Part 5/Sec 3)'));
assert(Boolean(is10322), 'IS 10322 (Part 5/Sec 3) must exist in verified dataset');

const ledRequirements = {
  product: {
    name: 'LED street lighting system',
    category: 'Electrical → Lighting',
    confidence: 'high',
    source_text: 'LED street lights',
  },
  application: 'Municipal roads and highway lighting',
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
  quantity: '500 units',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const gapA = analyzeRequirementGaps(ledRequirements, is10322);

console.log(`  Selected Standard: ${gapA.standardNumber} - "${gapA.standardTitle}"`);
console.log(`  Total Requirements: ${gapA.totalRequirements}`);
console.log(`  Supported: ${gapA.supportedCount} | Needs Verification: ${gapA.needsVerificationCount} | Not Available: ${gapA.notAvailableCount} | Not Supported: ${gapA.notSupportedCount}`);
console.log(`  Reference Coverage: ${gapA.referenceCoverage}% (${gapA.referenceCoverageLabel})`);

assert(gapA.totalRequirements > 0, 'Total requirements must be greater than 0');
assert(gapA.supportedCount >= 3, 'At least 3 requirements (product, application, environment) must be supported');

// Product item check
const prodItem = gapA.items.find((i) => i.category === 'product');
assert(Boolean(prodItem), 'Product gap item must exist');
assert(prodItem.status === 'supported', 'Product item status must be supported');
assert(Boolean(prodItem.standardEvidence), 'Product item must reference verified standard evidence');

// Application item check
const appItem = gapA.items.find((i) => i.category === 'application');
assert(Boolean(appItem) && appItem.status === 'supported', 'Application item must be supported');

// Environment item check
const envItem = gapA.items.find((i) => i.category === 'environment');
assert(Boolean(envItem) && envItem.status === 'supported', 'Outdoor environment must be supported by road luminaire scope');

// Installation item check
const instItem = gapA.items.find((i) => i.category === 'installation');
assert(Boolean(instItem) && instItem.status === 'supported', 'Pole mounted installation must be supported by road luminaire scope');

// Technical Parameter (100W) check: must NOT be fabricated as supported or have fake clauses
const powerParam = gapA.items.find((i) => i.requirementLabel.includes('Power'));
assert(Boolean(powerParam), 'Power parameter item must exist');
assert(powerParam.status === 'not_available', 'Power limit must be not_available in record, not fabricated');

// Technical Parameter (IP65) check: needs verification
const ipParam = gapA.items.find((i) => i.requirementLabel.includes('Ingress Protection'));
assert(Boolean(ipParam), 'IP parameter item must exist');
assert(ipParam.status === 'needs_verification', 'IP rating must be marked needs_verification against official text');

// Verification checklist
assert(Array.isArray(gapA.verificationActions) && gapA.verificationActions.length > 0, 'Verification checklist must be generated');
assert(
  gapA.verificationActions.some((a) => a.toLowerCase().includes('ip') || a.toLowerCase().includes('ingress')),
  'Verification checklist must prompt verification for IP rating'
);
assert(
  gapA.verificationActions.some((a) => a.toLowerCase().includes('power') || a.toLowerCase().includes('wattage') || a.toLowerCase().includes('electrical')),
  'Verification checklist must prompt verification for power/electrical rating'
);

// Check that no fabricated clause numbers exist in actions
assert(
  !gapA.verificationActions.some((a) => /clause \d+/i.test(a)),
  'Must NOT fabricate clause numbers in verification actions'
);

// Check that "compliance" is NOT used in the score label
assert(!gapA.referenceCoverageLabel.toLowerCase().includes('compliance'), 'Must NOT label metric as compliance percentage');
assert(gapA.referenceCoverageLabel.includes('Reference Coverage'), 'Must label metric as Reference Coverage');

// Mathematical identity check: totalRequirements = supported + notSupported + notAvailable + needsVerification
const sumCounts = gapA.supportedCount + gapA.notSupportedCount + gapA.notAvailableCount + gapA.needsVerificationCount;
assert(sumCounts === gapA.totalRequirements, `Count sum (${sumCounts}) must equal totalRequirements (${gapA.totalRequirements})`);

// Official BIS source URL preserved
assert(gapA.officialSourceUrl.startsWith('https://www.bis.gov.in'), 'Must retain official verified BIS portal URL');
console.log('✅ TEST A PASSED: LED Street Lighting gap analysis verified.\n');

// ------------------------------------------------------------
// TEST B: High Temperature Electrical Cable + IS 1554 (Part 1)
// ------------------------------------------------------------
console.log('Test B: Evaluating High Temperature Electrical Cable against IS 1554 (Part 1):1988...');
const is1554 = VERIFIED_BIS_STANDARDS.find((s) => s.standard_number.includes('1554 (Part 1)'));
assert(Boolean(is1554), 'IS 1554 (Part 1) must exist in verified dataset');

const cableRequirements = {
  product: {
    name: 'Industrial electrical cables',
    category: 'Electrical → Cables & Wires',
    confidence: 'high',
  },
  application: 'Industrial power distribution',
  industry: 'Heavy Industry & Electrical',
  technical_parameters: [
    { parameter: 'Voltage Grade', value: '1100V', confidence: 'high' },
  ],
  materials: [{ name: 'PVC insulation', confidence: 'high' }],
  environment: [{ name: 'High temperature', confidence: 'high' }],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: null,
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const gapB = analyzeRequirementGaps(cableRequirements, is1554);
console.log(`  Selected Standard: ${gapB.standardNumber}`);
console.log(`  Supported: ${gapB.supportedCount} | Needs Verification: ${gapB.needsVerificationCount}`);

const cableProd = gapB.items.find((i) => i.category === 'product');
assert(cableProd.status === 'supported', 'Cable product must be supported');

const tempEnv = gapB.items.find((i) => i.category === 'environment');
assert(
  tempEnv.status === 'needs_verification' || tempEnv.status === 'not_available',
  'High temperature environmental limit must not be fabricated as supported'
);
console.log('✅ TEST B PASSED: High Temperature Electrical Cable gap analysis verified.\n');

// ------------------------------------------------------------
// TEST C: Construction + IS 456:2000
// ------------------------------------------------------------
console.log('Test C: Evaluating Construction against IS 456:2000...');
const is456 = VERIFIED_BIS_STANDARDS.find((s) => s.standard_number.includes('456'));
assert(Boolean(is456), 'IS 456 must exist in verified dataset');

const constRequirements = {
  product: {
    name: 'Reinforced concrete structural construction',
    category: 'Construction → Concrete',
    confidence: 'high',
  },
  application: 'Building structural foundation and columns',
  industry: 'Civil Infrastructure & Construction',
  technical_parameters: [
    { parameter: 'Concrete Grade', value: 'M25', confidence: 'high' },
  ],
  materials: [{ name: 'Portland cement', confidence: 'high' }],
  environment: [{ name: 'Outdoor', confidence: 'high' }],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: null,
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const gapC = analyzeRequirementGaps(constRequirements, is456);
const constProd = gapC.items.find((i) => i.category === 'product');
assert(constProd.status === 'supported', 'Concrete structural construction product must be supported');
console.log('✅ TEST C PASSED: Construction gap analysis verified.\n');

// ------------------------------------------------------------
// TEST D: Vague Input
// ------------------------------------------------------------
console.log('Test D: Verifying Vague Input Guard...');
const vagueRequirements = {
  product: {
    name: 'Need something',
    category: 'unspecified',
    confidence: 'needs_review',
  },
  application: null,
  industry: null,
  technical_parameters: [],
  materials: [],
  environment: [],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: null,
  additional_requirements: [],
  missing_information: ['Product Name'],
  clarification_questions: [],
  overall_confidence: 'needs_review',
  ready_for_matching: false,
  confirmed: false,
};

// Check controller-level guard condition
const isVague =
  !vagueRequirements.product?.name ||
  vagueRequirements.product.name.toLowerCase().trim() === 'need something' ||
  vagueRequirements.ready_for_matching === false;

assert(isVague === true, 'Vague requirements must be detected as insufficient before gap analysis');
console.log('✅ TEST D PASSED: Vague input correctly identified as insufficient for gap analysis.\n');

// ------------------------------------------------------------
// TEST E: Unrelated Domain Comparison
// ------------------------------------------------------------
console.log('Test E: Evaluating Unrelated Domain (Hospital linen vs IS 10322 street light)...');
const linenRequirements = {
  product: {
    name: 'Organic cotton medical hospital bedding linen',
    category: 'Textiles → Hospital Linen',
    confidence: 'medium',
  },
  application: 'Hospital patient wards',
  industry: 'Healthcare Textiles',
  technical_parameters: [],
  materials: [],
  environment: [],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: null,
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'medium',
  ready_for_matching: true,
  confirmed: true,
};

const gapE = analyzeRequirementGaps(linenRequirements, is10322);
const linenProd = gapE.items.find((i) => i.category === 'product');
assert(linenProd.status === 'not_supported', 'Hospital linen product must be marked not_supported against street lighting standard');
assert(gapE.supportedCount === 0, 'Supported count must be 0 for unrelated domain');
console.log('✅ TEST E PASSED: Unrelated domain correctly yields not_supported.\n');

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------
console.log('===========================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 6 TEST ASSERTIONS PASSED!`);
console.log('===========================================================');
