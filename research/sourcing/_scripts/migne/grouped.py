import sys
from core import *


def piece_md(label, n, lines, sub_ok=True, rest=None):
    bl = blocks(lines)
    sub, body = subtitle_and_body(bl)
    head = f'{label} {n}'
    if rest is not None:
        r = fix_fr(rest).strip(' .—-')
        if r and readable(r) and len(r) < 160:
            s = r.lower(); s = s[0].upper() + s[1:]
            head += f'. {s}'
    elif sub and sub_ok:
        t = title_from('', sub).lstrip('. ').strip()
        if t and readable(sub):
            head += f'. {t}'
    return head, clean_paras(body)


def build_groups(L, a, b, found, outdir, prefix, label, group, series_title, lead_in_first=True, pieces_rest=None):
    """found: [(n, line)] ascending. Groups of `group` consecutive numbers per file. Returns [(id, title, words)]."""
    res, files = [], {}
    order = []
    lead_lines = L[a:found[0][1]] if found else L[a:b]
    for k, (n, i) in enumerate(found):
        j = found[k + 1][1] if k + 1 < len(found) else b
        g = (n - 1) // group
        files.setdefault(g, []).append((n, i, j))
    for g in sorted(files):
        items = files[g]
        lo, hi = items[0][0], items[-1][0]
        parts = []
        if g == min(files) and lead_in_first:
            lp = clean_paras(blocks(lead_lines))
            parts += lp
        for n, i, j in items:
            first = L[i].strip()
            m = PIECE.match(first) if pieces_rest else None
            rest = m.group(2) if (m and pieces_rest) else None
            head, paras = piece_md(label, n, L[i + 1:j], rest=rest)
            parts += [f'## {head}'] + paras
        cid = f'{prefix}-{lo:03d}-{hi:03d}'
        title = f'{series_title}, {label.lower()} {lo}–{hi}' if lo != hi else f'{series_title}, {label.lower()} {lo}'
        path = outdir / f'{cid}.md'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f'# {title}\n\n' + '\n\n'.join(parts) + '\n', encoding='utf-8')
        res.append((cid, title, sum(len(p.split()) for p in parts)))
    return res


def build_chunks(L, a, b, outdir, prefix, title, size=7000, lead_title=None, nums=True, extra=None):
    """No usable headings: cut the cleaned text into parts of about `size` words at paragraph ends."""
    paras = clean_paras(blocks(L[a:b], extra))
    parts, cur, w = [], [], 0
    for p in paras:
        cur.append(p); w += len(p.split())
        if w >= size and END.search(p):
            parts.append(cur); cur, w = [], 0
    if cur:
        if parts and w < size * 0.4:
            parts[-1] += cur
        else:
            parts.append(cur)
    res = []
    for k, ps in enumerate(parts, 1):
        cid = f'{prefix}-{k:02d}' if len(parts) > 1 else prefix
        t = f'{title}, partie {k}' if len(parts) > 1 else title
        outdir.mkdir(parents=True, exist_ok=True)
        (outdir / f'{cid}.md').write_text(f'# {t}\n\n' + '\n\n'.join(ps) + '\n', encoding='utf-8')
        res.append((cid, t, sum(len(p.split()) for p in ps)))
    return res
