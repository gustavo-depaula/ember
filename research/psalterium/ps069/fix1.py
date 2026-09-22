import json
from pathlib import Path
p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
for x in d['decisions']:
    if x['id'] == 'moreris':
        x['why'] = ("The twin 39:18b has *Deus meus, ne tardáveris* → *meu Deus, não tardeis*; here the Latin has *Dómine* and morári. "
            "D41 set *demorar* for this line so that the Latin's two verbs stay two in Portuguese, and it is followed. **But note for review:** the Greek behind both lines is the same, μὴ χρονίσῃς (read in the Rahlfs text of `consult/parallels/ps039.md` and `ps069.md`), so by D15's test (a Latin variation over one Greek word carries no sense) the two could be merged, and *não tardeis* would make the doublet read alike; it is option 3. "
            "*não demoreis* intransitive ('do not delay') rather than *não vos demoreis* ('do not linger'), the plainer; MS1932 has the pronominal *não te demores*. The colon is the Latin's length. *demorar-se* is also the demorári row's word (24:13, 29:6, 'abide'); the senses differ and the lines never meet.")
        x['options'][2]['note'] = "39:18b's words; one Greek verb (μὴ χρονίσῃς) under both Latin verbs, so D15's test allows it; against D41."
d['choices']['69:2'] = ("The Portuguese of the Hour versicle in DO (Common/Prayers.txt) is a separate text this psalm does not touch; whatever D40 rules should reach it too. "
    "The Rahlfs line for 69:2 in the parallels file reads εἰς τὸ σῶσαί με κύριον ὁ θεός εἰς τὴν βοήθειάν μου πρόσχες and looks damaged or reordered (no verb for *festína*); it was not used for anything.")
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
