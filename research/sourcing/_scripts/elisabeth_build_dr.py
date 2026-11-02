import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from elisabeth_souvenirs import *
ROOT = '/Users/gustavo/Documents/prayer/content/books/elisabeth-of-the-trinity-opera-omnia/'
frd = ["Premier jour","Deuxième jour","Troisième jour","Quatrième jour","Cinquième jour","Sixième jour","Septième jour","Huitième jour","Neuvième jour","Dixième jour","Onzième jour","Douzième jour","Treizième jour","Quatorzième jour","Quinzième jour","Seizième jour"]
end_ = ["First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","Twelfth","Thirteenth","Fourteenth","Fifteenth","Sixteenth"]
ends = [e + " Day" for e in end_]
frl = [10304,10394,10478,10565,10647,10740,10806,10873,10962,11059,11143,11216,11292,11377,11490,11570,11658]
enl = [10738,10835,10917,11010,11097,11190,11265,11335,11429,11522,11611,11688,11773,11856,11963,12060,12125]
def sections(L, starts, titles, heads, style, fix, d, prefix='day-'):
    os.makedirs(d, exist_ok=True); tot = 0
    for k in range(len(titles)):
        ls = L[starts[k]:starts[k+1]-1]   # skip heading line itself
        paras, notes = clean(ls, heads, style)
        txt = render(titles[k], paras, notes, fix)
        open(d + '%s%02d.md' % (prefix, k+1), 'w').write(txt); tot += len(txt.split())
    return tot
if __name__ == '__main__':
    B = ROOT + 'derniere-retraite/'
    print(sections(fr, frl, frd, FRH, 'num', fix_fr, B + 'fr-FR/'))
    print(sections(en, enl, ends, ENH, 'sym', lambda s: s, B + 'en-US/'))
