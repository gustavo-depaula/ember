# Diário de tradução — Proslógio (pt-BR)

Fonte: la/, S. Anselmi Cantuariensis archiepiscopi opera omnia, ed. J.-P. Migne, Patrologia Latina 158 (Paris 1853), texto de Gerberon (Corpus Corporum, texto 10631).
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Proslogion / Monologion | Proslógio / Monológio | título do book.json |
| Alloquium / Soliloquium | Alocução / Solilóquio | praefatio |
| Fides quaerens intellectum | A fé que busca a inteligência | como na descrição do book.json |
| id quo maius cogitari nequit / non potest | aquilo do qual não se pode pensar nada maior | fórmula fixa; com *aliquid*: “algo do qual nada maior se pode pensar”; dirigida a Deus: “vós de quem nada maior se pode pensar” |
| cogitare / cogitatio | pensar / pensamento | |
| intelligere / intellectus | entender / inteligência | *esse in intellectu* = “estar na inteligência” |
| in re / secundum rem | na realidade / segundo a coisa | c02, c04 |
| vox (significans) | palavra | c04 |
| insipiens / stultus | insipiente / estulto | Salmo 13:1 |
| homuncio | homenzinho | como nas *Orações e meditações* |
| vacare Deo | dedicar-se a Deus | segue *vacare* com dativo nas irmãs |
| anima mea | alma minha | vocativo, em *tu* |
| formator et reformator | formador e reformador | c14 |
| sensibilis | sensível | no sentido ativo, “dotado de sensação”; nota em c06 |
| misericors / impassibilis | misericordioso / impassível | |
| affectus / effectus | afeto / efeito | c08, c10 |
| compati / compassio | compadecer-se / compaixão | |
| parcere | poupar | |
| incircumscriptus | incircunscrito | c13 |
| lux inaccessibilis | luz inacessível | |
| levitas | suavidade | c17, o que é agradável ao tato |
| saeculum saeculi / saecula saeculorum | século do século / séculos dos séculos | c21 |
| Verbum | Verbo | c23 |
| Spiritus sanctus | Espírito Santo | |
| summum bonum | sumo bem | |
| beatitudo / beatus | bem-aventurança / bem-aventurado | |
| charitas / dilectio | caridade / amor | |
| aerumnae | aflições | c25 |
| admirabilis consiliarius | admirável Conselheiro | c26, Isaías 9:6 |
| Psal. / Isa. / Matth. / I Cor. / Sapient. / Luc. / Rom. / Joan. | Salmo / Isaías / Mateus / 1 Coríntios / Sabedoria / Lucas / Romanos / João | numeração dos Salmos da fonte |
| Lugdunensis | de Lyon | praefatio |

## Decisões

- Deus é tratado por *vós*; o *homuncio*, o coração, a alma e o “coração humano” (c25) por *tu*. A carne e a alma juntas (c25) por *vós* plural. As apóstrofes à misericórdia e à bondade de Deus (c09) e à verdade (c16) seguem o *vós* reverente.
- Os resumos de Gerberon ficam em itálico, traduzidos. Os títulos “Caput I”, “IX”, “XVIII”, “XXIII” ficam só “Capítulo …”, como na fonte; os títulos do sumário seguem os cabeçalhos traduzidos do latim.
- c16: o título latino omite *lux*; acrescentou-se “luz” para o português ficar inteligível.
- c22: *qui es* → “aquele que sois”, para manter o eco de Êxodo 3:14.
- c24–c25: *salus* → “salvação”, como na referência inglesa, também na citação do Salmo 36:39.
- c25: *torrente voluptatis suae* (a fonte tem *suae*, não *tuae*) traduzido como impresso: “da torrente do seu prazer”.
- Lapsos de OCR lidos pelo sentido: *die* = *dic* (c14), *Revela* = *Releva* (c18), *tu tamen* = *ut tamen* (c25), *fit* = *sit* (c26), *Curitaque* = *Cur itaque* (c03).
- Notas do tradutor: c06 [^1] (sentido ativo de *sensibilis*); c08 [^1] (etimologia de *misericors*, *miser* + *cor*); c25 [^1] (a referência “Luc. XIII, 42” impressa em Migne; a frase ecoa Mateus 25:21, 23 e Lucas 12:42-44); praefatio [^1] (Hugo de Die, arcebispo de Lyon e legado pontifício).

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of praefatio and c01–c26 against the Latin, plus journal and book.json: text clean; one minor fix to the description's formula per the Key Terms table.
- `book.json`: “o argumento de «aquilo do qual nada maior se pode pensar»” → “o argumento de «aquilo do qual não se pode pensar nada maior»” — la description quotes «id quo maius cogitari nequit», which the Key Terms table fixes as “aquilo do qual não se pode pensar nada maior”; the form without *aliquid* should follow the table
- Rejected: pt-BR/praefatio.md [2] — Mechanical audit: 8 emphasis markers in the source, 6 in the translation — The Portuguese moves *hoc opus nuncupavit* into the italic span “Depois chamou a esta obra”, so one source span is merged. The italic/roman alternation for the titles is kept, so no formatting is lost
- Rejected: pt-BR/c25.md [3] [^1] — Translator's note on “Luc. XIII, 42” — Lc 13:42 does not exist. Mt 25:21, 23 and Lc 12:42-44 contain the “constituet super multa/omnia” wording. The note is correct
- Rejected: pt-BR/praefatio.md [^1] — Hugo de Die: dates and offices — He was papal legate in France under Gregory VII, became archbishop of Lyon in 1081/1082 and died in 1106. The note is correct
- Rejected: pt-BR/c22.md [3] — *tu es qui es* is “aquele que sois”, but *qui proprie et simpliciter es* is “aquele que é” — The journal records the first choice to keep the Ex 3:14 echo. The second is a defensible impersonal rendering and does not change the sense
- Rejected: pt-BR/c18.md [3] — *Quomodo ergo nec tu habes partes…* rendered as “Visto, pois, que…” — The sentence has no interrogative force and ends in an assertion. A causal reading is the coherent one and the sense is kept

### Round 2 (codex, full read)
Verdict: 6 meaning-level, 3 minor. Leitura integral do Proêmio e de c01–c26, com notas, auditoria, diário e book.json: seis defeitos de sentido e três menores.
- `pt-BR/c07.md` [3]: “Não é assim como dizes que não é” → “Assim não é, como dizes que não é” — O exemplo latino confirma a negação do interlocutor; a posição de «não» na tradução faz parecer que se nega a concordância com ele. *(meaning)*
- `pt-BR/c11.md` [2]: “salva a uns mais do que a outros” → “salva a uns em vez de outros” — «Hos magis salvet quam illos» indica a escolha de uns para a salvação, não graus de salvação. *(meaning)*
- `pt-BR/c11.md` [2]: “condena a outros mais do que a estes” → “condena a outros em vez destes” — O contraste latino é entre os que são condenados e os que são salvos, não entre graus de condenação. *(meaning)*
- `pt-BR/c11.md` [3]: “salvais a estes mais do que àqueles” → “salvais a estes em vez daqueles” — «Hos magis salves quam illos» pergunta por que uns são salvos em preferência a outros igualmente maus. *(meaning)*
- `pt-BR/c11.md` [3]: “condenais àqueles mais do que a estes” → “condenais aqueles em vez destes” — O latim contrapõe a condenação daqueles à salvação destes; não compara a intensidade das condenações. *(meaning)*
- `pt-BR/c18.md` [2]: “a própria unidade, indivisível nem sequer pela inteligência” → “a própria unidade, que nem sequer pela inteligência se pode dividir” — Corrige a combinação inadequada de «indivisível» com «nem sequer», preservando «ne quidem intellectu divisibilis».
- `pt-BR/c19.md` [2]: “mas vós conteis todas as coisas” → “mas vós contendes todas as coisas” — A segunda pessoa do plural do presente do indicativo de «conter» é «contendes».
- `pt-BR/c20.md` [3]: “a vossa eternidade e a delas vos está presente toda inteira” → “a vossa eternidade e a delas vos estão presentes todas inteiras” — O sujeito composto anteposto exige concordância no plural em português.
- `pt-BR/c25.md` [3]: “os separará de Deus contra a vontade deles” → “os separará de Deus contra a vontade de Deus e a deles” — «Invitos Deum et illos» inclui tanto Deus quanto os bem-aventurados entre aqueles contra cuja vontade ocorreria a separação. *(meaning)*

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of the Proêmio and c01–c26 against the Latin, with the notes, the journal and book.json: one minor drift from the Key Terms table (parcere → poupar) in c09.
- `pt-BR/c09.md` [3]: “só retribuindo e não perdoando” → “só retribuindo e não poupando” — source has *tantum retribuendo, et non parcendo*; the Key Terms table fixes *parcere* as “poupar”, and “perdoando” is used for *ignoscendo* in the same paragraph
- Rejected: pt-BR/praefatio.md [2] — Mechanical audit: 8 emphasis markers in the source, 6 in the translation — Already rejected in round 1: two italic spans are merged around “Depois chamou a esta obra”, and the alternation for the titles is kept
- Rejected: pt-BR/c14.md [2] — *omnino* in *Aut potuit omnino aliquid intelligere de te* is not rendered — It is an intensifier; “alguma coisa de vós” in a rhetorical question keeps the sense
- Rejected: pt-BR/c01.md [3] — *Eia nunc homuncio* is rendered “Eia, pois, homenzinho”, without “agora” — “pois” carries the hortative *nunc*; this is a defensible style choice
- Rejected: pt-BR/c23.md [3] — *quantus es tu, et ille* is rendered “quanto sois vós e ele” — The correlative with *tantum amas* keeps the sense of the measure; it is not a defect

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificada a alteração e lidos integralmente os parágrafos c09 [2–3] contra o latim: «não poupando» está correto e conforme ao diário; nenhum defeito encontrado.
