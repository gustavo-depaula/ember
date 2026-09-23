"""Revise ps216 to v2 after the v1 readers, and record their outcomes in the audit.
python3.13 research/psalterium/ps216/revise_v2.py  (idempotent: refuses to run twice)"""
import json
import shutil
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] != 1:
    raise SystemExit('already revised')
shutil.copy(p, here / 'prayed.v1.json')
shutil.copy(here / 'prayed.vos.json', here / 'prayed.v1.vos.json')

dec = {x['id']: x for x in d['decisions']}

# 36:8 afflíge: the Latinist (minor) found *atormentai* narrower than the Latin; *afligi* stays banned.
a = dec['affige']
a['why'] = ("*Afflígere → afligir* is the glossary's (16:8b). But the *vós* imperative *afligi* is also 'I afflicted', and the "
            "object is a noun, so D13's enclitic exception does not reach it (D18). The bare form is banned. v1 took *atormentai*. "
            "The Latinist (minor) found it narrower than the Latin, which is 'strike down, dash, afflict' (L&S; LXX ἔκτριψον "
            "'crush, wipe out'), and named *abatei*. *Abater* is the psalter's word for *deícere* (Ps 36:14b) and *depónere* "
            "(58:12b *abatei-os*), and the verse meets neither verb. It is the plain 'strike down', parallel to *Tirai o adversário*.")
a['options'] = [
    {'label': 'abatei o inimigo', 'forms': {'affige': 'abatei o inimigo'},
     'note': "v2, the Latinist's word: 'strike down'. Safe at the imperative (past *abati*). It shares *abater* with deícere and depónere, neither of which occurs here.",
     'from': 'latinist'},
    {'label': 'atormentai o inimigo', 'forms': {'affige': 'atormentai o inimigo'},
     'note': 'v1. A free verb, but it narrows the Latin to lasting torment (the Latinist).', 'from': 'draft'},
    {'label': 'e o inimigo, afligi-o', 'forms': {'affige': 'o inimigo, afligi-o'},
     'note': "Keeps the glossary's verb; the enclitic makes it an imperative (D13). The fronted object breaks the parallel with *Tirai o adversário*.",
     'from': 'draft'},
    {'label': 'afligi o inimigo', 'forms': {'affige': 'afligi o inimigo'},
     'note': "Word for word, and what the Latinist asked first. Banned: 'and I afflicted the enemy'.", 'from': 'glossary'},
]

# 36:6: the stylist heard *conhecemos* dangling; *nós também* runs into the *que* clause. Order only (D2).
d['verses']['36:6'] = 'Para que vos conheçam, como {cognovimus}, * que não há Deus {praeterA}, Senhor.'
for o, f in zip(dec['cognovimus']['options'], ['nós também conhecemos', 'nós também vos conhecemos', 'nós também sabemos']):
    o['forms'] = {'cognovimus': f}
dec['cognovimus']['options'][0]['label'] = 'nós também conhecemos'
dec['cognovimus']['options'][0]['note'] = "v2, the stylist's order: *nós também* puts the verb where the *que* clause follows at once. Bare, as the Latin."
dec['cognovimus']['options'][1]['label'] = 'nós também vos conhecemos'
dec['cognovimus']['options'][2]['label'] = 'nós também sabemos'

# 36:10: the ambiguity reader heard 'let whoever is saved be devoured', a curse on the saved.
s = dec['salvatur']
s['why'] += (" v2: the ambiguity reader heard exactly that, 'whoever is saved' in the religious sense, as a curse on the saved. "
             "In a prayer that misreading is too costly, so the plain sense is taken. *Escapar* is the sense of σῳζόμενος here, and "
             "DRB, MS1932 and DM1962 all have it. The Latin's verb stays as option 2.")
s['options'] = [
    {'label': 'quem escapa', 'forms': {'salvatur': 'quem escapa'},
     'note': "v2. DRB 'him that escapeth', MS1932 *o que escapar*. Loses the Latin's verb, and keeps its sense.", 'from': 'ambiguity'},
    {'label': 'quem se salva', 'forms': {'salvatur': 'quem se salva'},
     'note': 'v1; the Latin\'s verb in its everyday sense. Heard as "whoever is saved" by the ambiguity reader.', 'from': 'draft'},
]

# The readers' outcomes.
d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Reader: claude-opus-5-5, fresh context, with latin.json. One minor remark; everything else judged faithful, with the pointing correct.',
     'outcomes': [
         {'verse': '36:8', 'remark': 'atormentai narrows afflíge to prolonged torment; asks afligi (or abatei)', 'outcome': 'taken',
          'reason': "*abatei*, his second word. His first, *afligi*, falls to the homograph ban (D18) and stays as a marked, refused option in `affige`."}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Reader: claude-opus-5-5, fresh context, with latin.json. 8 remarks: 1 taken, 7 refused (six against glossary rows). Worst line 36:1, best 36:9.',
     'outcomes': [
         {'verse': '36:1', 'remark': 'compaixões sounds coined; asks misericórdias', 'outcome': 'refused',
          'reason': "*Miseratiónes → compaixões* is the glossary's row (24:6, 50:3b, 102:4), kept apart from *misericórdia* because the Greek has two words too. The stylist asked *clemências* at 50:3b, also refused. *Misericórdias* would merge the two families."},
         {'verse': '36:3, 36:12', 'remark': 'grandes coisas flat; asks grandes obras', 'outcome': 'refused',
          'reason': "*Magnália → as grandes coisas* is the glossary's row (70:19, 105:21). *Grandes obras* was refused at 105:21 as *ópera*'s word."},
         {'verse': '36:4', 'remark': 'estranhas heard as odd; asks estrangeiras', 'outcome': 'refused',
          'reason': "*Aliénus → estranho* is the glossary's row, wider than 'foreign' (anyone not one's own; 17:46). The ambiguity reader heard 'foreign nations' first."},
         {'verse': '36:4', 'remark': 'potência technical; asks o vosso poder', 'outcome': 'refused',
          'reason': "*Poténtia → potência* is the glossary's row (64:7, 70:19, Ps 144). *Poder* is *virtus*'s word."},
         {'verse': '36:6', 'remark': 'conhecemos dangles; move também: como nós também conhecemos', 'outcome': 'taken',
          'reason': 'Order only (D2); decision `cognovimus`.'},
         {'verse': '36:13', 'remark': 'início administrative; asks princípio', 'outcome': 'refused',
          'reason': "*Ab inítio → desde o início* is the glossary's row (73:2, where the stylist asked for *princípio* and was refused). *Princípio* is *princípium*'s."},
         {'verse': '36:14', 'remark': 'ends on a proparoxytone; inversion que ao vosso primogênito igualastes', 'outcome': 'refused',
          'reason': 'He calls it tolerable, since the Latin has the same stress. The inversion costs more naturalness than the cadence costs sound.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': 'Reader: claude-opus-5-5, fresh context. 27 readings, most of them as intended. Unknown words: inenarráveis, compaixões, primogênito.',
     'outcomes': [
         {'verse': '36:10', 'remark': "quem se salva heard as 'whoever is saved', a curse on the saved", 'outcome': 'taken',
          'reason': '*quem escapa* (DRB, MS1932, DM1962); decision `salvatur`.'},
         {'verse': '36:13', 'remark': "E os herdareis: 'os' has no audible referent; herdar suggests receiving after a death", 'outcome': 'refused',
          'reason': "*Os* is the tribes of 36:12, the line before. *Herdar* is the Latin's verb and its openness, as at 81:8. The options that decide stay in `hereditabis`. Hold for Gustavo's ear."},
         {'verse': '36:14', 'remark': "sobre o qual foi invocado o vosso nome heard as 'the people who called upon your name'", 'outcome': 'option',
          'decision': 'invocatum',
          'reason': "The Latin's idiom, a Hebraism the LXX keeps too (ἐπικέκληται). The misreading is pious and close. The Lectionary's *que é chamado pelo vosso nome* stays option 2 if the ear should win."},
         {'verse': '36:14', 'remark': 'primogênito heard as Christ', 'outcome': 'refused',
          'reason': "The Latin's word; the Christian reading is one the Church's use of the canticle invites."},
         {'verse': '36:7', 'remark': "braço direito may evoke 'right-hand man'; no possessive said", 'outcome': 'refused',
          'reason': "The Latin has no possessive (D2). *Glorificai a mão* just before fixes the sense as God's arm; the reader himself heard 'your hand and your right arm'."},
         {'verse': '36:7', 'remark': 'mudai as maravilhas: new wonders or altered ones', 'outcome': 'refused',
          'reason': "The Latin's *immúta* is just as open; *variai* stays as option 2 in `immuta`."},
         {'verse': '36:11', 'remark': "quebrar a cabeça is also the idiom 'to puzzle over'", 'outcome': 'refused',
          'reason': "He heard the literal sense first. The idiom needs a person as subject puzzling; here God breaks the princes' head. 9:36 *Quebrai o braço* is the precedent."}]},
    {'step': 'revision', 'version': 2,
     'note': 'v2: 36:8 *abatei o inimigo* (the Latinist); 36:6 *como nós também conhecemos* (the stylist, order); 36:10 *quem escapa* (the ambiguity reader). The draft is kept as prayed.v1.json.'},
]
d['version'] = 2
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
