"""Build Anselm treatise books from CC (PL 158) Latin and Deane (CCEL) English.
usage: python3 -I anselm_build.py   (run from repo root)"""
import re, json, shutil, sys
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
from anselm_parse import latin_chapters, english_chapters

ROOT = Path('content/books/anselm-opera-omnia')
CC = Path('research/sourcing/anselm/cc')
EN = Path('research/sourcing/anselm/ccel/basic_works.txt')
SPEAK = r'(?:BOS|ANS|DISC|MAG|DISCIPULUS|MAGISTER)'

def roman(n):
    r = ''
    for v, s in [(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n >= v: r += s; n -= v
    return r

def dashes(s): return s.replace('--', '—')
def strip_it(s): return re.sub(r'\s+', ' ', s.replace('*', '')).strip()

def split_speakers(paras):
    out = []
    for p in paras:
        parts = re.split(r'(?<=[.?!:;)*]) (?=' + SPEAK + r'\. )', p)
        out += parts
    return out

def latin_book(path, dialogue=False):
    """-> list of (key, title, [paras]); key 'praefatio' or int sequence; 'LIBER' markers as ('liber', title)"""
    out = []; n = 0
    for x in latin_chapters(path):
        h = x['head']; paras = list(x['paras'])
        if re.match(r'LIBER', h): n = 0; out.append(('liber', h.strip('. ').title(), [])); continue
        if not paras and not re.match(r'CAPUT', h): continue   # work-title heading
        m = re.match(r'CAPUT\s+(?:[IVXLC]+|PRIMUM)\.*\s*(?:\[[^\]]*\]\.*)?\s*(.*)$', h) if h.startswith('CAPUT') else None
        if m is not None:
            n += 1; title = re.sub(r'^[^\w*]+', '', strip_it(m.group(1))).rstrip('.').strip()
            if not title and paras and paras[0].startswith('*') and len(paras[0].split()) < 45:
                seg = strip_it(paras[0]); title = seg.split('.--')[0].rstrip('. ')
                if '.--' not in seg: paras = paras[1:]
            if dialogue: paras = split_speakers(paras)
            out.append((n, 'Caput %s. %s' % (roman(n), title) if title else 'Caput %s' % roman(n), paras))
        else:
            title = {'PRAEFATIO':'Praefatio','PRAEFATIO.':'Praefatio','PROOEMIUM.':'Prooemium','PROLOGUS.':'Prologus'}.get(h.strip(), h.strip().title())
            if paras and re.fullmatch(r'\*[^*]+\*\.?', paras[0]) and len(paras[0]) < 200 and False: pass
            if dialogue: paras = split_speakers(paras)
            out.append(('praefatio', title, paras))
    return out

def en_split(lines):
    """-> list of (heading, title, paras, notes{num:text}) with preface first"""
    L = lines
    chs = []
    for h, paras in english_chapters(L):
        chs.append((h, paras))
    return chs

def fmt_en(h, paras, bookno=None):
    notes = {}
    body = []
    for p in paras:
        m = re.match(r'^\[(\d+)\]\s*,?\s*\[?(.*?)\]?$', p)
        if m and len(p) > 8 and body: notes[m.group(1)] = m.group(2); continue
        body.append(p)
    return body, notes

def reduce_fix(p):
    for a, b in FIXES: p = p.replace(a, b)
    return p
FIXES = [('cap*. 76 *Trinitatem', 'cap. 76 *Trinitatem'), ('dilcctoribus', 'dilectoribus')]
def lat_md(title, paras):
    paras = [reduce_fix(p) for p in paras]
    return '# %s\n\n%s\n' % (title, '\n\n'.join(dashes(p) for p in paras))

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True); path.write_text(text, encoding='utf-8')

def en_title(h):
    h = re.sub(r'\s*\[\d+\]\s*$', '', h).strip().rstrip('.')
    h = re.sub(r'\(b\.\)', '(b)', h)
    return h.title().replace('Chapter', 'Chapter') if False else re.sub(r'^CHAPTER ', 'Chapter ', h)

def build_en_chapter(h, paras, name_title=None):
    ref = re.search(r'\[(\d+)\]\s*$', h)
    body, notes = fmt_en(h, paras)
    body = [dashes(re.sub(r'\[(\d+)\]', r'[^\1]', p)) for p in body]
    if ref and '[^%s]' % ref.group(1) not in ' '.join(body):
        body[0] = body[0] + '[^%s]' % ref.group(1) if len(body)>0 else body[0]
    return body, notes

# ---------------------------------------------------------------- main
AUTHOR = {'la': 'Anselmus Cantuariensis', 'en-US': 'St. Anselm of Canterbury', 'pt-BR': 'Santo Anselmo de Cantuária'}
ENL = open(EN, encoding='utf-8').read().split('\n')
def eng(a, b): return english_chapters(ENL[a-1:b])

def en_entry(h, paras, mode):
    """-> (title, body paras, notes)"""
    body, notes = fmt_en(h, paras)
    ref = re.search(r'\[(\d+)\]\s*$', h)
    if h.startswith('CHAPTER'):
        label = en_title(h)
    else:
        label = 'Preface'
    if mode == 'summary':          # Proslogium: first paragraph is the argument
        seg = body[0]
        title = label + '. ' + seg.split('.--')[0].rstrip('.') if h.startswith('CHAPTER') else label
        body = ['*%s*' % body[0]] + body[1:]
    elif mode == 'titled' and h.startswith('CHAPTER'):
        tref = re.search(r'\s*\[(\d+)\]\s*\.?$', body[0])
        title = label + '. ' + re.sub(r'\s*\[\d+\]\s*$', '', body[0]).rstrip('.'); body = body[1:]
        if tref and not ref: ref = tref
    else:
        title = label
        if mode == 'monolog-pref': body = ['*%s*' % body[0]] + body[1:]
    body = [dashes(re.sub(r'\s*\[(\d+)\]', r'[^\1]', p)) for p in body]
    t2 = re.search(r'\[(\d+)\]\s*$', title)
    if ref and not any('[^%s]' % ref.group(1) in p for p in body):
        body[0] = body[0] + '[^%s]' % ref.group(1)
    title = re.sub(r'\s*\[\d+\]\s*$', '', title)
    # also a ref inside the title paragraph (monologion XXV)
    return title, body, notes

def en_md(title, body, notes):
    t = '# %s\n\n%s\n' % (title, '\n\n'.join(body))
    if notes: t += '\n' + '\n\n'.join('[^%s]: %s' % (k, dashes(v)) for k, v in notes.items()) + '\n'
    return t

W = {
 'proslogion': dict(
   cc='proslogion-pl.xml', ccid='10631', cc_work='5594', dialogue=False, en=(1036, 2005), enmode='summary', composed='1077-1078',
   name={'la': 'Proslogion', 'en-US': 'The Proslogion', 'pt-BR': 'Proslógio'}, ennm='Proslogium',
   desc={'la': 'Opusculum Anselmi, Fides quaerens intellectum inscriptum, in quo uno argumento Deum esse et quaecumque de Deo credimus ostendere conatur: oratio ad contemplandum Deum, quae «id quo maius cogitari nequit» in medio ponit. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'The short work, first titled Faith Seeking Understanding, in which Anselm of Canterbury tries to prove in a single argument that God exists and whatever we believe about Him: a prayer that seeks to lift the mind to the contemplation of God and sets out the argument for “that than which nothing greater can be conceived.” The Latin is the Migne text (Patrologia Latina 158, 1853), from a machine-corrected OCR; the English is Sidney Norton Deane’s 1903 translation, chapter for chapter. Gaunilo’s reply and Anselm’s answer are not included.',
         'pt-BR': 'O breve tratado, primeiro intitulado A fé que busca a inteligência, em que Anselmo de Cantuária procura provar num único argumento que Deus existe e tudo o que cremos a seu respeito: uma oração para elevar o espírito à contemplação de Deus, que expõe o argumento de «aquilo do qual nada maior se pode pensar».'}),
 'monologion': dict(
   cc='w5590.xml', ccid='10627', cc_work='5590', dialogue=False, en=(2041, 5384), enmode='titled', composed='1075-1076',
   name={'la': 'Monologion', 'en-US': 'The Monologium', 'pt-BR': 'Monológio'}, ennm='Monologium',
   desc={'la': 'Primum opus maius Anselmi, «exemplum meditandi de ratione fidei»: de essentia divina, sola ratione et sine auctoritate Scripturae, in nonaginta et septem capitibus. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s first major work, “an example of meditation on the grounds of faith”: the being of God, the Trinity and the human mind’s relation to its Creator, argued in seventy-nine chapters by reason alone, without appeal to Scripture. The Latin is the Migne text (Patrologia Latina 158, 1853), from a machine-corrected OCR, with the chapter summaries; the English is Sidney Norton Deane’s 1903 translation, which follows the Latin chapter for chapter and keeps the translator’s two notes.',
         'pt-BR': 'A primeira grande obra de Anselmo, «exemplo de meditação sobre a razão da fé»: o ser de Deus, a Trindade e a relação do espírito humano com o seu Criador, discutidos em setenta e nove capítulos só com a razão, sem apelo à Escritura.'}),
 'cur-deus-homo': dict(
   cc='w5569.xml', ccid='10606', cc_work='5569', dialogue=True, en=(6184, 9674), enmode='titled', composed='1094-1098',
   name={'la': 'Cur Deus homo', 'en-US': 'Cur Deus Homo? Why God Became Man', 'pt-BR': 'Por que Deus se fez homem'}, ennm='Cur Deus Homo',
   desc={'la': 'Dialogus Anselmi cum Bosone de causa incarnationis et redemptionis: cur Deus homo, in duobus libris. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s dialogue with the monk Boso on why God became man and how Christ’s death redeems us: the doctrine of satisfaction, in two books. The Latin is the Migne text (Patrologia Latina 158, 1853), from a machine-corrected OCR; the English is Sidney Norton Deane’s 1903 translation, which follows the Latin chapter for chapter (Deane splits Book II chapter XVIII in two, so from there his numbers run one behind the Latin).',
         'pt-BR': 'O diálogo de Anselmo com o monge Bosão sobre a razão pela qual Deus se fez homem e sobre como a morte de Cristo nos redime: a doutrina da satisfação, em dois livros.'}),
 'de-veritate': dict(cc='w5582.xml', ccid='10619', cc_work='5582', dialogue=True, en=None, composed='c. 1080-1085',
   name={'la': 'De veritate', 'en-US': 'On Truth', 'pt-BR': 'Sobre a verdade'},
   desc={'la': 'Dialogus de veritate: quid sit veritas in enuntiatione, in opinione, in voluntate, in actione, in sensibus et in ipsa rerum essentia, et quod una sit veritas in omnibus veris. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s dialogue between teacher and student on truth as rightness: truth in statements, opinion, will, action, the senses and the essence of things, and the one Truth in all true things. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR, with the chapter divisions of Migne.',
         'pt-BR': 'O diálogo de Anselmo entre mestre e discípulo sobre a verdade como retidão: a verdade no enunciado, na opinião, na vontade, na ação, nos sentidos e na essência das coisas, e a Verdade una em todas as coisas verdadeiras.'}),
 'de-libertate-arbitrii': dict(cc='w5581.xml', ccid='10618', cc_work='5581', dialogue=True, en=None, composed='c. 1080-1085',
   name={'la': 'De libertate arbitrii', 'en-US': 'On Freedom of Choice', 'pt-BR': 'Sobre a liberdade do arbítrio'},
   desc={'la': 'Dialogus de libertate arbitrii: libertas arbitrii est potestas servandi rectitudinem voluntatis propter ipsam rectitudinem. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s dialogue between teacher and student on free will, defined as the power of keeping the rightness of the will for the sake of that rightness itself, and why the power to sin is no part of it. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR.',
         'pt-BR': 'O diálogo de Anselmo entre mestre e discípulo sobre o livre-arbítrio, definido como o poder de conservar a retidão da vontade por causa dessa mesma retidão, e sobre por que o poder de pecar não faz parte dele.'}),
 'de-casu-diaboli': dict(cc='w5579.xml', ccid='10616', cc_work='5579', dialogue=True, en=None, composed='c. 1085-1090',
   name={'la': 'De casu diaboli', 'en-US': 'On the Fall of the Devil', 'pt-BR': 'Sobre a queda do diabo'},
   desc={'la': 'Dialogus de casu diaboli: quomodo diabolus peccavit non accepta perseverantia, et quid sit malum, nihil, voluntas et iustitia. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s dialogue between teacher and student on how the devil sinned and fell, and on the nature of evil as a privation, of the will, and of justice. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR.',
         'pt-BR': 'O diálogo de Anselmo entre mestre e discípulo sobre como o diabo pecou e caiu, e sobre a natureza do mal como privação, da vontade e da justiça.'}),
}

def main(slugs):
    for slug in slugs:
        c = W[slug]; d = ROOT / slug
        if d.exists(): shutil.rmtree(d)
        lat = latin_book(CC / c['cc'], c['dialogue'])
        langs = ['la'] + (['en-US'] if c['en'] else [])
        en = None
        if c['en']:
            en = [e for e in eng(*c['en']) if not e[0].startswith('BOOK')]
            body = [x for x in lat if x[0] != 'liber']
            assert len(en) == len(body), (slug, len(en), len(body))
        toc = []; grp = None; i = 0
        bookno = 0
        for item in lat:
            if item[0] == 'liber':
                bookno += 1
                grp = {'id': 'liber-%d' % bookno, 'title': {'la': item[1], 'en-US': 'Book %s' % ('I' if bookno == 1 else 'II')}, 'children': []}
                toc.append(grp); continue
            key, ltitle, lparas = item
            cid = 'praefatio' if key == 'praefatio' else ('l%d-c%02d' % (bookno, key) if bookno else 'c%02d' % key)
            if key != 'praefatio' and bookno:
                pass
            title = {'la': ltitle}
            write(d / 'la' / (cid + '.md'), lat_md(ltitle, lparas))
            if en:
                h, paras = en[i]; i += 1
                etitle, ebody, notes = en_entry(h, paras, c['enmode'] if not (c['enmode'] == 'titled' and key == 'praefatio' and slug == 'monologion') else 'monolog-pref')
                if h.startswith('PREFACE') and c['enmode'] == 'titled' and slug == 'cur-deus-homo': pass
                title['en-US'] = etitle
                write(d / 'en-US' / (cid + '.md'), en_md(etitle, ebody, notes))
            node = {'id': cid, 'title': title}
            (grp['children'] if grp else toc).append(node)
        # sources
        write(d / 'sources' / 'latin-originals' / (slug + '.xml'), (CC / c['cc']).read_text(encoding='utf-8'))
        if c['en']:
            a, b = c['en']
            write(d / 'sources' / 'english-originals' / (slug + '.txt'), '\n'.join(ENL[a-1:b]) + '\n')
        srcs = [{'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=%s' % c['ccid'],
                 'edition': 'S. Anselmi Cantuariensis archiepiscopi opera omnia, ed. J.-P. Migne, Patrologia Latina 158 (Paris 1853), the Gerberon text; TEI XML of the Corpus Corporum (University of Zurich), text %s, from the Open Greek and Latin machine-corrected OCR.' % c['ccid'],
                 'description': 'The complete text with its chapter divisions and PL chapter summaries. PL page breaks, the column numbers and the apparatus of alternative chapter numbers (al.) are dropped; Scripture references stay in parentheses as printed. Dialogue turns are set as separate paragraphs. The OCR carries a few residual slips.',
                 'tier': 'A', 'tierEvidence': 'Anselm died in 1109; Migne’s 1853 printing is public domain everywhere.'}]
        if c['en']:
            srcs.append({'language': 'en-US', 'url': 'https://ccel.org/ccel/anselm/basic_works/cache/basic_works.txt',
                'edition': 'St. Anselm: Proslogium; Monologium; an Appendix in Behalf of the Fool by Gaunilon; and Cur Deus Homo, translated from the Latin by Sidney Norton Deane (Chicago: Open Court, 1903). Christian Classics Ethereal Library plain-text edition.',
                'description': 'The %s only (Deane’s introduction, Gaunilo’s pleading and Anselm’s reply are not imported). Chapter titles are Deane’s chapter headings; translator’s notes are kept as footnotes.' % c['ennm'],
                'tier': 'A', 'tierEvidence': 'Published in Chicago in 1903, before 1931: public domain in the US.'})
        edits = {'la': {'editor': 'J.-P. Migne (Patrologia Latina 158)', 'year': 1853}}
        if c['en']: edits['en-US'] = {'translator': 'Sidney Norton Deane', 'year': 1903}
        meta = {'id': 'anselm-' + slug, 'cover': 'classic', 'name': c['name'], 'author': AUTHOR, 'description': c['desc'],
                'composed': c['composed'], 'languages': langs, 'work': 'anselm/' + slug, 'editions': edits, 'sources': srcs, 'toc': toc}
        for k in ('name', 'author', 'description'):
            meta[k] = {l: meta[k][l] for l in ['la', 'en-US', 'pt-BR'] if l in meta[k]}
        write(d / 'book.json', json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
        print(slug, len(lat))

if __name__ == '__main__':
    main(sys.argv[1:])
