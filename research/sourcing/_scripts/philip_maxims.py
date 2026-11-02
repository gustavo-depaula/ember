import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gen import emit
R = '/Users/gustavo/Documents/prayer/research/sourcing/philip-neri/raw/maxims.txt'
t = open(R).read()
t = t.split('This work was published')[0]
months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
pos = [(m, t.index('\n' + m + '.\n')) for m in months]
pre = t[t.index('PREFACE.') + 8:pos[0][1]].strip()
pre = re.sub(r'\n\nSt\. Wilfrid’s,\n\nFeast of St\. Bridget, 1847\.', '\n\nSt. Wilfrid’s, Feast of St. Bridget, 1847.', pre)
ch = [('preface', {'en-US': ('Preface', pre)})]
for i, (m, p) in enumerate(pos):
    end = pos[i + 1][1] if i + 1 < len(pos) else len(t)
    body = t[p + len(m) + 3:end].strip()
    ch.append((m.lower(), {'en-US': (m.capitalize(), body)}))
SRC = ''
meta = {
 'id': 'philip-neri-maxims-and-sayings', 'cover': 'classic',
 'name': {'en-US': 'The Maxims and Sayings of St. Philip Neri', 'it': 'Ricordi e detti di san Filippo Neri (trad. inglese di Faber)', 'pt-BR': 'Máximas e ditos de são Filipe Néri'},
 'author': {'en-US': 'St. Philip Neri', 'it': 'San Filippo Neri', 'pt-BR': 'São Filipe Néri'},
 'description': {
  'en-US': 'Three hundred and sixty-six sayings of St. Philip Neri (1515-1595), the Apostle of Rome and founder of the Oratory, one for each day of the year, gathered from the processes of canonization and the early lives. Philip wrote almost nothing himself; these are his words as his sons and daughters in the spirit remembered them. Frederick William Faber translated them in 1847 from the Turin little book Ricordi e detti di San Filippo Neri, which is divided by day for a daily spiritual meal. The Italian Turin text is not available in a free digital edition, so this book is English only.',
  'it': 'Trecentosessantasei massime di san Filippo Neri (1515-1595), una per ogni giorno dell’anno, raccolte dai processi di canonizzazione e dalle prime vite. Il testo qui riprodotto è la traduzione inglese di F. W. Faber (1847) dei «Ricordi e detti di San Filippo Neri» stampati a Torino; l’originale italiano non è disponibile in edizione digitale libera.',
  'pt-BR': 'Trezentas e sessenta e seis máximas de são Filipe Néri (1515-1595), uma para cada dia do ano, recolhidas dos processos de canonização e das primeiras biografias. Filipe quase nada escreveu: são as palavras dele como seus filhos espirituais as guardaram. Tradução inglesa de F. W. Faber (1847) dos «Ricordi e detti» de Turim.'},
 'composed': '1847 (sayings of c. 1550-1595)', 'languages': ['en-US'],
 'work': 'philip-neri/massime',
 'editions': {'en-US': {'translator': 'Frederick William Faber', 'year': 1847}},
 'sources': [{'language': 'en-US', 'url': 'https://en.wikisource.org/wiki/The_maxims_and_sayings_of_St_Philip_Neri',
  'edition': 'The Maxims and Sayings of St. Philip Neri, translated by F. W. Faber from the Italian Ricordi e detti di San Filippo Neri (Turin), London 1847. English Wikisource transcription.',
  'description': 'Faber’s preface and the sayings numbered by day under the twelve months. A compilation of sayings transmitted by others, not writings of the saint. Wikisource numbers 12-14 of April and 20/30 of August as printed (April 13 is absent from the transcription; the August numbering has a slip). The Italian original (Turin) was not located online.',
  'tier': 'A', 'tierEvidence': 'Faber died in 1863; the 1847 translation is public domain everywhere.'}]}
print(emit('/Users/gustavo/Documents/prayer/content/books/philip-neri-opera-omnia/massime', meta, ch))
