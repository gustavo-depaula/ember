"""Itinerarium mentis in Deum: Latin (thelatinlibrary) + Boehner 1956 English.
usage: python3 -I bonaventure_itin.py"""
import re, sys
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *

def latin():
    t = html_text('research/sourcing/bonaventure/la/latinlibrary-itinerarium.html')
    L = [l.strip() for l in t.split('\n') if l.strip()]
    chs = []; cur = None; wait = False
    for l in L:
        if l.startswith('Christian Latin'): break
        if re.match(r'(EXPLICIT|INCIPIT)', l): continue
        if l.startswith('PROLOGUS IN'):
            cur = ['prologus', 'Prologus', []]; chs.append(cur); continue
        if cur is None: continue
        if re.match(r'CAPUT (\w+)$', l):
            n = len(chs); cur = ['c%02d' % n, 'Caput %s' % roman(n), []]; chs.append(cur); wait = True; continue
        if wait and re.fullmatch(r"[A-Z ,.']+", l):
            cur[1] += '. ' + l.capitalize(); wait = False; continue
        cur[2].append(l)
    return [tuple(c) for c in chs]

def english():
    L = open('research/sourcing/bonaventure/en/worksofsaintbona02bona.txt', errors='replace').read().split('\n')
    ps = numbered_en(L[1284:4860])
    chs = []; prev = 0
    for n, t in ps:
        if n == 1 or (n <= prev and n < 3): chs.append([]); 
        chs[-1].append((n, t)); prev = n
    return chs

def tidy(t):
    t = re.sub(r'(\s+[A-Z][A-Z ,;\'’-]{12,})+\s*$', '', t)   # next chapter's heading
    t = re.sub(r'[®§]', '', t)
    t = re.sub(r' The Steps in the Ascent to God and the Consideration of Him through His .*$', '', t).replace('[have thought', 'I have thought')
    t = re.sub(r'(?<=[A-Za-z,.;:”’])[!](?=\s|$)', '', t)
    return re.sub(r'\s+', ' ', t).strip()

def split_inline(paras):
    out = []; exp = 1
    for p in paras:
        m = re.match(r'(\d+)\. ', p)
        if m: exp = int(m.group(1))
        # an inline "N. " where N is the next number: two paragraphs on one line
        while True:
            k = re.search(r'(?<=[.;:?!)"]) (%d)\. (?=[A-Z"])' % (exp + 1), p) if m or out else None
            if not k: break
            out.append(p[:k.start()]); p = p[k.start()+1:]; exp += 1
        out.append(p)
        if re.match(r'\d+\. ', p): exp = int(re.match(r'(\d+)\.', p).group(1))
    return out

def strip_num(p): return re.sub(r'^\d+\. ', '', p)

def main():
    la = latin(); en = english()
    TITLES_EN = ['Prologue', 'Chapter I. The steps in the ascent to God, and the consideration of Him through His footprints in the universe',
      'Chapter II. The consideration of God in His footprints in this visible world',
      'Chapter III. The consideration of God through His image imprinted on our natural powers',
      'Chapter IV. The consideration of God in His image reformed through the gifts of grace',
      'Chapter V. The consideration of the divine unity through its primary name, which is Being',
      'Chapter VI. The consideration of the most blessed Trinity in its name, which is the Good',
      'Chapter VII. The mystical transport of the mind, in which rest is given to our understanding and our affection passes over entirely to God']
    files = {'la': {}, 'en-US': {}}; toc = []
    for i, (cid, title, paras) in enumerate(la):
        paras = split_inline(paras)
        files['la'][cid] = '# %s\n\n' % title + '\n\n'.join(paras)
        e = [(n, tidy(t)) for n, t in en[i]]; assert len(e) >= 5
        files['en-US'][cid] = '# %s\n\n' % TITLES_EN[i] + '\n\n'.join('%d. %s' % (n, t) for n, t in e)
        toc.append((cid, {'la': title, 'en-US': TITLES_EN[i]}))
    return files, toc


if __name__ == '__main__':
    files, toc = main()
    names = {'la': 'Itinerarium mentis in Deum', 'en-US': 'The Soul’s Journey into God', 'pt-BR': 'Itinerário da mente para Deus'}
    descr = {
        'la': 'Speculatio pauperis in deserto: in monte Alvernae anno 1259 scripta, de sex gradibus ascensionis in Deum per vestigia, imaginem et nomina divina, usque ad excessum mysticum in Christo crucifixo. Textus ex editione Quaracchi, ut in Bibliotheca Latina.',
        'en-US': 'The “Speculation of the Poor Man in the Desert”, written on La Verna in 1259: six steps of the mind’s ascent to God through his footprints in the world, his image in the soul and his divine names, and the seventh, the mystical passing over in the crucified Christ. The Latin is the Quaracchi text as on The Latin Library; the English is Philotheus Boehner’s 1956 translation from the facing-page edition of the Franciscan Institute, without his introduction and commentary.',
        'pt-BR': 'A «especulação do pobre no deserto», escrita no Alverne em 1259: seis degraus da ascensão da mente a Deus pelos seus vestígios, pela sua imagem na alma e pelos seus nomes divinos, e o sétimo, a passagem mística em Cristo crucificado.'}
    s = [src('la', 'https://www.thelatinlibrary.com/bonaventura.itinerarium.html', 'Itinerarium mentis in Deum, Quaracchi text (Opera omnia V, 1891), as transcribed on The Latin Library.', 'Prologue and seven chapters; the transcription’s paragraph numbers are kept as in the source where a paragraph is numbered, and the sub-items of chapter I, 14 stay separate paragraphs.', 'A', 'Bonaventure died in 1274; the Quaracchi text of 1891 is public domain.'),
         src('en-US', 'https://archive.org/details/worksofsaintbona02bona', 'Saint Bonaventure’s Itinerarium Mentis in Deum, with an introduction, translation and commentary by Philotheus Boehner, O.F.M. (Works of St. Bonaventure II; St. Bonaventure, N.Y.: Franciscan Institute, 1956).', 'Only the English of the facing-page text is imported (prologue, seven chapters); Boehner’s introduction, notes and commentary and his Latin are left out. The OCR keeps stray footnote-marker characters after some words.', 'B', 'Archive.org records “Copyright review: Public domain according to HathiTrust rights database” (not renewed).')]
    emit('itinerarium', 'bonaventure-itinerarium', names, descr, '1259', 'bonaventure/itinerarium-mentis-in-deum', ['la', 'en-US'],
         {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi), via The Latin Library', 'year': 1891}, 'en-US': {'translator': 'Philotheus Boehner', 'year': 1956}}, s, toc, files)
