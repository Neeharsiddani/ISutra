// ============================================================
// ISutra: SIH26108 Multilingual Procurement Input Verification Suite
// Tests safe, focused multilingual input layer for English, Hindi, and Telugu
// Validates identical deterministic BIS matching behavior
// ============================================================

import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { matchRequirementsToStandards } from './dist/services/standardsMatcher.js';
import {
  detectInputLanguage,
  translateIndicProcurementConcepts,
} from './dist/services/ai/multilingualService.js';
import { extractWithPatternMatching } from './dist/services/ai/nlpExtractor.js';
import { runRequirementExtractionPipeline } from './dist/services/ai/requirementExtractor.js';
import { analyzeSpecification } from './dist/services/analysisService.js';

console.log('===========================================================');
console.log('🌐 ISUTRA MULTILINGUAL PROCUREMENT INPUT VERIFICATION SUITE');
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
// TEST 0: Dataset & 6-Factor Weights Integrity
// ------------------------------------------------------------
console.log('\nTest 0: Dataset and Matching Rules Integrity...');
assert(
  VERIFIED_BIS_STANDARDS.length === 40,
  `Dataset must contain exactly 40 verified standards, found: ${VERIFIED_BIS_STANDARDS.length}`
);

// ------------------------------------------------------------
// TEST 1: English LED Street-Light Procurement Requirement
// ------------------------------------------------------------
console.log('\nTest 1: English LED street-light requirement...');
const enInput =
  'Outdoor LED street lighting system, 100W, weather resistant, pole mounted, IP65 enclosure, surge protection 10kV.';
const enLang = detectInputLanguage(enInput, 'auto');
assert(enLang.detected_language === 'en', `English language detected correctly (got: ${enLang.detected_language})`);
assert(enLang.is_supported === true, 'English is marked as supported');

const enExtraction = extractWithPatternMatching(enInput, 'technical_specification', enLang);
assert(
  enExtraction.product.name.toLowerCase().includes('led street lighting'),
  `English product extracted: '${enExtraction.product.name}'`
);
assert(
  enExtraction.product.category === 'Lighting & Luminaires',
  `English category mapped: '${enExtraction.product.category}'`
);

const enMatch = matchRequirementsToStandards(enExtraction, VERIFIED_BIS_STANDARDS, enInput);
assert(enMatch.recommendations.length > 0, 'Matching produced recommendations');
const enPrimary = enMatch.recommendations[0];
assert(
  enPrimary.standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `English primary match is IS 10322 (Part 5/Sec 3):2026 (got: ${enPrimary.standard.standard_number})`
);
const enScore = enPrimary.relevancePercentage;
assert(enScore === 80, `English primary score is 80% (got: ${enScore}%)`);

// ------------------------------------------------------------
// TEST 2: Hindi Equivalent Procurement Description
// ------------------------------------------------------------
console.log('\nTest 2: Hindi equivalent procurement description...');
const hiInput =
  'नगर निगम सड़क प्रकाश व्यवस्था के लिए 100 वाट एलईडी स्ट्रीट लाइट, बाहरी मौसम प्रतिरोधी, पोल माउंटेड, आईपी65, 10 केवी सर्ज सुरक्षा';

const hiLang = detectInputLanguage(hiInput, 'auto');
assert(hiLang.detected_language === 'hi', `Hindi language detected correctly (got: ${hiLang.detected_language})`);
assert(hiLang.detected_language_label === 'Hindi', `Label is 'Hindi' (got: ${hiLang.detected_language_label})`);
assert(hiLang.is_supported === true, 'Hindi is supported');

const hiExtraction = extractWithPatternMatching(hiInput, 'technical_specification', hiLang);
assert(
  hiExtraction.product.name === 'LED street lighting luminaire',
  `Hindi product normalized to standardized English: '${hiExtraction.product.name}'`
);
assert(
  hiExtraction.product.category === 'Lighting & Luminaires',
  `Hindi category normalized: '${hiExtraction.product.category}'`
);
assert(
  hiExtraction.application === 'Highway & Municipal road lighting',
  `Hindi application normalized: '${hiExtraction.application}'`
);
assert(
  hiExtraction.environment.some((e) => e.name === 'Outdoor'),
  'Hindi environment contains Outdoor'
);
assert(
  hiExtraction.environment.some((e) => e.name === 'Weather resistant'),
  'Hindi environment contains Weather resistant'
);
assert(
  hiExtraction.installation_requirements.some((i) => i.name === 'Pole mounted'),
  'Hindi installation contains Pole mounted'
);
assert(
  hiExtraction.technical_parameters.some((p) => p.parameter === 'Power' && p.value === '100W'),
  'Hindi parameters contain 100W'
);
assert(
  hiExtraction.technical_parameters.some((p) => p.parameter === 'Ingress Protection' && p.value === 'IP65'),
  'Hindi parameters contain IP65'
);
assert(
  hiExtraction.technical_parameters.some((p) => p.parameter === 'Surge Protection' && p.value === '10kV'),
  'Hindi parameters contain 10kV'
);
assert(
  Boolean(hiExtraction.product.source_text),
  `Hindi original snippet preserved in source_text: '${hiExtraction.product.source_text}'`
);

// Deterministic matching invariance
const hiMatch = matchRequirementsToStandards(hiExtraction, VERIFIED_BIS_STANDARDS, hiInput);
assert(hiMatch.recommendations.length > 0, 'Hindi matching produced recommendations');
const hiPrimary = hiMatch.recommendations[0];
assert(
  hiPrimary.standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `Hindi primary match is IS 10322 (Part 5/Sec 3):2026 (got: ${hiPrimary.standard.standard_number})`
);
assert(
  hiPrimary.relevancePercentage === enScore,
  `Deterministic matching score invariant: Hindi score (${hiPrimary.relevancePercentage}%) === English score (${enScore}%)`
);
assert(
  hiPrimary.specificityTier === enPrimary.specificityTier,
  `Specificity tier invariant: Hindi ('${hiPrimary.specificityTier}') === English ('${enPrimary.specificityTier}')`
);

// ------------------------------------------------------------
// TEST 3: Telugu Equivalent Procurement Description
// ------------------------------------------------------------
console.log('\nTest 3: Telugu equivalent procurement description...');
const teInput =
  'మున్సిపల్ రోడ్ల కోసం 100 వాట్లు ఎల్‌ఈడీ స్ట్రీట్ లైట్లు, బహిరంగ వాతావరణ నిరోధక, పోల్ మౌంటెడ్, ఐపీ65, 10 కేవీ సర్జ్ రక్షణ';

const teLang = detectInputLanguage(teInput, 'auto');
assert(teLang.detected_language === 'te', `Telugu language detected correctly (got: ${teLang.detected_language})`);
assert(teLang.detected_language_label === 'Telugu', `Label is 'Telugu' (got: ${teLang.detected_language_label})`);
assert(teLang.is_supported === true, 'Telugu is supported');

const teExtraction = extractWithPatternMatching(teInput, 'technical_specification', teLang);
assert(
  teExtraction.product.name === 'LED street lighting luminaire',
  `Telugu product normalized to standardized English: '${teExtraction.product.name}'`
);
assert(
  teExtraction.product.category === 'Lighting & Luminaires',
  `Telugu category normalized: '${teExtraction.product.category}'`
);
assert(
  teExtraction.application === 'Highway & Municipal road lighting',
  `Telugu application normalized: '${teExtraction.application}'`
);
assert(
  teExtraction.environment.some((e) => e.name === 'Outdoor'),
  'Telugu environment contains Outdoor'
);
assert(
  teExtraction.environment.some((e) => e.name === 'Weather resistant'),
  'Telugu environment contains Weather resistant'
);
assert(
  teExtraction.installation_requirements.some((i) => i.name === 'Pole mounted'),
  'Telugu installation contains Pole mounted'
);
assert(
  teExtraction.technical_parameters.some((p) => p.parameter === 'Power' && p.value === '100W'),
  'Telugu parameters contain 100W'
);
assert(
  teExtraction.technical_parameters.some((p) => p.parameter === 'Ingress Protection' && p.value === 'IP65'),
  'Telugu parameters contain IP65'
);
assert(
  teExtraction.technical_parameters.some((p) => p.parameter === 'Surge Protection' && p.value === '10kV'),
  'Telugu parameters contain 10kV'
);
assert(
  Boolean(teExtraction.product.source_text),
  `Telugu original snippet preserved in source_text: '${teExtraction.product.source_text}'`
);

// Deterministic matching invariance
const teMatch = matchRequirementsToStandards(teExtraction, VERIFIED_BIS_STANDARDS, teInput);
assert(teMatch.recommendations.length > 0, 'Telugu matching produced recommendations');
const tePrimary = teMatch.recommendations[0];
assert(
  tePrimary.standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `Telugu primary match is IS 10322 (Part 5/Sec 3):2026 (got: ${tePrimary.standard.standard_number})`
);
assert(
  tePrimary.relevancePercentage === enScore,
  `Deterministic matching score invariant: Telugu score (${tePrimary.relevancePercentage}%) === English score (${enScore}%)`
);
assert(
  tePrimary.relevancePercentage === hiPrimary.relevancePercentage,
  `Deterministic matching score invariant: Telugu (${tePrimary.relevancePercentage}%) === Hindi (${hiPrimary.relevancePercentage}%)`
);

// ------------------------------------------------------------
// TEST 4: Mixed-Language Procurement Input
// ------------------------------------------------------------
console.log('\nTest 4: Mixed-language input (English + Hindi technical terms)...');
const mixedInput =
  '100W LED street light for नगर निगम, outdoor IP65 with 10kV surge protection, खंभे पर स्थापित';

const mixedLang = detectInputLanguage(mixedInput, 'auto');
assert(
  mixedLang.detected_language === 'mixed' || mixedLang.detected_language === 'hi',
  `Mixed language identified (got: ${mixedLang.detected_language})`
);
assert(mixedLang.is_supported === true, 'Mixed input is marked as supported');

const mixedExtraction = extractWithPatternMatching(mixedInput, 'technical_specification', mixedLang);
assert(
  mixedExtraction.product.name.toLowerCase().includes('led street lighting'),
  `Mixed input product identified: '${mixedExtraction.product.name}'`
);
assert(
  mixedExtraction.technical_parameters.some((p) => p.parameter === 'Power' && p.value === '100W'),
  'Mixed input extracts 100W power'
);
assert(
  mixedExtraction.technical_parameters.some((p) => p.parameter === 'Ingress Protection' && p.value === 'IP65'),
  'Mixed input extracts IP65'
);

const mixedMatch = matchRequirementsToStandards(mixedExtraction, VERIFIED_BIS_STANDARDS, mixedInput);
assert(
  mixedMatch.recommendations[0].standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `Mixed input primary match is IS 10322: ${mixedMatch.recommendations[0].standard.standard_number}`
);

// ------------------------------------------------------------
// TEST 5: Unsupported / Ambiguous Language
// ------------------------------------------------------------
console.log('\nTest 5: Unsupported language input (Cyrillic script)...');
const cyrillicInput =
  'Поставка уличных светодиодных светильников для муниципального освещения 100W IP65';

const unsupportedLang = detectInputLanguage(cyrillicInput, 'auto');
assert(
  unsupportedLang.detected_language === 'unsupported',
  `Unsupported script detected as 'unsupported' (got: ${unsupportedLang.detected_language})`
);
assert(
  unsupportedLang.is_supported === false,
  'Unsupported script is marked is_supported: false'
);

const unsupportedExtraction = extractWithPatternMatching(cyrillicInput, 'technical_specification', unsupportedLang);
assert(
  unsupportedExtraction.ready_for_matching === false,
  'Unsupported language input is marked ready_for_matching: false'
);
assert(
  unsupportedExtraction.overall_confidence === 'needs_review',
  'Unsupported language input confidence is needs_review'
);
assert(
  unsupportedExtraction.blocking_missing_information.length > 0,
  'Unsupported language input has blocking missing information'
);
assert(
  unsupportedExtraction.blocking_missing_information[0].includes('not supported in current prototype'),
  `Blocking message explains prototype limitation: '${unsupportedExtraction.blocking_missing_information[0]}'`
);

// ------------------------------------------------------------
// TEST 6: Empty Input
// ------------------------------------------------------------
console.log('\nTest 6: Empty input handling...');
const emptyLang = detectInputLanguage('', 'auto');
assert(emptyLang.confidence === 0.0, 'Empty input language detection returns 0.0 confidence');
assert(emptyLang.is_supported === true, 'Empty input does not throw');

let emptyPipelineThrew = false;
try {
  await runRequirementExtractionPipeline('', 'product_description');
} catch (err) {
  emptyPipelineThrew = true;
  assert(err.message.includes('cannot be empty'), `Empty input rejected gracefully: ${err.message}`);
}
assert(emptyPipelineThrew, 'Pipeline rejects empty string with validation error');

// ------------------------------------------------------------
// TEST 7: Language Detection Failure / Fallback
// ------------------------------------------------------------
console.log('\nTest 7: Language detection failure / symbols only...');
const symbolsInput = '12345 67890 !@#$%^&*()';
const symbolsLang = detectInputLanguage(symbolsInput, 'auto');
assert(
  symbolsLang.detected_language === 'en',
  `Symbols only gracefully defaults to English (got: ${symbolsLang.detected_language})`
);
assert(
  symbolsLang.detection_method === 'fallback_default',
  `Detection method is 'fallback_default' (got: ${symbolsLang.detection_method})`
);

// ------------------------------------------------------------
// TEST 8: Explicit User Selection Override
// ------------------------------------------------------------
console.log('\nTest 8: User selected language override...');
const overrideEn = detectInputLanguage('100W street light', 'hi');
assert(
  overrideEn.detected_language === 'hi',
  `User selection 'hi' respected over text (got: ${overrideEn.detected_language})`
);
assert(
  overrideEn.detection_method === 'user_selected',
  `Detection method is 'user_selected' (got: ${overrideEn.detection_method})`
);

// ------------------------------------------------------------
// TEST 9: Cable Domain Invariance in Hindi & Telugu
// ------------------------------------------------------------
console.log('\nTest 9: Cable domain equivalence in Hindi & Telugu...');
const hiCable = 'भूमिगत विद्युत वितरण के लिए 11 केवी एक्सएलपीई इंसुलेटेड पावर केबल';
const teCable = 'భూగర్భ విద్యుత్ సరఫరా కోసం 11 కేవీ ఎక్స్‌ఎల్‌పీఈ విద్యుత్ కేబుల్';

const hiCableExtract = extractWithPatternMatching(hiCable, 'technical_specification', detectInputLanguage(hiCable));
const teCableExtract = extractWithPatternMatching(teCable, 'technical_specification', detectInputLanguage(teCable));

assert(
  hiCableExtract.product.name === 'XLPE insulated power cables',
  `Hindi cable extracted: '${hiCableExtract.product.name}'`
);
assert(
  teCableExtract.product.name === 'XLPE insulated power cables',
  `Telugu cable extracted: '${teCableExtract.product.name}'`
);

const hiCableMatch = matchRequirementsToStandards(hiCableExtract, VERIFIED_BIS_STANDARDS, hiCable);
const teCableMatch = matchRequirementsToStandards(teCableExtract, VERIFIED_BIS_STANDARDS, teCable);

assert(
  hiCableMatch.recommendations[0].standard.standard_number === teCableMatch.recommendations[0].standard.standard_number,
  `Hindi and Telugu cables match identical standard: ${hiCableMatch.recommendations[0].standard.standard_number}`
);
assert(
  hiCableMatch.recommendations[0].relevancePercentage === teCableMatch.recommendations[0].relevancePercentage,
  `Hindi and Telugu cables achieve identical matching score: ${hiCableMatch.recommendations[0].relevancePercentage}%`
);

// ------------------------------------------------------------
// TEST 10: Zero-Hallucination Guardrail Check
// ------------------------------------------------------------
console.log('\nTest 10: Zero LLM / Translation standard hallucination guardrail...');
assert(
  !hiExtraction.product.name.includes('IS '),
  'Extracted product name contains no hallucinated IS standard number'
);
assert(
  !hiExtraction.technical_parameters.some((p) => p.parameter.includes('Clause') || p.value.includes('IS ')),
  'Extracted parameters contain no hallucinated clauses or IS numbers'
);

// ------------------------------------------------------------
// TEST 11: End-to-End Analysis Service with Language Metadata
// ------------------------------------------------------------
console.log('\nTest 11: End-to-end analysisService.analyzeSpecification with language metadata...');
const serviceResult = await analyzeSpecification(
  'technical_specification',
  hiInput,
  'auto'
);
assert(
  serviceResult.input_language === 'hi',
  `serviceResult.input_language recorded as 'hi' (got: ${serviceResult.input_language})`
);
assert(
  serviceResult.language_metadata?.detected_language_label === 'Hindi',
  `serviceResult.language_metadata.detected_language_label is 'Hindi'`
);
assert(
  serviceResult.ready_for_matching === true,
  'serviceResult ready_for_matching is true for valid Hindi requirement'
);

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------
console.log('\n===========================================================');
console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('===========================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL MULTILINGUAL VERIFICATION TESTS PASSED PERFECTLY!\n');
}
