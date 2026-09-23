"""v1 (before readers): align 150:4 *chorus* with the parallel ruling in 149:3 ('em coro')."""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
for x in d['decisions']:
    if x['id'] != 'choro':
        continue
    x['why'] = (
        "Latin *chorus* (Greek χορός, the same word in both places) is first 'a dance in a ring, a choral dance'. After that it is the band that dances and sings, and then a choir (L&S). "
        "My first pencil was 'a dança': the dance is the first sense, and the word stands beside the drum. "
        "But Ps 149:3 *in choro* (ἐν χορῷ), drafted in parallel and read by its three readers with no remark on the word, ruled for the cognate: 'Louvem o seu nome em coro'. "
        "The two psalms are sung one after the other at Lauds, so rule 6 wants one word. "
        "Here *chorus* is joined to *týmpano* under one *in*, so the noun stays a noun: 'com o tamborim e o coro'. "
        "That is 149's word in 150's syntax. MS1932's 'e em coro' would make it an adverb, and 149's 'no coro' sense (the choir-stalls) was already refused there. "
        "The cost: 'coro' is heard as a body of singers, and the dance that the Latin's first sense and the Greek carry is not heard. "
        "'a dança' is the CNBB's wording too, which proves only that the line is known in Brazil. "
        "If either psalm moves to the dance, both should move together."
    )
    x['options'] = [
        {"label": "o coro", "forms": {"choro": "o coro"}, "note": "Ruling. The cognate, as in 149:3 'em coro' and DRB 'choir'. The noun is kept as a noun beside the drum.", "from": "draft"},
        {"label": "em coro", "forms": {"choro": "em coro"}, "note": "Exactly 149:3's words and MS1932's ('com timbales e em coro'). Adverbial: 'in chorus, together'.", "from": "MS1932"},
        {"label": "a dança", "forms": {"choro": "a dança"}, "note": "L&S sense I, and the Greek χορός. Heard as dance only, without the song. The CNBB has the same word.", "from": "draft"},
    ]
d['audit'][0]['note'] = d['audit'][0]['note'].replace(
    "149:3 *in choro … in týmpano et psaltério* was being drafted in parallel and had no prayed text when this was written.",
    "150:4 *chorus* was first pencilled 'a dança'. Before the readers it was aligned with Ps 149:3 ('em coro', ruled in parallel and read without remark) as 'o coro'; see decision `choro`.",
)
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
