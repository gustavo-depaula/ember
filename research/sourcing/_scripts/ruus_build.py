import re, json, os, sys, glob
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from ruus_sections import sections, render, D
from bookjson import write, author_file
R='/Users/gustavo/Documents/prayer/content/books/ruusbroec-opera-omnia/'
VOLS={'tabernakel':'02','spieghel':'03','kerstenen':'03','trappen':'04','sloten':'04','rijcke':'04','becoringen':'04','beghinen':'05','brulocht':'06','steen':'06','waerheit':'06'}
AUTH={"dum":"Jan van Ruusbroec (1293-1381)","en-US":"Bl. John Ruusbroec (1293-1381)","pt-BR":"Bem-aventurado João Ruusbroec (1293-1381)"}
SRC=lambda vol,vt:{"language":"dum","url":f"https://www.dbnl.org/tekst/ruus001vlae{vol}_01/","edition":f"Jan van Ruusbroec, Werken, ed. J. B. David, deel {int(vol)}: {vt} (Gent: Maetschappy der Vlaemsche Bibliophilen, {({'02':1858,'03':1860,'04':1861,'05':1863,'06':1868}[vol])}).","description":"Keyed text from DBNL (TEI XML, 'auteursrechtvrij'), converted by research/sourcing/_scripts/rhineland/ruus_build.py. Line-end hyphens joined; page and line breaks dropped. David's apparatus is kept as footnotes (manuscript variants F, G, I, L, M, D, Surius' Latin readings 'Sur.'). David's Dutch preface, manuscript list, misprint list and glossary are not included.","tier":"A","tierEvidence":"Nineteenth-century critical edition, marked 'Auteursrechtvrij' on DBNL."}
EDIT={"editor":"Jan Baptist David","year":None}
def title_of(head,i):
    h=re.sub(r'\s+',' ',head).strip()
    m=re.search(r'\s*\bC\.?\s*([IVXLC]+)\.?$',h)
    if m: return re.sub(r'\s*,?$','',h[:m.start()]).rstrip('.').strip() or h, m.group(1)
    return h.rstrip('.').strip(),None
def build(key, slug, names, descs, composed, parts=None, vols_title=None):
    """parts: for brulocht a list of section keys."""
    keys=parts or [key]
    vol=VOLS[key]
    works,_=sections(vol)
    bid=f'ruusbroec-{slug}'
    d=R+slug
    toc=[]; nch=0; words=0
    os.makedirs(d+'/dum',exist_ok=True)
    for pi,k in enumerate(keys):
        chs=[c for c in works[k]['chapters'] if c['blocks']]
        prefix=f'b{pi+1}-' if parts else ''
        nodes=[]
        for i,c in enumerate(chs):
            t,rom=title_of(c['head'],i)
            if re.match(r'(?i)prologhe',t): cid=prefix+'prologhe'; label=t.rstrip('.')
            else:
                n=sum(1 for x in nodes if not x['id'].endswith('prologhe'))+1
                cid=f'{prefix}c{n:03d}'; label=(f'{rom or n}. {t}')
            md=f'# {label}\n\n'+render(c)+'\n'
            open(f'{d}/dum/{cid}.md','w').write(md); words+=len(md.split())
            nodes.append({'id':cid,'title':{'dum':label}})
        if parts:
            toc.append({'id':f'boek-{pi+1}','title':{'dum':works[k]['head'].rstrip('.').replace('Hier beghint ','').replace('Hier deghint ','').capitalize() if False else parts_titles[pi]},'children':nodes})
        else: toc=nodes
    meta={"id":bid,"cover":"classic","name":names,"author":AUTH,"description":descs,"composed":composed,"languages":["dum"],
      "work":f"ruusbroec/{slug}","editions":{"dum":{"editor":"Jan Baptist David","year":{'02':1858,'03':1860,'04':1861,'05':1863,'06':1868}[vol]}},
      "sources":[SRC(vol,works[keys[0]]['head'])],"toc":toc}
    write(d,meta)
    os.makedirs(d+'/sources/dum-originals',exist_ok=True)
    with open(d+f'/sources/dum-originals/{slug}.txt','w') as f:
        for k in keys:
            for c in works[k]['chapters']:
                if c['blocks']: f.write(c['head']+'\n\n'+render(c)+'\n\n---\n\n')
    print(bid,len(toc),words)
    return d
parts_titles=[]
CFG={
'brulocht':dict(key='brulocht',parts=['brulocht1','brulocht2','brulocht3'],slug='brulocht',
  names={"dum":"Die chierheit der gheesteliker brulocht","en-US":"The Spiritual Espousals (Adornment of the Spiritual Marriage)","pt-BR":"As Bodas Espirituais"},
  descs={"dum":"Ruusbroecs hoofdwerk in drie boeken: het werkende leven, het innige leven en het godschouwende leven, naar Mt 25,6 'Ecce sponsus venit'. Middelnederlandse tekst van J. B. David (1868), met handschriftvarianten en Surius' Latijn in voetnoten.","en-US":"Ruusbroec's masterpiece in three books on the active, the interior and the contemplative life, a commentary on 'Behold the Bridegroom comes' (Mt 25:6). The Middle Dutch text of J. B. David (1868), with manuscript variants and Surius' Latin readings in footnotes.","pt-BR":"A obra-prima de Ruusbroec em três livros sobre a vida ativa, a vida interior e a vida contemplativa, comentário de 'Eis o Esposo que vem' (Mt 25,6). Texto em neerlandês médio de J. B. David (1868), com variantes de manuscritos em notas."},
  composed='c. 1335-1345',titles=["Het eerste boek: het werkende leven","Het tweede boek: het innige leven","Het derde boek: het godschouwende leven"]),
'steen':dict(key='steen',slug='blinkende-steen',names={"dum":"Dat hantvingherlijn oft vanden blickenden steene","en-US":"The Sparkling Stone","pt-BR":"A Pedra Brilhante"},
  descs={"dum":"Kort traktaat over de drie levens van de goede, de innige en de schouwende mens, naar Apc 2,17: de blinkende steen met de nieuwe naam. Middelnederlandse tekst van J. B. David (1868).","en-US":"A short treatise on the good, the interior and the contemplative man, from Rev 2:17, the bright stone bearing a new name. The Middle Dutch text of J. B. David (1868).","pt-BR":"Breve tratado sobre o homem bom, o homem interior e o contemplativo, a partir de Ap 2,17: a pedra brilhante com o nome novo. Texto em neerlandês médio de J. B. David (1868)."},composed='c. 1340-1350'),
'waerheit':dict(key='waerheit',slug='boec-der-hoechster-waerheit',names={"dum":"Dat boec der hoechster waerheit","en-US":"The Book of Supreme Truth","pt-BR":"O Livro da Suprema Verdade"},
  descs={"dum":"Ruusbroecs verduidelijking van de eenheid met God, geschreven om valse mystiek te weerleggen (ook 'Boecsken der verclaringhe'). Middelnederlandse tekst van J. B. David (1868).","en-US":"Ruusbroec's clarification of union with God, written against false mysticism (also called the Little Book of Enlightenment). The Middle Dutch text of J. B. David (1868).","pt-BR":"Esclarecimento de Ruusbroec sobre a união com Deus, escrito contra a falsa mística (também chamado Livrinho de Esclarecimento). Texto em neerlandês médio de J. B. David (1868)."},composed='c. 1340-1350'),
'tabernakel':dict(key='tabernakel',slug='gheestelike-tabernakel',names={"dum":"Vanden gheesteliken tabernakel","en-US":"The Spiritual Tabernacle","pt-BR":"O Tabernáculo Espiritual"},
  descs={"dum":"Ruusbroecs omvangrijkste werk: een allegorische uitlegging van de tabernakel, het priesterschap en de offers van het Oude Verbond op Christus, de sacramenten en het innerlijk leven. Middelnederlandse tekst van J. B. David (1858).","en-US":"Ruusbroec's longest work: an allegorical reading of the tabernacle, the priesthood and the sacrifices of the Old Law as Christ, the sacraments and the interior life. The Middle Dutch text of J. B. David (1858).","pt-BR":"A mais extensa obra de Ruusbroec: leitura alegórica do tabernáculo, do sacerdócio e dos sacrifícios da Antiga Lei como Cristo, os sacramentos e a vida interior. Texto em neerlandês médio de J. B. David (1858)."},composed='c. 1350'),
'spieghel':dict(key='spieghel',slug='spieghel-der-eeuwigher-salicheit',names={"dum":"Die spieghel der ewigher salicheit","en-US":"The Mirror of Eternal Blessedness","pt-BR":"O Espelho da Bem-aventurança Eterna"},
  descs={"dum":"Ruusbroecs traktaat voor een kloosterzuster over de Eucharistie en de standen van het innige leven. Middelnederlandse tekst van J. B. David (1860).","en-US":"Ruusbroec's treatise, written for a nun, on Holy Communion and the stages of the interior life. The Middle Dutch text of J. B. David (1860).","pt-BR":"Tratado de Ruusbroec, escrito para uma religiosa, sobre a Sagrada Comunhão e os graus da vida interior. Texto em neerlandês médio de J. B. David (1860)."},composed='c. 1359'),
'kerstenen':dict(key='kerstenen',slug='kerstenen-ghelove',names={"dum":"Vanden kerstenen ghelove","en-US":"The Christian Faith","pt-BR":"A Fé Cristã"},
  descs={"dum":"Ruusbroecs uitlegging van het Credo en van de christelijke leer. Middelnederlandse tekst van J. B. David (1860).","en-US":"Ruusbroec's exposition of the Creed and of Christian doctrine. The Middle Dutch text of J. B. David (1860).","pt-BR":"Exposição de Ruusbroec sobre o Credo e a doutrina cristã. Texto em neerlandês médio de J. B. David (1860)."},composed='c. 1361-1363'),
'trappen':dict(key='trappen',slug='seven-trappen',names={"dum":"Van seven trappen inden graet der gheesteliker minnen","en-US":"The Seven Steps of the Ladder of Spiritual Love","pt-BR":"Os Sete Degraus da Escada do Amor Espiritual"},
  descs={"dum":"Traktaat over zeven trappen van geestelijke liefde, geschreven voor Margriet van Meerbeke. Middelnederlandse tekst van J. B. David (1861).","en-US":"A treatise on the seven steps of spiritual love, written for Margaret of Meerbeke. The Middle Dutch text of J. B. David (1861).","pt-BR":"Tratado sobre os sete degraus do amor espiritual, escrito para Margarida de Meerbeke. Texto em neerlandês médio de J. B. David (1861)."},composed='c. 1360'),
'sloten':dict(key='sloten',slug='seven-sloten',names={"dum":"Dat boec van seven sloten","en-US":"The Book of the Seven Enclosures","pt-BR":"O Livro dos Sete Cercados"},
  descs={"dum":"Brief aan de zusters over de zeven 'sloten' van het kloosterleven. Middelnederlandse tekst van J. B. David (1861).","en-US":"A letter to the Poor Clare nuns of Brussels on the seven enclosures of the religious life. The Middle Dutch text of J. B. David (1861).","pt-BR":"Carta às Clarissas de Bruxelas sobre os sete cercados da vida religiosa. Texto em neerlandês médio de J. B. David (1861)."},composed='c. 1360'),
'rijcke':dict(key='rijcke',slug='rijcke-der-ghelieven',names={"dum":"Dat boec vanden rike der ghelieven","en-US":"The Kingdom of the Lovers of God","pt-BR":"O Reino dos Amantes de Deus"},
  descs={"dum":"Ruusbroecs eerste traktaat: de zeven gaven van de Heilige Geest en de vijf rijken Gods. Middelnederlandse tekst van J. B. David (1861).","en-US":"Ruusbroec's earliest treatise: the seven gifts of the Holy Spirit and the five kingdoms of God. The Middle Dutch text of J. B. David (1861).","pt-BR":"O primeiro tratado de Ruusbroec: os sete dons do Espírito Santo e os cinco reinos de Deus. Texto em neerlandês médio de J. B. David (1861)."},composed='c. 1330-1335'),
'becoringen':dict(key='becoringen',slug='vier-becoringhen',names={"dum":"Dat boec vanden vier becoringhen","en-US":"The Four Temptations","pt-BR":"As Quatro Tentações"},
  descs={"dum":"Korte brief over de vier bekoringen van de mens. Middelnederlandse tekst van J. B. David (1861).","en-US":"A short treatise on the four temptations of man. The Middle Dutch text of J. B. David (1861).","pt-BR":"Breve tratado sobre as quatro tentações do homem. Texto em neerlandês médio de J. B. David (1861)."},composed='c. 1350'),
'beghinen':dict(key='beghinen',slug='twaelf-beghinen',names={"dum":"Dat boec vanden twaelf beghinen","en-US":"The Book of the Twelve Béguines","pt-BR":"O Livro das Doze Beguinas"},
  descs={"dum":"Ruusbroecs laatste en omvangrijkste werk: twaalf beguinen bespreken de liefde tot Christus, met uitwijding over de hemel, de planeten, de Kerk en het lijden van Christus. Middelnederlandse tekst van J. B. David (1863); de hoofdstuktitels zijn Latijn (naar Surius).","en-US":"Ruusbroec's last and longest work: twelve béguines discuss love of Christ, with digressions on the heavens, the planets, the Church and Christ's Passion. The Middle Dutch text of J. B. David (1863); the chapter titles are Latin (after Surius).","pt-BR":"A última e mais extensa obra de Ruusbroec: doze beguinas conversam sobre o amor a Cristo, com digressões sobre os céus, os planetas, a Igreja e a Paixão. Texto em neerlandês médio de J. B. David (1863); os títulos dos capítulos são em latim (segundo Surius)."},composed='c. 1370-1381'),
}
if __name__=='__main__':
    for a in sys.argv[1:]:
        c=dict(CFG[a]); parts_titles[:]=c.pop('titles',[])
        build(c.pop('key'),c.pop('slug'),c.pop('names'),c.pop('descs'),c.pop('composed'),parts=c.pop('parts',None))
