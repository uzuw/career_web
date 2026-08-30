"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { collegeImage } from "@/lib/collegeImages";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function CollegeImage({ slug, name, affiliation, className }: { slug: string; name: string; affiliation?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = collegeImage(slug, affiliation);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center ${className ?? ""}`} style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)" }}>
        <span className="font-grotesk text-2xl font-bold text-white/90">{initials(name)}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      style={{ objectFit: "cover", width: "100%", height: "100%" }}
    />
  );
}
