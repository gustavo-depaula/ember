#!/bin/bash
curl -s -A 'EmberCorpusResearch/1.0' -m 60 -G "https://www.googleapis.com/books/v1/volumes" --data-urlencode "q=$1" --data-urlencode "langRestrict=pt" --data-urlencode "maxResults=40" ${2:+--data-urlencode "filter=$2"} | python3 -I -c "
import json,sys; d=json.load(sys.stdin)
for it in d.get('items',[]):
  v=it['volumeInfo']; a=it['accessInfo']
  print(it['id'],'|',v.get('publishedDate',''),'|',a.get('viewability'),'|',v.get('publisher','')[:30],'|',v.get('title','')[:90],'|',(v.get('subtitle') or '')[:60],'|',','.join(v.get('authors',[]))[:40])
"
