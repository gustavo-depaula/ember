# Diário de tradução — Barbas-Brancas Brincando (pt-BR)

Fonte: en-US/, Greybeards at Play: Literature and Art for Old Gentlemen (R. Brimley Johnson, 1900), Project Gutenberg #14706.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Greybeards at Play / G. K. Chesterton | Barbas-Brancas Brincando / G. K. Chesterton | Formas dos metadados recebidos. |
| Nature / Earth | Natureza / Terra | Conforme as convenções das obras irmãs; preservadas as personificações. |
| Art / Science | Arte / Ciência | Maiúsculas preservadas onde constam da fonte. |
| oneness / altruism / æstheticism | unidade / altruísmo / esteticismo | Termos centrais dos títulos e da sátira. |
| Early Sin / Fall / Call | Pecado Primeiro / Queda / Chamado | Mantidas as maiúsculas da sequência épica burlesca; “chamado” conforme a obra irmã sobre Tennyson. |
| Covenant of Things | Aliança das Coisas | Preservada a formulação solene e personificada. |
| Mr. / Sir | sr. / senhor | “Sr.” conforme as obras irmãs; “senhor” por extenso no tratamento dispensado pelo leão. |
| James / Hanno / Nemesis | Jaime / Hanão / Nêmesis | Formas portuguesas dos nomes. |
| Niagara / Baker Street / Gladstone / Wordsworth | Niágara / Baker Street / Gladstone / Wordsworth | Topônimo traduzido quando há forma portuguesa corrente; demais nomes conservados. |
| First Mate / Boatswain | Imediato / Contramestre | Funções náuticas; maiúsculas conforme a fonte. |
| Spanish main | mares da América espanhola | Sentido marítimo da expressão no contexto dos piratas. |
| hardbake / golosh | caramelo de amêndoas / galocha | Designações dos alimentos e objetos oferecidos ao peixe. |
| The Strand / The Referee | The Strand / The Referee | Títulos conservados, com os itálicos da fonte. |
| larkspurs / forget-me-nots / buttercups | esporinhas / miosótis / botões-de-ouro | Nomes das flores do poema final. |
| Envoy | Envio | Designação da peça poética de encerramento. |

## Decisões

- Preservadas todas as estrofes, seus versos e sua ordem. Priorizados o sentido, a cadência e o desfecho cômico, sem impor rimas que exigissem acréscimos ou supressões.
- Conservados o título e a descrição em pt-BR já presentes nos metadados; acrescentados os títulos do sumário e a língua de destino.
- Corrigida na tradução a corrupção de codificação “Ã†STHETICISM” do sumário para “ESTETICISMO”, conforme o título íntegro do capítulo.
- Empregado “tu” no tratamento singular ao amigo e à criança; “vós” nas interpelações plurais ao público. Nas apóstrofes ao tempo, o singular acompanha neve e nevoeiro individualmente, e o plural reúne os fenômenos.
- “Slippered pantaloons” foi vertido por “velhotes de pantufas”; “hunt the slipper”, por “caça à pantufa”, preservando a repetição que liga velhice e brincadeira.
- Nota [^1] esclarece a repetição de *bush* em “Mulberry Bush” e “Burning Bush”, perdida nas formas portuguesas “Amoreira” e “Sarça Ardente”.
- “Words of one syllable” permanece “palavras de uma sílaba”, sem explicitar o conteúdo dessas palavras.
- Mantida a referência “(Vitória xii. 18)” com sua numeração e pontuação; não foi tratada como referência bíblica.
- Nota [^2] esclarece a rima inglesa *piano/Hanno*, responsável pela entrada deliberadamente descabida de Hanão.
- Conservados os absurdos intencionais: o peixe molhado no mar, os trinta volumes de um periódico levados à cama e as cores das flores do poema final.
- Mantido *nous* em itálico; a nota [^3] fornece seu sentido no contexto.
- “Go on” foi traduzido igualmente nas duas ocorrências por “Segue em frente”, preservando o contraste final entre o mundo vasto e o mundo redondo.
- Não há notas da edição nem referências bíblicas explícitas no trecho recebido.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Full read of 6 chapters: one mistranslated imperative (ch05 [19]), one concord slip ('As milhões'), and one inexact rendering of 'lisping'.
- `pt-BR/ch05-on-the-disastrous-spread-of-stheticism-in.md` [19]: “Vede a cada manhã alguma tarefa começada,” → “Vejo a cada manhã alguma tarefa começada,” — Source 'Each morning see some task begun' has the implied subject I, from 'So I my life conduct' (a variant of Longfellow's 'sees'). It is not an imperative addressed to the readers. *(meaning)*
- `pt-BR/ch02-the-oneness-of-the-philosopher-with-nature.md` [3]: “As milhões de florestas da Terra” → “Os milhões de florestas da Terra” — 'Milhão' is masculine, so the article must agree with it, not with 'florestas'.
- `pt-BR/ch06-envoy.md` [8]: “Exclamou o querubim de fala titubeante.” → “Exclamou o querubim ceceoso.” — Source 'lisping' means 'ceceoso'. 'Titubeante' means hesitant or stammering.
- Rejected: audit: ch03 [6], ch06 [6], [7], [9] — Unbalanced quotation marks — Each is a speech that runs on across stanzas; the source does the same.
- Rejected: pt-BR/ch01-a-dedication.md [14] — 'Podem ser' for 'need be' — The sense (how little is enough) is kept; this is a style choice.
- Rejected: pt-BR/ch05-on-the-disastrous-spread-of-stheticism-in.md [12] — Tense shifts from 'Recusaram-se' to 'registravam' — Both fit the narration of the dream; the meaning is unchanged.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos seis capítulos, notas, metadados e diário; conferidas as quatro ocorrências do audit mecânico. Encontrado um defeito menor de pontuação.
- `pt-BR/ch03-of-the-dangers-attending-altruism-on-the.md` [2]: “Notai sua expressão radiante: —” → “Notai sua expressão radiante:” — A combinação inglesa de dois-pontos e travessão foi transplantada; as regras pedem que essa pontuação seja adaptada.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch03 [1]-[3]: the punctuation fix in [2] is correct and the neighbouring paragraphs are faithful and clean.
- Rejected: pt-BR/ch03-of-the-dangers-attending-altruism-on-the.md [2] — Removal of the transplanted ':—' — A colon alone correctly introduces the next line in Portuguese; no sense is lost and the stanza still reads correctly.
- Rejected: pt-BR/ch03-of-the-dangers-attending-altruism-on-the.md [6] — Audit: unbalanced quotes — Paragraph not shown in this delta; round 1 already rejected it because the speech runs across stanzas as in the source.
