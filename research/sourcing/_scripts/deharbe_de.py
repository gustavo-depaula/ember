"""Deharbe, Katholischer Katechismus, für die Vereinigten Staaten neu bearbeitet (1870/71; archive.org katholischerkate02deha) -> de chapters."""
import re, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import cat_ocr

src = Path("research/sourcing/catechisms/de/katholischerkate02deha.txt")
out = Path("content/books/deharbe-katholischer-katechismus/de")
out.mkdir(parents=True, exist_ok=True)
text = src.read_text().replace("ſ", "s").replace("⸗", "-")
ps = cat_ocr.paragraphs(text, drop=r"[—\-–= ]*\d{1,3}[—\-–= ]*")
ps = [(n, re.sub(r"\s+", " ", t).strip()) for n, t in ps if len(re.sub(r"\W", "", t)) > 3]
CUTS = [
 (298, "gebete", "Gebete"), (1071, "einleitung", "Einleitung: Vom Ziel und Ende des Menschen"),
 (1117, "hauptstueck-1-glauben", "Erstes Hauptstück: Von dem Glauben"),
 (1377, "artikel-01", "Erster Glaubensartikel"), (1974, "artikel-02", "Zweiter Glaubensartikel"), (2122, "artikel-03", "Dritter Glaubensartikel"),
 (2329, "artikel-04", "Vierter Glaubensartikel"), (2418, "artikel-05", "Fünfter Glaubensartikel"), (2474, "artikel-06", "Sechster Glaubensartikel"),
 (2516, "artikel-07", "Siebenter Glaubensartikel"), (2657, "artikel-08", "Achter Glaubensartikel"), (2713, "artikel-09", "Neunter Glaubensartikel"),
 (3141, "artikel-10-12", "Zehnter bis zwölfter Glaubensartikel"),
 (3313, "hauptstueck-2-gebote", "Zweites Hauptstück: Von den Geboten"),
 (3562, "zehn-gebote", "Von den zehn Geboten Gottes (Erstes Gebot)"), (3885, "gebot-02", "Zweites Gebot"), (4001, "gebot-03", "Drittes Gebot"),
 (4068, "gebot-04", "Viertes Gebot"), (4226, "gebot-05", "Fünftes Gebot"), (4319, "gebot-06", "Sechstes Gebot"), (4406, "gebot-07", "Siebentes Gebot"),
 (4501, "gebot-08", "Achtes bis zehntes Gebot"), (4700, "kirchengebote", "Von den Geboten der Kirche"),
 (4975, "suende", "Von der Uebertretung der Gebote: Von der Sünde"), (5287, "tugend", "Von der christlichen Tugend und Vollkommenheit"),
 (5538, "hauptstueck-3-gnadenmittel", "Drittes Hauptstück: Von den Gnadenmitteln und der Gnade"),
 (5760, "sakramente", "Von den heiligen Sakramenten"), (5880, "taufe", "Von der Taufe"), (6017, "firmung", "Von der Firmung"),
 (6130, "eucharistie", "Von dem allerheiligsten Sakramente des Altars"), (6644, "busse", "Von der Buße"), (7361, "oelung", "Von der letzten Oelung"),
 (7455, "priesterweihe", "Von der Priesterweihe"), (7515, "ehe", "Von der Ehe"), (7654, "sakramentalien", "Von den Sakramentalien"),
 (7728, "gebet", "Vom Gebete"), (8143, "zeremonien", "Von kirchlichen Ceremonien und Gebräuchen"),
]
END = 8218
QRE = re.compile(r"^\W{0,3}[A-Za-z]{0,2}\s?\W{0,2}(\d{1,3})\.\s+(.+)$")
HEAD = re.compile(r"^§ ?\d+\.? .{3,80}$|^Von [a-zA-ZäöüÄÖÜß ,\-]{5,60}\.?$|^(Erstes|Zweites|Drittes|Viertes|Fünftes|Sechstes|Siebentes|Achtes|Neuntes|Zehntes) Gebot( der Kirche)?\.?( .{0,80})?$")
order = []
raw = text.split("\n")
NOISE = re.compile(r"^[\W\d_]{0,6}$|^[A-Za-z]{1,3}$|^[—\-–= ]*\d{1,3}[—\-–= ]*$")
STARTQ = re.compile(r"^\W{0,3}[A-Za-z]{0,2}\s?\W{0,2}(\d{1,3})\.\s+([A-ZÄÖÜ„].*)$")
SFIX = [(r"\bift\b", "ist"), (r"\bfie\b", "sie"), (r"\bFie\b", "Sie"), (r"\bfich\b", "sich"), (r"\bfo\b", "so"), (r"\bfondern\b", "sondern"), (r"\bfeine\b(?= [A-Z])", "seine"), (r"\bfind\b(?= (die|alle|wir|nicht|auch))", "sind")]
def para_join(lines):
    t = ""
    for l in lines:
        l = re.sub(r"\s+", " ", l).strip(" |}{")
        if t.endswith("-") and l[:1].islower(): t = t[:-1] + l
        else: t = (t + " " + l).strip()
    for a, b in SFIX: t = re.sub(a, b, t)
    return t
for k, (a, cid, title) in enumerate(CUTS):
    b = CUTS[k + 1][0] if k + 1 < len(CUTS) else END
    lines = [l for l in raw[a - 1:b - 1]]
    blocks, last, i, first = [], 0, 0, True
    cur_para, ans = [], None  # ans: list of paragraphs (each a list of lines) when inside an answer
    INLINE = re.compile(r"\s(\d{1,3})[.,]?\s+((?:Wie|Was|Warum|Wer|Wo|Wann|Welche\w*|Wozu|Woher|Wodurch|Womit|Worin|Wem|Wen|Ist|Sind|Muß|Müssen|Kann|Können|Darf|Hat|Haben|Gibt|Soll|Sollen|Gehört|Wird|Werden|Wieviel\w*|Woran|Wofür|Worauf|Weshalb|Wessen|Wodurch)\b[^?]{5,200}\?)")
    def emit(t, inans):
        global last
        m = INLINE.search(t) if inans else None
        if m and last < int(m.group(1)) <= last + 3:
            before = t[:m.start()].strip()
            if before: blocks.append("*" + before.replace("*", "\\*") + "*")
            last = int(m.group(1)); blocks.append(f"**{last}.** {m.group(2)}")
            rest = t[m.end():].strip()
            if rest: emit(rest, True)
            return
        blocks.append(("*" + t.replace("*", "\\*") + "*") if inans else t.replace("*", "\\*"))
    def flush_para():
        global cur_para
        if cur_para:
            t = para_join(cur_para)
            if t and len(re.sub(r"\W", "", t)) > 3: emit(t, ans is not None)
            cur_para = []
    while i < len(lines):
        l = lines[i].strip()
        if first and l and not STARTQ.match(l):
            first = False; i += 1; continue  # the chapter's own heading line
        if l: first = False
        if not l or NOISE.match(l):
            # the scan puts blank lines inside sentences: break the paragraph only after sentence-final punctuation
            if not cur_para or re.search(r"[.?!:;\u201c\"]$", cur_para[-1].strip()): flush_para()
            i += 1; continue
        m = STARTQ.match(l)
        if m:
            q, j = [m.group(2)], i
            while not q[-1].rstrip("“”\" |}").endswith("?") and j + 1 < len(lines) and len(q) < 4 and lines[j + 1].strip():
                j += 1; q.append(lines[j].strip())
            qt = para_join(q)
            if qt.rstrip("“”\" |}").endswith("?"):
                flush_para()
                num = int(m.group(1))
                if num != 1 and not (last < num <= last + 6): num = last + 1
                last = num
                blocks.append(f"**{num}.** {qt}"); ans = []; i = j + 1; continue
        if HEAD.match(l) and len(l) < 90 and not l.endswith((",", ";")):
            flush_para(); ans = None; last = 0
            blocks.append("## " + re.sub(r"^§ ?(\d+)\.? ", r"§ \1. ", l.rstrip("|").strip())); i += 1; continue
        if l.startswith(("Nutzanwendung", "Anwendung")): flush_para(); ans = None
        cur_para.append(l); i += 1
    flush_para()
    (out / f"{cid}.md").write_text(f"# {title}\n\n" + "\n\n".join(blocks) + "\n", encoding="utf-8")
    order.append(cid)
json.dump(order, open("research/sourcing/catechisms/_deharbe_de_order.json", "w"))
print(len(order))
