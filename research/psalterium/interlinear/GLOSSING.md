# Glossing brief — one shard of the interlinear

You fill **one shard**: `research/psalterium/interlinear/glosses/<shard>.json`. The interlinear (tier 1) is generated, not translated: LatinCy parses every word of the Latin (`parse.py`), and the one thing a model supplies is the dictionary sense of each lemma — what you write here. Under every Latin word of the psalter the site shows your gloss and a short morphology line, so a reader can see what each word is. Other agents are filling the other shards at the same time.

## What a gloss is

- The **bare Brazilian Portuguese dictionary sense** of the lemma: an infinitive for a verb (*escutar*), the masculine singular for an adjective (*santo*), the singular for a noun (*coração*). Never an inflected form, never a rendering of a particular verse, never an explanation.
- **The psalter's sense first.** Several senses only when the psalter really uses several, separated by commas: *confessar, dar graças*. At most about **four words**; one or two is usual.
- **Agree with the glossary.** Before glossing a lemma, look for a row for it in `research/psalterium/glossary.md` (grep the lemma, and its spelling with accents, *j* and *v*: `iustitia` → `justítia`). If a row is `decided` or `settled`, its word comes first in your gloss (*exaudio* → *escutar*; *misericordia* → *misericórdia*; *iustificatio* → whatever the settled row says). A `working` or `open` row is a hint, not a rule. Never edit glossary.md.
- Proper names: the Portuguese form the psalter uses (*Israel*, *Sião*, *Jacó*); a people or place name may add what it is in two words (*Moab* → *Moab (povo)*).
- Function words keep the sense they have in the psalter: *quoniam* → *porque, que*; *ut* → *para que, que*; *cum* (conj.) → *quando*.
- Leave nothing half-done: an empty string `""` means "not yet glossed" and shows on the site as ….

## The shard file

```json
{
  "note": "…",
  "lemmas":       { "cor": "coração", "custodio": "" },
  "lemmaFixes":   { "uanito": "uanitas" },
  "formOverrides": {
    "miserere":        { "lemma": "misereor", "morph": "imp.2s", "gloss": "ter piedade", "parserSaid": "nome próprio vocativo" },
    "miserere mei":    { "lemma": "ego", "morph": "gen.1s", "gloss": "de mim", "parserSaid": "meus nom.pl.m" },
    "compungimini@4:5": { "lemma": "compungo", "morph": "imp.pass.2p", "gloss": "compungir-se", "parserSaid": "pres.pass.2p" }
  }
}
```

- **`lemmas`**: every lemma of your letters is already listed, glossed or `""`. Fill every `""`. Correct a seed gloss only if it breaks a rule above. Keys are LatinCy's lemmas: lowercase, no accents, **u for v and i for j** (`uultus`, `iustitia`, `uanitas`). Don't rename or delete keys; add a lemma only if you need it as the target of a fix (below) and it starts with one of your letters.
- **`lemmaFixes`**: when LatinCy gives a lemma that is wrong **for every form it covers** (`uanito` for *vanitátem, vanitátis …*, which are *vanitas*), map it to the right lemma here and gloss the right lemma. Leave the wrong lemma's gloss `""`.
- **`formOverrides`**: when the parse is wrong for **some** occurrences only. The key is the folded form as `show.py` prints it in the lemma list (lowercase, no accents, u/i for v/j):
  - `"form"` — every occurrence of that form;
  - `"previous form"` (two forms and a space) — the second word, only right after the first (`"miserere mei"`: always *ego*, never *meus*);
  - `"form@verse"` — one verse only (`"compungimini@4:5"`).
  The most specific wins. Fields: `lemma` (the right one), `morph` (in the short convention below), `gloss`, and `parserSaid` (what LatinCy said — the evidence; one line). A missing field falls back to the parse. **Put an override in the shard of the lemma it corrects to** (a fix whose right lemma is *ego* goes in `d-e`); if that is not your shard, write it in your report instead of in the file.
- Morphology convention for `morph` (the same the build writes): verbs `tense.mood.voice.person-number` with the indicative and active unsaid — `perf.3s`, `impf.subj.1s`, `imp.2p`, `fut.pass.3p`, `inf.pres`; nominals `case.number.gender`, a noun's gender unsaid — `acc.sg`, `gen.pl.f`; personal pronouns `case.person-number` — `acc.1s`; participles `part.perf.nom.pl.m`, gerundive `gdv.…`; indeclinables `conj.` `prep.` `adv.` `interj.` `neg.` `num.` `n.pr.`. Full legend: `interlinear/legend.json`.

Don't chase every misparse: fix the ones that would make the gloss **wrong** (wrong lemma, a verb read as a noun, *mei* read as *meus*). A slightly off case or tense is worth an override only in a verse where it matters to the sense.

## Tools (run from the repo root, `/Users/gustavo/Documents/prayer/.claude/worktrees/parallel-prancing-avalanche`)

- `python3.13 research/psalterium/interlinear/show.py <lemma> [<lemma> …]` — count, forms, and the first eight occurrences with LatinCy's parse and the Latin colon (`--all` for every one). `show.py form:mei` lists a folded form whatever its lemma. Use it on every lemma you are not sure of: the context is where a misparse shows.
- `python3.13 research/psalterium/lexicon.py <lemma>` — Lewis & Short, from `research/psalterium/consult/ls_<LETTER>.json`. L&S spells with **v and j** (`vanitas`, `justitia`), so look up `lexicon.py vanitas`, not `uanitas`. There are no files for H, K, Q, X, Y, Z: gloss those from the context and what you know. L&S is classical; for a Christian or Septuagintal sense (*confiteor* → *louvar, dar graças*) the psalter's sense wins.
- `python3.13 research/psalterium/ps005/grep_latin.py '<regex>'` — accent-blind grep over the DO Latin psalter, to see a form in its verse.
- `research/psalterium/interlinear/lemmas.json` — every lemma: count, psalms, up to six forms.
- When you are done: `python3.13 research/psalterium/interlinear/build.py` (merges every shard; prints what is still missing per psalm) — it must run without errors. Then `python3.13 research/psalterium/interlinear/shards.py` to see your shard's count.

## Rules of the house

- **Touch only your shard.** Never another shard, never glossary.md, PROGRESS.md, DECISIONS.md, any `psNNN/` folder, `content/`, or the parse. Never commit.
- `python3.13` for everything. **One plain command per Bash call**; no compound commands (`&&`, `;`, pipes into scripts) that mention "git" or "source" — the worktree's shell guard refuses them. Multi-line code goes in a file under `research/psalterium/interlinear/` (delete it when done), not in a heredoc.
- Edit the JSON with the Edit tool or a small script; keep it valid and the `lemmas` keys sorted (rewriting it from Python: `indent=1`, `ensure_ascii=False`, a final newline — the shape `shards.py` writes).

## Report (at most ten lines)

Lemmas glossed (of how many), lemmaFixes and formOverrides added, any override that belongs in another shard (key and fields, for the coordinator to place), and the lemmas you were least sure of.
