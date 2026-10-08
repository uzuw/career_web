import Link from "next/link";
import { Route, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export const revalidate = 3600; // corpus changes rarely — serve stale, revalidate hourly

export default async function RoadmapsPage() {
  let roadmaps: Awaited<ReturnType<typeof api.roadmaps>> = [];
  let careers: Awaited<ReturnType<typeof api.careers>> = [];
  try {
    [roadmaps, careers] = await Promise.all([api.roadmaps(), api.careers()]);
  } catch {}

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Roadmaps</h1>
      <p className="mt-1 text-[15px]" style={{ color: "var(--mut)" }}>Step-by-step paths from +2 to a career.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((r) => {
          const career = careers.find((c) => c.slug === r.careerSlug);
          return (
            <Link key={r.careerSlug} href={`/careers/${r.careerSlug}`} className="bento group block p-5 transition hover:-translate-y-0.5 hover:shadow-brand">
              <div className="mb-3 flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl gradient-btn text-white"><Route size={16} /></span>
                <ArrowRight size={16} className="opacity-0 transition group-hover:opacity-100" style={{ color: "var(--mut)" }} />
              </div>
              <h3 className="font-grotesk text-base font-bold">{career?.titleEn ?? r.careerSlug}</h3>
              <div className="mt-1 text-sm" style={{ color: "var(--mut)" }}>{r.steps.length} steps</div>
              <ol className="mt-3 space-y-1.5">
                {r.steps.slice(0, 4).map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white gradient-btn">{i + 1}</span>
                    <span className="truncate">{s.label}</span>
                  </li>
                ))}
                {r.steps.length > 4 && <li className="text-xs" style={{ color: "var(--mut)" }}>… +{r.steps.length - 4} more</li>}
              </ol>
            </Link>
          );
        })}
        {roadmaps.length === 0 && <p className="text-sm" style={{ color: "var(--mut)" }}>No roadmaps yet.</p>}
      </div>
    </div>
  );
}
