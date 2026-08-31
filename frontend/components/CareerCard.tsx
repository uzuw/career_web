import Link from "next/link";
import { ArrowRight, Banknote, Star } from "lucide-react";
import type { Career } from "@/lib/api";

function salary(c: Career): string {
  if (!c.salaryNp) return "—";
  const cur = c.salaryNp.currency ?? "NPR";
  if (c.salaryNp.rangeLow && c.salaryNp.rangeHigh) return `${cur} ${c.salaryNp.rangeLow.toLocaleString()}–${c.salaryNp.rangeHigh.toLocaleString()}`;
  if (c.salaryNp.rangeLow) return `${cur} ${c.salaryNp.rangeLow.toLocaleString()}+`;
  return "see page";
}

export function CareerCard({ career }: { career: Career }) {
  const combos = Array.isArray(career.subjectCombo)
    ? career.subjectCombo
    : career.subjectCombo ? career.subjectCombo.split("+") : [];
  return (
    <Link href={`/careers/${career.slug}`} className="bento lift group relative block p-5 transition hover:-translate-y-0.5 hover:shadow-brand">
      {career.popular && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
          <Star size={11} className="fill-amber-500 text-amber-500" /> Popular
        </span>
      )}
      <div className="mb-3 flex items-start justify-between gap-3 pr-16">
        <h3 className="font-grotesk text-base font-bold">{career.titleEn}</h3>
        <ArrowRight size={16} className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" style={{ color: "var(--mut)" }} />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">{career.stream}</span>
        {combos.slice(0, 3).map((s) => (
          <span key={s} className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: "var(--surface)", color: "var(--mut)" }}>{s}</span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#16a34a" }}>
        <Banknote size={15} /> <span>{salary(career)}/mo</span>
      </div>
    </Link>
  );
}
