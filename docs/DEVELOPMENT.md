# Development record

These are recorded development stages, not reconstructed historical public commits. Work was AI-assisted. The student supplied the research direction, study-planning scenarios and constraints; Codex proposed implementation details. Student acceptance of assisted decisions is not assumed.

## 17 November 2026

The previous Markdown simulation labelled its operations as simulated. A standalone browser application was therefore built, retaining scenario continuity without reusing inaccessible archive code or counting historical tests. Explicit task fields and deterministic rules were selected to make source-to-output decisions inspectable; open language, embeddings and an LLM were left outside this prototype.

The initial engine separated structured claims, dated source excerpts, selection decisions and templates. Twenty-two initial tests passed. Inspection then found that correcting an unrelated-topic preference could supersede a study preference of the same kind. Supersession and the editor's impact count were restricted to the same topic, and a regression test brought the suite to 23 tests.

Storage access was deferred through an adapter so blocked localStorage reads reach an explicit failure path. Checked writes preserve the old state on failure. Tests cover invalid/corrupt state, quota/read failures and stale writes; these use a simulated storage adapter, not browser fault injection.

The actual Mac Chrome walkthrough exercised A/B/C, source and selection traces, correction across page refresh, confirmation, cancellation, request-scoped ignoring, removal/undo across refresh, clearing recovery, actual JSON export, keyboard editor controls and a 390-pixel layout. No human-participant evaluation occurred.

The walkthrough found feedback that could imply a plan had been regenerated when no request existed, a generic load notice referring to B for every fixture, and a saved fixture label differing from a reset selector. Version 1.0.1-local narrowed notices to the saved operation, synchronised the selector and versioned script URLs. Affected flows were rechecked; rule-selection semantics did not change.

A screenshot helper initially retained an older tab handle. Inspection identified its stale-tab-lock captures, renamed them and excluded them from B's persistence evidence. Final capture used an explicit target; the actual state and action records, rather than provisional filenames, determine what each image proves.

## 18 November 2026 publication preparation

The student authorised only a new public MemoryLens repository and push, conditional on privacy, history and final-report checks. The original local history contained assessment/source inventories and identifying academic material. It is retained privately and is not an ancestor of this public repository. Public history begins with this reviewed standalone snapshot; that does not imply the entire implementation was developed in a single step.

All application bytes are checked against the final test hashes. The current suite is rerun on the publication snapshot. Public material includes only this application's code, tests, authored diagrams, fictional-fixture screenshots/exports and reviewed documentation. The identified submission report and private audit inventories are supplied separately. Public authorship uses the account's GitHub noreply address.

## Alternatives and boundaries

A database could improve transactions and multi-device access, but adds setup beyond this single-browser demonstration. Newest-wins conflict resolution was rejected because recency does not establish truth. One disclosed recovery copy supports error recovery; clearing it erases app-held removed content, while exports cannot be recalled. Content-free events reduce retained personal text but cannot reconstruct historical full recommendations. No Chrome-restart durability, comprehensive assistive-technology compatibility or atomic simultaneous-write guarantee is claimed.

The student must review and be able to explain the design and AI assistance. Publication does not authorise Canvas submission, payments or changes to any other project.

## 19 November 2026 Scenario C check

The student personally checked Scenario C in Mac Chrome. The conflict held the personalised plan. Ignoring environment for one request produced generic location advice, kept the 25-minute duration and left the environment memories stored. On a new request the student confirmed collaborative and saved. The recommendation updated, and the interface displayed the confirmation time and Undo.

ChatGPT recommended retaining both paths for user control, error recovery and clear consequences, with possible friction from repeated confirmation. The student’s design judgment is pending. The separate storyboard captures were operated by Codex.

[Revised storyboards](storyboards/revision-2026-11-19/) include capture provenance.
