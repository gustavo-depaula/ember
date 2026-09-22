"""Record the v2 Latinist gate for Ps 57 (claude-opus-5-5, fresh context, with latin.json)."""
import json
p = 'prayed.json'
d = json.load(open(p))
d['status'] = 'reviewed'
d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json",
  "note": "claude-opus-5-5, fresh context, read latin.json. Gate clean of majors: three minors, all held (each is an option already).",
  "outcomes": [
    {"verse": "57:4", "remark": "falsa → falsidades, not mentiras", "outcome": "option", "decision": "falsa", "reason": "Held: ψεύδη is the Greek of *mendácium* too (D15's test), and *falaram falsidades* jingles at the close; v1's gate passed *mentiras*."},
    {"verse": "57:8", "remark": "decurrens → que escorre (the running down)", "outcome": "refused", "decision": "devenient", "reason": "*escorre* renders *fluit* in the next verse; the two Latin verbs stay two. *corre* is DRB's 'running'."},
    {"verse": "57:9", "remark": "supercecidit: 'sobre eles' supplied; back to 'de cima'", "outcome": "option", "decision": "supercecidit", "reason": "The v1 gate asked for the opposite (*de cima* turns the preposition round) and v2 was made from that remark; the gate contradicts itself between runs (cf. D24). *cair sobre* needs an object; *eles* are the sinners of 57:9a, as DRB and MS1932 read. *de cima* stays option 1."}]})
json.dump(d, open(p, 'w'), ensure_ascii=False, indent=2)
