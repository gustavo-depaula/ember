"""Targeted edits to the shared glossary.md and PROGRESS.md for Ps 119.
Re-reads each file immediately before writing; appends to existing rows by
their first cell; inserts new rows after an anchor row; never rewrites wholesale."""
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
gl = root / 'glossary.md'
pr = root / 'PROGRESS.md'


def append_to_row(lines, prefix, text):
    for i, l in enumerate(lines):
        if l.startswith(prefix):
            if 'Ps 119' in l:
                return True
            assert l.rstrip().endswith('|'), prefix
            lines[i] = l.rstrip()[:-1].rstrip() + ' ' + text + ' |'
            return True
    print('row not found:', prefix, file=sys.stderr)
    return False


def insert_after(lines, anchor_prefix, row):
    if any(l.strip() == row.strip() for l in lines):
        return
    for i, l in enumerate(lines):
        if l.startswith(anchor_prefix):
            lines.insert(i + 1, row)
            return
    raise SystemExit('anchor not found: ' + anchor_prefix)


def glossary():
    lines = gl.read_text().split('\n')
    append_to_row(lines, '| carbónes (ignis) |', "**Ps 119:4 *cum carbónibus desolatóriis* → *com carvões devastadores*** — the row held; the v1 stylist heard *carvões* as grill charcoal and asked *brasas devastadoras*; kept as an option (decision `carbonibus`) — if taken, take it for the whole row.")
    append_to_row(lines, '| pacíficus (of a man) |', "**Ps 119:7 *eram pacíficus* → *eu era de paz*** (before the asterisk; keeps the echo *a paz … de paz* as *pacem … pacíficus*); *pacífico* option. No reader objected.")
    append_to_row(lines, '| gratis |', "**Ps 119:7 *impugnábant me gratis* → *eles me combatiam sem motivo*** — applied.")
    append_to_row(lines, '| dolus / dolósus / dolóse ágere |', "**Ps 119:2–3 *lingua dolósa* → *língua enganadora*** (as 108:3) — applied; the same two words stand in the CNBB Liturgia das Horas line of this psalm (circulation only; ps119/circulation.md).")
    append_to_row(lines, '| íncola |', "**Ps 119:5 *multum íncola fuit ánima mea* → *muito tempo foi forasteira a minha alma*** (the v1 Latinist's bare *muito* option: heard as degree). The noun *incolátus* in the same verse → *peregrinação* (row below).")
    new_rows = [
        ('| íncola |', "| incolátus | peregrinação (*Ai de mim, porque a minha peregrinação se prolongou*) | open | Ps 119:5, only place (grep). παροικία — the Greek of 118:54 *peregrinatiónis* (*no lugar da minha peregrinação*), so by D15's test the two share it. Cost: the echo with *íncola* → *forasteira* at the end of the verse is heard only in sense; the ambiguity reader heard 'religious pilgrimage' first. The Vespers antiphon of the Office of the Dead (*Heu mihi Dómine, quia incolátus meus prolongátus est*, C9). Options *o meu tempo de forasteiro* (keeps the echo), *o meu desterro* (MS1932). |"),
        ('| carbónes (ignis) |', "| desolatórius | devastador (*com carvões devastadores*) | open | Ps 119:4, only place; church Latin 'that makes desolate' (L&S cites this verse), DRB 'that lay waste'. The Greek ἐρημικοῖς 'of the desert' not followed (rule 1). *desolador* is heard as 'saddening' (cf. desoláre row, 78:7); *devoradores* (MS1932) another image. |"),
        ('| carbónes (ignis) |', "| potens (substantive) | o poderoso (*Setas agudas do poderoso*) | open | Ps 119:4 *Sagíttæ poténtis acútæ* (τοῦ δυνατοῦ; MS1932 *do poderoso*). **126:4 *Sicut sagíttæ in manu poténtis* should copy.** Leaves open whether it is God or a warrior, as the Latin does; *valente* (77:65's word, where the context is a drunken warrior) and *guerreiro* (DM1962, from the Hebrew) options. |"),
        ('| carbónes (ignis) |', "| impugnáre | combater (*quando lhes falava, eles me combatiam sem motivo*) | working | Ps 34:1 *impugnántes me* → *os que me combatem*; Ps 119:7 (ἐπολέμουν). *contradizer* (MS1932) narrows the war to words; refused. |"),
    ]
    for anchor, row in new_rows:
        insert_after(lines, anchor, row)
    # Formula: the titulus of the Gradual Psalms (not in DO; proposed for the day tituli are added)
    formula = "| *Canticum graduum* (the titulus of Pss 119–133; **not in DO's Latin**, which omits tituli — D7; Ps 133 carries none, and Ps 119 none) | none in the prayed text. If tituli are added: *Cântico dos degraus* | open — Ps 119 | *gradus* is 'step' and the Greek ἀναβαθμοί is steps too, so *degraus* is both words (DRB 'gradual canticle'). Options: *Cântico gradual* (MS1932; the liturgical *salmos graduais*, *Psalmi graduales*), *Cântico das subidas* (the Hebrew's name, current in Brazil — Pe. Ney Brasil lists *subidas*, *degraus*, *graduais*, *romarias*, *peregrinação*; and *subida* is already *ascénsio*'s, 83:6, another Greek word), *Cântico das peregrinações* (Bíblia Ave Maria, fetched). Evidence in ps119/circulation.md. Pss 120–133: no titulus in the text; copy this row's ruling when one is made. |"
    if not any(l.startswith('| *Canticum graduum*') for l in lines):
        # last row of the Formulas table: the line before '## Doublets' (skipping blanks)
        idx = next(i for i, l in enumerate(lines) if l.startswith('## Doublets'))
        j = idx - 1
        while lines[j].strip() == '':
            j -= 1
        lines.insert(j + 1, formula)
    gl.write_text('\n'.join(lines))


def progress():
    lines = pr.read_text().split('\n')
    if any(l.startswith('| 119 |') for l in lines):
        return
    row = "| 119 | 6 | 2 | reviewed — Latinist gate clean of majors (v2: one minor, held as an option: 119:7 *odiavam* against his present *odeiam*, sequence of tenses beside *eu era*). **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. The Hetzenauer print read is skipped and owed | latinist ×2 (v1: one minor, 119:5 *muito tempo*, refused → option), stylist (5 remarks: 3 taken — *e me escutou*, *porque*, *eles me combatiam*; 2 options — *à língua*, *brasas*; best 119:2, worst 119:7), ambiguity (9 items, 3 unknown words: *Cedar*, *iníquos*, *atribulado*) | 14 | First Gradual Psalm: **no titulus** (D7; matches Ps 133); *Canticum graduum* proposed as *Cântico dos degraus* (open) in the glossary's Formulas for Pss 120–133. 119:3 *ad linguam dolósam* kept open with *para a* (*contra*, *à*, *ó* options). New rows *incolátus → peregrinação* (118:54's Greek), *desolatórius → devastador*, *potens* → *o poderoso* (126:4 should copy), *impugnáre → combater*. Brazilian circulation fetched (CNBB Liturgia das Horas: *e ele me escutou*, *língua enganadora*) in ps119/circulation.md |"
    # insert before the first row whose psalm number is greater than 119, else after 118/116 row
    last_lower = None
    for i, l in enumerate(lines):
        if l.startswith('| '):
            cell = l[2:].split(' ', 1)[0]
            if cell.isdigit():
                n = int(cell)
                if n > 119 and last_lower is not None and i > last_lower:
                    lines.insert(i, row)
                    pr.write_text('\n'.join(lines))
                    return
                if n < 119 and n >= 100:
                    last_lower = i
    lines.insert(last_lower + 1, row)
    pr.write_text('\n'.join(lines))


if 'glossary' in sys.argv:
    glossary()
if 'progress' in sys.argv:
    progress()
