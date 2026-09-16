// ============================================================
// ISutra: Phase 4 — Intelligent BIS Standards Matching Engine
// Comprehensive Verification & Test Suite
// ============================================================

import { matchRequirementsToStandards } from './dist/services/standardsMatcher.js';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { extractWithPatternMatching } from './dist/services/ai/nlpExtractor.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE 4 — BIS STANDARDS MATCHING ENGINE VERIFICATION');
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
// TEST 1: LED Street Lighting
// ------------------------------------------------------------
console.log('Test 1: Evaluating LED Street Lighting Requirement...');
const ledRequirements = {
  product: {
    name: 'LED street lighting system',
    category: 'Electrical → Lighting',
    confidence: 'high',
  },
  application: 'Municipal roads and highway lighting, pole mounted',
  industry: 'Municipal & Public Lighting',
  technical_parameters: [
    { parameter: 'Power', value: '100W', confidence: 'high' },
    { parameter: 'Ingress Protection', value: 'IP65', confidence: 'high' },
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

const ledResult = matchRequirementsToStandards(ledRequirements, VERIFIED_BIS_STANDARDS);
assert(ledResult.success === true, 'Matcher executed successfully');
assert(ledResult.recommendations.length > 0, 'Found recommendations for LED lighting');

const topLed = ledResult.recommendations[0];
console.log(`  Top Rank #1: ${topLed.standard.standard_number} - "${topLed.standard.title}"`);
console.log(`  Score: ${topLed.score} (${topLed.relevancePercentage}%) | Category: ${topLed.categoryLabel}`);
console.log(`  Reason: ${topLed.reason}`);

assert(topLed.category === 'high', 'Top match must be categorized as HIGH RELEVANCE');
assert(
  topLed.standard.standard_number.includes('10322 (Part 5/Sec 3)') ||
  topLed.standard.standard_number.includes('16107 (Part 2/Sec 2)'),
  `Expected top standard to be dedicated street/road lighting standard, got: ${topLed.standard.standard_number}`
);
assert(topLed.matchedFactors.productCategory === true, 'Product category factor matched');
assert(topLed.matchedFactors.keywords.length > 0, 'Keywords matched');
assert(topLed.standard.source_url.startsWith('https://www.bis.gov.in'), 'Retains official verified BIS source URL');

// Phase 5 Assertions: Evidence, Traceability & Score Transparency
assert(Array.isArray(topLed.evidence) && topLed.evidence.length > 0, 'Evidence list must be populated');
const hasUserReq = topLed.evidence.some((e) => e.sourceType === 'user_requirement');
const hasExtractedReq = topLed.evidence.some((e) => e.sourceType === 'extracted_requirement');
const hasStdData = topLed.evidence.some((e) => e.sourceType === 'standard_data');
const hasBisSource = topLed.evidence.some((e) => e.sourceType === 'official_bis_source');
assert(hasUserReq && hasExtractedReq && hasStdData && hasBisSource, 'Evidence must distinguish user_requirement, extracted_requirement, standard_data, and official_bis_source');

// Traceability Chain: Exactly 5 sequential stages
assert(Array.isArray(topLed.traceabilityChain) && topLed.traceabilityChain.length === 5, 'Traceability chain must contain exactly 5 stages');
const stages = topLed.traceabilityChain.map((s) => s.stage);
assert(
  stages[0] === 'user_input' &&
  stages[1] === 'extracted_requirement' &&
  stages[2] === 'matching_signal' &&
  stages[3] === 'bis_standard' &&
  stages[4] === 'official_bis_source',
  'Traceability chain must trace from user_input to official_bis_source'
);

// Side-by-Side Comparison
assert(Array.isArray(topLed.comparison) && topLed.comparison.length >= 4, 'Requirement vs standard comparison table must be populated');
const productCmp = topLed.comparison.find((c) => c.field === 'Product / System');
assert(Boolean(productCmp) && productCmp.status === 'matched', 'Product comparison must show matched status');

// Score Transparency: Reconstruct score from factor contributions
const computedContributionSum = Object.values(topLed.factorStatuses).reduce((sum, f) => sum + f.contribution, 0);
assert(Math.abs(computedContributionSum - topLed.score) < 0.001, `Mathematical score transparency: sum of factor contributions (${computedContributionSum}) must equal score (${topLed.score})`);

// Metadata Audit Fields
assert(ledResult.metadata.datasetCount === 40, 'Audit metadata must report exactly 40 evaluated standards');
assert(Boolean(ledResult.metadata.datasetName), 'Audit metadata must include datasetName');
assert(Boolean(ledResult.metadata.sourceProvenance), 'Audit metadata must include sourceProvenance');
assert(Boolean(ledResult.metadata.disclaimer), 'Audit metadata must include prototype disclaimer');

// Specificity check: IS 10322 (Part 5/Sec 3) MUST rank above generic lamp IS 16102 (Part 1)
const is10322Rank = ledResult.recommendations.findIndex((r) => r.standard.standard_number.includes('10322 (Part 5/Sec 3)'));
const is16102Rank = ledResult.recommendations.findIndex((r) => r.standard.standard_number.includes('16102 (Part 1)'));
console.log(`  Specificity Check: IS 10322 (Part 5/Sec 3) index = ${is10322Rank}, IS 16102 (Part 1) index = ${is16102Rank}`);
assert(is10322Rank !== -1, 'IS 10322 (Part 5/Sec 3) must be in recommendations');
assert(is16102Rank === -1 || is10322Rank < is16102Rank, 'Direct street lighting standard MUST rank above generic LED lamp');

// False positive check: Cable standards must NOT appear in LED street light recommendations
const hasCableMatches = ledResult.recommendations.some((r) => r.standard.category.includes('Cables') || r.standard.title.toLowerCase().includes('cable'));
assert(!hasCableMatches, 'No cable standards should appear in LED street lighting recommendations');
console.log('✅ TEST 1 PASSED: LED Street Lighting matched specific street/road lighting standards at the top.\n');

// ------------------------------------------------------------
// TEST 1b: Environment Extraction & Complete End-to-End Pipeline
// ------------------------------------------------------------
console.log('Test 1b: Evaluating Environment Extraction & Live Pipeline for Test A Input...');
const testAInput = 'Supply and installation of 100W LED street lights for municipal roads, outdoor use, pole mounted.';
const testAExtracted = extractWithPatternMatching(testAInput, 'specification');

console.log('  Extracted Environment Conditions:', JSON.stringify(testAExtracted.environment, null, 2));

const outdoorItem = testAExtracted.environment.find((e) => e.name === 'Outdoor');
assert(Boolean(outdoorItem), 'Expected "Outdoor" environment condition to be extracted from "outdoor use"');
assert(outdoorItem.source_text === 'outdoor use', `Expected source_text to be "outdoor use", got: "${outdoorItem?.source_text}"`);
assert(outdoorItem.confidence === 'high', `Expected confidence to be "high", got: "${outdoorItem?.confidence}"`);

// Verify other requested environment phrases are properly extracted
const testOutdoorInstall = extractWithPatternMatching('LED lights for outdoor installation', 'specification');
assert(testOutdoorInstall.environment.some((e) => e.name === 'Outdoor' && e.source_text === 'outdoor installation'), 'Extracted outdoor installation');

const testExternalUse = extractWithPatternMatching('LED lights for external use', 'specification');
assert(testExternalUse.environment.some((e) => e.name === 'Outdoor' && e.source_text === 'external use'), 'Extracted external use');

const testExteriorUse = extractWithPatternMatching('LED lights for exterior use', 'specification');
assert(testExteriorUse.environment.some((e) => e.name === 'Outdoor' && e.source_text === 'exterior use'), 'Extracted exterior use');

const testWeatherproof = extractWithPatternMatching('Weatherproof luminaire', 'specification');
assert(testWeatherproof.environment.some((e) => e.name === 'Weather resistant' && e.source_text?.toLowerCase() === 'weatherproof'), 'Extracted weatherproof');

const testHighTemp = extractWithPatternMatching('Cable for high temperature furnace', 'specification');
assert(testHighTemp.environment.some((e) => e.name === 'High temperature'), 'Extracted high temperature');

const testCorrosive = extractWithPatternMatching('Enclosure for corrosive and saline marine environments', 'specification');
assert(testCorrosive.environment.some((e) => e.name === 'Corrosive / Marine'), 'Extracted corrosive / marine');

// Non-fabricated test: Input with NO environment mention produces empty environment array
const testNoEnv = extractWithPatternMatching('Supply of 100W LED street lights for municipal roads, pole mounted.', 'specification');
assert(testNoEnv.environment.length === 0, 'Must NOT fabricate environment conditions when text contains no evidence');

// Now simulate the complete pipeline: confirmed extracted requirements -> matchRequirementsToStandards
testAExtracted.confirmed = true;
const livePipelineResult = matchRequirementsToStandards(testAExtracted, VERIFIED_BIS_STANDARDS);
assert(livePipelineResult.success === true, 'Live pipeline matching succeeded');
assert(livePipelineResult.recommendations.length > 0, 'Live pipeline returned recommendations');

const liveTopRec = livePipelineResult.recommendations[0];
console.log(`  Live Pipeline Top Standard: ${liveTopRec.standard.standard_number} - "${liveTopRec.standard.title}"`);
console.log(`  Score: ${liveTopRec.score} (${liveTopRec.relevancePercentage}%)`);
console.log(`  Environment Status: ${liveTopRec.factorStatuses.environment.status} (Contribution: ${liveTopRec.factorStatuses.environment.contribution})`);

assert(liveTopRec.standard.standard_number.includes('10322 (Part 5/Sec 3)'), `Top standard must be IS 10322 (Part 5/Sec 3), got: ${liveTopRec.standard.standard_number}`);
assert(liveTopRec.relevancePercentage === 80, `Expected 80% score with environment matched, got: ${liveTopRec.relevancePercentage}%`);
assert(liveTopRec.factorStatuses.environment.status === 'matched', 'Environment factor status must be matched');
assert(liveTopRec.factorStatuses.environment.contribution === 0.10, 'Environment factor contribution must be 0.10 (10%)');

// Specificity check in live pipeline: IS 10322 (Part 5/Sec 3) must strictly outrank IS 16102
const live10322Rank = livePipelineResult.recommendations.findIndex((r) => r.standard.standard_number.includes('10322 (Part 5/Sec 3)'));
const live16102Rank = livePipelineResult.recommendations.findIndex((r) => r.standard.standard_number.includes('16102 (Part 1)'));
console.log(`  Specificity Check: IS 10322 (Part 5/Sec 3) rank = ${live10322Rank}, IS 16102 (Part 1) rank = ${live16102Rank}`);
assert(live10322Rank !== -1, 'IS 10322 (Part 5/Sec 3) must be present in recommendations');
assert(live16102Rank === -1 || live10322Rank < live16102Rank, 'IS 10322 (Part 5/Sec 3) must strictly outrank IS 16102');

// Determinism check: Run matching 30 times and verify identical score and ranking
let isDeterministic = true;
for (let i = 0; i < 30; i++) {
  const rerunResult = matchRequirementsToStandards(testAExtracted, VERIFIED_BIS_STANDARDS);
  if (
    rerunResult.recommendations[0].standard.standard_id !== liveTopRec.standard.standard_id ||
    rerunResult.recommendations[0].score !== liveTopRec.score
  ) {
    isDeterministic = false;
    break;
  }
}
assert(isDeterministic, 'Matching engine is 100% deterministic across 30 consecutive runs');
console.log('  Deterministic Check: 30 consecutive iterations produced 100% identical rankings and scores.');
console.log('✅ TEST 1b PASSED: Environment extraction and complete end-to-end pipeline verified at 80%.\n');


// ------------------------------------------------------------
// TEST 2: High Temperature Electrical Cable
// ------------------------------------------------------------
console.log('Test 2: Evaluating High Temperature Electrical Cable Requirement...');
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
    { parameter: 'Conductor', value: 'Copper', confidence: 'high' },
  ],
  materials: [{ name: 'XLPE insulation', confidence: 'high' }],
  environment: [{ name: 'High temperature', confidence: 'high' }, { name: 'Industrial', confidence: 'high' }],
  safety_requirements: [{ name: 'Flame retardant', confidence: 'high' }],
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

const cableResult = matchRequirementsToStandards(cableRequirements, VERIFIED_BIS_STANDARDS);
assert(cableResult.success === true, 'Cable matching executed successfully');
assert(cableResult.recommendations.length > 0, 'Found recommendations for cables');

const topCable = cableResult.recommendations[0];
console.log(`  Top Rank #1: ${topCable.standard.standard_number} - "${topCable.standard.title}"`);
console.log(`  Score: ${topCable.score} (${topCable.relevancePercentage}%) | Category: ${topCable.categoryLabel}`);
console.log(`  Reason: ${topCable.reason}`);

assert(topCable.category === 'high' || topCable.category === 'related', 'Top match has strong relevance');
assert(
  topCable.standard.category.includes('Cables & Wires') || topCable.standard.title.toLowerCase().includes('cable'),
  `Expected cable standard at top, got: ${topCable.standard.title}`
);
assert(topCable.standard.source_url.startsWith('https://www.bis.gov.in'), 'Retains official verified BIS source URL');
console.log('✅ TEST 2 PASSED: High Temperature Electrical Cable matched relevant cable standards near top.\n');

// ------------------------------------------------------------
// TEST 3: Construction (Concrete & Reinforcing Steel)
// ------------------------------------------------------------
console.log('Test 3: Evaluating Construction Requirement (Concrete & Steel)...');
const constructionRequirements = {
  product: {
    name: 'Reinforced concrete structural construction',
    category: 'Construction → Concrete',
    confidence: 'high',
  },
  application: 'Building structural foundation and columns',
  industry: 'Civil Infrastructure & Construction',
  technical_parameters: [
    { parameter: 'Concrete Grade', value: 'M25', confidence: 'high' },
    { parameter: 'Steel Grade', value: 'Fe 500D', confidence: 'high' },
  ],
  materials: [
    { name: 'Reinforcing steel bars', confidence: 'high' },
    { name: 'Portland cement', confidence: 'high' },
    { name: 'Coarse aggregate', confidence: 'high' },
  ],
  environment: [{ name: 'Outdoor', confidence: 'high' }],
  safety_requirements: [{ name: 'Structural safety code', confidence: 'high' }],
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

const constResult = matchRequirementsToStandards(constructionRequirements, VERIFIED_BIS_STANDARDS);
assert(constResult.success === true, 'Construction matching executed successfully');
assert(constResult.recommendations.length > 0, 'Found recommendations for construction');

const topConst = constResult.recommendations[0];
console.log(`  Top Rank #1: ${topConst.standard.standard_number} - "${topConst.standard.title}"`);
console.log(`  Score: ${topConst.score} (${topConst.relevancePercentage}%) | Category: ${topConst.categoryLabel}`);
console.log(`  Reason: ${topConst.reason}`);

assert(
  topConst.standard.category.includes('Construction') ||
  topConst.standard.title.toLowerCase().includes('concrete') ||
  topConst.standard.title.toLowerCase().includes('steel') ||
  topConst.standard.standard_number.includes('456') ||
  topConst.standard.standard_number.includes('1786'),
  `Expected construction standard (e.g. IS 456, IS 1786), got: ${topConst.standard.standard_number}`
);
console.log('✅ TEST 3 PASSED: Construction requirement matched construction/concrete/steel standards near top.\n');

// ------------------------------------------------------------
// TEST 4: Vague Input
// ------------------------------------------------------------
console.log('Test 4: Evaluating Vague Input ("Need something.")...');
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
  missing_information: ['Product Name', 'Category', 'Parameters'],
  clarification_questions: [],
  overall_confidence: 'needs_review',
  ready_for_matching: false,
  confirmed: false,
};

const vagueResult = matchRequirementsToStandards(vagueRequirements, VERIFIED_BIS_STANDARDS);
console.log(`  Insufficient Information Flag: ${vagueResult.metadata.insufficientInformation}`);
console.log(`  Reason: ${vagueResult.metadata.insufficientReason}`);
console.log(`  Recommendations Count: ${vagueResult.recommendations.length}`);
console.log(`  Guidance Items: ${vagueResult.metadata.guidance?.length}`);

assert(vagueResult.metadata.insufficientInformation === true, 'Must flag insufficient information for vague input');
assert(vagueResult.recommendations.length === 0, 'Must NOT return random fabricated high-confidence recommendations');
assert(Boolean(vagueResult.metadata.insufficientReason), 'Must return actionable reason explaining why matching could not proceed');
assert(Boolean(vagueResult.metadata.guidance && vagueResult.metadata.guidance.length > 0), 'Must return helpful guidance');
console.log('✅ TEST 4 PASSED: Vague input correctly returned insufficient-information state.\n');

// ------------------------------------------------------------
// TEST 5: Unrelated Domain
// ------------------------------------------------------------
console.log('Test 5: Evaluating Unrelated Domain (Organic cotton hospital linen)...');
const unrelatedRequirements = {
  product: {
    name: 'Organic cotton medical hospital bedding linen',
    category: 'Textiles → Hospital Linen',
    confidence: 'medium',
  },
  application: 'Hospital patient wards and surgical linen beds',
  industry: 'Healthcare Textiles',
  technical_parameters: [
    { parameter: 'Thread Count', value: '300 TC', confidence: 'medium' },
    { parameter: 'Fiber', value: '100% Cotton', confidence: 'high' },
  ],
  materials: [{ name: 'Egyptian cotton', confidence: 'medium' }],
  environment: [{ name: 'Sterile hospital indoor environment', confidence: 'medium' }],
  safety_requirements: [],
  performance_requirements: [],
  testing_requirements: [],
  installation_requirements: [],
  certification_mentions: [],
  quantity: '2000 sheets',
  additional_requirements: [],
  missing_information: [],
  clarification_questions: [],
  overall_confidence: 'medium',
  ready_for_matching: true,
  confirmed: true,
};

const unrelatedResult = matchRequirementsToStandards(unrelatedRequirements, VERIFIED_BIS_STANDARDS);
console.log(`  Recommendations Count: ${unrelatedResult.recommendations.length}`);
if (unrelatedResult.recommendations.length > 0) {
  console.log(`  Highest Score: ${unrelatedResult.recommendations[0].score}`);
}

assert(
  unrelatedResult.recommendations.length === 0 ||
  unrelatedResult.recommendations[0].score < 0.35,
  'Unrelated domain must have no high relevance match'
);
console.log('✅ TEST 5 PASSED: Unrelated domain correctly returned low-confidence/no-match result without fabricating relevance.\n');

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------
console.log('===========================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 4 TEST ASSERTIONS PASSED!`);
console.log('===========================================================');
