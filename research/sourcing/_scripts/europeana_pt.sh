#!/bin/bash
# Europeana search (public demo key) restricted to Portuguese-language records. usage: europeana_pt.sh QUERY
curl -s -A 'EmberCorpusResearch/1.0' -G 'https://api.europeana.eu/record/v2/search.json' --data-urlencode 'wskey=api2demo' --data-urlencode "query=$1" --data-urlencode 'rows=50' | python3 -c 'import json,sys
d=json.load(sys.stdin); print(" n=",d.get("totalResults"), d.get("error",""))
for x in d.get("items",[]): print(" ",(x.get("year") or [""])[0],"|",(x.get("title") or [""])[0][:130],"|",(x.get("dataProvider") or [""])[0][:40],"|",x.get("rights",[""])[0][-30:],"|",(x.get("edmIsShownAt") or [""])[0])'
