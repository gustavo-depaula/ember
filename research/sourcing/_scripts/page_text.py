# Print the visible text of an HTML page read from stdin, optionally only around keywords.
import html, re, sys
t = sys.stdin.buffer.read().decode("utf-8", "replace")
s = re.sub(r"\s+", " ", html.unescape(re.sub(r"(?s)<script.*?</script>|<style.*?</style>|<[^>]+>", " ", t)))
kws = sys.argv[2:]
n = int(sys.argv[1])
if not kws:
    print(s[:n]); sys.exit()
seen = -10**9
for m in re.finditer("|".join(re.escape(k) for k in kws), s, re.I):
    if m.start() - seen > n:
        print("…", s[max(0, m.start() - 80): m.start() + n]); seen = m.start()
