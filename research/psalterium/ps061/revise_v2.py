"""Ps 61 draft 2 from the v1 readers (claude-opus-5-5, fresh context). Reads prayed.v1.json, writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
V = d['verses']
dec = {x['id']: x for x in d['decisions']}


def opt(label, note, frm, key):
    return {'label': label, 'forms': {key: label}, 'note': note, 'from': frm}


def insert_after(after_id, new):
    i = [x['id'] for x in d['decisions']].index(after_id)
    d['decisions'].insert(i + 1, new)
    dec[new['id']] = new


# 61:3 — 'Pois ele mesmo é' (stylist; the blind reader heard 'também' as 'he too, besides other gods')
n = dec['namet']
n['why'] += (' **v2:** the stylist found *Pois também ele* word-for-word and heard *também* as \'also — besides whom?\'; the blind reader, independently, heard \'he too\', \'as if there were other gods\'. The risk this draft named came true in both. Taken: *Pois ele mesmo é* (option 3), *ipse* carried by *mesmo*, *et* unsaid as in DRB. A local departure from the *nam et → pois também* row, recorded: the row stands where *também* cannot be heard as \'besides another god\' (118:24 *os vossos testemunhos*).')
n['options'] = [n['options'][2], n['options'][0], n['options'][1]]
n['options'][0]['note'] = 'Ruling (v2); stylist v1; *ipse* stressed, *et* unsaid.'
n['options'][0]['from'] = 'stylist'
n['options'][1]['note'] = 'Draft 1; the row. Heard as \'he too\' by the stylist and the blind reader.'

# 61:4 — the wall 'que pende' (the inner rhyme inclinada / empurrada)
V['61:4'] = 'Até quando {irruitis} um homem? * matais todos vós, como {inclinato} e {depulsae}?'
insert_after('irruitis', {
    'id': 'inclinato', 'refs': ['61:4'], 'latin': 'tamquam paríeti inclináto', 'kind': 'grammar',
    'why': 'The stylist (v1) heard *inclinada / empurrada* as a rhyme inside the colon, the second at the final, and asked *como a parede que pende e a cerca derrubada*. The participle becomes a relative clause, *que pende* (grammar, D2; the image of a wall leaning, about to fall, is kept, and *pender* is the plain verb for it). Taken for the wall. Refused from the same remark: the definite articles and the dropped *a* — the *a* is the dative\'s sign, and it is what makes the man, not the attackers, the leaning wall (the blind reader heard both); *uma* because the Latin compares with any such wall. The vowel run *como a uma* is the cost of keeping that.',
    'options': [
        opt('a uma parede que pende', 'Ruling (v2); stylist v1\'s verb.', 'stylist', 'inclinato'),
        opt('a uma parede inclinada', 'Draft 1; the participle; rhymes inside the colon with *empurrada*.', 'draft', 'inclinato'),
    ]})
p = dec['depulsae']
p['why'] += (' **v2:** the stylist found *cerca empurrada* flat (a fence shoved is not a wall thrust down) and asked *a cerca derrubada*. Refused: *derrubada* says the fence has already fallen, and then it can no longer be pushed — the Latin\'s participle is of the thrust, as φραγμῷ ὠσμένῳ; the article is refused with the wall\'s (see *inclinato*). His word stays option 3.')
p['options'][2]['note'] = 'stylist v1; thrust down, already fallen.'
p['options'][2]['from'] = 'stylist'

# 61:4 irruitis — held
ir = dec['irruitis']
ir['why'] += (' **v2:** the stylist asks *vos atirais sobre* (more physical; *vos lançais* stiff). Refused: *vos lançais sobre* is 58:4\'s wording for the same verb (rule 6), and the blind reader heard it plainly as \'you attack\'. Added as an option.')
ir['options'].append(opt('vos atirais sobre', 'stylist v1; more physical.', 'stylist', 'irruitis'))

# 61:5 — held: pensaram em, com sede, the articles
c = dec['cogit']
c['why'] += (' **v2:** the stylist asks *tramaram* (\'pensaram em\' too weak for scheming). Refused: *tramar* is concinnáre\'s (the glossary), and cogitáre\'s *maquinar* split is proposed but not settled; his word was already option 3.')
c['options'][2]['from'] = 'stylist'
s = dec['insiti']
s['why'] += (' **v2:** the readers pulled two ways: the Latinist (minor) asks *na sede* (the locative *in*), the stylist asks *sedento* (one word, weightier). Both were already options. Held: *na sede* is not Portuguese for running thirsty, and *sedento* moves the thirst into the runner even further than *com sede*, which the Latinist\'s remark was against. The blind reader heard \'I ran thirsty\', which is the Latin.')
s['options'][1]['note'] = 'MS1932; stylist v1 (one word).'
s['options'][2]['note'] = 'Latinist v1 (minor): *in* as locative; not idiomatic.'
s['options'][2]['from'] = 'latinist'

# 61:6 — the vocative first (stylist)
V['61:6'] = '{verum2}, {esto}: * porque dele {vem6} a minha paciência.'
insert_after('verumtamen', {
    'id': 'esto', 'refs': ['61:6'], 'latin': 'Deo subjécta esto, ánima mea', 'kind': 'order',
    'why': 'The stylist (v1): *sê sujeita a Deus, minha alma* runs *sê su-* together and makes the imperative land hard; the vocative first lets it land softly. Order yields to the ear (D2): taken. Every word is kept, and the mediant now closes on *Deus*, as 61:2\'s first colon. *sê* (the blind reader did not know it, or heard *se*) is 36:6\'s *sê sujeito ao Senhor*; no other imperative of *ser* exists.',
    'options': [
        opt('minha alma, sê sujeita a Deus', 'Ruling (v2); stylist v1.', 'stylist', 'esto'),
        opt('sê sujeita a Deus, minha alma', 'Draft 1; the Latin\'s order.', 'draft', 'esto'),
    ]})

# 61:7 — active: 'não partirei'
e = dec['emigrabo']
e['why'] += (' **v2:** the Latinist (major) found the passive a change of voice that also adds force and an agent, and asks *não emigrarei*; the stylist found *desalojado* bureaucratic (evictions, floods) and asks *não partirei*; the blind reader did not know *desalojado* and heard eviction. Taken: an active verb. *não partirei* (the stylist\'s): intransitive, L&S \'depart from a place\', the plain word. *emigrar* was heard as going abroad at 51:7 by two readers and is held as an option. Cost: *partir* is also said of dying (38:14 *antes de partir*, abeam); here, after *o meu auxílio*, the steadfast future pairs with 61:3 *já não serei abalado* — whoever hears \'I shall not die\' hears a near thing. 51:7\'s *desalojar* stays for the transitive.')
e['options'] = [
    opt('não partirei', 'Ruling (v2); stylist v1; active, as the Latin.', 'stylist', 'emigrabo'),
    opt('não emigrarei', 'Latinist v1 (major); the cognate, heard as going abroad (51:7).', 'latinist', 'emigrabo'),
    opt('não serei desalojado', 'Draft 1; 51:7\'s root; passive — refused by all three readers.', 'draft', 'emigrabo'),
    opt('não sairei', 'MS1932 at 51:7 (*te fará sair*); *sair* is egrédi\'s.', 'MS1932', 'emigrabo'),
    opt('não me mudarei', 'active, the dwelling; may be heard as \'I will not change\'.', 'draft', 'emigrabo'),
    opt('não vacilarei', 'MS1932; the sense, not the image.', 'MS1932', 'emigrabo'),
]

# adjútor — held (61:7, 61:9)
V['61:7'] = V['61:7'].replace('o meu auxílio', '{adjutor7}')
V['61:9'] = V['61:9'].replace('Deus é o nosso auxílio', 'Deus é {adjutor9}')
d['decisions'].append({
    'id': 'adjutor', 'refs': ['61:7', '61:9'], 'latin': 'adjútor meus · Deus adjútor noster', 'kind': 'glossary',
    'why': '*adjútor → auxílio*, uniform across the psalter (the row; D24). **v2:** the Latinist (major at 61:7, minor at 61:9) asks *ajudador*: the agent noun, and the Latin keeps it apart from *auxílium* at 61:8 (*Deus auxílii mei*). Refused, as at every earlier psalm: the row is uniform and open for Gustavo, and one psalm cannot break it. The distinction he names is real and is recorded here and in the row.',
    'options': [
        {'label': 'auxílio', 'forms': {'adjutor7': 'o meu auxílio', 'adjutor9': 'o nosso auxílio'}, 'note': 'Ruling; the row (D24).', 'from': 'glossary'},
        {'label': 'ajudador', 'forms': {'adjutor7': 'o meu ajudador', 'adjutor9': 'o nosso ajudador'}, 'note': 'Latinist v1; the agent noun.', 'from': 'latinist'},
    ]})

# 61:8 — the supplied 'ele é' as an option
V['61:8'] = 'Em Deus está a minha salvação, e a minha glória: * {deusauxilii}, e a minha esperança está em Deus.'
insert_after('emigrabo', {
    'id': 'deusauxilii', 'refs': ['61:8'], 'latin': 'Deus auxílii mei', 'kind': 'grammar',
    'why': 'The stylist (v1) found the bare noun phrase, joined by *e* to a full clause, hard to follow, and asks *ele é o Deus do meu auxílio*. Refused: the phrase stands beside *a minha salvação, e a minha glória* of the first colon as the Latin sets it, one more name of God, and the blind reader heard it without trouble (\'the God who helps me\'); the supplied words would add three syllables to a colon already +3 against the Latin. Kept as an option; it is the fix if a later reader stumbles.',
    'options': [
        opt('o Deus do meu auxílio', 'Ruling; no copula, as the Latin (and the Alleluia of 10-09).', 'draft', 'deusauxilii'),
        opt('ele é o Deus do meu auxílio', 'stylist v1; a supplied copula.', 'stylist', 'deusauxilii'),
    ]})

# 61:10 — 'são vãos' and the finite purpose clause (stylist)
V['61:10'] = '{verum3}, são vãos os filhos dos homens, mentirosos os filhos dos homens nas balanças: * para que eles mesmos, {devanitate}, enganem {inidipsum}.'
dv = dec['devanitate']
dv['why'] += (' **v2:** the stylist found *vãos são* a nasal clash, and colon b (*para eles … enganarem*) heard first as \'for them\', unsayable in one breath; the blind reader too found it hard to parse. Both taken: *são vãos* (order), and the purpose clause made finite, *para que eles mesmos … enganem* — *mesmos* is the Latin\'s *ipsi*, which draft 1\'s bare *eles* underplayed. His *por vaidade* refused: without the article it is \'out of conceit\', and the blind reader already heard *vaidade* as pride; *pela vaidade* keeps *de* as the source, and it stays option 3.')
dv['options'][2]['from'] = 'stylist'
dv['options'][2]['note'] = 'stylist v1; heard as \'out of conceit\'.'

# 61:11 — held: rapinas, nelas
r = dec['rapinas']
r['why'] += (' **v2:** the stylist hears *rapinas* (plural, no article) as a Latinism and asks *a rapina*; the blind reader did not know the word. Refused: the plural is the Latin\'s (the things seized, beside *riquezas*), and the singular with the article reads as the act. Added as an option; *roubos* stays the plainer word if the gate agrees with the blind reader.')
r['options'].append(opt('a rapina', 'stylist v1; singular, the act.', 'stylist', 'rapinas'))
V['61:11'] = 'Não espereis na iniquidade, e não {concup} {rapinas}: * se as riquezas {affluant}, {apponere}.'
insert_after('affluant', {
    'id': 'apponere', 'refs': ['61:11'], 'latin': 'nolíte cor appónere', 'kind': 'grammar',
    'why': '*nelas* is supplied: Portuguese *pôr o coração* needs to say where (DRB \'set not your heart upon them\'). **v2:** the Latinist (minor) calls it an addition and asks *não lhes apegueis o coração*. Refused: *lhes* supplies the same object, and *apegar* changes the verb (*appónere → pôr*). The blind reader heard *nelas* as the riches, with *rapinas* a second hearing. Kept as an option.',
    'options': [
        opt('não ponhais nelas o coração', 'Ruling; DRB.', 'draft', 'apponere'),
        opt('não lhes apegueis o coração', 'Latinist v1.', 'latinist', 'apponere'),
    ]})

# 61:12 — 'eu ouvi' held (the vós homograph)
sm = dec['semel']
sm['why'] += (' **v2:** the stylist asks to drop *eu* (*estas duas coisas ouvi*). Refused: bare *ouvi* is also the *vós* imperative (rule 3), and in a verse that turns to address God (*vossa, Senhor*) it would be heard as \'hear!\'; *eu* is the pronoun D2 allows for that.')

# choices
ch = d['choices']
ch['61:3'] += ' v2: *Pois ele mesmo é* (decision namet), a local departure from the *nam et* row.'
ch['61:4'] += ' v2: *que pende* removes the inner rhyme (decision inclinato).'
ch['61:6'] += ' v2: the vocative first (decision esto).'
ch['61:7'] += ' v2: *não partirei*, active (decision emigrabo); *adjútor* held (decision adjutor).'
ch['61:10'] += ' v2: *são vãos*; *para que eles mesmos … enganem* (*ipsi*).'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': 'Read with latin.json. 1 major (61:7), 4 minor. The major taken (an active verb, though not his); the rest refused (glossary rows, grammar) and kept as options.',
     'outcomes': [
         {'verse': '61:7', 'remark': 'non emigrábo active → passive não serei desalojado; não emigrarei', 'outcome': 'taken', 'decision': 'emigrabo', 'reason': 'active verb taken; the stylist\'s *não partirei* rather than *emigrarei* (heard as going abroad at 51:7); his word is option 2.'},
         {'verse': '61:7', 'remark': 'adjútor → auxílio an abstraction; o meu ajudador', 'outcome': 'option', 'decision': 'adjutor', 'reason': 'the uniform row (D24), open for Gustavo.'},
         {'verse': '61:9', 'remark': 'Deus adjútor noster; o nosso ajudador', 'outcome': 'option', 'decision': 'adjutor', 'reason': 'as 61:7.'},
         {'verse': '61:3', 'remark': 'suscéptor → amparo an abstraction; o meu protetor', 'outcome': 'refused', 'decision': '', 'reason': 'D19; *protetor* is protéctor\'s.'},
         {'verse': '61:5', 'remark': 'in siti locative; corri na sede', 'outcome': 'option', 'decision': 'insiti', 'reason': 'not idiomatic; already option 3.'},
         {'verse': '61:11', 'remark': 'nelas supplied; não lhes apegueis o coração', 'outcome': 'option', 'decision': 'apponere', 'reason': 'Portuguese needs the place; *lhes* supplies it too, and *apegar* changes the verb.'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': 'Read with latin.json. 12 remarks; best line 61:9, worst 61:10. 6 taken (order, grammar, a relative clause, the active verb, *ipse*); 6 refused, each kept as an option.',
     'outcomes': [
         {'verse': '61:3', 'remark': 'Pois também ele clumsy, heard as \'also\'; Pois ele mesmo é', 'outcome': 'taken', 'decision': 'namet', 'reason': 'the blind reader heard \'he too\' as well; local departure from the row, recorded.'},
         {'verse': '61:4', 'remark': 'vowel runs como a uma / e a uma; inclinada / empurrada inner rhyme; cerca empurrada flat; como a parede que pende e a cerca derrubada', 'outcome': 'taken', 'decision': 'inclinato', 'reason': '*que pende* taken (rhyme gone); the dative *a uma* and *empurrada* kept (decision depulsae: *derrubada* says already fallen).'},
         {'verse': '61:4', 'remark': 'vos lançais stiff; vos atirais sobre', 'outcome': 'option', 'decision': 'irruitis', 'reason': '= 58:4 (rule 6); the blind reader heard it plainly.'},
         {'verse': '61:5', 'remark': 'pensaram em weak; tramaram', 'outcome': 'option', 'decision': 'cogit', 'reason': '*tramar* is concinnáre\'s.'},
         {'verse': '61:5', 'remark': 'com sede prosaic; sedento', 'outcome': 'option', 'decision': 'insiti', 'reason': 'the Latinist pulled the other way (the locative); *com sede* held between them.'},
         {'verse': '61:5', 'remark': 'drop the articles: com sua boca … com seu coração', 'outcome': 'refused', 'decision': '', 'reason': 'rule 5, the article before possessives.'},
         {'verse': '61:6', 'remark': 'sê sujeita awkward; minha alma, sê sujeita a Deus', 'outcome': 'taken', 'decision': 'esto', 'reason': 'order (D2).'},
         {'verse': '61:7', 'remark': 'desalojado bureaucratic and passive; não partirei', 'outcome': 'taken', 'decision': 'emigrabo'},
         {'verse': '61:8', 'remark': 'bare noun phrase; ele é o Deus do meu auxílio', 'outcome': 'option', 'decision': 'deusauxilii', 'reason': 'the Latin\'s apposition; the blind reader heard it; +3 syllables.'},
         {'verse': '61:10', 'remark': 'vãos são nasal clash; são vãos', 'outcome': 'taken', 'decision': 'devanitate', 'reason': 'order (D2).'},
         {'verse': '61:10', 'remark': 'para eles … enganarem unsayable; para que eles mesmos, por vaidade, enganem juntos', 'outcome': 'taken', 'decision': 'devanitate', 'reason': 'the finite clause and *mesmos* (= ipsi) taken; *por vaidade* refused (conceit), option 3.'},
         {'verse': '61:11', 'remark': 'rapinas a Latinism; a rapina', 'outcome': 'option', 'decision': 'rapinas', 'reason': 'the Latin\'s plural, the things seized.'},
         {'verse': '61:12', 'remark': 'drop eu: estas duas coisas ouvi', 'outcome': 'refused', 'decision': 'semel', 'reason': 'bare *ouvi* is the *vós* imperative (rule 3).'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': 'Blind reader. Unknown: repelir (61:5), sê (61:6), desalojado (61:7), rapinas, afluírem, iniquidade (61:11). Heard as the Latin almost everywhere; 61:3 *também* heard as \'besides other gods\' and 61:10b hard to parse — both changed.',
     'outcomes': [
         {'verse': '61:3', 'remark': 'também heard as \'also\', as if there were other gods', 'outcome': 'taken', 'decision': 'namet'},
         {'verse': '61:7', 'remark': 'desalojado unknown; eviction overtone', 'outcome': 'taken', 'decision': 'emigrabo'},
         {'verse': '61:10', 'remark': 'para eles, pela vaidade, enganarem juntos hard to parse', 'outcome': 'taken', 'decision': 'devanitate'},
         {'verse': '61:10', 'remark': 'vaidade heard as pride', 'outcome': 'refused', 'decision': 'devanitate', 'reason': 'the row (vánitas → vaidade); *pela* keeps the source sense; *por vaidade* would make it worse.'},
         {'verse': '61:5', 'remark': 'o meu preço unclear; repelir unknown', 'outcome': 'refused', 'decision': 'pretium', 'reason': 'the Latin is obscure here (the Greek τιμή); *preço* keeps it; *repelir* settled (D42).'},
         {'verse': '61:6', 'remark': 'sê unknown / heard as se', 'outcome': 'refused', 'decision': 'esto', 'reason': '= 36:6 *sê sujeito*; no other imperative of *ser*.'},
         {'verse': '61:11', 'remark': 'rapinas, afluírem, iniquidade unknown; nelas may refer to rapinas', 'outcome': 'refused', 'decision': 'rapinas', 'reason': 'rows (iniquitas); likely heard as the riches; *roubos* is option 2 if the gate agrees.'},
     ]},
    {'step': 'revision', 'version': 2,
     'note': 'Draft 2: 61:3 *Pois ele mesmo é*; 61:4 *a uma parede que pende*; 61:6 vocative first; 61:7 *não partirei* (active); 61:10 *são vãos* and *para que eles mesmos, pela vaidade, enganem juntos*. New decisions inclinato, esto, deusauxilii, apponere, adjutor record the refused readings as options. prayed.v1.json keeps draft 1. Checks rerun: hard checks pass, no cadence rhyme; soft flags now 61:5a −4, 61:11a −6, 61:8b +3 (61:7b +3 gone with *desalojado*).'},
]

(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
