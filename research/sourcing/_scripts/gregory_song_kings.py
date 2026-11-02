import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from imp_common import *
from gregory_moralia import strip_page_numbers
G = ROOT + 'research/sourcing/gregory-the-great/ws/'
B = ROOT + 'content/books/church-fathers/gregory-great-pope/'
# ---- Song of Songs
src = open(G + 'Expositio_in_Canticum_Canticorum__Gregorius/Expositio_in_Canticum_Canticorum_Gregorius_Magnus_.wiki').read()
t = strip_wiki(src)
t = re.sub(r'\{\{[^}]*\}\}', '', t, flags=re.S)
t = re.sub(r'^==(.*?)==\s*$', r'\1', t, flags=re.M)   # first words of the text sit in a heading
ps = paras(t)
print(len(ps), ps[0][:80], '|', ps[-1][-80:])
book = {
 "id": "gregory-great-pope-song-of-songs", "cover": "classic",
 "name": {"la": "Expositio in Canticum Canticorum", "en-US": "Exposition on the Song of Songs", "pt-BR": "Exposição sobre o Cântico dos Cânticos"},
 "author": gregory_author(),
 "description": {
  "la": "Expositio Gregorii in Canticum Canticorum, quae primos octo versus libri explicat, a Gregorio in Cantico canticorum 1,1-8 conscripta (post 595).",
  "en-US": "Gregory's short commentary on the first eight verses of the Song of Songs (Cant 1:1-8): why Scripture speaks of the soul's love in the words of bodily love, and how kisses, breasts and the beloved's beauty lead the soul from earthly longing to the love of God. The Latin text, in the orthography of the Corpus Corporum edition; no public-domain English translation is known.",
  "pt-BR": "O breve comentário de Gregório aos oito primeiros versículos do Cântico dos Cânticos (Ct 1,1-8): por que a Escritura fala do amor da alma com palavras de amor corporal, e como os beijos, os seios e a beleza da amada conduzem a alma do desejo terreno ao amor de Deus."},
 "composed": "c. 595", "languages": ["la"], "work": "gregory-the-great/expositio-in-canticum",
 "editions": {"la": {"editor": "Corpus Corporum (Univ. of Zurich) transcription, labelled Migne 1849, PL 79; in the u-for-v orthography of the critical edition (CCSL 144)"}},
 "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Expositio_in_Canticum_Canticorum_(Gregorius_Magnus)",
   "edition": "Expositio in Canticum Canticorum (Gregorius Magnus) on Latin Wikisource, from the Corpus Corporum (http://www.mlat.uzh.ch). The page names Migne 1849, but its orthography (uita, ueniens) is that of Verbraken's CCSL 144 (1963), so the underlying edition is uncertain.",
   "description": "Wikitext removed; the first words, set as a heading in the wikitext, rejoined to the text; one chapter.",
   "tier": "B", "tierEvidence": "Text of a 6th-century work; the edition behind the transcription is unverified (see edition)."}],
 "arrived": {"la": "2026-11-02"},
 "toc": [{"id": "expositio", "title": {"la": "Expositio in Canticum Canticorum"}}]}
# first heading words belong to the first sentence: join first two paragraphs
ps[0:2] = [ps[0] + ' ' + ps[1]]
write_book(B + 'song-of-songs', book, {'la': {'expositio': '# Expositio in Canticum Canticorum\n\n' + '\n\n'.join(ps)}}, src, 'expositio-in-canticum')
print('song', words('\n\n'.join(ps)))
# ---- First Kings
chs = {}; toc = []; raw = []
def add(cid, title, ps):
    chs[cid] = '# %s\n\n' % title + '\n\n'.join(ps); toc.append({'id': cid, 'title': {'la': title}})
for suf, cid, title in [('Pro', 'prooemium', 'Prooemium')] + [(ROM[i], 'b%d' % (i+1), 'Liber %s' % ROM[i]) for i in range(6)]:
    s = open(G + 'Commentarii_in_librum_I_Regum/Commentarii_in_librum_I_Regum_%s.wiki' % suf).read(); raw.append(s)
    t = strip_wiki(s)
    t = re.sub(r'^=+.*?=+\s*$', '', t, flags=re.M)
    t = strip_page_numbers(t, 8)
    add(cid, title, paras2(t))
book = {
 "id": "gregory-great-pope-first-kings", "cover": "classic",
 "name": {"la": "In primum Regum expositionum libri VI", "en-US": "Exposition on the First Book of Kings", "pt-BR": "Exposição sobre o Primeiro Livro dos Reis"},
 "author": gregory_author(),
 "description": {
  "la": "In primum librum Regum expositionum libri sex, cum prooemio; opus Gregorio traditum, sed ab recentioribus Petro Cavensi (saec. XII) fere adscriptum.",
  "en-US": "A six-book allegorical exposition of the First Book of Samuel (Vulgate 1 Kings), handed down under Gregory's name in the Maurist edition (PL 79). Its authorship is doubtful: scholars once defended it as Gregory's lectures redacted by Claudius, but it is now generally ascribed to Peter of Cava (12th century). Latin only; no public-domain English translation is known.",
  "pt-BR": "Exposição alegórica, em seis livros, do Primeiro Livro de Samuel (1 Reis na Vulgata), transmitida sob o nome de Gregório na edição beneditina (PL 79). Sua autoria é duvidosa: já foi defendida como lições de Gregório redigidas por Cláudio, mas hoje se atribui em geral a Pedro de Cava (séc. XII)."},
 "composed": "doubtful (c. 6th-12th c.)", "languages": ["la"], "work": "gregory-the-great/in-primum-regum",
 "editions": {"la": {"editor": "Maurist edition (Sainte-Marthe, 1705), as reprinted in Migne, PL 79 (1849)"}},
 "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Commentarii_in_librum_I_Regum",
   "edition": "Commentarii in librum I Regum (prooemium and books I-VI) on Latin Wikisource, from the Corpus Corporum TEI of PL 79 (Migne 1849).",
   "description": "Wikitext removed; the inline PL page counter stripped; one file per book.",
   "tier": "A", "tierEvidence": "Migne's 1849 reprint of the 1705 Maurist edition: public domain. Authorship doubtful."}],
 "arrived": {"la": "2026-11-02"}, "toc": toc}
write_book(B + 'first-kings', book, {'la': chs}, '\n---\n'.join(raw), 'in-primum-regum')
print('kings', sum(words(m) for m in chs.values()))
