import re
from rhb_gen_ia import cfg
PG = '../robert-hugh-benson/pg/'
# The Light Invisible: titles from the contents
L = open(PG + 'pg58433.txt', encoding='utf8').read().split('\n')
titles = []
for l in L[180:240]:
    m = re.match(r'^\s{8,}([A-Z][A-Z ,?\-\'’!.]+?)\s{2,}\d+\s*$', l)
    if m: titles.append(m.group(1).strip())
man = []
pos = 205
for t in titles:
    i = next(i for i in range(pos, len(L)) if re.sub('[^a-z]', '', L[i].lower()) == re.sub('[^a-z]', '', t.lower()))
    man.append([i + 1, L[i].strip()]); pos = i + 1
drop = '(?i)(' + '|'.join(re.escape(m_[1]) for m_ in man) + ')'
end = next(i for i, l in enumerate(L) if l.strip() == 'THE END') + 1
print(titles, man[:2])
cfg('light-invisible', 'The Light Invisible', 'A Luz Invisível',
 "Benson's first book of fiction (1903), written while still an Anglican: a priest recounts the stories told to him by an old friend, a hermit-priest gifted with spiritual sight, of apparitions, conscience and the unseen Presence behind the world.",
 "O primeiro livro de ficção de Benson (1903), escrito quando ainda era anglicano: um padre narra as histórias que lhe contou um velho amigo, sacerdote eremita dotado de visão espiritual, sobre aparições, consciência e a Presença invisível por trás do mundo.",
 1903, ('London: Isbister, 1903', 1903), 'x', man, 140, end, mode='pg', dropfull=drop, src='robert-hugh-benson/pg/pg58433.txt', url='https://www.gutenberg.org/ebooks/58433', edition='The Light Invisible (London: Isbister, 1903), Project Gutenberg #58433, proofread.', died=1914)
cfg('mirror-of-shalott', 'A Mirror of Shalott', 'Um Espelho de Shalott',
 "Benson's collection of ghost and horror stories of 1907: thirteen tales told on one night in Rome by priests, a monsignor, and a layman, about the supernatural encounters that tested their faith, with a prologue.",
 "A coleção de Benson (1907) de contos de fantasmas e de terror: treze histórias contadas numa noite em Roma por padres, um monsenhor e um leigo, sobre encontros sobrenaturais que puseram à prova a sua fé, com um prólogo.",
 1907, ('London: Pitman, 1907', 1907), 'x',
 [[101, 'Prologue'], [371, 'I. Monsignor Maxwell’s Tale'], [740, 'II. Father Meuron’s Tale'], [1173, 'III. Father Brent’s Tale'], [1546, 'IV. The Father Rector’s Tale'], [1954, 'V. Father Girdlestone’s Tale'],
  [3002, 'VI. Father Bianchi’s Tale'], [3313, 'VII. Father Jenks’ Tale'], [3708, 'VIII. Father Martin’s Tale'], [4154, 'IX. Mr. Bosanquet’s Tale'], [4687, 'X. Father Macclesfield’s Tale'],
  [5024, 'XI. Father Stein’s Tale'], [5214, 'XII. Mr. Percival’s Tale'], [5643, 'XIII. My Own Tale']], 101, 6050, mode='pg', sec_re=r'^[IVXL]+\.?$', dropfull=r'_[^_]{5,40}Tale_',
 src='robert-hugh-benson/pg/pg78565.txt', url='https://www.gutenberg.org/ebooks/78565', edition='A Mirror of Shalott (London: Pitman, 1907), Project Gutenberg #78565, proofread.', died=1914)
cfg('richard-raynal-solitary', 'The History of Richard Raynal, Solitary', 'A História de Richard Raynal, Eremita',
 "Benson's medieval tale of 1906, presented as a recovered manuscript of Sir John, a priest of Edward IV's time: the life of the young hermit Richard Raynal, his visions, his journey to London and his death.",
 "A narrativa medieval de Benson (1906), apresentada como manuscrito recuperado de Sir John, sacerdote do tempo de Eduardo IV: a vida do jovem eremita Richard Raynal, suas visões, sua viagem a Londres e sua morte.",
 1906, ('London: Isbister, 1906', 1906), 'x', None, 315, r'^\*\*\* END OF', mode='pg', chap_re=r'^(?P<t>_?How .*)$', part_re=None, sec_re=r'^[IVXL]+\.?$', label='', src='robert-hugh-benson/pg/pg15808.txt', url='https://www.gutenberg.org/ebooks/15808', edition='The History of Richard Raynal, Solitary (London: Isbister, 1906), Project Gutenberg #15808, proofread.', died=1914)
