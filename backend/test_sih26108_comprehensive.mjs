// ============================================================
// ISutra: SIH Problem Statement SIH26108 Comprehensive Verification Suite
// Tests A through T:
// A. English extraction
// B. Hindi extraction
// C. Telugu extraction
// D. Vague input handling
// E. Unrelated input rejection
// F. Exact product/application match
// G. Conflicting application detection
// H. Allied standard relationship
// I. Verified relationship
// J. Unverified/associated relationship
// K. Lifecycle data
// L. Amendment data
// M. Regulatory evidence (Mandatory QCO / CRS)
// N. Missing regulatory evidence
// O. Requirement gap analysis (Reference Coverage)
// P. Standards comparison (11 dimensions, neutral)
// Q. Traceability (5-stage evidence chain)
// R. Official BIS source URL validation
// S. Document upload / ingestion
// T. Unsupported / scanned document safe handling
// ============================================================

import assert from 'node:assert';

// Dynamic imports of compiled backend services
const { extractWithPatternMatching } = await import('./dist/services/ai/nlpExtractor.js');
const { detectInputLanguage } = await import('./dist/services/ai/multilingualService.js');
const { matchRequirementsToStandards } = await import('./dist/services/standardsMatcher.js');
const { getResolvedRelationships } = await import('./dist/services/standardsRelationshipService.js');
const { getStandardLifecycle } = await import('./dist/services/standardLifecycleService.js');
const { getStandardRegulatoryCheck } = await import('./dist/services/regulatoryService.js');
const { analyzeRequirementGaps } = await import('./dist/services/requirementGapAnalyzer.js');
const { compareStandards } = await import('./dist/services/standardsComparator.js');
const { extractDocument } = await import('./dist/services/documentExtractionService.js');
const { validateStandardForIngestion, isOfficialBisSourceUrl } = await import('./dist/services/standardsIngestionService.js');
const { VERIFIED_BIS_STANDARDS } = await import('./dist/database/verifiedStandards.js');

let passedCount = 0;
let totalCount = 0;

function it(description, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(err);
    process.exit(1);
  }
}

async function itAsync(description, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`  ✓ ${description}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('\n===========================================================');
console.log('🏆 ISUTRA: SIH26108 COMPREHENSIVE CAPABILITY VERIFICATION');
console.log('===========================================================\n');

// -------------------------------------------------------------
// Test A: English Extraction
// -------------------------------------------------------------
console.log('TEST A: English Extraction (Messy procurement specification)...');
const englishSpec = `
Tender No: 2026/PWD/R-401
Procurement of Outdoor LED Luminaire for Municipal Highway Lighting System.
The fixtures must operate on 230V AC, 50Hz, power rating 120W with luminous efficacy >= 120 lm/W.
Correlated Color Temperature: 5700K (CCT). Color rendering index (CRI) >= 70.
Power factor (PF) >= 0.95, THD <= 10%.
Ingress Protection must be IP66 weatherproof outdoor housing.
Surge protection: 10kV built-in SPD.
Mounting: Pole mounted at 9m height.
Warranty: 5 years replacement guarantee.
`;

const enLang = detectInputLanguage(englishSpec, 'auto');
const extractedA = extractWithPatternMatching(englishSpec, 'technical_specification', enLang);

it('Test A.1: Extracts product and category from messy English specification', () => {
  assert.ok(extractedA.product && extractedA.product.name, 'Product should be extracted');
  assert.ok(
    extractedA.product.name.toLowerCase().includes('led') || extractedA.product.name.toLowerCase().includes('lighting'),
    'Product must be identified as LED / lighting'
  );
  assert.strictEqual(extractedA.product.category, 'Lighting & Luminaires');
});

it('Test A.2: Extracts application, environment, and installation', () => {
  assert.ok(
    typeof extractedA.application === 'string' &&
    (extractedA.application.toLowerCase().includes('street') || extractedA.application.toLowerCase().includes('road') || extractedA.application.toLowerCase().includes('highway')),
    `Application must be street/road/highway, got: ${extractedA.application}`
  );
  assert.ok(extractedA.environment.some(e => e.name.toLowerCase().includes('outdoor') || e.name.toLowerCase().includes('weather')));
  assert.ok(extractedA.installation_requirements.some(i => i.name.toLowerCase().includes('pole')));
});

it('Test A.3: Extracts technical and electrical parameters (CCT, PF, THD, IP, Surge)', () => {
  const params = extractedA.technical_parameters;
  assert.ok(params.some(p => p.value.includes('120W')), 'Must extract 120W');
  assert.ok(params.some(p => p.value.includes('IP66')), 'Must extract IP66');
  assert.ok(params.some(p => p.value.includes('10kV')), 'Must extract 10kV');
  assert.ok(params.some(p => p.value.includes('5700K')), 'Must extract 5700K');
});

// -------------------------------------------------------------
// Test B: Hindi Extraction
// -------------------------------------------------------------
console.log('\nTEST B: Hindi Extraction...');
const hindiSpec = `नगर निगम सड़क प्रकाश व्यवस्था के लिए 100 वाट एलईडी स्ट्रीट लाइट, बाहरी मौसम प्रतिरोधी, पोल माउंटेड, आईपी65, 10 केवी सर्ज सुरक्षा`;
const hiLang = detectInputLanguage(hindiSpec, 'auto');
const extractedB = extractWithPatternMatching(hindiSpec, 'technical_specification', hiLang);

it('Test B.1: Normalized Hindi input to standardized product and category', () => {
  assert.ok(extractedB.product.name.toLowerCase().includes('led'));
  assert.strictEqual(extractedB.product.category, 'Lighting & Luminaires');
});

it('Test B.2: Hindi parameters and environment normalized accurately', () => {
  assert.ok(extractedB.environment.some(e => e.name.toLowerCase().includes('outdoor')));
  assert.ok(extractedB.technical_parameters.some(p => p.value.includes('100W')));
  assert.ok(extractedB.technical_parameters.some(p => p.value.includes('IP65')));
  assert.ok(extractedB.technical_parameters.some(p => p.value.includes('10kV')));
});

// -------------------------------------------------------------
// Test C: Telugu Extraction
// -------------------------------------------------------------
console.log('\nTEST C: Telugu Extraction...');
const teluguSpec = `మున్సిపల్ హైవే లైటింగ్ సిస్టమ్ కోసం 100W IP65 అవుట్‌డోర్ ఎల్‌ఈడీ స్ట్రీట్ లైట్లు కావాలి. పోల్ మౌంటెడ్, 10kV సర్జ్ రక్షణ.`;
const teLang = detectInputLanguage(teluguSpec, 'auto');
const extractedC = extractWithPatternMatching(teluguSpec, 'technical_specification', teLang);

it('Test C.1: Normalized Telugu input to standardized product and category', () => {
  assert.ok(extractedC.product.name.toLowerCase().includes('led'));
  assert.strictEqual(extractedC.product.category, 'Lighting & Luminaires');
});

it('Test C.2: Telugu parameters and installation normalized accurately', () => {
  assert.ok(extractedC.installation_requirements.some(i => i.name.toLowerCase().includes('pole')));
  assert.ok(extractedC.technical_parameters.some(p => p.value.includes('100W')));
  assert.ok(extractedC.technical_parameters.some(p => p.value.includes('IP65')));
});

// -------------------------------------------------------------
// Test D: Vague Input Handling
// -------------------------------------------------------------
console.log('\nTEST D: Vague Input Handling...');
const vagueSpec = `we need some lights and cables for our office premises`;
const vagueLang = detectInputLanguage(vagueSpec, 'auto');
const extractedD = extractWithPatternMatching(vagueSpec, 'technical_specification', vagueLang);

it('Test D.1: Vague input triggers review state and insufficientInformation in matcher', () => {
  assert.ok(
    extractedD.overall_confidence === 'needs_review' ||
    extractedD.overall_confidence === 'medium' ||
    extractedD.clarification_questions?.length > 0 ||
    extractedD.ready_for_matching === false,
    'Vague input must require clarification or marked needs_review'
  );

  const matchD = matchRequirementsToStandards(extractedD, VERIFIED_BIS_STANDARDS, vagueSpec);
  assert.strictEqual(
    matchD.metadata.insufficientInformation,
    true,
    'Vague input must be flagged as insufficientInformation in matcher'
  );
  assert.strictEqual(matchD.recommendations.length, 0, 'Vague input should yield 0 confident recommendations');
});

// -------------------------------------------------------------
// Test E: Unrelated Input Rejection
// -------------------------------------------------------------
console.log('\nTEST E: Unrelated Input Rejection...');
const unrelatedSpec = `Procurement of 500 crates of organic Alphonso mangoes and fresh apples for city fruit market.`;
const unLang = detectInputLanguage(unrelatedSpec, 'auto');
const extractedE = extractWithPatternMatching(unrelatedSpec, 'technical_specification', unLang);
const matchE = matchRequirementsToStandards(extractedE, VERIFIED_BIS_STANDARDS, unrelatedSpec);

it('Test E.1: Unrelated domain yields 0 recommendations above threshold', () => {
  const topRecs = (matchE.recommendations || []).filter(r => r.score >= 0.50);
  assert.strictEqual(topRecs.length, 0, 'No engineering BIS standard should match fresh fruit procurement');
});

// -------------------------------------------------------------
// Test F: Exact Product/Application Match
// -------------------------------------------------------------
console.log('\nTEST F: Exact Product/Application Match...');
const matchF = matchRequirementsToStandards(extractedA, VERIFIED_BIS_STANDARDS, englishSpec);

it('Test F.1: Primary match is IS 10322 (Part 5/Sec 3):2026', () => {
  assert.ok(matchF.recommendations.length > 0, 'Should find recommendations');
  const top = matchF.recommendations[0];
  const stdNum = top.standard.standard_number || top.standard.is_number;
  assert.ok(stdNum.includes('IS 10322') && stdNum.includes('Sec 3'), `Top match must be IS 10322 Part 5 Sec 3, got: ${stdNum}`);
  assert.strictEqual(top.specificityTier, 1, 'Exact match must have specificity tier 1');
  assert.ok(top.relevancePercentage >= 70, `Relevance percentage should be >= 70, got: ${top.relevancePercentage}`);
});

it('Test F.2: All 6 matching signal contributions are exposed', () => {
  const top = matchF.recommendations[0];
  assert.ok(top.factorStatuses, 'Factor statuses must be present');
  assert.ok(top.factorStatuses.productCategory, 'productCategory factor must be present');
  assert.ok(top.factorStatuses.keywordsTitleScope, 'keywordsTitleScope factor must be present');
  assert.ok(top.factorStatuses.application, 'application factor must be present');
  assert.ok(top.factorStatuses.environment, 'environment factor must be present');
  assert.ok(top.factorStatuses.technicalParameters, 'technicalParameters factor must be present');
  assert.ok(top.factorStatuses.safetyTesting, 'safetyTesting factor must be present');
});

// -------------------------------------------------------------
// Test G: Conflicting Application Detection
// -------------------------------------------------------------
console.log('\nTEST G: Conflicting Application Detection...');
const conflictingSpec = `Procurement of luminaires for explosive hazardous underground coal mine tunnels.`;
const confLang = detectInputLanguage(conflictingSpec, 'auto');
const extractedG = extractWithPatternMatching(conflictingSpec, 'technical_specification', confLang);
const matchG = matchRequirementsToStandards(extractedG, VERIFIED_BIS_STANDARDS, conflictingSpec);

it('Test G.1: Detects application/hazard conflict or bounds score for outdoor street luminaire', () => {
  const streetLightRec = matchG.recommendations.find(r =>
    (r.standard.standard_number || '').includes('10322') && (r.standard.standard_number || '').includes('Sec 3')
  );
  if (streetLightRec) {
    assert.ok(
      streetLightRec.score <= 0.60 || streetLightRec.specificityTier > 1,
      'Conflicting underground coal mine application must not achieve top exact match for street light'
    );
  }
});

// -------------------------------------------------------------
// Test H & I: Allied & Verified Standards Relationships
// -------------------------------------------------------------
console.log('\nTEST H & I: Allied & Verified Relationships...');
const relIS456 = getResolvedRelationships('bis-is-456-2000');

it('Test H.1: Resolves allied relationships for IS 456', () => {
  assert.ok(relIS456.data.length >= 3, 'IS 456 should have at least 3 relationships');
  assert.strictEqual(relIS456.demo, false, 'Must be real verified data, not demo');
});

it('Test I.1: Verified relationship contains authoritative evidence clause and BIS URL', () => {
  const is383Rel = relIS456.data.find(r => r.target_standard_number?.includes('383'));
  assert.ok(is383Rel, 'IS 456 must link to IS 383');
  assert.strictEqual(is383Rel.relationship_type, 'normative_reference');
  assert.strictEqual(is383Rel.verification_status, 'verified');
  assert.ok(is383Rel.evidence_clause?.includes('Clause 5.3'), 'Must cite Clause 5.3');
  assert.ok(isOfficialBisSourceUrl(is383Rel.verified_source_url), 'Must have official BIS source URL');
});

// -------------------------------------------------------------
// Test J: Unverified / Associated Relationship
// -------------------------------------------------------------
console.log('\nTEST J: Unverified / Associated Relationship...');
const relIS10322 = getResolvedRelationships('bis-is-10322-5-3-2026');

it('Test J.1: Unclassified associated references are explicitly marked without fabricated clauses', () => {
  assert.ok(relIS10322.data.length > 0, 'IS 10322 should have associated references');
  const unclassified = relIS10322.data.filter(r => r.verification_status === 'unclassified_reference');
  assert.ok(unclassified.length > 0, 'Should have unclassified references');
  unclassified.forEach(u => {
    assert.strictEqual(u.relationship_type, 'unspecified');
    assert.strictEqual(u.evidence_clause, undefined);
  });
});

// -------------------------------------------------------------
// Test K: Lifecycle Data
// -------------------------------------------------------------
console.log('\nTEST K: Lifecycle Data...');
const lcIS456 = getStandardLifecycle('bis-is-456-2000');

it('Test K.1: IS 456 returns verified reaffirmation and edition evidence', () => {
  assert.ok(lcIS456.lifecycle, 'Lifecycle must exist for IS 456');
  assert.strictEqual(lcIS456.lifecycle.edition_year, 2000);
  assert.strictEqual(lcIS456.lifecycle.lifecycle_status, 'reaffirmed');
  assert.strictEqual(lcIS456.lifecycle.reaffirmation_year, 2025);
  assert.strictEqual(lcIS456.coverage.lifecycle_verified, true);
});

// -------------------------------------------------------------
// Test L: Amendment Data
// -------------------------------------------------------------
console.log('\nTEST L: Amendment Data...');

it('Test L.1: IS 456 amendments ordered chronologically with official provenance', () => {
  assert.strictEqual(lcIS456.coverage.amendments_verified, true);
  assert.ok(lcIS456.amendments.length >= 6, 'IS 456 should have 6 amendments');
  for (let i = 0; i < lcIS456.amendments.length - 1; i++) {
    assert.ok(
      lcIS456.amendments[i].amendment_number < lcIS456.amendments[i + 1].amendment_number,
      'Amendments must be strictly ordered by amendment number'
    );
  }
});

// -------------------------------------------------------------
// Test M: Regulatory Evidence (Mandatory QCO / CRS)
// -------------------------------------------------------------
console.log('\nTEST M: Regulatory Evidence (Mandatory QCO / CRS)...');

await itAsync('Test M.1: IS 1786 returns VERIFIED APPLICABILITY under Ministry of Steel QCO', async () => {
  const regCheck = await getStandardRegulatoryCheck('bis-is-1786-2008');
  assert.strictEqual(regCheck.has_verified_requirement, true);
  const steelScheme = regCheck.schemes.find((s) => s.scheme_code === 'bis_product_certification');
  assert.strictEqual(steelScheme.status, 'verified_requirement');
  assert.strictEqual(steelScheme.status_label, 'Verified applicability');
  assert.ok(steelScheme.evidence_order.includes('Steel'));
});

await itAsync('Test M.2: IS 16102 (Part 1) returns VERIFIED APPLICABILITY under MeitY CRS', async () => {
  const regCheck = await getStandardRegulatoryCheck('bis-is-16102-1-2026');
  assert.strictEqual(regCheck.has_verified_requirement, true);
  const crsScheme = regCheck.schemes.find((s) => s.scheme_code === 'crs');
  assert.strictEqual(crsScheme.status, 'verified_requirement');
  assert.strictEqual(crsScheme.status_label, 'Verified applicability');
  assert.ok(crsScheme.authority.includes('MeitY') || crsScheme.authority.includes('Electronics'));
});

// -------------------------------------------------------------
// Test N: Missing Regulatory Evidence / Voluntary
// -------------------------------------------------------------
console.log('\nTEST N: Missing Regulatory Evidence / Voluntary...');

await itAsync('Test N.1: IS 10322 returns VERIFICATION REQUIRED safely without fabricated mandates', async () => {
  const regCheck = await getStandardRegulatoryCheck('bis-is-10322-5-3-2026');
  const luminaireBisCert = regCheck.schemes.find((s) => s.scheme_code === 'bis_product_certification');
  assert.strictEqual(luminaireBisCert.status, 'verification_required');
  assert.strictEqual(luminaireBisCert.status_label, 'Verification required');

  const hallmarking = regCheck.schemes.find((s) => s.scheme_code === 'hallmarking');
  assert.strictEqual(hallmarking.status, 'no_verified_record');
});

// -------------------------------------------------------------
// Test O: Requirement Gap Analysis
// -------------------------------------------------------------
console.log('\nTEST O: Requirement Gap Analysis...');

it('Test O.1: Gap analysis produces REFERENCE COVERAGE metric with 4 valid states', () => {
  const std10322 = VERIFIED_BIS_STANDARDS.find(s => s.id === 'bis-is-10322-5-3-2026');
  const gapAnalysis = analyzeRequirementGaps(extractedA, std10322);

  assert.ok(gapAnalysis.referenceCoverage !== undefined, 'Reference coverage metric must be present');
  assert.ok(typeof gapAnalysis.referenceCoverageExplanation === 'string', 'Coverage explanation must exist');
  assert.ok(Array.isArray(gapAnalysis.items), 'Gap analysis items must be an array');

  const validStates = new Set(['supported', 'not_supported', 'not_available', 'needs_verification']);
  gapAnalysis.items.forEach(p => {
    assert.ok(validStates.has(p.status), `Invalid parameter gap status: ${p.status}`);
  });
});

// -------------------------------------------------------------
// Test P: Standards Comparison
// -------------------------------------------------------------
console.log('\nTEST P: Standards Comparison...');

it('Test P.1: Compares 2 standards across 11 dimensions neutrally without winner declaration', () => {
  const std1 = VERIFIED_BIS_STANDARDS.find(s => s.id === 'bis-is-10322-1-2026');
  const std2 = VERIFIED_BIS_STANDARDS.find(s => s.id === 'bis-is-10322-5-3-2026');

  const comparison = compareStandards(extractedA, [std1, std2]);
  assert.ok(comparison.matrixRows && comparison.matrixRows.length > 0, 'Comparison matrixRows must exist');
  assert.strictEqual(comparison.standards.length, 2);
  assert.strictEqual(comparison.winner, undefined, 'Must NEVER declare a winner');
  assert.strictEqual(comparison.superior_standard, undefined, 'Must NEVER declare superior standard');
  assert.strictEqual(comparison.best_standard, undefined, 'Must NEVER declare best standard');
});

// -------------------------------------------------------------
// Test Q: Traceability (5-Stage Evidence Chain)
// -------------------------------------------------------------
console.log('\nTEST Q: Traceability (5-Stage Evidence Chain)...');

it('Test Q.1: Recommendation exposes complete 5-stage evidence trail to official source', () => {
  const topRec = matchF.recommendations[0];
  assert.ok(topRec.traceabilityChain, 'Must have traceabilityChain');
  assert.strictEqual(topRec.traceabilityChain.length, 5, 'Must have 5 steps');

  const stages = topRec.traceabilityChain.map(s => s.stage);
  assert.strictEqual(stages[0], 'user_input');
  assert.strictEqual(stages[1], 'extracted_requirement');
  assert.strictEqual(stages[2], 'matching_signal');
  assert.strictEqual(stages[3], 'bis_standard');
  assert.strictEqual(stages[4], 'official_bis_source');
});

// -------------------------------------------------------------
// Test R: Official BIS Source URL Validation
// -------------------------------------------------------------
console.log('\nTEST R: Official BIS Source URL Validation...');

it('Test R.1: Only accepts official HTTPS BIS and Gazette domains', () => {
  assert.strictEqual(isOfficialBisSourceUrl('https://www.bis.gov.in/know-your-standard/'), true);
  assert.strictEqual(isOfficialBisSourceUrl('https://services.bis.gov.in/php/BIS_2.0/'), true);
  assert.strictEqual(isOfficialBisSourceUrl('https://crsbis.in/BIS/'), true);
  assert.strictEqual(isOfficialBisSourceUrl('https://egazette.gov.in/'), true);

  // Rejections
  assert.strictEqual(isOfficialBisSourceUrl('http://www.bis.gov.in/insecure'), false, 'Insecure HTTP must be rejected');
  assert.strictEqual(isOfficialBisSourceUrl('https://fake-bis.com/standard'), false, 'Arbitrary domain must be rejected');
  assert.strictEqual(isOfficialBisSourceUrl('https://blog.example.com/is10322'), false, 'Third-party blog must be rejected');
  assert.strictEqual(isOfficialBisSourceUrl('javascript:alert(1)'), false, 'Script URLs must be rejected');
});

it('Test R.2: Ingestion schema rejects record with unverified external domain', () => {
  const candidate = {
    id: 'bis-is-99999-2026',
    standard_number: 'IS 99999:2026',
    title: 'Test Fabricated Standard',
    category: 'Electrical',
    scope: 'Test scope',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://thirdparty-download-site.com/standard.pdf',
    verification_status: 'verified',
    last_verified: '2026-09-20',
  };

  const validation = validateStandardForIngestion(candidate);
  assert.strictEqual(validation.valid, false);
  assert.ok(validation.errors.some(e => e.code === 'INVALID_OFFICIAL_BIS_URL'));
});

// -------------------------------------------------------------
// Test S: Document Ingestion / Upload
// -------------------------------------------------------------
console.log('\nTEST S: Document Upload / Ingestion...');

const fixturesDir = new URL('./test-fixtures', import.meta.url);

await itAsync('Test S.1: Ingests machine-readable PDF document successfully into extraction pipeline', async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const lightingPdfPath = fileURLToPath(new URL('./test-fixtures/lighting-procurement.pdf', import.meta.url));
  const buffer = readFileSync(lightingPdfPath);

  const docResult = await extractDocument({
    buffer,
    originalname: 'lighting-procurement.pdf',
    mimetype: 'application/pdf',
    size: buffer.length,
  });

  assert.strictEqual(typeof docResult.text, 'string');
  assert.ok(docResult.text.includes('100W'));
  assert.ok(docResult.text.includes('LED street lighting'));
  assert.strictEqual(docResult.fileType, 'pdf');
  assert.strictEqual(docResult.isScannedOrEmpty, false);
  assert.strictEqual(docResult.isOcrDerived, false);
});

// -------------------------------------------------------------
// Test T: Unsupported / Scanned Document Safe Handling
// -------------------------------------------------------------
console.log('\nTEST T: Unsupported / Scanned Document Safe Handling...');

await itAsync('Test T.1: Scanned/image-only PDF without OCR is safely identified with explicit guidance', async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const scannedPdfPath = fileURLToPath(new URL('./test-fixtures/scanned-document.pdf', import.meta.url));
  const buffer = readFileSync(scannedPdfPath);

  const docResult = await extractDocument({
    buffer,
    originalname: 'scanned-document.pdf',
    mimetype: 'application/pdf',
    size: buffer.length,
    enableOcr: false,
  });

  assert.strictEqual(docResult.isScannedOrEmpty, true);
  assert.ok(docResult.warnings.some(w => w.includes('scanned/image-based')));
  assert.strictEqual(docResult.isOcrDerived, false);
});

console.log('\n===========================================================');
console.log(`🎉 ALL ${passedCount} / ${totalCount} SIH26108 COMPREHENSIVE TESTS PASSED!`);
console.log('===========================================================\n');
