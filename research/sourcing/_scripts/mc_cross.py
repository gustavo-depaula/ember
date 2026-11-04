import sys, os, re, shutil
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
B = ROOT + 'content/books/marmion-opera-omnia/way-of-the-cross/'
F = 'wayofcrossitserr0000rtre_djvu.txt'
ST = ['Jesus is condemned to death by Pilate', 'Jesus is laden with His Cross', 'Jesus falls the first time under the weight of His Cross', 'Jesus meets His Holy Mother',
 'Simon the Cyrenean helps Jesus to carry His Cross', 'A woman wipes the face of Jesus', 'Jesus falls the second time', 'Jesus speaks to the women of Jerusalem',
 'Jesus falls for the third time', 'Jesus is stripped of His garments', 'Jesus is nailed to the Cross', 'Jesus dies upon the Cross', 'The body of Jesus is taken down from the Cross', 'Jesus is laid in the Sepulchre']
T = [('translators-note', 'Translator’s Note'), ('foreword', 'Foreword'), ('efficacy', 'The Efficacy of the Way of the Cross'), ('exercise', 'The Exercise of the Way of the Cross')] + \
    [(f'station-{i+1:02d}', f'{ROM[i]}. {t}') for i, t in enumerate(ST)]
if __name__ == '__main__':
    EN = load(SRC + 'marmion/' + F)
    starts = [r'^THE publication of', r'^FOREWORD', r'^THE ERFICACY|^THE EFFICACY', r'^B?XERCISE OF THE WAY'] + [r'^%s\. ' % r for r in ROM[:14]]
    idx = split(EN, starts)
    idx.append(next(i for i in range(idx[-1], len(EN)) if EN[i].startswith('PRINTED IN GREAT')))
    V = hyphen_vocab(EN)
    os.makedirs(B + 'en-US', exist_ok=True)
    for k, (cid, title) in enumerate(T):
        j, freq = chapter(EN[idx[k]:idx[k+1]], V, 'en')
        paras, notes = build_chapter(j, freq, 'en', fix_en, keep_lead=(k == 0))
        paras = [x for x in paras if not x.startswith('## ')]
        open(B + f'en-US/{cid}.md', 'w').write(render(title, paras, notes))
    os.makedirs(B + 'sources/english-originals', exist_ok=True)
    shutil.copy(SRC + 'marmion/' + F, B + 'sources/english-originals/way-of-the-cross.txt')
    make_book(B, 'marmion-way-of-the-cross', 'marmion/chemin-de-la-croix',
     {'en-US': 'The Way of the Cross: Its Efficacy and Practice', 'pt-BR': 'A Via-Sacra: sua eficácia e prática'},
     {'en-US': 'Bl. Columba Marmion', 'pt-BR': 'Bem-aventurado Columba Marmion'},
     {'en-US': 'A short treatise on the devotion of the Stations of the Cross, with a meditation on each of the fourteen stations. Extracted from Christ in His Mysteries (conference XIV), it appeared in 1923 almost at the abbot’s death; he said the Way of the Cross every day. English only: no open French text exists.',
      'pt-BR': 'Breve tratado sobre a devoção da Via-Sacra, com uma meditação sobre cada uma das catorze estações. Extraído de «Le Christ dans ses mystères» (conferência XIV), apareceu em 1923, quase na morte do abade, que a rezava todos os dias.'},
     '1923', ['en-US'], {'en-US': {'translator': 'A Nun of Tyburn Convent', 'year': 1923}},
     [{'language': 'en-US', 'url': 'https://archive.org/details/wayofcrossitserr0000rtre', 'edition': 'The Way of the Cross, its Efficacy and Practice, Edinburgh/London: Sands, 1923 (imprimatur Edinburgh 9 May 1923). Internet Archive scan, OCR text.', 'description': 'Translator’s note, foreword, the treatise and the fourteen stations. The edition omits the scripture-reference footnotes. The French (Maredsous, 1923) has no open text.', 'tier': 'A', 'tierEvidence': 'Anonymous translation published 1923: public domain in the US (before 1931) and, as an anonymous work, in Brazil and the EU.'}],
     [(c, {'en-US': t}) for c, t in T])
