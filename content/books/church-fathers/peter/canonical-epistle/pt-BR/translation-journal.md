# Diário de tradução — A Epístola Canônica (pt-BR)

Fonte: en-US/ (trad. James B. H. Hawkins, Ante-Nicene Fathers, vol. 6, 1886; revista por Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| The Canonical Epistle | A Epístola Canônica | |
| Peter of Alexandria / the blessed Peter, Archbishop of Alexandria | São Pedro de Alexandria / o bem-aventurado Pedro, arcebispo de Alexandria | como em peter/genuine-acts e peter/fragments |
| Theodore Balsamon / John Zonaras | Teodoro Balsamon / João Zonaras | rótulos dos comentários: "Balsamon." / "Zonaras." |
| Canon | Cânon | títulos "Cânon 1" etc. |
| Apostolical canons | cânones apostólicos | |
| passover | Páscoa | maiúscula, como em peter/fragments |
| the lapsed (substantivo) | os lapsos | termo técnico (*lapsi*); o verbo "lapse" → "cair" |
| to deny the faith / denial | renegar a fé / negação, abjuração | |
| contest | combate | o *agōn* do martírio, como em peter/genuine-acts; "fight the good fight" → "combate o bom combate" |
| to communicate with / communion | ter comunhão com / comunhão | "communicants" → "comungantes" |
| sacraments / sacred mysteries | sacramentos / sagrados mistérios | |
| penance / penitence / repentance | penitência / penitência / arrependimento | |
| tyrant / tormentors / judges | tirano / atormentadores / juízes | |
| confessors | confessores | |
| clergy / clergyman / layman | clero / clérigo / leigo | |
| sacred ministry / sacred office | ministério sagrado / ofício sagrado | |
| fellow-ministers | companheiros de ministério | |
| priesthood / chief priest / High Priest | sacerdócio / sumo sacerdote / Sumo Sacerdote | |
| See / bishopric / episcopate | Sé / bispado / episcopado | |
| this father / divine father | este Padre / este divino Padre | maiúscula para distinguir de "padre" (presbítero) |
| fellow-servants | conservos | |
| heathen / Greek libations | pagãos / libações pagãs | "Greek" em Balsamon = pagão |
| coals of the sinners / hot coals | brasas dos pecadores / brasas acesas | |
| the Preacher | o Pregador | como em peter/fragments |
| Forerunner | Precursor | São João Batista |
| mammon | Mamom | |
| Advocate / propitiation | Advogado / propiciação | |
| chief of the apostles | chefe dos apóstolos | São Pedro |
| fourth day of the week / preparation / Lord's day | quarto dia da semana / Preparação / dia do Senhor | mantidos literais, como no argumento de Zonaras |
| great Sabbath / Holy Lent / Pentecost | Grande Sábado / Santa Quaresma / Pentecostes | |
| the great Basil | o grande Basílio | |
| Magi | magos | |
| Council of Ancyra / Seventh Oecumenical Council | Concílio de Ancira / Sétimo Concílio Ecumênico | |
| Esaias / Stephen / James / Herod / Saul / Jason / Silas | Isaías / Estêvão / Tiago / Herodes / Saul / Jasão / Silas | |
| Gaius / Aristarchus / Zacharias / Elisabeth / Timothy | Gaio / Aristarco / Zacarias / Isabel / Timóteo | |
| Maher-shalal-hash-baz | Maher-Shalal-Hash-Baz | forma hebraica mantida; ver nota [^3] |
| Thessalonica / Berea / Damascus / Ephesus / Asia / Bethlehem / Samaria / Assyria / Libya | Tessalônica / Bereia / Damasco / Éfeso / Ásia / Belém / Samaria / Assíria / Líbia | |

## Decisões

- Gregos de ¶7 e ¶43: a fonte traz o artefato de codificação "k29--'" no lugar do acento agudo. Restaurados como *ἀνήκεστον*, *ἄκος* e *περπερεία*. A explicação dos termos em ¶7 segue a fonte, embora esteja confusa.
- Erros tipográficos evidentes da fonte foram traduzidos pelo sentido: "reigned" = *feigned*, "bill afterwards" = *but afterwards*, "alter mat" = *after that*, "profiled" = *profited*, "hear about" = *bear about*, "tired in heart" = *fired*, "rustled" = *rushed*, "detailed" = *detained*, "detailed and published" = *detained and punished*, "cud" = *end*, "all instance" = *an instance*, "treasurers" = *treasures*, "months" = *mouths*, "cofessors" = *confessors*.
- ¶17: a referência "Jeremiah 3:23" da fonte foi corrigida para Jeremias 13:23 (a pele do etíope).
- ¶23 e ¶44: a fonte tem linhas embaralhadas ("as prudent … children" e "shall that chief priest and … pastor"). A ordem foi reconstruída pelo sentido evidente.
- ¶48: "who pray for themselves" mantido literalmente ("que oram por si mesmos").
- ¶54: a referência "Atos 19:26-30" foi mantida como está na fonte. A citação de Isaías 8:3-4 não traz referência na fonte e continua sem ela.
- Os períodos muito longos da fonte foram divididos em frases mais curtas dentro do mesmo parágrafo, sem omitir nenhuma oração.
- Tratamento: *vós* na oração dirigida a Deus (Mateus 6:13; Atos 7:59) e no plural de Gênesis 19:17; *tu* em 1 Timóteo 6:11-12 e para o leitor dos comentadores ("Observa", "Consulta", "Lê"); *vós* para os ouvintes do sermão de São Pedro ("como sabeis").
- Notas do tradutor: [^1] (¶2) apresenta Balsamon e Zonaras. [^2] (¶21) explica o "escrito" (*libellus*, o certificado de sacrifício). [^3] (¶54) dá o sentido do nome *Maher-Shalal-Hash-Baz*, de que depende o jogo "despojar depressa e apressar a presa". [^4] (¶62) explica que a "Preparação" é a sexta-feira.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of ch001 (64 paragraphs), book.json and the journal: the translation is complete and faithful, the audit flags are justified, and the only fix is two capitalized 'Ele' in ¶62 that break the file's consistency.
- `pt-BR/ch001.md` [62]: “porque nele Ele mesmo padeceu por nós” → “porque nele ele mesmo padeceu por nós” — the rest of the file writes the pronoun for Christ in lowercase (¶5 'só a ele servirás', ¶9 'porque ele me ungiu', ¶46 'e ele é a propiciação'); keep the file consistent
- `pt-BR/ch001.md` [62]: “porque nele Ele ressuscitou” → “porque nele ele ressuscitou” — same inconsistency in reverential capitalization within the file
- Rejected: pt-BR/ch001.md [17] — audit: Jeremias 13:23 differs from source 'Jeremiah 3:23' — the editor's reference has an obvious slip (3:23 has nothing on the Ethiopian's skin; 13:23 does); the correction is recorded in the journal and keeps the reader correctly informed
- Rejected: pt-BR/ch001.md [7], [43] — audit: emphasis markers added — italics on the Greek words restored from the source's encoding artifact (*ἀνήκεστον*, *ἄκος*, *περπερεία*) and on *immedicabile*, as the house rule requires for retained Greek and Latin
- Rejected: pt-BR/ch001.md [42] — audit: parentheses added — they replace the source's em-dash aside around 'for of such a nature … over them'; the content is complete, and this is a punctuation choice
- Rejected: pt-BR/ch001.md [38], [39] — 'He teaches them to pray that they may not be tempted' rendered 'para não sermos tentados' — the generalization to the first person plural does not change the sense; ¶37 itself reads 'teaches us'

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Lidos integralmente os 64 parágrafos, as notas, book.json, o diário e os apontamentos da auditoria; encontrado um desvio de sentido.
- `pt-BR/ch001.md` [37]: “e prestes a prolongar-se” → “e que provavelmente se prolongará” — “Likely to be protracted” indica que o prolongamento é provável; “prestes” o apresenta como iminente. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 ¶36–¶38: the round-2 fix in ¶37 is correct and the shown paragraphs are clean
- Rejected: pt-BR/ch001.md [37] — Round-2 change “e que provavelmente se prolongará” — Matches “likely to be protracted”; coordination with “que está há muito em trabalho de parto” and the rest of the sentence is intact
- Rejected: pt-BR/ch001.md [37] — “Now, He says” and “For He would not have us” lose “Now” and “For” — These are discourse connectives dropped when the long sentence is split; the logical link is still clear from context and no content is lost
- Rejected: pt-BR/ch001.md [37] — “councils” rendered “conselhos” rather than a common Bible wording (“tribunais”/“sinédrios”) — A literal rendering of the source's own wording, which the house rule prefers to a familiar Bible text
- Rejected: pt-BR/ch001.md [38] — “hesitating in truth” rendered without “in truth” — An intensifier with no effect on the sense; a style choice
