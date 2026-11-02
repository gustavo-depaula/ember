import sys, re; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import bellarmine_controversiae as C
import bellarmine_common as bc
bc_idx = lambda v, rx, after=0: next(i * 2 + 1 for i, p in enumerate(bc.clean_volume(v).split('\n\n')) if i * 2 >= after and re.match(rx, p))
off0 = bc_idx(8, r'^DE OFFICIO\s+PRINCIPIS', 800); asc0 = bc_idx(8, r'^DE ASCENSIONE MENTIS IN DEUM', off0)
print('officio', off0, asc0)
# slug, outdir, id, work, names, desc, vols, composed, lang
W = [
 ('risposte-interdetto', 'polemica/risposte-interdetto', 'bellarmine-risposte-interdetto', 'risposte-interdetto',
  {'it': 'Risposte alle opposizioni del Senato di Venezia', 'en-US': 'Replies in the Venetian Interdict Controversy', 'pt-BR': 'Respostas na questão do Interdito de Veneza'},
  {'it': 'Gli scritti italiani di Bellarmino durante l\'Interdetto di Venezia (1606): risposte ai sette teologi della Repubblica e ad altri opuscoli. Testo dell\'edizione Vivès (1870-74), tomo VIII, da scansione OCR.',
   'en-US': 'Bellarmine\'s Italian writings during the Venetian Interdict (1606): replies to the Republic\'s theologians and other pamphlets. Italian only: the Vivès edition (1870-74), volume 8, from an OCR scan.',
   'pt-BR': 'Os escritos italianos de Belarmino durante o Interdito de Veneza (1606).'}, [(8, 1, off0 - 1)], '1606', 'it'),
 ('de-officio-principis', 'de-officio-principis', 'bellarmine-de-officio-principis', 'de-officio-principis-christiani',
  {'la': 'De officio principis christiani', 'en-US': 'The Duty of the Christian Prince', 'pt-BR': 'O dever do príncipe cristão'},
  {'la': 'Tres libri de officio principis christiani (1619): virtutes principis, vitae sanctorum principum Veteris et Novi Testamenti. Textus ex editione Vivès (1870-74), tomo VIII, ex scanno OCR.',
   'en-US': 'Three books on the duty of the Christian prince (1619): the virtues of a ruler and the lives of holy princes of the Old and New Testament. Latin only: the Vivès edition (1870-74), volume 8, from an OCR scan.',
   'pt-BR': 'Três livros sobre o dever do príncipe cristão (1619).'}, [(8, off0, asc0 - 1)], '1619', 'la'),
 ('appendix-de-cultu-imaginum', 'polemica/appendix-de-cultu-imaginum', 'bellarmine-appendix-de-cultu-imaginum', 'appendix-de-cultu-imaginum',
  {'la': 'Appendix de cultu imaginum', 'en-US': 'Appendix on the Veneration of Images', 'pt-BR': 'Apêndice sobre o culto das imagens'},
  {'la': 'Appendix ad tractatum de reliquiis et imaginibus sanctorum. Textus ex editione Vivès (1870-74), tomo VII, ex scanno OCR.', 'en-US': 'An appendix to the treatise on relics and images. Latin only: the Vivès edition (1870-74), volume 7, from an OCR scan.', 'pt-BR': 'Apêndice ao tratado sobre as relíquias e imagens.'}, [(7, 45, 212)], '1608', 'la'),
 ('de-indulgentiis', 'polemica/de-indulgentiis', 'bellarmine-de-indulgentiis', 'de-indulgentiis',
  {'la': 'De indulgentiis et jubilaeo', 'en-US': 'On Indulgences and the Jubilee', 'pt-BR': 'Sobre as indulgências e o jubileu'},
  {'la': 'Duo libri de indulgentiis et jubilaeo, complementum controversiarum de poenitentia. Textus ex editione Vivès (1870-74), tomo VII, ex scanno OCR.', 'en-US': 'Two books on indulgences and the jubilee, supplementing the controversy on penance. Latin only: the Vivès edition (1870-74), volume 7, from an OCR scan.', 'pt-BR': 'Dois livros sobre as indulgências e o jubileu.'}, [(7, 213, 1156)], '1599', 'la'),
 ('judicium-de-libro-concordiae', 'polemica/judicium-de-libro-concordiae', 'bellarmine-judicium-de-libro-concordiae', 'judicium-de-libro-concordiae',
  {'la': 'Judicium de libro quem Lutherani vocant Concordiae', 'en-US': 'Judgment on the Lutheran Book of Concord', 'pt-BR': 'Juízo sobre o Livro da Concórdia luterano'},
  {'la': 'Judicium de libro quem Lutherani vocant Concordiae (1585). Textus ex editione Vivès (1870-74), tomo VII, ex scanno OCR.', 'en-US': 'Bellarmine\'s judgment on the Lutheran Book of Concord (1585). Latin only: the Vivès edition (1870-74), volume 7, from an OCR scan.', 'pt-BR': 'Juízo de Belarmino sobre o Livro da Concórdia luterano (1585).'}, [(7, 1157, 2026)], '1585', 'la'),
 ('de-potestate-summi-pontificis', 'polemica/de-potestate-summi-pontificis', 'bellarmine-de-potestate-summi-pontificis', 'de-potestate-summi-pontificis',
  {'la': 'Tractatus de potestate Summi Pontificis in rebus temporalibus', 'en-US': 'Treatise on the Power of the Supreme Pontiff in Temporal Matters', 'pt-BR': 'Tratado sobre o poder do Sumo Pontífice nas coisas temporais'},
  {'la': 'Adversus Guilielmum Barclaium (1610). Textus ex editione Vivès (1870-74), tomo XII, ex scanno OCR.', 'en-US': 'Against William Barclay (1610). Latin only: the Vivès edition (1870-74), volume 12, from an OCR scan.', 'pt-BR': 'Contra Guilherme Barclay (1610).'}, [(12, 39, 1802)], '1610', 'la'),
 ('apologia-ad-librum-jacobi', 'polemica/apologia-ad-librum-jacobi', 'bellarmine-apologia-ad-librum-jacobi', 'responsio-ad-apologiam-jacobi-regis',
  {'la': 'Responsio ad librum Jacobi Magnae Britanniae regis (Apologia)', 'en-US': 'Reply to the Book of James I of England', 'pt-BR': 'Resposta ao livro de Tiago I da Inglaterra'},
  {'la': 'Apologia Bellarmini pro responsione sua ad librum Jacobi regis (1609). Textus ex editione Vivès (1870-74), tomo XII, ex scanno OCR.', 'en-US': 'Bellarmine\'s defence of his reply to the book of James I, on the oath of allegiance (1609). Latin only: the Vivès edition (1870-74), volume 12, from an OCR scan.', 'pt-BR': 'A defesa de Belarmino de sua resposta ao livro de Tiago I (1609).'}, [(12, 1803, 3786)], '1609', 'la'),
 ('responsio-ad-triplici-nodo', 'polemica/responsio-ad-triplici-nodo', 'bellarmine-responsio-ad-triplici-nodo', 'responsio-ad-triplici-nodo',
  {'la': 'Responsio ad librum inscriptum Triplici nodo triplex cuneus', 'en-US': 'Reply to Triplici nodo, triplex cuneus', 'pt-BR': 'Resposta ao Triplici nodo, triplex cuneus'},
  {'la': 'Responsio Matthaei Torti ad librum Jacobi regis (1608). Textus ex editione Vivès (1870-74), tomo XII, ex scanno OCR.', 'en-US': 'The reply of "Matthaeus Tortus" to the book of James I, on the oath of allegiance (1608). Latin only: the Vivès edition (1870-74), volume 12, from an OCR scan.', 'pt-BR': 'A resposta de "Matthaeus Tortus" ao livro de Tiago I (1608).'}, [(12, 3787, 4488)], '1608', 'la'),
 ('de-scriptoribus-ecclesiasticis', 'de-scriptoribus-ecclesiasticis', 'bellarmine-de-scriptoribus-ecclesiasticis', 'de-scriptoribus-ecclesiasticis',
  {'la': 'De scriptoribus ecclesiasticis', 'en-US': 'On Ecclesiastical Writers', 'pt-BR': 'Sobre os escritores eclesiásticos'},
  {'la': 'Liber unus de scriptoribus ecclesiasticis (1613), saeculorum ordine, cum Chronologia brevi. Textus ex editione Vivès (1870-74), tomo XII, ex scanno OCR.', 'en-US': 'A survey of ecclesiastical writers by century (1613), with the short chronology. Latin only: the Vivès edition (1870-74), volume 12, from an OCR scan.', 'pt-BR': 'Um panorama dos escritores eclesiásticos por século (1613), com a cronologia breve.'}, [(12, 8301, 16470)], '1613', 'la'),
]
only = sys.argv[1:]
for slug, outdir, bid, work, names, descs, vols, comp, lang in W:
    if only and slug not in only: continue
    wc, log = C.build(slug, vols, names, descs, comp, lang=lang, outdir=outdir, bid=bid, work=work)
    print(slug, wc, len(log))
