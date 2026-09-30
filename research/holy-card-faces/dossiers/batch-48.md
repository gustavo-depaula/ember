# Batch 48: the parts of the Mass from the Doxology to the Dismissal, then the Altar and the Ambo

The next ten items after batch 47's Mystery of Faith, in catalog order. That is the last eight items of "## Parts of the Mass": the Doxology and Great Amen, the Communion Rite (The Lord's Prayer, Sign of Peace, Agnus Dei and the Fraction, Communion, Prayer after Communion) and the Concluding Rites (Blessing, Dismissal). Then the first two items of "## Liturgical objects and vestments": Altar and Ambo. No portraits: `face` is `-`. The eight Mass parts carry the pointed Gothic arch and the two objects the quatrefoil medallion on a deep blue starred ground, both copied from `batches/README.md` step 4. `refs` are the brief's default, `exaltation_cross annunciation thomas_aquinas`.

`consult/batch-48/build.py` writes `batches/batch-48.json` and checks it:
- every excerpt against its source text, rebuilt from the repo (`order-of-mass.json` and its Eucharistic Prayer II, the Ordinary Time and Lent formularies) with only the edits named in `excerptSource`;
- the rubrics between and around the lines taken;
- the GIRM sentences the bases quote, in the saved copies;
- each frame against its README template, with no figures on the objects;
- no `box`, `feast` or `proper`;
- the initials and the white-and-gold priest;
- the ten items against the catalog order after batches 45–47;
- ids against `content/saints/` and every batch;
- each `catalogMatch`, by `accept-batch.py`'s rule as written and as intended (see Decision 8).

It prints OK, with one NOTE about `altar`.

**No `feast`, no `proper`.** A part of the Mass or an object has neither (README, "Before cards without a fixed date ship").

**No `box`.** The README's object variant, like the Mass variant, sets only `FRAME`; `BOX` is for the seasons. The objects keep the default box, like the Mass parts of batches 45–48 and the `x_chalice` test draft.

**Sources consulted**, saved in `consult/batch-48/`:
- The GIRM (USCCB edition), chapter 2 (`girm-en-ch2.*`, copied from batch 47). No. 43 gives the postures, including the US kneeling until after the Amen and after the Agnus Dei. It also has 79h (the doxology), 81 (the Lord's Prayer), 82 (the Rite of Peace), 83 (the Fraction), 84–86 (Communion), 88–89 (the silence and the Prayer after Communion) and 90 (the Concluding Rites).
- Chapter 4 (`girm-en-ch4.*`, copied from batch 47): 117–118 (the white cloth; the Missal by the chair, the Lectionary at the ambo, the Communion-plate), 151–155, 160–161, 163–165 and 167–169.
- Chapter 5 (`girm-en-ch5.*`, downloaded now): 295–309 (the sanctuary, the altar and its ornamentation, the ambo).
- Chapter 6 (`girm-en-ch6.*`, downloaded now, for the object cards of later batches).
- In the repo: `content/of/order/order-of-mass.json` (`order.our-father`, `order.sign-of-peace`, `order.agnus-dei`, `order.communion-silent`, `order.simple-blessing`, `order.dismissal`, and `eucharisticPrayers` → `order.eucharistic-prayer.2`), `content/of/formularies/tempore/ordinary-time/week-{3,27}/sunday.json` and `content/of/formularies/tempore/lent/week-3/sunday.json`.

## Decisions

1. **Where the excerpts come from.** The seven parts that have their own words in the Order of Mass take them from there:
   - the doxology and Amen of Eucharistic Prayer II;
   - the opening of the Our Father;
   - the greeting of peace and its reply;
   - the last Agnus Dei;
   - "The Body of Christ. Amen.";
   - the simple blessing;
   - the Dismissal.

   The Prayer after Communion is a proper. It takes the Twenty-Seventh Sunday's ("so as to be transformed into what we consume" / "sejamos transformados naquele que comungamos"), whose two languages say the same thing, without "Through Christ our Lord".
2. **Excerpts for the objects.** The brief allows "the words of the Mass in which it is used, or Scripture".
   - **The Altar** takes Psalm 84:4, the Communion Antiphon of the Third Sunday of Lent: "by your altars, O Lord of hosts, my King and my God". It is Scripture sung at the Mass, and it names the altar in both languages. The Roman Canon's "participation at the altar" was the other candidate, but it is only in Eucharistic Prayer I and is much longer.
   - **The Ambo** takes Nehemiah 8:4, "Ezra the scribe stood on a wooden dais erected for the purpose", from the First Reading of the Third Sunday, Year C. This is Ezra's public reading of the Law, the ambo's scriptural type.
3. **Edits to the source text, all named in `excerptSource`.**
   - The pt-BR blessing is verbatim, without a comma after "todo-poderoso", as the app ships it.
   - The Dismissal takes the third formula ("Go in peace, glorifying the Lord by your life" / "Ide em paz, e glorificai o Senhor com vossa vida"), because it is the pair that says the same thing in both languages. The source prints ", alleluia, alleluia" inline in the en-US formula and in both replies, and the build drops it: the card is not an Easter card.
4. **Ad orientem at the altar, from behind or in profile.** This follows batches 44–47. The priest faces the people in three places, and each is handled differently:
   - **Blessing** (GIRM 167): he is seen from behind, from the altar side.
   - **Dismissal** (GIRM 168): the view is from outside the west doors, and he is far and very small, "his features too distant to see". This is the one card where he faces the viewer. If that breaks the convention, turn the card so it is seen from the side of the sanctuary in profile.
   - **Prayer after Communion** (GIRM 165: at the chair or the altar, "facing the people" for Let us pray): he is at the chair at the side of the sanctuary, in profile, as on batch 46's `collect`.
5. **Postures follow the USCCB GIRM 43.**
   - The people kneel for the Doxology until after the Amen.
   - They stand for the Lord's Prayer, the Sign of Peace and the Agnus Dei. The US kneeling comes after the Agnus Dei, so the Fraction card doesn't show the people.
   - They stand to receive Communion, bowing the head before the Sacrament (GIRM 160).
   - They stand for the Prayer after Communion, the Blessing and the Dismissal.
6. **Communion** is under the one kind, given by the priest; no extraordinary ministers and no chalice. The communicant receives on the tongue, and a server holds the Communion-plate, which GIRM 118c has prepared "for the Communion of the faithful". The next communicant bows (GIRM 160). The GIRM allows the hand as well; the tongue together with the plate makes the gesture legible in a small picture.
7. **The Sign of Peace** is a handshake with a slight bow, between neighbours only (GIRM 82: "in a sober manner … only to those who are nearest"). The GIRM leaves the form to the conference. The priest gives the peace to a server and stays in the sanctuary (GIRM 154).
8. **catalogMatch `Altar`: `accept-batch.py` will stop on it.** The inline rule in `accept-batch.py` tests `l[k + len(item):].startswith(end)` for `end` in `("", " ·", " —", ";", ",")`. `startswith("")` is always true, so any inline line that holds `[ ] Altar` qualifies. The Other line holds `[ ] Altar bells`, so the item matches two lines, 626 and 629, and accept stops with "matched 2 unticked lines". Every other item matches one line. Two of them are the last box on their line when their turn comes: `Prayer after Communion` and `Dismissal`. The inline rule skips them, since the line then has only one `[ ]`, but the fallback finds exactly one line for each.

   **Fix before accepting batch 48:** make the empty end mean end of line, e.g. `rest == "" or rest.startswith((" ·", " —", ";", ","))`. `build.py` checks both the intended rule (OK) and the current one (the NOTE).
9. **Ids.** Five ids differ from the plain catalog word:
   - `holy_communion`, because `communion` is too generic an image stem;
   - `final_blessing`, because `blessing` is too generic;
   - `doxology_amen`;
   - `lords_prayer`;
   - `agnus_dei`, the chant, since the catalog item joins it to the Fraction.

   The others are `sign_of_peace`, `prayer_after_communion`, `dismissal`, `altar` and `ambo`. All are unique against `content/saints/` and every batch.
10. **Names.** The catalog's names in en-US ("The Lord’s Prayer" with the typographic apostrophe, as the Order of Mass titles it; its initial skips "The" and is **L**). In pt-BR, the repo's labels where it has them: "Pai-Nosso", "Rito da Paz", "Comunhão", "Oração depois da Comunhão" (`structures/mass.ts`), "Bênção", "Despedida". Where it doesn't: "Doxologia e Grande Amém", "Cordeiro de Deus e Fração do Pão", "Altar", "Ambão".
11. **Objects keep to their own item.** The Altar card shows the altar bare but for its white cloth (GIRM 304, 306), with flowers set around it rather than on it (GIRM 305). The crucifix and the candles are left to the catalog's own "Altar crucifix and candles". The Ambo card holds a generic open book with no letters. It is not styled as the Lectionary or the Book of the Gospels, which have their own cards; if it reads as one of them, drop the book. The GIRM sets no material for the ambo. Stone keeps the ambo a fixed structure (GIRM 309, "a stationary ambo and not simply a movable lectern"). The wooden dais of the excerpt is its Old Testament type, not a description of it.

## Doxology and Great Amen (`doxology_amen`)

The long view from the back of the nave: the whole congregation kneeling, seen from behind. Far off, the priest at the high altar, from behind, lifts the paten with the Host and the chalice together (GIRM 151).

- Excerpt: "Through him, and with him, and in him, … for ever and ever. Amen." / "Por Cristo, com Cristo, e em Cristo, … por todos os séculos dos séculos. Amém."

## The Lord's Prayer (`lords_prayer`)

In a small village church, close behind a family standing in the second pew (a grandmother, a father, two children). Over their shoulders, the priest at the altar with hands extended, and the Host on the corporal (GIRM 81, 152).

- Excerpt: the opening, to "as it is in heaven" / "assim na terra como no céu".

## Sign of Peace (`sign_of_peace`)

At eye level from the central aisle: an old man and a young mother clasp hands with a slight bow, and a boy offers his hand to his grandfather. In the sanctuary, small, the priest gives the peace to a server (GIRM 82, 154).

- Excerpt: "The peace of the Lord be with you always. And with your spirit." / "A paz do Senhor esteja sempre convosco. O amor de Cristo nos uniu."

## Agnus Dei and the Fraction (`agnus_dei`)

Very close, over the priest's left shoulder: his hands break the Host above the paten, over the open chalice. A gilded relief of the Lamb of God is on the reredos above (GIRM 83, 155).

- Excerpt: "Lamb of God, you take away the sins of the world, grant us peace." / "Cordeiro de Deus, que tirais o pecado do mundo, dai-nos a paz."

## Communion (`holy_communion`)

From the side at the head of the aisle, looking along the procession. The priest in profile raises the host from a ciborium before an elderly woman, a server holds the Communion-plate, and the next communicant bows (GIRM 118, 160–161).

- Excerpt: "The Body of Christ. Amen." / "O Corpo de Cristo. Amém."

## Prayer after Communion (`prayer_after_communion`)

At an evening Mass, from far back in a side aisle, looking diagonally through the columns. The priest at the chair in profile has his hands extended while a server holds the Missal. The altar is cleared, and the people stand still (GIRM 163–165).

- Excerpt: the Twenty-Seventh Sunday's prayer, without its conclusion.

## Blessing (`final_blessing`)

From just behind the priest before the altar, looking down the nave. His left hand is on his breast and his right hand traces the cross over the standing people, with the west rose window at the far end (GIRM 167).

- Excerpt: "May almighty God bless you, the Father, and the Son, and the Holy Spirit. Amen." / "Abençoe-vos Deus todo-poderoso Pai e Filho e Espírito Santo. Amém."

## Dismissal (`dismissal`)

From the sunlit steps outside, through the wide-open west doors. The people stand inside, seen from behind, and far off, very small, the priest stands with his hands joined. Daylight pours up the aisle (GIRM 90c, 168). See Decision 4.

- Excerpt: "Go in peace, glorifying the Lord by your life. Thanks be to God." / "Ide em paz, e glorificai o Senhor com vossa vida. Graças a Deus."

## Altar (`altar`)

A still life in the quatrefoil: a free-standing altar of pale natural stone under a white linen cloth, with nothing on it. Low vases of white lilies stand on the floor at either side (GIRM 296–306).

- Excerpt: Psalm 84:4, the Third Sunday of Lent's Communion Antiphon, first sentence.

## Ambo (`ambo`)

A still life in the quatrefoil: a fixed stone ambo on a low step, with a carved cross on its front and a large red-bound book open on its desk, pages without letters (GIRM 309).

- Excerpt: Nehemiah 8:4, "Ezra the scribe stood on a wooden dais erected for the purpose." / "Esdras, o escriba, estava de pé sobre um estrado de madeira, erguido para esse fim."

## Look-alike risks

- **`final_blessing` against batch 46's `greeting`.** Both are seen from behind the priest, looking out over the people:
  - `greeting` is at the chair, with his arms wide;
  - `final_blessing` is before the altar on the central axis, one hand raised in the cross, with the rose window at the end of the nave.

  If they blur, drop the rose window for a full-length nave with open doors.
- **`final_blessing` against `dismissal`.** They are mirror views of the same nave: from the sanctuary toward the west wall, and from outside the west doors toward the altar.
- **`doxology_amen` against batch 45's `entrance`.** Both look down the nave from the back. The Entrance is a procession in the aisle; the Doxology is a full kneeling church with the vessels raised far off.
- **`agnus_dei` against batch 47's `epiclesis` and `preparation_of_gifts`.** All three are close at the altar:
  - `epiclesis` is over the right shoulder, hands palms down, with the dove window;
  - `preparation_of_gifts` is in profile, the paten slightly raised;
  - `agnus_dei` is over the left shoulder, closest of the three, the Host broken in two, with the Lamb relief.
- **`lords_prayer` against batch 47's `mystery_of_faith`.** Both show the faithful in the foreground:
  - `mystery_of_faith` shows them kneeling, in profile, in a side aisle of a large church;
  - `lords_prayer` shows them standing, from behind, on the central axis of a small whitewashed church.
- **`prayer_after_communion` against batch 46's `collect`.** Both have the priest at the chair with his hands extended. The Collect is close and in profile; this card is far, diagonal, through columns, with evening light.
- **`altar` against the later "Altar crucifix and candles" card**, and **`ambo` against the later "Lectionary" and "Book of the Gospels" cards.** See Decision 11.
