# Translation Journal — Carta a Frei Gerardo de Besançon sobre os 6 Artigos (pt-BR)

Source: la (texto latino Leonina / Marietti, via aquinas.cc — canônico; o en-US foi consultado só como referência secundária de registro e terminologia, como em *Do Ente e da Essência*)
Target: pt-BR

## Key Terms

| Latim | Português | Notas |
|-------|-----------|-------|
| frater Gerardus Bisuntinus | frei Gerardo de Besançon | "frei Tomás de Aquino", como na saudação de *De emptione* |
| ordo fratrum praedicatorum | Ordem dos Frades Pregadores | |
| quaestio | questão | "Prima ergo quaestio fuit…" → "A primeira questão, pois, foi…"; os títulos seguem o book.json (Artigo N) |
| stella quae magis apparuit | a estrela que apareceu aos Magos | *magis* = dativo de *magi* |
| Chrysostomus (auctor operis imperfecti) | Crisóstomo (o autor da *Obra Incompleta*) | o *Opus imperfectum in Matthaeum*; parênteses do latim mantidos |
| Augustinus / Leo Papa / Gregorius | Agostinho / o papa Leão / Gregório | |
| locutio | locução | art. 4 |
| sane exponi / sanae locutionis sensus | expor em sentido são / sentido da locução sã | |
| revocare | retratar | |
| circumstantiae trahentes in aliud genus | circunstâncias que levam a outro gênero | |
| species peccati / specificatur | espécie do pecado / é especificado | |
| repugnantia | oposição | |
| deformitas | deformidade | |
| expressio personae | exprimir a pessoa | |
| ordo correctionis | ordem da correção | |
| simplices | os simples | como em *36 Artigos* |
| carissimus (*Carissimo*, prólogo; *carissime*, epílogo) | caríssimo | |

## Translation Decisions

- 2026-10-03: Tradução integral do latim, com os mesmos arquivos, títulos e quebras de parágrafo; os enunciados em negrito e itálico dos arts. 1 e 4 conservam o destaque. Títulos: Prólogo, Artigos 1-3, Artigo N, Epílogo, como em *36 Artigos*. Tratamento por "vós" ao destinatário.
- As notas entre parênteses do en-US (remissão à *Suma*, citação de Mt 18, 15-17, referências de Lc 2, 35 e Ex 20, 15) são aparato editorial ausente do latim: não entram. Escritura só onde o latim cita: *Matth. XVIII* → "Mt 18".
- Citações bíblicas traduzem a redação latina: Lc 2, 35 "uma espada traspassará a tua própria alma"; Ex 20, 15 "não cometerás furto".
- Art. 6, *si cum sorore concubuit*: "se dormiu com a irmã". O en-US traz "father"; segue-se o latim.
- Art. 6, enunciado: *trahentes in alterum genus, non notabiliter aggravantes* traduzido literalmente ("que o levam a outro gênero, sem o agravarem notavelmente"); o en-US lê "or notably aggravate" (*vel*), mas o latim transmitido é coerente com a resposta, que exige confessar as circunstâncias que mudam o gênero.
- Art. 6, resposta: *Circumstantias vero non aggravantes, quae in aliud genus peccati non trahunt* → "as circunstâncias agravantes que não levam a outro gênero de pecado". O *non* contradiz o resumo do mesmo parágrafo e o parágrafo final (*circumstantias aggravantes quae non trahunt*); traduzido pelo sentido exigido, sem alterar o latim, por não ser certo que venha do scan.
- Nenhuma nota de rodapé no latim; nenhuma acrescentada.

## Source edits

Nenhuma.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo (la × pt-BR), nomes e números bíblicos; mais a auditoria mecânica e o `book.json`.
- Veredito: limpo. Nenhuma alteração nos capítulos, no `book.json` nem nos Key Terms.
- Rejeitados:
  - Art. 6, resposta, *Circumstantias vero non aggravantes, quae in aliud genus peccati non trahunt* → "as circunstâncias agravantes que não levam…": o pt-BR omite o *non*. Mantido. A decisão já consta acima, e o próprio parágrafo (*Sic igitur huiusmodi circumstantias aggravantes, quae non trahunt*) e o parágrafo final exigem "agravantes". O en-US também lê "aggravating". Não foi possível consultar outra edição nesta rodada para confirmar que o *non* é erro do scan, por isso o latim não foi alterado.
  - Art. 6, enunciado, *non notabiliter aggravantes* → "sem o agravarem notavelmente", contra o "or notably aggravate" do en-US: o pt-BR segue o latim transmitido, conforme a decisão acima. Não é defeito em relação à fonte canônica.
  - Art. 4, *Sed tamen si praedicatum sit* → "Mas, se tiver sido pregado": o *tamen* não é traduzido em separado. "Mas" já dá a adversativa, e o sentido não muda. É escolha de estilo.
  - Art. 1-3, *super Matth.* → "sobre Mateus" (sem abreviatura bíblica): refere-se ao comentário de Crisóstomo sobre o Evangelho, não é citação de versículo.
- Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-6/review-1.md` (fora do corpus).

### Round 2

- Foco: leitura bilíngue cláusula a cláusula (la × pt-BR) de todos os capítulos; mais a auditoria mecânica e o `book.json`.
- Veredito: limpo. Nenhuma alteração nos capítulos, no `book.json` nem nos Key Terms.
- Rejeitados:
  - Arts. 1-3, *nisi forte ex hoc populo scandalum sit exortum* → "a não ser que daí tenha nascido escândalo no povo": o *forte* não é traduzido em separado. *Nisi forte* é o "a não ser que" corrente do latim; a condição está intacta. É escolha de estilo.
  - Art. 6, parágrafo final, *non esse de necessitate confitendas* → "não são de necessidade a confessar": construção portuguesa válida (a + infinitivo de obrigação), fiel ao latim.
  - Epílogo, *orationum suffragia* → "o sufrágio das vossas orações": singular coletivo, sem mudança de sentido.
- Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-6/review-2.md` (fora do corpus).

### Round 3

- Foco: leitura do pt-BR sem a fonte (gramática, concordância, regência, antecedentes), cada marca verificada depois contra o latim; varredura de ortografia, acentos, crase, hífen, pontuação e pares de itálico; mais a auditoria mecânica e o `book.json`.
- Veredito: 1 defeito, corrigido.
- Corrigido:
  - Arts. 1-3, *Quibus simul respondeo, quod Chrysostomus… narrat*: "A estas respondo ao mesmo tempo que Crisóstomo… narra" → "A estas respondo conjuntamente que Crisóstomo… narra". "Ao mesmo tempo que" é locução conjuntiva temporal em português e se lia "respondo enquanto Crisóstomo narra"; *simul* modifica *respondeo* (uma resposta às três questões) e *quod* introduz o conteúdo.
- Rejeitados:
  - Art. 5, *an ex quo Simeon dixit* → "se, desde que Simeão disse": "desde que" admite leitura condicional, mas o "até a ressurreição de Cristo" da mesma frase fixa o sentido temporal de *ex quo*.
  - Art. 4, "não penso que se deva retratar" / art. 6, "que se estará obrigado por necessidade a confessar" e "não se deve referir ao número": sujeito indeterminado, que segue o impessoal latino (*revocandum*, *tenebitur*, *non est referendum*); gramatical.
  - Art. 5, *traspassará*: forma registrada no VOLP ao lado de "transpassar"; não é erro.
- Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-6/review-3.md` (fora do corpus).

### Round 4

- Foco: palavras funcionais (preposições, artigos, demonstrativos, conectivos, possessivos), títulos e rótulos, e os pontos em que o português se compromete e o latim fica aberto (gênero do antecedente, tratamento tu/vós); mais a auditoria mecânica e o `book.json`.
- Veredito: 1 defeito, corrigido.
- Corrigido:
  - Art. 6, *licet sit laudabile quod homo ea confiteatur*: "que o homem as confesse" → "que o homem os confesse". *Ea* é neutro plural: não retoma *circumstantias* (que pediria *eas*), mas os pecados veniais ou as duas coisas juntas. O feminino restringia às circunstâncias; o masculino cobre os dois antecedentes, como o neutro latino.
- Rejeitados:
  - Arts. 1-3, *quaedam similia narrat super Matth.* → "narra algumas coisas semelhantes sobre Mateus": "sobre Mateus" é a forma corrente de citar um comentário (*super Matthaeum*); o contexto (a estrela) impede ler "a respeito de Mateus".
  - Arts. 1-3 e 5, *quod revocetur* → "que se retrate": "se" passivo, com sujeito a coisa pregada; a leitura reflexiva ("que o pregador se retrate") não muda o que se pede. Segue o Key Term *revocare*.
  - Art. 6, *si cum sorore concubuit* → "se dormiu com a irmã": o artigo vale como possessivo (a própria irmã), que é o que torna o exemplo um caso de mudança de espécie.
  - Epílogo, *impendatis* → "concedei-me": imperativo de vós para o subjuntivo jussivo, coerente com o tratamento de toda a carta.
- Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-6/review-4.md` (fora do corpus).

### Round 5

- Foco: termos, journal e nomes. Diferença de frequência por parágrafo entre os Key Terms e os capítulos, nos dois sentidos; cada afirmação verificável do journal conferida por grep; nomes próprios conferidos com a forma portuguesa corrente e com obras irmãs; mais a auditoria mecânica e o `book.json`.
- Veredito: 2 defeitos, ambos no journal, corrigidos. Nenhuma alteração nos capítulos nem no `book.json`.
- Corrigido:
  - Key Terms, linha *quaestio*: a forma citada "Prima quaestio fuit…" → "A primeira questão foi…" não existe nos arquivos; o latim é *Prima ergo quaestio fuit* e o pt-BR "A primeira questão, pois, foi". Linha corrigida para as formas reais.
  - Key Terms, linha *karissime / carissime*: a grafia *karissime* não ocorre no latim deste livro (0 ocorrências); as formas são *Carissimo* (prólogo) e *carissime* (epílogo). Linha corrigida.
- Rejeitados:
  - Art. 6, *et sic additur nova species peccati* → "uma nova espécie de pecado", e não "espécie do pecado" como na linha *species peccati*: com o indefinido, "do" seria agramatical. A linha registra a forma definida (*speciem peccati* → "a espécie do pecado"), que vale nas outras quatro ocorrências.
  - Art. 5, *huiusmodi frivola* → "frivolidades deste gênero": "gênero" aqui é "tipo", não o *genus* técnico do art. 6; está em outro capítulo e não confunde o termo.
  - Arts. 1-3, *auctor operis imperfecti* → "o autor da *Obra Incompleta*", contra "Obra Imperfeita" nas obras de Ligório (traduzidas do italiano *Opera imperfetta*): as duas formas são correntes em português para o *Opus imperfectum in Matthaeum*; não há convenção da obra de Tomás em contrário.
- Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-6/review-5.md` (fora do corpus).

### Round 6

- Foco: completude parágrafo a parágrafo (la × pt-BR, alinhamento 1:1 e contagem de frases), citações, parênteses e referências bíblicas; mais a auditoria mecânica e o `book.json`.
- Veredito: limpo. Nenhuma alteração nos capítulos, no `book.json` nem nos Key Terms.
- Rejeitados:
  - Art. 4, *manus quae nos plasmaverunt, clavis confixae sunt* → "*as mãos que nos plasmaram foram cravadas com pregos*", sem o latim: a regra de manter o latim inline vale para frases latinas dentro de um original vernáculo. Aqui o latim é a língua de todo o livro, e a citação, assim como as de Lc 2, 35 e Ex 20, 15, é traduzida e mantida em itálico.
  - Arts. 1-3, art. 5 e art. 6: as quebras de linha com dois espaços no fim dos parágrafos do latim não aparecem no pt-BR. São quebras de parágrafo de qualquer modo (há linha em branco depois); não há perda de conteúdo nem de estrutura.
- Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-6/review-6.md` (fora do corpus).

### Round 7

- Foco: leitura bilíngue cláusula a cláusula (la × pt-BR) de todos os capítulos, à procura de negação invertida, sujeito ou objeto trocado, tempo ou modo errado, falsos cognatos, qualificador omitido e citação puxada para a redação bíblica corrente; mais a auditoria mecânica e o `book.json`.
- Veredito: limpo. Nenhuma alteração nos capítulos, no `book.json` nem nos Key Terms.
- Rejeitados:
  - Art. 4, *pueri Iesu nati* → "do menino Jesus recém-nascido": *natus* qualifica o Menino já nascido, no contexto da Natividade e da estrela; "recém-nascido" é tradução defensável e não acrescenta conteúdo.
  - Art. 4, *nisi super hoc error aut scandalum oriatur* → "a não ser que daí nasça erro ou escândalo": *super hoc* ("a propósito disto") e "daí" ligam igualmente o erro à pregação; o sentido não muda.
- Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-6/review-7.md` (fora do corpus).
