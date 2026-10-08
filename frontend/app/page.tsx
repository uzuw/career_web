import Link from "next/link";
import { GraduationCap, Building2, FileCheck2, HeartHandshake, ArrowRight, Compass } from "lucide-react";
import { api } from "@/lib/api";
import { CareerCard } from "@/components/CareerCard";
import { CollegeCard } from "@/components/CollegeCard";

export const revalidate = 3600; // corpus changes rarely — serve stale, revalidate hourly

export default async function Home() {
  let careers: Awaited<ReturnType<typeof api.careers>> = [];
  let colleges: Awaited<ReturnType<typeof api.colleges>> = [];
  let exams: Awaited<ReturnType<typeof api.exams>> = [];
  try {
    [careers, colleges, exams] = await Promise.all([api.careers(), api.colleges(), api.exams()]);
  } catch {
    // API unreachable — page still renders with empty states.
  }

  const stats = [
    { n: careers.length, l: "Science careers", icon: GraduationCap },
    { n: colleges.length, l: "Nepali & foreign colleges", icon: Building2 },
    { n: exams.length, l: "Entrance exams", icon: FileCheck2 },
    { n: "100%", l: "Free & verified", icon: HeartHandshake },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* HERO (bento) */}
      <section className="grid gap-5 py-10 lg:grid-cols-12">
        <div className="bento flex flex-col justify-between p-8 lg:col-span-7">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: "var(--line)", color: "#16a34a" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Verified · Nepal-specific
            </span>
            <h1 className="mt-4 font-grotesk text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              What next after <span className="gradient-text">+2 Science?</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px]" style={{ color: "var(--mut)" }}>
              Clear, verified guidance on careers, colleges, and entrance exams — so you don&apos;t have to guess, and you don&apos;t have to leave. <span className="font-semibold" style={{ color: "var(--ink)" }}>Shaping the future of every Nepali sprout.</span>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/careers" className="gradient-btn rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-brand">Browse careers</Link>
            <Link href="/eligibility" className="flex items-center gap-1.5 rounded-xl border px-5 py-3 text-sm font-semibold transition hover:border-brand" style={{ borderColor: "var(--line)" }}>
              <Compass size={16} /> Check eligibility
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-5">
          <div className="bento flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl gradient-btn text-white"><GraduationCap size={22} /></div>
            <div>
              <div className="font-grotesk text-lg font-bold">{careers.length} career paths</div>
              <div className="text-sm" style={{ color: "var(--mut)" }}>Engineering · Medical · IT · Agriculture</div>
            </div>
          </div>
          <div className="bento flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl text-white" style={{ background: "#0ea5e9" }}><Building2 size={22} /></div>
            <div>
              <div className="font-grotesk text-lg font-bold">{colleges.length} colleges</div>
              <div className="text-sm" style={{ color: "var(--mut)" }}>TU · KU · PU · AFU · foreign-affiliated</div>
            </div>
          </div>
          <div className="bento flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl text-white" style={{ background: "#d97706" }}><FileCheck2 size={22} /></div>
            <div>
              <div className="font-grotesk text-lg font-bold">{exams.length} entrance exams</div>
              <div className="text-sm" style={{ color: "var(--mut)" }}>IOE · MECEE-BL · KU · AFU</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-4 pb-8 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="bento p-5">
            <s.icon size={18} className="mb-2" style={{ color: "var(--brand)" }} />
            <div className="font-grotesk text-2xl font-bold">{s.n}</div>
            <div className="text-sm" style={{ color: "var(--mut)" }}>{s.l}</div>
          </div>
        ))}
      </section>

      {/* FEATURED CAREERS — fixed trio + View more */}
      <section className="pb-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-grotesk text-2xl font-bold">Explore careers</h2>
          <Link href="/careers" className="flex items-center gap-1 text-sm font-semibold text-brand">View more <ArrowRight size={15} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(["bsc-cs", "bsc-nursing", "architecture"]
            .map((slug) => careers.find((c) => c.slug === slug))
            .filter(Boolean)
            .map((c: any) => <CareerCard key={c.slug} career={c} />))}
        </div>
      </section>

      {/* POPULAR COLLEGES — one curated set, not a wall of cards */}
      <section className="pb-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-grotesk text-2xl font-bold">Popular colleges</h2>
          <Link href="/colleges" className="flex items-center gap-1 text-sm font-semibold text-brand">All colleges <ArrowRight size={15} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {([
            "tu-iost", "ku-soe", "ioe-pulchowk", "gces",
            "nec-pu", "islington", "iom", "mcoms",
          ]
            .map((slug) => colleges.find((c) => c.slug === slug))
            .filter(Boolean)
            .map((c: any) => <CollegeCard key={c.slug} college={c} />))}
        </div>
      </section>
    </div>
  );
}
