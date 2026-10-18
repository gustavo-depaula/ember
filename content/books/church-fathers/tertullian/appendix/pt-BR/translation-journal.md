# Diário de tradução — Apêndice (Contra todas as heresias) (pt-BR)

Fonte: en-US/ (trad. S. Thelwall, Ante-Nicene Fathers, vol. 3, 1885; revisão de Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Tertullian | Tertuliano | Como nas demais obras pt-BR do autor. |
| Appendix (Against All Heresies) | Apêndice (Contra todas as heresias) | Título e sumário. |
| Virtue / Virtues | Virtude / Virtudes | Potências gnósticas; maiúscula onde a fonte a tem. |
| powers / Principalities | potestades, potências / Principados | |
| Æon / Pleroma / syzygies | Éon / Pleroma / sizígias | |
| Triacontad / ogdoad / decad / duodecad / Monad | Triacontade / ogdóade / década / dodécade / Mônada | |
| Depth / Bythus / Silence / Mind (Νοῦς) | Abismo / Bito / Silêncio / Mente | “Depth” e “Bythus” mantidos distintos, como na fonte. |
| Word / Speech | Verbo / Palavra | A fonte alterna os dois termos no cap. 4; mantidos distintos. |
| Horos / Achamoth / Iao / First-Father | Horos / Acamot / “Iao” / Primeiro Pai | |
| Ialdabaoth (Ialdaboath) | *Ialdabaoth* | Grafia unificada; itálico como na fonte. |
| Abraxas | Abraxas | |
| phantasm / phantasmal / quasi-passion | fantasma / fantasmagórica / quase-paixão | |
| permixture | mistura | |
| dæmon | demônio | Como nas obras irmãs. |
| resurrection of the flesh | ressurreição da carne | |
| brother-heretic / sister-sect / sister-flesh | herege irmão / seita irmã / carne irmã | |
| escheated | destituídos (anjos) / anulada (graça) | |
| Deprecator and Advocate | Intercessor e Advogado | |
| Paraclete | Paráclito | |
| Simon Magus / Menander / Saturninus / Basilides / Nicolaus / Dositheus | Simão Mago / Menandro / Saturnino / Basílides / Nicolau / Dositeu | |
| Sadducees / Pharisees / Herodians / Nicolaitans | saduceus / fariseus / herodianos / nicolaítas | |
| Ophites / Cainites / Sethites | ofitas / cainitas / setianos | |
| Carpocrates / Cerinthus / Ebion | Carpócrates / Cerinto / Ébion | |
| Valentinus (Valentine) / Ptolemy / Secundus / Heracleon | Valentino / Ptolomeu / Secundo / Heracleão | |
| Marcus / Colarbasus | Marcos / Colarbaso | |
| Cerdo / Marcion / Lucan / Apelles / Philumene | Cerdão / Marcião / Lucano / Apeles / Filumena | |
| Tatian / Justin Martyr | Taciano / Justino Mártir | |
| Cataphrygians / Cataproclans / Catæschinetans / Montanus / Æschines | catafrígios / cataproclianos / cataesquinetas / Montano / Ésquines | |
| Blastus / Theodotus the Byzantine / Praxeas / Victorinus | Blasto / Teódoto, o bizantino / Práxeas / Vitorino | |
| Seth / Ham / Melchizedek / Pontus / Canaan | Set / Cam / Melquisedeque / Ponto / Canaã | |
| Apocalypse / Acts of the Apostles | Apocalipse / Atos dos Apóstolos | |

## Decisões

- Pronomes referentes a Deus e a Cristo em minúscula (“ele”, “o”), segundo o uso editorial católico atual.
- “Ialdaboath” (variante tipográfica da fonte) unificado em *Ialdabaoth*.
- Pontuação defeituosa da fonte (“sacrilegious. alike and foul”, cap. 1; “brother -heretic”, cap. 4) corrigida sem nota.
- “The serpent” (masculino em inglês) tratado no feminino, como pede “serpente” em português.
- Citações bíblicas traduzidas da redação da fonte; só João 3:14 traz referência, conservada no lugar em que a fonte a põe.
- Termos gregos (Νοῦς, περιστερά, ἀπάτωρ etc.) e as letras do alfabeto conservados como na fonte.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Leitura completa do capítulo único (35 parágrafos), com book.json e diário: duas correções pequenas (ambiguidade de "até" no [12] e parêntese que quebra a regência no [30]); o restante está fiel e completo.
- `pt-BR/ch001.md` [12]: “chamam a Mãe trouxe até o dilúvio, para fins de vingança” → “chamam a Mãe trouxe até mesmo o dilúvio, para fins de vingança” — A fonte diz "brought on the deluge even". "Trouxe até o dilúvio" pode ser lido como "trouxe [algo] até o dilúvio"; "até mesmo" deixa claro o sentido de "even".
- `pt-BR/ch001.md` [30]: “do que Cristo apresentou (no âmbito) do Evangelho” → “do que Cristo apresentou no (âmbito do) Evangelho” — Sem o parêntese, a frase fica "apresentou do Evangelho", que é agramatical. Com a mudança, fica "apresentou no Evangelho", como na fonte: "brought forward into (the compass of) the Gospel".
- Rejected: pt-BR/ch001.md [8], [10], [14], [22] — A auditoria marcou diferença na contagem de parênteses. — Os parênteses a mais substituem travessões da fonte; nenhum conteúdo foi acrescentado ou perdido.
- Rejected: pt-BR/ch001.md [4] — Mistura de tempos verbais em "*não* sofrera ... mas foi *como se tivesse sofrido*". — É aceitável e não altera o sentido da fonte ("had not suffered ... but was as if he had suffered").
- Rejected: pt-BR/ch001.md [10] — "Ialdaboath" da fonte grafado como *Ialdabaoth*; a serpente tratada no feminino. — As duas decisões estão registradas no diário e são aplicadas de forma consistente.
- Rejected: pt-BR/ch001.md [11] — O "ele" em "ele, zelando pela salvação" é ambíguo. — A fonte tem a mesma ambiguidade ("he, consulting for"), e pelo contexto o referente é Judas.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 6 minor. Leitura integral dos 35 parágrafos, book.json, diário e auditoria: uma correção de sentido e seis correções menores.
- `pt-BR/ch001.md` [7]: “chama Νοῦς;” → “chama *Νοῦς*;” — O termo grego conservado deve estar em itálico, conforme a regra de formatação.
- `pt-BR/ch001.md` [10]: “Ela colheu, dizem,” → “A serpente colheu, dizem,” — Na fonte, 'He plucked' retoma a serpente e distingue-a de Eva. Em português, 'Ela', logo após a menção a Eva, perde essa distinção e permite atribuir a ação à personagem errada. *(meaning)*
- `pt-BR/ch001.md` [18]: “a Mente e a Verdade; dos quais brotaram” → “a Mente e a Verdade; das quais brotaram” — O relativo retoma Mente e Verdade, dois substantivos femininos.
- `pt-BR/ch001.md` [22]: “grego περιστερά (*peristera*)” → “grego *περιστερά* (*peristera*)” — O termo grego conservado deve estar em itálico, conforme a regra de formatação.
- `pt-BR/ch001.md` [34]: “é ἀπάτωρ (sem pai)” → “é *ἀπάτωρ* (sem pai)” — O termo grego conservado deve estar em itálico, conforme a regra de formatação.
- `pt-BR/ch001.md` [34]: “ἀμήτωρ (sem mãe)” → “*ἀμήτωρ* (sem mãe)” — O termo grego conservado deve estar em itálico, conforme a regra de formatação.
- `pt-BR/ch001.md` [34]: “ἀγενεαλογητον (sem genealogia)” → “*ἀγενεαλογητον* (sem genealogia)” — O termo grego conservado deve estar em itálico, conforme a regra de formatação.
- Rejected: pt-BR/ch001.md [8], [10], [14], [22] — Diferenças na contagem de parênteses apontadas pela auditoria. — Os parênteses redistribuem os incisos e substituem travessões, sem perda ou acréscimo de conteúdo; confirma-se a decisão da rodada anterior.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [6]-[11], [17]-[19], [21]-[23], [33]-[35]: the seven round-2 fixes (Greek italics, 'A serpente colheu', 'das quais') are correct and break nothing nearby; no new defects.
- Rejected: pt-BR/ch001.md [7], [22], [34] — The audit flags more emphasis markers in pt-BR than in the source. — The extra markers are the italics added to the retained Greek terms, as the formatting rule requires. No content changed.
- Rejected: pt-BR/ch001.md [10] — 'serpente' is repeated in '…esta fora a *serpente*), em quem Eva acreditara… A serpente colheu'. — The repetition is what makes clear that the serpent, not Eve, plucked the fruit, as 'He plucked' does in the source. It is a stylistic cost, not a defect.
- Rejected: pt-BR/ch001.md [18] — Check concord of 'dos quais' after the fix to 'das quais'. — 'das quais' refers back to Mente and Verdade, both feminine. 'dos quais' refers back to Verbo and Vida, mixed gender, so the masculine plural is correct.
- Rejected: pt-BR/translation-journal.md (Decisões) — The journal says the Greek terms are 'conservados como na fonte', but they are now in italics, which the source does not use. — 'Conservados' refers to keeping the Greek script instead of transliterating it, which is still true. The italics follow the house rule.
