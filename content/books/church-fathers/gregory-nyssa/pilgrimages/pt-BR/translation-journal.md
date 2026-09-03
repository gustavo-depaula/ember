# Translation Journal — On Pilgrimages (pt-BR)

Source: en-US (Moore & Wilson translation, NPNF Second Series vol. 5, via New Advent)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| pilgrimage(s) | peregrinação(ões) | title term |
| the Holy Life | a Vida Santa | capitalized to match source's capitalized "Holy Life" |
| Modesty (as the mark of the contemplative life) | Modéstia | capitalized per source |
| the higher life | a vida mais alta | |
| the Gospel rule of life | a regra evangélica de vida | |
| the Holy Council | o Santo Concílio | refers to the council that commissioned Gregory's visitation |
| Heads of the Holy Jerusalem Churches | Chefes das Santas Igrejas de Jerusalém | |
| our most religious Emperor | nosso religiosíssimo Imperador | |
| the Holy Spirit | o Espírito Santo | |
| Golgotha / the Mount of Olives / the memorial-rock of the Resurrection | Gólgota / Monte das Oliveiras / rocha memorial da Ressurreição | proper/holy-site names |
| Cappadocia / Cappadocian | Capadócia / capadócia | region name kept as-is |
| Arabia | Arábia | |
| a conductor (for a travelling woman) | um condutor | **not** *guia* — the source's "conductor" is the person who physically escorts her (puts her on the horse, lifts her down, supports her), not someone who shows the route; *guia* also fights the next clause, where this person may be a mere *conhecido* |
| yeoman's service | bom serviço | commendatory idiom (Hamlet V.ii) = good, faithful service — **not** *penoso serviço* (arduous), which inverts the sense and imports a complaint the source does not make |
| our waggon | nossa carruagem | the imperial post vehicle; unmarked *carro* reads as "automobile" to a modern pt-BR reader and destroys the image the sentence depends on |
| but as it is | mas, na realidade | discharges the preceding counterfactual; *como está* is a subjectless calque |
| by postal conveyance | por meio do transporte postal | *conveyance* is the **means of transport** (the vehicles and relays of the imperial *cursus publicus*) — which is why the next clause can say "nossa carruagem". `serviço postal` substitutes a service for a vehicle and reads as modern mail delivery (Correios). *Posta* would be the historical term but in pt-BR it reads first as a cut of fish, so `transporte postal` keeps the sense without the ambiguity |
| the Dispenser of my life | o Dispensador de minha vida | **not** *Aquele que dispõe de minha vida* — *dispor de* is a fixed idiom ("to have at one's disposal"); the source's agent noun is the one who allots/administers. `Dispensador` is the established Catholic pt-BR term (cf. *Autor e Dispensador* in `trent-catechism/pt-BR/creed-10`, and *dispensadores dos mistérios de Deus*, 1 Cor 4:1) |

## Translation Decisions

- Single unbroken paragraph in the source (no section breaks, no numbered items) preserved as a single paragraph in the translation — matches the pattern used for other short church-fathers epistles (e.g. `gregory-thaumaturgus/trinity`).
- No Scripture chapter:verse citations appear in this letter (unlike other Gregory of Nyssa/Thaumaturgus fragments already translated), so there was no book-name-translation decision to make here.
- The rhetorical quotation `"blows" where He "lists"` (an allusion to John 3:8, "the wind bloweth where it listeth") was translated as `"sopra" onde "quer"` — matching the sense (the Spirit acts according to its own will) rather than the archaic "listeth", which has no natural Portuguese equivalent. This phrase does not appear as a direct quotation elsewhere in the pt-BR corpus to match against.
- Divine pronouns ("ele"/"nele"/"-lo") kept lowercase mid-sentence, capitalized only at sentence-initial position — following the convention documented in the `gregory-thaumaturgus/trinity` journal, confirmed here against corpus usage in `ignatius/*/pt-BR` and `ambrose/mysteries/pt-BR` (lowercase "ele"/"nele" dominate; no other file in `church-fathers/*/pt-BR` uses a capital "nEle" or "-Lo").
- No editor or author footnotes present in the source — none to drop or preserve.
- No translator notes added — the letter's historical references (the Holy Council, the imperial postal service) are already explained by context within the text itself and don't need glossing for a general reader.

## Review Rounds

Three independent adversarial review rounds, each a fresh bilingual (and, in round 3, additionally monolingual) read with no access to prior rounds' conclusions. All three reported clean; no fixes were needed.

- **Round 1** — full sentence-by-sentence bilingual comparison, completeness (exact term-occurrence counts for God/Deus, Jerusalem/Jerusalém, Christ/Cristo, Holy Spirit/Espírito Santo, and the 7-item vice list), diacritics spot-check, tu/vós register consistency, divine-pronoun capitalization verified independently against the claim in this journal, markdown structure, book.json. Clean.
- **Round 2** — mechanical structural counts (semicolons 25/25, question marks 7/7, exclamation marks 1/1, quotation pairs 3/3, em-dashes — the one PT delta is a legitimate restructuring of an English comma clause into a dash-set clause, not added content); full proper/place-name occurrence parity (13 names/terms, all exact matches); verb mood/tense fidelity in the exhortative close; false-friend idiom check (licence, conductor, yeoman's service, waggon) — all correct senses. Clean.
- **Round 3** — cold monolingual Portuguese proofread (grammar, gender/number agreement, verb conjugations including `críamos`/`jejuávamos`/`concedera`, no mojibake or duplicated words); bilingual logical-connective pass (Now/Ora vs. Agora, Whereas/Ao passo que, Inasmuch as/Visto que, etc. — no connective flattened to a bare "e"); firstly/secondly/thirdly enumeration checked against the source itself (source has no "firstly", only secondly/thirdly — PT mirrors this exactly); formatting (no trailing whitespace, no double spaces); book.json re-verified (valid JSON, both languages listed, TOC id matches filename). Clean.

### Post-merge review (rounds 4–5)

The three rounds above were wrong. A post-merge audit run of `/review-book-translation` took four further fix rounds — seven in total — to reach a genuinely clean result, finding **sixteen** objective defects along the way. Three were in the very idioms round 2 had named and cleared by name ("false-friend idiom check (licence, conductor, yeoman's service, waggon) — all correct senses"); only *licence* had actually been right.

- **Round 4** — three parallel agents (sense-level bilingual, mechanical/structural, cold monolingual). Twelve defects found and fixed:
  - *yeoman's service* → was `penoso serviço` (arduous), a **sense inversion** of a commendatory idiom → `bom serviço`
  - *conductor* → was `guia` (route-guide), wrong referent → `condutor`
  - *waggon* → was `carro` (reads as automobile), anachronism → `carruagem` (with `tão bom` → `tão boa` for the new feminine head noun)
  - *made it a part of their devotion* → was `fizeram parte de sua devoção`, which the fixed idiom *fazer parte de* forces to read "**were** part of their devotion" → `incluíram em sua devoção`
  - *but as it is* → was `como está`, a subjectless calque → `na realidade`
  - *for yourself as well* → `também para ti` (dropped *as well*, and *mesma* had been added to compensate)
  - *as it were* → `por assim dizer` (dropped metaphor hedge, which continues the carpenter's-rule image)
  - *many examples* → was `tantos` (sets up an unsourced consecutive reading) → `muitos`
  - *those celebrated spots themselves* → `esses próprios lugares célebres` (dropped *themselves*)
  - *placed … to live* → `colocado, para nele viver,` (dropped *to live*)
  - *your inner man* → `vosso homem interior` (dropped possessive)
  - *matters with them were in confusion* → `os assuntos entre eles` (source locates the confusion in the persons, PT had put it in the place)
- **Round 5** — fresh bilingual re-audit of the corrected file found **two further pre-existing defects** that round 4 had missed (neither was introduced by round 4's fixes):
  - *there is no form of uncleanness that is not perpetrated **among them*** → was `que **ali** não se pratique`, relocating the charge from the inhabitants to the place. Gregory's whole argument is that the *people's* morals disprove an abundance of grace in them; the preceding clause already says `entre os que ali vivem`, so the PT said the same thing about the place twice and never landed the charge against the persons → `que não se pratique **entre eles**`
  - *the **Dispenser** of my life* → was `Aquele que **dispõe de** minha vida`, captured by the fixed idiom *dispor de* ("to have at one's disposal") → `pelo **Dispensador** de minha vida`
- **Round 6** — fresh bilingual + monolingual/mechanical re-audit after the round-5 fixes. One defect, and it was **introduced by round 4's own fix**: restoring the dropped "to live" as `fui colocado, para nele viver, pelo Dispensador de minha vida` had inserted the purpose clause between the passive verb and its agent phrase, so `pelo Dispensador…` could be misparsed as modifying `viver` rather than `fui colocado`. The English keeps the agent adjacent to the verb ("placed **by the Dispenser of my life** to live"); reordered to match → `fui colocado pelo Dispensador de minha vida, para nele viver,`. **A fix that restores dropped content still has to be placed where the source puts it — an omission repaired in the wrong slot is a new defect.** The round-6 bilingual reviewer separately found one more original defect: "by postal **conveyance**" as `por meio do **serviço** postal`, substituting a service for a means of transport → `transporte postal`. Notably, round 5's bilingual reviewer had examined this exact phrase and **cleared it by name** as "a standard historiographical term for the imperial *cursus publicus*" — two independent adversarial readers, opposite verdicts on the same words.
- **Round 7** — final confirming bilingual + monolingual/mechanical audit of the exact final text. Both **clean**. Mechanical parity re-verified on the final bytes: semicolons 25/25, question marks 7/7, exclamation marks 1/1, quote pairs 3/3, headings 1/1, paragraphs 2/2, UTF-8 clean with a single trailing newline, `book.json` valid with both locales and the TOC id matching files on disk.

**Open judgment call — `transporte postal`.** Three reviewers, three verdicts on the same three words ("by postal conveyance"): round 5 cleared `serviço postal` by name as standard *cursus publicus* historiography; round 6 called it an anachronism and a service-for-vehicle substitution; round 7 accepted `transporte postal` as grammatical and correct in sense while noting it still reads slightly modern/administrative, and floated `serviço de posta` or `correio imperial` — explicitly as an observation, not a correction. Left as `transporte postal`. If a future pass wants to revisit it, the constraint set is: keep the *conveyance* (vehicle/relay) sense, avoid the modern-Correios frame, and avoid bare *posta*, which in pt-BR reads first as a cut of fish.

**Lesson: a cold monolingual reviewer cannot adjudicate a third-person hortative.** Round 4's monolingual agent flagged `Ouçam de mim minha justificativa` as a *vocês*-imperative breaking the letter's `tu`/`vós` register, and proposed `Ouvi`. That "fix" would have been a real defect — the English is "**Let them** hear from me my plea", addressed *about* the objectors, not *to* the reader, so the third-person `Ouçam` is correct and `Ouvi` (vós) would have changed the referent. The finding was still a useful signal, though: the bare form is genuinely ambiguous, and this file marks its other hortatives with *Que* (`Que nosso próprio caso… não cause`, `que nosso conselho seja ouvido`). Resolved as `Que ouçam de mim…` — source meaning preserved, ambiguity removed. Reject a monolingual reviewer's *fix* when it depends on the source; keep its *observation* that something reads ambiguously.
