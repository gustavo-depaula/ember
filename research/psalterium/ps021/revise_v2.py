"""Draft 2 of Ps 21 from draft 1 (kept as prayed.v1.json) after the three blind readers.
python3.13 research/psalterium/ps021/revise_v2.py"""
import json
import pathlib

here = pathlib.Path(__file__).parent
p = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
V = p['verses']
D = {d['id']: d for d in p['decisions']}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def dec(id_, refs, latin, kind, why, options):
    return {'id': id_, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}


def add_after(anchor, new):
    i = next(k for k, d in enumerate(p['decisions']) if d['id'] == anchor)
    p['decisions'].insert(i + 1, new)


# 21:3 — the stylist's copula (his worst line); the blind reader heard "para" as the verb "parar"
V['21:3'] = 'Meu Deus, clamarei {perdiem}, e não escutareis: * e de noite, e {insipientiam}.'
d = D['insipientiam']
d['why'] += (' Heard (draft 1): the blind reader took *não para a minha insensatez* first as "my folly does not STOP" (*para* as the verb *parar*), and the stylist named it the worst line: "a sequência de elipses deixa a voz sem apoio sintático". Draft 2 supplies the copula *será* (the stylist\'s, without his *isso*): after *será* the *para* can only be the preposition, and both readings stay open. The future follows *clamarei*; grammar only (D2).')
d['options'] = [
    opt('não será para a minha insensatez', {'insipientiam': 'não será para a minha insensatez'}, 'Ruling (draft 2): a copula supplied; *para* heard as the preposition.', 'stylist'),
    opt('não para a minha insensatez', {'insipientiam': 'não para a minha insensatez'}, 'Draft 1, verbless as the Latin; *para* heard as *parar*.', 'draft'),
    opt('isso não será para a minha insensatez', {'insipientiam': 'isso não será para a minha insensatez'}, 'The stylist\'s whole line; a subject too (+2 syllables).', 'stylist'),
    opt('não é insensatez em mim', {'insipientiam': 'não é insensatez em mim'}, 'DRB\'s reading made explicit; closes the ambiguity.', 'DRB'),
    opt('não por minha culpa', {'insipientiam': 'não por minha culpa'}, 'MS1932; another word (culpa), refused.', 'MS1932'),
]

# 21:4 — the blind reader tied *louvor de Israel* to the holy place
V['21:4'] = 'Mas vós habitais {sancto}, * {laus} de Israel.'
add_after('sancto', dec('laus', ['21:4'], 'Tu autem in sancto hábitas, laus Israël', 'grammar',
    '*laus Israël* stands in apposition to *Tu* (nominative or vocative, the Latin does not say which). Draft 1 had it bare after *no lugar santo*, and the blind reader heard it FIRST as a name of the holy place — a wrong first hearing. Draft 2 names the subject again, *vós, louvor de Israel* (a subject named, D2): it is heard as said of God and keeps the Latin\'s openness between "you, the praise of Israel" and "O praise of Israel". MS1932 *ó glória de Israel* makes it a vocative.',
    [opt('vós, louvor', {'laus': 'vós, louvor'}, 'Ruling (draft 2): the subject named; heard as God.', 'ambiguity'),
     opt('louvor', {'laus': 'louvor'}, 'Draft 1; heard as the holy place\'s name.', 'draft'),
     opt('ó louvor', {'laus': 'ó louvor'}, 'MS1932\'s *ó*; closes it as a vocative.', 'MS1932')]))

# 21:10 — the Latinist: the plural *ubéribus*
d = D['uberibus']
d['why'] += ' Heard (draft 1): the Latinist (minor) asked for the plural (*os seios*); the plural is taken as MS1932 has it, *os peitos* — *os seios* would sit beside *o seio materno* and be heard as the same thing.'
d['options'][0] = opt('os peitos … Sobre vós fui lançado … o seio materno', {'uberibus': 'os peitos', 'projectus': 'Sobre vós fui lançado', 'utero': 'o seio materno'}, 'Ruling (draft 2): the Latin\'s plural (MS1932), each body-word its own.', 'latinist')
d['options'].insert(1, opt('o peito', {'uberibus': 'o peito', 'projectus': 'Sobre vós fui lançado', 'utero': 'o seio materno'}, 'Draft 1: the nursing idiom, singular.', 'draft'))
d['options'][2] = opt('os peitos … o útero', {'uberibus': 'os peitos', 'projectus': 'Sobre vós fui lançado', 'utero': 'o útero'}, 'The exact word for the womb; clinical.', 'draft')

# 21:12 — the stylist: *próxima* at the mediant
V['21:12'] = 'Porque a tribulação está {proxima}: * porque não há quem {adjuvet}.'
add_after('adjuvet', dec('proxima', ['21:12'], 'tribulátio próxima est', 'word',
    'The stylist heard the proparoxytone *próxima* weak at the mediant (rule 4) and gave *perto*, the plainer of two faithful words (D2); it also answers the psalm\'s *longe* (21:2, 21:20) as *próxima* answers *longe* in the Latin. The Latin\'s own mediant is the proparoxytone *próxima*.',
    [opt('perto', {'proxima': 'perto'}, 'Ruling (draft 2): the stylist\'s; the pair *longe / perto*.', 'stylist'),
     opt('próxima', {'proxima': 'próxima'}, 'Draft 1, the cognate.', 'draft')]))

# 21:13 — the blind reader did not know *novilhos*
d = D['vituli']
d['why'] += ' Heard (draft 1): *novilhos* was listed as unknown by the blind reader; draft 2 takes *bezerros*, the plainer of two faithful words (D2) and the one that will serve 105:19–20.'
d['options'] = [
    opt('bezerros', {'vituli': 'bezerros'}, 'Ruling (draft 2): calves (DRB), known to every ear.', 'ambiguity'),
    opt('novilhos', {'vituli': 'novilhos'}, 'Draft 1: young bulls beside the bulls (MS1932); unknown to the blind reader.', 'MS1932'),
]

# 21:14 — the stylist's *contra mim*, refused (kept as an option)
V['21:14'] = 'Abriram {super} a sua boca, * como um leão que arrebata e ruge.'
add_after('obsidere', dec('super', ['21:14'], 'Aperuérunt super me os suum', 'word',
    '*super me* → *sobre mim* (the glossary row *super (place)*; MS1932 *Abriram sobre mim a sua boca*): the gaping jaws over the prey, the lion of the second colon. The stylist heard a translated spatial build and asked for *contra mim* (DRB *against me*); refused because *abrir a boca contra* is to speak against someone, which turns the beast\'s mouth into words. The Latinist did not remark.',
    [opt('sobre mim', {'super': 'sobre mim'}, 'Ruling: the Latin\'s place; the lion\'s jaws.', 'draft'),
     opt('contra mim', {'super': 'contra mim'}, 'The stylist (and DRB): the hostility; heard as verbal attack.', 'stylist')]))

# 21:16 — the stylist: *apegou-se* is affection before touch
V['21:16'] = '{virtus} secou-se como um {testa}, e a minha língua {adhaesit} à minha {fauces}: * e me fizestes descer ao pó da morte.'
add_after('virtus', dec('adhaesit', ['21:16'], 'lingua mea adhǽsit fáucibus meis', 'glossary',
    'adhǽrére → apegar-se a (glossary row, open, which names 21:16). The stylist heard *se apegou* as an affective bond before a physical one ("a imagem da língua presa demora a chegar"), and asked for *ficou presa* — another verb. Draft 2 takes the row\'s own named option, DM1962\'s *colar-se*: the physical sticking the Latin says, one verb for one. *apegar-se* stays right where the clinging is of the soul (118:25, 118:31, 62:9).',
    [opt('se colou', {'adhaesit': 'se colou'}, 'Ruling (draft 2): the row\'s option (DM1962); the tongue stuck fast.', 'stylist'),
     opt('se apegou', {'adhaesit': 'se apegou'}, 'Draft 1, the row; heard as affection first.', 'glossary'),
     opt('ficou presa', {'adhaesit': 'ficou presa'}, 'The stylist\'s wording; a state, not the Latin\'s verb.', 'stylist')]))

# 21:21 — the stylist: *única* at the final → order
V['21:21'] = '{erue} da espada, Deus, a minha alma: * e {unicam}, da mão do cão:'
d = D['unicam']
d['why'] += ' Heard (draft 1): the stylist found the proparoxytone *única* weak at the final and moved the object forward (*e a minha única, da mão do cão*); taken — order only (D2), the parallel with *a minha alma* still heard. The blind reader heard "my only soul" first, "my only life" second, and a beloved woman third — the Latin\'s openness.'

# 21:24 and 21:27 — the stylist's reorderings, refused and kept as options
V['21:24'] = 'Vós que temeis o Senhor, louvai-o: * {v24b}.'
add_after('semen', dec('glorificate', ['21:24'], 'univérsum semen Jacob, glorificáte eum', 'order',
    'The stylist heard *louvai-o … glorificai-o* rhyme at both cadences and moved the vocative last. Refused: the rhyme is the Latin\'s own (*laudáte eum … glorificáte eum*, rule 5\'s exception), and the Latin puts the vocative first in both cola.',
    [opt('the Latin\'s order', {'v24b': 'toda a {sem1} de Jacó, glorificai-o'}, 'Ruling: the Latin\'s order and echo.', 'draft'),
     opt('glorificai-o, toda a …', {'v24b': 'glorificai-o, toda a {sem1} de Jacó'}, 'The stylist: no rhyme; the cadence on *Jacó*.', 'stylist')]))
V['21:27'] = 'Os pobres comerão, e serão saciados: e louvarão o Senhor os que o procuram: * {v27b}.'
add_after('apud', dec('saeculi', ['21:27'], 'vivent corda eórum in sǽculum sǽculi', 'order',
    'in sǽculum sǽculi → pelos séculos dos séculos (settled, D27). The stylist asked for the formula first, so that the verse does not close on the proparoxytone *séculos*. Refused: the Latin itself closes on *sǽculi*; the formula closes verses so everywhere (18:10, 20:5, 20:7, held the same way); and the Latin puts *vivent* first. The Latinist asked again (minor) for *pelo século do século* — refused, D27.',
    [opt('the Latin\'s order', {'v27b': 'viverão os seus corações pelos séculos dos séculos'}, 'Ruling: the Latin\'s order; D27\'s words.', 'D27'),
     opt('formula first', {'v27b': 'pelos séculos dos séculos viverão os seus corações'}, 'The stylist: a stressed final syllable.', 'stylist')]))

# 21:20 — the stylist's *afasteis*: the existing MS1932 option already has it; say so
d = D['elongaveris']
d['why'] += ' Heard (draft 1): the stylist found *não ponhais longe de mim* "montado palavra por palavra" and asked for *não afasteis de mim* — refused, because 21:11 has already given *afastar* to *ne discésseris a me*, nine verses before, and the Latin\'s *longe* would be lost; it is the second option.'
d['options'][1]['from'] = 'stylist'
d['options'][1]['note'] = 'The stylist and MS1932; *afastar* is discédere\'s in 21:11, *atender* is inténdere\'s (D3).'

# 21:18 — the Latinist's singular *sortem*: refused (the option exists)
d = D['sortem']
d['why'] += ' Heard (draft 1): the Latinist (minor) asked for the singular *lançaram a sorte*; refused — *lançar a sorte* is heard as casting one\'s fate, and the blind reader heard *lançaram sortes* as a drawing of lots.'
d['options'][1]['from'] = 'latinist'

p['version'] = 2
(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=1), encoding='utf-8')
print('draft 2 written')
