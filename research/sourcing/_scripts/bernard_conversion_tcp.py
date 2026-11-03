"""Bernard, A Mirror that Flatters Not (London 1677), EEBO-TCP A27472 -> the English-only book
bernard-opera-omnia/de-conversione-ad-clericos-mirror (work bernard/de-conversione-ad-clericos).
The translator cut the sermon to the clergy into 31 chapters where the Maurist text has 22, so it is
its own book. The three 'sermons' printed after it are Bernard's Parabolae I-III and follow as a group.
Long s normalised; marginal notes become footnotes; <gap/> becomes […].
usage: python3.13 bernard_conversion_tcp.py"""
import json, os, re, sys, shutil
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
import rhb_tcp as T
NS, tag = T.NS, T.tag
ROOT = '/Users/gustavo/Documents/prayer'
SRC = ROOT + '/research/sourcing/_skipped/samples/A27472.xml'
BOOK = ROOT + '/content/books/bernard-opera-omnia/de-conversione-ad-clericos-mirror'
ROMAN = 'I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII XXIII XXIV XXV XXVI XXVII XXVIII XXIX XXX XXXI'.split()


def fix(t):
    t = t.replace('ſ', 's').replace('Ʋ', 'V').replace('▪', '.')
    t = re.sub(r'^([A-Z])([A-Z]+)\b', lambda m: m.group(1) + m.group(2).lower(), t)  # drop-cap word
    t = t.replace('vv', 'w').replace('VV', 'W').replace('Vv', 'W')  # some formes were set with vv for w
    t = re.sub(r'\s+(\[\^\d+\])', r'\1', t)
    return t


# one illegible letter each in the TCP keying, where the word is not in doubt
GAPS = {'off[…]rs': 'offers', 'h[…]gh': 'high', 'Bless[…]d': 'Blessed', 'o[…] Conversion': 'or Conversion',
        'fi[…]e and water': 'fire and water', 'gre[…]t Exterminator': 'great Exterminator'}


def head_text(h):
    return fix(T.clean(''.join(h.itertext())))


def write(cid, title, div, stats):
    cx = T.Ctx()
    ps = []
    T.blocks(div, cx, ps)
    ps = [fix(p) for p in ps if p.strip()]
    for k, v in GAPS.items():
        ps = [p.replace(k, v) for p in ps]
    # "MUltiplicasti", "BEtwixt": a two-letter capital opening from the decorated initial
    ps = [re.sub(r'^([A-Z])([A-Z])([a-z])', lambda m: m.group(1) + m.group(2).lower() + m.group(3), p) for p in ps]
    md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps))
    if cx.notes:
        md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, fix(n)) for i, n in enumerate(cx.notes)) + '\n'
    open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md)
    stats['words'] += len(md.split()); stats['gaps'] += cx.gaps; stats['notes'] += len(cx.notes)
    return {'id': cid, 'title': {'en-US': title}}


def main():
    text = ET.parse(SRC).getroot().find(NS + 'text')
    front = {d.get('type'): d for d in text.find(NS + 'front') if tag(d) == 'div'}
    sermons = [d for d in text.find(NS + 'body') if tag(d) == 'div']
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    for f in os.listdir(BOOK + '/en-US'):
        os.remove(BOOK + '/en-US/' + f)
    os.makedirs(BOOK + '/sources/english-originals', exist_ok=True)
    shutil.copy(SRC, BOOK + '/sources/english-originals/A27472.xml')
    st = {'words': 0, 'gaps': 0, 'notes': 0}
    toc = [write('preface', "The Translator's Preface to All New-Converts", front['translators_preface_to_the_reader'], st)]
    chaps = []
    for i, d in enumerate(k for k in sermons[0] if tag(k) == 'div'):
        h = head_text(d.find(NS + 'head'))
        m = re.match(r'CHAP\.\s*([IVXL]+)\.\s*(.*)', h, re.I)
        assert m and m.group(1) == ROMAN[i], h
        chaps.append(write('c%02d' % (i + 1), 'Chapter %s. %s' % (m.group(1), m.group(2).rstrip('.')), d, st))
    toc.append({'id': 'sermon-to-the-clergy', 'title': {'en-US': 'A Sermon Preached to the Clergy concerning Conversion'}, 'children': chaps})
    parables = []
    for i, d in enumerate(sermons[1:]):
        heads = [head_text(h) for h in d.findall(NS + 'head')]
        sub = ': ' + heads[1].rstrip('.') if len(heads) > 1 else ''
        parables.append(write('parable-%d' % (i + 1), 'Sermon %s%s' % (ROMAN[i], sub), d, st))
    toc.append({'id': 'parables', 'title': {'en-US': 'Three Sermons (the Parables)'}, 'children': parables})
    print(st)
    book = {
        'id': 'bernard-de-conversione-mirror', 'cover': 'classic',
        'name': {'en-US': 'A Mirror that Flatters Not: On Conversion (1677)', 'pt-BR': 'Um espelho que não lisonjeia: Sobre a conversão (inglês, 1677)'},
        'author': {'la': 'Bernardus Claraevallensis', 'en-US': 'St. Bernard of Clairvaux', 'pt-BR': 'São Bernardo de Claraval'},
        'description': {
            'en-US': "The anonymous English of 1677 of Bernard's sermon to the clergy of Paris on conversion, cut by the translator into thirty-one chapters (the Maurist text has twenty-two, so this is its own book of the work), with his preface to all new converts and three more 'sermons' that are Bernard's first three Parables: the king's son, and the war between Babylon and Jerusalem.",
            'pt-BR': "A tradução inglesa anônima de 1677 do sermão de São Bernardo aos clérigos de Paris sobre a conversão, dividido pelo tradutor em trinta e um capítulos, com o prefácio do tradutor e três 'sermões' que são as três primeiras Parábolas de Bernardo."},
        'composed': 'c. 1140', 'languages': ['en-US'], 'work': 'bernard/de-conversione-ad-clericos',
        'editions': {'en-US': {'translator': 'Anonymous (London)', 'year': 1677}},
        'sources': [{'language': 'en-US', 'url': 'https://github.com/textcreationpartnership/A27472',
                     'edition': 'A Mirror that Flatters Not: or, a Looking-glass for all New-Converts, that is, certain Sermons of St. Bernard translated into English (London, 1677), EEBO-TCP A27472.',
                     'description': "EEBO-TCP hand-keyed transcription, original spelling kept; long s printed as s. The %d letters illegible in the source are restored, the word being in no doubt (h[…]gh, Bless[…]d). The printed list of faults (errata) is not applied. Raw TEI in sources/english-originals/." % st['gaps'],
                     'tier': 'A', 'tierEvidence': 'Printed 1677; the TCP transcription is released to the public domain (CC0).'}],
        'toc': toc,
        'arrived': {'en-US': '2026-11-03'},
    }
    json.dump(book, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
