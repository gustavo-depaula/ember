import sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gen import emit
def v(s):  # stanzas separated by blank lines; lines end with backslash
    return '\n\n'.join('\\\n'.join(l.strip() for l in st.strip().split('\n')) for st in s.strip().split('\n\n'))
IT = {1: """Se l’anima ha da Dio l’esser perfetto,
Sendo, com’è, creata in un istante,
E non con mezzo di cagion cotante;
Come vincer la dee mortal oggetto?

Là ’ve speme, desio, gaudio e dispetto
La fanno tanto da se stessa errante,
Sì che non veggia, e l’ha pur sempre innante,
Chi bear la potria sol con l’aspetto.

Come ponno le parti esser ribelle
Alla parte miglior né consentire?
E questa servir dee, comandar quelle?

Qual prigion la ritien, ch’indi partire
Non possa, e al fin col piè calcar le stelle,
E viver sempre in Dio, e a sé morire?""",
2: """Amo, e non posso non amarvi, quando
Resto cotanto vinto dal desio,
Che ’l mio nel vostro e ’l vostro amor nel mio,
Anzi ch’io in voi, voi in me ci andiam cangiando.

È tempo ben saria veder il quando,
Ch’alfin io esca d’esto carcer rio,
Di così folle e così cieco oblio,
Dov’io mi trovo e di me stesso in bando.

Ride la terra e ’l cielo e l’ora e i rami,
Stan queti i venti, e son tranquille l’onde,
E ’l sol mai sì lucente non apparse;

Cantan gli augei. Chi dunque è che non ami
E non gioisca? — Io sol: che non risponde
La gioja a le mie forze inferme e scarse.""",
3: """Chi non v’ha, Bernardino, amato ed ama,
Altro non ami. E se pur vuol amare,
Ami il mal non il bene, e ’l bene amare
Lasci a chi non il mal ma il ben sol ama.

Perchè tutto quel ben che di buon s’ama,
E si puote e a ragion si deve amare,
È tutto in voi. Dunque io voi solo amare
Deggio, non amando io ’l mal che non s’ama.

Così spero, mercè di tal amare,
Quel frutto accorre, amato da chi ama;
Che quant’io v’amo, e voi m’abbiate a amare:

Anzi s’è ver, com’è ver, che chi ama
Si trasformi in l’amato, il nostro amare
Voi l’amante farà, me quel che s’ama."""}
EN = {1: """The soul derives from God her being high,
In one keen instant out of nothing brought,
Not painfully through second causes wrought;
How should she, then, submit to things that die?

To hope, desire, to joy, to enmity;
To her confusion by these guides mistaught,
Of One confronting her she knoweth naught,
One glimpse of Whom would lift her to the sky.

How should the baser nature dare rebel
Against the higher, nor, as meet, consent
To do its bidding, but essay to quell?

Why prison bars the aspiring soul prevent
From leaving earth, above the stars to dwell,
To die to self, to live to God, intent.""",
2: """I love, and loving must love ceaselessly.
So whole a conquest in me love hath won;
My love to Thee, Thy love to me doth run.
In Thee I live, and Thou dost live in me.

Surely the day is nigh when I may flee
From this dark gaol, for ever to have done
With vanity and blind oblivion,
Where, exiled from myself, I use to be.

Earth laughs and sky, green branches and soft air,
The winds are quiet, and the waters still,
No sun before has shed so bright a day;

The gay birds sing, love’s joy is everywhere;
My heart alone has no responsive thrill,
My powers flag and shrink from joy away."""}
T_IT = ['Sonetto I. Se l’anima ha da Dio l’esser perfetto', 'Sonetto II. Amo, e non posso non amarvi', 'Sonetto III. Chi non v’ha, Bernardino, amato ed ama']
T_EN = ['Sonnet I. The soul derives from God her being high', 'Sonnet II. I love, and loving must love ceaselessly']
ch = []
for i in (1, 2, 3):
    per = {'it': (T_IT[i - 1], v(IT[i]))}
    if i in EN: per['en-US'] = (T_EN[i - 1], v(EN[i]))
    ch.append(('s%d' % i, per))
META = {'id': 'philip-neri-sonetti', 'cover': 'classic',
 'name': {'it': 'Sonetti di san Filippo Neri', 'en-US': 'Sonnets of St. Philip Neri', 'pt-BR': 'Sonetos de são Filipe Néri'},
 'author': {'it': 'San Filippo Neri', 'en-US': 'St. Philip Neri', 'pt-BR': 'São Filipe Néri'},
 'description': {
  'it': 'I tre sonetti di san Filippo Neri (1515-1595) conservati dal Bacci: l’anima creata da Dio e prigioniera della terra, l’amore che trasforma l’amante nell’amato, e il sonetto a Bernardino. Il testo italiano è quello dei «Documenti» di Capecelatro; per i primi due l’inglese è la versione in versi del reverendo H. I. D. Ryder, prevosto dell’Oratorio di Birmingham. Del terzo non esiste traduzione inglese libera.',
  'en-US': 'The three sonnets of St. Philip Neri (1515-1595) preserved by Bacci: the soul made by God and imprisoned on earth, the love that changes the lover into the beloved, and the sonnet to Bernardino. The Italian is Capecelatro’s text from the Documents of his Life; for the first two the English is the verse translation by the Rev. H. I. D. Ryder, Provost of the Birmingham Oratory, as printed by Antrobus. The third has no freely available English translation.',
  'pt-BR': 'Os três sonetos de são Filipe Néri (1515-1595) conservados por Bacci: a alma criada por Deus e prisioneira da terra, o amor que transforma o amante no amado, e o soneto a Bernardino.'},
 'composed': 'c. 1535-1595', 'languages': ['it', 'en-US'], 'work': 'philip-neri/sonetti',
 'editions': {'it': {'editor': 'Alfonso Capecelatro (La vita di S. Filippo Neri, Milano)', 'year': 1889},
              'en-US': {'translator': 'H. I. D. Ryder (in Bacci, Life of St Philip Neri, ed. F. I. Antrobus)', 'year': 1902}},
 'sources': [
  {'language': 'it', 'url': 'https://archive.org/details/lavitadisfilippo01capeuoft',
   'edition': 'Alfonso Capecelatro, La vita di S. Filippo Neri, Milano 1889, vol. I, Documenti, N. III (Sonetti). Internet Archive scan, OCR text; cross-read against the Antrobus 1902 Italian for sonnets I and II.',
   'description': 'The three sonnets, OCR corrected by hand and by comparison with Antrobus. Two further sonnets and a fragment found after Bacci are not in a free text and are left out.',
   'tier': 'A', 'tierEvidence': 'Capecelatro died in 1912; the 1889 printing is public domain everywhere.'},
  {'language': 'en-US', 'url': 'https://archive.org/details/lifesaintphilip00baccgoog',
   'edition': 'The Life of Saint Philip Neri by Bacci, ed. F. I. Antrobus, London 1902, vol. II pp. 410-412, sonnets translated by H. I. D. Ryder. Internet Archive scan, OCR text corrected by hand.',
   'description': 'Sonnets I and II only.',
   'tier': 'A', 'tierEvidence': 'Ryder died in 1907 and Antrobus in 1903; the 1902 volume is public domain everywhere.'}]}
print(emit('/Users/gustavo/Documents/prayer/content/books/philip-neri-opera-omnia/sonetti', META, ch))
