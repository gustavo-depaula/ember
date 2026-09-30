# Batch 47: the parts of the Mass, from the Homily to the Mystery of Faith

The next ten items of "## Parts of the Mass" after batch 46's Gospel, in catalog order: the end of the Liturgy of the Word (Homily, Profession of Faith, Universal Prayer) and the Liturgy of the Eucharist up to the acclamation after the Consecration (Preparation of the Gifts, Prayer over the Offerings, Preface Dialogue and Preface, Sanctus, Epiclesis, Consecration, Mystery of Faith). No portraits: `face` is `-`. Every card carries the pointed Gothic arch of `batches/README.md` step 4 and no `box`, like batches 45–46. `refs` are the brief's default, `exaltation_cross annunciation thomas_aquinas`.

`consult/batch-47/build.py` writes `batches/batch-47.json` and checks it: every excerpt against its source text, rebuilt from the repo (`order-of-mass.json` and its Eucharistic Prayer II, the Ordinary Time formularies) with only the edits named in `excerptSource`; the rubrics between and around the lines taken; the Order of Mass rubrics the scenes rely on; the GIRM sentences the bases quote, in the saved copies; the frame against the README template; no `box`, `feast` or `proper`; the initials; the white-and-gold priest; the ten items against the catalog order after batches 45–46; ids against `content/saints/` and every batch; and each `catalogMatch` by the rule `accept-batch.py` uses, ticking in batch order. It prints OK (and a note while batch 29 is unaccepted; see Decision 7).

**No `feast`, no `proper`.** A part of the Mass has neither (README, "Before cards without a fixed date ship").

**Sources consulted**, saved in `consult/batch-47/`: the GIRM (USCCB edition) chapter 2 (`girm-en-ch2.*`: postures 43, including the US kneeling from after the Sanctus to the Amen; the Homily 65–66; the Creed 67–68; the Universal Prayer 69–71; the Preparation of the Gifts and Prayer over the Offerings 72–77; the Eucharistic Prayer and its parts 78–79) and chapter 4 (`girm-en-ch4.*`: 136 the Homily; 137 the bow at et incarnatus est; 138 the Universal Prayer; 139–146 the Preparation of the Gifts, the incensation, the Orate fratres and the Prayer over the Offerings; 148 the Preface dialogue and Sanctus; 150 the bell and incense at the Consecration; 151 the acclamation). Copies of batch 46's and batch 45's downloads. In the repo: `content/of/order/order-of-mass.json` (`order.credo-nicene`, `order.universal-prayer`, `order.preparation-of-gifts`, `order.preface-dialogue`, `order.sanctus`, and `eucharisticPrayers` → `order.eucharistic-prayer.2` with its rubrics); `content/of/formularies/tempore/ordinary-time/week-{2,3}/sunday.json`.

## Decisions

1. **Where the excerpts come from.** The Order of Mass has the Creed, the Universal Prayer's model formulas, the Preparation of the Gifts, the Preface dialogue, the Sanctus and the Eucharistic Prayers. It has no Homily and no Prayer over the Offerings (a proper). The Homily takes Luke 4:21, Christ's first homily at Nazareth, "This text is being fulfilled today even as you listen", from the Gospel of the Third Sunday in Ordinary Time, Year C. The Prayer over the Offerings is the Second Sunday's ("whenever the memorial of this sacrifice is celebrated the work of our redemption is accomplished"), without "Through Christ our Lord". The Epiclesis, Consecration and Mystery of Faith come from Eucharistic Prayer II, the most used. Its pt-BR epiclesis (the CNBB third edition) has no equivalent of "like the dewfall", and the pt-BR first acclamation ends "Vinde, Senhor Jesus!". Both are verbatim as the app ships them.
2. **The Universal Prayer excerpt** is General Formula I's first intention with the reply. The two languages carry different model formulas, and this is the pair that says the same thing. The en-US text is verbatim, including the source's "Lord hear us." with no comma.
3. **The Creed excerpt** is the incarnatus lines ("And by the Holy Spirit was incarnate of the Virgin Mary, and became man."), with the first letter capitalised. The card shows the profound bow the rubric sets at those words (GIRM 137). This follows batch 46's Penitential Act, where the excerpt is the words of the gesture.
4. **Homily in a pulpit.** GIRM 136 allows the chair, the ambo, or "another worthy place". A carved pulpit with a sounding board keeps the card apart from the three ambo cards of batch 46 and from `universal_prayer`.
5. **Ad orientem at the altar.** From the Preparation of the Gifts on, the priest stands at the altar facing it, seen from behind or in profile, as in batches 44–46. The Missal's own rubric turns him "facing the people" for the Orate fratres. The Prayer over the Offerings card shows him afterwards, facing the altar with hands extended (GIRM 146 gives the hands but not the direction). This is the convention, not a rubric.
6. **Postures follow the USCCB GIRM 43.** The people sit for the Homily and the Preparation, and stand for the Creed, the Universal Prayer, the Prayer over the Offerings, the Preface and the Sanctus. They kneel from after the Sanctus to the Amen (Epiclesis, Consecration, Mystery of Faith). The US adaptation is the text saved in the consult folder. There is still no deacon.
7. **The Consecration is modelled on `x_consecration`**, and the viewpoint is the same: straight on from the foot of the steps, a white-and-gold high altar, six candles and a crucifix, the priest from behind raising the Host high, a server kneeling on the right-hand step, golden rays. One change: the draft's server lifts the hem of the chasuble, which the Missal's rubrics don't give. Here he rings the bell at the elevation instead, and a thurifer incenses the Host (GIRM 150, "according to local custom" / "if incense is being used"). Kneeling faithful are added at the foot of the arch.
8. **catalogMatch `Sanctus` and the order of acceptance.** None of the ten items is a prefix of another. But `accept-batch.py` also matches any unticked list line that contains the text, and the Pictorial Lives line for 2 June ("Sts. Pothinus, Bishop, Sanctus, Attalus, Blandina…") contains "Sanctus". Batch 29 claims that line, as `pothinus_blandina`, and is not yet accepted. **Accept batch 29 before batch 47**, or `accept-batch.py` stops on `sanctus` ("matched 2 unticked lines"). `build.py` ticks the Pothinus line first when simulating, and prints a note while it is still unticked.
9. **Names.** The catalog's names in en-US. In pt-BR, the repo's labels where it has them: "Profissão de Fé", "Oração Universal" (capitalised like the others), "Preparação das Oferendas", "Oração sobre as Oferendas" (`structures/mass.ts`), "Diálogo do Prefácio e Prefácio", "Santo". Where it doesn't: "Homilia", "Epiclese", "Consagração", "Mistério da Fé".
10. **Ministers.** The Universal Prayer's reader is a young laywoman in ordinary dress (GIRM 71: "one of the lay faithful"). She is the batch's one woman minister, and she keeps that card apart from batch 46's male readers.

## Homily (`homily`)

From across the nave at pulpit height: the priest in profile in a carved pulpit with a sounding board, the people seated below looking up (GIRM 43, 136).

- Excerpt: Luke 4:21, the last sentence of the Gospel of the Third Sunday, Year C, "Then he began to speak to them, 'This text is being fulfilled today even as you listen'." / "Então começou a dizer-lhes: "Hoje se cumpriu esta passagem da Escritura que acabastes de ouvir"."

## Profession of Faith (`profession_of_faith`)

From the side of the sanctuary looking across the nave. In the foreground the priest at the chair bows profoundly with the servers, and behind them the whole standing congregation bows at once (GIRM 137).

- Excerpt: "And by the Holy Spirit was incarnate of the Virgin Mary, and became man." / "E se encarnou pelo Espírito Santo, no seio da Virgem Maria, e se fez homem."

## Universal Prayer (`universal_prayer`)

From behind and beside the ambo: a laywoman reads an intention facing the standing people, and the priest stands at the chair in profile with his hands joined (GIRM 71, 138).

- Excerpt: General Formula I, first intention and reply.

## Preparation of the Gifts (`preparation_of_gifts`)

Close, in profile, at the side of the altar: the priest holds the paten with the host slightly raised, just above the corporal. The chalice, purificator and Missal are already on the altar, and a server waits with the cruets. Far behind, the seated people, and the couple who brought up the gifts going back down the aisle (GIRM 73, 139–142).

- Excerpt: the blessing over the bread, whole.

## Prayer over the Offerings (`prayer_over_offerings`)

From high in a side gallery, looking down diagonally onto the sanctuary: the priest at the altar with hands extended, the chalice under its pall, a haze left from the incensation, and the people standing below (GIRM 142, 144, 146).

- Excerpt: the Second Sunday's prayer, without its conclusion.

## Preface Dialogue and Preface (`preface`)

From just behind the standing people in the front pews, looking up to the priest at the altar, seen from behind as he lifts both hands at "Lift up your hearts". An east window floods the sanctuary with light (GIRM 148).

- Excerpt: "Lift up your hearts. We lift them up to the Lord." / "Corações ao alto. O nosso coração está em Deus."

## Sanctus (`sanctus`)

From the choir stalls beside the altar: the priest in profile, hands joined, singing. Behind the altar is a gilded reredos painted with angels and six-winged seraphim, and beyond the rail the people stand and sing (GIRM 79b, 148).

- Excerpt: "Holy, Holy, Holy Lord God of hosts. Heaven and earth are full of your glory." / "Santo, Santo, Santo, Senhor, Deus do universo. O céu e a terra proclamam a vossa glória."

## Epiclesis (`epiclesis`)

Close, over the priest's shoulder, looking down onto the altar: his hands held out together, palms down, over the paten and chalice. Light falls on the gifts from a stained-glass dove, and a server kneels on the step with the bell (the rubric of Eucharistic Prayer II; GIRM 150).

- Excerpt: Eucharistic Prayer II's epiclesis, whole, without the ✠.

## Consecration (`consecration`)

As `x_consecration` (Decision 7): straight on from the foot of the steps, the Host raised high, the bell and the thurible, the faithful kneeling.

- Excerpt: "Take this, all of you, and eat of it, for this is my body, which will be given up for you." / "Tomai, todos, e comei: Isto é o meu Corpo, que será entregue por vós."

## Mystery of Faith (`mystery_of_faith`)

From a side aisle among the kneeling faithful, who sing with their faces lifted. Beyond them, the priest at the altar at an angle, with the chalice and the Host on the corporal (GIRM 151).

- Excerpt: "The mystery of faith. We proclaim your Death, O Lord, and profess your Resurrection until you come again." / "Mistério da fé! Anunciamos, Senhor, a vossa morte e proclamamos a vossa ressurreição. Vinde, Senhor Jesus!"

## Look-alike risks

- **The five altar cards from the Preface to the Mystery of Faith.** They differ by viewpoint:
  - `preface`: behind the people, looking up.
  - `sanctus`: from the side stalls, with the reredos.
  - `epiclesis`: over the shoulder, close.
  - `consecration`: straight on from the step, the Host high.
  - `mystery_of_faith`: among the kneeling people in the side aisle.

  If `preface` and `consecration` blur, make the preface's foreground people larger.
- **`prayer_over_offerings` against `preparation_of_gifts`.** Both are at the altar with the gifts. The first is from high and far with hands extended; the second is close in profile with the paten.
- **`sanctus` against batch 46's `gloria`.** Both show painted angels. The Gloria has a starry vault over shepherds seen from the nave; the Sanctus has a gold-ground reredos behind the altar seen from the side.
- **`profession_of_faith` against `penitential_act`.** Both show bowed people. The Creed is a lateral wide view of everyone bowing from the waist; the Penitential Act is three figures close, striking the breast.
- **`universal_prayer` against `greeting`.** Both look out from the sanctuary over the people. The Greeting is from behind the priest at the chair with his arms wide; the Universal Prayer is from beside the ambo, with the reader in front.
- **`homily` against batch 46's `gospel`.** The pulpit is high on a pillar and seen level; the Gospel's ambo is seen from below, with candles and incense.

## TLM look (2026-09-30)

Only `subject` changed. Sources, kept in `consult/tlm/`: **RS** = *Ritus servandus in celebratione Missae*, Missale Romanum 1962 (`ritus-servandus-1962-lat.pdf`, from aomoi.net); **F** = Fortescue, *The Ceremonies of the Roman Rite Described* (1920 impression; `fortescue-1920.txt`, archive.org), cited by the line of that file.

- **`homily`:** the sermon. When the celebrant preaches from a pulpit, he first lays chasuble and maniple at the sedilia (F l. 9114–9120), so he preaches in amice, alb and stole. The chasuble lies on the sedile in the background.
- **`profession_of_faith`:** at *Et incarnatus est* the celebrant **genuflects** at the altar (RS VI.3) and all genuflect with him (F l. 6659–6660). This replaces the bow, which is the new rite's gesture.
- **`universal_prayer` (no Prayer of the Faithful in the old rite):** the **Solemn Prayers of Good Friday**, the one great intercession the traditional Missal keeps. Its first prayer is "pro Ecclesia sancta Dei", the same intention as the card's excerpt. The celebrant sings them at the middle of the altar in a **black cope**, with the deacon and subdeacon in black dalmatic and tunicle, and the book before him on a single altar cloth. At the deacon's *Flectamus genua* all kneel in silence (DO `Latin/Tempora/Quad6-5r.txt`, nos. 12–13). This breaks the white-and-gold convention of the Mass-part cards and is not a Mass (see the report).
- **`preparation_of_gifts`:** the Offertory. The priest holds the paten with the host raised to his breast, eyes lifted (RS VII.2), and the server waits with the cruets on their dish (F l. 2741–2762). The lay gift procession is removed.
- **`prayer_over_offerings`:** the Secret, said silently at the middle of the altar with hands extended (RS VII.7). The chalice is covered with the pall.
- **`preface`:** at *Sursum corda* the hands are raised "to the breast", facing each other (RS VII.8). The priest does not turn.
- **`sanctus`:** the priest bows moderately with his hands joined while the server rings the bell (RS VII.8). The torchbearers come out at the Sanctus (F l. 9613–9617).
- **`epiclesis`:** the old Canon has no epiclesis under that name. The card shows the **Hanc igitur / Quam oblationem**, with the hands spread over the offerings (RS VIII.4, the same gesture as before), the Host lying on the corporal, and the chalice under its pall. The server rings the warning bell: Fortescue records the bell at *Quam oblationem* as allowed by Van der Stappen and "usual in England" (F l. 6468–6470, n.). The dove window stays as decoration.
- **`consecration` (reverses "no hem"):** this is the more solemn form of the sung Mass (F l. 9640–9660, 9940–9965). A server kneeling on the edge of the foot-pace lifts the hem of the chasuble, a second server rings the bell three times at each elevation, the thurifer kneels at the epistle side and incenses the Host, and the torchbearers kneel across the sanctuary. RS VIII.6: "minister manu sinistra elevat fimbrias posteriores Planetae… et manu dextera pulsat campanulam"; RS VIII.8 covers the torches and the thurifer.
- **`mystery_of_faith` (no acclamation in the old rite):** the words *mysterium fidei* stand inside the consecration of the chalice (DO `Latin/Ordo/Ordo.txt` l. 245). The card now shows the **elevation of the Chalice**, with the server at the hem and the bell (RS VIII.6–7), and the faithful kneeling in silent adoration instead of singing.
- Every card gets the gradine, veiled tabernacle and altar cards, the altar rail, a Roman chasuble with maniple, and veiled women in the nave.
