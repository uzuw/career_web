import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { AlumniBrowser } from "@/components/AlumniBrowser";

export const dynamic = "force-dynamic";

export default async function AlumniPage() {
  let items: Awaited<ReturnType<typeof api.alumni>> = [];
  let careers: Awaited<ReturnType<typeof api.careers>> = [];
  let colleges: Awaited<ReturnType<typeof api.colleges>> = [];
  try {
    [items, careers, colleges] = await Promise.all([api.alumni(), api.careers(), api.colleges()]);
  } catch {}

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Alumni experiences</h1>
      <p className="mt-1 max-w-2xl text-[15px]" style={{ color: "var(--mut)" }}>
        Real experiences shared publicly by Nepali graduates, summarized and attributed. Tap a source to read the original. These are individual stories — not advice — so weigh them against the data on each career page.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>Could not reach the API. Start it with <code>npm run dev</code> in the backend folder.</p>
      ) : (
        <div className="mt-5">
          <AlumniBrowser items={items} careers={careers} colleges={colleges} />
        </div>
      )}
    </div>
  );
}
