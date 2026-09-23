"""Append the v1 reader steps, the revision and the v2 checks to Ps 121's audit."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text())
if any(s.get('step') == 'revision' for s in d['audit']):
    raise SystemExit('already added')
d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, read latin.json. Three minors, no major: two on number (121:1, 121:6), one on stantes (121:2). Pointing confirmed; the Septuagintal features and the imperfect loquébar noted as kept.', 'outcomes': [
        {'verse': '121:1', 'remark': 'plural his quæ → com as coisas que me foram ditas', 'outcome': 'option', 'decision': 'dicta', 'reason': 'the neuter clause carries a plural quæ with no noun (as D26); the plural adds three weak syllables to a line also sung alone'},
        {'verse': '121:2', 'remark': 'stantes is standing, not stopped → estavam de pé', 'outcome': 'refused', 'decision': 'stantes', 'reason': "'os pés estavam de pé' says the feet stood on their feet; the ruling moved to 'se detinham' for the other readers' reasons"},
        {'verse': '121:6', 'remark': 'quæ plural → as coisas que são para a paz', 'outcome': 'option', 'decision': 'quae6', 'reason': 'as 121:1; +3 syllables to a colon already +2'}
    ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, read latin.json. Seven remarks; two taken (121:2 se detinham, 121:7 força), five kept as options. Best line 121:1, worst 121:3.', 'outcomes': [
        {'verse': '121:2', 'remark': "'parados' heard as stalled feet → se detinham", 'outcome': 'taken', 'decision': 'stantes'},
        {'verse': '121:3', 'remark': "'em conjunto' office language → num só todo", 'outcome': 'option', 'decision': 'idipsum', 'reason': "supplies a noun and closes in idípsum on a whole; 'em conjunto' keeps the Greek's together and the juntos family"},
        {'verse': '121:4', 'remark': 'colon too long → louvar o nome', 'outcome': 'option', 'decision': 'confitendum', 'reason': "D5: louvar is laudáre's"},
        {'verse': '121:6', 'remark': "'o que é para a' gloss-like → o que serve à paz", 'outcome': 'option', 'decision': 'quae6', 'reason': 'supplies a verb of usefulness for the bare sunt ad'},
        {'verse': '121:7', 'remark': "'poder' abstract, political → na tua força", 'outcome': 'taken', 'decision': 'virtute'},
        {'verse': '121:8', 'remark': "'falar paz sobre' a calque → eu falava de paz a teu respeito", 'outcome': 'option', 'decision': 'loquebar', 'reason': "pacem is the accusative of content, kept as 84:9 'falará paz' and 16:9b; 'falar de paz' is talking about peace"},
        {'verse': '121:9', 'remark': "'coisas boas' weak at the close → busquei para ti os bens", 'outcome': 'option', 'decision': 'bona', 'reason': "the bona tríbuere row: 'bens' is heard as property"}
    ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context, Portuguese only. Nineteen items; two acted on (121:2 parados heard as stuck; 121:7 poder heard abstract), the rest the Latin\'s own openness or heard rightly. Unknown words: átrios (kept, the row), participação, se edifica, se assentaram (kept).', 'outcomes': [
        {'verse': '121:2', 'remark': "'estavam parados' heard as stopped/stuck/idle", 'outcome': 'taken', 'decision': 'stantes'},
        {'verse': '121:2', 'remark': "'estavam' heard as a remembered past", 'outcome': 'refused', 'reason': "erant is a past; the Latin's own"},
        {'verse': '121:3', 'remark': "'em conjunto' vague: everyone takes part together", 'outcome': 'refused', 'reason': "that is the Greek's sense; the verse is obscure in Latin too"},
        {'verse': '121:4', 'remark': "'testemunho de Israel' loose apposition", 'outcome': 'refused', 'reason': 'the Latin apposition, left as open as the Latin; para Israel is an option'},
        {'verse': '121:6', 'remark': "'te' heard as God", 'outcome': 'refused', 'reason': "the turn to Jerusalem is the Latin's; 121:2 names her as tu, and God is vós in this psalter"},
        {'verse': '121:7', 'remark': "'no teu poder' heard abstract / dominion", 'outcome': 'taken', 'decision': 'virtute'},
        {'verse': '121:8', 'remark': "'falava paz sobre ti' — the blessing sense weak", 'outcome': 'refused', 'reason': "the ruling keeps the Latin's accusative of content; the blessing is present as one reading"},
        {'verse': '121:9', 'remark': "'ti' heard as God; 'coisas boas' heard as material things", 'outcome': 'refused', 'reason': "as 121:6; bona is left as wide as the Latin"}
    ]},
    {'step': 'revision', 'version': 2, 'note': "v2: 121:2 'estavam parados' → 'se detinham' (stylist + ambiguity reader; DM1962); 121:7 'no teu poder' → 'na tua força' (stylist + ambiguity reader; a local departure from the virtus row, as 102:20). New decisions confitendum, quae6, bona (to hold refused proposals as options). Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json). Script: revise_v2.py."},
    {'step': 'checks', 'note': 'Draft 2: hard pass. 121:2 first colon now 8 syllables, as the Latin. Rhyme flag in 121:4 as before (the Latin\'s Dómini / Dómini).'}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
