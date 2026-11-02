import sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts/migne')
from mkbook import *
B = ROOT / 'content/books/olier-opera-omnia'
def tr(fr, en, pt): return {'fr-FR': fr, 'en-US': en, 'pt-BR': pt}
AUTH = tr('Jean-Jacques Olier', 'Jean-Jacques Olier', 'Jean-Jacques Olier')
MIGNE = {'language': 'fr-FR', 'url': 'https://archive.org/details/uvrescompltesd00olie', 'edition': 'Œuvres complètes de M. Olier, éd. Migne, Paris, 1856; archive.org OCR (ABBYY) of the Toronto copy.',
  'description': 'Machine-cleaned OCR: running heads, page numbers and hyphenation removed, paragraphs rejoined, obvious character errors corrected by a vote against the corpus vocabulary. Residual OCR errors remain (see PROBLEMS.md).', 'tier': 'A', 'tierEvidence': 'Olier died in 1657; the 1856 edition is public domain.'}
ED = {'fr-FR': {'editor': 'Jacques-Paul Migne', 'year': 1856}}
def t(fr, en, pt): return tr(fr, en, pt)
BOOKS = {
 'introduction-vie-et-vertus': ('olier-introduction-vie-et-vertus', 'olier/introduction-vie-et-vertus', 1657, t('Introduction à la vie et aux vertus chrétiennes', 'Introduction to the Christian Life and Virtues', 'Introdução à vida e às virtudes cristãs'),
   t('Quinze chapitres sur la religion de Jésus-Christ et la vie chrétienne, puis sur les vertus : humilité, pénitence, mortification, patience, douceur, pauvreté, chasteté, obéissance, charité.', 'Fifteen chapters on the religion of Jesus Christ and the Christian life, then on the virtues: humility, penance, mortification, patience, meekness, poverty, chastity, obedience, charity.', 'Quinze capítulos sobre a religião de Jesus Cristo e a vida cristã, depois sobre as virtudes: humildade, penitência, mortificação, paciência, mansidão, pobreza, castidade, obediência, caridade.'), None, [MIGNE], ED),
 'journee-chretienne': ('olier-journee-chretienne', 'olier/journee-chretienne', 1655, t('La Journée chrétienne', 'The Christian Day', 'O Dia cristão'),
   t('Les exercices et les actes d’une journée chrétienne : lever, messe, office, repas, travail, promenade, maladie, coucher.', 'The exercises and acts of a Christian day: rising, Mass, office, meals, work, walks, sickness, sleep.', 'Os exercícios e atos de um dia cristão: levantar, missa, ofício, refeições, trabalho, passeio, doença, deitar.'), None, [MIGNE], ED),
 'ceremonies-grand-messe': ('olier-ceremonies-grand-messe', 'olier/ceremonies-grand-messe', 1657, t('Explication des cérémonies de la grand’messe de paroisse', 'Explanation of the Ceremonies of the Parish High Mass', 'Explicação das cerimônias da missa solene paroquial'),
   t('Neuf livres et la messe des morts : un commentaire mystique de la grand’messe de paroisse, cérémonie par cérémonie.', 'Nine books and the Mass for the dead: a mystical commentary on the parish High Mass, ceremony by ceremony.', 'Nove livros e a missa dos mortos: um comentário místico da missa solene paroquial, cerimônia por cerimônia.'), None, [MIGNE], ED),
 'catechisme-chretien': ('olier-catechisme-chretien', 'olier/catechisme-chretien', 1656, t('Catéchisme chrétien pour la vie intérieure', 'Catechism of the Interior Life', 'Catecismo cristão para a vida interior'),
   t('Deux parties en leçons par questions et réponses : l’esprit chrétien, la croix et les mystères du Christ, puis la prière et la communion.', 'Two parts in lessons of questions and answers: the Christian spirit, the cross and the mysteries of Christ, then prayer and communion.', 'Duas partes em lições de perguntas e respostas: o espírito cristão, a cruz e os mistérios de Cristo, depois a oração e a comunhão.'), None, [MIGNE], ED),
 'traite-des-saints-ordres': ('olier-traite-des-saints-ordres', 'olier/traite-des-saints-ordres', 1676, t('Traité des saints ordres', 'Treatise on Holy Orders', 'Tratado das ordens sagradas'),
   t('La cléricature, les ordres inférieurs et le sacerdoce, publié après la mort d’Olier (Tronson, 1676).', 'Clericature, the minor orders and the priesthood, published after Olier’s death (Tronson, 1676).', 'A clericatura, as ordens menores e o sacerdócio, publicado após a morte de Olier (Tronson, 1676).'), None, [MIGNE], ED),
 'opuscules': ('olier-opuscules', 'olier/opuscules', 1650, t('Extraits des Mémoires, Esprit d’un directeur et autres opuscules', 'Extracts from the Memoirs, Spirit of a Director and Other Opuscules', 'Extratos das Memórias, Espírito de um diretor e outros opúsculos'),
   t('Les extraits des Mémoires manuscrits, l’Esprit d’un directeur des âmes, les Règles de l’art des arts, les avis et l’examen sur les vertus.', 'Extracts from the manuscript Memoirs, the Spirit of a Director of Souls, the Rules of the Art of Arts, the counsels and the examination on the virtues.', 'Extratos das Memórias manuscritas, o Espírito de um diretor de almas, as Regras da arte das artes, os avisos e o exame sobre as virtudes.'), ['memoires', 'esprit-directeur', 'regles'], [MIGNE], ED),
 'lettres': ('olier-lettres', 'olier/lettres', '1631–1657', t('Lettres', 'Letters', 'Cartas'),
   t('Les lettres de M. Olier, dans l’édition de 1885 (Lecoffre, 2 volumes) : lettres spirituelles chronologiques aux religieuses, aux prêtres et aux laïcs.', 'The letters of M. Olier in the 1885 edition (Lecoffre, 2 volumes): chronological spiritual letters to nuns, priests and lay people.', 'As cartas de M. Olier na edição de 1885 (Lecoffre, 2 volumes): cartas espirituais em ordem cronológica a religiosas, sacerdotes e leigos.'), None,
   [{'language': 'fr-FR', 'url': 'https://archive.org/details/lettresdemolierf01olie', 'edition': 'Lettres de M. Olier, Paris, V. Lecoffre, 1885, 2 vols (archive.org lettresdemolierf01olie and lettresdemolierf02olie); OCR cleaned.', 'description': 'Machine-cleaned OCR: running heads, page numbers and hyphenation removed. The editor’s notes and footnote markers are left in the running text; letters whose heading the OCR lost sit inside the previous letter. The 1885 introduction is not included.', 'tier': 'A', 'tierEvidence': 'Olier died in 1657; the 1885 edition is public domain.'}],
   {'fr-FR': {'editor': 'Gaston de Ségur et les Sulpiciens', 'year': 1885}}),
}
def go(slug):
    bid, work, comp, name, desc, order, src, ed = BOOKS[slug]
    return make(B / slug, bid, work, name, AUTH, desc, comp, ed, src, order=order)
if __name__ == '__main__':
    for s in sys.argv[1:]:
        print(s, go(s))
