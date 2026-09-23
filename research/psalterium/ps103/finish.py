import json
p='research/psalterium/ps103/prayed.json'
d=json.load(open(p))
D={x['id']:x for x in d['decisions']}
x=D['benedic']; o=x['options']
new=o.pop(1); old=o.pop(0)
new['note']='v2 gate — copies the Ps 102 formula row (102:1, 2, 22), so both psalms say the frame alike'; new['from']='glossary'
old['note']='v1 — without *ó*, as 41:6'; old['from']='v1'
x['options']=[new,old]+o
x['why']+=' **Finish:** Ps 102 set the formula row *Bendize, ó minha alma, ao Senhor* (dative kept, with *ó*); 103:1 and 103:35 copy it.'
d['verses']['103:12']=d['verses']['103:12'].replace('farão ouvir as suas vozes','farão ouvir vozes')
d['choices']['103:12']=d['choices']['103:12'].replace('the plural kept.','the plural kept; no possessive, as the Latin (*dabunt voces*; v2 gate).')
d['status']='gated'
R=lambda v,r,oc,why=None,dec=None:{k:w for k,w in {'verse':v,'remark':r,'outcome':oc,'decision':dec,'reason':why}.items() if w}
d['audit'].append({'step':'gate','file':'critic/v2.latinist.json','model':'claude-opus-5-5 (fresh context, with latin.json)','note':'7 minors on 6 verses, no major. One taken (103:12); the rest are v1 remarks already refused under rulings. Overall: \'a faithful, close rendering of the whole psalm\'.','outcomes':[
 R('103:6','se deterão → estarão','refused','the *stare* row: *deter-se* (1:1) where a thing stands still; option 2.','stabunt'),
 R('103:12','as suas vozes → vozes','taken'),
 R('103:19','conhece → conheceu','refused','D44 (settled): *cognóvi* present sense.','cognovit'),
 R('103:24','bens → possessão','refused','*possessão* is heard as demonic possession; 77:48 *bens*.','possessio'),
 R('103:25','braços → mãos; rastejam seres → há répteis','refused','*espaçoso de mãos* is not Portuguese; *répteis* zoological; both options.','manibus'),
 R('103:34','o que digo → a minha palavra','refused','D16, D26: *palavra* is *verbum / sermo*\'s.','eloquium')]})
d['audit'].append({'step':'finish','note':'103:1, 103:35 copy the Ps 102 formula row (*ó minha alma*). Glossary rows and PROGRESS row added.'})
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2); open(p,'a').write('\n')
