# Missale Romanum

Can the Ordinary Form Mass in Ember be rebuilt from the original source of its texts, `github.com/pedropasinn/Missale_romanum` (a Cordova app carrying the 2002 Missal and Lectionary in seven languages), with its selection logic re-expressed as data plus a small resolver?

The current `content/of/` descends from the same app through `ember-extra`, a conversion whose tooling can no longer run. This project goes back to the app itself.

## Where things stand

- `extract.py` joins upstream's language-neutral skeletons with each language's text and writes one neutral JSON file per upstream file to `consult/out/`, with a report. It fails if any text is lost in the join. Classes and anchors are carried through uninterpreted.
- Next: map the neutral JSON onto a schema, rebuild the calendar as data, and diff a new resolver against upstream's own `dia_liturgico`.

## Running it

```bash
git clone https://github.com/pedropasinn/Missale_romanum consult/upstream
git -C consult/upstream checkout be8004c04e693b30f9fbd9bed2dbad4cc64a7cef
python3 extract.py
```

`consult/` is gitignored: upstream has no licence and its English, Portuguese and other vernacular texts are the official in-copyright translations.

## How upstream selects texts

1. **Calendar** (`feria_liturgica.js`: `dia_liturgico`, `santos`). From the date it derives pointers into the content: a temporal formulary, a lectionary entry, and saints, each with named alternatives (vigil, night, dawn and day Masses; Epiphany, Ascension and Corpus Christi both transferred and not). Saints are a switch on `dd.mm`, in three season blocks; national propers are gated on the display language.
2. **Content**. Each celebration is a `div.dia#ANCHOR` whose parts are classed `x_titulo`, `x_ant_ent`, `x_colecta`, `x_or_ofrend`, `x_prefacio`, `x_ant_com`, `x_post_com`, `x_or_pueblo`; readings use `x_prim_lect`, `x_salmo`, `x_seg_lect`, `x_aleluya`, `x_evangelio` inside `cicloA/B/C` and `annoprimo/annosecundo`. Each formulary carries its number in the Table of Liturgical Days (`x_tmp_precedencia`, `x_snt_precedencia`; 66 means 6 on a Sunday and 13 on a weekday).
3. **Assembly** (`mis_funciones_misal.js`: `cargado2`, `arreglaLectura`). The Order of Mass stacks, for every variable part, an ordinary, temporal, saint and common layer. The saint wins when its precedence number is lower than the temporal one; its readings replace the ferial ones only at rank 8 or above, or when flagged `lect_obl`. The common comes from the link in the saint's title.

## Days that do not fit the part vocabulary

Upstream's weave only moves the `x_` parts into the Order of Mass, so on these days most of the rite is outside it and must be modelled as the day's own sequence:

| Anchor | Day | Slots | Standard parts present |
| --- | --- | --- | --- |
| `SS00` | Palm Sunday (procession, *Gloria, laus*) | 51 | all |
| `SS04` | Holy Thursday evening (washing of feet, transfer) | 117 | all but the prayer over the people |
| `SS05` | Good Friday (Passion, solemn intercessions, adoration of the Cross) | 72 | none: it is not a Mass |
| `SS06` | Easter Vigil (Exsultet, readings, litany, baptismal liturgy) | 170 | from the offerings on |

Sequences sit in the lectionary blocks, not the formularies: *Victimae paschali* on Easter Sunday and through the octave, *Veni, Sancte Spiritus* at Pentecost, *Lauda, Sion* at Corpus Christi, *Stabat Mater* on 15 September.
