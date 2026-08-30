import { Schema, model, Document } from "mongoose";

export type FlagEntity = "Career" | "Exam" | "College" | "Scholarship" | "Outcome" | "Roadmap";

export interface IFlag extends Document {
  entity: FlagEntity;
  entityId: string; // slug or _id string
  field?: string;
  note: string;
  reporter?: string;
  status: "open" | "reviewed" | "resolved";
  reportedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const flagSchema = new Schema<IFlag>(
  {
    entity: {
      type: String,
      enum: ["Career", "Exam", "College", "Scholarship", "Outcome", "Roadmap"],
      required: true,
    },
    entityId: { type: String, required: true },
    field: { type: String },
    note: { type: String, required: true },
    reporter: { type: String },
    status: { type: String, enum: ["open", "reviewed", "resolved"], default: "open" },
    reportedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Flag = model<IFlag>("Flag", flagSchema);
