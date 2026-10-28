# Diário de tradução — Excertos (pt-BR)

Fonte: en-US/, tradução de William Wilson, Ante-Nicene Fathers, vol. 8 (1886), revista por Kevin Knight para o New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Theodotus | Teódoto | autor como consta em `book.json` |
| Excerpts | Excertos | |
| Selections from the Prophetic Scriptures | Seleções das Escrituras proféticas | *Eclogae propheticae* |
| Gnostic / Gnostic teaching | gnóstico / ensinamento gnóstico | sentido positivo, do cristão perfeito |
| knowledge / gnosis | conhecimento / gnosis | "(gnosis)" mantido como na fonte, sem itálico |
| scientific knowledge / science | conhecimento científico / ciência | |
| first-created (angels) / the First-created | (anjos) primeiro-criados / os Primeiro-criados | *prōtoktistoi* |
| power / powers (angelic) | potência / potências | "poder" para o poder de Deus |
| principalities / rule | principados / principado | |
| matter / material | matéria / material | |
| abyss | abismo | |
| regeneration | regeneração | |
| self-control / man of self-control | domínio de si / homem que tem domínio de si | |
| passion / passionless | paixão / impassível | |
| long-suffering | longanimidade | |
| inordinate affection | afeição desordenada | |
| tabernacle / tent | tabernáculo / tenda | Salmo 18 (19) |
| covenant | aliança | |
| the Word | o Verbo | |
| Saviour | Salvador | |
| Holy Spirit | Espírito Santo | |
| Divinity | Divindade | |
| Sedrach, Misak, Abednago | Sidrac, Misac, Abdênago | |
| Osee / Hosea | Oseias | |
| Jezreel | Jezrael | |
| Enoch | Henoc | |
| Tatian / Hermogenes / Pantænus / Pythagoras | Taciano / Hermógenes / Panteno / Pitágoras | |
| Heraclius | Heráclio | ver Decisões |
| Peter in the Apocalypse / the Preaching | Pedro no Apocalipse / a “Pregação” | escritos apócrifos |
| elders | anciãos | |

## Decisões

- Os numerais romanos das seções (I., II., …) ficam como na fonte, no início do parágrafo.
- As referências bíblicas ficam no lugar em que a fonte as põe, logo após a citação, com o nome português do livro.
- Tratamento: *vós* em toda oração dirigida a Deus nos salmos citados (¶45, ¶55, ¶67, ¶68), mesmo onde a fonte grafa "your" em minúscula, para manter o mesmo tratamento ao mesmo destinatário. *Tu* para o leitor genérico ("chamarias", "vê", "podes", "esfregas").
- ¶3 "Those around Sedrach…" (idiomatismo grego) → "Os que estavam com Sidrac…", literal à fonte.
- ¶56 "speech" → "palavra"; ¶63 "Word" → "Verbo", para manter o nexo com "o Salvador é chamado Lei e Verbo".
- ¶61 "He has set" → "pôs", com "Shine forth as the sun" no infinitivo ("Resplandecer como o sol"), como a fonte, sem fixar tempo verbal.
- Notas do tradutor: [^1] (¶8) Moisés e Josué, e o nome *Iēsous*; [^2] (¶27) Heráclio, provavelmente Heracleão, o valentiniano; [^3] (¶44) o *Apocalipse de Pedro*; [^4] (¶61) Panteno.
- Reticências da fonte mantidas ("terra.... César", "Senhor....", "nem paciente...").

### Deslizes da fonte (espelhados, não corrigidos)

- ¶27 "Heraclius" por Heracleão (explicado em nota).
- ¶44 "shines: forth": dois-pontos espúrio, não reproduzido.
- ¶53 "Lucas 1:43" para "a criança saltou" (o versículo é 1:41 ou 1:44); referência mantida.
- ¶30: as três referências a 1 Coríntios 1:18 repetidas como na fonte.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 (69 paragraphs, 4 notes), book.json and the journal: the text is clean; one wrong paragraph location in the journal's list of source slips.
- `pt-BR/translation-journal.md`: “- ¶29 a ¶30: as três referências a 1 Coríntios 1:18” → “- ¶30: as três referências a 1 Coríntios 1:18” — all three 1 Corinthians 1:18 references are in ¶30; ¶29 cites only Lucas 12:49
- Rejected: pt-BR/ch001.md [21] — "Having set free the spirit of bondage" rendered "Tendo despedido" — the sense is letting go of the spirit of bondage; "despedir" carries it, so this is a defensible choice
- Rejected: pt-BR/ch001.md [53] — "depois de este ter sido preparado" commits the antecedent to the womb — the preparation by cleansing refers to the womb in the Greek; the commitment is correct
- Rejected: pt-BR/ch001.md [4] — vós for God in a Daniel quotation is not listed in the journal's address decision — the journal's decision covers only the quoted psalms; vós here is consistent with it, so nothing is false

### Round 2 (codex, full read)
Verdict: 4 meaning-level, 1 minor. Leitura integral dos 69 parágrafos, das quatro notas, de book.json e do diário: quatro defeitos de sentido e um de concordância.
- `pt-BR/ch001.md` [14]: “o que nos convém ter e o que nos convém querer” → “o que nos convém ter e o que nos convém não ter” — Na oposição entre “have” e “want”, “want” significa carecer, não desejar. *(meaning)*
- `pt-BR/ch001.md` [27]: “capaz de purificar o mal” → “capaz de eliminar o mal pela purificação” — “Cleansing away evil” significa remover o mal pela purificação, não tornar puro o próprio mal. *(meaning)*
- `pt-BR/ch001.md` [34]: “cortada a paixão e despojada de toda a alma” → “cortada e removida a paixão de toda a alma” — A fonte diz que a paixão é retirada de toda a alma; a tradução diz que a paixão é despojada da alma. *(meaning)*
- `pt-BR/ch001.md` [50]: “não se irritar nem se afligir” → “não nos irritar nem nos afligir” — Os infinitivos continuam subordinados a “nos manda”; os pronomes reflexivos devem manter a primeira pessoa do plural.
- `pt-BR/ch001.md` [52]: “voltando-se sobre elas” → “correndo de volta para dentro delas” — “Running back into them” descreve o retorno dos animais ao interior das mulheres, não apenas um movimento contra elas. *(meaning)*
- Rejected: pt-BR/ch001.md [7] — “Grande torrente impetuosa” foi ligada à matéria. — O parágrafo seguinte retoma expressamente esse rio e mar como sendo da matéria, sustentando a leitura.
- Rejected: pt-BR/ch001.md [41] — “Os quais são punidos” parece retomar os castigos. — O masculino plural pode retomar o conjunto de blasfêmias, disparates e expressões ultrajantes, composto de substantivos dos dois gêneros.
- Rejected: pt-BR/ch001.md [69] — A segunda frase parece contradizer a citação quanto à inocência. — A negação está expressamente na fonte: “I shall not be innocent”. A tradução a preserva corretamente.

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 (69 paragraphs, 4 notes), book.json and the journal: no defects; round 2 fixes verified.
- Rejected: pt-BR/ch001.md [12] — "corrupt body" rendered "corpo corruptível" — In this context "corrupt" means perishable, set against the old ship image; "corruptível" carries that sense and is a defensible rendering.
- Rejected: pt-BR/ch001.md [28] — "having power of body and soul" rendered "tendo poder sobre o corpo e a alma" — The English is ambiguous, and in context (God able to nourish and save) power over body and soul is the natural reading; this is not a mistranslation.
- Rejected: pt-BR/ch001.md [49] — "Pois a própria alma, ... diz-se que recebe espíritos" has a dangling subject — It mirrors the source's construction ("the soul itself ... is said to receive spirits"); it is a readable topicalization, not broken grammar.
- Rejected: pt-BR/ch001.md [63] — "como diz Pedro na 'Pregação'" adds "diz" — The verb is implicit in the English ellipsis, and making it explicit adds no content.
