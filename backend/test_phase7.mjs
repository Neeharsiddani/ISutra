// ============================================================
// ISutra: Phase 7 — Procurement Standards Comparison Workspace
// Comprehensive Verification & Test Suite
// STRICT ZERO-FABRICATION VERIFICATION
// ============================================================

import { compareStandards } from './dist/services/standardsComparator.js';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE 7 — STANDARDS COMPARISON ENGINE VERIFICATION');
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
// TEST 1: Comparing 2 LED Lighting Standards
// IS 10322 (Part 5/Sec 3):2026 vs IS 16107 (Part 2/Sec 2):2026
// ------------------------------------------------------------
console.log('Test 1: Comparing IS 10322 (Part 5/Sec 3):2026 and IS 16107 (Part 2/Sec 2):2026...');

const is10322 = VERIFIED_BIS_STANDARDS.find((s) => s.standard_number.includes('10322 (Part 5/Sec 3)'));
const is16107 = VERIFIED_BIS_STANDARDS.find((s) => s.standard_number.includes('16107 (Part 2/Sec 2)'));

assert(Boolean(is10322), 'IS 10322 (Part 5/Sec 3) must exist in verified dataset');
assert(Boolean(is16107), 'IS 16107 (Part 2/Sec 2) must exist in verified dataset');

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
    { parameter: 'Power', value: '100W', confidence: 'high' },
    { parameter: 'Ingress Protection', value: 'IP65', confidence: 'high' },
  ],
  materials: [{ name: 'Die-cast aluminum housing', confidence: 'high' }],
  environment: [{ name: 'Outdoor', confidence: 'high', source_text: 'outdoor use' }],
  safety_requirements: [{ name: 'General safety and tests', confidence: 'high' }],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [{ name: 'Pole mounted', confidence: 'high', source_text: 'pole mounted' }],
  certification_mentions: [],
  quantity: '500 units',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const compResult1 = compareStandards(ledRequirements, [is10322, is16107]);

console.log(`  Compared Standards Count: ${compResult1.standards.length}`);
console.log(`  Matrix Rows: ${compResult1.matrixRows.length}`);
console.log(`  Technical Distinctions: ${compResult1.technicalDistinctions.length}`);
console.log(`  Consolidated Actions: ${compResult1.consolidatedVerificationActions.length}`);

// 1. Boundary & Overviews
assert(compResult1.standards.length === 2, 'Exactly 2 standards in overview');
assert(compResult1.standards[0].standardNumber.includes('10322 (Part 5/Sec 3)'), 'First standard is IS 10322');
assert(compResult1.standards[1].standardNumber.includes('16107 (Part 2/Sec 2)'), 'Second standard is IS 16107');

// 2. Official BIS Source preservation
assert(compResult1.standards[0].officialSourceUrl.includes('bis.gov.in'), 'IS 10322 retains official BIS URL');
assert(compResult1.standards[1].officialSourceUrl.includes('bis.gov.in'), 'IS 16107 retains official BIS URL');

// 3. Neutrality: No "winner", no ranking, no "better" standard
const jsonStr = JSON.stringify(compResult1).toLowerCase();
assert(!jsonStr.includes('"winner"'), 'Must NOT designate a winner in comparison output');
assert(!jsonStr.includes('"best"'), 'Must NOT designate a best standard');
assert(!jsonStr.includes('"preferred"'), 'Must NOT designate a preferred standard');
assert(!jsonStr.includes('compliance score'), 'Must NOT create a compliance score');

// 4. Matrix Rows Validation
const scopeRow = compResult1.matrixRows.find((r) => r.dimensionId === 'documented_scope');
assert(Boolean(scopeRow), 'Documented scope row must exist');
assert(
  scopeRow.values[is10322.id].value.toLowerCase().includes('road and street') ||
  scopeRow.values[is10322.id].value.toLowerCase().includes('luminaires'),
  'IS 10322 scope matches verified record'
);

// 5. Zero-fabrication check: Unrecorded parameters say "Not available in current reference dataset."
const techRow = compResult1.matrixRows.find((r) => r.dimensionId === 'technical_parameters_record');
assert(Boolean(techRow), 'Technical parameters row must exist');
assert(
  techRow.values[is10322.id].value === 'Not available in current reference dataset.',
  'Unrecorded technical parameters must be explicitly labeled Not available in current reference dataset.'
);

// 6. Technical Distinctions (Derived strictly from verified record differences)
assert(compResult1.technicalDistinctions.length === 2, 'Distinctions generated for both standards');
const dist10322 = compResult1.technicalDistinctions.find((d) => d.standardId === is10322.id);
const dist16107 = compResult1.technicalDistinctions.find((d) => d.standardId === is16107.id);
assert(Boolean(dist10322 && dist16107), 'Distinctions exist for both standards');
console.log(`  IS 10322 Category: "${dist10322.categoryClassification}"`);
console.log(`  IS 16107 Category: "${dist16107.categoryClassification}"`);

// 7. Verification Actions
assert(compResult1.consolidatedVerificationActions.length > 0, 'Consolidated actions must exist');
assert(
  compResult1.consolidatedVerificationActions.every((a) => !/clause \d+/i.test(a.action)),
  'Must NOT fabricate clause numbers in actions'
);

console.log('✅ TEST 1 PASSED: Lighting standards comparison verified.\n');

// ------------------------------------------------------------
// TEST 2: Comparing 2 Cable Standards (IS 1554 Part 1 vs IS 7098 Part 1)
// ------------------------------------------------------------
console.log('Test 2: Comparing IS 1554 (Part 1):1988 (PVC) vs IS 7098 (Part 1):1988 (XLPE)...');
const is1554 = VERIFIED_BIS_STANDARDS.find((s) => s.standard_number.includes('1554 (Part 1)'));
const is7098 = VERIFIED_BIS_STANDARDS.find((s) => s.standard_number.includes('7098 (Part 1)'));

assert(Boolean(is1554), 'IS 1554 (Part 1) must exist in verified dataset');
assert(Boolean(is7098), 'IS 7098 (Part 1) must exist in verified dataset');

const cableRequirements = {
  product: {
    name: 'Industrial heavy duty cables',
    category: 'Electrical → Cables & Wires',
    confidence: 'high',
  },
  application: 'Industrial power distribution',
  industry: 'Heavy Industry & Electrical',
  technical_parameters: [
    { parameter: 'Voltage Grade', value: '1100V', confidence: 'high' },
  ],
  materials: [{ name: 'Copper conductor', confidence: 'high' }],
  environment: [{ name: 'Industrial', confidence: 'high' }],
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

const compResult2 = compareStandards(cableRequirements, [is1554, is7098]);
assert(compResult2.standards.length === 2, 'Two cable standards compared');

// Scope excerpts strictly match verified dataset
const cableScopeRow = compResult2.matrixRows.find((r) => r.dimensionId === 'documented_scope');
assert(cableScopeRow.values[is1554.id].value.toLowerCase().includes('pvc'), 'IS 1554 scope reflects PVC insulation');
assert(
  cableScopeRow.values[is7098.id].value.toLowerCase().includes('cross-linked polyethylene') ||
  cableScopeRow.values[is7098.id].value.toLowerCase().includes('polyethylene'),
  'IS 7098 scope reflects Cross-linked polyethylene insulation'
);
assert(
  is7098.product_types.some((pt) => pt.toLowerCase().includes('xlpe')),
  'IS 7098 product_types reflects XLPE'
);

console.log('✅ TEST 2 PASSED: Cable standards comparison verified.\n');

// ------------------------------------------------------------
// TEST 3: Selection Constraints (2–3 Standards Only)
// ------------------------------------------------------------
console.log('Test 3: Verifying Selection Constraints (2–3 Standards)...');

let threwUnderMin = false;
try {
  compareStandards(ledRequirements, [is10322]);
} catch (err) {
  threwUnderMin = true;
}
assert(threwUnderMin, 'Must reject comparison with fewer than 2 standards');

let threwOverMax = false;
try {
  compareStandards(ledRequirements, [is10322, is16107, is1554, is7098]);
} catch (err) {
  threwOverMax = true;
}
assert(threwOverMax, 'Must reject comparison with more than 3 standards');

// Exactly 3 standards works
const compResult3 = compareStandards(ledRequirements, [is10322, is16107, is1554]);
assert(compResult3.standards.length === 3, 'Successfully compared exactly 3 standards');
console.log('✅ TEST 3 PASSED: Selection boundaries (2-3 standards) enforced.\n');

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------
console.log('===========================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 7 TEST ASSERTIONS PASSED!`);
console.log('===========================================================');
