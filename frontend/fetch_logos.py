#!/usr/bin/env python3
import json, subprocess, urllib.parse, os
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
OUT = "public/assets/college"
os.makedirs(OUT, exist_ok=True)
# slug -> (filename, wiki)
TARGETS = {
    "iom": ("Tribhuvan University logo.svg", "en"),
    "tu-central": ("Tribhuvan University logo.svg", "en"),
    "ku-school-of-engineering": ("Kathmandu University logo.svg", "commons"),
    "ku-school-of-science": ("Kathmandu University logo.svg", "commons"),
    "ku-school-of-medicine": ("Kathmandu University logo.svg", "commons"),
    "ioe-pulchowk": ("Institute of Engineering, TU logo.png", "commons"),
    "afu-tu": ("Agriculture & Forestry University logo.png", "commons"),
    "bpkihs": ("BPKIHS logo.png", "commons"),
}
WIKI_HOST = {"en": "en.wikipedia.org", "commons": "commons.wikimedia.org"}
for slug, (name, wiki) in TARGETS.items():
    enc = urllib.parse.quote(name)
    api = f"https://{WIKI_HOST[wiki]}/w/api.php?action=query&titles=File:{enc}&prop=imageinfo&iiprop=url&iiurlwidth=320&format=json"
    try:
        out = subprocess.run(["curl", "-sS", "-A", UA, api], capture_output=True, text=True, timeout=30).stdout
        d = json.loads(out)
        p = list(d["query"]["pages"].values())[0]
        if "imageinfo" not in p:
            print(f"NOIMG {slug} ({name} @ {wiki})"); continue
        url = p["imageinfo"][0]["thumburl"]
    except Exception as e:
        print(f"APIERR {slug}: {e}"); continue
    dest = f"{OUT}/{slug}.png"
    try:
        r = subprocess.run(["curl", "-sS", "-A", UA, "-e", f"https://{WIKI_HOST[wiki]}/", "-o", dest, url], capture_output=True, text=True, timeout=40)
        if r.returncode == 0 and os.path.getsize(dest) > 200:
            print(f"OK {slug} ({os.path.getsize(dest)} bytes)")
        else:
            print(f"DLFAIL {slug} rc={r.returncode} size={os.path.getsize(dest) if os.path.exists(dest) else 0}")
    except Exception as e:
        print(f"DLERR {slug}: {e}")
