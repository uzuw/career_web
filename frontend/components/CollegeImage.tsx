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
      onClick={(e) => {
        e.stopPropagation();
        window.open(googleImagesSearch(name), "_blank", "noopener");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
          window.open(googleImagesSearch(name), "_blank", "noopener");
        }
      }}
      className="absolute bottom-1.5 right-1.5 cursor-pointer rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-black/75"
      title="Search more images on Google"
    >
      <ImageIcon size={11} className="inline" /> Images
    </span>
  );
}

export function CollegeImage({
  name,
  slug,
  affiliation,
  logoUrl,
  className,
}: {
  name: string;
  slug?: string;
  affiliation: string;
  logoUrl?: string;
  className?: string;
}) {
  // Resolution order (every college always ends on a real <img>):
  //   1. curated logoUrl — set in the corpus for the 17 colleges with a real
  //      local /assets/college/{slug}.png (it already points at that file).
  //   2. generated SVG placeholder /assets/college/{slug}.svg — exists for every
  //      college, so there is never a broken image or a 404.
  const svg = slug ? `/assets/college/${slug}.svg` : null;
  const candidates = [logoUrl, svg].filter(Boolean) as string[];

  // index of the candidate currently shown; advances on error
  const [idx, setIdx] = useState(0);
  const src = candidates[Math.min(idx, candidates.length - 1)] ?? null;

  if (src) {
    return (
      <div className={`relative ${className ?? ""}`}>
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => {
            // move to the next candidate; the SVG (last) always exists, so this
            // never falls through to a broken image.
            setIdx((i) => Math.min(i + 1, candidates.length - 1));
          }}
        />
        <ImagesLink name={name} />
      </div>
    );
  }

  // Only when a college has no slug at all — last-resort gradient tile.
  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ background: "linear-gradient(135deg,#334155,#64748b)" }}
    >
      <span className="font-grotesk text-2xl font-bold text-white/90">
        {name.slice(0, 2).toUpperCase()}
      </span>
      <ImagesLink name={name} />
    </div>
  );
}
