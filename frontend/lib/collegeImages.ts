// Real college/university images sourced from Wikimedia Commons (freely licensed).
// We use the Special:FilePath redirect, which resolves to the actual upload URL and
// is stable. The <CollegeImage> component falls back to a gradient tile on error.
const FP = (file: string, w = 480) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;

// slug -> real Wikimedia image
const BY_SLUG: Record<string, string> = {
  "ioe-pulchowk": FP("Pulchowk_campus.jpg"),
  "ioe-thapathali": FP("IOE,Central_Campus.jpg"),
  "ku-sos": FP("Kathmandu_University.jpg"),
  "kusms": FP("Kathmandu_University.jpg"),
  "afu-rampur": FP("Tribhuvan_University_of_Nepal-IMG_9603.JPG"),
  "afu-hetauda": FP("Tribhuvan_University_of_Nepal-IMG_9603.JPG"),
  "bpkihs": FP("Tribhuvan_University_of_Nepal-IMG_9603.JPG"),
  "iost": FP("Tribhuvan_University_of_Nepal-IMG_9603.JPG"),
};

// affiliation -> representative real image (used when no slug-specific image)
const BY_AFFILIATION: Record<string, string> = {
  TU: FP("Tribhuvan_University_of_Nepal-IMG_9603.JPG"),
  KU: FP("Kathmandu_University.jpg"),
  PU: FP("Tribhuvan_University_of_Nepal-IMG_9603.JPG"),
  AFU: FP("Tribhuvan_University_of_Nepal-IMG_9603.JPG"),
  Other: FP("Tribhuvan_University_of_Nepal-IMG_9603.JPG"),
  Foreign: FP("Kathmandu_University.jpg"),
};

export function collegeImage(slug: string, affiliation?: string): string | undefined {
  if (BY_SLUG[slug]) return BY_SLUG[slug];
  if (affiliation && BY_AFFILIATION[affiliation]) return BY_AFFILIATION[affiliation];
  return undefined;
}
