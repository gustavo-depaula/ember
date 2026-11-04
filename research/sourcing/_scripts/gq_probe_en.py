import re,sys
D='/Users/gustavo/Documents/prayer/research/sourcing/gueranger/ia/'
f=sys.argv[1]
L=open(D+f,errors='replace').read().replace('\x0c','').split('\n')
MON='(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)'
DAY='(SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)'
c=0
for i,l in enumerate(L):
    t=re.sub(r'\s+',' ',l.strip())
    if len(t)<5 or len(t)>100: continue
    al=[x for x in t if x.isalpha()]
    if len(al)<4 or sum(x.isupper() for x in al)/len(al)<.8: continue
    if re.match(r'^'+MON+r' [\dIVXLC]+',t) or re.search(DAY,t) or re.match(r'^(THE )?(FEAST|VIGIL|OCTAVE|CHAPTER|ST\.|SAINT)',t):
        if re.search(r'\s\d{1,3}\.?$',t): continue  # running heads
        print(i,t); c+=1
print(c)
