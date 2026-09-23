"""Build ps225/prayed.json draft 2 from prayed.v1.json and the v1 readers (critic/v1.*.json).
python3.13 research/psalterium/ps225/build_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
p['version'] = 2
v = p['verses']
dec = {d['id']: d for d in p['decisions']}


def front(d, label):
    """Make the option with this label the ruling (option 0)."""
    opts = dec[d]['options']
    i = next(i for i, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(i))


# 3:5b stetit: Deteve-se (the stylist's pés / pé echo; the 1:1 row; the same verb as 3:11 stetérunt)
front('stetit', 'Deteve-se')
dec['stetit']['options'][0]['note'] = "Draft 2. The 1:1 row, and the same verb as 3:11 *stetérunt → detiveram-se*, so the canticle's two *stare* are one word. The v1 stylist heard *pés. * Pôs-se de pé* as a pun the Latin does not make."
dec['stetit']['why'] += " **Draft 2:** *Deteve-se*. The v1 stylist heard *diante dos seus pés. * Pôs-se de pé* as an echo the Latin does not have (*pedes … Stetit*), and asked *Parou* (MS1932). *Deter-se* is the glossary's row for stopping (1:1) and gives the canticle one verb for *stare*, with 3:11. DRB 'He stood and measured'."

# 3:6b saeculi: dos séculos (both the stylist and the ambiguity reader heard *seculares* as 'lay')
dec['saeculi']['options'].insert(0, {'label': 'dos séculos', 'forms': {'saeculi': 'dos séculos'}, 'note': "Draft 2; the v1 stylist. The Latin's genitive and its noun, as *in sǽculum sǽculi → pelos séculos dos séculos*.", 'from': 'stylist'})
dec['saeculi']['options'][1]['note'] = 'Draft 1; MS1932. The v1 stylist and the ambiguity reader both heard *seculares* as "lay, worldly" (*clero secular*).'
dec['saeculi']['why'] += " **Draft 2:** *os montes dos séculos*. The v1 stylist and the ambiguity reader both heard *seculares* as 'lay'. *Dos séculos* keeps the Latin's genitive and its noun; the psalter says *séculos* for *sǽcula* throughout."

# 3:8b ascendes super: montar is transitive; super is in the verb
dec['ascendes'] = {
    'id': 'ascendes', 'refs': ['3:8b'], 'latin': 'Qui ascéndes super equos tuos', 'kind': 'grammar',
    'why': "*Ascéndere equos → montar cavalos* (75:7). Here the Latin adds *super*. The v1 stylist heard *montar sobre os cavalos* as a calque: in Portuguese one *monta o cavalo*, and the verb carries 'on'. **Draft 2** drops *sobre*. The relative has no antecedent in the Latin (it hangs on 3:8a's *Dómine*); *Vós que* names it.",
    'options': [
        {'label': 'Vós que montareis os vossos cavalos', 'forms': {'ascendes': 'Vós que montareis os vossos cavalos'}, 'note': 'Draft 2; the v1 stylist. *Montar* carries *super*.', 'from': 'stylist'},
        {'label': 'Vós que montareis sobre os vossos cavalos', 'forms': {'ascendes': 'Vós que montareis sobre os vossos cavalos'}, 'note': 'Draft 1. Every Latin word, as a calque.', 'from': 'draft'},
        {'label': 'Vós que subireis sobre os vossos cavalos', 'forms': {'ascendes': 'Vós que subireis sobre os vossos cavalos'}, 'note': '*Ascéndere*’s root verb; keeps *super*; leaves the 75:7 row.', 'from': 'draft'},
    ],
}
v['3:8b'] = '{ascendes}: * e {quadrigae} são salvação.'
dec['quadrigae']['why'] = dec['quadrigae']['why'].replace(" *Qui ascéndes* is future: *montareis*; *ascéndere equos → montar* is 75:7's row, and *super* is kept as *sobre*.", " *Qui ascéndes* is future: *montareis* (see `ascendes`).")
dec['stetit']['options'][1]['note'] = 'Draft 1; 81:1, 105:30. The v1 stylist heard it as a pun on *pés*.'
p['decisions'].insert(p['decisions'].index(dec['quadrigae']), dec['ascendes'])

# 3:14b sicut: era como a (the stylist and the ambiguity reader both heard a fragment)
front('sicut', 'era como a')
dec['sicut']['options'][0]['note'] = "Draft 2; DRB 'was', MS1932 *estavam*. The past: the enemies of 3:14a *vinham*."
dec['sicut']['options'][1]['note'] = 'Draft 1; verbless, as the Latin. Heard as a fragment by the v1 stylist and the ambiguity reader.'
dec['sicut']['why'] += " **Draft 2:** *era como a*. The v1 stylist and the ambiguity reader both heard the verbless line as unfinished. Rule 2 yields to the ear on grammar, and a supplied copula is grammar. *Era* matches 3:14a's *vinham*, as DRB and MS1932."

# 3:16b ingrediatur: the subject before the verb, so *entre* is not heard as the preposition
dec['ingrediatur'] = {
    'id': 'ingrediatur', 'refs': ['3:16b'], 'latin': 'Ingrediátur putrédo in óssibus meis', 'kind': 'order',
    'why': "The Latin puts the jussive verb first. Draft 1 kept it (*Que entre a podridão*), but *entre* at the head of the line is heard first as the preposition 'between', as the v1 stylist and the ambiguity reader both said. **Draft 2** puts the subject first (D2: order yields to the ear). *Que … que* still carries the jussive.",
    'options': [
        {'label': 'Que a podridão entre nos meus ossos', 'forms': {'ingrediatur': 'Que a podridão entre nos meus ossos'}, 'note': 'Draft 2; the v1 stylist.', 'from': 'stylist'},
        {'label': 'Que entre a podridão nos meus ossos', 'forms': {'ingrediatur': 'Que entre a podridão nos meus ossos'}, 'note': "Draft 1; the Latin's order. *entre* heard as 'between'.", 'from': 'draft'},
        {'label': 'Que a podridão penetre nos meus ossos', 'forms': {'ingrediatur': 'Que a podridão penetre nos meus ossos'}, 'note': 'No homograph at all; *penetrar* is stronger than *ingrédi*.', 'from': 'draft'},
    ],
}
v['3:16b'] = '{ingrediatur}, * e que {scateat} debaixo de mim.'
p['decisions'].insert(p['decisions'].index(dec['scateat']), dec['ingrediatur'])

# 3:19b canentem: em salmos (the stylist: *cantar com salmos* is not said)
for o in dec['canentem']['options']:
    if o['label'].startswith('ele, vencedor, me guiará, * a mim'):
        o['label'] = 'ele, vencedor, me guiará, * a mim, que canto em salmos'
        o['forms']['canentem'] = 'a mim, que canto em salmos'
        o['note'] = "Draft 2. *In psalmis → em salmos*: the Latin's preposition. The v1 stylist heard *cantar com salmos* as not said; 94:2's *com salmos* rides *aclamar*, not *cantar*."
dec['canentem']['options'].insert(1, {'label': 'ele, vencedor, me guiará, * a mim, que canto com salmos', 'forms': {'victor': 'ele, vencedor, me guiará,', 'canentem': 'a mim, que canto com salmos'}, 'note': 'Draft 1; 94:2 *in psalmis → com salmos*.', 'from': 'draft'})
dec['canentem']['why'] += " **Draft 2:** *que canto em salmos*. The v1 stylist asked it, and also asked to drop *ele* so the first colon runs in one breath; *ele* is kept, because without it *vencedor* can be heard of the singer (the ambiguity reader, with *ele*, heard God as the victor)."

latin_outcomes = [
    {'verse': '3:19a', 'remark': 'cervórum is masculine (stags); corças follows the Hebrew hinds; asks dos cervos', 'outcome': 'refused', 'reason': "The glossary row *cervus*: 17:34 has the same phrase (*pedes meos tamquam cervórum*) and chose *das corças* because the blind reader heard *cervos* as *servos*. 28:9 held *corças* against a Latinist major. The feminine is the cost, recorded in the row; *dos cervos* stays an option in `ponet`. The stylist raised the same point."},
    {'verse': '3:10b', 'remark': 'fez ouvir paraphrases dedit; asks deu a sua voz', 'outcome': 'refused', 'reason': "The glossary row *vocem dare → fazer ouvir a voz* (17:14, 45:7, 76:18), where *deu a sua voz* was refused before: it is not said in Portuguese. He calls the draft defensible."},
]
style_outcomes = [
    {'verse': '3:2a', 'remark': 'notícia is a newspaper word; eu adds a syllable; asks ouvi o vosso anúncio', 'outcome': 'refused', 'reason': "*Audítio → notícia* is the glossary's row (111:7a), and it keeps *tuam* open between a report from God and a report about him. *Anúncio* is no less a newspaper word in Brazil (the classifieds) and leans to God as the speaker. *Eu* stays: *Senhor, ouvi* after a vocative is the *vós* imperative 'Lord, hear' (decision `ouvi`); the CNBB LH has *Eu ouvi* too. Options kept in `auditio`."},
    {'verse': '3:2b', 'remark': 'vivificai-a stumbles (vi-vi-fi-cai-a); asks dai-lhe vida', 'outcome': 'option', 'decision': 'vivifica', 'reason': "The glossary row *vivificáre → vivificar* (Ps 118 nine times, 40:3, 70:20). *Dai-lhe vida* is the row's own option and stays there. The row's verb is kept for the concord; the ambiguity reader did not stop at it."},
    {'verse': '3:5b', 'remark': 'pés. * Pôs-se de pé: a pun the Latin lacks; asks Parou', 'outcome': 'taken', 'reason': "*Deteve-se* (not *Parou*): the 1:1 row, and one verb with 3:11 *detiveram-se*. Decision `stetit`."},
    {'verse': '3:6b', 'remark': 'seculares heard as lay; asks os montes dos séculos', 'outcome': 'taken', 'reason': 'Decision `saeculi`. The ambiguity reader heard the same.'},
    {'verse': '3:6c', 'remark': 'the analytic passive is stiff; asks Curvaram-se', 'outcome': 'refused', 'reason': "With the reflexive, *pelos caminhos* is heard as 'along the roads'; the passive keeps it as the agent, which is what *ab* with *incurváti sunt* says. The ambiguity reader, even with the passive, found the phrase unclear, so the reflexive would cost more. Option in `incurvati`."},
    {'verse': '3:8b', 'remark': 'montar sobre is a calque; asks montareis os vossos cavalos', 'outcome': 'taken', 'reason': 'New decision `ascendes`.'},
    {'verse': '3:11', 'remark': 'irão arrives with no subject; asks hão de ir', 'outcome': 'refused', 'reason': "The Latin's *ibunt* has no expressed subject either, and it is open (the sun and moon, or others). *Hão de ir* lengthens the Latin's longest colon and still names no subject. Held; the ambiguity reader found the same openness the Latin has."},
    {'verse': '3:14b', 'remark': 'verbless comparison sounds like a fragment; asks era como a', 'outcome': 'taken', 'reason': 'Decision `sicut`. The ambiguity reader heard the same.'},
    {'verse': '3:16b', 'remark': 'Que entre heard as the preposition; asks Que a podridão entre', 'outcome': 'taken', 'reason': 'New decision `ingrediatur`. The draft\'s own worry, confirmed by the ambiguity reader.'},
    {'verse': '3:17c', 'remark': 'cortado sounds like slicing; asks arrancado', 'outcome': 'refused', 'reason': "*Abscíndere → cortar* (76:9). *Arrancar* is the glossary's verb for erípere / éruere / evéllere, so it would merge a fourth Latin verb into it. The ambiguity reader heard 'taken from the fold' first, the sense intended."},
    {'verse': '3:19a', 'remark': 'cervórum is masculine; asks dos cervos', 'outcome': 'refused', 'reason': 'As the Latinist\'s remark: the glossary row *cervus* (17:34, 28:9). Option in `ponet`.'},
    {'verse': '3:19b', 'remark': 'first colon chopped by commas; canto com salmos unidiomatic; asks alturas, vencedor, me guiará * a mim, que canto em salmos', 'outcome': 'taken', 'reason': "Half: *em salmos* taken (decision `canentem`). *Ele* kept, so *vencedor* is not heard of the singer; the ambiguity reader, with *ele*, heard God as the victor."},
]
amb_outcomes = [
    {'verse': '3:14b', 'remark': 'no verb heard; sounds incomplete', 'outcome': 'taken', 'reason': '*era como a*; decision `sicut`.'},
    {'verse': '3:16b', 'remark': "entre easily heard as 'between'", 'outcome': 'taken', 'reason': 'Decision `ingrediatur`.'},
    {'verse': '3:6b', 'remark': "seculares heard as 'worldly'", 'outcome': 'taken', 'reason': 'Decision `saeculi`: *dos séculos*.'},
    {'verse': '3:5b', 'remark': 'the nearest subject of Pôs-se de pé is the devil', 'outcome': 'refused', 'reason': "The Latin's *Stetit* has the same nearest subject; context (he *mediu a terra*, *Olhou*) gives it to God, and the reader took God. Now *Deteve-se* (the stylist)."},
    {'verse': '3:2a', 'remark': "notícia heard as a message from God, or as everyday news", 'outcome': 'refused', 'reason': 'Heard within the openness the Latin has; see the stylist\'s remark and decision `auditio`.'},
    {'verse': '3:4a', 'remark': 'chifres heard as literal horns, which puzzles', 'outcome': 'refused', 'reason': "The Latin's image (decision `cornua`; rule 5). *Raios* stays an option."},
    {'verse': '3:7', 'remark': 'whose iniquity is unclear; peles not heard as tents', 'outcome': 'refused', 'reason': "Both are the Latin's own openness (decisions `pro_iniquitate`, `pelles`); the options that decide are recorded."},
    {'verse': '3:9a', 'remark': "the oaths' link to the bow is lost", 'outcome': 'refused', 'reason': "The Latin's juxtaposition, a crux in Jerome's text too (DRB 'according to the oaths' supplies). Not closed."},
    {'verse': '3:13b', 'remark': 'fundamento … até o pescoço mixes building and body', 'outcome': 'refused', 'reason': "Jerome's own mixture (*usque ad collum*); kept (decision `denudasti`)."},
    {'verse': '3:17b', 'remark': 'Mentirá a obra da oliveira: failure only guessed', 'outcome': 'refused', 'reason': "The Latin's image (*mentiétur*), and the line after (*os campos não trarão alimento*) gives the sense. Options in `opus`."},
    {'verse': '3:18', 'remark': 'meu Jesus heard as Jesus Christ', 'outcome': 'refused', 'reason': "Jerome's *Jesu*, and the Church's reading of it; decision `jesu`."},
    {'verse': 'unknown words', 'remark': 'Farã, Madiã, quadrigas, proferistes, fulgurante, bramido, fervilhe, cingido, aprisco, corças', 'outcome': 'refused', 'reason': "The names are the Bible's. *Bramido*, *cingido*, *corças* are glossary words (frémere, accínctus 64:7, cervus 17:34). *Quadrigas* is the Latin's specific word; *carros* stays an option in `quadrigae`. *Proferistes*, *fulgurante*, *fervilhe*, *aprisco* are plain dictionary words chosen for exactness; each has its option recorded. Noted for Gustavo."},
]
p['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'Reader: claude-opus-5-5, fresh context, with latin.json. Two minors, no majors; the pointing is correct. He calls the draft faithful and close, and names the Latin oddities it keeps (diabolus, Christo tuo, Jesu meo, pelles, mentietur opus olivae).', 'outcomes': latin_outcomes},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'Reader: claude-opus-5-5, fresh context, with latin.json. 12 remarks: 5 taken (one in half), 1 kept as an option, 6 refused (four against glossary rows). Worst line 3:19b, best 3:18.', 'outcomes': style_outcomes},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'Reader: claude-opus-5-5, fresh context. About 60 readings, most as intended or within the Latin\'s own openness. Unknown words: Farã, Madiã, quadrigas, proferistes, fulgurante, bramido, fervilhe, cingido, aprisco, corças.', 'outcomes': amb_outcomes},
    {'step': 'revision', 'version': 2, 'note': 'v2: 3:5b *Deteve-se* (the stylist\'s pés / pé echo); 3:6b *os montes dos séculos* (stylist and ambiguity reader); 3:8b *Vós que montareis os vossos cavalos* (stylist); 3:14b *era como a* (stylist and ambiguity reader); 3:16b *Que a podridão entre nos meus ossos* (stylist and ambiguity reader); 3:19b *a mim, que canto em salmos* (stylist). Held: *corças* (glossary row, 17:34), *fez ouvir a sua voz* (row), *notícia*, *vivificai-a*, the passive in 3:6c, *cortado*. The draft is kept as prayed.v1.json.'},
]
(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
