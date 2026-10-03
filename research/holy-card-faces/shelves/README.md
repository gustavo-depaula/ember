# Shelving each holy card

The album shows the cards on shelves, in the order of the Litany of the Saints
(the Roman Missal's, as sung at the Easter Vigil). Each saint or feast card
names its shelf in a `shelf` field, and says whether it honours more than one
person (`several`). Cards with a `kind` (seasons, parts of the Mass, objects,
Rosary mysteries) are shelved by their kind and need neither.

## Shelves, in order

| shelf | heading | what goes there |
|---|---|---|
| `lord` | Our Lord | Feasts and mysteries of Christ and of the Holy Trinity: the Nativity, Circumcision, Holy Name, Epiphany, Baptism, Presentation, Transfiguration, the Holy Cross (its finding and exaltation), the Sacred Heart, the Holy Face, Christ the King, Corpus Christi, the Trinity, Pentecost, the Holy Family. |
| `lady` | Our Lady | Feasts, mysteries and titles of the Blessed Virgin Mary (Annunciation, Visitation, Assumption, Our Lady of Lourdes, of Aparecida, Undoer of Knots…). |
| `angels` | The Angels | Michael, Gabriel, Raphael, the Guardian Angels, the Apparition of St. Michael. |
| `patriarchs` | Patriarchs and Prophets | Saints of the Old Covenant and its threshold: John the Baptist (and his beheading), Joseph, Joachim and Anne, Zachary and Elizabeth, Simeon, Abraham, the prophets, the Maccabees. |
| `apostles` | Apostles and Disciples | The Twelve, Paul, the evangelists Mark and Luke, and the Lord's own disciples in the New Testament (Mary Magdalene, Martha, Mary and Lazarus, Barnabas, Timothy and Titus…). Their other days go with them (the Conversion of Paul, the Chair of Peter, St. Peter's Chains, St. John before the Latin Gate). |
| `martyrs` | Martyrs | Anyone venerated as a martyr, whatever else they were (a martyred pope, bishop, priest, nun or layman goes here), except the Apostles and John the Baptist. Stephen, the Holy Innocents, the Forty Martyrs, the Finding of St. Stephen's Relics. |
| `bishops` | Pastors and Doctors | Popes, bishops, and the Fathers and Doctors of the Church who were not martyrs. A priest, monk or friar who is a Father or Doctor (Jerome, Bede, Aquinas, Bonaventure, John of the Cross) goes here. Women Doctors go to `religious`, as in the Litany. |
| `religious` | Priests and Religious | Priests and deacons, monks and hermits, nuns and sisters, founders and foundresses of orders and congregations, and the women Doctors (Teresa of Ávila, Catherine of Siena, Thérèse, Hildegard). |
| `laity` | Holy Men and Women | Lay saints: kings and queens, mothers, fathers, spouses, widows who never took vows, youths, tertiaries and members of lay associations (Rose of Lima, Pier Giorgio Frassati, Gianna Molla, Louis and Zélie Martin). |
| `church` | The Church | Feasts of the Church itself rather than of one person: dedications of basilicas, the Holy Relics, All Saints, All Souls. |

When a saint fits several, take the first that applies in this order: `lord`,
`lady`, `angels`, `patriarchs`, `apostles`, `martyrs`, `bishops`, `religious`,
`laity`, `church`. A martyred bishop is a martyr; a bishop who founded an
order is a pastor; a widow who founded an order and took vows is religious.

`several` is `true` when the card honours more than one person by name or
number ("Sts. Cosmas and Damian", "St. Denis and Companions", "The Forty
Martyrs", "The Holy Innocents", "Sts. Martha, Mary and Lazarus"). It is
`false` for one person, and for a feast or mystery (the Visitation, All Saints).

## Where to look

- `content/practices/saint-of-the-day/data/holy-cards/<id>.json`: the card (name, patronage line, `lifeChapter`).
- `content/books/pictorial-lives-of-saints/en-US/<lifeChapter>.md`: the life, when the name doesn't settle it (was he a martyr? a bishop? did she take vows?).
- Your own knowledge of well-established hagiography for saints with no chapter. If still unsure, pick the best fit and say so in the reason.

## Output

For batch `N`, the card ids are in `shelves/batch-N.cards`. Write
`shelves/batch-N.tsv`, one line per card in the batch's order, tab-separated:

    <id>	<shelf>	<true|false>	<short reason, only when not obvious from the name>

No header line. Do not edit card files and do not commit.
