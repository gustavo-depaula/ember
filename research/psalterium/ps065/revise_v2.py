import json
p='prayed.json'
d=json.load(open(p))
D={x['id']:x for x in d['decisions']}
def front(did, label, note_add=None, why_add=None):
    x=D[did]; ops=x['options']
    i=[o['label'] for o in ops].index(label)
    o=ops.pop(i); ops.insert(0,o)
    for q in ops[1:]:
        if q.get('note','').startswith('draft'): q['note']=q['note'].replace('draft','draft 1',1)
    o['note']=(note_add or 'v2')+(' — '+o['note'] if o.get('note') else '')
    if why_add: x['why']+=' '+why_add
def newfirst(did, opt, why_add):
    x=D[did]
    for q in x['options']:
        if q.get('note','').startswith('draft'): q['note']=q['note'].replace('draft','draft 1',1)
    x['options'].insert(0,opt); x['why']+=' '+why_add

front('mentientur','vos mentirão os vossos inimigos','v2 (stylist)',
  '**v2:** the Latin\'s order taken at the stylist\'s remark: subject last gives a paroxytone close and breaks the *multidão … mentirão* echo; after the fronted *na multidão do vosso poder,* the clitic before the verb is normal Brazilian order.')
front('advitam','para a vida','v2 (Latinist, stylist)',
  '**v2:** *ad* is direction/purpose; both the Latinist and the stylist heard *na vida* as a place. *para a vida* taken.')
newfirst('v14',{"label":"E falou a minha boca","forms":{"v14":"E falou a minha boca"},"note":"v2 (Latinist) — the Latin\'s plain coordinate clause, verb first as the Latin","from":"latinist"},
  '**v2:** the Latinist: *Et locútum est* is a plain coordinate clause; *que* resolves a construction the Latin leaves loose. The stylist also heard *votos que a boca falou* stumble. Taken; the relative link stays audible through the comma of 65:13 as much as in the Latin.')
front('aspexi','Se eu olhei para a iniquidade','v2 (stylist)',
  '**v2:** the stylist and the ambiguity reader both heard *contemplei* with its devotional sense (contemplação), a collision the Latin does not have. The Greek is ἐθεώρουν, but the plain verb keeps the image of looking; *olhar* is not claimed by a settled row (respícere is *estar voltado* here, prospícere *olhar* in 13:2 as open). *contemplei* stays an option.')
newfirst('induxisti',{"label":"Vós nos fizestes entrar","forms":{"induxisti":"Vós nos fizestes entrar"},"note":"v2 (stylist) — pronoun named, proclisis as 65:12 *nos fizestes*; 63:3 *Vós me protegestes* precedent","from":"stylist"},
  '**v2:** the stylist heard the enclitic opening stiff and out of step with 65:12 *e nos fizestes sair*; the subject pronoun is allowed (rule 2) and 63:3 took the same fix.')
# 65:10 vocative
d['decisions'].append({"id":"deus10","refs":["65:10"],"latin":"Quóniam probásti nos, Deus","kind":"grammar","why":"Bare vocative, as the glossary's *Deus (vocative)* row (no *ó* unless the Latin has *o*). **v2:** the stylist asked for *ó Deus* (the liturgical ear); refused by the row, kept as the option.","options":[{"label":"Deus","forms":{"deus10":"Deus"},"note":"draft — the row","from":"glossary"},{"label":"ó Deus","forms":{"deus10":"ó Deus"},"note":"stylist v2; MS1932","from":"stylist"}]})
d['verses']['65:10']=d['verses']['65:10'].replace('provastes, Deus:','provastes, {deus10}:')
# 65:16 order
d['decisions'].append({"id":"v16a","refs":["65:16"],"latin":"Veníte, audíte, et narrábo, omnes qui timétis Deum","kind":"grammar","why":"**v2:** the stylist (worst line) heard the vocative wedged between *narrarei* and its object across the mark. Order yields to the ear (D2): the vocative goes with the imperatives it belongs to, and *narrarei* leads into what is narrated. Every word kept; the mark still divides the call from the story. *o quanto* (his other remark) refused: *narrarei quanto ele fez* is the normal indirect exclamative.","options":[{"label":"todos vós que temeis a Deus, e eu narrarei","forms":{"v16a":"todos vós que temeis a Deus, e eu narrarei"},"note":"v2 (stylist)","from":"stylist"},{"label":"e eu narrarei, todos vós que temeis a Deus:","forms":{"v16a":"e eu narrarei, todos vós que temeis a Deus:"},"note":"draft 1 — the Latin's order","from":"draft"}]})
d['verses']['65:16']='Vinde, {audite}, {v16a} * {quanta}.'
# refused ones: notes on decisions
D['exasperant']['why']+=' **v2:** the Latinist (minor) asked for the absolute *os que exasperam*; refused as grammar (D2) — *exasperar* wants an object, and the ambiguity reader heard *o* as God. His wording is the option.'
if not any(o['label']=='os que exasperam' for o in D['exasperant']['options']):
    D['exasperant']['options'].append({"label":"os que exasperam","forms":{"exasperant":"os que exasperam"},"note":"Latinist v2; absolute, as the Latin","from":"latinist"})
D['exaltavi']['why']+=' **v2:** the Latinist (minor) asked for the absolute *e exaltei*; refused as grammar (D2), his wording is the option already.'
D['qui']['why']+=' **v2:** the Latinist asked for *Que pôs* in 65:9 (the relative hanging on 65:8\'s *ejus*); refused for the reasons above — and 65:9 must stand alone in the Offertory Pasc5-0 only with 65:8, where *Ele* reads as well.'
D['v5b']['why']+=' **v2:** the stylist asked for *ele é terrível*; refused — the Latin is verbless and the singular *terrível* can only be God (the ambiguity reader heard it so). Option kept.'
D['mesoclise']['why']+=' **v2:** the stylist asked to drop *Eu* (*Vos oferecerei*); refused — a colon opening on a clitic is what naming the subject avoids, and the mesóclise is the option.'
d['version']=2
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2); open(p,'a').write('\n')
