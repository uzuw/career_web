import { Career } from "../models/career";
import { College } from "../models/college";

export interface EligibilityQuery {
  stream?: string;
  subjectCombo?: string;
  gpa?: number;
  budgetMax?: number; // NPR
  district?: string;
  province?: string;
}

export interface CareerMatch {
  slug: string;
  titleEn: string;
  gpaEligible: boolean;
  reason: string;
}

export interface CollegeMatch {
  slug: string;
  name: string;
  district: string;
  tuitionOk: boolean;
  reason: string;
}

// Core "am I eligible?" logic — used by both REST and the future chatbot.
// Flags eligibility explicitly and explains WHY, so students trust the answer.
export async function checkEligibility(q: EligibilityQuery) {
  const filter: any = {};
  if (q.stream) filter.stream = q.stream;
  if (q.subjectCombo) filter.subjectCombo = q.subjectCombo;

  const careers = await Career.find(filter).lean();
  const careerMatches: CareerMatch[] = careers.map((c: any) => {
    const gpaEligible = q.gpa == null ? true : c.minGpa == null ? true : q.gpa >= c.minGpa;
    return {
      slug: c.slug,
      titleEn: c.titleEn,
      gpaEligible,
      reason: q.gpa == null
        ? "No GPA provided"
        : gpaEligible
        ? `Eligible: your GPA ${q.gpa} ≥ required ${c.minGpa ?? "n/a"}`
        : `Not eligible: your GPA ${q.gpa} < required ${c.minGpa}`,
    };
  });

  // Colleges offering the eligible careers
  let collegeFilter: any = {};
  const eligibleSlugs = careerMatches.filter((m) => m.gpaEligible).map((m) => m.slug);
  if (eligibleSlugs.length) collegeFilter.programs = { $in: eligibleSlugs };
  if (q.district) collegeFilter.district = q.district;
  if (q.province) collegeFilter.province = q.province;

  const colleges = await College.find(collegeFilter).lean();
  const collegeMatches: CollegeMatch[] = colleges.map((col: any) => {
    const low = col.tuitionRange?.low;
    const tuitionOk = q.budgetMax == null ? true : low == null ? true : low <= q.budgetMax;
    return {
      slug: col.slug,
      name: col.name,
      district: col.district,
      tuitionOk,
      reason:
        q.budgetMax == null
          ? "No budget filter"
          : tuitionOk
          ? `Within budget (from NPR ${low?.toLocaleString() ?? "?"})`
          : `Over budget (from NPR ${low?.toLocaleString() ?? "?"})`,
    };
  });

  return {
    query: q,
    eligibleCareers: careerMatches.filter((m) => m.gpaEligible),
    ineligibleCareers: careerMatches.filter((m) => !m.gpaEligible),
    colleges: collegeMatches,
  };
}
