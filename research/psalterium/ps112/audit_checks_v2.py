import json
p = 'research/psalterium/ps112/prayed.json'
d = json.load(open(p, encoding='utf-8'))
d['audit'].append({"step": "checks", "note": "v2: hard pass (exit 0). New soft flag 112:7a +3 (*Ele levanta da terra o carente*; 11 with *terra‿o* elided, the named subject is the cost of the finite verb) — accepted. The v1 flags stand as accepted."})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
