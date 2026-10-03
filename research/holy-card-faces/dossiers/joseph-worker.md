# St. Joseph the Worker (1 May)

A second card for St. Joseph, `joseph_worker`, for the memorial of 1 May (`sanctorale.05-01`). The `joseph` card keeps 19 March. The same man appears on both: the face is taken from `joseph.png` as it is now, after its face edit, not from the recurring-figures line. Card file: `content/practices/saint-of-the-day/data/holy-cards/joseph_worker.json`.

## The feast

- **Instituted by Pius XII on 1 May 1955**, in St. Peter's Square, speaking to the ACLI (Associazioni Cristiane Lavoratori Italiani) on the tenth anniversary of their first audience: "amiamo di annunziarvi la Nostra determinazione d'istituire — come di fatto istituiamo — la festa liturgica di S. Giuseppe artigiano, assegnando ad essa precisamente il giorno 1° maggio. […] l'umile artigiano di Nazareth non solo impersona presso Dio e la S. Chiesa la dignità del lavoratore del braccio, ma è anche sempre il provvido custode vostro e delle vostre famiglie." He chose the date of the workers' day so that it would receive "il crisma cristiano". (Discorsi e Radiomessaggi XVII, pp. 71–76.) https://www.vatican.va/content/pius-xii/it/speeches/1955/documents/hf_p-xii_spe_19550501_san-giuseppe.html
- **Our formulary** says the same: "In 1955 Pius XII instituted this liturgical memorial in the setting of the feast of workers, celebrated universally on the first of May", and grounds it in "the son of the carpenter" (Mt 13:55) (`content/of/formularies/sanctoral/05-01.json`, `description`).
- **Rank, 1955–1969.** The 1960 calendar has "St. Joseph the Workman, Spouse of the Blessed Virgin Mary, Confessor, I class" on 1 May, with Sts. Philip and James moved to 11 May (Wikipedia, General Roman Calendar of 1960). The Divinum Officium data agree: `content/do/web/www/missa/Latin/Sancti/05-01r.txt` is "S. Joseph Opificis", "Duplex I classis". The new feast took the place of the Solemnity of St. Joseph, Spouse of the BVM and Patron of the Universal Church, kept in Eastertide with an octave, on "the Wednesday preceding the Second Sunday after Easter" (see Uncertain below) (Wikipedia, Saint Joseph's Day). https://en.wikipedia.org/wiki/General_Roman_Calendar_of_1960 · https://en.wikipedia.org/wiki/Saint_Joseph%27s_Day
- **Since 1969**: "reduced to an optional Memorial" (Wikipedia, Saint Joseph's Day). Our calendar files (`content/of/calendar/sanctoral.json`, `content/of-data/calendar/sanctorale/05-01.json`) give it as `memorial`.
- **Pictorial Lives**: the book's 1 May chapter is Sts. Philip and James (`may-01-sts-philip-and-james`); it predates 1955 and has no chapter for this feast. So the card has no `lifeChapter`.

## Iconography

- **Attributes**: "a staff with flowers and/or a dove at its top … Alternatively, a lily stalk", and carpenter's tools; Joseph "planing down a piece of wood" (Marten de Vos). After 1955 "images developed of his teaching Jesus carpentry" (Christian Iconography, St. Joseph). https://www.christianiconography.info/joseph.html
- **The workshop with the Child**: Georges de La Tour, *Saint Joseph the Carpenter* (c. 1642, Louvre): "Joseph drills a piece of wood with an auger" while the young Jesus holds the candle (Wikipedia; Britannica). Gerrit van Honthorst, *Childhood of Christ*: in the "carpenter's workshop" Joseph "works diligently in the presence of the young Jesus, who leans on the table while holding a candle" (Our Sunday Visitor). https://en.wikipedia.org/wiki/Joseph_the_Carpenter · https://www.oursundayvisitor.com/honoring-st-joseph-the-worker-through-art/
- **Old or young**: "A common approach previously had been to follow the Protevangelium in making him an old man – balding, graying"; later images give him "a full head of dark hair", but "this is by no means a consistent pattern in any period" (Christian Iconography; quoted in `dossiers/apostles.md`).

## Keeping it apart from `holy_family`

`holy_family` is already a workshop scene: a dark-haired, fortyish Joseph planing at the left, the boy Jesus of about seven carrying a plank in the centre, Our Lady spinning at the right, a doorway onto Nazareth, late-afternoon light. This card differs in its man, its moment and its composition. Joseph, older and balding, fills the card as its subject. He bores a beam with a hand auger, after La Tour. There are only two figures: Joseph and the Child of about five, who steadies the beam. Our Lady is absent, there is no doorway, the light is morning light from a small window, and a lily stands in a jar on the sill.

## The face

`content/saints/joseph.png` (the edited card, 2026-09-29; `meta.face`: "An older man around 60, balding with a high forehead and short silver-grey hair at the sides, a full neat rounded silver-grey beard, a tender fatherly smile toward the Child"). Looked at closely, the face has:

- a long oval face, head bowed in three-quarter view toward his right (the viewer's left), looking down at the Child;
- a high, domed, balding forehead with a few thin strands on top;
- thick, wavy silver-grey hair at the temples and back, curling over the ears to the nape;
- a long, straight nose with a softly rounded tip;
- heavy-lidded, gentle, lowered eyes under softly arched grey brows;
- lean cheeks over moderate cheekbones;
- a full, neat, rounded silver-grey beard and moustache covering the jaw;
- a small, tender closed-mouth smile.

On that card he wears an ochre-orange tunic with a gold-trimmed neckline under a blue mantle with a gold border, with a lily stalk. The new card keeps those colours so he reads as the same man.

**This departs from `batches/recurring-figures.md`.** Its St. Joseph line (forty, dark curly hair, green tunic, ochre mantle) is the Joseph of the scene cards (`nativity_christ`, `epiphany`, `holy_family`). The task asked that he match his own card, and his own card is older. The two Josephs already differ in the set. This card follows `joseph`, as Helena's and Simon Stock's own cards follow their recurring lines.

## Proposed generation

```sh
research/holy-card-faces/new-card.sh joseph_worker J "St. Joseph the Worker in the carpenter's shop at Nazareth, in soft morning light from a small window, the whole scene kept inside the arched window. Joseph, half-length to three-quarter length and the main figure, stands at a sturdy wooden workbench in an ochre-orange tunic with a gold-trimmed neckline, its sleeves rolled to the forearms, a plain leather apron over it, and a blue mantle with a gold border laid over the end of the bench. With both hands he bores a hole in a squared beam with a T-handled hand auger, his head bowed over the work and turned toward the Child, his gold dotted-ring halo behind his head. At the end of the beam the Child Jesus, about five, in a simple white tunic with a small plain gold halo, kneels on a low stool and steadies the beam with both small hands, looking up at Joseph. Curled wood shavings on the bench and the floor. On the stone wall behind hang a saw, a carpenter's square, a mallet and a row of chisels; on the window sill a clay jar holding a tall white lily; through the window, green hills of Galilee. Only these two figures, no doorway, no other people. Keep the bench, the beam, the stool and the shavings inside the arched window, ending above the bottom vine band." "St. Joseph as an older man of about sixty with a LONG OVAL face: a high, domed, balding forehead with a few thin strands on top; thick, wavy silver-grey hair at the temples and back, curling over the ears to the nape; a long, straight nose with a softly rounded tip; heavy-lidded, gentle eyes lowered toward the Child under softly arched grey brows; lean cheeks over moderate cheekbones; a full, neat, ROUNDED silver-grey beard and moustache covering the jaw; a small, tender closed-mouth smile; the head bowed in three-quarter view. NOT dark-haired, NOT a man of forty, NOT a long white flowing beard. The Child Jesus: a softly rounded face with full rosy cheeks, a high rounded forehead, a small button nose, large clear brown eyes, a small rosy mouth, soft golden-brown curls to the ears; an eager, trusting look up at Joseph." anne jerome
```

**Reference cards: `anne` and `jerome`**, both unedited originals at `4f53dc95b`. `anne` gives an elder bent tenderly over a child in a shared task. `jerome` gives a man absorbed in the work of his hands at a bench, with the tools of his trade. **Do not pass `joseph` or `holy_family` as references.**

- `new-card.sh` takes each reference from `4f53dc95b` when it exists there. For `joseph` that is the original, unedited card, with the dark curly-haired stock face. It would pull the face away from the edited one.
- The script's prompt tells the model to make the face "a different person from every face on the attached cards".
- `holy_family` (not in `4f53dc95b`, so taken from HEAD) shows the dark-haired Joseph in the same workshop, the look-alike this card has to avoid.

The words of the face line are therefore the only thing that ties this face to `joseph.png`. Check the draft against `content/saints/joseph.png` side by side. If he drifts, either:

- redo the face with `edit-face.sh` from the draft, using the same face line and a recorded base, or
- add a "same man as the attached card" mode to `new-card.sh` that takes a HEAD image and drops the "different person" clause for it. The script cannot do this today.

## Card text

- **Name**: "St. Joseph the Worker" / "São José Operário" (the formulary's pt-BR title; en-US capitalised as the set does).
- **Shelf**: `patriarchs`, as `joseph`; the shelves README names Joseph there, and his second day goes with him as the Apostles' second days go with them. `several`: not set (one person; `joseph` doesn't set it either).
- **patronOf**: "Patron of workers" / "Padroeiro dos trabalhadores". Basis: Pius XII calls the artisan of Nazareth "il provvido custode vostro" to the workers; the feast exists for that patronage.
- **prayerExcerpt**: the entrance antiphon of the day (Ps 128:1-2), its second half, verbatim from our formulary in both languages: "By the labor of your hands you shall eat; blessed are you, and blessed will you be." / "Do trabalho de tuas mãos hás de viver, serás feliz, tudo irá bem." The lines are joined, the closing "alleluia" is dropped and a full stop is added. It is the formulary's text, so no copyright question arises. No other card uses it (checked by grep). The collect ("the law of work… by the example of Saint Joseph and under his patronage") was the other candidate, but it is too long for the card.
  - **Considered and not used**: St. Pius X's prayer to St. Joseph, model of workers ("O Glorious St. Joseph, model of all those who are devoted to labor…"). It is widely reprinted, but I found no primary source to quote it from, so the formulary text is safer.
- **related**: the St. Joseph novena (whose day 5 is "Joseph the Worker" / "José Operário", `content/practices/st-joseph-novena/data/days.json`), the Litany of St. Joseph (our own "occasions" chapter names 1 May as a time for it), the prayer and Memorare to St. Joseph, the Offering of Works (`practice/offering-of-works`: the morning offering of the day's work), the Wednesday devotion, `collection/dies-wednesday`, and the cards `joseph` and `holy_family`. Every ref was checked to exist under `content/`. Not linked:
  - the Mass-time prayers, the little offices and the *Te Ioseph* hymn, which belong to the 19 March card;
  - *Quamquam pluries* and *Laborem exercens*, which sit inside `book/papal-magisterium` and cannot be linked individually.

## Uncertain

- **The day of the suppressed Solemnity of St. Joseph.** Wikipedia gives it as "the Wednesday preceding the Second Sunday after Easter". By the older count, where Low Sunday is the first Sunday after Easter, this is the Wednesday of the second week after Easter. I didn't check it against a pre-1955 Missal.
- **The rank in our calendar.** Our calendar says `memorial`, while the 1969 calendar makes it optional (Wikipedia). Left as it is: the card doesn't show the rank.
- **The Child's age** (five) is an artistic choice: younger than the seven of `holy_family`, older than the "about three" of `holy_name_jesus`.
- **No art yet.** The card JSON is drafted, but `content/saints/joseph_worker.png` doesn't exist. Generate, review and copy the art before shipping, and tick a catalog line if one is added: `docs/plans/holy-cards-catalog.md` has no entry for this feast.
