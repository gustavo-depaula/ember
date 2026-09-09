# Translation Journal — The Passion of the Scillitan Martyrs (pt-BR)

Source: en-US (trans. J. Armitage Robinson, Ante-Nicene Fathers, Vol. 9; via New Advent)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Scillitan (Martyrs) | Scilitano(s) | **Not** "Cilitano" — that would collide with *Cilícia* (Cilicia, Asia Minor), an unrelated place. Verified against pt.wikipedia.org/wiki/Mártires_Scillitan and circulodeculturabiblica.org ("mártires scilitanos"), both derived from *Scillium*, the martyrs' home town in Numidia. |
| proconsul | procônsul | matches `church-fathers/polycarp/martyrdom/pt-BR` |
| genius (of the Emperor) | gênio | the Roman *genius Augusti* — tutelary/guardian spirit of the emperor, an object of the imperial cult oath; not "génio" in the sense of "genius/talent" |
| the Emperor | o Imperador | |
| Cæsar (as in "honour to Cæsar") | César | matches `church-fathers/polycarp/martyrdom/pt-BR` ("fortuna de César") |
| persuasion (i.e. religious conviction/sect, used pejoratively by the pagan magistrate) | seita | chosen to preserve the ironic echo between Saturninus's "cease to be of this persuasion" (l. 17) and Speratus's retort "it is an ill persuasion to do murder" (l. 19) — both render the same English word the same way in Portuguese |
| chest (Speratus's box of scriptures) | arca | |
| tablet (the decree Saturninus reads from) | tábua | |
| to be put to the sword / sword | fio de espada | idiomatic pt-BR phrase "passar a fio de espada", not a literal "posto à espada" |

## Proper Names

All personal names (Praesens, Claudianus, Speratus, Nartzalus, Cittinus, Donata, Secunda, Vestia, Saturninus, Veturius, Felix, Aquilinus, Laetantius, Januaria, Generosa) are kept in their Latin form, unadapted — **deliberately not** given the `-us`→`-o` Portuguese ending used for some names in the sibling text `church-fathers/polycarp/martyrdom/pt-BR` (e.g. Germanicus→Germânico, Statius Quadratus→Estácio Quadrato). Verified against the Portuguese Wikipedia article "Mártires Scillitan" and two independent Portuguese-language martyrologies (circulodeculturabiblica.org, mercaba.org's Spanish equivalent for cross-check): every established Portuguese-language source on this specific text keeps all twelve names in unadapted Latin form, including Saturninus and Felix. Followed that precedent rather than the Polycarp text's convention, since this is a per-text choice the corpus makes on a name-by-name / source-by-source basis (see the Polycarp journal's own mix of adapted and kept-as-is names).

Only orthographic change applied: the æ ligature is expanded to "ae" in both names that carry it in the source — "Præsens" → "Praesens" and "Lætantius" → "Laetantius" — matching how "Cæsar" is written without the ligature elsewhere in this corpus (`church-fathers/polycarp/martyrdom/pt-BR`).

## Address (tu vs. vós)

This is a joint trial of six defendants (later twelve, at sentencing) with Speratus as spokesman. The English "you" is unmarked for number throughout, so number had to be decided line by line:

- **Plural (vós)** for Saturninus's opening address (l. 5, before anyone has spoken), the two lines explicitly marked "said to the rest" / continuing that address (l. 17, l. 21), and the sentencing exchange from "Will you have a space to consider?" onward (l. 35, l. 43) — the last of these is confirmed plural by the source's own "bethink **yourselves**".
- **Singular (tu)** only where the text marks a direct one-on-one exchange: Speratus's "lend me your ears" / Saturninus's reply (l. 11–13, unambiguous since there is only one proconsul), the line explicitly marked "said **to Speratus**" (l. 31), and the immediate follow-up about "your chest" (l. 39), which continues that direct exchange about Speratus's own personal possession.

Recorded here so a review round does not "fix" this as an inconsistency — it's a deliberate line-by-line reading, not a uniform default.

## Scripture References

Preserved with the same book/chapter/verse as the English source, book names localized to standard Portuguese Catholic usage: 1 Timothy 6:16 → 1 Timóteo 6:16; Romans 13:7 → Romanos 13:7. Matches the convention already established across `church-fathers/*/pt-BR` (see e.g. `ignatius/epistle-to-polycarp`, `barnabas/epistle`).

## Translation Decisions

- "return to a sound mind" (l. 5) rendered "voltardes à sã razão" rather than a literal "voltardes a uma mente sã" — idiomatic Portuguese collocation, same meaning.
- The italicized Scripture quotation ("*whom no man has seen...*") keeps the source's italics, matching how other church-fathers pt-BR files render inline Scripture quotations.
- No footnotes in the source (this file has none to drop or keep).

## Review Log

- **Round 1 (2 parallel readings — structural/completeness, semantic fidelity): one real defect found and fixed, one documentation nit fixed.**
  - Fixed: l. 7 "because we pay heed to our Emperor" had been rendered "porque obedecemos ao nosso Imperador" ("because we obey our Emperor") — a stronger claim than the source. "Pay heed to" asserts civic respect, not submission; the scene's whole point is that the martyrs grant Cæsar honor but refuse his religious commands (ll. 13, 17, 21), so "we obey" one line before repeated on-record refusals undercuts the text's own logic. Fixed to "porque honramos o nosso Imperador" — "honramos" also deliberately echoes Donata's later "Honra a César como César" (l. 25), the same honor/obedience distinction Romans 13:7 draws.
  - Fixed (documentation only, no text change): the "Proper Names" section's ligature note said only "Lætantius" was ligature-expanded, when the file does the same to "Præsens" — the file itself was already correct, only the journal's own description of it was incomplete.
  - Considered and not changed: l. 9 "welfare" → "prosperidade" narrows toward "prosperity" rather than general well-being; judged a minor nuance, not a meaning-reversing error.

- **Round 2 (2 parallel readings — corpus consistency/naturalness, bidirectional omission sweep): two real defects found and fixed, both independently corroborated.**
  - Fixed: l. 47 dropped "and **the rest**" from "Speratus, Nartzalus, Cittinus, Donata, Vestia, Secunda **and the rest** having confessed...". This is a separate clause from the deliberate 6-name/12-name split documented above (that split is correct in both languages) — "and the rest" says the decree's confession covers the 6 named *plus* unnamed others, which had gone missing. Fixed to "...Vestia, Secunda e os demais confessado...".
  - Fixed: l. 19 "Má seita é **fazer** homicídio, **dizer** falso testemunho" used two English calques — Portuguese doesn't pair "fazer" with "homicídio" or "dizer" with "falso testemunho". Corpus-wide grep (`trent-catechism`, `bonne-presse-catechism-in-pictures`, `pius-x-greater-catechism`, `aquinas-opera-omnia/.../commandments-08-not-bear-false-witness`) shows the consistent house collocations are "cometer/praticar homicídio" and "dar/levantar falso testemunho". Fixed to "Má seita é cometer homicídio, dar falso testemunho."
  - Checked and confirmed clean: all recurring theological/legal terms (procônsul, César, cristão/cristã, mártires) against ~28 sibling church-fathers pt-BR files — no unexplained outliers; "seita" and "fio de espada" have empty/near-empty comparison sets corpus-wide, which is not evidence of a problem, and both are already justified above.

- **Round 3 (2 parallel readings — fresh full bilingual fidelity, verification of this journal's own cited claims): clean.** The fresh fidelity read re-derived subject/verb/object/polarity/modality for every sentence pair from scratch and found nothing beyond what rounds 1–2 already fixed. The citation-verification pass re-opened every checkable claim above (Polycarp precedents, the "seita" echo, the tu/vós line table, the Round 1/2 fix claims, the Scripture-localization precedent) and confirmed each one is genuinely true, not just plausible — with two minor precision notes, neither requiring a text or journal change: (a) "cometer homicídio" (Round 2 fix) is attested corpus-wide as a collocation but only in passive/reflexive form ("Comete-se homicídio"), while the active-voice precedent for this exact pairing is "praticar homicídio" — the fix stands since both verbs are legitimate house forms for the same noun; (b) the "~28 sibling files" count is 29, within the hedge of "~".
- **Round 4 (2 parallel readings — adversarial read for theological precision/register/prose naturalness, mechanical build+metadata+commit-history integrity): clean.** Specifically checked the Trinitarian closing formula, the lord/Lord case distinction (Emperor vs. God), the honor-vs-fear distinction in Donata's Romans 13:7 line, and tu/vós register consistency — all intact. Mechanical check confirmed: diff touches only this book's three files, book.json is valid with complete bilingual metadata, `pnpm build:corpus` is clean with no warnings for this book and the catalog entry carries both langs, and the pt-BR file has no frontmatter/stray HTML/unbalanced markdown/trailing-whitespace issues.

**Review closed after 4 rounds (rounds 1–2 found and fixed 4 real defects; rounds 3–4 consecutive clean).**
