"""Linking a liturgical text to the chant that sets it, by the words alone.

A Mass proper as Divinum Officium prints it and a score as GregoBase transcribes
it are two editions of one text: the Missal's and the Gradual's. They differ in
spelling, in punctuation, now and then in a word — never in how they open. So a
text is reduced to what every edition agrees on (`fold`), split into the chants
it holds (`mass_pieces`), and a chant is found by comparing openings.

Used by scripts/import-gregobase.py, to decide which scores to bring in, and by
scripts/build-corpus.py, to build the index the app looks a proper up in. The
app reduces a text the same way (apps/app/src/features/chant/textKey.ts); the
two are held together by the vectors in scripts/chant-link-vectors.json.
"""
import collections, difflib, re, unicodedata

# How much of a folded text keys the index. Long enough that two chants rarely
# share it, short enough to sit before the place where two editions part ways.
KEY_LENGTH = 28

# A section of the Missal, by its Latin head, and the genre GregoBase files its chant under.
GENRES = {'in': 'Introitus', 'gr': 'Graduale', 'al': 'Alleluia', 'tr': 'Tractus', 'of': 'Offertorium', 'co': 'Communio', 'se': 'Sequentia'}


def fold(text):
    """Latin reduced to what two editions of a text agree on: letters only, no
    accents, `j` as `i`, `y` as `i`, the diphthongs as `e`, and the spellings
    that differ between books (`exsultet`/`exultet`, `charitas`/`caritas`)."""
    text = text.lower().replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae')
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    text = text.replace('j', 'i').replace('y', 'i').replace('ae', 'e').replace('oe', 'e')
    text = re.sub(r'[^a-z]', '', text)
    return text.replace('xs', 'x').replace('ch', 'c').replace('th', 't').replace('ph', 'f')


def lyrics(score):
    """The words of a GABC score, in order, notes and markup removed."""
    text = re.sub(r'\([^)]*\)', '', score)
    text = re.sub(r"<sp>'?(ae|oe)</sp>", r'\1', text)
    text = re.sub(r'<sp>[^<]*</sp>', ' ', text)
    text = re.sub(r'<v>[^<]*</v>', ' ', text)
    text = re.sub(r'<(alt|eu)>.*?</\1>', ' ', text, flags=re.S)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\[[^\]]*\]', ' ', text)
    # Repeat signs of the Kyrie and the like, and the stars of the choir's entry.
    text = re.sub(r'\b(i{1,3}j)\.', ' ', text)
    text = text.replace('{', '').replace('}', '').replace('*', ' ').replace('~', ' ')
    return re.sub(r'\s+', ' ', text).strip()


def chant_key(genre, score):
    """A score's own text, folded as a query for it would be."""
    text = fold(lyrics(score))
    # "Alleluia. V. Ostende nobis": the verse is what tells one Alleluia from another.
    return re.sub(r'^(alleluia)+', '', text) if genre == 'al' else text


def _words(lines):
    """A section's sung text: references, rubrics and inclusions dropped."""
    kept = []
    for line in lines:
        if not line or line[0] in '!&$@#' or line.startswith('_'):
            continue
        line = re.sub(r'\([^)]*\)', '', line)
        kept.append(re.sub(r'^[vVR]\.\s*', '', line).strip())
    return ' '.join(k for k in kept if k)


_ALLELUIA = r'All?el[úu][ij]a'
_DOUBLE_ALLELUIA = rf'{_ALLELUIA},\s*{_ALLELUIA}\.?'


def _alleluias(text_lines):
    """The verses under a double Alleluia, each an alleluia of its own."""
    return [('al', v) for v in (_words([l]) for l in text_lines[1:]) if v]


def _sung(lines):
    return [l for l in lines if l and l[0] not in '!&$@#_']


def _opens_on_alleluia(text_lines):
    return bool(text_lines) and re.fullmatch(_DOUBLE_ALLELUIA, text_lines[0].strip(), flags=re.I)


def _between_the_readings(lines):
    """A [Graduale] as its chants. It is a gradual with an alleluia; or two
    alleluias in Paschal time; and after a `_` comes what the season adds — a
    tract in Lent, a sequence on its feasts, a second alleluia now and then."""
    cut = next((i for i, l in enumerate(lines) if l.startswith('_') or l.startswith('!Tractus')), None)
    after = [] if cut is None else lines[cut:]
    lines = lines if cut is None else lines[:cut]
    out = []
    if _opens_on_alleluia(_sung(lines)):
        out += _alleluias(_sung(lines))
    else:
        parts = re.split(_DOUBLE_ALLELUIA, _words(lines), maxsplit=1, flags=re.I)
        if parts[0].strip():
            out.append(('gr', parts[0].strip()))
        if len(parts) > 1 and parts[1].strip():
            out.append(('al', parts[1].strip()))
    if _opens_on_alleluia(_sung(after)):
        out += _alleluias(_sung(after))
    elif _words(after):
        # Filed as a tract; a sequence is found through KIN.
        out.append(('tr', _words(after)))
    return out


def mass_pieces(head, lines):
    """The chants a section of the Missal holds, as [(genre, text)], in the
    order they are sung. `head` is the section's Latin name; `lines` its lines
    as Divinum Officium writes them, references and all."""
    head = re.split(r'[ (]', head)[0]
    if lines and lines[0].startswith('@'):
        return []
    if head in ('Introitus', 'Offertorium', 'Communio'):
        # The antiphon alone: an Introit goes on to its psalm verse, which the books abbreviate.
        first = []
        for line in lines:
            if line.startswith('!') and first:
                break
            first.append(line)
        text = _words(first)
        return [({'Introitus': 'in', 'Offertorium': 'of', 'Communio': 'co'}[head], text)] if text else []
    if head == 'Sequentia':
        return [('se', _words(lines))]
    if head.startswith('Graduale'):
        return _between_the_readings(lines)
    if head == 'Tractus':
        return [('tr', t) for _, t in _between_the_readings(lines)] or [('tr', _words(lines))]
    return []


def piece_key(genre, text):
    """A piece of the Missal, folded as the index files it."""
    key = fold(text)
    return re.sub(r'(alleluia)+$', '', key) if genre == 'al' else key


def similarity(key, text):
    """How well a score's `text` sets `key`, 0–1: the share of the query the
    score reproduces, over as much of it as the score goes on for."""
    n = min(len(key), len(text))
    if not n:
        return 0.0
    return difflib.SequenceMatcher(None, key[:n], text[:n], autojunk=False).ratio() * (n / len(key))


class Finder:
    """Finds the score that sets a text among `scores`: an iterable of
    (id, genre, folded text, rank) where a lower rank is a preferred book."""

    def __init__(self, scores):
        self.files = collections.defaultdict(list)
        self.by_genre = collections.defaultdict(list)
        for cid, genre, text, rank in scores:
            if len(text) < 8:
                continue
            self.by_genre[genre].append((text, rank, cid))
            # Filed by a short opening: the Gradual's "Ad te Domine levavi" has
            # to be found for the Missal's "Ad te levavi", and the comparison,
            # not the filing, is what tells two texts apart.
            self.files[(genre, text[:4])].append((text, rank, cid))

    def candidates(self, genres, key):
        seen = set()
        for genre in genres:
            for row in self.files.get((genre, key[:4]), ()):
                if row[2] not in seen:
                    seen.add(row[2])
                    yield row

    def settings(self, genres, key, floor):
        """Every score that sets the whole of `key`, best first: [(score, rank, id)].
        Scores within a hair of each other differ by a comma; the rank decides between them."""
        out = []
        for text, rank, cid in self.candidates(genres, key):
            score = whole_text_similarity(key, text)
            if score >= floor:
                out.append((score, rank, cid))
        return sorted(out, key=lambda r: (-round(r[0] * 25), r[1], -r[0]))

    def find(self, genres, key):
        """(score 0–1, id) of the best setting of `key` among `genres`. Settings
        within a hair of each other differ by a comma; the rank decides between them."""
        best = None
        for text, rank, cid in self.candidates(genres, key):
            score = similarity(key, text)
            order = (round(score * 25), -rank, score)
            if best is None or order > best[0]:
                best = (order, score, cid)
        if best and best[1] >= THRESHOLD:
            return best[1], best[2]
        # The Gradual sometimes opens a word before the Missal does — "Etenim
        # sederunt principes" for "Sederunt principes". Look for the text a
        # little way into each score of the genre.
        for genre in genres:
            for text, rank, cid in self.by_genre.get(genre, ()):
                at = text.find(key[:12], 1, 30)
                if at < 0:
                    continue
                score = similarity(key, text[at:])
                order = (round(score * 25), -rank, score)
                if best is None or order > best[0]:
                    best = (order, score, cid)
        return (best[1], best[2]) if best else (0.0, None)


def whole_text_similarity(key, text):
    """How well a score's `text` sets the whole of `key`, 0–1. Unlike
    `similarity`, a score that stops after the first line of a prayer — an
    offertory that only opens with the Hail Mary's words — scores low."""
    n = min(len(key), len(text))
    if not n:
        return 0.0
    ratio = difflib.SequenceMatcher(None, key[:n], text[:n], autojunk=False).ratio()
    # A hymn's score may carry more stanzas than the prayer prints; past 1.6× it is another text.
    return ratio * (n / max(len(key), min(len(text), len(key) * 1.6)))


# A tract's text is in some seasons a gradual's, and the reverse; and what
# follows a gradual where a tract would is, on its feasts, the sequence.
KIN = {'gr': ('gr', 'tr'), 'tr': ('tr', 'gr', 'se')}
# Below this a match is two different texts that happen to open alike.
THRESHOLD = 0.8


def sections(path):
    """A Divinum Officium file as {section name: [lines]}."""
    out, name = {}, None
    for line in path.read_text(encoding='utf-8', errors='ignore').splitlines():
        m = re.match(r'^\[([^\]]+)\]', line)
        if m:
            name = m.group(1)
            out.setdefault(name, [])
        elif name:
            out[name].append(line.rstrip())
    return out


def missal_files(www):
    """The Latin files a Mass's sung texts are printed in. The Commons of the
    Saints are kept with the Breviary's, which is where the Missal's point."""
    for folder in ('missa/Latin/Tempora', 'missa/Latin/Sancti', 'missa/Latin/Commune', 'horas/Latin/Commune'):
        yield from sorted((www / folder).glob('*.txt'))


def missal_pieces(www):
    """Every chant text of the Missal's Latin, as {(genre, key): text}. `www`
    is Divinum Officium's `web/www`."""
    out = {}
    for f in missal_files(www):
        for name, lines in sections(f).items():
            for genre, text in mass_pieces(name, lines):
                key = piece_key(genre, text)
                if len(key) >= 12:
                    out.setdefault((genre, key), text)
    return out


def _write_vectors():
    """Sections of the Missal with the pieces and keys this module finds in
    them, for the app's port of `fold` and `mass_pieces` to be tested against.
    Every eleventh section, so the sample crosses seasons and shapes."""
    import json, pathlib

    root = pathlib.Path(__file__).resolve().parent.parent
    www = root / 'content/do/web/www'
    vectors, n = [], 0
    for f in missal_files(www):
        if True:
            for name, lines in sections(f).items():
                pieces = mass_pieces(name, lines)
                if not pieces:
                    continue
                n += 1
                if n % 11:
                    continue
                vectors.append({
                    'place': f'{f.relative_to(www).with_suffix("")}#{name}',
                    'head': name,
                    'lines': lines,
                    'pieces': [[genre, piece_key(genre, text)] for genre, text in pieces],
                })
    out = pathlib.Path(__file__).with_name('chant-link-vectors.json')
    out.write_text(json.dumps(vectors, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(vectors)} sections → {out.name}')


if __name__ == '__main__':
    _write_vectors()
