import json
p='research/psalterium/ps103/prayed.json'
d=json.load(open(p))
D={x['id']:x for x in d['decisions']}
def promote(did, label, forms, note, frm, append_why=''):
    x=D[did]; opts=x['options']
    old=opts[0]; old['note']=old['note'].replace('draft — ','v1 — ').replace('draft','v1',1) if old['note'].startswith('draft') else 'v1 — '+old['note']
    old['from']='v1'
    rest=[o for o in opts if o['label']!=label]
    new=next((o for o in opts if o['label']==label),None) or {'label':label,'forms':forms}
    new['forms']=forms; new['note']=note; new['from']=frm
    x['options']=[new]+rest
    if append_why: x['why']+=' '+append_why
promote('magnificatus','fostes muito engrandecido',{'magnificatus':'fostes muito engrandecido'},
 'v2 — the Latin\'s passive (Latinist); the reflexive could be heard as self-aggrandizement (ambiguity reader)','latinist',
 '**v2:** the Latinist asked the passive and the ambiguity reader heard *engrandecer-se* as possibly self-aggrandizement, said of God; taken. 103:24 keeps the 91:6 formula (the works, where the reflexive cannot mislead); the root still links the two verses.')
promote('ascensum','por vossa subida',{'ascensum':'por vossa subida'},
 'v2 — the stylist: *pôr por* = set as (as *ter por*, *tomar por*); *como* was heard as a comparison','stylist',
 '**v2:** *pôr … por* (stylist; the ambiguity reader also heard *como* as a simile).')
promote('stabilitas','a sua firmeza',{'stabilitas':'a sua firmeza'},
 'v2 — the stylist: plainer, and the colon loses two syllables; the 96:2 *corréctio* row is open and far away','stylist',
 '**v2:** *firmeza* (stylist; +4 syllables in v1). It meets 96:2 *corréctio → firmeza* (an open row) in another psalm; noted for the glossary.')
promote('emittis','enviais as fontes nos vales',{'emittis':'enviais as fontes nos vales'},
 'v2 — the Latinist: *in convállibus* is *nos vales*; *pelos* borrowed 10b\'s movement','latinist',
 '**v2:** *nos vales* (Latinist).')
promote('confirmet','fortaleça',{'confirmet':'fortaleça'},
 'v2 — the Latinist: *confirmáre* is to make strong; *sustentar* softened it. MS1932, DRB','latinist',
 '**v2:** *fortaleça* (Latinist: στηρίζει, make firm; *sustente* feeds rather than strengthens). Avoids *confirmar* as the row asks; the 26:14 formula already uses *fortalecer-se* for *confortári*, a different Latin verb, in another psalm.')
promote('eloquium','o que digo',{'eloquium':'o que digo'},
 'v2 — D26\'s clause without *eu*, which the stylist found weak at the mediant; *eu* now stands only in 34b (*ego vero*)','stylist',
 '**v2:** the Latinist and the stylist both asked *a minha palavra*; refused — *palavra* already carries *verbum* and *sermo* (glossary row), and D16/D26 keep *elóquium* apart. The stylist\'s cadence point taken by dropping *eu*: *o que DI-go*, and the emphatic *eu, porém* of 34b now answers it alone.')
D['eloquium']['options'].insert(2,{'label':'a minha palavra','forms':{'eloquium':'a minha palavra'},'note':'Latinist and stylist, v1; merges with *verbum / sermo*','from':'latinist'})
V=d['verses']
V['103:13']=V['103:13'].replace('será saciada a terra','se saciará a terra')
V['103:16']=V['103:16'].replace('Serão saciadas as árvores do campo','As árvores do campo se saciarão')
V['103:35']=V['103:35'].replace('de modo que já não existam','até não existirem mais')
c=d['choices']
c['103:13']+=' **v2:** *se saciará* (stylist: the analytic passive was heavy); the Latin passive is medio-passive (D2). 103:16 takes the same form, so one Greek verb (χορτάζω) keeps one shape.'
c['103:16']=c['103:16'].replace(' Checks: +7 — *Saturabúntur → Serão saciadas* and the supplied *ele*; accepted.','')+' **v2:** *As árvores do campo se saciarão* — the stylist asked a pronominal (his *Saciam-se* changes the tense; refused); the subject is put first to avoid a proclitic at the head of the verse.'
c['103:35']=c['103:35'].replace('(*de modo que já não existam* for *ita ut non sint*; *já* from 38:14)','').replace('Checks: +7 syllables in the first colon  and','Checks:')+' **v2:** *ita ut non sint → até não existirem mais* (stylist: *de modo que* was the register of an explanation); *até* keeps the result, *não … mais* the *já* of 38:14.'
c['103:12']+=' **v2 (ambiguity reader):** *Sobre elas* may be heard with *feras* (103:11); the Latin *ea* is equally a bare pronoun (the waters of 103:10). Kept, not glossed.'
c['103:17']+=' **v2 (ambiguity reader):** *ouriços* may be heard as sea urchins; *ouriço* is also the land animal (MS1932), and *porco-espinho* is another animal. Kept.'
d['version']=2
refused_l=[
 ('103:1b','decor → formosura, not esplendor','refused','confessio','The *decor* row: *esplendor* (92:1a *vestiu-se de esplendor*, the same verb); kept apart from 95:6 *pulchritúdo → beleza*, as the twin requires.'),
 ('103:6','stabunt → estarão, not se deterão','refused','stabunt','The *stare* row gives *deter-se* where the thing stands still (1:1); *estarão* is flat at the cadence; option 2.'),
 ('103:19','cognovit → conheceu','refused','cognovit','D44 (settled): *cognóvi* with present sense → *conheço*; the perfect would be heard as a single past event.'),
 ('103:24a','passive, as 103:1','refused','magnificatus','The formula of 91:6a (*Como se engrandeceram*), kept word for word; 103:1 took the passive (v2).'),
 ('103:24b','possessio → possessão','refused','possessio','*possessão* is heard first as demonic possession in Brazil; *bens* as 77:48; *posse* option 1.'),
 ('103:25','manibus → mãos; reptilia → répteis','refused','manibus','*espaçoso de mãos* is not Portuguese (option 1); *braços de mar* keeps a limb. *répteis* is zoological (option 2).'),
 ('103:27','omnia → todas as coisas (27, 28)','refused','omnia','*todas as coisas aguardam … que lhes deis o alimento* makes things eat; option 1 keeps the neuter.'),
]
taken_l=[('103:1','passive fostes … engrandecido','taken','magnificatus'),('103:10','nos vales','taken','emittis'),('103:15','fortaleça','taken','confirmet'),('103:34','a minha palavra','refused','eloquium','*palavra* is *verbum / sermo*\'s (glossary, D16, D26); *eu* dropped instead.')]
outs=[]
for t in taken_l:
    o={'verse':t[0],'remark':t[1],'outcome':t[2],'decision':t[3]}
    if len(t)>4:o['reason']=t[4]
    outs.append(o)
for t in refused_l: outs.append({'verse':t[0],'remark':t[1],'outcome':t[2],'decision':t[3],'reason':t[4]})
d['audit'].append({'step':'checks','note':'v1: hard pass; soft flags recorded in choices (103:1, 15, 16, 17, 33, 35).'})
d['audit'].append({'step':'latinist','file':'critic/v1.latinist.json','model':'claude-opus-5-5 (fresh context, with latin.json)','note':'11 minors on 10 verses, no major. Three taken, eight refused under rulings or kept as options. Overall: \'a faithful, close translation … no verse adds or drops content\'.','outcomes':outs})
d['audit'].append({'step':'stylist','file':'critic/v1.stylist.json','model':'claude-opus-5-5 (fresh context, with latin.json)','note':'7 remarks; best line 103:8, worst 103:3. Five taken (two in modified form), two refused.','outcomes':[
 {'verse':'103:3','remark':'pôr … como → pôr … por','outcome':'taken','decision':'ascensum'},
 {'verse':'103:5','remark':'estabilidade → firmeza','outcome':'taken','decision':'stabilitas'},
 {'verse':'103:13','remark':'será saciada → se saciará','outcome':'taken'},
 {'verse':'103:14b','remark':'façais sair → tireis','outcome':'refused','reason':'*tirar* is *auferre*\'s (D41) and stands in 103:29 of this psalm; *edúcere → fazer sair* (row).'},
 {'verse':'103:16','remark':'Serão saciadas → Saciam-se','outcome':'modified','reason':'pronominal taken, tense kept: *As árvores do campo se saciarão*.'},
 {'verse':'103:34','remark':'o que eu digo → a minha palavra','outcome':'modified','decision':'eloquium','reason':'*palavra* refused (D16, D26); the weak mediant fixed by dropping *eu*.'},
 {'verse':'103:35','remark':'de modo que já não existam → até não existirem mais','outcome':'taken'}]})
d['audit'].append({'step':'ambiguity','file':'critic/v1.ambiguity.json','model':'claude-opus-5-5 (fresh context)','note':'60 readings; most are the Latin\'s own (subject of 103:7, 9, 14, 15; 103:27 *ele*; third person 103:16, 19). Acted on: 103:1 *engrandecestes-vos* as self-aggrandizement (→ passive, with the Latinist); 103:3 *como* as simile (→ *por*, with the stylist). Recorded, kept: 103:1b *confissão* as the sacrament (the known cost, 95:6); 103:12 *Sobre elas* heard with *feras*; 103:17 *ouriços* as sea urchins; 103:23 *tarde* as afternoon (58:7); 103:29 *desfalecerão* as fainting (row). Unknown words (transporão, garça, covis, iníquos …) are the settled vocabulary.'})
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2); open(p,'a').write('\n')
