"""Anselm's Orationes and Meditationes as in Migne PL 158 (CC works 5593 and 5589)."""
import re, json, shutil, sys
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
from bernard_common import cc_sections
from anselm_build import write, AUTHOR, ROOT, CC
from bernard_more import clean
from letters_build import rnum
SMALL = set('ad et de per in cum pro ex omnes sive seu a'.split())

def pieces(path, kind, pre):
    out = []; cur = None
    for s in cc_sections(path):
        h, paras = s['head'], list(s['paras'])
        m = re.match(r'^%s\s+([IVXLC]+|PRIMA)\b\.?\s*(?:\*?\[[^\]]*\]\.?\*?)?\s*\.?\s*(.*)$' % kind, h)
        if m:
            rest = m.group(2)
            summ = re.findall(r'\*([^*]{6,})\*', rest)
            target = clean(re.sub(r'\*[^*]*\*', '', rest)).rstrip('.( ')
            target = ' '.join(w if (w in SMALL and i) else w[:1].upper() + w[1:] for i, w in enumerate(target.lower().split())) if target.isupper() else target
            n = rnum(m.group(1))
            if '%s%02d' % (pre, n) in [o[0] for o in out]: n += 1  # Migne repeats LXII and skips LXIII
            title = 'Oratio' if pre == 'o' else 'Meditatio'
            t = '%s %s' % (title, 'I' if m.group(1) == 'PRIMA' else (m.group(1) if n == rnum(m.group(1)) else __import__('letters_build').roman(n)))
            if target: t += '. ' + target
            elif summ: t += '. ' + clean(summ[0])
            body = (['*%s*' % clean(summ[0]) + '.'] if summ and target else []) 
            cur = ('%s%02d' % (pre, n), t, body + paras); out.append(cur); continue
        if cur is None:
            if paras: cur = ('prologus', 'Prologus', paras); out.append(cur)
            continue
        if h and not re.match(r'^[IVXLC\d]+\.?$', h): cur[2].append('*%s*' % clean(h))
        cur[2].extend(paras)
    return out

def main():
    slug = 'orationes-et-meditationes'; d = ROOT / slug
    if d.exists(): shutil.rmtree(d)
    toc = []
    for name, f, kind, pre, gt in [('orationes', 'w5593.xml', 'ORATIO', 'o', 'Orationes'), ('meditationes', 'w5589.xml', 'MEDITATIO', 'm', 'Meditationes')]:
        grp = {'id': name, 'title': {'la': gt}, 'children': []}; toc.append(grp)
        for cid, t, ps in pieces(CC / f, kind, pre):
            write(d / 'la' / (cid + '.md'), '# %s\n\n%s\n' % (t, '\n\n'.join(p.replace('--', '—') for p in ps)))
            grp['children'].append({'id': cid, 'title': {'la': t}})
        write(d / 'sources/latin-originals' / (name + '.xml'), (CC / f).read_text(encoding='utf-8'))
        print(name, len(grp['children']))
    meta = {'id': 'anselm-' + slug, 'cover': 'classic',
      'name': {'la': 'Orationes sive meditationes', 'en-US': 'Prayers and Meditations', 'pt-BR': 'Orações e meditações'},
      'author': AUTHOR,
      'description': {'la': 'Orationes et meditationes quae sub nomine Anselmi circumferuntur, ordine editionis Gerberonis et Migne: L et ultra orationes, XXI meditationes. Textus ex Patrologia Latina 158 (1853); quaedam genuina, plurima alienis auctoribus adscribenda.',
                      'en-US': 'The prayers and meditations that circulate under Anselm’s name, in the order of the Gerberon–Migne edition (Patrologia Latina 158, 1853): the prayers to God, to Christ, to the Cross and to Our Lady and the saints, and the twenty-one meditations. Only a core of them, nineteen prayers and three meditations, is Anselm’s own by the verdict of the critical edition; the rest come from John of Fécamp, Ekbert of Schönau and other writers. Latin only, from a machine-corrected OCR.',
                      'pt-BR': 'As orações e meditações que correm sob o nome de Anselmo, na ordem da edição de Gerberon e Migne: orações a Deus, a Cristo, à Cruz, a Nossa Senhora e aos santos, e as vinte e uma meditações. Só uma parte (dezenove orações e três meditações) é de Anselmo, segundo a edição crítica.'},
      'composed': 'c. 1070-1109', 'languages': ['la'], 'work': 'anselm/orationes-et-meditationes',
      'editions': {'la': {'editor': 'J.-P. Migne (Patrologia Latina 158)', 'year': 1853}},
      'sources': [{'language': 'la', 'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=10630',
         'edition': 'S. Anselmi Cantuariensis archiepiscopi opera omnia, ed. J.-P. Migne, Patrologia Latina 158 (Paris 1853), Orationes (CC text 10630) and Meditationes et orationes (CC text 10626); TEI XML of the Corpus Corporum (University of Zurich), from the Open Greek and Latin machine-corrected OCR.',
         'description': 'Every prayer and meditation as Migne prints them, with Gerberon’s summaries (in italics). The Migne order and numbers are kept; the prayers that are not Anselm’s own are not marked. PL page breaks, columns and variant notes are dropped.',
         'tier': 'A', 'tierEvidence': 'Anselm died in 1109; Migne’s 1853 printing is public domain everywhere.'}],
      'toc': toc}
    write(d / 'book.json', json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
main()
