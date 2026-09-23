"""Ps 224 v2: apply the v1 readers' taken remarks and record outcomes (one-off)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def promote(did, label):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(i))


d['version'] = 2
v = d['verses']
v['15:13'] = 'Estendestes a vossa mão, e a terra os devorou. * Na vossa misericórdia fostes o guia do povo que resgatastes:'
d['choices']['15:13'] = ("extendísti manum tuam → estendestes a vossa mão (137:7; LH the same). Dux fuísti → fostes o guia (79:10 'Fostes guia'); "
                         "v2 puts 'in misericórdia tua' first so 'guia' meets 'do povo' (the stylist: draft 1's parenthesis broke the construction). "
                         "redímere → resgatar (73:2b 'Resgatastes', 76:15).")
v['15:21'] = 'Pois Faraó entrou {eques} no mar com os seus carros e os seus cavaleiros: * e o Senhor fez voltar sobre eles as águas do mar:'
d['choices']['15:21'] = ("íngredi → entrar (row). redúcere → 'fez voltar' (v2, the stylist: draft 1's 'trouxe de volta', 212's, sounded like errands here; "
                         "the row's 'trazer' needs an object that is carried, and waters returning over the enemy want the causative). "
                         "aquæ maris → as águas do mar (32:7).")

# 15:19 operari: D43's own option for a made thing
promote('operatus', 'fizestes')
dec['operatus']['why'] += (" v2: 'fizestes', D43's option. The stylist failed 'operastes' as surgery or machinery, and the ambiguity reader heard "
                           "'operated / worked on'. D43 settled the verb with 'opus' as its object ('a obra que operastes'); here the object is a dwelling.")
dec['operatus']['options'][0]['note'] = 'v2 draft. D43 option; plain for a building.'
dec['operatus']['options'][1]['note'] = "v1. D43's settled word, kept for the ruling."

# 15:20 ultra
dec['ultra']['options'].insert(0, {'label': 'e ainda além', 'forms': {'ultra': 'e ainda além'},
                                   'note': "v2 draft (the stylist): 'ainda' keeps it temporal, 'more still'.", 'from': 'stylist'})
dec['ultra']['options'][1]['note'] = "v1. The stylist heard it as spatial and as the pop catchphrase ('ao infinito e além')."

# 15:9 implebitur
promote('implebitur', 'a minha alma se fartará')
dec['implebitur']['why'] += (" v2: the ambiguity reader heard 'se encherá' as a spiritual filling, which reverses the sense of the enemy's greed. "
                             "'se fartará' (62:6's verb for repléri) says the glut. Cost: implére and repléri share a word here.")
dec['implebitur']['options'][0]['note'] = "v2 draft. The glut the Latin means; 62:6's verb."
dec['implebitur']['options'][1]['note'] = "v1. The glossary's verb; heard as spiritual filling."

# 15:22 medio
promote('medio', 'no meio do mar')
dec['medio']['why'] += " v2: the ambiguity reader could not hear who owns 'dele' after the break (sea, Pharaoh, dry land)."
dec['medio']['options'][0]['note'] = "v2 draft. Names the sea (DM1962)."

# 15:7 spiritu7: refused, note
dec['spiritu7']['why'] += (" v1 Latinist (minor) asked 'no espírito do vosso furor' to keep one word with 15:11. Held: the ambiguity reader heard "
                           "'sopro do vosso furor' as the blast of God's anger, the intended wind; 'espírito do furor' is a temper. 17:16 builds the same image with 'sopro'.")

d['audit'] = [a for a in d['audit'] if a['step'] not in ('latinist', 'stylist', 'ambiguity', 'revision') and not (a['step'] == 'checks' and a.get('version') == 2)]
d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'claude-opus-5-5, fresh context, with latin.json. One verse minor, no majors. It found tenses, jussives, the Vulgate readings and the pointing faithful.',
     'outcomes': [{'verse': '15:7', 'remark': "'sopro' for spíritus parts it from 15:11 'espírito'; fix 'no espírito do vosso furor'",
                   'outcome': 'option', 'decision': 'spiritu7',
                   'reason': "Held. 'espírito do furor' is heard as a temper, not the blast. The ambiguity reader heard 'sopro' as the wind of God's anger. 17:16 is the precedent ('ao sopro do espírito da vossa ira'). The one-word reading stays option 2."}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'claude-opus-5-5, fresh context, with latin.json. Four remarks, all taken. Best line 15:8, worst 15:13.',
     'outcomes': [
         {'verse': '15:13', 'remark': "the parenthesis cuts 'guia' from 'do povo'", 'outcome': 'taken', 'reason': "'Na vossa misericórdia fostes o guia do povo que resgatastes'."},
         {'verse': '15:19', 'remark': "'operastes' is surgery / machinery → 'fizestes'", 'outcome': 'taken', 'decision': 'operatus', 'reason': "D43's own option. D43 settles the verb with 'opus' as its object; here the object is the dwelling. 'operastes' kept as option 2 for the ruling."},
         {'verse': '15:20', 'remark': "'e mais além' spatial, pop catchphrase → 'e ainda além'", 'outcome': 'taken', 'decision': 'ultra'},
         {'verse': '15:21', 'remark': "'trouxe de volta' colloquial → 'fez voltar'", 'outcome': 'taken'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': "claude-opus-5-5, fresh context, Portuguese only. 34 items. Most are the Latin's own openness, heard as meant: 'se engrandeceu' as triumph, 'entre os fortes', 'terrível' as awe-inspiring, who 'Fiquem imóveis' are, the enemy's unnamed objects in 15:9–10, and 'Soprou o vosso espírito' as the Spirit, which is 147:7's reading and is kept. Acted on: 15:9 and 15:22. Unknown: despojos, Desembainharei, Filisteia, Edom, Moab, impetuosas. All are kept: they are the glossary's words (67:13, 36:14, D43) or proper names.",
     'outcomes': [
         {'verse': '15:9', 'remark': "'a minha alma se encherá' heard as spiritual filling", 'outcome': 'taken', 'decision': 'implebitur', 'reason': "'se fartará' (62:6)."},
         {'verse': '15:22', 'remark': "owner of 'dele' not audible", 'outcome': 'taken', 'decision': 'medio', 'reason': "'no meio do mar'."},
         {'verse': '15:4', 'remark': "'carros' first suggests cars", 'outcome': 'option', 'decision': 'currus', 'reason': "The reader heard chariots from context (Pharaoh, army). 'carros de guerra' remains the option."},
         {'verse': '15:6', 'remark': "'direita' may be heard as a side", 'outcome': 'refused', 'reason': "It is the glossary's word (déxtera row). The reader's likely hearing is the right hand."},
         {'verse': '15:11', 'remark': "'espírito' heard as the Holy Spirit", 'outcome': 'option', 'decision': 'spiritus11', 'reason': "The Latin's double sense, as 147:7. 'vento' remains the option."},
         {'verse': '15:15', 'remark': "unknown 'Filisteia'", 'outcome': 'option', 'decision': 'philisthiim', 'reason': "'dos filisteus' remains the option."}]},
    {'step': 'revision', 'version': 2,
     'note': "v2: 15:9 'se fartará'; 15:13 reordered; 15:19 'fizestes'; 15:20 'e ainda além'; 15:21 'fez voltar'; 15:22 'no meio do mar'. Draft 1 kept as prayed.v1.json / prayed.v1.vos.json. The Latinist gate is re-run as critic/v2.latinist.json."},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
