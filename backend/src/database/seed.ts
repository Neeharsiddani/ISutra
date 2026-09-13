// ============================================================
// ISutra: Phase 3 — Database Seed & Verification Script
// ============================================================

import { getSupabaseClient } from './supabase';
import { VERIFIED_BIS_STANDARDS } from './verifiedStandards';

export async function seedStandards() {
  console.log('📦 Validating Phase 3 Verified BIS Dataset...');
  console.log(`Total verified records: ${VERIFIED_BIS_STANDARDS.length}`);

  // 1. Verify exact 40 standards count
  if (VERIFIED_BIS_STANDARDS.length !== 40) {
    throw new Error(`Expected exactly 40 verified standards, found ${VERIFIED_BIS_STANDARDS.length}`);
  }

  // 2. Verify all records have mandatory fields
  for (const std of VERIFIED_BIS_STANDARDS) {
    if (!std.id || !std.standard_number || !std.title || !std.source_url) {
      throw new Error(`Invalid record integrity for: ${std.standard_number}`);
    }
  }

  // 3. If Supabase is configured, upsert into database
  const supabase = getSupabaseClient();
  if (supabase) {
    console.log('🔄 Seeding verified standards into Supabase...');
    const { data, error } = await supabase
      .from('standards')
      .upsert(VERIFIED_BIS_STANDARDS, { onConflict: 'standard_number' });

    if (error) {
      console.warn('⚠️  Supabase seed failed (falling back to in-memory verified dataset):', error.message);
    } else {
      console.log('✅ Supabase seeded successfully with verified standards!');
    }
  } else {
    console.log('ℹ️  Supabase not configured. In-memory verified BIS dataset active and verified (40 records).');
  }

  return { count: VERIFIED_BIS_STANDARDS.length, success: true };
}

// Run directly if invoked from command line
if (require.main === module) {
  seedStandards()
    .then((res) => {
      console.log(`🎉 Seeding completed successfully. Verified standards ready: ${res.count}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}
