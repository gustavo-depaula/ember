import sys; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fmc_mk import *
A = 'manning/ia/'
RN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII']
V = {1: (["Roma Eterna", "The Work and the Wants of the Catholic Church in England", "On the Subjects Proper to the Academia", "Father Faber", "The Visit of Garibaldi to England", "Cardinal Wiseman", "Inaugural Address", "French Infidelity", "Ireland", "Inaugural Address", "On Progress", "The Daemon of Socrates"], 120),
     2: (["Dr. Nicholson's Accusation of the Archbishop of Westminster", "The Dignity and Rights of Labour", "The Church of Rome", "Cesarism and Ultramontanism", "Ultramontanism and Christianity", "Christianity and Antichristianism", "The Pope and Magna Charta", "Inaugural Address", "Philosophy without Assumptions", "Frederic Ozanam"], 110),
     3: (["Is the Education Act of 1870 a Just Law", "The Working of the Education Act of 1870 Unequal", "Is the Christianity of England Worth Preserving", "To Amend the Education Act of 1870", "An Englishman's Protest", "An Englishman's Second Protest", "Parliamentary Oaths", "Without God, No Commonwealth", "S. Francis of Sales", "William George Ward", "The Salvation Army", "Why are our People Unwilling to Emigrate", "Our National Vice", "History of the Papacy during the Reformation", "A Pleading for the Worthless", "Henry VIII and the English Monasteries", "The Catholic Church and Modern Society", "The Work and Wants of the Church in England", "Outdoor Relief", "The Law of Nature Divine and Supreme", "Compensation to the Drink Trade", "The Soul before and after Death", "The Church its own Witness"], 190)}
FULL3 = {2: "The Working of the Education Act of 1870 Unequal: therefore Unjust", 1: "Is the Education Act of 1870 a Just Law?", 3: "Is the Christianity of England Worth Preserving?", 4: "Appendix: To Amend the Education Act of 1870"}
END = {1: None, 2: None, 3: None}
def build(vol, f, end, imprint, year, desc, desc_pt, nm, nmpt, comp):
    S = A + f + '_djvu.txt'; T, pos = V[vol]
    r = back_to_numeral(S, find_titles(S, T, pos=pos, n=12))
    print([x for x in r if not x[2]])
    units = []; n = 0
    for i, t, l in r:
        if vol == 3 and i == 4: units.append(('appendix', 'Appendix to III: Suggestions on the Education Act', l)); continue
        n += 1; full = FULL3.get(i) if vol == 3 else None
        if vol == 3 and i > 4: full = None
        units.append(('essay-%d' % n, '%s. %s' % (RN[n], full or t), l))
    mk('manning', 'miscellanies-%d' % vol, nm, nmpt, desc, desc_pt, comp, year, imprint, f, S, units[0][2], end, units,
       srcnote='The essays, lectures and addresses in order; the contents, the publisher\'s list and the index are dropped.', title='Miscellanies (vol. %d)' % vol, work='miscellanies')
w = sys.argv[1]
if w == '1': build(1, 'miscellanies01mannuoft', int(sys.argv[2]), 'London: Burns and Oates, 1877', 1877,
 "Miscellanies, volume I (1877): essays and addresses of 1863-72: Roma Aeterna, the work and wants of the Catholic Church in England, Father Faber, Cardinal Wiseman, Garibaldi's visit, French infidelity, Ireland, on progress, and the Daemon of Socrates.",
 "Miscelânea, volume I (1877): ensaios e discursos de 1863-72: Roma Aeterna, a obra e as necessidades da Igreja Católica na Inglaterra, o Padre Faber, o Cardeal Wiseman, a visita de Garibaldi, a incredulidade francesa, a Irlanda, sobre o progresso e o demônio de Sócrates.", 'Miscellanies, I', 'Miscelânea, I', 1877)
if w == '2': build(2, 'miscellanies02mannuoft', int(sys.argv[2]), 'London: Burns and Oates, 1877', 1877,
 "Miscellanies, volume II (1877): essays and lectures of 1873-76: the dignity and rights of labour, the Church of Rome, Caesarism and Ultramontanism, Christianity and Antichristianism, the Pope and Magna Charta, philosophy without assumptions, and Frederic Ozanam.",
 "Miscelânea, volume II (1877): ensaios e conferências de 1873-76: a dignidade e os direitos do trabalho, a Igreja de Roma, cesarismo e ultramontanismo, cristianismo e anticristianismo, o Papa e a Magna Carta, filosofia sem pressupostos e Frederico Ozanam.", 'Miscellanies, II', 'Miscelânea, II', 1877)
if w == '3': build(3, 'miscellanies03mannuoft', int(sys.argv[2]), 'London: Burns and Oates, 1888', 1888,
 "Miscellanies, volume III (1888): essays of 1880-88 on the Education Act of 1870, the Christianity of England, the parliamentary oath, St. Francis de Sales, W. G. Ward, the Salvation Army, emigration, the national vice, the Papacy and the Reformation, Henry VIII and the monasteries, the law of nature, the soul after death, and the Church its own witness.",
 "Miscelânea, volume III (1888): ensaios de 1880-88 sobre a Lei da Educação de 1870, o cristianismo da Inglaterra, o juramento parlamentar, S. Francisco de Sales, W. G. Ward, o Exército da Salvação, a emigração, o vício nacional, o papado e a Reforma, Henrique VIII e os mosteiros, a lei natural, a alma antes e depois da morte e a Igreja testemunha de si mesma.", 'Miscellanies, III', 'Miscelânea, III', 1888)
