import sys; sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gq_en_build import *
import collections
for v in sys.argv[1:]:
    f = 'liturgicalyear02gura.txt' if v == '02' else f'V{v}TheLiturgicalYear.txt'
    L = load(IA + f)
    from gq_bi import deinterleave
    L, nbi = deinterleave(L)
    freq = collections.Counter(w for l in L for w in re.findall(r'[A-Za-z]+', l.lower()))
    bs = boundaries(L)
    ts = [title_for(r, freq) for r in bs]
    print('==', v, len(L), 'bi', nbi, 'bounds', len(bs))
    print(' | '.join(f'{(t or "?")[:34]}' for t in ts[:14]))
    print(' ... ', ' | '.join(f'{(t or "?")[:34]}' for t in ts[-6:]))
