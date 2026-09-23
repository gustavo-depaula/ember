"""Ps 88: record the v2 Latinist gate, take 88:45 'tirando-lhe a purificação', bump to v3. Idempotent."""
import json, shutil
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    shutil.copy(p, here / 'prayed.v2.json')
    shutil.copy(here / 'prayed.vos.json', here / 'prayed.v2.vos.json')
    dec = {x['id']: x for x in d['decisions']}
    em = dec['em45']
    em['options'][0]['label'] = "Vós o destruístes, apartando-o (draft 2)"
    em['options'][0]['note'] = "Draft 2: the v1 Latinist's reading; the v2 Latinist found *apartando-o* an added participle."
    em['options'].insert(0, {"label": "Vós o destruístes, tirando-lhe", "forms": {"em45": "Vós o destruístes, tirando-lhe a purificação"}, "note": "Ruling (v3): the v2 Latinist's fix — *eum* the object, *ab* as loss, shorter than draft 2.", "from": "latinist"})
    em['why'] += " Draft 3 (the v2 Latinist, minor): *tirando-lhe a purificação*, which keeps *eum* as the object without the added verb of separation."
    dec['oath36']['options'].append({"label": "pelo meu santo: se eu mentir", "forms": {"s36": "pelo meu santo", "si36": "se eu mentir a Davi!"}, "note": "The v2 Latinist: *sanctum meum* substantive, the formula kept.", "from": "latinist"})
    dec['oath36']['why'] += " The v2 Latinist repeated the formula point and added *pelo meu santo* (*sanctum* substantive). Both were refused (minor): after *jurei*, *pelo meu santo* is heard as a saint. His form is the last option."
    dec['brac13']['options'].append({"label": "o vosso braço é com potência", "forms": {"b13": "o vosso braço é com potência"}, "note": "The v2 Latinist: *cum potentia* the predicate.", "from": "latinist"})
    d['version'] = 3
    d['status'] = 'reviewed'
    d['audit'] += [
        {"step": "latinist", "file": "critic/v2.latinist.json", "note": "Gate on draft 2 — claude-opus-5-5, fresh context, with latin.json. Clean of majors: four minors, of which one was taken (88:45) and three held with options (88:13, 88:19, 88:36, each repeated from v1). The other v2 changes (88:7, 18, 34, 41, 48, 51) passed without remark.",
         "outcomes": [
            {"verse": "88:13", "remark": "predicate shifted to ownership; 'o vosso braço é com potência'", "outcome": "option", "decision": "brac13", "reason": "The Greek σὸς ὁ βραχίων fixes the predicate reading; it echoes 88:12 *Tui … tua*."},
            {"verse": "88:19", "remark": "amparo shared with suscéptor; 'acolhimento'", "outcome": "option", "decision": "assump", "reason": "ἀντίλημψις / ἀντιλήμπτωρ: one word in the Greek (D15's test)."},
            {"verse": "88:36", "remark": "oath formula resolved; 'pelo meu santo'", "outcome": "option", "decision": "oath36", "reason": "*se eu mentir … a sua descendência permanecerá* is heard as a condition with the opposite sense; *pelo meu santo* is heard as a saint."},
            {"verse": "88:45", "remark": "'apartando-o' adds a participle; 'tirando-lhe a purificação'", "outcome": "taken", "decision": "em45"}
         ]},
        {"step": "revision", "version": 3, "note": "v3: 88:45 *Vós o destruístes, tirando-lhe a purificação* (the v2 Latinist's own wording). No reader has read draft 3 as a whole; its only difference from draft 2 is the gate's fix. Draft 2 kept as prayed.v2.json."}
    ]
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.loads(p.read_text(encoding='utf-8'))['version'])
