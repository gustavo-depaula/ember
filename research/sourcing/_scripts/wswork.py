# usage: python3 wswork.py <lang> <outdir> <title>...  -> dumps page + subpages (title/...), prints words per work
import json,subprocess,sys,urllib.parse,os,re,time
lang,out=sys.argv[1:3]
def get(url):
    for i in range(40):
        p=subprocess.run(['curl','-s','-w','\n%{http_code}','-A','EmberCorpusResearch/1.0','--',url],capture_output=True).stdout
        body,code=p.rsplit(b'\n',1)
        if code==b'200': return body
        if code==b'404': return b''
        time.sleep(10)
    raise SystemExit('rate-limited: '+url)
def words(t):
    t=re.sub(r'\{\{[^}]*\}\}|<[^>]+>|\[\[[^\]|]*\|?|\]\]|\'\'+|=+',' ',t); return len(t.split())
for title in sys.argv[3:]:
    d=os.path.join(out,re.sub(r'[^\w.-]+','_',title)); os.makedirs(d,exist_ok=True)
    titles=[title]; cont={}
    while True:
        q={'action':'query','list':'allpages','apprefix':title+'/','aplimit':'500','format':'json',**cont}
        j=json.loads(get(f"https://{lang}.wikisource.org/w/api.php?"+urllib.parse.urlencode(q)))
        titles+=[p['title'] for p in j['query']['allpages']]
        if 'continue' not in j: break
        cont=j['continue']
    tot=0
    for t in titles:
        fn=os.path.join(d,re.sub(r'[^\w.-]+','_',t)+'.wiki')
        if not os.path.exists(fn):
            open(fn,'wb').write(get(f"https://{lang}.wikisource.org/w/index.php?"+urllib.parse.urlencode({'title':t,'action':'raw'}))); time.sleep(0.4)
        tot+=words(open(fn,encoding='utf-8',errors='replace').read())
    print(f"{tot:8d}\t{len(titles)}\t{title}",flush=True)
