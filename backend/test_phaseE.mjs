// ============================================================
// ISutra: Phase E — Specificity-Aware Ranking & Quality Suite
// Comprehensive Verification, Calibration & Benchmark Suite
// ============================================================

import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { PHASE_D_EVALUATION_CASES, PHASE_E_EVALUATION_CASES, EVALUATION_CASES } from './dist/database/evaluationCases.js';
import { runRequirementExtractionPipeline } from './dist/services/ai/requirementExtractor.js';
import { matchRequirementsToStandards, StandardsMatcher } from './dist/services/standardsMatcher.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE E — SPECIFICITY-AWARE RANKING & RECOMMENDATION QUALITY');
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

async function runPhaseETests() {
  console.log('--- TEST GROUP 1: Specificity Modeling & Specific vs Broad Ranking ---');

  for (const evalCase of PHASE_E_EVALUATION_CASES) {
    if (evalCase.id === 'eval-e-11') continue; // Handled in Contradiction group

    const extraction = await runRequirementExtractionPipeline(evalCase.input, 'direct_text');
    assert(extraction.requirements.ready_for_matching === true, `Case ${evalCase.id} must be ready for matching`);

    const result = matchRequirementsToStandards(extraction.requirements, VERIFIED_BIS_STANDARDS);
    assert(result.success === true, `Case ${evalCase.id}: Matcher executed successfully`);
    assert(result.recommendations.length > 0, `Case ${evalCase.id}: Produced recommendations`);

    const topRec = result.recommendations[0];
    const topStdNum = topRec.standard.standard_number;
    const expectedMatched = evalCase.expected_standard_numbers.some(
      (exp) => topStdNum.includes(exp) || exp.includes(topStdNum)
    );

    console.log(`  [Case ${evalCase.id}] Expected: ${evalCase.expected_standard_numbers[0]} | Top-1: ${topStdNum} (Score: ${topRec.score}, Tier: ${topRec.specificityTierLabel})`);
    assert(expectedMatched, `Case ${evalCase.id}: Specific standard must rank #1 (Expected: ${evalCase.expected_standard_numbers.join(', ')}, got: ${topStdNum})`);

    // Verify Specific outranks Broad standard
    if (evalCase.competing_broad_standard) {
      const specificRank = result.recommendations.findIndex((r) =>
        evalCase.expected_standard_numbers.some((exp) => r.standard.standard_number.includes(exp))
      );
      const broadRank = result.recommendations.findIndex((r) =>
        r.standard.standard_number.includes(evalCase.competing_broad_standard)
      );

      assert(specificRank !== -1, `Case ${evalCase.id}: Specific standard must be present in recommendations`);
      if (broadRank !== -1) {
        assert(specificRank < broadRank, `Case ${evalCase.id}: Specific standard (${evalCase.expected_standard_numbers[0]} at rank #${specificRank + 1}) must strictly outrank broad standard (${evalCase.competing_broad_standard} at rank #${broadRank + 1})`);
      }
    }
  }

  console.log('\n--- TEST GROUP 2: Contradiction Dominance Over Specificity ---');
  const contraCase = PHASE_E_EVALUATION_CASES.find((c) => c.id === 'eval-e-11');
  const contraExtraction = await runRequirementExtractionPipeline(contraCase.input, 'direct_text');
  const contraResult = matchRequirementsToStandards(contraExtraction.requirements, VERIFIED_BIS_STANDARDS);

  // Assert emergency lighting standard IS 10322 (Part 5/Sec 8) has contradiction flagged and does NOT rank #1
  const sec8Rec = contraResult.recommendations.find((r) => r.standard.standard_number.includes('Part 5/Sec 8'));
  assert(Boolean(sec8Rec), 'Emergency luminaire standard must be present in evaluated list');
  const sec8HasContra = Object.values(sec8Rec.factorStatuses).some((f) => f.status === 'contradiction');
  assert(sec8HasContra, 'Emergency luminaire standard must have contradiction flagged for outdoor street application');
  assert(sec8Rec.score <= 0.20, `Contradicted standard score must be capped at <= 0.20, got: ${sec8Rec.score}`);
  assert(sec8Rec.specificityTier === 6, `Contradicted standard must be relegated to Tier 6, got: Tier ${sec8Rec.specificityTier}`);
  assert(contraResult.recommendations[0].standard.standard_number !== sec8Rec.standard.standard_number, 'Contradicted standard must NEVER rank #1 over non-contradicted standards');
  console.log(`  Contradiction dominance verified: Contradicted standard score=${sec8Rec.score}, tier=${sec8Rec.specificityTier}`);

  console.log('\n--- TEST GROUP 3: Explainability & Specificity Transparency ---');
  const sampleCase = PHASE_E_EVALUATION_CASES[0];
  const sampleExt = await runRequirementExtractionPipeline(sampleCase.input, 'direct_text');
  const sampleRes = matchRequirementsToStandards(sampleExt.requirements, VERIFIED_BIS_STANDARDS);
  const sampleRec = sampleRes.recommendations[0];

  assert(typeof sampleRec.specificityTier === 'number', 'Recommendation must have numeric specificityTier');
  assert(sampleRec.specificityTier >= 1 && sampleRec.specificityTier <= 6, `SpecificityTier must be between 1 and 6, got: ${sampleRec.specificityTier}`);
  assert(typeof sampleRec.specificityTierLabel === 'string' && sampleRec.specificityTierLabel.length > 0, 'Recommendation must have specificityTierLabel');
  assert(Boolean(sampleRec.specificationSpecificity), 'Recommendation must have specificationSpecificity object');
  assert(Array.isArray(sampleRec.specificationSpecificity.evidence), 'specificationSpecificity must have evidence array');
  assert(sampleRec.specificationSpecificity.evidence.length > 0, 'specificationSpecificity evidence must not be empty');

  // Verify plain English transparency without internal jargon
  const specEvidence = sampleRec.specificationSpecificity.evidence.join(' ');
  const jargonTerms = ['regex', 'token_count', 'internal_id', 'sql', 'regex_pattern'];
  for (const term of jargonTerms) {
    assert(!specEvidence.toLowerCase().includes(term), `Evidence should not contain technical jargon "${term}"`);
  }

  // Verify all 6 core factors remain intact
  const coreFactors = ['productCategory', 'keywordsTitleScope', 'application', 'environment', 'technicalParameters', 'safetyTesting'];
  for (const factor of coreFactors) {
    assert(Boolean(sampleRec.factorStatuses[factor]), `Core factor "${factor}" must be present in factorStatuses`);
    assert(typeof sampleRec.factorStatuses[factor].score === 'number', `Factor "${factor}" score must be numeric`);
    assert(typeof sampleRec.factorStatuses[factor].weight === 'number', `Factor "${factor}" weight must be numeric`);
    assert(typeof sampleRec.factorStatuses[factor].contribution === 'number', `Factor "${factor}" contribution must be numeric`);
  }

  // Score transparency: sum of contributions must equal total score
  const contributionSum = Object.values(sampleRec.factorStatuses).reduce((sum, f) => sum + f.contribution, 0);
  assert(Math.abs(contributionSum - sampleRec.score) < 0.001, `Sum of contributions (${contributionSum}) must equal total score (${sampleRec.score})`);

  console.log('\n--- TEST GROUP 4: 100% Deterministic Ranking Across Iterations ---');
  let isDeterministic = true;
  const firstRun = matchRequirementsToStandards(sampleExt.requirements, VERIFIED_BIS_STANDARDS);
  const firstOrder = firstRun.recommendations.map((r) => r.standard.standard_number).join('|');

  for (let i = 0; i < 30; i++) {
    const rerun = matchRequirementsToStandards(sampleExt.requirements, VERIFIED_BIS_STANDARDS);
    const rerunOrder = rerun.recommendations.map((r) => r.standard.standard_number).join('|');
    if (rerunOrder !== firstOrder) {
      isDeterministic = false;
      break;
    }
  }
  assert(isDeterministic, 'Matching engine ranking order must be 100% deterministic across 30 consecutive runs');

  console.log('\n--- TEST GROUP 5: Combined Full Benchmark Regression (All 46 Cases) ---');
  let totalBenchmarkCases = EVALUATION_CASES.length;
  let matchingReadyCases = 0;
  let top1Matches = 0;
  let top3Matches = 0;
  let top5Matches = 0;
  let ambiguousBlocked = 0;
  let totalAmbiguous = 0;

  for (const c of EVALUATION_CASES) {
    const isAmbig = c.domain === 'Ambiguous';
    if (isAmbig) totalAmbiguous++;

    const ext = await runRequirementExtractionPipeline(c.input, 'direct_text');
    if (!c.should_be_ready_for_matching) {
      if (!ext.requirements.ready_for_matching) ambiguousBlocked++;
      continue;
    }

    matchingReadyCases++;
    const res = matchRequirementsToStandards(ext.requirements, VERIFIED_BIS_STANDARDS);
    const recs = res.recommendations;

    let rank = -1;
    for (let idx = 0; idx < recs.length; idx++) {
      if (c.expected_standard_numbers.some((exp) => recs[idx].standard.standard_number.includes(exp))) {
        rank = idx + 1;
        break;
      }
    }

    if (rank === 1) top1Matches++;
    if (rank > 0 && rank <= 3) top3Matches++;
    if (rank > 0 && rank <= 5) top5Matches++;
  }

  const top1Rate = ((top1Matches / matchingReadyCases) * 100).toFixed(1);
  const top3Rate = ((top3Matches / matchingReadyCases) * 100).toFixed(1);
  const top5Rate = ((top5Matches / matchingReadyCases) * 100).toFixed(1);

  console.log(`Combined Benchmark Performance (${totalBenchmarkCases} total cases, ${matchingReadyCases} matching-ready cases):`);
  console.log(`  Top-1 Match Rate:  ${top1Rate}% (${top1Matches}/${matchingReadyCases})`);
  console.log(`  Top-3 Match Rate:  ${top3Rate}% (${top3Matches}/${matchingReadyCases})`);
  console.log(`  Top-5 Match Rate:  ${top5Rate}% (${top5Matches}/${matchingReadyCases})`);
  console.log(`  Ambiguous Blocked: ${ambiguousBlocked}/${totalAmbiguous} (100%)`);

  assert(parseFloat(top1Rate) >= 90.0, `Combined Top-1 Rate (${top1Rate}%) must be >= 90%`);
  assert(parseFloat(top3Rate) >= 98.0, `Combined Top-3 Rate (${top3Rate}%) must be >= 98%`);
  assert(parseFloat(top5Rate) >= 98.0, `Combined Top-5 Rate (${top5Rate}%) must be >= 98%`);
  assert(ambiguousBlocked === totalAmbiguous, 'All ambiguous cases must remain 100% blocked');

  console.log('\n===========================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE E TESTS PASSED SUCCESSFULLY!`);
  console.log('===========================================================');
}

runPhaseETests().catch((err) => {
  console.error('Phase E test execution error:', err);
  process.exit(1);
});
