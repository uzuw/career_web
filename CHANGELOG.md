# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); versioning is SemVer (MAJOR.MINOR.PATCH).

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
