import sys; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fmc_mk import *
RN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI']
def ch(lines): return [('chapter-%d' % i, 'Chapter %s' % RN[i], l) for i, l in enumerate(lines, 1)]
w = sys.argv[1]
if w == 'oec':
    mk('manning', 'oecumenical-council-infallibility', 'The Oecumenical Council and the Infallibility of the Roman Pontiff', 'O Concílio Ecumênico e a Infalibilidade do Romano Pontífice',
     "The Oecumenical Council and the Infallibility of the Roman Pontiff (1869): a pastoral letter to the clergy of Westminster on the effect of the coming Vatican Council, the opportuneness of defining papal infallibility, the tradition of that doctrine from Chalcedon through the Gallican period, and two certain effects of the Council, with a postscript on Mgr Maret.",
     "O Concílio Ecumênico e a Infalibilidade do Romano Pontífice (1869): carta pastoral ao clero de Westminster sobre o efeito do Concílio Vaticano que se aproximava, a oportunidade de definir a infalibilidade papal, a tradição dessa doutrina de Calcedónia ao período galicano e dois efeitos certos do Concílio, com um post-scriptum sobre Mons. Maret.",
     1869, 1869, 'London: Longmans, Green and Co., 1869', 'theoecumenicalco00mannuoft', 'manning/ia/theoecumenicalco00mannuoft_djvu.txt', 95, int(sys.argv[2]),
     ch([95, 800, 2023, 4659]) + [('postscript', 'Postscript. Mgr Maret on the General Council', 5230)], srcnote='The four chapters and the postscript; the contents is dropped.')
if w == 'story':
    mk('manning', 'true-story-vatican-council', 'The True Story of the Vatican Council', 'A Verdadeira História do Concílio Vaticano',
     "The True Story of the Vatican Council (1877): Manning's account of the Council of 1869-70: the first thought of holding it, the assembly of the bishops and the preparation, the opening and the constitution on Catholic faith, the debates on infallibility, and the definition and its consequences.",
     "A Verdadeira História do Concílio Vaticano (1877): o relato de Manning sobre o Concílio de 1869-70: o primeiro pensamento de o convocar, a reunião dos bispos e a preparação, a abertura e a constituição sobre a fé católica, os debates sobre a infalibilidade, a definição e as suas consequências.",
     1877, 1877, 'London: Burns and Oates, 1877', 'truestoryofvatic00mannuoft', 'manning/ia/truestoryofvatic00mannuoft_djvu.txt', 58, int(sys.argv[2]),
     ch([167, 1538, 3154]) + [('appendix', 'Appendix to Chapter III', 4530)] + [('chapter-4', 'Chapter IV', 5175), ('chapter-5', 'Chapter V', 6271)],
     front=[{'id': 'preface', 'title': 'Preface', 'from': 59, 'to': 83}], srcnote='The preface and the five chapters with the appendix to the third; the contents is dropped.')
if w == 'decrees':
    mk('manning', 'vatican-decrees-civil-allegiance', 'The Vatican Decrees in their Bearing on Civil Allegiance', 'Os Decretos do Vaticano e a Lealdade Civil',
     "The Vatican Decrees in their Bearing on Civil Allegiance (1875): Manning's reply to Mr Gladstone's Expostulation, on the Vatican Council and the infallibility, the relations of the Church and the civil power, the history of the question, and the loyalty of Catholics to the State, with appendices.",
     "Os Decretos do Vaticano e a Lealdade Civil (1875): a resposta de Manning à Expostulação de Mr Gladstone sobre o Concílio Vaticano e a infalibilidade, as relações da Igreja com o poder civil, a história da questão e a lealdade dos católicos ao Estado, com apêndices.",
     1875, 1875, 'London: Longmans, Green and Co., 1875', 'a628785800mannuoft', 'manning/ia/a628785800mannuoft_djvu.txt', 40, int(sys.argv[2]),
     [('introduction', 'Introduction', 139)] + ch([499, 1693, 3709, 4884, 5870]) + [('conclusion', 'Conclusion', 6609), ('appendix-a', 'Appendix A', 6766), ('appendix-b', 'Appendix B', 6960), ('appendix-c', 'Appendix C', 7053)],
     front=[{'id': 'preface', 'title': 'Preface', 'from': 41, 'to': 103}], srcnote='The preface, introduction, five chapters, conclusion and three appendices; the contents is dropped.')
