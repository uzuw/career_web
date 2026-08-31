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

  // Curated real college images (downloaded into frontend/public/assets/college/{slug}.png
  // from official college sites / Wikimedia). Only slugs with a verified local asset get a
  // logoUrl; the rest fall back to the branded SVG placeholder. Excluded: tu-iost (6MB photo,
  // too heavy) and kmc/nobel (identical generic meta-image placeholder, not a real logo).
  const collegeLogos: Record<string, string> = {
    iom: "/assets/college/iom.png",
    "tu-central": "/assets/college/tu-central.png",
    "ioe-pulchowk": "/assets/college/ioe-pulchowk.png",
    "ioe-purwanchal": "/assets/college/ioe-purwanchal.png",
    "ioe-thapathali": "/assets/college/ioe-thapathali.png",
    bpkihs: "/assets/college/bpkihs.png",
    islington: "/assets/college/islington.png",
    janaki: "/assets/college/janaki.png",
    khwopa: "/assets/college/khwopa.png",
    "ku-soe": "/assets/college/ku-soe.png",
    "ku-sos": "/assets/college/ku-sos.png",
    manmohan: "/assets/college/manmohan.png",
    mcoms: "/assets/college/mcoms.png",
    nmc: "/assets/college/nmc.png",
    pahs: "/assets/college/pahs.png",
    prime: "/assets/college/prime.png",
    deerwalk: "/assets/college/deerwalk.png",
    // newly fetched real logos from official sites
    gces: "/assets/college/gces.png",
    "nec-pu": "/assets/college/nec-pu.png",
    herald: "/assets/college/herald.png",
    stamford: "/assets/college/stamford.png",
    tbc: "/assets/college/tbc.png",
    texas: "/assets/college/texas.png",
    "texas-intl": "/assets/college/texas-intl.png",
    phoenix: "/assets/college/phoenix.png",
    ismt: "/assets/college/ismt.png",
    padmashree: "/assets/college/padmashree.png",
    "informatics-pokhara": "/assets/college/informatics-pokhara.png",
    kec: "/assets/college/kec.png",
    kecktm: "/assets/college/kecktm.png",
    nce: "/assets/college/nce.png",
    ngmc: "/assets/college/ngmc.png",
    naibs: "/assets/college/naibs.png",
    kusms: "/assets/college/kusms.png",
    softwarica: "/assets/college/softwarica.png",
  };
  for (const [slug, url] of Object.entries(collegeLogos)) {
    await College.updateOne({ slug }, { $set: { logoUrl: url } });
  }
  counts.logos = Object.keys(collegeLogos).length;

  // Accurate campus coordinates (geocoded via Photon/OSM, curated for major campuses).
  // Embedded so re-seeds are reproducible and version-controlled.
  const geoOverrides: Record<string, { lat: number; lng: number; geoSource: string }> = {
    "acem": { lat: 27.68896, lng: 85.28993, geoSource: "photon" },
    "afu-hetauda": { lat: 27.41968, lng: 85.02249, geoSource: "photon" },
    "afu-rampur": { lat: 27.6088, lng: 84.3972, geoSource: "curated" },
    "birat": { lat: 26.49, lng: 87.27035, geoSource: "photon" },
    "bpkihs": { lat: 26.8125, lng: 87.284, geoSource: "curated" },
    "cmc": { lat: 27.64533, lng: 84.38317, geoSource: "photon" },
    "cms": { lat: 27.67702, lng: 84.43778, geoSource: "photon" },
    "cnrm-bardibas": { lat: 28.29172, lng: 83.94688, geoSource: "photon" },
    "cnrm-katari": { lat: 28.29172, lng: 83.94688, geoSource: "photon" },
    "cnrm-pakhribas": { lat: 28.29172, lng: 83.94688, geoSource: "photon" },
    "cnrm-tikapur": { lat: 28.53077, lng: 81.13625, geoSource: "photon" },
    "deerwalk": { lat: 27.71238, lng: 85.34245, geoSource: "photon" },
    "devdaha": { lat: 27.64727, lng: 83.53787, geoSource: "photon" },
    "gandaki": { lat: 28.20186, lng: 83.9797, geoSource: "photon" },
    "gces": { lat: 28.25902, lng: 83.97042, geoSource: "photon" },
    "hcoe": { lat: 27.67722, lng: 85.33264, geoSource: "photon" },
    "herald": { lat: 27.71228, lng: 85.33091, geoSource: "photon" },
    "informatics-pokhara": { lat: 28.21489, lng: 84.00012, geoSource: "photon" },
    "ioe-chitwan": { lat: 27.6453, lng: 84.3832, geoSource: "curated" },
    "ioe-paschimanchal": { lat: 28.25422, lng: 83.97636, geoSource: "photon" },
    "ioe-pulchowk": { lat: 27.5952, lng: 85.3206, geoSource: "curated" },
    "ioe-purwanchal": { lat: 26.79415, lng: 87.29151, geoSource: "photon" },
    "ioe-thapathali": { lat: 27.69457, lng: 85.31899, geoSource: "photon" },
    "iom": { lat: 27.7479, lng: 85.3852, geoSource: "curated" },
    "islington": { lat: 27.70759, lng: 85.32522, geoSource: "photon" },
    "ismt": { lat: 27.68874, lng: 85.34913, geoSource: "photon" },
    "janaki": { lat: 26.80858, lng: 85.97788, geoSource: "photon" },
    "kantipur-dental": { lat: 27.73655, lng: 85.32394, geoSource: "photon" },
    "kec": { lat: 27.63714, lng: 85.33343, geoSource: "photon" },
    "kecktm": { lat: 27.69886, lng: 85.29705, geoSource: "photon" },
    "khwopa": { lat: 27.67088, lng: 85.43969, geoSource: "photon" },
    "kist": { lat: 27.66483, lng: 85.33386, geoSource: "photon" },
    "kmc": { lat: 27.6873, lng: 85.40806, geoSource: "photon" },
    "ku-soe": { lat: 27.6217, lng: 85.5436, geoSource: "curated" },
    "ku-sos": { lat: 27.6217, lng: 85.5436, geoSource: "curated" },
    "kusms": { lat: 27.6217, lng: 85.5436, geoSource: "curated" },
    "lbef": { lat: 27.74664, lng: 85.33572, geoSource: "photon" },
    "london-college": { lat: 27.6921, lng: 85.31955, geoSource: "photon" },
    "lumbini": { lat: 27.84421, lng: 83.54423, geoSource: "photon" },
    "manmohan": { lat: 27.72688, lng: 85.28872, geoSource: "photon" },
    "mcoms": { lat: 28.25145, lng: 83.98626, geoSource: "photon" },
    "mit-nepal": { lat: 27.6873, lng: 85.40806, geoSource: "photon" },
    "naibs": { lat: 27.72688, lng: 85.28872, geoSource: "photon" },
    "nce": { lat: 27.65566, lng: 85.32061, geoSource: "photon" },
    "nec-pu": { lat: 27.70818, lng: 85.41392, geoSource: "photon" },
    "nepal-ayurved": { lat: 27.01146, lng: 84.89016, geoSource: "photon" },
    "ngmc": { lat: 28.19843, lng: 81.67787, geoSource: "photon" },
    "nmc": { lat: 27.73452, lng: 85.37953, geoSource: "photon" },
    "nobel": { lat: 26.49, lng: 87.27035, geoSource: "photon" },
    "padmashree": { lat: 27.6873, lng: 85.40806, geoSource: "photon" },
    "pahs": { lat: 27.68681, lng: 85.34814, geoSource: "photon" },
    "peoples-dental": { lat: 27.71913, lng: 85.30894, geoSource: "photon" },
    "phoenix": { lat: 27.66314, lng: 85.32998, geoSource: "photon" },
    "prime": { lat: 27.72085, lng: 85.30286, geoSource: "photon" },
    "scheer": { lat: 27.63145, lng: 85.52532, geoSource: "photon" },
    "softwarica": { lat: 27.70618, lng: 85.33001, geoSource: "photon" },
    "stamford": { lat: 27.68882, lng: 85.343, geoSource: "photon" },
    "tbc": { lat: 27.6921, lng: 85.31955, geoSource: "photon" },
    "techspire": { lat: 27.68741, lng: 85.33469, geoSource: "photon" },
    "texas": { lat: 27.71374, lng: 85.34251, geoSource: "photon" },
    "texas-intl": { lat: 27.71235, lng: 85.34455, geoSource: "photon" },
    "tu-iost": { lat: 27.6786, lng: 85.2906, geoSource: "curated" },
  };
  for (const [slug, g] of Object.entries(geoOverrides)) {
    await College.updateOne({ slug }, { $set: { lat: g.lat, lng: g.lng, geoSource: g.geoSource } });
  }
  counts.geo = Object.keys(geoOverrides).length;

  console.log("Seed complete:", counts);
  await disconnectDB();
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDB();
  process.exit(1);
});
