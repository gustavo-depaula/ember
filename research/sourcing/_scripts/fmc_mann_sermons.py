import sys; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fmc_mk import *
A = 'manning/ia/'
V1 = ["Help Nearest when Need Greatest", "Dogmatic Authority Supernatural and Infallible", "The Perpetual Office of the Council of Trent", "The Name and Patience of Jesus", "The Certainty of Divine Faith", "Strength in Weakness", "Occisi et Coronati", "Unity in Diversity the Perfection of the Church", "The Good Shepherd", "The Mantle of the Good Shepherd", "The Powers of the World to Come", "The Weapons of Our Warfare", "The Resurrection of the Dry Bones"]
V2 = ["The Church, the Spirit, and the Word", "The Apostolate of St. Vincent of Paul", "St. Vincent's Love of Souls", "The Death of St. Vincent", "The Restoration of the Church of St. Thomas", "The Blessed Sacrament the Centre of Immutable Truth", "The Mission of St. Alphonsus", "Truth before Peace", "Omnia pro Christo", "The Disciples of the Holy Ghost", "Our Duty to the Heathen", "Missions to the Heathen a Test of Love", "The Negro Mission", "St. Edmund's Heirloom"]
V3 = ["The Temporal Power of the Pope in its Political Aspect", "Rome and the Revolution", "Christ and Antichrist", "The Syllabus", "Popular Objections to the Vatican Council", "Rome the Capital of Christendom", "The Pontificate of Pius IX and the Years of Peter", "The Divine Commonwealth", "The Triumph of the Church", "The Glory of the Church Always Progressive", "The Day of the Lord"]
R = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV']
def build(vol, f, V, pos, intro, intro_title, end, imprint, year, desc, desc_pt, nm, nmpt):
    S = A + f + '_djvu.txt'
    r = back_to_numeral(S, find_titles(S, V, pos=pos, n=12))
    units = ([('introduction', intro_title, intro)] if intro else []) + [('sermon-%d' % i, 'Sermon %s. %s' % (R[i - 1], t), l) for i, t, l in r]
    print([u for u in units if not u[2]])
    mk('manning', 'sermons-ecclesiastical-subjects-%d' % vol, nm, nmpt, desc, desc_pt, year, year, imprint, f, S, units[0][2], end, units,
       srcnote='The sermons%s; the contents, the errata and the index are dropped.' % (' and the introduction' if intro else ''), title='Sermons on Ecclesiastical Subjects (vol. %d)' % vol, work='sermons-ecclesiastical-subjects')
which = sys.argv[1]
if which == '1': build(1, 'ecclesiastical00mannuoft', V1, 3000, 279, 'The Relations of England to Christianity', 14586, 'London: Burns and Lambert, 1863', 1863,
 "Sermons on Ecclesiastical Subjects, volume I (1863): the introduction on the relations of England to Christianity and thirteen sermons preached at the Provincial Councils of Westminster, in Rome, Paris and London, on dogmatic authority, the Council of Trent, divine faith, the Good Shepherd, unity and the Resurrection of the dry bones.",
 "Sermões sobre Assuntos Eclesiásticos, volume I (1863): a introdução sobre as relações da Inglaterra com o cristianismo e treze sermões pregados nos Concílios Provinciais de Westminster, em Roma, Paris e Londres, sobre a autoridade dogmática, o Concílio de Trento, a fé divina, o Bom Pastor, a unidade e a ressurreição dos ossos secos.",
 'Sermons on Ecclesiastical Subjects, I', 'Sermões sobre Assuntos Eclesiásticos, I')
if which == '2': build(2, 'a591990802mannuoft', V2, 150, None, None, 13006, 'London: Burns, Oates and Co., 1867', 1867,
 "Sermons on Ecclesiastical Subjects, volume II (1867-72): fourteen sermons on the Church, the Spirit and the Word, St. Vincent de Paul, the Blessed Sacrament, St. Alphonsus, truth before peace, the Disciples of the Holy Ghost, the foreign missions and the Negro mission, and St. Edmund.",
 "Sermões sobre Assuntos Eclesiásticos, volume II (1867-72): catorze sermões sobre a Igreja, o Espírito e a Palavra, S. Vicente de Paulo, o Santíssimo Sacramento, S. Afonso, a verdade antes da paz, os Discípulos do Espírito Santo, as missões estrangeiras e a missão aos negros, e S. Edmundo.",
 'Sermons on Ecclesiastical Subjects, II', 'Sermões sobre Assuntos Eclesiásticos, II')
if which == '3': build(3, 'a591990803mannuoft', V3, 3200, 145, 'Introduction', 12418, 'London: Burns, Oates and Co., 1873', 1873,
 "Sermons on Ecclesiastical Subjects, volume III (1866-72): the introduction and eleven sermons preached in the Pro-Cathedral on the temporal power of the Pope, Rome and the Revolution, Christ and Antichrist, the Syllabus, the Vatican Council, the pontificate of Pius IX, the divine commonwealth and the triumph of the Church.",
 "Sermões sobre Assuntos Eclesiásticos, volume III (1866-72): a introdução e onze sermões pregados na Pró-Catedral sobre o poder temporal do Papa, Roma e a Revolução, Cristo e o Anticristo, o Syllabus, o Concílio Vaticano, o pontificado de Pío IX, a república divina e o triunfo da Igreja.",
 'Sermons on Ecclesiastical Subjects, III', 'Sermões sobre Assuntos Eclesiásticos, III')
