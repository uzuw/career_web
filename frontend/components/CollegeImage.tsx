"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { collegeImageUrl, googleImagesSearch } from "@/lib/collegeImages";

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

export function CollegeImage({ slug, name, affiliation, logoUrl, className }: { slug?: string; name: string; affiliation?: string; logoUrl?: string; className?: string }) {
  const [a, b] = palette[affiliation ?? "Other"] ?? palette.Other;
  const src = collegeImageUrl(logoUrl);
  const [failed, setFailed] = useState(!src);

  if (!src || failed) {
    return (
      <div className={`relative flex items-center justify-center ${className ?? ""}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
        <span className="font-grotesk text-2xl font-bold text-white/90 drop-shadow">{initials(name).toUpperCase()}</span>
        <a href={googleImagesSearch(name)} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur hover:bg-black/50">
          <ImageIcon size={11} /> Images
        </a>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
      <a href={googleImagesSearch(name)} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur hover:bg-black/50">
        <ImageIcon size={11} /> Images
      </a>
    </div>
  );
}
