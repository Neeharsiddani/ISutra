// ============================================================
// ISutra — Idempotent MongoDB Seeding Script for Verified BIS Standards
// Syncs verified reference dataset (verifiedStandards.ts) into MongoDB
// Idempotent: Can be run multiple times safely without producing duplicates.
// Guarantees exactly 40 verified BIS reference records.
// ============================================================

import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase, disconnectFromDatabase, getDatabaseStatus } from '../config/database';
import { VERIFIED_BIS_STANDARDS } from './verifiedStandards';
import { upsertStandards, countStandards } from '../repositories/standardsRepository';
import { StandardModel } from '../models/Standard';

export interface SeedResult {
  success: boolean;
  totalSourceRecords: number;
  insertedCount: number;
  matchedCount: number;
  modifiedCount: number;
  finalCollectionCount: number;
  message: string;
}

export async function seedVerifiedStandards(): Promise<SeedResult> {
  console.log('===========================================================');
  console.log('🌱 ISUTRA: VERIFIED BIS STANDARDS MONGODB SEEDING');
  console.log('===========================================================');

  const sourceCount = VERIFIED_BIS_STANDARDS.length;
  console.log(`📋 Source Dataset: ${sourceCount} verified reference standards`);

  if (sourceCount !== 40) {
    throw new Error(`Integrity Check Failed: Expected 40 verified standards, found ${sourceCount}.`);
  }

  // 1. Connect to MongoDB
  const connected = await connectToDatabase();
  const status = getDatabaseStatus();

  if (!connected || !status.isConnected) {
    const errorMsg =
      'MongoDB is not connected. Please ensure MONGODB_URI is configured and the database is accessible.';
    console.warn(`⚠️  ${errorMsg}`);
    return {
      success: false,
      totalSourceRecords: sourceCount,
      insertedCount: 0,
      matchedCount: 0,
      modifiedCount: 0,
      finalCollectionCount: 0,
      message: errorMsg,
    };
  }

  // 2. Validate all records before insertion
  for (const std of VERIFIED_BIS_STANDARDS) {
    if (!std.id || !std.standard_number || !std.title || !std.source_url) {
      throw new Error(`Data validation failed for record: ${JSON.stringify(std.id)}`);
    }
  }

  // 3. Perform idempotent bulk upsert
  console.log(`🔄 Upserting ${sourceCount} verified standards into 'standards' collection...`);
  const upsertResult = await upsertStandards(VERIFIED_BIS_STANDARDS);

  // 4. Verify final collection count
  const finalCount = await StandardModel.countDocuments();
  console.log(`📊 Upsert Result:`);
  console.log(`   - Inserted (new): ${upsertResult.insertedCount}`);
  console.log(`   - Matched (existing): ${upsertResult.matchedCount}`);
  console.log(`   - Modified: ${upsertResult.modifiedCount}`);
  console.log(`   - Final Collection Count: ${finalCount}`);

  if (finalCount !== 40) {
    console.warn(`⚠️  Warning: Final count in collection is ${finalCount} (expected 40).`);
  } else {
    console.log(`✅ Verified: Exactly 40 BIS standards in MongoDB.`);
  }

  return {
    success: true,
    totalSourceRecords: sourceCount,
    insertedCount: upsertResult.insertedCount,
    matchedCount: upsertResult.matchedCount,
    modifiedCount: upsertResult.modifiedCount,
    finalCollectionCount: finalCount,
    message: `Seeded ${sourceCount} verified standards successfully. Collection count: ${finalCount}.`,
  };
}

// Execute directly if run via CLI
if (require.main === module || process.argv[1]?.includes('seedMongo')) {
  seedVerifiedStandards()
    .then(async (res) => {
      console.log('Result:', res.message);
      await disconnectFromDatabase();
      process.exit(res.success ? 0 : 1);
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await disconnectFromDatabase();
      process.exit(1);
    });
}
