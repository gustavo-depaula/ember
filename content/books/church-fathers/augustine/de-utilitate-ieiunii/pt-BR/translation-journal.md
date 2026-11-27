# Diário de tradução — A utilidade do jejum (pt-BR)

Fonte: la/. Texto maurino dos Beneditinos de Saint-Maur (1679–1700), conforme impresso na Patrologia Latina de Migne e disponibilizado em augustinus.it, segundo a edição indicada em `book.json`.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| De utilitate ieiunii | A utilidade do jejum | Título estabelecido nos metadados. |
| Aurelius Augustinus Hipponensis / Augustinus | Agostinho de Hipona / Agostinho | Conforme os metadados e as obras irmãs. |
| Deus / Dominus / Dominus et Salvator | Deus / Senhor / Senhor e Salvador | Convenções das obras irmãs. |
| Christus / Christus Iesus / Pater / Filius | Cristo / Cristo Jesus / Pai / Filho | Conforme as obras irmãs. |
| Ecclesia / Apostolus / Apostoli / Scriptura | Igreja / Apóstolo / Apóstolos / Escritura | “Apóstolo”, empregado absolutamente, designa Paulo. |
| Angeli / panis Angelorum | Anjos / pão dos Anjos | Conservada a maiúscula da fonte. |
| ieiunium / ieiunare / abstinere | jejum / jejuar / abster-se | Vocabulário central da obra. |
| caro / spiritus / anima / corpus / mens | carne / espírito / alma / corpo / mente | Conforme as obras irmãs e as distinções locais. |
| iustitia / pietas / caritas / dilectio | justiça / piedade / caridade / amor | Conforme as obras irmãs; ajustes sintáticos segundo o contexto. |
| Dilectio vestra / Caritas vestra | vossa caridade | Fórmulas de tratamento da assembleia. |
| fides / gratia / salus / iniquitas | fé / graça / salvação / iniquidade | Convenções das obras irmãs. |
| cibus / satietas / saturitas | alimento / saciedade / saciedade | Conservadas as imagens alimentares da vida espiritual. |
| superna vocatio / palma | vocação celeste / palma | Mantida a imagem da palma como prêmio. |
| temperantia / licitum / illicitum | temperança / lícito / ilícito | Distinção entre renúncia ao permitido e afastamento do proibido. |
| concupiscere adversus | ter desejos contrários a | Preservado o paralelismo entre carne e espírito. |
| unitas / concordia / dissensio / divisio | unidade / concórdia / dissensão / divisão | Vocabulário central da exortação eclesial. |
| membra Christi / caput / corpus | membros de Cristo / cabeça / corpo | Conservada a analogia corporal da unidade da Igreja. |
| Pagani / Iudaei / haeretici / Christiani | pagãos / judeus / hereges / cristãos | Formas portuguesas usuais; minúsculas para os grupos. |
| Adam / Ierusalem | Adão / Jerusalém | Formas portuguesas dos nomes bíblicos. |
| Hercules / Iuno / Vulcanus / Mars | Hércules / Juno / Vulcano / Marte | Nomes mitológicos em português. |
| Donatus / Arius / Photinus / Novatus | Donato / Ário / Fotino / Novato | Formas portuguesas dos nomes citados. |
| sacrilega sacramenta | ritos sacrílegos | *Sacramenta* designa aqui os ritos do culto pagão. |
| frumentum / palea / area | trigo / palha / eira | Mantida a imagem agrícola da separação final. |
| piscatores / venatores / retia | pescadores / caçadores / redes | Preservada a passagem da pesca à caça na argumentação. |
| hereditas / possessor | herança / possuidor | Mantida a distinção entre dividir a herança e possuí-la em comum. |

## Decisões

- Traduzido diretamente o latim fornecido, sem acrescentar referências bíblicas às citações que a fonte deixa sem indicação.
- Conservados o título, a ordem e os dezesseis parágrafos da fonte. A numeração autoral composta foi apresentada como texto em negrito, inclusive as sequências 5.7/6.7 e 6.9/7.9.
- Mantidos “tu” nas interpelações individuais, “vós” no tratamento da assembleia e o tratamento reverente de Deus; na fala bíblica do homem que interpela Jesus, preservado o singular “dize”.
- As fórmulas pastorais *Dilectio vestra* e *Caritas vestra* receberam ambas “vossa caridade”, sem criar distinção de destinatário.
- *Sursum cor* foi traduzido por “Coração ao alto”, conservando o singular da fonte.
- Em 1.1, *ructet* recebeu “eructa”, conservando a imagem corporal associada ao alimento e à saciedade; *suo tempore replebunt* foi expresso como “alcançarão a plenitude a seu tempo”, segundo a progressão da capacidade de receber à plenitude.
- Em 4.4, a nota do tradutor 1 explica o jogo entre *sapit* e *desipit*, traduzido por “quem assim pensa, pensa sem juízo”.
- Conservadas as imagens, relações domésticas e expressões de constrangimento da argumentação, inclusive a disciplina de esposa, filho e escravo e as ordens dirigidas aos caçadores.
- Em 10.12, *patiens est* foi vertido por “o médico tem paciência”, explicitando o sujeito retomado da oração anterior.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 (16 paragraphs), book.json and journal; one regency fix ('tornas-lhe' → 'torna-lo'), the rest is faithful and complete.
- `pt-BR/ch001.md` [6]: “e, ao castigá-lo, tornas-lhe obediente” → “e, ao castigá-lo, torna-lo obediente” — source: in castigando oboedientem facis; 'tornar' takes a direct object, so the clitic is 'o' (torna-lo), not 'lhe'
- Rejected: pt-BR/ch001.md [2]–[16] — audit: emphasis markers differ — the difference is the added bold section numbers (**1.1.** etc.); italics of the quotations match the source
- Rejected: pt-BR/ch001.md [15] — audit: parentheses differ — the parenthetical 'non dico si filius … non hoc dico' is kept in full, set off with dashes; style choice
- Rejected: pt-BR/ch001.md [16] — 'Senhor, dizei a meu irmão' against the biblical 'dize' — the journal decision: the biblical speaker keeps singular 'dize', the faithful's own address to the Lord uses reverential vós
- Rejected: pt-BR/ch001.md [8] — 'Diz-me' as tu imperative — 'diz' is an accepted variant of the tu imperative of 'dizer' alongside 'dize'
- Rejected: pt-BR/ch001.md [13] — 'Quantam vero paleam non tollit foras' rendered as an exclamation — the sense is preserved: much chaff stays, yet it too will be winnowed at the end
- Rejected: pt-BR/ch001.md [5] — source 'adversus spiritus' in the first citation — the PT follows the evident sense (spiritum), as the source itself has at its later repetitions; no change to the source needed for the translation

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 16 parágrafos, da nota do tradutor, de book.json e do diário; conferidos os apontamentos mecânicos e a correção da rodada anterior. Nenhum defeito objetivo encontrado.
