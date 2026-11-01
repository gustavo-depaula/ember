
## Termos

| pastor / lupus / mercenarius | pastor / lobo / mercenário | Distinção entre quem governa, quem pretende a perdição e quem busca proveito próprio. |
| principium naturae / principium moris | princípio da natureza / princípio da moralidade | Distinção do n. 661 entre a alma e a vontade como princípios. |
| intellectus / affectus | intelecto / afeto | Mantida a distinção na análise do fundamento da vida moral, nos nn. 674–675. |
| donum intelligentiae | dom do entendimento | Um dos sete dons relacionados às bem-aventuranças no n. 679. |

## Decisões

- Mantidas as 78 unidades do arquivo, além da definição da nota acrescentada, com os títulos, blocos de citação, destaques e numeração autoral.
- Conservadas as referências divergentes recebidas, entre elas Jeremias 26:13, Isaías 26:13, 1 Coríntios 10:1, Salmos 124:4 e Salmos 73:30. A referência ao último capítulo de Marcos foi explicitada como Marcos 16:20; a de Judas, como Judas 1:12.
- Preservados “criação má” no n. 661, a atribuição de vontade boa e intenção não reta ao exemplo do furto para dar esmola, “sobre palha” no n. 674 e os fragmentos incompletos dos nn. 676 e 679, sem harmonização conjectural.
- No n. 672, regularizados apenas os delimitadores de destaque junto a “e ela não caiu” e à citação de Isaías, cuja marcação estava sobreposta no texto recebido.
- Nota [^95]: esclarece o sentido técnico dos dons “dados gratuitamente” no n. 668, distinguindo sua função em benefício de outros da santidade pessoal de quem os recebe.

## Review log

### Part 1 of 8, Round 1 (claude, full read)
Verdict: 0 meaning-level, 3 minor. Read all 17 files of part 1 clause by clause; the text is faithful and complete. Found 3 minor fixes: two Vulgate-style Kings references ('3 Reis', '4 Reis') at odds with the modern names used elsewhere, and one lemma whose bold-italic markup swallows commentary.
- `pt-BR/g10-c003.md` [59]: “em 3 Reis 19:20” → “em 1 Reis 19:20” — III Reg. XIX, 20; every other reference to Kings in this part uses modern names (1 Samuel, 1 Reis, 2 Reis), e.g. g13-c001 [91] '1 Reis 19:6'
- `pt-BR/g11-c004.md` [36]: “4 Reis 5:11.” → “2 Reis 5:11.” — IV Reg. V, 11; the same verse is rendered '2 Reis 5:27' in g12-c001 [52]; there is no '4 Reis' in the modern names used elsewhere
- `pt-BR/g12-c002.md` [191]: “***Quem vos recebe, a mim recebe. Aqui apresenta o remédio***.” → “***Quem vos recebe, a mim recebe***. Aqui apresenta o remédio.” — 'Hic ponit remedium' is Thomas's commentary, not the Gospel lemma; the source's misplaced marker was copied, while the translator regularized similar slips elsewhere (g11-c001 [51], g12-c002 [153])
- Rejected: audit: emphasis markers differ (g10-c002 [46], g11-c001 [35], g11-c006 [15], g12-c002 [60] [93] [128] [170] [183] [195] etc.) — fewer or more ***…*** spans than the source — adjacent lemma fragments split by 'ergo'/'enim' were merged into one span, or broken source markup was regularized (g11-c001 [51], g12-c002 [153]); no lemma or quotation lost
- Rejected: audit: g11-c004 [59] — space before punctuation in 'quando chegou . . . e viu' — the source's spaced ellipsis '. . .' is reproduced; not a defect
- Rejected: pt-BR/g11-c001.md [52] — 'Miqueias 8:9' cites a chapter that does not exist (the verse is 7:9) — the source reads 'Michaeae VIII, 9'; references are kept as received and the author is not corrected (same for Joel 2:22, Atos 14:51, Apocalipse 6:14, Mt '7:12' in g13-c001 [82])
- Rejected: pt-BR/g12-c001.md [78] — 'o que se deve fazer aos que querem dar' though the section treats those who refuse — the source reads 'volentibus'; this is not an unmistakable OCR slip, so the translation correctly follows it
- Rejected: pt-BR/g12-c002.md [16] — single Latin question split into a question and a statement — the sense of Mt 10:29 is preserved; a style choice

### Part 1 of 8, Round 2 (codex, full read)
Verdict: 5 meaning-level, 1 minor. Leitura integral dos 17 arquivos apresentados, suas notas, auditoria, journal e book.json: cinco correções de sentido e uma ortográfica.
- `pt-BR/g11-c001.md` [52]: “repousarei junto dela” → “repousarei nela” — O latim diz 'in illa', dentro da explicação da casa como eternidade ou consciência; 'junto dela' substitui interioridade por proximidade. *(meaning)*
- `pt-BR/g11-c002.md` [12]: “não atiçes as brasas” → “não atices as brasas” — A forma de atiçar diante de e se escreve com c: 'atices'.
- `pt-BR/g11-c003.md` [25]: “quando receberam o Espírito Santo, disseram que estavam cheios de vinho novo” → “quando receberam o Espírito Santo, outros disseram que eles estavam cheios de vinho novo” — 'Dixerunt eos musto madere' distingue os que fizeram a afirmação daqueles que receberam o Espírito; o português permite entender que os próprios discípulos se declararam embriagados. *(meaning)*
- `pt-BR/g12-c002.md` [176]: “a mesma pessoa é mãe e sogra de sua esposa” → “a mãe do homem é também a sogra da esposa dele” — 'Mater' é a mãe do homem, e 'socrus uxoris eius', a sogra da esposa dele. A construção atual atribui os dois vínculos à esposa e deixa o possessivo sem antecedente claro. *(meaning)*
- `pt-BR/g13-c003.md` [37]: “aqueles que ele conheceu de antemão, porque, se lhes fosse pregado, se converteriam” → “aqueles que ele previu que se converteriam se lhes fosse pregado” — O objeto da presciência é a conversão hipotética, como confirma a refutação sobre recompensar o que alguém teria feito. 'Porque' transforma esse conteúdo numa explicação causal separada. *(meaning)*
- `pt-BR/g14-c001.md` [97]: “tinha a esquerda sã, ***e foi restituída como a outra***, a saber, a direita.” → “tinha a esquerda sã, ***e foi restituída como a outra*** a mão direita.” — 'Dextra' é o sujeito de 'restituta est': a direita foi curada, ficando como a esquerda. No português atual, 'a saber, a direita' parece identificar a outra mão, invertendo a referência. *(meaning)*
- Rejected: pt-BR/g11-c004.md [47] — A presença de tambores nas franjas da veste parece historicamente estranha. — A fonte diz 'tympana'; a tradução reproduz a descrição recebida, que não cabe corrigir por conjectura.
- Rejected: pt-BR/g13-c003.md [32] — A citação de Romanos 1:18 traz 'na justiça', em vez de 'na injustiça'. — A fonte fornecida traz 'in iustitia'. Não há evidência suficiente para tratar isso como um erro inequívoco de OCR.

### Part 1 of 8, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of part 1 (17 files): faithful and complete, references and footnotes correct; one minor fix to an ambiguous relative clause in g1-pr [4].
- `pt-BR/g1-pr.md` [4]: “o amor de Deus que nasce na carne” → “o amor do Deus que nasce na carne” — source 'dilectionem Dei in carne nascentis': the participle agrees with Dei, so it is God who is born in the flesh; without the article the relative clause reads as attaching to 'amor'
- Rejected: pt-BR/g12-c001.md [73] — 'mercenarius' rendered 'trabalhador assalariado', not 'mercenário' as the Key Terms row has it — the row covers the shepherd/wolf/hireling distinction (and g12-c002 [86] keeps 'mercenário' there); here the word is the worthy labourer of Lk 10:7, and 'mercenário' would give it a pejorative sense the source does not have
- Rejected: pt-BR/g11-c006.md [31] — 'quaestuarios' rendered 'mercenários' — the sense (workers seeking their own gain) is correct, and the Key Terms row governs 'mercenarius', not this word
- Rejected: pt-BR/g14-c001.md [16], [102] — 'quomodo perderent eum' rendered 'como o levariam à perdição' — 'perdição' also means ruin; in [102] the source pairs it with 'et occiderent' ('e o matariam'), so the reader is not misled; a style choice
- Rejected: pt-BR/g14-c001.md [58] — 'No segundo, afirma que, se alguém viola o sábado por necessidade…' seems to attach the necessity case to the second example — it follows the Latin 'In secundo ponit quod si aliquis…' word for word; the contrast it draws is the source's own
- Rejected: pt-BR/g10-c003.md [52] vs pt-BR/g14-c001.md [22] — 'linum fumigans' rendered 'pavio' in one place and 'linho' in the other — in g14 the commentary reads linum as linen (the priests' linen vestments), so 'linho' is required there; 'pavio' is right in g10

### Part 1 of 8, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos parágrafos [3]–[5] de pt-BR/g1-pr.md: a correção em [4] corresponde ao latim e preserva a frase; nenhum novo defeito encontrado.

### Part 2 of 8, Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Full read of part 2 (g14-c002 to g17-c002): 2 meaning fixes (Genesaré ‘ortus’ = jardim; Ps 106:25 ‘stetit’ = se deteve) and 1 concord fix; all audit flags checked and none is a defect.
- `pt-BR/g16-c002.md` [134]: “cujo nome se interpreta como “nascimento”” → “cujo nome se interpreta como “jardim”” — ‘ortus’ is the medieval spelling of ‘hortus’; Genesareth is traditionally interpreted as ‘hortus principum’. The sentence goes on to say that after the danger they came to refreshment, which fits ‘garden’, not ‘birth’. *(meaning)*
- `pt-BR/g16-c002.md` [128]: “*Falou, e levantou-se um vento de tempestade*” → “*Falou, e o vento da tempestade se deteve*” — Thomas cites ‘dixit, et stetit spiritus procellae’ as proof that the wind ceased. ‘Levantou-se’ makes the proof text say the opposite of the point it supports. *(meaning)*
- `pt-BR/g14-c003.md` [65]: “***desocupada***, isto é, ocioso;” → “***desocupada***, isto é, ociosa;” — The gloss refers to the feminine ‘casa’ (desocupada), so the adjective must agree.
- Rejected: pt-BR/g15-c002.md [10] — The first parable is called an external impediment, while g15-c001 [52]-[53] calls it internal. — The Latin source says ‘ab extrinseco’ and then ‘ab intrinseco’. The translation follows the source, which may not be corrected.
- Rejected: pt-BR/g15-c001.md [167] — ‘livro II, capítulo 23’ of *A Cidade de Deus* does not match the actual location of the passage. — This is the source's own citation. The journal keeps divergent references as received.
- Rejected: pt-BR/g15-c001.md [139] — Simeon is cited as Lucas 2:10, but the episode is in 2:25. — Reproduced from the source (Lc. II, 10). This is not an OCR slip, so it stays.

### Part 2 of 8, Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Leitura integral dos 11 arquivos desta parte, das 11 notas, dos metadados, do diário e dos alertas: duas correções de sentido e uma de concordância pronominal.
- `pt-BR/g15-c003.md` [34]: “***Mas, quando cresce, é maior***, quanto ao efeito, ***que todas***” → “***Mas, quando cresce***, torna-se ***maior que todas***” — O particípio «effectum» completa «est»: «maius est effectum» significa que se tornou maior, não «maior quanto ao efeito». *(meaning)*
- `pt-BR/g17-c001.md` [54]: “e diz que isso não é pecado” → “e não diz que isso é pecado” — O original diz «non dicit hoc esse peccatum»: não reconhece que isso seja pecado. A tradução desloca a negação e introduz uma afirmação expressa de que não é pecado. *(meaning)*
- `pt-BR/g17-c001.md` [56]: “tinham obrigações para com eles” → “tinham obrigações para com ele” — O antecedente expresso em português é «o pai», no singular; «eles» não concorda com esse antecedente.
- Rejected: Auditoria mecânica: seis diferenças de ênfase e g14-c003.md [59] — Possíveis alterações de estrutura ou acréscimos indicados pelos destaques e pela extensão. — Os destaques foram redistribuídos conforme a sintaxe portuguesa ou acrescentados a expressões latinas conservadas. O parágrafo mais longo traduz integralmente o original, sem acréscimo de conteúdo.
- Rejected: pt-BR/g14-c004.md [19] — «Anúncio da penitência deles» parece exigir «anúncio da presença deles». — O texto canônico traz expressamente «denuntiatio poenitentiae eorum». Sem evidência de erro inequívoco de OCR, não cabe corrigir a edição.
- Rejected: pt-BR/g16-c002.md [136] — A construção «não pediam apenas [...] mas somente» parece contraditória. — A mesma dificuldade está no original: «non solum petebant [...] sed eum tantum rogabant». A tradução preserva o texto recebido.

### Part 2 of 8, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of g15-c003 [33]-[35] and g17-c001 [53]-[57]: all three changes are correct against the Latin, the neighbouring text is intact, and there are no new defects.
- Rejected: pt-BR/g15-c003.md [34] — Audit flag: the translation has more emphasis markers than the source (50 vs 44). — The Latin lemmas are split differently to follow Portuguese word order («***um homem***… ***semeou***», «torna-se ***maior que todas***»). No lemma is dropped or added.
- Rejected: pt-BR/g17-c001.md [55] — «Por acaso te será proveitosa?» and «por acaso te será proveitoso?» differ in gender. — The first agrees with the Gospel's «a oferta»; the second, inside the paraphrased speech, agrees with «algo». Each is correct in its own sentence.
- Rejected: pt-BR/g17-c001.md [57] — Tenses mixed in «quem assim falasse e fosse assim instruído não honra seu pai». — This follows the Latin «qui sic diceret, et qui sic instructus est, non honorificat».
- Rejected: pt-BR/g15-c003.md [35] — In «assim ele se torna uma árvore», «ele» does not agree with «doutrina». — The subject of «fit arbor» is open in the Latin. Reading it as the grain or Christ, the subject of the whole paragraph, is defensible.

### Part 3 of 8, Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of g17-c003 to g21-c001 (11 files, including g2-pr): one wrong reference (Esdras), one ambiguous relative clause, one Bible quotation with added wording, and one TOC title mismatch in book.json; audit flags checked and justified.
- `pt-BR/g21-c001.md` [65]: “por isso, 2 Esdras 4:” → “por isso, Esdras 2:4:” — Source 'Esdrae II, 4' follows the book-chapter-verse convention used throughout (Esdras, chapter 2, verse 4); the translation read II as a book number and 4 as the chapter. *(meaning)*
- `pt-BR/g19-c002.md` [57]: “que curou o filho desse homem que o difamava, assim como aos seus discípulos” → “que curou o filho desse homem que difamava a ele e aos seus discípulos” — Source 'qui sibi et discipulis detrahebat': the man disparaged both Christ and the disciples. The current wording can be read as Christ curing the disciples too.
- `pt-BR/g21-c001.md` [69]: “*A multidão dos que criam tinha um só coração e uma só alma*” → “*Os que criam tinham um só coração e uma só alma*” — Source quotes 'erat autem credentium cor unum et anima una' without 'multitudinis'; the translation added 'A multidão' from the familiar Bible wording.
- `book.json`: “Lição 2 — A parábola da ovelha” → “Lição 2 — A parábola das ovelhas” — The Latin heading 'Parabolum ovium' is plural, and the file heading reads 'A parábola das ovelhas'; the TOC title disagrees with it.
- Rejected: pt-BR/g17-c003.md [25], g18-c002.md [46], g21-c001.md [107] — audit: more emphasis markers in pt-BR — These are italics added to retained Latin words (*debilis*, *Bar*, *Ionas*, *Ex parte*, *Significavit*), which the house rules call for.
- Rejected: pt-BR/g18-c003.md [64], g20-c003.md [35], g2-pr.md [23] — audit: fewer emphasis markers in pt-BR — Adjacent lemma spans were merged where Portuguese word order joins them (e.g. 'salvam facere' inside 'Quem quiser salvar a sua alma'); no lemma text is lost.
- Rejected: pt-BR/g20-c002.md [34] — audit: length outlier (167%) — The Latin participles 'perpetratum/perpetrando' need periphrasis ('pecado já cometido' / 'que está para ser cometido'); nothing is added.
- Rejected: pt-BR/g21-c001.md [129] — 'paucos' rendered 'os poucos', possibly an OCR slip for 'parvos' — Plausible, but not an unmistakable slip, so the source and its literal rendering stay.
- Rejected: pt-BR/g20-c002.md, g20-c003.md, g21-c001.md — 'Salmo' here vs 'Salmos' in other files — Both are valid Portuguese, and each file is consistent within itself.

### Part 3 of 8, Round 2 (codex, full read)
Verdict: 1 meaning-level, 2 minor. Leitura integral dos 11 arquivos, notas, metadados e alertas: um desvio de sentido e uma nota redundante, removida em duas operações.
- `pt-BR/g20-c002.md` [73]: “pelo cem, que se obtém multiplicando dez” → “pelo cem, que é multiplicado por dez” — O latim diz que o número cem é multiplicado por dez, não que seja obtido multiplicando dez. A tradução não deve corrigir a exposição numérica da fonte. *(meaning)*
- `pt-BR/g21-c001.md` [183]: “etc.[^34]” → “etc.” — Retira o marcador da nota redundante, cuja definição também é removida.
- `pt-BR/g21-c001.md`: “[^34]: *Nota do tradutor:* “Estado de perfeição” designa aqui uma condição estável de vida assumida com compromisso solene. Tomás distingue essa condição da perfeição efetiva da caridade, que uma pessoa pode possuir sem pertencer a tal estado.” → “” — A nota apenas repete a distinção explicitada nos nn. 1593 e 1596 e comenta seu conteúdo doutrinal; as regras determinam remover notas desse tipo.
- Rejected: pt-BR/g19-c002.md [119] — Possível erro no valor do estáter em didracmas. — A própria fonte apresenta a formulação irregular 'didrachma valebat, et duplex'. Não há base segura para substituir o valor pelo equivalente monetário habitual.
- Rejected: pt-BR/g20-c002.md [71] — A interpretação por adição dá setenta vezes, em vez de setenta e sete. — O latim recebido diz expressamente 'septuaginta vicibus'; a tradução preserva o número da fonte.

### Part 3 of 8, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of g20-c002 [72–73] and g21-c001 [182–184] with notes: the three round-2 changes are correct and the shown paragraphs have no defects.
- Rejected: pt-BR/g20-c002.md [73] — Check of the round-2 change “que é multiplicado por dez” — It matches 'qui multiplicatur per denarium' literally, and the sentence still agrees in number and case with the clause before it.
- Rejected: pt-BR/g21-c001.md [183] — Removal of note [^34] and its marker — The note restated the distinction drawn in the text and commented on doctrine. Marker and definition were both removed, so no dangling reference is left; a gap in note numbering is not a defect.
- Rejected: pt-BR/g21-c001.md [184] — 'lege, et perfice' rendered 'Ensina e aperfeiçoa' — In the scholastic sense 'legere' means to lecture, so 'Ensina' is correct in context.

### Part 4 of 8, Round 1 (claude, full read)
Verdict: 3 meaning-level, 3 minor. Full read of g22-c001 to g26-c002: fixed a mistranslation of capere, the ambiguous 'homens' (should be 'varões'), an ambiguous object, and removed translator's note [^43], which misreads the text; the audit flags are not defects.
- `pt-BR/g24-c002.md` [53]: “mas não puderam apanhá-lo e se retiraram” → “mas não puderam compreendê-la e se retiraram” — source: 'sed non potuerunt capere' after 'sapientia sua visa'; capere means grasping his wisdom, as the following Ps 138:6 ('non potero ad eam') shows, not catching him *(meaning)*
- `pt-BR/g24-c003.md` [43]: “mas somente os homens” → “mas somente os varões” — source 'sed solum homines' means only males (the argument turns on sex); 'homens' reads as 'human beings' *(meaning)*
- `pt-BR/g24-c003.md` [43]: “não se conserva apenas no homem” → “não se conserva apenas no varão” — source 'sexus autem non salvatur in homine solum': the male alone; 'homem' is ambiguous here *(meaning)*
- `pt-BR/g23-c002.md` [101]: “***Fará perecer miseravelmente esses maus e sua vinha***” → “***Fará perecer miseravelmente esses maus, e sua vinha***” — source 'et vineam suam ... locabit': vineam is the object of locabit; without a comma it reads as an object of 'fará perecer'
- `pt-BR/g25-c002.md` [79]: “Quem coa engole com dificuldade.[^43]” → “Quem coa engole com dificuldade.” — the translator's note is removed (see the next fix), so its marker goes too
- `pt-BR/g25-c002.md`: “[^43]: *Nota do tradutor:* O verbo latino *excolare* significa “coar, filtrar”. Conserva-se a explicação do comentário sobre a dificuldade de engolir, embora ela não corresponda ao sentido habitual do verbo.” → “” — the note treats 'Qui excolat, cum difficultate transglutit' as a definition of the verb; it is an observation; the rest only restates the text
- Rejected: audit: g23-c001 [61], [77], [90]; g24-c004 [44] — more emphasis markers than the source — italics added for retained Latin words (asinus, anna, coliba, mens/metiri); allowed by the house rules
- Rejected: audit: g25-c002 [75] — fewer emphasis markers than the source — the source's two spans 'et illa' and 'non omittere' are merged into one span 'e não omitir aquelas' because of Portuguese word order; nothing is lost
- Rejected: pt-BR/g23-c001.md [58], pt-BR/g26-c001.md [68] — 'Marcos, último capítulo, 15' while other places give 'Marcos 16:20' — an accurate rendering of 'Mc. ult.'; a style difference, not an error
- Rejected: pt-BR/g24-c003.md note [^41] — 'neutro-passivo' glossed as a verb with active form and passive meaning — matches medieval grammatical usage (verbs such as vapulo, veneo, nubo); no factual error
- Rejected: pt-BR/g22-c001.md [80] — 'ista numeratio' rendered as 'essa murmuração' — an evident slip in the source for 'murmuratio'; the context requires it
- Rejected: multiple files — wrong Scripture references (Mateus 2:7, Isaías 3:34, Mateus 28:34, etc.) — the source's own readings, kept as the journal states

### Part 4 of 8, Round 2 (codex, full read)
Verdict: 7 meaning-level, 5 minor. Leitura integral dos 13 arquivos, com notas, metadados, journal e auditoria: propostas 7 correções de sentido e 5 menores; os cinco alertas mecânicos não são defeitos.
- `pt-BR/g22-c002.md` [81]: “livre é aquele que existe por si mesmo” → “livre é aquele que existe em função de si mesmo” — A oposição entre 'causa sui' e 'causa alterius' diz respeito à finalidade: existir para si ou para outro, não à independência da existência. *(meaning)*
- `pt-BR/g22-c002.md` [82]: “mas ***exercem poder sobre eles***” → “mas ***exerçam poder sobre eles***” — A coordenação está subordinada a 'é costume que' e deve manter o subjuntivo já empregado em 'não o usem'.
- `pt-BR/g22-c002.md` [88]: “aquele que é recebido por um preço” → “aquele que é recebido como preço” — 'Accipitur in pretium' significa recebido como preço, como confirma a sequência 'ipse fecit se pretium'; não significa comprado por um preço. *(meaning)*
- `pt-BR/g23-c001.md` [61]: “nem nós nem nossos pais puderam carregar” → “nem nós nem nossos pais pudemos carregar” — O sujeito composto que inclui 'nós' exige a primeira pessoa do plural.
- `pt-BR/g24-c001.md` [53]: “Aqueles que os homens não podiam honrar publicamente por estarem distantes, trazendo de longe sua figura, fizeram” → “Como não podiam honrar publicamente aqueles que estavam distantes, os homens, depois de trazida de longe a figura deles, fizeram” — No latim, os homens fazem a imagem dos ausentes. A construção portuguesa torna 'aqueles' o sujeito de 'fizeram', invertendo os agentes. *(meaning)*
- `pt-BR/g24-c004.md` [44]: “nas palavras e nas meditações.[^42]” → “nas palavras e nas meditações.” — Remove o marcador da nota que apenas repete o conteúdo do parágrafo.
- `pt-BR/g24-c004.md`: “[^42]: *Nota do tradutor:* A associação entre *mens*, “mente”, e *metiri*, “medir”, pertence à explicação etimológica adotada pelo comentário e fundamenta aqui a distinção entre o pensamento e sua expressão.” → “” — A associação etimológica e sua função já estão explicitadas no parágrafo; a nota apenas as repete, contrariando a regra sobre notas redundantes.
- `pt-BR/g25-c002.md` [6]: “Quem jurar pelo templo, nada é” → “Quem jurar pelo templo não fica obrigado” — 'Nihil est' nega a obrigação decorrente do juramento, não diz que a pessoa nada é; a explicação em [50] confirma 'nihil debebat'. *(meaning)*
- `pt-BR/g25-c002.md` [8]: “quem jurar pelo altar, nada é” → “quem jurar pelo altar não fica obrigado” — 'Nihil est' se refere à ausência de obrigação pelo juramento, em oposição a 'debet', e não à pessoa. *(meaning)*
- `pt-BR/g25-c002.md` [56]: “Quem jurar pelo templo de Deus, nada é” → “Quem jurar pelo templo de Deus não fica obrigado” — A afirmação trata da obrigação atribuída ao juramento; 'nada é' fica indevidamente predicado de quem jura. *(meaning)*
- `pt-BR/g25-c002.md` [58]: “quem jurar pelo altar, nada é” → “quem jurar pelo altar não fica obrigado” — Repete-se a oposição entre um juramento que não obriga e outro que obriga; não se afirma que quem jura nada é. *(meaning)*
- `pt-BR/g26-c001.md` [63]: “era costume que, quando aconteciam males, diziam” → “era costume que, quando aconteciam males, dissessem” — A oração subordinada a 'era costume que' exige aqui o subjuntivo.
- Rejected: Auditoria: g23-c001.md [61], [77], [90]; g24-c004.md [44] — Marcadores de ênfase adicionais. — Correspondem aos itálicos dos termos latinos conservados, permitidos pelas regras.
- Rejected: Auditoria: g25-c002.md [75] — Menos marcadores de ênfase que no latim. — A ordem portuguesa reúne 'et illa' e 'non omittere' em 'e não omitir aquelas', sem perda de conteúdo ou destaque.
- Rejected: pt-BR/g25-c003.md [36] — Acrescentar 'não' antes de 'impediu' para resolver a aparente contradição. — O latim recebido também traz 'impedivit'; inserir essa negação seria uma correção conjectural do autor ou da edição.

### Part 4 of 8, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of g22-c001 to g26-c002 with footnotes, audit flags, journal and book.json: no new objective defects; the audit flags and the round 1–2 fixes are correct.
- Rejected: pt-BR/g22-c001.md [46], pt-BR/g23-c001.md [97], pt-BR/g24-c003.md [42] — '1 Reis 26:23', '3 Reis 8:27', '2 Reis 14:17' look like wrong book numbers — Vulgate numbering of the source's I/II/III Reg., applied consistently; not an error
- Rejected: pt-BR/g23-c001.md [66] — 'que estava sujeito ao monte Sião' for 'quae subiecta erat monti Sion' may mean 'lying below' — 'subject to Mount Sion' (the royal seat) is also a valid reading of subiecta; defensible
- Rejected: pt-BR/g23-c002.md [106] — 'Jesus lhe disse' singular where the verse has 'Dicit illis' — the commentary's lemma reads 'Dicit illi'; the translation follows the source
- Rejected: pt-BR/g25-c001.md [6], [44] — 'obras pesadas' in the verse but 'fardos' and 'movê-los' in the commentary — the verse's source reads 'opera', the commentary 'onera'; each rendering follows its own source
- Rejected: pt-BR/g22-c001.md [^35], pt-BR/g26-c002.md [^45] — translator's notes possibly redundant or misplaced — both state accurate facts (the double stola of soul and body; Flavius Josephus, The Jewish War) not given in the text; a marker at the end of the paragraph is acceptable
- Rejected: pt-BR/translation-journal.md Key Terms — rows and decisions refer to nn. 661–679 and note [^95], outside this part — they belong to another part of the book; outside the scope of this review

### Part 5 of 8, Round 1 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of g26-c003 to g28-c005 (10 files): one verb-form misspelling and one wrong chapter in a John reference; audit flags checked and not defects.
- `pt-BR/g26-c003.md` [139]: “e nutristeis vossos corações” → “e nutristes vossos corações” — Latin enutristis; the 2nd person plural perfect of nutrir is 'nutristes', and 'nutristeis' does not exist
- `pt-BR/g27-c002.md` [53]: “*Recebei o Espírito Santo*, João 21:22” → “*Recebei o Espírito Santo*, João 20:22” — source 'Io. ult., 22'; the quoted 'accipite Spiritum Sanctum' is John 20:22, while John 21:22 says something else. The same file family resolves 'Io. ult.' as chapter 20 (g28-c005 [93], João 20:17) *(meaning)*
- Rejected: pt-BR/g28-c005.md [33] — audit flag: repeated word 'dormem dormem' — renders 1 Thessalonians 5:7 'qui dormiunt, in nocte dormiunt' (the sleepers sleep at night); the repetition is grammatical and is the source's own
- Rejected: pt-BR/g28-c005.md [27] — audit flag: space before punctuation in 'Então diz: . . . todos' — the spaced ellipsis reproduces the source's own elision mark
- Rejected: g26-c003 [66], g27-c002 [85] [127], g28-c001 [34] [64], g28-c002 [60], g28-c004 [40] — audit flag: emphasis marker counts differ — the differences come from italics added to retained Hebrew, Greek and Latin words (anathe, argireon, pascendo, pistis, paropsis) or from a bold-italic span split in two; the markup is valid
- Rejected: pt-BR/g26-c003.md [131] — 'Marcos 13:26' for 'nec etiam Filius hominis' (actually Mark 13:32) — the source reads 'Marcus XIII, 26'; received references are kept as given
- Rejected: pt-BR/g27-c003.md [31] — 'por três motivos' is followed by four reasons — the source says 'propter tria' and then lists four; the translation follows it

### Part 5 of 8, Round 2 (codex, full read)
Verdict: 2 meaning-level, 4 minor. Leitura integral dos 984 parágrafos dos dez arquivos, das notas, do audit e dos metadados: duas correções de sentido e remoção de duas notas redundantes com seus marcadores.
- `pt-BR/g26-c004.md` [41]: “pelo auxílio temporal, que se encontra por último;” → “pelo auxílio temporal, como se lê no último capítulo de João;” — “Habetur ultimo” remete ao último capítulo, onde se encontra a ordem de apascentar; não afirma que o auxílio temporal se encontra por último. *(meaning)*
- `pt-BR/g28-c001.md` [39]: “isso não se refere ao dia imediatamente anterior, e sim àquele período” → “isso não se refere àquele mesmo dia, e sim àquele período” — “Non ad diem immediatum refertur” distingue o dia acabado de mencionar do período mais amplo; não introduz um dia anterior. *(meaning)*
- `pt-BR/g27-c003.md` [41]: “porque são um só no pecado.[^49]” → “porque são um só no pecado.” — Retira o marcador da nota redundante, cuja explicação já está no parágrafo.
- `pt-BR/g27-c003.md`: “[^49]: *Nota do tradutor:* “Veste da alma” e “veste do corpo” traduzem *stola animae* e *stola corporis*: a imagem distingue a glória recebida pela alma após a morte e a glorificação do corpo na ressurreição.” → “” — A nota apenas repete a distinção e os momentos de recepção já explicados no texto; deve ser removida conforme a regra das notas.
- `pt-BR/g28-c005.md` [80]: “conforme ele quis.[^54]” → “conforme ele quis.” — Retira o marcador da nota que repete a explicação do parágrafo e acrescenta um comentário doutrinal.
- `pt-BR/g28-c005.md`: “[^54]: *Nota do tradutor:* “Propaixão” designa aqui um movimento afetivo que permanece nas potências inferiores da alma, sem alterar o governo da razão; a distinção não nega a realidade da tristeza de Cristo.” → “” — A definição repete a explicação extensa do parágrafo; a ressalva final comenta a doutrina. A regra determina remover notas dessa natureza.
- Rejected: Alertas mecânicos dos dez arquivos — Diferenças de ênfase, espaço nas reticências e repetição de “dormem”. — Os destaques adicionais marcam termos retidos ou separam segmentos válidos; as reticências e a repetição correspondem ao latim. Confirmadas as rejeições da rodada anterior.
- Rejected: pt-BR/g28-c002.md, nota [^52] — Possível nota redundante sobre paropsis. — A expressão latina “paria latera” permite perceber a associação verbal que se perderia com apenas “lados iguais”; a nota tem função linguística.

### Part 5 of 8, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura delta da parte 5: as seis correções da rodada 2 (duas de sentido, quatro remoções de notas) estão corretas, e os parágrafos vizinhos estão limpos.
- Rejected: pt-BR/g26-c004.md [41] — “como se lê no último capítulo de João” acrescenta “de João” a “habetur ultimo” — A ordem tríplice “pasce” dirigida a Pedro está em João 21, o último capítulo; a explicitação fica dentro da referência abreviada da fonte e não muda o sentido.
- Rejected: pt-BR/g28-c001.md [39] — “João 11:13” para uma passagem que corresponde a João 11:53 — A fonte traz “Io. XI, 13”; as referências recebidas são mantidas como estão.
- Rejected: pt-BR/g28-c005.md [81] — “então será glorificada” atribui o verbo à alma, não ao corpo — O sujeito de “glorificabitur” é ambíguo no latim; “anima mea” é o sujeito mais próximo, então a escolha é defensável.
- Rejected: pt-BR/g27-c003.md e pt-BR/g28-c005.md, notas removidas [^49] e [^54] — Verificar se os marcadores ficaram sem definição ou se sobrou definição órfã — Os dois marcadores e as duas definições foram retirados juntos; as notas que restam ([^50] e as demais) continuam com par marcador–definição.

### Part 6 of 8, Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Read g28-c006 to g30-c001 in full: fixed a wrong John reference (20:17), an ambiguous question in g28-c006 [39] and the second gloss of attollens in g3-c003 [28]; the audit flags are false positives.
- `pt-BR/g29-c002.md` [153]: “pois se diz dele em João 21:17:” → “pois se diz dele em João 20:17:” — Source has 'Io. ult., 17' and quotes 'ascendo ad Patrem meum…', which is John 20:17. Expanding 'ult.' to chapter 21 points to a different verse. *(meaning)*
- `pt-BR/g28-c006.md` [39]: “não foi imediatamente até ele, e primeiro o saudou?” → “não foi imediatamente até ele, mas primeiro o saudou?” — Source: 'quare non venit statim ad eum, sed primo salutavit?'. With 'e', the negation can cover the greeting too and reverse the sense; 'sed' is adversative. *(meaning)*
- `pt-BR/g3-c003.md` [28]: “Ou “aquele que se eleva”, porque tirou os pecados do mundo.” → “Ou “aquele que levanta”, porque tirou os pecados do mundo.” — In this second sense *attollens* is transitive (lifting, taking away), which matches the footnote's own gloss 'aquele que eleva'. The reflexive 'se eleva' does not fit 'tirou os pecados'.
- Rejected: audit: emphasis markers (g29-c001 [123], g29-c002 [82], [84], g3-c004 [50], g30-c001 [92]) — Emphasis counts differ from the source — The differences come from italics added to retained Latin or Greek words (*pro*, *villa*, *pagos*, *cranios*, *de quo*, *Avete*), which the house format requires.
- Rejected: audit: space before punctuation (g3-c004 [75], g3-c006 [15]) — '. . .' preceded by a space — This is the source's own ellipsis inside a lemma, reproduced as written.
- Rejected: audit: repeated word (g3-c004 [113]) — 'do que que' — Grammatical Portuguese: 'do que' plus the conjunction 'que'.
- Rejected: pt-BR/g3-c003.md [33] — 'Ocozias gerou Jorão. Joás gerou Amasias' breaks the chain — The source itself reads 'genuit Ioram. Ioras autem genuit'. Harmonizing the names would correct the edition.
- Rejected: pt-BR/g30-c001.md [94] — 'Io. ult., 12' rendered as João 21:12 for 'noli me tangere' — The source's verse number is wrong whichever chapter is meant (the quote is 20:17). No faithful rendering gives a correct reference, so it is left as received.
- Rejected: pt-BR/g29-c001.md [^56], [^57] — Translator's notes may only restate the text — They explain a legal term and a Latin preposition usage that a reader may not know. The content is accurate, so they are not removed.

### Part 6 of 8, Round 2 (codex, full read)
Verdict: 1 meaning-level, 1 minor. Lidos integralmente os 1.125 parágrafos dos 11 arquivos, suas notas, os metadados e o diário; encontrados um defeito de sentido e um menor.
- `pt-BR/g29-c001.md` [126]: “não se encontre entre ti quem observe” → “não se encontre em teu meio quem observe” — O latim diz 'in te'; 'entre ti' é inadequado nessa construção em português.
- `pt-BR/g30-c001.md` [75]: “também foi a primeira a falar com um anjo bom” → “também uma mulher foi a primeira a falar com um anjo bom” — A comparação contrapõe Eva às mulheres da ressurreição. O sujeito elíptico em português atribui também a Eva o diálogo com o anjo bom. *(meaning)*
- Rejected: pt-BR/g3-c002.md [40] — O pronome 'estas' poderia restringir a referência às virtudes. — Pode retomar corretamente os dois substantivos femininos coordenados: 'a destruição' e 'a origem'.
- Rejected: pt-BR/g3-c004.md [63] — 'Septuagies septies' traduzido como 'setenta e sete vezes'. — O próprio comentário relaciona a expressão às setenta e sete gerações e explicita sete vezes onze; a tradução acompanha essa interpretação.

### Part 6 of 8, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of part 6: both fixes from round 2 (g29-c001 [126], g30-c001 [75]) are correct; the shown paragraphs, the notes and the audit flags have no defects.
- Rejected: pt-BR/g29-c001.md [126] — Check of the change 'em teu meio' for 'in te' (Dt 18:10) — Correct and idiomatic. The sentence and its neighbours still read correctly.
- Rejected: pt-BR/g30-c001.md [75] — Check of the change 'também uma mulher foi a primeira a falar com um anjo bom' — It keeps the Latin contrast (Eva/diabo × a mulher da ressurreição/anjo bom) without giving the second clause to Eva. Grammar and concord are correct.
- Rejected: pt-BR/g29-c001.md [125] — '“profeta” é empregado para ambos os casos' looks odd; the context calls for 'visum' — The canonical Latin reads 'ponitur propheta pro utroque'. This is not an unmistakable OCR slip, and correcting it would amend the edition.
- Rejected: pt-BR/g29-c001.md [126] — Jó 33:15 'dos vivos' where the Vulgate has 'virorum' — The source reads 'vivorum', and the translation follows it.
- Rejected: pt-BR/g29-c001.md [127] — The 'porque visava impedir a paixão' clause could justify both hypotheses (anjos bons / diabo) — The Portuguese keeps the Latin's own punctuation and ambiguity. It does not commit to a different reading.
- Rejected: audit: g29-c001 [123], g30-c001 [92] — Emphasis counts differ from the source — Already rejected in round 1: italics added to retained Latin words, as the house format requires. No new argument.

### Part 7 of 8, Round 1 (claude, full read)
Verdict: 5 meaning-level, 1 minor. Read g4-c001 to g7-c003 in full: fixed “Belém da Judeia” for *Iudae* (3 places), a collapsed list of three groups, a reversed *sensum ex sensu*, and the repeated “isso isso”.
- `pt-BR/g4-c002.md` [5]: “Eles lhe disseram: em Belém da Judeia.” → “Eles lhe disseram: em Belém de Judá.” — source reads *in Bethlehem Iudae*; the commentary (g4-c001 [20]) stresses it is *Iudae* (de Judá), not *Iudaeae* (da Judeia) *(meaning)*
- `pt-BR/g4-c002.md` [14]: “***Eles lhe disseram: em Belém da Judeia***” → “***Eles lhe disseram: em Belém de Judá***” — source *in Bethlehem Iudae*; same name error as the verse *(meaning)*
- `pt-BR/g4-c002.md` [27]: “***Eles disseram: em Belém da Judeia***” → “***Eles disseram: em Belém de Judá***” — source *in Bethlehem Iudae*; same name error as the verse *(meaning)*
- `pt-BR/g4-c002.md` [23]: “Por isso reuniu muitos, que tinham autoridade e eram sábios.” → “Por isso reuniu muitos, os que tinham autoridade e os sábios.” — source *congregavit multos, et auctoritatem habentes, et sapientes* lists three groups matching the three criteria (multitude, authority, learning); the PT merged them into one *(meaning)*
- `pt-BR/g4-c004.md` [72]: “às vezes exprimindo um sentido por outro em nosso uso” → “às vezes sentido por sentido, como em nosso uso” — *sensum ex sensu* means rendering sense for sense; “um sentido por outro” says the opposite (substituting a different sense) *(meaning)*
- `pt-BR/g4-c003.md` [28]: “Por isso isso é repreendido” → “Por isso, isto é repreendido” — repeated word flagged by the audit
- Rejected: pt-BR/g4-c001.md [43], g5-c001.md [81], g6-c001.md [117], [124], g7-c002.md [67], [86], g7-c003.md [14] — emphasis-marker count differs from source — translation italicizes retained Latin/Greek words (*fatum*, *Phares*, *satan*, *latria*, *dulia*, *sophi*, *templum*, *laetitia*) per house rules
- Rejected: pt-BR/g5-c001.md [121] — two bold-italic spans in source merged into one — Portuguese word order joins *securis* and *ad radicem ponitur* into one phrase; no content lost
- Rejected: pt-BR/g4-c001.md [20], g4-c004.md [46], g6-c001.md [81], [118] — references that do not match the modern Bible (Josué 9:10, Romanos 2:25, Isaías 41:23, Deuteronômio 6:16) — faithful to the source's references; not corrected by house rule
- Rejected: pt-BR/g7-c003.md footnote [^80] — *latitia* is not an attested Latin word — the note presents it as the text's own wordplay; the gloss conveys the intended association with breadth

### Part 7 of 8, Round 2 (codex, full read)
Verdict: 5 meaning-level, 1 minor. Leitura integral dos 892 parágrafos dos 12 arquivos, das notas, dos metadados e da auditoria: cinco defeitos de sentido e um deslize gramatical.
- `pt-BR/g4-c004.md` [71]: “não querendo ser consolada por eles” → “não querendo ser consolada a respeito deles” — Super eis indica o assunto da consolação, não os filhos como agentes que a consolam. *(meaning)*
- `pt-BR/g4-c004.md` [72]: “não querendo ser consolada por eles” → “não querendo ser consolada a respeito deles” — Super eis significa a respeito deles; a tradução apresenta os filhos como agentes da consolação. *(meaning)*
- `pt-BR/g4-c004.md` [94]: “quis receber anúncios por meio dos anjos” → “quis ser anunciado por meio dos anjos” — Voluit per angelos nuntiari emprega o infinitivo passivo: Cristo quis ser anunciado, não receber anúncios. *(meaning)*
- `pt-BR/g5-c001.md` [75]: “reconhece ter estado sujeito a Satanás” → “reconhece estar sujeito a Satanás” — Profitetur se esse satanae obligatum declara uma condição presente; ter estado a desloca para o passado. *(meaning)*
- `pt-BR/g6-c002.md` [50]: “ninguém se julgue indigno de pregar” → “ninguém julgue abaixo de sua dignidade pregar” — Dedignetur significa desdenhar por considerar indigno de si. A tradução inverte o sentido, apresentando sentimento de indignidade pessoal. *(meaning)*
- `pt-BR/g7-c003.md` [13]: “não se deve alegrar-se pelas tribulações” → “não se deve alegrar pelas tribulações” — O pronome reflexivo está duplicado na locução verbal.
- Rejected: Auditoria mecânica: oito alertas de ênfase — Diferenças na quantidade de marcadores de destaque. — Confirmadas as justificativas da rodada anterior: itálico nos termos latinos ou gregos conservados e reunião dos dois destaques em g5-c001.md [121], sem perda de conteúdo.
- Rejected: pt-BR/g4-c003.md [33] — Inclusão do sentido alegórico sob o literal na enumeração dos três sentidos. — A relação já está no latim: litteralis, sub quo comprehenditur allegoricus. Não cabe corrigir a classificação do texto-fonte.

### Part 7 of 8, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Read all 12 files of part 7 (g4-c001 to g7-c003) in full, source against translation, with their notes; the earlier fixes hold, and no new defects were found.
- Rejected: pt-BR/g5-c001.md [70] — *rationem* is rendered “lei” in the Job 38:33 quotation but “ordem” in Thomas's comment that follows, which weakens the verbal echo — Both renderings are defensible and the argument is still clear to the reader; this is a style choice, not an objective defect.
- Rejected: pt-BR/g4-c004.md [76] — *ex multitudine doloris* rendered “pela intensidade da dor” instead of a literal “multidão” — The paragraph's own gloss (*ploratus et ululatus multus*) concerns the amount of the grief; the rendering keeps the sense.
- Rejected: pt-BR/g4-c002.md [9] and other g4 files — “Magos” is capitalized in some places and lowercase in others — The house rule says not to normalize capitalization; the variation causes no ambiguity.
- Rejected: audit: g4-c001 [43], g5-c001 [81], [121], g6-c001 [117], [124], g7-c002 [67], [86], g7-c003 [14] — The count of emphasis markers differs from the source — Rounds 1 and 2 already confirmed the cause: italicized retained Latin or Greek terms, and in g5-c001 [121] two spans merged by Portuguese word order. No content is lost.

### Part 8 of 8, Round 1 (claude, full read)
Verdict: 5 meaning-level, 1 minor. Read all 16 files (g7-c004 to g9-c002) clause by clause: fixed three 1 John references given as John, a reversed objection in n. 515, an ambiguous “dispensa”, and an inverted command in n. 630; the mechanical emphasis flags are retained-Latin italics or source formatting and need no change.
- `pt-BR/g7-c006.md` [14]: “como se fosse do diabo; João 3:” → “como se fosse do diabo; 1 João 3:” — “In hoc apparet Filius Dei” (to destroy the works of the devil) is 1 John 3:8; the source abbreviation “Ioh.” covers both books, and the translator renders “Ioh.” as 1 João elsewhere (g8-c003 [10], [53]) *(meaning)*
- `pt-BR/g7-c007.md` [38]: “João 2: *Quem odeia” → “1 João 2: *Quem odeia” — “qui odit fratrem suum in tenebris est” is 1 John 2:11, not the Gospel of John *(meaning)*
- `pt-BR/g7-c007.md` [60]: “João: *Se teu irmão” → “1 João: *Se teu irmão” — “si fratrem tuum quem vides” is 1 John 4:20, not the Gospel of John *(meaning)*
- `pt-BR/g7-c009.md` [20]: “E parece que sim, porque” → “E parece que não, porque” — the source objection “videtur quia non est malum pro malo reddendum” argues that dismissal is NOT licit; the translation reverses it *(meaning)*
- `pt-BR/g7-c009.md` [20]: “a dispensa da mulher que fornica” → “o repúdio da mulher que fornica” — “dimissio uxoris” is dismissal; “dispensa” was used in g7-c009 [16] for dispensatio and misleads here
- `pt-BR/g8-c005.md` [73]: “De igual modo, não busques primeiro o Reino de Deus: invertes a ordem.” → “De igual modo, se não buscas primeiro o Reino de Deus, invertes a ordem.” — “non primo quaeras regnum Dei: pervertis ordinem” states a condition; rendered as an imperative it tells the reader not to seek the Kingdom first, against the whole paragraph *(meaning)*
- Rejected: pt-BR/g7-c008.md [14] — “João 21: Fiz um pacto com meus olhos” is Job 31:1 — the source reads “Io. XXI”, a divergent reference; the chapter would stay wrong even if the book were changed, and the journal conserves divergent received references
- Rejected: pt-BR/g8-c003.md [14]; [59] — “Êxodo 9:9: Deus abandona” is Ezekiel 9:9; “Salmos 51:12: Quem és tu, para que temas?” is Isaiah 51:12 — the source reads “Ex.” and “Ps.” unambiguously; under the journal decision these divergent references are conserved
- Rejected: pt-BR/g7-c004.md [18] — singular “cognoscebatur” rendered as plural “mal fossem conhecidos” — the subject is open in the Latin, and referring it to the apostles fits the context of “vos estis lux mundi”

### Part 8 of 8, Round 2 (codex, full read)
Verdict: 4 meaning-level, 5 minor. Leitura integral dos 16 arquivos, notas, metadados e journal, com exame dos 21 alertas: quatro defeitos de sentido e cinco correções menores, incluindo a remoção de uma nota redundante.
- `pt-BR/g7-c009.md` [20]: “o repúdio da mulher que fornica foi instituída” → “o repúdio da mulher que fornica foi instituído” — O particípio deve concordar com «repúdio», masculino.
- `pt-BR/g7-c012.md` [29]: “não se chama pecado para a morte porque alguns não se arrependam” → “não se chama pecado para a morte no sentido de excluir que alguns se arrependam” — «Non dicitur ... quin aliqui paeniteant» admite que alguns se arrependam; a tradução desloca a negação para o arrependimento dessas pessoas. *(meaning)*
- `pt-BR/g8-c001.md` [8]: “que não se devem praticá-las por causa das riquezas” → “que não devem ser praticadas por causa das riquezas” — A construção mistura a passiva com «se» e o objeto direto «-las».
- `pt-BR/g8-c001.md` [25]: “pois era uma pessoa e parecia outra.[^89]” → “pois era uma pessoa e parecia outra.” — Retirada do marcador da nota que apenas repete a explicação do parágrafo.
- `pt-BR/g8-c001.md`: “[^89]: *Nota do tradutor:* Conservam-se as formas *hypo* e *crisyo* e a explicação etimológica tal como aparecem no texto. A exposição associa o hipócrita à diferença entre a pessoa do ator e a personagem que ele apresenta.” → “” — A nota apenas informa que reproduz a fonte e parafraseia a explicação já traduzida; deve ser removida pela regra das notas.
- `pt-BR/g8-c003.md` [51]: “deves ocupá-lo, mas não daquele” → “deves ocupar-te dele, mas não daquele” — O sentido exige «ocupar-se de»; a construção atual emprega indevidamente «ocupar» como transitivo direto.
- `pt-BR/g8-c004.md` [21]: “porque Cristo não precisa ser lavado; assim também nossa consciência.” → “porque Cristo não precisa ser lavado; nossa consciência, sim.” — «Sic conscientia nostra» afirma a necessidade de lavar a consciência, já identificada com o rosto. A tradução estende a ela a negação referente a Cristo. *(meaning)*
- `pt-BR/g8-c005.md` [24]: “pela luxúria de quem os possui” → “pela dissipação de quem os possui” — «Luxuria possidentis» designa aqui o esbanjamento que consome os bens, na divisão entre deterioração, consumo pelo proprietário e roubo; «luxúria» restringe indevidamente o sentido ao vício sexual. *(meaning)*
- `pt-BR/g8-c005.md` [35]: “que o corpo signifique as obras” → “que o corpo seja significado pelas obras” — A fonte diz «per opera corpus significatur»: «corpus» é o sujeito passivo. A tradução inverte a relação expressa pelo latim. *(meaning)*
- Rejected: pt-BR/g7-c008.md [10] — «A lei natural é pervertida nos seres que carecem de razão» parece contrariar o argumento seguinte. — A fonte traz expressamente «pervertitur». Corrigir a afirmação exigiria emendar conjecturalmente o latim.
- Rejected: pt-BR/g8-c004.md [13] — A frase sobre fortalecer-se e enfraquecer-se parece atribuir ambos os movimentos à carne. — O latim também omite o sujeito de «debilitatur»; explicitar mente ou oração escolheria entre antecedentes possíveis sem apoio inequívoco.

### Part 8 of 8, Round 3 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Full read of g7-c004 to g9-c002 (16 files), with the footnotes, journal and book.json; 1 meaning and 2 minor fixes; the 21 audit flags are italics or source markup and need no change.
- `pt-BR/g8-c005.md` [56]: “dos elementos, 2 Coríntios 9:6” → “das esmolas, 2 Coríntios 9:6” — Source «elementarum» is not a Latin form; it is an OCR slip for «eleemosynarum». The cited verse, 2 Cor 9:6 «qui parce seminat», is about almsgiving, and «dos elementos» gives no sense in a list of kinds of sowing. *(meaning)*
- `pt-BR/g8-c003.md` [24]: “isto é, perseveram na santidade” → “isto é, que perseverem na santidade” — This is the second sense of a petition, parallel to «que ... se tornem santos» and «para que ... seja removido». The indicative states a fact instead of something asked for.
- `pt-BR/g7-c005.md` [12]: “Tiago 2:18: *Mostra-me pelas obras; o fim, porque não pela glória própria*; 2 Coríntios 2:” → “Tiago 2:18: *Mostra-me pelas obras*; o fim, porque não pela glória própria; 2 Coríntios 2:” — The italics, misplaced in the source markup, carry Aquinas's next point of the division («finem, quia non propter gloriam propriam») into the quotation of James 2:18. The italics now close after «obras».
- Rejected: pt-BR/g7-c010.md [15] — «por seu nome jurará» breaks the second-person series of Deut 6:13 («iurabis»). — The source reads «iurabit». Changing it would correct the edition rather than an unmistakable OCR slip, so the literal rendering stands.
- Rejected: pt-BR/g8-c002.md [24] — «pelo qual se elimina a vanglória» seems the reverse of the intended sense («by which vainglory is sought»). — The source reads «per quem tollitur». Reversing it would be a conjectural emendation.
- Rejected: pt-BR/g8-c005.md [16] — The second «enim» of verse 6:32 is not rendered. — This is a dropped connective inside the verse. The sense is fully kept, so it is a style choice, not a defect.
- Rejected: pt-BR/translation-journal.md — «78 unidades» while g9-c002 shows paragraphs [1]–[79]. — The count may exclude the heading. It is not clearly false.

### Part 8 of 8, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 1 minor. Verificadas as três alterações e lidos integralmente os nove parágrafos e as três notas apresentados: alterações válidas; encontrado um defeito menor de regência. Os locais dos alertas mecânicos não foram reproduzidos neste delta.
- `pt-BR/g8-c003.md` [25]: “fazei-nos alcançar e participar da bem-aventurança eterna” → “fazei-nos alcançar a bem-aventurança eterna e participar dela” — Os verbos têm regências diferentes: alcançar algo e participar de algo. A correção conserva os dois atos expressos por «pervenire et participare».
- Rejected: pt-BR/g8-c003.md [24] — «Que perseverem» emprega subjuntivo onde o latim traz «perseverant». — O contexto explica uma petição; o subjuntivo português exprime corretamente o sentido solicitado, em paralelo com as outras duas explicações.
- Rejected: pt-BR/g8-c005.md [56] — «Das esmolas» diverge da forma recebida «elementarum». — A forma corrompida, a enumeração dos tipos de semeadura e a citação sobre dar generosamente sustentam a leitura «eleemosynarum».

### Part 8 of 8, Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of g8-c003 [24]–[26] and note [^91]: the fix in [25] is correct (alcançar takes a direct object, participar takes de) and leaves no defect; the audit flag in [26] is a merged emphasis span; no defects found.
- Rejected: pt-BR/g8-c003.md [26] — Emphasis markers differ (source 34, pt-BR 28). — The source marks «***adveniat*** ergo ***regnum tuum***» as two spans; the translation joins them in one span, «***venha o vosso reino***», because it is a single phrase in Portuguese. No content is lost.
- Rejected: pt-BR/g8-c003.md [25] — «abaixo, no capítulo 26:34» cites «Vinde, benditos», which is Matthew 25:34. — The source reads «infra XXVI, 34». Under the journal decision, divergent received references are conserved.
- Rejected: pt-BR/g8-c003.md [26] — «João: Foi-me dado o poder» is Matthew 28:18. — The source reads «Ioh.». This is a divergent received reference and is conserved.
