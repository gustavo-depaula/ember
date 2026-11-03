import re, gue_dg as g, gue_build as b, gue_en as en
# ---------- French
o, n = g.parse(g.find('La médaille de Saint Benoît')[0])
ROM = lambda s: s
heads = []
for i, (k, t) in enumerate(o):
    m = re.match(r'^(?:§ )?([IVX]+)\. (.+)$', t)
    if m and len(t) > 25 and sum(c.isupper() for c in t) / max(1, sum(c.isalpha() for c in t)) > 0.85 and not t.startswith('V. R.'):
        heads.append((i, m.group(1), m.group(2)))
assert [h[1] for h in heads] == ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII'], [h[1] for h in heads]
def sentence(t):
    t = t.rstrip('.').lower()
    t = t[:1].upper() + t[1:]
    t = re.sub(r'\bbenoit\b', 'Benoît', t); t = re.sub(r'\bbenoît\b', 'Benoît', t)
    t = re.sub(r'\b(xiv|xix|xvii|xviie|xixe|xviie)\b', lambda m: m.group(1).upper().replace('E', 'e') if m.group(1)[-1] != 'e' or True else '', t)
    t = t.replace('xix° siècle', 'XIXe siècle').replace('XIX° siècle', 'XIXe siècle').replace('Xixe', 'XIXe').replace('xviie', 'XVIIe')
    t = t.replace('Graces', 'Grâces'); t = re.sub(r' a (l’|la )', r' à \1', t)
    t = t.replace('siège apostolique', 'Siège apostolique').replace('dieu', 'Dieu').replace('Xvii', 'XVII')
    return t
fr = {}; toc = []
fr['preface'] = b.chapter_md('Préface', o[1:7], n); toc.append(('preface', 'Préface'))
fro = {}
for k, (i, r, t) in enumerate(heads):
    end = heads[k + 1][0] if k + 1 < len(heads) else len(o)
    title = '§ %s. %s' % (r, sentence(t))
    cid = '%02d' % (k + 1)
    body = o[i + 1:end]
    if k == 0: body = o[8:i - 0][:0] + o[i + 1:end]
    if k == 0: body = o[8:9] + body  # opening paragraph of the Essai precedes § I? keep
    fr[cid] = b.chapter_md(title, body, n); toc.append((cid, title))
d = b.book('gueranger-medaille-saint-benoit', 'medaille-saint-benoit',
 {'fr-FR': 'Essai sur l’origine, la signification et les privilèges de la médaille ou croix de saint Benoît', 'en-US': 'Essay on the Origin, Meaning and Privileges of the Medal or Cross of St. Benedict', 'pt-BR': 'Ensaio sobre a origem, o significado e os privilégios da medalha ou cruz de São Bento'},
 {'fr-FR': 'Le petit livre de Dom Guéranger sur la médaille de saint Benoît (1862) : l’image de la croix et celle du saint, les lettres de la médaille, son origine, son usage, ses effets (XVIIe et XIXe siècles), l’approbation de Benoît XIV, les indulgences, le rite de bénédiction et la dévotion à saint Benoît.',
  'en-US': 'Dom Guéranger’s little book on the medal of St. Benedict (1862): the image of the cross and of the saint, the letters on the medal, its origin, use and effects (17th and 19th centuries), the approval of Benedict XIV, the indulgences, the rite of blessing, and devotion to St. Benedict.',
  'pt-BR': 'O pequeno livro de Dom Guéranger sobre a medalha de São Bento (1862): a imagem da cruz e a do santo, as letras da medalha, sua origem, uso e efeitos (séculos XVII e XIX), a aprovação de Bento XIV, as indulgências, o rito de bênção e a devoção a São Bento.'},
 '1862', ['fr-FR'], {'fr-FR': {'editor': 'Oudin (Poitiers / Paris)', 'year': 1862}},
 [b.src('fr-FR', b.DG + 'la-medaille-de-saint-benoit/', 'Essai sur l’origine, la signification et les privilèges de la médaille ou croix de saint Benoît, Paris-Poitiers, Oudin, 1862 (domgueranger.net HTML transcription)', 'Checked in size against archive.org essaisurlorigine00gu (Oudin 1887).')],
 b.toc_of(toc))
b.write_book('medaille-saint-benoit', d, {'fr-FR': fr}, {'medaille-saint-benoit': ('french', '\n\n'.join(t for _, t in o))})
# ---------- English (separate book, translator's own structure)
lines = open(b.ROOT + 'research/sourcing/gueranger/ia/x-TheMedalOrCrossOfStBenedict.txt').read().replace('\x0c', '').split('\n')
DROP = [r'Digitized by', r'(?i)^(?:[xvil]+ |\d+ )?(?:author.s preface|introduction|the medal of st\. benedict|appendix)\.?(?: [xvil\d]+)?$', r'^\( ?[»\d]+ ?\)$']
ch = {}
body = [(i, l.strip()) for i, l in enumerate(lines)]
cpos = {}
for i, l in body:
    m = re.fullmatch(r'CHAPTER ([IVXL]+)\.', l)
    if m and i > 900: cpos[m.group(1)] = i
intro = 458; pref = 798
ch1 = next(i for i in range(pref + 40, cpos['II']) if re.search(r'A Christian needs but reflect', lines[i]))
app = next(i for i in range(cpos['XV'], len(lines)) if lines[i].strip() == 'APPENDIX.')
order = [('introduction', 'Introduction', intro + 1, pref), ('author-preface', 'Author’s preface', pref + 1, ch1 - 1)]
rom = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV']
starts = [ch1 - 1] + [cpos[r] for r in rom[1:]]
ends = starts[1:] + [app]
CT = {}
for k, r in enumerate(rom):
    # chapter title: first non-empty uppercase line(s) after the heading
    s = starts[k]
    seg = lines[s + 1:s + 8] if k else []
    t = ''
    for l in seg:
        l = l.strip()
        if not l: 
            if t: break
            continue
        if l.isupper() or t: t += (' ' if t else '') + l
        if l.endswith('.'): break
    CT[r] = t
TITLES = ['On the figure of the cross represented on the medal', 'Of the effigy of St. Benedict represented on the medal', 'Of the letters which are inscribed on the medal', 'Origin of the medal of St. Benedict', 'Of the use to be made of the medal of St. Benedict', 'The miraculous effects of the medal of St. Benedict in the seventeenth century', 'The effects of the medal of St. Benedict in the nineteenth century', 'On the spiritual favours obtained by the use of the medal', 'Protection against the snares of the devil', 'The medal a preservation in danger', 'Approbation of St. Benedict’s medal by the Holy See', 'Consequences of the brief of Benedict XIV in regard to the medal of St. Benedict', 'List of the indulgences attached to the medal of St. Benedict by the brief of Benedict XIV', 'Rite to be used in blessing the medal of St. Benedict', 'On devotion to St. Benedict']
units = [('introduction', 'Introduction', intro + 1, pref), ('author-preface', 'Author’s preface', pref + 1, ch1 - 1)]
for k, r in enumerate(rom):
    units.append(('%02d' % (k + 1), 'Chapter %s. %s' % (r, TITLES[k]), starts[k] + 1, ends[k]))
units.append(('appendix', 'Appendix', app + 1, len(lines)))
enc = {}; toc2 = []
for cid, t, a, e in units:
    pp = en.paras(lines[a:e], DROP)
    while pp and (pp[0].isupper() or len(pp[0]) < 4): pp = pp[1:]
    enc[cid] = b.chapter_md(t, [('p', p) for p in pp], {}, merge=False); toc2.append((cid, t))
d2 = b.book('gueranger-medal-cross-st-benedict', 'medaille-saint-benoit',
 {'en-US': 'The Medal or Cross of St. Benedict: Its Origin, Meaning and Privileges', 'fr-FR': 'La médaille ou croix de saint Benoît : son origine, sa signification et ses privilèges (traduction anglaise de 1880)', 'pt-BR': 'A medalha ou cruz de São Bento: origem, significado e privilégios (tradução inglesa de 1880)'},
 {'en-US': 'The English translation of Dom Guéranger’s Essai sur la médaille (Burns and Oates, 1880), with a Benedictine translator’s introduction, the author’s preface, fifteen chapters and an appendix on the Centenary Medal. Its chapters do not follow the French sections one for one, so it stands as its own book.',
  'fr-FR': 'La traduction anglaise de l’Essai de Dom Guéranger sur la médaille (Burns and Oates, 1880), avec introduction du traducteur, préface de l’auteur, quinze chapitres et un appendice sur la médaille du centenaire. Ses chapitres ne suivent pas un à un les paragraphes du français ; elle forme donc un livre à part.',
  'pt-BR': 'A tradução inglesa do Essai de Dom Guéranger sobre a medalha (Burns and Oates, 1880), com introdução do tradutor, prefácio do autor, quinze capítulos e um apêndice sobre a medalha do centenário. Seus capítulos não seguem um a um as seções do francês; por isso forma um livro à parte.'},
 '1862', ['en-US'], {'en-US': {'translator': 'A Benedictine monk (London: Burns and Oates)', 'year': 1880}},
 [b.src('en-US', 'https://archive.org/details/TheMedalOrCrossOfStBenedict', 'The Medal or Cross of St. Benedict, its Origin, Meaning, and Privileges, London, Burns and Oates, 1880 (archive.org OCR text from the Google scan, cleaned)', 'Page-foot notes are not separated by the OCR; the Latin of the blessing rite is as the OCR gave it.', ev='Printed 1880.')],
 b.toc_of(toc2, 'en-US'))
b.write_book('medal-cross-st-benedict', d2, {'en-US': enc}, {'medal-cross-st-benedict': ('english', '\n'.join(lines))})
