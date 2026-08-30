"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import type { Career } from "@/lib/api";
import { CareerCard } from "@/components/CareerCard";

type Sort = "popular" | "name";

export function CareerBrowser({ careers }: { careers: Career[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("popular");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = careers.filter(
      (c) => !term || c.titleEn.toLowerCase().includes(term) || (c.titleNp ?? "").toLowerCase().includes(term) || c.stream.toLowerCase().includes(term)
    );
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.titleEn.localeCompare(b.titleEn);
      // popular first, then name
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || a.titleEn.localeCompare(b.titleEn);
    });
    return list;
  }, [careers, q, sort]);

  return (
    <div>
      <div className="sticky top-[60px] z-30 -mx-5 mb-5 border-b bg-[var(--bg)]/85 px-5 py-3 backdrop-blur" style={{ borderColor: "var(--line)" }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mut)" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search careers…"
              className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm"
              style={{ borderColor: "var(--line)", background: "var(--panel)" }}
            />
          </div>
          <button
            onClick={() => setSort(sort === "popular" ? "name" : "popular")}
            className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition hover:border-brand"
            style={{ borderColor: "var(--line)" }}
          >
            <ArrowUpDown size={15} /> {sort === "popular" ? "Popular first" : "A–Z"}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "var(--mut)" }}>No careers match “{q}”.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => <CareerCard key={c.slug} career={c} />)}
        </div>
      )}
    </div>
  );
}
