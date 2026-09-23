"""Ps 214 draft 2 from draft 1 (prayed.v1.json) after the v1 readers. python3.13 research/psalterium/ps214/draft2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
p['version'] = 2
p['verses']['31:14'] = '{super}, * e {pecorum_prep} crias {pecorum}:'
dec = {d['id']: d for d in p['decisions']}


def promote(did, option, note_extra=None, new=None):
    opts = dec[did]['options']
    if new:
        opts.insert(0, new)
        return
    chosen = next(o for o in opts if o['label'] == option)
    opts.remove(chosen)
    if note_extra:
        chosen['note'] += ' ' + note_extra
    opts.insert(0, chosen)


# 31:11 — the stylist: the supplied verb echoes 'guardará'; the Latin's ellipsis kept
promote('pastor', None, new={
    'label': 'como o pastor o seu rebanho', 'forms': {'pastor': 'como o pastor o seu rebanho'},
    'note': "Draft 2, the stylist's line. The Latin's ellipsis is kept, with nothing supplied. It is shorter, and 'guardará … guarda' no longer chimes. The ambiguity reader heard the comparison correctly on draft 1, and 'o pastor' reads as the generic shepherd.",
    'from': 'stylist'})
dec['pastor']['options'][1]['note'] += ' Draft 1. The stylist heard the echo guardará / guarda as a jingle and the colon as +4.'

# 31:14 — the Latinist: super is 'for / on account of', not an apposition to 'aos bens'
promote('super', 'Pelo trigo, e pelo vinho, e pelo azeite',
        "Draft 2, taken from the Latinist (minor): 'ao' made the list define 'bona Dómini', which the Latin does not say. 'pelo' is the Portuguese 'for' of desire and cause ('lutar pelo pão'), and after 'afluirão aos bens do Senhor' the ear does not take it as 'through'. The polysyndeton stays. +3 syllables, accepted.")
dec['super']['options'][1]['note'] += ' Draft 1.'
dec['super']['why'] += " The v1 Latinist asked for 'pelo'."

# 31:14 — both readers: pecora / armenta are flock and herd, not two species
promote('pecorum', 'dos rebanhos e das manadas',
        "Draft 2. The Latinist (minor: 'ovelhas' and 'vacas' narrow both words to single species) and the stylist ('vacas' drops the register) both refused draft 1. This is the Latinist's pair. The stylist's 'e do gado' would name armenta with pecus's glossary word. Cost: 'rebanho' also renders gregem in 31:11.")
dec['pecorum']['options'][1]['note'] += ' Draft 1; refused by the Latinist and the stylist.'
dec['pecorum']['why'] += ' Draft 2 accepts that echo: both v1 readers heard ovelhas / vacas as narrower than the Latin, and vacas as too homely for the register.'
p['decisions'].append({
    'id': 'pecorum_prep', 'refs': ['31:14'], 'latin': 'et fœtu', 'kind': 'grammar',
    'why': "The second colon takes the preposition of the first ('super … et fœtu'): 'pelo … e pelas crias'.",
    'options': [
        {'label': 'pelas', 'forms': {'pecorum_prep': 'pelas'}, 'note': "Draft 2, with 'Pelo trigo'.", 'from': 'latinist'},
        {'label': 'às', 'forms': {'pecorum_prep': 'às'}, 'note': "Draft 1, with 'Ao trigo'.", 'from': 'draft'}]})

# 31:17 — both 'júbilo' and 'depois da' questioned; both kept, with the readers' proposals as options
dec['gaudium']['options'].insert(1, {'label': 'regozijo', 'forms': {'gaudium': 'regozijo'}, 'note': "The stylist (v1). The proparoxytone 'júbilo' leaves the mediant on an unstressed syllable. 'regozijo' is paroxytone and free, and the glossary row lists it as an option. Refused here only because 29:12 has the same build ('convértere … in gáudium' → 'em júbilo') and the row is open for a ruling. Evidence for that ruling: here the Latinist found 'júbilo' too loud and the stylist found its stress wrong.", 'from': 'stylist'})
dec['gaudium']['options'][2]['note'] += " The v1 Latinist's fix (minor: júbilo leans to jubilatio). Refused: it chimes with the two 'alegrar' of the verses around it, where the Latin changes root. The stylist named the same clash."
dec['adolore']['options'].insert(1, {'label': 'livres da sua dor', 'forms': {'adolore': 'livres da sua dor'}, 'note': "The v1 Latinist (minor: 'depois da' is purely temporal). Refused: 'livres' supplies a word and decides for 'away from', just as 'depois' decides for 'after'. DRB, the nearest witness, reads 'after'.", 'from': 'latinist'})
dec['adolore']['options'][2]['note'] += " The v1 stylist's fix (less chatty). Refused: it is just as temporal, and 'após' is post's word."

# 31:12 and 31:18 — stylist proposals kept as options
dec['potentioris']['options'][2]['note'] += " The v1 stylist asked for it (plainer, firmer cadence). Refused: 'forte' is fortis's word, and 'o mais forte' is just as open to a superlative hearing. The ambiguity reader heard 'mais poderoso' as a superlative; the comparative's option is 'de quem era mais poderoso'."
dec['v18a']['options'].append({'label': 'E a alma dos sacerdotes embriagarei de gordura', 'forms': {'v18a': 'E a alma dos sacerdotes embriagarei de gordura'}, 'note': "The v1 stylist, to avoid 'E em-'. Refused: an object-first inversion for the sake of one elision (rule 5: no inversion for its own sake). 'E embriagarei' elides naturally ('e‿embriagarei'), as 'e‿exultai'.", 'from': 'stylist'})

p['choices']['31:14'] = "óleum as food → azeite (4:8). fœtus (singular, collective) → 'as crias'. The ambiguity reader listed 'crias' as unknown; it is the plain rural word for young animals, kept. 'filhotes' is childish."
p['choices']['31:16'] += " The ambiguity reader heard 'a virgem' as possibly the Virgin Mary and 'em coro' as singing in chorus. That is the Latin's own openness in a Christian ear, and the dance reading is the option 'na dança'."
p['choices']['31:13'] += " 'afluirão' was listed as unknown by the ambiguity reader. It is kept: it is the CNBB's word in this very verse, and 'acorrerão' is the option."
p['choices']['31:11'] = p['choices']['31:11'] + " 'congregará' was listed as unknown by the ambiguity reader. It is the glossary's congregáre (146:2, same promise), kept."
p['audit'].extend([
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Two verses minor, no majors. Two remarks taken, two refused and kept as options.', 'outcomes': [
        {'verse': '31:14', 'remark': "super + abl. is 'for', not an apposition to 'aos bens'", 'outcome': 'taken'},
        {'verse': '31:14', 'remark': "'ovelhas' / 'vacas' narrow pecora / armenta", 'outcome': 'taken'},
        {'verse': '31:17', 'remark': "'depois da' makes a dolore purely temporal", 'outcome': 'option', 'decision': 'adolore', 'reason': "'livres' supplies a word and closes the other way; DRB reads 'after'."},
        {'verse': '31:17', 'remark': "'júbilo' louder than gaudium → 'alegria'", 'outcome': 'option', 'decision': 'gaudium', 'reason': "It chimes with the two 'alegrar' of different Latin root; the glossary row (29:12, same build) is open for a ruling."}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Six remarks; two taken (one of them met by the Latinist fix), four kept as options. Best line 31:15, worst 31:17.', 'outcomes': [
        {'verse': '31:11', 'remark': "'guardará … guarda' jingles; keep the ellipsis", 'outcome': 'taken'},
        {'verse': '31:12', 'remark': "'do mais poderoso' slow → 'do mais forte'", 'outcome': 'option', 'decision': 'potentioris', 'reason': "'forte' is fortis's word; potens → poderoso is the glossary row."},
        {'verse': '31:14', 'remark': "'vacas' homely → 'dos rebanhos e do gado'", 'outcome': 'taken', 'reason': "Taken as the Latinist's 'rebanhos e manadas'; 'gado' is pecus's glossary word."},
        {'verse': '31:17', 'remark': "proparoxytone 'júbilo' at the mediant → 'regozijo'", 'outcome': 'option', 'decision': 'gaudium', 'reason': "29:12 has the same Latin build as 'em júbilo'; the glossary row decides both at once."},
        {'verse': '31:17', 'remark': "'depois da' flat → 'após'", 'outcome': 'option', 'decision': 'adolore', 'reason': "Just as temporal, and 'após' is post's word."},
        {'verse': '31:18', 'remark': "'E em-' stalls → object first", 'outcome': 'option', 'decision': 'v18a', 'reason': 'An inversion for its own sake (rule 5); the elision is natural.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': "claude-opus-5-5, fresh context, Portuguese only. Fifteen items. Most are the Latin's own openness heard correctly: the islands, 'guardará', who comes, 'os bens', 'alma', the unannounced first person of 31:17, 'embriagar de gordura'. Actionable: 31:12 'do mais poderoso' was heard as a superlative (option kept, see potentioris); 31:16 'em coro' was heard as singing and 'a virgem' possibly as Mary (the glossary word is kept; 'na dança' is the option). Unknown: afluirão, crias, congregará, all kept (see choices).", 'outcomes': [
        {'verse': '31:12', 'remark': 'mais poderoso heard as superlative', 'outcome': 'option', 'decision': 'potentioris', 'reason': "The comparative with the Latin's two parties is recoverable, and 'de quem era mais poderoso' supplies a clause."},
        {'verse': '31:16', 'remark': "'em coro' heard as singing only; 'virgem' possibly Mary", 'outcome': 'option', 'decision': 'choro', 'reason': "The glossary's word for the same Latin (149:3); 'na dança' is the option for Gustavo."},
        {'verse': '31:13', 'remark': "unknown 'afluirão'", 'outcome': 'refused', 'reason': "It is the CNBB's word in this verse; 'acorrerão' is the option."},
        {'verse': '31:14', 'remark': "unknown 'crias'", 'outcome': 'refused', 'reason': 'The plain word for young animals; no plainer word keeps the sense.'},
        {'verse': '31:11', 'remark': "unknown 'congregará'", 'outcome': 'refused', 'reason': 'Glossary congregáre (146:2).'}]},
    {'step': 'revision', 'version': 2, 'note': "v2: 31:11 'como o pastor o seu rebanho' (stylist); 31:14 'Pelo trigo, e pelo vinho, e pelo azeite, * e pelas crias dos rebanhos e das manadas' (Latinist). Draft 1 kept as prayed.v1.json / prayed.v1.vos.json. 31:14 changed materially, so the Latinist gate is re-run as critic/v2.latinist.json."}])
(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding='utf-8')
