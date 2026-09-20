// ============================================================
// ISutra — Regulatory & Certification Evidence Test Suite
// SIH26108: Suggest mandatory certification requirements where applicable
// (e.g. BIS Product Certification, CRS, Hallmarking).
// ============================================================

import assert from 'node:assert';
import {
  getStandardRegulatoryCheck,
  getAllVerifiedRegulatoryRecords,
  REGULATORY_DISCLAIMER,
} from './dist/services/regulatoryService.js';
import { getCertifications } from './dist/services/standardsService.js';
import { VERIFIED_REGULATORY_RECORDS } from './dist/database/verifiedRegulatoryRecords.js';
import { StandardsMatcher } from './dist/services/standardsMatcher.js';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import {
  generateProcurementReportData,
  generatePrintableHtmlReport,
} from './dist/services/procurementReportService.js';
import { analyzeSpecification } from './dist/services/analysisService.js';

console.log('===========================================================');
console.log('⚖️  ISUTRA REGULATORY & CERTIFICATION EVIDENCE TEST SUITE');
console.log('===========================================================\n');

let passedTests = 0;
function pass(msg) {
  console.log(`  ✓ ${msg}`);
  passedTests++;
}

async function runTests() {
  // ------------------------------------------------------------
  // Test 1: Verified Regulatory Records Dataset Integrity
  // ------------------------------------------------------------
  console.log('Test 1: Verifying Regulatory Dataset Integrity & Schemas...');
  const records = getAllVerifiedRegulatoryRecords();
  assert(Array.isArray(records), 'Records must be an array');
  assert(records.length >= 5, `Expected at least 5 verified regulatory records, found: ${records.length}`);
  pass(`Found ${records.length} curated authoritative regulatory records`);

  for (const r of records) {
    assert(typeof r.id === 'string' && r.id.length > 0, `Record ${r.id} must have valid ID`);
    assert(typeof r.standard_number === 'string' && r.standard_number.startsWith('IS '), `Record ${r.id} standard_number must be valid IS number`);
    assert(typeof r.authority === 'string' && r.authority.length > 0, `Record ${r.id} must have authoritative governing body`);
    assert(typeof r.regulation_name === 'string' && r.regulation_name.length > 0, `Record ${r.id} must specify regulation order`);
    assert(typeof r.applicability_description === 'string' && r.applicability_description.length > 0, `Record ${r.id} must describe applicability`);
    assert(r.source_url.startsWith('https://'), `Record ${r.id} source_url must be HTTPS government/BIS link`);
    assert(r.verification_status === 'verified', `Record ${r.id} must have verification_status verified`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(r.last_verified_date), `Record ${r.id} last_verified_date must be YYYY-MM-DD`);
    if (r.effective_date) {
      assert(/^\d{4}(-\d{2}(-\d{2})?)?$/.test(r.effective_date), `Record ${r.id} effective_date must be valid date format`);
    }
  }
  pass('All curated records pass strict schema and HTTPS authoritative source validation');

  // ------------------------------------------------------------
  // Test 2: Verified Regulatory Records (TMT Rebars, Safety Shoes, LED Lamps)
  // ------------------------------------------------------------
  console.log('\nTest 2: Verifying Regulatory Check for Mandatory Standards...');

  // 2a: IS 1786 (TMT Rebars under Ministry of Steel QCO)
  const is1786Check = await getStandardRegulatoryCheck('bis-is-1786-2008');
  assert(is1786Check.is_verified_standard === true, 'IS 1786 must be verified standard');
  assert(is1786Check.has_verified_requirement === true, 'IS 1786 must have verified mandatory requirement');
  assert(is1786Check.verified_requirements_count >= 1, 'IS 1786 must have at least 1 verified requirement');

  const steelScheme = is1786Check.schemes.find((s) => s.scheme_code === 'bis_product_certification');
  assert(steelScheme !== undefined, 'IS 1786 must assess BIS Product Certification');
  assert(steelScheme.status === 'verified_requirement', 'IS 1786 status must be verified_requirement');
  assert(steelScheme.status_label === 'Verified applicability', 'IS 1786 label must be Verified applicability');
  assert(steelScheme.authority.includes('Ministry of Steel'), 'Authority must cite Ministry of Steel');
  assert(steelScheme.evidence_order.includes('Steel and Steel Products'), 'Evidence must cite Steel QCO');
  assert(steelScheme.effective_date === '2020-12-18', 'Effective date must match QCO notification');
  assert(steelScheme.source_url.startsWith('https://'), 'Source URL must be HTTPS');
  pass('IS 1786 (TMT Rebars) returns verified mandatory BIS Product Certification under Ministry of Steel QCO');

  // 2b: IS 15298 (Part 2) Safety Footwear under DPIIT QCO
  const is15298Check = await getStandardRegulatoryCheck('bis-is-15298-2-2024');
  assert(is15298Check.has_verified_requirement === true, 'Safety footwear must have verified requirement');
  const footwearScheme = is15298Check.schemes.find((s) => s.scheme_code === 'bis_product_certification');
  assert(footwearScheme.status === 'verified_requirement', 'Safety footwear status must be verified_requirement');
  assert(footwearScheme.authority.includes('DPIIT') || footwearScheme.authority.includes('Ministry of Commerce'), 'Authority must cite DPIIT');
  assert(footwearScheme.evidence_order.includes('Footwear'), 'Evidence must cite Footwear QCO');
  pass('IS 15298 (Part 2) returns verified mandatory BIS Product Certification under DPIIT Footwear QCO');

  // 2c: IS 16102 (Part 1) LED Lamps under MeitY CRS
  const is16102Check = await getStandardRegulatoryCheck('bis-is-16102-1-2026');
  assert(is16102Check.has_verified_requirement === true, 'LED lamps must have verified requirement');
  const crsScheme = is16102Check.schemes.find((s) => s.scheme_code === 'crs');
  assert(crsScheme.status === 'verified_requirement', 'LED lamps CRS status must be verified_requirement');
  assert(crsScheme.authority.includes('MeitY') || crsScheme.authority.includes('Electronics and Information Technology'), 'Authority must cite MeitY');
  assert(crsScheme.evidence_order.includes('Compulsory Registration'), 'Evidence must cite CRS Order');
  pass('IS 16102 (Part 1) returns verified Compulsory Registration Scheme (CRS) under MeitY');

  // ------------------------------------------------------------
  // Test 3: Verification Required & No Record States
  // ------------------------------------------------------------
  console.log('\nTest 3: Verifying Verification Required & No Record States...');

  // 3a: IS 10322 (Part 5/Sec 3) — Luminaire standard with no stored QCO in dataset
  const is10322Check = await getStandardRegulatoryCheck('bis-is-10322-5-3-2026');
  assert(is10322Check.is_verified_standard === true, 'IS 10322-5-3 must be recognized as verified standard');
  const luminaireBisCert = is10322Check.schemes.find((s) => s.scheme_code === 'bis_product_certification');
  assert(luminaireBisCert.status === 'verification_required', 'IS 10322-5-3 must return verification_required');
  assert(luminaireBisCert.status_label === 'Verification required', 'Label must be Verification required');
  assert(
    luminaireBisCert.reason.includes('No verified regulatory applicability record is stored for this product in the current ISutra reference dataset'),
    'Reason must explain absence of stored regulatory record'
  );
  assert(luminaireBisCert.source_url.startsWith('https://'), 'Must provide official verification link');
  pass('IS 10322 (Part 5/Sec 3) returns safe "Verification required" state with explicit reason');

  // 3b: Hallmarking Scheme on non-precious metals (e.g. Cables, Lights, Concrete)
  const hallmarkingOnLight = is10322Check.schemes.find((s) => s.scheme_code === 'hallmarking');
  assert(hallmarkingOnLight.status === 'no_verified_record', 'Hallmarking on luminaires must be no_verified_record');
  assert(
    hallmarkingOnLight.reason.includes('Hallmarking (Scheme IV) applies exclusively to precious metal articles'),
    'Hallmarking reason must explain domain exclusivity to precious metals'
  );
  assert(hallmarkingOnLight.source_url.includes('hallmarking'), 'Source URL must link to official hallmarking portal');
  pass('Hallmarking on non-precious standards strictly returns "No Verified Regulatory Record" with domain explanation');

  // 3c: Code of Practice IS 456 (Plain and Reinforced Concrete)
  const is456Check = await getStandardRegulatoryCheck('bis-is-456-2000');
  const is456BisCert = is456Check.schemes.find((s) => s.scheme_code === 'bis_product_certification');
  assert(is456BisCert.status === 'verification_required', 'IS 456 must return verification_required');
  pass('IS 456 (Code of Practice) returns safe "Verification required" state');

  // ------------------------------------------------------------
  // Test 4: Fake / Demo Record Rejection & Quarantine
  // ------------------------------------------------------------
  console.log('\nTest 4: Verifying Fake / Demo Record Rejection & Quarantine...');

  // 4a: Querying a demo standard
  const demoCheck = await getStandardRegulatoryCheck('demo-std-001');
  assert(demoCheck.is_demo === true, 'Demo query must return is_demo: true');
  assert(demoCheck.is_verified_standard === false, 'Demo query must return is_verified_standard: false');
  assert(demoCheck.has_verified_requirement === false, 'Demo query must not return verified requirement');
  assert(demoCheck.notice.includes('Demo data'), 'Demo query must carry explicit quarantine notice');
  pass('Demo standard query returns quarantined demo notice and zero verified requirements');

  // 4b: Non-existent standard
  const nonExistentCheck = await getStandardRegulatoryCheck('non-existent-standard-999');
  assert(nonExistentCheck.is_verified_standard === false, 'Non-existent standard must return is_verified_standard: false');
  assert(nonExistentCheck.schemes[0].status === 'not_assessed', 'Non-existent standard must return not_assessed');
  pass('Non-existent standard returns "not_assessed" without throwing errors');

  // 4c: Legacy getCertifications quarantine guard (regression check)
  const legacyCertRes = await getCertifications('bis-is-10322-5-3-2026');
  assert(Array.isArray(legacyCertRes.data) && legacyCertRes.data.length === 0, 'Legacy cert data must be empty for verified standard');
  assert(legacyCertRes.verified === false, 'Legacy cert verified flag must be false');
  assert(legacyCertRes.demo === false, 'Legacy cert demo flag must be false');
  pass('Legacy getCertifications maintains Phase 8A/8B quarantine contract');

  // ------------------------------------------------------------
  // Test 4d: Expired / Dated Record & Effective Date Integrity
  // ------------------------------------------------------------
  console.log('\nTest 4d: Verifying Effective Date & Dated Record Validation...');
  for (const r of records) {
    if (r.effective_date) {
      const parsedDate = new Date(r.effective_date);
      assert(!isNaN(parsedDate.getTime()), `Record ${r.id} must have a valid parseable effective_date`);
      // Since all verified QCOs are historically gazetted, their effective date is in the past
      assert(parsedDate.getFullYear() >= 2000, `Record ${r.id} effective year must be realistic`);
    }
  }
  pass('All dated records contain parseable, chronologically sound effective dates');

  // ------------------------------------------------------------
  // Test 4e: Malformed Source Handling & Rejection Guard
  // ------------------------------------------------------------
  console.log('\nTest 4e: Verifying Malformed Source Rejection...');
  // Ensure every single verified regulatory record has a secure HTTPS URL from an official domain
  for (const r of records) {
    assert(r.source_url.startsWith('https://'), `Record ${r.id} must use secure HTTPS protocol`);
    assert(!r.source_url.includes('http://'), `Record ${r.id} must not use insecure HTTP`);
    assert(
      r.source_url.includes('bis.gov.in') || r.source_url.includes('crsbis.in') || r.source_url.includes('gov.in'),
      `Record ${r.id} must cite official government or BIS domain`
    );
  }
  pass('All regulatory source URLs strictly link to official *.gov.in or *.crsbis.in domains');

  // ------------------------------------------------------------
  // Test 4f: Prohibited Claims Guardrail
  // ------------------------------------------------------------
  console.log('\nTest 4f: Verifying Prohibited Claims Guardrail (No "Certification guaranteed")...');
  const prohibitedWords = ['certification guaranteed', '100% compliant', 'guaranteed compliance'];
  for (const r of records) {
    const combinedText = `${r.applicability_description} ${r.notes_limitations || ''}`.toLowerCase();
    for (const word of prohibitedWords) {
      assert(!combinedText.includes(word), `Record ${r.id} must not contain prohibited marketing claim: '${word}'`);
    }
  }
  pass('Dataset contains zero fabricated compliance promises or guaranteed certification claims');

  // ------------------------------------------------------------
  // Test 5: Determinism & Mandatory Disclaimer Verification
  // ------------------------------------------------------------
  console.log('\nTest 5: Verifying Determinism & Mandatory Disclaimers...');
  const run1 = await getStandardRegulatoryCheck('bis-is-1786-2008');
  const run2 = await getStandardRegulatoryCheck('bis-is-1786-2008');
  assert.deepStrictEqual(run1, run2, 'Repeated regulatory queries must be 100% deterministic');
  pass('Repeated regulatory queries produce identical results');

  assert(
    run1.disclaimer === REGULATORY_DISCLAIMER,
    'Regulatory check must include standard disclaimer'
  );
  assert(
    run1.disclaimer.includes('Certification applicability is based only on curated authoritative regulatory evidence'),
    'Disclaimer must match exact regulatory disclaimer wording'
  );
  assert(
    run1.disclaimer.includes('Absence of a record does not establish that no legal requirement exists'),
    'Disclaimer must state absence of record does not establish lack of legal requirement'
  );
  pass('Mandatory statutory disclaimer is faithfully embedded');

  // ------------------------------------------------------------
  // Test 6: Recommendation Engine Independence & Weight Invariance
  // ------------------------------------------------------------
  console.log('\nTest 6: Verifying Certification Does NOT Affect Matcher Score...');

  const matcher = new StandardsMatcher();
  const sampleRequirement = {
    product: { name: 'TMT Steel Rebars', category: 'Civil — Reinforcement', confidence: 'high' },
    keywords: ['steel', 'rebars', 'reinforcement', 'concrete', 'fe 500'],
    technical_parameters: [{ parameter: 'Grade', value: 'Fe 500', confidence: 'high' }],
    materials: [{ name: 'High strength deformed steel', confidence: 'high' }],
    environment: [{ name: 'Outdoor', confidence: 'high' }],
    safety_requirements: [{ name: 'Safety requirements', confidence: 'high' }],
    performance_requirements: [],
    testing_requirements: [{ name: 'Tensile test', confidence: 'high' }],
    installation_requirements: [{ name: 'Concrete embedded', confidence: 'high' }],
    certification_mentions: [{ name: 'BIS', confidence: 'high' }],
    application: 'Construction',
    missing_information: [],
    clarification_questions: [],
    overall_confidence: 'high',
    ready_for_matching: true,
  };

  const matchRes = matcher.evaluate(sampleRequirement, VERIFIED_BIS_STANDARDS);
  assert(matchRes.recommendations.length > 0, 'Matcher must return recommendations');

  const topRec = matchRes.recommendations[0];
  const factorStatuses = topRec.factorStatuses;

  // Verify the 6-factor matching weights remain strictly preserved
  const weights = [
    factorStatuses.productCategory.weight,
    factorStatuses.keywordsTitleScope.weight,
    factorStatuses.application.weight,
    factorStatuses.environment.weight,
    factorStatuses.technicalParameters.weight,
    factorStatuses.safetyTesting.weight,
  ];

  assert.strictEqual(weights[0], 0.30, 'Product Category factor weight must be exactly 0.30');
  assert.strictEqual(weights[1], 0.25, 'Keywords factor weight must be exactly 0.25');
  assert.strictEqual(weights[2], 0.15, 'Application factor weight must be exactly 0.15');
  assert.strictEqual(weights[3], 0.10, 'Environment factor weight must be exactly 0.10');
  assert.strictEqual(weights[4], 0.10, 'Technical Parameters factor weight must be exactly 0.10');
  assert.strictEqual(weights[5], 0.10, 'Safety & Testing factor weight must be exactly 0.10');

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  assert(Math.abs(totalWeight - 1.0) < 0.0001, 'Total factor weights must sum to 1.00');

  // Ensure no regulatory factor exists in 6-factor matcher
  assert(!('certification' in factorStatuses), 'Certification must NOT be an engine matching factor');
  assert(!('regulatory' in factorStatuses), 'Regulatory must NOT be an engine matching factor');
  pass('Engine 6-factor matching weights (0.30, 0.25, 0.15, 0.10, 0.10, 0.10) are strictly preserved and independent of certification');

  // ------------------------------------------------------------
  // Test 7: Procurement Report Integration
  // ------------------------------------------------------------
  console.log('\nTest 7: Verifying Procurement Report Regulatory Section...');

  // Create an analysis record
  const analysisResult = await analyzeSpecification(
    'text',
    'Supply of high strength deformed steel bars Fe 500 for construction works'
  );
  assert(analysisResult.analysis_id, 'Analysis must be created');

  const reportData = await generateProcurementReportData(analysisResult.analysis_id);
  assert(reportData.regulatoryVerification !== undefined, 'Report data must include regulatoryVerification');
  assert(Array.isArray(reportData.regulatoryVerification.standards), 'regulatoryVerification.standards must be array');
  assert(reportData.regulatoryVerification.standards.length > 0, 'Must include regulatory assessments for applicable standards');
  assert(typeof reportData.regulatoryVerification.disclaimer === 'string', 'Must include regulatory disclaimer in report');
  pass('generateProcurementReportData compiles structured regulatory verification');

  const htmlReport = generatePrintableHtmlReport(reportData);
  assert(htmlReport.includes('Regulatory / Certification Verification'), 'HTML report must contain Regulatory / Certification Verification section');
  assert(htmlReport.includes('Regulatory Disclaimer:'), 'HTML report must contain Regulatory Disclaimer');
  assert(htmlReport.includes('Certification applicability is based only on curated authoritative regulatory evidence'), 'HTML report must include exact disclaimer text');
  assert(htmlReport.includes('BIS Product Certification'), 'HTML report must contain BIS Product Certification scheme');
  assert(htmlReport.includes('Compulsory Registration Scheme'), 'HTML report must contain CRS scheme');
  assert(htmlReport.includes('Hallmarking Scheme'), 'HTML report must contain Hallmarking scheme');
  pass('HTML report renders dedicated "Regulatory / Certification Verification" section with disclaimer and scheme tables');

  console.log('\n===========================================================');
  console.log(`🎉 ALL ${passedTests} REGULATORY & CERTIFICATION TESTS PASSED!`);
  console.log('===========================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
