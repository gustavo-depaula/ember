# Diário de Tradução — Comentário a Filêmon (pt-BR)

Fonte canônica: `la/` (texto Leonino / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (Aquinas Institute), só para registro e terminologia; estrutura e texto seguem o latim, conforme o precedente de *Do Ente e da Essência*.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| Prooemium / Lectio N | Prólogo / Lição N | Como na *Catena Aurea sobre Marcos*. |
| servus / dominus | servo / senhor; dono | Mantido "servo" (não "escravo") para preservar o vínculo com Eclo 33, 31 e o uso escolástico. Para dominus, "dono" no n. 22, ao tratar do uso de coisa alheia. |
| vinctus / vincula | prisioneiro; preso / cadeias | Vinctus: "prisioneiro" no lema; "preso" nas duas predicações do n. 4. |
| viscera | entranhas | Mantém o elo com *viscera misericordiae* (Cl 3, 12). |
| commilito | companheiro de milícia | Para ligar com *spirituales milites* e *arma militiae nostrae*. |
| adiutor | auxiliador | |
| socius | companheiro | |
| frui / uti / fruitio | fruir / usar / fruição | O n. 28 argumenta sobre o verbo; "fruir de" em todo o capítulo, também no versículo 1, 20. |
| reficere | restaurar | Versículo e glosa iguais. |
| caritas / dilectio; amor | caridade / amor | Conforme as obras irmãs. "Amor" também traduz amor nas duas ocorrências do n. 24. |
| simpliciter | absolutamente | Conforme *Da Perfeição da Vida Espiritual*. |
| praelatus / subditus | prelado / súdito | |
| communicatio fidei | comunicação da fé | |
| ibi (divisão do texto) | onde diz | |
| et cetera | etc. | |
| Apostolus | o Apóstolo | |
| Tullius / Origenes / Chrysostomus / Augustinus | Túlio / Orígenes / Crisóstomo / Agostinho | "Túlio" como no latim, não "Cícero" do inglês. |
| Philemon, Appia, Archippus, Onesimus, Epaphras | Filêmon, Ápia, Arquipo, Onésimo, Epafras | |

## Decisões

- Autor nos metadados: "Santo Tomás de Aquino", como nas obras irmãs. `description` já existia em `book.json`: recebeu a entrada pt-BR; pt-BR acrescentado a `languages` e aos títulos do sumário.
- Títulos do sumário: o pt-BR segue o padrão do en-US ("Lição 1 — Saudação"), traduzindo os subtítulos latinos do corpo (*Salutatio*, *Libertas Onesimi*); o prólogo leva a referência do Eclesiástico, como o en-US.
- Referências bíblicas com abreviaturas portuguesas, algarismos arábicos e "capítulo, versículo" (`Mt 24, 45`), como nas obras irmãs. Numeração e nomes da Vulgata mantidos: Sl 93 (*Ps. XCIII*), 1 Rs (*I Reg.*), Eclo (*Eccli.*), Ecl (*Eccle.*), Tb. `ult.` → "último capítulo de …"; `cap. unico` → "capítulo único"; `27 s.` → "27s". Referências não completadas com dados do inglês.
- Citações bíblicas traduzidas da redação latina do texto, sem harmonizar com outra Bíblia; em itálico, sem aspas, como no latim. Versículos do lema traduzidos da Vulgata do arquivo; as glosas conservam a terminologia correspondente, mas seguem as abreviações, variantes e adaptações sintáticas do próprio latim. Por exemplo, em 1, 20 lê-se "no Senhor", mas no fim do n. 28, "em Cristo" (in Domino / in Christo).
- Estrutura espelhada linha a linha: marcadores `^c:v^`, blockquotes irregulares, a linha `***^1:10^ …***`, os "E" pendentes no fim de parágrafo antes das divisões, e as marcas `[n. N]`. Números de parágrafo no formato da fonte (`**3**.`).
- O lema das glosas às vezes difere do versículo (n. 19 *tu ergo illum* vs. *tu autem illum*; n. 30 *salutant* vs. *salutat*; n. 26 *sicut et me*): espelhado como no latim.
- n. 29, *probatio aliorum*: vertido literalmente "a provação dos outros"; o en-US também lê *proof*.
- n. 30, `demas` minúsculo na fonte: grafado "Demas"; a fonte não foi alterada.
- Nenhuma nota de editor na fonte; nenhuma nota do tradutor acrescentada. Nenhuma edição no texto-fonte.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo, citações, parentéticos, nomes bíblicos e referências, contra `la/`; leitura integral individual. Veredito: 1 defeito confirmado e corrigido.
- Corrigido — `ch002.md`, [44] das cópias de leitura, n. 24: “porque tudo o que lhe pertencia carnalmente era seu” → “porque tudo o que ele era segundo a carne pertencia a Filêmon”. O latim “quia secundum eam erat servus eius, quia hoc totum quod erat ei carnaliter, erat suum” explica a sujeição corporal de Onésimo, não a propriedade dos seus pertences.
- Rejeitado — `ch001.md` [44], n. 13, alerta de ênfase: “sed ***quod ad rem***, scilicet tuam, ***pertinet***, vel communem” → “mas ***o que diz respeito à questão***, a saber, à tua, ou à comum”. A ordem portuguesa reúne os dois segmentos do lema; a explicação permanece e todo o lema continua enfatizado. A diferença de marcadores não implica omissão.
- Rejeitado — `ch002.md` [57], n. 29: “I Reg. XV, 22” → “1 Rs 15, 22”. Conserva o nome da Vulgata prescrito neste diário; mudar para 1 Sm harmonizaria com a nomenclatura moderna, sem fundamento na fonte canônica.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-philemonem/review-1.md`.

### Round 2

- Foco: leitura bilíngue oração por oração contra `la/`, em todo o texto. Veredito: 2 defeitos confirmados e corrigidos.
- Corrigido — `ch001.md`, versículo 1, 9: “pela caridade antes te rogo” → “pela caridade antes rogo”. O latim *propter caritatem magis obsecro* não tem objeto (o *te* só aparece em 1, 10); a glosa do n. 13 já dizia “antes rogo”, e este diário afirma redação idêntica entre lema e glosa.
- Corrigido — `ch002.md`, n. 30: “e esta foi anterior à última a Timóteo” → “e esta epístola foi anterior à última a Timóteo”. No latim *haec* é a epístola a Filêmon (*haec epistola* do início do parágrafo); em português “esta”, logo após “a epístola aos Romanos”, lia-se como Romanos.
- Rejeitado — prólogo, Eclo 33, 31: *in sanguine animae comparasti illum* → “com o sangue da tua alma”. O possessivo latino omitido é o óbvio; a leitura não muda.
- Rejeitado — prólogo, n. 2: *qualiter spirituales praelati habeant se ad subditos* → “de que modo … devem haver-se”. *Supra* remete às pastorais, que prescrevem a conduta dos prelados; a leitura normativa é defensável.
- Rejeitado — `ch002.md`, n. 20: *quia posset dicere* → “pois Filêmon poderia dizer”. O sujeito latino fica implícito e a objeção (*quare non retines eum*) cabe a Filêmon; escolha interpretativa defensável.
- Rejeitado — `ch002.md`, n. 26: *societatem habemus ad invicem* (1 Jo 1, 7) → “temos comunhão”. A tabela fixa *socius*, não *societas*; “comunhão” é a versão corrente e o argumento continua legível.
- Rejeitado — `ch002.md`, n. 15 e 18: lema *tu autem illum* → “tu, porém, recebe-o”. O verbo vem do versículo, e o português precisa dele para pôr o clítico; o lema continua localizável.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-philemonem/review-2.md`.

### Round 3

- Foco: leitura integral do português sem a fonte, seguida da verificação dos pontos suspeitos no latim e de uma passada exclusiva de grafia, diacríticos, crase, hifenização e pontuação. Veredito: nenhum defeito confirmado; capítulos e termos-chave inalterados.
- Rejeitado — `prologue.md` [5]: “tanto o que ele é como tudo o que é seu deve dá-lo ao senhor”. Fonte: “quia et quod est et omnia sua debet dare domino”. O servo é o sujeito implícito de “deve”; os objetos antecipados são retomados globalmente pelo neutro “o”. A construção é pesada, mas não exige concordância verbal no plural nem altera o sentido.
- Rejeitado — `ch001.md` [47], n. 14: “Não que seja tal e tão grande absolutamente”. Fonte: “Non quod talis et tantus sit simpliciter, sed aliquo modo similis, quod dicit ex sua humilitate”. A terceira pessoa marca o retorno do comentário após a fala dirigida a Filêmon; o sujeito de “seja” é Filêmon, comparado a Paulo. Não há quebra de concordância a corrigir para “sejas”.
- Rejeitado — `ch002.md` [55], n. 28: “porque o ato dela é o amor, e a fruição é o efeito, a saber, da caridade”. Fonte: “quia eius actus est dilectio, et fruitio effectus, scilicet caritatis”. “Dela” antecipa “caridade”, esclarecida na mesma oração, como no latim; o referente é recuperável, apesar da ordem pouco habitual.
- Rejeitado — `ch001.md` [44], n. 13, alerta de ênfase: “sed ***quod ad rem***, scilicet tuam, ***pertinet***, vel communem” / “mas ***o que diz respeito à questão***, a saber, à tua, ou à comum”. Confirmada a decisão da rodada 1: os dois segmentos latinos tornam-se um único segmento contínuo em português, sem perda de conteúdo nem de destaque do lema.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-philemonem/review-3.md`.

### Round 4

- Foco: palavras funcionais, títulos e escolhas que o português impõe e o latim deixa em aberto (antecedentes, possessivos, tu/vós). Veredito: 1 defeito confirmado e corrigido.
- Corrigido — `ch001.md`, n. 4: “Ele, porém, junta-lhe Timóteo” → “Junta a si, porém, Timóteo”. *Ipsi autem Timotheum adiungit* tem *ipsi* como dativo singular (= *sibi*): Paulo junta Timóteo a si mesmo. Em português, “lhe” não pode retomar o sujeito “Ele”.
- Rejeitado — `ch001.md`, n. 5: *cuius erat episcopus, sic scribens, Col. ult.* → “da qual era bispo, a quem assim escreve”. “A quem” retoma a igreja, que é a destinatária de Colossenses; o acréscimo é fiel ao contexto.
- Rejeitado — `ch002.md`, n. 27: *ostendit eum esse debitorem ad hoc* → “mostra que é devedor disto”. O latim não define se o devedor é Paulo ou Filêmon, e o português preserva essa abertura.
- Rejeitado — `ch002.md`, n. 29: *hospitari in domo sua* → “hospedar-se em sua casa”. É a casa de Filêmon, como no latim; o contexto exclui a casa do próprio Paulo.
- Rejeitado — `ch002.md`, n. 30: *praemittitur illa* → “aquela é posta antes”. O demonstrativo fica tão aberto quanto *illa*.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-philemonem/review-4.md`.

### Round 5

- Foco: termos por parágrafo nos dois sentidos, afirmações do diário e nomes; leitura integral contra `la/`. Veredito: 4 defeitos documentais corrigidos; capítulos inalterados.
- Corrigido — Termos-chave, `dominus`: “senhor” → “senhor; dono”, com ressalva do n. 22 (`ch002.md` [38]). *Ignorante domino* está corretamente traduzido por “sem o conhecimento do dono”; faltava registrar a variante.
- Corrigido — Termos-chave, `vinctus`: “prisioneiro” → “prisioneiro; preso”, distinguindo lema e predicação. Em `ch001.md` [18], *vinctus erat* / *vinctum esse* dão “estava preso” / “estar preso”; duas ocorrências que a tabela não cobria.
- Corrigido — Termos-chave, “caritas / dilectio” → “caritas / dilectio; amor”. Em `ch002.md` [44], *ex amore secundum carnis originem, et ex amore spirituali* dá “pelo amor segundo a origem da carne e pelo amor espiritual”; “amor” não traduz exclusivamente *dilectio*.
- Corrigido — Decisões, “redação idêntica à das glosas” → correspondência terminológica com as variantes, abreviações e adaptações do latim. Em `ch002.md` [13]/[55], *in Domino* / *in Christo* correspondem a “no Senhor” / “em Cristo”; a identidade geral afirmada era inexata.
- Rejeitado — `ch001.md` [44], ênfase: *sed quod ad rem, scilicet tuam, pertinet, vel communem* → “mas o que diz respeito à questão, a saber, à tua, ou à comum”. A reunião dos segmentos destacados explica os seis marcadores a menos, como nas rodadas 1 e 3.
- Rejeitado — `ch002.md` [53], frequência de *frui/uti*: *Et ideo proprie est habere aliquid* explicita-se como “E por isso, propriamente, fruir é ter algo”; *uti ad utile* dá “usar se refere ao útil”. Os verbos retomados/esclarecidos não acrescentam conteúdo; *uti* em [7] (*uti ne*) é conjunção (“para que”), não “usar”. Em [54], *sic fruar* → “assim fruirei” é uso sem complemento, não regência contrária a “fruir de”.
- Rejeitado — frequência inversa de “companheiro”: `ch001.md` [4]/[22], *commilitoni* → “companheiro de milícia”; `ch002.md` [16], *concaptivus meus* → “meu companheiro de prisão”. São locuções distintas do *socius* → “companheiro” de [10]/[50]/[53], não confusão terminológica.
- Rejeitado — *ibi* fora da divisão textual: `ch001.md` [22], *totam ecclesiam ibi* → “toda a igreja dali”; `ch002.md` [66], *ibi praenuntiat* → “ali prenuncia”. A tabela já restringe “onde diz” às divisões.
- Rejeitado — diferenças de busca por radical `serv-`: `ch001.md` [21]/[35], *subministrabat/obsequia* → “servia/serviços”; `ch002.md` [6]/[37], *ministraret/ministrare* → “servisse/servir”; [27]/[51], *servitium* → “serviço”. Verbos de serviço e o substantivo *servitium* não são ocorrências de *servus*.
- Rejeitado — nomes `ch001.md` [4]/[22]: *Appiae* → “Ápia”, *Colossis* → “Colossos”. São formas portuguesas atestadas, embora a busca nos capítulos pt-BR dos Padres não tenha retornado essas duas grafias; não há fundamento para substituí-las.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-philemonem/review-5.md`.

### Round 6

- Foco: completude parágrafo a parágrafo (alinhamento um a um com `la/`), citações, parentéticos, referências e nomes bíblicos, capítulo e versículo. Veredito: nenhum defeito confirmado; capítulos, `book.json` e termos-chave inalterados.
- Rejeitado — `ch001.md` [44], alerta de ênfase (42 marcadores na fonte, 36 no pt-BR): *sed quod ad rem, scilicet tuam, pertinet, vel communem* → "mas ***o que diz respeito à questão***, a saber, à tua, ou à comum". Mesma decisão das rodadas 1, 3 e 5: dois segmentos latinos destacados viram um só em português; nada falta.
- Rejeitado — `ch001.md` [44]: *praelatus non habet potestatem imperandi sibi quicquam* → "não tem poder de lhe ordenar coisa alguma". O pronome é reflexivo no latim, e "utilidade dele, ou da Igreja" fixa o referente; a ambiguidade do clítico não muda o sentido.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-philemonem/review-6.md`.

### Round 7

- Foco: leitura bilíngue integral, oração por oração, contra `la/`. Veredito: nenhum defeito objetivo confirmado; capítulos e termos-chave inalterados.
- Rejeitado — `ch001.md` [44], n. 13, alerta de ênfase: “sed ***quod ad rem***, scilicet tuam, ***pertinet***, vel communem” → “mas ***o que diz respeito à questão***, a saber, à tua, ou à comum”. O português reúne o lema descontínuo latino num segmento; preserva o destaque e as duas qualificações. A diferença de marcadores não constitui defeito.
- Rejeitado — `ch002.md` [13]/[53]–[55], *fruar* → “fruirei”. A forma latina pode ser futuro do indicativo ou presente do subjuntivo; a explicação “si feceris, implebis voluntatem meam gaudiis” e a sequência “nihil erit … et sic delectabis me” sustentam a leitura futura. Não cabe impor “que eu frua” como única tradução.
- Rejeitado — `ch002.md` [54]: “Etsi in hoc mihi satisfacies, nihil erit in corde meo de te, quod contristet me” → “E, se nisto me satisfizeres, nada haverá no meu coração a teu respeito que me entristeça”. A leitura como ligação aditiva e condição (*et si*) é sustentada pela condição “si feceris” em [53] e pela consequência futura em [54]; não é obrigatório impor concessão (“embora”).
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-philemonem/review-7.md`.
