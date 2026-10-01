# Batches

Every card of `docs/plans/holy-cards-catalog.md`, made 10 at a time; each batch is committed and pushed to main on its own. A batch is done when its ids are ticked in `docs/plans/holy-cards-catalog.md` and its cards exist in `content/practices/saint-of-the-day/data/holy-cards/`; that, not this file, is the status.

| Batch | Saints (card ids) |
|---|---|
| 1 | john_bosco, scholastica, pius_x, teresa_benedicta, martha_mary_lazarus, basil_gregory, anthony_abbot, polycarp, hildegard, rita_cascia |
| 2 | cornelius_cyprian, justin, irenaeus, boniface, charles_lwanga, paul_miki, andrew_kim, andrew_dung_lac, josaphat, stanislaus |
| 3 | timothy_titus, cyril_methodius, john_baptist_de_la_salle, teresa_calcutta; Roman Canon saints off the calendar: linus, cletus, chrysogonus, john_paul_martyrs, alexander, anastasia |
| 4 | john_paul_ii, john_xxiii, paul_vi, maria_goretti, josephine_bakhita, martin_de_porres, juan_diego, charbel, josemaria_escriva, catherine_alexandria |
| 5 | jose_anchieta, benedito, frei_galvao, inacio_azevedo, andre_soveral, blase, vincent_saragossa, fabian, angela_merici, frances_rome |
| 6 | john_of_god, cyril_jerusalem, francis_paola, vincent_ferrer, anselm, louis_de_montfort, pius_v, bernardine_siena, christopher_magallanes, bede |
| 7 | norbert, ephrem, fisher_more, cyril_alexandria, elizabeth_portugal, camillus, lawrence_brindisi, peter_chrysologus, peter_julian_eymard, sixtus_ii |
| 8 | cajetan, jane_frances_chantal, stephen_hungary, louis_france, peter_claver, robert_bellarmine, januarius, cosmas_damian, wenceslaus, lawrence_ruiz |
| 9 | bruno, denis, hedwig, north_american_martyrs, paul_of_the_cross, john_capistrano, anthony_claret, albert_great, margaret_scotland, gertrude |
| 10 | clement_i, john_damascene, peter_canisius, thomas_becket, sylvester, pancras, callistus, martin_i, hilary, peter_damian |

| 11 | raymund_penyafort, ansgar, jerome_emiliani, servite_founders, gregory_narek, casimir, turibius, isidore, adalbert, fidelis |
| 12 | peter_chanel, john_avila, nereus_achilleus, john_i, gregory_vii, augustine_canterbury, marcellinus_peter, romuald, paulinus_nola, first_martyrs_rome |
| 13 | anthony_zaccaria, augustine_zhao_rong, henry, apollinaris, eusebius_vercelli, pontian_hippolytus, john_eudes, joseph_calasanz, john_leonardi, columban |
| 14 | damasus, john_kanty, aparecida, conversion_paul, chair_peter, beheading_john_baptist, circumcision, holy_name_jesus, presentation_lord, holy_relics |
| 15 | all_saints, all_souls, lateran_basilica, basilicas_peter_paul, mary_mother_of_god, holy_family, baptism_lord, easter, ascension, pentecost |
| 16 | trinity, corpus_christi, sacred_heart, christ_king, lourdes, mount_carmel, mary_major, queenship, holy_name_mary, our_lady_sorrows |
| 17 | our_lady_mercy, our_lady_rosary, loreto, guadalupe, immaculate_heart, mother_of_church; Rosary: finding_temple, wedding_cana, proclamation_kingdom, institution_eucharist |
| 18 | Rosary: agony_garden, scourging, crowning_thorns, carrying_cross, crucifixion; Pictorial Lives second feasts: peter_chair_rome, discovery_cross, john_latin_gate, apparition_michael, peter_chains |
| 52–54 | Canonized since 2022, in date order (52: 14 Jan – 9 May, 53: 22 May – 6 Aug, 54: 25 Aug – 9 Dec, with Bl. Fulton Sheen). Faces from photographs or portraits from life; excerpts the saints' own words in our own renderings |
| 19–42 | Pictorial Lives, in the book's date order: each batch takes the next 10 unticked lines of "From the Pictorial Lives of the Saints" (and the book's feasts on the same dates) that no `batches/*.json` claims yet through `catalogMatch`. Ids are the saint's name in snake_case, unique against `content/saints/` and every batch (`gregory_langres`, not `gregory`) |
| 43 | vitus: St. Vitus alone (15 Jun), the line batch 30 skipped. His chapter is linked, but the excerpt is the Common of Martyrs, not the chapter's reflection, which turns on Crescentia |
| 44–51 | Seasons and Ember Days (19), parts of the Mass (29), objects and vestments (24), in catalog order, 10 at a time |

The order behind the table:

1. The last calendar saints and feasts: Damasus, John of Kanty, Aparecida, the Conversion of St. Paul, the Chair of St. Peter, the Beheading of St. John the Baptist.
2. Our Lady, the feasts of the Lord and the Church, the Rosary mysteries: scenes in the same frame. Our Lady keeps one recognisable face across her cards (see `annunciation`, `visitation`, `assumption`, `fatima`).
3. The saints and feasts of the Pictorial Lives, in the book's date order. Excerpt: a line of the book's own reflection (`content/practices/saint-of-the-day/data/saint-of-day-index.json`, public domain), else the formulary.
4. Seasons, Ember Days, parts of the Mass, liturgical objects and vestments. Not portraits: `new-card.sh` gets `-` as the face and a frame variant through `FRAME` (inner window) and `BOX` (colour of the initial's box). A batch file carries them as `"frame"` and `"box"` on each card. Tried on the drafts `x_advent_sunday`, `x_consecration`, `x_chalice`, 2026-09-29:
   - **Seasons, Ember Days:** `BOX=<liturgical colour>`, `FRAME="a thin <colour> ruled line just inside the gold border; the inner window is ROUND-ARCHED like a church window, edged in gold and <colour>; no halo"`.
   - **Parts of the Mass:** `FRAME="the inner window is a POINTED GOTHIC ARCH with slender gold tracery at its tip, like a sanctuary seen through a church arch; no halo"`.
   - **Objects and vestments:** `FRAME="instead of the arched window, a centred gold-edged QUATREFOIL medallion on a deep blue ground scattered with small gold stars, holding a single object like an illuminated still life; no halo, no figures"`.
   - Liturgical scenes follow the traditional Latin Mass look.

A **Blessed** (beatified, not canonized) has rays instead of the set's ring halo, which is kept for saints: his card carries `"frame"` too, the default text with the halo swapped for rays (see `fulton_sheen` in `batch-54.json`; the convention's sources are in `dossiers/batch-54.md`).

**Cards without a fixed date** (moveable feasts, seasons, parts of the Mass, objects) carry no `feast`. The app takes them (`feast` is optional in `apps/app/src/features/saints/useHolyCards.ts`; the gallery gathers them under "Without a fixed day"), but `scripts/build-corpus.py` keeps them out of the blob until an app with that change is the oldest one in use, since older apps read `c.feast.month` unguarded.

Run one batch at a time: at most one batch generating and one being researched. Parallel batches hit the session limit and stop the run.

## Pipeline

1. **Research** (a subagent per batch): writes `dossiers/batch-N.md` and `batches/batch-N.json` (schema below). Faces from photographs, portraits or tradition, distinct from existing cards; the prayer excerpt is verified — copied from the feast's formulary in `content/of/formularies/sanctoral/`, or a cited public-domain saying; saints who died after ~1930 get formulary text only (copyright).
2. **Generate**: `research/holy-card-faces/gen-batch.sh batches/batch-N.json [id...]` runs `new-card.sh` for each card in parallel into `drafts/`.
3. **Review**: Read every draft. Reject a broken frame (scene over the border), wrong initial, text on the card, a face repeating an existing card, photorealism. Regenerate with the id list; set a `verdict` with the reason on rejected `log.jsonl` lines. Build a face sheet: `.venv/bin/python sheet.py sheets/batch-N.jpg <ids…> <similar existing ids…>` (after copying drafts to `content/saints/`, which accept does).
4. **Accept**: `python3 research/holy-card-faces/accept-batch.py batches/batch-N.json [id="history note"…]` copies drafts to `content/saints/`, writes each card file with its `meta`, ticks the catalog, marks the log. Then update the "Done" counts in the catalog summary.
5. **Commit and push** only that batch's files to main (`git fetch origin main && git rebase origin/main && git push origin HEAD:main`), no co-author trailer.

## Schema

```jsonc
{
  "batch": 1,
  "date": "2026-09-29",
  "dossier": "dossiers/batch-1.md",
  "cards": [{
    "id": "john_bosco",                       // image stem and data file name
    "letter": "J",                            // illuminated initial: first letter of the English name after "St."
    "feast": { "month": 1, "day": 31 },
    "name": { "en-US": "St. John Bosco", "pt-BR": "São João Bosco" },
    "patronOf": { "en-US": "…", "pt-BR": "…" },
    "prayerExcerpt": { "en-US": "…", "pt-BR": "…" },
    "excerptSource": "content/of/formularies/sanctoral/01-31.json communionAntiphon",
    "subject": "dress, pose, attributes, background",
    "face": "age, then bone structure (face shape, nose, eyes, brows, cheekbones, jaw, mouth), then hair, beard, gaze",
    "refs": ["vincent_de_paul", "philip_neri", "ignatius_loyola"],
    "basis": "where the face comes from, one or two sentences",
    "sources": [{ "title": "…", "url": "…" }],
    "catalogMatch": "Saint John Bosco"         // unique substring of its unticked line in docs/plans/holy-cards-catalog.md
  }]
}
```
