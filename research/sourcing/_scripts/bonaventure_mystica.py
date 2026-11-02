"""Mystical opuscula from Decem opuscula (Quaracchi 1900). usage: python3 -I bonaventure_mystica.py [dry]"""
import re, sys
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *

SRC = 'research/sourcing/bonaventure/la/decemopusculaadt00bona.txt'
UP = lambda t: sum(c.isupper() for c in t) >= 0.7 * max(1, sum(c.isalpha() for c in t))
CAPH = re.compile(r'^(CAPUT|CAP\.?|Cap\.|Caput|PARS|Pars)\s+([IVXLl1]+|[Pp]rim\w+)[.,]?$')
SECT = re.compile(r'^[S§8]\s?(\d+)[.,]?$')

def flow(lo, hi, titleline=None):
    L = open(SRC, errors='replace').read().split('\n')[lo-1:hi]
    L = [re.sub(r'\s+', ' ', l).strip() for l in L]
    items = []; infn = False
    def presplit(bs):
        for blk in bs:
            cur = []
            for ln in blk:
                if cur and (re.match(r'^(CAPUT|CAP|Cap|Caput|GAP|OAP)\.?\s*[IVXLlH1]{1,5}[.,]?\s*$', ln) or re.match(r'^Prologus\.?\s*\S?$', ln)):
                    yield cur; cur = []
                cur.append(ln)
            yield cur
    for blk in presplit(blocks_of(L)):
        t = join_lines(blk)
        pagehead = len(blk) == 1 and (re.search(r'\d{1,3}$', t) or re.match(r'^\d{1,3} ', t)) and UP(re.sub(r'\d', '', t)) and len(t) < 90
        if pagehead: infn = False; continue
        if len(blk) == 1 and (UP(t) and len(t) < 80):
            items.append(('H', t)); infn = False if CAPH.match(t) else infn; continue
        if re.match(r'^[\^*•·]', t) or re.match(r'^\d\s*$', t): infn = True
        if re.match(r'^[1-9]\s+\S', t) and len(t.split()) < 40 and not re.match(r'^\d\.', t): continue
        if infn: continue
        items.append(('b', strip_notes(re.sub(r'\s*[\^]\s*\d*', '', t))))
    return items


CAPRE = re.compile(r'^(?:CAPUT|CAPITULUM|Capitulum|CAP|Cap|Caput|C\.\\P|GAP|OAP)\.?\s*([IVXLlHU1]+)[.,]?\s*(.*)$')
FRUCT = re.compile(r'^F[A-Za-z]{3,6}US\s+([IVXLYH]+)\.?\s*(.*)$', re.I)

def roman_val(r):
    r = r.replace('l', 'I').replace('1', 'I').replace('H', 'II').replace('U', 'II')
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50}; n = 0
    for i, c in enumerate(r):
        if c not in v: return 0
        n += -v[c] if i + 1 < len(r) and v[c] < v.get(r[i+1], 0) else v[c]
    return n

def cleaned(t, log):
    t = re.sub(r'\b[JlL]esus\b', 'Iesus', t); t = re.sub(r'\b[JlL]esu\b', 'Iesu', t); t = re.sub(r'^\\\. ', '1. ', t)
    return fix_ocr(t, log)

def split(items, mode):
    """-> list of (key, title, [lines])"""
    chs = [['prologus', 'Prologus', []]]; log = []
    i = 0; started = mode != 'caps'
    while i < len(items):
        k, t = items[i]
        m = CAPRE.match(t) if (k == 'H' or len(t.split()) < 9) else None
        if m and mode == 'cap':
            n = len(chs)
            rv = roman_val(m.group(1))
            last = int(chs[-1][0][1:]) if len(chs) > 1 and chs[-1][0][0] == 'c' else 0
            n = last + 1 if not rv or rv <= last or rv > last + 3 else rv
            title = m.group(2).strip()
            if not title and i + 1 < len(items) and len(items[i+1][1].split()) < 25 and not re.match(r'^\d', items[i+1][1]):
                title = items[i+1][1]; i += 1
            chs.append(['c%02d' % n, 'Caput %s%s' % (roman(n), ('. ' + title.rstrip('.')) if title else ''), []]); i += 1; continue
        if mode == 'caps' and k == 'H' and t.startswith('EXPLICIT PROLOGUS'): started = True
        if mode == 'caps' and started and k == 'H' and re.match(r'^DE ', t) and chs[-1][2]:
            chs.append(['m%02d' % len(chs), t.capitalize().rstrip('.'), []]); i += 1; continue
        f = FRUCT.match(t) if mode == 'caps' and len(t.split()) < 12 else None
        if f:
            chs[-1][2].append('## Fructus %s. %s' % (f.group(1).upper(), f.group(2).capitalize().rstrip('.'))); i += 1; continue
        m2 = SECT.match(t)
        if m2:
            ttl = ''
            if i + 1 < len(items) and len(items[i+1][1].split()) < 25 and not re.match(r'^\d+\.', items[i+1][1]) and not SECT.match(items[i+1][1]):
                ttl = items[i+1][1]; i += 1
            chs[-1][2].append('## §%s.%s' % (m2.group(1), (' ' + ttl.rstrip('.')) if ttl else '')); i += 1; continue
        m3 = re.match(r'^§\s?(\d+)[.,]?\s+(.{3,90})$', t)
        if m3 and len(t.split()) < 18:
            chs[-1][2].append('## §%s. %s' % (m3.group(1), m3.group(2).rstrip('.'))); i += 1; continue
        if k == 'H': chs[-1][2].append('## ' + t.capitalize()) if len(t) < 70 else chs[-1][2].append(t)
        else: chs[-1][2].append(t)
        i += 1
    out = []
    for key, title, ls in chs:
        if key == 'prologus' and not [x for x in ls if not x.startswith('## ')]: continue
        while ls and (ls[0].startswith('## ') or len(re.findall(r'[A-Za-z]', ls[0])) < 4 or re.match(r'^[^A-Za-z]*$|^[■>^\W]{1,3}\w{0,6}$', ls[0])): ls = ls[1:]
        title = re.sub(r'\.? ?OPUSC\..*$', '', title)
        out.append((key, title, [cleaned(x, log) for x in ls]))
    return out, log

WORKS = [
 # slug, lo, hi, mode
 ('de-triplici-via', 255, 1835, 'cap'),
 ('soliloquium', 1836, 6501, 'cap'),
 ('lignum-vitae', 6502, 8628, 'caps'),
 ('de-quinque-festivitatibus', 8629, 9437, 'cap'),
 ('de-praeparatione-ad-missam', 9438, 10273, 'cap'),
 ('de-perfectione-vitae-ad-sorores', 10274, 12761, 'cap'),
 ('de-regimine-animae', 12762, 13048, 'cap'),
 ('de-sex-alis-seraphim', 13051, 15849, 'cap'),
 ('officium-de-passione', 15852, 16857, 'cap'),
 ('vitis-mystica', 16858, 19617, 'cap'),
]


META = {
 'de-triplici-via': ('De triplici via', 'The Threefold Way', 'Os três caminhos', 'Incendium amoris', 'The Fire of Love', 'c. 1260',
   'Tractatus de via purgativa, illuminativa et unitiva, in tribus capitibus, alias Incendium amoris dictus.', 'A treatise on the purgative, illuminative and unitive ways, also called “The Fire of Love”: the soul’s ascent in three chapters, from the lament over its misery to the contemplation that reaches true wisdom.', 'Tratado sobre as vias purgativa, iluminativa e unitiva, também chamado «Incêndio de amor».'),
 'soliloquium': ('Soliloquium de quatuor mentalibus exercitiis', 'The Soliloquy on the Four Spiritual Exercises', 'Solilóquio sobre os quatro exercícios mentais', None, None, 'c. 1259',
   'Dialogus animae cum homine interiore de quattuor exercitiis mentalibus: de cognitione sui, de miseria mundi, de morte et de iudicio.', 'A dialogue of the soul with the inner man in four chapters: the knowledge of oneself, the misery of the world, death, and the last things.', 'Diálogo da alma com o homem interior em quatro capítulos: o conhecimento de si, a miséria do mundo, a morte e as últimas coisas.'),
 'lignum-vitae': ('Lignum vitae', 'The Tree of Life', 'A árvore da vida', None, None, 'c. 1260',
   'Meditatio de mysteriis Christi in duodecim fructibus arboris vitae, per mysterium originis, passionis et glorificationis.', 'A meditation on the life of Christ as a tree of twelve fruits, in the mysteries of his origin, his passion and his glorification; each fruit has four verses on Jesus and a prayer.', 'Meditação sobre a vida de Cristo como uma árvore de doze frutos, nos mistérios de sua origem, de sua paixão e de sua glorificação.'),
 'de-quinque-festivitatibus': ('De quinque festivitatibus pueri Iesu', 'The Five Feasts of the Child Jesus', 'As cinco festas do Menino Jesus', None, None, 'c. 1255',
   'Meditationes de quinque festivitatibus pueri Iesu: nativitate, circumcisione, epiphania, praesentatione et occursu in templo.', 'Meditations on the five feasts of the Child Jesus: his birth, circumcision, epiphany, presentation and the finding in the temple.', 'Meditações sobre as cinco festas do Menino Jesus: o nascimento, a circuncisão, a epifania, a apresentação e o encontro no templo.'),
 'de-praeparatione-ad-missam': ('Tractatus de praeparatione ad Missam', 'On the Preparation for Mass', 'Tratado sobre a preparação para a Missa', None, None, 'c. 1260',
   'Tractatus de praeparatione ad Missam, in duobus capitibus: de probatione sui ipsius et de contritione, confessione et praeparatione immediata.', 'A short guide to preparing for Mass in two chapters: the examination of oneself, then contrition, confession and the immediate preparation.', 'Breve guia de preparação para a Missa em dois capítulos: o exame de si mesmo e depois a contrição, a confissão e a preparação imediata.'),
 'de-perfectione-vitae-ad-sorores': ('De perfectione vitae ad sorores', 'The Perfection of Life, for Sisters', 'A perfeição da vida, para as irmãs', None, None, 'c. 1260',
   'Epistola ad sororem sanctae Claram, de perfectione vitae, in octo capitibus: de cognitione sui, humilitate, paupertate, silentio, oratione, memoria passionis, caritate et perseverantia.', 'A letter of spiritual direction to a Poor Clare in eight chapters: self-knowledge, humility, poverty, silence, prayer, the memory of the Passion, charity and final perseverance.', 'Carta de direção espiritual a uma clarissa em oito capítulos: conhecimento de si, humildade, pobreza, silêncio, oração, memória da Paixão, caridade e perseverança final.'),
 'de-regimine-animae': ('De regimine animae', 'The Government of the Soul', 'O governo da alma', None, None, 'c. 1260',
   'Brevis tractatus de regimine animae, ad quendam religiosum.', 'A short rule for the soul’s conduct, in the form of counsels on thinking rightly of God, oneself and one’s neighbour.', 'Breve regra para a conduta da alma, em forma de conselhos sobre o modo de pensar bem de Deus, de si e do próximo.'),
 'de-sex-alis-seraphim': ('De sex alis Seraphim', 'The Six Wings of the Seraph', 'As seis asas do Serafim', None, None, 'c. 1260',
   'Tractatus de sex alis Seraphim: sex virtutes praelati, zelus iustitiae, pietas compatiens, patientia, exemplaritas vitae, circumspecta discretio et devotio ad Deum.', 'A treatise for superiors on the six wings of the seraph, six virtues of a prelate: zeal for justice, compassionate piety, patience, example of life, prudent discretion and devotion to God.', 'Tratado para superiores sobre as seis asas do serafim, seis virtudes do prelado: zelo da justiça, piedade compassiva, paciência, exemplaridade de vida, discrição prudente e devoção a Deus.'),
 'officium-de-passione': ('Officium de passione Domini', 'The Office of the Passion', 'O Ofício da Paixão do Senhor', None, None, 'c. 1260',
   'Officium rhythmicum de passione Domini per horas canonicas, a Matutino ad Completorium.', 'A rhymed Office of the Lord’s Passion through the canonical hours, from Matins to Compline.', 'Ofício rimado da Paixão do Senhor através das horas canônicas, das Matinas às Completas.'),
 'vitis-mystica': ('Vitis mystica seu tractatus de passione Domini', 'The Mystical Vine', 'A videira mística', None, None, 'c. 1260',
   'Tractatus de passione Domini sub figura vitis, in viginti quattuor capitibus: de proprietatibus vitis, foliis, floribus et fructu.', 'A treatise on the Lord’s Passion under the figure of the vine, in twenty-four chapters: its properties, leaves (the seven words on the cross), flowers and fruit.', 'Tratado sobre a Paixão do Senhor sob a figura da videira, em vinte e quatro capítulos: suas propriedades, folhas (as sete palavras na cruz), flores e fruto.'),
}

def run(only=None):
    out = []
    for slug, lo, hi, mode in WORKS:
        if only and slug not in only: continue
        la_name, en_name, pt_name, la2, en2, comp, d_la, d_en, d_pt = META[slug]
        items = flow(lo, hi)
        if slug == 'de-triplici-via': items = [('H', 'CAP. I.') if x == ('H', 'I') else x for x in items]
        chs, log = split(items, mode)
        if slug == 'vitis-mystica':
            while chs[-1][0] != 'prologus' and len(' '.join(chs[-1][2]).split()) < 60: chs.pop()
        if len(chs) == 1:
            chs = [('textus', la_name, chs[0][2])]
        files = {}; toc = []
        for key, title, ls in chs:
            files[key] = '# %s\n\n' % title + '\n\n'.join(ls)
            toc.append((key, {'la': title}))
        names = {'la': la_name, 'en-US': en_name, 'pt-BR': pt_name}
        descr = {'la': d_la + ' Textus ex editione Quaracchi (Decem opuscula, 1900), ex scanno OCR, sine notis criticis.',
                 'en-US': d_en + ' The Latin is the Quaracchi text of the Decem opuscula (1900), from an OCR scan, without the editors’ critical notes.', 'pt-BR': d_pt}
        s = [src('la', 'https://archive.org/details/decemopusculaadt00bona', 'S. Bonaventurae Decem opuscula ad theologiam mysticam spectantia, ed. 2 (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, 1900).', 'Archive.org OCR of the octavo edition. Page heads, the editors’ footnotes (variant readings and cross-references) and note markers are removed; line-end hyphens are joined; recognisable OCR slips are corrected by comparison with the other Quaracchi scans, so some remain.', 'A', 'Bonaventure died in 1274; the Quaracchi edition of 1900 is public domain.')]
        emit(slug, 'bonaventure-' + slug, names, descr, comp, 'bonaventure/' + slug, ['la'],
             {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': 1900}}, s, toc, {'la': files})
        out.append((slug, sum(len(t.split()) for t in files.values()), len(chs), len(log)))
    return out

if __name__ == '__main__':
    for r in run(sys.argv[1:] or None): print(r)
