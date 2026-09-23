"""Ps 102 draft 2: apply the v1 readers' remarks (run from the repo root)."""
import json
from pathlib import Path

path = Path('research/psalterium/ps102/prayed.json')
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, note_add=None):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    o = opts.pop(i)
    if note_add:
        o['note'] = note_add
    opts.insert(0, o)


d['version'] = 2
d['status'] = 'reviewed'

# 102:5 — stylist + ambiguity reader: the elliptical head is caught too late
promote('renovabitur', 'a tua juventude se renovará como a da águia',
        'v2 — the stylist\'s (and the ambiguity reader could not catch *a da* ahead of its noun): plain order, so the ellipsis follows its noun; order only (D2). *águia* is said as two syllables (*á-guia*) in speech, so the final is paroxytone')
for o in dec['renovabitur']['options']:
    o['from'] = 'stylist' if o['label'].startswith('a tua') else o.get('from', 'draft')
dec['renovabitur']['why'] += ' v2: the stylist and the ambiguity reader both stumbled on *como a da águia* at the head (the pronoun comes before its noun); the plain order taken.'

# 102:14 — stylist: double inversion
dec['homo']['options'].insert(0, {
    'label': 'o homem, os seus dias são como a erva',
    'forms': {'homo': 'o homem, os seus dias são como a erva'},
    'note': 'v2 — the stylist\'s: the hanging subject kept (so *florescerá* stays the man\'s), the comparison in plain order; order only (D2)',
    'from': 'stylist'})
dec['homo']['options'][1]['note'] = 'draft 1 — the Latin order of *sicut fænum dies ejus*; the stylist and the ambiguity reader could not place the double inversion at speed'
dec['homo']['why'] += ' v2: the stylist\'s order taken for the comparison; the hanging *o homem* stays.'

# 102:20 — stylist: *poderosos em vigor* tautological
promote('virtute', 'força', 'v2 — the stylist\'s (and DRB \'mighty in strength\'): *poderosos em vigor* heard as tautological and stiff. A local departure from the virtus row\'s *vigor*: the angels\' ἰσχύς; fortitúdo does not occur in this psalm')
dec['virtute']['options'][0]['from'] = 'stylist'
dec['virtute']['options'][1]['note'] = 'draft 1 — the virtus row\'s proposal for ἰσχύς; the stylist heard *poderosos em vigor* as a tautology'
dec['virtute']['why'] += ' v2: the stylist\'s *força* taken as a local departure; *vigor* stays the option.'

# 102:20 — stylist's *do seu falar* kept as an option
d['verses']['102:20'] = d['verses']['102:20'].replace('a voz das suas {sermonum}', 'a voz {sermonum}')
for o in dec['sermonum']['options']:
    o['forms']['sermonum'] = {'palavras': 'das suas palavras', 'falas': 'das suas falas', 'ordens': 'das suas ordens'}[o['label']]
dec['sermonum']['options'].append({
    'label': 'do seu falar', 'forms': {'sermonum': 'do seu falar'},
    'note': 'the stylist (v1): the echo *palavra … palavras* lands on the final cadence. Refused: the Greek repeats λόγος, D15 merges verbum and sermo; *falar* as a noun is a third shape',
    'from': 'stylist'})
dec['sermonum']['why'] += ' v2: the stylist heard *palavra … palavras* as a jingle at the cadence and asked *do seu falar*; refused for D15 (the Greek has the same repetition), kept as an option.'

# 102:18 — ambiguity reader: *E se lembram* heard as 'and if they remember'
d['verses']['102:18'] = 'E lembram-se dos seus mandamentos, * para {facere18}.'
d['choices']['102:18'] += ' v2: *E se lembram* was heard by the ambiguity reader as \'and if they remember\' (conditional *se*); enclisis *E lembram-se* cannot be. *E que se lembram* (a relative continuing 102:17b) is the alternative the Latin\'s main clause does not ask for.'

# 102:17b — stylist's *guardam* already option 2
dec['servant']['options'][1]['note'] += '; the stylist (v1) asked it as plainer — refused for the row (custodíre keeps *guardar*); the ambiguity reader heard *observam* as keep'
dec['servant']['options'][1]['from'] = 'MS1932'

# 102:9 — Latinist: simple future; stylist: perpetuamente heavy
dec['perpetuum']['options'].append({
    'label': 'para sempre … eternamente', 'forms': {'perpetuum': 'para sempre'},
    'note': 'the stylist\'s swap (*Não estará irado para sempre: * nem ameaçará eternamente*); needs the second colon changed too and breaks D23 (*in ætérnum → para sempre*, *eternamente* its refused option)',
    'from': 'stylist'})
d['verses']['102:9'] = 'Não {irascetur} {perpetuum}: * nem ameaçará para sempre.'
d['decisions'].insert(d['decisions'].index(dec['perpetuum']) + 1, {
    'id': 'irascetur', 'refs': ['102:9'], 'latin': 'irascétur', 'kind': 'grammar',
    'why': 'The Latinist (v1, minor) asks the simple future *se irará* (the act, not a state), parallel to *ameaçará*. Held for the irásci row: 79:5 and 84:6 made the future a copula + participle because *vos irareis* is a knot of r\'s, and *se irará perpetuamente* is the same knot. The state reading is inside the verse\'s sense (not angry for ever).',
    'options': [
        {'label': 'estará irado', 'forms': {'irascetur': 'estará irado'}, 'note': 'draft — the row\'s copula future (79:5, 84:6)', 'from': 'glossary'},
        {'label': 'se irará', 'forms': {'irascetur': 'se irará'}, 'note': 'the Latinist\'s simple future', 'from': 'latinist'}]})

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. One minor, no major; held as an option.',
     'outcomes': [{'verse': '102:9', 'remark': 'irascétur is a future of the act: se irará', 'outcome': 'option', 'decision': 'irascetur', 'reason': 'the irásci row\'s copula future (79:5, 84:6), for the r-knot *se irará perpetuamente*'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. 6 remarks on 5 verses; best line 102:17, worst 102:20. 3 taken (102:5 order, 102:14 order, 102:20 força), 3 refused and kept as options.',
     'outcomes': [
         {'verse': '102:5', 'remark': 'elliptical como a da águia at the head → a tua juventude se renovará como a da águia', 'outcome': 'taken'},
         {'verse': '102:9', 'remark': 'perpetuamente heavy → para sempre … eternamente', 'outcome': 'option', 'decision': 'perpetuum', 'reason': 'breaks D23 (in ætérnum → para sempre) and D27\'s keeping εἰς τέλος apart; perpetuamente is the cognate and MS1932\'s word'},
         {'verse': '102:14', 'remark': 'double inversion → o homem, os seus dias são como a erva', 'outcome': 'taken'},
         {'verse': '102:17b', 'remark': 'observam legal → guardam', 'outcome': 'option', 'decision': 'servant', 'reason': 'the serváre row keeps guardar for custodíre'},
         {'verse': '102:20', 'remark': 'poderosos em vigor tautological → força', 'outcome': 'taken'},
         {'verse': '102:20', 'remark': 'palavra … palavras jingle → do seu falar', 'outcome': 'option', 'decision': 'sermonum', 'reason': 'D15; the Greek repeats λόγος as well'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context, Portuguese only. 28 readings; unknown words: retribuições, clemente, compaixões, dista, subsistirá, cumpris, fazeis (the last two are verb forms of the vós plural, not words). One fault taken (102:18); 102:5 and 102:14 mended with the stylist.',
     'outcomes': [
         {'verse': '102:18', 'remark': 'E se lembram heard as \'and if they remember\'', 'outcome': 'taken'},
         {'verse': '102:5', 'remark': 'a da águia hard to catch', 'outcome': 'taken'},
         {'verse': '102:14', 'remark': 'syntax hard to follow; florescerá heard as a promise', 'outcome': 'taken', 'reason': 'order mended; the flowering is the Latin\'s own word, its transience comes in 102:16'},
         {'verse': '102:2', 'remark': 'retribuições heard as rewards or punishment; unknown', 'outcome': 'refused', 'reason': 'the retribútio row keeps it neutral on purpose; benefícios (MS1932) is an option'},
         {'verse': '102:3', 'remark': 'verse-initial Que may sound like a question; clemente unknown', 'outcome': 'refused', 'reason': 'heard as a relative first; clemente is the propitiári row\'s proposal awaiting Gustavo'},
         {'verse': '102:11', 'remark': 'segundo a altura heard as a vague according to', 'outcome': 'refused', 'reason': 'secúndum and altitúdo are the Latin\'s words (the altitúdo row names this verse); the MS1932 correlative would paraphrase'},
         {'verse': '102:16', 'remark': 'sopro heard as God\'s breath; conhecer o seu lugar as the social idiom', 'outcome': 'refused', 'reason': 'the openness of spíritus is the Latin\'s; the place-verb is the Latin\'s own words'},
         {'verse': '102:17b', 'remark': 'observam heard as watch, but keep first', 'outcome': 'refused', 'reason': 'heard rightly first; row'},
         {'verse': '102:21', 'remark': 'poderes heard abstract; ministros as clergy', 'outcome': 'refused', 'reason': 'D43 poderes (exércitos option); minister is the Latin\'s word'},
         {'verse': '102:12', 'remark': 'dista unknown', 'outcome': 'refused', 'reason': 'the Latin\'s verb, plain in written Portuguese'}]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 102:5 plain order (stylist, ambiguity); 102:14 comparison in plain order, hanging subject kept (stylist); 102:18 *E lembram-se* (ambiguity: conditional *se*); 102:20 *poderosos em força* (stylist; local departure from the virtus row) and the slot *sermonum* widened to carry *do seu falar* as an option; 102:9 new decision `irascetur` recording the Latinist\'s simple future. Draft 1 kept as prayed.v1.json.'}]

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
