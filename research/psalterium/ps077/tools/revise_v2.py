"""Apply the v2 revision of Ps 77 to prayed.json (run once, from anywhere)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
V = d['verses']
D = {x['id']: x for x in d['decisions']}


def front(did, forms, label, note, frm, why_add=None):
    dec = D[did]
    opts = dec['options']
    hit = [o for o in opts if o['forms'] == forms]
    if hit:
        o = hit[0]
        opts.remove(o)
        o['note'] = note
        o['from'] = frm
    else:
        o = {'label': label, 'forms': forms, 'note': note, 'from': frm}
    opts.insert(0, o)
    if why_add:
        dec['why'] += ' ' + why_add


def add_opt(did, forms, label, note, frm):
    D[did]['options'].append({'label': label, 'forms': forms, 'note': note, 'from': frm})


# 77:5b — stylist: *dar a conhecer*
V['77:5b'] = '{quanta5} mandou aos nossos pais que dessem a conhecer aos seus filhos: * para que a outra geração as conheça.'
# 77:6 — stylist: rhyme -arão / -arão
front('nascentur', {'nascentur': 'que hão de nascer, e se hão de levantar'}, 'que hão de nascer, e se hão de levantar',
      'v2 (stylist): both verbs of the relative in one build, and the -arão / -arão rhyme at the mediant gone.', 'stylist',
      'v2: the stylist heard *levantarão* rhyme with *narrarão* across the mediant and the mixed builds as uneven; the slot now takes the two relative verbs together.')
for o in D['nascentur']['options'][1:]:
    o['forms'] = {'nascentur': o['forms']['nascentur'] + ', e se levantarão'}
    o['label'] = o['forms']['nascentur']
V['77:6'] = 'Os filhos {nascentur}, * e narrarão aos seus filhos.'
# 77:17 — Latinist: God the object
front('excitaverunt', {'excitaverunt': 'despertaram o Excelso para a ira'}, 'despertaram o Excelso para a ira',
      'v2 (Latinist, minor): the Latin\'s build, God the object; the verb kept for the echo with 77:65.', 'latinist',
      'v2: the Latinist asked that the Most High be the object, as 77:40 and 77:58 keep it; his *incitaram à ira* is concitáre\'s, so the Latin build is taken with *despertar*.')
add_opt('excitaverunt', {'excitaverunt': 'incitaram à ira o Excelso'}, 'incitaram à ira o Excelso',
        'The Latinist\'s fix; merges excitáre with concitáre (77:40, 58) and loses the echo with 77:65.', 'latinist')
# 77:18 — stylist
V['77:18'] = 'E tentaram a Deus nos seus corações, * pedindo comida para as suas almas.'
# 77:20 — ambiguity: Porque / por que
front('quoniam20', {'quoniam20': 'Visto que feriu'}, 'Visto que feriu',
      'v2 (ambiguity): *Porque* is heard as *Por que* (a question) in speech; *Visto que* is the premise.', 'ambiguity')
# 77:24 — stylist
V['77:24'] = 'E fez chover-lhes o maná para comerem, * e deu-lhes o pão do céu.'
# 77:26 — stylist
front('transtulit', {'transtulit': 'Fez passar'}, 'Fez passar',
      'v2 (stylist): the wind sent across the sky (ἀπῆρεν); D15 allows a word apart from 45:3\'s *transportar*, whose Greek differs.', 'stylist',
      'v2: the stylist heard *Transportou* as freight; the Greek being other than 45:3\'s, D15 lets the verb differ.')
# 77:29 — stylist's worst line
V['77:29'] = 'E comeram, e saciaram-se muito, e ele lhes trouxe o seu desejo: * não foram privados do seu desejo.'
# 77:31 — stylist + ambiguity: comic *gordos*
front('pinguis', {'pinguis': 'os mais robustos'}, 'os mais robustos',
      'v2 (stylist, ambiguity): *os gordos* heard as literally fat people, comic.', 'stylist',
      'v2: both the stylist and the ambiguity reader heard *os gordos* as literally fat and comic; the Latin\'s image is the well-fed strong. The glossary row (open) is noted.')
# 77:34 — stylist: dactylic mediant
V['77:34'] = 'Quando os matava, eles o buscavam, * e voltavam, e ao amanhecer vinham a ele.'
# 77:38b — Latinist: Latin's abundance
front('abundavit', {'abundavit': 'E foi abundante em desviar'}, 'E foi abundante em desviar',
      'v2 (Latinist, minor): the Latin\'s abundance (πληθυνεῖ) kept; *muitas vezes* is DRB\'s Hebrew reading.', 'latinist')
# 77:42 — stylist
V['77:42'] = 'Não se lembraram da sua mão, * no dia em que os resgatou da mão de quem atribula.'
# 77:46, 51 — ambiguity: *fadigas* heard as tiredness
front('labores', {'labores46': 'os seus trabalhos', 'labores51': 'todo o seu trabalho'}, 'os seus trabalhos … todo o seu trabalho',
      'v2 (ambiguity): *fadiga* heard as tiredness; *trabalho* is also what work produced.', 'ambiguity',
      'v2: the ambiguity reader heard *as suas fadigas ao gafanhoto* as tiredness given to the locust; the product of toil is the sense.')
# 77:48 — Latinist + stylist
V['77:48'] = 'E entregou ao granizo os animais deles, * e {possessio} ao fogo.'
d['decisions'].append({
    'id': 'possessio', 'refs': ['77:48'], 'latin': 'et possessiónem eórum igni', 'kind': 'glossary',
    'why': 'The glossary pairs posséssio → posse (row 221), but both the Latinist and the stylist heard *posse* as the right of owning, not the things owned (ὕπαρξιν, goods, cattle). The Latinist\'s *possessão* is demonic possession in Brazil. v2 takes the stylist\'s *os seus bens*.',
    'options': [
        {'label': 'os seus bens', 'forms': {'possessio': 'os seus bens'}, 'note': 'v2 (stylist): the things owned.', 'from': 'stylist'},
        {'label': 'a sua posse', 'forms': {'possessio': 'a sua posse'}, 'note': 'v1: the glossary word; heard as ownership.', 'from': 'glossary'},
        {'label': 'a sua possessão', 'forms': {'possessio': 'a sua possessão'}, 'note': 'The Latinist\'s fix; *possessão* is heard as demonic possession.', 'from': 'latinist'},
    ]})
# 77:54b — ambiguity: *por sorte* = luck
V['77:54b'] = 'E expulsou de diante deles as nações, * e repartiu-lhes a terra por sorteio, com a corda da distribuição.'
# 77:57 — Latinist (subject) + stylist (converter-se = religious conversion)
V['77:57'] = 'E desviaram-se, e não observaram o pacto: * assim como os pais deles {conversi} num arco torto.'
d['decisions'].append({
    'id': 'conversi', 'refs': ['77:57'], 'latin': 'quemádmodum patres eórum convérsi sunt in arcum pravum', 'kind': 'grammar',
    'why': 'The Latinist (minor): in the Latin *patres eórum* is the subject of *convérsi sunt* inside the *quemádmodum* clause; v1\'s comma made the present generation the subject. The stylist and the ambiguity reader heard *converteram-se* as religious conversion first, which jars with a crooked bow. v2 drops the comma and uses *tornar-se*; convértere in → converter em (glossary) stays at 77:44.',
    'options': [
        {'label': 'se tornaram', 'forms': {'conversi': 'se tornaram'}, 'note': 'v2: the Latin\'s subject; *tornar-se* for the change of state.', 'from': 'stylist'},
        {'label': 'se converteram', 'forms': {'conversi': 'se converteram'}, 'note': 'The glossary\'s verb, with the Latinist\'s grammar; heard as conversion.', 'from': 'latinist'},
        {'label': ', converteram-se', 'forms': {'conversi': ', converteram-se'}, 'note': 'v1: the comma makes the sons the subject.', 'from': 'draft'},
    ]})
d['choices']['77:57'] = d['choices']['77:57'].replace('*convértere in* → *converter em*; ', '')
# 77:59 — stylist
front('valde', {'valde': 'reduziu Israel a nada, sobremaneira'}, 'reduziu Israel a nada, sobremaneira',
      'v2 (stylist): *muito* before the verb heard as broken; *sobremaneira* carries *valde* at the close.', 'stylist')
# 77:65 — stylist + ambiguity
V['77:65'] = 'E o Senhor despertou como quem dormia, * como {potens} {crapulatus}.'
# 77:70 — ambiguity: *das que* has no audible noun
front('foetantes', {'foetantes': 'das ovelhas que davam cria'}, 'das ovelhas que davam cria',
      'v2 (ambiguity): *das que* had no audible noun; *ovelhas* repeated from the first colon.', 'ambiguity')

d['version'] = 2
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
