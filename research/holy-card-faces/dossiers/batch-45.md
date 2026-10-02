# Batch 45: the Triduum, Easter, Ordinary Time II, the Ember Days, the Entrance

The next ten non-saint cards after batch 44, in catalog order: the rest of "## Seasons" (the Triduum; Easter, Sunday and weekday; Ordinary Time II, Sunday and weekday), the four Ember Days, and the first item of "## Parts of the Mass" (Entrance and Sign of the Cross). No portraits: `face` is `-`. The nine season and Ember cards carry the round-arched frame of `batches/README.md` step 4 with their liturgical colour as `box`; the Entrance carries the pointed Gothic arch and no `box` (the initial's box stays the default blue, as the README gives no colour for parts of the Mass). `refs` are the brief's default, `exaltation_cross annunciation thomas_aquinas`.

`consult/batch-45/build.py` writes `batches/batch-45.json` and checks it: every excerpt fragment against its source (the OF formularies, the Order of Mass, and the Divinum Officium missal files in English and Portuguese), that each DO file is an Ember day (`Quattuor Temporum` in its Latin `[Officium]`), the DO colour rule for the Pentecost Ember Days, every `proper` against the repo's formulary ids, seasons and ranks, the frame text against the README templates, the initials, the ten items against the catalog order after batch 44, ids against `content/saints/` and every batch, and each `catalogMatch` by the rule `accept-batch.py` uses. It prints OK.

**No `feast` on any card.** Seasons, the Triduum and the parts of the Mass have no fixed date; the Ember Days are moveable (the week after the Third Sunday of Advent, the First Sunday of Lent, Pentecost, and the week after 14 September). The app must make `feast` optional before they ship (README, "Before cards without a fixed date ship").

**Sources consulted**, saved in `consult/batch-45/`: the GIRM (USCCB edition) chapter 4, nos. 120–124 (`girm-en-ch4.*`), and the Universal Norms on the Liturgical Year, nos. 45–47 (`gnly-liturgyoffice.*`). From batch 44's folder, GIRM chapters 5 and 6 (305 flowers, 346 colours, 347 Masses for Various Needs in violet when penitential, naming no. 38). In the repo: the rubrics of `lords-supper.json` (nos. 37–43), `good-friday.json` (no. 15, the violet veil), `easter-vigil.json` (nos. 17, 70, the paschal candle); `order-of-mass.json` (the Sign of the Cross; the sprinkling rite, "on Sundays, especially in Easter Time"); the Divinum Officium missal (`content/do/web/www/missa/{Latin,English,Portugues}/Tempora/Adv3-*, Quad1-*, Pasc7-*, 093-*`) and its `liturgical_color()` in `web/cgi-bin/DivinumOfficium/Main.pm`; the Catechism of St. Pius X, part III, ch. IV, q. 23 (`content/books/pius-x-greater-catechism/*/parte-terza-capo-iv.md`: the Ember fast "to consecrate every season of the year by penance … to ask God for the preservation of the fruits of the earth; to thank Him for the fruits already given; and to pray Him to give His Church good ministers, whose ordination is performed on the Saturdays of the Ember Days"); Morrow, *My Catholic Faith*, lessons 120, 138, 160 (violet for Ember days; the dates).

## Decisions

1. **Ad orientem**, as in batch 44: every priest at the altar faces it, seen from behind. On the Ember cards this is also simply the traditional rite, in which the Ember Days are kept.
2. **The Triduum in white.** The card needs one colour and the three days have three (white on Thursday, red on Friday, white at the Vigil). White, the colour of the Mass of the Lord's Supper that opens the Triduum and of its representative formulary. The scene joins Thursday night to Friday: the place of repose and the stripped altar.
3. **Pentecost Ember Days in red.** The Pentecost Ember Days fall within the octave of Pentecost, and the Divinum Officium makes them red (`liturgical_color`: `Quattuor Temporum Pentecostes` → red; the Portuguese missal's note on `Pasc7-3/5/6`: "Paramentos vermelhos"). The brief says "red has no season", so this is the one red frame of the season/Ember set. The Advent, Lent and September Ember Days are violet (`Quattuor`/`Quatuor … Quadragesimæ` → purple; "Paramentos roxos" on `093-*`; Morrow, lesson 138).
4. **Ember Days in the traditional rite, with a proper from the new Missal.** The cards follow the catalog (dates from the DO missal), so their scenes show the traditional Mass (Roman chasuble, maniple) and their excerpts come from the DO missal in English and Portuguese. `proper` must be an OF formulary (the app loads it by id and shows its collect). The OF has no Ember Mass: the Universal Norms (45–47) leave the days to the bishops' conferences and take their Mass "from among the Masses for Various Needs … more particularly appropriate to the purpose of the supplications". Each card gets the Mass for Various Needs that matches its Ember intention in the Pius X catechism: Advent, **For the Forgiveness of Sins** (`ritual.various-needs.div051`, penitential, violet by GIRM 347); Lent, **At Seedtime** (`div037`); Pentecost, **For Vocations to Holy Orders** (`div015`, the Ember Saturday ordinations); September, **After the Harvest** (`div039`). This mapping is ours, not the Church's; drop `proper` from the four cards if the app should show no OF collect on EF cards.
5. **Representative formularies for the seasons:** the Triduum, `tempore.holy-week.lords-supper`; Easter, the Second Sunday and Monday of the Second Week (Easter Sunday is carded as `easter`; the Monday of the Second Week is the first ordinary weekday after the Octave); Ordinary Time II, the Seventeenth Sunday and its Monday: the Seventeenth Sunday always falls after Pentecost, Trinity and Corpus Christi (24–30 July), and its weekdays take its collect (`inheritsOrationsFrom`).
6. **The Entrance card paints the procession** (GIRM 120–122), the moment everyone recognises, and carries the Sign of the Cross (GIRM 124) in its excerpt. The priest wears white and gold, like the test draft `x_consecration`, so the parts-of-the-Mass cards don't each pick a season.
7. **Names and ids.** The catalog's names, tidied: "Easter Sundays" / "Domingos do Tempo Pascal" (not "Domingos da Páscoa", which reads as Easter Sunday itself), "Ordinary Time II Sundays", "Advent Ember Days" / "Têmporas do Advento", "Entrance and Sign of the Cross" / "Entrada e Sinal da Cruz". Initials skip "The": the Triduum takes **S** (Sacred), like "St." skipped on saints. Ember captions name the week, not the weather season, because in Brazil December is summer.

## The Sacred Paschal Triduum (`triduum`)

Holy Thursday night: the side chapel of repose glowing with candles and white flowers around a small closed tabernacle, a few faithful keeping watch; the high altar stripped bare in shadow, its cross veiled in violet. All from the rubrics of the Lord's Supper in the repo (38: a place of repose "suitably decorated"; 39: the tabernacle closed; 41: the altar stripped, crosses removed or veiled; 43: adoration continued into the night). No procession, so it stays apart from `corpus_christi` (humeral veil and canopy).

- Excerpt: entrance antiphon of the Lord's Supper, "We should glory in the Cross of our Lord Jesus Christ, in whom is our salvation, life and resurrection." / "Nós, porém, devemos gloriar-nos na cruz de nosso Senhor Jesus Cristo; nele está a salvação, nossa vida e ressurreição." Cross and resurrection: the whole Triduum.
- Proper: `tempore.holy-week.lords-supper`.

## Easter Sundays (`easter_sunday`)

The sprinkling rite of an Easter Sunday: the priest in white walking the aisle with the aspergillum, a server with the holy-water vessel, the people bowing; the paschal candle alight by the ambo; white lilies. The Order of Mass puts the rite "on Sundays, especially in Easter Time", the priest "moving through the church". The candle carries only a red cross: its Alpha, Omega and year would be lettering.

- Excerpt: entrance antiphon of the Second Sunday of Easter, whole, verbatim both languages.
- Proper: `tempore.easter.week-2.sunday`.

## Easter Weekdays (`easter_weekday`)

A weekday morning Mass in white beside a spring garden: apple blossom through the window, lilies by the altar, a gardener, a mother and a child with a daffodil. The paschal candle is left out: the Missal asks it lit "in all the more solemn liturgical celebrations" of the season (`easter-vigil.json` no. 70), which a plain weekday may not be.

- Excerpt: entrance antiphon of Monday of the Second Week, whole, verbatim both languages.
- Proper: `tempore.easter.week-2.monday`.

## Ordinary Time II Sundays (`ordinary_time_2_sunday`)

A full church at Sunday Mass in high summer: green vestments, a deacon, the windows open on ripening wheat. The Ordinary Time I Sunday card shows the parish arriving outside in spring; this one is inside, in summer.

- Excerpt: entrance antiphon of the Seventeenth Sunday, whole, "God is in his holy place, God who unites those who dwell in his house …" / "Deus habita em seu santuário, reúne os fiéis em sua casa …".
- Proper: `tempore.ordinary-time.week-17.sunday`.

## Ordinary Time II Weekdays (`ordinary_time_2_weekday`)

An evening Mass after work in late summer: low golden sun, a mason, a clerk, a mother with a sleeping toddler. Evening, against the morning of `ordinary_time_1_weekday`.

- Excerpt: the collect of the Seventeenth Sunday, said on the week's weekdays, its opening: "O God, protector of those who hope in you, without whom nothing has firm foundation, nothing is holy." / "Ó Deus, amparo dos que em vós esperam, sem vós nada tem valor, nada é santo."
- Proper: `tempore.ordinary-time.week-17.monday`.

## Advent Ember Days (`advent_ember_days`)

A traditional low Mass in violet on a grey December morning, the window on snowy fields at rest and falling snow, a farming couple and an old woman in a lace veil. Snow answers the Introit's "dew" from the heavens. The Ember Wednesday of Advent is also the Annunciation Gospel (Luke 1:26–38); it is not painted, so the card doesn't repeat `annunciation`.

- Excerpt: Introit of Ember Wednesday (`Adv3-3`, Isaiah 45:8), "Drop down dew, you heavens, from above, and let the clouds rain the just." / "Ó céus, derramai dessas alturas o vosso orvalho: e que as nuvens chovam o Justo!"
- Proper: `ritual.various-needs.div051` (Decision 4).

## Lenten Ember Days (`lent_ember_days`)

Outside the church: a sower in a ploughed field pausing at the bell, the village church open behind him with a violet-vested priest small inside and two veiled women going in. Spring sowing for the prayer for the fruits of the earth.

- Excerpt: Introit of Ember Wednesday of Lent (`Quad1-3`, Psalm 24:6), "Remember that Your compassion, O Lord, and Your kindness are from of old." / "Lembrai-Vos, Senhor, de que a vossa bondade e misericórdia são eternas!"
- Proper: `ritual.various-needs.div037` (Decision 4).

## Pentecost Ember Days (`pentecost_ember_days`)

A traditional Mass in red, early summer: roses and peonies by the altar (the octave of Pentecost is festive), windows onto green wheat and poppies, a young man in a cassock among the faithful for the Ember Saturday ordinations. The ordination rite itself is not painted: it is not in the repo's data.

- Excerpt: Introit of Ember Saturday (`Pasc7-6`, Romans 5:5), whole, "The charity of God is poured forth in our hearts, alleluia: by His Spirit dwelling in us, alleluia, alleluia." / "O amor de Deus espalhou-se nos nossos corações, aleluia: pelo seu Espírito que habita em nós, aleluia, aleluia." The variant file `Pasc7-6t.txt` has the same Introit.
- Proper: `ritual.various-needs.div015` (Decision 4).

## September Ember Days (`september_ember_days`)

A traditional Mass in violet at harvest time, no flowers, the side door open onto sheaves, a hay cart and a vineyard, a harvesting family kneeling in work clothes.

- Excerpt: Communion of Ember Wednesday (`093-3`, Nehemiah 8:10), its last clause, "Be not sad, for the joy of the Lord is our strength." / "Não vos contristeis; porque a alegria do Senhor é a nossa fortaleza." The Wednesday Introit was passed over: the Portuguese has typos ("júblio", "Jabob").
- Proper: `ritual.various-needs.div039` (Decision 4).

## Entrance and Sign of the Cross (`entrance`)

The entrance procession from the back of the nave, in the order of GIRM 120: thurifer, the cross between two lit candles, servers, a reader with the Book of the Gospels slightly raised (not the Lectionary), the priest last; the people standing; incense haze. A Sunday Mass with incense, so every element of GIRM 120 can appear.

- Excerpt: the Sign of the Cross from the Order of Mass, verbatim both languages.
- No proper (a part of the Mass).

## Look-alike risks

- The three violet/red Ember interiors (`advent_ember_days`, `pentecost_ember_days`, `september_ember_days`) share a composition (a traditional Mass seen from the pews, a window or door on the fields). They are told apart by colour and the landscape (snow; green wheat and poppies; sheaves and vines). If the drafts look alike, move the September card outdoors first.
- `advent_ember_days` against `advent_weekday` (violet, pre-dawn, candles in the pews): the Ember card is daylight with snow in the window.
- `ordinary_time_2_weekday` against `ordinary_time_1_weekday` and `lent_weekday`: evening gold light is the difference.
- `easter_sunday` against `corpus_christi` and `entrance` (processions in white): the aspergillum and the paschal candle must be visible.
- `triduum` must read as night and a bare altar, not a feast.

## TLM look (2026-09-30)

Only `subject` changed. Sources, kept in `consult/tlm/`: **RS** = *Ritus servandus in celebratione Missae*, Missale Romanum 1962 (`ritus-servandus-1962-lat.pdf`, from aomoi.net); **F** = Fortescue, *The Ceremonies of the Roman Rite Described* (1920 impression; `fortescue-1920.txt`, archive.org), cited by the line of that file.

- **Low and sung Mass cards** (`easter_weekday`, `ordinary_time_2_weekday`, the four Ember Days, and `ordinary_time_2_sunday`) get the same altar, rail, vestments and candle rule as batch 44. The Ember cards were already in the old rite and gain only the gradine, altar cards, veiled tabernacle and rail.
- **`ordinary_time_2_sunday`** is now a Solemn High Mass, with the deacon in a dalmatic and the subdeacon in a tunicle "one behind the other behind the celebrant" at the prayers (RS IV.7, V.5).
- **`easter_sunday`:** this is the **Vidi aquam** before the principal Mass. The celebrant wears a white **cope**, without chasuble or maniple, and a server carries the holy-water vessel beside him (F l. 6884–6897, 6972–6985, on the Asperges and its going down the church). The Paschal candle stands on the gospel side of the sanctuary with its five grains of incense (F l. 19852, 20735), not "beside the ambo".
- **`triduum`:** this follows the traditional stripping (F l. 18370–18395). The high altar keeps only the cross veiled in violet and the six candles, put out. Cloths, frontal, altar cards and tabernacle veil are removed, the tabernacle is left open, and the lamp is out. At the place of repose, two clerks in surplice kneel in watch (F l. 18392–18400; DO `Latin/Tempora/Quad6-4rm2.txt`, "Pro solemni Sacramenti repositione…").
- **`entrance`:** the High Mass procession goes thurifer, cross between acolytes, clergy, M.C., subdeacon, deacon, celebrant, with the sacred ministers in birettas (F l. 7313–7318, 8020–8030). No lay reader carries a Book of the Gospels; at the old rite the book of lessons waits on the credence (F l. 2964).
- The faithful's heads are covered (1917 Code c. 1262 §2).

## The Ember Days as a set (2026-10-02)

The four Ember cards were redrawn to one composition. The first drawings did not read as a set: the Lent card was a sower outdoors with the Mass tiny in a doorway, the other three were indoor Masses with the season only a glimpse through a side window or door. Now every card has the priest at the high altar, ad orientem, seen from behind, in the lower half, and directly behind and above the altar a great round-arched opening filling the upper half with the season: deep snow for Advent, the sower in the ploughed field for Lent, green wheat and poppies for Pentecost, sheaves, hay cart and vineyard for September. Only `subject` changed; the seasonal content is what each section above already sourced, and the colours stand (violet, violet, red, violet).

- The opening behind the altar is a pictorial device, not a rubric or a real church's east wall: it takes the place of the reredos. The altar keeps the Low Mass furnishing of the TLM section (gradine, crucifix, two candles lit, altar cards, veiled tabernacle, rail).
- The faithful in the pews are gone from all four, so the landscape has the room; with them goes the young man in a cassock of the Pentecost card (the Ember Saturday ordinations). The Pentecost card keeps its roses and peonies, and is now a Low Mass with one server like the other three.
- This closes the first look-alike risk above: the cards are told apart by the landscape, which is now half the picture.
