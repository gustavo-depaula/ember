# Diário de Tradução — Do segredo (pt-BR)

Fonte (canônica): `la/` (texto latino Leonino/Marietti, via aquinas.cc)
Consulta secundária: nenhuma — o livro não tem `en-US/`
Destino: pt-BR

Convenções herdadas das obras irmãs de São Tomás em pt-BR: autor "Santo Tomás de Aquino" (forma majoritária nos `book.json` de `aquinas-opera-omnia`), "frei Tomás de Aquino" minúsculo (`to-john-vercelli`), *praelatus / subditus* = prelado / súdito, *lector* = leitor, títulos de toc "Proêmio" e "Questão N".

## Termos-chave

| Latim | Português (pt-BR) | Notas |
|---|---|---|
| De Secreto | Do segredo | título |
| capitulum generale / capitulum | capítulo geral / capítulo | |
| magister ordinis | mestre da Ordem | |
| definitores | definidores | |
| lector / magister | leitor / mestre | |
| frater | frei (antes de nome); frade | *frater unus accusat alterum* = "um frade acusa outro" |
| praelatus / subditus | prelado / súdito | |
| praelatus religiosus / iudex saecularis | prelado religioso / juiz secular | |
| praecipere / praeceptum | ordenar / preceito | *per praeceptum* = "por preceito" |
| secretum / sub secreto | segredo / sob segredo | |
| occultum / manifestum | oculto / manifesto | *in occultis* = "nas coisas ocultas" |
| se pandere / se prodere | descobrir-se / delatar-se | *prodatur peccatum* = "se delate o pecado" |
| accusans / accusatus / delatus | acusador / acusado / delatado | |
| denuntiare / denuntiatio | denunciar / denúncia | |
| inquirere / inquisitio | inquirir / inquisição | |
| fama / infamia | fama / infâmia | sentido jurídico (rumor público) |
| forum iudiciale vel contentiosum | foro judicial, ou contencioso | |
| poena talionis | pena de talião | |
| iura | o direito | |
| confitens | quem se confessa | |
| littera | carta | |
| fides (contra fidem) | fidelidade | joga com *fideliter* |
| Augustinus | Agostinho | sem "Santo", como no latim |

### Nomes do proêmio

Tomás de Aquino, Bom-Homem (*Bonus Homo*), Pedro de Tarentaise (forma já usada no corpus), Bartolomeu, Balduíno, Gilberto (*Gilibertus*).

## Decisões de tradução

- **Aparato editorial**: não há notas de editor no latim; nada foi omitido.
- **Estrutura**: espelha o latim parágrafo a parágrafo, inclusive os dois espaços finais de linha.
- **Data**: *Anno Domini MCCLXIX* mantém os romanos: "no Ano do Senhor de MCCLXIX".
- **Respondeo dicendum**: "Respondo dizendo", fórmula escolástica literal; *Respondendum* (q. 4) = "Deve-se responder".
- **Perguntas diretas**: as questões de pergunta dupla (*potest ne… et utrum…*, q. 1; *utrum… et utrum…*, q. 3) e a de *potest ne* (q. 6) viram perguntas diretas em português; as de *utrum* simples ficam indiretas (q. 2, 4), assim como o *Quaeritur ergo utrum… vel utrum…* da q. 5.
- **Falas citadas** (a resposta sugerida ao acusado, q. 3; a fala do confessor, q. 5; a fórmula do preceito, q. 6) entre aspas duplas retas, que o latim não marca, para a leitura não confundir quem fala.
- **Leituras duvidosas da edição, espelhadas** (sem correção no latim, por não serem deslize de OCR inequívoco):
  - q. 1 *vinci poterit per duos, scilicet praelatum et accusatum*: o sentido pede "acusador"; traduzido "o acusado", como no texto.
  - q. 4 *ex receptione secreti* e *percepti secreti*: traduzidos "do recebimento do segredo" e "do segredo recebido".
  - q. 5 *nec esse propter iuramentum*: *esse* parece corrupção (de *etiam*?); traduzido pelo sentido, "nem por causa do juramento".
  - q. 6 *praecipio, ut qui hoc fecit, vel scit, tenetur dicere*: indicativo do latim mantido ("está obrigado a dizê-lo").
- **Explicit**: *Expliciunt quaestiones super revelationes secreti Thome et aliorum magistrorum* = "Terminam as questões sobre as revelações do segredo, de Tomás e de outros mestres".

## Correções na fonte latina (`la/`)

Nenhuma.

## Review log

### Round 1

- **Foco:** completude parágrafo por parágrafo contra `la/`, incluindo citações e referências. **Veredito: CLEAN**; nenhum defeito confirmado ou corrigido.
- **Rejeitado — aspas retas:** c04 [3], `sed dicat: probet quod dicit accusans`; c06 [2], `Alter respondet: licet extra confessionem receperim`; c07 [3], `sic: praecipio, ut qui hoc fecit`. Os três alertas mecânicos correspondem a falas delimitadas conforme a decisão existente; as regras do repositório não autorizam normalização de aspas.
- **Rejeitado — c02 [2], “o acusado”:** `per duos, scilicet praelatum et accusatum`; corresponde ao latim transmitido, embora o contexto sugira “acusador”. Mantida a leitura já documentada, sem emenda conjectural.
- **Rejeitado — c05 [3], “recebimento”/“recebido”:** `ex receptione secreti` e `ex observatione percepti secreti`; as traduções correspondem às formas presentes, sem motivo para conjecturar outra leitura.
- **Rejeitado — c06 [5], aparente omissão de `esse`:** `nec esse propter iuramentum a iudice requisitum`; o infinitivo não se integra coerentemente à oração transmitida. “Nem por causa do juramento requerido pelo juiz” conserva o argumento, com a dificuldade já registrada.
- **Rejeitado — c07 [3], “está obrigado” após “Ordeno que”:** `praecipio, ut qui hoc fecit, vel scit, tenetur dicere`; o indicativo reproduz a irregularidade da fórmula original por decisão explícita, conforme a diretriz de preservar particularidades da edição.
- **Evidência:** `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-secreto/review-1.md`.

### Round 2

- **Foco:** leitura bilíngue de fidelidade, oração por oração, contra `la/`. **Veredito: 1 defeito**, no diário; texto dos capítulos sem alteração.
- **Corrigido — diário, "Perguntas diretas":** dizia que a q. 3 tem *potest ne… et utrum…*; o latim da q. 3 é *utrum praelatus debeat… et utrum accusatus teneatur*. A entrada agora descreve cada caso como está no texto (q. 1 *potest ne… et utrum*, q. 3 *utrum… et utrum*, q. 6 *potest ne*; q. 5 indireta).
- **Rejeitado — c07 [2], "e deve revelá-lo aquele que o fez":** `potest ne praelatus inquirere per praeceptum, et ille qui fecerit, revelare?`. O segundo infinitivo tem sujeito próprio, e a construção é elíptica; ler "deve" segue o sentido da disputa (se o culpado está obrigado, como nas q. 1 e 3). Não há contradição com o latim.
- **Rejeitado — c06 [2], "não pode ser manifestado":** `nec potest manifestari praelato`; o sujeito é implícito no latim ("isto", a origem da carta), e o masculino neutro em português o reproduz.
- **Rejeitado — c06 [2], "dar crédito a quem assim fala":** `credere dicenti`; o "assim" só explicita que *dicenti* é o confessor que acabou de falar, sem acrescentar conteúdo.
- **Rejeitado — c05 [3], "pode o prelado, neste caso, ordenar":** `potest in hoc casu praecipere`; o sujeito implícito é o prelado do enunciado da questão, e explicitá-lo não muda o sentido.
- **Rejeitado — diário, "Pedro de Tarentaise (forma já usada no corpus)":** a forma "Tarentaise" ocorre no corpus (en-US, *Peter of Tarentaise*, na enciclopédia católica e em Ligório), embora não em pt-BR; a afirmação não é falsa.
- **Mantidas as rejeições da rodada 1** (aspas retas, "o acusado", *receptione*, *nec esse*, indicativo da fórmula da q. 6), pelas mesmas razões.
- **Evidência:** `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-secreto/review-2.md`.

### Round 3

- **Foco:** leitura integral do português sem a fonte, seguida de verificação no latim e varredura de ortografia, acentuação, crase, hifenização, pontuação e pareamento de aspas. **Veredito: CLEAN**; nenhum defeito confirmado ou corrigido.
- **Rejeitado — c01 [2], “Também diante dos mestres”:** `Item coram magistris simul congregatis`; a frase elíptica retoma “As questões [...] foram propostas” da anterior, como no latim, sem perda de sentido.
- **Rejeitado — c02 [2], “o prelado e o acusado”:** `scilicet praelatum et accusatum`; a dificuldade lógica pertence à fonte e já está documentada. Trocar por “acusador” seria emenda conjectural.
- **Rejeitado — c05 [3], “ameaça perigo” / “não ameaça nenhum perigo”:** `periculum praeeminet` / `nullum imminet periculum`; “perigo” é o sujeito posposto de “ameaça”, empregado absolutamente no sentido de estar iminente. Construção formal, mas inteligível e sem erro de concordância.
- **Rejeitado — c06 [2], “não pode ser manifestado”:** `nec potest manifestari praelato`; mantida a análise da rodada 2: o sujeito implícito é o fato de onde veio a carta, não a própria carta. Não cabe corrigir automaticamente para o feminino.
- **Rejeitado — c06 [4], “responder a verdade”:** `respondere sicut iudici veritatem`; “a verdade” é o conteúdo respondido, objeto direto, e “como a um juiz” indica o destinatário. Não falta crase.
- **Rejeitado — c07 [3], “Ordeno que [...] está obrigado”:** `praecipio, ut qui hoc fecit, vel scit, tenetur dicere`; mantida a irregularidade expressamente documentada da fonte, sem substituir o indicativo por subjuntivo.
- **Rejeitados — alertas de aspas retas em c04 [3], c06 [2] e c07 [3]:** `sed dicat: probet quod dicit accusans`; `Alter respondet: licet extra confessionem receperim`; `sic: praecipio, ut qui hoc fecit`. São pares completos delimitando falas, de acordo com a decisão do diário e com a regra que proíbe normalização por livro.
- **Evidência:** `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-secreto/review-3.md`.

### Round 4

- **Foco:** palavras funcionais (preposições, artigos, demonstrativos, conectivos, possessivos), títulos e pontos em que o português precisa decidir o que o latim deixa aberto. **Veredito: CLEAN**; nenhum defeito confirmado ou corrigido. Não há tratamento de segunda pessoa no livro.
- **Rejeitado — c02 [2], "Pois, se o fizer":** `Quod si fecerit, et vinci poterit`; *quod si* é conectivo, e "Pois" explicita que a frase motiva a pergunta, que é sua função no latim.
- **Rejeitado — c05 [2], "ao prelado dele":** `ut illi praelato denuntiet`; *illi* admite a leitura de dativo de referência ("seu prelado"), e o prelado é o mesmo que depois inquire. O possessivo não altera o caso.
- **Rejeitado — c05 [4], "e aquele está obrigado":** `et ille tenetur obedire`; "aquele" pode parecer retomar "o acusador", mas o latim tem a mesma ambiguidade, resolvida pelo contexto (o interrogado).
- **Rejeitado — c07 [4], "de outros mestres":** `Thome et aliorum magistrorum`; o latim não tem artigo e o explicit é título de copista; a leitura indefinida é válida, embora *alii magistri* seja "os outros mestres" em c06 [5] e c07 [3].
- **Mantidas as rejeições das rodadas anteriores** (aspas retas, "o acusado", *receptione*, *nec esse*, indicativo da fórmula da q. 6).
- **Evidência:** `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-secreto/review-4.md`.
