// ============================================================
// ISutra — Mongoose Standard Model
// Collection: standards
// Maps 1-to-1 to verified BIS reference records
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';
import type { VerifiedStandard } from '../database/verifiedStandards';

export interface StandardDocument extends Omit<VerifiedStandard, 'id'>, Document {
  id: string; // custom string ID e.g. 'bis-is-10322-5-3-2026'
}

const StandardSchema = new Schema<StandardDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    standard_number: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      default: '',
    },
    product_types: {
      type: [String],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
    },
    scope: {
      type: String,
      default: '',
    },
    technical_parameters: {
      type: Schema.Types.Mixed,
      default: null,
    },
    safety_requirements: {
      type: Schema.Types.Mixed,
      default: null,
    },
    performance_requirements: {
      type: Schema.Types.Mixed,
      default: null,
    },
    testing_requirements: {
      type: Schema.Types.Mixed,
      default: null,
    },
    related_standards: {
      type: [String],
      default: [],
    },
    edition_year: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Current / Verified',
    },
    source_organization: {
      type: String,
      default: 'Bureau of Indian Standards',
    },
    source_url: {
      type: String,
      required: true,
    },
    last_verified: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    created_at: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updated_at: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    collection: 'standards',
    timestamps: false, // We preserve authentic verified string timestamps
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

// Indexes for query performance
StandardSchema.index({ standard_number: 1, category: 1 });
StandardSchema.index({ keywords: 1 });

export const StandardModel =
  (mongoose.models.Standard as mongoose.Model<StandardDocument>) ||
  mongoose.model<StandardDocument>('Standard', StandardSchema);
