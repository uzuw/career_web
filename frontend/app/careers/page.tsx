import { api } from "@/lib/api";
import { CareerCard } from "@/components/CareerCard";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  let careers: Awaited<ReturnType<typeof api.careers>> = [];
  try { careers = await api.careers(); } catch {}

  const streams = ["All", ...Array.from(new Set(careers.map((c) => c.stream))).sort()];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Careers after +2 Science</h1>
      <p className="mt-1 text-[15px]" style={{ color: "var(--mut)" }}>Filter by stream. Tap a card for the full path, salary, and colleges.</p>

      <div className="sticky top-[60px] z-30 -mx-5 mb-5 mt-4 border-b bg-[var(--bg)]/80 px-5 py-3 backdrop-blur" style={{ borderColor: "var(--line)" }}>
        <div className="flex flex-wrap gap-2">
          {streams.map((s) => (
            <a key={s} href={`/careers?stream=${encodeURIComponent(s)}`} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${s === "All" ? "gradient-btn text-white" : ""}`} style={s === "All" ? {} : { border: "1px solid var(--line)", color: "var(--mut)" }}>
              {s}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {careers.map((c) => <CareerCard key={c.slug} career={c} />)}
      </div>
      {careers.length === 0 && <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>Could not reach the API. Start it with <code>npm run dev</code> in the backend folder.</p>}
    </div>
  );
}
