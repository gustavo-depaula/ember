"""Build the remaining Anselm treatises from CC (Migne PL 158) Latin; the Responsio with Gaunilo also gets Deane's English.
usage: python3 -I anselm_more.py <slug>...   (from repo root)"""
import re, json, shutil, sys
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
from bernard_common import cc_sections
import anselm_build as B
from anselm_build import write, lat_md, dashes, roman, split_speakers, AUTHOR, ROOT, CC

def slug_id(t, used):
    s = re.sub(r'[^a-z]+', '-', t.lower()).strip('-').split('-')[0] or 'pars'
    s = {'anselmus': 'praefatio', 'responsio': 'responsio', 'de': 'prooemium', 'operis': 'clausula'}.get(s, s)
    n, k = s, 2
    while n in used: n = '%s%d' % (s, k); k += 1
    used.add(n); return n

def tidy_title(t):
    t = re.sub(r'\*', '', t).strip(' .-—')
    t = re.sub(r'\s+', ' ', t)
    if t.isupper(): t = t.capitalize()
    return t

def chapters(path, dialogue=False):
    out = []; used = set(); q = 0; cnt = 0
    for s in cc_sections(path):
        h, paras = s['head'], list(s['paras'])
        if h.startswith('QUAESTIO'):
            q += 1; cnt = 0
            out.append(('group', 'Quaestio %s. %s' % (roman(q), tidy_title(re.sub(r'^QUAESTIO [IVX]+\.\s*', '', h)).capitalize()), []))
            if paras: out.append(('q%d-prooemium' % q, 'Prooemium', paras))
            continue
        m = re.match(r'(?:CAPUT|CAP\.?)\s+([IVXLC]+|PRIMUM)\b\.?\s*(?:\[[^\]]*\]\.?)?\s*[.\-—]*\s*(.*)$', h)
        if m:
            num = 'I' if m.group(1) == 'PRIMUM' else m.group(1)
            title = re.sub(r'^[^\w*]+', '', m.group(2)).strip()
            title = re.sub(r'\*', '', title).strip(' .')
            if not title and paras and len(paras[0].split()) < 45 and paras[0].startswith('*'):
                title = re.sub(r'\*', '', paras[0]).strip(' .'); paras = paras[1:]
            cnt += 1
            cid = ('q%d-c%02d' % (q, cnt)) if q else 'c%02d' % cnt
            t = 'Caput %s. %s' % (num, title) if title else 'Caput %s' % num
        else:
            if not paras: continue
            t = tidy_title(h) or 'Prooemium'
            if len(t.split()) > 6: t = 'Praefatio'
            if t.startswith('De concordia'): t = 'Prooemium'
            cid = slug_id(t, used)
        if dialogue: paras = split_speakers(paras)
        out.append((cid, t, paras))
    return out

# ---------------------------------------------------------------- Gaunilo and the Responsio
def gaunilo_latin():
    x = open('research/sourcing/anselm/ws/gaunilo.txt', encoding='utf-8').read()
    x = x[x.index('[[category'):].split('\n', 1)[1]
    x = re.sub(r'\[\d{4}[A-D]\]\s*', '', x)
    x = re.sub(r'<[^>]+>|\[\[|\]\]', '', x)
    ps = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', x)]
    res = []
    for p in ps:
        m = re.match(r'^(\d+)\.\s+(.*)$', p)
        if m: res.append([m.group(2)])
        elif p and res: res[-1].append(p)
    assert len(res) == 8, len(res)
    return res

def gaunilo_english():
    L = B.ENL[5396:5630]
    txt = '\n'.join(L)
    parts = re.split(r'\n   (?=\d+\. )', '\n' + txt)[1:]
    res = []
    for p in parts:
        p = re.sub(r'^\d+\.\s+', '', p.strip())
        res.append([re.sub(r'\s+', ' ', q).strip() for q in re.split(r'\n\s*\n', p) if q.strip() and not re.match(r'^_+$', q.strip())])
    assert len(res) == 8
    return res

DESC = {
 'responsio-ad-gaunilonem': dict(cc='w5587.xml', ccid='10624', cc_work='5587', composed='c. 1078',
   name={'la': 'Pro insipiente et Responsio ad Gaunilonem', 'en-US': 'Gaunilo’s In Behalf of the Fool and Anselm’s Reply', 'pt-BR': 'Gaunilo, Em favor do insensato, e a Resposta de Anselmo'},
   desc={'la': 'Gaunilonis monachi Maioris Monasterii Liber pro insipiente adversus Proslogion, et Anselmi Liber apologeticus contra Gaunilonem: disputatio de argumento «id quo maius cogitari nequit». Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'The exchange on the argument of the Proslogion: the monk Gaunilo’s “In Behalf of the Fool” in eight sections (the lost-island objection) and Anselm’s reply in ten chapters. The Latin is the Migne text (Patrologia Latina 158, 1853): Anselm’s reply from a machine-corrected OCR, Gaunilo from Latin Wikisource; the English is Sidney Norton Deane’s 1903 translation, which follows the Latin section for section.',
         'pt-BR': 'A troca de argumentos sobre o Proslógio: o «Em favor do insensato» do monge Gaunilo, em oito partes (a objeção da ilha perdida), e a resposta de Anselmo, em dez capítulos.'}),
 'de-grammatico': dict(cc='w5580.xml', ccid='10617', cc_work='5580', dialogue=True, composed='c. 1060-1063',
   name={'la': 'De grammatico', 'en-US': 'On the Grammarian', 'pt-BR': 'Sobre o gramático'},
   desc={'la': 'Dialogus de grammatico, quo modo «grammaticus» sit substantia et qualitas: quaestio de nominibus denominativis et de significatione. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s early dialogue between teacher and student on how a word like “grammarian” signifies, being at once a substance and a quality: a work of logic and semantics. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR, with the chapter summaries.',
         'pt-BR': 'O diálogo de juventude de Anselmo entre mestre e discípulo sobre como um termo como «gramático» significa, sendo ao mesmo tempo substância e qualidade: obra de lógica e de semântica.'}),
 'epistola-de-incarnatione-verbi': dict(cc='w5573.xml', ccid='10610', cc_work='5573', composed='1092-1094',
   name={'la': 'De fide Trinitatis et de incarnatione Verbi', 'en-US': 'On the Incarnation of the Word', 'pt-BR': 'Sobre a encarnação do Verbo'},
   desc={'la': 'Epistola Anselmi ad Urbanum papam de incarnatione Verbi, contra Roscelinum, quae in Migne «De fide Trinitatis» inscribitur. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s letter to Pope Urban II against Roscelin of Compiègne on the Trinity and the incarnation of the Word, printed by Migne as “On the Faith of the Trinity” (the later recension). Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR.',
         'pt-BR': 'A carta de Anselmo ao papa Urbano II contra Roscelino sobre a Trindade e a encarnação do Verbo, impressa por Migne como «Sobre a fé na Trindade».'}),
 'de-conceptu-virginali': dict(cc='w5571.xml', ccid='10608', cc_work='5571', composed='1099-1100',
   name={'la': 'De conceptu virginali et de originali peccato', 'en-US': 'On the Virgin Conception and Original Sin', 'pt-BR': 'Sobre a concepção virginal e o pecado original'},
   desc={'la': 'Tractatus Anselmi de conceptu virginali et de originali peccato ad Valerannum: quomodo Christus sine peccato conceptus sit et quid sit originale peccatum. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s treatise, addressed to Bishop Waleran of Naumburg, on how Christ was conceived of a virgin without sin, and what original sin is and how it is passed on. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR, with the chapter summaries.',
         'pt-BR': 'O tratado de Anselmo, dirigido ao bispo Valerano de Naumburgo, sobre como Cristo foi concebido de uma virgem sem pecado e sobre o que é o pecado original e como se transmite.'}),
 'de-processione-spiritus-sancti': dict(cc='w5576.xml', ccid='10613', cc_work='5576', composed='1098-1102',
   name={'la': 'De processione Spiritus Sancti', 'en-US': 'On the Procession of the Holy Spirit', 'pt-BR': 'Sobre a processão do Espírito Santo'},
   desc={'la': 'Anselmi de processione Spiritus Sancti contra Graecos, quam in concilio Barensi (1098) disputavit et postea composuit. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s defence of the Latin doctrine that the Holy Spirit proceeds from the Father and the Son, against the Greeks, as argued before the Council of Bari (1098) and written down afterwards. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR.',
         'pt-BR': 'A defesa de Anselmo da doutrina latina de que o Espírito Santo procede do Pai e do Filho, contra os gregos, tal como a discutiu no Concílio de Bari (1098) e depois a redigiu.'}),
 'de-concordia': dict(cc='w5572.xml', ccid='10609', cc_work='5572', composed='1107-1108',
   name={'la': 'De concordia praescientiae et praedestinationis et gratiae Dei cum libero arbitrio', 'en-US': 'On the Harmony of Foreknowledge, Predestination and Grace with Free Will', 'pt-BR': 'Sobre a concordância da presciência, da predestinação e da graça com o livre-arbítrio'},
   desc={'la': 'Anselmi ultimum opus: de concordia praescientiae, praedestinationis et gratiae Dei cum libero arbitrio, in tribus quaestionibus. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s last treatise, in three questions: how God’s foreknowledge, predestination and grace are reconciled with the freedom of the will. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR, with the chapter summaries.',
         'pt-BR': 'O último tratado de Anselmo, em três questões: como a presciência, a predestinação e a graça de Deus se conciliam com a liberdade da vontade.'}),
 'de-sacrificio-azymi-et-fermentati': dict(cc='w5570.xml', ccid='10607', cc_work='5570', composed='c. 1106-1107',
   name={'la': 'De sacrificio azymi et fermentati', 'en-US': 'On the Sacrifice of Unleavened and Leavened Bread', 'pt-BR': 'Sobre o sacrifício do pão ázimo e fermentado'},
   desc={'la': 'Epistola Anselmi ad Valerannum Naumburgensem episcopum de sacrificio azymi et fermentati, de diversitate rituum Latinorum et Graecorum. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s letter to Bishop Waleran of Naumburg on the Eucharist celebrated in unleavened bread by the Latins and in leavened bread by the Greeks. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR.',
         'pt-BR': 'A carta de Anselmo ao bispo Valerano de Naumburgo sobre a Eucaristia celebrada em pão ázimo pelos latinos e em pão fermentado pelos gregos.'}),
 'de-sacramentis-ecclesiae': dict(cc='w5596.xml', ccid='10633', cc_work='5596', composed='c. 1106-1107',
   name={'la': 'Epistola de sacramentis ecclesiae (Ad Waleranni quaerelas responsio)', 'en-US': 'On the Sacraments of the Church (Reply to Waleran’s Complaints)', 'pt-BR': 'Sobre os sacramentos da Igreja (resposta às queixas de Valerano)'},
   desc={'la': 'Anselmi responsio ad Waleranni quaerelas de ritibus Ecclesiae, de signo crucis et de operimento calicis. Textus ex editione Migne (Patrologia Latina 158, 1853).',
         'en-US': 'Anselm’s short reply to the complaints of Waleran of Naumburg about the rites of the Church: the sign of the cross and the covering of the chalice. Latin only, from the Migne text (Patrologia Latina 158, 1853), a machine-corrected OCR.',
         'pt-BR': 'A breve resposta de Anselmo às queixas de Valerano de Naumburgo sobre os ritos da Igreja: o sinal da cruz e a cobertura do cálice.'}),
}

def main(slugs):
    for slug in slugs:
        c = DESC[slug]; d = ROOT / slug
        if d.exists(): shutil.rmtree(d)
        toc = []; langs = ['la']
        write(d / 'sources/latin-originals' / (slug + '.xml'), (CC / c['cc']).read_text(encoding='utf-8'))
        if slug == 'responsio-ad-gaunilonem':
            langs = ['la', 'en-US']
            gl, ge = gaunilo_latin(), gaunilo_english()
            for i, (lp, ep) in enumerate(zip(gl, ge), 1):
                cid = 'g%d' % i
                lt, et = 'Gaunilonis Pro insipiente, %s' % roman(i), 'Gaunilo, In Behalf of the Fool, %s' % roman(i)
                write(d / 'la' / (cid + '.md'), lat_md(lt, lp)); write(d / 'en-US' / (cid + '.md'), lat_md(et, ep))
                toc.append({'id': cid, 'title': {'la': lt, 'en-US': et}})
            lat = chapters(CC / c['cc'])
            lat[0] = ('praefatio', 'Praefatio', lat[0][2])
            en = [e for e in B.english_chapters(B.ENL[5630:6161])]
            pre = re.sub(r'\s+', ' ', ' '.join(B.ENL[5635:5640])).strip()
            assert pre.startswith('IT was a fool'), pre
            write(d / 'la' / 'praefatio.md', lat_md('Praefatio', lat[0][2]))
            write(d / 'en-US' / 'praefatio.md', lat_md('Preface', [pre]))
            toc.append({'id': 'praefatio', 'title': {'la': 'Praefatio', 'en-US': 'Preface'}})
            assert len(en) == len(lat) - 1, (len(en), len(lat))
            for (cid, lt, lp), (h, ep) in zip(lat[1:], en):
                write(d / 'la' / (cid + '.md'), lat_md(lt, lp))
                et, eb, notes = B.en_entry(h, ep, 'titled')
                write(d / 'en-US' / (cid + '.md'), B.en_md(et, eb, notes))
                toc.append({'id': cid, 'title': {'la': lt, 'en-US': et}})
            write(d / 'sources/latin-originals/gaunilo-pro-insipiente.txt', open('research/sourcing/anselm/ws/gaunilo.txt', encoding='utf-8').read())
            write(d / 'sources/english-originals' / (slug + '.txt'), '\n'.join(B.ENL[5390:6161]) + '\n')
        else:
            grp = None
            for cid, t, ps in chapters(CC / c['cc'], c.get('dialogue', False)):
                if cid == 'group':
                    grp = {'id': 'quaestio-%d' % (len([x for x in toc if x['id'].startswith('quaestio')]) + 1), 'title': {'la': t}, 'children': []}; toc.append(grp); continue
                write(d / 'la' / (cid + '.md'), lat_md(t, ps)); (grp['children'] if grp else toc).append({'id': cid, 'title': {'la': t}})
        srcs = [{'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=%s' % c['ccid'],
                 'edition': 'S. Anselmi Cantuariensis archiepiscopi opera omnia, ed. J.-P. Migne, Patrologia Latina 158 (Paris 1853), the Gerberon text; TEI XML of the Corpus Corporum (University of Zurich), text %s, from the Open Greek and Latin machine-corrected OCR.' % c['ccid'],
                 'description': 'The complete text with its chapter divisions and PL chapter summaries. PL page breaks, the column numbers and the apparatus of alternative chapter numbers (al.) are dropped; Scripture references stay in parentheses as printed. The OCR carries a few residual slips.',
                 'tier': 'A', 'tierEvidence': 'Anselm died in 1109; Migne’s 1853 printing is public domain everywhere.'}]
        edits = {'la': {'editor': 'J.-P. Migne (Patrologia Latina 158)', 'year': 1853}}
        if slug == 'responsio-ad-gaunilonem':
            srcs.append({'language': 'la', 'url': 'https://la.wikisource.org/wiki/Liber_pro_insipiente', 'edition': 'Gaunilo, Liber pro insipiente adversus S. Anselmi in Proslogio ratiocinationem, as printed in Migne, Patrologia Latina 158 (cols 241-248), from Latin Wikisource.', 'description': 'Gaunilo’s eight sections, with the PL column markers dropped.', 'tier': 'A', 'tierEvidence': 'Gaunilo wrote in the eleventh century; Migne’s 1853 printing is public domain.'})
            srcs.append({'language': 'en-US', 'url': 'https://ccel.org/ccel/anselm/basic_works/cache/basic_works.txt',
                'edition': 'St. Anselm: Proslogium; Monologium; an Appendix in Behalf of the Fool by Gaunilon; and Cur Deus Homo, translated from the Latin by Sidney Norton Deane (Chicago: Open Court, 1903). Christian Classics Ethereal Library plain-text edition.',
                'description': 'Gaunilon’s “In Behalf of the Fool” and Anselm’s Apologetic (Deane’s introduction and notes are not imported). Chapter titles are Deane’s chapter summaries; translator’s notes are kept as footnotes.',
                'tier': 'A', 'tierEvidence': 'Published in Chicago in 1903, before 1931: public domain in the US.'})
            edits['en-US'] = {'translator': 'Sidney Norton Deane', 'year': 1903}
        meta = {'id': 'anselm-' + slug, 'cover': 'classic', 'name': c['name'], 'author': AUTHOR, 'description': c['desc'],
                'composed': c['composed'], 'languages': langs, 'work': 'anselm/' + slug, 'editions': edits, 'sources': srcs, 'toc': toc}
        write(d / 'book.json', json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
        print(slug, len(toc))

if __name__ == '__main__':
    main(sys.argv[1:])
