// ============================================================
// ISutra — Database Seed & Verification Script
// Seeds 40 verified BIS reference records into MongoDB
// ============================================================

import { seedVerifiedStandards } from './seedMongo';
import { disconnectFromDatabase } from '../config/database';
import { VERIFIED_BIS_STANDARDS } from './verifiedStandards';

export async function seedStandards() {
  const result = await seedVerifiedStandards();
  return { count: result.finalCollectionCount || VERIFIED_BIS_STANDARDS.length, success: result.success };
}

// Run directly if invoked from command line
if (require.main === module || process.argv[1]?.includes('seed')) {
  seedStandards()
    .then(async (res) => {
      console.log(`🎉 Seeding completed. Verified standards count: ${res.count}`);
      await disconnectFromDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding error:', err);
      await disconnectFromDatabase();
      process.exit(1);
    });
}
