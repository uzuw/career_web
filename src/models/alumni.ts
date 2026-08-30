import { Schema, model, Document } from "mongoose";

export interface IAlumni extends Document {
  slug: string;            // unique seed key
  careerSlug?: string;   // links to Career
  collegeSlug?: string;  // links to College
  author?: string;       // anonymous handle if public, else "Anonymous"
  snippet: string;       // summarized experience (public, attributed)
  sentiment?: "positive" | "mixed" | "caution";
  sourceUrl: string;     // public source (forum post / article)
  sourceName: string;    // e.g. "Reddit r/Nepal"
  verifiedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const alumniSchema = new Schema<IAlumni>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    careerSlug: { type: String, index: true },
    collegeSlug: { type: String, index: true },
    author: { type: String },
    snippet: { type: String, required: true },
    sentiment: { type: String, enum: ["positive", "mixed", "caution"] },
    sourceUrl: { type: String, required: true },
    sourceName: { type: String, required: true },
    verifiedDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Alumni = model<IAlumni>("Alumni", alumniSchema);
