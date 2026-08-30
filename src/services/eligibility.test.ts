import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { connectDB, disconnectDB } from "../db/connect";
import { checkEligibility } from "../services/eligibility";
import { Career } from "../models/career";
import { College } from "../models/college";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("eligibility service", () => {
  it("flags a Science+Math student with GPA 3.4 as eligible for civil-engineer", async () => {
    const r = await checkEligibility({ stream: "Science", subjectCombo: "Sci+Math", gpa: 3.4 });
    const civil = r.eligibleCareers.find((c) => c.slug === "civil-engineer");
    expect(civil).toBeDefined();
    expect(civil!.gpaEligible).toBe(true);
    expect(civil!.reason).toContain("Eligible");
  });

  it("flags a student below the min GPA as ineligible for a career (none in seed have minGpa>3.4, so test boundary)", async () => {
    // All seed careers have minGpa 2.0; a 1.5 GPA should make every career ineligible.
    const r = await checkEligibility({ stream: "Science", subjectCombo: "Sci+Math", gpa: 1.5 });
    expect(r.eligibleCareers.length).toBe(0);
    expect(r.ineligibleCareers.length).toBeGreaterThan(0);
  });

  it("excludes Sci+Bio careers when subjectCombo is Sci+Math", async () => {
    const r = await checkEligibility({ stream: "Science", subjectCombo: "Sci+Math", gpa: 3.0 });
    const slugs = r.eligibleCareers.map((c) => c.slug);
    expect(slugs).not.toContain("mbbs");
  });

  it("returns colleges offering eligible careers", async () => {
    const r = await checkEligibility({ stream: "Science", subjectCombo: "Sci+Math", gpa: 3.0 });
    expect(r.colleges.length).toBeGreaterThan(0);
    expect(r.colleges.some((c) => c.slug === "ioe-pulchowk")).toBe(true);
  });
});

describe("seed data integrity", () => {
  it("has careers with required sourceUrls + verifiedDate", async () => {
    const bad = await Career.find({ $or: [{ sourceUrls: { $size: 0 } }, { verifiedDate: { $exists: false } }] }).lean();
    expect(bad.length).toBe(0);
  });

  it("college geo coordinates are within Nepal bounds", async () => {
    const all = await College.find().lean();
    for (const c of all) {
      expect(c.lat).toBeGreaterThan(26);
      expect(c.lat).toBeLessThan(31);
      expect(c.lng).toBeGreaterThan(80);
      expect(c.lng).toBeLessThan(89);
    }
  });
});
