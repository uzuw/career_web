# MeroBhawishya — Free Deployment Guide

Target: get the site live at a public URL using only free tiers.

## Architecture (free stack)

| Piece            | Host                  | Why                                        |
|------------------|-----------------------|--------------------------------------------|
| Next.js frontend | **Vercel**            | Free hobby tier, auto-deploys from GitHub  |
| Express API      | **Render** (free web) | Node runtime, `render.yaml` in repo root   |
| MongoDB          | **Atlas M0**          | Free cluster, reachable from both services |
| Chat RAG service | ⚠ phase 2 (see below) | Needs ~1.5 GB RAM → doesn't fit free tiers |

The frontend talks to the API via `NEXT_PUBLIC_API_BASE` and proxies chat
through `/api/chat` (`CHAT_SERVICE_URL`), so no CORS pain.

## Step 1 — MongoDB Atlas (5 min, free)

1. Sign up at https://cloud.mongodb.com → **Build a Database → M0 (free)**.
2. Region: Singapore (closest to users + Render's singapore region).
3. Create a **database user** (password auth) — note the password.
4. **Network Access** → allow `0.0.0.0/0` (Atlas free tier has no static IPs;
   Render's egress IPs rotate).
5. **Connect → Drivers** → copy the URI, looks like:
   `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ccn?retryWrites=true&w=majority`

## Step 2 — Seed the database (from your laptop, once)

```bash
cd ~/code/vibecoding/college_choices_nepal
MONGO_URI="mongodb+srv://...cluster0.../ccn" npm run seed
```

Expected output: `Seed complete: { exams: …, colleges: 62, logos: 38, … }`.
Re-run any time the corpus changes. (Atlas M0 is 512 MB — our data is ~2 MB.)

## Step 3 — Render (API)

1. Sign up at https://render.com → **New → Blueprint** → connect
   `github.com/uzuw/career_web`. It finds `render.yaml` automatically.
2. On the create screen, paste your `MONGO_URI` secret.
3. Deploy. Free tier sleeps after 15 min idle (first request takes ~30 s to
   wake — acceptable for a student-facing site; the frontend can show a
   loading state).
4. You get `https://merobhawishya-api.onrender.com`. Verify:
   `curl https://merobhawishya-api.onrender.com/health`

## Step 4 — Vercel (frontend)

1. Sign up at https://vercel.com → **Import Project** → `uzuw/career_web`.
2. **Important:** set Root Directory to `frontend` (it's a subfolder).
3. Environment variables:
   - `NEXT_PUBLIC_API_BASE` = `https://merobhawishya-api.onrender.com`
   - `CHAT_SERVICE_URL` = leave unset for now (chat shows a graceful
     "unavailable" message until phase 2).
4. Deploy. You get `https://career-web.vercel.app` (or a custom domain later).

## Step 5 — Chat RAG (phase 2 options)

The chat service loads a local embedding model (sentence-transformers +
torch ≈ 1.5 GB RAM) — too big for Render/Vercel free tiers. Pick one:

- **A. Oracle Cloud Always Free VM** (best): 4 ARM cores / 24 GB RAM, free
  forever. Run all three services there with Docker; Vercel stays for the
  frontend. Requires card for signup verification.
- **B. Swap embeddings to a hosted free API** (e.g. HuggingFace Inference or
  Jina free tier) → drops torch entirely → the service fits Render's 512 MB
  free tier. Small refactor of `ai-service/app/rag/embeddings.py`.
- **C. Keep chat local-only** for now; the site already degrades gracefully.

## After deploys exist

- Add the public origins to `ai-service/app/main.py` ALLOWED_ORIGINS (phase 2).
- Optional: custom domain (e.g. merobhawishya.com.np ~ cheap .np or free
  Vercel subdomain).
