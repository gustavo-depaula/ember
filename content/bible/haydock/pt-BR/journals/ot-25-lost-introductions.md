# Diário de tradução — Introduções de Haydock a Provérbios, Cântico dos Cânticos, Eclesiástico, Lamentações e Baruc (pt-BR)

Fonte: en-US/, comentário de George Leo Haydock à Bíblia Douay-Rheims, edição de 1859, conforme as convenções fornecidas.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| George Leo Haydock | George Leo Haydock | Nome do autor mantido. |
| Proverbs / Canticle of Canticles / Ecclesiasticus / Lamentations / Baruch | Provérbios / Cântico dos Cânticos / Eclesiástico / Lamentações / Baruc | Títulos bíblicos conforme a nomenclatura da Vulgata. |
| Introduction to | Introdução a | Fórmula dos títulos do sumário. |
| Holy Ghost / Holy Spirit | Espírito Santo | Conforme os volumes irmãos. |
| Church / Catholic Church / Fathers | Igreja / Igreja Católica / Padres | Conforme os volumes irmãos. |
| faith / hope / charity / grace | fé / esperança / caridade / graça | Conforme os volumes irmãos. |
| Gentiles / infidels | gentios / infiéis | Mantido o vocabulário apologético da fonte. |
| Saviour / Messias / Christ / antichrist | Salvador / Messias / Cristo / Anticristo | Conforme os volumes irmãos. |
| wisdom / virtue / sapiential | sabedoria / virtude / sapiencial | Sabedoria com inicial maiúscula quando personificada. |
| bridegroom / spouse | esposo / esposa | Imagens de Cristo, da Igreja e das almas. |
| mystical sense / canon / canonical | sentido místico / cânon / canônico | Vocabulário exegético e relativo à autoridade dos livros. |
| apostolical tradition / inspiration | tradição apostólica / inspiração | Vocabulário teológico. |
| Solomon / Ezechias / Agur / Abisag | Salomão / Ezequias / Agur / Abisag | Formas portuguesas. |
| Jesus, the son of Sirach | Jesus, filho de Sirac | Nome do autor do Eclesiástico. |
| Jeremias / Josias / Sedecias / Esdras | Jeremias / Josias / Sedecias / Esdras | Conforme os volumes irmãos. |
| Jerusalem / Babylon / Pharao | Jerusalém / Babilônia / faraó | Formas portuguesas. |
| Constantine / Arius / Luther | Constantino / Ário / Lutero | Nomes históricos. |
| St. Jerome / St. Augustine / St. Irenaeus | São Jerônimo / Santo Agostinho / Santo Irineu | Inclusive nas atribuições. |
| Origen / Theodoret / Theodorus, of Mopsuesta / Rabanus | Orígenes / Teodoreto / Teodoro de Mopsuéstia / Rabano | Formas portuguesas. |
| Tirinus / Grotius | Tirino / Grócio | Conforme os volumes irmãos. |
| Haydock / Challoner / Worthington / Calmet / Houbigant | Haydock / Challoner / Worthington / Calmet / Houbigant | Sobrenomes mantidos. |
| Lacedemonians / Chaldeans / Greeks / Turks | lacedemônios / caldeus / gregos / turcos | Povos mencionados na introdução ao Cântico. |
| Kings / Paralipomenon / Machabees | Reis / Paralipômenos / Macabeus | Conservadas a nomenclatura e a numeração da Vulgata. |
| Genesis / Hebrews / Apocalypse | Gênesis / Hebreus / Apocalipse | Nomes das referências bíblicas. |
| Against Heresies / City of God | Contra as Heresias / Cidade de Deus | Títulos das obras citadas. |

## Decisões

- Mantidos os cinco parágrafos únicos, suas chaves e todos os separadores de vozes e parênteses de atribuição; não foram acrescentadas notas do tradutor, conforme as convenções específicas de Haydock.
- Em Provérbios, “sentences” foi traduzido por “sentenças”, no sentido de máximas; “witty jester”, “jests” e “wit” foram vertidos como “gracejador espirituoso”, “gracejos” e “veia cômica”, preservando a réplica de Watson.
- No Cântico, “having his conversation in heaven” foi traduzido por “vivendo já no céu”, pois “conversation” designa o modo de viver.
- As fórmulas da Missa no encerramento da introdução ao Cântico foram traduzidas a partir do inglês fornecido, sem substituí-las pelas fórmulas litúrgicas portuguesas correntes.
- Preservadas as referências e as incertezas editoriais da fonte, inclusive “Const.[Constantinopla?] IV. A. 68”, “Plut.[Plutarco?]” e “Apocalipse 19:”, sem conjecturar correções ou completar números.
- Mantidas as abreviaturas latinas nas atribuições, inclusive “in Zacharias”; nas referências bíblicas correntes, os nomes foram traduzidos. “Ecclesiasticus xlix. 8” foi normalizado para “Eclesiástico 49:8”.
- Em Lamentações, “pathetic” foi traduzido por “comovente”; os termos *threnoi* e *kinoth* foram preservados, assim como as grafias “phe” e “ain”.
- Conservadas as afirmações históricas, etimológicas e exegéticas da fonte, inclusive quando discutíveis, sem correção doutrinal ou histórica.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of the five introductions: one minor punctuation fix in Lamentations; audit flags checked and rejected.
- `pt-BR/b04-lamentations-a000.md` [1]: “compilado por Rabano, (Du Pin) (Haydock)” → “compilado por Rabano (Du Pin). (Haydock)” — source ends the sentence 'shews. (Haydock)'; the full stop closing the sentence before the final attribution was lost
- Rejected: pt-BR/b04-lamentations-a000.md [1] — Audit: Scripture reference 49:8 not in source — the source's 'Ecclesiasticus xlix. 8' was normalized to the colon form, as the conventions require; the reference is the same
- Rejected: pt-BR/b04-lamentations-a000.md [1] — Audit: italics added to threnoi and kinoth — the spelling is unchanged; italics on retained Greek and Hebrew terms follow the house format rule
- Rejected: pt-BR/b02-canticles-a000.md [1] — 'Nós os temos voltados para o Senhor' adds 'voltados' — needed for the sense of 'have them to the Lord' in Portuguese; the meaning is unchanged
- Rejected: pt-BR/b01-proverbs-a000.md [1] — 'prophetical of' rendered 'figura profética de' — faithful to the sense; a style choice

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral das cinco introduções, com conferência do book.json, do diário e dos alertas mecânicos: nenhum defeito objetivo novo encontrado.
