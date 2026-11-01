import re,sys,html
s=open(sys.argv[1],encoding='latin-1').read()
i=s.find(f'<A Name="{sys.argv[2]}">');j=s.find('<A Name="',i+20)
for h,t in re.findall(r'<a href="(04z/[^"]+)"[^>]*>(.*?)</a>',s[i:j],re.S):
    m=re.search(r'__([A-Z]{2,3})\.(\w+)\.html$',h)
    print(m.group(1) if m else '?','|',html.unescape(t),'| https://www.documentacatholicaomnia.eu/'+h)
