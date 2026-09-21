"""Append the literal (tier 2) scaffold of 118:81–118:128 to literal.json. Run once from the repo root:
python3.13 research/psalterium/ps118/literal_part3.py
(literal.v6.json is the kept copy of the file as the 33–80 agent left it.)
Cognates on purpose (justificações, elóquio, mandados are NOT the prayed words)."""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'literal.json'
data = json.loads(path.read_text(encoding='utf-8'))

verses = {
    '118:81': 'Desfaleceu para o vosso salutar a minha alma: * e na vossa palavra sobre-esperei.',
    '118:82': 'Desfaleceram os meus olhos para o vosso elóquio, * dizendo: Quando me consolareis?',
    '118:83': 'Porque fui feito como um odre na geada: * as vossas justificações não esqueci.',
    '118:84': 'Quantos são os dias do vosso servo? * quando fareis dos que me perseguem juízo?',
    '118:85': 'Narraram-me os iníquos fabulações: * mas não como a vossa lei.',
    '118:86': 'Todos os vossos mandados, verdade: * iniquamente me perseguiram, ajudai-me.',
    '118:87': 'Por pouco não me consumaram na terra: * eu, porém, não abandonei os vossos mandados.',
    '118:88': 'Segundo a vossa misericórdia vivificai-me: * e guardarei os testemunhos da vossa boca.',
    '118:89': 'Eternamente, Senhor, * a vossa palavra permanece no céu.',
    '118:90': 'Para geração e geração a vossa verdade: * fundastes a terra, e permanece.',
    '118:91': 'Pela vossa ordenação persevera o dia: * porque todas as coisas vos servem.',
    '118:92': 'Não fosse que a vossa lei é a minha meditação: * então talvez eu tivesse perecido na minha humilhação.',
    '118:93': 'Eternamente não esquecerei as vossas justificações: * porque nelas me vivificastes.',
    '118:94': 'Vosso sou eu, fazei-me salvo: * porque as vossas justificações procurei com afinco.',
    '118:95': 'A mim me aguardaram os pecadores para me perderem: * os vossos testemunhos entendi.',
    '118:96': 'De toda consumação vi o fim: * largo é o vosso mandado, em demasia.',
    '118:97': 'Como amei a vossa lei, Senhor? * todo o dia é a minha meditação.',
    '118:98': 'Acima dos meus inimigos me fizestes prudente pelo vosso mandado: * porque eternamente é meu.',
    '118:99': 'Acima de todos os que me ensinam entendi: * porque os vossos testemunhos são a minha meditação.',
    '118:100': 'Acima dos velhos entendi: * porque os vossos mandados busquei.',
    '118:101': 'De todo caminho mau proibi os meus pés: * para guardar as vossas palavras.',
    '118:102': 'Dos vossos juízos não declinei: * porque vós me pusestes lei.',
    '118:103': 'Quão doces à minha garganta os vossos elóquios, * acima do mel para a minha boca!',
    '118:104': 'A partir dos vossos mandados entendi: * por isso odiei todo caminho de iniquidade.',
    '118:105': 'Lucerna para os meus pés a vossa palavra, * e luz para as minhas veredas.',
    '118:106': 'Jurei, e estatuí * guardar os juízos da vossa justiça.',
    '118:107': 'Fui humilhado até o extremo, Senhor: * vivificai-me segundo a vossa palavra.',
    '118:108': 'As coisas voluntárias da minha boca fazei beneplácitas, Senhor: * e os vossos juízos ensinai-me.',
    '118:109': 'A minha alma nas minhas mãos sempre: * e a vossa lei não esqueci.',
    '118:110': 'Puseram os pecadores um laço para mim: * e dos vossos mandados não errei.',
    '118:111': 'Por herança adquiri os vossos testemunhos eternamente: * porque são a exultação do meu coração.',
    '118:112': 'Inclinei o meu coração a fazer as vossas justificações eternamente, * por causa da retribuição.',
    '118:113': 'Aos iníquos tive ódio: * e a vossa lei amei.',
    '118:114': 'Ajudador e amparador meu sois vós: * e na vossa palavra sobre-esperei.',
    '118:115': 'Declinai de mim, malignos: * e perscrutarei os mandados do meu Deus.',
    '118:116': 'Amparai-me segundo o vosso elóquio, e viverei: * e não me confundais a partir da minha expectação.',
    '118:117': 'Ajudai-me, e serei salvo: * e meditarei nas vossas justificações sempre.',
    '118:118': 'Desprezastes todos os que se retiram dos vossos juízos: * porque injusto é o pensamento deles.',
    '118:119': 'Prevaricadores reputei todos os pecadores da terra: * por isso amei os vossos testemunhos.',
    '118:120': 'Transfixai com o vosso temor as minhas carnes: * pois dos vossos juízos temi.',
    '118:121': 'Fiz juízo e justiça: * não me entregueis aos que me caluniam.',
    '118:122': 'Amparai o vosso servo para o bem: * não me caluniem os soberbos.',
    '118:123': 'Os meus olhos desfaleceram para o vosso salutar: * e para o elóquio da vossa justiça.',
    '118:124': 'Fazei com o vosso servo segundo a vossa misericórdia: * e as vossas justificações ensinai-me.',
    '118:125': 'Vosso servo sou eu: * dai-me intelecto, para que eu saiba os vossos testemunhos.',
    '118:126': 'Tempo de fazer, Senhor: * dissiparam a vossa lei.',
    '118:127': 'Por isso amei os vossos mandados, * acima do ouro e do topázio.',
    '118:128': 'Por causa disso a todos os vossos mandados eu era dirigido: * todo caminho iníquo tive em ódio.',
}

overlap = set(verses) & set(data['verses'])
if overlap:
    sys.exit(f'already present: {sorted(overlap)}')
data['range'] = '118:1–118:128'
data['note'] = data['note'].replace('stanzas Aleph–Jod (118:1–80); later agents append 118:81 onward', 'stanzas Aleph–Ain (118:1–128); the last agent appends 118:129 onward')
data['verses'].update(verses)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(data['verses']), 'verses in literal.json;', data['range'], '|', data['note'])
