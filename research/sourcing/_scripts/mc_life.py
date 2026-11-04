import sys, os, re, shutil
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
B = ROOT + 'content/books/marmion-opera-omnia/christ-life-of-the-soul/'
EN = load(SRC + 'marmion/christlifeofsoul0000marm_djvu.txt')
T = [('preface-mercier', 'Preface by Cardinal Mercier'), ('preface-bourne', 'Preface by Cardinal Bourne'),
 ('1-1-divine-plan', 'I.1. The Divine Plan of Our Adoptive Predestination in Jesus Christ'),
 ('1-2-christ-model', 'I.2. Christ, the Only Model of All Perfection'),
 ('1-3-christ-redeemer', 'I.3. Christ, the Author of Our Redemption and Infinite Treasury of Grace'),
 ('1-4-efficient-cause', 'I.4. Christ, the Efficient Cause of All Grace'),
 ('1-5-church', 'I.5. The Church, the Mystical Body of Christ'),
 ('1-6-holy-spirit', 'I.6. The Holy Spirit, the Spirit of Jesus'),
 ('2-1-faith', 'II.1. Faith in Jesus Christ, the Foundation of Christian Life'),
 ('2-2-baptism', 'II.2. Baptism, the Sacrament of Adoption and Initiation: Death and Life'),
 ('2-3-delicta', 'II.3. Delicta quis intelligit?'),
 ('2-4-penance', 'II.4. The Sacrament and the Virtue of Penance'),
 ('2-5-truth-in-charity', 'II.5. The Truth in Charity'),
 ('2-6-growth', 'II.6. Our Supernatural Growth in Christ'),
 ('2-7-eucharistic-sacrifice', 'II.7. The Eucharistic Sacrifice'),
 ('2-8-panis-vitae', 'II.8. Panis Vitae'),
 ('2-9-vox-sponsae', 'II.9. Vox Sponsae'),
 ('2-10-prayer', 'II.10. Prayer'),
 ('2-11-love-one-another', 'II.11. Love One Another'),
 ('2-12-mother-of-the-word', 'II.12. The Mother of the Incarnate Word'),
 ('2-13-coheredes-christi', 'II.13. Coheredes Christi')]
if __name__ == '__main__':
    starts = [r'^PREFACE\.$', r'^PREFACE\.$'] + [r'^(Summary|SUMMARY)\. '] * 19
    idx = split(EN, starts)
    idx.append(next(i for i in range(idx[-1], len(EN)) if EN[i].startswith('CONTENTS')))
    V = hyphen_vocab(EN)
    os.makedirs(B + 'en-US', exist_ok=True)
    for k, (cid, title) in enumerate(T):
        j, freq = chapter(EN[idx[k]:idx[k+1]], V, 'en')
        paras, notes = build_chapter(j, freq, 'en', fix_en)
        if cid.startswith('preface'):
            paras = [x for x in paras if not x.startswith('## ') and not re.match(r'(THE ECONOMY|Christ, the life)', x)]
        open(B + f'en-US/{cid}.md', 'w').write(render(title, paras, notes))
    os.makedirs(B + 'sources/english-originals', exist_ok=True)
    shutil.copy(SRC + 'marmion/christlifeofsoul0000marm_djvu.txt', B + 'sources/english-originals/christ-the-life-of-the-soul.txt')
