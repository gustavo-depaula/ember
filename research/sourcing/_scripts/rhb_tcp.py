"""EEBO-TCP TEI XML -> en-US corpus book (old spelling kept; <gap/> becomes [...]).
usage: rhb_tcp.py CONFIG.json
CONFIG: id, dir, slug, work, name, name_pt, author, author_pt, died, desc, desc_pt, composed, editor, year, edition, url, srcnote,
 src (path under research/sourcing/more-and-fisher/tcp), front (bool: include <front> divs), pick: optional list of top-level div indexes,
 titles: {"1": "override"} by chapter order, label: "Chapter" prefix for untitled, flat (bool: ignore part nesting)"""
import sys, os, re, json
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
NS = '{http://www.tei-c.org/ns/1.0}'
ROOT = '/Users/gustavo/Documents/prayer'
def tag(e): return e.tag.replace(NS, '')
def clean(t):
    t = re.sub(r'\s+', ' ', t).strip()
    t = t.replace('¶', '').strip()
    return re.sub(r'\s+([,.;:!?])', r'\1', t)
class Ctx:
    def __init__(s): s.notes = []; s.gaps = 0
def inline(e, cx):
    out = e.text or ''
    for c in e:
        t = tag(c)
        if t == 'gap': out += '[…]'; cx.gaps += 1
        elif t == 'g':
            ref = c.get('ref') or ''
            out += '' if 'EOLhyphen' in ref else (c.text or '')
        elif t == 'note':
            cx.notes.append(clean(inline(c, cx))); out += '[^%d]' % len(cx.notes)
        elif t == 'pb' or t == 'milestone': pass
        elif t == 'lb': out += ' '
        else: out += inline(c, cx)
        out += c.tail or ''
    return out
def blocks(e, cx, out):
    for c in e:
        t = tag(c)
        if t == 'head' or t == 'div' or t == 'pb': continue
        if t in ('p', 'item', 'trailer', 'closer', 'opener', 'salute', 'dateline', 'signed', 'epigraph', 'argument', 'label'):
            s = clean(inline(c, cx))
            if s: out.append(s)
            for d in c:  # nested blocks (lists, q) already inline
                pass
        elif t == 'lg':
            ls = [clean(inline(l, cx)) for l in c if tag(l) == 'l']
            if ls: out.append('  \n'.join(ls))
        elif t == 'l':
            s = clean(inline(c, cx))
            if s: out.append(s)
        elif t == 'sp':
            sp = c.find(NS + 'speaker'); who = clean(inline(sp, cx)).rstrip('.:') if sp is not None else ''
            first = True
            for k in c:
                if tag(k) == 'speaker': continue
                if tag(k) == 'p':
                    s = clean(inline(k, cx))
                    if s: out.append(('**%s.** ' % who if first and who else '') + s); first = False
                else: blocks(ET.Element('x', {}) if False else k, cx, out) if tag(k) in ('lg', 'list') else None
        elif t in ('list', 'floatingText', 'q', 'cit', 'ab', 'table', 'quote'):
            blocks(c, cx, out)
def title_of(d, fallback):
    h = d.find(NS + 'head')
    if h is None: return fallback
    t = clean(''.join(h.itertext()))
    t = re.sub(r'\s*\[…\]\s*', ' ', t).strip(' .:;,')
    return (t[:110] if t else fallback)
def build(cfg):
    r = ET.parse(os.path.join(ROOT, 'research/sourcing/more-and-fisher/tcp', cfg['src'])).getroot()
    text = r.find(NS + 'text'); lang = 'en-US'
    root = os.path.join(ROOT, 'content/books', cfg['dir'])
    os.makedirs(root + '/' + lang, exist_ok=True); os.makedirs(root + '/sources/%s-originals' % lang, exist_ok=True)
    tops = []
    if cfg.get('front'):
        fr = text.find(NS + 'front')
        if fr is not None: tops += [d for d in fr if tag(d) == 'div']
    body = text.find(NS + 'body'); tops += [d for d in body if tag(d) == 'div']
    if cfg.get('pick'): tops = [tops[i] for i in cfg['pick']]
    if not tops: tops = [body]
    toc, words, nchap, gaps = [], 0, 0, 0
    def emit(d, fallback, extra_paras=()):
        nonlocal words, nchap, gaps
        nchap += 1
        cx = Ctx(); ps = []; blocks(d, cx, ps)
        kids = [k for k in d if tag(k) == 'div']
        title = cfg.get('titles', {}).get(str(nchap)) or title_of(d, fallback)
        # nested divs flattened into this chapter as ## sections
        def rec(dd, lvl):
            for k in dd:
                if tag(k) == 'div':
                    ps.append('#' * lvl + ' ' + title_of(k, ''))
                    blocks(k, cx, ps); rec(k, lvl + 1)
        if cfg.get('inline_kids', True): rec(d, 2)
        cid = 'chapter-%02d' % nchap
        md = '# %s\n\n%s\n' % (title, '\n\n'.join(p for p in ps if p.strip('# ')))
        if cx.notes: md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, n) for i, n in enumerate(cx.notes)) + '\n'
        open('%s/%s/%s.md' % (root, lang, cid), 'w').write(md); words += len(md.split()); gaps += cx.gaps
        return {'id': cid, 'title': {lang: title}}
    for i, d in enumerate(tops):
        kids = [k for k in d if tag(k) == 'div']
        if cfg.get('parts') and kids:
            ptitle = title_of(d, 'Part %d' % (i + 1))
            cx = Ctx(); intro = []; blocks(d, cx, intro)
            node = {'id': 'part-%d' % (i + 1), 'title': {lang: ptitle}, 'children': []}
            if sum(len(p.split()) for p in intro) > 80:
                node['children'].append(emit_intro(d, ptitle, cfg, root, lang) if False else None)
                node['children'] = []
                # introduction as its own chapter
                nchap += 1; cid = 'chapter-%02d' % nchap
                cx2 = Ctx(); ps2 = []; blocks(d, cx2, ps2)
                md = '# %s\n\n%s\n' % (ptitle, '\n\n'.join(ps2))
                open('%s/%s/%s.md' % (root, lang, cid), 'w').write(md); words += len(md.split())
                node['children'].append({'id': cid, 'title': {lang: ptitle}})
            for k in kids:
                node['children'].append(emit(k, 'Chapter %d' % (nchap + 1)))
            toc.append(node)
        else:
            toc.append(emit(d, cfg.get('label', 'Chapter') + ' %d' % (nchap + 1)))
    open(root + '/sources/%s-originals/%s.xml' % (lang, cfg['slug']), 'w').write(open(os.path.join(ROOT, 'research/sourcing/more-and-fisher/tcp', cfg['src'])).read())
    book = {'id': cfg['id'], 'cover': 'classic', 'name': {'en-US': cfg['name'], 'pt-BR': cfg['name_pt']},
            'author': {'en-US': cfg['author'], 'pt-BR': cfg['author_pt']}, 'description': {'en-US': cfg['desc'], 'pt-BR': cfg['desc_pt']},
            'composed': cfg['composed'], 'languages': [lang], 'work': cfg['work'],
            'editions': {lang: {'editor': cfg['editor'], 'year': cfg['year']}},
            'sources': [{'language': lang, 'url': cfg['url'], 'edition': cfg['edition'],
                         'description': cfg.get('srcnote', '') + ' EEBO-TCP hand-keyed transcription, original spelling kept. %d illegible places in the source are marked […]. Raw TEI in sources/%s-originals/.' % (gaps, lang),
                         'tier': 'A', 'tierEvidence': '%s died in %d; the edition is of %d and the TCP transcription is released to the public domain (CC0).' % (cfg['author'], cfg['died'], cfg['year'])}],
            'toc': toc}
    json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
    print(root, nchap, 'chapters', words, 'words', gaps, 'gaps')
if __name__ == '__main__':
    build(json.load(open(sys.argv[1])))
