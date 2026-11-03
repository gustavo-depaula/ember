import gue_dg as g, gue_build as b
p=g.find('Mémoire sur la question')[0]
o,n=g.parse(p)
cuts=[('preface','Préface',36,40),('notions-preliminaires','Notions préliminaires',45,60)]
secs=[(60,'1'),(72,'2'),(82,'3'),(135,'4'),(177,'5'),(185,'6'),(284,'7'),(320,'8'),(329,'9')]
secs=[(a, secs[i+1][0] if i+1<len(secs) else len(o), k) for i,(a,k) in enumerate(secs)]
ch={}; toc=[]
for cid,t,a,e in cuts:
    ch[cid]=b.chapter_md(t,o[a:e],n); toc.append((cid,t))
import re
for a,e,k in secs:
    t=re.sub(r'^\d+ ?[–-] ','',o[a][1]).rstrip('.')
    t='§ %s. %s'%(k,t)
    cid='%02d'%int(k)
    ch[cid]=b.chapter_md(t,o[a+1:e],n); toc.append((cid,t))
raw='\n\n'.join(t for _,t in o[35:])
d=b.book('gueranger-immaculee-conception','immaculee-conception',
 {'fr-FR':'Mémoire sur la question de l’Immaculée Conception de la très sainte Vierge','en-US':'Memoir on the Question of the Immaculate Conception of the Most Holy Virgin','pt-BR':'Memória sobre a questão da Imaculada Conceição da Santíssima Virgem'},
 {'fr-FR':'Écrit en 1850, quatre ans avant la définition d’Ineffabilis Deus : après des notions préliminaires sur la foi et l’Église, Dom Guéranger établit en neuf points que l’Église a toléré, favorisé puis professé la doctrine de l’Immaculée Conception, en indique les sources, et traite des motifs, de l’autorité et de la forme d’une définition solennelle. Édition de Paris, Julien, Lanier et Cie, 1850 ; l’avant-propos de la réédition de Solesmes (2004) n’est pas repris.',
  'en-US':'Written in 1850, four years before the definition of Ineffabilis Deus: after preliminary notions on faith and the Church, Dom Guéranger shows in nine points that the Church tolerated, favoured and then professed the doctrine of the Immaculate Conception, indicates its sources, and treats the motives, authority and form of a solemn definition. Paris, Julien, Lanier et Cie, 1850; the foreword of the 2004 Solesmes reprint is not included.',
  'pt-BR':'Escrita em 1850, quatro anos antes da definição de Ineffabilis Deus: após noções preliminares sobre a fé e a Igreja, Dom Guéranger mostra em nove pontos que a Igreja tolerou, favoreceu e depois professou a doutrina da Imaculada Conceição, indica-lhe as fontes e trata dos motivos, da autoridade e da forma de uma definição solene. Paris, Julien, Lanier et Cie, 1850; o prefácio da reedição de Solesmes (2004) não foi incluído.'},
 '1850',['fr-FR'],{'fr-FR':{'editor':'Julien, Lanier et Cie','year':1850}},
 [b.src('fr-FR',b.DG+'?p=2609','Mémoire sur la question de l’Immaculée Conception de la très sainte Vierge, Paris, Julien, Lanier et Cie / J. Lecoffre, 1850 (text of the domgueranger.net transcription)','HTML transcription with the 1850 notes; the modern foreword of the Solesmes 2004 reprint is left out. Checked in size against archive.org bub_gb_XeHLuSYnFqUC.')],
 b.toc_of(toc))
b.write_book('immaculee-conception',d,{'fr-FR':ch},{'memoire-immaculee-conception':('french',raw)})
