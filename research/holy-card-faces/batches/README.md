# Batches

The 100 saints after the first batch, made 10 at a time; each batch is committed and pushed to main on its own. A batch is done when its ids are ticked in `docs/plans/holy-cards-catalog.md` and its cards exist in `content/practices/saint-of-the-day/data/holy-cards/`; that, not this file, is the status.

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

Left out for now (least known optional memorials): Raymund of Penyafort, Ansgar, Jerome Emiliani, the Servite founders, Gregory of Narek, Casimir, Turibius, Isidore, Adalbert, Fidelis, Peter Chanel, John of Ávila, Nereus & Achilleus, John I, Gregory VII, Augustine of Canterbury, Marcellinus & Peter, Romuald, Paulinus of Nola, the first martyrs of Rome, Anthony Zaccaria, Augustine Zhao Rong, Henry, Apollinaris, Eusebius of Vercelli, Pontian & Hippolytus, John Eudes, Joseph Calasanz, John Leonardi, Columban, Damasus, John of Kanty.

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
    "face": "concrete traits: age, hair, beard, build, gaze",
    "refs": ["vincent_de_paul", "philip_neri", "ignatius_loyola"],
    "basis": "where the face comes from, one or two sentences",
    "sources": [{ "title": "…", "url": "…" }],
    "catalogMatch": "Saint John Bosco"         // unique substring of its unticked line in docs/plans/holy-cards-catalog.md
  }]
}
```
