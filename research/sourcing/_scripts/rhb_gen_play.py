from rhb_gen_ia import cfg
cfg('mystery-play-nativity', 'A Mystery Play in Honour of the Nativity of Our Lord', 'Um Mistério em Honra da Natividade de Nosso Senhor',
 "Benson's mystery play of 1908 for Christmas, in the manner of the medieval cycles, written for performance at Cambridge: a preface, five scenes of the Nativity, and appendices on the scenery, properties, costumes and method of acting.",
 "O mistério de Natal de Benson (1908), ao modo dos ciclos medievais, escrito para ser representado em Cambridge: um prefácio, cinco cenas da Natividade e apêndices sobre cenário, objetos, trajes e modo de representar.",
 1908, ('London: Longmans, Green, 1908', 1908), 'x', None, r'^PREFACE$', r'^\*\*\* END OF', mode='pg', after=40, lead_title='Preface', lead_id='preface',
 chap_re=r'^(?P<t>SCENE [IVX]+|APPENDICES|PROLOGUE|EPILOGUE|Scene [IVX]+)\.?$', part_re=None, label='', title_next=False,
 src='robert-hugh-benson/pg/pg61606.txt', url='https://www.gutenberg.org/ebooks/61606', edition='A Mystery Play in Honour of the Nativity of Our Lord (London: Longmans, Green, 1908), Project Gutenberg #61606, proofread.', died=1914)
d = __import__('json').load(open('rhb_cfg_mystery-play-nativity.json')); d.pop('manual', None); __import__('json').dump(d, open('rhb_cfg_mystery-play-nativity.json', 'w'), indent=1)
