import json

path = '/Users/gustavo/Documents/prayer/.claude/worktrees/parallel-prancing-avalanche/research/psalterium/ps054/prayed.json'
d = json.load(open(path))
d['status'] = 'reviewed'
dec = {x['id']: x for x in d['decisions']}
opts = dec['unanimis']['options']
for o in opts:
    if o['label'] == 'unânime':
        o['note'] += ' The v2 Latinist asked *homem unânime*.'
opts = dec['fluctuatio']['options']
opts.append({'label': 'não dará para sempre ao justo a vacilação',
             'forms': {'fluctuatio': 'não dará para sempre ao justo a vacilação'},
             'note': 'The v2 Latinist; dare and the noun kept. *vacilação* is abstract and heavy at the close.',
             'from': 'latinist'})
d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': 'Gate, claude-opus-5-5 (fresh context). No critical or major; four minors, each on a wording weighed before; all held, each wording he asks for is an option. He passed the v2 changes at 54:4, 54:11, 54:12, 54:20b and the pointing.',
    'outcomes': [
        {'verse': '54:10', 'remark': '*-os* supplies an object; *Precipitai, Senhor, dividi as suas línguas*', 'outcome': 'refused', 'decision': 'praecipita',
         'reason': 'bare *Precipitai* is heard as "hasten"; and bare *dividi* is banned (rule 3 / D13: also "I divided"). Both are options.'},
        {'verse': '54:14', 'remark': '*comigo* glosses unánimis; *homem unânime*', 'outcome': 'refused', 'decision': 'unanimis',
         'reason': '*unânime* is said of groups in Portuguese; bare *de uma só alma* was heard as "single-souled" by two v1 readers. ἰσόψυχε is equal to someone. Options 2 and 3.'},
        {'verse': '54:15', 'remark': 'perfect as imperfect; *andamos*', 'outcome': 'refused', 'decision': 'ambulavimus',
         'reason': 'as at v1: *andamos* is heard as present and says the friendship stands. He himself calls the imperfect defensible.'},
        {'verse': '54:23', 'remark': 'noun and dative lost; *não dará para sempre ao justo a vacilação*', 'outcome': 'refused', 'decision': 'fluctuatio',
         'reason': 'dare + noun as "allow" is grammar (the glossary row dare + inf. → deixar); *vacilação* is heavy and not sayable; *vacilar* keeps the root. Option.'}
    ]})
d['audit'].append({'step': 'glossary', 'note': 'Rows appended to glossary.md (open, Ps 54): exercitátio, contéxere, solitúdo, pusillanímitas, maledícere, unánimis, notus, consénsus, contamináre, jáculum, fluctuátio, dimidiáre, dedúcere down, commutátio (54:20b), declináre in (54:4 departs). PROGRESS.md row added.'})
json.dump(d, open(path, 'w'), ensure_ascii=False, indent=2)
print('ok')
