"""One-off: v2 revision of prayed.json after the v1 readers (critic/v1.*.json); also repoints moved third-party files."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
v = d['verses']
v['45:16'] = 'Foram envergonhados, e coraram todos: * juntos {abierunt} os {fabricatores} de erros.'
v['45:17'] = 'Israel foi salvo no Senhor com salvação eterna: * não sereis envergonhados, e não corareis {saeculi}.'
v['45:18'] = 'Porque isto diz o Senhor, {creans}, * o próprio Deus que {formans} a terra e a {faciens}, {plastes}:'
v['45:23'] = '{nescierunt} os que levantam {lignum}, * e rogam a um deus que não salva.'
v['45:24'] = 'Anunciai, e vinde, e {consiliamini} juntos: * Quem {auditum} desde o início, desde então o predisse?'
v['45:25'] = 'Acaso não sou eu o Senhor, e não há mais Deus além de mim? * Deus justo e que salve não há {praeter}.'
v['45:29'] = 'Portanto, dirá: No Senhor estão {justitiae} e o domínio: * a ele virão, e serão envergonhados todos os que lhe resistem.'
v['45:30'] = 'No Senhor será justificada e {laudabitur} * toda a descendência de Israel.'

dec = {x['id']: x for x in d['decisions']}


def first(did, label):
    opts = dec[did]['options']
    i = next(i for i, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(i))


# abierunt: stylist heard 'Foram … se foram' as a pun on two verbs.
dec['abierunt']['options'].insert(0, {
    'label': 'partiram para a vergonha', 'forms': {'abierunt': 'partiram para a vergonha'},
    'note': 'v2 (stylist): keeps the going-away of ab-íre without the chime of passive "Foram" against "se foram" in one verse.',
    'from': 'stylist'})

# creans: latinist — the Latin has present participles; the present is timeless as they are.
c = dec['creans']
c['refs'] = ['45:18']
for o in c['options']:
    o['forms'] = {'creans': o['forms']['creans'] + (' os céus' if o['label'] != 'criador dos' else ' céus'),
                  'formans': 'forma' if o['label'] != 'que criou' else 'formou',
                  'faciens': 'faz' if o['label'] != 'que criou' else 'fez'}
first('creans', 'que cria')
c['options'][0]['note'] = ('v2 (latinist): the Latin\'s present, for all three participles (cria, forma, faz): a title of '
                           'the Creator, timeless as the participle is; the perfects follow in 45:19 as in the Latin.')
for o in c['options']:
    if o['label'] == 'criador dos':
        o['label'] = 'criador dos céus'

# plastes: latinist — keep the noun.
first('plastes', 'ele próprio o seu modelador')
pl = dec['plastes']['options']
pl[0]['label'] = 'ele próprio, o seu modelador'
pl[0]['forms'] = {'plastes': 'ele próprio, o seu modelador'}
pl[0]['note'] = ('v2 (latinist): the Latin\'s noun in apposition kept (DRB "the very maker thereof"); the moulding kept '
                 'in the word; oxytone before the colon. The comma after "ele próprio" marks the apposition.')
pl[1]['note'] = 'v1: the noun made a verb; the latinist: a fourth finite act in the list, where the Latin has a noun.'

# nescierunt: stylist — bare "Não souberam" sounds unfinished.
n = dec['nescierunt']['options']
n.insert(0, {'label': 'Nada souberam', 'forms': {'nescierunt': 'Nada souberam'}, 'from': 'stylist'})
n[0]['note'] = ('v2 (stylist): the Latin\'s perfect, absolute; "Nada" makes the negation absolute as Portuguese says it '
                '("Não souberam" alone asks "what?", where 81:5 has "nem entenderam" to complete it).')
n[1]['note'] = 'v1, as 81:5; heard as unfinished when it stands alone (stylist).'

# auditum: latinist — no conjunction added.
dec['auditum']['why'] = dec['auditum']['why'].replace(
    "The Latin then goes on without a conjunction (ex tunc prædíxit illud); 'e' is supplied so that the second verb is heard as the same 'who'.",
    "The Latin then goes on without a conjunction (ex tunc prædíxit illud); v2 keeps the asyndeton (latinist: v1's 'e' joined what the Latin leaves as two parallel phrases).")

ch = d['choices']
ch['45:17'] = ch['45:17'].replace("the indefinite article supplied before 'salvação eterna'",
                                  "no article before 'salvação eterna', as the Latin (v2, stylist: v1's 'uma' limped)")
ch['45:18'] = ch['45:18'].replace("formáre → 'formar', fácere → 'fazer' (94:5, 138:5).",
                                  "formáre → 'formar', fácere → 'fazer' (94:5, 138:5), in the present with creans (decision creans).")
ch['45:25'] = ch['45:25'].replace("'Deus justo, e que salve, não há senão eu'",
                                  "'Deus justo e que salve não há senão eu' (v2: the commas dropped, stylist; one breath, one claim)")
ch['45:29'] = ch['45:29'].replace("dicet → 'dirá', no subject supplied",
                                  "dicet → 'dirá', moved before what is said (v2, stylist: the parenthetical was unsayable; order yields to the ear, D2; DRB does the same), no subject supplied")
ch['45:30'] = ch['45:30'] + " v2: no comma before 'e louvada' (stylist)."
ch['45:16'] = ch['45:16'] + (" The stylist asked for 'Todos foram envergonhados': not taken — 'coraram todos' is good "
                             "Portuguese and keeps omnes where the Latin puts it.")
ch['45:21'] = ch['45:21'] + (" The stylist asked to move 'em vão' beside the verb: not taken, it is the decision frustra "
                             "(the ambiguity reader heard both readings open). 'que falo justiça' stays with 57:2.")
ch['45:24'] = ch['45:24'] + (" The stylist asked for 'aconselhai-vos': not taken (decision consiliamini; the ambiguity "
                             "reader heard 'tomai conselho juntos' as 'deliberate', the sense wanted). The two 'desde' "
                             "are the Latin's two parallel phrases (ab inítio, ex tunc).")

for step in d['audit']:
    step['note'] = (step['note']
                    .replace('(ps215/bolls-VULG-23-45.json)', '(consult/ps215/bolls-VULG-23-45.json)')
                    .replace('builds ps215/parallels.md', 'builds consult/parallels/ps215.md (gitignored)')
                    .replace('ps215/ms1932-isa45-p494-495.txt', 'consult/ps215/ms1932-isa45-p494-495.txt'))

exec((here / 'audit_v2.py').read_text(encoding='utf-8'))
d['version'] = 2
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
