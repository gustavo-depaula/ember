import sys; sys.path.insert(0, 'research/sourcing/_scripts')
from kempis_pair import build
F = 'research/sourcing/kempis/pohl/operaomnia0000thom_q8k7.txt'
def src(w, extra=''):
    return [{'language': 'la', 'url': 'https://archive.org/details/operaomnia0000thom_q8k7', 'edition': 'Thomae Hemerken a Kempis ' + w + ', ed. M. J. Pohl (Freiburg: Herder 1918), Opera omnia IV; archive.org raw OCR (Pohl 1918 volume).',
      'description': 'Chapters as Pohl divides them, with his upper-case chapter titles recased (u/v normalised by script). Line numbers, running heads and page breaks stripped by script; Pohl\'s critical footnotes and introduction are not imported. ' + extra + 'Raw OCR: drop capitals at chapter openings and isolated letters are often garbled; a chapter heading lost to OCR runs two chapters together.', 'tier': 'A', 'tierEvidence': 'Pohl 1918; Thomas died in 1471.'}]
ED = {'la': {'editor': 'Michael Joseph Pohl', 'year': 1918}}
ONLY = sys.argv[1:]


def one(id_, slug, la, en, pt, dla, den, dpt, comp, w, start, end, extra=''):
    if ONLY and slug not in ONLY:
        return
    build({'id': 'kempis-' + id_, 'slug': slug, 'work': slug, 'name': {'la': la, 'en-US': en, 'pt-BR': pt},
      'description': {'la': dla, 'en-US': den + ' Latin only: Pohl\'s critical edition (Freiburg 1918), from a raw OCR of the printed volume; no public-domain English translation has been found.', 'pt-BR': dpt},
      'composed': comp, 'editions': ED, 'sources': src(w, extra), 'groups': [{'la': ''}],
      'la': {'file': F, 'start': start, 'end': end, 'marker': r'CAPITVLVM', 'title_before': True}})
one('epitaphium-monachorum', 'epitaphium-monachorum', 'Epitaphium monachorum', 'The Epitaph of Monks', 'O Epitáfio dos Monges',
    'Breve epitaphium monachorum: capitula de recta via iustorum ad regnum caelorum, de custodia cordis, de invocatione nominis Iesu et Mariae, de consolatione animae et aliis.',
    'A short book on the narrow way of the just to the kingdom of heaven: guarding the heart, calling on the names of Jesus and Mary, the soul\'s true consolation, silence, the cleansing of the heart.',
    'Breve livro sobre o caminho reto dos justos para o reino dos céus: a guarda do coração, a invocação dos nomes de Jesus e Maria, a verdadeira consolação da alma, o silêncio.', 'c. 1430-1440', 'Epitaphium monachorum', 5829, 6257)
one('vita-boni-monachi', 'vita-boni-monachi', 'Vita boni monachi', 'The Life of a Good Monk', 'A Vida do Bom Monge',
    'Libellus de vita boni monachi: de remediis vitiorum, de exemplis eremitarum, de patientia martyrum, de studio doctorum, de labore et oratione, de corona et praemio.',
    'A booklet for the good monk: remedies against vice, the examples of the hermits, the patience of the martyrs, the zeal of the doctors, labour and prayer, the crown and reward.',
    'Livrinho para o bom monge: remédios contra os vícios, exemplos dos eremitas, paciência dos mártires, zelo dos doutores, trabalho e oração, coroa e prêmio.', 'c. 1430-1440', 'Vita boni monachi', 6308, 6621)
one('manuale-parvulorum', 'manuale-parvulorum', 'Manuale parvulorum', 'The Manual for Little Ones', 'O Manual dos Pequenos',
    'Liber qui dicitur Manuale parvulorum: quindecim capitula de vocatione parvulorum ad Christum, de humilitate et puritate, de oratione et custodia cordis, de praemio vitae aeternae.',
    'Fifteen chapters for beginners in the spiritual life: the call of the little ones to Christ, humility and purity, the good use of the imagination, prayer, the guarding of the heart and the reward of eternal life.',
    'Quinze capítulos para os principiantes na vida espiritual: o chamado dos pequenos a Cristo, humildade e pureza, oração, guarda do coração e o prêmio da vida eterna.', 'c. 1425-1440', 'Manuale parvulorum', 6708, 7397)
one('doctrinale-iuvenum', 'doctrinale-iuvenum', 'Doctrinale iuvenum', 'The Doctrine for Young Men', 'A Doutrina dos Jovens',
    'Libellus qui dicitur Doctrinale iuvenum: de sacra Scriptura, de clerico et laico, de bonis scriptoribus et libris, de cantu ecclesiae, de superbo et pigro fratre, de desiderio caelestium.',
    'Counsel for young religious: the reading of Scripture, the difference between cleric and layman, good copyists and the care of books, church song, the proud and the slothful brother, the desire of heaven.',
    'Conselhos para jovens religiosos: a leitura da Escritura, clérigo e leigo, bons copistas e o cuidado dos livros, o canto da Igreja, o irmão soberbo e o preguiçoso, o desejo do céu.', 'c. 1425-1440', 'Doctrinale iuvenum', 7447, 8259)
one('hospitale-pauperum', 'hospitale-pauperum', 'Hospitale pauperum', 'The Hospice of the Poor', 'O Hospício dos Pobres',
    'Tractatulus dictus Hospitale pauperum: capitula de contemptu bonorum mundanorum, de paupertate spiritus, de patientia et de consolatione pauperum Christi.',
    'A treatise for the poor of Christ: contempt of worldly goods, poverty of spirit, patience and the comfort of the poor, drawn chiefly from the Psalms.',
    'Tratado para os pobres de Cristo: desprezo dos bens do mundo, pobreza de espírito, paciência e consolação, tirado sobretudo dos Salmos.', 'c. 1425-1440', 'Hospitale pauperum', 8318, 9918)
one('de-solitudine-et-silentio', 'de-solitudine-et-silentio', 'De solitudine et silentio (Epistola de recommendatione solitudinis)', 'On Solitude and Silence', 'Da solidão e do silêncio',
    'Epistola ad quendam a ministerio suo absolutum de recommendatione solitudinis et silentii, per capitula.',
    'A long letter to a brother just relieved of his office, in praise of solitude and silence: the quiet cell, guarding the tongue and the heart, reading, prayer and the company of God.',
    'Longa carta a um irmão recém-dispensado de seu ofício, em louvor da solidão e do silêncio: a cela tranquila, a guarda da língua e do coração, a leitura, a oração e a companhia de Deus.', 'c. 1425-1440', 'De solitudine et silentio', 19182, 21217)
if not ONLY or 'epistulae' in ONLY: build({'id': 'kempis-epistulae', 'slug': 'epistulae', 'work': 'epistulae', 'name': {'la': 'Epistulae', 'en-US': 'Letters', 'pt-BR': 'Cartas'},
  'description': {'la': 'Quinque epistulae Thomae a Kempis: ad spiritualem profectum, de custodia sui, pro confortatione temptati, de conversione et perseverantia, de pia memoria defunctorum.',
   'en-US': 'Five spiritual letters: on progress, on self-watchfulness, to console someone tempted, on conversion and perseverance, and on the pious remembrance of the dead. Latin only: Pohl\'s critical edition (Freiburg 1918), from a raw OCR of the printed volume; no public-domain English translation has been found.',
   'pt-BR': 'Cinco cartas espirituais: sobre o progresso, a vigilância de si, a consolação do tentado, a conversão e perseverança, e a memória piedosa dos defuntos.'},
  'composed': 'c. 1425-1450', 'editions': ED, 'sources': src('Epistulae'), 'groups': [{'la': ''}],
  'la': {'file': F, 'start': 21250, 'end': 22685, 'marker': r'INCIPIT EPISTVLA', 'no_title': True,
         'titles': {0: 'Epistula incitativa ad spiritualem profectum', 1: 'Epistula de custodia habenda ad se ipsum', 2: 'Epistula pro confortatione cuiusdam temptati', 3: 'Epistula de conversione et perseverantia in bono proposito', 4: 'Epistula de pia memoria defunctorum'}}})
