import sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts/migne')
from core import *
from grouped import *

OL = ROOT / 'research/sourcing/olier'
L = open(OL / 'uvrescompltesd00olie.txt', encoding='utf-8').read().split('\n')
BASE = ROOT / 'content/books/olier-opera-omnia'
CH = re.compile(r'^\W{0,3}C[HIUl]{1,3}A[PIT]?[A-Z]{1,5}\s+(PREMIER|[IVXLlÏÎ1|!UJ]{1,7}[.,:]?|V[IL]{1,3}[ï.]?)\s*[.\-—]*$', re.I)
LE = re.compile(r'^\W{0,3}LE[ÇC]ON\s*(PREMI[ÈE]RE|[IVXLlÏÎ1|!]{1,8}|)\s*[.,]?\s*$', re.I)
EXTRA_REF.extend(['SPIRITUELLES', 'SAINTS', 'CLERICATURE', 'SACERDOCE', 'VERTUS', 'CHRETIENNE'])


def build2(lines, outdir, rng, head, word, cid_prefix, lead_title=None, extra=None, title_word=None, nstart=0, lead_id='avant-propos'):
    a, b = rng
    lead, secs = sections(lines, a, b, head, word, extra)
    out = []
    tw = title_word or word
    if lead_title:
        ps = clean_paras(blocks(lead))
        if sum(len(p.split()) for p in ps) > 40:
            lid = lead_id if not cid_prefix.startswith('livre') else f'{cid_prefix}-00'
            out.append((lid, lead_title, write_md(outdir / f'{lid}.md', lead_title, ps)))
    for k, (n, ls) in enumerate(secs):
        nxt = secs[k + 1][0] if k + 1 < len(secs) else n + 1
        sub, body = subtitle_and_body(blocks(ls))
        label = f'{n}–{nxt - 1}' if nxt - 1 > n else f'{n}'
        title = title_from(f'{tw} {label}', sub)
        cid = f'{cid_prefix}-{n:02d}'
        out.append((cid, title, write_md(outdir / f'{cid}.md', title, clean_paras(body))))
    return out


def run(which):
    D = BASE
    if which == 'introduction':
        return build2(L, D / 'introduction-vie-et-vertus/fr-FR', (3405, 13255), CH, 'Chapitre', 'chapitre', lead_title='Avant-propos')
    if which == 'journee':
        d = D / 'journee-chretienne/fr-FR'
        r = []
        ps = clean_paras(blocks(L[13255:13462]))
        r.append(('avant-propos', 'Avant-propos', write_md(d / 'avant-propos.md', 'Avant-propos', ps)))
        r += build_chunks(L, 13462, 18204, d, 'partie-1', 'Première partie', size=6000, unit='section')
        r += build_chunks(L, 18204, 22826, d, 'partie-2', 'Seconde partie', size=6000, unit='section')
        return r
    if which == 'ceremonies':
        d = D / 'ceremonies-grand-messe/fr-FR'
        livres = [(23483, 1), (25043, 2), (27266, 3), (28702, 4), (29100, 5), (30137, 6), (31889, 7), (33974, 8), (35220, 9), (35588, 10)]
        r = []
        ps = clean_paras(blocks(L[22826:23483]))
        r.append(('preface', 'Préface', write_md(d / 'preface.md', 'Préface', ps)))
        for k, (a, n) in enumerate(livres):
            b = livres[k + 1][0] if k + 1 < len(livres) else 36367
            nm = f'Livre {n}' if n < 10 else 'Messe des morts'
            r += build2(L, d, (a, b), CH, 'Chapitre', f'livre-{n:02d}', lead_title=f'{nm} : ouverture', title_word=f'{nm}, chapitre')
        return r
    if which == 'catechisme':
        d = D / 'catechisme-chretien/fr-FR'
        r = []
        for part, (a, b) in ((1, (36367, 38708)), (2, (38708, 40510))):
            lead, secs = sections(L, a, b, LE, 'Leçon', {38708: 1} if part == 2 else None)
            for n, ls in secs:
                sub, body = subtitle_and_body(blocks(ls))
                t = clean_paras(body)
                # the lesson's own title is the first paragraph (ends with '.', short)
                title = f'Partie {part}, leçon {n}'
                if t and len(t[0]) < 140 and readable(t[0]):
                    title += '. ' + t[0].rstrip('.')
                    t = t[1:]
                cid = f'p{part}-lecon-{n:02d}'
                r.append((cid, title, write_md(d / f'{cid}.md', title, t)))
        return r


ART = re.compile(r'^\W{0,3}ARTICLE\s+([IVXLlÏÎ1|!]{1,6})\s*[.,]?\s*$', re.I)
LET = re.compile(r'^\W{0,3}LETTRE\s+([IVXLCDMlÏÎ1|!]{1,14})\s*(?:\(\d+\))?\s*[.,]?\s*$')


def rom_big(s):
    s = s.upper().replace('Ï', 'I').replace('Î', 'I').replace('|', 'I').replace('1', 'I').replace('!', 'I').replace('L', 'L')
    vals = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    s = re.sub(r'[^IVXLCDM]', '', s)
    t = 0
    for a, b in zip(s, s[1:] + ' '):
        v = vals[a]
        t += -v if vals.get(b, 0) > v else v
    return t


def letters_1885():
    out = []
    d = BASE / 'lettres/fr-FR'
    for vol, fn in ((1, 'lettresdemolierf01olie.txt'), (2, 'lettresdemolierf02olie.txt')):
        LL = open(OL / fn, encoding='utf-8').read().split('\n')
        prev, found = (0 if vol == 1 else 10**6), []
        # numbers must rise; the second volume continues the first
        cand = []
        for i, ln in enumerate(LL):
            m = LET.match(ln.strip())
            if m:
                cand.append((rom_big(m.group(1)), i))
        # keep a monotone chain (longest increasing run starting near the previous number)
        last = 0 if vol == 1 else 205
        for n, i in cand:
            if n > last and n <= last + 6:
                found.append((n, i)); last = n
        print('vol', vol, len(found), found[:2], found[-2:])
        out_v = build_groups(LL, 0, len(LL), found, d, 'lettres-v%d' % vol, 'Lettre', 25, 'Lettres de M. Olier (tome %d)' % vol, lead_in_first=False)
        out += out_v
    return out


def run2(which):
    D = BASE
    if which == 'ordres':
        d = D / 'traite-des-saints-ordres/fr-FR'
        r = build_chunks(L, 40514, 50624, d, 'partie-1', 'Première partie : de la cléricature', size=8000, unit='section')
        r += build_chunks(L, 50624, 53852, d, 'partie-2', 'Deuxième partie : des ordres inférieurs', size=8000, unit='section')
        r += build_chunks(L, 53852, 60103, d, 'partie-3', 'Troisième partie : du sacerdoce', size=8000, unit='section')
        return r
    if which == 'memoires':
        d = D / 'opuscules/fr-FR'
        return build_chunks(L, 88140, 96100, d, 'memoires', 'Extraits des Mémoires', size=7000, unit='partie')
    if which == 'directeur':
        d = D / 'opuscules/fr-FR'
        return build2(L, d, (96100, 100496), ART, 'Article', 'esprit-directeur', lead_title='L’esprit d’un directeur des âmes', title_word='L’esprit d’un directeur, article', lead_id='esprit-directeur-00')
    if which == 'regles':
        d = D / 'opuscules/fr-FR'
        return build_chunks(L, 100496, 102998, d, 'regles-avis-examen', 'Règles, avis et examen sur les vertus', size=9000)
    if which == 'lettres':
        return letters_1885()


if __name__ == '__main__' and sys.argv[1] in ('ordres', 'memoires', 'directeur', 'regles', 'lettres'):
    for x in run2(sys.argv[1]):
        print(x)
    sys.exit()

if __name__ == '__main__':
    for x in run(sys.argv[1]):
        print(x)
