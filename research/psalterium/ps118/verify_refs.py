"""Verify the cross-references cited from memory in the notes of 118:33–80 against the DO Latin.
python3.13 research/psalterium/ps118/verify_refs.py"""

import re
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[3] / 'content/do/web/www/horas/Latin/Psalterium/Psalmorum'


def plain(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if not unicodedata.combining(c)).lower().replace('æ', 'ae').replace('œ', 'oe')


claims = [
    (26, 11, 'legem pone'), (5, 9, 'deduc'), (22, 3, 'dedux'), (42, 3, 'dedux'), (60, 3, 'dedux'), (138, 10, 'deduc'),
    (39, 3, 'statuit'), (118, 106, 'statui'), (92, 1, 'firmavit'), (80, 3, 'jucund'), (103, 34, 'jucund'), (111, 5, 'jucund'),
    (132, 1, 'jucund'), (146, 1, 'jucund'), (33, 9, 'suavis'), (118, 103, 'dulcia'), (89, 2, 'a saeculo'), (24, 6, 'a saeculo'),
    (92, 2, 'a saeculo'), (9, 14, 'humilitatem'), (24, 18, 'humilitatem'), (118, 92, 'humilitate'), (118, 153, 'humilitatem'),
    (141, 6, 'portio'), (15, 5, 'pars'), (72, 26, 'pars'), (44, 13, 'deprecabuntur'), (6, 5, 'convertere'), (125, 1, 'convertendo'),
    (17, 33, 'praecinxit'), (32, 5, 'plena est terra'), (115, 1, 'credidi'), (18, 13, 'delicta'), (24, 7, 'delicta'), (68, 6, 'delicta'),
    (32, 15, 'finxit'), (93, 9, 'finxit'), (138, 5, 'formasti'), (24, 6, 'miserationum'), (102, 4, 'miserationibus'), (50, 3, 'miserationum'),
    (118, 156, 'miserationes'), (18, 3, 'scientiam'), (93, 10, 'scientiam'), (138, 6, 'scientia'), (118, 173, 'fiat manus'),
    (118, 164, 'super judicia'), (9, 6, 'in saeculum saeculi'), (44, 18, 'in saeculum saeculi'), (144, 1, 'in saeculum saeculi'),
    (118, 105, 'semit'), (118, 125, 'intellectum'), (118, 144, 'intellectum'), (118, 169, 'intellectum'), (118, 116, 'secundum eloquium'),
    (118, 133, 'secundum eloquium'), (118, 170, 'secundum eloquium'), (118, 107, 'usquequaque'), (118, 124, 'justificationes tuas doce'),
    (118, 135, 'doce me justificationes'), (118, 97, 'meditatio'), (118, 174, 'meditatio'),
]
bad = 0
for psalm, verse, needle in claims:
    lines = (root / f'Psalm{psalm}.txt').read_text(encoding='utf-8').splitlines()
    hits = [l for l in lines if re.match(rf'{psalm}:{verse}[a-z]?\b', l)]
    ok = any(needle in plain(l) for l in hits)
    if not ok:
        bad += 1
        elsewhere = [l.split(' ')[0] for l in lines if needle in plain(l)]
        print(f'NOT FOUND {psalm}:{verse} "{needle}" — in this psalm at: {elsewhere[:6]}')
print(f'{len(claims) - bad} of {len(claims)} verified')
