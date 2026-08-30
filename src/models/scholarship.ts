import { Schema, model, Document } from "mongoose";

export interface IScholarship extends Document {
  slug: string;
  name: string;
  eligibility: string;
  amountNpr?: number;
  deadline?: string;
  provider: string;
  sourceUrls: string[];
  verifiedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const scholarshipSchema = new Schema<IScholarship>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    eligibility: { type: String, required: true },
    amountNpr: { type: Number },
    deadline: { type: String },
    provider: { type: String, required: true },
    sourceUrls: { type: [String], required: true },
    verifiedDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Scholarship = model<IScholarship>("Scholarship", scholarshipSchema);
