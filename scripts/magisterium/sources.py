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
from collections.abc import Iterator
from contextlib import contextmanager
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
    # Crawl-delay spaces request *starts*: reserve the next slot under the lock,
    # then wait and download outside it, so a slow response doesn't hold back the next.
    with lock:
        start = max(time.monotonic(), _host_last.get(host, 0) + HOST_DELAY.get(host, DEFAULT_DELAY))
        _host_last[host] = start
    time.sleep(max(0.0, start - time.monotonic()))
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
    if data is None:
        raise RuntimeError(f"fetch failed after retries: {url}")
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_bytes(data)
    if not data:
        raise NoText(f"404: {url}")
    return data


@contextmanager
def temp_file(data: bytes, suffix: str) -> Iterator[str]:
    """`data` in a named file for the command-line tools (pdftotext, olefile)."""
    with tempfile.NamedTemporaryFile(suffix=suffix) as tmp:
        tmp.write(data)
        tmp.flush()
        yield tmp.name


def decode(data: bytes) -> str:
    # The /content/ CMS and WordPress sites are UTF-8; vatican.va's archive is Latin-1.
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("cp1252", errors="replace")


# ---------------------------------------------------------------- Markdown

NOTE_NAME = r"_?(?:ftn|edn|sdfootnote|sdendnote|footnote|endnote|fn|nota?)(\d+)(?:sym)?$"
NOTE_ANCHOR = re.compile("^" + NOTE_NAME, re.I)
NOTE_REF = re.compile("#" + NOTE_NAME, re.I)
NOTE_LABEL = re.compile(r"^\s*\\?[\[(]?\s*\d+\s*\\?[\])]?\.?\s*")
# A paragraph of its own between notes converted in one pandoc run.
NOTE_BREAK = "EMBERNOTEBREAK"
_TAGS = BeautifulSoup("", "html.parser")  # makes the <div>s that replace table cells


def unwrap_tables(root: Tag) -> None:
    """Older vatican.va pages lay the whole document out in tables, and pandoc
    replaces any table it can't draw in Markdown with "[TABLE]", text and all.
    Each cell becomes a block of its own, in reading order."""
    for table in reversed(root.find_all("table")):
        blocks = []
        for cell in table.find_all(["td", "th"]):
            if cell.find(["td", "th"]):
                continue  # a cell holding a nested table: its inner cells carry the text
            div = _TAGS.new_tag("div")
            div.extend(list(cell.contents))
            blocks.append(div)
        table.replace_with(*blocks) if blocks else table.decompose()


def number_list_items(root: Tag) -> None:
    """vatican.va often marks a document's numbered paragraphs up as an <ol>, so they
    render as a hanging-indent list beside the plainly numbered ones. Each item
    becomes a paragraph that carries its number."""
    for ol in reversed(root.find_all("ol")):
        start = int(ol.get("start") or 1) if str(ol.get("start") or "1").isdigit() else 1
        blocks = []
        for i, li in enumerate(ol.find_all("li", recursive=False)):
            div = _TAGS.new_tag("div")
            div.append(f"{start + i}. ")
            div.extend(list(li.contents))
            blocks.append(div)
        ol.replace_with(*blocks) if blocks else ol.decompose()


def unwrap_tables_html(html: str) -> str:
    if "<table" not in html.lower():
        return html
    soup = BeautifulSoup(html, "html.parser")
    unwrap_tables(soup)
    return str(soup)


def pandoc(html: str) -> str:
    # vatican.va sets title blocks as <b>A<br>B</b>; pandoc then closes the emphasis
    # on a line of its own ("*" alone), which Markdown reads as an empty list item.
    # Inside emphasis a <br> is layout, so it becomes a space.
    html = re.sub(r"<(b|i|em|strong)\b([^>]*)>(.*?)</\1>",
                  lambda m: f"<{m.group(1)}{m.group(2)}>{re.sub(r'<br\s*/?>', ' ', m.group(3), flags=re.I)}</{m.group(1)}>",
                  html, flags=re.I | re.S)
    html = unwrap_tables_html(html)
    out = subprocess.run(
        ["pandoc", "-f", "html", "-t", "gfm-raw_html", "--wrap=none"],
        input=html, capture_output=True, text=True, check=True,
    ).stdout
    out = re.sub(r"^[ \t\u00a0]+$", "", out, flags=re.M)
    # Emphasis wrapped around nothing ("* *", "** **") and quotes around nothing (">")
    # are left by layout markup; neither carries text.
    out = re.sub(r"^(?:[*_]+\s*)+$", "", out, flags=re.M)
    out = re.sub(r"^>\s*$", "", out, flags=re.M)
    # pandoc escapes "1." at a paragraph's start but not "2.", which Markdown then
    # reads as a list. Numbered HTML lists are flattened before this, so a line
    # opening with a number and a period is always a numbered paragraph.
    out = re.sub(r"^(\d+)\. ", r"\1\\. ", out, flags=re.M)
    return out


def footnotes_to_markers(root: Tag) -> dict[int, str]:
    """Replace linked footnote references with ⟦N⟧ and pull the note bodies out.

    Word-exported pages pair `<a href="#_ftn3" name="_ftnref3">` in the text
    with `<a href="#_ftnref3" name="_ftn3">` at the note; LibreOffice exports
    use sdfootnote3anc / sdfootnote3sym. A page without such links keeps its
    notes as plain text at the end, as published."""
    held: list[tuple[int, str]] = []
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
        held.append((n, str(holder)))
        holder.decompose()
    notes: dict[int, str] = {}
    for (n, _), md in zip(held, notes_to_markdown([html for _, html in held]), strict=True):
        body = NOTE_LABEL.sub("", md.strip(), count=1).strip()
        if n not in notes and body:
            notes[n] = body
    for a in list(root.find_all("a", href=NOTE_REF)):
        if a.parent is None:
            continue
        n = int(NOTE_REF.search(a["href"]).group(1))
        target = a.parent if a.parent.name == "sup" and a.parent.get_text(strip=True) == a.get_text(strip=True) else a
        target.replace_with(NavigableString(f"⟦{n}⟧"))
    return notes


def notes_to_markdown(holders: list[str]) -> list[str]:
    """Each note's HTML as Markdown, in one pandoc run for the whole page."""
    if not holders:
        return []
    out = re.split(rf"^{NOTE_BREAK}$", pandoc(f"<p>{NOTE_BREAK}</p>".join(holders)), flags=re.M)
    if len(out) != len(holders):  # a note whose own text is the marker: convert one by one
        return [pandoc(h) for h in holders]
    return out


# A copyright notice left inside a larger block (after a <br>) survives the
# element-level cleanup; drop the line when it is nothing else.
VATICAN_COPYRIGHT_LINE = re.compile(
    r"^[*_ ]*(?:Copyright\s*©|©\s*Copyright)(?:\s*\d{4})?\s*[-–]?\s*Libreria Editrice Vaticana[*_ ]*$", re.M)


def to_markdown(root: Tag, title: str, notes: dict[int, str] | None = None) -> str:
    unwrap_tables(root)
    number_list_items(root)
    body = pandoc(str(root))
    body = re.sub(r"\\?⟦(\d+)\\?⟧", r"[^\1]", body)
    body = VATICAN_COPYRIGHT_LINE.sub("", body)
    # Navigation icons (home, share, back) come through as links with no text.
    body = re.sub(r"^(?:\[\]\((?:[^()]|\([^)]*\))*\)\s*)+$", "", body, flags=re.M)
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
    # "<" too: critical editions mark conjectures as <clerum>, which Markdown reads as a tag.
    return re.sub(r"([\\`*_\[\]<])", r"\\\1", s.strip())


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

COPYRIGHT = re.compile(r"\s*(©|Copyright).*", re.S)


def is_copyright(txt: str) -> bool:
    """The publisher's copyright line ("© Copyright - Libreria Editrice Vaticana")."""
    return bool(COPYRIGHT.fullmatch(txt)) and len(txt) < 200


def finish(root: Tag, title: str, url: str) -> Extract:
    """The page's text, cleared of chrome, as Markdown with its footnotes."""
    notes = footnotes_to_markers(root)
    if len(root.get_text(strip=True)) < 80:
        raise NoText(f"empty page: {url}")
    return Extract(title, to_markdown(root, title, notes))


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
        if is_copyright(p.get_text(" ", strip=True)):
            p.decompose()
    title = clean_title(soup.title.get_text() if soup.title else "")
    # Chinese and some other translations are published as a PDF linked from a page
    # that carries only a title or a short introduction.
    pdf = soup.find("a", href=re.compile(r"/content/dam/.*\.pdf$"))
    if pdf and len(root.get_text(strip=True)) < 1500:
        return pdf_text(urljoin(url, pdf["href"]), title)
    return finish(root, title, url)


def vatican_archive(url: str) -> Extract:
    """Older vatican.va pages (Vatican II, Roman Curia): Latin-1, body in div#corpo."""
    soup = BeautifulSoup(decode(fetch(url)), "html.parser")
    root = soup.select_one("#corpo") or soup.body
    if not root:
        raise NoText(f"no body: {url}")
    for t in root.find_all(["script", "style", "img", "form"]):
        t.decompose()
    for el in root.find_all(["p", "div", "font", "td", "span"]):
        if el.parent is None:
            continue  # inside an element already dropped
        txt = el.get_text(" ", strip=True)
        # The language bar: a run of two-letter links at the top, wrapped in [ … ].
        if re.fullmatch(r"\[?\s*([A-Z]{2,3}(\s*-\s*|\s+))*[A-Z]{2,3}\s*\]?", txt or "x") and el.find("a"):
            el.decompose()
        elif el.name in ("p", "div", "font") and (is_copyright(txt) or txt in ("top", "Top", "Inizio", "TOP")):
            el.decompose()
    for a in root.find_all("a", attrs={"name": "top"}):
        a.decompose()
    title = clean_title(soup.title.get_text() if soup.title else "")
    return finish(root, title, url)


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
    return finish(root, title, url)


DCO_HEADER = re.compile(r"^\s*\d{4}(-\d{2}){0,2}\s*[-–,]")


def drop_dco_label(paras: list[str]) -> list[str]:
    """DCO opens each file with its own catalogue label ("1899-09-18- SS Leo XIII - Paternae").
    A PDF without blank lines comes out as one paragraph that begins with the label;
    that paragraph is the text, so only a short, label-only paragraph goes."""
    if paras and DCO_HEADER.match(paras[0]) and len(paras[0]) < 200:
        return paras[1:]
    return paras


def dco_doc(url: str, title: str) -> Extract:
    from worddoc import read_doc

    data = fetch(url)
    if data[:8] != b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1":
        raise NoText(f"not an OLE .doc: {url}")
    with temp_file(data, ".doc") as path:
        paragraphs, notes = read_doc(path)
    paras = [p for p in paragraphs if p.strip()]
    paras = drop_dco_label(paras)
    if sum(len(p) for p in paras) < 80:
        raise NoText(f"empty .doc: {url}")
    return Extract(title, paras_to_markdown(title, [p.replace("\t", " ") for p in paras], notes))


def paras_to_markdown(title: str, paras: list[str], notes: list[str] | None = None) -> str:
    """Plain-text paragraphs as Markdown. A footnote reference is \\x00N\\x00 in the
    text (worddoc's marker), and `notes` the footnotes' texts, from 1."""
    md = [f"# {md_escape_inline(title)}"]
    md += [re.sub(r"\x00(\d+)\x00", r"[^\1]", md_escape_paragraph(p)).replace("\n", "  \n") for p in paras]
    if notes:
        md.append("\n\n".join(f"[^{i}]: {md_escape_inline(n)}" for i, n in enumerate(notes, 1)))
    return "\n\n".join(md).strip() + "\n"


CJK = re.compile(r"[\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]")


def pdftotext(path: str) -> str:
    text = subprocess.run(["pdftotext", "-enc", "UTF-8", path, "-"], capture_output=True, text=True).stdout
    text = text.replace("\x0c", "\n\n")
    return re.sub(r"[\u200e\u200f\u202a-\u202e\u2066-\u2069]", "", text)  # bidi controls from RTL PDFs


def text_paragraphs(text: str) -> list[str]:
    """pdftotext's lines joined into paragraphs, with hyphenated words rejoined."""
    paras = []
    for block in re.split(r"\n\s*\n", text):
        joined = ""
        for l in (l.strip() for l in block.splitlines()):
            if not l:
                continue
            if joined.endswith("-"):
                joined = joined[:-1] + l
            elif joined and (CJK.match(joined[-1]) or CJK.match(l[0])):
                joined += l  # Chinese and Japanese lines join without a space
            else:
                joined = joined + " " + l if joined else l
        # Margin line numbers and stray letters from the printed page, not text.
        if joined and not re.fullmatch(r"\W*(\d{1,4}|[A-Za-z])\W*", joined):
            paras.append(joined)
    return paras


def pdf_paragraphs(data: bytes) -> list[str]:
    with temp_file(data, ".pdf") as path:
        return text_paragraphs(pdftotext(path))


def pdf_text(url: str, title: str) -> Extract:
    with temp_file(fetch(url), ".pdf") as path:
        try:
            pages = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", path], capture_output=True, text=True).stdout).group(1))
        except Exception:
            raise NoText(f"unreadable pdf: {url}")
        text = pdftotext(path)
    chars = len(re.sub(r"\s", "", text))
    # A scan has no text layer, or one so thin it's just page furniture.
    if chars < 300 or chars < 150 * max(pages, 1):
        raise NoText(f"scan-only pdf ({chars} characters / {pages} pages): {url}")
    paras = drop_dco_label(text_paragraphs(text))
    if sum(len(p) for p in paras) < 80:
        raise NoText(f"no text after the catalogue label: {url}")
    return Extract(title, paras_to_markdown(title, paras))


SCRIPTS = {
    "grc": r"[\u0370-\u03ff\u1f00-\u1fff]", "el": r"[\u0370-\u03ff\u1f00-\u1fff]",
    "ar": r"[\u0600-\u06ff]", "he": r"[\u0590-\u05ff]",
    "ru": r"[\u0400-\u04ff]", "uk": r"[\u0400-\u04ff]", "be": r"[\u0400-\u04ff]",
    "zh": r"[\u3400-\u9fff]", "zh-cn": r"[\u3400-\u9fff]", "zh-tw": r"[\u3400-\u9fff]",
    "ja": r"[\u3040-\u30ff\u3400-\u9fff]",
}


def check_script(lang: str, ex: Extract) -> None:
    """Sources sometimes label a file with the wrong language (DCO files a French
    translation as Greek). For languages with their own script, most letters must be in it."""
    pattern = SCRIPTS.get(lang.lower())
    if not pattern:
        return
    letters = re.findall(r"[^\W\d_]", ex.markdown)
    if letters and len(re.findall(pattern, ex.markdown)) / len(letters) < 0.3:
        raise NoText(f"labelled {lang} but not written in its script")


def extract(url: str, fallback_title: str, lang: str | None = None) -> Extract:
    """The document at `url`; with `lang`, also checked to be written in that language's script."""
    ex = _extract(url, fallback_title)
    if not ex.title.strip():
        # Some archive pages have an empty <title>; the inventory's title stands in.
        ex = Extract(fallback_title, re.sub(r"\A# *\n", f"# {md_escape_inline(fallback_title)}\n", ex.markdown))
    if lang:
        check_script(lang, ex)
    return ex


def _extract(url: str, fallback_title: str) -> Extract:
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
