// ============================================================
// ISutra — Recommendations Repository
// Data Access Layer for Recommendation Persistence
// Database stores results from standardsMatcher — never computes scores
// ============================================================

import mongoose from 'mongoose';
import { RecommendationModel } from '../models/Recommendation';
import type { StandardRecommendation } from '../services/standardsMatcher';

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-memory cache for fast lookup and fallback
const recommendationCache: Map<string, StandardRecommendation[]> = new Map();

/**
 * Persists recommendation results for an analysis session into MongoDB
 */
export async function saveRecommendations(
  analysisId: string,
  recommendations: StandardRecommendation[]
): Promise<void> {
  recommendationCache.set(analysisId, recommendations);

  if (isDbConnected()) {
    try {
      const writes = recommendations.map((rec, idx) => {
        const standardId = rec.standardId || rec.standard?.id || `std-${idx}`;
        const docId = `rec-${analysisId}-${standardId}`;
        return {
          updateOne: {
            filter: { id: docId },
            update: {
              $set: {
                id: docId,
                analysis_id: analysisId,
                standard_id: standardId,
                standard_number: rec.standard?.standard_number || '',
                title: rec.standard?.title || '',
                relevance_score: rec.score ?? 0,
                category: rec.category || 'related',
                rank: rec.rank ?? idx + 1,
                reason: rec.reason || '',
                factor_breakdown: (rec.factorStatuses || {}) as Record<string, unknown>,
                evidence: (rec.evidence || []) as unknown as Record<string, unknown>[],
                official_source_url: rec.standard?.source_url,
                full_recommendation: rec as unknown as Record<string, unknown>,
                created_at: new Date().toISOString(),
              },
            },
            upsert: true,
          },
        };
      });

      await RecommendationModel.bulkWrite(writes as any, { ordered: false });
    } catch (err: any) {
      console.warn('[RecommendationRepo] MongoDB save error:', err?.message);
    }
  }
}

/**
 * Retrieves persisted recommendations for an analysis session
 */
export async function findRecommendationsByAnalysisId(
  analysisId: string
): Promise<StandardRecommendation[]> {
  if (recommendationCache.has(analysisId)) {
    return recommendationCache.get(analysisId)!;
  }

  if (isDbConnected()) {
    try {
      const docs = await RecommendationModel.find({ analysis_id: analysisId })
        .sort({ rank: 1 })
        .lean();

      if (docs && docs.length > 0) {
        return docs.map((d: any) => {
          if (d.full_recommendation) {
            return d.full_recommendation as StandardRecommendation;
          }
          return {
            rank: d.rank,
            standardId: d.standard_id,
            standard: {
              id: d.standard_id,
              standard_number: d.standard_number,
              title: d.title,
              source_url: d.official_source_url,
            } as any,
            score: d.relevance_score,
            relevancePercentage: Math.round(d.relevance_score * 100),
            category: d.category,
            reason: d.reason,
            evidence: d.evidence,
          } as unknown as StandardRecommendation;
        });
      }
    } catch (err: any) {
      console.warn('[RecommendationRepo] MongoDB query error:', err?.message);
    }
  }

  return [];
}
