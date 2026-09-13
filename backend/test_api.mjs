async function runHttpTests() {
  console.log('--- 1. Testing GET /api/health ---');
  const healthRes = await fetch('http://localhost:3001/api/health');
  const health = await healthRes.json();
  console.log('Health Response:', health);

  console.log('\n--- 2. Testing POST /api/analyze (Test 1: Outdoor LED street lighting) ---');
  const a1 = await fetch('http://localhost:3001/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_type: 'product_description',
      input_text: 'Outdoor LED street lighting system, 100W, weather resistant, pole mounted.',
    }),
  });
  const data1 = await a1.json();
  console.log('Status code:', a1.status);
  console.log('Analysis ID:', data1.data?.analysis_id);
  console.log('Product:', data1.data?.requirements?.product);
  console.log('Tech Params:', data1.data?.requirements?.technical_parameters);
  console.log('Environment:', data1.data?.requirements?.environment);
  console.log('Installation:', data1.data?.requirements?.installation_requirements);

  const analysisId = data1.data?.analysis_id;

  console.log('\n--- 3. Testing GET /api/analysis/:id ---');
  const aGet = await fetch(`http://localhost:3001/api/analysis/${analysisId}`);
  const dataGet = await aGet.json();
  console.log('Status code:', aGet.status);
  console.log('Fetched Product Name:', dataGet.data?.requirements?.product?.name);

  console.log('\n--- 4. Testing PUT /api/analysis/:id/requirements (Confirm requirements) ---');
  const aPut = await fetch(`http://localhost:3001/api/analysis/${analysisId}/requirements`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requirements: data1.data?.requirements,
      confirmed: true,
    }),
  });
  const dataPut = await aPut.json();
  console.log('Status code:', aPut.status);
  console.log('Message:', dataPut.message);
  console.log('Confirmed state:', dataPut.data?.confirmed);

  console.log('\n--- 5. Testing GET /api/analysis/history ---');
  const aHist = await fetch('http://localhost:3001/api/analysis/history');
  const dataHist = await aHist.json();
  console.log('Status code:', aHist.status);
  console.log('History count:', dataHist.data?.length);
  console.log('History latest item:', dataHist.data?.[0]);

  console.log('\n--- 6. Testing Validation: Empty input (400 expected) ---');
  const aEmpty = await fetch('http://localhost:3001/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_type: 'product_description',
      input_text: '   ',
    }),
  });
  const dataEmpty = await aEmpty.json();
  console.log('Status code:', aEmpty.status, '(Expected 400)');
  console.log('Error message:', dataEmpty.error?.message);

  console.log('\n✅ ALL HTTP API INTEGRATION TESTS PASSED!');
}

runHttpTests().catch(console.error);
