import re, difflib
from rhb_gen_ia import cfg
L = open('../robert-hugh-benson/ia/papersofpariah00bens_djvu.txt', errors='ignore').read().split('\n')
tit = ['At a Requiem', 'On the Dulness of Irreligious People', 'Intellectual Slavery', 'A Father in God', 'The Sense of the Supernatural', 'The Mystical Sense', 'Holy Week',
       'On the Dance as a Religious Exercise', 'Religious Persecution', 'Science and Faith', 'Low Mass', 'Benediction', 'The Personality of the Church', 'Death']
n = lambda s: re.sub('[^a-z]', '', s.lower())
man = []; pos = 330
for t in tit:
    best = None
    for i in range(pos, len(L)):
        s = L[i].strip()
        if s and len(s.split()) <= 10 and s.upper() == s and difflib.SequenceMatcher(None, n(s), n(t)).ratio() > 0.85:
            best = i; break
    print(t, best)
    if best is None: continue
    man.append([best + 1, t]); pos = best + 1
man += [[689, 'On the Dulness of Irreligious People'], [1810, 'The Sense of the Supernatural'], [3404, 'On the Dance as a Religious Exercise']]
man.sort()
end = next(i for i,l in enumerate(L) if l.strip()=='THE END') + 1
end0 = next(i for i in range(len(L) - 1, 0, -1) if L[i].strip() and not re.fullmatch(r'[\W\d]*', L[i])) 
cfg('papers-of-a-pariah', 'Papers of a Pariah', 'Papéis de um Pária',
 "Benson's essays of 1907, written after his conversion, on religion as seen by a convert and a priest: At a Requiem, intellectual slavery, the sense of the supernatural, Holy Week, the dance as a religious exercise, Low Mass, Benediction, the personality of the Church and death.",
 "Os ensaios de Benson (1907), escritos depois da sua conversão, sobre a religião vista por um convertido e padre: Num Réquiem, a escravidão intelectual, o sentido do sobrenatural, a Semana Santa, a dança como exercício religioso, a Missa rezada, a Bênção, a personalidade da Igreja e a morte.",
 1907, ('London: Smith, Elder, 1907', 1907), 'papersofpariah00bens', man, man[0][0] - 1, end, died=1914)
