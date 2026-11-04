import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from c_mm import *
S=build(0)
v1=S['v1']; v2=S['v2']
virgin=[x for x in v1 if 'Glories' in x[0]]
qui=[x for x in v1 if 'Psalm XC' in x[0]]
sea1=[x for x in v1 if x not in virgin and x not in qui]
def segs(lst,pre):
    return [(f'{pre}{i:02d}',t,ls) for i,(t,ls) in enumerate(items(lst),1)]
SRC1='https://archive.org/details/stbernardssermon0001prie_y4z3'
def src_(vol,url,yr,desc):
    return source(url,f"St. Bernard's Sermons for the Seasons and Principal Festivals of the Year, translated from the original Latin by a Priest of Mount Melleray, vol. {vol} (Dublin: Browne and Nolan, {yr}).",desc,yr)
DESC="Archive.org OCR cleaned by script, not proofread; the running heads are stripped by pattern and the translator's occasional footnotes are not kept. The translator (a priest of Mount Melleray, Ailbe Luddy) divides and orders the sermons by the liturgical calendar as listed here, which differs from the Latin book."
if __name__=='__main__':
    which=sys.argv[1]
    if which=='virgin':
        from en_ocr import *
        root=B+'bernard-opera-omnia/in-laudibus-virginis-matris'
        titles={}
        for i,(t,ls) in enumerate(items(virgin),1):
            cid=f'h{i:03d}'
            body=chapter_md(ls,[F()],key=cid)
            ttl=f"Homily {i}"
            write_ch(root,'en-US',cid,ttl,body); titles[cid]=ttl
        add_en_to_book(root,titles,{"translator":"A priest of Mount Melleray (Ailbe Luddy)","year":1921},
         src_(1,SRC1,1921,"The four sermons on the glories of the Virgin Mother (Bernard's four homilies In laudibus Virginis Matris, 'Missus est'). "+DESC.replace(" which differs from the Latin book","")),
         desc_suffix="The English is the version of a priest of Mount Melleray (Dublin, 1921).")
        print(words(root,'en-US'),titles)
        sys.exit(0)
    else:
        cfg={'sea1':(segs(sea1,'s'),'bernard-sermones-de-tempore-mount-melleray-1','bernard-opera-omnia/sermones-de-tempore-mount-melleray-1','sermones-de-tempore',1,1921,SRC1,
              "Seasonal Sermons I: Advent, Christmas and the Circumcision (Mount Melleray)","Sermões do tempo litúrgico I: Advento, Natal e Circuncisão (Mount Melleray)",
              "Twenty sermons of Bernard for Advent, Christmas Eve, Christmas Day and the Circumcision, in the English of a priest of Mount Melleray (Dublin, 1921), the first volume of his Sermons for the Seasons and Principal Festivals of the Year. The translator arranges and divides the sermons by the liturgical calendar, so this is a separate book of the same work as the Latin Sermones de tempore."),
         'sea2':([],'bernard-sermones-de-tempore-mount-melleray-2','bernard-opera-omnia/sermones-de-tempore-mount-melleray-2','sermones-de-tempore',2,1923,'https://archive.org/details/stbernardssermon0002prie_a0a5',
              "Seasonal Sermons II: Epiphany to the Dedication of a Church (Mount Melleray)","Sermões do tempo litúrgico II: da Epifania à Dedicação de uma igreja (Mount Melleray)",
              "Sermons of Bernard for Epiphany, Septuagesima, Lent, Palm Sunday, Easter, the Ascension, Pentecost, the Sundays after Pentecost and the Dedication of a Church, with the two sermons on St. Malachy and two epistles to Malachy, in the English of a priest of Mount Melleray (Dublin, 1923), volume two of his Sermons for the Seasons and Principal Festivals of the Year."),
         'sanct':(segs(S['v3'] and [(h,t,ls) for h,t,ls in S['v3']],'s'),'bernard-sermones-de-sanctis-mount-melleray','bernard-opera-omnia/sermones-de-sanctis-mount-melleray','sermones-de-sanctis',3,1925,'https://archive.org/details/stbernardssermon0003prie_s9b1',
              "Sermons for the Festivals of the Saints (Mount Melleray)","Sermões para as festas dos santos (Mount Melleray)",
              "Sermons of Bernard for the feasts of St. Andrew, the Conversion of St. Paul, the Purification, St. Victor, the Annunciation, SS. Peter and Paul, the Assumption, St. Michael and All Saints, in the English of a priest of Mount Melleray (Dublin, 1925), volume three of his Sermons for the Seasons and Principal Festivals of the Year."),
         'qui':(segs(qui,'s'),'bernard-in-psalmum-qui-habitat-mount-melleray','bernard-opera-omnia/in-psalmum-qui-habitat-mount-melleray','in-psalmum-qui-habitat',1,1921,SRC1,
              "Sermons on Psalm XC, Qui habitat (Mount Melleray)","Sermões sobre o Salmo 90, Qui habitat (Mount Melleray)",
              "Twelve of Bernard's sermons on Psalm 90 (Qui habitat), preached in Lent, in the English of a priest of Mount Melleray (Dublin, 1921). The translator's twelve sermons are not the seventeen of the Latin book, so this is a separate book of the same work.")}
    sg,bid,rel,wk,vol,yr,url,nm,pn,ds=cfg[which]
    if which=='sea2': sg=segs([(h,t,ls) for h,t,ls in v2],'s')
    latin={'sea1':'sermones-de-tempore','sea2':'sermones-de-tempore','sanct':'sermones-de-sanctis','qui':'in-psalmum-qui-habitat'}[which]
    make_book(B+rel,bid,'bernard/'+wk,nm,B+'bernard-opera-omnia/'+latin+'/book.json',ds,'c. 1135-1153',{"translator":"A priest of Mount Melleray (Ailbe Luddy)","year":yr},
      src_(vol,url,yr,DESC),sg,drops=[F()],post=lambda c,b:b.replace('To-pay','To-day'),pt_name=pn,pt_desc='Sermões de São Bernardo na tradução inglesa de um sacerdote de Mount Melleray (Dublin).')
