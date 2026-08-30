# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); versioning is SemVer (MAJOR.MINOR.PATCH).

## [0.8.0] - 2026-08-30

### Added (entrance-exam hub — feature/entrance-hub)
- **Entrance exams hub** (`/entrance`): every +2 Science entrance exam as a card — eligibility, schedule, application fee, previous cutoff, prep resources, syllabus + official links. Expandable to show exactly which **careers it leads to** and which **colleges require it** (cross-linked via `Exam.forCareer` + `College.entranceRequired`). Search across exams/careers/colleges.
- Navbar adds **Exams** link.
- `lib/api.ts` `Exam`/`College` types expanded to the full API shape (nameNp, scheduleMonth, appFeeNpr, cutoffPrev, prepResources, syllabusUrl, entranceRequired).

### Notes
- Management stream still deferred.
- API contract tests: 13/13 passing.

## [0.7.0] - 2026-08-30

### Added (map, real images, alumni — feature/map-alumni-images)
- **College map** (`/map`): Leaflet + react-leaflet, markers colored by affiliation, live province/affiliation filters, side list, popup → detail. No API key (OpenStreetMap tiles).
- **Real college images**: `College.logoUrl` field; `CollegeImage` renders free-licensed Wikimedia logos (8 curated) with graceful gradient-tile fallback on 404; every card also links to a Google Images *search* (not hotlinked — ToS-safe).
- **Alumni experiences** (`/alumni`): `Alumni` model + `GET /api/alumni` (filter by career/college) + `GET /api/alumni/random`; 12 curated, attributed public snippets (Reddit/Quora communities). UI: cards + "Surprise me" random + career/college filter. Clearly labeled as individual stories, not advice.
- Navbar adds **Map** and **Alumni** links.

### Notes
- Management stream still deferred.
- Facebook dropped as an image source (no clean public API); using Wikimedia + Google search link.
- API contract tests: 13/13 passing (added alumni endpoint tests).

## [0.6.0] - 2026-08-30

### Added (frontend + corpus growth — feature/nextjs-frontend)
- **Next.js + Tailwind frontend (MeroBhawishya)**: bento layout, dark mode (`next-themes`), Lucide icons, proper navbar, real API wiring.
- Rebrand: app name **MeroBhawishya**, motto "shaping future of every nepali sprout".
- Home "Explore careers" shows a fixed trio (Computer Science, Nursing, Architecture) + View more.
- `/careers`: search, sort (popular / A–Z), ★ "Popular" badges (13 curated popular careers).
- `/colleges`: search + filter by province and affiliation; dummy gradient+initials imagery (real photos deferred).
- College detail: "Update our corpus" correction form → posts to `/api/flags` (review queue).
- `/roadmaps` + per-career roadmap steps; corpus roadmaps grown **5 → 25** (every career has a path).
- `Career` model gains `popular` boolean (indexed); `GET /api/roadmaps` list endpoint added.

### Security
- Bumped `next` 14.2.15 → **14.2.35** (patched; resolves Next.js advisory 2025-12-11).

### Notes
- Management stream still deferred (schema ready).
- API contract tests: 10/10 passing.

## [0.5.0] - 2026-08-30

### Added (foreign-affiliated + private IT colleges — feature/foreign-affiliated-colleges)
- Extended `College` model: `Affiliation` enum gains `"Foreign"`; new `foreignPartner` field records the awarding overseas university (honesty-first).
- Added `seed4.json` with **14 foreign-affiliated IT colleges** (Islington→London Met, Softwarica→Coventry, Herald→Wolverhampton, TBC→Leeds Beckett, ISMT→Sunderland, Informatics Pokhara→London Met, LBEF/Techspire→APU Malaysia, Texas/Phoenix→Lincoln Malaysia, Padmashree→Nilai Malaysia, MIT→Westcliff USA, Stamford, The London College) + **5 private TU-affiliated IT colleges** (Deerwalk, Prime, Texas Int'l).
- Added `college-admission` exam record (no central entrance; +2 grades + college selection; UGC equivalency noted) so foreign/private IT colleges link coherently to `bsc-cs`.
- `bsc-cs` now offered by 19 colleges (was 2) — directly addresses the "which IT college" confusion with foreign-vs-local options side by side.
- Corpus test adds 2 assertions: ≥10 foreign colleges each declaring `foreignPartner`; `bsc-cs` offered by both Foreign and TU-private colleges.

### Notes
- Fees are total-program estimates (NPR) from public guides; marked estimate, verify per college.
- Management stream still deferred. Foreign-affiliated records are Science/IT only so far.

## [0.4.0] - 2026-08-30

### Added (map orphan careers to colleges — feature/map-orphan-careers)
- Added `seed3.json` mapping the 6 previously-unlinked Science careers to real colleges:
  - **KU School of Science** (Dhulikhel): Biotechnology, Environmental Science, Data Science/AI, B.Sc. CS.
  - **TU IOST central campuses** (Kirtipur): Microbiology, Statistics, Environmental Science (new `tu-iost-entrance` exam).
  - **KUSMS** (KU) + KU medical affiliates (Nobel, Birat, KMC, Devdaha, Nepalgunj, Lumbini, KIST): BPT.
  - **Gandaki College of Engineering & Science** (PU, Pokhara): Civil, Computer, Environmental Science.
- Seed script upgraded: `upsertColleges` now **merges** `programs` via `$addToSet` so supplemental seed files extend existing colleges without re-listing all programs; loads seed.json + seed2.json + seed3.json.
- Fixed a data bug: Birat Medical College lacked coords; now a full cited record.
- Corpus test strengthened: all 25 Science careers must link to ≥1 offering college (known-orphan allowlist removed). Geo-bounds test now validates every college.

### Notes
- Management stream still deferred (per user).
- Microbiology/Statistics are mapped to TU central IOST hub; specific constituent campuses (Amrit, Tri-Chandra, St. Xavier's) can be added later as individual records.

## [0.3.0] - 2026-08-30

### Added (grow science corpus — feature/grow-science-corpus)
- Expanded Science corpus via `src/seed/data/seed2.json` (loaded alongside seed.json by the seed script):
  - **6 new careers**: B.Sc. Fisheries, BPT (Physiotherapy), Biotechnology, Environmental Science, Data Science/AI, Statistics.
  - **19 new colleges**: AFU Central Campus Rampur + Hetauda Forestry + 4 Colleges of Natural Resource Management (Katari, Pakhribas, Tikapur, Bardibas); full medical-college list with verified affiliations — KIST, Gandaki, Janaki, NAIHS, Nepalgunj, Devdaha, Lumbini, Kantipur Dental, Scheer, People's Dental, Manmohan, Nepal Ayurved; Nepal Engineering College (PU).
  - **AFU entrance exam** linking agriculture/forestry/vet/fisheries careers.
  - **3 new roadmaps** (BPT, Data Science/AI, Agriculture) + 2 outcome records.
- Seed script now merges `seed.json` + `seed2.json` (idempotent upserts).
- Corpus test (`src/seed/corpus.test.ts`, 7 tests) asserts size + integrity: ≥25 careers, ≥35 colleges, AFU + full medical list present, AFU exam linked, new roadmaps present, and a tracked allowlist of careers not yet mapped to specific colleges (microbiology, bpt, biotech, env sci, data sci, statistics) — flagged for future per-campus verification rather than fabricated links.

### Notes
- Management stream still deferred (per user).
- 6 careers exist but lack verified offering-college mapping; tracked as known gaps, not asserted.

## [0.2.0] - 2026-08-30

### Added (backend scaffold — feature/backend-scaffold)
- Node + TypeScript + MongoDB (Mongoose) backend with Express.
- Six Mongoose models carrying `sourceUrls` + `verifiedDate` and a `stream` field for future Management support: Career, Exam, College, Scholarship, Outcome, Roadmap — plus a Flag model for the user correction pathway.
- REST API (`/api/...`): careers, colleges, exams, scholarships, roadmaps, eligibility, flags.
- Core **"am I eligible?"** service (`src/services/eligibility.ts`): given stream/subjectCombo/GPA/budget/location, returns eligible careers + matching colleges with explained reasons. This is the logic the future chatbot will use.
- Seed pipeline (`npm run seed`) loading curated, **cited public data**: 3 entrance exams (IOE, MECEE-BL, KU), 19 Science careers, 21 engineering/medical colleges, 3 scholarships, 3 outcomes, 2 roadmaps. Every record cites a source URL.
- Honest abroad-vs-Nepal fields on each career (cost/ROI/risk), and salary/outcome inline on career records.
- Vitest tests (6 passing) covering eligibility logic + seed-data integrity (sources present, Nepal geo bounds).
- Local MongoDB 7 via Docker (`ccn-mongo`, port 27017).
- `.env.example` for config.

### Notes
- AI/chatbot deferred until the corpus is richer (per plan Phase 4).
- Frontend deferred until backend + data are confirmed (per plan Phase 1).

## [0.1.0] - 2026-08-30

### Added
- Initial project scaffold.
- `PLAN.md` — product/data plan: 6-entity data model, phased roadmap (Phase 0–4), honest abroad-vs-Nepal framing, Science-first stream-agnostic schema.
- `IDEA.md` — raw problem brief from the user.
- `README.md` — entry point pointing to PLAN.md.
- Repo initialized on `main` with `.gitignore` (node/python/OS/secret safe), `VERSION`, and this `CHANGELOG.md`.
- Branch policy: `main` is protected; feature/refactor/fix work happens on descriptive branches and is merged only after review + explicit approval.

### Notes
- Tech stack intentionally undecided (deferred per product discussion). Data contract in PLAN.md is stack-independent.
- All data records will carry `source_urls` + `verified_date`; a user correction-flag pathway is planned (Phase 0).
