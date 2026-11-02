"""Build the Greek/Latin 'originals' book of one of the first seven councils.
Greek: Pedalion canon text (el.wikisource); Latin: la.wikisource (COD's ancient Latin versions).
usage: councils_originals.py <slug>"""
import json, re, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import councils_build as cb

RAW = cb.RAW / 'dl2'
S = {
 'nicaea-i': dict(el='el-nicaea-i', la='la-nicaea-i', wla='Concilium_Nicaenum_I', wel='Κανόνες_Α΄_Οικουμενικής_Συνόδου', en='Nicaea I (325)', pt='Niceia I (325)', lat='Concilium Nicaenum I (325)', grc='Α΄ Οικουμενική Σύνοδος (Νίκαια, 325)', year='325', n=20),
 'constantinople-i': dict(el='el-constantinople-i', la='la-constantinople-i', wla='Concilium_Contantinopolitanum_I', wel='Κανόνες_Β΄_Οικουμενικής_Συνόδου', en='Constantinople I (381)', pt='Constantinopla I (381)', lat='Concilium Constantinopolitanum I (381)', grc='Β΄ Οικουμενική Σύνοδος (Κωνσταντινούπολη, 381)', year='381'),
 'ephesus': dict(el='el-ephesus', la='la-ephesus', wla='Concilium_Ephesinum', wel='Κανόνες_Γ΄_Οικουμενικής_Συνόδου', en='Ephesus (431)', pt='Éfeso (431)', lat='Concilium Ephesinum (431)', grc='Γ΄ Οικουμενική Σύνοδος (Έφεσος, 431)', year='431'),
 'chalcedon': dict(el='el-chalcedon', la='la-chalcedon', wla='Concilium_Chalcedonense', wel='Κανόνες_Δ΄_Οικουμενικής_Συνόδου', en='Chalcedon (451)', pt='Calcedônia (451)', lat='Concilium Chalcedonense (451)', grc='Δ΄ Οικουμενική Σύνοδος (Χαλκηδών, 451)', year='451'),
 'constantinople-ii': dict(el=None, la='la-constantinople-ii', wla='Concilium_Contantinopolitanum_II', en='Constantinople II (553)', pt='Constantinopla II (553)', lat='Concilium Constantinopolitanum II (553)', year='553'),
 'constantinople-iii': dict(el=None, la='la-constantinople-iii', wla='Concilium_Constantinopolitanum_III', en='Constantinople III (680–681)', pt='Constantinopla III (680–681)', lat='Concilium Constantinopolitanum III (680–681)', year='680–681'),
 'nicaea-ii': dict(el='el-nicaea-ii', la='la-nicaea-ii', wla='Concilium_Nicaenum_II', wel='Κανόνες_Ζ΄_Οικουμενικής_Συνόδου', en='Nicaea II (787)', pt='Niceia II (787)', lat='Concilium Nicaenum II (787)', grc='Ζ΄ Οικουμενική Σύνοδος (Νίκαια, 787)', year='787'),
}

def greek(f):
    t = (RAW / f'{f}.wiki').read_text()
    t = t[t.index('==Κανὼν'):]
    t = re.sub(r'\[\[Κατηγορία[^\]]*\]\]', '', t)
    t = re.sub(r'<br ?/?>', '', t)
    blocks = re.split(r'^==(.*?)==\s*$', t, flags=re.M)
    out = []
    for h, body in zip(blocks[1::2], blocks[2::2]):
        body = re.split(r'^\s*Ἑ ?ρ ?μ ?η ?ν ?ε ?ί ?α', body, flags=re.M)[0]
        paras = [re.sub(r'\s+', ' ', x).strip() for x in body.split('\n')]
        paras = [x for x in paras if x and not re.fullmatch(r"Κανὼν \S+", x)]
        out.append('## ' + h.replace("'", '΄').strip() + '\n\n' + '\n\n'.join(paras))
    return '\n\n'.join(out) + '\n'

def main(slug):
    s = S[slug]
    d = cb.OUT / f'{slug}-originals'
    langs, srcs, editions, tocl = [], [], {}, {}
    (d / 'sources').mkdir(parents=True, exist_ok=True)
    nw = {}
    if s['el']:
        g = greek(s['el'])
        (d / 'grc').mkdir(exist_ok=True)
        (d / 'grc/ch001.md').write_text(f"# {s['grc']}\n\n" + g)
        (d / 'sources/grc-originals').mkdir(exist_ok=True)
        (d / f'sources/grc-originals/{slug}.txt').write_text(g)
        langs.append('grc'); tocl['grc'] = s['grc']; nw['grc'] = len(g.split())
        editions['grc'] = {'editor': 'Nicodemus the Hagiorite and Agapius, Pedalion (Leipzig 1800), via Greek Wikisource', 'year': 1800}
        srcs.append({'language': 'grc', 'url': 'https://el.wikisource.org/wiki/' + s['wel'], 'edition': 'Greek Wikisource, ' + s['wel'].replace('_', ' ') + ', the canon text of the Pedalion (Nicodemus the Hagiorite and Agapius, 1800). Wikitext fetched through action=raw.',
          'description': 'The canons only. Nicodemus\'s prolegomena and his commentary (Ἑρμηνεία) are not included; the creed, definition and letters of the council are not in this source.',
          'tier': 'A', 'tierEvidence': 'Canons of the fourth to eighth centuries; Pedalion printed 1800.'})
    l = cb.latin(s['la'])
    (d / 'la').mkdir(exist_ok=True)
    (d / 'la/ch001.md').write_text(f"# {s['lat']}\n\n" + l)
    (d / 'sources/latin-originals').mkdir(exist_ok=True)
    (d / f'sources/latin-originals/{slug}.txt').write_text(l)
    langs.append('la'); tocl['la'] = s['lat']; nw['la'] = len(l.split())
    editions['la'] = {'editor': 'Conciliorum Oecumenicorum Decreta (Bologna 1962), ancient Latin versions, via Latin Wikisource / Documenta Catholica Omnia', 'year': 1962}
    srcs.append({'language': 'la', 'url': cb.UA + s['wla'], 'edition': 'Latin Wikisource, ' + s['wla'].replace('_', ' ') + ', the text of Conciliorum Oecumenicorum Decreta (Bologna 1962) as circulated by Documenta Catholica Omnia (the ancient Latin versions of the Greek acts). Wikitext fetched through action=raw.',
      'description': 'As transcribed. The digitisation has its punctuation largely stripped, no capitals at the start of sentences and lowercase deus/dominus; line breaks kept as paragraph breaks, split enclitics rejoined, and the digitisation\'s citation lines (pag./linea) removed.' + ('' if s['el'] else ' The Greek of this council survives only in part and is not imported.'),
      'tier': 'B', 'tierEvidence': 'Ancient texts; the digitisation derives from the Library of Latin Texts / COD text (a critical edition of 1962/1973), which carries at most a neighbouring right that has run out and is freely redistributed by Wikisource and Documenta Catholica Omnia.'})
    title = {'en-US': s['en'] + ': original texts' , 'pt-BR': s['pt'] + ': textos originais'}
    gl = 'canons in Greek (from the Pedalion) and ' if s['el'] else ''
    book = {'id': f'councils-{slug}-originals', 'cover': 'quarter',
      'name': {**({'grc': s['grc']} if s['el'] else {}), 'la': s['lat'], **title},
      'author': {'grc': 'Σύνοδοι', 'la': 'Concilia', 'en-US': 'Councils', 'pt-BR': 'Concílios'} if s['el'] else {'la': 'Concilia', 'en-US': 'Councils', 'pt-BR': 'Concílios'},
      'description': {'en-US': f"The original texts of {s['en']}: the {gl}the ancient Latin version of its decrees. The English translation of Percival (NPNF, 1900) is the book Councils: {s['en']}.",
                      'pt-BR': f"Os textos originais de {s['pt']}: {'os cânones em grego (do Pedálion) e ' if s['el'] else ''}a antiga versão latina de seus decretos."},
      'composed': s['year'], 'languages': langs, 'work': f'councils/{slug}', 'editions': editions, 'sources': srcs,
      'toc': [{'id': 'ch001', 'title': tocl}]}
    book['description']['grc'] = None
    del book['description']['grc']
    (d / 'book.json').write_text(json.dumps(book, ensure_ascii=False, indent=2) + '\n')
    print(slug, nw)

if __name__ == '__main__':
    main(sys.argv[1])
