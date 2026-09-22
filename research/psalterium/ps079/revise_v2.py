"""Ps 79 draft 2 from draft 1 (kept as prayed.v1.json) after the v1 readers."""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
v = d['verses']
v['79:5'] = "Senhor, {virt5}, * até quando estareis irado {super} a oração do vosso servo?"
v['79:6'] = "Com pão de lágrimas {cibabis}: * e nos dareis de beber em lágrimas, {mensura}?"
v['79:7'] = "Fizestes de nós {contradictio} os nossos vizinhos: * e os nossos inimigos zombaram de nós."
v['79:10'] = "Fostes guia do caminho {conspectu}: * plantastes as suas raízes, e ela encheu a terra."
v['79:11'] = "A sua sombra cobriu os montes: * e {arbusta} os cedros de Deus."
v['79:13'] = "Por que destruístes a sua cerca: * e todos os que passam pelo caminho a {vindemiant}?"
v['79:14'] = "{exterminavit} o javali da selva: * e {depastus} {singularis}."
v['79:19'] = "E de vós não nos afastamos, {vivificabis}: * e invocaremos o vosso nome."

dec = {x['id']: x for x in d['decisions']}


def first(did, label, forms, note, frm):
    dec[did]['options'].insert(0, {'label': label, 'forms': forms, 'note': note, 'from': frm})


def add(did, label, forms, note, frm):
    dec[did]['options'].append({'label': label, 'forms': forms, 'note': note, 'from': frm})


# 79:7 article dropped (stylist); forms of the other options follow
for o in dec['contradictio']['options']:
    if o['forms']['contradictio'] == 'uma contenda para':
        o['forms']['contradictio'] = 'contenda para'
        o['label'] = 'contenda para'
        o['note'] = 'Ruling: the row; the 43:14 build without the article (stylist v1: *uma contenda* sounds like one quarrel handed over).'
add('contradictio', 'uma contenda para', {'contradictio': 'uma contenda para'}, 'draft 1; the 43:14 build to the letter.', 'draft')

# 79:10 diante dela
first('conspectu', 'diante dela', {'conspectu': 'diante dela'}, 'Ruling in draft 2: the stylist (v1) heard *à vista* first as "in cash" and the phrase as bureaucratic; the ambiguity reader lost the link of *dela* to the vine. The Greek is ἔμπροσθεν, "before"; MS1932 *diante dela*. A local departure from the conspéctus row, recorded there.', 'stylist')
dec['conspectu']['options'][1]['note'] = 'draft 1: the row.'

# 79:11 arvoredo, verb supplied
dec['arbusta']['why'] += ' Draft 2: the Latinist (v1) held *ramos* to narrow *arbústa* (trees, a planted grove) and to blur it with *pálmites*; *arvoredo* taken. The ambiguity reader heard the verbless colon as apposition (*its branches were the cedars of God*); the gapped verb is supplied, as grammar (D2): *e o seu arvoredo cobriu os cedros de Deus* would repeat *cobriu*; *e o seu arvoredo, os cedros de Deus* keeps the ellipsis but is misheard. Supplied as *cobriu* in the slot so the whole choice is one touch.'
first('arbusta', 'o seu arvoredo, cobriu', {'arbusta': 'o seu arvoredo cobriu'}, 'Ruling in draft 2: the Latinist\'s noun; the verb of the first colon supplied against the misheard apposition.', 'latinist')
add('arbusta', 'o seu arvoredo, (ellipsis)', {'arbusta': 'o seu arvoredo,'}, 'the Latinist\'s fix to the letter; keeps the Latin\'s ellipsis, heard as apposition.', 'latinist')
for o in dec['arbusta']['options'][1:3]:
    o['forms']['arbusta'] = o['forms']['arbusta'] + ','
dec['arbusta']['options'][0]['label'] = 'o seu arvoredo cobriu'

# 79:14 order of the second colon
dec['depastus']['why'] += ' Draft 2: the stylist\'s order *e pastou-a a fera solitária* (v1): it answers *Devastou-a* in the first colon and removes the *a … a* of article and clitic. Order only (D2).'
for o in dec['depastus']['options']:
    o['forms']['depastus'] = o['forms']['depastus'] + '-a'
    o['label'] = o['forms']['depastus']
for o in dec['singularis']['options']:
    o['forms']['singularis'] = o['forms']['singularis'].replace('a fera', 'a fera')

# 79:19
for o in dec['vivificabis']['options']:
    pass
dec['vivificabis']['why'] += ' Draft 2: the stylist (v1) heard *de vós, vós* as a stammer; the first colon is reordered *E de vós não nos afastamos*, so the two pronouns are no longer side by side (order only). His *nos vivificareis* (clitic opening the clause) is not written Portuguese; the mesóclise stays an option.'

# 79:5
d['choices']['79:5'] = "*quoúsque → até quando* (as *úsquequo*). Draft 2: *irascéris* → *estareis irado* (the stylist, v1: *vos irareis* is a knot of r's), the future said as copula + participle — grammar (D2), the verb's root kept. *servus → servo* (row)."
d['choices']['79:6'] = "*pane lacrimárum → pão de lágrimas*, singular, as the Latin. Draft 2: *in lácrimis* kept as a prepositional phrase with *dar de beber* for *potum dare* (the Latinist, v1): *e nos dareis de beber em lágrimas* — the drink that is tears, or given while weeping; the Latin's *in* holds both."
d['choices']['79:10'] = "Draft 2: the subject *ela* named (the stylist, v1; the ambiguity reader heard God first): *implévit* is singular, so it is the vine, not the roots or God. *dux → guia*, *iter → caminho* (rows)."
d['choices']['79:13'] = "*Ut quid → Por que* (as 73:1). *macéria → cerca* (row, 61:4). Draft 2: the stylist's order (v1), the subject before the verb, so that *e a vindimam* is not heard as *e à vindima* and the pronoun is no longer next to *cerca*."
d['choices']['79:14'] = "The Latin's order, verb first, in both colons: *Devastou-a … e pastou-a* (draft 1's *O javali da selva a devastou … a pastou* rhymed at both cadences; draft 2 takes the stylist's order in the second colon). *silva → selva* (D44)."
d['choices']['79:17'] = "*igni → a fogo*. Singular participles and a plural verb with no subject: the Latin's (*incénsa … períbunt*). The stylist asked a colon at the mark to let the plural begin a new thought (refused: it makes the participles a sentence of their own, MS1932's reading, where the Latin runs on). *ab increpatióne → à repreensão* (formula row); *vultus → rosto* (row)."

v1lat = [
    {"verse": "79:6", "remark": "*in lácrimis* made the object; keep the preposition", "outcome": "taken", "reason": "*e nos dareis de beber em lágrimas* — *dar de beber* is *potum dare*, and *em* keeps the Latin's openness."},
    {"verse": "79:11", "remark": "*arbústa* is trees/grove, not branches; *arvoredo*", "outcome": "taken"},
    {"verse": "79:17", "remark": "feminine singular settles the Latin's gender/number; acceptable, note the reason", "outcome": "refused", "decision": "incensa", "reason": "he asks no change; the reason (the Greek's feminine singular) is in the decision."},
]
v1sty = [
    {"verse": "79:5", "remark": "*vos irareis* knotted; *estareis irado*", "outcome": "taken"},
    {"verse": "79:7", "remark": "drop the article: *contenda para*", "outcome": "taken"},
    {"verse": "79:9", "remark": "*Transportastes* heavy; *Trasladastes*", "outcome": "refused", "reason": "D43 settled *transférre → transportar* and refused *trasladar* as a word for relics; one row across the psalter."},
    {"verse": "79:10", "remark": "*à vista dela* heard as 'in cash', bureaucratic; *diante dela*", "outcome": "taken"},
    {"verse": "79:10", "remark": "*e encheu* has no subject; *e ela encheu*", "outcome": "taken"},
    {"verse": "79:13", "remark": "*e a vindimam* blurs; subject first", "outcome": "taken"},
    {"verse": "79:14", "remark": "*a fera solitária a pastou*; *e pastou-a a fera solitária*", "outcome": "taken"},
    {"verse": "79:17", "remark": "colon at the mark so the plural begins a new thought", "outcome": "refused", "reason": "it cuts the participles off from *perecerão* as a sentence of their own, closing what the Latin runs on; the number clash is the Latin's."},
    {"verse": "79:18", "remark": "*Seja … sobre* calqued; *Esteja*", "outcome": "option", "decision": "fiat", "reason": "the *fíeri* row (*Seja* for jussive *Fiat*, 118:173 held twice against the same request); *Esteja* makes it a state."},
    {"verse": "79:19", "remark": "*de vós, vós* stammer; drop the second *vós*", "outcome": "taken", "reason": "taken in substance by reordering (*E de vós não nos afastamos, vós nos vivificareis*); his clitic-first *nos vivificareis* is not written Portuguese."},
]
amb = [
    {"verse": "79:2", "remark": "*José* heard as one person", "outcome": "refused", "reason": "the Latin's name, singular as the Latin's *ovem*; nothing to add without explaining."},
    {"verse": "79:4", "remark": "*convertei-nos* heard as moral conversion first", "outcome": "refused", "decision": "convert", "reason": "the sense ruled for (D25's exception); *fazei-nos voltar* is option 2."},
    {"verse": "79:5", "remark": "*Deus dos poderes* heard abstractly", "outcome": "refused", "decision": "virtutum", "reason": "D43; *dos exércitos* option, flagged for Gustavo there."},
    {"verse": "79:6", "remark": "heard as a statement until the question mark; *por medida* heard as limited", "outcome": "refused", "reason": "both are the Latin's: its question mark comes at the end too, and *in mensúra* is open."},
    {"verse": "79:7", "remark": "*contenda* vague and unknown", "outcome": "refused", "decision": "contradictio", "reason": "the row's word (17:44, 30:21, 54:10); options kept."},
    {"verse": "79:10", "remark": "subject of *encheu*; *à vista dela* loose", "outcome": "taken"},
    {"verse": "79:11", "remark": "heard as apposition 'its branches were the cedars'", "outcome": "taken", "reason": "the gapped verb supplied."},
    {"verse": "79:13", "remark": "*a* heard as the fence; *vindimam* unknown", "outcome": "taken", "reason": "the reorder moves the pronoun away from *cerca*; *vindimar* kept (the Latin's one word), *colhem as uvas* option."},
    {"verse": "79:14", "remark": "*pastou* heard as 'shepherded'", "outcome": "refused", "decision": "depastus", "reason": "D43 (*depáscere → pastar*), the same double hearing as 48:15; *devorou-a* option."},
    {"verse": "79:16", "remark": "*e sobre o filho do homem* a verbless fragment; heard as Christ", "outcome": "refused", "reason": "the Latin's ellipsis (DRB keeps it) and the Latin's phrase; nothing supplied."},
    {"verse": "79:17", "remark": "no noun for *Queimada*; subject of *perecerão* unheard", "outcome": "refused", "decision": "incensa", "reason": "the Latin's; the vine is two verses back in both languages."},
    {"verse": "79:19", "remark": "present *afastamos* may sound boastful; link to *vivificareis* unclear", "outcome": "refused", "decision": "discedimus", "reason": "the Latin's present and parataxis."},
    {"verse": "79:12", "remark": "unknown: *sarmentos*, *rebentos*", "outcome": "refused", "reason": "three growth words need three words; concrete images stay (rule 5)."},
]
d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Three minors, no major. Two taken (79:6, 79:11); 79:17 asked no change.", "outcomes": v1lat})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context. Ten remarks on nine verses; best line 79:4 (the refrain), worst 79:17. Seven taken (grammar and order), 79:9 refused (D43), 79:17 refused, 79:18 kept as an option.", "outcomes": v1sty})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. Most readings are the Latin's own; three fixed (79:10, 79:11, 79:13).", "outcomes": amb})
d['audit'].append({"step": "revision", "version": 2, "note": "v2: 79:5 *estareis irado*; 79:6 *dar de beber em lágrimas*; 79:7 article dropped; 79:10 *diante dela*, *ela* named; 79:11 *o seu arvoredo cobriu*; 79:13 subject before verb; 79:14 *e pastou-a a fera solitária*; 79:19 *E de vós não nos afastamos*. The refrain untouched."})

# 79:18 Esteja as an option: make a decision
d['verses']['79:18'] = "{fiat} a vossa mão sobre o homem da vossa direita: * e sobre o filho do homem, {confirm18}."
d['decisions'].append({"id": "fiat", "refs": ["79:18"], "latin": "Fiat manus tua super", "kind": "glossary",
    "why": "The *fíeri* row: jussive *Fiat* → *Seja* (118:173 *Seja a vossa mão para me salvar*, held twice against the stylist). The stylist (v1) called *Seja … sobre* a calque and asked *Esteja*: that turns a becoming into a state, which *fíeri* is not. Held; *Esteja* one touch away.",
    "options": [
        {"label": "Seja", "forms": {"fiat": "Seja"}, "note": "Ruling: the row, as 118:173.", "from": "glossary"},
        {"label": "Esteja", "forms": {"fiat": "Esteja"}, "note": "stylist v1.", "from": "stylist"}]})
add('super', 'estareis irado sobre', {'super': 'sobre'}, 'unused', 'draft') if False else None
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
