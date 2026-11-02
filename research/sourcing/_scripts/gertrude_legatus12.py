"""Gertrude, Legatus divinae pietatis I-II from IntraText LAT0714 (Solesmes 1875 text)."""
import re, sys, json, shutil
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gm_common import *

T = open(RAW + 'intratext_legatus12.txt').read()
T = T.replace('@H2 ', '').replace('@H2', '')
i2 = T.index('Liber\nsecundus')
parts = {'1': T[:i2], '2': T[i2:T.index('Explicit liber\nsecundus')]}

def chapters(txt, book):
    txt = re.sub(r'\n(?=CAPUT(?:\s|\n))', '\n\x00', txt)
    segs = txt.split('\x00')[1:] if '\x00' in txt else []
    pre = txt.split('\x00')[0]
    out = []
    for seg in segs:
        lines = seg.split('\n')
        k = 0
        head = []
        while k < len(lines) and not lines[k].startswith('['):
            head.append(lines[k]); k += 1
            if len(head) > 5: break
        body = '\n'.join(lines[k:])
        # heading: CAPUT, numeral, title lines
        h = [x.strip() for x in head if x.strip()]
        assert h[0] == 'CAPUT' or h[0].startswith('CAPUT'), h
        h0 = h[0]
        rest = h[1:]
        if h0 == 'CAPUT':
            rest = rest[1:]       # numeral word on its own line
        else:
            pass
        title = ' '.join(rest).strip()
        out.append((title, body))
    return pre, out

def para_md(body):
    b = re.sub(r'\[p\.\s*\d+\s*\]', ' ', body)
    b = re.sub(r'\s+', ' ', b)
    ps = re.split(r'\s*\[(?:\d+|[lI]|\d+[a-z]?)\]\s*', b)
    return [p.strip() for p in ps if p.strip()]

NUM = lambda n: {1:'I'}.get(n) or ''
def build(book):
    pre, chs = chapters(parts[book], book)
    files = []
    if book == '2':
        pro = pre.split('Prologus', 1)[1]
        files.append(('prologus', 'Prologus', '# Prologus\n\n' + '\n\n'.join(para_md(pro)) + '\n'))
    for n, (title, body) in enumerate(chs, 1):
        title = re.sub(r'\s+', ' ', title)
        ps = para_md(body)
        t = f'Caput {n}' + (f': {title}' if title else '')
        files.append((f'c{n:02d}', t, f'# {t}\n\n' + '\n\n'.join(ps) + '\n'))
    return files

if __name__ == '__main__':
    for bk in '12':
        fs = build(bk)
        print(bk, len(fs), sum(len(m.split()) for _, _, m in fs))
        for cid, t, m in fs[:3] + fs[-2:]:
            print(cid, '|', t, '|', len(m.split()))

    from gm_common import book_meta
    URL = 'https://www.intratext.com/IXT/LAT0714/'
    DESC = {
     '1': ('Legatus divinae pietatis, liber I', 'The Herald of Divine Love, Book I', 'O Arauto do Amor Divino, Livro I',
           'Liber primus: vita et virtutes Gertrudis, scripti ab una ex sororibus Helftensibus; commendatio personae, testimonia gratiae, signa caelestia.',
           'Book I, written by a sister of Helfta: the life and virtues of Gertrude, the witnesses of grace and the heavenly signs.',
           'Livro I, escrito por uma irmã de Helfta: vida e virtudes de Gertrudes, os testemunhos da graça e os sinais celestes.', 'c. 1289-1302'),
     '2': ('Legatus divinae pietatis, liber II', 'The Herald of Divine Love, Book II', 'O Arauto do Amor Divino, Livro II',
           'Liber secundus, ab ipsa Gertrude conscriptus: gratiae acceptae anno aetatis vicesimo sexto, visitationes Domini, vulnera amoris, gratiarum actio.',
           'Book II, written by Gertrude herself: the grace received in her twenty-sixth year, the Lord\'s visitations, the wound of love, thanksgiving.',
           'Livro II, escrito pela própria Gertrudes: a graça recebida aos vinte e seis anos, as visitas do Senhor, a ferida do amor, a ação de graças.', 'c. 1289-1291')}
    for bk in '12':
        fs = build(bk)
        n, ne, np, dl, de, dp, comp = DESC[bk]
        B = f'{REPO}/content/books/gertrude-opera-omnia/legatus-{bk}'
        meta = book_meta(f'gertrude-legatus-{bk}', f'gertrude/legatus-{bk}', {'la': n, 'en-US': ne, 'pt-BR': np},
            {'la': dl, 'en-US': de, 'pt-BR': dp}, comp, ['la'],
            {'la': {'editor': 'Solesmes Benedictines (L. Paquelin)', 'year': 1875}},
            [{'language': 'la', 'url': URL, 'edition': 'Revelationes Gertrudianae ac Mechtildianae, vol. I, Poitiers/Paris: H. Oudin, 1875 (Solesmes edition), as transcribed in IntraText LAT0714.',
              'description': 'IntraText edition (EuloTech 2007), Books I-II only. The edition\'s [p. N] page marks are dropped and the paragraph numbers [N] become paragraph breaks (research/sourcing/_scripts/gertrude_legatus12.py).',
              'tier': 'B', 'tierEvidence': 'IntraText is licensed under a Creative Commons license; the underlying 1875 text is public domain.'}],
            [{'id': c, 'title': {'la': t}} for c, t, m in fs])
        write_book(B, meta, {'la': [(c, m) for c, t, m in fs]})
        import os
        os.makedirs(B + '/sources/la-originals', exist_ok=True)
        shutil.copy(RAW + 'intratext_legatus12.txt', B + '/sources/la-originals/legatus-1-2-intratext.txt')
        print(B, words(B + '/la'))
