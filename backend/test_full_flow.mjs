// ============================================================
// ISutra — Phase 2 Critical Functional & Error Test Suite
// ============================================================

async function runFullVerification() {
  const API_BASE = 'http://localhost:3001/api';
  console.log('===========================================================');
  console.log('🔍 ISUTRA PHASE 2 — END-TO-END FUNCTIONAL VERIFICATION');
  console.log('===========================================================\n');

  // STEP 1 & 2: Health check
  console.log('Step 1: Checking Backend Health...');
  const healthRes = await fetch(`${API_BASE}/health`);
  const health = await healthRes.json();
  if (health.status !== 'ok') throw new Error('Health check failed');
  console.log('✅ Backend is healthy:', health.service, '|', health.phase);

  // STEP 3 & 4 & 5: Submit specification
  console.log('\nStep 2: Submitting Specification for Analysis...');
  const specText = 'Outdoor LED street lighting system, 100W, weather resistant, pole mounted.';
  const analyzeRes = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_type: 'product_description',
      input_text: specText,
    }),
  });
  if (!analyzeRes.ok) throw new Error(`Analysis failed with status ${analyzeRes.status}`);
  const analyzeData = await analyzeRes.json();
  const analysisId = analyzeData.data.analysis_id;
  const reqs = analyzeData.data.requirements;

  console.log('✅ Analysis successful! ID:', analysisId);
  console.log('   Demo Mode Flag:', analyzeData.demo);
  console.log('   Warning:', analyzeData.warning || 'None');
  console.log('   Product:', reqs.product.name);
  console.log('   Application:', reqs.application);
  console.log('   Technical Parameters:', reqs.technical_parameters.map(p => `${p.parameter}: ${p.value}`));
  console.log('   Environment:', reqs.environment.map(e => e.name));
  console.log('   Installation:', reqs.installation_requirements.map(i => i.name));
  console.log('   Missing Information:', reqs.missing_information);

  // Verification assertions
  if (!reqs.product.name.toLowerCase().includes('led street lighting system')) {
    throw new Error(`Expected product 'LED street lighting system', got '${reqs.product.name}'`);
  }
  if (!reqs.application || (!reqs.application.toLowerCase().includes('outdoor') && !reqs.application.toLowerCase().includes('road') && !reqs.application.toLowerCase().includes('lighting'))) {
    throw new Error(`Expected application 'Outdoor' or 'Highway & Municipal road lighting', got '${reqs.application}'`);
  }
  if (!reqs.technical_parameters.some(p => p.parameter === 'Power' && p.value.includes('100W'))) {
    throw new Error('Expected Power parameter with 100W');
  }
  if (!reqs.environment.some(e => e.name.toLowerCase().includes('weather resistant'))) {
    throw new Error('Expected Weather resistant environment');
  }
  if (!reqs.installation_requirements.some(i => i.name.toLowerCase().includes('pole mounted'))) {
    throw new Error('Expected Pole mounted installation');
  }
  console.log('✅ All extraction fields matched specification criteria!');

  // STEP 6: Edit one requirement (e.g. Add Voltage: 230V AC)
  console.log('\nStep 3: Editing Extracted Requirements...');
  const editedRequirements = {
    ...reqs,
    technical_parameters: [
      ...reqs.technical_parameters,
      {
        id: 'param-edited-1',
        parameter: 'Operating Voltage',
        value: '230V AC',
        confidence: 'high',
      },
    ],
  };

  const saveRes = await fetch(`${API_BASE}/analysis/${analysisId}/requirements`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requirements: editedRequirements,
      confirmed: false,
    }),
  });
  if (!saveRes.ok) throw new Error('Failed to save edited requirements');
  const saveData = await saveRes.json();
  console.log('✅ Edited requirements saved successfully. Tech params count:', saveData.data.requirements.technical_parameters.length);

  // STEP 7: Confirm requirements
  console.log('\nStep 4: Confirming Requirements...');
  const confirmRes = await fetch(`${API_BASE}/analysis/${analysisId}/requirements`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requirements: editedRequirements,
      confirmed: true,
    }),
  });
  if (!confirmRes.ok) throw new Error('Failed to confirm requirements');
  const confirmData = await confirmRes.json();
  if (confirmData.data.confirmed !== true) throw new Error('Confirmation status not true');
  console.log('✅ Requirements confirmed! Ready for Standards Matching.');

  // STEP 8: Check History
  console.log('\nStep 5: Verifying Analysis History...');
  const histRes = await fetch(`${API_BASE}/analysis/history`);
  if (!histRes.ok) throw new Error('Failed to fetch history');
  const histData = await histRes.json();
  const foundInHistory = histData.data.find(h => h.analysis_id === analysisId);
  if (!foundInHistory) throw new Error(`Analysis ${analysisId} not found in history`);
  console.log('✅ Found in history! Product:', foundInHistory.product_name, '| Status:', foundInHistory.status, '| Confirmed:', foundInHistory.confirmed);

  // STEP 9: Open saved analysis by ID
  console.log('\nStep 6: Opening Saved Analysis by ID...');
  const getSavedRes = await fetch(`${API_BASE}/analysis/${analysisId}`);
  if (!getSavedRes.ok) throw new Error('Failed to get saved analysis');
  const savedRecord = await getSavedRes.json();
  if (!savedRecord.data || savedRecord.data.requirements.technical_parameters.length < 2) {
    throw new Error('Saved requirements not preserved');
  }
  console.log('✅ Saved analysis retrieved! Preserved params:', savedRecord.data.requirements.technical_parameters.map(p => `${p.parameter}: ${p.value}`));

  // STEP 10: Error Tests
  console.log('\n===========================================================');
  console.log('🛡️ RUNNING ERROR TESTS');
  console.log('===========================================================');

  // Error Test A: Empty input
  console.log('Error Test A: Empty Input...');
  const emptyRes = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_type: 'product_description', input_text: '   ' }),
  });
  if (emptyRes.status !== 400) throw new Error(`Expected 400 for empty input, got ${emptyRes.status}`);
  const emptyErr = await emptyRes.json();
  console.log('✅ Handled cleanly with 400:', emptyErr.error.message);

  // Error Test B: Short input
  console.log('Error Test B: Short input ("LED")...');
  const shortRes = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_type: 'product_description', input_text: 'LED' }),
  });
  if (shortRes.status !== 200) throw new Error(`Expected 200 with review status, got ${shortRes.status}`);
  const shortData = await shortRes.json();
  console.log('✅ Handled cleanly: Product:', shortData.data.requirements.product.name, '| Confidence:', shortData.data.requirements.overall_confidence);

  // Error Test C: Invalid Analysis ID
  console.log('Error Test C: Non-existent Analysis ID...');
  const notFoundRes = await fetch(`${API_BASE}/analysis/non-existent-id-999`);
  if (notFoundRes.status !== 404) throw new Error(`Expected 404, got ${notFoundRes.status}`);
  const notFoundErr = await notFoundRes.json();
  console.log('✅ Handled cleanly with 404:', notFoundErr.error.message);

  console.log('\n===========================================================');
  console.log('🎉 ALL FUNCTIONAL AND ERROR TESTS PASSED COMPLETELY!');
  console.log('===========================================================\n');
}

runFullVerification().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
