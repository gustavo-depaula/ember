# Batch 15: All Saints to Pentecost

All Saints, All Souls, the Lateran, the basilicas of Sts. Peter and Paul, Mary Mother of God, the Holy Family, the Baptism of the Lord, Easter, the Ascension, Pentecost. All are scenes. This is the first batch to paint the adult Christ: his line is now in `batches/recurring-figures.md`, taken from `transfiguration` (the only card that shows him grown), with a note keeping him apart from St. Joseph and St. John the Baptist. Peter and John, who recur at the Ascension and Pentecost, got a line there too, from the `peter` and `john_evangelist` cards. Excerpts were checked with `consult/batch-15/verify.py`: all twenty are verbatim, only a final full stop added where a clause was cut.

Moveable, so `feast` is omitted: the Holy Family, the Baptism of the Lord, Easter, the Ascension, Pentecost. Mary Mother of God keeps its fixed 1 January (the catalog lists it under "Moveable", but its date never moves); it shares the day with batch 14's `circumcision`.

## All Saints

The multitude of Revelation 7:9 "before the throne and before the Lamb", which the formulary's description quotes: the Lamb on the mount of the four rivers (Ghent Altarpiece), the saints on tiers of cloud around him (Fra Angelico's Fiesole predella, Dürer's Landauer Altarpiece). Our Lady nearest the Lamb, Peter and Paul with keys and sword, then martyrs, virgins, a bishop, a king, a friar, a mother, and faces from every continent, each described so the crowd isn't cloned.

- Excerpt: 11-01 communion antiphon, the first beatitude.

## All Souls' Day

Both images the brief allows, kept gentle: a churchyard at dusk with candles, chrysanthemums and plain wooden and stone crosses (no inscriptions), a widow and her son at prayer; above, in the sunset glow, an angel leading a soul out of low rose-gold light while others wait with joined hands. No skulls, no torment. If it is too crowded, drop the upper half and keep the churchyard with the angel only as light.

- Excerpt: 11-02 communion antiphon, first sentence (Jn 11:25).

## The Dedication of the Lateran Basilica

The east façade by Alessandro Galilei (1735): a giant order of Corinthian pilasters and half-columns, the portico and benediction loggia, and fifteen colossal statues on the balustrade — Christ the Saviour between St. John the Baptist and St. John the Evangelist, and the Doctors of the Church (the basilica's own website and guides). One Wikipedia summary claimed "the twelve Apostles" on the roofline; that is the interior niches, and the basilica's site settles it. The frieze inscription is left out. Small pilgrims and a priest on the steps give the scale.

- Excerpt: 11-09 communion antiphon (1 Pt 2:5).

## The Dedication of the Basilicas of Sts. Peter and Paul

The two basilicas are miles apart, so the card shows the two Apostles side by side, each carrying a model of his church, the founder-with-model convention: Peter with St. Peter's (Michelangelo's dome, Maderno's façade), Paul with St. Paul Outside the Walls (long roof, gold-mosaic gabled façade, campanile, quadriportico with palms). Faces and dress as on `peter` and `paul`, Paul's mantle deep red. Rome along the Tiber behind them.

- Excerpt: 11-18 communion antiphon (Jn 6:68), first clause; `peter` uses Jn 21:17 and `paul` 2 Tm 4:7.

## Mary, Mother of God

To stay apart from the manger of `nativity_christ`, the enthroned Child of `epiphany` and the Bethlehem house of `circumcision`, the card shows the embrace of the Theotokos of Vladimir (Eleousa), cheek to cheek, painted in the card's own style, in the Bethlehem stable at dawn. The Child is eight days old: the solemnity is the octave day.

- Excerpt: the day's gospel, Lk 2:19, one sentence verbatim in both languages ("As for Mary, she treasured…" / "Quanto a Maria, guardava…"). The antiphons speak of Christ, not of her.

## The Holy Family

The hidden life at Nazareth: Joseph at his bench with a plane, the boy Jesus about seven carrying a plank, Mary spinning, a white dove on the sill (a nod to Murillo's Holy Family with a Little Bird). Seven is between the "about three" of `holy_name_jesus` and the twelve of the Finding in the Temple (batch 17); Mary is given as about twenty-five.

- Excerpt: communion antiphon, whole (Bar 3:38). The entrance antiphon (the shepherds at the manger) would fit a Nativity, not Nazareth.

## The Baptism of the Lord

After Verrocchio and Leonardo's Baptism (Uffizi): Christ waist-deep, hands joined; John pouring from a shell; two angels holding his garments; the heavens open and the dove. John keeps the `john_baptist` face; the face line spells out how he differs from Christ, since the `john_baptist` card itself leans toward the Christ type.

- Excerpt: communion antiphon (Jn 1:32, 34), whole; the entrance antiphon ends with "This is my beloved Son", too close to `transfiguration`'s excerpt.

## Easter Sunday

The risen Christ with the banner of victory before the open tomb, the angel on the stone, the guards asleep and turned away, Jerusalem at dawn (Carl Bloch's Resurrection, and the general Western type). Wounds only as small clean marks.

- Excerpt: entrance antiphon of the Mass during the Day, first sentence (Lk 24:34).
- This card shares the Glorious mystery "The Resurrection" (the catalog line says "shares Easter Sunday").

## The Ascension of the Lord

Christ on a cloud above the Mount of Olives, blessing; below, Our Lady at about fifty in the centre, Peter left, John right, three other Apostles described apart, and the two angels of Acts 1:10 (Giotto's Ascension, Scrovegni Chapel). Formulary: `tempore/easter/week-6/thursday/b.json` (a.json is the weekday).

- Excerpt: entrance antiphon, first sentence (Acts 1:11).

## Pentecost

The Upper Room with Our Lady at the centre (Acts 1:14, El Greco's Pentecost), a tongue of fire over every head, the dove above her, Peter and John beside her, four other Apostles described apart.

- Excerpt: communion antiphon, whole (Acts 2:4, 11).

## Doubts and look-alike risks

- **Pentecost's catalogMatch cannot be unique.** Its line is `- [ ] Pentecost`, and `- [ ] Pentecost Ember Days · …` (line 580) contains every substring of it, so `accept-batch.py` will stop with two matches. Before accepting, either tick line 525 by hand, or have the catalog line read, say, `- [ ] Pentecost Sunday` (then catalogMatch `Pentecost Sunday`). The Glorious mysteries (Resurrection, Ascension, Descent of the Holy Spirit) and the Luminous "Baptism in the Jordan" say "shares …": `accept-batch.py` does not tick those items, so they need ticking by hand when these cards are accepted.
- Christ's line is the traditional long-haired bearded type, which the brief avoids for saints; here it has to be that type, since `transfiguration` already shows him so. Watch for St. Joseph (`holy_family`) and St. John the Baptist (`baptism_lord`) drifting toward his face on the same card.
- `all_saints`, `ascension` and `pentecost` are crowded; the model may repeat one face across the Apostles or the saints. Check Peter (grey, square beard) and John (beardless, young) above all.
- `mary_mother_of_god` against `nativity_christ` and `epiphany`: the embrace has to read clearly, not just "Mary holding the baby".
- `basilicas_peter_paul` against `peter`: same face and colours by design; the models of the two churches are what set the card apart. The models must not look like the St. Peter's background of `peter`.
- `lateran_basilica` has no principal face; the fifteen statues may come out as a row of vague figures, which is acceptable.
