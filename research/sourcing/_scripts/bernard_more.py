"""Latin-only books of Bernard's treatises, sermons and minor works from CC (Migne PL 182-184).
usage: python3 -I bernard_more.py <slug>...   (from repo root)"""
import re, json, shutil, sys
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
from bernard_common import cc_sections, roman
from letters_build import rnum

ROOT = Path('content/books/bernard-opera-omnia')
CC = Path('research/sourcing/bernard-of-clairvaux/cc')
AUTHOR = {'la': 'Bernardus Claraevallensis', 'en-US': 'St. Bernard of Clairvaux', 'pt-BR': 'São Bernardo de Claraval'}

def write(p, t):
    p.parent.mkdir(parents=True, exist_ok=True); p.write_text(t, encoding='utf-8')

def clean(t):
    return re.sub(r'\s+', ' ', re.sub(r'\*', '', t)).strip(' .')

START = re.compile(r'^(HOMILIA|SERVO|ADMONITIO|MONITUM|PRAEFATIO|PROLOGUS|PROOEMIUM|CAPUT|CAP\.|EPILOGUS|RETRACTATIO|APPENDIX|EPISTOLA|LIBER|SERMO|PARS|PRIMA PARS|SECUNDA PARS|TERTIA PARS|QUARTA PARS)\b')

def units(path):
    """-> list of ('group', title) | (id, title, paras). Numbered sub-heads ('1.') only carry paragraphs."""
    out = []; cur = None; q = 0; cnt = 0; used = set()
    for s in cc_sections(path):
        h, paras = s['head'], list(s['paras'])
        if not h and not out: continue
        h = re.sub(r'^\d{1,4}\s+(?=[A-Z]{3})', '', h)
        if re.match(r'^(\d+|[IVXLC]+)\.?$', h) or not h:
            if cur: cur[2].extend(paras)
            continue
        if re.match(r'^LIBER\b', h):
            q += 1; cnt = 0
            t = clean(h).capitalize()
            out.append(('group', t)); cur = None
            if paras: cur = ('l%d-prooemium' % q, 'Prooemium', list(paras)); out.append(cur)
            continue
        if re.match(r'^(PRIMA|SECUNDA|TERTIA|QUARTA|QUINTA) PARS\b|^PARS\b', h):
            if paras and cur: cur[2].extend(paras)
            continue
        ms = re.match(r'^(SERMO|SERVO|HOMILIA)\s+([IVXLC]+|PRIMA|PRIMUS)\b\.?\s*(?:\[[^\]]*\]\.?)?\s*[.\-—]*\s*(.*)$', h)
        if ms:
            word = 'Sermo' if ms.group(1) in ('SERMO', 'SERVO') else 'Homilia'; num = 'I' if ms.group(2) in ('PRIMA', 'PRIMUS') else ms.group(2); cnt = rnum(num)
            title = clean(re.sub(r'\[[^\]]*\]', '', ms.group(3)))
            cur = ('%s%03d' % (word[0].lower(), cnt), '%s %s. %s' % (word, num, title) if title else '%s %s' % (word, num), list(paras))
            out.append(cur); continue
        m = re.match(r'^(?:CAPUT|CAP\.)\s+([IVXLC]+|PRIMUM)\b\.?\s*(?:\[[^\]]*\]\.?)?\s*[.\-—]*\s*(.*)$', h)
        if m:
            cnt += 1; num = 'I' if m.group(1) == 'PRIMUM' else m.group(1)
            title = clean(m.group(2))
            cid = ('l%d-c%02d' % (q, cnt)) if q else 'c%02d' % cnt
            cur = (cid, 'Caput %s. %s' % (num, title) if title else 'Caput %s' % num, list(paras))
            out.append(cur); continue
        if START.match(h):
            base = {'ADMONITIO': 'admonitio', 'MONITUM': 'admonitio', 'PRAEFATIO': 'praefatio', 'PROLOGUS': 'prologus', 'PROOEMIUM': 'prooemium', 'EPILOGUS': 'epilogus', 'RETRACTATIO': 'retractatio', 'APPENDIX': 'appendix', 'EPISTOLA': 'epistola'}.get(h.split()[0].strip('.,'), 'pars')
            n, k = base, 2
            while n in used: n = '%s%d' % (base, k); k += 1
            used.add(n)
            title = {'admonitio': 'Admonitio Mabillonii', 'praefatio': 'Praefatio', 'prologus': 'Prologus', 'prooemium': 'Prooemium', 'epilogus': 'Epilogus'}.get(base) or clean(h).capitalize()
            if base == 'admonitio' and h.upper().startswith('ADMONITIO IN') and False: pass
            cur = (n, title, list(paras)); out.append(cur); continue
        # any other head with text: an italic line inside the current unit
        if cur is not None:
            if clean(h): cur[2].append('*%s*' % clean(h))
            cur[2].extend(paras)
        else:
            cur = ('prooemium', clean(h).capitalize(), list(paras)); out.append(cur)
    return [u for u in out if u[0] == 'group' or u[2]]

def md(title, paras):
    if title.startswith('Admonitio'): paras = [p[1:-1] if p.startswith('*') and p.endswith('*') and p.count('*') == 2 else p for p in paras]
    return '# %s\n\n%s\n' % (title, '\n\n'.join(p.replace('--', '—') for p in paras))

def build(slug, c):
    d = ROOT / slug
    if d.exists(): shutil.rmtree(d)
    toc = []; grp = None
    src_files = c['cc'] if isinstance(c['cc'], list) else [c['cc']]
    for f in src_files:
        write(d / 'sources/latin-originals' / (slug + ('' if len(src_files) == 1 else '-' + f[:-4]) + '.xml'), (CC / f).read_text(encoding='utf-8'))
    for u in c.get('units') or sum([units(CC / f) for f in src_files], []):
        if u[0] == 'group':
            grp = {'id': 'liber-%d' % (len([x for x in toc if x['id'].startswith('liber')]) + 1), 'title': {'la': u[1]}, 'children': []}; toc.append(grp); continue
        write(d / 'la' / (u[0] + '.md'), md(u[1], u[2]))
        (grp['children'] if grp else toc).append({'id': u[0], 'title': {'la': u[1]}})
    wid = re.search(r'w(\d+)', src_files[0]).group(1); pl = c.get('pl', '182')
    meta = {'id': 'bernard-' + slug, 'cover': 'classic', 'name': c['name'], 'author': AUTHOR, 'description': c['desc'],
            'composed': c['composed'], 'languages': ['la'], 'work': 'bernard/' + slug,
            'editions': {'la': {'editor': 'Jean Mabillon, in J.-P. Migne (Patrologia Latina %s)' % pl, 'year': c.get('year', 1854)}},
            'sources': [{'language': 'la', 'url': 'https://mlat.uzh.ch/browser?path=/38/2268/%s' % wid,
              'edition': 'S. Bernardi Claraevallensis abbatis opera omnia, ed. J. Mabillon, in Migne, Patrologia Latina %s (Paris %d); TEI XML of the Corpus Corporum (University of Zurich), work %s, from machine-corrected OCR.' % (pl, c.get('year', 1854), wid),
              'description': c.get('srcdesc', 'The complete text with Mabillon’s admonitio, chapter headings and summaries. PL page breaks and column numbers are dropped, and so are the paragraph numbers; Scripture references stay in parentheses as printed.'),
              'tier': 'A', 'tierEvidence': 'Bernard died in 1153; Migne’s printing is public domain everywhere.'}],
            'toc': toc}
    write(d / 'book.json', json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
    print(slug, len(toc), sum(len(p.split()) for f in (d / 'la').glob('*.md') for p in [f.read_text()]))

def N(la, en, pt): return {'la': la, 'en-US': en, 'pt-BR': pt}
def D(la, en, pt): return {'la': la, 'en-US': en + ' Latin only, from the Maurist text in Migne, a machine-corrected OCR.', 'pt-BR': pt}

W = {
 'de-gradibus-humilitatis': dict(cc='w6156.xml', composed='c. 1124', name=N('De gradibus humilitatis et superbiae', 'The Steps of Humility and Pride', 'Os graus da humildade e da soberba'),
   desc=D('Tractatus Bernardi ad Godefridum de gradibus humilitatis et superbiae: duodecim humilitatis gradus ad veritatem, duodecim superbiae ad curiositatem et inde ad consuetudinem peccandi.', 'Bernard’s first treatise, written for his cousin Godfrey: the twelve steps of humility by which one climbs to truth, and the twelve of pride by which one falls from curiosity to the habit of sin, with Mabillon’s admonitio.', 'O primeiro tratado de Bernardo, escrito para seu primo Godofredo: os doze graus da humildade que levam à verdade e os doze da soberba que levam da curiosidade ao hábito do pecado.')),
 'apologia-ad-guillelmum': dict(cc='w6148.xml', composed='c. 1125', name=N('Apologia ad Guillelmum abbatem', 'Apologia to Abbot William', 'Apologia a Guilherme, abade'),
   desc=D('Apologia Bernardi ad Guillelmum abbatem sancti Theoderici, in qua et Cluniacensium abusus et Cisterciensium aemulationem reprehendit.', 'Bernard’s letter-treatise to William of Saint-Thierry, defending the Cistercians against the charge of disparaging Cluny, and attacking the luxury and the monastic art of the Black Monks (the famous passage on cloister sculpture), with Mabillon’s admonitio.', 'A carta-tratado de Bernardo a Guilherme de Saint-Thierry, em defesa dos cistercienses contra a acusação de desprezar Cluny, e crítica do luxo e da arte monástica (a famosa passagem sobre a escultura dos claustros).')),
 'de-gratia-et-libero-arbitrio': dict(cc='w6157.xml', composed='c. 1128', name=N('De gratia et libero arbitrio', 'On Grace and Free Choice', 'Sobre a graça e o livre-arbítrio'),
   desc=D('Tractatus Bernardi ad Guillelmum abbatem de gratia et libero arbitrio: quid in bono opere agant gratia et liberum arbitrium, et de tribus libertatibus.', 'Bernard’s treatise for William of Saint-Thierry on what grace and free choice each do in a good work, and on the three freedoms (from necessity, from sin, from misery), with Mabillon’s admonitio.', 'O tratado de Bernardo para Guilherme de Saint-Thierry sobre o que a graça e o livre-arbítrio fazem cada um na obra boa, e sobre as três liberdades (da necessidade, do pecado, da miséria).')),
 'de-laude-novae-militiae': dict(cc='w6158.xml', composed='c. 1130-1136', name=N('De laude novae militiae', 'In Praise of the New Knighthood', 'Em louvor da nova milícia'),
   desc=D('Liber ad milites Templi de laude novae militiae, quem Bernardus Hugoni de Payns scripsit.', 'Bernard’s book for Hugh of Payns and the Knights Templar: the contrast between worldly knighthood and the new knighthood of Christ, and a meditation on the holy places, with Mabillon’s admonitio.', 'O livro de Bernardo para Hugo de Payns e os cavaleiros templários: o contraste entre a milícia do mundo e a nova milícia de Cristo, e uma meditação sobre os lugares santos.')),
 'de-praecepto-et-dispensatione': dict(cc='w6160.xml', composed='c. 1143-1144', name=N('De praecepto et dispensatione', 'On Precept and Dispensation', 'Sobre o preceito e a dispensa'),
   desc=D('Tractatus Bernardi ad monachos Sancti Petri Carnotensis de praecepto et dispensatione, de regula S. Benedicti et obedientia.', 'Bernard’s answers to the monks of Saint-Père at Chartres on the Rule of Saint Benedict: what binds as a precept, what a superior may dispense, and the vow of obedience, with Mabillon’s admonitio.', 'As respostas de Bernardo aos monges de São Pedro de Chartres sobre a Regra de São Bento: o que obriga como preceito, o que o superior pode dispensar e o voto de obediência.')),
 'de-conversione-ad-clericos': dict(cc='w6153.xml', composed='c. 1140', name=N('De conversione ad clericos', 'On Conversion, to the Clergy', 'Sobre a conversão, aos clérigos'),
   desc=D('Sermo seu tractatus Bernardi ad clericos de conversione, Parisiis habitus.', 'Bernard’s address to the clerics of Paris on conversion, from the voice of the Lord that calls the soul back to itself to the cities of refuge, with Mabillon’s admonitio.', 'O discurso de Bernardo aos clérigos de Paris sobre a conversão, da voz do Senhor que chama a alma de volta a si às cidades de refúgio.')),
 'de-moribus-et-officio-episcoporum': dict(cc='w6159.xml', composed='1126-1128', name=N('De moribus et officio episcoporum', 'On the Conduct and Office of Bishops', 'Sobre a conduta e o ofício dos bispos'),
   desc=D('Epistola Bernardi 42 seu tractatus ad Henricum Senonensem archiepiscopum, de moribus et officio episcoporum.', 'Bernard’s Letter 42, a treatise for Henry, archbishop of Sens, on the life and duties of bishops. Mabillon moved it from the letters to the treatises; in the Latin letters book it is represented by a cross-reference.', 'A carta 42 de Bernardo, tratado para Henrique, arcebispo de Sens, sobre a vida e os deveres dos bispos.')),
 'de-baptismo': dict(cc='w6151.xml', composed='c. 1127', name=N('De baptismo aliisque quaestionibus', 'On Baptism and Other Questions', 'Sobre o batismo e outras questões'),
   desc=D('Epistola Bernardi 77 seu tractatus ad magistrum Hugonem de Sancto Victore de baptismo aliisque quaestionibus.', 'Bernard’s Letter 77, a treatise answering Hugh of Saint-Victor’s questions on baptism (whether it binds from the word to Nicodemus, whether faith without the water suffices) and on the precepts of the Gospel. Mabillon moved it from the letters to the treatises.', 'A carta 77 de Bernardo, tratado em resposta às questões de Hugo de São Vítor sobre o batismo e sobre os preceitos do Evangelho.')),
 'contra-errores-abaelardi': dict(cc='w6150.xml', composed='1140', name=N('Contra quaedam capitula errorum Abaelardi', 'Against Certain Chapters of Abelard’s Errors', 'Contra alguns capítulos dos erros de Abelardo'),
   desc=D('Epistola Bernardi 190 seu tractatus ad Innocentium papam contra quaedam capitula errorum Abaelardi.', 'Bernard’s Letter 190, the treatise sent to Pope Innocent II against nineteen propositions drawn from Abelard (on the Trinity, redemption, grace and the person of Christ). Mabillon moved it from the letters to the treatises.', 'A carta 190 de Bernardo, o tratado enviado ao papa Inocêncio II contra proposições extraídas de Abelardo (sobre a Trindade, a redenção, a graça e a pessoa de Cristo).')),
 'vita-sancti-malachiae': dict(cc='w6165.xml', composed='1148-1151', name=N('Vita sancti Malachiae', 'The Life of Saint Malachy', 'Vida de São Malaquias'),
   desc=D('Vita sancti Malachiae Hiberniae episcopi, ad Congamum abbatem scripta a Bernardo.', 'Bernard’s life of his friend Malachy, archbishop of Armagh, who died at Clairvaux in 1148: Ireland’s reform, the visit to Rome and the holy death, written for Abbot Congan of Inislounaght, with Mabillon’s chapter summaries.', 'A vida de seu amigo Malaquias, arcebispo de Armagh, morto em Claraval em 1148: a reforma da Irlanda, a viagem a Roma e a santa morte, escrita para o abade Congano.')),
}

if __name__ == '__main__':
    for s in sys.argv[1:]: build(s, W[s])
