import { FileCheck2 } from "lucide-react";
import { api } from "@/lib/api";
import { EntranceHub } from "@/components/EntranceHub";

export const revalidate = 3600; // corpus changes rarely — serve stale, revalidate hourly

export default async function EntrancePage() {
  let exams: Awaited<ReturnType<typeof api.exams>> = [];
  let careers: Awaited<ReturnType<typeof api.careers>> = [];
  let colleges: Awaited<ReturnType<typeof api.colleges>> = [];
  try {
    [exams, careers, colleges] = await Promise.all([api.exams(), api.careers(), api.colleges()]);
  } catch {}

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Entrance exams</h1>
      <p className="mt-1 max-w-2xl text-[15px]" style={{ color: "var(--mut)" }}>
        Every entrance exam for +2 Science pathways in Nepal — what you need to be eligible for, when it&apos;s held, the fee, and exactly which colleges and careers it unlocks. Expand a card to see the full map.
      </p>

      {exams.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>Could not reach the API. Start it with <code>npm run dev</code> in the backend folder.</p>
      ) : (
        <div className="mt-5">
          <EntranceHub exams={exams} careers={careers} colleges={colleges} />
        </div>
      )}
    </div>
  );
}
