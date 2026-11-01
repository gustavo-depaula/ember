# Query the BNP (Biblioteca Nacional de Portugal) iPac catalogue and print the result list as plain text.
# usage: python3 -I bnp_search.py INDEX TERM [outfile]   (INDEX: .AW author words, .TW title words, .GW keywords)
import html, re, sys, urllib.parse, urllib.request
index, term = sys.argv[1], sys.argv[2]
url = "http://catalogo.bnportugal.gov.pt/ipac20/ipac.jsp?" + urllib.parse.urlencode({"profile": "bn", "index": index, "term": term, "npp": "50"})
req = urllib.request.Request(url, headers={"User-Agent": "EmberCorpusResearch/1.0"})
t = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
t = re.sub(r"(?s)<script.*?</script>", " ", t)
t = re.sub(r"(?s)<style.*?</style>", " ", t)
t = re.sub(r"<[^>]+>", " ", t); t = html.unescape(t); t = re.sub(r"\s+", " ", t)
i = t.find("Resultado da pesquisa")
s = t[i:] if i >= 0 else t
s = re.sub(r"(Adicionar à lista|Ver disponibilidade)", "\n", s)
print(s[:12000])
