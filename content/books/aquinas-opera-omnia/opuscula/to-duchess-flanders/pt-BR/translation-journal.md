# Diário de Tradução — Do Governo dos Judeus, à Duquesa de Brabante (pt-BR)

Fonte canônica: `la/` (texto latino das edições Leonina / Marietti, via aquinas.cc). Consulta secundária: `en-US/`, somente para registro e terminologia, conforme o precedente de *Do Ente e da Essência*.
Destino: pt-BR.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| Articulus | Artigo | Títulos `# Artigo N`, como em `articles-6`. |
| exactio / exactionem facere in | exação / fazer exação sobre | Cobrança imposta pelo senhor; "exação" mantém o termo técnico. |
| usura / usurarius / usuraria pravitas | usura / usurário / perversidade da usura | |
| moderamen / moderatio | moderação | |
| reditus | rendas | Não "salários" (inglês). |
| collectae | coletas | |
| stipendia | soldos | Em Lc 3, 14 e na conclusão do art. 6 ("como que os seus soldos"). Exceção: em 1Cor 9, 7 *nullus militat stipendiis suis* → "ninguém milita à própria custa" (sentido idiomático); o elo com a glosa passa por "milita". |
| balivi et officiales | bailios e oficiais | |
| officium | ofício | |
| mutuum | empréstimo | |
| certae personae | pessoas certas | Pessoas determinadas, identificáveis. |
| in pios usus | em usos piedosos | |
| utilitas communis | utilidade comum | |
| poena pecuniaria | pena pecuniária | |
| encenium (= xenium) | presente | |
| Cavorsini | caorsinos | Banqueiros de Cahors; forma portuguesa do gentílico, sem nota. |
| apostolus | o Apóstolo | Como nas obras irmãs. |
| Moyses / Salomon / Ioannes Baptista | Moisés / Salomão / João Batista | |
| dominatio vestra | Vossa Senhoria | Fórmula de despedida segue `to-bernard-abbot` ("goze de saúde"). |
| vestra excellentia | Vossa Excelência | Tratamento por "vós" em toda a carta. |

## Decisões

- 2026-10-03: Tradução do latim, oito arquivos, mesmos títulos e parágrafos (20 parágrafos de corpo), com os dois espaços finais dos parágrafos espelhados.
- As citações bíblicas seguem a redação latina da carta, não a Vulgata nem uma Bíblia portuguesa: em Êx 18, 21–22, *in quibus sit charitas* → "nos quais haja caridade" (o inglês traz "truth"); *cognatus* → "parente" (não "sogro"); Pr 19, 25 *pestilente flagellato stultus sapientior erit* → "flagelado o pestilento, o insensato se tornará mais sábio".
- Única referência bíblica explícita no latim (*Ezech. XXII, 27*) → "Ez 22, 27", no estilo das obras irmãs. As demais referências entre parênteses do inglês são aparato editorial e não foram importadas.
- O inglês acrescenta "or to force loans" no artigo 6 e glosas entre colchetes nos artigos 2 e 4; ausentes do latim, não foram seguidas.
- Art. 1: *aliquo tempore, et quo* → "em algum tempo, e em qual" (o inglês lê "in what way").
- Art. 5: o singular *daret* ("se desse o empréstimo") fica impessoal, sem forçar sujeito.
- Art. 6: *per quemdam prophetam* → "por certo profeta" (o inglês diz "the same Prophet").
- Título: traduz o título latino (*De Regimine Iudaeorum ad Ducissam Brabantiae*), como `to-bernard-abbot`; o título inglês ("Letter to the Duchess of Brabant on the rule of Jews") não é a fonte. O id do livro menciona Flandres, mas o texto e os metadados dizem Brabante; mantido Brabante.
- Linguagem do texto medieval sobre os judeus (servidão, sinal distintivo) traduzida fielmente, sem atenuação nem nota.
- Sem notas na fonte; nenhuma nota do tradutor.
- `book.json`: entradas pt-BR em `name`, `author`, `description`, `languages` e títulos do sumário (campos já existentes). A descrição en-US/la cita juramentos (*oath-taking*), assunto ausente da carta; a pt-BR descreve o que o texto trata (usura, exações, venda de ofícios, traje).

## Edições na fonte

Nenhuma.

## Review log

### Round 1

Foco: completude parágrafo a parágrafo; nomes e números das referências bíblicas. Mais a auditoria mecânica (arquivos, `book.json`, títulos, notas, latim, formatação).

Veredito: texto completo (20 parágrafos de corpo alinhados um a um, nenhuma citação ou parêntese omitido, `Ez 22, 27` correto). Um defeito no diário.

Corrigido:
- Termos-chave, linha *stipendia*: dizia "soldos" e afirmava ligar 1Cor 9, 7 a Lc 3, 14 por esse termo, mas o art. 6 traduz *nullus militat stipendiis suis* por "ninguém milita à própria custa". Linha reescrita para registrar a exceção; o texto ficou como está, porque "com os seus próprios soldos" inverteria o sentido (o soldado que se paga a si mesmo).

Considerados e rejeitados:
- Art. 4, *Quod enim Christiani minus requirunt* → "Que os cristãos reclamem menos…" sem conector: o *enim* só introduz a explicação, que a frase anterior ("A resposta a isso é clara pelo que já foi dito") já anuncia; nada se perde.
- Art. 4, *cum tamen Iudaei prompte se offerrent* → "contanto que os judeus se oferecessem prontamente": leitura condicional defensável (o inglês também lê "but only when").
- Art. 4, *intelligendum est de Cavorsinis* → "deve-se entender também dos caorsinos": o "também" explicita o que o latim pressupõe; não acrescenta conteúdo.
- Art. 5, *si liceat eis officia vendere* → "se vos é lícito vender-lhes os ofícios": *eis* é dativo de *vendere* (a resposta diz *liceat vobis vendere*), não sujeito de *liceat*.
- Art. 7, *plana est responsio: quia* → "a resposta é simples:" sem "porque": o *quia* aqui só introduz a resposta.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__to-duchess-flanders/review-1.md`.

### Round 2

Foco: leitura bilíngue cláusula a cláusula (negações, sujeitos e objetos, tempos e modos, falsos cognatos, qualificadores, citações bíblicas na redação da carta). Mais a auditoria mecânica.

Veredito: limpo. Nenhum defeito; nada alterado.

Considerados e rejeitados:
- Art. 5, *et vestra etiam commoda non sic fideliter procurare* → "e não procurem tão fielmente nem mesmo os vossos interesses": sob negação, *etiam* admite "nem mesmo" (até os interesses da própria duquesa), leitura defensável.
- Art. 6, *ad alia quae imminent rationabiliter principibus expetenda* → "que razoavelmente incumbe aos príncipes custear": no contexto de rendas insuficientes, as coisas a buscar são despesas; "custear" traduz o sentido, e a concordância impessoal ("incumbe … custear") está correta.
- Art. 6, Ez 22, 27 *principes eius in medio eius* → "os seus príncipes no meio dela": o feminino retoma a cidade/terra do contexto profético; escolha obrigatória e justificada.
- Art. 8, *fimbrias per quatuor angulos palliorum, per quos ab aliis discernantur* → "franjas … pelas quais se distingam": *quos* concorda com *angulos*, mas o que distingue são as franjas (Nm 15, 38–39); a concordância frouxa do latim medieval não obriga o pt-BR a ligar a distinção aos "cantos".

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__to-duchess-flanders/review-2.md`.

### Round 3

Foco: leitura às cegas do pt-BR (gramática, concordância, regência, pronomes), depois varredura só de ortografia, acentos, crase, hífen e pontuação. Mais a auditoria mecânica.

Veredito: limpo. Nenhum defeito; nada alterado.

Considerados e rejeitados:
- Art. 1, *debet eis restitui, alioquin debet in pios usus … erogari* → "deve-se restituir a elas; do contrário, deve-se empregá-lo": o "-lo" é o neutro ("isso", o que foi cobrado), e o latim é impessoal. "empregá-las" se prenderia a "elas" (as pessoas) e mudaria o sentido.
- Art. 1, *responderi potest, quia licet … quia tamen … hoc servandum videtur* → "pode-se responder que, embora …; como, porém, … parece que se deve observar": o anacoluto é do próprio latim; o pt-BR o espelha e continua analisável.
- Art. 4, *et tunc ipsi debent restituere* → "e então eles mesmos devem restituir": a ambiguidade de *ipsi* é do latim; não cabe ao pt-BR resolvê-la.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__to-duchess-flanders/review-3.md`.
