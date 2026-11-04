"""Build an English-only book (same work as a Latin book) from (cid, title, lines) segments."""
import os, re, shutil, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from en_ocr import *

B = '/Users/gustavo/Documents/prayer/content/books/'

def split_by(lines, pat, start=0, end=None, first_title=None):
    """segments at lines matching compiled pat (group(0) is the heading line). Returns [(headline, lines)]."""
    end = end or len(lines)
    out = []
    cur = None
    for i in range(start, end):
        m = pat.match(lines[i])
        if m:
            cur = [m, []]
            out.append(cur)
        elif cur is not None:
            cur[1].append(lines[i])
    return [(m, ls) for m, ls in out]

def take_title(lines, maxlines=6):
    """first block of non-blank lines -> title; returns (title, rest)."""
    n = 0
    while n < len(lines) and not lines[n].strip():
        n += 1
    t = []
    while n < len(lines) and lines[n].strip() and len(t) < maxlines:
        t.append(lines[n].strip()); n += 1
    return re.sub(r'\s+', ' ', ' '.join(t)), lines[n:]

def make_book(root, bid, work, name, author_from, desc, composed, edition, source, segs, drops=(), para_start=None,
              pagemode=False, keep_notes=True, strip_num=True, note_start=None, pt_name=None, pt_desc=None, parts=None, post=None):
    """segs: [(cid, title, lines)]. parts: optional [(part_id, title, [cids])] to group the toc."""
    shutil.rmtree(root, ignore_errors=True)
    toc = {}
    for cid, title, lines in segs:
        body = chapter_md(lines, drops, para_start=para_start, key=cid, pagemode=pagemode, keep_notes=keep_notes, strip_num=strip_num, note_start=note_start)
        if post: body = post(cid, body)
        write_ch(root, 'en-US', cid, title, body)
        toc[cid] = title
    a = load_json(author_from)['author']
    items = [{'id': c, 'title': {'en-US': t}} for c, t in toc.items()]
    if parts:
        allc = {c for _, _, cs in parts for c in cs}
        lead = [i for i in items if i['id'] not in allc]
        items = lead + [{'id': pid, 'title': {'en-US': pt}, 'children': [i for i in items if i['id'] in cids]} for pid, pt, cids in parts]
    bj = {'id': bid, 'cover': 'classic', 'name': {'en-US': name, 'pt-BR': pt_name or name}, 'author': a,
          'description': {'en-US': desc, 'pt-BR': pt_desc or ''}, 'composed': composed, 'languages': ['en-US'],
          'work': work, 'editions': {'en-US': edition}, 'sources': [source], 'toc': items}
    dump_json(os.path.join(root, 'book.json'), bj)
    print(bid, words(root, 'en-US'), 'words', len(toc), 'chapters')
    print({k: v for k, v in STATS.items() if v != 'ok'} and 'notes: ' + str(sum(1 for v in STATS.values() if v == 'ok')) + ' chapters kept notes, ' + str(sum(1 for v in STATS.values() if v.startswith('drop'))) + ' dropped')

def src(path):
    return open(path, errors='ignore').read().split('\n')

TIER = ("A", None)
def source(url, edition, description, year):
    return {'language': 'en-US', 'url': url, 'edition': edition, 'description': description, 'tier': 'A',
            'tierEvidence': f'Published in {year}, before 1931: public domain in the US.'}
