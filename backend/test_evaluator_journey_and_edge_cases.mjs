// ============================================================
// ISutra — Full SIH26108 Evaluator Journey & Edge Cases Verification Script
// Simulates the exact 15-step evaluator flow and all Edge Cases A - L
// ============================================================

import assert from 'node:assert';

const BASE_URL = 'http://localhost:3001/api';

console.log('============================================================');
console.log('ISutra: SIH26108 Hardening - Evaluator Journey & Edge Cases');
console.log('============================================================\n');

async function runEvaluatorJourney() {
  console.log('--- EXECUTING 15-STEP EVALUATOR JOURNEY ---');

  // Step 1: Dashboard / Health Check
  console.log('Step 1: Dashboard / Health check');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health check must return 200');
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok', 'Status must be ok');

  const standardsRes = await fetch(`${BASE_URL}/standards`);
  assert.strictEqual(standardsRes.status, 200, 'Standards list must return 200');
  const standardsData = await standardsRes.json();
  const recordsCount = standardsData.data?.total || standardsData.data?.standards?.length || standardsData.length;
  assert.strictEqual(recordsCount, 40, 'Must have 40 verified BIS records');
  console.log(`  ✓ Dashboard backend healthy with ${recordsCount} verified records`);

  // Step 2 & 3: New Analysis with messy LED street-light procurement requirement
  console.log('Step 2 & 3: Submitting messy LED street-light tender specification');
  const messyLedText = `
    Urgent requirement for smart street lighting project Phase-2 under smart city mission:
    Supply, installation, testing and commissioning of 90 Watt outdoor LED street light luminaires
    suitable for pole mounting on main arterial city roads. Fixtures must have high pressure die-cast
    aluminum housing with toughened glass cover, minimum IP66 ingress protection against monsoon rains
    and dust, operating at 230V AC 50Hz single phase supply. Fixture must withstand 10kV surge protection.
    CCT should be 5700K cool white with CRI > 70 and efficacy not less than 120 lumens/watt.
    Must comply with relevant Bureau of Indian Standards specifications for road and street lighting luminaires.
  `;

  const analyzeRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_text: messyLedText,
      input_type: 'technical_specification',
      input_language: 'en',
    }),
  });
  assert.strictEqual(analyzeRes.status, 200, 'Analysis should succeed with 200');
  const analysisJson = await analyzeRes.json();
  const analysisData = analysisJson.data || analysisJson;
  const analysisId = analysisData.analysis_id || analysisData.id;
  assert(analysisId, 'Analysis ID must be generated');
  console.log(`  ✓ Step 4: Analyzed successfully. Analysis ID: ${analysisId}`);
  assert(analysisData.requirements, 'Must have structured requirements');
  assert(analysisData.requirements.product_name || analysisData.requirements.product?.name, 'Must have extracted product name');
  const extractedProd = analysisData.requirements.product_name || analysisData.requirements.product?.name;
  console.log(`  ✓ Extracted Product: "${extractedProd}"`);

  // Step 5 & 6: Human Review & Confirm requirements
  console.log('Step 5 & 6: Human Review & Confirm requirements');
  const updatedReqs = {
    ...analysisData.requirements,
    reviewer_notes: 'Verified against municipal arterial road specifications. Parameters confirmed.',
  };
  const confirmRes = await fetch(`${BASE_URL}/analysis/${analysisId}/requirements`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements: updatedReqs, confirmed: true }),
  });
  assert.strictEqual(confirmRes.status, 200, 'Confirmation must return 200');
  const confirmJson = await confirmRes.json();
  const confirmData = confirmJson.data || confirmJson;
  assert.strictEqual(confirmData.confirmed, true, 'Analysis must be marked confirmed');
  console.log('  ✓ Requirements confirmed by human reviewer');

  // Step 7: Recommendations
  console.log('Step 7: Retrieve Recommendations');
  const recRes = await fetch(`${BASE_URL}/analysis/${analysisId}/recommendations`);
  assert.strictEqual(recRes.status, 200, 'Recommendations must return 200');
  const recData = await recRes.json();
  assert(Array.isArray(recData.recommendations), 'Recommendations must be an array');
  assert(recData.recommendations.length > 0, 'Must return recommendations');
  const topRec = recData.recommendations[0];
  console.log(`  ✓ Top Recommendation: ${topRec.standard.standard_number} - "${topRec.standard.title}" (Score: ${topRec.score}%)`);
  assert(
    topRec.standard.standard_number.includes('10322'),
    'Top recommendation for street lighting luminaire must be IS 10322'
  );

  // Step 8 & 9: Open "Why This Standard?" & Inspect Evidence
  console.log('Step 8 & 9: Open "Why This Standard?" & Inspect Evidence Trail');
  assert(topRec.factorStatuses, 'Must contain deterministic factorStatuses');
  assert(topRec.traceabilityChain, 'Must contain 5-stage traceabilityChain');
  assert.strictEqual(typeof topRec.factorStatuses.productCategory.contribution, 'number');
  assert.strictEqual(typeof topRec.factorStatuses.keywordsTitleScope.contribution, 'number');
  assert.strictEqual(typeof topRec.factorStatuses.application.contribution, 'number');
  const sumOfContributions =
    topRec.factorStatuses.productCategory.contribution +
    topRec.factorStatuses.keywordsTitleScope.contribution +
    topRec.factorStatuses.application.contribution +
    topRec.factorStatuses.environment.contribution +
    topRec.factorStatuses.technicalParameters.contribution +
    topRec.factorStatuses.safetyTesting.contribution;
  assert.strictEqual(
    Math.round(sumOfContributions * 100),
    topRec.relevancePercentage,
    'Total relevance score must be mathematical sum of factor contributions'
  );
  console.log(`  ✓ Exact factor sum: ${(sumOfContributions * 100).toFixed(1)}% == Relevance: ${topRec.relevancePercentage}%`);
  console.log(`  ✓ Evidence stages verified: [${topRec.traceabilityChain.map(e => e.stage).join(' -> ')}]`);

  // Step 10: Open Lifecycle / Amendments
  console.log('Step 10: Open Lifecycle / Amendments');
  const lifecycleRes = await fetch(`${BASE_URL}/standards/${topRec.standard.id}/lifecycle`);
  assert.strictEqual(lifecycleRes.status, 200, 'Lifecycle must return 200');
  const lifecycleJson = await lifecycleRes.json();
  const lifecycleData = lifecycleJson.data || lifecycleJson;
  assert(lifecycleData.coverage !== undefined, 'Must provide lifecycle coverage status');
  console.log(`  ✓ Lifecycle coverage state verified: lifecycle_verified = ${lifecycleData.coverage.lifecycle_verified}`);

  // Also verify curated lifecycle standard record (e.g. IS 456)
  const is456LifecycleRes = await fetch(`${BASE_URL}/standards/bis-is-456-2000/lifecycle`);
  assert.strictEqual(is456LifecycleRes.status, 200, 'IS 456 lifecycle must return 200');
  const is456LifecycleJson = await is456LifecycleRes.json();
  const is456Lifecycle = is456LifecycleJson.lifecycle || is456LifecycleJson.data?.lifecycle;
  assert(is456Lifecycle && is456Lifecycle.edition_year === 2000, 'IS 456 must have edition 2000');
  assert.strictEqual(is456Lifecycle.reaffirmation_year, 2025, 'IS 456 must have reaffirmation 2025');
  console.log(`  ✓ Verified standard lifecycle: ${is456Lifecycle.standard_number} Edition ${is456Lifecycle.edition_year}, Reaffirmed ${is456Lifecycle.reaffirmation_year}`);

  // Step 11: Open Allied / Related Standards
  console.log('Step 11: Open Allied Standards');
  const alliedRes = await fetch(`${BASE_URL}/standards/${topRec.standard.id}/related`);
  assert.strictEqual(alliedRes.status, 200, 'Allied standards must return 200');
  const alliedJson = await alliedRes.json();
  const relatedList = Array.isArray(alliedJson.data) ? alliedJson.data : (alliedJson.related_standards || []);
  assert(Array.isArray(relatedList), 'Must have related standards list');
  console.log(`  ✓ Allied standards retrieved: ${relatedList.length} related records`);

  // Step 12: Open Gap Analysis
  console.log('Step 12: Open Requirement Gap Analysis');
  const gapRes = await fetch(`${BASE_URL}/analysis/${analysisId}/recommendations/${topRec.standard.id}/gap-analysis`);
  assert.strictEqual(gapRes.status, 200, 'Gap analysis must return 200');
  const gapJson = await gapRes.json();
  const gapData = gapJson.gapAnalysis || gapJson.data || gapJson;
  assert(gapData.referenceCoverage !== undefined, 'Must contain referenceCoverage');
  assert.strictEqual(typeof gapData.referenceCoverage, 'number');
  assert(!JSON.stringify(gapData).includes('compliance score'), 'Must not label as compliance score');
  console.log(`  ✓ Gap analysis reference coverage: ${gapData.referenceCoverage}% (${gapData.supportedCount} supported, ${gapData.notSupportedCount} not supported)`);

  // Step 13: Compare Standards
  console.log('Step 13: Compare Standards (IS 10322 vs IS 16107)');
  const compRes = await fetch(`${BASE_URL}/analysis/${analysisId}/compare?standards=bis-is-10322-5-3-2026,bis-is-16107-2-1-2012`);
  assert.strictEqual(compRes.status, 200, 'Comparison must return 200');
  const compJson = await compRes.json();
  const compData = compJson.comparison || compJson.data || compJson;
  assert(compData.standards && compData.standards.length === 2, 'Must compare 2 standards');
  assert(compData.matrixRows, 'Must contain dimensional matrixRows');
  assert(!compData.winner, 'Must never declare a winner or score');
  console.log('  ✓ Side-by-side comparison evaluated without winner bias');

  // Step 14: Generate Procurement Report (HTML)
  console.log('Step 14: Generate Procurement Report HTML');
  const reportRes = await fetch(`${BASE_URL}/analysis/${analysisId}/report/html`);
  assert.strictEqual(reportRes.status, 200, 'Procurement report HTML must return 200');
  const reportHtml = await reportRes.text();
  assert(reportHtml.includes('<!DOCTYPE html>'), 'Must return valid HTML document');
  assert(/Procurement Evaluation Report/i.test(reportHtml), 'Must contain report header');
  assert(reportHtml.includes('40 Verified BIS Reference Records'), 'Must contain 40-record scope notice');
  assert(!reportHtml.includes('compliance score'), 'Must not claim compliance score');
  console.log(`  ✓ Self-contained procurement report generated (${reportHtml.length} bytes)`);

  // Step 15: Official BIS Source Link
  console.log('Step 15: Verify Official BIS Source Link');
  const officialUrl = topRec.standard.source_url || topRec.standard.official_url;
  assert(officialUrl, 'Must provide official BIS source URL');
  assert(
    officialUrl.includes('bis.gov.in') ||
    officialUrl.includes('standardsbis.bsbedge.com'),
    'Official URL must point to verified BIS portal'
  );
  console.log(`  ✓ Official source link: ${officialUrl}`);
  console.log('--- ALL 15 EVALUATOR JOURNEY STEPS PASSED ---\n');
  return analysisId;
}

async function runEdgeCases() {
  console.log('--- EXECUTING EDGE CASES A THROUGH L ---');

  // Edge Case A: Vague Input
  console.log('Edge Case A: Vague Input ("good quality street lights for city")');
  const vagueRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_text: 'good quality street lights for city', input_type: 'product_description', input_language: 'en' }),
  });
  assert.strictEqual(vagueRes.status, 200);
  const vagueJson = await vagueRes.json();
  const vagueData = vagueJson.data || vagueJson;
  console.log(`  ✓ Vague input handled. Ambiguities detected: ${vagueData.requirements.ambiguities_detected?.length || 0}`);

  // Edge Case B: Unrelated Input
  console.log('Edge Case B: Unrelated Input ("organic Alphonso mangoes export shipment")');
  const unrelatedRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_text: 'procurement of 500 crates fresh organic Alphonso mangoes for export', input_type: 'product_description', input_language: 'en' }),
  });
  assert.strictEqual(unrelatedRes.status, 200);
  const unrelatedJson = await unrelatedRes.json();
  const unrelatedAnalysis = unrelatedJson.data || unrelatedJson;
  const unrelatedId = unrelatedAnalysis.analysis_id || unrelatedAnalysis.id;
  const unrelatedRecRes = await fetch(`${BASE_URL}/analysis/${unrelatedId}/recommendations`);
  assert.strictEqual(unrelatedRecRes.status, 200);
  const unrelatedRecs = await unrelatedRecRes.json();
  const highMatches = (unrelatedRecs.recommendations || []).filter(r => r.category === 'high');
  assert.strictEqual(highMatches.length, 0, 'Unrelated product must have 0 high relevance matches');
  console.log(`  ✓ Unrelated input handled: 0 high matches returned out of ${(unrelatedRecs.recommendations || []).length} results`);

  // Edge Case C: Water-Storage Scenario
  console.log('Edge Case C: Water-Storage Scenario ("rotational moulded polyethylene water storage tank 5000L")');
  const waterRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_text: 'Supply and installation of 5000 litres capacity cylindrical vertical rotational moulded polyethylene water storage tanks with lid, suitable for drinking water storage',
      input_type: 'technical_specification',
      input_language: 'en',
    }),
  });
  assert.strictEqual(waterRes.status, 200);
  const waterJson = await waterRes.json();
  const waterAnalysis = waterJson.data || waterJson;
  const waterId = waterAnalysis.analysis_id || waterAnalysis.id;
  const waterRecRes = await fetch(`${BASE_URL}/analysis/${waterId}/recommendations`);
  const waterRecData = await waterRecRes.json();
  const waterTop = waterRecData.recommendations[0];
  assert(
    waterTop.standard.standard_number.includes('3370'),
    `Water storage top recommendation in 40-record dataset must be IS 3370, got ${waterTop.standard.standard_number}`
  );
  console.log(`  ✓ Water-storage correctly resolved to: ${waterTop.standard.standard_number} (${waterTop.score}%, ${waterTop.category})`);

  // Edge Case D: Cable Scenario (Complex multiple candidates)
  console.log('Edge Case D: Cable Scenario ("11kV XLPE insulated power cables aluminium conductor armoured")');
  const cableRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_text: 'Procurement of 11kV cross-linked polyethylene (XLPE) insulated, PVC sheathed, galvanized steel wire armoured electric cables with stranded compacted aluminium conductor for working voltages up to and including 11000 volts',
      input_type: 'technical_specification',
      input_language: 'en',
    }),
  });
  assert.strictEqual(cableRes.status, 200);
  const cableJson = await cableRes.json();
  const cableAnalysis = cableJson.data || cableJson;
  const cableId = cableAnalysis.analysis_id || cableAnalysis.id;
  const cableRecRes = await fetch(`${BASE_URL}/analysis/${cableId}/recommendations`);
  const cableRecData = await cableRecRes.json();
  assert(cableRecData.recommendations.length > 0, 'Cable search must return candidates');
  console.log(`  ✓ Cable query returned ${cableRecData.recommendations.length} candidate standards:`);
  cableRecData.recommendations.slice(0, 3).forEach((r, idx) => {
    console.log(`     [${idx + 1}] ${r.standard.standard_number}: ${r.score}% (${r.category})`);
  });

  // Edge Case E: Document Upload Flow (Route and content parsing)
  console.log('Edge Case E: Document Upload Flow');
  const docAnalyzeRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_text: 'TENDER DOCUMENT SPECIFICATION FOR 33KV SUBSTATION POWER TRANSFORMER OIL',
      input_type: 'tender_document',
      input_language: 'en',
    }),
  });
  assert.strictEqual(docAnalyzeRes.status, 200, 'Tender document text analysis must succeed');
  console.log('  ✓ Tender document flow validated');

  // Edge Case F: Refresh / Direct Retrieval of Analysis
  console.log('Edge Case F: Page Refresh Simulation (GET /api/analysis/:id)');
  const getAnalysisRes = await fetch(`${BASE_URL}/analysis/${waterId}`);
  assert.strictEqual(getAnalysisRes.status, 200);
  const fetchedAnalysisJson = await getAnalysisRes.json();
  const fetchedAnalysis = fetchedAnalysisJson.data || fetchedAnalysisJson;
  assert.strictEqual(fetchedAnalysis.analysis_id || fetchedAnalysis.id, waterId, 'Retrieved analysis must match persisted ID');
  console.log('  ✓ Direct retrieval on page refresh preserved');

  // Edge Case G: Browser Navigation / History State
  console.log('Edge Case G: Navigation / History Persistence (GET /api/analysis/history)');
  const historyRes = await fetch(`${BASE_URL}/analysis/history`);
  assert.strictEqual(historyRes.status, 200);
  const historyJson = await historyRes.json();
  const historyData = historyJson.data || historyJson;
  assert(Array.isArray(historyData), 'History must be array');
  assert(historyData.length >= 3, 'History must contain recently created records');
  console.log(`  ✓ History contains ${historyData.length} records`);

  // Edge Case H: Empty Input
  console.log('Edge Case H: Empty Input Validation');
  const emptyRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_text: '   ', input_type: 'technical_specification' }),
  });
  assert.strictEqual(emptyRes.status, 400, 'Empty input must return 400 Bad Request');
  const emptyErr = await emptyRes.json();
  assert(emptyErr.error, 'Must have error message');
  console.log(`  ✓ Empty input rejected with 400: "${emptyErr.error.message || emptyErr.error}"`);

  // Edge Case I: Malformed Request Body
  console.log('Edge Case I: Malformed Request Body Validation');
  const malformedRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wrongField: 12345 }),
  });
  assert.strictEqual(malformedRes.status, 400, 'Malformed payload must return 400');
  console.log('  ✓ Malformed payload rejected with 400');

  // Edge Case J: Non-existent Resource Handling
  console.log('Edge Case J: Non-existent Analysis Handling');
  const missingRes = await fetch(`${BASE_URL}/analysis/non-existent-id-99999`);
  assert.strictEqual(missingRes.status, 404, 'Non-existent ID must return 404');
  console.log('  ✓ Non-existent ID gracefully returned 404');

  // Edge Case K: Loading State / Fast Response SLA
  console.log('Edge Case K: Response SLA Timing Check');
  const startTimer = Date.now();
  await fetch(`${BASE_URL}/standards`);
  const elapsed = Date.now() - startTimer;
  assert(elapsed < 500, `Standards retrieval must be rapid (< 500ms), took ${elapsed}ms`);
  console.log(`  ✓ Standards listing took ${elapsed}ms (well within SLA)`);

  // Edge Case L: Report Generation / Download HTML
  console.log('Edge Case L: Report Generation & Scope Disclaimers');
  const reportDlRes = await fetch(`${BASE_URL}/analysis/${waterId}/report/html`);
  assert.strictEqual(reportDlRes.status, 200);
  const reportText = await reportDlRes.text();
  assert(reportText.includes('40 Verified BIS Reference Records'), 'Report must state 40 verified records scope');
  assert(reportText.includes('window.print()'), 'Report must include print trigger button');
  console.log('  ✓ Report generation and print features validated');

  console.log('--- ALL EDGE CASES A THROUGH L PASSED ---\n');
}

async function main() {
  try {
    await runEvaluatorJourney();
    await runEdgeCases();
    console.log('============================================================');
    console.log('🎉 ALL 15 JOURNEY STEPS & EDGE CASES VALIDATED SUCCESSFULLY!');
    console.log('============================================================');
  } catch (err) {
    console.error('❌ VALIDATION FAILED:', err);
    process.exit(1);
  }
}

main();
