import { Schema, model, Document } from "mongoose";

export type ExamStream = "Science" | "Management" | "Arts" | "Any";

export interface IExam extends Document {
  slug: string;
  nameEn: string;
  nameNp?: string;
  forCareer: string[]; // Career.slug
  eligibility: string;
  syllabusUrl?: string;
  scheduleMonth: string; // e.g. "Shrawan (Jul-Aug)"
  appFeeNpr: number;
  cutoffPrev?: { range: string; year: string; source: string };
  prepResources: string[];
  officialUrl: string;
  sourceUrls: string[];
  verifiedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true },
    nameNp: { type: String },
    forCareer: { type: [String], default: [] },
    eligibility: { type: String, required: true },
    syllabusUrl: { type: String },
    scheduleMonth: { type: String, required: true },
    appFeeNpr: { type: Number, required: true },
    cutoffPrev: {
      range: String,
      year: String,
      source: String,
    },
    prepResources: { type: [String], default: [] },
    officialUrl: { type: String, required: true },
    sourceUrls: { type: [String], required: true },
    verifiedDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Exam = model<IExam>("Exam", examSchema);
