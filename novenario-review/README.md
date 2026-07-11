# Novenário — review folder (TEMPORARY — delete before merging)

Side-by-side fidelity comparisons for every novena in `collection/novenario`,
to verify the original (AI-composed) Ember text against the traditional sources.

- **`index.html`** — open in a browser. Per novena: Ember text (English + Portuguese)
  next to the FishEaters (traditional) and PrayMoreNovenas (modern) sources, plus a
  fidelity note. Sidebar filter by name.
- **`<slug>.md`** — the raw per-novena comparison each reviewer agent produced.
- **`build-html.py`** — regenerates `index.html` (needs `/tmp/sxs.json` +
  `/tmp/fe_sections.json` from the build session; here for provenance only).

This whole folder is review scaffolding and is **not** part of the shipped corpus.
Delete `novenario-review/` before merging the PR.

---
**Update (daily-depth pass):** the 74 new novenas now have a fuller meditation + a per-day **prayer** (~115–150 words/day). `index.html` is regenerated from the live content and reflects this. The individual `<slug>.md` files' *Ember* sections predate this pass (they still show the shorter text) — trust `index.html` for the current Ember content; the `.md` files remain useful for their FishEaters / PrayMoreNovenas source text and fidelity notes.
