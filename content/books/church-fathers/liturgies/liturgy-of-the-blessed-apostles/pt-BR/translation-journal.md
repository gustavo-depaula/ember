# Diário de tradução — A Liturgia dos Bem-aventurados Apóstolos (pt-BR)

Fonte: en-US/, tradução de James Donaldson, Ante-Nicene Fathers, vol. 7 (1886), revista por Kevin Knight para o New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| The Liturgy of the Blessed Apostles | A Liturgia dos Bem-aventurados Apóstolos | |
| Liturgies (autor) | Liturgias | |
| St. Adæus and St. Maris | Santo Adai e São Mari | forma usual em português ("Anáfora de Addai e Mari") |
| Teachers of the Easterns | Mestres dos Orientais | cristãos da Igreja do Oriente |
| Lord of all | Senhor de todas as coisas | fórmula recorrente |
| mystery / mysteries / sacraments | mistério / mistérios / sacramentos | distintos, como na fonte |
| renowned, holy, life-giving, and divine mysteries | insignes, santos, vivificantes e divinos mistérios | fórmula fixa |
| life-giving / Life-giver | vivificante / Vivificador | |
| oblation / Great Oblation | oblação / Grande Oblação | |
| propitiation / propitiatory / propitiator | propiciação / propiciatório / propiciador | |
| pardon of offenses / forgiveness of sins | perdão das ofensas / remissão dos pecados | par mantido distinto |
| clemency / tender mercies / mercies | clemência / ternas misericórdias / misericórdias | |
| follies | insensatezes | |
| degraded | decaído | "natureza decaída", "pecadores e decaídos" |
| insignificant / insignificance / pithless | pequeno / pequenez / sem vigor | |
| awful | tremendo | |
| unspeakable / ineffable | indizível / inefável | |
| rest | repouso | |
| dispensation | economia | |
| pasture | pastagem | "rebanho da vossa pastagem" |
| Holy Catholic Church | Santa Igreja Católica | |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| Trinity | Trindade | |
| canon | cânon | *qanona*; nota do tradutor |
| responsory / responsories | responsório / responsórios | |
| disk / paten | disco / patena | distintos, como na fonte |
| chancel | presbitério | |
| horn of the altar | corno do altar | |
| Sacristan | sacristão | |
| sign (verbo) | assinalar / fazer o sinal da cruz | |
| host / fraction | hóstia / fração | |
| for ever / for ever and ever / always and for ever | para sempre / pelos séculos dos séculos / sempre e para sempre | |
| Peace be with you / With you and with your spirit | A paz esteja convosco / Contigo e com o teu espírito | |
| fathers (clero, ¶60) | padres | como nos irmãos |
| pious and righteous fathers (¶126, 128) | pais piedosos e justos | antepassados na fé |
| Lord's day | dia do Senhor | |
| Obsignation | Obsignação | |

## Decisões

- **Tratamento.** Deus (e Cristo) recebe *vós* em toda a liturgia, inclusive onde a fonte tem "Thou", "art", "dwellest", "takest". Pronomes referentes a Deus em minúscula ("sua", "ele"), conforme o uso português.
- **¶91** A oração à Virgem tem "you" singular minúsculo: *tu* ("suplica por mim", "que de ti nasceu"). "mother" fica em minúscula, como na fonte.
- **Diálogos.** O povo ao sacerdote e o sacerdote a um só diácono: *tu* (¶62, 66, 80, 171, 173, 194). Ao povo ou ao clero em conjunto: *vós* (¶37, 60, 97, 124, 204, 236).
- **"Bless, O Lord"** (¶59, 143, 206) fica sempre "Abençoai, Senhor", como a fonte, sem decidir se o destinatário é Deus ou o celebrante.
- **¶81** "give the (kiss of) peace" → "dão uns aos outros (o ósculo da) paz", para que a frase se leia também sem o parêntese.
- **¶139** Os incipits dos salmos e as indicações "down to" ficam sem aspas nem itálico, como na fonte.
- **¶188** "lead us not into temptation" → "não nos conduzais à tentação", seguindo a redação da fonte.
- **¶8** O número do salmo fica "(xv.)", como na fonte.
- **Erros tipográficos da fonte** ("propiatory" ¶12, "renowed" ¶168, "an his forehead" ¶169, "Matthew Mark" ¶56) traduzidos na forma correta.
- **Notas do tradutor:** [^1] em ¶2, sobre Adai, Mari e a Igreja do Oriente; [^2] em ¶73, sobre o sentido siro-oriental de "cânon".

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 (236 paragraphs), footnotes, journal and book.json; no defects found, and the audit flag on 'corno do altar' is a split form, not a missing one.
- Rejected: pt-BR/ch001.md [58] — Audit flag: Key Terms row 'horn of the altar → corno do altar' has 0 occurrences in pt-BR — The source has 'the right and the left horn of the altar'; the PT renders it 'o corno direito e o esquerdo do altar', which is the same term split around its adjectives. The row is accurate.
- Rejected: pt-BR/ch001.md [236] — 'sealed and guarded by the holy sign … from all evils' reordered so that 'pelo santo sinal' attaches to 'selados' and 'de todos os males' to 'guardados' — The reorder avoids the misreading 'do Senhor de todos os males'. Being guarded by the sign stays implied by the coordination, so the sense is kept and this is a defensible style choice.
- Rejected: pt-BR/ch001.md [19] — 'coroada e repleta' makes the Church, not 'we', crowned and filled — The source is open here, and the parallel in ¶133 ('in Your Church, redeemed by…') supports the Church as referent. The commitment is defensible.
- Rejected: pt-BR/ch001.md [224] — 'dar graças, adorar e louvar o tremendo nome' shares a direct object across verbs with different regency — This kind of coordination is common in liturgical Portuguese, and the sense is clear. It is a style choice, not broken grammar.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 72 minor. Leitura integral dos 236 parágrafos, das duas notas, do diário e de book.json: sem defeitos de sentido; correções menores de pontuação e uma divergência da tabela de termos.
- `pt-BR/ch001.md` [34]: “depois da proclamação: —” → “depois da proclamação:” — A regra editorial veda reproduzir essa combinação de dois-pontos e travessão da fonte.
- `pt-BR/ch001.md` [36]: “Os diáconos dizem:—” → “Os diáconos dizem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [38]: “secreta no santuário: —” → “secreta no santuário:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [42]: “ao altar e dizem:—” → “ao altar e dizem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [44]: “as mãos e diz: —” → “as mãos e diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [46]: “E prossegue:—” → “E prossegue:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [48]: “E prossegue:—” → “E prossegue:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [58]: “do Evangelho e diz:—” → “do Evangelho e diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [61]: “E respondem:—” → “E respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [63]: “para o altar e diz:—” → “para o altar e diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [65]: “(lado da Epístola), diz:—” → “(lado da Epístola), diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [67]: “diz em segredo:—” → “diz em segredo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [69]: “em segredo esta oração:—” → “em segredo esta oração:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [71]: “E prossegue:—” → “E prossegue:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [75]: “da cruz, e respondem:—” → “da cruz, e respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [77]: “X. E prossegue:—” → “X. E prossegue:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [79]: “Respondem:—” → “Respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [81]: “paz e dizem:—” → “paz e dizem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [83]: “O diácono diz:—” → “O diácono diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [85]: “oração em segredo:—” → “oração em segredo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [90]: “a seguinte oração: —” → “a seguinte oração:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [92]: “cânon em voz alta:—” → “cânon em voz alta:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [94]: “os sacramentos, e respondem:—” → “os sacramentos, e respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [96]: “O sacerdote prossegue:—” → “O sacerdote prossegue:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [98]: “Respondem:—” → “Respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [102]: “Respondem:—” → “Respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [106]: “diz esta oração:—” → “diz esta oração:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [108]: “diz em segredo: —” → “diz em segredo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [110]: “Dizem em voz alta:—” → “Dizem em voz alta:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [112]: “O sacerdote, em segredo:—” → “O sacerdote, em segredo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [117]: “esta oração, inclinado:—” → “esta oração, inclinado:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [119]: “depois das quais:—” → “depois das quais:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [125]: “inclinado e em voz baixa:—” → “inclinado e em voz baixa:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [126]: “dignos do perdão dos seus pecados” → “dignos da remissão dos seus pecados” — A tabela de termos estabelece “remissão dos pecados” para “forgiveness of sins”; aqui a fonte diz “forgiveness of their sins”.
- `pt-BR/ch001.md` [127]: “esta oração de inclinação:—” → “esta oração de inclinação:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [129]: “Prossegue com a Grande Oblação:—” → “Prossegue com a Grande Oblação:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [131]: “Prossegue:—” → “Prossegue:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [136]: “com a cruz, e respondem:—” → “com a cruz, e respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [138]: “diz esta oração: —” → “diz esta oração:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [140]: “Depois diz esta oração:—” → “Depois diz esta oração:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [142]: “ao redor do altar diz:—” → “ao redor do altar diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [144]: “a si mesmo, e diz:—” → “a si mesmo, e diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [146]: “em seguida diz:—” → “em seguida diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [148]: “olhando para o alto, diz:—” → “olhando para o alto, diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [153]: “pareçam beijá-la; e diz:—” → “pareçam beijá-la; e diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [155]: “ambas as mãos, dizendo:—” → “ambas as mãos, dizendo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [157]: “assinala o cálice, dizendo:—” → “assinala o cálice, dizendo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [159]: “E respondem:—” → “E respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [161]: “está na patena, dizendo:—” → “está na patena, dizendo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [163]: “E respondem:—” → “E respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [165]: “uma à outra, dizendo:—” → “uma à outra, dizendo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [167]: “levantando-se, diz:—” → “levantando-se, diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [170]: “na fronte, dizendo:—” → “na fronte, dizendo:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [172]: “E respondem:—” → “E respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [174]: “no tom do Evangelho:—” → “no tom do Evangelho:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [176]: “o povo participe do canto:—” → “o povo participe do canto:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [177]: “O diácono diz:—” → “O diácono diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [179]: “E a estas palavras:—” → “E a estas palavras:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [181]: “partir o corpo e diz:—” → “partir o corpo e diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [183]: “levantando a voz, diz:—” → “levantando a voz, diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [185]: “O povo diz:—” → “O povo diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [189]: “da cruz, e respondem:—” → “da cruz, e respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [191]: “XIX. E prossegue:—” → “XIX. E prossegue:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [193]: “Respondem:—” → “Respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [195]: “Prossegue:—” → “Prossegue:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [197]: “E dizem:—” → “E dizem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [201]: “levar o cálice, diz:—” → “levar o cálice, diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [203]: “O sacerdote diz:—” → “O sacerdote diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [205]: “O diácono diz:—” → “O diácono diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [217]: “o diácono diz:—” → “o diácono diz:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [219]: “E respondem:—” → “E respondem:” — Combinação de dois-pontos e travessão vedada pelas regras.
- `pt-BR/ch001.md` [223]: “diz esta oração: —” → “diz esta oração:” — Combinação de dois-pontos e travessão vedada pelas regras.
- Rejected: pt-BR/ch001.md [58] — A auditoria não encontrou a sequência literal “corno do altar”. — “O corno direito e o esquerdo do altar” preserva o termo e ambos os lados; confirma-se a rejeição registrada na rodada anterior.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of the 72 Round 2 fixes in ch001 and their neighbouring paragraphs: all fixes verified against the source, no new defects.
- Rejected: pt-BR/ch001.md [58] — Audit flag: 'corno do altar' has 0 literal occurrences — 'o corno direito e o esquerdo do altar' is the Key Terms form split around its adjectives; Rounds 1 and 2 already rejected this, and there is no new argument.
- Rejected: pt-BR/ch001.md [157] — 'parte em duas partes' repeats the root — The grammar is correct and the sense is clear. It renders 'breaks … into two parts' faithfully and is a style choice, not a defect.
- Rejected: pt-BR/ch001.md [35], [166] — 'sejam para nós para a propiciação' doubles 'para' — It mirrors the source's 'be to us for the propitiation'. The grammar is correct and it reads as liturgical style.
