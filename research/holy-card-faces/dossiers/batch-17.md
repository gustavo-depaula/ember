# Batch 17 — titles of Our Lady and four Rosary mysteries

Ten scene cards: six of Our Lady (`our_lady_mercy`, `our_lady_rosary`, `loreto`, `guadalupe`, `immaculate_heart`, `mother_of_church`) and four mysteries (`finding_temple`, `wedding_cana`, `proclamation_kingdom`, `institution_eucharist`). Christ, Our Lady, the Christ Child, St. Joseph, Peter and John use their lines from `recurring-figures.md`. I added one line there, "The other Apostles", which points to the existing cards of Andrew, James the Greater, Thomas, Bartholomew and Matthew. Every excerpt was checked verbatim by script (case- and whitespace-insensitive) against its source file in both languages. Every catalogMatch hits exactly one unticked line or inline item of `docs/plans/holy-cards-catalog.md`.

**No `feast`** on `immaculate_heart` (the Saturday after the Sacred Heart), `mother_of_church` (Monday after Pentecost) or the four mysteries. They can't ship until `feast` is optional in the app (see `README.md`).

**Initials.** M for the titles "Our Lady of …" and for "Mary, Mother of the Church". I for the Immaculate Heart, because it is a feast named after something other than a title, like `holy_name_mary` (H) and `queenship` (Q) in batch 16. The mysteries take F, W, P and I.

## The Blessed Virgin Mary of Mercy (24 Sep, Pictorial Lives)

This is the Mercedarian image as fixed from the sixteenth century (es.wikipedia "Virgen de la Merced"; Museo del Carmen Alto). Our Lady wears the Order's all-white habit, scapular and mantle, with the Order's shield on her breast: a white cross on red over the bars of Aragon. She has a crown and a sceptre and holds out a small scapular. She spreads her mantle over three kneeling captives, with broken chains at their feet. The background is the harbour of Barcelona, where the Order was founded. The shield is heraldry, not lettering, but the review should reject any letters that creep in. Her face follows the set, with a white veil instead of the blue.

- Name as the book gives it: "The Blessed Virgin Mary of Mercy" / "Santíssima Virgem Maria da Mercê" (I dropped the pt-BR article).
- Excerpt: the second sentence of the book's reflection for 09-24, in both languages.

## Our Lady of the Rosary (7 Oct)

Our Lady is enthroned on cloud with the Child, and both hold out rosaries to St. Dominic, who kneels. This is Sassoferrato's composition at Santa Sabina and the common type of the feast. The landscape is Prouille. Dominic's face line is my description of the `dominic` card, which has no `meta.face`: a gentle oval face, a tonsure with a ring of short brown curls, a short trimmed brown beard.

- Excerpt: the first clause of the entrance antiphon (the Hail Mary).

## Our Lady of Loreto (10 Dec)

The Holy House is borne through the night sky over the Adriatic by four angels, with Our Lady and the Child seated on its roof. The laurel wood where it lands is below. This follows the Translation paintings (the Met's panel attributed to Saturnino Gatti, Tiepolo's lost Scalzi ceiling, Getty study). I did not use the shrine's black statue, because the task asks for the house borne by angels. Our Lady has the set's face.

- Excerpt: a self-contained phrase of the collect, "chose the Blessed Virgin Mary to become the Mother of the Savior" / "escolhestes a Santa Virgem Maria para ser a Mãe do Salvador".

## Our Lady of Guadalupe (12 Dec)

The tilma image alone, painted faithfully and without lettering:

- Our Lady stands with her head inclined to her right, eyes lowered and hands joined, with olive skin.
- She wears a rose tunic with a gold floral pattern, a dark sash high at the waist and a small cross brooch.
- Her blue-green mantle has gold stars and a gold border.
- She stands on a crescent moon held by an angel with green, white and red feathered wings, inside a golden sunburst edged with cloud.

These details are from Wikipedia's description, which I checked against the Commons photograph. The face is the image's own, not the set's, as the brief directs for a Marian title. Juan Diego is left out, because the `juan_diego` card already shows him unfolding the tilma with this image on it.

- Excerpt: the formulary has no antiphons, and its collect differs between en-US and pt-BR. I used the gospel acclamation verse, without the Alleluias. **The two languages have different verses**: en-US "Happy are you, holy Virgin Mary…", pt-BR "Maria, alegra-te, ó cheia de graça…". Each is verbatim from its own lectionary, but they are not translations of each other. If a matching pair is wanted, the Hail Mary clause of `our_lady_rosary` or a line from the Common of the BVM would do, at the cost of repeating.

## The Immaculate Heart of Mary (moveable)

Our Lady is shown half-length, indicating her heart on her breast. The heart is wreathed with white roses, has a small flame above it and is ringed with rays. It has no sword and no thorns, to keep it apart from `our_lady_sorrows` and its seven swords. The background is an enclosed garden (hortus conclusus) with lilies, roses and a fountain, and the hills of Galilee beyond.

- Excerpt: communion antiphon (Lk 2:19), whole.

## Mary, Mother of the Church (moveable)

The Mass is built on Jn 19:25-27 (collect, gospel and communion antiphon). The card paints the moment after it: John takes Our Lady home, one arm around her shoulders. The crosses of Golgotha are small, bodiless silhouettes at dusk. I passed over the Cenacle of Acts 1:14 (the entrance antiphon) because `pentecost` already shows Our Lady among the Apostles in the Upper Room. Batch 18's `crucifixion` will likely show Mary and John at the Cross, so this card keeps the Cross far off and the two of them walking away, close up.

- Name tidied from the catalog: "Mary, Mother of the Church" / "Maria, Mãe da Igreja".
- Excerpt: communion antiphon, whole.

## The Finding in the Temple — fifth Joyful Mystery

The boy Jesus at twelve sits among three teachers in a Temple colonnade, while Mary and Joseph arrive at the left. His face is the Child's face lengthened, with curls to the neck, as recurring-figures.md prescribes. Mary is about thirty. The teachers are deliberately varied: long and narrow, broad and square, triangular.

- The pt-BR name follows `content/practices/rosary`: "A Perda e o Encontro de Jesus no Templo".
- Excerpt: the Gospel of the Holy Family, Year C (Lk 2:46a), "Three days later, they found him in the Temple" / "Três dias depois, o encontraram no Templo". This is formulary text, not the repo Bible. I preferred it to v. 49 because the two lectionaries translate v. 49 differently ("busy with my Father's affairs" / "na casa de meu Pai").

## The Wedding at Cana — second Luminous Mystery

Our Lady speaks to a servant and points to her Son. Christ blesses the six stone jars while a servant pours out red wine. The steward tastes it, and the bride and groom sit at the table. The disciples are left out so the window stays legible. Mary is about forty-six, the set's face matured.

- Excerpt: Sunday 2 of Ordinary Time, Year C gospel (Jn 2:5), "Do whatever he tells you" / "Fazei o que ele vos disser".

## The Proclamation of the Kingdom — third Luminous Mystery

Christ preaches on a grassy rise by the Sea of Galilee. Peter and Andrew listen with a net, beside a mother with a child, a shepherd and a boy, with boats on the shore (Mk 1:14-20). Andrew's face comes from his card: seventy, with a forked grey beard.

- Excerpt: Sunday 3 of Ordinary Time, Year B gospel (Mk 1:15), "The kingdom of God is close at hand. Repent, and believe the Good News." / "O Reino de Deus está próximo. Convertei-vos e crede no Evangelho!" The en-US text is interrupted by "he said" earlier in the verse, so the excerpt starts after it.

## The Institution of the Eucharist — fifth Luminous Mystery

The Last Supper at the blessing of the bread, not the betrayal: Christ raises a plain unleavened loaf over a gold cup. John leans against him, Peter bends forward, and Andrew, James, Thomas and Bartholomew sit along the table as on their cards. The bread has no symbols on it.

- Excerpt: the Palm Sunday Passion, Year C (Lk 22:19), "This is my body which will be given for you; do this as a memorial of me" / "Isto é o meu corpo, que é dado por vós; fazei isto em memória de mim." Palm Sunday reads this Gospel. Corpus Christi Year B's Mk 14:22 was the alternative, but its en-US text is broken by "he said".

## Look-alike risks that remain

- The four Marian cards with the set's young face (`our_lady_mercy`, `our_lady_rosary`, `loreto`, `immaculate_heart`) are meant to share one face. They are told apart by dress (white Mercedarian habit; rose and blue with a crown; on a flying house at night; white gown with the heart) and by setting.
- `immaculate_heart` is half-length with a heart on the breast, like `our_lady_sorrows` and `sacred_heart`. It differs by the roses and flame (no swords), the white gown and the garden. Watch that the model doesn't add a sword.
- `our_lady_rosary` and `mount_carmel` share a composition (Our Lady and the Child on cloud giving an object to a kneeling friar). The black-and-white Dominican against the brown Carmelite, and the rosary against the scapular, must carry the difference.
- `guadalupe` against `juan_diego`: the same image, but here with no man, filling the window.
- `mother_of_church` against batch 18's `crucifixion`: keep the crosses small and far off.
- `institution_eucharist` against `corpus_christi`: the first is a supper scene, the second a street procession, so there is little risk. Dominic on `our_lady_rosary` and James on `institution_eucharist` both have short brown beards; they don't share a card.
