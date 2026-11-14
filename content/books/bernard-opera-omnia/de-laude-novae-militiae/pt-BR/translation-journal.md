# Diário de tradução — Em louvor da nova milícia (pt-BR)

Fonte: la/, *S. Bernardi Claraevallensis abbatis opera omnia*, ed. J. Mabillon, em Migne, Patrologia Latina 182 (Paris 1854); TEI XML do Corpus Corporum (Universidade de Zurique), obra 6158.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Bernardus Claraevallensis | São Bernardo de Claraval | Convenção do corpus e do book.json. |
| De laude novae militiae | Em louvor da nova milícia | Título do book.json; no c01, “Do louvor da nova milícia”. |
| Admonitio Mabillonii | Advertência de Mabillon | Convenção dos livros irmãos. |
| Prologus / Caput | Prólogo / Capítulo | Numeração romana da fonte. |
| militia | milícia | Conserva o jogo *militia*/*malitia*, “milícia”/“malícia” (c02). |
| militia saecularis | milícia secular; milícia do século | |
| miles / milites | cavaleiro / cavaleiros; soldados | “Soldados” só em Lucas 3:14 (c03). |
| milites Christi / equites | cavaleiros de Cristo | |
| commilitones | companheiros de armas | Prólogo e Regra dos templários. |
| Fratres Templi / Templarii | irmãos do Templo / templários | |
| Templum Domini / Templum Salomonis | Templo do Senhor / Templo de Salomão | Advertência, c05. |
| Magister militiae | mestre da milícia | |
| Servientes | sargentos | Irmãos não cavaleiros. |
| homicida / malicida | homicida / malicida | c03; nota do tradutor. |
| conversatio | modo de vida; convívio; conduta | Conforme o contexto. |
| sacramentum | mistério; sacramento | “Sacramento da confissão” (c12); “mistério” nos demais casos. |
| Verbum / verbum | Verbo / palavra | |
| charitas | caridade | Convenção do corpus. |
| Dominus sabaoth / Dominus virtutum | Senhor dos exércitos | Convenção do corpus. |
| pudor / confusio | vergonha / confusão | c12. |
| meritum / debitum | mérito / dívida | c11. |
| Hugo de Paganis | Hugo de Payns | Como na descrição do book.json. |
| Gaufredus de Sancto-Aldemaro | Godofredo de Saint-Omer | |
| Gaufridus (biógrafo) | Godofredo | Convenção dos irmãos. |
| Guillelmus Tyrensis | Guilherme de Tiro | |
| Balduinus rex | rei Balduíno | |
| Guigo Carthusiae praepositus | Guigo, prior da Cartuxa | |
| Robertus Burgundio / Ebrardus | Roberto, o Borgonhês / Everardo | |
| Petrus Venerabilis | Pedro, o Venerável | Convenção dos irmãos. |
| concilium Trecense | concílio de Troyes | |
| Miraeus / Manricus | Le Mire (Miraeus) / Manrique | |
| Joannes Michaelensis | João Miguelense | |
| Albericus Trium-Fontium | Alberico de Trois-Fontaines | |
| Honorius / Eugenius / Stephanus patriarcha | Honório / Eugênio / Estêvão, patriarca | |
| collatio | colação | Ceia leve dos dias de jejum. |
| Bethlehem / Nazareth / Bethphage / Bethania | Belém / Nazaré / Betfagé / Betânia | |
| mons Oliveti / vallis Josaphat | monte das Oliveiras / vale de Josafá | |
| Jordanis / Naaman / Elisaeus / Josue | Jordão / Naamã / Eliseu / Josué | |
| Calvaria / calvus | Calvário / calvo | c10; nota do tradutor. |
| Psal. | Salmo | Numeração da Vulgata conservada. |
| I Reg. / IV Reg. | 1 Samuel / 2 Reis | Convenção do corpus. |
| Eccli. / I Macchab. | Eclesiástico / 1 Macabeus | |

## Decisões

- Aspas « » da fonte trocadas por “ ”.
- Tratamento: *vós* aos cavaleiros e a Deus nos salmos citados; *tu* a Hugo (prólogo), a Jerusalém e ao leitor genérico.
- c03 [4] e c04 [2]: o OCR deslocou o fragmento “militantium, dicamus breviter Christi equitum mo-” para o fim do c03. Foi suprimido ali e reintegrado no c04 (“que militam [...] para o diabo, digamos brevemente quais são os costumes e a vida dos cavaleiros de Cristo”), segundo o texto de Mabillon.
- Erros do OCR lidos pelo sentido: *Omino* (*omnino*), *a vidior* (*avidior*), *minine* (*minime*), *inveteraveverunt*, *cnm* (*cum*), *autem* por *aurem* (c08), *consilium Trecense* (*concilium*), *perfectione* lido como *profectione*, “partida” (c05).
- c11 [12]: a fonte dá *Rom. VI, 23* para “Invenio aliam legem in membris meis”; corrigido para Romanos 7:23.
- Variantes do editor `[ *al.* …]` mantidas em latim, junto da palavra a que se referem.
- Citações bíblicas traduzidas da letra de Bernardo, sem completar com palavras da Vulgata (p. ex. Romanos 5:18 e 6:4-5).
- Notas do tradutor: advertência [^1] (o “n. 10” de Mabillon remete ao c05); c03 [^1] (*malicida*), [^2] (as duas espadas); c04 [^1] (leito de Salomão, Cântico 3:7-8); c05 [^1] (Templo de Salomão, al-Aqsa); c08 [^1] (Oliveiras e misericórdia, Josafá e juízo); c10 [^1] (*calvus*/*Calvaria*).

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of the admonitio, the prologue and c01–c13 against the Latin, with all audit flags and translator's notes checked. Two minor fixes: a rendering of the variant instead of the main reading in c09, and a broken coordination in c11.
- `pt-BR/c09.md` [2]: “que a própria Trindade consagrou para si [ *al.* sibi] com uma presença evidente?” → “que a própria Trindade consagrou com uma presença evidente de si mesma [ *al.* sibi]?” — The main text reads *ipsa sui Trinitas quadam evidenti praesentia dedicavit*: *sui* goes with *praesentia*. “Para si” renders the variant *sibi*, and the variant note then seems to point at the text it replaced.
- `pt-BR/c11.md` [3]: “não possa dá-la a quem nem na medida em que quiser” → “não possa dá-la nem a quem nem na medida em que quiser” — Source: *non valeat eam dare cui, vel quatenus voluerit*. The first “nem” is missing, which leaves the coordination broken.
- Rejected: admonitio.md [5] — Extra parentheses flagged by the audit — “Le Mire (Miraeus)” is the form recorded in the Key Terms table.
- Rejected: c03 [4], c07 [2], c11 [11], c12 [2] — Emphasis marker counts differ from the source — Each case is a quotation split by *inquit* in the source and rendered as one italic span around “diz”. The quoted text is complete.
- Rejected: translation-journal.md, row De laude novae militiae — “Em louvor da nova milícia” occurs ×0 in pt-BR — The row says the form is the book.json title, and book.json uses it. The text has “Do louvor” (c01) and “sobre o louvor” (advertência), as the row notes.
- Rejected: c11.md [12] — Rom. VI, 23 changed to Romanos 7:23 — The quotation is Rm 7:23. The correction is recorded in the journal, and the source file is unchanged.
- Rejected: c07.md [2] — “a letra, e a carne do Verbo” is ambiguous — It follows the elliptical Latin *littera est et caro Verbi*. The reading is defensible.
- Rejected: c11.md [6] — *gratis* rendered “em vão” — In context *gratis* means without cause; this matches *frustra* in the next sentence. Defensible.

### Round 2 (codex, full read)
Verdict: 4 meaning-level, 2 minor. Leitura integral da advertência, do prólogo e dos capítulos I–XIII, com notas, book.json, diário e auditoria: quatro defeitos de sentido e dois menores.
- `pt-BR/prologus.md` [3]: “vendo que te deixara frustrado com uma espera assaz longa deste gênero” → “vendo-me frustrado por uma espera assaz longa deste gênero” — O latim diz «me [...] frustratum»: é Bernardo, não Hugo, quem se vê frustrado pela espera. *(meaning)*
- `pt-BR/c05.md` [3]: “aproveita tanto quanto antes prejudicara o seu modo de vida” → “aproveita a tantos quantos antes prejudicara o seu modo de vida” — «Tantis [...] quantis» compara o número de pessoas beneficiadas e anteriormente prejudicadas. *(meaning)*
- `pt-BR/c06.md` [2]: “Ainda que conhecemos Cristo” → “Ainda que tenhamos conhecido Cristo” — A oração concessiva introduzida por «ainda que» exige o subjuntivo; preserva-se o passado de «cognovimus».
- `pt-BR/c11.md` [2]: “a vida parece mais austera e a morte mais doce” → “a morte parece mais austera e a vida mais doce” — Na comparação imediatamente anterior, «mortis [...] quam vitae», «illa» retoma a morte e «haec» a vida; a tradução inverte os predicados. *(meaning)*
- `pt-BR/c12.md` [2]: “Quem quer, pois, que tenha a palavra” → “Quem quer que tenha, pois, a palavra” — O inciso foi colocado dentro da locução «quem quer que», fazendo «quer» parecer uma forma do verbo querer.
- `pt-BR/c13.md` [2]: “preferiu perder a vida a perdê-la” → “preferiu perder a vida a perder a obediência” — «Ipsam» retoma «obedientiam». Em português, «perdê-la» retoma imediatamente «a vida» e obscurece a comparação. *(meaning)*

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of the admonitio, the prologue and c01–c13 against the Latin, with book.json, the journal, the translator's notes and the audit flags: no defects found.
- Rejected: pt-BR/c09.md [2] — “o Filho foi até batizado” for *Filius est et baptizatus*: “até” may seem to add emphasis the Latin lacks — *et* here is additive (“também”); “até” is a defensible rendering of it, and the sense is unchanged.
- Rejected: pt-BR/c11.md [2] — Antecedents of *illa*/*haec* in “a morte parece mais austera e a vida mais doce” — Round 2 settled the reading by the nearer/farther rule after *mortis … quam vitae*. There is no new argument to reverse it.
- Rejected: pt-BR/c03.md, footnote [^2] — Claim that Bernard returns to the image of the two swords in *Sobre a consideração* — Correct: De consideratione IV, 3, 7 discusses the spiritual sword and the material sword, with reference to Lk 22:38.
- Rejected: pt-BR/c08.md, footnote [^1] — Etymology of Josafá and the reference to Joel — Correct: Jehoshaphat means “the Lord judges”, and Joel 3(4):2 puts the judgement of the nations in that valley.
- Rejected: audit flags (admonitio [5], emphasis counts in c03/c07/c11/c12, the Key Terms row) — Mechanical audit flags — Each one was checked and is explained by the round 1 rejections: “Le Mire (Miraeus)”, quotations split by *inquit*, and the book.json title. The text has not changed since.
