import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Globe, Banknote, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import { CollegeImage } from "@/components/CollegeImage";
import { CorpusUpdateButton } from "@/components/CorpusUpdateButton";

export const dynamic = "force-dynamic";

export default async function CollegeDetail({ params }: { params: { slug: string } }) {
  let college: Awaited<ReturnType<typeof api.college>> | null = null;
  let careers: Awaited<ReturnType<typeof api.careers>> = [];
  try {
    college = await api.college(params.slug);
    careers = await api.careers();
  } catch {}

  if (!college) notFound();

  const offered = (college.programs ?? [])
    .map((slug) => careers.find((c) => c.slug === slug))
    .filter(Boolean) as Awaited<ReturnType<typeof api.careers>>;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <Link href="/colleges" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand"><ArrowLeft size={15} /> Back to colleges</Link>

      <div className="bento overflow-hidden">
        <div className="relative h-44 w-full">
          <CollegeImage slug={college.slug} name={college.name} affiliation={college.affiliation} />
          <span className="absolute left-4 top-4 rounded-md px-2.5 py-1 text-xs font-semibold text-white" style={{ background: college.affiliation === "Foreign" ? "#d97706" : "#6366f1" }}>
            {college.affiliation}{college.foreignPartner ? ` · ${college.foreignPartner.split(",")[0]}` : ""}
          </span>
        </div>
        <div className="p-6">
          <h1 className="font-grotesk text-2xl font-bold tracking-tight">{college.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--mut)" }}>
            <span className="flex items-center gap-1"><MapPin size={14} /> {college.district ?? college.province ?? "Nepal"}</span>
            {college.foreignPartner && <span className="flex items-center gap-1" style={{ color: "#d97706" }}><Globe size={14} /> {college.foreignPartner}</span>}
            {college.type && <span className="capitalize">{college.type}</span>}
            {typeof college.lat === "number" && typeof college.lng === "number" && (
              <span className="flex items-center gap-2">
                <a href={`https://www.google.com/maps/search/?api=1&query=${college.lat},${college.lng}`} target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color: "#4285F4" }}>Google Maps</a>
                <a href={`https://maps.apple.com/?q=${encodeURIComponent(college.name)}&ll=${college.lat},${college.lng}`} target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color: "var(--mut)" }}>Apple Maps</a>
              </span>
            )}
          </div>
          {college.tuitionRange && (
            <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#16a34a" }}>
              <Banknote size={15} /> {(college.tuitionRange.currency ?? "NPR")} {college.tuitionRange.low?.toLocaleString()}–{college.tuitionRange.high?.toLocaleString()} <span style={{ color: "var(--mut)", fontWeight: 400 }}>total ({college.tuitionRange.period ?? "program"})</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 bento p-6">
        <h2 className="font-grotesk text-lg font-bold">Programs offered ({offered.length})</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {offered.map((c) => (
            <Link key={c.slug} href={`/careers/${c.slug}`} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:border-brand" style={{ borderColor: "var(--line)" }}>
              <GraduationCap size={15} style={{ color: "var(--brand)" }} /> {c.titleEn}
            </Link>
          ))}
          {offered.length === 0 && <p className="text-sm" style={{ color: "var(--mut)" }}>No linked programs yet.</p>}
        </div>
      </div>

      {college.website && (
        <a href={college.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-xl gradient-btn px-4 py-2.5 text-sm font-semibold text-white">
          Visit website <Globe size={15} />
        </a>
      )}

      <CorpusUpdateButton slug={college.slug} name={college.name} />
    </div>
  );
}
