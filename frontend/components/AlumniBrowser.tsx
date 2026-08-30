"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Shuffle, ExternalLink, Sparkles } from "lucide-react";
import type { Alumni, Career, College } from "@/lib/api";

const sentimentStyle: Record<string, string> = {
  positive: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  mixed: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  caution: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export function AlumniBrowser({ items, careers, colleges }: { items: Alumni[]; careers: Career[]; colleges: College[] }) {
  const [filter, setFilter] = useState<"all" | "career" | "college">("all");
  const [careerSlug, setCareerSlug] = useState("");
  const [collegeSlug, setCollegeSlug] = useState("");
  const [surprise, setSurprise] = useState<Alumni | null>(null);

  const careerName = (s?: string) => careers.find((c) => c.slug === s)?.titleEn ?? s;
  const collegeName = (s?: string) => colleges.find((c) => c.slug === s)?.name ?? s;

  const visible = useMemo(() => {
    return items.filter(
      (a) => (filter === "career" ? !careerSlug || a.careerSlug === careerSlug : filter === "college" ? !collegeSlug || a.collegeSlug === collegeSlug : true)
    );
  }, [items, filter, careerSlug, collegeSlug]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button onClick={() => { const r = items[Math.floor(Math.random() * items.length)]; setSurprise(r); }} className="gradient-btn inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          <Shuffle size={15} /> Surprise me
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: "var(--mut)" }}>Filter:</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-lg border px-2.5 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
            <option value="all">All</option>
            <option value="career">By career</option>
            <option value="college">By college</option>
          </select>
          {filter === "career" && (
            <select value={careerSlug} onChange={(e) => setCareerSlug(e.target.value)} className="rounded-lg border px-2.5 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
              <option value="">Any career</option>
              {careers.map((c) => <option key={c.slug} value={c.slug}>{c.titleEn}</option>)}
            </select>
          )}
          {filter === "college" && (
            <select value={collegeSlug} onChange={(e) => setCollegeSlug(e.target.value)} className="rounded-lg border px-2.5 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
              <option value="">Any college</option>
              {colleges.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {surprise && (
        <div className="bento mb-5 border-2 p-5" style={{ borderColor: "var(--brand)" }}>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold" style={{ color: "var(--brand)" }}><Sparkles size={15} /> Random experience</div>
          <p className="text-[15px] leading-relaxed">{surprise.snippet}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {surprise.careerSlug && <span className="rounded-md bg-brand/10 px-2 py-0.5 font-semibold text-brand">{careerName(surprise.careerSlug)}</span>}
            {surprise.collegeSlug && <span className="rounded-md px-2 py-0.5" style={{ background: "var(--surface)" }}>{collegeName(surprise.collegeSlug)}</span>}
            {surprise.sentiment && <span className={`rounded-md px-2 py-0.5 font-semibold ${sentimentStyle[surprise.sentiment]}`}>{surprise.sentiment}</span>}
            <a href={surprise.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: "var(--mut)" }}>{surprise.sourceName} <ExternalLink size={11} /></a>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((a, i) => (
          <div key={a._id ?? i} className="bento flex flex-col p-5">
            <p className="flex-1 text-[15px] leading-relaxed">{a.snippet}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {a.careerSlug && <span className="rounded-md bg-brand/10 px-2 py-0.5 font-semibold text-brand">{careerName(a.careerSlug)}</span>}
              {a.collegeSlug && <span className="rounded-md px-2 py-0.5" style={{ background: "var(--surface)" }}>{collegeName(a.collegeSlug)}</span>}
              {a.sentiment && <span className={`rounded-md px-2 py-0.5 font-semibold ${sentimentStyle[a.sentiment]}`}>{a.sentiment}</span>}
              <a href={a.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: "var(--mut)" }}>{a.sourceName} <ExternalLink size={11} /></a>
            </div>
          </div>
        ))}
      </div>
      {visible.length === 0 && <p className="mt-6 text-sm" style={{ color: "var(--mut)" }}>No experiences match this filter yet.</p>}
    </div>
  );
}
