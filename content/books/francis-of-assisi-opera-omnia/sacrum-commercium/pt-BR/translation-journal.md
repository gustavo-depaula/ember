# Diário de tradução — O Sagrado Intercâmbio de São Francisco com a Senhora Pobreza (pt-BR)

Fonte: la/, *Sacrum commercium*, poliba.it "Fonti francescane" (Wayback Machine snapshot), transcrição de M. Mastrorilli do texto de *Fontes Franciscani* (1995).
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Sacrum commercium | Sagrado Intercâmbio | título do book.json; nota no prólogo |
| commercium (salutare) | intercâmbio | difere de *Vita prima* ("comércio"); ver Decisões |
| Prologus / Capitulum | Prólogo / Capítulo | |
| beatus Franciscus / sanctus Franciscus | bem-aventurado Francisco / São Francisco | como em *Vita prima* |
| domina Paupertas | Senhora Pobreza | maiúsculas, personificação |
| domina nostra (vocativo) | senhora nossa | evita confusão com "Nossa Senhora" |
| domina Persecutio | Senhora Perseguição | |
| Avaritia / Acidia | Avareza / Acídia | personificações; nota sobre *acídia* em cap-023 |
| Discretio / Providentia | Discrição / Providência | nomes que a Avareza assume |
| emula mea | minha rival | |
| fratres | irmãos | |
| Altissimus / Omnipotens | Altíssimo / Onipotente | |
| Dominus virtutum | Senhor das virtudes | mantém o jogo com a Pobreza "rainha das virtudes" |
| Rex glorie / Rex regum | Rei da glória / Rei dos reis | |
| regina virtutum | rainha das virtudes | |
| desponsatio | desposório | |
| signaculum / signare | selo / marcar | |
| conversatio | vida, conduta, modo de vida | conforme o contexto |
| religio (sancte religionis habitus) | religião | "hábito da santa religião" |
| claritas | claridade; "glória" em Sabedoria 8:10 | |
| milites | soldados | como *Vita prima* |
| Sunamitis | Sunamita | nota em cap-027 |
| claustrum | claustro | |
| scutella | escudela | |
| Sabaoth | Sabaoth | |
| Belial / Balaam ex Bosor | Belial / Balaão de Bosor | |

## Decisões

- Tratamento: a Pobreza e os irmãos se tratam respectivamente por *vós* (plural) e *tu* (singular); Deus é tratado por *vós*; Deus fala à Pobreza e a Adão por *tu*; no testamento de Cristo, *vós* no plural e *tu* onde a fonte tem singular (Mateus 5:40-41).
- Referências bíblicas: "cfr." → "cf."; nomes portugueses por extenso; capítulo:versículo com dois-pontos; versículos não consecutivos mantêm o ponto da fonte (Lucas 1:79.78). Salmos com a numeração da Vulgata, como na fonte. Livros com nome da Vulgata: 1Re → 1 Samuel, 3Re → 1 Reis, 4Re → 2 Reis, Par → Crônicas, Qo → Eclesiastes, Sir → Eclesiástico.
- Erros evidentes da transcrição corrigidos: "Ioa 29,3" → Jó 29:3 (cap-013); "Mat 112,45" → Mateus 12:45 (cap-018); "Sapo 2,1" → Sabedoria 2:1; parênteses abertos que faltavam; numeral "³" repetido em cap-029 → "⁸"; "indicia iustitie" (Salmo 118:106) traduzido como "juízos", conforme a citação.
- Aspas não fechadas na fonte foram fechadas onde termina a citação (cap-009 ¹³, cap-011 ⁵, cap-019 ², cap-020 ⁴, cap-024 ¹⁵, cap-026 ⁸, cap-027 ⁶, cap-028 ¹⁶). Discursos da Pobreza em “ ”, citações internas em ‘ ’; no terceiro nível (cap-010 ⁵, cap-022 ⁹), sem aspas, como na fonte.
- *commercium*: segue-se o título já fixado no book.json ("Intercâmbio"), também em cap-004 ¹¹; *Vita prima* usa "comércio" para o mesmo termo.
- *panis suriceus* (cap-031 ¹¹): sentido incerto; traduzido "pão de farelo", como nas traduções correntes, sem nota.
- *iungere matrimonium* (cap-024 ¹²) em sentido figurado: "contrair aliança".
- *Dolens dolebam* (cap-025, cap-026): "doía-me profundamente".
- Notas do tradutor: cap-001 (*commercium* e o *admirabile commercium* do Natal); cap-023 (acídia); cap-027 (*Sunamitis* / Sulamita); cap-032 (os eleitos preenchem as "ruínas" deixadas pelos anjos caídos, ideia de Santo Anselmo).

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Read all 32 files, source beside translation. Fixed the Sunamitis/Sulamitis note (cap-027) and two spellings (ameníssimo, amarguissimamente); the rest is faithful and complete.
- `pt-BR/cap-009.md` [2]: “num lugar amenissimo e belíssimo” → “num lugar ameníssimo e belíssimo” — Missing acute accent on the superlative 'ameníssimo'.
- `pt-BR/cap-003.md` [2]: “Chorava amarguíssimamente e dizia” → “Chorava amarguissimamente e dizia” — Adverbs in -mente drop the acute accent of the adjective (rápida → rapidamente), so the spelling is 'amarguissimamente'.
- `pt-BR/cap-027.md`: “*Nota do tradutor:* A Vulgata lê *Sunamitis*; as traduções modernas do Cântico dos Cânticos trazem “Sulamita”, nome dado à amada do poema.” → “*Nota do tradutor:* O texto latino lê *Sunamitis*; a Vulgata (Cântico dos Cânticos 6:12) e as traduções modernas trazem *Sulamitis*, “Sulamita”, nome dado à amada do poema.” — The Vulgate of Cant 6:12 reads 'Revertere, revertere, Sulamitis'. *Sunamitis* is the reading of this text, so the note attributes it to the wrong source. *(meaning)*
- Rejected: pt-BR/cap-028.md [2], cap-029.md [2], cap-032.md [2] — Unbalanced quotes: a second “ opens mid-speech without a closing one before it. — The source reopens the speech at the same point (¹¹, ⁷, ¹⁴) as a new section of one discourse. The translation follows it, and quote style is not normalized.
- Rejected: mechanical audit, parentheses — Parenthesis counts differ in 11 places. — The source has unopened parentheses ('cfr. Ps 73,12)' and similar), which the translation closes properly; the journal records this. In cap-025 ⁵ the source has a doubled '((', and in cap-027 ¹ '((ez'; both are normalized. No reference is lost.
- Rejected: pt-BR/cap-023.md [2] ⁵ — 'parum' rendered 'pouco a pouco'. — This reads the gradual engulfing that the context describes, and the sense is kept. A defensible choice.
- Rejected: pt-BR/cap-013.md [2] ⁴ — 'Erat in tempore illo' rendered 'Mesmo naquele tempo'. — 'Mesmo' makes explicit the concessive sense of the passage: even in the good time the devil, the world and the flesh were at work. Not a change of meaning.

### Round 2 (codex, full read)
Verdict: 4 meaning-level, 1 minor. Lidos integralmente os 32 arquivos, suas notas, book.json e diário; encontrados quatro defeitos de sentido e um de acentuação.
- `pt-BR/cap-001.md` [3]: “como luz da fé, à porta dos que entram” → “como luz para os que entram pela porta da fé” — Em «fidei portam intrantibus», a porta da fé é aquilo por onde se entra; não é uma porta pertencente aos que entram. *(meaning)*
- `pt-BR/cap-009.md` [2]: “foi o primeiro a imitar o transgressor” → “imitou o primeiro transgressor” — «Primum ... transgressorem» designa o primeiro transgressor, o tentador mencionado antes; não afirma que Adão foi o primeiro a imitá-lo. *(meaning)*
- `pt-BR/cap-010.md` [2]: “vai com ele outros dois” → “vai com ele outros dois mil” — «Alia duo» subentende milia: depois dos mil passos impostos, outros dois mil, não apenas dois passos. *(meaning)*
- `pt-BR/cap-014.md` [2]: “porem de algum modo o coração” → “pôrem de algum modo o coração” — O infinitivo pessoal de pôr conserva o acento circunflexo: pôrem.
- `pt-BR/cap-027.md`: “a Vulgata (Cântico dos Cânticos 6:12) e as traduções modernas trazem *Sulamitis*, “Sulamita”” → “a Vulgata (Cântico dos Cânticos 6:12) traz *Sulamitis*, “Sulamita”” — A correção anterior distinguiu Sunamitis de Sulamitis, mas atribuiu também às traduções modernas a forma latina Sulamitis. Retira-se essa generalização falsa. *(meaning)*

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of all 32 files, footnotes, book.json and journal against the Latin; the round 1-2 fixes hold and no further defects were found.
- Rejected: mechanical audit, Key Terms row — “latim” ×1 in source, “português” ×0 in pt-BR — These are the column headers of the Terms table (Latim | Português), not a term row.
- Rejected: pt-BR/cap-017.md [2] ³ — 'super iram' rendered 'sob a ira' — The source's reading of Psalm 34:20 is itself irregular. The rendering keeps the sense that they plotted deceit while speaking peaceably, so this is not an objective error.
- Rejected: pt-BR/cap-031.md [2] ²⁴ — 'sobria dormiens' (feminine, agreeing with Poverty) rendered as 'sono ... sóbrio' — Moving the adjective from the sleeper to the sleep is a defensible stylistic transfer, and the sense is unchanged.
- Rejected: book.json description.pt-BR — omits 'prologus et capitula XXXII' from the Latin description — The toc has a prologue and 31 chapters, so the Latin count is wrong. Leaving the count out avoids repeating that error.
