# Diário de tradução — Sermão contra Auxêncio (pt-BR)

Fonte: en-US/ (H. de Romestin, E. de Romestin e H.T.F. Duckworth, NPNF Second Series, Vol. 10, via New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Ambrose | Santo Ambrósio / Ambrósio | autor "Santo Ambrósio (340-397)", como nas obras irmãs |
| Auxentius / Mercurius | Auxêncio / Mercúrio | ver nota do tradutor 2 |
| Arians | arianos | |
| basilica / the church (edifício) / the Church | basílica / a igreja / a Igreja | caixa conforme a fonte |
| consistory | consistório | o conselho imperial |
| tribunes | tribunos | |
| priest (sacerdos) / bishop | sacerdote / bispo | |
| Emperor / emperor | Imperador / imperador | caixa conforme a fonte |
| Cæsar | César | |
| ill-will (*invidia*) | animosidade | "stir up ill-will" → "suscitar animosidade", em todo o sermão |
| on the Emperor's side | da parte do Imperador | ¶29 e ¶35 |
| heathen / Gentiles | pagãos / gentios | mantidos distintos, inclusive em 1 Coríntios 6:5 ("entre pagãos") |
| catechumen | catecúmeno | |
| sacred vessels / vessels of the Church | vasos sagrados / vasos da Igreja | |
| contest / struggle / athlete | combate / luta / atleta | |
| meat (Jo 4:34) | alimento | como em *Sobre os Mistérios* |
| foal of an ass | potro de uma jumenta | |
| money-changers / seats | cambistas / cadeiras | "cadeiras" sustenta a leitura "honras" do ¶21 |
| penny | denário | |
| Image / likeness | Imagem / semelhança | "Imagem" maiúscula quando designa o Filho, como na fonte |
| Godhead | Divindade | |
| Sacrament of His Passion | Sacramento da sua Paixão | |
| angel of great counsel | anjo do grande conselho | Isaías 9:6 |
| Council of Ariminum | Concílio de Rímini | |
| Naboth / Eliseus / Gerasenes / Belial | Nabot / Eliseu / gerasenos / Belial | |
| Scythia / Goths | Cítia / godos | |
| Dionysius / Eustorgius / Mysocles | Dionísio / Eustórgio / Misocles | ver nota do tradutor 1 |
| portent (*monstrum*) | monstro | |
| strains of my hymns (*carmen*) | cantos dos meus hinos | ver nota do tradutor 3 |

## Decisões

- **Numeração.** Os números de parágrafo do autor (`1. `…`37. `) passam a texto inerte em negrito (`**1.**`).
- **Tratamento.** A congregação recebe *vós*. A Cristo, em "Senhor, aonde ides?" (¶13) e na apóstrofe "Vós, Senhor Jesus" (¶17), também *vós*. Recebem *tu* as falas a um destinatário singular: o servo de Eliseu, Pedro (João 21:22), Ambrósio ("Sai da cidade"), o ímpio do salmo e Judá.
- **Pronomes divinos.** "Ele" fica maiúsculo como sujeito, como na fonte. Os oblíquos e possessivos (me, meu, sua) ficam minúsculos, segundo o uso editorial brasileiro.
- **Escritura.** Segue a redação da fonte: "Por que proclamas tu a minha justiça?" (¶17), "julgar entre pagãos" (1 Coríntios 6:5), "com o espírito do Deus vivo", com minúscula como na fonte (¶28). As referências ficam no lugar exato da fonte, inclusive no meio da frase (¶19, ¶37). As citações sem referência na fonte continuam sem referência.
- **¶10.** A fonte tem "so that that could not see", erro por "they". A tradução usa o sentido evidente.
- **¶16, ¶25, ¶37.** Algumas frases interrogativas terminam em ponto na fonte. A tradução usa ponto de interrogação.
- **¶37.** A dupla negação da fonte ("did not make nothing of") é traduzida pelo sentido: "não desprezaram".
- **¶33.** "I have dependents" → "Tenho os meus dependentes". "seek for defence at their hands" refere-se aos pobres e fica "buscar defesa junto deles".
- **Notas do tradutor.**
  - Nota 1, ¶18: identifica os bispos milaneses Dionísio, Eustórgio e Misocles (Mirocles).
  - Nota 2, ¶22: identifica Auxêncio de Durostoro (Mercurino) e seu homônimo, Auxêncio de Milão.
  - Nota 3, ¶34: explica o duplo sentido de *carmen*, "canto" e "encantamento", que a tradução inglesa não preserva.
  - Nota 4, ¶36: dá a referência do versículo dos Salmos na Vulgata (63:8).

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 (40 paragraphs, 4 translator's notes), the journal and book.json; one minor fix in ¶22.
- `pt-BR/ch001.md` [25]: “mudou de nome, a ponto de se chamar Auxêncio” → “mudou de nome para se chamar Auxêncio” — source: "changed his name so as to call himself Auxentius" is a purpose clause; "a ponto de" means "to the point of" and suggests an extreme degree
- Rejected: pt-BR/ch001.md [4]–[40] — audit: emphasis markers differ (source 0, pt-BR 4) — these are the bold paragraph numbers (**1.**), as the journal's numbering decision states
- Rejected: pt-BR/translation-journal.md, row Ambrose — audit: "santo ambrósio" ×0 in pt-BR — the row allows "Santo Ambrósio / Ambrósio"; the body uses "Ambrósio" (¶30) and book.json has "Santo Ambrósio"
- Rejected: pt-BR/ch001.md [9] — "competição" for "contest" where the Key Terms table gives "combate" — here the word means an athletic contest in a city; the earlier "contest" in the same paragraph keeps "combate"; a defensible distinction
- Rejected: pt-BR/ch001.md [33] — "a animosidade deles" could seem to refer to the people — the source's "their" is equally open, and the context makes the opponents the referent
- Rejected: pt-BR/ch001.md footnote [^4] — Vulgate reference for "Arrows of infants" — Vulgate Psalm 63:8 is "sagittae parvulorum factae sunt plagae eorum"; the reference is correct

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 1 minor. Leitura integral dos 40 blocos, das quatro notas do tradutor, do diário, de book.json e da auditoria: um defeito de sentido e um desvio terminológico menor.
- `pt-BR/ch001.md` [7]: “para que eu talvez fosse afastado” → “para que eu talvez não fosse afastado” — A fonte diz “lest I might perhaps ... be drawn away”, com sentido negativo. A tradução omite essa negação e inverte o sentido da oração. *(meaning)*
- `pt-BR/ch001.md` [9]: “a nossa luta não é contra” → “o nosso combate não é contra” — A fonte emprega “our contest”; a tabela de termos estabelece “combate” para “contest” e “luta” para “struggle”.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [6]–[10]: the [7] negation fix and the [9] combate fix are correct, and the paragraphs around them are clean.
- Rejected: pt-BR/ch001.md [7] — The round 2 fix “para que eu talvez não fosse afastado” could seem to make the devil's power aim at keeping Ambrose faithful, against the Job parallel. — The source's “lest I might perhaps … be drawn away” follows “tempt in this wise” with the same attachment, and can also hang on “warned of this”. The Portuguese keeps the source's negation and its openness, so the fix is faithful.
- Rejected: pt-BR/ch001.md [9] — Concord after the change to “o nosso combate”. — Masculine concord is correct. “Struggle” later in the paragraph stays “luta” and “contest” stays “combate”, as the Key Terms table requires.
- Rejected: pt-BR/ch001.md [6]–[10] — Audit: emphasis markers differ (source 0, pt-BR 4). — These are the bold paragraph numbers (**3.** etc.), per the journal's numbering decision. Round 1 already rejected this.
