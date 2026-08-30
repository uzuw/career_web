"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { googleImagesSearch } from "@/lib/collegeImages";

function ImagesLink({ name }: { name: string }) {
  // span (not <a>) to avoid nested-anchor when CollegeImage is inside a <Link> card.
  return (
    <span
      role="link"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); window.open(googleImagesSearch(name), "_blank", "noopener"); }}
      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); window.open(googleImagesSearch(name), "_blank", "noopener"); } }}
      className="absolute bottom-1.5 right-1.5 cursor-pointer rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-black/75"
      title="Search more images on Google"
    >
      <ImageIcon size={11} className="inline" /> Images
    </span>
  );
}

const palette: Record<string, [string, string]> = {
  TU: ["#1e3a8a", "#3b82f6"],
  KU: ["#065f46", "#10b981"],
  PU: ["#7c2d12", "#f97316"],
  MU: ["#581c87", "#a855f7"],
  AFU: ["#14532d", "#22c55e"],
  Foreign: ["#92400e", "#f59e0b"],
  Other: ["#334155", "#64748b"],
};

function initials(name: string): string {
  const words = name.replace(/[^A-Za-z ]/g, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function CollegeImage({ name, slug, affiliation, logoUrl, className }: { name: string; slug?: string; affiliation: string; logoUrl?: string; className?: string }) {
  const [errored, setErrored] = useState(false);

  // Only render an <img> when a verified logoUrl is provided (set in the corpus
  // for colleges with a downloaded /assets/college/{slug}.png). Otherwise we go
  // straight to the gradient tile — no 404/broken-image for missing files.
  const src = !errored && logoUrl ? logoUrl : null;
  const [a, b] = palette[affiliation] ?? palette.Other;

  if (src) {
    return (
      <div className={`relative ${className ?? ""}`}>
        <img
          src={src}
          alt={name}
          className="h-full w-full object-contain"
          style={{ background: `linear-gradient(135deg, ${a}22, ${b}22)` }}
          onError={() => setErrored(true)}
        />
        <ImagesLink name={name} />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className ?? ""}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      <span className="font-grotesk text-2xl font-bold text-white/90">{initials(name)}</span>
      <ImagesLink name={name} />
    </div>
  );
}
