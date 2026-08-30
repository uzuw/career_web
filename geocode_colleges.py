#!/usr/bin/env python3
"""Geocode all colleges to real campus coordinates via Nominatim (OSM). Writes /tmp/geocode.json."""
import json, time, urllib.parse, urllib.request, sys

UA = "MeroBhawishya/1.0 (college guidance app; contact: dev@example.com)"
API = "https://photon.komoot.io/api"

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())

# Load colleges from the running API.
import subprocess
out = subprocess.run(["curl", "-s", "http://localhost:4000/api/colleges"], capture_output=True, text=True, timeout=30).stdout
colleges = json.loads(out)

results = {}
for c in colleges:
    slug = c["slug"]
    name = c.get("name", "")
    district = c.get("district", "") or ""
    # Photon: bias toward Nepal via the `&bbox=` would help but q+country works.
    query = f"{name} {district} Nepal"
    url = f"{API}?{urllib.parse.urlencode({'q': query, 'limit': 1})}"
    try:
        data = fetch_json(url)
        if data.get("features"):
            geom = data["features"][0]["geometry"]["coordinates"]  # [lng, lat]
            lng = round(float(geom[0]), 5); lat = round(float(geom[1]), 5)
            results[slug] = {"lat": lat, "lng": lng, "display": data["features"][0]["properties"].get("name",""), "query": query}
        else:
            # retry with just the name + Nepal
            url2 = f"{API}?{urllib.parse.urlencode({'q': f'{name} Nepal', 'limit': 1})}"
            data2 = fetch_json(url2)
            if data2.get("features"):
                geom = data2["features"][0]["geometry"]["coordinates"]
                lng = round(float(geom[0]), 5); lat = round(float(geom[1]), 5)
                results[slug] = {"lat": lat, "lng": lng, "display": data2["features"][0]["properties"].get("name",""), "query": query}
            else:
                results[slug] = {"lat": None, "lng": None, "display": "NO RESULT", "query": query}
    except Exception as e:
        results[slug] = {"lat": None, "lng": None, "display": f"ERR {e}", "query": query}
    time.sleep(0.3)  # Photon is more permissive; keep polite

with open("/tmp/geocode.json", "w") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Geocoded {len(results)} colleges. {sum(1 for v in results.values() if v['lat']) } succeeded.")
# Print a quick view
for slug, v in results.items():
    print(f"{slug:32} {v['lat']}, {v['lng']}  | {v['display'][:60]}")
