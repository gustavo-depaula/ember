# Diário de Tradução — Das Obras Ocultas da Natureza (pt-BR)

Fonte canônica: `la/`, texto latino (edições Leonina / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (McAllister, revisado pelo Aquinas Institute), somente para terminologia e registro; a estrutura e o texto seguem o latim, conforme o precedente de *Do Ente e da Essência*.

## Termos-chave

O vocabulário escolástico segue as tabelas de `de-ente-et-essentia/pt-BR/` e `de-principiis-naturae/pt-BR/`.

| Latim | Português | Notas |
|---|---|---|
| opera / operationes / actiones occultae | obras / operações / ações ocultas | Cada termo latino com o seu correspondente; o título usa *opera* → “obras”. |
| virtus | virtude | Sentido de poder ou eficácia, como em *Das Sortes* e *Da Unidade do Intelecto*. |
| potentia | potência | |
| forma specifica / substantialis | forma específica / substancial | |
| forma artificialis / artificiata | forma artificial / artefatos | |
| corpora elementata | corpos compostos de elementos | Perífrase; “elementados” não é corrente em português. |
| corpora mixta | corpos mistos | *mixtio / commixtio* → mistura. |
| corpora caelestia | corpos celestes | |
| substantiae separatae | substâncias separadas | |
| agens superius / inferius | agente superior / inferior | |
| motio | moção | *motus* → movimento. |
| indita / impressa (virtus, forma) | posta / impressa | |
| quidditas | quididade | |
| passio / patiens / passivum | paixão / paciente | *suis passivis* → “aos seus pacientes”. |
| situs caelestium corporum | posição dos corpos celestes | |
| imagines nigromanticae | imagens nigromânticas | Como “nigromântico” em *Das Sortes*. |
| magnes | ímã | |
| rheubarbarum | ruibarbo | |
| empericae | empíricas | Grafia medieval de *empiricae*. |
| Platonici | os platônicos | |

## Decisões

- 2026-10-03: Tradução diretamente do latim, parágrafo por parágrafo (17 parágrafos e o subtítulo). Mantidos os dois espaços finais de linha que a fonte traz nos parágrafos.
- Título *De Occultis Operibus Naturae* → *Das Obras Ocultas da Natureza*, seguindo o padrão “Das …” de *Das Sortes*; subtítulo *ad quendam militem ultramontanum* → “a um cavaleiro ultramontano”.
- `vestra dilectio` → “vossa dileção”: forma de tratamento epistolar, tratamento em “vós” mantido.
- O latim diverge da referência inglesa em vários pontos (frase sobre as relíquias no 4º parágrafo; “corpos celestes” acrescentado no 10º; “coisas intermédias” no 13º, onde o latim lê *virtutes et actiones elementorum*). Seguido sempre o latim, sem importar o texto da tradução inglesa.
- *solum ex superiorum agentium motione* e semelhantes: “moção” para a ação de mover exercida pelo agente superior, distinta de “movimento”.
- Sem notas editoriais na fonte; nenhuma nota do tradutor acrescentada.
- `book.json`: entradas pt-BR acrescentadas a `name`, `author`, `description` (campo já existente) e ao título do sumário; `pt-BR` incluído em `languages`.

## Alterações na fonte

Nenhuma. *tales, operationes* (vírgula espúria, 5º parágrafo) é só pontuação e não afeta o sentido; deixado como está.

## Review log

### Round 1

Foco: completude parágrafo a parágrafo (alinhamento latim ↔ pt-BR, citações, parênteses, frases latinas, referências bíblicas), mais a auditoria mecânica e o `book.json`. Veredito: 1 defeito, corrigido.

Defeito corrigido:
- Diário, “Decisões”: “16 parágrafos e o subtítulo” → “17 parágrafos e o subtítulo”. Tanto `la/` como `pt-BR/` têm 17 parágrafos de corpo depois do subtítulo; a contagem estava errada.

Achados considerados e rejeitados:
- 12º parágrafo, *propter virtutes et actiones quas ab elementis participant* → “além das virtudes e ações”. *propter* (“por causa de”) não se lê bem aqui; o sentido exige *praeter* (“além de”), que é também a leitura da referência inglesa (“in addition to”). A tradução está correta. A fonte não foi alterada: pode ser uma variante da edição, e não um erro de OCR inequívoco.
- Subtítulo, *militem* → “cavaleiro”: *miles* em carta do século XIII designa o cavaleiro; escolha defensável.
- 6º parágrafo, *ad ultimum in quod aliquid potest* → “ao último a que algo pode chegar”: “chegar” só explicita o termo do *posse*, sem acrescentar conteúdo.
- 10º parágrafo, *Sed a substantiis separatis … invenitur … quod … procedunt* → “Mas das substâncias intelectuais separadas provém o que se encontra …”: “provém” supre o verbo elíptico exigido pelo paralelo com *provenit ex corpore caelesti* da frase anterior.
- O texto não tem referências bíblicas (a sombra de Pedro, no 3º parágrafo, é alusão a At 5,15 sem citação); não há nomes de livros nem números de capítulo e versículo para conferir.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-operationibus-occultis/review-1.md`.

### Round 2

Foco: leitura bilíngue oração por oração, latim ↔ pt-BR (negações, sujeito/objeto, tempo e modo, falsos cognatos, qualificadores), mais a auditoria mecânica e o `book.json`. Veredito: limpo, nenhuma alteração.

Achados considerados e rejeitados:
- 15º parágrafo, *ex caelestibus corporibus nullam formam consequerentur* → “não se seguiriam de forma alguma vinda dos corpos celestes”. “de forma alguma” lembra a locução “de modo nenhum”, mas “vinda dos corpos celestes” desfaz a ambiguidade e a frase diz o que o latim diz (não se seguiriam de nenhuma forma recebida dos corpos celestes). Não é defeito.
- 14º parágrafo, *praeter alia individua similis speciei* → “dos outros indivíduos da mesma espécie”: *similis speciei* aqui equivale a *eiusdem speciei* da frase seguinte; “mesma” dá o sentido.
- 11º parágrafo, *bonitas tactus* → “excelência do tato”: escolha defensável para *bonitas* nesse contexto.
- 7º parágrafo, *vel sicut frequenter* → “ou ao menos na maioria das vezes”: é o sentido escolástico de *ut frequenter* (*ut in pluribus*).

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-operationibus-occultis/review-2.md`.

### Round 3

Foco: leitura a frio do pt-BR sem a fonte (gramática, concordância, regência, antecedentes), conferência de cada marca com o latim, e varredura de ortografia, acentos, crase, hífen e pontuação; mais a auditoria mecânica e o `book.json`. Veredito: 1 defeito, corrigido.

Defeito corrigido:
- 3º parágrafo: “pela própria moção da lua, isto é, pela qual a água é movida pela lua” → “isto é, aquela pela qual a água é movida pela lua”. Depois de “isto é” a oração relativa ficava sem antecedente; “aquela” o supre. Latim: *per ipsam lunae motionem, qua scilicet aqua movetur a luna*; sentido inalterado.

Achados considerados e rejeitados:
- 14º parágrafo, “a virtude e a operação que se segue da espécie se encontre mais intensa”: verbo no singular com sujeito composto de termos quase sinônimos é concordância aceita, e espelha *virtus et operatio consequens speciem … inveniatur*.
- 16º parágrafo, “pelo fato de um corpo ter esta ou aquela figura, não tem idoneidade alguma”: sujeito implícito (o corpo) recuperável, como em *ex hoc quod aliquod corpus sic vel aliter figuratur, nullam idoneitatem … habet*.
- 10º parágrafo, “se reduzam mais além, como a princípios mais altos”, sem nomear os corpos celestes: o latim também não os nomeia (*ulterius reducantur, sicut in altiora principia*).
- 3º parágrafo, “que os enfermos fossem curados … ou que alguma doença seja expulsa”: a mudança de tempo espelha *sanarentur* / *pellatur*.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-operationibus-occultis/review-3.md`.

### Round 4

Foco: palavras funcionais (preposições, artigos, demonstrativos, conectivos, *seu/sua*), títulos e lugares em que o português precisa se comprometer onde o latim fica aberto (gênero do antecedente, tratamento em “vós”); mais a auditoria mecânica e o `book.json`. Veredito: limpo, nenhuma alteração.

Achados considerados e rejeitados:
- 4º parágrafo, *non omnes operationes … esse huiusmodi* → “não são dessa espécie”: “espécie” aparece no mesmo parágrafo como termo técnico (*eiusdem speciei*), mas aqui é a locução comum “desse tipo”; operações não são espécies, e não há leitura errada possível.
- 4º parágrafo, *operationes occultae in quibusdam inveniuntur corporibus, quae similiter conveniunt omnibus* → “as quais”: o feminino se compromete com as operações, e não com os corpos; é o que o argumento exige (o que é comum a toda a espécie é a operação, como em *omnis magnes attrahit ferrum*).
- 10º parágrafo, *a substantiis separatis …, quae … imprimunt formas apud se intellectas* → “as quais”: o feminino se compromete com as substâncias, e não com os princípios; *apud se intellectas* exige um intelecto.
- 11º parágrafo, *ex quibus … componuntur; quae quidem tanto sunt nobiliora* → “dos quais” (os elementos) / “estes” (os corpos): *nobiliora* é neutro plural e só concorda com *corpora*.
- 1º parágrafo, *super his* → “acerca delas” (as ações) e *Sunt autem quaedam huiusmodi corporum* → “algumas ações de tais corpos”: o contexto e o *huiusmodi actiones* seguinte fixam o referente.
- Tratamento: *vestra dilectio … vobis* → “vossa dileção … vos”, o único tratamento direto da carta; está coerente.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-operationibus-occultis/review-4.md`.

### Round 5

Foco: termos, diário e nomes — diferença de frequência por parágrafo contra a tabela de Termos-chave, nos dois sentidos; conferência de cada afirmação verificável do diário (linhas da tabela, contagens, números de parágrafo, afirmações sobre obras irmãs); nomes próprios contra a forma portuguesa corrente e as obras irmãs; mais a auditoria mecânica e o `book.json`. Veredito: limpo, nenhuma alteração.

Achados considerados e rejeitados:
- 1º parágrafo, *huiusmodi actiones et motus habent manifestam originem*: o latim repete *motus* como sujeito resumptivo de *Quaecumque … actiones et motus*; o pt-BR enuncia o sujeito uma vez (“Quaisquer ações e movimentos … têm uma origem manifesta”). Nada se perde.
- 12º parágrafo, *qualitates activae et passivae* → “passivas”, e não “pacientes”: é o adjetivo, não o substantivo *passivum* da linha “passio / patiens / passivum” da tabela, que vale para *suis passivis* (5º parágrafo).

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-operationibus-occultis/review-5.md`.
