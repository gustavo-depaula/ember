
## Termos

| washing of regeneration | banho da regeneração | Conforme Instruções aos Catecúmenos e Segunda Homilia sobre Eutrópio. |
| lovingkindness | benignidade | Conforme as obras irmãs de João Crisóstomo. |
| alms / almsgiving | esmola | Conforme as obras irmãs; também “pela esmola” quando designa sua prática. |
| peculiar people | povo que lhe seja próprio | Conserva a ligação com a explicação de “peculiar” como “próprio”. |
| maintain good works | dedicar-se às boas obras | Inclui o socorro material, a proteção e a defesa dos necessitados, conforme a explicação da Homilia 6. |
| Holy Ghost | Espírito Santo | Conforme as obras irmãs. |
| the Three Children | os três jovens | Conforme Homilias sobre a Epístola a Filêmon. |
| Artemas / Tychicus / Zenas / Apollos / Nicopolis | Ártemas / Tíquico / Zenas / Apolo / Nicópolis | Conforme o comentário de Tomás de Aquino a Tito e demais obras do corpus. |
| lawyer | doutor da lei | Na Homilia 6, designa o conhecedor das leis judaicas, conforme a explicação expressa do autor. |
| Thrace / Nebuchadnezzar / Sirach | Trácia / Nabucodonosor / Eclesiástico | Conforme as obras irmãs de João Crisóstomo. |
| Androgeus / Minos / Apollo / Furies | Androgeu / Minos / Apolo / Fúrias | Nomes da mitologia clássica. |

## Decisões

- Traduzidos os 49 parágrafos da Homilia 5 e os 22 da Homilia 6, com correspondência individual, além da definição da nota acrescentada.
- Mantidas as referências da fonte, inclusive “Gálatas 4:4” e “Salmo 6:2” na Homilia 5, bem como “Eclesiástico 26:27” na Homilia 6. Preservado também “Vers. 14” antes da recomendação sobre Zenas e Apolo.
- Na Homilia 5, §18, conservada a formulação difícil da edição acerca da grandeza absoluta e relativa, sem reconstrução conjectural.
- Na Homilia 5, §41, preservadas a sequência e as particularidades das narrativas mitológicas, sem harmonização com outras versões. Acrescentada a nota do tradutor 3 para explicar o termo latino *Pædica*, mantido em itálico.
- Na Homilia 6, §4, mantido entre colchetes o comentário editorial sobre as genealogias judaicas.
- Na Homilia 6, §7, conservada a localização de Nicópolis na Trácia tal como consta da fonte.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 4 minor. Full read of the six homilies: one meaning fix (reversed referent for the epistle written in prison) and four minor fixes (verse label, ambiguous ellipsis, two section labels).
- `pt-BR/ch001.md` [6]: “pois esta ele escreveu perto de seu fim e na prisão; aquela, porém, quando estava livre e em liberdade” → “pois aquela ele escreveu perto de seu fim e na prisão; esta, porém, quando estava livre e em liberdade” — The source says the letter to Timothy was written near his end and in prison, and Titus while he was free. After "Esta Epístola" (Titus), the reader takes "esta" as Titus, so the PT says the reverse. *(meaning)*
- `pt-BR/ch005.md` [26]: “Cap. 3:1.” → “Cap. 3, vers. 1.” — The source has "Chap. iii. 1." ch003 [26] renders the same label as "Cap. 2, vers. 1." This aligns the format and clears the audit's false reference flag.
- `pt-BR/ch005.md` [41]: “Um homem amava sua madrasta, uma mulher, seu enteado, e por isso se enforcou.” → “Um homem amava sua madrasta; uma mulher amava seu enteado e, por isso, se enforcou.” — The source reads "a woman her step-son, and in consequence hung herself." With the commas, "uma mulher" reads as apposition to "madrasta", and the subject of "se enforcou" is unclear.
- `pt-BR/ch005.md` [49]: “Moral. Demos, portanto” → “Exortação moral. Demos, portanto” — Homilies 1 to 4 render the same section label "Moral" as "Exortação moral".
- `pt-BR/ch006.md` [16]: “Moral. Por que razão” → “Exortação moral. Por que razão” — Homilies 1 to 4 render the same section label "Moral" as "Exortação moral".
- Rejected: pt-BR/ch005.md [41] — The audit flags emphasis markers around *Pædica*. — This is a retained foreign term, so italics are the house rule. The note [^3] that serves it is accurate enough.
- Rejected: pt-BR/ch002.md [27] — "do not give them charges" is rendered as "não lhes confies encargos". — The source is ambiguous between injunctions and offices. The context, men who want to rule rather than be ruled, supports offices.
- Rejected: pt-BR/ch001.md [5] — "transferred" is rendered as "elevados". — The sense of the state into which grace brought them is kept. This is a defensible choice.

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Lidos integralmente os 210 parágrafos, as notas, o book.json e o diário; encontradas duas ocorrências de uma mudança de sentido na Homilia 4.
- `pt-BR/ch004.md` [20]: “aquela que cuida de sua casa também será sóbria” → “aquela que permanece em casa também será sóbria” — “She who keeps at home” significa aquela que permanece em casa; cuidar da casa substitui a condição apresentada pelo autor. *(meaning)*
- `pt-BR/ch004.md` [20]: “aquela que cuida de sua casa também será uma administradora prudente” → “aquela que permanece em casa também será uma administradora prudente” — A fonte distingue permanecer em casa (“keeps at home”) da consequência de ser uma administradora prudente. *(meaning)*
- Rejected: pt-BR/ch005.md [41] — O alerta mecânico aponta dois marcadores de ênfase adicionais. — Os marcadores põem o termo estrangeiro Pædica em itálico, conforme a regra editorial; mantém-se a decisão da rodada anterior.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch004 [19]–[21]: both round-2 changes to [20] are correct and the paragraphs shown are clean.
- Rejected: pt-BR/ch004.md [20] — Repeated “Pois … Pois” at the start of consecutive sentences — Mirrors the source's “For … For”; a style choice, not a defect.
- Rejected: pt-BR/ch004.md [20] — Round 2 change “cuida de sua casa” → “permanece em casa” — Correct: “keeps at home” (oikourós) means staying at home, and the clause and its parallel stay grammatical.
