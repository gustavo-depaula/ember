import re, sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fds_clean import clean, finish
from fds_common import *

DL = '/Users/gustavo/Documents/prayer/research/sourcing/francis-de-sales/dl'
ps = finish(clean(f'{DL}/t06l.txt'))
ordn = ['PREMIER','SECOND','TROISIESME','QUATRIESME','CINQUIESME','SIXIESME','SEPTIESME','HUITIESME','NEUFVIESME','DIXIESME','UNZIESME','DOUZIESME','TREIZIESME','QUATORZIESME','QUINZIESME','SEIZIESME','DIX-SEPTIESME','dix-huitiesme','DIX-NEUFVIESME','VINGTIESME','VINGT-UNIESME']
starts = []
pos = 100
for i, o in enumerate(ordn):
    pat = re.compile(r'^␂?\s*' + re.escape(o) + (r'\s+ENTRETIEN' if i != 17 else ''))
    j = next(k for k in range(pos, len(ps)) if pat.match(ps[k]))
    starts.append(j)
    pos = j + 1
end = next(k for k in range(starts[-1], len(ps)) if 'APPROBATION ET PRIVIL' in ps[k])
app = next(k for k in range(end, len(ps)) if 'QUI NE SE TROUVENT' in ps[k])
last = next(k for k in range(app, len(ps)) if ps[k].startswith('DERNIER ENTRETIEN') or ps[k].startswith('␂DERNIER ENTRETIEN'))
passages = next(k for k in range(last, len(ps)) if 'PASSAGES DES MANUSCRITS' in ps[k])
avis = next(k for k in range(100, 400) if 'AVIS AU LECTEUR' in ps[k])
print(starts, end, app, last, passages, avis, file=sys.stderr)

def body(a, b):
    a += 1
    while a < b and (ps[a].startswith('␂') or ps[a].isupper() or len(ps[a]) < 12):
        a += 1
    return [p.lstrip('␂') for p in ps[a:b]]

fr_titles = ["De l’obligation des Constitutions","De la confiance","De la fermeté","De la cordialité et de l’esprit d’humilité","De la générosité","De l’espérance","De trois loix spirituelles","De la desappropriation","De la modestie","De l’obeissance","De la vertu d’obeissance","De la simplicité","De l’esprit des Réglés","Du jugement propre","De la volonté de Dieu","Des aversions","Des voix","Des sacremens","Des vertus de saint Joseph","De la prétention religieuse","De ne rien demander"]
en_titles = ["Obligation of the Constitutions","On Confidence","On Constancy","On Cordiality and on the Spirit of Humility","On Generosity","On Hope","Three Spiritual Laws","On Self-Renouncement","On Religious Modesty","On Obedience","The Virtue of Obedience","On Simplicity and Religious Prudence","On the Rules and the Spirit of the Visitation","On Private Judgment","The Will of God","On Antipathies","On Voting in a Community","The Sacraments and Divine Office","On the Virtues of St. Joseph","Why We Should Become Religious","On Asking for Nothing"]
roman = lambda n: ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'][n-1]
BK = 'entretiens-spirituels'
toc = []
tot = 0
# dedication: paragraphs after avis block up to PREMIER heading
dstart = next(k for k in range(avis, starts[0]) if re.search(r'tres-cheres|Mes tres', ps[k]) ) if any(re.search(r'tres-cheres|Mes tres', ps[k]) for k in range(avis, starts[0])) else avis + 6
ded = [p.lstrip('\u2402') for p in ps[next(k for k in range(avis, starts[0]) if ps[k].startswith('A NOS CHERES'))+4:starts[0]] if 'Aux Religieuses de la Visitation' not in p]
print('ded paras', len(ded), ded[:2], file=sys.stderr)
tot += write_chapter(BK, 'fr-FR', 'aux-religieuses', 'Aux Religieuses de la Visitation', ded)
toc.append(('aux-religieuses', 'Aux Religieuses de la Visitation', None))
for n in range(1, 22):
    a = starts[n-1]; b = starts[n] if n < 21 else end
    cid = f'entretien-{roman(n).lower()}'
    t = f'Entretien {roman(n)}. {fr_titles[n-1]}'
    tot += write_chapter(BK, 'fr-FR', cid, t, body(a, b))
    toc.append((cid, t, f'Conference {roman(n)}. {en_titles[n-1]}'))
tot += write_chapter(BK, 'fr-FR', 'appendice-entretiens-inedits', 'Appendice. Entretiens qui ne se trouvent dans aucune édition antérieure (A-E)', body(app, last))
tot += write_chapter(BK, 'fr-FR', 'dernier-entretien', 'Dernier entretien de nostre bien-heureux Pere, Lyon, 1622', body(last, passages))
print('fr words', tot, file=sys.stderr)
json.dump({'toc': toc}, open('/tmp/ent_toc.json', 'w'))
