// ============================================================
// ISutra — Live Demo Scenarios Verification (A through G)
// Tests: Analyze -> Review -> Recommendations -> Why This Standard
//        -> Evidence -> Lifecycle -> Allied Standards -> Gap Analysis
//        -> Compare -> Report
// ============================================================

import assert from 'node:assert';

const BASE_URL = 'http://localhost:3001/api';

console.log('============================================================');
console.log('ISutra — Live Demo Scenarios End-to-End Verification');
console.log('============================================================\n');

const SCENARIOS = [
  {
    id: 'A',
    name: 'LED Street Lighting (English)',
    text: 'Supply and installation of 90W outdoor LED street lighting luminaire for municipal roads, pole mounted, die-cast aluminium housing, IP66 ingress protection, 10kV surge protection, 5700K CCT',
    type: 'technical_specification',
    lang: 'en',
    expectedTopStandard: 'IS 10322 (Part 5/Sec 3)',
    expectedMinScore: 75,
  },
  {
    id: 'B',
    name: 'Water Storage (Civil / Liquid Storage)',
    text: 'Concrete structures for retaining aqueous liquids and water storage tanks, civil engineering specification',
    type: 'technical_specification',
    lang: 'en',
    expectedTopStandard: 'IS 3370 (Part 1)',
    expectedMinScore: 40,
  },
  {
    id: 'C',
    name: 'High-Temperature Cable (Electrical)',
    text: 'Halogen free flame retardant (HFFR) cables for working voltages up to and including 1100V, heat resistant low smoke zero halogen insulation for commercial buildings',
    type: 'technical_specification',
    lang: 'en',
    expectedTopStandard: 'IS 17048',
    expectedMinScore: 45,
  },
  {
    id: 'D',
    name: 'Vague Input (Defensive Guardrail)',
    text: 'need something good for municipal project urgent',
    type: 'product_description',
    lang: 'en',
    isVague: true,
  },
  {
    id: 'E',
    name: 'Unrelated Input (Domain Boundary Guardrail)',
    text: 'procurement of 500 crates organic Alphonso mangoes for agricultural export shipment',
    type: 'product_description',
    lang: 'en',
    isUnrelated: true,
  },
  {
    id: 'F',
    name: 'Hindi LED Procurement Input',
    text: 'नगरपालिका सड़कों के लिए 90W आउटडोर एलईडी स्ट्रीट लाइट ल्यूमिनेयर, पोल पर लगाने हेतु, IP66 इनग्रेस प्रोटेक्शन, 10kV सर्ज प्रोटेक्शन, 5700K',
    type: 'technical_specification',
    lang: 'hi',
    expectedTopStandard: 'IS 10322 (Part 5/Sec 3)',
    expectedMinScore: 70,
  },
  {
    id: 'G',
    name: 'Telugu LED Procurement Input',
    text: 'మున్సిపల్ రోడ్ల కోసం 90W అవుట్‌డోర్ ఎల్‌ఈడీ స్ట్రీట్ లైట్లు సరఫరా, పోల్ మౌంటెడ్, IP66 ప్రొటెక్షన్, 10kV సర్జ్ ప్రొటెక్షన్',
    type: 'technical_specification',
    lang: 'te',
    expectedTopStandard: 'IS 10322 (Part 5/Sec 3)',
    expectedMinScore: 70,
  },
];

async function runScenario(scenario) {
  console.log(`\n============================================================`);
  console.log(`SCENARIO ${scenario.id}: ${scenario.name}`);
  console.log(`============================================================`);

  // 1. Analyze
  console.log('1. Analyze API:');
  const analyzeRes = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_text: scenario.text,
      input_type: scenario.type,
      input_language: scenario.lang,
    }),
  });
  assert.strictEqual(analyzeRes.status, 200, `Analyze status must be 200 for ${scenario.id}`);
  const analyzeJson = await analyzeRes.json();
  const analysis = analyzeJson.data || analyzeJson;
  const analysisId = analysis.analysis_id || analysis.id;
  assert(analysisId, 'Must generate analysis ID');
  console.log(`   ✓ Analysis ID: ${analysisId}`);
  console.log(`   ✓ Product Name: "${analysis.requirements?.product_name || analysis.requirements?.product?.name}"`);

  // Handle Vague Scenario Guardrail
  if (scenario.isVague) {
    console.log('   ✓ Checking Vague Input Guardrail...');
    const recRes = await fetch(`${BASE_URL}/analysis/${analysisId}/recommendations`);
    const recJson = await recRes.json();
    if (recRes.status === 400) {
      console.log(`   ✓ Correctly returned 400 with clarification required: "${recJson.error?.message}"`);
    } else {
      const highRecs = (recJson.recommendations || []).filter(r => r.category === 'high');
      assert.strictEqual(highRecs.length, 0, 'Vague input must produce 0 high relevance matches');
      console.log(`   ✓ Vague input produced 0 high matches`);
    }
    return;
  }

  // Handle Unrelated Scenario Guardrail
  if (scenario.isUnrelated) {
    console.log('   ✓ Checking Unrelated Domain Guardrail...');
    const recRes = await fetch(`${BASE_URL}/analysis/${analysisId}/recommendations`);
    assert.strictEqual(recRes.status, 200);
    const recJson = await recRes.json();
    const highRecs = (recJson.recommendations || []).filter(r => r.category === 'high');
    assert.strictEqual(highRecs.length, 0, 'Unrelated input must return 0 high relevance matches');
    console.log(`   ✓ Unrelated domain produced 0 high matches (Total results: ${(recJson.recommendations || []).length})`);
    return;
  }

  // 2. Review & Confirm Requirements
  console.log('2. Review & Confirm Requirements:');
  const confirmRes = await fetch(`${BASE_URL}/analysis/${analysisId}/requirements`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requirements: {
        ...analysis.requirements,
        confirmed_by: 'Demo Reviewer',
      },
      confirmed: true,
    }),
  });
  assert.strictEqual(confirmRes.status, 200);
  console.log('   ✓ Requirements confirmed successfully');

  // 3. Recommendations
  console.log('3. Recommendations:');
  const recRes = await fetch(`${BASE_URL}/analysis/${analysisId}/recommendations`);
  assert.strictEqual(recRes.status, 200);
  const recJson = await recRes.json();
  const recs = recJson.recommendations || [];
  assert(recs.length > 0, 'Must return recommendations');
  const topRec = recs[0];
  console.log(`   ✓ Top Recommendation: ${topRec.standard.standard_number} (${topRec.relevancePercentage}%)`);
  assert(
    topRec.standard.standard_number.includes(scenario.expectedTopStandard),
    `Top standard must contain ${scenario.expectedTopStandard}, got: ${topRec.standard.standard_number}`
  );
  assert(
    topRec.relevancePercentage >= scenario.expectedMinScore,
    `Score ${topRec.relevancePercentage}% must be >= expected ${scenario.expectedMinScore}%`
  );

  // 4. "Why This Standard?" Factor Contribution Derivation
  console.log('4. "Why This Standard?" Factor Contribution Derivation:');
  const factors = topRec.factorStatuses;
  assert(factors, 'Must have factorStatuses');
  const sumContributions =
    factors.productCategory.contribution +
    factors.keywordsTitleScope.contribution +
    factors.application.contribution +
    factors.environment.contribution +
    factors.technicalParameters.contribution +
    factors.safetyTesting.contribution;
  const roundedSum = Math.round(sumContributions * 100);
  console.log(`   ✓ Product: ${Math.round(factors.productCategory.contribution * 100)}% (Weight: ${Math.round(factors.productCategory.weight * 100)}%)`);
  console.log(`   ✓ Keywords: ${Math.round(factors.keywordsTitleScope.contribution * 100)}% (Weight: ${Math.round(factors.keywordsTitleScope.weight * 100)}%)`);
  console.log(`   ✓ Application: ${Math.round(factors.application.contribution * 100)}% (Weight: ${Math.round(factors.application.weight * 100)}%)`);
  console.log(`   ✓ Environment: ${Math.round(factors.environment.contribution * 100)}% (Weight: ${Math.round(factors.environment.weight * 100)}%)`);
  console.log(`   ✓ Technical: ${Math.round(factors.technicalParameters.contribution * 100)}% (Weight: ${Math.round(factors.technicalParameters.weight * 100)}%)`);
  console.log(`   ✓ Safety: ${Math.round(factors.safetyTesting.contribution * 100)}% (Weight: ${Math.round(factors.safetyTesting.weight * 100)}%)`);
  console.log(`   ✓ Exact Sum: ${roundedSum}% == Displayed Relevance: ${topRec.relevancePercentage}%`);
  assert.strictEqual(roundedSum, topRec.relevancePercentage, 'Mathematical sum must strictly equal relevance score');

  // 5. Evidence Trail (5 Stages)
  console.log('5. Evidence Trail (5 Stages):');
  assert(Array.isArray(topRec.traceabilityChain), 'Must have traceabilityChain');
  assert.strictEqual(topRec.traceabilityChain.length, 5, 'Must contain 5 stages');
  const stages = topRec.traceabilityChain.map(s => s.stage);
  console.log(`   ✓ Stages: [${stages.join(' -> ')}]`);
  assert.strictEqual(stages[0], 'user_input');
  assert.strictEqual(stages[4], 'official_bis_source');

  // 6. Lifecycle & Amendments
  console.log('6. Lifecycle & Amendments:');
  const lcRes = await fetch(`${BASE_URL}/standards/${topRec.standard.id}/lifecycle`);
  assert.strictEqual(lcRes.status, 200);
  const lcJson = await lcRes.json();
  const lcData = lcJson.data || lcJson;
  console.log(`   ✓ Lifecycle coverage status: verified = ${lcData.coverage?.lifecycle_verified}`);

  // 7. Allied Standards
  console.log('7. Allied Standards:');
  const alliedRes = await fetch(`${BASE_URL}/standards/${topRec.standard.id}/related`);
  assert.strictEqual(alliedRes.status, 200);
  const alliedJson = await alliedRes.json();
  const alliedList = Array.isArray(alliedJson.data) ? alliedJson.data : (alliedJson.related_standards || []);
  console.log(`   ✓ Allied Standards count: ${alliedList.length}`);

  // 8. Gap Analysis
  console.log('8. Gap Analysis:');
  const gapRes = await fetch(`${BASE_URL}/analysis/${analysisId}/recommendations/${topRec.standard.id}/gap-analysis`);
  assert.strictEqual(gapRes.status, 200);
  const gapJson = await gapRes.json();
  const gap = gapJson.gapAnalysis || gapJson.data || gapJson;
  console.log(`   ✓ Reference Coverage: ${gap.referenceCoverage}% (${gap.supportedCount} supported, ${gap.notSupportedCount} not supported)`);
  assert(!JSON.stringify(gap).includes('compliance score'), 'Must not claim compliance score');

  // 9. Compare Standards
  console.log('9. Compare Standards:');
  const compareTargetId = recs.length > 1 ? recs[1].standard.id : 'bis-is-16107-2-1-2012';
  const compRes = await fetch(`${BASE_URL}/analysis/${analysisId}/compare?standards=${topRec.standard.id},${compareTargetId}`);
  assert.strictEqual(compRes.status, 200);
  const compJson = await compRes.json();
  const comp = compJson.comparison || compJson.data || compJson;
  assert(comp.matrixRows && comp.matrixRows.length >= 5, 'Must have matrix rows');
  assert(!comp.winner, 'Must never produce a winner');
  console.log(`   ✓ Compared ${comp.standards?.length || 2} standards across ${comp.matrixRows.length} dimensions (strictly neutral)`);

  // 10. Procurement Report HTML
  console.log('10. Procurement Report HTML:');
  const reportRes = await fetch(`${BASE_URL}/analysis/${analysisId}/report/html`);
  assert.strictEqual(reportRes.status, 200);
  const reportHtml = await reportRes.text();
  assert(/Procurement Evaluation Report/i.test(reportHtml), 'Must have report title');
  assert(reportHtml.includes('40 Verified BIS Reference Records'), 'Must state 40 records scope');
  assert(!reportHtml.includes('compliance score'), 'Must not claim compliance score');
  console.log(`   ✓ Report generated successfully (${reportHtml.length} bytes)`);
}

async function main() {
  try {
    for (const sc of SCENARIOS) {
      await runScenario(sc);
    }
    console.log('\n============================================================');
    console.log('🎉 ALL 7 DEMO SCENARIOS (A THROUGH G) VALIDATED SUCCESSFULLY!');
    console.log('============================================================\n');
  } catch (err) {
    console.error('❌ SCENARIO FAILED:', err);
    process.exit(1);
  }
}

main();
