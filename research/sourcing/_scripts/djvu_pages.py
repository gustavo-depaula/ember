"""Parse an archive.org _djvu.xml into pages -> paragraphs -> lines with geometry.
line = dict(x0, x1, yb (median bottom), h (median word height), text)"""
import re, statistics, html
def pages(path):
    xml = open(path, errors='replace').read()
    out = []
    for p in re.split(r'<OBJECT ', xml)[1:]:
        pars = []
        for par in re.findall(r'<PARAGRAPH>(.*?)</PARAGRAPH>', p, flags=re.S):
            ls = []
            for ln in re.findall(r'<LINE>(.*?)</LINE>', par, flags=re.S):
                ws = [(tuple(map(int, c.split(','))), html.unescape(w.strip())) for c, w in re.findall(r'<WORD coords="([^"]+)"[^>]*>([^<]*)</WORD>', ln)]
                ws = [x for x in ws if x[1]]
                if not ws: continue
                ls.append(dict(x0=ws[0][0][0], x1=ws[-1][0][2], yb=statistics.median(c[1] for c, w in ws),
                               h=statistics.median(c[1] - c[3] for c, w in ws), text=' '.join(w for c, w in ws), words=ws))
            if ls: pars.append(ls)
        out.append(pars)
    return out


def tsv_page(path):
    """A tesseract TSV page in the same shape as one page of pages(): paragraphs -> lines."""
    rows = [r.split('\t') for r in open(path, errors='replace').read().split('\n')[1:] if r.count('\t') >= 11]
    lines = {}
    for r in rows:
        if r[0] != '5' or not r[11].strip() or re.fullmatch(r"[|}{~¢\\_]+", r[11].strip()):  # gutter shadow read as marks
            continue
        key = (int(r[2]), int(r[3]), int(r[4]))  # block, paragraph, line
        x, y, w, h = map(int, r[6:10])
        lines.setdefault(key, []).append(((x, y + h, x + w, y), r[11].strip()))
    pars = {}
    for (b, p, l), ws in sorted(lines.items()):
        pars.setdefault((b, p), []).append(dict(x0=ws[0][0][0], x1=ws[-1][0][2], yb=statistics.median(c[1] for c, w in ws),
                                               h=statistics.median(c[1] - c[3] for c, w in ws), text=' '.join(w for c, w in ws), words=ws))
    return [sorted(v, key=lambda l: l['yb']) for k, v in sorted(pars.items(), key=lambda kv: min(l['yb'] for l in kv[1]))]
