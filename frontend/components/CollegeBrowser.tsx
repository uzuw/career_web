"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { College } from "@/lib/api";
import { CollegeCard } from "@/components/CollegeCard";

export function CollegeBrowser({ colleges }: { colleges: College[] }) {
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("All");
  const [aff, setAff] = useState("All");

  const provinces = ["All", ...Array.from(new Set(colleges.map((c) => c.province).filter(Boolean) as string[])).sort()];
  const affiliations = ["All", ...Array.from(new Set(colleges.map((c) => c.affiliation))).sort()];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return colleges.filter(
      (c) =>
        (province === "All" || c.province === province) &&
        (aff === "All" || c.affiliation === aff) &&
        (!term || c.name.toLowerCase().includes(term) || (c.district ?? "").toLowerCase().includes(term) || (c.affiliation ?? "").toLowerCase().includes(term))
    );
  }, [colleges, q, province, aff]);

  return (
    <div>
      <div className="sticky top-[60px] z-30 -mx-5 mb-5 border-b bg-[var(--bg)]/85 px-5 py-3 backdrop-blur" style={{ borderColor: "var(--line)" }}>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mut)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search colleges or districts…"
            className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm"
            style={{ borderColor: "var(--line)", background: "var(--panel)" }}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <select value={province} onChange={(e) => setProvince(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
            {provinces.map((p) => <option key={p} value={p}>{p === "All" ? "All provinces" : p}</option>)}
          </select>
          <select value={aff} onChange={(e) => setAff(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
            {affiliations.map((a) => <option key={a} value={a}>{a === "All" ? "All affiliations" : a}</option>)}
          </select>
          <span className="text-sm" style={{ color: "var(--mut)" }}>{filtered.length} shown</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>No colleges match your filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => <CollegeCard key={c.slug} college={c} />)}
        </div>
      )}
    </div>
  );
}
