"""Ps 91 draft 2 from the v1 readers (latinist, stylist, ambiguity — claude-opus-5-5, fresh context). Idempotent."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] >= 2:
    raise SystemExit('already v2')
dec = {x['id']: x for x in d['decisions']}


def opt(label, forms, note, frm):
    return {"label": label, "forms": forms, "note": note, "from": frm}


def promote(did, label, note_add=''):
    """Move the option with this label to the front."""
    opts = dec[did]['options']
    i = next(i for i, o in enumerate(opts) if o['label'] == label)
    o = opts.pop(i)
    if note_add:
        o['note'] += ' — ' + note_add
    opts.insert(0, o)
    return o


v = d['verses']
v['91:4'] = '{decachordo}: * com o cântico, com a cítara.'
v['91:11'] = 'E será exaltado o meu chifre {unicornis}: * e a minha velhice{v11b} {uber}.'
v['91:12'] = 'E o meu olho {despexit} os meus inimigos: * e o meu ouvido ouvirá {ininsurg} que se levantam contra mim.'
v['91:15'] = 'Ainda {multiplicabuntur} em velhice {uber}: * e {benepatientes}, para que anunciem:'

# 91:2 vocative made explicit
a = dec['altissime']
a['options'].insert(0, opt(', ó Altíssimo, ao vosso nome', {"altissime": ", ó Altíssimo, ao vosso nome"}, "draft 2 — the ambiguity reader heard the bare 'Altíssimo' as the one sung to ('to the Most High, to your name'); 'ó' marks the vocative", "ambiguity"))
a['why'] += " Draft 2 adds 'ó': without it the ambiguity reader heard 'Altíssimo' as an indirect object, not as the address."

# 91:4 the instrument itself
promote('decachordo', 'Com o instrumento de dez cordas, com o saltério', 'draft 2: the Latinist (minor) — decachórdum is the instrument, not its strings; the ambiguity reader heard only ten strings')
dec['decachordo']['options'].append(opt('No decacórdio, no saltério', {"decachordo": "No decacórdio, no saltério"}, "the Latinist's own fix (with 'na cítara'); refused — 'decacórdio' is a dictionary word no one knows", "latinist"))
dec['decachordo']['why'] += " Draft 2: both the Latinist and the ambiguity reader heard 'as dez cordas' as strings, not an instrument; DRB's wording taken, at +6 syllables (sayable in one breath)."

# 91:5 feitura
promote('factura', 'com a vossa feitura', "draft 2: the Latinist (minor) — the noun kept as a noun; the stylist also refused the clause (vaguer, and a chime -astes / -estes)")
dec['factura']['options'][-1]['note'] += "; the stylist's proposal, refused: it makes one word of factúra and ópera, which the Latin (and the Greek ποίημα / ἔργα) keep apart"
dec['factura']['options'][-1]['from'] = 'stylist'
dec['factura']['why'] += " Draft 2 takes the cognate 'feitura' (the Latinist); the clause stays an option."

# 91:9 bare purpose clause
promote('ut', 'Para que', "draft 2: the Latinist (minor) — the copula settled a link the Latin leaves loose; the ambiguity reader could not tell what 'É' referred to")
dec['ut']['why'] += " Draft 2 returns to the Latin's bare clause, on two readers' remarks."
dec['intereant']['options'][1]['note'] += "; the Latinist's fix (minor) — refused: the interíre row keeps 'extinguir-se', so that intéreant and períbunt (91:10) stay two verbs as in the Latin"
dec['intereant']['options'][1]['from'] = 'latinist'

# 91:11 'em' and the verb first
d11 = dec['v11b']
d11['options'].insert(0, opt(', em misericórdia', {"v11b": ", em misericórdia"}, "draft 2 — the stylist: 'numa' conversational; 'em' plainer, and 91:15 follows ('em velhice fecunda')", "stylist"))
dec['uber']['why'] += " Draft 2: 'em' without the article in both places (the stylist)."
dec['unicornis']['why'] += " Draft 2 puts the verb first, the Latin's order (the stylist: it eases the run-up to the mediant)."

# 91:12
dec['despexit']['options'].insert(2, opt('viu do alto', {"despexit": "viu do alto"}, "the stylist, against the 'olho olhou' jingle (his worst line) — refused: the same Latin as 53:9 (despéxit óculus meus) keeps the same Portuguese (rule 6); the jingle is the row's known cost", "stylist"))
dec['despexit']['why'] += " The v1 stylist named 91:12 the worst line for the jingle; held for 53:9's sake, and flagged in the glossary row: if Gustavo lifts it, 53:9 and 91:12 change together."
dec['ininsurg']['why'] += " Draft 2 puts the subject first (the stylist: 'o meu ouvido ouvirá dos malvados'), so the two echoes of the verse are further apart and the colon ends on 'mim'. The ambiguity reader heard 'hear the wicked themselves' — one of the two readings the Latin leaves open."

# 91:15
promote('benepatientes', 'passarão bem', "draft 2: the Latinist (minor) — a verb of faring keeps the participle of pati; the stylist and the ambiguity reader found 'estarão bem' flat ('they'll be fine')")
dec['benepatientes']['options'].append(opt('serão bem tratados', {"benepatientes": "serão bem tratados"}, "the stylist (DRB 'well treated') — refused: it makes them passive and supplies someone who treats them", "stylist"))
dec['benepatientes']['why'] += " Draft 2 takes 'passarão bem'. Risk to watch: 'passarão' heard as 'pass by'."
dec['multiplicabitur']['why'] += " The ambiguity reader heard 'grow / increase' first — the sense passed."

d['choices']['91:4'] += " Draft 2: 'com o cântico' (the stylist — the article, as with the three instruments around it)."
d['choices']['91:12'] += " The past / future sequence the ambiguity reader found jarring is the Latin's (despéxit … áudiet)."
d['choices']['91:11'] += " The ambiguity reader heard the cuckold's 'chifre' and a mythical unicorn: both rows keep the Latin's image unexplained (as 74:11, 21:22)."

d['version'] = 2
d['status'] = 'draft'
d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. No critical or major; four minors, three taken, one half-taken.",
     "outcomes": [
        {"verse": "91:4", "remark": "'as dez cordas' turns the instrument into strings", "outcome": "taken", "decision": "decachordo", "reason": "Taken with DRB's 'o instrumento de dez cordas', not his 'decacórdio' (unknown word; kept as an option)."},
        {"verse": "91:5", "remark": "factura a noun, not a past relative clause", "outcome": "taken", "decision": "factura"},
        {"verse": "91:9", "remark": "'É' resolves the loose ut-clause", "outcome": "taken", "decision": "ut"},
        {"verse": "91:9", "remark": "'se extingam' freer than intereant", "outcome": "refused", "decision": "intereant", "reason": "The interíre row (36:38) gives 'extinguir-se'; 'pereçam' would merge intéreant with períbunt in the next verse."},
        {"verse": "91:15", "remark": "'estarão bem' flattens the participle; 'passarão bem'", "outcome": "taken", "decision": "benepatientes"}
     ]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Seven remarks: four taken, three refused with options. Best 91:13, worst 91:12.",
     "outcomes": [
        {"verse": "91:4", "remark": "uneven articles: 'com o cântico'", "outcome": "taken"},
        {"verse": "91:5", "remark": "clause vague, -astes/-estes chime; 'com a vossa obra'", "outcome": "option", "decision": "factura", "reason": "The clause is gone (the Latinist's 'feitura'), but 'obra' is refused: it merges factúra with ópera."},
        {"verse": "91:11", "remark": "'numa' conversational → 'em'", "outcome": "taken", "decision": "v11b"},
        {"verse": "91:11", "remark": "verb first: 'E será exaltado o meu chifre'", "outcome": "taken", "decision": "unicornis"},
        {"verse": "91:12", "remark": "'olho olhou' jingle; 'viu do alto'", "outcome": "option", "decision": "despexit", "reason": "Identical Latin to 53:9, which has 'o meu olho olhou de cima'; rule 6. Flagged for Gustavo in the despícere row."},
        {"verse": "91:12", "remark": "'ouvirá o meu ouvido' → subject first", "outcome": "taken", "decision": "ininsurg"},
        {"verse": "91:15", "remark": "'estarão bem' casual → 'serão bem tratados'; 'numa' → 'em'", "outcome": "option", "decision": "benepatientes", "reason": "'em velhice' taken; 'bem tratados' refused (supplies an agent, makes them passive); 'passarão bem' taken instead from the Latinist."}
     ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. 20 readings, 4 unknown words (saltério, cítara, fecunda, átrios).",
     "outcomes": [
        {"verse": "91:2", "remark": "'Altíssimo' heard as the one sung to, not a vocative", "outcome": "taken", "decision": "altissime"},
        {"verse": "91:4", "remark": "'as dez cordas' heard as strings", "outcome": "taken", "decision": "decachordo"},
        {"verse": "91:4", "remark": "'saltério' heard as the book of Psalms; saltério, cítara unknown", "outcome": "refused", "reason": "The Latin word has the same double sense; the glossary rows keep both instruments (80:3)."},
        {"verse": "91:9", "remark": "what 'É' refers to is unclear", "outcome": "taken", "decision": "ut"},
        {"verse": "91:11", "remark": "chifre as cuckold; unicorn as mythical; verbless colon unclear", "outcome": "refused", "reason": "The Latin's images and ellipsis (cornu, unicórnis rows; the ellipsis kept on purpose)."},
        {"verse": "91:12", "remark": "hear the wicked themselves vs. news of their downfall; past-then-future", "outcome": "refused", "decision": "ininsurg", "reason": "Both readings are the Latin's; the tenses are the Latin's."},
        {"verse": "91:15", "remark": "'estarão bem' weak and vague", "outcome": "taken", "decision": "benepatientes"},
        {"verse": "91:11", "remark": "'fecunda' unknown", "outcome": "refused", "decision": "uber", "reason": "Kept; 'abundante' is the option, but it does not fit 'velhice' in 91:15."}
     ]},
    {"step": "revision", "version": 2, "note": "v2: 91:2 'ó Altíssimo'; 91:4 'Com o instrumento de dez cordas', 'com o cântico'; 91:5 'feitura'; 91:9 bare 'Para que'; 91:11 verb first, 'em misericórdia'; 91:12 subject before 'ouvirá'; 91:15 'em velhice', 'passarão bem'. Draft 1 kept as prayed.v1.json."}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
print('v2')
