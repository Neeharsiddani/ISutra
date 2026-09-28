// ============================================================
// ISutra — Mongoose Analysis Model
// Collection: analyses
// Persists procurement analyses and human-confirmed requirements
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';
import type { StoredAnalysis } from '../services/analysisService';

export interface AnalysisDocument extends Omit<StoredAnalysis, 'id'>, Document {
  id: string; // custom ID e.g. 'analysis-1790520188911-j2s8v'
}

const AnalysisSchema = new Schema<AnalysisDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    analysis_id: {
      type: String,
      default: function (this: any) {
        return this.id;
      },
      index: true,
    },
    input_type: {
      type: String,
      default: 'technical_specification',
    },
    input_text: {
      type: String,
      required: true,
    },
    file_name: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'completed',
    },
    requirements: {
      type: Schema.Types.Mixed,
      required: true,
    },
    missing_information: {
      type: [String],
      default: [],
    },
    blocking_missing_information: {
      type: [String],
      default: [],
    },
    clarification_questions: {
      type: [String],
      default: [],
    },
    ready_for_matching: {
      type: Boolean,
      default: false,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    provider_used: {
      type: String,
      default: 'rule_based_fallback',
    },
    demo: {
      type: Boolean,
      default: false,
    },
    warning: {
      type: String,
      default: undefined,
    },
    document_provenance: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    input_language: {
      type: String,
      default: 'en',
    },
    language_metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    created_at: {
      type: String,
      default: () => new Date().toISOString(),
      index: true,
    },
  },
  {
    collection: 'analyses',
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

// Indexes
AnalysisSchema.index({ created_at: -1 });

export const AnalysisModel =
  (mongoose.models.Analysis as mongoose.Model<AnalysisDocument>) ||
  mongoose.model<AnalysisDocument>('Analysis', AnalysisSchema);
