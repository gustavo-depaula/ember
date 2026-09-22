"""Draft 2 of Ps 69 after the v1 readers (Latinist, stylist, ambiguity: claude-opus-5-5, fresh context)."""
import json
from pathlib import Path
p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
V = d['verses']
V['69:3'] = "Sejam envergonhados e desonrados * os que buscam a minha alma."
V['69:4'] = "Voltem para trás, e {erubescant} * os que me querem mal."
V['69:5'] = "{v5order}: * e digam sempre os que amam a vossa salvação: Engrandecido seja o Senhor."
dec = {x['id']: x for x in d['decisions']}

# statim: the stylist's logo taken
s = dec['statim']
s['why'] += (" **Draft 2:** the stylist found *imediatamente* long and bureaucratic for a short Latin word, and asked for *logo*; taken as the plainer of two faithful words (D2). "
    "It makes 69:4b share *logo* with conféstim in the twin 39:16 (D41): two Latin adverbs over two Greek ones (παραυτίκα / παραχρῆμα), both 'at once', with no difference of sense for Portuguese to carry. MS1932 has *logo* here.")
s['options'] = [s['options'][1], s['options'][0], s['options'][2]]
s['options'][0]['note'] = "Ruling (draft 2): the stylist's; MS1932; shares conféstim's word (39:16, D41)."
s['options'][0]['from'] = 'stylist'
s['options'][1]['note'] = "Draft 1: free and plain, but six syllables; the stylist found it bureaucratic."

# v5 order
d['decisions'].append({
    "id": "v5order", "refs": ["69:5"],
    "latin": "Exsúltent et læténtur in te omnes qui quærunt te",
    "kind": "order",
    "why": ("Draft 1 copied 39:17 word for word: *Exultem e alegrem-se em vós todos os que vos buscam*. The stylist and the ambiguity reader both heard *em vós todos* as one phrase, 'in all of you', said to the congregation — a wrong first parse the Latin (*in te omnes*) does not have. "
            "Mended by order alone (D2): *Em vós* moved to the head, as the stylist proposed, so *todos* opens the subject. The words are 39:17's. **Ps 39:17 has the same fault and should follow** (proposed in the glossary; its folder is not touched here), so that the doublet reads alike again."),
    "options": [
        {"label": "Em vós exultem e se alegrem todos os que vos buscam", "forms": {"v5order": "Em vós exultem e se alegrem todos os que vos buscam"}, "note": "Ruling (draft 2): the stylist's order.", "from": "stylist"},
        {"label": "Exultem e alegrem-se em vós todos os que vos buscam", "forms": {"v5order": "Exultem e alegrem-se em vós todos os que vos buscam"}, "note": "Draft 1 = 39:17; *em vós todos* heard as 'in all of you' by two readers.", "from": "draft"},
        {"label": "Exultem e alegrem-se em vós, todos os que vos buscam", "forms": {"v5order": "Exultem e alegrem-se em vós, todos os que vos buscam"}, "note": "The comma only; the ear still joins *vós todos* in recitation.", "from": "draft"}
    ]})

# options for refused remarks
dec['intende']['options'].append({"label": "voltai-vos em meu auxílio", "forms": {"intende": "voltai-vos em meu auxílio"}, "note": "Stylist v1: a verb that governs *em*. Refused: *voltar-se* is convértere's verb (6:5 *Voltai-vos, Senhor*), and D40 is Gustavo's.", "from": "stylist"})
dec['intende']['why'] += " **Draft 2:** the stylist again found *atender em* not Portuguese (as in Ps 37); the ambiguity reader understood a plea for help. Held for D40, which is Gustavo's; the stylist's *voltai-vos* added as an option."
dec['adjutor']['why'] += " **Draft 2:** the v1 Latinist asked for *auxiliador* again (minor); held for the row, as at 39:18b."
dec['euge']['why'] += (" **Draft 2: all three v1 readers failed *Que bom* here** — the Latinist (minor, 'weakens the taunt'), the stylist ('warm and approving … the mockery is lost') and the ambiguity reader ('the mockery is not audible'). With the two Ps 39 readers that is five of five. Kept only because rule 6 binds this line to 39:16 and the row wants one ruling for 34:21, 34:25, 39:16, 69:4b; "
    "**proposed in the glossary: *Bem feito, bem feito* in all four**, since in the mouth of the mockers speaking *to me* (*qui dicunt mihi*) 'serves you right' is exactly the gloat; the 34:25 mishearing ('deserved punishment') is the same sense seen from outside.")
dec['avertantur']['why'] += (" **Draft 2:** the stylist asked *Voltem-se para trás* in 69:4 too, so both lines have the same form. Refused: *voltar-se para trás* is 'turn round to look behind', not retreat, and 69:4 keeps the retrórsum row's phrase (34:4b, 39:15b). "
    "The ambiguity reader heard *Voltem-se* as possibly 'be converted'; *logo, corando* and the mockers after it steer it to retreat, and he gave retreat as the likely hearing.")
dec['avertantur']['options'].append({"label": "Voltem-se para trás (in 69:4 as well)", "forms": {"avertantur": "Voltem-se para trás"}, "note": "Stylist v1; would also change 69:4.", "from": "stylist"})
dec['erubescere']['why'] += " **Draft 2:** the ambiguity reader listed *corem* as unknown and thought some may hear *correm* after *Voltem para trás*; the row's known cost, kept (the three shame-words must stay three). The faint *corem / querem* echo the stylist heard is not at a cadence (the colon ends on *mal*)."
dec['adjutor']  # unchanged
V['69:6'] = "Eu, porém, sou necessitado e pobre: * {deusvoc6}, {adjuva}."
d['decisions'].append({
    "id": "adjuva", "refs": ["69:6"], "latin": "Deus, ádjuva me", "kind": "glossary",
    "why": "adjuváre → *auxiliar* (row; 118:86 *auxiliai-me*), one family with 69:2b *auxiliar-me*, 69:6b *auxílio*, 39:14b. The stylist found *auxiliai-me* heavy at the psalm's most urgent cry and asked *socorrei-me*. Refused: it swaps the verb's family (the *socorr-* words are *ops*'s, D41) and breaks the Latin's echo *ad adjuvándum … ádjuva … Adjútor* inside one short psalm. Kept as an option.",
    "options": [
        {"label": "auxiliai-me", "forms": {"adjuva": "auxiliai-me"}, "note": "Ruling: the row.", "from": "glossary"},
        {"label": "socorrei-me", "forms": {"adjuva": "socorrei-me"}, "note": "Stylist v1; MS1932 *socorre-me*.", "from": "stylist"}
    ]})
d['choices']['69:3'] += " **Draft 2:** the comma before the subject removed (stylist: Portuguese does not part predicate and subject; the asterisk is the pause). 34:4 and 39:15b still have it; proposed in the glossary that they follow."
d['choices']['69:4'] = d['choices']['69:4'].replace("The first colon is four", "The comma before the subject removed in draft 2, as 69:3. The first colon is four")
d['status'] = 'draft'

d['audit'] += [
 {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Three minors, no major; none taken — each asks for a word ruled by a glossary row.",
  "outcomes": [
   {"verse": "69:3", "remark": "revereántur → confundidos, not desonrados", "outcome": "refused", "reason": "The reveréri row keeps a third word of shame beside confúndi → ser envergonhado (D15) and erubéscere → corar; *confundidos* is the word D15 took away from confúndi (heard as 'confused'). 69:3 = 34:4."},
   {"verse": "69:4b", "remark": "Que bom too neutral; Bem feito", "outcome": "option", "decision": "euge", "reason": "Right on the merits; held only for rule 6 (= 39:16) and proposed for the whole row."},
   {"verse": "69:6b", "remark": "adjútor → auxiliador", "outcome": "option", "decision": "adjutor", "reason": "The adjútor row (open, for Gustavo); held as at 39:18b."}]},
 {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Worst line 69:4b, best 69:6b. Seven remarks: three taken (comma, logo, 69:5 order), four refused and kept as options.",
  "outcomes": [
   {"verse": "69:2", "remark": "atender em not Portuguese; voltai-vos em meu auxílio", "outcome": "option", "decision": "intende", "reason": "D40 is deferred to Gustavo; voltar-se is convértere's verb."},
   {"verse": "69:3", "remark": "comma between predicate and subject", "outcome": "taken"},
   {"verse": "69:4", "remark": "Voltem vs Voltem-se; use Voltem-se para trás; corem/querem echo", "outcome": "option", "decision": "avertantur", "reason": "*voltar-se para trás* is turning round, not retreat; 69:4 keeps the retrórsum row. The echo is not at a cadence. (The comma in 69:4 was removed as in 69:3.)"},
   {"verse": "69:4b", "remark": "imediatamente → logo", "outcome": "taken"},
   {"verse": "69:4b", "remark": "Que bom → Bem feito", "outcome": "option", "decision": "euge", "reason": "Rule 6 (= 39:16); proposed for the row."},
   {"verse": "69:5", "remark": "em vós todos misparsed; Em vós exultem e se alegrem", "outcome": "taken"},
   {"verse": "69:6", "remark": "auxiliai-me heavy; socorrei-me", "outcome": "option", "decision": "adjuva", "reason": "Swaps adjuváre's family and breaks the psalm's ádjuva/adjútor echo."}]},
 {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. Nine readings, one unknown word (*corem*).",
  "outcomes": [
   {"verse": "69:2", "remark": "atendei em meu auxílio: come / pay attention", "outcome": "refused", "reason": "Both readings are the Latin's (*inténde*); D40."},
   {"verse": "69:3", "remark": "buscam a minha alma heard spiritually, not 'seek my life'", "outcome": "refused", "reason": "The Latin's image (ánimam), kept as in 34:4, 39:15."},
   {"verse": "69:4", "remark": "Voltem para trás: retreat / repent", "outcome": "refused", "reason": "He heard retreat as likely; the retrórsum row."},
   {"verse": "69:4", "remark": "corem unknown / heard correm", "outcome": "refused", "reason": "The erubéscere row's known cost; three shame-words must stay three."},
   {"verse": "69:4b", "remark": "Voltem-se: retreat / conversion", "outcome": "refused", "reason": "Retreat heard as likely; *logo, corando* steer it."},
   {"verse": "69:4b", "remark": "Que bom: mockery not audible", "outcome": "option", "decision": "euge", "reason": "Rule 6; proposed for the row."},
   {"verse": "69:5", "remark": "em vós todos = in all of you", "outcome": "taken"},
   {"verse": "69:5", "remark": "a vossa salvação: God's or the congregation's", "outcome": "refused", "reason": "He heard God's first; fixed by the order change too (no *vós todos* before it)."},
   {"verse": "69:5", "remark": "Engrandecido: praised / made bigger", "outcome": "refused", "reason": "Praised heard first; the magnificáre row."}]},
 {"step": "revision", "version": 2, "note": "v2: 69:4b *imediatamente* → *logo*; 69:5 *Em vós exultem e se alegrem todos os que vos buscam* (order, against the 'in all of you' parse — 39:17 should follow); commas before the subject removed in 69:3 and 69:4; new decisions v5order and adjuva; refused remarks recorded as options. Draft 1 kept as prayed.v1.json."}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
