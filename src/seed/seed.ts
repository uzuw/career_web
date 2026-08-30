import path from "path";
import fs from "fs";
import { connectDB, disconnectDB } from "../db/connect";
import { Career } from "../models/career";
import { Exam } from "../models/exam";
import { College } from "../models/college";
import { Scholarship } from "../models/scholarship";
import { Outcome } from "../models/outcome";
import { Roadmap } from "../models/roadmap";

interface SeedFile {
  exams: any[];
  careers: any[];
  colleges: any[];
  scholarships: any[];
  outcomes: any[];
  roadmaps: any[];
}

async function upsertMany(model: any, docs: any[], key: string) {
  let n = 0;
  for (const doc of docs) {
    await model.findOneAndUpdate({ [key]: doc[key] }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
    n++;
  }
  return n;
}

async function main() {
  await connectDB();
  const file = path.join(__dirname, "data", "seed.json");
  const data = JSON.parse(fs.readFileSync(file, "utf-8")) as SeedFile;

  const counts = {
    exams: await upsertMany(Exam, data.exams, "slug"),
    careers: await upsertMany(Career, data.careers, "slug"),
    colleges: await upsertMany(College, data.colleges, "slug"),
    scholarships: await upsertMany(Scholarship, data.scholarships, "slug"),
    outcomes: await upsertMany(Outcome, data.outcomes, "careerSlug"),
    roadmaps: await upsertMany(Roadmap, data.roadmaps, "careerSlug"),
  };

  console.log("Seed complete:", counts);
  await disconnectDB();
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDB();
  process.exit(1);
});
