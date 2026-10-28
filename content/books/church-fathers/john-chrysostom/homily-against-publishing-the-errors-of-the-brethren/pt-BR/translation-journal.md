# Diário de tradução — Homilia contra a divulgação dos erros dos irmãos (pt-BR)

Fonte: en-US/, tradução de R. Blackburn, em Nicene and Post-Nicene Fathers, First Series, Vol. 9 (ed. Philip Schaff, 1889), revista por Kevin Knight para a New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| John Chrysostom | João Crisóstomo | Conforme as obras irmãs. |
| Publishing the Errors of the Brethren | divulgação dos erros dos irmãos | "Publishing" no sentido de tornar público. |
| surgery (of physicians / of the Church) | consultório médico / consultório | Sentido antigo de "surgery": lugar onde o médico atende e dispensa remédios (gr. *iatreîon*). |
| medicine / medical treatment | remédio / tratamento | |
| love of wisdom | amor à sabedoria | Gr. *philosophía*; ver nota do tradutor 1. |
| the Master (Deus, Cristo) | o Senhor | Conforme as obras irmãs. |
| master (na parábola, Mateus 18) | senhor | Segue a maiúscula da fonte em cada ocorrência. |
| fellow-servant / fellow-slaves | conservo / conservos | Conforme *Primeira Homilia sobre Eutrópio*. |
| lovingkindness | benignidade | Conforme as obras irmãs. |
| love of man / God loves mankind / lover of mankind | amor aos homens / Deus ama os homens / amigo dos homens | |
| liberty of speech (towards God) | liberdade de palavra diante de Deus | Gr. *parrhesía*. |
| earnestness / listlessness / slackness | fervor / apatia / moleza | |
| the devil / the wicked one | o diabo / o maligno | |
| the three children | os três jovens | Daniel 3. |
| hundred pence / ten thousand talents | cem denários / dez mil talentos | Forma usual em português para a moeda da parábola. |
| the Virgin / the Angel | a Virgem / o Anjo | Maiúscula conforme a fonte. |
| the Holy Ghost | o Espírito Santo | |
| Isaac, Rebecca, Sarah, Rachel, Jacob, Esau, Bethuel | Isaac, Rebeca, Sara, Raquel, Jacó, Esaú, Betuel | |
| Elizabeth, Gabriel, Lazarus, Abraham, Apollos, Moses | Isabel, Gabriel, Lázaro, Abraão, Apolo, Moisés | |
| the Corinthians | os coríntios | |

## Decisões

- Tratamento: *vós* quando o pregador se dirige à assembleia ("ouvistes ontem", "ouvi"); *tu* no interlocutor genérico da diatribe (§§ 2, 4, 6–8, 11–12) e nas falas de Gabriel a Maria e de Cristo ao discípulo.
- "Pray" e "I pray" como partícula de insistência ("consider, pray") viraram "peço-te" ou foram absorvidos pela frase, sem valor de oração.
- As referências bíblicas que a fonte põe logo após a citação (Hebreus 11:16, Mateus 5:16, Mateus 18:28) ficaram no mesmo lugar, sem parênteses, como na fonte.
- As citações de Gênesis 25, Lucas 1, Mateus 18, 1 Coríntios 4:6 e 2 Coríntios 12:21 seguem a redação da fonte, e não a de uma Bíblia portuguesa. Exemplos: "convence-o dela", "o poder miraculoso do Altíssimo".
- § 11: "The Master having heard this" ficou com a maiúscula da fonte ("O Senhor"), porque o senhor da parábola figura Deus.
- Nota do tradutor 1 (§ 1, em "amor à sabedoria"): explica que a expressão traduz *philosophía* e o sentido ascético que tem em Crisóstomo. A expressão volta nos §§ 9 e 11.
- Frases longas da fonte foram divididas em períodos mais curtos onde a sintaxe portuguesa ficaria pesada, sem perder nenhuma oração.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 [1]–[15], source beside translation, plus the journal and book.json: no defects; the audit flags are the bold paragraph numbers.
- Rejected: pt-BR/ch001.md [2]–[15] — Mechanical audit: 4 emphasis markers in the PT against 0 in the source — These are the bold paragraph numbers (`**1.**` … `**12.**`) the house format requires; nothing else is emphasised.
- Rejected: pt-BR/ch001.md [2], [5] — 'earnestness' is rendered 'empenho', not the Key Terms 'fervor' — Here the word means the poor hearer's attention to the sermon, not fervour in prayer. 'Empenho' fits that context and does not change the sense; elsewhere the text uses 'fervor' as the table says.
- Rejected: pt-BR/ch001.md [7] — 'se chegarem a ele' could seem to refer to the devil — The source 'come to him' is just as open. The context ('chegar ao juiz') settles it as the judge, the same as in the English.
- Rejected: pt-BR/ch001.md [15] — 'ao teu senhor' is lowercase although it means God — The source has lowercase 'your master' at this point. Following the source's capitalisation agrees with the journal's decision.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos blocos [1]–[15], nota, diário e book.json: uma referência incorreta no diário; nenhum defeito de sentido. Os alertas de ênfase correspondem à numeração em negrito.
- `pt-BR/translation-journal.md`: “§ 14: "The Master having heard this"” → “§ 11: "The Master having heard this"” — A passagem está na seção 11 da homilia; 14 é o índice do bloco nesta revisão. As demais referências do diário seguem as seções numeradas.
- Rejected: pt-BR/ch001.md [12] — “Despertar a nossa indolência” poderia parecer significar provocar indolência. — A personificação reproduz “rouse up our indolence”; o contexto esclarece que se trata de despertar a atenção adormecida.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read: checked the one journal correction (§ 14 → § 11) against the paragraph numbering; it is correct, no chapter paragraph changed, no defects found.
- Rejected: pt-BR/translation-journal.md — Whether the corrected '§ 11' for "The Master having heard this" is right — The twelve flagged blocks [2],[3],[5]–[9],[11]–[15] carry the numbers 1–12 in order, so block [14] is section 11; the fix is correct and agrees with the journal's other section references.
