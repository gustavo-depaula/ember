"""Fetch a document from one of the surveyed sites and turn it into Markdown.

Every extractor returns `Extract(title, markdown)` with the text untouched:
only site chrome (language bars, share buttons, related posts, copyright
lines) is removed, and footnotes become Markdown footnotes where the page
links them. Pages with no usable text raise `NoText`.
"""
from __future__ import annotations

import hashlib
import re
import subprocess
import tempfile
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "scripts" / "_cache" / "magisterium"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
# vatican.va's robots.txt asks for Crawl-delay: 2; the others get the same courtesy.
HOST_DELAY = {"www.vatican.va": 2.0}
DEFAULT_DELAY = 1.0


class NoText(Exception):
    """The source has no usable text for this document (404, scan-only PDF, empty page)."""


@dataclass
class Extract:
    title: str
    markdown: str


_host_locks: dict[str, threading.Lock] = {}
_host_last: dict[str, float] = {}
_registry_lock = threading.Lock()


def fetch(url: str) -> bytes:
    key = hashlib.sha1(url.encode()).hexdigest()
    f = CACHE / key[:2] / key
    if f.exists():
        data = f.read_bytes()
        if not data:
            raise NoText(f"404: {url}")
        return data
    host = urlparse(url).netloc
    with _registry_lock:
        lock = _host_locks.setdefault(host, threading.Lock())
    with lock:
        wait = _host_last.get(host, 0) + HOST_DELAY.get(host, DEFAULT_DELAY) - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        data = None
        for attempt in range(5):
            try:
                req = urllib.request.Request(url.replace(" ", "%20"), headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = r.read()
                break
            except urllib.error.HTTPError as e:
                if e.code in (404, 410):
                    data = b""
                    break
                time.sleep(2 ** attempt * 2)
            except Exception:
                time.sleep(2 ** attempt * 2)
        _host_last[host] = time.monotonic()
    if data is None:
        raise RuntimeError(f"fetch failed after retries: {url}")
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_bytes(data)
    if not data:
        raise NoText(f"404: {url}")
    return data


def decode(data: bytes) -> str:
    # The /content/ CMS and WordPress sites are UTF-8; vatican.va's archive is Latin-1.
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("cp1252", errors="replace")


# ---------------------------------------------------------------- Markdown

NOTE_ANCHOR = re.compile(r"^_?(?:ftn|edn|sdfootnote|sdendnote|footnote|endnote|fn|nota?)(\d+)(?:sym)?$", re.I)
NOTE_REF = re.compile(r"#_?(?:ftn|edn|sdfootnote|sdendnote|footnote|endnote|fn|nota?)(\d+)(?:sym)?$", re.I)
NOTE_LABEL = re.compile(r"^\s*\\?[\[(]?\s*\d+\s*\\?[\])]?\.?\s*")


def pandoc(html: str) -> str:
    # vatican.va sets title blocks as <b>A<br>B</b>; pandoc then closes the emphasis
    # on a line of its own ("*" alone), which Markdown reads as an empty list item.
    # Inside emphasis a <br> is layout, so it becomes a space.
    html = re.sub(r"<(b|i|em|strong)\b([^>]*)>(.*?)</\1>",
                  lambda m: f"<{m.group(1)}{m.group(2)}>{re.sub(r'<br\s*/?>', ' ', m.group(3), flags=re.I)}</{m.group(1)}>",
                  html, flags=re.I | re.S)
    out = subprocess.run(
        ["pandoc", "-f", "html", "-t", "gfm-raw_html", "--wrap=none"],
        input=html, capture_output=True, text=True, check=True,
    ).stdout
    out = re.sub(r"^[ \t\u00a0]+$", "", out, flags=re.M)
    out = re.sub(r"^[*_]+\s*$", "", out, flags=re.M)
    return out


def footnotes_to_markers(root: Tag) -> dict[int, str]:
    """Replace linked footnote references with ⟦N⟧ and pull the note bodies out.

    Word-exported pages pair `<a href="#_ftn3" name="_ftnref3">` in the text
    with `<a href="#_ftnref3" name="_ftn3">` at the note; LibreOffice exports
    use sdfootnote3anc / sdfootnote3sym. A page without such links keeps its
    notes as plain text at the end, as published."""
    notes: dict[int, str] = {}
    # A note's own anchor is named _ftn3 / sdfootnote3sym; its back-link (_ftnref3,
    # sdfootnote3anc) never matches the pattern, so name and href tell them apart.
    for a in list(root.find_all("a", attrs={"name": NOTE_ANCHOR})) + list(root.find_all("a", attrs={"id": NOTE_ANCHOR})):
        if a.parent is None:
            continue
        n = int(NOTE_ANCHOR.match(a.get("name") or a.get("id")).group(1))
        holder = a.find_parent(["p", "li", "div"]) or a.parent
        if holder is root:
            holder = a.parent
        a.decompose()
        body = NOTE_LABEL.sub("", pandoc(str(holder)).strip(), count=1).strip()
        if n not in notes and body:
            notes[n] = body
        holder.decompose()
    for a in list(root.find_all("a", href=NOTE_REF)):
        if a.parent is None:
            continue
        n = int(NOTE_REF.search(a["href"]).group(1))
        target = a.parent if a.parent.name == "sup" and a.parent.get_text(strip=True) == a.get_text(strip=True) else a
        target.replace_with(NavigableString(f"⟦{n}⟧"))
    return notes


def to_markdown(root: Tag, title: str, notes: dict[int, str] | None = None) -> str:
    body = pandoc(str(root))
    body = re.sub(r"\\?⟦(\d+)\\?⟧", r"[^\1]", body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    used = {int(n) for n in re.findall(r"\[\^(\d+)\]", body)}
    parts = [f"# {md_escape_inline(title)}", body]
    if notes:
        defs = [f"[^{n}]: {notes[n].replace(chr(10) + chr(10), chr(10) + chr(10) + '    ')}" for n in sorted(notes) if n in used]
        orphans = [f"{n}. {notes[n]}" for n in sorted(notes) if n not in used]
        if defs:
            parts.append("\n\n".join(defs))
        if orphans:
            parts.append("\n\n".join(orphans))
    return "\n\n".join(p for p in parts if p).strip() + "\n"


def md_escape_inline(s: str) -> str:
    return re.sub(r"([\\`*_\[\]])", r"\\\1", s.strip())


def md_escape_paragraph(s: str) -> str:
    s = md_escape_inline(s)
    s = re.sub(r"^(\d+)\.(\s)", r"\1\\.\2", s)
    s = re.sub(r"^([#>+\-])", r"\\\1", s)
    return s


def clean_title(t: str) -> str:
    t = re.sub(r"\s*\|.*$", "", t)
    t = re.sub(r"\s*\((?:[^()]*\d{4}[^()]*)\)\s*$", "", t)
    return re.sub(r"\s+", " ", t).strip()


# ---------------------------------------------------------------- extractors

def vatican_content(url: str) -> Extract:
    """vatican.va /content/ CMS pages (popes, Leo XIII → today, and the older-popes section)."""
    soup = BeautifulSoup(decode(fetch(url)), "html.parser")
    root = soup.select_one("div.documento .testo") or soup.select_one("div.documento")
    if not root:
        raise NoText(f"no div.documento: {url}")
    for sel in [".translation-field", "script", "style", ".logo", ".copyright", "img"]:
        for t in root.select(sel):
            t.decompose()
    for p in root.find_all(["p", "div"]):
        if re.fullmatch(r"\s*Copyright\s*©.*", p.get_text(" ", strip=True) or "", re.S) and len(p.get_text()) < 120:
            p.decompose()
    title = clean_title(soup.title.get_text() if soup.title else "")
    notes = footnotes_to_markers(root)
    if len(root.get_text(strip=True)) < 80:
        # Chinese and some other translations are published only as a PDF linked from the page.
        pdf = soup.find("a", href=re.compile(r"/content/dam/.*\.pdf$"))
        if pdf:
            return pdf_text(urljoin(url, pdf["href"]), title)
        raise NoText(f"empty page: {url}")
    return Extract(title, to_markdown(root, title, notes))


def vatican_archive(url: str) -> Extract:
    """Older vatican.va pages (Vatican II, Roman Curia): Latin-1, body in div#corpo."""
    soup = BeautifulSoup(decode(fetch(url)), "html.parser")
    root = soup.select_one("#corpo") or soup.body
    if not root:
        raise NoText(f"no body: {url}")
    for t in root.find_all(["script", "style", "img", "form"]):
        t.decompose()
    # The language bar: a run of two-letter links at the top, wrapped in [ … ].
    for el in root.find_all(["p", "div", "font", "td", "span"]):
        txt = el.get_text(" ", strip=True)
        if re.fullmatch(r"\[?\s*([A-Z]{2,3}(\s*-\s*|\s+))*[A-Z]{2,3}\s*\]?", txt or "x") and el.find("a"):
            el.decompose()
    for el in root.find_all(["p", "div", "font"]):
        txt = el.get_text(" ", strip=True)
        if re.match(r"^(Copyright|©)", txt) and len(txt) < 200:
            el.decompose()
        elif txt in ("top", "Top", "Inizio", "TOP"):
            el.decompose()
    for a in root.find_all("a", attrs={"name": "top"}):
        a.decompose()
    title = clean_title(soup.title.get_text() if soup.title else "")
    notes = footnotes_to_markers(root)
    if len(root.get_text(strip=True)) < 80:
        raise NoText(f"empty page: {url}")
    return Extract(title, to_markdown(root, title, notes))


def wordpress(url: str) -> Extract:
    """papalencyclicals.net and veritatis.com.br: WordPress, body in div.entry-content."""
    # lxml closes unclosed <p>s the way a browser does; html.parser nests the rest
    # of the article inside the first one.
    soup = BeautifulSoup(decode(fetch(url)), "lxml")
    root = soup.select_one("div.entry-content")
    if not root:
        raise NoText(f"no entry-content: {url}")
    junk = [".sharedaddy", ".jp-relatedposts", ".printfriendly", ".pf-content-print", "#jp-post-flair",
            ".wpcnt", ".fb-comments", ".fb_comments", ".crp_related", ".yarpp-related", ".addtoany_share_save_container",
            "script", "style", "noscript", "iframe", "form", ".code-block", ".adsbygoogle", "ins"]
    for sel in junk:
        for t in root.select(sel):
            t.decompose()
    # Veritatis appends comments and related posts inside the content block:
    # cut from the first such heading to the end, in document order.
    marker = next((el for el in root.find_all(["h2", "h3", "h4", "p", "div", "span"])
                   if el.get_text(strip=True) in ("Facebook Comments", "Posts Relacionados")), None)
    if marker is not None:
        for nxt in list(marker.find_all_next()):
            if nxt.parent is not None and root in nxt.parents:
                nxt.decompose()
        marker.decompose()
    for el in root.find_all(["p", "div", "span", "a"]):
        if el.parent is None:
            continue
        txt = el.get_text(" ", strip=True)
        if re.fullmatch(r"(Print\s*🖨?\s*)?(PDF\s*📄?)?", txt) and txt:
            el.decompose()
    h = soup.select_one("h1.entry-title") or soup.find("h1")
    title = clean_title(h.get_text(" ", strip=True) if h else (soup.title.get_text() if soup.title else ""))
    title = title.strip("“”\" ")
    notes = footnotes_to_markers(root)
    if len(root.get_text(strip=True)) < 80:
        raise NoText(f"empty page: {url}")
    return Extract(title, to_markdown(root, title, notes))


DCO_HEADER = re.compile(r"^\s*\d{4}(-\d{2}){0,2}\s*[-–,]")


def dco_doc(url: str, title: str) -> Extract:
    from worddoc import read_doc

    data = fetch(url)
    if data[:8] != b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1":
        raise NoText(f"not an OLE .doc: {url}")
    with tempfile.NamedTemporaryFile(suffix=".doc") as tmp:
        tmp.write(data)
        tmp.flush()
        paragraphs, notes = read_doc(tmp.name)
    paras = [p for p in paragraphs if p.strip()]
    # DCO opens each file with its own catalogue label ("1899-09-18- SS Leo XIII - Paternae").
    if paras and DCO_HEADER.match(paras[0]):
        paras = paras[1:]
    if sum(len(p) for p in paras) < 80:
        raise NoText(f"empty .doc: {url}")
    body = []
    for p in paras:
        p = md_escape_paragraph(p.replace("\t", " "))
        p = re.sub(r"\x00(\d+)\x00", r"[^\1]", p)
        p = p.replace("\n", "  \n")
        body.append(p)
    md = [f"# {md_escape_inline(title)}", "\n\n".join(body)]
    if notes:
        md.append("\n\n".join(f"[^{i}]: {md_escape_inline(n)}" for i, n in enumerate(notes, 1)))
    return Extract(title, "\n\n".join(md).strip() + "\n")


CJK = re.compile(r"[\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]")


def pdf_text(url: str, title: str) -> Extract:
    data = fetch(url)
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
        tmp.write(data)
        tmp.flush()
        try:
            pages = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", tmp.name], capture_output=True, text=True).stdout).group(1))
        except Exception:
            raise NoText(f"unreadable pdf: {url}")
        text = subprocess.run(["pdftotext", "-enc", "UTF-8", tmp.name, "-"], capture_output=True, text=True).stdout
    text = text.replace("\x0c", "\n\n")
    text = re.sub(r"[\u200e\u200f\u202a-\u202e\u2066-\u2069]", "", text)  # bidi controls from RTL PDFs
    chars = len(re.sub(r"\s", "", text))
    # A scan has no text layer, or one so thin it's just page furniture.
    if chars < 300 or chars < 150 * max(pages, 1):
        raise NoText(f"scan-only pdf ({chars} characters / {pages} pages): {url}")
    paras = []
    for block in re.split(r"\n\s*\n", text):
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if not lines:
            continue
        joined = ""
        for l in lines:
            if joined.endswith("-"):
                joined = joined[:-1] + l
            elif joined and (CJK.match(joined[-1]) or CJK.match(l[0])):
                joined += l  # Chinese and Japanese lines join without a space
            else:
                joined = joined + " " + l if joined else l
        paras.append(md_escape_paragraph(joined))
    if paras and DCO_HEADER.match(paras[0]):
        paras = paras[1:]
    return Extract(title, f"# {md_escape_inline(title)}\n\n" + "\n\n".join(paras) + "\n")


def extract(url: str, fallback_title: str) -> Extract:
    host = urlparse(url).netloc
    path = urlparse(url).path
    if path.lower().endswith(".pdf"):
        return pdf_text(url, fallback_title)
    if "vatican.va" in host and path.startswith("/content/"):
        return vatican_content(url)
    if "vatican.va" in host:
        return vatican_archive(url)
    if "papalencyclicals.net" in host or "veritatis.com.br" in host:
        return wordpress(url)
    if "documentacatholicaomnia" in host:
        if path.lower().endswith(".doc"):
            return dco_doc(url, fallback_title)
        raise NoText(f"unsupported DCO format: {url}")
    raise NoText(f"no extractor for {url}")
