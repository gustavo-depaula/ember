import sys, os, re, json, shutil
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
B = ROOT + 'content/books/marmion-opera-omnia/christ-in-his-mysteries/'
FR = load(SRC + 'marmion/lechristdanssesm00marm_djvu.txt')
EN = load(SRC + 'marmion/christinhismyste0000righ_djvu.txt')
T = [  # id, fr, en
 ('avant-propos', 'Avant-propos de la 1re édition', 'Foreword to the First Edition'),
 ('01-mysteres-du-christ', 'Les mystères du Christ sont nos mystères', 'The Mysteries of Christ Are Our Mysteries'),
 ('02-contact-mysteres', 'Comment nous nous assimilons le fruit des mystères de Jésus', 'Our Contact with the Mysteries of Jesus'),
 ('03-in-sinu-patris', 'In sinu Patris', 'In sinu Patris'),
 ('04-verbe-fait-chair', '« Et le Verbe s’est fait chair »', '« And the Word was made Flesh »'),
 ('05-sauveur-pontife', 'Sauveur et Pontife', 'Saviour and High Priest'),
 ('06-preparations-divines', 'Les préparations divines (Temps de l’Avent)', 'Divine Preparations (Advent)'),
 ('07-admirabile-commercium', 'O admirabile commercium !', 'O admirabile commercium !'),
 ('08-epiphanie', 'L’Épiphanie', 'The Epiphany'),
 ('09-vierge-marie-vie-cachee', 'La Vierge Marie, les mystères de l’enfance et de la vie cachée', 'The Blessed Virgin Mary; the Mysteries of the Infancy and of the Hidden Life'),
 ('10-bapteme-tentation', 'Le baptême et la tentation de Jésus', 'The Baptism and the Temptation of Jesus'),
 ('11-vie-publique', 'Quelques aspects de la vie publique de Jésus', 'Some Aspects of the Public Life of Jesus'),
 ('12-thabor', 'Au sommet du Thabor', 'On the Heights of Thabor'),
 ('13-dilexit-ecclesiam', '« Le Christ a aimé l’Église et s’est livré pour elle afin de la sanctifier »', '« Christ loved the Church and delivered Himself up for it, that He might sanctify it »'),
 ('14-pretoire-calvaire', 'Sur les pas de Jésus, du prétoire au Calvaire', 'In the Footsteps of Jesus, from the Praetorium to Calvary'),
 ('15-si-consurrexistis', 'Si consurrexistis cum Christo', 'Si consurrexistis cum Christo'),
 ('16-glorifiez-votre-fils', '« Et maintenant, ô Père, glorifiez votre Fils »', '« And now, Father, glorify Thy Son »'),
 ('17-saint-esprit', 'La mission du Saint-Esprit', 'The Mission of the Holy Spirit'),
 ('18-in-mei-memoriam', 'In mei memoriam', 'In mei memoriam'),
 ('19-coeur-du-christ', 'Le Cœur du Christ', 'The Heart of Christ'),
 ('20-couronne-des-saints', 'Le Christ, couronne de tous les saints', 'Christ, the Crown of All the Saints'),
]
S = r'^\{?Sommaire\.'
frs = [r'AVANT-PROPOS DE LA', S, S, S, S, r'^SAUVEUR ET PONTIFE\.?$', S, S, S, S, S, S, r'^XII\. . AU SOMMET DU THABOR\.?$', S, S, S, S, S, S, S, S]
ens = [r'^FOREWORD TO THE'] + [r'^(Summary|SUMMARY)\. ']*20
def run(lines, starts, endrx, lang, fix, V):
    idx = split(lines, starts)
    end = next(i for i in range(idx[-1], len(lines)) if re.match(endrx, re.sub(r'\s+', ' ', lines[i].strip())))
    idx.append(end)
    res = []
    for k in range(len(T)):
        j, freq = chapter(lines[idx[k]:idx[k+1]], V, lang)
        paras, notes = build_chapter(j, freq, lang, fix_fr if lang == 'fr' else fix_en, keep_lead=False)
        if k == 0:  # the epigraph of conference I (garbled capitals) follows the foreword
            cut = next(i for i, x in enumerate(paras) if re.match(r'(INDEX DES|PRELIMINARY|CONFERENCES PREL|CONTENTS|INDEX)', x) or re.search(r'\. \. |^TE, ', x) or (len(x) > 60 and caps_ratio(x) > .6))
            paras = [x for x in paras[:cut] if not x.startswith('## ')]
        res.append((paras, notes))
    return res
frr = run(FR, frs, r'^TABLE DES MATI', 'fr', fix_fr, hyphen_vocab(FR))
enr = run(EN, ens, r'^(CONTENTS|INDEX)', 'en', fix_en, hyphen_vocab(EN))
for lang, d, res, ti in (('fr-FR', 'fr-FR', frr, 1), ('en-US', 'en-US', enr, 2)):
    os.makedirs(B + d, exist_ok=True)
    for t, (paras, notes) in zip(T, res):
        open(B + f'{d}/{t[0]}.md', 'w').write(render(t[ti], paras, notes))
os.makedirs(B + 'sources/french-originals', exist_ok=True); os.makedirs(B + 'sources/english-originals', exist_ok=True)
shutil.copy(SRC + 'marmion/lechristdanssesm00marm_djvu.txt', B + 'sources/french-originals/christ-dans-ses-mysteres.txt')
shutil.copy(SRC + 'marmion/christinhismyste0000righ_djvu.txt', B + 'sources/english-originals/christ-in-his-mysteries.txt')
