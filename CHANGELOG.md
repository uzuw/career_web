# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); versioning is SemVer (MAJOR.MINOR.PATCH).

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
