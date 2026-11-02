"""Latin of Bernard's Sermones super Cantica canticorum from CC (Migne PL 183)."""
import re, sys
sys.path.insert(0, 'research/sourcing/_scripts')
from bernard_common import cc_sections, roman

def sermons(path='research/sourcing/bernard-of-clairvaux/cc/cantica.xml'):
    out = []
    for s in cc_sections(path):
        h = s['head']
        m = re.match(r'SERMON? ([IVXLC]+)\.?\s*(.*)$', h)
        if m:
            n = len(out) + 1
            assert roman(n) == m.group(1), (n, h)
            t = re.sub(r'\*', '', m.group(2)).strip()
            t = re.sub(r'\s+([.,;:»])', r'\1', t)
            out.append({'n': n, 'title': 'Sermo %s. %s' % (m.group(1), t.rstrip('.')), 'secs': [], 'cur': None})
            cur = out[-1]; cur['paras_by_num'] = []; continue
        if not out: continue
        out[-1]['secs'].append((h, s['paras']))
    return out

import json, shutil
from pathlib import Path

SRC = Path('research/sourcing/bernard-of-clairvaux')
ROOT = Path('content/books/bernard-opera-omnia')
AUTHOR = {'la': 'Bernardus Claraevallensis', 'en-US': 'St. Bernard of Clairvaux', 'pt-BR': 'São Bernardo de Claraval'}

def write(p, t):
    p.parent.mkdir(parents=True, exist_ok=True); p.write_text(t, encoding='utf-8')

def main():
    d = ROOT / 'sermones-super-cantica'
    if d.exists(): shutil.rmtree(d)
    toc = []
    for s in sermons():
        paras = []
        for h, ps in s['secs']:
            if h.startswith('ADMONITIO'):
                continue
            paras += ps
        n = s['n']
        if n == 64:
            # Mabillon's note on the Evervin letter, printed after this sermon
            adm = [x for h, ps in s['secs'] if h.startswith('ADMONITIO') for x in ps]
            paras += [re.sub(r'\*', '', a).join('**') if False else a for a in adm]
        t = re.sub(r'«\s+', '«', s['title'])
        cid = 's%02d' % n
        write(d / 'la' / (cid + '.md'), '# %s\n\n%s\n' % (t, '\n\n'.join(paras)))
        toc.append({'id': cid, 'title': {'la': t}})
    write(d / 'sources/latin-originals/sermones-super-cantica.xml', (SRC / 'cc/cantica.xml').read_text(encoding='utf-8'))
    meta = {'id': 'bernard-sermones-super-cantica', 'cover': 'classic',
      'name': {'la': 'Sermones super Cantica canticorum', 'en-US': 'Sermons on the Song of Songs', 'pt-BR': 'Sermões sobre o Cântico dos Cânticos'},
      'author': AUTHOR,
      'description': {
        'la': 'Octoginta et sex sermones quos Bernardus in capitulo Claraevallensi habuit, ab anno circiter 1135 usque ad mortem suam, de primis duobus Cantici capitibus: opus mysticum de unione animae cum Verbo. Textus ex editione Mabillonii in Migne (Patrologia Latina 183, 1854).',
        'en-US': 'The eighty-six sermons Bernard preached to his monks at Clairvaux from about 1135 until his death, an allegorical commentary on the first two chapters of the Song of Songs and the great classic of medieval love mysticism: the soul’s union with the Word. Latin only, from the Maurist text in Migne (Patrologia Latina 183, 1854), a machine-corrected OCR; Mabillon’s note on the Evervin letter is kept at the end of Sermon 64.',
        'pt-BR': 'Os oitenta e seis sermões que Bernardo pregou aos seus monges em Claraval, a partir de cerca de 1135 até à morte, comentário alegórico dos dois primeiros capítulos do Cântico dos Cânticos e grande clássico da mística medieval do amor: a união da alma com o Verbo.'},
      'composed': '1135-1153', 'languages': ['la'], 'work': 'bernard/sermones-super-cantica',
      'editions': {'la': {'editor': 'Jean Mabillon, in J.-P. Migne (Patrologia Latina 183)', 'year': 1854}},
      'sources': [{'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=11258',
        'edition': 'S. Bernardi Claraevallensis abbatis opera omnia, ed. J. Mabillon, in Migne, Patrologia Latina 183 (Paris 1854), Sermones in Cantica canticorum; TEI XML of the Corpus Corporum (University of Zurich), text 11258, from machine-corrected OCR.',
        'description': 'All eighty-six sermons. PL page breaks, column numbers and paragraph numbers are dropped; Scripture references stay in parentheses as printed. Mabillon’s editorial note on the Evervin letter, printed in the PL after Sermon 64, is kept at the end of that sermon. The OCR carries a few residual slips.',
        'tier': 'A', 'tierEvidence': 'Bernard died in 1153; Migne’s 1854 printing is public domain everywhere.'}],
      'toc': toc}
    write(d / 'book.json', json.dumps(meta, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    main()
