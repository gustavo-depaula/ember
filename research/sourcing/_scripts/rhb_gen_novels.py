import json, sys
CH = r"^(?:CHAPTER (?P<n>[IVXL]+)|EPILOGUE)\.?$"
SEC = r"^[IVXL]+\.?$"
END = r"^\*\*\* END OF"
def cfg(slug, name, name_pt, desc, desc_pt, composed, pub, pg, **kw):
    d = dict(id='benson-' + slug, dir='benson-opera-omnia/' + slug, slug=slug, name=name, name_pt=name_pt, desc=desc, desc_pt=desc_pt,
             composed=composed, editor='Robert Hugh Benson (%s)' % pub[0], year=pub[1], url='https://www.gutenberg.org/ebooks/%d' % pg,
             edition='%s (%s), Project Gutenberg #%d, proofread.' % (name, pub[0], pg), src='robert-hugh-benson/pg/pg%d.txt' % pg,
             chap_re=CH, sec_re=SEC, end=END, srcnote='Parts and chapters as printed; the numbered sections inside chapters are kept as ## headings.')
    d.update(kw)
    json.dump(d, open('rhb_cfg_%s.json' % slug, 'w'), indent=1, ensure_ascii=False)
PT = r"^PART [IVX]+$"
cfg('come-rack-come-rope', 'Come Rack! Come Rope!', 'Venha o Cavalete! Venha a Corda!',
 "Benson's novel of 1912 about the Elizabethan persecution of Catholics in Derbyshire: the love of Robin Audrey and Marjorie Manners, the Babington plot, the priests Garlick and Ludlam captured at Padley, and the martyrs' deaths. The title is Campion's cry on the rack.",
 "O romance de Benson (1912) sobre a perseguição isabelina aos católicos em Derbyshire: o amor de Robin Audrey e Marjorie Manners, a conspiração de Babington, os padres Garlick e Ludlam presos em Padley e a morte dos mártires. O título é o grito de Campion no potro.",
 1912, ('New York: P. J. Kenedy & Sons, 1912', 1912), 15992, start=r'^PREFACE$', lead_title='Preface', lead_id='preface', part_re=PT)
cfg('kings-achievement', "The King's Achievement", 'A Obra do Rei',
 "Benson's novel of 1905 on the dissolution of the monasteries under Henry VIII: the brothers Ralph and Anthony Torridon, one drawn to Cromwell's service, the other to the cloister, caught in the fall of the English religious houses.",
 "O romance de Benson (1905) sobre a dissolução dos mosteiros sob Henrique VIII: os irmãos Ralph e Anthony Torridon, um atraído ao serviço de Cromwell, o outro ao claustro, apanhados na queda das casas religiosas inglesas.",
 1905, ('London: Hutchinson, 1905', 1905), 16375, start=r'^THE KING’S ACHIEVEMENT$', after=100, part_re=r"^(?:BOOK|PART) [IVX]+(?:--.*)?\.?$")
cfg('by-what-authority', 'By What Authority?', 'Com Que Autoridade?',
 "Benson's first Catholic novel (1904), set in Elizabethan England: Isabel Norris and her family, Anglican gentry, are drawn through the persecution of Catholics to ask on what authority the Church of England stands, and to the Mass.",
 "O primeiro romance católico de Benson (1904), na Inglaterra isabelina: Isabel Norris e sua família, fidalguia anglicana, são levadas, através da perseguição aos católicos, a perguntar em que autoridade se funda a Igreja da Inglaterra, e até à Missa.",
 1904, ('London: Isbister, 1904', 1904), 19697, start=r'^BY WHAT AUTHORITY\?$', after=150, part_re=PT, title_next=True)
cfg('oddsfish', 'Oddsfish!', 'Oddsfish!',
 "Benson's Restoration novel of 1914, told by Humphrey Challoner, a young Catholic in the court of Charles II: the king's secret reception into the Church, the Popish Plot and the intrigues of Whitehall.",
 "O romance de Benson sobre a Restauração (1914), narrado por Humphrey Challoner, jovem católico na corte de Carlos II: a recepção secreta do rei na Igreja, a Conspiração Papista e as intrigas de Whitehall.",
 1914, ('London: Hutchinson, 1914', 1914), 16288, start=r'^PROLOGUE$', after=60, lead_title='Prologue', lead_id='prologue', part_re=r"^PART [A-Z]+$")
cfg('none-other-gods', 'None Other Gods', 'Nenhum Outro Deus',
 "Benson's novel of 1910 of a young English earl, Frank Guiseley, who becomes a Catholic and is led by it to a life of sacrifice, set against the idols of modern society.",
 "O romance de Benson (1910) sobre um jovem conde inglês, Frank Guiseley, que se torna católico e é levado por isso a uma vida de sacrifício, diante dos ídolos da sociedade moderna.",
 1910, ('London: Hutchinson, 1910', 1910), 17627, start=r'^NONE OTHER GODS$', after=100, part_re=PT)
cfg('dawn-of-all', 'The Dawn of All', 'A Aurora de Tudo',
 "Benson's companion to Lord of the World (1911): a priest wakes from a long illness into a world where the Church has triumphed and Europe has returned to the Faith, a utopia of Catholic civilization.",
 "O contraponto de Benson a O Senhor do Mundo (1911): um padre desperta de uma longa doença num mundo em que a Igreja triunfou e a Europa voltou à fé, uma utopia da civilização católica.",
 1911, ('London: Hutchinson, 1911', 1911), 11626, start=r'^PROLOGUE$', after=70, lead_title='Prologue', lead_id='prologue', part_re=PT)
cfg('necromancers', 'The Necromancers', 'Os Necromantes',
 "Benson's novel of 1909 on spiritualism: a young man, Laurie Baxter, bereaved of the woman he loves, turns to a medium and falls under the control of the spirits, until a priest intervenes.",
 "O romance de Benson (1909) sobre o espiritismo: um jovem, Laurie Baxter, enlutado pela mulher que ama, recorre a um médium e cai sob o domínio dos espíritos, até que um padre intervém.",
 1909, ('London: Hutchinson, 1909', 1909), 14275, start=r'^--Robert Hugh Benson\.$', after=70, chap_re=r"^_Chapter (?P<n>[IVXL]+)_$", srcnote='Chapters as printed; the numbered sections are kept as ## headings.')
