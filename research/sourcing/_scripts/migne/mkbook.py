import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from core import ROOT

def toc_from(d, lang='fr-FR', order=None):
    files = sorted((d / lang).glob('*.md'), key=lambda p: (next((i for i, o in enumerate(order or []) if p.stem.startswith(o)), -1 if p.stem == 'avant-propos' else 99), p.stem))
    toc = []
    for p in files:
        h1 = p.read_text(encoding='utf-8').split('\n', 1)[0][2:].strip()
        toc.append({'id': p.stem, 'title': {lang: h1}})
    return toc

def words(d, lang):
    return sum(len(p.read_text(encoding='utf-8').split()) for p in (d / lang).glob('*.md'))

def make(bdir, bid, work, name, author, desc, composed, edition, sources, langs=('fr-FR',), cover='quarter', order=None, extra_toc=None, toc=None):
    d = Path(bdir)
    meta = {'id': bid, 'cover': cover, 'name': name, 'author': author, 'description': desc, 'composed': composed,
            'languages': list(langs), 'work': work, 'editions': edition, 'sources': sources,
            'toc': toc if toc is not None else toc_from(d, langs[0], order)}
    (d / 'book.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return {l: words(d, l) for l in langs}

BERULLE_AUTHOR = {'fr-FR': 'Cardinal Pierre de Bérulle', 'en-US': 'Cardinal Pierre de Bérulle', 'pt-BR': 'Cardeal Pierre de Bérulle'}
OLIER_AUTHOR = {'fr-FR': 'Jean-Jacques Olier', 'en-US': 'Jean-Jacques Olier', 'pt-BR': 'Jean-Jacques Olier'}
