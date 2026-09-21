"""Reading the Divinum Officium Latin psalter: orthography fold, prayed-verse lines, cola."""

import re
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[2]
doLatin = root / 'content/do/horas/Latin/Psalterium'
doPortugues = root / 'content/do/horas/Portugues/Psalterium'

verseLine = re.compile(r'^(\d+):(\d+)([a-z]?)\s+(.*)$')


def fold(text):
    """Liturgical orthography → plain classical spelling, punctuation kept: no stress accents, j→i, æ/œ→ae/oe."""
    text = text.replace('æ', 'ae').replace('Æ', 'Ae').replace('œ', 'oe').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c))
    return text.replace('j', 'i').replace('J', 'I')


def words(text):
    """Bare lowercase words — parentheticals ((Aleph), inline verse numbers, rubrics) and every mark dropped."""
    return re.findall(r'[a-z]+', fold(re.sub(r'\([^)]*\)', ' ', text)).lower())


def readVerses(path):
    """Prayed verses in file order: [{'id': '4:2a', 'chapter': 4, 'verse': 2, 'suffix': 'a', 'text': ...}]."""
    verses = []
    for line in path.read_text(encoding='utf-8').splitlines():
        match = verseLine.match(line)
        if match:
            chapter, verse, suffix, text = match.groups()
            verses.append(
                {'id': f'{chapter}:{verse}{suffix}', 'chapter': int(chapter), 'verse': int(verse), 'suffix': suffix, 'text': text}
            )
    return verses


def resolve(prayed):
    """Flat prayed text {id: string}: every {slot} filled by the first option of the decision that owns it.

    Option 0 is always the translator's current text; a form may contain another {slot} (4:7's word inside its order).
    Older tiers without slots pass through; a {vos, tu} pair resolves to vós, the settled address.
    """
    forms = {}
    for decision in prayed.get('decisions', []):
        forms.update(decision['options'][0].get('forms', {}))

    def fill(text, depth=0):
        if depth > 4:
            raise ValueError(f'slots nest too deep in: {text}')
        return re.sub(r'\{(\w+)\}', lambda m: fill(forms[m.group(1)], depth + 1), text)

    return {vid: fill(r['vos'] if isinstance(r, dict) else r) for vid, r in prayed['verses'].items()}


def cola(text):
    """Split a prayed verse at its pointing marks → [{'mark': mark that opens the colon or '', 'text': ...}]."""
    text = re.sub(r'\s*\([^)]*\)\s*', ' ', text)
    parts = re.split(r'\s*([†‡*+])\s*', text.strip())
    out = [{'mark': '', 'text': parts[0]}]
    for mark, colon in zip(parts[1::2], parts[2::2]):
        out.append({'mark': mark, 'text': colon})
    return out


def marks(text):
    """The pointing skeleton of a verse, e.g. '†*' — what a translation has to reproduce exactly."""
    return ''.join(re.findall(r'[†‡*+]', text))


def appPointing(text):
    """The verse as Ember shows it (DO noflexa=1): ‡ becomes the mediant, the original * and every † vanish.

    Mirrors packages/divinum-officium/src/hours/scripts.ts.
    """
    text = re.sub(r'‡\s+(.*?)\*\s*', r'* \1', text)
    return re.sub(r'†\s*', '', text)
