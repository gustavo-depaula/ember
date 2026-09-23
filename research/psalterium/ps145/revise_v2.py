"""v2 of Ps 145 after the v1 readers (latinist, stylist, ambiguity — claude-opus-5-5, fresh context).
Run from the repo root: python3.13 research/psalterium/ps145/revise_v2.py"""
import json
from pathlib import Path

p = Path('research/psalterium/ps145/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def opt(label, form_key, form, note, frm):
    return {'label': label, 'forms': {form_key: form}, 'note': note, 'from': frm}


d['version'] = 2

# 145:2b — the stylist: the verb to the end of the colon, so the mediant is oxytone
d['verses']['145:2b'] = '{nolite}: * {filiis}, {inquibus}.'
n = dec['nolite']
n['why'] += (' v2: the stylist (v1) heard the proparoxytone *príncipes* at the mediant as a dactyl the tone must drag; rule 4 asks a '
             'last- or second-last-syllable stress before each mark. The verb moved to the end of the colon (order, D2): *Nos príncipes '
             'não confieis*. It also sets *nos príncipes* and *nos filhos dos homens* side by side at the head of each colon, which makes '
             'the apposition heard.')
n['options'] = [
    opt('Nos príncipes não confieis', 'nolite', 'Nos príncipes não confieis', 'v2 ruling (stylist): oxytone mediant; the two "nos" phrases parallel.', 'stylist'),
    opt('Não confieis nos príncipes', 'nolite', 'Não confieis nos príncipes', 'v1; the plain order, proparoxytone mediant.', 'draft'),
    opt('Não queirais confiar nos príncipes', 'nolite', 'Não queirais confiar nos príncipes', "The literal tier: keeps 'nolle' as a verb of will; heard as a softened request.", 'draft'),
    opt('Não ponhais a vossa confiança nos príncipes', 'nolite', 'Não ponhais a vossa confiança nos príncipes', "Near DM1962 / CNBB 'Não ponhais (a) vossa fé'; longer, loses the row's verb.", 'DM1962'),
]

# 145:4 — the ambiguity reader heard 'voltará à sua terra' as going home to one's native land
t = dec['terram']
t['why'] += (' v2: the ambiguity reader (v1) confirmed the risk — "many would hear terra natal rather than dust". A wrong first hearing is a '
             'fault (D2). The possessive is what makes the homeland: *voltará à terra* is heard as the ground (the burial, Gn 3:19), and keeps '
             "the Latin's noun. Cost: *suam* is not rendered; the reflexive adds only 'his own', which the earth he was taken from already is. "
             '*Ao seu pó* (MS1932; 103:29) would keep a possessive but put another Latin word in its place.')
t['options'] = [
    opt('voltará à terra', 'terram', 'voltará à terra', "v2 ruling: the Latin's noun; the possessive that makes 'homeland' left unsaid.", 'ambiguity'),
    opt('voltará à sua terra', 'terram', 'voltará à sua terra', 'v1; the Latin word for word. Heard as going home to one’s native land (ambiguity reader).', 'draft'),
    opt('voltará ao seu pó', 'terram', 'voltará ao seu pó', "MS1932; 103:29's wording. Right sense, another Latin word (púlvis).", 'MS1932'),
    opt('tornará à sua terra', 'terram', 'tornará à sua terra', 'The same homeland risk.', 'draft'),
]

# 145:5 — latinist: auxiliador (refused, option); stylist: 'e cuja esperança' (refused, option exists)
b = dec['beatus']
b['options'].append(opt('Bem-aventurado aquele cujo auxiliador é o Deus de Jacó', 'beatus',
                        'Bem-aventurado aquele cujo auxiliador é o Deus de Jacó',
                        'The Latinist (v1, minor): adjútor is an agent noun. Refused as at 118:114 and 9:10 (D24, D27): the row keeps auxílio 14/14.',
                        'latinist'))
s = dec['spes']
s['why'] += (" v2: the stylist (v1) asked for *e cuja esperança*, saying the beatitude breaks in two at the flex. Refused: the Latin has neither "
             "the conjunction nor the relative in the second member, and the ambiguity reader, who saw only the Portuguese, did not stumble "
             "on *a sua* — it took the verse as one blessing and the relative *que fez* as God's. The stylist's wording is option 3.")
s['options'][2]['note'] += ' The stylist (v1) asked for it.'
s['options'][2]['from'] = 'stylist'

# 145:7a — latinist: keep the relative (refused, option exists); stylist: 'faz juízo' heard as good sense (refused)
q = dec['qui7']
q['why'] += (' v2: the Latinist (v1, minor) asked for the relative *Que guarda*; he calls the finite form "defensible". Held: the '
             'ambiguity reader heard *Ele* as God without hesitation, and the relative at the head of a prayed verse is the weaker Portuguese.')
j = dec['judicium']
j['why'] += (" v2: the stylist (v1) heard *faz juízo* as 'behaves sensibly' (*toma juízo*) and asked *julga a causa dos que sofrem injustiça*; "
             "the ambiguity reader listed 'good sense' as a possible reading but heard 'does justice for the wronged' first. Held for 102:6's "
             "identical wording (rule 6) and D15's *juízo*: the stylist's *a causa* supplies a noun the Latin lacks (*causa* is its own word, "
             "42:1), and *faz justiça* spends *justítia*'s word and chimes with *injustiça*. Both are options.")
j['options'].append(opt('julga a causa dos que sofrem injustiça', 'judicium', 'julga a causa dos que sofrem injustiça',
                        "The stylist (v1). Plain; supplies 'causa', which the Latin does not have.", 'stylist'))

# 145:9 — stylist: 'exterminará os caminhos' not native; the ambiguity reader heard the sinners exterminated
x = dec['disperdet']
x['why'] += (" v2: the stylist (v1) found *exterminar* wrong with a thing as object ('used of living things') and heavy before the "
             "cadence (*e ex-*); the ambiguity reader heard the sinners themselves wiped out. Taken: with *caminhos* as object the Latin's "
             "verb is 'destroy' in its plain sense (DRB 'destroy', MS1932 'destruirá'), and of two faithful words the plainer wins (D2). "
             "A local departure from the working row, which was built on people as object and bans *destruir* only at the imperative "
             "(*destruí-os*); proposed to the row: *destruir* where the object is a thing and the verb is not an imperative. "
             "It also takes two syllables off the +5 colon.")
x['options'] = [
    opt('destruirá', 'disperdet', 'destruirá', 'v2 ruling (stylist): plain with a thing as object. MS1932, DRB.', 'stylist'),
    opt('exterminará', 'disperdet', 'exterminará', 'v1; the row (people as object). Heard as wiping out the sinners.', 'glossary'),
    opt('fará desaparecer', 'disperdet', 'fará desaparecer', 'The Greek ἀφανιεῖ; longer, and not the Latin’s word.', 'draft'),
]

# 145:10 — stylist and ambiguity reader: without 'ó' Sião can be apposition, or 'reigning over Zion'
z = dec['sion']
z['why'] += (" v2: both the stylist and the ambiguity reader (v1) heard the bare *Sião* as possibly in apposition, or as what is reigned "
             "over ('reinará … Sião'). The stylist asked *o teu Deus, ó Sião* — which brings back the Sião / geração rhyme. Taken halfway: "
             "*ó* marks the vocative, and the order stays with the mediant on *Deus*: *pelos séculos, ó Sião, o teu Deus*.")
z['options'] = [
    opt('ó Sião, o teu Deus', 'sion', 'ó Sião, o teu Deus', 'v2 ruling: the vocative marked (stylist, ambiguity reader); no rhyme.', 'stylist'),
    opt('Sião, o teu Deus', 'sion', 'Sião, o teu Deus', 'v1; the bare vocative read as apposition or as the realm (two readers).', 'checks'),
    opt('o teu Deus, ó Sião', 'sion', 'o teu Deus, ó Sião', 'The stylist (v1); MS1932. Latin order; rhymes Sião / geração at mediant and final.', 'stylist'),
    opt('o teu Deus, Sião', 'sion', 'o teu Deus, Sião', 'The Latin order, bare; the same rhyme.', 'draft'),
]
d['choices']['145:10'] = ("'O Senhor reinará' puts the subject first where the Latin has the verb first (natural order; 9:37 'O Senhor reinará "
                          "para sempre'). The vocative, marked with 'ó', is placed before the apposition to avoid the Sião / geração rhyme (decision sion).")

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': 'Two minor remarks, no major; "a faithful, close translation", tenses kept. Both refused, both options.',
     'outcomes': [
         {'verse': '145:5', 'remark': 'adjútor is an agent noun; auxílio abstract → auxiliador', 'outcome': 'option', 'decision': 'beatus',
          'reason': 'the adjútor row keeps auxílio 14/14; the same request refused at 118:114 and 9:10 (D24, D27)'},
         {'verse': '145:7a', 'remark': 'keep the relative chain: Que guarda', 'outcome': 'option', 'decision': 'qui7',
          'reason': 'he calls the finite form defensible; a relative heading a prayed verse reads as an exclamation; the ambiguity reader heard Ele as God'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': 'Five remarks; worst line 145:7a, best 145:7b. Two taken (2b order, 9 destruirá), one taken halfway (10 ó), two refused as options (5, 7a).',
     'outcomes': [
         {'verse': '145:2b', 'remark': 'proparoxytone mediant príncipes → Nos príncipes não confieis', 'outcome': 'taken', 'decision': 'nolite'},
         {'verse': '145:5', 'remark': 'a sua esperança breaks the beatitude → e cuja esperança', 'outcome': 'option', 'decision': 'spes',
          'reason': 'the Latin has neither conjunction nor relative; the ambiguity reader did not stumble'},
         {'verse': '145:7a', 'remark': "faz juízo heard as 'behave sensibly' → julga a causa dos", 'outcome': 'option', 'decision': 'judicium',
          'reason': "102:6's identical wording; 'causa' supplied; 'justiça' is justítia's and chimes with injustiça"},
         {'verse': '145:9', 'remark': 'exterminar with caminhos not native, heavy → destruirá', 'outcome': 'taken', 'decision': 'disperdet'},
         {'verse': '145:10', 'remark': 'bare Sião read as apposition → o teu Deus, ó Sião', 'outcome': 'taken', 'decision': 'sion',
          'reason': "the 'ó' taken; the Latin order refused because it rhymes Sião / geração"},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': ('22 items, no unknown words. Acted on: 145:4 "voltará à sua terra" heard as the homeland (→ "à terra"); 145:10 Sião as apposition '
              'or realm (→ "ó Sião"); 145:9 exterminará heard as the sinners wiped out (→ destruirá, with the stylist). Kept as the Latin has them: '
              "the owner of 'seu espírito' (ejus after plural nouns), 'salvação' heard spiritually (salus, D6), 'ilumina os cegos' open between "
              "sight and enlightenment (the Latin's verb), 'guarda a verdade' (custodíre, the row), 'faz juízo' (heard rightly first). "
              "Confirmations: 'Ele' = God, 'que fez' = God, 'derrubados' = knocked down, the imperative of 2a."),
     'outcomes': [
         {'verse': '145:4', 'remark': "'voltará à sua terra' heard as native land", 'outcome': 'taken', 'decision': 'terram'},
         {'verse': '145:10', 'remark': 'Sião as apposition or as reigned over', 'outcome': 'taken', 'decision': 'sion'},
         {'verse': '145:9', 'remark': 'exterminará suggests the sinners destroyed', 'outcome': 'taken', 'decision': 'disperdet'},
         {'verse': '145:4', 'remark': "owner of singular 'seu' unclear after plurals", 'outcome': 'refused',
          'reason': "the Latin's own ejus / eórum shift"},
         {'verse': '145:2b', 'remark': 'salvação heard as spiritual salvation', 'outcome': 'refused', 'reason': 'salus → salvação (D6); the Latin word carries both'},
         {'verse': '145:7b', 'remark': 'ilumina os cegos: sight or enlightenment', 'outcome': 'refused', 'reason': "the Latin's illúminat; opening the eyes is the Hebrew"},
         {'verse': '145:7a', 'remark': "faz juízo: justice, sentence, or good sense", 'outcome': 'option', 'decision': 'judicium',
          'reason': 'heard rightly first; = 102:6'},
         {'verse': '145:7a', 'remark': 'guarda a verdade: fidelity or protection', 'outcome': 'refused', 'reason': 'custodíre → guardar (row); the Latin is as open'},
     ]},
    {'step': 'revision', 'version': 2,
     'note': ('v2: 145:2b Nos príncipes não confieis (stylist); 145:4 voltará à terra (ambiguity); 145:9 destruirá (stylist, ambiguity); '
              '145:10 ó Sião, o teu Deus (stylist, ambiguity). prayed.v1.json kept. Script: ps145/revise_v2.py.')},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
