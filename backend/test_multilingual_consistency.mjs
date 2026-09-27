// ============================================================
// ISutra: SIH26108 Multilingual Consistency & Flagship LED Verification Suite
// Tests requirements A through K from Analysis #2
// Strictly preserves 40 verified reference standards
// ============================================================

import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { matchRequirementsToStandards } from './dist/services/standardsMatcher.js';
import {
  detectInputLanguage,
  translateIndicProcurementConcepts,
} from './dist/services/ai/multilingualService.js';
import { extractWithPatternMatching } from './dist/services/ai/nlpExtractor.js';
import { analyzeSpecification } from './dist/services/analysisService.js';
import { analyzeRequirementGaps } from './dist/services/requirementGapAnalyzer.js';
import { getStandardLifecycle } from './dist/services/standardLifecycleService.js';
import { compareStandards } from './dist/services/standardsComparator.js';
import {
  generateProcurementReportData,
  generatePrintableHtmlReport,
} from './dist/services/procurementReportService.js';

console.log('===========================================================');
console.log('🏛️ ISUTRA SIH26108 MULTILINGUAL CONSISTENCY & FLAGSHIP LED SUITE');
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
// 1. DATASET INTEGRITY CHECK
// ------------------------------------------------------------
console.log('\n[1/12] Verified BIS Reference Dataset Integrity...');
assert(
  VERIFIED_BIS_STANDARDS.length === 40,
  `Dataset must contain exactly 40 verified reference standards (found: ${VERIFIED_BIS_STANDARDS.length})`
);

const ledStandard = VERIFIED_BIS_STANDARDS.find(
  (s) => s.standard_number === 'IS 10322 (Part 5/Sec 3):2026'
);
assert(Boolean(ledStandard), 'IS 10322 (Part 5/Sec 3):2026 exists in reference dataset');
assert(
  ledStandard.source_url.startsWith('https://www.bis.gov.in/'),
  'Official BIS URL source points to verified bis.gov.in domain'
);

// ------------------------------------------------------------
// 2. ENGLISH LED STREET-LIGHT EXTRACTION & MATCHING
// ------------------------------------------------------------
console.log('\n[2/12] English Controlled LED Procurement Scenario...');
const enText =
  'Outdoor LED street lighting system, 100W, weather resistant, pole mounted, IP65 enclosure, surge protection 10kV.';
const enLang = detectInputLanguage(enText, 'en');
assert(enLang.detected_language === 'en', 'Language detected as English');

const enExt = extractWithPatternMatching(enText, 'technical_specification', enLang);
assert(
  enExt.product.category === 'Lighting & Luminaires',
  `English category is 'Lighting & Luminaires' (got: ${enExt.product.category})`
);
assert(
  enExt.environment.some((e) => e.name.toLowerCase().includes('outdoor')),
  'English environment has Outdoor'
);
assert(
  enExt.environment.some((e) => e.name.toLowerCase().includes('weather')),
  'English environment has Weather resistant'
);
assert(
  enExt.installation_requirements.some((i) => i.name.toLowerCase().includes('pole')),
  'English installation has Pole mounted'
);
assert(
  enExt.technical_parameters.some((p) => p.parameter === 'Power' && p.value.includes('100W')),
  'English parameter: Power 100W extracted'
);
assert(
  enExt.technical_parameters.some((p) => p.parameter === 'Ingress Protection' && p.value.includes('IP65')),
  'English parameter: Ingress Protection IP65 extracted'
);
assert(
  enExt.safety_requirements.some((s) => s.name.toLowerCase().includes('surge')),
  'English safety requirements has Surge protection'
);

const enMatch = matchRequirementsToStandards(enExt, VERIFIED_BIS_STANDARDS, enText);
assert(enMatch.recommendations.length > 0, 'English matching returned recommendations');
assert(
  enMatch.recommendations[0].standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `English top standard is IS 10322 (Part 5/Sec 3):2026 (got: ${enMatch.recommendations[0].standard.standard_number})`
);
assert(
  enMatch.recommendations[0].relevancePercentage === 80,
  `English top relevance score is 80% (got: ${enMatch.recommendations[0].relevancePercentage}%)`
);

// ------------------------------------------------------------
// 3. HINDI EQUIVALENT LED PROCUREMENT EXTRACTION & MATCHING
// ------------------------------------------------------------
console.log('\n[3/12] Hindi Equivalent LED Procurement Scenario...');
const hiText =
  'नगर निगम सड़क प्रकाश व्यवस्था के लिए 100 वाट एलईडी स्ट्रीट लाइट, बाहरी मौसम प्रतिरोधी, पोल माउंटेड, आईपी65, 10 केवी सर्ज सुरक्षा';
const hiLang = detectInputLanguage(hiText, 'auto');
assert(hiLang.detected_language === 'hi', 'Language detected as Hindi');
assert(hiLang.is_supported === true, 'Hindi is supported');

const hiExt = extractWithPatternMatching(hiText, 'technical_specification', hiLang);
assert(
  hiExt.product.category === 'Lighting & Luminaires',
  `Hindi category normalized: '${hiExt.product.category}'`
);
assert(
  hiExt.application === 'Highway & Municipal road lighting',
  `Hindi application normalized: '${hiExt.application}'`
);
assert(
  hiExt.environment.some((e) => e.name === 'Outdoor'),
  'Hindi environment contains Outdoor'
);
assert(
  hiExt.environment.some((e) => e.name === 'Weather resistant'),
  'Hindi environment contains Weather resistant'
);
assert(
  hiExt.installation_requirements.some((i) => i.name === 'Pole mounted'),
  'Hindi installation contains Pole mounted'
);
assert(
  hiExt.technical_parameters.some((p) => p.parameter === 'Power' && p.value === '100W'),
  'Hindi parameter: Power 100W extracted'
);
assert(
  hiExt.technical_parameters.some((p) => p.parameter === 'Ingress Protection' && p.value === 'IP65'),
  'Hindi parameter: Ingress Protection IP65 extracted'
);
assert(
  hiExt.safety_requirements.some((s) => s.name === 'Surge protection'),
  'Hindi safety requirements contains Surge protection'
);

const hiMatch = matchRequirementsToStandards(hiExt, VERIFIED_BIS_STANDARDS, hiText);
assert(hiMatch.recommendations.length > 0, 'Hindi matching produced recommendations');
assert(
  hiMatch.recommendations[0].standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `Hindi top standard is IS 10322 (Part 5/Sec 3):2026 (got: ${hiMatch.recommendations[0].standard.standard_number})`
);
assert(
  hiMatch.recommendations[0].relevancePercentage === 80,
  `Hindi top relevance score is 80% (got: ${hiMatch.recommendations[0].relevancePercentage}%)`
);

// ------------------------------------------------------------
// 4. TELUGU EQUIVALENT LED PROCUREMENT EXTRACTION & MATCHING
// ------------------------------------------------------------
console.log('\n[4/12] Telugu Equivalent LED Procurement Scenario...');
const teText =
  'మున్సిపల్ రోడ్ల కోసం 100 వాట్లు ఎల్‌ఈడీ స్ట్రీట్ లైట్లు, బహిరంగ వాతావరణ నిరోధక, పోల్ మౌంటెడ్, ఐపీ65, 10 కేవీ సర్జ్ రక్షణ';
const teLang = detectInputLanguage(teText, 'auto');
assert(teLang.detected_language === 'te', 'Language detected as Telugu');
assert(teLang.is_supported === true, 'Telugu is supported');

const teExt = extractWithPatternMatching(teText, 'technical_specification', teLang);
assert(
  teExt.product.category === 'Lighting & Luminaires',
  `Telugu category normalized: '${teExt.product.category}'`
);
assert(
  teExt.application === 'Highway & Municipal road lighting',
  `Telugu application normalized: '${teExt.application}'`
);
assert(
  teExt.environment.some((e) => e.name === 'Outdoor'),
  'Telugu environment contains Outdoor'
);
assert(
  teExt.environment.some((e) => e.name === 'Weather resistant'),
  'Telugu environment contains Weather resistant'
);
assert(
  teExt.installation_requirements.some((i) => i.name === 'Pole mounted'),
  'Telugu installation contains Pole mounted'
);
assert(
  teExt.technical_parameters.some((p) => p.parameter === 'Power' && p.value === '100W'),
  'Telugu parameter: Power 100W extracted'
);
assert(
  teExt.technical_parameters.some((p) => p.parameter === 'Ingress Protection' && p.value === 'IP65'),
  'Telugu parameter: Ingress Protection IP65 extracted'
);
assert(
  teExt.safety_requirements.some((s) => s.name === 'Surge protection'),
  'Telugu safety requirements contains Surge protection'
);

const teMatch = matchRequirementsToStandards(teExt, VERIFIED_BIS_STANDARDS, teText);
assert(teMatch.recommendations.length > 0, 'Telugu matching produced recommendations');
assert(
  teMatch.recommendations[0].standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  `Telugu top standard is IS 10322 (Part 5/Sec 3):2026 (got: ${teMatch.recommendations[0].standard.standard_number})`
);
assert(
  teMatch.recommendations[0].relevancePercentage === 80,
  `Telugu top relevance score is 80% (got: ${teMatch.recommendations[0].relevancePercentage}%)`
);

// ------------------------------------------------------------
// 5. CROSS-LINGUAL CONSISTENCY (Analysis #2 Criterion 3)
// ------------------------------------------------------------
console.log('\n[5/12] Multilingual Consistency Verification...');
assert(
  enExt.product.category === hiExt.product.category && hiExt.product.category === teExt.product.category,
  'Product category is invariant across English, Hindi, and Telugu'
);
assert(
  enMatch.recommendations[0].standard.standard_number === hiMatch.recommendations[0].standard.standard_number &&
  hiMatch.recommendations[0].standard.standard_number === teMatch.recommendations[0].standard.standard_number,
  'Top recommended standard is identical across English, Hindi, and Telugu'
);
assert(
  enMatch.recommendations[0].relevancePercentage === hiMatch.recommendations[0].relevancePercentage &&
  hiMatch.recommendations[0].relevancePercentage === teMatch.recommendations[0].relevancePercentage,
  'Relevance percentage is invariant across English, Hindi, and Telugu (80%)'
);

// ------------------------------------------------------------
// 6. UNSUPPORTED LANGUAGE & SCRIPT HANDLING (Analysis #2 Criterion 2D)
// ------------------------------------------------------------
console.log('\n[6/12] Unsupported Language/Script Safety...');
const cyrillicText = 'Светодиодный уличный светильник для городского освещения 100 Вт';
const unLang = detectInputLanguage(cyrillicText, 'auto');
assert(unLang.detected_language === 'unsupported', 'Cyrillic detected as unsupported');
assert(unLang.is_supported === false, 'is_supported is false for unsupported script');

const unExt = extractWithPatternMatching(cyrillicText, 'technical_specification', unLang);
assert(unExt.ready_for_matching === false, 'Unsupported script marked ready_for_matching: false');
assert(
  unExt.blocking_missing_information && unExt.blocking_missing_information.length > 0,
  'Unsupported script has explicit blocking guidance'
);
assert(
  unExt.product.name.includes('Unsupported Script'),
  'Does not invent or hallucinate product or BIS standard for unsupported language'
);

// ------------------------------------------------------------
// 7. HUMAN REVIEW TRANSITION & EDIT CONFIRMATION
// ------------------------------------------------------------
console.log('\n[7/12] Human Review & Parameter Confirmation Flow...');
// Officer reviews extracted Hindi requirements and manually specifies CCT and warranty
const reviewedReqs = {
  ...hiExt,
  confirmed: true,
  technical_parameters: [
    ...hiExt.technical_parameters,
    {
      id: 'officer-cct',
      parameter: 'Color Temperature (CCT)',
      value: '5000K',
      confidence: 'high',
      source_text: 'Officer confirmation',
    },
  ],
};
assert(reviewedReqs.confirmed === true, 'Requirements confirmed by human reviewer');
const postReviewMatch = matchRequirementsToStandards(reviewedReqs, VERIFIED_BIS_STANDARDS, hiText);
assert(
  postReviewMatch.recommendations[0].standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
  'Post-review matching preserves top standard IS 10322 (Part 5/Sec 3):2026'
);

// ------------------------------------------------------------
// 8. EVIDENCE GENERATION & TRACEABILITY ("Why This Standard?")
// ------------------------------------------------------------
console.log('\n[8/12] Match Evidence & Traceability Chain...');
const topRec = enMatch.recommendations[0];
assert(topRec.evidence.length >= 4, `Traceable evidence items generated: ${topRec.evidence.length}`);
assert(topRec.traceabilityChain.length === 5, `Traceability chain has 5 stages (found: ${topRec.traceabilityChain.length})`);
assert(topRec.factorStatuses.productCategory.status === 'matched', 'Product Category factor is matched');
assert(topRec.factorStatuses.keywordsTitleScope.status === 'matched', 'Keywords factor is matched');
assert(topRec.factorStatuses.application.status === 'matched', 'Application factor is matched');
assert(topRec.factorStatuses.environment.status === 'matched', 'Environment factor is matched');

// ------------------------------------------------------------
// 9. REQUIREMENT GAP ANALYSIS
// ------------------------------------------------------------
console.log('\n[9/12] Requirement Gap Analysis...');
const gapResult = analyzeRequirementGaps(enExt, topRec.standard);
assert(gapResult !== null, 'Gap analysis generated');
assert(Array.isArray(gapResult.items) && gapResult.items.length > 0, `Gap items evaluated: ${gapResult.items.length}`);
assert(typeof gapResult.supportedCount === 'number', `Supported count: ${gapResult.supportedCount}`);
assert(typeof gapResult.notAvailableCount === 'number', `Not available count: ${gapResult.notAvailableCount}`);
assert(Array.isArray(gapResult.verificationActions), 'Verification actions generated');
assert(gapResult.disclaimer.includes('verified reference dataset'), 'Honest reference dataset disclaimer included in gap analysis');

// ------------------------------------------------------------
// 10. LIFECYCLE & AMENDMENT EVIDENCE
// ------------------------------------------------------------
console.log('\n[10/12] Lifecycle & Amendment Intelligence...');
const lcResult = getStandardLifecycle(topRec.standard.id);
assert(lcResult.lifecycle !== null && lcResult.lifecycle.standard_number === 'IS 10322 (Part 5/Sec 3):2026', 'Lifecycle retrieved for IS 10322 (Part 5/Sec 3):2026');
assert(lcResult.coverage.lifecycle_verified === true, 'Lifecycle marked as verified');
assert(lcResult.lifecycle.verified_source_url.includes('bis.gov.in'), 'Official BIS source domain verified as bis.gov.in');

// ------------------------------------------------------------
// 11. STANDARDS COMPARISON (No Winner Bias)
// ------------------------------------------------------------
console.log('\n[11/12] Standards Neutral Comparison...');
const compStd1 = VERIFIED_BIS_STANDARDS.find((s) => s.id === 'bis-is-10322-5-3-2026');
const compStd2 = VERIFIED_BIS_STANDARDS.find((s) => s.id === 'bis-is-10322-5-1-2026');
assert(Boolean(compStd1 && compStd2), 'Both standards found for comparison');

const compResult = compareStandards(enExt, [compStd1, compStd2]);
assert(compResult.standards.length === 2, 'Comparison includes 2 standards');
assert(compResult.matrixRows.length >= 5, `Comparison covers ${compResult.matrixRows.length} dimensions`);
assert(
  compResult.technicalDistinctions.length === 2,
  'Key distinctions identified between road luminaires and general luminaires'
);

// ------------------------------------------------------------
// 12. PROCUREMENT REPORT GENERATION
// ------------------------------------------------------------
console.log('\n[12/12] Self-Contained Procurement Report...');
const analysisResult = await analyzeSpecification('technical_specification', enText, 'en');
const reportData = await generateProcurementReportData(analysisResult.analysis_id);
assert(Boolean(reportData.reportId), `Report data generated with unique ID (${reportData.reportId})`);
const reportHtml = generatePrintableHtmlReport(reportData);
assert(typeof reportHtml === 'string' && reportHtml.length > 500, 'Procurement report HTML generated');
assert(reportHtml.includes('IS 10322 (Part 5/Sec 3):2026'), 'Report contains top recommended standard');
assert(reportHtml.toLowerCase().includes('40 verified bis reference records'), 'Report contains honest 40-record dataset disclaimer');
assert(reportHtml.includes('Official BIS'), 'Report mentions official BIS authority verification requirement');

// ------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------
console.log('\n===========================================================');
console.log(`TOTAL TESTS RUN: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('===========================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL MULTILINGUAL CONSISTENCY & FLAGSHIP TESTS PASSED PERFECTLY!\n');
}
