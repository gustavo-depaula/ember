import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from elisabeth_souvenirs import *
from elisabeth_build_dr import sections
ROOT = '/Users/gustavo/Documents/prayer/content/books/elisabeth-of-the-trinity-opera-omnia/'
def one(L, a, b, title, heads, style, fix, path):
    paras, notes = clean(L[a:b], heads, style)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    txt = render(title, paras, notes, fix)
    open(path, 'w').write(txt); return len(txt.split())
def find(L, rx, start=0):
    return next(i for i in range(start, len(L)) if re.search(rx, L[i]))
if __name__ == '__main__':
    a = find(fr, r'PIEUSE\s+.LÉVATION', 11600); b = find(fr, r'^LETTRES\s*$', a)
    print('el fr', one(fr, a + 1, b, 'Ô mon Dieu, Trinité que j’adore', FRH, 'num', fix_fr, ROOT + 'elevation/fr-FR/elevation.md'))
    a = find(en, r'PRAYER\s+OF\s+SISTER', 12100); b = find(en, r'^LETTERS\s+OF\s+SISTER', a)
    print('el en', one(en, a + 1, b, 'O my God, Trinity Whom I adore', ENH, 'sym', lambda s: s, ROOT + 'elevation/en-US/elevation.md'))
    a = find(fr, r"Lettre\s+de\s+M\.\s+l'abbé\s+D", 13700); b = find(fr, r'^TABLE\s+DES', a)
    print('abbe fr', one(fr, a + 1, b, 'Lettre de M. l’abbé D… à Madame Catez', FRH, 'num', fix_fr, ROOT + 'souvenirs/fr-FR/lettre-abbe-d.md'))
    a = find(en, r'LETTER\s+FROM\s+M\.\s+L', 13200); b = find(en, r'A\s+SECOND\s+RETREAT', a)
    print('abbe en', one(en, a + 1, b, 'Letter from the Abbé D… to Madame Catez', ENH, 'sym', lambda s: s, ROOT + 'souvenirs/en-US/lettre-abbe-d.md'))
    starts = [13396,13441,13476,13520,13552,13576,13641,13705,13789,13847]
    e = find(en, r'Washbo', 13847)
    ttl = ["First Day","Second Day","Third Day","Fourth Day","Fifth Day","Sixth Day","Seventh Day","Eighth Day","Ninth Day","Tenth Day"]
    print('cf', sections(en, starts + [e + 1], ttl, ENH, 'sym', lambda s: s, ROOT + 'ciel-dans-la-foi/en-US/'))
