#!/usr/bin/env python3
"""Lay the chant propers out as books: the Graduale (content/chant-books/graduale.json)
and the Antiphonale (content/chant-books/antiphonale.json).

The scores themselves are content/chant-propers/, brought in from GregoBase by
scripts/import-gregobase.py and found there by the words they set. This script
adds the order a printed book gives them: every Mass and every Office day of the
1960 rubrics, as Divinum Officium's engine resolves it (scripts/do-chant-days.ts),
with the scores that set its texts. A text without a score is left out; a day
none of whose texts has one is left out whole.

    python3 scripts/chant-books.py
"""
import json, pathlib, re, subprocess, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import chant_link as cl  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
PROPERS = ROOT / 'content/chant-propers'
BOOKS = ROOT / 'content/chant-books'

PARTS = {
    'tempora': 'Proprium de Tempore',
    'sancti': 'Proprium Sanctorum',
    'commune': 'Commune Sanctorum',
    'psalterium': 'Psalterium',
}
# The seasons of the Proper of Time, in the year's order: its id, the Divinum
# Officium file prefixes it holds, its name, and the tab of the thumb index.
SEASONS = [
    ('adventus', ('Adv',), 'Advento', 'Advent', 'ADV'),
    ('nativitas', ('Nat',), 'Natal', 'Christmas', 'NAT'),
    ('epiphania', ('Epi',), 'Epifania', 'Epiphany', 'EPI'),
    ('septuagesima', ('Quadp',), 'Septuagésima', 'Septuagesima', 'SEPT'),
    ('quadragesima', ('Quad1', 'Quad2', 'Quad3', 'Quad4'), 'Quaresma', 'Lent', 'QUAD'),
    ('passio', ('Quad5', 'Quad6'), 'Tempo da Paixão', 'Passiontide', 'PASS'),
    ('pascha', ('Pasc',), 'Tempo Pascal', 'Eastertide', 'PASC'),
    ('pentecostes', ('Pent',), 'Depois de Pentecostes', 'After Pentecost', 'PENT'),
]
MONTHS = [
    ('Janeiro', 'January', 'IAN'), ('Fevereiro', 'February', 'FEB'), ('Março', 'March', 'MAR'),
    ('Abril', 'April', 'APR'), ('Maio', 'May', 'MAI'), ('Junho', 'June', 'IUN'),
    ('Julho', 'July', 'IUL'), ('Agosto', 'August', 'AUG'), ('Setembro', 'September', 'SEP'),
    ('Outubro', 'October', 'OCT'), ('Novembro', 'November', 'NOV'), ('Dezembro', 'December', 'DEC'),
]
# Christmas to the octave of the Epiphany is the Proper of Time in a printed
# Graduale, though Divinum Officium files its days among the saints, by date.
CHRISTMASTIDE = {**{f'12-{d}': 'nativitas' for d in range(24, 32)},
                 **{f'01-0{d}': 'nativitas' for d in range(1, 6)},
                 **{f'01-{d:02d}': 'epiphania' for d in range(6, 14)}}

MASS_ORDER = ['Introitus', 'GradualeL1', 'GradualeL2', 'GradualeL3', 'GradualeL4', 'GradualeL5',
              'Graduale', 'Graduale1', 'GradualeA', 'Sequentia', 'Tractus',
              'GradualeP', 'Offertorium', 'OffertoriumP', 'Communio', 'CommunioP']
# What a printed Graduale sets apart under a rubric: the Paschal-time alleluias of
# a feast, and a saint's tract, sung from Septuagesima on.
MASS_HEADS = {'GradualeP': 'Tempore Paschali', 'OffertoriumP': 'Tempore Paschali',
              'CommunioP': 'Tempore Paschali', 'Tractus': 'Post Septuagesimam'}

# The hours of an Office day, in the order they are sung: the hour's name, then the
# sections of a feast's file it holds. A feast with second Vespers of its own sings
# the first from `Ant Vespera`; one without sings `Ant Vespera` at its only Vespers.
HOURS_WITH_FIRST_VESPERS = [
    ('Ad I Vesperas', ['Ant Vespera', 'Hymnus Vespera', 'Ant 1']),
    ('Ad Matutinum', ['Invit', 'Hymnus Matutinum', 'Ant Matutinum']),
    ('Ad Laudes', ['Ant Laudes', 'Hymnus Laudes', 'Ant 2']),
    ('Ad Horas minores', ['Responsory Breve Tertia', 'Responsory Breve Sexta', 'Responsory Breve Nona']),
    ('Ad II Vesperas', ['Ant Vespera 3', 'Hymnus Vespera 3', 'Ant 3']),
]
HOURS = [
    ('Ad Matutinum', ['Invit', 'Hymnus Matutinum', 'Ant Matutinum']),
    ('Ad Laudes', ['Ant Laudes', 'Hymnus Laudes', 'Ant 2']),
    ('Ad Horas minores', ['Responsory Breve Tertia', 'Responsory Breve Sexta', 'Responsory Breve Nona']),
    ('Ad Vesperas', ['Ant Vespera', 'Hymnus Vespera', 'Ant 1', 'Ant 3']),
]
# An hour as the strip above a day's page names it, in its few letters.
HOUR_TABS = {'Ad I Vesperas': 'I Vesp', 'Ad Matutinum': 'Mat', 'Ad Laudes': 'Laud',
             'Ad Horas minores': 'Hor', 'Ad II Vesperas': 'II Vesp', 'Ad Vesperas': 'Vesp'}


def hour_head(at, hour):
    return {'at': at, 'title': {'la': hour}, 'short': HOUR_TABS[hour]}
WEEKDAYS = ['Dominica', 'Feria II', 'Feria III', 'Feria IV', 'Feria V', 'Feria VI', 'Sabbato']


def finder():
    genre_of = {name: g for g, name in {**cl.GENRES, **cl.OFFICE_GENRES}.items()}
    entries = []
    for f in sorted(PROPERS.glob('*.gabc')):
        head, _, score = f.read_text(encoding='utf-8').partition('\n%%\n')
        genre = genre_of[re.search(r'^office-part: (.*);$', head, re.M).group(1)]
        entries.append((f.stem, genre, cl.chant_key(genre, score), 0))
    return cl.Finder(entries)


def lines_of(text):
    return text.rstrip('\n').split('\n')


def sung(found, pieces):
    """The scores that set `pieces` ([(genre, text)]), each once, in order, with
    the part each is sung as: a gradual GregoBase files as a tract is still the gradual."""
    out = {}
    for genre, text in pieces:
        key = cl.piece_key(genre, text) if genre in cl.GENRES else cl.fold(text)
        if len(key) < 12:
            continue
        score, stem = found.find(cl.KIN.get(genre, (genre,)), key)
        if score >= cl.THRESHOLD and stem not in out:
            out[stem] = genre
    return out


def scores(found, pieces):
    return list(sung(found, pieces))


def season_of(day):
    if day['part'] == 'sancti' and day.get('date') in CHRISTMASTIDE:
        return CHRISTMASTIDE[day['date']]
    for sid, prefixes, *_ in SEASONS:
        if day['file'].startswith(prefixes) and not (sid == 'quadragesima' and day['file'].startswith('Quadp')):
            return sid
    raise ValueError(f'no season for {day["file"]}')


def tempora_rank(day):
    """Within a season: the days Divinum Officium files by date first, then by week and weekday."""
    if day['part'] == 'sancti':
        month, d = day['date'].split('-')
        return (0, (int(month) - 12) % 12, int(d), 0)
    m = re.match(r'^[A-Za-z]+(\d+)(?:-(\d))?$', day['file'])
    # The Sundays after Epiphany that Epiphanytide had no room for are kept
    # after the twenty-third after Pentecost, whose chants they sing.
    if day['file'].startswith('PentEpi'):
        return (1, 23, 10 + int(m.group(1)), int(m.group(2) or 0))
    return (1, int(m.group(1)), int(m.group(2) or 0), 0)


def groups_and_parts(days):
    """The book's parts and its groups (seasons, months, the Commons), as the thumb index lists them."""
    parts, groups = [], []
    present = {(d['part'] if d['part'] != 'sancti' or d.get('date') not in CHRISTMASTIDE else 'tempora') for d in days}
    for pid, title in PARTS.items():
        if pid in present:
            parts.append({'id': pid, 'title': {'la': title}})
    seasons = {season_of(d) for d in days if d['part'] == 'tempora' or d.get('date') in CHRISTMASTIDE}
    for sid, _, pt, en, short in SEASONS:
        if sid in seasons:
            groups.append({'id': sid, 'part': 'tempora', 'title': {'pt-BR': pt, 'en-US': en}, 'short': short})
    months = {int(d['date'][:2]) for d in days if d['part'] == 'sancti' and d['date'] not in CHRISTMASTIDE}
    for n, (pt, en, short) in enumerate(MONTHS, 1):
        if n in months:
            groups.append({'id': f'm{n:02d}', 'part': 'sancti', 'title': {'pt-BR': pt, 'en-US': en}, 'short': short})
    if 'commune' in present:
        groups.append({'id': 'commune', 'part': 'commune', 'title': {'pt-BR': 'Comuns dos santos', 'en-US': 'Commons of the saints'}, 'short': 'COM'})
    if 'psalterium' in present:
        groups.append({'id': 'psalterium', 'part': 'psalterium', 'title': {'pt-BR': 'Saltério da semana', 'en-US': 'The weekly psalter'}, 'short': 'PSAL'})
    return parts, groups


def group_of(day):
    if day['part'] == 'tempora' or (day['part'] == 'sancti' and day.get('date') in CHRISTMASTIDE):
        return season_of(day)
    if day['part'] == 'sancti':
        return f'm{day["date"][:2]}'
    return day['part']


def order(days):
    season_rank = {sid: i for i, (sid, *_) in enumerate(SEASONS)}
    part_rank = {p: i for i, p in enumerate(PARTS)}

    def rank(d):
        g = group_of(d)
        if g in season_rank:
            return (0, season_rank[g], *tempora_rank(d))
        if d['part'] == 'sancti':
            return (1, 0, d['date'], d['file'])
        return (2 + part_rank[d['part']], 0, d['file'], '')

    return sorted(days, key=rank)


def section(day, chants, heads=None, parts=None):
    out = {
        'id': f'{day["part"]}-{day["file"]}'.lower().replace(' ', '-').replace('/', '-'),
        'title': {'la': day['title']},
        'group': group_of(day),
        'chants': [f'chant/{s}' for s in chants],
    }
    # The Divinum Officium file a calendar day names as its winner (`Sancti/11-11`),
    # which is how the app opens a day's page; and the Common it draws on, which
    # says what kind of feast it is (`C11` Our Lady, `C2` a martyr, `C9` the dead).
    if day['part'] in ('tempora', 'sancti'):
        out['file'] = f'{day["part"].capitalize()}/{day["file"]}'
    common = day['file'] if day['part'] == 'commune' else day.get('common')
    if common:
        out['common'] = common
    if day.get('date'):
        out['date'] = day['date']
    if heads:
        out['heads'] = heads
    # The part of the Mass each chant is sung as, which the genre its score is filed under can belie.
    if parts:
        out['parts'] = parts
    return out


# The dates a saint's feast can meet each season: Septuagesima falls on 18 January
# at the earliest and Easter on 25 April at the latest; Paschal time opens on 22
# March at the earliest and closes on 19 June at the latest. A feast outside these
# never sings the season's chants, though its Common prints them.
SEASON_DATES = {'Tractus': ('01-18', '04-24'), 'GradualeP': ('03-22', '06-19'),
                'OffertoriumP': ('03-22', '06-19'), 'CommunioP': ('03-22', '06-19')}


def sung_on(day, name):
    if day['part'] != 'sancti' or name not in SEASON_DATES:
        return True
    first, last = SEASON_DATES[name]
    return first <= day['date'] <= last


def mass_section(found, day):
    chants, heads, parts = [], [], []
    for name in MASS_ORDER:
        if name not in day['sections'] or not sung_on(day, name):
            continue
        pieces = sung(found, cl.mass_pieces(name, lines_of(day['sections'][name])))
        got = [s for s in pieces if s not in chants]
        parts += [pieces[s] for s in got]
        # A Mass of the Proper of Time sings its tract in its own season; the rubric is a saint's.
        head = MASS_HEADS.get(name) if not (name == 'Tractus' and day['part'] == 'tempora') else None
        if got and head and not (heads and heads[-1]['title']['la'] == head):
            heads.append({'at': len(chants), 'title': {'la': head}})
        chants += got
    return chants, heads, parts


def office_section(found, day, hours):
    chants, heads = [], []
    for hour, names in hours:
        got = []
        for name in names:
            if name in day['sections']:
                got += [s for s in scores(found, cl.office_pieces(name, lines_of(day['sections'][name]))) if s not in chants + got]
        if got:
            heads.append(hour_head(len(chants), hour))
            chants += got
    return chants, heads


def psalter_days(psalter):
    """The weekly psalter as seven days and Compline, each with its hours: from
    the psalter's files, the sections Divinum Officium names for that weekday."""
    s = {}
    for f in psalter:
        s.update(f['sections'])
    minor = {h: lines_of(s.get(h, '')) for h in ('Prima', 'Tertia', 'Sexta', 'Nona')}
    out = []
    for d, name in enumerate(WEEKDAYS):
        day = 'Dominica' if d == 0 else 'Feria'
        hours = [
            ('Ad Matutinum', [(f'Day{d}', 'Ant Matutinum'), (f'Day{d} Hymnus', 'Hymnus')]),
            ('Ad Laudes', [(f'Day{d} Laudes1', 'Ant Laudes'), (f'Hymnus Day{d} Laudes', 'Hymnus'),
                           ('Dominica Ant 2' if d == 0 else f'Feria{d + 1} Ant 2', 'Ant 2')]),
            ('Ad Horas minores', [(h, h) for h in minor] + [(f'Responsory breve {day} {h}', 'Responsory') for h in ('Tertia', 'Sexta', 'Nona')]),
            ('Ad Vesperas', [(f'Day{d} Vespera', 'Ant Vespera'), (f'Hymnus Day{d} Vespera', 'Hymnus'),
                             ('Dominica Ant 3' if d == 0 else f'Feria{d + 1} Ant 3', 'Ant 3')]),
        ]
        sections = {}
        for hour, picks in hours:
            for key, as_name in picks:
                if key in minor:
                    # `Dominica = antiphon` — the little hours list each weekday's antiphon on a line.
                    lines = [l for l in minor[key] if l.startswith(f'{name} =') or l.startswith(f'{name}=')]
                else:
                    lines = lines_of(s.get(key, ''))
                if lines and lines != ['']:
                    sections[f'{hour}|{key}|{as_name}'] = lines
        out.append(({'part': 'psalterium', 'file': f'psalterium-{d}', 'title': name}, sections))
    out.append(({'part': 'psalterium', 'file': 'psalterium-completorium', 'title': 'Ad Completorium'},
                {'Ad Completorium|Completorium|Ant': lines_of(s.get('Completorium', ''))}))
    return out


def psalter_section(found, day, sections):
    chants, heads = [], []
    by_hour = {}
    for key, lines in sections.items():
        hour, _, as_name = key.split('|')
        by_hour.setdefault(hour, []).extend(scores(found, cl.office_pieces(as_name, lines)))
    for hour, got in by_hour.items():
        got = [g for g in dict.fromkeys(got) if g not in chants]
        if got:
            if day['file'] != 'psalterium-completorium':
                heads.append(hour_head(len(chants), hour))
            chants += got
    return chants, heads


def book(book_id, name, description, days, sections):
    parts, groups = groups_and_parts(days)
    used = {s['group'] for s in sections}
    return {
        'id': f'chant-book/{book_id}',
        'name': name,
        'description': description,
        'source': 'GregoBase (CC0) · Divinum Officium',
        'parts': parts,
        'groups': [g for g in groups if g['id'] in used],
        'sections': sections,
    }


def without_repeats(sections):
    """A Common printed twice with the same chants (its Paschal form, its second
    Mass) keeps the first; a weekday that only repeats its Sunday was already left out."""
    seen, out = set(), []
    for s in sections:
        key = (s['group'], tuple(s['chants']))
        if s['group'] == 'commune' and key in seen:
            continue
        seen.add(key)
        out.append(s)
    return out


def main():
    days = json.loads(subprocess.run(
        ['pnpm', 'exec', 'tsx', 'scripts/do-chant-days.ts'], cwd=ROOT, check=True, capture_output=True, text=True,
    ).stdout)
    found = finder()

    masses = [d for d in days if d['area'] == 'missa']
    graduale = []
    for d in order(masses):
        chants, heads, parts = mass_section(found, d)
        if chants:
            graduale.append(section(d, chants, heads, parts))

    offices = [d for d in days if d['area'] == 'horas' and d['part'] != 'psalterium']
    antiphonale = []
    for d in order(offices):
        hours = HOURS_WITH_FIRST_VESPERS if 'Ant Vespera 3' in d['sections'] else HOURS
        chants, heads = office_section(found, d, hours)
        if chants:
            antiphonale.append(section(d, chants, heads))
    psalter = psalter_days([d for d in days if d['part'] == 'psalterium'])
    for d, sections in psalter:
        chants, heads = psalter_section(found, d, sections)
        if chants:
            antiphonale.append(section(d, chants, heads))

    BOOKS.mkdir(parents=True, exist_ok=True)
    out = [
        ('graduale', book('graduale', {'en-US': 'Graduale', 'pt-BR': 'Graduale'},
                          {'en-US': 'The sung propers of every Mass of the year', 'pt-BR': 'Os cantos próprios de cada Missa do ano'},
                          masses, without_repeats(graduale))),
        ('antiphonale', book('antiphonale', {'en-US': 'Antiphonale', 'pt-BR': 'Antiphonale'},
                             {'en-US': 'The antiphons, hymns and responsories of the hours', 'pt-BR': 'Antífonas, hinos e responsórios das Horas'},
                             offices + [d for d, _ in psalter], without_repeats(antiphonale))),
    ]
    for name, b in out:
        (BOOKS / f'{name}.json').write_text(json.dumps(b, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        refs = {c for s in b['sections'] for c in s['chants']}
        print(f'{name}: {len(b["sections"])} days, {len(refs)} scores')
    on_shelf = {c[len('chant/'):] for _, b in out for s in b['sections'] for c in s['chants']}
    print(f'{len(on_shelf)} of {len(list(PROPERS.glob("*.gabc")))} proper scores are in a book')


if __name__ == '__main__':
    main()
