"""Stage two: append 36:21–36:40 to draft 2 → draft 3. Existing term decisions get new slots; new verse-local decisions are added.
python3.13 research/psalterium/ps036/append_v3.py  (reads prayed.v2.json, literal.v2.json; writes prayed.json, literal.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v2.json').read_text(encoding='utf-8'))
literal = json.loads((here / 'literal.v2.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}


def opt(label, forms, note, source='draft'):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def new(id, refs, latin, kind, why, options):
    d = {'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}
    data['decisions'].append(d)
    dec[id] = d


def addSlot(decisionId, refs, formsByIndex, whyAdd):
    d = dec[decisionId]
    for i, o in enumerate(d['options']):
        o['forms'].update(formsByIndex(i, o))
    for r in refs:
        if r not in d['refs']:
            d['refs'].append(r)
    d['why'] += ' ' + whyAdd


literal['verses'].update({
    '36:21': 'Tomará emprestado o pecador, e não pagará: * mas o justo compadece-se e dará.',
    '36:22': 'Porque os que o bendizem herdarão a terra: * mas os que o maldizem perecerão de todo.',
    '36:23': 'Junto do Senhor os passos do homem serão dirigidos: * e o caminho dele quererá.',
    '36:24': 'Quando tiver caído não será esmagado: * porque o Senhor põe por baixo a sua mão.',
    '36:25': 'Mais jovem fui, e de fato envelheci: * e não vi o justo abandonado, nem a sua descendência buscando pão.',
    '36:26': 'Todo o dia compadece-se e empresta: * e a descendência dele em bênção será.',
    '36:27': 'Aparta-te do mal, e faz o bem: * e habita pelo século do século.',
    '36:28': 'Porque o Senhor ama o juízo, e não abandonará os seus santos: * para sempre serão conservados.',
    '36:28b': 'Os injustos serão punidos: * e a descendência dos ímpios perecerá.',
    '36:29': 'Mas os justos herdarão a terra: * e habitarão pelo século do século sobre ela.',
    '36:30': 'A boca do justo meditará sabedoria, * e a sua língua falará juízo.',
    '36:31': 'A lei do seu Deus [está] no coração dele mesmo, * e não serão derrubados os seus passos.',
    '36:32': 'Considera o pecador o justo: * e procura matá-lo.',
    '36:33': 'Mas o Senhor não o abandonará nas mãos dele: * nem o condenará, quando for julgado para ele.',
    '36:34': 'Aguarda o Senhor, e guarda o seu caminho: e exaltar-te-á para que com herança tomes a terra: * quando tiverem perecido os pecadores, verás.',
    '36:35': 'Vi o ímpio sobre-exaltado, * e elevado como os cedros do Líbano.',
    '36:36': 'E passei, e eis [que] não era: * e busquei-o, e não foi encontrado o seu lugar.',
    '36:37': 'Guarda a inocência, e vê a equidade: * porque há restos para o homem pacífico.',
    '36:38': 'Mas os injustos perecerão de todo juntamente: * os restos dos ímpios perecerão.',
    '36:39': 'Mas a salvação dos justos [é] do Senhor: * e protetor deles no tempo da tribulação.',
    '36:40': 'E ajudá-los-á o Senhor e livrá-los-á: * e arrancá-los-á dos pecadores, e salvá-los-á: porque esperaram nele.',
})
literal['range'] = '36:1–36:40'

data['verses'].update({
    '36:21': 'O pecador {mutuari}, e não pagará: * mas o justo {miser21}, e dará.',
    '36:22': 'Porque os que o bendizem {her22} a terra: * mas os que o maldizem {disper22}.',
    '36:23': '{apud} serão dirigidos os passos do homem: * e ele {volet}.',
    '36:24': 'Quando cair, não {collid}: * porque o Senhor põe a sua mão por baixo.',
    '36:25': 'Fui jovem, e {etenim}: * e não vi o justo abandonado, nem a sua descendência {quaerens} pão.',
    '36:26': 'O dia todo {miser26} e empresta: * e a sua descendência {benedictione}.',
    '36:27': '{declina}: * e habita pelos séculos dos séculos.',
    '36:28': 'Porque o Senhor ama o juízo, e não abandonará os seus santos: * para sempre serão conservados.',
    '36:28b': 'Os injustos serão punidos: * e a descendência dos ímpios perecerá.',
    '36:29': 'Mas os justos {her29} a terra: * e habitarão sobre ela pelos séculos dos séculos.',
    '36:30': 'A boca do justo meditará a sabedoria, * e a sua língua {loquetur}.',
    '36:31': 'A lei do seu Deus está no seu coração, * e {suppl} os seus passos.',
    '36:32': 'O pecador observa o justo: * e busca {mortif}.',
    '36:33': 'Mas o Senhor não o abandonará nas mãos dele: * nem o condenará, quando for julgado.',
    '36:34': 'Aguarda o Senhor, e guarda o seu caminho: e ele te exaltará, para que {her34}: * quando os pecadores perecerem, verás.',
    '36:35': 'Vi o ímpio {superex}, * e elevado como os cedros do Líbano.',
    '36:36': 'E passei, e eis que não existia: * e o busquei, e não foi encontrado o seu lugar.',
    '36:37': 'Guarda a inocência, e vê a equidade: * porque há {rel37} para o homem pacífico.',
    '36:38': 'Mas os injustos {disper38}, juntos: * {rel38} dos ímpios {interib}.',
    '36:39': 'A salvação dos justos, porém, vem do Senhor: * e ele é o protetor deles no tempo da tribulação.',
    '36:40': 'E o Senhor os auxiliará, e os livrará: * e os {eruet} dos pecadores, e os salvará: porque esperaram nele.',
})
data['range'] = '36:1–36:40'
data['version'] = 3
data['status'] = 'draft'

# --- slots on existing decisions
addSlot('hereditare', ['36:22', '36:29', '36:34'],
        lambda i, o: [{'her22': 'herdarão', 'her29': 'herdarão', 'her34': 'tomes a terra por herança'},
                      {'her22': 'possuirão', 'her29': 'possuirão', 'her34': 'possuas a terra por herança'}][i],
        'Stage two: 36:22 and 36:29 say the refrain again (herdarão a terra, as 9 and 11). 36:34 has the noun with cápere, "ut hereditáte cápias'
        ' terram" (τοῦ κατακληρονομῆσαι γῆν): "para que tomes a terra por herança" — cápere\'s "take", the noun kept, and "a terra" as in the'
        ' refrain (the glossary\'s "hereditáte acquírere → adquirir por herança", 118:111, is built the same way). Matos Soares 1932 "para que'
        ' possuas em herança a terra". The versicle "V. Exspécta Dóminum, et custódi viam ejus. R. Exaltábit te, ut hereditáte cápias terram"'
        ' (Psalmi matutinum.txt, grep) stands as "V. Aguarda o Senhor, e guarda o seu caminho. R. Ele te exaltará, para que tomes a terra por'
        ' herança."')

# --- new decisions, stage two
new('mutuari', ['36:21'], 'Mutuábitur peccátor, et non solvet', 'word',
    'mutuári (δανείζεται), deponent: "to borrow". Kept apart from 36:26 cómmodat (δανείζει, "lends") → "empresta" — the Greek has one verb in two'
    ' voices, the Latin two verbs, and Portuguese has the pair. "tomará emprestado" is the plain "borrow"; Matos Soares 1932 "pedirá emprestado"'
    ' (asks for a loan — the borrowing not yet done). mutuári only here (grep). sólvere → pagar.',
    [opt('tomará emprestado', {'mutuari': 'tomará emprestado'}, 'Ruling: "borrow".'),
     opt('pedirá emprestado', {'mutuari': 'pedirá emprestado'}, 'Matos Soares 1932.', 'MS1932')])

new('miseretur', ['36:21', '36:26'], 'justus autem miserétur et tríbuet … Tota die miserétur et cómmodat', 'glossary',
    'miseréri, absolute, twice (οἰκτίρει 21, ἐλεᾷ 26 — two Greek verbs, one Latin): one wording both times. The glossary has miseréri → ter'
    ' piedade (de), and the absolute use keeps it: "tem piedade". Douay-Rheims "sheweth mercy" (as a deed: then the lending and giving follow);'
    ' Matos Soares 1932 "é compassivo" (21) and "exercendo a misericórdia" (26). 111:5 "Jucúndus homo qui miserétur et cómmodat" (grep) is'
    ' 36:26\'s pair of verbs and should copy it ("que tem piedade e empresta").',
    [opt('tem piedade ×2', {'miser21': 'tem piedade', 'miser26': 'tem piedade'}, 'Ruling: the row.', 'glossary'),
     opt('tem compaixão ×2', {'miser21': 'tem compaixão', 'miser26': 'tem compaixão'}, 'Plainer as a trait; leaves the row.'),
     opt('é compassivo … tem compaixão', {'miser21': 'é compassivo', 'miser26': 'tem compaixão'}, 'Matos Soares 1932\'s adjective at 36:21.', 'MS1932')])

new('disperire', ['36:22', '36:38'], 'maledicéntes autem ei disperíbunt … Injústi autem disperíbunt simul', 'word',
    'The verbs of ending in this psalm: the Latin varies five (exterminári 9, períre 19 / 28b / 34, disperíre 22 / 38, interíre 38) where the'
    ' Greek has mostly one (ἐξολεθρεύω behind exterminabúntur, disperíbunt, períbit, períerint, interíbunt; ἀπολοῦνται behind períbunt at 20 —'
    ' consult/parallels/ps036.md). Rule 1 follows the Latin, so each keeps its own word: exterminári → ser exterminado (36:9), períre → perecer'
    ' (glossary; 36:19, 28b, 34), disperíre → "perecer de todo" (L&S "to perish utterly": the dis- as completeness, on perecer\'s own verb),'
    ' interíre its own (decision interire). disperíre elsewhere only 82:11 "Disperiérunt in Endor" (grep), which can follow. "destruir" is'
    ' destrúere\'s, "exterminar" dispérdere\'s and exterminári\'s. Douay-Rheims "shall perish … shall be destroyed"; Matos Soares 1932'
    ' "perecerão … perecerão (todos) igualmente".',
    [opt('perecerão de todo ×2', {'disper22': 'perecerão de todo', 'disper38': 'perecerão de todo'}, 'Ruling: perecer\'s verb with the dis-.'),
     opt('perecerão ×2', {'disper22': 'perecerão', 'disper38': 'perecerão'}, 'Merges with períre.', 'MS1932'),
     opt('se perderão ×2', {'disper22': 'se perderão', 'disper38': 'se perderão'}, 'The other sense of períre ("be lost"); heard as damnation.')])

new('interire', ['36:38'], 'relíquiæ impiórum interíbunt', 'word',
    'interíre (ἐξολεθρευθήσονται), the second verb of 36:38 beside disperíbunt: "to perish, go to ruin, die out". A third word is needed in one'
    ' verse (perecer de todo … ?). "se extinguirá" fits the subject, a remnant (what is left of a line dies out), and is plain. Elsewhere 48:18'
    ' "Quóniam cum interíerit" (grep), of a man, which will want "morrer" there. Matos Soares 1932 "será destruído" (destrúere\'s).',
    [opt('se extinguirá', {'interib': 'se extinguirá'}, 'Ruling: a remnant dies out.'),
     opt('morrerá', {'interib': 'morrerá'}, 'Plain; 48:18\'s.'),
     opt('será destruído', {'interib': 'será destruído'}, 'Matos Soares 1932; destrúere\'s verb.', 'MS1932')])

new('apud', ['36:23'], 'Apud Dóminum gressus hóminis dirigéntur', 'glossary',
    'apud → junto de (glossary, 21:26 "Junto de vós está o meu louvor"; the Latin\'s apud, not the Greek\'s παρὰ κυρίου, "from the Lord").'
    ' Douay-Rheims "With the Lord shall the steps of a man be directed"; Matos Soares 1932 makes the Lord the agent ("pelo Senhor"). The Mass of'
    ' 06-28 sings the verse (grep). dirígere → dirigir (glossary; the passive, as 118:5 "sejam dirigidos").',
    [opt('Junto do Senhor', {'apud': 'Junto do Senhor'}, 'Ruling: the row.', 'glossary'),
     opt('Pelo Senhor', {'apud': 'Pelo Senhor'}, 'Matos Soares 1932: the agent (the Greek\'s "from").', 'MS1932')])

new('volet', ['36:23'], 'et viam ejus volet', 'glossary',
    'velle → querer (glossary; θελήσει). "e ele quererá o seu caminho": the Lord (subject supplied, as the Greek\'s and the Latin\'s third person'
    ' implies) wills the man\'s way — Douay-Rheims "he shall like well his way", Matos Soares 1932 "e o seu caminho será aprovado por ele". The row'
    ' notes 17:20 "porque me quis" heard as loved / chose — the same range here.',
    [opt('quererá', {'volet': 'quererá o seu caminho'}, 'Ruling: the row.', 'glossary'),
     opt('se agradará d', {'volet': 'se agradará do seu caminho'}, 'Douay-Rheims\'s sense; another verb.', 'DRB')])

new('collidetur', ['36:24'], 'Cum cecíderit non collidétur', 'word',
    'collídere (καταραχθήσεται, "be dashed down"): "strike together, crush". "não será esmagado" keeps the crushing; Douay-Rheims "shall not be'
    ' bruised"; Matos Soares 1932 "não se ferirá". "quebrar" is confríngere\'s and contérere\'s (36:15, 17). Only place (grep).'
    ' suppónit manum suam → "põe a sua mão por baixo".',
    [opt('será esmagado', {'collid': 'será esmagado'}, 'Ruling: the crush.'),
     opt('se ferirá', {'collid': 'se ferirá'}, 'Matos Soares 1932.', 'MS1932'),
     opt('se despedaçará', {'collid': 'se despedaçará'}, 'The dashing to pieces (the Greek).')])

new('etenim', ['36:25'], 'Júnior fui, étenim sénui', 'grammar',
    'Júnior fui (νεώτερος ἐγενόμην, the comparative as "young"), étenim sénui (καὶ γὰρ ἐγήρασα): étenim confirms — "and indeed I have grown old".'
    ' "e já envelheci" says the confirmation by the completed state ("já"); "e de fato envelheci" names it and is heavy. Matos Soares 1932 "e'
    ' já sou velho"; Douay-Rheims "and now am old".',
    [opt('já envelheci', {'etenim': 'já envelheci'}, 'Ruling: plain; the completed state.'),
     opt('de fato envelheci', {'etenim': 'de fato envelheci'}, 'étenim named.'),
     opt('agora sou velho', {'etenim': 'agora sou velho'}, 'Douay-Rheims.', 'DRB')])

new('quaerens', ['36:25'], 'nec semen ejus quærens panem', 'glossary',
    'quǽrere → buscar (glossary, and 36:10, 36:36 in this psalm): "buscando pão" (ζητοῦν ἄρτους). Matos Soares 1932 "mendigando" says what the'
    ' seeking is; the Latin leaves it. semen → descendência (D32; no plant image here).',
    [opt('buscando', {'quaerens': 'buscando'}, 'Ruling: the row.', 'glossary'),
     opt('mendigando', {'quaerens': 'mendigando'}, 'Matos Soares 1932: explains.', 'MS1932')])

new('benedictione', ['36:26'], 'et semen illíus in benedictióne erit', 'grammar',
    '"in benedictióne erit": "will be in blessing", i.e. blessed (the Greek εἰς εὐλογίαν ἔσται, "will be for a blessing", is another build). "será'
    ' abençoada" is the Latin\'s sense in plain words (Matos Soares 1932); "estará em bênção" keeps the noun and is not Portuguese; "será uma'
    ' bênção" is the Greek\'s (and 20:7 "fareis dele uma bênção" is dare in benedictiónem, the Latin with in + accusative). "abençoar" is not'
    ' benedícere\'s here (36:22 has "bendizem" for the men who bless); the participle is the everyday word.',
    [opt('será abençoada', {'benedictione': 'será abençoada'}, 'Ruling: the Latin\'s sense, plain.', 'MS1932'),
     opt('estará na bênção', {'benedictione': 'estará na bênção'}, 'The noun kept.'),
     opt('será uma bênção', {'benedictione': 'será uma bênção'}, 'The Greek\'s εἰς.')])

new('declina', ['36:27'], 'Declína a malo, et fac bonum', 'glossary',
    '36:27a is 33:15a\'s line with declináre for divértere (one Greek: ἔκκλινον ἀπὸ κακοῦ καὶ ποίησον ἀγαθόν in both); the glossary\'s formula'
    ' row says 36:27 should copy 33:15a "Aparta-te do mal, e faz o bem", and declináre a → apartar-se de is itself the glossary\'s row (118:21).'
    ' "faz o bem" is why 36:3 fac bonitátem took "usa de bondade". The second colon, "et inhábita in sǽculum sǽculi" → "e habita pelos séculos'
    ' dos séculos" (D27; inhabitáre absolute).',
    [opt('Aparta-te do mal, e faz o bem', {'declina': 'Aparta-te do mal, e faz o bem'}, 'Ruling: = 33:15a.', 'glossary'),
     opt('Desvia-te do mal, e faz o bem', {'declina': 'Desvia-te do mal, e faz o bem'}, 'Matos Soares 1932; desviar is avértere\'s.', 'MS1932')])

new('loquetur', ['36:30'], 'et lingua ejus loquétur judícium', 'glossary',
    'loqui with an accusative of content (λαλήσει κρίσιν): the glossary\'s row for loqui mendácium → "falar mentira" and 16:9b "a boca deles falou'
    ' soberba" (the Latinist\'s major there asked for the content, not the manner). judícium → juízo (D15). "falará o juízo": the content, with'
    ' the article (as "a sabedoria" in the first colon); "falará juízo" without it is heard as "talk sense". Matos Soares 1932 "falará prudência".'
    ' The verse and 36:31 are the Gradual and versicle of confessors (Commune C4a, C5; Mass 06-14 …, grep): "Os justi meditábitur sapiéntiam, et'
    ' lingua ejus loquétur judícium" stands whole.',
    [opt('falará o juízo', {'loquetur': 'falará o juízo'}, 'Ruling: the content, as 16:9b.', 'glossary'),
     opt('falará o que é reto', {'loquetur': 'falará o que é reto'}, 'Explains.'),
     opt('falará com juízo', {'loquetur': 'falará com juízo'}, 'The manner (refused at 16:9b).')])

new('supplantabuntur', ['36:31'], 'et non supplantabúntur gressus ejus', 'glossary',
    'supplantáre, passive, with gressus as subject (οὐχ ὑποσκελισθήσεται τὰ διαβήματα αὐτοῦ, "will not be tripped"). The glossary\'s row names this'
    ' verse: derrubar is the ruling (17:40), "with gressus as object fazer tropeçar is the natural verb and is the option". The passive of that'
    ' ("não serão feitos tropeçar") is not Portuguese; "os seus passos não tropeçarão" says it with the intransitive — the effect of the Latin\'s'
    ' passive, without the agent the Latin leaves out anyway. "não serão derrubados" is the row\'s own verb (Douay-Rheims "shall not be'
    ' supplanted"). Matos Soares 1932 "andará com passo firme" explains.',
    [opt('não tropeçarão', {'suppl': 'não tropeçarão'}, 'Ruling: the row\'s option for gressus, intransitive.', 'glossary'),
     opt('não serão derrubados', {'suppl': 'não serão derrubados'}, 'The row\'s ruling word; passive kept.', 'glossary')])

new('mortificare', ['36:32'], 'et quærit mortificáre eum', 'word',
    'mortificáre (θανατῶσαι): "to put to death". quǽrere + infinitive → "busca" (the glossary\'s buscar; 36:10, 25, 36). "dar-lhe a morte"'
    ' (Matos Soares 1932) keeps "morte" in the verb, as mortificáre has mors; "matá-lo" is plain. The cognate "mortificar" means ascetic'
    ' self-denial in a Catholic ear. Elsewhere 43:22 "mortificámur tota die", 78:11, 108:17 (grep).',
    [opt('dar-lhe a morte', {'mortif': 'dar-lhe a morte'}, 'Ruling: mors in the verb.', 'MS1932'),
     opt('matá-lo', {'mortif': 'matá-lo'}, 'Plain.'),
     opt('fazê-lo morrer', {'mortif': 'fazê-lo morrer'}, 'The causative.')])

new('superexaltatum', ['36:35'], 'Vidi ímpium superexaltátum', 'word',
    'superexaltáre (ὑπερυψούμενον): "raised above". exaltáre → exaltar (glossary); the super- as degree: "sumamente exaltado" (Matos Soares 1932).'
    ' "sobre-exaltado" keeps the prefix and is not a word a hearer knows; "exaltado acima de tudo" adds. Only place (grep). et elevátum sicut'
    ' cedros Líbani → "e elevado como os cedros do Líbano" (28:5 "os cedros do Líbano").',
    [opt('sumamente exaltado', {'superex': 'sumamente exaltado'}, 'Ruling: Matos Soares 1932.', 'MS1932'),
     opt('sobre-exaltado', {'superex': 'sobre-exaltado'}, 'The prefix kept; not current.'),
     opt('exaltado acima de todos', {'superex': 'exaltado acima de todos'}, 'Adds the "all".')])

new('reliquiae', ['36:37', '36:38'], 'quóniam sunt relíquiæ hómini pacífico … relíquiæ impiórum interíbunt', 'glossary',
    'relíquiæ twice in two verses, set against each other (ἐγκατάλειμμα ἀνθρώπῳ εἰρηνικῷ … τὰ ἐγκαταλείμματα τῶν ἀσεβῶν): what is left of a man —'
    ' posterity, a remnant — for the peaceful and not for the wicked. One word both times. The glossary row is open with two words: "sobras"'
    ' (16:14c, the leftovers of a meal) and "restos" (20:13, God\'s remnant), each by its Greek (κατάλοιπα, περίλοιπα); here a third Greek'
    ' word. "resto" in the singular, the remnant of the prophets, avoids "restos" as mortal remains (named in the row). Matos Soares 1932 "ficarão'
    ' bens … o que ficar dos ímpios"; Douay-Rheims "remnants". The antiphon "Custódi innocéntiam * et vide æquitátem" (Tuesday Matins, grep)'
    ' takes the first colon only.',
    [opt('um resto … o resto', {'rel37': 'um resto', 'rel38': 'o resto'}, 'Ruling: one word, the singular.'),
     opt('restos … os restos', {'rel37': 'restos', 'rel38': 'os restos'}, 'The Latin\'s plural; heard as mortal remains.', 'DRB'),
     opt('uma descendência … a descendência', {'rel37': 'uma descendência', 'rel38': 'a descendência'}, 'The sense; semen\'s word (D32).')])

new('eruet', ['36:40'], 'et liberábit eos: et éruet eos a peccatóribus', 'glossary',
    'The glossary\'s éruere row names this verse: "36:40 sets liberábit … éruet side by side, so not livrar"; with a source → arrancar. liberáre →'
    ' livrar (glossary). "e os arrancará dos pecadores". adjuváre → auxiliar (glossary, open). The perfect speravérunt → "esperaram" (Matos Soares'
    ' 1932 has a present). Commune C3a-1 takes 36:39 (grep).',
    [opt('arrancará', {'eruet': 'arrancará'}, 'Ruling: the row, with a source.', 'glossary'),
     opt('tirará', {'eruet': 'tirará'}, 'Matos Soares 1932 ("os tirará da mão dos").', 'MS1932'),
     opt('libertará', {'eruet': 'libertará'}, 'The row\'s word without a source.', 'glossary')])

data['choices'].update({
    '36:21': 'sólvere → pagar; tríbuere → dar (the row "bona tríbuere → dar coisas boas": tríbuere and dare never meet here). Latin order "Mutuábitur peccátor" → subject first (D2).',
    '36:22': 'benedícere (men → the one blessed) with the dative ei → "os que o bendizem"; ei is open between the Lord and the just man (the Greek αὐτόν too), and "o" keeps it open. maledícere → maldizer (the pair).',
    '36:24': 'cádere → cair; suppónere manum → "põe a sua mão por baixo" ("lhe" not supplied; the adverb last, so that 36:24 does not rhyme mão with 36:25 pão).',
    '36:25': 'derelínquere → abandonar (glossary). "Fui jovem" for júnior (the comparative as positive).',
    '36:26': 'Tota die → o dia todo (D24). cómmodat → empresta (apart from mutuári, 36:21). 111:5 "qui miserétur et cómmodat" should copy.',
    '36:28': 'amáre → amar; judícium → juízo (D15; Matos Soares 1932 "equidade" is ǽquitas\'s, 36:37). sancti → santos. in ætérnum → para sempre (D23), at the head as the Latin; conserváre → conservar (serváre → observar is for a law; the passive of persons wants the cognate). The Greek φυλαχθήσονται is custodíre\'s verb, but the Latin has its own.',
    '36:28b': 'DO\'s 36:28b (the Clementine\'s 28c). injústus → injusto; puníre → punir; ímpius → ímpio (glossary); períre → perecer; semen → descendência (D32).',
    '36:29': 'inhabitáre (absolute, super eam) → habitar sobre ela; in sǽculum sǽculi → pelos séculos dos séculos (D27) put last, for the cadence and as 36:27.',
    '36:30': 'Os justi → a boca do justo; meditári with an accusative → meditar (glossary row with inánia: 2:1 "meditaram coisas vãs"). sapiéntia → sabedoria. The comma before the asterisk is DO\'s.',
    '36:31': 'The verbless first colon: "está" supplied. ejus … ipsíus → "do seu Deus … no seu coração" (both the just man\'s).',
    '36:32': 'consideráre with a person → observar (glossary, 21:18), apart from 36:12 observáre → espreitar.',
    '36:33': 'derelínquere → abandonar; in mánibus ejus → "nas mãos dele" (the sinner\'s; "nas suas mãos" would be heard as the Lord\'s). damnáre → condenar. cum judicábitur illi → "quando for julgado" (Douay-Rheims "when he shall be judged"; the dative illi, "with / by him", left unsaid as Douay-Rheims and Matos Soares 1932 leave it).',
    '36:34': 'exspectáre → aguardar (D24, D36; = 26:14 "Aguarda o Senhor"). custodíre → guardar; exaltáre → exaltar; "ele" supplied. Two cola before the asterisk, as DO has them, no flex. cum períerint → "quando … perecerem"; vidébis → "verás" (no object, as the Latin).',
    '36:36': 'transíre → passar; ecce → eis (que); non erat → "não existia" (as 36:10 "não existirá"). quǽrere → buscar; "o busquei" (proclisis after "e", the Brazilian order). invéntus est → foi encontrado (36:10 encontrar).',
    '36:37': 'custodíre → guardar; innocéntia → inocência; vidére → ver; ǽquitas → equidade (glossary). homo pacíficus → homem pacífico.',
    '36:38': 'simul → juntos (glossary, open).',
    '36:39': 'Both cola verbless in the Latin; "vem" and "ele é" supplied (Matos Soares 1932). salus → salvação (D6); protéctor → protetor (glossary); eórum → "deles" (as 36:33, so that "seu" is not heard as the Lord\'s); in témpore tribulatiónis → no tempo da tribulação. autem → "porém" after the subject.',
    '36:40': 'adjuváre → auxiliar (glossary, open); liberáre → livrar; salváre → salvar; speráre in → esperar em (D36). The two cola after the asterisk joined by a colon as DO has them.',
})

(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(here / 'literal.json').write_text(json.dumps(literal, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 3:', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
