# Diário de tradução — Martírio de Habib, o Diácono (pt-BR)

Fonte: en-US/ (trad. B. P. Pratten, Ante-Nicene Fathers, vol. 8, 1886; revisão de Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Martyrdom | Martírio | Sem artigo no título, como na fonte. |
| Miscellaneous | Diversos | Conforme obras irmãs (miscellaneous/*). |
| Habib the deacon | Habib, o diácono | Nome siríaco mantido. |
| Telzeha / Zeugma / Edessa | Telzeha / Zeugma / Edessa | Edessa conforme obras irmãs. |
| Baith Allah Cucla | Baith Allah Cucla | Topônimo siríaco mantido. |
| Ab / Ilul | Ab / Ilul | Meses siríacos (agosto / setembro); mantidos, como nas obras irmãs. |
| kingdom of Alexander the Macedonian | reino de Alexandre, o Macedônio | Era selêucida; nota do tradutor [^1]. |
| Licinius / Constantine (the Great) / Diocletian / Domitianus | Licínio / Constantino (o Grande) / Diocleciano / Domiciano | |
| Julius and Barak | Júlio e Barak | Magistrados. |
| Cona | Cona | Bispo de Edessa; mantido. |
| Lysanias | Lisânias | Forma portuguesa usual (cf. Lucas 3:1). |
| Theotecna | Teotecna | Forma da fonte, só adaptada na grafia. |
| Abshelama, the son of Abgar | Abshelama, filho de Abgar | Abshelama conforme miscellaneous/martyrdom-of-barsamya. |
| Guria and Shamuna | Guria e Shamuna | Mártires de Edessa; mantidos. |
| Theophilus | Teófilo | Narrador. |
| Sharirs (of the city) | Sharirs (da cidade) | Conforme miscellaneous/martyrdom-of-barsamya. |
| governor / judge | governador / juiz | |
| judgment-hall | pretório | Conforme obras irmãs. |
| your Excellency / your Worship | Vossa Excelência / Vossa Senhoria | “Worship” assimilado a “Lordship” das obras irmãs. |
| our Majesty | Nossa Majestade | Ordem imperial ([6]). |
| attendants / band of attendants | oficiais / corpo de oficiais | |
| notaries | notários | |
| combs / tearings | pentes / dilacerações | Instrumento de tortura; literal, conforme obras irmãs. |
| stripes / scourged | açoites / açoitado | |
| strap | correia | Posta na boca do condenado ([71]–[72]). |
| luminary | luzeiro | Conforme miscellaneous/legend-of-barlaam-and-josaphat. |
| crowned / coronation | coroados / coroação | Martírio como coroa. |
| Acts | Atas | Conforme obras irmãs. |
| pagans | pagãos | |
| O King Christ | Ó Rei Cristo | Oração em [73]; tratamento por *vós*. |

## Decisões

- Tratamento: *tu* entre Habib, o governador, Teotecna e a multidão; *vós* na oração a Cristo ([73]) e na pergunta dirigida a Deus em [68] (“‘Que fazeis?’”); *vós* plural em [36] e [63], onde o governador fala aos cristãos em geral; “a quem andais procurando” ([9]) porque Habib se dirige às autoridades em conjunto.
- Pronomes referentes a Deus e a Cristo em minúscula (ele, vós, vosso), segundo o uso editorial moderno.
- Falas sem aspas, como na fonte, que introduz o discurso direto só com dois-pontos; aspas apenas nas citações bíblicas.
- Citações bíblicas sem referência na fonte (Jeremias 17:5 em [54]; Romanos 8:18 em [62]; Mateus 10:39 e 7:6 em [64]; Daniel 4:35 em [68]) traduzidas da redação da fonte, sem acrescentar referências. Em [62] o fecho das aspas antecede “naqueles”, porque em português a preposição se contrai com o pronome que fica fora da citação.
- [32]: “leave no harsh and bitter sufferings untried” → “não deixarei *por experimentar nenhum sofrimento* duro e amargo”, mantido em itálico o acréscimo do editor inglês.
- [17]: a vírgula final da fonte (erro tipográfico) foi substituída por ponto.
- Nota do tradutor [^1] em [2]: explica a era selêucida (“reino de Alexandre”, ano 620 = 308–309 d.C.) e os meses Ab e Ilul.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of ch001 [1]–[81], book.json and the journal; two minor grammar fixes ([8] coordination, [60] regency), no meaning defects.
- `pt-BR/ch001.md` [8]: “por minha causa, e eu me encontre em grande vergonha” → “por minha causa, e me encontrar em grande vergonha” — The source says 'rather than that I should remain in secret … and that I should find myself in great shame'. The subjunctive 'me encontre' has no clause governing it after 'em vez de permanecer'. The infinitive coordinates it correctly.
- `pt-BR/ch001.md` [60]: “Não olho para aquilo que tu olhas” → “Não olho para aquilo para que tu olhas” — Regency: 'olhar para' needs its preposition in the relative clause ('on those things at which you look').
- Rejected: pt-BR/ch001.md [14] — 'este não quisera denunciá-lo' commits the ambiguous 'he' to Teotecna — This reading fits the context: Teotecna had urged Habib to flee, and in [15] the judge rebukes him for deceit.
- Rejected: pt-BR/ch001.md [28] — 'teus ídolos … a ti … como tu' is singular, although 'they said' is plural — The source 'your' is ambiguous, and the singular addressed to the governor is defensible.
- Rejected: pt-BR/ch001.md [50] — 'sobre elas' has no feminine antecedent after 'Isso que disseste' in [49] — 'Coisas' is understood across the exchange, and the sense is clear. This is not an objective defect.
- Rejected: pt-BR/ch001.md [6] — 'our Majesty has commanded' rendered as 'Nossa Majestade ordena' — The present tense is idiomatic in a decree, and the sense is unchanged.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de [1]–[81], da nota do tradutor, de book.json e do diário; nenhum defeito objetivo novo encontrado.
- Rejected: pt-BR/ch001.md [26] — “Depois de ter sido açoitado [...] disse-lhe” pode sugerir que quem fala foi açoitado. — O contexto identifica Habib como quem recebeu os açoites e o governador como quem faz a pergunta; a alternância de sujeitos também ocorre na fonte e não torna o sentido irrecuperável.
