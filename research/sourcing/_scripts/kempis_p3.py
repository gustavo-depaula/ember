"""Pohl III (1904) + Scully (1907): Sermones de vita et passione Domini, 35 sermons, Latin and English."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from kempis_common import clean, clean_en, mend, fix, capsish
import kempis_fix as kf
import bookjson
from kempis_pair import ROOT, AU, md

LF = 'research/sourcing/kempis/pohl/operaomnia0002thom.txt'
EF = 'research/sourcing/kempis/en/meditationincarn00thomuoft.txt'
LA_T = ['De desiderio prophetarum et devota praeparatione erga adventum Christi', 'De occursu et susceptione caelestis Regis', 'In nativitate Christi. De festis animae', 'In nocte nativitatis Christi de quaerendo parvulo Iesu', 'De devota visitatione nati pueri Iesu', 'De mansione apud venerabile Christi praesepe', 'De gaudio huius diei et devoto obsequio Iesu', 'De desiderio videndi et osculandi Iesum', 'Ad beatam virginem, ut ostendat nobis Iesum filium suum', 'De perditione et inventione Iesu in templo', 'De quatuor modis videndi Iesum secundum devotionis affectum', 'De sacra institutione ieiunii secundum formam Iesu Christi', 'De ferventiori emendatione nunc assumenda', 'De ascensu Moysi in montem Sinai', 'De verbis Iesu et munditia cordis', 'De amore Iesu et abnegatione sui', 'De paupertate Iesu sectanda, et cura temporalium abicienda', 'De fatigatione Iesu et salutari eius doctrina', 'De scriptura Iesu et misericordia eius in peccatricem', 'De custodia humilitatis ex consideratione propriae fragilitatis', 'Dominica in passione. De planctu super passionem Domini', 'De cruce Iesu, quam pro nobis ipse portavit', 'De merito Dominicae passionis, et dignitate sanctae crucis', 'De multiplici fructu ex recordatione Dominicae passionis, et de gratitudine eius', 'De utili exercitio in Christi passione', 'De septem notabilibus punctis cogitandi de passione Christi', 'In festo palmarum de processione Christi, et sex generibus hominum obsequentium Christo. Sermo primus', 'De equitatu Christi non in curru Pharaonis sed in asello humilitatis. Sermo secundus', 'De resurrectione Christi, et spirituali consolatione animae', 'De gaudio Dominicae resurrectionis', 'De mystico paschae nomine, et novae vitae conversatione', 'De ascensione Iesu in caelum', 'In festo pentecostes, de donis Spiritus sancti', 'De consolatione Spiritus sancti', 'De sancta et unanimi conversatione primitivae ecclesiae in Hierosolymis']
EN_T = ['Of the desire of the Prophets and of devout preparation for the coming of Christ', 'Of meeting and welcoming the Heavenly King', 'On Christmas day. Of the feasts of the soul', 'On Christmas night. Of seeking the Infant Jesus', 'Of the devout visiting of the new-born Infant Jesus', 'Of abiding near the venerable Crib of Christ', 'Of the joy of this day, and the devout service of Jesus', 'Of the desire of seeing and embracing Jesus', 'To the Blessed Virgin, that she show us her Son, Jesus', 'Of the loss and finding of Jesus in the Temple', 'Of four ways of seeing Jesus, according to the affection of devotion', 'Of the sacred institution of the Fast, after the example of Jesus Christ', 'Of taking up now a more fervent amendment of life', 'Of the going up of Moses into Mount Sinai', 'Of the words of Jesus, and cleanness of heart', 'Of the love of Jesus and self-denial', 'Of following the poverty of Jesus, and casting aside care for temporal things', 'Of the weariness of Jesus and His saving doctrine', 'Of the writing of Jesus and His mercy towards the sinful woman', 'Of keeping humility from the consideration of our own weakness', 'Passion Sunday. Of lamenting over Our Lord\'s Passion', 'Of the Cross of Jesus, which He bore for us', 'Of the merit of the Lord\'s Passion, and the dignity of the Holy Cross', 'Of the manifold fruit from remembrance of the Lord\'s Passion, and of thankfulness therefor', 'Of profitable exercise in the Passion of Christ', 'Of seven notable points of meditation on the Passion of Christ', 'On Palm Sunday. Of the procession of Christ, and of the six classes of men who honour Christ. First sermon', 'Of the riding of Christ, not in Pharaoh\'s chariot, but on the ass of humility. Second sermon', 'Of the Resurrection of Christ, and the spiritual consolation of the soul', 'Of the joy of the Lord\'s Resurrection', 'Of the mystic name of Easter, and of the conversation of the new life', 'Of the Ascension of Jesus into heaven', 'On Pentecost: of the gifts of the Holy Spirit', 'Of the consolation of the Holy Spirit', 'Of the holy and united conversation of the primitive Church in Jerusalem']
LA_S = [2793, 3058, 3438, 3731, 3900, 4045, 4373, 4723, 5007, 5285, 5677, 5979, 6263, 6402, 6581, 6758, 6839, 7018, 7226, 7412, 7523, 8141, 8390, 8794, 8976, 9312, 10783, 11279, 11596, 11796, 12062, 12235, 12459, 12701, 12975]
LA_END = 13298
EN_S = [2925, 3131, 3471, 3717, 3863, 3991, 4267, 4567, 4814, 5064, 5377, 5631, 5875, 5987, 6137, 6275, 6351, 6482, 6644, 6803, 6901, 7399, 7614, 7940, 8103, 8384, 9561, 9971, 10226, 10405, 10641, 10787, 10963, 11163, 11374]
EN_END = 11618
SCRIPT = re.compile(r'^(?:[1-4]\s?)?(?:Gen|Exod?|Lev|Num|Deut|Jos|Judg|Ruth|Reg|Par|Esd|Neh|Tob|Jud|Esth|Job|Ps|Prov|Eccl(?:es|i)?|Cant|Wis|Sap|Is|Isa|Jer|Lam|Bar|Ezech?|Dan|Os|Joel|Am|Abd|Jon|Mich|Nah|Hab|Soph|Agg|Zach|Mal|Mach|Matt?|Mt|Marc?|Mc|Luc?|Lc|Jo|Joan|Act|Rom|Cor|Gal|Eph|Phil|Col|Thess|Tim|Tit|Heb|Jac|Jas|Pet|Apoc|Rev)\.?\s*\d+\.\s*\d+[\d,\-–. ]*?\s+(?=[a-z])')


def la_chap(L, a, b):
    i = a
    while i < b and (not L[i].strip() or capsish(L[i].strip()) or 'SERMONES' in L[i] or len(L[i].strip()) < 4):
        i += 1
    ls = kf.repair_open([l for l in L[i:b] if 'SERMONES DE VITA' not in l and 'SERMÓNES' not in l and not re.search(r'[A-Z]{3,}.*\[\d+\]', l)], 14)
    return [kf.tidy(kf.fix_ocr(fix(p))) for p in mend(clean(ls))]


_en = None
REF = re.compile(r'\b(?:[1-4] ?)?(?:Gen|Exod|Lev|Num|Deut|Judg|Kings|Job|Ps|Prov|Eccles|Ecclus|Cant|Wis|Isa|Is|Jer|Lam|Lament|Ezech|Dan|Osee|Joel|Amos|Jon|Mich|Hab|Zach|Mal|Mach|Matt|Mark|Luke|John|Acts|Rom|Cor|Gal|Eph|Phil|Col|Thess|Tim|Tit|Heb|James|Pet|Apoc|Rev)\.?,?\s+[ivxl\d]{1,4}[.,]\s*\d{1,3}(?:[-–]\d+)?[.,]?(?=\s)')


def en_lex():
    global _en
    if _en is None:
        import collections, glob
        _en = collections.Counter()
        for f in glob.glob('content/books/*/*/en-US/*.md')[:1500]:
            for w in re.findall(r"[a-z]{2,}", open(f, errors='replace').read().lower()):
                _en[w] += 1
    return _en


def en_open(p):
    import itertools
    L = en_lex()
    m = re.match(r'^([^A-Za-z]*)([A-Z]{2,})\b(.*)$', p, re.S)
    if not m or L.get(m.group(2).lower(), 0) > 400:
        return p
    t = m.group(2).lower()
    c = {x: L[x] for k in (1, 2) for q in itertools.product('abcdefghilmnopqrstuvwy', repeat=k) for x in [''.join(q) + t] if L.get(x, 0) >= 100}
    if not c:
        return p[:1].upper() + p[1:].lower() if False else m.group(1) + m.group(2).capitalize() + m.group(3)
    srt = sorted(c.values(), reverse=True)
    b = max(c, key=c.get)
    if len(srt) > 1 and srt[1] * 3 > srt[0]:
        return m.group(1) + m.group(2).capitalize() + m.group(3)
    return m.group(1) + b.capitalize() + m.group(3)


def en_chap(L, a, b):
    i = a + 1
    while i < b and (not L[i].strip() or capsish(L[i].strip()) or len(L[i].strip()) < 4 or re.match(r'^[^A-Za-z]*(?:€|¢)', L[i])):
        i += 1
    ls = [SCRIPT.sub('', l.strip()) for l in L[i:b]]
    ps = mend(clean_en([l for l in ls if 'SERMONS' not in l and 'THE  LIFE' not in l]))
    ps = [REF.sub('', p) for p in ps]
    ps = [re.sub(r'\s{2,}', ' ', p) for p in ps]
    return [en_open(ps[0])] + ps[1:] if ps else ps


def main():
    LL = open(LF, errors='replace').read().split('\n')
    EL = open(EF, errors='replace').read().split('\n')
    d = ROOT + 'sermones-de-vita-et-passione'
    for lg in ('la', 'en-US'):
        os.makedirs(f'{d}/{lg}', exist_ok=True)
    toc, wc = [], {'la': 0, 'en-US': 0}
    for n in range(35):
        cid = f's{n + 1:02d}'
        la = la_chap(LL, LA_S[n], LA_S[n + 1] if n < 34 else LA_END)
        en = en_chap(EL, EN_S[n], EN_S[n + 1] if n < 34 else EN_END)
        open(f'{d}/la/{cid}.md', 'w').write(md(f'{n + 1}. {LA_T[n]}', la))
        open(f'{d}/en-US/{cid}.md', 'w').write(md(f'{n + 1}. {EN_T[n]}', en))
        wc['la'] += len(' '.join(la).split()); wc['en-US'] += len(' '.join(en).split())
        toc.append({'id': cid, 'title': {'la': f'{n + 1}. {LA_T[n]}', 'en-US': f'{n + 1}. {EN_T[n]}'}})
    book = {'id': 'kempis-sermones-de-vita-et-passione', 'cover': 'classic',
      'name': {'la': 'Sermones de vita et passione Domini', 'en-US': 'Sermons on the Life and Passion of Our Lord', 'pt-BR': 'Sermões sobre a vida e a paixão do Senhor'},
      'author': AU,
      'description': {'la': 'Triginta quinque sermones Thomae a Kempis de vita et passione Domini, ab adventu Domini usque ad Pentecosten: de desiderio prophetarum, de nativitate, de ieiunio, de passione et cruce, de resurrectione, ascensione et Spiritu sancto. Textus ex editione Pohl (1904), cum versione Anglica V. Scully (1907).',
        'en-US': 'Thirty-five sermons on the life of Christ from Advent to Pentecost: the prophets\' longing, Christmas and the Crib, the fast, the Passion and the Cross (the long meditation on seven points), Palm Sunday, Easter, the Ascension and the Holy Spirit. The Latin is Pohl\'s critical edition (Freiburg 1904), from a raw OCR of the printed volume; the English is Vincent Scully\'s 1907 translation (Kegan Paul), from the same text and following its sermons one for one.',
        'pt-BR': 'Trinta e cinco sermões sobre a vida de Cristo, do Advento a Pentecostes: o desejo dos profetas, o Natal e o presépio, o jejum, a Paixão e a Cruz, o Domingo de Ramos, a Páscoa, a Ascensão e o Espírito Santo.'},
      'composed': 'c. 1430-1450', 'languages': ['la', 'en-US'], 'work': 'thomas-a-kempis/sermones-de-vita-et-passione',
      'editions': {'la': {'editor': 'Michael Joseph Pohl', 'year': 1904}, 'en-US': {'translator': 'Vincent Scully', 'year': 1907}},
      'sources': [{'language': 'la', 'url': 'https://archive.org/details/operaomnia0002thom', 'edition': 'Thomae Hemerken a Kempis Sermones de vita et passione Domini, ed. M. J. Pohl (Freiburg: Herder 1904), Opera omnia III; archive.org raw OCR.',
         'description': 'The 35 sermons with Pohl\'s titles from his table of contents. Line numbers, running heads and page breaks stripped by script; Pohl\'s critical apparatus and introduction not imported. Raw OCR: drop capitals at sermon openings are often garbled and some slips remain after the scripted lexicon repair.', 'tier': 'A', 'tierEvidence': 'Pohl 1904; Thomas died in 1471.'},
        {'language': 'en-US', 'url': 'https://archive.org/details/meditationincarn00thomuoft', 'edition': 'A Meditation on the Incarnation of Christ; Sermons on the Life and Passion of Our Lord; Of Hearing and Speaking Good Words, tr. Vincent Scully (London: Kegan Paul 1907); archive.org OCR.',
         'description': 'The 35 sermons with the titles of Scully\'s table of contents. Running heads and page numbers stripped by script and the margin scripture references that Scully prints beside the text removed where they interrupt a sentence; the translator\'s introduction and footnotes are not imported. Raw OCR: the first letter of each sermon (the drop capital) and some words may be lost.', 'tier': 'A', 'tierEvidence': 'Published 1907; translator Vincent Scully.'}],
      'toc': toc}
    bookjson.write(d, book)
    for lg, f in (('la', LF), ('en-US', EF)):
        os.makedirs(f'{d}/sources/{lg}-originals', exist_ok=True)
        os.system(f"cp '{f}' '{d}/sources/{lg}-originals/'")
    for f, old, new in [('en-US/s05', 'A VEyou seen Him whom my soul lovetb?', 'Have you seen Him whom my soul loveth?'), ('en-US/s05', ' is. 9. 6.', ''), ('en-US/s09', 'Y Spirit hath', 'My spirit hath'),
        ('en-US/s19', 'K^ggsa UT Jesus bowing', 'But Jesus bowing'), ('en-US/s26', 'Ttend and', 'Attend and'), ('en-US/s26', ' Lament, i. like', ' like'), ('en-US/s35', 'HE multitude', 'The multitude'),
        ('la/s01', 'cunctiss gentibus', 'cunctis gentibus'), ('la/s05', 'Jn 2 Vm quem', 'Quem'), ('la/s05', 'GIN) Vobis', 'Vobis')]:
        t = open(f'{d}/{f}.md').read()
        assert old in t, (f, old)
        open(f'{d}/{f}.md', 'w').write(t.replace(old, new, 1))
    print(wc)


if __name__ == '__main__':
    main()
