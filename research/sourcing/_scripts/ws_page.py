# Fetch the OCR/text layer of es.wikisource Page: namespace pages (preloaded in edit box).
import sys, re, html, urllib.request, urllib.parse, time, os
index, outdir, start, end = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
os.makedirs(outdir, exist_ok=True)
for p in range(start, end + 1):
    path = os.path.join(outdir, f"{p:04d}.txt")
    if os.path.exists(path):
        continue
    url = "https://es.wikisource.org/w/index.php?title=" + urllib.parse.quote(f"Página:{index}/{p}") + "&action=edit"
    req = urllib.request.Request(url, headers={"User-Agent": "EmberResearch/1.0"})
    t = urllib.request.urlopen(req, timeout=60).read().decode("utf-8")
    m = re.search(r'<textarea[^>]*id="wpTextbox1"[^>]*>(.*?)</textarea>', t, re.S)
    open(path, "w").write(html.unescape(m.group(1)) if m else "")
    time.sleep(0.3)
