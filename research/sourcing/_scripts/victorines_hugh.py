"""Hugh of St Victor books from the Corpus Corporum (PL 175-177). usage: python3 -I victorines_hugh.py slug..."""
import sys
sys.path.insert(0, 'research/sourcing/_scripts')
from victorines_lib import *

C = 'research/sourcing/victorines/cc/w%s.xml'
def N(la, en, pt): return {'la': la, 'en-US': en, 'pt-BR': pt}
def D(la, en, pt): return {'la': la, 'en': en, 'pt': pt}

W = {
 'de-sacramentis': dict(files=['6042'], name=N('De sacramentis christianae fidei', 'On the Sacraments of the Christian Faith', 'Sobre os sacramentos da fé cristã'), composed='c. 1134-1137',
   desc=D('Summa Hugonis de sacramentis christianae fidei, in duobus libris et triginta partibus: ab opere conditionis ad opera restaurationis, ab initio mundi ad finem saeculi.',
     'Hugh of St. Victor’s great summa of theology, in two books and thirty parts: the works of creation and the works of restoration, from the six days to the end of the world, with the sacraments of the Church at its centre.',
     'A grande suma teológica de Hugo de São Vítor, em dois livros e trinta partes: as obras da criação e as obras da restauração, do princípio do mundo ao fim dos tempos, com os sacramentos da Igreja no centro.')),
 'didascalicon': dict(files=['6047'], name=N('Didascalicon de studio legendi', 'Didascalicon: On the Study of Reading', 'Didascálicon: sobre a arte de ler'), composed='c. 1127',
   drop_group=6, desc=D('Didascalicon de studio legendi, in sex libris: quid discendum, quo ordine et quomodo, de artibus et de Scripturis.',
     'Hugh’s guide to study in six books: what is to be learned, in what order and how, from the arts of philosophy (Books I-III) to the reading of Scripture, with the famous counsel to “learn everything; you will see afterwards that nothing is superfluous”. The seventh book of the Migne text, On the Three Days, is a separate book.',
     'O guia de estudo de Hugo em seis livros: o que se deve aprender, em que ordem e como, das artes da filosofia (livros I a III) à leitura da Escritura. O sétimo livro do texto de Migne, Sobre os três dias, é um livro à parte.')),
 'de-tribus-diebus': dict(files=['6047'], name=N('De tribus diebus', 'On the Three Days', 'Sobre os três dias'), composed='c. 1130',
   only_group=6, desc=D('De tribus diebus, quem Migne librum septimum Didascalici nominat: visibilia mundi opera tribus attributis divinae Trinitatis (potentia, sapientia, benignitas) illustrantur.',
     'The treatise that Migne prints as the seventh book of the Didascalicon: the visible world as a book written by the finger of God, read as a mirror of the Trinity’s power, wisdom and goodness.',
     'O tratado que Migne imprime como sétimo livro do Didascálicon: o mundo visível como livro escrito pelo dedo de Deus, lido como espelho do poder, da sabedoria e da bondade da Trindade.')),
 'de-arca-noe-morali': dict(files=['6032'], name=N('De arca Noe morali', 'Noah’s Moral Ark', 'A arca moral de Noé'), composed='c. 1125-1130',
   desc=D('De arca Noe morali, in quattuor libris: arca cordis ad aedificandam sapientiae domum.',
     'Hugh’s Moral Ark of Noah, in four books: the ark as the heart and the Church built by wisdom, a meditation on the interior life told to his brethren.',
     'A Arca moral de Noé de Hugo, em quatro livros: a arca como o coração e a Igreja edificados pela sabedoria, uma meditação sobre a vida interior.')),
 'de-arca-noe-mystica': dict(files=['6033'], name=N('De arca Noe mystica', 'Noah’s Mystical Ark', 'A arca mística de Noé'), composed='c. 1130',
   desc=D('De arca Noe mystica (Libellus de formatione arcae): arcae descriptio mystica, Christi et Ecclesiae figura.',
     'Hugh’s Mystical Ark of Noah (also called the Little Book on the Making of the Ark): the long description of the ark drawn on the plain as a figure of Christ and of the Church.',
     'A Arca mística de Noé (Pequeno livro sobre a construção da arca): a descrição da arca, figura de Cristo e da Igreja.')),
 'soliloquium-de-arrha-animae': dict(files=['6050'], name=N('Soliloquium de arrha animae', 'Soliloquy on the Earnest Money of the Soul', 'Solilóquio sobre o penhor da alma'), composed='c. 1130',
   desc=D('Soliloquium de arrha animae: colloquium hominis cum anima de arrha sponsi, quae est gratia visibilis.',
     'Hugh’s dialogue of a man with his soul about the earnest money (arrha) of the Bridegroom: the visible gifts of grace that foretell the eternal wedding, one of the most tender pieces of twelfth-century spirituality.',
     'O diálogo de Hugo entre o homem e a sua alma sobre o penhor (arrha) do Esposo: os dons visíveis da graça que anunciam as núpcias eternas.')),
 'de-vanitate-mundi': dict(files=['6044'], name=N('De vanitate mundi', 'On the Vanity of the World', 'Sobre a vaidade do mundo'), composed='c. 1130',
   desc=D('De vanitate mundi, in quattuor libris: dialogus Philomelae et Hugonis de fugacitate rerum.',
     'A dialogue in four books on the vanity of the world and the love of God.', 'Um diálogo em quatro livros sobre a vaidade do mundo e o amor de Deus.')),
 'de-institutione-novitiorum': dict(files=['6036'], name=N('De institutione novitiorum', 'On the Instruction of Novices', 'Sobre a formação dos noviços'), composed='c. 1125',
   desc=D('De institutione novitiorum: de disciplina interioris hominis et exterioris vitae.', 'Hugh’s manual for novices: conduct, discipline of mind and body, reading, and the way into religious life.', 'O manual de Hugo para noviços: comportamento, disciplina do espírito e do corpo, leitura e o caminho da vida religiosa.')),
 'opuscula-spiritualia': dict(files=['6037', '6031', '6038', '6020', '6034', '6039', '6040', '6043', '6045', '6022', '6035', '6049', '6046'],
   titles=['De laude charitatis', 'De amore sponsi ad sponsam', 'De modo orandi', 'De quinque septenis', 'De artificio meditandi', 'De potestate et voluntate Dei', 'De quatuor voluntatibus in Christo', 'De sapientia animae Christi', 'De virginitate beatae Mariae', 'Explanatio in Canticum beatae Mariae', 'De fructibus carnis et spiritus', 'Institutiones in Decalogum', 'Epistolae'],
   name=N('Opuscula spiritualia et theologica', 'Spiritual and Theological Opuscula', 'Opúsculos espirituais e teológicos'), composed='c. 1125-1140',
   desc=D('Hugonis opuscula minora: de laude charitatis, de amore sponsi ad sponsam, de modo orandi, de quinque septenis, de artificio meditandi, de voluntate Dei, de sapientia animae Christi, de virginitate Mariae, Magnificat, Decalogus, epistolae.',
     'Hugh’s shorter works in one book: In Praise of Charity, On the Bridegroom’s Love for the Bride, On the Way of Praying, On the Five Sevens, On the Art of Meditating, on the will and wisdom of Christ, On the Virginity of Mary, the commentary on the Magnificat, On the Fruits of the Flesh and of the Spirit (PL, of doubtful authorship), the Commandments and the letters.',
     'Os opúsculos menores de Hugo num só livro: louvor da caridade, o amor do esposo pela esposa, o modo de rezar, os cinco setenários, a arte de meditar, a vontade e a sabedoria de Cristo, a virgindade de Maria, o Magnificat, os mandamentos e as cartas.')),
 'hierarchia-caelestis': dict(files=['6024'], name=N('Expositio in Hierarchiam caelestem', 'Commentary on the Celestial Hierarchy of Dionysius', 'Comentário à Hierarquia celeste de Dionísio'), composed='c. 1125-1137',
   desc=D('Commentariorum in Hierarchiam caelestem S. Dionysii libri decem.', 'Hugh’s commentary in ten books on the Celestial Hierarchy of pseudo-Dionysius in John Scotus Eriugena’s Latin version: the angelic orders and the theology of symbols.', 'O comentário de Hugo em dez livros à Hierarquia celeste de Pseudo-Dionísio, na versão latina de João Escoto Eriúgena: as ordens angélicas e a teologia dos símbolos.')),
 'homiliae-in-ecclesiasten': dict(files=['6025'], name=N('Homiliae in Ecclesiasten', 'Homilies on Ecclesiastes', 'Homilias sobre o Eclesiastes'), composed='c. 1125-1130',
   desc=D('Homiliae in Salomonis Ecclesiasten, XIX.', 'Hugh’s nineteen homilies on Ecclesiastes, read with the Preacher’s question what profit a man has from his toil.', 'As dezenove homilias de Hugo sobre o Eclesiastes.')),
 'adnotationes-in-scripturam': dict(files=['6021', '6014', '6019', '6016', '6015', '6018', '6023', '6017'],
   titles=['De scripturis et scriptoribus sacris', 'Adnotationes in Pentateuchon', 'Adnotatiunculae in librum Judicum', 'Adnotatiuncula in librum Ruth', 'Adnotationes in libros Regum', 'Adnotatiunculae in Threnos', 'Expositio in Abdiam', 'Adnotatiunculae in Joelem'],
   name=N('Adnotationes in Scripturam', 'Notes on Scripture', 'Anotações sobre a Escritura'), composed='c. 1125-1141',
   desc=D('De scripturis et scriptoribus sacris; adnotationes in Pentateuchon, Judices, Ruth, Reges, Threnos; expositio in Abdiam et in Joelem.', 'Hugh’s exegetical notes: the introduction On Scripture and the Sacred Writers, the Pentateuch, Judges, Ruth, Kings, Lamentations, Obadiah and (of doubtful authorship in PL) Joel.', 'As notas exegéticas de Hugo: a introdução sobre a Escritura e os escritores sagrados, o Pentateuco, Juízes, Rute, Reis, Lamentações, Abdias e Joel.')),
 'expositio-in-regulam': dict(files=['6048'], name=N('Expositio in regulam beati Augustini', 'Exposition of the Rule of St. Augustine', 'Exposição da Regra de Santo Agostinho'), composed='c. 1130',
   desc=D('Expositio in regulam beati Augustini (Hugoni attributa), commentarius in Regulam canonicorum.', 'The commentary on the Rule of St. Augustine that tradition attributes to Hugh (doubtful in PL), the rule of life of the canons regular of St. Victor.', 'O comentário à Regra de Santo Agostinho atribuído a Hugo (duvidoso em Migne), regra de vida dos cônegos regulares de São Vítor.')),
 'de-sacramentis-legis': dict(files=['6041'], name=N('De sacramentis legis naturalis et scriptae', 'On the Sacraments of the Natural and the Written Law', 'Sobre os sacramentos da lei natural e escrita'), composed='c. 1130',
   desc=D('De sacramentis legis naturalis et scriptae dialogus (dubium).', 'A dialogue on the sacraments of the natural law and the law of Moses (attributed to Hugh in PL, doubtful).', 'Um diálogo sobre os sacramentos da lei natural e da lei escrita (atribuído a Hugo em Migne, duvidoso).')),
 'quaestiones-in-epistolas-pauli': dict(files=['6026'], name=N('Quaestiones in epistolas Pauli', 'Questions on the Epistles of Paul', 'Questões sobre as epístolas de Paulo'), composed='12th century',
   desc=D('Quaestiones et decisiones in epistolas D. Pauli (Hugoni attributae, non ab eo scriptae).', 'Questions and answers on the Pauline epistles which PL prints under Hugh’s name; modern scholarship does not accept them as his.', 'Questões e respostas sobre as epístolas paulinas que Migne imprime sob o nome de Hugo; a crítica moderna não as aceita como suas.')),
 'summa-sententiarum': dict(files=['6051'], name=N('Summa sententiarum', 'Summa of the Sentences', 'Suma das sentenças'), composed='c. 1138-1141',
   desc=D('Summa sententiarum septem tractatibus distincta (Hugoni attributa, ab Othone Lucensi composita).', 'The Summa of the Sentences in seven tracts, printed under Hugh’s name in PL but now thought to be the work of Otto of Lucca, an early compendium of theology from the school of St. Victor.', 'A Suma das sentenças em sete tratados, impressa por Migne sob o nome de Hugo, hoje atribuída a Oto de Lucca: um dos primeiros compêndios de teologia da escola de São Vítor.')),
}

def build(slug):
    c = W[slug]; files = [C % f for f in c['files']]
    if 'titles' in c: tree = tree_for(files, c['titles'])
    else:
        tree = build_tree(files[0], c['name']['la'])
        if 'drop_group' in c:
            g = [n for n in tree if n['kind'] == 'group']
            tree = [n for n in tree if n is not g[c['drop_group']]]
        if 'only_group' in c:
            g = [n for n in tree if n['kind'] == 'group']
            tree = g[c['only_group']]['children']
    d = write_book('hugh', slug, files, c['name'], c['desc'], c['composed'], tree)
    print(slug, count(tree), d)

if __name__ == '__main__':
    for s in sys.argv[1:]: build(s)
