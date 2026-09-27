// ============================================================
// ISutra: SIH26108 Performance & Scalability Benchmark Suite
// Evaluates matcher and comparison performance against synthetic records
// ZERO FABRICATION: Synthetic records are explicitly labeled and isolated
// Never mixed with verified reference data
// ============================================================

import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { StandardsMatcher } from './dist/services/standardsMatcher.js';
import { compareStandards } from './dist/services/standardsComparator.js';
import { extractWithPatternMatching } from './dist/services/ai/nlpExtractor.js';
import { detectInputLanguage } from './dist/services/ai/multilingualService.js';
import { getOperationalMetricsSummary } from './dist/services/metricsService.js';

console.log('===========================================================');
console.log('⚡ ISUTRA PERFORMANCE & SCALE BENCHMARK (SYNTHETIC ISOLATION)');
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
// 1. GENERATE SYNTHETIC TEST STANDARDS (ISOLATED FROM VERIFIED DATA)
// ------------------------------------------------------------
console.log('\n[1/5] Generating 250 Synthetic Benchmark Records...');
const SYNTHETIC_COUNT = 250;
const syntheticCatalogue = [];

for (let i = 1; i <= SYNTHETIC_COUNT; i++) {
  const pad = String(i).padStart(4, '0');
  syntheticCatalogue.push({
    id: `synthetic-test-${pad}`,
    standard_number: `TEST_STANDARD_${pad}`,
    title: `Synthetic Performance Benchmark Specification #${pad}`,
    category: i % 2 === 0 ? 'Electrical & Electronics' : 'Civil Engineering',
    subcategory: i % 2 === 0 ? 'Synthetic Lighting' : 'Synthetic Concrete',
    product_types: [`Synthetic Product Type ${pad}`, 'Test Apparatus'],
    keywords: ['test', 'synthetic', 'benchmark', 'lighting', 'cable'],
    scope: `Synthetic scope description for performance evaluation #${pad}. Not a real BIS standard.`,
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2024,
    status: 'SYNTHETIC_BENCHMARK_ONLY',
    source_organization: 'Synthetic Test Harness',
    source_url: 'https://example.test/synthetic-benchmark',
    last_verified: '2026-01-01',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  });
}

assert(syntheticCatalogue.length === SYNTHETIC_COUNT, `Generated ${SYNTHETIC_COUNT} synthetic records`);
assert(
  syntheticCatalogue.every((s) => s.standard_number.startsWith('TEST_STANDARD_')),
  'All synthetic standards strictly prefixed with TEST_STANDARD_ to prevent fabrication'
);
assert(
  VERIFIED_BIS_STANDARDS.length === 40,
  'Verified reference dataset remains strictly intact (40 records)'
);

// ------------------------------------------------------------
// 2. MATCHER PERFORMANCE & THROUGHPUT BENCHMARK
// ------------------------------------------------------------
console.log('\n[2/5] Evaluating Matcher Throughput over Synthetic Dataset...');
const testRequirement = extractWithPatternMatching(
  'Outdoor LED street lighting system, 100W, weather resistant, pole mounted, IP65 enclosure, surge protection 10kV.',
  'technical_specification',
  detectInputLanguage('Outdoor LED street lighting system, 100W', 'en')
);

const matcher = new StandardsMatcher();

const startTime = performance.now();
const evalResult = matcher.evaluate(testRequirement, syntheticCatalogue, { minScoreThreshold: 0.1 });
const endTime = performance.now();
const durationMs = endTime - startTime;

console.log(`  ⏱️ Evaluated ${SYNTHETIC_COUNT} standards in ${durationMs.toFixed(2)} ms`);
assert(durationMs < 100, `Evaluation time (${durationMs.toFixed(2)} ms) is well under 100 ms threshold`);
assert(evalResult.metadata.standardsEvaluated === SYNTHETIC_COUNT, `Evaluated exactly ${SYNTHETIC_COUNT} records`);

// ------------------------------------------------------------
// 3. COMPARISON WORKSPACE OVER SYNTHETIC STANDARDS
// ------------------------------------------------------------
console.log('\n[3/5] Evaluating Neutral Comparison over Synthetic Standards...');
const compStart = performance.now();
const compResult = compareStandards(testRequirement, [syntheticCatalogue[0], syntheticCatalogue[1]]);
const compEnd = performance.now();
const compDurationMs = compEnd - compStart;

console.log(`  ⏱️ Compared 2 synthetic standards across 11 dimensions in ${compDurationMs.toFixed(2)} ms`);
assert(compDurationMs < 50, `Comparison latency (${compDurationMs.toFixed(2)} ms) is under 50 ms`);
assert(compResult.standards.length === 2, 'Comparison returned 2 overview entries');
assert(compResult.technicalDistinctions.length === 2, 'Neutral technical distinctions computed');

// ------------------------------------------------------------
// 4. METRICS DEFINITIONS FRAMEWORK VERIFICATION
// ------------------------------------------------------------
console.log('\n[4/5] Verifying Impact Metrics Telemetry Definitions...');
const metricsSnapshot = getOperationalMetricsSummary();
assert(metricsSnapshot.definitions.length === 9, 'All 9 operational impact metrics defined');
assert(
  metricsSnapshot.definitions.some((m) => m.id === 'M1_COMPLETION_RATE'),
  'Analysis Completion Rate (M1) defined'
);
assert(
  metricsSnapshot.definitions.some((m) => m.id === 'M3_REVIEW_CORRECTION_RATE'),
  'Human Review Correction Rate (M3) defined'
);
assert(
  metricsSnapshot.definitions.some((m) => m.id === 'M8_MULTILINGUAL_SUCCESS_RATE'),
  'Multilingual Extraction Success Rate (M8) defined'
);
assert(
  metricsSnapshot.notes.includes('Actual historical metrics must be measured empirically'),
  'Honest telemetry note stating no historical data is fabricated'
);

// ------------------------------------------------------------
// 5. REGRESSION & ISOLATION SAFETY
// ------------------------------------------------------------
console.log('\n[5/5] Isolation Safety Check...');
assert(
  !VERIFIED_BIS_STANDARDS.some((s) => s.standard_number.startsWith('TEST_STANDARD_')),
  'Zero synthetic standards leaked into VERIFIED_BIS_STANDARDS'
);

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------
console.log('\n===========================================================');
console.log(`TOTAL BENCHMARK TESTS RUN: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('===========================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 PERFORMANCE SCALE & METRICS BENCHMARK PASSED!\n');
}
