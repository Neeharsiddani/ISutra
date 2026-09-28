// ============================================================
// ISutra — Standards Repository
// Data Access Layer for BIS Standards
// Abstracts MongoDB queries with guaranteed fallback to verifiedStandards.ts
// ============================================================

import mongoose from 'mongoose';
import { StandardModel } from '../models/Standard';
import { VERIFIED_BIS_STANDARDS, VerifiedStandard } from '../database/verifiedStandards';

export interface StandardFilter {
  search?: string;
  category?: string;
  subcategory?: string;
  standard_number?: string;
  title?: string;
  status?: string;
  edition_year?: number;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
}

export interface StandardQueryResult {
  standards: VerifiedStandard[];
  total: number;
  page: number;
  limit: number;
  source: 'mongodb' | 'verified_file';
}

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Normalizes a Mongoose document or POJO to VerifiedStandard shape
 */
function toVerifiedStandard(doc: any): VerifiedStandard {
  return {
    id: doc.id,
    standard_number: doc.standard_number,
    title: doc.title,
    category: doc.category,
    subcategory: doc.subcategory || '',
    product_types: doc.product_types || [],
    keywords: doc.keywords || [],
    scope: doc.scope || '',
    technical_parameters: doc.technical_parameters || null,
    safety_requirements: doc.safety_requirements || null,
    performance_requirements: doc.performance_requirements || null,
    testing_requirements: doc.testing_requirements || null,
    related_standards: doc.related_standards || [],
    edition_year: Number(doc.edition_year) || 0,
    status: doc.status || 'Current / Verified',
    source_organization: doc.source_organization || 'Bureau of Indian Standards',
    source_url: doc.source_url,
    last_verified: doc.last_verified || '',
    created_at: doc.created_at || '',
    updated_at: doc.updated_at || '',
  };
}

/**
 * Retrieves standards with filtering and pagination
 */
export async function findStandards(
  filter: StandardFilter = {},
  options: QueryOptions = {}
): Promise<StandardQueryResult> {
  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  if (isDbConnected()) {
    try {
      const mongoQuery: Record<string, any> = {};

      if (filter.category) {
        mongoQuery.category = { $regex: filter.category, $options: 'i' };
      }
      if (filter.subcategory) {
        mongoQuery.subcategory = { $regex: filter.subcategory, $options: 'i' };
      }
      if (filter.status) {
        mongoQuery.status = { $regex: filter.status, $options: 'i' };
      }
      if (filter.edition_year) {
        mongoQuery.edition_year = filter.edition_year;
      }
      if (filter.standard_number) {
        mongoQuery.standard_number = { $regex: filter.standard_number, $options: 'i' };
      }
      if (filter.title) {
        mongoQuery.title = { $regex: filter.title, $options: 'i' };
      }

      if (filter.search) {
        const s = filter.search.trim();
        mongoQuery.$or = [
          { standard_number: { $regex: s, $options: 'i' } },
          { title: { $regex: s, $options: 'i' } },
          { scope: { $regex: s, $options: 'i' } },
          { category: { $regex: s, $options: 'i' } },
          { subcategory: { $regex: s, $options: 'i' } },
          { keywords: { $regex: s, $options: 'i' } },
        ];
      }

      const [docs, total] = await Promise.all([
        StandardModel.find(mongoQuery).sort({ standard_number: 1 }).skip(skip).limit(limit).lean(),
        StandardModel.countDocuments(mongoQuery),
      ]);

      if (docs && docs.length > 0) {
        return {
          standards: docs.map(toVerifiedStandard),
          total,
          page,
          limit,
          source: 'mongodb',
        };
      }
    } catch (err: any) {
      console.warn('[StandardsRepo] MongoDB query failed, falling back to verifiedStandards.ts:', err?.message);
    }
  }

  // Fallback to verified reference dataset file
  let results = [...VERIFIED_BIS_STANDARDS];

  if (filter.category) {
    const cat = filter.category.toLowerCase();
    results = results.filter((s) => s.category.toLowerCase().includes(cat));
  }
  if (filter.subcategory) {
    const sub = filter.subcategory.toLowerCase();
    results = results.filter((s) => s.subcategory.toLowerCase().includes(sub));
  }
  if (filter.status) {
    const st = filter.status.toLowerCase();
    results = results.filter((s) => s.status.toLowerCase().includes(st));
  }
  if (filter.edition_year) {
    results = results.filter((s) => s.edition_year === filter.edition_year);
  }
  if (filter.standard_number) {
    const num = filter.standard_number.toLowerCase();
    results = results.filter((s) => s.standard_number.toLowerCase().includes(num));
  }
  if (filter.title) {
    const t = filter.title.toLowerCase();
    results = results.filter((s) => s.title.toLowerCase().includes(t));
  }

  if (filter.search) {
    const s = filter.search.trim().toLowerCase();
    results = results.filter((item) => {
      const inNum = item.standard_number.toLowerCase().includes(s);
      const inTitle = item.title.toLowerCase().includes(s);
      const inScope = item.scope.toLowerCase().includes(s);
      const inCat = item.category.toLowerCase().includes(s);
      const inSub = item.subcategory.toLowerCase().includes(s);
      const inKeywords = item.keywords.some((k) => k.toLowerCase().includes(s));
      return inNum || inTitle || inScope || inCat || inSub || inKeywords;
    });
  }

  const total = results.length;
  const paginated = results.slice(skip, skip + limit);

  return {
    standards: paginated,
    total,
    page,
    limit,
    source: 'verified_file',
  };
}

/**
 * Finds a single standard by ID or standard_number
 */
export async function findStandardById(idOrNumber: string): Promise<VerifiedStandard | null> {
  const cleanId = decodeURIComponent(idOrNumber).trim().toLowerCase();
  const cleanNumNoSpace = cleanId.replace(/\s+/g, '');

  if (isDbConnected()) {
    try {
      const doc = await StandardModel.findOne({
        $or: [
          { id: cleanId },
          { standard_number: { $regex: `^${cleanId}$`, $options: 'i' } },
        ],
      }).lean();

      if (doc) {
        return toVerifiedStandard(doc);
      }
    } catch (err: any) {
      console.warn('[StandardsRepo] MongoDB findById error:', err?.message);
    }
  }

  // Fallback to verified dataset file
  const found = VERIFIED_BIS_STANDARDS.find((s) => {
    const sid = s.id.toLowerCase();
    const snum = s.standard_number.toLowerCase();
    const snumClean = snum.replace(/\s+/g, '');
    return sid === cleanId || snum === cleanId || snumClean === cleanNumNoSpace;
  });

  return found || null;
}

/**
 * Count total standards in MongoDB (or fallback)
 */
export async function countStandards(): Promise<number> {
  if (isDbConnected()) {
    try {
      return await StandardModel.countDocuments();
    } catch {
      // Fallback
    }
  }
  return VERIFIED_BIS_STANDARDS.length;
}

/**
 * Idempotently upsert verified standards into MongoDB
 */
export async function upsertStandards(standards: VerifiedStandard[]): Promise<{
  insertedCount: number;
  matchedCount: number;
  modifiedCount: number;
}> {
  if (!isDbConnected()) {
    throw new Error('Cannot seed standards: MongoDB is not connected.');
  }

  const operations = standards.map((std) => ({
    updateOne: {
      filter: { id: std.id },
      update: { $set: std },
      upsert: true,
    },
  }));

  const result = await StandardModel.bulkWrite(operations, { ordered: false });
  return {
    insertedCount: result.upsertedCount || 0,
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
  };
}
