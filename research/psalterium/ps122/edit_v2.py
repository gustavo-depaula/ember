"""Draft 2 of Ps 122: apply the post-reader revisions to prayed.json."""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text())
d['version'] = 2
dec = {x['id']: x for x in d['decisions']}

# v4b: the Latinist's fix (bare nouns, 'para'), which was option 1 of draft 1.
v4b = dec['v4b']
old0, para, ricos = v4b['options']
para['note'] = ("Draft 2, the Latinist's fix (v1, minor); the stylist asked the same bare nouns with 'aos'. "
                "The Latin nouns are bare, so no articles; 'para' is the Portuguese of 'in the eyes of' "
                "('somos uma afronta para eles'), so the reading of DRB and Matos Soares 1932 ('we are a reproach to the rich') "
                "is heard, while 'for them' stays open as the Latin's dative allows. It also removes the stumble 'a‿afronta‿aos' "
                "the stylist heard. 19 syllables by checks.py against the Latin's 17.")
para['from'] = 'latinist'
old0['label'] = 'a afronta aos prósperos, e o desprezo aos soberbos'
old0['note'] = ("Draft 1. The Greek's articles and the plain dative. Refused: the Latinist and the stylist both found the articles "
                "detach the colon (a pair of headings, not the content of the filling), and the ambiguity reader's likeliest hearing was "
                "insult aimed AT the prosperous — the opposite of the psalm.")
old0['from'] = 'draft'
bare_aos = {"label": "afronta aos prósperos, e desprezo aos soberbos",
            "forms": {"v4b": "afronta aos prósperos, e desprezo aos soberbos"},
            "note": "The stylist's (v1): no articles, the plain dative kept. Shorter (15); but 'afronta aos …' is still heard first as an affront directed at them.",
            "from": "stylist"}
v4b['options'] = [para, bare_aos, old0, ricos]

# repleri: kept, with the readers' alternatives as options.
rep = dec['repleri']
rep['options'][0]['note'] += (" All three readers (v1) heard 'fartos / farta' as 'fed up with'. Kept: 'fed up with being scorned' "
                              "(the ambiguity reader's likeliest hearing) is contempt suffered and had in excess, which is the Latin's sense; "
                              "the alternatives bring back the wrong hearing or collide with another row.")
rep['options'].append({"label": "repletos … repleta", "forms": {"repleti": "repletos", "repleta": "repleta"},
                       "note": "The Latinist's fix (v1, minor): replére's own cognate, no colloquial echo. Refused: 'repletos de desprezo' has the same wrong first hearing as 'cheios de desprezo' (contempt we feel).",
                       "from": "latinist"})
rep['options'].append({"label": "saciados … saciada", "forms": {"repleti": "saciados", "repleta": "saciada"},
                       "note": "The stylist's (v1). Keeps the image of satiety without 'fed up'; refused because 'saciar' is the settled word of satiáre / saturáre, kept apart from replére (glossary), and 'saciados de desprezo' is a little literary.",
                       "from": "stylist"})

# verbless: the stylist's verb as an option.
vb = dec['verbless']
vb['options'].append({"label": "assim estão os nossos olhos no Senhor", "forms": {"inmanibus": "nas mãos", "ita": "assim estão os nossos olhos no"},
                      "note": "The stylist's (v1: the colon is long and verbless, 'sayable' failed). Refused: 'no Senhor' turns 'ad Dóminum' (toward) into 'in'; and the ambiguity reader heard the verbless 'para o Senhor' as 'our eyes look toward the Lord' without difficulty. The colon has a natural breath at the comma after 'nosso Deus'.",
                      "from": "stylist"})

d['choices']['122:4'] += (" Draft 2: 'afronta para os prósperos, e desprezo para os soberbos' (the Latinist). The ambiguity reader noted "
                          "'soberbos' could be heard as 'superb'; beside 'desprezo' it heard 'the proud', and 93:2 has the same word. "
                          "'prósperos' heard as 'those who do well', neutral: the Latin's word is as neutral (72:12).")

d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with the Latin. Two minors, nothing major; tenses, persons, the subjunctive and the pointing confirmed.",
     "outcomes": [
        {"verse": "122:3", "remark": "'fartos' heard as 'fed up' → 'repletos'", "outcome": "option", "decision": "repleri", "reason": "'repletos de desprezo' is heard as contempt we feel, the fault 'fartos' was chosen to avoid; 'fed up with being scorned' keeps the suffering and the excess."},
        {"verse": "122:4", "remark": "articles detach the bare nouns → 'afronta para os prósperos, e desprezo para os soberbos'", "outcome": "taken"}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with the Latin. Best line 122:1, worst 122:4. Four remarks: one taken in substance (the articles), three kept as options.",
     "outcomes": [
        {"verse": "122:2b", "remark": "long verbless colon → 'assim estão os nossos olhos no Senhor'", "outcome": "option", "decision": "verbless", "reason": "'no' loses ad (toward); supplying the verb fills what the Latin leaves verbless; the ambiguity reader heard the colon rightly."},
        {"verse": "122:3", "remark": "'fartos' colloquial → 'saciados'", "outcome": "option", "decision": "repleri", "reason": "saciar belongs to satiáre / saturáre (glossary); 'fed up with being scorned' is the Latin's sense, not against it."},
        {"verse": "122:4", "remark": "'a nossa alma está muito farta' → 'saciada'", "outcome": "option", "decision": "repleri", "reason": "One verb twice, so it goes with 122:3."},
        {"verse": "122:4", "remark": "articles, 'a‿afronta‿aos' stumble → 'afronta aos prósperos, e desprezo aos soberbos'", "outcome": "taken", "reason": "Articles dropped as asked; 'para' (the Latinist's) preferred to 'aos'; 'aos' kept as an option."}]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. No unknown words. Eight items.",
     "outcomes": [
        {"verse": "122:2a", "remark": "verbless 'olhos … nas mãos' momentarily odd; likeliest hearing right (looking to their hands)", "outcome": "refused", "reason": "The Latin is verbless; heard rightly."},
        {"verse": "122:2b", "remark": "'tenha' could be first person; heard as the Lord", "outcome": "refused", "reason": "Heard rightly; 'até que ele tenha' stays an option (donec)."},
        {"verse": "122:2b", "remark": "'para o Senhor' turned toward / given to", "outcome": "refused", "reason": "Heard as 'look toward the Lord', the Latin's ad."},
        {"verse": "122:3", "remark": "'fartos de desprezo' heard as fed up with being scorned", "outcome": "refused", "reason": "That is the suffered sense the word was chosen for; 'we feel contempt' was only the third reading, not the first as with 'cheios'."},
        {"verse": "122:4", "remark": "'a nossa alma está muito farta' heard as fed up", "outcome": "refused", "reason": "As 122:3."},
        {"verse": "122:4", "remark": "'a afronta aos prósperos …' likeliest heard as insult aimed at them", "outcome": "taken", "reason": "The colon changed to 'afronta para os prósperos, e desprezo para os soberbos'."},
        {"verse": "122:4", "remark": "'prósperos' may be neutral", "outcome": "refused", "reason": "So is the Latin's abundántes (εὐθηνοῦντες); 72:12's word."},
        {"verse": "122:4", "remark": "'soberbos' could be 'superb'", "outcome": "refused", "reason": "Heard as 'the proud' beside 'desprezo'; 93:2's word."}]},
    {"step": "revision", "version": 2, "note": "v2: 122:4 second colon 'a afronta aos prósperos, e o desprezo aos soberbos' → 'afronta para os prósperos, e desprezo para os soberbos'. Readers' alternatives added as options (repleri, verbless, v4b). Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the v1 readers read)."},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
