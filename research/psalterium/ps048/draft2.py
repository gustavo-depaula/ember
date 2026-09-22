"""Ps 48 draft 2: apply the revisions after the v1 readers. Run once from the repo root:
python3.13 research/psalterium/ps048/draft2.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
p = json.loads(path.read_text(encoding='utf-8'))
assert p['version'] == 1, 'already revised'
p['version'] = 2
v = p['verses']
v['48:11'] = 'Não verá a destruição, {videns}: * juntos perecerão o insensato e o {stultus}.'
v['48:13'] = 'E o homem, {honore}, não entendeu: * foi comparado aos animais {insipientibus}, e {factus} semelhante a eles.'
v['48:21'] = 'O homem, {honore}, não entendeu: * foi comparado aos animais {insipientibus}, e {factus} semelhante a eles.'
v['48:14'] = 'Este caminho deles é tropeço para eles: * e depois {complacebunt}.'
v['48:19'] = 'Porque a sua alma será bendita {invita}: * {tibi}.'

D = {d['id']: d for d in p['decisions']}


def front(did, option, why_add=None):
    """Put a new option 0 in front (or move an existing label there)."""
    d = D[did]
    labels = [o['label'] for o in d['options']]
    if option['label'] in labels:
        d['options'].pop(labels.index(option['label']))
    d['options'].insert(0, option)
    if why_add:
        d['why'] += ' ' + why_add


front('terrigenae', {'label': 'os nascidos da terra e os filhos dos homens', 'forms': {'terrigenae': 'os nascidos da terra e os filhos dos homens'}, 'note': 'Ruling (v2); stylist.', 'from': 'stylist'},
      'v2: the stylist heard *tanto … como* as a prose aside that lengthened the colon (+4); the plain *e* keeps both nouns and the vocative, and the Latin\'s *-que* is weak enough that its loss costs little. The blind reader did not hear the contrast in either form.')
D['terrigenae']['options'][1]['note'] = 'draft 1: the correlative *-que … et* made explicit; +4 syllables; the stylist: a prose aside.'

front('propositio', {'label': 'o que proponho', 'forms': {'propositio': 'o que proponho'}, 'note': 'Ruling (v2): the root kept as a clause, as D16 did with *elóquium*; MS1932 *o que tenho a propor*.', 'from': 'MS1932'},
      'v2: *proposição* was called a schoolroom word by the stylist and listed as unknown by the blind reader, who heard a proposal or a thesis. The clause *o que proponho* keeps the root (propónere) and says it plainly; the noun stays the option.')
D['propositio']['options'][1]['note'] = 'draft 1; DRB; bookish to the stylist, unknown to the blind reader.'
D['propositio']['options'].append({'label': 'ao som do saltério a minha proposição', 'forms': {'propositio': 'a minha proposição'}, 'note': 'stylist: *ao som do saltério* (MS1932\'s words) for *com o saltério*. Refused: *som* is a word the Latin lacks, and *com o saltério* is 32:2\'s rendering of *in psaltério*. Recorded here; the slot shows only the noun.', 'from': 'stylist'})

p['decisions'].insert([d['id'] for d in p['decisions']].index('stultus'), {
    'id': 'videns', 'refs': ['48:11'], 'latin': 'cum víderit sapiéntes moriéntes', 'kind': 'grammar',
    'why': 'v2, the stylist\'s: *quando vir morrer os sábios* put a proparoxytone (*sábios*) at the mediant, and *vir* (of *ver*) is heard first as *vir* \'to come\'. *ao ver os sábios morrerem* keeps the verb, the wise and their dying, and changes only the build (a temporal *cum* clause as *ao* + infinitive — grammar, D2). The future perfect\'s anteriority is not marked; it was not heard in *quando vir* either.',
    'options': [
        {'label': 'ao ver os sábios morrerem', 'forms': {'videns': 'ao ver os sábios morrerem'}, 'note': 'Ruling (v2); stylist.', 'from': 'stylist'},
        {'label': 'quando vir morrer os sábios', 'forms': {'videns': 'quando vir morrer os sábios'}, 'note': 'draft 1; MS1932.', 'from': 'draft'},
    ]})

vc = D['vocaverunt']
vc['options'].insert(0, {'label': 'chamaram os seus nomes nas suas terras', 'forms': {'vocaverunt': 'chamaram os seus nomes nas suas terras'}, 'note': 'Ruling (v2); the Latinist\'s fix.', 'from': 'latinist'})
vc['options'][1]['note'] = 'draft 1; DRB — the Latinist (major): makes *terras* the object, the Hebrew-family explanation.'
vc['why'] += ' v2: the Latinist marked draft 1 MAJOR — in the Latin *nómina sua* is the object and *in terris suis* a place, and DRB\'s build explains (they named their estates after themselves), closing what the Latin leaves open (they called out, proclaimed, their names in their lands). Taken: *chamaram os seus nomes nas suas terras* is sayable, and draft 1\'s own reason for refusing it (\"not Portuguese\") was too strong.'

ag = D['agloria']
ag['options'].insert(0, {'label': 'desde a glória deles', 'forms': {'agloria': 'desde a glória deles'}, 'note': 'Ruling (v2): the Latinist\'s *desde* with the stylist\'s *deles*.', 'from': 'latinist'})
ag['options'][1]['note'] = 'draft 1; the Latinist: *longe* decides the *a* and adds distance; the blind reader heard *sua* as God\'s glory.'
ag['why'] += ' v2: the Latinist (minor) asked for *desde*, which in Portuguese says both \'from\' (a starting point) and \'since\' (after) — two of the Latin\'s readings in one word, where *longe* chose one; the stylist and the blind reader both found *sua* pointing to the just or to God, so *deles* (the Latin repeats *eórum* too).'

p['decisions'].insert([d['id'] for d in p['decisions']].index('insipientibus') + 1, {
    'id': 'factus', 'refs': ['48:13', '48:21'], 'latin': 'et símilis factus est illis', 'kind': 'word',
    'why': 'v2, the stylist\'s: *se fez* keeps *factus est* (*fieri* / *fazer-se*, as 48:17 *dives factus* → *se fizer rico*) and puts the pronoun where Brazilians put it after *e*; *tornou-se* (MS1932) is the plainer verb but another word. The refrain changes in both places from one slot.',
    'options': [
        {'label': 'se fez', 'forms': {'factus': 'se fez'}, 'note': 'Ruling (v2); stylist.', 'from': 'stylist'},
        {'label': 'tornou-se', 'forms': {'factus': 'tornou-se'}, 'note': 'draft 1; MS1932.', 'from': 'MS1932'},
    ]})

cp = D['complacebunt']
cp['options'].append({'label': 'se agradarão da própria boca', 'forms': {'complacebunt': 'se agradarão da própria boca'}, 'note': 'stylist: *acharão prazer na sua boca* sounds like tasting. Refused: *própria* decides whose mouth, which the blind reader and the Latin both leave open (theirs, their followers\', even God\'s); the Latinist passed the draft\'s words.', 'from': 'stylist'})

D['tibi']['why'] += ' v2: the Latinist, reading the Latin, did not flag *te* (\'the Latin\'s second singular is consistent with that\').'

p['decisions'].insert([d['id'] for d in p['decisions']].index('tibi'), {
    'id': 'invita', 'refs': ['48:19'], 'latin': 'ánima ejus in vita ipsíus benedicétur', 'kind': 'grammar',
    'why': 'v2, the stylist\'s: *na sua vida* after *a sua alma* repeats the possessive and is heard as the idiom \'(never) in his life\'. *em vida* is the Portuguese for \'during his lifetime\', which is what *in vita ipsíus* says (MS1932 *enquanto vive*); *ipsíus* is carried by the idiom. The blind reader heard a real blessing on him; that is the Latin\'s surface too (the Hebrew\'s \'he blessed his soul\' is not followed, rule 1).',
    'options': [
        {'label': 'em vida', 'forms': {'invita': 'em vida'}, 'note': 'Ruling (v2); stylist.', 'from': 'stylist'},
        {'label': 'na sua vida', 'forms': {'invita': 'na sua vida'}, 'note': 'draft 1; the Latin word for word.', 'from': 'draft'},
        {'label': 'enquanto viver', 'forms': {'invita': 'enquanto viver'}, 'note': 'MS1932\'s sense (*enquanto vive*); a clause.', 'from': 'MS1932'},
    ]})

p['decisions'].append({
    'id': 'verumtamen', 'refs': ['48:16'], 'latin': 'Verúmtamen Deus rédimet', 'kind': 'glossary',
    'why': 'verúmtamen → *Todavia* (row; 31:6b, 38:6b, 38:7, 38:12b, 90:8). The stylist asked *Mas*, as plainer at the psalm\'s turn. Refused: the row is applied in five places, and *mas* is *autem* / *sed*\'s; if the row changes, all change together.',
    'options': [
        {'label': 'Todavia,', 'forms': {'verumtamen': 'Todavia,'}, 'note': 'Ruling; the row.', 'from': 'glossary'},
        {'label': 'Mas', 'forms': {'verumtamen': 'Mas'}, 'note': 'stylist.', 'from': 'stylist'},
    ]})
v['48:16'] = '{verumtamen} Deus resgatará a minha alma da mão do inferno: * quando me {acceperit}.'

p['decisions'].append({
    'id': 'usque', 'refs': ['48:20'], 'latin': 'Introíbit usque in progénies … et usque in ætérnum non vidébit lumen', 'kind': 'order',
    'why': 'The stylist asked *Entrará até junto às gerações* and *e jamais, para sempre, verá a luz*. Refused both: *junto* is a word the Latin lacks (and *até as*, elided, is ordinary speech; *entrar até* is D42\'s); *usque in ætérnum* → *para todo o sempre* is D37\'s formula and *jamais* adds a negative the Latin does not have. The Latin puts the adverb first and the negation after, and draft 1 follows it.',
    'options': [
        {'label': 'e para todo o sempre não verá', 'forms': {'usque': 'e para todo o sempre não verá'}, 'note': 'Ruling; D37, the Latin\'s order.', 'from': 'glossary'},
        {'label': 'e nunca mais verá', 'forms': {'usque': 'e nunca mais verá'}, 'note': '9:32\'s way for a negated perpetuity; loses D37\'s formula.', 'from': 'draft'},
        {'label': 'e jamais, para sempre, verá', 'forms': {'usque': 'e jamais, para sempre, verá'}, 'note': 'stylist; *jamais* added.', 'from': 'stylist'},
    ]})
v['48:20'] = 'Entrará até as gerações dos seus pais: * {usque} a luz.'

c = p['choices']
c['48:11'] = c['48:11'].replace('*quando vir morrer os sábios*: the Latin\'s future perfect as the Portuguese future subjunctive; MS1932\'s words.', 'v2 *ao ver os sábios morrerem* (decision `videns`).')
c['48:13'] = 'The refrain (= 48:21 but for *Et*). comparáre (passive) → *foi comparado*; *símilis factus est* → *se fez semelhante* (v2, decision `factus`).'
c['48:14'] = 'The Latin is verbless in the first colon; *é* supplied. via → *caminho* (row); scándalum → *tropeço* (row; 48:14 is on its list; unknown to the blind reader, kept — 118:165). v2: *Este caminho deles é tropeço para eles* — draft 1\'s *Este seu* (to save syllables) was the stylist\'s worst line (two determiners); the +3/+4 length is accepted. *deles … para eles* keeps *illórum … ipsis*.'
c['48:19'] = 'benedícere (passive) → *será bendita* (row). *in vita ipsíus* → *em vida* (v2, decision `invita`).'
c['48:5'] = c['48:5'] + ' *saltério* was unknown to the blind reader, as in 32:2; kept (row).'
c['48:8'] = c['48:8'] + ' *propiciação* was unknown to the blind reader; kept for now (decision `placatio`; *o que o aplaque* is the plain option) — flagged in the glossary row.'

A = p['audit']
A.append({'step': 'readers', 'note': 'codex.py not called (Codex out of credits since Ps 37). The coordinator ran the three readers on draft 1 as fresh-context agents; each was claude-opus-5-5 (fresh context).'})
A.append({'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5 (fresh context). One major, two minor. Passed the hard spots left open (48:6, 48:8, 48:9, 48:14) and the *te* of 48:19.',
          'outcomes': [
              {'verse': '48:12', 'remark': 'DRB build makes *terras* the object and explains; keep *chamaram os seus nomes nas suas terras* (major)', 'outcome': 'taken'},
              {'verse': '48:15b', 'remark': '*longe da* decides the *a*; use *desde*', 'outcome': 'taken'},
              {'verse': '48:18', 'remark': '*nada levará* resolves *non … ómnia*; *não levará todas as coisas*', 'outcome': 'refused', 'decision': 'omnia', 'reason': 'In Portuguese *não levará tudo / todas as coisas* means he takes part of it — a wrong sense, not an open one; the Greek οὐκ … τὰ πάντα is the Hebrew \'not … anything\', and both Vulgate-family versions (DRB, MS1932) say nothing. The negation of the whole is grammar (D2); the stylist named the line the psalm\'s best. The word-for-word form stays option 2.'},
          ]})
A.append({'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5 (fresh context). Ten remarks on nine verses; worst line 48:14, best 48:18. Six taken, four kept as options.',
          'outcomes': [
              {'verse': '48:3', 'remark': '*tanto … como* a prose aside; plain *e*', 'outcome': 'taken'},
              {'verse': '48:5', 'remark': '*com o saltério* like a tool; *ao som do saltério*', 'outcome': 'option', 'decision': 'propositio', 'reason': '*som* is not in the Latin; *com o saltério* is 32:2\'s.'},
              {'verse': '48:5', 'remark': '*proposição* a schoolroom word', 'outcome': 'taken', 'decision': 'propositio'},
              {'verse': '48:11', 'remark': 'proparoxytone at the mediant, *vir* heard as \'come\'; *ao ver os sábios morrerem*', 'outcome': 'taken'},
              {'verse': '48:13', 'remark': '*e se fez semelhante* (also 48:21)', 'outcome': 'taken'},
              {'verse': '48:14', 'remark': '*Este seu* stacks determiners; *Este caminho deles é para eles um tropeço*', 'outcome': 'taken', 'reason': 'taken as *Este caminho deles é tropeço para eles* (the article *um* not added).'},
              {'verse': '48:14', 'remark': '*acharão prazer na sua boca* sounds like tasting; *se agradarão da própria boca*', 'outcome': 'option', 'decision': 'complacebunt', 'reason': '*própria* closes whose mouth, which the Latin leaves open; the Latinist passed the draft.'},
              {'verse': '48:15b', 'remark': '*sua* could be the just\'s or God\'s; *deles*', 'outcome': 'taken'},
              {'verse': '48:16', 'remark': '*Todavia* bookish; *Mas*', 'outcome': 'option', 'decision': 'verumtamen', 'reason': 'the verúmtamen row, applied in five places; *mas* is autem\'s.'},
              {'verse': '48:19', 'remark': '*na sua vida* repeats the possessive and is idiomatic; *em vida*', 'outcome': 'taken'},
              {'verse': '48:20', 'remark': '*até junto às*; *e jamais, para sempre, verá a luz*', 'outcome': 'option', 'decision': 'usque', 'reason': 'adds *junto* and *jamais*; D37\'s formula and D42\'s *entrar até* kept.'},
          ]})
A.append({'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5 (fresh context). 31 ambiguities, 5 unknown words (saltério, proposição, propiciação, iniquidade, tropeço).',
          'outcomes': [
              {'verse': '48:3', 'remark': 'the contrast of the two groups not audible', 'outcome': 'refused', 'reason': 'terrígenæ / fílii hóminum are the Latin\'s images; the Hebrew\'s low-and-high contrast is not the Latin\'s to import (rule 1).'},
              {'verse': '48:5', 'remark': '*proposição* unknown, heard as a proposal', 'outcome': 'taken', 'decision': 'propositio'},
              {'verse': '48:6', 'remark': 'the heel heard as my own sins, contradicting *why fear*', 'outcome': 'refused', 'decision': 'calcanei', 'reason': 'the Latin\'s own crux, kept open on purpose; the Latinist passed it.'},
              {'verse': '48:8', 'remark': 'a self-contradictory statement; the question not audible', 'outcome': 'refused', 'decision': 'redimet', 'reason': 'the Latin has no question mark; kept as punctuated (decision records the question as an option).'},
              {'verse': '48:8', 'remark': '*propiciação* unknown', 'outcome': 'refused', 'decision': 'placatio', 'reason': 'kept for *suam* and the noun; the plain clause is option 2; for Gustavo.'},
              {'verse': '48:9', 'remark': 'heard as a positive promise; the link to *não dará* weak', 'outcome': 'refused', 'decision': 'etpretium', 'reason': 'the Latin\'s *Et* and its open construction.'},
              {'verse': '48:11', 'remark': 'heard as a statement that he escapes destruction', 'outcome': 'refused', 'reason': 'the Latin is a statement; the irony is the reader\'s to find, as in the Latin.'},
              {'verse': '48:12', 'remark': '*chamaram as suas terras pelos seus nomes* heard as naming estates', 'outcome': 'taken', 'reason': 'changed with the Latinist\'s major.'},
              {'verse': '48:14', 'remark': '*Este seu*: whose?', 'outcome': 'taken'},
              {'verse': '48:15', 'remark': '*a morte os pastará* heard as death their shepherd', 'outcome': 'refused', 'decision': 'depascet', 'reason': 'the shepherd is one of the two readings the Latin holds (the Greek\'s ποιμαίνει); the reader listed the devouring as the other. Both are heard; kept.'},
              {'verse': '48:15b', 'remark': '*sua glória* heard as God\'s', 'outcome': 'taken'},
              {'verse': '48:19', 'remark': 'a real blessing, clashing with context', 'outcome': 'refused', 'reason': 'the Latin\'s passive *benedicétur* says so on its surface; the Hebrew\'s self-blessing is not followed (rule 1).'},
              {'verse': '48:5, 48:6, 48:14', 'remark': 'unknown: saltério, iniquidade, tropeço', 'outcome': 'refused', 'reason': 'glossary rows (psaltérium, iníquitas, scándalum), each already heard as unknown elsewhere and kept.'},
          ]})
A.append({'step': 'revision', 'version': 2, 'note': 'v2: 48:3 plain *e* (stylist); 48:5 *o que proponho* (stylist + blind reader); 48:11 *ao ver os sábios morrerem* (stylist); 48:12 *chamaram os seus nomes nas suas terras* (Latinist, major); 48:13 = 48:21 *se fez semelhante* (stylist); 48:14 *Este caminho deles é tropeço para eles* (stylist); 48:15b *desde a glória deles* (Latinist + stylist + blind reader); 48:19 *em vida* (stylist). New decisions: videns, factus, invita, verumtamen, usque. The refrain still identical but for *E*.'})

path.write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
