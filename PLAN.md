# College Choices Nepal — Implementation Plan

> **For Hermes:** Execute task-by-task via subagent-driven-development once a tech stack is chosen. This plan is product/data-first; the build phase depends on a stack decision recorded in §Pre-Build Decisions.

**Goal:** A free, Nepal-localized, trust-first web app that helps +2 (12th-grade) Science students answer "what career, what college, what next?" — using verified public data, with honest abroad-vs-Nepal framing instead of propaganda.

**Architecture:** A content/data product, not a UI product. Six linked entities (Career, Roadmap, Exam, College, Scholarship, Outcome) stored as attributed, versioned records (every fact cites `source_url` + `verified_date`). The website renders filtered views over this data; the future chatbot queries the same data. Schema is stream-agnostic so Management/Commerce slots in later with zero restructuring.

**Tech Stack:** DEFERRED (see §Pre-Build Decisions). Data contract below is stack-independent.

---

## Confirmed product decisions (from discussion)

1. **Honest abroad-vs-Nepal framing** — show real cost / ROI / risk for both paths; let data make the case. No "going abroad is bad" messaging. This is the trust moat.
2. **Science/Engineering first.** Schema stays stream-agnostic (`stream` field) so Management is a later data addition, not a rebuild.
3. **Primary user = student.** Parent mode is a secondary, plain-language view (Phase 3), not the core.
4. **Public sources only.** Every datum carries `source_url` + `verified_date`; users can flag stale/wrong data (correction pathway). Scraped data rots — attribution is non-negotiable.
5. **Entrance-exam hub:** included (Phase 1).
6. **"Am I eligible?":** delivered as a conversational feature inside the AI chatbot (Phase 4). Phase 1 still ships a filterable catalog (filter by stream / subject combo / GPA / entrance) which gives non-chat eligibility discovery; the chatbot adds nuance ("I got 3.1 in Bio, can I?").
7. **Salary/outcome:** shown inline on every Career detail page (Phase 1 data, enriched Phase 3).
8. **Alumni "person like me" stories:** final stage (Phase 4/5).
9. **Counselor directory:** free + paid, verified (Phase 3).
10. **No separate Compare view** — students compare by browsing; we do not build a side-by-side tool.
11. **Website only for now** — no offline/PWA (deferred).

---

## Data model (the central contract — Phase 0)

Six entities. Management later = new rows with `stream=Management`. Every entity has `source_urls[]` and `verified_date`.

### Career
- `slug` (e.g. `civil-engineer`)
- `title_en`, `title_np`
- `stream` (Science) · `subject_combo` (Sci+Math | Sci+Bio | either)
- `min_gpa` (float, NEB scale 0–4) · `min_marks_pct` (optional, for old grading)
- `entrance_exams[]` (slugs → Exam)
- `education_path[]` (e.g. ["+2 Sci", "B.E. Civil (4y)", "license"])
- `further_study[]` (M.E., M.Sc., abroad options)
- `skills[]`
- `abroad_vs_nepal` { `nepal_cost`, `abroad_cost_est`, `roi_nepal`, `roi_abroad`, `risk_notes` }
- `salary_np` { `range_low`, `range_high`, `currency`, `confidence` (estimate|cited), `source` }
- `source_urls[]`, `verified_date`

### Roadmap
- `career_slug`
- `steps[]` ordered: `{ type: study|exam|apply|work, label, duration, notes, source }`
- Each node cites a Nepal-specific source.

### Exam
- `slug` (ioe, iom-cee, ku, bce, …)
- `name_en/np`, `for_career[]`
- `eligibility` (stream/subject/GPA)
- `syllabus_url`, `schedule_month`, `app_fee_npr`
- `cutoff_prev` { `range`, `year`, `source` }
- `prep_resources[]` (links)
- `source_urls[]`, `verified_date`

### College
- `name`, `affiliation` (TU|KU|PU|MU|other)
- `lat`, `lng` (for Phase-2 map)
- `programs[]` (career_slugs offered)
- `tuition_range` { `low`, `high`, `currency`, `period` }
- `entrance_required` (slug or none)
- `min_eligibility` (GPA/marks + stream)
- `seats` (int, optional)
- `scholarships[]` (slugs → Scholarship)
- `website`, `source_urls[]`, `verified_date`

### Scholarship
- `name`, `eligibility` (stream/GPA/district/income), `amount_npr`, `deadline`, `provider`, `source_urls[]`, `verified_date`

### Outcome (salary/reality layer)
- `career_slug`, `salary_np` { `range_low`, `range_high`, `confidence`, `sample_size` }, `source`, `date`
- Marked `confidence: estimate` when public data is thin — never fake precision.

---

## Phase 0 — Data foundation (do before any UI)

**Objective:** Lock the schema and collect the verified Science/Engineering slice with full attribution.

### Task 0.1: Create the dataset scaffold
- Create `data/careers.json`, `data/exams.json`, `data/colleges.json`, `data/scholarships.json`, `data/outcomes.json` (or a single `data/catalog.json` — pick one shape in Pre-Build).
- Each file uses the entity schema above; include `source_urls` + `verified_date` on every record.

### Task 0.2: Build the Phase-1 Science career list (~25)
Civil, Computer, Electrical, Mechanical, Electronics&Comm, Geomatics, Aerospace (eng);
Architecture (B.Arch); MBBS, BDS, BSc Nursing, Pharmacy, BPH, Vet, Ayurveda (health);
BSc CS, Microbiology, Statistics/Data Sci, Env Sci, Agriculture, Forestry, Biotechnology.
- For each: fill `min_gpa`, `subject_combo`, `entrance_exams`, `education_path`, `salary_np` (labeled estimate if thin).

### Task 0.3: Source the entrance-exam hub
- IOE, IOM-CEE, KU, BCE (+ note banking/police/army if relevant to Science).
- Per exam: eligibility, syllabus_url, schedule_month, app_fee, `cutoff_prev` with year+source.

### Task 0.4: Collect the college vertical slice (~40–60)
- Engineering: IoE Pulchowk/Thapathali, KU, PU-WRC + major affiliates.
- Medical: IOM, KU, BPKIHS, Manipal, Kathmandu Medical, Nobel, …
- Per college: affiliation, programs, tuition_range, entrance_required, min_eligibility, website, source.

### Task 0.5: Build the correction pathway stub
- A `data/flags.json` (or form target) capturing `{ entity, id, field, note, reported_date }` so users can flag stale data. Wire UI later; schema now.

**Phase 0 acceptance:** every Phase-1 record has `source_urls` + `verified_date`; career count ≥ 25; college count ≥ 40; `flags` endpoint exists.

---

## Phase 1 — MVP (website)

**Objective:** Students can browse/filter careers, see Nepal-localized roadmaps, read salary on each career page, browse colleges, and use the entrance hub.

### Task 1.1: Career catalog (filterable)
- Filters: stream, subject_combo, min GPA slider, entrance exam.
- List → Career detail page.
- **Acceptance:** filtering by `GPA 3.2 + Sci+Math` returns only matching careers; each lists required entrance + next step.

### Task 1.2: Career detail page
- Shows education_path, skills, `abroad_vs_nepal` (honest cost/ROI/risk), `salary_np` inline (with confidence label), source links.
- **Acceptance:** every career page renders salary block + at least one source link.

### Task 1.3: Nepal-localized roadmaps
- Render `Roadmap.steps` as a vertical/horizontal flow (roadmap.sh-style) with cited nodes.
- **Acceptance:** ≥ 10 Science careers have a full roadmap; each node shows its source on hover/expand.

### Task 1.4: College catalog (list + filters)
- Filters: affiliation, program, tuition range, entrance required.
- **Acceptance:** a college page shows programs, fee range, eligibility, scholarships, source.

### Task 1.5: Entrance-exam hub
- Per exam: timeline (months), syllabus link, past cutoff (year+source), prep resources.
- **Acceptance:** IOE + IOM-CEE + KU + BCE pages live with cutoff + source.

### Task 1.6: Bilingual shell (NP + EN)
- Language toggle; all seed content authored in both. Mobile-first layout.
- **Acceptance:** toggle switches all Phase-1 copy; renders on 375px viewport.

---

## Phase 2 — Map + Scholarships

### Task 2.1: College map (vertical slice)
- Plot `College.lat/lng` on a map; filters reuse Phase 1.4.
- **Acceptance:** ≥ 40 colleges plotted; filter by program + fee updates markers.

### Task 2.2: Scholarship finder
- Filter by eligibility (stream/GPA/district/income); link to provider.
- **Acceptance:** a Management-eligible scholar filter returns only matching scholarships (future-proofing the stream field).

---

## Phase 3 — Trust & people layer

### Task 3.1: Outcome/salary enrichment
- Backfill `Outcome` records; upgrade `confidence` where public data found.
- **Acceptance:** ≥ 15 careers have cited (non-estimate) salary where possible.

### Task 3.2: Counselor directory (free/paid, verified)
- List counselors with type (free/paid), contact, verification status, scope.
- **Acceptance:** free and paid clearly tagged; verification badge shown.

### Task 3.3: Parent mode (secondary view)
- Plain-language summary per career/college: cost, safety, outcome, next step.
- **Acceptance:** parent view renders from same data, no new fields needed.

---

## Phase 4 — Chatbot + Alumni (final stage)

### Task 4.1: AI career chatbot over own data
- Flagship use case: **"Am I eligible?"** conversational — user gives stream/subject/GPA → bot queries Career+College data, explains *why* (eligible because GPA ≥ min), names next exam + date + cost.
- Bot is a front-end over the Phase-0 dataset; no hallucinated facts (answers cite sources).
- **Acceptance:** bot answers eligibility with cited reasons; refuses when data missing instead of guessing.

### Task 4.2: Alumni "person like me" stories
- Short relatable paths: "Management+2 GPA 3.0 → now X" (seeds Management content too).
- **Acceptance:** ≥ 20 stories tagged by stream + career.

---

## Risks & tradeoffs

1. **Scraped fee/cutoff decays** → `verified_date` + user flag pathway is mandatory, not optional.
2. **Salary data thin in Nepal** → label `confidence: estimate`; never invent precise figures.
3. **"All colleges of Nepal" is a trap** → ship deep vertical slice (eng+med), not a shallow national claim.
4. **No insiders → slower verification** → lean on official PDFs; cite everything so errors are traceable.
5. **Chatbot trust** → it must answer "I don't know" on missing data; one hallucinated cutoff kills credibility.

## Open questions (resolve in Pre-Build)

- Single `catalog.json` vs per-entity files? (Affects load strategy.)
- Static site (build-time JSON) vs dynamic backend? Decides whether `flags` form needs a server.
- Map library choice (Phase 2 only) — deferred.
- Hosting/domain — deferred.

## Pre-Build decisions (DEFERRED — not this plan's scope)

Tech stack is intentionally undecided. Before Phase 1 coding, choose:
- Frontend framework · data store (static JSON vs DB) · i18n approach (NP/EN) · map lib (Phase 2) · chatbot stack (Phase 4).
The data contract above is stable regardless of those choices.
