# Diário de Tradução — Comentário à Primeira Epístola aos Tessalonicenses (pt-BR)

Fonte canônica: `la/` (texto Leonino / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (Larcher, revisado pelo Aquinas Institute), só para registro e terminologia; estrutura e texto seguem o latim, conforme o precedente de *Do Ente e da Essência*, do *Comentário a Filêmon* e do *Comentário à Segunda Epístola aos Tessalonicenses*.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| Prooemium / Lectio N | Prólogo / Lição N | Como em *Filêmon* e *2 Tessalonicenses*. |
| salutatio / epistolaris narratio | saudação / narração epistolar | Como nas obras irmãs. |
| ibi (divisão do texto) | onde diz | |
| et cetera | etc. | |
| id est / scilicet / quasi dicat | isto é / a saber / como se dissesse | |
| primo / secundo / tertio (divisões) | primeiro / em segundo lugar / em terceiro lugar | Como em *2 Tessalonicenses*. |
| Apostolus / Glossa | o Apóstolo / a Glosa | |
| caritas / dilectio / amor | caridade / amor / amor | *Caritas* sempre "caridade" (também *caritas fraternitatis* → "caridade fraterna"). |
| virtus (de Deus, da pregação; 1, 5) | poder | *In virtute* → "em poder"; *virtuose* (n. 13) → "poderosamente"; *virtus* moral ou dos fracos (n. 126) → "virtude"/"força". Conforme *2 Tessalonicenses*. |
| sine querela | sem queixa | 2, 10; 3, 13; 5, 23; Lc 1, 6. O n. 72 glosa *ut nullus possit conqueri* e o n. 137 opõe *sine querela* a *sine peccato*: "irrepreensível" apagaria o argumento. |
| inanis | vão | O n. 24 glosa três sentidos (leve, vazio, móvel); Gn 1, 2 *inanis et vacua* → "vã e vazia". |
| sustinentia spei | constância da esperança | |
| tentare / tentator | tentar / tentador | n. 62: *experimentum de aliquo sumere* → "fazer prova de alguém". |
| inquietus / inquietudo / otium | inquieto / inquietação / ociosidade | Como em *2 Tessalonicenses*. |
| praelatus / subditus | prelado / súdito | |
| adventus | vinda | |
| interitus | destruição | Como em *2 Tessalonicenses*. |
| posuit (5, 9) | destinou | Jo 15, 16 *posui vos* → "eu vos destinei", para que a citação sirva ao lema. |
| simpliciter | absolutamente | Conforme as obras irmãs. |
| Silvanus, Sylas, Timotheus, Nicolaus, Iezabel, Romulus, Hercules, Michael, Gregorius, Augustinus, Hieronymus | Silvano, Silas, Timóteo, Nicolau, Jezabel, Rômulo, Hércules, Miguel, Gregório, Agostinho, Jerônimo | |
| Vitae Patrum | Vidas dos Padres | Sem itálico, como no latim. |

## Decisões

- `book.json`: "Santo Tomás de Aquino" como autor; título "Comentário à Primeira Epístola aos Tessalonicenses", paralelo ao de *2 Tessalonicenses*. pt-BR acrescentado a `name`, `author`, `description` (o campo já existia), `languages` e aos títulos do sumário. Os títulos seguem o en-US no estilo de *Filêmon* ("Prólogo — Gênesis 7, 17", "Lição 1 — …"), incluindo a numeração dos grupos (Capítulo 1–6), que é a do sumário importado e não a dos capítulos da epístola; espelhada sem renumerar.
- Os cabeçalhos dos arquivos (`# Lectio N`, subtítulo em itálico negrito) foram traduzidos; os subtítulos seguem o latim (*Gaudia in Thessalonicensibus* → "A alegria nos tessalonicenses").
- Referências bíblicas com abreviaturas portuguesas e "capítulo, versículo" (`Mt 24, 45`). Numeração e nomes da Vulgata mantidos (Sl 93, 1 Rs = *I Reg.*, 2 Rs = *II Reg.*, 3 Rs = *III Reg.*, 4 Rs = *IV Reg.*, Eclo, Ecl, Ap). `ult.` → "No último capítulo de …"; citações sem capítulo (*Ps.:*, n. 128) ou sem versículo (*Eccli. XXX*, *Ps. X*, *Is. c. IX*, *Phil. III*) ficam como estão.
- Citações erradas da edição espelhadas, não corrigidas pelo inglês: Eclo 30 para "a água extingue o fogo ardente" (prólogo; en-US Eclo 3, 30); 3 Jo 2, 4 (n. 40); Lc 13, 36 (n. 108).
- Citações bíblicas traduzidas da redação latina do texto, sem harmonizar com outra Bíblia; em itálico, sem aspas, como no latim. Os lemas seguem o latim mesmo quando diferem do versículo: n. 19 *fides vestra ad Deum perfecta* → "perfeita" (o versículo traz *profecta*, "se propagou"); n. 50 *ore* ("na boca"), ausente do versículo.
- Estrutura espelhada linha a linha: marcadores `^c:v^`, blockquotes, marcas `[n. N]`, números de parágrafo no formato da fonte (`**3**.`), linhas partidas ("Assim, pois, convém" / "a esta epístola") e os segmentos de ênfase quebrados da fonte (n. 4 `** *Paulo***`; n. 5 `*em Deus Pai … Cristo***`; n. 121 `*quer vigiemos … com ele***`).
- O versículo 4, 12 aparece só no início de `g5-c002.md`, mas é comentado no n. 91 de `g5-c001.md`; a edição traz assim, espelhado.
- n. 70 termina abruptamente (*primo ostendit quid petat, ibi ad confirmanda*), e n. 80 diz *ut scilicet passio praecedat*; ambos vertidos literalmente.
- n. 116, *per ultionem malorum*: o en-US lê "keeping away from anything evil" (como se fosse *vitationem*). Vertido literalmente, "pela vingança dos males"; a fonte não foi editada, porque *ultionem* é palavra latina real e não erro inequívoco de OCR.
- Nenhuma nota de editor na fonte; nenhuma nota do tradutor acrescentada.

## Edições no texto-fonte

- `la/g1-pr.md`, n. 1: `figuratur perb, sicut` → `figuratur per arcam, sicut`. Corrupção de OCR (marca de nota colada e palavra perdida); a frase seguinte (*sicut in arca*) e o en-US ("symbolized by the *ark*") confirmam *arcam*.

## Review log

### Round 1

- Foco: completude parágrafo por parágrafo, citações, incisos e referências, contra `la/`.
- Veredicto: **ISSUES 10** — nove correções pontuais nos capítulos e uma afirmação corrigida neste diário.

Defeitos corrigidos:

- `g2-c001.md [58], n. 14`: «espero, porém, que sejamos manifestos também às vossas consciências» → «espero, porém, que sejamos manifestos às vossas consciências». O advérbio aditivo não está na citação latina; conserva-se apenas a adversativa autem.
- `g2-c001.md [65], n. 16`: «não com outra qualquer, a qual é o amor de Deus» → «não com outra qualquer; o Espírito Santo é o amor de Deus». Qui é masculino e retoma Spiritus Sancti, não gaudium, neutro. O feminino português atribuía à alegria a definição do Espírito Santo.
- `g2-c001.md [80], n. 22, Ap 6, 16`: «escondei-nos da face daquele» → «escondei-vos da face daquele». Vos é segunda pessoa reflexiva; nos introduzia outro objeto, ausente desta redação da fonte.
- `g3-c001.md [30], n. 24`: «foram ultrajados» → «fomos ultrajados». O lema mantém a primeira pessoa plural de sumus; a tradução passava indevidamente à terceira pessoa.
- `g3-c001.md [49], n. 31, Pr 24, 28`: «não aleites ninguém com os teus lábios» → «não seduzas ninguém com os teus lábios». Lactare aqui é seduzir/aliciar com palavras, como confirma o contexto explícito de adulação; não se trata de amamentar.
- `g4-c001.md [41], n. 64`: «que, se não quis oferecer amor, não quis também retribuí-lo» → «que, mesmo que não queira oferecer amor, não quis retribuí-lo». Restaura a concessiva et si e o presente subjuntivo velit; mantém o passado de noluit, sem regularizar a fonte.
- `translation-journal.md, Decisões; confronto com g4-c001.md [41], n. 64`: «Gl 6, 15 para fé e caridade (n. 64), na lista de citações erradas» → «removido da lista de citações erradas». O trecho efetivamente citado termina em nova creatura, traduzido por nova criatura, e corresponde à referência dada. A menção anterior a fé e caridade pertence ao comentário, não à citação.
- `g6-c001.md [61], n. 118, Rm 13, 13`: «andemos honestamente, como de dia» → «andemos honestamente de dia». A fonte traz in die, sem comparação; como acrescentava uma comparação ausente da redação citada.
- `g6-c002.md [53], n. 134, Jr 20, 8`: «a palavra do Senhor tornou-se para mim opróbrio» → «a palavra do Senhor tornou-se opróbrio». Para mim não tem correspondente nesta citação: não há mihi no texto canônico fornecido.
- `g6-c002.md [66], n. 137`: «segundo aquilo de que todo mau é ignorante» → «visto que todo homem mau é ignorante». A fonte enuncia que todo homem mau é ignorante; a construção portuguesa fazia de aquilo o objeto da ignorância e deixava de enunciar essa premissa.

Achados rejeitados (manter nas próximas rodadas):

- `g1-pr.md [6], n. 1` — fonte: «Eccli. XXX: ignem ardentem extinguit aqua». Referência incomum já documentada: 30 está no latim e deve ser espelhado, sem substituição por outra numeração.
- `g1-pr.md [11]–[12], n. 2` — fonte: «Sic ergo convenit / huic epistolae». A frase partida entre blocos reproduz a divisão da fonte; não é divisão introduzida pela tradução.
- `g2-c001.md [72], n. 19` — fonte: «fides vestra ad Deum perfecta». Perfecta pertence ao lema comentado; não o substituir por profecta do versículo em [10].
- `g3-c002.md [15], n. 40` — fonte: «III Io. II, v. 4». A referência anômala é da fonte e já está documentada; não corrigir a tradução isoladamente.
- `g3-c002.md [37], n. 47` — fonte: «quid generas?». Pergunta idiomática de censura ao ato de gerar; a leitura causal é defensável no contexto, sem defeito inequívoco.
- `g3-c002.md [42]–[45], n. 49` — fonte: «circa hoc duo facit […] primo […] secundo […] tertio». A enumeração de três após anunciar duas está no latim; não há item acrescentado pelo tradutor.
- `g4-c001.md [54], n. 70` — fonte: «Et circa hoc primo ostendit quid petat, ibi ad confirmanda». O anúncio abrupto está completo em relação ao latim fornecido; não completar por conjectura.
- `g5-c001.md [43], n. 80` — fonte: «ut scilicet passio praecedat». A estranheza doutrinal vem da própria redação latina, já documentada; não inserir negação nem emendar a fonte sem evidência de OCR.
- `g5-c001.md [70], n. 90` — fonte: «multa mala docuit otiositas». Malícia pode designar coletivamente a maldade ensinada; a mudança de número não prova perda de conteúdo.
- `g5-c002.md [34], n. 98` — fonte: «ea quae fiunt nunc per creaturas corporales, fiunt a Deo eis mediantibus». Eis admite morfologicamente o antecedente feminino creaturas e o masculino dos anjos mencionados antes; elas retoma o antecedente imediato. Não há base inequívoca para impor a outra leitura.
- `g5-c002.md [55], n. 105` — fonte: «consolamini, consolamini, popule meus». Consolamini admite leitura ativa deponente, como em consolamini pusillanimes (g6-c002 [3]); o vocativo popule meus não obriga por si só à leitura reflexiva. Não alterar uma leitura defensável.
- `g6-c001.md [32], n. 108` — fonte: «Lc. XIII, 36». A numeração problemática está no latim e já foi registrada; preservada.
- `g6-c001.md [52], n. 116` — fonte: «per ultionem malorum». Ultionem significa vingança; a substituição por evitação exigiria emendar a fonte por conjectura, contra a regra e a decisão documentada.
- `g6-c001.md [71], n. 121` — fonte: «posui vos, scilicet sanctos». Sanctos pode explicitar os destinatários de vos; a leitura predicativa também é possível, mas não torna a tradução objetivamente falsa.
- `g6-c002.md [36], n. 128` — fonte: «si reddidi retribuentibus mihi mala». Mala pode funcionar como objeto de reddidi ou de retribuentibus. A tradução escolhe uma análise gramatical possível; não se deve harmonizar a citação por memória.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-1-thess/review-1.md`.

### Round 2

- Foco: leitura bilíngue oração por oração contra `la/` (tempo, pessoa, regência, citações puxadas para a Vulgata conhecida).
- Veredicto: **ISSUES 5**, todas corrigidas.

Defeitos corrigidos:

- `g2-c001.md [43], n. 11`: «os bens deles, aos quais primeiro elogia» → «os bens deles, os quais primeiro elogia». *Quos* é objeto direto de *commendat*; *elogiar* não rege preposição.
- `g2-c001.md [80], n. 22, Mt 3, 7`: «quem vos mostrou como fugir» → «quem vos mostrará como fugir». A fonte traz o futuro *demonstrabit*; o passado vinha do *demonstravit* da Vulgata.
- `g3-c001.md [30], n. 24`: «***Mas antes*** ***tendo*** ***padecido***» → «***Mas antes*** ***nós*** ***padecemos***». O lema traz *sumus passi*, forma finita da primeira pessoa do plural (como em «fomos ultrajados», corrigido na rodada 1); o gerúndio deixava a frase sem verbo principal.
- `g3-c001.md [66], n. 38, Sb 6, 21`: «conduz» → «conduzirá». A fonte traz o futuro *deducet*.
- `g4-c001.md [48], n. 67`: «porque o que vem do próximo agrada a Deus» → «porque a alegria pelo próximo agrada a Deus». *De proximo* é "acerca do próximo"; o sujeito subentendido é a alegria (*gaudium … quo gaudemus propter vos*), não algo que venha do próximo.

Achados rejeitados (manter nas próximas rodadas):

- `g3-c001.md [29], n. 24`: fonte: «dico quod annuntiat introitum nostrum». O singular não tem sujeito expresso e retoma os que anunciam no n. 20 (*ipsi … annuntiant*); «anunciam» conserva o referente.
- `g3-c002.md [6]/[38], n. 48`: fonte: «ut impleant peccata sua». «encher a medida dos seus pecados» antecipa a *mensura* que o próprio comentário desenvolve logo em seguida; não é conteúdo acrescentado.
- `g2-c001.md [59], n. 15`: fonte: «praedicationem suam virtuose receperunt». «com virtude» é correto: aqui *virtuose* qualifica os ouvintes (*ostendit eorum virtutem*), não o poder da pregação do n. 13 previsto nos Termos-chave.
- `g2-c001.md [56], Hb 2, 4`: fonte: «variis virtutibus». *Virtutes* no plural, ao lado de *signis et portentis*, são milagres; a linha *virtus* → "poder" dos Termos-chave trata do singular.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-1-thess/review-2.md`.


### Round 3

- Foco: leitura integral às cegas do pt-BR, conferência dos pontos suspeitos em `la/` e varredura ortográfica.
- Veredicto: **ISSUES 1**, corrigida.
- `g3-c001.md [65], n. 38, Ez 34, 4`: «dominavíeis» → «domináveis». Forma correta da segunda pessoa plural do imperfeito de dominar, correspondente a *imperabatis*.

Achados rejeitados:

- `g2-c001.md [43]–[44], n. 11` — fonte: «in speciali commemorat eorum bona, quos / primo commendat, quod devote et prompte susceperunt praedicationem». O relativo retoma os tessalonicenses, expressos em «deles», não os bens. A oração seguinte permite recuperar o referente humano; a distância do antecedente não torna a frase agramatical.
- `g3-c001.md [52], n. 32` — fonte: «cum haberemus unde possemus gloriari et accipere, imo oneri esse, quia debebant ei gloriam et sustentationem». A passagem da primeira pessoa plural para «lhe» reproduz haberemus/ei; o singular retoma o Apóstolo. Não uniformizar a pessoa por estilo.
- `g4-c001.md [38], n. 62` — fonte: «Mundus autem et caro dicuntur tentare materialiter». Construção pessoal com infinitivo, de registro erudito: diz-se do mundo e da carne que tentam. Não significa que tentem a si mesmos; o complemento subsequente explica a tentação material. A paráfrase seria mais corrente, mas não corrige defeito inequívoco.
- `g4-c001.md [53], n. 69` — fonte: «aliqua secreta, quae necdum Apostolus eis praedicavit in sua novitate». «Novidade» pode designar o estado inicial dos convertidos, retomados por «lhes». O latim também usa o possessivo sua; a expressão pouco corrente não é um pronome sem referente recuperável.
- `g5-c001.md [44], n. 80` — fonte: «quando licet concupiscentiam habeat, non tamen uteretur ea nisi esset uxor sua». «Dela» retoma a mulher/esposa do contexto, não «concupiscência». A condição «se não fosse a sua esposa» resolve a referência, como uxor sua resolve ea no latim. Não substituir por uma referência à concupiscência.
- `g5-c002.md [34], n. 98` — fonte: «fiunt a Deo eis mediantibus; in resurrectione vero aliqua per eos sunt agenda». «Elas» retoma as criaturas corporais e «eles» os anjos do bloco [33]. A mudança de gênero corresponde a uma leitura possível de eis e ao masculino eos; confirma-se a rejeição da rodada 1.
- `g6-c002.md [22], n. 126` — fonte: «cura praelatorum ad duo debet tendere, scilicet ad retrahendum alios a peccatis, et ad custodiendum seipsos». O sujeito semântico dos infinitivos são os prelados, cujo cuidado se descreve; «si mesmos» retoma-os, como seipsos na fonte. Não atribuir a ação reflexiva ao substantivo abstrato «cuidado».
- `g6-c002.md [25], n. 126` — fonte: «In voluntate vero, quando non aggreditur magna, quia deiicitur». A fonte passa igualmente ao singular genérico, explicado em seguida por Pusillanimis est. O sujeito é o súdito pusilânime considerado individualmente; não é necessário pluralizar os verbos.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-1-thess/review-3.md`.

### Round 4

- Foco: palavras funcionais, cabeçalhos e compromissos forçados (gênero, antecedente, tratamento, conectores), contra `la/`.
- Veredicto: **ISSUES 2**, ambas corrigidas.

Defeitos corrigidos:

- `g2-c001.md [5] (1 Ts 1, 3) e [42], n. 10`: «esperança em nosso Senhor» → «esperança de nosso Senhor». O genitivo *spei Domini nostri* é aberto, e o comentário o glosa nos dois sentidos (*quam habemus de Christo, vel quam Christus dedit nobis*). «Em» fixava o sentido objetivo e deixava a segunda glosa sem apoio no lema.
- `g5-c002.md [25], n. 96`: «Pelo que parece aos que não entendem que o Apóstolo diz aqui que…» → «Pelo que, aos que não entendem, parece que o Apóstolo diz aqui que…». Sem vírgulas, a oração com *que* lia-se como objeto de «entendem», e «parece» ficava sem sujeito. No latim, a oração com *quod* é o sujeito de *videtur*.

Achados rejeitados:

- *autem* vertido por «pois» posposto (`g2-c001 [21], [73], [79]`; `g4-c001 [26], [55]`; `g5-c001 [20]`; `g6-c001 [79]`). É um uso constante no livro, com valor de continuação explicativa, e não contradiz o *autem* continuativo. Escolha de estilo.
- `g6-c002 [44], n. 130` — fonte: «Omnia ergo quae facimus, ex desiderio proveniunt. Ergo oratio…». O primeiro *ergo* introduz uma premissa do silogismo, e «Ora» mantém o argumento válido.
- `g5-c001 [68], n. 90` — fonte: «assistatis ei» (Rm 16, 2). O feminino «a» justifica-se: o referente é Febe.
- `g5-c002 [22], n. 95` — fonte: «quos secum adducet, scilicet cum ipso Christo». «Consigo» espelha o reflexivo latino e a sua glosa.
- `g3-c002 [38], n. 48` — fonte: «Bonorum quidem, in eius praeparatione». «Sua» fica tão aberto quanto *eius*, e o contexto (a preparação divina) resolve a referência.
- `g3-c002 [32], n. 45` — fonte: «petierunt eum occidi a Pilato». *Petere ab aliquo* é «pedir a alguém»; «pediram a Pilatos» está correto.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-1-thess/review-4.md`.


### Round 5

- Foco: termos por parágrafo nos dois sentidos, afirmações do diário e nomes, com leitura integral contra `la/` e confronto dos nomes com as obras pt-BR de `content/books/church-fathers/`.
- Veredicto: **CLEAN** — nenhum defeito objetivo confirmado; nenhuma correção nos capítulos, metadados, Termos-chave ou afirmações anteriores.

Achados rejeitados:

- `g3-c002 [26]` e `g6-c001 [44]` — fonte: «Ibi enim fides Christi primo est annuntiata» / «ibi vero non est tempus misericordiae». «Ali» traduz o uso locativo; a equivalência «onde diz» da tabela limita-se à divisão textual.
- `g2-c001 [53], [66], [79]` — fonte: «scilicet quando Deus dat eis gratiam», «quod scilicet aliis estis imitabiles», «ut scilicet ei conformemur». Os dois-pontos, «de modo que» e «para que» preservam a função explicativa sem repetir «a saber»; não há conteúdo perdido nem necessidade de uniformização estilística.
- `g3-c001 [65]` e `g6-c002 [44]` — fonte: «cum potentia» e «vim orationis […] manet in virtute». «Poder» também traduz potentia; «força» traduz vis e a eficácia de virtus. A busca inversa não estabelece exclusividade lexical. Mantidas as distinções contextuais e as rejeições da rodada 2 sobre virtuose/virtutibus.
- `g3-c001 [24], [29]` e `g4-c001 [39]` — fonte: «suam constantiam», «non in vanum cucurri, neque in vacuum laboravi», «sine causa laboraverim». «Constância» e «em vão» são traduções legítimas também desses lemas, sem contradizer sustinentia/inanis na tabela.
- `g4-c001 [36]` e `g6-c002 [52]` — fonte: «Secundo modo sic» / «Tertio modo, occultando». «Do segundo modo» / «Do terceiro modo» qualificam modo; a convenção das divisões não obriga a dizer «em segundo/terceiro lugar» aqui.
- `g1-pr [5]`, `g6-c002 [58]`, `g2-c001 [64]` — fonte: «Unde subdit», «subdit orationem», «ibant apostoli gaudentes». Subdit é «acrescenta», não subditus; apostoli aqui é plural («os apóstolos»). Diferenças brutas de grep por homônimos/flexões não são omissões; o mesmo vale para os acentos em inquietação/tentação.
- `g6-c002 [64]` — fonte: «Et haec sunt reprobata in ecclesiasticis dogmatibus». «Nos dogmas eclesiásticos» conserva a redação. O paralelo com o tratado De ecclesiasticis dogmatibus torna possível uma alusão bibliográfica, mas não obriga a explicitar um título que a fonte não destaca; não emendar por conjectura.
- `g3-c002 [6], [38]` e Round 2 — fonte: «ut impleant peccata sua semper» / «qua vult ut impleant peccata sua». «Encher a medida dos seus pecados» no diário descreve no infinitivo a construção que o texto flexiona («encherem sempre» / «encham»); a falta da sequência literal no grep não invalida a justificativa anterior.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-1-thess/review-5.md`.


### Round 6

- Foco: completude parágrafo por parágrafo (citações, incisos, referências bíblicas, nomes e abreviaturas, capítulo e versículo) contra `la/`.
- Veredicto: **CLEAN** — nenhum defeito objetivo confirmado; nenhuma alteração nos capítulos, em `book.json` ou nos Termos-chave.

Achados rejeitados:

- `g3-c001 [59], n. 35` — fonte: «arcere pseudo, qui nimis accipiebant». «Pseudoapóstolos» completa a elipse com o referente do contexto; leitura defensável, não conteúdo acrescentado.
- `g3-c001 [30], n. 24` — fonte: «contumeliis ex hoc affecti in Philippis». «Por isso» traduz *ex hoc*; literal, sem perda.
- `g5-c001 [3]–[11]`, `g6-c002 [11]` — «abstende-vos» é a forma correta do imperativo de *abster-se*.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-1-thess/review-6.md`.
