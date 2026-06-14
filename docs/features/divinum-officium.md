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
| Versions | **11 office versions** (Tridentine 1570/1888/1906, Divino Afflatu 1939/1954, Reduced 1955, Rubrics 1960, Monastic 1617/1930/1963/Barroux) — all fully hour-verified | Ordo Praedicatorum (Dominican), Cistercian/Altovadensis, votive offices |
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
- M4: engine + golden gate DONE — `src/mass/` (texts, state, handlers, assemble) passes the Cmissa differential: 14 dates × {Rubrics 1960, Divino Afflatu} × {Latin, English} match word-for-word through the entire Mass (`src/mass/differential.test.ts`). Monastic is intentionally not a Mass version (monks use the Roman missal; DO's own Cmissa list omits it — the app should offer 1960/DA for Mass). Remaining M4 work: DoBlock mapper (AssembledMass items → primitives), `producer/do-mass` app source, practice flow flip, old-EF teardown (§Teardown). Known TODOs (M8): multi-Mass days (missanumber), Ordo/Communio.txt inline content, votive Masses. Porting map (validated against the Perl):
  - `missa/<L>/Ordo/Ordo.txt` is the Mass script for ALL our v1 versions (Ordo67/OrdoM/OrdoN are 1965-67/NewMass-only; version differences live in conditionals inside Ordo.txt). `missa/ordo.pl::getordinarium` reads it raw + `process_conditional_lines` (already ported); `Ordo/Propers.txt` is the propers-only script variant.
  - `missa/propers.pl::specials` walks the script: `#Label` section heads (with `omit … <label>` rule check, 1570 Leonine omission, Passio special-casing, `translate_label` incl. Gradual→Alleluia in Pasch), `!&hook` lines (run hook, drop line: GloriaM/Credo/Introibo/AgnusHook/CheckQuiDixisti/CheckPax/CheckBlessing/CheckUltimaEv/placeattibi push '!omit.' or set skipflag), `!*X` skip-to-blank directives (S=solemn-only, R=read-only, D=defunct-only, nD, !*&sub eval), `&communicantes` + Communicantes rule, `N.p/N.b` pope/bishop replacement, `(...)`→rubric-or-strip, plus `$`/`&` expansion later via `expand()` (webdia.pl:1081: `&f(args)`→dispatch, `$rubrica X`→Rubricae.txt, `$X`→Ordo/Prayers.txt; missa always expands).
  - ScriptFuncs (propers.pl): introitus/lectio/graduale(+Sequentia)/evangelium(+Gloria tibi/Laus tibi/Maundi)/offertorium/communio via `getitem` (winner→commune→Sunday file `$dayname[0]-0` with Epi1-0a/Pent01-0a redirects, GradualeP in Pasch, Tractus in Quad, GradualeF ferial, alleluia-paren stripping); collect/secreta/postcommunio(+Super populum) via `oratio(type)` (Source comment, OratioW weekday variants, commune fallback, `replaceNdot`, papal_prayer (horascommon 2206-2274), Sunday fallback for tempora, triduum-1960 psalm split, `Sub unica conclusione`, Oremus/Flectamus, check_coronatio, LectionesTemporum ember readings, commemorations via setcc/getcc keyed sort + climit-like 1960 caps + delconclusio + Suffragium table); prefatio (Prefatio= rules incl. commemoentries scan, season table, `*…*` substitution, norubr); communicantes/hancigitur (Prefationes C-*/H-Pent, 1962 St Joseph); itemissaest (gloriflag/Benedicamus/Requiescant/alleluia); Vidiaquam (solemn Sunday Asperges/Vidi aquam); Ultimaev (commemorated Last Gospel logic); DominusVobiscum (LectioL suppression); Gloria (Patri; Passiontide omission, Requiem); Communio_Populi (popup — emit '').
  - Text lookups: `load_languages_data` with missaf → `prayer` = Ordo/Prayers.txt, `rubric` = Psalterium/Common/Rubricae.txt, `translate` = Psalterium/Common/Translate.txt, per lang→fallback→Latin.
  - Rendering: `resolve_refs` is HTML — replaced by a DoBlock mapper (keep `~` merging, `!`/`!!`/`!x!` semantics, v./r. markers, rubrics=on). Goldens compare Cmissa.pl HTML stripped to text vs blocks flattened.
- M5: done — `src/hours/` (state, scripts, psalmi, capitulis, preces, helpers, assemble) + `kalendar/concurrence.ts` (full statement-for-statement concurrence() port, needed because Compline resolves against tomorrow). **Gate passed: hours differential green** — 12 dates × 5 horas (Prima/Tertia/Sexta/Nona/Completorium) × 3 versions × 2 languages match the real Perl char-for-char (`src/hours/differential.test.ts`, Pofficium.pl harness — NOT Cofficium, see journal). Martyrologium data deferred to M8 (Prima emits an unavailability note; the differential prunes the block on both sides). Regula dataset imported (Monastic Prima reads the daily Rule of St. Benedict). App side: `producer/do-hour` (`apps/app/src/sources/divinum-officium/do-hour.ts`, params `{hour}`, prefsDeps lang+doVersion), 5 practices `content/practices/breviary-{prime,terce,sext,none,compline}/`. Porting map (validated against the Perl):
  - Flow per hour: `getordinarium` (horas.pl:579 — do_read Ordinarium/<Hora>.txt + process_conditional_lines + '#Prelude' prefix; Tertia/Sexta/Nona share Minor.txt) → `specials()` (horas/specials.pl:21 — the #-directive walker) → per-line `$`/`&` expansion (webdia expand; horas $expand='all' for the app) → spell_var/waitNN render-finish (shared with Mass).
  - specials() walker order matters: Special <hora> override via `loadspecial` (un-double antiphons pre-1960); 'Capitulum Versum 2' rule replacement; `Omit … <section>` rule (with the secreto Pater/Ave/[Credo] re-push for pre-1955 Incipit); 'Ave only' rule; #Commemoratio officii parvi (CommuneM/C12 'COP <hora>'); #Preces → preces()/getpreces (preces.pl — feriales/dominicales decision incl. commemoentries rank scan); #Invitatorium → M7; #Psalmi → psalmi() (psalmi.pl: psalmi_minor for P/T/S/N/C — Monastic/Tridentine/Divino+1960 layouts from 'Psalterium/Psalmi/Psalmi minor.txt', seasonal antiphon via gettempora('Psalmi minor'), proprium override via getproprium('Ant <hora>')/getanthoras, feastflag Ps 53/99+92 Prima rules, Quicumque, '[NNN]' bracketed Prima psalm w/ laudes2, Prima=53 rule; then antetpsalm → 'Ant. x' + &psalm(n) lines + closing full antiphon); #Capitulum (Prima → capitulum_prima specprima.pl; T/S/N/Completorium → capitulum_minor + minor_reponsory from 'Psalterium/Special/Minor Special.txt' + getproprium Responsory/Versum substitution chains; Nocturn-Versum mapping per hour); #Lectio brevis (Prima → lectio_brevis_prima; Completorium → Minor Special 'Lectio Completorium'); #Hymnus → gethymn (hymni.pl); #Oratio → orationes.pl oratio() for T/S/N (Prima/Completorium orations live in the Ordinarium script itself, except Triduum 'Limit Oratio'); #Martyrologium (Prima — data NOT imported in v1: emit heading + TODO note); #Commemoratio defunctorum (Prima Special); #Antiphona finalis (seasonal BMV antiphon table + &Divinum_auxilium); #Conclusio specials (Laudes Litania / Special Conclusio / dirge Defunctorum — M6).
  - getproprium (horas variant, specials.pl:443) ≠ missa's: tryoldhymn HymnusM redirect (oldhymns || Monastic/1570/OP), daisy-chained pseudo-commune `;;(ex|vide) C…/Sancti…` (≤5 hops, vide only with flag), Nocturn-Versum substitute table, replaceNdot with Ant=/Oratio= Name selection.
  - setcomment (horas variant) DOES push to @s (unlike missa); Comment.txt headline suffixes are real here. `-1` index suppresses.
  - &-functions (horasscripts.pl, non-gabc paths): psalm() (range args '(NNN, v1, v2)', '-NNN' nogloria for Trident/Monastic 148/149/62/115, title 'Psalmus N(v1-v2)' + [counter], canticle title/source from line 1 for 150<n<300, range filter by verse numbers, antline dagger via getantcross, handleverses non-gabc: verse numbers + parens → /:rubric:/ wrapping, ‡→† flexa, &Gloria append unless 210/nogloria, $ant→'Ant. <antline>' for Ps94); Gloria/Gloria1/Gloria2 (triduum_gloria_omitted, Requiem gloria, Quad5/6 responsory rules); Alleluia (line 2 in Quad unless Septuagesima_vesp); Dominus_vobiscum(/1/2) ($priest flag — app default false → 'Domine exaudi' lines 2-3, precesferiales → line 4); Benedicamus_Domino (Pasc0/Septuagesima alleluia doubling); Divinum_auxilium (V./R. with Roman contraction); Domine_labia (Monastic ×3); teDeum; mLitany (Kyrie + pater secreto unless preces Dominicales); special() (11-02).
  - Shared helpers still to port: gettempora (horascommon.pl:2277 — already read, ports straight), checksuffragium (horas variant, M6), checkcommemoratio, postprocess_ant/postprocess_vr/postprocess_short_resp + alleluia_required + Septuagesima_vesp + triduum_gloria_omitted (LanguageTextTools.pm — read next), getantcross (webdia), regula (monastic Prima — specmatins/appendix?), $priest preference (app: default false).
  - Goldens: **Pofficium.pl** harness — `command=pray<Hora>` + `version=` + `lang1=Latin lang2=English` gives the one-version two-language layout (Cofficium is the two-VERSION compare tool: when version1==version2 it silently forces column 2 to Divino Afflatu). Compared as char streams (`node/wordStream.ts charDivergence` — Perl splits red initials, desynchronizing word-level merging). The site's default display setup is noinnumbers=1 + noflexa=1 (decoded from the horasp cookie defaults; the variables are never assigned in code) — handleverses must strip subverse letters and inline verse numbers.
- M6: done — Lauds + Vespers. New ports: `psalmi_major` (Monastic/Tridentine/Roman layouts, greater-Advent ferial antiphons + get_stThomas_feria, antecapitulum override, Psalm5 Vespera substitution rules, the Monastic 4-antiphon Vespers fold, the Paschaltide single-Alleluia-antiphon rewrite), `capitulum_major` + `monastic_major_responsory` (capitulis), `hymnusmajor` + `checkmtv` + hymnshift/hymnshiftmerge (Directorium Hy-table), the canticum Benedictus/Magnificat path with `ant123_special` (greater-Advent O-antiphons, papal 'Dum esset' antiphon) and `getantvers`/`getseant`, the full `oratio()` commemoration machinery (orationes.pl: getcommemoratio, vigilia_commemoratio, getrefs @-reference expansion with octave dedupe, delconclusio, the 1960 one-commemoration cap with its lexicographic key sort, Sub-unica-conclusione handling), `getsuffragium` + the Suffragium walker branch, the Laudes Litania (Rogation/St Mark) conclusion, the dirge/Defunctorum conclusion, and `papal_rule`/`papal_prayer` (horas C4 flavour). **Gate passed: hours differential green char-for-char — 16 dates × 7 horas (now incl. Laudes + Vespera) × 3 versions × 2 languages**, with octave/concurrence dates added (Dec 26, Aug 15, Jan 1, Nov 2). App: `breviary-lauds` + `breviary-vespers` practices (producer/do-hour already covers all 8 hours). Porting finds in the journal (extract_common always-overwrite, the $caller gate on 'All Souls ends after None', cwinnerSections persistence).
- M7: done — Matins. `src/hours/matins.ts`: invitatorium (Invitatorium.txt $ant/$ant2 placeholder machinery with the Invit2–6 seasonal transforms), hymnusmatutinum (+hymn shift/merge via the Directorium Hy-table), psalmi_matutinum (Roman: Day/Daya tables, seasonal Versum substitutions, getantmatutinum versicle interspersing, ant_matutinum_paschal, 9-lesson nocturns vs 3-lesson offices, votive nocturn) and psalmi_matutinum_monastic (Daym tables, 12-lesson two-nocturn + canticle third nocturn sub una antiphona, lectio brevis/legend in 'summer' matins, MM Capitulum, lectioE Gospel reading with missa-area fallback), nocturn(), lectiones() with get_absolutio_et_benedictiones (cujus_q benediction shifting), the full lectio() ScriptFunc (1960 lesson-type divergences, scriptura1960 contraction, initia transfer tables via resolveitable/tferifile, StJamesRule, commemorated 9th/12th lessons, responsories with responsory_gloria, Te Deum), contract_scripture/gettype1960. **Gate passed: hours differential green char-for-char — 16 dates × all 8 horas × 3 versions × 2 languages** (full package: 66 tests). App: `breviary-matins` practice. The Perl-replacement engine in `references/substitutions.ts` now implements `\u`-titlecasing (incl. `\u$1`) — required by Matins lesson substitutions.
- M8: done (v1 scope) — **Martyrologium imported + ported**: `Martyrologium/` + `Martyrologium1960/` datasets (368 day files each per language; Mobile.txt sectioned, day files plain) → `do-data/horas-martyrologium{,-1960}`; `src/hours/martyrologium.ts` ports martyrologium() with the gregor() Gregorian epact computus and the luna() fallback — **the hours differential now compares the complete office with zero pruning** (16 dates × 8 horas × 3 versions × 2 languages). `&special('#…')` re-entry (All Souls' Special Prima Martyrologium) implemented via `specialsForItem`. App: `doVersion` selector in Settings (calendar section, en+pt), `collection/breviary` grouping the 8 hour practices (night/day/evening sections). Perf gate passed: warm assembly ≤ 37ms (Matins), ≤ 20ms other hours, 8ms Mass (target was <~200ms). Deferred beyond v1 (tracked, not silently dropped): multi-Mass days (`missanumber` — All Souls' three Masses), votive offices/Masses (app always prays 'Hodie'), Ordo/Communio.txt inline content for the faithful's communion, additional rubric versions (Tridentine, 1955, Cist/OP), date browser.
- Phase 1 (multi-version): 8 more office versions imported and selectable — Tridentine 1570/1888/1906, Divino Afflatu 1939, Reduced 1955, Monastic Tridentinum 1617, Monastic Divino 1930, Monastic Barroux. **All 11 versions are fully hour-verified** against the Perl (16 dates x 8 horas x 2 langs each — `verifiedHourVersions`; `partialHourVersions` is now empty). Phase 1.5 closed the last gaps: the Tridentine Matins psalm scheme + sanctoral responsory/Contract8 lessons, the Corpus Christi monastic Nocturn III antiphon, and the Barroux Sext chapter. Settings drives the selector from `doVersionOrder`; `Martyrologium1570`/`1955R` imported for their Prime. EF Mass still maps every version to a verified missal (1960 or DA) via `massVersion` until per-version Mass verification lands.
- Phase 2 (Dominican / Ordo Praedicatorum) and Phase 3 (Cistercian/Altovadensis): not started — each needs its data dirs (`TemporaOP/SanctiOP/CommuneOP`, `TemporaCist/…` + `Necrologium`) imported and substantial rite-specific engine porting + verification.
