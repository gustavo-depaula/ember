"""ps097 v1 -> v2 after the three v1 readers. Idempotent on version."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] >= 2:
    raise SystemExit('already v2')
dec = {x['id']: x for x in d['decisions']}

# 97:1b — para si first (Latinist + stylist; ambiguity reader could not place *ele*)
s = dec['salvavit']
o = {x['label']: x for x in s['options']}
o['salvou para si']['note'] = "Ruling (v2): reflexive for reflexive, as the Latinist and the stylist both asked; the readers hear it as the Lord's own, which is the sense of the indirect reflexive."
o['salvou para si']['from'] = 'latinist'
o['salvou para ele']['note'] = "v1 draft. The ambiguity reader could not tell who *ele* is or what was saved; both other readers asked for *para si*."
s['options'] = [o['salvou para si'], o['salvou para ele'], o['lhe obteve a salvação']]
s['why'] += " v2: the draft's worry about *para si* was not borne out — the Latinist and the stylist both asked for it, and none of the three readers heard the right hand saving itself; *para ele* instead left the ambiguity reader asking who *ele* was. Taken."

# 97:2 — stylist's *deu a conhecer*: kept as option (76:15 has the same Latin as *Fizestes conhecer*)
d['verses']['97:2'] = "O Senhor {notum} a sua salvação: * {conspectu1} revelou a sua justiça."
d['decisions'].insert(1, {
    "id": "notum", "refs": ["97:2"], "latin": "Notum fecit Dóminus", "kind": "word",
    "why": "The stylist calls *fez conhecer* a calque and asks for the idiom *deu a conhecer*. The meaning is the same, so under D2 it would be taken — but the identical Latin *Notam fecísti* is already *Fizestes conhecer* at 76:15 (and 15:11 *Fizestes-me conhecer*), and what repeats in the Latin repeats in the Portuguese (rule 6). Kept; if Gustavo prefers the idiom, it should go into 76:15 as well. Proposed as a glossary row.",
    "options": [
        {"label": "fez conhecer", "forms": {"notum": "fez conhecer"}, "note": "Ruling: as 76:15, 15:11; *fácere* kept.", "from": "draft"},
        {"label": "deu a conhecer", "forms": {"notum": "deu a conhecer"}, "note": "The stylist's: the ordinary idiom; would need 76:15 to follow.", "from": "stylist"},
        {"label": "manifestou", "forms": {"notum": "manifestou"}, "note": "MS1932's verb; one word, loses *notum*.", "from": "MS1932"}
    ]})

# 97:5 — article with *voz* (stylist)
v = dec['voce']
v['options'] = [
    {"label": "e a voz do salmo · e a voz da", "forms": {"voce1": "e a voz do salmo", "voce2": "e a voz da"}, "note": "Ruling (v2): the stylist's; *com* still serves both nouns, the article eases the breath and matches *com a cítara*.", "from": "stylist"},
    {"label": "e voz de salmo · e voz de", "forms": {"voce1": "e voz de salmo", "voce2": "e voz de"}, "note": "v1 draft, as 46:2 *com voz de exultação*; the stylist found it clipped.", "from": "draft"},
    {"label": "e com a voz do salmo · e com a voz da", "forms": {"voce1": "e com a voz do salmo", "voce2": "e com a voz da"}, "note": "Fullest; a further syllable each."}
]
v['why'] += " v2: the stylist found the article-less form clipped and the *de … de* pile-up at the end hard to say; an article is grammar (D2), taken. It adds about one syllable to each colon."

# 97:8 — *juntos* after the verb (stylist)
d['verses']['97:8'] = "Os rios {plaudent}, os montes exultarão {simul} {conspectu3}: * porque vem julgar a terra."
m = dec['simul']
m['why'] += " v2: the stylist heard *juntos* dangling between the clauses at the head of the second and asked for it after the verb; the Latin's comma already binds *simul* to the mountains (the ambiguity reader heard it so), so moving it is order only (D2). Taken."
m['options'][0]['note'] = "Ruling: the row; after the verb (v2, the stylist's order)."
m['options'][1]['note'] = "MS1932; as 87:18. After the verb, as the ruling."
p_ = dec['plaudent']
p_['why'] += " v2: the Latinist (minor) asked for *aplaudirão com a mão*; refused — the idiom keeps the hands in *palmas*, D43 set the phrase, and the Latinist himself called the draft defensible."

d['version'] = 2
d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. 2 minor, no major. 97:1b taken; 97:8 refused (option).",
     "outcomes": [
        {"verse": "97:1b", "remark": "sibi is reflexive: para si", "outcome": "taken"},
        {"verse": "97:8", "remark": "manu absorbed by bater palmas: aplaudirão com a mão", "outcome": "option", "decision": "plaudent", "reason": "D43's idiom keeps the hands in palmas; the Latinist himself called it defensible; the singular is idiom in Latin and Greek alike"}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context. 4 remarks; 3 taken (97:1b, 97:5, 97:8), 1 kept as an option (97:2). Worst line 97:1b (now mended); best 97:9.",
     "outcomes": [
        {"verse": "97:1b", "remark": "salvou para ele sounds like a gloss: para si", "outcome": "taken"},
        {"verse": "97:2", "remark": "fez conhecer a calque: deu a conhecer", "outcome": "option", "decision": "notum", "reason": "76:15 renders the identical Latin Notam fecísti as Fizestes conhecer (and 15:11); rule 6 — changing it here would split one Latin phrase in two"},
        {"verse": "97:5", "remark": "e voz de clipped: e a voz do salmo / e a voz da trombeta", "outcome": "taken"},
        {"verse": "97:8", "remark": "juntos dangles: os montes exultarão juntos", "outcome": "taken"}]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, prayed text only. 19 readings, 4 unknown words (cítara, equidade, plenitude, entoai — the first three known costs of their rows). One acted on (97:1b *ele*); the rest are the Latin's own openness or glossary rows.",
     "outcomes": [
        {"verse": "97:1b", "remark": "who is ele, what was saved", "outcome": "taken", "reason": "para si (see salvavit)"},
        {"verse": "97:1b", "remark": "direita alone may sound like the right side", "outcome": "refused", "reason": "déxtera row (bare direita), held as at 76:11; heard as the hand first"},
        {"verse": "97:1b", "remark": "e o seu braço santo could parse as object", "outcome": "refused", "reason": "the Latin's ellipsis; the reader heard it as second subject, which is right"},
        {"verse": "97:3", "remark": "para com a casa de Israel applies to one or both", "outcome": "refused", "reason": "the Latin's own openness, kept on purpose (decision domui)"},
        {"verse": "97:6", "remark": "abale-se may be heard as troubled / damaged", "outcome": "refused", "reason": "kept identical with 95:11 (same Greek σαλεύω); seja abalado and agite-se remain options of moveatur; flagged for the coordinator with 95"},
        {"verse": "97:6", "remark": "o Senhor heard as apposition (right) or vocative", "outcome": "refused", "reason": "heard as apposition; do Senhor, o rei is an option"},
        {"verse": "97:8", "remark": "juntos with rivers or mountains", "outcome": "taken", "reason": "moved after the verb (stylist)"},
        {"verse": "97:5", "remark": "voz de salmo opaque; batido unclear", "outcome": "refused", "reason": "the Latin's words; de metal is an option of ductilibus"},
        {"verse": "97:2", "remark": "justiça / verdade / julgar heard judicially", "outcome": "refused", "reason": "the Latin's own range; glossary rows"}]},
    {"step": "revision", "version": 2, "note": "v2: 97:1b *salvou para si* (Latinist + stylist); 97:5 articles with *voz* (stylist); 97:8 *juntos* after the verb (stylist); 97:2 unchanged in wording, the stylist's *deu a conhecer* recorded as option of new decision `notum`. v1 kept as prayed.v1.json."}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
print('v2 written')
