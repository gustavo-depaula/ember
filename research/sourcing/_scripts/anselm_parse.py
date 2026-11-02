"""Parse Corpus Corporum TEI (PL 158) and Deane's CCEL text into chapter lists."""
import re, html

def clean_inline(s):
    s = re.sub(r'<pb[^>]*/>', ' ', s)
    s = re.sub(r'</?note>', '', s)
    s = re.sub(r'<B>.*?</B>|<emph>.*?</emph>', ' ', s)
    s = re.sub(r'<hi>(.*?)</hi>', lambda m: '\x01'+m.group(1)+'\x02', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    # italics markers -> *...*, trimming inner spaces, merging adjacent
    s = s.replace('\x02 \x01', ' ').replace('\x02\x01', '')
    s = re.sub(r'\x01\s*', '*', s); s = re.sub(r'\s*\x02', '*', s)
    s = re.sub(r'\*\s*\*', '', s)
    return s

def latin_chapters(path):
    x = open(path, encoding='utf-8').read()
    x = x[x.index('<text>'):]
    toks = re.findall(r'<head>(.*?)</head>|<p>(.*?)</p>', x, flags=re.S)
    out = []  # (kind, headtext, [paras])
    for h, p in toks:
        if h or (not p):
            out.append({'head': clean_inline(h) if h else '', 'raw': h, 'paras': []})
        else:
            if not out: out.append({'head': '', 'raw': '', 'paras': []})
            t = clean_inline(p)
            if t: out[-1]['paras'].append(t)
    return out

def english_lines(path, a, b):
    L = open(path, encoding='utf-8').read().split('\n')[a-1:b]
    return L

def english_chapters(lines):
    """Split on `  CHAPTER ...` / `  PREFACE.` headings at 2-space indent; returns list of (heading, [paras])."""
    chunks, cur = [], None
    for ln in lines:
        if re.match(r'^\s{0,2}(CHAPTER [^\n]*|PREFACE\.|BOOK [A-Z ]+\.?)\s*$', ln):
            cur = [ln.strip(), []]; chunks.append(cur); continue
        if cur is None: continue
        cur[1].append(ln)
    res = []
    for h, ls in chunks:
        txt = '\n'.join(l for l in ls if not re.match(r'^\s*_{10,}\s*$', l))
        paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', txt)]
        res.append((h, [p for p in paras if p]))
    return res
