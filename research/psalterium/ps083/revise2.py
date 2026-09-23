"""Draft 2 of Ps 83: after the v1 readers (latinist, stylist, ambiguity — claude-opus-5-5, fresh context)."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text())
V = d['verses']
dec = {x['id']: x for x in d['decisions']}

# 83:4 — stylist: comma after the subject of the elided verb; ambiguity: *rola* (slang).
V['83:4'] = "Pois o pardal encontrou para si uma casa: * e {turtur}, {sibi2}, onde ponha os seus {pullos}."
turtur = {
    "id": "turtur", "refs": ["83:4"], "latin": "et turtur", "kind": "word",
    "why": ("*turtur* is the turtledove (τρυγών). *Rola* is the dictionary word and MS1932's, but the blind ambiguity reader "
            "listed it as unknown and warned that in Brazil *rola* is vulgar slang for the penis — heard in a prayer said aloud, "
            "it would be comic or jarring. *Rolinha* is the everyday Brazilian name of the small doves (my knowledge, not checked "
            "in a source); the diminutive is part of the name, not an added tenderness. *Pomba* is refused: it is *colúmba*'s word "
            "(54:7, 67:14). *Pomba-rola* keeps the slang inside it."),
    "options": [
        {"label": "a rolinha", "forms": {"turtur": "a rolinha"}, "note": "Ruling: the bird's everyday name; avoids the slang.", "from": "ambiguity"},
        {"label": "a rola", "forms": {"turtur": "a rola"}, "note": "MS1932; the dictionary word; slang risk.", "from": "MS1932"},
        {"label": "a pomba-rola", "forms": {"turtur": "a pomba-rola"}, "note": "Compound name; still carries *rola*.", "from": "draft"},
    ],
}
d['decisions'].insert(d['decisions'].index(dec['sibi2']), turtur)
dec['sibi2']['why'] += " v2: a comma after the subject (the stylist: without it *a rola um ninho* ran together as one noun phrase)."
dec['sibi2']['options'][1]['note'] = "*e a rolinha, um ninho, onde ponha …* — lighter; loses the Latin's second *sibi*."

# 83:6 — stylist: object before the adverbial.
V['83:6'] = "Bem-aventurado o homem cujo auxílio {abste}: * dispôs {ascensiones} no seu coração, no vale de lágrimas, no lugar {posuit}."
dec['ascensiones']['why'] += (" v2: the blind ambiguity reader listed *subidas* as unknown in this place and could not say what "
                              "'climbs set in the heart' means — but the Latin is as dark (DRB and MS1932 both gloss it); kept, "
                              "the options stand.")

# 83:8 — stylist: subject first.
V['83:8'] = "Pois o legislador dará a bênção, irão {devirtute}: * o Deus dos deuses {videbitur} em Sião."
dec['videbitur']['why'] = dec['videbitur']['why'].replace(
    "Latin order (verb first) kept: it ends the verse on *Sião*, an oxytone.",
    "v2: natural order, subject first (the stylist; D2) — the verse still ends on *Sião*.")

# 83:11 — stylist: mediant on a proparoxytone; reorder so the colon ends on *melhor*.
V['83:11'] = "Porque {diesuna} nos vossos átrios é melhor * do que milhares."
d['choices']['83:11'] = ("v2: *é melhor* moved to the mediant (the stylist: *átrios* left two weak syllables before the mark); "
                         "*melhor do que milhares* now joins across the mark as the Latin's *mélior … super míllia* does. "
                         + d['choices']['83:11'])

# 83:11b — stylist: *mais do que* after *escolhi* a calque → *em vez de* (taken); *antes que* refused.
dec['magisquam']['why'] += (" v2: the stylist called *Escolhi … mais do que* a calque. *Em vez de* is how Portuguese says "
                            "'chose X rather than Y'; it changes how, not what (D2) — taken. His *antes que habitar* is refused: "
                            "*antes que* is the conjunction 'before' and takes a subjunctive.")
dec['magisquam']['options'] = [
    {"label": "em vez de", "forms": {"magisquam": "em vez de"}, "note": "Ruling (v2): the stylist's point, the plain Portuguese of 'rather than'.", "from": "stylist"},
    {"label": "mais do que", "forms": {"magisquam": "mais do que"}, "note": "Draft 1: keeps *magis* word for word.", "from": "draft"},
    {"label": "antes que", "forms": {"magisquam": "antes que"}, "note": "The stylist's wording; heard as 'before'.", "from": "stylist"},
]
dec['abjectus']['why'] += (" v2: the Latinist (minor) asked for *rejeitado* — 'posto de lado softens it into neglect'. Refused: "
                           "*rejeitar* is *reprobáre*'s (117:22), and *rejeitado na casa do meu Deus* says God's house turned him away, "
                           "the opposite of the choice the verse makes. The blind reader heard *posto de lado* as 'cast aside, "
                           "of little account' — the Greek's sense.")
dec['abjectus']['options'].insert(1, {"label": "rejeitado", "forms": {"abjectus": "rejeitado"},
                                      "note": "The Latinist's fix; *reprobáre*'s word; heard as refused by the house.", "from": "latinist"})

dec['dilecta']['why'] += (" v2: the blind reader heard 'how loved your tents are, by people' — the Latin's participle is open "
                          "the same way; kept.")
d['choices']['83:8'] += (" The blind reader heard *legislador* first as a lawmaker in the modern sense (and listed it as unknown); "
                         "the Latin's word, DRB and MS1932 alike — kept.")
d['choices']['83:4b'] += (" The blind reader could not tell what is said about the altars: the Latin is verbless and says no more "
                          "(decision `altaria`).")

d['version'] = 2
d['status'] = 'reviewed'
d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "model": "claude-opus-5-5 (fresh context)",
     "note": "One minor (83:11b *abjéctus*), refused and kept as an option. Overall: faithful, Septuagintal readings kept, marks right.",
     "outcomes": [
         {"verse": "83:11b", "remark": "posto de lado softens abiectus → rejeitado", "outcome": "option", "decision": "abjectus",
          "reason": "*rejeitar* is reprobáre's (117:22); *rejeitado na casa do meu Deus* says the house turned him away."}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "model": "claude-opus-5-5 (fresh context)",
     "note": "5 remarks; 4 taken (all order or punctuation), 1 partly taken (the construction, not his wording). Best line 83:3, worst 83:6.",
     "outcomes": [
         {"verse": "83:4", "remark": "comma after *a rola*", "outcome": "taken"},
         {"verse": "83:6", "remark": "*dispôs subidas no seu coração*", "outcome": "taken"},
         {"verse": "83:8", "remark": "subject first: *o Deus dos deuses será visto em Sião*", "outcome": "taken"},
         {"verse": "83:11", "remark": "mediant on *átrios*; move *é melhor*", "outcome": "taken"},
         {"verse": "83:11b", "remark": "*mais do que* a calque → *antes que*", "outcome": "option", "decision": "magisquam",
          "reason": "The point taken as *em vez de*; *antes que* is the conjunction 'before'."}]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "model": "claude-opus-5-5 (fresh context)",
     "note": "26 readings, 5 unknown words (átrios, desfalece, rola, subidas, legislador). One fault acted on: *rola* (slang).",
     "outcomes": [
         {"verse": "83:4", "remark": "*rola* unknown and vulgar slang", "outcome": "taken", "decision": "turtur"},
         {"verse": "83:2", "remark": "*amadas* heard as loved by people", "outcome": "refused", "reason": "The Latin participle is open the same way."},
         {"verse": "83:2", "remark": "*Senhor dos poderes* heard abstract", "outcome": "refused", "reason": "D43; flagged for Gustavo there."},
         {"verse": "83:4b", "remark": "verbless altars unclear", "outcome": "refused", "reason": "The Latin is verbless; nothing supplied (decision `altaria`)."},
         {"verse": "83:6", "remark": "*subidas* unclear/unknown", "outcome": "refused", "reason": "The Latin image is as dark; options stand."},
         {"verse": "83:8", "remark": "*legislador* heard as a modern lawmaker", "outcome": "refused", "reason": "The Latin's word, DRB and MS1932."},
         {"verse": "83:11b", "remark": "*posto de lado* heard as cast aside", "outcome": "refused", "reason": "That is the Greek's sense; intended."}]},
    {"step": "revision", "version": 2,
     "note": "v2: 83:4 *a rolinha,* (comma, and the slang avoided); 83:6 object before the adverbial; 83:8 subject first; 83:11 *é melhor* at the mediant; 83:11b *em vez de*. Draft 1 kept as prayed.v1.json."},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
