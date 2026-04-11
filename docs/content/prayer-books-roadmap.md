# Library Roadmap

Prioritized plan for new content libraries in Ember, organized by type and impact. Each candidate is assessed for feasibility (public domain text availability, source quality), bilingual support (EN + PT-BR), and alignment with the three pillars (Fidelity, Devotion, Wisdom).

> Status: planning phase. No content authoring started.

---

## What We Have Today

| Library | Type | Practices | Chapters | Books | Languages |
|---------|------|-----------|----------|-------|-----------|
| Ember Default | Core daily prayers | 23 | — | — | EN + PT |
| Ember Extra | Office, novenas, litanies | 18 | — | — | EN + PT |
| Montfort Spirituality | Marian consecration | 1 (33-day program) | 1 | 3 | EN + PT |
| Sacred Heart | Devotional companion | 4 | 5 | — | EN + PT |
| Ave Maria Claretiano | Portuguese devocionário | 7 | 3 | — | PT only |

**Total:** 53 practices, 9 chapters, 3 books across 5 libraries.

### Gaps

- No formation guides (how-to-pray content)
- No standalone spiritual classics beyond Montfort
- No Ignatian, Carmelite, Liguorian, Eastern, or Divine Mercy content
- No seasonal books (Lent/Advent)
- Limited program content (only Total Consecration + Sacred Heart novenas)
- The Wisdom pillar is underdeveloped compared to Fidelity

---

## Tier 1 — Build Next

### 1. Divine Mercy

**Type:** Devotional companion (Sacred Heart model)

Most popular modern Catholic devotion. Directly resolves issue #48 (Divine Mercy Novena). Natural complement to the Sacred Heart book.

| Component | Content |
|-----------|---------|
| Practices | Divine Mercy Chaplet (daily), Divine Mercy Novena (9-day program), 3 o'clock prayer, Act of Trust in Divine Mercy |
| Chapters | The Vilnius image and its symbolism, St. Faustina's life, The promises of Divine Mercy, Divine Mercy Sunday, The theology of mercy (encyclical excerpts) |
| Prayers | Chaplet prayers, novena day prayers, Litany of Divine Mercy |
| Art | Kazimirowski painting, Hyla image, Merciful Jesus iconography |

**Feasibility:** High — all prayers are traditional/public domain. Rich public domain art.
**PT-BR:** Very strong — Divina Misericordia devotion huge in Brazil.
**Issues:** #48, #44

---

### 2. Ignatian Spirituality

**Type:** Formation guide + practice pack

The Daily Examen is arguably the most widely practiced prayer form after the Rosary. Fills the formation guide gap. Ignatian meditation is a concrete, teachable method — perfect for meeting people where they are.

| Component | Content |
|-----------|---------|
| Practices | Daily Examen (5-step guided), Ignatian meditation method (with guided structure), Suscipe prayer, First Principle and Foundation meditation |
| Program | Adapted 19th Annotation retreat (30-week Spiritual Exercises) |
| Book | The Spiritual Exercises (public domain, 16th c.) |
| Chapters | Who was St. Ignatius?, AMDG and Finding God in All Things, The Ignatian method explained, Discernment of spirits primer |

**Feasibility:** High — Exercises text public domain. Adaptation needs care (Exercises are meant to be directed), but the Examen and meditation method stand alone.
**PT-BR:** Good — strong Jesuit presence in Brazil.
**Issues:** #96, #116

---

### 3. Imitation of Christ

**Type:** Spiritual classic (Book) + daily reading practice

The single most-published book after the Bible. #1 on the Absolute Canon list in `spiritual-books.md`. Immediately delivers on the Catholic library roadmap item and sets the pattern for how spiritual classics work in the app.

| Component | Content |
|-----------|---------|
| Book | Full Imitation of Christ (4 books, ~114 chapters) |
| Practice | Daily reading from the Imitation (cycle through short passages via `cycle` with `program-day`) |
| Chapters | About Thomas a Kempis, How to read the Imitation, The Devotio Moderna movement |

**Feasibility:** Very high — countless public domain translations. EN: several pre-1930 translations. PT: multiple Imitacao de Cristo editions.
**PT-BR:** Excellent — Brazilian classic.
**Issues:** #111

---

## Tier 2 — Build Soon

### 4. Carmelite Spirituality

**Type:** Spiritual classics + devotional companion

Three Absolute Canon entries. Anchors the Wisdom pillar for advanced users. The Carmelite tradition on mental prayer directly feeds formation content.

| Component | Content |
|-----------|---------|
| Books | Interior Castle (St. Teresa of Avila), Dark Night of the Soul (St. John of the Cross), Way of Perfection (St. Teresa of Avila) |
| Practices | Carmelite method of mental prayer, Brown Scapular daily prayer, Prayer of St. Teresa |
| Chapters | The Carmelite Doctors, Stages of the spiritual life, The mansions explained, Contemplative prayer for beginners |

**Feasibility:** High — all texts public domain. English translations by E. Allison Peers / David Lewis readily available.
**PT-BR:** Strong — Carmelite tradition well-established in Brazil.
**Issues:** #111, #98

---

### 5. St. Alphonsus Liguori — Doctor of Prayer

**Type:** Devotional companion + spiritual classics

Doctor of the Church on prayer. Prolific public domain output. *Extremely* popular in Brazil. Directly fills the PT-BR content gap.

| Component | Content |
|-----------|---------|
| Books | Visits to the Blessed Sacrament, The Practice of the Love of Jesus Christ, Preparation for Death |
| Practices | Visit to the Blessed Sacrament (daily, with day-specific meditations), Liguorian morning/evening prayers, Way of the Cross (Alphonsian) |
| Chapters | Life of St. Alphonsus, The Doctor of Prayer, Liguorian spirituality for laypeople |

**Feasibility:** High — extensive public domain catalog, well-translated to Portuguese.
**PT-BR:** Highest of any candidate — Santo Afonso is a household name in Brazilian Catholicism.
**Issues:** #111

---

### 6. Rosary Companion

**Type:** Formation guide + enhanced practice content

The Rosary already exists as a practice but lacks formation content. 54-Day Rosary Novena (issue #45) is a requested program. The Rosary is the universal Catholic devotion — deserves its own rich book.

| Component | Content |
|-----------|---------|
| Practices | 54-Day Rosary Novena (program), Seven Sorrows Rosary, Franciscan Crown (7-decade) |
| Chapters | History of the Rosary, How to pray the Rosary well (formation guide), The 15 promises, The mysteries explained (with sacred art per mystery), Rosary confraternities |
| Art | Classic paintings for each of the 20 mysteries |

**Feasibility:** High — traditional content, rich public domain art.
**PT-BR:** Very high — Rosary devotion massive in Brazil.
**Issues:** #45, #95

---

## Tier 3 — Build as Catalog Grows

### 7. Eastern Catholic / Byzantine Spirituality

**Type:** Practice pack + devotional companion

Fills a completely unique gap — no Catholic prayer app serves Eastern Catholics well. The Jesus Prayer, Akathist, and Prayer of St. Ephrem are increasingly practiced by Latin-rite Catholics too.

| Component | Content |
|-----------|---------|
| Practices | Jesus Prayer (with optional repetition counter/breathing guide), Akathist Hymn to the Theotokos, Trisagion, Eastern morning/evening prayers, Prayer of St. Ephrem (Lenten) |
| Chapters | Eastern Catholic traditions, Icons and prayer (with gallery), Hesychasm explained, The Philokalia tradition, Unity in diversity — the 23 Eastern Catholic churches |
| Prayers | Troparion, Kontakion, prayers before icons |

**Feasibility:** Medium — texts are public domain but sourcing structured Eastern liturgical content takes more research. Icon art widely available.
**PT-BR:** Lower priority (small Eastern community in Brazil), but growing interest in Eastern spirituality.

---

### 8. Introduction to the Devout Life (St. Francis de Sales)

**Type:** Formation guide + spiritual classic

Absolute Canon #2. The perfect beginner formation book — Sales explicitly wrote it for laypeople living in the world, not monks. Aligns with the mission of meeting people where they are.

| Component | Content |
|-----------|---------|
| Book | Full Introduction to the Devout Life (5 parts) |
| Practices | Salesian method of meditation, Salesian evening review |
| Chapters | Who was St. Francis de Sales?, The Salesian spirit — devotion for everyone |

**Feasibility:** Very high — public domain, excellent translations.
**PT-BR:** Good — Filoteia well-known in Brazil.
**Issues:** #111, #116

---

### 9. Story of a Soul + Little Flower Devotion

**Type:** Spiritual classic + devotional companion

Absolute Canon #7. One of the most beloved saints. The Little Way is accessible to all.

| Component | Content |
|-----------|---------|
| Book | Story of a Soul (autobiography, public domain 1898) |
| Practices | Act of Offering to Merciful Love, Novena to St. Therese (9-day program), Daily prayer of St. Therese |
| Chapters | The Little Way, The Martin family, St. Therese and missions |

**Feasibility:** High — text public domain, rich hagiographic content.
**PT-BR:** Very high — Santa Teresinha extremely popular in Brazil.
**Issues:** #111

---

### 10. Seasonal Libraries (Lent and Advent)

**Type:** Practice packs tied to liturgical seasons

Time-bound, shareable, creates a reason to return each season. Can be season-gated in the catalog.

**Lent book:**
- Stations of the Cross (enhanced with art, issue #47)
- Seven Penitential Psalms
- Lenten daily meditations (40-day program)
- Prayer of St. Ephrem

**Advent book:**
- O Antiphons (7-day, Dec 17-23)
- Advent wreath prayers (4 weeks)
- Jesse Tree daily readings (25-day program)
- Rorate Caeli and Advent hymns

**Feasibility:** High — traditional content.
**PT-BR:** Good for both.
**Issues:** #47

---

### 11. Confessions of St. Augustine

**Type:** Spiritual classic (Book)

Absolute Canon #3. Lighter-weight book — Book with a short reading guide chapter.

---

### 12. Liturgy of the Hours Companion

**Type:** Formation guide

Better as chapters added to Ember Extra than a standalone book: What is the LOTH?, History of the Divine Office, How to pray each hour, The psalms explained.

---

## Comparison Matrix

| Book | Impact | PT-BR | Feasibility | Types | Issues |
|------|--------|-------|-------------|-------|--------|
| Divine Mercy | ★★★ | ★★★ | ★★★ | Devotional, Practices | #48, #44 |
| Ignatian | ★★★ | ★★ | ★★★ | Formation, Practices, Book | #96, #116 |
| Imitation of Christ | ★★★ | ★★★ | ★★★ | Book, Practices | #111 |
| Carmelite | ★★★ | ★★★ | ★★★ | Book, Formation, Devotional | #111, #98 |
| St. Alphonsus | ★★★ | ★★★+ | ★★★ | Book, Devotional, Practices | #111 |
| Rosary Companion | ★★★ | ★★★ | ★★★ | Formation, Practices | #45, #95 |
| Eastern Catholic | ★★ | ★ | ★★ | Practices, Devotional | #93 |
| Devout Life | ★★ | ★★ | ★★★ | Book, Formation | #111, #116 |
| Story of a Soul | ★★ | ★★★ | ★★★ | Book, Devotional | #111 |
| Seasonal | ★★ | ★★ | ★★★ | Practices | #47 |

---

## Suggested Build Sequence

Tier 1 books can be built in any order. A sequence that maximizes variety and infrastructure learning:

1. **Divine Mercy** — proven devotional companion pattern (Sacred Heart model), resolves #48
2. **Imitation of Christ** — establishes the spiritual classic + daily reading pattern for all future Books
3. **Ignatian Spirituality** — establishes the formation guide pattern, introduces the Examen

Then Tier 2 fills out the library: Carmelite classics, St. Alphonsus (high PT-BR value), and the Rosary companion.

---

## Next Steps

- [ ] Choose which Tier 1 book to build first
- [ ] For the chosen book, write a detailed content spec (chapter outlines, practice flow structure, Book source identification, art sourcing)
- [ ] Source and evaluate public domain text quality for the chosen book
- [ ] Design bilingual strategy (same Book in EN + PT-BR, or separate editions?)
- [ ] Build the book using the existing `.pray` format and Hearth delivery
