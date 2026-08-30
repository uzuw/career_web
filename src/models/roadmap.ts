import { Schema, model, Document } from "mongoose";

export type RoadmapStepType = "study" | "exam" | "apply" | "work";

export interface IRoadmapStep {
  type: RoadmapStepType;
  label: string;
  duration?: string;
  notes?: string;
  source?: string;
}

export interface IRoadmap extends Document {
  careerSlug: string; // Career.slug
  steps: IRoadmapStep[];
  createdAt: Date;
  updatedAt: Date;
}

const stepSchema = new Schema<IRoadmapStep>(
  {
    type: { type: String, enum: ["study", "exam", "apply", "work"], required: true },
    label: { type: String, required: true },
    duration: { type: String },
    notes: { type: String },
    source: { type: String },
  },
  { _id: false }
);

const roadmapSchema = new Schema<IRoadmap>(
  {
    careerSlug: { type: String, required: true, unique: true, index: true },
    steps: { type: [stepSchema], required: true },
  },
  { timestamps: true }
);

export const Roadmap = model<IRoadmap>("Roadmap", roadmapSchema);
