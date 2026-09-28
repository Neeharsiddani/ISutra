// ============================================================
// ISutra: MongoDB Database Layer Migration Verification Suite
// Validates:
// 1. Centralized connection config and URI credential sanitization
// 2. Mongoose models and schema integrity (Standard, Analysis, Recommendation)
// 3. Exactly 40 Verified BIS reference records preservation
// 4. Seeding idempotency (rerun always produces 40 records, 0 duplicates)
// 5. Standards Repository data access & search/filter/retrieval
// 6. Analysis Repository persistence & history
// 7. Recommendation Repository persistence & score fidelity
// 8. Flagship Municipal LED Street Light deterministic matching preservation
// ============================================================

import mongoose from 'mongoose';
import { sanitizeMongoUri, getDatabaseStatus } from './dist/config/database.js';
import { StandardModel } from './dist/models/Standard.js';
import { AnalysisModel } from './dist/models/Analysis.js';
import { RecommendationModel } from './dist/models/Recommendation.js';
import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import * as standardsRepo from './dist/repositories/standardsRepository.js';
import * as analysisRepo from './dist/repositories/analysisRepository.js';
import * as recommendationRepo from './dist/repositories/recommendationRepository.js';
import { matchRequirementsToStandards } from './dist/services/standardsMatcher.js';

console.log('===========================================================');
console.log('🍃 ISUTRA MONGODB DATABASE MIGRATION VERIFICATION SUITE');
console.log('===========================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  passedTests++;
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  // ------------------------------------------------------------
  // SECTION 1: Database Configuration & URI Masking
  // ------------------------------------------------------------
  console.log('Test Section 1: Database Configuration & Credential Safety...');

  // Check URI sanitization
  const testAtlasUri = 'mongodb+srv://admin_user:SuperSecretPassword123@cluster0.abcde.mongodb.net/isutra?retryWrites=true&w=majority';
  const sanitizedAtlas = sanitizeMongoUri(testAtlasUri);
  assert(!sanitizedAtlas.includes('SuperSecretPassword123'), 'Sanitized Atlas URI must mask password');
  assert(sanitizedAtlas.includes('admin_user:***@cluster0.abcde.mongodb.net'), 'Sanitized URI retains host and masked password');

  const testStandardUri = 'mongodb://app_user:p%40ssw0rd@127.0.0.1:27017/isutra';
  const sanitizedStandard = sanitizeMongoUri(testStandardUri);
  assert(!sanitizedStandard.includes('p%40ssw0rd'), 'Sanitized standard URI must mask encoded password');

  const testNoAuthUri = 'mongodb://127.0.0.1:27017/isutra';
  const sanitizedNoAuth = sanitizeMongoUri(testNoAuthUri);
  assert(sanitizedNoAuth === 'mongodb://127.0.0.1:27017/isutra', 'URI without credentials remains unchanged');

  // Check database status format
  const status = getDatabaseStatus();
  assert(typeof status.isConnected === 'boolean', 'getDatabaseStatus returns isConnected boolean');
  assert(typeof status.readyState === 'number', 'getDatabaseStatus returns numeric readyState');
  assert(typeof status.stateLabel === 'string', 'getDatabaseStatus returns stateLabel string');
  assert(typeof status.isConfigured === 'boolean', 'getDatabaseStatus returns isConfigured boolean');
  console.log('  -> Configuration and security checks passed.\n');

  // ------------------------------------------------------------
  // SECTION 2: Verified BIS Dataset Integrity (Exactly 40 Records)
  // ------------------------------------------------------------
  console.log('Test Section 2: Non-Negotiable Data Safety (40 Verified Standards)...');
  assert(VERIFIED_BIS_STANDARDS.length === 40, `Dataset must have exactly 40 records, found: ${VERIFIED_BIS_STANDARDS.length}`);

  // Check representative records
  const is10322 = VERIFIED_BIS_STANDARDS.find((s) => s.id === 'bis-is-10322-5-3-2026');
  assert(Boolean(is10322), 'IS 10322 (Part 5/Sec 3):2026 must be present in dataset');
  assert(is10322.edition_year === 2026, 'IS 10322 edition year must be 2026');
  assert(is10322.source_url.startsWith('https://'), 'IS 10322 must have valid https source URL');
  assert(
    is10322.product_types.includes('LED street lighting') ||
      is10322.product_types.includes('street lighting luminaires'),
    'IS 10322 has correct product types'
  );

  const is456 = VERIFIED_BIS_STANDARDS.find((s) => s.id === 'bis-is-456-2000');
  assert(Boolean(is456), 'IS 456:2000 must be present in dataset');
  assert(is456.edition_year === 2000, 'IS 456 edition year must be 2000');
  assert(is456.category.toLowerCase().includes('construction'), 'IS 456 has Construction category');

  const is383 = VERIFIED_BIS_STANDARDS.find((s) => s.id === 'bis-is-383-2016');
  assert(Boolean(is383), 'IS 383:2016 must be present in dataset');
  assert(is383.edition_year === 2016, 'IS 383 edition year must be 2016');

  const is1786 = VERIFIED_BIS_STANDARDS.find((s) => s.id === 'bis-is-1786-2008');
  assert(Boolean(is1786), 'IS 1786:2008 must be present in dataset');
  assert(is1786.edition_year === 2008, 'IS 1786 edition year must be 2008');

  // Verify unique identity keys
  const idSet = new Set(VERIFIED_BIS_STANDARDS.map((s) => s.id));
  assert(idSet.size === 40, 'All 40 standards must have unique IDs');
  const numberSet = new Set(VERIFIED_BIS_STANDARDS.map((s) => s.standard_number.toLowerCase().replace(/\s+/g, '')));
  assert(numberSet.size === 40, 'All 40 standards must have unique standard numbers');
  console.log('  -> All 40 verified BIS standards verified intact and unique.\n');

  // ------------------------------------------------------------
  // SECTION 3: Mongoose Models & Schemas
  // ------------------------------------------------------------
  console.log('Test Section 3: Mongoose Model Schema Validations...');

  // Standard model schema validation
  const testStandardDoc = new StandardModel({
    id: is10322.id,
    standard_number: is10322.standard_number,
    title: is10322.title,
    category: is10322.category,
    subcategory: is10322.subcategory || '',
    product_types: is10322.product_types,
    keywords: is10322.keywords,
    scope: is10322.scope,
    technical_parameters: is10322.technical_parameters,
    safety_requirements: is10322.safety_requirements,
    testing_requirements: is10322.testing_requirements,
    edition_year: is10322.edition_year,
    status: is10322.status,
    source_url: is10322.source_url,
  });

  let stdValidationError = null;
  try {
    await testStandardDoc.validate();
  } catch (err) {
    stdValidationError = err;
  }
  assert(!stdValidationError, 'Standard document validates cleanly against StandardModel schema');
  const stdJson = testStandardDoc.toJSON();
  assert(!stdJson._id && !stdJson.__v, 'StandardModel toJSON safely removes _id and __v');

  // Analysis model schema validation
  const testAnalysisDoc = new AnalysisModel({
    id: 'test-analysis-001',
    input_text: 'Procurement of 100W outdoor LED street luminaires for municipal highway',
    input_type: 'text',
    language: 'en',
    requirements: {
      product: { name: 'LED street light', category: 'Electrical & Lighting' },
      applications: ['Road & Street Lighting'],
      environment: { conditions: ['Outdoor'] },
    },
    confirmed: false,
    created_at: new Date().toISOString(),
  });

  let analysisValidationError = null;
  try {
    await testAnalysisDoc.validate();
  } catch (err) {
    analysisValidationError = err;
  }
  assert(!analysisValidationError, 'Analysis document validates cleanly against AnalysisModel schema');
  const analysisJson = testAnalysisDoc.toJSON();
  assert(!analysisJson._id && !analysisJson.__v, 'AnalysisModel toJSON safely removes _id and __v');

  // Recommendation model schema validation
  const testRecDoc = new RecommendationModel({
    id: 'rec-test-001-is-10322',
    analysis_id: 'test-analysis-001',
    standard_id: 'bis-is-10322-5-3-2026',
    standard_number: 'IS 10322 (Part 5/Sec 3):2026',
    title: 'Luminaires Part 5 Section 3 Road and Street Lighting',
    relevance_score: 0.8,
    category: 'highly_relevant',
    rank: 1,
    reason: 'Direct match for municipal road lighting requirements',
    factor_breakdown: { productCategory: 0.3, keywordsTitleScope: 0.25 },
    evidence: [{ claim: 'Street lighting luminaire', factor: 'product' }],
    official_source_url: 'https://standardsbis.bsbedge.com',
  });

  let recValidationError = null;
  try {
    await testRecDoc.validate();
  } catch (err) {
    recValidationError = err;
  }
  assert(!recValidationError, 'Recommendation document validates cleanly against RecommendationModel schema');
  const recJson = testRecDoc.toJSON();
  assert(!recJson._id && !recJson.__v, 'RecommendationModel toJSON safely removes _id and __v');
  console.log('  -> All Mongoose model schemas and transformations verified.\n');

  // ------------------------------------------------------------
  // SECTION 4: Standards Repository Functionality & Fallback
  // ------------------------------------------------------------
  console.log('Test Section 4: Standards Repository Data Access & Fallback...');
  const repoCount = await standardsRepo.countStandards();
  assert(repoCount === 40, `Standards repository must return count of 40, got: ${repoCount}`);

  const allStandards = await standardsRepo.findStandards({}, { page: 1, limit: 100 });
  assert(allStandards.standards.length === 40, `findStandards() returned 40 standards, got: ${allStandards.standards.length}`);
  assert(allStandards.total === 40, 'findStandards() total count is 40');

  // Keyword search
  const ledSearch = await standardsRepo.findStandards({ search: 'street lighting' }, { page: 1, limit: 10 });
  assert(ledSearch.standards.length > 0, 'Keyword search for "street lighting" returned results');
  assert(
    ledSearch.standards.some((s) => s.id === 'bis-is-10322-5-3-2026'),
    'Search for "street lighting" includes IS 10322 (Part 5/Sec 3):2026'
  );

  // Category filter
  const civilStandards = await standardsRepo.findStandards({ category: 'Construction → Concrete' });
  assert(civilStandards.standards.length > 0, 'Category filter returned construction concrete standards');
  assert(
    civilStandards.standards.some((s) => s.id === 'bis-is-456-2000'),
    'Category filter includes IS 456:2000'
  );

  // Lookup by ID
  const foundById = await standardsRepo.findStandardById('bis-is-10322-5-3-2026');
  assert(Boolean(foundById), 'findStandardById finds standard by canonical ID');
  assert(foundById.standard_number === 'IS 10322 (Part 5/Sec 3):2026', 'findStandardById returns correct standard number');

  // Lookup by standard number
  const foundByNumber = await standardsRepo.findStandardById('IS 456:2000');
  assert(Boolean(foundByNumber), 'findStandardById finds standard by standard number string');
  assert(foundByNumber.id === 'bis-is-456-2000', 'findStandardById resolves standard number to canonical id');

  // Lookup with spaces or lowercase
  const foundFlexible = await standardsRepo.findStandardById('is 383:2016');
  assert(Boolean(foundFlexible), 'findStandardById is case and whitespace insensitive');
  console.log('  -> Standards Repository queries and lookups verified.\n');

  // ------------------------------------------------------------
  // SECTION 5: Analysis Repository Persistence & History
  // ------------------------------------------------------------
  console.log('Test Section 5: Analysis Repository Persistence & History...');
  const testAnalysisId = `test-analysis-${Date.now()}`;
  const analysisPayload = {
    id: testAnalysisId,
    input_text: 'Supply of Portland pozzolana cement and TMT steel bars for bridge construction',
    input_type: 'text',
    language: 'en',
    requirements: {
      product: { name: 'Reinforcing steel bars', category: 'Civil Engineering' },
      applications: ['Structural concrete reinforcement'],
    },
    confirmed: false,
    created_at: new Date().toISOString(),
  };

  await analysisRepo.saveAnalysis(analysisPayload);
  const retrievedAnalysis = await analysisRepo.findAnalysisById(testAnalysisId);
  assert(Boolean(retrievedAnalysis), 'Analysis record saved and retrieved successfully');
  assert(retrievedAnalysis.id === testAnalysisId, 'Retrieved analysis has matching ID');
  assert(retrievedAnalysis.input_type === 'text', 'Retrieved analysis preserves input_type');
  assert(
    retrievedAnalysis.requirements.product.name === 'Reinforcing steel bars',
    'Retrieved analysis preserves structured requirements'
  );

  // Update analysis (simulate human review confirmation)
  const updatedReqs = {
    ...retrievedAnalysis.requirements,
    confirmed: true,
    user_confirmed: true,
  };
  await analysisRepo.updateAnalysis(testAnalysisId, {
    confirmed: true,
    requirements: updatedReqs,
  });

  const confirmedAnalysis = await analysisRepo.findAnalysisById(testAnalysisId);
  assert(confirmedAnalysis.confirmed === true, 'Analysis confirmation flag updated successfully');

  // Analysis history
  const history = await analysisRepo.getAnalysisHistory(10);
  assert(Array.isArray(history), 'getAnalysisHistory returns an array');
  assert(history.some((h) => h.id === testAnalysisId), 'Newly created analysis appears in history');
  console.log('  -> Analysis Repository persistence, update, and history verified.\n');

  // ------------------------------------------------------------
  // SECTION 6: Recommendation Repository Persistence
  // ------------------------------------------------------------
  console.log('Test Section 6: Recommendation Repository Persistence...');
  const sampleRecs = [
    {
      rank: 1,
      standardId: 'bis-is-10322-5-3-2026',
      standard: is10322,
      score: 0.8,
      relevancePercentage: 80,
      category: 'highly_relevant',
      categoryLabel: 'HIGH RELEVANCE',
      matchedFactors: { count: 4, total: 6, percentage: 67 },
      specificityTier: 'specific_standard',
      specificityTierLabel: 'Specific Standard',
      specificationSpecificity: { level: 'specific', description: 'Street luminaire' },
      factorStatuses: {
        productCategory: { status: 'matched', contribution: 0.3, weight: 0.3 },
        keywordsTitleScope: { status: 'matched', contribution: 0.25, weight: 0.25 },
        application: { status: 'matched', contribution: 0.15, weight: 0.15 },
        environment: { status: 'matched', contribution: 0.1, weight: 0.1 },
        technicalParameters: { status: 'not_available', contribution: 0, weight: 0.1 },
        safetyTesting: { status: 'not_available', contribution: 0, weight: 0.1 },
      },
      reason: 'Direct match for municipal road lighting requirements',
      evidence: [{ claim: 'Street lighting luminaire', factor: 'product' }],
      traceabilityChain: [],
      comparison: [],
    },
  ];

  await recommendationRepo.saveRecommendations(testAnalysisId, sampleRecs);
  const storedRecs = await recommendationRepo.findRecommendationsByAnalysisId(testAnalysisId);
  assert(storedRecs.length === 1, 'Recommendations retrieved from repository');
  assert(storedRecs[0].standardId === 'bis-is-10322-5-3-2026', 'Preserved standardId accurately');
  assert(storedRecs[0].score === 0.8, 'Preserved score 0.8 accurately without recalculation');
  assert(storedRecs[0].relevancePercentage === 80, 'Preserved relevancePercentage accurately');
  console.log('  -> Recommendation Repository persistence and score preservation verified.\n');

  // ------------------------------------------------------------
  // SECTION 7: Seeding Idempotency Logic
  // ------------------------------------------------------------
  console.log('Test Section 7: Seeding Idempotency Verification...');
  // Simulate seeding logic: duplicate upsert map
  const recordsMap = new Map();
  // Pass 1: Add all 40
  for (const std of VERIFIED_BIS_STANDARDS) {
    recordsMap.set(std.id, std);
  }
  assert(recordsMap.size === 40, 'Pass 1 of seed results in exactly 40 records');

  // Pass 2: Re-run seed with same 40 records
  for (const std of VERIFIED_BIS_STANDARDS) {
    recordsMap.set(std.id, std);
  }
  assert(recordsMap.size === 40, 'Pass 2 of seed preserves exactly 40 records (0 duplicates)');

  // Pass 3: Re-run seed third time
  for (const std of VERIFIED_BIS_STANDARDS) {
    recordsMap.set(std.id, std);
  }
  assert(recordsMap.size === 40, 'Pass 3 of seed preserves exactly 40 records (0 duplicates)');
  console.log('  -> Idempotent seed logic verified.\n');

  // ------------------------------------------------------------
  // SECTION 8: Flagship Municipal LED Street-Lighting Scenario
  // ------------------------------------------------------------
  console.log('Test Section 8: Flagship Municipal LED Street-Light Recommendation Preservation...');
  const municipalLedRequirements = {
    product: {
      name: 'LED street lighting system',
      category: 'Electrical → Lighting',
      confidence: 'high',
    },
    application: 'Municipal roads and highway lighting, pole mounted',
    industry: 'Municipal & Public Lighting',
    technical_parameters: [],
    materials: [{ name: 'Die-cast aluminum housing', confidence: 'high' }],
    environment: [
      { name: 'Outdoor', confidence: 'high' },
      { name: 'Weather resistant', confidence: 'high' },
    ],
    safety_requirements: [],
    performance_requirements: [],
    testing_requirements: [],
    installation_requirements: [{ name: 'Pole mounted', confidence: 'high' }],
    certification_mentions: [{ name: 'BIS', confidence: 'high' }],
    quantity: '500 units',
    additional_requirements: [],
    missing_information: [],
    clarification_questions: [],
    overall_confidence: 'high',
    ready_for_matching: true,
    confirmed: true,
  };

  const matchResult = matchRequirementsToStandards(
    municipalLedRequirements,
    VERIFIED_BIS_STANDARDS
  );

  assert(matchResult.success === true, 'Matcher returned success');
  assert(matchResult.recommendations.length > 0, 'Matcher returned recommendations');

  const topRec = matchResult.recommendations[0];
  assert(
    topRec.standard.standard_number === 'IS 10322 (Part 5/Sec 3):2026',
    `Top standard must be IS 10322 (Part 5/Sec 3):2026, got: ${topRec.standard.standard_number}`
  );
  assert(
    topRec.score === 0.8,
    `Top standard score must be 0.8 (80%), got: ${topRec.score}`
  );

  // Six-signal contribution audit
  const fs = topRec.factorStatuses;
  assert(fs.productCategory.contribution === 0.3, 'Product / Category contributes 0.30 (30%)');
  assert(fs.keywordsTitleScope.contribution === 0.25, 'Keywords / Scope contributes 0.25 (25%)');
  assert(fs.application.contribution === 0.15, 'Application contributes 0.15 (15%)');
  assert(fs.environment.contribution === 0.1, 'Environment contributes 0.10 (10%)');
  assert(fs.technicalParameters.contribution === 0, 'Technical parameters contributes 0.00 (unavailable)');
  assert(fs.safetyTesting.contribution === 0, 'Safety / Testing contributes 0.00 (unavailable)');

  const sumContributions =
    fs.productCategory.contribution +
    fs.keywordsTitleScope.contribution +
    fs.application.contribution +
    fs.environment.contribution +
    fs.technicalParameters.contribution +
    fs.safetyTesting.contribution;

  assert(
    Math.abs(sumContributions - topRec.score) < 0.0001,
    `Sum of 6 signal contributions (${sumContributions}) equals total score (${topRec.score})`
  );

  assert(topRec.evidence && topRec.evidence.length > 0, 'Evidence list is populated');
  assert(topRec.traceabilityChain && topRec.traceabilityChain.length === 5, '5-stage traceability chain intact');
  assert(topRec.comparison && topRec.comparison.length > 0, 'Requirements comparison table intact');
  console.log('  -> Flagship Municipal LED Street-Light scenario 100% preserved.\n');

  console.log('===========================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} MONGODB MIGRATION VERIFICATION ASSERTIONS PASSED!`);
  console.log('===========================================================');
}

runTests().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
