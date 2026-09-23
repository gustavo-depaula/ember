"""Ps 146 draft 2: applies the v1 reader outcomes to prayed.json (draft 1 kept as prayed.v1.json).
python3.13 research/psalterium/ps146/draft2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'

dec = {x['id']: x for x in d['decisions']}

# 146:7: the stylist's 'Entoai ao Senhor ação de graças' is taken.
pr = dec['praecinite']
d['verses']['146:7'] = '{praecinite} ao Senhor {inconf}: * entoai salmos ao nosso Deus com a cítara.'
pr['latin'] = 'Præcínite Dómino in confessióne'
pr['why'] = (
    "'præcínere' is to sing before, to lead the song (L&S). The Greek ἐξάρξατε means 'begin, lead off'. "
    "This is its only place in the psalter (grep). v1 kept it apart from the 'entoar salmos' of the next colon "
    "(psállere, D25) with 'Começai o canto ao Senhor com ação de graças'. The v1 stylist named that line the worst "
    "of the psalm: wordy, a paraphrase, and a chain of nasals across 'ao Senhor com ação'. v2 takes his 'Entoai ao Senhor ação de graças'. "
    "'Entoar' is, word for word, what præcínere means: to intone, to give out the first notes of a chant. "
    "It is also the verb Brazilian ears know in this line (CNBB Bible 'Entoai a ação de graças ao SENHOR', fetched). "
    "'in confessióne' becomes the object ('ação de graças' as what is intoned) instead of 'com ação de graças' "
    "(94:2, 99:3b); this is grammar, since 'entoar' wants an object. "
    "**Cost, accepted:** the verse now says 'Entoai … entoai salmos', where the Latin has two verbs (two Greek verbs). "
    "In 'entoar salmos' the verb is only a support for 'salmos', D25's two-word rendering of one Latin verb, "
    "and the anaphora is sayable. A reader crossing columns sees 'præcínite' and 'psállite' under one Portuguese verb. "
    "If Gustavo wants the two apart, v1's 'Começai o canto' is option 1."
)
pr['options'] = [
    {"label": "Entoai … ação de graças", "forms": {"praecinite": "Entoai", "inconf": "ação de graças"},
     "note": "v2 ruling. The stylist's line. It is exactly præcínere's sense, and it is the line's circulating verb. It shares 'entoai' with 'entoai salmos'.", "from": "stylist"},
    {"label": "Começai o canto … com ação de graças", "forms": {"praecinite": "Começai o canto", "inconf": "com ação de graças"},
     "note": "v1. ἐξάρξατε, and kept apart from 'entoar salmos'. The stylist found it wordy, the worst line.", "from": "draft"},
    {"label": "Cantai … com ação de graças", "forms": {"praecinite": "Cantai", "inconf": "com ação de graças"},
     "note": "DRB 'Sing ye'. The 'prae-' is lost, and 'cantáre' has its own verb.", "from": "DRB"},
    {"label": "Entoai cânticos … com ação de graças", "forms": {"praecinite": "Entoai cânticos", "inconf": "com ação de graças"},
     "note": "MS1932. Supplies a noun.", "from": "MS1932"},
]

# 146:3: the stylist's echo kept as an option.
ct = dec['contritos']
ct['why'] += (
    " v1 readers: the Latinist (minor) and the stylist both missed the root echo. The Latinist proposed 'contrições', "
    "which means acts of contrition (a wrong sense). The stylist proposed 'quebrantado … quebrantos', and in Brazil "
    "'quebranto' is the folk evil-eye malaise or languor, so it would be heard wrongly. The echo is kept out, and the "
    "stylist's line is an option. The ambiguity reader listed 'contrito' and 'enfaixa' as possibly unknown. Both are "
    "kept: 'contrito' is 50:19's word, and 'enfaixa' is the CNBB's in this very verse."
)
ct['options'].insert(2, {"label": "de coração quebrantado … enfaixa … quebrantos",
                         "forms": {"contritos": "de coração quebrantado", "alligat": "enfaixa", "contritiones": "quebrantos"},
                         "note": "The v1 stylist. Keeps the echo, but 'quebranto' is heard as the folk evil-eye malaise.", "from": "stylist"})

# 146:2: the Latinist's abstract noun is already option 2.
dec['congregabit']['why'] += " The v1 Latinist (minor) asked for 'as dispersões'. That is option 3, refused because every Vulgate-family version makes it personal and an abstract noun cannot be gathered."

dec['jumenta']['why'] += " The v1 stylist asked for 'gado' (concrete working beasts). Refused under the row: 'gado' is heard as cattle, which is narrower than κτήνη. It stays option 2."

vo = dec['voluntas']
vo['why'] += (
    " The v1 stylist found 'se comprazerá' bookish and proposed 'Não terá gosto na', and the ambiguity reader listed "
    "'comprazerá' as possibly unknown. Held: it is 111:1's verb for the same Greek (the row is open), and if that row "
    "moves, this line moves with it. 'terá gosto na' is added as an option."
)
vo['options'].insert(2, {"label": "terá gosto na", "forms": {"voluntas": "terá gosto na"},
                         "note": "The v1 stylist. Plainer, but it breaks 111:1's link.", "from": "stylist"})

d['audit'].extend([
    {"step": "latinist", "file": "critic/v1.latinist.json",
     "note": "claude-opus-5-5, fresh context, with latin.json. Two minors, no major. Overall: faithful; tenses, Septuagintal readings and images kept. Both minors refused, and each lives on as an option.",
     "outcomes": [
         {"verse": "146:2", "remark": "dispersiónes made personal; keep 'as dispersões'", "outcome": "option", "decision": "congregabit",
          "reason": "An abstract noun cannot be gathered in Portuguese. DRB and MS1932 both make it personal. Grammar under D2."},
         {"verse": "146:3", "remark": "contrítos / contritiónes echo lost; 'contrições'", "outcome": "option", "decision": "contritos",
          "reason": "'contrições' means acts of contrition, a wrong sense. 50:19 and 59:4 (the same Greek) are kept, and the echo is recorded as lost."}]},
    {"step": "stylist", "file": "critic/v1.stylist.json",
     "note": "claude-opus-5-5, fresh context, with latin.json. Four remarks: one taken (146:7, his worst line), three kept as options. Best line: 146:4.",
     "outcomes": [
         {"verse": "146:3", "remark": "echo broken, 'fraturas' clinical; 'quebrantado … quebrantos'", "outcome": "option", "decision": "contritos",
          "reason": "'quebranto' is the folk evil-eye malaise in Brazil, and 'quebrantado' loses 50:19's word for the same Greek."},
         {"verse": "146:7", "remark": "'Começai o canto' wordy, nasal chain; 'Entoai ao Senhor ação de graças: * cantai salmos …'", "outcome": "taken", "decision": "praecinite",
          "reason": "The first colon is taken: 'entoar' is præcínere's own sense. His second colon ('cantai salmos') is refused, because D25 keeps 'entoai salmos' for psállere."},
         {"verse": "146:9", "remark": "'animais' generic; 'gado'", "outcome": "option", "decision": "jumenta",
          "reason": "The juménta row ('animais'); 'gado' is narrower (cattle)."},
         {"verse": "146:10", "remark": "'se comprazerá' bookish; 'terá gosto'", "outcome": "option", "decision": "voluntas",
          "reason": "111:1's verb for the same Greek θελήσει ἐν. It moves with that row."}]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json",
     "note": "claude-opus-5-5, fresh context, Portuguese only. Fourteen readings. The likely hearing matched the Latin in every one, so nothing was changed. Four possibly unknown words: enfaixa, contrito, cítara, comprazerá.",
     "outcomes": [
         {"verse": "146:1", "remark": "'seja agradável' could be heard as purpose after 'porque'", "outcome": "refused", "reason": "The likely hearing is the wish, as in the Latin; the colon break separates it."},
         {"verse": "146:3", "remark": "'Que cura' momentarily an exclamation", "outcome": "refused", "reason": "The Latin 'Qui' relative is kept; the likely hearing is the relative. It also carries the Lauds antiphon."},
         {"verse": "146:9", "remark": "'que o invocam' could attach to the adult ravens", "outcome": "refused", "reason": "Already recorded in the jumenta decision; the likely hearing was the young."},
         {"verse": "146:10", "remark": "subject not audible", "outcome": "refused", "reason": "The Latin hides it too (habébit); the likely hearing was the Lord."},
         {"verse": "146:3/7/10", "remark": "unknown: enfaixa, contrito, cítara, comprazerá", "outcome": "refused",
          "reason": "'enfaixa' is the CNBB's word in this verse; 'contrito' is 50:19's; 'cítara' is the glossary's (32:2 …); 'comprazerá' is 111:1's (voluntas option 'terá gosto')."}]},
    {"step": "revision", "version": 2,
     "note": "v2: 146:7 takes the stylist's 'Entoai ao Senhor ação de graças' ('in confessióne' becomes the object). It shares 'entoai' with 'entoai salmos'; the cost is recorded in the decision. Options added: the stylist's 'quebrantado … quebrantos' (146:3) and 'terá gosto' (146:10). No other wording changed."},
])

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
