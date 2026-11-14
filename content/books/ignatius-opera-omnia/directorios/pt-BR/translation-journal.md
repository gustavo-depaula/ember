# Diário de tradução — Diretórios dos Exercícios (pt-BR)

Fonte: es-ES/, *Directorios de Ejercicios*, PDF da Documenta Catholica Omnia (a partir de Monumenta Ignatiana, série II).
Destino: pt-BR.

## Termos

| Espanhol | Português | Notas |
|---|---|---|
| San Ignacio de Loyola / N. P. Mtro. Ignacio | Santo Inácio de Loyola / N. P. Mestre Inácio | como nos *Exercícios* |
| P. D. Vitoria / Victoria | P. D. Vitória | grafia unificada, como na descrição |
| P. Polanco | P. Polanco / João Afonso de Polanco | nota do tradutor |
| Ejercicios / ejercicios | Exercícios / exercícios | maiúscula espelhada da fonte |
| el que da / el que hace los ejercicios | quem dá / quem faz os exercícios | |
| el que se ejercita / ejercitante | quem se exercita / exercitante | |
| encerrarse / recogerse | recolher-se | para os Exercícios |
| anotaciones / adiciones | anotações / adições | |
| fundamento | fundamento | princípio e fundamento |
| examen particular / general / cotidiano | exame particular / geral / cotidiano | |
| puntos / repeticiones | pontos / repetições | |
| consolación / desolación | consolação / desolação | |
| mociones | moções | |
| discernimiento / discretio spiritus | discernimento dos espíritos / *ad discretionem spiritus* | latim em itálico |
| elección / tiempos / modos de elección | eleição / tempos / modos de eleição | |
| consejos / preceptos | conselhos / preceitos | nota do tradutor |
| religión (entrar en, en religión) | vida religiosa | como "tomar religión" nos *Exercícios* |
| estado de perfección | estado de perfeição | |
| grado de humildad | grau de humildade | |
| indiferencia / resignación | indiferença / resignação | |
| confesión general | confissão geral | |
| comer / cenar | almoço / jantar; comer | como nos *Exercícios* |
| la Compañía | a Companhia | |
| sugeto / subiecto (pessoa) | pessoa | |
| Cristo N. S. / Dios N. S. | Cristo N. S. / Deus N. S. | abreviatura mantida |
| primera / segunda semana | primeira / segunda semana | |
| gaudium spirituale | *gaudium spirituale*; gozo espiritual | latim em itálico |
| etiam / imo / directe / coram Domino / ex abrupto | *etiam* / *imo* / *directe* / *coram Domino* / *ex abrupto* | latim em itálico |
| Item | Item | mantido |
| librea | libré | |

## Decisões

- Rubricas e títulos em maiúsculas dentro do primeiro parágrafo de cada parte mantidos em maiúsculas, como na fonte.
- "excreción" / "Excreción" (diretório autógrafo, n. [5] e [14]) lido como erro por "exercicio": traduzido "exercício".
- Diretório ditado: a cabeça "D.VICTORIA L annotaciones" lida como "Las annotaciones" (letra solta da digitalização): "As anotações".
- Diretório ditado: os italianismos da cópia (alcún, potría, certo, vestro, toto, buona) traduzidos como o espanhol correspondente.
- "en querido sujetarse" (ditado, n. [20]) lido como "no queriendo sujetarse": "não querendo sujeitar-se".
- Diretório autógrafo, n. [22]: o trecho corrompido "en qué manera.si preceptos" traduzido com ponto e nova frase.
- "polilla, que apolilla" (ditado, n. [19]) traduzido "traça que traça", para conservar o jogo de palavras.
- Falas sugeridas ao diretor (ditado, n. [3], [7], [20]) postas entre aspas para clareza.
- Notas do tradutor numeradas por arquivo. Autógrafo: [^1] conselhos e preceitos. Ditado: [^1] 2 Coríntios 12:16; [^2] Jeremias 48:10 e Mateus 10:16; [^3] Provérbios 23:26 com acréscimo; [^4] Mateus 7:29; [^5] incipits latinos da Vulgata dos Exercícios; [^6] Mateus 19:12; [^7] Polanco. Notas de viva voz: [^1] MHSI e Polanco.
- Citações latinas sem tradução na fonte ficam em itálico; a tradução vai em nota quando ajuda o leitor.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. I read the autograph Directory, the dictated Directory and the notes given by word of mouth, every paragraph against es-ES, along with the translator's notes, book.json and the journal. I found no defects; the audit flags are explained above.
- Rejected: audit: emphasis markers differ (13 places) — The translation has more emphasis markers than the source. — Each extra marker is italic on retained Latin (gaudium spirituale, de praeceptis Dei, etiam, directe, coram Domino and others), as the journal prescribes.
- Rejected: audit: Key Terms row encerrarse → recolher-se — The audit counts 0 occurrences of recolher-se. — The verb occurs in inflected forms: recolha-se (autógrafo [7]), and se recolha, se recolher and recolhêsseis in the dictado. The row is correct.
- Rejected: pt-BR/directorio-dictado.md [10] — 'le ieren' is rendered as 'o ferirem'. — The source word is corrupt. 'hirieren' is a plausible reading and no alternative is certain, so the rendering is defensible.
- Rejected: pt-BR/directorio-dictado.md [20] [^5] — The note dates the Vulgate version of the Exercises and matches the incipits to it. — The Vulgate was approved in 1548. The incipits match its annotations 1, 3, 4 and 5.
- Rejected: pt-BR/directorio-dictado.md [7] [^7]; notas-de-palabra [^1] — The notes give Polanco's dates and roles. — Juan Alfonso de Polanco lived 1517–1576 and was Ignatius's secretary. The source itself says he took down the notes given by word of mouth.
- Rejected: pt-BR/directorio-dictado.md [1], [9], [21] — Clitic doubling in 'Pode-se dar-lhes' and 'pode-se dizer-lhe'. — This is an accepted Portuguese construction, not a grammar error.
- Rejected: pt-BR/directorio-dictado.md [3] — 'salvo que' is rendered as 'contanto que'. — In context the clause states a condition: the farther away the better, provided they understand the excellence of the Exercises. The rendering fits.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Li integralmente os três arquivos, suas notas, book.json, o diário e os apontamentos da auditoria; não encontrei defeitos objetivos.
- Rejected: pt-BR/notas-de-palabra.md [2] — “nonada” traduzido por “quase nada”. — “Nonada” também pode designar coisa insignificante; a tradução é defensável no contexto da quantidade de comida solicitada.
