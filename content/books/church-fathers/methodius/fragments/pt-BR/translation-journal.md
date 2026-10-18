# Diário de tradução — Fragmentos (pt-BR)

Fonte: en-US/, tradução de William R. Clark, *Ante-Nicene Fathers*, vol. 6 (Buffalo, 1886), revista por Kevin Knight para New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Methodius | Metódio | |
| Origen | Orígenes | |
| Porphyry | Porfírio | |
| Jonah / whale | Jonas / baleia | |
| the Deity | a Divindade | como em `three-fragments-from-the-homily-on-the-cross-and-passion-of-christ` |
| the Word | o Verbo | "most upright Word" → "retíssimo Verbo" |
| Wisdom | a Sabedoria | concordância feminina ("por meio dela") |
| Beginning / beginning | Princípio / princípio | maiúscula segue a fonte; "unbeginning beginning" → "princípio sem princípio"; "unbeginning" (universo) → "sem princípio" |
| dispensation | dispensação | |
| Centaur | Centauro | |
| co-eternal / co-existent | coeterno / coexistente | como em `concerning-free-will` |
| uncreated | incriado | |
| borne along in a state of chaos | levadas de cá para lá num estado de caos | eco de `concerning-free-will` |
| workman / maker / artificer / artist | artesão / autor / artífice / artista | "Maker" (Deus) → "Criador", como em `concerning-free-will` |
| Almighty / Almighty Ruler | Todo-Poderoso / Soberano Todo-Poderoso | |
| independent | independente | |
| passionless | impassível | |
| formative power | poder formador | |
| Divine band | coro divino | |
| Son of Sirach / Sirach | Filho de Sirac / Eclesiástico | |

## Decisões

- Pronomes referidos a Deus e a Cristo em minúscula ("ele", "si mesmo"), segundo o uso editorial moderno.
- Mateus 7:6: o imperativo plural da fonte ("Give not", "Cast not") vai na segunda pessoa do plural ("Não deis", "Não lanceis"). "Before swine" → "diante dos porcos" em todas as ocorrências.
- O salmo citado em §IX vai em *vós*, por ser apóstrofe reverente a Deus. Mantêm-se as reticências da fonte e a ausência de referência.
- Correção silenciosa de erros tipográficos da edição: "oar resurrection" → "nossa ressurreição"; "l earth", "He is. Almighty", "l that", "want: of", "these: things", "tim co-eternal", "all artificer".
- Provérbios 8:22: "laid my formulation" é erro por "foundation". Traduz-se "lançou o meu fundamento".
- Filipenses 2:5 conserva a referência da fonte, embora o versículo citado seja 2:6.
- A frase fragmentária de §V ("If perhaps they are unwilling…") recebe redação completa ("Talvez não queiram…"), sem acréscimo de conteúdo.
- Título "Extracts from the Work on Things" → "Excertos da Obra sobre as Coisas Criadas", conforme a descrição da obra no próprio texto ("concerning things created").
- §VI: nota do tradutor sobre o jogo etimológico *ekklesía* / *ekkaléo*, pois o sentido da frase depende dele.
- Os diálogos de §§II–IV conservam as aspas da fonte, inclusive onde faltam. As falas foram apenas separadas por espaço.
- Nos parágrafos longos de §§I–V e IX, alguns períodos foram divididos em frases menores, sem omitir nem acrescentar conteúdo.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 (24 paragraphs), book.json and the journal: no objective defects found.
- Rejected: pt-BR/ch001.md [5] — The purpose clause "that it might be shown" became an independent sentence ("Assim se mostrou que…"), and the comparison "as is the case with" became "Isso acontece com…" — These are sentence splits the journal allows; the sense (the flesh was not dissolved, as food is in the belly, to show the bodies can remain undestroyed) is kept.
- Rejected: pt-BR/ch001.md [7] — "lest they… cause the soul" is rendered as an optative "Que eles… não façam" — In Portuguese this reads as the intended aim to be avoided. Nothing is lost, and the referent of "they" is as open as in the source.
- Rejected: pt-BR/ch001.md [15] — "before which" is rendered "Antes deles" (before the days) rather than before the first day — Both readings place God's inactivity before the beginning, so the sense is unchanged.
- Rejected: pt-BR/ch001.md [14] — "peculiar unbeginning beginning" is rendered "princípio próprio e sem princípio" instead of the Key Terms form "princípio sem princípio" — The Key Terms core is kept; "próprio" translates "peculiar".
- Rejected: pt-BR/ch001.md [8], [9] — Some lines are left outside quotation marks ("Então Deus é algo diferente…", "É verdade.") — The source leaves them unquoted as well, and the journal records the decision to keep this.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 24 blocos, de book.json e do diário: uma falha menor, a nota do tradutor referenciada sem definição.
- `pt-BR/ch001.md` [12]: “no que toca aos prazeres.[^1]” → “no que toca aos prazeres.[^1]

[^1]: Nota do tradutor: O grego *ekklesía* («Igreja») relaciona-se a *ekkaléo* («chamar para fora»). O texto aplica esse jogo etimológico ao afastamento dos prazeres.” — A chamada [^1] está sem definição no texto fornecido; o diário confirma que deveria haver uma nota explicando esse jogo etimológico.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [11]–[13]: the translator's note on ekklesía/ekkaléo in [12] is correct; no defects found.
- Rejected: pt-BR/ch001.md [12] — The shown paragraph contains the [^1] call but not its definition, so the note might be missing or duplicated. — Footnote definitions are not part of the paragraph display. The listed change adds the definition right after [12], and the mechanical audit finds the markup counts balanced. Nothing shown is defective.
- Rejected: pt-BR/ch001.md [13] — "mas por sua simples vontade" adds "mas", which the source does not have. — It is the normal Portuguese link after "não a partir de…" and adds no content.
