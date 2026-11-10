
## Termos

| recuerdo / recordar | despertar | Sentido antigo de *recordar*; nota do tradutor em c4 ([^45]). |
| aspirar / aspiración | aspirar / aspiração | Aspiração do Espírito Santo (c4). |
| Verbo esposo | Verbo Esposo | |
| noticia | notícia | Termo técnico do autor (conhecimento infuso). |
| Vuestra Merced | Vossa Mercê | Tratamento de D.ª Ana de Peñalosa no prólogo. |
| a excusa del natural | às escondidas da natureza | c4, n. 12. |
| el natural | a natureza | c4 (n. 12); em c1, n. 27 e 30, fica “o natural”. |
| haces de ejércitos | esquadrões de exércitos | |
| Asuero / Ester | Assuero / Ester | |
| Boscán / Garcilaso | Boscán / Garcilaso de la Vega | Nomes mantidos. |

## Decisões

- Poema (canciones e c4): tratamento *tu* na apóstrofe à chama e ao Verbo, como o *tú* do original; maiúscula inicial em cada verso, como na fonte. “Solo moras” → “só moras”.
- c4: notas do tradutor [^45] (*recordar* = despertar, com o eco de *te acordaste* no n. 9) e [^46] (Jó 26:14 e 23:6 na Vulgata; *estila* = latim *stilla*). A última nota de Silverio em c4 é a 44.
- canciones: nota do tradutor [^6] (Boscán e as versões “ao divino” de Sebastián de Córdoba); o texto dos manuscritos na nota 5 fica em espanhol, como as lições das notas de canciones, c3, c4 e do prólogo (em c1 e c2 as lições vão traduzidas), e a tradução vai na nota do tradutor. prólogo: nota do tradutor [^12] (as “Canções que acima declaramos” são as do *Cântico espiritual*).
- c3, nota 191: “Eccli.. U, 26” lido como Eclesiástico 51:26 (“U” = “LI” do OCR). nota 215 “¿mor” = *amor*; nota 228 “fres” = *tres*; nota 195 “eí” = *el*; nota 171 “primera lectura” traduzido “primeira redação”.
- c4, correções de OCR: “parécete” = *parécele*; nota 21 “g el lujurioso” = *y el lujurioso*; nota 31 “XL1V” = 44; “n¿formas” = *ni formas*. Prólogo: nota 1 “hechas g comentadas” = *hechas y comentadas*; nota 11 “de la "f.” = *de la* ✝ (assinatura com a cruz); “viva|” = *vivo*; aspas soltas descartadas.
- c4, n. 5: *conocimiento trasero* → “conhecimento por detrás”. n. 17: “parecería que ello es, si lo dijese” traduzido literalmente (“pareceria que é isso”), sem acrescentar o sentido que a variante da nota 42 explicita.

## Review log

### Round 1 (claude, full read)
Verdict: 4 meaning-level, 10 minor. Full read of prólogo, canciones and c1–c4 against es-ES: fixed a wrong Bible reference (c3 n. 72), a translated variant reading (c3 [70]), a truncated manuscripts' note (canciones n. 5 and its translator's note), five orphan translator's notes, one misplaced marker, three journal errors and the pt-BR book.json description.
- `pt-BR/c3.md` [166]: “[^72]: João 1:12.” → “[^72]: 1 Pedro 1:12.” — The text says 'dice San Pedro' (the angels desire to look upon the Son of God): 1 Peter 1:12; source '1.». I, 12' is OCR for I Petr. I, 12, not John. *(meaning)*
- `pt-BR/c3.md` [70]: “ou com sons[^173]” → “ou com sentidos[^173]” — Source reads 'con sentidos y ruidos exteriores'; 'sonidos' is the Bg./P variant given in note 173, so the text translated the variant and made the note pointless. *(meaning)*
- `pt-BR/canciones.md` [11]: “llorando mi fortuna’.*”[^6]” → “llorando mi fortuna, me voy por los caminos que se ofrecen’, etc., en las cuales hay seis pies, y el cuarto suena con el primero, y el quinto con el segundo, y el sexto con el tercero.*”[^6]” — The manuscripts' note continues 'Me voy por los caminos que se ofrecen', etc., en las cuales hay seis pies, y el cuarto suena con el primero…'; OCR misplaced this ending into es-ES c1 [4] ('morMe ooy por los caminos…'), so the rhyme-scheme statement was lost. *(meaning)*
- `pt-BR/canciones.md`: “chorando a minha sorte’.”” → “chorando a minha sorte, vou pelos caminhos que se oferecem’ etc., nas quais há seis versos, e o quarto rima com o primeiro, o quinto com o segundo e o sexto com o terceiro.”” — Translator's note [^6] translates note 5; it must follow the completed note (rest of the quotation and the rhyme scheme). *(meaning)*
- `pt-BR/c2.md` [13]: “a erva com que vivamente” → “a erva[^120] com que vivamente” — Translator's note [^120] on 'erva' is defined but has no marker in the text.
- `pt-BR/c2.md` [27]: “como o cálculo que, diz São João” → “como o cálculo[^121] que, diz São João” — Translator's note [^121] on 'cálculo' is defined but has no marker.
- `pt-BR/c2.md` [40]: “*sicut tenebrae ejus, ita et lumen ejus*[^89]” → “*sicut tenebrae ejus, ita et lumen ejus*[^89][^122]” — Translator's note [^122] translating this Latin is defined but has no marker.
- `pt-BR/prologo.md` [5]: “nas Canções que acima declaramos tenhamos” → “nas Canções que acima declaramos[^12] tenhamos” — Translator's note [^12] on 'Canções que acima declaramos' is defined but has no marker.
- `pt-BR/c1.md` [29]: “o expia e paga[^56]” → “o expia[^56] e paga” — Source 'lo lasta[^56] y paga': the P variant 'gasta' replaces 'lasta', so the marker belongs after 'expia'.
- `pt-BR/translation-journal.md`: “nota 56 “XL1V” = 44” → “nota 31 “XL1V” = 44” — The 'XL1V. 10' reference is c4 note 31; c4 has no note 56.
- `pt-BR/translation-journal.md`: “fica em espanhol, como as demais lições” → “fica em espanhol, como as lições das notas de canciones, c3, c4 e do prólogo (em c1 e c2 as lições vão traduzidas)” — False claim: in c1 and c2 the manuscript variants are translated into Portuguese.
- `pt-BR/translation-journal.md`: “| el natural | a natureza | |” → “| el natural | a natureza | c4 (n. 12); em c1, n. 27 e 30, fica “o natural”. |” — c1 [38] and [42] render 'el natural' as 'o natural', contradicting the unqualified row.
- `book.json`: “segunda redação, revista e ampliada pelo Santo.” → “segunda redação, revista e ampliada pelo Santo. Texto crítico do P. Silverio de Santa Teresa, com as suas notas.” — es-ES and en-US descriptions end with the sentence on Silverio's critical text and notes; pt-BR drops it, though the notes are translated.
- NOT APPLIED (old text not found exactly once (0)): - `pt-BR/c2.md` [46]: “*laetitia*[^114]” → “*laetitia*[^114][^123]” — Translator's note [^123] translating the psalm verses is defined but has no marker.
- Rejected: pt-BR/c1.md [13], pt-BR/c3.md [9] — Audit 'repeated word' flags ('chama chama', 'uma uma') — Both mirror the source: 'la llama a la llama, viva' and 'cada una una luz'.
- Rejected: pt-BR/c1.md [38]; c3.md [21], [63] — Parentheses count differs from source — c1 [38] adds a defensible parenthesis around the St Paul aside; in c3 the source parentheses are OCR strays ('(¿quién', 'No (').
- Rejected: pt-BR/c1.md [4] — Source paragraph ends in garbage ('morMe ooy por los caminos…') — The translation correctly reads 'mortal'; the stray text belongs to canciones note 5, now completed there. The es-ES files still need the text moved back.
- Rejected: pt-BR/c2.md [111] — Footnote 65 gives Mateus 19:29 where the source reads XIX. 23 — Unmistakable OCR (9→3): the hundredfold promise is Mt 19:29.
- Rejected: pt-BR/c3.md [86] — 'tão mirífica e maravilhosamente' follows the Bg./P adverb instead of the source adjective 'miríficas' — Same sense; the source 'miríficas … maravillosamente' is itself a slip, and the change does not affect understanding.

### Round 2 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of the prólogo, the canciones and c1–c4 against the es-ES text, the journal and book.json; only defect: the missing [^123] marker in c2 [46], which round 1 failed to apply.
- `pt-BR/c2.md` [46]: “circumdedisti me laetitia*[^114]” → “circumdedisti me laetitia*[^114][^123]” — Translator's note [^123] (translation of the psalm verses and of Cant 2:16) is defined but has no marker in the text; round 1's fix was not applied because its old string did not match.
- Rejected: pt-BR/c3.md, pt-BR/c4.md footnotes — Scripture footnotes such as “2:14.”, “41:25.”, “44:10.” give no book name, while c1 and c2 do — They mirror the source, which leaves out the book when the text names it; each file is internally consistent.
- Rejected: pt-BR/c4.md [9] — “com a palavra do seu poder” for “con el verbo de su virtud”, possibly drawn toward the familiar Heb 1:3 wording — *Virtud* here means power and *verbo* means word; the sense is the same, so this is a defensible choice, not a defect.
- Rejected: pt-BR/c2.md [88] (n. 42) — The variant “tan mala vez ásperamente” is rendered as the calque “tão má vez asperamente” — It is a manuscript variant reported in a note; a literal rendering keeps the reading visible and misinforms no one about the main text.
- Rejected: pt-BR/c3.md [239] (n. 145) — “5:3” for the adjuration verse (Cant 2:7 / 3:5 / 8:4) — It follows the edition's “V, 3”; this is not an unmistakable OCR slip, and the source is not corrected.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of c2 [45]–[47] and the translator's notes [^120]–[^123]: the [^123] marker fix is correct, and no new defects were found.
- Rejected: pt-BR/c2.md [46] — Added marker [^123] after [^114] — Correct: [^123] translates exactly these psalm verses and Cant 2:16, and it now has a marker. Its facts check out: the psalm is Vulgate Ps 29, *Exaltabo te* is v. 2, *Convertisti … laetitia* is v. 12, and *Dilectus meus mihi et ego illi* is Cant 2:16.
- Rejected: pt-BR/c2.md [46] — Latin reads *planctum meum*, *gaudium*, *saccum*, *et*, *laetitia* and *ego illi*, where the source has 'nteam', 'guadium', 'sacatín', 'ct', 'laeütia' and 'Mi' — Unmistakable OCR slips, read correctly against the Vulgate.
- Rejected: pt-BR/c2.md [45] — 'seus seios acima do vinho' for the source's 'sus pedios sobre el vino' — 'pedios' is OCR for 'pechos' (Cant 1:3, *uberum tuorum super vinum*), so the rendering is correct.
- Rejected: pt-BR/c2.md [46] — Emphasis audit: source 0, pt-BR 10 — Italics mark the retained Latin, as the house rule requires.
