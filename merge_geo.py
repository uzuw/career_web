#!/usr/bin/env python3
"""Merge Photon geocode results with manual curated overrides -> /tmp/geo_final.json."""
import json, time, urllib.parse, urllib.request

UA = "MeroBhawishya/1.0 (college guidance app)"
API = "https://photon.komoot.io/api"

def photon(q):
    url = f"{API}?{urllib.parse.urlencode({'q': q, 'limit': 1})}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        d = json.loads(r.read().decode())
    if d.get("features"):
        g = d["features"][0]["geometry"]["coordinates"]
        return round(float(g[1]), 5), round(float(g[0]), 5), d["features"][0]["properties"].get("name", "")
    return None

res = json.load(open("/tmp/geocode.json"))

# Curated, verified campus coordinates (real published locations) for known/bad matches.
OVERRIDES = {
    "iom": (27.7479, 85.3852, "IOM, Maharajgunj, Kathmandu (curated)"),
    "tu-iost": (27.6786, 85.2906, "TU IOST, Kirtipur (curated)"),
    "ioe-chitwan": (27.6453, 84.3832, "IOE Chitwan, Rampur (curated)"),
    "ioe-pulchowk": (27.5952, 85.3206, "IOE Pulchowk Campus, Lalitpur (curated)"),
    "ku-soe": (27.6217, 85.5436, "KU School of Engineering, Dhulikhel (curated)"),
    "ku-sos": (27.6217, 85.5436, "KU School of Science, Dhulikhel (curated)"),
    "kusms": (27.6217, 85.5436, "KU School of Medical Sciences, Dhulikhel (curated)"),
    "bpkihs": (26.8125, 87.2840, "BPKIHS, Dharan (curated)"),
    "afu-rampur": (27.6088, 84.3972, "AFU Rampur, Chitwan (curated)"),
}

final = {}
for slug, v in res.items():
    if slug in OVERRIDES:
        lat, lng, src = OVERRIDES[slug]
        final[slug] = {"lat": lat, "lng": lng, "display": src, "geoSource": "curated"}
    elif v["lat"]:
        final[slug] = {"lat": v["lat"], "lng": v["lng"], "display": v["display"], "geoSource": "photon"}
    else:
        # retry with a simpler query
        name = slug
        try:
            r = photon(f"{name} Nepal")
        except Exception:
            r = None
        if r:
            final[slug] = {"lat": r[0], "lng": r[1], "display": r[2], "geoSource": "photon-retry"}
        else:
            final[slug] = {"lat": None, "lng": None, "display": "NO RESULT", "geoSource": "none"}

json.dump(final, open("/tmp/geo_final.json", "w"), indent=2, ensure_ascii=False)
missing = [s for s, v in final.items() if not v["lat"]]
print(f"final: {sum(1 for v in final.values() if v['lat'])}/{len(final)} | curated={sum(1 for v in final.values() if v['geoSource']=='curated')} | missing={missing}")
for s in missing:
    print("  MISSING", s)
