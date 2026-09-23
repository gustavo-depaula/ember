"""Build ps210/prayed.json, draft 1 (the Benedicite, DO Psalm 210 = Dan 3:57-88, 56).

The litany has 32 cola of the shape *Benedícite, X, Dómino*; the word-order decision `order` owns one slot per colon,
so it is generated here rather than written by hand.
python3.13 research/psalterium/ps210/build_v1.py
"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent

# (verse, colon index, vocative) for every "Benedícite, X, Dómino" colon, in file order
litany = [
    ('3:57', 0, 'todas as obras do Senhor'),
    ('3:58', 0, 'anjos do Senhor'), ('3:58', 1, 'céus'),
    ('3:59', 0, 'todas as águas acima dos céus'), ('3:59', 1, 'todos os poderes do Senhor'),
    ('3:60', 0, 'sol e lua'), ('3:60', 1, 'estrelas do céu'),
    ('3:61', 0, 'toda chuva e orvalho'), ('3:61', 1, 'todos os {spiritus} de Deus'),
    ('3:62', 0, 'fogo e calor'), ('3:62', 1, 'frio e {aestus}'),
    ('3:63', 0, 'orvalhos e geada'), ('3:63', 1, '{gelu} e frio'),
    ('3:64', 0, '{glacies} e neves'), ('3:64', 1, 'noites e dias'),
    ('3:65', 0, 'luz e trevas'), ('3:65', 1, 'relâmpagos e nuvens'),
    ('3:67', 0, 'montes e colinas'), ('3:67', 1, 'tudo o que germina na terra'),
    ('3:68', 0, 'fontes'), ('3:68', 1, 'mares e rios'),
    ('3:69', 0, '{cete}, e tudo o que se move nas águas'), ('3:69', 1, 'todas as aves do céu'),
    ('3:70', 0, 'todas as feras e {pecora}'), ('3:70', 1, 'filhos dos homens'),
    ('3:72', 0, 'sacerdotes do Senhor'), ('3:72', 1, 'servos do Senhor'),
    ('3:73', 0, 'espíritos, e almas dos justos'), ('3:73', 1, 'santos, e humildes de coração'),
    ('3:74', 0, 'Ananias, Azarias, Misael'),
]


def cap(text):
    return text[0].upper() + text[1:]


slots = {}
for vid, index, voc in litany:
    slots[f"o{vid.split(':')[1]}{'ab'[index]}"] = (vid, index, voc)

orderOptions = [
    ('Bendizei, X, ao Senhor', lambda v, i: f'{"Bendizei" if i == 0 else "bendizei"}, {v}, ao Senhor',
     "Draft. The Latin's own order, verb — vocative — dative, so that every colon opens on the imperative and closes on *ao Senhor* as the Latin opens on *Benedícite* and closes on *Dómino*. It is the build this psalter already has for the same Latin shape: 102:1 *Bénedic, ánima mea, Dómino* → *Bendize, ó minha alma, ao Senhor* (glossary formula, copied at 102:2, 102:22, 103:1, 103:35), and the dative keeps the *benedícere* row's *ao*. Cost: in the long cola (3:59, 3:67, 3:69) the object waits behind a long vocative — the Latin's own wait.",
     'draft'),
    ('X, bendizei o Senhor', lambda v, i: f'{cap(v) if i == 0 else v}, bendizei o Senhor',
     "The order the Brazilian ear knows: the CNBB Liturgia das Horas and the Lectionary say *Obras do Senhor, bendizei o Senhor … Sol e lua, bendizei o Senhor* (fetched, `circulation.md`). Natural Portuguese order (D2 lets order bend), and the vocative stands first as in a litany. Costs: the imperative no longer heads each colon beside the Latin's *Benedícite*, and the dative becomes a direct object.",
     'CNBB'),
    ('Bendizei ao Senhor, X', lambda v, i: f'{"Bendizei" if i == 0 else "bendizei"} ao Senhor, {v}',
     "The Diurnal Monástico 1962's order (*Bendizei ao Senhor, sol e lua*), as 102:20 *Benedícite Dómino, omnes Ángeli ejus* → *Bendizei ao Senhor, todos os seus anjos*. But there the Latin itself puts *Dómino* first; here it puts it last, and the cadence would fall on the creature instead of on the Lord at every colon.",
     'DM1962'),
]

colonText = {}
for sid, (vid, index, voc) in slots.items():
    colonText.setdefault(vid, {})[index] = '{' + sid + '}'

verses = {
    '3:57': '{o57a}: * louvai-o e {sx57} pelos séculos.',
    '3:58': '{o58a}: * {o58b}.',
    '3:59': '{o59a}: * {o59b}.',
    '3:60': '{o60a}: * {o60b}.',
    '3:61': '{o61a}: * {o61b}.',
    '3:62': '{o62a}: * {o62b}.',
    '3:63': '{o63a}: * {o63b}.',
    '3:64': '{o64a}: * {o64b}.',
    '3:65': '{o65a}: * {o65b}.',
    '3:66': '{jus66}: * louve-o e {sx66} pelos séculos.',
    '3:67': '{o67a}: * {o67b}.',
    '3:68': '{o68a}: * {o68b}.',
    '3:69': '{o69a}: * {o69b}.',
    '3:70': '{o70a}: * {o70b}.',
    '3:71': '{jus71}: * louve-o e {sx71} pelos séculos.',
    '3:72': '{o72a}: * {o72b}.',
    '3:73': '{o73a}: * {o73b}.',
    '3:74': '{o74a}: * louvai-o e {sx74} pelos séculos.',
    '3:75': '(Faz-se reverência:) Bendigamos o Pai e o Filho {cum} o Espírito Santo: * louvemo-lo e {sx75} pelos séculos.',
    '3:56': 'Bendito sois, Senhor, no firmamento do céu: * e digno de louvor, e glorioso, e {sx56} pelos séculos.',
}

decisions = []

decisions.append({
    'id': 'order', 'refs': sorted({vid for vid, _, _ in litany}, key=lambda v: int(v.split(':')[1])),
    'latin': 'Benedícite, X, Dómino (32 cola)', 'kind': 'order',
    'why': "Thirty of the canticle's cola are one sentence with a different vocative: *Benedícite, sol et luna, Dómino*. Where the vocative goes decides how the whole canticle sounds. The Latin puts the verb first and *Dómino* last; the CNBB (Liturgia das Horas and Lectionary) puts the creature first; the Diurnal Monástico 1962 puts *ao Senhor* right after the verb. One decision fills every colon at once.",
    'options': [
        {'label': label, 'forms': {sid: build(voc, index) for sid, (vid, index, voc) in slots.items()}, 'note': note, 'from': source}
        for label, build, note, source in orderOptions
    ],
})

sxForms = {
    'sumamente': {'sx57': 'exaltai-o sumamente', 'sx66': 'exalte-o sumamente', 'sx71': 'exalte-o sumamente', 'sx74': 'exaltai-o sumamente', 'sx75': 'exaltemo-lo sumamente', 'sx56': 'sumamente exaltado'},
    'muito': {'sx57': 'exaltai-o muito', 'sx66': 'exalte-o muito', 'sx71': 'exalte-o muito', 'sx74': 'exaltai-o muito', 'sx75': 'exaltemo-lo muito', 'sx56': 'muito exaltado'},
    'plain': {'sx57': 'exaltai-o', 'sx66': 'exalte-o', 'sx71': 'exalte-o', 'sx74': 'exaltai-o', 'sx75': 'exaltemo-lo', 'sx56': 'exaltado'},
    'acima': {'sx57': 'exaltai-o acima de tudo', 'sx66': 'exalte-o acima de tudo', 'sx71': 'exalte-o acima de tudo', 'sx74': 'exaltai-o acima de tudo', 'sx75': 'exaltemo-lo acima de tudo', 'sx56': 'exaltado acima de tudo'},
}
decisions.append({
    'id': 'superexaltare', 'refs': ['3:57', '3:66', '3:71', '3:74', '3:75', '3:56'],
    'latin': 'superexaltáte / superexáltet / superexaltémus / superexaltátus', 'kind': 'glossary',
    'why': "The refrain's verb is a compound, ὑπερυψόω, 'exalt above measure'. The glossary row *superexaltáre* is `open` with one place, 36:35 *Vi o ímpio muito exaltado* (the wicked lifted up), where *sumamente* was refused as bookish. Here it is said six times, always of God. The CNBB refrain *louvai-o e exaltai-o pelos séculos sem fim* (fetched) drops the *super-*.",
    'options': [
        {'label': 'sumamente', 'forms': sxForms['sumamente'], 'note': "Draft. 'In the highest degree' — the prefix's sense, said of God. *Sumamente* is a word the Brazilian Catholic ear already says of God: the Ato de Contrição, *por serdes vós quem sois, sumamente bom* (fetched, `circulation.md`). It adds three syllables to a refrain that has room (the Latin colon is 16). Known risk: at 36:35 (of the wicked) *sumamente exaltado* was bookish to the stylist and unknown to the blind reader, and *muito* replaced it; it is tried again here because here it is said of God, where the Brazilian ear has it from the Ato de Contrição. If the readers refuse it again, *muito* (rule 6) is the retreat.", 'from': 'draft'},
        {'label': 'muito', 'forms': sxForms['muito'], 'note': "36:35's word, one rendering for the Latin verb (rule 6). Plain, but *exaltai-o muito* is flat in a refrain said six times, and *muito* is the psalter's word for *valde* and *nimis*.", 'from': 'glossary'},
        {'label': 'exaltai-o (prefix dropped)', 'forms': sxForms['plain'], 'note': "The CNBB Liturgia das Horas and Lectionary refrain, the one Brazilians sing (*louvai-o e exaltai-o pelos séculos sem fim*), and DM1962 (*louvai-O e exaltai-O para sempre*). Loses the Latin's *super-* (rule 2 keeps the Latin's words).", 'from': 'CNBB'},
        {'label': 'acima de tudo', 'forms': sxForms['acima'], 'note': "Reads the prefix spatially, 'above all'. Plain, but after an imperative *acima de tudo* is heard first as 'above all, most importantly'.", 'from': 'draft'},
    ],
})

decisions.append({
    'id': 'jussive', 'refs': ['3:66', '3:71'],
    'latin': 'Benedícat terra Dóminum · Benedícat Israël Dóminum', 'kind': 'order',
    'why': "Twice the litany turns to the third person, and the Latin changes case with it: *Dóminum* (accusative) where all the others are *Dómino*. Kept in the verb row's way (accusative → *bendizer o Senhor*). But with the Latin's order, *Bendiga a terra o Senhor* can be heard as 'may the Lord bless the earth' — the subject and object are both bare nouns. The subject is moved in front (order is grammar, D2).",
    'options': [
        {'label': 'A terra bendiga o Senhor', 'forms': {'jus66': 'A terra bendiga o Senhor', 'jus71': 'Israel bendiga o Senhor'}, 'note': 'Draft. The accusative kept, the misparse removed by order. The verb is still the first word of the next colon (*louve-o*).', 'from': 'draft'},
        {'label': 'Bendiga a terra ao Senhor', 'forms': {'jus66': 'Bendiga a terra ao Senhor', 'jus71': 'Bendiga Israel ao Senhor'}, 'note': "DM1962's wording. The Latin's order kept, and *ao* removes the misparse — at the price of the Latin's change of case, which is audible only in the Latin.", 'from': 'DM1962'},
        {'label': 'Bendiga a terra o Senhor', 'forms': {'jus66': 'Bendiga a terra o Senhor', 'jus71': 'Bendiga Israel o Senhor'}, 'note': "Word for word; ambiguous at first hearing (who blesses whom).", 'from': 'draft'},
    ],
})

decisions.append({
    'id': 'spiritus', 'refs': ['3:61'],
    'latin': 'omnes spíritus Dei', 'kind': 'word',
    'why': "*Spíritus* is breath, wind and spirit (L&S I: 'a breathing, breath of air, breeze'); the Greek is πάντα τὰ πνεύματα. The verse stands in the weather (rain and dew before it, fire and heat after), and the Latin reader hears both. The same word returns in 3:73 *spíritus, et ánimæ justórum*, where it is spirits of men and stays *espíritos*. The psalter's precedent for weather: 148:8 = 10:7 *spíritus procellárum* → *vento de tempestades*.",
    'options': [
        {'label': 'ventos', 'forms': {'spiritus': 'ventos'}, 'note': 'Draft, with 148:8. The sense the list gives; DM1962 *ventos de Deus*, CNBB *Brisa e ventos*.', 'from': 'draft'},
        {'label': 'espíritos', 'forms': {'spiritus': 'espíritos'}, 'note': "The Latin's word. Heard as angels or souls, which the context does not suggest and which 3:58 has already called.", 'from': 'draft'},
        {'label': 'sopros', 'forms': {'spiritus': 'sopros'}, 'note': "The 102:16 solution (*sopro*, wind and breath at once). In the plural it sounds like puffs.", 'from': 'glossary'},
    ],
})

decisions.append({
    'id': 'aestus', 'refs': ['3:62'],
    'latin': 'ignis et æstus … frigus et æstus', 'kind': 'word',
    'why': "The DO Latin repeats *æstus* in both halves of the verse (the Clementine Vulgate 3:66–67 does the same, fetched from Bolls). The CNBB varies it (*Fogo e calor … Frio e ardor*).",
    'options': [
        {'label': 'calor … calor', 'forms': {'aestus': 'calor'}, 'note': "Draft. The Latin's repetition kept (rule 6, D2). The internal echo *calor, ao Senhor* is the CNBB's own line (*Fogo e calor, bendizei o Senhor*) and is accepted.", 'from': 'draft'},
        {'label': 'calor … ardor', 'forms': {'aestus': 'ardor'}, 'note': "The CNBB's variation; drops a repetition the Latin has.", 'from': 'CNBB'},
    ],
})

decisions.append({
    'id': 'gelu', 'refs': ['3:63', '3:64'],
    'latin': 'rores et pruína … gelu et frigus … glácies et nives', 'kind': 'glossary',
    'why': "Three frost words in two verses. The glossary already has *pruína → geada* (77:47, 118:83) and *glácies → gelo* (148:8, where the row says it was kept apart from *pruína* for this canticle). *Gelu* is new (L&S 'frost, ice, icy coldness'; the Greek has πάγος). Portuguese has no fourth plain word. The CNBB and DM1962 both say *Geada e frio* for *gelu et frigus* and *Gelos e neves* for *glácies et nives*.",
    'options': [
        {'label': 'gelo … gelos', 'forms': {'gelu': 'gelo', 'glacies': 'gelos'}, 'note': "Draft. *Gelu* → *gelo*, its own descendant; *glácies*, paired with plural *nives*, taken as a plural → *gelos* (the CNBB's and DM1962's *Gelos e neves*); *pruína* keeps *geada*. Cost: two Latin words share one Portuguese root, told apart only by number, one verse apart.", 'from': 'draft'},
        {'label': 'geada … gelos (and pruína → ?)', 'forms': {'gelu': 'geada', 'glacies': 'gelos'}, 'note': "The CNBB and DM1962 (*Geada e frio*). But then *orvalhos e geada* in 3:63a says the same word for *pruína*: two Latin words, one Portuguese, in one verse. Only possible if *pruína* leaves the glossary here.", 'from': 'CNBB'},
        {'label': 'regelo … gelo', 'forms': {'gelu': 'regelo', 'glacies': 'gelo'}, 'note': "A distinct word for *gelu* (Houaiss: intense cold), keeping *glácies* exactly as 148:8. Likely unknown to many ears.", 'from': 'draft'},
    ],
})

decisions.append({
    'id': 'cete', 'refs': ['3:69'],
    'latin': 'cete', 'kind': 'word',
    'why': "*Cete* (κήτη) are great sea creatures: whales, sea monsters (L&S *cetus*: 'any large sea-animal, as the whale, shark, seal, dolphin'). Not the *dracónes* of 148:7 (*dragões*), another word.",
    'options': [
        {'label': 'baleias', 'forms': {'cete': 'baleias'}, 'note': "Draft. The CNBB's *Baleias e peixes*: the word Brazilians sing here. Narrower than the Latin, which takes in every sea giant.", 'from': 'draft'},
        {'label': 'monstros marinhos', 'forms': {'cete': 'monstros marinhos'}, 'note': 'Wider, and heard as fable.', 'from': 'draft'},
        {'label': 'cetáceos', 'forms': {'cete': 'cetáceos'}, 'note': 'DM1962. The cognate, but a term from zoology.', 'from': 'DM1962'},
    ],
})

decisions.append({
    'id': 'pecora', 'refs': ['3:70'],
    'latin': 'omnes béstiæ et pécora', 'kind': 'glossary',
    'why': "The pair of 148:10 (*Béstiæ, et univérsa pécora* → *Feras, e todo o gado*): *béstiæ → feras*, *pécora → gado*. The CNBB and DM1962 say *feras e rebanhos*.",
    'options': [
        {'label': 'o gado', 'forms': {'pecora': 'o gado'}, 'note': 'Draft, as 148:10 and 134:7b (rule 6).', 'from': 'glossary'},
        {'label': 'rebanhos', 'forms': {'pecora': 'rebanhos'}, 'note': 'The CNBB and DM1962. Smooth in a vocative list; departs from 148:10.', 'from': 'CNBB'},
        {'label': 'os animais', 'forms': {'pecora': 'os animais'}, 'note': "8:8's word (*pécora campi*).", 'from': 'glossary'},
    ],
})

decisions.append({
    'id': 'cum', 'refs': ['3:75'],
    'latin': 'Patrem et Fílium cum Sancto Spíritu', 'kind': 'word',
    'why': "The doxology says the Father and the Son *with* the Holy Spirit, not a third *et*. The CNBB (*Ao Pai e ao Filho e ao Espírito Santo*) and DM1962 (*e ao Espírito Santo*) level it to the Gloria's shape.",
    'options': [
        {'label': 'com', 'forms': {'cum': 'com'}, 'note': "Draft. The Latin's preposition, as the Gloria in excelsis has *Cum Sancto Spíritu, in glória Dei Patris* (DO missa Ordo.txt, grep).", 'from': 'draft'},
        {'label': 'e', 'forms': {'cum': 'e'}, 'note': 'CNBB, DM1962. The familiar Trinitarian list; not the Latin.', 'from': 'CNBB'},
    ],
})

choices = {
    '3:57': "*ópera* → *obras* (the *narráre / ópera* row). *Dómini, Dómino* → *do Senhor, ao Senhor*: the doubling is the Latin's. *in sǽcula* → *pelos séculos* (D43, settled); the proparoxytone at the final is the Latin's own (*sǽcula*). The refrain *louvai-o e exaltai-o sumamente pelos séculos* is identical in 3:57 and 3:74, and in the third person (3:66, 3:71) and first person plural (3:75) only the verb's person changes. DO's heading line *(Canticum Trium Puerorum * Dan 3:57-88,56)* is not a verse (see the audit).",
    '3:58': 'ángelus → anjo (lowercase, glossary).',
    '3:59': "*aquæ omnes, quæ super cælos sunt* is 148:4 word for word → *todas as águas acima dos céus* (copied, rule 6). *omnes virtútes Dómini* → *todos os poderes do Senhor*, as 148:2 *omnes virtútes ejus* → *todos os seus poderes* and *Dóminus virtútum* → *o Senhor dos poderes* (D43).",
    '3:60': "*sol et luna* as 148:3. *stellæ cæli* → *estrelas do céu* (CNBB and DM1962 have *astros*).",
    '3:61': "*omnis imber et ros* → *toda chuva e orvalho*: *imber → chuva* (77:44 *imbres → chuvas*), *ros → orvalho* (132:2b). *omnis* in the singular, 'every', which Brazilian *toda chuva* says.",
    '3:62': 'See decision `aestus`. *ignis → fogo*, *frigus → frio* (147:6 *frígoris → frio*).',
    '3:63': "*rores* is plural, so *orvalhos*, against 3:61's singular *ros → orvalho*. *pruína → geada* (77:47, 118:83).",
    '3:64': '*noctes et dies* → *noites e dias*, the Latin order.',
    '3:65': "*lux → luz* (collides with *lumen*, as the glossary notes); *fúlgura → relâmpagos* (17:15, 96:4); *nubes → nuvens*.",
    '3:66': 'See decision `jussive`. The second colon changes person with the first (*laudet et superexáltet*): *louve-o e exalte-o*.',
    '3:67': "*montes et colles* → *montes e colinas* (148:9, the *collis* row). *univérsa germinántia in terra* → *tudo o que germina na terra*: 64:11's *gérminans → o que germina*, with *univérsa* as *tudo*.",
    '3:68': "*mária et flúmina* → *mares e rios* (23:2).",
    '3:69': "The Latin's comma after *cete* is kept. *ómnia, quæ movéntur in aquis* → *tudo o que se move nas águas*. *vólucres cæli* → *aves do céu* (8:9, 103:12); CNBB *pássaros*.",
    '3:70': "*béstiæ → feras* (148:10, the *béstiæ* row). *fílii hóminum → filhos dos homens* (formula).",
    '3:71': 'See decision `jussive`. *Israël → Israel*.',
    '3:72': "*sacerdótes → sacerdotes*, *servi Dómini → servos do Senhor* (133:1a).",
    '3:73': "Here *spíritus* is plainly spirits (of the just, beside their souls) → *espíritos*; compare 3:61. The Latin's commas after *spíritus* and *sancti* are kept, so that each may stand alone or with *justórum / corde*, as in the Latin. *húmiles corde → humildes de coração* (*húmilis* D27; *retos de coração*).",
    '3:74': "The three names as the Portuguese Bibles have them (Ananias, Azarias, Misael — DM1962 and the CNBB, fetched). The refrain = 3:57b.",
    '3:75': "DO's rubric *(Fit reverentia:)* is kept as a rubric in parentheses, translated: *(Faz-se reverência:)*; checks.py ignores parentheses, and a Portuguese file for DO needs it (DO's Portuguese has *(inclina cabeça)*). *Patrem* accusative → *o Pai* (the *benedícere* row). *eum* singular after three Persons is the Latin's → *louvemo-lo e exaltemo-lo*. The Diurnal Monástico 1962 notes that no Gloria Patri is said after this canticle: this verse is its doxology.",
    '3:56': "*Benedíctus es* → *Bendito sois* (the CNBB has the same words, *Bendito sois, Senhor, no firmamento dos céus*). *firmaméntum cæli* → *firmamento do céu* (D31: the sky). *laudábilis* → *digno de louvor*, the formula of 47:2 / 95:4 / 144:3 (*muito digno de louvor*) and 112:3. *gloriósus → glorioso* (86:3 *Gloriósa → Coisas gloriosas*). The three *et* are kept.",
}

audit = [
    {'step': 'source', 'note': "Latin = DO Psalm210.txt, a canticle file (DO files the canticles as Psalms 210–273). Verse ids are Daniel's, 3:57–3:75 then 3:56, in the file's order; render.py and checks.py key on them and read the file in order, so the shared scripts worked unchanged with the DO number 210. The file's first line, *(Canticum Trium Puerorum * Dan 3:57-88,56)*, is a heading, not a verse (readVerses skips it, and ps233 left its own heading out the same way). Under D7 no heading or titulus is part of the prayed text; for a Portuguese file for DO the heading would read *(Cântico dos Três Jovens * Dn 3,57-88.56)* — proposed here, not put in `verses`. Note the DO verse 3:75 is the breviary's doxology, not Daniel's 3:75; DO's 3:57–3:74 compress Daniel 3:57–88 (two invocations per verse, the refrain kept only in 3:57, 3:66, 3:71, 3:74), checked against the Clementine text fetched from Bolls (consult/bolls-VULG-27-3.json)."},
    {'step': 'draft', 'note': "parallels.py 210 gives only the Latin and DO's Portuguese (no authority, D12) for a canticle. Fetched from Bolls into consult/: the Clementine Vulgate (VULG), a lemmatised Greek (LXX: lemmas only, so it shows words, not forms) and DRB (only the protocanonical 30 verses of Dan 3 — the canticle is missing, so DRB is cited only where known through the glossary); ps210/show_dan3.py prints them. No Matos Soares text of Daniel was available. The Diurnal Monástico 1962 prints this canticle with a Portuguese translation (consult/diurnal-1.md, lines 1779–1916), used as the Brazilian witness of cadence. Brazilian circulation (CNBB LH and Lectionary) fetched: ps210/circulation.md. Precedents found with ps210/concord.py (a copy of ps148/concord.py) and ps210/glossrows.py (prints glossary rows by Latin head). Built by ps210/build_v1.py (the order decision has one slot per colon). Hardest: the order of the litany, *superexaltáre*, the three frost words."},
    {'step': 'checks', 'note': "Draft 1: hard pass (ids 3:57–3:75, 3:56 in file order; one '*' per verse). Soft flags, all accepted: (1) *Senhor … Senhor* rhymes at mediant and final of 15 verses and at the finals of neighbouring verses — the Latin's own echo (*Dómino … Dómino*), the canticle's form, not a found rhyme; likewise *séculos* at the finals of 3:74, 3:75, 3:56 (*sǽcula* in all three). (2) Length: the third-person and first-person refrains (3:66b, 3:71b, 3:75b) +3, and 3:56b +4, all from *sumamente* (see decision `superexaltare`; the heuristic counts no elision, and *-o e exalte-o* elides twice when said); 3:67b and 3:68b −3, because *Dómino* is three syllables and *Senhor* two, and *univérsa germinántia* is long in Latin. (3) Proparoxytone finals on *séculos* — the Latin's *sǽcula*, settled by D43."},
]

prayed = {
    'psalm': 210, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft',
    'verses': verses, 'decisions': decisions, 'choices': choices, 'audit': audit,
}
(here / 'prayed.json').write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', here / 'prayed.json')
