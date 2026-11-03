"""Speculum perfectionis (1318 redaction, Sabatier's 124 chapters in 13 sections) -> francis-of-assisi-opera-omnia/speculum-perfectionis.
la: the franciscanos.net transcription (mirrored in research/sourcing/francis-of-assisi/mirror-franciscanos-net/), verse numbers kept
    as inert bold; a chapter starts at a heading paragraph ("... Caput N.") and the section headings ("CAPITULUM II (III) - ...") give
    the Latin section titles.
en-US: Robert Steele's translation in the Everyman volume (1910, archive.org thelittleflowers00francuoft), read by everyman_francis.py.
usage: python3.13 speculum_perfectionis_build.py"""
import json, os, re, sys
from bs4 import BeautifulSoup
sys.path.insert(0, os.path.dirname(__file__))
import everyman_francis as E  # noqa: E402
from en_common import join_lines  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
LA = ROOT + '/research/sourcing/francis-of-assisi/mirror-franciscanos-net/www.franciscanos.net/fuentes/SpecPerf.htm'
BOOK = ROOT + '/content/books/francis-of-assisi-opera-omnia/speculum-perfectionis'
HEADING = re.compile(r"[Cc]aput\s*[0-9l]*\s*\.?\s*$")


def latin():
    s = BeautifulSoup(open(LA, encoding='latin-1').read(), 'lxml')
    ps = [re.sub(r'\s+', ' ', p.get_text(' ')).strip() for p in s.find_all('p')]
    ps = [p for p in ps if p][2:]
    chapters, sections = [], {}
    cur = None
    pending_section = None
    for i, p in enumerate(ps):
        if p.startswith('CAPITULUM') and '(' in p:
            pending_section = re.sub(r"^CAPITULUM\s*[IVXL]+\s*\(([IVXL]+)\)\s*-\s*", r"\1|", p)
            continue
        numbered = re.match(r"^(\d+)\s?(?=\D)", p)
        is_head = (not numbered) and (HEADING.search(p) or p.startswith('[CAPITULUM') or
                                      (i + 1 < len(ps) and not re.match(r"^\d", ps[i + 1]) and p.startswith(('Qualiter', 'Quod', 'De ')) and len(p) < 300
                                       and cur is not None and len(cur['paras']) > 2 and 'Caput' not in p and ps[i + 1][:1].isupper() and len(ps[i + 1]) > 300))
        if is_head:
            title = HEADING.sub('', p).strip().rstrip('.').strip('[] ')
            cur = {'title': title, 'paras': []}
            if pending_section:
                sec, stitle = pending_section.split('|', 1)
                cur['section'] = (E.roman_value(sec), stitle.strip().rstrip('.').capitalize())
                pending_section = None
            chapters.append(cur)
            continue
        if cur is None:
            continue
        if numbered:
            p = '**%s.** %s' % (numbered.group(1), p[numbered.end():].lstrip())
        cur['paras'].append(p)
    return chapters


def english():
    bl = E.blocks(205, 325)
    merged = []
    for k, t in bl:
        if k == 'para' and merged and merged[-1][0] == 'para' and t[:1].islower():
            merged[-1] = ('para', join_lines([merged[-1][1], t]))
        else:
            merged.append((k, t))
    sections, chapters = [], []
    for k, t in merged:
        if k == 'head':
            m = re.match(r"^SECTION\s+([IVXL]+)\s*(.*)$", t)
            c = re.match(r"^CHAPTER\s+([IVXLC]+)\s*(.*)$", t)
            if m:
                sections.append((E.roman_value(m.group(1)), E.tcase(m.group(2)) if m.group(2) else ''))
            elif c:
                chapters.append({'n': E.roman_value(c.group(1)), 'title': E.tcase(c.group(2)), 'paras': [], 'section': sections[-1] if sections else None})
            elif chapters:
                chapters[-1]['paras'].append('*%s*' % E.tcase(t))
            continue
        if chapters:
            chapters[-1]['paras'].append(t)
        elif sections:
            sections[-1] = sections[-1] + (t,)  # the compiler's note before chapter I
    return chapters, sections


def tidy(t):
    t = re.sub(r"\s+", ' ', t).strip()
    t = re.sub(r'(^|\s)" (?=\w)', r'\1"', t)
    t = re.sub(r"\s+([,;:!?])(?=\s|$)", r"\1", t)
    t = re.sub(r"(?<=\w) \"(?=[\s,.;:!?]|$)", '"', t)
    t = re.sub(r"^([A-Z])([A-Z]{2,})\b", lambda m: m.group(1) + m.group(2).lower(), t)  # small capitals of an opening word
    for a, b in (('J esus', 'Jesus'), ("the}'-", 'they'), ('swiftty', 'swiftly'), ('stiH', 'still'), ('PVancis', 'Francis'), ('Eow ', 'How '),
                 ('aiive', 'alive'), ('Portiunculaj', 'Portiuncula'), ('infirmitiesg', 'infirmities'), ('RietL', 'Rieti')):
        t = t.replace(a, b)
    return re.sub(r"\bAssist\b(?! (?:him|them|us|me|you))", 'Assisi', t)


def main():
    la = latin()
    en, secs = english()
    print('la', len(la), 'en', len(en), 'sections', len(secs))
    # chapters are numbered by order: the OCR misreads a few numerals (XLVII as XLV)
    assert len(en) == 124 and sum(c['n'] == i + 1 for i, c in enumerate(en)) >= 120, [c['n'] for c in en]
    assert len(la) == 124, len(la)
    for d in ('la', 'en-US'):
        os.makedirs(BOOK + '/' + d, exist_ok=True)
    toc, cur_sec = [], None
    words = {'la': 0, 'en-US': 0}
    la_sec = {}
    for i, c in enumerate(la):
        if 'section' in c:
            la_sec[i + 1] = c['section'][1]
    for i in range(124):
        n = i + 1
        cid = 'cap-%03d' % n
        lt = la[i]['title'] if n > 1 else 'Incipit Speculum perfectionis status fratris Minoris'
        et = tidy(en[i]['title']).rstrip(';,')
        md_la = '# Caput %d. %s\n\n%s\n' % (n, lt, '\n\n'.join(la[i]['paras']))
        eparas = [tidy(p) for p in en[i]['paras']]
        if n == 1 and len(secs[0]) > 2:
            eparas = ['*%s*' % tidy(secs[0][2])] + eparas
        md_en = '# Chapter %s. %s\n\n%s\n' % (E._roman(n), et, '\n\n'.join(eparas))
        open('%s/la/%s.md' % (BOOK, cid), 'w').write(md_la)
        open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md_en)
        words['la'] += len(md_la.split()); words['en-US'] += len(md_en.split())
        sec = en[i]['section']
        if sec != cur_sec:
            cur_sec = sec
            snum, stitle = sec[0], sec[1]
            title = {'en-US': 'Section %s%s' % (E._roman(snum), '. ' + stitle if stitle else '')}
            if n in la_sec:
                title['la'] = 'Capitulum %s. %s' % (E._roman(snum), la_sec[n])
            elif n == 1:
                title['la'] = 'Prologus'
            toc.append({'id': 'section-%02d' % snum, 'title': title, 'children': []})
        toc[-1]['children'].append({'id': cid, 'title': {'la': 'Caput %d. %s' % (n, lt[:120]), 'en-US': 'Chapter %s. %s' % (E._roman(n), et)}})
    print(words)
    book = {
        'id': 'speculum-perfectionis', 'cover': 'classic',
        'name': {'la': 'Speculum perfectionis', 'en-US': 'The Mirror of Perfection', 'pt-BR': 'Espelho da perfeição'},
        'author': {'la': 'Socii sancti Francisci', 'en-US': 'Companions of St. Francis (Speculum perfectionis)', 'pt-BR': 'Companheiros de São Francisco (Espelho da perfeição)'},
        'description': {
            'la': 'Speculum perfectionis status fratris Minoris, scilicet beati Francisci, in centum viginti quattuor capitibus (redactio anni 1318).',
            'en-US': "The Mirror of Perfection of the state of a Friar Minor: memories of St. Francis gathered from the writings of his companions, above all Brother Leo, and compiled in 1318 in 124 chapters under thirteen heads (poverty, charity, humility, zeal for the Rule, prayer, prophecy, his love of creatures, his death). Latin in Sabatier's numbering; English of Robert Steele (Everyman, 1910).",
            'pt-BR': 'O Espelho da perfeição do estado do frade menor: memórias de São Francisco recolhidas dos escritos de seus companheiros, sobretudo frei Leão, compiladas em 1318 em 124 capítulos.'},
        'composed': 1318, 'languages': ['la', 'en-US'], 'work': 'companions-of-francis/speculum-perfectionis',
        'editions': {'la': {'editor': 'Paul Sabatier (numbering), web transcription', 'year': 1898}, 'en-US': {'translator': 'Robert Steele', 'year': 1910}},
        'sources': [
            {'language': 'la', 'url': 'https://www.franciscanos.net/fuentes/SpecPerf.htm',
             'edition': 'Speculum perfectionis, web transcription of franciscanos.net (Fuentes franciscanas), in the numbering of Sabatier\'s edition (Paris 1898); local mirror in research/sourcing/francis-of-assisi/mirror-franciscanos-net/.',
             'description': "Clean transcription with verse numbers (kept as bold numbers) and the transcription's 'cfr.' Scripture references. The bracketed interpolation in chapter LXXI is kept as printed there.",
             'tier': 'A', 'tierEvidence': 'Medieval text in the numbering of the 1898 edition.'},
            {'language': 'en-US', 'url': 'https://archive.org/details/thelittleflowers00francuoft',
             'edition': "The Little Flowers, The Mirror of Perfection, and St. Bonaventure's Life of St. Francis (London: J. M. Dent, Everyman's Library, 1910), the Mirror translated by Robert Steele.",
             'description': 'Archive.org OCR read from the word-coordinate file and cleaned by script, not proofread; running heads and page numbers dropped.',
             'tier': 'A', 'tierEvidence': 'Published 1910: public domain.'}],
        'toc': toc,
        'arrived': {'la': '2026-11-03', 'en-US': '2026-11-03'},
    }
    json.dump(book, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
