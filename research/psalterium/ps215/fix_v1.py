"""One-off: v1 choices notes on the checks.py soft flags, and the checks audit step."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
c = d['choices']
c['45:18'] = c['45:18'].replace(
    " Second colon +4 syllables on the Latin with the draft's 'ele próprio a moldou'; accepted for the repeated ipse.",
    " Both cola end on an oxytone (céus, moldou), which the brief allows.")
c['45:21'] = ("Colon 2 is +4 syllables on the Latin (checks.py): the copula 'sou' and two relative 'que' are supplied for "
              "two participles (loquens, annúntians) Portuguese cannot keep as participles; 'o que é reto' adds one more "
              "(decision recta). Accepted.")
c['45:23'] = c['45:23'] + (" Colon 1 is +3 syllables on the Latin: 'os que levantam' for qui levant, and the genitive "
                           "sculptúræ made an adjective (decision lignum). Accepted.")
c['45:24'] = c['45:24'] + (" Colon 1's −3 is the Latin's long consiliámini against 'tomai conselho'.")
c['45:27'] = c['45:27'] + (" Colon 1 is −3 on the Latin (memetípso, egrediétur are long words). Colon 2 ends on an "
                           "oxytone, 'voltará'.")
c['45:30'] = c['45:30'] + (" Colon 2 is +4 on the Latin: 'descendência' for the one-syllable semen (D32) and the "
                           "article of 'toda a'. Accepted; no shorter word keeps D32. Colon 1 does not repeat 'será' "
                           "before 'louvada': the Latin repeats the verb form in two words (justificábitur, laudábitur), "
                           "Portuguese carries both on one auxiliary.")
d['audit'].append({
    'step': 'checks',
    'note': 'render.py and checks.py run with DO number 215 unchanged (no shared tool failed on the canticle). Hard checks '
            'pass: ids and pointing match the Latin. Soft flags: length +4 at 45:21b and 45:30b, +3 at 45:23a, −3 at '
            '45:24a and 45:27a; each explained in choices and accepted. Output in checks.md.',
})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
