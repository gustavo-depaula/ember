import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import granada_vol14 as g
from granada_lib import *
from cuervo import write_sections
def mk(slug, bid, secs, names3, desc3, composed, work, srcdesc, year=1906):
    write_sections(BASE / slug, "es-ES", g.tidy(secs))
    ids = [c for c, _, _ in g.tidy(secs)]
    quick_book(slug, bid, 14, names3, desc3, composed, [(None, None, ids)], srcdesc, work, year, "Text of the pieces as Cuervo prints them.")
mk("doctrina-espiritual", "granada-doctrina-espiritual", g.ds,
   ("Doctrina espiritual", "Spiritual Doctrine", "Doutrina espiritual"),
   ("Doctrina espiritual repartida en seis tratados (Lisboa 1587): la oración mental con las meditaciones de la semana y de la Pasión, la oración vocal, la confesión, la vida cristiana, la comunión y las tres virtudes teologales.",
    "Spiritual doctrine in six treatises (Lisbon 1587): mental prayer with the meditations of the week and of the Passion, vocal prayer, confession, Christian living, communion and the three theological virtues.",
    "Doutrina espiritual repartida em seis tratados (Lisboa 1587): a oração mental com as meditações da semana e da Paixão, a oração vocal, a confissão, a vida cristã, a comunhão e as três virtudes teologais."),
   "1587", "doctrina-espiritual", "The six treatises of the Doctrina espiritual; Cuervo's variants and tables are not imported.")
mk("discursos-y-sermon", "granada-discursos", g.dc,
   ("Discursos de la Encarnación y de la Pasión; sermón de las caídas públicas", "Discourses on the Incarnation and the Passion; sermon on public falls", "Discursos da Encarnação e da Paixão; sermão das quedas públicas"),
   ("Discurso devoto del misterio de la Encarnación, en diálogo entre san Ambrosio y san Agustín recién convertido; discurso de la Pasión y redención del Salvador; y el sermón en que se da aviso de las caídas públicas.",
    "Devout discourse on the mystery of the Incarnation as a dialogue between St Ambrose and the newly converted St Augustine; the discourse on the Passion and redemption of the Saviour; and the sermon warning of public falls.",
    "Discurso devoto do mistério da Encarnação, em diálogo entre santo Ambrósio e santo Agostinho recém-convertido; o discurso da Paixão e redenção do Salvador; e o sermão de aviso sobre as quedas públicas."),
   "1580s", "discursos", "The Diálogo/Discurso de la Encarnación, the Discurso de la Pasión and redención and the Sermón de las caídas públicas.")
mk("vidas", "granada-vidas", g.vd, ("Vidas de siervos de Dios", "Lives of servants of God", "Vidas de servos de Deus"),
   ("Las vidas escritas por Fray Luis de Granada: del Beato Maestro Juan de Ávila, de Fray Bartolomé de los Mártires, del cardenal-rey Don Enrique de Portugal, de la madre Ana de la Concepción, de doña Elvira de Mendoza y de Melicia Hernández.",
    "The lives written by Fray Luis de Granada: of Blessed Master John of Ávila, of Fray Bartholomew of the Martyrs, of the cardinal-king Henry of Portugal, of Mother Ana de la Concepción, of Doña Elvira de Mendoza and of Melicia Hernández.",
    "As vidas escritas por Frei Luís de Granada: do Beato Mestre João de Ávila, de Frei Bartolomeu dos Mártires, do cardeal-rei Henrique de Portugal, da madre Ana da Conceição, de dona Elvira de Mendoza e de Melícia Hernández."),
   "1588-1590", "vidas", "Six lives. Cuervo's variants and appendix documents are not imported.")
mk("cartas", "granada-cartas", g.cartas, ("Cartas", "Letters", "Cartas"),
   ("Las cartas de Fray Luis de Granada reunidas por Cuervo (a Felipe II y su secretario Zayas, a san Carlos Borromeo, a Juan de Ribera, a los jesuitas Ribadeneira y Guzmán, al General de la Compañía y otros), 1560-1588.",
    "The letters of Fray Luis de Granada gathered by Cuervo (to Philip II and his secretary Zayas, to St Charles Borromeo, to Juan de Ribera, to the Jesuits Ribadeneira and Guzmán, to the General of the Society and others), 1560-1588.",
    "As cartas de Frei Luís de Granada reunidas por Cuervo (a Filipe II e seu secretário Zayas, a são Carlos Borromeu, a João de Ribera, aos jesuítas Ribadeneira e Guzmán, ao Geral da Companhia e outros), 1560-1588."),
   "1560-1588", "cartas", "Letters I-XLV as the OCR gave them.")
