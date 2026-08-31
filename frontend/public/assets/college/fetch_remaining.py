#!/usr/bin/env python3
"""Fetch real logos for the remaining colleges using the CORRECT websites
from the corpus (earlier attempt guessed wrong domains).

Strategy per college (first hit wins):
  1. Parse homepage: og:image + <img> whose src/path says logo/brand.
  2. /favicon.ico and common logo paths on the same domain.
  3. Google favicon service (sz=256) — real site icon, downloaded locally.
Only keep real images (PNG/JPEG/ICO magic bytes) > 1KB. SVGs stay as the
last-resort fallback for anything still missing.
"""
import json
import os
import re
import urllib.request
import urllib.error
from urllib.parse import urljoin

HERE = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"}

# the 28 missing slugs -> correct website (from corpus)
SITES = {
    "afu-rampur": "https://afu.edu.np",
    "afu-hetauda": "https://afu.edu.np",
    "acem": "https://acem.edu.np",
    "birat": "https://biratmedicalcollege.edu.np",
    "ioe-chitwan": "https://ioe.tu.edu.np",
    "cmc": "https://cmcnepal.edu.np",
    "cms": "https://cmsnepal.edu.np",
    "cnrm-bardibas": "https://afu.edu.np",
    "cnrm-katari": "https://afu.edu.np",
    "cnrm-pakhribas": "https://afu.edu.np",
    "cnrm-tikapur": "https://afu.edu.np",
    "devdaha": "https://devdahamedicalcollege.edu.np",
    "gandaki": "https://gmcth.edu.np",
    "hcoe": "https://hcoe.edu.np",
    "kist": "https://kistmedicalcollege.edu.np",
    "kantipur-dental": "https://kantipurdental.edu.np",
    "kmc": "https://kmc.edu.np",
    "lbef": "https://lbef.edu.np",
    "lumbini": "https://lmc.edu.np",
    "mit-nepal": "https://mitcollege.edu.np",
    "nepal-ayurved": "https://namcktm.edu.np",
    "nobel": "https://nobelmedicalcollege.com.np",
    "ioe-paschimanchal": "https://ioe.tu.edu.np",
    "peoples-dental": "https://peoplesdentalcollege.edu.np",
    "scheer": "https://scheermemorial.org",
    "tu-iost": "https://iost.tu.edu.np",
    "techspire": "https://techspire.edu.np",
    "london-college": "https://www.thelondoncollege.edu.np",
}

# shared campuses (AFU x5, IOE x2) reuse one fetched logo
REUSE = {
    "afu-hetauda": "afu-rampur",
    "cnrm-bardibas": "afu-rampur",
    "cnrm-katari": "afu-rampur",
    "cnrm-pakhribas": "afu-rampur",
    "cnrm-tikapur": "afu-rampur",
    "ioe-chitwan": "ioe-paschimanchal",
}


def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=timeout).read()


def is_image(data):
    return (data[:8] == b"\x89PNG\r\n\x1a\n" or data[:3] == b"\xff\xd8\xff"
            or data[:4] == b"GIF8" or data[:6][:4] == b"\x00\x00\x01\x00"  # ico
            or data[:4] == b"RIFF")  # webp


def png_or_jpeg(data):
    return data[:8] == b"\x89PNG\r\n\x1a\n" or data[:3] == b"\xff\xd8\xff"


def save(slug, data):
    out = os.path.join(HERE, f"{slug}.png")
    with open(out, "wb") as f:
        f.write(data)
    print(f"  OK  {slug} ({len(data)} bytes)")


def candidates_from_html(html, base):
    urls = []
    m = re.search(r'<link[^>]+rel=["\'](?:shortcut )?icon["\'][^>]+href=["\']([^"\']+)', html, re.I)
    if m:
        urls.append(urljoin(base, m.group(1)))
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)', html, re.I):
        low = m.group(1).lower()
        if any(k in low for k in ("logo", "brand", "symbol", "emblem", "crest")):
            urls.append(urljoin(base, m.group(1)))
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if m:
        urls.append(urljoin(base, m.group(1)))
    return urls


def main():
    got = {}
    for slug, base in SITES.items():
        if slug in REUSE:
            continue
        out = os.path.join(HERE, f"{slug}.png")
        if os.path.exists(out):
            got[slug] = True
            continue
        data = None
        # 1) homepage parse
        try:
            html = fetch(base).decode("utf-8", "ignore")
            for img_url in candidates_from_html(html, base):
                try:
                    d = fetch(img_url)
                except Exception:
                    continue
                if png_or_jpeg(d) and len(d) > 1000:
                    data = d
                    print(f"  [{slug}] from {img_url}")
                    break
        except Exception as e:
            print(f"  [{slug}] homepage fail: {type(e).__name__}")
        # 2) favicon.ico on their domain
        if data is None:
            try:
                d = fetch(urljoin(base, "/favicon.ico"))
                if is_image(d) and len(d) > 500:
                    data = d
                    print(f"  [{slug}] from favicon.ico")
            except Exception:
                pass
        # 3) Google favicon service (256px) — download once, serve locally
        if data is None:
            try:
                dom = re.sub(r"^https?://", "", base)
                d = fetch(f"https://www.google.com/s2/favicons?domain={dom}&sz=256")
                if is_image(d) and len(d) > 500:
                    data = d
                    print(f"  [{slug}] from google favicon service")
            except Exception:
                pass
        if data:
            save(slug, data)
            got[slug] = True

    # shared-campus reuse: copy the fetched logo to the sibling slugs
    for slug, parent in REUSE.items():
        src = os.path.join(HERE, f"{parent}.png")
        dst = os.path.join(HERE, f"{slug}.png")
        if os.path.exists(src) and not os.path.exists(dst):
            import shutil
            shutil.copyfile(src, dst)
            print(f"  reuse {parent} -> {slug}")
            got[slug] = True

    print(f"\nFetched/copied {len(got)} of {len(SITES)} remaining colleges.")
    still = [s for s in SITES if s not in got]
    if still:
        print("still SVG-only:", ", ".join(still))


if __name__ == "__main__":
    main()
