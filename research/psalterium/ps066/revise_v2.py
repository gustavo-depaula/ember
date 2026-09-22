"""Ps 66 draft 2 from the v1 readers (claude-opus-5-5, fresh context). Run once: python3.13 research/psalterium/ps066/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
dec = {x['id']: x for x in d['decisions']}

# 66:7b first colon: subject first (stylist) — option 1 becomes the ruling.
o7 = dec['order7']
o7['options'] = [o7['options'][1], o7['options'][0]]
o7['options'][0]['note'] = 'Ruling (v2); the stylist\'s: subject first, the proclitic *nos* of 66:2, and no imperative hearing.'
o7['options'][0]['from'] = 'stylist'
o7['options'][1]['note'] = 'Draft 1; the Latin\'s order; MS1932\'s build. The stylist heard it as translated and *-nos Deus* twice as heavy.'
o7['why'] += (' **v2:** the stylist marked this the worst line: an enclitic opening sounds translated, *-nos Deus* twice in one breath is heavy, and 66:2 already says *e nos bendiga* proclitic, so the psalm\'s own echo breaks. '
              'Only order changes (D2): the verb, the threefold *Deus* and the repetition stay. Taken. The *benedicere* slots b7a/b7b now live only in the Latin-order option; the ruling spells *bendiga* out, and the *abençoe* option of `benedicere` covers 66:2 only — to switch the verb here as well pick the Latin-order option or edit the form.')
# keep the verb decision reaching 66:7b: route the ruling through a slot
o7['options'][0]['forms'] = {'order7': 'Deus {b7p}, o nosso Deus, Deus {b7p}'}
for opt, form in zip(dec['benedicere']['options'], ['nos bendiga', 'nos abençoe']):
    opt['forms']['b7p'] = form
o7['why'] = o7['why'].replace(' The *benedicere* slots b7a/b7b now live only in the Latin-order option; the ruling spells *bendiga* out, and the *abençoe* option of `benedicere` covers 66:2 only — to switch the verb here as well pick the Latin-order option or edit the form.', ' The verb stays in the `benedicere` decision (slot b7p for the subject-first forms).')

# 66:7b second colon: *e que o temam* (stylist; the ambiguity reader heard *o* as the article).
m = dec['metuant']
m['options'].insert(0, {'label': 'e que o temam', 'forms': {'metuant': 'e que o temam'}, 'note': 'Ruling (v2); the stylist\'s; *que* marks the jussive and *o* is heard as the pronoun.', 'from': 'stylist'})
m['options'][1]['note'] = 'Draft 1; proclisis after *e*. The ambiguity reader heard *o* possibly as the article; the stylist heard the hiatus *e o* blur.'
m['why'] += ' **v2:** the stylist asked for *e que o temam* (the jussive wants *que* in Brazilian speech; *e o* blurs), and the ambiguity reader listed *o* as possibly heard as the article. *que* is a supplied conjunction, grammar (D2), the same device as 66:4; taken. The colon still reads alone as the responsory (*E que o temam todos os confins da terra*).'

# 66:4 / 66:6: the Latinist's *louvem* refused (D5); the stylist's *ó Deus* refused (the Deus vocative row). Both kept as options.
c = dec['confiteantur']
c['options'].append({'label': 'Que os povos vos louvem', 'forms': {'c4a': 'Que os povos vos louvem', 'c4b': 'que todos os povos vos louvem', 'c6a': 'Que os povos vos louvem', 'c6b': 'que todos os povos vos louvem'}, 'note': 'the Latinist (minor, both verses): *confitéri* is broader than thanks. Refused under D5: *louvar* is *laudáre*\'s, and the two stand in one verse elsewhere (34:18, 108:30).', 'from': 'latinist'})
c['why'] += ' **v2:** the Latinist (minor) asked *louvem*, as broader than thanks; refused under D5 (settled; the collision with *laudáre*), kept as option 4.'
d['decisions'].append({
    'id': 'vocDeus', 'refs': ['66:4', '66:6'], 'latin': 'pópuli, Deus', 'kind': 'glossary',
    'why': 'The stylist heard the bare vocative *Deus* as clipped, at the mediant of 66:4 and mid-colon in 66:6 (*graças, Deus, que* read as a list), and asked *ó Deus*. The *Deus (vocative)* row keeps it bare unless the Latin has *o* (50:3a, 53:3–4, 5:11a, 42:5), and the Latin has none here; the psalm is not the place to break a psalter-wide row. Kept bare; *ó Deus* is one touch away and the row\'s note gains this place.',
    'options': [
        {'label': 'Deus', 'forms': {'v4': 'Deus', 'v6': 'Deus'}, 'note': 'Ruling; the row.', 'from': 'glossary'},
        {'label': 'ó Deus', 'forms': {'v4': 'ó Deus', 'v6': 'ó Deus'}, 'note': 'the stylist; MS1932 *ó Deus*.', 'from': 'stylist'},
    ]})
d['verses']['66:4'] = '{c4a}, {v4}: * {c4b}.'
d['verses']['66:6'] = '{c6a}, {v6}, {c6b}: * a terra deu o seu fruto.'
d['choices']['66:7b'] = '*Deus, Deus noster* → *Deus, o nosso Deus* (the apposition takes the article, as possessives do). Both cola read alone (the blessing, the responsory). *métuere* (only here) → *temer* by D15\'s test (φοβέομαι, as *timére*).'
d['choices']['66:3'] += ' v2: the ambiguity reader heard the second colon three ways (a second object of *conheçamos*; a verbless wish; the nations as knowers) — the Latin is as open, and the likeliest hearing is the right one; kept.'
d['choices']['66:6'] += ' v2: the ambiguity reader heard *a terra deu o seu fruto* as a reason for the thanks or as a separate statement — the Latin joins it with no conjunction; kept.'

d['audit'].extend([
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5 (fresh context, read latin.json). 2 minor, one point: *confiteántur* as *louvem* (66:4, 66:6). Refused under D5; option. Tenses, jussives, *ilumine o seu rosto*, the pointing all passed.',
     'outcomes': [
         {'verse': '66:4', 'remark': 'deem graças narrows confitéri; louvem', 'outcome': 'option', 'decision': 'confiteantur', 'reason': 'D5 settled: louvar is laudáre\'s (they meet in 34:18, 108:30).'},
         {'verse': '66:6', 'remark': 'same as 66:4', 'outcome': 'option', 'decision': 'confiteantur', 'reason': 'D5, as 66:4.'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5 (fresh context, read latin.json). 4 remarks; 2 taken (66:7b order, *e que o temam*), 2 refused as options (bare vocative *Deus*, the row). Worst line 66:7b, best 66:3.',
     'outcomes': [
         {'verse': '66:4', 'remark': 'bare vocative Deus clipped; ó Deus', 'outcome': 'option', 'decision': 'vocDeus', 'reason': 'the Deus (vocative) row: bare unless the Latin has o.'},
         {'verse': '66:6', 'remark': 'bare vocative mid-colon reads as a list; ó Deus', 'outcome': 'option', 'decision': 'vocDeus', 'reason': 'the row, as 66:4; the two verses must stay identical.'},
         {'verse': '66:7b', 'remark': 'enclitic Bendiga-nos opening translated, heavy; Deus nos bendiga', 'outcome': 'taken', 'decision': 'order7'},
         {'verse': '66:7b', 'remark': 'e o temam blurs, jussive wants que; e que o temam', 'outcome': 'taken', 'decision': 'metuant'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5 (fresh context, Portuguese only). 8 ambiguities, every likeliest hearing right; *o* in *e o temam* possibly heard as the article (mended with the stylist\'s *e que o temam*). Unknown: *equidade*, *exultem*, *confins* — all glossary rows that have met this before; kept.',
     'outcomes': [
         {'verse': '66:2', 'remark': 'ilumine o seu rosto: seu as your; lighting up his face', 'outcome': 'refused', 'reason': 'likeliest hearing right; the illumináre row.'},
         {'verse': '66:3', 'remark': 'person switch seu → vosso', 'outcome': 'refused', 'reason': 'the Latin switches (suum → tuam).'},
         {'verse': '66:3', 'remark': 'na terra: where we are / where the way is', 'outcome': 'refused', 'reason': 'the Latin is as open.'},
         {'verse': '66:3', 'remark': 'second colon: object / verbless wish / nations as knowers', 'outcome': 'refused', 'reason': 'the Latin is verbless too; likeliest hearing right.'},
         {'verse': '66:5', 'remark': 'subject of julgais', 'outcome': 'refused', 'reason': 'likeliest hearing right.'},
         {'verse': '66:5', 'remark': 'dirigis as address speech', 'outcome': 'refused', 'reason': 'likeliest hearing right; the dirígere row.'},
         {'verse': '66:6', 'remark': 'fruit as reason or statement; seu as God\'s', 'outcome': 'refused', 'reason': 'the Latin is asyndetic; likeliest hearing right.'},
         {'verse': '66:7b', 'remark': 'o heard as article', 'outcome': 'taken', 'decision': 'metuant'},
         {'verse': '66:5', 'remark': 'unknown: equidade, exultem', 'outcome': 'refused', 'reason': 'the ǽquitas and exsultáre rows keep them after earlier readers did not know them.'},
         {'verse': '66:7b', 'remark': 'unknown: confins', 'outcome': 'refused', 'reason': 'the fines row; 21:28, 47:11.'}]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 66:7b first colon subject first (*Deus nos bendiga, o nosso Deus, Deus nos bendiga*), second colon *e que o temam*; vocative kept bare as a new decision `vocDeus`; *louvem* added as an option. Draft 1 kept as prayed.v1.json.'},
])
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
