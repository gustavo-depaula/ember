"""Build the comparison psalters a psalm page sets beside the prayed text.

Run from the repo root:  python3.13 research/psalterium/compare.py 90        (or several numbers; or --all for every ps<NNN>/)
Writes research/psalterium/consult/compare/ps<NNN>.js (gitignored: CNBB, RSV-CE, Ave Maria and Matos Soares are in
copyright, so their text never enters the repo; site/ps<NNN>.html loads the file if it is there and hides the switch if not).

Shape:  window.psalteriumCompare = {psalm, versions: [{id, name, lang, note}], verses: {prayedId: {versionId: [[n, text]]}},
        blocks: {versionId: [[n, text], …] | [[null, raw text]]}}
- Douay-Rheims is from the Vulgate and numbered like it: it stands under each prayed verse.
- CNBB / RSV-CE / KJV follow the Hebrew. Their verse stands under the Vulgate verse of the same number only when the
  psalm has the same number of verses in both families; otherwise the whole version stands once, as a block, above.
- Matos Soares 1932 is raw OCR that will not split by verse reliably: always one unsplit block.
- The Diurnal Monástico 1962 (diurnal.py; 78 psalms of the day hours) is already keyed by the prayed verse ids: verse by
  verse where its runs pair with the Latin, otherwise whole under the last verse of the run it covers.
- A verse the source lacks stays null — shown as missing, never filled from memory.

Ps 4, the pilot, keeps its hand-made alignment (and Ave Maria, Matos Soares 1956, a verse-split 1932) when those files
are in consult/: bolls-*-19-4.json, lirio-avemaria-sl4.html, vulgataonline-MS-ps4.json, ms1932-ps4.json.
"""

import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from diurnal import diurnal  # noqa: E402
from latin import doLatin, readVerses  # noqa: E402
from parallels import bolls as fetchBolls, drbByHand, drbChapters, hebrewPsalms, matosSoares  # noqa: E402

here = Path(__file__).resolve().parent
consult = here / 'consult'

# Vulgate psalms that are only a part of a Hebrew psalm, or span two: never alignable by verse number
unalignable = {9, 113, 114, 115, 146, 147}


def clean(text, pilot=False):
    text = re.sub(r'<S>.*?</S>|<sup>.*?</sup>', '', text)  # KJV Strong's numbers and margin notes
    text = re.sub(r'<(h\d|b|strong)[^>]*>.*?</\1>', ' ', text, flags=re.S)  # section headings
    text = html.unescape(re.sub(r'<[^>]+>', ' ', text))
    if pilot:
        text = re.sub(r'^.*?\bof David\.\s*', '', text, flags=re.S)  # Ps 4: RSV-CE / KJV run heading and title into verse 1
    text = re.sub(r'(?<=[.?!;])Selah', ' Selah', text)
    text = re.sub(r'\{\d+:([^}]*)\}', r'\1', text)  # Matos Soares footnote anchors keep their words
    text = text.replace('§', ' ').replace(' ”', '”')  # CNBB paragraph sign; stray space before a closing quote
    return re.sub(r'\s+', ' ', text.replace('_', '')).strip()


def bolls(code, psalm, pilot=False):
    """{verse: text} from the Bolls cache, fetched once by parallels.py's helper; {} when it cannot be had."""
    try:
        fetchBolls(code, psalm)
        data = json.loads((consult / f'bolls-{code}-19-{psalm}.json').read_text(encoding='utf-8'))
        return {v['verse']: clean(v['text'], pilot) for v in data}
    except Exception as error:  # noqa: BLE001 — offline, rate-limited, or a translation Bolls lacks: the version is left out
        print(f'  {code}: not available ({type(error).__name__}: {error})')
        return {}


def addDiurnal(out, psalm, verseOf):
    """The Diurnal Monástico 1962, placed right after Matos Soares 1932. diurnal.py keys it by DO's prayed ids already:
    a paired run sets each paragraph under its verse; an unpaired run stands whole under the run's last verse, so it
    shows once, after the verses it covers."""
    try:
        book = diurnal(psalm)
    except Exception as error:  # noqa: BLE001 — the OCR cache is optional, like every other source here
        print(f'  DM: not available ({type(error).__name__}: {error})')
        return
    if not book:
        return
    note = 'Dom Marcos Barbosa, Mosteiro de São Bento do Rio — made from the Hebrew but printed beside this same Latin and meant to be prayed; he says Tu; OCR, unchecked'
    version = {'id': 'DM', 'name': 'Diurnal Monástico 1962', 'lang': 'pt', 'note': note + (f" — its argument of the psalm: {book['title']}" if book.get('title') else '')}
    at = next((i + 1 for i, v in enumerate(out['versions']) if v['id'] == 'MS32'), len(out['versions']))
    out['versions'].insert(at, version)
    short = lambda vid: vid.split(':', 1)[1]  # noqa: E731
    for run in book['runs']:
        ids = [vid for vid in run['ids'] if vid in out['verses']]
        if not ids:
            continue
        if run.get('paired'):
            for vid, text in zip(run['ids'], run['pt']):
                if vid in out['verses']:
                    out['verses'][vid].setdefault('DM', []).append([verseOf.get(vid), text])
        else:
            span = short(ids[0]) if len(ids) == 1 else f'{short(ids[0])}–{short(ids[-1])}'
            out['verses'][ids[-1]].setdefault('DM', []).extend([span if i == 0 else None, text] for i, text in enumerate(run['pt']))
    print(f"  DM    {len(book['runs']):3} runs, {sum(1 for run in book['runs'] if run.get('paired'))} of them verse by verse" + (f"; missing {', '.join(book['missing'])}" if book.get('missing') else ''))


# ───────── Ps 4: the pilot's hand-made alignment ─────────

def pilotVersions():
    vulgate = {'4:2a': [2], '4:2b': [2], **{f'4:{n}': [n] for n in range(3, 11)}}
    # Hebrew-numbered Bibles divide 4:6-10 differently, and some count the title as verse 1 and some do not
    hebrewTitled = {'4:2a': [2], '4:2b': [2], '4:3': [3], '4:4': [4], '4:5': [5], '4:6': [6, 7], '4:7': [7, 8], '4:8': [8], '4:9': [9], '4:10': [9]}
    hebrewUntitled = {vid: [n - 1 for n in verses] for vid, verses in hebrewTitled.items()}

    def aveMaria():
        raw = (consult / 'lirio-avemaria-sl4.html').read_text(encoding='utf-8', errors='replace')
        return {int(n): clean(text) for n, text in re.findall(r'<sup><small>(\d+)</small></sup></strong>(.*?)<!--', raw, flags=re.S)}

    def matosSoares1956():
        data = json.loads((consult / 'vulgataonline-MS-ps4.json').read_text(encoding='utf-8'))
        return {v['vn']: clean(v['cnt']) for v in data['texts'][0]['text'] if v['tp'] == 'vs'}

    def matosSoares1932():
        data = json.loads((consult / 'ms1932-ps4.json').read_text(encoding='utf-8'))
        return {int(n): text for n, text in data['verses'].items()}

    return [
        ('MS32', 'Matos Soares 1932', 'pt', vulgate, matosSoares1932, 'from the Vulgate — the nearest Portuguese antecedent; parentheses are his own glosses'),
        ('AM', 'Ave Maria', 'pt', hebrewTitled, aveMaria, 'follows the Hebrew text and numbering'),
        ('CNBB', 'CNBB', 'pt', hebrewTitled, lambda: bolls('CNBB', 4, True), 'from the Hebrew; the Bolls copy lacks verse 9'),
        ('MS', 'Matos Soares 1956', 'pt', hebrewTitled, matosSoares1956, 'the 1956 edition follows the Hebrew'),
        ('DRB', 'Douay-Rheims', 'en', vulgate, lambda: bolls('DRB', 4, True), 'from the Vulgate — the closest kin to this project'),
        ('RSVCE', 'RSV-CE', 'en', hebrewUntitled, lambda: bolls('RSV2CE', 4, True), 'from the Hebrew'),
        ('KJV', 'King James', 'en', hebrewUntitled, lambda: bolls('KJV', 4, True), 'from the Hebrew'),
    ]


def pilot(prayed):
    out = {'psalm': 4, 'versions': [], 'verses': {vid: {} for vid in prayed}, 'blocks': {}}
    for code, name, language, scheme, read, note in pilotVersions():
        text = read()
        out['versions'].append({'id': code, 'name': name, 'lang': language, 'note': note})
        for vid in prayed:
            out['verses'][vid][code] = [[n, text.get(n)] for n in scheme[vid]]
        print(f'  {code:6}{len(text):3} verses, hand-aligned')
    addDiurnal(out, 4, {vid: int(re.match(r'\d+:(\d+)', vid).group(1)) for vid in prayed})
    return out


# ───────── every other psalm ─────────

def build(psalm):
    latin = readVerses(doLatin / f'Psalmorum/Psalm{psalm}.txt')
    prayed = [v['id'] for v in latin if v['chapter'] == psalm]
    if not prayed or psalm > 150:
        print(f'Ps {psalm}: not a psalm of the Psalter (a canticle has no psalter to compare) — nothing written')
        return None
    pilotFiles = ['ms1932-ps4.json', 'lirio-avemaria-sl4.html', 'vulgataonline-MS-ps4.json']
    if psalm == 4 and all((consult / name).exists() for name in pilotFiles):
        return pilot(prayed)

    out = {'psalm': psalm, 'versions': [], 'verses': {vid: {} for vid in prayed}, 'blocks': {}}
    verseOf = {v['id']: v['verse'] for v in latin}
    vulgateCount = max(verseOf.values())

    def add(code, name, language, note, text, byVerse):
        if not text:
            return
        out['versions'].append({'id': code, 'name': name, 'lang': language, 'note': note})
        if byVerse:
            for vid in prayed:
                out['verses'][vid][code] = [[verseOf[vid], text.get(verseOf[vid])]]
        else:
            out['blocks'][code] = [[n, verse] for n, verse in text.items()]  # Bolls' own order; two Hebrew psalms keep theirs
        print(f"  {code:6}{len(text):3} verses, {'under each verse' if byVerse else 'as a block'}")

    raw = matosSoares(psalm)
    if not raw.startswith('consult/ms1932-salmos.txt missing'):
        out['versions'].append({'id': 'MS32', 'name': 'Matos Soares 1932', 'lang': 'pt', 'note': 'from the Vulgate — the nearest Portuguese antecedent; raw text layer of the 1932 PDF, OCR artefacts and his own parenthetical glosses included'})
        out['blocks']['MS32'] = [[None, '\n'.join(line.strip() for line in raw.splitlines())]]
        print(f'  MS32  {len(raw.splitlines()):3} lines, as a block')
    addDiurnal(out, psalm, verseOf)

    hebrew = hebrewPsalms(psalm)

    def gather(source, chapters):
        text = {}
        for number in chapters:
            text.update({(n if len(chapters) == 1 else f'{number}:{n}'): verse for n, verse in bolls(source, number).items()})
        return text

    # the same verse count as the Breviary's is the only warrant for setting verse n under verse n
    sameCount = lambda text, chapters: len(chapters) == 1 and bool(text) and max(text) == vulgateCount  # noqa: E731

    # Bolls files the Douay-Rheims under a chapter count of its own (parallels.drbChapters); the verse numbers inside are the Vulgate's
    drb = gather('DRB', drbChapters(psalm))
    add('DRB', 'Douay-Rheims', 'en', 'from the Vulgate — the closest kin to this project', drb, sameCount(drb, drbChapters(psalm)))
    if not drbChapters(psalm):  # not in Bolls (Ps 10): the text fetched by hand, in Vulgate numbering
        drb = drbByHand(psalm)
        add('DRB', 'Douay-Rheims', 'en', 'from the Vulgate — not in Bolls; from drbo.org', drb, bool(drb) and max(drb) == vulgateCount)
    for code, source, name, language in [('CNBB', 'CNBB', 'CNBB', 'pt'), ('RSVCE', 'RSV2CE', 'RSV-CE', 'en'), ('KJV', 'KJV', 'King James', 'en')]:
        text = gather(source, hebrew)
        aligned = psalm not in unalignable and sameCount(text, hebrew)
        where = f"Hebrew Ps {' and '.join(str(n) for n in hebrew)}" if hebrew != [psalm] else 'the same number in the Hebrew'
        note = f"from the Hebrew ({where}); {'its verses fall with the Vulgate’s' if aligned else 'its verse division is not the Vulgate’s, so it stands whole'}"
        if code == 'RSVCE':
            note += '; the Bolls copy runs the editors’ section heading into verse 1, unmarked'
        add(code, name, language, note, text, aligned)
    return out


def main():
    args = sys.argv[1:]
    numbers = sorted(int(folder.name[2:]) for folder in here.glob('ps[0-9][0-9][0-9]')) if '--all' in args else [int(a) for a in args if a.isdigit()]
    if not numbers:
        print(__doc__)
        return
    target = consult / 'compare'
    target.mkdir(parents=True, exist_ok=True)
    for psalm in numbers:
        print(f'Ps {psalm}')
        out = build(psalm)
        if out and out['versions']:
            (target / f'ps{psalm:03d}.js').write_text('window.psalteriumCompare = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')


main()
