import sys, os, re
sys.path.insert(0, 'research/sourcing/_scripts')
import kempis_pair as kp
cfg={'file':'research/sourcing/kempis/en/sermonstonovices00thom.txt','start':1245,'end':13560,'marker':r'^\s*SERMON [IVXL]+\s*$','groups':(3800,8150)}
pre,res=kp.chapters(cfg,'en')
if __name__=='__main__':
    print(len(pre), len(res))
    for k,(g,t,ps) in enumerate(res,1):
        print(k,g,'|',t[:50],'|',len(ps),sum(len(p.split()) for p in ps),'|',(ps[0][:90] if ps else ''))
