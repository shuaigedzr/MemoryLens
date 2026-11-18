# Browser evidence index

All images here are genuine Chrome screenshots captured through Computer Use on 17 November 2026 at localhost. They contain fictional demo content. No AI image generation or fabricated interface states were used. Full-page JPEG originals are preserved; report figures are explicitly labelled crops.

- `Final-A-*`, `Final-B-persistence`, `Final-B-undo`, `Final-C-*`, `Final-D-*`, `Final-narrow-390` and `Final-working-state`: final 1.0.1-local application after feedback and scenario-selector corrections.
- `A-*`, `B-*`, `C-*`, `D-*`: genuine initial 1.0.0-local walkthrough. Core rule behaviour is unchanged. These retain some wording corrected later.
- `Observed-stale-tab-lock*`: captures of an older app tab becoming locked after final-tab writes. During capture, the recording helper still referred to the older tab; the files were renamed after checking their actual contents. They are NOT final B persistence evidence.
- `Pre-fix-fixture-mismatch`: older tab's saved fixture label and reset selector before correction. This is not evidence of the corrected selector.
- `.txt`: accessibility snapshots. Some early snapshots contain diffs; final scenario snapshots contain complete states. Numeric accessibility IDs are temporary and not memory IDs.
- `actions.json`: final walkthrough actions with full observed states after each action. Not a general test runner and not a browser storage dump.
- `captures.json`: capture chronology; older entries are annotated where the stale recording helper targeted another tab. Actual `.txt`/image content takes precedence over an earlier filename.
- `D-export.json`: baseline real browser export after correction/removal/undo. `Final-D-export.json`: final browser export after recovery clearing. Both are fictional data and can be inspected with engine.validate.

The report's three sequences and exact crop rectangles are in docs/storyboards/storyboards.json. Cropping changes framing only; it does not change the interface content. Screenshots establish observed states, actions.json records final operations, and exported JSON checks stored data. No screenshot alone is treated as proof of a refresh action or long-term durability.
