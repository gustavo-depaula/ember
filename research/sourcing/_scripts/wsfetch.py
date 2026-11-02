"""Fetch es.wikisource wikitext (MediaWiki API, one request at a time) and turn it into markdown."""
import json, re, time, urllib.parse, urllib.request
from pathlib import Path
UA = "EmberCorpusResearch/1.0"

def api(**p):
    url = "https://es.wikisource.org/w/api.php?" + urllib.parse.urlencode({**p, "format": "json", "formatversion": 2})
    for k in range(6):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60)
            d = json.load(r)
            if "error" not in d: return d
        except Exception:
            pass
        time.sleep(3 * (k + 1))
    raise RuntimeError(url)

def pages(prefix):
    out, cont = [], {}
    while True:
        d = api(action="query", list="allpages", apprefix=prefix, aplimit=500, **cont)
        out += [p["title"] for p in d["query"]["allpages"]]
        if "continue" not in d: return out
        cont = {"apcontinue": d["continue"]["apcontinue"]}

CACHE = Path("/Users/gustavo/Documents/prayer/research/sourcing/luis-de-leon/raw")

def raw(title):
    url = "https://es.wikisource.org/w/index.php?" + urllib.parse.urlencode({"title": title, "action": "raw"})
    for k in range(5):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=90).read().decode("utf-8")
        except Exception:
            time.sleep(4 * (k + 1))
    raise RuntimeError(url)

def wikitext(title):
    f = CACHE / (re.sub(r"[^\w]+", "_", title) + ".wt")
    if f.exists(): return f.read_text(encoding="utf-8")
    time.sleep(0.5)
    try:
        t = api(action="parse", page=title, prop="wikitext", redirects=1)["parse"]["wikitext"]
    except RuntimeError:
        t = raw(title)
    CACHE.mkdir(parents=True, exist_ok=True)
    f.write_text(t, encoding="utf-8")
    return t

def to_md(wt):
    s = wt
    s = re.sub(r"\{\{Encabezado.*?\}\}", "", s, flags=re.S | re.I)
    s = re.sub(r"\{\{(?:Pie|Plantilla:Pie|Fin|Navegación)[^}]*\}\}", "", s, flags=re.I)
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"<poem[^>]*>(.*?)</poem>", lambda m: "\n\n" + re.sub(r"[ \t]*\n(?!\s*\n)", "  \n", m.group(1).strip()) + "\n\n", s, flags=re.S)
    s = re.sub(r"[ \t]*<br\s*/?>[ \t]*\n", "  \n", s)
    s = re.sub(r"\{\{DP[^{}]*\}\}", "", s)
    s = re.sub(r"(?:\{\{bc\||<pre>)(.*?)(?:\}\}|</pre>)", lambda m: "\n\n" + re.sub(r"[ \t]*\n(?!\s*\n)", "  \n", m.group(1).strip()) + "\n\n", s, flags=re.S)
    # footnotes
    notes = []
    def ref(m):
        notes.append(m.group(1).strip()); return f"[^{len(notes)}]"
    s = re.sub(r"<ref[^>/]*>(.*?)</ref>", ref, s, flags=re.S)
    s = re.sub(r"<ref[^>]*/>", "", s)
    s = re.sub(r"\{\{[tT]([1-5])\|([^{}]*)\}\}", lambda m: "\n\n" + ("##" if int(m.group(1)) <= 3 else "###") + " " + m.group(2) + "\n\n", s)
    s = re.sub(r"\{\{(?:sc|versalita|VERSALITA|Versalita|Tamaño|nobr|nowrap)\|([^{}|]*)(?:\|[^{}]*)?\}\}", r"\1", s)
    s = re.sub(r"\{\{[cC]\|([^{}|]*)(?:\|[^{}]*)?\}\}", r"\n\n\1\n\n", s)
    s = re.sub(r"\{\{(?:nop|nl|clear|-|salto de página)[^{}]*\}\}", "", s, flags=re.I)
    s = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", s)
    s = re.sub(r"'''(.+?)'''", r"**\1**", s)
    s = re.sub(r"''(.+?)''", r"*\1*", s)
    s = re.sub(r"[ \t]*<br\s*/?>[ \t]*\n", "  \n", s)
    s = re.sub(r"<br\s*/?>", "\n", s)
    s = re.sub(r"</?(?:poem|center|div|span|small|big|blockquote|sup|sub)[^>]*>", "", s)
    s = re.sub(r"^=+\s*(.*?)\s*=+\s*$", lambda m: "\n\n## " + m.group(1) + "\n\n", s, flags=re.M)
    s = re.sub(r"[ \t]+\n", "\n", s)
    s = re.sub(r"\n{3,}", "\n\n", s).strip()
    if notes:
        s += "\n\n" + "\n\n".join(f"[^{i}]: {n}" for i, n in enumerate(notes, 1))
    return s + "\n"

def leftovers(md):
    return sorted(set(re.findall(r"\{\{[^}]{0,40}|<[a-z/][^>]{0,30}>|__\w+__", md)))
