# Browser acceptance results

Executed 17 November 2026, approximately 22:10-22:20 Europe/London. Operator: Codex through Computer Use on the user's Mac Chrome. The already-running Python server served this actual folder at http://127.0.0.1:8768/. This was an agent walkthrough of fictional fixtures, not independent usability research. Original state was exported to the user's Downloads and copied outside the distributable package before fixture replacement.

The initial 1.0.0-local application was exercised first. Feedback-only fixes produced 1.0.1-local, followed by the final checks below. Full-page screenshots are real browser captures, not generated mock-ups. Source-hashes.json identifies the final code. Engine-only cases are explicitly separate.

| ID | Executed action and observed result | Evidence |
|---|---|---|
| A1 | Load A and request full plan: quiet and 25 minutes; env/dur used, other excluded | Final-A-plan.jpg, Final-A-source-trace.jpg |
| A2 | Expand original source and selection trace: fictional source, date, exact eligibility rule and unrelated-topic exclusion visible | Final-A-source-trace.jpg |
| A3 | Change task to Focus session only and generate: duration used; environment not needed | Final-A-session-only.jpg |
| B1 | Load B, request, correct environment to collaborative and save: recommendation changes | actions.json; B-before.jpg baseline; Final-B-persistence.jpg |
| B2 | Reload real page, request again and open source: collaborative retained; old quiet quote and new correction both visible | Final-B-persistence.jpg |
| B3 | Undo after refresh: quiet value and plan return | Final-B-undo.jpg |
| C1 | Load conflict and request: no personalised plan, two conflicting values and controls visible | Final-C-conflict.jpg |
| C2 | Ignore environment: generic location, personalised 25 minutes; fresh request again blocks | Final-C-ignore.jpg; actions.json |
| C3 | Confirm collaborative: other environment superseded, plan changes; undo restores conflict; cancel issues no plan | Final-C-dialog.jpg, Final-C-resolved.jpg, Final-C-cancel.jpg; actions.json |
| C4 | Load 65-day stale fixture: 30-day policy holds it; explicit confirmation permits plan and retains old source date | Final-C-stale.jpg, Final-C-stale-confirmed.jpg |
| C5 | Missing evidence holds output; baseline source disclosure says no excerpt; explicit confirmation adds current source | Final-C-evidence.jpg; C-missing-source.jpg, C-missing-confirmed.jpg; actions.json |
| D1 | Cancel remove leaves note; accept remove excludes it; refresh retains absence; undo after refresh restores it | Final-D-deleted-reload.jpg, Final-D-restored.jpg; actions.json |
| D2 | Remove again, clear recovery, export: undo disabled and exported JSON contains only dur, undo=null | Final-D-cleared.jpg, Final-D-export.json |
| D3 | Enter opens editor; Tab and Shift-Tab move focus; Escape cancels; Enter on Save persists | D-keyboard-focus.jpg and .txt (baseline) |
| D4 | 390x844 viewport: readable single column and wrapped controls; temporary viewport restored | Final-narrow-390.jpg |
| D5 | Actual export events agree with correction, blocked plan, remove, undo and clear operations; no copied note text in events | D-export.json, Final-D-export.json, D-decision-record.jpg |
| D6 | Older open app tab locks after another tab writes; disabled generation and reload instruction visible | Observed-stale-tab-lock.jpg |
| D7 | Final reload synchronises scenario dropdown to saved fixture; undo no longer falsely claims a plan was checked | Final-B-persistence.jpg, Final-D-restored.jpg; actions.json |

## Limits

Real page refresh and new-tab loading were observed; quitting/restarting Chrome was not tested. No screen-reader audit, participant trial or performance benchmark was conducted. Storage denial, quota failure, malformed data, future timestamps, inferred-source and near-simultaneous writes were tested in the engine adapter, not injected into the browser. The cross-tab observation establishes ordinary stale-tab locking, not transaction atomicity.

The final working tab was left with A's three fictional records, corrected collaborative environment and full plan. Earlier open tabs can be stale after testing; use the kept final tab or reload saved state. Initial private QA backup is outside the repository. Fixture changes intentionally reset prior decision records.
