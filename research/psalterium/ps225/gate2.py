"""Record the v2 Latinist gate in ps225/prayed.json and mark it reviewed.
python3.13 research/psalterium/ps225/gate2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
p = json.loads(path.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in p['audit']):
    raise SystemExit('already recorded')
dec = {d['id']: d for d in p['decisions']}
dec['sicut']['options'].append({'label': 'é como a', 'forms': {'sicut': 'é como a'}, 'note': 'The v2 Latinist: the present copula leaves the time as open as the verbless Latin.', 'from': 'latinist'})
dec['saeculi']['options'].append({'label': 'do século', 'forms': {'saeculi': 'do século'}, 'note': "The v2 Latinist: *sǽculi* is singular. Heard as 'of the century'.", 'from': 'latinist'})
p['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': 'Gate on v2. Reader: claude-opus-5-5, fresh context, with latin.json. Four minors, no majors; pointing correct. All four held, with reasons; two new options recorded.',
    'outcomes': [
        {'verse': '3:6b', 'remark': 'sǽculi is singular; dos séculos pluralizes; asks do século', 'outcome': 'option', 'decision': 'saeculi', 'reason': "*Os montes do século* is heard as 'the mountains of the century'; the plural is how Portuguese says the age (*pelos séculos*). He grants the sense is kept. Option 3 in `saeculi`."},
        {'verse': '3:10b', 'remark': 'fez ouvir paraphrases dedit; asks deu a sua voz', 'outcome': 'refused', 'reason': 'The glossary row *vocem dare → fazer ouvir a voz* (17:14, 45:7, 76:18); *deu a sua voz* is not said. The v1 Latinist asked the same.'},
        {'verse': '3:14b', 'remark': 'era fixes a past the verbless Latin leaves open; asks é', 'outcome': 'option', 'decision': 'sicut', 'reason': "He allows the copula. *Era* follows the enemies' *vinham* in the same strophe, as DRB and MS1932; *é* would turn the line into a maxim. Held for Gustavo, *é como a* recorded as an option."},
        {'verse': '3:19a', 'remark': 'cervórum is masculine; corças follows the Hebrew; asks dos cervos', 'outcome': 'refused', 'reason': 'As at v1: the glossary row *cervus* (17:34 the same phrase, the *servos* homophone; 28:9 held against a major). Option in `ponet`.'},
    ],
})
p['status'] = 'reviewed'
path.write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('gate recorded; status reviewed')
