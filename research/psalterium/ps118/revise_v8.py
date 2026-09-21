"""Draft 8 of Ps 118: the revision of 118:81–128 after the three blind readers (critic/v7.*.part3.json).
118:1–80 is not touched. Draft 7 is kept as prayed.v7.json (flat text prayed.v7.vos.json).

Run once from the repo root, on a prayed.json that is still version 7:
  python3.13 research/psalterium/ps118/revise_v8.py
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 7:
    sys.exit(f"prayed.json is version {data['version']}, expected 7 — not touching it")
if not (here / 'prayed.v7.json').exists():
    sys.exit('prayed.v7.json is missing — copy prayed.json to it first')
byId = {d['id']: d for d in data['decisions']}
V, C = data['verses'], data['choices']


def promote(decisionId, label):
    """Make the option with this label option 0 (the ruling)."""
    options = byId[decisionId]['options']
    chosen = next(o for o in options if o['label'] == label)
    options.remove(chosen)
    options.insert(0, chosen)
    return chosen


def option(decisionId, label):
    return next(o for o in byId[decisionId]['options'] if o['label'] == label)


# --- 118:81, 82, 123 defícere in: the ambiguity reader heard cause in 118:82
o = promote('deficere_in', 'desfalecer à espera de')
o['note'] = 'Draft 8, Matos Soares 1932 (118:81, 123: "desfaleceu à espera da tua salvação"). Taken because the blind reader heard draft 7\'s "desfaleceram pelo que dissestes" (118:82) first as "lost their strength as a reaction to what you said" — cause, a sense in + accusative does not have. He heard 118:81 and 118:123 rightly with "por"; but the Latin builds the three alike and 118:123 gathers the other two, so one rendering serves all three (rule 6). Costs: a noun is supplied (inside Matos Soares\' bound); "espera" stands beside "esperança" in 118:81, where the Latin has one word of hope. It does not touch exspectáre, which is "aguardar" here.'
option('deficere_in', 'desfalecer por')['note'] = 'Draft 7 (the Diurnal\'s diction): a preposition for a preposition, nothing supplied. Heard rightly in 118:81 and 118:123 ("de tanto esperar pela salvação"), but in 118:82, before "o que dissestes", heard first as cause. The predicted risk was real.'

# --- 118:82 dicéntes: the reader attached the gerund to the speaker
V['118:82'] = 'Os meus olhos desfaleceram {e_def}, * {dicentes}: Quando me consolareis?'
data['decisions'].append({
    'id': 'dicentes', 'refs': ['118:82'], 'latin': 'Defecérunt óculi mei … dicéntes', 'kind': 'grammar',
    'why': 'dicéntes is plural and agrees with óculi: in the Latin it is the eyes that say "When will you comfort me?". The Portuguese gerund has no number, and the blind reader attached it to the speaker ("Eu dizia").',
    'options': [
        {'label': 'dizendo', 'forms': {'dicentes': 'dizendo'}, 'note': 'Kept: participle for participle (Douay-Rheims "saying"). The only grammatical subject in the verse is "os meus olhos", so the Latin\'s image is there for whoever looks; the looser hearing prays the same prayer.', 'from': 'draft'},
        {'label': 'e diziam', 'forms': {'dicentes': 'e diziam'}, 'note': 'A finite plural verb would pin the saying on the eyes (grammar, D2). It adds "e" and turns a circumstance into a second event.', 'from': 'ambiguity'},
    ],
})

# --- 118:85 fabulatiónes: cadence (stylist) and Aesop (ambiguity) mended by one word
o = promote('fabulationes', 'histórias')
o['note'] = 'Draft 8. Two readers, one word: the stylist faulted "fábulas" as a proparoxytone at the mediant, and the blind reader heard it first as "invented stories with a moral teaching" (Aesop), which fabulátio is not. "Histórias" is paroxytone, is Lewis & Short\'s neutral "narration", and "narrar / contar histórias" carries the shade of tale-spinning that the contrast with 118:86 (véritas) wants.'
option('fabulationes', 'fábulas')['note'] = 'Draft 7: the cognate, Douay-Rheims "fables". Proparoxytone at the mediant (the stylist offered "narraram fábulas para mim" to move it); heard by the blind reader as fables with a moral.'

# --- 118:90: the copula (stylist)
o = promote('v90a', 'De geração em geração é a vossa verdade')
o['note'] = 'Draft 8. The stylist heard the verbless colon as "a sentence left to be completed". The copula is what D2 allows to be supplied, and the build is the one D14 ruled for the refrain (porque é para sempre a sua misericórdia): copula, span of time, subject last.'
byId['v90a']['options'].append({'label': 'A vossa verdade permanece de geração em geração', 'forms': {'v90a': 'A vossa verdade permanece de geração em geração'}, 'note': 'The stylist\'s line. Refused: it supplies pérmanet where the Latin has no verb, so that "permanece" would sound three times in 118:89–90 where the Latin has it twice.', 'from': 'stylist'})

# --- 118:92: the stylist's worst line
V['118:92'] = '{nisi_quod}.'
byId['nisi_quod']['why'] += ' Draft 8: the slot now holds the whole verse, because the choice of the first colon decides whether the second may keep the Latin\'s order (meditação … humilhação rhyme at mediant and final).'
byId['nisi_quod']['options'] = [
    {'label': 'Se a minha meditação não fosse a vossa lei', 'forms': {'nisi_quod': 'Se a minha meditação não fosse a vossa lei: * então talvez eu tivesse perecido {humilitate}'}, 'note': 'Draft 8. The stylist named draft 7 the worst line of the portion: "Não fosse que … é" asks for a mental correction in mid-speech, and the second colon was slowed by the insertion that had been put there to avoid a rhyme. His own line ("Se a vossa lei não fosse a minha meditação: … na minha humilhação") brings the rhyme back. This keeps his build and his second colon — which is the Latin\'s order — and turns the copular clause round instead: "my meditation" and "your law" are the same two terms of lex tua meditátio mea est, and either may be its subject. Cost: the formula of 118:77, 97, 174 is not word for word here; it could not be anyway, once the verb is a subjunctive.', 'from': 'stylist'},
    {'label': 'Se a vossa lei não fosse a minha meditação', 'forms': {'nisi_quod': 'Se a vossa lei não fosse a minha meditação: * então talvez eu tivesse perecido {humilitate}'}, 'note': 'The stylist\'s line as he gave it; Matos Soares\' build. Rhymes at mediant and final (meditação / humilhação), which the Latin does not.', 'from': 'stylist'},
    {'label': 'Não fosse que a vossa lei é a minha meditação', 'forms': {'nisi_quod': 'Não fosse que a vossa lei é a minha meditação: * então, {humilitate}, talvez eu tivesse perecido'}, 'note': 'Draft 7: nisi quod word for word, with the formula whole. Refused by the stylist as unsayable.', 'from': 'draft'},
]

# --- 118:95: pérdere (stylist); exspectáre stays apart from speráre
o = promote('perderent', 'para me destruir')
o['note'] = 'Draft 8, from the stylist, who found "para me fazer perecer" ceremonious and heavy (it was also +4 syllables). Douay-Rheims "to destroy me". The link with periíssem (118:92) is given up for the plainer of two faithful words (D2).'
option('perderent', 'para me fazer perecer')['note'] = 'Draft 7: kept pérdere beside períre → perecer, as Latin and Greek do. Heavy in the mouth (stylist).'

ex = byId['exspectare']
ex['options'] = [
    {'label': 'aguardar · no que aguardo', 'forms': {'exspect95': 'me aguardaram', 'exspect116': 'no que aguardo'}, 'note': 'Draft 8. The stylist found "na minha expectativa" bureaucratic and ill-joined to "envergonheis", and offered "pelo que espero". His clause is taken (it is Matos Soares\' "no que espero", and the same turn D16 gives elóquium), but with exspectáre\'s own verb, so that 118:95 and 118:116 still share a root and speráre keeps "esperar".', 'from': 'stylist'},
    {'label': 'aguardar · expectativa', 'forms': {'exspect95': 'me aguardaram', 'exspect116': 'na minha expectativa'}, 'note': 'Draft 7: the cognate noun. Understood by the blind reader ("do not let my hope be frustrated / do not let me be shamed for having hoped"); refused by the stylist as bureaucratic.', 'from': 'draft'},
    {'label': 'esperar · pelo que espero', 'forms': {'exspect95': 'me esperaram', 'exspect116': 'pelo que espero'}, 'note': 'The stylist\'s wording in both verses (Matos Soares: "esperaram-me", "no que espero"). Refused: it folds exspectáre into speráre, two verses after supersperávi (118:114), where Latin and Greek keep two verbs.', 'from': 'stylist'},
]

# --- 118:96 (stylist): order, and nimis
V['118:96'] = '{consummationis}: * {m_sg} {latum96}.'
for o in byId['consummationis']['options']:
    noun = o['forms']['consummationis'].replace('De ', '', 1)
    o['label'] = 'Vi o fim de ' + noun
    o['forms']['consummationis'] = 'Vi o fim de ' + noun
byId['consummationis']['options'][0]['note'] += ' Draft 8: natural order, from the stylist.'
byId['consummationis']['options'].append({'label': 'De toda perfeição vi o fim', 'forms': {'consummationis': 'De toda perfeição vi o fim'}, 'note': 'Draft 7: the Latin\'s order. The stylist: the inversion piles up literary solemnity. Order is the ear\'s (D2).', 'from': 'draft'})
o = promote('latum96', 'é muito amplo')
o['note'] = 'Draft 8, the stylist\'s: "sobremaneira calls more attention to itself than the image of breadth does"; the blind reader listed it as a word an ordinary hearer might not know; and the colon was +6. nimis is "very, exceedingly" (σφόδρα), no more.'
option('latum96', 'é amplo sobremaneira')['note'] = 'Draft 7: the glossary\'s literal for nimis. Refused by the stylist, unknown to the blind reader, +6 syllables.'

# --- 118:97: "todo o dia" was heard as "every day"
V['118:97'] = '{quomodo} a vossa lei, Senhor! * {tota_die} ela é a minha meditação.'
data['decisions'].append({
    'id': 'tota_die', 'refs': ['118:97'], 'latin': 'tota die meditátio mea est', 'kind': 'ambiguity',
    'why': 'tota die is "all day long" (ὅλην τὴν ἡμέραν). In Brazilian speech "todo o dia" and "todo dia" (every day) are hardly told apart, and the blind reader heard draft 7 as "every day".',
    'options': [
        {'label': 'o dia todo', 'forms': {'tota_die': 'o dia todo'}, 'note': 'Draft 8: cannot be heard as "every day".', 'from': 'ambiguity'},
        {'label': 'todo o dia', 'forms': {'tota_die': 'todo o dia'}, 'note': 'Draft 7 (Matos Soares, the Diurnal). Correct on the page, misheard aloud.', 'from': 'MS1932'},
        {'label': 'o dia inteiro', 'forms': {'tota_die': 'o dia inteiro'}, 'note': 'As clear; one syllable longer.', 'from': 'draft'},
    ],
})

# --- 118:98–100: natural order (stylist, three times), the anaphora kept as an option
for o in byId['mandata']['options']:
    o['forms']['m_Sg_por'] = 'Pelo vosso mandamento' if o['label'] == 'mandamentos' else 'Pelo vosso preceito'
V['118:98'] = '{sup98}: * porque {mihi_est}.'
V['118:99'] = '{sup99}: * porque {t_acc} são a minha meditação.'
V['118:100'] = '{sup100}: * porque busquei {m_acc}.'
sup = byId['super']
sup['kind'] = 'order'
sup['why'] += ' Draft 8: the stylist asked for natural order in all three verses (the comparison comes before one knows what is compared; the verb arrives late). The previous portion met the same question in Daleth (five verses opening on Viam) and ruled for natural order with the Latin\'s order as the option; the same is done here. "Mais que" is still said in each of the three verses.'
sup['options'] = [
    {'label': 'natural order', 'forms': {'sup98': '{m_Sg_por} me fizestes mais prudente que os meus inimigos', 'sup99': 'Entendi mais que todos os que me ensinam', 'sup100': 'Entendi mais que os {senes}'}, 'note': 'Draft 8, the stylist\'s three lines. Order is the ear\'s (D2); it also removes the second reading the blind reader found in 118:98 ("you did more for my prudence than my enemies did").', 'from': 'stylist'},
    {'label': '"Mais que" first, as in the Latin', 'forms': {'sup98': 'Mais que os meus inimigos me fizestes prudente {m_sg_por}', 'sup99': 'Mais que todos os que me ensinam entendi', 'sup100': 'Mais que os {senes} entendi'}, 'note': 'Draft 7: the anaphora Super … Super … Super at the head of three verses.', 'from': 'draft'},
    {'label': '"Acima de" first', 'forms': {'sup98': 'Acima dos meus inimigos me fizestes prudente {m_sg_por}', 'sup99': 'Acima de todos os que me ensinam entendi', 'sup100': 'Acima dos {senes} entendi'}, 'note': 'The preposition kept as a preposition (Douay-Rheims "above ancients"). With "me fizestes prudente" it reads as rank rather than degree.', 'from': 'DRB'},
]
byId['mihi_est']['options'] = [
    {'label': 'ele é meu', 'forms': {'mihi_est': 'ele é meu {aet}'}, 'note': 'The dative of possession as Portuguese says it (the Diurnal: "é para sempre meu"). "Ele" names the subject, which can only be "o vosso mandamento". Draft 8: the adverb last, from the stylist.', 'from': 'DM1962'},
    {'label': 'ele está comigo', 'forms': {'mihi_est': 'ele está comigo {aet}'}, 'note': 'Douay-Rheims "it is ever with me".', 'from': 'DRB'},
    {'label': 'eternamente ele é meu', 'forms': {'mihi_est': '{aet} ele é meu'}, 'note': 'Draft 7: the Latin\'s order (in ætérnum first).', 'from': 'draft'},
]

# --- 118:103 (stylist): order taken, "palavras" refused
V['118:103'] = '{quam}, * mais que o mel à minha boca!'
byId['quam']['kind'] = 'order'
byId['quam']['options'] = [
    {'label': 'Como os vossos ditos são doces', 'forms': {'quam': 'Como {e_acc} são doces {faucibus}'}, 'note': 'Draft 8: the stylist\'s order (subject before "à minha garganta", so that the verse is understood as it goes). His noun, "as vossas palavras", is refused — it is D16\'s ruling that the plural elóquia stays "os vossos ditos", and "palavras" remains one touch away in decision "eloquia".', 'from': 'stylist'},
    {'label': 'Como são doces … os vossos ditos', 'forms': {'quam': 'Como são doces {faucibus} {e_acc}'}, 'note': 'Draft 7: the Latin\'s order, subject last.', 'from': 'draft'},
    {'label': 'Quão doces são … os vossos ditos', 'forms': {'quam': 'Quão doces são {faucibus} {e_acc}'}, 'note': 'Matos Soares, the Diurnal. "Quão" is understood and liturgical, but nobody says it.', 'from': 'MS1932'},
]

# --- 118:106 (stylist + ambiguity)
o = promote('statui', 'e resolvi')
o['note'] = 'Draft 8. The stylist heard "determinei" as administrative, and both he and the blind reader noted that it can be heard as an order given to someone. He offered "decidi": the sense is taken, in the verb that is not also a vós imperative ("decidi" = "decide ye"; "resolvi" is not, the imperative being "resolvei"). Lewis & Short: "to decide, determine, resolve".'
option('statui', 'e determinei')['note'] = 'Draft 7, Matos Soares. Can be heard as "I gave the order that".'
byId['statui']['options'].append({'label': 'e decidi', 'forms': {'statui': 'e decidi'}, 'note': 'The stylist\'s word. Equal in sense to "resolvi"; passed over only because "decidi" is also the vós imperative of decidir.', 'from': 'stylist'})

# --- 118:107 (stylist): usquequáque in an affirmative clause
V['118:107'] = '{usq107}, Senhor: * {vivifica} segundo a vossa palavra.'
data['decisions'].append({
    'id': 'usq107', 'refs': ['118:107'], 'latin': 'Humiliátus sum usquequáque', 'kind': 'glossary',
    'why': 'usquequáque → "de todo" (glossary, open: 118:8, 43; 118:51 turned it into "com toda a"). Those were negative clauses, where "de todo" is everyday Portuguese; this is the first affirmative one, and the stylist found "Fui humilhado de todo" not current "in that position". The blind reader understood it ("completely").',
    'options': [
        {'label': 'Fui de todo humilhado', 'forms': {'usq107': 'Fui de todo humilhado'}, 'note': 'Draft 8: the glossary\'s words in the position where an affirmative "de todo" is native (de todo perdido, de todo esquecido). Order only.', 'from': 'stylist'},
        {'label': 'Fui inteiramente humilhado', 'forms': {'usq107': 'Fui inteiramente humilhado'}, 'note': 'The stylist\'s line. Plain; gives up the one rendering of usquequáque.', 'from': 'stylist'},
        {'label': 'Fui humilhado de todo', 'forms': {'usq107': 'Fui humilhado de todo'}, 'note': 'Draft 7: the Latin\'s order.', 'from': 'draft'},
    ],
})

# --- 118:108 (stylist)
byId['beneplacita']['options'].insert(0, {'label': 'Fazei que vos agradem', 'forms': {'beneplacita': 'Fazei que vos agradem'}, 'note': 'Draft 8. The stylist refused "Fazei bem aceitas" as an unspontaneous combination and offered "Aceitai com agrado", which drops fac. This keeps fac as "fazei" and says plácita with the verb Portuguese has for placére (agradar); it is Matos Soares\' build ("Faze, Senhor, que te seja agradável") without spending jucúndus\'s adjective. "Bene" is carried by the verb itself.', 'from': 'MS1932'})
option('beneplacita', 'Fazei bem aceitas')['note'] = 'Draft 7: bene-plácita part by part. Refused by the stylist ("pouco espontânea").'
option('beneplacita', 'Aceitai com agrado')['note'] = 'The stylist\'s line; what the Greek says (the Diurnal: "aceita"). Drops fac; kept as an option.'
vol = option('voluntaria', 'o que é voluntário')
vol['label'] = 'as coisas voluntárias'
vol['forms'] = {'voluntaria': 'as coisas voluntárias'}
vol['note'] = 'Nothing supplied but "coisas" (the neuter plural said literally). Hard to follow.'

# --- 118:111–112 (stylist): the adverb moved off the end of the first colon
V['118:111'] = 'Adquiri por herança, {aet}, {t_acc}: * porque são a exultação do meu coração.'
V['118:112'] = 'Inclinei o meu coração {faciendas} {aet} {j_acc}, * por causa da retribuição.'

# --- 118:113, 128 (stylist: cadence) — the Latin's own periphrasis and order
od = byId['odio_habui']
od['why'] += ' Draft 8: the stylist faulted both verses for a proparoxytone at the cadence (iníquos at the mediant of 118:113, iníquo at the end of 118:128). For 118:113 he offered "Aos iníquos tive ódio" — which is the Latin word for word (Iníquos ódio hábui), periphrasis and order. The same is done in 118:128, so the draft returns to keeping ódio habére apart from odívi (118:104 "odiei"), now for the ear\'s sake as well as the Latin\'s.'
od['options'] = [
    {'label': 'tive ódio (the Latin\'s order)', 'forms': {'odio113': 'Aos iníquos tive ódio', 'odio128': 'a todo caminho iníquo tive ódio'}, 'note': 'Draft 8, from the stylist (118:113): both cadences now fall on "ódio", a paroxytone, as the Latin\'s fall on ódio hábui.', 'from': 'stylist'},
    {'label': 'odiei', 'forms': {'odio113': 'Odiei os iníquos', 'odio128': 'odiei todo caminho iníquo'}, 'note': 'Draft 7: one verb, as the Greek and every version. Leaves a proparoxytone at the mediant of 118:113 and at the end of 118:128.', 'from': 'DRB'},
    {'label': 'odiei todo caminho de iniquidade (118:128)', 'forms': {'odio113': 'Aos iníquos tive ódio', 'odio128': 'odiei todo caminho de iniquidade'}, 'note': 'The stylist\'s cure for 118:128. Refused: it makes 118:128b word for word 118:104b, where the Latin differs (viam iníquam / viam iniquitátis).', 'from': 'stylist'},
]

# --- 118:115: "malignos" was heard as evil spirits
V['118:115'] = 'Apartai-vos de mim, {maligni}: * e {scr_fut} {m_Dei}.'
data['decisions'].append({
    'id': 'maligni', 'refs': ['118:115'], 'latin': 'Declináte a me, malígni', 'kind': 'word',
    'why': 'malígni (πονηρευόμενοι, those who do evil): men, whom the psalmist sends away. The blind reader heard the cognate first as "evil spirits or demons" — in Brazilian church speech "o maligno" is the devil.',
    'options': [
        {'label': 'malvados', 'forms': {'maligni': 'malvados'}, 'note': 'Draft 8: the plain Brazilian word for wicked people, of disposition and deed alike (Lewis & Short for malígnus: "ill-disposed, wicked, malicious"); paroxytone; heard only of persons. Cost: it is also the word of children\'s stories.', 'from': 'ambiguity'},
        {'label': 'malignos', 'forms': {'maligni': 'malignos'}, 'note': 'Draft 7: the cognate (Matos Soares; Douay-Rheims "ye malignant"), and the wording the word study had pencilled. Heard as demons.', 'from': 'MS1932'},
        {'label': 'malfeitores', 'forms': {'maligni': 'malfeitores'}, 'note': 'The Diurnal\'s word, and the Greek participle\'s sense (evil-doers). In Brazil a "malfeitor" is a criminal.', 'from': 'DM1962'},
    ],
})

# --- 118:120: an option for the word the reader did not know
byId['confige']['options'].append({'label': 'Atravessai', 'forms': {'confige': 'Atravessai'}, 'note': 'The blind reader listed "Traspassai" among words an ordinary hearer might not know. "Atravessar" is the everyday verb for running something through. Not taken: "traspassar" is the word Portuguese keeps for exactly this (a sword through a soul), and the reader\'s paraphrase shows he understood it.', 'from': 'ambiguity'})

# --- 118:114: the Latinist's agent nouns, as an option
byId['adjuva']['options'].append({'label': 'auxiliar · auxiliador', 'forms': {'adjuva': 'auxiliai-me', 'Adjuva': 'Auxiliai-me', 'adjutor114': 'o meu auxiliador'}, 'note': 'The Latinist (minor): adjútor and suscéptor are personal nouns, "auxílio" and "amparo" are abstracts; he offers "o meu auxiliador e o meu protetor". Refused, as it was twice in Ps 117:6–7: "auxiliador" is long and hardly said; suscéptor → amparo is settled (D19) and "protetor" is protéctor\'s word; "Vós sois o meu auxílio" is the same metonymy Portuguese prays everywhere.', 'from': 'latinist'})

# --- 118:125 (stylist)
o = promote('sciam', 'conheça')
o['note'] = 'Draft 8, from the stylist: "saber os testemunhos" is not a current combination and suggests knowing them by heart. Matos Soares, Douay-Rheims "know"; the Greek has the verb of 118:79 here too (γνώσομαι). scire and novísse share "conhecer"; sciéntia stays "o saber" (118:66).'
option('sciam', 'saiba')['note'] = 'Draft 7: scire → saber, kept apart from conhecer. Refused by the stylist as a collocation.'

# --- 118:128 (stylist)
o = promote('dirigebar', 'eu me dirigia para')
o['note'] = 'Draft 8. The stylist heard the passive "era dirigido a" as mechanical, and offered "me orientava para" — another verb. The middle reading of dirigébar keeps the glossary\'s verb and is as good Latin as the passive (the Greek κατωρθούμην is middle or passive alike). The Latinist had passed the passive; he reads this draft again.'
option('dirigebar', 'eu era dirigido a')['note'] = 'Draft 7: the passive, as 118:5 and Douay-Rheims ("was I directed"). The blind reader supplied God as the agent, which is a fair reading of the Latin. Mechanical to the stylist.'

# --- 118:123: the stylist's noun, recorded where it is decided
byId['v123b']['options'][0]['note'] += ' Draft 8: the stylist refused it ("sounds like a reference to a quoted phrase") and asked for "pela palavra da vossa justiça" — D16\'s named retreat, which is not mine to take in one verse; it is the fourth label of decision "eloquia". The blind reader understood the noun at once ("waiting for the fulfilment of a just promise of God / for a just word or decision"). With draft 8\'s preposition it reads "e à espera do dito da vossa justiça".'

# ---------------------------------------------------------------- choices
C['118:81'] = C['118:81'].replace('decision "deficere_in" for the preposition.', 'decision "deficere_in" for the preposition — draft 8: "à espera da" (Matos Soares), after 118:82 was misheard with "por".')
C['118:82'] = 'elóquium under D16: the clause, after the preposition of decision "deficere_in" → draft 8 "à espera do que dissestes" (draft 7 "pelo que dissestes" was heard as cause). "dissestes, * dizendo" sets the root of dizer on both sides of the asterisk; the Latin has two roots (elóquium … dicéntes), but the Greek has one (τὸ λόγιόν σου λέγοντες), so the echo is the Septuagint\'s and was let stand; neither the stylist nor the Latinist remarked on it. Decision "dicentes". consolári → consolar (118:50, 52, 76).'
C['118:85'] = C['118:85'].replace('iníqui → iníquos (glossary).', 'iníqui → iníquos (glossary). Draft 8: fabulatiónes → "histórias". The blind reader gave the second colon three readings (not in accord with your law / not comparable to it / not told as your law tells); the Latin\'s ellipsis bears all three.')
C['118:90'] = 'Decision "v90a" (draft 8: with the copula). "e ela permanece": the subject named (D2); "ela" is heard of the nearest noun, "a terra". véritas → verdade: the blind reader heard "what God says, which is true" before "faithfulness" — the glossary\'s known cost.'
C['118:92'] = 'Decision "nisi_quod" (draft 8 rewrites the verse: the stylist\'s worst line). tunc forte → "então talvez" — forte is translated (Douay-Rheims "perhaps"; Matos Soares turns it into "de certo", which is the opposite). in humilitáte mea → "na minha humilhação" (the slot of 118:50): the blind reader heard "when I was shamed or brought low by someone" first, "in suffering" second — the glossary row humílitas records the same from the previous portion. períre → perecer (glossary).'
C['118:95'] = C['118:95'] + ' Draft 8: pérdere → "destruir" (decision "perderent").'
C['118:96'] = 'Decisions "consummationis" (draft 8: natural order) and "latum96" (draft 8: "é muito amplo"). The blind reader heard "vi o fim" as "I saw that all perfection ends", with "has a limit" and "its purpose" as other readings: finem bears the first two. The echo consummavérunt (118:87) … consummatiónis is lost in Portuguese; see decision "consummaverunt". mandátum tuum: one of the two singulars of the psalm, kept singular.'
C['118:97'] = 'The first colon ends with "!" where DO\'s Latin prints "?" (decision "quomodo"). meditátio mea est → "é a minha meditação" (formula). "ela" is supplied so that the span of time is not taken for the subject. Decision "tota_die": draft 8 "o dia todo".'
C['118:98'] = 'Draft 8: natural order (decision "super"); mandáto tuo (ablative of means) → "Pelo vosso mandamento", now at the head. prudéntem me fecísti super → "me fizestes mais prudente que". Decision "mihi_est"; the adverb last.'
C['118:99'] = 'Draft 8: natural order (decision "super"). docéntes me → "os que me ensinam" (docére → ensinar). intelléxi absolute → "Entendi", as the Latin. Formula: testimónia tua meditátio mea est → "os vossos testemunhos são a minha meditação" (118:24).'
C['118:100'] = C['118:100'] + ' Draft 8: natural order (decision "super").'
C['118:103'] = 'The plural elóquia → "os vossos ditos" (D16), as 118:11 — refused by the stylist here for the first time ("suggests maxims or loose expressions"; he wants "palavras"); kept under D16, see decision "quam" and the audit. Draft 8 takes his order. super mel ori meo → "mais que o mel à minha boca": the two datives (fáucibus meis … ori meo) are built alike. The Greek adds "and honeycomb"; the Latin does not.'
C['118:106'] = C['118:106'] + ' Draft 8: státui → "resolvi" (decision "statui"). The Latin\'s comma after Jurávi is kept.'
C['118:107'] = 'Decision "usq107" (draft 8: "Fui de todo humilhado"). secúndum verbum tuum → "segundo a vossa palavra" (formula, = the Nunc dimittis). humiliáre → humilhar.'
C['118:108'] = 'Decisions "voluntaria" and "beneplacita" (draft 8: "Fazei que vos agradem"). The blind reader heard "the prayers and praises I utter of my own accord", which is the verse. judícia tua doce me → "ensinai-me os vossos juízos" (the build of the formula doce me justificatiónes tuas).'
C['118:109'] = 'Copula supplied ("está"). in mánibus meis: the Latin\'s reading (first person), kept. The blind reader heard "I have control of, or responsibility for, my soul\'s fate" before "my life is constantly at risk", which is what the idiom means (Matos Soares explains it in a footnote). Left: the Latin gives the image and no more, and any cure would be an explanation (D2).'
C['118:111'] = 'Hereditáte acquisívi → "Adquiri por herança" (acquírere is simply to acquire; Douay-Rheims "purchased" is over-literal). Draft 8: "eternamente" moved inside the colon, from the stylist, who heard it as a late addition at the end. exsultátio → exultação (glossary). "Adquiri" is a first-person past that equals the vós imperative of adquirir — the reverse of rule 3\'s trap; no reader took it for a command.'
C['118:112'] = 'Decision "faciendas". Draft 8: "eternamente" before the object (stylist), so that the long first colon arrives on "preceitos". propter retributiónem → "por causa da retribuição" (glossary retribútio → retribuição; the Latin\'s reading, not the Hebrew\'s "to the end"): the blind reader heard "to receive a reward from God" first.'
C['118:113'] = 'Iníquos: the Latin\'s (and Greek\'s) reading, not the Hebrew\'s "the double-minded". Decision "odio_habui": draft 8 has the Latin word for word, "Aos iníquos tive ódio". dilígere → amar, perfect kept (118:47).'
C['118:115'] = 'Declináte a me → "Apartai-vos de mim" (declináre a → apartar-se de, as the word study fixed). Decision "maligni": draft 8 "malvados", because "malignos" was heard as demons. scrutábor → sondarei. mandáta Dei mei: the only place in the psalm where God is spoken of in the third person to others.'
C['118:116'] = 'The formula secúndum elóquium tuum → "segundo o que dissestes" (D16): no reader remarked on it, and the stylist\'s own proposed line keeps it. et vivam → "e viverei" (as 118:77). Decisions "suscipe", "exspectare" (draft 8: "no que aguardo"); non confúndas me → "não me envergonheis" (D15).'
C['118:125'] = C['118:125'] + ' Draft 8: sciam → "conheça" (decision "sciam").'
C['118:126'] = 'Decisions "tempus_faciendi", "dissipaverunt". The blind reader heard "it is time for the Lord to act" first and "for me / us to act" second: the Latin\'s openness, kept.'
C['118:128'] = 'ad ómnia mandáta tua → "para todos os vossos mandamentos". The second colon is the near-twin of 118:104b (viam iniquitátis / viam iníquam): "todo caminho de iniquidade" / "todo caminho iníquo" keep the Latin\'s difference, and so now do "odiei" / "tive ódio". Decisions "dirigebar" (draft 8: the middle, "eu me dirigia para"), "odio_habui".'

# ---------------------------------------------------------------- audit
data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v7.latinist.part3.json', 'note': 'Read 118:81–128 only (ps118/part3/). All 48 verses checked; marks identical. One remark, minor: 118:114 abstract nouns for the agent nouns adjútor and suscéptor — refused, kept as an option. Nothing on any law-term, on the D16 clause (118:82, 116), on "dito" (118:123), or on the places where the draft follows the Latin against the Hebrew.',
     'outcomes': [
         {'verse': '118:114', 'remark': '"o meu auxílio e o meu amparo" replace the personal nouns adjútor and suscéptor with abstracts; fix "o meu auxiliador e o meu protetor"', 'outcome': 'option', 'decision': 'adjuva', 'reason': 'The same remark was refused twice in Ps 117:6–7 (auxiliador is long and hardly said). suscéptor → amparo is settled (D19), and "protetor" is protéctor\'s word in the glossary. The metonymy is the one Portuguese prays with everywhere.'},
     ]},
    {'step': 'stylist', 'file': 'critic/v7.stylist.part3.json', 'note': 'Read 118:81–128 only. 19 verses faulted (20 remarks); worst line 118:92, best 118:94. 15 taken (several in part, or by another wording than his — each outcome says which), 5 kept as options. On D16: he passed the clause in both places where it stands (118:82 "pelo que dissestes", 118:116 "segundo o que dissestes" — his own proposed line for 118:116 keeps it), refused the plural "os vossos ditos" in 118:103 (the first time the plural is refused: "maxims or loose expressions") and the noun "o dito da vossa justiça" in 118:123, asking for "palavra(s)" both times. Three of his lines silently turn "eternamente" into "para sempre" (118:98, 111, 112): recorded on the glossary row in ætérnum; not taken, the two are kept apart on purpose.',
     'outcomes': [
         {'verse': '118:85', 'remark': '"fábulas" is a proparoxytone at the mediant; alternative "narraram fábulas para mim"', 'outcome': 'taken', 'reason': 'Cured by the word instead of the order: "histórias" (paroxytone), which also answers the ambiguity reader.'},
         {'verse': '118:90', 'remark': 'verbless first colon sounds unfinished; alternative "A vossa verdade permanece de geração em geração"', 'outcome': 'option', 'decision': 'v90a', 'reason': 'The complaint is taken with a copula ("De geração em geração é a vossa verdade", D14\'s build). His verb is refused: it supplies pérmanet where the Latin has none, a third "permanece" in two verses.'},
         {'verse': '118:92', 'remark': '"Não fosse que … é" needs a mental correction; the insertions in the second colon slow it; alternative "Se a vossa lei não fosse a minha meditação: * … na minha humilhação"', 'outcome': 'taken', 'decision': 'nisi_quod', 'reason': 'His build and his second colon are taken; the first colon is turned round ("Se a minha meditação não fosse a vossa lei") because his line rhymes meditação / humilhação at mediant and final. His exact line is option 2.'},
         {'verse': '118:95', 'remark': '"me aguardaram para me fazer perecer" ceremonious and heavy; alternative "me esperaram para me destruir"', 'outcome': 'taken', 'decision': 'perderent', 'reason': '"para me destruir" taken. "me esperaram" refused and kept as an option in decision "exspectare": exspectáre is kept apart from speráre.'},
         {'verse': '118:96', 'remark': 'initial inversion and "sobremaneira" pile up literary solemnity; alternative "Vi o fim de toda perfeição: * o vosso mandamento é muito amplo"', 'outcome': 'taken', 'decision': 'latum96'},
         {'verse': '118:98', 'remark': 'the comparison comes before what is compared; alternative "Pelo vosso mandamento me fizestes mais prudente que os meus inimigos: * porque ele é meu para sempre"', 'outcome': 'taken', 'decision': 'super', 'reason': 'Order taken in both cola. "para sempre" not taken (in ætérnum → eternamente; option in decision "in_aeternum").'},
         {'verse': '118:99', 'remark': 'the verb arrives late; alternative "Entendi mais que todos os que me ensinam"', 'outcome': 'taken', 'decision': 'super'},
         {'verse': '118:100', 'remark': 'the fronted comparison sounds artificial; alternative "Entendi mais que os anciãos"', 'outcome': 'taken', 'decision': 'super'},
         {'verse': '118:103', 'remark': '"ditos" suggests maxims or loose expressions; the subject after "à minha garganta" delays the entry; alternative "Como as vossas palavras são doces à minha garganta"', 'outcome': 'option', 'decision': 'eloquia', 'reason': 'Order taken ("Como os vossos ditos são doces à minha garganta"). "palavras" refused: D16 rules the plural "os vossos ditos", and merging elóquium into verbum is a cross-psalm ruling, not this verse\'s; it is the label "palavras" of decision "eloquia".'},
         {'verse': '118:106', 'remark': '"determinei guardar" administrative, can be heard as an order given; alternative "Jurei e decidi"', 'outcome': 'taken', 'decision': 'statui', 'reason': 'Taken as "resolvi": the same sense, in a verb that is not also a vós imperative ("decidi"). The Latin\'s comma after Jurávi is kept.'},
         {'verse': '118:107', 'remark': '"de todo" in an affirmative clause, in that position, is not current; alternative "Fui inteiramente humilhado"', 'outcome': 'taken', 'decision': 'usq107', 'reason': 'Taken by position ("Fui de todo humilhado"), which keeps the glossary\'s rendering of usquequáque; his adverb is option 2.'},
         {'verse': '118:108', 'remark': '"Fazei bem aceitas" is unspontaneous, and the vocative separates it from its long complement; alternative "Aceitai com agrado, Senhor, …"', 'outcome': 'option', 'decision': 'beneplacita', 'reason': 'The complaint is taken with "Fazei que vos agradem" (Matos Soares\' build), which keeps fac; his line drops it and is kept as an option.'},
         {'verse': '118:111', 'remark': '"eternamente" arrives as a late addition; alternative "Adquiri para sempre, por herança, os vossos testemunhos"', 'outcome': 'taken', 'reason': 'Order taken: "Adquiri por herança, eternamente, os vossos testemunhos". "para sempre" is the option of decision "in_aeternum".'},
         {'verse': '118:112', 'remark': 'the first colon piles up length until the final adverb; alternative "… a cumprir para sempre os vossos preceitos"', 'outcome': 'taken', 'reason': 'Order taken: "para cumprir eternamente os vossos preceitos".'},
         {'verse': '118:113', 'remark': '"iníquos" is a proparoxytone before the mediant; alternative "Aos iníquos tive ódio"', 'outcome': 'taken', 'decision': 'odio_habui', 'reason': 'His line is the Latin word for word (Iníquos ódio hábui).'},
         {'verse': '118:116', 'remark': '"na minha expectativa" bureaucratic and ill-joined to "envergonheis"; alternative "não me envergonheis pelo que espero"', 'outcome': 'taken', 'decision': 'exspectare', 'reason': 'His clause is taken with exspectáre\'s verb: "no que aguardo". "espero" is refused (speráre\'s root) and kept as an option.'},
         {'verse': '118:123', 'remark': '"o dito da vossa justiça" sounds like a reference to a quoted phrase; alternative "pela palavra da vossa justiça"', 'outcome': 'option', 'decision': 'v123b', 'reason': 'D16 names this verse as one where the singular must be a noun, "dito" available, and names "palavra" as the honest retreat for the whole term — a ruling for the main session, not for one verse. The blind reader understood the noun at once.'},
         {'verse': '118:125', 'remark': '"saber os testemunhos" is not a current combination; alternative "conheça"', 'outcome': 'taken', 'decision': 'sciam'},
         {'verse': '118:128', 'remark': 'the passive "era dirigido a" sounds mechanical; alternative "eu me orientava para"', 'outcome': 'taken', 'decision': 'dirigebar', 'reason': 'Taken as the middle of the same verb ("eu me dirigia para"); "orientar" is another word.'},
         {'verse': '118:128', 'remark': '"iníquo" is a proparoxytone at the end; alternative "odiei todo caminho de iniquidade"', 'outcome': 'option', 'decision': 'odio_habui', 'reason': 'The cadence is cured by the Latin\'s own order and periphrasis ("a todo caminho iníquo tive ódio"). His line is refused: it would make 118:128b identical with 118:104b, where the Latin differs (viam iníquam / viam iniquitátis).'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v7.ambiguity.part3.json', 'note': 'Read the Portuguese of 118:81–128 alone (ps118/part3/blind/). 49 entries; most hear the verse rightly or find the Latin\'s own openness (118:84 the days, 118:85 the ellipsis, 118:96 finem, 118:112 retribuição, 118:126 who is to act). Wrong first hearings, and what was done: 118:82 "pelo que dissestes" as cause → the preposition changed in all three verses of defícere in; 118:85 "fábulas" as moral tales → "histórias"; 118:97 "todo o dia" as "every day" → "o dia todo"; 118:115 "malignos" as demons → "malvados"; 118:82 "dizendo" attached to the speaker, not the eyes → kept, with the finite verb as an option; 118:109 the soul in my hands heard as control rather than danger → kept (the Latin\'s image, unexplained). On D16: the clause was understood in 118:116; in 118:82 the mishearing was the preposition\'s doing, not the clause\'s (the reader\'s right reading was "waiting for the fulfilment of what you said"); "o dito da vossa justiça" (118:123) was understood at once. The law-words were heard as in the earlier portions (testemunhos as declarations given by God, four times; juízos as norms first, sentences second). Unknown words listed: odre, preceitos (six times), iníquos / iniquamente / iniquidade, vivificai-me, sobremaneira (now gone), veredas, exultação, Traspassai, topázio.',
     'outcomes': [
         {'verse': '118:82', 'remark': '"desfaleceram pelo que dissestes" heard first as "lost their strength as a reaction to what you said"', 'outcome': 'taken', 'decision': 'deficere_in', 'reason': '"à espera de" (Matos Soares 1932) in 118:81, 82, 123 alike.'},
         {'verse': '118:81', 'remark': '"desfaleceu pela vossa salvação": from waiting for it / because of salvation received — heard rightly', 'outcome': 'taken', 'decision': 'deficere_in', 'reason': 'Heard rightly, but changed with 118:82 so that defícere in has one rendering.'},
         {'verse': '118:82', 'remark': '"dizendo" heard as "I was saying", not the eyes', 'outcome': 'option', 'decision': 'dicentes', 'reason': 'Participle for participle; the only grammatical subject is "os meus olhos"; both hearings pray the same prayer. "e diziam" is the option.'},
         {'verse': '118:85', 'remark': '"fábulas" heard first as invented stories with a moral teaching', 'outcome': 'taken', 'decision': 'fabulationes'},
         {'verse': '118:85', 'remark': '"mas não como a vossa lei": three readings', 'outcome': 'refused', 'reason': 'The Latin\'s own ellipsis (sed non ut lex tua); filling it, as Matos Soares does, goes beyond the Latin.'},
         {'verse': '118:84', 'remark': '"os dias do vosso servo": of life, or of suffering still to come; "fareis juízo sobre": judge, or punish', 'outcome': 'refused', 'reason': 'Both pairs are open in the Latin. "fazer juízo sobre" was not heard as "form an opinion of", which was the fear.'},
         {'verse': '118:90', 'remark': '"a vossa verdade": what you say that is true / your faithfulness', 'outcome': 'refused', 'reason': 'véritas → verdade (glossary, since Ps 90); the Hebrew-family "fidelidade" is what the project does not import.'},
         {'verse': '118:92', 'remark': '"humilhação" heard first as being shamed by someone', 'outcome': 'refused', 'reason': 'The glossary row humílitas → humilhação records the same hearing from 118:50; the family humiliáre / humílitas is kept together.'},
         {'verse': '118:97', 'remark': '"todo o dia" heard as "every day"', 'outcome': 'taken', 'decision': 'tota_die'},
         {'verse': '118:98', 'remark': 'second reading: "you did more for my prudence than my enemies did"', 'outcome': 'taken', 'decision': 'super', 'reason': 'Removed by the natural order taken from the stylist.'},
         {'verse': '118:106', 'remark': '"determinei" can be heard as "I gave an order"', 'outcome': 'taken', 'decision': 'statui'},
         {'verse': '118:109', 'remark': '"A minha alma está sempre nas minhas mãos" heard first as having control of, or responsibility for, my soul\'s fate; "my life is at risk" second', 'outcome': 'refused', 'reason': 'The Latin gives the image and no more (Matos Soares explains it in a footnote, not in the text); any cure would be an explanation, which D2 forbids.'},
         {'verse': '118:115', 'remark': '"malignos" heard first as evil spirits or demons', 'outcome': 'taken', 'decision': 'maligni'},
         {'verse': '118:120', 'remark': '"Traspassai" listed as unknown', 'outcome': 'option', 'decision': 'confige', 'reason': 'His paraphrase shows he understood it; "traspassar" is the word Portuguese keeps for this. "Atravessai" added as an option.'},
         {'verse': '118:121', 'remark': '"Fiz juízo e justiça" heard as "I acted with discernment and justly" before "I judged cases"', 'outcome': 'refused', 'reason': 'judícium → juízo is D15\'s word, with this known cost; the two hearings are both in fácere judícium.'},
         {'verse': '118:128', 'remark': '"era dirigido": an unexpressed agent (God) / my own attention turned', 'outcome': 'taken', 'decision': 'dirigebar', 'reason': 'Both are readings of dirigébar; draft 8 has the middle, from the stylist\'s remark.'},
         {'verse': '118:96', 'remark': '"sobremaneira" listed as unknown', 'outcome': 'taken', 'decision': 'latum96'},
     ]},
    {'step': 'revision', 'version': 8, 'note': 'Draft 8 = 118:81–128 revised after the three readers; 118:1–80 untouched (ps118/verify_untouched_v6.py). Changed verses: 118:81, 82, 123 (defícere in → à espera de); 85 (histórias); 90 (copula); 92 (rebuilt); 95 (destruir); 96 (order; muito amplo); 97 (o dia todo); 98–100 (natural order); 103 (order); 106 (resolvi); 107 (de todo humilhado); 108 (Fazei que vos agradem); 111, 112 (adverb moved); 113, 128 (tive ódio, the Latin\'s order); 115 (malvados); 116 (no que aguardo); 125 (conheça); 128 (me dirigia para). New decisions: dicentes, tota_die, usq107, maligni. Held under D16 against the stylist: "os vossos ditos" (118:103), "o dito da vossa justiça" (118:123). Held against the Latinist (minor): "o meu auxílio e o meu amparo" (118:114). Because the wording changed materially, the Latinist gate is run again on this draft.'},
]
data['version'] = 8
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 8 written:', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
