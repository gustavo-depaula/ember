"""GregoBase's dump as plain records, and the text of a score without its notes.

Shared by the experiments in this directory. The dump is the one
scripts/import-gregobase.py caches under ~/.cache/ember/.
"""
import importlib.util, json, pathlib, re, unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[2]
_spec = importlib.util.spec_from_file_location('importer', ROOT / 'scripts/import-gregobase.py')
importer = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(importer)

PARTS = {
    'an': 'antiphon', 're': 'responsory', 'hy': 'hymn', 'al': 'alleluia', 'in': 'introit',
    'co': 'communion', 'of': 'offertory', 'rb': 'short responsory', 'gr': 'gradual',
    'or': 'common tone', 'ky': 'kyriale', 'va': 'varia', 'tr': 'tract', 'ps': 'psalm',
    'se': 'sequence', 'pr': 'preface', 'ca': 'canticle', 'su': 'supplication', 'tp': 'trope',
    'pa': 'paraliturgical', 'im': 'improperia', 'rh': 'rhythmus',
}


def load():
    """(chants by id, sources by id, {chant id: [(source id, page)]}). Copyrighted chants are left out."""
    sql = importer.dump()
    chants = {c['id']: c for c in importer.rows(sql, 'gregobase_chants') if not int(c['copyrighted'])}
    sources = {s['id']: s for s in importer.rows(sql, 'gregobase_sources')}
    pages = {}
    for s in importer.rows(sql, 'gregobase_chant_sources'):
        if s['chant_id'] in chants:
            pages.setdefault(s['chant_id'], []).append((s['source'], s['page']))
    return chants, sources, pages


import sys

sys.path.insert(0, str(ROOT / 'scripts'))
import chant_link  # noqa: E402

# The reduction of a text and of a score that the corpus build itself uses.
fold = chant_link.fold
lyrics = chant_link.lyrics


def chant_text(chant):
    return lyrics(importer.score(chant))


class Finder:
    """Finds the score that sets a given text.

    Scores are filed by genre and by how their text opens; a query is compared
    only with those that open as it does, and wins on how much of it the score
    reproduces. Where several books set the same text, `books` (source ids,
    best first) decides."""

    def __init__(self, chants, pages, genres, books, trim=None):
        import collections

        self.rank = {b: i for i, b in enumerate(books)}
        self.pages = pages
        self.files = collections.defaultdict(list)
        for c in chants.values():
            if c['office-part'] not in genres or not c['gabc']:
                continue
            text = fold(chant_text(c))
            if trim:
                text = trim(c['office-part'], text)
            if len(text) < 8:
                continue
            book = min((self.rank.get(s, 99) for s, _ in pages.get(c['id'], [])), default=99)
            for opening in {text[:6], text[1:7]}:
                self.files[(c['office-part'], opening)].append((text, book, c['id']))

    def find(self, genres, key):
        """(score 0–1, chant id) of the best setting of `key` among `genres`."""
        import difflib

        best = (0.0, 99, None)
        seen = set()
        for genre in genres:
            for opening in {key[:6], key[1:7]}:
                for text, book, cid in self.files.get((genre, opening), ()):
                    if cid in seen:
                        continue
                    seen.add(cid)
                    n = min(len(key), len(text))
                    ratio = difflib.SequenceMatcher(None, key[:n], text[:n], autojunk=False).ratio()
                    score = ratio * (n / len(key))
                    if (score, -book) > (best[0], -best[1]):
                        best = (score, book, cid)
        return best[0], best[2]

    def all(self, genres, key, floor=0.8):
        """Every setting of `key` scoring at least `floor`, best first: [(score, book rank, chant id)]."""
        import difflib

        out, seen = [], set()
        for genre in genres:
            for opening in {key[:6], key[1:7]}:
                for text, book, cid in self.files.get((genre, opening), ()):
                    if cid in seen:
                        continue
                    seen.add(cid)
                    n = min(len(key), len(text))
                    ratio = difflib.SequenceMatcher(None, key[:n], text[:n], autojunk=False).ratio()
                    # Counted against the longer of the two here: a score that sets
                    # only the first line of a prayer is not a setting of the prayer.
                    score = ratio * (n / max(len(key), min(len(text), len(key) * 1.6)))
                    if score >= floor:
                        out.append((round(score, 3), book, cid))
        # Settings within a hair of each other differ by a comma; the book decides between them.
        return sorted(out, key=lambda r: (-round(r[0] * 25), r[1], -r[0]))
