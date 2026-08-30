import { Schema, model, Document } from "mongoose";

export type Affiliation = "TU" | "KU" | "PU" | "MU" | "Other";
export type CollegeType = "public" | "private" | "community";

export interface ICollege extends Document {
  name: string;
  slug: string;
  affiliation: Affiliation;
  type: CollegeType;
  lat: number;
  lng: number;
  district: string;
  province: string;
  programs: string[]; // Career.slug
  tuitionRange?: { low: number; high: number; currency: string; period: string };
  entranceRequired?: string; // Exam.slug
  minEligibility?: string;
  seats?: number;
  scholarships: string[]; // Scholarship.slug
  website?: string;
  sourceUrls: string[];
  verifiedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    affiliation: { type: String, enum: ["TU", "KU", "PU", "MU", "Other"], required: true, index: true },
    type: { type: String, enum: ["public", "private", "community"], default: "private" },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    programs: { type: [String], default: [] },
    tuitionRange: {
      low: Number,
      high: Number,
      currency: { type: String, default: "NPR" },
      period: { type: String, default: "total" },
    },
    entranceRequired: { type: String },
    minEligibility: { type: String },
    seats: { type: Number },
    scholarships: { type: [String], default: [] },
    website: { type: String },
    sourceUrls: { type: [String], required: true },
    verifiedDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const College = model<ICollege>("College", collegeSchema);
