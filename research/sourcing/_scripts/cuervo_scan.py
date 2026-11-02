import sys,re; sys.path.insert(0,"/Users/gustavo/Documents/prayer/research/sourcing/_scripts")
from cuervo import *
v=int(sys.argv[1]); lo=int(sys.argv[2]) if len(sys.argv)>2 else 0; hi=int(sys.argv[3]) if len(sys.argv)>3 else None
rx=re.compile(sys.argv[4] if len(sys.argv)>4 else r"^(CAP[IÍ]TULO|CAPITULO|TRATADO|LIBRO|PARTE|PRIMERA PARTE|SEGUNDA PARTE|TERCERA PARTE|CUARTA PARTE|DOCUMENTO|MEDITACI[OÓ]N|EXCLAMACI[OÓ]N|DI[AÁ]LOGO|CARTA|VIDA|SERM[OÓ]N|PR[OÓ]LOGO|INTRODUCCI[OÓ]N|ADVERTENCIA|EPÍSTOLA|AL LECTOR|FIN|COMIENZA)\b")
L=vol(v); out=[]
for i in range(lo,hi or len(L)):
    s=re.sub(r"\s+"," ",L[i]).strip()
    if rx.match(s) and len(s)<110 and not re.search(r"\d{2,3}\s*$",s): out.append("%d:%s"%(i,s[:60]))
print(len(L)); print(" | ".join(out))
