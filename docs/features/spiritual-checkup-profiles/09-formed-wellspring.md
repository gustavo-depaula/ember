# 09 — The Well-Formed Seeking Wellspring

> **Primary archetype:** Perseverans (or Proficiens/Perseverans with Contemplativus secondary)
> **Secondary (tension pair):** `{ Contemplativus — "I want deeper silence with the Lord", Perseverans — "I want steadiness and support under long faithfulness" }`
> **Overlays possible:** traditional-leaning (common and integrated — this profile often has settled into classical spirituality), scrupulosity (uncommon at this phase), convert (possible — many in this profile came in as adults 10+ years ago)

## Who this is

A soul who **already lives a settled advanced rhythm** — daily Mass or near-daily, daily mental prayer (often 30+ minutes), weekly or more-frequent confession, Divine Office in some form (short or long), substantial spiritual reading, and in most cases a relationship with a spiritual director. The questions a starter track would prescribe are, for this soul, long since answered. She is not here because she is stuck or confused — she is here because she is **looking for material**: saints she has not met, classics she has not read, practices she has not yet integrated, or simply a way to keep the app from reinventing what she already does.

This is the soul the user explicitly named in the redesign brief: *"well-formed people who just need a wellspring to draw from."*

The formation apparatus of the app — the starter tracks, the how-to chapters, the weekly formation content — is simply not the right product for this profile. The app's **library** is.

Signals: "I already pray the Office" — "I've done Total Consecration three times" — "I'm looking for material, not a plan" — "I don't need formation chapters; I've read the classics" — "I want the app to help me keep what I already do, not reshape it."

## Route through the tree

L1=E ("I'm advanced...") → L2 branches on interior state. This profile is reached by **"I'm already in a settled advanced rhythm. I'm here for support and sources, not a plan."**

L3 is skipped. L4 tension pair picks the secondary. This is the shortest-path leaf in the tree — 3 questions. That is correct: this soul's time is worth not wasting.

## Starting tension

The well-formed soul's characteristic risk is not a spiritual one — it is a *product* one. **She will abandon the app** if it treats her like a beginner. The risk is not that she will be mis-formed; the risk is that the app will fail to serve her and she will (rightly) conclude that it is not for her. The correction is to **recognize the profile and shift the app's posture accordingly**:

- Less formation, more library.
- Less "today's next step," more "today's reading from the Fathers."
- Less quiz interiority, more silent scaffolding.
- Fewer shortcut rows, more depth of content.

This is the profile for whom the Content Platform pillar (`docs/README.md`, Wisdom) most directly exists.

## What to offer first

- **Do not offer a starter track.** She does not need one. If the app insists on offering something: a week-long "wellspring sampler" — different classical sources each day (one from the Fathers, one from a Carmelite, one from a Dominican, one from the Jesuits, one from a Benedictine, one poem, one icon/image). The point is to show the library's range.
- **The Content Platform / Library index**, highlighted: *Imitation of Christ*, *Introduction to the Devout Life*, *Way of Perfection*, *Ascent of Mount Carmel*, *The Spiritual Combat*, *Interior Castle*, *Story of a Soul*, *The Dialogue* (St. Catherine), *Abandonment to Divine Providence* (de Caussade), *True Devotion* (Montfort), *Practice of the Presence of God* (Brother Lawrence), *The Soul of the Apostolate* (Chautard), Divine Office, Fathers of the Church in translation.
- **Book-integrated daily reading.** The app already supports this for installed books (`base` + `alphonsus-liguori` + `montfort-spirituality`). Suggest: one classic at a time, one chapter a day.
- **Advanced practices the app already has** — Total Consecration, Holy Hour, Stations (in Lent), Chaplet of Divine Mercy at 3pm, First Friday / First Saturday devotions.
- **Liturgical calendar as spine.** The Divine Office or at least Compline + Vespers; the Mass propers; commemoration of saints. The app's liturgical engine (`@ember/liturgical`) is built precisely to serve this profile.
- **A single question at completion:** *"What would you like to read through this year?"* — with a curated list of ~12 options, one per month. This is the most useful thing the checkup can do for this profile.

## What NOT to offer first

- **Not formation chapters.** She has read better or equal treatments. Chapters like `how-to-pray`, `ignatian-examen`, `mental-prayer-carmelite-method`, etc. are not for her (though she may browse them occasionally to compare framings).
- **Not starter tracks.** See above.
- **Not "add one practice per week" pacing.** Her pacing is set.
- **Not "let us assess whether you are in X phase."** She is not here for diagnosis.
- **Not gamification.** No streaks, no completion percentages, no badges. The app should be quieter in this profile's interface, not louder.
- **Not apologetic content.** She is past that phase.
- **Not apps-within-apps.** Confessio, Memoria, Kyrie, etc. are the app's attempt to serve several profiles at once. For this profile, the most useful quick-access is: the Office, the Mass of the day, the saint of the day, the classic she is currently reading.

## Two-week shape

**Week 1 — "the wellspring sampler":**
- Keep current rhythm untouched.
- Daily: one short excerpt from a different classical source each day of the week, drawn from the library.
- At the end of the week: a single question — "which sources resonated most?" — to inform ongoing curation.

**Week 2 — "begin a classic":**
- Begin one book at one chapter a day. Recommend starting with `montfort-true-devotion` or `alphonsus-liguori`'s *Uniformity with God's Will* if not already read; otherwise let the user choose.
- Saint-of-the-day integration visible on the home screen.
- Feast-day liturgical content surfaced.

**Month 2+:**
- Continue the current book.
- Introduce another classical practice if not yet integrated — e.g., a yearly general confession, a retreat schedule, the Ignatian exercises in a 30-day or annotated form if a director supports it.

## Pastoral warnings

- **The "I know this already" fatigue.** Even the well-formed can benefit from re-reading a classic; the danger is that the app's voice layers a *novelty* expectation ("look at this exciting thing we found for you") on top of material the user has known for decades. Voice should be neutral, library-curator — not evangelistic, not novice-leading.
- **The isolation risk.** Well-formed souls at mid-life sometimes drift into a private spiritual life disconnected from parish, family catechesis, and lay apostolate. The profile's tone should invite outward-facing action (teach CCD, mentor a younger Catholic, serve in a conscious concrete way) without being preachy about it.
- **The taste-as-orthodoxy confusion.** Settled devotional taste (TLM, classical art, specific saints) is legitimate. Treating one's taste as a measure of others' orthodoxy is a trap. The profile copy can hold this lightly: *the Church is larger than one's preferred form of it*.
- **The "checkup was useful for nothing" response.** If the tree is designed correctly, this profile should *confirm* that the app is a serious tool, not a toy. The 3-question path itself is the signal. Resist the urge to pad.

## Notes for the chapter author

- **No new formation chapters are needed for this profile specifically.** What is needed is **library curation** — which is already the Content Platform pillar's work and sits outside the scope of this redesign.
- A single short chapter or in-app document titled **"What This App Is (and Isn't) For Someone Like You"** could honestly name the relationship — the app as library and liturgical calendar, not as spiritual director — and ship with respect for the user's formation.
- The **saint of the day**, **liturgical day metadata**, and **Office/Mass-of-the-day** features are the spine of this profile's ongoing engagement. Continued investment there serves this profile more than any formation content could.
