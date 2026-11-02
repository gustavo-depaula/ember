"""Wikisource parse-API HTML -> paragraph list. fmc_ws_book.py FILE.html  (prints paragraphs); import parse_paras()."""
import re, sys, html
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.nref = 0; s.notes = []; s.inref = 0; s.inli = None; s.paras = []; s.cur = None; s.in_out = 0; s.skip = 0; s.depth = 0; s.stack = []
    def handle_starttag(s, tag, a):
        a = dict(a); cls = a.get('class', '') or ''
        if tag in ('br', 'hr', 'img', 'link', 'meta', 'input', 'wbr'):
            if tag == 'br' and s.in_out and not s.skip and s.cur is not None: s.cur += ' '
            return
        if tag == 'sup' and 'reference' in cls and s.in_out and not s.skip and s.cur is not None:
            s.nref += 1; s.cur += '[^%d]' % s.nref; s.skip += 1; s.stack.append('sup'); return
        if tag == 'li' and s.in_out and not s.skip and s.cur is None:
            s.inli = ''; s.stack.append(None); return
        if tag in ('style', 'script', 'figure', 'table') or 'ws-noexport' in cls or 'mw-editsection' in cls or ('reference' in cls and tag == 'sup'): s.skip += 1; s.stack.append(tag); return
        if tag == 'div' and 'prp-pages-output' in cls: s.in_out = 1
        s.stack.append(None)
        if not s.in_out or s.skip: return
        if tag in ('p', 'h1', 'h2', 'h3', 'h4', 'dd', 'li') : s.cur = ('#' * int(tag[1]) + ' ' if tag[0] == 'h' and len(tag) == 2 else ''); 
        elif tag in ('i', 'em') and s.cur is not None: s.cur += '*'
        elif tag == 'br' and s.cur is not None: s.cur += ' '
    def handle_endtag(s, tag):
        popped = s.stack.pop() if s.stack else None
        if popped:
            s.skip -= 1; return
        if tag == 'li' and s.inli is not None:
            t = re.sub(r'\s+', ' ', s.inli.replace('↑', '')).replace('* *', ' ').replace('**', '').strip()
            if t: s.notes.append(t)
            s.inli = None; return
        if not s.in_out or s.skip: return
        if tag in ('p', 'h1', 'h2', 'h3', 'h4', 'dd', 'li') and s.cur is not None:
            t = re.sub(r'\s+', ' ', s.cur).replace('* *', ' ').replace('**', '').strip()
            if t: s.paras.append(t)
            s.cur = None
        elif tag in ('i', 'em') and s.cur is not None: s.cur += '*'
    def handle_data(s, d):
        if s.inli is not None and s.in_out and not s.skip: s.inli += d; return
        if s.in_out and not s.skip and s.cur is not None: s.cur += d
def parse_paras(htmltext, notes=False):
    htmltext = re.sub(r'<style.*?</style>', '', htmltext, flags=re.S)
    p = P(); p.feed(htmltext)
    return (p.paras, p.notes) if notes else p.paras
if __name__ == '__main__':
    for x in parse_paras(open(sys.argv[1]).read()): print(x[:150], '\n')
