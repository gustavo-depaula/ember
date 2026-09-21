"""Draft 13 of Ps 118 = draft 12 (118:1–128, untouched; kept as prayed.v12.json) + the first draft of
118:129–118:176 (Phe, Sade, Coph, Res, Sin, Tau) — with these the psalm is whole.

Run once from the repo root, on a prayed.json that is still version 12:
  python3.13 research/psalterium/ps118/append_v13.py
It adds the new verses, adds the new slots to the EXISTING term decisions (every option gets a form),
appends the new verse-local decisions, the choices and the audit step, and sets "range" to 118:1–118:176.
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 12:
    sys.exit(f"prayed.json is version {data['version']}, expected 12 — not touching it")
if not (here / 'prayed.v12.json').exists():
    sys.exit('prayed.v12.json is missing — copy prayed.json to it first')

verses = {
    '118:129': 'Maravilhosos são {t_acc}: * por isso a minha alma os {scr_perf}.',
    '118:130': '{declaratio} {s_gen} ilumina: * e dá {intellectum} {parvulis}.',
    '118:131': 'Abri a minha boca, {attraxi}: * porque eu desejava {m_acc}.',
    '118:132': 'Olhai para mim, e tende piedade de mim, * segundo o {jd_sg} dos que amam o vosso nome.',
    '118:133': '{dirige133} os meus passos {e_sec}: * e não me domine injustiça alguma.',
    '118:134': '{Redime134} das calúnias dos homens: * para que eu guarde {m_acc}.',
    '118:135': '{illumina135} sobre o vosso servo: * e ensinai-me {j_acc}.',
    '118:136': '{v136a}: * porque não guardaram a vossa lei.',
    '118:137': 'Vós sois justo, Senhor: * {v137b}.',
    '118:138': '{v138}.',
    '118:139': 'O meu zelo {tab139}: * porque os meus inimigos esqueceram as vossas palavras.',
    '118:140': '{e_Sg} {ignitum}: * e o vosso servo {e_pron} amou.',
    '118:141': 'Eu sou {adolescentulus} e desprezado: * não esqueci {j_acc}.',
    '118:142': 'A vossa justiça é justiça {aet}: * e a vossa lei é verdade.',
    '118:143': 'A tribulação e a angústia me encontraram: * {m_acc} são a minha meditação.',
    '118:144': '{t_Acc} são equidade {aet}: * dai-me {intellectum}, e viverei.',
    '118:145': 'Clamei de todo o meu coração, escutai-me, Senhor: * {requiram} {j_acc}.',
    '118:146': 'Clamei a vós, salvai-me: * para que eu guarde {m_acc}.',
    '118:147': '{Praeveni147} {maturitate}, e clamei: * porque {superspero} nas vossas palavras.',
    '118:148': 'Os meus olhos {praev148} {diluculo}: * para eu meditar {e_in}.',
    '118:149': '{audi149} segundo a vossa misericórdia, Senhor: * e {jd_sec} {vivifica}.',
    '118:150': 'Os que me perseguem aproximaram-se da iniquidade: * mas da vossa lei {longe150}.',
    '118:151': '{v151a}: * e todos os vossos caminhos são verdade.',
    '118:152': '{initio} conheci {de152}: * que os fundastes {aet}.',
    '118:153': 'Vede {hum_acc}, e {eripe}: * porque não esqueci a vossa lei.',
    '118:154': '{judica154}, e {redime154}: * {e_propter} {vivifica}.',
    '118:155': 'Longe dos pecadores está a salvação: * porque não {ex_perf3} {j_acc}.',
    '118:156': 'Muitas são as vossas misericórdias, Senhor: * {jd_sec} {vivifica}.',
    '118:157': 'Muitos são os que me perseguem e me atribulam: * não me apartei {t_gen}.',
    '118:158': 'Vi {prae158}, e eu {tab158}: * porque não guardaram {e_acc}.',
    '118:159': 'Vede que amei {m_acc}, Senhor: * na vossa misericórdia {vivifica}.',
    '118:160': 'O princípio das vossas palavras é verdade: * {v160b}.',
    '118:161': 'Os príncipes me perseguiram {gratis}: * {v161b}.',
    '118:162': 'Eu me alegrarei {e_com}: * como quem encontrou muitos despojos.',
    '118:163': '{odio163}, e a abominei: * mas amei a vossa lei.',
    '118:164': 'Sete vezes por dia {laudem_dixi}, * {jd_por} da vossa justiça.',
    '118:165': '{pax165} a vossa lei: * e não há para eles {scandalum}.',
    '118:166': '{exspect166} a vossa salvação, Senhor: * e amei {m_acc}.',
    '118:167': 'A minha alma guardou {t_acc}: * {vehementer167}.',
    '118:168': '{servavi} {m_acc} e {t_acc}: * porque todos os meus caminhos estão {consp}.',
    '118:169': 'Aproxime-se {deprecatio} {consp}, Senhor: * {e_juxta} dai-me {intellectum}.',
    '118:170': 'Entre {postulatio} {consp}: * {e_sec} {eripe}.',
    '118:171': '{v171a}, * quando me ensinardes {j_acc}.',
    '118:172': 'A minha língua pronunciará {e_sg}: * porque {m_all} são equidade.',
    '118:173': '{v173a}: * porque escolhi {m_acc}.',
    '118:174': '{conc174}, Senhor: * e a vossa lei é a minha meditação.',
    '118:175': 'A minha alma viverá, e vos louvará: * e {jd_acc} {adjuvabunt}.',
    '118:176': '{Erravi176} {periit}: * buscai o vosso servo, porque não esqueci {m_acc}.',
}
overlap = set(verses) & set(data['verses'])
if overlap:
    sys.exit(f'already present: {sorted(overlap)}')
data['verses'].update(verses)
data['range'] = '118:1–118:176'
data['version'] = 13
data['status'] = 'draft'

# ---------------------------------------------------------------- new slots in EXISTING decisions
byId = {d['id']: d for d in data['decisions']}


def extend(decisionId, refs, formsByLabel=None, latin=None, why=None):
    d = byId[decisionId]
    labels = [o['label'] for o in d['options']]
    if formsByLabel is not None:
        if set(labels) != set(formsByLabel):
            sys.exit(f'{decisionId}: options {labels} but forms given for {list(formsByLabel)}')
        for o in d['options']:
            clash = set(o['forms']) & set(formsByLabel[o['label']])
            if clash:
                sys.exit(f'{decisionId}: slot(s) {clash} already exist')
            o['forms'].update(formsByLabel[o['label']])
    d['refs'] += [r for r in refs if r not in d['refs']]
    if latin:
        d['latin'] += ' · ' + latin
    if why:
        d['why'] += ' ' + why


extend('justificationes', ['118:135', '118:141', '118:145', '118:155', '118:171'],
       why='118:129–176: five more places, all the accusative (the last, 118:171, after cum docúeris me).')
extend('testimonia', ['118:129', '118:138', '118:144', '118:152', '118:157', '118:167', '118:168'],
       {'testemunhos': {'t_Acc': 'Os vossos testemunhos'}, 'preceitos': {'t_Acc': 'Os vossos preceitos'}},
       latin='Ǽquitas testimónia tua (118:144) · de testimóniis tuis (118:152)',
       why='118:129–176: seven more places; one new form, the capital at the head of 118:144 (natural order: the Latin opens on the predicate, Ǽquitas).')
extend('mandata', ['118:131', '118:134', '118:143', '118:146', '118:159', '118:166', '118:168', '118:172', '118:173', '118:176'],
       why='118:129–176: ten more places, no new form. 118:134b = 118:146b (ut custódiam mandáta tua) and they are the same Portuguese colon. The last words of the psalm are this term: mandáta tua non sum oblítus.')
extend('judicia', ['118:132', '118:137', '118:149', '118:154', '118:156', '118:160', '118:164', '118:175'],
       {'juízos': {'jd_nom': 'o vosso juízo', 'jd_sec': 'segundo o vosso juízo'},
        'sentenças': {'jd_nom': 'o vosso juízo', 'jd_sec': 'segundo a vossa sentença'}},
       latin='secúndum judícium diligéntium (118:132) · rectum judícium tuum (118:137) · secúndum judícium tuum (118:149 = 118:156) · Júdica judícium meum (118:154)',
       why='118:129–176: eight more places, five of them the singular. secúndum judícium tuum vivífica me stands twice (118:149b, 156b) and is one Portuguese colon. Where the singular is a man\'s or is tied to an adjective (118:132, 137, 154) the option "sentenças" keeps "juízo", as it did for fácere judícium. 118:160 and 118:164 are the formula judícia justítiæ tuæ, identical with 118:7.')
extend('sermones', ['118:130'],
       {'palavras': {'s_gen': 'das vossas palavras'}, 'falas': {'s_gen': 'das vossas falas'}, 'ditos': {'s_gen': 'dos vossos ditos'}},
       latin='Declarátio sermónum tuórum (118:130)',
       why='118:130 is the last sermo of the psalm (D15: palavras). The three places of verba in this portion (118:139, 147, 160–161) are therefore the same Portuguese word, as D15 accepts.')
extend('eloquia', ['118:133', '118:140', '118:148', '118:154', '118:158', '118:162', '118:169', '118:170', '118:172'],
       {'ditos · o que dissestes': {'e_Sg': 'O que dissestes', 'e_pron': 'o', 'e_in': 'nos vossos ditos', 'e_propter': 'por causa do que dissestes', 'e_com': 'com os vossos ditos', 'e_juxta': '{juxta169} o que dissestes'},
        'ditos · o vosso dito': {'e_Sg': 'O vosso dito', 'e_pron': 'o', 'e_in': 'nos vossos ditos', 'e_propter': 'por causa do vosso dito', 'e_com': 'com os vossos ditos', 'e_juxta': '{juxta169} o vosso dito'},
        'promessas': {'e_Sg': 'A vossa promessa', 'e_pron': 'a', 'e_in': 'nas vossas promessas', 'e_propter': 'por causa da vossa promessa', 'e_com': 'com as vossas promessas', 'e_juxta': '{juxta169} a vossa promessa'},
        'falas': {'e_Sg': 'A vossa fala', 'e_pron': 'a', 'e_in': 'nas vossas falas', 'e_propter': 'por causa da vossa fala', 'e_com': 'com as vossas falas', 'e_juxta': '{juxta169} a vossa fala'},
        'palavras': {'e_Sg': 'A vossa palavra', 'e_pron': 'a', 'e_in': 'nas vossas palavras', 'e_propter': 'por causa da vossa palavra', 'e_com': 'com as vossas palavras', 'e_juxta': '{juxta169} a vossa palavra'}},
       latin='secúndum elóquium tuum (118:133, 170) · Ignítum elóquium tuum … diléxit illud (118:140) · ut meditárer elóquia tua (118:148) · propter elóquium tuum (118:154) · elóquia tua non custodiérunt (118:158) · super elóquia tua (118:162) · juxta elóquium tuum (118:169) · Pronuntiábit lingua mea elóquium tuum (118:172)',
       why='118:129–176 (nine places, under D16; the list checked with ps005/grep_latin.py: plural 118:148, 158, 162; singular 118:133, 140, 154, 169, 170, 172). Plural → "os vossos ditos" in three builds (meditar nos …, guardaram …, alegrar-se com …). Singular → the clause in all six places, none of which forces a noun: 118:133 and 118:170 are the formula (segundo o que dissestes); 118:172 is a plain object (pronunciará o que dissestes); 118:140 has it as SUBJECT with a predicate adjective and a pronoun pointing back (illud) — the clause carries both ("O que dissestes é muito ardente … o amou"), the adjective chosen without gender so that every option of this decision still agrees, the pronoun given its own form ({e_pron}); 118:154 and 118:169 put it after a preposition, where the handoff warned of care: propter IS cause, so "por causa do que dissestes" says what the Latin says, and juxta → "conforme o que dissestes" (decision "juxta169"). The Greek has λόγιον in eight of the nine and λόγον at 118:154; the Latin has elóquium there and the Latin is followed.')
extend('scrutantur', ['118:129'],
       {'sondam': {'scr_perf': 'sondou'}, 'perscrutam': {'scr_perf': 'perscrutou'}, 'esquadrinham': {'scr_perf': 'esquadrinhou'}, 'estudam': {'scr_perf': 'estudou'}},
       latin='ídeo scrutáta est ea ánima mea (118:129)')
extend('exquirere', ['118:145', '118:155'],
       {'procurar': {'ex_perf3': 'procuraram'}, 'buscar': {'ex_perf3': 'buscaram'}},
       latin='justificatiónes tuas non exquisiérunt (118:155) · justificatiónes tuas requíram (118:145: another Latin verb, the same Greek one — see decision "requiram")')
extend('mandasti', ['118:138'],
       {'mandastes': {'Mandasti138': 'Mandastes'}, 'ordenastes': {'Mandasti138': 'Ordenastes'}, 'destes ordem': {'Mandasti138': 'Destes por ordem'}},
       latin='Mandásti justítiam testimónia tua (118:138)',
       why='118:138 is the second mandásti of the psalm (ἐνετείλω both times) and takes the same verb as 118:4, as the glossary row mandáre foresaw; here there is no mandáta beside it, so the point is only that one Latin verb stays one.')
extend('vivifica', ['118:149', '118:154', '118:156', '118:159'], latin='vivífica me, four times in Coph–Res (118:149, 154, 156, 159)')
extend('intellectum', ['118:130', '118:144', '118:169'], latin='intelléctum dat párvulis (118:130) · intelléctum da mihi, et vivam (118:144) · da mihi intelléctum (118:169)')
extend('supersperavi', ['118:147'], latin='in verba tua supersperávi (118:147)')
extend('in_aeternum', ['118:142', '118:144', '118:152', '118:160'],
       latin='in ætérnum, four more times in Sade–Res (118:142, 144, 152, 160)',
       why='118:129–176 (D23): four more places, all through the slot {aet}, none at the head of a verse. In 118:142, 144 and 152 "para sempre" closes the colon, where the Latin has it or one word earlier; 118:160 opens its second colon with it, as the Latin does.')
extend('humilitate', ['118:153'],
       {'na minha humilhação': {'hum_acc': 'a minha humilhação'}, 'na minha humildade': {'hum_acc': 'a minha humildade'}, 'no meu abatimento': {'hum_acc': 'o meu abatimento'}},
       latin='Vide humilitátem meam (118:153)')
extend('praevaricantes', ['118:158'],
       {'Tive por transgressores': {'prae158': 'os transgressores'}, 'Tive por prevaricadores': {'prae158': 'os prevaricadores'}, 'Reputei como prevaricadores': {'prae158': 'os prevaricadores'}},
       latin='Vidi prævaricántes (118:158)')
extend('odio_habui', ['118:163'],
       {"tive ódio (the Latin's order)": {'odio163': 'À iniquidade tive ódio'}, 'odiei': {'odio163': 'Odiei a iniquidade'},
        'odiei todo caminho de iniquidade (118:128)': {'odio163': 'À iniquidade tive ódio'}, 'tive ódio (natural order)': {'odio163': 'Tive ódio à iniquidade'}},
       latin='Iniquitátem ódio hábui, et abominátus sum (118:163)',
       why='118:163 is the third ódio hábui, built like 118:113: object first, as the Latin (the handoff asked for it).')
extend('exspectare', ['118:166'],
       {'aguardar · pelo que aguardo': {'exspect166': 'Eu aguardava'}, 'aguardar · no que aguardo': {'exspect166': 'Eu aguardava'}, 'aguardar · expectativa': {'exspect166': 'Eu aguardava'},
        'esperar · pelo que espero': {'exspect166': 'Eu esperava'}, 'esperar · por minha esperança': {'exspect166': 'Eu esperava'}, 'aguardar · pela minha expectativa': {'exspect166': 'Eu aguardava'}},
       latin='Exspectábam salutáre tuum (118:166)',
       why='118:166 (D24: exspectáre → aguardar). "Eu" is said because the imperfect is the same in the first and third person.')
extend('fiat', ['118:173'],
       {'Seja': {'v173a': 'Seja a vossa mão para me salvar'}, "Que … seja (the stylist's lines)": {'v173a': 'Que a vossa mão seja para me salvar'}, 'Faça-se': {'v173a': 'Faça-se a vossa mão para me salvar'}},
       latin='Fiat manus tua ut salvet me (118:173)',
       why='118:173 is the third Fiat … ut of the psalm and is built as 118:76 (Seja … para), as the handoff set it. Douay-Rheims supplies "with me" and Matos Soares changes the verb ("Estende"); neither is followed.')
extend('concupivit', ['118:174'],
       {'ansiou por desejar': {'conc174': 'Ansiei pela vossa salvação'}, 'cobiçou desejar': {'conc174': 'Cobicei a vossa salvação'}},
       latin='Concupívi salutáre tuum (118:174)')
extend('adjuva', ['118:175'],
       {'auxiliar · auxílio': {'adjuvabunt': 'me auxiliarão'}, 'ajudar · ajuda': {'adjuvabunt': 'me ajudarão'}, 'auxiliar · auxiliador': {'adjuvabunt': 'me auxiliarão'}},
       latin='judícia tua adjuvábunt me (118:175)')
extend('erravi', ['118:176'],
       {'não me extraviei': {'Erravi176': 'Extraviei-me'}, 'não errei': {'Erravi176': 'Errei'}, 'não me desviei': {'Erravi176': 'Desviei-me'}},
       latin='Errávi, sicut ovis, quæ périit (118:176)',
       why='118:176 is the verse for which "extraviar-se" was chosen at 118:110: a sheep strays, it does not "make a mistake". The psalm\'s two erráre are now one verb.')

# ---------------------------------------------------------------- new verse-local decisions
new = [
    {
        'id': 'declaratio', 'refs': ['118:130'], 'latin': 'Declarátio sermónum tuórum illúminat', 'kind': 'word',
        'why': 'Lewis & Short cite this very verse: declarátio, "a making clear or evident, a disclosure, exposition" (de + clarus); the Greek is δήλωσις, a making manifest. The Portuguese cognate has lost that sense: "a declaração das vossas palavras" is heard as a statement made, or a statement OF the words, not as their being made clear. The question is which plain word still says "making clear".',
        'options': [
            {'label': 'A explicação', 'forms': {'declaratio': 'A explicação'}, 'note': 'Ruled. It is Lewis & Short\'s "exposition" and Matos Soares 1932\'s word ("A explicação das tuas palavras alumia"), so it stays inside D2\'s outer bound; it says what gives light — the words being opened. Cost: a classroom word, and it leaves the Latin\'s cognate.', 'from': 'MS1932'},
            {'label': 'A declaração', 'forms': {'declaratio': 'A declaração'}, 'note': 'The cognate, Douay-Rheims "The declaration of thy words". A reader crossing columns finds the same word; but in current Portuguese a declaração is an announcement or a formal statement.', 'from': 'DRB'},
            {'label': 'A manifestação', 'forms': {'declaratio': 'A manifestação'}, 'note': 'The Greek δήλωσις exactly; six syllables, and today first a street demonstration.', 'from': 'draft'},
        ],
    },
    {
        'id': 'parvulis', 'refs': ['118:130'], 'latin': 'et intelléctum dat párvulis', 'kind': 'word',
        'why': 'párvuli (νήπιοι): little ones, infants. The Latin names smallness, not simplicity of mind.',
        'options': [
            {'label': 'aos pequeninos', 'forms': {'parvulis': 'aos pequeninos'}, 'note': 'Ruled: Matos Soares 1932; Douay-Rheims "little ones". The diminutive is the Latin\'s own (parv-ulus).', 'from': 'MS1932'},
            {'label': 'aos pequenos', 'forms': {'parvulis': 'aos pequenos'}, 'note': 'Shorter by a syllable; loses the diminutive.', 'from': 'draft'},
            {'label': 'aos simples', 'forms': {'parvulis': 'aos simples'}, 'note': 'The Diurnal Monástico 1962 — the Hebrew\'s word, another meaning; shown only so that it can be refused knowingly.', 'from': 'DM1962'},
        ],
    },
    {
        'id': 'attraxi', 'refs': ['118:131'], 'latin': 'Os meum apérui, et attráxi spíritum', 'kind': 'ambiguity',
        'why': 'attráhere spíritum is to draw breath (Lewis & Short quote Pliny: "pulmo attrahens ac reddens animam"; Greek εἵλκυσα πνεῦμα): the open-mouthed gasp of longing. But spíritus is also "spirit", and a Latin ear hears both. Portuguese cannot: "espírito" is never breath. So the verse must choose which half to keep.',
        'options': [
            {'label': 'e aspirei o ar', 'forms': {'attraxi': 'e aspirei o ar'}, 'note': 'Ruled. The concrete image (rule 5): mouth opened, breath drawn in, because of desire. Both Vulgate-family versions read it bodily (Douay-Rheims "panted", Matos Soares "respirei", with a footnote: "Modo de dizer para indicar um desejo ardente"). "Aspirar" keeps the root of spíritus. Cost: the overtone "spirit" is lost.', 'from': 'draft'},
            {'label': 'e atraí o espírito', 'forms': {'attraxi': 'e atraí o espírito'}, 'note': 'The two cognates. Keeps the overtone and loses the breath: it will be heard as drawing the Holy Spirit in, which the Latin allows but does not say.', 'from': 'draft'},
            {'label': 'e respirei', 'forms': {'attraxi': 'e respirei'}, 'note': 'Matos Soares 1932. Plain; drops the object and the drawing-in.', 'from': 'MS1932'},
            {'label': 'e arquejei', 'forms': {'attraxi': 'e arquejei'}, 'note': 'Douay-Rheims "panted". Says the sense at once; a rarer verb, and no longer the Latin\'s two words.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'dirige133', 'refs': ['118:133'], 'latin': 'Gressus meos dírige', 'kind': 'glossary',
        'why': 'dirígere is "dirigir" in this psalm (118:5 sejam dirigidos, 118:128 eu era dirigido), but at the vós imperative the bare "Dirigi os meus passos" is also "I directed my steps" (rule 3, D13: the object is a noun, so no enclitic rescues it). The glossary\'s open row "dirígere at the vós imperative → endireitai" (from Ps 5:9) names this verse.',
        'options': [
            {'label': 'Endireitai', 'forms': {'dirige133': 'Endireitai'}, 'note': 'Ruled, following the open glossary row: the verb\'s first sense (to set straight), the Greek\'s (κατεύθυνον), of the family of diréctio → retidão (118:7); safe (past "endireitei"). Cost: the echo with 118:128 dirigébar (five verses back) is not heard.', 'from': 'glossary'},
            {'label': 'Encaminhai', 'forms': {'dirige133': 'Encaminhai'}, 'note': 'Matos Soares 1932 ("Encaminha os meus passos"). Natural and safe; leaves the "straight" of the verb.', 'from': 'MS1932'},
            {'label': 'Firmai', 'forms': {'dirige133': 'Firmai'}, 'note': 'The Diurnal Monástico 1962 — the Hebrew\'s verb; and "Firmai" is statúere\'s in this psalm (118:38).', 'from': 'DM1962'},
        ],
    },
    {
        'id': 'redime', 'refs': ['118:134', '118:154'], 'latin': 'Rédime me a calúmniis hóminum · et rédime me', 'kind': 'glossary',
        'why': 'redímere (λυτρόω) is not yet in the glossary; 26 verses of the psalter have the family (grep). The cognates fail rule 3 even with the enclitic: "Redimi-me" and "Remi-me" are also "I redeemed myself", a sentence a psalm could say (D13\'s exception does not reach them).',
        'options': [
            {'label': 'Resgatai-me', 'forms': {'Redime134': 'Resgatai-me', 'redime154': 'resgatai-me'}, 'note': 'Ruled: to buy back, which is redímere\'s and λυτρόω\'s own image; safe at the imperative (past "resgatei"); the Diurnal has it at 118:134. Proposed for the glossary (open), with redémptor → redentor and redémptio → redenção left to their cognates.', 'from': 'DM1962'},
            {'label': 'Redimi-me', 'forms': {'Redime134': 'Redimi-me', 'redime154': 'redimi-me'}, 'note': 'The cognate. Equal to "I redeemed myself"; shown for the record.', 'from': 'draft'},
            {'label': 'Livrai-me', 'forms': {'Redime134': 'Livrai-me', 'redime154': 'livrai-me'}, 'note': 'Matos Soares 1932 at 118:134 (and "liberta-me" at 154). It is liberáre\'s verb in the glossary, and drops the ransom.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'illumina135', 'refs': ['118:135'], 'latin': 'Fáciem tuam illúmina super servum tuum', 'kind': 'word',
        'why': 'The Latin uses illumináre twice in one stanza: 118:130 illúminat (the words give light) and here, transitively, "light up your face upon your servant". The Greek has two different verbs (φωτιεῖ / ἐπίφανον), so the repetition is the Latin\'s own making — and D2 keeps the Latin\'s repetitions.',
        'options': [
            {'label': 'Iluminai a vossa face', 'forms': {'illumina135': 'Iluminai a vossa face'}, 'note': 'Ruled: the Latin\'s verb, so that Phe says "ilumina … Iluminai" as the Latin says illúminat … illúmina. The Diurnal Monástico 1962 has the same build ("Ilumina, para o teu servidor a tua face"), so it has been prayed in Brazil. Safe (past "iluminei"). Cost: slightly strange, as the Latin is.', 'from': 'draft'},
            {'label': 'Fazei brilhar a vossa face', 'forms': {'illumina135': 'Fazei brilhar a vossa face'}, 'note': 'Douay-Rheims "Make thy face to shine" — the idiom the ear expects; it dissolves the stanza\'s repetition and spends "brilhar", which the glossary gives to illucéscere (117:26b).', 'from': 'DRB'},
            {'label': 'Fazei resplandecer a vossa face', 'forms': {'illumina135': 'Fazei resplandecer a vossa face'}, 'note': 'Near Matos Soares 1932 ("Faze que a luz do teu rosto reluza"); long.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'exitus', 'refs': ['118:136'], 'latin': 'Éxitus aquárum deduxérunt óculi mei', 'kind': 'word',
        'why': 'A bold figure, kept: the eyes "led down outlets of waters". éxitus is concretely an outlet, a place where water comes out (Lewis & Short "way of egress, outlet"); the phrase returns in 106:33, 35 (éxitus aquárum against a thirsty land), where it must be springs. Ps 1:3a already has decúrsus aquárum → cursos de água, another noun. dedúcere is "guiar" for deduc me (D22), but here it is bodily: to bring down. The subject of non custodiérunt is left as open as the Latin leaves it (the eyes, or "they").',
        'options': [
            {'label': 'Os meus olhos fizeram descer nascentes de água', 'forms': {'v136a': 'Os meus olhos fizeram descer nascentes de água'}, 'note': 'Ruled: "nascentes" is where water comes out — éxitus — and serves 106:33, 35; Douay-Rheims has "springs of water". "Fizeram descer" is de-dúcere; natural order, because with the Latin\'s order Portuguese cannot tell subject from object.', 'from': 'DRB'},
            {'label': 'Os meus olhos derramaram rios de água', 'forms': {'v136a': 'Os meus olhos derramaram rios de água'}, 'note': 'Near Matos Soares 1932 ("Rios de lágrimas derramaram os meus olhos", where "lágrimas" is his gloss). The ear\'s idiom; "rios" is flúmina\'s and "derramar" effúndere\'s.', 'from': 'MS1932'},
            {'label': 'Dos meus olhos desceram correntes de água', 'forms': {'v136a': 'Dos meus olhos desceram correntes de água'}, 'note': 'The Greek\'s intransitive build (κατέβησαν). Smooth; no longer the Latin\'s transitive verb.', 'from': 'draft'},
        ],
    },
    {
        'id': 'v137b', 'refs': ['118:137'], 'latin': 'et rectum judícium tuum', 'kind': 'order',
        'why': 'Copula supplied (D2). Only the order is in question.',
        'options': [
            {'label': 'e o vosso juízo é reto', 'forms': {'v137b': 'e {jd_nom} é reto'}, 'note': 'Ruled: natural order, parallel to the first colon (Vós sois justo … o vosso juízo é reto); Matos Soares 1932 "e o teu juízo é recto".', 'from': 'MS1932'},
            {'label': 'e reto é o vosso juízo', 'forms': {'v137b': 'e reto é {jd_nom}'}, 'note': 'The Latin\'s order, closing on the law-word.', 'from': 'draft'},
        ],
    },
    {
        'id': 'v138', 'refs': ['118:138'], 'latin': 'Mandásti justítiam testimónia tua: * et veritátem tuam nimis', 'kind': 'grammar',
        'why': 'The hardest syntax of the portion. Latin and Greek (ἐνετείλω δικαιοσύνην τὰ μαρτύριά σου καὶ ἀλήθειαν σφόδρα) both have a bare double accusative: "you commanded your testimonies — justice — and your truth, exceedingly". justítiam and veritátem tuam are predicates of testimónia: the testimonies were commanded AS justice and AS truth. Douay-Rheims leaves it bare ("Thou hast commanded justice thy testimonies: and thy truth exceedingly"); Matos Soares 1932 paraphrases beyond use ("Mandaste estreitamente a observância dos teus preceitos, como a tua suma verdade"). Portuguese needs one small word to mark a predicate accusative, and D2 allows grammar to be supplied.',
        'options': [
            {'label': 'Mandastes os vossos testemunhos como justiça … e como a vossa verdade', 'forms': {'v138': '{Mandasti138} {t_acc} como justiça: * e como a vossa verdade, {nimis138}'}, 'note': 'Ruled: "como" supplied twice and nothing else; every Latin word is there, in natural order; the asterisk falls where the Latin has it.', 'from': 'draft'},
            {'label': 'Mandastes a justiça, os vossos testemunhos … e a vossa verdade', 'forms': {'v138': '{Mandasti138} a justiça, {t_acc}: * e a vossa verdade, {nimis138}'}, 'note': 'The bare apposition, as Douay-Rheims: as opaque as the Latin, and in Portuguese it reads as a list of three things commanded.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'nimis138', 'refs': ['118:138'], 'latin': 'et veritátem tuam nimis', 'kind': 'word',
        'why': 'nimis (σφόδρα) has no one rendering in this psalm (glossary): 118:4 custodíri nimis → "à risca", 118:96 latum … nimis → "muito amplo". Here it closes the verse on its own, hanging between mandásti and veritátem as loosely as it does in the Latin. "Sobremaneira", the literal, was refused by the stylist and unknown to the blind reader at 118:96.',
        'options': [
            {'label': 'sem medida', 'forms': {'nimis138': 'sem medida'}, 'note': 'Ruled: Lewis & Short derive nimis from the root "to measure" and gloss it "beyond measure"; plain, paroxytone, and it can lean on the commanding or on the truth, as nimis does.', 'from': 'draft'},
            {'label': 'sobremaneira', 'forms': {'nimis138': 'sobremaneira'}, 'note': 'The dictionary word (Douay-Rheims "exceedingly"); refused by the stylist and listed as unknown by the blind reader at 118:96.', 'from': 'DRB'},
            {'label': 'com todo o rigor', 'forms': {'nimis138': 'com todo o rigor'}, 'note': 'Matos Soares 1932\'s reading ("estreitamente"): ties nimis to the commanding alone, which the Latin does not.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'tabescere', 'refs': ['118:139', '118:158'], 'latin': 'Tabéscere me fecit zelus meus · Vidi prævaricántes, et tabescébam', 'kind': 'glossary',
        'why': 'tabéscere: "to melt gradually … to waste, pine, or dwindle away" (Lewis & Short); Greek ἐκτήκω, to melt away. Twice in this portion and four times elsewhere (38:12, 106:26, 111:10, 138:21 — grep); 138:21 super inimícos tuos tabescébam is the near twin of 118:158. One verb for both places. 118:139 follows the Latin\'s zelus meus — the Greek has "the zeal of your house", which the Latin does not say here.',
        'options': [
            {'label': 'definhar', 'forms': {'tab139': 'me fez definhar', 'tab158': 'definhava'}, 'note': 'Ruled: Matos Soares 1932 ("fez-me definhar"); Douay-Rheims "pine away". The plain word for wasting away; serves all six verses.', 'from': 'MS1932'},
            {'label': 'consumir-se', 'forms': {'tab139': 'me consumiu', 'tab158': 'me consumia'}, 'note': 'Matos Soares at 118:158, the Diurnal at 118:139. Natural; but it is consúmere\'s verb, and drops "fecit".', 'from': 'DM1962'},
            {'label': 'derreter-se', 'forms': {'tab139': 'me fez derreter', 'tab158': 'me derretia'}, 'note': 'The first sense, and the Greek\'s image; in Brazil "derreter-se" by someone is to melt with fondness.', 'from': 'draft'},
        ],
    },
    {
        'id': 'ignitum', 'refs': ['118:140'], 'latin': 'Ignítum elóquium tuum veheménter', 'kind': 'word',
        'why': 'ignítus is "set on fire, made red-hot" (participle of ígnio); the Greek πεπυρωμένον is the same word and can also mean tried in the fire, which is how Douay-Rheims took it ("exceedingly refined"). The Latin psalter has another phrase for that (igne examinátum, 11:7, 17:31), so ignítum is translated as what it says: fiery. veheménter → "muito" (D22, open; σφόδρα). The adjective is chosen without gender because the subject is the term elóquium, whose options differ in gender (decision "eloquia").',
        'options': [
            {'label': 'é muito ardente', 'forms': {'ignitum': 'é muito ardente'}, 'note': 'Ruled: fire kept, plain, genderless, closes on a paroxytone. Near Matos Soares 1932 ("é chama ardente"). Cost: "ardente" is also said of a passionate speech.', 'from': 'draft'},
            {'label': 'é chama ardente', 'forms': {'ignitum': 'é chama ardente'}, 'note': 'Matos Soares 1932 word for word: a noun the Latin does not have, and veheménter goes unsaid.', 'from': 'MS1932'},
            {'label': 'é fogo muito vivo', 'forms': {'ignitum': 'é fogo muito vivo'}, 'note': 'Keeps "fire" as a noun and "very"; freer.', 'from': 'draft'},
        ],
    },
    {
        'id': 'adolescentulus', 'refs': ['118:141'], 'latin': 'Adolescéntulus sum ego et contémptus', 'kind': 'word',
        'why': 'The diminutive of the word of 118:9 (adolescéntior → "o jovem"). Lewis & Short: "a very young man" (Cicero calls himself so at 27); Greek νεώτερος. Asyndeton between the cola kept: the Latin has no "but" (Douay-Rheims and Matos Soares add one).',
        'options': [
            {'label': 'jovem', 'forms': {'adolescentulus': 'jovem'}, 'note': 'Ruled: the word of 118:9, plain. The diminutive goes unsaid.', 'from': 'draft'},
            {'label': 'muito jovem', 'forms': {'adolescentulus': 'muito jovem'}, 'note': 'Douay-Rheims "very young": says the diminutive; "muito" is heavy in a psalm that spends it on nimis and veheménter.', 'from': 'DRB'},
            {'label': 'pequeno', 'forms': {'adolescentulus': 'pequeno'}, 'note': 'Matos Soares 1932 ("pequeno e desprezível"): small rather than young — nearer the Hebrew.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'requiram', 'refs': ['118:145'], 'latin': 'justificatiónes tuas requíram', 'kind': 'glossary',
        'why': 'The glossary kept requírere apart from exquírere → procurar and quǽrere → buscar "until met". Met: the Greek is ἐκζητήσω — the very verb that stands behind exquírere all eight times in this psalm. So the Latin\'s requíram is a variation inside one Greek word, with no difference of sense (D15\'s test, as for sermo and perseveráre); and Portuguese has no plain third verb ("requerer" is to petition an office).',
        'options': [
            {'label': 'procurarei (one verb with exquírere)', 'forms': {'requiram': '{ex_fut}'}, 'note': 'Ruled: it follows the decision "exquirere", so that switching that term switches this verse too.', 'from': 'draft'},
            {'label': 'buscarei', 'forms': {'requiram': 'buscarei'}, 'note': 'Matos Soares 1932 ("buscarei"): merges it with quǽrere instead (118:176 quære).', 'from': 'MS1932'},
            {'label': 'irei em busca de', 'forms': {'requiram': 'irei em busca de'}, 'note': 'A third expression, to keep three Latin verbs three; longer, and "busca" is still quǽrere\'s root.', 'from': 'draft'},
        ],
    },
    {
        'id': 'praevenire', 'refs': ['118:147', '118:148'], 'latin': 'Prævéni in maturitáte, et clamávi · Prævenérunt óculi mei ad te dilúculo', 'kind': 'glossary',
        'why': 'prævenire (προφθάνω), to come before: twice at the head of neighbouring verses, so it must repeat. Intransitive in both; in 118:148 with ad te, which is the Latin\'s reading (the Greek has "toward dawn") and is followed. "Antecipar" is left to anticipáre, which the psalter also has (76:5 Anticipavérunt vigílias óculi mei; 78:8). Seven more verses have prævenire, several with a person as object (16:13, 58:10 misericórdia ejus prævéniet me, 87:14 orátio mea prævéniet te): those will need "vir ao encontro de" or the like, and are not settled here.',
        'options': [
            {'label': 'adiantar-se', 'forms': {'Praeveni147': 'Adiantei-me', 'praev148': 'se adiantaram para vós'}, 'note': 'Ruled: both "to be early" and "to move forward", so it serves the absolute use (Adiantei-me bem cedo) and the one with ad te (se adiantaram para vós). Narrative first person, so rule 3 is not in play.', 'from': 'draft'},
            {'label': 'antecipar-se', 'forms': {'Praeveni147': 'Antecipei-me', 'praev148': 'se anteciparam para vós'}, 'note': 'Matos Soares 1932 at 118:147 ("Eu me antecipei"). Spends anticipáre\'s cognate, and "antecipar-se a vós" would be heard as getting ahead of God.', 'from': 'MS1932'},
            {'label': 'chegar antes', 'forms': {'Praeveni147': 'Cheguei antes', 'praev148': 'chegaram antes a vós'}, 'note': 'The verb taken apart (præ-veníre). Plain; "antes" of what is left hanging.', 'from': 'draft'},
        ],
    },
    {
        'id': 'maturitate', 'refs': ['118:147'], 'latin': 'in maturitáte', 'kind': 'word',
        'why': 'Not "ripeness": matúrus is also "early", and Lewis & Short give matúritas a sense "promptness, expedition". The Greek is ἐν ἀωρίᾳ, at an untimely hour — before day. Douay-Rheims "the dawning of the day", Matos Soares 1932 "pela manhã".',
        'options': [
            {'label': 'bem cedo', 'forms': {'maturitate': 'bem cedo'}, 'note': 'Ruled: earliness is exactly what the Latin names, and the hour is left as unstated as the Latin leaves it (118:148 names it).', 'from': 'draft'},
            {'label': 'de madrugada', 'forms': {'maturitate': 'de madrugada'}, 'note': 'The hour the Greek means; more than the Latin word says, and 118:148 has the dawn.', 'from': 'draft'},
            {'label': 'pela manhã', 'forms': {'maturitate': 'pela manhã'}, 'note': 'Matos Soares 1932. Too late in the day for prævéni.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'diluculo', 'refs': ['118:148'], 'latin': 'dilúculo', 'kind': 'word',
        'why': 'dilúculum: "daybreak, dawn" (Lewis & Short). An ablative of time.',
        'options': [
            {'label': 'ao amanhecer', 'forms': {'diluculo': 'ao amanhecer'}, 'note': 'Ruled: the plain word; closes the colon on a stressed last syllable.', 'from': 'draft'},
            {'label': 'ao romper do dia', 'forms': {'diluculo': 'ao romper do dia'}, 'note': 'The idiom for daybreak; two syllables longer.', 'from': 'draft'},
            {'label': 'antes da aurora', 'forms': {'diluculo': 'antes da aurora'}, 'note': 'Matos Soares 1932 — it moves the "before" of prævenérunt into the noun.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'audi149', 'refs': ['118:149'], 'latin': 'Vocem meam audi', 'kind': 'glossary',
        'why': 'audíre → ouvir (D3), but the bare vós imperative "Ouvi a minha voz" is also "I heard my voice" (D1, D13). The glossary row audíre says: "never at the vós imperative — recast or use escutar there and note it." Cost named: exáudi me stands four verses earlier (118:145 → escutai-me), and the Greek keeps the two apart as the Latin does (ἐπάκουσον / ἄκουσον); here they become one verb.',
        'options': [
            {'label': 'Escutai a minha voz', 'forms': {'audi149': 'Escutai a minha voz'}, 'note': 'Ruled, as the glossary row directs. Natural; the imperative is kept, which the Latinist has twice called major when it was lost (117:19).', 'from': 'glossary'},
            {'label': 'Ouvi-me a voz', 'forms': {'audi149': 'Ouvi-me a voz'}, 'note': 'D13\'s exception: with the enclitic the first-person reading needs a reflexive nobody hears. Keeps audíre apart from exaudíre. Cost: the dative of possession is bookish in Brazil.', 'from': 'draft'},
            {'label': 'Ouvi a minha voz', 'forms': {'audi149': 'Ouvi a minha voz'}, 'note': 'The banned bare form (Matos Soares 1932 "Ouve a minha voz", with tu). Shown for the record only.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'longe150', 'refs': ['118:150'], 'latin': 'a lege autem tua longe facti sunt', 'kind': 'grammar',
        'why': 'Coph plays on near and far: Appropinquavérunt … longe facti sunt (118:150), Prope es tu (118:151), and Res answers with Longe a peccatóribus salus (118:155). "Longe" and "perto" are kept as words so that the play is heard. fíeri → fazer-se is open in the glossary and cannot serve here.',
        'options': [
            {'label': 'ficaram longe', 'forms': {'longe150': 'ficaram longe'}, 'note': 'Ruled: the adverb kept, the verb natural (as 118:83 factus sum → me tornei: a state come upon them).', 'from': 'draft'},
            {'label': 'se fizeram longe', 'forms': {'longe150': 'se fizeram longe'}, 'note': 'The glossary\'s fazer-se: not Portuguese with an adverb.', 'from': 'glossary'},
            {'label': 'se afastaram', 'forms': {'longe150': 'se afastaram'}, 'note': 'Near Matos Soares 1932 ("desviaram-se"). Loses "longe", and is discédere\'s verb (118:118).', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'v151a', 'refs': ['118:151'], 'latin': 'Prope es tu, Dómine', 'kind': 'order',
        'why': 'The Latin opens on Prope, answering 118:150\'s "drew near … far". Here the Latin\'s order is also good Portuguese.',
        'options': [
            {'label': 'Perto estais vós, Senhor', 'forms': {'v151a': 'Perto estais vós, Senhor'}, 'note': 'Ruled: the Latin\'s order; Matos Soares 1932 "Perto estás", without his gloss "(de mim)".', 'from': 'MS1932'},
            {'label': 'Vós estais perto, Senhor', 'forms': {'v151a': 'Vós estais perto, Senhor'}, 'note': 'Natural order; "perto" loses its place.', 'from': 'draft'},
        ],
    },
    {
        'id': 'initio', 'refs': ['118:152'], 'latin': 'Inítio cognóvi', 'kind': 'ambiguity',
        'why': 'An ablative of time: Lewis & Short "initio, in the beginning, at first"; Greek κατ᾽ ἀρχάς. Both Vulgate-family versions read "from the beginning" (Douay-Rheims; Matos Soares 1932 "desde o princípio"). "Início" is used, not "princípio", because 118:160 has Princípium and the Latin varies the two (the Greek does not: ἀρχάς / ἀρχή); Portuguese has the plain pair, so the variation costs nothing.',
        'options': [
            {'label': 'Desde o início', 'forms': {'initio': 'Desde o início'}, 'note': 'Ruled, with Douay-Rheims and Matos Soares. "No início conheci" would be heard as "at first I knew — and later did not", which the second colon (for ever) excludes.', 'from': 'DRB'},
            {'label': 'No início', 'forms': {'initio': 'No início'}, 'note': 'The bare ablative; see above for what the ear does with it.', 'from': 'draft'},
            {'label': 'Desde o princípio', 'forms': {'initio': 'Desde o princípio'}, 'note': 'Matos Soares 1932\'s noun: merges Inítio with 118:160 Princípium, as the Greek does.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'de152', 'refs': ['118:152'], 'latin': 'cognóvi de testimóniis tuis: quia …', 'kind': 'ambiguity',
        'why': 'de is open between "concerning" (Douay-Rheims, Matos Soares 1932 "Acerca dos") and "from" (the Greek ἐκ: the testimonies taught him). Portuguese "de" holds both, as the Latin does. quia → "que" (what he came to know).',
        'options': [
            {'label': 'dos vossos testemunhos', 'forms': {'de152': '{t_gen}'}, 'note': 'Ruled: as open as the Latin (D2).', 'from': 'draft'},
            {'label': 'acerca dos vossos testemunhos', 'forms': {'de152': 'acerca {t_gen}'}, 'note': 'Douay-Rheims and Matos Soares 1932: decides for "concerning".', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'eripe', 'refs': ['118:153', '118:170'], 'latin': 'Vide humilitátem meam, et éripe me · secúndum elóquium tuum éripe me', 'kind': 'glossary',
        'why': 'The glossary row erípere → arrancar is open; Ps 6:5 found it fails where no source is named ("arrancai a minha alma") and used libertar there, adding that with me as object arrancar "is untouched". Both places here have me and NO source: "e arrancai-me" asks at once "from what?", and the verse ends without saying. The row itself names the way out: "If one verb is wanted everywhere, libertar is the one that never fails."',
        'options': [
            {'label': 'libertai-me', 'forms': {'eripe': 'libertai-me'}, 'note': 'Ruled: the Diurnal\'s verb at 118:153 ("me liberta"), complete without a source; safe (past "libertei"); stays apart from liberáre → livrar. Evidence added to the glossary row: with me and no source, arrancar fails too.', 'from': 'glossary'},
            {'label': 'arrancai-me', 'forms': {'eripe': 'arrancai-me'}, 'note': 'The glossary\'s working verb: the violence of erípere kept, the sentence left hanging.', 'from': 'glossary'},
            {'label': 'livrai-me', 'forms': {'eripe': 'livrai-me'}, 'note': 'Matos Soares 1932 (both verses). It is liberáre\'s verb in the glossary.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'judica154', 'refs': ['118:154'], 'latin': 'Júdica judícium meum', 'kind': 'grammar',
        'why': 'A figura etymologica in Latin and in Greek (κρῖνον τὴν κρίσιν μου): "judge my judgment", i.e. take up my case. judícium is one of the psalm\'s eight law-words and is "juízo" in all its other 22 places; D2 keeps a repetition the Latin has (as 4:6 Sacrificai um sacrifício). "Julgai" is safe (past "julguei").',
        'options': [
            {'label': 'Julgai o meu juízo', 'forms': {'judica154': 'Julgai o meu {jd_sg}'}, 'note': 'Ruled: the Latin\'s two words of one root; Douay-Rheims "Judge my judgment". Cost: "o meu juízo" is first "my good sense" in Brazil — the blind reader is asked.', 'from': 'DRB'},
            {'label': 'Julgai a minha causa', 'forms': {'judica154': 'Julgai a minha causa'}, 'note': 'Matos Soares 1932: the sense at once; the law-word and the repetition are lost, and "causa" is another Latin word (42:1 discérne causam meam).', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'v160b', 'refs': ['118:160'], 'latin': 'in ætérnum ómnia judícia justítiæ tuæ', 'kind': 'grammar',
        'why': 'No verb in the Latin. The formula judícia justítiæ tuæ stays "os juízos da vossa justiça" (118:7). A copula is supplied as in 118:90 (D14\'s build: the adverb first, then the verb, the line closing on the noun).',
        'options': [
            {'label': 'para sempre são todos os juízos da vossa justiça', 'forms': {'v160b': '{aet} são {jd_all} da vossa justiça'}, 'note': 'Ruled: the Latin\'s order with a copula.', 'from': 'draft'},
            {'label': 'todos os juízos da vossa justiça são para sempre', 'forms': {'v160b': '{jd_all} da vossa justiça são {aet}'}, 'note': 'Natural order (Douay-Rheims, Matos Soares 1932 "são eternos").', 'from': 'DRB'},
            {'label': 'para sempre, todos os juízos da vossa justiça', 'forms': {'v160b': '{aet}, {jd_all} da vossa justiça'}, 'note': 'No copula, as the Latin.', 'from': 'draft'},
        ],
    },
    {
        'id': 'gratis', 'refs': ['118:161'], 'latin': 'persecúti sunt me gratis', 'kind': 'glossary',
        'why': 'gratis (δωρεάν): for nothing, without cause. Six verses (34:7, 34:19, 68:5 odérunt me gratis, 108:3, 118:161, 119:7 — grep). "De graça" is free of charge; "sem causa" is already sine causa\'s (3:8).',
        'options': [
            {'label': 'sem motivo', 'forms': {'gratis': 'sem motivo'}, 'note': 'Ruled: the Diurnal Monástico 1962\'s phrase; plain, paroxytone at the mediant, and it leaves "sem causa" to sine causa. Proposed for the glossary (open).', 'from': 'DM1962'},
            {'label': 'sem causa', 'forms': {'gratis': 'sem causa'}, 'note': 'Matos Soares 1932, Douay-Rheims "without cause": merges with sine causa.', 'from': 'MS1932'},
            {'label': 'gratuitamente', 'forms': {'gratis': 'gratuitamente'}, 'note': 'The cognate adverb; six syllables.', 'from': 'draft'},
        ],
    },
    {
        'id': 'formidavit', 'refs': ['118:161'], 'latin': 'et a verbis tuis formidávit cor meum', 'kind': 'word',
        'why': 'formidáre is stronger than timére → temer ("to fear, dread … be terrified", Lewis & Short; the Stoics, he notes, called formído a lasting fear). The same build, formidáre a, stands in 103:7 (a voce tonítrui tui formidábunt). Built as 118:120 a judíciis tuis tímui → "temi os vossos juízos": the thing feared as object.',
        'options': [
            {'label': 'e o meu coração teve pavor das vossas palavras', 'forms': {'v161b': 'e o meu coração teve pavor das vossas palavras'}, 'note': 'Ruled: a stronger word than "temer", natural order. The princes persecute, and what he dreads is God\'s words.', 'from': 'draft'},
            {'label': 'e o meu coração temeu as vossas palavras', 'forms': {'v161b': 'e o meu coração temeu as vossas palavras'}, 'note': 'Matos Soares 1932: merges formidáre with timére.', 'from': 'MS1932'},
            {'label': 'e das vossas palavras teve pavor o meu coração', 'forms': {'v161b': 'e das vossas palavras teve pavor o meu coração'}, 'note': 'The Latin\'s order, the words of God set first against the princes.', 'from': 'draft'},
        ],
    },
    {
        'id': 'laudem_dixi', 'refs': ['118:164'], 'latin': 'Sépties in die laudem dixi tibi', 'kind': 'grammar',
        'why': 'The Latin turns one Greek verb (ᾔνεσά σοι) into noun + light verb. The noun laus → louvor is kept; the light verb yields to Portuguese idiom, as in bonitátem fácere → usar de bondade (118:65).',
        'options': [
            {'label': 'vos dei louvor', 'forms': {'laudem_dixi': 'vos dei louvor'}, 'note': 'Ruled: noun kept, dative kept (vos), the idiomatic light verb.', 'from': 'draft'},
            {'label': 'vos disse louvor', 'forms': {'laudem_dixi': 'vos disse louvor'}, 'note': 'Word for word; "dizer louvor" is not said.', 'from': 'draft'},
            {'label': 'vos louvei', 'forms': {'laudem_dixi': 'vos louvei'}, 'note': 'The Greek\'s one verb; near Matos Soares 1932 ("te dirigi louvores").', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'pax165', 'refs': ['118:165'], 'latin': 'Pax multa diligéntibus legem tuam', 'kind': 'grammar',
        'why': 'A verbless dative of possession. Portuguese needs a verb or a preposition.',
        'options': [
            {'label': 'Muita paz têm os que amam', 'forms': {'pax165': 'Muita paz têm os que amam'}, 'note': 'Ruled: Douay-Rheims "Much peace have they that love"; the Latin\'s first words stay first.', 'from': 'DRB'},
            {'label': 'Muita paz para os que amam', 'forms': {'pax165': 'Muita paz para os que amam'}, 'note': 'Verbless as the Latin; reads as a wish rather than a statement.', 'from': 'draft'},
            {'label': 'Gozam de muita paz os que amam', 'forms': {'pax165': 'Gozam de muita paz os que amam'}, 'note': 'Matos Soares 1932 ("Gozam muita paz"): a verb of enjoyment the Latin does not have.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'scandalum', 'refs': ['118:165'], 'latin': 'et non est illis scándalum', 'kind': 'glossary',
        'why': 'Lewis & Short cite this verse: scándalum, "that which causes one to stumble, a stumbling-block". In Portuguese "escândalo" is a public outrage; "não há para eles escândalo" would say that nothing shocks them. Seven verses have the word (48:14, 49:20, 68:23, 105:35, 118:165, 139:6, 140:9 — grep), several beside láqueus → laço.',
        'options': [
            {'label': 'tropeço', 'forms': {'scandalum': 'tropeço'}, 'note': 'Ruled: the thing one stumbles on — the Latin\'s (and Greek\'s) image, plain and paroxytone; serves 139:6 (juxta iter scándalum posuérunt mihi). Proposed for the glossary (open).', 'from': 'draft'},
            {'label': 'escândalo', 'forms': {'scandalum': 'escândalo'}, 'note': 'The cognate (the Diurnal has it). Heard as public outrage; proparoxytone at the final cadence.', 'from': 'DM1962'},
            {'label': 'ocasião de queda', 'forms': {'scandalum': 'ocasião de queda'}, 'note': 'Matos Soares 1932: explains the image instead of giving it.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'vehementer167', 'refs': ['118:167'], 'latin': 'et diléxit ea veheménter', 'kind': 'glossary',
        'why': 'veheménter → "muito" (D22, open: valde and veheménter merged; σφόδρα). D22 notes this verse as one that "may want grandemente locally".',
        'options': [
            {'label': 'e os amou muito', 'forms': {'vehementer167': 'e os amou muito'}, 'note': 'Ruled: D22\'s word; plain; closes on a paroxytone.', 'from': 'glossary'},
            {'label': 'e os amou grandemente', 'forms': {'vehementer167': 'e os amou grandemente'}, 'note': 'Keeps veheménter apart from nimis and valde; found heavy by the stylist in Ps 6.', 'from': 'draft'},
            {'label': 'e ardentemente os amou', 'forms': {'vehementer167': 'e ardentemente os amou'}, 'note': 'Matos Soares 1932. Colours the adverb; and "ardente" is already spent on 118:140.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'servavi', 'refs': ['118:168'], 'latin': 'Servávi mandáta tua, et testimónia tua', 'kind': 'glossary',
        'why': 'custodívit (118:167) … Servávi (118:168): the Latin varies where the Greek repeats (ἐφύλαξεν / ἐφύλαξα). Unlike verbum / sermo, Portuguese has a plain, native pair here — guardar / observar — so the Latin\'s variation can be kept at no cost. serváre is rare (five verses: 11:8, 77:57, 88:29, 102:17, 118:168 — grep), and 11:8 sets it beside custodíre in one verse (servábis nos: et custódies nos), so it needs its own word anyway.',
        'options': [
            {'label': 'Observei', 'forms': {'servavi': 'Observei'}, 'note': 'Ruled: "observar os mandamentos" is native. Serves a law or covenant as object (77:57, 102:17); with persons (11:8) the psalm that meets it decides.', 'from': 'draft'},
            {'label': 'Guardei', 'forms': {'servavi': 'Guardei'}, 'note': 'Matos Soares 1932 and Douay-Rheims merge it with custodíre, as the Greek does.', 'from': 'MS1932'},
            {'label': 'Conservei', 'forms': {'servavi': 'Conservei'}, 'note': 'The cognate; one "conserva" things, not commandments.', 'from': 'draft'},
        ],
    },
    {
        'id': 'in_conspectu', 'refs': ['118:168', '118:169', '118:170'], 'latin': 'in conspéctu tuo, three verses running', 'kind': 'glossary',
        'why': 'The phrase closes Sin and opens Tau twice — a repetition the Latin makes and the Portuguese must make (rule 6). The glossary row conspéctus is open; Ps 5:9 proposed in conspéctu → "à vista de" and tried it on three verses, all of rest or judgment. Here two of the three have a verb of MOTION (Appropínquet … in conspéctu tuo; Intret … in conspéctu tuo): "Entre o meu pedido à vossa vista" is not Portuguese. One phrase must serve all three.',
        'options': [
            {'label': 'na vossa presença', 'forms': {'consp': 'na vossa presença'}, 'note': 'Ruled: serves rest and motion alike; Matos Soares 1932 has "à tua presença" in 118:169–170. Cost: the seeing in conspéctus goes unsaid. Evidence added to the glossary row: "à vista de" fails with verbs of motion.', 'from': 'MS1932'},
            {'label': 'à vossa vista', 'forms': {'consp': 'à vossa vista'}, 'note': 'The Ps 5:9 proposal. Excellent in 118:168 ("todos os meus caminhos estão à vossa vista"); forced in 118:169–170.', 'from': 'glossary'},
            {'label': 'diante de vós', 'forms': {'consp': 'diante de vós'}, 'note': 'The plainest (the Diurnal: "diante de Ti"). In Ps 5 it is already astáre tibi\'s phrase.', 'from': 'DM1962'},
        ],
    },
    {
        'id': 'deprecatio', 'refs': ['118:169'], 'latin': 'Appropínquet deprecátio mea', 'kind': 'glossary',
        'why': 'The glossary row deprecári / deprecátio is open: the verb is "suplicar" (118:58 Supliquei a vossa face); for the noun Ps 6:10 proposed "prece", because "súplica" is a proparoxytone and the noun stands at a cadence in 11 of its 14 verses. Here it is not at a cadence, so either could stand; one word through the psalter matters more than the echo with 118:58, 111 verses away.',
        'options': [
            {'label': 'a minha prece', 'forms': {'deprecatio': 'a minha prece'}, 'note': 'Ruled: the Ps 6 proposal followed, so that the noun is one word wherever it has been translated. Stays apart from orátio → oração and from postulátio (118:170).', 'from': 'glossary'},
            {'label': 'a minha súplica', 'forms': {'deprecatio': 'a minha súplica'}, 'note': 'The family of 118:58 (suplicar); Matos Soares 1932. If the row is ruled for "súplica", one touch.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'postulatio', 'refs': ['118:170'], 'latin': 'Intret postulátio mea', 'kind': 'word',
        'why': 'Lewis & Short cite this verse under postulátio, "a demand, request" (plural: "supplications"). The Greek is ἀξίωμα. The verb postuláre is "pedir" in the glossary (Ps 2:8 Pede-me).',
        'options': [
            {'label': 'o meu pedido', 'forms': {'postulatio': 'o meu pedido'}, 'note': 'Ruled: the noun of the glossary\'s verb; plain. Tau opens with two different nouns (prece … pedido), as the Latin does.', 'from': 'glossary'},
            {'label': 'a minha petição', 'forms': {'postulatio': 'a minha petição'}, 'note': 'Matos Soares 1932; Douay-Rheims "request". A lawyer\'s word today; kept free for petítio (19:6, 36:4, 105:15).', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'juxta169', 'refs': ['118:169'], 'latin': 'juxta elóquium tuum (118:169) against secúndum elóquium tuum (118:170)', 'kind': 'word',
        'why': 'Two neighbouring verses, one Greek phrase (κατὰ τὸ λόγιόν σου), two Latin prepositions. Portuguese has the plain pair conforme / segundo, so the Latin\'s variation is kept at no cost (as início / princípio in 118:152, 160). The form of the term itself is in decision "eloquia" (slot e_juxta).',
        'options': [
            {'label': 'conforme', 'forms': {'juxta169': 'conforme'}, 'note': 'Ruled: keeps juxta apart from secúndum → segundo.', 'from': 'draft'},
            {'label': 'segundo', 'forms': {'juxta169': 'segundo'}, 'note': 'Merges them, as the Greek, Douay-Rheims and Matos Soares 1932 do; makes 118:169b and 170b open alike.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'eructabunt', 'refs': ['118:171'], 'latin': 'Eructábunt lábia mea hymnum', 'kind': 'word',
        'why': 'eructáre is "to belch or vomit forth … to cast forth, emit" and in church Latin "to utter" (Lewis & Short); Greek ἐξερεύγομαι, to pour forth. The literal is impossible in prayer; the image to keep is of something that comes up and out in a gush, not a measured saying. Five verses (18:3 Dies diéi erúctat verbum, 44:2a Eructávit cor meum verbum bonum, 118:171, 143:13, 144:7 — grep).',
        'options': [
            {'label': 'Os meus lábios farão jorrar um hino', 'forms': {'v171a': 'Os meus lábios farão jorrar um hino'}, 'note': 'Ruled: the gush kept; tried on 44:2a ("O meu coração fez jorrar uma palavra boa") and 144:7 — it serves. Proposed for the glossary (open).', 'from': 'draft'},
            {'label': 'Os meus lábios proferirão um hino', 'forms': {'v171a': 'Os meus lábios proferirão um hino'}, 'note': 'Douay-Rheims "shall utter": the church-Latin sense, the image gone.', 'from': 'DRB'},
            {'label': 'Os meus lábios romperão num hino', 'forms': {'v171a': 'Os meus lábios romperão num hino'}, 'note': 'Matos Soares 1932: an outburst, intransitive; idiomatic.', 'from': 'MS1932'},
            {'label': 'Os meus lábios derramarão um hino', 'forms': {'v171a': 'Os meus lábios derramarão um hino'}, 'note': 'To pour out — but "derramar" will be wanted for effúndere (41:5, 61:9, 141:3).', 'from': 'draft'},
        ],
    },
    {
        'id': 'periit', 'refs': ['118:176'], 'latin': 'sicut ovis, quæ périit', 'kind': 'ambiguity',
        'why': 'The last verse of the psalm. períre is "perecer" in the glossary; but Latin períre is both to perish and to be lost (Greek ἀπολωλός, the same), and Portuguese "perecer" is only to die: "uma ovelha que pereceu" is a dead sheep, which no one can be asked to seek (quære servum tuum). Here the glossary word would say a wrong thing, not a strange one.',
        'options': [
            {'label': 'como uma ovelha que se perdeu', 'forms': {'periit': 'como uma ovelha que se perdeu'}, 'note': 'Ruled: the relative clause and the perfect kept (quæ périit); "perder-se" is the other half of períre, the half this verse means — Douay-Rheims "a sheep that is lost". It is of one root with pérdere, whose active form the glossary had to avoid for another reason (D24).', 'from': 'DRB'},
            {'label': 'como uma ovelha que pereceu', 'forms': {'periit': 'como uma ovelha que pereceu'}, 'note': 'The glossary verb: a dead sheep.', 'from': 'glossary'},
            {'label': 'como ovelha perdida', 'forms': {'periit': 'como ovelha perdida'}, 'note': 'The familiar phrase (the Diurnal: "como ovelha perdida"); a participle for the Latin\'s clause.', 'from': 'DM1962'},
            {'label': 'como uma ovelha que se desgarrou', 'forms': {'periit': 'como uma ovelha que se desgarrou'}, 'note': 'Matos Soares 1932: says straying twice (Errávi … desgarrou) where the Latin has two different verbs.', 'from': 'MS1932'},
        ],
    },
]
ids = {d['id'] for d in data['decisions']}
filled = set()
for d in data['decisions']:
    filled |= set(d['options'][0]['forms'])
for d in new:
    if d['id'] in ids:
        sys.exit(f"decision id {d['id']} already exists")
    keys = set(d['options'][0]['forms'])
    for o in d['options']:
        if set(o['forms']) != keys:
            sys.exit(f"{d['id']}: option {o['label']} has slots {set(o['forms'])}, expected {keys}")
    if keys & filled:
        sys.exit(f"{d['id']}: slot(s) {keys & filled} already filled by another decision")
    if all(v == '' for v in d['options'][0]['forms'].values()):
        sys.exit(f"{d['id']}: nothing to touch")
    filled |= keys
data['decisions'] += new

# every slot used in a new verse must be filled
import re  # noqa: E402

used = set()
for text in verses.values():
    used |= set(re.findall(r'\{(\w+)\}', text))
missing = used - filled
if missing:
    sys.exit(f'slots used but not filled: {sorted(missing)}')

# ---------------------------------------------------------------- choices
data['choices'].update({
    '118:129': 'Mirabília → "Maravilhosos" (glossary mirábilis → maravilhoso); copula supplied. ídeo → "por isso" (as 118:119). scrutáta est → "sondou", the psalm\'s verb (decision "scrutantur"); natural order, closing on the verb.',
    '118:130': 'Decisions "declaratio" and "parvulis"; sermónum tuórum → "das vossas palavras" (D15). illúminat absolute, as the Latin: no object supplied. intelléctum dat → "dá entendimento" (the term of Da mihi intelléctum).',
    '118:131': '"Abri" is a true first-person past here, so rule 3 is not in play. Decision "attraxi". "eu" before "desejava" because the imperfect is the same in first and third person, and "a minha boca" stands just before.',
    '118:132': 'Áspice in me → "Olhai para mim" (safe: past "olhei"); miserére mei → "tende piedade de mim" (glossary formula). secúndum judícium diligéntium nomen tuum is left as opaque as the Latin ("according to the judgment of those who love your name": the way you judge them, or their due); Matos Soares explains ("segundo é justo com"), which is not followed. "os que amam o vosso nome" as Ps 5:12b. The comma before the asterisk is the Latin\'s.',
    '118:133': 'Decision "dirige133". secúndum elóquium tuum → "segundo o que dissestes" (D16, the formula). Gressus → "passos". non … omnis → "não … alguma" (Matos Soares\' build); injustítia → "injustiça", apart from iníquitas → iniquidade (the Greek has ἀνομία; the Latin word is followed). dominári + genitive → "dominar" + object.',
    '118:134': 'Decision "redime". calúmniis → "calúnias" (the family of 118:121–122 caluniar; the Latin\'s word, not the Hebrew\'s "oppression"). The second colon is word for word 118:146b and is the same Portuguese there.',
    '118:135': 'Decision "illumina135". The second colon is the formula doce me justificatiónes tuas → "ensinai-me os vossos preceitos".',
    '118:136': 'Decision "exitus". The subject of non custodiérunt is not named, as in the Latin.',
    '118:137': 'Natural order in the first colon ("Vós sois justo, Senhor"); decision "v137b" for the second.',
    '118:138': 'Decisions "v138", "nimis138", and "mandasti" (the same verb as 118:4). One of the places where the verse is as hard in Latin as in Portuguese; nothing was smoothed beyond the two "como".',
    '118:139': 'Decision "tabescere". zelus meus: the Latin\'s reading, followed (the Greek has "the zeal of your house"). verba tua → "as vossas palavras". oblivísci → esquecer with a direct object, as throughout. Natural order.',
    '118:140': 'The singular elóquium as subject: D16\'s clause, "O que dissestes", with the pronoun illud → "o" carried by the decision "eloquia" so that every option agrees. Decision "ignitum". diléxit → "amou" (dilígere → amar).',
    '118:141': 'Decision "adolescentulus". contémptus → "desprezado" (glossary family). Formula non sum oblítus → "não esqueci", natural order. No "but" is added between the cola.',
    '118:142': 'Copula supplied twice. "justiça … justiça" as the Latin. in ætérnum → "para sempre" (D23). véritas → "verdade", bare, as in 118:86, 151, 160.',
    '118:143': 'Tribulátio → tribulação (glossary); inveníre → encontrar (also 118:162). Formula meditátio mea est → "são a minha meditação". Asyndeton kept.',
    '118:144': 'Natural order: the Latin opens on the predicate (Ǽquitas). ǽquitas → equidade (glossary). in ætérnum → "para sempre" (D23). The second colon is the formula "dai-me entendimento, e …" with et vivam → "e viverei" as in 118:116.',
    '118:145': 'in toto corde meo → "de todo o meu coração" (formula). exáudi me → "escutai-me" (D3). Decision "requiram".',
    '118:146': 'salvum me fac → "salvai-me" (glossary formula). Second colon = 118:134b.',
    '118:147': 'Decisions "praevenire", "maturitate". supersperávi → "pus toda a esperança" (the psalm\'s decision); in verba tua → "nas vossas palavras".',
    '118:148': 'Decisions "praevenire", "diluculo". ad te is the Latin\'s reading and is kept ("para vós"). ut meditárer → "para eu meditar": the first person kept, since the subject changes from the eyes to the speaker. meditári in → "meditar em"; elóquia → "os vossos ditos" (D16).',
    '118:149': 'Decision "audi149". "e segundo o vosso juízo vivificai-me" is one colon with 118:156b (the same Latin). Douay-Rheims has "according to thy mercy" twice in this verse; the Latin has judícium in the second colon and is followed.',
    '118:150': 'appropinquáre → aproximar-se (glossary); iniquitáti (dative) → "da iniquidade". Natural order in the first colon. Decision "longe150". autem → "mas".',
    '118:151': 'Decision "v151a". viæ tuæ: the Latin\'s reading (the Greek has "commandments"), followed. Copula supplied.',
    '118:152': 'Decisions "initio", "de152". fundásti → "fundastes", as 118:90. in ætérnum → "para sempre" (D23), closing the verse.',
    '118:153': 'Vide → "Vede" (safe: the past is "vi"). humilitátem → "humilhação" (the psalm\'s decision). Decision "eripe". Formula: "porque não esqueci a vossa lei".',
    '118:154': 'Decisions "judica154", "redime". propter → "por causa de" (glossary): after this preposition the clause "do que dissestes" is heard as cause — and here cause is what the Latin says. The Greek has λόγον, the Latin elóquium; the Latin is followed.',
    '118:155': 'Copula supplied ("está"). The Latin\'s order kept: "Longe" first, answering 118:150–151. exquisiérunt → "procuraram".',
    '118:156': 'Misericórdiæ, plural → "as vossas misericórdias": the Latin\'s word — NOT "compaixões", which is miseratiónes\' (118:77), though the Greek has οἰκτιρμοί here. Second colon = 118:149b without "e".',
    '118:157': 'Multi answers Multæ of 118:156: "Muitas são … Muitos são". tribuláre → atribular (glossary, Ps 3:2). declináre a → apartar-se de (formula). No "but" added.',
    '118:158': 'prævaricántes → "os transgressores" (the decision of 118:119). Decision "tabescere"; "eu" because "definhava" is first or third person. elóquia tua → "os vossos ditos" (D16), here of men who did not keep them.',
    '118:159': 'Vide quóniam → "Vede que". in misericórdia tua → "na vossa misericórdia": the Latin\'s in kept (118:88 and 149 have secúndum).',
    '118:160': 'Princípium → "O princípio": open between "beginning" and "principle / sum", as the Latin is. Copula supplied; "verdade" bare. Decision "v160b"; the formula judícia justítiæ tuæ as in 118:7.',
    '118:161': 'Decisions "gratis", "formidavit". verba → "palavras".',
    '118:162': 'Lætári → alegrar-se (glossary); super → "com". elóquia → "os vossos ditos" (D16). invénit is the perfect (DO\'s accent: invénit) → "encontrou". spólia multa → "muitos despojos" (Matos Soares).',
    '118:163': 'Decision "odio_habui" (object first, as 118:113). abominátus sum has no object in the Latin; the pronoun "a" is supplied, as Portuguese grammar needs. autem → "mas".',
    '118:164': 'in die → "por dia". Decision "laudem_dixi". super judícia justítiæ tuæ → "pelos juízos da vossa justiça": the formula, with super → "por" as ruled for 118:62. The comma before the asterisk is the Latin\'s.',
    '118:165': 'Decisions "pax165", "scandalum". non est illis → "não há para eles".',
    '118:166': 'exspectáre → aguardar (D24); salutáre → salvação (D6). The tenses differ in the Latin (imperfect, then perfect) and in the Portuguese.',
    '118:167': 'custodívit → "guardou"; ea → "os". Decision "vehementer167".',
    '118:168': 'Decisions "servavi", "in_conspectu". Copula supplied ("estão"). The Greek adds κύριε; the Latin does not.',
    '118:169': 'Appropínquet → "Aproxime-se" (glossary); decisions "deprecatio", "in_conspectu", "juxta169". The formula "dai-me entendimento" closes the verse, as the Latin.',
    '118:170': 'Intret → "Entre". Decisions "postulatio", "in_conspectu", "eripe". secúndum elóquium tuum → "segundo o que dissestes" (D16).',
    '118:171': 'Decision "eructabunt". cum docúeris → "quando me ensinardes" (future subjunctive for the Latin\'s future perfect). The comma before the asterisk is the Latin\'s.',
    '118:172': 'elóquium tuum as a plain object → "o que dissestes" (D16): the tongue will pronounce what God said. ómnia mandáta tua ǽquitas → "todos os vossos mandamentos são equidade" (copula supplied).',
    '118:173': 'Decision "fiat" (Seja … para, as 118:76). elégi → "escolhi", as 118:30.',
    '118:174': 'Decision "concupivit" (ansiar por, as 118:40). The second colon is the formula lex tua meditátio mea est.',
    '118:175': 'Vivet … laudábit → futures. adjuvábunt → "me auxiliarão" (decision "adjuva": one family with auxílio).',
    '118:176': 'The psalm\'s close. Errávi → "Extraviei-me" (chosen at 118:110 with this verse in mind); decision "periit"; quǽrere → "buscai" (glossary; safe: past "busquei") — kept apart to the end from exquírere → procurar. The last colon is long, as the Latin\'s is, and ends on the psalm\'s commonest law-word and its refrain: "não esqueci os vossos mandamentos".',
})

# ---------------------------------------------------------------- audit
data['audit'] += [
    {'step': 'draft', 'version': 13, 'note': 'Draft 13 = draft 12 (118:1–128, untouched, kept as prayed.v12.json) + the first draft of 118:129–176 (Phe, Sade, Coph, Res, Sin, Tau), by the fourth Ps 118 agent: the psalm is whole and "range" now reads 118:1–118:176. From the Latin, read with the Rahlfs Greek, Douay-Rheims and Matos Soares 1932 (the pdftotext layer in consult/parallels/ps118.md); the Diurnal Monástico 1962 for diction only; DO\'s Portuguese not consulted as a witness (D12). Lewis & Short looked up for declarátio, áttraho, tabésco, adulescéntulus, matúritas, dilúculum, formído, erúcto, postulátio, scándalum, nimis, éxitus — it cites three of these verses itself (118:130 declarátio, 118:165 scándalum, 118:170 postulátio). Verse lists checked with ps005/grep_latin.py. D15/D16/D23 vocabulary applied by adding slots to the existing term decisions (justificationes, testimonia, mandata, judicia, sermones, eloquia, scrutantur, exquirere, mandasti, vivifica, intellectum, supersperavi, in_aeternum, humilitate, praevaricantes, odio_habui, exspectare, fiat, concupivit, adjuva, erravi); 38 new verse-local decisions. elóquium: nine places (plural 118:148, 158, 162; singular 118:133, 140, 154, 169, 170, 172), the clause in all six singulars — none forced a noun. in ætérnum → para sempre at 118:142, 144, 152, 160 (D23). Where the Latin goes its own way against the Greek it is followed: 118:139 zelus meus (not "of your house"), 118:148 ad te, 118:151 viæ tuæ (not "commandments"), 118:154 elóquium (Greek λόγον), 118:156 misericórdiæ (Greek οἰκτιρμοί); and one slip in a witness: Douay-Rheims repeats "mercy" in 118:149b where the Latin has judícium. Variations the Latin makes inside one Greek word: merged where Portuguese has no plain pair (requíram with exquírere → procurar), kept where it has one (custodívit / Servávi → guardou / Observei; Inítio / Princípium → início / princípio; juxta / secúndum → conforme / segundo). Rule-3 traps met: "Dirigi" (118:133 → Endireitai), "Redimi-me" / "Remi-me" (also "I redeemed myself" → Resgatai-me), "Ouvi" (118:149 → Escutai, as the glossary row directs). Hard readings: 118:138 (double accusative), 118:131 attráxi spíritum, 118:136 Éxitus aquárum deduxérunt, 118:140 Ignítum, 118:147 in maturitáte, 118:176 quæ périit (perecer would make a dead sheep). The Hetzenauer print read is owed for these verses as for the rest.'},
]

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 13 written:', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
