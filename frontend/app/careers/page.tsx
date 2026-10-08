import { api } from "@/lib/api";
import { CareerBrowser } from "@/components/CareerBrowser";

export const revalidate = 3600; // corpus changes rarely — serve stale, revalidate hourly

export default async function CareersPage() {
  let careers: Awaited<ReturnType<typeof api.careers>> = [];
  try { careers = await api.careers(); } catch {}

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Careers after +2 Science</h1>
      <p className="mt-1 text-[15px]" style={{ color: "var(--mut)" }}>Search, sort, and explore. ★ marks the most popular paths. Tap a card for the full roadmap, salary, and colleges.</p>

      {careers.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>Could not reach the API. Start it with <code>npm run dev</code> in the backend folder.</p>
      ) : (
        <CareerBrowser careers={careers} />
      )}
    </div>
  );
}
