import sys; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import bellarmine_controversiae as C
# slug, (la, en, pt), [(vol, start_line, end_line)], english gloss
SEG = [
 ('prolegomena', ('Praefationes, De recognitione operis et Controversiae generales', 'Prefaces, the Recognition of the Work and the General Controversies', 'Prefácios, Revisão da obra e Controvérsias gerais'), [(1, 701, 1508)], 'the editor\'s and the author\'s prefaces, the author\'s own review of the work and the introduction to the general controversies'),
 ('de-verbo-dei', ('De verbo Dei', 'On the Word of God', 'Sobre a Palavra de Deus'), [(1, 1509, 4704)], 'the first general controversy: Scripture, tradition and the interpretation of the Word of God'),
 ('de-christo', ('De Christo', 'On Christ', 'Sobre Cristo'), [(1, 4705, 9174)], 'the second general controversy: the divinity, incarnation and soul of Christ against the Arians and others'),
 ('de-summo-pontifice', ('De Summo Pontifice', 'On the Supreme Pontiff', 'Sobre o Sumo Pontífice'), [(1, 9175, None), (2, 55, 4110)], 'the third general controversy: the primacy of the Roman Pontiff, his spiritual and temporal power'),
 ('de-conciliis-et-ecclesia-militante', ('De conciliis et ecclesia militante', 'On Councils and the Church Militant', 'Sobre os concílios e a Igreja militante'), [(2, 4111, 8368)], 'councils, and the Church militant, its notes and its members'),
 ('de-clericis', ('De clericis', 'On the Clergy', 'Sobre os clérigos'), [(2, 8369, 9894)], 'the clergy: their state, privileges and celibacy'),
 ('de-monachis', ('De monachis', 'On Monks', 'Sobre os monges'), [(2, 9895, None)], 'the religious state: monks, vows and the monastic life'),
 ('de-laicis', ('De laicis sive saecularibus', 'On the Laity', 'Sobre os leigos'), [(3, 73, 922)], 'the laity and secular power, the civil magistrate'),
 ('de-purgatorio', ('De purgatorio', 'On Purgatory', 'Sobre o purgatório'), [(3, 923, 2862)], 'the Church suffering: Purgatory and suffrages for the dead'),
 ('de-ecclesia-triumphante', ('De ecclesia triumphante', 'On the Church Triumphant', 'Sobre a Igreja triunfante'), [(3, 2863, 6954)], 'the Church triumphant: the beatitude and canonization of saints, relics and images, the means by which the Church is shown holy'),
 ('de-sacramentis-in-genere', ('De sacramentis in genere', 'On the Sacraments in General', 'Sobre os sacramentos em geral'), [(3, 6955, 10308)], 'the sacraments in general: name, definition, causes, effect, number and ceremonies'),
 ('de-baptismo', ('De baptismo', 'On Baptism', 'Sobre o batismo'), [(3, 10309, 11600)], 'the sacrament of baptism'),
 ('de-confirmatione', ('De confirmatione', 'On Confirmation', 'Sobre a confirmação'), [(3, 11601, None)], 'the sacrament of confirmation'),
 ('de-eucharistia', ('De sacramento eucharistiae et de missa', 'On the Eucharist and the Mass', 'Sobre a Eucaristia e a missa'), [(4, 45, 8516)], 'the Eucharist: the real presence, transubstantiation, communion and the sacrifice of the Mass'),
 ('de-poenitentia', ('De sacramento poenitentiae', 'On the Sacrament of Penance', 'Sobre o sacramento da penitência'), [(4, 8517, None)], 'the sacrament of penance: contrition, confession, satisfaction, indulgences'),
 ('de-extrema-unctione', ('De sacramento extremae unctionis', 'On Extreme Unction', 'Sobre a unção dos enfermos'), [(5, 33, 400)], 'the sacrament of extreme unction'),
 ('de-ordine', ('De sacramento ordinis', 'On the Sacrament of Order', 'Sobre o sacramento da ordem'), [(5, 401, 766)], 'the sacrament of holy orders'),
 ('de-matrimonio', ('De sacramento matrimonii', 'On the Sacrament of Marriage', 'Sobre o sacramento do matrimônio'), [(5, 767, 3594)], 'the sacrament of marriage: its unity, firmness and impediments'),
 ('de-gratia-primi-hominis', ('De gratia primi hominis', 'On the Grace of the First Man', 'Sobre a graça do primeiro homem'), [(5, 3595, 4352)], 'the grace and state of the first man before the fall'),
 ('de-amissione-gratiae', ('De amissione gratiae et statu peccati', 'On the Loss of Grace and the State of Sin', 'Sobre a perda da graça e o estado de pecado'), [(5, 4353, 9914)], 'original sin, actual sin and the loss of grace'),
 ('de-gratia-et-libero-arbitrio', ('De gratia et libero arbitrio', 'On Grace and Free Will', 'Sobre a graça e o livre-arbítrio'), [(5, 9915, None), (6, 43, 3038)], 'grace and free will against the Reformers'),
 ('de-iustificatione', ('De justificatione', 'On Justification', 'Sobre a justificação'), [(6, 3039, 8686)], 'justification of the sinner by faith and works, certainty of grace, merit'),
 ('de-bonis-operibus', ('De bonis operibus in particulari', 'On Good Works in Particular', 'Sobre as boas obras em particular'), [(6, 8687, 11654)], 'good works in particular: prayer, fasting, almsgiving'),
 ('appendix-de-summo-pontifice', ('Appendix ad libros de Summo Pontifice', 'Appendix to the Books on the Supreme Pontiff', 'Apêndice aos livros sobre o Sumo Pontífice'), [(6, 11655, 12442)], 'the appendix to the books on the Supreme Pontiff'),
 ('de-exemptione-clericorum', ('De exemptione clericorum', 'On the Exemption of Clerics', 'Sobre a isenção dos clérigos'), [(6, 12443, 12646)], 'the exemption of clerics from civil jurisdiction'),
 ('de-translatione-imperii', ('De translatione imperii Romani', 'On the Transfer of the Roman Empire', 'Sobre a transferência do império romano'), [(6, 12647, None)], 'the transfer of the Roman Empire to the Franks'),
]
only = sys.argv[1:]
for slug, (la, en, pt), vols, gl in SEG:
    if only and slug not in only: continue
    names = {'la': la, 'en-US': en, 'pt-BR': pt}
    descs = {'la': f'Ex Disputationibus de controversiis christianae fidei adversus huius temporis haereticos (1586-93): {la}. Textus ex editione Vivès (1870-74), ex scanno OCR.',
             'en-US': f'From the Disputations on the Controversies of the Christian Faith (1586-93): {gl}. Latin only: the Vivès edition (1870-74) from an OCR scan.',
             'pt-BR': f'Das Disputas sobre as controvérsias da fé cristã (1586-93): {pt}.'}
    wc, log = C.build(slug, vols, names, descs)
    print(slug, wc, len(log)); open('/Users/gustavo/Documents/prayer/research/sourcing/bellarmine/contr-gaps.txt', 'a').write('\n'.join(log) + '\n')
