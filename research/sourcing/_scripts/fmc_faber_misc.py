import sys; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fmc_mk import *
w = sys.argv[1]
if w == 'ethel':
    mk('faber', 'ethels-book', "Ethel's Book, or Tales of the Angels", 'O Livro de Ethel, ou Histórias dos Anjos',
     "Ethel's Book, or Tales of the Angels (1858): four stories for children by Faber, written for Lady Etheldreda Howard: The Last Children, or the Beautiful Midnight; Philip's Death, or the Pains of Children; The Melancholy Heart, or the Child to Whom Nobody Was Kind; and The Weeping Angel.",
     "O Livro de Ethel, ou Histórias dos Anjos (1858): quatro contos para crianças escritos por Faber para Lady Etheldreda Howard: Os Últimos Meninos, ou a Bela Meia-Noite; A Morte de Filipe, ou as Dores das Crianças; O Coração Melancólico, ou a Criança com Quem Ninguém Foi Bondoso; e O Anjo que Chora.",
     1858, 1858, 'London: Thomas Richardson and Son, 1858', 'a579644000fabeuoft', 'faber/ia/a579644000fabeuoft_djvu.txt', 49, 3434,
     [('last-children', 'The Last Children; or, The Beautiful Midnight', 91), ('philips-death', "Philip's Death; or, The Pains of Children", 545), ('melancholy-heart', 'The Melancholy Heart; or, The Child to Whom Nobody Was Kind', 1111), ('weeping-angel', 'The Weeping Angel', 2350)],
     front=[{'id': 'dedication', 'title': 'Dedication', 'from': 49, 'to': 66}], srcnote='The dedication and the four tales; the contents is dropped.', fn=False)
if w == 'lives':
    mk('faber', 'essay-lives-of-the-saints', 'Essay on the Interest and Characteristics of the Lives of the Saints', 'Ensaio sobre o Interesse e as Características das Vidas dos Santos',
     "Essay on the Interest and Characteristics of the Lives of the Saints, with Illustrations from Mystical Theology (1853): Faber's introduction to the Oratorian series of the Lives of the Modern Saints, on why the saints' lives edify, the devotional character of Italian, Spanish and French hagiography, the marvellous and the mystical in the saints' lives, and the use of such lives.",
     "Ensaio sobre o Interesse e as Características das Vidas dos Santos, com Ilustrações da Teologia Mística (1853): a introdução de Faber à série oratoriana das Vidas dos Santos Modernos, sobre por que as vidas dos santos edificam, o caráter devocional da hagiografia italiana, espanhola e francesa, o maravilhoso e o místico nas vidas dos santos e o uso dessas vidas.",
     1853, 1853, 'London: Richardson and Son, 1853', 'a579642500fabeuoft', 'faber/ia/a579642500fabeuoft_djvu.txt', 51, 4968,
     [('essay', 'On the Interest and Characteristics of the Lives of the Saints', 91)], front=[{'id': 'dedication', 'title': 'Dedication', 'from': 51, 'to': 89}], srcnote='The dedication and the essay.', fn=True)
if w == 'beatification':
    mk('faber', 'essay-beatification-canonization', 'Essay on Beatification, Canonization and the Processes of the Congregation of Rites', 'Ensaio sobre a Beatificação, a Canonização e os Processos da Congregação dos Ritos',
     "An Essay on Beatification, Canonization, and the Processes of the Congregation of Rites (1848): Faber's account, written for the Earl and Countess of Shrewsbury, of how the Church examines the cause of a servant of God: the stages of the process, the roles of the Congregation of Rites and the devil's advocate, the proofs of virtues and miracles, and the meaning of beatification and canonization.",
     "Um Ensaio sobre a Beatificação, a Canonização e os Processos da Congregação dos Ritos (1848): a exposição de Faber, escrita para os Condes de Shrewsbury, de como a Igreja examina a causa de um servo de Deus: as etapas do processo, o papel da Congregação dos Ritos e do advogado do diabo, as provas das virtudes e dos milagres e o sentido da beatificação e da canonização.",
     1848, 1848, 'London: Richardson and Son, 1848', 'anessayonbeatif00fabegoog', 'faber/ia/anessayonbeatif00fabegoog_djvu.txt', 84, 5536,
     [('essay', 'On Beatification, Canonization, and the Processes of the Congregation of Rites', 116)], front=[{'id': 'dedication', 'title': 'Dedication', 'from': 85, 'to': 114}], srcnote='The dedication and the essay; the publisher\'s catalogue is dropped.', fn=True)
if w == 'neri':
    mk('faber', 'spirit-genius-st-philip-neri', 'The Spirit and Genius of St. Philip Neri', 'O Espírito e o Gênio de S. Filipe Neri',
     "The Spirit and Genius of St. Philip Neri (1850): three lectures delivered in the London Oratory in the triduum before the feast of St. Philip: St. Philip a portrait of Jesus, St. Philip the representative saint of modern times, and St. Philip in England.",
     "O Espírito e o Gênio de S. Filipe Neri (1850): três conferências pronunciadas no Oratório de Londres no tríduo anterior à festa de S. Filipe: S. Filipe, retrato de Jesus; S. Filipe, o santo representativo dos tempos modernos; e S. Filipe na Inglaterra.",
     1850, 1850, 'London: Henry Lucas, 1850', 'TheSpiritAndGeniusOfStPhilipNeri', 'faber/ia/TheSpiritAndGeniusOfStPhilipNeri_djvu.txt', 170, 5283,
     [('lecture-1', 'Lecture I. St. Philip a Portrait of Jesus', 218), ('lecture-2', 'Lecture II. St. Philip the Representative Saint of Modern Times', 1975), ('lecture-3', 'Lecture III. St. Philip in England', 3800)], srcnote='The three lectures; the contents is dropped, and the unrelated work bound after them is left out.', fn=True)
