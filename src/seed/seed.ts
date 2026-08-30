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
  const files = ["seed.json", "seed2.json"];
  const merged: SeedFile = {
    exams: [],
    careers: [],
    colleges: [],
    scholarships: [],
    outcomes: [],
    roadmaps: [],
  };
  for (const f of files) {
    const file = path.join(__dirname, "data", f);
    if (!fs.existsSync(file)) continue;
    const part = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<SeedFile>;
    merged.exams.push(...(part.exams ?? []));
    merged.careers.push(...(part.careers ?? []));
    merged.colleges.push(...(part.colleges ?? []));
    merged.scholarships.push(...(part.scholarships ?? []));
    merged.outcomes.push(...(part.outcomes ?? []));
    merged.roadmaps.push(...(part.roadmaps ?? []));
  }

  const counts = {
    exams: await upsertMany(Exam, merged.exams, "slug"),
    careers: await upsertMany(Career, merged.careers, "slug"),
    colleges: await upsertMany(College, merged.colleges, "slug"),
    scholarships: await upsertMany(Scholarship, merged.scholarships, "slug"),
    outcomes: await upsertMany(Outcome, merged.outcomes, "careerSlug"),
    roadmaps: await upsertMany(Roadmap, merged.roadmaps, "careerSlug"),
  };

  console.log("Seed complete:", counts);
  await disconnectDB();
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDB();
  process.exit(1);
});
