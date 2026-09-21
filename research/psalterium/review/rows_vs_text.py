"""Glossary rendering cells against the finished text, for rows with a simple Latin stem and rendering.

python3.13 review/rows_vs_text.py → per row (glossary line, Latin regex, expected Portuguese regex): hits, misses with text.
The list is hand-made from glossary.md rows (working, open, settled) whose rendering is a single word family.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

here = Path(__file__).resolve().parent


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    return ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()


checks = [
    ('laudáre / laus → louvar / louvor', r'\blaud', r'louv'),
    ('tribulátio → tribulação', r'tribulatio', r'tribula'),
    ('iníquitas → iniquidade', r'iniquita', r'iniquidade'),
    ('ímpius → ímpio', r'\bimpi(us|i|o|um|orum|is|os)\b', r'ímpio'),
    ('peccátor → pecador', r'peccator', r'pecador'),
    ('véritas → verdade', r'verita', r'verdade'),
    ('spes → esperança', r'\bspe(s|m|i)\b', r'esperan'),
    ('invocáre → invocar', r'invoc', r'invoc'),
    ('clamáre → clamar', r'\bclam(a|o|av|ab|ave|ore)', r'clam'),
    ('glorificáre → glorificar', r'glorific', r'glorific'),
    ('exaltáre → exaltar', r'exalt', r'exalt|ergu'),
    ('lætári → alegrar-se', r'laet', r'alegr'),
    ('exsultáre → exultar', r'exsult', r'exult'),
    ('conturbáre → perturbar', r'conturb|\bturbat', r'perturb'),
    ('dolus / dolósus → engano / enganador', r'\bdol(us|um|o|osus|osum|osa|ose|osi)\b', r'engan'),
    ('refúgium → refúgio', r'refugi', r'refúgio'),
    ('protéctor → protetor', r'protector', r'protetor'),
    ('fortitúdo → força', r'fortitud', r'força'),
    ('virtus (δύναμις) → poder', r'virtut|virtus', r'poder'),
    ('salvum fácere → salvar', r'salv(um|os|us|i) fac|salvum me fac|salvos fac', r'salv'),
    ('custodíre → guardar', r'custod', r'guard'),
    ('quǽrere → buscar', r'\bquae(r|s)', r'busc|procur'),
    ('exquírere → procurar', r'exquir|exquis', r'procur'),
    ('requírere', r'requir', r'procur|busc|pedir|pedi'),
    ('timére / timor → temer / temor', r'\btim(e|o|u)', r'tem'),
    ('iníquus → iníquo', r'\biniqu(us|i|o|um|os|is|a|ae|am)\b', r'iníqu|iniquid'),
    ('cor → coração', r'\bcor(de|dis|da|dibus)?\b', r'coraç'),
    ('fácies → face / rosto', r'\bfaci(es|em|e)\b', r'face|rosto|diante'),
    ('vultus → rosto', r'\bvult(us|u|um)\b', r'rosto|face'),
    ('gens / gentes → nação / nações', r'\bgent(es|ium|ibus|em)\b|\bgens\b', r'naç'),
    ('pópulus → povo', r'\bpopul', r'povo'),
    ('lætítia → alegria', r'laetiti', r'alegr'),
    ('iniquitátem operári → praticar', r'operant\w* iniquit|operamini iniquit', r'pratic'),
    ('sperantes / qui sperant in → que esperam em', r'\bsper', r'esper|confi'),
    ('confídere → confiar', r'confid', r'confi'),
    ('fíeri, factus est', r'factus est (mihi|dominus)', r'fez|fizestes|tornou'),
    ('oppróbrium → afronta', r'opprobri', r'afront|opróbrio|vergonha'),
    ('persequi → perseguir', r'persequ|persecut', r'persegu'),
    ('tabernáculum → tenda', r'tabernacul', r'tenda'),
    ('mons sanctus → monte santo', r'monte sancto|montem sanctum', r'monte santo'),
    ('inimícus → inimigo', r'inimic', r'inimig'),
    ('mendácium → mentira', r'mendaci', r'mentir'),
    ('vánitas → vaidade', r'vanit', r'vaidade|vão'),
    ('orátio → oração', r'oratio', r'oração'),
    ('respícere (God) → olhar', r'respic|respex', r'olh|voltad'),
    ('anima → alma', r'\banim(a|am|ae|as|arum)\b', r'alma|vida'),
]
rows = json.loads((here / 'corpus.json').read_text(encoding='utf-8'))
for name, la, pt in checks:
    la_re, pt_re = re.compile(la), re.compile(pt, re.I)
    miss = [r for r in rows if la_re.search(r['fold']) and not pt_re.search(r['pt'])]
    hit = sum(1 for r in rows if la_re.search(r['fold']) and pt_re.search(r['pt']))
    print(f'## {name}: {hit} ok, {len(miss)} miss')
    for r in miss:
        print(f"!! {r['id']:8} {r['la']}\n            {r['pt']}")
