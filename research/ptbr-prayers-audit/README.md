# pt-BR prayer texts: translations where a received text exists

Started 2026-11-09, after the Alma de Cristo was found reading "Sangue de Cristo, embriagai-me". That text was our own word-for-word rendering of the Latin, added in March 2026 with no source. Brazilians pray "inebriai-me". It is fixed now, from Opus Dei's *Devocionário*.

**Rule:** a prayer with a traditional Brazilian text takes that text from a named source, word for word, and its manifest's `source` names it. We write a pt-BR text ourselves only when no Brazilian text exists, as for newly composed novena prayers.

## Method

Every pt-BR block of a prayer-form practice was read, together with the prayer, response and psalm blocks of the other practices: about 1,100 blocks in 7 slices. Each slice was read against the Latin and English and judged against the form Brazilians pray. Novena day texts (`data/days.json`) were not read. Findings are in `findings-*.md`, ranked from 1 (crude or wrong word) to 4 (awkward literalism).

The received forms quoted in the findings were recalled by a model, not taken from a source. They only point to where to look. A fix takes its text from a printed or official source and cites it.

## What the audit found

- **The pattern is broad.** About 30 practices have severity 1–2 findings. They are mostly the prayers people know by heart: Santo Anjo, the Acts of Contrition and Faith, Regina Caeli, Memorare, Requiem aeternam, Tantum ergo, Veni Creator, the Te Deum, the three o'clock prayer and the litanies.
- **A source is not enough when the source is not Brazilian.** Divinum Officium's Portuguese comes from Portugal, which gives "Unigénito", "omnipotente" and "aceites" in the Exsultet, the Gloria and the Te Deum. Some Brazilian prayer-book texts were also re-translated from English instead of copied.
- **Prayers copied straight from a Brazilian source are sound**: the Ave-Maria, Pai-Nosso, Salve Rainha, Fátima prayer and most *Devocionário* texts.

Worst, verified in the corpus:

| Practice | Text in the corpus | Problem |
|---|---|---|
| `litany-st-joseph` | "consolo dos desgraçados" | Reads as an insult; the received form is "consolo dos miseráveis" |
| `act-of-faith` | "três Pessoas igualmente distintas" | Should be "realmente distintas" |
| `guardian-angels-novena` | "se a mim confiou" | Reverses the meaning of the Santo Anjo |
| `night-prayer` | "Vegiái", an unrecognisable Angele Dei | Garbled text |
| `veni-creator-spiritus` | "os peitos que criastes" | Calque of *pectora*, reads as "breasts" |
| `psalm-50` | "Livrai-me do meu sangue derramado" | Reads comically; the verses are also misaligned |
| `thursday-eucharist` | "purpurinados" | Means "glittered" |
| `chaplet-precious-blood` | "precioso licor" | "Licor" reads as liqueur |
| `act-consecration-sacred-heart` | "chamei-os" | Past tense where the imperative "chamai-os" is needed; a paragraph is also missing |
| `pax-in-caelo` | the whole pt-BR text | It is in Spanish |
| `o-bona-crux` | "Santo Andrés" | Spanish form; Portuguese is "Santo André" |
| `act-contrition` | "merecia todo o meu amor" | Says "I deserved" instead of "You deserve" |

## Order of work

1. Fix the severity-1 items above.
2. Replace the short staples with the received text: Santo Anjo, both Acts of Contrition, Regina Caeli, Requiem aeternam, Memorare, Tantum ergo ("Tão sublime Sacramento"), Veni Creator, the three o'clock prayer and São Miguel.
3. Copy the litanies (Sacred Heart, Holy Name, Loreto, St Joseph, Saints, Precious Blood) whole from one Brazilian prayer book.
4. Respell the Portuguese-from-Portugal Divinum Officium texts in Brazilian norms, or replace them with the Brazilian Liturgia das Horas and Lecionário texts.
5. Fix the severity 3–4 grammar and register slips: *tu* mixed with *vós*, missing crases, "digneis" without "Vos".
