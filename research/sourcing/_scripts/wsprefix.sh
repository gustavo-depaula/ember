#!/bin/bash
# usage: wsprefix.sh <lang> <prefix>  -> lists subpages with byte length
curl -s "https://$1.wikisource.org/w/api.php?action=query&generator=allpages&gapprefix=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$2")&gaplimit=500&prop=info&format=json" | python3 -c "
import json,sys
d=json.load(sys.stdin).get('query',{}).get('pages',{})
tot=0
for p in sorted(d.values(),key=lambda x:x['title']):
  tot+=p['length']; print(p['title'],p['length'])
print('COUNT',len(d),'BYTES',tot)"
