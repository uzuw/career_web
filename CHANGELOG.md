# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); versioning is SemVer (MAJOR.MINOR.PATCH).

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
