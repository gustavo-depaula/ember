import sys, os, re, shutil
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
B = ROOT + 'content/books/marmion-opera-omnia/christ-ideal-of-the-monk/'
F = 'christidealofmon0000unse_djvu.txt'
T = [('preface', 'Preface'), ('01-seek-god', 'I. “To Seek God”'), ('02-following-of-christ', 'II. The Following of Christ'),
 ('03-abbot', 'III. The Abbot, Christ’s Representative'), ('04-cenobitical-society', 'IV. The Cenobitical Society'),
 ('05-faith', 'V. Our Faith, the Victory over the World'), ('06-profession', 'VI. Monastic Profession'),
 ('07-instruments-good-works', 'VII. The “Instruments of Good Works”'), ('08-compunction', 'VIII. Compunction of Heart'),
 ('09-self-renunciation', 'IX. Self-Renunciation'), ('10-poverty', 'X. Poverty'), ('11-humility', 'XI. Humility'),
 ('12-bonum-obedientiae', 'XII. Bonum obedientiae'), ('13-opus-dei-praise', 'XIII. The Opus Dei: Divine Praise'),
 ('14-opus-dei-union', 'XIV. The Opus Dei: Means of Union with God'), ('15-monastic-prayer', 'XV. Monastic Prayer'),
 ('16-abandonment', 'XVI. The Spirit of Abandonment to God’s Will'), ('17-good-zeal', 'XVII. Good Zeal'), ('18-peace-of-christ', 'XVIII. The Peace of Christ')]
if __name__ == '__main__':
    EN = load(SRC + 'marmion/' + F)
    idx = split(EN, [r'^PREFACE ?\.'] + [r'^Summary\. '] * 18)
    idx.append(next(i for i in range(idx[-1], len(EN)) if EN[i].startswith('CONTENTS')))
    V = hyphen_vocab(EN)
    os.makedirs(B + 'en-US', exist_ok=True)
    for k, (cid, title) in enumerate(T):
        j, freq = chapter(EN[idx[k]:idx[k+1]], V, 'en')
        paras, notes = build_chapter(j, freq, 'en', fix_en)
        if cid == 'preface':
            cut = next((i for i, x in enumerate(paras) if re.match(r'(I\. .{0,3}To seek|INDEX OF)', x)), len(paras))
            paras = [x for x in paras[:cut] if not x.startswith('## ')]
        open(B + f'en-US/{cid}.md', 'w').write(render(title, paras, notes))
    os.makedirs(B + 'sources/english-originals', exist_ok=True)
    shutil.copy(SRC + 'marmion/' + F, B + 'sources/english-originals/christ-the-ideal-of-the-monk.txt')
    make_book(B, 'marmion-christ-ideal-of-the-monk', 'marmion/christ-ideal-du-moine',
     {'en-US': 'Christ, the Ideal of the Monk', 'pt-BR': 'Cristo, ideal do monge'},
     {'en-US': 'Bl. Columba Marmion', 'pt-BR': 'Bem-aventurado Columba Marmion'},
     {'en-US': 'Eighteen spiritual conferences on the monastic and religious life, a commentary on the Rule of St Benedict in the light of Christ: seeking God, the following of Christ, the abbot, community, faith, profession, the way of abnegation (compunction, renunciation, poverty, humility, obedience) and the life of union with Christ (the Opus Dei, prayer, abandonment, zeal, peace). Third of the trilogy (Le Christ, idéal du moine, 1922). English only: no open French text exists.',
      'pt-BR': 'Dezoito conferências espirituais sobre a vida monástica e religiosa, um comentário à Regra de São Bento à luz de Cristo: buscar a Deus, seguir a Cristo, o abade, a comunidade, a fé, a profissão, o caminho da renúncia (compunção, renúncia, pobreza, humildade, obediência) e a vida de união com Cristo (o Opus Dei, a oração, o abandono, o zelo, a paz). Terceiro da trilogia (Le Christ, idéal du moine, 1922).'},
     '1922', ['en-US'], {'en-US': {'translator': 'A Nun of Tyburn Convent (from the 8th French edition)', 'year': 1926}},
     [{'language': 'en-US', 'url': 'https://archive.org/details/christidealofmon0000unse', 'edition': 'Christ the Ideal of the Monk, spiritual conferences on the monastic and religious life, London: Sands / St. Louis: Herder, 1926 (imprimatur Bruges Feb 1926). Internet Archive scan, OCR text.', 'description': 'Preface and the eighteen conferences. Running heads stripped; the reference notes at the foot of each page are footnotes placed at the end of the page. Cross-checks were available in two other scans (in.ernet.dli.2015.174061, ChristTheIdealOfTheMonk) but were not diffed. The French original has no open text.', 'tier': 'A', 'tierEvidence': 'Anonymous translation published 1926: public domain in the US (before 1931) and, as an anonymous work, in Brazil and the EU; Marmion died 1923.'}],
     [(c, {'en-US': t}) for c, t in T])
