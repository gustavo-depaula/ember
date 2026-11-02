import sys; sys.path.insert(0, 'research/sourcing/_scripts')
from kempis_pieces import book
book({'slug': 'consolatio-pauperum', 'file': 'research/sourcing/kempis/pohl/operaomnia0000thom_q8k7.txt', 'title_la': 'Consolatio pauperum et infirmorum',
 'name': {'la': 'Consolatio pauperum et infirmorum', 'en-US': 'The Consolation of the Poor and the Sick', 'pt-BR': 'A Consolação dos Pobres e Enfermos'},
 'description': {'la': 'Consolatio pauperum et infirmorum: dialogus brevis octo articulis, ad pauperem, debilem, Lazarum infirmum, Ioseph peregrinum, claudum despectum, Columbanum tacitum, Simplicianum indoctum et turturem solitarium.',
   'en-US': 'A short book of comfort in eight addresses, to the poor man, the weak, sick Lazarus, Joseph the stranger, the despised cripple, Columban the silent, Simplicianus the unlearned and the solitary turtle-dove. Latin only: Pohl\'s critical edition (Freiburg 1918), from a raw OCR of the printed volume; no public-domain English translation has been found.',
   'pt-BR': 'Pequeno livro de consolação em oito exortações: ao pobre, ao fraco, a Lázaro enfermo, a José peregrino, ao coxo desprezado, a Columbano calado, a Simpliciano ignorante e à rola solitária.'},
 'composed': 'c. 1425-1440', 'edition': {'year': 1918, 'vol': 'IV', 'archive': 'operaomnia0000thom_q8k7'},
 'head': __import__('re').compile(r'CONSOLATIO PAVPERVM'), 'pieces': [('proemium', 'Prooemium', 5603, 5614), ('pauper', 'Pauper', 5615, 5623), ('debilis', 'Debilis', 5623, 5633), ('lazarus-infirmus', 'Lazarus infirmus', 5633, 5665),
   ('ioseph-peregrinus', 'Ioseph peregrinus', 5665, 5683), ('claudus-despectus', 'Claudus despectus', 5683, 5707), ('columbanus-tacitus', 'Columbanus tacitus', 5707, 5722),
   ('simplicianus-indoctus', 'Simplicianus indoctus', 5722, 5752), ('turtur-solitarius', 'Turtur solitarius', 5752, 5776)]})

# first words eaten by the drop capitals, restored from the sense (a lost word is marked [...])
import re
D = 'content/books/kempis-opera-omnia/consolatio-pauperum/la/'
for f, old, new in [('pauper', r'^ING pauper', 'Noli pauper'), ('debilis', r'^V ¿Oli murmurare debilis corpore, quia EON \) saepius', 'Noli murmurare debilis corpore, quia saepius'),
    ('lazarus-infirmus', r'^Any Ernte in Domino', '[...] in Domino'), ('ioseph-peregrinus', r'^P JAEtare frater Ioseph innocens et g 4 mansuete', 'Laetare frater Ioseph innocens et mansuete'),
    ('claudus-despectus', r'^Eos frater', '[...] frater'), ('simplicianus-indoctus', r'^Cx et lauda Deum frater Sim- Ws pliciane', '[...] et lauda Deum frater Simpliciane'),
    ('proemium', r'^\* Onsolamini', 'Consolamini'), ('turtur-solitarius', r'attende dewAY siderator', 'attende desiderator')]:
    t = open(D + f + '.md').read()
    t2 = re.sub(r'(?m)(\n\n)' + old, lambda m: m.group(1) + new, t, count=1) if old.startswith('^') else re.sub(old, new, t, count=1)
    assert t2 != t, f
    open(D + f + '.md', 'w').write(t2)
