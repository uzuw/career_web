#!/usr/bin/env python3
"""Fetch real college LOGOS from each institution's OWN official website.

Rationale: the college's own domain is the legitimate owner of its logo, so
pulling the logo from there (for our card, attributed to the college) is the
most defensible real-image source. Facebook/Google hotlinking is avoided
(ToS/CORS). We only keep files that are real images (>2KB, image mime).

This is best-effort: many college sites block bots or hotlinking, and we fall
back to the branded SVG placeholder for any we can't fetch.
"""
import os
import struct
import urllib.request
from urllib.parse import urljoin

HERE = os.path.dirname(os.path.abspath(__file__))

# slug -> (official base url, list of candidate logo paths on that site)
TARGETS = {
    "ku-soe": ("https://soe.khu.edu.np", ["/static/logo.png", "/logo.png", "/assets/logo.png"]),
    "ku-sos": ("https://sos.khu.edu.np", ["/static/logo.png", "/logo.png"]),
    "kusms": ("https://kusms.edu.np", ["/static/logo.png", "/logo.png", "/assets/logo.png"]),
    "tu-iost": ("https://iost.tu.edu.np", ["/static/logo.png", "/logo.png"]),
    "gces": ("https://gces.edu.np", ["/assets/logo.png", "/logo.png", "/static/logo.png", "/images/logo.png"]),
    "nec-pu": ("https://nec.edu.np", ["/assets/logo.png", "/logo.png"]),
    "ioe-pulchowk": ("https://ioe.edu.np", ["/assets/logo.png", "/logo.png", "/static/ioe.png"]),
    "islington": ("https://islington.edu.np", ["/assets/logo.png", "/logo.png"]),
    "softwarica": ("https://softwarica.edu.np", ["/assets/logo.png", "/logo.png"]),
    "herald": ("https://heraldcollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "stamford": ("https://stamford.edu.np", ["/assets/logo.png", "/logo.png"]),
    "tbc": ("https://thebritishcollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "lbef": ("https://lbef.edu.np", ["/assets/logo.png", "/logo.png"]),
    "texas": ("https://texascollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "texas-intl": ("https://texasintl.edu.np", ["/assets/logo.png", "/logo.png"]),
    "phoenix": ("https://phoenixcollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "ismt": ("https://ismt.edu.np", ["/assets/logo.png", "/logo.png"]),
    "padmashree": ("https://padmashreecollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "mit-nepal": ("https://mitcollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "informatics-pokhara": ("https://informaticscollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "deerwalk": ("https://deerwalk.edu.np", ["/assets/logo.png", "/logo.png"]),
    "khwopa": ("https://khwopa.edu.np", ["/assets/logo.png", "/logo.png"]),
    "kec": ("https://kec.edu.np", ["/assets/logo.png", "/logo.png"]),
    "kecktm": ("https://kecktm.edu.np", ["/assets/logo.png", "/logo.png"]),
    "nce": ("https://nce.edu.np", ["/assets/logo.png", "/logo.png"]),
    "prime": ("https://primecollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "cmc": ("https://cmc.edu.np", ["/assets/logo.png", "/logo.png"]),
    "kist": ("https://kistmedical.edu.np", ["/assets/logo.png", "/logo.png"]),
    "nmc": ("https://nmc.edu.np", ["/assets/logo.png", "/logo.png"]),
    "kmc": ("https://kmc.edu.np", ["/assets/logo.png", "/logo.png"]),
    "mcoms": ("https://manipal.edu.np", ["/assets/logo.png", "/logo.png"]),
    "nobel": ("https://nobelmedicalcollege.com.np", ["/assets/logo.png", "/logo.png"]),
    "bpkihs": ("https://bpkihs.edu.np", ["/assets/logo.png", "/logo.png"]),
    "janaki": ("https://janakimedicalcollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "lumbini": ("https://lumbinimedicalcollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "ngmc": ("https://ngmc.edu.np", ["/assets/logo.png", "/logo.png"]),
    "devdaha": ("https://devdahamedicalcollege.edu.np", ["/assets/logo.png", "/logo.png"]),
    "scheer": ("https://scheermemorial.edu.np", ["/assets/logo.png", "/logo.png"]),
    "pahs": ("https://pahs.edu.np", ["/assets/logo.png", "/logo.png"]),
    "naibs": ("https://naihs.edu.np", ["/assets/logo.png", "/logo.png"]),
    "manmohan": ("https://mmihs.edu.np", ["/assets/logo.png", "/logo.png"]),
    "iom": ("https://iom.edu.np", ["/assets/logo.png", "/logo.png"]),
    "birat": ("https://biratmedicalcollege.edu.np", ["/assets/logo.png", "/logo.png"]),
}


def is_png(data: bytes) -> bool:
    return data[:8] == b"\x89PNG\r\n\x1a\n"


def main():
    found = 0
    for slug, (base, paths) in TARGETS.items():
        out = os.path.join(HERE, f"{slug}.png")
        if os.path.exists(out):
            continue  # keep existing
        for p in paths:
            url = urljoin(base, p)
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; MeroBhawishya/1.0)"})
                data = urllib.request.urlopen(req, timeout=20).read()
            except Exception:
                continue
            if len(data) < 2000:
                continue
            if not is_png(data):
                continue
            with open(out, "wb") as f:
                f.write(data)
            print(f"  OK  {slug} <- {url} ({len(data)} bytes)")
            found += 1
            break
    print(f"Downloaded {found} real logos from official college sites.")


if __name__ == "__main__":
    main()
