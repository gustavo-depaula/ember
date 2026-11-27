# Diário de tradução — Divórcio contra Democracia (pt-BR)

Fonte: en-US/, *Divorce versus Democracy* (Society of SS. Peter and Paul, 1916), Project Gutenberg #62467.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Divorce versus Democracy / G. K. Chesterton | Divórcio contra Democracia / G. K. Chesterton | Formas dos metadados recebidos. |
| God / Christian / pagan | Deus / cristão / pagão | Convenções católicas das obras irmãs. |
| England / Englishman / Prussia | Inglaterra / inglês / Prússia | Conforme as obras irmãs. |
| Roman Empire / French Revolution | Império Romano / Revolução Francesa | Formas portuguesas tradicionais. |
| State / Family / household / home | Estado / Família / lar / lar | Maiúsculas contextuais conforme o original. |
| marriage / divorce / separation / fidelity | casamento / divórcio / separação / fidelidade | Preservadas as distinções do argumento. |
| celibacy / celibate separation | celibato / separação com continência | A segunda expressão designa a separação acompanhada de abstinência sexual. |
| democracy / democrat / plutocracy | democracia; povo / democrata / plutocracia | “Povo” quando *democracy* designa o corpo popular, em oposição aos ricos. |
| common sense / sane / vow | senso comum / são / voto | Conforme as obras irmãs, com adaptação contextual. |
| Supermen | Super-Homens | Conforme a convenção de *Lord Kitchener*, no plural do original. |
| patriotism of the household | patriotismo do lar | Fórmula central do prefácio. |
| Wicked Ten / Virginius / Wat Tyler | Dez Perversos / Virgínio / Wat Tyler | Epíteto traduzido; forma portuguesa do nome romano; nome inglês conservado. |
| Poll Tax | imposto por cabeça | Tradução descritiva do tributo. |
| navvies / plumbers / potmen | operários de terraplenagem / encanadores / ajudantes de taberna | Distinções ocupacionais conservadas. |
| gentleman | cavalheiro | Preservada a dimensão social do termo. |
| cruelty / technical cruelty | crueldade / critério jurídico de crueldade | Na segunda expressão, trata-se da caracterização legal discutida pelo autor. |
| Free Love / Free Silver | Amor Livre / Prata Livre | Paralelismo dos lemas conservado; nota [^1]. |
| Benedick | Benedito | Nome da personagem shakespeariana; nota [^2]. |
| Prayer Book | Livro de Oração | Designação do livro litúrgico anglicano citado pelo autor. |
| for better, for worse | para melhor, para pior | Preservada a formulação citada, sem substituição por fórmula matrimonial portuguesa mais extensa. |
| Consols | Consols | Designação financeira conservada; nota [^3]. |
| divide et impera | *divide et impera* | Latim conservado em itálico, sem tradução acrescentada. |

## Decisões

- Mantidos os quatro parágrafos do prefácio e os quinze do ensaio, incluindo títulos e assinatura; as definições das notas acrescentadas aparecem imediatamente após os parágrafos a que pertencem.
- Conservado o tom polêmico, inclusive nas afirmações sobre violência conjugal e nas classificações sociais e médicas empregadas pelo autor, sem suavizações ou comentários doutrinais.
- *Democracy* foi vertido por “democracia” para o princípio ou regime e por “povo” quando designa as pessoas sobre as quais a legislação seria aplicada.
- *Shandy-gaff* foi traduzido descritivamente como “cerveja misturada com limonada”; *breaking the pledge*, como “quebrar a promessa de abstinência”, explicitando o sentido da expressão.
- A distinção entre *wife-beating* e *wife-hitting* foi conservada por “espancar a mulher” e “dar uma pancada na mulher”, respectivamente.
- *Liaisons* foi vertido por “ligações”, com o itálico do original preservado nas duas ocorrências.
- *Music-hall Turns and Potted Plays* foi traduzido por “Números de Teatro de Variedades e Peças Condensadas”, preservando a imagem de uma vida fragmentada em apresentações breves.
- *Workhouses* foi vertido por “asilos de pobres”, no contexto da separação de casais idosos.
- Conservado o tratamento singular com “tu” nas interpelações diretas ao leitor; “Permitam-me” mantém o apelo ao conjunto dos leitores.
- Nota [^1]: esclarece o programa monetário denominado *Free Silver* e o paralelo verbal com *Free Love*.
- Nota [^2]: identifica Benedito e esclarece o emprego de seu nome para designar um homem casado.
- Nota [^3]: identifica os Consols e explica a polissemia financeira e afetiva de *interest*, que a tradução não reproduz integralmente.
- Mantidas as traduções de nome, autoria e descrição já presentes nos metadados; acrescentados apenas os títulos do sumário em pt-BR e o idioma à lista de línguas.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Full read of the preface and essay (19 blocks, 3 notes, journal, book.json); two fixes: the misleading 'sequer' in ch02 [4] and the literal rendering of the idiom 'kick' in ch02 [3].
- `pt-BR/ch02-divorce-versus-democracy.md` [4]: “ou que sequer deixe de ajudá-la” → “ou que mesmo apenas deixe de ajudá-la” — source: 'or even fails to assist them'; 'sequer' belongs to negative contexts and makes the clause read as 'not even fails to help' *(meaning)*
- `pt-BR/ch02-divorce-versus-democracy.md` [3]: “acho que é hora de dar um pontapé” → “acho que é hora de espernear” — 'time to kick' is the idiom for protesting or resisting; the literal 'dar um pontapé' does not convey protest in Portuguese *(meaning)*
- Rejected: pt-BR/ch02-divorce-versus-democracy.md [2], [4]–[7], [9], [12]–[14] — audit: source parentheses missing — each parenthetical is kept as dashes or commas, with nothing lost; a punctuation choice
- Rejected: pt-BR/ch01-preface.md [2] — 'tentative' rendered as 'incipiente'; 'crescimento' added in 'sustentar o crescimento da população' — both are defensible readings of the context; the sense is unchanged
- Rejected: pt-BR/ch02-divorce-versus-democracy.md [12], [14] — mix of 'tu' address and 'Permitam-me' — the journal records this as a deliberate choice; consistent within the file
- Rejected: footnote [^2] — 'benedick' usually means a newly married man, especially a confirmed bachelor who marries, not any married man — the note's claim is broad but not false; acceptable

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 19 blocos, das três notas do tradutor, do diário e de book.json, com conferência dos nove alertas mecânicos; nenhum novo defeito objetivo encontrado.
