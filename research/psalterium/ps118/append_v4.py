"""Draft 4 of Ps 118 = draft 3 (118:1–32, untouched) + the first draft of 118:33–118:80 (He, Vau, Zain, Heth, Teth, Jod).

Run once from the repo root, on a prayed.json that is still version 3 (prayed.v3.json is the kept copy):
  python3.13 research/psalterium/ps118/append_v4.py
It adds the new verses, adds the new slots to the EXISTING term decisions (every option gets a form),
appends the new decisions, choices and audit steps, and extends the handoff step.
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 3:
    sys.exit(f"prayed.json is version {data['version']}, expected 3 — not touching it")

verses = {
    '118:33': '{legem_pone} {j_gen}: * e o {ex_fut} sempre.',
    '118:34': 'Dai-me {intellectum}, e {scr_fut} a vossa lei: * e a guardarei de todo o meu coração.',
    '118:35': '{deduc} {semitam} {m_de}: * {ipsam}.',
    '118:36': 'Inclinai o meu coração para {t_acc}: * e não para a avareza.',
    '118:37': 'Desviai os meus olhos para que não vejam a vaidade: * no vosso caminho {vivifica}.',
    '118:38': '{statue} para o vosso servo {e_sg}, * no vosso temor.',
    '118:39': 'Cortai {opp_meum}, {suspicatus}: * porque {jd_acc} são {jucunda}.',
    '118:40': 'Eis que {concupivi}: * na vossa equidade {vivifica}.',
    '118:41': 'E venha sobre mim a vossa misericórdia, Senhor: * a vossa salvação {e_sec}.',
    '118:42': '{v42a}: * porque esperei {v42s}.',
    '118:43': 'E não tireis de todo da minha boca a palavra da verdade: * porque {superspero} {jd_in}.',
    '118:44': 'E guardarei sempre a vossa lei: * {saeculum44}.',
    '118:45': 'E eu andava na amplidão: * porque {ex_1sg} {m_acc}.',
    '118:46': 'E eu falava {t_in} diante dos reis: * e {confundebar}.',
    '118:47': 'E meditava {m_in}, * que eu amei.',
    '118:48': 'E levantei as minhas mãos para {m_acc}, que eu amei: * e {exerc_impf1} {j_in}.',
    '118:49': 'Lembrai-vos da vossa palavra ao vosso servo, * na qual me destes esperança.',
    '118:50': '{haec} me consolou {humilitate}: * porque {e_sg} {viv_perf}.',
    '118:51': 'Os soberbos agiam de todo iniquamente: * mas da vossa lei não me apartei.',
    '118:52': 'Lembrei-me {jd_gen} {a_saeculo}, Senhor: * e fui consolado.',
    '118:53': '{defectio}, * por causa dos pecadores que abandonam a vossa lei.',
    '118:54': '{cantabiles}, * no lugar da minha peregrinação.',
    '118:55': 'Lembrei-me de noite do vosso nome, Senhor: * e guardei a vossa lei.',
    '118:56': '{facta_est}: * porque {ex_1sg} {j_acc}.',
    '118:57': '{portio}.',
    '118:58': '{deprecatus} de todo o meu coração: * tende piedade de mim {e_sec}.',
    '118:59': 'Pensei nos meus caminhos: * e {converti} os meus pés para {t_acc}.',
    '118:60': '{paratus}: * para guardar {m_acc}.',
    '118:61': 'As cordas dos pecadores me {circumplexi}: * e não esqueci a vossa lei.',
    '118:62': 'À meia-noite eu me levantava para vos dar graças, * {jd_por} {justificationis}.',
    '118:63': '{part_a} todos os que vos temem: * {part_b} guardam {m_acc}.',
    '118:64': 'A terra está cheia, Senhor, da vossa misericórdia: * ensinai-me {j_acc}.',
    '118:65': '{bonitatem_fecisti} o vosso servo, Senhor, * segundo a vossa palavra.',
    '118:66': 'Ensinai-me a bondade, e a disciplina, e a ciência: * porque {credidi} {m_in}.',
    '118:67': 'Antes de ser humilhado, eu {deliqui}: * por isso guardei {e_sg}.',
    '118:68': 'Bom sois vós: * e na vossa bondade ensinai-me {j_acc}.',
    '118:69': 'A iniquidade dos soberbos multiplicou-se sobre mim: * mas eu, de todo o meu coração, {scr_fut} {m_acc}.',
    '118:70': 'O coração deles coalhou como leite: * eu, porém, meditei na vossa lei.',
    '118:71': '{bonum_quia}: * para que eu aprenda {j_acc}.',
    '118:72': 'Boa é para mim a lei da vossa boca, * mais que milhares de ouro e de prata.',
    '118:73': 'As vossas mãos me fizeram e me {plasmaverunt}: * dai-me {intellectum}, e aprenderei {m_acc}.',
    '118:74': 'Os que vos temem me verão e se alegrarão: * porque {superspero} nas vossas palavras.',
    '118:75': 'Conheci, Senhor, que {jd_acc} são equidade: * e na vossa verdade me humilhastes.',
    '118:76': '{fiat} a vossa misericórdia para me consolar, * {e_sec} ao vosso servo.',
    '118:77': 'Venham a mim {miserationes}, e viverei: * porque a vossa lei é a minha meditação.',
    '118:78': '{conf78} os soberbos, porque injustamente me fizeram iniquidade: * mas eu {exerc_fut} {m_in}.',
    '118:79': '{convertantur} para mim os que vos temem: * e os que conhecem {t_acc}.',
    '118:80': '{fiat} o meu coração {imm_sg} {j_in}, * {conf80}.',
}
overlap = set(verses) & set(data['verses'])
if overlap:
    sys.exit(f'already present: {sorted(overlap)}')
data['verses'].update(verses)
data['range'] = '118:1–118:80'
data['version'] = 4
data['status'] = 'draft'

# ---------------------------------------------------------------- new slots in EXISTING decisions
byId = {d['id']: d for d in data['decisions']}


def extend(decisionId, refs, formsByLabel, latin=None, why=None):
    d = byId[decisionId]
    labels = [o['label'] for o in d['options']]
    if set(labels) != set(formsByLabel):
        sys.exit(f'{decisionId}: options {labels} but forms given for {list(formsByLabel)}')
    for o in d['options']:
        o['forms'].update(formsByLabel[o['label']])
    d['refs'] += [r for r in refs if r not in d['refs']]
    if latin:
        d['latin'] += ' · ' + latin
    if why:
        d['why'] += ' ' + why


extend('justificationes', ['118:33', '118:48', '118:54', '118:56', '118:64', '118:68', '118:71', '118:80'],
       {'preceitos': {'j_Acc': 'Os vossos preceitos'}, 'decretos': {'j_Acc': 'Os vossos decretos'}, 'justificações': {'j_Acc': 'As vossas justificações'}},
       why='118:33–80 (eight more places) needs one new form, a capital at the head of 118:54. 118:62 judícia justificatiónis tuæ (singular) is NOT this term — see decision "justificationis".')
extend('testimonia', ['118:36', '118:46', '118:59', '118:79'],
       {'testemunhos': {'t_in': 'nos vossos testemunhos'}, 'preceitos': {'t_in': 'nos vossos preceitos'}},
       latin='in testimónia tua · in testimóniis tuis')
extend('mandata', ['118:35', '118:40', '118:45', '118:47', '118:48', '118:60', '118:63', '118:66', '118:69', '118:73', '118:78'],
       {'mandamentos': {'m_in': 'nos vossos mandamentos', 'm_por': 'pelos vossos mandamentos'},
        'preceitos': {'m_in': 'nos vossos preceitos', 'm_por': 'pelos vossos preceitos'}},
       latin='ad mandáta tua · mandátis tuis (dative)',
       why='118:33–80: eleven more places — three verses running close on it (118:47 before the asterisk, 118:45 and 118:48 nearby), as the Latin does.')
extend('judicia', ['118:39', '118:43', '118:52', '118:62', '118:75'],
       {'juízos': {'jd_in': 'nos vossos juízos', 'jd_gen': 'dos vossos juízos', 'jd_por': 'pelos juízos'},
        'sentenças': {'jd_in': 'nas vossas sentenças', 'jd_gen': 'das vossas sentenças', 'jd_por': 'pelas sentenças'}},
       latin='in judíciis tuis · judiciórum tuórum · super judícia')
extend('sermones', ['118:42'],
       {'palavras': {'s_in': 'nas vossas palavras'}, 'falas': {'s_in': 'nas vossas falas'}, 'ditos': {'s_in': 'nos vossos ditos'}},
       latin='in sermónibus tuis',
       why='118:42 is the verse that sets verbum beside sermónibus: it decides locally in decision "verbum_sermo", whose first option simply follows this one.')
extend('eloquia', ['118:38', '118:41', '118:50', '118:58', '118:67', '118:76'],
       {'ditos': {'e_sg': 'o vosso dito', 'e_sec': 'segundo o vosso dito'},
        'promessas': {'e_sg': 'a vossa promessa', 'e_sec': 'segundo a vossa promessa'},
        'falas': {'e_sg': 'a vossa fala', 'e_sec': 'segundo a vossa fala'},
        'palavras': {'e_sg': 'a vossa palavra', 'e_sec': 'segundo a vossa palavra'}},
       latin='elóquium tuum · secúndum elóquium tuum',
       why='118:33–80 is the test the study asked for: the singular, six times — three in the formula secúndum elóquium tuum (118:41, 58, 76), once established (118:38 Státue servo tuo elóquium tuum), once life-giving (118:50), once kept (118:67 elóquium tuum custodívi). What the readers heard is recorded in the audit steps of draft 4.')
extend('scrutantur', ['118:34', '118:69'],
       {'sondam': {'scr_fut': 'sondarei'}, 'perscrutam': {'scr_fut': 'perscrutarei'}, 'esquadrinham': {'scr_fut': 'esquadrinharei'}, 'estudam': {'scr_fut': 'estudarei'}},
       latin='scrutábor legem tuam · scrutábor mandáta tua')
extend('exquirere', ['118:33', '118:45', '118:56'],
       {'procurar': {'ex_fut': 'procurarei'}, 'buscar': {'ex_fut': 'buscarei'}},
       latin='exquíram eam · mandáta tua exquisívi · justificatiónes tuas exquisívi')
extend('confundi', ['118:46', '118:78', '118:80'],
       {'envergonhar': {'conf46': 'não era envergonhado', 'conf78': 'Sejam envergonhados', 'conf80': 'para eu não ser envergonhado'},
        'ser confundido / não me deixeis confundido': {'conf46': 'não era confundido', 'conf78': 'Sejam confundidos', 'conf80': 'para eu não ser confundido'},
        'ser confundido / não me confundais': {'conf46': 'não era confundido', 'conf78': 'Sejam confundidos', 'conf80': 'para eu não ser confundido'}},
       latin='non confundébar · Confundántur supérbi · ut non confúndar')
extend('exerceri', ['118:48', '118:78'],
       {'exercitar-se em': {'exerc_impf1': 'me exercitava'}, 'ocupar-se em': {'exerc_impf1': 'me ocupava'}, 'meditar': {'exerc_impf1': 'meditava'}},
       latin='exercébar · exercébor',
       why='118:47–48 again set meditábar and exercébar side by side.')
extend('vivifica', ['118:37', '118:40', '118:50'],
       {'vivificai-me': {'viv_perf': 'me vivificou'}, 'dai-me a vida': {'viv_perf': 'me deu a vida'}},
       latin='vivificávit me')
extend('immaculati', ['118:80'],
       {'os imaculados': {'imm_sg': 'imaculado'}, 'os sem mancha': {'imm_sg': 'sem mancha'}},
       latin='cor meum immaculátum')
extend('concupivit', ['118:40'],
       {'ansiou por desejar': {'concupivi': 'ansiei {m_por}'}, 'cobiçou desejar': {'concupivi': 'cobicei {m_acc}'}},
       latin='concupívi mandáta tua')
extend('opprobrium', ['118:39', '118:42'],
       {'a afronta': {'opp_meum': 'a minha afronta', 'exprobr': 'aos que me afrontam'},
        'o opróbrio': {'opp_meum': 'o meu opróbrio', 'exprobr': 'aos que me insultam'},
        'a desonra': {'opp_meum': 'a minha desonra', 'exprobr': 'aos que me desonram'}},
       latin='oppróbrium meum · exprobrántibus mihi',
       why='118:42 has the verb, exprobráre: with "afronta" it is "afrontar", as the first agent planned; with the other two nouns the verb has to leave the family.')

# ---------------------------------------------------------------- new decisions
new = [
    {
        'id': 'legem_pone', 'refs': ['118:33'], 'latin': 'Legem pone mihi, Dómine, viam justificatiónum tuárum', 'kind': 'word',
        'why': 'νομοθέτησόν με … τὴν ὁδόν: a double accusative — set the way of your precepts as a law for me. Douay-Rheims "Set before me for a law the way"; Matos Soares "Impõe-me por lei". The Hebrew-family "Ensina-me" (Diurnal Monástico) is another sense. The same phrase opens 26:11 (Legem pone mihi, Dómine, in via tua).',
        'options': [
            {'label': 'Ponde-me por lei, Senhor, o caminho', 'forms': {'legem_pone': 'Ponde-me por lei, Senhor, o caminho'}, 'note': 'Draft. pónere → pôr, the plain verb; "ponde" is safe under rule 3 (past "pus"). Lex stays the first noun heard, as in the Latin.', 'from': 'draft'},
            {'label': 'Imponde-me por lei, Senhor, o caminho', 'forms': {'legem_pone': 'Imponde-me por lei, Senhor, o caminho'}, 'note': 'Matos Soares 1932. More idiomatic with "por lei"; it is impónere, and harsher than the Latin.', 'from': 'MS1932'},
            {'label': 'Dai-me por lei, Senhor, o caminho', 'forms': {'legem_pone': 'Dai-me por lei, Senhor, o caminho'}, 'note': 'Softer and very sayable; "dar" is another verb (Da mihi intelléctum follows in the next verse).', 'from': 'draft'},
        ],
    },
    {
        'id': 'intellectum', 'refs': ['118:34', '118:73'], 'latin': 'Da mihi intelléctum', 'kind': 'glossary',
        'why': 'intelléctus six times in the psalm (118:34, 73, 125, 130, 144, 169 — da mihi intelléctum is a refrain of its own: 34, 73, 125, 144, 169). The Greek is the verb συνέτισόν με, the same verb the first agent rendered "Fazei-me entender" at 118:27.',
        'options': [
            {'label': 'entendimento', 'forms': {'intellectum': 'entendimento'}, 'note': 'Draft. Keeps one family with "Fazei-me entender" (118:27) and with intellígere → entender; plain, paroxytone. Also the name of the gift of the Spirit in Portuguese catechesis (unverified from memory; not relied on).', 'from': 'draft'},
            {'label': 'inteligência', 'forms': {'intellectum': 'inteligência'}, 'note': 'Matos Soares 1932 and the Diurnal Monástico alike ("Dá-me inteligência"). In Brazil today it is first IQ; and it breaks the family with 118:27.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'deduc', 'refs': ['118:35'], 'latin': 'Deduc me in sémitam', 'kind': 'glossary',
        'why': 'dedúcere (ὁδήγησον, guide along a way) is frequent: 5:9 Dómine, deduc me in justítia tua, 22:3 dedúxit me super sémitas justítiæ, 42:3, 60:4, 138:10. The cognate "conduzir" has the vós imperative "conduzi", which is also "I led" — and D13\'s exception for an enclitic does not rescue it, because "conduzi-me" is a real first person ("I behaved myself").',
        'options': [
            {'label': 'Guiai-me', 'forms': {'deduc': 'Guiai-me'}, 'note': 'Draft, with Matos Soares 1932 ("Guia-me"). Exactly ὁδηγέω; safe under rule 3 (past "guiei"); serves the perfects too (22:3 "guiou-me"). dirígere → dirigir stays apart.', 'from': 'MS1932'},
            {'label': 'Conduzi-me', 'forms': {'deduc': 'Conduzi-me'}, 'note': 'The cognate. Refused: rule 3, and the enclitic does not help here ("conduzi-me" = I conducted myself).', 'from': 'draft'},
            {'label': 'Levai-me', 'forms': {'deduc': 'Levai-me'}, 'note': 'Plainest, and safe; but leváre → levantar is near (118:48), and "levar" says nothing of showing the way.', 'from': 'draft'},
        ],
    },
    {
        'id': 'semita', 'refs': ['118:35'], 'latin': 'in sémitam mandatórum tuórum', 'kind': 'glossary',
        'why': 'sémita (τρίβος, a beaten track) — first met here; D15 rules "vereda". in + accusative: into the path (the Greek has ἐν, in the path; the Latin is followed).',
        'options': [
            {'label': 'à vereda', 'forms': {'semitam': 'à vereda'}, 'note': 'D15. Said aloud with "Guiai-me à vereda dos vossos mandamentos" it holds: paroxytone, plain, alive in Brazil.', 'from': 'glossary'},
            {'label': 'à senda', 'forms': {'semitam': 'à senda'}, 'note': 'Matos Soares 1932 ("pela senda"). Literary.', 'from': 'MS1932'},
            {'label': 'à trilha', 'forms': {'semitam': 'à trilha'}, 'note': 'The modern word for a beaten track; a hiking trail today.', 'from': 'draft'},
        ],
    },
    {
        'id': 'ipsam', 'refs': ['118:35'], 'latin': 'quia ipsam vólui', 'kind': 'grammar',
        'why': 'ipsam is emphatic: this very path is the one I wanted (ὅτι αὐτὴν ἠθέλησα). velle → querer, kept apart from desideráre → desejar (118:20) and concupíscere → ansiar por (118:40).',
        'options': [
            {'label': 'porque foi ela que eu quis', 'forms': {'ipsam': 'porque foi ela que eu quis'}, 'note': 'Draft. A cleft is how Portuguese stresses a pronoun; the perfect is kept.', 'from': 'draft'},
            {'label': 'porque essa mesma eu quis', 'forms': {'ipsam': 'porque essa mesma eu quis'}, 'note': 'Word for word with Douay-Rheims ("this same") and Matos Soares ("essa mesma desejei"); stiffer.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'statue', 'refs': ['118:38'], 'latin': 'Státue servo tuo elóquium tuum', 'kind': 'word',
        'why': 'statúere (στῆσον): make stand, set up — Douay-Rheims "Establish thy word to thy servant". It is the verb of 39:3 státuit super petram pedes meos and 118:106 Jurávi, et státui. The glossary has constitúere → estabelecer and confirmáre → confirmar (118:28), which should stay free.',
        'options': [
            {'label': 'Firmai', 'forms': {'statue': 'Firmai'}, 'note': 'Draft. The image of statúere (to make stand firm): 39:3 "firmou os meus pés sobre a pedra". Safe under rule 3 (past "firmei"). Cost: firmáre (e.g. 92:1 firmávit orbem terræ) will want the same word; the two Latin verbs are near enough that this is tolerable.', 'from': 'draft'},
            {'label': 'Estabelecei', 'forms': {'statue': 'Estabelecei'}, 'note': 'Douay-Rheims "Establish". It is constitúere\'s word in the glossary, and five syllables.', 'from': 'DRB'},
            {'label': 'Mantende', 'forms': {'statue': 'Mantende'}, 'note': 'To keep standing; reads the verse as "keep your word to your servant" — an interpretation (the Diurnal has "Cumpre", which under vós would also fail rule 3).', 'from': 'draft'},
        ],
    },
    {
        'id': 'suspicatus', 'refs': ['118:39'], 'latin': 'oppróbrium meum quod suspicátus sum', 'kind': 'word',
        'why': 'suspicári (ὑπώπτευσα): Lewis & Short "to mistrust, suspect", and transferred "to suspect, apprehend, surmise". Douay-Rheims "which I have apprehended"; Matos Soares and the Diurnal "que receio" (a present, with the Hebrew). The Latin perfect is kept.',
        'options': [
            {'label': 'que receei', 'forms': {'suspicatus': 'que receei'}, 'note': 'Draft. "recear" is to apprehend a thing that may come — the transferred sense of suspicári, and Douay-Rheims\' word. Kept apart from timére → temer.', 'from': 'DRB'},
            {'label': 'de que suspeitei', 'forms': {'suspicatus': 'de que suspeitei'}, 'note': 'The cognate. "A afronta de que suspeitei" is heard as an affront whose existence I suspected — possible, but the dread is gone.', 'from': 'draft'},
            {'label': 'que eu temia', 'forms': {'suspicatus': 'que eu temia'}, 'note': 'Plainest. It is timére\'s verb and an imperfect for a perfect.', 'from': 'draft'},
        ],
    },
    {
        'id': 'jucunda', 'refs': ['118:39'], 'latin': 'quia judícia tua jucúnda', 'kind': 'glossary',
        'why': 'jucúndus (χρηστά: good, kind) returns in 80:3 psaltérium jucúndum, 103:34 Jucúndum sit ei elóquium meum, 111:5 Jucúndus homo, 132:1 quam bonum et quam jucúndum, 146:1. "Jucundo" is a footnote word. A copula is supplied.',
        'options': [
            {'label': 'agradáveis', 'forms': {'jucunda': 'agradáveis'}, 'note': 'Draft. Plain, paroxytone, and it serves the other places ("quão bom e quão agradável", "seja-lhe agradável o meu dito").', 'from': 'draft'},
            {'label': 'suaves', 'forms': {'jucunda': 'suaves'}, 'note': 'Matos Soares 1932. It is suávis\' word (33:9 quóniam suávis est Dóminus; 118:103 Quam dúlcia).', 'from': 'MS1932'},
            {'label': 'deleitosos', 'forms': {'jucunda': 'deleitosos'}, 'note': 'Douay-Rheims "delightful". It belongs to delectáre → deleitar (118:14).', 'from': 'DRB'},
        ],
    },
    {
        'id': 'v42a', 'refs': ['118:42'], 'latin': 'Et respondébo exprobrántibus mihi verbum', 'kind': 'ambiguity',
        'why': 'verbum can be the object of respondébo (I shall answer a word — the usual reading of the Greek ἀποκριθήσομαι … λόγον, and Matos Soares\') or of exprobrántibus (those who cast a word at me — exprobráre alícui áliquid is regular Latin, and it is how Douay-Rheims read it: "them that reproach me in any thing"). The Latin order leaves it open; so does the Greek.',
        'options': [
            {'label': 'E responderei aos que me afrontam com uma palavra', 'forms': {'v42a': 'E responderei {exprobr} com {v42w}'}, 'note': 'Draft. "com uma palavra" hangs on either verb, as verbum does; "com" is the only thing supplied, and it is true to both constructions (answer with a word / affront with a word).', 'from': 'draft'},
            {'label': 'E responderei uma palavra aos que me afrontam', 'forms': {'v42a': 'E responderei {v42w} {exprobr}'}, 'note': 'Resolved with the Greek\'s usual reading. Clearer; closes what the Latin leaves open.', 'from': 'draft'},
        ],
    },
    {
        'id': 'verbum_sermo', 'refs': ['118:42'], 'latin': 'verbum … in sermónibus tuis', 'kind': 'glossary',
        'why': 'D15 merges verbum and sermo into "palavra(s)" and says the verses that set the two side by side decide locally. This is the one such verse in Ps 118. The Greek has one word twice (λόγον … λόγους); the Latin varies it.',
        'options': [
            {'label': 'uma palavra … nas vossas palavras', 'forms': {'v42w': 'uma palavra', 'v42s': '{s_in}'}, 'note': 'Ruled here: let the word repeat. It is what the Greek says, and the repetition carries the verse\'s point — I shall have a word for them because I hoped in your words. Any variation would have to be made with a word that has already been refused for sermo ("falas") or that belongs to elóquium ("ditos"). Cost: the Latin\'s variation is not heard; and both cola close on the same word, which the checker flags as an echo inside the verse.', 'from': 'draft'},
            {'label': 'uma palavra … nas vossas falas', 'forms': {'v42w': 'uma palavra', 'v42s': 'nas vossas falas'}, 'note': 'Keeps the Latin\'s variation in this one verse with the first agent\'s word for sermo, which D15 overruled on the stylist\'s three refusals. It would be the only "falas" in the psalm.', 'from': 'draft2'},
        ],
    },
    {
        'id': 'supersperavi', 'refs': ['118:43', '118:74'], 'latin': 'in judíciis tuis supersperávi · in verba tua supersperávi', 'kind': 'glossary',
        'why': 'supersperáre is the Latin\'s calque of ἐπελπίζω (to set one\'s hope upon); it is heard in Latin as hoping over and above. Five times, all in this psalm (118:43, 74, 81, 114, 147). It stands one verse after the simple sperávi (118:42 → "esperei"), so it needs to be more than "esperei". Douay-Rheims "hoped exceedingly"; Matos Soares varies ("confiei muito", "pus toda a minha esperança", "esperei firmemente").',
        'options': [
            {'label': 'esperei muito em', 'forms': {'superspero': 'esperei muito'}, 'note': 'Draft, with Douay-Rheims. The same verb as 118:42 with the Latin\'s super- as a plain adverb; the right length. Risk: "esperar muito" is also "to wait a long time" — the glossary already records that speráre in → esperar em is heard first as waiting.', 'from': 'DRB'},
            {'label': 'pus toda a minha esperança em', 'forms': {'superspero': 'pus toda a minha esperança'}, 'note': 'Matos Soares at 118:74. Unmistakable, and close to the Greek (set hope upon); four syllables longer and the verb sperávi / supersperávi is no longer one verb.', 'from': 'MS1932'},
            {'label': 'esperei firmemente em', 'forms': {'superspero': 'esperei firmemente'}, 'note': 'Matos Soares at 118:81. "Firmly" is not what super- says.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'saeculum44', 'refs': ['118:44'], 'latin': 'in sǽculum et in sǽculum sǽculi', 'kind': 'glossary',
        'why': 'The glossary has in sǽculum → para sempre and in sǽculum sǽculi → pelos séculos dos séculos; this verse joins them, after semper in the first colon. The Latin says sǽculum three times and semper once.',
        'options': [
            {'label': 'para sempre e pelos séculos dos séculos', 'forms': {'saeculum44': 'para sempre e pelos séculos dos séculos'}, 'note': 'Draft: the two glossary formulas, each as it is everywhere else. "sempre" is then heard twice in the verse (semper / in sǽculum) where the Latin has two words; to soften it semper is moved next to the verb ("E guardarei sempre a vossa lei"). The verse ends on a proparoxytone ("séculos"), as the Latin does (sǽculi) — the glossary formula, accepted.', 'from': 'glossary'},
            {'label': 'pelos séculos e pelos séculos dos séculos', 'forms': {'saeculum44': 'pelos séculos e pelos séculos dos séculos'}, 'note': 'Matos Soares 1932, word for word. Keeps the Latin\'s threefold sǽculum and leaves "sempre" to semper alone; departs from the glossary\'s in sǽculum → para sempre in this one place.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'confundebar', 'refs': ['118:46'], 'latin': 'et non confundébar', 'kind': 'ambiguity',
        'why': 'The Latin passive stands for a Greek middle (οὐκ ᾐσχυνόμην): "I was not put to shame" or "I was not ashamed". Before kings the second is the natural thought, and Douay-Rheims and Matos Soares both write it; the first is what the form says, and what D15\'s ruled rendering says.',
        'options': [
            {'label': 'não era envergonhado', 'forms': {'confundebar': '{conf46}'}, 'note': 'Draft: the psalm\'s one rendering of confúndi, in the imperfect the Latin has (follows decision "confundi").', 'from': 'glossary'},
            {'label': 'não me envergonhava', 'forms': {'confundebar': 'não me envergonhava'}, 'note': 'The middle sense, with Douay-Rheims ("and I was not ashamed") and Matos Soares. Same root, so the term is still heard; it narrows the Latin to the feeling.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'haec', 'refs': ['118:50'], 'latin': 'Hæc me consoláta est', 'kind': 'ambiguity',
        'why': 'Hæc is feminine: a Hebraism carried through the Greek (αὕτη) for "this thing" — but a Latin ear can also take it of spem, the hope just named in 118:49. Douay-Rheims "This", Matos Soares "Isto". (118:56 Hæc facta est mihi has the same feminine with no such antecedent.)',
        'options': [
            {'label': 'Isto', 'forms': {'haec': 'Isto'}, 'note': 'Draft. As open as the Latin: it can look back to the hope of 118:49 or forward to the quia-clause.', 'from': 'MS1932'},
            {'label': 'Esta', 'forms': {'haec': 'Esta'}, 'note': 'The Latin\'s gender; in Portuguese it can only be "a esperança" of the verse before — it closes the question.', 'from': 'draft'},
        ],
    },
    {
        'id': 'humilitate', 'refs': ['118:50'], 'latin': 'in humilitáte mea', 'kind': 'glossary',
        'why': 'humílitas (ταπείνωσις): low estate, affliction — 118:50, 92, 153; 9:14 and 24:18 vide humilitátem meam; and the Magnificat\'s respéxit humilitátem ancíllæ suæ. This portion has the verb three times (118:67 humiliárer, 71 and 75 humiliásti me → humilhar).',
        'options': [
            {'label': 'na minha humilhação', 'forms': {'humilitate': 'na minha humilhação'}, 'note': 'Draft. One family with humiliáre → humilhar, which the psalm itself sets beside it; and "vede a minha humilhação" (24:18) cannot be heard as boasting.', 'from': 'draft'},
            {'label': 'na minha humildade', 'forms': {'humilitate': 'na minha humildade'}, 'note': 'The cognate, and the traditional word of the Magnificat in Portuguese (from memory, unverified). Today it names the virtue: "consolou-me na minha humildade" is heard as self-praise.', 'from': 'draft'},
            {'label': 'no meu abatimento', 'forms': {'humilitate': 'no meu abatimento'}, 'note': 'Matos Soares 1932. Leaves the family.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'a_saeculo', 'refs': ['118:52'], 'latin': 'judiciórum tuórum a sǽculo', 'kind': 'ambiguity',
        'why': 'a sǽculo (ἀπ᾽ αἰῶνος): from of old. It can go with the judgments (your judgments of old — Douay-Rheims, the Diurnal) or with the remembering. It returns: 24:6 quæ a sǽculo sunt, 89:2 a sǽculo et usque in sǽculum tu es Deus, 92:2.',
        'options': [
            {'label': 'desde sempre', 'forms': {'a_saeculo': 'desde sempre'}, 'note': 'Draft. The mirror of in sǽculum → para sempre (89:2 "desde sempre e para sempre vós sois Deus"), and it hangs on either word as the Latin does.', 'from': 'draft'},
            {'label': 'de outrora', 'forms': {'a_saeculo': 'de outrora'}, 'note': 'The Diurnal Monástico ("das tuas sentenças de outrora"); Douay-Rheims "of old". Attaches it to the judgments only.', 'from': 'DM1962'},
            {'label': 'desde os séculos', 'forms': {'a_saeculo': 'desde os séculos'}, 'note': 'Keeps sǽculum audible (Matos Soares paraphrases "em todos os séculos").', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'defectio', 'refs': ['118:53'], 'latin': 'Deféctio ténuit me', 'kind': 'word',
        'why': 'deféctio (ἀθυμία, loss of heart): a failing, a fainting — the noun of defícere, which the psalm will use of the soul and the eyes (118:81, 82, 123 → desfalecer). ténuit: seized, held.',
        'options': [
            {'label': 'O desfalecimento me tomou', 'forms': {'defectio': 'O desfalecimento me tomou'}, 'note': 'Draft. The noun of "desfalecer", kept as a noun and as the subject, as in the Latin (Douay-Rheims "A fainting hath taken hold of me").', 'from': 'DRB'},
            {'label': 'O desânimo me tomou', 'forms': {'defectio': 'O desânimo me tomou'}, 'note': 'What the Greek says (ἀθυμία); shorter. It is the Greek\'s word, not the Latin\'s.', 'from': 'draft'},
            {'label': 'Desfaleci', 'forms': {'defectio': 'Desfaleci'}, 'note': 'Matos Soares 1932. The noun and its verb become one verb.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'cantabiles', 'refs': ['118:54'], 'latin': 'Cantábiles mihi erant justificatiónes tuæ', 'kind': 'word',
        'why': 'cantábilis (ψαλτά): Lewis & Short "worthy to be sung", citing this verse. Douay-Rheims "the subject of my song"; Matos Soares "dignas de ser cantadas por mim". The cognate "cantáveis" is also, under vós, "you were singing" (vós cantáveis).',
        'options': [
            {'label': 'eram para mim dignos de canto', 'forms': {'cantabiles': '{j_Acc} eram para mim dignos de canto'}, 'note': 'Draft. The -bilis adjective as Portuguese says it (laudábilis → digno de louvor); Matos Soares\' sense in half his length. Subject first (D2).', 'from': 'MS1932'},
            {'label': 'Cantáveis eram para mim', 'forms': {'cantabiles': 'Cantáveis eram para mim {j_acc}'}, 'note': 'The cognate, in the Latin\'s order. Refused as the text: the ear takes "cantáveis" for the verb (vós cantáveis) until "eram" corrects it.', 'from': 'draft'},
            {'label': 'eram cânticos para mim', 'forms': {'cantabiles': '{j_Acc} eram cânticos para mim'}, 'note': 'The Diurnal Monástico (from the Hebrew, which has a noun: songs). Beautiful and short; the Latin has an adjective.', 'from': 'DM1962'},
        ],
    },
    {
        'id': 'facta_est', 'refs': ['118:56'], 'latin': 'Hæc facta est mihi', 'kind': 'ambiguity',
        'why': 'αὕτη ἐγενήθη μοι: "this happened to me" (Douay-Rheims, Matos Soares) or "this became mine". The glossary has fíeri → fazer-se (open).',
        'options': [
            {'label': 'Isto me aconteceu', 'forms': {'facta_est': 'Isto me aconteceu'}, 'note': 'Draft, with Matos Soares 1932 word for word. Plain; "isto" is as undetermined as hæc. It leans to the event; the possessive reading is still possible ("this is what befell me").', 'from': 'MS1932'},
            {'label': 'Isto se fez para mim', 'forms': {'facta_est': 'Isto se fez para mim'}, 'note': 'The glossary verb, as open as the Latin; not something a Brazilian says.', 'from': 'glossary'},
            {'label': 'Isto me coube', 'forms': {'facta_est': 'Isto me coube'}, 'note': 'The possessive reading alone ("this fell to my share") — it would prepare 118:57 Pórtio mea; it closes the question.', 'from': 'draft'},
        ],
    },
    {
        'id': 'portio', 'refs': ['118:57'], 'latin': 'Pórtio mea, Dómine, * dixi custodíre legem tuam', 'kind': 'ambiguity',
        'why': 'Verbless and open in the Latin: either "You are my portion, Lord: I have said I would keep your law" (Douay-Rheims: "O Lord, my portion, I have said, I would keep the law") or "My portion, Lord, I have said, is to keep your law" (Matos Soares; the Greek μερίς μου κύριε εἶπα φυλάξασθαι is just as open). pórtio → porção, kept apart from pars → parte (15:5, 72:26).',
        'options': [
            {'label': 'A minha porção, Senhor, * eu disse: guardar a vossa lei', 'forms': {'portio': 'A minha porção, Senhor, * eu disse: guardar a vossa lei'}, 'note': 'Draft. As verbless as the Latin, so both readings stay: the infinitive after the colon is what was said, and "a minha porção" may be the Lord addressed or the thing resolved.', 'from': 'draft'},
            {'label': 'A minha porção, Senhor, * eu disse, é guardar a vossa lei', 'forms': {'portio': 'A minha porção, Senhor, * eu disse, é guardar a vossa lei'}, 'note': 'Matos Soares 1932: a copula, and the second reading alone.', 'from': 'MS1932'},
            {'label': 'Vós sois a minha porção, Senhor: * eu disse que guardaria a vossa lei', 'forms': {'portio': 'Vós sois a minha porção, Senhor: * eu disse que guardaria a vossa lei'}, 'note': 'The first reading alone (72:26 pars mea Deus in ætérnum stands behind it). Two things supplied, and the Latin comma before the asterisk becomes a colon.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'deprecatus', 'refs': ['118:58'], 'latin': 'Deprecátus sum fáciem tuam', 'kind': 'glossary',
        'why': 'deprecári (ἐδεήθην τοῦ προσώπου σου): to entreat — with the face as its object, a Hebraism the Latin keeps (44:13 vultum tuum deprecabúntur). The noun deprecátio is frequent and will want "súplica". Matos Soares dissolves the image ("Supliquei o teu favor").',
        'options': [
            {'label': 'Supliquei a vossa face', 'forms': {'deprecatus': 'Supliquei a vossa face'}, 'note': 'Draft. deprecári → suplicar (deprecátio → súplica), apart from oráre / orátio → oração; the face stays (glossary: fácies → face).', 'from': 'draft'},
            {'label': 'Implorei a vossa face', 'forms': {'deprecatus': 'Implorei a vossa face'}, 'note': 'Equally faithful, takes a direct object more naturally; the noun would then be "imploração", which nobody says.', 'from': 'draft'},
        ],
    },
    {
        'id': 'convertere', 'refs': ['118:59', '118:79'], 'latin': 'convérti pedes meos in · Convertántur mihi', 'kind': 'glossary',
        'why': 'convértere twice in the portion, once of the feet, once of persons; it is one of the psalter\'s great verbs (Convérte nos, Deus; 6:5 Convértere, Dómine; 125:1 In converténdo). "Converter" in Portuguese is first religious conversion.',
        'options': [
            {'label': 'voltar', 'forms': {'converti': 'voltei', 'convertantur': 'Voltem-se'}, 'note': 'Draft, with Matos Soares 1932 in both verses. Plain, physical, the same verb for feet and for people; safe at the vós imperative ("Voltai-vos", "Voltai").', 'from': 'MS1932'},
            {'label': 'converter', 'forms': {'converti': 'converti', 'convertantur': 'Convertam-se'}, 'note': 'The cognate. "Converti os meus pés" is odd, and "Convertam-se para mim" is heard as religious conversion to the psalmist.', 'from': 'draft'},
        ],
    },
    {
        'id': 'paratus', 'refs': ['118:60'], 'latin': 'Parátus sum, et non sum turbátus', 'kind': 'grammar',
        'why': 'Two perfect passives that are also states: "I am ready and am not troubled" (Douay-Rheims) or "I made myself ready and was not troubled" (the Greek aorists ἡτοιμάσθην καὶ οὐκ ἐταράχθην). paráre → preparar (glossary, Nunc dimittis).',
        'options': [
            {'label': 'Estou preparado, e não perturbado', 'forms': {'paratus': 'Estou preparado, e não perturbado'}, 'note': 'Draft, with Douay-Rheims. One "estou" serves both participles (the first check had the colon 4 over with two).', 'from': 'DRB'},
            {'label': 'Preparei-me, e não me perturbei', 'forms': {'paratus': 'Preparei-me, e não me perturbei'}, 'note': 'The event, as the Greek has it; two reflexives for two passives.', 'from': 'draft'},
            {'label': 'Estou pronto, e não me perturbo', 'forms': {'paratus': 'Estou pronto, e não me perturbo'}, 'note': 'The most natural; "pronto" leaves paráre → preparar, and the second verb changes voice.', 'from': 'draft'},
        ],
    },
    {
        'id': 'circumplexi', 'refs': ['118:61'], 'latin': 'Funes peccatórum circumpléxi sunt me', 'kind': 'word',
        'why': 'circumplécti (περιεπλάκησαν): to twine around, clasp about. The glossary keeps circumdáre → cercar and circuíre → rodear; this third verb of "around" wants its own word. funes → cordas, concrete.',
        'options': [
            {'label': 'envolveram', 'forms': {'circumplexi': 'envolveram'}, 'note': 'Draft. To wrap round; free in the glossary.', 'from': 'draft'},
            {'label': 'enlaçaram', 'forms': {'circumplexi': 'enlaçaram'}, 'note': 'Nearer the twining (plécti); it carries "laço", which the glossary gives to láqueus.', 'from': 'draft'},
            {'label': 'cingiram', 'forms': {'circumplexi': 'cingiram'}, 'note': 'Matos Soares 1932. It is cíngere\'s word (17:33 præcínxit me virtúte).', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'justificationis', 'refs': ['118:62'], 'latin': 'super judícia justificatiónis tuæ', 'kind': 'glossary',
        'why': 'The one singular justificátio of the psalm. It stands for κρίματα τῆς δικαιοσύνης σου — the very Greek phrase that is judícia justítiæ tuæ in 118:7, 106, 160, 164 — so it is not the term justificatiónes (δικαιώματα) and must not be "do vosso preceito" (words/ps118-terms.md §2, §5). But the Latin translator did write a different word here from the one he wrote in the other four places, and rule 6 cuts both ways: identical Latin identical, different Latin different.',
        'options': [
            {'label': 'da vossa justificação', 'forms': {'justificationis': 'da vossa justificação'}, 'note': 'Ruled. The abstract cognate, in the one place where it is right: Douay-Rheims "the judgments of thy justification". In the singular it is heard as God\'s act of doing justice, not as "excuses" (the fault of the plural). The reader crossing from the Latin column finds the Latin\'s own oddity, and 118:62 stays distinct from the formula "os juízos da vossa justiça". Oxytone at the close.', 'from': 'DRB'},
            {'label': 'da vossa justiça', 'forms': {'justificationis': 'da vossa justiça'}, 'note': 'What the Greek says, and the formula of 118:7 word for word (Matos Soares: "juízos cheios de justiça"). Plainer. It erases a variation the Latin makes and follows the Greek against the Latin\'s word.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'particeps', 'refs': ['118:63'], 'latin': 'Párticeps ego sum ómnium timéntium te: * et custodiéntium mandáta tua', 'kind': 'word',
        'why': 'párticeps (μέτοχος): one who takes part with — partem cápiens. Douay-Rheims "a partaker with", Matos Soares "associado de", the Diurnal "Aliado".',
        'options': [
            {'label': 'Eu tenho parte com … e com os que', 'forms': {'part_a': 'Eu tenho parte com', 'part_b': 'e com os que'}, 'note': 'Draft. The word taken apart as Portuguese says it ("ter parte com alguém" is biblical Portuguese — from memory, John 13:8; unverified); ego kept as "Eu".', 'from': 'draft'},
            {'label': 'Eu sou companheiro de … e dos que', 'forms': {'part_a': 'Eu sou companheiro de', 'part_b': 'e dos que'}, 'note': 'A noun for the noun, and the genitives kept; "companheiro" is another image (bread), and sócius will want it.', 'from': 'draft'},
            {'label': 'Eu sou participante de … e dos que', 'forms': {'part_a': 'Eu sou participante de', 'part_b': 'e dos que'}, 'note': 'The cognate (Douay-Rheims "partaker"). One is "participante" of an event, not of people.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'bonitatem_fecisti', 'refs': ['118:65'], 'latin': 'Bonitátem fecísti cum servo tuo', 'kind': 'grammar',
        'why': 'χρηστότητα ἐποίησας μετά: a Hebraism — "you have done goodness with your servant". The stanza Teth opens five of its eight verses on bon- (Bonitátem, Bonitátem, Bonus, Bonum, Bonum); the noun bondade is kept in 118:65, 66 and 68 so that the run is heard.',
        'options': [
            {'label': 'Usastes de bondade com', 'forms': {'bonitatem_fecisti': 'Usastes de bondade com'}, 'note': 'Draft, from Matos Soares 1932 ("tens usado de bondade com"). The noun stays; only the light verb yields to the idiom (D2 — as fácere virtútem → agir com poder in Ps 117). The perfect is kept.', 'from': 'MS1932'},
            {'label': 'Fizestes bondade com', 'forms': {'bonitatem_fecisti': 'Fizestes bondade com'}, 'note': 'Word for word. Understood, not said.', 'from': 'draft'},
            {'label': 'Fizestes o bem ao', 'forms': {'bonitatem_fecisti': 'Fizestes o bem ao'}, 'note': 'Douay-Rheims "Thou hast done well with". Natural; spends "bem" (bonum, 118:71–72) on bónitas.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'credidi', 'refs': ['118:66'], 'latin': 'quia mandátis tuis crédidi', 'kind': 'word',
        'why': 'crédere with a dative: I have believed your commandments (ταῖς ἐντολαῖς σου ἐπίστευσα). The verb returns at 115:1 Crédidi, propter quod locútus sum.',
        'options': [
            {'label': 'acreditei', 'forms': {'credidi': 'acreditei'}, 'note': 'Draft. The current verb; the colon runs 3 over.', 'from': 'draft'},
            {'label': 'cri', 'forms': {'credidi': 'cri'}, 'note': 'The verb of the Creed (creio), and the Latin\'s length exactly; the perfect "cri" is correct and almost never said.', 'from': 'draft'},
        ],
    },
    {
        'id': 'deliqui', 'refs': ['118:67'], 'latin': 'Priúsquam humiliárer ego delíqui', 'kind': 'glossary',
        'why': 'delínquere (ἐπλημμέλησα): Lewis & Short "to fail, be wanting in one\'s duty; to commit a fault". Its noun delíctum is frequent (18:13 Delícta quis intélligit, 24:7 Delícta juventútis meæ, 68:6). It must stay apart from peccáre → pecar, which the psalm also has (118:11).',
        'options': [
            {'label': 'cometi faltas', 'forms': {'deliqui': 'cometi faltas'}, 'note': 'Draft. delíctum → falta ("as faltas da minha juventude"), delínquere → cometer faltas: L&S\'s own gloss, plain, and apart from pecar.', 'from': 'draft'},
            {'label': 'delinqui', 'forms': {'deliqui': 'delinqui'}, 'note': 'The cognate, one word for one. In Brazil it belongs to the police report.', 'from': 'draft'},
            {'label': 'pequei', 'forms': {'deliqui': 'pequei'}, 'note': 'Matos Soares 1932. Merges delínquere into peccáre.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'bonum_quia', 'refs': ['118:71'], 'latin': 'Bonum mihi quia humiliásti me', 'kind': 'grammar',
        'why': 'quia after bonum is "that" (ἀγαθόν μοι ὅτι): it is good for me that you humbled me. The Latin has no copula. Portuguese wants a subjunctive after "é bom que". 118:72 opens on the same two words.',
        'options': [
            {'label': 'Bom é para mim que me tenhais humilhado', 'forms': {'bonum_quia': 'Bom é para mim que me tenhais humilhado'}, 'note': 'Draft. A copula supplied; the perfect kept as a perfect subjunctive; "Bom é para mim" can open 118:72 too ("Boa é para mim a lei" — the gender is grammar), so the Latin\'s Bonum mihi … Bonum mihi is heard.', 'from': 'draft'},
            {'label': 'Foi bom para mim que me humilhásseis', 'forms': {'bonum_quia': 'Foi bom para mim que me humilhásseis'}, 'note': 'Matos Soares 1932 (under tu). Natural; a past copula the Latin does not have, and the echo with 118:72 weakens.', 'from': 'MS1932'},
            {'label': 'Bom é para mim, porque me humilhastes', 'forms': {'bonum_quia': 'Bom é para mim, porque me humilhastes'}, 'note': 'quia as "because", indicative kept. It changes what is called good.', 'from': 'draft'},
        ],
    },
    {
        'id': 'plasmaverunt', 'refs': ['118:73'], 'latin': 'fecérunt me, et plasmavérunt me', 'kind': 'glossary',
        'why': 'plasmáre (ἔπλασαν): to mould, as a potter — the image stays concrete (rule 5). It must stay apart from fíngere (32:15, 93:9) and formáre (138:5).',
        'options': [
            {'label': 'moldaram', 'forms': {'plasmaverunt': 'moldaram'}, 'note': 'Draft. The potter\'s verb in Brazil; the plainer of two faithful words (D2).', 'from': 'draft'},
            {'label': 'plasmaram', 'forms': {'plasmaverunt': 'plasmaram'}, 'note': 'The cognate, and the Diurnal Monástico\'s word ("Tuas mãos me fizeram e plasmaram") — so it has been prayed in Brazil. Learned.', 'from': 'DM1962'},
            {'label': 'formaram', 'forms': {'plasmaverunt': 'formaram'}, 'note': 'Matos Soares 1932, Douay-Rheims "formed". It is formáre\'s word, and paler.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'fiat', 'refs': ['118:76', '118:80'], 'latin': 'Fiat misericórdia tua ut consolétur me · Fiat cor meum immaculátum', 'kind': 'glossary',
        'why': 'Fiat twice in the stanza (γενηθήτω), and 118:173 Fiat manus tua ut salvet me has the build of 118:76 again. The glossary has fíeri → fazer-se (open, Ps 117). It must stay apart from Véniat / Véniant (118:41, 77), which Matos Soares and the Diurnal write here.',
        'options': [
            {'label': 'Faça-se', 'forms': {'fiat': 'Faça-se'}, 'note': 'Draft. The glossary verb; it is the "Faça-se" of the Angelus (fiat mihi secúndum verbum tuum), which 118:76 all but quotes with secúndum elóquium tuum.', 'from': 'glossary'},
            {'label': 'Seja', 'forms': {'fiat': 'Seja'}, 'note': 'Douay-Rheims "let … be"; Matos Soares at 118:80. Plainer; it is esse, and the becoming is lost.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'miserationes', 'refs': ['118:77'], 'latin': 'Véniant mihi miseratiónes tuæ', 'kind': 'glossary',
        'why': 'miseratiónes (οἰκτιρμοί) one verse after misericórdia (ἔλεος, 118:76): two words, in the Greek as well, and they stand side by side in 24:6 (miseratiónum tuárum … et misericordiárum tuárum) and 102:4. Frequent (50:3 secúndum multitúdinem miseratiónum tuárum).',
        'options': [
            {'label': 'as vossas compaixões', 'forms': {'miserationes': 'as vossas compaixões'}, 'note': 'Draft. A second word, plural as the Latin; the Diurnal has "tua compaixão".', 'from': 'DM1962'},
            {'label': 'as vossas misericórdias', 'forms': {'miserationes': 'as vossas misericórdias'}, 'note': 'Matos Soares 1932. Merges the two terms, one verse apart.', 'from': 'MS1932'},
            {'label': 'as vossas comiserações', 'forms': {'miserationes': 'as vossas comiserações'}, 'note': 'The cognate. Heavy, and "comiseração" has a condescending ring.', 'from': 'draft'},
        ],
    },
]
have = {d['id'] for d in data['decisions']}
for d in new:
    if d['id'] in have:
        sys.exit(f"decision {d['id']} already exists")
data['decisions'] += new

# ---------------------------------------------------------------- choices
data['choices'].update({
    '118:33': 'eam can be legem or viam in the Latin; in the Greek αὐτήν can only be the way (νομοθέτησον is a verb there), and Portuguese must choose a gender: "o procurarei" = the way (Matos Soares likewise). exquíram → "procurarei" (decision "exquirere"). semper → "sempre", last as in the Latin. The (He) label is not reproduced. First colon 4 short: "preceitos" for justificatiónum.',
    '118:34': 'Da mihi intelléctum, et … returns word for word at 118:73 and is translated identically there. scrutábor → "sondarei" (decision "scrutantur"). in toto corde meo → "de todo o meu coração" (formula).',
    '118:35': 'Three decisions (deduc, semita, ipsam). mandatórum tuórum → "dos vossos mandamentos". First colon 3 over (mandamentos).',
    '118:36': 'Inclinai is safe under rule 3 (past "inclinei"). in + accusative twice → "para … para". avarítia → "avareza" (Matos Soares; πλεονεξία); the Diurnal\'s "lucro" is the Hebrew.',
    '118:37': 'Avérte → "Desviai" (glossary: avértere → desviar; safe, past "desviei"). vanitátem → "a vaidade", as Ps 4:3. One of the six verses with no law-word; it has via. in via tua vivífica me: the Latin order kept, the imperative last as in 118:25 and 118:40.',
    '118:38': 'The first singular elóquium: "o vosso dito" (decision "eloquia"). servo tuo, a dative of advantage → "para o vosso servo". in timóre tuo: the Latin has in + ablative where the Greek has εἰς (unto your fear); the Latin is followed — "no vosso temor".',
    '118:39': 'Ámputa (περίελε) → "Cortai": the Latin\'s image kept (safe under rule 3, past "cortei"); Matos Soares "Afasta de mim" and Douay-Rheims "Turn away" soften it, and "Tirai" is Aufer\'s word (118:22). oppróbrium meum → "a minha afronta" (decision "opprobrium"). A copula is supplied in the second colon.',
    '118:40': 'Ecce → "Eis que" (glossary: ecce → eis). concupívi → "ansiei por" (the first agent\'s concupíscere; slot in decision "concupivit"). in æquitáte tua → "na vossa equidade" (glossary; the Greek has δικαιοσύνη, the Latin its own word — followed).',
    '118:41': 'Every verse of Vau opens on Et (the Hebrew letter is the word "and"): "E" is kept at the head of all eight, the Latin\'s own anaphora. salutáre → "salvação" (D6). No verb in the second colon, as in the Latin. "segundo o vosso dito": the formula\'s first occurrence.',
    '118:42': 'Two decisions: "v42a" (whose object verbum is) and "verbum_sermo" (D15\'s local decision). exprobrántibus mihi → "aos que me afrontam" (decision "opprobrium"). sperávi in → "esperei em" (glossary).',
    '118:43': 'ne áuferas → "não tireis" (Aufer → Tirai, 118:22). usquequáque → "de todo" as in 118:8, moved next to the verb it qualifies (D2): at the end of the colon it would be heard with "verdade". supersperávi: decision. First colon within 1 of the Latin.',
    '118:44': 'semper → "sempre", moved next to the verb so that it does not abut "para sempre" across the asterisk (decision "saeculum44"). The final "séculos" is a proparoxytone, as sǽculi is: the glossary\'s formula, accepted.',
    '118:45': 'The Latin imperfects of 118:45–48 (ambulábam, loquébar, meditábar, exercébar) and the perfect levávi are kept as they stand; Matos Soares and the Diurnal write futures throughout, with the Hebrew. "eu" is named in 118:45 and 46 because "andava / falava" are also third person; by 118:47 the person is established. in latitúdine → "na amplidão" (glossary, Ps 117:5, which names this verse).',
    '118:46': 'loquébar in testimóniis tuis → "falava nos vossos testemunhos": "falar em" is the Portuguese idiom for speaking of a thing, and keeps the Latin\'s in. in conspéctu regum → "diante dos reis": the glossary\'s "diante da vista de" (open, Ps 53:5) was made for ante conspéctum suum; the row itself expects in conspéctu to want the plain "diante de". et non confundébar: decision "confundebar".',
    '118:47': 'meditábar in → "meditava em" (glossary). quæ diléxi → "que eu amei": the perfect kept (Matos Soares has a present); short second colon, as the Latin\'s is. The Greek adds σφόδρα here; the Latin does not.',
    '118:48': 'leváre → "levantar" (the glossary keeps erguer for extóllere and elevar for eleváre). ad mandáta tua → "para os vossos mandamentos". quæ diléxi repeats from 118:47, identically. exercébar → "me exercitava" (decision "exerceri"), beside meditábar as in 118:15–16 and 23–24.',
    '118:49': 'Zain opens three verses on Memor (118:49, 52, 55): "Lembrai-vos … Lembrei-me … Lembrei-me" stand first in all three. Memor esto → "Lembrai-vos" (safe, past "lembrei"). verbi tui servo tuo: "da vossa palavra ao vosso servo", the bare dative kept. in quo → "na qual" (the word); spem dedísti → "destes esperança" (the Greek has one verb, ἐπήλπισας; the Latin\'s two words are followed).',
    '118:50': 'Three decisions (haec, humilitate, and the slots of eloquia and vivifica). consoláta est → "consolou". vivificávit me → "me vivificou".',
    '118:51': 'iníque agébant (παρηνόμουν) → "agiam iniquamente", imperfect kept. usquequáque → "de todo", before the adverb it qualifies. a lege tua non declinávi → "da vossa lei não me apartei" (declináre a → apartar-se de); autem → "mas" at the head of the colon, as the first agent did at 118:23.',
    '118:52': 'Memor fui → "Lembrei-me". consolátus sum is passive in sense (παρεκλήθην) → "fui consolado"; Matos Soares\' "consolei-me" makes it reflexive.',
    '118:53': 'pro peccatóribus → "por causa dos pecadores" (ἀπό; Douay-Rheims "because of"). derelinquéntibus → "que abandonam" (glossary: derelínquere → abandonar). peccátor → pecador (glossary; the Diurnal\'s "ímpios" is another term).',
    '118:54': 'in loco peregrinatiónis meæ → "no lugar da minha peregrinação": the cognate, as Douay-Rheims and Matos Soares; kept apart from íncola → forasteiro (118:19), though the Greek has one family (πάροικος / παροικία) — the variation is the Latin\'s. Today "peregrinação" is first a journey to a shrine; the older sense (living away from home) is still in church speech.',
    '118:55': 'nocte → "de noite". The order follows the Latin because it is also natural, and keeps Lembrei-me at the head (see 118:49).',
    '118:56': 'Decision "facta_est". quia → "porque". justificatiónes tuas exquisívi → "procurei os vossos preceitos", natural order, the same words as 118:45 with another term.',
    '118:57': 'Decision "portio". The Latin comma before the asterisk is kept. The (Heth) label is not reproduced.',
    '118:58': 'miserére mei → "tende piedade de mim" (formula). "segundo o vosso dito": second occurrence of the formula.',
    '118:59': 'Cogitávi vias meas → "Pensei nos meus caminhos" (Douay-Rheims "thought on"); Matos Soares\' "Considerei" is consideráre\'s word (118:15, 18). convérti → "voltei" (decision "convertere").',
    '118:60': 'ut custódiam → "para guardar": same subject, so Portuguese uses the infinitive.',
    '118:61': 'et legem tuam non sum oblítus → "e não esqueci a vossa lei": the formula "não esqueci" in natural order, as at 118:30. et is kept as "e", though the sense is adversative (Matos Soares and the Diurnal write "mas").',
    '118:62': 'surgébam, an imperfect → "eu me levantava" ("eu" because the form is also third person). ad confiténdum tibi → "para vos dar graças" (D5). super judícia → "pelos juízos" (on account of; the same build returns at 118:164 super judícia justítiæ tuæ). Decision "justificationis". The Diurnal has the same first colon ("À meia-noite levanto-me para dar-te graças") — not borrowed, it is simply what the words are.',
    '118:63': 'Decision "particeps". timéntium te → "os que vos temem" (glossary: timére with a direct object).',
    '118:64': 'Natural order in the first colon (the Latin fronts Misericórdia). 32:5 misericórdia Dómini plena est terra is the same sentence in the third person and should match. justificatiónes tuas doce me → "ensinai-me os vossos preceitos": the glossary\'s formula, which it extends expressly to the reordered places (118:64, 68, 124, 135).',
    '118:65': 'secúndum verbum tuum → "segundo a vossa palavra" (formula, = 118:25 and the Nunc dimittis). The (Teth) label is not reproduced.',
    '118:66': 'The polysyndeton is the Latin\'s and is kept (a bondade, e a disciplina, e a ciência). disciplína (παιδεία) → "disciplina"; sciéntia (γνῶσις) → "ciência", the cognates, as Matos Soares — "ciência" is heard today first as science; "conhecimento" is the plain alternative, but cognítio / cognóscere will want it (118:75, 79). "Ensinai-me" is moved to the head (D2).',
    '118:67': 'Priúsquam humiliárer → "Antes de ser humilhado" (an infinitive for the Latin subjunctive clause; same subject). ego → "eu". proptérea → "por isso". elóquium tuum custodívi → "guardei o vosso dito": the place where "promessa" cannot stand.',
    '118:68': 'Bonus es tu → "Bom sois vós": predicate first is ordinary in Portuguese prayer ("Bendito sois") and keeps the stanza\'s run on bon-. The Latin has no vocative here (the Greek adds κύριε); none is supplied. doce me justificatiónes tuas → the formula.',
    '118:69': 'Natural order in the first colon. super me → "sobre mim". ego autem → "mas eu" (as 118:23, 78). scrutábor → "sondarei" (decision "scrutantur"). Second colon equal to the Latin\'s length.',
    '118:70': 'Coagulátum est sicut lac → "coalhou como leite": the Latin\'s (and the Greek\'s) image, not the Hebrew\'s fat. ego vero → "eu, porém,": the Latin varies autem (118:69) / vero (118:70) and so does the Portuguese (mas eu / eu, porém). meditátus sum with an accusative → "meditei na vossa lei".',
    '118:71': 'Decision "bonum_quia". humiliáre → "humilhar" (three times in the portion). ut discam → "para que eu aprenda" (díscere → aprender, glossary).',
    '118:72': 'Bonum mihi → "Boa é para mim": Portuguese has no neuter predicate, so the adjective agrees with "lei" (grammar, D2); the root still answers 118:71. lex oris tui → "a lei da vossa boca". super míllia → "mais que milhares" (Douay-Rheims "above thousands"); "de ouro e de prata" word for word.',
    '118:73': 'me is said twice in the Latin and twice here. Da mihi intelléctum, et discam → identical to 118:34\'s build ("dai-me entendimento, e …"). The (Joth) label is not reproduced.',
    '118:74': 'Qui timent te → "Os que vos temem", as 118:63, 79. lætári → "alegrar-se" (glossary). in verba tua, accusative → "nas vossas palavras". supersperávi: decision.',
    '118:75': 'Cognóvi → "Conheci" (Matos Soares 1932): the perfect kept; Douay-Rheims has "I know". ǽquitas judícia tua: the predicate stays a noun ("são equidade"), not "são justos". in veritáte tua → "na vossa verdade" (glossary; the Diurnal\'s "por fidelidade" is the Hebrew family).',
    '118:76': 'Fiat … ut consolétur me → "Faça-se … para me consolar" (decision "fiat"). secúndum elóquium tuum servo tuo → "segundo o vosso dito ao vosso servo": third occurrence of the formula, here with its dative.',
    '118:77': 'Véniant mihi → "Venham a mim" (véniat, 118:41 → "venha"). et vivam → "e viverei" (the Greek has a future). lex tua meditátio mea est → "a vossa lei é a minha meditação" (formula set at 118:24).',
    '118:78': 'Confundántur → "Sejam envergonhados" (D15). injúste iniquitátem fecérunt in me: the pleonasm is the Latin\'s and is kept; in me → "me" (a dative does the work of "contra mim" and saves four syllables in a colon already 3 over). ego autem → "mas eu".',
    '118:79': 'Convertántur mihi → "Voltem-se para mim" (decision "convertere"). qui novérunt → "os que conhecem": novi is a perfect with present sense.',
    '118:80': 'Fiat → "Faça-se" (decision "fiat"). immaculátum → "imaculado", the word of 118:1 (decision "immaculati"). ut non confúndar → "para eu não ser envergonhado" (D15): the personal infinitive names the subject (the subject of the main clause is the heart) in three syllables fewer than "para que eu não seja"; still 4 over, accepted as at 118:6.',
})

# ---------------------------------------------------------------- audit
handoff = next(i for i, s in enumerate(data['audit']) if s['step'] == 'handoff')
data['audit'][handoff]['note'] += (
    ' — ADDED by the agent of 118:33–80, for whoever takes 118:81–128: formulas now also set: '
    'secúndum elóquium tuum → segundo o vosso dito (slot e_sec in decision "eloquia"; singular elóquium tuum → o vosso dito, slot e_sg); '
    'Da mihi intelléctum, et … → Dai-me entendimento, e … (118:125, 144, 169 next); '
    'supersperávi in → esperei muito em (118:81, 114, 147 next; decision "supersperavi"); '
    'justificatiónes tuas doce me → ensinai-me os vossos preceitos even where the Latin reorders (118:124, 135); '
    'lex tua meditátio mea est → a vossa lei é a minha meditação (118:92, 97, 174); '
    'non sum oblítus → não esqueci (118:83, 109, 141, 153, 176), natural order "e não esqueci a vossa lei"; '
    'ego autem → mas eu; ego vero → eu, porém,; '
    'Fiat … ut → Faça-se … para (118:173 Fiat manus tua ut salvet me); '
    'Qui timent te / timéntes te → os que vos temem; '
    'humílitas → humilhação, humiliáre → humilhar (118:92, 107, 153); '
    'in ætérnum → eternamente, in sǽculum → para sempre, in sǽculum sǽculi → pelos séculos dos séculos (118:44 joins the last two); a sǽculo → desde sempre; '
    'usquequáque → de todo (118:107); semper → sempre; deféctio → desfalecimento (defícere → desfalecer: 118:81, 82, 123); '
    'sémita → vereda (118:105); ǽquitas → equidade; miseratiónes → compaixões (118:156 has misericórdiæ, plural — not this word); convértere → voltar; dedúcere → guiar; statúere → firmar (118:106 státui). '
    'Rule-3 traps met in this portion: conduzi (dedúcere — and the enclitic does not save it: "conduzi-me" is also "I behaved"), cumpri; "cantáveis" (the adjective equals "vós cantáveis"). '
    '118:62 judícia justificatiónis tuæ is decided as "os juízos da vossa justificação" (decision "justificationis") — the formula of 118:106, 160, 164 stays "os juízos da vossa justiça"; super judícia → pelos juízos (118:164). '
    'New slots carry a lowercase twin where a capital one existed (m_in / m_In). Mechanics: ps118/partial.py needs no change (it reads the verses present); ps118/part2.py builds the critics\' sub-folder for a verse range — edit its two bounds.'
)
data['audit'] += [
    {
        'step': 'draft',
        'note': 'Draft 4 = draft 3 (118:1–32, wording untouched) + the first draft of 118:33–80 (He, Vau, Zain, Heth, Teth, Jod), by a second agent (script: ps118/append_v4.py; draft 3 kept as prayed.v3.json). Read first: AGENT-BRIEF, DECISIONS (D2, D3, D5, D13, D15), glossary, words/ps118-terms.md, and this file\'s handoff step; every formula listed there is applied unchanged. The law-terms add slots to the existing decisions (every option has a form for every new slot); no new term decision was made, except the two the brief asked for: "verbum_sermo" (118:42) and "justificationis" (118:62). DO\'s Portuguese was not read as evidence (D12). Latin against the Greek, Latin followed: 118:38 in timóre tuo (Greek εἰς); 118:40 in æquitáte tua (Greek δικαιοσύνη); 118:47 no σφόδρα; 118:49 spem dedísti (one Greek verb); 118:68 no vocative. Latin against the Hebrew-family versions: the imperfects of 118:45–48 are kept (Matos Soares and the Diurnal have futures); 118:70 milk, not fat. Rule 3 checked at every imperative: ponde, dai, guiai, inclinai, desviai, firmai, cortai, lembrai-vos, tende, ensinai, vivificai are safe; "conduzi" (118:35) fails even with its enclitic and was replaced by "guiai". Anaphoras that show the acrostic through the Latin are kept where Portuguese does it without strain: the eight "E" of Vau, the three "Lembr-" of Zain, "bondade … bondade … Bom … bondade … Bom … Boa" in Teth. The Hetzenauer 1914 print read of the Latin is still skipped and owed for these verses as well.'
    },
]

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('prayed.json → version 4,', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
