"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, ExternalLink, CalendarClock, Wallet, GraduationCap, Building2, BookOpen } from "lucide-react";
import type { Exam, Career, College } from "@/lib/api";

export function EntranceHub({ exams, careers, colleges }: { exams: Exam[]; careers: Career[]; colleges: College[] }) {
  const [q, setQ] = useState("");

  const enriched = useMemo(() => {
    const term = q.trim().toLowerCase();
    return exams
      .map((e) => {
        const linkedCareers = careers.filter((c) => e.forCareer?.includes(c.slug));
        const linkedColleges = colleges.filter((c) => c.entranceRequired === e.slug);
        return { exam: e, linkedCareers, linkedColleges };
      })
      .filter(
        ({ exam, linkedCareers, linkedColleges }) =>
          !term ||
          exam.nameEn.toLowerCase().includes(term) ||
          exam.eligibility.toLowerCase().includes(term) ||
          linkedCareers.some((c) => c.titleEn.toLowerCase().includes(term)) ||
          linkedColleges.some((c) => c.name.toLowerCase().includes(term))
      );
  }, [exams, careers, colleges, q]);

  return (
    <div>
      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mut)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exams, careers, colleges…"
          className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {enriched.map(({ exam, linkedCareers, linkedColleges }) => (
          <ExamCard key={exam.slug} exam={exam} careers={linkedCareers} colleges={linkedColleges} />
        ))}
      </div>
      {enriched.length === 0 && <p className="mt-6 text-sm" style={{ color: "var(--mut)" }}>No exams match “{q}”.</p>}
    </div>
  );
}

function ExamCard({ exam, careers, colleges }: { exam: Exam; careers: Career[]; colleges: College[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bento p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-grotesk text-lg font-bold">{exam.nameEn}</h3>
          {exam.nameNp && <p className="text-sm" style={{ color: "var(--mut)" }}>{exam.nameNp}</p>}
        </div>
        <a href={exam.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:border-brand" style={{ borderColor: "var(--line)" }}>
          Official <ExternalLink size={12} />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5" style={{ color: "var(--mut)" }}><CalendarClock size={14} /> {exam.scheduleMonth}</span>
        <span className="inline-flex items-center gap-1.5" style={{ color: "var(--mut)" }}><Wallet size={14} /> NPR {exam.appFeeNpr.toLocaleString()}</span>
      </div>

      <p className="mt-3 text-sm" style={{ color: "var(--ink)" }}>{exam.eligibility}</p>

      {exam.cutoffPrev?.range && (
        <p className="mt-2 text-xs" style={{ color: "var(--mut)" }}>Prev. cutoff: {exam.cutoffPrev.range} ({exam.cutoffPrev.year})</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {exam.prepResources?.map((r) => (
          <a key={r} href={r} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand hover:underline">
            <BookOpen size={11} /> Resource
          </a>
        ))}
        {exam.syllabusUrl && (
          <a href={exam.syllabusUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium" style={{ background: "var(--surface)", color: "var(--mut)" }}>
            Syllabus <ExternalLink size={11} />
          </a>
        )}
      </div>

      <button onClick={() => setOpen(!open)} className="mt-4 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold transition hover:border-brand" style={{ borderColor: "var(--line)" }}>
        <span>{careers.length} careers · {colleges.length} colleges accept this</span>
        <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--mut)" }}><GraduationCap size={13} /> Leads to</div>
            <ul className="space-y-1">
              {careers.map((c) => (
                <li key={c.slug}><Link href={`/careers/${c.slug}`} className="text-sm font-medium hover:text-brand hover:underline">{c.titleEn}</Link></li>
              ))}
              {careers.length === 0 && <li className="text-xs" style={{ color: "var(--mut)" }}>—</li>}
            </ul>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--mut)" }}><Building2 size={13} /> Required by</div>
            <ul className="space-y-1">
              {colleges.map((c) => (
                <li key={c.slug}><Link href={`/colleges/${c.slug}`} className="text-sm font-medium hover:text-brand hover:underline">{c.name}</Link></li>
              ))}
              {colleges.length === 0 && <li className="text-xs" style={{ color: "var(--mut)" }}>—</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
