#!/usr/bin/env python3
"""Import "A Big Book of Little Offices" (lobvm.com) into Ember content.

One-time (idempotent) generator: parses the book's LaTeX source and emits one
practice per office (manifest.json + flow.json) plus a collection that
organizes them in book order. Run:

    python3 scripts/import-little-offices.py

The .tex source is fetched from lobvm.com and cached under scripts/.cache/
(gitignored). Re-running overwrites previously generated offices; orphaned
dirs from earlier runs are pruned via scripts/.cache/generated-offices.json.

Faithful import: Latin (`la`) for every office, English (`en-US`) only where
the source already prints a translation. No machine translation, no pt-BR body.
See docs/journal.md.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
PRACTICES = CONTENT / "practices"
COLLECTIONS = CONTENT / "collections"
CACHE = Path(__file__).resolve().parent / ".cache"
TEX_URL = "https://www.lobvm.com/assets/books/BigBookOfLittleOffices.tex"
TEX_PATH = CACHE / "BigBookOfLittleOffices.tex"
LEDGER = CACHE / "generated-offices.json"

# ---------------------------------------------------------------------------
# Canonical hours
# ---------------------------------------------------------------------------

# id -> (en-US, pt-BR) display names. The `la` label uses the actual header
# text found in the source (more faithful), filled in per office.
HOUR_NAMES = {
    "matins": ("Matins", "Matinas"),
    "lauds": ("Lauds", "Laudes"),
    "prime": ("Prime", "Prima"),
    "terce": ("Terce", "Terça"),
    "sext": ("Sext", "Sexta"),
    "none": ("None", "Nona"),
    "vespers": ("Vespers", "Vésperas"),
    "compline": ("Compline", "Completas"),
}
HOUR_ORDER = list(HOUR_NAMES.keys())

# Normalized header token -> canonical hour id.
HOUR_ALIASES = {
    "matins": "matins", "matutinum": "matins", "mattutinum": "matins",
    "matutinas": "matins", "matin": "matins", "ad matutinum": "matins",
    "lauds": "lauds", "laudes": "lauds", "laud": "lauds",
    "prime": "prime", "prima": "prime", "primam": "prime",
    "terce": "terce", "tertia": "terce", "tertiam": "terce", "tierce": "terce",
    "sext": "sext", "sexta": "sext", "sextam": "sext",
    "none": "none", "nona": "none", "nonam": "none",
    "vespers": "vespers", "vespera": "vespers", "vesperas": "vespers",
    "vesperae": "vespers", "vesperam": "vespers", "evensong": "vespers",
    "compline": "compline", "completorium": "compline",
    "completorio": "compline", "complin": "compline",
    "vigilias": "matins", "vigiliae": "matins", "vigils": "matins",
    "vigil": "matins", "vigilia": "matins",
    "officium noc": "matins", "officium nocturnum": "matins",
    "nocturnum": "matins", "teriam": "terce", "tertiae": "terce",
    "tierce": "terce", "noctis": "matins",
}


def hour_for(header: str) -> str | None:
    """Map a (cleaned) block header to a canonical hour id, else None."""
    t = header.strip().lower().rstrip(".:")
    for prefix in ("ad ", "at ", "the "):
        if t.startswith(prefix):
            t = t[len(prefix):]
    t = t.strip()
    if t in HOUR_ALIASES:
        return HOUR_ALIASES[t]
    # First word fallback (e.g. "Antiphona Apoc. 12" is NOT a header here, but
    # "Vesperae I" or "Matutinum." should match on the leading word).
    first = t.split()[0] if t.split() else ""
    return HOUR_ALIASES.get(first)


# ---------------------------------------------------------------------------
# LaTeX cleaning
# ---------------------------------------------------------------------------

def _match_brace(s: str, open_idx: int) -> int:
    depth = 0
    for i in range(open_idx, len(s)):
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return i
    return -1


def _strip_textcolor(s: str) -> str:
    pat = "\\textcolor{"
    while True:
        idx = s.find(pat)
        if idx == -1:
            return s
        c1 = idx + len(pat) - 1
        close1 = _match_brace(s, c1)
        if close1 == -1:
            return s[:idx] + s[idx + len(pat):]
        j = close1 + 1
        if j < len(s) and s[j] == "{":
            close2 = _match_brace(s, j)
            if close2 == -1:
                return s[:idx] + s[j + 1:]
            s = s[:idx] + s[j + 1:close2] + s[close2 + 1:]
        else:
            s = s[:idx] + s[close1 + 1:]


def _unwrap(s: str, cmds: tuple[str, ...]) -> str:
    changed = True
    while changed:
        changed = False
        for cmd in cmds:
            pat = "\\" + cmd + "{"
            idx = s.find(pat)
            while idx != -1:
                bo = idx + len(pat) - 1
                close = _match_brace(s, bo)
                if close == -1:
                    break
                s = s[:idx] + s[bo + 1:close] + s[close + 1:]
                changed = True
                idx = s.find(pat)
    return s


# "O"-initial Latin words that are a single token (don't split into "O ...").
_O_JOIN = {"omnipotens", "ominpotens", "omnipotentem", "omnipotentis",
           "oremus", "oratio", "omnium", "omnis", "omnia", "omne", "omnino",
           "obsecro", "omnipotente"}


def _strip_lettrine(s: str) -> str:
    # \lettrine[opt]{A}{rest}  and  \reddropcap{Word} / \blackdropcap{Word}
    for cmd in ("lettrine", "leslettrine", "caplettrine"):
        pat = "\\" + cmd
        while True:
            idx = s.find(pat)
            if idx == -1:
                break
            i = idx + len(pat)
            # optional [..]
            if i < len(s) and s[i] == "[":
                j = s.find("]", i)
                if j != -1:
                    i = j + 1
            while i < len(s) and s[i] == " ":
                i += 1
            if i >= len(s) or s[i] != "{":
                s = s[:idx] + s[i:]
                continue
            c1 = _match_brace(s, i)
            a = s[i + 1:c1]
            k = c1 + 1
            while k < len(s) and s[k] == " ":
                k += 1
            b = ""
            end = c1 + 1
            if k < len(s) and s[k] == "{":
                c2 = _match_brace(s, k)
                b = s[k + 1:c2]
                end = c2 + 1
            # vocative "O" + word ("O dulcis") vs single word ("Omnipotens")
            joined = a + b
            if a == "O" and joined.lower() not in _O_JOIN and len(b) >= 2:
                joined = a + " " + b
            s = s[:idx] + joined + s[end:]
    for cmd in ("reddropcap", "blackdropcap"):
        s = _unwrap(s, (cmd,))
    return s


_LAYOUT_CMD = re.compile(
    r"\\(markright|markboth|addcontentsline|fancyhead|setlength|thispagestyle"
    r"|pagestyle|vspace|hspace|label|hypertarget|phantomsection|index|def"
    r"|columnseprulecolor|colseprulecolor|setl: )?"
)

_ARG_CMD = re.compile(
    r"\\(markright|markboth|addcontentsline|fancyhead|setlength|thispagestyle"
    r"|pagestyle|vspace|hspace|label|hypertarget|index)"
    r"(\[[^\]]*\])?(\{[^{}]*\})*"
)


def _strip_balanced(s: str, cmd: str) -> str:
    """Remove `\\cmd[opt]{...}` including nested braces (e.g. \\fancyhead)."""
    while True:
        mm = re.search(r"\\" + cmd + r"(\[[^\]]*\])?\{", s)
        if not mm:
            return s
        close = _match_brace(s, mm.end() - 1)
        if close == -1:
            return s
        s = s[:mm.start()] + s[close + 1:]


def clean_latex(s: str) -> str:
    # repair source typo: bare `textcolor{` missing its leading backslash
    s = re.sub(r"(?<![\\a-zA-Z])textcolor\{", r"\\textcolor{", s)
    # nested-brace layout commands the simple arg-stripper can't handle
    s = _strip_balanced(s, "fancyhead")
    # comments (unescaped %)
    s = re.sub(r"(?<!\\)%.*", "", s)
    # environments
    s = re.sub(r"\\(begin|end)\{[^}]*\}(\{[^}]*\})?", " ", s)
    # arg-taking layout commands
    s = _ARG_CMD.sub(" ", s)
    s = re.sub(r"\\(newpage|null|noindent|centering|small|par|smallskip"
               r"|bigskip|medskip|clearpage|columnbreak|maketitle|tableofcontents"
               r"|frontmatter|mainmatter|hrule|hfill|vfill)\b", " ", s)
    s = _strip_textcolor(s)
    # inline color switch `{\color{red} ...}` — drop the switch + its color arg,
    # keeping the wrapped content (the surrounding braces fall away later)
    s = re.sub(r"\\color\{[^}]*\}", "", s)
    s = _strip_lettrine(s)
    s = _unwrap(s, ("textbf", "textit", "emph", "small", "uline", "ul",
                    "textsc", "red", "black", "underline", "textmd",
                    "textrm", "textnormal", "MakeUppercase", "uppercase",
                    "mbox", "text"))
    # versicle / response glyphs
    s = s.replace("\\Vbar", "℣").replace("\\Rbar", "℟")
    s = s.replace("℣..", "℣.").replace("℟..", "℟.")
    s = s.replace("\\dag", "†").replace("\\dagger", "†")
    # line breaks (incl. stray triple-backslash runs) inside braced groups
    s = re.sub(r"\\{2,}(\[[^\]]*\])?", "\n", s)
    # escaped specials & spacing macros
    s = (s.replace("\\&", "&").replace("\\%", "%").replace("\\#", "#")
          .replace("\\_", "_").replace("\\$", "$").replace("\\{", "{")
          .replace("\\}", "}").replace("~", " ")
          .replace("\\,", " ").replace("\\;", " ").replace("\\:", " ")
          .replace("\\!", "").replace("\\ ", " "))
    # any remaining backslash command
    s = re.sub(r"\\[a-zA-Z@]+(\[[^\]]*\])?", "", s)
    s = re.sub(r"\\(.)", r"\1", s)  # stray escaped punctuation
    s = s.replace("\\", "")  # any surviving lone backslash
    # source quirk: a verb ending "-ant" typeset as a red "Ant." glued to the
    # stem (dissipab\textcolor{red}{Ant.} → "dissipabAnt.") — restore lowercase
    s = re.sub(r"([a-z])Ant\b", r"\1ant", s)
    # leftover lone braces
    s = s.replace("{", "").replace("}", "")
    # whitespace per line, preserve newlines
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in s.split("\n")]
    lines = [ln for ln in lines]
    out = "\n".join(lines)
    out = re.sub(r"\n{2,}", "\n", out).strip()
    # space before punctuation
    out = re.sub(r"\s+([,.;:!?])", r"\1", out)
    return out


def split_logical(s: str) -> list[str]:
    """Split on `\\\\` at brace depth 0 (so multi-line braced groups survive)."""
    out, cur, depth, i = [], [], 0, 0
    while i < len(s):
        ch = s[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        if ch == "\\" and i + 1 < len(s) and s[i + 1] == "\\" and depth <= 0:
            out.append("".join(cur))
            cur = []
            i += 2
            if i < len(s) and s[i] == "[":  # \\[2ex] spacing
                j = s.find("]", i)
                if j != -1:
                    i = j + 1
            continue
        cur.append(ch)
        i += 1
    out.append("".join(cur))
    return out


def _leading_wrap(s: str):
    """If s begins with a LaTeX wrapper, return (inner_raw, remainder_raw)."""
    s = s.lstrip()
    if s.startswith("\\textcolor{"):
        c1 = _match_brace(s, s.find("{"))   # closes {color}
        if c1 == -1:
            return None
        j = c1 + 1
        if j < len(s) and s[j] == "{":
            c2 = _match_brace(s, j)
            if c2 == -1:
                return None
            return s[j + 1:c2], s[c2 + 1:]
        return "", s[c1 + 1:]
    for cmd in ("textit", "textbf", "emph", "small", "textsc", "red", "black"):
        pat = "\\" + cmd + "{"
        if s.startswith(pat):
            o = len(pat) - 1
            c = _match_brace(s, o)
            if c == -1:
                return None
            return s[o + 1:c], s[c + 1:]
    return None


def _leading_rubric(raw: str):
    """If raw starts with a *red* instruction/label span (not a V/R marker),
    return (label_text, remainder_raw); else (None, raw)."""
    w = _leading_wrap(raw)
    if not w:
        return None, raw
    inner, rest = w
    if "\\Vbar" in inner or "\\Rbar" in inner:
        return None, raw  # versicle marker → prayed text
    red = raw.lstrip().startswith("\\textcolor{red}") \
        or "\\textcolor{red}" in inner
    if not red:
        return None, raw  # italic emphasis inside prayed text — leave inline
    label = clean_latex(inner)
    if not label:
        return None, raw
    return label, rest


# ---------------------------------------------------------------------------
# Block parsing -> flow sections (single language)
# ---------------------------------------------------------------------------

_LABEL_NORM = {
    "hymnus": "Hymn", "hymn": "Hymn",
    "ant": "Antiphon", "ant.": "Antiphon", "antiphona": "Antiphon",
    "antiphon": "Antiphon", "antienne": "Antiphon",
    "capitulum": "Chapter", "chapter": "Chapter", "lectio": "Reading",
    "oratio": "Prayer", "versus": "Versicle",
}


def normalize_label(label: str) -> str:
    key = label.strip().lower().rstrip(".:")
    base = key.split()[0] if key.split() else key
    if key in _LABEL_NORM:
        return _LABEL_NORM[key]
    if base in _LABEL_NORM:
        # keep any citation suffix (e.g. "Antiphona Apoc. 12")
        suffix = label.strip()[len(base):].strip(" .:")
        norm = _LABEL_NORM[base]
        return f"{norm} ({suffix})" if suffix else norm
    return label.strip()


def parse_block(body: str, lang: str) -> list[dict]:
    """Parse one block body into flow sections keyed by `lang`."""
    sections: list[dict] = []
    buf: list[str] = []

    def flush():
        if buf:
            text = "\n".join(buf).strip("\n")
            if text.strip():
                sections.append({"type": "prayer", "inline": {lang: text}})
            buf.clear()

    paragraphs = re.split(r"\n\s*\n", body)
    for para in paragraphs:
        if not para.strip():
            continue
        for seg in split_logical(para):
            if not seg.strip():
                continue
            label, rest = _leading_rubric(seg.strip())
            if label is not None:
                flush()
                sections.append(
                    {"type": "rubric", "text": {lang: normalize_label(label)}}
                )
                rest_clean = clean_latex(rest)
                if rest_clean:
                    buf.append(rest_clean)
                continue
            cleaned = clean_latex(seg)
            if cleaned:
                buf.append(cleaned)
        flush()
    return sections


# Distinctive vocabulary for per-block language detection. The book's columns
# aren't reliably ordered (some offices put Latin on the right), and a few
# offices are English-only despite the Latin-only layout — so detect, don't
# assume.
_LA_WORDS = set(
    "et qui quae quod cujus deus domine dominus nobis nostra nostrae nostris "
    "per cum non tibi tuam tuae tuo tuis saecula saeculorum ora pro sancta "
    "sanctae sancti gloria patri filio meum mea ut ex sit ejus eius omnium "
    "beata virgo regnas vivis sunt sicut quia atque nunc semper laudamus "
    "quoniam autem nostro nostrum est in ad te "
    # liturgical rubric vocabulary
    "lectio lectiones capitulum responsorium benedictio absolutio antiphona "
    "hymnus psalmus oratio feria dominica adventus nativitate".split()
)
_EN_WORDS = set(
    "the and of to thy thee thou who whom that with our us may hath art from "
    "world through grant lord god holy blessed mercy heart thine unto whose "
    "let we shall their his him her they all into "
    # liturgical rubric vocabulary
    "lesson lessons little chapter during advent responsory response blessing "
    "absolution anthem before after said sung following first second third "
    "week sunday christmas easter candlemas".split()
)


def detect_lang(text: str) -> str:
    toks = re.findall(r"[a-zA-Z]+", text.lower())
    la = sum(t in _LA_WORDS for t in toks)
    en = sum(t in _EN_WORDS for t in toks)
    return "en-US" if en > la else "la"


def _merge_two(a: dict, b: dict) -> dict:
    node = {"type": a["type"]}
    key = "inline" if a["type"] == "prayer" else "text"
    if key in a or key in b:
        node[key] = {**a.get(key, {}), **b.get(key, {})}
    else:
        node.update({k: v for k, v in a.items() if k != "type"})
    return node


# Canonical rubric labels that translate to the same token in both columns
# (normalize_label maps Hymnus/Hymn→"Hymn", Ant./Antiphona→"Antiphon", …), so
# they are reliable cross-language alignment anchors.
_ANCHOR_LABELS = {"Hymn", "Antiphon", "Chapter", "Reading", "Prayer",
                  "Versicle", "Responsory"}


def _anchor_key(node: dict):
    if node.get("type") == "rubric":
        t = node.get("text", {})
        base = (t.get("en-US") or t.get("la") or "").split(" (")[0].strip()
        if base in _ANCHOR_LABELS:
            return base
    return None


def _collapse(nodes: list[dict]) -> dict:
    """Concatenate a run of nodes into one {lang: text} dict (absorbing any
    non-anchor sub-rubrics as plain lines)."""
    keys: dict[str, list[str]] = {}
    for n in nodes:
        d = n.get("inline") or n.get("text") or {}
        for k, v in d.items():
            if v:
                keys.setdefault(k, []).append(v)
    return {k: "\n".join(vs) for k, vs in keys.items()}


def _segment(nodes: list[dict]):
    """Split into segments at anchor rubrics: [(anchor|None, [nodes]), ...].
    The first segment's anchor is None (content before any anchor)."""
    segs = [(None, [])]
    for n in nodes:
        k = _anchor_key(n)
        if k:
            segs.append((k, []))
        else:
            segs[-1][1].append(n)
    return segs


def merge_bilingual(a: list[dict], b: list[dict]) -> list[dict]:
    """Align two parsed columns on canonical-label anchors, then pair the
    content of each anchor-delimited segment as a whole. Guarantees each
    language's sequence stays complete and correctly positioned even when the
    columns split paragraphs/rubrics differently (e.g. S. Benedict)."""
    sa, sb = _segment(a), _segment(b)
    ka, kb = [s[0] for s in sa], [s[0] for s in sb]
    out: list[dict] = []

    def emit(anchor, la_nodes, en_nodes):
        if anchor:
            out.append({"type": "rubric", "text": {"la": anchor, "en-US": anchor}})
        inline: dict[str, str] = {}
        for blob in (_collapse(la_nodes), _collapse(en_nodes)):
            for k, v in blob.items():
                inline[k] = inline[k] + "\n" + v if k in inline else v
        if inline:
            out.append({"type": "prayer", "inline": inline})

    for tag, i1, i2, j1, j2 in SequenceMatcher(None, ka, kb, autojunk=False).get_opcodes():
        if tag == "equal":
            for off in range(i2 - i1):
                emit(ka[i1 + off], sa[i1 + off][1], sb[j1 + off][1])
        else:  # anchor mismatch — keep each side's content, unpaired
            for x in range(i1, i2):
                emit(ka[x], sa[x][1], [])
            for y in range(j1, j2):
                emit(kb[y], [], sb[y][1])
    return out


# ---------------------------------------------------------------------------
# Office extraction
# ---------------------------------------------------------------------------

class Office:
    def __init__(self, title, part, attribution, intro, blocks, bilingual):
        self.title = title
        self.part = part
        self.attribution = attribution
        self.intro = intro
        self.blocks = blocks  # list of (header, la_body, en_body|None)
        self.bilingual = bilingual


CENTER_RE = re.compile(r"\\begin\{center\}(.*?)\\end\{center\}", re.DOTALL)


def _bold_extract(inner: str):
    """First \\textbf{...} content via brace matching (handles nested
    \\textcolor inside the bold). Returns (content, start, end) or None."""
    idx = inner.find("\\textbf{")
    if idx == -1:
        return None
    bo = idx + len("\\textbf")
    close = _match_brace(inner, bo)
    if close == -1:
        return None
    return inner[bo + 1:close], idx, close + 1

# Centered-bold labels that are sub-sections WITHIN an hour (not hour/structural
# delimiters). Some offices typeset these as their own \begin{center}\textbf{}
# block (e.g. Child Jesus); they must fold into the current hour as a rubric,
# not split it.
_SUBLABELS = {
    "hymnus", "hymn", "antiphon", "ant", "antiphona", "antienne",
    "capitulum", "chapter", "lectio", "reading", "responsorium", "versus",
    "versicle", "oremus", "oratio", "preces", "invitatorium", "invitatory",
    "psalmus", "psalm", "benedictio", "bened", "absolutio", "nocturn",
    "antiphona finalis", "responsory",
}


def _is_sublabel(name: str) -> bool:
    k = name.strip().lower().rstrip(".:")
    if not k:
        return False
    return k in _SUBLABELS or k.split()[0] in _SUBLABELS


def _fold_centers(body: str) -> str:
    """Unwrap leftover \\begin{center} blocks: bold ones become inline red
    rubric labels; non-bold ones (e.g. a centered \\textcolor{red}{\\textit{Ad
    Vesperos.}}) keep their inner markup so leading-rubric detection still
    fires (the center wrapper would otherwise mask it)."""
    def repl(m):
        inner = m.group(1)
        if "\\textbf" in inner:
            be = _bold_extract(inner)
            name = be[0] if be else inner
            return "\\textcolor{red}{\\textit{" + name + "}}\\\\\n"
        return inner.strip() + "\\\\\n"
    return CENTER_RE.sub(repl, body)


def split_blocks(text: str):
    """Split a column/region into (header, body) blocks on centered-bold heads.

    A delimiter is a centered-bold block whose name is NOT a sub-label. The
    bold text is the hour/section name; trailing text in the same center (e.g.
    "I. Dolor ex Simeonis Vaticinio" under "Ad Matutinum") becomes a leading
    rubric. Sub-label centers (Hymnus, Antiphon, …) fold into the body.
    """
    centers = [m for m in CENTER_RE.finditer(text) if "\\textbf" in m.group(1)]
    delim = []
    for m in centers:
        be = _bold_extract(m.group(1))
        if not _is_sublabel(clean_latex(be[0] if be else m.group(1))):
            delim.append(m)
    if not delim:
        return [(None, _fold_centers(text))]
    blocks = []
    pre = text[:delim[0].start()]
    if pre.strip():
        blocks.append((None, _fold_centers(pre)))
    for i, m in enumerate(delim):
        inner = m.group(1)
        be = _bold_extract(inner)
        name = clean_latex(be[0] if be else inner)
        subtitle = clean_latex(inner[:be[1]] + inner[be[2]:]) if be else ""
        b_start = m.end()
        b_end = delim[i + 1].start() if i + 1 < len(delim) else len(text)
        body = _fold_centers(text[b_start:b_end])
        if subtitle.strip():
            body = "\\textcolor{red}{\\textit{" + subtitle.strip() + "}}\\\\\n" + body
        blocks.append((name, body))
    return blocks


COL_RE = re.compile(
    r"\\begin\{(leftcolumn|rightcolumn)\}(.*?)(?=\\begin\{(?:left|right)column\}|\\end\{paracol\}|\Z)",
    re.DOTALL,
)


def parse_office(title, part, raw):
    # attribution: first \textbf{\begin{center}...} or \begin{center}\textbf
    attribution = ""
    am = re.search(
        r"\\textbf\{\\begin\{center\}(.*?)\\end\{center\}\}", raw, re.DOTALL
    )
    if am:
        attribution = clean_latex(am.group(1))

    bilingual = "\\begin{paracol}" in raw

    if bilingual:
        # body starts at first column
        la_text = "".join(m.group(2) for m in COL_RE.finditer(raw)
                          if m.group(1) == "leftcolumn")
        en_text = "".join(m.group(2) for m in COL_RE.finditer(raw)
                          if m.group(1) == "rightcolumn")
        intro = _intro_before(raw, r"\\begin\{paracol\}")
        la_all = split_blocks(la_text)
        en_all = split_blocks(en_text)
        la_blocks = [b for b in la_all if b[0] is not None]
        en_blocks = [b for b in en_all if b[0] is not None]
        if not la_blocks and not en_blocks:
            # headerless bilingual: whole column = one flat block
            blocks = [(None, la_text, en_text, None, None)]
        else:
            blocks = []
            n = max(len(la_blocks), len(en_blocks))
            for i in range(n):
                lb = la_blocks[i] if i < len(la_blocks) else (None, "")
                eb = en_blocks[i] if i < len(en_blocks) else (None, "")
                header = lb[0] or eb[0]
                blocks.append((header, lb[1], eb[1], lb[0], eb[0]))
    else:
        # An office may have SEVERAL \begin{multicols} blocks (e.g. S. John
        # Nepomucene splits hours across two) — don't slice to the first one.
        # multicols/columnbreak markers are layout-only; clean_latex strips
        # them, and split_blocks keys off headers, so just drop the attribution
        # and use the whole region.
        body = re.sub(r"\\textbf\{\\begin\{center\}.*?\\end\{center\}\}", "",
                      raw, flags=re.DOTALL)
        intro = _intro_before(raw, r"\\begin\{multicols\}")
        # keep headerless (None) blocks too — headerless offices render flat
        blocks = [(b[0], b[1], None, b[0], None) for b in split_blocks(body)]

    return Office(title, part, attribution, intro, blocks, bilingual)


def _intro_before(raw: str, env_pat: str) -> str:
    """Plain prose between attribution and the first content environment."""
    # drop everything up to and including the attribution textbf-center
    m = re.search(r"\\textbf\{\\begin\{center\}.*?\\end\{center\}\}", raw,
                  re.DOTALL)
    start = m.end() if m else 0
    env = re.search(env_pat, raw)
    end = env.start() if env else len(raw)
    chunk = raw[start:end]
    # strip leftover head commands
    chunk = re.sub(r"\\(fancyhead|markright|markboth|addcontentsline"
                   r"|setlength|def|thispagestyle)[^\n]*", "", chunk)
    text = clean_latex(chunk)
    return text.strip()


# ---------------------------------------------------------------------------
# Flow + manifest assembly
# ---------------------------------------------------------------------------

def _rekey(textdict: dict) -> dict:
    """Re-file substantial text values under the language they actually read in.

    Per-block detection can mis-key a value when a column mixes languages (e.g.
    English editorial rubrics inside the Latin column of the Roman BVM). Only
    re-keys strings of >=4 words (short labels are too ambiguous to detect)."""
    out: dict = {}
    for k, v in textdict.items():
        key = detect_lang(v) if isinstance(v, str) and len(v.split()) >= 4 else k
        if key in out and out[key] != v:
            out[key] += "\n" + v
        else:
            out[key] = v
    return out


def _rekey_sections(secs: list[dict]) -> list[dict]:
    for s in secs:
        for k in ("inline", "text"):
            if k in s and isinstance(s[k], dict):
                s[k] = _rekey(s[k])
    return secs


def _rekey_tree(node):
    """Recursively re-key every text/inline dict in a flow subtree."""
    if isinstance(node, dict):
        for k in ("inline", "text"):
            if k in node and isinstance(node[k], dict):
                node[k] = _rekey(node[k])
        for v in node.values():
            _rekey_tree(v)
    elif isinstance(node, list):
        for v in node:
            _rekey_tree(v)
    return node


def block_sections(block) -> list[dict]:
    header, la_body, en_body, la_head, en_head = block
    if en_body and en_body.strip():
        a = parse_block(la_body, detect_lang(la_body))
        b = parse_block(en_body, detect_lang(en_body))
        return _rekey_sections(merge_bilingual(a, b))
    return _rekey_sections(parse_block(la_body, detect_lang(la_body))) if la_body else []


def make_hour_map(present: list[str]) -> dict:
    """Cover 0-23 across the present hours, in canonical order."""
    n = len(present)
    out = {}
    for i, hid in enumerate(present):
        lo = i * 24 // n
        hi = (i + 1) * 24 // n - 1
        out[str(lo) if lo == hi else f"{lo}-{hi}"] = hid
    return out


def _hour_label(hid: str, la_head: str, en_head: str) -> dict:
    en, pt = HOUR_NAMES[hid]
    label = {"en-US": en, "pt-BR": pt}
    # Latin label = whichever source header reads as Latin and isn't the En name
    for h in (la_head, en_head):
        h = (h or "").strip()
        if h and h.lower() != en.lower() and detect_lang(h) == "la":
            label["la"] = h
            break
    return label


def build_flow(office: Office):
    opening, closing = [], []
    opts_by_id: dict[str, dict] = {}
    order: list[str] = []
    first_hour_seen = False

    for block in office.blocks:
        header = block[0] or ""
        hid = hour_for(header)
        if hid:
            first_hour_seen = True
            secs = block_sections(block)
            if hid in opts_by_id:
                # duplicate hour (e.g. seasonal variant) → append, don't drop
                opts_by_id[hid]["sections"].append({"type": "divider"})
                opts_by_id[hid]["sections"].extend(secs)
            else:
                opts_by_id[hid] = {
                    "id": hid,
                    "label": _hour_label(hid, block[3] or "", block[4] or ""),
                    "sections": secs,
                }
                order.append(hid)
        else:
            secs = []
            if header.strip():
                secs.append({"type": "subheading",
                             "text": {"en-US": header.strip(),
                                      "la": header.strip()}})
            secs.extend(block_sections(block))
            (closing if first_hour_seen else opening).extend(secs)

    hour_opts = [opts_by_id[h] for h in order]
    if len(hour_opts) < 2:
        # flat flow: opening + (each hour inline) + closing
        flat = list(opening)
        for opt in hour_opts:
            flat.append({"type": "subheading", "text": opt["label"]})
            flat.extend(opt["sections"])
        flat.extend(closing)
        return {"sections": _rekey_tree(flat)}, len(hour_opts), False

    # order options canonically
    ordered = sorted(hour_opts, key=lambda o: HOUR_ORDER.index(o["id"]))
    present = [o["id"] for o in ordered]
    select = {
        "type": "select",
        "on": "hour",
        "label": {"en-US": "Hour", "pt-BR": "Hora"},
        "map": make_hour_map(present),
        "options": ordered,
    }
    return {"sections": _rekey_tree(opening + [select] + closing)}, len(hour_opts), True


# ---------------------------------------------------------------------------
# Metadata
# ---------------------------------------------------------------------------

BVM_RITE_IDS = [
    ("roman rite", "little-office-bvm-roman"),
    ("ambrosian", "little-office-bvm-ambrosian"),
    ("carmelite", "little-office-bvm-carmelite"),
    ("mount carmel of mount carmel", "little-office-bvm-mount-carmel"),
    ("carthusian", "little-office-bvm-carthusian"),
    ("cistercian", "little-office-bvm-cistercian"),
    ("rite of lyon", "little-office-bvm-lyon"),
    ("dominican", "little-office-bvm-dominican"),
    ("preachers", "little-office-bvm-dominican"),
    ("monastic", "little-office-bvm-monastic"),
    ("sarum", "little-office-bvm-sarum"),
    ("premonstratensian", "little-office-bvm-norbertine"),
    ("norbe", "little-office-bvm-norbertine"),
]

ICON_KEYWORDS = [
    ("immaculate heart", "mary"), ("sacred heart", "sacred-heart"),
    ("heart of mary", "mary"), ("blessed virgin", "mary"),
    ("immaculate conception", "mary"), ("our lady", "mary"),
    ("theotokos", "mary"), ("seven dolours", "mary"), ("seven joys", "mary"),
    ("compassion of the", "mary"), ("scapular", "mary"),
    ("sacred heart", "sacred-heart"),
    ("blessed sacrament", "eucharist"), ("eucharist", "eucharist"),
    ("most holy sacrament", "eucharist"),
    ("holy ghost", "flame"), ("holy spirit", "flame"),
    ("trinity", "trinity"),
    ("holy cross", "cross"), ("passion", "cross"), ("five wounds", "cross"),
    ("exaltation of the holy cross", "cross"), ("holy tear", "cross"),
    ("guardian angel", "angel"), ("michael", "angel"),
    ("angels", "angel"), ("archangel", "angel"),
    ("dead", "candle"), ("evil spirits", "cross"),
]


def slugify(s: str) -> str:
    s = s.lower()
    s = s.replace("ss.", "ss").replace("s.", "s").replace("&", "and")
    s = re.sub(r"[''`]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


_OFFICE_PREFIXES = (
    r"^little offices of the ", r"^little office of the ",
    r"^little office of ", r"^little office for the ",
    r"^little office for ", r"^little office against ",
    r"^little office to ", r"^little office ",
    r"^office of the ", r"^office of ", r"^the holy office of the ",
)


def office_id(title: str, part: str, used: set) -> str:
    tl = title.lower()
    if "blessed virgin mary" in tl or ("bvm" in tl):
        for needle, oid in BVM_RITE_IDS:
            if all(w in tl for w in needle.split()):
                if oid not in used:
                    return oid
    base = title
    had_prefix = False
    for pat in _OFFICE_PREFIXES:
        new = re.sub(pat, "", base, flags=re.I)
        if new != base:
            base, had_prefix = new, True
            break
    # drop rite/epithet tails to keep ids readable
    base = re.split(r",| according to | whose ", base, flags=re.I)[0]
    slug = slugify(base)
    oid = ("little-office-" + slug) if had_prefix else slug
    if oid in used:
        k = 2
        while f"{oid}-{k}" in used:
            k += 1
        oid = f"{oid}-{k}"
    return oid


def pick_icon(title: str, part: str) -> str:
    tl = title.lower()
    for needle, icon in ICON_KEYWORDS:
        if needle in tl:
            return icon
    if part == "marian":
        return "mary"
    if part == "saints":
        return "candle"
    return "prayer"


def subject_of(title: str) -> str:
    base = title
    for pat in (r"^little offices of the ", r"^little office of the ",
                r"^little office of ", r"^little office for ",
                r"^office of the ", r"^office of "):
        base = re.sub(pat, "", base, flags=re.I)
    return base.strip()


PART_META = {
    "mysteries": (["office", "divine-mysteries", "breviary"], "Little Offices of Divine Mysteries"),
    "marian": (["office", "marian", "breviary"], "Little Offices of the Blessed Virgin Mary"),
    "saints": (["office", "saints", "breviary"], "Little Offices of the Angels and Saints"),
    "misc": (["office", "breviary"], "Miscellaneous Little Offices"),
}


def make_manifest(office, oid, sort_order, hours):
    subject = subject_of(office.title)
    icon = pick_icon(office.title, office.part)
    if hours:
        desc = (f"A traditional little office in honour of {subject}, "
                f"arranged in the canonical hours.")
    else:
        desc = f"A traditional little office in honour of {subject}."
    history_parts = []
    if office.attribution:
        att = office.attribution.strip()
        history_parts.append(att if att.endswith(".") else att + ".")
    if office.intro:
        history_parts.append(office.intro)
    name = {"en-US": office.title}
    manifest = {
        "id": oid,
        "icon": icon,
        "name": name,
        "categories": [PART_META[office.part][0][1]] if office.part != "misc" else ["office"],
        "estimatedMinutes": 12 if hours else 6,
        "description": {"en-US": desc},
        "flowMode": "scroll",
        "completion": "flow-end",
        "flow": "flow.json",
        "tags": PART_META[office.part][0],
        "defaults": {
            "sortOrder": sort_order,
            "slots": [{"schedule": {"type": "daily"}, "tier": "extra",
                       "enabled": False}],
        },
    }
    if history_parts:
        manifest["history"] = {"en-US": "\n\n".join(history_parts)}
    return manifest


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def fetch_tex() -> str:
    if not TEX_PATH.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        print(f"Downloading {TEX_URL} ...")
        urllib.request.urlretrieve(TEX_URL, TEX_PATH)
    return TEX_PATH.read_text(encoding="utf-8", errors="replace")


def find_parts(tex: str):
    parts = []
    pat = "\\part*{"
    idx = tex.find(pat)
    while idx != -1:
        bo = idx + len(pat) - 1
        close = _match_brace(tex, bo)
        if close == -1:
            break
        title = clean_latex(tex[bo + 1:close])
        parts.append((idx, title))
        idx = tex.find(pat, close)
    return parts


def part_key(tex_offset, parts) -> str | None:
    name = None
    for off, title in parts:
        if off <= tex_offset:
            name = title
    if not name:
        return None
    n = name.lower()
    if "divine mysteries" in n:
        return "mysteries"
    if "blessed virgin" in n:
        return "marian"
    if "angels" in n or "saints" in n:
        return "saints"
    if "miscellaneous" in n:
        return "misc"
    return None


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8")


def prune_previous():
    if LEDGER.exists():
        for oid in json.loads(LEDGER.read_text()):
            d = PRACTICES / oid
            if d.is_dir():
                for f in d.iterdir():
                    f.unlink()
                d.rmdir()


def main():
    tex = fetch_tex()
    parts = find_parts(tex)

    sec_re = re.compile(r"\\section\*\{(.*?)\}", re.DOTALL)
    matches = list(sec_re.finditer(tex))

    prune_previous()

    used_ids: set[str] = set()
    offices = []  # (office, oid, part, hours)
    by_part = {"mysteries": [], "marian": [], "saints": [], "misc": []}
    warnings = []

    sort_order = 100
    for i, m in enumerate(matches):
        title = clean_latex(m.group(1)).replace("\n", " ").strip()
        title = re.sub(r"\s+", " ", title)
        pk = part_key(m.start(), parts)
        if pk is None:
            continue  # front matter (Ceremonial Rubrics etc.)
        if title.lower().startswith("ceremonial"):
            continue
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(tex)
        # don't run past a part boundary
        for off, _ in parts:
            if start < off < end:
                end = off
        doc_end = tex.find("\\end{document}", start)
        if doc_end != -1 and start < doc_end < end:
            end = doc_end
        raw = tex[start:end]
        office = parse_office(title, pk, raw)
        oid = office_id(title, pk, used_ids)
        used_ids.add(oid)
        flow, n_hours, has_select = build_flow(office)
        if not flow["sections"]:
            warnings.append(f"EMPTY  {oid}  ({title})")
            continue
        manifest = make_manifest(office, oid, sort_order, has_select)
        sort_order += 1
        write_json(PRACTICES / oid / "manifest.json", manifest)
        write_json(PRACTICES / oid / "flow.json", flow)
        by_part[pk].append((oid, title))
        offices.append(oid)
        lang = "la+en" if office.bilingual else "la"
        sel = f"select[{n_hours}]" if has_select else f"flat[{n_hours}h]"
        print(f"  {oid:55s} {lang:6s} {sel} secs={len(flow['sections'])}")

    write_preparatory()
    offices.append("office-preparatory-prayers")
    write_collection(by_part)

    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    LEDGER.write_text(json.dumps(offices, ensure_ascii=False, indent=2))

    print(f"\nGenerated {len(offices)} practices + 1 collection.")
    for pk, items in by_part.items():
        print(f"  {pk}: {len(items)}")
    if warnings:
        print("\nWARNINGS:")
        for w in warnings:
            print("  " + w)


# --- Supplementary preparatory prayers + collection -----------------------

def write_preparatory():
    flow = {"sections": [
        {"type": "subheading",
         "text": {"en-US": "Prayer Before the Office",
                  "la": "Ante Officium"}},
        {"type": "prayer", "inline": {
            "la": "Aperi, Domine, os meum ad benedicendum Nomen sanctum tuum; "
                  "munda quoque cor meum ab omnibus vanis, perversis et alienis "
                  "cogitationibus; intellectum illumina, affectum inflamma, ut "
                  "digne, attente ac devote hoc Officium recitare valeam, et "
                  "exaudiri merear ante conspectum divinae Maiestatis tuae. Per "
                  "Christum Dominum nostrum.\n℟. Amen.\nDomine, in unione illius "
                  "divinae intentionis, qua ipse in terris laudes Deo "
                  "persolvisti, has tibi Horas (vel hanc tibi Horam) persolvo.",
            "en-US": "O Lord, open Thou my mouth to bless Thy holy name; "
                  "cleanse my heart also from all vain, evil and wandering "
                  "thoughts; enlighten my understanding, kindle my affections, "
                  "that I may be able to recite this Office worthily, attentively "
                  "and devoutly, and may deserve to be heard in the presence of "
                  "Thy divine Majesty. Through Christ our Lord.\n℟. Amen.\nLord, "
                  "in union with that divine intention, wherewith Thou Thyself "
                  "didst praise God whilst Thou wast on earth, I offer these "
                  "Hours (or this Hour) unto Thee."}},
        {"type": "divider"},
        {"type": "subheading",
         "text": {"en-US": "Prayer After the Office",
                  "la": "Post Officium"}},
        {"type": "rubric", "text": {"en-US":
            "Pope Leo X granted to all under obligation to recite the Office, "
            "provided that, kneeling and with devotion, they say afterward this "
            "prayer (composed by St. Bonaventure) together with one Our Father "
            "and one Hail Mary, the remission of all faults committed through "
            "human frailty in reciting it."}},
        {"type": "prayer", "inline": {
            "la": "Sacrosanctae et individuae Trinitati, crucifixi Domini nostri "
                  "Jesu Christi humanitati, beatissimae et gloriosissimae "
                  "semperque Virginis Mariae foecundae integritati, et omnium "
                  "Sanctorum universitati sit sempiterna laus, honor, virtus et "
                  "gloria ab omni creatura, nobisque remissio omnium peccatorum, "
                  "per infinita saecula saeculorum.\n℟. Amen.\n℣. Beata viscera "
                  "Mariae Virginis, quae portaverunt aeterni Patris Filium.\n℟. "
                  "Et beata ubera, quae lactaverunt Christum Dominum.",
            "en-US": "To the Most Holy and undivided Trinity, to the Manhood of "
                  "our Lord Jesus Christ Crucified, to the fruitful Virginity of "
                  "the most blessed and most glorious Mary, always a Virgin, and "
                  "to the holiness of all the Saints be ascribed everlasting "
                  "praise, honour, and glory, by all creatures, and to us be "
                  "granted the forgiveness of all our sins, world without end.\n"
                  "℟. Amen.\n℣. Blessed be the womb of the Virgin Mary which bore "
                  "the Son of the Eternal Father.\n℟. And blessed be the paps "
                  "which gave suck to Christ our Lord."}},
        {"type": "rubric", "text": {
            "la": "Et dicitur secreto Pater noster et Ave Maria.",
            "en-US": "Then an Our Father and a Hail Mary are said silently."}},
    ]}
    manifest = {
        "id": "office-preparatory-prayers",
        "icon": "prayer",
        "name": {"en-US": "Prayers Before & After the Office",
                 "pt-BR": "Orações Antes e Depois do Ofício"},
        "categories": ["office"],
        "estimatedMinutes": 3,
        "description": {"en-US":
            "The traditional Aperi, Domine and Sacrosanctae — said before and "
            "after praying any of the little offices."},
        "flowMode": "scroll",
        "completion": "flow-end",
        "flow": "flow.json",
        "tags": ["office", "breviary"],
        "defaults": {"sortOrder": 99,
                     "slots": [{"schedule": {"type": "daily"},
                                "tier": "extra", "enabled": False}]},
    }
    write_json(PRACTICES / "office-preparatory-prayers" / "manifest.json",
               manifest)
    write_json(PRACTICES / "office-preparatory-prayers" / "flow.json", flow)


def write_collection(by_part):
    section_titles = {
        "mysteries": ("Divine Mysteries", "Mistérios Divinos"),
        "marian": ("The Blessed Virgin Mary", "A Santíssima Virgem Maria"),
        "saints": ("Angels & Saints", "Anjos e Santos"),
        "misc": ("Miscellaneous", "Diversos"),
    }
    sections = [{
        "id": "preparatory",
        "title": {"en-US": "Before You Begin", "pt-BR": "Antes de Começar"},
        "blocks": [{"kind": "item", "ref": "practice/office-preparatory-prayers"}],
    }]
    for pk in ("mysteries", "marian", "saints", "misc"):
        en, pt = section_titles[pk]
        sections.append({
            "id": pk,
            "title": {"en-US": en, "pt-BR": pt},
            "blocks": [{"kind": "item", "ref": f"practice/{oid}"}
                       for oid, _ in by_part[pk]],
        })
    collection = {
        "id": "collection/little-offices",
        "version": "1.0.0",
        "name": {"en-US": "A Big Book of Little Offices",
                 "pt-BR": "Grande Livro dos Pequenos Ofícios"},
        "description": {
            "en-US": "Over eighty traditional little offices — short forms of "
                     "the canonical hours honouring the divine mysteries, Our "
                     "Lady, and the saints.",
            "pt-BR": "Mais de oitenta pequenos ofícios tradicionais — formas "
                     "breves das horas canônicas em honra dos mistérios divinos, "
                     "de Nossa Senhora e dos santos."},
        "icon": "book",
        "languages": ["la", "en-US"],
        "tags": ["office", "breviary", "latin"],
        "prologue": {"body": {
            "en-US": "Compiled by the Little Office Guild (lobvm.com), these "
                     "little offices each bore a nihil obstat and imprimatur in "
                     "times past. Most are given in Latin; some include an "
                     "English translation. © 2021 LOBVM.com, except texts "
                     "already in the public domain."}},
        "sections": sections,
    }
    write_json(COLLECTIONS / "little-offices.json", collection)


if __name__ == "__main__":
    sys.exit(main())
