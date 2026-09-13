// ============================================================
// ISutra — Phase 2 AI Requirement Extraction Verification Tests
// ============================================================

import { runRequirementExtractionPipeline } from './services/ai/requirementExtractor';

async function runTests() {
  console.log('========================================================');
  console.log('🧪 ISutra Phase 2: Requirement Extraction Verification');
  console.log('========================================================\n');

  // TEST 1
  console.log('--- TEST 1: Outdoor LED Street Lighting ---');
  const t1 = 'Outdoor LED street lighting system, 100W, weather resistant, pole mounted.';
  const r1 = await runRequirementExtractionPipeline(t1, 'product_description');
  console.log('Product:', r1.requirements.product.name);
  console.log('Application:', r1.requirements.application);
  console.log('Parameters:', r1.requirements.technical_parameters.map(p => `${p.parameter}: ${p.value} ${p.unit} [src: ${p.source_text}]`));
  console.log('Environment:', r1.requirements.environment.map(e => e.name));
  console.log('Installation:', r1.requirements.installation_requirements.map(i => i.name));
  console.log('Missing Info:', r1.requirements.missing_information);

  // Assertions for Test 1
  const t1ProductMatches = /LED\s+street\s+lighting\s+system/i.test(r1.requirements.product.name);
  const t1AppMatches = /outdoor/i.test(r1.requirements.application || '');
  const t1PowerMatches = r1.requirements.technical_parameters.some(p => p.parameter === 'Power' && /100W/i.test(p.value));
  const t1EnvMatches = r1.requirements.environment.some(e => /weather\s+resistant/i.test(e.name));
  const t1InstMatches = r1.requirements.installation_requirements.some(i => /pole\s+mounted/i.test(i.name));

  if (t1ProductMatches && t1AppMatches && t1PowerMatches && t1EnvMatches && t1InstMatches) {
    console.log('✅ TEST 1 PASSED\n');
  } else {
    console.error('❌ TEST 1 FAILED', { t1ProductMatches, t1AppMatches, t1PowerMatches, t1EnvMatches, t1InstMatches });
    process.exit(1);
  }

  // TEST 2
  console.log('--- TEST 2: Stainless Steel Water Tanks ---');
  const t2 = 'Procure 500 stainless steel water storage tanks for a government facility.';
  const r2 = await runRequirementExtractionPipeline(t2, 'product_description');
  console.log('Product:', r2.requirements.product.name);
  console.log('Quantity:', r2.requirements.quantity);
  console.log('Materials:', r2.requirements.materials.map(m => m.name));
  console.log('Application:', r2.requirements.application);

  const t2ProductMatches = /water\s+storage\s+tank/i.test(r2.requirements.product.name);
  const t2QtyMatches = r2.requirements.quantity === '500';
  const t2MatMatches = r2.requirements.materials.some(m => /stainless\s+steel/i.test(m.name));
  const t2AppMatches = /government\s+facility/i.test(r2.requirements.application || '');

  if (t2ProductMatches && t2QtyMatches && t2MatMatches && t2AppMatches) {
    console.log('✅ TEST 2 PASSED\n');
  } else {
    console.error('❌ TEST 2 FAILED');
    process.exit(1);
  }

  // TEST 3
  console.log('--- TEST 3: Industrial Electrical Cables ---');
  const t3 = 'Supply industrial electrical cables suitable for high temperature environments.';
  const r3 = await runRequirementExtractionPipeline(t3, 'technical_specification');
  console.log('Product:', r3.requirements.product.name);
  console.log('Environment:', r3.requirements.environment.map(e => e.name));

  const t3ProductMatches = /electrical\s+cables/i.test(r3.requirements.product.name);
  const t3EnvMatches = r3.requirements.environment.some(e => /high\s+temperature/i.test(e.name));

  if (t3ProductMatches && t3EnvMatches) {
    console.log('✅ TEST 3 PASSED\n');
  } else {
    console.error('❌ TEST 3 FAILED');
    process.exit(1);
  }

  // TEST 4: Vague Input with Missing Info & Clarification Questions
  console.log('--- TEST 4: Vague Input ("Need LED street lights.") ---');
  const t4 = 'Need LED street lights.';
  const r4 = await runRequirementExtractionPipeline(t4, 'product_description');
  console.log('Product:', r4.requirements.product.name);
  console.log('Missing Info:', r4.requirements.missing_information);
  console.log('Clarification Questions:', r4.requirements.clarification_questions.map(q => q.question));

  if (r4.requirements.missing_information.length > 0 && r4.requirements.clarification_questions.length > 0) {
    console.log('✅ TEST 4 PASSED (Correctly detects missing info and generates clarification questions)\n');
  } else {
    console.error('❌ TEST 4 FAILED');
    process.exit(1);
  }

  console.log('🎉 ALL BACKEND AI EXTRACTION TESTS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
