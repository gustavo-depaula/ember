# Diário de tradução — A Ressurreição dos Mortos (pt-BR)

Fonte: en-US/, tradução de B. P. Pratten (Ante-Nicene Fathers, vol. 2, 1885), revista por Kevin Knight para o New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| The Resurrection of the Dead | A Ressurreição dos Mortos | título do *De resurrectione mortuorum* |
| Athenagoras | Atenágoras | sem “Santo”, como em *Petição em Favor dos Cristãos* |
| resurrection / rise again | ressurreição / ressuscitar | |
| in defence of the truth / concerning the truth | em defesa da verdade / a respeito da verdade | ὑπὲρ / περὶ τῆς ἀληθείας; a distinção estrutura todo o tratado e se mantém fixa |
| discourse, argument | discurso, argumento, argumentação | |
| disbelief / disbelievers | incredulidade / incrédulos | |
| doubt / doubters | dúvida / os que duvidam | |
| continuance / continue | permanência / permanecer | διαμονή; mantido de modo constante (“permanência perpétua”, “permanência com imortalidade”) |
| perpetual duration | duração perpétua | |
| dissolution / dissolved | dissolução / dissolvido | |
| Maker / Creator | Criador | como na *Petição*; “Author” → Autor |
| fashioned | plasmou | |
| the Just Being | o Justo | |
| Spiritual natures (νοηταὶ φύσεις) | naturezas espirituais (*νοηταὶ φύσεις*) | grego mantido em itálico |
| understanding / reason / rational judgment | entendimento / razão / juízo racional | |
| judgment (divine) | juízo | “just/righteous judgment” → justo juízo |
| providence | providência | minúscula, como na fonte |
| superintendence (of God) | governo (de Deus) | “divine superintendence” → governo divino |
| rectitude | retidão | |
| equity | equidade | |
| end / final cause | fim / causa final | |
| reward / punishment / recompense | recompensa / castigo / retribuição | “recompense” abrange prêmio e pena, por isso “retribuição” |
| nourishment / nutrition | nutrição; alimento (food) | |
| digestion / change | digestão / transformação | |
| humours | humores | termo da medicina antiga |
| brutes | brutos | como na *Petição* |
| immortals | os imortais | seres superiores (anjos), sem maiúscula |
| corruption / incorruption | corrupção / incorrupção | |
| Him who is | *Aquele que é* | título divino (Êxodo 3:14), em itálico como na fonte |
| Median feast | banquete medo | nota do tradutor |
| banquet of Thyestes | banquete de Tiestes | cf. “banquetes tiesteus” na *Petição* |
| wrong / injustice | agravo / injustiça | “suffer wrong” → sofrer agravo |

## Decisões

- Pronomes de Deus em minúscula (ele, dele), títulos em maiúscula, como na *Petição*.
- Títulos de capítulo em caixa de frase. O ponto final do título do cap. 1 foi mantido, como na fonte. O erro tipográfico “/rom” do cap. 12 foi traduzido como “a partir do”.
- “[well and good]” (cap. 2), acréscimo do editor entre colchetes, foi mantido como “[muito bem]”. Para que a frase se sustente em português, a condicional inglesa foi desdobrada (“se é assim, [muito bem]”).
- Os períodos muito longos de Pratten foram divididos em frases menores, sem perda de oração nem mudança de ordem. As subordinadas encaixadas foram desdobradas em frases independentes com conectivos (“Se é assim”, “Por isso”, “Daí se seguem”). Os parágrafos continuam correspondendo um a um aos da fonte.
- “safety” (cap. 11, σωτηρία) → “segurança”, distinto de “salvation” → “salvação” no mesmo capítulo, seguindo a distinção do inglês.
- “vanity” (cap. 15, no sentido de vacuidade, não de presunção) → “tudo o que é vão”, para evitar a leitura moderna de “vaidade”.
- “the plicatures of the stomach” → “as pregas do estômago”.
- O trecho “impossible with men is possible with God” (cap. 9) é alusão a Lucas 18:27, sem referência na fonte. Nenhuma referência foi acrescentada. O mesmo vale para “Comamos e bebamos, porque amanhã morreremos” (cap. 19) e para “receba o que fez por meio do corpo” (cap. 18).
- Cap. 18: a referência “1 Corinthians 15:54”, solta no texto da fonte, foi posta entre parênteses. “this corruptible” → “isto que é corruptível”, sem acrescentar “corpo”, para seguir a redação da fonte.
- Cap. 19: “the moral nature” foi mantido como “a natureza moral”, embora o contexto (“a natureza mortal não basta”) sugira erro por “mortal”.
- Cap. 22: “according to analogy” → “segundo a proporção” (igualdade proporcional, no sentido aristotélico).
- Cap. 23: os mandamentos citados conservam o tratamento por *tu* da fonte (“Honra teu pai e tua mãe”, “Não cometerás adultério”).
- Notas do tradutor: [^1] no cap. 4, sobre o banquete medo (Heródoto 1.119, Astíages e Hárpago); [^2] no cap. 16, sobre o Sono como irmão da Morte (Hesíodo, Homero), que esclarece a ressalva sobre os “mesmos antepassados”. A fonte não tem notas próprias, e nenhuma nota foi acrescentada nos caps. 17–25.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 [1]–[51], the footnotes, the journal and book.json: completeness, fidelity, terms and format are sound, the two audit flags are justified, and no fixes are needed.
- Rejected: pt-BR/ch001.md [21] — Mechanical audit: emphasis markers differ (source 0, pt-BR 2). — The two markers italicize the retained Greek *νοηταὶ φύσεις*, as the house rule and the Key Terms table require.
- Rejected: pt-BR/ch001.md [37] — Mechanical audit: parentheses differ (source 6, pt-BR 5). — The source parentheticals on 'in this life' and 'after death' became the sentences 'Não nesta vida, pois…' and 'Nem depois da morte, pois…', with no content lost. A pair was added around the loose reference '1 Coríntios 15:54', as the journal records.
- Rejected: pt-BR/ch001.md [13] — 'Quando é a força mais fraca, porém, facilmente a destrói' might misrender 'but easily destroys that which is overcome by it'. — It says the same thing: the alien matter destroys the weaker power that it overcomes. The rendering is an acceptable expansion of the sense.
- Rejected: pt-BR/ch001.md [25] — The purpose clauses 'so that the soul may exist… and the body be moved' became indicative sentences. — They describe the same functions of soul and body under perpetual existence, and the reader is not misinformed. This is a style choice.
- Rejected: pt-BR/ch001.md [15] — The parenthetical '(let it be so called…)' was moved after the sentence. — Its referent, 'a nutrição', is still the subject of the preceding sentence, so the remark stays attached to the right word.
- Rejected: pt-BR/ch001.md — footnotes — The citations Heródoto 1.119, *Teogonia* 211-212 and *Ilíada* 14.231 needed checking. — All three are correct: Astíages and Hárpago's son; Night bearing Death and Sleep; Sleep called the brother of Death.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos parágrafos [1]–[51], das notas, do diário e de book.json: um defeito de sentido; confirmadas as justificativas anteriores para os dois alertas mecânicos.
- `pt-BR/ch001.md` [11]: “outra durante a segunda transformação, e a digestão que se dá no fígado é separada” → “outra é separada durante a segunda transformação e a digestão que se dá no fígado” — O sujeito de “is separated and passes” é “some”, outra parte do alimento. É essa parte que se separa durante a digestão no fígado; a tradução faz da própria digestão aquilo que se separa e se transforma. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [10]–[12] and the footnotes: the previous round's fix to [11] is correct and the shown paragraphs have no defects.
- Rejected: pt-BR/ch001.md [11] — After the fix, the chain “durante a segunda transformação e a digestão que se dá no fígado e passa a outra coisa” might read as if “a digestão” were the subject of “passa”. — “passa” agrees with “outra”, the subject of “é separada”. The two complements of “durante” are joined by the first “e” and the predicate by the second, which matches the structure of the source. This is not a grammar defect.
