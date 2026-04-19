# Decision Tree Sketch

> **Status:** Rough. Informs profile work; does not constrain the eventual quiz code.

The tree has four depth levels. Each node names an axis, not a question — the question copy comes later. Depths are not rigid; some leaves are reached in 3 questions, others in 5.

---

## Level 0 — Consent

Frame: "A few quiet questions. You can stop at any time. We won't save anything you don't ask us to save. The end result is a suggestion, not a diagnosis."

Single-choice: [I'd like to try] / [Not right now].

If the user declines, the app goes to its default home. If they proceed, we set a session-only in-memory state and start at L1.

---

## Level 1 — Sacramental status (the widest possible branch)

Question posture: "Where are you with the Church right now?"

- **A. I'm not baptized / I'm not sure I've been baptized.** → `profile:curious-unbaptized` (short path; go to L4 for secondary).
- **B. I'm baptized but was never really formed / haven't practiced.** → to L2 **nominal-track**.
- **C. I used to practice but have been away for a while.** → to L2 **returning-track**.
- **D. I practice regularly (Sunday Mass, maybe more).** → to L2 **practicing-track**.
- **E. I'm advanced — daily Mass, daily prayer, I know I've been at this a long time.** → to L2 **advanced-track**.

This split handles ~95% of early routing on one axis that is easy to self-report. The tree is already leaving quadrants of the population behind that the linear scoring couldn't distinguish — e.g., B and C converge in v1 (both are "Redivivus"); they diverge here.

---

## Level 2 — Depth or imbalance question (branch-specific)

### L2 from nominal-track (B)
"Do you know the basics of what the Church teaches — Creed, Ten Commandments, the sacraments?"

- Yes, from childhood / RCIA. → `profile:nominal-catholic` (route to L4).
- Not really, and I'd like to learn. → `profile:nominal-catholic` with catechetical emphasis (route to L4).
- (optional) I know the doctrine well but never practiced. → **`profile:apologetics-nerd`** (this is one of two paths that arrive at this profile).

### L2 from returning-track (C)
"When you last practiced, roughly how long ago was it, and how deeply did you practice?"

- Months ago, and I was a daily communicant. → `profile:committed-practitioner` with **returning** overlay; skip L3.
- Years ago, I practiced seriously as a youth. → `profile:lapsed-returner` (route to L3 on moral life).
- A decade or more ago, and I was cultural / sporadic. → `profile:lapsed-returner` **with nominal overlay**; route to L3 on moral life.

### L2 from practicing-track (D)
"How would you describe your daily prayer?"

- Occasional — Mass, maybe a Rosary sometimes. → `profile:sacramental-baseline` (route to L3).
- Daily, with some structure — Rosary, morning/evening prayers. → `profile:committed-practitioner` (route to L3).
- I pray a lot, sometimes intensely, but don't have a structure. → **`profile:emotional-enthusiast`** (route to L4 — check doctrine axis).
- I know a lot about the faith but honestly don't pray much. → **`profile:apologetics-nerd`** (route to L4 — check prayer axis).

### L2 from advanced-track (E)
"What describes your current interior life?"

- I'm faithful and steady, and I'm starting to be drawn to silence. → `profile:committed-practitioner` with Contemplativus secondary; route to L3.
- I'm faithful, and prayer is often dry or dark. I keep going. → `profile:hidden-dark-night` (route to L3).
- I'm already in a settled advanced rhythm. I'm here for support and sources, not a plan. → `profile:formed-wellspring`; route to L4 for a tension question only.

---

## Level 3 — Refining axis (moral / consolation / fault)

Different per branch. These questions *confirm* the profile and feed the primary archetype choice; they also inform which of two candidate tracks to offer.

Pattern: "Which of these comes closest to your experience right now?" with options ordered from **less formed** → **more formed**. We avoid content-specific moral questions ("do you struggle with X") — we ask about *posture*.

Examples by profile:

- `profile:sacramental-baseline` L3: "How often do you examine your conscience?" — answer routes to *Discipulus (examen-starter)* vs *Discipulus (confession-starter)*.
- `profile:committed-practitioner` L3: "What's been happening in prayer lately?" — answer routes to *Proficiens (deeper-mental-prayer)* vs *Proficiens (aridity-orientation)*.
- `profile:lapsed-returner` L3: "When you think about confession, what comes up first?" — answer routes to *Redivivus (returning-to-confession track)* vs *Redivivus (fear-and-consent track)*.

---

## Level 4 — Tension question (primary → secondary)

At every leaf, a final question picks the **secondary** archetype from a pre-selected pair tailored to that leaf. Copy pattern:

> "When you imagine growing from here, which resonates more?"
>
> - **[leaning A]**: e.g., "I want to shore up what I know I don't know."
> - **[leaning B]**: e.g., "I want to sit with the Lord in silence."

Examples:

- At `profile:apologetics-nerd`: secondary pair = {Quaerens (prayer-life beginner), Contemplativus (interior-silence drawn)} — the first names the deficit; the second names the aspiration that sometimes hides under the apologist's intellectualism.
- At `profile:hidden-dark-night`: secondary pair = {Perseverans (endurance), Contemplativus (consent to silence)}.
- At `profile:formed-wellspring`: secondary pair = {Contemplativus (drawn to silent prayer), Perseverans (duty and steadiness under dryness)}.

The secondary is never the same as the primary. The pair is authored into the leaf; it is not computed.

---

## Level 4.5 — Overlays

Three yes/no questions, placed before the final summary screen, that set overlay flags:

- "Do you ever worry excessively about sin, or return to confess the same thing many times?" → **scrupulosity overlay**.
- "Were you received into the Church as an adult from another tradition?" → **convert overlay**.
- "Is the Traditional Latin Mass / classical spirituality a strong pull for you?" → **traditional-leaning overlay**.

Overlays change copy and track emphasis but do not change the primary profile. See overlay docs.

---

## Sample paths

### Path A — catechumen
L1=A → leaf `curious-unbaptized`. Primary=Quaerens. L4 tension pair offered: {Redivivus — "I've been Catholic before in some sense", Discipulus — "I want a structured practice from day one"}. 3 questions total.

### Path B — apologetics nerd
L1=D → L2 "I know a lot about the faith but honestly don't pray much" → leaf `apologetics-nerd`. Primary=Discipulus (doctrine). Secondary=Quaerens (prayer). L4 tension pair: {Quaerens — "I'm a beginner at prayer", Contemplativus — "I want silence"}. 3–4 questions.

### Path C — well-formed seeker
L1=E → L2 "settled rhythm, here for sources" → leaf `formed-wellspring`. Primary=Perseverans. L4 pair: {Contemplativus, Perseverans}. 3 questions — almost as short as the catechumen path, because there is very little to diagnose and much to offer.

---

## What this gives up

A flat score computes a number for every archetype at the same granularity. The tree deliberately stops collecting signal once a leaf is reachable — that means some edge cases get routed to a broader profile than they technically deserve. The trade is: *correctness on the axes that matter over comprehensive coverage of secondary signals*. A soul mis-routed at L1 can retake the checkup — it is cheap. A soul mis-sorted by weight-sum arithmetic is hard to correct because the output feels authoritative.

---

## Implementation note (for the eventual quiz code)

The tree is a small directed graph: nodes are questions, edges are answer options, leaves are `(profileId, archetypePrimary, archetypePairForSecondary, overlays[])`. The natural data shape is:

```ts
type Node =
  | { kind: 'question'; id: string; prompt: I18n; options: Array<{ label: I18n; goto: string }> }
  | { kind: 'leaf'; profileId: string; primary: Archetype; tensionPair: [Archetype, Archetype] }
```

But not now. Do not infer a schema from this sketch. Author the leaves first; the shape will settle once half the profiles are written.
