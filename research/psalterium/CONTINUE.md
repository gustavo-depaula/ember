# Continuing the work in another harness

Paste the prompt below into the new harness (Codex or another). `HANDOFF.md` holds the run state, so bring it up to date before switching.

Two things to settle before switching:

- **The blind readers.** `codex.py` runs the three readers through Codex. Until now the translator was Claude, so the readers were a different model; `method.md` says so. If Codex also translates, run each reader in a fresh context and either run the readers on another model or correct that sentence in `method.md`.
- **Where the previous harness stopped.** A psalm may be half-made. The prompt tells the new harness to resume such a folder, not to restart it, but `HANDOFF.md` should name it.

## The prompt

```
You are continuing a translation project already in progress: a Brazilian Portuguese
version of the Gallican Psalter (1961/62 Roman Breviary), made to be prayed aloud,
destined for Divinum Officium. Everything lives in research/psalterium/.

Read these first, in this order, before touching anything:
1. research/psalterium/HANDOFF.md: run state, standing rules, what is open for me
2. research/psalterium/method.md: the method in plain words
3. research/psalterium/AGENT-BRIEF.md: the per-psalm procedure, step by step; follow it exactly
4. research/psalterium/DECISIONS.md: every ruling so far (D1…); don't re-litigate them
5. research/psalterium/glossary.md and PROGRESS.md: fixed renderings and per-psalm state

Then continue in psalm order from where PROGRESS.md and the ps<NNN>/ folders leave off.
A psalm folder without a finished prayed.json + passed Latinist gate is unfinished: resume it, don't restart it.
Psalms longer than ~35 verses are done in stages (see how ps118, ps009, ps017 were done).

Per psalm, done means: `python3.13 research/psalterium/checks.py research/psalterium/ps<NNN> <N>`
exits 0, the three blind readers have run (codex.py), every remark has an outcome in audit[],
the Latinist gate is clean or a held major has its reason written, the glossary and PROGRESS
are updated, `python3.13 research/psalterium/site.py` rebuilds, and
`node research/psalterium/tests/check-site.js` ends "all ok".

You may rule on open translation questions yourself: deliberate, then log the ruling in
DECISIONS.md as the next D-number marked "for review", and settle the glossary row with
tests/settle.py. A ruling that changes a finished psalm is applied as a new draft by a
small script in that psalm's folder (see ps009/draft7.py); drafts are never overwritten.
I review in the morning.

Hard rules:
- Never commit or push. Never add co-author lines.
- Never edit content/do/. The Latin is never retouched. DO's Portuguese is not a witness.
- The repo is public: copyrighted material goes only in gitignored research/**/consult/.
- Don't assert Bible wordings, Greek, or liturgical facts from memory: verify, or mark unverified.
- Matos Soares 1932 and Douay-Rheims are witnesses of sense, not bounds (D28).
- Keep consulted sources and scripts inside the project; /tmp is for throwaway files only.
- Use python3.13, not python3.
- The blind readers must never see how the draft was made. Run each one in a fresh
  context. Tell me if the readers end up being the same model as the translator,
  because method.md claims they are a different one.
- Work in batches of a few psalms; after each batch update HANDOFF.md (run state + anything
  new in "Open for Gustavo"), then continue. Don't stop to ask me whether to go on.
```
