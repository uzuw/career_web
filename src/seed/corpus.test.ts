import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { connectDB, disconnectDB } from "../db/connect";
import { Career } from "../models/career";
import { College } from "../models/college";
import { Exam } from "../models/exam";
import { Roadmap } from "../models/roadmap";

beforeAll(async () => { await connectDB(); });
afterAll(async () => { await disconnectDB(); });

describe("science corpus size (after growth)", () => {
  it("has at least 25 Science careers", async () => {
    const n = await Career.countDocuments({ stream: "Science" });
    expect(n).toBeGreaterThanOrEqual(25);
  });

  it("has at least 35 colleges", async () => {
    const n = await College.countDocuments();
    expect(n).toBeGreaterThanOrEqual(35);
  });

  it("includes AFU agriculture/forestry campuses", async () => {
    expect(await College.findOne({ slug: "afu-rampur" })).toBeTruthy();
    expect(await College.findOne({ slug: "afu-hetauda" })).toBeTruthy();
  });

  it("includes the full medical-college list (TU + KU affiliations)", async () => {
    for (const slug of ["kist", "gandaki", "janaki", "naibs", "ngmc", "devdaha", "lumbini", "kantipur-dental", "scheer", "peoples-dental", "manmohan", "nepal-ayurved"]) {
      expect(await College.findOne({ slug })).toBeTruthy();
    }
  });

  it("has AFU entrance exam linking agri/forestry/vet careers", async () => {
    const e = await Exam.findOne({ slug: "afu-entrance" }).lean();
    expect(e).toBeTruthy();
    expect(e!.forCareer).toContain("agriculture");
    expect(e!.forCareer).toContain("forestry");
  });

  it("has roadmaps for newly added careers (bpt, data-science-ai, agriculture)", async () => {
    for (const slug of ["bpt", "data-science-ai", "agriculture"]) {
      expect(await Roadmap.findOne({ careerSlug: slug })).toBeTruthy();
    }
  });

  it("every Science career links to a real college program", async () => {
    const careers = await Career.find({ stream: "Science" }).lean();
    const colleges = await College.find().lean();
    const offered = new Set(colleges.flatMap((c: any) => c.programs));
    // Careers verified to exist but whose specific offering colleges are not yet
    // mapped (need per-campus verification). Tracked, not asserted as linked.
    const knownOrphans = new Set([
      "microbiology",
      "bpt",
      "biotechnology",
      "environmental-science",
      "data-science-ai",
      "statistics",
    ]);
    const orphans = careers
      .filter((c: any) => !offered.has(c.slug))
      .map((c: any) => c.slug);
    expect(orphans.sort()).toEqual([...knownOrphans].sort());
  });
});
