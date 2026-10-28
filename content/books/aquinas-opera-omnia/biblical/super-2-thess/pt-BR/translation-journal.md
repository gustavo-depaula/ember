# Diário de Tradução — Comentário à Segunda Epístola aos Tessalonicenses (pt-BR)

Fonte canônica: `la/` (texto Leonino / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (Larcher, revisado pelo Aquinas Institute), só para registro e terminologia; estrutura e texto seguem o latim, conforme o precedente de *Do Ente e da Essência* e do *Comentário a Filêmon*.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| Pr. / C. N / Lectio N | Pr. / C. N / Lição N | Abreviaturas do cabeçalho mantidas (servem também ao português); "Lição" como em *Filêmon* e na *Catena Aurea sobre Marcos*. |
| salutatio / epistolaris narratio | saudação / narração epistolar | Como em *Filêmon*. |
| ibi (divisão do texto) | onde diz | |
| et cetera | etc. | |
| id est / scilicet / quasi dicat | isto é / a saber / como se dissesse | |
| Apostolus / Glossa | o Apóstolo / a Glosa | |
| caritas / amor | caridade / amor | O substantivo latino efetivamente usado para "amor" é *amor* (n. 28, 46 e 61); *dilectio* não ocorre nos capítulos. Conforme as obras irmãs. *Caritas veritatis* (2, 10) → "a caridade da verdade", porque o n. 53 argumenta sobre a caridade que forma a fé. |
| Antichristus | o Anticristo | |
| discessio / discedere | separação / separar-se | Uma só palavra para as duas leituras do n. 34 (da fé e do Império Romano); também *ne discedat a fide* (n. 11) → "para que não se separe da fé". |
| homo peccati / filius perditionis | homem do pecado / filho da perdição | |
| qui tenet … teneat / detinere | aquele que retém … retenha / deter | As três exposições do n. 45 (Império, vinda do Anticristo, fé) cabem em "reter". |
| de medio fiat | saia do meio | Serve a todas as glosas do n. 45. |
| adventus | vinda | |
| poenas dabunt | pagarão penas | Glosa *dabunt, id est, sustinebunt* → "pagarão, isto é, sofrerão". |
| interitus | destruição | |
| poena sensus / damni | pena de sentido / de dano | Terminologia escolástica corrente. |
| virtus (de Deus, dos anjos; 1, 11) | poder | "Anjos do seu poder"; *in virtute* → "com poder", glosado "com constância e fortaleza". *Virtus* moral continua "virtude". |
| in quo (1, 11) | em vista disso | A glosa lê *propter quem diem*. |
| clarificare | glorificar | |
| confusio / confundi | confusão / ser confundido | Sentido bíblico de vergonha; une 3, 14 com Eclo 4, 25. |
| denuntiare | intimar | |
| inquietus / inquietudo | inquieto / inquietação | |
| curiose agentes | agindo com curiosidade | |
| state (2, 15) | permanecei firmes | |
| traditio / documenta | tradição / ensinamentos | |
| praelatus / curati | prelado / os que têm cura de almas | |
| praesciti | precitos | |
| arreptitius | possesso | |
| praestigia | prestígios | Sentido antigo de ilusão diabólica. |
| simpliciter | absolutamente | Conforme as obras irmãs. |
| Sylvanus, Linus, Caius Caesar, Leo Papa, beatus Martinus, Simon magus, Iulianus, Michael, Dionysius | Silvano, Lino, Caio César, o papa Leão, o bem-aventurado Martinho, Simão Mago, Juliano, Miguel, Dionísio | |

## Decisões

- `book.json`: "Santo Tomás de Aquino" como autor, como nas obras irmãs; pt-BR acrescentado a `name`, `author`, `description` (o campo já existia), `languages` e aos títulos do sumário. Os títulos seguem os cabeçalhos dos arquivos, que o `la/` traz em inglês (`C. 1 - Hope for the Final Judgment`); o pt-BR os traduz, com a referência bíblica no estilo português.
- Referências bíblicas com abreviaturas portuguesas e "capítulo, versículo" (`Mt 24, 45`), como em *Filêmon*. Numeração e nomes da Vulgata mantidos (Sl 72, 1 Rs = *I Reg.*, 3 Rs = *III Reg.*, Eclo, Ecl). `ult.` → "No último capítulo de …"; citações sem capítulo (*Iac.:*) ou sem versículo (*Eccli. IX:*) ficam como estão. Citações erradas da edição são espelhadas, não corrigidas pelo inglês: Fm 5, 8 (n. 28), Jo 3 para "Satanás entrou nele" (n. 48), Eclo 9 (n. 22), Fl 1 (n. 24), Ez 33, 29 para "a ociosidade ensinou muita malícia" (n. 81), 1 Rs 13, 23 (n. 24).
- Citações bíblicas traduzidas da redação latina do texto, sem harmonizar com outra Bíblia; em itálico, sem aspas, como no latim. Os lemas das glosas seguem o latim mesmo quando diferem do versículo (n. 10 *ita quod ego glorior inde apud alios*; n. 28 *in idipsum* contra *in ipsum*; n. 68 *corda nostra*; n. 75 *sed ut vos*; n. 87 *invicem*).
- n. 7: o latim diz *primo pacem* e depois *pacem, quae est finis*, embora a primeira citação (1 Cor 15, 10) seja sobre a graça; o en-US também traz "peace" primeiro. A edição traz isto; espelhado sem correção.
- Estrutura espelhada linha a linha: marcadores `^c:v^`, blockquotes irregulares, as linhas "Lição 2" / "Lição 3" sem ênfase, a linha `***^2:6^ …***`, o 2, 10 repetido no início da Lição 3, os "E" pendentes antes das divisões, as marcas `[n. N]` e os números de parágrafo no formato da fonte (`**3**.`). Os segmentos de ênfase quebrados da fonte (n. 57 `***elegit* **nos … et** *vos***`; n. 85 `***… per epistolam* **vestram,** *hunc notate***`) foram reproduzidos tal como estão, como no en-US.
- Duas etimologias latinas mantidas entre parênteses e em itálico, porque o argumento depende da palavra: *tribuli* (n. 11) e *procul a digito* (n. 49).
- n. 18, *Sensus enim alicuius evacuatur*: vertido literalmente ("o sentido de alguém é anulado"), sem interpretar.
- Nenhuma nota de editor na fonte; nenhuma nota do tradutor acrescentada. Nenhuma edição no texto-fonte.

## Review log

### Round 1

- Foco: completude por parágrafo, citações, expressões latinas e referências bíblicas, confrontadas com `la/`. Veredito: **ISSUES 3**, corrigidos.
- `2thess-c01.md` [7], n. 2: “que as reúnem” → “que os reúnem”; *eos* retoma as pessoas, não as vontades.
- `2thess-c03.md` [57], n. 39: “dura cerviz” → “grossa cerviz”; *pingui cervice* descreve espessura/gordura, não dureza; conservada a imagem da citação de Jó.
- `2thess-c03.md` [72], n. 42: “o conhecimento desta causa” → “a causa deste conhecimento”; *huius scientiae causam* tem *causam* como objeto. O n. 43 dá a causa: *quia ego dixi vobis*.
- Rejeitados os alertas de parênteses/ênfase em c02 [31] (*dicuntur a tribulis*) e c03 [97] (*quasi procul a digito*): os parênteses conservam os termos das etimologias junto à tradução, conforme a decisão anterior, sem acrescentar argumento.
- Rejeitado o alerta “latim” → “português”: “Latim | Português” são cabeçalhos da tabela, não termos a localizar nos capítulos.
- Rejeitada a suspeita de falso cognato em c04 [87]/[89], n. 85: *Manifestatio et convictio* / *debet tamen esse convictus* → “manifestação e a convicção” / “deve, todavia, estar convicto”. Os sentidos probatório e jurídico dessas palavras portuguesas são defensáveis no contexto de investigação da verdade; explicitação seria escolha de clareza.
- Rejeitadas as suspeitas de concordância em c04 [91] (*Finis autem et intentio debet esse*) e c02 [47] (*prima littera et expositio est melior*): “fim e intenção” e “versão e exposição” podem designar uma unidade semântica; o singular é defensável, não defeito objetivo.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-1.md` (numeração [n] das cópias de leitura).

### Round 2

- Foco: leitura bilíngue, oração por oração, contra `la/`. Veredito: **ISSUES 3**, corrigidos.
- `2thess-c02.md` [64], n. 20: “Recomenda a glória dos santos” → “Enaltece a glória dos santos”. *Commendat* aqui significa louvar, e não aconselhar (cf. [27], *commendavit* → “elogiou”). O português “recomendar” é falso cognato nesse sentido.
- `2thess-c04.md` [40], n. 70: Rm 13, 1 *as coisas que existem* → *todas as coisas que existem*. Faltava o *omnia* de *omnia quae sunt, a Deo ordinata sunt*.
- `2thess-c04.md` [48], n. 73: 2 Cor 12, 13 “menos que as outras igrejas” → “menos que os demais”. A fonte traz só *prae caeteris*; “igrejas” vinha do texto da Vulgata (*caeteris ecclesiis*).
- Rejeitado: Sl 147, 14 / 147, 3 *qui posuit fines tuos pacem* → “que pôs a paz nas tuas fronteiras” (c02 [16], n. 7; c04 [99], n. 89). Perde-se o jogo *fines*/*finis* do n. 7, mas “fronteiras” é sentido correto de *fines*. Trocar por “fins” deformaria o versículo.
- Rejeitado: 3 Jo 4 *maiorem horum non habeo gratiam, quam ut audiam* → “não tenho maior graça do que ouvir” (c02 [27]). *Horum* é redundante ao lado de *quam ut*, e o sentido fica intacto.
- Rejeitado: Sb 5, 2 *in subitatione* → “do súbito” (c02 [66]). “Súbito” é também substantivo (“acontecimento repentino”).
- Rejeitado: *Et hoc operemini in virtute* → “E isto o realizeis com poder” (c02 [81]). É subjuntivo optativo sem “que”, raro mas gramatical em registro elevado.
- Rejeitado: *qui tenet nunc, Romanum imperium, teneat* → “aquele que agora retém o Império Romano retenha” (c03 [78], n. 45). O latim admite aposto ou objeto, e ler como objeto convém à exposição sobre Nero.
- Os alertas mecânicos de parênteses/ênfase (c02 [31], c03 [97]) e “latim”→“português” foram rejeitados pelas razões do Round 1.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-2.md`.

### Round 3

- Foco: leitura integral do português sem a fonte, seguida de verificação no latim e varredura de ortografia, diacríticos, crase, hífen e pontuação. Veredito: **ISSUES 2**, corrigidos.
- `2thess-c03.md` [60], n. 40: “o Anticristo lhes faça” → “o Anticristo lhes faça o mesmo”. *Quod sic eis faciet Antichristus*: faltava verter *sic*, que retoma a conduta descrita; “lhes” sozinho não exprime o que ele fará.
- `2thess-c04.md` [80], n. 83: “mesmo que trabalhem com as mãos e nada lhes faltasse” → “mesmo que trabalhem com as mãos e nada lhes falte”. *Etiam si operentur manibus, et non deesset illis aliquid*: as duas condições pertencem à mesma hipótese; a alternância presente/imperfeito copiada do latim quebra a correlação verbal portuguesa.
- Rejeitado: c03 [79], n. 45, “a saída e a entrada, que agora retém […] retenha”; *ut discessus et accessus qui nunc tenet […] teneat*. O par pode designar conjuntamente o processo de afastamento e ingresso na fé que retarda a vinda; o singular por unidade de sentido é defensável. Não se alterou o lema citado.
- Rejeitado: c04 [10], “todo irmão […] a tradição que receberam”; *ab omni fratre […] traditionem, quam acceperunt*. O plural retoma pelo sentido o conjunto dos irmãos; a passagem do singular distributivo ao plural já está na fonte.
- Rejeitado: c02 [60], n. 18, “o sentido de alguém é anulado”; *Sensus enim alicuius evacuatur*. A dificuldade já está no latim, conforme a decisão inicial; substituir por “sentença” pressuporia outra leitura da fonte.
- Rejeitado: c02 [82], n. 24, “quando aquilo que aqui vemos […] então o virmos face a face”; *quando id quod hic […] videmus, videbimus tunc facie ad faciem*. “Aquilo” é objeto antecipado, retomado por “o”; “virmos” é futuro do subjuntivo de “ver”. Não há oração sem verbo nem erro de flexão.
- Rejeitados novamente os alertas c02 [31], *dicuntur a tribulis* → “chamam-se assim por causa dos abrolhos (*tribuli*)”, e c03 [97], *quasi procul a digito* → “como que apontado de longe com o dedo (*procul a digito*)”: parênteses e itálicos identificam o vocábulo de cada etimologia, sem conteúdo estranho à fonte.
- Rejeitado o alerta “latim” → “português”: a linha “Latim | Português” é o cabeçalho das colunas, não um par de termos dos capítulos.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-3.md`.

### Round 4

- Foco: palavras funcionais, cabeçalhos e escolhas forçadas (gênero, antecedente, possessivo *seu/sua*, tu/vós). Veredito: **ISSUES 7**, corrigidos.
- `2thess-c01.md` [5], Sl 72: “por causa dos seus enganos os puseste” → “por causa dos seus enganos, isso lhes puseste”. *Posuisti eis* tem *eis* no dativo; “os” fazia dele objeto direto.
- `2thess-c02.md` [29], n. 10, 2 Cor 9, 2: *pela qual* → *pelo que*. *Pro quo* é masculino/neutro; o feminino não tinha antecedente.
- `2thess-c02.md` [32], n. 11: “suportada por Deus” → “suportada por causa de Deus”. Depois de particípio passivo, “por Deus” lê-se como agente; *pro Deo* quer dizer “por causa de Deus”.
- `2thess-c02.md` [42], n. 12: “tratou da sua idoneidade” → “tratou da idoneidade deles”. *Eorum*: o “sua” remetia ao Apóstolo, sujeito da frase.
- `2thess-c03.md` [62], n. 40: “isto é, governe e domine” → “isto é, governa e domina”. A glosa precisa do mesmo modo verbal do lema português (“se assenta”).
- `2thess-c04.md` [39], n. 70: “pela sua companhia” → “pela companhia deles”. *Ex eorum consortio*: o “sua” remetia aos mais fracos.
- `2thess-c04.md` [101], n. 91: “deturpavam as suas epístolas” → “deturpavam as epístolas dele”. *Epistolas eius*: o “suas” remetia aos infiéis.
- Rejeitado: c02 [81], n. 24, *a confessione eius* → “confessá-lo”. *Eius* pode remeter a Cristo/Deus tanto quanto a *fidei*; o en-US lê “confessing him”.
- Rejeitado: c03 [33], n. 32, *praetendit se esse Christum* → “pretende ser o Cristo”. “Pretender” também significa “alegar ser”.
- Rejeitado: c03 [139], Is 40, 1, *consolamini* → “consolai”. *Consolor* é depoente de sentido ativo.
- Rejeitado: c03 [43]/[87]/[115], “a sua culpa”, “o seu poder”. O antecedente (o Anticristo, os enganados) é o tema dos blocos imediatamente anteriores; o contexto desfaz a ambiguidade.
- Rejeitado: c03 [136], *cum venero* → “quando eu for”. É a dêixis portuguesa para quem vai ao destinatário. A citação 1 Cor 10 é da edição e fica espelhada.
- Alertas mecânicos c02 [31], c03 [97] e “latim”→“português”: rejeitados pelas razões dos Rounds 1–3.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-4.md`.

### Round 5

- Foco: leitura integral contra `la/`, frequência dos termos por parágrafo nos dois sentidos, afirmações do diário e nomes próprios. Veredito: **ISSUES 3**, corrigidos.
- `2thess-c02.md` [31], n. 11: “para que não se afaste da fé” → “para que não se separe da fé”; *ne discedat a fide* estava fora da equivalência *discedere* → “separar-se” estabelecida na tabela. A tabela agora explicita também esta ocorrência.
- Termos-chave, linha de “caridade / amor”: *caritas / dilectio* → *caritas / amor*. Em c03 [22]/[83]/[138], o português “amor” corresponde a *amore*/*amor* (quatro ocorrências), não a *dilectio*, ausente dos capítulos. Corrigida a identificação do termo-fonte, sem alteração dessas traduções.
- Decisões, referências: “citações sem capítulo (*Iac.:*, *Eccli. IX:*)” → “citações sem capítulo (*Iac.:*) ou sem versículo (*Eccli. IX:*)”. Em c02 [71], n. 22, *Eccli. IX: plurima super sensum hominis* → “Eclo 9: muitíssimas coisas acima do sentido do homem”: IX já informa o capítulo.
- Rejeitado: diferenças de frequência por polissemia, flexão ou expressões fora do escopo da tabela. *Ibi* locativo (c03 [22]/[47], c04 [51]/[99]) corresponde a “ali”/“lá”; *in quo* fora de 1, 11 (c03 [61]/[94], c04 [47]/[91]) corresponde a “em que”/“no qual”/“nisto”. Em c04 [76], *caritative* → “caritativamente” é derivação regular; c04 [89], *significate nobis* → “dai-nos a saber” não é ocorrência de *scilicet*. Em c03 [37], *ad hoc, quod* → “para isto: que” tampouco é *id est*. Os demais aparentes excedentes de “isto é” são encontros de demonstrativo e verbo, não a locução explicativa.
- Rejeitado: exclusividade mecânica de “poder” e “glorificar”. C02 [52]/[60], c03 [37]/[42]/[77]/[85]/[87]/[90]/[93]/[95]/[99] e c04 [13]/[50] também trazem *potestas*, *potentia* ou *posse*; c02 [32]/[39]/[64]/[65]/[73]/[83] traz *glorificare*/*conglorificare*. A tabela não torna esses equivalentes portugueses exclusivos de *virtus* e *clarificare*. C02 [28], *virtus est maxima* → “está a máxima força”, e c03 [76], *virtutem autem eius* → “a sua força”, exprimem força/eficácia, fora do sentido moral indicado na nota.
- Rejeitado: c02 [59], *separabuntur* → “serão separados”, e c03 [79], *separetur* → “seja separada”, não são desvios de *discedere*. C03 [79], *discessus et accessus* → “a saída e a entrada”, conserva o par próprio desse trecho. A nota sobre três exposições em n. 45 refere-se às três leituras de *qui tenet … teneat* (c03 [78]/[79]); a exposição adicional de [80] usa *detinet, detineat* → “detém, detenha”, portanto não invalida a nota sobre “reter”.
- Rejeitado: c04 [65], *de Operibus monachorum* → “Do trabalho dos monges”. A obra irmã de Agostinho intitula-se “Sobre o Trabalho dos Monges”; “Do” e “Sobre o” exprimem aqui o mesmo *de*, sem troca de obra ou erro de nome.
- Rejeitados os alertas de c02 [31], *dicuntur a tribulis* → “chamam-se assim por causa dos abrolhos (*tribuli*)”, e c03 [97], *quasi procul a digito* → “como que apontado de longe com o dedo (*procul a digito*)”: parênteses e itálicos conservam as etimologias já documentadas. “Latim | Português” é cabeçalho, não par terminológico.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-5.md`.

### Round 6

- Foco: completude parágrafo a parágrafo contra `la/`, citações, nomes bíblicos e numeração capítulo:versículo. Veredito: **CLEAN**; nenhum defeito, nada alterado nos capítulos.
- Rejeitado: c04 [14], n. 63, *de futuris in novissimis* → “coisas futuras nos últimos tempos”. O latim omite o substantivo; “tempos” e “dias” são complementos igualmente possíveis, com o mesmo sentido.
- Rejeitado: c03 [9], 2, 5, *Non retinetis* → “Não vos recordais”. *Retinere* aqui é guardar na memória; o n. 41 o glosa como “dizer outrora”.
- Rejeitado: c03 [126], n. 57, *quod, pro quia* → “porque, no sentido de *visto que*”. O lema usa “porque”; a glosa em itálico é causal, como *quia*.
- Alertas mecânicos c02 [31], c03 [97] e “latim”→“português”: rejeitados pelas razões dos Rounds 1–5.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-6.md`.

### Round 7

- Foco: leitura bilíngue integral, oração por oração, contra `la/`. Veredito: **ISSUES 4**, corrigidos.
- `2thess-c03.md` [120], n. 53, Rm 5, 1: “por nosso Senhor” → “pelo Senhor”. A fonte traz *per Dominum*, sem possessivo; retirado “nosso”, acrescentado à citação.
- `2thess-c04.md` [55], cabeçalho da Lição 2: “Fugi dos inquietos” → “Fugi, inquietos”. Em *Fugite inquieti*, *inquieti* é vocativo plural, dirigindo a ordem aos inquietos; não é o acusativo *inquietos* exigido para torná-los objeto de *fugite*. Mantida a redação da fonte, apesar da expectativa criada pelo assunto da lição.
- `2thess-c04.md` [58], 3, 12: “intimamos e rogamos” → “intimemos e rogamos”. A fonte tem *denuntiemus, et obsecramus*: o primeiro verbo está no subjuntivo exortativo, o segundo no indicativo. Preservada essa diferença, sem harmonizar *denuntiemus* com o *denuntiamus* do comentário em [76].
- Diário, Round 6: “c02 [126], n. 57” → “c03 [126], n. 57”. A discussão de *quod, pro quia* pertence a `2thess-c03.md`, não a c02; o juízo sobre a tradução permanece.
- Rejeitado: c02 [31], *dicuntur a tribulis* → “chamam-se assim por causa dos abrolhos (*tribuli*)”, e c03 [97], *quasi procul a digito* → “como que apontado de longe com o dedo (*procul a digito*)”. Os parênteses e itálicos adicionais conservam as palavras das etimologias; não acrescentam argumento, conforme as decisões anteriores.
- Rejeitado: alerta “latim” → “português”; “Latim | Português” é cabeçalho da tabela, não equivalência lexical exigida nos capítulos.
- Rejeitado: c03 [119], *recipere caritatis veritatem* → “receber a verdade da caridade”, seguido de *caritatem veritatis* → “a caridade da verdade”. A inversão já pertence à fonte; harmonizá-la eliminaria uma diferença efetiva do latim.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-7.md`.

### Round 8

- Foco: leitura fria do português sem a fonte, verificação das marcas no latim e varredura de ortografia, diacríticos, crase, hífen e pontuação. Veredito: **CLEAN**; nenhum defeito, nada alterado nos capítulos.
- Rejeitado: c02 [32], Jr 49, 12, “para os quais não havia juízo de beberem o cálice”; *quibus non erat iudicium, ut biberent calicem*. Construção gramatical (infinitivo pessoal), que segue a oração latina.
- Rejeitado: c03 [95], n. 49, *per virtutem miraculorum* → “pela virtude dos milagres”. A linha “virtus → poder” da tabela vale para Deus e os anjos (1, 11); “virtude” no sentido de poder de operar milagres é português correto, e [96] traz *in omni virtute* → “com todo poder”.
- Rejeitado: c03 [78], n. 45, “naquele mesmo ano em que o Apóstolo.”; a elipse está em *illo scilicet anno quo Apostolus*.
- Alertas mecânicos c02 [31], c03 [97] e “latim”→“português”: rejeitados pelas razões dos Rounds 1–7.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-8.md`.


### Round 9

- Foco: leitura integral dos quatro pares contra `la/`, palavras funcionais, cabeçalhos, antecedentes e escolhas de gênero/tratamento. Veredito: **ISSUES 2**, corrigidos no diário; capítulos e Termos-chave inalterados.
- Diário, Round 8, discussão de *per virtutem miraculorum*: “c02 [95], n. 49” → “c03 [95], n. 49”. A passagem pertence ao capítulo sobre o Anticristo; c02 termina em [84].
- Diário, Round 8, discussão de *illo scilicet anno quo Apostolus*: “c02 [78], n. 45” → “c03 [78], n. 45”. A elipse sobre a morte de Nero pertence a c03; c02 [78] trata do pedido da oração. Os dois juízos anteriores permanecem válidos.
- Rejeitado: c02 [31], *ne discedat a fide* → “para que não se separe da fé”. O sujeito humano genérico está implícito também no latim; a proximidade de “paciência” não obriga a tomá-la como sujeito.
- Rejeitado: c02 [51], *sicut gloria Lini ad suam* → “assim como a glória de Lino para a sua”. “Sua” permite recuperar “graça”, explicitada no primeiro membro da proporção; o latim também deixa o nome elíptico.
- Rejeitado: c02 [81], *a confessione eius* → “confessá-lo”. O masculino seleciona Deus/Cristo, leitura contextual defensável já aceita no Round 4; não é obrigatório tomar *fidei* como antecedente.
- Rejeitado: c03 [66]/[74], *quid detineat* → “o que o detém”. O objeto suprido é o Anticristo, cuja revelação se discute; não impõe identidade àquilo que o detém. C03 [114], *ab eo liberentur* → “são libertados dele”, admite o engano ou o Anticristo; ambos são masculinos em português, sem escolha indevida.
- Rejeitado: c03 [139], *consolamini, consolamini, popule meus* → “consolai, consolai, meu povo”. O plural verbal e o vocativo coletivo já estão na fonte; preservado o valor ativo do depoente, conforme o Round 4. C04 [55], *Fugite inquieti* → “Fugi, inquietos”, conserva o vocativo e o destinatário plural corrigidos no Round 7.
- Rejeitados os alertas: c02 [31], *dicuntur a tribulis* → “chamam-se assim por causa dos abrolhos (*tribuli*)”; c03 [97], *quasi procul a digito* → “como que apontado de longe com o dedo (*procul a digito*)”. Os parênteses/itálicos conservam as etimologias, conforme a decisão inicial. “Latim | Português” é cabeçalho da tabela, não termo de capítulo.
- Evidência e inventário das escolhas de referente/tratamento: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-9.md`.

### Round 10

- Foco: termos, diário e nomes. Frequência de cada termo-chave nos dois sentidos, afirmações do diário confrontadas com os capítulos, nomes próprios e títulos conferidos com as obras irmãs. Veredito: **CLEAN**; nenhum defeito, capítulos e Termos-chave inalterados.
- Confirmado por contagem: *caritas* (27 no latim: c02 6, c03 9, c04 12) = “caridade/caritativamente” (27 no português); *amor/amore* ×4 = “amor” ×4 (c03 [22], [83] ×2, [138]); *dilectio* ausente. As linhas da tabela e as referências de parágrafo do diário (n. 28, 46, 61, etc.) conferem.
- Rejeitado: c03 [63], 2 Cor 10, 11 *tales et praesentes in facto* → “tais também, estando presentes, seremos de fato”. O verbo é suprido por elipse, que já existe no latim; escolha de estilo.
- Rejeitado: c04 [53], “A quarta causa”. A fonte diz *Quarta causa* depois de “dupla causa” e de “Outra causa”; a numeração é da edição e fica espelhada.
- Rejeitado: c02 [64], “tanto quanto à essência … como quanto ao seu excesso” (*et quantum ad essentiam … et quantum ad eius excessum*). A correlação é gramatical.
- Rejeitados os alertas mecânicos c02 [31], c03 [97] e “latim”→“português”, pelas razões dos Rounds 1–9.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-10.md`.


### Round 11

- Foco: completude parágrafo a parágrafo contra `la/`, citações, expressões e referências bíblicas. Veredito: **CLEAN**; nenhum defeito confirmado, capítulos e Termos-chave inalterados.
- Rejeitados os alertas de parênteses/ênfase: c02 [31], *dicuntur a tribulis* → “chamam-se assim por causa dos abrolhos (*tribuli*)”; c03 [97], *quasi procul a digito* → “como que apontado de longe com o dedo (*procul a digito*)”. Os termos preservam as etimologias junto à tradução, sem acrescentar argumento.
- Rejeitado o alerta “latim” → “português”: “Latim | Português” é cabeçalho da tabela, não equivalência lexical dos capítulos.
- Rejeitada aparente duplicação em c03 [70]/[104]: *et in omni seductione iniquitatis iis qui pereunt* → “e com toda sedução da iniquidade para os que perecem”. O versículo 2, 10 aparece nas duas posições também na fonte, na transição das lições.
- Rejeitada aparente omissão em c04 [95]: *Iterum prima in duas, quia eis* → “Por sua vez, a primeira divide-se em duas, porque”. O dativo *eis* está expresso pelo “-lhes” de “primeiro deseja-lhes os dons de Deus” em [96] (*primo optat dona Dei*), na continuação da mesma frase; não há perda de conteúdo nem fusão de parágrafos.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-2-thess/review-11.md`.
