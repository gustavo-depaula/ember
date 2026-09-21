"""Recount the counts that D-rulings and settled glossary rows rest on, with the accent- and case-folded pattern.

python3.13 review/recount.py → per claim: the claim as written, the regex used, lines and occurrences found in DO's
Latin Pss 1–150 (Psalm*.txt ≤ 150; canticles excluded), and the verse ids.
"""
import re
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[3] / 'content/do/horas/Latin/Psalterium/Psalmorum'


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    return ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()


lines = []
for path in root.glob('Psalm*.txt'):
    n = int(re.search(r'\d+', path.stem).group())
    if n > 150:
        continue
    for line in path.read_text(encoding='utf-8').splitlines():
        if re.match(r'^\d+:\d+', line):
            lines.append((n, line.split()[0], plain(re.sub(r'\([^)]*\)', ' ', line))))
lines.sort(key=lambda t: (t[0], [int(x) for x in re.findall(r'\d+', t[1])]))

claims = [
    ('D3: exaudíre "all 74 places"', r'exaud'),
    ('D3: inténde parallel to exáudi in 16:1, 54:2, 60:2, 140:1', r'exaud.*intend|intend.*exaud'),
    ('D4: áuribus percípere eight places', r'auribus percip'),
    ('D5: confitéri + laudáre in one verse (34:18, 108:30, 105:47)', r'confit.*\blaud|\blaud.*confit'),
    ('glossary D5: grátias ágere never occurs', r'grati\w* ag'),
    ('D9: in idípsum six places', r'in idipsum'),
    ('D14: Ps 135 refrain in ætérnum misericórdia 27 times', r'in aeternum misericordia'),
    ('D15: justificatiónes 29 in Ps 118 + once elsewhere (104:45)', r'justificat'),
    ('D15/D19: præcéptum 8× (2:6, 7:7b, 18:9, 80:5, 93:20, 98:7, 104:10, 148:6), never in Ps 118', r'praecept'),
    ('D19: beátus 29×', r'\bbeat(us|i|a|um|am|os|ae|orum)\b'),
    ('D19: the Latin psalter never says felix', r'\bfelic|\bfelix'),
    ('D21: árguere 5 verses', r'\bargu'),
    ('D21: increpáre 12 verses', r'increp'),
    ('D21: árguere and increpáre never in one verse', r'\bargu.*increp|increp.*\bargu'),
    ('D22: in conspéctu 51 verses', r'in conspectu'),
    ('D22/D35: deprecátio 14 verses', r'deprecatio'),
    ('D22: inférnus 19 verses', r'infern|\binferi\b|\binferis\b|\binferos\b'),
    ('D24: tota die 26 verses', r'tota die'),
    ('D25: psállere beside cantáre (12:6b, 20:14, 103:33, 107:2)', r'psall.*cant|cant.*psall'),
    ('D25/glossary: psallam alone 12 verses', r'\bpsallam\b'),
    ('D27: in ætérnum and in finem together only at 48:9', r'in aeternum.*in finem|in finem.*in aeternum'),
    ('D27: úsquequo … in finem (12:1; 73:10, 78:5, 88:47)', r'usquequo.*in finem'),
    ('D27: exacerbáre 8 verses (9:25, 77:40, 41, 56, 104:28, 105:32, 43, 106:11)', r'exacerb'),
    ('D27/glossary: irritáre 10 verses', r'irrit'),
    ('D29: plural of blood (5:7b, 15:4b, 25:9, 50:16, 54:24, 58:3, 105:38, 138:19)', r'sanguin(um|ibus|es)\b'),
    ('D30: mundus never "world"; mund- only clean/cleanse (18:13, 23:4, Ps 50, 88:45)', r'\bmund'),
    ('D30: orbis lines (Ps 17 agent counted 12)', r'\borb(is|em|e)\b'),
    ('D31: firmaméntum (17:2, 18:2, 24:14, 70:3, 72:4, 150:1)', r'firmament'),
    ('D32: semen 17 lines', r'\bsem(en|inis|ini|ine|ina)\b'),
    ('D34: ecclésia ten lines', r'eccles'),
    ('D34: concílium lines (1:5, 21:17, 25:4, 39:11 …)', r'concili'),
    ('D35: deprecátio at a cadence 11 of 14 (count only)', r'deprecatio'),
    ('D18: Servíte Dómino 2:11, 99:2', r'servite'),
    ('glossary D36 sustinére 15 lines', r'sustin|sustinu|sustent'),
    ('glossary eripere: éripe 17 in the psalter', r'\beripe\b'),
    ('glossary D23 usque in ætérnum 4 lines (27:9, 48:20, 88:4, 102:17)', r'usque in aeternum'),
    ('glossary serváre five verses (11:8, 77:57, 88:29, 102:17, 118:168)', r'\bserv(a|o|e|as|at|ab|av|ant|et|ent|ar|ata|atus)'),
    ('glossary mirificáre 4:4, 15:3, 16:7, 30:22', r'mirific'),
    ('glossary justificatiónes 30 places', r'justificationes|justificationibus|justificationum'),
    ('glossary malignári (verb) 36:8-9, 104:15, 73:3, 82:4', r'maligna(n|v|t|r|b)|maligne'),
    ('glossary in sǽculum sǽculi', r'in saeculum saeculi'),
    ('glossary tota die', r'tota die'),
    ('glossary conspéctus', r'conspect'),
    ('glossary adjútor', r'adjutor\b|adjutor(em|is|i)\b'),
    ('glossary valde/vehementer', r'\bvalde\b|vehementer'),
    ('glossary Dóminus virtútum 16 lines', r'dominus virtutum|domine virtutum|deus virtutum|domini virtutum|domino virtutum|dominum virtutum'),
    ('glossary gáudium 4 lines (20:7, 29:12, 50:10, 125:2a)', r'\bgaudi(um|o)\b'),
    ('glossary reveréri', r'rever(e|i)'),
    ('glossary inops 14 lines', r'\binop(s|is|em|i|es|um|ibus)\b'),
    ('glossary erubéscere 9 verses', r'erubesc|erubu'),
    ('glossary compúngi', r'compung|compunct'),
    ('glossary in finem', r'in finem'),
    ('glossary movéri / non movébor', r'non movebor'),
]
for claim, pattern in claims:
    rx = re.compile(pattern)
    hits = [(n, vid, len(rx.findall(t))) for n, vid, t in lines if rx.search(t)]
    occ = sum(h[2] for h in hits)
    print(f'## {claim}\n   /{pattern}/  {len(hits)} lines, {occ} occurrences')
    print('   ' + ' '.join(vid for _, vid, _ in hits))
