// Image helpers for colleges.
// We use real, free-licensed images when available (college.logoUrl, typically a
// Wikimedia Commons file), and fall back to the deterministic gradient tile.
// Google is used ONLY as a search DEEP-LINK (never hotlinked) so students can
// find more photos without us scraping/serving Google-hosted images (ToS-safe).

export function googleImagesSearch(name: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(name + " Nepal college campus")}`;
}

// Best-effort Wikimedia Commons file guess from the slug (used only as a hint;
// the corpus logoUrl field is the authoritative source). Kept for reference.
export function wikimediaGuess(slug: string): string | null {
  return null;
}

// Resolve the image URL to actually render: prefer the curated logoUrl.
export function collegeImageUrl(logoUrl?: string): string | null {
  return logoUrl && /^https?:\/\//.test(logoUrl) ? logoUrl : null;
}
