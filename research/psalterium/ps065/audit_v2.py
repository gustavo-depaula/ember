import json
p='prayed.json'; d=json.load(open(p))
d['audit']=[a for a in d['audit'] if a['step'] not in ('latinist','stylist','ambiguity','revision') or a.get('version')==3]
M='claude-opus-5-5 (fresh context)'
d['audit']+= [
{"step":"latinist","file":"critic/v1.latinist.json","model":M,"note":"Read with latin.json. 4 minor, no major; 2 taken, 2 refused as grammar with his wording kept as the option, the 65:9 relative refused.","outcomes":[
 {"verse":"65:7","remark":"*o* supplied to absolute *exásperant*; *os que exasperam*","outcome":"refused","decision":"exasperant","reason":"grammar (D2): *exasperar* wants an object; option added"},
 {"verse":"65:9","remark":"*ad vitam* is directional; *para a vida*","outcome":"taken","decision":"advitam"},
 {"verse":"65:9","remark":"*Qui* made an independent *Ele*; *Que pôs*","outcome":"refused","decision":"qui","reason":"an opening *Que* is heard as a wish or question; the *Ele … Ele … Ele* anaphora keeps the three relatives"},
 {"verse":"65:14","remark":"*que* adds a relative the Latin leaves loose; *E falou a minha boca*","outcome":"taken","decision":"v14"},
 {"verse":"65:17","remark":"*o* supplied to absolute *exaltávi*","outcome":"refused","decision":"exaltavi","reason":"grammar (D2); *e exaltei* was already the option"}]},
{"step":"stylist","file":"critic/v1.stylist.json","model":M,"note":"Read with latin.json. 9 remarks in 9 verses; 5 taken, 4 refused and kept as options. Worst line 65:16, best 65:9.","outcomes":[
 {"verse":"65:3","remark":"*os vossos inimigos vos mentirão* piles v-syllables, oxytone chime with *multidão*; subject last","outcome":"taken","decision":"mentientur","reason":"also the Latin's order"},
 {"verse":"65:5","remark":"bare *terrível* hangs; *ele é terrível*","outcome":"option","decision":"v5b","reason":"the Latin is verbless and the singular can only be God"},
 {"verse":"65:9","remark":"*na vida* locative; *para a vida*","outcome":"taken","decision":"advitam"},
 {"verse":"65:10","remark":"bare vocative *Deus*; *ó Deus*","outcome":"option","decision":"deus10","reason":"the Deus (vocative) row: no *ó* unless the Latin has *o*"},
 {"verse":"65:11","remark":"*Fizestes-nos* stiff, out of step with 65:12; *Vós nos fizestes entrar*","outcome":"taken","decision":"induxisti","reason":"63:3 precedent (*Vós me protegestes*)"},
 {"verse":"65:14","remark":"*votos que a boca falou* stumbles; *proferiu*","outcome":"taken","decision":"v14","reason":"answered by the Latinist's *E falou a minha boca*, which drops the relative"},
 {"verse":"65:15","remark":"drop *Eu* (*Vos oferecerei*)","outcome":"refused","decision":"mesoclise","reason":"a colon opening on a clitic; the mesóclise is the option"},
 {"verse":"65:16","remark":"vocative wedged after *narrarei*; move it, and *o quanto*","outcome":"taken","decision":"v16a","reason":"order yields (D2); *o quanto* refused — *narrarei quanto ele fez* is standard"},
 {"verse":"65:18","remark":"*contemplei* carries contemplação; *olhei para*","outcome":"taken","decision":"aspexi","reason":"the ambiguity reader heard the same"}]},
{"step":"ambiguity","file":"critic/v1.ambiguity.json","model":"claude-opus-5-5 (fresh context)","note":"Portuguese only. 26 items. Heard rightly: 65:5 (God is terrible), 65:7, 65:8, 65:11 *costas*, 65:12, 65:13 *votos*, 65:16, 65:20. The Latin's own obscurities kept: 65:1 *dai glória ao seu louvor*, 65:3 *mentirão* (feigned submission not audible — the verb is 17:46's), 65:6 *passarão* future and *nele*, 65:15 *incenso de carneiros*, 65:17 *sob a minha língua*, 65:18–19 the condition and *Por isso*. Unknown words *desígnios*, *exasperam*, *refrigério*, *holocaustos*, *tutano*: all glossary words or the Latin's concrete image, kept.","outcomes":[
 {"verse":"65:9","remark":"*pôs a minha alma na vida* heard as 'gave me life'","outcome":"taken","decision":"advitam","reason":"*para a vida*, with the two critics"},
 {"verse":"65:14","remark":"*E que a minha boca falou* heard as a fragment","outcome":"taken","decision":"v14","reason":"*E falou a minha boca*"},
 {"verse":"65:18","remark":"*contemplei* heard as mere looking/thinking","outcome":"taken","decision":"aspexi","reason":"*olhei para* — plainer, same image; the consent the Hebrew implies is not in *aspéxi* either"},
 {"verse":"65:18–19","remark":"*não escutará … Por isso Deus escutou* sounds contradictory","outcome":"refused","reason":"the Latin's real condition and *proptérea* (decision aspexi); the logic is the Latin's"},
 {"verse":"65:10, 65:11, 65:13","remark":"*provar* 'taste', *laço* 'ribbon', *holocausto* the genocide","outcome":"refused","reason":"glossary rows (examinar/provar, laço, holocausto); context carries them"}]},
{"step":"revision","version":2,"note":"v1 kept as prayed.v1.json / prayed.v1.vos.json. Changed: 65:3 order, 65:9 *para a vida*, 65:10 slot for the vocative (text unchanged), 65:11 *Vós nos fizestes entrar*, 65:14 *E falou a minha boca*, 65:16 order, 65:18 *olhei para*. Script revise_v2.py."}]
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2); open(p,'a').write('\n')
