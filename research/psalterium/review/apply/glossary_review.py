"""Glossary hygiene from review/consistency.md §4, and the rows of D37 / D38 and of the drafts made from the review
(2026-09-21). Rows are found by their exact first cell, not by line number. Statuses that a D-ruling settles go through
tests/settle.py; the rest is edited here. Merged rows keep all their evidence (as ps017/glossary_merge.py). Run once.

    python3.13 research/psalterium/review/apply/glossary_review.py
"""

import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = root / 'glossary.md'
if '*in omni témpore*' in path.read_text(encoding='utf-8'):
    raise SystemExit('already applied')
backup = Path(__file__).resolve().parent / 'glossary.before.md'
if not backup.exists():
    backup.write_bytes(path.read_bytes())  # restore from here if a step fails half-way (settle.py writes at once)


def settle(tag, *names):
    run = subprocess.run(['python3.13', str(root / 'tests/settle.py'), tag, *names], capture_output=True, text=True)
    print(run.stdout.strip(), run.stderr.strip())
    if 'not found: none' not in run.stdout:
        raise SystemExit(f'settle {tag}: a row was not found')


confitemini = '*Confitémini Dómino quóniam bonus*'
confitebor = '*confitébor nómini tuo* (53:8, 137:1b–2a)'
psallam = '*et psallam nómini Dómini altíssimi* (7:18b = 12:6b, last colon)'
sanctus = '*in sǽculum et in sǽculum sǽculi* (118:44; 9:6, 44:18, 144:1–2 …)'
aeternum_saeculi = '*in ætérnum, et in sǽculum sǽculi* (9:6 = 9:37)'
usque = '*usque in ætérnum* (27:9, 48:20, 88:4, 102:17 *ab ætérno, et usque in ætérnum*)'
settle('D36', 'sustinére (God as object)', 'speráre in')
settle('D23', 'in sǽculum')
settle('D5', confitemini, confitebor)
settle('D25', psallam)
settle('D23, D27', sanctus, aeternum_saeculi)
settle('D34', 'concílium')
settle('D37', usque)
settle('D38', 'inops / pauper / egénus')

lines = path.read_text(encoding='utf-8').splitlines()


def cellsOf(line):
    return line.strip()[2:-2].split(' | ')


def lineOf(cells):
    return '| ' + ' | '.join(cells) + ' |'


def find(name):
    found = [i for i, line in enumerate(lines) if line.startswith('| ') and cellsOf(line)[0].strip() == name]
    if len(found) != 1:
        raise SystemExit(f'{name!r}: {len(found)} rows')
    return found[0]


def edit(name, cell=None, value=None, append=None, replace=None):
    i = find(name)
    cells = cellsOf(lines[i])
    if replace:
        old, new = replace
        column = next(k for k, c in enumerate(cells) if old in c)
        cells[column] = cells[column].replace(old, new)
    if cell is not None:
        cells[cell] = value
    if append:
        cells[-1] = cells[-1].rstrip() + ' ' + append
    lines[i] = lineOf(cells)
    return cellsOf(lines[i])[0]


def merge(keep, drop, label):
    """Append the dropped row's cells after the first (rendering, status, note) to the kept row's last cell."""
    k, d = find(keep), find(drop)
    rest = ' · '.join(c.strip() for c in cellsOf(lines[d])[1:] if c.strip())
    cells = cellsOf(lines[k])
    cells[-1] = cells[-1].rstrip() + f' **Merged from a duplicate row ({label}, 2026-09-21 review):** {cellsOf(lines[d])[0].strip()} — {rest}'
    lines[k] = lineOf(cells)
    del lines[d]


# 4.1–4.2 formulas that hung on confitéri / psállere
edit(confitemini, cell=1, value='*Dai graças ao Senhor, porque ele é bom* (117:1, 117:29; D5) — until the 2026-09-21 review this cell said *Louvai o Senhor, porque ele é bom*, the pre-D5 verb')
# 4.3 in sǽculum rows
edit(sanctus, cell=0, value='*in sǽculum et in sǽculum sǽculi* (118:44; 20:5 *in sǽculum, et in sǽculum sǽculi*; 44:18, 144:1–2 …)',
     append='— review 2026-09-21: 20:5 (*para sempre, e pelos séculos dos séculos*) is this row’s twin in the finished text; 9:6 = 9:37 is *in ætérnum, et in sǽculum sǽculi*, the next row (one Portuguese form for both, D23).')
edit('in ætérnum', append='**5:12a** *exultarão para sempre* (Ps 5 draft 4; drafts 1–3 had *eternamente*, made before D23 and never swept — review 2026-09-21).')
# 4.4 the three verbs of hoping
edit('exspectáre / exspectátio', replace=('— **wants a ruling before Ps 26**', '— ruled: D24 (*aguardar*), D36 (the three verbs kept apart)'))
# 4.5–4.6 concílium / consílium
edit('concílium', cell=1, value='by its Greek (D34): *congregação* where συναγωγή (21:17); *assembleia* at 1:5 (βουλή, for the echo with 1:1 *consílio*); *conselho* at 25:4 (συνέδριον)')
edit('consílium', cell=1, value='*conselho* (advice; a deliberating body; where a verse can mean both) / *desígnio* (what someone intends: 9:23, 19:5, 20:12, 32:10–11) — D33',
     append='**Ps 9:23 *comprehendúntur in consíliis quibus cógitant* → *ficam presos nos desígnios em que pensam*** (Ps 9 draft 8; D33, the build of 20:12; review 2026-09-21). 12:2 and 13:6 keep *conselho* under D33’s “where a verse can mean both”.')
# 4.7 húmilis gets its own row, after the inops row
edit('inops / pauper / egénus', cell=1, value='carente / pobre / (necessitado)',
     append='**D38 (review 2026-09-21): inops → *carente*** in all four finished places — 11:6a *dos carentes*, 13:6 *do carente*, 34:10b, 36:14b *o pobre e o carente* (Pss 11 draft 3, 13 draft 3, 36 draft 5). *Indigente* was unknown to four blind readers of four; *desvalido* to one. Both stay options in each psalm. *inópia* (33:10, 43:24, 87:9, 106:41) is not ruled by D38.')
lines.insert(find('inops / pauper / egénus') + 1, lineOf([
    'húmilis', 'humilde', 'settled (D27)',
    'Beside *pauper → pobre* (D27; until the 2026-09-21 review it stood only inside D27 and the *inops* row). Finished places: 9:39 *do órfão e do humilde*, 17:28 *o povo humilde*, 33:19 *os humildes de espírito*. The noun *humílitas → humilhação* and the verb *humiliáre → humilhar* are the row *humílitas / humiliáre* (open; 21:22 *a minha pequenez*).']))
# 4.8 adjútor
edit('adjútor', cell=2, value='open — for Gustavo (HANDOFF). The text is uniform, *auxílio* 14/14; D19 names *adjútor → auxílio* only in passing, as what *amparo* stays apart from — it is not a ruling, so the row stays open')
# 4.9 usque in …, ut custódiam
edit(usque, cell=0, value='*usque in ætérnum / usque in sǽculum* (27:9, 48:20, 88:4, 102:17 *ab ætérno, et usque in ætérnum*; *usque in sǽculum* 17:51, 40:14, 89:2, 105:48, 112:2, 113:26, 120:8, 124:2b, 130:3, 131:12b, 132:3b — 15 lines, grep)',
     append='— **D37**: *para todo o sempre* for both; bare *in ætérnum / in sǽculum* keeps D23’s *para sempre*. **17:51** *e com a sua descendência para todo o sempre* (Ps 17 draft 6; drafts 1–5 had *para sempre*, against 27:9). *a sǽculo et usque in sǽculum* (40:14, 89:2, 105:48) decides its first member in its psalm.')
edit('*ut custódiam mandáta tua* (118:134b = 118:146b)', cell=0, value='*ut custódiam mandáta tua* (118:134b = 118:146b; 118:60)',
     append='— 118:60 *para guardar os vossos mandamentos*: same subject as the main verb, so Portuguese takes the infinitive (grammar, D2; the 118:60 `choices`); in 134b / 146b the main verb’s subject is God.')
# 4.10–4.11 erípere, liberátor
edit('erípere', cell=1, value='*libertar* where no source is named (6:5 *libertai a minha alma*, 21:9, 33:8, 90:15, 118:153, 118:170); *arrancar* where a *de …* follows or the source is named (16:13, 17:18, 30:16, 31:7, 34:10b …)',
     append='**90:15 *erípiam eum* → *eu o libertarei*** (Ps 90 draft 3, review 2026-09-21): the one place left with *arrancar* and no source; its decision had argued that *na tribulação* supplies one, before the evidence above existed.')
edit('liberátor', append='— **A crossing to note (review 2026-09-21):** the noun *libertador* sits in *erípere*’s family (*libertar*), not in *liberáre*’s (*livrar*, the row above). A reader crossing columns sees *liberáre → livrar* but *liberátor → libertador*; *livrador* is not current. Left as it stands; decide in Ps 69 / 143 if the two families must be kept apart there.')
# rows touched by the review’s drafts
edit('valde / veheménter', append='**Ps 30:12 → *grandemente*** (Ps 30 draft 4, review 2026-09-21): *sobremaneira* (draft 3, the Latinist’s gate verbatim) was unknown to the blind reader; *muito* had been heard as “many neighbours”. A local departure from *muito*, as before.')
edit('odísse / ódio habére', append='**118:104 *odívi* → *odeio*** (Ps 118 draft 18, review 2026-09-21). Which contexts take which tense: *odi / odívi*, *odérunt*, *odísti* are perfects of a state and take the present (24:19, 25:5, 30:7, 118:104); *ódio hábui* keeps the past periphrasis (118:113, 128) or *Odiei* (118:163); a past narrative keeps the past (35:5 *malítiam autem non odívit* → *não odiou a malícia*, beside *meditátus est … ástitit*).')
# 2.4: in omni témpore gets a formula row, after ut custódiam
at = find('*ut custódiam mandáta tua* (118:134b = 118:146b; 118:60)') + 1
lines.insert(at, lineOf([
    '*in omni témpore* (33:2, 118:20, 9:26a; 105:3)', '*em todo tempo*',
    'working — review 2026-09-21: one form for the three finished places, the majority’s (9:26a had *em todo o tempo*, Ps 9 draft 8). Without the article *todo* is “every”; with it, “the whole” (Ps 33’s decision `tempore`; cf. *tota die*, D24)']))

# duplicates (review/consistency.md §4, second table)
merge('*Óculi ejus in páuperem respíciunt* (9:30a = 10:5b, first colon, word for word; 65:7 *óculi ejus super gentes respíciunt* is near)',
      '*Óculi ejus in páuperem respíciunt* (9:30a = 10:5b)', 'the same formula twice')
merge('*Sepúlcrum patens est guttur eórum, † linguis suis dolóse agébant* (5:11a = 13:3b) + *venénum áspidum sub lábiis eórum* (13:3b\'s third colon; = Rom 3:13)',
      '*Sepúlcrum patens est guttur eórum, † linguis suis dolóse agébant* (5:11a = 13:3b)', 'its first two colons')
merge('*Lavábo inter innocéntes manus meas: * et circúmdabo altáre tuum, Dómine* … *in ecclésiis benedícam te, Dómine* (25:6–12, the Lavabo of the Mass, identical in DO Ordo.txt / Ordo67.txt; Quad5-3\'s Communion is another wording, *circuíbo*)',
      'lavare manus (*Lavábo inter innocéntes manus meas*)', 'a term row with the same wording')
merge('suscéptor', 'suscéptor + suscípere together', 'the pair, beside the rows it combined')
edit('suscípere', append='— the noun and verb as a pair (3:4 / 3:6, 29:2): see the row *suscéptor* (the combined row was merged into it, 2026-09-21).')
merge('verbum / sermo / elóquium', 'verbum', 'the word alone, working beside this settled row')
# 816 / 857 overlap: kept apart (857 is the Ps 30 ≈ Ps 70 doublet note, and also carries 70:3a); cross-referenced
edit('*inclína (ad me) aurem tuam (mihi)* (16:6; 30:3 = 70:2 *Inclína ad me aurem tuam*, 85:1, 87:3, 101:3; 44:11 to the daughter; 77:1 *inclináte*, 114:2 *inclinávit aurem suam mihi* — grep)',
     append='— see also the formula row *30:2–3b ≈ 70:1–3* (Ps 70 copies Ps 30’s wording; kept as its own row because it also carries 70:3a).')
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('glossary: rows edited, húmilis and in omni témpore added, five duplicate sets merged')
