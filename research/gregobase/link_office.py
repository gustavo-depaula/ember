"""Experiment: how much of the Roman Breviary's chant is in GregoBase?

The same question link_mass.py asks of the Missal, asked of the Office that
Divinum Officium prints: every antiphon, hymn, responsory and short responsory
of the Latin files, looked up by its words.

    python3 research/gregobase/link_office.py [--write]
"""
import collections, json, pathlib, re, sys
import gb

DO = gb.ROOT / 'content/do/web/www/horas/Latin'
FOLDERS = ('Tempora', 'Sancti', 'Commune', 'Psalterium')
# Liber antiphonarius 1960, Liber Usualis, Antiphonale Romanum 1912, Nocturnale Romanum,
# Liber responsorialis, Antiphonale Monasticum 1934, Liber Hymnarius.
BOOKS = ['48', '3', '9', '23', '56', '7', '15']


def sections(path):
    out, name = {}, None
    for line in path.read_text(encoding='utf-8', errors='ignore').splitlines():
        m = re.match(r'^\[([^\]]+)\]', line)
        if m:
            name = m.group(1)
            out.setdefault(name, [])
        elif name:
            out[name].append(line.rstrip())
    return out


def sung(line):
    return bool(line) and line[0] not in '!&$@#(_' and not line.startswith('v. ') or line.startswith('v. ')


def pieces(name, lines):
    """(genre, text) for each chant in a section of the Breviary."""
    lines = [l for l in lines if l and l[0] not in '!&$@#(_']
    if not lines:
        return
    if re.match(r'Ant\b', name) or name == 'Invit':
        for line in lines:
            # `antiphon;;psalm` — the psalm number is not sung.
            text = line.split(';;')[0].strip()
            if len(text) > 12:
                yield 'an', text
    elif re.match(r'Hymnus', name):
        # A hymn is known by its first stanza; later ones differ between the monastic and Roman books.
        stanza = []
        for line in lines:
            if line.strip() == '_':
                break
            stanza.append(re.sub(r'^v\.\s*', '', line))
            if len(stanza) == 4:
                break
        yield 'hy', ' '.join(stanza)
    elif re.match(r'Responsory Breve', name):
        yield 'rb', re.sub(r'^R\.br\.\s*|^R\.\s*', '', lines[0])
    elif re.match(r'Responsory\s*\d', name) or re.match(r'Responsory(?! Breve)', name):
        first = []
        for line in lines:
            if line.startswith('V.') and first:
                break
            first.append(re.sub(r'^R\.\s*', '', line))
        yield 're', ' '.join(first)


def main():
    chants, sources, pages = gb.load()
    finder = gb.Finder(chants, pages, {'an', 'hy', 're', 'rb', 'ps', 'va'}, BOOKS)
    alt = {'an': ('an', 'ps', 'va'), 'hy': ('hy', 'va'), 're': ('re', 'rb'), 'rb': ('rb', 're')}

    texts = collections.defaultdict(set)
    show = {}
    for folder in FOLDERS:
        for f in sorted((DO / folder).rglob('*.txt')):
            for name, lines in sections(f).items():
                for genre, text in pieces(name, lines):
                    key = gb.fold(text)
                    if len(key) < 12:
                        continue
                    texts[(genre, key)].add(f'{f.relative_to(DO).with_suffix("")}#{name}')
                    show[(genre, key)] = text

    links, stats = {}, collections.defaultdict(lambda: [0, 0, 0])
    for (genre, key), places in texts.items():
        score, cid = finder.find(alt[genre], key)
        s = stats[genre]
        s[0] += 1
        if score >= 0.8:
            s[1] += 1
            for place in places:
                links.setdefault(place, []).append({'chant': cid, 'score': round(score, 3), 'genre': genre})
        elif score >= 0.55:
            s[2] += 1

    print(f'{"genre":<18}{"texts":>7}{"linked":>8}{"doubtful":>10}')
    for genre, (n, ok, maybe) in sorted(stats.items()):
        print(f'{gb.PARTS[genre]:<18}{n:>7}{ok:>8}{maybe:>10}   {ok / n:.0%}')
    total = [sum(s[i] for s in stats.values()) for i in range(3)]
    print(f'{"all":<18}{total[0]:>7}{total[1]:>8}{total[2]:>10}   {total[1] / total[0]:.0%}')
    distinct = {l['chant'] for ls in links.values() for l in ls}
    print('sections linked:', len(links), 'distinct chants:', len(distinct))
    book_of = lambda cid: min((finder.rank.get(s, 99) for s, _ in pages.get(cid, [])), default=99)
    used = collections.Counter(book_of(c) for c in distinct)
    print('by book:', {(sources[BOOKS[k]]['title'] + ' ' + str(sources[BOOKS[k]]['year'])) if k < 99 else 'other': v for k, v in sorted(used.items())})
    if '--write' in sys.argv:
        out = pathlib.Path(__file__).with_name('office-links.json')
        out.write_text(json.dumps(links, ensure_ascii=False, indent=0, sort_keys=True) + '\n', encoding='utf-8')
        print('wrote', out.name)


if __name__ == '__main__':
    main()
