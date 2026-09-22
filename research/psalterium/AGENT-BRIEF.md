# Brief for translating one psalm

You are translating one psalm of the Gallican Psalter into Brazilian Portuguese **to be prayed** — recited daily and chanted to a psalm tone, beside the Latin column. Work from the repo root (`…/.claude/worktrees/parallel-prancing-avalanche`); everything you write goes under `research/psalterium/`. Never edit `content/`. Never commit — the coordinating session commits after each batch. Read `research/psalterium/glossary.md` before you write a word, and `ps004/prayed.json` + `ps004/retrospective.md` once, as the worked example.

## The rules

1. **Translate the Latin as Latin.** The source is `content/do/web/www/horas/Latin/Psalterium/Psalmorum/Psalm<N>.txt`. LXX, Hebrew, Douay-Rheims and Matos Soares 1932 (in your parallels file) *explain* the Latin; they never correct it. Where the Latin follows the Septuagint against the Hebrew, you follow the Latin. Hebrew-based Bibles (Ave Maria, CNBB, modern versions) are not sources of meaning. **DO's own Portuguese (`content/do/web/www/horas/Portugues/`, the "pt-PT" section of your parallels) is no authority at all**: it is the text this project exists to replace — Gustavo has been contributing AI-assisted renderings to it recently and says it has many mistakes; its verse ids drift. Never cite it as evidence for a wording (agreement with it proves nothing); look at it only to see what the project is replacing.
2. **Working rule on strangeness (provisional, Gustavo leans this way):** keep the Latin's *words, images, repetitions and ambiguities*; yield to the ear on *grammar and order*. You may supply a copula or auxiliary Portuguese needs, name a subject hidden in a verb ending, use natural Portuguese word order, and take the plainer of two faithful words. You may not paraphrase an image, explain, resolve what the Latin leaves open, or drop a repetition the Latin has. Matos Soares 1932 is a witness of the Latin's sense, like Douay-Rheims — cite his wording as evidence when it fits, never as permission to go freer or as a limit on how free you may go (D28; ignore his parenthetical glosses).
3. **Address:** God is *vós* (decided). A plural human audience is also *vós*; a singular human addressee is *tu*. Divine pronouns lowercase. Never use a *vós* imperative that equals a first-person past (*ouvi*, *abri*, *parti*…).
4. **Pointing:** reproduce every `†`, `‡`, `*` of the Latin, same order, in each prayed verse; one Portuguese colon per Latin colon, each sayable in one breath; aim within ~2 syllables of the Latin colon; the word before each mark and at the end should take its stress on the last or second-last syllable. Never merge or split prayed verses; keep DO's ids (`4:2a`, `117:28b`). Inline `(20)`-style markers and `(Aleph)` labels are not translated and not reproduced.
5. **Register — simple nobility:** reverent, plain, rhythmic, slightly austere; current Brazilian Portuguese (post-1990 spelling); no archaism needing a footnote, no poeticism, no inversion for its own sake; concrete images stay concrete (bones, horn, rock, fat, net). Keep the article before possessives (*o vosso nome*, *a minha alma*). No sought rhyme; accidental rhyme at mediant/final is a defect unless the Latin has the same echo. Mesóclise only where it reads naturally.
6. **Consistency:** what repeats in the Latin repeats identically — refrains inside a psalm, formulas across psalms (`glossary.md`), doublets (13/52, 39:14–18/69, 56:8–12 + 59:7–14/107: if the twin is already translated, identical Latin gets identical Portuguese). Follow the glossary; if you must depart from it or need a new entry, do it and record why.
7. **Honesty:** do not assert liturgical facts or the wording of any Bible from memory — quote only what is in your parallels file or what you fetch. Mark anything unverified.

## Steps

1. `python3.13 research/psalterium/parallels.py <N>` → read `consult/parallels/ps<NNN>.md` (Latin, LXX, Hebrew, Douay-Rheims, Matos Soares 1932 raw OCR, pt-PT, and — for the 78 psalms of the day hours — the **Diurnal Monástico 1962**, Dom Marcos Barbosa's Portuguese printed beside this same Latin for Brazilian monks to pray. He translated *from the Hebrew* and says *Tu*, so he is no witness of sense; but he is the one Brazilian who solved the same problem of rhythm, breath and the asterisk — listen to his diction and cadence, and when you borrow a word from him say so with `from: "DM1962"`). Use `python3.13 research/psalterium/lexicon.py <lemma>` for hard words (Lewis & Short; fetch a missing letter with `curl -sL -o research/psalterium/consult/ls_X.json https://raw.githubusercontent.com/IohannesArnold/lewis-short-json/master/ls_X.json`, one plain command).
2. Write `ps<NNN>/literal.json` — `{"tier": 2, "verses": {id: text}}`: grammatical Portuguese that hugs the Latin, marks included. Cheap scaffold; do not polish it.
3. Write `ps<NNN>/prayed.json` in the schema below — the prayed text, with every real choice exposed as a **decision** with alternatives.
4. `python3.13 research/psalterium/render.py research/psalterium/ps<NNN> <N>` then `python3.13 research/psalterium/checks.py research/psalterium/ps<NNN> <N>`. Hard checks must pass. Read the soft flags; fix what is a real fault, accept the rest in a `choices` note.
5. Blind readers (another model family, via Codex; each call can take minutes — run them one at a time, as plain commands):
   - `python3.13 research/psalterium/codex.py research/psalterium/ps<NNN> ../prompts/latinist.md prayed.vos.json critic/v1.latinist.json`
   - `python3.13 research/psalterium/codex.py research/psalterium/ps<NNN> ../prompts/stylist.md prayed.vos.json critic/v1.stylist.json`
   - for psalms over ~12 verses or wherever you are unsure: `python3.13 research/psalterium/codex.py research/psalterium/ps<NNN>/blind ../../prompts/ambiguity.md prayed.vos.json ../critic/v1.ambiguity.json`
   If Codex fails (limits, network), go on without it and mark the psalm `unreviewed`.

   **While Codex has no credits (from Ps 37, 2026-09-22), the readers are run by the coordinator instead:** don't call codex.py. When `prayed.vos.json` is ready and checks pass, STOP and reply with one line, `READY FOR READERS: ps<NNN> v<k> — need: latinist, stylist, ambiguity` (the gate: `need: latinist`). The coordinator runs each reader as a fresh-context Claude agent that reads only the role prompt and its target, stores the reply as `critic/v<k>.<role>.json` in codex.py's record format (`reader_record.py`; the `model` field names the model), and messages you to continue. In the audit, name the model each reader was.
6. **Keep every draft.** Before you change `prayed.json` after the critics, copy it to `prayed.v1.json` (then `prayed.v2.json` before a further revision, and so on) — the site shows the layers Latin → literal → draft 1 → draft 2 → … side by side, so a draft that is overwritten is lost evidence. Each critic file is named for the draft it read (`critic/v1.*`, `critic/v2.*`).
   Revise. Take every Latinist fix that is right. Take a stylist fix only if it respects rule 2; when it does not, keep your text and add its proposal as an **option** in a decision, so Gustavo can choose. Bump `version`, re-run render + checks; if wording changed materially, re-run the Latinist gate as `critic/v2.latinist.json`.
7. Append new or changed entries to `glossary.md` (your psalm number beside them), and one line to `PROGRESS.md`.
8. Reply with at most ten lines: verses done, checks result, which critics ran, glossary entries added, the two or three hardest decisions.

## `prayed.json`

```json
{
  "psalm": 90, "tier": 3, "version": 1, "address": "vós",
  "status": "draft | reviewed | unreviewed",
  "verses": {
    "90:1": "Quem habita {adjutorio} do Altíssimo, * na proteção do Deus do céu {commorabitur}."
  },
  "decisions": [
    {
      "id": "adjutorio", "refs": ["90:1"], "latin": "in adjutório", "kind": "word | order | grammar | glossary | ambiguity",
      "why": "One or two sentences: what is at stake, what the parallels show.",
      "options": [
        {"label": "no auxílio", "forms": {"adjutorio": "no auxílio"}, "note": "draft — DRB 'aid'", "from": "draft"},
        {"label": "sob o amparo", "forms": {"adjutorio": "sob o amparo"}, "note": "stylist: more native", "from": "stylist"}
      ]
    }
  ],
  "choices": {"90:1": "Anything about the verse a reviewer should know that is not a decision: a soft check accepted, a Septuagintal feature kept on purpose, a glossary term applied."},
  "audit": [
    {"step": "draft", "note": "psalm-level draft from parallels; hard readings: …"},
    {"step": "checks", "note": "hard pass; 90:6 first colon +3 syllables, accepted because …"},
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "2 minor; 90:3 taken, 90:13 refused because …"},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "5 remarks; 3 taken, 2 kept as options"},
    {"step": "revision", "note": "v2: …"}
  ]
}
```

- A `{slot}` in a verse is filled by the **first** option's `forms[slot]` — option 0 is always your current text. One decision may fill several slots in several verses (a glossary verb in three forms). A form may itself contain another `{slot}`. Every decision needs **a word to touch** on the site: no option 0 whose forms are all empty strings (a choice about punctuation or a supplied word takes a neighbouring word into its slot: `"v3open": "Rompamos"` against `"“Rompamos"`). Verses without open choices are plain strings.
- **You decide; Gustavo reviews** (his delegation, 2026-09-20: "as long as you document the decisions, and deliberate thoughtfully on them, you can make decisions"). Option 0 of every decision is your ruling: deliberate, then rule, and write the reasons so that someone who was not there can overturn you knowingly. Do not leave a verse hedged because a question is "open". What reaches beyond your psalm (a glossary word) you *propose* in `glossary.md` as `open` with its alternatives; the main session rules on those in `DECISIONS.md` between psalms (`settled` rows are to be followed). Read `DECISIONS.md` — D2 is the governing rule in its ruled form.
- Make a decision wherever a careful reader could reasonably want another rendering: a hard reading, a glossary-grade word, a stylist proposal you refused, an ambiguity the reader raised. Aim for the real ones — a short psalm may have three, a long one fifteen; do not manufacture them.
- `why`, `note`, `choices` and `audit` are the audit trail Gustavo reads: write them as plain sentences, say who proposed what (`from`: draft, glossary, latinist, stylist, ambiguity, MS1932, DRB, checks), and give the reason for every refusal.
- On every `latinist` / `stylist` / `ambiguity` audit step also give the fate of each remark in a structured list, so the site need not guess it from prose: `"outcomes": [{"verse": "90:12", "remark": "forte untranslated", "outcome": "taken | refused | option", "decision": "offendas", "reason": "…"}]` (`decision` only when the remark lives on as an option; `reason` always for a refusal). On the `revision` step give `"version": 2`.
- JSON must be valid UTF-8; marks are the literal characters `†`, `‡`, `*`.

## Environment

- `python3.13` (not `python3`). The Bash guard in this worktree refuses compound commands, loops and heredocs that contain the strings `git` or `source` anywhere (URLs included): run **one plain command per call**, put any multi-line Python in a script file, write files with the Write tool.
- **A usage limit can cut you off without warning** (it happened to Pss 53 and 117). Write to disk early and often — `literal.json` as soon as it exists, `prayed.json` as soon as there is a full draft, `prayed.v1.json` before the first post-critic edit, `audit` kept current — so that another agent can resume from the folder. If you find a folder already begun, inspect it and build on what is sound; never re-run a critic whose file is already there for the draft it read.
- `/tmp` can be erased: anything you fetch or write that is worth consulting again goes under `research/psalterium/consult/` (copyrighted or bulky material) or your psalm folder — never only in `/tmp`.
- Do not read PDF pages or images. Do not install anything. Do not touch `ps004/`, `review.html`, other psalms' folders, or the scripts (if a script has a bug, report it instead).
