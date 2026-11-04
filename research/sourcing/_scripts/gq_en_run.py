import sys, subprocess, re
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gq_en_build import *
V = {
 1: ('01-advent', 'Advent', 'Advent', 'Advento', 1841),
 2: ('02-christmas-1', 'Christmas, Book I', 'Christmas, Book I', 'Natal, I', 1853),
 3: ('03-christmas-2', 'Christmas, Book II', 'Christmas, Book II', 'Natal, II', 1853),
 4: ('04-septuagesima', 'Septuagesima', 'Septuagesima', 'Septuagésima', 1855),
 5: ('05-lent', 'Lent', 'Lent', 'Quaresma', 1857),
 6: ('06-passiontide', 'Passiontide and Holy Week', 'Passiontide and Holy Week', 'Paixão e Semana Santa', 1858),
 7: ('07-paschal-1', 'Paschal Time, Book I', 'Paschal Time, Book I', 'Tempo pascal, I', 1864),
 8: ('08-paschal-2', 'Paschal Time, Book II', 'Paschal Time, Book II', 'Tempo pascal, II', 1865),
 9: ('09-paschal-3', 'Paschal Time, Book III', 'Paschal Time, Book III', 'Tempo pascal, III', 1866),
 10: ('10-after-pentecost-1', 'Time after Pentecost, Book I', 'Time after Pentecost, Book I', 'Tempo depois de Pentecostes, I', 1878),
 11: ('11-after-pentecost-2', 'Time after Pentecost, Book II', 'Time after Pentecost, Book II', 'Tempo depois de Pentecostes, II', 1883),
 12: ('12-after-pentecost-3', 'Time after Pentecost, Book III', 'Time after Pentecost, Book III', 'Tempo depois de Pentecostes, III', 1886),
 13: ('13-after-pentecost-4', 'Time after Pentecost, Book IV', 'Time after Pentecost, Book IV', 'Tempo depois de Pentecostes, IV', 1890),
 14: ('14-after-pentecost-5', 'Time after Pentecost, Book V', 'Time after Pentecost, Book V', 'Tempo depois de Pentecostes, V', 1897),
 15: ('15-after-pentecost-6', 'Time after Pentecost, Book VI', 'Time after Pentecost, Book VI', 'Tempo depois de Pentecostes, VI', 1901),
}
for v in map(int, sys.argv[1:]):
    folder, en, _, pt, comp = V[v]
    f = 'liturgicalyear02gura.txt' if v == 2 else f'V{v:02d}TheLiturgicalYear.txt'
    B, toc, w = build_en(f, folder + '-en', None, v, None, None, None, None, None)
    head = ' '.join(open(IA + f, errors='replace').read(20000).split())
    yrs = [int(y) for y in re.findall(r'\b(18[6-9]\d|19[01]\d)\b', head)]
    year = max(yrs) if yrs else 1900
    trans = 'Rev. Dom Laurence Shepherd (Stanbrook Abbey)' if v <= 12 else 'Benedictines of Stanbrook'
    name = {'en-US': 'The Liturgical Year: ' + en, 'pt-BR': 'O Ano Litúrgico: ' + pt}
    d = {'id': 'gueranger-liturgical-year-' + folder, 'name': name,
         'author': {'en-US': 'Dom Prosper Guéranger', 'pt-BR': 'Dom Prosper Guéranger'},
         'description': {'en-US': f'Volume {v} of the English Liturgical Year ({en}), translated from L’Année liturgique: one chapter per day or feast, with the Latin liturgical texts beside their English. Made from the Internet Archive scan of the {year} printing; the two-column Latin and English text is separated by script, so some lines may be misassigned.', 'pt-BR': f'Volume {v} do «Liturgical Year» em inglês ({pt}), traduzido de L’Année liturgique: um capítulo por dia ou festa, com os textos litúrgicos em latim ao lado do inglês.'},
         'composed': str(comp), 'languages': ['en-US'], 'work': 'gueranger/annee-liturgique',
         'editions': {'en-US': {'translator': trans, 'year': year}},
         'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/' + ('liturgicalyear02gura' if v == 2 else f'V{v:02d}TheLiturgicalYear'), 'edition': f'The Liturgical Year, {en}, translated from the French of Dom Prosper Guéranger; printing of {year} (Stanbrook Abbey / Duffy). Internet Archive scan, OCR text.', 'description': 'Split at each day or feast heading detected in the running text; running heads and page numbers removed; the Latin and English columns of the liturgical texts, interleaved line by line in the OCR, were separated by language and set as a Latin paragraph followed by its English.', 'tier': 'A', 'tierEvidence': 'Guéranger (d. 1875) and the translation printed 1870-1912: public domain.'}],
         'toc': [{'id': i, 'title': {'en-US': t}} for i, t in toc]}
    bookjson.write(B, d)
    r = subprocess.run(['python3', ROOT + 'scripts/check-book.py', B], capture_output=True, text=True, cwd=ROOT)
    print(folder, len(toc), w, r.returncode, r.stdout[-400:].strip(), r.stderr[-200:])
