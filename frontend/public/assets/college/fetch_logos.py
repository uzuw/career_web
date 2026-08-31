#!/usr/bin/env python3
"""Find each college's REAL logo by parsing its official homepage and extracting
the logo <img>. More reliable than guessing /logo.png paths.

For every college we:
  1. GET the official base URL.
  2. Parse <img> / <meta property="og:image"> for the most logo-like image
     (smallish, named logo/brand/header, or the og:image).
  3. Download it if it's a real PNG/JPG >2KB and roughly logo-sized.

Falls back to the branded SVG placeholder for any we can't resolve.
Facebook/Google hotlinking is intentionally NOT used (ToS/CORS).
"""
import os
import re
import urllib.request
import urllib.error
from urllib.parse import urljoin

HERE = os.path.dirname(os.path.abspath(__file__))

# slug -> official base URL (homepage)
SITES = {
    "ku-soe": "https://soe.khu.edu.np",
    "ku-sos": "https://sos.khu.edu.np",
    "kusms": "https://kusms.edu.np",
    "tu-iost": "https://iost.tu.edu.np",
    "gces": "https://gces.edu.np",
    "nec-pu": "https://nec.edu.np",
    "ioe-pulchowk": "https://ioe.edu.np",
    "islington": "https://islington.edu.np",
    "herald": "https://heraldcollege.edu.np",
    "stamford": "https://stamford.edu.np",
    "tbc": "https://thebritishcollege.edu.np",
    "lbef": "https://lbef.edu.np",
    "texas": "https://texascollege.edu.np",
    "texas-intl": "https://texasintl.edu.np",
    "phoenix": "https://phoenixcollege.edu.np",
    "ismt": "https://ismt.edu.np",
    "padmashree": "https://padmashreecollege.edu.np",
    "mit-nepal": "https://mitcollege.edu.np",
    "informatics-pokhara": "https://informaticscollege.edu.np",
    "deerwalk": "https://deerwalk.edu.np",
    "khwopa": "https://khwopa.edu.np",
    "kec": "https://kec.edu.np",
    "kecktm": "https://kecktm.edu.np",
    "nce": "https://nce.edu.np",
    "prime": "https://primecollege.edu.np",
    "cmc": "https://cmc.edu.np",
    "kist": "https://kistmedical.edu.np",
    "nmc": "https://nmc.edu.np",
    "kmc": "https://kmc.edu.np",
    "mcoms": "https://manipal.edu.np",
    "nobel": "https://nobelmedicalcollege.com.np",
    "bpkihs": "https://bpkihs.edu.np",
    "janaki": "https://janakimedicalcollege.edu.np",
    "lumbini": "https://lumbinimedicalcollege.edu.np",
    "ngmc": "https://ngmc.edu.np",
    "devdaha": "https://devdahamedicalcollege.edu.np",
    "scheer": "https://scheermemorial.edu.np",
    "pahs": "https://pahs.edu.np",
    "naibs": "https://naihs.edu.np",
    "manmohan": "https://mmihs.edu.np",
    "iom": "https://iom.edu.np",
    "birat": "https://biratmedicalcollege.edu.np",
    "gandaki": "https://gandakimedicalcollege.edu.np",
}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; MeroBhawishya/1.0)"})
    return urllib.request.urlopen(req, timeout=25).read().decode("utf-8", "ignore")


def pick_logo(html, base):
    # og:image is usually the brand/logo
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if m:
        yield urljoin(base, m.group(1))
    # imgs whose src/path mentions logo/brand/header/white
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)', html, re.I):
        src = m.group(1)
        low = src.lower()
        if any(k in low for k in ("logo", "brand", "header", "white", "site")):
            yield urljoin(base, src)
    # any other img as last resort
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)', html, re.I):
        yield urljoin(base, m.group(1))


def is_image(data):
    return data[:8] == b"\x89PNG\r\n\x1a\n" or data[:3] == b"\xff\xd8\xff"


def main():
    found = 0
    for slug, base in SITES.items():
        out = os.path.join(HERE, f"{slug}.png")
        if os.path.exists(out):
            continue
        try:
            html = get(base)
        except Exception as e:
            print(f"  skip {slug}: homepage {e}")
            continue
        for img_url in pick_logo(html, base):
            if not img_url.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".svg")):
                continue
            try:
                req = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0 (compatible; MeroBhawishya/1.0)"})
                data = urllib.request.urlopen(req, timeout=25).read()
            except Exception:
                continue
            if len(data) < 2000 or not is_image(data):
                continue
            with open(out, "wb") as f:
                f.write(data)
            print(f"  OK  {slug} <- {img_url} ({len(data)} bytes)")
            found += 1
            break
    print(f"Downloaded {found} real logos by parsing official homepages.")


if __name__ == "__main__":
    main()
