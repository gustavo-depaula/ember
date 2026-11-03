import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from en_common import join_lines
D = '/Users/gustavo/Documents/prayer/research/sourcing/_skipped/'
F = '/Users/gustavo/Documents/prayer/content/books/bernard-opera-omnia/sermones-super-cantica/en-US/s41.md'
def page(n):
    ls = [l for l in open(D + 'tess_v01_n%d.txt' % n).read().split('\n')]
    ls = [l for l in ls if l.strip()]
    if re.search(r"NECK|SPOUSE|BERNARD|SERMONS", ls[0]) and len(ls[0].split()) < 8: ls = ls[1:]
    return ls
p504 = page(504); p505 = page(505)
# page 504 is one paragraph break: "But observe, my brethren"
txt504 = '\n'.join(p504)
i = next(k for k, l in enumerate(p504) if l.lstrip().startswith('But observe'))
a = join_lines(p504[:i]); b = join_lines(p504[i:])
j = next(k for k, l in enumerate(p505) if 'preaching' in l)
b = join_lines([b] + p505[:j + 1])
for s_ in (a, b): pass
md = open(F).read()
start = md.index('so that our ideas, dressed out in apt and')
end = md.index('We learn from this, my brethren')
a = a[a.index('out in apt and') + len('out in apt and'):]
new = md[:start] + 'so that our ideas, dressed out in apt and' + a + '\n\n' + b + '\n\n' + md[end:]
# the Baal footnote
k = next(k for k, l in enumerate(p505) if l.lstrip().startswith('*') or 'Dedi eis' in l)
note = join_lines(p505[k:]); note = re.sub(r'^\W*\*\s*', '', note)
new = new.replace('service of Baal." * Listen', 'service of Baal."[^3] Listen')
gs = new.index('aJentfmeott'); ge = new.index('\n', gs)
new = new[:gs].rstrip('\n') + new[ge:]
new = new.rstrip('\n') + '\n\n[^3]: ' + note + '\n'
for x in ('“', '”'): new = new.replace(x, '"')
new = new.replace('’', "'").replace('‘', "'")
open(F, 'w').write(new)
print(len(a.split()), len(b.split()), len(note.split()), new.count('[^3]'))
print(re.findall(r"[\^«°£™}]", new)[:10])
