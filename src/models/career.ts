import { Schema, model, Document, Types } from "mongoose";

export type Stream = "Science" | "Management" | "Arts" | "Law" | "Other";
export type SubjectCombo = "Sci+Math" | "Sci+Bio" | "Either" | "Any";
export type Confidence = "cited" | "estimate";

export interface ISalary {
  rangeLow: number;
  rangeHigh: number;
  currency: string; // NPR
  period: string; // "month" | "year"
  confidence: Confidence;
  source?: string;
}

export interface IAbroadVsNepal {
  nepalCost: string;
  abroadCostEst: string;
  roiNepal: string;
  roiAbroad: string;
  riskNotes: string;
}

export interface ICareer extends Document {
  slug: string;
  titleEn: string;
  titleNp?: string;
  stream: Stream;
  subjectCombo: SubjectCombo;
  minGpa?: number; // NEB 0-4
  minMarksPct?: number; // old grading
  entranceExams: string[]; // Exam.slug
  educationPath: string[];
  furtherStudy: string[];
  skills: string[];
  abroadVsNepal: IAbroadVsNepal;
  salaryNp?: ISalary;
  popular?: boolean;
  sourceUrls: string[];
  verifiedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const salarySchema = new Schema<ISalary>(
  {
    rangeLow: { type: Number, required: true },
    rangeHigh: { type: Number, required: true },
    currency: { type: String, default: "NPR" },
    period: { type: String, default: "month" },
    confidence: { type: String, enum: ["cited", "estimate"], default: "estimate" },
    source: { type: String },
  },
  { _id: false }
);

const abroadSchema = new Schema<IAbroadVsNepal>(
  {
    nepalCost: { type: String, required: true },
    abroadCostEst: { type: String, required: true },
    roiNepal: { type: String, required: true },
    roiAbroad: { type: String, required: true },
    riskNotes: { type: String, required: true },
  },
  { _id: false }
);

const careerSchema = new Schema<ICareer>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    titleEn: { type: String, required: true },
    titleNp: { type: String },
    stream: { type: String, enum: ["Science", "Management", "Arts", "Law", "Other"], default: "Science", index: true },
    subjectCombo: { type: String, enum: ["Sci+Math", "Sci+Bio", "Either", "Any"], default: "Either", index: true },
    minGpa: { type: Number, min: 0, max: 4 },
    minMarksPct: { type: Number, min: 0, max: 100 },
    entranceExams: { type: [String], default: [] },
    educationPath: { type: [String], default: [] },
    furtherStudy: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    abroadVsNepal: { type: abroadSchema, required: true },
    salaryNp: { type: salarySchema },
    popular: { type: Boolean, default: false, index: true },
    sourceUrls: { type: [String], required: true },
    verifiedDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Career = model<ICareer>("Career", careerSchema);
