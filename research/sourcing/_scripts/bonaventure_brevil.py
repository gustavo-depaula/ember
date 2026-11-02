"""Breviloquium from Tria opuscula (Quaracchi 1911 octavo), OCR cleaned. usage: python3 -I bonaventure_brevil.py [dry]"""
import re, sys, collections
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *

SRC = 'research/sourcing/bonaventure/la/triaopusculaseraphici3ed.txt'
HEAD = re.compile(r'^(\d+\s*)?(BREVILOQUIUM|PROLOGUS|PROOEMIUM|BREVILOQUIUM\.)[^a-z]{0,45}$|^[A-Z]{3,}[A-Z .,;|]{0,40}\d{1,4}\W*$|^Bdsib|^Digit|^Google|^[-—\s]{2,}$')
CAP = re.compile(r'^C[a-z]{1,2}[.,]? ?[IVXLlHhMmTt1!\[|FfEÉ]{1,6}[.,]?(\s.{0,10})?$')
PARS = re.compile(r'^PARS [A-Z]+\.?$')

def flow():
    L = open(SRC, errors='replace').read().split('\n')
    a = next(i for i, l in enumerate(L) if l.strip().startswith('IN BREVILOQUIUM PROLOGUS'))
    b = next(i for i, l in enumerate(L) if l.strip().startswith('Explicit Breviloquium'))
    items = []; infn = False
    for blk in blocks_of(L[a+1:b+1]):
        t = join_lines(blk)
        if len(blk) <= 2 and (HEAD.match(t) or (re.search(r'PRO[A-Z]{3,}|BREV[A-Z]{3,}|BRE[A-Z]{4,}|PROL', t) and not re.search(r'[a-z]{3,}', t) and len(t) < 60)): infn = False; continue
        if PARS.match(t): items.append(('pars', t)); infn = False; continue
        if CAP.match(t): items.append(('cap', t)); continue
        if re.match(r'^\(\S{1,3}\) ', t) or re.match(r'^\(\S{1,3}\)', t) or re.match(r'^Cfr\.', t): infn = True
        if infn: continue
        items.append(('b', strip_notes(t)))
    return items

import difflib
PARTS = [
 ('De Trinitate Dei', ['De illis septem, de quibus est theologia, in summa', 'Quid tenendum est de trinitate personarum et unitate essentiae', 'De istius fidei intelligentia sana', 'De istius fidei expressione catholica', 'De unitate divinae naturae in multiformitate apparitionum', 'De unitate divinae naturae in multiplicitate appropriatorum', 'De omnipotentia Dei', 'De Dei sapientia, praedestinatione et praescientia', 'De voluntate Dei et providentia']),
 ('De creatura mundi', ['De productione mundi totalis', 'De natura corporali quantum ad fieri', 'De natura corporali quantum ad esse', 'De natura corporali quantum ad operari et influere', 'De modo describendi praedicta in sacra Scriptura', 'De productione superiorum spirituum', 'De apostasia daemonum', 'De confirmatione bonorum Angelorum', 'De productione hominis quantum ad spiritum', 'De productione hominis quantum ad corpus', 'De productione hominis quantum ad totum coniunctum', 'De completione et ordinatione totius mundi consummati']),
 ('De corruptela peccati', ['De origine mali in communi', 'De primorum parentum tentatione', 'De primorum parentum transgressione', 'De primorum parentum punitione', 'De originalis peccati corruptione', 'De originalis peccati transfusione', 'De originalis peccati curatione', 'De origine peccatorum actualium', 'De origine et distinctione capitalium peccatorum', 'De origine et qualitate peccatorum poenalium', 'De origine peccatorum finalium, quae sunt peccata in Spiritum sanctum']),
 ('De incarnatione Verbi', ['De ratione, qua Verbum Dei debuit incarnari vel decuit', 'De incarnatione quantum ad unionem naturarum', 'De incarnatione quantum ad modum', 'De incarnatione quantum ad plenitudinem temporum', 'De plenitudine gratiae Christi quantum ad charismata in affectu', 'De plenitudine sapientiae in intellectu', 'De perfectione meriti in effectu', 'De passione Christi quantum ad statum patientis', 'De passione Christi quantum ad modum patiendi', 'De passione Christi quantum ad exitum passionis']),
 ('De gratia Spiritus sancti', ['De gratia, in quantum est donum divinitus datum', 'De gratia, in quantum educit liberum arbitrium extra peccatum', 'De gratia, in quantum iuvat ad bonum', 'De ramificatione gratiae in habitus virtutum', 'De ramificatione gratiae in habitus donorum', 'De ramificatione gratiae in habitus beatitudinum et per consequens fructuum et sensuum', 'De exercitio gratiae respectu credendorum', 'De exercitio gratiae respectu diligendorum', 'De exercitio gratiae respectu agendorum, praeceptorum et consiliorum', 'De exercitio gratiae respectu petendorum et orandorum']),
 ('De medicina sacramentali', ['De Sacramentorum origine', 'De Sacramentorum variatione', 'De Sacramentorum numero et distinctione', 'De Sacramentorum institutione', 'De Sacramentorum dispensatione', 'De Sacramentorum iteratione', 'De constitutione et integritate baptismi', 'De integritate confirmationis', 'De integritate eucharistiae', 'De integritate poenitentiae', 'De integritate unctionis extremae', 'De integritate ordinis', 'De integritate matrimonii']),
 ('De statu finalis iudicii', ['De iudicio in communi', 'De antecedentibus ad iudicium, cuiusmodi est poena purgatorii', 'De antecedentibus ad iudicium, cuiusmodi sunt suffragia ecclesiastica', 'De concomitantibus iudicium, sicut est conflagratio ignium', 'De concomitantibus iudicium, sicut est resurrectio corporum', 'De consequentibus ad iudicium, sicut est poena infernalis', 'De gloria paradisi']),
]
NUM = re.compile(r'^([0-9SgbIl!]{1,2})[.,] (?=\S)')

def norm(t): return re.sub(r'[^a-z ]', '', re.sub(r'^C[a-z]{1,2}[.,]? ?[IVXLlHhMmTt1!\[|FfEÉ]{1,6}[.,]? ?', '', t).lower())

def locate(items, start):
    """-> list of (part, chap, item_index_of_title_block, title_in_body)"""
    pos = start; out = []
    for pi, (ptitle, titles) in enumerate(PARTS):
        pos = next(i for i in range(pos, len(items)) if items[i][0] == 'pars')   # PARS heading
        pos += 1
        for ci, ti in enumerate(titles):
            best = (0, None)
            for j in range(pos, min(pos + 400, len(items))):
                k, t = items[j]
                if k == 'pars' and j > pos + 1: break
                if len(t.split()) > 30 or NUM.match(t): continue
                r = difflib.SequenceMatcher(None, norm(t), ti.lower().replace(',', '')).ratio()
                if r > best[0]: best = (r, j)
                if r > 0.8: break
            if best[0] < 0.8: best = (best[0], None)
            out.append((pi, ci, best[1], best[0]))
            if best[1] is not None: pos = best[1] + 1
    return out


def paras_of(blocks, prologue=False):
    """body blocks -> paragraph strings, numbered; page-break continuations merged"""
    out = []; n = 0
    for t in blocks:
        t = t.strip()
        if not t or (len(t.split()) < 3 and not NUM.match(t) and not re.search(r'[a-z]{3,}', t)): continue
        m = NUM.match(t)
        sub = re.match(r'^[S8§]\s*\d\.\s+(De .*)$', t)
        if sub and len(t.split()) < 14:
            out.append('## ' + sub.group(1).strip()); n = 0; continue
        if m:
            n += 1; out.append('%d. %s' % (n, t[m.end():])); continue
        if out and not out[-1].startswith('## ') and (t[:1].islower() or not re.search(r'[.:;?»)]$', out[-1])):
            out[-1] += ' ' + t
        else:
            out.append(t)
    return out

def build():
    it = flow(); lo = locate(it, 148)
    starts = []   # (pi, ci, index, title_text)
    for pi, ci, j, r in lo:
        if j is not None:
            k, t = it[j]
            ttl = re.sub(r'^C[a-z]{1,2}[.,]? ?[IVXLlHhMmTt1!\[|FfEÉ]{1,6}[.,]? ?', '', t)
            starts.append((pi, ci, j, ttl))
    pars_pos = [i for i, (k, t) in enumerate(it) if k == 'pars']
    log = []
    files = {}; toc = []
    prol = [t for k, t in it[:pars_pos[0]] if k == 'b']
    # the prologue ends with the chapter list: keep it
    files['prologus'] = '# Prologus\n\n' + fix_ocr('\n\n'.join(paras_of(prol)), log)
    toc.append(('prologus', {'la': 'Prologus'}))
    for pi, (ptitle, titles) in enumerate(PARTS):
        node = []
        mine = [x for x in starts if x[0] == pi]
        end_part = pars_pos[pi + 1] if pi + 1 < len(pars_pos) else len(it) - 1
        for n, (a, ci, j, ttl) in enumerate(mine):
            e = mine[n + 1][2] if n + 1 < len(mine) else end_part
            body = [t for k, t in it[j + 1:e] if k == 'b']
            nxt = mine[n + 1][1] if n + 1 < len(mine) else len(titles)
            span = list(range(ci, nxt))
            cid = 'p%dc%02d' % (pi + 1, ci + 1)
            if len(span) == 1: title = 'Caput %s. %s' % (roman(ci + 1), titles[ci])
            else: title = 'Capita %s-%s. %s' % (roman(span[0] + 1), roman(span[-1] + 1), '; '.join(titles[x] for x in span))
            files[cid] = '# %s\n\n' % title + fix_ocr('\n\n'.join(paras_of(body)), log)
            node.append((cid, {'la': title}))
        toc.append(('pars%d' % (pi + 1), {'la': 'Pars %s. %s' % (roman(pi + 1), ptitle)}, node))
    return files, toc, log


if __name__ == '__main__':
    files, toc, log = build()
    names = {'la': 'Breviloquium', 'en-US': 'Breviloquium', 'pt-BR': 'Breviloquium'}
    descr = {'la': 'Compendium theologiae a Bonaventura circa annum 1257 conscriptum: prologus de sacra Scriptura et septem partes de Trinitate, creatura mundi, corruptela peccati, incarnatione Verbi, gratia Spiritus sancti, medicina sacramentali et statu finalis iudicii. Textus ex editione Quaracchi (Tria opuscula, ed. 3, 1911), ex scanno OCR, sine notis criticis.',
             'en-US': 'A compendium of theology written about 1257: a prologue on Scripture and seven parts on the Trinity, the creation of the world, the corruption of sin, the incarnation of the Word, the grace of the Holy Spirit, the sacramental remedy and the state of the final judgment. The Latin is the Quaracchi text (Tria opuscula, 3rd ed., 1911), from an OCR scan, without the editors’ critical notes.',
             'pt-BR': 'Compêndio de teologia escrito por volta de 1257: um prólogo sobre a Escritura e sete partes sobre a Trindade, a criação do mundo, a corrupção do pecado, a encarnação do Verbo, a graça do Espírito Santo, o remédio sacramental e o estado do juízo final.'}
    s = [src('la', 'https://archive.org/details/triaopusculaseraphici3ed', 'Tria opuscula Seraphici Doctoris S. Bonaventurae: Breviloquium, Itinerarium mentis in Deum, De reductione artium ad theologiam, ed. 3 (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, 1911).', 'Archive.org OCR of the octavo edition. Page heads, the editors’ footnotes (variant readings and cross-references) and note markers are removed; line-end hyphens are joined; recognisable OCR slips are corrected by comparison with the other Quaracchi scans. Where the scan lost a chapter heading the chapters run together under one title (Pars IV 4-5, Pars V 2, 4-6 and 8, 10).', 'A', 'Bonaventure died in 1274; the Quaracchi edition of 1911 is public domain.')]
    emit('breviloquium', 'bonaventure-breviloquium', names, descr, '1257', 'bonaventure/breviloquium', ['la'],
         {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': 1911}}, s, toc, {'la': files})
    print(sum(len(t.split()) for t in files.values()), len(log))
