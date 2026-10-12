"""Experiment: can the chant of each Mass proper be found by its words alone?

The first run of the idea, kept as it was made. What it showed is now built:
scripts/chant_link.py holds the method, scripts/import-gregobase.py --propers
brings the scores in, and scripts/build-corpus.py files them by text.

For every Introit, Gradual, Alleluia, Tract, Offertory, Communion and Sequence
that Divinum Officium prints (content/do, the 1962 Missal's Latin), look for
the GregoBase score that sets the same text. No table of days is involved: the
link is from text to text, so it holds for any day that prints that text.

    python3 research/gregobase/link_mass.py            # summary
    python3 research/gregobase/link_mass.py --write    # also write mass-links.json
"""
import collections, difflib, json, pathlib, re, sys
import gb

DO = gb.ROOT / 'content/do/web/www/missa/Latin'
# The books a 1962 Mass is sung from, best first: a text set in several takes the earliest here.
BOOKS = ['2', '3', '1', '4', '14']  # Graduale Romanum 1961, Liber Usualis, GR 1908, GR 1974, Graduale O.P.


def sections(path):
    out, name = {}, None
    for line in path.read_text(encoding='utf-8').splitlines():
        m = re.match(r'^\[([^\]]+)\]', line)
        if m:
            name = m.group(1)
            out.setdefault(name, [])
        elif name:
            out[name].append(line.rstrip())
    return out


def words(lines):
    """A section's sung text: references, rubrics and inclusions dropped."""
    kept = []
    for line in lines:
        if not line or line[0] in '!&$@#' or line.startswith('_'):
            continue
        line = re.sub(r'\([^)]*\)', '', line)
        kept.append(re.sub(r'^[vVR]\.\s*', '', line).strip())
    return ' '.join(k for k in kept if k)


ALLELUIA = r'All?el[úu][ij]a'


def between_the_readings(lines):
    """A [Graduale] as its chants. It is a gradual with an alleluia, or with a
    tract after a `_` in Lent, or two alleluias in Paschal time."""
    cut = next((i for i, l in enumerate(lines) if l.startswith('_') or l.startswith('!Tractus')), None)
    out = []
    if cut is not None:
        tract = words(lines[cut:])
        if tract:
            out.append(('tr', tract))
        lines = lines[:cut]
    text_lines = [l for l in lines if l and l[0] not in '!&$@#']
    if text_lines and re.fullmatch(rf'{ALLELUIA},\s*{ALLELUIA}\.?', text_lines[0].strip(), flags=re.I):
        # Paschal time: every verse that follows is an alleluia of its own.
        for line in text_lines[1:]:
            verse = words([line])
            if verse:
                out.append(('al', verse))
        return out
    parts = re.split(rf'{ALLELUIA},\s*{ALLELUIA}\.?', words(lines), maxsplit=1, flags=re.I)
    if parts[0].strip():
        out.append(('gr', parts[0].strip()))
    if len(parts) > 1 and parts[1].strip():
        out.append(('al', parts[1].strip()))
    return out


def pieces(name, lines):
    """The chants a section holds, as (genre, text)."""
    if lines and lines[0].startswith('@'):
        return []
    if name in ('Introitus', 'Offertorium', 'Communio'):
        # The antiphon alone: an Introit goes on to its psalm verse, which the books abbreviate.
        first = []
        for line in lines:
            if line.startswith('!') and first:
                break
            first.append(line)
        genre = {'Introitus': 'in', 'Offertorium': 'of', 'Communio': 'co'}[name]
        return [(genre, words(first))]
    if name == 'Sequentia':
        return [('se', words(lines))]
    if name.startswith('Graduale'):
        return between_the_readings(lines)
    if name == 'Tractus':
        return [('tr', t) for _, t in between_the_readings(lines)] or [('tr', words(lines))]
    return []


def main():
    chants, sources, pages = gb.load()
    rank = {b: i for i, b in enumerate(BOOKS)}
    by_genre = collections.defaultdict(list)
    for c in chants.values():
        if c['office-part'] in ('in', 'gr', 'al', 'tr', 'of', 'co', 'se') and c['gabc']:
            text = gb.fold(gb.chant_text(c))
            if c['office-part'] == 'al':
                # "Alleluia. V. Ostende nobis": the verse is what names it.
                text = re.sub(r'^(alleluia)+', '', text)
            book = min((rank.get(s, 99) for s, _ in pages.get(c['id'], [])), default=99)
            by_genre[c['office-part']].append((text, book, c['id']))

    texts = collections.defaultdict(set)  # (genre, folded text) -> {where printed}
    display = {}
    for folder in ('Tempora', 'Sancti', 'Commune'):
        for f in sorted((DO / folder).glob('*.txt')):
            for name, lines in sections(f).items():
                for genre, text in pieces(re.split(r'[ (]', name)[0], lines):
                    key = gb.fold(text)
                    if genre == 'al':
                        key = re.sub(r'(alleluia)+$', '', key)
                    if len(key) < 12:
                        continue
                    texts[(genre, key)].add(f'{folder}/{f.stem}#{name}')
                    display[(genre, key)] = text

    links, stats = {}, collections.defaultdict(lambda: [0, 0, 0])
    for (genre, key), places in sorted(texts.items()):
        best = (0.0, 99, None)
        # A tract's text is often set as a gradual or the reverse in another season.
        for g in {genre, *({'gr', 'tr'} if genre in ('gr', 'tr') else ())}:
            for text, book, cid in by_genre[g]:
                if text[:6] != key[:6] and text[1:7] != key[1:7]:
                    continue
                n = min(len(key), len(text))
                score = difflib.SequenceMatcher(None, key[:n], text[:n], autojunk=False).ratio() * (n / len(key))
                if (score, -book) > (best[0], -best[1]):
                    best = (score, book, cid)
        s = stats[genre]
        s[0] += 1
        if best[0] >= 0.8:
            s[1] += 1
            for place in places:
                links.setdefault(place, []).append({'chant': best[2], 'score': round(best[0], 3), 'genre': genre})
        elif best[0] >= 0.55:
            s[2] += 1

    total = [sum(s[i] for s in stats.values()) for i in range(3)]
    print(f'{"genre":<12}{"texts":>7}{"linked":>8}{"doubtful":>10}')
    for genre, (n, ok, maybe) in sorted(stats.items()):
        print(f'{gb.PARTS[genre]:<12}{n:>7}{ok:>8}{maybe:>10}   {ok / n:.0%}')
    print(f'{"all":<12}{total[0]:>7}{total[1]:>8}{total[2]:>10}   {total[1] / total[0]:.0%}')
    flat = [l for ls in links.values() for l in ls]
    used = collections.Counter(min((rank.get(s, 99) for s, _ in pages.get(l["chant"], [])), default=99) for l in flat)
    print('sections linked:', len(links), 'distinct chants:', len({l['chant'] for l in flat}))
    print('by book:', {(sources[BOOKS[k]]['title'] + ' ' + str(sources[BOOKS[k]]['year'])) if k < 99 else 'other': v for k, v in sorted(used.items())})
    missing = [(g, display[(g, k)][:70], sorted(p)[0]) for (g, k), p in sorted(texts.items()) if not any(pl in links for pl in p)]
    print('unlinked sample:')
    for row in missing[:: max(1, len(missing) // 12)][:12]:
        print('  ', row)
    if '--write' in sys.argv:
        out = pathlib.Path(__file__).with_name('mass-links.json')
        out.write_text(json.dumps(links, ensure_ascii=False, indent=0, sort_keys=True) + '\n', encoding='utf-8')
        print('wrote', out.name)


if __name__ == '__main__':
    main()
