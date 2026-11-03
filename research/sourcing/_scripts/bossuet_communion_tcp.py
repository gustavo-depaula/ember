"""Bossuet, A Treatise of Communion under Both Species (1685), EEBO-TCP A28850 -> en-US chapters
of bossuet-opera-omnia/controverse/traite-de-la-communion-sous-les-deux-especes.
The English parts match the French book's two chapters; the division into two parts (TEI 'preface')
opens Part I as it does in Lachat. The publisher's address is an en-US-only front chapter.
Long s normalised; marginal notes become footnotes; <gap/> becomes […].
usage: python3.13 bossuet_communion_tcp.py"""
import os, re, sys, shutil
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
import rhb_tcp as T
NS, tag = T.NS, T.tag
ROOT = '/Users/gustavo/Documents/prayer'
SRC = ROOT + '/research/sourcing/_skipped/samples/A28850.xml'
BOOK = ROOT + '/content/books/bossuet-opera-omnia/controverse/traite-de-la-communion-sous-les-deux-especes'


def fix(t):
    t = t.replace('ſ', 's').replace('Ʋ', 'V')
    t = re.sub(r'([aeiou])̄', r'\1m', t)  # thēselves = themselves (one case)
    # drop-cap word printed in capitals after the decorated initial: "MANY doubtesse" -> "Many doubtesse"
    t = re.sub(r'^([A-Z])([A-Z]{2,})\b', lambda m: m.group(1) + m.group(2).lower(), t)
    t = re.sub(r'\s+(\[\^\d+\])', r'\1', t)
    t = t.replace('The FIRST PART.', 'The First Part.')
    return t


def head(d):
    h = d.find(NS + 'head')
    return fix(T.clean(''.join(h.itertext()))) if h is not None else ''


def subheads(d):
    return [fix(T.clean(''.join(h.itertext()))) for h in d.findall(NS + 'head') if h.get('type') == 'sub']


def render(div, cx, ps, lvl):
    T.blocks(div, cx, ps)
    for k in div:
        if tag(k) != 'div':
            continue
        h = head(k)
        subs = subheads(k)
        if subs:
            h = h.rstrip('.') + '. ' + ' '.join(subs)
        ps.append('#' * lvl + ' ' + h)
        render(k, cx, ps, lvl + 1)


def write(cid, title, divs):
    cx = T.Ctx()
    ps = []
    for d, lvl, kid_lvl in divs:
        if lvl:
            ps.append('#' * lvl + ' ' + head(d))
        render(d, cx, ps, kid_lvl)
    ps = [fix(p) for p in ps if p.strip('# ')]
    md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps))
    if cx.notes:
        md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, fix(n)) for i, n in enumerate(cx.notes)) + '\n'
    open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md)
    print(cid, len(md.split()), 'words', len(cx.notes), 'notes', cx.gaps, 'gaps')


def main():
    text = ET.parse(SRC).getroot().find(NS + 'text')
    front = {d.get('type'): d for d in text.find(NS + 'front') if tag(d) == 'div'}
    tract = text.find(NS + 'body').find(NS + 'div')
    kids = {d.get('type') + (d.get('n') or ''): d for d in tract if tag(d) == 'div'}
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    os.makedirs(BOOK + '/sources/english-originals', exist_ok=True)
    shutil.copy(SRC, BOOK + '/sources/english-originals/A28850.xml')
    write('publisher-to-the-reader', 'The Publisher to the Reader', [(front['publisher_to_the_reader'], 0, 2)])
    write('premiere-partie', 'The First Part: The Practise and Judgement of the Church from the First Ages',
          [(kids['preface'], 2, 3), (kids['part1'], 2, 3)])
    write('seconde-partie', 'The Second Part: Principles upon which are Established the Judgement and Practise of the Church',
          [(kids['part2'], 0, 2)])


if __name__ == '__main__':
    main()
