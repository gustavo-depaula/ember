"""Revise ps105/prayed.json v1 -> v2 after the three readers. Run once."""
import json
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
assert d['version'] == 1
V = d['verses']

V['105:2'] = 'Quem falará das potências do Senhor, * quem fará ouvir todos os seus louvores?'
V['105:8'] = 'E os salvou por causa do seu nome: * para fazer conhecer a sua potência.'
V['105:9'] = 'E repreendeu o Mar Vermelho, e ficou seco, * e os guiou pelos abismos como pelo deserto.'
V['105:10'] = 'E os salvou da mão dos que os odiavam: * e os resgatou da mão do inimigo.'
V['105:13'] = '{cito}: esqueceram-se das suas obras: * e não esperaram pelo seu desígnio.'
V['105:18'] = 'E um fogo se inflamou na congregação deles, * a chama queimou os pecadores.'
V['105:24'] = 'Para desviar a sua ira, para que não os exterminasse: * e tiveram em nada a terra desejável:'
V['105:29'] = 'E o provocaram com as suas invenções: * e se multiplicou entre eles a ruína.'
V['105:30'] = '{stetit}, e aplacou: * e cessou {quassatio}.'
V['105:31'] = 'E lhe foi contado como justiça: * de geração em geração para todo o sempre.'
V['105:32'] = 'E o provocaram {aquas}: * e Moisés foi maltratado por causa deles: porque {exacerbaverunt} o seu espírito.'
V['105:33'] = '{distinxit}. * Não exterminaram as nações {quas}.'
V['105:35'] = 'E se misturaram entre as nações, e aprenderam as obras delas: e serviram às imagens esculpidas delas: * e isso se tornou para eles um tropeço.'
V['105:39'] = 'E a terra foi {infecta} de sangue, e foi contaminada pelas obras deles: * e se prostituíram nas suas invenções.'
V['105:40'] = 'E o Senhor se irou com furor contra o seu povo: * e abominou a sua herança.'
V['105:41'] = 'E os entregou nas mãos das nações: * e os dominaram aqueles que os odiavam.'
V['105:42'] = 'E os inimigos deles os atribularam, e foram humilhados sob as mãos deles: * muitas vezes os livrou.'
V['105:43'] = 'Eles, porém, o provocaram com o seu desígnio: * e foram humilhados nas suas iniquidades.'
V['105:45'] = 'E se lembrou da sua aliança: * e {poenituit} segundo a multidão da sua misericórdia.'
V['105:46'] = '{dedit} * diante de todos os que {ceperant}.'

dec = {x['id']: x for x in d['decisions']}


def reorder(id_, first_label, why_add=None, new=None):
    x = dec[id_]
    if new:
        x['options'].insert(0, new)
    opts = x['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == first_label)
    opts.insert(0, opts.pop(i))
    if why_add:
        x['why'] += ' ' + why_add


# 105:5 — the Latinist: keep 'in'
reorder('videndum', 'Para vermos na bondade',
        "v2: the Latinist (minor) asked the preposition back — 'to see in the goodness', the Hebraism for enjoying it, parallel to 'ad lætándum in lætítia' → 'na alegria'; with the parallel colon beside it the ear resolves it, and the ambiguity reader heard 'a bondade' as the chosen ones' virtue. Taken.")
for o in dec['videndum']['options']:
    if o['label'] == 'Para vermos na bondade':
        o['note'] = "v2 — the Latinist; parallel to 'na alegria'"
        o['from'] = 'latinist'
    if o['label'] == 'Para vermos a bondade':
        o['note'] = "v1 draft — DRB's build; heard as the chosen ones' virtue"

# 105:13 — colon from the stylist; Latinist's 'agiram' as option
dec['cito']['why'] += " v2: the Latinist (minor) faulted 'o' as an added object and asked 'Depressa agiram' — refused: agir is ágere's verb in 105:6 ('agimos injustamente'), and Portuguese 'fazer' needs an object, which rule 2 lets us supply; the stylist's colon makes 'o' point forward to the forgetting (the ambiguity reader could not place it). Option."
dec['cito']['options'].append({'label': 'Depressa agiram', 'forms': {'cito': 'Depressa agiram'}, 'note': "the Latinist; ágere's verb (105:6)", 'from': 'latinist'})

# 105:30 — names
dec['stetit']['options'][0]['forms']['stetit'] = 'E Finéas se pôs de pé'
dec['stetit']['options'][0]['label'] = 'E Finéas se pôs de pé'
dec['stetit']['options'][1]['forms']['stetit'] = 'E Fineias se pôs de pé'
dec['stetit']['options'][1]['label'] = 'E Fineias se pôs de pé'
dec['stetit']['why'] += " v2: proclisis (see 105:8). The stylist asked 'E levantou-se Fineias': the current spelling is an option (59:9's rule keeps MS1932's forms; the ambiguity reader did not know the name, as expected for names); 'levantar-se' would break the echo with 105:23. The stylist's form added as an option."
dec['stetit']['options'].append({'label': 'E levantou-se Fineias', 'forms': {'stetit': 'E levantou-se Fineias'}, 'note': "the stylist; another verb than 105:23's", 'from': 'stylist'})

# 105:32 vexatus
dec_v = {'id': 'vexatus', 'refs': ['105:32'], 'latin': 'et vexátus est Móyses propter eos', 'kind': 'glossary',
         'why': "vexáre → maltratar (the 93:5 row names 105:32). v2: the Latinist (minor) said 'maltratado' implies a mistreating agent and asked 'afligido' — refused, afflígere's word; the row holds. MS1932 'foi castigado' names God as agent. Option.",
         'options': [
             {'label': 'foi maltratado', 'forms': {}, 'note': 'draft — the row (93:5)', 'from': 'draft'},
             {'label': 'foi afligido', 'forms': {}, 'note': "the Latinist; afflígere's word", 'from': 'latinist'},
             {'label': 'foi castigado', 'forms': {}, 'note': 'MS1932; names an agent', 'from': 'MS1932'}]}
d['decisions'].append(dec_v)

# 105:33 distinxit
dec['distinxit']['why'] += " v2: the Latinist (minor) asked 'proferiu distintamente' for the note of distinct utterance — refused: the 65:13 row (the same Greek) has 'pronunciou', whose root is already 'utter clearly'; option. The ambiguity reader heard the next colon as what was pronounced: the colon punctuation replaced by a full stop (the Latin verse joins Greek 33 and 34, two sentences)."
dec['distinxit']['options'].insert(2, {'label': 'E proferiu distintamente com os seus lábios', 'forms': {'distinxit': 'E proferiu distintamente com os seus lábios'}, 'note': 'the Latinist; longer, adds an adverb', 'from': 'latinist'})

# 105:39 infecta: Latinist's plural refused
dec['infecta']['why'] += " v2: the Latinist (minor) asked the plural 'com sangues' — refused: D29 settled the singular for sanguínes (the row cites 105:39)."

# 105:46 dedit — ambiguity reader heard the opposite sense
x = dec['dedit']
x['why'] += " v2: the ambiguity reader heard 'deu-os às misericórdias diante de … os que os tinham capturado' as 'gave them over to the mercy of their captors' — the opposite of the Latin (made them objects of pity). A literal wording heard in reverse fails rule 2's purpose; 'fez que achassem misericórdia' keeps the noun and the captors, and says who is pitied. The singular, as the Portuguese idiom 'achar misericórdia'."
reorder('dedit', 'E fez que achassem misericórdia')
x['options'][0]['forms']['dedit'] = 'E fez que achassem misericórdia'
x['options'][0]['note'] = 'v2 — the literal build was heard as its opposite (ambiguity reader)'
x['options'][0]['from'] = 'draft'
x['options'][0].pop('warn', None)
for o in x['options'][1:]:
    if o['label'] == 'E deu-os às misericórdias':
        o['note'] = "v1 draft — word for word; heard as 'at the captors' mercy'"
        o['warn'] = True

# new decision: proclisis
d['decisions'].append({
    'id': 'proclisis', 'refs': ['105:8', '105:9', '105:10', '105:18', '105:29', '105:31', '105:32', '105:35', '105:39', '105:40', '105:41', '105:42', '105:43', '105:45'],
    'latin': '(Portuguese clitic placement)', 'kind': 'order',
    'why': "v1 had European enclisis after 'E' throughout the narrative (salvou-os, provocaram-no, dominaram-nos). The stylist: in vv. 41–42 'dominaram-nos', 'atribularam-nos' are heard as 'us' in a psalm that alternates we and they; '-no' blurs into '-nos' in choir (29, 32, 43). Proclisis is current Brazilian usage after 'E' and after a subject (Ps 104:37 'E os tirou'). Taken psalm-wide; sentence-initial verbs keep enclisis ('Abriu-se a terra', 'Esqueceram-se', imperatives).",
    'options': [
        {'label': 'proclisis after E / subject', 'forms': {}, 'note': 'v2 — the stylist', 'from': 'stylist'},
        {'label': 'enclisis (v1)', 'forms': {}, 'note': "v1; 'dominaram-nos' heard as 'us'", 'warn': True}]})

# new decision: pro nihilo habere
d['decisions'].append({
    'id': 'pro_nihilo', 'refs': ['105:24'], 'latin': 'et pro níhilo habuérunt terram desiderábilem', 'kind': 'glossary',
    'why': "pro níhilo habére is 'to count as nothing, despise' (the Greek ἐξουδένωσαν). v1 'tiveram por nada' followed the D44 row pro níhilo → por nada (55:8, another sense: 'for nothing'), and the ambiguity reader heard exactly that ('they got the land for nothing'). 'ter em nada' is the Portuguese idiom for despising (the stylist). Taken; D44 stands for 55:8, where pro níhilo is adverbial, not the object's value.",
    'options': [
        {'label': 'tiveram em nada', 'forms': {}, 'note': 'v2 — the stylist; the idiom', 'from': 'stylist'},
        {'label': 'tiveram por nada', 'forms': {}, 'note': "v1 — D44's words; heard as 'for free'", 'warn': True},
        {'label': 'desprezaram', 'forms': {}, 'note': 'MS1932-like sense; drops the Latin build'}]})

# new decision: reputatum
d['decisions'].append({
    'id': 'reputatum', 'refs': ['105:31'], 'latin': 'Et reputátum est ei in justítiam', 'kind': 'word',
    'why': "v1 borrowed imputáre's 'atribuir' (31:2, the same Greek λογίζομαι). But reputáre is another Latin verb (L&S 'to reckon, count'), so it may keep its own word; the stylist asked 'contado como justiça', the phrase Portuguese ears know from Gen 15:6 and Rom 4. Taken, without the stylist's added 'isto' (the Latin is impersonal).",
    'options': [
        {'label': 'contado', 'forms': {}, 'note': 'v2 — the stylist, without "isto"', 'from': 'stylist'},
        {'label': 'atribuído', 'forms': {}, 'note': "v1 — imputáre's word (31:2)"},
        {'label': 'imputado', 'forms': {}, 'note': 'MS1932; juridical', 'from': 'MS1932'}]})

C = d['choices']
C['105:2'] = "poténtia → potência (row; 70:19). v2: 'quem' repeated in the second colon (the stylist: the ear loses the subject); the Latin's one 'quis' governs both — a pronoun Portuguese needs, not an addition of sense. The ambiguity reader heard 'potências' vaguely: kept, the row."
C['105:8'] = C['105:8'] + " v2: 'fazer conhecer' kept against the stylist's 'dar a conhecer' — the 97:2 row, whose stylist asked the same and was refused for the cross-psalm repetition (rule 6)."
C['105:9'] = "increpáre → repreender (row); dedúcere → guiar (D22). v2: 'e ficou seco' for exsiccátum est (the stylist; the passive's state, no pronoun for the sea)."
C['105:14'] = C['105:14'] + " v2: the stylist asked 'na terra sem água' — refused, Ps 77's formula (rule 6)."
C['105:15'] = C['105:15'] + " v2: the stylist asked 'o seu pedido' — refused: petítio → petição (36:4), and 'o seu' would be heard as God's."
C['105:18'] = "synagóga → congregação (the row names 105:17–18: the Greek has συναγωγή in both). exardéscere → inflamar-se, built as 38:4 'um fogo se inflamará'. v2: the stylist asked 'acendeu-se … assembleia' — refused, the rows (assembleia would open a third collision); proclisis taken."
C['105:21'] = C['105:21'] + " v2: the stylist asked 'grandes obras … prodígios terríveis' — refused: magnália → grandes coisas (70:19 row), ópera → obras, prodígia → prodígios; option noted here."
C['105:35'] = C['105:35'] + " v2: the stylist asked 'às suas imagens esculpidas' to lighten the second 'delas' — refused: 'suas' would give Israel the idols the Latin's eórum gives the nations."
C['105:41'] = "trádere → entregar; dominári → dominar. v2: proclisis and 'aqueles que' (the stylist, worst line): 'dominaram-nos' was heard as 'us'."
C['105:42'] = C['105:42'] + " v2: subject first and proclisis (the stylist): 'atribularam-nos' was heard as 'us'."

d['version'] = 2
d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. No major; five minors: one taken, four refused as options.',
     'outcomes': [
         {'verse': '105:5', 'remark': "'in bonitáte' dropped", 'outcome': 'taken', 'decision': 'videndum'},
         {'verse': '105:13', 'remark': "'o' adds an object; 'Depressa agiram'", 'outcome': 'option', 'decision': 'cito', 'reason': "agir is ágere's (105:6); fazer needs its object; the colon makes it point forward."},
         {'verse': '105:32', 'remark': "'maltratado' implies an agent; 'afligido'", 'outcome': 'option', 'decision': 'vexatus', 'reason': "vexáre → maltratar row (93:5); afligir is afflígere's."},
         {'verse': '105:33', 'remark': "'pronunciou' weak; 'proferiu distintamente'", 'outcome': 'option', 'decision': 'distinxit', 'reason': '65:13 row, the same Greek.'},
         {'verse': '105:39', 'remark': "plural 'sangues'", 'outcome': 'refused', 'decision': 'infecta', 'reason': 'D29 settled the singular.'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Sixteen remarks; worst line 105:41, best 105:47b. Proclisis taken psalm-wide (decision proclisis); 105:2, 9, 13, 24, 31, 41, 42, 43 taken; 105:8 fazer conhecer, 14, 15, 18, 21, 30 name, 35 refused for glossary rows or rule 6.',
     'outcomes': [
         {'verse': '105:2', 'remark': "repeat 'quem'", 'outcome': 'taken'},
         {'verse': '105:8', 'remark': "proclisis; 'dar a conhecer'", 'outcome': 'taken in part', 'reason': "proclisis taken; 'fazer conhecer' is the 97:2 row (rule 6)."},
         {'verse': '105:9', 'remark': "'e ficou seco', proclisis", 'outcome': 'taken'},
         {'verse': '105:10', 'remark': 'proclisis', 'outcome': 'taken', 'decision': 'proclisis'},
         {'verse': '105:13', 'remark': "colon after 'Depressa o fizeram'", 'outcome': 'taken', 'decision': 'cito'},
         {'verse': '105:14', 'remark': "'na terra sem água'", 'outcome': 'refused', 'reason': "Ps 77's formula 'no lugar sem água'."},
         {'verse': '105:15', 'remark': "'o seu pedido'", 'outcome': 'refused', 'reason': 'petítio → petição (36:4); "o seu" heard as God\'s.'},
         {'verse': '105:18', 'remark': "'acendeu-se … assembleia'", 'outcome': 'refused', 'reason': 'exardéscere and synagóga rows; proclisis taken.'},
         {'verse': '105:21', 'remark': "'coisas' twice; 'grandes obras … prodígios'", 'outcome': 'refused', 'reason': 'magnália row (70:19); obras and prodígios belong to other Latin words.'},
         {'verse': '105:24', 'remark': "'ter em nada' is the idiom", 'outcome': 'taken', 'decision': 'pro_nihilo'},
         {'verse': '105:30', 'remark': "'E levantou-se Fineias'", 'outcome': 'option', 'decision': 'stetit', 'reason': "59:9's rule for names; 105:23's verb."},
         {'verse': '105:31', 'remark': "'contado como justiça'", 'outcome': 'taken', 'decision': 'reputatum', 'reason': "without the added 'isto'."},
         {'verse': '105:35', 'remark': "'às suas imagens esculpidas'", 'outcome': 'refused', 'reason': "eórum is the nations'; 'suas' would be Israel's."},
         {'verse': '105:41', 'remark': "'dominaram-nos' heard as 'us'", 'outcome': 'taken', 'decision': 'proclisis'},
         {'verse': '105:42', 'remark': "'atribularam-nos' heard as 'us'", 'outcome': 'taken', 'decision': 'proclisis'},
         {'verse': '105:43', 'remark': "'provocaram-no' blurs into '-nos'", 'outcome': 'taken', 'decision': 'proclisis'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': "claude-opus-5-5, fresh context, blind. Two wrong hearings fixed: 105:24 'tiveram por nada' heard as 'for free' (→ 'em nada'), 105:46 'deu-os às misericórdias' heard as 'at the captors' mercy' (→ 'fez que achassem misericórdia'). 105:41–42 '-nos' heard as 'us' (proclisis). 105:33 heard the second colon as what was pronounced (full stop). Kept as the Latin's openness: 105:3 juízo (D15's known risk), 105:30 'aplacou' without object and 'abalo', 105:45 'arrependeu-se', subjects unnamed in 105:15, 23, 42. Unknown: atribulavam, desígnio, the names, brecha, aplacou, águas da contradição — kept (rows; names expected).",
     'outcomes': [
         {'verse': '105:24', 'remark': "'por nada' heard as 'for free'", 'outcome': 'taken', 'decision': 'pro_nihilo'},
         {'verse': '105:46', 'remark': 'heard as the captors\' mercy', 'outcome': 'taken', 'decision': 'dedit'},
         {'verse': '105:41', 'remark': "'-nos' heard as 'us'", 'outcome': 'taken', 'decision': 'proclisis'},
         {'verse': '105:33', 'remark': 'second colon heard as content of the utterance', 'outcome': 'taken', 'decision': 'distinxit'},
         {'verse': '105:5', 'remark': "'bondade' heard as virtue", 'outcome': 'taken', 'decision': 'videndum'},
         {'verse': '105:13', 'remark': "'o' unclear", 'outcome': 'taken', 'decision': 'cito'}]},
    {'step': 'revision', 'note': "v2: proclisis psalm-wide after 'E' and after a subject; 105:2 'quem' repeated; 105:5 'na bondade'; 105:9 'ficou seco'; 105:13 colon; 105:24 'tiveram em nada'; 105:31 'contado'; 105:33 full stop; 105:46 'E fez que achassem misericórdia'. Ps 104 v2 checked for shared narrative words (Aarão, Cam, Canaã, Egito, 'deles', proclisis 'E os tirou') — agrees."},
]
d['status'] = 'draft'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
