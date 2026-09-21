"""Draft 7 of Ps 118 = draft 6 (118:1–80, untouched; kept as prayed.v6.json) + the first draft of
118:81–118:128 (Caph, Lamed, Mem, Nun, Samech, Ain).

Run once from the repo root, on a prayed.json that is still version 6:
  python3.13 research/psalterium/ps118/append_v7.py
It adds the new verses, adds the new slots to the EXISTING term decisions (every option gets a form),
appends the new verse-local decisions, the choices and the audit steps.
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 6:
    sys.exit(f"prayed.json is version {data['version']}, expected 6 — not touching it")
if not (here / 'prayed.v6.json').exists():
    sys.exit('prayed.v6.json is missing — copy prayed.json to it first')

verses = {
    '118:81': 'A minha alma desfaleceu {def_a} vossa salvação: * e {superspero} na vossa palavra.',
    '118:82': 'Os meus olhos desfaleceram {e_def}, * dizendo: Quando me consolareis?',
    '118:83': 'Porque {factus_sum} como um odre na geada: * não esqueci {j_acc}.',
    '118:84': 'Quantos são os dias do vosso servo? * {v84b}',
    '118:85': 'Os iníquos me narraram {fabulationes}: * mas não como a vossa lei.',
    '118:86': '{m_All} são verdade: * iniquamente me perseguiram, {adjuva}.',
    '118:87': '{consummaverunt} na terra: * mas eu não abandonei {m_acc}.',
    '118:88': 'Segundo a vossa misericórdia {vivifica}: * e guardarei {t_bare} da vossa boca.',
    '118:89': '{Aet}, Senhor, * a vossa palavra permanece no céu.',
    '118:90': '{v90a}: * fundastes a terra, e ela permanece.',
    '118:91': '{ordinatione} {perseverat} o dia: * porque todas as coisas vos servem.',
    '118:92': '{nisi_quod}: * então talvez eu tivesse perecido {humilitate}.',
    '118:93': '{Aet} não esquecerei {j_acc}: * porque {j_neles} {viv_perf2}.',
    '118:94': 'Eu sou vosso, salvai-me: * porque {ex_1sg} {j_acc}.',
    '118:95': 'Os pecadores {exspect95} {perderent}: * entendi {t_acc}.',
    '118:96': '{consummationis} vi o fim: * {m_sg} {latum96}.',
    '118:97': '{quomodo} a vossa lei, Senhor! * todo o dia ela é a minha meditação.',
    '118:98': '{sup98} me fizestes prudente {m_sg_por}: * porque {aet} {mihi_est}.',
    '118:99': '{sup99} entendi: * porque {t_acc} são a minha meditação.',
    '118:100': '{sup100} entendi: * porque busquei {m_acc}.',
    '118:101': 'De todo caminho mau {prohibui} os meus pés: * para guardar as vossas palavras.',
    '118:102': '{jd_De} não me apartei: * porque vós {legem_posuisti}.',
    '118:103': '{quam} {faucibus} {e_acc}, * mais que o mel à minha boca!',
    '118:104': '{m_Por} entendi: * por isso odiei todo caminho de iniquidade.',
    '118:105': '{lucerna} para os meus pés é a vossa palavra, * e luz para {sem_pl}.',
    '118:106': 'Jurei, {statui} * guardar {jd_bare} da vossa justiça.',
    '118:107': 'Fui humilhado de todo, Senhor: * {vivifica} segundo a vossa palavra.',
    '118:108': '{beneplacita}, Senhor, {voluntaria} da minha boca: * e ensinai-me {jd_acc}.',
    '118:109': 'A minha alma está sempre nas minhas mãos: * e não esqueci a vossa lei.',
    '118:110': 'Os pecadores {posuerunt}: * e {erravi} {m_de}.',
    '118:111': 'Adquiri por herança {t_acc} {aet}: * porque são a exultação do meu coração.',
    '118:112': 'Inclinei o meu coração {faciendas} {j_acc} {aet}, * por causa da retribuição.',
    '118:113': '{odio113}: * e amei a vossa lei.',
    '118:114': 'Vós sois {adjutor114} e o meu amparo: * e {superspero} na vossa palavra.',
    '118:115': 'Apartai-vos de mim, malignos: * e {scr_fut} {m_Dei}.',
    '118:116': '{suscipe116} {e_sec}, e viverei: * e {conf116} {exspect116}.',
    '118:117': '{Adjuva}, e serei salvo: * e meditarei sempre {j_in}.',
    '118:118': 'Desprezastes todos {discedentes} {jd_gen}: * porque o pensamento deles é injusto.',
    '118:119': '{praevaricantes} todos os pecadores da terra: * por isso amei {t_acc}.',
    '118:120': '{confige} com o vosso temor as minhas carnes: * {timui120}.',
    '118:121': '{feci_judicium}: * não me entregueis aos que me {cal121}.',
    '118:122': '{suscipe122} o vosso servo para o bem: * não me {cal122} os soberbos.',
    '118:123': 'Os meus olhos desfaleceram {def_a} vossa salvação: * e {v123b}.',
    '118:124': '{fac_cum} segundo a vossa misericórdia: * e ensinai-me {j_acc}.',
    '118:125': 'Eu sou o vosso servo: * dai-me {intellectum}, para que eu {sciam} {t_acc}.',
    '118:126': '{tempus_faciendi}: * {dissipaverunt} a vossa lei.',
    '118:127': 'Por isso amei {m_acc}, * mais que o ouro e o topázio.',
    '118:128': 'Por isso {dirigebar} {m_all}: * {odio128}.',
}
overlap = set(verses) & set(data['verses'])
if overlap:
    sys.exit(f'already present: {sorted(overlap)}')
data['verses'].update(verses)
data['range'] = '118:1–118:128'
data['version'] = 7
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


extend('justificationes', ['118:83', '118:93', '118:94', '118:112', '118:117', '118:124'],
       {'preceitos': {'j_neles': 'neles'}, 'decretos': {'j_neles': 'neles'}, 'justificações': {'j_neles': 'nelas'}},
       latin='in ipsis (118:93)',
       why='118:81–128: six more places; one new form, the pronoun of 118:93 (in ipsis vivificásti me), which must agree in gender with whichever noun is chosen.')
extend('testimonia', ['118:88', '118:95', '118:99', '118:111', '118:119', '118:125'],
       {'testemunhos': {'t_bare': 'os testemunhos'}, 'preceitos': {'t_bare': 'os preceitos'}},
       latin='testimónia oris tui',
       why='118:81–128: six more places; 118:88 has the term with a genitive instead of the possessive (testimónia oris tui → os testemunhos da vossa boca).')
extend('mandata', ['118:86', '118:87', '118:96', '118:98', '118:100', '118:104', '118:110', '118:115', '118:127', '118:128'],
       {'mandamentos': {'m_All': 'Todos os vossos mandamentos', 'm_sg': 'o vosso mandamento', 'm_sg_por': 'pelo vosso mandamento', 'm_Por': 'Pelos vossos mandamentos', 'm_Dei': 'os mandamentos do meu Deus'},
        'preceitos': {'m_All': 'Todos os vossos preceitos', 'm_sg': 'o vosso preceito', 'm_sg_por': 'pelo vosso preceito', 'm_Por': 'Pelos vossos preceitos', 'm_Dei': 'os preceitos do meu Deus'}},
       latin='mandátum tuum · mandáto tuo (singular: 118:96, 98) · a mandátis tuis · mandáta Dei mei',
       why='118:81–128: ten more places, among them the only two singulars of the psalm (118:96 latum mandátum tuum, 118:98 mandáto tuo) and the only place where the law-word is not "yours" but "of my God" (118:115).')
extend('judicia', ['118:84', '118:102', '118:106', '118:108', '118:118', '118:120', '118:121'],
       {'juízos': {'jd_sg': 'juízo', 'jd_De': 'Dos vossos juízos'},
        'sentenças': {'jd_sg': 'juízo', 'jd_De': 'Das vossas sentenças'}},
       latin='fácies … judícium · Feci judícium (singular) · A judíciis tuis',
       why='118:81–128: seven more places. Two are the singular with fácere (118:84 quando fácies de persequéntibus me judícium; 118:121 Feci judícium et justítiam): there the option "sentenças" keeps "juízo" too, because "fazer sentença" is not Portuguese — the word study foresaw it ("sentença cannot serve most of those places, so reversing means two words for one Latin term"). 118:106 is the formula judícia justítiæ tuæ, identical with 118:7.')
extend('eloquia', ['118:82', '118:103', '118:116', '118:123'],
       {'ditos · o que dissestes': {'e_def': '{def_o} que dissestes', 'e_just': '{def_o} dito da vossa justiça'},
        'ditos · o vosso dito': {'e_def': '{def_o} vosso dito', 'e_just': '{def_o} dito da vossa justiça'},
        'promessas': {'e_def': '{def_a} vossa promessa', 'e_just': '{def_a} promessa da vossa justiça'},
        'falas': {'e_def': '{def_a} vossa fala', 'e_just': '{def_a} fala da vossa justiça'},
        'palavras': {'e_def': '{def_a} vossa palavra', 'e_just': '{def_a} palavra da vossa justiça'}},
       latin='in elóquium tuum (118:82) · elóquia tua (118:103) · in elóquium justítiæ tuæ (118:123)',
       why='118:81–128 (four places, under D16). 118:103 is the plural (os vossos ditos, as 118:11). 118:116 is the formula (segundo o que dissestes). 118:82 puts the singular after defícere in, so the clause must follow a preposition: its form carries the preposition\'s slot ({def_o} / {def_a}, decision "deficere_in") so that noun and clause both contract rightly (pelo que dissestes / pela vossa promessa). 118:123 elóquium justítiæ tuæ is the place D16 names where the singular must be a noun, because it governs a genitive: "dito" — see decision "v123b", whose first option simply follows this one.')
extend('scrutantur', ['118:115'], latin='scrutábor mandáta Dei mei')
extend('exquirere', ['118:94'], latin='justificatiónes tuas exquisívi (118:94)')
extend('confundi', ['118:116'],
       {'envergonhar': {'conf116': 'não me envergonheis'},
        'ser confundido / não me deixeis confundido': {'conf116': 'não me deixeis confundido'},
        'ser confundido / não me confundais': {'conf116': 'não me confundais'}},
       latin='non confúndas me ab exspectatióne mea')
extend('vivifica', ['118:88', '118:93', '118:107'],
       {'vivificai-me': {'viv_perf2': 'me vivificastes'}, 'dai-me a vida': {'viv_perf2': 'me destes a vida'}},
       latin='vivificásti me')
extend('supersperavi', ['118:81', '118:114'], latin='in verbum tuum supersperávi (118:81 = 118:114)',
       why='118:81b and 118:114b are the same Latin colon (et in verbum tuum supersperávi) and are the same Portuguese colon.')
extend('intellectum', ['118:125'], latin='da mihi intelléctum, ut sciam')
extend('humilitate', ['118:92'], latin='periíssem in humilitáte mea')
extend('semita', ['118:105'],
       {'à vereda': {'sem_pl': 'as minhas veredas'}, 'à senda': {'sem_pl': 'as minhas sendas'}, 'à trilha': {'sem_pl': 'as minhas trilhas'}},
       latin='lumen sémitis meis')
extend('legem_pone', ['118:102'],
       {'Imponde-me por lei, Senhor, o caminho': {'legem_posuisti': 'me impusestes uma lei'},
        'Ponde-me por lei, Senhor, o caminho': {'legem_posuisti': 'me pusestes uma lei'},
        'Dai-me por lei, Senhor, o caminho': {'legem_posuisti': 'me destes uma lei'}},
       latin='quia tu legem posuísti mihi (118:102)',
       why='118:102 has the same phrase in the perfect (legem posuísti mihi; the Greek has the same verb in both verses, νομοθετέω), so it takes the same verb: "porque vós me impusestes uma lei". "uma lei" with Douay-Rheims ("set me a law") and Matos Soares ("prescreveste uma lei"): to legislate for someone, not "the Law" handed over.')

# ---------------------------------------------------------------- new verse-local decisions
new = [
    {
        'id': 'deficere_in', 'refs': ['118:81', '118:82', '118:123'], 'kind': 'grammar',
        'latin': 'Defécit in salutáre tuum · Defecérunt óculi mei in elóquium tuum · defecérunt in salutáre tuum … et in elóquium',
        'why': 'defícere → desfalecer (set by 118:53 deféctio → desfalecimento). The question is the preposition: in + accusative is the Greek\'s εἰς — the soul and the eyes fail *towards* a thing, straining after it. Douay-Rheims "fainted after"; Matos Soares supplies a noun ("à espera da tua salvação", "de tanto esperar"); the Diurnal has the bare preposition ("desfalece por tua salvação"). One rendering for the three verses, which the Latin builds alike.',
        'options': [
            {'label': 'desfalecer por', 'forms': {'def_a': 'pela', 'def_o': 'pelo'}, 'note': 'Draft 7. "Por" is the Portuguese preposition of yearning (suspirar por, morrer por — and 118:40 "ansiei pelos vossos mandamentos"); a preposition for a preposition, nothing supplied. The diction is the Diurnal\'s. Known risk, put to the blind reader: "por" is also the preposition of cause, and in 118:82 "desfaleceram pelo que dissestes" can be heard as "failed because of what you said".', 'from': 'DM1962'},
            {'label': 'desfalecer à espera de', 'forms': {'def_a': 'à espera da', 'def_o': 'à espera do'}, 'note': 'Matos Soares 1932 (118:81, 123). Unmistakable. It supplies a noun the Latin does not have, sets "espera" beside "esperança" in 118:81 where the Latin has one word of hope, not two, and spends the root that exspectáre needs (118:95, 116).', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'factus_sum', 'refs': ['118:83'], 'kind': 'glossary', 'latin': 'Quia factus sum sicut uter in pruína',
        'why': 'The glossary\'s open row is fíeri, factus est → fazer-se (Ps 117, where the psalm runs on fácere and God is the one who "se fez salvação"). Here the speaker has become something through no act of his own.',
        'options': [
            {'label': 'me tornei', 'forms': {'factus_sum': 'me tornei'}, 'note': 'Draft 7, Matos Soares ("tornei-me"). "Porque me fiz como um odre" would be heard as something he did to himself. 118:56 (facta est mihi → me aconteceu) already shows that fíeri cannot keep one Portuguese verb in this psalm.', 'from': 'MS1932'},
            {'label': 'me fiz', 'forms': {'factus_sum': 'me fiz'}, 'note': 'The glossary\'s fazer-se, as in Ps 117:14, 21, 22.', 'from': 'glossary'},
            {'label': 'fiquei', 'forms': {'factus_sum': 'fiquei'}, 'note': 'The everyday Brazilian verb; lighter than the Latin perfect.', 'from': 'draft'},
        ],
    },
    {
        'id': 'v84b', 'refs': ['118:84'], 'kind': 'grammar', 'latin': 'quando fácies de persequéntibus me judícium?',
        'why': 'judícium must stay "juízo" (D15). But "fazer juízo de alguém" in Portuguese is to form an opinion of him, which is not what fácere judícium de means (to do justice upon: the Greek has ποιήσεις … ἐκ τῶν καταδιωκόντων με κρίσιν).',
        'options': [
            {'label': 'fareis juízo sobre os que me perseguem', 'forms': {'v84b': 'quando fareis {jd_sg} sobre os que me perseguem?'}, 'note': 'Draft 7. "Sobre" keeps the judgment falling on them (Douay-Rheims "execute judgment on") and blocks the idiom "fazer juízo de" = to think something of someone.', 'from': 'DRB'},
            {'label': 'fareis juízo dos que me perseguem', 'forms': {'v84b': 'quando fareis {jd_sg} dos que me perseguem?'}, 'note': 'The Latin\'s preposition (de). Heard as "when will you form an opinion of those who persecute me".', 'from': 'draft'},
            {'label': 'fareis justiça aos que me perseguem', 'forms': {'v84b': 'quando fareis justiça aos que me perseguem?'}, 'note': 'Matos Soares and the Diurnal. Refused: "justiça" is justítia\'s word (118:121 has both, judícium et justítiam), and "fazer justiça a" someone is to do him right.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'fabulationes', 'refs': ['118:85'], 'kind': 'word', 'latin': 'Narravérunt mihi iníqui fabulatiónes',
        'why': 'fabulátio: Lewis & Short "narration, discourse", citing this verse; the Greek is ἀδολεσχίας, idle talk. The Latin (with the Greek) has tales told where the Hebrew has pits dug. The next verse answers it: "all your commandments are truth".',
        'options': [
            {'label': 'fábulas', 'forms': {'fabulationes': 'fábulas'}, 'note': 'Draft 7. The cognate; Douay-Rheims "fables". It says "untrue" a little louder than fabulátio does, which the contrast with 118:86 (véritas) bears out.', 'from': 'DRB'},
            {'label': 'histórias', 'forms': {'fabulationes': 'histórias'}, 'note': 'The plain word ("contar histórias" also means to tell tales); neutral like L&S\'s "narration".', 'from': 'draft'},
            {'label': 'coisas frívolas', 'forms': {'fabulationes': 'coisas frívolas'}, 'note': 'Matos Soares (without his gloss "mil"); nearer the Greek than the Latin.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'adjuva', 'refs': ['118:86', '118:114', '118:117'], 'kind': 'glossary', 'latin': 'ádjuva me · Adjútor … meus · Ádjuva me',
        'why': 'The glossary keeps one family: adjutórium / adjútor → auxílio (Ps 90, Ps 117:6–7), adjuváre → auxiliar (Ps 53:6), both rows open. This stanza-pair has verb, noun, verb (118:86, 114, 117). "Auxiliai" and "ajudai" are both safe at the vós imperative.',
        'options': [
            {'label': 'auxiliar · auxílio', 'forms': {'adjuva': 'auxiliai-me', 'Adjuva': 'Auxiliai-me', 'adjutor114': 'o meu auxílio'}, 'note': 'Draft 7: the glossary\'s family, so that 118:114 reads like 117:6–7 (O Senhor é o meu auxílio). Four syllables for the Latin\'s three.', 'from': 'glossary'},
            {'label': 'ajudar · ajuda', 'forms': {'adjuva': 'ajudai-me', 'Adjuva': 'Ajudai-me', 'adjutor114': 'a minha ajuda'}, 'note': 'The plainer verb, and the cognate (Matos Soares "Ajuda-me"); but the noun "a minha ajuda" is weak for a person, and it would split from Ps 117 and Ps 53.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'consummaverunt', 'refs': ['118:87'], 'kind': 'word', 'latin': 'Paulo minus consummavérunt me in terra',
        'why': 'consummáre, to bring to an end, finish off (συντελέω). The Portuguese cognate "consumar" takes only deeds as objects (consumar um crime), never a person, and "consumiram" is another verb (consúmere). The root returns in 118:96 (consummatiónis), and the Greek has the same echo; Portuguese cannot keep it without saying something false in one of the two verses.',
        'options': [
            {'label': 'Por pouco não acabaram comigo', 'forms': {'consummaverunt': 'Por pouco não acabaram comigo'}, 'note': 'Draft 7: Douay-Rheims "had almost made an end of me" in its natural Portuguese. "Paulo minus" → "por pouco não".', 'from': 'DRB'},
            {'label': 'Por pouco não me consumaram', 'forms': {'consummaverunt': 'Por pouco não me consumaram'}, 'note': 'The cognate, which would keep the echo with 118:96 "consumação". Not Portuguese with a personal object; heard as "consumiram".', 'from': 'draft'},
            {'label': 'Por pouco não deram cabo de mim', 'forms': {'consummaverunt': 'Por pouco não deram cabo de mim'}, 'note': 'Idiomatic, but colloquial beside the rest.', 'from': 'draft'},
        ],
    },
    {
        'id': 'in_aeternum', 'refs': ['118:89', '118:93', '118:98', '118:111', '118:112'], 'kind': 'glossary', 'latin': 'In ætérnum (five times in Lamed–Nun)',
        'why': 'Glossary (working): in ætérnum → eternamente, kept apart from in sǽculum → para sempre (118:44) on purpose. The stanza Lamed opens on it and says it twice more (118:89, 93, 98); Nun closes on it twice (118:111, 112). One slot, so that it can be switched through the portion.',
        'options': [
            {'label': 'eternamente', 'forms': {'aet': 'eternamente', 'Aet': 'Eternamente'}, 'note': 'Draft 7, the glossary. In 118:93 "Eternamente não esquecerei" stands for the Latin\'s "In ætérnum non oblivíscar" (= never): the adverb first, as in 118:89, so that the stanza\'s anaphora is heard and so that it is not read as "I shall not forget for ever".', 'from': 'glossary'},
            {'label': 'para sempre', 'forms': {'aet': 'para sempre', 'Aet': 'Para sempre'}, 'note': 'Matos Soares, the Diurnal. Plainer and shorter; merges with in sǽculum.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'v90a', 'refs': ['118:90'], 'kind': 'grammar', 'latin': 'In generatiónem et generatiónem véritas tua',
        'why': 'Two things: the idiom (in generatiónem et generatiónem) and the verbless colon. véritas → verdade (glossary; not the Hebrew-family "fidelidade").',
        'options': [
            {'label': 'De geração em geração a vossa verdade', 'forms': {'v90a': 'De geração em geração a vossa verdade'}, 'note': 'Draft 7. "De geração em geração" is what Portuguese says for the phrase (Matos Soares, the Diurnal); the noun is still said twice, as in the Latin. No verb, as the Latin has none and Douay-Rheims keeps none ("Thy truth unto all generations").', 'from': 'MS1932'},
            {'label': 'De geração em geração é a vossa verdade', 'forms': {'v90a': 'De geração em geração é a vossa verdade'}, 'note': 'With the copula D2 allows. Offered for the ear; "é" with a span of time is a little odd, and "permanece" would borrow the verb of the second colon.', 'from': 'draft'},
            {'label': 'Para geração e geração a vossa verdade', 'forms': {'v90a': 'Para geração e geração a vossa verdade'}, 'note': 'The Latin\'s build word for word. A calque.', 'from': 'draft'},
        ],
    },
    {
        'id': 'ordinatione', 'refs': ['118:91'], 'kind': 'word', 'latin': 'Ordinatióne tua persevérat dies',
        'why': 'ordinátio (διάταξις): an ordering, an arrangement, also an ordinance. The word study kept "ordem" free for this verse. "Ordenação" is heard today as the ordination of a priest.',
        'options': [
            {'label': 'Pela vossa ordem', 'forms': {'ordinatione': 'Pela vossa ordem'}, 'note': 'Draft 7, Matos Soares ("Por tua ordem"). "Ordem" is both a command and an arrangement, which is the width of ordinátio.', 'from': 'MS1932'},
            {'label': 'Pela vossa ordenação', 'forms': {'ordinatione': 'Pela vossa ordenação'}, 'note': 'The cognate (Douay-Rheims "ordinance"); heard as holy orders.', 'from': 'DRB'},
            {'label': 'Pela vossa disposição', 'forms': {'ordinatione': 'Pela vossa disposição'}, 'note': 'The Greek\'s sense exactly; abstract.', 'from': 'draft'},
        ],
    },
    {
        'id': 'perseverat', 'refs': ['118:91'], 'kind': 'word', 'latin': 'persevérat dies',
        'why': 'The Greek has one verb three verses running (διαμένει, 118:89, 90, 91); the Latin says pérmanet, pérmanet, persevérat. The variation is the Latin\'s and costs nothing to keep.',
        'options': [
            {'label': 'persevera', 'forms': {'perseverat': 'persevera'}, 'note': 'Draft 7: the cognate, apart from "permanece" in 118:89–90. A day that "perseveres" is as unusual in Portuguese as in Latin.', 'from': 'draft'},
            {'label': 'continua', 'forms': {'perseverat': 'continua'}, 'note': 'Matos Soares ("continua (o curso) dos dias"), Douay-Rheims "goeth on".', 'from': 'MS1932'},
            {'label': 'permanece', 'forms': {'perseverat': 'permanece'}, 'note': 'What the Greek says: the same verb a third time.', 'from': 'draft'},
        ],
    },
    {
        'id': 'nisi_quod', 'refs': ['118:92'], 'kind': 'grammar', 'latin': 'Nisi quod lex tua meditátio mea est',
        'why': 'The colon holds the formula lex tua meditátio mea est (118:77, 97, 174 → "a vossa lei é a minha meditação") inside nisi quod, with its indicative: "were it not that …".',
        'options': [
            {'label': 'Não fosse que a vossa lei é a minha meditação', 'forms': {'nisi_quod': 'Não fosse que a vossa lei é a minha meditação'}, 'note': 'Draft 7: nisi quod word for word, and the formula stands whole, with its "é", exactly as in 118:77.', 'from': 'draft'},
            {'label': 'Se a vossa lei não fosse a minha meditação', 'forms': {'nisi_quod': 'Se a vossa lei não fosse a minha meditação'}, 'note': 'Matos Soares\' build (he has "não tivesse sido"). Smoother; the formula is bent into a subjunctive.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'exspectare', 'refs': ['118:95', '118:116'], 'kind': 'glossary', 'latin': 'Me exspectavérunt peccatóres · ab exspectatióne mea',
        'why': 'exspectáre / exspectátio meet twice in the portion. "Esperar / esperança" are taken: speráre → esperar em (118:42), spes → esperança (118:49), supersperáre → pôr toda a esperança em. The Greek keeps them apart as well (ὑπομένω, προσδοκία against ἐλπίζω).',
        'options': [
            {'label': 'aguardar · expectativa', 'forms': {'exspect95': 'me aguardaram', 'exspect116': 'na minha expectativa'}, 'note': 'Draft 7. "Aguardar" is free, plain, and can be hostile (lying in wait) or hopeful. "Expectativa" is the cognate and current. ab exspectatióne → "na": Douay-Rheims "in my expectation"; the Latin\'s ab (shamed away from what I expect) has no Portuguese preposition — "envergonhar de" would mean to make me ashamed of it.', 'from': 'draft'},
            {'label': 'esperar · esperança', 'forms': {'exspect95': 'esperaram por mim', 'exspect116': 'na minha esperança'}, 'note': 'Matos Soares ("esperaram-me"; "no que espero"). Natural, but it folds exspectáre into speráre, two verses after supersperávi (118:114).', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'perderent', 'refs': ['118:95'], 'kind': 'word', 'latin': 'ut pérderent me',
        'why': 'pérdere, to destroy; the Greek verb (ἀπολέσαι) is the active of the one behind periíssem three verses earlier (118:92 ἀπωλόμην → "perecido").',
        'options': [
            {'label': 'para me fazer perecer', 'forms': {'perderent': 'para me fazer perecer'}, 'note': 'Draft 7: keeps pérdere beside períre → perecer, as Latin and Greek do, and cannot be misheard.', 'from': 'draft'},
            {'label': 'para me perder', 'forms': {'perderent': 'para me perder'}, 'note': 'The cognate (Matos Soares). Heard today as "to lose me", or "to lead me astray".', 'from': 'MS1932'},
            {'label': 'para me destruir', 'forms': {'perderent': 'para me destruir'}, 'note': 'Douay-Rheims "to destroy me". Plain; "destruir" may be wanted for destrúere.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'consummationis', 'refs': ['118:96'], 'kind': 'word', 'latin': 'Omnis consummatiónis vidi finem',
        'why': 'consummátio: Lewis & Short "a finishing, completing, accomplishing, consummation" (συντέλεια). Everything that is brought to completion has an end; the commandment has none. In Brazil "consumação" is first of all what one eats and drinks in a bar (consumação mínima), being also the noun of "consumir".',
        'options': [
            {'label': 'De toda perfeição', 'forms': {'consummationis': 'De toda perfeição'}, 'note': 'Draft 7, Matos Soares ("o fim de tudo o que é perfeito"). "Perfeição" is per-féctio, a thing carried through to its finish — the same picture as con-summátio, in a word that is heard rightly. (The Diurnal has the same words from the Hebrew; that proves nothing about sense.)', 'from': 'MS1932'},
            {'label': 'De toda consumação', 'forms': {'consummationis': 'De toda consumação'}, 'note': 'The cognate; church Portuguese knows "a consumação dos séculos". Risk: heard as consumption.', 'from': 'draft'},
            {'label': 'De todo acabamento', 'forms': {'consummationis': 'De todo acabamento'}, 'note': 'Would answer 118:87 "acabaram comigo" and keep the Latin\'s echo; but "acabamento" is a builder\'s finish.', 'from': 'draft'},
        ],
    },
    {
        'id': 'latum96', 'refs': ['118:96'], 'kind': 'word', 'latin': 'latum mandátum tuum nimis',
        'why': 'Two words. latum: the glossary has latitúdo → amplidão (117:5, 118:45), so the adjective is "amplo". nimis (σφόδρα, "exceedingly"): the glossary says it has no one rendering — 118:4 custodíri nimis is "à risca", which cannot serve here; that is why this is a decision of its own and not a slot of "nimis".',
        'options': [
            {'label': 'é amplo sobremaneira', 'forms': {'latum96': 'é amplo sobremaneira'}, 'note': 'Draft 7. "Sobremaneira" is the literal the glossary names, and ends the verse as nimis does, on a paroxytone. A little bookish.', 'from': 'glossary'},
            {'label': 'é muito amplo', 'forms': {'latum96': 'é muito amplo'}, 'note': 'The plain way; flat at the close of the stanza.', 'from': 'draft'},
            {'label': 'é largo sobremaneira', 'forms': {'latum96': 'é largo sobremaneira'}, 'note': '"Largo" is the first word for latus; it breaks the family with "amplidão".', 'from': 'draft'},
            {'label': 'não tem limites', 'forms': {'latum96': 'não tem limites'}, 'note': 'Matos Soares ("somente a tua lei não tem limites"). Refused: it explains the image instead of giving it.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'quomodo', 'refs': ['118:97'], 'kind': 'grammar', 'latin': 'Quómodo diléxi legem tuam, Dómine?',
        'why': 'The Latin prints a question mark, but it is an exclamation (Greek ὡς ἠγάπησα; Douay-Rheims "O how have I loved thy law, O Lord!"). With "?" the Portuguese would be read as a real question — "in what way did I love?" — so the verse ends in "!".',
        'options': [
            {'label': 'Como amei', 'forms': {'quomodo': 'Como amei'}, 'note': 'Draft 7: quómodo is "como", and "Como amei …!" is a natural exclamation. The perfect is kept (diléxi), as in 118:47–48 "que eu amei".', 'from': 'draft'},
            {'label': 'Quanto amei', 'forms': {'quomodo': 'Quanto amei'}, 'note': 'The Diurnal\'s word; the commoner exclamation of degree.', 'from': 'DM1962'},
        ],
    },
    {
        'id': 'super', 'refs': ['118:98', '118:99', '118:100'], 'kind': 'glossary', 'latin': 'Super inimícos meos · Super omnes docéntes me · Super senes',
        'why': 'Three verses of Mem open on Super (ὑπέρ, "more than"); the anaphora is kept identical. 118:72 already has super míllia → "mais que milhares", and 118:103, 127 follow.',
        'options': [
            {'label': 'Mais que', 'forms': {'sup98': 'Mais que os meus inimigos', 'sup99': 'Mais que todos os que me ensinam', 'sup100': 'Mais que os {senes}'}, 'note': 'Draft 7: the comparison said plainly, as in 118:72.', 'from': 'draft'},
            {'label': 'Acima de', 'forms': {'sup98': 'Acima dos meus inimigos', 'sup99': 'Acima de todos os que me ensinam', 'sup100': 'Acima dos {senes}'}, 'note': 'The preposition kept as a preposition (Douay-Rheims "above ancients"). With "me fizestes prudente" it reads as rank rather than degree.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'senes', 'refs': ['118:100'], 'kind': 'word', 'latin': 'Super senes intelléxi',
        'why': 'senes, old men (πρεσβυτέρους).',
        'options': [
            {'label': 'anciãos', 'forms': {'senes': 'anciãos'}, 'note': 'Draft 7, Matos Soares. The respectful word, and the one that carries "those whose age should make them wise". It will be shared with senióres (104:22, 106:32).', 'from': 'MS1932'},
            {'label': 'velhos', 'forms': {'senes': 'velhos'}, 'note': 'The plain word; in Brazil it sounds dismissive, which the verse is not.', 'from': 'draft'},
        ],
    },
    {
        'id': 'mihi_est', 'refs': ['118:98'], 'kind': 'ambiguity', 'latin': 'quia in ætérnum mihi est',
        'why': 'A dative of possession: the commandment "is to me" for ever — mine, or with me. The subject is the singular mandátum.',
        'options': [
            {'label': 'ele é meu', 'forms': {'mihi_est': 'ele é meu'}, 'note': 'Draft 7: the dative of possession as Portuguese says it (the Diurnal: "é para sempre meu"). "Ele" names the subject, which is masculine singular and can only be "o vosso mandamento".', 'from': 'DM1962'},
            {'label': 'ele está comigo', 'forms': {'mihi_est': 'ele está comigo'}, 'note': 'Douay-Rheims "it is ever with me".', 'from': 'DRB'},
        ],
    },
    {
        'id': 'prohibui', 'refs': ['118:101'], 'kind': 'word', 'latin': 'Ab omni via mala prohíbui pedes meos',
        'why': 'prohibére, to hold back (ἐκώλυσα). "Afastar" is taken twice over (amovére, repéllere), "desviar" is avértere\'s, "deter-se" is stare\'s in Ps 1:1.',
        'options': [
            {'label': 'retive', 'forms': {'prohibui': 'retive'}, 'note': 'Draft 7: Douay-Rheims "restrained". To hold the feet back from a road.', 'from': 'DRB'},
            {'label': 'afastei', 'forms': {'prohibui': 'afastei'}, 'note': 'Natural (Matos Soares "Retirei"), but it is the verb of 118:29 Viam iniquitátis ámove a me, and a third Latin verb on it.', 'from': 'draft'},
        ],
    },
    {
        'id': 'quam', 'refs': ['118:103'], 'kind': 'grammar', 'latin': 'Quam dúlcia fáucibus meis elóquia tua',
        'why': 'The exclamation, verbless in Latin. D2: of two faithful wordings the plainer.',
        'options': [
            {'label': 'Como são doces', 'forms': {'quam': 'Como são doces'}, 'note': 'Draft 7: current Portuguese, with the copula supplied. It shares "Como" with 118:97 (Quómodo), harmlessly.', 'from': 'draft'},
            {'label': 'Quão doces são', 'forms': {'quam': 'Quão doces são'}, 'note': 'Matos Soares, the Diurnal. "Quão" is understood and liturgical, but nobody says it.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'faucibus', 'refs': ['118:103'], 'kind': 'word', 'latin': 'fáucibus meis … ori meo',
        'why': 'fauces: Lewis & Short "the upper part of the throat … the pharynx, throat, gullet"; the Greek λάρυγξ. The verse names two organs, throat and mouth. Rule 5: concrete images stay concrete.',
        'options': [
            {'label': 'à minha garganta', 'forms': {'faucibus': 'à minha garganta'}, 'note': 'Draft 7: the Latin\'s (and the Greek\'s) organ. Sweetness going down the throat is the stranger picture and the Latin\'s own.', 'from': 'draft'},
            {'label': 'ao meu paladar', 'forms': {'faucibus': 'ao meu paladar'}, 'note': 'Douay-Rheims "palate", Matos Soares, the Diurnal — every version. Where taste is felt; the natural word.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'lucerna', 'refs': ['118:105'], 'kind': 'word', 'latin': 'Lucérna pédibus meis verbum tuum',
        'why': 'lucérna, an oil lamp. The copula is supplied ("é"), as Matos Soares does. lumen → luz (glossary).',
        'options': [
            {'label': 'Lâmpada', 'forms': {'lucerna': 'Lâmpada'}, 'note': 'Draft 7: Matos Soares and the Diurnal alike; the word by which the verse is known. Proparoxytone, but at the head of the verse, not at a cadence.', 'from': 'MS1932'},
            {'label': 'Candeia', 'forms': {'lucerna': 'Candeia'}, 'note': 'Exactly an oil lamp, and paroxytone; rustic and fading from use.', 'from': 'draft'},
        ],
    },
    {
        'id': 'statui', 'refs': ['118:106'], 'kind': 'word', 'latin': 'Jurávi, et státui custodíre',
        'why': 'statúere with an infinitive is Lewis & Short\'s second sense, "to decide, determine, resolve". In 118:38 (Státue servo tuo elóquium tuum → Firmai) it is the first sense, to establish. The Greek has one verb in both (ἔστησα / στῆσον); Portuguese has none that does both.',
        'options': [
            {'label': 'e determinei', 'forms': {'statui': 'e determinei'}, 'note': 'Draft 7, Matos Soares ("Jurei e determinei"); Douay-Rheims "am determined". Takes the infinitive as státui does.', 'from': 'MS1932'},
            {'label': 'e firmei', 'forms': {'statui': 'e firmei'}, 'note': 'The glossary row (statúere → firmar, which foresaw this verse): keeps the echo of 118:38. But "firmei guardar" is not Portuguese; it would need a supplied noun ("firmei o propósito de").', 'from': 'glossary'},
            {'label': 'e resolvi', 'forms': {'statui': 'e resolvi'}, 'note': 'Plainer; lighter than an oath\'s companion.', 'from': 'draft'},
        ],
    },
    {
        'id': 'voluntaria', 'refs': ['118:108'], 'kind': 'word', 'latin': 'Voluntária oris mei',
        'why': 'A neuter plural adjective used as a noun: "the voluntary things of my mouth" — τὰ ἑκούσια, the free-will offerings of the Law, here offered by the mouth. Douay-Rheims "The free offerings of my mouth"; Matos Soares "a oferta espontânea da minha boca".',
        'options': [
            {'label': 'as ofertas voluntárias', 'forms': {'voluntaria': 'as ofertas voluntárias'}, 'note': 'Draft 7: the noun supplied, as both Vulgate-family versions supply it (compare 117:27b, where "ramos" is supplied with Douay-Rheims); the Latin\'s adjective kept.', 'from': 'DRB'},
            {'label': 'o que é voluntário', 'forms': {'voluntaria': 'o que é voluntário'}, 'note': 'Nothing supplied; the verse then needs "Fazei bem aceito …" and is hard to follow.', 'from': 'draft'},
            {'label': 'as ofertas de livre vontade', 'forms': {'voluntaria': 'as ofertas de livre vontade'}, 'note': 'With the glossary\'s voluntárie → de livre vontade (53:8). Four syllables longer in an already long colon.', 'from': 'glossary'},
        ],
    },
    {
        'id': 'beneplacita', 'refs': ['118:108'], 'kind': 'word', 'latin': 'beneplácita fac, Dómine',
        'why': 'beneplácita fácere, to make well-pleasing (εὐδόκησον, be pleased with). "Agradável" is jucúndus\'s (118:39).',
        'options': [
            {'label': 'Fazei bem aceitas', 'forms': {'beneplacita': 'Fazei bem aceitas'}, 'note': 'Draft 7: bene-plácita part by part, in an expression Portuguese has ("bem aceito"); fac stays "fazei". Natural order: the imperative first, the long object after the vocative.', 'from': 'draft'},
            {'label': 'Tornai agradáveis', 'forms': {'beneplacita': 'Tornai agradáveis'}, 'note': 'Douay-Rheims "make acceptable", Matos Soares "que te seja agradável". Spends jucúndus\'s word.', 'from': 'MS1932'},
            {'label': 'Aceitai com agrado', 'forms': {'beneplacita': 'Aceitai com agrado'}, 'note': 'What the Greek says (the Diurnal: "aceita"). Drops fac.', 'from': 'DM1962'},
        ],
    },
    {
        'id': 'posuerunt', 'refs': ['118:110'], 'kind': 'word', 'latin': 'Posuérunt peccatóres láqueum mihi',
        'why': 'láqueus → laço (glossary, Ps 90:3). The verb: pónere.',
        'options': [
            {'label': 'puseram um laço para mim', 'forms': {'posuerunt': 'puseram um laço para mim'}, 'note': 'Draft 7: pónere → pôr, the plain verb, with the dative as "para mim".', 'from': 'draft'},
            {'label': 'me armaram um laço', 'forms': {'posuerunt': 'me armaram um laço'}, 'note': 'The idiom (Matos Soares "armaram-me laços", Douay-Rheims "laid a snare").', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'erravi', 'refs': ['118:110'], 'kind': 'glossary', 'latin': 'de mandátis tuis non errávi',
        'why': 'erráre de, to stray from (πλανάομαι). The verb returns in the last verse of the psalm (118:176 Errávi sicut ovis quæ périit), so the word chosen here should serve there. "Desviar" is avértere\'s, "apartar-se" declináre\'s, "afastar" amovére\'s.',
        'options': [
            {'label': 'não me extraviei', 'forms': {'erravi': 'não me extraviei'}, 'note': 'Draft 7: to go off the road, of sheep and of men; fits 118:176 (Extraviei-me como ovelha).', 'from': 'draft'},
            {'label': 'não errei', 'forms': {'erravi': 'não errei para longe'}, 'note': 'The cognate; "errar" is first "to make a mistake", so it needs "para longe" to be heard as wandering.', 'from': 'draft'},
            {'label': 'não me desviei', 'forms': {'erravi': 'não me desviei'}, 'note': 'The natural word (Matos Soares "não me afastei"); it is avértere\'s in this psalter.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'faciendas', 'refs': ['118:112'], 'kind': 'grammar', 'latin': 'ad faciéndas justificatiónes tuas',
        'why': 'fácere with the law-word as object. "Fazer os preceitos" is not Portuguese; the light verb yields, as in 118:65 (bonitátem fácere → usar de bondade). "Praticar" is operári\'s (praticar a iniquidade). "Cumprir" is safe here, being an infinitive (the vós imperative "cumpri" is a rule-3 trap, as the previous portion noted).',
        'options': [
            {'label': 'para cumprir', 'forms': {'faciendas': 'para cumprir'}, 'note': 'Draft 7: what one does with a precept in Portuguese. "Para" repeats the build of 118:36 (Inclinai o meu coração para …).', 'from': 'draft'},
            {'label': 'a praticar', 'forms': {'faciendas': 'a praticar'}, 'note': 'Matos Soares. Operári\'s verb.', 'from': 'MS1932'},
            {'label': 'para fazer', 'forms': {'faciendas': 'para fazer'}, 'note': 'The Latin\'s verb (Douay-Rheims "to do thy justifications"). A calque.', 'from': 'DRB'},
        ],
    },
    {
        'id': 'odio_habui', 'refs': ['118:113', '118:128'], 'kind': 'glossary', 'latin': 'Iníquos ódio hábui · omnem viam iníquam ódio hábui (118:104 has odívi)',
        'why': 'The Latin has odívi in 118:104 and ódio hábui in 118:113, 128 (and 118:163 to come); the Greek has ἐμίσησα every time. Odísse has no perfect of its own, and ódio habére supplies one: the variation is the Latin translator\'s, with no difference of sense — D15\'s test for sermo, applied to a verb.',
        'options': [
            {'label': 'odiei', 'forms': {'odio113': 'Odiei os iníquos', 'odio128': 'odiei todo caminho iníquo'}, 'note': 'Draft 7: one verb, as the Greek and every version (Douay-Rheims "I have hated"). 118:104b and 118:128b become near-twins, as they are in Latin but for this variation.', 'from': 'DRB'},
            {'label': 'tive ódio a', 'forms': {'odio113': 'Tive ódio aos iníquos', 'odio128': 'tive ódio a todo caminho iníquo'}, 'note': 'Keeps the Latin\'s periphrasis apart from odívi. Sayable; heavier.', 'from': 'draft'},
        ],
    },
    {
        'id': 'suscipe', 'refs': ['118:116', '118:122'], 'kind': 'glossary', 'latin': 'Súscipe me secúndum elóquium tuum, et vivam · Súscipe servum tuum in bonum',
        'why': 'suscípere → amparar is settled (D19), with suscéptor → amparo — which stands two verses earlier (118:114 suscéptor meus), so noun and verb answer each other here as in Ps 3. Made a decision because 118:116 is a verse with a life of its own: from general knowledge (not verified on disk), it is the Suscipe sung at monastic profession, where it is understood as "receive me".',
        'options': [
            {'label': 'Amparai', 'forms': {'suscipe116': 'Amparai-me', 'suscipe122': 'Amparai'}, 'note': 'Draft 7, D19; Matos Soares has "Ampara-me" and "Ampara o teu servo". Safe at the vós imperative. The Greek (ἀντιλαβοῦ, take hold of to help) is this sense.', 'from': 'glossary'},
            {'label': 'Recebei', 'forms': {'suscipe116': 'Recebei-me', 'suscipe122': 'Recebei'}, 'note': 'The other sense of suscípere, and how the verse is heard at a profession. It would break the pair with 118:114 "o meu amparo".', 'from': 'draft'},
            {'label': 'Sustentai', 'forms': {'suscipe116': 'Sustentai-me', 'suscipe122': 'Sustentai'}, 'note': 'Douay-Rheims "Uphold"; the Diurnal "Sustenta-me".', 'from': 'DRB'},
        ],
    },
    {
        'id': 'discedentes', 'refs': ['118:118'], 'kind': 'word', 'latin': 'omnes discedéntes a judíciis tuis',
        'why': 'discédere a, to go away from (ἀποστατέω). The psalm\'s other verbs of leaving are declináre a → apartar-se de, derelínquere → abandonar, erráre de → extraviar-se de.',
        'options': [
            {'label': 'os que se afastam', 'forms': {'discedentes': 'os que se afastam'}, 'note': 'Draft 7: the natural verb. It is the reflexive of "afastar", which already serves amovére and repéllere (transitive, of God acting); here men remove themselves.', 'from': 'draft'},
            {'label': 'os que se retiram', 'forms': {'discedentes': 'os que se retiram'}, 'note': 'A verb of its own (6:9 Discédite a me will want "Retirai-vos de mim"); "retirar-se dos juízos" is odd.', 'from': 'draft'},
            {'label': 'os que se desviam', 'forms': {'discedentes': 'os que se desviam'}, 'note': 'Matos Soares. Avértere\'s verb.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'praevaricantes', 'refs': ['118:119'], 'kind': 'word', 'latin': 'Prævaricántes reputávi omnes peccatóres terræ',
        'why': 'The Latin\'s reading (with the Greek: παραβαίνοντας ἐλογισάμην), not the Hebrew\'s dross. prævaricári, to walk crookedly, to transgress; reputáre, to reckon. In Brazil "prevaricação" is a civil servant\'s crime of neglecting his duty. "Considerar" is consideráre\'s.',
        'options': [
            {'label': 'Tive por transgressores', 'forms': {'praevaricantes': 'Tive por transgressores'}, 'note': 'Draft 7. "Transgressores" is the Greek\'s word and the plain one (D2: of two faithful words the plainer); "ter por" is reputáre without a learned verb.', 'from': 'draft'},
            {'label': 'Tive por prevaricadores', 'forms': {'praevaricantes': 'Tive por prevaricadores'}, 'note': 'The cognate (Douay-Rheims "prevaricators", Matos Soares). Heard as a term of administrative law.', 'from': 'MS1932'},
            {'label': 'Reputei como prevaricadores', 'forms': {'praevaricantes': 'Reputei como prevaricadores'}, 'note': 'Matos Soares word for word.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'confige', 'refs': ['118:120'], 'kind': 'word', 'latin': 'Confíge timóre tuo carnes meas',
        'why': 'The Latin\'s reading (the Hebrew has the flesh bristling with dread). confígere: Lewis & Short "to fasten together; to pierce through, transfix"; the Greek καθήλωσον is "nail down". Both verbs are safe at the vós imperative.',
        'options': [
            {'label': 'Traspassai', 'forms': {'confige': 'Traspassai'}, 'note': 'Draft 7: Douay-Rheims "Pierce", Matos Soares "Traspassa". With "com o vosso temor" as the weapon.', 'from': 'MS1932'},
            {'label': 'Cravai', 'forms': {'confige': 'Cravai'}, 'note': 'The Greek\'s nails, which the Fathers heard here; but "cravar" wants the thing driven in as its object (cravar o temor nas carnes), which would turn the Latin\'s syntax round.', 'from': 'draft'},
        ],
    },
    {
        'id': 'timui120', 'refs': ['118:120'], 'kind': 'grammar', 'latin': 'a judíciis enim tuis tímui',
        'why': 'timére a + ablative: the glossary (Ps 90, open) turns it into a direct object. enim → pois.',
        'options': [
            {'label': 'pois temi os vossos juízos', 'forms': {'timui120': 'pois temi {jd_acc}'}, 'note': 'Draft 7, the glossary; Matos Soares "porque temi os teus juízos".', 'from': 'glossary'},
            {'label': 'pois dos vossos juízos tive temor', 'forms': {'timui120': 'pois {jd_gen} tive temor'}, 'note': 'Keeps the preposition and the Latin\'s order, and echoes "temor" in the first colon as tímui echoes timóre.', 'from': 'draft'},
        ],
    },
    {
        'id': 'feci_judicium', 'refs': ['118:121'], 'kind': 'grammar', 'latin': 'Feci judícium et justítiam',
        'why': 'The biblical pair judícium et justítia with fácere. The same verb and noun as 118:84 (quando fácies … judícium?): he has done judgment and asks when God will.',
        'options': [
            {'label': 'Fiz juízo e justiça', 'forms': {'feci_judicium': 'Fiz {jd_sg} e justiça'}, 'note': 'Draft 7: fácere → fazer, so that it answers 118:84 "fareis juízo"; without articles, as the pair is said.', 'from': 'draft'},
            {'label': 'Pratiquei o juízo e a justiça', 'forms': {'feci_judicium': 'Pratiquei o {jd_sg} e a justiça'}, 'note': 'Matos Soares\' verb ("Tenho praticado a rectidão e a justiça"). Operári\'s verb in this psalter; loses the answer to 118:84.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'calumniari', 'refs': ['118:121', '118:122'], 'kind': 'word', 'latin': 'calumniántibus me · non calumniéntur me supérbi',
        'why': 'calumniári: Lewis & Short "to accuse falsely … to practise chicanery … to misrepresent". The Greek behind it has two verbs (ἀδικοῦσιν, συκοφαντησάτωσαν) and the Hebrew means to oppress; the Latin says slander, twice.',
        'options': [
            {'label': 'caluniar', 'forms': {'cal121': 'caluniam', 'cal122': 'caluniem'}, 'note': 'Draft 7: the Latin\'s word, twice, as the Latin has it; Matos Soares, Douay-Rheims ("slander … calumniate").', 'from': 'MS1932'},
            {'label': 'oprimir', 'forms': {'cal121': 'oprimem', 'cal122': 'oprimam'}, 'note': 'The Hebrew\'s sense (the Diurnal: "opressores … não me oprimam"). Refused: not what the Latin says.', 'from': 'DM1962'},
        ],
    },
    {
        'id': 'v123b', 'refs': ['118:123'], 'kind': 'glossary', 'latin': 'et in elóquium justítiæ tuæ',
        'why': 'D16 names this verse: the singular elóquium with a genitive, where the clause "o que dissestes" cannot simply stand. The genitive is open — the utterance that belongs to your justice, that your justice spoke, or that is just (Douay-Rheims "the word of thy justice"; Matos Soares "das promessas da tua justiça").',
        'options': [
            {'label': 'pelo dito da vossa justiça', 'forms': {'v123b': '{e_just}'}, 'note': 'Draft 7: the noun, as D16 allows ("dito available"). It keeps the genitive as open as the Latin has it, and the root of "os vossos ditos" / "o que dissestes". This form follows decision "eloquia" (and, for its preposition, "deficere_in").', 'from': 'glossary'},
            {'label': 'pelo que disse a vossa justiça', 'forms': {'v123b': '{def_o} que disse a vossa justiça'}, 'note': 'D16\'s clause carried through. It reads well, but it makes "justice" the speaker: one of the genitive\'s readings, chosen for the reader.', 'from': 'draft'},
            {'label': 'pela vossa palavra de justiça', 'forms': {'v123b': '{def_a} vossa palavra de justiça'}, 'note': 'D16\'s named retreat (palavra) with the genitive as a quality. Merges elóquium into verbum.', 'from': 'draft'},
        ],
    },
    {
        'id': 'fac_cum', 'refs': ['118:124'], 'kind': 'grammar', 'latin': 'Fac cum servo tuo secúndum misericórdiam tuam',
        'why': 'fácere cum, to deal with. The obvious verb, "agir", is a rule-3 trap: the vós imperative "Agi" is also "I acted". 118:65 has the same build with an object (Bonitátem fecísti cum servo tuo → Usastes de bondade com), and 118:78 turned iniquitátem fácere in into "tratar com iniquidade".',
        'options': [
            {'label': 'Tratai o vosso servo', 'forms': {'fac_cum': 'Tratai o vosso servo'}, 'note': 'Draft 7, Matos Soares ("Trata o teu servo"); the light verb yields (D2). "Tratai" ≠ "tratei".', 'from': 'MS1932'},
            {'label': 'Fazei com o vosso servo', 'forms': {'fac_cum': 'Fazei com o vosso servo'}, 'note': 'The Latin\'s words; in Portuguese "fazer com alguém" waits for an object that never comes.', 'from': 'draft'},
        ],
    },
    {
        'id': 'sciam', 'refs': ['118:125'], 'kind': 'word', 'latin': 'ut sciam testimónia tua',
        'why': 'scire, beside sciéntia → o saber (118:66); cognóscere / novísse → conhecer (118:75, 79 "os que conhecem os vossos testemunhos").',
        'options': [
            {'label': 'saiba', 'forms': {'sciam': 'saiba'}, 'note': 'Draft 7: scire → saber, kept apart from conhecer. "Saber" with a noun object is to have it learnt, which suits the testimonies.', 'from': 'draft'},
            {'label': 'conheça', 'forms': {'sciam': 'conheça'}, 'note': 'Matos Soares, Douay-Rheims "know"; the more natural verb with this object. Merges with novérunt (118:79), as the Greek does (γνώσομαι).', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'tempus_faciendi', 'refs': ['118:126'], 'kind': 'ambiguity', 'latin': 'Tempus faciéndi, Dómine',
        'why': 'The Latin has a vocative where the Greek has a dative (τῷ κυρίῳ, "time to act for the Lord"): "time for acting, Lord" — whether the Lord is to act or the psalmist is left open. Matos Soares closes it ("É tempo, Senhor, de procederes (com rigor)"). "Agir" is safe here as an infinitive.',
        'options': [
            {'label': 'É tempo de agir, Senhor', 'forms': {'tempus_faciendi': 'É tempo de agir, Senhor'}, 'note': 'Draft 7: the copula supplied, the agent left open as in the Latin. The same words stand in the Diurnal (from the Hebrew) — it is simply what the phrase is in Portuguese.', 'from': 'draft'},
            {'label': 'Tempo de agir, Senhor', 'forms': {'tempus_faciendi': 'Tempo de agir, Senhor'}, 'note': 'Verbless, as the Latin. Abrupt in a way the Latin is not.', 'from': 'draft'},
            {'label': 'É tempo de agirdes, Senhor', 'forms': {'tempus_faciendi': 'É tempo de agirdes, Senhor'}, 'note': 'With Matos Soares and Douay-Rheims\' tradition of reading the Lord as agent. Closes what the Latin leaves open.', 'from': 'MS1932'},
        ],
    },
    {
        'id': 'dissipaverunt', 'refs': ['118:126'], 'kind': 'word', 'latin': 'dissipavérunt legem tuam',
        'why': 'dissipáre, to scatter, and so to demolish, bring to nothing (διεσκέδασαν). In Portuguese "dissipar" is said of fog, doubts and fortunes.',
        'options': [
            {'label': 'dissiparam', 'forms': {'dissipaverunt': 'dissiparam'}, 'note': 'Draft 7: the Latin\'s word and its image of scattering (Matos Soares, Douay-Rheims "dissipated"). Unusual with "lei", as it is in Latin.', 'from': 'MS1932'},
            {'label': 'desfizeram', 'forms': {'dissipaverunt': 'desfizeram'}, 'note': 'The plain verb for undoing; the scattering is lost.', 'from': 'draft'},
            {'label': 'violaram', 'forms': {'dissipaverunt': 'violaram'}, 'note': 'The Diurnal (from the Hebrew). What one usually does to a law; another word\'s meaning.', 'from': 'DM1962'},
        ],
    },
    {
        'id': 'dirigebar', 'refs': ['118:128'], 'kind': 'grammar', 'latin': 'ad ómnia mandáta tua dirigébar',
        'why': 'dirígere → dirigir (118:5 Útinam dirigántur viæ meæ → sejam dirigidos). The form is an imperfect passive, which can also be middle (the Greek κατωρθούμην, I was kept straight).',
        'options': [
            {'label': 'eu era dirigido a', 'forms': {'dirigebar': 'eu era dirigido a'}, 'note': 'Draft 7: the passive, as 118:5 and Douay-Rheims ("was I directed"): the wish of 118:5 is here reported as granted. "Eu" because the form is also third person.', 'from': 'DRB'},
            {'label': 'eu me dirigia para', 'forms': {'dirigebar': 'eu me dirigia para'}, 'note': 'The middle reading (Matos Soares "enveredei pela senda de"). More natural; the psalmist directs himself.', 'from': 'draft'},
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

# ---------------------------------------------------------------- choices
data['choices'].update({
    '118:81': 'Defécit → "desfaleceu" (the family set by 118:53 deféctio → desfalecimento); decision "deficere_in" for the preposition. salutáre → salvação (D6). The second colon is word for word 118:114b and reads the same there; supersperávi → "pus toda a esperança" (decision "supersperavi"). The possessive of "esperança" is not supplied, as in 118:43, 74.',
    '118:82': 'elóquium under D16: the clause, here after the preposition of decision "deficere_in" → "pelo que dissestes". Two things to know: (1) "dissestes, * dizendo" sets the root of dizer on both sides of the asterisk; the Latin has two roots (elóquium … dicéntes), but the Greek has one (τὸ λόγιόν σου λέγοντες), so the echo is the Septuagint\'s and was let stand. (2) The eyes "say" in the Latin too; nothing smoothed. consolári → consolar (118:50, 52, 76).',
    '118:83': 'uter in pruína → "um odre na geada": the Latin\'s (and the Greek\'s) frost, not the Hebrew\'s smoke; Matos Soares "odre exposto à geada" without his gloss. Quia → "Porque" (the verse leans on 118:82). non sum oblítus → "não esqueci", natural order, as in 118:30, 61.',
    '118:84': 'Two questions, as in the Latin, the second with a lowercase start after the asterisk as DO prints it. persequi → perseguir (also 118:86). Decision "v84b".',
    '118:85': 'narráre → narrar (glossary, Ps 117:17). Natural order (subject first). The second colon keeps the Latin\'s ellipsis (sed non ut lex tua): Matos Soares expands it ("quão diferente é tudo isso da tua lei"), which goes beyond the Latin. iníqui → iníquos (glossary).',
    '118:86': 'Copula supplied ("são verdade"), as in 118:75. iníque → "iniquamente" (apart from injúste → injustamente, 118:78). ádjuva me: decision "adjuva".',
    '118:87': 'in terra → "na terra": open between "on earth" and "in the land", as the Latin. ego autem → "mas eu" (formula of this psalm). derelínquere → abandonar (118:8, 53).',
    '118:88': 'vivífica me → vivificai-me (formula); custódiam → guardarei; testimónia oris tui → "os testemunhos da vossa boca" (compare 118:13 judícia oris tui, 118:72 lex oris tui).',
    '118:89': 'Lamed opens on In ætérnum (decision "in_aeternum"). pérmanet → permanece, twice (118:89, 90). Seven syllables before the asterisk for the Latin\'s seven.',
    '118:90': 'Decision "v90a". "e ela permanece": the subject named (D2), because a bare "e permanece" would reach back to "a vossa verdade".',
    '118:91': 'Decisions "ordinatione" and "perseverat". ómnia → "todas as coisas" (Matos Soares): "tudo vos serve" is heard as "everything suits you".',
    '118:92': 'Decision "nisi_quod". tunc forte → "então talvez" — forte is translated (Douay-Rheims "perhaps"; Matos Soares turns it into "de certo", which is the opposite). in humilitáte mea → "na minha humilhação" (the slot of 118:50). períre → perecer (glossary).',
    '118:93': 'in ipsis → "neles" (by them / in them: the Latin\'s in kept). The Greek adds κύριε at the end; the Latin does not. vivificásti me → "me vivificastes".',
    '118:94': 'Tuus sum ego → "Eu sou vosso": natural order (the Latin\'s "Vosso sou eu" is the alternative a reader may prefer; not made a decision). salvum me fac → "salvai-me" (glossary formula). exquisívi → procurei.',
    '118:95': 'The Latin\'s emphatic Me at the head is given up to natural order. Asyndeton kept between the cola: the Latin has no "but" (Douay-Rheims and Matos Soares add one). intellégere → entender (glossary): four times in Lamed–Mem (118:95, 99, 100, 104), always "entendi".',
    '118:96': 'Decisions "consummationis" and "latum96". The echo consummavérunt (118:87) … consummatiónis is lost in Portuguese; see decision "consummaverunt". mandátum tuum: one of the two singulars of the psalm, kept singular.',
    '118:97': 'The verse ends its first colon with "!" where DO\'s Latin prints "?" (decision "quomodo"). meditátio mea est → "é a minha meditação" (formula). "ela" is supplied so that "todo o dia" is not taken for the subject ("the whole day is my meditation").',
    '118:98': 'Long first colon (about +4): "os vossos mandamentos" and its singular are long psalm-wide (accepted in the word study). prudéntem me fecísti → "me fizestes prudente"; mandáto tuo (ablative of means) → "pelo vosso mandamento".',
    '118:99': 'docéntes me → "os que me ensinam" (docére → ensinar). intelléxi absolute → "entendi", as the Latin. Formula: testimónia tua meditátio mea est → "os vossos testemunhos são a minha meditação" (118:24).',
    '118:100': 'quǽrere → buscar (glossary), kept apart from exquírere → procurar, which stands in 118:94: this is the verse the exquirere decision points to.',
    '118:101': 'via mala → "caminho mau". verba tua → "as vossas palavras" (verbum, plural).',
    '118:102': 'declináre a → apartar-se de (118:51, word for word the same build). tu, emphatic → "vós" expressed. Same verb as 118:33 (decision "legem_pone").',
    '118:103': 'The plural elóquia → "os vossos ditos" (D16), as 118:11. super mel ori meo → "mais que o mel à minha boca": the two datives (fáucibus meis … ori meo) are built alike. The Greek adds "and honeycomb"; the Latin does not.',
    '118:104': 'A mandátis tuis → "Pelos vossos mandamentos" (Douay-Rheims "By thy commandments"): from them comes the understanding. proptérea → "por isso" (118:67). odívi → "odiei". "todo caminho de iniquidade": "todo" without article = every.',
    '118:105': 'The copula supplied once, in the first colon. lumen → luz (glossary). sémitis meis → "as minhas veredas" (D15), plural as the Latin. pédibus → "pés" (the image; the Diurnal and Matos Soares have "passos").',
    '118:106': 'judícia justítiæ tuæ → "os juízos da vossa justiça", identical with 118:7 as the glossary requires. The asterisk falls after the two verbs, as in the Latin; the first colon is short (five syllables for the Latin\'s six).',
    '118:107': 'usquequáque → "de todo" (118:8, 43). secúndum verbum tuum → "segundo a vossa palavra" (formula, = the Nunc dimittis). humiliáre → humilhar.',
    '118:108': 'Decisions "voluntaria" and "beneplacita". judícia tua doce me → "ensinai-me os vossos juízos" (the build of the formula doce me justificatiónes tuas).',
    '118:109': 'Copula supplied ("está"). in mánibus meis: the Latin\'s reading (first person), kept; the image — a life carried in one\'s hands, exposed — is not explained.',
    '118:110': 'Decisions "posuerunt" and "erravi". et → "e", though the sense is adversative: the Latin says et.',
    '118:111': 'Hereditáte acquisívi → "Adquiri por herança" (Douay-Rheims "purchased … for an inheritance" is over-literal; acquírere is simply to acquire). exsultátio → exultação (glossary).',
    '118:112': 'Decision "faciendas". propter retributiónem → "por causa da retribuição" (glossary retribútio → retribuição; the Latin\'s reading, not the Hebrew\'s "to the end").',
    '118:113': 'Iníquos: the Latin\'s (and Greek\'s) reading, not the Hebrew\'s "the double-minded". Decision "odio_habui". dilígere → amar, perfect kept (118:47).',
    '118:114': 'Adjútor et suscéptor meus es tu → "Vós sois o meu auxílio e o meu amparo": natural order; the possessive is said with each noun, because "o meu auxílio e amparo" would fuse the two into one title. suscéptor → amparo (D19). Second colon = 118:81b.',
    '118:115': 'Declináte a me, malígni → "Apartai-vos de mim, malignos", the wording the word study fixed in advance. scrutábor → sondarei. mandáta Dei mei: the only place in the psalm where God is spoken of in the third person to others.',
    '118:116': 'The formula secúndum elóquium tuum → "segundo o que dissestes" (D16). et vivam → "e viverei" (as 118:77). Decisions "suscipe", "exspectare"; non confúndas me → "não me envergonheis" (D15).',
    '118:117': 'salvus ero → "serei salvo". semper → sempre; "sempre" moved before the law-word, as in 118:44, so that the verse closes on "preceitos".',
    '118:118': 'spérnere → desprezar (shares the word with contémptus → desprezo, 118:22). cogitátio → pensamento (cogitáre → pensar em, 118:59). Copula supplied. The Greek has "from your precepts" here; the Latin has judíciis, followed.',
    '118:119': 'Decision "praevaricantes". ídeo → "por isso", the same as proptérea (118:104, 128): the Greek has one phrase (διὰ τοῦτο) for both, and in 118:127–128 the two stand in neighbouring verses, both "Por isso" (as Matos Soares).',
    '118:120': 'carnes meas → "as minhas carnes", plural kept (Matos Soares). Decisions "confige", "timui120". timor … tímui: "temor … temi", the echo kept.',
    '118:121': 'trádere → entregar (glossary). Decisions "feci_judicium", "calumniari".',
    '118:122': 'in bonum → "para o bem". supérbi → soberbos. 118:122 is one of the six verses of the psalm with none of the eight law-words.',
    '118:123': 'The verse gathers 118:81 and 118:82 into one (salutáre + elóquium after defícere in), so it uses their wording. Decision "v123b".',
    '118:124': 'Decision "fac_cum". justificatiónes tuas doce me → "ensinai-me os vossos preceitos" — the formula, though the Latin reorders it (as ruled for 118:64).',
    '118:125': '"Eu sou o vosso servo": article with the possessive (rule 5). Da mihi intelléctum → "dai-me entendimento" (formula), here with ut, not et.',
    '118:126': 'Decisions "tempus_faciendi", "dissipaverunt".',
    '118:127': 'super aurum et topázion → "mais que o ouro e o topázio": the Latin\'s (and Greek\'s) topaz, not the Hebrew\'s fine gold.',
    '118:128': 'ad ómnia mandáta tua → "a todos os vossos mandamentos". The second colon is the near-twin of 118:104b (viam iniquitátis / viam iníquam): "todo caminho de iniquidade" / "todo caminho iníquo" keep the Latin\'s difference. Decisions "dirigebar", "odio_habui".',
})

# ---------------------------------------------------------------- audit
data['audit'] += [
    {'step': 'draft', 'version': 7, 'note': 'Draft 7 = draft 6 (118:1–80, untouched, kept as prayed.v6.json) + the first draft of 118:81–128 (Caph–Ain), by the third Ps 118 agent. From the Latin, read with the Rahlfs Greek, Douay-Rheims and Matos Soares 1932 (pdftotext layer in consult/parallels/ps118.md); the Diurnal Monástico 1962 for diction only; DO\'s Portuguese not consulted as a witness (D12). Lewis & Short looked up for consummátio, fabulátio (it cites this very verse: "narration, discourse"), confígo, fauces, calúmnior (letter F fetched into consult/). D15/D16 vocabulary applied throughout by adding slots to the existing term decisions (justificationes, testimonia, mandata, judicia, eloquia, confundi, vivifica, supersperavi, exquirere, scrutantur, semita, legem_pone, intellectum, humilitate); 41 new verse-local decisions. Places where the Latin goes with the Septuagint against the Hebrew, all followed: 118:83 frost (not smoke), 118:85 tales told (not pits dug), 118:109 my hands, 118:112 "for the reward", 118:113 the iniquitous (not the double-minded), 118:119 "I reckoned as transgressors" (not dross), 118:120 "pierce … with your fear", 118:121–122 slander (not oppression), 118:126 the vocative Dómine, 118:127 topaz. Hard readings: defícere in (118:81, 82, 123); elóquium after a preposition (118:82) and with a genitive (118:123); consummavérunt / consummatiónis (118:87, 96); Voluntária … beneplácita fac (118:108); Tempus faciéndi (118:126). Rule-3 trap met: "Agi" (fac cum, 118:124) → "Tratai". The Hetzenauer print read is owed for these verses as for the rest.'},
]

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 7 written:', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
