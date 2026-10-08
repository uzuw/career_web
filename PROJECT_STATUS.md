# MeroBhawishya — Project Status

> Nepal-localized, trust-first career & college guidance for +2 Science graduates.
> **Repo:** `github.com/uzuw/career_web` (private) · **Branch:** `main` · **Latest:** `v0.9.11`
> **Doc date:** 2026-09-15

---

## 1. Status at a glance

| Area | State |
|---|---|
| Backend API | ✅ Built, seeded, running locally (`:4000`) |
| Frontend | ✅ Built — 10 routes, dark/light theme, running locally (`:3000`) |
| Chat RAG | ✅ Built & working locally (`:8000`) — ⚠️ not yet deployable on free tier |
| Data corpus | ✅ 62 colleges, 25 careers, 6 exams, 25 roadmaps, 12 alumni |
| College imagery | ✅ 100% of cards show an image (37 real, 25 branded placeholder) |
| Deployment configs | ✅ `render.yaml` + `DEPLOY.md` committed |
| Deployment execution | ⏳ Blocked on account creation (Atlas / Render / Vercel) |
| Local servers | ⏸️ **Stopped** (cleanly, per request) |

---

## 2. The problem

Nepal has no trustworthy, single place where a +2 Science graduate can answer:
*"What can I study, where, what does it cost, am I eligible, and what does it pay?"*

Data is scattered across college notice boards, Facebook posts, and word of mouth.
Comparable tools exist in India, the US, and the EU — Nepal lacks the local equivalent.

**MeroBhawishya's stance:** show the honest Nepal-vs-abroad picture. Data makes the
case; no propaganda, no "study abroad is always better."

---

## 3. What's built

### Data & API (Node + TypeScript + Express + Mongoose + MongoDB)

8 REST routers, all read endpoints public:

| Endpoint | Purpose |
|---|---|
| `/api/colleges` , `/api/colleges/:slug` | College corpus + detail |
| `/api/careers` , `/api/careers/:slug` | Career paths + salary/outcome layer |
| `/api/exams` , `/api/exams/:slug` | Entrance exams hub |
| `/api/scholarships` , `/api/scholarships/:slug` | Scholarship listings |
| `/api/roadmaps` , `/api/roadmaps/:careerSlug` | Step-by-step career roadmaps |
| `/api/eligibility` (GET + POST) | "Am I eligible?" rules engine |
| `/api/alumni` , `/api/alumni/random` | "Person like me" stories |
| `/api/flags` (GET + POST) | **User-correction loop** — users report wrong data |
| `/health` | Health check |

**Trust design:** every data point carries `sourceUrls` + `verifiedDate`, and the
user-correction flag endpoint exists so wrong data gets reported, not silently trusted.

### Frontend (Next.js 14 + Tailwind + next-themes + Lucide)

| Route | What it does |
|---|---|
| `/` | Home — hero, featured careers, **Popular colleges**, stats |
| `/colleges` | Filterable college browser (62 entries, images, affiliation, location) |
| `/colleges/[slug]` | College detail |
| `/careers` | Career browser |
| `/careers/[slug]` | Career detail — includes salary/outcome layer |
| `/entrance` | Entrance-exam hub (v0.8.0) |
| `/eligibility` | Eligibility wizard (static page; also lives in the chatbot) |
| `/map` | Leaflet map — all campuses, fly-to + satellite toggle, share links |
| `/roadmaps` | Career roadmaps |
| `/alumni` | Alumni stories browser |

12 components incl. `CollegeCard`, `CollegeImage`, `CollegeMap`, `ChatPanel`,
`EligibilityWizard`, `EntranceHub`, `AlumniBrowser`, `CorpusUpdateButton`.

### Chat RAG service (FastAPI + LangChain + Chroma + OpenRouter)

- Retrieval-augmented answers **grounded in the corpus**, with citations
- **Streaming** SSE responses end-to-end (Python → Next proxy → React tokens)
- Markdown rendering (`react-markdown` + `remark-gfm`)
- **Security hardened:** rate limiting, input validation, no upstream error leakage,
  tightened CORS, localhost bind by default, anti-injection prompt
- Prompt hardened against fabricated figures / empty citations
- Proxied through Next.js `/api/chat` → `CHAT_SERVICE_URL` (no CORS pain)

---

## 4. Data corpus

6 seed files (`src/seed/data/seed.json` → `seed6.json`), merged on seed:

| Entity | Count |
|---|---|
| Colleges | **62** |
| Careers | 25 |
| Roadmaps | 25 |
| Alumni stories | 12 |
| Entrance exams | 6 |
| Outcomes (salary) | 5 |
| Scholarships | 3 |

Corpus is **stream-agnostic** — Management stream can slot in later with zero rebuild.
(Science/Engineering only for now, by explicit decision.)

---

## 5. College imagery — the honest numbers

Every college card shows an image. No broken tiles anywhere.

| Category | Count |
|---|---|
| Colleges with a **real** image (official site / Wikimedia) | **37** |
| Colleges on a **branded SVG placeholder** (generated, affiliation-colored) | **25** |
| Completely imageless | **0** |

Included scripts in `frontend/public/assets/college/`:
- `fetch_wikimedia.py` — free-licensed Wikimedia Commons logos
- `fetch_official.py` — logos from colleges' own domains
- `fetch_logos.py` — parses each college homepage for its real `<img>` logo
- `fetch_remaining.py` — correct-domain scraper with favicon fallback (idempotent, resumable)
- `generate_svgs.py` — branded SVG for any college without a real photo

**Note on "get them from Facebook/Google":** not done, deliberately. Those images
aren't hotlink-safe (CORS/ToS, no auth), so real imagery was sourced from each
college's **own website** (the legitimate owner) and Wikimedia Commons instead.
Most Nepali colleges don't publish a free-license logo — hence the 25 placeholders.
Rerunning `fetch_remaining.py` can still fill some of them.

---

## 6. Architecture

```
                    ┌──────────────────────────┐
   Browser  ───────▶│  Next.js 14 frontend     │
                    │  (Vercel, free)          │
                    └───────┬──────────┬───────┘
                            │          │  /api/chat (server-side proxy)
                   REST     │          ▼
                            │   ┌─────────────────────┐
                            │   │ FastAPI RAG service │
                            │   │ Chroma + OpenRouter │
                            │   └─────────────────────┘
                            ▼
                    ┌──────────────────────────┐
                    │  Express API             │
                    │  (Render free)           │
                    └───────────┬──────────────┘
                                ▼
                    ┌──────────────────────────┐
                    │  MongoDB Atlas M0        │
                    └──────────────────────────┘
```

**Stack (locked):** Node + TypeScript + Express + Mongoose + MongoDB ·
Next.js + Tailwind + next-themes + Lucide · FastAPI + LangChain + Chroma.
**Design:** subtle indigo gradient (`#4f46e5 → #6366f1`), Space Grotesk +
Plus Jakarta Sans, grid backdrop, quiet chrome.

---

## 7. Version history

| Version | What landed |
|---|---|
| v0.8.0–v0.8.7 | Map + real images + alumni; entrance hub; local images; map fly/satellite; zoom cap; share links; geocoded coords; hydration fix; image fallback |
| v0.9.0–v0.9.2 | Chat RAG scaffold → install fixes → **security hardening** (rate limit, validation, CORS, no leakage) |
| v0.9.3–v0.9.5 | OpenRouter provider fix + re-ingest 139 docs; **streaming SSE**; **Markdown** rendering + prompt hardening |
| v0.9.6–v0.9.7 | Playful hand-drawn home interactions → **reverted** (restored clean professional look) |
| **v0.9.8** | Branded SVG for every imageless college — 100% image coverage, zero 404s |
| **v0.9.9** | **Popular colleges** section on home + 19 real logos scraped from official sites (17 → 34) |
| **v0.9.10** | 3 more real logos via correct-domain scraper; removed 3 junk assets (6 MB photo, duplicate placeholders) |
| **v0.9.11** | `render.yaml` + `DEPLOY.md`; **fixed a hard deploy blocker** — `tsc` was failing on seed.ts, which would have broken the Render build |

Repo maintains a **feature-branch → PR → merge → tag** flow throughout.

---

## 8. Deployment — the plan and where it stands

### Target (all free)

| Piece | Host | Cost |
|---|---|---|
| Next.js frontend | Vercel (Hobby) | Free |
| Express API | Render (free web service, `render.yaml`) | Free |
| MongoDB | Atlas M0 | Free |
| Chat RAG | ⏳ deferred to phase 2 | — |

### Why chat is deferred

The RAG service loads local sentence-transformers embeddings + torch ≈ **1.5 GB
RAM**. No free tier provides that (Render/Vercel free ≈ 512 MB). Options when ready:

- **A.** Oracle Cloud Always Free VM (4 cores / 24 GB, free forever) — run everything there
- **B.** Swap to a hosted free embedding API → drops torch → then it fits Render free
- **C.** Leave chat local-only (site already degrades gracefully with "guidance service unavailable")

### What's already done

- ✅ `render.yaml` — one-click Render Blueprint (Node 20, Singapore, `/health` check, `MONGO_URI` secret)
- ✅ `DEPLOY.md` — full runbook in-repo
- ✅ Production build **passes** (`npm run build` → exit 0) — this was a real blocker, now fixed

### Remaining (needs account creation — ~15 min of clicking)

1. **Atlas** → M0 cluster (Singapore) → DB user → network `0.0.0.0/0` → copy URI
2. **Seed once from laptop:** `MONGO_URI="mongodb+srv://..." npm run seed`
3. **Render** → New → Blueprint → `career_web` → paste `MONGO_URI` → deploy
4. **Vercel** → Import `career_web` → **Root Directory = `frontend`** → env `NEXT_PUBLIC_API_BASE=https://<render-url>` → deploy

---

## 9. Known gaps / not done

| Item | Status |
|---|---|
| Chat RAG deployed publicly | ⏳ needs phase-2 decision (A/B/C above) |
| 25 colleges on SVG placeholder | ⚠️ real photos scarce; rerun `fetch_remaining.py` for more |
| Management stream | ⏳ deferred by decision; schema already stream-agnostic |
| Counselor directory (free/paid) | ❌ not built |
| Offline mode | ❌ deferred (website-only for now) |
| Separate compare view | ❌ deliberately not built |
| Custom domain | ❌ not set up (free Vercel subdomain for now) |

---

## 10. Running locally

```bash
# 0. Database (docker)
docker start ccn-mongo

# 1. API  → http://localhost:4000
cd ~/code/vibecoding/college_choices_nepal
npm install && npm run seed && npm run dev

# 2. Frontend → http://localhost:3000
cd frontend && npm install && npm run dev

# 3. Chat RAG → http://localhost:8000
cd ai-service && source .venv/bin/activate && uvicorn app.main:app --port 8000
```

**Gotcha:** never run `npm run build` and `npm run dev` against the same `.next`
folder — the dev server then reads production chunk IDs and dies with
`Cannot find module './xxx.js'`. Fix: kill the dev server, `rm -rf .next`, restart dev.

---

## 11. Key decisions (and why)

- **Trust-first over hype** — every datum carries its source + verified date; users
  can flag wrong data. Honest abroad-vs-Nepal framing, no propaganda.
- **Science/Engineering first** — Management deferred, but schema is stream-agnostic
  so it slots in later without a rebuild.
- **No Facebook/Google image scraping** — not hotlink-safe or ToS-clean. Used
  colleges' own sites + Wikimedia; placeholders where nothing free exists.
- **Reverted playful home design** — user judged it unprofessional; restored the
  clean "atlas" look (v0.9.7).
- **Free-tier deployment** — student project; the only real casualty is the chat
  service, which legitimately needs more RAM than free tiers give.
