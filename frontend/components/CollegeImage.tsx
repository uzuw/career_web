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
  //   1. curated logoUrl — set at seed time for colleges with a real
  //      local /assets/college/{slug}.png (points at that file).
  //   2. generated SVG placeholder /assets/college/{slug}.svg — exists for
  //      colleges without a real photo, so there is never a 404.
  const svg = slug ? `/assets/college/${slug}.svg` : null;
  const candidates = [logoUrl, svg].filter(Boolean) as string[];

  // index of the candidate currently shown; advances on error
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = candidates[Math.min(idx, candidates.length - 1)] ?? null;
  // ponytail: logos are wide/short — object-contain on white so the full logo
  // stays visible; SVG placeholders are 320x180 fill art so object-cover is fine.
  const isLogo = !!logoUrl && idx === 0 && src === logoUrl;

  if (src && !failed) {
    return (
      <div className={`relative h-full w-full ${className ?? ""}`}>
        <img
          src={src}
          alt={`${name} logo`}
          loading="lazy"
          className={isLogo ? "h-full w-full bg-white object-contain p-1.5" : "h-full w-full object-cover"}
          onError={() => {
            if (idx < candidates.length - 1) setIdx((i) => Math.min(i + 1, candidates.length - 1));
            else setFailed(true);
          }}
        />
        <ImagesLink name={name} />
      </div>
    );
  }

  // Last resort when every candidate failed (or no slug at all): initials tile.
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
