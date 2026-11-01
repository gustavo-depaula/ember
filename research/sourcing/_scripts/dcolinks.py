import sys,re,html
t=sys.stdin.buffer.read().decode('latin-1')
for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>',t,re.S):
  h,x=m.groups(); x=html.unescape(re.sub('<[^>]+>','',x)).strip()
  if any(k in h for k in sys.argv[1:]): print(h,'|',x[:80])
