import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gen import emit
from ws_md import convert
p, n = convert('/Users/gustavo/Documents/prayer/research/sourcing/catherine-of-siena/ws/orazione.json')
p = [x.replace('Spinto Santo', 'Spirito Santo') for x in p if x not in ('Note', 'ORAZIONE')]
title = p[0].rstrip('.').capitalize() if p[0].isupper() else p[0]
body = p[1:]
used = sorted(set(re.findall(r'\[\^(\d+)\]', ' '.join(body))), key=int)
txt = '\n\n'.join(body) + '\n\n' + '\n\n'.join(f'[^{k}]: {n[k]}' for k in used if k in n)
META = {'id': 'catherine-orazione-burlamacchi', 'cover': 'classic',
 'name': {'it': 'Orazione di santa Caterina da Siena (edizione Burlamacchi)', 'en-US': 'A Prayer of St. Catherine of Siena (Burlamacchi edition)', 'pt-BR': 'Oração de santa Catarina de Sena (edição Burlamacchi)'},
 'author': {'it': 'Santa Caterina da Siena', 'en-US': 'St. Catherine of Siena', 'pt-BR': 'Santa Catarina de Sena'},
 'description': {'it': 'L’orazione allo Spirito Santo che santa Caterina da Siena scrisse di propria mano, con la lunga nota storica del curatore Burlamacchi (Milano 1842) sulle sue redazioni. Non sono ancora importate le ventisei Orazioni dettate ai segretari, per le quali non c’è un testo digitale pulito.',
   'en-US': 'The prayer to the Holy Spirit that St. Catherine of Siena wrote in her own hand, with the editor Burlamacchi’s long historical note (Milan 1842) on its versions. The twenty-six Orazioni she dictated to her secretaries are not yet imported: no clean digital text exists.',
   'pt-BR': 'A oração ao Espírito Santo que santa Catarina de Sena escreveu de próprio punho, com a longa nota histórica do editor Burlamacchi (Milão 1842).'},
 'composed': '1370-1380', 'languages': ['it'], 'work': 'catherine-of-siena/orazioni',
 'editions': {'it': {'editor': 'Francesco Burlamacchi (Epistole, Milano: Pirotta)', 'year': 1842}},
 'sources': [{'language': 'it', 'url': 'https://it.wikisource.org/wiki/Epistole_(Caterina_da_Siena)/Orazione', 'edition': 'Epistole di S. Caterina da Siena, ed. Burlamacchi, Milano: Pirotta 1842, tomo I, Orazione. Italian Wikisource transcription.',
  'description': 'The prayer and the editor’s note with its footnotes. Only this one prayer is available as clean text; the 26 Orazioni (Cavallini numbering) exist only in Gigli 1707 vol. IV scans.',
  'tier': 'A', 'tierEvidence': 'The 1842 printing of a 14th-century text is public domain everywhere.'}]}
print(emit('/Users/gustavo/Documents/prayer/content/books/catherine-of-siena-opera-omnia/orazione-burlamacchi', META, [('orazione', {'it': ('Orazione che ella di propria mano scrisse di cinabro', txt)})]))
