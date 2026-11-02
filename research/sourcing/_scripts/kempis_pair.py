"""Build a Kempis book from Pohl's Latin OCR (+ optional English translation OCR), chapter by chapter.
spec keys: id, slug, work, name{la,en-US,pt-BR}, description{...}, composed, editions, sources, groups[titles la/en],
la{file,start,end,marker,groups}, en{file,start,end,marker,groups}|None, preface (bool)"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from kempis_common import clean, clean_en, mend, decap, segments, fix
import bookjson

ROOT = 'content/books/kempis-opera-omnia/'
AU = {'la': 'Thomas a Kempis', 'en-US': 'Thomas à Kempis', 'pt-BR': 'Tomás de Kempis'}


def title_of(p):
    t = re.sub(r'^[€¢\s]+', '', p).strip().rstrip('.:')
    t = re.sub(r'\s+', ' ', t)
    return t[:160]


def chapters(cfg, lang):
    L = open(cfg['file'], errors='replace').read().split('\n')
    pre, segs = segments(L, cfg['marker'], cfg['start'], cfg['end'], cfg.get('groups', ()))
    cl = clean if lang == 'la' else clean_en
    res = []
    for gi, ls in segs:
        raw = cl(ls)
        if not raw:
            res.append((gi, '', []))
            continue
        first, rest = raw[0], raw[1:]
        while lang == 'la' and not first.rstrip().endswith('.') and rest and len(first) < 150:
            first, rest = first + ' ' + rest[0], rest[1:]
        if lang != 'la':
            m = re.search(r'\s([A-Z]{3,}[,.;]?(?:\s|$))', first)
            if m and m.start() > 8:
                first, rest = first[:m.start()], [first[m.start():].strip()] + rest
        title = title_of(fix(first) if lang == 'la' else first)
        ps = mend(rest)
        if lang == 'la':
            ps = [fix(p) for p in ps]
        else:
            ps = [decap(p) for p in ps[:1]] + ps[1:]
        res.append((gi, title, ps))
    prep = mend(cl(pre))
    if lang == 'la':
        prep = [fix(p) for p in prep]
    return prep, res


def md(title, body):
    return '# ' + title + '\n\n' + '\n\n'.join(body) + '\n'


def build(spec, pt_names=None):
    d = ROOT + spec['slug']
    langs = ['la'] + (['en-US'] if spec.get('en') else [])
    data = {'la': chapters(spec['la'], 'la')}
    if spec.get('en'):
        data['en-US'] = chapters(spec['en'], 'en')
        assert len(data['la'][1]) == len(data['en-US'][1]), (len(data['la'][1]), len(data['en-US'][1]))
    toc, counts = [], {}
    wc = {l: 0 for l in langs}
    nodes = {}
    prefix = {'la': 'Caput', 'en-US': 'Chapter'}
    for lang in langs:
        os.makedirs(f'{d}/{lang}', exist_ok=True)
        pre, res = data[lang]
        if spec.get('preface'):
            t = spec['preface'][lang]
            s = md(t, pre)
            open(f'{d}/{lang}/praefatio.md', 'w').write(s)
            wc[lang] += len(s.split())
        cnt = {}
        for k, (gi, title, body) in enumerate(res):
            cnt[gi] = cnt.get(gi, 0) + 1
            n = cnt[gi]
            cid = f'p{gi + 1}-{n:02d}'
            t = f'{n}. {title}' if title else f'{prefix[lang]} {n}'
            s = md(t, body)
            open(f'{d}/{lang}/{cid}.md', 'w').write(s)
            wc[lang] += len(s.split())
            nodes.setdefault(cid, {'id': cid, 'g': gi, 'title': {}})['title'][lang] = t
    if spec.get('preface'):
        toc.append({'id': 'praefatio', 'title': dict(spec['preface'])})
    gs = {}
    for cid, nd in nodes.items():
        gs.setdefault(nd['g'], []).append({'id': cid, 'title': nd['title']})
    if len(spec['groups']) > 1:
        for g, ch in sorted(gs.items()):
            toc.append({'id': f'part-{g + 1}', 'title': spec['groups'][g], 'children': ch})
    else:
        toc += gs[0]
    book = {'id': spec['id'], 'cover': 'classic', 'name': spec['name'], 'author': AU, 'description': spec['description'],
            'composed': spec['composed'], 'languages': langs, 'work': 'thomas-a-kempis/' + spec['work'],
            'editions': spec['editions'], 'sources': spec['sources'], 'toc': toc}
    bookjson.write(d, book)
    for lang, f in (('la', spec['la']['file']), ('en-US', spec.get('en', {}).get('file') if spec.get('en') else None)):
        if f:
            os.makedirs(f'{d}/sources/{lang}-originals', exist_ok=True)
            os.system(f"cp '{f}' '{d}/sources/{lang}-originals/'")
    print(spec['id'], wc, len(nodes))
