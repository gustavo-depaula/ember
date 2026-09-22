"""Draft 2 of Ps 72 from the v1 readers (critic/v1.*.json)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text())
v = d['verses']
dec = {x['id']: x for x in d['decisions']}

# 72:4 — the supplied 'há' dropped: the colon stays elliptical, as the Latin.
v['72:4'] = 'Porque não há {respectus} morte deles: * e {firmamentum} no flagelo deles.'
f = dec['firmamentum']
f['why'] = f['why'].replace(
    "The verb *há* is supplied (grammar): without it the colon is heard under the first colon's *não* — DRB actually reads it negatively (*nor is there*), but the Latin and the Greek (καὶ) are positive.",
    "The second colon is verbless, as the Latin: whether the first colon's *non est* carries over (DRB *nor is there*) or not is left open (v1 supplied *há*; the latinist ruled that a major, v2 drops it).")
f['options'].append({'label': 'e há firmeza', 'forms': {'firmamentum': 'há firmeza'}, 'note': 'draft 1; supplies a positive verb and settles the ellipsis.', 'from': 'draft'})

# 72:11 — 'Como é que' marks the question (ambiguity reader heard an exclamation).
v['72:11'] = 'E disseram: Como é que Deus sabe, * e se há saber {excelso11}?'

# 72:12 — apposition, not a supplied 'são' (latinist + stylist).
dec['abundantes']['options'][0] = {'label': 'eles mesmos, pecadores e prósperos no mundo', 'forms': {'ecce12': 'Eis que eles mesmos, pecadores e', 'abundantes': 'prósperos', 'insaeculo': 'no mundo'}, 'note': 'Ruling (v2); *ipsi* → *eles mesmos*, the apposition kept, as the latinist and the stylist asked.', 'from': 'critic'}
dec['abundantes']['options'].append({'label': 'estes são pecadores … prósperos no mundo', 'forms': {'ecce12': 'Eis que estes são pecadores, e,', 'abundantes': 'prósperos', 'insaeculo': 'no mundo'}, 'note': 'draft 1; DRB\'s parse with a supplied verb.', 'from': 'DRB'})
dec['abundantes']['why'] = dec['abundantes']['why'].replace(
    "(1) *Ecce, ipsi peccatóres* has no verb; DRB reads a predicate (*Behold these are sinners*), which is how the Greek (ἰδοὺ οὗτοι ἁμαρτωλοί) goes too, and it gives the colon a clear subject for *obtiveram*.",
    "(1) *Ecce, ipsi peccatóres* has no verb; DRB reads a predicate (*Behold these are sinners*). Draft 1 followed it; v2 keeps the Latin's single clause, *ipsi peccatóres et abundántes* in apposition to the subject of *obtinuérunt*.")
v['72:12'] = '{ecce12} {abundantes} {insaeculo}, * obtiveram riquezas.'

# 72:13 — 'justifiquei' heard as 'I excused myself' (ambiguity reader): the sense.
j = dec['justificavi']
j['options'] = [
    {'label': 'tornei justo', 'forms': {'justificavi': 'tornei justo'}, 'note': 'Ruling (v2); the sense, which the cognate hid.', 'from': 'critic'},
    {'label': 'justifiquei', 'forms': {'justificavi': 'justifiquei'}, 'note': 'draft 1; the Latin\'s word, heard as \'I made excuses for\'.', 'from': 'draft'},
    {'label': 'purifiquei', 'forms': {'justificavi': 'purifiquei'}, 'note': 'MS1932; another verb.', 'from': 'MS1932'},
]
j['why'] += ' The ambiguity reader heard *justifiquei* as \'I excused myself\', the wrong first hearing; v2 takes *tornei justo*.'

# 72:16 — 'é fadiga', echoing 72:5 (stylist).
v['72:16'] = 'Eu {existimabam} conhecer isto, * é fadiga diante de mim:'

# 72:18 — no supplied object (latinist); proclitic with 'vós' in the second colon (stylist).
v['72:18'] = 'Todavia, por causa dos enganos, {posuisti}: * {allev}.'
ps = dec['posuisti']
ps['options'] = [
    {'label': 'pusestes para eles', 'forms': {'posuisti': 'pusestes para eles'}, 'note': 'Ruling (v2); objectless, as the Latin (Brazilian speech drops the object pronoun freely).', 'from': 'critic'},
    {'label': 'vós o pusestes para eles', 'forms': {'posuisti': 'vós o pusestes para eles'}, 'note': 'draft 1; DRB\'s *it*, which the ear could not place.', 'from': 'DRB'},
    {'label': 'lhes pusestes laços', 'forms': {'posuisti': 'vós lhes pusestes laços'}, 'note': 'supplies a noun; interprets.', 'from': 'draft'},
    {'label': 'lhes destes uma prosperidade enganosa', 'forms': {'posuisti': 'vós lhes destes uma prosperidade enganosa'}, 'note': 'MS1932; explains.', 'from': 'MS1932'},
]
ps['why'] = ps['why'].replace(
    "Portuguese cannot leave *pôr* without an object; the neuter *o* is the least that can be supplied and leaves open what was set (their prosperity, a snare, a punishment).",
    "Draft 1 supplied a neuter *o*; the stylist and the ambiguity reader found the ear searching for its antecedent, and the latinist asked for no object. Brazilian Portuguese leaves the object of *pôr* unspoken in speech, so v2 follows the Latin; what was set (their prosperity, a snare, a punishment) stays open.")
al = dec['allev']
al['options'] = [
    {'label': 'vós os derrubastes enquanto eram elevados', 'forms': {'allev': 'vós os derrubastes enquanto eram elevados'}, 'note': 'Ruling (v2); the passive, the pronoun before the verb (stylist).', 'from': 'critic'},
    {'label': 'derrubastes-os enquanto eram elevados', 'forms': {'allev': 'derrubastes-os enquanto eram elevados'}, 'note': 'draft 1; the enclitic.', 'from': 'draft'},
    {'label': 'vós os derrubastes enquanto se elevavam', 'forms': {'allev': 'vós os derrubastes enquanto se elevavam'}, 'note': 'MS1932; pride.', 'from': 'MS1932'},
]

# 72:19 — 'uma desolação' (stylist).
fc = dec['facti19']
fc['options'][0] = {'label': 'Como se tornaram uma desolação', 'forms': {'facti19': 'Como se tornaram uma desolação'}, 'note': 'Ruling (v2); the article, as the stylist asked.', 'from': 'critic'}
fc['options'].append({'label': 'Como se tornaram desolação', 'forms': {'facti19': 'Como se tornaram desolação'}, 'note': 'draft 1; heard as clipped.', 'from': 'draft'})

# 72:23 — 'jumento' (latinist + stylist): in Brazil the donkey and the byword for dullness, which is κτηνώδης.
ju = dec['jumentum']
ju['options'] = [
    {'label': 'um jumento', 'forms': {'jumentum': 'um jumento'}, 'note': 'Ruling (v2); the Latin\'s beast of burden, and the Brazilian byword for a dull mind.', 'from': 'critic'},
    {'label': 'um animal', 'forms': {'jumentum': 'um animal'}, 'note': 'draft 1; the row\'s plural *animais* made singular; generic.', 'from': 'glossary'},
    {'label': 'um animal de carga', 'forms': {'jumentum': 'um animal de carga'}, 'note': 'MS1932.', 'from': 'MS1932'},
]
ju['kind'] = 'word'
ju['why'] += ' The latinist and the stylist both asked for *jumento*: the singular is one beast of burden, and in Brazil *jumento* is also what one calls a man without understanding — the sense of κτηνώδης after 72:21 *e não soube*. The row\'s *animais* stays for the plural herds (κτήνη).'

# 72:25 — 'Pois o que' (heard as 'since'), and the plain order (stylist).
v['72:25'] = 'Pois o que há para mim no céu? * e que quis eu {ate} sobre a terra?'
dec['ate']['why'] = dec['ate']['why'].replace(
    'the commas set it off so that it is not heard as \'of you\'.',
    'v2 drops the commas and puts it after the verb (stylist), as ordinary Portuguese orders it.')

d['version'] = 2

audit = [a for a in d['audit'] if a['step'] not in ('readers', 'checks')]
audit += [
    {'step': 'checks', 'note': 'v1 checks.py: hard checks pass. Soft length flags accepted: 72:18a +6, 72:27b +6, 72:16b +5, 72:17b −5, 72:1b +4, 72:26a +4, 72:15b −4, 72:8a −4, 72:23a +3, 72:18b +3, 72:11b −3. Rhyme *deles/deles* at 72:4 is the Latin *eórum/eórum*, kept.'},
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)', 'note': '1 major (72:4 supplied *há*), 8 minor. The major and 4 minors taken (72:12, 72:18, 72:23); the rest refused on rulings or kept as options.', 'outcomes': [
        {'verse': '72:4', 'remark': 'supplied há resolves the ellipsis; e firmeza no flagelo deles', 'outcome': 'taken', 'decision': 'firmamentum', 'reason': 'the colon is verbless in Latin; draft 1 is option 4.'},
        {'verse': '72:4', 'remark': 'plaga distinct from flagellabúntur; chaga', 'outcome': 'refused', 'decision': 'firmamentum', 'reason': 'D39 rules plaga (μάστιξ) → flagelo; the Greek has μάστιγι here and μαστιγωθήσονται in 72:5, the same root, so the echo is the text\'s.'},
        {'verse': '72:6', 'remark': 'tenuit a state; reteve', 'outcome': 'refused', 'decision': 'tenere', 'reason': 'one verb for ténuit / Tenuísti (72:24) keeps the psalm\'s turn; *Retivestes a minha mão direita* would be wrong at 72:24.'},
        {'verse': '72:7', 'remark': 'singular affectum; ao afeto', 'outcome': 'option', 'decision': 'affectus', 'reason': 'the singular is heard as fondness in Brazil; number is grammar (D2). Option 2.'},
        {'verse': '72:9', 'remark': 'in cælum directional; contra o céu', 'outcome': 'option', 'decision': 'incaelum', 'reason': 'the ambiguity reader heard *against heaven* anyway; *no céu* keeps both readings. Option 2.'},
        {'verse': '72:10', 'remark': 'hic locative; aqui', 'outcome': 'option', 'decision': 'hic', 'reason': 'with a verb of motion Brazilian says *para cá*; *se voltará aqui* is not idiomatic. Option 2.'},
        {'verse': '72:12', 'remark': 'added são; eles, pecadores e prósperos no mundo', 'outcome': 'taken', 'decision': 'abundantes', 'reason': 'with the stylist; *ipsi* → *eles mesmos*.'},
        {'verse': '72:17', 'remark': 'plural novissimis and in; acerca das últimas coisas deles', 'outcome': 'option', 'decision': 'novissimis', 'reason': 'the plural reading stays option 2; *o fim* is DRB\'s and MS1932\'s and was heard rightly by the ambiguity reader.'},
        {'verse': '72:18', 'remark': 'supplied o; pusestes para eles', 'outcome': 'taken', 'decision': 'posuisti', 'reason': 'with the stylist and the ambiguity reader, who could not place the *o*.'},
        {'verse': '72:23', 'remark': 'jumentum specific; jumento', 'outcome': 'taken', 'decision': 'jumentum', 'reason': 'with the stylist; the Brazilian donkey is the byword for dullness, κτηνώδης.'},
    ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)', 'note': '10 remarks; best line 72:24, worst 72:18. 7 taken (72:12, 72:16, 72:18 twice, 72:19, 72:23, 72:25 twice counted as one verse); 3 refused.', 'outcomes': [
        {'verse': '72:4', 'remark': 'respeito à stiff; respeito para a', 'outcome': 'refused', 'decision': 'respectus', 'reason': '*para a* is no plainer and loses the dative\'s \'regard to\'; the ambiguity reader heard the Latin\'s readings.'},
        {'verse': '72:7', 'remark': 'como que da clogs; Como da gordura saiu', 'outcome': 'refused', 'decision': 'affectus', 'reason': 'a colon-initial *Como* is heard as \'How\' in this psalm (72:1, 72:11, 72:19, 72:20); *como que* is *quasi*.'},
        {'verse': '72:12', 'remark': 'comma cluster; eles mesmos, pecadores e prósperos', 'outcome': 'taken', 'decision': 'abundantes', 'reason': 'with the latinist.'},
        {'verse': '72:16', 'remark': 'limp uma; é fadiga', 'outcome': 'taken', 'decision': 'existimabam', 'reason': 'echoes 72:5 *na fadiga*; the comma after *isto* stays, as the Latin.'},
        {'verse': '72:18', 'remark': 'o without antecedent; pusestes-lhes isto', 'outcome': 'taken', 'decision': 'posuisti', 'reason': 'the object dropped, as the latinist asked, rather than *isto*, which still has no antecedent.'},
        {'verse': '72:18', 'remark': 'derrubastes-os hisses; vós os derrubastes', 'outcome': 'taken', 'decision': 'allev', 'reason': 'the *vós* moves from the first colon, balancing the lengths (72:18a +6 → +2).'},
        {'verse': '72:19', 'remark': 'clipped; uma desolação', 'outcome': 'taken', 'decision': 'facti19', 'reason': ''},
        {'verse': '72:23', 'remark': 'animal generic; jumento', 'outcome': 'taken', 'decision': 'jumentum', 'reason': 'with the latinist.'},
        {'verse': '72:25', 'remark': 'Pois que heard as since; commas chop; Pois o que … e que quis eu de vós', 'outcome': 'taken', 'decision': 'ate', 'reason': '*de vós* kept (the Latin\'s *a te*), only moved.'},
        {'verse': '72:27', 'remark': 'se põem longe laboured; se afastam', 'outcome': 'option', 'decision': 'elongant', 'reason': 'the elongáre row keeps *longe* apart from *discédere → afastar-se*; open row, flagged for Gustavo. Option 2.'},
    ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context)', 'note': '41 readings, 9 unknown words. Acted on 72:11 (exclamation), 72:13 (justifiquei), 72:18 (the *o*). The rest are the Latin\'s own openings, rulings, or images kept on purpose.', 'outcomes': [
        {'verse': '72:2', 'remark': 'se derramaram puzzling', 'outcome': 'refused', 'decision': 'effusi', 'reason': 'the Latin and Greek image (rule 5); heard as \'nearly failing\', which is the sense. Options 2–3 keep the plain readings.'},
        {'verse': '72:11', 'remark': 'Como sabe Deus heard as an exclamation', 'outcome': 'taken', 'decision': '', 'reason': '*Como é que Deus sabe* marks the skeptical question (the colon was −3; now even).'},
        {'verse': '72:13', 'remark': 'justifiquei heard as excused myself', 'outcome': 'taken', 'decision': 'justificavi', 'reason': 'the test draft 1 asked for came back wrong; *tornei justo*.'},
        {'verse': '72:15', 'remark': 'conditional sense lost', 'outcome': 'refused', 'decision': 'reprobavi', 'reason': 'the Latin is indicative; DRB\'s conditional is option 2.'},
        {'verse': '72:18', 'remark': 'the o has no antecedent', 'outcome': 'taken', 'decision': 'posuisti', 'reason': 'dropped.'},
        {'verse': '72:20', 'remark': 'se levantam heard as rebel', 'outcome': 'option', 'decision': 'surgentium', 'reason': '*sonho* beside it points to waking; *despertam* is option 2.'},
        {'verse': '72:25', 'remark': 'besides-you sense missed', 'outcome': 'refused', 'decision': 'ate', 'reason': '*a te* is \'from you\'; \'besides\' is the Hebrew\'s (DRB); option 2.'},
        {'verse': '72:27', 'remark': 'se prostituem heard literally', 'outcome': 'refused', 'decision': 'fornicantur', 'reason': 'the prophets\' image, kept (rule 5); the explaining option is 3.'},
        {'verse': 'all', 'remark': 'unknown: iníquos, flagelo, soberba, impiedade, afetos, desfaleceram, pereceram, rins, filha de Sião', 'outcome': 'refused', 'decision': '', 'reason': 'glossary rows throughout (iníquo, D39, supérbia, impíetas, defícere, períre, renes, Sion).'},
    ]},
    {'step': 'revision', 'version': 2, 'note': 'Draft 2: 72:4 verbless second colon; 72:11 *Como é que Deus sabe*; 72:12 apposition *eles mesmos, pecadores e prósperos*; 72:13 *tornei justo*; 72:16 *é fadiga*; 72:18 objectless *pusestes para eles* and *vós os derrubastes*; 72:19 *uma desolação*; 72:23 *jumento*; 72:25 *Pois o que … e que quis eu de vós*. prayed.v1.json keeps draft 1.'},
]
d['audit'] = audit
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
