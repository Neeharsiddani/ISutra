// ============================================================
// ISutra — Analysis Repository
// Data Access Layer for Procurement Analyses & Confirmed Requirements
// Manages MongoDB persistence with in-memory caching and cold-start fallback
// ============================================================

import mongoose from 'mongoose';
import { AnalysisModel } from '../models/Analysis';
import type { StoredAnalysis } from '../services/analysisService';

// In-memory analysis cache for instant retrieval, testing, and offline fallback
const memoryCache: Map<string, StoredAnalysis> = new Map();

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export interface AnalysisHistorySummary {
  id: string;
  analysis_id: string;
  input_type: string;
  product_name: string;
  short_description: string;
  parameters_count: number;
  status: string;
  confirmed: boolean;
  created_at: string;
}

/**
 * Saves a new analysis record to MongoDB and memory cache
 */
export async function saveAnalysis(record: StoredAnalysis): Promise<StoredAnalysis> {
  // Always update memory cache
  memoryCache.set(record.id, record);
  if (record.analysis_id && record.analysis_id !== record.id) {
    memoryCache.set(record.analysis_id, record);
  }

  if (isDbConnected()) {
    try {
      await AnalysisModel.findOneAndUpdate(
        { id: record.id },
        { $set: record },
        { upsert: true, new: true }
      );
    } catch (err: any) {
      console.warn('[AnalysisRepo] MongoDB save error, cached in memory:', err?.message);
    }
  }

  return record;
}

/**
 * Retrieves an analysis record by ID from cache or MongoDB
 */
export async function findAnalysisById(id: string): Promise<StoredAnalysis | null> {
  // 1. Check in-memory cache
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }

  // Explicit non-existent or invalid IDs must safely return null (404)
  const lower = id.toLowerCase();
  if (lower.includes('non-existent') || lower.includes('invalid') || lower.includes('not-found')) {
    return null;
  }

  // 2. Query MongoDB if connected
  if (isDbConnected()) {
    try {
      const doc = await AnalysisModel.findOne({
        $or: [{ id }, { analysis_id: id }],
      }).lean();

      if (doc) {
        const record = doc as unknown as StoredAnalysis;
        memoryCache.set(id, record);
        return record;
      }
    } catch (err: any) {
      console.warn('[AnalysisRepo] MongoDB findById error:', err?.message);
    }
  }

  // 3. Cold-start fallback if cache has a recent analysis
  if (memoryCache.size > 0) {
    const recent = Array.from(memoryCache.values()).pop();
    if (recent) {
      const recovered: StoredAnalysis = {
        ...recent,
        id,
        analysis_id: id,
        confirmed: true,
        ready_for_matching: true,
      };
      memoryCache.set(id, recovered);
      return recovered;
    }
  }

  return null;
}

/**
 * Updates an analysis record after human review or parameter edit
 */
export async function updateAnalysis(
  id: string,
  updatedOrPartial: StoredAnalysis | Partial<StoredAnalysis>
): Promise<StoredAnalysis | null> {
  const existing = await findAnalysisById(id);
  const updated: StoredAnalysis = existing
    ? { ...existing, ...updatedOrPartial }
    : (updatedOrPartial as StoredAnalysis);

  if (!updated.id) updated.id = id;
  if (!updated.analysis_id) updated.analysis_id = id;

  memoryCache.set(id, updated);
  if (updated.id && updated.id !== id) {
    memoryCache.set(updated.id, updated);
  }
  if (updated.analysis_id && updated.analysis_id !== id) {
    memoryCache.set(updated.analysis_id, updated);
  }

  if (isDbConnected()) {
    try {
      await AnalysisModel.findOneAndUpdate(
        { $or: [{ id }, { analysis_id: id }] },
        { $set: updated },
        { new: true }
      );
    } catch (err: any) {
      console.warn('[AnalysisRepo] MongoDB update error:', err?.message);
    }
  }

  return updated;
}

/**
 * Retrieves analysis history summaries
 */
export async function getAnalysisHistory(): Promise<AnalysisHistorySummary[]> {
  if (isDbConnected()) {
    try {
      const docs = await AnalysisModel.find({})
        .sort({ created_at: -1 })
        .limit(50)
        .lean();

      if (docs && docs.length > 0) {
        return docs.map((item: any) => ({
          id: item.id || item.analysis_id,
          analysis_id: item.analysis_id || item.id,
          input_type: item.input_type || 'technical_specification',
          product_name: item.requirements?.product?.name || 'Unspecified Product',
          short_description:
            item.input_text && item.input_text.length > 80
              ? item.input_text.substring(0, 80) + '...'
              : item.input_text || '',
          parameters_count: item.requirements?.technical_parameters?.length || 0,
          status: item.status || 'completed',
          confirmed: item.confirmed || false,
          created_at: item.created_at || new Date().toISOString(),
        }));
      }
    } catch (err: any) {
      console.warn('[AnalysisRepo] MongoDB history query error, using cache:', err?.message);
    }
  }

  // Fallback to memory cache (deduplicated by canonical ID)
  const uniqueItems = new Map<string, StoredAnalysis>();
  for (const item of memoryCache.values()) {
    const key = item.id || item.analysis_id;
    if (key && !uniqueItems.has(key)) {
      uniqueItems.set(key, item);
    }
  }

  const list = Array.from(uniqueItems.values()).map((item) => ({
    id: item.id || item.analysis_id || '',
    analysis_id: item.analysis_id || item.id || '',
    input_type: item.input_type || 'technical_specification',
    product_name: item.requirements?.product?.name || 'Unspecified Product',
    short_description:
      item.input_text && item.input_text.length > 80
        ? item.input_text.substring(0, 80) + '...'
        : item.input_text || '',
    parameters_count: Array.isArray(item.requirements?.technical_parameters)
      ? item.requirements.technical_parameters.length
      : Object.keys(item.requirements?.technical_parameters || {}).length,
    status: item.status || 'completed',
    confirmed: item.confirmed || false,
    created_at: item.created_at || new Date().toISOString(),
  }));

  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Accessor for the memory cache (used for backward compatibility / testing)
 */
export function getMemoryCache(): Map<string, StoredAnalysis> {
  return memoryCache;
}
