// ============================================================
// Phase 3 Automated Verification Test Script
// Tests all 12 verified standards, searches, filters, and endpoints
// ============================================================

const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('🧪 Starting Phase 3 Standards Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Total records check (must be exactly 12)
    console.log('--- Test 1: Total Standards Count ---');
    const allRes = await fetch(`${BASE_URL}/standards?limit=100`);
    const allJson = await allRes.json();
    const standards = allJson.data.standards;
    assert(standards.length === 12, `Total standards count is exactly 12 (received: ${standards.length})`);

    // 2. Search "street light"
    console.log('\n--- Test 2: Search "street light" ---');
    const slRes = await fetch(`${BASE_URL}/standards?search=street%20light`);
    const slJson = await slRes.json();
    const slNumbers = slJson.data.standards.map((s) => s.standard_number);
    assert(
      slNumbers.includes('IS 10322 (Part 5/Sec 3):2026') &&
        slNumbers.includes('IS 16107 (Part 2/Sec 2):2017'),
      `"street light" returned IS 10322 (Part 5/Sec 3) and IS 16107 (Part 2/Sec 2): [${slNumbers.join(', ')}]`
    );

    // 3. Search "LED luminaire"
    console.log('\n--- Test 3: Search "LED luminaire" ---');
    const ledRes = await fetch(`${BASE_URL}/standards?search=LED%20luminaire`);
    const ledJson = await ledRes.json();
    const ledNumbers = ledJson.data.standards.map((s) => s.standard_number);
    assert(
      ledNumbers.some((n) => n.includes('10322')) && ledNumbers.some((n) => n.includes('16107')),
      `"LED luminaire" returned relevant 10322 and 16107 records: [${ledNumbers.join(', ')}]`
    );

    // 4. Search "floodlight"
    console.log('\n--- Test 4: Search "floodlight" ---');
    const flRes = await fetch(`${BASE_URL}/standards?search=floodlight`);
    const flJson = await flRes.json();
    const flNumbers = flJson.data.standards.map((s) => s.standard_number);
    assert(
      flNumbers.includes('IS 10322 (Part 5/Sec 5):2026'),
      `"floodlight" returned IS 10322 (Part 5/Sec 5):2026: [${flNumbers.join(', ')}]`
    );

    // 5. Search "LED module"
    console.log('\n--- Test 5: Search "LED module" ---');
    const modRes = await fetch(`${BASE_URL}/standards?search=LED%20module`);
    const modJson = await modRes.json();
    const modNumbers = modJson.data.standards.map((s) => s.standard_number);
    assert(
      modNumbers.includes('IS 16103 (Part 1):2025') &&
        modNumbers.includes('IS 16103 (Part 2):2025'),
      `"LED module" returned IS 16103 (Part 1) and IS 16103 (Part 2): [${modNumbers.join(', ')}]`
    );

    // 6. Search "10322"
    console.log('\n--- Test 6: Search "10322" ---');
    const numRes = await fetch(`${BASE_URL}/standards?search=10322`);
    const numJson = await numRes.json();
    const count10322 = numJson.data.standards.length;
    assert(
      count10322 === 6,
      `"10322" returned all 6 IS 10322 records (received: ${count10322})`
    );

    // 7. Search "photometric"
    console.log('\n--- Test 7: Search "photometric" ---');
    const photoRes = await fetch(`${BASE_URL}/standards?search=photometric`);
    const photoJson = await photoRes.json();
    const photoNumbers = photoJson.data.standards.map((s) => s.standard_number);
    assert(
      photoNumbers.includes('IS 16106:2012'),
      `"photometric" returned IS 16106:2012: [${photoNumbers.join(', ')}]`
    );

    // 8. Categories endpoint
    console.log('\n--- Test 8: GET /api/standards/categories ---');
    const catRes = await fetch(`${BASE_URL}/standards/categories`);
    const catJson = await catRes.json();
    assert(
      catJson.data.categories.length > 0 && catJson.data.subcategories.length > 0,
      `Categories API returned categories and subcategories (found: ${catJson.data.subcategories.length} subcategories)`
    );

    // 9. Standard Details by ID & standard_number
    console.log('\n--- Test 9: GET /api/standards/:id ---');
    const detailRes = await fetch(`${BASE_URL}/standards/bis-is-10322-5-3-2026`);
    const detailJson = await detailRes.json();
    const std = detailJson.data;
    assert(
      std &&
        std.standard_number === 'IS 10322 (Part 5/Sec 3):2026' &&
        std.source_url.startsWith('https://') &&
        std.last_verified === '2026-09-13',
      `Standard details correctly fetched with verified metadata and official source URL`
    );

    console.log(`\n========================================`);
    console.log(`  Tests Passed: ${passed} | Tests Failed: ${failed}`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
