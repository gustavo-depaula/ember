"""Draft 2 of canticle 220 after the v1 readers (latinist, stylist, ambiguity).
python3.13 research/psalterium/ps220/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2

# 3:56: the stylist's order, *Bendito sois vós, que …* (the pronoun joins the verb, the comma moves); the verb of sitting
# becomes a decision (79:2b's *estais sentado* kept; the stylist's *vos sentais* an option).
d['verses']['3:56'] = '{bs56} vós, que {intu} os abismos, e {sed56} sobre os querubins: * e digno de louvor, e {sx56} pelos séculos.'
d['decisions'].append({
    'id': 'sed56', 'refs': ['3:56'], 'latin': 'et sedes super Chérubim', 'kind': 'glossary',
    'why': "79:2b has the same Latin in the same person (*Qui sedes super Chérubim* → *Vós que estais sentado sobre os querubins*). The v1 stylist heard a hiatus in *e estais* and a first colon too long for one breath, and asked *e vos sentais*.",
    'options': [
        {'label': 'estais sentado', 'forms': {'sed56': 'estais sentado'}, 'note': "Draft, copied from 79:2b (rule 6: identical Latin, identical Portuguese). The hiatus *e‿estais* elides in speech.", 'from': 'glossary'},
        {'label': 'vos sentais', 'forms': {'sed56': 'vos sentais'}, 'note': "The v1 stylist: one syllable shorter, no hiatus. It would part this line from 79:2b; if taken, 79:2b should follow.", 'from': 'stylist'},
    ],
})
d['choices']['3:56'] = d['choices']['3:56'].replace(
    "*Benedíctus es, qui* → *Bendito sois, vós que*: the pronoun is supplied so the relative clause is heard as said to God (grammar, D2).",
    "*Benedíctus es, qui* → *Bendito sois vós, que* (v2, the stylist's order: *sois, vós* bumped two stresses together): the pronoun is supplied so the relative clause is heard as said to God (grammar, D2). See decision `sed56`.")

for dec in d['decisions']:
    if dec['id'] == 'e53':
        for opt in dec['options']:
            if opt['label'] == 'E bendito é':
                opt['note'] += " Asked by the v1 stylist ('a caption, not a sentence'); refused, see the audit."
                opt['from'] = 'stylist'

d['status'] = 'draft'
d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': "Reader: claude-opus-5-5, fresh context, with latin.json. No remarks, no majors. It found every *super-* rendered consistently, the verbless 3:53 kept verbless, *in ómnibus sǽculis* kept apart from *in sǽcula*, and person, tense and images kept in 3:56.",
     'outcomes': []},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': "Reader: claude-opus-5-5, fresh context, with latin.json. Seven verses remarked. Worst line 3:56, best 3:57. Most remarks ask for *para sempre* at every final instead of the proparoxytone *pelos séculos*.",
     'outcomes': [
         {'verse': '3:52', 'remark': "'pelos séculos' proparoxytone final (also 3:54, 3:55, 3:56, 3:57, 3:58); 'para sempre'", 'outcome': 'refused',
          'reason': "D43 settles *in sǽcula* → *pelos séculos*, and *para sempre* is *in ætérnum*'s (D23): the Latin's final is itself the proparoxytone *sǽcula*. The same remark was refused in canticle 210."},
         {'verse': '3:53', 'remark': "verbless line sounds like a caption; 'E bendito é'", 'outcome': 'option', 'decision': 'e53',
          'reason': "The Latin has no verb, and the Latinist named the elision as kept on purpose. 71:19 (*E bendito o nome da sua majestade*) is the same build, verbless. *é* would decide statement against wish."},
         {'verse': '3:53', 'remark': "'por todos os séculos'; 'por todas as eras'", 'outcome': 'refused',
          'reason': "*sǽculum* is *século* throughout the psalter (D27, D43); *eras* is a new word for it. The form is canticle 212's (13:1)."},
         {'verse': '3:54', 'remark': "two 'sumamente' make the colon long; change only the ending", 'outcome': 'refused',
          'reason': "The stylist itself keeps both *sumamente*; its only change is *para sempre*, refused above."},
         {'verse': '3:56', 'remark': "'sois, vós' bumps two stresses; 'Bendito sois vós, que …'", 'outcome': 'taken'},
         {'verse': '3:56', 'remark': "'e estais' hiatus, colon too long; 'e vos sentais'", 'outcome': 'option', 'decision': 'sed56',
          'reason': "79:2b has the same Latin as *estais sentado* (rule 6); the hiatus elides."},
         {'verse': '3:58', 'remark': "'louvai-o e exaltai-o' vowel chain; 'louvai-o e sumamente exaltai-o'", 'outcome': 'refused',
          'reason': "3:58 is canticle 210's 3:57 word for word, and the refrain stands four times there; it moves only with 210. The order *exaltai-o sumamente* is 210's, passed by two Latinist gates there."},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': "Reader: claude-opus-5-5, fresh context, Portuguese only. Six ambiguities, two unknown words (*querubins*, *firmamento*). Most are heard as meant: *nossos pais* as ancestors, *pelos séculos* as for ever, *o santo nome da vossa glória* as 'your glorious holy name', *olhais os abismos* as seeing into the depths.",
     'outcomes': [
         {'verse': '3:53', 'remark': "'digno de louvor … exaltado' may be heard of God rather than the name", 'outcome': 'refused',
          'reason': "The reader heard the name first; the Latin's neuters (*laudábile, superexaltátum*) agree with *nomen*, and Portuguese *nome* is masculine like *Deus*, so the doubt cannot be removed without adding words."},
         {'verse': '3:56', 'remark': "'olhais os abismos' may be heard as 'keep watch over'", 'outcome': 'refused',
          'reason': "The reader heard the looking first; watching over is a reading the Latin *intuéri* half allows."},
         {'verse': '3:58', 'remark': "'Bendizei, todas as obras do Senhor, ao Senhor': the assembly may be heard as blessing the works", 'outcome': 'refused',
          'reason': "The verse is canticle 210's 3:57 and follows that canticle's decision `order` (the Latin's order, vocative after the verb); the CNBB's creature-first order is its option there. The reader heard the vocative first."},
         {'verse': '3:56', 'remark': "'querubins' unknown", 'outcome': 'refused', 'reason': "The Latin's word; 17:11, 79:2b, 98:1."},
         {'verse': '3:57', 'remark': "'firmamento' unknown", 'outcome': 'refused', 'reason': "D31: the sky; the CNBB has the same word."},
     ]},
    {'step': 'revision', 'version': 2,
     'note': "v2: 3:56 *Bendito sois, vós que* → *Bendito sois vós, que* (stylist); new decision `sed56` (*estais sentado*, as 79:2b; *vos sentais* option). Stylist's *E bendito é* recorded in `e53`. Draft 1 is prayed.v1.json; its flat text, which the v1 readers read, is prayed.v1.vos.json. Built by revise_v2.py."},
]
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
