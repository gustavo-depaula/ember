"""ps093: record the v2 Latinist gate in prayed.json (idempotent)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    dec = {x['id']: x for x in d['decisions']}
    dec['paulo']['why'] += " The v2 Latinist (minor) asks the protasis to state the fact, as 'Nisi quia' + perfect does: 'Se não fosse que o Senhor me auxiliou' — held, option `nisi`."
    d['decisions'].append({"id": "nisi", "refs": ["93:17"], "latin": "Nisi quia Dóminus adjúvit me", "kind": "grammar",
        "why": "'Nisi quia' + perfect indicative states a fact ('were it not that the Lord helped me'); only the apodosis (habitásset) is unreal. Portuguese puts the whole period in the unreal mood; DRB ('Unless the Lord had been my helper') and MS1932 ('Se o Senhor me não tivesse socorrido') do the same, and 118:92 was ruled so against the Latinist (D24). Mood is grammar (D2).",
        "options": [
            {"label": "Se o Senhor não me tivesse auxiliado", "forms": {"nisi": "Se o Senhor não me tivesse auxiliado"}, "note": "Ruling: the Portuguese period; DRB, MS1932.", "from": "draft"},
            {"label": "Se não fosse que o Senhor me auxiliou", "forms": {"nisi": "Se não fosse que o Senhor me auxiliou"}, "note": "v2 Latinist (minor): the fact stated; heavy and unusual in Portuguese.", "from": "latinist"}]})
    d['verses']['93:17'] = '{nisi}, * {paulo}.'
    for o in dec['fingis']['options']:
        if o['forms']['fingis'].endswith('preceito'):
            o['note'] = "stylist (v1) and the v2 Latinist (minor): 'decreto' juridical; refused — præcéptum → decreto is settled (D19, which lists 93:20); 'preceitos' is justificatiónes's (D15)."
            o['from'] = 'latinist'
    d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json",
        "note": "Gate on draft 2 (claude-opus-5-5, fresh context, with latin.json): no major; two minors, both held with options. He passed the v2 changes (93:13 'lhe deis alívio dos dias maus', 93:8 'entre o povo', 93:23 'há de exterminá-los').",
        "outcomes": [
            {"verse": "93:17", "remark": "'Nisi quia' + perfect states a fact; the protasis made counterfactual", "outcome": "option", "decision": "nisi", "reason": "Mood is grammar (D2); DRB and MS1932 build it the same way; 118:92 ruled so (D24). His wording is option 2."},
            {"verse": "93:20", "remark": "'præcéptum' is a precept, not a decree; 'preceito'", "outcome": "option", "decision": "fingis", "reason": "D19 settles præcéptum → decreto and names 93:20; 'preceitos' belongs to justificatiónes (D15)."}]})
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(d['decisions']), 'decisions')
