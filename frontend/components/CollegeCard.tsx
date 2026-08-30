import Link from "next/link";
import { MapPin, Globe } from "lucide-react";
import type { College } from "@/lib/api";
import { CollegeImage } from "./CollegeImage";

const affColor: Record<string, string> = {
  TU: "#6366f1", KU: "#0ea5e9", PU: "#16a34a", AFU: "#ca8a04", MU: "#db2777", Foreign: "#d97706", Other: "#64748b",
};

export function CollegeCard({ college }: { college: College }) {
  const accent = affColor[college.affiliation] ?? "#64748b";
  return (
    <Link href={`/colleges/${college.slug}`} className="bento group block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-brand">
      <div className="relative h-28 w-full overflow-hidden">
        <CollegeImage slug={college.slug} name={college.name} affiliation={college.affiliation} />
        <span
          className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
          style={{ background: accent }}
        >
          {college.affiliation}{college.affiliation === "Foreign" && college.foreignPartner ? ` · ${college.foreignPartner.split(",")[0]}` : ""}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-grotesk text-sm font-bold leading-tight">{college.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--mut)" }}>
          <MapPin size={12} /> {college.district ?? college.province ?? "Nepal"}
        </div>
        {college.foreignPartner && (
          <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#d97706" }}>
            <Globe size={12} /> {college.foreignPartner}
          </div>
        )}
      </div>
    </Link>
  );
}
