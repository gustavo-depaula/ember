# Spiritual Checkup — Profiles (decision-tree redesign)

> **Status:** Design doc. Supersedes the v1 linear-scoring approach in `docs/features/spiritual-checkup.md` §2.
> **Related issue:** #156
> **Replaces (partially):** the 9-question flat-score intake in `content/libraries/base/checkup/questions.json`. Archetypes and tracks from the v1 spec are retained.

---

## 0. Why this doc exists

The v1 checkup is a **linear 9-question quiz** whose option weights are summed across six archetypes to produce a primary (and, by tie-break, secondary) result. That shape has a pastoral defect that only becomes visible after trying it against real cases:

A soul who **knows the Catechism cold but never prays** answers "weekly Mass," "yearly confession," "scripture/catechism fluent," "no mental prayer," and ends up weighted toward **Disciple** or even **Grower** — same as a soul who prays the Rosary daily, goes to Mass every Sunday, and has read a handful of saints' lives. Their topologies are opposite. Their pastoral needs are opposite. But their scores are close.

Similar failures on the other end:
- A **complete catechumen** and a **lapsed-for-decades cradle Catholic** both land in Seeker or Returner, but the first needs RCIA and first confession of sins unknown to them as sin; the second needs rehabilitation of a dormant sacramental memory.
- A **well-formed daily communicant** seeking a classical spirituality wellspring lands in Grower, and gets offered formation chapters she has read twice already.

The fix is not to add more questions. It is to change the **shape** of the instrument from a sum to a **decision tree** that routes early and aggressively, asking *different* follow-up questions down each branch.

---

## 1. What we keep from the v1 spec

| v1 thing | Status |
|---|---|
| The six archetypes (Seeker, Returner, Disciple, Grower, Endurer, Contemplative) | **Keep.** They are sound as phases on the Three Ways. |
| Primary + secondary archetype output | **Keep.** The user liked the two-archetype framing — a phase with a tension. |
| `tracks.json` — starter tracks keyed on archetype | **Keep as the catalog of possible tracks.** Some profiles will point at an existing archetype track; others will point at a bespoke track variant (see §4 below). |
| 9-question linear form in `questions.json` | **Demote to fallback.** The tree is the target shape. |
| Consent screen + pastoral framing + "this is not a diagnosis" language | **Keep.** Stronger in the tree, not weaker. |
| Tie-breaker rules | **Replaced** by tree leaves. |

---

## 2. Topology — the axes the tree must split on

Archetypes are phases on one axis (roughly: the Three Ways). A single phase axis is necessary but not sufficient. Souls differ **orthogonally** to phase on at least the following:

1. **Doctrinal formation** — none / catechism-basics / well-read / expert. Cheap to measure (one question). Highly discriminating.
2. **Prayer life depth** — none / devotional-only / vocal+meditative / contemplative-drawn. Medium to measure (posture more than frequency).
3. **Sacramental status** — unbaptized / baptized-uncatechized / catechized-lapsed / sunday-communicant / frequent-communicant. Cheap to measure.
4. **Confession history** — never / not-since-childhood / infrequent / regular / frequent-spiritual-direction.
5. **Moral self-awareness** — unaware / despairing / fighting / examining-one-fault / subtle-attachments.
6. **State of life** — single-lay / married-lay / religious / priest / widow/widower / discerning. Context, not a branch, but it colors every output.
7. **Relationship to the Church** — catechumen / returning / practicing-novus-ordo / practicing-traditional / convert-from-protestantism / orthodox-pilgrim / hostile-curious.
8. **Motivating desire** — curiosity / crisis / growth / consolation / dryness / union / duty.

A decision tree routes by **the axes that most cleanly split the population at that node**. Early nodes use cheap, high-signal axes (sacramental status, doctrinal formation, prayer life depth). Later nodes refine with temperament and desire.

---

## 3. Archetypes × Topologies → Profiles

Profiles are the **leaves** of the tree — the things we actually deliver as a result. They are archetypes *instantiated* by a topology. One archetype can produce multiple profiles; one profile can carry primary + secondary archetypes.

Examples (full list in §5):

| Profile | Primary | Secondary | Differs from "bare archetype" by |
|---|---|---|---|
| The Apologetics Nerd | Disciple (on doctrine axis) | Seeker (on prayer axis) | Knows the faith intellectually; prayer is a Seeker beginner's |
| The Emotional Enthusiast | Disciple (on prayer axis) | Seeker (on doctrine axis) | Prays often; doctrinal formation is a Seeker beginner's |
| The Lapsed Returner | Returner | Seeker (on moral axis, if long-lapsed) | Needs rehabilitation of childhood memory, not introduction |
| The Nominal Catholic | Seeker | Returner | Technically baptized; practically unformed |
| The Well-Formed Seeking Wellspring | Grower | Contemplative | Already does everything Disciple/Grower track prescribes — offer content, not formation |
| The Hidden Dark Night | Grower | Endurer | Faithful + dry; the temptation is to call it Disciple and pile on novelty |

The tree's job is to get to the **profile**, not just the archetype. The archetype is a downstream annotation.

---

## 4. Primary / secondary mechanic, reformulated

In the v1 scoring, primary + secondary came from the top two scores on the weight sum. In the tree, they come from two separate questions about **what the soul is leaning toward**:

- **Primary** = the archetype that best names where the soul *is standing* right now. The tree arrives at this by routing through topology.
- **Secondary** = the archetype that best names where the soul is *leaning*, i.e., the tension. This is a single focused question at the leaf: "When you think about growing in prayer, which resonates more — [X] or [Y]?" where X and Y are pre-selected per-leaf options (e.g., at a Disciple leaf, the choices might be Grower ("I want interior silence") vs Seeker ("I want to shore up what I don't know")).

This preserves the user-loved "two archetypes, one tension" output while grounding it in routing rather than arithmetic.

---

## 5. Profiles authored in this directory

Every profile file has the same sections:

1. **Who this is** — 2–3 sentences painting the soul.
2. **Route** — the rough path through the tree that gets here.
3. **Primary / secondary** — which archetype(s).
4. **Starting tension** — the one thing this profile most commonly misreads about itself.
5. **What to offer first** — specific practices and chapters from `base/`.
6. **What NOT to offer first** — tracks / chapters / devotions that would actively mislead this soul.
7. **Two-week shape** — rough week-1 and week-2 weight.
8. **Pastoral warnings** — characteristic failure modes.

Current drafts:

- [01 — Curious Unbaptized](01-curious-unbaptized.md) — `Seeker`
- [02 — Nominal Catholic](02-nominal-catholic.md) — `Seeker` / `Returner`
- [03 — Lapsed Returner](03-lapsed-returner.md) — `Returner`
- [04 — Apologetics Nerd](04-apologetics-nerd.md) — `Disciple(doctrine)` / `Seeker(prayer)`
- [05 — Emotional Enthusiast](05-emotional-enthusiast.md) — `Disciple(prayer)` / `Seeker(doctrine)`
- [06 — Sacramental Baseline](06-sacramental-baseline.md) — `Disciple`
- [07 — Committed Practitioner](07-committed-practitioner.md) — `Grower`
- [08 — Hidden Dark Night](08-hidden-dark-night.md) — `Grower` / `Endurer`
- [09 — Well-Formed Seeking Wellspring](09-formed-wellspring.md) — `Endurer` / `Contemplative`

Overlays (not profiles — modifiers that can apply to any profile):

- [Scrupulosity overlay](overlay-scrupulosity.md) — ancient pastoral concern; changes the advice of any profile.
- [Convert overlay](overlay-convert.md) — recent reception from Protestantism / Orthodoxy.
- [Traditional-leaning overlay](overlay-traditional.md) — latched onto TLM / classical spirituality, at any phase.

Tree sketch:

- [Decision tree sketch](decision-tree.md) — rough branching logic the profiles plug into. Not final; informs infrastructure decisions when the quiz is eventually coded.

---

## 6. What this directory is NOT

- Not a question bank — we do not yet have the final questions. The profiles describe the *destinations*; the tree sketch shows rough branching; the questions get authored last.
- Not app code — nothing here assumes any schema beyond "we can pick a leaf." See `docs/features/spiritual-checkup.md` §4 for the eventual data model.
- Not a replacement for spiritual direction — stated explicitly in every leaf. The checkup is the app's antechamber; the confessional and a director are the home.

---

## 7. Author's note on care

The difference between a checkup and a personality test is the *posture of the instrument*. Buzzfeed quizzes tell a user who they are; a novice master asks what the Lord has been up to. Every leaf must read as if a kind priest is saying it — in quiet, not in triumph — and must leave the user with a concrete next action that is smaller than they expected. **Shrinking the next step is a feature.** A catechumen's first track is "pray the *Our Father* slowly each morning." That is not too little; for someone who has never done it, it is plenty.
