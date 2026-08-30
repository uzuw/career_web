import { MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { CollegeMap } from "@/components/CollegeMap";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  let colleges: Awaited<ReturnType<typeof api.colleges>> = [];
  try { colleges = await api.colleges(); } catch {}

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">College map</h1>
      <p className="mt-1 text-[15px]" style={{ color: "var(--mut)" }}>Every college plotted by location. Filter by province or affiliation; tap a marker for details.</p>

      {colleges.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>Could not reach the API. Start it with <code>npm run dev</code> in the backend folder.</p>
      ) : (
        <div className="mt-5">
          <CollegeMap colleges={colleges} />
        </div>
      )}
    </div>
  );
}
