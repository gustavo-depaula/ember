"""Apply the v2 revision of Ps 43 to prayed.json (one-off)."""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
v = data['verses']
data['version'] = 2

v['43:3'] = 'A vossa mão exterminou as nações, e vós os plantastes: * afligistes os povos, e os expulsastes.'
v['43:4'] = 'Pois não possuíram a terra com a própria espada, * e o braço deles não os salvou:'
v['43:6'] = 'Em vós, com o chifre, {ventilabimus} os nossos inimigos: * e no vosso nome desprezaremos os que se levantam contra nós.'
v['43:17'] = 'à voz do que me afronta e {obloquentis}: * diante do inimigo e do que me persegue.'
v['43:22b'] = 'Porque por vossa causa somos {mortificamur} o dia todo: * fomos tidos como ovelhas de matança.'
v['43:25'] = 'Pois a nossa alma está humilhada no pó: * o nosso ventre está {conglutinatus} à terra.'

dec = {d['id']: d for d in data['decisions']}


def lead(did, label, forms, note, source, why_add=None):
    d = dec[did]
    rest = [o for o in d['options'] if o['label'] != label]
    for o in rest:
        if o['note'].startswith('Ruling'):
            o['note'] = 'draft 1. ' + o['note'].removeprefix('Ruling').lstrip(':;. ')
    d['options'] = [{'label': label, 'forms': forms, 'note': note, 'from': source}] + rest
    if why_add:
        d['why'] += ' ' + why_add


lead('virtutibus', 'as nossas forças', {'virtutibus': 'as nossas forças'},
     'Ruling (v2): the Latinist and the stylist; *forças* is both strength and troops in Portuguese, as virtútes is.', 'critic',
     '**v2:** the test failed — the blind reader heard *poderes* as abstract, and the Latinist and the stylist both asked *forças* independently. Taken: the plural *forças* carries strength and armed forces at once, as the Latin plural does, without deciding for *exércitos*. Cost: *fortitúdo → força* (17:2) is the singular of the same word; the singular *virtus* (→ *poder*) and *Dóminus virtútum* (→ *Senhor dos poderes*) are untouched. 59:12b and 107:12b should copy *com as nossas forças*.')
lead('post', 'após os', {'post': 'após os'},
     'Ruling (v2): the Latinist; *post* is *após*, and the Latin\'s openness (behind them, after them) is kept.', 'critic',
     '**v2:** the Latinist (minor) held *diante* to be the Greek bent against the Latin preposition (rule 1: the Latin governs). His *atrás dos* stacks *para trás, atrás*; *após* is the exact word for *post* and does not repeat *trás*.')
dec['post']['options'] = [o for o in dec['post']['options'] if o['label'] != 'atrás dos'] + [
    {'label': 'atrás dos', 'forms': {'post': 'atrás dos'}, 'note': 'the Latinist\'s fix; *para trás, atrás* stacks.', 'from': 'critic'}]
lead('similitudinem', 'um termo de comparação', {'similitudinem': 'um termo de comparação'},
     'Ruling (v2): the stylist; the idiom for what things are compared to.', 'critic',
     '**v2:** the stylist found *fazer de nós uma comparação* unidiomatic; *termo de comparação* is the Portuguese phrase and keeps the Latin noun. The ambiguity reader heard it as an example, not a byword — the mocking is carried by 43:15b.')
lead('commotionem', 'um abanar de cabeça', {'commotionem': 'um abanar de cabeça'},
     'Ruling (v2): *abanar a cabeça* is the Brazilian gesture of shaking the head; *meneio* was unknown to the blind reader.', 'critic',
     '**v2:** the blind reader listed *meneio* as unknown and heard the gesture unclearly; *abanar a cabeça* is the everyday phrase for the sideways shake, not a nod.')
dec['obloquentis']['options'][0]['forms'] = {'obloquentis': 'do que me insulta'}
dec['obloquentis']['options'][0]['label'] = 'do que me insulta'
for o in dec['obloquentis']['options'][1:]:
    o['forms'] = {'obloquentis': 'do que ' + o['forms']['obloquentis'] if not o['forms']['obloquentis'].startswith('fala') else 'do que fala contra mim'}
dec['obloquentis']['why'] += ' **v2:** the Latinist (minor) found the two participles fused into one person while 43:17b keeps two; the article is now repeated (*do que me afronta e do que me insulta*), parallel to *do inimigo e do que me persegue*. His other point, dropping the supplied *me* in all four, is held: *afrontar* and *perseguir* want an object in Portuguese and the psalm is in the first person (grammar, D2); *do que persegue* hangs.'
dec['mortificamur']['why'] += ' **v2:** the stylist asked the first colon in one breath; the commas are dropped (*Porque por vossa causa*). æstimári → *ter por*: *fomos tidos como* (stylist; *considerados* was bureaucratic to him), and *ovelhas de matança* keeps the Latin genitive (*oves occisiónis*).'
dec['ventilabimus']['why'] += ' **v2:** the stylist (worst line) found *com o chifre* trailing after the object; the instrument moved forward (order yields, D2), and the colon ends on *inimigos*.'

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
