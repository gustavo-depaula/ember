# Catechism of Pius X — Catechetical Formation Track

A 90-day formation practice teaching the Catechism of Pius X (1912) through one daily session per topical cluster, anchored by a sacred-art image and a pastoral commentary adapted from Aquinas's Naples Lent sermons (1273).

Format inspired by Pe. Eugênio Fornasari's *Na Escola de Jesus* — image + Q&A + pastoral teaching + Scripture + closing — but built from public-domain sources only.

## Spine

**Catecismo da Doutrina Cristã (1912)** — Pius X's universal catechism, 433 Qs, four pillars: Creed, Sacraments, Decalogue, Lord's Prayer (+ virtues).

PT-BR canonical text: Montfort. See `sources/README.md`.

## 90 sessions

| Pillar | Sessions | Pius X Qs |
|---|---|---|
| Lição Preliminar | 2 | ~8 |
| Credo | 32 | ~170 |
| Mandamentos | 18 | ~80 |
| Sacramentos | 22 | ~110 |
| Pai Nosso + Ave Maria | 10 | ~35 |
| Virtudes + conclusão | 6 | ~30 |
| **Total** | **90** | **~433** |

Every Pius X Q is covered. Sessions cluster adjacent Qs by topical focus, following Pius X's own section structure.

## Daily session shape

| Element | Length | Source |
|---|---|---|
| Image | full-bleed | PD sacred art (Wikimedia / museum APIs) |
| Image ekphrasis | ~50 words | Ours |
| Pius X Qs (cluster) | ~50 words | Pius X 1912 verbatim |
| Pastoral commentary | ~250 words | Aquinas Naples sermons (adapted) |
| Scripture | ~30 words | Pius X's footnoted citations |
| Closing | ~30 words | Ours |

Authorial surface across the whole track: ~80 words/session × 90 ≈ 7,200 words. The doctrinal substance is borrowed; the pastoral framing is ours.

Optional deep-dive layer (later): full Trent passages, Spirago excerpts, Catecismo Maggiore (1905) parallels.

## Commentary source per pillar

| Pillar | Source | Status |
|---|---|---|
| Credo | Aquinas, *On the Apostles' Creed* (Collins 1939) | **In scope** |
| Mandamentos | Aquinas, *On the Ten Commandments* (Collins 1939) | **In scope** |
| Pai Nosso | Aquinas, *On the Lord's Prayer* (Collins 1939) | **In scope** |
| Ave Maria | Aquinas, *On the Angelic Salutation* (Collins 1939) | **In scope** |
| Sacramentos | TBD — Aquinas's Naples cycle has no sacramental sermons | **Deferred** |
| Virtudes | TBD — no committed source yet | **Deferred** |

Aquinas covers ~62 of the 90 sessions in the confirmed scope. Sacraments and Virtues commentary will be addressed later.

## Phases

1. **Phase 0 — Source assembly.** All PD downloads. See `sources/README.md`.
2. **Phase 1 — Clustering.** Map Pius X's 433 Qs into 90 topical sessions following Pius X's own section structure. Produces `clustering.md`.
3. **Phase 2 — Pilot.** One end-to-end session (Creed Article 1, *I believe in God*) — image, ekphrasis, commentary, Scripture, closing, EN + PT-BR. Surfaces every format decision.
4. **Phase 3 — Resolve deferred gaps.** Sacraments + Virtues commentary sourcing.
5. **Phase 4 — Four more pilot sessions.** One per pillar, format stress-tested.
6. **Phase 5 — Theological review of pilots.** Find a competent reviewer; iterate.
7. **Phase 6 — Full authoring.** ~7–10 sessions/week.
8. **Phase 7 — Image curation.** ~90 PD images, parallel with Phase 6.
9. **Phase 8 — Spec + engineering.** `flow.json`, deep-dive toggle, library packaging.
10. **Phase 9 — Beta + iterate.**

## Status

- ✅ Spine + commentary sources for ~62 sessions identified
- ✅ PT-BR Pius X 1912 chosen (Montfort)
- ⏳ Sacraments commentary — deferred
- ⏳ Virtues commentary — deferred
- ⏳ Phase 1 clustering — next concrete step

## Files

- `README.md` — this file
- `sources/README.md` — verified PD sources, URLs, license status
- `clustering.md` — Pius X → 90-session map (not yet written)
