// ============================================================
// ISutra: Phase C — Verified BIS Knowledge Base & Data Quality
// Dataset Integrity, Quality Auditing & Domain Coverage Suite
// ============================================================

import { VERIFIED_BIS_STANDARDS } from './dist/database/verifiedStandards.js';
import { matchRequirementsToStandards } from './dist/services/standardsMatcher.js';

console.log('===========================================================');
console.log('🔬 ISUTRA PHASE C — VERIFIED BIS KNOWLEDGE BASE & DATA QUALITY');
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

// ------------------------------------------------------------
// TEST 1: Dataset is Non-Empty
// ------------------------------------------------------------
console.log('Test 1: Dataset is non-empty...');
assert(Array.isArray(VERIFIED_BIS_STANDARDS), 'VERIFIED_BIS_STANDARDS must be an array');
assert(VERIFIED_BIS_STANDARDS.length > 0, `Dataset must contain records, found ${VERIFIED_BIS_STANDARDS.length}`);
console.log(`  -> Found ${VERIFIED_BIS_STANDARDS.length} verified records.\n`);

// ------------------------------------------------------------
// TEST 2: Every Standard Has a Unique ID
// ------------------------------------------------------------
console.log('Test 2: Every standard has a unique ID...');
const seenIds = new Set();
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(Boolean(std.id && typeof std.id === 'string' && std.id.trim().length > 0), `Standard must have a valid non-empty ID: ${std.standard_number}`);
  assert(!seenIds.has(std.id), `Standard ID must be globally unique, duplicate found: "${std.id}"`);
  assert(std.id.startsWith('bis-'), `Standard ID must follow canonical prefix convention "bis-", got: "${std.id}"`);
  seenIds.add(std.id);
}
console.log(`  -> All ${seenIds.size} standard IDs are unique and canonically formatted.\n`);

// ------------------------------------------------------------
// TEST 3: Every Standard Has a Unique Standard Number
// ------------------------------------------------------------
console.log('Test 3: Every standard has a unique standard number...');
const seenStdNums = new Set();
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(Boolean(std.standard_number && typeof std.standard_number === 'string' && std.standard_number.trim().length > 0), `Standard must have non-empty standard_number: ${std.id}`);
  assert(std.standard_number.startsWith('IS '), `Standard number must start with "IS ", got: "${std.standard_number}"`);
  assert(!seenStdNums.has(std.standard_number), `Standard number must be unique, duplicate found: "${std.standard_number}"`);
  seenStdNums.add(std.standard_number);
}
console.log(`  -> All ${seenStdNums.size} standard numbers are unique.\n`);

// ------------------------------------------------------------
// TEST 4: Every Standard Has a Title
// ------------------------------------------------------------
console.log('Test 4: Every standard has a non-empty descriptive title...');
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(Boolean(std.title && typeof std.title === 'string' && std.title.trim().length >= 5), `Standard ${std.standard_number} must have a title with at least 5 characters`);
}
console.log('  -> All standards have valid titles.\n');

// ------------------------------------------------------------
// TEST 5: Every Standard Has Category and Subcategory
// ------------------------------------------------------------
console.log('Test 5: Every standard has category and subcategory...');
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(Boolean(std.category && std.category.includes('→')), `Standard ${std.standard_number} must have hierarchical category with "→", got: "${std.category}"`);
  assert(Boolean(std.subcategory && std.subcategory.trim().length > 0), `Standard ${std.standard_number} must have non-empty subcategory`);
}
console.log('  -> All categories and subcategories properly structured.\n');

// ------------------------------------------------------------
// TEST 6: Every Standard Has Product Types
// ------------------------------------------------------------
console.log('Test 6: Every standard has product types...');
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(Array.isArray(std.product_types) && std.product_types.length > 0, `Standard ${std.standard_number} must have at least one product type`);
  for (const pt of std.product_types) {
    assert(typeof pt === 'string' && pt.trim().length > 0, `Product type in ${std.standard_number} must be non-empty string`);
  }
}
console.log('  -> All standards have non-empty product_types arrays.\n');

// ------------------------------------------------------------
// TEST 7: Every Standard Has Keywords
// ------------------------------------------------------------
console.log('Test 7: Every standard has keywords...');
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(Array.isArray(std.keywords) && std.keywords.length > 0, `Standard ${std.standard_number} must have at least one keyword`);
  for (const kw of std.keywords) {
    assert(typeof kw === 'string' && kw.trim().length > 0, `Keyword in ${std.standard_number} must be non-empty string`);
  }
}
console.log('  -> All standards have non-empty keywords arrays.\n');

// ------------------------------------------------------------
// TEST 8: Every Standard Has Scope
// ------------------------------------------------------------
console.log('Test 8: Every standard has scope...');
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(Boolean(std.scope && typeof std.scope === 'string' && std.scope.trim().length >= 10), `Standard ${std.standard_number} must have scope with >= 10 characters`);
}
console.log('  -> All standards have valid scopes.\n');

// ------------------------------------------------------------
// TEST 9: BIS Provenance
// ------------------------------------------------------------
console.log('Test 9: Every record claiming BIS provenance has BIS source organization...');
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(std.source_organization === 'Bureau of Indian Standards', `Standard ${std.standard_number} must specify "Bureau of Indian Standards", got: "${std.source_organization}"`);
}
console.log('  -> All records verified with "Bureau of Indian Standards" provenance.\n');

// ------------------------------------------------------------
// TEST 10: Source URLs Are Valid HTTPS URLs
// ------------------------------------------------------------
console.log('Test 10: Source URLs are valid HTTPS URLs...');
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(Boolean(std.source_url && typeof std.source_url === 'string' && std.source_url.startsWith('https://')), `Standard ${std.standard_number} must have valid HTTPS source URL, got: "${std.source_url}"`);
  assert(std.source_url.includes('bis.gov.in'), `Standard ${std.standard_number} source URL must point to bis.gov.in domain, got: "${std.source_url}"`);
}
console.log('  -> All source URLs are valid HTTPS bis.gov.in links.\n');

// ------------------------------------------------------------
// TEST 11: Edition Years Are Reasonable Four-Digit Years
// ------------------------------------------------------------
console.log('Test 11: Edition years are reasonable four-digit years...');
for (const std of VERIFIED_BIS_STANDARDS) {
  assert(typeof std.edition_year === 'number' && Number.isInteger(std.edition_year), `Standard ${std.standard_number} edition_year must be an integer, got: ${std.edition_year}`);
  assert(std.edition_year >= 1950 && std.edition_year <= 2030, `Standard ${std.standard_number} edition_year must be between 1950 and 2030, got: ${std.edition_year}`);
}
console.log('  -> All edition years are valid calendar years.\n');

// ------------------------------------------------------------
// TEST 12: No Self-Referencing Related Standards
// ------------------------------------------------------------
console.log('Test 12: No standard references itself as a related standard...');
for (const std of VERIFIED_BIS_STANDARDS) {
  if (!std.related_standards) continue;
  const stdClean = std.standard_number.toLowerCase().replace(/:\d{4}/, '').replace(/\s+/g, ' ').trim();
  for (const rel of std.related_standards) {
    const relClean = rel.toLowerCase().replace(/:\d{4}/, '').replace(/\s+/g, ' ').trim();
    assert(stdClean !== relClean, `Standard ${std.standard_number} must not self-reference in related_standards: "${rel}"`);
  }
}
console.log('  -> Zero self-referencing related standards detected.\n');

// ------------------------------------------------------------
// TEST 13: No Duplicate Keywords
// ------------------------------------------------------------
console.log('Test 13: No duplicate keywords within any single record...');
for (const std of VERIFIED_BIS_STANDARDS) {
  const seenKws = new Set();
  for (const kw of std.keywords) {
    const norm = kw.toLowerCase().trim();
    assert(!seenKws.has(norm), `Standard ${std.standard_number} has duplicate keyword: "${kw}"`);
    seenKws.add(norm);
  }
}
console.log('  -> Zero duplicate keywords found across all records.\n');

// ------------------------------------------------------------
// TEST 14: No Duplicate Related Standards
// ------------------------------------------------------------
console.log('Test 14: No duplicate related standards within any single record...');
for (const std of VERIFIED_BIS_STANDARDS) {
  if (!std.related_standards) continue;
  const seenRels = new Set();
  for (const rel of std.related_standards) {
    const norm = rel.toLowerCase().trim();
    assert(!seenRels.has(norm), `Standard ${std.standard_number} has duplicate related standard: "${rel}"`);
    seenRels.add(norm);
  }
}
console.log('  -> Zero duplicate related standards found across all records.\n');

// ------------------------------------------------------------
// TEST 15: Dataset Count Matches Exported Array
// ------------------------------------------------------------
console.log('Test 15: Dataset count matches exported array length...');
assert(VERIFIED_BIS_STANDARDS.length === 40, `Expected exactly 40 standards, got ${VERIFIED_BIS_STANDARDS.length}`);
console.log(`  -> Confirmed exact count of ${VERIFIED_BIS_STANDARDS.length} verified standards.\n`);

// ------------------------------------------------------------
// TEST 16: Matcher Integration Across All Supported Domains
// ------------------------------------------------------------
console.log('Test 16: Matcher consumption across all verified domains...');
const representativeCases = [
  {
    domain: 'Lighting',
    req: {
      product: { name: 'LED street lighting luminaire', category: 'Electrical → Lighting', confidence: 'high' },
      application: 'Road and street lighting',
      environment: [{ name: 'Outdoor', confidence: 'high' }],
      ready_for_matching: true,
      confirmed: true,
    },
    expectedTopSubstr: '10322 (Part 5/Sec 3)',
  },
  {
    domain: 'Cables',
    req: {
      product: { name: 'PVC insulated electric cables', category: 'Electrical → Cables & Wires', confidence: 'high' },
      application: 'Industrial power distribution',
      ready_for_matching: true,
      confirmed: true,
    },
    expectedCategory: 'Electrical → Cables & Wires',
  },
  {
    domain: 'Concrete',
    req: {
      product: { name: 'Plain and reinforced concrete structural elements', category: 'Construction → Concrete', confidence: 'high' },
      application: 'General building construction',
      ready_for_matching: true,
      confirmed: true,
    },
    expectedTopSubstr: '456:2000',
  },
  {
    domain: 'Steel Reinforcement',
    req: {
      product: { name: 'High strength deformed steel bars and wires', category: 'Construction → Reinforcement Steel', confidence: 'high' },
      application: 'Concrete reinforcement',
      ready_for_matching: true,
      confirmed: true,
    },
    expectedTopSubstr: '1786:2008',
  },
  {
    domain: 'PPE',
    req: {
      product: { name: 'Safety footwear for industrial protection', category: 'Safety → Personal Protective Equipment', confidence: 'high' },
      application: 'Workplace personal protection',
      ready_for_matching: true,
      confirmed: true,
    },
    expectedTopSubstr: '15298',
  },
];

for (const tc of representativeCases) {
  const result = matchRequirementsToStandards(tc.req, VERIFIED_BIS_STANDARDS);
  assert(result.success === true, `Matching must succeed for ${tc.domain}`);
  assert(result.recommendations.length > 0, `Must produce recommendations for ${tc.domain}`);
  const top = result.recommendations[0];
  if (tc.expectedTopSubstr) {
    assert(
      top.standard.standard_number.includes(tc.expectedTopSubstr),
      `Expected top standard for ${tc.domain} to contain "${tc.expectedTopSubstr}", got "${top.standard.standard_number}"`
    );
  }
  if (tc.expectedCategory) {
    assert(
      top.standard.category === tc.expectedCategory,
      `Expected top standard category for ${tc.domain} to be "${tc.expectedCategory}", got "${top.standard.category}"`
    );
  }
  assert(top.score > 0, `Top standard for ${tc.domain} must have positive score`);
  assert(Boolean(top.reason && top.reason.length > 0), `Top standard for ${tc.domain} must have explainable reason`);
  console.log(`  ✓ Domain "${tc.domain}" matched top standard: ${top.standard.standard_number} (Score: ${top.score})`);
}
console.log('  -> Matcher successfully evaluated all representative domains.\n');

console.log('===========================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE C TEST ASSERTIONS PASSED!`);
console.log('===========================================================');
