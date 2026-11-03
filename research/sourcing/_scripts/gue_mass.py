import re, gue_dg as g, gue_build as b, gue_en as en
UNITS = [  # id, fr title, en title, fr index, en heading regex
 ('avant-propos', 'Avant-propos de la première édition', 'Preface', 6, r'PREFACE\.'),
 ('explication-de-la-messe', 'Explication de la messe', 'Explanation of the Mass', 14, r'EXPLANATION OF THE MASS'),
 ('judica', 'Psaume Judica', 'Judica, Psalm XLII', 19, r'JUDICA, Ps\. XLII\.'),
 ('confiteor', 'Confiteor', 'Confiteor', 24, r'CONFITEOR\.'),
 ('encensement-autel', 'Encensement de l’autel', 'Incensing the Altar', 36, r'INCENSING THE ALTAR\.'),
 ('introit', 'Introït', 'Introit', 39, r'INTROIT\.'),
 ('kyrie', 'Kyrie', 'Kyrie', 43, r'KYRIE\.'),
 ('gloria', 'Gloria in excelsis', 'Gloria in excelsis', 46, r'GLORIA IN EXCELSIS\.'),
 ('collecte', 'Collecte', 'Collect', 52, r'COLLECT\.'),
 ('epitre', 'Épître', 'Epistle', 58, r'EPISTLE\.'),
 ('graduel', 'Graduel', 'Gradual', 62, r'GRADUAL\.'),
 ('alleluia-trait', 'Alléluia, trait', 'Alleluia, tract', 64, r'ALLELUIA\. TRACT\.'),
 ('sequence', 'Séquence', 'Sequence', 67, r'SEQUENCE\.'),
 ('evangile', 'Évangile', 'Gospel', 71, r'GOSPEL\.'),
 ('credo', 'Credo', 'Credo', 77, r'CREDO\.'),
 ('offertoire', 'Offertoire', 'The Offertory', 123, r'THE OFFERTORY\.'),
 ('encensement-offertoire', 'Encensement de l’autel', 'Incensing of the Altar', 145, r'INCENSING OF THE ALTAR, &c\.'),
 ('lavabo', 'Lavabo', 'Lavabo', 151, r'LAVABO.*'),
 ('suscipe', 'Suscipe, sancta Trinitas', 'Suscipe, sancta Trinitas', 154, r'SUSCIPE, SANCTA TRINITAS\.'),
 ('orate-fratres', 'Orate, fratres', 'Orate, fratres', 162, r'ORATE FRATRES\.'),
 ('preface', 'Préface', 'Preface', 166, r'PREFACE\.'),
 ('sanctus', 'Sanctus', 'Sanctus', 174, r'SANCTUS\.'),
 ('canon', 'Canon de la messe', 'The Canon of the Mass', 181, r'THE CANON OF THE MASS'),
 ('te-igitur', 'Te igitur', 'Te igitur', 188, r'TE IGITUR\.'),
 ('memento-vivants', 'Memento des vivants', 'Memento of the living', 198, r'MEMENTO OF THE LIVING\.'),
 ('communicantes', 'Communicantes', 'Communicantes', 204, r'COMMUNICANTES\.'),
 ('hanc-igitur', 'Hanc igitur', 'Hanc igitur', 213, r'HANC IGITUR\.'),
 ('quam-oblationem', 'Quam oblationem', 'Quam oblationem', 217, r'QUAM OBLATIONEM\.'),
 ('consecration-hostie', 'Consécration de l’hostie', 'Consecration of the host', 220, r'CONSECRATION OF THE HOST\.'),
 ('consecration-vin', 'Consécration du vin', 'Consecration of the wine', 231, r'CONSECRATION OF THE WINE\.'),
 ('unde-et-memores', 'Unde et memores', 'Unde et memores', 242, r'UNDE ET MEMORES\.'),
 ('supra-quae', 'Supra quae propitio', 'Supra quae propitio', 250, r'SUPRA QUAE PROPITIO\.'),
 ('supplices', 'Supplices te rogamus', 'Supplices te rogamus', 255, r'SUPPLICES TE ROGAMUS\.'),
 ('memento-morts', 'Memento des morts', 'Memento of the dead', 261, r'MEMENTO OF THE DEAD\.'),
 ('nobis-quoque', 'Nobis quoque peccatoribus', 'Nobis quoque peccatoribus', 269, r'NOBIS QUOQUE PECCATORIBUS\.'),
 ('per-quem', 'Per quem haec omnia', 'Per quem haec omnia', 273, r'PER QUEM HAEC OMNIA\.'),
 ('oraison-dominicale', 'L’oraison dominicale', 'The Lord’s Prayer', 288, r'THE LORD.S PRAYER\.'),
 ('libera-nos', 'Libera nos, quaesumus', 'Libera nos, quaesumus', 297, r'LIBERA NOS QUAESUMUS\.'),
 ('agnus-dei', 'Agnus Dei', 'Agnus Dei', 305, r'AGNUS DEI'),
 ('oraisons-avant-communion', 'Oraisons avant la communion', 'Prayers before the Communion', 308, r'PRAYERS BEFORE THE COMMUNION\.'),
 ('communion', 'Communion', 'Communion', 320, r'COMMUNION\.'),
 ('postcommunion', 'Postcommunion', 'Postcommunion', 325, r'POSTCOMMUNION\.'),
 ('ite-missa-est', 'Ite, missa est', 'Ite, missa est', 328, r'ITE MISSA EST\.'),
 ('benediction', 'Bénédiction', 'The Blessing', 332, r'THE BLESSING\.'),
 ('dernier-evangile', 'Dernier évangile', 'The Last Gospel', 334, r'THE LAST GOSPEL\.')]
o, n = g.parse(g.find('Explication des prières de la sainte messe')[0])
fr = {}
sub = {222: 'HOC EST ENIM CORPUS MEUM'}
for k, (cid, ft, et, fi, rx) in enumerate(UNITS):
    end = UNITS[k + 1][3] if k + 1 < len(UNITS) else len(o)
    body = o[fi + 1:end] if o[fi][0] in ('c', 'h') else o[fi:end]
    if cid == 'explication-de-la-messe': body = o[15:end]
    if cid == 'avant-propos': body = o[7:end]
    pp = []
    for kk, t in body:
        m = re.fullmatch(r'\*([^*]+)\*', t)
        if cid == 'avant-propos' and m: t = m.group(1).strip()
        if kk == 'c' and t.startswith('*'): kk = 'h3'; t = t.strip('* ')
        elif kk == 'c' and t.isupper() : kk = 'h2'
        pp.append((kk, t))
    fr[cid] = b.chapter_md(ft, pp, n)
# English
lines = open(b.ROOT + 'research/sourcing/gueranger/ia2/mass_en.txt').read().split('\n')
start = next(i for i, l in enumerate(lines) if l.strip() == 'PRELIMINARY NOTICE TO THIS TRANSLATION.')
pos = []; cur = start
for cid, ft, et, fi, rx in UNITS:
    j = next(i for i in range(cur, len(lines)) if re.fullmatch(rx, lines[i].strip()))
    pos.append(j); cur = j + 1
appx = next(i for i, l in enumerate(lines) if l.strip().startswith('APPENDIX - THE ORDINARY'))
enc = {}
pre_notice = en.paras(lines[start + 1:pos[0]])
for k, (cid, ft, et, fi, rx) in enumerate(UNITS):
    end = pos[k + 1] if k + 1 < len(UNITS) else appx
    pp = en.paras(lines[pos[k] + 1:end])
    if cid == 'avant-propos': pp = [('h2', 'Preliminary notice to this translation')] + [('p', p) for p in pre_notice] + [('h2', 'Preface')] + [('p', p) for p in pp]
    elif cid == 'dernier-evangile': pp = [('p', p) for p in pp] + [('h2', 'Appendix: the Ordinary of the Mass')] + [('p', p) for p in en.paras(lines[appx + 1:])]
    else: pp = [('p', p) for p in pp]
    enc[cid] = b.chapter_md(et, pp, {}, merge=False)
toc = []
for cid, ft, et, fi, rx in UNITS:
    toc.append({'id': cid, 'title': {'fr-FR': ft, 'en-US': et}})
d = b.book('gueranger-explication-messe', 'explication-messe',
 {'fr-FR': 'Explication des prières et des cérémonies de la sainte messe', 'en-US': 'Explanation of the Prayers and Ceremonies of Holy Mass', 'pt-BR': 'Explicação das orações e das cerimônias da santa missa'},
 {'fr-FR': 'Commentaire de l’Ordinaire de la messe, de l’antienne Introibo au dernier évangile, tiré des notes prises aux conférences de Dom Guéranger par les moniales de Stanbrook et publié à Solesmes en 1885 (seconde édition). Texte de notes de conférences, non de la rédaction définitive de l’auteur.',
  'en-US': 'A commentary on the Ordinary of the Mass, from the Introibo antiphon to the Last Gospel, taken from notes of Dom Guéranger’s conferences by the nuns of Stanbrook; translated by Dom Laurence Shepherd (his last, unfinished work, completed by the Stanbrook community), 1885. Conference notes, not the author’s finished prose.',
  'pt-BR': 'Comentário ao Ordinário da missa, da antífona Introibo ao último evangelho, tirado das anotações das conferências de Dom Guéranger pelas monjas de Stanbrook e publicado em Solesmes em 1885 (segunda edição). Texto de anotações de conferências, não a redação definitiva do autor.'},
 '1885', ['fr-FR', 'en-US'], {'fr-FR': {'editor': 'Stanbrook Abbey (Solesmes, Imprimerie Saint-Pierre)', 'year': 1885}, 'en-US': {'translator': 'Dom Laurence Shepherd (completed by the nuns of Stanbrook)', 'year': 1885}},
 [b.src('fr-FR', b.DG + 'explication-des-prieres-de-la-sainte-messe-2/', 'Explication des prières et des cérémonies de la sainte messe, 2nd ed., Solesmes, Imprimerie Saint-Pierre, 1885 (domgueranger.net HTML transcription)', 'The French appendix of the Ordinary of the Mass is not on the site.', ev='Conference notes edited by Stanbrook before 1885; Guéranger died 1875.'),
  b.src('en-US', 'https://archive.org/details/ExplanationOfThePrayersAndGurangerProsperO.S.B.S5723', 'Explanation of the Prayers and Ceremonies of Holy Mass, trans. Dom Laurence Shepherd, London, Burns and Oates / Stanbrook, 1885 (archive.org OCR text of the isidore.co copy, cleaned)', 'The translator’s preliminary notice opens the Preface chapter and the appendix of the Ordinary of the Mass closes the Last Gospel chapter; neither has a counterpart in the French.', ev='Printed 1885.')],
 toc)
b.write_book('explication-messe', d, {'fr-FR': fr, 'en-US': enc}, {'explication-messe': ('french', '\n\n'.join(t for _, t in o))})
