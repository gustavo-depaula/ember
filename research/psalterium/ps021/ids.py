"""Ps 21 is the first psalm whose DO file REPEATS verse ids (21:15, 21:17, 21:25, 21:28 each stand on two lines).

The shared scripts key verses by id in a dict, so they cannot hold two prayed verses under one id: checks.py fails
("verse ids differ"), render.py writes one Latin verse for two, site.py sees a stray id. This module is the
workaround used by the ps021 wrappers (run.py): `readVerses` gives the second, third … line of a repeated id the
suffix b, c … (DO's own convention for the continuation of a verse: 17:3b, 117:28b). The first line keeps DO's id.
Nothing shared is edited. The proposed shared fix is the same six lines inside latin.readVerses.

Mapping for Ps 21: 21:15 / 21:15b · 21:17 / 21:17b · 21:25 / 21:25b · 21:28 / 21:28b.
For delivery to DO the suffix b is simply dropped again (DO's line order is the psalm's order).
"""

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import latin  # noqa: E402

original = latin.readVerses


def readVerses(path):
    seen = Counter()
    out = []
    for verse in original(path):
        seen[verse['id']] += 1
        if seen[verse['id']] > 1:
            suffix = 'abcdefgh'[seen[verse['id']] - 1]
            verse = {**verse, 'id': verse['id'] + suffix, 'suffix': suffix}
        out.append(verse)
    return out


def install():
    latin.readVerses = readVerses
