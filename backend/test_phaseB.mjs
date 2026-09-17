// ============================================================
// ISutra: Phase B — Matching Accuracy & Explainability Test Suite
// Specificity Awareness, Negative Signals, Contradictions,
// Honest Evidence & Traceability Verification
// ============================================================

import { matchRequirementsToStandards } from './dist/services/standardsMatcher.js';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE B — MATCHING ACCURACY & EXPLAINABILITY VERIFICATION');
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
// TEST 1: Exact Product Phrase Matching
// ------------------------------------------------------------
console.log('Test 1: Exact Product Phrase Matching (LED street lighting luminaire)...');
const reqStreetLight = {
  product: {
    name: 'LED street lighting luminaire',
    category: 'Electrical → Lighting',
    confidence: 'high',
    source_text: 'LED street lighting luminaire',
  },
  application: 'Municipal road and highway lighting',
  application_source: 'municipal roads',
  industry: 'Municipal Infrastructure',
  technical_parameters: [
    { parameter: 'Power', value: '100W', unit: 'W', confidence: 'high', source_text: '100W' },
  ],
  materials: [],
  environment: [{ name: 'Outdoor', confidence: 'high', source_text: 'outdoor use' }],
  safety_requirements: [],
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

const resStreetLight = matchRequirementsToStandards(reqStreetLight, VERIFIED_BIS_STANDARDS);
assert(resStreetLight.success === true, 'Matcher executed successfully');
assert(resStreetLight.recommendations.length > 0, 'Found recommendations for street lighting');

const topRec1 = resStreetLight.recommendations[0];
console.log(`  Top Standard: ${topRec1.standard.standard_number} - "${topRec1.standard.title}"`);
console.log(`  Score: ${topRec1.score} | Category: ${topRec1.categoryLabel}`);

assert(
  topRec1.standard.standard_number.includes('10322 (Part 5/Sec 3)') ||
  topRec1.standard.standard_number.includes('16107 (Part 2/Sec 2)'),
  `Top recommendation must be dedicated road/street lighting standard, got: ${topRec1.standard.standard_number}`
);
assert(topRec1.factorStatuses.productCategory.status === 'matched', 'Product category status is matched');
assert(topRec1.factorStatuses.productCategory.score === 1.0, 'Exact product form match receives score 1.0');
assert(
  topRec1.factorStatuses.keywordsTitleScope.evidence.some((e) => e.toLowerCase().includes('phrase')),
  'Keywords factor evidence identifies exact or domain multi-word phrase'
);
assert(topRec1.category === 'high', 'Top recommendation is categorized as HIGH RELEVANCE');
console.log('✅ TEST 1 PASSED: Exact product phrase matching strongly favors specific standards.\n');

// ------------------------------------------------------------
// TEST 2: Generic Keyword Penalty
// ------------------------------------------------------------
console.log('Test 2: Generic Keyword Penalty (Comparing generic words vs specific product phrase)...');
const reqGenericLed = {
  product: {
    name: 'LED lighting equipment product',
    category: 'Lighting',
    confidence: 'medium',
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
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'medium',
  ready_for_matching: true,
  confirmed: true,
};

// Evaluate generic query with a low threshold so we can inspect the raw scores
const resGeneric = matchRequirementsToStandards(reqGenericLed, VERIFIED_BIS_STANDARDS, { minScoreThreshold: 0.05 });
const is10322Generic = resGeneric.recommendations.find((r) => r.standard.standard_number.includes('10322 (Part 5/Sec 3)'));

if (is10322Generic) {
  console.log(`  Generic LED query on IS 10322 (Part 5/Sec 3) score: ${is10322Generic.score}`);
  console.log(`  Generic LED keywords factor score: ${is10322Generic.factorStatuses.keywordsTitleScope.score} (Contribution: ${is10322Generic.factorStatuses.keywordsTitleScope.contribution})`);
  assert(
    is10322Generic.factorStatuses.keywordsTitleScope.score <= 0.20,
    `Generic words (LED, lighting, equipment) must be penalized: score ${is10322Generic.factorStatuses.keywordsTitleScope.score} <= 0.20`
  );
  assert(
    is10322Generic.factorStatuses.keywordsTitleScope.status === 'not_matched',
    'Generic keyword overlap alone must not yield "matched" keywords status'
  );
  assert(
    is10322Generic.category === 'low',
    'Generic keyword query must not yield HIGH or RELATED categorization'
  );
} else {
  assert(true, 'Generic keyword query was filtered out below threshold');
}
console.log('✅ TEST 2 PASSED: Generic keyword overlap is properly penalized.\n');

// ------------------------------------------------------------
// TEST 3: Street Lighting vs Emergency Lighting Distinction
// ------------------------------------------------------------
console.log('Test 3: Street Lighting vs Emergency Lighting Distinction...');
// Query: LED street lighting for municipal roads
// IS 10322 (Part 5/Sec 8) is specifically for Emergency Lighting
const allRecsForStreet = matchRequirementsToStandards(reqStreetLight, VERIFIED_BIS_STANDARDS, { minScoreThreshold: 0.05 });
const emergencyRec = allRecsForStreet.recommendations.find((r) => r.standard.standard_number.includes('10322 (Part 5/Sec 8)'));

if (emergencyRec) {
  console.log(`  IS 10322 (Part 5/Sec 8) Emergency Lighting Score: ${emergencyRec.score} | Category: ${emergencyRec.categoryLabel}`);
  console.log(`  Product status: ${emergencyRec.factorStatuses.productCategory.status}`);
  console.log(`  Application status: ${emergencyRec.factorStatuses.application.status}`);
  assert(
    emergencyRec.factorStatuses.productCategory.status === 'contradiction' ||
    emergencyRec.factorStatuses.application.status === 'contradiction',
    'Emergency lighting must receive contradiction signal for municipal street lighting requirement'
  );
  assert(
    emergencyRec.score <= 0.25,
    `Contradictory standard score must be strictly capped (score: ${emergencyRec.score} <= 0.25)`
  );
  assert(emergencyRec.category === 'low', 'Contradictory standard must be categorized as LOW RELEVANCE');
  const contradictionEv = [
    ...emergencyRec.factorStatuses.productCategory.evidence,
    ...emergencyRec.factorStatuses.application.evidence,
  ].join(' ');
  assert(
    contradictionEv.toLowerCase().includes('contradiction') || contradictionEv.toLowerCase().includes('emergency'),
    'Evidence explicitly explains contradiction between street lighting and emergency lighting'
  );
} else {
  assert(true, 'Emergency lighting was completely excluded from street lighting recommendations');
}
console.log('✅ TEST 3 PASSED: Street lighting vs emergency lighting contradiction verified.\n');

// ------------------------------------------------------------
// TEST 4: Self-Ballasted LED Lamp vs LED Luminaire Distinction
// ------------------------------------------------------------
console.log('Test 4: Self-Ballasted LED Lamp vs LED Luminaire Distinction...');
const reqLedLamp = {
  product: {
    name: 'Self-ballasted LED lamps for general lighting',
    category: 'Lighting',
    confidence: 'high',
    source_text: 'Self-ballasted LED lamps',
  },
  application: 'General lighting services for indoor and domestic illumination',
  industry: 'Lighting',
  technical_parameters: [],
  materials: [],
  environment: [],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: '1000 units',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const resLamp = matchRequirementsToStandards(reqLedLamp, VERIFIED_BIS_STANDARDS, { minScoreThreshold: 0.10 });
assert(resLamp.recommendations.length > 0, 'Found recommendations for self-ballasted LED lamp');

const topLamp = resLamp.recommendations[0];
console.log(`  Top Standard: ${topLamp.standard.standard_number} - "${topLamp.standard.title}"`);
console.log(`  Score: ${topLamp.score} | Category: ${topLamp.categoryLabel}`);

assert(
  topLamp.standard.standard_number.includes('16102 (Part 1)') ||
  topLamp.standard.standard_number.includes('16102 (Part 2)'),
  `Top recommendation must be self-ballasted LED lamp standard IS 16102, got: ${topLamp.standard.standard_number}`
);
assert(topLamp.factorStatuses.productCategory.status === 'matched', 'Self-ballasted lamp product factor is matched');
assert(topLamp.factorStatuses.productCategory.score === 1.0, 'Exact product form match receives score 1.0');

// Verify that complete street lighting luminaire (IS 10322 Part 5/Sec 3) receives contradiction
const streetUnderLamp = resLamp.recommendations.find((r) => r.standard.standard_number.includes('10322 (Part 5/Sec 3)'));
if (streetUnderLamp) {
  assert(
    streetUnderLamp.factorStatuses.productCategory.status === 'contradiction',
    'Complete luminaire assembly must receive contradiction status when requirement is for self-ballasted lamp'
  );
  assert(streetUnderLamp.score <= 0.25, 'Street luminaire score is capped under lamp query');
}
console.log('✅ TEST 4 PASSED: Self-ballasted LED lamp correctly distinguished from complete luminaires.\n');

// ------------------------------------------------------------
// TEST 5: LED Module vs Luminaire Distinction
// ------------------------------------------------------------
console.log('Test 5: LED Module vs Luminaire Distinction...');
const reqLedModule = {
  product: {
    name: 'LED modules for general lighting applications',
    category: 'Lighting',
    confidence: 'high',
    source_text: 'LED modules',
  },
  application: 'General lighting applications',
  industry: 'Lighting Components',
  technical_parameters: [],
  materials: [],
  environment: [],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: '2000 units',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const resModule = matchRequirementsToStandards(reqLedModule, VERIFIED_BIS_STANDARDS, { minScoreThreshold: 0.10 });
assert(resModule.recommendations.length > 0, 'Found recommendations for LED module');

const topModule = resModule.recommendations[0];
console.log(`  Top Standard: ${topModule.standard.standard_number} - "${topModule.standard.title}"`);
console.log(`  Score: ${topModule.score} | Category: ${topModule.categoryLabel}`);

assert(
  topModule.standard.standard_number.includes('16103 (Part 1)') ||
  topModule.standard.standard_number.includes('16103 (Part 2)'),
  `Top recommendation must be LED module standard IS 16103, got: ${topModule.standard.standard_number}`
);
assert(topModule.factorStatuses.productCategory.status === 'matched', 'LED module product factor is matched');
assert(topModule.factorStatuses.productCategory.score === 1.0, 'Exact product form match receives score 1.0');

// Verify that self-ballasted lamps (IS 16102) receive contradiction when module requested
const lampUnderModule = resModule.recommendations.find((r) => r.standard.standard_number.includes('16102'));
if (lampUnderModule) {
  assert(
    lampUnderModule.factorStatuses.productCategory.status === 'contradiction',
    'Self-ballasted lamp must receive contradiction when requirement specifies LED modules'
  );
  assert(lampUnderModule.score <= 0.25, 'Lamp score is capped under module query');
}
console.log('✅ TEST 5 PASSED: LED module distinguished from complete luminaires and self-ballasted lamps.\n');

// ------------------------------------------------------------
// TEST 6: Application Matching (Emergency Lighting)
// ------------------------------------------------------------
console.log('Test 6: Application Matching (Emergency lighting for public building)...');
const reqEmergency = {
  product: {
    name: 'LED emergency lighting luminaire',
    category: 'Lighting',
    confidence: 'high',
    source_text: 'LED emergency lighting luminaire',
  },
  application: 'Emergency lighting for public building escape routes',
  industry: 'Public Safety & Lighting',
  technical_parameters: [],
  materials: [],
  environment: [],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: '200 units',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const resEmergency = matchRequirementsToStandards(reqEmergency, VERIFIED_BIS_STANDARDS);
assert(resEmergency.recommendations.length > 0, 'Found recommendations for emergency lighting');

const topEmergency = resEmergency.recommendations[0];
console.log(`  Top Standard: ${topEmergency.standard.standard_number} - "${topEmergency.standard.title}"`);
console.log(`  Score: ${topEmergency.score} | Category: ${topEmergency.categoryLabel}`);

assert(
  topEmergency.standard.standard_number.includes('10322 (Part 5/Sec 8)'),
  `Top recommendation must be emergency lighting standard IS 10322 (Part 5/Sec 8), got: ${topEmergency.standard.standard_number}`
);
assert(topEmergency.factorStatuses.application.status === 'matched', 'Application factor is matched');
assert(topEmergency.factorStatuses.application.score === 1.0, 'Application score is 1.0');
console.log('✅ TEST 6 PASSED: Emergency lighting application matches dedicated standard at top rank.\n');

// ------------------------------------------------------------
// TEST 7: Missing Technical Parameter → not_available
// ------------------------------------------------------------
console.log('Test 7: Missing Technical Parameter → not_available (Honest verification)...');
const paramFactor = topRec1.factorStatuses.technicalParameters;
console.log(`  Technical Parameters Status: ${paramFactor.status}`);
console.log(`  Score: ${paramFactor.score} | Contribution: ${paramFactor.contribution}`);
console.log(`  Evidence:`, paramFactor.evidence);

assert(paramFactor.status === 'not_available', 'Unrecorded parameter must have status "not_available"');
assert(paramFactor.score === 0.0, 'Unrecorded parameter subscore must be 0.0');
assert(paramFactor.contribution === 0.0, 'Unrecorded parameter contribution must be 0.0');
assert(
  paramFactor.evidence.some((e) => e.includes('Not recorded in verified reference dataset')),
  'Evidence must honestly state that parameter is not recorded in the verified dataset'
);

// Verify comparison row
const paramComparison = topRec1.comparison.find((c) => c.field === 'Technical Ratings');
assert(Boolean(paramComparison), 'Technical Ratings row exists in comparison');
assert(paramComparison.status === 'not_available', 'Comparison row status is not_available');
assert(
  paramComparison.note?.includes('Not recorded in current reference dataset'),
  'Comparison note explicitly communicates unrecorded status'
);
console.log('✅ TEST 7 PASSED: Missing technical parameter honestly reported as not_available without fabrication.\n');

// ------------------------------------------------------------
// TEST 8: Contradictory Application → Negative / Low Signal
// ------------------------------------------------------------
console.log('Test 8: Contradictory Application (Highway road lighting vs emergency lighting standard)...');
if (emergencyRec) {
  assert(
    emergencyRec.factorStatuses.application.status === 'contradiction',
    'Emergency standard application factor status is "contradiction"'
  );
  assert(emergencyRec.factorStatuses.application.score === 0.0, 'Contradiction factor score is 0.0');
  assert(emergencyRec.score <= 0.25, `Contradictory standard total score (${emergencyRec.score}) is <= 0.25`);
  assert(emergencyRec.category === 'low', 'Contradictory standard cannot be HIGH or RELATED');
}
console.log('✅ TEST 8 PASSED: Contradictory application generates negative/low signal with capped score.\n');

// ------------------------------------------------------------
// TEST 9: No Fabricated Technical Claims (Safety & Testing)
// ------------------------------------------------------------
console.log('Test 9: No Fabricated Technical Claims (Surge protection in unverified records)...');
const reqSurge = {
  product: {
    name: 'LED street lighting luminaire',
    category: 'Electrical → Lighting',
    confidence: 'high',
  },
  application: 'Municipal road lighting',
  industry: 'Lighting',
  technical_parameters: [],
  materials: [],
  environment: [{ name: 'Outdoor', confidence: 'high' }],
  safety_requirements: [{ name: 'Surge protection 10kV', confidence: 'high' }],
  performance_requirements: [],
  testing_requirements: [{ name: 'High voltage impulse test', confidence: 'high' }],
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

const resSurge = matchRequirementsToStandards(reqSurge, VERIFIED_BIS_STANDARDS);
const topSurgeRec = resSurge.recommendations[0];
const safetyFactor = topSurgeRec.factorStatuses.safetyTesting;

console.log(`  Safety & Testing Status: ${safetyFactor.status}`);
console.log(`  Evidence:`, safetyFactor.evidence);

assert(
  safetyFactor.status === 'not_available',
  'Surge protection must NOT be marked as matched when not present in verified dataset record'
);
assert(safetyFactor.score === 0.0, 'Safety subscore must be 0.0 when clauses not recorded');
assert(
  safetyFactor.evidence.some((e) => e.includes('Not recorded in verified reference dataset') || e.includes('Not available in verified reference dataset')),
  'Evidence explicitly explains clauses are not recorded in reference dataset'
);
console.log('✅ TEST 9 PASSED: No fabricated safety/testing claims when data is absent from dataset.\n');

// ------------------------------------------------------------
// TEST 10: No Unrelated High-Score Recommendation (Adversarial Case E)
// ------------------------------------------------------------
console.log('Test 10: Adversarial Case E (Electrical cable for industrial power distribution)...');
const reqCable = {
  product: {
    name: 'Electrical cable for industrial power distribution',
    category: 'Electrical → Cables & Wires',
    confidence: 'high',
  },
  application: 'Industrial power distribution',
  industry: 'Industrial Power',
  technical_parameters: [
    { parameter: 'Voltage Grade', value: '1100V', confidence: 'high' },
  ],
  materials: [],
  environment: [{ name: 'Industrial', confidence: 'high' }],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: '5000 meters',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'high',
  ready_for_matching: true,
  confirmed: true,
};

const resCable = matchRequirementsToStandards(reqCable, VERIFIED_BIS_STANDARDS);
assert(resCable.recommendations.length > 0, 'Found cable recommendations');

for (const rec of resCable.recommendations) {
  assert(
    rec.standard.category.includes('Cables & Wires') || rec.standard.title.toLowerCase().includes('cable'),
    `Only cable standards may be recommended for cable requirement, got: ${rec.standard.title}`
  );
  assert(
    !rec.standard.category.includes('Lighting') && !rec.standard.title.toLowerCase().includes('luminaire'),
    `Lighting standard (${rec.standard.standard_number}) must NOT appear in cable recommendations`
  );
}
console.log('✅ TEST 10 PASSED: Unrelated domain cross-contamination strictly prohibited.\n');

// ------------------------------------------------------------
// TEST 11: Factor-Level Evidence Exists for Every Factor
// ------------------------------------------------------------
console.log('Test 11: Factor-Level Evidence Exists for Every Factor...');
const testRec = resStreetLight.recommendations[0];
const factorsToCheck = [
  'productCategory',
  'keywordsTitleScope',
  'application',
  'environment',
  'technicalParameters',
  'safetyTesting',
];

for (const fKey of factorsToCheck) {
  const f = testRec.factorStatuses[fKey];
  assert(Boolean(f), `Factor ${fKey} exists`);
  assert(
    f.status === 'matched' || f.status === 'not_matched' || f.status === 'not_available' || f.status === 'contradiction',
    `Factor ${fKey} has valid status: ${f.status}`
  );
  assert(typeof f.score === 'number' && f.score >= 0 && f.score <= 1.0, `Factor ${fKey} score in [0, 1]`);
  assert(typeof f.weight === 'number' && f.weight > 0, `Factor ${fKey} weight > 0`);
  assert(Math.abs(f.contribution - f.score * f.weight) < 0.001, `Factor ${fKey} contribution equals score * weight`);
  assert(Array.isArray(f.evidence) && f.evidence.length > 0, `Factor ${fKey} has non-empty evidence array`);
  assert(Boolean(f.label), `Factor ${fKey} has human-readable label`);
}
console.log('✅ TEST 11 PASSED: Full explainability structure present on every factor.\n');

// ------------------------------------------------------------
// TEST 12: Traceability REMAINS Intact
// ------------------------------------------------------------
console.log('Test 12: Traceability Chain REMAINS Intact...');
assert(Array.isArray(testRec.traceabilityChain) && testRec.traceabilityChain.length === 5, 'Traceability chain has exactly 5 steps');

const expectedStages = [
  'user_input',
  'extracted_requirement',
  'matching_signal',
  'bis_standard',
  'official_bis_source',
];

testRec.traceabilityChain.forEach((step, idx) => {
  assert(step.step === idx + 1, `Step index is ${idx + 1}`);
  assert(step.stage === expectedStages[idx], `Stage is ${expectedStages[idx]}`);
  assert(Boolean(step.title), `Step ${step.step} has title: "${step.title}"`);
  assert(Boolean(step.description), `Step ${step.step} has description`);
  assert(Boolean(step.sourceType), `Step ${step.step} has sourceType: ${step.sourceType}`);
});

assert(
  testRec.standard.source_url.startsWith('https://www.bis.gov.in'),
  'Retains official verified BIS source URL'
);
console.log('✅ TEST 12 PASSED: Complete 5-stage deterministic traceability chain intact.\n');

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------
console.log('===========================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE B TEST ASSERTIONS PASSED!`);
console.log('===========================================================');
