
## Termos

| delubrum | santuário | No n. 1125, a associação com “lavar” é esclarecida na nota [^55]. |
| discretio | separação | Nos capítulos 65–66, separação dos maus em relação aos bons no juízo e na recepção da salvação. |
| Fortuna | Fortuna | Nome da divindade mencionada em Isaías 65:11 e no n. 1128. |
| Achor | Acor | Nome do vale em Isaías 65:10 e no n. 1127. |
| Iacobinus Astensis | Jacobino de Asti | Nome do frade responsável pela transcrição mencionada no colofão. |
| studium generale | estudo geral | Instituição de estudos mencionada no colofão. |
| collationes | colações | No colofão, textos dispostos em lugares determinados e relacionados às lições. |
| Ordo fratrum praedicatorum | Ordem dos Frades Pregadores | Nome da Ordem no encerramento da obra. |

## Decisões

- Conservadas as 158 unidades da chamada: 76 do capítulo 65 e 82 do capítulo 66, além de duas definições de notas do tradutor.
- Nota [^55]: esclarece a associação etimológica entre *delubrum* e *diluere* no n. 1125. Nota [^56]: registra a dificuldade da redação que associa *redundantia* a *nec redundat* no n. 1142, sem emenda silenciosa.
- Conservada a marca de versículo `^66:71^`, tal como fornecida pelo texto latino.
- Em Isaías 66:18, traduzida a construção latina com “reunir suas obras e seus pensamentos”, sem acrescentar “conheço”, presente apenas na referência inglesa.
- Em Isaías 66:16, *dijudicabitur* foi traduzido como “entrará em juízo”, preservando a imagem judicial e a construção com “contra toda carne”.
- Conservadas as leituras difíceis *visa praemia*, “recompensas vistas”, no n. 1130, e *reverentes*, “com reverência”, no n. 1148, sem emendas a partir da referência inglesa.
- Conservado o sentido de saciedade em Isaías 66:24 e no n. 1150, correspondente a *satietas*, em consonância com a explicação do comentário.
- Recomposta a palavra *tertio*, repartida entre as unidades 72–73 do capítulo 66, mantendo-se as unidades originais.
- Preservadas as referências incompletas ou divergentes do latim, os lemas fragmentários e as diferenças entre texto bíblico e comentário; regularizadas as fronteiras defeituosas de itálico e negrito. Não foram incorporadas notas exclusivas da referência inglesa.

## Review log

### Part 1 of 4, Round 1 (claude, full read)
Verdict: 3 meaning-level, 2 minor. Read all paragraphs of isaiah-c01 to c09 against the Latin: fixed two Eccl./Sirach misidentifications, one mistranslated Is 40:1 lemma, one plural concord slip and one paragraph-number format; the rest is faithful.
- `pt-BR/isaiah-c02.md` [9]: “***9. A esta obra Jerônimo antepõe um prólogo, no qual faz três coisas:***” → “**9.** A esta obra Jerônimo antepõe um prólogo, no qual faz três coisas:” — Source marker run is malformed; the paragraph number should be bold **9.** like every other numbered paragraph, not the whole sentence in bold italics.
- `pt-BR/isaiah-c03.md` [50]: “onde diz: ***Consolai-vos***.” → “onde diz: ***Consolai***.” — Isaías 40:1 *consolamini* is a deponent imperative, 'console' (my people), not 'be consoled'. *(meaning)*
- `pt-BR/isaiah-c05.md` [81]: “Contra quem abriste a boca” → “Contra quem abristes a boca” — Latin *dilatastis* is 2nd person plural, matching 'zombastes' and 'estendestes'.
- `pt-BR/isaiah-c07.md` [150]: “Eclesiastes 17:29” → “Eclesiástico 17:29” — Source *Eccl. XVII 29* ('non est immortalis filius hominis') is Sirach. Ecclesiastes has only 12 chapters. *(meaning)*
- `pt-BR/isaiah-c09.md` [39]: “Eclesiastes 22:23” → “Eclesiástico 22:23” — Source *Eccl. XXII 23* ('cor trepidum in cogitatione fatui') is Sirach. Ecclesiastes has only 12 chapters. *(meaning)*
- Rejected: pt-BR/isaiah-c09.md [94] — '2 Samuel 18' for Hezekiah's age, which is really 2 Reis 18:2 — Source reads *II Reg. XVIII*, correctly mapped to 2 Samuel. The error is the author's or the edition's and is kept.
- Rejected: pt-BR/isaiah-c08.md [32] — Says the blessed do not see the divine essence without a medium — Follows the Latin *non videtur ... sine medio, a quibusdam ...* literally. Emending would correct the source.
- Rejected: pt-BR/isaiah-c02.md [25], pt-BR/isaiah-c03.md [275] — Editorial <...> supplements unescaped, while other files escape them — Matches the source, and each file is internally consistent.
- Rejected: pt-BR/isaiah-c07.md [178] — Lemma 'palavra santa de Israel' differs from the verse 'palavra do Santo de Israel' — Follows the source lemma *eloquium Sanctum Israel*. Divergences between lemma and verse are preserved.

### Part 1 of 4, Round 2 (codex, full read)
Verdict: 5 meaning-level, 5 minor. Leitura integral de isaiah-c01 a isaiah-c09, incluindo notas, auditoria, diário e campos pt-BR de book.json: cinco correções de sentido e cinco menores.
- `pt-BR/isaiah-c02.md` [7]: “ó Paula e Eustóquio” → “ó Paula e Eustóquia” — Eustochium é Eustóquia, filha de Paula e destinatária de Jerônimo. *(meaning)*
- `pt-BR/isaiah-c02.md` [41]: “***Ocultaram***, isto é, os mistérios.” → “***As coisas ocultas***, isto é, os mistérios.” — Abscondita designa aqui as coisas ocultas, identificadas como sacramenta; a tradução verbal impede essa identificação. *(meaning)*
- `pt-BR/isaiah-c04.md` [129]: “estavam pintadas toda espécie” → “estavam pintados toda espécie” — O predicativo concorda com o sujeito composto, que inclui o masculino plural 'todos os ídolos'.
- `pt-BR/isaiah-c05.md` [114]: “os periscélides, as correntinhas” → “as periscélides, as correntinhas” — Periscélide é substantivo feminino.
- `pt-BR/isaiah-c05.md` [165]: “***os periscélides***” → “***as periscélides***” — Periscélide é substantivo feminino.
- `pt-BR/isaiah-c06.md` [9]: “Não haverá entre ti nenhum estéril” → “Não haverá em teu meio nenhum estéril” — Apud te significa 'em teu meio'; 'entre ti' não constitui aqui uma construção adequada em português.
- `pt-BR/isaiah-c09.md` [64]: “será abandonada pela presença de seus dois reis” → “ficará privada da presença de seus dois reis” — A facie duorum regum suorum indica a ausência dos dois reis; a tradução atual apresenta sua presença como causa do abandono. *(meaning)*
- `pt-BR/isaiah-c09.md` [102]: “o ***para que*** é consecutivo” → “a conjunção latina ***ut*** tem valor consecutivo” — O comentário analisa ut, que admite valor consecutivo; a expressão portuguesa 'para que' exprime finalidade e não conserva essa possibilidade. *(meaning)*
- `pt-BR/isaiah-c09.md` [102]: “porque, alimentando-se dessas coisas ainda menino, ***saiba rejeitar o mal***” → “pois, alimentando-se dessas coisas ainda menino, ele ***sabe rejeitar o mal***” — A oração explicativa afirma seu conhecimento; o subjuntivo isolado depois de 'porque' deixa a construção portuguesa gramaticalmente inadequada.
- `pt-BR/isaiah-c09.md` [103]: “Ou o ***para que*** é causal” → “Ou a conjunção latina ***ut*** é causal” — A segunda interpretação continua analisando a conjunção latina ut, e não a expressão portuguesa usada para traduzir o versículo. *(meaning)*
- Rejected: Auditoria mecânica de ênfase nas passagens exibidas — Diferenças na quantidade de marcadores de ênfase. — Resultam da correção de fronteiras defeituosas no latim, da união de lemas contíguos ou da aplicação de itálico a termos latinos e gregos; não indicam perda de conteúdo.
- Rejected: pt-BR/isaiah-c03.md [197] — 'Comeis' parece exigir o futuro 'comereis'. — O texto bíblico fornecido traz comeditis, no presente; o futuro comedetis aparece apenas no comentário posterior.
- Rejected: pt-BR/isaiah-c08.md [49] — Joatão aparece tanto entre os reis justos como no grupo dos outros reis. — A duplicação já está no latim, que traz Joathan em ambos os grupos; corrigi-la alteraria a edição.

### Part 1 of 4, Round 3 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of isaiah-c01 to c09 against the Latin, with the notes, audit flags, journal and book.json. One meaning fix: in c04 [103], the clause about removing mercy by imprecation was reversed.
- `pt-BR/isaiah-c04.md` [103]: “mas invocando-a como justa” → “mas por uma imprecação, como sendo justo retirá-la” — Latin *imprecando ut justam*: the prophet withdraws mercy by an imprecation that calls its withdrawal just, as [104] shows (*justum esset ut in nullo eorum miserereris*). 'Invocando-a' tells the reader that mercy is being invoked, which is the opposite. *(meaning)*
- Rejected: pt-BR/isaiah-c01.md [22] — 'Esdras 8' for a quotation that belongs to Nehemiah 8:8. — The source reads *Esdrae VIII* with no book number. Mapping it to Nehemias would correct the author's citation.
- Rejected: pt-BR/isaiah-c07.md [96] — 'os fortes do povo, seu povo' looks awkward for *fortes ejus et populus ejus*. — This is a defensible reading of the referent of *ejus*. Nothing is lost or misstated.
- Rejected: Mechanical audit, emphasis counts (c02–c09) — The number of emphasis markers differs from the source. — Checked each flag. The differences come from merged contiguous lemmas, repaired marker boundaries or italics added to Greek and Latin terms. No content is lost.

### Part 1 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Revisados integralmente os parágrafos 102–104 de isaiah-c04.md e a nota fornecida: a correção em [103] é coerente com o latim e com [104]; nenhum novo defeito encontrado. Os locais dos alertas mecânicos não foram exibidos neste delta.

### Part 2 of 4, Round 1 (claude, full read)
Verdict: 5 meaning-level, 5 minor. Full read of isaiah-c10 to c26: fixed a garbled Daniel reference, three 'Eccl.' references wrongly resolved to Ecclesiastes, a misleading truncated 1 Mc 1:1 quote, four gender errors on 'torrente', and one inconsistent lemma for 'onus Babylonis'.
- `pt-BR/isaiah-c11.md` [48]: “Daniel VV:27:” → “Daniel 7:27:” — source 'Dan. VV 27' is an OCR slip for VII 27 (the quoted text is Dn 7:27, 'omnes reges servient et obedient ei'); 'VV' is not a chapter *(meaning)*
- `pt-BR/isaiah-c11.md` [40]: “Eclesiastes 6:6:” → “Eclesiástico 6:6:” — 'Eccl.' is ambiguous; the quoted 'consiliarius tibi sit unus de mille' is Sirach 6:6 verbatim and is not in Ecclesiastes 6:6 *(meaning)*
- `pt-BR/isaiah-c14.md` [38]: “Eclesiastes 1:5:” → “Eclesiástico 1:5:” — 'fons sapientiae verbum Dei in excelsis' is Sirach 1:5 (Vulgate); 'Eccl.' here is Ecclesiasticus, not Ecclesiastes *(meaning)*
- `pt-BR/isaiah-c18.md` [43]: “Eclesiastes 36:” → “Eclesiástico 36:” — Ecclesiastes has only 12 chapters, so 'Eccl. XXXVI' can only be Ecclesiasticus; 'Eclesiastes 36' is a nonexistent reference *(meaning)*
- `pt-BR/isaiah-c25.md` [28]: “*Saído da terra de Cetim, Dario*” → “*Saído da terra de Cetim*, [feriu] *Dario*” — source 'egressus de terra Cethim, Darium' has Darius in the accusative (1 Mc 1:1: Alexander came out of Cethim and struck Darius); as rendered, Darius reads as the one who came out *(meaning)*
- `pt-BR/isaiah-c17.md` [8]: “Ao torrente dos salgueiros” → “À torrente dos salgueiros” — 'torrente' is feminine in Portuguese; needs the crase
- `pt-BR/isaiah-c17.md` [16]: “***Ao torrente***” → “***À torrente***” — 'torrente' is feminine; lemma must match corrected verse
- `pt-BR/isaiah-c17.md` [48]: “***Ao torrente***. Aqui” → “***À torrente***. Aqui” — 'torrente' is feminine
- `pt-BR/isaiah-c17.md` [48]: “***ao torrente***, o Eufrates” → “***à torrente***, o Eufrates” — 'torrente' is feminine
- `pt-BR/isaiah-c12.md` [41]: “***O oráculo contra a Babilônia***” → “***Fardo da Babilônia***” — the lemma quotes Is 13:1 'onus Babylonis', rendered 'Fardo da Babilônia' in isaiah-c15.md and glossed there as 'fardo'; the cross-reference should use the same wording
- Rejected: pt-BR/isaiah-c12.md [150] — audit flag: space before punctuation in '***Meu***, < . . . > Juízes' — the gap marker '< . . . >' reproduces a lacuna in the Latin source; it is correct as is
- Rejected: audit: emphasis markers differ (57) — bold/italic counts differ from source — spot-checked: the differences come from split or merged lemmas and the repair of broken source emphasis (e.g. c12 [159], c13 [93]); no lost emphasis found
- Rejected: pt-BR/isaiah-c15.md [56] — 'Lamentações 10' is a nonexistent chapter — the source reads 'Thren. X'; this is an edition error, not an ambiguous abbreviation, so it is kept
- Rejected: pt-BR/isaiah-c16.md [110] — 'pela morte de Ezequias' where context implies Acaz — the source says 'per mortem Ezechiae'; the author or edition is not corrected
- Rejected: various files — name spellings differ between files (Senaqueribe/Senaquerib, Teglat-Falasar/Teglate-Falasar, pítons/pitões) — each file is internally consistent and no Key Terms row governs these names
- Rejected: pt-BR/isaiah-c15.md [23], c19 [9] — 'delubra' rendered 'templos' while Key Terms gives 'santuário' — the Key Terms row is scoped to n. 1125 (chapter 65) and does not govern these passages

### Part 2 of 4, Round 2 (codex, full read)
Verdict: 8 meaning-level, 3 minor. Leitura integral dos 17 arquivos isaiah-c10.md a isaiah-c26.md, incluindo notas, metadados, diário e alertas apresentados: 8 defeitos de sentido e 3 menores.
- `pt-BR/isaiah-c11.md` [12]: “a terra de Zabulon e a terra de Neftali foi aliviada” → “a terra de Zabulon e a terra de Neftali foram aliviadas” — O sujeito composto anteposto exige concordância no plural.
- `pt-BR/isaiah-c11.md` [91]: “***caíram*** para nós” → “***caíram***, separando-se de nós” — O latim diz «ceciderunt a nobis»: afastamento em relação a nós, não movimento ou benefício para nós. *(meaning)*
- `pt-BR/isaiah-c11.md` [113]: “***O ancião, que ensina a mentira***” → “***O ancião***; ***que ensina a mentira***” — São dois lemas distintos: o ancião é a cabeça; quem ensina a mentira é o profeta, a cauda. A oração relativa atribui indevidamente a mentira ao ancião. *(meaning)*
- `pt-BR/isaiah-c13.md` [50]: “Idumeia e Moab serão a ordem de sua mão” → “Idumeia e Moab cumprirão a ordem de sua mão” — A construção elíptica não identifica os povos com uma ordem. O próprio comentário, no parágrafo 109, explicita o verbo «implebunt», cumprirão. *(meaning)*
- `pt-BR/isaiah-c16.md` [65]: “como que para se levantarem contigo” → “como que para se levantarem com ele para te receber” — «Secum tibi assurgere» distingue aquele com quem os gigantes se levantam, o inferno personificado no diabo, daquele a quem recebem, o rei. *(meaning)*
- `pt-BR/isaiah-c18.md` [69]: “ou os que parecem grandes são assalariados e pequenos diante do Senhor” → “ou são os anos do assalariado, que parecem longos e são curtos para o Senhor” — O referente de «qui» são os anos; «mercenarii» é genitivo singular, do assalariado. A tradução os transforma em pessoas assalariadas. *(meaning)*
- `pt-BR/isaiah-c21.md` [26]: “à qual o Senhor dos exércitos abençoou” → “a qual o Senhor dos exércitos abençoou” — Abençoar rege objeto direto; não cabe crase.
- `pt-BR/isaiah-c21.md` [35]: “que sussurram em seus encantamentos” → “que estridem em seus encantamentos” — «Stridunt» indica som estridente, não sussurro. A explicação da mesma passagem em isaiah-c10.md [160] confirma o clamor em voz alta. *(meaning)*
- `pt-BR/isaiah-c21.md` [44]: “O trigo deseja as nuvens” → “As nuvens desejam o trigo” — Na redação canônica fornecida, «desiderant» está no plural: «nubes» é o sujeito e «frumentum», o objeto. *(meaning)*
- `pt-BR/isaiah-c24.md` [15]: “se vos for perdoada esta iniquidade até que morrais” → “esta iniquidade não vos será perdoada até que morrais” — «Si dimittetur» é uma fórmula elíptica de juramento que nega o perdão, como confirma «non credatis» no parágrafo 63. A condicional suspensa em português perde essa negação. *(meaning)*
- `pt-BR/isaiah-c24.md` [74]: “os quais são chamados capões” → “chamado capão” — O referente expresso em português é «um galo», singular; o relativo plural fica sem antecedente concordante.
- Rejected: pt-BR/isaiah-c10.md [141] — «Receberá do alto» diverge de «olhará para o alto» nos lemas posteriores. — O versículo fornecido traz «suscipiet», enquanto o comentário traz «suspiciet». A diferença já existe na fonte; não há base suficiente para normalizá-la.
- Rejected: pt-BR/isaiah-c13.md [30] — Repetição «porque vigia, vigia». — O latim repete «vigilans vigilans»; a repetição não foi introduzida pela tradução.

### Part 2 of 4, Round 3 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Full read of isaiah-c10 to c26: 1 meaning defect (Is 9:15 'longaevus et honorabilis ipse est caput' made into two persons) and 2 minor (concord left by an earlier fix in c11 [12]; clitic on a participle in c22 [2]).
- `pt-BR/isaiah-c11.md` [12]: “foram aliviadas***, isto é, reduzida em seus habitantes” → “foram aliviadas***, isto é, reduzidas em seus habitantes” — the round-2 fix made the lemma plural ('foram aliviadas'); the gloss 'reduzida' must now agree with it
- `pt-BR/isaiah-c11.md` [79]: “O ancião e o homem honrado são a cabeça” → “O ancião e honrado é a cabeça” — source 'Longaevus et honorabilis ipse est caput': one person, both aged and honourable, is the head ('ipse est', singular); the rendering makes two persons *(meaning)*
- `pt-BR/isaiah-c22.md` [2]: “contra Azoto e a tomado,” → “contra Azoto e tendo-a tomado,” — a clitic cannot attach to a bare participle; the coordinated 'tendo' must be repeated ('cepisset eam')
- Rejected: pt-BR/isaiah-c23.md [40] — bare reference '46:3' with no book name, which reads like Isaiah — the source also gives 'XLVI 3' with no book; the author's reference is not completed
- Rejected: pt-BR/isaiah-c13.md [46] vs [96] — verse has 'a ela as nações suplicarão' but the lemma has 'A ele' — the Latin itself shifts from 'radix' to masculine 'qui… ipsum'; both renderings are defensible
- Rejected: pt-BR/isaiah-c25.md [16]/[58] — 'Et erit' is dropped in the verse while the lemma reads 'E será' — the Hebraism may be omitted as a style choice; the lemma still points to the right verse
- Rejected: audit: emphasis markers differ (c10–c26) — bold/italic counts differ from the source — checked the flagged places (e.g. c17 [44], c18 [62], c19 [43], c10 [166]): the differences come from merged or split lemmas; no emphasis is lost

### Part 2 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificadas as três correções e lidos integralmente os nove parágrafos apresentados, além dos metadados e do diário: nenhum novo defeito identificado. Os quatro alertas de ênfase referem-se a parágrafos não incluídos neste delta e não foram reavaliados.

### Part 3 of 4, Round 1 (claude, full read)
Verdict: 3 meaning-level, 2 minor. Read c27–c46 in full against the Latin. Fixed three sense errors (41:21 'forte' misread, 43:14 'enviei a Babilônia', the OCR reference 'João viv') and unified 'Rabsaqué' in c34 and c35. The audit flags are not defects.
- `pt-BR/isaiah-c43.md` [22]: “trazei o que tiverdes de sólido” → “trazei, se acaso tendes algo” — Source has 'afferte si quid forte habetis', where forte is the adverb 'perhaps', not the adjective 'strong'. 'de sólido' adds a sense the text does not have; the commentary in n. 810 reads simply 'si quid habetis'. *(meaning)*
- `pt-BR/isaiah-c45.md` [15]: “por vossa causa enviei a Babilônia” → “por vossa causa enviei contra a Babilônia” — Source has 'emisi in Babylonem' (sent against Babylon; n. 837 glosses 'scilicet iram'). As written, with no crase and with the article this file uses for Babilônia, the Portuguese reads as 'I sent Babylon'. *(meaning)*
- `pt-BR/isaiah-c45.md` [53]: “João viv: *Eu sou o princípio*” → “João 8: *Eu sou o princípio*” — 'Jo. viv' is an OCR slip. The cited words 'ego principium' are from John 8:25, and 'viv' left untranslated is not a usable reference. *(meaning)*
- `pt-BR/isaiah-c34.md` [38]: “a saber, Rabsaces, de quem” → “a saber, Rabsaqué, de quem” — The same person is 'Rabsaqué' throughout c38–c39. Unify the name.
- `pt-BR/isaiah-c35.md` [52]: “os enviados de Ezequias a Rabsaces” → “os enviados de Ezequias a Rabsaqué” — The same person is 'Rabsaqué' throughout c38–c39. Unify the name.
- Rejected: pt-BR/isaiah-c31.md, c32.md, c33.md, c38.md, c39.md, c40.md, c41.md (quote flags) — Unbalanced quotation marks — Each quotation opens in one verse paragraph and closes in a later one. Nested ‘ ’ and “ ” balance across the span.
- Rejected: pt-BR/isaiah-c29.md [4] — 'a punição' added in 27:3 — This makes the impersonal 'visitetur contra eam' explicit in Portuguese. It is a defensible rendering, not added content.
- Rejected: pt-BR/isaiah-c42.md [3] — 'malitia' rendered as 'aflição' — 'Malitia' can mean affliction or trouble in Vulgate usage (Mt 6:34). Defensible.
- Rejected: pt-BR/isaiah-c44.md [58] — Length outlier at 165% — Every clause is present. The extra length comes from Portuguese periphrasis.
- Rejected: pt-BR/isaiah-c32.md [94] — 'misturadas' does not agree with 'cevada' — It can read as agreeing with the barley and chaff together. Defensible.

### Part 3 of 4, Round 2 (codex, full read)
Verdict: 3 meaning-level, 4 minor. Leitura integral de c27–c46, notas, auditoria, diário e book.json: três defeitos de sentido e três menores, corrigidos em sete substituições.
- `pt-BR/isaiah-c29.md` [18]: “havia submetido a si;[^32]” → “havia submetido a si;” — Retira a chamada da nota redundante, cuja definição também é removida.
- `pt-BR/isaiah-c29.md`: “[^32]: *Nota do tradutor:* O comentário associa o nome “Leviatã” à ideia de acréscimo, interpretação tradicional retomada no n. 631 para explicar a ação do diabo.” → “” — A nota apenas reapresenta a associação já explicitada pelo autor neste trecho e no n. 631; pelas regras da revisão, notas que somente restatam o texto são removidas.
- `pt-BR/isaiah-c39.md` [81]: “a quem queriam substituir” → “a quem queriam constituir sucessor” — Em 'quem substituere volebant', o irmão mais novo é aquele que se pretendia colocar como sucessor, não aquele que se pretendia remover. *(meaning)*
- `pt-BR/isaiah-c42.md` [26]: “me igualastes?, diz o Santo.” → “me igualastes? — diz o Santo.” — Corrige a vírgula indevidamente acumulada com o ponto de interrogação, separando a fala da indicação de quem fala.
- `pt-BR/isaiah-c42.md` [116]: “*Arrasta-me para junto de ti*” → “*Arrasta-me atrás de ti*” — 'Post te' significa atrás de ti, indicando seguimento; 'para junto de ti' substitui essa relação pela mera proximidade. *(meaning)*
- `pt-BR/isaiah-c44.md` [22]: “quis santificá-lo, engrandecer a lei e exaltá-la.” → “quis que ele fosse santificado, engrandecesse a lei e fosse exaltado.” — O comentário em [73] explicita os referentes: o Senhor santifica e exalta o povo, e o povo engrandece a lei. A tradução atribui ao Senhor o engrandecimento da lei e faz da lei o objeto da exaltação. *(meaning)*
- `pt-BR/translation-journal.md`: “43:21 'forte' misread” → “41:21 'forte' misread” — A ocorrência de 'forte' corrigida na rodada anterior está em Isaías 41:21, no arquivo isaiah-c43.md.
- Rejected: pt-BR/isaiah-c27.md [42] — A hostilidade dos moabitas é atribuída ao sono. — O latim fornecido diz expressamente 'propter somnum'; não cabe corrigir a estranheza do original por conjectura.
- Rejected: pt-BR/isaiah-c40.md [2] — Amós é chamado profeta, como pai de Isaías. — O texto canônico fornecido traz 'filius Amos prophetae', com o genitivo aplicado ao pai; a tradução preserva essa leitura.

### Part 3 of 4, Round 3 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Read c27–c46 in full against the Latin, with the notes, audit, journal and book.json. Found one meaning error: the 'ibex/ibis/invidus ibis' homograph mnemonic in c36 [47]. The audit's emphasis and quote flags are not defects.
- `pt-BR/isaiah-c36.md` [47]: “o *ibex* é quadrúpede, a *ibis* é ave, e o *ibis* é invejoso.” → “o *ibex* é quadrúpede, a *ibis* é ave, e *invidus ibis* é “irás invejoso”.” — Source has 'est ibex quadrupes, ibis avis et invidus ibis'. This is the medieval mnemonic for homographs: in 'invidus ibis', 'ibis' is the future of 'ire' ('you will go envious'). The current Portuguese tells the reader that the ibis bird is envious. *(meaning)*
- Rejected: pt-BR/isaiah-c30.md [42] — 'tempestivus vel primitivus fructus' rendered as 'um fruto maduro ou temporão', which seems to clash with 'ante maturitatem' — 'Tempestivus' can mean 'ripe, seasonable' (Lewis & Short), so 'maduro' is a defensible rendering.
- Rejected: pt-BR/isaiah-c40.md [35] — 'cum ... rationes ab aeterno in Deo fuerint' rendered concessively ('embora') — 'Cum' with the subjunctive can be concessive, and the argument still reads coherently. This is not an objective error.
- Rejected: pt-BR/isaiah-c39.md [42] — 'numquid non populus a Deo suo' completed as 'Acaso o povo não deve pedir a seu Deus' — The added verb only makes the truncated lemma grammatical, in line with Isaiah 8:19 ('requiret'). It adds no new sense.
- Rejected: pt-BR/isaiah-c45.md [28] — 'Pater tuus primus peccavit' rendered as 'Teu primeiro pai pecou' — The Latin is ambiguous, and the commentary in [71], which names Adam first, supports this reading.

### Part 3 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente os parágrafos 46–48; confirmada a correção de «invidus ibis» como «irás invejoso», sem novos defeitos. Os demais parágrafos sinalizados pela auditoria não foram fornecidos neste delta.
- Rejected: pt-BR/isaiah-c36.md [47] — Diferença na contagem de marcadores de ênfase. — Os seis marcadores adicionais delimitam as três expressões latinas conservadas em itálico; não há defeito de formatação.

### Part 4 of 4, Round 1 (claude, full read)
Verdict: 1 meaning-level, 5 minor. Read all 22 files (c47–c68) clause by clause with the audit, journal and book.json; found one broken italic span, a misspelled verb, two pre-1990 spellings of 'Oseias', one relative pronoun with the wrong antecedent and one mistranslated animal name; references, footnotes and the journal's claims check out.
- `pt-BR/isaiah-c49.md` [33]: “*Dos sinais do céu, não*** etc.” → “*Dos sinais do céu, não* etc.” — Italic span opens with * and closes with ***; broken emphasis markers.
- `pt-BR/isaiah-c57.md` [47]: “***Embriai-vos nos seios” → “***Embriagai-vos nos seios” — Misspelling: the imperative of embriagar-se is 'embriagai-vos' (as in c53 [83]).
- `pt-BR/isaiah-c63.md` [27]: “Oséias 9:” → “Oseias 9:” — The 1990 orthography drops the accent; the other files write 'Oseias'.
- `pt-BR/isaiah-c65.md` [70]: “Oséias 11:1” → “Oseias 11:1” — The 1990 orthography drops the accent; the other files write 'Oseias'.
- `pt-BR/isaiah-c47.md` [58]: “argumento de sua divindade, pela qual pode ser conhecido” → “argumento de sua divindade, pelo qual pode ser conhecido” — Latin 'quo cognosci potest' refers back to 'argumentum', not to 'deitatis'.
- `pt-BR/isaiah-c53.md` [81]: “animal puro semelhante à cabra” → “animal puro semelhante ao corço” — Latin 'simile capreo' means like the roe deer (capreus/caprea, as in Deut 14:5), not a goat. *(meaning)*
- Rejected: pt-BR/isaiah-c47.md [15]–[16] — Unbalanced quotation marks flagged by the audit — One quotation spans Is 45:14–15 and opens in [15] and closes in [16].
- Rejected: pt-BR/isaiah-c47.md [15] — 'in te' rendered with vós, which turns Israel into God as the one addressed — The verse is ambiguous; v. 15 addresses God, and Thomas reads 14–15 as one confession of the true God, so reverential vós is defensible.
- Rejected: audit: emphasis markers differ (41 flags) — Different counts of *** markers — Each flagged paragraph checked: the differences come from lemmas split or merged and from regularized italic boundaries; only c49 [33] was a real defect.
- Rejected: pt-BR/isaiah-c55.md [33] note [^47] — Claim that the Priam phrase comes from Porphyry's Isagoge — The Isagoge uses 'species digna est imperio' as its example of species meaning form; the claim stands.

### Part 4 of 4, Round 2 (codex, full read)
Verdict: 3 meaning-level, 7 minor. Lidos integralmente os 22 arquivos, c47–c68, com notas, auditoria, diário e book.json: três defeitos de sentido, cinco problemas de renderização e uma nota redundante, cuja remoção exige duas alterações.
- `pt-BR/isaiah-c47.md` [15]: “o comércio da Etiópia e de Sabaim, homens de alta estatura” → “o comércio da Etiópia e os homens de alta estatura de Sabaim” — O latim apresenta os homens de Sabaim como outro sujeito de transibunt; a tradução os incorpora indevidamente ao complemento de comércio. *(meaning)*
- `pt-BR/isaiah-c57.md` [41]: “e isso <primeiro> porque cura” → “e isso \<primeiro\> porque cura” — Sem escape, <primeiro> é interpretado como uma tag HTML, ocultando a palavra na renderização Markdown.
- `pt-BR/isaiah-c62.md` [55]: “Primeiro, <apresenta> a restauração” → “Primeiro, \<apresenta\> a restauração” — É necessário escapar os sinais editoriais para que apresenta não seja interpretado como uma tag HTML.
- `pt-BR/isaiah-c63.md` [47]: “com as <vestes> da salvação” → “com as \<vestes\> da salvação” — Sem escape, <vestes> é interpretado como uma tag HTML e a palavra desaparece na renderização.
- `pt-BR/isaiah-c65.md` [36]: “contemplar*.[^54]” → “contemplar*.” — Remove o marcador da nota que apenas repete a explicação etimológica já traduzida integralmente no parágrafo.
- `pt-BR/isaiah-c65.md`: “[^54]: *Nota do tradutor:* O autor explica o latim *formosus*, “formoso”, por duas associações etimológicas: com *formo*, entendido como “quente”, e com *forma*, que fundamenta a referência à proporção dos membros.” → “” — A nota apenas repete o conteúdo do parágrafo 36, sem acrescentar esclarecimento linguístico; deve ser removida conforme a regra para notas redundantes.
- `pt-BR/isaiah-c65.md` [61]: “<segundo>, apresenta a petição” → “\<segundo\>, apresenta a petição” — É necessário escapar os sinais editoriais para que segundo permaneça visível na renderização Markdown.
- `pt-BR/isaiah-c66.md` [39]: “porque envolvidas em outros pecados” → “porque estamos envolvidos em outros pecados” — Involuti é masculino plural e se refere às pessoas, não às justiças. A tradução troca o sujeito da explicação. *(meaning)*
- `pt-BR/isaiah-c66.md` [46]: “do templo, a saber, Jerusalém” → “a saber, do templo de Jerusalém” — Templi scilicet Jerusalem identifica o santuário como o templo de Jerusalém; a tradução identifica indevidamente o próprio templo com a cidade. *(meaning)*
- `pt-BR/isaiah-c67.md` [61]: “segundo, <promete> recompensas” → “segundo, \<promete\> recompensas” — Sem escape, <promete> é interpretado como uma tag HTML, ocultando o verbo na renderização Markdown.
- Rejected: pt-BR/isaiah-c65.md [33] — A comparação parece atribuir menos conhecimento ao intelecto divino que ao angélico. — A dificuldade está no próprio latim, que traz minus; a tradução o conserva e a nota 53 identifica expressamente o problema.

### Part 4 of 4, Round 3 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of c47–c68 against the Latin with the audit, journal and book.json: one mistranslated lemma (relative clause turned from subject into object, c67 [34]) and one subject–verb comma (c47 [15]).
- `pt-BR/isaiah-c67.md` [34]: “***E os que abandonastes***” → “***E vós, que abandonastes***” — Latin 'et qui dereliquistis' means 'and you who abandoned', as in the verse ([12]) and in n. 1128 ([59]). 'E os que abandonastes' reads as 'and those whom you abandoned', which turns the subject into the object. *(meaning)*
- `pt-BR/isaiah-c47.md` [15]: “os homens de alta estatura de Sabaim, passarão” → “os homens de alta estatura de Sabaim passarão” — A comma between the compound subject and its verb 'passarão' is a punctuation error in Portuguese.
- Rejected: pt-BR/isaiah-c53.md [28], [73] — 'Eu sou aquele que agito': the verb agrees with 'eu' instead of 'aquele' — Agreement of the verb with the first-person subject after 'aquele que' is accepted in normative grammar (Bechara), so this is a style choice.
- Rejected: pt-BR/isaiah-c58.md [23] — '<capítulo 58>' is not escaped, unlike '<primeiro>' and the others — The non-ASCII 'í' means it does not form a valid raw-HTML tag, so it renders as literal text. The same holds for '<62:6>', '<35:2>' and '<***exultação***…>'.
- Rejected: pt-BR/isaiah-c59.md [12] — 'quia mentita es' rendered with a purpose clause, 'para que mentisses' — The Vulgate clause is traditionally read this way (Douay: 'that thou hast lied'); defensible.
- Rejected: various (e.g. c48 [24], c53 [34], c64 [30], c59 [77]) — Scripture references that do not match the modern location — The source edition gives these references; house rules forbid correcting the author or the edition.

### Part 4 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. As duas correções estão corretas. Lidos os seis parágrafos exibidos, as três notas, o diário e book.json, sem novos defeitos. O parágrafo c47 [73], sinalizado pela auditoria, não foi fornecido neste delta.
- Rejected: pt-BR/isaiah-c47.md [15]–[16] — Aspas desequilibradas apontadas pela auditoria. — A citação abre em [15] e fecha em [16]; o conjunto está equilibrado.
