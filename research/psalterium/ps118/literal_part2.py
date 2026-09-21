"""Append the literal (tier 2) scaffold of 118:33–118:80 to literal.json. Run once from the repo root:
python3.13 research/psalterium/ps118/literal_part2.py
Cognates on purpose (justificações, elóquio, sermões are NOT the prayed words)."""

import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'literal.json'
data = json.loads(path.read_text(encoding='utf-8'))

verses = {
    '118:33': 'Por lei ponde-me, Senhor, o caminho das vossas justificações: * e o procurarei com afinco sempre.',
    '118:34': 'Dai-me intelecto, e perscrutarei a vossa lei: * e a guardarei em todo o meu coração.',
    '118:35': 'Conduzi-me para a vereda dos vossos mandados: * porque a ela mesma eu quis.',
    '118:36': 'Inclinai o meu coração para os vossos testemunhos: * e não para a avareza.',
    '118:37': 'Desviai os meus olhos para que não vejam a vaidade: * no vosso caminho vivificai-me.',
    '118:38': 'Estatuí para o vosso servo o vosso elóquio, * no vosso temor.',
    '118:39': 'Amputai o meu opróbrio, de que suspeitei: * porque os vossos juízos são jucundos.',
    '118:40': 'Eis que cobicei os vossos mandados: * na vossa equidade vivificai-me.',
    '118:41': 'E venha sobre mim a vossa misericórdia, Senhor: * o vosso salutar segundo o vosso elóquio.',
    '118:42': 'E responderei aos que me lançam em rosto uma palavra: * porque esperei nos vossos sermões.',
    '118:43': 'E não tireis da minha boca a palavra da verdade até o extremo: * porque nos vossos juízos sobre-esperei.',
    '118:44': 'E guardarei a vossa lei sempre: * pelo século e pelo século do século.',
    '118:45': 'E eu andava na largura: * porque os vossos mandados procurei com afinco.',
    '118:46': 'E eu falava nos vossos testemunhos à vista dos reis: * e não era confundido.',
    '118:47': 'E eu meditava nos vossos mandados, * que amei.',
    '118:48': 'E levantei as minhas mãos para os vossos mandados, que amei: * e me exercitava nas vossas justificações.',
    '118:49': 'Sede lembrado da vossa palavra ao vosso servo, * na qual me destes esperança.',
    '118:50': 'Esta me consolou na minha humilhação: * porque o vosso elóquio me vivificou.',
    '118:51': 'Os soberbos agiam iniquamente até o extremo: * mas da vossa lei não declinei.',
    '118:52': 'Fui lembrado dos vossos juízos desde o século, Senhor: * e fui consolado.',
    '118:53': 'Um desfalecimento me segurou, * por causa dos pecadores que abandonam a vossa lei.',
    '118:54': 'Cantáveis eram para mim as vossas justificações, * no lugar da minha peregrinação.',
    '118:55': 'Fui lembrado, de noite, do vosso nome, Senhor: * e guardei a vossa lei.',
    '118:56': 'Esta se fez para mim: * porque as vossas justificações procurei com afinco.',
    '118:57': 'A minha porção, Senhor, * eu disse: guardar a vossa lei.',
    '118:58': 'Supliquei a vossa face em todo o meu coração: * tende piedade de mim segundo o vosso elóquio.',
    '118:59': 'Pensei os meus caminhos: * e voltei os meus pés para os vossos testemunhos.',
    '118:60': 'Estou preparado, e não fui perturbado: * para que eu guarde os vossos mandados.',
    '118:61': 'As cordas dos pecadores me abraçaram em volta: * e a vossa lei não esqueci.',
    '118:62': 'À meia-noite eu me levantava para vos confessar, * sobre os juízos da vossa justificação.',
    '118:63': 'Participante sou eu de todos os que vos temem: * e dos que guardam os vossos mandados.',
    '118:64': 'Da vossa misericórdia, Senhor, está cheia a terra: * as vossas justificações ensinai-me.',
    '118:65': 'Bondade fizestes com o vosso servo, Senhor, * segundo a vossa palavra.',
    '118:66': 'A bondade, e a disciplina, e a ciência ensinai-me: * porque nos vossos mandados cri.',
    '118:67': 'Antes que eu fosse humilhado, eu delinqui: * por isso guardei o vosso elóquio.',
    '118:68': 'Bom sois vós: * e na vossa bondade ensinai-me as vossas justificações.',
    '118:69': 'Multiplicou-se sobre mim a iniquidade dos soberbos: * eu, porém, em todo o meu coração perscrutarei os vossos mandados.',
    '118:70': 'Coagulou-se como leite o coração deles: * eu, na verdade, meditei a vossa lei.',
    '118:71': 'Bom para mim que me humilhastes: * para que eu aprenda as vossas justificações.',
    '118:72': 'Bom para mim a lei da vossa boca, * acima de milhares de ouro e de prata.',
    '118:73': 'As vossas mãos me fizeram, e me plasmaram: * dai-me intelecto, e aprenderei os vossos mandados.',
    '118:74': 'Os que vos temem me verão, e se alegrarão: * porque nas vossas palavras sobre-esperei.',
    '118:75': 'Conheci, Senhor, que equidade são os vossos juízos: * e na vossa verdade me humilhastes.',
    '118:76': 'Faça-se a vossa misericórdia para que me console, * segundo o vosso elóquio ao vosso servo.',
    '118:77': 'Venham a mim as vossas comiserações, e viverei: * porque a vossa lei é a minha meditação.',
    '118:78': 'Sejam confundidos os soberbos, porque injustamente fizeram iniquidade contra mim: * eu, porém, me exercitarei nos vossos mandados.',
    '118:79': 'Voltem-se para mim os que vos temem: * e os que conhecem os vossos testemunhos.',
    '118:80': 'Faça-se o meu coração imaculado nas vossas justificações, * para que eu não seja confundido.',
}

data['range'] = '118:1–118:80'
data['note'] = data['note'].replace('stanzas Aleph–Daleth only; later agents append 118:33 onward', 'stanzas Aleph–Jod (118:1–80); later agents append 118:81 onward')
data['verses'].update(verses)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(data['verses']), 'verses in literal.json')
