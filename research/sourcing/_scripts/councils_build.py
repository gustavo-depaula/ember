"""Build one medieval council book: Latin (la.wikisource wikitext) + Schroeder 1937 English.
usage: councils_build.py <slug>"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
RAW = ROOT / 'research/sourcing/councils'
OUT = ROOT / 'content/books/church-fathers/councils'
UA = 'https://la.wikisource.org/wiki/'

SPECS = {
 'constantinople-iv': dict(wiki='Concilium_Constantinopolitanum_IV', en='c4', year='869–870',
   la='Concilium Constantinopolitanum IV (869–870)', enn='Constantinople IV (869–870)', pt='Constantinopla IV (869–870)',
   desc_la='Decreta et canones octavi concilii oecumenici, Constantinopoli habiti (869–870) contra Photium, in versione latina Anastasii Bibliothecarii.',
   desc_en='The decrees of the eighth ecumenical council (in the Western reckoning), held at Constantinople in 869–870 against Photius under Hadrian II: the profession of faith, the condemnation of Photius, and the twenty-seven canons. Latin text (the version of Anastasius the Librarian) with the English of Schroeder\'s Disciplinary Decrees of the General Councils (1937).',
   desc_pt='Os decretos do oitavo concílio ecumênico (na contagem ocidental), reunido em Constantinopla em 869–870 contra Fócio, sob Adriano II: a profissão de fé, a condenação de Fócio e os vinte e sete cânones.',
   es=(7758, 'canons 1–27'), ),
 'lateran-i': dict(wiki='Concilium_Lateranum_I', en='l1', year='1123',
   la='Concilium Lateranum I (1123)', enn='First Lateran Council (1123)', pt='Primeiro Concílio de Latrão (1123)',
   desc_la='Canones primi concilii Lateranensis (1123) sub Callisto II, post concordatum Wormatiense celebrati.',
   desc_en='The twenty-two canons of the ninth ecumenical council, held at the Lateran in 1123 under Callistus II after the Concordat of Worms: against simony and lay investiture, clerical concubinage and incest, and the indulgence for the Crusade. Latin text with Schroeder\'s English (1937).',
   desc_pt='Os vinte e dois cânones do nono concílio ecumênico, reunido no Latrão em 1123 sob Calisto II, após a Concordata de Worms: contra a simonia e a investidura leiga, o concubinato clerical e a cruzada.'),
 'lateran-ii': dict(wiki='Concilium_Lateranum_II', en='l2', year='1139',
   la='Concilium Lateranum II (1139)', enn='Second Lateran Council (1139)', pt='Segundo Concílio de Latrão (1139)',
   desc_la='Canones secundi concilii Lateranensis (1139) sub Innocentio II, schismate Anacleti finito celebrati.',
   desc_en='The thirty canons of the tenth ecumenical council, held at the Lateran in 1139 under Innocent II at the end of the schism of Anacletus: simony, clerical celibacy, usury, tournaments, the Peace and Truce of God, and heretics. Latin text with Schroeder\'s English (1937).',
   desc_pt='Os trinta cânones do décimo concílio ecumênico, reunido no Latrão em 1139 sob Inocêncio II, ao fim do cisma de Anacleto: simonia, celibato clerical, usura, torneios, paz de Deus e hereges.'),
 'lateran-iii': dict(wiki='Concilium_Lateranum_III', en='l3', year='1179',
   la='Concilium Lateranum III (1179)', enn='Third Lateran Council (1179)', pt='Terceiro Concílio de Latrão (1179)',
   desc_la='Canones tertii concilii Lateranensis (1179) sub Alexandro III, schismate Victoris IV finito celebrati.',
   desc_en='The twenty-seven canons of the eleventh ecumenical council, held at the Lateran in 1179 under Alexander III after the schism with Barbarossa: the election of the pope by a two-thirds majority of the cardinals, the age of bishops, pluralism, and measures against the Cathars and the Jews and Saracens. Latin text with Schroeder\'s English (1937).',
   desc_pt='Os vinte e sete cânones do décimo primeiro concílio ecumênico, reunido no Latrão em 1179 sob Alexandre III: a eleição do papa por dois terços dos cardeais, a idade dos bispos, a pluralidade de benefícios e as medidas contra os cátaros.'),
 'lateran-iv': dict(wiki='Concilium_Lateranum_IV', en='l4', year='1215',
   la='Concilium Lateranum IV (1215)', enn='Fourth Lateran Council (1215)', pt='Quarto Concílio de Latrão (1215)',
   desc_la='Constitutiones quarti concilii Lateranensis (1215) sub Innocentio III, a Firmiter credimus (de fide catholica) ad constitutionem de Terra Sancta.',
   desc_en='The seventy-one constitutions of the twelfth ecumenical council, held at the Lateran in 1215 under Innocent III: the profession of faith Firmiter credimus (with the definition of transubstantiation), the condemnation of Joachim of Fiore and the Albigensians, annual confession and Easter communion, the reform of the clergy and the preparation of the Fifth Crusade. Latin text with Schroeder\'s English (1937).',
   desc_pt='As setenta e uma constituições do décimo segundo concílio ecumênico, reunido no Latrão em 1215 sob Inocêncio III: a profissão de fé Firmiter credimus, com a definição da transubstanciação, a confissão anual e a comunhão pascal, a reforma do clero e a cruzada.'),
 'lyons-i': dict(wiki='Concilium_Lugdunense_I', en='ly1', year='1245',
   la='Concilium Lugdunense I (1245)', enn='First Council of Lyons (1245)', pt='Primeiro Concílio de Lião (1245)',
   desc_la='Constitutiones et decreta primi concilii Lugdunensis (1245) sub Innocentio IV, cum sententia depositionis Friderici II.',
   desc_en='The decrees of the thirteenth ecumenical council, held at Lyons in 1245 under Innocent IV: the constitutions on judicial procedure and the Holy Land, and the sentence of deposition of the Emperor Frederick II. Latin text with Schroeder\'s English (1937), which gives the disciplinary constitutions.',
   desc_pt='Os decretos do décimo terceiro concílio ecumênico, reunido em Lião em 1245 sob Inocêncio IV: as constituições disciplinares e a sentença de deposição do imperador Frederico II.'),
 'lyons-ii': dict(wiki='Concilium_Lugdunense_II', en='ly2', year='1274',
   la='Concilium Lugdunense II (1274)', enn='Second Council of Lyons (1274)', pt='Segundo Concílio de Lião (1274)',
   desc_la='Constitutiones secundi concilii Lugdunensis (1274) sub Gregorio X, cum professione fidei Michaelis Palaeologi et constitutione de electione Romani Pontificis.',
   desc_en='The decrees of the fourteenth ecumenical council, held at Lyons in 1274 under Gregory X: the union with the Greeks and the profession of faith of Michael Palaeologus, the constitution Ubi periculum on papal conclaves, the Crusade, and the reform of the clergy and of the mendicant orders. Latin text with Schroeder\'s English (1937), which gives the disciplinary constitutions.',
   desc_pt='Os decretos do décimo quarto concílio ecumênico, reunido em Lião em 1274 sob Gregório X: a união com os gregos, a constituição Ubi periculum sobre o conclave, a cruzada e a reforma do clero e das ordens mendicantes.'),
 'vienne': dict(wiki='Concilium_Viennense', en='vienne', year='1311–1312',
   la='Concilium Viennense (1311–1312)', enn='Council of Vienne (1311–1312)', pt='Concílio de Viena (1311–1312)',
   desc_la='Decreta concilii Viennensis (1311–1312) sub Clemente V: de Templariorum ordine (Vox in excelso), Fidei catholicae fundamento, Exivi de paradiso, Clementinae.',
   desc_en='The decrees of the fifteenth ecumenical council, held at Vienne in 1311–1312 under Clement V: the suppression of the Templars, the definition of the soul as the form of the body, the poverty of the Friars Minor, and the decrees later gathered in the Clementines. Latin text with Schroeder\'s English (1937), which translates the disciplinary decrees.',
   desc_pt='Os decretos do décimo quinto concílio ecumênico, reunido em Viena em 1311–1312 sob Clemente V: a supressão dos templários, a definição da alma como forma do corpo, a pobreza dos frades menores e os decretos das Clementinas.'),
 'constance': dict(wiki='Concilium_Constantiense_Documenta', en=None, year='1414–1418',
   la='Concilium Constantiense (1414–1418)', enn='Council of Constance (1414–1418)', pt='Concílio de Constança (1414–1418)',
   desc_la='Documenta concilii Constantiensis (1414–1418): Haec sancta, Frequens, damnationes Wyclif et Hus, reformatio.',
   desc_en='The documents of the sixteenth ecumenical council, held at Constance in 1414–1418, which ended the Western Schism: the decrees Haec sancta and Frequens, the condemnations of Wyclif and Hus, and the decrees of reform. Latin text.',
   desc_pt='Os documentos do décimo sexto concílio ecumênico, reunido em Constança em 1414–1418, que pôs fim ao Grande Cisma do Ocidente: Haec sancta, Frequens, as condenações de Wyclif e Hus e os decretos de reforma.'),
 'basel-ferrara-florence': dict(wiki='Concilii_Basiliensis_Documenta', en=None, year='1431–1445',
   la='Concilium Basiliense, Ferrariense, Florentinum (1431–1445)', enn='Council of Basel, Ferrara and Florence (1431–1445)', pt='Concílio de Basileia, Ferrara e Florença (1431–1445)',
   desc_la='Documenta concilii Basiliensis, Ferrariensis, Florentini et Romani (1431–1445): decreta unionis cum Graecis (Laetentur caeli), Armenis (Exultate Deo), Iacobitis (Cantate Domino).',
   desc_en='The documents of the seventeenth ecumenical council, which moved from Basel to Ferrara and Florence (1431–1445) and reunited the Greeks, Armenians and Copts with Rome: Laetentur caeli, Exultate Deo, Cantate Domino. Latin text.',
   desc_pt='Os documentos do décimo sétimo concílio ecumênico, que passou de Basileia a Ferrara e Florença (1431–1445) e uniu gregos, armênios e coptas a Roma: Laetentur caeli, Exultate Deo, Cantate Domino.'),
 'lateran-v': dict(wiki='Concilium_Lateranense_V_Documenta', en=None, year='1512–1517',
   la='Concilium Lateranense V (1512–1517)', enn='Fifth Lateran Council (1512–1517)', pt='Quinto Concílio de Latrão (1512–1517)',
   desc_la='Documenta quinti concilii Lateranensis (1512–1517) sub Iulio II et Leone X, cum bulla Apostolici regiminis de anima.',
   desc_en='The documents of the eighteenth ecumenical council, held at the Lateran in 1512–1517 under Julius II and Leo X: the condemnation of the Pragmatic Sanction and of the Pisan conciliabulum, the bull Apostolici regiminis on the immortality of the soul, and the reform decrees. Latin text.',
   desc_pt='Os documentos do décimo oitavo concílio ecumênico, reunido no Latrão em 1512–1517 sob Júlio II e Leão X: a bula Apostolici regiminis sobre a imortalidade da alma e os decretos de reforma.'),
}

def latin(wiki):
    t = (RAW / 'dl2' / f'{wiki}.wiki').read_text()
    t = t[t.index('<div class=text>') + 16:] if '<div class=text>' in t else t[t.index('}}') + 2:]
    t = re.sub(r'\[\[Categoria[^\]]*\]\]', '', t)
    t = re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]', r'\1', t)
    t = re.sub(r'\[\[([^\]]*)\]\]', r'\1', t)
    t = re.sub(r'</?[a-z][^>]*>|\{\{[^}]*\}\}', '', t)
    lines = [re.sub(r'\s+', ' ', l).strip() for l in t.split('\n')]
    lines = [l for l in lines if l]
    # the leading source-header lines (digitisation labels) are not part of the text
    lines = [l for l in lines if not re.search(r'pag\. ?: ?\d+', l)]
    while lines and re.match(r'^(\d{4}-\d{4}- |Conc(ilia|\.)\b[^.]*oecum)', lines[0]):
        lines.pop(0)
    out = []
    for l in lines:
        l = re.sub(r'(\w) (que|ve)\b', r'\1\2', l)
        l = re.sub(r'\b([Pp]lacet) ne\b', r'\1ne', l)
        m = re.fullmatch(r'\[(.*)\]\.?', l)
        out.append('## ' + m.group(1).strip() if m else l)
    return '\n\n'.join(out) + '\n'

def main(slug):
    s = SPECS[slug]
    d = OUT / slug
    (d / 'la').mkdir(parents=True, exist_ok=True)
    (d / 'sources/latin-originals').mkdir(parents=True, exist_ok=True)
    la = latin(s['wiki'])
    (d / 'la/ch001.md').write_text(f"# {s['la']}\n\n" + la)
    (d / f"sources/latin-originals/{slug}.txt").write_text(la)
    langs = ['la']
    srcs = [{
      'language': 'la',
      'url': UA + s['wiki'],
      'edition': 'Latin Wikisource, ' + s['wiki'].replace('_', ' ') + ', the text of Conciliorum Oecumenicorum Decreta (Bologna 1962) as circulated by Documenta Catholica Omnia. Wikitext fetched through action=raw.',
      'description': 'Complete as transcribed. The digitisation has its punctuation largely stripped, no capitals at the start of sentences, lowercase deus/dominus, and no canon numbers; the text is left as transcribed, with line breaks kept as paragraph breaks, the digitisation\'s split enclitics rejoined (\"ideo que\" → \"ideoque\") and bracketed headings turned into markdown headings. The English of Schroeder (1937) numbers the canons.' if s['en'] else 'Complete as transcribed. The digitisation has its punctuation largely stripped, no capitals at the start of sentences, lowercase deus/dominus, and no canon numbers; the text is left as transcribed, with line breaks kept as paragraph breaks, the digitisation\'s split enclitics rejoined and bracketed headings turned into markdown headings. No public-domain English translation of this text has been imported yet.',
      'tier': 'B',
      'tierEvidence': 'Medieval documents; the digitisation derives from the Library of Latin Texts / COD text (a critical edition of 1962/1973), which carries at most a neighbouring right that has run out and is freely redistributed by Wikisource and Documenta Catholica Omnia.'}]
    editions = {'la': {'editor': 'Conciliorum Oecumenicorum Decreta (Bologna 1962), via Latin Wikisource / Documenta Catholica Omnia', 'year': 1962}}
    en_words = 0
    if s['en']:
        en = (RAW / 'en' / f"{s['en']}.md").read_text()
        en = re.sub(r'^# .*\n', '', en)
        (d / 'en-US').mkdir(exist_ok=True)
        (d / 'en-US/ch001.md').write_text(f"# {s['enn']}\n" + en)
        (d / 'sources/english-originals').mkdir(exist_ok=True)
        (d / f"sources/english-originals/{slug}.txt").write_text(en)
        en_words = len(en.split())
        langs.append('en-US')
        editions['en-US'] = {'translator': 'H. J. Schroeder, O.P.', 'year': 1937}
        srcs.append({'language': 'en-US', 'url': 'https://archive.org/details/schroeder-disciplinary-councils',
          'edition': 'H. J. Schroeder, O.P., Disciplinary Decrees of the General Councils: Text, Translation and Commentary, St. Louis and London: B. Herder, 1937. archive.org OCR (schroeder-disciplinary-councils_djvu.txt).',
          'description': 'For each canon Schroeder\'s one-sentence summary (in italics) and the translated text. Schroeder\'s historical introduction, his comments and his footnotes are not included, and the OCR\'s running heads and page-end footnotes were stripped by script (research/sourcing/_scripts/councils_schroeder.py); a few inline footnote marks and OCR slips remain. Schroeder translates the disciplinary decrees only.',
          'tier': 'A', 'tierEvidence': 'Published 1937; US copyright not renewed (confirmed by TAN Books, which holds the Herder list); Schroeder died in 1942.'})
    book = {
      'id': f'councils-{slug}', 'cover': 'quarter',
      'name': {'la': s['la'], 'en-US': s['enn'], 'pt-BR': s['pt']},
      'author': {'la': 'Concilia', 'en-US': 'Councils', 'pt-BR': 'Concílios'},
      'description': {'la': s['desc_la'], 'en-US': s['desc_en'], 'pt-BR': s['desc_pt']},
      'composed': s['year'], 'languages': langs, 'work': f'councils/{slug}', 'editions': editions, 'sources': srcs,
      'toc': [{'id': 'ch001', 'title': dict({'la': s['la']}, **({'en-US': s['enn']} if s['en'] else {}))}]}
    (d / 'book.json').write_text(json.dumps(book, ensure_ascii=False, indent=2) + '\n')
    print(slug, 'la', len(la.split()), 'en', en_words)

if __name__ == '__main__':
    main(sys.argv[1])
