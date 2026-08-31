#!/usr/bin/env python3
"""Generate a branded SVG image for every college so no card is ever empty.

- Real PNGs (assets/college/{slug}.png) stay as the preferred image.
- For colleges without a PNG, we write assets/college/{slug}.svg: a clean
  gradient tile with the college initials + name + affiliation, in the brand
  palette. This guarantees a real <img> for 100% of colleges (no 404s).
"""
import json
import os
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))

PALETTE = {
    "TU": ["#1e3a8a", "#3b82f6"],
    "KU": ["#065f46", "#10b981"],
    "PU": ["#7c2d12", "#f97316"],
    "MU": ["#581c87", "#a855f7"],
    "AFU": ["#14532d", "#22c55e"],
    "Foreign": ["#92400e", "#f59e0b"],
    "Other": ["#334155", "#64748b"],
}


def initials(name: str) -> str:
    words = [w for w in name.replace("&", " ").replace("/", " ").split() if w[:1].isalpha()]
    if not words:
        return "?"
    if len(words) == 1:
        return words[0][:2].upper()
    return (words[0][0] + words[-1][0]).upper()


def svg(name: str, affiliation: str) -> str:
    a, b = PALETTE.get(affiliation, PALETTE["Other"])
    ini = initials(name)
    # escape XML
    safe = name.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{a}"/>
      <stop offset="1" stop-color="{b}"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#g)"/>
  <circle cx="160" cy="74" r="34" fill="#ffffff" opacity="0.16"/>
  <text x="160" y="86" font-family="Space Grotesk, Arial, sans-serif" font-size="38" font-weight="700" fill="#ffffff" text-anchor="middle">{ini}</text>
  <text x="160" y="138" font-family="Space Grotesk, Arial, sans-serif" font-size="15" font-weight="600" fill="#ffffff" text-anchor="middle">{safe}</text>
  <text x="160" y="160" font-family="Arial, sans-serif" font-size="11" fill="#ffffff" opacity="0.8" text-anchor="middle">{affiliation}</text>
</svg>
"""


def main():
    req = urllib.request.Request("http://localhost:4000/api/colleges")
    colleges = json.load(urllib.request.urlopen(req, timeout=30))
    n = 0
    for c in colleges:
        slug = c["slug"]
        if not slug:
            continue
        # skip if a real PNG already exists (PNG wins)
        if os.path.exists(os.path.join(HERE, f"{slug}.png")):
            continue
        with open(os.path.join(HERE, f"{slug}.svg"), "w", encoding="utf-8") as f:
            f.write(svg(c.get("name", slug), c.get("affiliation", "Other")))
        n += 1
    print(f"Generated {n} SVG placeholders (PNGs preserved). Total colleges: {len(colleges)}.")


if __name__ == "__main__":
    main()
