# Batch 56: the traditional parts of the Mass, from the foot of the altar to the Memento of the living

The 29 Mass-part cards of batches 45–48 are named after the parts of the new Mass and drawn in the traditional Latin Mass. Batches 56–58 add the traditional parts those cards leave out, beside them: nothing is rebuilt and no existing card changes its name or picture, except the Consecration, which batch 58 makes four cards. Batch 56 has the first ten new parts, batch 57 the other eight, batch 58 the Consecration and the Elevations.

Same convention as batches 46–48: pointed Gothic arch, no `box` (the initial's box stays blue), no `feast`, no `proper`, `face` `-`, the priest in white and gold, `refs` `exaltation_cross annunciation thomas_aquinas`. Each card carries `"kind": "mass"` and its `"order"` in the batch file, and `accept-batch.py` now writes both into the card.

`consult/batch-56/build.py` writes the three batch files and checks them. Every excerpt is built from fragments that must stand verbatim in the Divinum Officium files, with only the edits its `excerptSource` names. It also checks the initials, that no id is in another batch, and that the order list holds every Mass card, old and new, exactly once. It prints OK.

**Sources.** The Order of Mass in the repo's Divinum Officium data, `content/do/web/www/missa/{Latin,English,Portugues}/Ordo/Ordo.txt`, with `Ordo/Prayers.txt` (the Last Gospel), `Ordo/Communio.txt` (the people's Communion) and `Tempora/Adv1-0.txt` (the Introit). For the gestures, as in batches 44–48: **RS** = *Ritus servandus in celebratione Missae*, Missale Romanum 1962, and **F** = Fortescue, *The Ceremonies of the Roman Rite Described* (1920), cited by the line of `consult/tlm/fortescue-1920.txt`.

**The Portuguese of the Divinum Officium is European.** Four excerpts keep its spelling as it stands in the file: "omnipotente" (Munda Cor Meum, Veni Sanctificator, Orate Fratres) and "demónio" (Leonine Prayers). Brazilian spelling would be "onipotente" and "demônio". Two more keep the file's punctuation: "rodearei, Senhor o vosso altar" and "Lembrai-Vos também Senhor,".

## What the Ordo has, and which card shows it

Walking `Ordo.txt` from top to bottom. **New** marks a card of batches 56–58.

| Part in the Ordo | Card |
|---|---|
| Asperges / Vidi aquam (`&Vidiaquam`) | none: it is before Mass, and `easter_sunday` shows the Vidi aquam |
| Sign of the Cross, Introibo, Psalm 42 | **`prayers_foot_altar`** (the procession is `entrance`) |
| Confiteor | `penitential_act`, which already shows the Confiteor at the foot of the altar |
| Aufer a nobis, Oramus te (going up, the kiss of the altar) | none of its own: the dossier of `prayers_foot_altar` and of `incensing_altar` name it |
| Incensing of the altar (Solemn Mass) | **`incensing_altar`** |
| Introit | **`introit`** |
| Kyrie, Gloria | `kyrie`, `gloria` |
| Dominus vobiscum, Collect | `greeting`, `collect` |
| Lesson / Epistle | `first_reading` (a lector), `second_reading` (the subdeacon) |
| Gradual, Alleluia | `responsorial_psalm` (the Gradual), `gospel_acclamation` |
| Munda cor meum | **`munda_cor`** (Low Mass); the deacon's is in `gospel_acclamation` |
| Gospel, sermon, Creed | `gospel`, `homily`, `profession_of_faith` |
| Offertory verse (a proper) | none |
| Suscipe, sancte Pater | `preparation_of_gifts`: its picture is this offering, the paten with the host raised (RS VII.2), under the new Mass's words. No second card |
| Deus, qui humanae substantiae | **`water_and_wine`** |
| Offerimus tibi (the chalice offered) | none |
| In spiritu humilitatis, Veni, sanctificator | **`veni_sanctificator`** |
| Incensing at the Offertory (Solemn Mass) | none: `incensing_altar` is the first incensing |
| Lavabo | **`washing_of_hands`** (the object card `lavabo` shows the vessels) |
| Suscipe, sancta Trinitas | none |
| Orate, fratres | **`orate_fratres`** |
| Secret | `prayer_over_offerings` |
| Preface, Sanctus | `preface`, `sanctus` |
| Te igitur | **`te_igitur`** |
| Memento of the living | **`memento_living`** |
| Communicantes | none |
| Hanc igitur, Quam oblationem | `epiclesis`, which shows the hands spread over the offerings |
| Consecration and elevation of the Host and of the Chalice | **`consecration_host`**, **`elevation_host`**, **`consecration_chalice`**, **`elevation_chalice`** (batch 58), and `mystery_of_faith` |
| Unde et memores, Supra quae, Supplices te rogamus | none |
| Memento of the dead | **`memento_dead`** |
| Nobis quoque peccatoribus | **`nobis_quoque`** |
| Per ipsum | `doxology_amen` |
| Pater noster | `lords_prayer` |
| Libera nos | **`libera_nos`** |
| Fraction, Pax Domini, commingling, Agnus Dei | `agnus_dei` (the Host broken over the chalice) |
| The three prayers before Communion, the Pax | `sign_of_peace` (the Pax at Solemn Mass) |
| Domine, non sum dignus; the priest's Communion | **`domine_non_sum_dignus`** |
| Communion of the people | `holy_communion` |
| Quod ore sumpsimus, Corpus tuum (the ablutions) | **`ablutions`** |
| Communion verse (a proper) | none |
| Postcommunion | `prayer_after_communion` |
| Ite, missa est | `dismissal` |
| Placeat tibi | **`placeat`** |
| Blessing | `final_blessing` |
| Last Gospel | **`last_gospel`** |
| Leonine Prayers (Low Mass) | **`leonine_prayers`** |

## Decisions

1. **How many cards for the Canon.** Four besides the Consecration: Te igitur (its beginning, the deepest bow), the two Mementos (the one place the priest stands still and silent; the living before the Consecration, the dead after), and Nobis quoque (the breast struck, the only words of the Canon said aloud). Hanc igitur has `epiclesis`. Communicantes and the three prayers after the Consecration have no gesture a card could tell from its neighbours.
2. **Suscipe, sancte Pater gets no card.** `preparation_of_gifts` already paints it. A card with the same gesture and other words would be a duplicate picture. The alternative is to give that card the old prayer as its excerpt.
3. **The Offertory gets two new cards, not five**: the water and wine (its own place, minister and gesture) and Veni, sanctificator (the arms raised). The chalice offered and the two bowed prayers would repeat the pictures beside them.
4. **Munda cor meum at Low Mass**, with the Missal carried across, because the deacon's Munda cor is already in the background of `gospel_acclamation`.
5. **Domine, non sum dignus is the priest's**, as `Ordo.txt` has it, so the card is also the only one of the priest's own Communion. The people's (Ecce Agnus Dei, in `Communio.txt`) has no card.
6. **Names.** A prayer known by its first words keeps them in both languages (Munda Cor Meum, Veni Sanctificator, Orate Fratres, Te Igitur, Nobis Quoque Peccatoribus, Libera Nos, Domine Non Sum Dignus, Placeat Tibi); a rite has a plain name in each language. "Washing of the Hands", not "Lavabo", which is the object card's name.
7. **The order of the section** is the order of the traditional Mass, old and new cards together (`consult/batch-56/build.py`, `ORDER`). What moves among the old cards: the Greeting goes after the Gloria, where the first Dominus vobiscum said to the people stands; the Dismissal goes before the Blessing. The three reading cards keep their sequence, First Reading, Responsorial Psalm, Second Reading (a lesson, the Gradual, the Epistle, as on an Ember Wednesday), though a Sunday Mass has one Epistle before the Gradual. The Universal Prayer, which the old rite does not have, stays after the Creed.

## The cards

Each line gives the moment, the rubric it rests on, and the excerpt.

- **`prayers_foot_altar`** — Low Mass. The priest upright at the foot of the steps, hands joined; the server kneeling behind him to his left (RS III.6). The faithful kneel (F l. 6647–6648). Excerpt: the antiphon of Psalm 42, priest and server. `penitential_act` is the same prayers' Confiteor, seen from the pews with the priest bowed.
- **`incensing_altar`** — Solemn Mass. The celebrant incenses the cross; deacon and subdeacon beside him, the subdeacon holding the chasuble at the shoulder (RS IV.4, 7; F l. 8072–8075). Excerpt: Ab illo benedicaris, the blessing of the incense.
- **`introit`** — Low Mass. The priest at the epistle corner signs himself as he begins (RS IV.2). Excerpt: Ad te levavi, the Introit of the First Sunday of Advent and the first of the Missal; the Ordo has only `&introitus`. The picture names no season.
- **`munda_cor`** — Low Mass. The priest bowed profoundly at the middle, hands joined before the breast, while the server carries the Missal across (RS VI.1–2). The people rise for the Gospel. Excerpt: the prayer's first sentence.
- **`water_and_wine`** — Low Mass. At the epistle corner the priest holds the chalice by the knob and signs the water cruet (RS VII.4). Excerpt: the petition of Deus, qui humanae substantiae.
- **`veni_sanctificator`** — the priest erect, eyes raised, arms opened and lifted before he joins them (RS VII.5); host on the corporal, chalice under the pall. Excerpt: the prayer whole.
- **`washing_of_hands`** — Low Mass. The server pours water over the tips of the priest's thumbs and forefingers (RS VII.6). Excerpt: Psalm 25:6.
- **`orate_fratres`** — the priest turned to the people, eyes lowered, hands extended and about to be joined (RS VII.7); the server answers. Seen from the side, so it is not a second `greeting`. Excerpt: the priest's words whole.
- **`te_igitur`** — the priest bowed profoundly, joined hands on the altar (RS VIII.1); the people kneel (F l. 6688–6689). Excerpt: the prayer's opening.
- **`memento_living`** — the priest still, hands joined before his face, head a little bowed (RS VIII.3); the people of the prayer's "all here present" fill the foreground. Excerpt: the prayer's opening, without "N. and N.".

## Look-alike risks

- `water_and_wine`, `washing_of_hands` and batch 57's `ablutions` are all the priest and a server with a cruet at the epistle corner. They differ by what is held (the chalice and the sign of the cross; the fingertips over a basin and a towel; the fingers over the chalice) and by the side they are seen from.
- `te_igitur` and batch 57's `placeat` are both a bow with joined hands on the altar: one in the sanctuary with the Missal open and the offerings uncovered, the other from the nave with the chalice veiled and the Missal closed.
- `memento_living` and batch 57's `memento_dead` share the gesture; the foregrounds differ (the living in the pews; a widow by votive candles).
- `introit` against `collect`: seen from behind with the sign of the cross, against close profile with the hands extended.
- `orate_fratres` against `greeting` and `final_blessing`, the other two cards where the priest faces the people: those are seen from behind him, this one from the side.
