#!/bin/bash
curl -s -m 90 -G "https://gallica.bnf.fr/SRU" --data-urlencode "operation=searchRetrieve" --data-urlencode "version=1.2" --data-urlencode "query=$1" --data-urlencode "maximumRecords=${2:-50}" | python3 -c "
import sys,re,html
t=sys.stdin.read()
print('total',re.findall(r'<srw:numberOfRecords>(\d+)',t))
for r in re.findall(r'<srw:record>(.*?)</srw:record>',t,re.S):
  ti=re.findall(r'<dc:title>(.*?)</dc:title>',r); da=re.findall(r'<dc:date>(.*?)</dc:date>',r); id=re.findall(r'<dc:identifier>(https://gallica[^<]*)</dc:identifier>',r)
  print(id[0] if id else '',da[:1],html.unescape(ti[0])[:130] if ti else '')
"
