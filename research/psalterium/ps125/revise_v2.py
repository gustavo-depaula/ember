"""Ps 125 draft 2: apply the v1 reader outcomes to prayed.json (prayed.v1.json kept)."""
import json
from pathlib import Path

here = Path(__file__).parent
p = here / "prayed.json"
d = json.loads(p.read_text(encoding="utf-8"))
d["version"] = 2
d["status"] = "reviewed"
V = d["verses"]
V["125:4"] = "Fazei voltar, Senhor, {cap4}, * {sicut} {auster}."
V["125:5"] = "{v5a}, * {v5b}."
dec = {x["id"]: x for x in d["decisions"]}


def front(did, opt):
    """Move the option whose label is `opt` to position 0."""
    ops = dec[did]["options"]
    i = next(k for k, o in enumerate(ops) if o["label"] == opt)
    ops.insert(0, ops.pop(i))


# facti: stylist -> ficamos
front("facti", "ficamos")
dec["facti"]["options"][0]["note"] += " Taken in v2 at the stylist's request (125:3; he named 125:1 too): the plain Brazilian verb, no change of sense. The ambiguity reader heard the past in both."
dec["facti"]["options"][0]["from"] = "stylist"
dec["facti"]["options"][1]["note"] = "Draft 1, by the fíeri row and 78:4. The stylist found the pronominal bookish in the short colon of 125:3."

# euntes: stylist -> Iam indo e choravam
front("euntes", "Iam indo e choravam")
dec["euntes"]["options"][0]["note"] += " Taken in v2 from the stylist (his worst line was draft 1's *Indo, iam*: the i-i-a hiatus and a participle set before its own verb). Order only (D2): both forms of *ire* and *flebant* stay. Cost: 125:6b *Vindo, porém, virão* no longer mirrors it word for word; the pairing going/coming is still heard."
dec["euntes"]["options"][0]["from"] = "stylist"
dec["euntes"]["options"][1]["note"] = "Draft 1. The Latin's order, mirroring 125:6b; refused by the stylist as unsayable (hiatus, fronted participle)."

# 125:4: definite article (stylist)
d["decisions"].append({
    "id": "sicut", "refs": ["125:4"], "latin": "sicut torrens", "kind": "grammar",
    "why": "The Latin has no article. Draft 1 gave the simile an indefinite one; the stylist heard a slack run *co-mo-u-ma* and asked the definite, generic article.",
    "options": [
        {"label": "como a torrente", "forms": {"sicut": "como a torrente"}, "note": "v2, the stylist's. The generic article; lighter, and the image is unchanged.", "from": "stylist"},
        {"label": "como uma torrente", "forms": {"sicut": "como uma torrente"}, "note": "Draft 1.", "from": "draft"},
    ],
})

# 125:5: first colon order (stylist) and preposition (latinist)
d["decisions"].append({
    "id": "v5a", "refs": ["125:5"], "latin": "Qui séminant in lácrimis", "kind": "order",
    "why": "Draft 1 kept the Latin's order, which ends the colon on the proparoxytone *lágrimas* (as the Latin's *lácrimis*). The stylist asked for the verb last, so the mediant falls on a paroxytone.",
    "options": [
        {"label": "Os que em lágrimas semeiam", "forms": {"v5a": "Os que em lágrimas semeiam"}, "note": "v2, the stylist's. Order only (D2); the cadence lands on *semeiam*. With the Latinist's *em* in the second colon the two halves now run *em lágrimas semeiam / em exultação ceifarão* — tears and joy each before their verb.", "from": "stylist"},
        {"label": "Os que semeiam em lágrimas", "forms": {"v5a": "Os que semeiam em lágrimas"}, "note": "Draft 1; the Latin's order and MS1932's.", "from": "draft"},
    ],
})
# exsultatio: 125:5 'in' -> em (latinist); 6b keeps 'com' (cum)
for o in dec["exsultatio"]["options"]:
    o["forms"]["ex5"] = o["forms"]["ex5"].replace("com ", "em ")
dec["exsultatio"]["options"][0]["note"] = "By the row; the Latin's repetition kept across the three places. v2: 125:5 *in exsultatióne* → *em exultação* (the Latinist: the Latin sets *in lácrimis* against *in exsultatióne* with one preposition and keeps *cum* for 125:6b, so *em* / *com* as the Latin has them)."
dec["exsultatio"]["options"][1]["note"] = "MS1932 at 125:5 and the CNBB (*ceifarão com alegria*) — the line as Brazilians know it. Takes lætítia's word; refused under the glossary."
dec["exsultatio"]["why"] = dec["exsultatio"]["why"].replace("*In* of manner (125:5) and *cum* (125:6b) both give *com*, as 99:2b.", "Draft 1 gave both *in* (125:5) and *cum* (125:6b) as *com*, as 99:2b; v2 follows the Latin's two prepositions (Latinist).")
v5b = dec["v5b"]
v5b["options"][0]["label"] = "em exultação ceifarão"
v5b["options"][0]["note"] = "Draft (with v2's *em*). The Latin's order; ends on the verb as the Latin ends on *metent*. The stylist heard *exultação ceifarão* as a double -ão clang and asked the plain order; refused: the clang is two stressed -ão, the second at the cadence, and the plain order would end the verse on the word that ends 125:2a and stands at 125:6b's mediant."
v5b["options"][1]["label"] = "ceifarão em exultação"
v5b["options"][1]["note"] = "Plain order (the CNBB's *ceifarão com alegria*; the stylist's *ceifarão com exultação*). Kept as the option for Gustavo's ear."
v5b["options"][1]["from"] = "stylist"
v5b["options"][2]["label"] = "em exultação colherão"

d["choices"]["125:5"] = "v2: the mediant is now *semeiam* (paroxytone); the proparoxytone *lágrimas* of draft 1 moved inside the colon."
d["choices"]["125:4"] += " The ambiguity reader heard *no sul* as possibly southern Brazil and the image as unclear; the wind reading stays option 2 of `auster`. He also heard *Fazei voltar … o nosso cativeiro* (and 125:1) as possibly 'make captivity come back upon us', while naming the restoration as the likely hearing — the risk the captívitas row already records; *os cativos* stays the option. Not changed: the glossary row governs 13:7, 52:7, 84:2 too, and a change belongs to the row."
d["choices"]["125:2b"] += " The ambiguity reader heard the future *dirão* as clashing with the past of 2a; it is the Latin's own tense shift, kept."

d["audit"].append({
    "step": "latinist", "file": "critic/v1.latinist.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "One minor, taken.",
    "outcomes": [
        {"verse": "125:5", "remark": "in exsultatióne → em, not com (parallel with in lácrimis; cum kept for 6b)", "outcome": "taken"},
    ],
})
d["audit"].append({
    "step": "stylist", "file": "critic/v1.stylist.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "Four remarks: three taken whole, one taken in part (first colon of 125:5) with the rest kept as an option. Best line 125:2a, worst 125:6a.",
    "outcomes": [
        {"verse": "125:5", "remark": "proparoxytone mediant; move to 'Os que em lágrimas semeiam'", "outcome": "taken"},
        {"verse": "125:5", "remark": "second colon inverted, 'exultação ceifarão' clangs; 'ceifarão com exultação'", "outcome": "option", "decision": "v5b", "reason": "The Latin ends on the verb; the plain order would end the verse on the word that closes 125:2a."},
        {"verse": "125:6a", "remark": "'Indo, iam' stumbles; 'Iam indo e choravam'", "outcome": "taken"},
        {"verse": "125:4", "remark": "'como uma' slack; 'como a torrente'", "outcome": "taken"},
        {"verse": "125:3", "remark": "'tornamo-nos' bookish; 'ficamos' (also 125:1)", "outcome": "taken"},
    ],
})
d["audit"].append({
    "step": "ambiguity", "file": "critic/v1.ambiguity.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "Thirteen readings, the likely hearing right in all but the image of 125:4. Unknown words listed: cativeiro, júbilo, exultação, torrente, ceifarão, feixes — all kept (glossary words or the concrete images of rule 5; *ceifarão* and *feixes* are what the CNBB prints).",
    "outcomes": [
        {"verse": "125:1", "remark": "'fez voltar o cativeiro' can be heard as captivity returning", "outcome": "refused", "reason": "Likely hearing is the restoration (his own note); the captívitas row governs four psalms; 'os cativos' stays the option."},
        {"verse": "125:4", "remark": "same for 'Fazei voltar … o nosso cativeiro'", "outcome": "refused", "reason": "As 125:1."},
        {"verse": "125:4", "remark": "'no sul' heard as southern Brazil, image unclear", "outcome": "option", "decision": "auster", "reason": "Both Vulgate-family witnesses read the region; the wind is option 2."},
        {"verse": "125:2b", "remark": "future 'dirão' clashes with past of 2a", "outcome": "refused", "reason": "The Latin's and the Greek's future."},
        {"verse": "125:1", "remark": "tornamo-nos past/present", "outcome": "taken", "reason": "Moot: the stylist's ficamos taken; past still heard from context."},
    ],
})
d["audit"].append({"step": "revision", "version": 2, "note": "v2: ficamos (125:1, 3); Iam indo e choravam (6a); como a torrente (4); Os que em lágrimas semeiam, * em exultação ceifarão (5). Draft 1 kept as prayed.v1.json."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
