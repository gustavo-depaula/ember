# Diário de tradução — Atos de Bartolomeu (pt-BR)

Fonte: en-US/, tradução de Alexander Walker em Ante-Nicene Fathers, vol. 8, edição de Alexander Roberts, James Donaldson e A. Cleveland Coxe, Christian Literature Publishing Co., 1886; revista e editada para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Acts of Bartholomew | Atos de Bartolomeu | “c. 500” mantido no título. |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Bartholomew / Mary / Gabriel | Bartolomeu / Maria / Gabriel | Formas portuguesas dos nomes. |
| Adam / Abraham / Isaac / Jacob | Adão / Abraão / Isaac / Jacó | |
| Polymius / Astreges | Polímio / Ástreges | Formas adotadas para os dois reis. |
| Astaruth / Becher / Baldad | Astarut / Béquer / Baldad | Designações dos ídolos e demônios preservadas separadamente. |
| India / Ethiopia / Media | Índia / Etiópia / Média | Preservada a geografia da fonte. |
| Liparis | Liparis | Nome antigo mantido; identificado na nota do tradutor 1. |
| Jesus Christ / Lord / Son of God | Jesus Cristo / Senhor / Filho de Deus | Conforme os livros irmãos. |
| Father / Holy Ghost / Holy Spirit | Pai / Espírito Santo / Espírito Santo | Conforme os livros irmãos. |
| Almighty God / God Almighty | Deus todo-poderoso | Conforme os livros irmãos. |
| only begotten / unbegotten / begotten / proceeding | unigênito / não gerado / gerado / procedente | Qualificações da oração trinitária; conforme os livros irmãos onde aplicável. |
| Virgin Mary / virgin earth | Virgem Maria / terra virgem | Preservada a correspondência desenvolvida no discurso. |
| devil / demon / Satan | diabo / demônio / Satanás | Conforme os livros irmãos. |
| unclean demon / demoniac / lunatic | demônio impuro / endemoninhado / lunático | Distinções e explicação da fonte mantidas. |
| paradise / commandment / righteousness | paraíso / mandamento / justiça | Conforme os livros irmãos. |
| bishop / presbyter / apostle | bispo / presbítero / apóstolo | Conforme os livros irmãos. |
| bishopric / clergy | episcopado / clero | |
| sign of the cross / to seal | sinal da cruz / marcar com o selo | Conforme os livros irmãos. |
| Luke / Matthew / Jeremiah | Lucas / Mateus / Jeremias | Nomes empregados nas referências bíblicas. |
| for ever / for ever and ever / Amen | para sempre / pelos séculos dos séculos / Amém | Conforme os livros irmãos. |
| fell asleep | adormeceu | Mantida a imagem da morte, conforme os livros irmãos. |

## Decisões

- Tratamento singular por “tu” nos diálogos; plural por “vós” nos discursos ao povo e aos sacerdotes; “vós” na oração dirigida a Deus. No parágrafo 10, “vos dá respostas” conserva a referência coletiva em meio à fala dirigida ao rei.
- Mantidas as formulações incomuns da fonte, inclusive a divisão geográfica inicial, “tomou para si aquela que era sempre virgem” e a sequência do argumento sobre a terra virgem, sem harmonização com outras versões.
- “Undercloak” traduzido por “túnica”, distinguindo a veste interior do manto sobre os ombros.
- “Lunatic” traduzido por “lunática”, conservando a explicação que a própria fonte dá de “endemoninhada”, sem atribuir diagnóstico moderno.
- No parágrafo 18, mantida a sequência pronominal da fonte na promessa de manifestação, seguida da apresentação do demônio, sem acrescentar um referente explicativo.
- Conservadas as referências Lucas 4:1-13, Mateus 5:8, Jeremias 2:27 e Mateus 21:22 nos lugares da fonte; as citações foram traduzidas segundo sua redação, sem harmonização bíblica.
- Acrescentada a nota do tradutor 1 após a menção de Liparis, para identificar o nome antigo da ilha de Lípari.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of the 24 paragraphs, the footnote, the journal and book.json; one minor grammar fix in [24], the audit flag is a false positive.
- `pt-BR/ch001.md` [24]: “governado bem a Igreja e a guiado em opiniões corretas” → “governado bem a Igreja e tendo-a guiado em opiniões corretas” — source: 'and guided it in right opinions'; the pronoun cannot stand before a bare participle (ellipsis of 'tendo'); restoring 'tendo-a' fixes the regency
- Rejected: pt-BR/ch001.md [9] — audit: 2 “ vs 1 ” — the apostle's speech continues into [10], which opens with “; leaving the quote open at a paragraph break of continuous speech is the standard convention
- Rejected: pt-BR/ch001.md [18] — inner quote closed before 'pois assim Deus me ordenou' — the boundary of the Lord's message is not marked in the source; the reading chosen is defensible
- Rejected: pt-BR/ch001.md [9] — 'Listen, devil; although … . I have fulfilled' merged into one sentence — the source's 'although' clause has no main clause of its own; joining it to the next sentence keeps the sense
- Rejected: pt-BR/ch001.md [^1] — Liparis identified as Lipari, north of Sicily — the identification is standard and Lipari lies off Sicily's north coast; the claim is correct

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 24 parágrafos, da nota do tradutor, do diário e de book.json; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/ch001.md [9] — A auditoria aponta aspas duplas desbalanceadas. — A fala do apóstolo continua no parágrafo 10; a ausência de fechamento no parágrafo 9 segue a convenção de discurso contínuo, conforme já registrado no diário.
