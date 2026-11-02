import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fds_common import *
src = '/Users/gustavo/Documents/prayer/research/sourcing/francis-de-sales/en/spiritualconfere00franuoft.txt'
starts = [2474,3054,3540,4503,5283,5783,6438,7187,7644,8741,9245,10601,11477,12403,13291,13924,14777,15936,16582,17409,17901]
end = next(i for i in range(17950, 18224) if re.match(r'^\s*(INDEX|APPENDIX)', open(src).read().split('\n')[i]) ) if False else 18224
HEAD = re.compile(r"^\d{1,3}\s+[A-Z][A-Za-z ,.'()I-]{2,50}$|^[A-Z][A-Za-z ,.'()-]{3,45}\s+\d{1,3}$|^Conference [IVXL]+\.?$")
FOOT = re.compile(r"^(\([IiVv\d]{1,3}\)|\*+)\s+\S")
en_titles = [t for t in open('/Users/gustavo/Documents/prayer/research/sourcing/_scripts/fds_entretiens.py').read().split('en_titles = ')[1].split('\n')[0].strip('[]').split('","')]
en_titles = [t.strip('"') for t in en_titles]
roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI']
tot = 0
for n in range(1, 22):
    a = starts[n-1] + 1
    b = starts[n] if n < 21 else end
    ps = en_lines(src, a, b, HEAD, FOOT)
    # drop heading block: leading short all-caps/title lines
    while ps and (ps[0].isupper() or ps[0][:14].isupper() or len(ps[0]) < 14 or re.match(r'^(CONFE|Conference)', ps[0])):
        ps.pop(0)
    ps = [re.sub(r"ST\. MICHAEL'S COLLEGE.*$", '', p) for p in ps]
    ps = [re.sub(r'\s*\((?:[IiVv]|\d{1,2}|/)\)', '', p) for p in ps]
    tot += write_chapter('entretiens-spirituels', 'en-US', f'entretien-{roman[n-1].lower()}', f'Conference {roman[n-1]}. {en_titles[n-1]}', ps)
print(tot)
