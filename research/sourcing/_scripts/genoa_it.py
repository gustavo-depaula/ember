import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gen import emit
L = [l.strip() for l in open('/Users/gustavo/Documents/prayer/research/sourcing/catherine-of-genoa/raw/dco_purg.txt').read().split('\n') if l.strip()]
L = [l for l in L if not l.startswith('PAGE ')]
i0 = next(i for i, l in enumerate(L) if re.match(r'^I\. - ', l) and 'II. - ' not in l)
pre = L[3:i0]
heads = [i for i in range(i0, len(L)) if re.match(r'^[IVXL]+\. - ', L[i])]
RO = lambda n: ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX'][n]
ch = [('proemio', {'it': ('Proemio', '\n\n'.join(pre))})]
for k, h in enumerate(heads):
    e = heads[k + 1] if k + 1 < len(heads) else len(L)
    title = re.sub(r'^[IVXL]+\. - ', '', L[h]).rstrip('. ')
    t = L[h].split(' - ', 1)
    m = re.match(r'^([IVXL]+)\. - (.*?\.)\s*(.*)$', L[h])
    head, rest = m.group(2), m.group(3)
    body = ([rest] if rest else []) + L[h + 1:e]
    out = []
    for p in body:
        if p[:1].islower() and out: out[-1] += ' ' + p
        else: out.append(p)
    ch.append(('c%02d' % (k + 1), {'it': ('Capitolo %s. %s' % (RO(k), head.rstrip('.')), '\n\n'.join(out))}))
META = {'id': 'catherine-genoa-trattato-purgatorio', 'cover': 'classic',
 'name': {'it': 'Trattato del Purgatorio', 'en-US': 'Treatise on Purgatory', 'pt-BR': 'Tratado do Purgatório'},
 'author': {'it': 'Santa Caterina da Genova', 'en-US': 'St. Catherine of Genoa', 'pt-BR': 'Santa Catarina de Gênova'},
 'description': {'it': 'Il Trattato del Purgatorio di santa Caterina da Genova (1447-1510): il fuoco divino che ella sentiva in sé le fece comprendere lo stato delle anime del Purgatorio, contente nella pena, consumate dall’amore di Dio e desiderose solo di essere interamente purificate. In diciannove capitoli, nella lezione modernizzata di Documenta Catholica Omnia, di cui non è indicata l’edizione.',
  'en-US': 'The Treatise on Purgatory of St. Catherine of Genoa (1447-1510): the divine fire she felt in herself made her understand the state of the souls in purgatory, content in their suffering, consumed with the love of God and wishing only to be wholly purified. In nineteen chapters, in the modernised Italian of Documenta Catholica Omnia, which does not name its edition. The English translation of 1874 has seventeen chapters and is a separate book.',
  'pt-BR': 'O Tratado do Purgatório de santa Catarina de Gênova (1447-1510): o fogo divino que ela sentia em si a fez compreender o estado das almas do purgatório, contentes na pena, consumidas pelo amor de Deus e desejosas apenas de serem inteiramente purificadas. Em dezenove capítulos.'},
 'composed': '1551 (first printed)', 'languages': ['it'], 'work': 'catherine-of-genoa/trattato-del-purgatorio',
 'editions': {'it': {'editor': 'Anonymous modernised edition (Documenta Catholica Omnia)', 'year': 1900}},
 'sources': [{'language': 'it', 'url': 'https://www.documentacatholicaomnia.eu/03d/1447-1510,_Caterina_da_Genova,_Trattato_Sul_Purgatorio,_IT.doc',
  'edition': 'Santa Caterina da Genova, Trattato del Purgatorio, modernised Italian in 19 chapters with modern chapter titles, Documenta Catholica Omnia (Word file; the printed edition is not named).',
  'description': 'Proemio and chapters I-XIX with their titles and numbered paragraphs; converted from the .doc file and joined where the file broke a paragraph. Not collated with the 1743 Comino print (https://archive.org/details/wotb_6743872), whose long-s OCR is too poor to settle variants.',
  'tier': 'A', 'tierEvidence': 'Catherine died in 1510; the text is her 16th-century treatise in a modernised older edition, offered freely on Documenta Catholica Omnia.'}]}
print(emit('/Users/gustavo/Documents/prayer/content/books/catherine-of-genoa-opera-omnia/trattato-del-purgatorio', META, ch))
