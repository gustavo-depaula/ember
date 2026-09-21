"""Stage one, draft 1 → draft 2 after the three blind readers (critic/v1.*.json).
python3.13 research/psalterium/ps017/revise_v2.py   (reads prayed.v1.json, writes prayed.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source='draft'):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def promote(decisionId, index, why=None):
    d = dec[decisionId]
    d['options'].insert(0, d['options'].pop(index))
    if why:
        d['why'] += ' ' + why


def setVerse(verseId, old, new):
    assert old in V[verseId], (verseId, old)
    V[verseId] = V[verseId].replace(old, new)


# 17:2 firmamentum: the blind reader heard "my sky" first, as the draft feared → esteio
promote('firmamentum', 1, 'Draft 2: the blind reader heard "meu firmamento" FIRST as "my sky" — the fault draft 1 named as the test. Option 1 (esteio) becomes the ruling.')
dec['firmamentum']['options'][0]['note'] = 'Ruling from draft 2: a concrete prop — a post that holds a thing up — and a living figure in Brazil (o esteio da família); keeps the image of support, which is the sense here. Loses the root firm- and the psalter\'s link with the sky (18:2, 150:1 will say firmamento). Proposed for 24:14 and 70:3, where God is again the firmaméntum.'
dec['firmamentum']['options'][1]['note'] = 'Draft 1: the Latin\'s word; the blind reader heard it first as "my sky" (critic/v1.ambiguity.json) — a wrong first hearing, which in choir is a fault.'

# 17:6 order (stylist) and 17:19
setVerse('17:6', '* {s6} os laços da morte.', '* os laços da morte {s6}.')
for o, (a, b) in zip(dec['praeoccupare']['options'], [('me surpreenderam', 'Surpreenderam-me'), ('se anteciparam a mim', 'Anteciparam-se a mim'), ('me apanharam', 'Atacaram-me')]):
    o['forms'] = {'s6': a, 's19': b}
dec['praeoccupare']['why'] += ' Draft 2: in 17:6 the subject comes first (the stylist: the enclisis after a long verb, then the subject, made the colon laborious) — order only; the Latinist\'s minor on 17:19 (prævenire is to come first, not to surprise) is refused, see audit.'

# 17:8 drop the supplied "ele"; fundaménta kept twice (stylist's alicerces refused → option)
setVerse('17:8', 'porque ele se irou contra eles', 'porque se irou contra eles')
setVerse('17:8', 'os fundamentos dos montes', 'os {f8} dos montes')
setVerse('17:16a', 'os fundamentos {orbis}', 'os {f16} {orbis}')
data['decisions'].append({
    'id': 'fundamenta', 'refs': ['17:8', '17:16a'], 'latin': 'fundaménta móntium (17:8) · fundaménta orbis terrárum (17:16a)', 'kind': 'word',
    'why': 'The Latin says fundaménta twice in the theophany (the mountains\' foundations shake; the world\'s foundations are laid bare), and the Greek has τὰ θεμέλια twice. The stylist, finding 17:8\'s second colon too long for one breath, proposed alicerces there.',
    'options': [opt('fundamentos, twice', {'f8': 'fundamentos', 'f16': 'fundamentos'}, 'Ruling: one word twice, as the Latin (rule 2). The breath is eased instead by dropping the supplied "ele" (the Latin leaves the subject in the verb).'),
                opt('alicerces / fundamentos', {'f8': 'alicerces', 'f16': 'fundamentos'}, 'The stylist\'s word in 17:8 (with "pois" for quóniam): shorter by nothing, and it breaks the repetition. Refused.', 'stylist'),
                opt('alicerces, twice', {'f8': 'alicerces', 'f16': 'alicerces'}, 'The plainer word in both places, keeping the repetition; fundamento is as current as alicerce, so the change buys nothing.')]})

# 17:10 a verb supplied (stylist)
for o, form in zip(dec['caligo']['options'], ['havia uma névoa escura', 'havia escuridão', 'havia caligem']):
    o['forms'] = {'caligo': form}
dec['caligo']['options'].insert(1, opt('uma névoa escura (no verb)', {'caligo': 'uma névoa escura'}, 'Draft 1: verbless, as the Latin. The stylist heard the colon as suspended "as if a word were missing" after the action verbs.'))
dec['caligo']['why'] += ' Draft 2: "havia" supplied (the stylist) — an existential verb Portuguese needs after a run of action verbs (D2: supplying a verb is grammar); the blind reader had heard the verbless colon rightly, so this is for the ear only.'

# 17:12 the stylist's "estava" refused — option
setVerse('17:12', '† ao seu redor a sua tenda:', '† {v12}:')
data['decisions'].append({
    'id': 'v12', 'refs': ['17:12'], 'latin': 'in circúitu ejus tabernáculum ejus', 'kind': 'ambiguity',
    'why': 'The Latin has no verb: "his tent round about him" is either in apposition to latíbulum (he made darkness his hiding-place, his tent round him — Douay-Rheims) or a nominal sentence of its own. The stylist asked for "estava"; the blind reader could not tell how the tent and the dark water are joined — the Latin\'s own looseness.',
    'options': [opt('ao seu redor a sua tenda', {'v12': 'ao seu redor a sua tenda'}, 'Ruling: verbless, so that the tent may still be the darkness (apposition) — a verb would decide it is a second thing.'),
                opt('ao seu redor estava a sua tenda', {'v12': 'ao seu redor estava a sua tenda'}, 'The stylist: the ear needs a verb. Refused because "estava" closes the apposition reading.', 'stylist')]})

# 17:13 worst line: "Diante do clarão da sua presença"
setVerse('17:13', 'Ao fulgor {c13} passaram as nuvens', '{prae} {c13} passaram as nuvens')
data['decisions'].append({
    'id': 'prae', 'refs': ['17:13'], 'latin': 'Præ fulgóre', 'kind': 'word',
    'why': 'The stylist\'s worst line: "Ao fulgor na sua presença passaram as nuvens" — two prepositional phrases before the verb with nothing to hold them. præ is "before, in front of" and, with a noun like this, "because of" (Douay-Rheims "At the brightness"); τηλαύγησις is a far-shining brightness. The blind reader did not know fulgor.',
    'options': [opt('Diante do clarão', {'prae': 'Diante do clarão'}, 'Ruling from draft 2: "Diante de" is both "before" and "in the face of" (cause), as præ is; clarão is the plain word for a flash of light (DM1962\'s word in this verse, "Um clarão"); the stylist\'s "Diante do" taken, fulgor (unknown to the blind reader) given up.', 'DM1962'),
                opt('Ao fulgor', {'prae': 'Ao fulgor'}, 'Draft 1: DRB\'s "At the brightness"; the stylist\'s worst line.'),
                opt('Diante do fulgor', {'prae': 'Diante do fulgor'}, 'The stylist\'s own line; fulgor was unknown to the blind reader.', 'stylist'),
                opt('Diante do resplendor', {'prae': 'Diante do resplendor'}, 'Matos Soares 1932 ("Diante do resplendor da sua presença"); a longer, more literary word.', 'MS1932')]})
c = dec['conspectu']
c['options'][0]['forms']['c13'] = 'da sua presença'
c['options'][0]['note'] += ' Draft 2: in 17:13 the phrase becomes a genitive, "o clarão da sua presença" (MS1932\'s build), so that the colon has one prepositional phrase before its verb, not two (the stylist).'
c['options'][1]['forms']['c13'] = 'à sua vista'
c['options'][2]['forms']['c13'] = 'diante dele'

# 17:15 dispersou (stylist; blind reader did not know dissipou)
promote('dissipavit', 1, 'Draft 2: the stylist heard "dissipar" people as translated and the blind reader listed "dissipou" as unknown → "dispersou", the Greek\'s sense (ἐσκόρπισεν). Cost: it meets dispérgere (88:11 dispersísti inimícos tuos, one Greek root διασκορπίζω with this verse\'s σκορπίζω); they never stand in one verse. The row dissipáre may keep "dissipar" where the object is a thing (118:126 dissiparam a vossa lei).')
dec['dissipavit']['options'][0]['from'] = 'stylist'

# 17:16a do mundo (stylist + blind reader)
promote('orbis', 1, 'Draft 2: the stylist ("livresca … exige decifração") and the blind reader (orbe unknown — as in Ps 9) → "do mundo". The Latin psalter never uses mundus for the world (grep: mundus is only "clean" — 18:13, 23:4, 50:4, 50:9, 50:12), so "mundo" collides with nothing. Proposed for the whole row (12 lines).')
dec['orbis']['options'][0]['from'] = 'stylist'

# 17:18 mais do que eu (stylist, with the Latin's verb kept)
dec['super']['options'][1]['forms'] = {'super': 'mais do que eu'}
promote('super', 1, 'Draft 2: the stylist heard "acima de mim" as a position in space; the comparison is the Latin\'s sense (ὑπέρ, "beyond"), so it is said as a comparison, with the Latin\'s verb (confortári → fortalecer-se) kept against the stylist\'s "se tornaram mais fortes".')
dec['super']['options'][0]['note'] = 'Ruling from draft 2: the verb kept, the comparison made audible (DRB "too strong for me", MS1932 "mais poderosos do que eu").'
setVerse('17:18', 'porque se fortaleceram {super}', 'porque {super}')
for o in dec['super']['options']:
    o['forms'] = {'super': 'se fortaleceram ' + o['forms']['super']}
dec['super']['options'].append(opt('se tornaram mais fortes do que eu', {'super': 'se tornaram mais fortes do que eu'}, 'The stylist\'s line — fíeri for confortári; the verb refused, the comparison taken.', 'stylist'))

# 17:22 Latinist major: separation
setVerse('17:22', '* e não agi como ímpio {impie}.', '* e não {impie}.')
old = dec['impie']['options']
dec['impie']['options'] = [
    opt('me apartei impiamente do meu Deus', {'impie': 'me apartei impiamente do meu Deus'}, 'Ruling from draft 2, on the Latinist\'s major: the calque ἠσέβησα ἀπό says departing from God in impiety, and "a Deo" is separation; the light verb gessi yields to that sense, as his fix does. "apartei", not his "afastei", so that 17:23 non répuli a me → "não afastei de mim" keeps its own verb (two Latin verbs, two Portuguese).', 'latinist'),
    opt('me afastei impiamente do meu Deus', {'impie': 'me afastei impiamente do meu Deus'}, 'The Latinist\'s exact fix; one verb with 17:23 afastei, which is répuli\'s.', 'latinist'),
    opt('agi como ímpio contra o meu Deus', {'impie': 'agi como ímpio contra o meu Deus'}, 'Draft 1: both Vulgate-family versions ("against"); the Latinist marked the lost separation major.', 'DRB'),
    opt('agi como ímpio, longe do meu Deus', {'impie': 'agi como ímpio, longe do meu Deus'}, 'Keeps both the acting and the separation; heard as "while far from God".')]
dec['impie']['why'] += ' The Latinist (draft 1, MAJOR): "contra" loses the separation. Taken.'

data['version'] = 2
data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'Stage one, draft 1 (17:2–17:25). Four verses: one major, taken (17:22, the separation in a Deo); three minors refused (17:3b auxiliador and 17:3c amparador under the glossary — D19 and D24; 17:19 the verb, under D15\'s test). Marks confirmed in all 27 verses. Passed without remark: esteio was not yet there — "o meu firmamento", "o chifre da minha salvação", "As dores do inferno", "surpreenderam-me" (17:6), "se perturbaram e se abalaram", "fez ouvir a sua voz", "À vossa repreensão", "me recolheu", "me fez sair para a amplidão", "porque me quis", "as suas justiças", "com ele", "me guardarei".',
     'outcomes': [
         {'verse': '17:3b', 'remark': 'adjútor = the one who helps; "o meu auxílio" is a defensible metonymy, less personal (minor) → "o meu auxiliador"', 'outcome': 'option', 'decision': 'adjutor', 'reason': 'The glossary (open) as held in Pss 9, 117 and 118 against the same request (D24): auxiliador is long and hardly said; the metonymy is the same as the settled suscéptor → amparo.'},
         {'verse': '17:3c', 'remark': 'suscéptor = the one who takes up; "o meu amparo" by metonymy (minor) → "o meu amparador"', 'outcome': 'refused', 'reason': 'D19 settles suscéptor → amparo; amparador is not current Portuguese.'},
         {'verse': '17:19', 'remark': 'prævenire is to come first, anticipate; "Surpreenderam-me" substitutes surprise (minor) → "Anteciparam-se a mim"', 'outcome': 'option', 'decision': 'praeoccupare', 'reason': 'The Greek has one verb (προέφθασαν) for 17:6 præoccupavérunt and 17:19 prævenérunt, so by D15\'s test one Portuguese verb may serve both; "surpreender" is L&S\'s "take, catch" for præoccupo and says the hostile coming-first; "anteciparam-se a mim" is stiff and is left to anticipáre (76:5). He passed the same verb in 17:6.'},
         {'verse': '17:22', 'remark': '"contra" loses the separation of a Deo meo: the phrase is not departing impiously from God (MAJOR) → "e não me afastei impiamente do meu Deus"', 'outcome': 'taken', 'decision': 'impie', 'reason': 'Right: the Latin calques ἠσέβησα ἀπό. Taken with "apartei" for his "afastei", so that répuli a me (17:23, afastei) keeps its own verb.'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'Stage one, draft 1. Eight verses; best 17:20, worst 17:13. "O salmo tem gravidade, imagens fortes e terminações adequadas ao canto … Os tropeços se concentram nas elipses e construções que ainda seguem de perto a sintaxe latina." Taken: 17:6 order, 17:10 havia, 17:13 Diante do, 17:15 dispersou, 17:16a do mundo, 17:18 the comparison. Refused: 17:8 alicerces / pois, 17:12 estava, the rest of 17:15, the verb of 17:18.',
     'outcomes': [
         {'verse': '17:6', 'remark': 'the enclisis after a long verb, then the subject, makes the second colon laborious → "os laços da morte me surpreenderam"', 'outcome': 'taken', 'decision': 'praeoccupare', 'reason': 'Order only (D2). The stressed vowels of cercaram / surpreenderam differ, so it is not a rhyme.'},
         {'verse': '17:8', 'remark': 'the second colon asks too much breath → "os alicerces dos montes … pois ele se irou contra eles"', 'outcome': 'option', 'decision': 'fundamenta', 'reason': 'alicerces breaks the Latin\'s repetition fundaménta (17:8, 17:16a); "pois" would give quóniam a second word in a psalm that has porque for it seven times. The breath is eased by dropping the supplied "ele" instead.'},
         {'verse': '17:10', 'remark': 'the verbless colon sounds suspended after the action verbs → "e havia uma névoa escura sob os seus pés"', 'outcome': 'taken', 'decision': 'caligo', 'reason': 'A verb supplied is grammar (D2).'},
         {'verse': '17:12', 'remark': 'two possessives and no verb make the listener rebuild the sentence → "ao seu redor estava a sua tenda"', 'outcome': 'option', 'decision': 'v12', 'reason': 'The verb would decide an ambiguity the Latin keeps: whether the tent is the darkness (apposition, DRB) or a second thing.'},
         {'verse': '17:13', 'remark': 'WORST LINE: two prepositional phrases before the verb; the sentence is slow to be understood → "Diante do fulgor na sua presença, passaram as nuvens"', 'outcome': 'taken', 'decision': 'prae', 'reason': 'Taken as "Diante do clarão da sua presença passaram as nuvens": his "Diante do", one prepositional phrase before the verb (in conspéctu as a genitive, MS1932\'s build), and "clarão" for fulgor, which the blind reader did not know.'},
         {'verse': '17:15', 'remark': '"dissipar" people sounds translated; -ou endings sing → "e os dispersou … e os deixou perturbados"', 'outcome': 'taken', 'decision': 'dissipavit', 'reason': '"dispersou" taken. "os deixou perturbados" refused: it turns the active verb into a state, and the -ou endings are the Latin\'s own (dissipávit eos / conturbávit eos).'},
         {'verse': '17:16a', 'remark': '"orbe da terra" is bookish → "os fundamentos do mundo"', 'outcome': 'taken', 'decision': 'orbis', 'reason': 'With the blind reader, who did not know orbe (nor did Ps 9\'s). The psalter never has mundus for the world, so mundo is free.'},
         {'verse': '17:18', 'remark': '"acima de mim" sounds spatial → "porque se tornaram mais fortes do que eu"', 'outcome': 'taken', 'decision': 'super', 'reason': 'The comparison taken ("se fortaleceram mais do que eu"); his verb refused (fíeri for confortári) and kept as an option of the same decision.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'Stage one, draft 1, Portuguese only. 31 items, 5 unknown words (torrentes, iniquidade ×2, fulgor, dissipou, orbe). One real fault: 17:2 "meu firmamento" heard first as "my sky" — mended (esteio). Two unknown words replaced (fulgor → clarão, orbe → mundo; dissipou → dispersou with the stylist). The rest are the Latin\'s own openness heard as the Latin is read: who lit the coals (17:9 por ele), whom he was angry with (17:8 eles), how the tent and the water are joined (17:12), whether the hail "passed" with the clouds (17:13), what was sent (17:17).',
     'outcomes': [
         {'verse': '17:2', 'remark': '"meu firmamento" likely heard as "my sky"', 'outcome': 'taken', 'decision': 'firmamentum', 'reason': 'The wrong first hearing draft 1 set out to test → "o meu esteio".'},
         {'verse': '17:3c', 'remark': '"o chifre da minha salvação" heard as a concrete horn, its link with salvation unclear', 'outcome': 'refused', 'decision': 'cornu', 'reason': 'The Latin\'s image (rule 5); it was not misheard, only not explained — and the psalm does not explain it.'},
         {'verse': '17:6', 'remark': '"as dores do inferno" heard as the torments of the damned', 'outcome': 'refused', 'decision': 'inferni', 'reason': 'Held for Gustavo under D22 (inférnus → inferno), with the realm-of-the-dead reading noted; the parallel with death in the same verse leads the ear back.'},
         {'verse': '17:8', 'remark': '"ele se irou contra eles": against the mountains, or the enemies', 'outcome': 'refused', 'reason': 'The Latin\'s eis is as open; the nearest referent (the mountains) is the Latin\'s too.'},
         {'verse': '17:9', 'remark': '"por ele": by the fire or by God', 'outcome': 'refused', 'reason': 'The Latin\'s ab eo is open in the same way (DRB "by it").'},
         {'verse': '17:12', 'remark': 'how "a sua tenda" and "água tenebrosa" are joined is unclear', 'outcome': 'refused', 'decision': 'v12', 'reason': 'The Latin strings three nominal members without verbs; the Portuguese keeps it.'},
         {'verse': '17:13', 'remark': 'the clouds, the hail and the coals all "passed"', 'outcome': 'refused', 'reason': 'That is a possible reading of the Latin too (grando et carbónes in apposition to nubes).'},
         {'verse': '17:15', 'remark': '"os perturbou" could point back to the lightnings; whom "os dispersou" means is not named', 'outcome': 'refused', 'reason': 'Latin eos cannot be the neuter fúlgura, Portuguese "os" can; but the reader himself heard the enemies first, and the parallel "os dispersou … os perturbou" carries it.'},
         {'verse': '17:16b', 'remark': '"o sopro do espírito da vossa ira": possibly heard as the Holy Spirit', 'outcome': 'refused', 'reason': 'spíritus is the Latin\'s noun (breath and spirit at once); rule 2 keeps it.'},
         {'verse': '17:17', 'remark': '"Enviou do alto": what was sent is not heard', 'outcome': 'refused', 'reason': 'The Latin names no object (MS1932 supplies "a sua mão"); kept open.'},
         {'verse': '17:24', 'remark': '"imaculado com ele" heard as "pure by being with God"', 'outcome': 'refused', 'decision': 'cumeo', 'reason': 'cum eo is kept for the stanza that follows (17:26–27 Cum sancto … cum viro …); the reading heard is inside the Latin\'s range.'},
         {'verse': '17:13', 'remark': 'unknown word: fulgor', 'outcome': 'taken', 'decision': 'prae', 'reason': '→ clarão (DM1962).'},
         {'verse': '17:15', 'remark': 'unknown word: dissipou', 'outcome': 'taken', 'decision': 'dissipavit', 'reason': '→ dispersou.'},
         {'verse': '17:16a', 'remark': 'unknown word: orbe', 'outcome': 'taken', 'decision': 'orbis', 'reason': '→ mundo.'},
         {'verse': '17:5', 'remark': 'unknown words: torrentes, iniquidade (also 17:24)', 'outcome': 'refused', 'reason': 'torrentes is the Latin\'s image; iniquidade is the glossary word (iníquitas), already listed as unknown elsewhere and kept.'}]},
    {'step': 'revision', 'version': 2, 'note': 'Stage one, draft 2 (revise_v2.py; draft 1 kept as prayed.v1.json). 17:2 "o Senhor é o meu esteio" (blind reader); 17:6 "os laços da morte me surpreenderam" (stylist, order); 17:8 "porque se irou contra eles" (supplied "ele" dropped for breath; new decision fundamenta); 17:10 "e havia uma névoa escura" (stylist); 17:12 unchanged, new decision v12; 17:13 "Diante do clarão da sua presença passaram as nuvens" (stylist\'s worst line; new decision prae); 17:15 "e os dispersou"; 17:16a "os fundamentos do mundo"; 17:18 "porque se fortaleceram mais do que eu"; 17:22 "e não me apartei impiamente do meu Deus" (Latinist major).'},
]
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft', data['version'], len(data['decisions']), 'decisions')
