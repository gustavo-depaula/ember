# Batch 55: the novenas' missing cards, and St. Raphael

Novenas give the card they are prayed to (`holyCard` in the manifest, on branch `holy-cards-engine`). Of the 93 practices with a `program`, 65 name a card there. This batch draws the subjects of the others that have no card yet, and St. Raphael for the Holy Archangels novena. That makes nine cards, so there is no batch 56: `raphael_archangel`, `divine_mercy`, `holy_face`, `miraculous_medal`, `perpetual_help`, `undoer_of_knots`, `louis_zelie_martin`, `gemma_galgani`, `gerard_majella`.

The card data is in `../batches/batch-55.json`. `../consult/batch-55/check.py` checks that:
- each excerpt is verbatim in the file it cites, in both languages;
- each of our own renderings has its original wording in the saved source (Irenaeus's Latin via Newman, Zélie's French, Gerard's Italian);
- each catalogMatch hits exactly one line of the catalog, and that line is unticked;
- no id is already in `content/saints/` or in another batch;
- every ref is an existing card.

Consulted material is in `../consult/batch-55/`: Commons pictures (`*.jpg`/`*.png` with `*.meta.json`), saved web sources (`sources.txt`, fetched by `fetch.py`), the 1913 English Life of Gemma (`germanus-life-en.txt`) and the Tours facsimile (`sainte-face-tours.jpg`).

## Novena → card

The ids for wiring each manifest's `holyCard`. "New" cards are in this batch.

| Novena practice | Card | Status |
|---|---|---|
| `holy-archangels-novena` | `michael_archangel`, `gabriel_archangel`, `raphael_archangel` | add Raphael (new) to the existing list |
| `christ-the-king-novena` | `christ_king` | exists |
| `corpus-christi-novena` | `corpus_christi` | exists |
| `divine-mercy-novena` | `divine_mercy` | new |
| `first-friday-devotion` | `sacred_heart` | exists |
| `guadalupe-novena` | `guadalupe` | exists |
| `holy-face-novena` | `holy_face` | new |
| `holy-trinity-novena` | `trinity` | exists |
| `immaculate-heart-novena` | `immaculate_heart` | exists |
| `miraculous-medal-novena` | `miraculous_medal` | new |
| `mount-carmel-novena` | `mount_carmel` | exists |
| `novena-holy-spirit` | `pentecost` | exists |
| `triduum-holy-spirit` | `pentecost` | exists |
| `novena-sacred-heart` | `sacred_heart` | exists |
| `our-lady-of-lourdes-novena` | `lourdes` | exists |
| `our-lady-of-the-rosary-novena` | `our_lady_rosary` | exists |
| `rosary-54-day-novena` | `our_lady_rosary` | exists |
| `perpetual-help-novena` | `perpetual_help` | new |
| `seven-sorrows-novena` | `our_lady_sorrows` | exists |
| `ss-louis-zelie-martin-novena` | `louis_zelie_martin` | new |
| `st-gemma-galgani-novena` | `gemma_galgani` | new |
| `st-gerard-majella-novena` | `gerard_majella` | new |
| `st-peter-of-alcantara-novena` | `peter_alcantara` | researched in batch 37, not drawn yet |
| `undoer-of-knots-novena` | `undoer_of_knots` | new |
| `any-marian-feast-novena` | — | generic, no card |
| `any-saint-novena` | — | generic, no card |
| `surrender-novena` | — | no card. It is prayed to Jesus with no particular image, in words given to the Servant of God Fr. Dolindo Ruotolo, who is not canonized. `sacred_heart` would be the nearest card if one is wanted. |
| `catechetical-formation`, `compendium` | — | study programs, not novenas |

**Two notes.** The Holy Spirit novena and triduum map to `pentecost`, whose card shows the Spirit's descent; the Holy Spirit has no card of its own. The Nine First Fridays are the Sacred Heart's promise to St. Margaret Mary, so they give `sacred_heart`.

## Dates, names, initials

- **Feasts.** Raphael 24 Oct: his own Mass in the traditional Missal (`content/do/.../Sancti/10-24.txt`). Our Lady of Perpetual Help 27 Jun: fixed by Pius IX (Wikipedia). The Miraculous Medal 27 Nov: approved by Leo XIII in 1894 (Wikipedia). Louis and Zélie 12 Jul: their wedding anniversary (fr.wikipedia). Gemma 11 Apr: her death, as in the Roman Martyrology; it.wikipedia gives 16 May for the Passionists and Lucca. Gerard 16 Oct: his death (Wikipedia).
- None of these is in `content/of-data/calendar`, and no OF formulary in the repo names them, so there is no `proper`.
- **No `feast`** on `divine_mercy` (the Second Sunday of Easter, which moves), `holy_face` (a devotion) or `undoer_of_knots` (a devotion). As with batch 17's moveable cards, they wait until `feast` is optional in the app. Wikipedia says Pius XII made Shrove Tuesday the feast of the Holy Face in 1958. I could not confirm that, so the card claims no date.
- **Initials.** M for the three titles of Our Lady, following batch 17. R, D, H, L, G, G for the rest.
- **pt-BR names.** These follow the novenas' own names: "Nossa Senhora da Medalha Milagrosa" (in Brazil also "Nossa Senhora das Graças"), "Nossa Senhora Desatadora dos Nós", "São Geraldo Majela", "São Luís e Santa Zélia Martin".

## Catalog

Lines added to `docs/plans/holy-cards-catalog.md`, all unticked, and the summary counts updated (≈ 615 cards):
- **Angels:** Raphael, with the same line as on `holy-cards-engine`.
- **Our Lady:** Perpetual Help (27 Jun), the Miraculous Medal (27 Nov), the Undoer of Knots (no date).
- **Feasts of the Lord, moveable:** the Divine Mercy and the Holy Face.
- **A new subsection, "Saints of the novenas, not on the universal calendar":** Gemma, Louis and Zélie, Gerard.

## St. Raphael the Archangel (24 Oct)

- **Iconography.** The type is "Tobias and the Angel" from Tobit 5–6. Raphael is "a beautiful young man, standing girded, and as it were ready to walk" (Tob 5:5 DRB), and "the dog followed him" (6:1). Tobias catches the fish whose gall heals his father's eyes (6:2-9). The pictures consulted are Verrocchio's workshop (National Gallery), where both have golden curls and there is a dog and a fish, and Titian (Accademia), with auburn curls, the boy led by the hand, and a white dog.
- **Consistency with the set.** The card shares the other two archangels' great white wings, plain gold halo, landscape background and painted manner. `michael_archangel` has golden curls, a rosy oval face and armour under a red-orange mantle. `gabriel_archangel` has long light-brown waves, a white tunic and a red-orange mantle. Raphael takes Titian's **auburn** short curls, a **heart-shaped** face with hazel eyes, a sage-green girded tunic and a rose-violet mantle. He has no scroll: Gabriel's card carries a lettered scroll, which the review would reject here.
- **Excerpt.** The last sentence of the epistle of his traditional Mass (Tob 12:15) from the Divinum Officium missal, verbatim in English and Portuguese. Only the Portuguese closing » before the full stop is dropped. The 29 Sep OF formulary is shared with Michael and Gabriel, and its antiphons don't name him.

## The Divine Mercy (Second Sunday of Easter)

- **Iconography.** Kazimirowski's painting (Vilnius, 1934), the first image, painted under St. Faustina's direction (Commons). Christ is in white, blessing with the right hand, the left at the breast, with a pale ray and a red ray, on a dark ground. The card leaves out the later "Jesus, I trust in you" inscription: no lettering.
- **Face.** Christ's set face from `recurring-figures.md`, with the painting's lowered gaze.
- **Excerpt.** The communion antiphon of the Second Sunday of Easter, whole. Faustina died in 1938, so per the brief her Diary is not quoted.

## The Holy Face of Jesus

- **The image of the devotion.** In 1851 the prioress of the Carmel of Tours gave Léon Dupont a facsimile of the Veronica of St. Peter's, and he kept it lit by an oil lamp (Aleteia; the oratory's site). The Martin family prayed before this image, and it was Thérèse's (Archives of the Carmel of Lisieux). The oratory publishes a scan (`sainte-face-tours.jpg`). It shows a frontal face, eyes closed, drops of blood on the brow and running from the eyes and lips, and a veil hung by its two knotted top corners. There is **no crown of thorns**, so the card adds none.
- The card paints the facsimile in colour on violet, with a small burning lamp, and leaves out its Latin caption. The Face keeps the set's Christ structure.
- **Not used:** the Holy Face Medal and Céline's later painting from the Shroud photograph. Both are later than the Tours devotion that the novena (Sr. Marie of St. Peter's Golden Arrow) belongs to.
- **Excerpt.** The second Sunday of Lent, Year C, Ps 27, last line of the second stanza: "It is your face, O Lord, that I seek" / "É vossa face que eu procuro". The en-US and pt-BR psalters word the stanza differently, and this half-line is the part they share. I capitalised the pt-BR "É".

## Our Lady of the Miraculous Medal (27 Nov)

- **Iconography.** St. Catherine Labouré's description (La Porte Latine quotes it):
  - a high-necked silk dress "blanche aurore" with plain sleeves "à la Vierge";
  - "un voile blanc … jusqu'aux pieds";
  - standing on a globe with "un serpent de couleur verdâtre";
  - jewelled rings shedding rays, the eyes lowered, and an oval forming round her.

  **No blue mantle**: that comes from later statues, not from her account. The medal's inscription, the M, the cross and the hearts are left out.
- **Face.** The set's Our Lady at about eighteen, eyes lowered. This is an apparition, not a fixed statue.
- **Excerpt.** The medal's invocation, in the words of the repo's own Miraculous Medal novena in both languages. The French original is on the medal (Commons photo) and in Wikipedia.

## Our Lady of Perpetual Help (27 Jun)

- **Iconography.** The icon in Sant'Alfonso, Rome, from Commons and Wikipedia's description:
  - Michael (left) with the lance and sponge, Gabriel (right) with the three-barred cross and the nails;
  - the Child frightened, his sandal falling;
  - a dark-red tunic and dark-blue maphorion, the star on the veil, a gold ground.

  The Greek letters are left out.
- **Face.** The icon's own: long, narrow, with a thin nose, almond eyes under high arches and a small mouth. A Marian title with its own image paints that image (`recurring-figures.md`).
- **Excerpt.** The opening of the Sub tuum praesidium, the Church's oldest prayer for Mary's help. en-US is from `practices/sub-tuum-praesidium`. pt-BR is from the Mary Mother of God novena's quotation, because the sub-tuum manifest has "A vossa" without the crase. **Not from a formulary:** the Redemptorist proper isn't in the repo.

## Our Lady, Undoer of Knots

- **Iconography.** Schmidtner's altarpiece (c. 1700, St. Peter am Perlach, Augsburg), from the Commons photographs (`undoer-knots-2.jpg`, and the altar `undoer-knots-3.jpg`) and Wikipedia:
  - a red gown and a billowing dark-blue mantle, the head bare, a ring of stars;
  - the dove above, cherubs;
  - the left angel handing up the knotted ribbon, the right angel taking the loosed end;
  - the crescent moon and the serpent;
  - tiny Tobias and the Angel below.

  Wikipedia notes that the original has **no dog** below, so the card has none.
- **Face.** The painting's Madonna is close to the set's face, bent over the knot.
- **Excerpt.** Irenaeus, *Adv. haer.* III.22.4, the source of the title. en-US is the Ante-Nicene Fathers translation (public domain), without its opening "And thus also it was that". pt-BR is our rendering of the Latin, quoted by Newman (Letter to Pusey, Note I): "Sic autem et Evae inobedientiae nodus solutionem accepit per obedientiam Mariae."

## Sts. Louis and Zélie Martin (12 Jul)

- **Faces.** From their photographs of about 1875 (Commons; crops `louis-crop.jpg`, `zelie-crop.jpg`):
  - Louis, about fifty: bald dome, dark hair at the sides, a full dark beard greying, a long straight nose, deep-set light eyes.
  - Zélie, about forty-four: a broad face with a square jaw and wide cheekbones, level dark brows, a wide straight mouth, dark hair parted and smoothed flat over the ears.
- **Attributes.** Their trades (fr.wikipedia): his, watchmaking; hers, Alençon point lace. The background is Notre-Dame d'Alençon.
- **Excerpt.** Zélie's "Je veux devenir une sainte, ce ne sera pas facile", to Marie and Pauline, as quoted by the Sanctuary of Lisieux; our rendering. **The letter number (CF) and date are not verified.** A search summary gave "CF 110, 1 Nov 1873", but no page I could open confirmed it. Louis's "Dieu premier servi" is widely quoted, but I found no primary source for it.
- **Against `julian_basilissa`**, the other married-couple card (Egyptian, Roman dress): the Martins are nineteenth-century French bourgeois, bald and bearded beside broad and square.

## St. Gemma Galgani (11 Apr)

- **Face.** From her photograph of September 1900 (Commons): a full oval face lifted, a broad-tipped nose, full lips, large light eyes, dark hair parted and drawn back, a black high-collared dress. Germanus says she dressed "in the simplest way, without any ornament" and had remarkably brilliant eyes. **The eye colour is a guess** (grey-brown), because the photograph is monochrome. The guardian angel at her shoulder is from her life (Germanus; Wikipedia). No wounds are shown.
- **Excerpt.** "Jesus, make me like Thee; make me suffer with Thee", the prayer Germanus says the Crucifix put on her lips. It comes from the 1913 English translation (O'Sullivan, B. Herder), which is public domain, shortened at a semicolon. **The Italian original was not found online**, so the pt-BR is our rendering of the English.
- I rejected two other candidates:
  - Her last words differ between witnesses. Germanus has "Jesus, I recommend my poor soul to Thee… Jesus!"; the Passionists' "Transito" page has "Mamma mia, raccomando l'anima mia a te!…".
  - The it.wikiquote sayings come from modern anthologies (*Sola con Gesù solo*, 2002/2006). I could not trace them to an original.
- **Against `therese` and `maria_goretti`:** Gemma is a grown young woman, bare-headed in black, not a Carmelite and not a child.

## St. Gerard Majella (16 Oct)

- **Face.** No portrait was painted in his life. Before burial, a wax mask was taken of his face "atteggiato a serenità e quasi nella posa di dormiente" (the shrine's "Apoteosi"). The card follows the traditional portrait on Commons (unknown painter, date not established): a pale, long, rather rectangular face, short straight dark-brown hair combed back, heavy-lidded eyes raised, a long nose, a small mouth, the black habit with a white collar, a crucifix. The skull is his attribute (Wikipedia). The handkerchief is from the story of his patronage of mothers (Wikipedia).
- **Excerpt.** The notice he had hung on his door in his last illness, from the shrine's *Vita di San Gerardo Maiella*, §212: "Qui si sta facendo la volontà di Dio, come vuole Dio e per tutto quel tempo che piace a Dio". Our rendering. Other sources shorten it ("Qui si fa la volontà di Dio…"), and Wikipedia's English is looser.
- **Against `aloysius_gonzaga`**, whose card has the same pose with a crucifix and raised eyes: Gerard has a longer, rectangular face, straight short hair rather than curls, heavy lids, hollow cheeks, a black habit instead of a surplice, and a skull and handkerchief instead of a lily and rosary. The face line says "not Aloysius" outright.
