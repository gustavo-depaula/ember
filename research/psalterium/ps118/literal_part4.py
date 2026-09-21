"""Append the literal (tier 2) scaffold of 118:129–118:176 (Phe–Tau, the last six octaves) to literal.json.
Run once from the repo root:   python3.13 research/psalterium/ps118/literal_part4.py
(literal.v12.json is the kept copy of the file as the 81–128 agent left it.)
Cognates on purpose (justificações, elóquio, mandados are NOT the prayed words); the Latin's order is kept
where Portuguese can bear it. With these verses the psalm is whole, so "range" becomes 118:1–118:176."""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'literal.json'
data = json.loads(path.read_text(encoding='utf-8'))
if not (here / 'literal.v12.json').exists():
    sys.exit('literal.v12.json is missing — copy literal.json to it first')

verses = {
    '118:129': 'Maravilhosos os vossos testemunhos: * por isso os perscrutou a minha alma.',
    '118:130': 'A declaração das vossas falas ilumina: * e dá entendimento aos pequeninos.',
    '118:131': 'A minha boca abri, e atraí o espírito: * porque os vossos mandados eu desejava.',
    '118:132': 'Olhai para mim, e tende piedade de mim, * segundo o juízo dos que amam o vosso nome.',
    '118:133': 'Os meus passos dirigi segundo o vosso elóquio: * e não me domine toda injustiça.',
    '118:134': 'Redimi-me das calúnias dos homens: * para que eu guarde os vossos mandados.',
    '118:135': 'A vossa face iluminai sobre o vosso servo: * e ensinai-me as vossas justificações.',
    '118:136': 'Saídas de águas fizeram descer os meus olhos: * porque não guardaram a vossa lei.',
    '118:137': 'Justo sois, Senhor: * e reto o vosso juízo.',
    '118:138': 'Mandastes a justiça, os vossos testemunhos: * e a vossa verdade, em demasia.',
    '118:139': 'Definhar me fez o meu zelo: * porque esqueceram as vossas palavras os meus inimigos.',
    '118:140': 'Ígneo é o vosso elóquio, veementemente: * e o vosso servo o amou.',
    '118:141': 'Muito jovem sou eu e desprezado: * as vossas justificações não esqueci.',
    '118:142': 'A vossa justiça, justiça eternamente: * e a vossa lei, verdade.',
    '118:143': 'A tribulação e a angústia me encontraram: * os vossos mandados são a minha meditação.',
    '118:144': 'Equidade os vossos testemunhos eternamente: * entendimento dai-me, e viverei.',
    '118:145': 'Clamei de todo o meu coração, escutai-me, Senhor: * as vossas justificações requererei.',
    '118:146': 'Clamei a vós, fazei-me salvo: * para que eu guarde os vossos mandados.',
    '118:147': 'Vim antes, na hora precoce, e clamei: * porque nas vossas palavras sobre-esperei.',
    '118:148': 'Vieram antes os meus olhos para vós ao romper do dia: * para que eu meditasse os vossos elóquios.',
    '118:149': 'A minha voz ouvi segundo a vossa misericórdia, Senhor: * e segundo o vosso juízo vivificai-me.',
    '118:150': 'Aproximaram-se os que me perseguem da iniquidade: * mas da vossa lei se fizeram longe.',
    '118:151': 'Perto estais vós, Senhor: * e todos os vossos caminhos, verdade.',
    '118:152': 'No início conheci dos vossos testemunhos: * que eternamente os fundastes.',
    '118:153': 'Vede a minha humilhação, e arrancai-me: * porque a vossa lei não esqueci.',
    '118:154': 'Julgai o meu juízo, e redimi-me: * por causa do vosso elóquio vivificai-me.',
    '118:155': 'Longe dos pecadores a salvação: * porque as vossas justificações não procuraram com afinco.',
    '118:156': 'As vossas misericórdias são muitas, Senhor: * segundo o vosso juízo vivificai-me.',
    '118:157': 'Muitos os que me perseguem, e me atribulam: * dos vossos testemunhos não me apartei.',
    '118:158': 'Vi os prevaricadores, e definhava: * porque os vossos elóquios não guardaram.',
    '118:159': 'Vede que os vossos mandados amei, Senhor: * na vossa misericórdia vivificai-me.',
    '118:160': 'O princípio das vossas palavras, verdade: * eternamente todos os juízos da vossa justiça.',
    '118:161': 'Os príncipes me perseguiram gratuitamente: * e das vossas palavras teve pavor o meu coração.',
    '118:162': 'Alegrar-me-ei eu sobre os vossos elóquios: * como quem encontrou muitos despojos.',
    '118:163': 'À iniquidade tive ódio, e abominei: * mas a vossa lei amei.',
    '118:164': 'Sete vezes no dia vos disse louvor, * sobre os juízos da vossa justiça.',
    '118:165': 'Muita paz aos que amam a vossa lei: * e não há para eles escândalo.',
    '118:166': 'Eu aguardava o vosso salutar, Senhor: * e os vossos mandados amei.',
    '118:167': 'Guardou a minha alma os vossos testemunhos: * e os amou veementemente.',
    '118:168': 'Observei os vossos mandados, e os vossos testemunhos: * porque todos os meus caminhos estão à vossa vista.',
    '118:169': 'Aproxime-se a minha deprecação à vossa vista, Senhor: * junto ao vosso elóquio dai-me entendimento.',
    '118:170': 'Entre a minha postulação à vossa vista: * segundo o vosso elóquio arrancai-me.',
    '118:171': 'Os meus lábios arrotarão um hino, * quando me tiverdes ensinado as vossas justificações.',
    '118:172': 'A minha língua pronunciará o vosso elóquio: * porque todos os vossos mandados são equidade.',
    '118:173': 'Faça-se a vossa mão para que me salve: * porque os vossos mandados escolhi.',
    '118:174': 'Cobicei o vosso salutar, Senhor: * e a vossa lei é a minha meditação.',
    '118:175': 'Viverá a minha alma, e vos louvará: * e os vossos juízos me ajudarão.',
    '118:176': 'Errei, como ovelha que pereceu: * buscai o vosso servo, porque os vossos mandados não esqueci.',
}
overlap = set(verses) & set(data['verses'])
if overlap:
    sys.exit(f'already present: {sorted(overlap)}')
data['verses'].update(verses)
data['range'] = '118:1–118:176'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('literal.json:', len(data['verses']), 'verses; range', data['range'])
