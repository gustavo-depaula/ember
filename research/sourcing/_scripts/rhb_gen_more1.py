from rhb_gen_fisher1 import cfg
def m(slug, src, name, name_pt, desc, desc_pt, composed, ed, year, edition, **kw):
    cfg(slug, 'more', src=src, name=name, name_pt=name_pt, desc=desc, desc_pt=desc_pt, composed=composed, editor=ed, year=year, url='https://github.com/textcreationpartnership/' + src[:-4], edition=edition + ', EEBO-TCP ' + src[:-4] + '.', front=True, parts=True, **kw)
m('dialogue-of-comfort', 'A07696.xml', 'A Dialogue of Comfort against Tribulation', 'Diálogo de Consolo contra a Tribulação',
 "More's last great book, written in the Tower of London in 1534: a dialogue between the Hungarian Vincent and his uncle Anthony on how to bear tribulation under the threat of the Turk, in three books on the comfort in tribulation, the ills of prosperity and the sure refuge in Christ's Passion.",
 "O último grande livro de More, escrito na Torre de Londres em 1534: um diálogo entre o húngaro Vicente e seu tio Antônio sobre como suportar a tribulação diante da ameaça turca, em três livros.",
 1534, 'Thomas More (London: Richard Tottel, 1553)', 1553, 'A dialoge of comfort against tribulacion (London: Tottel, 1553)')
m('dialogue-concerning-heresies', 'A07698.xml', 'A Dialogue concerning Heresies', 'Um Diálogo sobre as Heresias',
 "More's first English polemic against Tyndale and Luther (1529), a dialogue between More and a messenger sent by a friend, in four books on the authority of the Church, images, relics, pilgrimages, miracles and the translation of the Bible.",
 "A primeira polêmica inglesa de More contra Tyndale e Lutero (1529), um diálogo entre More e um mensageiro, em quatro livros sobre a autoridade da Igreja, as imagens, relíquias, peregrinações, milagres e a tradução da Bíblia.",
 1529, 'Thomas More (London: John Rastell, 1529)', 1529, 'A dyaloge of syr Thomas More knyghte (London: 1529)')
m('supplication-of-souls', 'A68478.xml', 'The Supplication of Souls', 'A Suplicação das Almas',
 "More's answer of 1529 to Simon Fish's Supplication of Beggars, in the person of the souls in purgatory: a defence of prayer for the dead and of the clergy.",
 "A resposta de More (1529) à Suplicação dos Mendigos de Simon Fish, na pessoa das almas do purgatório: uma defesa da oração pelos mortos e do clero.",
 1529, 'Thomas More (London: William Rastell, 1529)', 1529, 'The supplycacyon of soulys (London: 1529)')
m('letter-against-frith', 'A07704.xml', 'A Letter against Frith', 'Carta contra Frith',
 "More's letter of 1533 against John Frith's denial of the Real Presence and of purgatory.", "A carta de More (1533) contra a negação da Presença Real e do purgatório por John Frith.",
 1533, 'Thomas More (London: William Rastell, 1533)', 1533, 'A letter of syr Tho. More knyght impugnynge the erronyouse writyng of Johan Fryth')
m('confutation-of-tyndale-part-1', 'A07693.xml', "The Confutation of Tyndale's Answer, Part I", 'A Refutação da Resposta de Tyndale, Parte I',
 "The first part of More's longest work (1532): a point-by-point reply to William Tyndale's Answer to More's Dialogue, on the Church, the sacraments, images, saints and the Scriptures.",
 "A primeira parte da maior obra de More (1532): resposta ponto a ponto à Resposta de William Tyndale ao Diálogo, sobre a Igreja, os sacramentos, as imagens, os santos e as Escrituras.",
 1532, 'Thomas More (London: William Rastell, 1532)', 1532, 'The co[n]futacyon of Tyndales answere (London: 1532)')
m('confutation-of-tyndale-part-2', 'A07694.xml', "The Confutation of Tyndale's Answer, Part II", 'A Refutação da Resposta de Tyndale, Parte II',
 "The second part of More's Confutation (1533), continuing the reply to Tyndale on purgatory, the Eucharist and the Church.",
 "A segunda parte da Refutação de More (1533), continuando a resposta a Tyndale sobre o purgatório, a Eucaristia e a Igreja.",
 1533, 'Thomas More (London: William Rastell, 1533)', 1533, 'The second parte of the co[n]futacion of Tyndals answere (London: 1533)')
m('apology', 'A07692.xml', 'The Apology of Sir Thomas More', 'A Apologia de Sir Thomas More',
 "More's Apology of 1533, his defence of his own conduct and writings against the charges of the Saint-Germain and others, including his handling of heretics as Chancellor.",
 "A Apologia de More (1533), defesa de sua conduta e de seus escritos, incluindo o trato dos herejes quando Chanceler.",
 1533, 'Thomas More (London: William Rastell, 1533)', 1533, 'The apologye of syr Thomas More knyght (London: 1533)')
m('debellation-of-salem-and-bizance', 'A07695.xml', 'The Debellation of Salem and Bizance', 'A Debelação de Salem e Bizancia',
 "More's reply of 1533 to the anonymous Treatise on the Division between the Spirituality and the Temporality (Christopher St German).", "A resposta de More (1533) ao tratado anônimo sobre a divisão entre o espiritual e o temporal (Christopher St German).",
 1533, 'Thomas More (London: William Rastell, 1533)', 1533, 'The debellacyon of Salem and Bizance (London: 1533)')
m('answer-to-a-poisoned-book', 'A07690.xml', 'The Answer to a Poisoned Book', 'A Resposta a um Livro Envenenado',
 "More's last published polemic (1533), against the Supper of the Lord, an anonymous attack on the Real Presence, defending the doctrine of the Eucharist.", "A última polêmica publicada de More (1533), contra A Ceia do Senhor, ataque anônimo à Presença Real, em defesa da doutrina eucarística.",
 1533, 'Thomas More (London: William Rastell, 1533)', 1533, 'The answere to the fyrst parte of the poysened booke (London: 1533)')
m('life-of-pico', 'A09627.xml', 'The Life of John Picus, Earl of Mirandula', 'A Vida de João Pico, Conde da Mírandola',
 "More's English version (c. 1510) of the life of Giovanni Pico della Mirandola by his nephew Gianfrancesco Pico, with Pico's letters, twelve rules, twelve weapons and a prayer, and More's own verses.",
 "A versão inglesa de More (c. 1510) da vida de Giovanni Pico della Mirandola por seu sobrinho Gianfrancesco Pico, com cartas, doze regras e doze armas e uma oração de Pico, e versos de More.",
 1510, 'Thomas More, tr. (London: Wynkyn de Worde, 1525)', 1525, 'Here is co[n]teyned the lyfe of Iohan Picus erle of Myrandula (London: 1525)')
m('lady-fortune', 'A07691.xml', 'The Boke of the Fayre Gentylwoman that No Man Shulde Put His Trust Therin (Lady Fortune)', 'O Livro da Bela Dama em Quem Ninguém Deve Confiar (Dona Fortuna)',
 "More's early English verses on Lady Fortune, written in the Tudor household of Cardinal Morton.", "Versos ingleses de juventude de More sobre a Dona Fortuna.", 1504, 'Thomas More (London: 1557)', 1557, 'The boke of the fayre gentylwoman')
m('merry-jest', 'A07705.xml', 'A Merry Jest How a Sergeant Would Learn to Play the Friar', 'Uma Divertida Chalaça: Como um Sargento Quis Aprender a Fazer-se Frade',
 "More's comic verse tale of a sergeant who tries to play the friar and is outwitted.", "Conto cômico em versos de More sobre um sargento que quer fazer-se frade e é enganado.", 1516, 'Thomas More (London: 1557)', 1557, 'A mery gest how a sergeaunt woldelerne to be a frer')
m('utopia-robinson', 'A07706.xml', 'Utopia (Ralph Robinson\'s translation)', 'Utopia (tradução de Ralph Robinson)',
 "Ralph Robinson's English version (1551) of More's Utopia, in the old spelling of the first printing: Raphael Hythloday's account of the island of Utopia in two books.",
 "A versão inglesa de Ralph Robinson (1551) da Utopia de More, na grafia antiga da primeira edição: o relato de Rafael Hitlodéu sobre a ilha de Utopia em dois livros.",
 1516, 'Ralph Robinson, tr. (London: Abraham Vele, 1551)', 1551, 'A fruteful and pleasaunt worke of the beste state of a publyque weale, and of the newe yle called Vtopia (London: 1551)', work='more/utopia')
