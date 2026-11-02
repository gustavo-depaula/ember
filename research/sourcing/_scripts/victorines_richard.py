"""Richard of St Victor books from the Corpus Corporum (PL 196). usage: python3 -I victorines_richard.py slug..."""
import sys
sys.path.insert(0, 'research/sourcing/_scripts')
from victorines_lib import *
from victorines_hugh import N, D

C = 'research/sourcing/victorines/cc/w%s.xml'
W = {
 'benjamin-minor': dict(files=['6480'], name=N('Benjamin minor (De praeparatione animi ad contemplationem)', 'Benjamin Minor: The Twelve Patriarchs', 'Benjamin menor: os doze patriarcas'), composed='c. 1153-1162',
   desc=D('Benjamin minor, sive De praeparatione animi ad contemplationem: per historiam filiorum Jacob, ordo virtutum et affectuum quibus anima ad contemplationem praeparatur.',
     'Richard’s treatise on the preparation of the soul for contemplation, read through the story of Jacob’s twelve sons, Rachel and the youngest, Benjamin: how reason and affection are ordered by the virtues before the mind is lifted up. 87 chapters.',
     'O tratado de Ricardo sobre a preparação da alma para a contemplação, lido na história dos doze filhos de Jacó, de Raquel e do caçula Benjamim: como a razão e o afeto são ordenados pelas virtudes antes que o espírito se eleve. 87 capítulos.')),
 'benjamin-major': dict(files=['6479'], name=N('Benjamin major (De gratia contemplationis)', 'Benjamin Major: The Mystical Ark', 'Benjamin maior: a arca mística'), composed='c. 1153-1162',
   desc=D('Benjamin major, sive De gratia contemplationis, in quinque libris: arca mystica et sex genera contemplationis.',
     'Richard’s Grace of Contemplation in five books: the ark of the covenant as the figure of contemplation, its six kinds and the ecstasy of the mind above itself.',
     'A Graça da contemplação de Ricardo em cinco livros: a arca da aliança como figura da contemplação, os seus seis gêneros e o êxtase do espírito acima de si mesmo.')),
 'de-trinitate': dict(files=['6482'], name=N('De Trinitate', 'On the Trinity', 'Sobre a Trindade'), composed='c. 1162-1173',
   desc=D('De Trinitate libri sex: ratione necessaria probatur Deum esse unum et trinum, et personae divinae in charitate perfecta constituuntur.',
     'Richard’s great treatise in six books: from the necessary reasons for God’s existence to the Trinity of persons, where the perfection of charity demands a Father, a Son and a Spirit who is loved by both. The Latin follows Migne’s printing, not the critical text of Ribaillier.',
     'O grande tratado de Ricardo em seis livros: das razões necessárias da existência de Deus à Trindade das pessoas, em que a perfeição da caridade exige um Pai, um Filho e um Espírito amado por ambos.')),
 'de-quatuor-gradibus-violentae-caritatis': dict(files=['6493'], name=N('De quatuor gradibus violentae caritatis', 'On the Four Degrees of Violent Charity', 'Sobre os quatro graus da caridade violenta'), composed='c. 1160-1170',
   desc=D('De quatuor gradibus violentae charitatis: insuperabilis, inseparabilis, singularis, insatiabilis.', 'Richard’s short treatise on four degrees of love that wounds, binds, makes single and cannot be satisfied, taking as its text “I am wounded with charity” (Canticle 2:5).', 'O breve tratado de Ricardo sobre os quatro graus do amor que fere, prende, faz único e não se sacia: “Estou ferida de caridade” (Ct 2,5).')),
 'de-eruditione-hominis-interioris': dict(files=['6487'], name=N('De eruditione hominis interioris', 'On the Instruction of the Inner Man', 'Sobre a instrução do homem interior'), composed='c. 1150-1160',
   desc=D('De eruditione hominis interioris libri tres.', 'Richard’s instruction of the inner man in three books, from Nebuchadnezzar’s dream to the rule of life: self-knowledge, the passions and the ascent to contemplation.', 'A instrução do homem interior em três livros: o sonho de Nabucodonosor, o autoconhecimento, as paixões e a subida à contemplação.')),
 'de-statu-interioris-hominis': dict(files=['6496'], name=N('De statu interioris hominis', 'On the State of the Inner Man', 'Sobre o estado do homem interior'), composed='c. 1150-1160',
   desc=D('De statu interioris hominis tractatus.', 'Richard’s treatise on the state of the inner man after the Fall: free will, counsel, the weakness of fleshly desire and the restoration by grace.', 'O tratado de Ricardo sobre o estado do homem interior depois da queda.')),
 'de-exterminatione-mali': dict(files=['6488'], name=N('De exterminatione mali et promotione boni', 'On the Extermination of Evil and the Promotion of Good', 'Sobre a extinção do mal e a promoção do bem'), composed='c. 1150-1160',
   desc=D('De exterminatione mali et promotione boni, tractatus de confessione criminis et laudis.', 'Richard’s treatise on the confession of sin and the confession of praise, and the two promotions of virtue that follow.', 'O tratado de Ricardo sobre a confissão do pecado e a confissão de louvor.')),
 'opuscula-theologica': dict(files=['6490', '6481', '6483', '6498', '6507', '6508'], titles=['De gradibus charitatis', 'De Emmanuele', 'De Verbo incarnato', 'De tribus appropriatis personis in Trinitate', 'Quomodo Spiritus Sanctus est amor Patris et Filii', 'Sermo de missione Spiritus Sancti'],
   name=N('Opuscula theologica', 'Theological Opuscula', 'Opúsculos teológicos'), composed='c. 1150-1173',
   desc=D('De gradibus charitatis; De Emmanuele; De Verbo incarnato; De tribus appropriatis personis; Quomodo Spiritus Sanctus est amor; Sermo de missione Spiritus Sancti.', 'Richard’s shorter theological works: the degrees of charity, On Emmanuel (against the Jews, in two books), On the Incarnate Word, the three appropriations to the persons of the Trinity, the Holy Spirit as the love of the Father and the Son, and the sermon on the sending of the Spirit.', 'Obras teológicas menores de Ricardo: os graus da caridade, Sobre o Emanuel, o Verbo encarnado, as apropriações às pessoas da Trindade, o Espírito Santo como amor do Pai e do Filho e o sermão sobre a missão do Espírito Santo.')),
 'opuscula-minora': dict(files=['6492', '6491', '6495', '6485', '6489', '6494', '6497', '6486', '6484', '6506', '6499', '6501', '6500'],
   titles=['De potestate ligandi et solvendi', 'De judiciaria potestate in finali et universali judicio', 'De spiritu blasphemiae', 'De differentia peccati mortalis et venialis', 'De gemino paschate', 'De sacrificio David prophetae', 'De superexcellenti baptismo Christi', 'De differentia sacrificii Abrahae a sacrificio beatae Mariae Virginis', 'De comparatione Christi ad florem et Mariae ad virgam', 'Quomodo Christus ponitur in signum populorum', 'Declarationes nonnullarum difficultatum Scripturae', 'Explicatio aliquorum passuum difficilium Apostoli', 'Epistolae et miscellanea'],
   name=N('Opuscula minora', 'Short Treatises and Letters', 'Tratados breves e cartas'), composed='c. 1150-1173',
   desc=D('Opuscula minora Richardi: de potestate ligandi, de judiciaria potestate, de differentia peccati, de gemino paschate, de sacrificio David, expositiones difficilium locorum, epistolae.', 'Richard’s short pieces: on the power of binding and loosing, the judiciary power at the Last Judgment, the sin of blasphemy against the Spirit, mortal and venial sin, the double Passover, David’s sacrifice, the baptism of Christ, Abraham’s sacrifice, comparisons and Scripture difficulties, and letters.', 'Os escritos breves de Ricardo: o poder de ligar e desligar, o poder judiciário, a blasfêmia contra o Espírito, o pecado mortal e venial, a dupla Páscoa, o sacrifício de Davi, o batismo de Cristo, dificuldades da Escritura e cartas.')),
 'adnotationes-in-psalmos': dict(files=['6478'], name=N('Adnotationes mysticae in Psalmos', 'Mystical Notes on the Psalms', 'Anotações místicas sobre os Salmos'), composed='c. 1150-1173',
   desc=D('Adnotationes mysticae in Psalmos.', 'Richard’s mystical notes on a selection of the Psalms.', 'As anotações místicas de Ricardo sobre uma seleção de Salmos.')),
 'in-visionem-ezechielis': dict(files=['6505'], name=N('In visionem Ezechielis', 'On the Vision of Ezekiel', 'Sobre a visão de Ezequiel'), composed='c. 1150-1160',
   desc=D('In visionem Ezechielis: animalia, rotae et templum.', 'Richard’s commentary on Ezekiel’s vision of the living creatures, the wheels and the temple.', 'O comentário de Ricardo à visão de Ezequiel: os viventes, as rodas e o templo.')),
 'de-tabernaculo': dict(files=['6503'], name=N('Expositio de tabernaculo', 'On the Tabernacle', 'Sobre o tabernáculo'), composed='c. 1150-1160',
   desc=D('Expositio difficultatum quarundam in descriptione tabernaculi.', 'Richard’s exposition of the difficulties in the description of the tabernacle: the ark, the cherubim, the table, the lampstand and the curtains.', 'A exposição de Ricardo das dificuldades na descrição do tabernáculo.')),
 'in-apocalypsim': dict(files=['6504'], name=N('In Apocalypsim Joannis', 'On the Apocalypse of John', 'Sobre o Apocalipse de João'), composed='c. 1160-1173',
   desc=D('In Apocalypsim Joannis libri septem.', 'Richard’s commentary in seven books on the Apocalypse of John.', 'O comentário de Ricardo ao Apocalipse de João em sete livros.')),
 'explicatio-in-cantica': dict(files=['6502'], name=N('Explicatio in Cantica canticorum', 'Explanation of the Song of Songs', 'Explicação do Cântico dos Cânticos'), composed='12th century',
   desc=D('Explicatio in Cantica canticorum (Richardo attributa, dubia).', 'The commentary on the first chapters of the Song of Songs that PL attributes to Richard (doubtful), a work on the soul’s ascent through the exemplars of the saints and the angels to the contemplation of God.', 'O comentário aos primeiros capítulos do Cântico dos Cânticos que Migne atribui a Ricardo (duvidoso): a subida da alma pelos exemplos dos santos e dos anjos até a contemplação de Deus.')),
}

def build(slug):
    c = W[slug]; files = [C % f for f in c['files']]
    tree = tree_for(files, c['titles']) if 'titles' in c else build_tree(files[0], c['name']['la'])
    d = write_book('richard', slug, files, c['name'], c['desc'], c['composed'], tree)
    print(slug, count(tree), d)

if __name__ == '__main__':
    for s in sys.argv[1:]: build(s)
