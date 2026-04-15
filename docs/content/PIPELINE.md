# Salty — Content Pipeline

The Catholic literary tradition — Sacred Scripture, the Church Fathers, spiritual classics, catechisms, liturgical books, sacred art — belongs to the whole Church and to all of humanity. Salty exists to preserve, translate, and freely distribute these treasures, overcoming the language barriers, copyright restrictions, and practical obstacles that keep them hidden and fragmented.

This page tracks every work in our pipeline: what we've published, what we're working on, and what's coming next. This is the work that [your support](https://github.com/sponsors/gustavo-depaula) makes possible.

## How You Can Help

### Fund the Work

Every donation directly funds sourcing, translating, and preserving Catholic texts that have been locked away by language barriers or lost in out-of-print editions. These works belong to the whole Church — your support keeps them free, open, and beautiful.

[Sponsor on GitHub](https://github.com/sponsors/gustavo-depaula)

### Suggest a Book

Know a spiritual classic, Church Father, devotional work, or liturgical text that should be preserved and translated? [Open an issue](https://github.com/gustavo-depaula/ember/issues/new) and tell us about it — what the work is, why it matters, and what public domain editions exist.

### Contribute a Translation

If you're fluent in a language and passionate about making these texts accessible, you can help translate a work in progress. Check the [In Progress](#in-progress) section above for what currently needs translation, and see our [contributing guide](../../CONTRIBUTING.md) for how to get started.

### Run the Pipeline

Our sourcing, translation, and review workflows are built as **Claude Code skills** — structured, repeatable AI-assisted pipelines that anyone can run locally with their own API tokens. If you have access to [Claude Code](https://docs.anthropic.com/en/docs/claude-code), you can directly contribute by running these skills on a work from the pipeline. Each run produces structured, auditable output that gets committed to the repo. This is one of the most impactful ways to contribute — every run moves a work forward.

**The three skills:**

1. **`/import-book`** — Sources a public domain text from the web, downloads it, structures it into chapters, and creates the book manifest. The skill finds the best available edition online (preferring HTML text sites like livres-mystiques.com, sacred-texts.com, wikisource), downloads the raw text as an archival `.txt` file, then splits and cleans it into markdown chapters preserving the author's original structure. Output: a complete book directory with `book.json` metadata, raw source archive, and one `.md` file per chapter.

2. **`/translate-book`** — Translates a book from its original language into a target language. Works one chapter at a time in TOC order, maintaining a **translation journal** alongside the chapters — a running glossary of key terms and translation decisions that ensures consistency across the entire work (e.g., how to render "grâce" consistently, whether to keep Latin inline or footnoted). The original language is always canonical: translations derive from the source, never from another translation. Output: a complete language directory with translated `.md` chapters and a translation journal.

3. **`/review-book-translation`** — Audits translations across all languages for completeness and objective defects. The review is mechanical and exhaustive — it checks every file, not a sample. It verifies: same number of sections and paragraphs per chapter, no missing content, inline Latin quotes preserved, Scripture references correct per language convention, editor footnotes removed, author footnotes kept, heading hierarchy consistent, encoding correct (Portuguese diacritics, etc.). Output: a defect report organized by type, followed by automated fixes where possible.

**How to run them:**

1. Fork the repo and clone it locally
2. Install [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (requires a Claude API key or Claude Pro/Max subscription)
3. Open the repo in Claude Code
4. Pick a work from the [In Progress](#in-progress) or [Tier 1](#tier-1--building-next) sections
5. Run the appropriate skill: type `/import-book`, `/translate-book`, or `/review-book-translation` and follow the prompts
6. The skill handles the rest — downloading, structuring, translating, or reviewing — producing clean, committable output
7. Open a PR with the results

Each skill uses background agents to parallelize work (e.g., one agent per chapter for cleaning or translation), so a full book translation can complete in a single session. The translation journals and review reports ship with the work, so every decision is auditable and improvable by future contributors.

### Review a Translation

Reviewing existing translations for accuracy, completeness, and faithfulness to the original is one of the most valuable contributions. Even catching a single error in a Latin quotation or Scripture reference helps preserve the integrity of these texts for everyone who reads them.

---

### A Note on Copyright

We only source and distribute texts that are in the **public domain** — works whose copyright has expired, typically because they were written before the early 20th century. This is both a legal necessity and a principled choice: we believe the fruits of Catholic tradition should be freely available to all, without artificial barriers of intellectual property.

This means some important modern works are out of reach. For example, St. Faustina's *Diary* (written in the 1930s, first published in 1981) remains under copyright despite being central to the Divine Mercy devotion. The same is true for many 20th-century encyclicals, liturgical translations (ICEL), and contemporary spiritual writings. Where a copyrighted work is central to a devotion, we build libraries around the **traditional prayers and formation content** that are freely available, and note the gap so users know what to seek out on their own.

Everything we produce — translations, formation chapters, structured data — is [dedicated to the public domain](../../LICENSE).

---

## How It Works

Every work moves through a five-stage pipeline:

```
📖 Source  →  🔍 Import  →  🌐 Translate  →  ✅ Review  →  📱 Published
```

1. **Source** — Find the best public domain edition of the original text. Many of these are 16th–19th century works in Latin, Italian, French, or Spanish, scattered across digital archives and out-of-print editions.

2. **Import & Structure** — Clean the text, structure it into chapters, add metadata. Preserve the author's original organization faithfully. The raw source text is archived alongside the structured output so future scholars can verify our work.

3. **Translate** — Produce faithful translations into English and Brazilian Portuguese, using AI structured skills and translation notes so we keep translation consistency throughout the book and auditability. The original language is always canonical: we never translate from a translation.

4. **Review** — Cross-language QA for completeness, consistency, and fidelity. We verify that structure, footnotes, Latin quotations, and Scripture references are preserved accurately across all languages.

5. **Publish** — Package into a downloadable library, available free in the Ember app for iOS, Android, and web. TBD: epub publishing.

Every translated work is open-source, on the public domain, and ships with its **translation journal** — a public record of terminology decisions and translation choices, so the community and scholars can verify and improve the work over time.

---

---

## Published

### Spiritual Classics

#### St. Alphonsus Liguori — Doctor of Prayer

*9 books from one of the greatest ascetical writers of the Church. Original language: Italian.*

St. Alphonsus Maria de Liguori (1696–1787) was a bishop, founder of the Redemptorists, and Doctor of the Church. His writings on prayer, devotion to the Blessed Virgin, and preparation for death have shaped Catholic spirituality for three centuries. He is among the most widely read spiritual authors in Brazil, where he is a household name.

| Book | Italian | French | English | Portuguese |
|------|:-------:|:------:|:-------:|:----------:|
| Visits to the Blessed Sacrament | OG | — | ✓ | ✓ |
| The Practice of the Love of Jesus Christ | OG | — | ✓ | ✓ |
| The Glories of Mary | OG | — | ✓ | ✓ |
| Preparation for Death | OG | — | ✓ | ✓ |
| Uniformity with God's Will | OG | — | ✓ | ✓ |
| The Great Means of Prayer | OG | — | ✓ | ✓ |
| Exercise of the Way of the Cross | OG | — | ✓ | ✓ |
| Meditações para todos os Dias e Festas do Ano | — | — | — | OG |
| Les Plus Belles Prières | — | OG | — | — |

Also includes: 1 guided practice (Visits to the Blessed Sacrament).

#### Montfort Spirituality — Total Consecration to Mary

*7 books from the apostle of Marian devotion. Original language: French.*

St. Louis-Marie Grignion de Montfort (1673–1716) was a French priest whose writings on devotion to the Blessed Virgin Mary have become foundational to Catholic Marian spirituality. His *True Devotion to the Blessed Virgin* inspired popes, saints, and millions of the faithful.

| Book | French | English | Portuguese |
|------|:------:|:-------:|:----------:|
| True Devotion to the Blessed Virgin | OG | ✓ | ✓ |
| The Secret of Mary | OG | ✓ | ✓ |
| The Secret of the Rosary | OG | ✓ | ✓ |
| Love of Eternal Wisdom | OG | ✓ | ✓ |
| Letter to the Friends of the Cross | OG | ✓ | ✓ |
| The Ardent Prayer | OG | ✓ | ✓ |
| Missionary Rules | OG | ✓ | ✓ |

Also includes: 33-day Total Consecration program, 1 formation chapter, 1 prayer.

### Prayer Collections

| Library | Description | Practices | Languages |
|---------|-------------|:---------:|-----------|
| **Catholic Daily Prayers** | The essential companion for daily prayer: morning and evening prayers, the Angelus, the Rosary, acts of faith/hope/charity, examination of conscience, and more. | 33 | English, Portuguese |
| **Catholic Devotions & Formation** | The Divine Office (Lauds, Vespers, Compline), novenas, and formation programs for deepening the spiritual life. | 18 | English, Portuguese |
| **Traditional Novenas** | Classic Catholic novenas for sustained devotional prayer, including the 54-Day Rosary Novena, novenas to the Sacred Heart, the Holy Spirit, and more. | 14 | English, Portuguese |
| **Catholic Litanies** | The approved and beloved litanies of the Catholic Church — ancient intercessory prayers invoking God's mercy through the saints. | 9 | English, Portuguese |

### Devotional Companions

| Library | Description | Content | Languages |
|---------|-------------|---------|-----------|
| **Sacred Heart Devotion** | Prayers, devotions, and teachings on the Sacred Heart of Jesus, including the Nine First Fridays program. | 4 practices, 5 chapters, 3 prayers | English, Portuguese |
| **Ave Maria — Padres Claretianos** | A traditional Brazilian devocionário with the principal prayers and exercises of piety for the Christian life. Based on the classic Claretian edition. | 8 practices, 3 chapters, 22 prayers | Portuguese |

---

## In Progress

### Alphonsus Liguori — Translation Review

Seven of the nine books have been translated into all three languages (Italian → English + Portuguese) and are awaiting a cross-language review pass. Two books still need translation work.

| Book | Status |
|------|--------|
| Visits to the Blessed Sacrament | Awaiting review |
| The Practice of the Love of Jesus Christ | Awaiting review |
| The Glories of Mary | Reviewed |
| Preparation for Death | Awaiting review |
| Uniformity with God's Will | Awaiting review |
| The Great Means of Prayer | Awaiting review |
| Exercise of the Way of the Cross | Awaiting review |
| Meditations for Every Day | Needs English translation |
| Les Plus Belles Prières | Needs English + Portuguese translation |

### Montfort Spirituality — Translation Review

All seven books have been translated from French into English and Brazilian Portuguese. The collection now needs a full review pass to verify that structure, footnotes, Latin quotations, and theological terminology are consistent and faithful across all three languages.

---

## Tier 1 — Building Next

### Divine Mercy

The most popular modern Catholic devotion. The chaplet and novena are already available as practices in the app; this library adds the formation and devotional content around them — a full companion in the style of Sacred Heart.

Unlike most of our libraries, this one is not anchored by a major book. St. Faustina's *Diary* (*Divine Mercy in My Soul*) is the foundational text of the devotion, but it remains under copyright — written in the 1930s, first published in 1981 by the Marian Fathers. Instead, this library is built around the traditional prayers (all public domain), original formation chapters, and sacred art.

**Base:**

| Component | Content |
|-----------|---------|
| Practices | Divine Mercy Chaplet (daily), Divine Mercy Novena (9-day program), 3 o'clock prayer, Act of Trust in Divine Mercy |
| Chapters | The Vilnius image and its symbolism, St. Faustina's life, The promises of Divine Mercy, Divine Mercy Sunday |
| Prayers | Chaplet prayers, novena day prayers, Litany of Divine Mercy |
| Art | Kazimirowski painting, Hyla image, Merciful Jesus iconography |

**Expansion:**

| Component | Content |
|-----------|---------|
| Chapters | The theology of mercy (from pre-copyright encyclicals and Church Fathers), The First Friday / First Saturday devotions and their connection to Divine Mercy, History of mercy in the Catholic tradition (Augustine, Aquinas, Catherine of Siena), Divine Mercy image variants and their veneration, How to live the message of Divine Mercy |
| Practices | First Saturday devotion, Novena of Chaplets (extended 9-day with meditations) |

- **Languages:** English, Brazilian Portuguese
- **Issues:** #48, #44

### Imitation of Christ — Thomas à Kempis

The most widely published book in Christianity after the Bible, written c. 1418 by Thomas à Kempis. A cornerstone spiritual classic that belongs in every Catholic library. Four books, approximately 114 short chapters — meditations on the interior life, humility, grace, and the Eucharist. Multiple excellent public domain translations exist in English, Portuguese, and the Latin original.

**Base:**

| Component | Content |
|-----------|---------|
| Book | Full Imitation of Christ (4 books, ~114 chapters) |
| Practice | Daily reading from the Imitation (cycle through short passages) |
| Chapters | About Thomas à Kempis, How to read the Imitation, The Devotio Moderna movement |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | The Spiritual Consolation — Thomas à Kempis (companion devotional work), The Soul's Soliloquy — Thomas à Kempis |
| Chapters | The Imitation through the centuries (its influence on saints and spiritual writers), A reader's guide to each of the four books, The Eucharistic spirituality of Book IV |
| Practice | Thematic reading tracks (humility, suffering, the Eucharist, detachment — curated paths through the 114 chapters) |

- **Languages:** Latin (original), English, Brazilian Portuguese
- **Issues:** #111

### Ignatian Spirituality

The Daily Examen is arguably the most widely practiced prayer form after the Rosary. The Ignatian tradition produced some of the richest spiritual literature in the Church — the Exercises themselves, but also a lineage of Jesuit classics on prayer, discernment, and abandonment to God's will. This library brings that full tradition to the app.

**Base:**

| Component | Content |
|-----------|---------|
| Books | The Spiritual Exercises — St. Ignatius of Loyola (1548), Autobiography of St. Ignatius (dictated to Luís Gonçalves da Câmara), Spiritual Diary of St. Ignatius |
| Practices | Daily Examen (5-step guided), Ignatian meditation (structured method with three preludes), Ignatian contemplation (imaginative prayer with Gospel scenes), Suscipe prayer, Anima Christi, First Principle and Foundation meditation |
| Program | Adapted 19th Annotation retreat (30-week Spiritual Exercises) |
| Chapters | Who was St. Ignatius?, AMDG and Finding God in All Things, Ignatian meditation vs. contemplation (two distinct methods), The Rules for Discernment of Spirits, Discernment of spirits primer |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | Abandonment to Divine Providence — Jean-Pierre de Caussade (18th c.), The Art of Dying Well — St. Robert Bellarmine, The Mind's Ascent to God — St. Robert Bellarmine, Practice of Perfection and Christian Virtues — Alphonsus Rodriguez, Meditations on the Mysteries of our Holy Faith — Luis de la Puente |
| Practices | Particular Examen (focused on one fault/virtue), Prayer of the Two Standards, Contemplation to Attain Love, The Daily Offering (Apostleship of Prayer tradition) |
| Chapters | The Jesuit spiritual tradition (from Ignatius to the present), Caussade and the sacrament of the present moment, Bellarmine on the last things, The Ignatian approach to Scripture |

- **Languages:** English, Brazilian Portuguese
- **Issues:** #96, #116

---

## Tier 2 — Building Soon

### Carmelite Spirituality

The Carmelite tradition is the Church's great school of contemplative prayer. Two Doctors of the Church — St. Teresa of Ávila and St. John of the Cross — produced some of the deepest mystical literature ever written, mapping the soul's journey from first conversion to transforming union with God. Excellent public domain translations exist (E. Allison Peers, David Lewis).

**Base:**

| Component | Content |
|-----------|---------|
| Books | Interior Castle — St. Teresa of Ávila (the seven mansions of the soul), Dark Night of the Soul — St. John of the Cross, Way of Perfection — St. Teresa of Ávila |
| Practices | Carmelite method of mental prayer, Brown Scapular daily prayer, Prayer of St. Teresa ("Let nothing disturb you") |
| Chapters | The Carmelite Doctors, Stages of the spiritual life, The mansions explained, Contemplative prayer for beginners |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | Ascent of Mount Carmel — St. John of the Cross (companion to Dark Night), Spiritual Canticle — St. John of the Cross (mystical poetry with commentary), Living Flame of Love — St. John of the Cross, Life of St. Teresa of Ávila (her autobiography), The Book of Foundations — St. Teresa of Ávila, The Practice of the Presence of God — Brother Lawrence of the Resurrection |
| Practices | Lectio Divina (Carmelite tradition), Prayer of Recollection (Teresa's method), The Carmelite Night Prayer |
| Chapters | John of the Cross as poet (the original poems with commentary), Active vs. passive night (understanding the Ascent and Dark Night together), Teresa's four waters of prayer, Brother Lawrence and simplicity, The Carmelite Rule and its spirituality, Carmelite saints beyond Teresa and John (Thérèse, Elizabeth of the Trinity, Edith Stein) |
| Poetry | Complete poems of St. John of the Cross (Spiritual Canticle, Dark Night, Living Flame — the original Spanish with translations) |

- **Languages:** Spanish (original), English, Brazilian Portuguese
- **Issues:** #111, #98

### Eastern Catholic & Byzantine Spirituality

No Catholic prayer app serves Eastern Catholics well. This library fills that gap. These prayers are increasingly practiced by Latin-rite Catholics drawn to the Eastern tradition.

**Base:**

| Component | Content |
|-----------|---------|
| Books | The Way of a Pilgrim (19th c. Russian spiritual classic — the most accessible introduction to the Jesus Prayer and Eastern spirituality, public domain) |
| Practices | Jesus Prayer (with optional repetition counter/breathing guide), Trisagion, Eastern morning/evening prayers, Prayer of St. Ephrem (Lenten) |
| Hymns | Akathist Hymn to the Theotokos (the most famous Eastern hymn — 24 stanzas of praise to the Mother of God, sung standing), Cherubic Hymn, Phos Hilaron (O Gladsome Light — the oldest known Christian hymn outside Scripture) |
| Chapters | Eastern Catholic traditions, Icons and prayer (with gallery), Hesychasm explained, Unity in diversity — the 23 Eastern Catholic churches |
| Prayers | Troparion, Kontakion, prayers before icons |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | The Pilgrim Continues His Way (sequel — the pilgrim's further journey through Russia and deeper into the Jesus Prayer), The Philokalia (complete — the monumental 5-volume anthology of Eastern Christian mystical writings, 4th–15th century, on prayer, watchfulness, and the spiritual life; public domain) |
| Practices | Jesus Prayer with breathing rhythm (structured repetition), Byzantine Compline, Paraklesis to the Theotokos |
| Hymns | Akathist to the Sweetest Jesus, Akathist to the Holy Cross, Great Doxology, Hymn of Kassiani (the penitent woman — sung on Holy Wednesday, one of the most beautiful hymns in the Byzantine tradition), Axion Estin (It Is Truly Meet), Theotokion hymns (seasonal hymns to the Mother of God) |
| Chapters | The Philokalia — a reader's guide (navigating the 5 volumes, key authors: Evagrius, Maximus the Confessor, Gregory Palamas, Symeon the New Theologian), The theology of icons, Theosis — the Eastern understanding of sanctification, Byzantine liturgical spirituality, The tradition of the Akathist (history, structure, and the many Akathists composed over the centuries) |

- **Issues:** #93

### Rosary Companion

The Rosary already exists as a practice in the app, but it deserves its own rich library. The Rosary is the universal Catholic devotion — it deserves formation content as rich as what we give to Ignatian or Carmelite prayer.

**Base:**

| Component | Content |
|-----------|---------|
| Practices | Seven Sorrows Rosary, Franciscan Crown (7-decade) |
| Chapters | History of the Rosary, How to pray the Rosary well (formation guide), The 15 promises, The mysteries explained (with sacred art per mystery) |
| Art | Classic paintings for each of the 20 mysteries |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | The Secret of the Rosary — St. Louis de Montfort (already in Montfort library, cross-referenced here), The Rosary of Our Lady — Romano Guardini (d. 1968, copyright status to be verified) |
| Practices | Scriptural Rosary (with Bible passages per mystery), Rosary with Litany variations, Dominican method of Rosary meditation |
| Chapters | Rosary confraternities and their history, The mysteries through sacred art (gallery per mystery with context), Papal documents on the Rosary (Leo XIII's Rosary encyclicals are public domain), The Rosary in Brazil (Our Lady of Aparecida connection) |

- **Languages:** English, Brazilian Portuguese
- **Issues:** #45, #95

---

## Tier 3 — As the Catalog Grows

### St. Alphonsus Liguori — Expansion

The existing Alphonsus library already contains 9 books. Future expansion adds practices and formation content. Santo Afonso is a household name in Brazilian Catholicism — every addition here is high-impact content for Portuguese-speaking users.

**Base:**

| Component | Content |
|-----------|---------|
| Practices | Visit to the Blessed Sacrament (daily, with day-specific meditations), Liguorian morning/evening prayers, Way of the Cross (Alphonsian) |
| Chapters | Life of St. Alphonsus, The Doctor of Prayer, Liguorian spirituality for laypeople |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | The True Spouse of Jesus Christ (on religious life, but widely read by laypeople), The Holy Eucharist (devotional treatise), Instruction and Practice for Confessors (pastoral classic) |
| Practices | Alphonsian method of mental prayer, Preparation for death meditation (guided, drawn from the book), Novena to Our Lady of Perpetual Help (Redemptorist tradition) |
| Chapters | The Redemptorist tradition, Alphonsus on moral theology (accessible overview), Alphonsus and popular devotion in Brazil |

- **Issues:** #111

### Salesian Spirituality — St. Francis de Sales

The perfect beginner's tradition. St. Francis de Sales explicitly wrote for laypeople living in the world, not monks. His *Introduction to the Devout Life* is known as *Filoteia* in Brazil.

**Base:**

| Component | Content |
|-----------|---------|
| Book | Full Introduction to the Devout Life (5 parts) |
| Practices | Salesian method of meditation, Salesian evening review |
| Chapters | Who was St. Francis de Sales?, The Salesian spirit — devotion for everyone |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | Treatise on the Love of God — St. Francis de Sales (his masterwork on the spiritual life, 12 books), Spiritual Conferences — St. Francis de Sales (talks to the Visitation nuns), The Spiritual Combat — Lorenzo Scupoli (the book Francis carried in his pocket for 18 years) |
| Practices | Salesian morning offering, The "little virtues" daily practice (gentleness, patience, humility — drawn from the Devout Life) |
| Chapters | Sales on friendship and devotion, The Visitation order and Salesian spirituality, From the Devout Life to the Love of God (reading guide for the two works together) |

- **Languages:** French (original), English, Brazilian Portuguese
- **Issues:** #111, #116

### Story of a Soul — St. Thérèse of Lisieux

One of the most beloved spiritual autobiographies in Catholic history. The Little Way — doing small things with great love — is accessible to every soul. Santa Teresinha is extremely popular in Brazil.

**Base:**

| Component | Content |
|-----------|---------|
| Book | Story of a Soul (autobiography, public domain 1898) |
| Practices | Act of Offering to Merciful Love, Novena to St. Thérèse (9-day program), Daily prayer of St. Thérèse |
| Chapters | The Little Way, The Martin family, St. Thérèse and missions |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | Poems and Plays of St. Thérèse (her poetry and dramatic works, public domain), Letters of St. Thérèse (selected correspondence, public domain — she died 1897), Last Conversations (her final words, recorded by her sisters — original source public domain, though modern critical editions may carry editorial copyright) |
| Practices | The "shower of roses" daily offering, Thérèse's method of prayer (her description of prayer as a child talking to God) |
| Chapters | Thérèse as Doctor of the Church (the significance of the title), Thérèse and the missions (patroness of missionaries who never left her convent), The Martin family and the path to holiness, Thérèse's influence on modern spirituality |

- **Languages:** French (original), English, Brazilian Portuguese
- **Issues:** #111

### Seasonal Libraries — Lent & Advent

Time-bound devotional companions tied to the liturgical year. Creates a reason to return each liturgical season.

**Base — Lent:**

| Component | Content |
|-----------|---------|
| Practices | Stations of the Cross (enhanced with sacred art), Seven Penitential Psalms, Prayer of St. Ephrem |
| Program | Lenten daily meditations (40-day program) |

**Base — Advent:**

| Component | Content |
|-----------|---------|
| Practices | O Antiphons (7-day, Dec 17–23), Advent wreath prayers (4 weeks) |
| Program | Jesse Tree daily readings (25-day program) |

**Expansion — Lent:**

| Component | Content |
|-----------|---------|
| Books | The Lenten Sermons of St. Leo the Great (public domain, 5th c. — short, powerful homilies for each week), Selected Passion meditations from St. Alphonsus |
| Practices | Tenebrae psalms and readings, Via Matris (Way of the Sorrowful Mother), Daily Lenten Examen (focused on conversion) |
| Chapters | The theology of Lent, Sacred art of the Passion (gallery with context), The Triduum explained |

**Expansion — Advent:**

| Component | Content |
|-----------|---------|
| Practices | Rorate Caeli and Advent hymns, Advent Compline (special seasonal night prayer), Daily Advent Angelus (with seasonal variations) |
| Chapters | The theology of Advent and eschatological hope, Advent in sacred art (Annunciation, Visitation, Nativity), The Christmas Novena tradition in Brazil |

**Expansion — St. Michael's Lent (Aug 15 – Sep 29):**

| Component | Content |
|-----------|---------|
| Program | St. Michael's Lent (40-day penitential season from the Assumption to the feast of St. Michael — daily meditations on the angels, spiritual combat, and penance; cross-referenced in the Holy Angels library) |
| Chapters | What is St. Michael's Lent? (history of this forgotten penitential season), The spiritual combat tradition |

- **Languages:** English, Brazilian Portuguese
- **Issues:** #47

### Augustinian Spirituality

St. Augustine of Hippo (354–430) — the most influential theologian of the Latin West. His writings shaped Catholic thought on grace, free will, the Trinity, and the inner life. Far more than just the Confessions.

**Base:**

| Component | Content |
|-----------|---------|
| Book | Confessions (13 books — spiritual autobiography and philosophical meditation) |
| Chapters | Who was St. Augustine?, How to read the Confessions, Augustine's conversion |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | Enchiridion (Handbook on Faith, Hope, and Love — a compact summary of Christian doctrine), On Christian Doctrine (how to read and interpret Scripture), Soliloquies (Augustine's dialogue with Reason about God and the soul) |
| Practices | Augustinian prayer of recollection (drawn from his teaching on interiority — "You were within, I was without"), Daily reading from the Confessions |
| Chapters | Augustine on prayer and the Psalms, The City of God — an overview (the full work is too large to publish, but a guided tour is valuable), Augustine's influence on Catholic spirituality (from Aquinas to the Reformers to Newman), The Augustinian tradition (the Rule of St. Augustine and its religious orders) |

- **Languages:** Latin (original), English, Brazilian Portuguese

### The Breviary

The Divine Office is the prayer of the Church — the daily cycle of psalms, hymns, readings, and prayers that has sanctified every hour of the day for two millennia. This library brings together the major forms of the Office, from the pre-Vatican II Roman Breviary to modern adaptations.

The Liturgy of the Hours (post-Vatican II) presents copyright challenges: the ICEL English translation is copyrighted, though the Latin typical edition (*Liturgia Horarum*) is not. We can provide the Latin text and our own translations, but cannot reproduce the standard English ICEL text.

**Base:**

| Component | Content |
|-----------|---------|
| Books | The Breviarium Romanum (pre-Vatican II, 1962 — the traditional Roman Office in Latin with translations), Divine Worship: Daily Office (DWDO — the Anglican Ordinariate's office, a beautiful English-language breviary drawing on the Coverdale Psalter and Anglican patrimony) |
| Practices | Lauds, Prime, Terce, Sext, None, Vespers, Compline, Matins (all hours of the traditional Office) |
| Chapters | What is the Divine Office?, History of the Breviary (from the Desert Fathers to the present), How to pray each hour, The psalms explained |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | Monastic Diurnal (the daytime hours of the Benedictine Office — a simpler, contemplative form widely used by oblates and lay monastics), Little Office of the Blessed Virgin Mary (the ancient Marian office, prayed since the 8th century), Little Office of the Dead (the traditional office of suffrage for the faithful departed), Liturgia Horarum — Latin typical edition with original translations (where copyright allows) |
| Practices | Monastic Compline (Benedictine night prayer), Office of the Dead (All Souls, funeral vigils) |
| Chapters | The Office of Readings and its patristic treasures, The hymns of the Office (history and theology), Praying the Office alone vs. in community, The Benedictine tradition and the hours, Comparing the forms (pre-V2, LOTH, Monastic, Ordinariate), Selected psalm commentaries from the Church Fathers (Augustine, Cassiodorus) |

### Little Offices

A collection of the "little offices" — shortened forms of the Divine Office devoted to particular mysteries, saints, or intentions. These were among the most popular devotions of the medieval and early modern Church, widely prayed by the laity before the liturgical reforms. Each is a self-contained cycle of hours (typically Matins through Compline) that can be prayed in 15–30 minutes.

**Base:**

| Component | Content |
|-----------|---------|
| Practices | Little Office of the Blessed Virgin Mary (the most ancient and widely prayed, dating to the 8th century — the office that the medieval laity knew by heart), Little Office of the Dead (Office of the Faithful Departed — prayed on All Souls, at funerals, and throughout November), Little Office of the Sacred Heart, Little Office of the Immaculate Conception, Little Office of the Holy Spirit |
| Chapters | What are the Little Offices?, History of the Little Offices in Catholic devotion, How to pray a Little Office (structure, posture, intention) |

**Expansion:**

| Component | Content |
|-----------|---------|
| Practices | Little Office of the Holy Angels, Little Office of St. Joseph, Little Office of the Holy Cross, Little Office of the Blessed Sacrament, Little Office of the Holy Name of Jesus, Little Office of the Seven Sorrows, Little Office of the Holy Family, Little Office of St. Michael the Archangel, Little Office of the Sacred Wounds, Little Office of the Precious Blood, Little Office of the Five Wounds, Little Office of the Passion, Little Office of the Nativity, Little Office of the Holy Trinity |
| Chapters | How the Little Offices relate to the full Divine Office, Praying the Little Offices through the liturgical year (matching offices to seasons and feasts), The Books of Hours — how the Little Offices were the prayer life of medieval laypeople, The illuminated Hours of the Virgin (the artistic tradition of the Book of Hours) |

- **Languages:** Latin (original), English, Brazilian Portuguese

### St. Thomas Aquinas

The Angelic Doctor — the Church's greatest theologian and one of her greatest poets. Thomas's works are the intellectual backbone of Catholic thought, but he was also a mystic and a man of deep prayer. His hymns (*Pange Lingua*, *Adoro Te Devote*, *Tantum Ergo*) are among the most beautiful in the Latin tradition. All works are public domain (13th century).

**Base:**

| Component | Content |
|-----------|---------|
| Books | Compendium of Theology (his unfinished summary of the faith — shorter and more accessible than the Summa), Catena Aurea (his "Golden Chain" — a commentary on the four Gospels compiled entirely from quotations of the Church Fathers) |
| Practices | Prayers of St. Thomas before and after Communion, Adoro Te Devote, Pange Lingua / Tantum Ergo |
| Chapters | Who was St. Thomas Aquinas?, The Angelic Doctor as mystic and poet, How to read Thomas |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | Summa Theologica — selected questions (the full Summa is enormous; we curate the most spiritually rich and accessible questions: on prayer, the virtues, the sacraments, the last things), Summa Contra Gentiles (his apologetic masterwork), On the Perfection of the Spiritual Life, Commentary on the Lord's Prayer / Hail Mary / Apostles' Creed (his accessible Lenten conferences for laypeople) |
| Practices | Thomistic examination of conscience (structured around the virtues), Daily reading from the Summa (curated cycle through key questions) |
| Chapters | Thomas on the virtues (a practical guide), Thomas on prayer and contemplation, The Five Ways — Thomas's proofs for God's existence, Thomas and Scripture (he was first and foremost a biblical theologian), The Dominican tradition and Thomistic spirituality |

- **Languages:** Latin (original), English, Brazilian Portuguese

### Immaculate Heart of Mary

The devotion to the Immaculate Heart is inseparable from Fatima and the call to prayer, penance, and consecration that Our Lady gave to the three shepherd children in 1917. This library gathers the traditional prayers, formation content, and Marian theology around the Immaculate Heart — complementing the Montfort library's focus on Total Consecration and the Rosary Companion's focus on the Rosary itself.

Note: The Fatima secrets and Sister Lucia's memoirs are 20th-century texts with copyright considerations. Formation chapters will draw on the public record and pre-copyright Marian theology rather than reproducing copyrighted accounts.

**Base:**

| Component | Content |
|-----------|---------|
| Practices | Act of Consecration to the Immaculate Heart, First Saturday devotion (5 consecutive months), Daily offering to the Immaculate Heart, Communion of Reparation |
| Chapters | The Immaculate Heart in Scripture and Tradition, The Fatima apparitions and their message (from public record), The First Saturday promises, Consecration to the Immaculate Heart — history and theology |
| Prayers | Litany of the Immaculate Heart, Fatima prayers (Angel's Prayer, Decade Prayer, Pardon Prayer — traditional, public domain) |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | The Glories of Mary — St. Alphonsus Liguori (cross-referenced from the Alphonsus library, the greatest Marian devotional work), The Mystical City of God — Ven. Mary of Ágreda (17th c. Marian revelations, public domain, controversial but widely read) |
| Practices | 33-day preparation for Consecration to the Immaculate Heart, Seven Sorrows meditation (Marian Stations), Monthly First Saturday program (12-month cycle with meditations on the mysteries) |
| Chapters | The theology of the Immaculate Heart (from the Church Fathers to Pius XII's *Haurietis Aquas*), Mary's Heart in the mystics (Bérulle, Eudes, Montfort), The Immaculate Heart and the Sacred Heart (the two devotions together), Marian apparitions and the Immaculate Heart (Fatima, Akita, Beauraing — from the public record), The Immaculate Heart in Brazil (Nossa Senhora de Fátima devotion) |
| Art | Classic depictions of the Immaculate Heart, Fatima imagery |

- **Languages:** English, Brazilian Portuguese

### Desert Fathers

The earliest tradition of Christian monasticism — the 3rd–5th century hermits and monks of the Egyptian, Syrian, and Palestinian deserts who fled the world to seek God in radical simplicity. Their sayings are among the most quoted texts in all of Christian spirituality: short, paradoxical, and devastatingly practical. All texts are public domain (4th–5th century).

**Base:**

| Component | Content |
|-----------|---------|
| Books | The Sayings of the Desert Fathers (Apophthegmata Patrum — the alphabetical collection of sayings organized by elder: Abba Anthony, Abba Moses, Amma Syncletica, Abba Poemen, and dozens more), The Life of St. Anthony — St. Athanasius (the founding text of monasticism, the biography that inspired Augustine's conversion) |
| Chapters | Who were the Desert Fathers and Mothers?, The desert tradition and its influence on all later monasticism, How to read the sayings (context, humor, paradox) |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | The Conferences of John Cassian (the bridge between the Egyptian desert and Western monasticism — his conversations with the great elders on prayer, discretion, the eight vices, and the spiritual life), The Institutes of John Cassian (the practical companion to the Conferences — on monastic life and the struggle with vice), The Ladder of Divine Ascent — St. John Climacus (the 30-step ascent from worldly life to union with God, the most influential spiritual manual in Eastern Christianity), The Lausiac History — Palladius (eyewitness accounts of the desert monks and nuns) |
| Practices | Daily reading from the Desert Fathers (curated cycle through the sayings), The Jesus Prayer in the desert tradition (its earliest roots) |
| Chapters | The Desert Mothers (Amma Syncletica, Amma Sarah, Amma Theodora — often overlooked), Cassian and the eight thoughts (the origin of the seven deadly sins), The Ladder of Divine Ascent — a reader's guide (navigating the 30 steps), From the desert to the monastery (how desert spirituality shaped Benedict, Basil, and all later religious life), Acedia — the noonday demon (the desert fathers' most original contribution to spiritual psychology) |

- **Languages:** Greek (original), Latin, English, Brazilian Portuguese

### Patristic Writings

The Church Fathers — the great theologians, bishops, and writers of the first eight centuries who shaped Catholic doctrine, liturgy, and spirituality. Their works are the living commentary on Scripture and Tradition, read in the Office of Readings to this day. All texts are public domain. This is one of the largest and most ambitious libraries in the pipeline — the patristic corpus is enormous, so we prioritize the most spiritually rich and accessible works.

**Base:**

| Component | Content |
|-----------|---------|
| Books | On the Incarnation — St. Athanasius (the foundational text on why God became man), Catechetical Lectures — St. Cyril of Jerusalem (the earliest complete catechesis — how the early Church taught the faith to converts), On the Holy Spirit — St. Basil the Great, The Moralia — St. Gregory the Great (practical moral theology for laypeople and clergy) |
| Chapters | Who are the Church Fathers?, The four great Latin Fathers (Ambrose, Jerome, Augustine, Gregory), The four great Greek Fathers (Athanasius, Basil, Gregory Nazianzen, John Chrysostom), How to read the Fathers |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | Homilies on the Gospels — St. John Chrysostom (the "Golden Mouth" — his sermon series on Matthew and John are among the greatest scriptural commentaries ever produced), On the Priesthood — St. John Chrysostom, The Theological Orations — St. Gregory Nazianzen (the definitive defense of the Trinity), On the Song of Songs — St. Gregory of Nyssa (mystical commentary), On the Duties of the Clergy — St. Ambrose, Letters of St. Jerome (selected — sharp, learned, and deeply human), Dialogues — St. Gregory the Great (including the Life of St. Benedict), Proslogion — St. Anselm (the ontological argument and the prayer that frames it), Cur Deus Homo — St. Anselm (Why God Became Man) |
| Practices | Daily reading from the Fathers (curated cycle through key passages, aligned with the liturgical year — echoing the Office of Readings), Patristic lectio divina (reading Scripture through the eyes of the Fathers) |
| Chapters | The Apostolic Fathers (Clement, Ignatius, Polycarp — the generation that knew the Apostles), The age of the martyrs (Justin, Irenaeus, Cyprian), The golden age of patristics (4th–5th century), The Fathers on the Eucharist, The Fathers on Mary, The Fathers on prayer, Patristic exegesis — how the Fathers read Scripture (literal, allegorical, moral, anagogical), The Fathers in the liturgy (their presence in the Office of Readings) |

- **Languages:** Greek, Latin, English, Brazilian Portuguese

### The Holy Angels

The angelic tradition runs deep in Catholic theology, liturgy, and devotion — from the nine choirs of Pseudo-Dionysius to the guardian angel prayers taught to every child. St. Michael, St. Raphael, and St. Gabriel each have rich devotional traditions, and the theology of the angels received its most rigorous treatment from St. Thomas Aquinas (the "Angelic Doctor" — a title earned partly by his treatise on angels in the Summa). All source texts are public domain.

**Base:**

| Component | Content |
|-----------|---------|
| Practices | St. Michael Prayer (the Leonine prayer — Leo XIII's exorcism prayer, recited after Low Mass for decades), Chaplet of St. Michael (9 salutations to the nine choirs), Guardian Angel prayers, The Angelus |
| Chapters | The nine choirs of angels (Seraphim, Cherubim, Thrones, Dominations, Virtues, Powers, Principalities, Archangels, Angels — their nature and mission), Guardian angels in Scripture and Tradition, St. Michael as protector of the Church, The three Archangels (Michael, Raphael, Gabriel — their roles in salvation history) |
| Prayers | Litany of the Holy Angels, Prayer to St. Raphael, Prayer to St. Gabriel |

**Expansion:**

| Component | Content |
|-----------|---------|
| Books | The Celestial Hierarchy — Pseudo-Dionysius (5th–6th c. — the foundational text on the nine choirs, hugely influential on Aquinas, Bonaventure, and Dante), Treatise on the Angels — St. Thomas Aquinas (Summa Theologica I, qq. 50–64 — the most detailed angelology ever written, covering their nature, knowledge, will, creation, and fall) |
| Practices | Chaplet of the Holy Angels, Chaplet of St. Raphael, Novena to St. Michael, Novena to the Guardian Angel, The Angelic Trisagion (Holy, Holy, Holy — prayer to the angels in adoration), St. Michael's Lent (the traditional 40-day fast from Aug 15 to Sep 29 — a penitential season in honor of the Archangel, with daily meditations; also cross-referenced in the Seasonal library) |
| Chapters | Angels in the liturgy (their presence in the Mass, the Sanctus, the Preface), The angel of Fatima (the Angel of Peace who appeared before Our Lady), Fallen angels and spiritual warfare (the Catholic teaching on demons, temptation, and the role of the angels in the spiritual combat), Pseudo-Dionysius and the celestial hierarchy — a reader's guide, Aquinas on the angels (accessible summary of the Summa's angelology), Angels in sacred art (gallery — from Byzantine icons to Baroque masterpieces) |
| Art | Classic depictions of St. Michael, guardian angels, the nine choirs, the Annunciation (Gabriel) |

- **Languages:** Latin (original), English, Brazilian Portuguese

---

## Novenas Expansion

`ember-novenas` is the single home for all novenas. The 54-Day Rosary Novena is already published. Next steps:

**Migration** — move existing novenas from `ember-extra` into `ember-novenas`:
- `novena-holy-spirit`
- `novena-sacred-heart`
- `miraculous-medal-novena`

**Next additions** (priority order):
1. Divine Mercy Novena ([spec](../features/divine-mercy-novena.md))
2. Novena to St. Joseph ([spec](../features/st-joseph-novena.md))
3. Novena to St. Thérèse ([spec](../features/st-therese-novena.md))
4. Immaculate Conception Novena ([spec](../features/immaculate-conception-novena.md))
5. Christmas Novena ([spec](../features/christmas-novena.md))
6. Our Lady of Aparecida Novena
7. St. Jude Novena
8. St. Michael Novena
9. St. Anthony Novena
10. Our Lady of Perpetual Help Novena
11. Our Lady of Guadalupe Novena
12. Our Lady of Mount Carmel Novena

---

## Comparison Matrix

| Library | Tier | Types | Issues |
|---------|------|-------|--------|
| Divine Mercy | 1 | Devotional, Practices | #48, #44 |
| Imitation of Christ | 1 | Book, Practices | #111 |
| Ignatian | 1 | Formation, Practices, Books | #96, #116 |
| Carmelite | 2 | Books, Formation, Devotional | #111, #98 |
| Eastern Catholic | 2 | Practices, Devotional | #93 |
| Rosary Companion | 2 | Formation, Practices | #45, #95 |
| St. Alphonsus Expansion | 3 | Books, Devotional, Practices | #111 |
| Salesian | 3 | Books, Formation | #111, #116 |
| Story of a Soul | 3 | Book, Devotional | #111 |
| Seasonal (Lent & Advent) | 3 | Practices, Programs | #47 |
| Augustinian | 3 | Books, Formation | — |
| Breviary | 3 | Practices, Books, Formation | — |
| Little Offices | 3 | Practices | — |
| St. Thomas Aquinas | 3 | Books, Practices, Formation | — |
| Immaculate Heart | 3 | Devotional, Practices, Formation | — |
| Desert Fathers | 3 | Books, Formation | — |
| Patristic Writings | 3 | Books, Formation | #112 |
| Holy Angels | 3 | Books, Practices, Devotional | — |

