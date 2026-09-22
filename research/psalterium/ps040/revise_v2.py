"""Draft 2 of Ps 40 after the v1 readers (Latinist, stylist, ambiguity — claude-opus-5-5, fresh context)."""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
d['version'] = 2
v = d['verses']
v['40:2'] = 'Bem-aventurado o que {intellegit}: * no dia mau o livrará o Senhor.'
v['40:4'] = 'O Senhor lhe traga {opem} {superlectum} da sua dor: * toda a sua cama {versasti} na sua enfermidade.'
v['40:6'] = 'Os meus inimigos disseram {mihi6}: * Quando morrerá, e perecerá o seu nome?'
v['40:10'] = '{etenim} o homem da minha paz, em quem esperei: * que comia {panes}, {supplantatio}.'
dec = {x['id']: x for x in d['decisions']}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


x = dec['intellegit']
x['why'] += ' v2: the Latinist (minor) marked *super* dropped, and the stylist and the blind reader both heard *entende o necessitado* as psychological sympathy. *super* is restored as *acerca de*, which also makes the verb one of taking thought.'
x['options'] = [
    opt('o que entende acerca do necessitado e do pobre', {'intellegit': 'entende acerca do necessitado e do pobre'}, "Ruling (v2): the Latinist's fix — the glossary verb and the preposition both kept; DRB 'understandeth concerning'. Long (+5 on the Latin colon), accepted.", 'latinist'),
    opt('o que entende o necessitado e o pobre', {'intellegit': 'entende o necessitado e o pobre'}, 'draft 1; *super* absorbed; heard as sympathy by the stylist and the blind reader.', 'draft'),
    opt('o que atende ao necessitado e ao pobre', {'intellegit': 'atende ao necessitado e ao pobre'}, "stylist; *atender* is inténdere's (D3), so two Latin verbs would meet in one.", 'stylist'),
    opt('o que cuida do necessitado e do pobre', {'intellegit': 'cuida do necessitado e do pobre'}, 'MS1932; says what the Latin does not (care).', 'MS1932'),
]

x = dec['opem']
x['why'] += " v2: the stylist heard *leve* first as the adjective 'light'; *traga* is as much *ferre* and cannot be misheard."
x['options'] = [
    opt('lhe traga socorro', {'opem': 'socorro'}, 'Ruling (v2): stylist.', 'stylist'),
    opt('lhe traga auxílio', {'opem': 'auxílio'}, 'MS1932 *lhe dê auxílio*; collides with adjutórium.', 'MS1932'),
]
d['decisions'].insert(d['decisions'].index(x) + 1, {
    'id': 'superlectum', 'refs': ['40:4'], 'latin': 'super lectum dolóris ejus', 'kind': 'grammar',
    'why': "*super* with the bed is 'on', which Portuguese says with *em*; the stylist found *sobre o leito* stiff. A preposition, not a word of sense (D2).",
    'options': [
        opt('no leito', {'superlectum': 'no leito'}, 'Ruling (v2): stylist.', 'stylist'),
        opt('sobre o leito', {'superlectum': 'sobre o leito'}, "draft 1; MS1932; the Latin's *super*.", 'MS1932'),
    ],
})

x = dec['versasti']
x['why'] = x['why'].replace(' The Latin puts the bed first (*univérsum stratum ejus versásti*); the verb first is natural order (D2).', '') + " v2: the stylist found *revolvestes toda a sua cama na sua* a mouthful and proposed the Latin's own order, object first; taken (his *em sua* without the article is refused — rule 5). The two *sua* stay: the Latin has *ejus* twice. The blind reader did not know *revolvestes* and heard the sudden 'you' as confusing — the switch is the Latin's (and the Greek's) and is kept."
x['options'][0]['note'] = "Ruling: MS1932's verb; 'turn over'. v2: after the object, as the Latin (stylist)."
x['options'][1]['note'] = "plainer; DRB 'turned'; heard as flipping it once. Unknown-word evidence: the blind reader listed *revolvestes*."

x = dec['mihi6']
x['why'] += " v2: the stylist: *dizer males de* is not idiomatic; *dizer mal de* (maldizer) is, and keeps both *dixérunt* and *mala*. Taken; the plural is not heard (number is grammar, D2)."
x['options'] = [
    opt('mal de mim', {'mihi6': 'mal de mim'}, 'Ruling (v2): stylist.', 'stylist'),
    opt('males de mim', {'mihi6': 'males de mim'}, "draft 1; the Latin's plural.", 'draft'),
    opt('males contra mim', {'mihi6': 'males contra mim'}, 'DRB, MS1932 *falaram contra mim*.', 'DRB'),
]

x = dec['foras']
x['options'].append(opt('Saía porta afora', {'foras': 'Saía porta afora'}, "stylist; refused — *porta* is an image the Latin does not have (D2); the pleonasm he objects to is the Latin's own (*egrédi foras*).", 'stylist'))
x['why'] += ' v2: the stylist named *sair para fora* the textbook redundancy; kept, because the redundancy is the Latin\'s and the inside/outside contrast with 40:7 rests on *foras*.'

x = dec['idipsum']
x['options'].append(opt('do mesmo modo', {'idipsum': 'do mesmo modo'}, "stylist; refused — manner, where *in idípsum* is direction or purpose; the blind reader heard *no mesmo sentido* both ways the Latin allows (the same talk; in agreement with the others).", 'stylist'))

x = dec['mihi8']
x['why'] += " v2: the stylist found *pensavam em males para mim* a limping chain of prepositions (*em … para*) and proposed *pensavam o mal para mim* (the row's preposition dropped, the plural lost). Taken in part: the ethical dative, which only repeats the person already named twice by *advérsum me*, is left unsaid, and the row's *pensar em* and the plural stay."
x['options'] = [
    opt('males', {'mihi8': 'males'}, 'Ruling (v2): the dative left implicit under the anaphora (grammar, D2).', 'stylist'),
    opt('males para mim', {'mihi8': 'males para mim'}, 'draft 1; every Latin word said.', 'draft'),
    opt('o mal para mim (pensavam o mal para mim)', {'mihi8': 'o mal para mim'}, "stylist's line — would also need *em* dropped; recorded.", 'stylist'),
]

x = dec['resurgat']
x['why'] += " v2: the stylist heard *tornará a ressurgir* as a doubled 'again'. Refused: the Latin doubles it too (*adíciet ut resúrgat*), and *ressurgir* is the row's word, kept apart from *ressuscitar* two verses on. The blind reader heard the question's tone as open — the Latin's own ambiguity."
x['options'][1]['from'] = 'stylist'
x['options'][1]['note'] = "stylist; MS1932 *se poderá outra vez levantar*."

x = dec['panes']
x['why'] += " v2: the Latinist marked the singular minor (the Latin's number); refused for the reason above."

x = dec['supplantatio']
x['why'] += " v2: the Latinist (minor) marked *a sua* as supplied; the stylist named 40:10 the worst line — *engrandecer uma rasteira* is a collocation that does not exist and a jolt of register; the blind reader heard the betrayal rightly but did not know *engrandeceu* here. Taken: *magnificáre* is said *fez grande* — the causative the Latin verb is, where the glossary's *engrandecer* (praise and boasting: 11:5, 19:6, 33:4, 34:27) does not fit a thing made great; and the possessive is dropped. *rasteira* stays: none of the three readers lost the sense, and it keeps the heel."
x['options'] = [
    opt('fez grande contra mim a rasteira', {'supplantatio': 'fez grande contra mim a rasteira'}, 'Ruling (v2): the stylist\'s verb, the Latinist\'s article.', 'stylist'),
    opt('engrandeceu contra mim a sua rasteira', {'supplantatio': 'engrandeceu contra mim a sua rasteira'}, "draft 1: the glossary's verb.", 'draft'),
    opt('fez grande contra mim a sua traição', {'supplantatio': 'fez grande contra mim a sua traição'}, "MS1932's noun (*urdiu contra mim a sua traição*); L&S's sense without the image.", 'MS1932'),
]

x = dec['asaeculo']
x['options'].append(opt('de século em século', {'asaeculo': 'de século em século'}, "Latinist (minor): keeps the repeated noun; refused — D37 rules *para todo o sempre* for *usque in sǽculum*, and *século* here is D27's *pelos séculos dos séculos* word, heard as a hundred years when alone.", 'latinist'))
d['choices']['40:12'] += " v2: the Latinist asked *sobre mim* for *super me* (minor); refused — the Greek is supergaudére's (ἐπιχαρῇ ἐπ᾿ ἐμέ), and 29:2, 34:19, 34:24, 37:17 all say *à minha custa*; *se alegrar sobre mim* is not Portuguese."
d['choices']['40:3'] += " v2: the blind reader heard *à alma dos seus inimigos* vaguely and did not know *vivifique*; both kept (26:12; the vivificáre row), with *à vontade* and *lhe dê vida* as options."
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
