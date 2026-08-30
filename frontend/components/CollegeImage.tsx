"use client";

// Dummy college imagery: a deterministic gradient tile with the college initials.
// (Replaces real photos for now — no external requests.)

const palette: Record<string, [string, string]> = {
  TU: ["#1d4ed8", "#6366f1"],
  KU: ["#0e7490", "#22d3ee"],
  PU: ["#9333ea", "#6366f1"],
  AFU: ["#15803d", "#84cc16"],
  MU: ["#be123c", "#fb7185"],
  Foreign: ["#b45309", "#f59e0b"],
  Other: ["#475569", "#94a3b8"],
};

function initials(name: string) {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "");
}

export function CollegeImage({ name, affiliation, className }: { slug?: string; name: string; affiliation?: string; className?: string }) {
  const [a, b] = palette[affiliation ?? "Other"] ?? palette.Other;
  return (
    <div
      className={`flex items-center justify-center ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      <span className="font-grotesk text-2xl font-bold text-white/90 drop-shadow">{initials(name).toUpperCase()}</span>
    </div>
  );
}
