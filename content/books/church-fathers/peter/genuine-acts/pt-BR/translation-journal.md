# Diário de tradução — As Atas Genuínas (pt-BR)

Fonte: en-US/ (tradução de James B. H. Hawkins, Ante-Nicene Fathers, vol. 6, 1886; revista por Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| The Genuine Acts | As Atas Genuínas | "atas" no sentido das atas dos mártires |
| Peter of Alexandria | São Pedro de Alexandria | forma do autor no book.json, como em peter/fragments |
| Archbishop / pontiff / pontificate | arcebispo / pontífice / pontificado | sentido antigo: o bispo e o seu episcopado |
| priest | sacerdote | como em peter/fragments |
| elder (¶16) | ancião | |
| Levite | levita | o diácono |
| chair / throne / footstool | cátedra / trono / escabelo | |
| See | Sé | |
| tribunes | tribunos | |
| *omophorion* / *kolobion* | *omophorion* / *kolobion* | mantidos em itálico, com nota do tradutor |
| solidi | sólidos | moeda romana |
| martyr's palm / crown / laurel | palma / coroa / louro do mártir | |
| Judge of the contest | Juiz do combate | o agonoteta |
| virtue (¶23, a presença celeste) / miraculous virtues | virtude / virtudes milagrosas | mantido o sentido antigo de "poder" celeste e "milagre" |
| Mother of God and Ever-Virgin Mary | Mãe de Deus e sempre Virgem Maria | como em peter/fragments |
| the Word (Pessoa) | o Verbo | como em peter/fragments |
| consubstantial | consubstancial | |
| Godhead | divindade | |
| Meletius / Meletians / Lycopolis | Melécio / melecianos / Licópolis | |
| Arius | Ário | |
| Theonas / Mark the Evangelist / Anianus | Teonas / Marcos, o Evangelista / Aniano | |
| Achillas / Alexander | Áquilas / Alexandre | |
| Phileus, Hesychius, Theodorus | Fileas, Hesíquio, Teodoro | "Phileus" da fonte é Fileas de Tmuis |
| Dionysius / Sabellius / Heraclius / Demetrius / Origen | Dionísio / Sabélio / Héraclas / Demétrio / Orígenes | "Heraclius" da fonte é o bispo Héraclas |
| Diocletian / Maximian Galerius / Maximin / Constantinus Major | Diocleciano / Maximiano Galério / Maximino / Constantino, o Grande | |
| Simon / Philip / Belial / Judas | Simão / Filipe / Belial / Judas | |
| Gibeonites / Joshua / David | gabaonitas / Josué / Davi | |
| Bucolia / Pharos / Leucado | Bucólia / Faros / Leucado | |
| Phosphor | Fósforo | com nota do tradutor |

## Decisões

- Tratamento: o clero a Pedro e Pedro a São Marcos, ao menino da visão, aos tribunos individualmente e aos dois anciãos usam *tu*; Pedro ao clero, aos tribunos e aos dois anciãos juntos usa *vós*; as orações a Cristo (¶17, ¶23), com "You/Your" em maiúscula na fonte, usam *vós*.
- Erros tipográficos da edição inglesa traduzidos pelo sentido evidente: "bad" (had), "eiders" (elders), "ibis" (his), "Arias", "clement" (element), "tit" (fit), "begin" (begun), "very clear" (very dear), "failing" (falling), "right" (riot), "reigned not to bear" (lido como "feigned not to hear": "fingiu não ouvir").
- ¶16: as aspas da fonte estão desencontradas; a ordem de Pedro ao ancião foi fechada após "o que lhes foi ordenado", e só "Cessai de toda a vossa inquietação" ficou como recado direto aos tribunos, para manter "entregar-me a eles" coerente. As palavras finais de Pedro aos assassinos receberam aspas.
- ¶14: a citação de Atos 20:32 vem entre aspas simples na fonte, sem referência; passou a aspas “ ” e nenhuma referência foi acrescentada.
- ¶20: o verso de Virgílio traz *lames* na fonte, erro por *fames*; corrigido no texto, registrado na nota do tradutor.
- Notas do tradutor: [^1] Fósforo (¶3), a estrela da manhã; [^2] jogo de palavras entre Melécio e o grego *mélas*, "negro" (¶4); [^3] *omophorion* (¶18); [^4] fonte e tradução do verso de Virgílio (¶20); [^5] *kolobion* (¶21).
- Referências bíblicas mantidas no mesmo lugar da fonte, sem parênteses, como a fonte as dá.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 [1]-[24], the footnotes, the journal and book.json; no defects. The two Key Terms audit flags are false positives.
- Rejected: pt-BR/ch001.md [20] — Audit: emphasis markers differ (source 0, pt-BR 2) — The Virgil line is retained Latin, which the house style puts in italics.
- Rejected: pt-BR/ch001.md [18] — Audit: Key Terms 'Juiz do combate' ×0 in pt-BR — The text has 'Juiz todo-poderoso do combate' for 'Almighty Judge of the contest'. The term is there; only the adjective splits the match.
- Rejected: pt-BR/ch001.md [14], [17] — Audit: Key Terms 'o Verbo' ×0 for 'the word' ×2 — In ¶14, 'the word of His grace' (Acts 20:32) is not the divine Person, so 'palavra' is correct. In ¶17 the text has 'Verbo do Pai eterno', which matches the table.
- Rejected: pt-BR/ch001.md [18] — 'estendeu-o' commits 'it' to the omophorion rather than the neck — 'pescoço' and 'omophorion' are both masculine, so the Portuguese keeps the source's ambiguity.
- Rejected: pt-BR/ch001.md [8], [21] — Plural verbs with singular 'multidão'/'número' ('cercaram', 'perguntavam', 'seguiram') — This is agreement by sense (silepse), accepted in Portuguese, and it follows the source's plural construction.
- Rejected: pt-BR/ch001.md [17] — 'o santo São Marcos' is redundant — It mirrors the source's 'the holy St. Mark'.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos parágrafos [1]–[24], das cinco notas, do diário e de book.json: uma perda de sentido; os três apontamentos mecânicos são falsos positivos.
- `pt-BR/ch001.md` [21]: “passando por trás do Faros” → “subindo ao Faros pelo lado de trás” — “Scaling the Pharos from behind” indica uma subida pelo lado posterior; a tradução descreve apenas uma passagem por trás, omitindo a subida. *(meaning)*
- Rejected: pt-BR/ch001.md [20] — Diferença na quantidade de marcadores de ênfase. — O itálico marca o latim conservado, conforme a regra editorial; mantém-se a conclusão da rodada anterior.
- Rejected: pt-BR/ch001.md [14], [17], [18] — Ausência aparente dos termos “o Verbo” e “Juiz do combate”. — “Verbo do Pai eterno” e “Juiz todo-poderoso do combate” realizam os termos previstos. Em [14], “palavra da sua graça” não designa a Pessoa divina.
- Rejected: pt-BR/ch001.md [23] — “Relatá-lo em breve” poderia indicar tempo, enquanto “in brief” indica concisão. — “Em breve” também admite o sentido de resumidamente, defensável neste registro literário.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [20]-[22] and its footnotes: the round 2 fix in [21] is correct against the English source, and there are no new defects.
- Rejected: pt-BR/ch001.md [21] — The new 'subindo ao Faros pelo lado de trás' reads oddly for a party travelling by boat, and the older Latin text likely meant 'passing behind the Pharos'. — The canonical source is the English, and 'scaling the Pharos from behind' does mean climbing. The fix is faithful to it and keeps the rest of the sentence intact.
- Rejected: pt-BR/ch001.md [21] — Mixed concord: 'um grupo resoluto de senadores ... preparou ... colocaram-nas ... chegaram'. — This is agreement by sense with a collective noun once the verbs move away from it. It is acceptable in Portuguese and matches the plural in the source; round 1 rejected similar cases.
- Rejected: pt-BR/ch001.md [20] — Audit: emphasis markers differ (source 0, pt-BR 2). — The italics mark the retained Latin verse, as the house rules require; the same conclusion as rounds 1 and 2.
