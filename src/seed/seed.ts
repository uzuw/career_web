import path from "path";
import fs from "fs";
import { connectDB, disconnectDB } from "../db/connect";
import { Career } from "../models/career";
import { Exam } from "../models/exam";
import { College } from "../models/college";
import { Scholarship } from "../models/scholarship";
import { Outcome } from "../models/outcome";
import { Roadmap } from "../models/roadmap";
import { Alumni } from "../models/alumni";

interface SeedFile {
  exams: any[];
  careers: any[];
  colleges: any[];
  scholarships: any[];
  outcomes: any[];
  roadmaps: any[];
  alumni: any[];
}

async function upsertMany(model: any, docs: any[], key: string) {
  let n = 0;
  for (const doc of docs) {
    await model.findOneAndUpdate({ [key]: doc[key] }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
    n++;
  }
  return n;
}

// Colleges merge their `programs` array (addToSet) so supplemental seed files
// can extend existing colleges without re-listing all programs.
async function upsertColleges(docs: any[]) {
  let n = 0;
  for (const doc of docs) {
    const { programs, ...rest } = doc;
    const update: any = { $set: rest };
    if (Array.isArray(programs) && programs.length) {
      update.$addToSet = { programs: { $each: programs } };
    }
    await College.findOneAndUpdate({ slug: doc.slug }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    n++;
  }
  return n;
}

async function main() {
  await connectDB();
  const files = ["seed.json", "seed2.json", "seed3.json", "seed4.json", "seed5.json", "seed6.json"];
  const merged: SeedFile = {
    exams: [],
    careers: [],
    colleges: [],
    scholarships: [],
    outcomes: [],
    roadmaps: [],
    alumni: [],
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
    merged.alumni.push(...(part.alumni ?? []));
  }

  const counts = {
    exams: await upsertMany(Exam, merged.exams, "slug"),
    careers: await upsertMany(Career, merged.careers, "slug"),
    colleges: await upsertColleges(merged.colleges),
    scholarships: await upsertMany(Scholarship, merged.scholarships, "slug"),
    outcomes: await upsertMany(Outcome, merged.outcomes, "careerSlug"),
    roadmaps: await upsertMany(Roadmap, merged.roadmaps, "careerSlug"),
    alumni: await upsertMany(Alumni, merged.alumni, "slug"),
  };

  // Curated "popular" careers (merge-safe $set, does not touch other fields).
  const popularSlugs = [
    "bsc-cs", "bsc-nursing", "architecture", "mbbs", "civil-engineer",
    "computer-engineer", "pharmacy", "mechanical-engineer", "electrical-engineer",
    "bds", "veterinary", "bsc-fisheries", "forestry",
  ];
  const popRes = await Career.updateMany({ slug: { $in: popularSlugs } }, { $set: { popular: true } });
  counts.popular = popRes.modifiedCount;

  // Curated real college images (Wikimedia Commons, free-licensed).
  const collegeLogos: Record<string, string> = {
    iom: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Tribhuvan_University_logo.svg/320px-Tribhuvan_University_logo.svg.png",
    "tu-central": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Tribhuvan_University_logo.svg/320px-Tribhuvan_University_logo.svg.png",
    "ku-school-of-engineering": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Kathmandu_University_logo.svg/320px-Kathmandu_University_logo.svg.png",
    "ku-school-of-science": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Kathmandu_University_logo.svg/320px-Kathmandu_University_logo.svg.png",
    "ku-school-of-medicine": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Kathmandu_University_logo.svg/320px-Kathmandu_University_logo.svg.png",
    "ioe-pulchowk": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Institute_of_Engineering%2C_TU_logo.png/320px-Institute_of_Engineering%2C_TU_logo.png",
    "afu-tu": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Agriculture_%26_Forestry_University_logo.png/320px-Agriculture_%26_Forestry_University_logo.png",
    bpkihs: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/BPKIHS_logo.png/320px-BPKIHS_logo.png",
  };
  for (const [slug, url] of Object.entries(collegeLogos)) {
    await College.updateOne({ slug }, { $set: { logoUrl: url } });
  }
  counts.logos = Object.keys(collegeLogos).length;

  console.log("Seed complete:", counts);
  await disconnectDB();
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDB();
  process.exit(1);
});
