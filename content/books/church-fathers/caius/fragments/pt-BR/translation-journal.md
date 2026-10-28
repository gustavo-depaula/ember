# Diário de tradução — Fragmentos (pt-BR)

Fonte: en-US/ (S. D. F. Salmond, Ante-Nicene Fathers, vol. 5, Christian Literature Publishing Co., 1886; revisão de Kevin Knight para o New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Caius | Caio | autor |
| Fragments | Fragmentos | título |
| Eusebius' *Eccles. Hist.* / *Eccl. Hist.* | Eusébio, *Hist. Ecl.* | abreviatura de *História Eclesiástica* |
| trophies of the apostles | troféus dos apóstolos | os túmulos-monumentos de Pedro e Paulo |
| the Vatican / the Ostian Road | o Vaticano / a Via Ostiense | |
| Proclus / Artemon / Cerinthus | Proclo / Artêmon / Cerinto | |
| Philip / Hierapolis in Asia | Filipe / Hierápolis, na Ásia | |
| Victor / Zephyrinus / Peter | Vítor / Zeferino / Pedro | |
| Justin / Miltiades / Tatian / Clement / Irenaeus / Melito | Justino / Milcíades / Taciano / Clemente / Ireneu / Melitão | |
| Theodotus the tanner / Theodotus, a banker | Teódoto, o curtidor / Teódoto, um banqueiro | |
| Natalius / Asclepiodotus | Natálio / Asclepiódoto | |
| Asclepiades / Hermophilus / Apollonius | Asclepíades / Hermófilo / Apolônio | |
| Euclid / Aristotle / Theophrastus / Galen | Euclides / Aristóteles / Teofrasto / Galeno | |
| confessor | confessor | |
| bishop / clergy / laity | bispo / clero / leigos | minúsculas |
| the Church / this church (Rome) | a Igreja / esta igreja | mantém a caixa da fonte |
| Catholic Church | Igreja Católica | |
| the Word of God | o Verbo de Deus | como nas obras irmãs |
| excommunicated / cut off from communion | excomungou / cortado da comunhão | |
| apostasy / heresy / blasphemy | apostasia / heresia / blasfêmia | |
| connected or disjoined syllogism | silogismo conjuntivo ou disjuntivo | |
| copies | cópias | |
| demoniacs / infidels | endemoninhados / infiéis | |
| Canon Muratorianus | Cânon Muratoriano | |
| imperial Spirit | Espírito soberano | ver Decisões |
| advent (twofold) | vinda (dupla) | |
| Theophilus / Andrew | Teófilo / André | |
| Laodiceans / Alexandrians | Laodicenses / Alexandrinos | |
| Marcion / Valentinus / Arsinous / Basilides | Marcião / Valentino / Arsínoo / Basílides | |
| Cataphrygians | catafrígios | os montanistas |
| the *Pastor* / Hermas | o *Pastor* / Hermas | |
| chair (of the Church of Rome) | cátedra | |
| Catholic *epistles* | *epístolas* católicas | |

## Decisões

- **Tratamento.** No ¶5, Caio dirige-se só a Proclo, por isso a tradução usa *tu*. No ¶24, João fala aos condiscípulos, por isso usa *vós* (“Jejuai”).
- **Numeração do Cânon Muratoriano.** Os números de parágrafo viraram texto em negrito (`**1.**` a `**4.**`). O “I.” da fonte é um erro de OCR por “1.” e foi normalizado.
- **¶24, referência bíblica.** A fonte traz “1 John 1:1” solta no meio da frase. A referência ficou no mesmo lugar, entre parênteses, para não quebrar a leitura.
- **¶24, “imperial Spirit”.** Corresponde ao latim *principali spiritu*. A tradução usa “Espírito soberano”, porque “imperial” soaria político em português.
- **¶24, “studious of right”.** Traduzido por “estudioso do que é reto”, seguindo a leitura da edição inglesa.
- **¶18, “sentiment, or rather senselessness”.** A fonte faz um jogo de palavras. A tradução usa “deste sentir, ou antes, desta insensatez” para manter algum eco entre os termos.
- **¶18, *denarii*.** Traduzido por *denários*, mantendo o itálico da fonte. É um termo monetário corrente, não uma citação latina.
- **¶21, “Euclid is laboriously measured”.** A imagem da fonte foi mantida (“é laboriosamente medido”), porque alude à geometria citada na frase anterior.
- **Erros da fonte corrigidos.** As correções feitas foram estas:
  - ¶20: ponto final que faltava no parêntese.
  - ¶21: ponto indevido em “some of them. and Aristotle”.
  - ¶21: “trader pretexts” lido como “under pretexts” (“sob pretextos”).
  - ¶26: “Oid” lido como “Old”.
  - ¶27: “Plus” lido como “Pius” (“Pio”).
- **Notas.** A fonte não tem notas de rodapé do editor, e nenhuma nota do tradutor foi necessária.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch001 (27 paragraphs) against en-US, with book.json and the journal: one meaning fix (a dropped causal link in ¶24); terms, names, references and format are consistent.
- `pt-BR/ch001.md` [24]: “no que toca à fé dos que creem. Em todos eles,” → “no que toca à fé dos que creem, visto que em todos eles,” — source: "there is no difference as regards the faith of believers, inasmuch as in all of them all things are related under one imperial Spirit"; splitting the sentence dropped the causal link, so the reader no longer sees that the one Spirit is why there is no difference *(meaning)*
- Rejected: pt-BR/ch001.md [24] — audit: emphasis markers and parentheses differ — the extra markers are the bold paragraph number and the parenthesized 1 João 1:1, both recorded in the journal's Decisões
- Rejected: pt-BR/ch001.md [25]–[27] — audit: emphasis markers differ — each paragraph has 4 extra asterisks, which are its bold paragraph number (**2.**–**4.**); the source's own italics are all kept
- Rejected: pt-BR/ch001.md [8] — "que pretende lhe terem sido mostradas" may be a false friend for "pretends" — in Portuguese, "pretender" can mean "alegar, sustentar", which is the sense of the source
- Rejected: pt-BR/ch001.md [26] — "which it is needful for us to discuss severally" rendered as "É necessário discutirmos estas epístolas uma por uma" — the referent of "which" is unclear in the source; the epistles is a defensible reading, and the sentence is complete
- Rejected: pt-BR/ch001.md [24] — "and when Paul had associated him" lost its "and" — "quando Paulo o havia associado" still reads as a second time clause beside "depois da ascensão"; the sense does not change

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos 27 parágrafos, cotejados com a fonte, mais book.json, diário e auditoria: encontrado um defeito de sentido.
- `pt-BR/ch001.md` [21]: “não é provável que nem eles mesmos a possam ignorar” → “não é provável que eles mesmos a possam ignorar” — A fonte afirma ser improvável que eles próprios ignorem a audácia da ofensa. «Nem» acrescenta uma negação dentro da subordinada e inverte esse sentido. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 ¶20–22: the round-2 fix in ¶21 is correct (it removes a double negation that reversed the sense); no new defects.
- Rejected: pt-BR/ch001.md [21] — The fix drops the source's "even" ("even they themselves") — The emphatic "even" does not change the claim. "Eles mesmos" keeps the reflexive emphasis, and restoring it with "nem" or "sequer" would bring back the double negation. Not a defect.
- Rejected: pt-BR/ch001.md [21] — "Por outro lado" for "And again"; "Pois pode-se" enclisis — Both are acceptable in pt-BR. "Pois" here is a coordinating conjunction and does not require proclisis. Style, not a defect.
