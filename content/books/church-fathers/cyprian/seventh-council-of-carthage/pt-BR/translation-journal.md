# Diário de tradução — O Sétimo Concílio de Cartago (pt-BR)

Fonte: en-US/ (trad. Robert Ernest Wallis, Ante-Nicene Fathers, vol. 5, 1886; revisão de Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Cyprian of Carthage | Cipriano de Cartago | Como em *A Vida e a Paixão de Cipriano*. |
| Stephen, Bishop of Rome | Estêvão, bispo de Roma | |
| Jubaianus | Jubaiano | |
| Carthage / Africa / Numidia / Mauritania | Cartago / África / Numídia / Mauritânia | |
| kalends of September | calendas de setembro | Nota do tradutor [^1]. |
| colleague / co-bishop | colega / coepíscopo | |
| fellow priests | colegas no sacerdócio | |
| priest / priesthood | sacerdote / sacerdócio | Como em *A Vida e a Paixão de Cipriano*. |
| presbyters / deacons | presbíteros / diáconos | |
| heretics / schismatics | hereges / cismáticos | |
| heresy / schism | heresia / cisma | |
| baptism / rebaptize | batismo / rebatizar | |
| saving baptism | batismo salvífico | |
| remission / pardon / forgiveness of sins | remissão / perdão / perdão dos pecados | |
| imposition of hands | imposição das mãos | |
| exorcise / exorcism | exorcizar / exorcismo | |
| hold communion / communicate with | manter comunhão / comungar com | "communicate with … sins" → "comungar com os pecados alheios", para manter o eco com "comunhão". |
| Antichrist(s) | Anticristo(s) | Maiúscula ou minúscula conforme a fonte. |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| Mother Church | Mãe Igreja | |
| spouse / bride of Christ | esposa de Cristo | |
| custom / truth | costume / verdade | Oposição central em vários votos; mantida sem variação. |
| laver (impresso "layer") | banho | |
| cancer | cancro | Imagem da gangrena que alastra. |
| sacramental interrogation | interrogação sacramental | |
| Marcion | Marcião | |
| mammon | Mamon | |
| Sirach | Eclesiástico | Nome usual nas Bíblias católicas brasileiras. |
| 1 Kings | 1 Reis | |

## Decisões

- O proêmio vem em Title Case na fonte (artefato tipográfico); em português segue a caixa normal de frase.
- "a.d. 258" → "do ano 258 d.C."; a data da fonte foi mantida sem correção.
- Nota do tradutor [^1], no proêmio: explica as calendas como o primeiro dia do mês romano.
- Nomes de bispos: forma portuguesa usual quando existe (Cecílio, Primo, Policarpo, Novato, Nemesiano, Januário, Lúcio, Crescente, Múnulo, Secundino, Félix, Teógenes, Dativo, Sucesso, Fortunato, Sedato, Privaciano, Privato, Hortensiano, Cássio, Vitórico, Quieto, Casto, Eucrácio, Liboso, Eugênio, Adélfio, Demétrio, Vicente, Marcos, Sátio, Vítor, Aurélio, Jambo, Luciano, Pelagiano, Jáder, Paulo, Pompônio, Venâncio, Saturnino, Marcelo, Ireneu, Donato, Zósimo, Juliano, Fausto, Gemínio, Rogaciano, Terápio, Quinto, Donátulo, Vérulo, Pudenciano, Pedro, Pusilo, Salviano, Honorato, Claro, Secundiano, Líteo, Natal, Pompeu, Júnio). Sem forma consagrada, o nome fica como na fonte (Ahymnus, Tenax, Dioga).
- Sedes: forma portuguesa só quando consagrada (Adrumeto, Cirta, Hipona Régia, Hipona Diárrito, Teveste, Útica, Zama, Léptis Magna, Sabrata, Neápolis); as demais, obscuras, ficam como na fonte (Bilta, Thamugada, Thubunae, Castra Galbae, Thenae, Oëa etc.).
- "Another Felix of X" → "Outro Félix, de X,", com vírgulas, para distinguir os homônimos.
- O parágrafo 23 da fonte junta os votos de Sedato e de Privaciano; foi mantido como um só parágrafo. Em Privaciano, "rounded" é erro de impressão de "founded" → "fundou". Em 23, "by which whosoever is not baptized" foi vertido "quem não for batizado com ele", que é o sentido exigido pela frase.
- "layer" (parágrafos 15 e 30) é erro de impressão de "laver" → "banho"; "from whose month" (33) é "mouth" → "boca".
- Referências bíblicas mantidas como na fonte, mesmo onde divergem do versículo usual (Mateus 28:18 em 33; Provérbios 9:19 em 10).
- Citações sem referência na fonte (Pr 9:12 LXX, Mc 16, 1Jo, 2Jo etc.) ficam sem referência.
- Pronomes referidos a Deus em minúscula ("sua Igreja").
- Parágrafo 69 ("Quintus of Aggya:") não tem "said" na fonte; mantido sem "disse".

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of ch001 (89 paragraphs), the footnote, the journal and book.json: 1 meaning fix (ambiguous possessive in [83]), 2 minor fixes (closing comma in [46], spelling of Vitórico in [29] and the journal).
- `pt-BR/ch001.md` [83]: “não podem batizar ninguém com o seu batismo.” → “não podem batizar ninguém com o batismo dele.” — source says "with His baptism" (Christ's); with "os hereges" as subject, "o seu batismo" reads as the heretics' own baptism *(meaning)*
- `pt-BR/ch001.md` [46]: “não direi lavados, mas sujos fora da Igreja” → “não direi lavados, mas sujos, fora da Igreja” — source "I will not say washed, but befouled, outside the Church"; the parenthetical opened after "foram" must be closed
- `pt-BR/ch001.md` [29]: “Victórico de Thabraca” → “Vitórico de Thabraca” — post-1990 spelling drops the mute c; the same file writes Victor as "Vítor"
- `pt-BR/translation-journal.md`: “Privaciano, Privato, Hortensiano, Cássio, Victórico,” → “Privaciano, Privato, Hortensiano, Cássio, Vitórico,” — keeps the journal in line with the corrected name in [29]
- Rejected: pt-BR/ch001.md [33] — "refuted" rendered "repelido" rather than "refutado" — "repelido com toda a detestação" fits the sense of rejecting the baptism; a defensible choice
- Rejected: pt-BR/ch001.md [31] — "baptized from the dead" → "batizado de um morto" — the article is a defensible reading, and the gloss that follows ("washed by heretics") supports it
- Rejected: pt-BR/ch001.md [5] — "nele" at the end of the paragraph — it refers to "governo" and matches "our conduct there"
- Rejected: pt-BR/translation-journal.md — the name list omits Nicomedes and Poliano — the list does not claim to be complete, and the forms it gives are correct

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 3 minor. Leitura integral dos 89 parágrafos, da nota, do diário e de book.json: uma correção de sentido e três menores; auditoria mecânica sem flags.
- `pt-BR/ch001.md` [4]: “Proêmio.— Quando” → “Proêmio. Quando” — A combinação tipográfica '.—' foi transplantada da fonte, contrariando a regra editorial sobre esse tipo de pontuação.
- `pt-BR/ch001.md` [23]: “batismo da Igreja, sem o qual quem não for batizado” → “batismo da Igreja; quem não for batizado com ele” — A fonte condiciona a exclusão a não receber esse batismo específico ('by which whosoever is not baptized'). 'Sem o qual quem não for batizado' obscurece essa condição ao trocar a relação instrumental por ausência. *(meaning)*
- `pt-BR/ch001.md` [75]: “se decreta que devem ser batizados” → “se decreta que deve ser batizado” — O sujeito retomado é 'alguém', no singular. O plural inglês 'they' não autoriza essa discordância em português.
- `pt-BR/translation-journal.md`: “"by which whosoever is not baptized" foi vertido "sem o qual quem não for batizado"” → “"by which whosoever is not baptized" foi vertido "quem não for batizado com ele"” — Atualiza a decisão registrada conforme a correção da condição no parágrafo 23.
- Rejected: pt-BR/ch001.md [10] — Possível discordância entre 'Certas pessoas' e 'são assim recebidos'. — O masculino pode retomar os hereges e cismáticos cuja admissão essas pessoas defendem; o contexto permite distinguir quem argumenta de quem recebe os sacramentos.
- Rejected: pt-BR/ch001.md [83] — A expressão 'batizando a fé dos que creem' parece semanticamente estranha. — Ela reproduz 'baptizing the faith of believers' da fonte canônica; reformulá-la para batizar pessoas corrigiria a edição, não a tradução.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [3–5, 22–24, 74–76], the footnote and the journal update. The four round-2 fixes ([4], [23], [75] and the journal) are correct and broke nothing; no new defects.
- Rejected: pt-BR/ch001.md [4] — 'Tendo, pois, convocado…' has no expressed subject before the impersonal 'celebrou-se então este terceiro concílio' — The source has the same construction ('Having Therefore Summoned … This Third Council … Was Then Celebrated'), and the agent (Cipriano) is clear from the previous sentence.
- Rejected: pt-BR/ch001.md [5] — 'depois de lidas' agrees in the feminine plural with 'a carta…, a resposta… e o que…' — The third item is a clause ('o que … tornou a escrever'), which does not impose a gender. The feminine plural agrees with the two nouns, which is defensible.
- Rejected: pt-BR/ch001.md [74] — 'much more a schismatic' rendered 'muito menos um cismático' — The sense is 'much less can a schismatic give'. In Portuguese the negative clause calls for 'muito menos', so the meaning is kept.
