import sys, os, re, shutil
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
B = ROOT + 'content/books/chautard-opera-omnia/true-apostolate-girardey/'
F = 'chautard/true-apostolate-1918_djvu.txt'
T = [('preface', 'Preface', r'^PREFACE'),
 ('1-god-wills-works-and-interior-life', 'Part I. God Wills Not Only the Apostolic Works, but Also the Interior Life of the Apostolic Laborer', r'^GOD WILLS NOT ONLY'),
 ('2-union-of-active-and-interior-life', 'Part II. Union of the Active Life with the Interior', r'^UNION OF THE ACTIVE LIFE'),
 ('3-works-means-of-holiness-and-danger', 'Part III. The Apostolic Works, a Means of Holiness to Interior Souls, but a Danger to Those Who Lack the Interior Life', r'^THE APOSTOLIC WORKS, A MEANS'),
 ('4-interior-life-imparts-fertility', 'Part IV. The Interior Life Imparts Fertility to the Works of the Active Life', r'^THE INTERIOR LIFE IMPARTS'),
 ('5-principles-and-counsels', 'Part V. Principles and Counsels Concerning the Interior Life', r'^PRINCIPLES AND COUNSELS'),
 ('6-priests-liturgical-life-and-devotion-to-mary', 'Part VI. The Priest’s Liturgical Life; Devotion to Mary', r'^THE PRIEST.S LITURGICAL LIFE')]
if __name__ == '__main__':
    EN = load(SRC + F)
    idx = split(EN[100:], [t[2] for t in T])
    idx = [100 + i for i in idx]
    idx.append(next(i for i in range(idx[-1], len(EN)) if EN[i].strip() == 'THE END'))
    # PREFACE appears twice (two pages): the second one is the Mary dedication, kept in the same chapter
    V = hyphen_vocab(EN)
    os.makedirs(B + 'en-US', exist_ok=True)
    for k, (cid, title, _) in enumerate(T):
        j, freq = chapter(EN[idx[k]:idx[k+1]], V, 'en')
        paras, notes = build_chapter(j, freq, 'en', fix_en, sections=False, keep_lead=(k == 0))
        out = []
        for p in paras:
            if len(p) < 150 and caps_ratio(p) > .6 and not p.startswith('[^') and k > 0:
                h = re.sub(r'\s+', ' ', p.title()).strip('. ')
                if re.search(r'(Tog|Vig:?)$', h): continue
                for a, b in [('Gop', 'God'), ('Wilts', 'Wills'), ('Wart', 'What'), ('Sous', 'Souls'), ('Tue', 'The'), ('Wuo', 'Who'), ('Ill.', 'III.'), ('Iii.', 'III.'), ('Il.', 'II.'), ('Ii.', 'II.'), ('Iv.', 'IV.'), ('Ness', 'ness'), ('Holi- ness', 'Holiness')]:
                    h = re.sub(r'\b' + re.escape(a), b, h)
                out.append('## ' + h)
            else: out.append(p)
        if k == 0: out = [p for p in out if not re.fullmatch(r'PREFACE\.?', p)]
        open(B + f'en-US/{cid}.md', 'w').write(render(title, out, notes))
    os.makedirs(B + 'sources/english-originals', exist_ok=True)
    shutil.copy(SRC + F, B + 'sources/english-originals/true-apostolate.txt')
    make_book(B, 'chautard-true-apostolate-girardey', 'chautard/ame-de-tout-apostolat',
     {'en-US': 'The True Apostolate (Girardey, condensed)', 'pt-BR': 'O verdadeiro apostolado (Girardey, resumido)'},
     {'en-US': 'Dom Jean-Baptiste Chautard', 'pt-BR': 'Dom Jean-Baptiste Chautard'},
     {'en-US': 'The Redemptorist Ferreol Girardey’s 1918 English version of L’Âme de tout apostolat, somewhat condensed (about half the length) and made from the 6th French edition of 1916: the interior life as the soul of all apostolic works, in six parts. A separate book from the French because it does not follow the French chapter for chapter; see the French edition for the complete text.',
      'pt-BR': 'A versão inglesa de 1918 do redentorista Ferreol Girardey de «L’Âme de tout apostolat», resumida (cerca de metade da extensão) e feita a partir da 6ª edição francesa de 1916: a vida interior como alma de todas as obras de apostolado, em seis partes. Livro à parte do francês porque não acompanha seus capítulos.'},
     '1912', ['en-US'], {'en-US': {'translator': 'Ferreol Girardey, C.Ss.R. (condensed; from the 6th French edition, 1916)', 'year': 1918}},
     [{'language': 'en-US', 'url': 'https://archive.org/details/bwb_S0-CDW-403', 'edition': 'The True Apostolate, from the French of Dom J. B. Chautard, Abbot of Sept-Fons, by Rev. Ferreol Girardey, C.SS.R., St. Louis: B. Herder, 1918. Internet Archive scan, OCR text.', 'description': 'Preface and the six parts. Running heads stripped; the section headings are taken from the OCR (some capitals read badly). Condensed translation, about half the length of the French. The Merton (1946) and Moran translations are not used.', 'tier': 'A', 'tierEvidence': 'Published 1918: public domain in the US (before 1931); the translator’s text is not a recent work; Chautard died 1935 (public domain in Brazil and the EU).'}],
     [(c, {'en-US': t}) for c, t, _ in T])
