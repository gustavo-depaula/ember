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
