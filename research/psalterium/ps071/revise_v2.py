"""Ps 71 draft 2 from the v1 readers. Reads prayed.v1.json, writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
dec = {x['id']: x for x in d['decisions']}
V = d['verses']


def promote(did, label, why_add=None, new=None):
    """Move the option with this label to the front (or insert `new` first)."""
    x = dec[did]
    if new:
        x['options'].insert(0, new)
    else:
        i = [o['label'] for o in x['options']].index(label)
        x['options'].insert(0, x['options'].pop(i))
    if why_add:
        x['why'] += ' ' + why_add


# 71:6 velo -> lã (stylist; ambiguity: unknown word, misheard as véu / velho)
promote('vellus', 'a lã', '**v2:** the stylist called *velo* bookish and the ambiguity reader listed it as unknown, hearing *véu* or *velho*: a wrong first hearing. *a lã* keeps the wool, the concrete thing the rain falls on; the fleece as a whole is lost. *o velo* stays option 2.')
dec['vellus']['options'][0]['note'] = 'Ruling (v2); stylist and ambiguity reader.'
dec['vellus']['options'][0]['from'] = 'stylist'
dec['vellus']['options'][1]['note'] = 'Draft 1; the Latin\'s fleece, MS1932; unknown to the ambiguity reader.'

# 71:9 order (stylist): proparoxytone off the mediant
V['71:9'] = 'Os etíopes se prostrarão diante dele: * e os seus inimigos {lingent}.'
d['choices']['71:9'] = ('*prócidere → prostrar-se* (no row; proposed, open). *Æthíopes → os etíopes*, the people\'s name in lower case as Portuguese writes it. '
                        '**v2:** subject first, *coram illo* after the verb (the stylist): draft 1 put the proparoxytone *etíopes* at the mediant; order is grammar (D2). '
                        'The ambiguity reader could take *os seus inimigos* as the Ethiopians\' — as the Latin *ejus* can be; left.')

# 71:12 adjútor -> quem o auxiliasse (Latinist + stylist)
promote('adjutor', 'quem o auxiliasse', '**v2:** the Latinist and the stylist both asked for the person (*quem o ajudasse*): *adjútor* is a helper, and *não tinha auxílio* made him an abstraction. Taken in the row\'s own verb (*adjuváre → auxiliar*, 43:26 *auxiliai-nos*): a noun turned into a clause is grammar (D2) and keeps the person. This departs from the row\'s uniform *auxílio*, which is still open for Gustavo; the build is local — there is no *meus* here and no pairing with another agent noun.')
dec['adjutor']['options'][0]['note'] = 'Ruling (v2); the Latinist and stylist, in the row\'s verb (they wrote *ajudasse*, which is *adjuváre* in another word).'
dec['adjutor']['options'][0]['from'] = 'latinist'
dec['adjutor']['options'][1]['note'] = 'Draft 1; the adjútor row\'s uniform word; both readers heard an abstraction.'

# 71:14 pronoun clatter (stylist) + honorábile adjective (Latinist)
V['71:14'] = 'Das usuras e da iniquidade resgatará as suas almas: * {hon14}.'
promote('hon14', 'será digno de honra', '**v2:** the Latinist: *honorábile* is an adjective, \'worthy of honour\', not the participle — taken as *digno de honra*. He also called the future supplied; held: the copula must have a tense, the psalm\'s verbs around it are future, and DRB supplies \'shall be\'. The first colon now says *as suas almas* (the stylist: *deles … deles … dele* clattered, and the mediant *deles* chimed with the final *dele*); the possessive is heard as the poor\'s, whose souls these are in 71:13.')
dec['hon14']['options'][0]['note'] = 'Ruling (v2); the Latinist\'s sense of the adjective.'
dec['hon14']['options'][0]['from'] = 'latinist'
dec['hon14']['options'][1]['note'] = 'Draft 1; the participle, \'honoured\'.'
d['choices']['71:14'] = ('*usúra → usura* (row, names this verse); the plural kept — unknown to the ambiguity reader, kept for the reproach the row wants. *rédimet → resgatará* (redímere row). '
                         '**v2:** first colon *as suas almas* for *as almas deles* (stylist); *eórum* in the second colon stays *deles*, apart from the king\'s *dele*.')

# 71:15 order (stylist)
dec['deipso']['options'][0]['forms']['deipso'] = 'e sempre adorarão por ele'
dec['deipso']['options'][0]['label'] = 'e sempre adorarão por ele'
dec['deipso']['options'][0]['note'] = 'Ruling; verb and preposition kept; v2 order from the stylist (*sempre* first, *por ele* after the verb).'
dec['deipso']['why'] += (' **v2:** the stylist found *por ele adorarão* hard to parse and moved *sempre* forward — taken (order). The Latinist passed the phrase and named it among the Septuagintal readings kept. '
                         'The ambiguity reader heard \'adore him\' first, \'pray for him\' and \'through him\' second — the openness of *de ipso* is heard.')
dec['deipso']['options'].insert(1, {'label': 'e por ele adorarão sempre', 'forms': {'deipso': 'e por ele adorarão sempre'}, 'note': 'Draft 1 order; the stylist found it hard to parse.', 'from': 'draft'})

# 71:16 firmaméntum -> esteio (Latinist); comma (stylist); feno -> erva (stylist, ambiguity)
V['71:16'] = 'E haverá {firm} na terra, {summis}, acima do Líbano se erguerá o seu fruto: * e {decivitate} como {faenum} da terra.'
promote('firm', 'esteio', '**v2:** the Latinist (minor): *sustento* is heard first as food, which slides to the Hebrew\'s grain; the ambiguity reader confirmed it (\'food/sustenance\'). Taken: *esteio*, D31\'s word for the prop, is the Latin\'s support (στήριγμα) without the food — the staff-of-bread sense needs *panis*, as at 104:16, which this verse does not have. *esteio* was unknown to one blind reader in Ps 17; it is the settled word.')
dec['firm']['options'][0]['note'] = 'Ruling (v2); the Latinist; D31\'s word for a support.'
dec['firm']['options'][0]['from'] = 'latinist'
dec['firm']['options'][1]['note'] = 'Draft 1; support and food both — heard as food first by the Latinist and the ambiguity reader.'
promote('faenum', 'a erva', '**v2:** the stylist (\'hay does not flower, the image jars\') and the ambiguity reader (*feno* unknown; heard as dry, short-lived) both refused *feno* here. Taken: a wrong image is a fault (rule 5), and the Greek is χόρτος, grass. 36:2 keeps *feno*, where the point is that it dries — so one Latin word has two Portuguese words, by what the verse does with it (as D32 splits *semen*). Proposed to the fænum row.')
dec['faenum']['options'][0]['note'] = 'Ruling (v2); stylist and ambiguity reader; χόρτος; MS1932 *erva*.'
dec['faenum']['options'][0]['from'] = 'stylist'
dec['faenum']['options'][1]['note'] = 'Draft 1; 36:2\'s word; hay does not flower.'
dec['decivitate']['why'] += ' **v2:** the ambiguity reader heard exactly the Latin\'s openness (\'they will flourish from the city\', without knowing who). Kept.'
d['choices']['71:16'] = d['choices']['71:16'] + ' **v2:** comma after *na terra* (the stylist: two locatives ran together).'

# refused / optioned: 71:10 levarão, dádivas; 71:13 carente; 71:19 passive
dec['adducent']['why'] += ' **v2:** the Latinist (minor) asked *trarão*: *addúcere* is bringing toward. Held for the row (D42): *levar presentes* to a king is movement toward him in Portuguese too, and *trazer* is kept for *afférre*.'
dec['munera']['why'] += ' **v2:** the stylist asked *dons* (the proparoxytone *dádivas* at the mediant). Held for the múnera row, as at 44:13 against the same objection; *dons* is now option 3 with *presentes* kept for *dona*. The ambiguity reader listed *dádivas* as unknown.'
dec['munera']['options'].append({'label': 'dons … presentes', 'forms': {'m10': 'dons', 'd10': 'presentes'}, 'note': 'the stylist\'s; an oxytone at the mediant.', 'from': 'stylist'})
dec['bened']['why'] += ' The promise-formula wording was quoted from memory, unverified.'
d['decisions'].append({
    'id': 'replebitur', 'refs': ['71:19'], 'latin': 'et replébitur majestáte ejus omnis terra', 'kind': 'glossary',
    'why': 'The replére (passive) row keeps the Latin\'s passive (*ser cheio*: 64:5b, 64:10b, 64:12). The stylist called *será cheia* a flat passive and asked the reflexive *se encherá* (MS1932 *encher-se-á*). Held for the row: the reflexive makes the earth fill itself, the passive says it is filled by another, as the Latin does. Option.',
    'options': [
        {'label': 'será cheia', 'forms': {'rep19': 'será cheia'}, 'note': 'Ruling; the replére row.', 'from': 'glossary'},
        {'label': 'se encherá', 'forms': {'rep19': 'se encherá'}, 'note': 'the stylist; MS1932.', 'from': 'stylist'},
    ]})
V['71:19'] = 'E bendito o nome da sua majestade para sempre: * e toda a terra {rep19} da sua majestade: assim seja, assim seja.'
dec['parcet']['why'] += ' **v2:** the stylist asked *necessitado* for *carente* (\'social-work vocabulary\'). Refused: D38 settles *inops → carente*, and *necessitado* is *egénus*\'s, reserved.'

d['audit'].extend([
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Four minors, no major; three taken, one held for a settled row. He named vellus, adorábunt de ipso, ante solem / ante lunam as Septuagintal readings kept.',
     'outcomes': [
         {'verse': '71:10', 'remark': 'addúcent → trarão (direction)', 'outcome': 'option', 'decision': 'adducent', 'reason': 'D42 addúcere → levar; trazer is afférre\'s; levar presentes a um rei is movement toward him.'},
         {'verse': '71:12', 'remark': 'adjútor is a person: quem o ajudasse', 'outcome': 'taken', 'decision': 'adjutor'},
         {'verse': '71:14', 'remark': 'honorábile adjective, not participle; future supplied', 'outcome': 'taken', 'decision': 'hon14', 'reason': 'The adjective taken (digno de honra); the future held — a copula needs a tense and the psalm is future (DRB).'},
         {'verse': '71:16', 'remark': 'sustento heard as food: esteio', 'outcome': 'taken', 'decision': 'firm'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Worst line 71:14, best 71:17. Ten remarks: six taken, four refused and kept as options.',
     'outcomes': [
         {'verse': '71:6', 'remark': 'velo bookish: a lã', 'outcome': 'taken', 'decision': 'vellus'},
         {'verse': '71:9', 'remark': 'etíopes proparoxytone at the mediant: reorder', 'outcome': 'taken'},
         {'verse': '71:10', 'remark': 'dádivas at the mediant: dons', 'outcome': 'option', 'decision': 'munera', 'reason': 'múnera row (dádivas), held at 44:13 against the same objection.'},
         {'verse': '71:12', 'remark': 'auxílio abstract: quem o ajudasse', 'outcome': 'taken', 'decision': 'adjutor'},
         {'verse': '71:13', 'remark': 'carente social-work: necessitado', 'outcome': 'refused', 'reason': 'D38 settles inops → carente; necessitado is egénus\'s.'},
         {'verse': '71:14', 'remark': 'deles … deles … dele clatter; as suas almas', 'outcome': 'taken'},
         {'verse': '71:15', 'remark': 'e sempre adorarão por ele', 'outcome': 'taken', 'decision': 'deipso'},
         {'verse': '71:16', 'remark': 'comma after na terra', 'outcome': 'taken'},
         {'verse': '71:16', 'remark': 'feno does not flower: erva', 'outcome': 'taken', 'decision': 'faenum'},
         {'verse': '71:19', 'remark': 'será cheia flat: se encherá', 'outcome': 'option', 'decision': 'replebitur', 'reason': 'replére row keeps the passive (Ps 64).'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context, Portuguese only. 33 readings; the likeliest hearing right almost everywhere; the unnamed subjects (king / God) are the Latin\'s own. Unknown: velo, Társis, Sabá, dádivas, usuras, feno, Líbano (names kept; dádivas and usuras kept for their rows).',
     'outcomes': [
         {'verse': '71:6', 'remark': 'velo unknown; heard véu / velho', 'outcome': 'taken', 'decision': 'vellus'},
         {'verse': '71:16', 'remark': 'sustento heard as food', 'outcome': 'taken', 'decision': 'firm'},
         {'verse': '71:16', 'remark': 'feno unknown / heard as dry hay', 'outcome': 'taken', 'decision': 'faenum'},
         {'verse': '71:15', 'remark': 'por ele adorarão heard first as adore him', 'outcome': 'refused', 'reason': 'The other readings (for him, through him) were heard too; de ipso is open, and the preposition is kept.'},
         {'verse': '71:18', 'remark': 'só ele faz maravilhas may be heard as only does wonders', 'outcome': 'refused', 'reason': 'likeliest hearing was right; the options stay in decision solus.'},
         {'verse': '71:2b', 'remark': 'em juízo heard as fairly / in court / sensibly', 'outcome': 'refused', 'reason': 'likeliest hearing right; 9:8b\'s ruling.'}]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 71:6 a lã; 71:9 subject first; 71:12 quem o auxiliasse; 71:14 as suas almas + digno de honra; 71:15 e sempre adorarão por ele; 71:16 esteio, comma, a erva. Refused as options: trarão, dons, se encherá; refused: necessitado. Script: revise_v2.py.'},
])

(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
