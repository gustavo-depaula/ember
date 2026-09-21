"""Check every D-ruling / settled glossary row against the finished text.

python3.13 review/rules.py [name-filter]  → for each rule: Latin regex (folded), expected Portuguese regex;
prints misses ('!!') with Latin and Portuguese, and hit counts. Misses are candidates, read by hand in consistency.md.
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


# (name, latin regex on folded text, Portuguese regex expected, note)
rules = [
    ('D3 exaudire', r'exaud', r'escut', ''),
    ('D3 audire', r'\baud(i|ie|ia|it|iv|ire|ite|ivi)', r'ouv|ouç|escut', 'escutar allowed at vós imperative'),
    ('D3 intendere (not arcum)', r'\bintend(?!erunt arcum)', r'atend', ''),
    ('D4 auribus percipere', r'auribus percip', r'ouvidos', ''),
    ('D5 confiteri', r'confit', r'graças|confess', 'confessar only for sin'),
    ('D5 confitebor tibi', r'confitebor|confitemini|confitebuntur|confitebitur|confiteb', r'graças', ''),
    ('D6 salutare', r'salutar', r'salva', ''),
    ('D6 salus', r'\bsalu(s|tem|tis|ti|te|tes|tum|tibus)\b', r'salva', ''),
    ('D14/D23 refrain', r'in saeculum misericordia', r'porque é para sempre a sua misericórdia', ''),
    ('D15 justificationes', r'justificat', r'preceit|justifica', ''),
    ('D15 mandata', r'mandat', r'mandament', ''),
    ('D15 testimonia', r'testimon', r'testemunh', ''),
    ('D15 lex', r'\bleg(e|is|em|i|ibus)\b|\blex\b', r'\blei\b|\bleis\b', ''),
    ('D15 judicium', r'judici', r'juízo|julg|justiça', ''),
    ('D15 semita', r'semit', r'vereda', ''),
    ('D15 via', r'\bvi(a|ae|am|as|is)\b', r'caminh', ''),
    ('D15 verbum', r'\bverb(um|a|i|o|is|orum)\b', r'palavra', ''),
    ('D15 sermo', r'\bsermo', r'palavra', ''),
    ('D15/D26 eloquium', r'eloqui', r'dissest|palavra|dito', ''),
    ('D15 confundi', r'confund|confusi|confusio', r'envergonh|vergonha|confus|confund', ''),
    ('D17 genui te', r'genui te', r'Tu és meu Filho', ''),
    ('D18 servite', r'servite', r'Sede servos', ''),
    ('D19 beatus', r'\bbeat(us|i|um|a)\b', r'bem-aventurad', ''),
    ('D19 praeceptum', r'praecept', r'decreto', ''),
    ('D19 susceptor', r'susceptor', r'amparo', ''),
    ('D19 suscipere', r'suscip|suscep(?!tor)', r'ampar|acolh|receb', 'acolher for things open (D22)'),
    ('D19 adjutor', r'adjutor', r'auxílio', ''),
    ('D19 Christus', r'christ', r'Cristo|ungid', ''),
    ('D20 de via', r'de via', r'fora do caminho', ''),
    ('D21 arguere', r'\bargu', r'repreend', ''),
    ('D21 corripere', r'corrip|corrept|corripu', r'castig', ''),
    ('D21 increpare', r'increp', r'repreend|ameaç', ''),
    ('D22 deduc', r'deduc|deduxi', r'gui|conduz|descer|levar', ''),
    ('D24 perdere', r'\bperd(e|i|am|as|at|ent|es|et|ere|ideris|es)', r'perecer|perder|destru', ''),
    ('D24 malignus', r'malign', r'malvad|malign', ''),
    ('D24 tota die', r'tota die', r'o dia todo', ''),
    ('D24 exspectare', r'exspect|expect', r'aguard', ''),
    ('D36 sustinere', r'sustin|sustinu', r'esper(o|a|e|ei|ou|ar|am|ando|arei|aram|aria|ávamos)[a-z]* por|esperai por|aguard', ''),
    ('D36 sperare', r'\bsper(a|o|e|av|ab|ant|ab)', r'esper', ''),
    ('D25 psallere', r'psall|psalm(um|os|o|is) dic', r'entoa', ''),
    ('D25 convertere', r'convert|conversi', r'volt|convert|torn', ''),
    ('D27 in finem', r'in finem', r'para sempre|fim|nunca', ''),
    ('D27 exacerbare', r'exacerb', r'provoc|exasper|irrit', ''),
    ('D27 irritare', r'irrit', r'provoc', ''),
    ('D27 humilis', r'humil', r'humild|humilh', ''),
    ('D27 in saeculum saeculi', r'in saeculum saeculi', r'pelos séculos dos séculos', ''),
    ('D27 perire de', r'peri\w* de', r'fora d|perecer\w* d', ''),
    ('D23 in aeternum', r'in aeternum', r'para sempre', ''),
    ('D23 in saeculum', r'in saeculum(?! saeculi)', r'para sempre', ''),
    ('D29 sanguines', r'sanguin(um|ibus|es)', r'sangue\b', ''),
    ('D30 orbis', r'\borb(is|em|e)\b', r'mundo', ''),
    ('D31 firmamentum', r'firmament', r'esteio|firmamento', ''),
    ('D32 semen', r'\bsem(en|inis|ini|ine)\b', r'descend|semente', ''),
    ('D33 consilium', r'consili', r'conselho|desígni|plan', ''),
    ('D34 ecclesia', r'eccles', r'assembleia', ''),
    ('D34 concilium', r'concili', r'congrega|assembleia', ''),
    ('D35 deprecatio', r'deprecat(io|ion)', r'prece', ''),
    ('D35 deprecari', r'deprec(ab|or|ati sunt|atus|ari)', r'suplic', ''),
    ('D13 aperite', r'aperi', r'abr', ''),
    ('D9 in idipsum', r'in idipsum', r'.', 'deferred'),
    ('D11 benedicere', r'benedic|benedix', r'bendi|bençã|bendit|abençoe', ''),
]

rows = json.loads((here / 'corpus.json').read_text(encoding='utf-8'))
filt = sys.argv[1] if len(sys.argv) > 1 else ''
for name, la, pt, note in rules:
    if filt and filt.lower() not in name.lower():
        continue
    la_re = re.compile(la)
    pt_re = re.compile(pt, re.I)
    hits, misses = [], []
    for r in rows:
        if la_re.search(r['fold']):
            (hits if pt_re.search(r['pt']) else misses).append(r)
    print(f'## {name}  ({len(hits)} ok, {len(misses)} miss) {note}')
    for r in misses:
        print(f"!! {r['id']:8} {r['la']}\n            {r['pt']}")
    if '--hits' in sys.argv:
        for r in hits:
            print(f"   {r['id']:8} {r['la']}\n            {r['pt']}")
