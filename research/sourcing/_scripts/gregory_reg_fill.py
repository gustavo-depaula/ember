"""Fill the English letters that Latin Wikisource lacks (Book XIII, truncated) from Corpus Corporum TEI text 8064 (PL 77), then write the book.json with `la`. Run after gregory_reg_make.py."""
import re,sys,json,os
sys.path.insert(0,os.path.dirname(__file__))
from anselm_parse import latin_chapters
from gregory_reg_make import title
from gregory_reg_parse import split_addr
B='/Users/gustavo/Documents/prayer/content/books/church-fathers/gregory-great-pope/register-of-letters'
S='/Users/gustavo/Documents/prayer/research/sourcing/gregory-the-great/register-la/'
ch=latin_chapters(S+'cc-pl77-epistolae-8064.xml')
start=[i for i,c in enumerate(ch) if c['head'].startswith('LIBER DECIMUS TERTIUS')][0]
b13={k:c for k,c in enumerate(ch[start+1:start+50],1)}
j=json.load(open(S+'book.json.new'))
n_new=0
for t in j['toc']:
    m=re.fullmatch(r'Book XIII, Letter (\d+)',t['title']['en-US'])
    if not m or not t['title'].get('la')==None and 'la' in t['title']: continue
    n=int(m.group(1)); c=b13[n]
    h=re.sub(r'^EPISTOLA\s+[IVXLC]+\.?\s*','',c['head'])
    summ=''
    if '*' in h: h,summ=h.split('*',1); summ=summ.replace('*','').strip()
    addr,_=split_addr(h.strip())
    ti='Liber XIII, Epistola %d'%n
    md='# %s\n\n*%s.*\n\n'%(ti,title(addr))
    if summ: md+='*%s*\n\n'%summ
    md+='\n\n'.join(c['paras'])+'\n'
    open('%s/la/%s.md'%(B,t['id']),'w').write(md)
    t['title']={'la':ti,**t['title']}; n_new+=1
src=j['sources'][0]
src['description']="Latin letters matched to the English by book and letter number (Maurist numbering, the same as NPNF), all 420. 409 come from Latin Wikisource and 11 (XIII.18, 22, 26, 27, 31, 34, 38-42) from the Corpus Corporum TEI of PL 77 (text 8064, https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=8064), because the Wikisource page for Book XIII stops in the middle of letter 15. Each file keeps the Maurist summary and address; PL column numbers and markup removed; the editors' bracketed textual notes kept in the Wikisource letters. The Maurist footnotes are not included. The Register has about 430 further Latin letters that NPNF does not translate; they are not imported here."
json.dump(j,open(B+'/book.json','w'),ensure_ascii=False,indent=2); open(B+'/book.json','a').write('\n')
print('filled',n_new)
