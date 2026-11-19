# MemoryLens

README prose word count: 589 (headings and link labels included; fenced setup code and this count line excluded).

## Status

An explainable study-assistant prototype for the University of Birmingham Intelligent Interactive Systems assignment. It continues the research question in *Explaining Memory Use in Personal AI Assistants*: can source and selection explanations help people recognise and correct inappropriate memory use?

JavaScript rules select structured preferences, explain their actual use and regenerate fixed template plans after correction. All demo notes, source excerpts and browser exports are fictional. The application invokes no LLM, paid API, API key or external service. Version: **1.0.1-local**, a local-browser prototype. The assessed application is [commit cd043d657fac96554ac00d38734a6d5d13b0c37b](https://github.com/shuaigedzr/MemoryLens/commit/cd043d657fac96554ac00d38734a6d5d13b0c37b). The later evidence revision updates documentation and captures for the same application. No version tag or GitHub Release is claimed.

Repository: https://github.com/shuaigedzr/MemoryLens  
README: https://github.com/shuaigedzr/MemoryLens/blob/main/README.md

## Run

No application packages or installation are required. Use desktop Chrome with JavaScript and browser storage enabled. Python 3 serves static files only:

```bash
git clone https://github.com/shuaigedzr/MemoryLens.git
cd MemoryLens
python3 -m http.server 8768 --bind 127.0.0.1
```

Open http://127.0.0.1:8768/. Keep the server running; Control-C stops it. Keep a stable address because data belongs to that browser origin. Choose a fictional scenario, Load demo and confirm replacement, then Suggest a plan. Export before replacing data you want to keep. After refresh, request a new plan from saved memory.

A explains selected records, source excerpts and exclusions. B corrects quiet to collaborative, regenerates, persists across refresh and supports undo. C holds conflicting, old or unsupported notes; confirm/correct, ignore for one request or cancel. [Browser results](docs/MANUAL_TESTS.md) record the executed paths.

## Tests and evidence

Node 20+ is required only for development checks; no npm install:

```bash
node scripts/verify.cjs
node scripts/replay.cjs
node --check app.js
node --check engine.js
```

[Automated results](evidence/automated-tests.txt) record the actual rerun, runtime and exit status. [Source hashes](evidence/source-hashes.json) identify tested application bytes. [Engine replay](evidence/engine-replay.json) uses simulated Web Storage. Separately, Codex operated actual Mac Chrome on 17 November 2026 to check A/B/C, refresh persistence, removal/undo, export, keyboard dialog controls and a 390-pixel layout. [Evidence index](evidence/browser/README.md) distinguishes genuine baseline/final screenshots and actual exports.

These checks establish functional behaviour, not participant outcomes or improved understanding, trust or learning. Browser restart durability, comprehensive accessibility and browser storage failure injection were not established; failure injection was engine-only.

## Architecture and limits

HTML/CSS, classic JavaScript and localStorage. [Architecture](docs/ARCHITECTURE.md) and [editable system diagram](docs/architecture.svg) show implemented flows, fictional fixtures and planned research. Two preference kinds and three tasks are supported. Thirty days is an explicit demo review policy, not validated expiry.

Remove immediately excludes a record. One disclosed recovery snapshot supports undo across refresh; clearing it or another memory change discards it. Existing exports remain separate. Bounded events contain IDs/outcomes rather than copied quotes or generated plans. There are no embeddings or hidden profile copies. Storage is local, unencrypted and removable; import and synchronisation are unfinished. Stale-tab checks do not make simultaneous writes atomic.

## Development and AI assistance

[Development record](docs/DEVELOPMENT.md) explains alternatives, the topic-isolation regression and browser-discovered feedback fixes. [AI disclosure](docs/AI_ASSISTANCE.md) separates the student's problem/scenarios and earlier manual checks from ChatGPT/Codex-assisted code, tests, writing and figures. Checks included reference verification, code review, engine tests, actual browser operations and exported state. In a separate 19 November Mac Chrome check, the student personally exercised the conflict, one-request ignore and saved confirmation paths in C. ChatGPT recommended retaining both paths, while noting the burden of repeated prompts. The student’s design judgment remains pending. The revised storyboard screenshots were captured by Codex.

## Publication and accompanying material

[Publication audit](docs/PUBLICATION_AUDIT.md) records the reviewed standalone snapshot and history boundary. The original local history, source-material inventories, assessment feedback, academic identifiers and identified Word/PDF report are not published. The submission report is supplied privately and links to this code. [Revised storyboards](docs/storyboards/revision-2026-11-19/) use actual screenshot crops; [rubric audit](docs/ACCEPTANCE.md) maps evidence to the assessment criteria. No Canvas submission is performed by publishing this repository.
