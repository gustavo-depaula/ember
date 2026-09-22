"""One-off: apply the v2 revisions after the v1 readers (latinist, stylist, ambiguity)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
v = d['verses']
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, note_new_ruling, why_add):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    chosen = opts.pop(i)
    old = opts[0]
    old['note'] = old['note'].replace('Ruling: ', 'v1 ruling: ', 1) if old['note'].startswith('Ruling') else 'v1 ruling. ' + old['note']
    chosen['note'] = 'Ruling (v2): ' + note_new_ruling
    opts.insert(0, chosen)
    dec[did]['why'] += ' ' + why_add


d['version'] = 2

promote('superbias', 'as soberbas deles', 'the Latin plural, acts of pride; set against the singular at 73:23.',
        'v2: the latinist read the singular as a flattening of *supérbias* (their acts of pride). The plural can be said, and the psalm itself contrasts it with *supérbia* at 73:23, so the Latin number is kept.')

promote('signa', 'os seus sinais, sinais', 'the bare doubling, as the Latin.',
        'v2: the latinist and the stylist both heard *como* as a supplied reading, and the stylist heard *sinais como sinais* as a tautology. The bare doubling keeps the Latin\'s echo and its openness.')

promote('cognoverunt', 'conheceram', "cognóscere's verb, as 73:9.",
        'v2: the latinist and the stylist both asked for *conheceram*. The objectless *souberam* dangled just as much ("knew what?"), and *conhecer* keeps the family with 73:9 *conhecerá*.')

s = dec['summum']
s['options'].insert(0, {'label': 'sobre o cume', 'forms': {'summum': 'sobre o cume'}, 'note': 'Ruling (v2): the plain word for the top.', 'from': 'critic'})
s['options'][1]['note'] = 'v1 ruling. ' + s['options'][1]['note']
s['why'] += ' v2: the ambiguity reader did not know *cimo*, and the stylist found it bookish. *cume* is the plain word for a top or summit, and it keeps *super summum*.'

promote('fabricatus', 'formastes', 'the plain verb of making a shape; plasmáre stays *moldar*.',
        'v2: the stylist heard *fabricastes* as the word of factories and products, jarring beside the dawn and the sun. *formastes* keeps a maker at work, and the four verbs stay apart (*formastes / fizestes / moldastes*). The known cost is that *formar* is formáre\'s word elsewhere.')

o = dec['obscurati']
o['why'] += ' v2: the stylist asked for the Latin\'s verb (*repléti sunt*) rather than the static *estão cheios*: *se encheram*, the replére row\'s option. *porque* is kept for *quia*.'

dec['dedisti']['why'] += ' v2: the stylist heard the proparoxytone *etíopes* as a clipped close; the final stress must fall on the last or second-last syllable. *da Etiópia* (MS1932) closes paroxytone and keeps the name. The known cost is that the people become their land. The latinist\'s point about *e* is answered above.'
for opt in dec['dedisti']['options']:
    pass

# verses
v['73:5'] = 'Puseram {s5}: * e não {cognoverunt}, como na saída, {summum}.'
v['73:6'] = 'Como numa selva de árvores, com machados cortaram {idipsum} as suas portas: * com machado e {ascia} a derrubaram.'
v['73:8'] = 'Disseram no seu coração {cognatio}: * Façamos cessar da terra todos os {diesfestos} de Deus.'
v['73:14'] = 'Vós quebrastes as cabeças do dragão: * {dedisti} aos povos da Etiópia.'
v['73:20'] = 'Olhai para a vossa aliança: * porque {obscurati} se encheram de casas de iniquidades.'

c = dec['cognatio']
for opt in c['options']:
    if opt['label'] == 'juntos, os da parentela deles':
        opt['label'] = 'os da parentela deles, juntos'
        opt['forms'] = {'cognatio': 'os da parentela deles, juntos'}
        opt['note'] = 'Ruling (v2): the subject made plural, and heard before *juntos*.'
    elif opt['label'] == 'a sua parentela, juntos':
        opt['forms'] = {'cognatio': ', a sua parentela, juntos'}
    elif opt['label'] == 'a parentela deles, toda junta':
        opt['forms'] = {'cognatio': ', a parentela deles, toda junta'}
c['why'] += ' v2: the stylist counted three stops in one colon, with the subject arriving last. The subject now follows the heart directly, and *juntos* closes the colon. The stylist\'s *todos juntos* adds a word and is refused.'

dec['idipsum']['why'] += ' v2: the stylist heard *juntos* trailing at the mediant with an unclear reference (the axes? the men?). It now stands after the verb, where it goes with the axemen.'

dec['ascia']['why'] += ' v2: the ambiguity reader did not know *enxó*. It is kept as the exact tool, with the known cost recorded, as D42 did with *repelistes*. *machadinha* remains the option.'

d['choices']['73:14'] = d['choices']['73:14'] + " v2: *Æthíopum → da Etiópia* for the cadence (see decision `dedisti`)."
d['choices']['73:12'] = "The mediant falls on *séculos*, a proparoxytone, as the Latin's *sǽcula* does, and there is no paroxytone Portuguese for *sǽcula*. v2: the stylist found *é … antes dos séculos* temporally odd and proposed *desde antes*. That adds a word, and the Latin's *ante sǽcula* is just as strange, so it is refused."

d['audit'].append({
    'step': 'critic',
    'note': 'v1 readers: latinist, stylist, ambiguity (claude-opus-5-5, fresh context; latinist and stylist with latin.json). No critical or major findings.',
    'outcomes': [
        {'reader': 'latinist', 'verse': '73:1', 'point': '*nos* supplied; *e* added', 'outcome': 'rejected: the object and conjunction are needed by Portuguese (decisions `repulisti`, `v1join`); *rejeitastes* leaves the D42 row'},
        {'reader': 'latinist', 'verse': '73:3', 'point': 'singular for *supérbias*', 'outcome': 'accepted: *as soberbas deles*'},
        {'reader': 'latinist+stylist', 'verse': '73:5', 'point': '*como* supplied', 'outcome': 'accepted: *os seus sinais, sinais*'},
        {'reader': 'latinist+stylist', 'verse': '73:5', 'point': '*souberam* → *conheceram*', 'outcome': 'accepted'},
        {'reader': 'stylist+ambiguity', 'verse': '73:5', 'point': '*cimo* bookish / unknown', 'outcome': 'accepted: *cume*'},
        {'reader': 'latinist', 'verse': '73:14', 'point': '*e* added', 'outcome': 'rejected: the alternative *deste-lo* / bare *o destes* opening a colon is not Portuguese'},
        {'reader': 'latinist', 'verse': '73:19', 'point': '*dão graças* narrows *confitéri*', 'outcome': 'rejected: D5; *louvar* is laudáre\'s, at 73:21'},
        {'reader': 'stylist', 'verse': '73:2', 'point': '*início* → *princípio*', 'outcome': 'rejected: the inítio row; principium keeps *princípio*'},
        {'reader': 'stylist', 'verse': '73:6', 'point': 'long colon; *juntos* trailing; *selva* → *mata*', 'outcome': 'partly accepted: *juntos* moved after the verb; *selva* kept (D44)'},
        {'reader': 'stylist', 'verse': '73:8', 'point': 'three stops, subject last', 'outcome': 'accepted: *Disseram no seu coração os da parentela deles, juntos*'},
        {'reader': 'stylist', 'verse': '73:12', 'point': '*desde antes dos séculos*', 'outcome': 'rejected: adds a word; the Latin is as strange'},
        {'reader': 'stylist', 'verse': '73:14', 'point': 'proparoxytone final *etíopes*', 'outcome': 'accepted: *da Etiópia*'},
        {'reader': 'stylist', 'verse': '73:16', 'point': '*fabricastes* heard as factories', 'outcome': 'accepted: *formastes*'},
        {'reader': 'stylist', 'verse': '73:20', 'point': 'static *estão cheios*; *pois*', 'outcome': 'partly accepted: *se encheram*; *porque* kept for *quia*'},
        {'reader': 'stylist', 'verse': '73:21', 'point': '*se volte* heard as "return"', 'outcome': 'rejected: 69:4b precedent; the ambiguity reader heard "not go away ashamed", which is the sense; *retirar* is the option for avertis at 73:11'},
        {'reader': 'ambiguity', 'verse': '73:6', 'point': '*enxó* unknown', 'outcome': 'kept, as a known cost (decision `ascia`)'},
        {'reader': 'ambiguity', 'verse': '73:8, 73:15', 'point': '*parentela*, *Etã* unknown', 'outcome': 'kept: *parentela* is cognátio\'s plain word; *Etã* is a proper name'},
        {'reader': 'ambiguity', 'verse': '73:2b, 73:5, 73:9, 73:11, 73:20', 'point': 'open readings (*vara*, *saída*, the subject of *conhecerá*, *seio*, *obscurecidos*)', 'outcome': 'kept: each is the Latin\'s own openness (decisions `virga`, `summum`, `amplius`, `obscurati`)'},
        {'reader': 'ambiguity', 'verse': '73:22', 'point': '*vossas afrontas* first heard as God\'s own offences', 'outcome': 'kept: the Latin\'s genitive *improperiórum tuórum* is as open, and the clause that follows resolves it'},
    ],
})
d['status'] = 'revised'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
