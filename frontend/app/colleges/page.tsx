import { api } from "@/lib/api";
import { CollegeBrowser } from "@/components/CollegeBrowser";

export const revalidate = 3600; // corpus changes rarely — serve stale, revalidate hourly

export default async function CollegesPage() {
  let colleges: Awaited<ReturnType<typeof api.colleges>> = [];
  try { colleges = await api.colleges(); } catch {}

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Colleges in Nepal</h1>
      <p className="mt-1 text-[15px]" style={{ color: "var(--mut)" }}>Search by name or district, and filter by province or affiliation. Amber = foreign-affiliated.</p>

      {colleges.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>Could not reach the API. Start it with <code>npm run dev</code> in the backend folder.</p>
      ) : (
        <CollegeBrowser colleges={colleges} />
      )}
    </div>
  );
}
