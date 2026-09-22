# Decisions

Gustavo, night of 2026-09-20: "as long as you document the decisions, and deliberate thoughtfully on them, you can make decisions and then let me review them in the morning."

So this file is the log of what was decided, by whom, and why. **Every ruling by Claude is provisional until Gustavo has read it** — each says what it would cost to reverse. Decisions about a single verse live in that psalm's `prayed.json` (`decisions[]`: option 0 is the ruling, the other options are what was weighed, `why`/`note`/`audit` give the reasons) and are reviewed on the psalm's page of the site; this file holds what reaches across psalms, and points to the rest. Newest at the bottom. To overturn one: say so, or pick another option on the site and hand back "Copy my decisions".

Status words: **Gustavo** = his ruling, closed. **Claude, for review** = ruled overnight under the delegation above. **deferred** = deliberately not ruled yet, with the reason.

---

## D1 · God is addressed as *vós* — Gustavo, 2026-09-20

Closed. Record in `vos-tu.md` and `README.md`. Consequence carried everywhere: no *vós* imperative that equals a first-person past (*ouvi*, *abri*, *parti*).

## D2 · How far the ear may pull against the Latin — Claude, for review

**Question.** Ps 4's stylist found eight of ten verses "not native"; the Latinist and the judges found nothing to fix. Gustavo: "I really liked the stylist suggestions, they are really great." Which wins, and by what rule, so that 150 psalms are decided the same way?

**Ruling.** The working rule of the night becomes the rule: **keep the Latin's words, images, repetitions and ambiguities; yield to the ear on grammar and order.** A copula, auxiliary or subject pronoun Portuguese needs may be supplied; natural Portuguese order beats the Latin's; of two faithful words the plainer wins. A stylist's fix is taken whenever it changes only *how* the thing is said. It is refused — and kept as an option — when it swaps the Latin's word for another word's meaning, dissolves a repetition the Latin has, closes an ambiguity the Latin leaves open, or says what the Hebrew says where the Latin says something else. ~~Outer bound: no further from the Latin than Matos Soares 1932 went, usually less.~~ *(Struck by Gustavo, 2026-09-21 — D28.)*

**Why.** (1) It is the only rule under which the stylist and the Latinist can both be right: on Ps 4 five of the stylist's six proposals are about grammar and order, and only one (*fez maravilhas pelo seu santo*, 4:4) changes the sense — and that one is exactly the Hebrew reading the project exists not to import. (2) The text is prayed *beside the Latin column*; a reader crossing columns must find the same words and images on both sides, but does not need the same syntax. (3) It matches what the one Vulgate-family Portuguese antecedent actually did: Matos Soares supplies *sereis* in 4:3 and keeps *fez maravilhoso o seu santo* and *compungi-vos*. (4) Across Pss 90, 133, 53 and the Nunc dimittis tonight the rule produced clean Latinist gates on the final drafts while taking roughly half of the stylist's remarks — it is workable, not just principled.

**Cost of reversing.** Towards the ear: the refused stylist options are all recorded as options, so it is a matter of picking them. Towards the Latin: the taken fixes are in each psalm's `audit` with the draft kept (`prayed.v1.json`), so they can be walked back verse by verse.

## D3 · *exaudíre → escutar*; *audíre → ouvir*; *inténdere → atender* — Claude, for review

**Ruling.** As recommended in `words/exaudire.md`. One verb for all 74 places.

**Why.** *Exaudíre* is a hearing verb, and the Greek behind it (εἰσακούω 50×, ἐπακούω 25×) does not split along any line the Latin marks, so one Portuguese verb is justified. *Ouvir* is excluded at the commonest form, the imperative, because *ouvi* is also "I heard" (D1). *Atender* (Ps 4 draft 2) says "hear and grant" well but is needed for *inténde*, which stands parallel to *exáudi* in 16:1, 54:2, 60:2, 140:1 — two Latin verbs would collapse into one. *Escutar* is free, plain, works in every person and tense met so far (*escutai*, *escutou-me*, *me escutará*, *eu o escutarei*), and already circulates in Brazilian devotional use of the versicle (seen in unofficial sources; the official wording was not verified). What is lost: the "and grant" overtone of *ex-*; judged less costly than a collision.

**Cost of reversing.** One glossary verb; in each psalm it is (or will be) a single multi-slot decision, so it flips per psalm in one touch. Ps 4 moves from *atender* to *escutar* in its draft 3 (D8).

## D4 · *áuribus percípere → dar ouvidos a* — Claude, for review

Proposed by the Ps 53 agent for all eight places (5:2, 16:1b, 38:13, 48:2, 53:4, 83:9, 85:6, 142:1 — list from the concordance, `words/percipere.concordance.md`). **Ruled as proposed.** It keeps the ears the Latin names (rule: images stay), stays apart from *escutar* and *atender* with which it stands in parallel, and is safe at the *vós* imperative (*dai* ≠ *dei*). Cheap to reverse: one glossary row, one decision per psalm.

## D5 · *confitéri* (to God) → *dar graças a* — Claude, for review

**Question.** *Confitémini Dómino quóniam bonus* and every other place the verb is said to God (not yet counted — a concordance is owed: `words.py confiteri`): *louvar*, *confessar*, or *dar graças*?

**Ruling.** *Dar graças a*, as the Ps 53 agent proposed against my own pencilled *louvar*. *Confessar* stays for confessing sin (31:5).

**Why.** (1) *Louvar* is needed for *laudáre* / *laus*, which stand in parallel with *confitéri* in 34:18 (*Confitébor tibi… laudábo te*), 108:30 (*Confitébor Dómino… laudábo eum*) and 105:47 (*confiteámur nómini… in laude tua*) — verified in the DO text; the same collision argument as D3. (2) *Dar graças a* keeps the dative the Latin always has (*confitébor tibi*, *nómini tuo*). (3) *Confessar o Senhor* in current Portuguese means to profess faith in him, or is simply opaque; it fails "no archaism needing a footnote". (4) *Dai graças ao Senhor, porque ele é bom* is sayable four times running and takes the stress where a psalm tone wants it. **Known cost:** the noun *conféssio* (95:6, 103:1, 110:3, 148:14a) will not always follow as *ação de graças* — *conféssio et pulchritúdo* is not thanksgiving; the noun is left `open` and decided where it is met. Ps 117 is being translated with this verb now.

**Cost of reversing.** High in count, low in labour: it is one multi-slot decision per psalm. Worth Gustavo's attention first of all the glossary rulings.

## D6 · *salutáre* and *salus* both → *salvação* — Claude, for review

The Latin distinguishes them only as neuter adjective-noun vs. noun, the Greek has σωτήριον / σωτηρία the same way, and Portuguese has no natural pair (*salutar* is an adjective of health; *socorro* and *auxílio* are taken). 90:16 *salutáre meum* and the Nunc dimittis *salutáre tuum* are both *a … salvação*, which also matches what the ear expects at Compline. If a psalm sets the two side by side, that psalm makes it a decision.

## D7 · Tituli are out of the first edition — Claude, for review

DO's psalm files have no tituli, Ember's Latin column shows none, and the text is made to be prayed beside that column. Adding them would need a second Latin source collated to the same standard. They can be added later without touching a prayed verse. Free to reverse.

## D8 · Ps 4 moves to draft 3 under D2 and D3 — Claude, for review

Ps 4 was held for Gustavo; under the delegation it is now ruled like the others, his review page keeps every alternative. Draft 2 is kept as `ps004/prayed.v2.json`. Verse by verse:

| | Ruling | Why |
| --- | --- | --- |
| *exaudívit, exáudi, exáudiet* (4:2a, 2b, 4) | **escutar** — *escutou-me*, *escutai*, *me escutará* | D3 |
| *úsquequo gravi corde?* (4:3) | **the stylist's: *até quando tereis o coração pesado?*** | supplies a verb, nothing else — grammar, D2; Matos Soares supplies one too (*sereis*) |
| *mirificávit sanctum suum* (4:4) | **draft: *fez maravilhoso o seu santo*** — stylist refused | *fez maravilhas pelo* is the Hebrew's sense, not the Latin's; Matos Soares 1932 has the draft's wording |
| *compungímini* (4:5) | **draft: *nos vossos leitos compungi-vos*** — stylist refused | *arrepender-se* is another word (*pænitére*); the sting is the Latin's image; verb-last keeps the cadence; Matos Soares: *compungi-vos* |
| *Sacrificáte sacrifícium* (4:6) | **draft: *Sacrificai um sacrifício*** — stylist refused | the repetition is the Latin's own (D2) |
| *multiplicáti sunt* (4:8) | **the stylist's: *eles se multiplicaram*** | a subject pronoun (grammar, D2) — and it prevents a wrong parse: without it the ear takes *trigo, vinho e azeite* as what multiplied, which *a fructu* excludes |
| *singuláriter in spe* (4:10) | **draft: *vós, Senhor, a sós na esperança*** — stylist refused | *só vós* decides an ambiguity the Latin leaves open |
| *dilatásti mihi* (4:2a) | **draft: *me abristes espaço*** | *me pusestes ao largo* (Matos Soares) keeps the width better, but in Brazil *ao largo* is heard first as "at a distance / offshore"; kept as an option, and to be looked at again when 118:32 *dilatásti cor meum* is translated |
| *bona*, *signátum*, order of 4:7 | draft | no argument against them was made by any reader |
| *in idípsum* (4:9) | draft *a um só tempo* — **deferred**, see D9 | |

## D9 · *in idípsum* — deferred

Six places (4:9, 33:4, 40:7, 61:10, 73:6, 121:3). Not ruled tonight: it needs its own word study (the Greek ἐπὶ τὸ αὐτό, Augustine's reading of *idipsum* as a name of God, what each context tolerates) and none of the other five places has been translated yet. *A um só tempo* stands in 4:9 meanwhile.

## D10 · Ps 133: *in sancta → para o lugar santo* (singular) against the Latinist — Claude, for review

The Latinist gate flagged the lost plural twice (the second time as major). Ruled for the agent's singular. *Sancta* is the plural-for-the-sanctuary idiom (τὰ ἅγια); *os lugares santos* in Brazilian Portuguese names the pilgrimage sites of the Holy Land, which is a wrong sense, where the singular is merely a lost number. Matos Soares 1932 has the singular. (The agent also cited DO's Portuguese; that text is no authority — see D12 — and carries no weight here.) The plural stays as an option. This is the one place tonight where a final text stands against the Latinist; it is listed here so that it is not missed.

## D11 · Ps 133: *benedícere* stays one verb (*bendizei… te bendiga*) — Claude, for review

The Latin has one verb for man blessing God and God blessing man, and the psalm is built on the turn; every parallel switches to *abençoe* in the last verse. Kept as one verb under D2 (repetitions stay); the blind reader understood *O Senhor te bendiga* as a blessing without help and the stylist called it the best line. *Te abençoe* is option 2. Glossary: *benedícere* God→man stays `open` until a psalm shows a place where *bendizer* cannot carry it.

## D12 · DO's Portuguese is not a witness; it is the destination — Gustavo, 2026-09-20

Gustavo: "i have been contributing with AI to DO recently, so if it is a recent rendering, it shouldnt be as authoritative. also there is a lot of mistakes there on PTbr. this work is for there." So (1) `content/do/horas/Portugues/` is never evidence for a wording — agreement with it proves nothing, since parts of it are recent AI-assisted work; it stays in the parallels only as the thing being replaced, labelled so; (2) **the finished psalter is meant to go to Divinum Officium** as its Brazilian Portuguese psalter, so the output must be deliverable in DO's own file format (one prayed verse per line, DO's ids and marks — which the method already guarantees) and whatever is sent upstream must first have passed Gustavo. Tonight's agents, briefed before this was known, cite it as "pt-PT" some thirty-five times across Pss 90, 133, 53 and the Nunc dimittis (checked by grep): nearly always beside Matos Soares 1932 or Douay-Rheims, or as a contrast; in two places it is the only company named (90:16 *de longos dias*, Nunc dimittis *deixais ir*), and both of those are argued on their own merits in the same note. So no ruling falls with it — but read every "and pt-PT" in those notes as carrying no weight. Ps 117 has the same habit (37 mentions): its agent received the correction mid-work, took it for text injected into a tool result, and cautiously left its notes as they were — the same reading applies there. From Ps 118 on the brief forbids citing it as evidence.

## D13 · The *ouvi / abri* ban is on the bare form; with an enclitic the imperative stands — Claude, for review

**Question.** 117:19 *Aperíte mihi portas justítiæ*. D1's consequence bans *vós* imperatives of *-ir* verbs that equal the first-person past. The Ps 117 agent obeyed it with a jussive, *Abram-se para mim as portas da justiça*; the Latinist marked the lost imperative **major** on both drafts (the people addressed disappear), and the stylist asked for the imperative too.

**Ruling.** The ban holds for the **bare** form (*Ouvi a minha oração*, *Abri as portas* — the ear can take either for "I heard / I opened"). It does not hold where an **enclitic object pronoun** is attached: *Abri-me as portas da justiça*. 117:19 returns to the imperative (Ps 117 draft 3; draft 2 kept).

**Why.** The ban exists for the ear, not for the form. *Abri-me as portas* can only be heard as first person by taking *-me* as a reflexive ("I opened the gates to myself"), which no one hears, least of all at the head of a verse that goes on *darei graças ao Senhor*. Both antecedents that matter have exactly these words — Matos Soares 1932 (Vulgate family) and the Diurnal Monástico 1962 (Brazilian, prayed) — checked in `consult/parallels/ps117.md`. And a major finding of the Latinist gate should not stand against a rule whose reason does not apply.

**What it does not reopen.** D3: *exáudi* mostly takes a noun object (*exáudi oratiónem meam* → bare *ouvi a minha oração*, still banned), and the collision argument for *escutar* is independent of the ban. *Ouvi-me* would now be permissible where the Latin is *audi me*; whether it is wanted is for the psalm that meets it. The canticle *Aperíte portas* (DO id 26:2, no pronoun) stays under the ban.

**Cost of reversing.** One option in 117:19.

## D14 · The refrain: *porque é para sempre a sua misericórdia* — Claude, for review

*Quóniam in sǽculum misericórdia ejus* — 117:1–4, 29; the refrain of Pss 105 and 106. The glossary's working form *porque para sempre é a sua misericórdia* was said four times running, as 117:1–4 has it, and trips twice: *porque para* stutters, and *sempre é a sua* stacks three vowels. **Ruled for the agent's proposal**, the same words with the copula moved up: *porque‿é* and *sempre‿a* each elide cleanly, *para sempre* still stands before the subject as *in sǽculum* does, and the line still ends on the mercy, where the Latin ends. The stylist passed it without remark. The plain-speech order (*a sua misericórdia é para sempre*, Matos Soares) ends five cadences running on the adverb. *Eterna é a sua misericórdia* was offered by the agent from memory as possibly the wording sung at Mass in Brazil — **unverified**, and it would spend *eterno* which the glossary keeps for *in ætérnum*. **Not ruled here:** Ps 135's *quóniam in ætérnum misericórdia ejus* (27 times) — *porque é eternamente…* is not obviously sayable; the psalm decides when it is translated, and may force this ruling to be revisited so that the two refrains stay kin.

## D15 · The law-vocabulary of Ps 118 — Claude, for review

The study is `words/ps118-terms.md` (counts from the Latin by `ps118/terms.py`: 182 law-words in 176 verses; *mandáta* 38, *justificatiónes* 29 — and once in the other 149 psalms; *præcéptum* never in this psalm; 81 of the 182 stand at a cadence). The translating agent ruled a set; this confirms it with one change.

| Latin | Ruled | Note |
| --- | --- | --- |
| *lex · testimónia · mandáta · judícia · via · sémita* | **lei · testemunhos · mandamentos · juízos · caminho · vereda** | the cognates, all sayable at a cadence |
| *justificatiónes* | **preceitos** | confirmed. *Justificações* means excuses, or the theological act, and would need the footnote the style rules forbid — Matos Soares, translating this Latin, never wrote it. *Decretos* (the Diurnal's word, from the Hebrew) is an act of government in Brazil and sits ill with the psalm's verbs — one learns, keeps, sings *preceitos*. *Preceitos* is free because *præcéptum* never occurs in the psalm; *præcéptum* elsewhere (8×, mostly πρόσταγμα) is proposed as *decreto*, still `open`. |
| *verbum* | **palavra** | fixed by *secúndum verbum tuum* = the Nunc dimittis |
| *sermo* | **palavra(s)** — **overruling the agent's *fala*** | see below |
| *elóquium* | **dito** | confirmed, as the least certain of the set. λόγιον is a second word in the Greek too, so it keeps a word of its own. *Promessa* (the Diurnal, from the Hebrew) interprets, and fails where the *elóquium* is kept, spoken, or a man's (118:67, 158, 172; 18:15a; 103:34). The formula *segundo o vosso dito* is untested on a reader — the next portion (118:38, 41) is the test, and the agent's named fall-back if it sounds too slight is *promessa* inside Ps 118 only. |
| *confúndi* | **ser envergonhado** | confirmed: the blind reader heard *não serei confundido* as "I shall not be confused" in both verses. It costs the traditional last line of the *Te Deum* (30:2 *non confúndar in ætérnum*) — that line is decided when Ps 30 is translated, with this noted. |

**On *sermo*.** The agent kept *verbum* and *sermo* apart (*palavras* / *falas*) under the rule that the Latin's variations are the Latin's to make. The stylist refused *as vossas falas* three times — "lines in a play", "sounds made up" — and asked for *palavras*; the blind reader understood it. I rule for *palavras*. The test I have been applying in D3 and D5 is whether a distinction *means* something: *exáudi / inténde* and *confitéri / laudáre* are different verbs in the Greek as well. *Verbum / sermo* are one Greek word (λόγος, both in 118:42); the variation is the Latin translator's elegance, with no difference of sense to carry over — whereas *elóquium* (λόγιον) is a real second term and keeps its own word. Portuguese has no plain pair for an elegance, and D2 gives the ear "the plainer of two faithful words". Every Vulgate-family version merges them (Douay-Rheims, Matos Soares 1932), so this stays inside the outer bound. **Cost, accepted:** where the Latin sets the two side by side (118:42, 55:11, 102:20) the Portuguese repeats a word the Latin varies; each of those verses decides locally. *Falas* stays as an option; Ps 118:1–32 is at draft 3 with draft 2 kept.

**Cost of reversing any term:** one multi-slot decision per portion of the psalm — every later portion adds its slots to the same decisions.

## D16 · *elóquium*: plural *os vossos ditos*, singular *o que dissestes* — Claude, for review (revises D15)

**What happened.** D15 named *segundo o vosso dito* as untested and the least certain word of the set. 118:33–80 was the test: the singular stands six times (118:38, 41, 50, 58, 67, 76). The Latinist passed it; the blind reader understood it in every place; **the stylist refused it in all six** — "a quoted phrase", "bookish", "unspontaneous in the mouth of one who begs" — and in 118:76 heard *dito ao vosso servo* as a participle missing its noun. The translating agent's own ear: clear but thin. It kept the ruled word, as briefed, and handed the question back.

**The three ways out.** (a) *palavra*, the stylist's request: all three "word" terms of the psalm become one, and *secúndum elóquium tuum* becomes word for word *secúndum verbum tuum*, seven verses apart at 118:58 / 65 — this erases the one distinction of the three that the Greek makes too (λόγιον against λόγος), which is the very test D15 used to merge *sermo*. (b) *promessa*, the Diurnal's word: prays well, but it interprets — D2 refuses a rendering that says more than the Latin — and it is from the Hebrew family. (c) Keep the root and change the grammar.

**Ruling: (c).** The plural stays ***os vossos ditos*** — it passed every reader (118:11). The singular is said as a clause of the same root: ***o que dissestes*** — *segundo o que dissestes*, *guardei o que dissestes*. The idea is not mine: asked only what it understood, the blind reader paraphrased 118:38 as *"Confirmai o que dissestes ao servo"* — that is what a native ear does with *elóquium tuum*. It stays apart from *palavra*; it interprets nothing; a noun becoming a clause is grammar, where D2 lets the ear lead; and in 118:76 it removes the misheard participle.

**Tested before ruling.** Draft 6 was put to the blind stylist again (`ps118/critic/v6.stylist.part2.json`). From six refusals out of six it went to two objections, and neither is to the clause: 118:38 and 118:50 stumbled on the order around it, and were mended by order alone (*Firmai para o vosso servo o que dissestes*; *porque me vivificou o que dissestes*). In 118:76 the stylist's own proposed line keeps *segundo o que dissestes ao vosso servo*. The two mended verses have not been re-read by a critic.

**Costs.** One Latin noun has two Portuguese shapes (a noun in the plural, a clause in the singular) — same root, but a reader crossing columns sees a noun on one side and a verb on the other. The perfect *dissestes* dates an utterance the Latin leaves timeless. Where the singular needs to be a noun — a genitive (118:123 *elóquium justítiæ tuæ*), a man's word (103:34), *elóquium Dómini* (104:19) — the verse decides locally, with *dito* available. The thirteen verses of Ps 118 still to come that have the word (20 in all, 7 translated) will use it; if Gustavo's ear rejects it, the honest retreat is *palavra* (a), not *promessa*.

**Cost of reversing.** One multi-slot decision (`eloquia`) per portion; *o vosso dito*, *promessa* and *palavra* are all there as options.

## D17 · Address follows the speaker: when God speaks to one person, he says *tu* — Claude, for review

**Question.** Ps 2:7–9 is the psalter's first case of a divine person being spoken *to* by God: *Fílius meus es tu, ego hódie génui te. Póstula a me…* D1 makes God *vós* when he is addressed; the brief makes a single human addressee *tu*. For the Church the Anointed of this psalm is the Son. Which governs?

**Ruling.** *Tu*: ***Tu és meu Filho, eu hoje te gerei. Pede-me, e eu te darei as nações…*** The rule behind it, for the glossary: **address follows the speaker.** *Vós* in this psalter is the voice of the one who prays, speaking up to God (D1, `vos-tu.md`); it is not a badge of the addressee's rank. When God himself speaks to a single addressee — his Anointed (2:7–9), the king, the just man (90:9–13 is already *tu*) — he says *tu*. Proposed by the Pss 1–3 agent; adopted.

**Why.** *Vós sois meu Filho* puts distance exactly where the Latin is most intimate; a father owes his son no deference. Both Portuguese antecedents have *Tu és meu filho* (Matos Soares 1932; the Diurnal, which says *tu* throughout, so it proves only that the line is known so). It also keeps the verse clear of the homograph ban: the *vós* imperative of *Póstula* is *Pedi-me*. Neither blind reader was troubled by a *tu* inside a *vós* psalter, and the stylist named 2:7 the best line of the psalm.

**What it governs, and what it does not.** It will govern 109:1 (*Sede a dextris meis*), 109:4, 88:27–28, wherever God is the speaker. It does **not** settle the psalmist addressing the Messiah-king (Ps 44), nor a verse where the praying voice turns to Christ: those are the praying voice, and D1 leans to *vós*; the psalm that meets them decides and proposes.

**Cost of reversing.** One multi-slot decision (`address`) in Ps 2; the *vós* forms are all written and selectable.

## D18 · *Servíte Dómino* stays under the homograph ban: *Sede servos do Senhor* — Claude, for review — **Gustavo: this one wants your ear first**

**Question.** *Servi ao Senhor* (2:11; 99:2) is what Matos Soares 1932 and the Diurnal print, what the Latinist (twice) and the stylist asked for — and *servi* is also "I served". The object is a noun, so D13's enclitic exception does not reach it. The agent kept the ban (*Sede servos do Senhor*) and asked for a ruling like D13.

**Ruling.** The ban holds. 2:11 stays ***Sede servos do Senhor no temor***; *Servi ao Senhor* is option 2 of decision `servite`, one touch away.

**Why I did not relax it.** D13 turned on one test: does the reason for the ban — the ear — apply? In *Abri-me as portas* it did not. Here it does: *Servi ao Senhor no temor* opens a verse, a fresh intonation on the other side of the choir, and "I served the Lord in fear" is a perfectly good psalm sentence (the psalmist says such things of himself constantly); only the second colon (*e exultai*) corrects it, after the fact. The ban is also Gustavo's (it came with D1), and D13 already said of the parallel case *Aperíte portas* (no pronoun) that it stays banned. Narrowing a rule of his by reasoning that its reason is absent is within the delegation; lifting it where its reason is present is not.

**What Gustavo should weigh.** This is the ban's highest price so far: two well-known lines (2:11 and 99:2 *Servíte Dómino in lætítia*), a verb turned into copula + noun, a dative into a genitive. In 99:2 the imperative comes second in its verse, after *Jubiláte Deo, omnis terra* — if any place could carry the bare form by context, it is that one. A possible rule for him to take or leave: *the bare form is allowed when an unambiguous imperative has already sounded in the same verse*. That would free 99:2 and not 2:11. Not adopted; recorded.

**Cost of reversing.** One slot here; 99:2 not yet translated.

## D19 · Words settled from Pss 1–3 — Claude, for review

- ***beátus* → *bem-aventurado*** (*Bem-aventurado o homem*, 1:1; *bem-aventurados todos*, 2:13). The Latin psalter never says *felix*; Matos Soares 1932 has *Bem-aventurado* in both verses (`consult/parallels/ps001.md`, `ps002.md`), the Diurnal has *Feliz* — Vulgate family governs sense (rule 1), and *beátus* is a verdict before it is a mood, which is what *feliz* has become. It keeps the psalter joined to the Beatitudes as the Latin is (*Beáti páuperes*). Cost: six syllables for three, at the head of 29 verses. *Feliz* stays an option wherever it occurs.
- ***præcéptum* → *decreto*.** Proposed in D15, now tried by the agent against all eight places (2:6, 7:7b, 18:9, 80:5, 93:20, 98:7, 104:10, 148:6 — the list checked by grep against the DO Latin). Always singular; it frees *preceitos* for *justificatiónes* in Ps 118. If *justificatiónes* is ever moved, this returns to *preceito*.
- ***suscéptor* → *amparo*, *suscípere* → *amparar*.** Ps 3 has noun and verb two verses apart (3:4, 3:6) and the echo holds; 3:6b is 117:13b word for word and now reads the same in both psalms; held with a genitive in 53:6. Stays apart from *protéctor → protetor* and *adjútor → auxílio*.
- ***Christus* (singular) → *Cristo*** (*contra o Senhor, e contra o seu Cristo*, 2:2). The Latin borrows the Greek word and a Latin ear hears "Christ"; Matos Soares 1932, Douay-Rheims and even the Hebrew-family Diurnal print *o seu Cristo*. The plural *christos meos* (104:15) cannot follow and is left open (*ungidos*).

Left **open or working** on purpose, because the psalm that tests them has not been reached: *concílium → assembleia* (collides with *ecclésia* in Ps 21), *contérere* and *confríngere* both *quebrar* (45:10 has them side by side), *in unum → juntos* (48:3 *simul in unum*), *iter → caminho* (merges with *via* in 1:6, as the Greek and the Vulgate-family versions do), *conturbáre → perturbar*, *erudímini → deixai-vos instruir*, *exsultáre* + dative → *exultar para*.

## D20 · Ps 2:12 *de via justa → fora do caminho justo*, against the Latinist — Claude, for review

The second place (after D10) where a final text stands against a major finding of the Latinist gate, so it is logged. The Latinist wants the calque *pereçais do caminho justo*. Refused: in Portuguese *perecer de* names the cause of death (*perecer de fome*), so the calque would be heard as "die of the just way" — a wrong sense, where *fora do* is at worst a flattened one. *Fora de* is "out of", which is the Greek's ἐξ (ἐξ ὁδοῦ δικαίας, as the agent cites it; not re-checked here); it is Matos Soares 1932's wording, so it is inside D2's outer bound; and the blind ambiguity reader understood the colon at once. The calque is option 1 of decision `devia`.

## D21 · Ps 6:2 = 37:2: *árguere → repreender* (overruling the agent's *acusar*); *corrípere → castigar* — Claude, for review

**Question.** *Dómine, ne in furóre tuo árguas me, neque in ira tua corrípias me* opens the first and the third Penitential Psalm, word for word. The Pss 5–6 agent ruled *não me acuseis … nem me castigueis* and named it the ruling most in need of Gustavo's ear. Its reasons for *acusar*: it is a sense Lewis & Short gives (*arguisse accusasse et convicisse*), the word is free in the glossary, *repreender* is already the working word for *increpáre* (a different Greek verb), and *repreendais* has a hiatus before the stress.

**Ruling.** ***Senhor, não me repreendais no vosso furor, * nem me castigueis na vossa ira.*** *Corrípere → castigar* stands as the agent had it (Matos Soares 1932 *nem me castigues*, Douay-Rheims *chastise*, the Diurnal; one Greek verb with *castigáre* of 117:18, and the two Latin verbs never meet). *Árguere → repreender*. Ps 6 moves to draft 3 (`ps006/draft3.py`; draft 2 kept; *acuseis* is option 1).

**Why.** Every living witness says rebuke: Douay-Rheims (*rebuke me not*), the Diurnal (*não me repreendas*); Matos Soares 1932 keeps the cognate *arguas*, which in Brazil is what an examining board does. The pair behind the verse, ἐλέγχω … παιδεύω, is reproof and chastening — what a father does to a son — and the verse asks that it not be done *in anger*. *Acusar* takes one of the several senses *árguere* holds and makes God the prosecutor in a prayer where he is judge and father; a man praying does not fear being charged by God, he fears being rebuked in wrath. That is a loss of sense, and D2 lets the ear and the glossary's tidiness give way before it.

**Costs.** *Repreender* now serves two Latin verbs, *árguere* (5 verses) and *increpáre* (12; working, one verse translated). They never stand in one verse (checked with `ps005/grep_latin.py`), but they are different Greek verbs, so by D15's own test they ought to differ; if a good second word appears for *increpáre* — most of its places are God's rebuke at the sea, the nations, the beasts (*ab increpatióne tua fúgient*) — the split can be restored there. The hiatus the agent heard is real. No critic has read draft 3.

**Cost of reversing.** One slot in Ps 6; Ps 37 not yet translated.

## D22 · From Pss 5–6: what is settled, and what is held open on purpose — Claude, for review

Settled: ***dedúcere*, *deduc me* → *guiar*** (*Senhor, guiai-me na vossa justiça*, 5:9; held before in 118:35; the cognate *conduzi-me* falls to the homograph ban even with its enclitic — "I behaved myself"). **D4 held** at its first place (5:2 *Dai ouvidos, Senhor, às minhas palavras*) and **D5 held** at 6:6 (*quem vos dará graças?*).

Held **open**, each with its row in the glossary, because more places must test them first: *dirígere* at the *vós* imperative → *endireitai* (*dirigi-me* is "I made my way"); *pérdere → fazer perecer* (*perdereis* is heard as "you will lose"); *astáre* split between *pôr-se* and *erguer-se*; *dolus / dolósus → engano / enganador*; *malígnus → malvado* (*o maligno* was heard as the devil); *in conspéctu → à vista de* (51 verses — wants its own study before it is settled); *éripe ánimam meam → libertai* (the glossary's *arrancar* says "tear out my soul" when no source is named); *suscípere* with a thing as object → *acolher* (D19's *amparar* was built on persons); *deprecátio → prece* (wants a ruling before Ps 16); *valde* and *veheménter* both → *muito*; *erubéscere → corar*.

**For Gustavo's ear in particular: *inférnus → inferno*** (6:6 *no inferno, porém, quem vos dará graças?*). It is the Latin's word and Douay-Rheims keeps it; Matos Soares 1932 paraphrases (*na habitação dos mortos*), the Diurnal has *nos limbos*; the blind reader heard the hell of the damned first. Nineteen verses; 15:10 and 138:8 are the hard ones. Not settled.

## D23 · *in ætérnum → para sempre*, one with *in sǽculum* — Claude, for review (completes D14)

**Question.** The glossary kept *in ætérnum → eternamente* apart from *in sǽculum → para sempre* "on purpose", and D14 left the refrain of Ps 135 (*quóniam in ætérnum misericórdia ejus*) unruled. Ps 118:81–128 has *in ætérnum* five times (118:89, 93, 98, 111, 112); the Latinist and the blind reader passed *eternamente*, and the stylist, without ever naming the word, wrote *para sempre* in its place in four of his proposed lines.

**Ruling.** ***In ætérnum → para sempre***, the same as *in sǽculum*. Ps 118 moves to draft 12 (`ps118/draft12.py`; draft 11 kept; *eternamente* is option 1 of decision `in_aeternum`). In 118:112 the adverb returns to the Latin's place after the object, so that *para cumprir* and *para sempre* do not touch. It follows that Ps 135's refrain will be Ps 117's: *porque é para sempre a sua misericórdia*.

**Why.** It is D15's own test: the two Latin phrases are one Greek phrase, εἰς τὸν αἰῶνα — read in the Rahlfs text of `consult/parallels/ps118.md` at all five verses, and in `ps117.md` for the refrain — so the Latin's variation carries no difference of sense. Both Vulgate-family versions merge them (Douay-Rheims *for ever* at 118:89, 111, 112; Matos Soares 1932 *Para sempre, Senhor*). And *eternamente* is a heavy five-syllable adverb where the Latin has a light phrase; the ear had already voted.

**Costs.** A reader crossing columns sees two Latin phrases and one Portuguese. Where they stand together (*in ætérnum et in sǽculum sǽculi*, 9:6 and others) the second member is *pelos séculos dos séculos*, so nothing collides. *Para sempre não esquecerei* (118:93) keeps the stanza's anaphora at the price of a slightly odd negative; Douay-Rheims and Matos Soares both turn it (*never*, *nunca jamais*) — left as the agent built it. No critic has read draft 12.

## D24 · From Ps 118:81–128: settled, standing against the gate, and held open — Claude, for review

**Settled**, each met independently by two agents or tested by a blind reader:
- ***pérdere → fazer perecer*** (5:7a, 118:95): *perdereis* is heard as "you will lose"; it is the causative of *períre → perecer*, as the Greek's one verb is. The stylist finds it heavy at 118:95 (*para me destruir* is the option there).
- ***malígnus / malignántes → malvado(s)***: in Ps 5:6 *o maligno* was heard as the devil, and in 118:115 *malignos* as demons — two psalms, two blind readers, the same fault.
- ***tota die → o dia todo***: *todo o dia* was heard as "every day" (118:97). 26 verses.
- ***exspectáre → aguardar***, apart from *speráre → esperar em* (needed before Ps 26).

**Standing against the Latinist** (third and fourth places, after D10 and D20), held as the agent left them:
- **118:92** *nisi quod lex tua meditátio mea est* stays counterfactual (*Se a minha meditação não fosse a vossa lei…*): Douay-Rheims and Matos Soares 1932 are both counterfactual, mood is grammar (D2), the indicative build was the stylist's worst line, and the Latinist had passed these very words on an earlier reading. The indicative is option 2 of `nisi_quod`.
- **118:114** *adjútor et suscéptor meus → o meu auxílio e o meu amparo*, under D19: the same unchanged words drew from him a minor, then a major, then a major. Logged because it shows the gate is not consistent between runs; a repeated major is weighed, not obeyed.

**The standing tension, for Gustavo's ear: *elóquium*.** The clause *o que dissestes* (D16) held again — it passed the stylist twice and the blind reader — but needs care after a preposition (*pelo que dissestes* was heard as cause; 118:82 now *à espera do que dissestes*). The plural *os vossos ditos* drew its first refusals (118:103, twice), and the noun *o dito da vossa justiça* (118:123) was refused twice too; the blind reader understood both. They stand under D16. The stylist wants *palavra* everywhere; that is the retreat D16 names, and it costs the one distinction among the word-terms the Greek also makes. Not changed; this is the largest open question in Ps 118 and it is one click per portion.

**Held open (D24):** *defícere in → desfalecer à espera de* (Matos Soares's word; 118:81, 82, 123), *fácere judícium → praticar o juízo* (collides with *operári → praticar*), whether *permanére* and *perseveráre* merge, *odísse* / *ódio habére*.

## D25 · From Pss 7–8: *psállere → entoar salmos*; 7:13 *converterdes*; two more places against the gate — Claude, for review

**psállere → *entoar salmos*** (7:18 *e entoarei salmos ao nome do altíssimo Senhor*; 12:6b has the same colon and copies it). Settled because Ps 9 needs it at once (9:3, 9:12). The cognate *salmodiar* failed both the stylist (specialised) and the blind reader (unknown word); *cantar* and *cantar salmos* cannot stand, because *psállere* sits beside *cantáre* in one verse (12:6b, 20:14, 103:33, 107:2 — two Greek verbs as well, by the agent's reading of the Rahlfs text). *Entoar salmos* keeps the root in the noun, keeps the dative, and is safe at the *vós* imperative (*entoai*, past *entoei*). Cost: two words for one, which 46:7's fourfold *psállite* will feel.

**7:13 *Nisi convérsi fuéritis → Se não vos converterdes***, overruling the agent's *voltardes*. The agent wrote the case for it itself and left it "for Gustavo's ear": the glossary avoids *converter* because it is heard as religious conversion, and here that is the sense; it is the Latin's own word; Douay-Rheims (*Except you will be converted*) and Matos Soares 1932 (*Se vos não converterdes*) have it; and the blind reader found that *Se não vos voltardes* can be heard as said to God — *vós* in this psalter, and asked *Voltai-vos* in 6:5 — which *converterdes* cannot. An ambiguity the Latin does not have outweighs an echo (7:13 / 7:17 *convertétur dolor ejus*) the ear barely catches across four verses. *Convértere → voltar* stays the glossary's verb; the row gains this exception: *converter* where men are told to turn to God. Ps 7 is at draft 3 (`ps007/draft3.py`; no critic has read it).

**Standing against the Latinist** (fifth and sixth places), held as the agent left them:
- **7:5b** *décidam mérito ab inimícis meis inánis → caia eu vazio, com razão, diante dos meus inimigos*: he wants an agent (*por obra dos*); neither Vulgate-family version has one, and his fix supplies a noun the Latin lacks.
- **8:5** *Quid est homo, quod memor es ejus? → Que é o homem, para que vos lembreis dele?*: he wants the Latin's indicatives; the subjunctive is how Portuguese asks this question (it presupposes the fact), mood is grammar (D2), and Matos Soares 1932 builds it the same way. He proposed two different fixes on two runs.

**Ps 8's frame** (8:2a = 8:10): ***Senhor, nosso Senhor, * como é admirável o vosso nome em toda a terra!*** — one word twice, as the Latin has it against the Hebrew's two; both verses are built from the same slots. Accepted as the agent ruled it.

**Held open:** *mandáre* (three candidates), *redímere → resgatar* (*redimi-me* falls to the ban), *comprehéndere → prender*, *synagóga → congregação*, *lacus / fóvea → cova / fosso*, *magnificéntia → magnificência* (listed by the blind reader as a word churchgoers may not know), *admirábilis → admirável*, *conculcáre* (*calque* was unknown to two readers → *pisar aos pés*; 90:13 still has *calcar* and should be revisited), *dedúcere in púlverem → fazer descer ao pó* (D22's *guiar* is for *deduc me*, guidance; the row now says so).

## D26 · Ps 118 is whole; *elóquium* is the clause *o que dissestes* in both numbers — Claude, for review (completes D16)

**Where Ps 118 stands.** 176 verses, draft 17, `checks.py` exit 0 on the whole psalm. The last portion (129–176) closed with a Latinist gate free of majors; nothing in it stands against him. Against the stylist, held for the Latin's word: 118:135 *Iluminai a vossa face* (the stanza repeats *illúminat … illúmina*; he wants *Fazei brilhar*) and 118:173 *Seja a vossa mão para me salvar* (*fíeri*, not *veníre*).

**Question.** D16 left the plural *elóquia tua* as *os vossos ditos* and D24 named it the largest open question in the psalm. The evidence is now complete: in 118:81–176 the stylist refused *ditos* every time he met it — 118:103 twice; 148, 158, 162 twice each — and never once remarked on the clause *o que dissestes*, in some fifteen places across three portions; the blind reader understood both. The last agent set out three ways: (a) stand; (b) *palavra(s)* everywhere; (c) the clause for the singulars, *palavras* for the five plurals.

**Ruling: a fourth, (d).** The clause serves the plural too — *o que dissestes* has no number: *No meu coração escondi o que dissestes* (118:11); *Como é doce à minha garganta o que dissestes* (103, which returns to the Latin's order, the natural one once the subject is a clause); *para eu meditar no que dissestes* (148); *porque não guardaram o que dissestes* (158); *Eu me alegrarei com o que dissestes* (162). All twenty places of *elóquium* now say one thing, apart from *palavra* (*verbum*, *sermo*). Ps 118 is at draft 17 (`ps118/draft17.py`; draft 16 kept; *ditos*, *palavras*, *promessas*, *falas* remain options of decision `eloquia`). The one noun left is 118:123 *o dito da vossa justiça*, where a genitive needs one.

**Why.** (b) and (c) give up, wholly or in the plural, the one distinction among the word-terms that the Greek also makes (λόγιον against λόγος) — D15's test says keep it. (a) keeps it at the price of a word the ear refuses eight times out of eight. (d) keeps it and costs only number, which is grammar, where D2 lets the ear lead.

**Tested before ruling.** The blind stylist read 118:145–162 again on draft 17 (`ps118/critic/v17.stylist.part5.json`): **no remark on 148, 158 or 162**, each of which he had refused on both earlier readings. His two remarks were on other matters (152, 157; both refused, reasons in the audit). 118:11 and 118:103 in their new form have not been read by a critic.

**Costs.** The Latin's number is not heard; the perfect *dissestes* dates the utterance (D16). For the rest of the psalter: *elóquium* outside Ps 118 (11:7 *Elóquia Dómini, elóquia casta*; 17:31; 104:19 *elóquium Dómini inflammávit eum*; 147:4 …) is often a subject with a genitive, where a clause will not always do — those psalms decide locally between the clause, *dito(s)*, and *palavra(s)*, and should say which and why.

## D27 · From Pss 9–12: *in finem* is not merged with *in ætérnum*; five words settled; four places against the gate — Claude, for review

**Question.** Both agents proposed *in finem → para sempre* across the psalter, merging it with *in ætérnum* and *in sǽculum* (D23). Ps 9's drafts had kept it apart as *até o fim*, on D15's test, and it failed where it is negated: *a paciência dos pobres não perecerá até o fim* (9:19b) was marked major by the Latinist and misheard the same way by the blind reader — *até* bounds the negation.

**Ruling.** The wordings of Pss 9 and 12 stand (*as espadas do inimigo desfaleceram para sempre*, 9:7a; *o esquecimento do pobre não será para sempre*, 9:19; *para nunca mais ver*, 9:32; *Até quando, Senhor, me esquecereis para sempre?*, 12:1). **But *in finem* is not merged: it keeps its own glossary row, whose working rendering is *para sempre* where it says perpetuity, and each psalm decides.**

**Why not merge.** D23 merged two Latin phrases because they are one Greek phrase. *In finem* is mostly another one, εἰς τέλος, "to the end" — read in the Rahlfs text at 9:7, 9:19a, 9:32; at 9:19b the Latin repeats *in finem* where the Greek has εἰς τὸν αἰῶνα, which is why *para sempre* is right there. And the Latin sets the two phrases side by side at **48:9** *laborábit in ætérnum, et vivet adhuc in finem* — merged, that verse would say *para sempre* twice. Elsewhere "for ever" may not be the sense at all (17:36b *disciplína tua corréxit me in finem*, Douay-Rheims "unto the end"; 51:7 *déstruet te in finem*): those verses decide for themselves. The formula *Úsquequo … in finem* (12:1; 73:10, 78:5, 88:47) → *Até quando … para sempre* is settled as a formula.

**Settled** (verified or tested in these psalms):
- ***períre de* → *fora de* only in *períre de via*** (D20). At 9:37 *peribítis de terra illíus*, *fora da terra* was heard by both the Latinist and the blind reader as "die outside his land"; it is *perecereis da terra dele, nações*.
- ***exacerbáre* and *irritáre* → *provocar*** when they have God as object: one Greek verb, παροξύνω, at 9:25 and 9:34 (read in the Rahlfs text). The blind reader did not know *exasperou*.
- ***húmilis* → *humilde***, beside *pauper → pobre*. (*Inops* stays open: the proposed *indigente* was listed as unknown by the blind reader twice.)
- ***in sǽculum sǽculi* → *pelos séculos dos séculos***. The Latinist has asked five times for the singular *pelo século do século*; it is the Latin's number, and no one says it. Number is grammar (D2), and the plural is how the phrase lives in Portuguese.
- ***elóquium* at 11:7 → *palavras*** (*As palavras do Senhor são palavras puras*), under D26's rule that outside Ps 118 the psalm decides: the clause cannot be repeated as a predicate, the stylist refused *ditos castos* (the plural's ninth refusal), and the psalm has no *verbum* or *sermo* to be kept apart from. 17:31 *elóquia Dómini igne examináta* follows it.

**Standing against the Latinist** (seventh to tenth places), held as the agents left them:
- **9:10** *adjútor → auxílio* against his *auxiliador*, as at 118:114 (D24).
- **9:13** *requírens sánguinem eórum*: he now reads *eórum* with *recordátus est*, on words he had passed twice; the Latin follows the Greek word for word, where the pronoun is the blood's. His reading is an option.
- **11:2** *porque já não há santo* against his perfect *desapareceu o santo*, which the blind reader heard as one man's death; both Vulgate-family versions state the present state (Douay-Rheims *there is now no saint*; Matos Soares 1932 *não se encontra um homem de bem*, checked in `consult/parallels/ps011.md`); he had passed it on the first reading.
- **12:1** *me esquecereis*: he read *obliviscéris* as a present. It is the future (the accent; the Greek ἐπιλήσῃ is a future); he had passed it on the first reading.

**Held open:** *inops*, *respícere*, *orbis terræ → orbe* (unknown to the blind reader), *despícere* of God → *desdenhar*, and the smaller rows both agents appended.

## D28 · Matos Soares 1932 is a witness, not a bound — Gustavo, 2026-09-21 (revises D2)

**Question.** D2 closed with an "outer bound": *no further from the Latin than Matos Soares 1932 went, usually less*. Was it a rule the work actually followed?

**What the record showed.** It was cited in 8 decisions (Pss 2, 7, 8, 11, 118), always one way — as licence to keep a freer wording against the Latinist ("Matos Soares goes as far") — and never to refuse a wording as too free; nothing checked it. And it could not work as a bound: Matos Soares himself sometimes paraphrases (*na habitação dos mortos* for *in inférno*, 6:6; *não se encontra um homem de bem* for *defécit sanctus*, 11:2), which the first half of D2 refuses.

**Ruling (Gustavo).** The bound is dropped, in both directions. As a ceiling it would cap the ear wherever one translator happened to stay stiff; as a licence it would let in his paraphrases. D2 stands without it: **what must be kept** is the Latin's words, images, repetitions and ambiguities, which the Latinist gate enforces; **what may bend** is grammar and order, as far as a sayable sentence needs. Matos Soares 1932 keeps the place he has earned — the Portuguese member of the Vulgate family, a witness of sense beside Douay-Rheims — and his wording may be cited when it fits, as evidence, never as permission or limit.

**What it does not change.** The 8 decisions that cited the bound stand: each also rests on its own reason (grammar or order under D2; a wrong first hearing; both Vulgate-family versions agreeing). They are not reopened.

## D29 — *sanguínes* (plural) → *sangue* — for review

**Question.** The Latin's plural of blood (*vir sánguinum* 5:7b, *de sanguínibus* 15:4b, 25:9, 50:16, 54:24, 58:3, 105:39 *in sanguínibus*, 138:19; grep) is the Greek's αἱμάτων, the Hebrew idiom for bloodshed. The Latinist asked for *de sangues* at 15:4b, twice (v1 and the v2 gate: major).

**Ruling.** *Sangue*, singular, in every place: *homem de sangue* (5:7b, already standing), *ajuntamentos de sangue* (15:4b). The major is held on purpose. *Sangues* is heard in Portuguese as a slip, not as a plural; the Latin's plural carries a sense (blood shed, blood of rites), not a count, and the blind reader heard both senses in *de sangue*. One ruling has to serve all the places, and *homens de sangues* (54:24) would not be prayed. Cost: the plural's mark is lost; a reader crossing columns sees it. *De sangues* stays selectable in Ps 15.

## D30 — *orbis terræ* → *o mundo* — for review

**Question.** Ps 9 chose *o orbe da terra*, keeping both Latin words, and made the blind reader the test. Two blind readers (Ps 9 draft 1, Ps 17 draft 1) did not know *orbe*; the Ps 17 stylist called it bookish.

**Ruling.** *O mundo*, in all the lines of *orbis terræ / terrárum* and *orbis* alone (Ps 17 counted 12). The Latin psalter never has *mundus* for the world — its only *mund-* words are "clean" and "cleanse" (18:13, 23:4, Ps 50, 88:45, checked by grep) — so *mundo* collides with nothing in the Latin, and Portuguese *puro* is what *mundus* "clean" becomes. Where *terra* and *orbis* stand side by side (89:2 *terra et orbis*), *a terra e o mundo*. Cost: *terræ* is not translated as a separate word; it is part of one phrase, "the round of the earth", whose meaning is "the world". Ps 9:8b was redrafted (Ps 9 draft 7, `ps009/draft7.py`); *o orbe da terra* stays selectable there. Ps 17:16a already reads *os fundamentos do mundo*.

## D31 — *firmaméntum* → *esteio* when said of God — for review

**Question.** Ps 17:2 *Dóminus firmaméntum meum*: the blind reader heard *o meu firmamento* as "my sky".

**Ruling.** *Esteio* (a prop, the thing that holds up) where God is the *firmaméntum* of a person: 17:2, 24:14, 70:3. *Firmamento* where it is the sky: 18:2. 72:4 (*firmaméntum in plaga eórum*, said of the wicked) and 150:1 (*in firmaménto virtútis ejus*) decide in their own psalm, with this ruling in view. The Latin word is one, and the Greek (στερέωμα) is one; the split is made because Portuguese *firmamento* has become only the sky, and a wrong first hearing is a fault (D2).

## D32 — *semen* (offspring) → *descendência*; *semente* where the verse sets it beside the plant — for review

**Question.** Ps 17:51 *sémini ejus* → *descendência*; Ps 20:11 *Fructum eórum de terra perdes: et semen eórum a fíliis hóminum* → *semente*, taken from the Latinist (major) because the line pairs it with *fruto*. One Latin word (σπέρμα), 17 lines.

**Ruling.** *Descendência* is the rendering; *semente* where the verse itself makes the image of a plant (a fruit, a harvest, a sowing beside it), as at 20:11 — there *descendência* would drop the image the Latin builds, which D2 keeps. Each later psalm checks its verse for that image. Cost: one Latin word in two Portuguese words; a reader crossing columns sees it. *Semente* everywhere was weighed and refused: *a semente de Jacó* (21:24) is heard first as seed, not people.

## D33 — *consílium* split: *conselho* for counsel and council, *desígnio* for a plan — for review

**Question.** The blind readers heard *conselhos* at 19:5 (*omne consílium tuum confírmet*) and 20:12 (*cogitavérunt consília*) as advice given to others; the sense is a person's purpose.

**Ruling.** *Desígnio* where *consílium* is what someone intends (19:5, 20:12; 32:10 *consília géntium … consília príncipum* will test it); *conselho* where it is advice (1:1, 12:2) or a deliberating body (110:1 *in consílio justórum et congregatióne*; 1:5 is *concílium*, another word). The Latin word is one (βουλή); Portuguese *conselho* no longer carries "plan", and a wrong first hearing is a fault (D2). Where a verse can mean both, *conselho*, which keeps the Latin's openness.

## D34 — *ecclésia → assembleia*; *concílium* by its Greek — for review

**Question.** Ps 21:23 *in médio ecclésiæ*, 21:26 *in ecclésia magna*; six verses earlier 21:17 *concílium malignántium*. Ten lines have *ecclésia* (ἐκκλησία in every one read).

**Ruling.** *Ecclésia → assembleia* everywhere. *Igreja* was weighed and refused: it cannot serve 25:5 *ecclésiam malignántium*, and the blind reader heard it at 21:26 as a building; the Latin word is the gathering, and *assembleia* keeps it one word through the psalter. *Concílium* goes by its Greek: *congregação* where it is συναγωγή (21:17; 39:11 by the Ps 21 agent's reading, not yet checked here — the word *synagóga* already has), and 1:5 (βουλή) keeps its *assembleia* for the echo with 1:1 *consílio*. Cost: at 1:5 *assembleia* stands for a word other than *ecclésia*; they never meet in one verse. Brazilian Catholic ears will miss *Igreja* at 21:23 = Heb 2:12 (*in medio ecclesiae*); the reader of the Latin column sees it.

## D35 — *deprecátio → prece* (the verb stays *suplicar*) — for review

**Question.** Ps 6 proposed *prece* for the noun, because *súplica* is a proparoxytone and the noun stands at a cadence in 11 of its 14 verses.

**Ruling.** *Prece*, settled. Four places agree (6:10, 16:1a, 118:169, 21:25), and it passed all three readers each time. The verb *deprecári* stays *suplicar* (118:58), so the family link is lost in Portuguese; *súplica* stays an option in each psalm.

## D36 — three verbs of hoping kept apart: *speráre → esperar em*, *exspectáre → aguardar*, *sustinére → esperar por* — for review

**Question.** Ps 26:14 *Exspécta Dóminum, viríliter age: et confortétur cor tuum, et sustíne Dóminum* has two of them in one verse; D24 had given *exspectáre* its own *aguardar*, and Ps 24 proposed *esperar por* for *sustinére* with God as object.

**Ruling.** As proposed: *Aguarda o Senhor … e espera pelo Senhor* (26:14); *esperar em* stays *speráre*'s. No reader objected to 26:14, and the preposition keeps *sustinére* apart from *speráre* while both remain "hope" to the ear, as the Greek pair ὑπομένω / ἐλπίζω does. Cost: *esperar por* and *esperar em* share a verb, so the difference rests on one small word; a reader of the Latin column sees three verbs.

## Review of the finished work (2026-09-21) — rulings from `review/consistency.md` and the reads of unread drafts

**D37 — *usque in ætérnum / usque in sǽculum* → *para todo o sempre*** — for review. The review found 17:51 *para sempre* against 27:9 *para todo o sempre* for the same phrase. D23 gave *in ætérnum* → *para sempre*; *usque* adds "all the way", and Portuguese has the phrase for it. So *usque in …* → *para todo o sempre* in every finished psalm; bare *in ætérnum* keeps D23's *para sempre*.

**D38 — *inops* → *carente*** — for review. *Indigente* was unknown to four blind readers out of four; *carente* passed (Ps 34). The three places still reading *indigente* follow. *desvalido* (the Ps 36 agent's proposal) stays an option; one reader did not know it.

**Applied as new drafts, each with its reason in the decision:** 5:12a *eternamente* → *para sempre* (D23, no exception was written); 9:23 *conselhos* → *desígnios* (D33 — same build as 20:12); 90:15 *arrancarei* → *libertarei* (no source named, as 6:5, 21:9, 33:8, 118:153, 118:170); 118:104 *odiei* → *odeio* (*odísse* in present sense, as 24:19, 25:5); 30:12 *sobremaneira* → *grandemente* (unknown to the blind reader; option 3 of `valde`).

**Not changed, and why:** *Legem pone mihi* reads differently at 26:11 (*Ponde uma lei para mim … no vosso caminho*) and 118:33 (*Imponde-me por lei … o caminho*) because the Latin's syntax differs — at 118:33 *viam* is the object, at 26:11 *legem*. The plural *elóquia* as D26's clause (118:11, 103, 148, 158, 162) drew five Latinist majors on its first read: **held on purpose**, for D26's reasons (the plural *ditos* was refused by the stylist and *palavras* is *sermo*'s under D15); Gustavo's call with D26. 4:8 *eles se multiplicaram* is still heard as the grain multiplying — Ps 4 is left for Gustavo. 31:9b's vocative is his call (HANDOFF item 16).

**Drafts made by the review** (no critic has read them): Ps 5 v4, Ps 9 v8 (also 9:26a *em todo tempo*, the majority form), Ps 11 v3, Ps 13 v3, Ps 36 v5 (D38 *carente*), Ps 17 v6 (D37), Ps 30 v4, Ps 90 v3, Ps 118 v18. Scripts in each psalm folder; shared code in `review/apply/`. All 138 pending reader remarks are resolved (`resolution` field) except 4:8 and 31:9b, which the site shows as "pending — for Gustavo".

**Counts corrected:** D29's 105:38 is 105:39. D31 also misses *firmaméntum* at 71:16, 88:41, 104:16 — they decide in their own psalms with D31 in view. *deprecátio* is 15 lines, not 14. None changes a ruling.

## D39 — Words settled from Pss 37–38 — Claude, for review

The readers for these two psalms were Claude Opus in a fresh context, not Codex (out of credits; `method.md` says so); their files name the model.

- ***illúsio → escárnio*** (37:8; 78:4). The cognate *ilusões* drew a Latinist major and all three readers heard fantasies; ἐμπαιγμός is mockery. Whether *derísum* (43:14) must stay apart from it is left to Ps 43.
- ***lumbi → lombos*** (37:8), ***cicatrix → cicatriz*** (37:6): the organ and the scar the Latin names stay (concrete images, rule 5); *entranhas* and *chagas* stay options.
- ***redargútio → repreensão*** (37:15): the noun of ἐλέγχω, echoing 37:2's *repreender* (D21) in the same psalm.
- ***detráhere → difamar*** (37:21; five more places): *caluniar* is kept for *calumniári*.
- ***magna loqui → falar grandezas***, kept. The stylist's *grandes coisas* is plainer, but neither wording carries boasting any better than the other, and the change would redraft 11:4 and 34:26b for a gain I cannot hear. It stays an option.
- ***substántia* (a person's being) → *o meu ser*** (38:6, 38:8); property (108:11) and footing (68:3) are decided where they occur.
- ***consístere advérsum → erguer-se contra*** (38:2b); ***in imágine → como uma imagem*** (38:7), held against two Latinist minors: *em imagem* is not a Portuguese sentence.
- ***refrigeráre* (passive) → *ser reanimado*** (38:14); ***esse* absolute → *existir*** (38:14 *e já não existirei*; *e já não serei* stays an option); ***obmutéscere → emudecer***.
- By D15's Greek test: ***ádvena* (πάροικος) shares *forasteiro* with *íncola*** (38:13b), and ***plaga* (μάστιγες) shares *flagelo* with *flagéllum*** (38:10). *plaga* as a wound (63:8) is decided where it occurs.
- ***exspectátio* as subject or predicate → *espera*** (38:8 *qual é a minha espera?*), which both the Latinist and the stylist asked for; 118:116's *ab exspectatióne* keeps *pelo que aguardo*. Cost: *espera* shares a root with *esperar* (D36's cost again).

Cost of reversing: each is one glossary row and one decision in Ps 37 or 38.

## D40 — *Inténde in adjutórium meum* — deferred to Gustavo

37:23 reads ***Atendei em meu auxílio*** (D3's *atender* for *inténdere*, plus the phrase *em meu auxílio*). The stylist says *atender em* is not Portuguese and asks for *Acudi em meu auxílio*; the blind reader heard "come to my help" first; the Latinist passed it twice. I agree the construction is strained: *atender* wants an object or *a*. But *acudir* drops the verb of attending that D3 keeps parallel to *exaudíre*. This is not a word for one psalm. The same Latin, as *Deus, in adjutórium meum inténde*, opens every Hour (69:2), so the psalter's most-said line will say whatever is ruled here. **It needs Gustavo before Ps 69.** Until then 37:23 keeps the agent's wording, with *Acudi* as the option.

## D41 — Words settled from Pss 39–40 — Claude, for review

Readers again fresh-context Claude Opus (as D39).

- ***fæx → borra*** (39:3 *e da lama da borra*): the second noun and its image of sediment kept. Draft 1's *lodo* made a tautology that the three readers heard.
- ***carmen → canto*** (39:4). *cântico* is kept for *cánticum* in the same verse, and *hino* for *hymnus*.
- ***insánia → loucura***, with *insániæ falsæ → as loucuras enganosas* (39:5). A madness is not "false"; the lie is in the deceit (μανίας ψευδεῖς), and MS1932 agrees.
- ***oblátio → oferenda*** (39:7, 50:21); ***pro peccáto → oferta pelo pecado*** (39:7b). The ellipsis *nem pelo pecado* would be heard as "nor because of sin".
- ***in cápite libri → na cabeça do livro*** (39:8). This keeps the image, as *caput ánguli* does. *No princípio do livro* stays the option.
- ***mendícus → mendigo***, kept apart from *pauper*, *egénus* and *inops* (D38). ***sollícitus esse → ter cuidado de***.
- ***conféstim → logo***; ***ferre confusiónem → carregar a vergonha***; ***tardáre → tardar***, kept apart from *morári → demorar* in the twin 69:6b. ***super númerum → além de todo número***.
- ***ops (opem ferre) → socorro*** (40:4); ***susurráre → sussurrar*** (40:8).
- ***supplantátio → rasteira*** (40:10). The heel of πτερνισμός and the betrayal (Jn 13:18, *levabit contra me calcaneum suum*) are both in the one word, and all three readers heard betrayal. The stylist calls it colloquial. **Flagged for Gustavo's ear**; *traição* (MS1932) is the option.
- ***Fiat, fiat → assim seja, assim seja*** (40:14, and the closes of Books II–IV). ***Benedíctus Dóminus, Deus Israël, a sǽculo et usque in sǽculum → Bendito o Senhor, Deus de Israel, desde sempre e para todo o sempre***; 105:48 copies it.
- ***annuntiáre → anunciar***, ***auferre → tirar***: working rows, uniform so far.
- The doublet 39:15b–18b ↔ 69:4–6b: Ps 69 copies each identical Latin phrase and decides only where the Latin differs (*statim*, *egénus*, *ne moréris*). Its opening line waits on D40.

Cost of reversing: each is one glossary row and one decision in Ps 39 or 40.

## D42 — Words settled from Pss 41–42 — Claude, for review

Readers again fresh-context Claude Opus (as D39). The two psalms were made in parallel and share their refrain word for word: 41:6, 41:6b, 41:11b, 41:12 = 42:5, 42:6; 41:10 = 42:2 *enquanto me aflige o inimigo*.

- **The refrain formulas are settled:**
  - *Por que estás triste, minha alma? * e por que me perturbas?*
  - *Espera em Deus, porque ainda lhe darei graças: * a salvação do meu rosto, e o meu Deus*
  - *O abismo invoca o abismo, * à voz das vossas cataratas*
- ***Introíbo ad altáre Dei → E entrarei até o altar de Deus: * até o Deus que alegra a minha juventude*** is settled, held against a Latinist minor and the stylist, who both asked for *entrarei ao*. *Entrar a* is not how Brazilians say going into a place. Each half reads alone, since priest and server say one half each. **Flagged for Gustavo:** this is the most-said line of the psalm, and his ear should decide between *entrarei até*, *entrarei ao* and *subirei ao*.
- ***discérnere → separar*** (42:1): *distingui* and *discerni* would also be heard as "I distinguished / discerned" (rule 3). ***repéllere* without *a* → *repelir***, kept apart from *afastar* and *rejeitar*. The blind reader didn't know *repelistes*; Ps 43:10 will test it again. ***addúcere → levar***.
- ***quia* → *pois*** only where *por que* questions follow (42:2). Otherwise *porque* stays the default.
- Ps 41:
  - ***epulári → banquetear-se***, ***abýssus / cataráctæ → abismo / cataratas***, ***fluctus → ondas***, and ***excélsa → alturas***: the Latin says heights, the Greek's sea swells stay an option.
  - ***sitíre ad → ter sede de***, keeping the perfect tense. ***panes → o meu pão***, the idiom, as at 40:10 (D29).
  - ***módicus → pequeno***, ***contristári / incédere → entristecer-se / andar***, ***effúndere ánimam → derramar a alma*** with *in me → em mim*, ***ad meípsum → dentro de mim mesmo***.
  - ***Hermóniim → Hermon***: the Latin carries over a name, so the Latinist's plural stays an option.

Cost of reversing: each is one glossary row and one decision in Ps 41 or 42. The refrains are four verses and one.

## D43 — Words settled from Pss 43–48 — Claude, for review

Six agents worked in parallel (Gustavo's request). Readers were again fresh-context Claude Opus (as D39). Every psalm passed its checks and a Latinist gate with no major left standing.

- ***Dóminus virtútum → o Senhor dos poderes*** (23:10, 45:8 = 45:12, 47:9; 16 lines). The Latin's *virtútes* (δυνάμεις) are powers, and *poder* is the *virtus* row's word. MS1932's and DRB's *dos exércitos* follow the Hebrew *Sabaoth*, the name Brazilian ears know. **Flagged for Gustavo:** this is his call before the formula spreads further, and every place is one decision.
- **Ps 43:**
  - ***derísum → riso***, kept apart from *illúsio → escárnio*. This answers D39's question: 78:4, the near-twin, has *illúsio*, and the Greek differs there too.
  - ***virtútes nostræ → as nossas forças***; 59:12b and 107:12b copy it.
  - ***æstimári → ser tido***, ***verecúndia → desonra*** (the Greek of *reveréntia*, so D15 joins them), ***obloqui → insultar***.
  - ***similitúdo → termo de comparação*** and ***commótio cápitis → um abanar de cabeça***, the stylist's wordings from draft 2.
  - ***post → após***; ***ventiláre → lançar ao ar***; ***diripere → saquear***; ***commutátio → troca*** (88:52 decides its own sense); ***conglutináre → colar***; ***operári (opus) → operar***.
- **Ps 44:**
  - ***The address is tu***, to both the king and the bride (rule 3; D17 left it to this psalm). That gives ***O teu trono, ó Deus*** in 44:7.
  - ***diffúndere → derramar*** (the same Greek as *effúndere*), ***femur → coxa***, ***gutta → gota***, ***vestítus / vestiménta → veste / vestes***, ***várietas → cores variadas***, ***ab intus → de dentro***, ***consórtes → companheiros***, ***próspere → próspero***.
  - ***spécies / pulchritúdo → formosura / beleza*** at 44:5a, while *spécies* alone stays *beleza* (46:5).
  - 44:5a *inténde* → *atende* hangs on D40, so it stays with it.
- **Ps 45:**
  - ***vacáre → parar***, ***transférre → transportar***, ***sonáre → ressoar***, ***ímpetus → ímpeto***, ***inclináre → inclinar-se***.
  - ***non commovébitur* with no subject → *não se abalará*** (no gendered participle, so the Latin's open subject stays open).
  - 45:5b keeps *a sua tenda* (the *tabernáculum* row). **For Gustavo:** the Marian antiphon use would favour *o seu tabernáculo*.
- **Ps 46:**
  - ***jubiláre family → aclamar / aclamação***, which frees *júbilo* for *gáudium*. It covers 13 lines, including the Invitatory's *jubilémus* (94:1–2), so Ps 94 should re-hear it.
  - ***plaudere mánibus → bater palmas***, ***terríbilis → terrível***, ***excélsus → excelso***, ***congregári → reunir-se***, ***subjícere → sujeitar***, ***sapiénter → sabiamente***.
- **Ps 47:**
  - ***aquilo → norte***, with ***látera Aquilónis → os lados do norte***.
  - ***distribúere → partilhar***, because *distribuí* and *reparti* would also be heard as "I distributed" (rule 3).
  - ***in sǽcula* alone → *pelos séculos***, kept apart from *in ætérnum → para sempre* (D23).
  - ***secúndum … sic → Segundo … assim também***, ***admirári → admirar-se***, ***apprehéndere* (fear) → *apoderar-se de***, ***vehemens → impetuoso***, ***navis → navio***, ***complécti → abraçar***, ***progénies → geração***, ***hic est → este é***.
- **Ps 48:**
  - ***terrígenæ → nascidos da terra***, ***propósitio → o que proponho***, ***calcáneum → calcanhar*** (the crux left open), ***stultus → tolo***, ***depáscere → pastar***.
  - ***interíre → morrer***, by D15's Greek test.
  - ***non … ómnia → nada***, held against the Latinist twice.
  - ***vocáre nómina in terris → chamaram os seus nomes nas suas terras***, the Latinist's major, taken.
  - ***tibi* → *tu*** when God is not addressed in the psalm.
  - **For Gustavo:** ***placátio → propiciação*** was unknown to the blind reader, and *o que o aplaque* is the plain option. **48:15b *a glória eórum → desde a glória deles***: the two Latinist runs contradicted each other (*desde* against *longe da*), so his ear decides.
- The formulas and antiphon texts of 43:5, 43:22b, 43:26, 46:2, 46:6, 47:2, 47:10–11 and the 48:13 = 48:21 refrain are settled as written.
- ***possidére*** stays open: it has many places to check first.

Cost of reversing: each is one glossary row and one decision in its psalm; *Dóminus virtútum* is three psalms so far.

## D44 — Words settled from Pss 49–55 — Claude, for review

Six agents in parallel again (49, 50, 51, 52, 54, 55; 53 was done). Readers fresh-context Claude Opus (D39). Every psalm passed its checks and a Latinist gate with no major left standing.

- **Ps 49:**
  - The formulas stand as written: ***A solis ortu usque ad occásum → Desde o nascer do sol até o poente*** (112:3 copies it); ***Deus deórum → o Deus dos deuses***, with the verb first at 49:1 so it is not heard as a vocative; ***Sacrifícium laudis → sacrifício de louvor***.
  - ***vocáre / advocáre → chamar / convocar***, ***maniféste → abertamente***, ***válidus* (storm) → *violento***, ***ordináre testaméntum → firmar a aliança***, held twice against the Latinist's *ordenam*, which is heard as "command". Also ***testificári → dar testemunho***, ***hircus → bode***, ***silva → selva***, ***immoláre → imolar***, ***honorificáre → honrar***, ***existimáre → pensar***, and ***cognóvi* (present sense) → *conheço***.
  - ***concinnáre → tramar*** (the weaver's verb); 57:3 follows. 51:4 *fecísti dolum → tramaste o engano* now shares the verb. The Latin and the Greek both differ there, and the two never meet in one psalm, so both stand. **For Gustavo:** 51:4 is the one place *tramar* renders *fácere*.
  - **For Gustavo:** 49:21 ***iníque*** stays open. The adverb *iniquamente* (DRB, MS1932) is in the text, and the vocative *ó iníquo* (the Latinist, twice) is the option.
- **Ps 50:**
  - The texts said alone are settled as written: ***Aspérges me*** (50:9), ***Cor mundum*** (50:12), and ***Dómine, lábia mea apéries → Senhor, abrireis os meus lábios***, keeping the future, which also escapes rule 3's *Abri*.
  - ***principális → soberano***, ***contribuláre → atribulado***, ***víscera → entranhas***, ***ámplius → ainda mais***, ***dealbári → ficar mais branco***, ***benígne fácere → tratar benignamente***, ***contra me* (ἐνώπιον) → *diante de mim***, ***audítus → ouvido***, ***hyssópus → hissopo***, ***delectári → deleitar-se***, ***exsultáre + accusative → exultar em***.
  - **For Gustavo:** *espírito santo* (50:13) is lower case, as the DO Latin prints it. The bare vocative *Deus*, as in the finished psalms, is kept against the familiar *ó Deus*. 50:19 *desprezareis* leaves the *desdenhar* row open, because the Greek is 21:25's verb.
- **Ps 51:**
  - ***benígnitas → benignidade***, ***novácula → navalha*** (*afiado* for an edge, *agudo* for a point), ***præcipitátio → ruína***, ***emigráre* (transitive) → *desalojar*** (61:7's intransitive decides locally), ***radix → raiz***, ***olíva fructífera → oliveira frutífera***.
- **Ps 52:** it copies Ps 13 wherever the Latin is identical. ***placére + dative → agradar a***, and 114:9 *Placébo Dómino* follows. The three reader remarks on wording shared with Ps 13 were refused for both psalms at once. **For Gustavo:** any of them he takes goes into both psalms.
- **Ps 54:**
  - ***contéxere → envolver***, ***solitúdo → solidão***, ***pusillanímitas → desânimo***, ***maledícere → amaldiçoar***, ***unánimis → de uma só alma***, ***notus → conhecido***, ***consénsus → concórdia***, ***contamináre → contaminar***, ***jáculum → dardo***, ***fluctuátio → não deixar vacilar***, ***dimidiáre → chegar à metade***, ***habitáculum → morada***.
  - 54:4 *as iniquidades se voltaram contra mim*: all three readers heard bare *voltaram* as "came back". **20:12 has the same risk and wants a look.**
  - **For Gustavo:** ***exercitátio → exercício*** stays open. It keeps Ps 118's family, but the blind reader heard a workout.
- **Ps 55:**
  - ***conculcáre → calcar aos pés*** (the stylist's request; 55:2–3, 56:4 and 90:13 follow), with Ps 7:6 *pise aos pés* as the one exception, since there *calque* failed two readers.
  - ***bellári → guerrear***, ***exsecrári → detestar***, ***promíssio → promessa***, ***lapsus → queda*** (114:8 copies it), ***pro níhilo → por nada***, ***abscóndere* without an object → bare *esconderão***, ***placére coram → agradar diante de***, ***cognóvi, quóniam → eis que eu soube***.
  - The refrain rows (55:5 ≈ 55:11), the 55:9 versicle and the 55:2 Gradual text are settled as written. 55:11 *verbum / sermónem → a palavra … a fala* decides locally, as D15 names it.

Cost of reversing: each is one glossary row and one decision in its psalm. Ps 13 = 52 is two psalms at once.

---

## How agents decide

Translation agents rule on their own psalm as they go — option 0 of every decision is a ruling, with its reasons — and *propose* whatever reaches beyond their psalm (glossary rows marked `open`, with the alternatives). The main session rules on those here, between psalms, so that the next psalm starts from a settled word. Nothing is closed against Gustavo: every refused alternative stays selectable on the site.
