import sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts/migne')
from mkbook import *
SRC = {'language': 'fr-FR', 'url': 'https://archive.org/details/oeuvrescompl00br', 'edition': 'Œuvres complètes du cardinal de Bérulle, éd. Migne, Paris, 1856 (reprint of Bourgoing’s 1644 collected edition); archive.org OCR (ABBYY) of the Toronto copy.',
       'description': 'Machine-cleaned OCR: running heads, page numbers and hyphenation removed, paragraphs rejoined, obvious character errors corrected by a vote against the corpus vocabulary. Residual OCR errors, merged columns and some chapter openings the scan lost remain (see PROBLEMS.md).', 'tier': 'A', 'tierEvidence': 'Bérulle died in 1629; the 1856 edition is public domain.'}
B = ROOT / 'content/books/berulle-opera-omnia'
def ed(year=1856): return {'fr-FR': {'editor': 'Jacques-Paul Migne', 'year': year}}
def tr(fr, en, pt): return {'fr-FR': fr, 'en-US': en, 'pt-BR': pt}
BOOKS = {
 'grandeurs-de-jesus': dict(bid='berulle-grandeurs-de-jesus', work='berulle/grandeurs-de-jesus', composed=1623,
   name=tr('Discours de l’état et des grandeurs de Jésus', 'Discourses on the State and Grandeurs of Jesus', 'Discursos sobre o estado e as grandezas de Jesus'),
   desc=tr('Le chef-d’œuvre de Bérulle (1623) : douze discours sur le mystère de l’Incarnation, l’unité de Dieu et les trois naissances de Jésus, précédés de la dédicace, des approbations et de la préface.',
     'Bérulle’s masterpiece (1623): twelve discourses on the mystery of the Incarnation, the unity of God and the three births of Jesus, preceded by the dedication, the approbations and the preface.',
     'A obra-prima de Bérulle (1623): doze discursos sobre o mistério da Encarnação, a unidade de Deus e os três nascimentos de Jesus, precedidos da dedicatória, das aprovações e do prefácio.')),
 'vie-de-jesus': dict(bid='berulle-vie-de-jesus', work='berulle/vie-de-jesus', composed=1629,
   name=tr('Vie de Jésus', 'Life of Jesus', 'Vida de Jesus'),
   desc=tr('La Vie de Jésus (1629), inachevée : dédicace au roi, préambule sur l’état de Jésus avant sa naissance, puis les chapitres sur l’Annonciation et l’Incarnation.',
     'The unfinished Life of Jesus (1629): dedication to the king, a preamble on the state of Jesus before his birth, then the chapters on the Annunciation and the Incarnation.',
     'A Vida de Jesus (1629), inacabada: dedicatória ao rei, preâmbulo sobre o estado de Jesus antes de nascer e depois os capítulos sobre a Anunciação e a Encarnação.')),
 'elevation-sainte-madeleine': dict(bid='berulle-elevation-sainte-madeleine', work='berulle/elevation-sainte-madeleine', composed=1627,
   name=tr('Élévation à Jésus-Christ sur la conduite de sa grâce vers sainte Madeleine', 'Elevation to Jesus Christ on the Conduct of His Grace toward St. Mary Magdalene', 'Elevação a Jesus Cristo sobre a conduta de sua graça para com santa Madalena'),
   desc=tr('Vingt chapitres (1627), dédiés à la reine Henriette d’Angleterre, sur la conversion, l’amour et la pénitence de sainte Madeleine, suivis des Observations sur le texte de saint Luc.',
     'Twenty chapters (1627), dedicated to Queen Henrietta Maria of England, on the conversion, love and penance of St. Mary Magdalene, followed by the Observations on St. Luke’s text.',
     'Vinte capítulos (1627), dedicados à rainha Henriqueta Maria da Inglaterra, sobre a conversão, o amor e a penitência de santa Madalena, seguidos das Observações sobre o texto de são Lucas.')),
}
def make_book(slug, **over):
    s = dict(BOOKS[slug]); s.update(over)
    return make(B / slug, s['bid'], s['work'], s['name'], tr(*[BERULLE_AUTHOR[k] for k in ('fr-FR', 'en-US', 'pt-BR')]), s['desc'], s['composed'], ed(), [SRC], order=s.get('order'))
if __name__ == '__main__':
    for slug in sys.argv[1:]:
        print(slug, make_book(slug))
