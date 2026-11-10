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

## Status (2026-11-09)

The findings above have been worked through practice by practice. Each traditional text was copied word for word from a Brazilian source and that source was added to the practice's manifest. The sources are mostly Opus Dei's Brazilian *Devocionário*, with Brazilian dioceses, Canção Nova, Paulus's *Liturgia Diária das Horas* and misericordia.org.br. Texts with no Brazilian form were edited for grammar, register and spelling. No `la` or `en-US` text was changed.

Many of the "received forms" in the findings were misremembered by the model that wrote them. Where the corpus already matched its Brazilian source, the source wins.

Still open:
- Since resolved from Brazilian sources:
  - **Taken from the Brazilian Liturgy of the Hours** (`content/loth`): Ave Maris Stella, Alma Redemptoris Mater and all of Pange lingua ("Vamos todos louvar juntos").
  - **Litany of the Saints:** the Liturgy of the Hours text, with the old long form taken from the wording most of Lehmann's *Magnificat*, Keckeisen's *Missal Quotidiano* and a third text agree on.
  - **Three o'clock prayer:** the Brazilian *Diário*, as five sites print it.
  - **Sacred Heart offering:** "Ofereço-Vos, ó meu Deus…" from the Apostolado da Oração, as five sources print it.
  - **Trisagion, Paschal troparion and Axion estin:** from the Ukrainian Eparchy of Curitiba's *Divina Liturgia* (2008).
- Brazilian sources disagree on these, with no text most of them share:
  - **Adoro te:** we use Opus Dei Brazil's published text.
  - **Litany of the Saints:** the petitions for those in error and for our souls follow the *Missal Quotidiano*.
  - **Ave Verum:** still our own text.
  - **Jesus Prayer:** no Brazilian eparchy prints a text we could find.
- Sources that print an error are corrected against the Latin, and the correction is noted in the practice's `source`: the Opus Dei Athanasian Creed (vv. 5, 21, 29), "pensamentos" in the Confiteor, and "haveis prometido" in the Act of Hope. Small typo fixes were made against the source in the Opus Dei prayer cards, St Ambrose, Psalm 50 and the Via Sacra.
- The Requiem follows the Brazilian liturgical books, "Dai-lhes, Senhor, o repouso eterno e brilhe para eles a vossa luz". The Brazilian Missal in `content/missal` has this wording with "descanso"; the Brazilian Liturgy of the Hours in `content/loth` and Opus Dei have "repouso". The popular "luz perpétua" is the pre-conciliar wording. The Preces, the responsories and the Lux aeterna keep their own sourced forms.
- The Litany of the Sacred Heart, the Litany of the Holy Name and the Litany of the Precious Blood were checked line by line against 9–10 Brazilian texts each. Copies of the same text were counted as one source. Each line uses the wording most sources agree on, and the manifests name the sources. The Arquidiocese de Fortaleza, the Arquidiocese de Ribeirão Preto and the Diocese de Colatina print a different, newer translation of the Sacred Heart litany; we kept the widely printed traditional one.
- The English of some prayers is shorter than the received Brazilian texts: Leo XIII's prayer in the St Joseph novena, and the Act of Reparation.
