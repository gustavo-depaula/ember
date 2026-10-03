# Diário de Tradução — Das Razões da Fé contra os Sarracenos, Gregos e Armênios (pt-BR)

Fonte (canônica): `la/` (texto latino Leonino/Marietti, via aquinas.cc)
Consulta secundária: `en-US/` (Kenny, revisada) — somente para registro e terminologia
Destino: pt-BR

Convenções herdadas das obras irmãs de São Tomás em pt-BR (*Dos Artigos da Fé*, *Do Ente e da Essência*): nome do autor, "infernos" (plural) na descida de Cristo, nomes de hereges, "o Apóstolo", vocabulário escolástico.

## Termos-chave

| Latim | Português (pt-BR) | Notas |
|---|---|---|
| Saraceni | sarracenos | minúsculo no texto, como nas demais obras do corpus; no `name` do `book.json` "Sarracenos, Gregos e Armênios" segue a capitalização de título do corpus (cf. *Discurso aos Gregos*) |
| Graeci / Armeni | gregos / armênios | |
| infideles | infiéis | |
| satisfactio (1 Pd 3, 15) | satisfação | "dar satisfação"; mantido porque o cap. 2 opõe *probatio* a *satisfactio* |
| verbum (mentis, intellectus) | verbo | "palavra" para a palavra falada ou escrita: *verbum exterius* (cap. 3), *verbum crucis* (caps. 1 e 7), *verbum cordis* / *verbum quod in corde manet* (cap. 6), *verbum deprecatorium* (cap. 7), *verbum otiosum* (cap. 9) e o plural *verba* (*humanis verbis*, caps. 3, 4 e 6; *ex quibus verbis*, cap. 9) |
| Verbum Dei | Verbo de Deus | maiúscula quando designa o Filho |
| conceptus mentis | conceito da mente | |
| intelligere / esse | entender / ser | *esse* = ser (ato), como em *Do Ente e da Essência* |
| virtus | virtude | potência operativa (intelectual, geradora, natural, divina); o cap. 6 encadeia a *virtus* da natureza espiritual e a de Deus no mesmo argumento, por isso uma só palavra. "poder de Deus" apenas nas citações paulinas (*Dei virtus*) |
| potestas / potentia | poder | exceto: *in potentia* (oposto a *in actu*, cap. 3) = "em potência"; *rationales potestates* (cap. 10) = "potências racionais"; *principatus et potestates* (cap. 9) = "principados e potestades" |
| ratio (procedentis, humanitatis) | razão | "razão de algo que procede", "razão de humanidade" |
| processio / processus | processão | |
| persona / hypostasis / suppositum | pessoa / hipóstase / supósito | |
| natura / essentia / deitas / divinitas | natureza / essência / deidade / divindade | |
| in abstracto / in concreto | em abstrato / em concreto | |
| assumere / assumptio | assumir / assunção | |
| inhabitatio | inabitação | |
| satisfactio condigna | satisfação condigna | cap. 7 |
| iniuria | injúria | |
| purgatorium / poenae purgatoriae | purgatório / penas purgatórias | |
| infernus / inferi / inferna | inferno / infernos | "desceu aos infernos" (Símbolo); "sepultado no inferno" (Lc 16) |
| peccatum veniale / mortale | pecado venial / mortal | |
| superindui / indui / expoliari | ser sobrevestidos / ser vestidos / ser despojados | 2 Cor 5; *superinduitio* = "sobrevestir-se", *induitio simplex* = "simplesmente vestir-se" |
| per speciem / per fidem | pela visão / pela fé | |
| praescientia / ordinatio / praedestinatio | presciência / ordenação / predestinação | |
| liberum arbitrium / libertas arbitrii | livre-arbítrio / liberdade do arbítrio | |
| contingentia | coisas contingentes | |
| Arius, Sabellius, Eutyches, Nestorius, Origenes | Ário, Sabélio, Êutiques, Nestório, Orígenes | grafia de *Dos Artigos da Fé* |

## Decisões de tradução

- **Estrutura**: espelha o latim linha a linha, inclusive a irregularidade dos subtítulos: em `ch001`–`ch006` e `ch009` o subtítulo está em `***…***`; em `ch007`, `ch008` e `ch010` é uma linha simples com dois espaços finais. Os dois espaços finais de cada parágrafo foram mantidos.
- **Títulos**: os subtítulos dos capítulos traduzem o latim, não os títulos da en-US. Na `toc` do `book.json`, `Capítulo N — <subtítulo>`; os subtítulos longos dos caps. 7, 8 e 10 foram abreviados na `toc` (sem a cláusula "e que disso não se segue nenhum inconveniente" / "e como se deve proceder nesta questão"; no cap. 7, também sem "o que se diz:"), mas estão completos no capítulo.
- **Referências bíblicas**: o latim não traz referências de capítulo e versículo (só "em Lucas", "por Jó", "na Segunda Epístola aos Coríntios"…). As referências entre parênteses da en-US (e as do Alcorão) são aparato do tradutor Kenny e foram omitidas, como no latim.
- **Citações bíblicas**: traduzidas da letra latina que São Tomás cita, no registro Figueiredo / Matos Soares. Em 1 Pd 3, 15 conserva-se o acréscimo *et fide* de São Tomás ("da esperança e da fé que há em vós"). Em 2 Cor 5 (cap. 9) a glosa comenta palavra por palavra, por isso *superindui*, *indui*, *expoliari*, *supervestiri* mantêm o mesmo verbo em toda a passagem.
- **"Sortes"** (cap. 10): o exemplo escolástico *Sortes* foi vertido "Sócrates", forma por extenso do nome.
- **"Muçulmanos"**: usado só na `description` do `book.json` (que já diz *Musulmanorum* em latim); no texto, "sarracenos".
- **Aparato editorial**: não há notas de rodapé no latim; nada a omitir. Nenhuma nota do tradutor foi acrescentada.

## Edições na fonte

- `la/ch001.md`: `Domini nostri lesu Christi` → `Iesu` (erro de OCR, `l` por `I`).

## Review log

### Round 1

Foco: completude parágrafo a parágrafo (alinhamento 1:1 latim ↔ pt-BR em todos os 10 capítulos), citações, parênteses, nomes de livros bíblicos e referências; auditoria mecânica e `book.json`. Veredito: 3 defeitos, todos corrigidos. Alinhamento completo: 122 blocos (títulos e subtítulos incluídos) no latim e no pt-BR, sem omissões, acréscimos, fusões ou divisões; itálicos e espaços finais em paridade.

Defeitos corrigidos:
- `ch009` §6 (2 Cor 5, 2): *desejando ser sobrevestidos da nossa habitação celeste* → *…da habitação celeste*. O latim cita *superindui habitationem caelestem*, sem *nostram*; o "nossa" vinha da Vulgata, não do texto de São Tomás.
- `ch005` §6: "não pela necessidade de uma força exterior" → "…de uma virtude exterior". *exterioris virtutis*; a tabela de Termos-chave fixa *virtus* = "virtude" (só "poder de Deus" nas citações paulinas).
- Termos-chave, linha *potestas / potentia*: afirmava "poder" sem exceção, mas o texto usa, corretamente, "em potência" (cap. 3), "potências racionais" (cap. 10) e "potestades" (cap. 9). Linha corrigida com as exceções.

Achados considerados e rejeitados:
- `ch007` §4, *hoc igitur decuit Filium Dei … hominibus ostendere …, ut homines temporalia bona vel mala pro nihilo ducerent* → "convinha … que o Filho de Deus mostrasse aos homens … que os homens tivessem em nada os bens…". Lê *hoc … ut* como explicativo ("isto, a saber, que"), construção latina legítima; não é omissão de *hoc*.
- `ch009` §15, *differtur ergo eorum gloria … usque ad diem iudicii* → "seria adiada". O indicativo latino está numa redução ao absurdo ("o que parece de todo improvável"); o condicional explicita a hipótese sem mudar o sentido.
- `ch009` §20, *iterum venio* → "virei outra vez", e mais adiante *venio tibi* → "venho a ti". Presente com valor de futuro em Jo 14, 3; ambas as formas são fiéis.
- `ch010` §8, *sic enim ordinat res sicut agit eas* → "assim como as faz agir". *agere res* em São Tomás é mover as coisas à ação; leitura defensável, coerente com §11 (*movet singula ad suos actus*).
- `ch005` §3, *hoc igitur conveniens est* → "convinha". Mudança de tempo de estilo, sem alteração de sentido.
- `ch001` §3, *si esset ita magnum sicut mons* → "ainda que fosse grande como um monte". Concessivo defensável no contexto da objeção (em `ch008` §4 o próprio latim diz *etiam si*).

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-rationibus-fidei/review-1.md`.

### Round 2

Foco: leitura bilíngue cláusula por cláusula, latim ↔ pt-BR, nos 10 capítulos inteiros (negação, sujeito/objeto, tempo e modo, falsos cognatos, qualificadores, citações puxadas para a Bíblia conhecida); auditoria mecânica e `book.json`. Veredito: 1 defeito, corrigido.

Defeito corrigido:
- `ch009` §9 (2 Cor 5, 5): *E o que nos fez para isto mesmo* → *E o que nos faz para isto mesmo*. O latim diz *efficit* (presente), e a glosa logo a seguir (*quomodo nos in hoc efficiat* = "como nos faz para isto") retoma o verbo no presente; com "fez" a glosa não encontrava a sua palavra na citação.

Achados considerados e rejeitados:
- `ch009` §19, *Dies Domini declarabit, quia in igne revelabitur* → "O dia do Senhor a manifestará". O pronome supre o objeto implícito (*opus*, do versículo anterior), exigido pelo verbo transitivo em português; não acrescenta sentido.
- `ch008` §5, *in praestigiis artium magicarum* → "nos prestígios das artes mágicas". "Prestígio" conserva em português o sentido de ilusão produzida por artes mágicas; não é falso cognato aqui.
- `ch004` §4, *Spiritum Sanctum esse a Filio* → "o Espírito Santo procede do Filho". Num argumento sobre processão, *esse a* indica origem; mesmo sentido.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-rationibus-fidei/review-2.md`.

### Round 3

Foco: leitura a frio do pt-BR sem a fonte (gramática, concordância, regência, pronomes, sentido), com cada marca verificada depois no latim; varredura só de ortografia, diacríticos, crase, hífens (Acordo de 1990), pontuação e pares de aspas/itálicos; auditoria mecânica, `book.json` e conferência dos Termos-chave contra os capítulos. Veredito: 3 defeitos, todos corrigidos.

Defeitos corrigidos:
- `ch003` §4: "Aquele Verbo divino, porém, tem ainda que não é algum acidente" → "…tem ainda isto: não é algum acidente". *habet ulterius quod non sit*; "ter" não rege oração com "que" em português, e a frase lia-se como um "ter que" truncado.
- `ch009` §1: "dividir a essência da divindade" → "…da deidade". O latim diz *deitatis essentiam*; os Termos-chave fixam *deitas* = "deidade" (como no cap. 4), *divinitas* = "divindade".
- Termos-chave, linha *Saraceni*: dizia "minúsculo … também no título", mas o `name` do `book.json` traz "Sarracenos, Gregos e Armênios" em capitalização de título, convenção dos títulos do corpus. Linha corrigida para descrever o que o texto faz; o título não foi alterado.

Achados considerados e rejeitados:
- `ch006` §3, *ut tamen nec altera natura transiret … nec … conflaretur …, sed post unionem duae naturae distinctae remaneant* → "passasse … fundisse … permaneçam". A mistura de tempos está no latim; o presente marca o estado que perdura.
- `ch008` §4, *spiritualis et divina refectio haberetur et omnino quasi cibus et potus communis* → "fossem tidos como refeição espiritual e divina e em tudo como comida e bebida comuns". Parece contraditório numa leitura a frio, mas é o latim: alimento espiritual tomado em tudo à maneira de comida comum, daí as espécies de pão e vinho.
- `ch004` §8, *differenter convenit eis secundum materialem divisionem* → "convém-lhes de modo diferente segundo a divisão material". Fiel.
- `ch006` §14, "se se considera segundo o quê elas se dizem" (*secundum quid*). O acento em "quê" marca o pronome interrogativo tônico e evita ler "segundo o que" como relativo; não é erro ortográfico.
- "se se" (`ch004`, `ch005`, `ch006`, `ch007`): condicional + pronome ("se se tira", "se se corrompe", "se se considera"), não palavra duplicada.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-rationibus-fidei/review-3.md`.

### Round 4

Foco: palavras funcionais (preposições, artigos, demonstrativos, conjunções e conectores adversativos, possessivo "seu/sua"), títulos e subtítulos, e os pontos em que o português tem de se comprometer e o latim fica aberto (gênero e antecedente de relativos e pronomes, tratamento tu/vós); auditoria mecânica e `book.json`. Veredito: 4 defeitos, todos corrigidos.

Defeitos corrigidos:
- `ch008`, subtítulo: "Como se deve entender o que se diz: que os fiéis recebem…" → "Como se deve entender que os fiéis recebem…". O latim (*Qualiter sit accipiendum quod fideles sumunt*) não tem *dicitur*, ao contrário do cap. 7; "o que se diz" era acréscimo.
- `ch007` §7: "se ele tivesse vivido no mundo rico, poderoso e constituído em alguma grande dignidade" → "se ele tivesse vivido rico, poderoso e constituído em alguma grande dignidade no mundo". No latim *dives, potens* (nominativo) predicam Cristo; em português "no mundo rico, poderoso" lia-se como atributo de "mundo".
- `ch003` §3: "uma semelhança do intelecto que procede de sua virtude intelectual" → "uma semelhança do intelecto, a qual procede da sua virtude intelectual". *procedens* refere-se a *similitudo* (é o verbo que procede); o "que" ligava-se ao antecedente mais próximo, "intelecto".
- Decisões de tradução, "Títulos": dizia que a `toc` dos caps. 7, 8 e 10 só omite a cláusula final, mas a do cap. 7 omite também "o que se diz:". Linha completada.

Achados considerados e rejeitados:
- `ch005` §7 e §9, *pro eius salute* → "quis fazer-se homem para a sua salvação", com Deus por sujeito. *eius* é o homem / a natureza humana; o sentido exclui a leitura reflexiva e a construção é a corrente em português.
- `ch005` §5, *quandiu corpori … unitur* → "enquanto ele está unido a um corpo". O latim não expressa o sujeito; o único antecedente animado é *homine*, e a oração seguinte passa explicitamente a *anima*.
- `ch009` §12, *latroni confitenti in cruce* → "ao ladrão que o confessava na cruz". O pronome supre o objeto que *confiteri* absoluto subentende (Lc 23, 42: o ladrão reconhece Cristo); não muda o sentido.
- `ch009` §14, *quare magis hanc poenam quam aliam … pati* → "sofram esta pena antes que outra". "antes … que" com nome é preferência ("antes isto que aquilo"), não tempo; fiel.
- `ch002` §1, *a nobis autem creduntur* → "e nós os cremos". *autem* aqui é continuativo, não opõe; "os" retoma "artigos da fé".
- `ch010` §4, *Punctum igitur* → "Ora, o ponto". *igitur* retoma a divisão feita na frase anterior, não conclui; transição equivalente.
- `ch010` §9, *quod operatur in omnibus* → "que ela opera". Sujeito implícito; "virtude divina" é o antecedente expresso e o sentido é o mesmo.
- `ch006` §4, *et unaquaque utitur pro suo arbitrio* → "e Deus se serve de cada uma". A frase seguinte (*per efficaciam suae virtutis uniretur*) exige Deus como sujeito.
- `ch003` §5, *procedit ab alio in similitudinem eius* → "procede de outro à sua semelhança". Fórmula fixa ("à sua imagem e semelhança") que aponta para a origem; "que ele" logo depois retoma o mesmo "outro".
- `ch007`, subtítulo, "o que se diz: que o Verbo…" espelha *quod dicitur Verbum Dei esse passum*; mantido.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-rationibus-fidei/review-4.md`.

### Round 5

Foco: diferença de frequência de termos por capítulo contra os Termos-chave, nos dois sentidos; conferência de cada afirmação verificável do diário (as duas colunas da tabela, formas citadas, números de parágrafo); nomes próprios contra a forma portuguesa corrente e as obras irmãs; auditoria mecânica e `book.json`. Veredito: 2 defeitos, ambos no diário, corrigidos. Os capítulos e o `book.json` não foram alterados.

Defeitos corrigidos:
- Termos-chave, linha *verbum*: dizia "palavra" *só* para *verbum exterius* / *vox*, *verbum crucis* e *verbum cordis*, mas o texto usa também, corretamente, "palavra de súplica" (*verbum deprecatorium*, cap. 7), "palavra ociosa" (*verbum otiosum*, cap. 9) e "palavras" para o plural *verba* (*humanis verbis*, caps. 3, 4 e 6; *ex quibus verbis*, cap. 9). Linha reescrita com a lista completa.
- Números de parágrafo nas rodadas 1–3: a rodada 1 e a 3 contavam blocos (título e subtítulo incluídos) e a 2 contava linhas do arquivo, ao passo que a 4 conta parágrafos; lidos como parágrafos, os localizadores das rodadas 1–3 apontavam para o parágrafo errado (p. ex. "ch009 §21" para o que é o §9). Todos convertidos para a numeração de parágrafos do corpo do texto, sem contar título e subtítulo, que passa a ser a convenção deste registro.

Achados considerados e rejeitados:
- `ch004` §2, *secundum quendam ordinem vel motum appetentis ad res* → "segundo certa ordenação ou movimento". "ordenação" aparece aqui para *ordo*, não para *ordinatio*; o sentido (orientação do que apetece para o objeto) é o mesmo, e *ordo* não tem outra tradução fixada na tabela. Fiel; não contradiz a linha *ordinatio*.
- `ch007` §2, *alioquin omnia eius opera similis ratio irritabit* → "um raciocínio semelhante". A linha *ratio* da tabela cobre a *ratio* de algo (*procedentis*, *humanitatis*); aqui é o argumento, e "raciocínio" diz o que o latim diz.
- Cabeçalho do diário, "convenções herdadas das obras irmãs (*Dos Artigos da Fé*, *Do Ente e da Essência*): nome do autor…". *Do Ente e da Essência* traz "Santo Tomás de Aquino" no `book.json`; a lista é a soma do que vem de cada obra, e o nome do autor ("São Tomás de Aquino") vem de *Dos Artigos da Fé*, onde está assim. Não é afirmação falsa.
- `ch009` §1–2, "Êutiques". *Dos Artigos da Fé* também traz "Eutíquio", mas para o patriarca Eutíquio de Constantinopla (outra pessoa); o monofisita é "Êutiques" lá e aqui.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-rationibus-fidei/review-5.md`.

### Round 6

Foco: completude parágrafo a parágrafo (alinhamento 1:1 latim ↔ pt-BR dos 102 parágrafos dos 10 capítulos), citações, parênteses entre travessões, nomes de livros bíblicos e referências; auditoria mecânica e `book.json`. Veredito: limpo, nenhum defeito; nada alterado.

Achados considerados e rejeitados:
- `ch007` §10, *Si me persecuti sunt, et vos persequentur* → "Se me perseguiram a mim, também vos perseguirão a vós". Os pronomes pleonásticos dão a ênfase de *me … et vos*; não acrescentam conteúdo.
- `ch009` §13, *emanatio quaedam claritatis omnipotentis Dei sincera* → "uma emanação sincera da claridade de Deus onipotente". *quaedam* vai no artigo indefinido; não é omissão.
- `ch010` §1, *consiliandi opportunitas* → "a conveniência de deliberar". *opportunitas* é adequação, utilidade; fiel.
- `ch003` §3, *alioquin nunquam intellectus noster esset quin intelligeret actu* → "o nosso intelecto nunca existiria sem estar entendendo em ato". *esset* tem aqui valor existencial; fiel.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-rationibus-fidei/review-6.md`.

### Round 7

Foco: leitura bilíngue cláusula por cláusula, latim ↔ pt-BR, nos 10 capítulos inteiros (negação, sujeito/objeto, tempo e modo, falsos cognatos, qualificadores, citações puxadas para a Bíblia conhecida); auditoria mecânica e `book.json`. Veredito: limpo, nenhum defeito; nada alterado.

Achados considerados e rejeitados:
- `ch003` §9, *dum ex multis perfectis verbis fit unum verbum perfectius* → "de muitos verbos perfeitos". A en-US (Kenny) lê "imperfect notions", isto é, *imperfectis*. O `la/` traz *perfectis*; a falta do prefixo é variante de edição, não erro de OCR, por isso a fonte não foi editada e o pt-BR a segue corretamente.
- `ch001` §6, *rationes … quas Saraceni recipiunt* → "razões … que os sarracenos aceitem". O subjuntivo indica o tipo de razões pedidas; mesmo sentido (Kenny: "which the Muslims can accept").
- `ch009` §6, *quasi a nostro desiderio retardati* → "como que retardados no nosso desejo". Diz o mesmo que o latim (Kenny: "delayed from reaching our desire").
- `ch009` §11, *quem homines induunt vel etiam inhabitant* → "a quem também habitam". "a quem" é o objeto direto preposicionado obrigatório com "quem" referido a pessoa (Deus); gramatical.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-rationibus-fidei/review-7.md`.
