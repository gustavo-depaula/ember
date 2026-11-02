import re,sys
L=open(sys.argv[1],encoding='utf8').read().split('\n')
def upper(s):
    a=[c for c in s if c.isalpha()]
    return len(a)>=3 and sum(c.isupper() for c in a)/len(a)>.7
st=[i for i,l in enumerate(L) if re.match(r"^\s*C\S{3,8},?\s+first",l)]
out=[]
for i in st:
    p=[j for j in range(i-1,max(i-14,0),-1) if L[j].strip() and 'Digitized' not in L[j]][:4]
    lab=None
    for k,j in enumerate(p):
        if upper(L[j].strip()) and len(L[j].strip())<70: lab=k;break
    out.append((i,lab,[L[j].strip() for j in reversed(p)]))
if __name__=='__main__':
    for i,lab,p in out:
        if lab is None or lab>2: print(i,lab,p)
    print(len(out))
