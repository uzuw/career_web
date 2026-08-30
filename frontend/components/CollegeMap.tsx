"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import type { College } from "@/lib/api";

const palette: Record<string, string> = {
  TU: "#1d4ed8", KU: "#0e7490", PU: "#9333ea", AFU: "#15803d", MU: "#be123c", Foreign: "#b45309", Other: "#475569",
};

const NEPAL_CENTER: [number, number] = [28.3949, 84.124];

export function CollegeMap({ colleges }: { colleges: College[] }) {
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("All");
  const [aff, setAff] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const provinces = ["All", ...Array.from(new Set(colleges.map((c) => c.province).filter(Boolean) as string[])).sort()];
  const affiliations = ["All", ...Array.from(new Set(colleges.map((c) => c.affiliation))).sort()];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return colleges.filter(
      (c) =>
        (province === "All" || c.province === province) &&
        (aff === "All" || c.affiliation === aff) &&
        (!term || c.name.toLowerCase().includes(term) || (c.district ?? "").toLowerCase().includes(term))
    );
  }, [colleges, q, province, aff]);

  // Lazy-load Leaflet only on the client to avoid SSR window errors.
  const [L, setL] = useState<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      const mod = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      // Fix default marker icon paths in bundlers.
      const icon = (mod as any).default ?? mod;
      const url = (n: string) => `https://unpkg.com/leaflet@1.9.4/dist/images/${n}`;
      icon.Icon.Default.mergeOptions({ iconRetinaUrl: url("marker-icon-2x.png"), iconUrl: url("marker-icon.png"), shadowUrl: url("marker-shadow.png") });
      if (alive) { setL(icon); setLeafletReady(true); }
    })();
    return () => { alive = false; };
  }, []);

  if (!leafletReady) {
    return <div className="bento grid h-[60vh] place-items-center text-sm" style={{ color: "var(--mut)" }}>Loading map…</div>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mut)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search colleges or districts…" className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm" style={{ borderColor: "var(--line)", background: "var(--panel)" }} />
        </div>
        <select value={province} onChange={(e) => setProvince(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
          {provinces.map((p) => <option key={p} value={p}>{p === "All" ? "All provinces" : p}</option>)}
        </select>
        <select value={aff} onChange={(e) => setAff(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
          {affiliations.map((a) => <option key={a} value={a}>{a === "All" ? "All affiliations" : a}</option>)}
        </select>
        <span className="text-sm" style={{ color: "var(--mut)" }}>{filtered.length} shown</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bento h-[60vh] overflow-hidden p-0 lg:col-span-2">
          <MapView colleges={filtered} selected={selected} onSelect={setSelected} L={L} />
        </div>
        <div className="bento h-[60vh] overflow-auto p-3">
          <div className="font-grotesk text-sm font-bold mb-2">Colleges on map</div>
          <ul className="space-y-1">
            {filtered.map((c) => (
              <li key={c.slug}>
                <button onClick={() => setSelected(c.slug)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-[var(--surface)] ${selected === c.slug ? "bg-[var(--surface)]" : ""}`}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: palette[c.affiliation ?? "Other"] ?? palette.Other }} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-[11px]" style={{ color: "var(--mut)" }}>{c.district ?? ""}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MapView({ colleges, selected, onSelect, L }: { colleges: College[]; selected: string | null; onSelect: (s: string) => void; L: any }) {
  const ref = useRef<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!L || mapRef.current) return;
    const map = L.map(ref.current).setView(NEPAL_CENTER, 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [L]);

  // (Re)draw markers when filtered list or selection changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !L) return;
    map.eachLayer((l: any) => { if (l instanceof L.Marker) map.removeLayer(l); });
    const bounds: [number, number][] = [];
    for (const c of colleges) {
      if (typeof c.lat !== "number" || typeof c.lng !== "number") continue;
      const color = palette[c.affiliation ?? "Other"] ?? palette.Other;
      const marker = L.circleMarker([c.lat, c.lng], {
        radius: c.slug === selected ? 9 : 6,
        color, fillColor: color, fillOpacity: 0.85, weight: 2,
      }).addTo(map);
      marker.bindPopup(`<div style="min-width:160px"><div style="font-weight:700;margin-bottom:4px">${c.name}</div><div style="font-size:12px;color:#555">${[c.district, c.province, c.affiliation].filter(Boolean).join(" · ")}</div><a href="/colleges/${c.slug}" style="color:#4f46e5;font-size:12px">View →</a></div>`);
      marker.on("click", () => onSelect(c.slug));
      bounds.push([c.lat, c.lng]);
    }
    if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  }, [colleges, selected, L]);

  return <div ref={ref} className="h-full w-full" />;
}
