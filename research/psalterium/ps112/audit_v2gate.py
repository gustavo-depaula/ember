import json
p = 'research/psalterium/ps112/prayed.json'
d = json.load(open(p, encoding='utf-8'))
d['status'] = 'reviewed'
d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json", "note": "v2 gate, claude-opus-5-5, fresh context, read latin.json. No major. One minor, refused: the inline '(6)' marker in 112:5 — AGENT-BRIEF rule 4 says inline (20)-style markers are not reproduced (as every finished psalm). Passed *meninos*, *coisas humildes*, the open attachment, and the finite verbs of 7 and 9 as allowed by D2.",
    "outcomes": [{"verse": "112:5", "remark": "inline (6) marker dropped", "outcome": "refused", "reason": "rule 4: inline verse markers are not translated and not reproduced"}]})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
