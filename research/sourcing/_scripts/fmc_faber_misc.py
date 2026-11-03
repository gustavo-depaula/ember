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
