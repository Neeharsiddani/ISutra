// ============================================================
// ISutra — Mongoose Recommendation Model
// Collection: recommendations
// Persists deterministic recommendations scored by standardsMatcher
// Database does NOT calculate scores — only stores output of matcher
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';

export interface RecommendationDocument extends Document {
  id: string;
  analysis_id: string;
  standard_id: string;
  standard_number: string;
  title: string;
  relevance_score: number;
  category: string;
  rank: number;
  reason: string;
  factor_breakdown: Record<string, unknown>;
  evidence: any[];
  official_source_url?: string;
  full_recommendation?: Record<string, unknown>;
  created_at: string;
}

const RecommendationSchema = new Schema<RecommendationDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    analysis_id: {
      type: String,
      required: true,
      index: true,
    },
    standard_id: {
      type: String,
      required: true,
      index: true,
    },
    standard_number: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    relevance_score: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'related',
    },
    rank: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    factor_breakdown: {
      type: Schema.Types.Mixed,
      default: {},
    },
    evidence: {
      type: Schema.Types.Mixed,
      default: [],
    },
    official_source_url: {
      type: String,
      default: undefined,
    },
    full_recommendation: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    created_at: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    collection: 'recommendations',
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

RecommendationSchema.index({ analysis_id: 1, rank: 1 });

export const RecommendationModel =
  (mongoose.models.Recommendation as mongoose.Model<RecommendationDocument>) ||
  mongoose.model<RecommendationDocument>('Recommendation', RecommendationSchema);
