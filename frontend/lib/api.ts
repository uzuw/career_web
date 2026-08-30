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
  tuitionRange?: { low?: number; high?: number; currency?: string; period?: string };
  website?: string;
  sourceUrls?: string[];
  verifiedDate?: string;
}

export interface Exam {
  slug: string;
  nameEn: string;
  forCareer?: string[];
  eligibility?: string;
  appFeeNpr?: number;
  officialUrl?: string;
}

export interface Roadmap {
  careerSlug: string;
  steps: { type: string; label: string; duration?: string; notes?: string }[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
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
  eligibility: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return get<any>(`/api/eligibility?${qs}`);
  },
};
