// ============================================================
// ISutra: Phase D — End-to-End Recommendation Evaluation & Benchmark
// Benchmark Test Runner, Quality Metrics & Calibration Suite
// ============================================================

import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { PHASE_D_EVALUATION_CASES } from './dist/database/evaluationCases.js';
const EVALUATION_CASES = PHASE_D_EVALUATION_CASES;
import { runRequirementExtractionPipeline } from './dist/services/ai/requirementExtractor.js';
import { matchRequirementsToStandards } from './dist/services/standardsMatcher.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE D — END-TO-END RECOMMENDATION EVALUATION');
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

async function runBenchmark() {
  console.log(`Evaluating ${EVALUATION_CASES.length} benchmark procurement cases against ${VERIFIED_BIS_STANDARDS.length} verified standards...\n`);

  // Aggregate Metrics Counters
  let totalCases = EVALUATION_CASES.length;
  let matchingCasesCount = 0;
  let ambiguousCasesCount = 0;
  let contradictionCasesCount = 0;

  let casesWithAtLeastOneRec = 0;
  let casesWithExpectedRetrieved = 0;
  let top1Matches = 0;
  let top3Matches = 0;
  let top5Matches = 0;

  let correctlyReadyCount = 0;
  let correctlyBlockedCount = 0;
  let contradictionDetectedCount = 0;

  // Domain Breakdown Metrics: { total, top1, top3, top5, retrieved }
  const domainMetrics = {
    Lighting: { total: 0, top1: 0, top3: 0, top5: 0, retrieved: 0 },
    Cables: { total: 0, top1: 0, top3: 0, top5: 0, retrieved: 0 },
    Civil: { total: 0, top1: 0, top3: 0, top5: 0, retrieved: 0 },
    Safety: { total: 0, top1: 0, top3: 0, top5: 0, retrieved: 0 },
  };

  const caseResults = [];

  for (const evalCase of EVALUATION_CASES) {
    const isAmbiguous = evalCase.domain === 'Ambiguous';
    const isContradiction = evalCase.domain === 'Contradiction';

    if (isAmbiguous) ambiguousCasesCount++;
    else if (isContradiction) contradictionCasesCount++;
    else matchingCasesCount++;

    if (domainMetrics[evalCase.domain]) {
      domainMetrics[evalCase.domain].total++;
    }

    // Step 1: Run Requirement Extraction Pipeline
    const extraction = await runRequirementExtractionPipeline(evalCase.input, 'direct_text');
    const reqs = extraction.requirements;

    // Step 2: Readiness Evaluation
    const actualReady = reqs.ready_for_matching;
    const expectedReady = evalCase.should_be_ready_for_matching;
    const readinessMatches = actualReady === expectedReady;

    if (expectedReady && actualReady) correctlyReadyCount++;
    if (!expectedReady && !actualReady) correctlyBlockedCount++;

    let recs = [];
    let top1Std = null;
    let top3Stds = [];
    let expectedFound = false;
    let rankOfExpected = -1;
    let contradictionFlagged = false;

    // Step 3: Standards Matching (if ready)
    if (actualReady) {
      const matchResult = matchRequirementsToStandards(reqs, VERIFIED_BIS_STANDARDS);
      recs = matchResult.recommendations;

      if (recs.length > 0) {
        casesWithAtLeastOneRec++;
        top1Std = recs[0].standard.standard_number;
        top3Stds = recs.slice(0, 3).map((r) => r.standard.standard_number);

        // Check if any expected standard was retrieved
        for (let idx = 0; idx < recs.length; idx++) {
          const rec = recs[idx];
          const matchesExpected = evalCase.expected_standard_numbers.some((exp) =>
            rec.standard.standard_number.includes(exp) || exp.includes(rec.standard.standard_number)
          );

          if (matchesExpected) {
            expectedFound = true;
            if (rankOfExpected === -1) rankOfExpected = idx + 1;
          }

          // Check if contradiction was flagged on any recommendation
          const hasContra = Object.values(rec.factorStatuses).some((f) => f.status === 'contradiction');
          if (hasContra) {
            contradictionFlagged = true;
          }
        }

        if (expectedFound) {
          casesWithExpectedRetrieved++;
          if (rankOfExpected === 1) top1Matches++;
          if (rankOfExpected <= 3) top3Matches++;
          if (rankOfExpected <= 5) top5Matches++;

          if (domainMetrics[evalCase.domain]) {
            domainMetrics[evalCase.domain].retrieved++;
            if (rankOfExpected === 1) domainMetrics[evalCase.domain].top1++;
            if (rankOfExpected <= 3) domainMetrics[evalCase.domain].top3++;
            if (rankOfExpected <= 5) domainMetrics[evalCase.domain].top5++;
          }
        }

        // Verify explainability invariants on returned recommendations
        for (const rec of recs) {
          assert(Boolean(rec.standard && rec.standard.id), `Case ${evalCase.id}: Standard object must be present`);
          assert(typeof rec.score === 'number' && rec.score >= 0 && rec.score <= 1, `Case ${evalCase.id}: Score must be in [0, 1]`);
          assert(Boolean(rec.factorStatuses), `Case ${evalCase.id}: Factor statuses must exist`);
          assert(Array.isArray(rec.evidence) && rec.evidence.length > 0, `Case ${evalCase.id}: Evidence list must be populated`);
          assert(Array.isArray(rec.traceabilityChain) && rec.traceabilityChain.length === 5, `Case ${evalCase.id}: 5-stage traceability chain required`);
        }
      }
    }

    if (isContradiction && contradictionFlagged) {
      contradictionDetectedCount++;
    }

    // Determine Case Success
    let casePassed = false;
    if (isAmbiguous) {
      casePassed = !actualReady;
    } else if (isContradiction) {
      casePassed = contradictionFlagged || expectedFound;
    } else {
      casePassed = expectedFound && rankOfExpected <= 3;
    }

    caseResults.push({
      id: evalCase.id,
      domain: evalCase.domain,
      input: evalCase.input,
      expected: evalCase.expected_standard_numbers,
      actualTop1: top1Std,
      actualTop3: top3Stds,
      expectedFound,
      rankOfExpected,
      ready: actualReady,
      readinessMatches,
      contradictionFlagged,
      passed: casePassed,
    });
  }

  // Calculate Rates
  const totalStandardCases = matchingCasesCount; // 27 standard procurement cases
  const top1Rate = ((top1Matches / totalStandardCases) * 100).toFixed(1);
  const top3Rate = ((top3Matches / totalStandardCases) * 100).toFixed(1);
  const top5Rate = ((top5Matches / totalStandardCases) * 100).toFixed(1);
  const retrievalRate = ((casesWithExpectedRetrieved / totalStandardCases) * 100).toFixed(1);
  const readinessAccuracy = (((correctlyReadyCount + correctlyBlockedCount) / totalCases) * 100).toFixed(1);
  const contradictionAccuracy = ((contradictionDetectedCount / contradictionCasesCount) * 100).toFixed(1);

  // Print Summary Table
  console.log('===========================================================');
  console.log('📊 BENCHMARK EVALUATION SUMMARY');
  console.log('===========================================================');
  console.log(`Total Evaluation Cases:           ${totalCases}`);
  console.log(`  - Standard Procurement Cases:   ${matchingCasesCount}`);
  console.log(`  - Ambiguous (Readiness) Cases:  ${ambiguousCasesCount}`);
  console.log(`  - Contradiction / Conflict Cases: ${contradictionCasesCount}`);
  console.log(`-----------------------------------------------------------`);
  console.log(`Retrieval Performance (Standard Cases):`);
  console.log(`  - Top-1 Match Rate:             ${top1Rate}% (${top1Matches}/${totalStandardCases})`);
  console.log(`  - Top-3 Retrieval Rate:         ${top3Rate}% (${top3Matches}/${totalStandardCases})`);
  console.log(`  - Top-5 Retrieval Rate:         ${top5Rate}% (${top5Matches}/${totalStandardCases})`);
  console.log(`  - Overall Retrieval Rate:       ${retrievalRate}% (${casesWithExpectedRetrieved}/${totalStandardCases})`);
  console.log(`-----------------------------------------------------------`);
  console.log(`Readiness & Governance:`);
  console.log(`  - Ambiguous Cases Blocked:      ${correctlyBlockedCount}/${ambiguousCasesCount} (100%)`);
  console.log(`  - Overall Readiness Accuracy:   ${readinessAccuracy}%`);
  console.log(`  - Contradictions Detected:      ${contradictionDetectedCount}/${contradictionCasesCount} (${contradictionAccuracy}%)`);
  console.log('===========================================================\n');

  console.log('DOMAIN BREAKDOWN:');
  console.log('-------------------------------------------------------------------------');
  console.log('Domain                | Cases | Top-1 | Top-3 | Top-5 | Retrieved | Rate');
  console.log('-------------------------------------------------------------------------');
  for (const [dom, m] of Object.entries(domainMetrics)) {
    const rate = m.total > 0 ? ((m.retrieved / m.total) * 100).toFixed(0) : 'N/A';
    console.log(
      `${dom.padEnd(21)} | ${String(m.total).padStart(5)} | ${String(m.top1).padStart(5)} | ${String(m.top3).padStart(5)} | ${String(m.top5).padStart(5)} | ${String(m.retrieved).padStart(9)} | ${rate}%`
    );
  }
  console.log('-------------------------------------------------------------------------\n');

  // Case-by-Case Log
  console.log('CASE-LEVEL EVALUATION DETAILS:');
  for (const res of caseResults) {
    const statusIcon = res.passed ? '✓ PASS' : '❌ FAIL';
    console.log(`[${statusIcon}] ${res.id} (${res.domain}):`);
    console.log(`  Input: "${res.input.slice(0, 80)}..."`);
    if (res.expected.length > 0) {
      console.log(`  Expected: [${res.expected.join(', ')}]`);
      console.log(`  Top-1:    ${res.actualTop1 || 'None'} (Rank of Expected: ${res.rankOfExpected > 0 ? '#' + res.rankOfExpected : 'Not in top results'})`);
    } else {
      console.log(`  Expected: [BLOCKED / AMBIGUOUS] | Ready: ${res.ready} | Blocked Properly: ${!res.ready}`);
    }
    if (res.domain === 'Contradiction') {
      console.log(`  Contradiction Flagged: ${res.contradictionFlagged}`);
    }
  }
  console.log('\n');

  // ------------------------------------------------------------
  // QUALITY GATES & ASSERTIONS
  // ------------------------------------------------------------
  console.log('Running Benchmark Acceptance Quality Gates...');

  // Gate 1: Benchmark Size
  assert(totalCases >= 25 && totalCases <= 40, `Benchmark size (${totalCases}) must be between 25 and 40 cases`);

  // Gate 2: Ambiguous Cases Blocked (100% precision required for Phase A)
  assert(correctlyBlockedCount === ambiguousCasesCount, `All ${ambiguousCasesCount} ambiguous cases must be blocked from matching`);

  // Gate 3: High Retrieval Performance across standard procurement cases
  assert(parseFloat(top1Rate) >= 70.0, `Top-1 Match Rate (${top1Rate}%) must be >= 70%`);
  assert(parseFloat(top3Rate) >= 85.0, `Top-3 Retrieval Rate (${top3Rate}%) must be >= 85%`);
  assert(parseFloat(retrievalRate) >= 90.0, `Overall Retrieval Rate (${retrievalRate}%) must be >= 90%`);

  // Gate 4: Domain Coverage Balance
  for (const [dom, m] of Object.entries(domainMetrics)) {
    assert(m.total >= 4, `Domain "${dom}" must have at least 4 test cases, found ${m.total}`);
    assert(m.top3 >= 3, `Domain "${dom}" must achieve at least 3 Top-3 retrievals, found ${m.top3}`);
  }

  // Gate 5: Contradiction Detection
  assert(contradictionDetectedCount >= 2, `At least 2 deliberate contradiction cases must flag contradiction status, found ${contradictionDetectedCount}`);

  console.log('\n===========================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE D BENCHMARK GATES PASSED!`);
  console.log('===========================================================');
}

runBenchmark().catch((err) => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
