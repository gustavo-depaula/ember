# Catechetical Improvement Adventure — Journal

A working log of an autonomous catechetical content improvement session.
Keeps track of what was found, what was changed, and why.

---

## Mission

Improve the catechetical formation content in Ember:
- The 90-session **Catechetical Formation** book (curated daily formation track)
- **Aquinas's Catechetical Instructions** (1273 Naples sermons, 1939 trans.)
- **Catechism of St. Pius X** (1912)
- **Roman Catechism of Trent** (1566)
- The daily **Catechetical Formation practice** that ties them together

Free to be bold: editorial content, reformatting, new commentary from saints,
importing entire new books via the import-book skill. The goal is depth of
formation for the laity — not preserving the status-quo of generated artifacts.

## Snapshot of starting state

Sourced from a thorough Explore audit on 2026-04-27.

| Library | Files | Languages | Format | Notes |
|---|---|---|---|---|
| catechetical-formation | 280 | en-US, pt-BR | 90 markdown sessions + images | The curated daily track |
| catechetical-instructions | 82 | en-US, pt-BR | 42 chapters | Aquinas Naples sermons (Collins 1939) |
| catechism-pius-x-1912 | 65 | it, pt-BR, en-US | 21–22 chapters | 433 Q&A |
| catechism-of-trent | 85 | en-US, pt-BR | 42 chapters | Roman Catechism (McHugh-Callan 1923 EN; Pires Martins 1951 PT) |

All public domain. ~42.8 MB on disk.

## Working principle

- **Atomic commits** with descriptive messages.
- **Editorial freedom**: I can author bridge text, modernize phrasing, add
  saint-quote pull-outs, reorganize for the lay reader. No need to preserve
  generation scripts as the source of truth.
- **Subagents** parallelize research and audits to keep main context lean.
- **Bias toward saint commentary** geared to lay formation — not academic
  apparatus.

---

## Log

### 2026-04-27 — Phase 1: orphan-H2 fix, editorial layer, Virtues cluster

**Architecture I had to learn (the hard way):**

The 90-session catechetical-formation book is **generated**, not
hand-authored. The build pipeline is:

  sessions.json (structural spine: Pius X Q ranges, Aquinas + Trent refs)
  + content.json (per-session ekphrasis, scripture, closing reflection)
  + source books (catechism-pius-x-1912, catechetical-instructions, catechism-of-trent)
  → build.py → en-US/session-NNN.md, pt-BR/session-NNN.md, book.json

I spent the first hour writing pastoral commentary directly into the
`session-NNN.md` files. Those edits would have been silently overwritten
the next time anyone ran build.py. Worse, I labelled my prose under
"## St. Thomas teaches" — the same heading the build uses for verbatim
excerpts of Aquinas's Catechetical Instructions. That is misattribution.

I reset four commits and re-did the work properly.

**The slicing bug (real, latent in source for some time):**

`extract_pius_x_range` in build.py walked Q-by-Q, capturing every line
whose preceding `**N.**` marker was inside the requested range. Pius X
source chapters carry section markers like `## § 2. Hope - Charity`
placed *before* the first Q of the next subsection. When the previous
Q was the last in the requested slice, the orphan header rode along at
the tail. Visible on the rendered page as a subheading announcing
content that lived in tomorrow's session.

Fix: after the existing trailing-blank trim, also strip a single
trailing H2 + surrounding blanks. Internal H2 headings are preserved.
Affects exactly two sessions in the current corpus (055 and 036).
Commit: `68a2dbf`.

**The editorial layer:**

To avoid mislabelling original prose as verbatim Aquinas, build.py
gained a new optional section labelled "## A pastoral reading"
("## Uma leitura pastoral" in PT). It reads from a new
`editorial/<lang>/<session_id>.md` overlay file — plain markdown so
prose stays diffable and readable. Renders after the verbatim
Aquinas/Trent section, before the Scripture cap. The book.json source
description was rewritten to spell out which H2 labels carry verbatim
text and which carry editorial. Commits: `bacdd87` (infra), `45406a7`
(file-overlay path + Virtues cluster authoring).

**Aquinas Scripture citations modernized (en-US):**

The 1939 Collins translation carried 1939-era Anglo-Catholic style —
Douay book names + Roman numerals — across 882 citations
(`Osee, ii.20`, `I Cor., vii. 4`, `Apoc., xxi. 1`, `Ecclus., iii. 25`,
`Ps. cxviii. 66`). The pt-BR sibling was already modern. A one-shot
idempotent script at `scripts/modernize-aquinas-citations.py`
(authored by a parallel subagent) rewrites them all to the modern form
(`Hosea 2:20`, `1 Corinthians 7:4`, `Revelation 21:1`, `Sirach 3:25`,
`Psalm 118:66`). Disambiguates I/II Kings vs. III/IV Kings, Esdras,
Maccabees. Skips non-Biblical refs (Sent., Summa Theol., loc. cit.,
Roman Catechism Pt./Ch.) via a NON_BIBLICAL_BOOKS list and a
saint-name lookbehind. Idempotent: a second run is a no-op. Commit:
`13ddc12` (modernization), `8b0f86a` (propagation rebuild).

**Authored editorial readings for the Virtues cluster (sessions 055–058):**

Sessions 055–058 had no pastoral teacher (Aquinas's Naples sermons
don't address the theological virtues / cardinal virtues / capital
vices in their own right; Trent wasn't mapped for this range). The
sessions previously rendered as Pius X Q&A → Scripture → closing
reflection — formation skeleton with no flesh.

Authored ≈300-word readings (EN + PT each) that:
  * 055 — virtue as *habitus*, theological virtues as infused, faith
    as the door (with the Aquinas marriage/eternal-life-now framing
    from his Catechetical Instructions on faith)
  * 056 — hope vs. optimism (Aquinas's twofold object: eternal
    beatitude + divine help); charity as friendship with God grounded
    on John 15:15 (Summa II-II Q23 a1); charity as form of the other
    virtues (Q23 a8)
  * 057 — *cardo* etymology; the four powers Aquinas says each cardinal
    virtue perfects (practical reason / will / irascible appetite /
    concupiscible appetite); operational questions; Christ as exemplar
  * 058 — Aquinas against the stoics (Christ had passions); seven
    capital vices as counterfeits of corresponding virtues; the
    Beatitudes as the kingdom's program

All quotes from saints are inline-attributed and visually demarcated
(blockquotes). The H2 label "A pastoral reading" itself signals
editorial-vs-verbatim provenance. Commit: `45406a7`.

