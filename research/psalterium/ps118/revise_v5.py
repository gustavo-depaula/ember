"""Draft 5 of Ps 118: the revision of 118:33–80 after the three blind readers (critic/v4.*.part2.json).
118:1–32 is not touched. Draft 4 is kept as prayed.v4.json (flat text prayed.v4.vos.json).

Run once from the repo root, on a prayed.json that is still version 4:
  python3.13 research/psalterium/ps118/revise_v5.py
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 4:
    sys.exit(f"prayed.json is version {data['version']}, expected 4 — not touching it")
byId = {d['id']: d for d in data['decisions']}
V, C = data['verses'], data['choices']


def promote(decisionId, label):
    """Make the option with this label option 0 (the ruling)."""
    options = byId[decisionId]['options']
    chosen = next(o for o in options if o['label'] == label)
    options.remove(chosen)
    options.insert(0, chosen)
    return chosen


# --- 118:33 — the ambiguity reader heard "Ponde-me … o caminho" as "put me on the way"
o = promote('legem_pone', 'Imponde-me por lei, Senhor, o caminho')
o['note'] = 'Draft 5, Matos Soares 1932. Taken because the blind reader heard draft 4\'s "Ponde-me por lei … o caminho" first as "put me on the way of your precepts" (me as the object). "Impor" is still pôr (im-pónere), is safe under rule 3 (past "impus"), and cannot be misparsed: a law is imposed on someone. Cost: a shade harsher than pónere.'
byId['legem_pone']['options'][1]['note'] = 'Draft 4. pónere → pôr, the plain verb. Misheard by the ambiguity reader: "Colocai-me no caminho dos vossos preceitos".'

# --- 118:37 vanitátem: a decision, because the reader heard conceit first
V['118:37'] = 'Desviai os meus olhos para que não vejam {vanitatem}: * no vosso caminho {vivifica}.'
data['decisions'].append({
    'id': 'vanitatem', 'refs': ['118:37'], 'latin': 'ne vídeant vanitátem', 'kind': 'glossary',
    'why': 'vánitas (ματαιότης): emptiness, what is vain. Ps 4:3 already has "a vaidade" (ut quid dilígitis vanitátem). The ambiguity reader heard it here first as concern with one\'s looks, second as empty and passing things.',
    'options': [
        {'label': 'a vaidade', 'forms': {'vanitatem': 'a vaidade'}, 'note': 'Kept: the cognate, Ps 4:3\'s word, Matos Soares\'; with "olhos" and "ver" the mishearing (vanity before a mirror) is close at hand, but the right sense was the reader\'s second and is the word\'s own in church speech ("vaidade das vaidades").', 'from': 'MS1932'},
        {'label': 'o que é vão', 'forms': {'vanitatem': 'o que é vão'}, 'note': 'Unmistakable; a clause for a noun, and Ps 4:3 would have to follow.', 'from': 'ambiguity'},
    ],
})

# --- 118:38 order (stylist)
V['118:38'] = '{statue} {e_sg} para o vosso servo, * no vosso temor.'

# --- 118:43 order (stylist: "de todo da" tangles) + supersperáre (ambiguity: heard as waiting a long time)
V['118:43'] = 'E da minha boca não tireis de todo a palavra da verdade: * porque {superspero} {jd_in}.'
sup = byId['supersperavi']
sup['options'].insert(0, {
    'label': 'pus toda a esperança em', 'forms': {'superspero': 'pus toda a esperança'},
    'note': 'Draft 5. The ambiguity reader heard draft 4\'s "esperei muito nos vossos juízos / nas vossas palavras" FIRST as "I waited a long time for" in both verses (118:43, 74) — a sense supersperáre does not have. This is Matos Soares\' rendering at 118:74 without its possessive (the Latin has none), which keeps it to +3 syllables: it cannot be misheard, it is the Greek exactly (ἐπ-ελπίζω, to set one\'s hope upon), and "toda" gives super- its due. Cost: sperávi (118:42 "esperei") and supersperávi are now verb and noun of one family rather than one verb.',
    'from': 'MS1932'})
sup['options'][1]['note'] += ' Draft 4\'s text; the predicted risk was real — see the first option.'

# --- 118:44: the two readers' proposals become options
byId['saeculum44']['options'] += [
    {'label': 'pelos séculos dos séculos e para sempre', 'forms': {'saeculum44': 'pelos séculos dos séculos e para sempre'}, 'note': 'The stylist: the verse should not end on a proparoxytone. Refused: it turns the Latin\'s climb (for ever, and for ever of for ever) upside down, and the Latin ends on a proparoxytone too (sǽculi) — a psalm tone that serves the one serves the other.', 'from': 'stylist'},
    {'label': 'para sempre e pelo século do século', 'forms': {'saeculum44': 'para sempre e pelo século do século'}, 'note': 'The Latinist (minor): both nouns of in sǽculum sǽculi are singular. Refused: "pelos séculos dos séculos" is the glossary\'s formula for the phrase everywhere, the plural being how Portuguese has always said it; the number carries no sense here.', 'from': 'latinist'},
]

# --- 118:51 (stylist)
V['118:51'] = '{v51a}: * mas da vossa lei não me apartei.'
data['decisions'].append({
    'id': 'v51a', 'refs': ['118:51'], 'latin': 'Supérbi iníque agébant usquequáque', 'kind': 'grammar',
    'why': 'An adverb qualified by an adverb (iníque … usquequáque). The stylist found draft 4\'s "agiam de todo iniquamente" heavy and un-Brazilian.',
    'options': [
        {'label': 'Os soberbos agiam com toda a iniquidade', 'forms': {'v51a': 'Os soberbos agiam com toda a iniquidade'}, 'note': 'Draft 5, after the stylist ("com total iniquidade"): adverb → com + noun is grammar (D2), and "toda" keeps the "todo" by which usquequáque is rendered in 118:8 and 118:43. The Latin\'s length exactly.', 'from': 'stylist'},
        {'label': 'Os soberbos agiam de todo iniquamente', 'forms': {'v51a': 'Os soberbos agiam de todo iniquamente'}, 'note': 'Draft 4: usquequáque → "de todo" word for word, as in 118:8 and 118:43. 3 over, and heavy in the mouth.', 'from': 'draft'},
    ],
})

# --- 118:54: the stylist's alternative as an option
byId['cantabiles']['options'].append({'label': 'eram para mim próprios para o canto', 'forms': {'cantabiles': '{j_Acc} eram para mim próprios para o canto'}, 'note': 'The stylist, who heard "dignos de canto" as a literary judgement. Refused: cantábilis is a judgement (Lewis & Short: worthy to be sung), and "próprios para o canto" says they suit singing, which is less.', 'from': 'stylist'})

# --- 118:60 (Latinist, major)
par = byId['paratus']
par['options'].insert(0, {'label': 'Estou preparado, e não fui perturbado', 'forms': {'paratus': 'Estou preparado, e não fui perturbado'}, 'note': 'Draft 5, the Latinist\'s fix (major): draft 4\'s ellipsis "e não perturbado" made a present state of non sum turbátus and lost the perfect passive. Parátus sum stays a state (as Douay-Rheims), the second verb is the event. The stylist, for his part, heard the ellipsis as a speaker correcting himself and asked for a full second verb — this gives him one.', 'from': 'latinist'})
par['options'][1]['note'] = 'Draft 4 (shortened from "e não estou perturbado" after the first length check). Refused by both readers: the Latinist (tense and voice lost), the stylist (heard as a correction between adjectives).'
par['options'].insert(2, {'label': 'Estou preparado e não estou perturbado', 'forms': {'paratus': 'Estou preparado e não estou perturbado'}, 'note': 'The stylist\'s line, and Douay-Rheims\' reading (two states). The Latinist asks for the perfect.', 'from': 'stylist'})

# --- 118:63: stylist refused "ter parte com"; kept, his word was already the option
byId['particeps']['options'][0]['note'] += ' Draft 5: the stylist says a Brazilian ear asks "part in what?" and proposes "Sou companheiro de"; the ambiguity reader, with the Portuguese alone, heard it rightly at once ("pertenço ao mesmo grupo", then "partilho com todos de alguma herança"). Kept: it is the Latin\'s word taken apart, and it was understood; the stylist\'s is the next option.'
byId['particeps']['options'][1]['from'] = 'stylist'

# --- 118:66 sciéntiam (ambiguity: heard as science)
V['118:66'] = 'Ensinai-me a bondade, e a disciplina, e {scientiam}: * porque {credidi} {m_in}.'
data['decisions'].append({
    'id': 'scientiam', 'refs': ['118:66'], 'latin': 'et sciéntiam', 'kind': 'glossary',
    'why': 'sciéntia (γνῶσις): knowledge. It returns at 18:3 nox nocti índicat sciéntiam, 93:10 qui docet hóminem sciéntiam, 138:6 Mirábilis facta est sciéntia tua. Draft 4 had the cognate, as Matos Soares; the ambiguity reader heard "scientific knowledge" first.',
    'options': [
        {'label': 'o saber', 'forms': {'scientiam': 'o saber'}, 'note': 'Draft 5. The noun of scire → saber, as sciéntia is of scire; two syllables, stressed on the last; "que ensina ao homem o saber" (93:10), "a noite à noite anuncia o saber" (18:3) are natural.', 'from': 'ambiguity'},
        {'label': 'o conhecimento', 'forms': {'scientiam': 'o conhecimento'}, 'note': 'The plain word for γνῶσις; five syllables, and cognóscere → conhecer (118:75, 79) is another Latin family.', 'from': 'draft'},
        {'label': 'a ciência', 'forms': {'scientiam': 'a ciência'}, 'note': 'Draft 4, Matos Soares 1932: the cognate, and a gift of the Spirit in church speech. Heard first as science.', 'from': 'MS1932'},
    ],
})

# --- 118:70 (Latinist, minor)
V['118:70'] = 'O coração deles coalhou-se como leite: * eu, porém, meditei na vossa lei.'

# --- 118:76, 80 Fiat (stylist)
V['118:76'] = '{v76a}, * {e_sec} ao vosso servo.'
V['118:80'] = '{v80a}, * {conf80}.'
fiat = byId['fiat']
fiat['options'] = [
    {'label': 'Seja', 'forms': {'v76a': 'Seja a vossa misericórdia para me consolar', 'v80a': 'Seja o meu coração {imm_sg} {j_in}'}, 'note': 'Draft 5. The stylist failed "Faça-se" in both verses ("a hard construction", "assembled on a foreign syntax"). "Seja" is how Douay-Rheims ("let … be") and Matos Soares (118:80) render Fiat; fíeri is "to be made" and "to come to be", and for the jussive Portuguese says "seja" — how the thing is said, not another thing (D2). In 118:76 the verb consolétur is kept as a verb. The glossary\'s fíeri → fazer-se (open) stands for factus est; this adds the jussive.', 'from': 'stylist'},
    {'label': 'Que … seja (the stylist\'s lines)', 'forms': {'v76a': 'Que a vossa misericórdia seja para meu consolo', 'v80a': 'Que o meu coração seja {imm_sg} {j_in}'}, 'note': 'The stylist\'s own wording. In 118:76 it is Douay-Rheims\' construction exactly ("let thy mercy be for my comfort"); it makes a noun of ut consolétur me and drops the article before the possessive (rule 5 keeps it). "Que … seja" is a little more colloquial than the bare jussive.', 'from': 'stylist'},
    {'label': 'Faça-se', 'forms': {'v76a': 'Faça-se a vossa misericórdia para me consolar', 'v80a': 'Faça-se o meu coração {imm_sg} {j_in}'}, 'note': 'Draft 4. The glossary verb; it is the "Faça-se" of the Angelus (fiat mihi secúndum verbum tuum), which 118:76 all but quotes with secúndum elóquium tuum. Refused twice by the stylist.', 'from': 'glossary'},
]

# --- 118:78 (stylist: the worst line)
V['118:78'] = '{v78a}: * mas eu {exerc_fut} {m_in}.'
for o in byId['confundi']['options']:
    o['forms']['conf78r'] = 'Envergonhem-se' if o['label'] == 'envergonhar' else 'Sejam confundidos'
data['decisions'].append({
    'id': 'v78a', 'refs': ['118:78'], 'latin': 'Confundántur supérbi, quia injúste iniquitátem fecérunt in me', 'kind': 'grammar',
    'why': 'The longest colon of the portion (22 syllables in the Latin). The stylist named draft 4\'s version the worst line: too much for one breath, and "me fizeram iniquidade" is not current syntax.',
    'options': [
        {'label': 'Envergonhem-se os soberbos, porque injustamente me trataram com iniquidade', 'forms': {'v78a': '{conf78r} os soberbos, porque injustamente me trataram com iniquidade'}, 'note': 'Draft 5, the stylist\'s line but for his "pois" (quia is "porque" throughout the psalm). "Envergonhem-se": the same verb D15 rules, in the se-form, which in Portuguese is passive and reflexive at once — as the Greek behind Confundántur is (αἰσχυνθήτωσαν); and the ambiguity reader heard even "Sejam envergonhados" first as "let them feel shame". iniquitátem fácere in → "tratar com iniquidade": the light verb yields (D2), the noun stays, and the Latin\'s injúste … iniquitátem is still heard. 3 over instead of 5.', 'from': 'stylist'},
        {'label': 'Sejam envergonhados os soberbos, porque injustamente me fizeram iniquidade', 'forms': {'v78a': '{conf78} os soberbos, porque injustamente me fizeram iniquidade'}, 'note': 'Draft 4: the passive as ruled, fácere as fazer. 5 over; refused by the stylist on breath and syntax.', 'from': 'draft'},
    ],
})

# --- eloquia: the verdict on "dito"
el = byId['eloquia']
el['options'][0]['note'] += (
    ' DRAFT 5 — THE TEST OF THE SINGULAR (118:38, 41, 50, 58, 67, 76), which D15 asked for. '
    'The Latinist: no remark. The ambiguity reader, with the Portuguese alone: understood it rightly in every place ("Confirmai o que dissestes ao servo", 118:38; "guardei a palavra", 118:67), raised no ambiguity about the word and did not list it as unknown. '
    'The stylist: refused it in ALL SIX places and asked for "palavra" each time — "soa como uma frase citada" (118:38), "um tom de referência a uma expressão ou máxima" (118:41), "livresco" (118:50), "pouco espontâneo na boca de quem suplica" (118:58), "guardar um dito lembra conservar uma frase na memória" (118:67), and in 118:76 "dito ao vosso servo" can be heard as a participle whose noun is missing. His closing judgement names "vosso dito" as the first place where the psalm loses fluency. '
    'My own ear agrees in kind if not in degree: the formula is clear and thin; 118:38 is the weakest. '
    'So: "dito" is understood and is not native. It did not hold with the one reader who judges the ear. It stays in the text because the brief forbids improvising on a ruled word; the ruling is D15\'s to revisit.'
)
for o in el['options']:
    if o['label'] == 'palavras':
        o['note'] += ' DRAFT 5: this is the stylist\'s candidate, asked for six times out of six in 118:33–80. What it costs here: secúndum elóquium tuum (118:41, 58, 76) becomes word for word the same as secúndum verbum tuum (118:25, 65) — the two formulas stand 7 verses apart at 118:58 / 65; and all three "word" terms of the psalm become one (as in Douay-Rheims, Matos Soares and the Greek-less tradition generally).'
    if o['label'] == 'promessas':
        o['note'] += ' DRAFT 5: D15\'s named fall-back. In these six verses it prays well in five (118:38 "Firmai a vossa promessa para o vosso servo", 41, 50, 58, 76) and fails in one: 118:67 "por isso guardei a vossa promessa" — one keeps one\'s own promise, not another\'s. No reader was shown it.'

# --- testimonia: what the ambiguity reader heard this time
byId['testimonia']['options'][0]['note'] += ' DRAFT 5 (118:33–80): less well than in the first portion. The ambiguity reader heard "os vossos testemunhos" FIRST as "demonstrations of God\'s action, accounts of graces received" in all four places (118:36, 46, 59, 79) — at 118:46 "falava nos vossos testemunhos" as "I told of events that showed God at work" — and the right sense second, even with "vossos". Settled by D15 and kept; the main session should know the price is higher than the first portion showed.'

# --- choices
C['118:33'] = C['118:33'].replace('The (He) label', 'Draft 5: "Imponde-me" for draft 4\'s "Ponde-me", which was misheard (decision "legem_pone"). The (He) label')
C['118:37'] = C['118:37'].replace('vanitátem → "a vaidade", as Ps 4:3.', 'vanitátem → "a vaidade", as Ps 4:3 (decision "vanitatem": heard first as conceit).')
C['118:38'] += ' Draft 5: object before the dative, after the stylist (draft 4\'s "Firmai para o vosso servo o vosso dito" delayed the object). The ambiguity reader could not place "no vosso temor" (with the servant, the firming, or the saying); in timóre tuo hangs as loosely in the Latin.'
C['118:43'] = 'ne áuferas → "não tireis" (Aufer → Tirai, 118:22). usquequáque → "de todo" as in 118:8, next to the verb it qualifies. Draft 5: "da minha boca" moved to the head, because the stylist found draft 4\'s "de todo da minha boca" tangled in recitation (order only, D2); he proposed "por completo" at the end, refused so that usquequáque keeps one rendering. The ambiguity reader heard "não tireis de todo" as "in no way" before "not completely", as at 118:8: both are in usquequáque. supersperávi: decision (changed in draft 5).'
C['118:46'] += ' The ambiguity reader heard "não era envergonhado" first as "I felt no shame in speaking", second as "nobody shamed me": both readings of confundébar are alive in the ruled wording, so the option is not needed for clarity.'
C['118:50'] += ' The ambiguity reader heard "humilhação" first as being brought low before others, second as affliction — the two senses of humílitas / ταπείνωσις.'
C['118:51'] = 'Draft 5: decision "v51a" (the stylist\'s construction). a lege tua non declinávi → "da vossa lei não me apartei" (declináre a → apartar-se de); autem → "mas" at the head of the colon, as the first agent did at 118:23.'
C['118:53'] += ' The ambiguity reader heard "desfalecimento" as a physical faint first, loss of heart second, and listed the word as unknown; deféctio is as physical. Kept.'
C['118:54'] += ' The ambiguity reader heard "peregrinação" first as a religious journey — the known price of the cognate.'
C['118:60'] = 'Decision "paratus" (draft 5: the Latinist\'s perfect passive). ut custódiam → "para guardar": same subject, so Portuguese uses the infinitive.'
C['118:62'] += ' Draft 5: the ambiguity reader gave "justificação" three readings (the judgments by which God makes or declares someone just; those that show God is just; those tied to a defence God presents), settled on "God\'s just judgments, with no definite sense for justificação", and listed the word as unknown. That is an honest picture of justificatiónis here. Neither the Latinist nor the stylist remarked on it. Kept.'
C['118:66'] = C['118:66'].replace('disciplína (παιδεία) → "disciplina"; sciéntia (γνῶσις) → "ciência", the cognates, as Matos Soares — "ciência" is heard today first as science; "conhecimento" is the plain alternative, but cognítio / cognóscere will want it (118:75, 79).', 'disciplína (παιδεία) → "disciplina" (heard as keeping rules and self-mastery before instruction or correction; disciplína has the same spread). sciéntia → "o saber" (decision "scientiam", draft 5).')
C['118:70'] = C['118:70'].replace('Coagulátum est sicut lac → "coalhou como leite"', 'Coagulátum est sicut lac → "coalhou-se como leite" (draft 5: the se-form, after the Latinist\'s minor remark that the intransitive lost the Latin passive; his "foi coalhado" implies an agent, and Matos Soares has "coalhou-se")')
C['118:76'] = 'Fiat … ut consolétur me → "Seja … para me consolar" (decision "fiat", changed in draft 5). secúndum elóquium tuum servo tuo → "segundo o vosso dito ao vosso servo": third occurrence of the formula, here with its dative — the stylist heard "dito ao vosso servo" as a participle without its noun (see decision "eloquia").'
C['118:78'] = 'Decision "v78a" (draft 5, the stylist\'s line). injúste iniquitátem: the pleonasm is the Latin\'s and is kept. ego autem → "mas eu".'
C['118:80'] = C['118:80'].replace('Fiat → "Faça-se" (decision "fiat").', 'Fiat → "Seja" (decision "fiat", changed in draft 5).').replace('still 4 over', 'still 5 over')

# --- audit
handoff = next(s for s in data['audit'] if s['step'] == 'handoff')
handoff['note'] = (handoff['note']
                   .replace('supersperávi in → esperei muito em (118:81, 114, 147 next; decision "supersperavi")', 'supersperávi in → pus toda a esperança em (118:81, 114, 147 next; decision "supersperavi" — "esperei muito em" was heard as waiting a long time)')
                   .replace('Fiat … ut → Faça-se … para (118:173 Fiat manus tua ut salvet me)', 'Fiat … ut → Seja … para (118:173 Fiat manus tua ut salvet me; "Faça-se" failed the stylist twice)')
                   + ' AFTER THE READERS (draft 5): elóquium → dito is understood by the blind reader and refused by the stylist six times out of six (he wants "palavra") — it stays in the text under D15; read decision "eloquia" before you write 118:82, 103, 116, 123, and expect the same verdict. sciéntia → o saber. Confundántur → Envergonhem-se (the se-form; 118:78). "testemunhos" was heard first as accounts of God\'s action in all four places of this portion.')
data['audit'] += [
    {
        'step': 'checks',
        'note': 'Draft 4, PARTIAL hard check by ps118/partial.py (unchanged: it already reads whatever verses prayed.json holds): 80 of 176 verses, DO\'s ids in DO\'s order, no gaps (118:81–176 missing, as expected); ids and marks match — one "*" in every verse, nothing else. A first run showed 118:54 opening on a lowercase slot (mended with a capital slot j_Acc), 118:80 at +7 ("para que eu não seja envergonhado" → "para eu não ser envergonhado") and 118:60 at +4. Soft flags in 118:33–80, all accepted: short cola where "preceitos" / "juízos" stand for longer Latin words (118:33 −4, 39 −3, 48b −3, 52 −4, 56 −4, 67 −3, 68 −3, 70 −3); long cola where "mandamentos", "testemunhos", "envergonhado" or a supplied copula stand (118:36 +3, 42 +4, 46b +3, 48a +3, 49 +3, 51 +3, 66b +3, 72 +4, 73b +4, 78 +5, 80b +5). No rhyme inside a verse, no cadence flag (118:44 ends on a proparoxytone, and so does the Latin).'
    },
    {
        'step': 'latinist', 'file': 'critic/v4.latinist.part2.json',
        'note': 'Draft 4, 118:33–80 only (ps118/part2/ built by ps118/part2.py, so that the reader saw 48 verses, not 80). Three remarks — one major, two minor; marks confirmed in all 48 verses. No remark on any law-term, on 118:42 (palavra … palavras), on 118:62 (justificação) or on "dito".',
        'outcomes': [
            {'verse': '118:60', 'remark': 'MAJOR: "e não perturbado" makes a present state of non sum turbátus and loses the perfect passive → "e não fui perturbado"', 'outcome': 'taken', 'decision': 'paratus'},
            {'verse': '118:70', 'remark': 'minor: intransitive "coalhou" for the passive Coagulátum est → "foi coalhado"', 'outcome': 'taken', 'reason': 'Taken as to the fault, with the se-form "coalhou-se" (Matos Soares\'): "foi coalhado" implies an agent the image does not have.'},
            {'verse': '118:44', 'remark': 'minor: in sǽculum sǽculi is singular twice; "pelos séculos dos séculos" is plural → "pelo século do século"', 'outcome': 'option', 'decision': 'saeculum44', 'reason': 'The plural is the glossary\'s formula for the phrase in every psalm; the number carries no sense.'},
        ],
    },
    {
        'step': 'stylist', 'file': 'critic/v4.stylist.part2.json',
        'note': 'Draft 4, 118:33–80 only. Fourteen verses remarked; best line 118:59, worst 118:78. SIX of the fourteen are one remark: "vosso dito" (118:38, 41, 50, 58, 67, 76), each time with "palavra" as the fix, and his closing judgement names it as where the psalm loses fluency. Under the brief the ruled word stays and the verdict is recorded in decision "eloquia". Of the other eight: six taken in whole or in part, two kept as options.',
        'outcomes': [
            {'verse': '118:38', 'remark': 'the interposed dative delays the object; "vosso dito" sounds like a quoted phrase → "Firmai a vossa palavra para o vosso servo"', 'outcome': 'taken', 'decision': 'eloquia', 'reason': 'The order is taken. "palavra" is not: elóquium → dito is D15\'s ruling; his word is the option "palavras" of decision "eloquia".'},
            {'verse': '118:41', 'remark': '"dito" gives the close the tone of a reference to a saying or maxim → "segundo a vossa palavra"', 'outcome': 'option', 'decision': 'eloquia', 'reason': 'D15 rules "dito"; the brief forbids improvising on it. Recorded as the verdict of the test.'},
            {'verse': '118:50', 'remark': '"vosso dito" is bookish → "a vossa palavra me vivificou"', 'outcome': 'option', 'decision': 'eloquia', 'reason': 'As 118:41.'},
            {'verse': '118:58', 'remark': '"dito" is not spontaneous in the mouth of one who begs → "segundo a vossa palavra"', 'outcome': 'option', 'decision': 'eloquia', 'reason': 'As 118:41.'},
            {'verse': '118:67', 'remark': '"guardar um dito" is to keep a phrase in memory → "guardei a vossa palavra"', 'outcome': 'option', 'decision': 'eloquia', 'reason': 'As 118:41.'},
            {'verse': '118:76', 'remark': '"dito ao vosso servo" can be heard as a participle whose noun is missing → "segundo a vossa palavra ao vosso servo"', 'outcome': 'option', 'decision': 'eloquia', 'reason': 'As 118:41.'},
            {'verse': '118:76', 'remark': '"Faça-se a vossa misericórdia" is a hard construction → "Que a vossa misericórdia seja para meu consolo"', 'outcome': 'taken', 'decision': 'fiat', 'reason': 'Fiat → "Seja" is taken; the verb consolétur is kept as a verb ("para me consolar"); his full line is the second option.'},
            {'verse': '118:80', 'remark': '"Faça-se o meu coração imaculado" is assembled on a foreign syntax → "Que o meu coração seja imaculado"', 'outcome': 'taken', 'decision': 'fiat'},
            {'verse': '118:43', 'remark': '"de todo da minha boca" tangles the complements → "… a palavra da verdade por completo"', 'outcome': 'taken', 'reason': 'Mended by order alone ("E da minha boca não tireis de todo …"); "por completo" is refused so that usquequáque keeps its one rendering.'},
            {'verse': '118:51', 'remark': '"agiam de todo iniquamente" is heavy → "agiam com total iniquidade"', 'outcome': 'taken', 'decision': 'v51a', 'reason': 'Taken as "com toda a iniquidade", which keeps the "todo" of usquequáque.'},
            {'verse': '118:60', 'remark': 'the ellipsis "e não perturbado" is heard as a correction → "Estou preparado e não estou perturbado"', 'outcome': 'taken', 'decision': 'paratus', 'reason': 'A full second verb is given, but the Latinist\'s ("não fui perturbado"), whose remark was major.'},
            {'verse': '118:78', 'remark': 'too much breath; "me fizeram iniquidade" is not current syntax → "Envergonhem-se os soberbos, pois injustamente me trataram com iniquidade"', 'outcome': 'taken', 'decision': 'v78a', 'reason': 'Taken but for "pois" (quia is "porque" throughout).'},
            {'verse': '118:44', 'remark': 'the verse ends on a proparoxytone → "pelos séculos dos séculos e para sempre"', 'outcome': 'option', 'decision': 'saeculum44', 'reason': 'It inverts the Latin\'s climb, and the Latin ends on a proparoxytone too (sǽculi).'},
            {'verse': '118:54', 'remark': '"dignos de canto" sounds like a literary judgement → "próprios para o canto"', 'outcome': 'option', 'decision': 'cantabiles', 'reason': 'cantábilis is a judgement (worthy to be sung); "próprios para" says less.'},
            {'verse': '118:63', 'remark': '"ter parte com" asks "part in what?" → "Sou companheiro de"', 'outcome': 'option', 'decision': 'particeps', 'reason': 'The blind reader understood it at once; it is the Latin\'s word taken apart, and "companheiro" is another image.'},
        ],
    },
    {
        'step': 'ambiguity', 'file': 'critic/v4.ambiguity.part2.json',
        'note': 'Draft 4, 118:33–80, Portuguese only. 56 items and 15 "unknown words" (9 distinct: sondarei, vereda, vivificai-me / vivificou, equidade, amplidão, iniquamente / iniquidade, apartei, desfalecimento, justificação — the same severe bar as in the first portion). Three real faults, all mended: supersperáre heard as waiting a long time (118:43, 74), "Ponde-me … o caminho" misparsed (118:33), "ciência" heard as science (118:66). "dito" was understood rightly wherever it stands and is not in the unknown list. The rest is the Latin\'s own openness or was heard rightly first.',
        'outcomes': [
            {'verse': '118:43', 'remark': '"esperei muito nos vossos juízos" heard FIRST as "I waited a long time for God\'s decisions"', 'outcome': 'taken', 'decision': 'supersperavi'},
            {'verse': '118:74', 'remark': '"esperei muito nas vossas palavras" heard FIRST as "I waited a long time for their fulfilment"', 'outcome': 'taken', 'decision': 'supersperavi'},
            {'verse': '118:33', 'remark': '"Ponde-me por lei … o caminho" heard FIRST as "put me on the way of your precepts"', 'outcome': 'taken', 'decision': 'legem_pone'},
            {'verse': '118:66', 'remark': '"a ciência" heard FIRST as scientific knowledge', 'outcome': 'taken', 'decision': 'scientiam'},
            {'verse': '118:37', 'remark': '"a vaidade" heard first as concern with looks, second as empty things', 'outcome': 'option', 'decision': 'vanitatem', 'reason': 'Ps 4:3\'s word and the cognate; the right sense is the word\'s own in church speech.'},
            {'verse': '118:36', 'remark': '"os vossos testemunhos" heard FIRST as demonstrations of God\'s action / accounts of graces, in all four places (118:36, 46, 59, 79)', 'outcome': 'option', 'decision': 'testimonia', 'reason': 'Settled by D15; recorded in the decision because the price is higher here than the first portion showed.'},
            {'verse': '118:38', 'remark': '"Firmai … o vosso dito": confirm / fulfil what you said (first), or fix it in the servant; "no vosso temor" attaches to nothing in particular', 'outcome': 'refused', 'reason': 'The right sense was heard first; in timóre tuo hangs as loosely in the Latin.'},
            {'verse': '118:42', 'remark': '"com uma palavra": answer with a word (first), or those who affront me with a word', 'outcome': 'option', 'decision': 'v42a', 'reason': 'Exactly the two constructions of verbum that the wording was chosen to keep.'},
            {'verse': '118:46', 'remark': '"não era envergonhado": I felt no shame (first), or nobody shamed me', 'outcome': 'option', 'decision': 'confundebar', 'reason': 'Both readings of confundébar are heard in the ruled wording.'},
            {'verse': '118:50', 'remark': '"Isto": the word and hope named before, or what follows', 'outcome': 'option', 'decision': 'haec', 'reason': 'The openness of Hæc.'},
            {'verse': '118:52', 'remark': '"desde sempre": I always remembered (first), or judgments from of old', 'outcome': 'option', 'decision': 'a_saeculo', 'reason': 'a sǽculo hangs on either word in the Latin.'},
            {'verse': '118:56', 'remark': '"Isto me aconteceu": what was just said, or an unnamed benefit', 'outcome': 'option', 'decision': 'facta_est', 'reason': 'As undetermined as Hæc facta est mihi.'},
            {'verse': '118:57', 'remark': '"A minha porção, Senhor, eu disse: guardar a vossa lei": keeping the law is my portion (first), or the Lord is my portion', 'outcome': 'option', 'decision': 'portio', 'reason': 'Both readings of the Latin were heard, which is what the verbless line was for.'},
            {'verse': '118:62', 'remark': '"os juízos da vossa justificação": three readings, none settled; "justificação" unknown', 'outcome': 'option', 'decision': 'justificationis', 'reason': 'A fair picture of justificatiónis in this verse; "da vossa justiça" is the option.'},
            {'verse': '118:63', 'remark': '"tenho parte com todos": belong to the same group (first), or share an inheritance with them', 'outcome': 'option', 'decision': 'particeps', 'reason': 'Heard rightly.'},
            {'verse': '118:53', 'remark': '"O desfalecimento me tomou": a physical faint (first), or loss of heart; word unknown', 'outcome': 'option', 'decision': 'defectio', 'reason': 'deféctio is as physical; "desânimo" is the option.'},
            {'verse': '118:54', 'remark': '"peregrinação": a religious journey (first), a provisional dwelling, earthly life', 'outcome': 'refused', 'reason': 'The cognate\'s known price; Douay-Rheims and Matos Soares pay it too.'},
            {'verse': '118:34', 'remark': '"guardar" obey / keep in memory (118:34, 44, 55); "juízos" sentences / criteria (118:39, 52); "salvação" (118:41); "esperei nas vossas palavras" trusted (first) / waited (118:42); "não tireis de todo" (118:43); "amplidão" (118:45); "levantei as minhas mãos para" (118:48); "me exercitava / exercitarei" practise / study (118:48, 78); "humilhação", "humilhado", "humilhastes" (118:50, 67, 71, 75); "Supliquei a vossa face" (118:58); "caminhos" (118:59); "perturbado" (118:60); "cordas" (118:61); "temem" fear / revere (118:38, 63, 74, 79); "disciplina" (118:66); "por isso guardei" (118:67); "multiplicou-se sobre mim" (118:69); "coalhou como leite" (118:70); "milhares de ouro" (118:72); "na vossa verdade" (118:75); "viverei" (118:77); "Sejam envergonhados" feel shame (first) / be shamed (118:78); "Voltem-se para mim" (118:79); "não ser envergonhado" (118:80)', 'outcome': 'refused', 'reason': 'The Latin is open in the same way, or the right sense was the one heard first; nothing changed.'},
        ],
    },
    {
        'step': 'revision', 'version': 5,
        'note': 'v5 (script: ps118/revise_v5.py; draft 4 is prayed.v4.json, flat text prayed.v4.vos.json). 118:1–32 untouched. Wording changed in eleven verses: 118:33 (Imponde-me por lei), 118:38 (Firmai o vosso dito para o vosso servo), 118:43 (E da minha boca não tireis de todo … porque pus toda a esperança nos vossos juízos), 118:51 (agiam com toda a iniquidade), 118:60 (e não fui perturbado), 118:66 (o saber), 118:70 (coalhou-se), 118:74 (pus toda a esperança nas vossas palavras), 118:76 and 118:80 (Seja …), 118:78 (Envergonhem-se os soberbos, porque injustamente me trataram com iniquidade). The law-term set is unchanged. "dito" stands against the stylist, six times over, by the brief\'s instruction; the verdict is in decision "eloquia".'
    },
]
data['version'] = 5
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('prayed.json → version 5,', len(data['decisions']), 'decisions')
