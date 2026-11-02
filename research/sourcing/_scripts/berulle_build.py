import sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts/migne')
from core import *

L = open(ROOT / 'research/sourcing/berulle/oc1856_djvu.txt', encoding='utf-8').read().split('\n')
BASE = ROOT / 'content/books/berulle-opera-omnia'
CH = re.compile(r'^\W{0,3}C[HIUl]{1,3}A[PIT]?[A-Z]{1,5}\s+(PREMIER|[IVXLlÏÎ1|!]{1,7}[.,:]?|V[IL]{1,3}[ï.]?)\s*[.\-—]*$', re.I)
DI = re.compile(r'^\W{0,3}DISC[OL]\w{0,4}\s+(PREMIER|[IVXLMlÏÎ1|]{1,7})\s*[.,]?$', re.I)


def build(slug, rng, head, word, fr_title, extra_lead_title=None, lead_title=None, extra=None):
    a, b = rng
    lead, secs = sections(L, a, b, head, word, extra)
    out = []
    if lead_title:
        bl = clean_paras(blocks(lead))
        w = write_md(BASE / slug / 'fr-FR' / 'avant-propos.md', lead_title, bl)
        out.append(('avant-propos', lead_title, w))
    for k, (n, lines) in enumerate(secs):
        nxt = secs[k + 1][0] if k + 1 < len(secs) else n + 1
        bl = blocks(lines)
        sub, body = subtitle_and_body(bl)
        label = f'{n}–{nxt - 1}' if nxt - 1 > n else f'{n}'
        title = title_from(f'{word} {label}', sub)
        cid = f'{word.lower()}-{n:02d}'
        paras = clean_paras(body)
        w = write_md(BASE / slug / 'fr-FR' / f'{cid}.md', title, paras)
        out.append((cid, title, w))
    return out

if __name__ == '__main__':
    which = sys.argv[1]
    if which == 'grandeurs':
        r = build('grandeurs-de-jesus', (6732, 28311), DI, 'Discours', None, lead_title='Dédicace, approbations et préface', extra={21544: 9})
    if which == 'vie':
        r = build('vie-de-jesus', (28311, 35921), CH, 'Chapitre', None, lead_title='Dédicace au roi et préambule')
    if which == 'mad':
        r = build('elevation-sainte-madeleine', (37755, 42054), CH, 'Chapitre', None, lead_title='Épître à la reine d’Angleterre')
    for x in r:
        print(x)
