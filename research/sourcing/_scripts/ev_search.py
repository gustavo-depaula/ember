# Search Estante Virtual (Brazilian used/new book marketplace) and print facets + result snippets as plain text.
# usage: python3 -I ev_search.py "query" [page]
import html, re, sys, urllib.parse, urllib.request
q = sys.argv[1]; page = sys.argv[2] if len(sys.argv) > 2 else "1"
url = "https://www.estantevirtual.com.br/busca?" + urllib.parse.urlencode({"q": q, "page": page})
req = urllib.request.Request(url, headers={"User-Agent": "EmberCorpusResearch/1.0"})
t = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
s = re.sub(r"\s+", " ", html.unescape(re.sub(r"(?s)<script.*?</script>|<style.*?</style>|<[^>]+>", " ", t)))
i = s.find("Tipo de Livro"); j = s.find("Institucional Quem somos")
body = s[i:j] if i >= 0 else s[:3000]
body = re.sub(r"(Ver ofertas)", r"\1\n", body)
print(body)
