#!/usr/bin/env python3
# ponytail: naive Wikipedia thumbnail fetcher, per-slug cache, skip if exists. Upgrade to Wikidata/Commons search if coverage matters.
import json, os, time, sys, urllib.request, urllib.parse

UA = "CollegeChoicesNepal/1.0 (https://collegechoicesnepal.example) Python/3.14"
OUT = "frontend/public/assets/college"
os.makedirs(OUT, exist_ok=True)

SEED_FILES = ["src/seed/data/seed.json","src/seed/data/seed2.json","src/seed/data/seed3.json","src/seed/data/seed4.json","src/seed/data/seed5.json","src/seed/data/seed6.json"]
seen={}
for f in SEED_FILES:
    if not os.path.exists(f): continue
    data=json.load(open(f, encoding="utf-8"))
    for c in data.get("colleges",[]):
        if "name" not in c: continue
        slug=c["slug"]
        if slug not in seen:
            seen[slug]=c

STOPWORDS={"the","institute","college","university","school","campus","kathmandu","nepal","medical","central","national","engineering","academy","memorial","technology","management","science"}

def main_token(name):
    words=[w.strip("(),").lower() for w in name.split() if w.strip("(),").lower() not in STOPWORDS]
    if words:
        # prefer first distinctive word with len>3
        for w in words:
            if len(w)>=4:
                return w
        return words[0]
    # fallback first word
    return name.split()[0].lower().strip("(),") if name.split() else ""

def fetch_thumb(title, tries=2):
    for attempt in range(tries):
        try:
            enc=urllib.parse.quote(title)
            url=f"https://en.wikipedia.org/w/api.php?action=query&titles={enc}&prop=pageimages&pithumbsize=400&format=json&pilicense=any"
            req=urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                d=json.loads(r.read().decode())
                page=list(d["query"]["pages"].values())[0]
                if 'missing' in page:
                    return None
                return page.get("thumbnail",{}).get("source")
        except Exception as e:
            msg=str(e)
            is429='429' in msg or 'Too Many' in msg
            print(f"    thumb 429 {title} retry" if is429 else f"    thumb err {title}: {e}", file=sys.stderr)
            if is429:
                time.sleep(2+attempt*2)
                continue
            time.sleep(0.5)
            return None
    return None

def search_titles(query):
    try:
        q=urllib.parse.quote(query)
        url=f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={q}&srlimit=3&format=json"
        req=urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as r:
            d=json.loads(r.read().decode())
            return [h["title"] for h in d["query"]["search"]]
    except Exception as e:
        print(f"  search err {query}: {e}", file=sys.stderr)
        time.sleep(1)
        return []

def download(url, dest):
    try:
        req=urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as f:
            f.write(r.read())
        return os.path.getsize(dest) > 800
    except Exception as e:
        print(f"  dl err {url}: {e}", file=sys.stderr)
        if os.path.exists(dest):
            try: os.remove(dest)
            except: pass
        return False

ok=skip=noimg=fail=0
for slug in sorted(seen):
    name=seen[slug]["name"]
    dest=os.path.join(OUT, f"{slug}.png")
    if os.path.exists(dest) and os.path.getsize(dest) > 800:
        # print(f"SKIP {slug} exists {os.path.getsize(dest)}")
        skip+=1
        continue
    token=main_token(name)
    # candidates: exact name then name without parens, then first segment before comma
    cands=[]
    for cand in [name, name.split('(')[0].strip(), name.split(',')[0].strip()]:
        if cand and cand not in cands:
            cands.append(cand)
    thumb=None
    tried=set()
    found_via=None
    for cand in cands:
        if thumb: break
        if cand in tried: continue
        tried.add(cand)
        # try exact title
        th=fetch_thumb(cand)
        time.sleep(0.7)
        if th:
            thumb=th
            found_via=cand
            break
        # search fallback
        titles=search_titles(cand)
        time.sleep(0.7)
        for t in titles:
            if t in tried: continue
            # filter: must contain main token or be exact cand
            low=t.lower()
            if token and token not in low and cand.lower() not in low:
                continue
            tried.add(t)
            th=fetch_thumb(t)
            time.sleep(0.7)
            if th:
                thumb=th
                found_via=f"{cand} -> {t}"
                break
        if thumb: break

    if thumb:
        if download(thumb, dest):
            print(f"OK {slug:30} {name:45} via {found_via} ({os.path.getsize(dest)} bytes)")
            ok+=1
        else:
            print(f"FAIL dl {slug} {name}")
            fail+=1
    else:
        print(f"NOIMG {slug:30} {name}")
        noimg+=1
    time.sleep(0.8)

print(f"\nDone: OK={ok} SKIP={skip} NOIMG={noimg} FAIL={fail} total={len(seen)}")
