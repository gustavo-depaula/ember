"""Ps 36 stage two, draft 3 -> draft 4, after the three v3 critics (part2: 36:21–36:40). python3.13 research/psalterium/ps036/revise_v4.py
Reads prayed.v3.json (never prayed.json), so it is safe to re-run; writes prayed.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v3.json').read_text(encoding='utf-8'))
D = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


data['version'] = 4
data['status'] = 'reviewed'

# 36:25 — the Latinist (minor): 'já' is time, étenim confirms
d = D['etenim']
d['options'] = [d['options'][1], d['options'][0], d['options'][2]]
d['options'][0]['note'] = 'Ruling (draft 4): the Latinist; étenim named.'
d['options'][0]['from'] = 'latinist'
d['options'][1]['note'] = 'Draft 3: "já" gives time where étenim confirms (the Latinist, minor).'
d['why'] += (' Heard (draft 3): the Latinist, minor — «“Já” introduz uma determinação temporal no lugar do valor confirmativo de “etenim”»'
             ' → \'e de fato envelheci\'. Taken: the heavier phrase says the Latin\'s word; the stylist did not remark on the verse.')

# 36:31 — the Latinist (MAJOR): the passive lost; the stylist: the subject after the verb
V['36:31'] = 'A lei do seu Deus está no seu coração, * e {suppl}.'
d = D['supplantabuntur']
d['options'] = [
    opt('os seus passos não serão derrubados', {'suppl': 'os seus passos não serão derrubados'},
        'Ruling (draft 4): the passive kept (the Latinist\'s major) and the row\'s own verb; the subject first (the stylist).', 'latinist'),
    opt('os seus passos não tropeçarão', {'suppl': 'os seus passos não tropeçarão'}, 'The intransitive; rhymes -ão with "coração" at the mediant.', 'stylist'),
    opt('não tropeçarão os seus passos', {'suppl': 'não tropeçarão os seus passos'}, 'Draft 3: the passive lost (the Latinist, major).', 'draft')]
d['why'] += (' Heard (draft 3): the Latinist, MAJOR — «“Supplantabuntur” é passivo: os passos não sofrerão uma ação que os faça cair.'
             ' “Tropeçarão” elimina essa voz e apresenta o tropeço como movimento próprio» → \'não serão derrubados os seus passos\'; the'
             ' stylist — «O sujeito depois do verbo dá à frase uma solenidade artificial» → \'e os seus passos não tropeçarão\'. Both taken:'
             ' the passive with the row\'s ruling verb, derrubar (17:40, 16:13), in the stylist\'s order. The row\'s option for gressus'
             ' (fazer tropeçar) has no passive in Portuguese, so the evidence goes to the row: with gressus as subject, derrubar too.'
             ' The blind reader heard draft 3 as not straying from God\'s way — the moral sense, which "derrubados" keeps.')

# 36:34 — the stylist, worst line: breath; 'ele' supplied is dropped
V['36:34'] = 'Aguarda o Senhor, e guarda o seu caminho: e te exaltará, para que {her34}: * quando os pecadores perecerem, verás.'
data['choices']['36:34'] = ('exspectáre → aguardar (D24, D36; = 26:14 "Aguarda o Senhor"). custodíre → guardar; exaltáre → exaltar. Two cola before'
                            ' the asterisk, as DO has them, no flex. cum períerint → "quando … perecerem"; vidébis → "verás" (no object, as the'
                            ' Latin). Heard (draft 3): the stylist\'s worst line — «O trecho até o asterisco exige muito fôlego. “Tomes a terra por'
                            ' herança” alonga a emissão» → \'Espera o Senhor … para que herdes a terra\'. In part: draft 4 drops the supplied'
                            ' "ele" ("e te exaltará", as the Latin). Refused: "Espera" (exspectáre → aguardar, D36) and "herdes" (the noun'
                            ' with cápere is not hereditáre; decision hereditare). The length is the Latin\'s: 31 syllables in two cola.')

# 36:35 — 'sumamente' bookish (the stylist) and unknown (the blind reader)
d = D['superexaltatum']
d['options'][0]['note'] = 'Draft 3: bookish (the stylist); unknown to the blind reader.'
d['options'].insert(0, opt('muito exaltado', {'superex': 'muito exaltado'}, 'Ruling (draft 4): the degree, plain.', 'stylist'))
d['why'] += (' Heard (draft 3): the stylist — «“Sumamente” soa livresco na oração diária» → \'muito exaltado\'; the blind reader listed'
             ' "sumamente" as unknown. Taken. The same remark asked to end on "estava erguido" to avoid "Líbano" at the final: refused, the'
             ' proper name is the Latin\'s last word and 28:5 has "os cedros do Líbano".')

# 36:37 — 'pacífico' proparoxytone at the final
V['36:37'] = 'Guarda a inocência, e vê a equidade: * porque há {rel37} para o {pacifico}.'
data['decisions'].append({
    'id': 'pacifico', 'refs': ['36:37'], 'latin': 'quóniam sunt relíquiæ hómini pacífico', 'kind': 'word',
    'why': 'homo pacíficus (ἀνθρώπῳ εἰρηνικῷ), "the man of peace". Draft 3 "o homem pacífico" (the cognate; Douay-Rheims "the peaceable man").'
           ' Heard (draft 3): the stylist — «“Pacífico” encerra o verso com uma proparoxítona» → \'para o homem de paz\'. Taken: the adjective'
           ' said by its noun, as the Greek\'s εἰρηνικός is of εἰρήνη; the final becomes oxytone, and "paz" is the psalm\'s word (36:11'
           ' "na multidão da paz"). pacíficus elsewhere only 119:7 "eram pacíficus"; 34:20 has the adverb pacífice (grep).',
    'options': [opt('homem de paz', {'pacifico': 'homem de paz'}, 'Ruling (draft 4): the stylist.', 'stylist'),
                opt('homem pacífico', {'pacifico': 'homem pacífico'}, 'Draft 3: the cognate; proparoxytone at the final.', 'draft')]})

# 36:38 — the stylist: 'juntos' after 'de todo'
V['36:38'] = 'Mas os injustos juntos {disper38}: * {rel38} dos ímpios {interib}.'
D['disperire']['why'] += (' 36:38: draft 3 "perecerão de todo, juntos"; heard (draft 3): the stylist — «“Juntos” chega como um acréscimo depois de'
                          ' uma conclusão já ouvida em “de todo”» → \'Mas os injustos juntos perecerão de todo\'. Taken (order only, D2):'
                          ' simul before the verb, as the Latin has it next to the verb.')

audit = data['audit']
audit += [
    {'step': 'latinist', 'file': 'critic/v3.latinist.part2.json',
     'note': 'Stage two, draft 3 (part2: 36:21–36:40 only). One major, four minors. «A tradução conserva em geral o conteúdo e as peculiaridades do latim; o desvio mais relevante é a perda da voz passiva em 36:31.» Passed \'tomará emprestado\', \'perecerão de todo\', \'se extinguirá\', \'Junto do Senhor\', \'quererá o seu caminho\', \'será esmagado\', \'buscando pão\', \'Aparta-te do mal\', \'falará o juízo\', \'dar-lhe a morte\', \'tomes a terra por herança\', \'um resto … o resto\', \'arrancará dos pecadores\'.',
     'outcomes': [
         {'verse': '36:31', 'remark': 'MAJOR: \'não tropeçarão\' loses the passive of supplantabúntur → \'não serão derrubados os seus passos\'', 'outcome': 'taken', 'decision': 'supplantabuntur',
          'reason': 'Taken in the stylist\'s order: \'e os seus passos não serão derrubados\'.'},
         {'verse': '36:25', 'remark': 'minor: \'já\' is time; étenim confirms → \'e de fato envelheci\'', 'outcome': 'taken', 'decision': 'etenim'},
         {'verse': '36:26', 'remark': 'minor: \'será abençoada\' turns the state into a passive → \'estará em bênção\'', 'outcome': 'refused', 'decision': 'benedictione',
          'reason': '\'estar em bênção\' is not current Portuguese; \'será abençoada\' is the Latin\'s sense (Matos Soares 1932). \'estará na bênção\' is option 2; the blind reader heard the descendants of the just, rightly.'},
         {'verse': '36:27', 'remark': 'minor: plural \'pelos séculos dos séculos\' for the Latin\'s singulars → \'pelo século do século\'', 'outcome': 'refused',
          'reason': 'D27 (settled; the Latinist\'s earlier requests for the singular are logged on the row).'},
         {'verse': '36:29', 'remark': 'minor: the same', 'outcome': 'refused', 'reason': 'D27.'}]},
    {'step': 'stylist', 'file': 'critic/v3.stylist.part2.json',
     'note': 'Stage two, draft 3 (part2). Eight verses; best 36:24, worst 36:34. «O ouvido encontra algumas inversões artificiais, três finais proparoxítonos e um trecho especialmente longo em 36:34.» Four taken (one in part), four refused.',
     'outcomes': [
         {'verse': '36:21', 'remark': 'rhyme pagará / dará → \'Tomará emprestado e não pagará o pecador: * mas o justo tem piedade e dará\'', 'outcome': 'refused',
          'reason': 'The Latin\'s own paired futures at both cadences (solvet / tríbuet); his order ends the first colon on the subject far from its verb.'},
         {'verse': '36:27', 'remark': 'proparoxytone final \'séculos\' → \'e pelos séculos dos séculos habita\'', 'outcome': 'refused',
          'reason': 'D27: the formula stands whole and last, as the Latin\'s in sǽculum sǽculi; inverting the verb to the end is the artificial order he refuses elsewhere.'},
         {'verse': '36:29', 'remark': 'the same → \'e pelos séculos dos séculos habitarão sobre ela\'', 'outcome': 'refused', 'reason': 'As 36:27.'},
         {'verse': '36:31', 'remark': 'subject after the verb → \'e os seus passos não tropeçarão\'', 'outcome': 'taken', 'decision': 'supplantabuntur',
          'reason': 'The order taken, with the Latinist\'s passive: \'e os seus passos não serão derrubados\'.'},
         {'verse': '36:34', 'remark': 'worst line: breath; \'tomes a terra por herança\' → \'Espera o Senhor … para que herdes a terra\'', 'outcome': 'taken', 'decision': 'hereditare',
          'reason': 'In part: the supplied \'ele\' dropped. \'Espera\' refused (D36: exspectáre → aguardar, and = 26:14); \'herdes\' refused (hereditáte cápias is not hereditáre; the refrain\'s verb would merge the two builds).'},
         {'verse': '36:35', 'remark': '\'sumamente\' bookish; \'Líbano\' proparoxytone → \'muito exaltado … e como os cedros do Líbano estava erguido\'', 'outcome': 'taken', 'decision': 'superexaltatum',
          'reason': 'In part: \'muito exaltado\'. The reordered second colon refused: the Latin ends on Líbani, and 28:5 has \'os cedros do Líbano\'.'},
         {'verse': '36:37', 'remark': 'proparoxytone final \'pacífico\' → \'para o homem de paz\'', 'outcome': 'taken', 'decision': 'pacifico'},
         {'verse': '36:38', 'remark': '\'juntos\' after \'de todo\' → \'Mas os injustos juntos perecerão de todo\'', 'outcome': 'taken', 'decision': 'disperire'}]},
    {'step': 'ambiguity', 'file': 'critic/v3.ambiguity.part2.json',
     'note': 'Stage two, draft 3 (part2). 32 items, 3 unknown words (\'sumamente\' — mended; \'cedros\', \'equidade\'). Heard rightly or within the Latin\'s range: 36:21 \'tem piedade, e dará\' (compassion and help), \'os que o bendizem\' (the Lord first, the just man second — both in ei), \'Junto do Senhor serão dirigidos\' (the Lord guides), 36:24 (adversity, God sustains), \'buscando pão\' (begging, want), 36:26 subject (the just), \'habita pelos séculos dos séculos\' (lives for ever), \'ama o juízo\' (justice), \'conservados\' (protected), \'meditará a sabedoria\' (will speak wisdom — the Latin\'s meditári of the mouth), \'falará o juízo\' (just things), 36:31 (not straying), 36:33 (the just in the sinner\'s hands; the Lord will not condemn him), \'guarda o seu caminho\' (the Lord\'s), \'quando os pecadores perecerem, verás\', \'eis que não existia\', \'Guarda a inocência\', \'o resto dos ímpios\' (those still alive), \'esperaram nele\'.',
     'outcomes': [
         {'verse': '36:35', 'remark': '\'sumamente\' unknown', 'outcome': 'taken', 'decision': 'superexaltatum'},
         {'verse': '36:23', 'remark': '\'ele quererá o seu caminho\' heard as the man wanting the Lord\'s way; the pronouns leave it uncertain', 'outcome': 'refused', 'decision': 'volet',
          'reason': 'The Latin leaves the subject of volet and the owner of viam ejus open (as the Greek and Douay-Rheims \'he shall like well his way\'); the hearing is inside that range.'},
         {'verse': '36:37', 'remark': '\'há um resto para o homem pacífico\' — something is left, unclear what', 'outcome': 'refused', 'decision': 'reliquiae',
          'reason': 'The Latin is as bare (sunt relíquiæ); \'descendência\' (option 3) would decide it. Logged on the relíquiæ row.'},
         {'verse': '36:28', 'remark': '\'os seus santos\' heard as the canonized saints', 'outcome': 'refused', 'reason': 'The Latin\'s word (sancti); as 33:10.'},
         {'verse': '36:35', 'remark': '\'cedros\' unknown', 'outcome': 'refused', 'reason': 'cedrus → cedro, the only word (28:5); the comparison still carried height.'},
         {'verse': '36:37', 'remark': '\'equidade\' unknown', 'outcome': 'refused', 'reason': 'ǽquitas → equidade (glossary, working); logged on the row again.'}]},
    {'step': 'revision', 'version': 4,
     'note': 'ps036/revise_v4.py: 36:25 \'e de fato envelheci\' (the Latinist, minor); 36:31 \'e os seus passos não serão derrubados\' (the Latinist\'s major, in the stylist\'s order); 36:34 \'e te exaltará\' (the supplied \'ele\' dropped; the stylist\'s worst line, in part); 36:35 \'muito exaltado\' (the stylist; unknown to the blind reader); 36:37 \'para o homem de paz\' (the stylist); 36:38 \'Mas os injustos juntos perecerão de todo\' (the stylist). Refused with reasons above: pelo século do século (D27), estará em bênção, the proparoxytone \'séculos\' and \'Líbano\' finals, \'herdes\', \'Espera\'.'},
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 4 written;', len(data['decisions']), 'decisions')
