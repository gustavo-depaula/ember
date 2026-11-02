"""Remaining Victorine Latin books from the Corpus Corporum. usage: python3 -I victorines_more.py slug..."""
import sys
sys.path.insert(0, 'research/sourcing/_scripts')
from victorines_lib import *
from victorines_hugh import N, D
C = 'research/sourcing/victorines/cc/w%s.xml'
W = {
 'miscellanea': ('hugh', dict(files=['6053'], name=N('Miscellanea', 'Miscellanea', 'Miscelânea'), composed='12th century',
   desc=D('Miscellaneorum libri quinque: elucidationes variae in Scripturam, sententiae et quaestiones (partim Hugonis).', 'The five books of the Miscellanea printed in PL 177 under Hugh’s name: biblical elucidations, sentences and questions, collected by the Victorine school and only partly Hugh’s own.', 'Os cinco livros da Miscelânea impressos por Migne sob o nome de Hugo: elucidações bíblicas, sentenças e questões reunidas pela escola de São Vítor, apenas em parte de Hugo.'))),
 'opuscula-dubia': ('hugh', dict(files=['793', '794', '6028'], titles=['De septem vitiis et septem donis', 'De substantia dilectionis', 'De modo dicendi et meditandi'],
   name=N('Opuscula dubia', 'Doubtful Opuscula', 'Opúsculos duvidosos'), composed='12th century',
   desc=D('De septem vitiis et septem donis; De substantia dilectionis; De modo dicendi et meditandi (Hugoni attributa, incerta).', 'Three short pieces which PL gives to Hugh and Corpus Corporum files as uncertain: On the Seven Vices and the Seven Gifts, On the Substance of Love and On the Way of Speaking and Meditating.', 'Três peças breves que Migne atribui a Hugo e que o Corpus Corporum considera incertas: os sete vícios e os sete dons, a substância do amor e o modo de falar e meditar.'))),
 'liber-exceptionum-pars-ii': ('richard', dict(files=['6013'], name=N('Liber exceptionum, pars secunda (Posteriores excerptiones)', 'Book of Excerpts, Part Two (Posteriores excerptiones)', 'Livro das exceções, segunda parte'), composed='c. 1160-1170',
   desc=D('Posteriores excerptiones, quas Migne Hugoni tribuit; revera pars secunda Liberi exceptionum Richardi: de sacra Scriptura, historia et allegoria.', 'The second part of Richard’s Liber exceptionum, which Migne prints as Hugh’s Posteriores excerptiones: a long course in the literal and allegorical sense of Scripture, from Genesis on.', 'A segunda parte do Liber exceptionum de Ricardo, que Migne imprime como Posteriores excerptiones de Hugo: um longo curso do sentido literal e alegórico da Escritura, a partir do Gênesis.'))),
 'contra-quatuor-labyrinthos': ('walter', dict(files=['6529'], name=N('Contra quatuor labyrinthos Franciae', 'Against the Four Labyrinths of France', 'Contra os quatro labirintos da França'), composed='c. 1179',
   desc=D('Excerpta ex libris Gualteri contra quatuor labyrinthos Franciae (Abaelardum, Lombardum, Petrum Pictavinum, Gilbertum Porretanum).', 'Walter of St. Victor’s polemic against Abelard, Peter Lombard, Peter of Poitiers and Gilbert of Poitiers as the four labyrinths of France, in the excerpts printed by Migne from Du Boulay.', 'A polêmica de Gualtério de São Vítor contra Abelardo, Pedro Lombardo, Pedro de Poitiers e Gilberto de Poitiers, os quatro labirintos da França, nos excertos impressos por Migne.'))),
 'victorine-epistolae': ('victorines', dict(files=['6465', '6468', '6469', '6470', '6477', '6285'], titles=['Epistolae Achardi', 'Epistolae Ervisii abbatis', 'Epistolae Gilduini abbatis', 'Epistolae Guarini abbatis', 'Epistolae Odonis', 'Epitaphium Adami'],
   name=N('Epistolae Victorinorum et epitaphium Adami', 'Letters of the Victorines and the Epitaph of Adam', 'Cartas dos vitorinos e epitáfio de Adão'), composed='12th century',
   desc=D('Epistolae Achardi, Ervisii, Gilduini, Guarini et Odonis, canonicorum abbatumque S. Victoris, et Epitaphium Adami.', 'The letters of Achard, Ervisius, Gilduin, Guarin and Odo of St. Victor from PL, with the epitaph of Adam.', 'As cartas de Achard, Ervísio, Gilduíno, Guarino e Odo de São Vítor, com o epitáfio de Adão.'))),
}
def build(slug):
    author, c = W[slug]; files = [C % f for f in c['files']]
    tree = tree_for(files, c['titles']) if 'titles' in c else build_tree(files[0], c['name']['la'])
    d = write_book(author, slug, files, c['name'], c['desc'], c['composed'], tree)
    print(slug, count(tree), d)
if __name__ == '__main__':
    for s in sys.argv[1:]: build(s)
