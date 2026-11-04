import sys, os, re, html
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import *
B = ROOT + 'content/books/marmion-opera-omnia/sponsa-verbi/'
raw = open('/tmp/mc_dl/Sponsa_Verbi_Marmion_.htm.out', encoding='cp1252', errors='replace').read()
T = [('editors-preface', 'Editor’s Preface'), ('1-call', 'I. The Call to the Dignity of a Spouse of Christ'),
 ('2-human-nature', 'II. The Human Nature in Christ, the Spouse of the Word'), ('3-relictis-omnibus', 'III. Relictis omnibus'),
 ('4-votis-omnibus', 'IV. Votis omnibus Verbo adhaerere'), ('5-verbo-vivere', 'V. Verbo vivere, Verbo se regere'),
 ('6-means-of-union', 'VI. Means of Union with the Spouse'), ('7-fecundity', 'VII. The Admirable Fecundity of a Spouse of the Word')]
def text(frag):
    frag = re.sub(r'<a href="#[^"]*">(\d+)</a>', r'{{\1}}', frag)
    frag = re.sub(r'<br\s*/?>', ' ', frag)
    frag = re.sub(r'<sup[^>]*>(.*?)</sup>', r'^\1^', frag, flags=re.S)
    frag = re.sub(r'<[^>]+>', '', frag)
    return re.sub(r'\s+', ' ', html.unescape(frag).replace('\xa0', ' ')).strip()
if __name__ == '__main__':
    hs = [m for m in re.finditer(r'<h3[^>]*>', raw)]
    parts = []
    for i, m in enumerate(hs):
        end = hs[i+1].start() if i + 1 < len(hs) else raw.index('<h5', m.start())
        seg = raw[m.end():end]
        seg = seg[seg.index('</h3>') + 5:]
        ps = [text(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', seg, re.S)]
        ps = [p for p in ps if p]
        notes = {}
        for bi, p in enumerate(ps):
            if re.match(r'1\. ?[A-Z]', p) and ' 2. ' in p and '{{' not in p:
                pos, n, cur = [(0, 1)], 1, 0
                while True:
                    m = re.compile(r'(?<=[\s.])%d\. ' % (n + 1)).search(p, cur + 3)
                    if not m: break
                    n += 1; pos.append((m.start(), n)); cur = m.start()
                for q, (st, num) in enumerate(pos):
                    en = pos[q+1][0] if q + 1 < len(pos) else len(p)
                    notes[num] = re.sub(r'^\d+\. ?', '', p[st:en]).strip()
                ps = ps[:bi] + ps[bi+1:]
                break
        ps = [re.sub(r'\{\{(\d+)\}\}', lambda m: f'[^{m.group(1)}]', p) for p in ps]
        parts.append((ps, notes))
    assert len(parts) == len(T), len(parts)
    os.makedirs(B + 'en-US', exist_ok=True)
    for (cid, title), (ps, notes) in zip(T, parts):
        open(B + f'en-US/{cid}.md', 'w').write(render(title, ps, notes))
    os.makedirs(B + 'sources/english-originals', exist_ok=True)
    open(B + 'sources/english-originals/sponsa-verbi.txt', 'w').write('\n\n'.join(p for ps, _ in parts for p in ps) + '\n')
    make_book(B, 'marmion-sponsa-verbi', 'marmion/sponsa-verbi',
     {'en-US': 'Sponsa Verbi: The Virgin Consecrated to Christ', 'pt-BR': 'Sponsa Verbi: a virgem consagrada a Cristo'},
     {'en-US': 'Bl. Columba Marmion', 'pt-BR': 'Bem-aventurado Columba Marmion'},
     {'en-US': 'Seven spiritual conferences to consecrated virgins: the call to be a spouse of Christ, the human nature in Christ, leaving all, the vows, living by the Word, the means of union and the fecundity of the spouse of the Word. Published in 1923 (Maredsous, Collection Pax 13), edited by Dom Thibaut. English only: no open French text exists.',
      'pt-BR': 'Sete conferências espirituais às virgens consagradas: o chamado a ser esposa de Cristo, a natureza humana em Cristo, deixar tudo, os votos, viver pelo Verbo, os meios de união e a fecundidade da esposa do Verbo. Publicado em 1923 (Maredsous, Coleção Pax 13), editado por Dom Thibaut.'},
     '1923', ['en-US'], {'en-US': {'translator': 'Dom Francis Izard, O.S.B.', 'year': 1925}},
     [{'language': 'en-US', 'url': 'https://piercedhearts.org/consecrated_hearts/Sponsa_Verbi_Marmion_.htm', 'edition': 'Sponsa Verbi: the Virgin Consecrated to Christ, spiritual conferences, translated from the French by Dom Francis Izard O.S.B., London: Sands, 1925 (imprimatur 5 Jan 1925). HTML transcription by the Servants of the Pierced Hearts of Jesus and Mary.', 'description': 'Editor’s preface and the seven conferences with their footnotes (scripture references and the editor’s notes). The French original has no open text.', 'tier': 'A', 'tierEvidence': 'Translation published 1925: public domain in the US (before 1931); Marmion died 1923. The transcription carries no copyright notice.'}],
     [(c, {'en-US': t}) for c, t in T])
