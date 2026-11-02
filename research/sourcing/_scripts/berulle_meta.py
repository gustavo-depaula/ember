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

def _b(bid, work, composed, name, desc):
    return dict(bid=bid, work=work, composed=composed, name=name, desc=desc)
BOOKS.update({
 'elevations': dict(_b('berulle-elevations', 'berulle/elevations', 1620, tr('Élévations', 'Elevations', 'Elevações'),
   tr('Trois élévations à Jésus, à la Trinité et à Dieu sur la part de Marie dans le mystère de l’Incarnation, et l’oraison à la Vierge.', 'Three elevations to Jesus, to the Trinity and to God on Mary’s part in the mystery of the Incarnation, and the prayer to the Virgin.', 'Três elevações a Jesus, à Trindade e a Deus sobre a parte de Maria no mistério da Encarnação, e a oração à Virgem.')), order=['elevation-a-jesus', 'elevation-trinite', 'elevation-part', 'oraison']),
 'voeux-de-servitude': dict(_b('berulle-voeux-de-servitude', 'berulle/voeux-de-servitude', 1620, tr('Vœux de servitude à Jésus et à Marie', 'Vows of Servitude to Jesus and Mary', 'Votos de servidão a Jesus e a Maria'),
   tr('Le narré des vœux de servitude, le vœu à Dieu, le vœu à Marie et les approbations qui les accompagnent.', 'The account of the vows of servitude, the vow to God, the vow to Mary and the approbations that go with them.', 'O relato dos votos de servidão, o voto a Deus, o voto a Maria e as aprovações que os acompanham.')), order=['voeux-a', 'voeu-a-dieu', 'voeu-a-marie', 'approbations']),
 'controverse': dict(_b('berulle-controverse', 'berulle/controverse', 1609, tr('Œuvres de controverse', 'Works of Controversy', 'Obras de controvérsia'),
   tr('Les discours de controverse (mission des pasteurs, sacrifice de la messe, présence réelle), les discours sur l’Eucharistie et les opuscules contre les hérétiques.', 'The controversy discourses (the mission of pastors, the sacrifice of the Mass, the real presence), the discourses on the Eucharist and the minor writings against the heretics.', 'Os discursos de controvérsia (missão dos pastores, sacrifício da missa, presença real), os discursos sobre a Eucaristia e os opúsculos contra os hereges.')), order=['controverse', 'eucharistie-avis', 'eucharistie', 'opuscules']),
 'memorial-de-direction': dict(_b('berulle-memorial-de-direction', 'berulle/memorial-de-direction', 1626, tr('Mémorial de direction pour les supérieurs', 'Memorial of Direction for Superiors', 'Memorial de direção para os superiores'),
   tr('Les avis de Bérulle aux supérieurs de l’Oratoire sur la conduite de leur charge.', 'Bérulle’s counsel to the superiors of the Oratory on the conduct of their office.', 'Os conselhos de Bérulle aos superiores do Oratório sobre o exercício do cargo.'))),
 'traite-des-energumenes': dict(_b('berulle-traite-des-energumenes', 'berulle/traite-des-energumenes', 1599, tr('Traité des énergumènes', 'Treatise on the Possessed', 'Tratado dos energúmenos'),
   tr('Le traité de 1599 sur la possession diabolique, son discernement et ses remèdes.', 'The 1599 treatise on diabolical possession, its discernment and its remedies.', 'O tratado de 1599 sobre a possessão diabólica, seu discernimento e seus remédios.'))),
 'oeuvres-de-piete': dict(_b('berulle-oeuvres-de-piete', 'berulle/oeuvres-de-piete', 1597, tr('Œuvres de piété', 'Works of Piety', 'Obras de piedade'),
   tr('Le Bref discours de l’abnégation intérieure (1597) et les quelque deux cents opuscules de piété rassemblés par Bourgoing : méditations sur les mystères, la Vierge, l’Eucharistie, direction et vie de l’Oratoire.', 'The Brief Discourse on Interior Abnegation (1597) and the two hundred or so opuscules of piety gathered by Bourgoing: meditations on the mysteries, the Virgin, the Eucharist, direction and the life of the Oratory.', 'O Breve discurso sobre a abnegação interior (1597) e os cerca de duzentos opúsculos de piedade reunidos por Bourgoing: meditações sobre os mistérios, a Virgem, a Eucaristia, direção e vida do Oratório.')), order=['abnegation', 'opuscules']),
 'lettres': dict(_b('berulle-lettres', 'berulle/lettres', '1604–1629', tr('Lettres', 'Letters', 'Cartas'),
   tr('Les lettres de Bérulle imprimées par Migne : aux carmélites, aux Pères de l’Oratoire, à diverses personnes, sur le mariage d’Henriette de France, et des fragments.', 'Bérulle’s letters as printed by Migne: to the Carmelite nuns, to the Fathers of the Oratory, to various people, on the marriage of Henrietta Maria, and fragments.', 'As cartas de Bérulle impressas por Migne: às carmelitas, aos Padres do Oratório, a diversas pessoas, sobre o casamento de Henriqueta Maria, e fragmentos.')), order=['carmelites', 'oratoire', 'diverses', 'mariage', 'fragments']),
 'reglement-et-office-de-l-oratoire': dict(_b('berulle-reglement-oratoire', 'berulle/reglement-oratoire', 1613, tr('Règlement de l’Oratoire et Office de Jésus', 'Rule of the Oratory and Office of Jesus', 'Regra do Oratório e Ofício de Jesus'),
   tr('Le Règlement de la Congrégation de l’Oratoire de Jésus et l’office latin de la fête de Jésus.', 'The Rule of the Congregation of the Oratory of Jesus and the Latin office for the feast of Jesus.', 'A Regra da Congregação do Oratório de Jesus e o ofício latino da festa de Jesus.')), order=['reglement', 'office']),
})

def make_book(slug, **over):
    s = dict(BOOKS[slug]); s.update(over)
    return make(B / slug, s['bid'], s['work'], s['name'], tr(*[BERULLE_AUTHOR[k] for k in ('fr-FR', 'en-US', 'pt-BR')]), s['desc'], s['composed'], ed(), [SRC], order=s.get('order'))
if __name__ == '__main__':
    for slug in sys.argv[1:]:
        print(slug, make_book(slug))
