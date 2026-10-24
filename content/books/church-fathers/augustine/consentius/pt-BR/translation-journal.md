
## Termos

| laver of regeneration | banho da regeneração | imagem batismal |
| incorruption | incorruptibilidade | contraposta à condição corruptível |
| sting of death | aguilhão da morte | imagem bíblica preservada |

## Decisões

- Traduzidos os parágrafos [42–43], correspondentes aos §§ 40–41, mantendo um parágrafo por parágrafo da fonte.
- No § 40, preservado “charity” como “caridade”, embora o contexto imediato trate da castidade; não se corrigiu a redação da edição inglesa.
- A interpelação à verdade personificada no § 40 recebe tu.
- No § 41, “venially permitted” recebe “permitido, como falta perdoável”, conservando a ideia de indulgência sem apresentar a falta como aprovada pela verdade.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 8 minor. Full read of ch001 (§§ 1–41), book.json and journal; fixed a stray blockquote, broken grammar in § 24, a reversed predication in § 38, one word, an overclaiming translator's note, and inconsistent reverential capitalization.
- `pt-BR/ch001.md` [17]: “> **15.** Quanto àquela palavra” → “**15.** Quanto àquela palavra” — source '&gt;15.' is an escaped-HTML artifact, not a blockquote; every other paragraph is plain
- `pt-BR/ch001.md` [26]: “renovam-se por nós de certo modo as descobrirmos” → “renovam-se por as descobrirmos de certo modo” — broken syntax ('por nós ... as descobrirmos'); source: 'by our (in some sort) discovering of them, become renewed' *(meaning)*
- `pt-BR/ch001.md` [26]: “embora seja amarga” → “embora seja azeda” — source 'sour', not 'bitter'
- `pt-BR/ch001.md` [40]: “e a verdade é a castidade não do corpo, mas da mente” → “e a castidade não do corpo, mas da mente, é verdade” — source 'not the body's but the mind's chastity is truth': the mind's chastity is the subject; the translation reversed the predication *(meaning)*
- `pt-BR/ch001.md` [26]: “São exemplos tradicionais de antífrase, não explicações etimológicas.” → “São exemplos tradicionais de antífrase.” — the antiquity did offer these as etymologies (by antiphrasis), so the denial is not certain; cut back to what is certain
- `pt-BR/ch001.md` [10]: “substância que ele.” → “substância que Ele.” — the file capitalizes pronouns for God and Christ elsewhere ([25], [28], [34], [39]); keep it internally consistent
- `pt-BR/ch001.md` [11]: “não parte dele;” → “não parte Dele;” — reverential capitalization consistent with the rest of the file ('Daquele' in [29], [36])
- `pt-BR/ch001.md` [12]: “dizemos que ele não é como verdadeiramente é, e que ele é como” → “dizemos que Ele não é como verdadeiramente é, e que Ele é como” — reverential capitalization consistent with the rest of the file
- `pt-BR/ch001.md` [14]: “ele, porém, não disse isso” → “Ele, porém, não disse isso” — reverential capitalization consistent with the rest of the file
- `pt-BR/ch001.md` [14]: “Não é isso que ele diz.” → “Não é isso que Ele diz.” — reverential capitalization consistent with the rest of the file
- Rejected: pt-BR/ch001.md [3]–[40] — emphasis/parenthesis counts differ from source — bold paragraph numbers and dashes in place of parentheses; content complete
- Rejected: pt-BR/ch001.md [6] — 'in the meantime' not rendered in 'passará imediatamente para o lado deles' — redundant with 'straightway'; no loss of sense
- Rejected: pt-BR/ch001.md [38] — 'é de duvidar que também o façam com sabedoria' attributes wisdom to the objections — readable as 'whether they move me wisely'; close enough to 'mirum si et sapienter'
- Rejected: pt-BR/ch001.md [42] — 'caridade' where context speaks of chastity — journal decision to follow the English edition; not a translation defect

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 4 minor. Leitura integral dos 43 blocos, da nota do tradutor, do book.json, do diário e dos apontamentos mecânicos: um defeito de sentido e quatro menores.
- `pt-BR/ch001.md` [11]: “é falso tanto uma coisa como a outra que dizemos” → “são falsas tanto uma coisa como a outra que dizemos” — O predicativo deve concordar com as duas coisas declaradas falsas.
- `pt-BR/ch001.md` [16]: “fosse possível dizer uma mentira com a boca” → “fosse lícito dizer uma mentira com a boca” — A fonte nega a permissão de mentir conservando a verdade no coração, não a possibilidade de fazê-lo, já demonstrada nos exemplos anteriores. *(meaning)*
- `pt-BR/translation-journal.md`: “`pt-BR/ch001.md` [24]: “São exemplos tradicionais de antífrase, não explicações etimológicas.”” → “`pt-BR/ch001.md` [26]: “São exemplos tradicionais de antífrase, não explicações etimológicas.”” — A nota está vinculada ao parágrafo [26], correspondente ao § 24.
- `pt-BR/translation-journal.md`: “pt-BR/ch001.md [36] — 'é de duvidar que também o façam com sabedoria'” → “pt-BR/ch001.md [38] — 'é de duvidar que também o façam com sabedoria'” — A expressão ocorre no parágrafo [38], correspondente ao § 36.
- `pt-BR/translation-journal.md`: “pt-BR/ch001.md [40] — 'caridade' where context speaks of chastity” → “pt-BR/ch001.md [42] — 'caridade' where context speaks of chastity” — A ocorrência de caridade está no parágrafo [42], correspondente ao § 40.
- Rejected: pt-BR/ch001.md [24], [28] — Passagem de “vós que sois espirituais” para “considerando-te também a ti mesmo” na citação. — A própria fonte passa do destinatário plural ao singular distributivo em “considering yourself”; a tradução conserva essa mudança.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 1 minor. Delta read of ch001 [10]–[17], the footnote and the journal: round-2 fixes are correct; one ambiguous possessive fixed in [10]
- `pt-BR/ch001.md` [10]: “ser mestres de sua verdade” → “ser mestres da verdade de Deus” — source 'teachers of His truth'; 'sua' right after 'libertá-los' can be read as the heretics' truth; naming God removes the ambiguity
- Rejected: pt-BR/ch001.md [11] — 'são falsas tanto uma coisa como a outra' concord — feminine plural agrees with the two 'coisa' subjects; correct
- Rejected: pt-BR/ch001.md [16] — 'fosse lícito' vs. 'may speak a lie' — 'may' here means permission, which matches the argument; the fix is right
- Rejected: pt-BR/ch001.md [17] — 'alien' rendered as 'estrangeiro' and then 'estranho' — both are defensible for the sense of the passage; style choice

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Revisados integralmente os parágrafos [9]–[11], a nota do tradutor, o book.json, o diário e os apontamentos mecânicos pertinentes. A alteração em [10] está correta; nenhum novo defeito encontrado.
