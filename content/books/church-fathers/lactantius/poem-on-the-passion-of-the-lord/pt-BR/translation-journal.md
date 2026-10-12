# Translation Journal — A Poem on the Passion of the Lord / Poema sobre a Paixão do Senhor (pt-BR)

Source: en-US (William Fletcher, Ante-Nicene Fathers, Vol. 7, via New Advent). The book has no Latin directory.
Target: pt-BR

Sibling precedent: `lactantius/phoenix` (same translator, same volume). Author form "Lactâncio"; the attribution line follows its "atribuído a Lactâncio". Like the Phoenix, the poem is one unbroken prose paragraph, kept as one.

## Key Terms

| English | Portuguese | Notes |
|---|---|---|
| Lactantius | Lactâncio | as in `phoenix` and `manner-in-which-the-persecutors-died` |
| you (the passer-by) | tu | Christ addresses a single reader throughout |
| safety (image of safety; watch over your own safety) | salvação | "you will be safe" → "estarás seguro" |
| atonement | expiação | |
| redemption | redenção | |
| banner of God | estandarte de Deus | |
| sign of fate | sinal do destino | |
| stall | estrebaria | |
| Pharian regions | regiões de Faros | Egypt, by the Pharos of Alexandria; kept literal, no note, as `phoenix` kept "ave de Fásis" |
| Judæa | Judeia | |
| Pilate | Pilatos | |
| the wood of the cross | o lenho da cruz | |
| nails / wound in my side | cravos / chaga do meu lado | |
| labours | trabalhos | |
| palm (of victory) | palma | |
| fates of death | fados da morte | |

## Translation Decisions

- Title rendered "Poema sobre a Paixão do Senhor", without the English indefinite article, in both the heading and `book.json`.
- No footnotes in the source; none added.
- Source slip, mirrored in en-US and not carried into pt-BR: "anything like my sufferings)" has a closing parenthesis with no opening one. Whether the printed edition parenthesized the clause from "if in your mind" could not be checked, so en-US is left as it is; the pt-BR runs the clause without parentheses, like its neighbouring "if" clauses.
- "my head drained with cruel thorns, and pouring down like rain" — the head is what pours, so "derramando" agrees with "cabeça", not with the thorns.
- "healthful admonitions … wholesome teaching" → "advertências salutares … ensinamento saudável", to avoid repeating "salutar".

## Review log

### Round 1

Focus: completeness, paragraph by paragraph (source en-US).

Verdict: clean. No defects; no changes to chapter files or `book.json`.

Considered and rejected:
- "sign of fate" ×1 vs "sinal do destino" ×0 (audit flag). The pt-BR reads "o sinal memorável do destino"; the adjective sits between the words, so the Key Terms row holds.
- "it shall reign with me" → "ela reinará comigo". The English "it" is ambiguous (soul or body); "ela" takes "alma", the subject of the closing clauses. Defensible, not a defect.
- "the immense cross pressing my shoulders" → "que oprimia". Imperfect in a relative clause; same sense.

Evidence: `ember-translation-evidence/church-fathers__lactantius__poem-on-the-passion-of-the-lord/review-1.md`

### Round 2

Focus: clause-by-clause bilingual fidelity read (source en-US).

Verdict: 1 defect, fixed.

Fixed:
- ch001, closing sentences: "deixado teu corpo segundo os fados da morte" → "deixado teu corpo após os fados da morte". Source "your body being left after the fates of death" is temporal (the body left behind once death has come); "segundo" says "according to".

Considered and rejected:
- "the insults and strivings of the cruel multitude" → "as investidas". The crowd's strivings against Christ; "investidas" (assaults, onslaughts) carries that sense. Style choice.
- "shields against the snares of an enemy" → "do inimigo". The definite article names the same adversary the indefinite one points to in a devotional text; same referent, no change of sense.
- "sign of fate" audit flag: already settled in Round 1 ("o sinal memorável do destino").

Evidence: `ember-translation-evidence/church-fathers__lactantius__poem-on-the-passion-of-the-lord/review-2.md`

### Round 3

Focus: source-blind cold read of all pt-BR, followed by source verification and a spelling, diacritics, crase, hyphenation and punctuation sweep (source en-US).

Verdict: clean. No objective defects; no changes to chapter files, Key Terms or journal claims.

Considered and rejected (ch001, block [3]):
- "Até que o grande favor de Deus chame de volta tua alma feliz às regiões celestes, deixado teu corpo após os fados da morte." The detached temporal clause initially looked incomplete. Source: "Until the great favour of God shall recall your happy soul to the heavenly regions, your body being left after the fates of death." It preserves the source's sentence boundary and continues the preceding promise of sustenance; the absolute participial clause agrees with "corpo". No correction warranted.
- "rega-a com lágrimas que brotam". Source: "stooping to the earth, which is wet with innocent blood, sprinkle it with rising tears". The feminine pronoun refers to "terra", the nearby feminine noun, not to "lenho"; the antecedent is resolvable.
- "sign of fate" audit flag. Source: "a memorable sign of fate"; pt-BR: "o sinal memorável do destino". The intervening adjective explains the missing exact-string match; the Key Terms row remains accurate, as established in earlier rounds.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__lactantius__poem-on-the-passion-of-the-lord/review-3.md`

### Round 4

Focus: function words, headings, and forced commitments (source en-US).

Verdict: clean. No defects; no changes to chapter files, `book.json`, Key Terms or journal claims.

Considered and rejected:
- "a rest to you, the right way, … and a memorable sign of fate" → "o descanso, o caminho reto, … e o sinal memorável do destino". The English mixes "a" and "the" in one series of titles; the Latin behind it has no articles, and a single definite article across the series is idiomatic. Style, not a defect.
- Reader's gender ("if you yourself wish", "aroused by which", "enticed by empty hope") → "tu mesmo", "despertado", "seduzido". The addressee is the generic passer-by; the generic masculine is applied consistently.
- "shields against the snares of an enemy, aroused by which you will be safe" → "despertado por elas". "elas" takes "memórias" (the subject of the sentence and the incitements), not "ciladas", as in the source.
- "see the blood streaming from it" → "que dela jorra": "dela" = "chaga", as in the source.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__lactantius__poem-on-the-passion-of-the-lord/review-4.md`
