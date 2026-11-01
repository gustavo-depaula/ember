# usage: python3 wsdump.py <lang> <prefix> <outdir>  -> saves raw wikitext of each subpage, prints words
import json,subprocess,sys,urllib.parse,os,re,time
lang,prefix,out=sys.argv[1:4]
os.makedirs(out,exist_ok=True)
def get(url):
    for i in range(30):
        p=subprocess.run(['curl','-s','-w','\n%{http_code}','-A','EmberCorpusResearch/1.0','--',url],capture_output=True).stdout
        body,code=p.rsplit(b'\n',1)
        if code==b'200': return body
        time.sleep(12)
    raise SystemExit('rate-limited: '+url)
cont={}; titles=[]
while True:
    q={'action':'query','list':'allpages','apprefix':prefix,'aplimit':'500','format':'json',**cont}
    d=json.loads(get(f"https://{lang}.wikisource.org/w/api.php?"+urllib.parse.urlencode(q)))
    titles+=[p['title'] for p in d['query']['allpages']]
    if 'continue' not in d: break
    cont=d['continue']
tot=0
for t in titles:
    fn=os.path.join(out,re.sub(r'[^\w.-]+','_',t)+'.wiki')
    if not os.path.exists(fn):
        raw=get(f"https://{lang}.wikisource.org/w/index.php?"+urllib.parse.urlencode({'title':t,'action':'raw'}))
        open(fn,'wb').write(raw); time.sleep(0.5)
    txt=open(fn,encoding='utf-8',errors='replace').read()
    txt=re.sub(r'\{\{[^}]*\}\}|<[^>]+>|\[\[[^\]|]*\|?|\]\]|\'\'+|=+',' ',txt)
    n=len(txt.split()); tot+=n
    print(f"{n:8d} {t}")
print(f"{tot:8d} TOTAL {prefix}")
