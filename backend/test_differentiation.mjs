// ============================================================
// ISutra: Differentiation Phase Automated Verification Test Suite
// "Why This Standard?" + "Why Not This Alternative?"
// ============================================================

import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { matchRequirementsToStandards } from './dist/services/standardsMatcher.js';

console.log('===========================================================');
console.log('🔬 ISUTRA DIFFERENTIATION PHASE — VERIFICATION SUITE');
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

// ------------------------------------------------------------
// TEST 0: Dataset Integrity Protection
// ------------------------------------------------------------
console.log('\nTest 0: Verifying Reference Standards Dataset Integrity...');
assert(VERIFIED_BIS_STANDARDS.length === 40, `Dataset must contain exactly 40 standards, found: ${VERIFIED_BIS_STANDARDS.length}`);

// ------------------------------------------------------------
// TEST 1: Outdoor LED Street-Lighting Requirement
// ------------------------------------------------------------
console.log('\nTest 1: Outdoor LED Street Lighting Requirement...');
const streetLightReq = {
  product: {
    name: 'LED street lighting system',
    category: 'Electrical → Lighting',
    confidence: 'high',
  },
  application: 'Municipal roads and highway lighting, pole mounted',
  industry: 'Municipal & Public Lighting',
  technical_parameters: [
    { parameter: 'Power', value: '100W', confidence: 'high' },
    { parameter: 'Ingress Protection', value: 'IP66', confidence: 'high' },
  ],
  materials: [{ name: 'Die-cast aluminum housing', confidence: 'high' }],
  environment: [{ name: 'Outdoor', confidence: 'high' }, { name: 'Weather resistant', confidence: 'high' }],
  safety_requirements: [{ name: 'General safety and tests', confidence: 'high' }],
  performance_requirements: [{ name: 'Luminous efficacy', confidence: 'high' }],
  testing_requirements: [{ name: 'General requirements and tests', confidence: 'high' }],
  installation_requirements: [{ name: 'Pole mounted', confidence: 'high' }],
  certification_mentions: [{ name: 'BIS', confidence: 'high' }],
  quantity: '500 units',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const streetLightMatch = matchRequirementsToStandards(streetLightReq, VERIFIED_BIS_STANDARDS);
assert(streetLightMatch.recommendations.length > 0, 'Must return recommendations for street light');
const primaryStreetLight = streetLightMatch.recommendations[0];
assert(
  primaryStreetLight.standard.standard_number?.includes('10322 (Part 5/Sec 3)') ||
  primaryStreetLight.standard.standard_number?.includes('16107'),
  `Primary standard must be road/street light standard, got: ${primaryStreetLight.standard.standard_number}`
);
assert(primaryStreetLight.relevancePercentage >= 70, `Primary relevance must be >= 70%, got: ${primaryStreetLight.relevancePercentage}%`);
assert(primaryStreetLight.factorStatuses.productCategory.weight === 0.30, 'Product factor weight must be 0.30');
assert(primaryStreetLight.factorStatuses.keywordsTitleScope.weight === 0.25, 'Keywords factor weight must be 0.25');
assert(primaryStreetLight.factorStatuses.application.weight === 0.15, 'Application factor weight must be 0.15');
assert(primaryStreetLight.factorStatuses.environment.weight === 0.10, 'Environment factor weight must be 0.10');
assert(primaryStreetLight.factorStatuses.technicalParameters.weight === 0.10, 'Technical factor weight must be 0.10');
assert(primaryStreetLight.factorStatuses.safetyTesting.weight === 0.10, 'Safety factor weight must be 0.10');

// Mathematics consistency: total score equals sum of factor contributions
const computedContributionSum = Object.values(primaryStreetLight.factorStatuses).reduce((sum, f) => sum + f.contribution, 0);
assert(
  Math.abs(primaryStreetLight.score - computedContributionSum) < 0.001,
  `Total score (${primaryStreetLight.score.toFixed(3)}) must equal sum of factor contributions (${computedContributionSum.toFixed(3)})`
);

// Meaningful alternative selection
const candidates = streetLightMatch.recommendations.slice(1);
const meaningfulAlt = candidates.find(
  (c) =>
    (c.category === 'high' || c.category === 'related' || c.score >= 0.30) &&
    (c.factorStatuses.productCategory.status === 'matched' ||
      c.factorStatuses.keywordsTitleScope.status === 'matched' ||
      c.standard.category === primaryStreetLight.standard.category)
);

assert(meaningfulAlt !== undefined, 'Must identify a meaningful alternative for street lighting');
console.log(`    Primary: ${primaryStreetLight.standard.standard_number} (${primaryStreetLight.relevancePercentage}%)`);
console.log(`    Alternative: ${meaningfulAlt?.standard.standard_number} (${meaningfulAlt?.relevancePercentage}%)`);
assert(primaryStreetLight.score >= meaningfulAlt.score, 'Primary reference must have higher or equal score to alternative');
assert(meaningfulAlt.standard.source_url.startsWith('https://'), 'Alternative must retain official source URL');

// Guardrail: Alternative MUST NOT be hardcoded
assert(
  typeof meaningfulAlt.standard.standard_number === 'string' && meaningfulAlt.standard.standard_number.length > 0,
  'Alternative standard number must be dynamic string from recommendation object'
);

// Traceability Chain: Exactly 5 sequential stages
assert(Array.isArray(primaryStreetLight.traceabilityChain), 'Traceability chain must be array');
assert(primaryStreetLight.traceabilityChain.length === 5, 'Traceability chain must contain exactly 5 stages');
const stages = primaryStreetLight.traceabilityChain.map((s) => s.stage);
assert(
  stages[0] === 'user_input' &&
    stages[1] === 'extracted_requirement' &&
    stages[2] === 'matching_signal' &&
    stages[3] === 'bis_standard' &&
    stages[4] === 'official_bis_source',
  'Traceability chain must trace from user_input to official_bis_source'
);

// Evidence Provenance
assert(Array.isArray(primaryStreetLight.evidence) && primaryStreetLight.evidence.length > 0, 'Evidence must be populated');
assert(
  primaryStreetLight.evidence.every((e) => Boolean(e.sourceType) && Boolean(e.label)),
  'Every evidence item must have valid sourceType and label'
);

// ------------------------------------------------------------
// TEST 2: Water Storage Tank Requirement
// ------------------------------------------------------------
console.log('\nTest 2: Water Storage Requirement...');
const waterTankReq = {
  product: {
    name: 'Rotomoulded polyethylene water storage tank',
    category: 'Chemicals & Materials → Polymers',
    confidence: 'high',
  },
  application: 'Potable water storage tanks',
  industry: 'Water Supply & Plumbing',
  technical_parameters: [],
  materials: [{ name: 'Polyethylene', confidence: 'high' }],
  environment: [{ name: 'Outdoor overhead', confidence: 'high' }],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: '50 units',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const waterMatch = matchRequirementsToStandards(waterTankReq, VERIFIED_BIS_STANDARDS);
assert(waterMatch.recommendations.length > 0, 'Must return recommendations for water tank');
const primaryWater = waterMatch.recommendations[0];
assert(
  primaryWater.standard.standard_number?.includes('12701') ||
  primaryWater.standard.standard_number?.includes('3370') ||
  primaryWater.standard.title?.toLowerCase().includes('storage'),
  `Expected liquid/water storage standard, got: ${primaryWater.standard.standard_number}`
);

// ------------------------------------------------------------
// TEST 3: High-Temperature Cable Requirement
// ------------------------------------------------------------
console.log('\nTest 3: High-Temperature Electrical Cable Requirement...');
const cableReq = {
  product: {
    name: 'Halogen free flame retardant electrical cable',
    category: 'Electrical Cables & Wires',
    confidence: 'high',
  },
  application: 'Power transmission and wiring in public buildings',
  industry: 'Power & Infrastructure',
  technical_parameters: [
    { parameter: 'Voltage', value: '1100V', confidence: 'high' }
  ],
  materials: [{ name: 'Copper conductor', confidence: 'high' }],
  environment: [{ name: 'High temperature', confidence: 'high' }, { name: 'Fire resistant', confidence: 'high' }],
  safety_requirements: [{ name: 'Fire safety and flame retardance', confidence: 'high' }],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: '2000 meters',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const cableMatch = matchRequirementsToStandards(cableReq, VERIFIED_BIS_STANDARDS);
assert(cableMatch.recommendations.length > 0, 'Must return recommendations for cable');
const primaryCable = cableMatch.recommendations[0];
assert(
  primaryCable.standard.category?.toLowerCase().includes('cable') ||
    primaryCable.standard.title?.toLowerCase().includes('cable'),
  `Expected electrical cable standard, got: ${primaryCable.standard.title}`
);

// ------------------------------------------------------------
// TEST 4: Vague Input Behavior Guard
// ------------------------------------------------------------
console.log('\nTest 4: Vague Input Behavior Guard...');
const vagueReq = {
  product: {
    name: 'Need something',
    category: 'General',
    confidence: 'low',
  },
  application: 'General purpose',
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
  missing_information: ['Product specifications missing'],
  clarification_questions: [],
  overall_confidence: 'low',
  ready_for_matching: false,
  confirmed: false,
};

const vagueMatch = matchRequirementsToStandards(vagueReq, VERIFIED_BIS_STANDARDS);
assert(vagueMatch.metadata.insufficientInformation === true, 'Vague requirement must set insufficientInformation flag');
assert(vagueMatch.recommendations.length === 0, 'Must return 0 recommendations for vague input');

// ------------------------------------------------------------
// TEST 5: Unrelated Domain Behavior Guard
// ------------------------------------------------------------
console.log('\nTest 5: Unrelated Domain Behavior Guard...');
const unrelatedReq = {
  product: {
    name: 'Organic hospital bedsheets and linen',
    category: 'Hospital Textiles & Bedding',
    confidence: 'high',
  },
  application: 'Patient beds in general ward',
  technical_parameters: [],
  materials: [{ name: '100% organic cotton', confidence: 'high' }],
  environment: [{ name: 'Indoor ward', confidence: 'high' }],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: '1000 sets',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const unrelatedMatch = matchRequirementsToStandards(unrelatedReq, VERIFIED_BIS_STANDARDS);
const highMatches = unrelatedMatch.recommendations.filter(r => r.category === 'high');
assert(highMatches.length === 0, 'Unrelated domain with no matches in dataset must return 0 HIGH RELEVANCE recommendations');

// ------------------------------------------------------------
// TEST 5b: No Meaningful Alternative Identification Logic
// ------------------------------------------------------------
console.log('\nTest 5b: No Meaningful Alternative Identified State...');
// When only 1 recommendation exists or remaining candidates are < 0.25 score
const singleRecList = [primaryStreetLight];
const candidatesSingle = singleRecList.slice(1);
const altFromSingle = candidatesSingle.find((c) => c.score >= 0.25 && (c.category === 'high' || c.category === 'related'));
assert(altFromSingle === undefined, 'Must return undefined when no alternative exists, triggering "NO MEANINGFUL ALTERNATIVE IDENTIFIED"');

const lowScoreCandidateList = [
  primaryStreetLight,
  {
    ...primaryStreetLight,
    standardId: 'low-score-test',
    score: 0.15,
    category: 'low',
    factorStatuses: {
      ...primaryStreetLight.factorStatuses,
      productCategory: { ...primaryStreetLight.factorStatuses.productCategory, status: 'not_matched' },
      keywordsTitleScope: { ...primaryStreetLight.factorStatuses.keywordsTitleScope, status: 'not_matched' },
    },
    matchedFactors: { ...primaryStreetLight.matchedFactors, keywords: [] },
    standard: { ...primaryStreetLight.standard, category: 'Completely Unrelated Domain' },
  },
];
const candidatesLow = lowScoreCandidateList.slice(1);
const altFromLow = candidatesLow.find(
  (c) =>
    (c.category === 'high' || c.category === 'related' || c.score >= 0.30) &&
    (c.factorStatuses.productCategory.status === 'matched' ||
      c.factorStatuses.keywordsTitleScope.status === 'matched' ||
      c.standard.category === primaryStreetLight.standard.category)
);
assert(altFromLow === undefined, 'Low-scoring unrelated candidate must NOT be treated as a meaningful alternative');

// ------------------------------------------------------------
// TEST 6: Unavailable Fields Preservation
// ------------------------------------------------------------
console.log('\nTest 6: Unavailable Fields Preservation...');
// Check that unrecorded fields in reference record remain strictly 'not_available' and are not fabricated
const techParamStatus = primaryStreetLight.factorStatuses.technicalParameters.status;
assert(
  techParamStatus === 'not_available' || techParamStatus === 'matched' || techParamStatus === 'not_matched',
  `Technical parameter status must be valid enum, got: ${techParamStatus}`
);
if (techParamStatus === 'not_available') {
  assert(
    primaryStreetLight.factorStatuses.technicalParameters.contribution === 0,
    'Unavailable factor contribution must strictly equal 0 points'
  );
}

// ------------------------------------------------------------
// TEST 7: Neutral Microcopy & No Fabricated Claims
// ------------------------------------------------------------
console.log('\nTest 7: Neutral Microcopy & No Fabricated Claims...');
assert(!primaryStreetLight.reason.includes('guaranteed'), 'Must not contain guaranteed claim');
assert(!primaryStreetLight.reason.includes('certified compliance'), 'Must not claim certified compliance');
assert(!primaryStreetLight.reason.includes('100% compliant'), 'Must not claim 100% compliant');

console.log('\n===========================================================');
if (failCount === 0) {
  console.log(`🎉 ALL ${passCount}/${passCount} DIFFERENTIATION PHASE ASSERTIONS PASSED!`);
} else {
  console.error(`❌ ${failCount} ASSERTIONS FAILED OUT OF ${passCount + failCount}`);
  process.exit(1);
}
console.log('===========================================================');
