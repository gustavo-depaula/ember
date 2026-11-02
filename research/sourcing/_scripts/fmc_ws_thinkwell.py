"""Think Well On't from the Wikisource transcription (1801 edition) -> challoner-opera-omnia/think-well-ont."""
import os, re, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import fmc_ws_book as B, fmc_import as F
D = '/Users/gustavo/Documents/prayer/research/sourcing/challoner/ws/twot/'
def paras(name): return B.parse_paras(open(D + name + '.html').read())
ORD = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth', 'Thirty-first']
stream = []
for i in range(1, 32): stream += paras('Think_Well_On_t_Day_%d' % i)
stream = [p for p in stream if p.strip('*. ').upper() != "THINK WELL ON’T" and p.strip('*. ').upper() != "THINK WELL ON'T"]
days = {}; cur = None
for p in stream:
    m = re.fullmatch(r'THE ([A-Z-]+) DAY\.?', p.strip('* '))
    if m and m.group(1).title() in [o.title() for o in ORD]:
        cur = [o.upper() for o in ORD].index(m.group(1)); days.setdefault(cur, []); 
        if days[cur]: cur = None if False else cur
        continue
    if cur is not None: days[cur].append(p)
root = '/Users/gustavo/Documents/prayer/content/books/challoner-opera-omnia/think-well-ont'
os.makedirs(root + '/en-US', exist_ok=True); os.makedirs(root + '/sources/en-US-originals', exist_ok=True)
toc = []; words = 0; raw = []
def emit(cid, title, ps):
    global words
    md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps)); open('%s/en-US/%s.md' % (root, cid), 'w').write(md); words += len(md.split())
    toc.append({'id': cid, 'title': {'en-US': title}}); raw.append('===== %s =====\n%s\n' % (title, '\n\n'.join(ps)))
d = paras('Think_Well_On_t_Directions'); emit('directions', 'Directions for the Use of the Considerations', [re.sub(r'^\*|\*$', '', d[0]).strip('* ')] and d[1:])
for k in range(31):
    ps = days.get(k, [])
    if not ps: print('MISSING day', k + 1); continue
    sub = re.sub(r'\s+', ' ', ps[0].replace('*', '')).strip() if len(ps[0].split()) < 14 and not re.match(r'^\d|Consider', ps[0], re.I) else ''
    body = ps[1:] if sub else ps
    emit('day-%02d' % (k + 1), 'The %s Day%s' % (ORD[k], ': ' + sub.rstrip('.') if sub else ''), body)
r = paras('Think_Well_On_t_Rules'); emit('rules', 'Rules for a Christian Life', [x for x in r if not re.fullmatch(r'\*?(RULES|for a|CHRISTIAN LIFE\.?)\*?\s*', x)][1:])
f = paras('Think_Well_On_t_Life_of_Faith'); emit('life-of-faith', 'The Life of Faith', f[1:])
open(root + '/sources/en-US-originals/think-well-ont-wikisource.txt', 'w').write('\n'.join(raw))
cfg = {"id": "challoner-think-well-ont", "dir": "challoner-opera-omnia/think-well-ont", "slug": "think-well-ont", "work": "challoner/think-well-ont",
 "name": "Think Well On't", "name_pt": "Pensa Bem Nisto",
 "author": "Bp. Richard Challoner", "author_pt": "D. Richard Challoner", "died": 1781,
 "desc": "Think Well On't, or Reflections on the great truths of the Christian religion for every day of the month (1728), Challoner's first and most reprinted devotional book: thirty-one days of short considerations on death, judgment, hell, heaven, the mercies of God and the Passion, with directions for the use of the considerations, rules for a Christian life and a short treatise on the life of faith.",
 "desc_pt": "Think Well On't — Reflexões sobre as grandes verdades da religião cristã para cada dia do mês (1728), o primeiro e mais reimpresso livro devocional de Challoner: trinta e um dias de breves considerações sobre a morte, o juízo, o inferno, o céu, as misericórdias de Deus e a Paixão, com instruções para o uso das considerações, regras de vida cristã e um breve tratado sobre a vida de fé.",
 "composed": 1728, "editor": "Bp. Richard Challoner (1801 edition, as transcribed on Wikisource)", "year": 1801,
 "url": "https://en.wikisource.org/wiki/Think_Well_On't", "edition": "Think Well On't, or Reflections on the great truths of the Christian religion for every day of the month (1801 edition), Wikisource transcription of Thinkwellonit.pdf.",
 "srcfull": "The thirty-one days, the directions, the rules for a Christian life and the Life of Faith. The days follow the book's own headings; the Wikisource page boundaries are not kept. The 1801 scan at archive.org (thinkwellontorre00chaluoft) was not needed.",
 "start": 1, "end": 2}
cfg["srcfull"] += " The text is the Wikisource volunteer transcription; the editors' markup and page numbers are dropped. Raw text in sources/en-US-originals/."
F.write_book(cfg, root, toc, words, 0, ['']) 
print(len(toc), 'chapters', words, 'words')
