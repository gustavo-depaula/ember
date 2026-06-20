#!/usr/bin/env python3
"""Scrape ecatholic2000 CTS saint booklets into a raw staging area.
Faithful import only — no editorial transformation. Integration decided later.
"""
import re, html, json, time, sys, urllib.request, pathlib

BASE = "https://www.ecatholic2000.com/cts/"
OUT = pathlib.Path(sys.argv[1])
MD = OUT / "md"
MD.mkdir(parents=True, exist_ok=True)
LIST = pathlib.Path("/tmp/cts_saints_list.tsv")

UA = "Mozilla/5.0 (compatible; ember-content-import/1.0; +https://ember.dpgu.me)"

def slugify(s):
    s = s.lower()
    s = re.sub(r"&[a-z]+;", " ", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return re.sub(r"-+", "-", s)

def fetch(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            if i == tries - 1:
                raise
            time.sleep(2)

def clean(frag):
    t = html.unescape(re.sub(r"<[^>]+>", " ", frag))
    return re.sub(r"\s+", " ", t).strip()

def is_heading(p):
    # short, mostly uppercase, no terminal sentence punctuation mid-text
    if len(p) > 70 or len(p) < 2:
        return False
    letters = [c for c in p if c.isalpha()]
    if not letters:
        return False
    upper = sum(1 for c in letters if c.isupper()) / len(letters)
    return upper > 0.85

entries = []
for line in LIST.read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    fname, title = line.split("\t", 1)
    entries.append((fname.strip(), title.strip().lstrip("-").strip()))

manifest = []
used = set()
fail = []
for i, (fname, link_title) in enumerate(entries, 1):
    src_id = fname.replace(".shtml", "")
    url = BASE + fname
    try:
        h = fetch(url)
    except Exception as e:
        fail.append((src_id, link_title, str(e)))
        print(f"[{i:3}/{len(entries)}] FAIL {src_id}: {e}", flush=True)
        continue

    m = re.search(r'<h2[^>]*id="navPoint[^"]*"[^>]*>(.*?)</h2>', h, re.S)
    title = clean(m.group(1)) if m else link_title
    paras = re.findall(r'<p class="INRI"[^>]*>(.*?)</p>', h, re.S)
    paras = [clean(p) for p in paras]
    paras = [p for p in paras if p and set(p) != {"*"}]  # drop "*****" separators

    author = ""
    body = list(paras)
    if body and re.match(r"^(BY|by)\b", body[0]):
        author = re.sub(r"^by\s+", "", body[0], flags=re.I).strip()
        body = body[1:]

    # build markdown
    md_lines = []
    for p in body:
        if is_heading(p):
            md_lines.append(f"\n## {p.title() if p.isupper() else p}\n")
        else:
            md_lines.append(p + "\n")
    body_md = "\n".join(md_lines).strip()

    slug = slugify(title) or src_id
    if slug in used:
        slug = f"{slug}-{src_id.replace('untitled-','')}"
    used.add(slug)

    fm = [
        "---",
        f"source_id: {src_id}",
        f"title: {json.dumps(title, ensure_ascii=False)}",
        f"author: {json.dumps(author, ensure_ascii=False)}",
        f"link_title: {json.dumps(link_title, ensure_ascii=False)}",
        f"source_url: {url}",
        "source_collection: Catholic Truth Society (CTS) booklets, via ecatholic2000.com",
        f"paragraphs: {len(body)}",
        "---",
        "",
    ]
    (MD / f"{slug}.md").write_text("\n".join(fm) + f"# {title}\n\n" + body_md + "\n", encoding="utf-8")

    manifest.append({
        "slug": slug,
        "source_id": src_id,
        "title": title,
        "author": author,
        "link_title": link_title,
        "source_url": url,
        "paragraphs": len(body),
        "chars": len(body_md),
    })
    print(f"[{i:3}/{len(entries)}] OK {slug}  ({len(body)} paras, author={author or '—'})", flush=True)
    time.sleep(0.6)

(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nDONE: {len(manifest)} ok, {len(fail)} failed")
if fail:
    for f in fail:
        print("  FAILED:", f)
