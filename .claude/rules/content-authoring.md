---
paths:
  - "content/practices/**"
  - "content/collections/**"
  - "content/chapters/**"
---

# Authoring practices

Read `docs/content/primitives-guide.md` before writing or editing practice JSON. Flow DSL reference: `docs/features/features-overview.md`. Run `pnpm validate-flows` after edits.

## Text

- A `rubric` is a stage direction — never text the user prays aloud.
- Latin and vernacular versions of a line go in separate language keys (`la`, `pt-BR`, `en-US`), never stacked in one string with `\n`. Omit `la` when no sourced Latin exists; never compose one.
- Verify liturgical and rite text against a source. Do not write it from memory.
- In a tradition-specific practice, take the principal prayer from that tradition's own prayer book rather than `ref`-ing a generic corpus prayer that happens to fit the slot.
- When a standard prayer recurs inside a practice (Glory Be, Our Father…), copy its wording from the canonical practice (`content/practices/glory-be`, …) instead of translating it afresh.
- When inlining a psalm from `content/bible/drb/psalms.json`, strip verse 1's superscription ("Unto the end, a psalm for David…"). It is a title, sometimes fused with the first prayed line.

## Manifest

- `"completion": "manual"` does not mean "the user finishes it by hand". It only hides the in-flow Amen button, leaving the Today checkbox as the sole way to complete. Use `flow-end`.
- Different traditions of one devotion are separate practices grouped by `alternativeTo`, and the canonical member points `alternativeTo.id` at itself — only the self-pointing member seeds defaults.
- `lectio` track files go in the practice's `tracks/` directory and `cycle` data in `data/`. `build-corpus.py` hashes them by directory and ignores the manifest's `tracks` block, so a misplaced track builds clean and renders `[Reading track not loaded]`.

## `select`

- Keep `select` for context branching or a leaf-level text swap; its manual choices reset on every open.
- Everything that varies with a labeled (tabbed) `select` goes inside its option bodies. Tab switches are client-side and never re-resolve the flow, so a section outside the select that reads its `as` variable stays frozen on the default pick.
- In a map keyed on `liturgicalSeason`, list both the OF id (`ordinary`) and the EF ids (`epiphany`, `septuagesima`, `post-pentecost`), and spell compound keys out exactly. Unlisted ids silently hit `default`, and range keys like `"0-2"` never match compound values.
- Omit `as` on a static `select` unless selects with identical option ids should share one override. An override stored under a shared `as` that this select's options lack renders an empty branch.

## Other sections

- On a book-backed `prose` section (`book` + `chapter`), set `"langPolicy": "book-default"` unless the book exists in every app language. The default `active-language` silently emits nothing when the chapter lacks the active language.
- Don't place a block that reads movements or resolutions (e.g. `review-resolution`) after a `capture-*` block in the same flow to echo it back. Thread state is snapshotted once per resolve, so it renders empty.
