import json, os, shutil
B = '/Users/gustavo/Documents/prayer/content/books/caussade-opera-omnia/lettres-spirituelles/'
R = '/Users/gustavo/Documents/prayer/research/sourcing/caussade/'
toc = json.load(open(R + 'lettres_toc.json'))
d = {
 'id': 'caussade-lettres-spirituelles',
 'cover': 'quarter',
 'name': {'fr-FR': 'Lettres sur la pratique de l’abandon à la Providence divine', 'en-US': 'Letters on the Practice of Abandonment to Divine Providence', 'pt-BR': 'Cartas sobre a prática do abandono à Providência divina'},
 'author': {'fr-FR': 'Jean-Pierre de Caussade', 'en-US': 'Jean-Pierre de Caussade', 'pt-BR': 'Jean-Pierre de Caussade'},
 'description': {
  'fr-FR': 'La seconde partie de l’ouvrage publié par le P. Henri Ramière en 1861 : cent quarante-huit lettres spirituelles du P. Jean-Pierre de Caussade, S.J. (1675-1751), pour la plupart aux visitandines de Nancy, rangées en sept livres selon l’ordre de Ramière : estime et amour de l’abandon, son exercice, ses obstacles, puis les épreuves successives des âmes (sécheresses, souffrances, craintes, agonie et mort mystique). Texte de la 7e édition de 1874, avec les notes de l’éditeur. Les lettres sont aujourd’hui contestées en partie : l’édition de J. Gagey (2001) n’en tient que trente-deux pour authentiques. L’Appendice de Ramière (dissertation, textes de Bossuet, de Surin, de François de Sales) n’est pas repris.',
  'en-US': 'The second part of the work published by Fr. Henri Ramière in 1861: one hundred and forty-eight spiritual letters of Fr. Jean-Pierre de Caussade, S.J. (1675-1751), most of them to the Visitation nuns of Nancy, arranged in seven books in Ramière’s order: esteem and love of abandonment, its exercise, its obstacles, then the successive trials of souls (dryness, sufferings, fears, agony and mystic death). The text of the 7th edition of 1874 in French, with the editor’s notes, and E. J. Strickland’s 1921 English, which keeps Ramière’s books and letters one for one. The authenticity of many of the letters is now disputed: J. Gagey’s 2001 edition accepts only thirty-two as genuine. Ramière’s Appendix (a dissertation, texts of Bossuet, Surin and Francis de Sales) is not included.',
  'pt-BR': 'A segunda parte da obra publicada pelo P. Henri Ramière em 1861: cento e quarenta e oito cartas espirituais do P. Jean-Pierre de Caussade, S.J. (1675-1751), na maioria dirigidas às visitandinas de Nancy, dispostas em sete livros na ordem de Ramière: estima e amor do abandono, seu exercício, seus obstáculos e, depois, as provações sucessivas das almas (securas, sofrimentos, temores, agonia e morte mística). A autenticidade de muitas das cartas é hoje contestada: a edição de J. Gagey (2001) tem apenas trinta e duas por autênticas.'},
 'composed': '1730-1744',
 'languages': ['fr-FR', 'en-US'],
 'work': 'caussade/lettres-spirituelles',
 'editions': {'fr-FR': {'editor': 'P. Henri Ramière, S.J. (7th ed., Paris: Périsse)', 'year': 1874}, 'en-US': {'translator': 'E. J. Strickland', 'year': 1921}},
 'sources': [
  {'language': 'fr-FR', 'url': 'https://archive.org/details/labandonlaprovid0001caus', 'edition': 'L’Abandon à la Providence divine, ouvrage posthume du P. J.-P. de Caussade, 7e édition augmentée, revue et mise en ordre par le P. H. Ramière, Paris: Librairie catholique de Périsse Frères, 1874: t. I (archive.org labandonlaprovid0001caus, Seconde partie, livres I-III) and t. II (archive.org labandonlaprovid0000caus, livres IV-VII). Internet Archive scans, OCR text.',
   'description': 'The 148 letters of the seven books with their addressee, summary and date, and the editor’s notes. The Avant-propos, the Première partie, the approbations, the tables and the Appendice of t. II are not imported. Running heads, page numbers and line-end hyphens were stripped and recurrent OCR misreadings corrected from a vocabulary check against the corpus’s French books (about 125 word-level fixes); some residual OCR slips and a few footnotes cut at a page break remain. Year digits in the headings are as printed; where the OCR was garbled the English heading was followed.',
   'tier': 'A', 'tierEvidence': 'Caussade died in 1751 and Ramière in 1884; the 1874 edition is public domain everywhere.'},
  {'language': 'en-US', 'url': 'https://ccel.org/ccel/d/decaussade/abandonment/cache/abandonment.txt', 'edition': 'Abandonment to Divine Providence, translated by E. J. Strickland from the 10th French edition (Ramière), with a preface by Dom Arnold, St. Louis: B. Herder / Exeter: Catholic Records Press, 1921. Christian Classics Ethereal Library plain text (proofed).',
   'description': 'The Second Part, Letters on the practice of abandonment, seven books and 148 letters, with Strickland’s titles, addressees and dates and her two footnotes. Strickland’s indexes and the CCEL link lists are left out.',
   'tier': 'A', 'tierEvidence': 'Published 1921 (before 1931); CCEL marks it Public Domain.'}],
 'toc': toc}
os.makedirs(B + 'sources/french-originals', exist_ok=True); os.makedirs(B + 'sources/english-originals', exist_ok=True)
t1 = open(R + 'labandonlaprovid0001caus.txt', errors='replace').read().split('\n')
t2 = open(R + 'labandonlaprovid0000caus.txt', errors='replace').read().split('\n')
end1 = next(i for i in range(14000, len(t1)) if t1[i].startswith('TABLE DES MATI'))
open(B + 'sources/french-originals/lettres-1874-ramiere-archive-org-t1-t2.txt', 'w').write('\n'.join(t1[7295:end1]) + '\n---\n' + '\n'.join(t2[195:10935]) + '\n')
en = open(R + 'ccel-abandonment.txt', errors='replace').read().split('\n')
e_end = next(i for i in range(16700, 16900) if 'Amen! Amen!' in en[i]) + 1
open(B + 'sources/english-originals/lettres-1921-strickland-ccel.txt', 'w').write('\n'.join(en[4824:e_end]) + '\n')
json.dump(d, open(B + 'book.json', 'w'), ensure_ascii=False, indent=2); open(B + 'book.json', 'a').write('\n')
