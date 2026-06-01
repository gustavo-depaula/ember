# Plan of Life Templates — Research

> **Status:** research notes for a future feature. Not a spec yet. Goal: gather the actual content (the practices, the cadences, the emphases) of the major Catholic plans of life so that when we ship templates we are quoting living traditions rather than inventing a generic checklist.

A "plan of life" (*plano de vida*, *plan de vida*, *rule of life*, *ordo*) is the structured commitment a Catholic makes to specific practices at specific cadences — daily, weekly, monthly, seasonal, annual. Every spiritual school has produced one. The shapes overlap (everyone has morning prayer; everyone has confession; everyone has retreat) but the *emphasis*, *cadence*, and *non-negotiable core* differ enough that a single template ("Catholic Standard Plan") would erase the choice the user actually wants to make. A serious user is not choosing practices à la carte — they are choosing a *school of holiness* and then living its rule.

Below: 15 templates worth shipping. Each entry gives the cadence breakdown, the distinctive emphasis, the audience for whom it fits, and the primary sources. Where Ember already has the practice in the corpus, the practice id is given in `code`.

---

## 1. Opus Dei — Norms of Piety

> "Do you really want to be a saint? Carry out the little duty of each moment: do what you ought and concentrate on what you are doing." — *The Way*, 815

The most explicit, codified, and widely imitated modern plan of life. Designed for laypeople pursuing sanctity in ordinary work. Distinguishes **norms of piety** (a fixed daily/weekly/monthly/annual rule, all members keep it) from **customs** (devotions encouraged but not strictly required).

| Cadence | Practices |
|---|---|
| Daily | Morning offering · Holy Mass + Communion (`mass`) · two periods of mental prayer (~30 min each, morning + evening) (`mental-prayer`) · Spiritual reading (NT 5 min + spiritual book 10 min) · Angelus / Regina Cæli (`angelus`) · Holy Rosary (`rosary`) · Brief visit to the Blessed Sacrament · Examination of conscience at night (`examination-of-conscience`) · Three Hail Marys before sleep for purity · Aspirations / ejaculatory prayers throughout · Small mortifications |
| Weekly | Sacramental confession (`confession`) · One day of corporal mortification (typically Friday) |
| Monthly | Day of recollection (a half-day silent retreat) |
| Annually | Multi-day silent retreat (3–5 days) · Renewal of one's plan with a spiritual director |

**Distinctive emphasis.** *Sanctification of work*, *unity of life* (no sacred/secular split), *divine filiation* as the foundation. The norms are non-negotiable; failures are confessed.

**Best for.** Working laypeople with a strong stomach for structure who want a complete, lived rule rather than a custom-built one. The user who reads *The Way* and says "yes, this."

**Sources.** Josemaría Escrivá, *The Way*; *Furrow*; *The Forge*; *Christ is Passing By* (homily on "The Christian Vocation"). Salvador Bernal, *Plan of Life*. Pedro Rodríguez et al., *Opus Dei in the Church*.

---

## 2. Jesuit / Ignatian

The plan around the *Spiritual Exercises*. Daily Examen is the load-bearing practice; everything else orbits it.

| Cadence | Practices |
|---|---|
| Daily | Morning oblation (offering the day) · Holy Mass + Communion · 15–30 min meditation on the Gospel of the day (*compositio loci*, colloquy) (`gospel-of-the-day`) · Spiritual reading · **Examen twice**: midday particular examen + night general examen (`examination-of-conscience`) · Aspirations |
| Weekly | Confession · Spiritual direction (ideally weekly, in practice monthly) |
| Monthly | Day of recollection |
| Annually | **8-day silent retreat** of the *Spiritual Exercises*. Lifetime: one full 30-day Exercises |

**Distinctive emphasis.** *Discernment of spirits*. *Agere contra* (acting against disordered attachment). *Magis* (the greater good). The Examen is not a list of sins but a noticing of where God moved and where the user resisted.

**Best for.** Decision-makers, intellectuals, anyone in a life transition. The discerner.

**Sources.** Ignatius of Loyola, *Spiritual Exercises*; *Autobiography*. Joseph de Guibert, *The Jesuits: Their Spiritual Doctrine and Practice*. Timothy Gallagher, *The Examen Prayer*.

---

## 3. Salesian — *Introduction to the Devout Life*

St. Francis de Sales's plan for laypeople in the world — courtiers, mothers, soldiers, merchants. The first explicit "plan of life for the laity" in Catholic history (1609). Distinguished from monastic plans by its insistence that the devout life is shaped *by* one's state in life, not extracted from it.

| Cadence | Practices |
|---|---|
| Daily | Morning prayer with **preparation of the day** (foresee the day's occasions of sin and virtue) · Mental prayer / "meditation" (½ hour, morning) · Mass when possible · **Spiritual nosegay** (carry one phrase from the morning's meditation through the day) · Ejaculatory prayers and "retreat of the heart" (frequent return to God's presence) · Evening prayers with **brief examination** · One reading from a spiritual book |
| Weekly | Confession (frequent — "weekly or fortnightly") · Communion (St. Francis was a strong promoter of frequent Communion against the Jansenists) |
| Monthly | Day of withdrawal · Renewal of resolutions |
| Annually | Retreat |

**Distinctive emphasis.** *Devotion is sweetness* — the devout life is supposed to make the user more joyful, more loving, more attractive to those around them, not less. Gentle perseverance over heroic feats. The "little virtues": gentleness, humility, patience, simplicity.

**Best for.** Beginners. Family-life Catholics. Anyone burned by rigorism. Also: the rare reader who wants their plan of life to make them *kinder*, not more austere.

**Sources.** Francis de Sales, *Introduction to the Devout Life* (esp. Parts II & III); *Treatise on the Love of God*. Jane Frances de Chantal's letters.

---

## 4. Carmelite — Teresian

The plan rooted in St. Teresa of Ávila and St. John of the Cross. Mental prayer is the spine; everything else exists to make mental prayer possible.

| Cadence | Practices |
|---|---|
| Daily | **One hour of mental prayer** (uninterrupted, preferably morning) (`mental-prayer`) · Mass · Liturgy of the Hours (Lay Carmelites: minimum Lauds + Vespers) · Reading from Sacred Scripture · Reading from a Carmelite master (Teresa, John of the Cross, Thérèse, Elizabeth of the Trinity, Edith Stein) · Marian devotion — daily Rosary or Brown Scapular renewal · Examen · Recollection / silence cultivated during the day |
| Weekly | Confession · Holy Hour (Eucharistic adoration) (`holy-hour`) |
| Monthly | Day of recollection · Carmelite community meeting (for OCDS) |
| Annually | Retreat in a Carmelite house when possible · Renewal of promises (for OCDS) |

**Distinctive emphasis.** *Interior prayer*, *recollection*, *nada* (detachment), the Mansions / Dark Night progression. Solitude and silence as positive goods, not deprivations.

**Best for.** Contemplatives in the world. The introverted, the artistic, the disposition that wants depth over breadth. Anyone who has read *Interior Castle* and felt seen.

**Sources.** Teresa of Ávila, *Way of Perfection*, *Interior Castle*; John of the Cross, *Ascent of Mount Carmel*, *Dark Night*. **OCDS Rule of Life** (Secular Order of Discalced Carmelites, 2003 statutes). Thérèse of Lisieux, *Story of a Soul*.

---

## 5. Dominican — The Four Pillars (Lay Dominicans)

Domenican spirituality organized as a four-legged stool. If any pillar is missing the plan collapses.

| Pillar | Practices |
|---|---|
| **Prayer** | Daily: Liturgy of the Hours (minimum Lauds + Vespers + Compline) · Mass when possible · Daily Rosary (the Dominicans gave the Rosary its modern form) · Mental prayer |
| **Study** | Daily reading of Scripture · Ongoing study of theology, especially St. Thomas (the *Summa* in small daily portions is a classic plan) · Reading of Dominican saints (Aquinas, Catherine, Dominic, Lacordaire, Garrigou-Lagrange) |
| **Community** | Monthly chapter (fraternity) meeting · Spiritual friendship · Fraternal correction |
| **Apostolate** | "Contemplate and hand on to others the fruits of contemplation" — preaching, teaching, writing, catechesis appropriate to state in life |

**Cadence summary.** Daily: Hours + Rosary + study + Mass when possible. Weekly: confession. Monthly: chapter meeting + day of recollection. Annually: retreat at a Dominican priory when possible. Renewal of promises annually.

**Distinctive emphasis.** *Veritas* — truth as a path to holiness. Theological study is prayer, not preparation for prayer. *Contemplata aliis tradere*.

**Best for.** Catechists, teachers, the theologically curious, anyone whose love of God is mediated through the mind.

**Sources.** **Rule of the Lay Fraternities of St. Dominic** (1987). Garrigou-Lagrange, *The Three Ages of the Interior Life*. Jean-Pierre Torrell, *St. Thomas Aquinas*. Paul Murray, *The New Wine of Dominican Spirituality*.

---

## 6. Franciscan — Secular Franciscan Order (OFS)

Plan rooted in St. Francis's *Earlier Rule* and *Later Rule*, adapted for the laity by his Third Order (now Secular Franciscan Order, OFS). The *Rule of the OFS* (Paul VI, 1978) is the canonical statement.

| Cadence | Practices |
|---|---|
| Daily | Liturgy of the Hours — minimum **Lauds + Vespers** (the OFS Rule names these explicitly) · Eucharist when possible · Reading and living of the Gospel (`gospel-of-the-day`) · **Examination of conscience** at night · Penitential practice (the order is itself a "penitential" order — fasting, simplicity, almsgiving) · Marian devotion (Crown of Seven Joys / Franciscan Crown is the proper Franciscan rosary) |
| Weekly | Confession · Friday penance (above the Church's minimum) · Fraternity-life: outreach to the poor |
| Monthly | Fraternity meeting · Day of recollection |
| Annually | Retreat · Renewal of profession on the anniversary date |

**Distinctive emphasis.** *Conversion* (metanoia) as the central category — the rule calls Franciscans "penitents." *Minoritas* — being little, being last, refusing prestige. Joy in poverty. Creation as a sister-brother and not a resource.

**Best for.** Anyone moved by Francis. Activists, those drawn to voluntary simplicity, environmental conscience, peace work. The user who would like their plan to also be a *protest* against the consumer life.

**Sources.** **OFS Rule** (Paul VI, 1978) — read the whole thing, it's short. *General Constitutions of the OFS*. *Earlier* and *Later Rule* of St. Francis. Bonaventure, *The Soul's Journey into God*.

---

## 7. Benedictine — Oblate

Plan structured by the Rule of St. Benedict, adapted for laypeople affiliated with a monastery as *Oblates*. The Rule's two mottos — *Ora et Labora* (Pray and Work) and *Stabilitas* (Stability) — drive every choice.

| Cadence | Practices |
|---|---|
| Daily | **Liturgy of the Hours** — the Benedictine *opus Dei*, ideally Vigils/Matins + Lauds + Vespers + Compline; Oblates typically commit to Lauds + Vespers at minimum · Eucharist when possible · **Lectio divina** (15–30 min, slow scriptural reading in four moments: *lectio*, *meditatio*, *oratio*, *contemplatio*) · A period of manual or non-screen *labora* offered as prayer · Silence at specified times (cars off, devices off) · Hospitality (every guest received "as Christ") |
| Weekly | Confession · Stricter silence on a chosen day · Re-reading a passage of the Rule (the Rule is divided into a 3-times-per-year reading cycle by the Rule itself, ch. 73) |
| Monthly | Oblate gathering at the abbey when possible · Day of recollection |
| Annually | Retreat at the abbey · Renewal of oblation |

**Distinctive emphasis.** *Stability* — a vow not to keep changing parishes / spiritual directions / methods. *Conversatio morum* — daily conversion of manners. The day is shaped by the bell, not the to-do list. Time itself is liturgical.

**Best for.** Anyone whose pull is for *rhythm* and *place* rather than feats. Homemakers, retirees, monastic-leaning seculars. The user living near a monastery.

**Sources.** **Rule of St. Benedict** (RB, esp. chapters 4, 16, 19, 48, 53, 73). Esther de Waal, *Seeking God: The Way of St. Benedict*. Norvene Vest, *Preferring Christ*. The oblate program of any Benedictine monastery has its own *Statutes*.

---

## 8. Marian — Total Consecration (Montfortian)

The plan organized around Marian consecration as a permanent state. Distinct from "having a Marian devotion": here the consecration *is* the spiritual life and everything else flows from it.

| Cadence | Practices |
|---|---|
| Daily | **Renewal of consecration** (one of the short formulas, e.g., the *Ave Maris Stella* or "I am all yours, my Queen and my Mother") · Holy Rosary — **15 decades** in the classical Montfortian plan, or 5 with the Luminous on Thursdays · Morning offering through Mary · Mass + Communion offered through Mary's hands · Marian aspirations throughout the day · A small act of mortification offered for souls |
| Weekly | Confession · Saturday devotion to Our Lady (Mass, Office of the BVM, or extended Marian prayer) (`little-office-bvm`) · Brown Scapular renewal |
| Monthly | First Saturday Communion of Reparation (per Fátima) · Day of recollection on a Marian theme |
| Annually | **33-day renewal of the Consecration** — Montfort's preparation in stages (knowledge of self, of Mary, of Jesus through Mary), culminating on a Marian feast (`total-consecration` is in the corpus) · Pilgrimage to a Marian shrine if possible |

**Distinctive emphasis.** *Per Mariam ad Jesum*. The shortest, easiest, and surest way to holiness is through Mary. Sees all spiritual gifts as flowing through her mediation by Christ's will.

**Best for.** Anyone with a deep Marian pull. Those who want a plan whose annual rhythm is dominated by Marian feasts (Immaculate Conception, Annunciation, Assumption, Queenship). Often combined with another tradition's plan (e.g., a Carmelite who lives the Total Consecration).

**Sources.** **Louis de Montfort, *True Devotion to Mary*** and *The Secret of Mary*. *Treatise on the True Devotion* contains both the formula and the 33-day method. Maximilian Kolbe's *Letters* (Militia Immaculatae). Fátima writings of Lúcia.

---

## 9. Sacred Heart — Apostleship of Prayer / First Fridays

The plan organized around devotion to the Sacred Heart, reparation, and the *promises to St. Margaret Mary Alacoque*. The Apostleship of Prayer (now the Pope's Worldwide Prayer Network) gives this plan its modern, lay-accessible form.

| Cadence | Practices |
|---|---|
| Daily | **Morning Offering** to the Sacred Heart for the Pope's monthly intention (`morning-offering-sacred-heart`) · Mass + Communion offered in reparation · Aspirations to the Sacred Heart ("Sacred Heart of Jesus, have mercy on us"; "Sweet Heart of Jesus, be my love") · Brief evening review of the day's reparation |
| Weekly | Confession · **Thursday Holy Hour** (St. Margaret Mary's "Hour of Reparation," 11pm–midnight in the original; a Thursday evening adaptation works) · Friday voluntary penance for reparation |
| Monthly | **First Friday Communion of Reparation** — the nine-month classical sequence; once completed, kept up perpetually (`first-friday-devotion`) · Reading on the Sacred Heart (St. John Eudes, St. Margaret Mary's *Autobiography*, Garrigou-Lagrange's *Three Ages*) |
| Annually | Solemnity of the Sacred Heart (movable, Friday after Corpus Christi octave) — major spiritual moment · **Enthronement of the Sacred Heart in the home** — annual renewal |

**Distinctive emphasis.** *Reparation* and *consolation* of Christ. Sees the spiritual life primarily as friendship with the wounded, loving Heart of Jesus. The Apostleship of Prayer further frames all of one's actions as an offering joined to Christ's continual self-offering for the world.

**Best for.** Anyone moved by reparation. Those whose spiritual life is intercessory by nature. The Pope's monthly intention adds an ecclesial dimension. Frequently the chosen plan of priests and active intercessors.

**Sources.** St. Margaret Mary Alacoque, *Autobiography* and *Letters*. Pius XII, *Haurietis Aquas* (1956 — magisterial charter of the devotion). Henri Ramière, *The Apostleship of Prayer*. Current network: popesprayer.va. *Enthronement* by Fr. Mateo Crawley-Boevey.

---

## 10. Divine Mercy — St. Faustina

> "The greater the sinner, the greater the right he has to My mercy." — *Diary*, §723

The plan rooted in the *Diary* of St. Faustina Kowalska (Poland, 1905–1938) and the apparitions of the Merciful Jesus at Płock and Vilnius. Distinct enough from the Sacred Heart plan to ship separately: where Margaret Mary's tradition is reparation-centered (consoling the wounded Christ), Faustina's is trust-centered (throwing oneself into the wounded Christ's mercy). Codified through her *Diary*, given a Universal Church shape by John Paul II's 2000 canonization, the institution of Divine Mercy Sunday, and *Dives in Misericordia*.

| Cadence | Practices |
|---|---|
| Daily | Morning consecration with the trust formula ("Jesus, I trust in You") · Mass + Communion when possible · **The Chaplet of Divine Mercy** at the **Hour of Mercy** (3:00 PM, the hour of Christ's death) — Faustina's *Diary* §1320: "at three o'clock implore My mercy, especially for sinners" (`chaplet-of-divine-mercy`) · **Three daily acts of mercy** — one of word, one of deed, one of prayer (*Diary* §742 — "I demand from you deeds of mercy, which are to arise out of love for Me") · Veneration of the Image of Divine Mercy in the home · Examen at night focused on trust and mercy received/given |
| Weekly | Confession (frequent — Faustina's spirituality requires a clean heart for the trust to be operative) · Friday: meditation on the Passion and the Image |
| Monthly | First Friday Communion (pairs naturally with the Sacred Heart practice — many practitioners live both devotions side by side) · A *Divine Mercy* reading from the *Diary* (it is long enough to last years at small daily doses) |
| Annually | **Divine Mercy Novena** beginning Good Friday — nine days, each with a specific group offered: all humankind / priests and religious / devout and faithful / those who do not know Jesus / separated brethren / meek and humble souls / souls in Purgatory / souls who venerate the Mercy / lukewarm souls (`divine-mercy-novena`) · **Divine Mercy Sunday** (Octave of Easter) — plenary indulgence under the usual conditions, received in the spirit of trust and mercy · Pilgrimage to the Shrine of Divine Mercy at Łagiewniki (Kraków) when possible |

**Distinctive emphasis.** *Trust* as the keystone virtue and as the implicit measure of every other practice ("the graces of My mercy are drawn by means of one vessel only, and that is — trust" — *Diary* §1578). Christ's mercy is greater than any sin; the worst sinners therefore have the most right to it. The plan replaces fear with abandonment. The Image is a quasi-sacramental sign (Christ in white with red and pale rays from His side), placed in the home and venerated daily.

**Best for.** The over-scrupulous (Faustina is the patron saint of the recovering scrupulant). Converts and reverts coming from far away ("the greater the sinner..."). The dying and those who pray for them — Faustina was given the Chaplet of Divine Mercy explicitly for the dying. **Strongly pt-BR-relevant** — Brazil is one of the heartlands of the devotion alongside Poland and the US. Pairs naturally with a Marian plan rather than competing with it.

**Sources.** **St. Faustina Kowalska, *Diary: Divine Mercy in My Soul*** (the foundational text; the Chaplet, the Image, the Hour, the Novena, and Divine Mercy Sunday all originate here). John Paul II, *Dives in Misericordia* (1980). Ignacy Różycki, *Theological Analysis of the Divine Mercy Devotion* (the assessment commissioned for the cause of canonization — the authoritative theological framing). George Kosicki, *Divine Mercy Minutes with Jesus*. Robert Stackpole, *Divine Mercy: A Guide from Genesis to Benedict XVI*.

---

## 11. Cursillo — The Tripod (Piety, Study, Action)

Plan of life developed in mid-20th-century Spain for laypeople who have made the Cursillo weekend. Built on three legs ("the tripod") — remove any leg and the stool falls. Distinctively post-conciliar in tone and explicitly evangelical.

| Leg | Practices |
|---|---|
| **Piety** | Daily: morning offering · Mass when possible · Mental prayer / spiritual reading (10–15 min minimum) · Rosary (or one decade for beginners) · Visit to Blessed Sacrament · Examen at night · Frequent confession |
| **Study** | Daily: 15–30 min of intentional spiritual / theological reading. Cursillo emphasizes ongoing formation — Scripture, catechism, papal documents, lives of saints. Goal: *understand* the faith well enough to live and share it |
| **Action** | Daily: a chosen apostolic action — witness in one's "environment" (family, work, friendships) appropriate to state in life. Direct evangelization, mercy works, presence-in-the-world |

**Cadence summary.** Daily: tripod (each leg has a daily minimum). Weekly: **Group Reunion** (small group of 3–5, sharing what worked / didn't on the tripod that week, called a "Friendship Group") + **Ultreya** (larger community gathering, monthly in practice). Annually: a retreat / renewal weekend.

**Distinctive emphasis.** *Make a friend, be a friend, bring your friend to Christ.* The plan is irreducibly social — solo Cursillistas are considered incomplete. Each daily practice has a *witness* dimension.

**Best for.** Extroverts. Married couples (who can do the tripod together). Those who want their plan of life to be communal and missionary, not solitary. Anyone for whom "just me and God" feels like half the story.

**Sources.** Eduardo Bonnín, *History and Memory of Cursillo*. *Cursillo Foundational Charter* (1990). *Group Reunion* and *Ultreya* leaflets from the National Cursillo Movement. *De Colores* hymnal.

---

## 12. Legion of Mary

A specific, codified plan for active Marian apostles. Distinctive in that the *apostolic work itself* is a weekly required commitment — not a daily aspiration.

| Cadence | Practices |
|---|---|
| Daily | **Full Rosary (5 decades minimum)** — non-negotiable (`rosary`) · **Catena Legionis** (the Magnificat with antiphon and prayers — short, midday) · Morning offering · Mass when possible |
| Weekly | **Praesidium meeting** (the Legion's weekly cell meeting — prayer, report, allocation, spiritual reading from the *Handbook*) · **Two hours of apostolic work** allocated at the meeting (door-to-door evangelization, hospital visits, parish work, etc.) · Confession (recommended frequent) |
| Monthly | Reading of an assigned section of the *Handbook* · Officers' meeting (for officers) |
| Annually | **Acies** (consecration renewal to Mary as Mediatrix on/near March 25) · Annual retreat |

**Distinctive emphasis.** *Allegiance* (the word "Legion" is military-Marian). Mary as commander; the legionary as her instrument. Apostolic work is *required*, not optional. Spirituality is inseparable from systematic outreach.

**Best for.** The temperamentally apostolic. Those who want a plan with concrete weekly *external* deliverables, not just internal ones. Parishes with active praesidia.

**Sources.** **The Official Handbook of the Legion of Mary** (Frank Duff, frequently revised; still the canonical text). Frank Duff, *Can We Be Saints?* and *Mary Shall Reign*.

---

## 13. Sulpician — Adoration / Communion / Cooperation

The plan developed by Jean-Jacques Olier at the French school of spirituality (17th c.), formative for Vincent de Paul, Jean Eudes, and centuries of seminarian and priestly formation. Lay-adaptable.

| Cadence | Practices |
|---|---|
| Daily | **Mental prayer in three movements** (the Sulpician method, ~30 min): **Adoration** (Jesus before our eyes — contemplate Him in a mystery), **Communion** (Jesus in our hearts — receive Him, identify with Him in that mystery), **Cooperation** (Jesus in our hands — concrete resolution to live that mystery today) · Holy Mass + Communion · Spiritual reading · Recollection / *sentire cum Christo* throughout the day · Brief examen at night |
| Weekly | Confession · Day of more rigorous recollection |
| Monthly | Day of recollection structured by the same Adoration/Communion/Cooperation rhythm applied to the past month |
| Annually | Retreat |

**Distinctive emphasis.** *Christ-centric mysticism* — the spiritual life is lived as *putting on the mysteries of Christ* (his Incarnation, his Hidden Life, his Public Life, his Passion, his Eucharistic Life, his Glorification). The user is not pursuing "virtues" abstractly but a specific aspect of Christ.

**Best for.** Those with mystical-Christological pull. Anyone trained or formed in priestly tradition. Often paired well with the Liturgy of the Hours, which already cycles through Christ's mysteries.

**Sources.** Jean-Jacques Olier, *Pietas Seminarii Sancti Sulpitii*; *Catechism of the Interior Life*. Pierre de Bérulle, *Discours de l'estat et des grandeurs de Jésus*. Raymond Deville, *The French School of Spirituality: An Introduction and Reader*.

---

## 14. The Little Way (Thérèse of Lisieux)

Not a separate canonical plan but a *temper* applied to any other plan. Sufficiently distinct to ship as its own starter — many users want exactly this and would be put off by Opus Dei's rigor or the Legion's outward push.

| Cadence | Practices |
|---|---|
| Daily | Morning offering to Jesus through Mary · Mass when possible · A short period of mental prayer or Gospel reading (10–15 min is enough — Thérèse herself struggled with longer mental prayer) · Rosary or a portion of it · **Small acts of love** named throughout the day (smile, swallowed retort, hidden kindness, mortification of curiosity) · An evening "sacrifice flower" count or noticing of the day's little fidelities · Aspirations of trust and offering |
| Weekly | Confession (gently — Thérèse warned against scrupulosity) · Slightly extended Eucharistic adoration if available |
| Monthly | Day of recollection — gentle, no grand resolutions · Reading from *Story of a Soul* / Thérèse's letters / her counsels |
| Annually | Retreat — Thérèse-style: simple, trustful, no spiritual high-pressure |

**Distinctive emphasis.** *Childhood of soul*. *Smallness* as positive vocation. The conviction that doing ordinary things with great love is the surest path, and that scrupulosity, big resolutions, and spiritual ambition are themselves obstacles to holiness. *Confidence* and *love* over feats.

**Best for.** Beginners. Recovering scrupulants. The temperamentally gentle. Mothers of small children. The chronically ill. Anyone for whom a heroic plan is itself a temptation against trust.

**Sources.** Thérèse of Lisieux, *Story of a Soul* (esp. Manuscript B); *Letters*; *Last Conversations* (*Yellow Notebook*). Hans Urs von Balthasar, *Thérèse of Lisieux: The Story of a Mission*.

---

## 15. Byzantine / Eastern Catholic

A plan rooted in the Christian East — particularly the hesychast tradition. Ember would offer this as an Eastern Catholic option (the same plan works in Orthodox practice but Ember is a Catholic app).

| Cadence | Practices |
|---|---|
| Daily | **Morning Prayers** (the *Trisagion Prayers*, *Psalm 50/51*, the *Symbol of Faith / Creed*, a series of intercessions; ~10 min) · **Evening Prayers** (similar structure with Compline elements) · **Jesus Prayer** as continuous prayer through the day — "Lord Jesus Christ, Son of God, have mercy on me, a sinner" (a knotted prayer rope / *chotki* counts repetitions; 100, 300, or 500 per day depending on stage) · Daily Divine Liturgy when possible · A *kathisma* of psalms (the Byzantine psalter is divided into 20 *kathismata*; one per day rotates the whole psalter weekly in monasteries, less often in the world) · Bow / prostration practice depending on season |
| Weekly | **Wednesday and Friday fast** (no meat, dairy, oil, or wine in strict observance — much milder forms exist) · Confession (often less frequent than Roman practice but more deeply prepared) · Saturday: commemoration of the departed; Sunday: Resurrection celebration |
| Monthly | Akathist or Paraklesis to the Theotokos or to a chosen saint · Spiritual father / mother conversation |
| Annually | **The four great fasts**: Great Lent (40+ days before Pascha), Apostles' Fast (variable, before Sts. Peter and Paul), Dormition Fast (Aug 1–14), Nativity Fast (Nov 15 – Dec 24). Each has its own fasting discipline and proper liturgies. Pilgrimage if possible |

**Distinctive emphasis.** *Theosis* — divinization, becoming by grace what Christ is by nature. *Hesychia* — stillness, watchfulness of the heart. The body as full participant in prayer (prostrations, the breath in the Jesus Prayer). The liturgical year as the actual structure of one's interior life. The icons as windows.

**Best for.** Eastern Catholics (Ukrainian, Melkite, Maronite, Syro-Malabar, etc.). Roman Catholics drawn to the East. Anyone who wants a more *bodily* plan and a stronger liturgical calendar.

**Sources.** *Philokalia* (esp. vols. 1, 4). *The Way of a Pilgrim*. *The Pilgrim Continues His Way*. Kallistos Ware, *The Orthodox Way*. Liturgicon of the user's specific Eastern Catholic Church. Andrew Louth, *Greek East and Latin West*.

---

## 16. The Beginner's Bare Minimum

Not a tradition but a deliberately small starter plan. Indispensable: the first-week user, the lapsed Catholic returning, the curious. A plan they can actually keep, sized to *prove* that a plan of life is possible.

| Cadence | Practices |
|---|---|
| Daily | A simple **morning offering** (a single sentence, e.g., "My God, I offer you this day; help me to love you and my neighbor today") · One **Our Father** or one decade of the Rosary (`our-father`, `rosary`) · A 60-second **examen at night** ("Where did I love today? Where did I fall short? Thank you and sorry.") |
| Weekly | **Sunday Mass** (`mass`) — the only non-negotiable |
| Monthly | **Sacramental Confession** (`confession`) — even if "nothing big," to keep the habit |
| Annually | Read **one** spiritual book (any — *Story of a Soul*, *Introduction to the Devout Life*, *He Leadeth Me*, *Mere Christianity*) |

**Distinctive emphasis.** *Achievability*. The user is not at a starting line for asceticism; they are at a starting line for *consistency*. Better to keep this for a year than fail at Opus Dei in a month.

**Best for.** First-time users. Reverts. Catholics returning after 20 years. Catholics married to non-believers. Anyone whose honest reaction to the other 14 templates is "no way."

**Sources.** No single primary source — this is the pastoral minimum implicit in most Catholic catechetical material (catechism, *YOUCAT*, parish RCIA reception kits). Hardon's *Pocket Catholic Catechism* and Peter Kreeft's *Prayer for Beginners* both sketch versions of it.

---

## Honorable mentions — schools worth considering for v1.1+

- **Brother Lawrence — *Practice of the Presence of God*.** Not a structured plan but a *single discipline* (continual recollection of God during work). Ship as a *layer* on top of any other plan rather than a standalone template.
- **Communion & Liberation.** Daily Lauds + Vespers, *School of Community* (weekly text reading + small group), pilgrimage culture. Distinctive *evental* spirituality (God reaches us through encounter, not method). Strong in Italy/Brazil — relevant for pt-BR users.
- **Neocatechumenal Way.** Daily Hours, weekly Eucharist in the small community, monthly catechesis, "scrutinies." Highly communal; cannot be lived solo. Skip for v1 (the plan only works if the user has a Way community nearby).
- **Charismatic Renewal.** Daily personal prayer with charismatic emphasis (praying in tongues, intercessory prayer, prayer ministry), weekly prayer meeting. Plan-of-life form is less codified than the others. Probably a layer rather than a template.
- **Holy Family — married-couple plan.** Common Rosary, joint examen, blessing of children at bedtime, monthly date as part of the rule. A wonderful state-of-life adaptation; could ship as a "couples mode" of any of the 15 above.

---

## How this maps to Ember

A template in Ember is *not* a unique data model — it is a starter pack composed of:

1. **A set of practices to pin**, with default tier (essential / important / ideal), default time block (Morning / Midday / Evening / Night / Anytime), and default schedule (daily / day-of-week / monthly).
2. **A short manifesto** — 1–3 paragraphs of "what this plan is and who it's for," shown on the template preview.
3. **Optionally, suggested seasonal / annual resolutions** to pre-fill in the Resolutions panel ([[project-primitives-renderer]]; see `docs/features/spiritual-threads/04-plan-of-life.md`).
4. **Optionally, a recommended collection** of books / chapters / propers to pin alongside (e.g., the Carmelite template pins *Interior Castle*, *Story of a Soul*, *Ascent of Mount Carmel*).

What's already in the corpus today (`content/practices/*`) covers the spine of most templates: `mass`, `rosary`, `examination-of-conscience`, `mental-prayer`, `morning-offering`, `morning-offering-sacred-heart`, `angelus`, `confession`, `holy-hour`, `little-office-bvm`, `gospel-of-the-day`, `first-friday-devotion`, `total-consecration`, `chaplet-of-divine-mercy`, `divine-mercy-novena`, the litanies, the acts, etc. The Liturgy of the Hours story (`dwdo`, the eventual real `breviary`) covers Benedictine, Dominican, Franciscan, Carmelite. The Eastern template is the only one with significant *new content* to author: a daily morning prayer rule, a Jesus Prayer practice, a *Trisagion* prayer, a Byzantine fasting calendar.

A first-cut template ordering for v1, sized to the user's likely audience:

1. **The Beginner's Bare Minimum** (default — picked when the user can't or won't choose)
2. **Salesian** (the friendliest "real" plan)
3. **Opus Dei** (the most complete and most-requested)
4. **Ignatian** (the discerner's plan)
5. **The Little Way** (the gentle / scrupulous user's plan)
6. **Marian Total Consecration** (very-pt-BR-relevant)
7. **Divine Mercy** (very-pt-BR-relevant; pairs with Marian or Sacred Heart)
8. **Sacred Heart / First Fridays** (pairs well with pt-BR devotion)
9. **Carmelite**
10. **Dominican**
11. **Franciscan**
12. **Benedictine Oblate**
13. **Cursillo** (pt-BR strong — Brazil has a deep Cursillo culture)
14. **Legion of Mary**
15. **Sulpician**
16. **Byzantine** (Eastern Catholic users)

Each ships as a JSON file under `content/plan-of-life-templates/<id>/manifest.json` (proposed location — finalize when the feature is specced). The corpus pipeline (`scripts/build-corpus.py`) extends to index these as another first-class corpus kind, served at `/hearth/v2/plan-of-life-templates/`. The onboarding flow asks the user three questions (state-of-life, temperament, time available) and recommends 2–3; the user can always browse the full list.

When the feature is greenlit, the spec lives in `docs/features/plan-of-life-templates/` (multi-phase folder like `spiritual-threads/`), with this file referenced as the source-of-content for the template manifests.
