import { Schema, model, Document } from "mongoose";

import { Confidence } from "./career";

export interface IOutcome extends Document {
  careerSlug: string; // Career.slug
  salaryNp: {
    rangeLow: number;
    rangeHigh: number;
    confidence: Confidence;
    sampleSize?: number;
  };
  notes?: string;
  source: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const outcomeSchema = new Schema<IOutcome>(
  {
    careerSlug: { type: String, required: true, index: true },
    salaryNp: {
      rangeLow: { type: Number, required: true },
      rangeHigh: { type: Number, required: true },
      confidence: { type: String, enum: ["cited", "estimate"], default: "estimate" },
      sampleSize: Number,
    },
    notes: { type: String },
    source: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Outcome = model<IOutcome>("Outcome", outcomeSchema);
