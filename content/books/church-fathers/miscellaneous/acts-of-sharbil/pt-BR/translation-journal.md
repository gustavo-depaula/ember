# Diário de tradução — Atas de Sharbil (pt-BR)

Fonte: en-US/ (trad. B. P. Pratten, Ante-Nicene Fathers, vol. 8, 1886; revisão de Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Acts of Sharbil | Atas de Sharbil | “Atas” conforme obras irmãs; sem artigo no título. |
| Miscellaneous | Diversos | Conforme obras irmãs (miscellaneous/*). |
| Sharbil / Babai | Sharbil / Babai | Nomes siríacos mantidos. |
| Barsamya / Tiridath / Shalula / Palut | Barsamya / Tiridath / Shalula / Palut | Mantidos; Barsamya conforme miscellaneous/martyrdom-of-barsamya. |
| Labu, Hafsai, Barcalba, Avida | Labu, Hafsai, Barcalba, Avida | Mantidos. |
| Addæus the apostle | o apóstolo Addai | Forma siríaca usual. |
| Abgar the Seventh | Abgar, o Sétimo | |
| Abshelama | Abshelama | Conforme obras irmãs. |
| Lysanias | Lisânias | Conforme obras irmãs. |
| Trajan Cæsar | Trajano César | |
| kingdom of Alexander king of the Greeks | reino de Alexandre, rei dos gregos | Era selêucida; nota do tradutor [^1]. |
| Edessa of the Parthians | Edessa dos partos | |
| Nebu / Bel | Nebu / Bel | Nota do tradutor [^2]. |
| Nisan / Ilul | Nisan / Ilul | Meses siríacos mantidos, como nas obras irmãs. |
| Record office / archives | Casa dos Arquivos / arquivos | |
| Sharirs (of the city) | Sharirs (da cidade) | Conforme obras irmãs. |
| Marinus / Anatolus | Marino / Anatolo | Notários. |
| Binus / Fabianus | Bino / Fabiano | Bispos de Roma. |
| Simon Cephas / Paul | Simão Cefas / Paulo | |
| Bethsaida of Galilee / Tarsus / Cilicia | Betsaida da Galileia / Tarso / Cilícia | |
| prætor | pretor | |
| governor / judge | governador / juiz | |
| judgment-hall | pretório | Conforme obras irmãs. |
| attendants | oficiais | Conforme obras irmãs. |
| executioners / headsmen | carrascos / verdugos | |
| keeper of the prison | carcereiro | |
| combs | pentes | Instrumento de tortura; conforme obras irmãs. |
| stripes / thongs / straps | açoites / correias | |
| wooden vice | torno de madeira | |
| seal of salvation | selo da salvação | Batismo; nota do tradutor [^3]. |
| King Christ / Son Christ | Rei Cristo / Filho Cristo | |
| King of kings | Rei dos reis | Conforme obras irmãs. |
| idols made (with hands) | ídolos feitos (*por mãos*) | |
| luminaries | luzeiros | Conforme obras irmãs. |
| confessor | confessor | |
| pagans / paganism | pagãos / paganismo | |

## Decisões

- Tratamento: *tu* entre Sharbil, Barsamya e o juiz; *vós* quando Barsamya se dirige ao povo em [5] e quando Sharbil fala à multidão em [10]; *vós* na oração final a Cristo ([127]).
- Em [80] e [83], “your gods” mantido no singular (*teus*), por ser o juiz o interlocutor.
- Citações bíblicas sem referência na fonte (Salmos, Romanos, Marcos) traduzidas da redação inglesa, sem referência acrescentada.
- “nativities” ([45]) traduzido por “horóscopos” (sentido astrológico).
- “that you idle not by the emperors' law” ([115]) vertido por “para que não sejas negligente para com a lei dos imperadores”.
- Notas do tradutor: [^1] era selêucida (ano 416 ≈ 104-105 d.C.); [^2] Nebu e Bel; [^3] “selo” como nome do batismo; [^4] mitos de Ganimedes e de Dafne aludidos em [80].

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of ch001 (134 paragraphs), the footnotes, the journal and book.json: one meaning fix ([126] 'sucumbisse' for 'did not suffer') and one minor fix ([120] 'maiores' for 'further'); everything else is clean.
- `pt-BR/ch001.md` [126]: “admirando-se de que ele não sucumbisse às suas aflições” → “admirando-se de que ele não sofresse com as suas aflições” — source: 'wondering that he did not suffer under his afflictions'. The crowd marvels that he shows no suffering, as the cheerful face in the next clause confirms; 'sucumbir' means to collapse or die, a different claim. *(meaning)*
- `pt-BR/ch001.md` [120]: “escapasse de torturas ainda maiores” → “escapasse de outras torturas ainda” — source: 'escape from still further tortures', meaning additional tortures, not greater ones.
- Rejected: pt-BR/ch001.md [5] — audit: 12 vs 10 emphasis markers — the supplied '*that are*' is absorbed by 'ídolos feitos e enganosos'; Portuguese needs no inserted words there.
- Rejected: pt-BR/ch001.md [7] — audit: 8 vs 6 emphasis markers — the supplied '*is*' in 'There *is* hope' is absorbed by 'Há esperança'.
- Rejected: pt-BR/ch001.md [5], [45] — 'is from Him' rendered 'procede dele' — a defensible rendering of origin, used consistently for both the Son and the Spirit; the sense is unchanged.
- Rejected: pt-BR/ch001.md [63], [87] — imperative 'faz' instead of 'faze' — both forms are accepted for the second-person singular imperative of 'fazer', and the file uses 'faz' consistently.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 134 parágrafos, das notas, do diário e de book.json: um erro menor de regência; os dois alertas de ênfase não indicam defeitos.
- `pt-BR/ch001.md` [52]: “nem *disso* me importa” → “nem *isso* me importa” — Erro de regência: em «isso me importa», «isso» é sujeito e não leva a preposição «de».

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [51]-[53]: the regency fix in [52] is correct, and no new defects were found in the shown paragraphs.
- Rejected: pt-BR/ch001.md [52] — Check of the round 2 fix 'nem *isso* me importa' — 'isso' is the subject of 'importa', so the sentence is grammatical. The source's emphasis on *this* is kept, and the following clause 'se o que é feito deve ser honrado ou não' still connects correctly.
