"""usage: inst_write.py N -> content/books/gueranger-opera-omnia/institutions-liturgiques/tome-N/"""
import sys, os, json, shutil, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bookjson
N = int(sys.argv[1])
INST = '/Users/gustavo/Documents/prayer/research/sourcing/gueranger/inst/'
G = '/Users/gustavo/Documents/prayer/research/sourcing/gueranger/'
root = '/Users/gustavo/Documents/prayer/content/books/gueranger-opera-omnia/institutions-liturgiques/tome-%d/' % N
roman = {1: 'I', 2: 'II', 3: 'III', 4: 'IV'}[N]
info = {
 1: dict(year=1878, ia='institutions011878gu', txt=G + 'ia/x-institutions011878gu.txt', en='Liturgical Institutions, Volume I: Introduction and History to the 17th Century', pt='Instituições litúrgicas, tomo I: Introdução e história até o século XVII', fr='Institutions liturgiques, tome I : Introduction et histoire jusqu’au XVIIe siècle',
   dfr='Premier volume de la seconde édition (1878) : brefs de Pie IX, préfaces, notions préliminaires sur la Liturgie et histoire de la Liturgie depuis les Apôtres jusqu’à la première moitié du XVIIe siècle (chapitres I-XVI), chaque chapitre clos par ses notes.',
   den='First volume of the second edition (1878): briefs of Pius IX, prefaces, preliminary notions on the Liturgy and the history of the Liturgy from the Apostles to the first half of the 17th century (chapters I-XVI), each chapter closed by its notes.',
   dpt='Primeiro volume da segunda edição (1878): breves de Pio IX, prefácios, noções preliminares sobre a Liturgia e história da Liturgia dos Apóstolos à primeira metade do século XVII (capítulos I-XVI), cada capítulo encerrado por suas notas.'),
 2: dict(year=1883, ia='institutions-liturgiques-tome-2-000000254', txt=G + 'ia2/inst2.txt', en='Liturgical Institutions, Volume II: The Liturgy from the 17th to the 19th Century', pt='Instituições litúrgicas, tomo II: A Liturgia do século XVII ao XIX', fr='Institutions liturgiques, tome II : La Liturgie du XVIIe au XIXe siècle',
   dfr='Deuxième volume de la seconde édition : préface, puis la suite de l’histoire de la Liturgie (chapitres XVII-XXIV) : les liturgies néo-gallicanes du XVIIe et du XVIIIe siècle, le rétablissement de la Liturgie romaine au XIXe siècle ; avec l’appendice et l’addition.',
   den='Second volume of the second edition: preface, then the rest of the history of the Liturgy (chapters XVII-XXIV): the neo-Gallican liturgies of the 17th and 18th centuries and the restoration of the Roman Liturgy in the 19th; with the appendix and the addition.',
   dpt='Segundo volume da segunda edição: prefácio e a continuação da história da Liturgia (capítulos XVII-XXIV): as liturgias neogalicanas dos séculos XVII e XVIII e o restabelecimento da Liturgia romana no século XIX; com o apêndice e o adendo.'),
 3: dict(year=1883, ia='institutionslitu0003vari', txt=G + 'ia/x-institutionslitu0003vari.txt', en='Liturgical Institutions, Volume III: The Books of the Liturgy', pt='Instituições litúrgicas, tomo III: Os livros da Liturgia', fr='Institutions liturgiques, tome III : Les livres de la Liturgie',
   dfr='Troisième volume de la seconde édition : préface, deuxième partie (Les livres de la Liturgie, chapitres I-VIII : importance, antiquité, langue, traduction, publication et correction, manuscrits et imprimés, ornements) et Lettre à Mgr l’archevêque de Reims sur le droit de la Liturgie.',
   den='Third volume of the second edition: preface, second part (The books of the Liturgy, chapters I-VIII: importance, antiquity, language, translation, publication and correction, manuscripts and printed books, ornaments) and the Letter to the Archbishop of Rheims on the right of the Liturgy.',
   dpt='Terceiro volume da segunda edição: prefácio, segunda parte (Os livros da Liturgia, capítulos I-VIII: importância, antiguidade, língua, tradução, publicação e correção, manuscritos e impressos, ornamentos) e Carta ao arcebispo de Reims sobre o direito da Liturgia.'),
 4: dict(year=1885, ia='institutions-liturgiques-tome-4-000000293', txt=G + 'ia2/inst4.txt', en='Liturgical Institutions, Volume IV: Liturgical Polemic', pt='Instituições litúrgicas, tomo IV: Polêmica litúrgica', fr='Institutions liturgiques, tome IV : Polémique liturgique',
   dfr='Quatrième volume de la seconde édition : la polémique liturgique de Dom Guéranger (Défense des Institutions liturgiques, lettre à Mgr l’archevêque de Toulouse, pièce justificative, et les trois lettres à Mgr l’évêque d’Orléans de la Nouvelle défense), avec leurs préfaces et l’appendice. La table analytique n’est pas reprise.',
   den='Fourth volume of the second edition: Dom Guéranger’s liturgical polemic (Defence of the Liturgical Institutions, letter to the Archbishop of Toulouse, supporting document, and the three letters to the Bishop of Orléans of the New Defence), with their prefaces and the appendix. The analytical table is not reproduced.',
   dpt='Quarto volume da segunda edição: a polêmica litúrgica de Dom Guéranger (Defesa das Instituições litúrgicas, carta ao arcebispo de Toulouse, peça justificativa e as três cartas ao bispo de Orléans da Nova defesa), com seus prefácios e o apêndice. A tabela analítica não foi reproduzida.'),
}[N]
toc = json.load(open(INST + 'out/%d/toc.json' % N))
os.makedirs(root + 'fr-FR', exist_ok=True)
for f in glob.glob(root + 'fr-FR/*.md'): os.remove(f)
for pid, title, w in toc:
    shutil.copy(INST + 'out/%d/%s.md' % (N, pid), root + 'fr-FR/%s.md' % pid)
os.makedirs(root + 'sources/french-originals', exist_ok=True)
shutil.copy(info['txt'], root + 'sources/french-originals/institutions-liturgiques-tome-%d.txt' % N)
d = {
 'id': 'gueranger-institutions-liturgiques-%d' % N, 'cover': 'classic',
 'name': {'fr-FR': info['fr'], 'en-US': info['en'], 'pt-BR': info['pt']},
 'author': {'fr-FR': 'Prosper Guéranger', 'en-US': 'Prosper Guéranger', 'pt-BR': 'Prosper Guéranger'},
 'description': {'fr-FR': info['dfr'], 'en-US': info['den'], 'pt-BR': info['dpt']},
 'composed': '1840-1851', 'languages': ['fr-FR'], 'work': 'gueranger/institutions-liturgiques',
 'editions': {'fr-FR': {'editor': 'Société générale de librairie catholique, Victor Palmé (Paris)', 'year': info['year']}},
 'sources': [{'language': 'fr-FR', 'url': 'https://archive.org/details/' + info['ia'], 'edition': 'Institutions liturgiques, 2nd ed., tome %s, Paris, Société générale de librairie catholique, Palmé' % roman,
   'description': 'archive.org OCR (djvu.xml word coordinates used to drop running heads, marginal notes and page-foot notes from the body; page-foot notes became footnotes where their markers could be matched; the chapter notes stay as the closing section of each chapter). Raw OCR text in sources/french-originals.',
   'tier': 'A', 'tierEvidence': 'Guéranger died in 1875; text first published in his lifetime (1840-1851) and reprinted by 1885.'}],
 'toc': [{'id': pid, 'title': {'fr-FR': title}} for pid, title, w in toc],
}
bookjson.write(root, d)
print(root, sum(w for _, _, w in toc))
