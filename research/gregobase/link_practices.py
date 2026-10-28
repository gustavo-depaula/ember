"""Experiment: which prayers already in the corpus have their chant in GregoBase?

Every practice that carries a Latin text is looked up by that text — the whole
of it, so the Hail Mary does not find the offertory that only begins with its
words. Where several books set the same text (the Salve Regina has a solemn
tone, a simple tone, a monastic one), all are listed and the first is the one
a parish book would print.

    python3 research/gregobase/link_practices.py [--write]
"""
import json, pathlib, sys
import gb

# Liber Usualis, Graduale Romanum 1961, Liber antiphonarius, Cantus selecti,
# Chants of the Church, Liber cantualis, Liber Hymnarius, Antiphonale Monasticum.
BOOKS = ['3', '2', '48', '10', '5', '66', '15', '7']


def latin_blocks(node, out):
    if isinstance(node, dict):
        la = node.get('la')
        if isinstance(la, str) and len(la) > 30:
            out.append(la)
        for v in node.values():
            latin_blocks(v, out)
    elif isinstance(node, list):
        for v in node:
            latin_blocks(v, out)


def main():
    chants, sources, pages = gb.load()
    genres = set(gb.PARTS) - {'ky', 'or'}
    finder = gb.Finder(chants, pages, genres, BOOKS)
    rows = []
    for d in sorted((gb.ROOT / 'content/practices').iterdir()):
        manifest = json.loads((d / 'manifest.json').read_text(encoding='utf-8'))
        flow = manifest.get('flow')
        if (d / 'flow.json').exists():
            flow = json.loads((d / 'flow.json').read_text(encoding='utf-8'))
        blocks = []
        latin_blocks(flow, blocks)
        if not blocks:
            continue
        # One Latin text, or a few: a prayer or a hymn. A whole office is linked by link_office.py.
        if len(blocks) > 3:
            continue
        key = gb.fold(blocks[0])
        found = finder.all(genres, key)
        if found:
            rows.append((d.name, manifest.get('name', {}).get('la') or d.name, found))

    links = {}
    for pid, name, found in rows:
        def label(cid):
            where = sorted(pages.get(cid, []), key=lambda sp: finder.rank.get(sp[0], 99))
            book = f"{sources[where[0][0]]['title']} {sources[where[0][0]]['year']}, p. {where[0][1]}" if where else '—'
            c = chants[cid]
            return f"{c['incipit']} [{gb.PARTS.get(c['office-part'], '?')}, mode {c['mode'] or '–'}; {book}]"
        links[f'practice/{pid}'] = [{'chant': cid, 'score': s, 'as': label(cid)} for s, _, cid in found[:6]]
        print(f'{pid:<34}{len(found):>3} setting{"s" if len(found) > 1 else " "}  {found[0][0]:.2f}  {label(found[0][2])}')
    print(f'\n{len(rows)} practices have their chant')
    if '--write' in sys.argv:
        out = pathlib.Path(__file__).with_name('practice-links.json')
        out.write_text(json.dumps(links, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print('wrote', out.name)


if __name__ == '__main__':
    main()
