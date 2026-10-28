# Diário de tradução — Apologia (pt-BR)

Fonte: en-US/, tradução de W. H. Fremantle (Nicene and Post-Nicene Fathers, Second Series, vol. 3, 1892), revista por Kevin Knight para New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Apology | Apologia | Título |
| your Holiness | Vossa Santidade | O "you" dirigido ao papa vira "vós" (vossa mente, rogo-vos, desejais) |
| holy, venerable and saintly father | santo, venerável e piedoso pai | |
| Holy Ghost / Holy Spirit | Espírito Santo | Como no *Comentário ao Símbolo dos Apóstolos* |
| Trinity / Persons | Trindade / Pessoas | |
| nature, godhead, power, substance | natureza, divindade, poder, substância | |
| the quick and the dead | os vivos e os mortos | |
| resurrection of our own flesh / this very flesh | ressurreição de nossa própria carne / esta mesma carne | O argumento depende de "esta" |
| natural body / spiritual body | corpo natural / corpo espiritual | Ver Decisões |
| Apostolic See | Sé Apostólica | |
| deliver / hand down | transmitir | Como no *Comentário ao Símbolo* |
| article of faith | artigo de fé | |
| due meed | justa paga | |
| accusers of their brethren | acusadores de seus irmãos | Alude ao sentido de "diabo" (acusador) |
| ill will | malquerença | |
| partisanship and calumny | partidarismo e calúnia | |
| offenses (cause to stumble) | escândalos (fazer tropeçar) | |
| Anathema | anátema | |
| the Scorpion | o Escorpião | Apelido que Jerônimo dá a Rufino |
| Περὶ ᾿Αρχῶν | *Περὶ ᾿Αρχῶν* | Mantido em grego e em itálico. A fonte não traduz o título (*Sobre os Princípios*) |

Nomes: Rufino, Anastácio, Cromácio, Aquileia, Jerônimo, Marcela, Pamáquio, Sirício, Orígenes, João de Jerusalém, Alexandria, Tertuliano, Lactâncio.

## Decisões

- O parágrafo introdutório do editor inglês (¶3) faz parte do texto-fonte e foi traduzido. Não é nota de rodapé.
- ¶3: a fonte diz que Anastácio ocupou a sé "de 498 a 503", mas o mesmo parágrafo situa sua eleição em 399. Os números foram mantidos e uma nota do tradutor dá as datas corretas (399–401).
- ¶3: "Epistle 127:10" foi mantido como "Epístola 127:10". "a.d." virou "d.C.".
- Os números dos parágrafos do autor (1–8) foram grafados em negrito inerte (`**1.**`).
- ¶7: 1 Coríntios 15:42-44 segue a redação da fonte ("natural body"), com "corpo natural". O *Comentário ao Símbolo* usa "corpo animal" porque essa era a redação da sua fonte. A fonte não dá referência nem aspas, e nada foi acrescentado.
- ¶10: o irônico "forsooth" foi vertido por uma exclamação à parte ("Que grande culpa!"), para conservar o sarcasmo de Rufino em sintaxe moderna.
- ¶4: "30 years" manteve o algarismo ("30 anos").
- O campo `description` de `sources` no book.json é uma string, não um objeto por idioma. Por isso ficou inalterado.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch001 [1]-[11] plus the journal and book.json; one meaning fix (ambiguous 'seu bispo' in [3]); the rest is faithful and complete
- `pt-BR/ch001.md` [3]: “nenhum cristão desejaria ser mal visto por seu bispo” → “nenhum cristão desejaria ser mal visto pelo bispo de Roma” — source: 'would not wish to be ill-thought of by its Bishop', where 'its' is Rome. In Portuguese 'seu' attaches to the subject 'cristão' and suggests the Christian's own bishop, which breaks the argument *(meaning)*
- Rejected: pt-BR/ch001.md [3]-[11] — mechanical audit: emphasis markers differ — [4]-[11] are the inert bold paragraph numbers (**1.**) and [3] is the two italicized Περὶ ᾿Αρχῶν, both recorded in the journal
- Rejected: pt-BR/ch001.md [3] — 'from Aquileia' moved into a separate sentence ('Rufino vivia então em Aquileia') — the convocation to Rome and the residence in Aquileia with Cromácio are both kept; the sense is unchanged
- Rejected: pt-BR/ch001.md [4], [9] — 'Vossa Santidade' with third-person verbs mixed with 'vós'/'vossa' — traditional form of address, recorded in the Key Terms table
- Rejected: pt-BR/ch001.md [3] — content of footnote [^1] not shown — the definition is outside the paragraph blocks; the journal describes the note (399–401) and nothing in the text contradicts it

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de [1]–[11], cotejada com a fonte, e revisão do diário, book.json e alertas mecânicos; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/ch001.md [10] — “Que grande culpa!” não aparece como frase independente na fonte. — A exclamação reproduz o sarcasmo de “forsooth”, conforme a decisão registrada no diário, sem acrescentar uma afirmação substantiva.
