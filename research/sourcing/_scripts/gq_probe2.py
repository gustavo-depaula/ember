import re,sys
D='/Users/gustavo/Documents/prayer/research/sourcing/gueranger/ia/'
f=sys.argv[1]
L=open(D+f,errors='replace').read().replace('\x0c','').split('\n')
a=int(sys.argv[2]); b=int(sys.argv[3]) if len(sys.argv)>3 else len(L)
for i in range(a,min(b,len(L))):
    t=re.sub(r'\s+',' ',L[i].strip())
    if len(t)<6 or len(t)>80: continue
    al=[c for c in t if c.isalpha()]
    if not al: continue
    up=sum(c.isupper() for c in al)/len(al)
    if up<.8: continue
    if i>0 and L[i-1].strip()=='' :
        print(i,t)
