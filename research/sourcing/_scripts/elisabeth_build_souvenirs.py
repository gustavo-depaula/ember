import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from elisabeth_souvenirs import *
BOOK = '/Users/gustavo/Documents/prayer/content/books/elisabeth-of-the-trinity-opera-omnia/souvenirs/'
frt = ["Premières années","L’appel divin","La mission de 1899","Vertus surnaturelles","Adieux au monde","Le postulat","Le noviciat","Louange de gloire","Vie intime","Relations de famille","« Seule avec le Seul »","Dieu rappelle à Lui sa Louange de gloire","La transformation en Jésus crucifié","Tout près du sanctuaire","Joie dans l’immolation","Dernières consolations","Du calvaire au ciel"]
ent = ["Childhood","The Divine Call","The Mission of 1899","Supernatural Virtues","Farewell to the World","The Postulant","The Novitiate","“Laudem Gloriæ”","The Inner Life","Sister Elizabeth and Her Family Circle","“Sola Soli”","God Calls “Laudem Gloriæ” to Himself","Transformation into Jesus Crucified","Close to the Sanctuary","Joy in Sacrifice","Last Consolations","From Calvary to Heaven"]
def build(L, S, lang, titles, heads, style, stop, fix):
    d = BOOK + lang + '/'
    os.makedirs(d, exist_ok=True)
    total = 0
    for k in range(17):
        ls = L[S[k]-1:S[k+1]-1]
        bl = [join_lines(x) for x in blocks(ls)]
        # body starts after the block holding the chapter summary (contains an em dash), within first 6 blocks
        j = next(i for i in range(1, 7) if '—' in bl[i] or ' - ' in bl[i])
        # rebuild lines after that block: find its last line in ls
        nblocks = blocks(ls)
        rest = [ln for b in nblocks[j+1:] for ln in b + ['']]
        paras, notes = clean(rest, heads, style, stop)
        summ = bl[j]
        txt = render(titles[k], paras, notes, fix, lead=fix(summ))
        open(d + 'ch-%02d.md' % (k+1), 'w').write(txt)
        total += len(txt.split())
    return total
print('fr', build(fr, frs, 'fr-FR', frt, FRH, 'num', stop_fr, fix_fr))
print('en', build(en, ens, 'en-US', ent, ENH, 'sym', stop_en, lambda s: s))
# French introduction
d = BOOK + 'fr-FR/'
paras, notes = clean(fr[1046:1415], FRH, 'num', re.compile(r'^I\.$'))
open(d + 'introduction.md', 'w').write(render('Introduction', paras, notes, fix_fr))
