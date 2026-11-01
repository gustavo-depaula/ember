# usage: python3 wsprefix.py <lang> <prefix> [-v]  -> subpages with byte length (wikitext)
import json,subprocess,sys,urllib.parse
lang,prefix=sys.argv[1],sys.argv[2]
cont={}; pages=[]
while True:
    q={'action':'query','generator':'allpages','gapprefix':prefix,'gaplimit':'500','prop':'info','format':'json',**cont}
    url=f"https://{lang}.wikisource.org/w/api.php?"+urllib.parse.urlencode(q)
    d=json.loads(subprocess.run(['curl','-s','-A','EmberCorpusResearch/1.0','--',url],capture_output=True).stdout)
    pages+=d.get('query',{}).get('pages',{}).values()
    if 'continue' not in d: break
    cont={k:v for k,v in d['continue'].items()}
pages.sort(key=lambda p:p['title'])
if '-v' in sys.argv:
    for p in pages: print(p['title'],p['length'])
print('COUNT',len(pages),'BYTES',sum(p['length'] for p in pages),'~WORDS',sum(p['length'] for p in pages)//7)
