
## Termos

| household of faith | domésticos da fé | Gálatas 6:10. |
| make a fair show in the flesh | ostentar boa aparência na carne | Gálatas 6:12. |
| new creature | nova criatura | Gálatas 6:15. |
| Old Dispensation | antiga economia | Cap. 6, §38. |
| glory / boast (in the Cross) | gloriar-se / glória | Gálatas 6:14; “boast” como verbo fica “gloriar-se”. |

## Decisões

- Cap. 6, §2: “Verse 1” vertido “Versículo 1”; os demais rótulos “Ver.” seguem como “Vers.”.
- Cap. 6, §9-10: *tu* em Gálatas 6:1 (“olhando para ti mesmo”), que é singular na fonte e no grego; o “if you be overtaken” do §10 segue o singular.
- Cap. 6, §14, §18, §20, §26, §34: *tu* nos exemplos genéricos (“este é irascível, tu és indolente”; “se praticaste uma boa ação”); *vós* quando o texto se dirige aos gálatas em conjunto.
- Cap. 6, §26: “ambition of this kind” (gr. *philotimía*, munificência) vertido “esta liberalidade”, porque “ambição” daria o sentido oposto.
- Cap. 6, §5-6: “restore” e “set right” mantêm a diferença da fonte: “restaurai” e “endireitai”.
- Notas do tradutor do cap. 6: [^1] §14, *anaplērṓsate*, base da distinção entre “cumpri” e “completai”; [^2] §30, *pēlíkois grámmasin*, que Crisóstomo lê como a forma desajeitada das letras.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 4 minor. Full read of ch001-ch006: one meaning error (ch001 [46], 'not fully trusted' rendered as 'not fully worthy of trust'), two grammar slips in ch001 [27], and inconsistent verse-range labels in ch004/ch005; audit flags not defects.
- `pt-BR/ch001.md` [46]: “por não ser plenamente digno da confiança deles” → “por não gozar da plena confiança deles” — source: 'on account of not being fully trusted by them'; the PT says Paul was not fully worthy of their trust, which is the opposite of the point. *(meaning)*
- `pt-BR/ch001.md` [27]: “É, então, mau a distinção dos dias e o curso do sol?” → “São, então, maus a distinção dos dias e o curso do sol?” — concord: 'mau' (masc. sing.) with 'a distinção … e o curso' is ungrammatical; compound subject takes the plural.
- `pt-BR/ch001.md` [27]: “Que outra prova precisamos de uma mente má e depravada?” → “Que outra prova se requer de uma mente má e depravada?” — regency: 'precisar' requires 'de' ('De que outra prova precisamos'), which here would stack two 'de'; rephrased keeping the sense.
- `pt-BR/ch004.md` [2]: “Vers. 1-3” → “Versículos 1-3” — chapter-opening label 'Verse 1-3' is rendered 'Versículos'/'Versículo' in ch001-ch003 and ch006 (journal: 'Verse 1' → 'Versículo 1'); 'Vers.' is reserved for the inline 'Ver.' labels.
- `pt-BR/ch005.md` [2]: “Vers. 1” → “Versículo 1” — same as ch004 [2]: the chapter-opening 'Verse 1' label is 'Versículo 1' elsewhere in the book.
- Rejected: pt-BR/ch001.md [21], [27], [70] — emphasis markers differ from source — italics are added only around retained Greek (Θεὸς, αἴων, ἰ δεῖν…), as the house rule requires.
- Rejected: pt-BR/ch002.md [33] — repeated word 'Romanos Romanos' — the second is the inline Scripture reference (Romanos 15:25-27), as in the source.
- Rejected: pt-BR/ch001.md [4], [35]; ch003.md [24] — wrong references (1 Coríntios 6:21, João 15:16, Gênesis 12:4) — they reproduce the canonical source; the edition is not corrected.
- Rejected: pt-BR/ch002.md [7], [17], [37] — Greek (τοῖς δοκοῦσιν, οἰκονομία) not italicized, unlike ch001 — consistent within the file and not a sense change; left as is.
- Rejected: pt-BR/ch001.md [42] — 'E não digo que seja coisa pequena afirmar que o Filho de Deus é um ser criado' vs garbled source — a defensible reading of the obscure English ('not to say that … is a small matter').

### Round 2 (codex, full read)
Verdict: 5 meaning-level, 5 minor. Leitura integral dos 385 parágrafos, notas, book.json e diário: cinco defeitos de sentido e cinco correções menores, incluindo a retirada de uma nota não confirmável.
- `pt-BR/ch001.md` [10]: “João 1:1. ou o que” → “João 1:1 ou o que” — O ponto interrompe indevidamente a enumeração, que continua com «ou».
- `pt-BR/ch001.md` [52]: “sendo extremamente zeloso” → “sendo muito mais zeloso” — A fonte diz «more exceedingly zealous», comparando o zelo de Paulo com o dos seus contemporâneos; a tradução perdeu o comparativo. *(meaning)*
- `pt-BR/ch001.md` [55]: “sobre a mudança do seu nome de Saulo para Paulo;[^3]” → “sobre a mudança do seu nome de Saulo para Paulo;” — Retirada do marcador da nota cuja identificação bibliográfica e localização não puderam ser confirmadas.
- `pt-BR/ch001.md`: “[^3]: *Nota do tradutor:* alusão às homilias do próprio Crisóstomo sobre a mudança dos nomes (*De mutatione nominum*), pregadas em Antioquia, em que trata da mudança do nome de Saulo para Paulo.” → “” — Não foi possível confirmar a identificação com De mutatione nominum nem a localização em Antioquia. Sem esses detalhes, a nota apenas repete a remissão já presente no texto.
- `pt-BR/ch002.md` [40]: “desprezar nem resistir à sentença de Paulo” → “desprezar a sentença de Paulo nem resistir a ela” — Os verbos exigem regências diferentes: desprezar algo e resistir a algo.
- `pt-BR/ch003.md` [3]: “*Ó gálatas insensatos* *quem” → “*Ó gálatas insensatos*, *quem” — Falta a vírgula que separa o vocativo da pergunta.
- `pt-BR/ch003.md` [5]: “ferir aqueles sobre quem pousa” → “ferir aqueles que o veem” — A fonte diz «those who look upon it»: são pessoas que veem o olhar, não pessoas sobre as quais ele pousa. *(meaning)*
- `pt-BR/ch003.md` [55]: “se a salvação vos vem por meio da Fé” → “se a Lei vos salva por meio da Fé” — Em «if it save you, by means of Faith», o sujeito é a Lei. O argumento atribui à Lei uma função instrumental na salvação mediante a fé. *(meaning)*
- `pt-BR/ch005.md` [35]: “enfeitiçou a mente e a fez delirar de prazer” → “enfeitiçou a mente e a fez desejar freneticamente o prazer” — «Made it frantic for pleasure» descreve desejo frenético de prazer, não delírio causado pelo prazer já experimentado. *(meaning)*
- `pt-BR/ch006.md` [38]: “quando todas as coisas passaram por tal mudança” → “quando todas as coisas tiverem passado por tal mudança” — A fonte situa essa transformação no futuro, após mencionar a passagem da criação à incorrupção; o pretérito a apresenta como já consumada. *(meaning)*
- Rejected: pt-BR/ch001.md [21], [27], [70]; pt-BR/ch002.md [33] — Diferenças de ênfase e repetição de «Romanos» apontadas pelo audit. — Os itálicos assinalam o grego conservado; o segundo «Romanos» inicia a referência bíblica. Mantidas as decisões anteriores.
- Rejected: pt-BR/ch004.md [36] — Referência aparentemente incorreta a Gênesis 15:16. — A referência reproduz exatamente a fonte canônica; não cabe corrigir a edição.

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001-ch006, the notes, book.json and the journal: one minor regency fix in ch005 [33]; the audit flags and the other candidates are not defects.
- `pt-BR/ch005.md` [33]: “não se deviam obedecer os costumes de seus pais” → “não se devia obedecer aos costumes de seus pais” — source: 'their father's customs ought not to be obeyed'; 'obedecer' takes 'a', so the object needs 'aos', and with an indirect object the verb with 'se' stays singular
- Rejected: pt-BR/ch001.md [21], [27], [70]; pt-BR/ch002.md [33] — audit flags: emphasis markers differ; repeated 'Romanos Romanos' — the italics mark retained Greek; the second 'Romanos' begins the inline reference. Same as rounds 1 and 2
- Rejected: pt-BR/ch001.md footnotes — footnote labels skip from [^2] to [^4] after round 2 removed [^3] — labels resolve by name, and every marker has exactly one definition; there is no broken link
- Rejected: pt-BR/ch002.md [36] — Peter says 'Tu és o Cristo' but then 'Longe de vós tal coisa' — this is reverential address to Christ, which the house rules do not normalize; the sense is unaffected
- Rejected: pt-BR/ch002.md [64] — 'antiga Dispensação' vs Key Terms 'Old Dispensation → antiga economia' — the source term here is 'former Dispensation', and the table row covers only ch006 §38; this is not a drift from a stated rendering
- Rejected: pt-BR/ch006.md [10] — 'se fores surpreendido' differs from the verse rendering 'ainda que alguém seja surpreendido' in [3] — the source shows the same difference ('if you be overtaken'), and the journal records the choice

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificados os parágrafos 32–34 do capítulo 5, as duas notas apresentadas, book.json e o diário. A correção de regência e concordância está correta e preserva o sentido da fonte; nenhum novo defeito encontrado.
