from pathlib import Path
p = Path('research/psalterium/ps113/tools/build_v1.py')
s = p.read_text(encoding='utf-8')
reps = [
 (" This line is the psalm's incipit and its antiphon in the Sunday Vespers of Paschaltide ('In éxitu Israël de Ægýpto, domus Jacob de pópulo bárbaro, allelúja' — unverified here); it must read alone.", " This line is the psalm's incipit and must read alone."),
 ("DRB 'sanctuary', MS1932 'o seu santuário'.", "DRB 'sanctuary'; MS1932 paraphrases ('Deus consagrou ao seu serviço o povo de Judá')."),
 ("\"The Greek's possible concrete sense, MS1932's and DRB's word. Resolves the abstract.\", 'MS1932'", "\"The Greek's possible concrete sense, DRB's word. Resolves the abstract.\", 'DRB'"),
 ("MS1932 'o seu domínio'; DRB 'his dominion'.", "DRB 'his dominion'; MS1932 paraphrases ('estabeleceu em Israel o seu império'), also a realm."),
 ("'Ruling: the Greek ἐξουσία, with MS1932 and DRB.', 'MS1932'", "'Ruling: the Greek ἐξουσία, with DRB.', 'DRB'"),
 ("the only place in the psalter the Septuagint uses it (four hits in the whole LXX: Gen 25:22, Wis 17:19, Mal 4:2 / 3:20, and here twice)", "the only place in the psalter the Septuagint uses it (the LXX's other uses, from consult/lxx-text_accented.csv: Gen 25:22, Wis 17:18, Wis 19:9 'leaped like lambs', Joel 1:17, Mal 3:20, Jer 27:11 — leaping, mostly of young animals)"),
 ("DRB 'skipped', MS1932 'saltaram'; DM1962 (Hebrew) has the same verb of leaping.", "DRB 'skipped'; MS1932 'saltaram (de alegria)', adding the joy; DM1962 (Hebrew) 'pularam'."),
 ("with MS1932 and DRB. 'saltastes' is not a first-person homograph.\", 'MS1932'", "with DRB and MS1932's verb. 'saltastes' is not a first-person homograph.\", 'DRB'"),
 ("MS1932 'a pedra' flattens it.", "MS1932 takes 'pedras' for petra and 'rocha' for rupes; DRB 'stony hill'."),
 ("MS1932 'grandes' agree", "MS1932 'os pequenos e os grandes' agree"),
 ("'Pela vossa misericórdia e pela vossa verdade'}, 'Ruling: plain ground, the Latin pair repeated.')", "'Pela vossa misericórdia e pela vossa verdade'}, 'Ruling: plain ground, the Latin pair repeated. (MS1932 paraphrases with a purpose clause.)')"),
 ("'Os mortos não vos louvarão' (MS1932, DRB 'The dead shall not praise thee')", "'Os mortos não vos louvarão' (MS1932 'Os mortos, Senhor, não te louvarão'; DRB 'The dead shall not praise thee')"),
 ("'nem quantos' says 'none of them' without that risk.", "DRB 'nor any of them'. 'nem quantos' says 'none of them' without that risk; MS1932 'nem os que' drops omnes."),
 ("\"nares → nariz (the singular is the Portuguese body noun; 'narinas' is anatomical). aures → ouvidos.\"", "\"nares → nariz, DM1962's word (the singular is the Portuguese body noun; MS1932 'narizes'; 'narinas' is anatomical). aures → ouvidos.\""),
]
for a, b in reps:
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b)
p.write_text(s, encoding='utf-8')
print('ok')
