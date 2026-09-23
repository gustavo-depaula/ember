"""Insert Ps 141's row into the shared PROGRESS.md after the last row numbered 119-140 (re-read at run time).
python3.13 research/psalterium/ps141/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 141 | 10 | 2 | reviewed — Latinist gate clean of majors (v2: three minors, all held as options — 141:4 *em mim* against his *de mim* for *ex me*; 141:4 the apodotic *et* (bare *vós* against his *então vós*); 141:7b *mais do que eu* = 17:18b against his *sobre mim*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. No DM1962 for this psalm. No titulus (D7: DO's file starts at 141:2; *Intellectus David, cum esset in spelunca, oratio* not translated) "
       "| latinist ×2 (v1: one minor, the dropped *et*, held; v2: three minors, held), "
       "stylist (6 remarks: taken — 141:3 order (the *oração / tribulação* chime), 141:4b *esconderam-me um laço*, 141:5b subject first; kept as options — *Olhava*, *recompenseis*; refused — 141:6 *e disse* / no article; best 141:2, worst 141:5b), "
       "ambiguity (15 readings, the Latin's sense heard first; *procure a minha alma* heard as care; unknown *veredas*, *desfalecia*, *retribuais*) — stylist and ambiguity read draft 1 only | 13 | "
       "Copied: 141:2a = 3:5a = 76:2a; 141:7 *humiliátus sum nimis* = 37:9, 115:1; 141:7b second colon = 17:18b; *terra dos vivos* (26:13), *a minha porção* (118:57), *Clamei a vós* (118:146), *para dar graças ao … nome* (121:4). "
       "Liturgy by grep: 141:2 the Introit psalm verse of 09-17; 141:8a the Thursday Vespers antiphon *Educ de custódia*; the monastic antiphon *Pórtio mea … sit in terra vivéntium*. "
       "Brazilian circulation fetched (CNBB LH read from the saved page `consult/lh_salmo142.html`: *Em voz alta ao Senhor eu imploro*, *na sua presença*, *Quando em mim desfalece*, *Arrancai-me, Senhor, da prisão*) in `ps141/circulation.md`. "
       "**Hardest / for Gustavo:** 141:5b *Périit fuga a me* → *A fuga se perdeu para mim* (118:176's 'lost' sense of *períre*, not *perecer*); 141:4 the gerund *In deficiéndo ex me* and the apodotic *et*; "
       "141:3 *pronúntio* → *declaro*, a local departure from the open *pronunciar* row. New rows *custódia* (prison) → *prisão*, the 141:4 gerund, one formula row; evidence added to 11 rows. "
       "Scripts: `ps141/revise_v2.py`, `gate_v2.py`, `concord.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 141 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 141:
            idx = i
    lines.insert(idx + 1, row + '\n')
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
