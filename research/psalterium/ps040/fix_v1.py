"""One-off fixes to the v1 slots of ps040/prayed.json (before any reader)."""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
v = d['verses']
v['40:2'] = 'Bem-aventurado o que {intellegit} e o pobre: * no dia mau o livrará o Senhor.'
v['40:3'] = 'O Senhor o conserve, e {vivificet}, e o faça bem-aventurado na terra: * e não o entregue {inanimam} dos seus inimigos.'
v['40:8'] = 'Contra mim {susurrabant} todos os meus inimigos: * contra mim pensavam em {mihi8}.'
v['40:14'] = 'Bendito o Senhor, Deus de Israel, {asaeculo}: * {fiat}.'
dec = {x['id']: x for x in d['decisions']}
f = dec['intellegit']['options']
f[0]['forms'] = {'intellegit': 'entende o necessitado'}
f[1]['forms'] = {'intellegit': 'atenta para o necessitado'}
f[2]['forms'] = {'intellegit': 'cuida do necessitado'}
f[2]['note'] = 'MS1932; says what the Latin does not (care).'
f = dec['vivificet']['options']
f[0]['forms'] = {'vivificet': 'o vivifique'}
f[1]['forms'] = {'vivificet': 'lhe dê vida'}
f[1]['note'] = "MS1932, DRB 'give him life'; the row's option."
dec['versasti']['options'] = dec['versasti']['options'][:2]
dec['versasti']['why'] += ' The Latin puts the bed first (*univérsum stratum ejus versásti*); the verb first is natural order (D2).'
f = dec['mihi8']['options']
f[0]['forms'] = {'mihi8': 'males para mim'}
f[1]['forms'] = {'mihi8': 'males'}
f[1]['note'] = "DRB 'they devised evils to me' keeps it; MS1932 drops *advérsum me* instead."
f = dec['asaeculo']['options']
f[0]['forms'] = {'asaeculo': 'desde sempre e para todo o sempre'}
f[1]['forms'] = {'asaeculo': 'de eternidade em eternidade'}
f[1]['note'] = "DRB 'from eternity to eternity'; *eternidade* is not the Latin's word, and it drops D37's form."
f.append({'label': 'desde sempre e para sempre', 'forms': {'asaeculo': 'desde sempre e para sempre'}, 'note': 'D23 without D37 — *usque* unsaid.', 'from': 'glossary'})
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
