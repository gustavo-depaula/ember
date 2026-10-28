"""Experiment: what does it cost to ship the linked chant, and in what shape?

Three shapes for the same scores:
  items    one catalog item per chant, as the Kyriale is today
  bundles  an index blob plus bundles of ~`BUNDLE` chants, as the Brazilian
           Liturgy of the Hours ships its parts
  by-text  bundles, indexed not by a chant id but by the opening of the text
           each chant sets — the key the app already has in hand when it is
           showing a proper

    python3 research/gregobase/pack.py
"""
import collections, gzip, json, pathlib
import gb

HERE = pathlib.Path(__file__).parent
BUNDLE = 64
CATALOG = gb.ROOT / '_site/hearth/v2/catalog.json'


def gz(data):
    return len(gzip.compress(data, 9))


def main():
    chants, sources, pages = gb.load()
    mass = json.loads((HERE / 'mass-links.json').read_text())
    office = json.loads((HERE / 'office-links.json').read_text())
    sets = {
        'Mass propers (1962)': {l['chant'] for ls in mass.values() for l in ls},
        'Office (1960 Breviary)': {l['chant'] for ls in office.values() for l in ls},
    }
    sets['both'] = sets['Mass propers (1962)'] | sets['Office (1960 Breviary)']
    sets['all of GregoBase'] = set(chants)
    catalog = CATALOG.stat().st_size if CATALOG.exists() else 0
    print(f'catalog today: {catalog:,} bytes ({gz(CATALOG.read_bytes()):,} gzipped), read at every launch\n')
    print(f'{"set":<24}{"chants":>7}{"gabc":>10}{"gzip":>9} |{"items: catalog +":>18} |{"bundles: catalog +":>19}{"index blob":>12}{"bundles":>9}{"largest":>9}')
    for name, ids in sets.items():
        scores = {i: gb.importer.score(chants[i]) for i in sorted(ids, key=int) if chants[i]['gabc']}
        raw = sum(len(s.encode()) for s in scores.values())
        zipped = sum(gz(s.encode()) for s in scores.values())
        # items: what build-corpus writes per chant today
        entry = lambda i: json.dumps({f'chant/gb-{i}': {'kind': 'chant', 'hash': 'f' * 64, 'size': 1234, 'name': {'la': chants[i]['incipit']}, 'mode': chants[i]['mode'] or ''}}, ensure_ascii=False)
        per_item = sum(len(entry(i).encode()) - 2 for i in scores)
        # bundles: grouped by genre so one Mass or one hour opens few of them
        by_genre = collections.defaultdict(list)
        for i in scores:
            by_genre[chants[i]['office-part'] or 'va'].append(i)
        bundles, index = [], {}
        for genre, members in sorted(by_genre.items()):
            for at in range(0, len(members), BUNDLE):
                group = members[at : at + BUNDLE]
                bundles.append(json.dumps({i: scores[i] for i in group}, ensure_ascii=False).encode())
                for i in group:
                    index[i] = [len(bundles) - 1, chants[i]['incipit'], chants[i]['mode'] or '']
        index_blob = json.dumps(index, ensure_ascii=False, separators=(',', ':')).encode()
        bundle_entries = len(bundles) * 110
        print(
            f'{name:<24}{len(scores):>7}{raw / 1e6:>9.2f}M{zipped / 1e6:>8.2f}M |{per_item / 1e3:>16.0f}K |'
            f'{bundle_entries / 1e3:>17.1f}K{len(index_blob) / 1e3:>11.0f}K{len(bundles):>9}{max(map(len, bundles)) / 1e3:>8.0f}K'
        )
    # by-text: the Mass links re-keyed by the folded opening of the Missal's own text
    print(f'\nby-place index for the Mass: {len(mass)} sections → {len({l["chant"] for ls in mass.values() for l in ls})} chants; '
          f'as place→chant JSON {len(json.dumps(mass, separators=(",", ":"))) / 1e3:.0f}K '
          f'({gz(json.dumps(mass, separators=(",", ":")).encode()) / 1e3:.0f}K gzipped)')


if __name__ == '__main__':
    main()
