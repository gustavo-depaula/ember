# Diário de Tradução — Da Compra e Venda a Prazo (pt-BR)

Fonte canônica: `la/`, texto latino (edições Leonina / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (aquinas.cc), somente para terminologia e registro; a estrutura e o texto seguem o latim, conforme o precedente de *Do Ente e da Essência*.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| emptio et venditio ad tempus | compra e venda a prazo | Título; segue o latim, não o título inglês ("A Letter on Credit Sales and Usury"). |
| usura / usurarius / usurarii | usura / usurário / usurários | |
| usuram sapere | ter sabor de usura | Metáfora mantida (inglês: "smacks of usury"). |
| iustum pretium | justo preço | |
| expectatio / dilatio / terminus | espera / dilação / prazo | |
| tempus vendere | vender o tempo | Núcleo do argumento; mantido literal. |
| mercatores / mercationes | mercadores / mercadorias, negócios | *mercationes* = "mercadorias" quando objeto de *vendit*; "negócios" em *expediendis mercationibus* e *maiores mercationes faciant*. |
| panni | panos | |
| commune forum | preço comum do mercado | |
| se conservare indemnem | conservar-se sem prejuízo | |
| electus Capuanus | eleito de Cápua | Arcebispo eleito; título mantido conciso como no latim. |
| dominus Hugo cardinalis | o senhor cardeal Hugo | Hugo de Saint-Cher; sem nota. |
| Iacobus Viterbiensis, lector Florentinus | Tiago de Viterbo, leitor em Florença | |
| frater Thomas de Aquino | frei Tomás de Aquino | Como em `to-bernard-abbot/pt-BR`. |
| nundinae Latiniaci | feiras de Lagny | Nome moderno da cidade (Champagne). |
| tempus resurrectionis | tempo da Ressurreição | Mantido literal; o leitor reconhece a Páscoa. |

## Decisões

- 2026-10-03: Tradução do latim, parágrafo por parágrafo (cinco parágrafos e um título), com os dois espaços finais dos parágrafos 1–4 espelhados.
- No parágrafo 3, o latim diz que haveria *mais* a temer quanto à usura para o comprador do que para o vendedor (*plus esset de usura timendum emptori … quam venditori*); a referência inglesa inverte o sentido ("no more fear … than"). Segue-se o latim.
- *non in fraudem usurarum introducta* → "não introduzido para encobrir usuras": o costume não deve ser um disfarce para cobrar usura.
- *extimatione* é grafia medieval de *aestimatione*, não erro de OCR; fonte não editada.
- A referência inglesa acrescenta "[for payment]" no parágrafo 4; em português "esperarem pelo pagamento" sai do próprio sentido de *expectent*, sem colchetes.
- Sem notas do editor na fonte; nenhuma nota do tradutor acrescentada.
- `book.json`: adicionadas entradas pt-BR em `name`, `author`, `description` e no título do sumário (campos já existentes).

## Review log

### Round 1

Foco: completude parágrafo por parágrafo (alinhamento latim ↔ pt-BR, frases, citações, parênteses, referências), mais a auditoria mecânica. Veredito: 1 defeito, corrigido.

Corrigido:
- §3, *de dilatione solutionis*: "aquele costume de diferir o pagamento" → "aquele costume da dilação do pagamento". Contrariava a linha *dilatio* → "dilação" dos Termos-chave (a outra ocorrência, *temporis dilationem*, já dava "dilação do tempo").

Rejeitados:
- §3, *quandocumque de eo quod est sibi debitum dimitteret si sibi citius solveretur* → "sempre que ele perdoasse parte do que lhe é devido para que lhe pagassem mais cedo": a condicional virou final, mas o sentido (perdoar parte em troca do pagamento antecipado) é o mesmo e é o que a frase seguinte explicita com *ut sibi citius solvatur*. Escolha de estilo, não erro.
- §4, *ut eos usque ad tempus resurrectionis expectent* → "para esperarem pelo pagamento até o tempo da Ressurreição": "pelo pagamento" explicita o objeto da espera (decisão já registrada acima); não acrescenta conteúdo alheio ao latim.
- §5, *cum usuris* → "com usura" (singular): o português usa o singular coletivo; *usuras quas dederunt* segue "as usuras que pagaram". Sem perda de sentido.
- §3, *usque ad spatium trium mensium* → "até o prazo de três meses": *spatium* não está nos Termos-chave; "prazo" dá o sentido.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-emptione/review-1.md`.

### Round 2

Foco: leitura bilíngue cláusula por cláusula (latim ↔ pt-BR), mais a auditoria mecânica. Veredito: limpo, nenhuma alteração.

Rejeitados:
- §3, *ad terminum praedictum ultra quantitatem iusti pretii* → "para o prazo mencionado acima da quantia do justo preço": "mencionado acima" pode ser lido de passagem como "supracitado", mas a frase se resolve na leitura e diz o que o latim diz. Estilo, não erro.
- §5, *Patet enim a simili* → "Isso fica claro por semelhança: pois…": o *enim* passa para o "pois" da oração seguinte; o nexo explicativo se mantém.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-emptione/review-2.md`.

### Round 3

Foco: leitura às cegas do pt-BR (sem a fonte), cada marca verificada depois no latim; varredura de ortografia, acentos, crase, hífen e pontuação; auditoria mecânica. Veredito: limpo, nenhuma alteração.

Rejeitados:
- §3, *Nec potest esse excusatio si secundus venditor sit primi minister* → "Nem pode servir de escusa o segundo vendedor ser agente do primeiro": oração infinitiva com sujeito próprio, gramatical; sentido idêntico.
- §3, *Nec obstat si pro minori pretio daret* → "Nem obsta que ele desse por preço menor": "dar por preço menor" espelha *daret* e é uso corrente para "vender mais barato".
- §3, *ex parte eius qui minus dat ut citius solvat … cum spatium temporis vendat* → "… já que vende um espaço de tempo": o sujeito implícito de "vende" é "aquele que dá menos", como no latim.

Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-emptione/review-3.md`.
