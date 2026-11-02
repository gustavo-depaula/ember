import re, sys, json, os
sys.path.insert(0, os.path.dirname(__file__))
from ocr_clean import *
RAW = '/Users/gustavo/Documents/prayer/research/sourcing/elisabeth-of-the-trinity/raw/'
FRH = [re.compile(r'^\d{1,3}\s+[^a-zà-ÿ]{5,}$'), re.compile(r'^[^a-zà-ÿ]{5,}\s+\d{1,3}$'),
       re.compile(r'(RETRAITE|ELISABETH|ÉLISABETH|LETTRES|POÉSIES).{0,40}\d{3}$'), re.compile(r'^\d{3}\s+SŒUR')]
ENH = [re.compile(r'^\d{1,3}\s+[^a-z]{5,}$'), re.compile(r'^[^a-z]{5,}\s+\d{1,3}$'),
       re.compile(r'^(LETTERS|THE LAST RETREAT|THE "PRAISE).{0,40}\d{2,3}$'), re.compile(r'PRAISE\s+OF\s+GLORY'), re.compile(r'^(LAST\s+RETREAT|LETTERS)\s+\S{2,4}$')]

def lines(name):
    return open(RAW + name, encoding='utf8').read().split('\n')

fr = lines('soeurlisabethd00li.txt')
en = lines('thepraiseofglory00elizuoft.txt')
frs = [1422,1926,2495,2962,3442,3986,4492,5061,5720,6128,6682,7055,7641,8147,8665,9084,9643,10289]
ens = [1797,2279,2863,3358,3836,4355,4851,5430,6078,6473,7072,7444,8045,8551,9088,9502,10069,10724]
stop_fr = re.compile(r'^(I|II|III)\.$|^AU CARMEL$|^AU SEUIL')
stop_en = re.compile(r'^(PART [IVX]+|APPENDIX)$')
ROM = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII']

def chapter(L, a, b, lang):
    ls = L[a:b]
    bl = [join_lines(x) for x in blocks(ls)]
    # first blocks: CHAPITRE N, title, summary
    i = 1
    title = bl[i]
    # summary = next block if it contains ' — ' or '—'
    summ = None
    j = i + 1
    if re.search(r'[—-]', bl[j]) and len(bl[j]) < 400 and not re.search(r'^[A-Z]', bl[j][:0] or 'x') and bl[j].count('—') + bl[j].count(' - ') >= 1:
        summ = bl[j]; j += 1
    return title.rstrip('.'), summ, j, ls

if __name__ == '__main__':
    which = sys.argv[1]
    for k in range(17):
        L, S, lang = (fr, frs, 'fr') if which == 'fr' else (en, ens, 'en')
        t, s, j, ls = chapter(L, S[k] - 1, S[k + 1] - 1, lang)
        print(k + 1, repr(t), repr(s)[:80])
