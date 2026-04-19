# Overlay — Traditional-leaning

> **Not a profile.** Modifies any of 01–09. Triggered by one yes/no at L4.5.

## Signal

L4.5 question (paraphrase): "Is the Traditional Latin Mass, or classical pre-Vatican-II spirituality, a strong attraction for you?"

Yes → overlay set.

The wording must be careful: this is not a political question and is not a liturgy-wars question. The app does not take a side and does not need the user to take one. What this overlay marks is simply that the user is drawn toward the pre-conciliar spiritual tradition — which meaningfully changes what content will resonate, what practices will be received, and what warnings are relevant.

## What this overlay marks

A soul attracted to:
- The Traditional Latin Mass (Tridentine / Extraordinary Form / Usus Antiquior).
- Pre-Vatican II devotional manuals (e.g., *My Daily Bread*, older catechisms, the older Divine Office).
- Classical ascetical and mystical tradition — the Fathers, the Rhineland mystics, the Spanish Carmelites, pre-20th-century Jesuit formation.
- Chant and polyphony in liturgy.
- Older sacramental discipline — Eucharistic fast extending beyond the minimum, head coverings for women, frequent sacramental confession.
- Marian consecration, Scapulars, First Friday / First Saturday devotions.

The attraction may be aesthetic, temperamental, theological, or a combination. The app does not need to adjudicate which; it needs to serve the soul at whatever mix is present.

## Modifications to the host profile

1. **Offer older devotional content where it exists.** `base/practices/rosary` (traditional 15-decade form is available as a variant), Stations of the Cross, First Friday / First Saturday, the Angelus, Marian antiphons. The library `alphonsus-liguori` and `montfort-spirituality` already lean this direction.
2. **Latin text where authentic.** Prayers that have a canonical Latin original (Pater Noster, Ave Maria, Regina Caeli, Salve Regina, Te Deum) should surface with Latin as an available language, not hidden. Already supported in the prayer JSON schema.
3. **Classical-spirituality book catalog foregrounded.** *Imitation of Christ*, *Introduction to the Devout Life*, *True Devotion to Mary*, *The Spiritual Combat*, *Abandonment to Divine Providence*, *The Soul of the Apostolate*, *The Sinner's Guide* — several are already installed via `alphonsus-liguori` and `montfort-spirituality`.
4. **EF Mass propers.** The app already supports EF propers via `content/propers/`. For this overlay, surface them by default on the Mass practice. The user's preferred form remains their setting; the overlay is a hint, not a hard override.
5. **Divine Office in pre-conciliar form.** If/when the Breviary track ships a 1962-style Office, it is the natural fit for this overlay. Until then, the current DWDO implementation remains.
6. **Less "ecumenical" framing.** Not adversarial — never adversarial — but the softening language of "many Christians, each in their own way" is not the tone of classical Catholic tradition, and this overlay's user is not looking for it. Name Catholic things Catholicly.

## Warnings specific to the overlay

- **Orthodoxy is not holiness.** The one warning that must be present in every version of every profile with this overlay. A soul drawn to the TLM who does not pray is not more holy than a soul at a vernacular parish who prays daily. The traditional forms exist to produce saints; they are means, not ends. State this plainly in at least one place in the starter track, without being preachy about it.
- **The Church is not shrinking to the remnant.** Some in this overlay carry a narrative of the Church as corrupted-post-1965 and themselves as a remnant. This narrative has pastoral costs: isolation, bitterness, contempt for fellow Catholics, functional schism of heart if not of canon. The app cannot fix this, and must not feed it. Copy should gently name the whole Church as mother — including the parish the user may not attend.
- **The aesthetic-preference-as-doctrine trap.** Liturgical music taste, Latin preference, ad-orientem posture, Communion on the tongue — these are legitimate preferences with real history. Treating them as markers of orthodoxy rather than preferences is the recurring pattern to gently un-do. `base/chapters/what-the-mass-is` addresses transubstantiation and the Real Presence in terms that do not depend on form; use it here deliberately.
- **The "spiritual reading arms race."** Traditional-leaning users sometimes read aggressively — 19th-century manuals, Dominican moral theology, the older saints in Latin. The risk is that reading becomes performance. The same pacing advice as profile 04 applies: less, slower, deeper.
- **The self-identification question.** "Traditional Catholic" is a label that means different things at different strengths (occasional TLM / exclusively TLM / sedevacantist-adjacent). The app is not the place to sort that out, but the copy should not flatter strong identifications.

## Which profiles does this most often attach to

- **04 Apologetics Nerd** — common. Converts through apologetics + classical preference.
- **06 Sacramental Baseline** — moderate. A cradle Catholic who has moved from Novus Ordo minimum to traditional forms.
- **07 Committed Practitioner** — common. Has integrated traditional forms into a stable rhythm.
- **09 Formed Wellspring** — very common. Has made traditional spirituality her lifelong framework.
- **03 Lapsed Returner** — occasional. Returned specifically *through* encountering traditional forms, not back to the Novus Ordo parish of childhood.
- Rare on 01, 02, 05, 08.

## Reading for the overlay

- *The Imitation of Christ* — `base`-compatible; universally traditional.
- *True Devotion to Mary* (Montfort) — `montfort-spirituality` library ships with this.
- *Alphonsus Liguori* (installed as a library) — several works; `uniformity-with-gods-will`, *The Glories of Mary* (long; prune), *The Great Means of Salvation and Perfection*.
- *The Spiritual Combat* (Scupoli) — short, dense, classical ascetical form. Not yet in the library as of 2026-04-19 — a candidate for addition.
- *My Daily Bread* (Paone) — a pre-conciliar daily meditation text in a three-book format; still widely used.
- Breviary / Divine Office in 1962 form when available.

## Notes for the chapter author

- A chapter **"The Form and the Fire"** — specifically addressing form-vs-holiness distinction for this overlay — would be valuable. Short, warm, not combative.
- A chapter **"Praying the Mass, Whichever Form You Pray"** — naming that the interior dispositions of prayer at Mass (recollection, offering of self with Christ, thanksgiving after communion) are form-agnostic. `what-the-mass-is` §5 ("Interior Participation") is the start of this material; could be expanded into a standalone chapter if the overlay warrants it.
