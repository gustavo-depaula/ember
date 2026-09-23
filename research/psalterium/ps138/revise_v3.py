import json
p = '/Users/gustavo/Documents/prayer/.claude/worktrees/parallel-prancing-avalanche/research/psalterium/ps138/prayed.json'
d = json.load(open(p))
d['version'] = 3
dec = {x['id']: x for x in d['decisions']}

c = dec['cognoscit']
c['why'] = ("*cognóscit* has no object. v1–v2 supplied *o* (the cognóscere row's 13:4 rule: *conhecer* wants an object). "
            "The v2 gate (minor) showed the pronoun supplies what the Latin leaves open; the row's own Ps 73:5 *não conheceram* "
            "(no object, asked by the Latinist and the stylist there) shows *conhecer* stands bare. Draft 3: *conhece*, no pronoun. "
            "The psalter's antiphon *Mirabília ópera tua, Dómine, et ánima mea cognóscit nimis* is said with this colon.")
c['options'].insert(0, {"label": "conhece", "forms": {"cognoscit": "conhece"},
                        "note": "Draft 3, the v2 gate's fix: no object, as the Latin (73:5 precedent).", "from": "latinist"})
c['options'][1]['note'] = "v1–v2; MS1932 *o conhece de sobra*. Supplies an object."

o = dec['os']
o['why'] += (" The Latinist asked *o meu osso* on v1 (minor) and on the v2 gate (MAJOR). **Held**, with Ps 101:6's ruling "
             "(*adhǽsit os meum carni meæ → os meus ossos se colaram à minha carne*, the same request held on v1 and at the gate, glossary adhærére): "
             "Portuguese hears *o meu osso* as one bone, not the frame, and the psalter should not split the collective singular between 101:6 and 138:15. "
             "For Gustavo, with 101:6: if the singular is wanted, both change together.")

e = dec['exme']
e['options'].append({"label": "de mim, before the subject", "forms": {"exme": "de mim"},
                     "note": "The v2 gate: *Maravilhoso se tornou de mim o vosso saber* (ties *de mim* to the verb, not 'knowledge of me'). Not taken: the order is hard to say and still reads 'from me' only.",
                     "from": "latinist"})

d['audit'].append({
  "step": "latinist gate",
  "model": "claude-opus-5-5 (fresh context, with latin.json)",
  "note": "One major, three minors.",
  "outcomes": [
    "138:15 *os meum* plural (MAJOR): held with a written reason — Ps 101:6's standing ruling on the same collective singular (held on v1 and at its gate); *o meu osso* is heard as one bone. Flagged for Gustavo with 101:6; option kept.",
    "138:6 *o vosso saber de mim* read as 'knowledge of me': declined; the gate's order (*se tornou de mim o vosso saber*) is awkward and narrows to 'from me'. 'of me' is one of the Latin's readings; option added.",
    "138:11 *illuminátio → luz* collapses with *lumen*: declined, the illuminátio row settles *luz*.",
    "138:14 *o conhece* supplies an object: taken, *conhece* (73:5 precedent). Draft 3."
  ]})
d['audit'].append({"step": "revision", "note": "Draft 3: 138:14 *e a minha alma conhece sem medida*. prayed.v2.json keeps v2. Draft 3 is unread by a gate (one pronoun dropped)."})
d['status'] = 'reviewed'
json.dump(d, open(p, 'w'), ensure_ascii=False, indent=2)
open(p, 'a').write('\n')
