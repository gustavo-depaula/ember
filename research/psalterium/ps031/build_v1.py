"""Ps 31 draft 1. python3.13 research/psalterium/ps031/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '31:1': 'Bem-aventurados aqueles cujas iniquidades foram {remissae}: * e cujos pecados foram {tecta}.',
    '31:2': 'Bem-aventurado o homem a quem o Senhor não {imputavit} pecado, * e em cujo espírito não há engano.',
    '31:3': 'Porque me calei, os meus ossos envelheceram, * enquanto eu clamava o dia todo.',
    '31:4': 'Porque de dia e de noite {gravata} sobre mim a vossa mão: * {conversus} {aerumna}, {spina}.',
    '31:5': 'Dei-vos a conhecer a minha falta: * e não escondi a minha injustiça.',
    '31:5b': 'Eu disse: {confitebor} contra mim a minha injustiça ao Senhor: * e vós {remisisti} a impiedade do meu pecado.',
    '31:6': '{pro_hac} orará a vós {omnis_sanctus}, * no tempo oportuno.',
    '31:6b': 'Todavia, no dilúvio das muitas águas, * não se aproximarão dele.',
    '31:7': 'Vós sois o meu refúgio contra a tribulação que me cercou: * {exsultatio}, arrancai-me dos que me cercam.',
    '31:8': 'Eu {intellectum}, e te instruirei no caminho por onde andarás: * {firmabo} sobre ti os meus olhos.',
    '31:9': 'Não vos torneis como o cavalo e o mulo, * que não têm {intellectus9}.',
    '31:9b': 'Com {camo} e freio {constringe} as queixadas deles, * que não se aproximam de vós.',
    '31:10': 'Muitos são os flagelos do pecador, * {sperantem}.',
    '31:11': 'Alegrai-vos no Senhor e exultai, {justi}, * e gloriai-vos, todos os retos de coração.',
}

dec('remissae', ['31:1', '31:5b'], 'quorum remíssæ sunt iniquitátes … et tu remisísti impietátem peccáti mei', 'glossary',
    'remíttere (ἀφίημι, in both places) → perdoar, the verb of dimíttere (sins) in 24:18 (ἄφες; the Our Father\'s verb): one Greek verb, so'
    ' by D15\'s test one Portuguese, and the psalm\'s own echo (31:1 / 31:5b) is kept. The same pair of verbs as 84:3 \'Remisísti iniquitátem'
    ' plebis tuæ: operuísti ómnia peccáta eórum\' (grep). Romans 4:7 quotes 31:1 word for word (Clementine, fetched to'
    ' consult/bolls-VULG-45-4.json: \'Beati, quorum remissæ sunt iniquitates, et quorum tecta sunt peccata\'). The perfect passive kept'
    ' (\'foram perdoadas\'). Douay-Rheims \'forgiven\'; Matos Soares 1932 \'foram perdoadas\', \'perdoaste\'. \'remitir\' is legal or medical in Brazil.',
    o('perdoadas … perdoastes', {'remissae': 'perdoadas', 'remisisti': 'perdoastes'}, 'Ruling: one Greek verb (24:18).', 'MS1932'),
    o('remidas … remistes', {'remissae': 'remidas', 'remisisti': 'remistes'}, 'The root, via remir: collides with redímere\'s traditional verb.', 'draft'))

dec('tecta', ['31:1'], 'et quorum tecta sunt peccáta', 'word',
    'tégere (ἐπεκαλύφθησαν, \'covered over\'): the image of sin covered, kept. Douay-Rheims \'covered\'; Matos Soares 1932 \'apagados\''
    ' (another image). 84:3 \'operuísti\' (another Latin verb, the same image) can take \'cobrir\' too.',
    o('cobertos', {'tecta': 'cobertos'}, 'Ruling: the image kept (DRB, Rom 4:7).', 'DRB'),
    o('apagados', {'tecta': 'apagados'}, 'Matos Soares 1932: another image.', 'MS1932'))

dec('imputavit', ['31:2'], 'cui non imputávit Dóminus peccátum', 'word',
    'imputáre (only here; οὐ μὴ λογίσηται, \'reckon\'): the word Romans 4:8 quotes (Clementine, fetched: \'Beatus vir, cui non imputavit'
    ' Dominus peccatum\') and on which Paul builds 4:1–11 (\'reputatur … ad justitiam\', 4:5, 4:9). \'imputar\' is the Latin\'s word and'
    ' current in Catholic teaching; \'levar em conta\' is plainer and says the reckoning. Douay-Rheims \'imputed\'; Matos Soares 1932'
    ' \'não argúiu de pecado\' (another verb).',
    o('imputou', {'imputavit': 'imputou'}, 'Ruling: the Latin\'s word (Rom 4:8).', 'DRB'),
    o('levou em conta o', {'imputavit': 'levou em conta o'}, 'The reckoning said plainly.', 'draft'))

dec('gravata', ['31:4'], 'graváta est super me manus tua', 'grammar',
    'graváre in the passive (ἐβαρύνθη): \'was made heavy\'. \'se fez pesada\' keeps the change and the voice\'s middle sense (as 30:11b \'se'
    ' enfraqueceu\'); \'pesou\' is plainer and loses it. Matos Soares 1932 \'tornou-se pesada\'; Douay-Rheims \'was heavy\'.',
    o('se fez pesada', {'gravata': 'se fez pesada'}, 'Ruling: the change kept.', 'draft'),
    o('pesou', {'gravata': 'pesou'}, 'Plainer; a state.', 'DRB'),
    o('se tornou pesada', {'gravata': 'se tornou pesada'}, 'Matos Soares 1932.', 'MS1932'))

dec('conversus', ['31:4'], 'convérsus sum in ærúmna mea', 'glossary',
    'convértere → voltar (glossary): \'I was turned\' in my distress (ἐστράφην εἰς ταλαιπωρίαν — the Greek \'into misery\'; the Latin \'in'
    ' ærúmna mea\', in my misery). The man turning over in pain: \'voltei-me\' keeps the verb and the bodily turning; Matos Soares 1932'
    ' \'eu revolvia-me na minha dor\', Douay-Rheims \'I am turned in my anguish\'.',
    o('voltei-me', {'conversus': 'voltei-me'}, 'Ruling: the row\'s verb.', 'glossary'),
    o('revolvi-me', {'conversus': 'revolvi-me'}, 'Matos Soares 1932: the tossing said.', 'MS1932'))

dec('aerumna', ['31:4'], 'in ærúmna mea', 'word',
    'ærúmna (only here): \'toil, hardship, distress\' (L&S). Kept apart from tribulátio → tribulação (31:7), afflíctio → aflição, miséria →'
    ' miséria (11:6a, 39:3). \'sofrimento\' is plain and free. Douay-Rheims \'anguish\'.',
    o('sofrimento', {'aerumna': 'no meu sofrimento'}, 'Ruling: plain, free.', 'draft'),
    o('angústia', {'aerumna': 'na minha angústia'}, 'Douay-Rheims \'anguish\'; angústia\'s word (118:143).', 'DRB'),
    o('miséria', {'aerumna': 'na minha miséria'}, 'The Greek\'s ταλαιπωρία; miséria\'s word.', 'draft'))

dec('spina', ['31:4'], 'dum confígitur spina', 'glossary',
    'confígere → traspassar (glossary; the row names 31:4). With the thorn as subject of a passive (ἐν τῷ ἐμπαγῆναι ἄκανθαν, \'while a thorn'
    ' is fixed in\'), \'traspassar\' wants an object; \'cravar\' is how Portuguese says a thorn going in, and the \'se\' passive keeps the'
    ' Latin\'s voice. Douay-Rheims \'whilst the thorn is fastened\'; Matos Soares 1932 \'enquanto se cravava a espinha\' (\'espinha\' is a fish'
    ' bone or the spine in Brazil).',
    o('enquanto se crava o espinho', {'spina': 'enquanto se crava o espinho'}, 'Ruling: the thorn\'s own verb, the passive kept.', 'MS1932'),
    o('enquanto o espinho me traspassa', {'spina': 'enquanto o espinho me traspassa'}, 'The row\'s verb, active, an object supplied.', 'glossary'))

dec('confitebor', ['31:5b'], 'Confitébor advérsum me injustítiam meam Dómino', 'glossary',
    'confitéri of sin → confessar (D5: \'Confessar stays for confessing sin (31:5)\'). \'contra mim\' stands next to the verb, as the Latin'
    ' has it, so that \'a minha injustiça contra mim\' is not heard as an injustice done to me. ἐξαγορεύσω κατ᾿ ἐμοῦ. Douay-Rheims \'I will'
    ' confess against myself my injustice to the Lord\' (the same order); Matos Soares 1932 \'Confessarei ao Senhor, contra mim mesmo, a minha'
    ' injustiça\'.',
    o('Confessarei', {'confitebor': 'Confessarei'}, 'Ruling: D5.', 'glossary'))

dec('pro_hac', ['31:6'], 'Pro hac orábit ad te omnis sanctus', 'ambiguity',
    '\'Pro hac\' (ὑπὲρ ταύτης): feminine, and nothing feminine is named near it but \'impietátem\' — \'for this\' (the forgiveness just'
    ' told) is how Douay-Rheims and Matos Soares 1932 read it (\'For this\', \'Por isto\'). \'Por isto\' keeps it open to the whole of 31:5.',
    o('Por isto', {'pro_hac': 'Por isto'}, 'Ruling: DRB, MS1932.', 'DRB'),
    o('Por ela', {'pro_hac': 'Por ela'}, 'The feminine to the letter; points at \'a impiedade\'.', 'draft'))

dec('omnis_sanctus', ['31:6'], 'omnis sanctus', 'word',
    'sanctus (ὅσιος) → santo (glossary), singular and distributive. \'todo santo\' is the Latin; it risks the idiom \'todo santo dia\', and'
    ' the 30:24 reader heard \'santos\' as the canonized. Matos Soares 1932 \'todo o (homem) santo\' supplies a noun in parentheses.',
    o('todo santo', {'omnis_sanctus': 'todo santo'}, 'Ruling: the Latin.', 'DRB'),
    o('cada santo', {'omnis_sanctus': 'cada santo'}, 'The distributive plain.', 'draft'),
    o('todo homem santo', {'omnis_sanctus': 'todo homem santo'}, 'Matos Soares 1932\'s gloss.', 'MS1932'))

dec('exsultatio', ['31:7'], 'exsultátio mea', 'grammar',
    'A vocative to God, in apposition (τὸ ἀγαλλίαμά μου). The glossary\'s \'ó\' for a vocative that would not be heard as one (28:1): \'minha'
    ' exultação, arrancai-me\' could be taken as a subject. exsultátio → exultação (glossary). Matos Soares 1932 \'ó alegria minha\'.',
    o('ó minha exultação', {'exsultatio': 'ó minha exultação'}, 'Ruling: the vocative marked.', 'draft'),
    o('minha exultação', {'exsultatio': 'minha exultação'}, 'Bare, as the Latin.', 'draft'))

dec('intellectum', ['31:8', '31:9'], 'Intelléctum tibi dabo … quibus non est intelléctus', 'glossary',
    'intelléctus → entendimento (glossary, 118:34), twice in two verses: what the Lord gives the one he teaches, what the horse and mule'
    ' lack; one word for the echo. The speaker changes without mark (the Lord speaks in 31:8, and says \'tu\' to one man — D17; the'
    ' psalmist turns to \'vós\', men, in 31:9); the Latin marks nothing, and neither does the Portuguese (Matos Soares 1932 adds \'(disseste)\').'
    ' instrúere → instruir (a future, safe); gradi → andar (πορεύσῃ, the glossary\'s verb for πορεύομαι).',
    o('te darei entendimento … entendimento', {'intellectum': 'te darei entendimento', 'intellectus9': 'entendimento'}, 'Ruling: the row, twice.', 'glossary'),
    o('te darei inteligência … inteligência', {'intellectum': 'te darei inteligência', 'intellectus9': 'inteligência'}, 'Matos Soares 1932.', 'MS1932'))

dec('firmabo', ['31:8'], 'firmábo super te óculos meos', 'word',
    'firmáre (ἐπιστηριῶ): \'I will fix\'. \'firmar\' is statúere\'s too (30:9, 118:38): the row foresaw the share. Douay-Rheims \'I will fix'
    ' my eyes upon thee\'; Matos Soares 1932 \'fixarei\'.',
    o('firmarei', {'firmabo': 'firmarei'}, 'Ruling: the root kept.', 'draft'),
    o('fixarei', {'firmabo': 'fixarei'}, 'Matos Soares 1932; plainer.', 'MS1932'))

dec('camo', ['31:9b'], 'In camo et freno', 'word',
    'camus (κημός): a muzzle; frenum (χαλινός): the bridle, the bit. Only here (grep). \'cabresto e freio\' is the pair Portuguese has'
    ' for leading a beast (Matos Soares 1932); \'focinheira\' is the muzzle to the letter. Douay-Rheims \'With bit and bridle\'.',
    o('cabresto', {'camo': 'cabresto'}, 'Ruling: the familiar pair (MS1932).', 'MS1932'),
    o('focinheira', {'camo': 'focinheira'}, 'The muzzle to the letter.', 'draft'))

dec('constringe', ['31:9b'], 'maxíllas eórum constrínge', 'word',
    'constríngere (ἄγξαι, \'squeeze, throttle\'): \'bind fast\' (Douay-Rheims). \'apertai\' is safe at the imperative (past \'apertei\') and'
    ' keeps the pressure; Matos Soares 1932 \'sujeita\' (subdue). The address is to God (vós), after the \'vós\' of the men in 31:9 — the'
    ' Latin changes from plural to singular (Nolíte / constrínge), which Portuguese cannot show; \'que não se aproximam de vós\' then'
    ' names him. maxíllæ → queixadas (a beast\'s jaws; MS1932).',
    o('apertai', {'constringe': 'apertai'}, 'Ruling: the pressure kept.', 'draft'),
    o('sujeitai', {'constringe': 'sujeitai'}, 'Matos Soares 1932.', 'MS1932'),
    o('prendei', {'constringe': 'prendei'}, 'Bind.', 'DRB'))

dec('sperantem', ['31:10'], 'sperántem autem in Dómino misericórdia circúmdabit', 'order',
    'The Latin fronts the object (\'him that hopes in the Lord, mercy shall surround\'). Portuguese says it subject first; \'aquele que\''
    ' names the participle\'s person. circumdáre → cercar, the psalm\'s third (31:7 \'que me cercou … dos que me cercam\'): the tribulation'
    ' and the enemies surround in 31:7, mercy surrounds in 31:10, which the Latin sets up with one verb. Douay-Rheims \'mercy shall'
    ' encompass him that hopeth in the Lord\'.',
    o('mas aquele que espera no Senhor, a misericórdia o cercará', {'sperantem': 'mas aquele que espera no Senhor, a misericórdia o cercará'},
      'Ruling: the Latin\'s order, the object first and resumed by a pronoun (spoken Portuguese does this); it also keeps the colon from'
      ' ending on \'Senhor\', which rhymed with \'pecador\' at the mediant.', 'draft'),
    o('mas a misericórdia cercará aquele que espera no Senhor', {'sperantem': 'mas a misericórdia cercará aquele que espera no Senhor'},
      'Natural order (DRB); rhymes pecador / Senhor at the two cadences.', 'DRB'))

dec('justi', ['31:11'], 'Lætámini in Dómino et exsultáte, justi', 'grammar',
    'The vocative \'justi\' after two imperatives: bare \'exultai, justos\' can be heard as an adjective (\'rejoice, being just\');'
    ' \'ó justos\' marks the call (the glossary\'s vocative \'ó\', 28:1). The Monday None antiphon \'Exsultáte, justi, * et gloriámini,'
    ' omnes recti corde\' (Psalmi minor.txt), the All Saints antiphon (the verse whole, Sancti/11-01.txt) and the versicle of the Common'
    ' of several Martyrs (Commune/C12.txt) sing it (grep). gloriári in → gloriar-se em (glossary); rectus corde → reto de coração.',
    o('ó justos', {'justi': 'ó justos'}, 'Ruling: the vocative marked.', 'draft'),
    o('justos', {'justi': 'justos'}, 'Bare, as the Latin.', 'draft'))

data = {
    'psalm': 31, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft',
    'verses': verses,
    'decisions': decisions,
    'choices': {
        '31:1': 'beátus → bem-aventurado (D19); \'aqueles\' supplied for quorum. = Romans 4:7 (Clementine, fetched).',
        '31:2': 'beátus vir → bem-aventurado o homem (1:1, D19); dolus → engano (glossary); \'e em cujo espírito não há engano\' keeps the relative of the first colon. 31:2a = Romans 4:8.',
        '31:3': 'tacére → calar-se (27:1); inveteráre → envelhecer (6:8); tota die → o dia todo (D24). Silence and crying out in one verse: the Latin\'s paradox, kept.',
        '31:5': 'delíctum → falta (glossary, 24:7, 18:13); cógnitum fácere → dar a conhecer; injustítia → injustiça (apart from iníquitas, 31:1); abscóndere → esconder.',
        '31:5b': 'impíetas → impiedade (glossary); peccátum → pecado.',
        '31:6': 'orare → orar; in témpore opportúno → no tempo oportuno (144:15 the same phrase, grep).',
        '31:6b': 'verúmtamen → todavia (glossary); dilúvium → dilúvio (28:10); approximáre → aproximar-se (appropinquáre\'s verb; ἐγγίζω, as 31:9b); the subject of \'não se aproximarão\' is left as open as the Latin (the waters).',
        '31:7': 'refúgium → refúgio; tribulátio → tribulação; circumdáre → cercar twice; éruere with a source → arrancar (glossary).',
        '31:9': 'Nolíte fíeri → Não vos torneis (plural men, vós); equus / mulus → o cavalo e o mulo.',
        '31:10': 'flagéllum → flagelo (90:10); peccátor → pecador; a copula supplied (\'são\'); \'mas\' for autem.',
        '31:11': 'lætári → alegrar-se, exsultáre → exultar (glossary).',
    },
    'audit': [
        {'step': 'source', 'note': 'Latin = DO Psalm31.txt, 14 prayed verses: DO repeats 31:5, 31:6, 31:9, keyed 31:5b, 31:6b, 31:9b by latin.readVerses. No titulus (D7). No flex. Not in the Diurnal Monástico (no DM block in the parallels). Clementine (Bolls VULG, fetched to consult/bolls-VULG-19-31.json): no difference of wording. Romans 4:7–8 (Clementine, consult/bolls-VULG-45-4.json): 4:7 = 31:1, 4:8 = 31:2a (the second colon not quoted). Uses checked by grep in DO\'s Latin: Monday None, Pss 31, 32(1-11), 32(12-22), antiphon \'Exsultáte, justi, * et gloriámini, omnes recti corde\' (Psalmi minor.txt); 31:11 as the All Saints antiphon (Sancti/11-01.txt) and as a versicle (Commune/C12.txt, CommuneM/C12.txt); 31:1–2a read in Tempora/Nat01.txt (Romans 4). That it is the second of the seven Penitential Psalms is the tradition the brief states; DO\'s files as searched here (\'poenitent\', \'penitential\') do not list the seven, so it is not verified on disk.'},
        {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps031.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Counted with ps005/grep_latin.py: imputáre, ærúmna, constríngere, maxíllæ, camus / frenum, gradi only here; remíttere 31:1, 31:5b, 38:14, 84:3; approximáre 31:6b, 31:9b only; in témpore opportúno 31:6, 144:15; equus 31:9, 32:17. Latin (= Greek) readings kept against the Hebrew: 31:2 \'no seu espírito\' (the Greek has \'mouth\'; the Latin \'spíritu\' agrees with the Hebrew — followed), 31:4 \'voltei-me no meu sofrimento, enquanto se crava o espinho\' (not the Hebrew\'s \'my moisture turned into summer drought\'), 31:6 \'no tempo oportuno\', 31:7 \'ó minha exultação, arrancai-me dos que me cercam\' (not \'you surround me with songs of deliverance\'), 31:9b \'que não se aproximam de vós\'. Address: God is vós; in 31:8 the Lord speaks to one man (tu, D17); in 31:9 the psalmist (or the Lord) to men (vós). Tests for the readers: \'imputou\', \'cobertos\', \'se crava o espinho\', \'Por isto\', \'todo santo\', \'ó minha exultação\', the unmarked speaker of 31:8, \'cabresto e freio … queixadas\'.'},
    ],
}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(decisions), 'decisions')
