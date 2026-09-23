"""Record the v2 Latinist gate on ps223, take its 2:2 minor, and mark the canticle reviewed.
python3.13 research/psalterium/ps223/record_gate.py  (idempotent: refuses to run twice)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
raw = p.read_text(encoding='utf-8')
d = json.loads(raw)
if any(s['step'] == 'latinist' and s.get('file') == 'critic/v2.latinist.json' for s in d['audit']):
    raise SystemExit('already recorded')

# D25 is a DECISIONS entry that only notes the dedúcere row; say what it is.
raw = raw.replace('the psalter already rules it: D25, *guiar* is for guidance, *dedúcere* of a descent is *fazer descer*',
                  "the psalter already says so: the *dedúcere* row (D22, with D25's note) keeps *guiar* for guidance and makes *dedúcere* of a descent *fazer descer*")
raw = raw.replace('D25', "the *dedúcere* row's note (D25)")
d = json.loads(raw)
dec = {x['id']: x for x in d['decisions']}

# 2:2 super: the gate's minor, taken.
d['verses']['2:2'] = '{dilatatum} a minha boca {super} os meus inimigos: * porque me alegrei na vossa salvação.'
dec['dilatatum']['why'] = dec['dilatatum']['why'].replace(
    "*super* hostile → *contra*, as in Ps 34 (decision `superme`), so that *sobre* is not heard as 'about'.",
    "*super*: see decision `super`.")
d['decisions'].insert(d['decisions'].index(dec['dilatatum']) + 1, {
    'id': 'super', 'refs': ['2:2'], 'latin': 'super inimícos meos', 'kind': 'word',
    'why': ("v1 and v2 had *contra*, from 34:21 (*escancararam contra mim a sua boca*, the mockers). The gate Latinist (minor) "
            "found that it narrows *super* to hostility, where here it is the mouth opened wide in triumph *over* the enemies. "
            "He is right: this is the mother's triumph, not a mocker's attack, and the psalter keeps *sobre* with a mouth "
            "(21:14 *Abriram sobre mim a sua boca*) and with the enemies (58:12 *sobre os meus inimigos*). After *Dilatou-se a "
            "minha boca*, *sobre* is not heard as 'about'. Taken after the gate: one word, toward the Latin, as the gate asked."),
    'options': [
        {'label': 'sobre', 'forms': {'super': 'sobre'}, 'note': 'The gate Latinist; 21:14, 58:12.', 'from': 'latinist'},
        {'label': 'contra', 'forms': {'super': 'contra'}, 'note': 'v1–v2; = 34:21. Narrows to hostility.', 'from': 'draft'},
        {'label': 'acima de', 'forms': {'super': 'acima dos'}, 'note': "26:6's *acima dos meus inimigos* (a head raised); heavy with a mouth.", 'from': 'glossary'},
    ]})

d['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': ('Gate on v2. Reader: claude-opus-5-5, fresh context, with latin.json. Three minors, no majors; pointing correct in every '
             'verse. One taken (a single word), two held with reasons.'),
    'outcomes': [
        {'verse': '2:2', 'remark': 'super is over (triumph); contra narrows it to hostility; asks sobre os meus inimigos', 'outcome': 'taken',
         'decision': 'super', 'reason': '21:14 *sobre mim a sua boca*, 58:12 *sobre os meus inimigos*; the triumph is the sense.'},
        {'verse': '2:4', 'remark': 'loqui sublímia compressed into palavras altivas; asks o falar de coisas altivas (again, as v1)', 'outcome': 'option',
         'decision': 'sublimia',
         'reason': "Portuguese *multiplicar* takes no infinitive; one noun for verb and object is grammar (D2), MS1932's. His wording is option 2. *altivas* for *sublímia* beside *gloriántes* is the haughty talk the context means (L&S)."},
        {'verse': '2:7', 'remark': 'pánibus plural; asks por pães (again, as v1)', 'outcome': 'refused',
         'reason': 'D42 (settled): *panes → pão*, the idiom.'}]})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('gate recorded; status reviewed')
