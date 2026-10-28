# Diário de tradução — Uma Carta de Mara, Filho de Serapião (pt-BR)

Fonte: en-US/ (trad. B. P. Pratten, Ante-Nicene Fathers, vol. 8, 1886; revisão de Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Miscellaneous | Diversos | Conforme obras irmãs (miscellaneous/*). |
| Mara, son of Serapion | Mara, filho de Serapião | Serapion → Serapião, forma portuguesa usual. |
| Serapion (the son) | Serapião | Destinatário; tratamento por *tu*. |
| my son / my little son | meu filho / meu filhinho | |
| learning | saber / estudo | “pursuit of learning” → “busca do saber”. |
| wisdom / philosophy | sabedoria / filosofia | |
| delusion | ilusão | [9]. |
| gain / riches / property / possessions | lucro / riquezas / bens / bens | |
| the time / the times / Time | o tempo / os tempos / o Tempo | Maiúscula só onde a fonte personifica ([30]). |
| righteous / righteousness | justos / justiça, retidão | “justice and righteousness” → “a justiça e a retidão” ([27]). |
| fortitude and patience | fortaleza e paciência | |
| the Wise King | o Rei Sábio | Cristo, nunca nomeado na fonte; mantida a perífrase com maiúsculas. |
| Samosata / Seleucia / Samos | Samósata / Selêucia / Samos | |
| Darius / Polycrates / Achilles / Agamemnon / Priam | Dario / Polícrates / Aquiles / Agamêmnon / Príamo | Aquiles, Agamêmnon, Príamo conforme miscellaneous/ambrose. |
| Archimedes / Socrates / Pythagoras / Palamedes / Plato / Hera | Arquimedes / Sócrates / Pitágoras / Palamedes / Platão / Hera | |
| Athenians / Jews / Romans | atenienses / judeus / romanos | |
| prison-house | prisão | |

## Decisões

- As palavras em itálico da edição inglesa marcam acréscimos do tradutor inglês para completar o sentido; em português foram integradas ao texto sem itálico, porque a marcação não corresponde à sintaxe portuguesa.
- Mantidas entre aspas as palavras que a fonte destaca assim: “não” em [19] e “Estas” em [21].
- Em [29], “dismissal” → “liberação”, que serve tanto à morte desejada quanto ao contexto de prisão; “he will find us before him” → “ele nos encontrará chegados antes dele”, para não sugerir “diante dele”.
- Em [30], mantida a ambiguidade da fonte sobre quem está preso (“quando estava preso a seu lado”).
- Em [27], “humane men” → “homens clementes”, para evitar o pleonasmo “homens humanos”.
- Sem notas do tradutor: a fonte não tem notas do editor no texto e as alusões (Sócrates, Pitágoras, o Rei Sábio) são claras pelo contexto.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch001 [1]–[31], book.json and the journal: one meaning fix in [19] ('murder' weakened to 'morte'); the audit flags are not defects.
- `pt-BR/ch001.md` [19]: “Ou os judeus da morte de seu Rei Sábio” → “Ou os judeus de assassinar seu Rei Sábio” — source says 'the Jews by the murder of their Wise King', parallel to 'by putting Socrates to death' and 'by the burning of Pythagoras'; 'da morte' loses that the Jews did the killing *(meaning)*
- Rejected: pt-BR/ch001.md [3]–[31] — audit: the source's italic markers are all gone in pt-BR — the journal records this on purpose: the italics mark words the English translator added, and they are worked into the Portuguese syntax
- Rejected: pt-BR/translation-journal.md (Termos) — audit: 'fortaleza e paciência' ×0 in pt-BR — [25] has 'a fortaleza e a paciência', the same rendering with articles; the row is correct
- Rejected: pt-BR/ch001.md [17] — 'ninguém, absolutamente ninguém' looks like added emphasis — it renders 'no man whatsoever'; a defensible choice
- Rejected: pt-BR/ch001.md [23] — 'a great mind' rendered as 'uma grande alma' — 'grande alma' gives the sense of magnanimity, which is what the source means; a style choice
- Rejected: pt-BR/ch001.md [25] — 'sustentar a fome' could read as 'feed hunger' — 'sustentar' with the sense of withstanding is current usage, and the context ('suportar a sede') makes it clear
- Rejected: pt-BR/ch001.md [29] — 'parta sem sofrimento das tristes aflições' is ambiguous — the source 'depart without suffering out of the sad afflictions' is ambiguous in the same way

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de ch001.md [1]–[31], cotejada com a fonte, e revisão de book.json, diário e alertas da auditoria; nenhum novo defeito objetivo encontrado.
