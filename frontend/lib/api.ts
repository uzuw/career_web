// Thin client for the College Choices Nepal backend API (default :4000).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export type Affiliation = "TU" | "KU" | "PU" | "MU" | "Foreign" | "Other";

export interface Career {
  slug: string;
  titleEn: string;
  titleNp?: string;
  stream: string;
  description?: string;
  subjectCombo?: string[] | string;
  minGpa?: number;
  salaryNp?: { rangeLow?: number; rangeHigh?: number; currency?: string; period?: string; confidence?: string; source?: string };
  popular?: boolean;
  abroadVsNepal?: { nepalCost?: string; abroadCostEst?: string; roiNepal?: string; roiAbroad?: string; riskNotes?: string };
  educationPath?: string[];
  entranceExams?: string[];
  sourceUrls?: string[];
  verifiedDate?: string;
}

export interface College {
  slug: string;
  name: string;
  affiliation: Affiliation;
  type?: string;
  foreignPartner?: string;
  lat: number;
  lng: number;
  district?: string;
  province?: string;
  programs?: string[];
  entranceRequired?: string;
  tuitionRange?: { low?: number; high?: number; currency?: string; period?: string };
  website?: string;
  logoUrl?: string;
  sourceUrls?: string[];
  verifiedDate?: string;
}

export interface Exam {
  slug: string;
  nameEn: string;
  nameNp?: string;
  forCareer?: string[];
  eligibility: string;
  syllabusUrl?: string;
  scheduleMonth: string;
  appFeeNpr: number;
  cutoffPrev?: { range: string; year: string; source: string };
  prepResources?: string[];
  officialUrl: string;
  sourceUrls?: string[];
  verifiedDate?: string;
}

export interface Alumni {
  _id?: string;
  careerSlug?: string;
  collegeSlug?: string;
  author?: string;
  snippet: string;
  sentiment?: "positive" | "mixed" | "caution";
  sourceUrl: string;
  sourceName: string;
}

export interface Roadmap {
  careerSlug: string;
  steps: { type: string; label: string; duration?: string; notes?: string }[];
}

async function get<T>(path: string): Promise<T> {
  // ponytail: revalidated hourly — corpus changes rarely, so pages serve stale
  // while revalidating instead of hitting the API on every visit.
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  base: API_BASE,
  careers: () => get<Career[]>("/api/careers"),
  career: (slug: string) => get<Career>(`/api/careers/${slug}`),
  colleges: (q = "") => get<College[]>(`/api/colleges${q}`),
  college: (slug: string) => get<College>(`/api/colleges/${slug}`),
  exams: () => get<Exam[]>("/api/exams"),
  roadmaps: () => get<Roadmap[]>("/api/roadmaps"),
  roadmap: (careerSlug: string) => get<Roadmap>(`/api/roadmaps/${careerSlug}`),
  alumni: (params?: { careerSlug?: string; collegeSlug?: string }) => {
    const q = new URLSearchParams();
    if (params?.careerSlug) q.set("careerSlug", params.careerSlug);
    if (params?.collegeSlug) q.set("collegeSlug", params.collegeSlug);
    const qs = q.toString();
    return get<Alumni[]>(`/api/alumni${qs ? `?${qs}` : ""}`);
  },
  randomAlumni: (params?: { careerSlug?: string; collegeSlug?: string }) => {
    const q = new URLSearchParams();
    if (params?.careerSlug) q.set("careerSlug", params.careerSlug);
    if (params?.collegeSlug) q.set("collegeSlug", params.collegeSlug);
    const qs = q.toString();
    return get<Alumni>(`/api/alumni/random${qs ? `?${qs}` : ""}`);
  },
  eligibility: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return get<any>(`/api/eligibility?${qs}`);
  },
};
