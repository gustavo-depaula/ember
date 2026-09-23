from pathlib import Path
p = Path('research/psalterium/ps113/tools/build_v1.py')
s = p.read_text(encoding='utf-8')
reps = [
 ("'O céu do céu é do Senhor: * a terra, porém, ele a deu aos filhos dos homens.'", "'O céu do céu é do Senhor: * a terra, porém, deu-a aos filhos dos homens.'"),
 ("'ele a deu' names the subject and takes up 'a terra' with the pronoun, since the Latin fronts terram.", "'deu-a' takes up the fronted 'a terra' with the pronoun (the Latin fronts terram; Portuguese needs the resumptive), as MS1932 'mas a terra deu-a'."),
 ("""        'note': "Draft 1 from the parallels""", """        'note': "Draft 1 (Claude Opus) from the parallels"""),
]
for a, b in reps:
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b)
s = s.replace("""    },
]

data = {""", """    },
    {
        'step': 'checks',
        'note': "Hard checks pass. Soft flags accepted: 113:4 and 113:6 second colon +4/+3 ('cordeiros das ovelhas', the Latin genitive and 64:14's wording); 113:5 −3 and 113:11 −3, 113:13 −3, 113:15 † −3 (Portuguese is shorter than the Latin's futures and 'quia convérsus es'; not padded); 113:26 +3 (the formula of 112:2 and D37). Rhymes accepted as the Latin's own echoes: 113:8 'água … água' (aquárum … aquárum); 113:13–15 the '-ão' futures (the Latin's -bunt / -ent, decision futures); 113:16–19 '-eles' (eis, then eórum … eórum in the refrain). 113:24 shortened from 'ele a deu' (+4) to 'deu-a'.",
    },
]

data = {""", 1)
p.write_text(s, encoding='utf-8')
print('ok')
