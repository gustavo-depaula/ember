import json
from rhb_gen_ia import cfg
cfg('paradoxes-of-catholicism', 'Paradoxes of Catholicism', 'Paradoxos do Catolicismo',
 "Benson's Advent sermons preached in Westminster Cathedral (1913): the Catholic faith as a union of apparent contradictions, as in its Lord, God and Man: peace and war, wealth and poverty, sanctity and sin, joy and sorrow, love of God and of man, faith and reason, authority and liberty, corporateness and individualism, meekness and violence, the Seven Words, and life and death.",
 "Sermões de Benson (1913): a fé católica como união de contradições aparentes, como em seu Senhor, Deus e Homem: paz e guerra, riqueza e pobreza, santidade e pecado, alegria e tristeza, amor a Deus e ao homem, fé e razão, autoridade e liberdade, espírito de corpo e individualismo, mansidão e violência, as Sete Palavras, vida e morte.",
 1913, ('London: Hutchinson, 1913', 1913), 'x',
 [[107, 'Introductory'], [500, 'I. Peace and War'], [721, 'II. Wealth and Poverty'], [908, 'III. Sanctity and Sin'], [1129, 'IV. Joy and Sorrow'], [1351, 'V. Love of God and Love of Man'],
  [1601, 'VI. Faith and Reason'], [1866, 'VII. Authority and Liberty'], [2104, 'VIII. Corporateness and Individualism'], [2277, 'IX. Meekness and Violence'],
  [2532, 'X. The Seven Words'], [3261, 'XI. Life and Death']], 106, 3487, mode='pg', pgfn=True, h2=r'THE (FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH) WORD|INTRODUCTION',
 src='robert-hugh-benson/pg/pg16309.txt', url='https://www.gutenberg.org/ebooks/16309', edition='Paradoxes of Catholicism (London: Hutchinson, 1913), Project Gutenberg #16309, proofread.', died=1914)
cfg('lourdes', 'Lourdes', 'Lourdes',
 "Benson's account of 1914 of a pilgrimage to Lourdes: the town, the Grotto, the Bureau des Constatations, the apparition to Bernadette and the cures he witnessed.",
 "O relato de Benson (1914) de uma peregrinação a Lourdes: a cidade, a Gruta, o Bureau des Constatations, a aparição a Bernadette e as curas a que assistiu.",
 1914, ('London: Burns & Oates, 1914', 1914), 'x', None, 162, 2015, mode='pg', chap_re=r'^(?P<n>[IVXL]+)\.$', part_re=None,
 src='robert-hugh-benson/pg/pg18729.txt', url='https://www.gutenberg.org/ebooks/18729', edition='Lourdes (London: Burns & Oates, 1914), Project Gutenberg #18729, proofread.', died=1914, label='Chapter')
d = json.load(open('rhb_cfg_lourdes.json')); d.pop('manual', None); d['end'] = r'^\*\*\* END OF'; d['start'] = r'^LIST OF ILLUSTRATIONS'; d['after'] = 30
json.dump(d, open('rhb_cfg_lourdes.json', 'w'), indent=1)
