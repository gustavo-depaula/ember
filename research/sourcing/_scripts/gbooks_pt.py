# Query Google Books for Portuguese-language editions; print title/author/publisher/date/viewability/id.
import json, sys, urllib.parse, urllib.request
for q in sys.argv[1:]:
    print("===", q)
    for start in (0, 40):
        url = "https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode({"q": q, "langRestrict": "pt", "maxResults": 40, "startIndex": start, "printType": "books"})
        req = urllib.request.Request(url, headers={"User-Agent": "EmberCorpusResearch/1.0"})
        try:
            d = json.load(urllib.request.urlopen(req, timeout=30))
        except Exception as e:
            print("ERR", e); break
        items = d.get("items", [])
        for it in items:
            v = it["volumeInfo"]; a = it.get("accessInfo", {})
            print(" |".join([it["id"], v.get("title","") + (": " + v["subtitle"] if v.get("subtitle") else ""), ",".join(v.get("authors",[])), v.get("publisher",""), v.get("publishedDate",""), a.get("viewability",""), v.get("language","")]))
        if len(items) < 40: break
