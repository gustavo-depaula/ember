# Diário de tradução — Thomas Carlyle (pt-BR)

Fonte: en-US/. Thomas Carlyle (Hodder and Stoughton, 1902), Project Gutenberg #71159.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Thomas Carlyle / G. K. Chesterton | Thomas Carlyle / G. K. Chesterton | Formas dos metadados recebidos. |
| God / Christ / Old Testament / Day of Judgment | Deus / Cristo / Antigo Testamento / Juízo Final | Convenções das obras irmãs. |
| Rationalism / Irrationalism | racionalismo / irracionalismo | Maiúsculas preservadas nas personificações e designações individuais. |
| hero-worship / hero | culto aos heróis / herói | Termos centrais do ensaio. |
| worship of God / worship of man | adoração de Deus / culto ao homem | Distinção idiomática sem eliminar o paralelo do argumento. |
| kingship / equality / liberty / fraternity | realeza / igualdade / liberdade / fraternidade | Maiúsculas conforme o contexto da fonte. |
| spiritual world / spiritual patience | mundo espiritual / paciência espiritual | Distintos da paciência moral e da intelectual. |
| Cosmos / Providence / Nature | Cosmos / Providência / Natureza | Personificações e maiúsculas preservadas. |
| man of action / practical man | homem de ação / homem prático | Categorias recorrentes do argumento. |
| gospel | evangelho | Também nas aplicações figuradas às doutrinas de Carlyle e Rousseau. |
| blessedness / Apostolic Succession / Catholic dogmas | bem-aventurança / Sucessão Apostólica / dogmas católicos | Vocabulário religioso do ensaio. |
| England / English / Edinburgh / Scots | Inglaterra / inglês / Edimburgo / escoceses | Convenções portuguesas; demais topônimos britânicos sem equivalente corrente conservados. |
| Mr. / Mrs. / Dr. / Sir | sr. / sra. / dr. / Sir | Conforme as obras irmãs. |
| Frederick the Great / Frederick of Prussia | Frederico, o Grande / Frederico da Prússia | Conforme as obras irmãs. |
| Mary, Queen of Scots / Elizabeth / Charles I. | Maria, rainha dos escoceses / Isabel / Carlos I | Formas portuguesas dos nomes régios. |
| Fifth Monarchy men / malignants | partidários da Quinta Monarquia / realistas | Grupos e designação política esclarecidos na nota [^1]. |
| Ironside / Cavalier | Ironside / Cavalier | Designações históricas conservadas e esclarecidas na nota [^2]. |
| Chartism / Tolstoian / Home Secretary | cartismo / tolstoiano / ministro do Interior | Vocabulário político. |
| shams / bull’s-eyes | imposturas / balas de hortelã | “Bull’s-eyes” designa aqui um doce. |
| History of Rationalism in Europe | História do Racionalismo na Europa | Título da obra de Lecky. |
| History of Irrationalism in Europe | História do Irracionalismo na Europa | Título imaginado por Chesterton. |
| Frederick the Great / History of the French Revolution | Frederico, o Grande / História da Revolução Francesa | Títulos traduzidos; forma abreviada “Revolução Francesa” onde a fonte a emprega. |
| Past and Present / The Diamond Necklace / Sartor Resartus | Passado e Presente / O Colar de Diamantes / Sartor Resartus | Títulos das obras mencionadas. |
| National Portrait Gallery / Victoria and Albert Museum | Galeria Nacional de Retratos / Museu Victoria e Albert | Nomes das instituições traduzidos. |

## Decisões

- Preservados os 146 parágrafos da fonte, inclusive a divisão dos blocos de ilustração em abertura, crédito, título e legenda. Os colchetes foram mantidos.
- Conservados nomes de casas, fazendas e ruas britânicas; nos endereços, o número foi reposicionado segundo o uso português. As siglas acadêmicas e honoríficas dos créditos foram mantidas.
- “The Popes and Bolingbrokes” foi traduzido por “os Popes e os Bolingbrokes”: os sobrenomes designam autores tomados como representantes de uma tendência, não papas.
- Mantidos o tratamento plural em “acreditais” e “vós” na fala do cavalheiro escocês e o singular “tu” no argumento sobre a superioridade pessoal.
- “Credo Quia Impossibile” foi conservado em latim, com a grafia da fonte e em itálico; não se acrescentou tradução nem se corrigiu a fórmula citada.
- Acrescentada a nota [^1] para esclarecer os partidários da Quinta Monarquia e o uso político de “malignants”.
- Acrescentada a nota [^2] para esclarecer o contraste entre Ironsides e Cavaliers.
- A citação sobre o riso do Senhor foi traduzida segundo a redação fornecida, sem acrescentar referência bíblica.
- “Bull’s-eyes” foi traduzido por “balas de hortelã”, preservando o exemplo de gosto pessoal e evitando o sentido literal enganoso.
- Conservados os termos históricos “idiota” e “aleijado” na comparação de Carlyle, sem reformular a provocação retórica de Chesterton.
- Nos metadados, mantidas as traduções existentes; acrescentados apenas “pt-BR” a `languages` e o título português ao sumário.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of the 146 paragraphs, the footnotes, the journal and book.json; one minor fix to the conditional mood in [73], nothing else found.
- `pt-BR/ch01-thomas-carlyle.md` [73]: “Mas todos devemos concordar com sua contribuição” → “Mas todos concordaríamos com sua contribuição” — source "we should all agree with him" is a conditional (we would all agree), not an obligation; "devemos" turns it into a duty
- Rejected: pt-BR/ch01-thomas-carlyle.md [78] — mechanical audit: more emphasis markers than the source — the added italics mark the retained Latin "Credo Quia Impossibile", as the house rule asks and the journal records; not a defect
- Rejected: pt-BR/ch01-thomas-carlyle.md [45] — "ordinary charitable practice" rendered "prática habitual da caridade" — "caridade" carries the sense of charitable judgment here; a defensible rendering
- Rejected: pt-BR/ch01-thomas-carlyle.md [73] — "pathos" rendered "drama" — a style choice that keeps the sense of the plight of the practical man
- Rejected: pt-BR/ch01-thomas-carlyle.md — footnotes [^1] and [^2] — translator's notes checked as claims of fact — Fifth Monarchists, "malignants" as a derogatory name for royalists, the Ironsides as Cromwell's cavalry and the Cavaliers as the king's party are all correct

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 146 parágrafos, das duas notas do tradutor, de book.json e do diário; auditoria mecânica conferida. Nenhum defeito objetivo novo encontrado.
