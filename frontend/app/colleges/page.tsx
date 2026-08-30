import { api } from "@/lib/api";
import { CollegeCard } from "@/components/CollegeCard";

export const dynamic = "force-dynamic";

export default async function CollegesPage() {
  let colleges: Awaited<ReturnType<typeof api.colleges>> = [];
  try { colleges = await api.colleges(); } catch {}

  const affs = ["All", ...Array.from(new Set(colleges.map((c) => c.affiliation))).sort()];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Colleges in Nepal</h1>
      <p className="mt-1 text-[15px]" style={{ color: "var(--mut)" }}>Filter by affiliation. Amber = foreign-affiliated.</p>

      <div className="sticky top-[60px] z-30 -mx-5 mb-5 mt-4 border-b bg-[var(--bg)]/80 px-5 py-3 backdrop-blur" style={{ borderColor: "var(--line)" }}>
        <div className="flex flex-wrap gap-2">
          {affs.map((a) => (
            <a key={a} href={`/colleges?aff=${encodeURIComponent(a)}`} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${a === "All" ? "gradient-btn text-white" : ""}`} style={a === "All" ? {} : { border: "1px solid var(--line)", color: "var(--mut)" }}>
              {a}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {colleges.map((c) => <CollegeCard key={c.slug} college={c} />)}
      </div>
      {colleges.length === 0 && <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>Could not reach the API. Start it with <code>npm run dev</code> in the backend folder.</p>}
    </div>
  );
}
