# Diário de tradução — Prefácios (pt-BR)

Fonte: en-US/, tradução de W.H. Fremantle, G. Lewis e W.G. Martley (Nicene and Post-Nicene Fathers, Second Series, vol. 6, 1893), revista por Kevin Knight para a New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Jerome | São Jerônimo / Jerônimo | “São Jerônimo” nos metadados, como nas obras irmãs; “Jerônimo” no texto, como na fonte |
| Prefaces / Preface | Prefácios / Prefácio | Maiúscula quando a fonte a usa |
| the Seventy / Seventy Translators / LXX. | os Setenta / Setenta Tradutores / LXX | |
| Septuagint | Septuaginta | |
| Aquila, Symmachus, Theodotion | Áquila, Símaco, Teodocião | |
| Origen / Philo / Josephus | Orígenes / Fílon / Josefo | |
| Eusebius / Pamphilus | Eusébio / Pânfilo | |
| Pope Damasus | Papa Dâmaso | |
| Vincentius, Gallienus | Vicente, Galieno | |
| Lupulianus, Valerianus | Lupuliano, Valeriano | |
| Paula, Eustochium, Blesilla | Paula, Eustóquio, Blesila | |
| Tully / Cicero | Túlio / Cícero | Ambas as formas mantidas, como na fonte |
| Aratus, Xenophon, Flaccus, Pindar | Arato, Xenofonte, Flaco, Píndaro | |
| Terence, Luscius Lanuvinus | Terêncio, Lúscio Lanuvino | |
| the bard of Mantua | o vate de Mântua | |
| Horace, Quintilian, Tranquillus | Horácio, Quintiliano, Tranquilo | |
| Ninus, Valens, Valentinianus, Gratianus, Theodosius | Nino, Valente, Valentiniano, Graciano, Teodósio | |
| Lucian, Hesychius | Luciano, Hesíquio | |
| Ptolemy | Ptolomeu | |
| copies / manuscripts / mss. | cópias / manuscritos | |
| Hebrew Names / Hebrew Places / Hebrew Questions | Nomes Hebraicos / Lugares Hebraicos / Questões Hebraicas | Títulos das obras de Jerônimo |
| ill-will / detractors | malevolência / detratores | |
| the Apostle(s) | o Apóstolo / os Apóstolos | Maiúscula como na fonte |

## Decisões

- As introduções do editor inglês (parágrafos 3, 8, 15, 33 e 37) são parágrafos da fonte, não notas de rodapé; foram traduzidas, com o colchete do parágrafo 8 preservado.
- Os títulos dos dicionários citados pelo editor (“Dictionary of Christian Antiquities”, “Dictionary of Bible”, “Dictionary of Christian Biography”) ficam em inglês.
- “Atrium” (parágrafo 13) mantido como na fonte, sem nota; provavelmente corresponde a Ácio.
- Os números de seção do primeiro prefácio (1., 2., 3.) passam a texto em negrito (`**1.**`).
- Tratamento: *vós* para Vicente e Galieno e para Paula e Eustóquio; *tu* para o Papa Dâmaso, como no latim de Jerônimo.
- “supreme bishop” traduzido literalmente por “bispo supremo”.
- Os versos de Horácio e de Virgílio ficam em blocos de citação de duas linhas, como na fonte.
- “The king brought me into his chamber” (Cântico 1:4) traduzido conforme a redação da fonte, sem referência acrescentada.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 [1]–[37] with source alongside, plus journal and book.json; no defects found, audit flags explained.
- Rejected: pt-BR/ch001.md [5], [6], [7] — Audit: the translation has more emphasis markers than the source. — The extra markers are the `**1.**`/`**2.**`/`**3.**` paragraph numbers in bold, as the journal decided. In [6], *algum* keeps the source's *some*.
- Rejected: pt-BR/ch001.md [35] — Audit: the translation has fewer emphasis markers than the source. — The source splits the line into two italic spans. The translation joins them into one italic line. The formatting is the same and nothing is lost.
- Rejected: pt-BR/translation-journal.md Key Terms — “são jerônimo” occurs 0 times in pt-BR against 10 occurrences of “Jerome” in the source. — The row says “São Jerônimo” is used in the metadata only and “Jerônimo” in the text. That matches book.json and every occurrence in the text.
- Rejected: pt-BR/ch001.md [5] — “a felicidade e a graça da expressão” adds “da expressão”. — It makes explicit what “felicity and grace” refers to. The meaning does not change; this is a defensible style choice.
- Rejected: pt-BR/ch001.md [31] — “em que esta não se afastava” commits the plural “they” to the Septuagint. — Jerome's Latin refers to the renderings of the Seventy (“quae non multum ab Hebraicis discrepabant”), so the referent is right.
- Rejected: pt-BR/ch001.md [36] — “odiosidade” for “odium”. — Portuguese dictionaries record the sense of hatred or aversion. The rendering is accurate.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 37 parágrafos, confrontados com a fonte, e conferência de book.json, diário e auditoria; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/ch001.md [27] — “convencer os LXX de erro” poderia parecer confundir demonstrar um erro com persuadir alguém. — “Convencer de” também admite o sentido tradicional de provar a culpa ou o erro de alguém, adequado ao contexto.
- Rejected: pt-BR/ch001.md [33] — “revisar o latim antigo” poderia parecer referir-se à língua, em vez da antiga versão latina. — A versão latina é explicitamente mencionada na frase anterior; a expressão funciona como referência abreviada a essa tradução.
