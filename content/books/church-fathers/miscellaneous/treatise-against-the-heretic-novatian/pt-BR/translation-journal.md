# Diário de tradução — Tratado contra o Herege Novaciano (pt-BR)

Fonte: en-US/, tradução de Robert Ernest Wallis, Ante-Nicene Fathers, vol. 5 (Buffalo, NY: Christian Literature Publishing Co., 1886), revista e editada por Kevin Knight para New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| A Treatise Against the Heretic Novatian | Tratado contra o Herege Novaciano | Sem artigo no título, como em miscellaneous/martyrdom-*. |
| Miscellaneous | Diversos | Conforme obras irmãs (miscellaneous/*). |
| Novatian / Novatians | Novaciano / novacianos | Nota do tradutor [^2]. |
| the lapsed | os caídos | Latim *lapsi*; nota do tradutor [^1]. |
| lapse / fall | queda | |
| repentance | penitência / arrependimento | “Penitência” no sentido eclesial (admissão, penitência dos caídos); “arrependimento” para a disposição interior. |
| repent / penitent | arrepender-se / penitente | |
| schism / schismatics | cisma / cismáticos | |
| heretic / heresy | herege / heresia | |
| apostate | apóstata | |
| episcopate / Sees | episcopado / sedes | |
| sacrament of baptism | sacramento do batismo | |
| Decian persecution | perseguição de Décio | |
| beloved brethren | amados irmãos | |
| the Lord Christ | o Senhor Cristo | |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| ark / deluge / dove / raven | arca / dilúvio / pomba / corvo | |
| Noah / Moses / David / Saul / Judas / Peter | Noé / Moisés / Davi / Saul / Judas / Pedro | |
| Ninevites / Pharaoh / Egyptians | ninivitas / Faraó / egípcios | |
| Simon (the Pharisee) / Pilate / Galileans / Siloam | Simão / Pilatos / galileus / Siloé | |
| Cain | Caim | |
| pence / denarii | denários / *denários* | Itálico mantido onde a fonte o tem ([18]). |
| Ancient of days | Ancião dos dias | |
| Gehenna of fire | Geena de fogo | |
| ravening wolves | lobos rapaces | |
| full atonements | plenas satisfações | Satisfação penitencial. |
| Sirach | Eclesiástico | Nome católico usual do livro. |

## Decisões

- Tratamento: *tu* quando o autor se dirige a Novaciano; *vós* aos novacianos e aos hereges em conjunto ([4], [10]); *vós* nas orações e citações dirigidas a Deus ou a Cristo (“Senhor, Senhor, não profetizamos em vosso nome”, “Contra vós somente pequei”). Pronomes referidos a Deus em minúscula.
- Citações bíblicas traduzidas da redação da fonte, inclusive onde ela diverge do texto bíblico usual (por exemplo, “do Pai que está sentado sobre o trono” em Apocalipse 6) e onde a referência da fonte é inexata (Isaías 13:19; Ezequiel 34 sem versículos). Citações sem referência na fonte ficam sem referência.
- Números de parágrafo do autor em negrito inerte (`**1.**`); o parágrafo [17] não tem número na fonte e fica sem.
- [8] “they maintained that unconquered”: frase truncada na fonte inglesa; vertida por “se mantiveram invictos”.
- [12] “labours” (latim *laborat*): “padece”.
- Nota do tradutor [^1] (em [2]): o termo “caídos” (*lapsi*) e a perseguição de Décio, que o leitor precisa para acompanhar o tratado.
- Nota do tradutor [^2] (em [3]): quem foi Novaciano e o cisma novaciano.
- `book.json`: a `description` de `sources` é texto simples, não campo localizado; não recebeu entrada pt-BR.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 [1]–[21], footnotes, book.json and journal: one minor fix for an unmatched dash in [10]; the translation is otherwise faithful and complete.
- `pt-BR/ch001.md` [10]: “ao tempo futuro — ao tempo em que o Senhor começar a julgar os segredos dos homens —, ao tempo em que todos havemos de comparecer diante do tribunal de Cristo —, ao tempo em que muitos” → “ao tempo futuro: ao tempo em que o Senhor começar a julgar os segredos dos homens, ao tempo em que todos havemos de comparecer diante do tribunal de Cristo, ao tempo em que muitos” — The second '—,' closes a dash that was never opened. The source uses its dashes only to separate the items of the series, so the three items are better joined with a colon and commas.
- Rejected: pt-BR/ch001.md [3]–[21] — Mechanical audit: emphasis markers differ (source 0, pt-BR 4 and similar) — The extra markers are the `**n.**` bold paragraph numbers, which the journal says were added on purpose. The italics carried over from the source are all present.
- Rejected: pt-BR/translation-journal.md (Termos) — Audit: 'arrepender-se' ×0 against 'repent' ×16 — The row gives the dictionary form of the verb. The text uses its inflected forms throughout: 'arrependei-vos', 'arrepende-te', 'se arrependerdes', 'se arrepende', 'se teria arrependido'.
- Rejected: pt-BR/ch001.md [5] — 'Formerly' rendered as 'Primeiramente' — With 'isto é, desde o princípio' right after it, 'primeiramente' also reads as 'at first'. It also fits the 'duplo tipo … a primeira e principal' structure of the passage, so this is a defensible choice.
- Rejected: pt-BR/ch001.md [21] — 'Eu sou aquele que apago' uses first-person agreement — First-person agreement after 'sou aquele que' is accepted, and Portuguese Bibles use it in this same verse (Isaías 43:25).
- Rejected: pt-BR/ch001.md [12] — The 'for' of 'for I do not desire the death of the sinner' is not translated — The causal link is still clear after the colon in 'Vivo eu, diz o Senhor: não quero…'. No meaning is lost.

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Leitura integral de [1]–[21], notas do tradutor, book.json, diário e auditoria: dois defeitos de sentido e um de concordância.
- `pt-BR/ch001.md` [4]: “lho proibirá, ainda que o queiram” → “lho proibirá, ainda que o queira” — O sujeito é singular: “Quem quer [...] que se ache”. O plural inglês “they” não exige plural na construção portuguesa.
- `pt-BR/ch001.md` [9]: “e os iguais a eles, isto é, os que ainda estão postos na mesma culpa da sua queda, presumem que não devem” → “e presumem que os iguais a esse povo, isto é, os que ainda estão postos na mesma culpa da sua queda, não devem” — Na fonte, os cismáticos presumem que outros caídos, semelhantes ao povo mencionado, não devem ser admitidos. A construção atual faz esses caídos parecerem o sujeito de “presumem” e deixa “eles” com antecedente ambíguo. *(meaning)*
- `pt-BR/ch001.md` [14]: “até que ele julgue a minha causa” → “até que ele faça justiça à minha causa” — “Justify my cause” indica fazer justiça à causa, com resultado favorável; “julgue” exprime apenas o julgamento, sem conservar esse sentido. *(meaning)*
- Rejected: pt-BR/ch001.md [3]–[21] — Diferenças na quantidade de marcadores de ênfase. — Correspondem à formatação intencional dos números dos parágrafos em negrito; os itálicos da fonte foram preservados.
- Rejected: pt-BR/translation-journal.md — Termos — Ausência da forma literal “arrepender-se” no texto. — A tabela registra o infinitivo; a tradução emprega corretamente formas flexionadas do verbo.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 3 minor. Delta read of ch001 [3]–[5], [8]–[10], [13]–[15]: all three earlier fixes are correct; one minor fix for a repetition the [14] fix created, and two OCR slips corrected in en-US [4].
- `pt-BR/ch001.md` [14]: “faça justiça à minha causa e faça juízo e justiça” → “faça justiça à minha causa e execute juízo e justiça” — source: 'justify my cause, and execute judgment and justice'; the previous fix produced a repeated 'faça … justiça' in the same clause, and 'execute' renders 'execute'
- `en-US/ch001.md` [4]: “as Isaiah gays,” → “as Isaiah says,” — unmistakable OCR slip ('gays' for 'says')
- `en-US/ch001.md` [4]: “because be would have no rest” → “because he would have no rest” — unmistakable OCR slip ('be' for 'he')
- Rejected: pt-BR/ch001.md [4] — 'lho proibirá, ainda que o queira' after the singular fix — the subject 'Quem quer que' is singular, 'lho' is singular too, and the sentence agrees throughout
- Rejected: pt-BR/ch001.md [9] — subject of 'presumem' after the restructuring — it now refers to 'esses cismáticos', as in the source, and 'esse povo' removes the ambiguity of 'eles'
- Rejected: pt-BR/ch001.md [15] — 'numa só família — isto é, a Igreja de Cristo —' without 'na' — an apposition to 'família' is grammatical; the meaning is clear

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Revisados integralmente [13]–[15], notas, book.json, diário e auditoria aplicável; a alteração em [14] e as duas correções de OCR apresentadas estão corretas. Nenhum novo defeito.
