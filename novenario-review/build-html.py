"""Build a self-contained HTML review page for the Novenário side-by-side.
Ember text from content JSON; FishEaters from /tmp/fe_sections.json (curl-extracted);
PrayMoreNovenas + fidelity notes parsed from novenario-review/<slug>.md.
Output: novenario-review/index.html
"""
import json, os, re, html

WT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REVIEW = os.path.join(WT, "novenario-review")
PRACT = os.path.join(WT, "content", "practices")
sxs = json.load(open("/tmp/sxs.json"))
fe_sections = json.load(open("/tmp/fe_sections.json"))

def loc(d, l): return (d or {}).get(l, "") if isinstance(d, dict) else ""

def read_ember(slug):
    base = os.path.join(PRACT, slug)
    man = json.load(open(os.path.join(base, "manifest.json"), encoding="utf-8"))
    flow = json.load(open(os.path.join(base, "flow.json"), encoding="utf-8"))
    secs = flow["sections"]
    def after(label):
        for i, s in enumerate(secs):
            if s.get("type") == "rubric" and loc(s.get("text"), "en-US") == label:
                nxt = secs[i+1]
                if nxt.get("type") == "prayer" and isinstance(nxt.get("inline"), dict):
                    return nxt["inline"]
        return {}
    opening = after("Opening prayer:")
    closing = after("Closing prayer:")
    days = []
    dpath = os.path.join(base, "data", "days.json")
    if os.path.isfile(dpath):
        days = json.load(open(dpath, encoding="utf-8"))["entries"]["default"]
    return man, opening, closing, days

def md_sections(slug):
    p = os.path.join(REVIEW, slug + ".md")
    if not os.path.isfile(p): return "", ""
    t = open(p, encoding="utf-8").read()
    def grab(start, end):
        m = re.search(re.escape(start) + r"(.*?)(?=" + (re.escape(end) if end else r"\Z") + r")", t, re.S)
        return m.group(1).strip() if m else ""
    pmn = grab("## Source — PrayMoreNovenas", "## Fidelity note")
    fid = grab("## Fidelity note", None)
    # light markdown strip
    for s in (pmn, fid): pass
    return pmn, fid

def esc(s): return html.escape(s or "")
def para(s):  # text -> <p> blocks, preserve line breaks
    s = esc(s).strip()
    if not s: return '<span class="muted">—</span>'
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"_\((.+?)\)_", r'<em class="muted">(\1)</em>', s)
    blocks = [b.strip() for b in s.split("\n\n") if b.strip()]
    return "".join(f"<p>{b.replace(chr(10), '<br>')}</p>" for b in blocks)

def bil(d):
    en, pt = loc(d, "en-US"), loc(d, "pt-BR")
    out = ""
    if en: out += f'<p>{esc(en)}</p>'
    if pt: out += f'<p class="pt">{esc(pt)}</p>'
    return out or '<span class="muted">—</span>'

cards, nav = [], []
for idx, e in enumerate(sxs):
    slug, name = e["slug"], e["name"]
    man, opening, closing, days = read_ember(slug)
    pmn, fid = md_sections(slug)
    # FE text
    fe_url = e["fe"]
    fe_txt = ""
    if fe_url:
        if "#" in fe_url:
            fe_txt = fe_sections.get(fe_url.split("#",1)[1], "")
        elif "feastofthemostholyrosary" in fe_url:
            fe_txt = fe_sections.get("__rosary_page__", "")
    nav.append(f'<a href="#{slug}" data-name="{esc(name.lower())} {slug}">{esc(name)}</a>')

    ember = ['<div class="ember">']
    ember.append('<div class="field"><span class="lbl">Opening prayer</span>' + bil(opening) + '</div>')
    for i, d in enumerate(days, 1):
        pr = ('<div class="dprayer"><span class="lbl">Prayer</span>' + bil(d["prayer"]) + '</div>') if d.get("prayer") else ''
        ember.append('<div class="day"><div class="dtitle">' + bil(d.get("dayTitle")) + '</div>'
                     + '<div class="med">' + bil(d.get("meditation")) + '</div>'
                     + pr
                     + '<div class="intent"><span class="lbl">Intention</span>' + bil(d.get("intention")) + '</div></div>')
    ember.append('<div class="field"><span class="lbl">Closing prayer</span>' + bil(closing) + '</div>')
    ember.append('</div>')

    sub = loc(man.get("subtitle"), "en-US")
    desc = bil(man.get("description")); hist = bil(man.get("history"))
    card = f'''<section id="{slug}" class="card">
  <h2>{esc(name)} <span class="slug">{slug}</span></h2>
  <div class="sub">{esc(sub)}</div>
  <details class="meta"><summary>description &amp; history</summary><div class="metabody">{desc}{hist}</div></details>
  <div class="cols">
    <div class="col"><h3>Ember <span class="tag orig">original · this app</span></h3>{''.join(ember)}</div>
    <div class="col"><h3>FishEaters <span class="tag trad">traditional</span></h3><div class="src">{para(fe_txt) if fe_txt else '<span class="muted">— not on FishEaters / not retrieved</span>'}</div></div>
    <div class="col"><h3>PrayMoreNovenas <span class="tag mod">modern</span></h3><div class="src">{para(pmn)}</div></div>
  </div>
  <div class="fid"><span class="lbl">Fidelity note</span>{para(fid)}</div>
</section>'''
    cards.append(card)

HTML = f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Novenário — review</title>
<style>
  :root {{ --bg:#fbf8f3; --ink:#2b2622; --burg:#7a2e3a; --muted:#8a8178; --line:#e6ddd0; --pt:#5a6b7a; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; font:15px/1.55 Georgia, 'Iowan Old Style', serif; color:var(--ink); background:var(--bg); }}
  header {{ position:sticky; top:0; z-index:5; background:var(--burg); color:#fff; padding:10px 16px; display:flex; gap:14px; align-items:center; flex-wrap:wrap; }}
  header h1 {{ font-size:17px; margin:0; font-weight:600; }}
  header .count {{ opacity:.8; font-size:13px; }}
  header input {{ margin-left:auto; padding:6px 10px; border:0; border-radius:6px; font:14px sans-serif; width:240px; }}
  .layout {{ display:grid; grid-template-columns:260px 1fr; }}
  nav {{ position:sticky; top:48px; align-self:start; height:calc(100vh - 48px); overflow:auto; border-right:1px solid var(--line); padding:10px 8px; background:#fff; }}
  nav a {{ display:block; padding:5px 8px; color:var(--ink); text-decoration:none; font:13px/1.3 sans-serif; border-radius:5px; }}
  nav a:hover {{ background:#f0e8da; }}
  main {{ padding:18px 22px; max-width:1500px; }}
  .card {{ border:1px solid var(--line); border-radius:10px; background:#fff; padding:18px 20px; margin:0 0 26px; scroll-margin-top:56px; }}
  .card h2 {{ margin:0 0 2px; color:var(--burg); font-size:21px; }}
  .card .slug {{ font:11px monospace; color:var(--muted); font-weight:400; }}
  .sub {{ color:var(--muted); font-size:13px; margin-bottom:8px; }}
  details.meta {{ margin-bottom:12px; font-size:13px; }} details.meta summary {{ cursor:pointer; color:var(--burg); font:12px sans-serif; }}
  .metabody {{ padding:8px 0; color:#4a443e; }}
  .cols {{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:18px; }}
  @media (max-width:1100px) {{ .cols {{ grid-template-columns:1fr; }} .layout {{ grid-template-columns:1fr; }} nav {{ display:none; }} }}
  .col h3 {{ font:600 13px sans-serif; margin:0 0 8px; padding-bottom:5px; border-bottom:2px solid var(--line); }}
  .tag {{ font:10px sans-serif; padding:2px 6px; border-radius:10px; vertical-align:middle; }}
  .tag.orig {{ background:#f3e1e4; color:var(--burg); }} .tag.trad {{ background:#e3ecn; background:#e6efe3; color:#3c6b3c; }} .tag.mod {{ background:#e8e9f0; color:#4a4a7a; }}
  .field, .day {{ margin-bottom:10px; }}
  .lbl {{ display:block; font:10px sans-serif; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); margin-bottom:2px; }}
  .day {{ padding:8px 10px; background:#faf7f1; border-radius:6px; }}
  .dtitle p {{ margin:0; font-weight:600; font-size:14px; }}
  .med p {{ margin:3px 0; }} .intent {{ margin-top:4px; }}
  .src p {{ margin:0 0 8px; white-space:pre-wrap; }}
  .ember p, .src p {{ margin:0 0 7px; }}
  p {{ margin:0 0 7px; }}
  .pt {{ color:var(--pt); font-size:13.5px; font-style:italic; }}
  .muted {{ color:var(--muted); }}
  .fid {{ margin-top:14px; padding:10px 12px; background:#fcf4e8; border:1px solid #ecdcc2; border-radius:7px; font-size:14px; }}
  .intro {{ padding:14px 20px; color:#4a443e; }}
  .intro b {{ color:var(--burg); }}
</style></head><body>
<header>
  <h1>Novenário — side-by-side review</h1>
  <span class="count">{len(sxs)} novenas</span>
  <input id="q" placeholder="filter by name…" oninput="filt()">
</header>
<div class="intro">
  <p>Each novena shows the <b>Ember</b> text (original, AI-composed for this app — English on top, <span class="pt">Portuguese in italic</span>) beside the <b>traditional</b> source on FishEaters and the <b>modern</b> source on PrayMoreNovenas. The <b>fidelity note</b> at the bottom of each card judges how closely the Ember version tracks the sources. Sources are English only; where a source is blank, none exists for that novena.</p>
</div>
<div class="layout">
  <nav id="nav">{''.join(nav)}</nav>
  <main>{''.join(cards)}</main>
</div>
<script>
function filt(){{var q=document.getElementById('q').value.toLowerCase();
document.querySelectorAll('#nav a').forEach(function(a){{a.style.display=a.dataset.name.includes(q)?'block':'none';}});
document.querySelectorAll('.card').forEach(function(c){{var h=c.querySelector('h2').textContent.toLowerCase();c.style.display=h.includes(q)?'':'none';}});}}
</script>
</body></html>'''

open(os.path.join(REVIEW, "index.html"), "w", encoding="utf-8").write(HTML)
print("wrote novenario-review/index.html  (", len(sxs), "novenas )")
fe_have = sum(1 for e in sxs if e["fe"] and ("#" in e["fe"] and e["fe"].split("#",1)[1] in fe_sections or "rosary" in e["fe"]))
print("FE source present for", fe_have, "novenas")
