#!/usr/bin/env python3
"""Attempt to fetch REAL, free-licensed college logos/photos from Wikimedia Commons.

Why Wikimedia (not Facebook/Google):
- Facebook & Google images are NOT hotlink-safe (CORS/ToS block) and can't be
  scraped without auth — serving them would break and violate ToS.
- Wikimedia Commons files are freely licensed and hotlink-safe, so they are the
  legitimate source for real college imagery.

For each target college we query the Commons API for a likely file, download it,
and only keep it if it's a real image (>2KB). Existing curated PNGs are left
untouched. The branded SVG placeholder remains the fallback for any we can't find.
"""
import json
import os
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://commons.wikimedia.org/w/api.php"

# slug -> list of Commons file-title guesses (most specific first)
TARGETS = {
    "tu-iost": ["Tribhuvan University logo.png", "Tribhuvan University.svg", "Tribhuvan University.jpg"],
    "tu-central": ["Tribhuvan University logo.png", "Tribhuvan University.svg"],
    "ku-soe": ["Kathmandu University logo.png", "Kathmandu University.svg"],
    "ku-sos": ["Kathmandu University logo.png", "Kathmandu University.svg"],
    "kusms": ["Kathmandu University logo.png", "Kathmandu University School of Medical Sciences.png"],
    "gces": ["Gandaki College of Engineering and Science.png", "Gandaki College.png"],
    "gandaki": ["Gandaki Medical College.png", "Gandaki Medical College logo.png"],
    "pokhara-u": ["Pokhara University logo.png", "Pokhara University.svg"],
    "nec-pu": ["Nepal Engineering College.png", "Nepal Engineering College logo.png"],
    "ioe-pulchowk": ["Pulchowk Campus.png", "Institute of Engineering logo.png", "IOE Pulchowk.png"],
    "ioe-thapathali": ["Thapathali Campus.png", "Institute of Engineering logo.png"],
    "ioe-purwanchal": ["Purwanchal Campus.png", "Institute of Engineering logo.png"],
    "ioe-chitwan": ["Chitwan Engineering Campus.png"],
    "ioe-paschimanchal": ["Paschimanchal Campus.png"],
    "islington": ["Islington College.png", "Islington College Kathmandu.png"],
    "softwarica": ["Softwarica College.png"],
    "herald": ["Herald College Kathmandu.png"],
    "stamford": ["Stamford College.png"],
    "tbc": ["The British College.png", "The British College Kathmandu.png"],
    "lbef": ["LBEF Campus.png"],
    "texas": ["Texas College of Management and IT.png"],
    "texas-intl": ["Texas International College.png"],
    "phoenix": ["Phoenix College of Management.png"],
    "ismt": ["ISMT College.png"],
    "padmashree": ["Padmashree College.png"],
    "mit-nepal": ["MIT College Nepal.png"],
    "informatics-pokhara": ["Informatics College Pokhara.png"],
    "iom": ["Institute of Medicine Nepal.png", "Tribhuvan University logo.png"],
    "manmohan": ["Manmohan Memorial Institute of Health Sciences.png"],
    "nmc": ["Nepal Medical College.png"],
    "kmc": ["Kathmandu Medical College.png"],
    "mcoms": ["Manipal College of Medical Sciences.png"],
    "nobel": ["Nobel Medical College.png"],
    "bpkihs": ["BPKIHS logo.png", "B P Koirala Institute of Health Sciences.png"],
    "deerwalk": ["Deerwalk Institute of Technology.png"],
    "khwopa": ["Khwopa College of Engineering.png"],
    "kec": ["Kantipur Engineering College.png"],
    "kecktm": ["Kathmandu Engineering College.png"],
    "nce": ["National College of Engineering.png"],
    "prime": ["Prime College.png"],
    "janaki": ["Janaki Medical College.png"],
    "birat": ["Birat Medical College.png"],
    "cmc": ["Chitwan Medical College.png"],
    "kist": ["KIST Medical College.png"],
    "lumbini": ["Lumbini Medical College.png"],
    "ngmc": ["Nepalgunj Medical College.png"],
    "devdaha": ["Devdaha Medical College.png"],
    "scheer": ["Scheer Memorial Nursing College.png"],
    "pahs": ["Patan Academy of Health Sciences.png"],
    "naibs": ["Nepal Army Institute of Health Sciences.png"],
}


def api_get(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "MeroBhawishya/1.0 (edu bot)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def find_image_url(title):
    # resolve the actual file URL via imageinfo
    data = api_get({
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url|size|mime", "titles": "File:" + title,
    })
    pages = data.get("query", {}).get("pages", {})
    for p in pages.values():
        ii = p.get("imageinfo")
        if ii and ii[0].get("mime", "").startswith("image"):
            return ii[0]["url"], ii[0].get("width", 0), ii[0].get("height", 0)
    return None, 0, 0


def main():
    found = 0
    for slug, guesses in TARGETS.items():
        out = os.path.join(HERE, f"{slug}.png")
        # don't overwrite an existing curated PNG
        if os.path.exists(out):
            continue
        for title in guesses:
            try:
                url, w, h = find_image_url(title)
            except Exception:
                url = None
            if not url:
                continue
            # skip tiny/icon-sized files — likely not a real campus logo
            if w and h and (w < 80 or h < 80):
                continue
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "MeroBhawishya/1.0"})
                data = urllib.request.urlopen(req, timeout=30).read()
            except Exception:
                continue
            if len(data) < 2000:
                continue
            with open(out, "wb") as f:
                f.write(data)
            print(f"  OK  {slug} <- {title} ({len(data)} bytes, {w}x{h})")
            found += 1
            break
    print(f"Downloaded {found} real images from Wikimedia Commons.")


if __name__ == "__main__":
    main()
