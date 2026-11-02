import sys, re; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import bellarmine_split as S
from bellarmine_split import *
ORDS = 'PRIM SECUND TERTI QUART QUINT SEXT SEPTIM OCTAV NON DECIM'.split()
BK = re.compile(r'^(?:(?:LIBER|CONTROVERSIA)\.?\s+(?P<o>PRIM|SECUND|TERTI|QUART|QUINT|SEXT|SEPTIM|OCTAV|NON|DECIM)\w*|(?P<o2>PRIM|SECUND|TERTI|QUART|QUINT|SEXT|SEPTIM|OCTAV|NON|DECIM)\w* CONTROVERSIA|(?:LIBER|CONTROVERSIA)\.?\s+(?P<r>[IVX]{1,4}))\b[\s.,]*(?:(?:DE|De)\b.*)?$', re.I)
def bn(p):
    if len(p) > 120: return None
    m = BK.match(p)
    if not m: return None
    o = m.group('o') or m.group('o2')
    if o: return ORDS.index(o.upper()) + 1
    return rom(m.group('r'))
TAIL = {1: 12863, 2: 12483, 3: 12149, 4: 12529, 5: 12605, 6: 13895}
def parse_volume(v, lo_line=1):
    """-> list of controversies: each [ [book_n, idx, [(cn, idx, inline)]] ... ]"""
    paras = explode(bc.clean_volume(v).split('\n\n'))
    # explode shifts indices only inside long paras; use hi by searching the INDEX line
    hi = next(i for i, p in enumerate(paras) if re.match(r'^INDEX\b', p) and i > 800)
    lo = max(0, (lo_line - 1) // 2 - 5)
    conts = []; cur = None; book = None
    for i in range(lo, hi):
        p = paras[i]
        if len(p) > 120: continue
        b = bn(p)
        if b is not None:
            nxt_is_chap = any(CHAP.match(paras[j]) for j in range(i + 1, min(i + 6, hi)))
            if cur is None or (book and b == book[0] + 1):
                if cur is None: cur = []; conts.append(cur)
                book = [b, i, []]; cur.append(book); continue
            if b == 1 and nxt_is_chap and (book is None or book[0] >= 2 or len(book[2]) >= 3):
                cur = []; conts.append(cur); book = [1, i, []]; cur.append(book); continue
            continue
        m = CHAP.match(p)
        if not m: continue
        n = rom(m.group(1))
        if n is None: continue
        if book is None: continue
        exp = book[2][-1][0] + 1 if book[2] else 1
        if exp <= n <= exp + 2 or (not book[2] and n == 1): book[2].append((n, i, m.group(2).strip()))
    return paras, hi, conts
if __name__ == '__main__':
    for v in range(1, 7):
        paras, hi, conts = parse_volume(v)
        print('vol', v, len(paras), hi)
        for c in conts:
            print('  cont', [(b[0], b[1], len(b[2]), (b[2][-1][0] if b[2] else 0)) for b in c])
