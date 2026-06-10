# Divinum Officium — EF Mass & Divine Office

> Faithful import of the Divinum Officium project (https://github.com/DivinumOfficium/divinum-officium): the Extraordinary Form Mass and the full Divine Office (all 8 hours), across multiple rubric versions, rendered natively through Ember's primitives pipeline.

This replaces the previous EF implementation entirely (build-time-flattened Mass propers + hardcoded order of Mass + no office). Status per milestone is tracked at the bottom.

---

## Principles

- **The parser is dumb and lossless; the engine is smart and data-free.** Everything DO encodes as text ships as data (structured JSON in the corpus, nothing evaluated at build time). Everything DO encodes as Perl becomes TypeScript (`packages/divinum-officium/`).
- **DO's own Perl is the spec.** Fidelity is enforced by golden tests against `Cofficium.pl` / `Cmissa.pl` run from a pinned clone — not by re-reading rubrics books.
- **One corpus serves all versions.** Rubric-version conditionals are preserved as AST in the data; the engine evaluates them per user preference at render time.
- **Re-sync is a data diff.** Upstream is pinned by commit; re-importing at a newer commit produces a reviewable JSON diff with 1:1 file identity.

## Scope

| Axis | v1 | Later |
|---|---|---|
| Versions | `rubrics-1960` (Rubrics 1960 - 1960), `divino-afflatu` (Divino Afflatu - 1954), `monastic` (Monastic - 1963) | Tridentine 1570/1888/1906, Reduced 1955, Ordo Praedicatorum, Cistercian, Barroux |
| Languages | `la` (Latin), `en-US` (English), `pt-BR` (Portugues) | any other DO language dir |
| Content | Mass + all 8 hours (Matutinum, Laudes, Prima, Tertia, Sexta, Nona, Vespera, Completorium) | Martyrologium, Regula, Necrologium |
| UX | Practices only — 8 hour practices + the EF Mass branch of `practice/mass`, resolved for "today" with a `doVersion` preference | date browser, votives, Cofficium-style options |

`Portugues/` lacks `TemporaM` and is partially translated → per-file language fallback `pt-BR → en-US → la` is mandatory, and gaps are surfaced (never silently Latin-only).

## Version model

From `Tabulae/data.txt` (`version,kalendar,transfer,stransfer,base,transferbase`):

| App id | DO version string | Kalendar | Base chain | Data dirs |
|---|---|---|---|---|
| `rubrics-1960` | `Rubrics 1960 - 1960` | `1960` | Reduced 1955 → DA 1954 → DA 1939 → Trid 1906 → 1888 → 1570 | `Tempora,Sancti,Commune` |
| `divino-afflatu` | `Divino Afflatu - 1954` | `1954` | DA 1939 → Trid 1906 → … | `Tempora,Sancti,Commune` |
| `monastic` | `Monastic - 1963` | `M1963` | M1930 → M1617 → Trid 1570 | `TemporaM,SanctiM,CommuneM`, falling back to base dirs |

Kalendaria files are **diff-based on their base** (`XXXXX` = deletion); the engine materializes a version's kalendar by walking the base chain. The version string participates in condition evaluation (`rubrica 1960`, `rubrica monastica`, `rubrica ^Trident`, …) exactly as in DO's `vero()`.

## Data pipeline

```
.divinum-officium/            # shallow clone at repo root, gitignored, pinned commit
  → scripts/import-do.ts      # clone/update at pinned commit; writes content/do/meta.json
  → scripts/build-do-content.ts  # parse → content/do/** (generated JSON, committed, NEVER hand-edited)
  → scripts/build-corpus.py   # build_do(): do-data/* dataset items, per-file per-language blobs
```

### Imported sources (v1)

Per language (`Latin`, `English`, `Portugues`): `web/www/horas/<L>/{Tempora,Sancti,Commune,TemporaM,SanctiM,CommuneM,Psalterium}` and `web/www/missa/<L>/{Tempora,Sancti,Commune,Ordo}`. Language-independent: `web/www/horas/Ordinarium/*.txt` (6 hour scripts) and `web/www/Tabulae/{data.txt,Kalendaria,Transfer,Stransfer,Tempora}`.

### Parsed-file schema

One JSON per DO text file per language, lossless. Two shapes, discriminated by directory (matching how the Perl engine reads each file):

- **Sectioned** (`setupstring` files — Tempora/Sancti/Commune/missa/most of Psalterium): `{ sections: [{ name, condition?, lines: string[] }] }`. Sections stay in file order (duplicates with header conditions preserved — the engine replicates Perl's "last section whose condition holds wins"). `condition` is the raw expression from `[Name] (condition)` headers (Perl ignores decorative stopwords/scope at headers; so do we). Body lines are stored **raw** — beautiful upstream diffs, byte-exact round-trips.
- **Plain** (`do_read` files — `Psalterium/Psalmorum/Psalm*.txt`, `horas/Ordinarium/*.txt` hour scripts, `Tabulae/**`): `{ lines: string[] }`.

Conditional evaluation is per-version at **runtime**, so the line tokenizer ships in the engine regardless (`tokenizeLine`: conditional / inclusion / macro / call / rubric / blank / text, mirroring SetupString.pl's grammar — stopwords `si/deinde/sed/vero/atque/attamen`, raw `vero()` expression, scope phrase, sequel). The importer runs that same tokenizer over **every line of every file** as a build-time validation/inventory gate (`content/do/inventory.json`: all `&`-calls, `$`-macros, condition expressions, section names), so format drift upstream is caught at import time, not on a user's phone. The importer also hard-fails on non-UTF-8 input.

### Corpus packaging (`do-data` kind)

**One catalog item per dataset**, not per file (15 items): `do-data/{horas-tempora, horas-sancti, horas-commune, horas-tempora-m, horas-sancti-m, horas-commune-m, horas-psalterium, horas-appendix, ordinarium, tabulae, missa-tempora, missa-sancti, missa-commune, missa-ordo, meta}`. Each dataset manifest is a path index mapping DO file id → per-language blob refs (`localized: true`) or directly to blob refs for the language-independent ordinarium/tabulae datasets (`localized: false`); `do-data/meta` carries `{repo, commit, commitDate}`:

```jsonc
{ "id": "do-data/horas-sancti", "doCommit": "b94d5f2…", "localized": true,
  "files": { "01-25": { "la": {"hash":"…","size":2891}, "en-US": {"hash":"…"}, "pt-BR": {"hash":"…"} } } }
```

Measured at import (commit `b94d5f2`, 2026-06-10): 7,292 files / 215k lines → ~19.8MB of canonical blobs; the largest dataset index is `horas-sancti` at 152KB (well under the 300KB shard threshold); catalog grows by 15 entries.

Each language file is its own blob — **no merged-language blobs**; the engine pairs Latin + vernacular at assembly time by section + line position (conditions/refs are evaluated once on Latin as structural truth; the vernacular follows the same decision stream — DO's two-column model). An hour fetches ~6–15 file blobs × 2 langs (~20–80KB/day steady state; Psalterium/Ordinarium/Prayers cached after first use). Pinning traverses `do-data` like other kinds.

## Engine — `packages/divinum-officium/`

Pure TS, zero RN deps, DI loader. `DoLoader { load(path), exists(path) }` — corpus-backed in the app, filesystem-on-`content/do` in scripts/golden tests, in-memory in unit tests. (`exists` is required: DO precedence checks file existence for variants like `02-23v`.)

- `versions.ts` — version table above
- `parser/` — the lossless parser (shared types with the engine; used by `build-do-content.ts`)
- `conditions/evaluate.ts` — `vero()` port + scope machine
- `references/resolve.ts` — `@` resolver: substitutions, line ranges, preamble inheritance, cycle guard, missa→horas Commune redirect, `[Rule]` `ex`/`vide` commons fallback
- `rules.ts` — structured `[Rule]`/`[Rank]` access (rank per version, common source ref, keyword queries: `9/12 lectiones`, `1 nocturn`, `Psalmi Dominica`, `Preces Feriales`, `Te Deum`, `Sub unica conclusione`, …)
- `kalendar/` — `directorium.ts` (data chains, kalendar diff materialization, permanent + Easter-keyed transfers), `tempora.ts` (date → tempora file id), `occurrence.ts` (occurrence/concurrence/precedence port of `horascommon.pl` — highest-risk module), `resolveDay(date, version) → DoDay {winner, hourFiles, rank, commemorations, color}`
- `hours/` — `assemble.ts` (Ordinarium script interpreter) + `handlers/` per `#`-directive (incipit, invitatorium, hymnus, psalmi minor/major, matins lessons/responsories, capitulum, oratio, preces, suffragium, conclusio, antiphona finalis) + `functions.ts` (`&` registry: `psalm, Deus_in_adjutorium, Domine_labia, Alleluia, Gloria(1,2), Dominus_vobiscum(1,2), Benedicamus_Domino, Divinum_auxilium, teDeum, versiculum_ante_laudes, handleverses, mLitany, special`)
- `mass/` — `assemble.ts` (per-version Ordo interpretation) + `propers.ts` (proper sections, Prefatio via Rule, seasonal Graduale/Tractus/Alleluia, commemoration collects)
- `output.ts` — `DoBlock` neutral render tree (`heading | rubric | verse-pair | psalm | antiphon | prose | prayer-pair`), mapped to primitives by the app sources

Contracts: `assembleHour(hora, date, version, lang, loader)`, `assembleMass(date, version, lang, loader)`.

## Fidelity — golden tests

`scripts/do-golden.ts` runs DO's own CLI (`Cofficium.pl`/`Cmissa.pl`) from the pinned clone over a sampled matrix (~30 dates covering every season, octaves, ferias, I/II-class feasts, commemorations, transfers × 3 versions × 8 hours + Mass × 3 langs), normalizes the output, and commits fixtures under `packages/divinum-officium/test/golden/fixtures/`. Engine output is normalized identically and diffed. Kalendar fidelity is a **full-year sweep** (2025–2027 × 3 versions, winner/rank/commemorations per day).

## App integration

- **Preference:** `doVersion` (`rubrics-1960` default) in the preferences store; `ProducerPrefs` gains `doVersion` so `prefsDeps: ['lang','doVersion']` caches correctly.
- **Sources** (`apps/app/src/sources/divinum-officium/`): `loader.ts` (corpus-backed DoLoader + per-file lang fallback), `do-hour.ts` (`producer/do-hour`, `dateScoped`, params `{hour}`), `do-mass.ts` (`producer/do-mass` — emits the complete resolved Mass: ordinary + propers inline + Full/Propers/Readings view select). DoBlock → existing primitives only; no new renderer blocks. This removes the deferred `proper`-slot seam (`ProperSlot`, `useProperForSlot`).
- **Practices:** `content/practices/breviary-{matins,lauds,prime,terce,sext,none,vespers,compline}/` (manifest + 3-line flow including `producer/do-hour`); `collection/breviary` groups them. `practice/mass` EF branch becomes `{"type":"include","ref":"producer/do-mass"}`.

## Teardown (at Mass cutover)

Deleted: `packages/mass/src/buildEFFlow.ts` + `packages/mass/src/ef/*`, EF branch of `apps/app/src/sources/mass-flow.ts`, `apps/app/src/lib/mass-propers/*`, `ProperSlot.tsx` + `proper` primitive handling (after grep for OF stragglers), `ef-*` fragments (after side-by-side parity review — they are the quality baseline), `apps/app/scripts/parse-do-propers.ts`, `scripts/build-ef-ranks.mjs`, `content/propers/`, the `propers` aux entry in `copy-hearth-aux.mjs` and the deploy workflow, the `parse-propers` root script.

Kept: `packages/liturgical` EF season/position (`ef-position.ts` — drives Angelus/Regina Caeli and the home display calendar) and the EF half of `content/liturgical/entries.json` (display calendar is a separate concern; may later be driven by the engine's kalendar).

## Milestones

| # | Scope | Gate |
|---|---|---|
| M0 | This spec + docs updates | user review |
| M1 | Importer, lossless parser, `content/do/`, `build_do()` corpus pass, pinning | 100% in-scope files parse, zero unknown tokens; round-trip fixtures; sizes journaled; Cofficium runnable |
| M2 | Condition evaluator, reference resolver, rules | exhaustive unit tests (stopword × scope × instruction; et/aut/nisi; reference torture cases) |
| M3 | Kalendar (occurrence/concurrence/precedence/transfers) | full-year 2025–2027 × 3 versions matches DO |
| M4 | Mass assembly, `producer/do-mass`, cutover + teardown | golden Mass matrix; fragment parity review; `pnpm test` green |
| M5 | Minor hours + Compline, `producer/do-hour`, 5 practices, `doVersion` pref | hour goldens; primitives-guide compliance |
| M6 | Lauds + Vespers (preces, suffragium, concurrence, antiphona finalis) | goldens incl. first-Vespers dates |
| M7 | Matins (nocturns, lessons, responsories, Te Deum, Tenebrae) | goldens |
| M8 | Multi-version hardening, settings UI, `collection/breviary`, pinning UX | full matrix green; <~200ms warm assembly |

## Status

- M0: spec written (this document).
- M1: done — `scripts/import-do.ts` (pinned clone), parser in `packages/divinum-officium/src/parser/` (38 tests incl. fixture round-trips), `scripts/build-do-content.ts` → `content/do/` (deterministic), `build_do()` in `scripts/build-corpus.py` (15 `do-data` items), pinning collector. Cofficium runnability confirmed: vendor CGI.pm + URI from CPAN into `.do-golden-lib/` (gitignored) and run `PERL5LIB=<repo>/.do-golden-lib perl Cofficium.pl 'date1=MM-DD-YYYY' 'command=prayLaudes' 'version=Rubrics 1960 - 1960' 'lang2=English'`.
- M2: done — `conditions/` (vero + parse_conditional + the process_conditional_lines scope machine), `references/` (setupstring port: per-section language layering, whole-file preamble inheritance, @-inclusion resolution with Perl-substitution semantics, Paschaltide commons redirect, missa→horas and Cist→M→Roman fallbacks), `rules.ts`, `loader.ts` + `node/fsLoader.ts`. **Differential-tested against DO's own Perl** via `test/perl-harness/{process-lines,setupstring}.pl`: every conditional-bearing Latin section × 3 versions (scope machine) and ~190 sampled files × 3 languages × 3 versions (full setupstring) are byte-identical.
- M3: done — `kalendar/` (Date.pm port, Directorium tables, officestring with monthday overlay, the full occurrence() port, precedence()/resolveDay). **Gate passed: full-year differential 2025–2027 × 3 versions (3,287 days × 3) against real `horascommon.pl::precedence`** — winner, rank, commemoratio(s), commune, scriptura, daynames, duplex, laudes, transfervigil, monthday all identical (`test/perl-harness/precedence.pl`, copied into the clone's cgi-bin to satisfy FindBin). Deferred to later milestones: concurrence (Vespers/Compline resolution, M6 — resolveDay throws for those hours), initiarule (M7, display-only), votive offices, dioecesis calendars.
- M4: in progress. Porting map (validated against the Perl):
  - `missa/<L>/Ordo/Ordo.txt` is the Mass script for ALL our v1 versions (Ordo67/OrdoM/OrdoN are 1965-67/NewMass-only; version differences live in conditionals inside Ordo.txt). `missa/ordo.pl::getordinarium` reads it raw + `process_conditional_lines` (already ported); `Ordo/Propers.txt` is the propers-only script variant.
  - `missa/propers.pl::specials` walks the script: `#Label` section heads (with `omit … <label>` rule check, 1570 Leonine omission, Passio special-casing, `translate_label` incl. Gradual→Alleluia in Pasch), `!&hook` lines (run hook, drop line: GloriaM/Credo/Introibo/AgnusHook/CheckQuiDixisti/CheckPax/CheckBlessing/CheckUltimaEv/placeattibi push '!omit.' or set skipflag), `!*X` skip-to-blank directives (S=solemn-only, R=read-only, D=defunct-only, nD, !*&sub eval), `&communicantes` + Communicantes rule, `N.p/N.b` pope/bishop replacement, `(...)`→rubric-or-strip, plus `$`/`&` expansion later via `expand()` (webdia.pl:1081: `&f(args)`→dispatch, `$rubrica X`→Rubricae.txt, `$X`→Ordo/Prayers.txt; missa always expands).
  - ScriptFuncs (propers.pl): introitus/lectio/graduale(+Sequentia)/evangelium(+Gloria tibi/Laus tibi/Maundi)/offertorium/communio via `getitem` (winner→commune→Sunday file `$dayname[0]-0` with Epi1-0a/Pent01-0a redirects, GradualeP in Pasch, Tractus in Quad, GradualeF ferial, alleluia-paren stripping); collect/secreta/postcommunio(+Super populum) via `oratio(type)` (Source comment, OratioW weekday variants, commune fallback, `replaceNdot`, papal_prayer (horascommon 2206-2274), Sunday fallback for tempora, triduum-1960 psalm split, `Sub unica conclusione`, Oremus/Flectamus, check_coronatio, LectionesTemporum ember readings, commemorations via setcc/getcc keyed sort + climit-like 1960 caps + delconclusio + Suffragium table); prefatio (Prefatio= rules incl. commemoentries scan, season table, `*…*` substitution, norubr); communicantes/hancigitur (Prefationes C-*/H-Pent, 1962 St Joseph); itemissaest (gloriflag/Benedicamus/Requiescant/alleluia); Vidiaquam (solemn Sunday Asperges/Vidi aquam); Ultimaev (commemorated Last Gospel logic); DominusVobiscum (LectioL suppression); Gloria (Patri; Passiontide omission, Requiem); Communio_Populi (popup — emit '').
  - Text lookups: `load_languages_data` with missaf → `prayer` = Ordo/Prayers.txt, `rubric` = Psalterium/Common/Rubricae.txt, `translate` = Psalterium/Common/Translate.txt, per lang→fallback→Latin.
  - Rendering: `resolve_refs` is HTML — replaced by a DoBlock mapper (keep `~` merging, `!`/`!!`/`!x!` semantics, v./r. markers, rubrics=on). Goldens compare Cmissa.pl HTML stripped to text vs blocks flattened.
- M5–M8: not started.
