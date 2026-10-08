import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, MapPin, Globe } from "lucide-react";
import { api } from "@/lib/api";
import { CollegeImage } from "@/components/CollegeImage";

export const revalidate = 3600; // corpus changes rarely — serve stale, revalidate hourly

function salaryLine(c: Awaited<ReturnType<typeof api.career>>) {
  if (!c.salaryNp) return null;
  const cur = c.salaryNp.currency ?? "NPR";
  if (c.salaryNp.rangeLow && c.salaryNp.rangeHigh) return `${cur} ${c.salaryNp.rangeLow.toLocaleString()}–${c.salaryNp.rangeHigh.toLocaleString()} / ${c.salaryNp.period ?? "month"}`;
  if (c.salaryNp.rangeLow) return `${cur} ${c.salaryNp.rangeLow.toLocaleString()}+ / ${c.salaryNp.period ?? "month"}`;
  return "see details";
}

export default async function CareerDetail({ params }: { params: { slug: string } }) {
  let career: Awaited<ReturnType<typeof api.career>> | null = null;
  let colleges: Awaited<ReturnType<typeof api.colleges>> = [];
  let roadmap: Awaited<ReturnType<typeof api.roadmap>> | null = null;
  try {
    career = await api.career(params.slug);
    colleges = await api.colleges();
    roadmap = await api.roadmap(params.slug);
  } catch {}

  if (!career) notFound();

  const offering = colleges.filter((c) => c.programs?.includes(career!.slug));

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <Link href="/careers" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand"><ArrowLeft size={15} /> Back to careers</Link>

      <h1 className="font-grotesk text-3xl font-bold tracking-tight">{career.titleEn}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{career.stream}</span>
        {(Array.isArray(career.subjectCombo) ? career.subjectCombo : career.subjectCombo ? career.subjectCombo.split("+") : []).map((s) => <span key={s} className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ background: "var(--surface)", color: "var(--mut)" }}>{s}</span>)}
      </div>
      {career.description && <p className="mt-4 max-w-2xl text-[15px]" style={{ color: "var(--mut)" }}>{career.description}</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        {/* roadmap + abroad-vs-nepal */}
        <div className="space-y-5 lg:col-span-7">
          <div className="bento p-6">
            <h2 className="font-grotesk text-lg font-bold">How to get there</h2>
            {roadmap && roadmap.steps?.length ? (
              <ol className="mt-4 space-y-0">
                {roadmap.steps.map((st: any, i: number) => (
                  <li key={i} className="relative pb-5 pl-7">
                    <span className="absolute left-0 top-0 grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white gradient-btn">{i + 1}</span>
                    {i < roadmap.steps.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px" style={{ background: "var(--line)" }} />}
                    <div className="font-medium">{st.label}</div>
                    {st.duration && <div className="text-sm font-semibold" style={{ color: "var(--brand)" }}>{st.duration}</div>}
                    {st.notes && <div className="text-sm" style={{ color: "var(--mut)" }}>{st.notes}</div>}
                  </li>
                ))}
              </ol>
            ) : career.educationPath?.length ? (
              <ol className="mt-4 space-y-0">
                {career.educationPath.map((p: string, i: number) => (
                  <li key={i} className="relative pb-5 pl-7">
                    <span className="absolute left-0 top-0 grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white gradient-btn">{i + 1}</span>
                    {i < career.educationPath!.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px" style={{ background: "var(--line)" }} />}
                    <div className="font-medium">{p}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm" style={{ color: "var(--mut)" }}>Roadmap data coming soon.</p>
            )}
          </div>

          {career.abroadVsNepal && (
            <div className="bento p-6">
              <h2 className="font-grotesk text-lg font-bold">🇳🇵 Stay in Nepal vs ✈️ Abroad</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4" style={{ borderColor: "#bbf7d0", background: "rgba(22,163,74,.06)" }}>
                  <div className="mb-1 font-semibold" style={{ color: "#16a34a" }}>Nepal</div>
                  <p className="text-sm" style={{ color: "var(--mut)" }}>{career.abroadVsNepal.nepalCost}{career.abroadVsNepal.roiNepal ? ` — ${career.abroadVsNepal.roiNepal}` : ""}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: "#fde68a", background: "rgba(217,119,6,.06)" }}>
                  <div className="mb-1 font-semibold" style={{ color: "#d97706" }}>Abroad</div>
                  <p className="text-sm" style={{ color: "var(--mut)" }}>{career.abroadVsNepal.abroadCostEst}{career.abroadVsNepal.roiAbroad ? ` — ${career.abroadVsNepal.roiAbroad}` : ""}</p>
                </div>
                {career.abroadVsNepal.riskNotes && <p className="text-xs sm:col-span-2" style={{ color: "var(--mut)" }}>⚠️ {career.abroadVsNepal.riskNotes}</p>}
              </div>
            </div>
          )}
        </div>

        {/* salary + colleges */}
        <div className="space-y-5 lg:col-span-5">
          <div className="bento p-6">
            <h2 className="font-grotesk text-lg font-bold">Salary (Nepal, estimate)</h2>
            <div className="mt-2 flex items-center gap-2 text-2xl font-bold" style={{ color: "#16a34a" }}>
              <Banknote size={20} /> {salaryLine(career) ?? "—"}
            </div>
            {career.salaryNp?.confidence && <div className="mt-1 text-xs" style={{ color: "var(--mut)" }}>confidence: {career.salaryNp.confidence}</div>}
          </div>

          <div className="bento p-6">
            <h2 className="font-grotesk text-lg font-bold">Colleges offering this ({offering.length})</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {offering.map((c) => (
                <Link key={c.slug} href={`/colleges/${c.slug}`} className="flex items-center gap-3 rounded-xl border p-2 transition hover:border-brand" style={{ borderColor: "var(--line)" }}>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <CollegeImage slug={c.slug} name={c.name} affiliation={c.affiliation} logoUrl={c.logoUrl} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: "var(--mut)" }}><MapPin size={11} /> {c.district ?? c.affiliation}</div>
                  </div>
                </Link>
              ))}
              {offering.length === 0 && <p className="text-sm" style={{ color: "var(--mut)" }}>No college mapped yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
