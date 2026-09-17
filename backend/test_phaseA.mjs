// ============================================================
// ISutra: Phase A — Trustworthy Matching Readiness Verification
// Acceptance Test Suite (Tests 1 - 5)
// ============================================================

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { analyzeSpecification, getAnalysisById, updateAnalysisRequirements } = require('./dist/services/analysisService.js');
const { validateExtractedRequirements, isMeaningfulProduct, isMeaningfulCategory } = require('./dist/services/ai/validation.js');

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE A — TRUSTWORTHY MATCHING READINESS VERIFICATION');
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

async function runTests() {
  // ------------------------------------------------------------
  // TEST 1 — Good requirement
  // ------------------------------------------------------------
  console.log('Test 1: Evaluating Good Requirement...');
  const test1Input = 'Procure 100W LED street lighting luminaires for municipal roads with outdoor weather-resistant housing and surge protection.';
  const res1 = await analyzeSpecification('raw_specification', test1Input);

  console.log('  Extracted Product:', res1.requirements.product.name);
  console.log('  Extracted Category:', res1.requirements.product.category);
  console.log('  Ready for Matching:', res1.ready_for_matching);
  console.log('  Blocking Issues:', res1.blocking_missing_information);

  assert(isMeaningfulProduct(res1.requirements.product.name), 'Product identified and meaningful');
  assert(isMeaningfulCategory(res1.requirements.product.category), 'Category identified and meaningful');
  assert(res1.ready_for_matching === true, 'ready_for_matching must be true');
  assert(res1.requirements.ready_for_matching === true, 'requirements.ready_for_matching must be true');
  assert(
    !res1.blocking_missing_information || res1.blocking_missing_information.length === 0,
    'Blocking list must be empty'
  );
  assert(
    !res1.requirements.blocking_missing_information || res1.requirements.blocking_missing_information.length === 0,
    'requirements.blocking_missing_information must be empty'
  );
  console.log('✅ TEST 1 PASSED: Good requirement is fully ready for matching.\n');

  // ------------------------------------------------------------
  // TEST 2 — Vague requirement
  // ------------------------------------------------------------
  console.log('Test 2: Evaluating Vague Requirement...');
  const test2Input = 'Supply good quality lighting equipment.';
  const res2 = await analyzeSpecification('raw_specification', test2Input);

  console.log('  Extracted Product:', res2.requirements.product.name);
  console.log('  Ready for Matching:', res2.ready_for_matching);
  console.log('  Blocking Issues:', res2.blocking_missing_information);
  console.log('  Clarification Questions:', res2.clarification_questions.map((q) => q.question));

  assert(res2.ready_for_matching === false, 'ready_for_matching must be false for vague requirement');
  assert(res2.requirements.ready_for_matching === false, 'requirements.ready_for_matching must be false');
  assert(
    Array.isArray(res2.blocking_missing_information) && res2.blocking_missing_information.length > 0,
    'Blocking missing information must be populated'
  );
  assert(
    Array.isArray(res2.requirements.blocking_missing_information) && res2.requirements.blocking_missing_information.length > 0,
    'requirements.blocking_missing_information must be populated'
  );
  assert(
    Array.isArray(res2.clarification_questions) && res2.clarification_questions.length > 0,
    'Clarification questions must be present'
  );
  assert(
    res2.clarification_questions.some((q) => q.question.toLowerCase().includes('product') || q.question.toLowerCase().includes('equipment')),
    'Clarification question must ask about product/equipment'
  );
  console.log('✅ TEST 2 PASSED: Vague requirement correctly blocked from standards matching.\n');

  // ------------------------------------------------------------
  // TEST 3 — Extremely vague
  // ------------------------------------------------------------
  console.log('Test 3: Evaluating Extremely Vague Requirement...');
  const test3Input = 'Need electrical equipment.';
  const res3 = await analyzeSpecification('raw_specification', test3Input);

  console.log('  Extracted Product:', res3.requirements.product.name);
  console.log('  Ready for Matching:', res3.ready_for_matching);
  console.log('  Blocking Issues:', res3.blocking_missing_information);
  console.log('  Clarification Questions:', res3.clarification_questions.map((q) => q.question));

  assert(res3.ready_for_matching === false, 'ready_for_matching must be false for extremely vague input');
  assert(
    !isMeaningfulProduct(res3.requirements.product.name) || res3.blocking_missing_information.length > 0,
    'Product must be considered insufficient or blocked'
  );
  assert(
    res3.clarification_questions && res3.clarification_questions.length > 0,
    'User must be asked for clarification'
  );
  console.log('✅ TEST 3 PASSED: Extremely vague requirement blocked and clarification requested.\n');

  // ------------------------------------------------------------
  // TEST 4 — Missing quantity only
  // ------------------------------------------------------------
  console.log('Test 4: Evaluating Requirement with Missing Quantity Only...');
  const test4Input = 'LED street lighting luminaire suitable for municipal road outdoor installation with surge protection.';
  const res4 = await analyzeSpecification('raw_specification', test4Input);

  console.log('  Extracted Product:', res4.requirements.product.name);
  console.log('  Extracted Quantity:', res4.requirements.quantity);
  console.log('  Ready for Matching:', res4.ready_for_matching);
  console.log('  Blocking Issues:', res4.blocking_missing_information);
  console.log('  Missing Information (Non-blocking):', res4.missing_information);

  assert(
    !res4.requirements.quantity || res4.requirements.quantity === 'Not specified' || res4.requirements.quantity === null,
    'Quantity is missing or not specified'
  );
  assert(res4.ready_for_matching === true, 'Requirement must still be ready for matching even when quantity is missing');
  assert(
    !res4.blocking_missing_information || res4.blocking_missing_information.length === 0,
    'Missing quantity must remain non-blocking (blocking list empty)'
  );
  console.log('✅ TEST 4 PASSED: Missing quantity is non-blocking, requirement is ready for matching.\n');

  // ------------------------------------------------------------
  // TEST 5 — AI fallback
  // ------------------------------------------------------------
  console.log('Test 5: Evaluating AI Fallback (Deterministic Parser Mode)...');
  // Both without API key or with demo mode
  assert(res1.provider_used === 'demo-deterministic-parser' || res1.demo === true, 'Demo parser executes when no API key configured');
  assert(typeof res1.ready_for_matching === 'boolean', 'Readiness is boolean in fallback mode');
  assert(typeof res2.ready_for_matching === 'boolean', 'Readiness is boolean in fallback mode');

  // Verify dynamic re-validation on requirement edit
  console.log('  Testing dynamic re-validation when officer clarifies vague requirement...');
  const updatedReqs = {
    ...res2.requirements,
    product: {
      name: '100W LED street lighting luminaire',
      category: 'Electrical → Lighting',
      confidence: 'high',
    },
    technical_parameters: [
      { parameter: 'Power', value: '100W', confidence: 'high' },
      { parameter: 'Ingress Protection', value: 'IP65', confidence: 'high' },
    ],
  };

  const revalidated = await updateAnalysisRequirements(res2.analysis_id, updatedReqs, true);
  console.log('  Revalidated Product:', revalidated.requirements.product.name);
  console.log('  Revalidated Ready for Matching:', revalidated.ready_for_matching);
  console.log('  Revalidated Blocking Issues:', revalidated.blocking_missing_information);

  assert(revalidated.ready_for_matching === true, 'Re-evaluated requirement becomes ready after clarification');
  assert(
    !revalidated.blocking_missing_information || revalidated.blocking_missing_information.length === 0,
    'Blocking list cleared after clarification'
  );
  // ------------------------------------------------------------
  // TEST 6 — Controller Guard Verification
  // ------------------------------------------------------------
  console.log('Test 6: Evaluating API Controller Guard (getAnalysisRecommendations)...');
  const { getAnalysisRecommendations, getRecommendations } = require('./dist/controllers/recommendationsController.js');
  const blockedAnalysis = await analyzeSpecification('raw_specification', 'Need electrical equipment.');

  let blockedStatus = null;
  let blockedBody = null;
  const mockRes = {
    status(code) {
      blockedStatus = code;
      return this;
    },
    json(data) {
      blockedBody = data;
      return this;
    },
  };
  const mockReq = {
    params: { id: blockedAnalysis.analysis_id },
    body: {},
  };
  const mockNext = (err) => {
    if (err) throw err;
  };

  await getAnalysisRecommendations(mockReq, mockRes, mockNext);
  console.log('  Controller Response Status:', blockedStatus);
  console.log('  Controller Error Message:', blockedBody?.error?.message);

  assert(blockedStatus === 400, 'Controller must return 400 when analysis is not ready for matching');
  assert(
    blockedBody?.error?.message === 'Clarification required before finding applicable Indian Standards.',
    'Controller error message must be "Clarification required before finding applicable Indian Standards."'
  );
  assert(
    Array.isArray(blockedBody?.error?.blocking_missing_information) && blockedBody.error.blocking_missing_information.length > 0,
    'Controller must return blocking missing information'
  );
  console.log('✅ TEST 6 PASSED: Controller rigorously blocks matching when requirements are not ready.\n');

  console.log('===========================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE A ACCEPTANCE TEST ASSERTIONS PASSED!`);
  console.log('===========================================================');
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
