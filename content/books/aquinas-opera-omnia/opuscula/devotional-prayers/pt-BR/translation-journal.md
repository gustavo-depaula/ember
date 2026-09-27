# Translation Journal — Orações Devocionais de São Tomás de Aquino (pt-BR)

Source: la (canonical — Leonine/Marietti text mirrored from aquinas.cc; c13 from the Parma edition; c15 is Italian)
Target: pt-BR
Cross-checked against: en-US, only to disambiguate difficult constructions — never used as the base text.

## Key Terms

Conventions inherited from the sibling pt-BR works (`catechetical-instructions`, `office-of-corpus-christi-sapientia`, `opuscula/hymns`):

| Latin | Portuguese | Notes |
|-------|------------|-------|
| Sanctus Thomas Aquinas | São Tomás de Aquino | as in `catechetical-instructions` |
| tu / te (addressed to God, Christ) | Vós / Vos; possessive vosso/vossa | vós-address throughout; second-person pronouns for God capitalized (Vos, Vós), possessives lowercase — matches the Corpus Christi office ("concedei-nos, Vos pedimos") and hymns ("Eu Vos adoro") |
| tu (addressed to Mary) | vós (lowercase) | c08 |
| third-person pronouns for God/Christ (eius, ipse) | ele, dele, lhe (lowercase) | follows the Latin, which does not capitalize |
| quaesumus | Vos pedimos | as in the Corpus Christi office collect |
| Qui vivis et regnas | Vós que viveis e reinais | as in the Corpus Christi office |
| per omnia saecula saeculorum | por todos os séculos dos séculos | |
| Deus, qui nobis sub sacramento mirabili… | copied verbatim from `office-of-corpus-christi-sapientia/pt-BR/officesas-c01.md` | same collect, same Latin |
| O salutaris Hostia | Ó Hóstia salutar | as in the Corpus Christi office / hymns-c03 |
| Corpus et Sanguis (Christi) | Corpo e Sangue | capitalized when Eucharistic, as in the siblings |
| sacramentum | sacramento | |
| res sacramenti | a realidade do sacramento | c03, scholastic *res* |
| convivium | banquete | c01 "sagrado banquete", c05 "inefável banquete" |
| Pie Pellicane | Piedoso Pelicano | cf. hymns-c05 "Ó piedoso Pelicano" |
| Dominus | Senhor | |
| Deus omnipotens | Deus onipotente | |
| unigenitus Filius | Filho unigênito | |
| caritas | caridade | never "amor" for *caritas* |
| dilectio | amor | c08 |
| gratia | graça | |
| paenitentia | penitência | |
| contritio / confessio / satisfactio | contrição / confissão / satisfação | c09 |
| via / patria | caminho / pátria | wayfarer vs. homeland |
| viaticum | viático | c16 |
| mens | mente / alma | "alma" in *O sacrum convivium* (received usage); "mente" elsewhere |
| claritas, agilitas, subtilitas, impassibilitas | claridade, agilidade, sutileza, impassibilidade | dowries of the glorified body, c10 |
| potentia rationalis / concupiscibilis / irascibilis | potência racional / concupiscível / irascível | c10 |
| accidia | acídia | c09 |
| Ordo (c08) | Ordem | the Dominican Order, "vossa Ordem" |
| Cathari | cátaros | c13 |

## Translation Decisions

- **Translated from the Latin, not from en-US.** The en-US edition is itself a set of translations of varying freedom (Corrigan, Murray, Henry's rhymed verse for c13, Pflugbeil for c14). pt-BR follows the Latin clause by clause, so it is often closer and plainer than en-US.
- **Structure follows `la/`, not `en-US/`.** en-US adds headings and intro lines that are not in the Latin (e.g. the per-prayer headings in c01, "In honor of St. Peter Martyr" in c13). pt-BR keeps only what the Latin has.
- **Editorial apparatus dropped.** The inline English notes in the Latin files are textual-critical apparatus for the Latin (Wielockx on *Te devote laudo* in c02; Marietti variants in c05, c06, c09; Parma readings in c13). They were dropped, as in `opuscula/hymns/pt-BR`. The `{CruxMihi}` image placeholder in c14 was dropped too.
- **c02 (Te devote laudo)** is translated fresh from this book's critical text. It is not the `adoro-te-devote` practice text reused in `opuscula/hymns/pt-BR/hymns-c05.md`, because the incipit and several lines differ (*Te devote laudo, latens Veritas*; couplets as separate bullets).
- **c01 Te Deum excerpt**: rendered clause by clause, not from a Portuguese Te Deum. *Iudex crederis esse venturus* → "Cremos que haveis de vir como Juiz" (passive "you are believed" turned active). *regna caelorum* kept plural: "os reinos dos céus".
- **c05**: the Latin inverts several genitive-noun pairs (*concupiscentiae et libidinis exterminatio*). pt-BR uses natural order ("o extermínio da concupiscência e da luxúria"), with lines regrouped to match.
- **c06**: *da nobile / da rectum / …* (with *cor* understood) → "dai-o nobre / dai-o reto / …" ("o" = the heart), which keeps the Latin ellipsis without repeating "coração".
- **c08**: *in viam salvationis et salutis* → "a via da salvação e da saúde eterna"; *salus* in the old sense of spiritual health, with "eterna" to prevent a medical reading. *spe accepta* → "tendo eu posto a minha esperança".
- **c09 closing**: *ea quae fiunt insipienter appetam, et quae fiunt accidiose fastidiam* is read adverbially (desire rashly / loathe out of acedia), as the following *ne contingat…* clause demands: "deseje insensatamente o que se há de fazer, nem, por acídia, tenha fastio do que se faz".
- **c10**: the chain *summa libertas, libera securitas, secura tranquillitas, iucunda felicitas, felix aeternitas, aeterna beatitudo* is preserved as a chain in Portuguese. The *affluentia / influentia / confluentia* wordplay is kept (afluência / influência / confluência).
- **c11**: *de bonitate tua conqueror* → "lamento-me diante da vossa bondade". A literal "queixo-me da vossa bondade" would read as a complaint against God, which the context excludes. *potius te offendere quam timenda non incurrere volui* → "antes ofender-Vos que incorrer no que temia". The Latin *non* is taken as pleonastic, as the sense requires.
- **c13** (epitaph for St. Peter Martyr): plain line-for-line rendering. The en-US text is a free rhymed version by Msgr. H. T. Henry and was not followed. *adorat* (of a saint) → "venera".
- **c15** is Italian in the source and was translated from the Italian.
- **Titles.** The `la` TOC titles and H1s in book.json are English (a scrape artifact) and were left untouched. The pt-BR titles are Portuguese renderings of each prayer's incipit or subject. The H1 in each pt-BR file matches its TOC title.
