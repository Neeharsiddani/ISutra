// ============================================================
// ISutra: Phase 9B — BIS Lifecycle & Amendment Intelligence Test Suite
// Verifies lifecycle service, API routes, formatting, and invariants
// ============================================================

import assert from 'node:assert';
import { execSync } from 'node:child_process';
import express from 'express';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { VERIFIED_STANDARD_LIFECYCLES } from './dist/database/verifiedStandardLifecycles.js';
import { VERIFIED_STANDARD_AMENDMENTS } from './dist/database/verifiedStandardAmendments.js';
import { VERIFIED_RELATIONSHIPS } from './dist/database/verifiedRelationships.js';
import { getStandardLifecycle } from './dist/services/standardLifecycleService.js';
import { formatReportDate } from './dist/services/procurementReportService.js';
import standardsRouterModule from './dist/routes/standards.js';
const standardsRouter = standardsRouterModule.default || standardsRouterModule;

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE 9B — BIS LIFECYCLE & AMENDMENT TEST SUITE');
console.log('===========================================================');

let passCount = 0;
function testAssert(condition, message) {
  assert(condition, message);
  passCount++;
  console.log(`  ✓ ${message}`);
}

async function runPhase9BTests() {
  // ------------------------------------------------------------
  // TEST A: Lifecycle Endpoint Works (Express HTTP test)
  // ------------------------------------------------------------
  console.log('\nTest A: Verifying GET /api/standards/:id/lifecycle endpoint...');
  const app = express();
  app.use(express.json());
  app.use('/api/standards', standardsRouter);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/standards`;

  try {
    const res = await fetch(`${baseUrl}/bis-is-456-2000/lifecycle`);
    testAssert(res.status === 200, 'HTTP GET /api/standards/:id/lifecycle returns 200 OK');

    const json = await res.json();
    testAssert(json && typeof json === 'object', 'Response is valid JSON object');
    testAssert('lifecycle' in json, 'Response has lifecycle property');
    testAssert('amendments' in json && Array.isArray(json.amendments), 'Response has amendments array');
    testAssert('coverage' in json && typeof json.coverage === 'object', 'Response has coverage object');
    testAssert('notice' in json && typeof json.notice === 'string', 'Response has notice string');

    // ------------------------------------------------------------
    // TEST B: Known Lifecycle Record Returns Correct Evidence
    // ------------------------------------------------------------
    console.log('\nTest B: Verifying known lifecycle records return complete evidence...');
    const lc456 = getStandardLifecycle('bis-is-456-2000');
    testAssert(lc456.lifecycle !== null, 'IS 456:2000 returns non-null lifecycle');
    testAssert(lc456.lifecycle.edition_number === 'Fourth Revision', 'IS 456:2000 edition_number is "Fourth Revision"');
    testAssert(lc456.lifecycle.edition_year === 2000, 'IS 456:2000 edition_year is 2000');
    testAssert(lc456.lifecycle.lifecycle_status === 'reaffirmed', 'IS 456:2000 status is "reaffirmed"');
    testAssert(lc456.lifecycle.reaffirmation_year === 2025, 'IS 456:2000 reaffirmation_year is 2025');
    testAssert(lc456.coverage.lifecycle_verified === true, 'coverage.lifecycle_verified is true');

    const lc383 = getStandardLifecycle('bis-is-383-2016');
    testAssert(lc383.lifecycle !== null, 'IS 383:2016 returns non-null lifecycle');
    testAssert(lc383.lifecycle.edition_number === 'Third Revision', 'IS 383:2016 edition_number is "Third Revision"');
    testAssert(lc383.lifecycle.supersedes_standard_number === 'IS 383:1970', 'IS 383:2016 supersedes IS 383:1970');

    const lc7098 = getStandardLifecycle('bis-is-7098-1-2025');
    testAssert(lc7098.lifecycle !== null, 'IS 7098 (Part 1):2025 returns non-null lifecycle');
    testAssert(
      lc7098.lifecycle.supersedes_standard_number === 'IS 7098 (Part 1):1988',
      'IS 7098 (Part 1):2025 supersedes IS 7098 (Part 1):1988'
    );
    testAssert(lc7098.lifecycle.edition_number === 'Third Revision', 'IS 7098 (Part 1):2025 edition_number is "Third Revision"');
    testAssert(lc7098.lifecycle.transition_end_date === '2025-12-09', 'Transition end date is 2025-12-09');
    testAssert(lc7098.lifecycle.transition_end_date !== '2026-03-31', 'Transition end date must not be fabricated date "2026-03-31"');

    const lc10322 = getStandardLifecycle('bis-is-10322-5-3-2026');
    testAssert(lc10322.lifecycle !== null, 'IS 10322 (Part 5/Sec 3):2026 returns non-null lifecycle');
    testAssert(lc10322.lifecycle.edition_number === 'Second Revision', 'IS 10322 (Part 5/Sec 3):2026 is strictly "Second Revision" per official evidence');
    testAssert(lc10322.lifecycle.edition_number !== 'First Revision', 'IS 10322 (Part 5/Sec 3):2026 must NOT regress to "First Revision"');
    testAssert(lc10322.lifecycle.supersedes_standard_number === 'IS 10322 (Part 5/Sec 3):2012', 'IS 10322 (Part 5/Sec 3):2026 supersedes 2012 edition');
    testAssert(lc10322.lifecycle.lifecycle_status === 'current', 'IS 10322 (Part 5/Sec 3):2026 lifecycle_status is "current"');

    const lc8519 = getStandardLifecycle('bis-is-8519-2024');
    testAssert(lc8519.lifecycle !== null, 'IS 8519:2024 returns non-null lifecycle');
    testAssert(lc8519.lifecycle.edition_number === 'First Revision', 'IS 8519:2024 is strictly "First Revision" per official evidence');
    testAssert(lc8519.lifecycle.supersedes_standard_number === 'IS 8519:1977', 'IS 8519:2024 supersedes 1977 edition');

    const lc15748 = getStandardLifecycle('bis-is-15748-2022');
    testAssert(lc15748.lifecycle !== null, 'IS 15748:2022 returns non-null lifecycle');
    testAssert(lc15748.lifecycle.lifecycle_status === 'amended', 'IS 15748:2022 status is "amended"');
    testAssert(
      lc15748.lifecycle.gazette_notification_ref === 'Notification No. HQ-PUB015/1/2020-PUB-BIS (1121)',
      'IS 15748:2022 has Gazette notification ref'
    );

    // ------------------------------------------------------------
    // TEST C: Unknown Lifecycle Returns Safe Empty State
    // ------------------------------------------------------------
    console.log('\nTest C: Verifying unknown lifecycle records return safe empty state...');
    const lcUnknown = getStandardLifecycle('bis-is-1905-1987');
    testAssert(lcUnknown.lifecycle === null, 'Standards without lifecycle evidence return null lifecycle');
    testAssert(lcUnknown.coverage.lifecycle_verified === false, 'coverage.lifecycle_verified is false');
    testAssert(
      lcUnknown.notice.includes('Lifecycle evidence not currently available in the curated ISutra reference dataset'),
      'Notice contains safe fallback wording for lifecycle'
    );
    testAssert(
      lcUnknown.notice.includes('Verify edition, revision, reaffirmation, withdrawal, and supersession status from the official BIS source'),
      'Notice instructs verifying with official BIS source'
    );

    // ------------------------------------------------------------
    // TEST D: Known Amendment History Returns All Amendments
    // ------------------------------------------------------------
    console.log('\nTest D: Verifying known amendment history returns all records...');
    testAssert(lc456.amendments.length === 6, `IS 456:2000 has exactly 6 amendments (found: ${lc456.amendments.length})`);
    testAssert(lc456.coverage.amendment_count === 6, 'coverage.amendment_count is 6');
    testAssert(lc456.coverage.amendments_verified === true, 'coverage.amendments_verified is true');

    testAssert(lc383.amendments.length === 2, `IS 383:2016 has exactly 2 amendments (found: ${lc383.amendments.length})`);
    const lc1786 = getStandardLifecycle('bis-is-1786-2008');
    testAssert(lc1786.amendments.length === 4, `IS 1786:2008 has exactly 4 amendments (found: ${lc1786.amendments.length})`);
    const lc694 = getStandardLifecycle('bis-is-694-2010');
    testAssert(lc694.amendments.length === 3, `IS 694:2010 has exactly 3 amendments (found: ${lc694.amendments.length})`);
    testAssert(lc15748.amendments.length === 3, `IS 15748:2022 has exactly 3 amendments (found: ${lc15748.amendments.length})`);

    // ------------------------------------------------------------
    // TEST E: Amendment Ordering is Deterministic
    // ------------------------------------------------------------
    console.log('\nTest E: Verifying deterministic chronological ordering by amendment_number...');
    const amdNums = lc456.amendments.map((a) => a.amendment_number);
    testAssert(
      JSON.stringify(amdNums) === JSON.stringify([1, 2, 3, 4, 5, 6]),
      `IS 456 amendments ordered strictly 1..6 (found: ${amdNums.join(', ')})`
    );

    const amdNums383 = lc383.amendments.map((a) => a.amendment_number);
    testAssert(
      JSON.stringify(amdNums383) === JSON.stringify([1, 2]),
      `IS 383 amendments ordered strictly 1..2 (found: ${amdNums383.join(', ')})`
    );

    const amdNums1786 = lc1786.amendments.map((a) => a.amendment_number);
    testAssert(
      JSON.stringify(amdNums1786) === JSON.stringify([1, 2, 3, 4]),
      `IS 1786 amendments ordered strictly 1..4 (found: ${amdNums1786.join(', ')})`
    );

    // ------------------------------------------------------------
    // TEST F: Partial Dates Remain Partial (Granularity Preserved)
    // ------------------------------------------------------------
    console.log('\nTest F: Verifying partial dates preserve source granularity...');
    const amd1_456 = lc456.amendments.find((a) => a.amendment_number === 1);
    testAssert(amd1_456.publication_date === '2001-06', `Publication date '2001-06' has no fabricated day`);

    const amd1_1786 = lc1786.amendments.find((a) => a.amendment_number === 1);
    testAssert(amd1_1786.publication_date === '2012', `Publication date '2012' has no fabricated month or day`);

    const amd1_383 = lc383.amendments.find((a) => a.amendment_number === 1);
    testAssert(amd1_383.establishment_date === '2017-09-26', `Establishment date '2017-09-26' has full date preserved`);

    testAssert(formatReportDate('2001-06') === 'June 2001', 'formatReportDate("2001-06") -> "June 2001"');
    testAssert(formatReportDate('2019') === '2019', 'formatReportDate("2019") -> "2019"');
    testAssert(formatReportDate('2024-12-24') === '24 Dec 2024', 'formatReportDate("2024-12-24") -> "24 Dec 2024"');

    // ------------------------------------------------------------
    // TEST G: Missing Amendment Evidence Uses Safe Wording
    // ------------------------------------------------------------
    console.log('\nTest G: Verifying safe wording for standards without verified amendment records...');
    testAssert(
      lcUnknown.amendments.length === 0,
      'Standard with no amendment evidence returns empty array'
    );
    testAssert(
      lcUnknown.coverage.amendments_verified === false,
      'coverage.amendments_verified is false for unrecorded standard'
    );
    testAssert(
      lcUnknown.coverage.amendment_count === 0,
      'coverage.amendment_count is 0'
    );
    testAssert(
      !lcUnknown.notice.toLowerCase().includes('no amendments'),
      'Notice must not contain the phrase "no amendments"'
    );

    // ------------------------------------------------------------
    // TEST H: No "No amendments" Claim Is Generated Across Catalogue
    // ------------------------------------------------------------
    console.log('\nTest H: Verifying no exhaustive "no amendments" negative claims exist...');
    for (const std of VERIFIED_BIS_STANDARDS) {
      const lc = getStandardLifecycle(std.id);
      testAssert(
        !lc.notice.toLowerCase().includes('no amendments'),
        `Notice for ${std.standard_number} must not make "no amendments" claim`
      );
      testAssert(
        !lc.notice.toLowerCase().includes('0 amendments'),
        `Notice for ${std.standard_number} must not make "0 amendments" claim`
      );
    }

    // ------------------------------------------------------------
    // TEST I: Reaffirmation Is NOT Treated As Amendment
    // ------------------------------------------------------------
    console.log('\nTest I: Verifying reaffirmation is distinct from amendments...');
    testAssert(
      lc456.lifecycle.reaffirmation_year === 2025,
      'IS 456:2000 reaffirmation is tracked as reaffirmation_year'
    );
    testAssert(
      !lc456.amendments.some((a) => a.summary.toLowerCase().includes('reaffirmed') && !a.amendment_label),
      'Reaffirmation is not injected as a pseudo-amendment'
    );
    testAssert(
      lc456.amendments.length === 6,
      'Amendment count strictly equals count of formal amendments'
    );

    // ------------------------------------------------------------
    // TEST J: Revision Is NOT Treated As Amendment
    // ------------------------------------------------------------
    console.log('\nTest J: Verifying revision edition is distinct from amendments...');
    testAssert(
      lc456.lifecycle.edition_number === 'Fourth Revision',
      'Revision edition is tracked in lifecycle.edition_number'
    );
    testAssert(
      !lc456.amendments.some((a) => a.amendment_label.toLowerCase().includes('revision')),
      'Revision edition is not mixed into amendments list'
    );

    // ------------------------------------------------------------
    // TEST K: Supersession Direction Is Preserved
    // ------------------------------------------------------------
    console.log('\nTest K: Verifying supersession directionality is preserved...');
    testAssert(
      lc383.lifecycle.supersedes_standard_number === 'IS 383:1970',
      'IS 383:2016 supersedes IS 383:1970'
    );
    testAssert(
      lc383.lifecycle.superseded_by_standard_number === undefined,
      'IS 383:2016 is not superseded by any standard in dataset'
    );
    testAssert(
      lc7098.lifecycle.supersedes_standard_number === 'IS 7098 (Part 1):1988',
      'IS 7098 (Part 1):2025 supersedes IS 7098 (Part 1):1988'
    );
    testAssert(
      lc7098.lifecycle.superseded_by_standard_number === undefined,
      'IS 7098 (Part 1):2025 does not have superseded_by in dataset'
    );

    // ------------------------------------------------------------
    // TEST L: Official Source URL Is Present
    // ------------------------------------------------------------
    console.log('\nTest L: Verifying official source URLs are present in all records...');
    for (const lc of VERIFIED_STANDARD_LIFECYCLES) {
      testAssert(
        lc.verified_source_url && lc.verified_source_url.startsWith('https://'),
        `Lifecycle ${lc.id} has valid HTTPS official source URL`
      );
    }
    for (const amd of VERIFIED_STANDARD_AMENDMENTS) {
      testAssert(
        amd.verified_source_url && amd.verified_source_url.startsWith('https://'),
        `Amendment ${amd.id} has valid HTTPS official source URL`
      );
    }

    // ------------------------------------------------------------
    // TEST M: Protected verifiedStandards.ts Remains Unchanged
    // ------------------------------------------------------------
    console.log('\nTest M: Verifying protected verifiedStandards.ts remains unchanged...');
    const diffStandards = execSync('git diff -- backend/src/database/verifiedStandards.ts', {
      encoding: 'utf-8',
    }).trim();
    testAssert(diffStandards === '', 'git diff for verifiedStandards.ts must be completely empty');
    testAssert(VERIFIED_BIS_STANDARDS.length === 40, 'verifiedStandards.ts has exactly 40 records');

    // ------------------------------------------------------------
    // TEST N: Matcher Remains Unchanged
    // ------------------------------------------------------------
    console.log('\nTest N: Verifying standardsMatcher.ts remains unchanged...');
    const diffMatcher = execSync('git diff -- backend/src/services/standardsMatcher.ts', {
      encoding: 'utf-8',
    }).trim();
    testAssert(diffMatcher === '', 'git diff for standardsMatcher.ts must be completely empty');

    // ------------------------------------------------------------
    // TEST O: Phase 8B Relationships Remain Unchanged
    // ------------------------------------------------------------
    console.log('\nTest O: Verifying Phase 8B relationships remain unchanged...');
    const diffRels = execSync('git diff -- backend/src/database/verifiedRelationships.ts', {
      encoding: 'utf-8',
    }).trim();
    testAssert(diffRels === '', 'git diff for verifiedRelationships.ts must be completely empty');
    testAssert(VERIFIED_RELATIONSHIPS.length === 6, 'verifiedRelationships has exactly 6 records');
  } finally {
    server.close();
  }

  console.log('\n===========================================================');
  console.log(`🎉 ALL PHASE 9B TESTS PASSED (${passCount} assertions)`);
  console.log('===========================================================');
}

runPhase9BTests().catch((err) => {
  console.error('\n❌ PHASE 9B TEST FAILURE:', err);
  process.exit(1);
});
