# Holy card faces

The generated holy cards collapsed male saints into three stock faces — a man in his thirties with brown curls and a short beard, a white-bearded elder, a beardless youth — because prompts described clothing and attributes but never a face. This investigation gives each saint a face drawn from iconographic tradition or a portrait, and edits the existing cards to match.

## Where the trail lives

- **`content/practices/saint-of-the-day/data/holy-cards.json` → each card's `meta`** — the durable record: the `face` description the card was made from, the `basis` (where that face comes from, in our words), `sources` (links, including consulted pictures), and a dated `history`. Cards without `meta` have not been reviewed yet.
- **`dossiers/`** — the research behind each `basis`: per-saint quotes from the sources, and the look-alike pairs that remain.
- **`log.jsonl`** — every generation/edit run with its prompt and verdict. `edit-face.sh` appends to it; entries marked `backfilled` were reconstructed afterwards.
- **`sheets/`** — contact sheets: `male.jpg` (before), `male-after.jpg`, and the per-batch before/after pairs.
- **`consult/`** (gitignored) — local copies of sources, including the Hetherington translation of the Painter's Manual, which is still in copyright. Nothing from it enters `content/`.
- The originals are the cards at commit `4f53dc95b`.

## Method

1. Research the face: the Byzantine *Painter's Manual* (Dionysius of Fourna) describes each apostle's age, hair and beard so painters can tell them apart; prelates and modern saints have portraits or descriptions from life.
2. Edit only the head: `edit-face.sh <card-id> "<face>"` sends the original card to Codex image generation and writes `drafts/<card-id>.png` (gitignored).
3. Compare: `compare.py` (before/after pairs) and `sheet.py` (face contact sheet across cards). Redo any face that still reads like another card.
4. Copy the accepted draft to `content/saints/` and record it in the card's `meta`.

New cards follow the same research step (e.g. `dossiers/first-batch.md`), then `new-card.sh <card-id> <initial> "<subject>" "<face>" <ref-card-id>...` generates the whole card from unedited reference cards of the same kind (nuns for a nun, bishops for a bishop). Say explicitly that a busy scene (a horse, a crowd) stays inside the arched window: Martin's first draft spilled over the bottom border.

## Lessons

- Edit from the original card every time; each edit adds grain.
- Take the *marks* of a tradition (hair, beard, age, build), not its unflattering literal details. Paul's first edit followed the *Acts of Paul and Thecla* (meeting brows, hooked nose) and came out harsh. Holy cards idealise.
- A long-haired, pointed-beard young man reads as Christ; steer away explicitly.
- Describing a whole new face pulls the model toward photorealism, which looks uncanny beside the painted card. Ask instead for specific trait changes (hair colour, beard, age, head angle) on the original painted face; `edit-face.sh` also attaches an unedited card as a face-style reference.
- Keep the original head angle and gaze. Raising a lowered head to separate look-alikes made Mark and Luke look at the camera, which breaks the devotional mood; separate them by hair, beard and age instead.
- `codex exec -i` takes several files and swallows a trailing prompt argument; pass the prompt on stdin after `--`.
