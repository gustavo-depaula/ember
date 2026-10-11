#!/usr/bin/env python3
"""Import chant scores from GregoBase into content/chants/ and content/chant-books/.

GregoBase (https://gregobase.selapa.net) releases every transcription under
CC0. It is read two ways, because it publishes itself two ways:

- its SQL dump on GitHub, which is the only place a book's order can be read
  (which chant is on which page) but is refreshed once in a few years;
- the live site, one chant per request, which is where a correction lands the
  day a transcriber makes it.

So the dump lays a book out, and each score is then read from the live site.

    python3 scripts/import-gregobase.py              # (re)write the Kyriale, scores from the live site
    python3 scripts/import-gregobase.py --offline    # the same from the dump alone
    python3 scripts/import-gregobase.py --sync       # refresh the scores already in content/chants/
    python3 scripts/import-gregobase.py --find "salve regina"

What lands in content/ is one `.gabc` file per chant — its GregoBase record as
GABC headers, its score untouched — and one book file giving the chants their
order. The score keeps its Gregorio-TeX tags: the app's GABC reader
(apps/app/src/features/chant/gabc.ts) decides how a tag is drawn, so a sync
diffs only where GregoBase itself changed.
"""
import json, pathlib, re, sys, time, urllib.error, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHANTS = ROOT / 'content/chants'
BOOKS = ROOT / 'content/chant-books'
COMMIT = '2ebcda3f523f9b19933d59fa32bb4215cd8e7675'
DUMP_URL = f'https://raw.githubusercontent.com/gregorio-project/GregoBase/{COMMIT}/gregobase_online.sql'
CACHE = pathlib.Path.home() / '.cache/ember' / f'gregobase-{COMMIT[:12]}.sql'
LIVE_URL = 'https://gregobase.selapa.net/download.php?id={id}&format=gabc&elem={elem}'
USER_AGENT = 'ember-chant-sync (https://github.com/gustavo-depaula/ember)'

# The Kyriale as the 1961 Graduale Romanum prints it, which GregoBase lists as
# source 2 with the Kyriale on its starred pages.
GRADUALE_1961 = '2'
GRADUALE_1961_NAME = 'Graduale Romanum, 1961'

# Name and occasion of each Mass of the Kyriale, by its number. The occasions
# are those of the 1960 rubrics, which is what the 1961 Graduale assigns.
MASSES = [
    ('I', 'Lux et origo', 'In Paschal Time', 'No Tempo Pascal'),
    ('II', 'Kyrie fons bonitatis', 'For feasts of the I class', 'Para as festas de I classe'),
    ('III', 'Kyrie Deus sempiterne', 'For feasts of the I class', 'Para as festas de I classe'),
    ('IV', 'Cunctipotens Genitor Deus', 'For feasts of the II class', 'Para as festas de II classe'),
    ('V', 'Kyrie magnae Deus potentiae', 'For feasts of the II class', 'Para as festas de II classe'),
    ('VI', 'Kyrie Rex Genitor', 'For feasts of the II class', 'Para as festas de II classe'),
    ('VII', 'Kyrie Rex splendens', 'For feasts of the II class', 'Para as festas de II classe'),
    ('VIII', 'De Angelis', 'For feasts of the II class', 'Para as festas de II classe'),
    ('IX', 'Cum jubilo', 'For feasts of the Blessed Virgin Mary', 'Para as festas da Bem-aventurada Virgem Maria'),
    ('X', 'Alme Pater', 'For feasts of the Blessed Virgin Mary', 'Para as festas da Bem-aventurada Virgem Maria'),
    ('XI', 'Orbis factor', 'For Sundays through the year', 'Para os domingos durante o ano'),
    ('XII', 'Pater cuncta', 'For feasts of the III class', 'Para as festas de III classe'),
    ('XIII', 'Stelliferi Conditor orbis', 'For feasts of the III class', 'Para as festas de III classe'),
    ('XIV', 'Jesu Redemptor', 'For feasts of the III class', 'Para as festas de III classe'),
    ('XV', 'Dominator Deus', 'For commemorations and the ferias of Christmastide', 'Para as comemorações e as férias do Tempo do Natal'),
    ('XVI', None, 'For ferias through the year', 'Para as férias durante o ano'),
    ('XVII', None, 'For the Sundays of Advent and Lent', 'Para os domingos do Advento e da Quaresma'),
    ('XVIII', 'Deus Genitor alme', 'For the ferias of Advent and Lent, vigils, Ember days and Rogation days', 'Para as férias do Advento e da Quaresma, vigílias, Têmporas e Rogações'),
]
PART_ORDER = ['Kyrie', 'Gloria', 'Sanctus', 'Agnus Dei', 'Ite', 'Benedicamus']
ROMAN = r'[IVX]+'


def dump():
    if not CACHE.exists():
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        print(f'fetching {DUMP_URL}')
        urllib.request.urlretrieve(DUMP_URL, CACHE)
    return CACHE.read_text(encoding='utf-8')


def rows(sql, table):
    """Every row of `table` as a dict. The dump is phpMyAdmin's multi-row INSERTs."""
    escapes = {'n': '\n', 'r': '\r', 't': '\t', '0': '\0'}
    out = []
    for m in re.finditer(r'INSERT INTO `%s` \(([^)]*)\) VALUES\s*' % table, sql):
        cols = [c.strip('` ') for c in m.group(1).split(',')]
        i = m.end()
        while sql[i] == '(':
            i += 1
            vals = []
            while True:
                if sql[i] == "'":
                    i += 1
                    buf = []
                    while True:
                        c = sql[i]
                        if c == '\\':
                            buf.append(escapes.get(sql[i + 1], sql[i + 1]))
                            i += 2
                        elif c == "'" and sql[i + 1] == "'":
                            buf.append("'")
                            i += 2
                        elif c == "'":
                            i += 1
                            break
                        else:
                            buf.append(c)
                            i += 1
                    vals.append(''.join(buf))
                else:
                    j = i
                    while sql[j] not in ',)':
                        j += 1
                    token = sql[i:j].strip()
                    vals.append(None if token == 'NULL' else token)
                    i = j
                if sql[i] == ')':
                    i += 1
                    break
                i += 1
                while sql[i] == ' ':
                    i += 1
            out.append(dict(zip(cols, vals)))
            if sql[i] != ',':
                break
            i += 1
            while sql[i] in '\r\n ':
                i += 1
    return out


def tidy(gabc):
    """A score with Unix line ends, no trailing blanks and one final newline."""
    lines = [line.rstrip() for line in gabc.replace('\r\n', '\n').replace('\r', '\n').split('\n')]
    return '\n'.join(lines).strip() + '\n'


def score(chant):
    """The GABC of a chant in the dump. GregoBase stores either the bare score,
    a JSON string of it, or a JSON list of `[kind, text]` segments in which the
    `tex` ones are Gregorio-TeX spacing tweaks for its own PDF and not notation.
    A hymn's further verses are a field of their own."""
    raw = chant['gabc'] or ''
    try:
        value = json.loads(raw)
    except ValueError:
        value = raw
    if isinstance(value, list):
        value = '\n'.join(seg[1] for seg in value if seg[0] == 'gabc')
    if not isinstance(value, str):
        value = raw
    if chant.get('gabc_verses'):
        value += '\n' + chant['gabc_verses']
    return tidy(value)


class Gone(Exception):
    """GregoBase no longer has the chant."""


def fetch_live(chant_id):
    """A chant as the live site serves it: (headers, score).

    `download.php` answers one notation segment per request (`elem`), nothing
    at all past the last, and — for a chant stored as a single score — the same
    whole score whatever `elem` says."""
    headers, parts = {}, []
    for elem in range(1, 20):
        request = urllib.request.Request(
            LIVE_URL.format(id=chant_id, elem=elem), headers={'User-Agent': USER_AGENT}
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            text = response.read().decode('utf-8')
        if text.strip() == 'Wrong id':
            raise Gone(chant_id)
        head, sep, body = text.partition('\n%%\n')
        if not sep or (parts and body == parts[0]):
            break
        if not parts:
            for line in head.splitlines():
                key, colon, value = line.partition(':')
                if colon:
                    headers[key.strip()] = value.strip().removesuffix(';').strip()
        parts.append(body)
    if not parts:
        raise Gone(chant_id)
    return headers, tidy('\n'.join(parts))


# What GregoBase's record says of a chant, as against what this importer names
# and places itself (`name`, `subtitle`, `book`).
UPSTREAM_HEADERS = ('mode', 'commentary', 'transcriber')


def sync(files=None):
    """Bring each chant file up to the live site: its score and the headers
    GregoBase owns. Prints what changed; returns the number of files rewritten."""
    changed, gone = [], []
    files = sorted(files or CHANTS.glob('*.gabc'))
    for n, f in enumerate(files, 1):
        text = f.read_text(encoding='utf-8')
        head, _, body = text.partition('%%\n')
        found = re.search(r'^gregobase: (\d+);$', head, re.M)
        if not found:
            continue
        print(f'\r  {n}/{len(files)} {f.stem:<40}', end='', file=sys.stderr, flush=True)
        try:
            live_headers, live_score = fetch_live(found.group(1))
        except Gone:
            gone.append(f.stem)
            continue
        what = []
        if live_score != body:
            what.append('score')
        lines = []
        for line in head.splitlines():
            key = line.partition(':')[0]
            if key in UPSTREAM_HEADERS:
                continue
            if key == 'book':
                # The headers GregoBase owns sit together, after the name and before the book.
                lines += [f'{k}: {live_headers[k]};' for k in UPSTREAM_HEADERS if live_headers.get(k)]
            lines.append(line)
        new_head = '\n'.join(lines) + '\n'
        if new_head != head:
            what.append('headers')
        if what:
            f.write_text(new_head + '%%\n' + live_score, encoding='utf-8')
            changed.append((f.stem, what))
        time.sleep(0.2)
    print('\r' + ' ' * 60 + '\r', end='', file=sys.stderr)
    for stem, what in changed:
        print(f'  updated  chant/{stem} ({", ".join(what)})')
    for stem in gone:
        print(f'  GONE     chant/{stem}: GregoBase no longer serves it; the file is left as it was')
    print(f'gregobase: {len(files)} chants checked, {len(changed)} updated, {len(gone)} gone')
    return len(changed)


def slug(name):
    s = name.lower().replace('/', '-')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def load():
    sql = dump()
    chants = {c['id']: c for c in rows(sql, 'gregobase_chants')}
    pages = {}
    for s in rows(sql, 'gregobase_chant_sources'):
        if s['source'] == GRADUALE_1961:
            pages.setdefault(s['chant_id'], []).append((s['page'], int(s['sequence'])))
    tag_names = {t['id']: t['tag'] for t in rows(sql, 'gregobase_tags')}
    tags = {}
    for t in rows(sql, 'gregobase_chant_tags'):
        tags.setdefault(t['chant_id'], set()).add(tag_names.get(t['tag_id']))
    return chants, pages, tags


def kyriale(chants, pages, tags):
    """The Kyriale's chants in the book's own order, as
    (section id, display name, nickname, chant) tuples."""

    def starred(chant_id):
        """Where the Kyriale first prints a chant: (page, sequence)."""
        own = [(int(p[:-1]), seq) for p, seq in pages.get(chant_id, []) if re.fullmatch(r'\d+\*', p)]
        return min(own) if own else None

    listed = sorted(
        ((starred(i), c) for i, c in chants.items() if starred(i) and not int(c['copyrighted'])),
        key=lambda pair: pair[0],
    )
    out = []
    for (page, _), c in listed:
        incipit = c['incipit'].strip()
        part = c['office-part']
        if page <= 4 and part == 'an':
            m = re.fullmatch(r'Asperges me \(ad lib\.\) (%s)' % ROMAN, incipit)
            out.append(('asperges', f'Asperges me ad libitum {m.group(1)}' if m else incipit, None, c))
            continue
        if part != 'ky' or page > 93:
            continue
        m = re.fullmatch(r'(Kyrie|Gloria|Sanctus|Agnus|Agnus Dei|Ite) (%s)(?: ?([abC]))?' % ROMAN, incipit)
        if m:
            kind = 'Agnus Dei' if m.group(1) == 'Agnus' else m.group(1)
            name = f'{kind} {m.group(2)}' + (f' {m.group(3).upper()}' if m.group(3) else '')
            out.append((f'mass-{m.group(2).lower()}', name, None, c))
            continue
        if incipit == 'Ite XV/XVI':
            out.append(('mass-xv', 'Ite XV–XVI', None, c))
            out.append(('mass-xvi', 'Ite XV–XVI', None, c))
            continue
        if incipit.startswith('Benedicamus'):
            name = 'Benedicamus ad libitum' if 'ad lib' in incipit else incipit
            for tag in sorted(tags.get(c['id'], ())):
                m = re.fullmatch(r'Ordinarium (%s)' % ROMAN, tag or '')
                if m:
                    out.append((f'mass-{m.group(1).lower()}', name, None, c))
            continue
        m = re.fullmatch(r'Credo (%s)' % ROMAN, incipit)
        if m:
            out.append(('credo', incipit, None, c))
            continue
        m = re.fullmatch(r'(Kyrie|Gloria|Sanctus|Agnus) \(ad lib\.\) (%s)\.?(?: / .*| - (.*))?' % ROMAN, incipit)
        if m:
            kind = 'Agnus Dei' if m.group(1) == 'Agnus' else m.group(1)
            out.append(('ad-libitum', f'{kind} ad libitum {m.group(2)}', m.group(3), c))
            continue
        # The fourth Gloria ad libitum, which the book heads "more ambrosiano".
        if incipit == 'Gloria (Ambrosian)':
            out.append(('ad-libitum', 'Gloria ad libitum IV', 'More ambrosiano', c))
            continue
        # A troped Kyrie someone filed on the Kyriale's page; the book has no tropes.
        if incipit == 'Lux et origo':
            continue
        raise SystemExit(f'unplaced Kyriale chant {c["id"]}: {incipit!r} (p. {page}*)')

    # An Ite shared by two Masses is tagged with both but named for one.
    for section, name, nick, c in list(out):
        if not name.startswith('Ite'):
            continue
        for tag in tags.get(c['id'], ()):
            m = re.fullmatch(r'Ordinarium (%s)' % ROMAN, tag or '')
            other = f'mass-{m.group(1).lower()}' if m else section
            if other != section and not any(s == other and x is c for s, _, _, x in out):
                out.append((other, name, nick, c))
    return out


def part_rank(name):
    for i, part in enumerate(PART_ORDER):
        if name.startswith(part):
            return i
    return len(PART_ORDER)


def header(key, value):
    return f'{key}: {value};\n' if value else ''


def write_kyriale(offline=False):
    chants, pages, tags = load()
    placed = kyriale(chants, pages, tags)

    CHANTS.mkdir(parents=True, exist_ok=True)
    BOOKS.mkdir(parents=True, exist_ok=True)
    ids = {}
    for _, name, nick, c in placed:
        if c['id'] in ids:
            continue
        chant_id = slug(name)
        if chant_id in ids.values():
            raise SystemExit(f'two chants would be chant/{chant_id}')
        ids[c['id']] = chant_id
        page = min((p for p in pages[c['id']] if p[0].endswith('*')), key=lambda p: int(p[0][:-1]))[0]
        text = (
            header('name', name)
            + header('subtitle', nick)
            + header('office-part', 'Kyriale')
            + header('mode', c['mode'])
            + header('commentary', (c['commentary'] or '').strip())
            + header('transcriber', c['transcriber'])
            + header('book', f'{GRADUALE_1961_NAME}, p. {page}')
            + header('gregobase', c['id'])
            + '%%\n'
            + score(c)
        )
        (CHANTS / f'{chant_id}.gabc').write_text(text, encoding='utf-8')

    def items(section):
        seen, out = set(), []
        for s, name, _, c in placed:
            if s == section and c['id'] not in seen:
                seen.add(c['id'])
                out.append((name, f'chant/{ids[c["id"]]}'))
        return out

    sections = [
        {
            'id': 'asperges',
            'title': {'en-US': 'At the Sprinkling of Holy Water', 'pt-BR': 'Na aspersão da água benta'},
            'chants': [ref for _, ref in items('asperges')],
        }
    ]
    for number, name, en, pt in MASSES:
        mass = sorted(items(f'mass-{number.lower()}'), key=lambda item: part_rank(item[0]))
        section = {
            'id': f'mass-{number.lower()}',
            'title': {'en-US': f'Mass {number}', 'pt-BR': f'Missa {number}'},
            'occasion': {'en-US': en, 'pt-BR': pt},
            'chants': [ref for _, ref in mass],
        }
        if name:
            section['name'] = name
        sections.append(section)
    sections.append({'id': 'credo', 'title': {'en-US': 'Credo', 'pt-BR': 'Credo'}, 'chants': [ref for _, ref in items('credo')]})
    sections.append(
        {
            'id': 'ad-libitum',
            'title': {'en-US': 'Chants ad libitum', 'pt-BR': 'Cantos ad libitum'},
            'chants': [ref for _, ref in items('ad-libitum')],
        }
    )
    book = {
        'id': 'chant-book/kyriale',
        'name': {'en-US': 'Kyriale', 'pt-BR': 'Kyriale'},
        'description': {
            'en-US': 'The chants of the Ordinary of the Mass — Kyrie, Gloria, Credo, Sanctus and Agnus Dei — in the eighteen Masses of the Roman Gradual.',
            'pt-BR': 'Os cantos do Ordinário da Missa — Kyrie, Gloria, Credo, Sanctus e Agnus Dei — nas dezoito Missas do Gradual Romano.',
        },
        'source': f'{GRADUALE_1961_NAME} · GregoBase (CC0)',
        'sections': sections,
    }
    (BOOKS / 'kyriale.json').write_text(json.dumps(book, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(ids)} chants, {len(sections)} sections')
    if not offline:
        sync([CHANTS / f'{chant_id}.gabc' for chant_id in ids.values()])


def find(query):
    chants, pages, _ = load()
    pat = re.compile(query, re.I)
    for c in chants.values():
        if pat.search(c['incipit']):
            where = ', '.join(p for p, _ in pages.get(c['id'], []))
            print(f'{c["id"]:>6} {c["office-part"] or "":3} mode {c["mode"] or "-":2} {c["incipit"]}  [GR 1961 p. {where or "—"}]')


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['--find'] and len(args) == 2:
        find(args[1])
    elif args == ['--sync']:
        sync()
    elif args in ([], ['--offline']):
        write_kyriale(offline=bool(args))
    else:
        sys.exit(__doc__)
