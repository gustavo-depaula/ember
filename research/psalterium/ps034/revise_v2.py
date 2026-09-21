"""Ps 34 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps034/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; writes prayed.json. Ambiguity outcomes come from ambiguity_v1.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
D = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def add(id, refs, latin, kind, why, options):
    d = {'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}
    data['decisions'].append(d)
    D[id] = d


def front(id, index, note, source=None):
    d = D[id]
    chosen = d['options'].pop(index)
    d['options'].insert(0, chosen)
    chosen['note'] = note
    if source:
        chosen['from'] = source
    d['options'][1]['note'] = 'Draft 1. ' + d['options'][1]['note']


data['version'] = 2
data['status'] = 'reviewed'

# 34:3 — the stylist: 'fechar a passagem a alguém'
d = D['conclude']
d['why'] += (' Heard (draft 1): the stylist — «A construção mistura “fechar a passagem a alguém” com “agir contra alguém”» →'
             ' ‘e fechai a passagem aos que me perseguem’. Taken: the idiom\'s own regency; barring the way *to* someone is'
             ' against him, which is advérsus\'s sense (grammar, D2).')
d['options'].insert(0, opt('fechai a passagem aos', {'conclude': 'fechai a passagem aos'}, 'Ruling (draft 2): the stylist; the idiom\'s regency.', 'stylist'))
d['options'][1]['note'] = 'Draft 1: advérsus as \'contra\'; a mixed regency.'
V['34:3'] = '{effunde} a espada, e {conclude} que me perseguem: * dizei à minha alma: {salus}.'
d['options'][1]['forms'] = {'conclude': 'fechai a passagem contra os'}
d['options'][2]['forms'] = {'conclude': 'encerrai os'}
d['options'][3]['forms'] = {'conclude': 'fechai o caminho aos'}

# 34:4b, 34:20 — cogitáre with its preposition
d = D['cogitare']
d['why'] += (' Heard (draft 1): the stylist — «“Pensar males” soa como uma regência transportada do latim» (34:4b, → ‘pensam em'
             ' males’) and «“pensavam enganos” … parece faltar uma preposição ou um verbo próprio de preparar uma fraude» (34:20, →'
             ' ‘tramavam enganos’). Taken as the glossary has it: *pensar em* (the row\'s regency, 20:12), in both verses; *tramar* is'
             ' kept as the option (it explains the thinking as plotting).')
d['options'].insert(0, opt('pensam em males … pensavam em enganos', {'cogitantes': 'pensam em males', 'cogitabant': 'pensavam em enganos'},
                           'Ruling (draft 2): the row\'s regency (the stylist, 34:4b).', 'stylist'))
d['options'][1]['note'] = 'Draft 1: the bare accusative.'

# 34:5, 34:6 — the angel's participles: both the Latinist (MAJOR ×2) and the stylist
d = D['participles']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR at both verses — «A oração relativa deixa apenas uma descrição do anjo, sem'
             ' predicar sua ação no quadro do desejo expresso por fiant» → ‘e o anjo do Senhor esteja apertando-os’; the stylist, at'
             ' both — «O “que” parece iniciar uma oração relativa, deixando o segundo membro sem predicado principal» → ‘e que o anjo'
             ' do Senhor os aperte’. Both readers want the angel\'s action predicated inside the wish. Taken in the stylist\'s form:'
             ' the jussive with \'que\', which makes the wish audible and ends on a paroxytone; the Latinist\'s \'esteja apertando-os\''
             ' keeps the participle\'s aspect but ends again on \'-ando-os\' (rule 4) — it is option 2.')
d['options'] = [
    opt('e que o anjo do Senhor os aperte … os persiga', {'coarctans': 'os {coarctare_j}', 'persequens': 'os persiga', 'que56': 'e que'},
        'Ruling (draft 2): the stylist\'s jussive; the Latinist\'s predication.', 'stylist'),
    opt('esteja apertando-os … esteja perseguindo-os', {'coarctans': 'esteja {coarctare}-os', 'persequens': 'esteja perseguindo-os', 'que56': 'e'},
        'The Latinist: the participle with a copula; a weak cadence.', 'latinist'),
    opt('que os aperta … que os persegue', {'coarctans': 'que os {coarctare_r}', 'persequens': 'que os persegue', 'que56': 'e'},
        'Draft 1: a relative — refused by both readers (no predicate).', 'draft'),
    opt('apertando-os … perseguindo-os', {'coarctans': '{coarctare}-os', 'persequens': 'perseguindo-os', 'que56': 'e'},
        'The bare gerund; a weak cadence.', 'draft'),
]
V['34:5'] = 'Tornem-se como o pó diante da face do vento: * {que56} o anjo do Senhor {coarctans}.'
V['34:6'] = 'Torne-se o caminho deles trevas e {lubricum}: * {que56} o anjo do Senhor {persequens}.'

# 34:8 — the stylist: the long first colon and 'nele mesmo'
V['34:8'] = '{order8}: * e ele {inipsum}.'
add('order8', ['34:8'], 'Véniat illi láqueus, quem ignórat: et cáptio, quam abscóndit, apprehéndat eum', 'order',
    'Heard (draft 1): the stylist — «As retomadas de “ele” e a oração intercalada antes de “o apanhe” sobrecarregam um membro já'
    ' longo» → ‘Venha sobre ele o laço que desconhece, e o apanhe a armadilha que escondeu’. Taken: order and pronouns only (D2);'
    ' the verb before its subject in the second member, as in the first, and the Latin\'s colon kept.',
    [opt('Venha sobre ele o laço que desconhece: e o apanhe a armadilha que escondeu',
         {'order8': 'Venha sobre ele o laço que {ignorat}: e o {apprehendat} a {captio} que escondeu'}, 'Ruling (draft 2): the stylist.', 'stylist'),
     opt('Venha sobre ele o laço que ele desconhece: e a armadilha que ele escondeu o apanhe',
         {'order8': 'Venha sobre ele o laço que ele {ignorat}: e a {captio} que ele escondeu o {apprehendat}'}, 'Draft 1.', 'draft')])
d = D['inipsum']
d['why'] += (' Heard (draft 1): the stylist — «A retomada depois da vírgula soa como uma correção feita durante a leitura» → ‘nesse'
             ' mesmo laço’. Taken: the Latin repeats a preposition, not a word of sense; \'nesse mesmo\' keeps *ipsum*\'s emphasis'
             ' (grammar, D2). \'ele\' named as subject so that the line is heard as a new wish.')
front('inipsum', 1, 'Ruling (draft 2): the stylist (Douay-Rheims\'s build).', 'stylist')

# 34:11 — the Latinist (MAJOR): the participle
d = D['surgentes']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «O particípio presente, que acompanha a ação de interrogabant, tornou-se uma'
             ' afirmação independente no pretérito perfeito» → ‘Testemunhas iníquas, levantando-se’. Taken as the gerund at the head'
             ' (Douay-Rheims\'s order), which keeps \'iníquas\' at the mediant. The stylist called \'iníquas\' a proparoxytone at the'
             ' mediant — refused: i-NÍ-quas has one syllable after the stress.')
D['surgentes']['options'] = [
    opt('Levantando-se testemunhas iníquas', {'surgentes': 'Levantando-se testemunhas iníquas'},
        'Ruling (draft 2): the participle, at the Latinist\'s gate.', 'latinist'),
    opt('Levantaram-se testemunhas iníquas', {'surgentes': 'Levantaram-se testemunhas iníquas'},
        'Draft 1: a clause (Matos Soares 1932); the Latinist\'s major.', 'MS1932'),
    opt('Testemunhas iníquas, levantando-se', {'surgentes': 'Testemunhas iníquas, levantando-se'},
        'The Latinist\'s order; the mediant after \'-ando-se\'.', 'latinist'),
]
V['34:11'] = '{surgentes}, * interrogavam-me sobre o que eu {ignorabam}.'

# 34:14 — the stylist: order and the -ava rhyme
V['34:14'] = '{order14}.'
add('order14', ['34:14'], 'Quasi próximum, et quasi fratrem nostrum, sic complacébam: * quasi lugens et contristátus, sic humiliábar', 'order',
    'Heard (draft 1): the stylist — «Os complementos antecipados deixam “agradava” muito distante» and «A rima dos imperfeitos'
    ' domina os dois pousos» → ‘Assim eu agradava, como a um próximo e como a um irmão nosso: * assim me humilhava, como quem'
    ' está de luto e entristecido’. Taken: order only (D2) — the *sic* clause first in both members, the comparisons after; every'
    ' word stays. The rhyme at the cadences (the Latin\'s own, complacébam / humiliábar) moves inside the cola.',
    [opt('Assim eu agradava, como a um próximo …', {'order14': 'Assim eu agradava, como a um próximo, e como a um irmão nosso: * assim eu me humilhava, como quem {lugens}'},
         'Ruling (draft 2): the stylist.', 'stylist'),
     opt('Como a um próximo … assim eu agradava', {'order14': 'Como a um próximo, e como a um irmão nosso, assim eu agradava: * como quem {lugens}, assim eu me humilhava'},
         'Draft 1: the Latin\'s order.', 'draft')])

# 34:15 — the Latinist (minor): the perfect
d = D['ignorare']
d['why'] += (' Heard (draft 1): the Latinist, minor at 34:15 — «O imperfeito português … substitui o perfeito latino» → ‘e eu não'
             ' soube’. Taken: the perfect of coming to know (as 19:7a *agora soube*, the cognóscere row).')
d['options'].insert(0, opt('desconhece … desconhecia … não soube', {'ignorat': 'desconhece', 'ignorabam': 'desconhecia', 'ignoravi': 'não soube'},
                           'Ruling (draft 2): the Latinist\'s tense.', 'latinist'))
d['options'][1]['note'] = 'Draft 1: the imperfect at 34:15.'

# 34:16 — the stylist's worst line
d = D['dissipati']
d['why'] += (' Heard (draft 1): the stylist\'s worst line — «A repetição do auxiliar pesa … “Compungidos” exige um vocabulário pouco'
             ' corrente» → ‘Foram dispersos e não sentiram remorso’. Taken in part: the second \'foram\' goes (*nec compúncti* has'
             ' no verb of its own: the Latin\'s ellipsis). Refused in part: *sentir remorso* is another word; compúngi keeps its'
             ' passive participle (row, 29:13).')
D['dissipati']['options'][0]['forms'] = {'dissipati': 'Foram dispersos, e não compungidos'}
D['dissipati']['options'][0]['label'] = 'Foram dispersos, e não compungidos'
D['dissipati']['options'][0]['note'] = 'Ruling (draft 2): the row; the Latin\'s ellipsis (the stylist, in part).'
D['dissipati']['options'][1]['forms'] = {'dissipati': 'Foram dissipados, e não compungidos'}
D['dissipati']['options'].append(opt('Foram dispersos, e não foram compungidos', {'dissipati': 'Foram dispersos, e não foram compungidos'}, 'Draft 1.', 'draft'))
D['dissipati']['options'].append(opt('Foram dispersos e não sentiram remorso', {'dissipati': 'Foram dispersos e não sentiram remorso'}, 'The stylist: another word.', 'stylist'))
V['34:16'] = '{dissipati}, {tentaverunt}, {subsannatione}: * rangeram {superme16} os seus dentes.'

# 34:17 — the stylist: 'Restaurai … da maldade'
d = D['restitue']
d['why'] += (' Heard (draft 1): the stylist — «“restaurar da maldade” não exprime com clareza o movimento de restituição e'
             ' afastamento» → ‘Trazei de volta a minha alma’. Taken: it is restitúere\'s sense (give back, bring back from), safe at'
             ' the imperative (past *trouxe*), and it takes \'da\' naturally.')
d['options'].insert(0, opt('Trazei de volta', {'restitue': 'Trazei de volta'}, 'Ruling (draft 2): the stylist.', 'stylist'))
d['options'][1]['note'] = 'Draft 1: \'restaurar de\' has no current regency.'

# 34:18 — the Latinist (MAJOR): gravis
d = D['populo']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «Gravis tem aqui valor de grandeza ou força da coletividade; “grave” sugere'
             ' seriedade em português» → ‘num povo numeroso’. Taken: Lewis & Short gives gravis \'with respect to value or number,'
             ' heavy, great\' (read in the lexicon); the pair *ecclésia magna / pópulo gravi* is of size.')
front('populo', 1, 'Ruling (draft 2): the Latinist; L&S \'number, great\'.', 'latinist')

# 34:19 — the stylist: the long close of the first colon
V['34:19'] = 'Não se alegrem à minha custa os que {inique} se opõem a mim: * os que me odeiam sem motivo e {annuunt}.'
d = D['inique']
d['why'] += (' Heard (draft 1): the stylist — «A sequência de vogais em “se opõem a mim”, seguida do advérbio longo» → ‘os que'
             ' injustamente me combatem’. Taken in part: the adverb moves before the verb, so the colon ends on \'mim\'. Refused in'
             ' part: *combater* is expugnáre\'s (34:1) and adversári keeps *opor-se a* (row); the adverb itself is taken below, after the blind reader.')

# 34:21, 34:25 — Euge: the stylist heard 'Bem feito … à nossa alma' as a deserved punishment
d = D['euge']
d['why'] += (' Heard (draft 1): the stylist at 34:25 — «“Bem feito à nossa alma” soa como castigo merecido pela própria alma, em'
             ' vez de uma exclamação de satisfação» → ‘Que bom, que bom para a nossa alma’. Taken in both places (one decision):'
             ' \'Que bom\' is the exclamation of satisfaction the Latin\'s *euge* is, and takes the dative as \'para a nossa alma\'.')
d['options'].insert(0, opt('Que bom, que bom', {'euge21': 'Que bom, que bom', 'euge25': 'Que bom, que bom'}, 'Ruling (draft 2): the stylist.', 'stylist'))
d['options'][1]['note'] = 'Draft 1: heard as a deserved punishment at 34:25.'
V['34:25'] = 'Não digam nos seus corações: {euge25}, {nostrae}: * nem digam: Nós o devoramos.'
add('nostrae', ['34:25'], 'Euge, euge, ánimæ nostræ', 'grammar',
    'The dative *ánimæ nostræ* (τῇ ψυχῇ ἡμῶν): \'for our soul\', to its content. Draft 1 \'à nossa alma\'; with \'Que bom\' Portuguese'
    ' says \'para a nossa alma\' (the stylist).',
    [opt('para a nossa alma', {'nostrae': 'para a nossa alma'}, 'Ruling (draft 2).', 'stylist'),
     opt('à nossa alma', {'nostrae': 'à nossa alma'}, 'Draft 1.', 'draft')])

# 34:23 — refused: 'atendei à minha causa'
add('v23', ['34:23'], 'Deus meus, et Dóminus meus in causam meam', 'grammar',
    'The second colon has no verb: *inténde* of the first colon governs *in causam meam* too. Heard (draft 1): the stylist — «o'
    ' complemento fica longe demais do verbo» → ‘meu Deus e meu Senhor, atendei à minha causa’. Refused, kept as an option: the'
    ' Latin does not repeat the verb, and \'à minha causa\' after \'atendei ao meu juízo\' is heard as its second object (the'
    ' Latinist passed it).',
    [opt('à minha causa', {'v23': 'à minha causa'}, 'Ruling: the Latin\'s ellipsis.', 'draft'),
     opt('atendei à minha causa', {'v23': 'atendei à minha causa'}, 'The stylist: the verb repeated.', 'stylist')])
V['34:23'] = 'Levantai-vos e atendei ao meu juízo: * meu Deus e meu Senhor, {v23}.'

# 34:26 — refused: 'se alegram'
D['gratulantur']['why'] += (' Heard (draft 1): the stylist — «“Congratulam” traz uma solenidade de discurso cerimonial» → ‘se alegram'
                            ' com os meus males’. Refused: *alegrar-se* is lætári\'s, which this psalm has at 34:15 and 34:27, and'
                            ' supergaudére\'s at 34:19, 34:24; gratulári is a fourth verb. His word is option 2.')

# --- the blind reader (critic/v1.ambiguity.json) ---

# 34:4, 34:26, 34:26b — 'vexados' unknown twice
d = D['revereri']
d['why'] += (' Heard (draft 1): the blind reader listed \'vexados\' as unknown, at 34:4 and at 34:26 — the test failed. Draft 2 takes'
             ' *desonrar / desonra*: current, plainly a word of shame (public disgrace; ἐντροπή), free in the glossary (*desonra* was'
             ' only a stylist\'s option for oppróbrium, which took *afronta*), and it gives 34:26b \'Vistam-se de vergonha e de'
             ' desonra\'. The shade of *being abashed* is lost for that of *being disgraced*; the Latinist passed \'vexados\' and'
             ' reads the new word at the gate.')
d['options'].insert(0, opt('desonrados … desonrados … desonra', {'revereantur': 'desonrados', 'revereantur26': 'sejam desonrados', 'reverentia': 'de desonra'},
                           'Ruling (draft 2): known to the ear; a word of shame.', 'ambiguity'))
d['options'][1]['note'] = 'Draft 1: \'vexados\' unknown to the blind reader twice.'

# 34:10b — 'desvalido' and 'despojam' unknown
d = D['inops']
d['why'] += (' Heard (draft 1): the blind reader listed \'desvalido\' as unknown — the test failed, as *indigente* had three times.'
             ' Draft 2 tries *carente*: the everyday Brazilian word for the one who lacks (\'os carentes\'), apart from *necessitado*'
             ' (egénus) and *pobre* (pauper) in the same verse. Its colloquial sense \'needing affection\' is the risk; the row wants'
             ' a ruling, with this evidence.')
d['options'].insert(0, opt('carente', {'inops': 'carente'}, 'Ruling (draft 2): known; a test for the row.', 'ambiguity'))
d['options'][1]['note'] = 'Draft 1: MS1932\'s word; unknown to the blind reader.'
d = D['diripere']
d['why'] += (' Heard (draft 1): the blind reader listed \'despojam\' as unknown. Draft 2 \'saqueiam\': plunder, which is dirípere\'s'
             ' sense (tear apart, plunder), and known; said of a man it is the violence of the Latin.')
front('diripere', 2, 'Ruling (draft 2): plunder, known.', 'ambiguity')

# 34:16 — 'tentaram-me' heard as leading into sin
d = D['tentaverunt']
d['why'] += (' Heard (draft 1): the blind reader, first, \'Procuraram induzir-me ao pecado\' — the fault the tentáre row found at'
             ' 25:2. Men trying a man in the middle of insults are testing and provoking him; draft 2 takes \'puseram-me à prova\''
             ' (Matos Soares 1932). Proposal for the row: *pôr à prova* where men try the psalmist.')
front('tentaverunt', 1, 'Ruling (draft 2): heard rightly (the blind reader\'s own second reading).', 'MS1932')
D['tentaverunt']['options'][1]['note'] = 'Draft 1: heard as tempting to sin.'

# 34:19 — 'iniquamente' unknown (and the stylist's 'injustamente')
d = D['inique']
d['why'] += (' The blind reader listed \'iniquamente\' as unknown (as at 24:4), and the stylist wrote \'injustamente\'. Draft 2 takes'
             ' \'injustamente\' — ἀδίκως is the Greek of injustice, and the word is plain.')
front('inique', 1, 'Ruling (draft 2): two readers; the Greek ἀδίκως.', 'ambiguity')
D['inique']['options'][1]['note'] = 'Draft 1: iníquus\'s family (24:4); unknown to the blind reader.'

# 34:26 — 'congratulam' unknown (and ceremonial to the stylist)
d = D['gratulantur']
d['why'] += (' The blind reader listed \'congratulam\' as unknown. With the stylist that is two readers against it. Draft 2'
             ' \'festejam os meus males\': to celebrate — gratulári\'s joy made public, ἐπιχαίροντες — and still not lætári\'s'
             ' *alegrar-se*.')
d['options'].insert(0, opt('festejam', {'gratulantur': 'festejam'}, 'Ruling (draft 2): known; not lætári\'s verb.', 'ambiguity'))
d['options'][1]['note'] = 'Draft 1: unknown to the blind reader; ceremonial to the stylist.'
V['34:26'] = 'Corem e {revereantur26} juntos, * os que {gratulantur} os meus males.'
d['options'][1]['forms'] = {'gratulantur': 'se congratulam com'}
d['options'][2]['forms'] = {'gratulantur': 'se alegram com'}

AMBIGUITY_STEP = {
    'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
    'note': 'Draft 1. 39 items, 10 unknown words (vexados ×2, desvalido, despojam, iníquas, cilício, flagelos, compungidos, iniquamente, congratulam — five changed). Heard rightly or within the Latin\'s range: *Eu sou a tua salvação*, *pensam males* (plotting), *os aperta* (hem in), *nele mesmo* (the same snare), *esterilidade* (no fruit), *voltará ao meu seio* (all three readings the Latin holds), *flagelos* (calamities), *a minha única* (my one soul), *dos leões* (cruel enemies), *fazem sinais com os olhos*, *os nossos olhos viram* (gloating), *Julgai-me* (do me justice), *a paz do seu servo*.',
    'outcomes': [
        {'verse': '34:4', 'remark': '\'vexados\' unknown (also 34:26)', 'outcome': 'taken', 'decision': 'revereri'},
        {'verse': '34:10b', 'remark': '\'desvalido\' unknown', 'outcome': 'taken', 'decision': 'inops'},
        {'verse': '34:10b', 'remark': '\'despojam\' unknown', 'outcome': 'taken', 'decision': 'diripere'},
        {'verse': '34:11', 'remark': '\'iníquas\' unknown', 'outcome': 'refused', 'reason': 'iníquus → iníquo (glossary); 26:12b *testemunhas iníquas* is the same phrase (the Passiontide responsory).'},
        {'verse': '34:13', 'remark': '\'cilício\' unknown', 'outcome': 'refused', 'reason': 'The Latin\'s thing (cilícium, 68:12 too), kept apart from saccus → pano de saco; no plainer word names it.'},
        {'verse': '34:15', 'remark': '\'flagelos\' unknown', 'outcome': 'refused', 'reason': 'flagéllum → flagelo (glossary, 90:10, 31:10); heard as calamities, the Latin\'s sense.'},
        {'verse': '34:16', 'remark': '\'compungidos\' unknown', 'outcome': 'refused', 'decision': 'dissipati', 'reason': 'compúngi → the passive participle (row, 29:13); current in \'coração compungido\'.'},
        {'verse': '34:19', 'remark': '\'iniquamente\' unknown', 'outcome': 'taken', 'decision': 'inique'},
        {'verse': '34:26', 'remark': '\'congratulam\' unknown', 'outcome': 'taken', 'decision': 'gratulantur'},
        {'verse': '34:5', 'remark': '\'e o anjo do Senhor que os aperta\' heard as an unfinished description', 'outcome': 'taken', 'decision': 'participles'},
        {'verse': '34:6', 'remark': 'the same at \'que os persegue\'', 'outcome': 'taken', 'decision': 'participles'},
        {'verse': '34:16', 'remark': '\'tentaram-me\' heard first as leading into sin', 'outcome': 'taken', 'decision': 'tentaverunt'},
        {'verse': '34:18', 'remark': '\'num povo grave\' unclear (serious, or gravely ill)', 'outcome': 'taken', 'decision': 'populo'},
        {'verse': '34:25', 'remark': '\'Bem feito … à nossa alma\' heard as a deserved suffering', 'outcome': 'taken', 'decision': 'euge'},
        {'verse': '34:7', 'remark': '\'em vão afrontaram\' heard first as \'without success\'', 'outcome': 'refused', 'reason': 'supervácue → em vão (row; the row records the same two hearings at 24:4 and 30:7); the Latin\'s word holds both.'},
        {'verse': '34:4', 'remark': '\'buscam a minha alma\' heard first as the spiritual soul', 'outcome': 'refused', 'reason': 'ánima → alma (glossary; 53:5 *buscaram a minha alma*); the Latin\'s word.'},
        {'verse': '34:20', 'remark': '\'falando na ira da terra\' obscure', 'outcome': 'refused', 'reason': 'The Latin\'s own words (in iracúndia terræ; the Greek has no \'earth\'); not explained.'},
        {'verse': '34:28', 'remark': '\'a minha língua meditará\' suggests inward thought', 'outcome': 'refused', 'reason': 'meditári → meditar (glossary); the tongue that meditates is the Latin\'s (μελετήσει), and the reader heard the recitation too.'},
    ]}

REVISION_NOTE = ('ps034/revise_v2.py: 34:5–6 the jussive \'e que o anjo do Senhor os aperte / os persiga\' (Latinist MAJOR ×2, stylist, blind'
                 ' reader); 34:11 \'Levantando-se testemunhas iníquas\' (Latinist MAJOR); 34:18 \'num povo numeroso\' (Latinist MAJOR); 34:15'
                 ' \'e eu não soube\' (Latinist minor); 34:3 \'fechai a passagem aos\', 34:4b/20 \'pensar em\', 34:8 order and \'nesse mesmo'
                 ' laço\', 34:14 the sic-clauses first, 34:16 \'e não compungidos\', 34:17 \'Trazei de volta\', 34:19 the adverb first,'
                 ' 34:21/25 \'Que bom, que bom … para a nossa alma\' (the stylist); reveréri \'desonrados / desonra\', inops \'carente\','
                 ' dirípere \'saqueiam\', \'puseram-me à prova\', \'injustamente\', \'festejam\' (the blind reader). Refused with options:'
                 ' 34:23 \'atendei à minha causa\', 34:26 \'se alegram\'.')

audit = data['audit']
audit += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1. Four majors, one minor. «A tradução conserva, em geral, o conteúdo latino e suas imagens incomuns; os problemas identificados concentram-se na predicação, no tempo verbal e no sentido de gravi.» Passed \'vexados / vexame\', \'Voltem para trás\', \'a destruição do seu laço\', \'desvalido\', \'esterilidade para a minha alma\', \'voltará ao meu seio\', \'Que bom\' (as \'Bem feito\'), \'tentaram-me\', \'zombaram de mim com zombaria\', \'Restaurai\'.',
     'outcomes': [
         {'verse': '34:5', 'remark': 'MAJOR: the relative \'que os aperta\' does not predicate the angel\'s action → \'esteja apertando-os\'', 'outcome': 'taken', 'decision': 'participles',
          'reason': 'Taken in the stylist\'s form, the jussive \'e que o anjo do Senhor os aperte\' (his own form ends on \'-ando-os\'); his wording is option 2.'},
         {'verse': '34:6', 'remark': 'MAJOR: the same at \'que os persegue\' → \'esteja perseguindo-os\'', 'outcome': 'taken', 'decision': 'participles',
          'reason': 'As 34:5.'},
         {'verse': '34:11', 'remark': 'MAJOR: *Surgéntes* made a finite perfect → \'Testemunhas iníquas, levantando-se\'', 'outcome': 'taken', 'decision': 'surgentes',
          'reason': 'The gerund at the head, \'Levantando-se testemunhas iníquas\'; his order is option 3.'},
         {'verse': '34:15', 'remark': 'minor: \'não sabia\' for the perfect *ignorávi* → \'não soube\'', 'outcome': 'taken', 'decision': 'ignorare'},
         {'verse': '34:18', 'remark': 'MAJOR: \'num povo grave\' is seriousness; gravis is size/strength here → \'num povo numeroso\'', 'outcome': 'taken', 'decision': 'populo'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1. Fourteen remarks on thirteen verses; best 34:22, worst 34:16. «O ouvido tropeça principalmente nas regências calcadas no latim e nas orações que ficam suspensas depois da pausa.» Nine taken (four in part), one refused as wrong (a cadence), three refused with options.',
     'outcomes': [
         {'verse': '34:3', 'remark': '\'fechai a passagem contra\' a mixed regency → \'aos que me perseguem\'', 'outcome': 'taken', 'decision': 'conclude'},
         {'verse': '34:4b', 'remark': '\'pensam males\' a Latin regency → \'pensam em males\'', 'outcome': 'taken', 'decision': 'cogitare'},
         {'verse': '34:5', 'remark': 'the relative leaves the colon without a predicate → \'e que o anjo do Senhor os aperte\'', 'outcome': 'taken', 'decision': 'participles'},
         {'verse': '34:6', 'remark': 'the same → \'e que o anjo do Senhor os persiga\'', 'outcome': 'taken', 'decision': 'participles'},
         {'verse': '34:8', 'remark': 'the repeated \'ele\' and the inserted clause overload the colon → \'Venha sobre ele o laço que desconhece, e o apanhe a armadilha que escondeu\'', 'outcome': 'taken', 'decision': 'order8'},
         {'verse': '34:8', 'remark': '\'no laço, nele mesmo\' sounds like a correction → \'nesse mesmo laço\'', 'outcome': 'taken', 'decision': 'inipsum'},
         {'verse': '34:11', 'remark': '\'iníquas\' a proparoxytone at the mediant → \'Testemunhas iníquas se levantaram\'', 'outcome': 'refused', 'decision': 'surgentes',
          'reason': '\'iníquas\' is paroxytone (i-NÍ-quas); and his finite verb is what the Latinist marked major.'},
         {'verse': '34:14', 'remark': 'the complements far before \'agradava\'; the -ava rhyme at both pauses → the sic-clauses first', 'outcome': 'taken', 'decision': 'order14'},
         {'verse': '34:16', 'remark': 'worst line: the repeated auxiliary; \'compungidos\' uncommon → \'Foram dispersos e não sentiram remorso\'', 'outcome': 'taken', 'decision': 'dissipati',
          'reason': 'In part: the second \'foram\' dropped (the Latin\'s ellipsis); \'sentir remorso\' refused (another word; the compúngi row) — option 4.'},
         {'verse': '34:17', 'remark': '\'restaurar da maldade\' unclear → \'Trazei de volta a minha alma\'', 'outcome': 'taken', 'decision': 'restitue'},
         {'verse': '34:19', 'remark': 'vowel run \'se opõem a mim\' + long adverb → \'os que injustamente me combatem\'', 'outcome': 'taken', 'decision': 'inique',
          'reason': 'In part: the adverb moved before the verb; *combater* refused (expugnáre\'s, 34:1); the adverb \'injustamente\' is taken too, after the blind reader (decision inique).'},
         {'verse': '34:20', 'remark': '\'pensavam enganos\' not current → \'tramavam enganos\'', 'outcome': 'taken', 'decision': 'cogitare',
          'reason': 'In part: the glossary\'s regency \'pensavam em enganos\'; *tramar* is option 3 (it explains).'},
         {'verse': '34:23', 'remark': 'the complement too far from its verb → \'atendei à minha causa\'', 'outcome': 'option', 'decision': 'v23',
          'reason': 'The Latin does not repeat the verb; the ellipsis is heard as a second object.'},
         {'verse': '34:25', 'remark': '\'Bem feito … à nossa alma\' heard as a deserved punishment → \'Que bom, que bom para a nossa alma\'', 'outcome': 'taken', 'decision': 'euge'},
         {'verse': '34:26', 'remark': '\'se congratulam\' ceremonial → \'se alegram\'', 'outcome': 'option', 'decision': 'gratulantur',
          'reason': '*alegrar-se* is lætári\'s (34:15, 34:27) and supergaudére\'s; gratulári is a fourth verb.'}]},
    AMBIGUITY_STEP,
    {'step': 'revision', 'version': 2, 'note': REVISION_NOTE},
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written;', len(data['decisions']), 'decisions')
