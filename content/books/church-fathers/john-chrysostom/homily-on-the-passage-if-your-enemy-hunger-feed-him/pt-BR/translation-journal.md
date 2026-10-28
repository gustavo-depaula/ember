# Diário de tradução — Homilia sobre a passagem “Se o teu inimigo tiver fome, dá-lhe de comer.” (pt-BR)

Fonte: en-US/, tradução de W.R.W. Stephens (Nicene and Post-Nicene Fathers, First Series, vol. 9, 1889), revista para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| John Chrysostom | João Crisóstomo | Conforme as obras irmãs. |
| If your enemy hunger, feed him; if he thirst, give him drink | Se o teu inimigo tiver fome, dá-lhe de comer; se tiver sede, dá-lhe de beber | Fórmula fixa (Romanos 12:20; Provérbios 25:21-22). |
| by so doing you shall heap coals of fire on his head | fazendo isso, amontoarás brasas de fogo sobre a sua cabeça | Fórmula fixa; “coals of fire” = brasas de fogo. |
| be not overcome of evil | não te deixes vencer pelo mal | |
| resentment of injuries | ressentimento das injúrias | Gr. *mnesikakía*. |
| assembly / assemblies | assembleia / assembleias | A reunião litúrgica (gr. *sýnaxis*). |
| the Master (Deus) / master (na parábola) | o Senhor / senhor | Conforme as obras irmãs. |
| fellow servants / fellow slaves | conservos | Conforme as obras irmãs. |
| moral wisdom / spiritual wisdom | sabedoria moral / sabedoria espiritual | Gr. *philosophía*. |
| philosophical (homens) | sábios | Mesma raiz; ver Decisões. |
| forbearance | longanimidade | |
| moderation | moderação | |
| lovingkindness | benignidade | Conforme as obras irmãs. |
| indulgence | indulgência | No sentido de desculpa, perdão. |
| divine oracles | oráculos divinos | As Escrituras. |
| dæmons / the devil / the evil one | demônios / o diabo / o maligno | Conforme as obras irmãs. |
| the fathers (que oram na assembleia) | os Padres | Maiúscula, como nas obras irmãs. |
| Sun of Righteousness | Sol de Justiça | |
| Heavenly commonwealth / commonwealth above | cidade celeste / cidade do alto | |
| day of the Preparation | dia da Preparação | |
| Old Dispensation | Antiga Aliança | |
| the three children | os três jovens | Daniel 3; conforme as obras irmãs. |
| them that are without | os de fora | |
| Seraphim / Angels | Serafins / Anjos | Maiúscula conforme a fonte. |
| Ter sanctus | *Ter sanctus* | Mantido em latim; ver nota do tradutor 1. |
| the captain | o capitão | Abisai; ver nota do tradutor 2. |
| Saul, son of Jesse, son of Kish, Goliath | Saul, filho de Jessé, filho de Cis, Golias | |
| Paul, Silas, Daniel, Jeremiah, Solomon | Paulo, Silas, Daniel, Jeremias, Salomão | |
| Peter, James, John | Pedro, Tiago, João | |

## Decisões

- Tratamento: a congregação é tratada por *vós*; onde a fonte passa ao singular (“do thou”, “who art”, “who hast”, “Tell me”), usa-se *tu*, inclusive no apóstrofo ao ausente (§§ 7, 9) e ao fiel iniciado (§ 12). Deus, na citação do salmo (“Lord remember David”) e no Pai-Nosso, recebe *vós*.
- “Philosophical” / “moral wisdom”: verte o grego *philosophía*, que em Crisóstomo é a vida cristã virtuosa; traduzido por “sábios” e “sabedoria moral”, e não por “filosóficos”, que levaria o leitor ao sentido acadêmico.
- “But the reminder of the passage” (§ 13): erro tipográfico da fonte por “remainder”; traduzido “o restante da passagem”.
- Referências bíblicas mantidas como na fonte, mesmo onde divergem da numeração usual (1 Samuel 20:23, onde o versículo citado é o 27); as citações dos Salmos sem referência na fonte (§§ 11, 19) ficam sem referência.
- “Cloke” (João 15:22): “não têm com que encobrir o seu pecado”, para conservar a imagem do manto que cobre.
- “Base offenses” (§ 19): “ofensas mesquinhas”, para manter o contraste com o “perdão régio”.
- “The grace of the spirit” (§ 10): “a graça do Espírito”, com maiúscula, por se referir ao Espírito Santo.
- Nota do tradutor 1 (§ 12): explica *Ter sanctus*, o “Três vezes santo” de Isaías 6:3 cantado na oração eucarística.
- Nota do tradutor 2 (§ 17): identifica “o capitão” como Abisai (1 Samuel 26:8), personagem que a homilia não nomeia.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch001 (19 paragraphs, 2 translator's notes), book.json and the journal: one subject inversion in [16] that makes David the one who hates Saul; the rest is faithful and consistent with the Key Terms table.
- `pt-BR/ch001.md` [16]: “Quanto a Saul, odiava-o e detestava-o tanto” → “Saul, por sua vez, odiava-o e detestava-o tanto” — source: 'As for Saul he hated and abhorred him', where Saul is the subject. In pt-BR, 'Quanto a Saul, odiava-o' takes up Saul as the object of the clitic, and the previous sentences have David as subject, so the reader understands that David hated Saul. *(meaning)*
- Rejected: pt-BR/ch001.md [4], [7], [8], [10], [12], [13], [15], [18] — mechanical audit: emphasis markers differ — These are the bold paragraph numbers (**1.** etc.), required by the house format, plus the italics on *Ter sanctus* in [12].
- Rejected: pt-BR/ch001.md [19] — 'Deixa-a ali' after 'oferece-o' (sacrifício) — 'a' refers to 'oferta' in the Gospel quotation just before. The antecedent is clear and the gender agrees.
- Rejected: pt-BR/ch001.md [7] — 'E que temos nós com isso?' answered with 'A maior importância possível' — The reply follows the source ('what concern… The greatest possible concern') and stays clear. This is a style choice, not a defect.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 1 minor. Leitura integral dos 19 parágrafos, das duas notas, de book.json, do diário e dos oito alertas mecânicos: uma ambiguidade de sujeito que inverte os papéis e um defeito de pontuação.
- `pt-BR/ch001.md` [16]: “depois dos inúmeros bons serviços que lhe prestara” → “depois dos inúmeros bons serviços que Davi lhe prestara” — Os serviços foram prestados por Davi a Saul, como confirma a referência a Golias. Com Saul explicitado como sujeito da oração principal, o sujeito oculto de 'prestara' sugere a relação inversa. *(meaning)*
- `pt-BR/ch001.md` [17]: “ao ato, a memória dos acontecimentos passados, induziram-no” → “ao ato e a memória dos acontecimentos passados induziram-no” — A enumeração dos dois sujeitos termina indevidamente com uma vírgula que os separa do verbo. A coordenação preserva os dois possíveis motivos apresentados pela fonte.

### Round 3 (claude, delta read)
Verdict: 1 meaning-level, 0 minor. Delta read of ch001 [15]-[18]: both round-2 changes verified correct; one more possessive in [16] ('seus inumeráveis bons serviços') misattributes David's services to Saul.
- `pt-BR/ch001.md` [16]: “que, depois de seus inumeráveis bons serviços, muitas vezes tentara destruí-lo” → “que, depois dos inumeráveis bons serviços que dele recebera, muitas vezes tentara destruí-lo” — source: 'who after his countless good services had many times attempted to destroy him', where the services are David's to Saul. With Saul as subject of the relative clause, 'seus' attributes the services to Saul; same inversion as the round-2 fix earlier in the paragraph. *(meaning)*
- Rejected: pt-BR/ch001.md [17] — Round-2 fix merges the source's two questions ('did the captain…, did the memory…') into one coordinated subject — Grammatical, no crase ambiguity ('a memória' is clearly subject), and both motives are kept; a defensible rendering.
- Rejected: pt-BR/ch001.md [16] — 'de seus brilhantes triunfos e da salvação que operara' after the fix — With 'Davi' now explicit in the preceding clause, the possessive and the hidden subject resolve to David.
- Rejected: pt-BR/ch001.md [18] — 'é visto a poupá-lo' (a + infinitive) — Accepted construction in Portuguese; not an error.

### Round 4 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos 19 parágrafos, das duas notas, de book.json, do diário e dos oito alertas mecânicos: um desvio de sentido.
- `pt-BR/ch001.md` [18]: “esperava que lhe sobreviessem males maiores e piores” → “esperava que lhe sobreviessem novos males, ainda piores” — A fonte diz “more and worse evils”: males adicionais e piores. “Maiores” substitui a ideia de novos sofrimentos pela de maior magnitude. *(meaning)*

### Round 5 (claude, delta read)
Verdict: 0 meaning-level, 1 minor. Delta read of ch001 [17]-[19]: round-4 fix correct in sense; one missing closing comma after the appositive in [18]
- `pt-BR/ch001.md` [18]: “novos males, ainda piores em consequência” → “novos males, ainda piores, em consequência” — source: 'expected more and worse evils to befall him in consequence of saving his enemy'; the appositive 'ainda piores' opened by a comma must be closed, otherwise 'em consequência de salvar' reads as qualifying 'piores' rather than 'sobreviessem'
- Rejected: pt-BR/ch001.md [18] — round-4 change 'novos males, ainda piores' for 'more and worse evils' — faithful: renders both the additional ('more') and the graver ('worse') sense; only the punctuation needed fixing
- Rejected: pt-BR/ch001.md [19] — 'exorta e incita à reconciliação com aqueles a quem ofenderam os que injustamente causaram sofrimento' has inverted word order — grammatical and unambiguous: 'os que … causaram sofrimento' is the object of 'exorta' and the relative clause fixes the roles; same sense as the source

### Round 6 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente os parágrafos [17]–[19] e conferida a alteração da rodada 5: a vírgula está correta e preserva o sentido da fonte. Nenhum novo defeito encontrado.
