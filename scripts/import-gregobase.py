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
    python3 scripts/import-gregobase.py --propers    # (re)write the chants of the 1962 Missal's propers
    python3 scripts/import-gregobase.py --office     # (re)write the antiphons, hymns and short responsories of the 1960 Breviary
    python3 scripts/import-gregobase.py --prayers    # the chant of each prayer in content/practices/, and its place in the prayer
    python3 scripts/import-gregobase.py --offline    # either, from the dump alone
    python3 scripts/import-gregobase.py --sync       # refresh every score already in content/
    python3 scripts/import-gregobase.py --find "salve regina"

The Kyriale is a book, brought in whole and in its own order (content/chants/,
content/chant-books/). The propers are brought in by what the Missal prints:
for each Introit, Gradual, Alleluia, Tract, Offertory, Communion and Sequence in
Divinum Officium's Latin, the score that sets the same words
(content/chant-propers/, linked by scripts/chant_link.py).

What lands in content/ is one `.gabc` file per chant — its GregoBase record as
GABC headers, its score untouched — and one book file giving the chants their
order. The score keeps its Gregorio-TeX tags: the app's GABC reader
(apps/app/src/features/chant/gabc.ts) decides how a tag is drawn, so a sync
diffs only where GregoBase itself changed.
"""
import json, pathlib, re, sys, time, urllib.error, urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import chant_link  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHANTS = ROOT / 'content/chants'
PROPERS = ROOT / 'content/chant-propers'
DO_WWW = ROOT / 'content/do/web/www'
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
    files = sorted(files or [*CHANTS.glob('*.gabc'), *PROPERS.glob('*.gabc')])
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
            if key == 'book' or (key == 'gregobase' and 'book:' not in head):
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
        print(f'  updated  {stem} ({", ".join(what)})')
    for stem in gone:
        print(f'  GONE     {stem}: GregoBase no longer serves it; the file is left as it was')
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


# The books a 1962 Mass is sung from, best first: where several set a text, the
# earliest here is taken, and a score in none of them is not taken at all — the
# Dominican Gradual sets many of the same words to its own rite's melodies.
# Graduale Romanum 1961, Liber Usualis, Graduale Romanum 1908 and 1974, the Offertoriale.
MASS_BOOKS = ['2', '3', '1', '4', '32']


ORNATE = re.compile(r'solemn|another|alius|alter|ad lib|monastic|\(\d\)', re.I)


def plain_gabc(chant):
    """Whether a score is square notes alone. GregoBase also holds "triplex"
    transcriptions, whose note groups carry the St Gall neumes after a `|`;
    the app's engraver reads those as notes."""
    return not re.search(r'\([^)]*\|', chant['gabc'])


# The books the Roman Office is sung from: the Liber antiphonarius of 1960, the
# Liber Usualis, the Antiphonale Romanum of 1912. Not the monastic antiphoners,
# whose psalter is another, nor yet the Nocturnale: Matins waits on its responsories.
OFFICE_BOOKS = ['48', '3', '9']


def write_propers(offline=False):
    """The chant of every proper the Missal prints, found by its text."""
    link_into_propers(MASS_BOOKS, chant_link.GENRES, chant_link.missal_pieces(DO_WWW), 'Missal', offline)


def write_office(offline=False):
    """The chant of every antiphon, hymn and short responsory the Breviary prints."""
    link_into_propers(OFFICE_BOOKS, chant_link.OFFICE_GENRES, chant_link.breviary_pieces(DO_WWW), 'Breviary', offline)


def link_into_propers(books, genres, pieces, book_name, offline):
    sql = dump()
    chants = {c['id']: c for c in rows(sql, 'gregobase_chants') if not int(c['copyrighted']) and c['gabc']}
    sources = {s['id']: s for s in rows(sql, 'gregobase_sources')}
    pages = {}
    for s in rows(sql, 'gregobase_chant_sources'):
        pages.setdefault(s['chant_id'], []).append((s['source'], s['page']))
    rank = {b: i for i, b in enumerate(books)}
    book_rank = lambda cid: min((rank.get(src, 99) for src, _ in pages.get(cid, [])), default=99)
    # Of two settings in one book, the one it prints first: not the "alius tonus", not the tone ad libitum.
    preference = lambda c: book_rank(c['id']) * 2 + bool(ORNATE.search(c['incipit']))

    finder = chant_link.Finder(
        (c['id'], c['office-part'], chant_link.chant_key(c['office-part'], score(c)), preference(c))
        for c in chants.values()
        if c['office-part'] in genres and book_rank(c['id']) < 99 and plain_gabc(c)
    )
    wanted, unlinked = {}, 0
    for (genre, key), _ in pieces.items():
        found, cid = finder.find(chant_link.KIN.get(genre, (genre,)), key)
        if found >= chant_link.THRESHOLD:
            wanted[cid] = chants[cid]
        else:
            unlinked += 1
    print(f'{len(pieces)} chant texts in the {book_name}, {len(pieces) - unlinked} with a score, {len(wanted)} scores')

    PROPERS.mkdir(parents=True, exist_ok=True)
    keep = set()
    for cid, c in sorted(wanted.items(), key=lambda kv: int(kv[0])):
        genre = c['office-part']
        # GregoBase tells its settings of one text apart in brackets after the incipit; the incipit is the name.
        incipit = re.sub(r'\s*\(.*\)\s*$', '', c['incipit'].strip())
        where = sorted(pages.get(cid, []), key=lambda sp: rank.get(sp[0], 99))
        book = f"{sources[where[0][0]]['title']}, {sources[where[0][0]]['year']}, p. {where[0][1]}" if where else None
        # The GregoBase id keeps a name unique and stable however the set grows.
        stem = f'{genre}-{slug(incipit)}-{cid}'
        keep.add(stem)
        # A file already here may hold a later score than the dump's: the sync's to refresh, not this.
        if (PROPERS / f'{stem}.gabc').exists():
            continue
        (PROPERS / f'{stem}.gabc').write_text(
            header('name', incipit)
            + header('office-part', genres[genre])
            + header('mode', c['mode'])
            + header('commentary', (c['commentary'] or '').strip())
            + header('transcriber', c['transcriber'])
            + header('book', book)
            + header('gregobase', cid)
            + '%%\n'
            + score(c),
            encoding='utf-8',
        )
    # Only this run's genres: the Missal's scores and the Breviary's share the folder.
    for stale in PROPERS.glob('*.gabc'):
        if stale.stem.split('-')[0] in genres and stale.stem not in keep:
            stale.unlink()
    if not offline:
        sync(sorted(f for f in PROPERS.glob('*.gabc') if f.stem.split('-')[0] in genres))


# Where a prayer's chant is taken from, best first: the books a parish sings from
# before the monastic ones. Liber Usualis, Graduale Romanum 1961, Liber antiphonarius,
# Cantus selecti, Chants of the Church, Liber cantualis, Liber Hymnarius, Antiphonale Monasticum.
PRAYER_BOOKS = ['3', '2', '48', '10', '5', '66', '15', '7']
# A prayer and a score are the same text only when nearly all of each is in the other.
PRAYER_THRESHOLD = 0.95
PRAYER_BOOK = {
    'id': 'chant-book/cantus',
    'name': {'en-US': 'Hymns and antiphons', 'pt-BR': 'Hinos e antífonas'},
    'description': {
        'en-US': 'The chant of prayers the Church has always sung: the antiphons of Our Lady, the hymns of the Office and of the Blessed Sacrament, the sequences.',
        'pt-BR': 'O canto de orações que a Igreja sempre cantou: as antífonas de Nossa Senhora, os hinos do Ofício e do Santíssimo Sacramento, as sequências.',
    },
    'source': 'GregoBase (CC0)',
    # Its sections are lists to choose a chant from, not Masses to be sung through.
    'list': 'chants',
}
PRAYER_SECTIONS = [
    ('antiphons', ('an',), {'en-US': 'Antiphons', 'pt-BR': 'Antífonas'}),
    ('hymns', ('hy',), {'en-US': 'Hymns', 'pt-BR': 'Hinos'}),
    ('sequences', ('se',), {'en-US': 'Sequences', 'pt-BR': 'Sequências'}),
    ('other', (), {'en-US': 'Other chants', 'pt-BR': 'Outros cantos'}),
]
OFFICE_PART = {'an': 'Antiphona', 'hy': 'Hymnus', 'se': 'Sequentia', 'ca': 'Canticum', 'co': 'Communio', 'ps': 'Psalmus'}


def latin_blocks(node, out):
    """Every Latin text of a flow, in order."""
    if isinstance(node, dict):
        la = node.get('la')
        if isinstance(la, str) and len(la) > 30:
            out.append(la)
        for value in node.values():
            latin_blocks(value, out)
    elif isinstance(node, list):
        for value in node:
            latin_blocks(value, out)


def sections_span(text, start):
    """In JSON `text`, the `[`…`]` of the first `"sections"` array at or after
    `start`, and the (begin, end) of each of its elements."""
    at = text.index('"sections"', start)
    open_at = text.index('[', at)
    depth, in_string, escaped, begin, elements = 0, False, False, None, []
    for i in range(open_at, len(text)):
        c = text[i]
        if in_string:
            escaped = c == '\\' and not escaped
            if c == '"' and not escaped:
                in_string = False
            continue
        if c == '"':
            in_string = True
            if depth == 1 and begin is None:
                begin = i
        elif c in '[{':
            if depth == 1 and begin is None:
                begin = i
            depth += 1
        elif c in ']}':
            depth -= 1
            if depth == 1 and begin is not None:
                elements.append((begin, i + 1))
                begin = None
            if depth == 0:
                return open_at, i, elements
    raise ValueError('unclosed sections array')


def place_chant(path, flow_at, block, ref):
    """Write `{type: chant, ref}` into the flow in `path`, after the section
    that holds `block`. The file is edited as text, so nothing else in it moves."""
    text = path.read_text(encoding='utf-8')
    if f'"{ref}"' in text:
        return False
    _, _, elements = sections_span(text, flow_at(text))
    for begin, end in elements:
        held = []
        latin_blocks(json.loads(text[begin:end]), held)
        if block in held:
            line_start = text.rfind('\n', 0, begin) + 1
            indent = text[line_start:begin] if not text[line_start:begin].strip() else ''
            node = json.dumps({'type': 'chant', 'ref': ref}, ensure_ascii=False)
            glue = f',\n{indent}' if indent or '\n' in text[begin:end] else ', '
            path.write_text(text[:end] + glue + node + text[end:], encoding='utf-8')
            return True
    return False


def write_prayers(offline=False):
    """The chant of each prayer the corpus already has, found by the prayer's
    whole Latin text, brought in as a score and named in the prayer's flow."""
    sql = dump()
    chants = {c['id']: c for c in rows(sql, 'gregobase_chants') if not int(c['copyrighted']) and c['gabc']}
    pages = {}
    for s in rows(sql, 'gregobase_chant_sources'):
        pages.setdefault(s['chant_id'], []).append((s['source'], s['page']))
    sources = {s['id']: s for s in rows(sql, 'gregobase_sources')}
    rank = {b: i for i, b in enumerate(PRAYER_BOOKS)}

    def preference(c):
        book = min((rank.get(src, 99) for src, _ in pages.get(c['id'], [])), default=99)
        # Of two settings in one book, the plain one: not the solemn tone, not "another chant".
        return book * 2 + bool(ORNATE.search(c['incipit']))

    genres = set(OFFICE_PART) | {'va', 'pa', 'su', 'rh'}
    finder = chant_link.Finder(
        (c['id'], c['office-part'], chant_link.fold(chant_link.lyrics(score(c))), preference(c))
        for c in chants.values()
        if c['office-part'] in genres and plain_gabc(c)
    )

    placed, files, by_section = [], [], {key: [] for key, _, _ in PRAYER_SECTIONS}
    used = {}
    for d in sorted((ROOT / 'content/practices').iterdir()):
        manifest_path, flow_path = d / 'manifest.json', d / 'flow.json'
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
        flow = json.loads(flow_path.read_text(encoding='utf-8')) if flow_path.exists() else manifest.get('flow')
        blocks = []
        latin_blocks(flow, blocks)
        # One Latin text, or a prayer with its versicle and collect. A whole office is not a prayer.
        if not blocks or len(blocks) > 3:
            continue
        found = finder.settings(genres, chant_link.fold(blocks[0]), PRAYER_THRESHOLD)
        if not found:
            continue
        c = chants[found[0][2]]
        name = re.sub(r'\s*\([^)]*\)', '', c['incipit']).replace('...', '').strip()
        name = re.sub(r'\s+(I{1,3}|IV|V)$', '', name)
        chant_id = used.get(c['id']) or slug(name)
        if chant_id in used.values() and used.get(c['id']) != chant_id:
            chant_id = f'{chant_id}-{c["id"]}'
        if (CHANTS / f'{chant_id}.gabc').exists() and c['id'] not in used:
            # Already a chant of the library under this name (the Kyriale's, or an earlier run's).
            existing = (CHANTS / f'{chant_id}.gabc').read_text(encoding='utf-8')
            if f'gregobase: {c["id"]};' not in existing:
                chant_id = f'{chant_id}-{c["id"]}'
        if c['id'] not in used:
            used[c['id']] = chant_id
            where = sorted(pages.get(c['id'], []), key=lambda sp: rank.get(sp[0], 99))
            book = f"{sources[where[0][0]]['title']}, {sources[where[0][0]]['year']}, p. {where[0][1]}" if where else None
            target = CHANTS / f'{chant_id}.gabc'
            if not target.exists():
                target.write_text(
                    header('name', name)
                    + header('office-part', OFFICE_PART.get(c['office-part'], 'Varia'))
                    + header('mode', c['mode'])
                    + header('commentary', (c['commentary'] or '').strip())
                    + header('transcriber', c['transcriber'])
                    + header('book', book)
                    + header('gregobase', c['id'])
                    + '%%\n'
                    + score(c),
                    encoding='utf-8',
                )
            files.append(target)
            section = next((key for key, kinds, _ in PRAYER_SECTIONS if c['office-part'] in kinds), 'other')
            by_section[section].append((name, f'chant/{chant_id}'))
        ref = f'chant/{chant_id}'
        if flow_path.exists():
            done = place_chant(flow_path, lambda text: 0, blocks[0], ref)
        else:
            done = place_chant(manifest_path, lambda text: text.index('"flow"'), blocks[0], ref)
        placed.append((d.name, ref, round(found[0][0], 2), len(found), done))

    book = dict(PRAYER_BOOK)
    book['sections'] = [
        {'id': key, 'title': title, 'chants': [ref for _, ref in sorted(by_section[key])]}
        for key, _, title in PRAYER_SECTIONS
        if by_section[key]
    ]
    BOOKS.mkdir(parents=True, exist_ok=True)
    (BOOKS / 'cantus.json').write_text(json.dumps(book, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for practice, ref, found_score, settings, done in placed:
        print(f'  {practice:<34} {ref:<44} {found_score:.2f}  {settings:>2} setting{"s" if settings > 1 else ""}{"" if done else "  (already placed)"}')
    print(f'{len(placed)} prayers, {len(used)} scores')
    if not offline:
        sync(files)


def find(query):
    chants, pages, _ = load()
    pat = re.compile(query, re.I)
    for c in chants.values():
        if pat.search(c['incipit']):
            where = ', '.join(p for p, _ in pages.get(c['id'], []))
            print(f'{c["id"]:>6} {c["office-part"] or "":3} mode {c["mode"] or "-":2} {c["incipit"]}  [GR 1961 p. {where or "—"}]')


if __name__ == '__main__':
    args = sys.argv[1:]
    offline = '--offline' in args
    args = [a for a in args if a != '--offline']
    if args[:1] == ['--find'] and len(args) == 2:
        find(args[1])
    elif args == ['--sync']:
        sync()
    elif args == ['--propers']:
        write_propers(offline)
    elif args == ['--office']:
        write_office(offline)
    elif args == ['--prayers']:
        write_prayers(offline)
    elif args == []:
        write_kyriale(offline)
    else:
        sys.exit(__doc__)
