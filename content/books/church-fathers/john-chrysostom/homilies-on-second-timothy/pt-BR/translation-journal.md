
## Termos

| Scripture / holy Scriptures | Escritura / Sagradas Escrituras | Mantida a alternância entre singular e plural da fonte. |
| sound doctrine | sã doutrina | Fórmula das Epístolas Pastorais. |
| appearing / Epiphany | manifestação / Epifania | Preservada a ligação entre a manifestação de Cristo e a imagem da luz na Homilia 9. |
| poured out / drink-offering | derramado / libação | Conservada a distinção entre sacrifício e libação na exposição de 2 Timóteo 4:6. |
| philosopher | filósofo | Sentido ascético, conforme os diários de outras obras de Crisóstomo; esclarecido na nota 8. |
| Demas / Mark / Luke / Erastus | Demas / Marcos / Lucas / Erasto | Formas das Homilias sobre Filêmon. |
| Priscilla / Aquila / Tychicus / Nero | Priscila / Áquila / Tíquico / Nero | Formas do diário da Homilia sobre a humildade de espírito. |
| Elisha | Eliseu | Forma do diário da Homilia sobre Santo Inácio. |
| Crescens / Titus / Carpus / Trophimus | Crescente / Tito / Carpo / Trófimo | Nomes bíblicos. |
| Onesiphorus / Apollos / Epaphroditus | Onesíforo / Apolo / Epafrodito | Nomes bíblicos. |
| Eubulus / Pudens / Linus / Claudia | Êubulo / Pudente / Lino / Cláudia | Nomes da saudação final de 2 Timóteo. |
| Thessalonica / Galatia / Dalmatia / Troas / Miletus / Illyricum | Tessalônica / Galácia / Dalmácia / Trôade / Mileto / Ilírico | Topônimos bíblicos. |
| Holy Ghost | Espírito Santo | Forma estabelecida nos diários das obras de Crisóstomo. |
| doxology | doxologia | Fórmula de glorificação divina. |

## Decisões

- Traduzidos os 35 parágrafos da Homilia 9 e os 54 da Homilia 10, preservando a divisão; as duas definições das notas do tradutor constituem parágrafos adicionais do aparato.
- Na Homilia 9, preservada a referência corrompida “511 xx. 29” como “511 20:29”, com normalização de capítulo e versículo. A nota do tradutor 7 identifica a citação como Atos 20:29 sem eliminar o número presente na fonte.
- Nota do tradutor 8, na Homilia 9: esclarece o sentido ascético de “filósofo”, conservado conforme o uso de outras obras do corpus.
- Traduzida integralmente a variante editorial da Versão Revisada em 2 Timóteo 3:16; mantidas as referências e a numeração dos Salmos da fonte.
- Corrigidos na tradução os lapsos tipográficos inequívocos “ho” por “who”, “sook” por “look” e “extremities of the each” por “extremities of the earth”. Na Homilia 10, “Despise each” foi entendido como retomada de cada um dos interesses próprios anteriormente mencionados, sem substituir “each” por “earth”.
- “Effeminate”, na censura à fuga dos trabalhos e perigos, foi vertido por “fracos”, conforme o sentido contextual de falta de firmeza.
- “General Acts” foi traduzido por “o conjunto dos Atos”; “coppersmith”, por “caldeireiro”.
- Conservados os dados históricos e as atribuições da fonte, inclusive o retorno de Paulo à Espanha, a referência a Lino como segundo bispo de Roma depois de Pedro e a aplicação de 2 Coríntios 8:18 a Lucas.
- Mantido “A graça esteja conosco” no encerramento da Homilia 10, conforme a fonte e a explicação subsequente de que Paulo também ora por si mesmo.

## Review log

### Round 1 (claude, full read)
Verdict: 4 meaning-level, 1 minor. Full read of ch001–ch010, journal and book.json. Fixed a reversed 'loved/hated for God's sake' in ch007, two evident source slips (ch003 'instructed'→entrusted, ch007 'deserve'→desire), and cut an unverifiable citation from translator's note 6.
- `pt-BR/ch007.md` [7]: “quando somos amados por Deus, ficamos em dívida” → “quando somos amados por causa de Deus, ficamos em dívida” — source: 'when we are loved for God's sake'; 'amados por Deus' says loved by God *(meaning)*
- `pt-BR/ch007.md` [7]: “quando somos odiados por Ele, é Ele” → “quando somos odiados por causa dEle, é Ele” — source: 'when we are hated for His sake'; 'odiados por Ele' says hated by God, the opposite of the argument *(meaning)*
- `pt-BR/ch003.md` [5]: “instruída em coisas tão grandes” → “à qual foram confiadas coisas tão grandes” — source 'instructed with things so great' is an OCR slip for 'intrusted with'; the context is keeping the deposit committed to him *(meaning)*
- `pt-BR/ch007.md` [12]: “se não mereces a riqueza” → “se não desejas a riqueza” — source 'if you do not deserve wealth' is an evident slip for 'desire', paired with 'nor seek to increase your present possessions' *(meaning)*
- `pt-BR/ch007.md`: “purgações e vômitos; daí a alusão a um remédio penoso. Esse uso aparece, por exemplo, em [Hipócrates, Sobre o regime nas doenças agudas, 7](https://classics.mit.edu/Hippocrates/acutedis.7.7.html).” → “purgações e vômitos; daí a alusão a um remédio penoso.” — translator's note [^6]: the specific Hippocratic section and URL cannot be confirmed; cut back to the certain fact
- Rejected: pt-BR/ch009.md [8] — audit: Scripture reference 4:1 added — renders 'Chap. iv. 1.' with normalized numbering; nothing added
- Rejected: pt-BR/ch009.md [18] — audit: reference 20:29 added beside 10:17 — normalizes the corrupt '511 xx. 29' per the journal; note [^7] identifies Acts 20:29
- Rejected: pt-BR/ch009.md [32] — audit: emphasis markers added — retained Greek τὴν ἐπιφανειαν italicized per house rule
- Rejected: pt-BR/ch002.md [3], [8] — 'aparição' instead of Key Terms 'manifestação' for 'appearing' — same sense, and in [8] 'se manifestou pela manifestação' would be a clumsy repetition; defensible choice
- Rejected: pt-BR/ch004.md [23] — 'aquelas vestes ... do que estas' looks reversed — under the este/aquele rule, 'aquelas' points to the chain and 'estas' to the crown, which matches the source
- Rejected: pt-BR/ch006.md [27] — 'aquela sujeira ... enquanto esta' demonstratives — reads correctly in context: bodily dirt versus the filth of robbery

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 5 minor. Leitura integral de ch001–ch010, das oito notas, do diário, de book.json e dos apontamentos mecânicos: dois defeitos de sentido e cinco menores.
- `pt-BR/ch003.md` [3]: “Figelo e Hermógenes” → “Fígelo e Hermógenes” — O nome bíblico em português é Fígelo, com acento.
- `pt-BR/ch003.md` [6]: “Figelo e Hermógenes” → “Fígelo e Hermógenes” — O nome bíblico em português é Fígelo, com acento.
- `pt-BR/ch007.md` [7]: “mas lhes nega de má vontade sua porção de alimento” → “mas reluta em lhes conceder sua porção de alimento” — “Grudges them their share” indica relutância em conceder a porção, não relutância em negá-la. *(meaning)*
- `pt-BR/ch008.md` [30]: “conheces as santas Escrituras” → “conheces as sagradas Escrituras” — A tabela de termos estabelece Sagradas Escrituras para “holy Scriptures”; conserva-se a capitalização local.
- `pt-BR/ch008.md` [33]: “Ele chama as santas Escrituras” → “Ele chama as sagradas Escrituras” — Desvio da forma Sagradas Escrituras estabelecida na tabela de termos, sem mudança de sentido.
- `pt-BR/ch008.md` [34]: “falando das santas Escrituras” → “falando das sagradas Escrituras” — Desvio da forma Sagradas Escrituras estabelecida na tabela de termos, sem mudança de sentido.
- `pt-BR/ch009.md` [26]: “e a corrida não termina em nada.” → “e a corrida não termina sem resultado.” — “Does not end in nothing” nega a ausência de resultado. Em português, “não termina em nada” comunica justamente essa ausência, contrariando também a explicação seguinte. *(meaning)*
- Rejected: pt-BR/ch003.md [11] — As referências Mateus 25:40 e Lucas 16:16 não correspondem às citações apresentadas. — Ambas reproduzem exatamente as referências da fonte canônica; não são defeitos da tradução nem lapsos inequívocos de OCR.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of the seven round-2 changes in ch003, ch007, ch008 and ch009 and their neighbouring paragraphs: all changes correct, no new defects.
- Rejected: pt-BR/ch008.md [33] — 'sagradas Escrituras de "escritos sagrados"' looks redundant after the fix — The source glosses 'holy Scriptures' as 'sacred writings' in the same way; the fix follows the Key Terms table and keeps the gloss.
- Rejected: pt-BR/ch009.md [26] — 'aquela que o sol percorre no céu' commits 'he runs in heaven' to the sun — The comparison is with 'the sun's' race, so the sun is the natural antecedent; the reading is defensible and fits the context.
- Rejected: pt-BR/ch009.md [8], [18], [32] — Mechanical audit: reference and emphasis differences — Already examined and rejected in round 1: normalized 'Chap. iv. 1.', the corrupt '511 xx. 29' explained in note [^7], and the italicized retained Greek.
