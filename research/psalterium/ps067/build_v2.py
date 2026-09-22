"""Build ps067/prayed.json draft 2 from prayed.v1.json + critic outcomes.
Run: python3.13 research/psalterium/ps067/build_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
p['version'] = 2
v = p['verses']
dec = {d['id']: d for d in p['decisions']}
ch = p['choices']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def promote(did, label, new_why=None):
    d = dec[did]
    i = next(i for i, o in enumerate(d['options']) if o['label'] == label)
    d['options'].insert(0, d['options'].pop(i))
    if new_why:
        d['why'] += ' ' + new_why


# 67:5a, 67:33b — *sobe sobre* stammers (stylist). super → acima de.
v['67:5a'] = v['67:5a'].replace('que sobe sobre o poente', 'que sobe acima do poente')
v['67:33b'] = v['67:33b'].replace('que sobe sobre {caelicaeli}', 'que sobe acima {caelicaeli}')
for o in dec['caelicaeli']['options']:
    o['forms']['caelicaeli'] = 'd' + o['forms']['caelicaeli']
ch['67:5a'] += ' Draft 2: *sobe sobre* → *sobe acima do* (stylist: the stammer *so-be so-bre*); *super* is "above" as well as "upon", and 67:33b has the same change.'
ch['67:33b'] += ' Draft 2: *sobe acima do céu do céu*, as 67:5a.'

# 67:6b — word order (stylist).
v['67:6b'] = 'Deus está no seu lugar santo: * Deus, que faz habitar numa casa {moris}:'
ch['67:6b'] += ' Draft 2: the object after *habitar numa casa* (stylist: wedged between *faz* and *habitar*, the ear lost the verb); order yields to the ear (D2), the colon now ends on *costume*.'

# étenim — *pois também* heard as translationese (stylist); *até* where the *et* includes.
d = dec['etenim']
d['why'] = ('The glossary gives *étenim → pois*. The Greek is καὶ γάρ each time. In 67:9 and 67:19b the *et* is inclusive (the heavens too; even the unbelievers) and *até* carries it; in 67:17b there is nobody else to include, and the row\'s bare *pois* stands. Draft 1 had *pois também* in all three; the stylist heard it as translationese.')
d['options'] = [
    opt('pois até (9) · pois (17b) · Pois até (19b)', {'etenim9': 'pois até', 'etenim17': 'pois', 'etenim19': 'Pois até'}, 'draft 2', 'stylist'),
    opt('pois também', {'etenim9': 'pois também', 'etenim17': 'pois também', 'etenim19': 'Pois também'}, 'draft 1', 'draft'),
    opt('pois', {'etenim9': 'pois', 'etenim17': 'pois', 'etenim19': 'Pois'}, 'the glossary row', 'glossary'),
    opt('e até (9) · porque (17b) · E até (19b)', {'etenim9': 'e até', 'etenim17': 'porque', 'etenim19': 'E até'}, 'the stylist\'s wording; *e até* loses the "for"', 'stylist'),
]

# 67:14 — *a parte de trás* prosaic (stylist).
v['67:14'] = 'Se dormirdes {cleros}, asas de pomba prateadas, * e o seu dorso, por trás, {pallore}.'
ch['67:14'] += ' Draft 2: *posterióra dorsi* → *o seu dorso, por trás* (stylist: *a parte de trás do seu dorso* read like a manual); the "hinder part" survives as the adverb.'

# pinguis — *gordo* heard as comic by the stylist and the ambiguity reader.
d = dec['pinguis']
d['options'].insert(0, opt('monte farto', {'pinguis15': 'monte farto', 'pinguis16': 'monte farto'}, 'draft 2 — the stylist\'s word', 'stylist'))
d['options'][1]['note'] = 'draft 1 — the glossary row; two readers heard it as comic'
d['why'] += ' Draft 2: both the stylist and the ambiguity reader heard *monte gordo* as fat, faintly comic. *Farto* ("well-fed, full, abundant") keeps a concrete body-image of plenty, still not an explanation like *fértil*; the glossary row *pinguis → gordo* is unchanged for animals and men.'

# suspicamini — *suspeitais* + bare object heard as broken (stylist); the vocative was inaudible (ambiguity).
promote('suspicamini', 'por que suspeitais de',
        'Draft 2: the stylist heard the bare object as broken Portuguese, and the ambiguity reader heard only the object reading anyway: the vocative the draft meant to keep was not reaching the ear. *suspeitar de* takes the object reading (MS1932\'s); DRB\'s vocative stays an option.')
dec['suspicamini']['options'][0]['note'] = 'draft 2 — the object reading (MS1932\'s parse)'

# 67:19b — *criam* heard as *criar* (stylist, ambiguity).
d = dec['credentes']
d['options'].insert(0, opt('os que não acreditavam * que o Senhor Deus habitasse', {'credentes': 'os que não acreditavam', 'inhabitare': 'que o Senhor Deus habitasse.'}, 'draft 2 — *acreditar* for *crer*, the same parse', 'stylist'))
d['options'][1]['note'] = 'draft 1 — *criam* heard as *criar* by two readers'
d['why'] += ' Draft 2: the stylist and the ambiguity reader both heard *criam* as "create/raise". *Acreditar* is the plain verb for "believe that" and has no homophone.'

# 67:24 — ex inimícis read as apposition (Latinist).
v['67:24'] = 'Para que o teu pé se tinja no sangue: * a língua dos teus cães, de entre os inimigos, {abipso}.'
ch['67:24'] += ' Draft 2: *ex inimícis* → *de entre os inimigos* (Latinist: the bare *dos inimigos* made the dogs the enemies; *ex* is source).'

# 67:25 — *entradas* heard as tickets / starters (stylist, ambiguity).
promote('ingressus', 'os vossos passos … os passos',
        'Draft 2: the stylist and the ambiguity reader both heard *entradas* as tickets or starters. *Passos* is the going, the gait in procession (DRB "goings"); it is also *gressus*\'s word (16:5), which is the root of *ingréssus* — a near-collision accepted.')
dec['ingressus']['options'][0]['note'] = 'draft 2'

# 67:28a — *fora de si* heard as anger / madness (Latinist, stylist, ambiguity).
promote('excessu', 'em êxtase',
        'Draft 2: all three readers heard *fora de si* as fury or madness. ἔκστασις is the Latin\'s *excéssus*; *em êxtase* is its own descendant and says rapture. The row\'s *fora de mim* (30:23) stays for the psalmist\'s panic there; *mentis* is lost here, as it was there.')
dec['excessu']['options'][0]['note'] = 'draft 2 — three readers'

p['audit'].append({
    'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
    'note': '6 minor, no major; 2 taken, 4 refused (kept as options or answered in decisions).',
    'outcomes': [
        {'verse': '67:13', 'remark': '*cabe* supplies a verb; leave the dative + infinitive bare', 'outcome': 'option', 'decision': 'speciei',
         'reason': 'the ambiguity reader could not follow even the *cabe* version; the bare form is option 2'},
        {'verse': '67:15', 'remark': '*ficarão brancos* loses the passive; *serão embranquecidos*', 'outcome': 'refused',
         'reason': 'D44 *dealbári → ficar (mais) branco*: the resultative is the ruled form, and *embranquecidos* is heavy'},
        {'verse': '67:20', 'remark': '*salutárium* is plural', 'outcome': 'option', 'decision': 'salutarium',
         'reason': 'number is grammar here (D27); *das nossas salvações* is option 2'},
        {'verse': '67:24', 'remark': '*dos inimigos* reads as apposition; *ex* is source', 'outcome': 'taken',
         'reason': '*de entre os inimigos* in place of his *a partir dos inimigos*'},
        {'verse': '67:28a', 'remark': '*fora de si* is rage; *em êxtase da mente*', 'outcome': 'taken', 'decision': 'excessu',
         'reason': '*em êxtase*; *da mente* after *êxtase* is redundant in Portuguese'},
        {'verse': '67:36', 'remark': '*seja* supplies a mood; *bendito Deus* as 67:20', 'outcome': 'option', 'decision': 'benedictus',
         'reason': '67:20 has an article (*Bendito o Senhor*) and stands verbless; *bendito Deus* is heard as a noun phrase, "blessed God"'},
    ],
})
p['audit'].append({
    'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
    'note': '13 remarks in 12 verses; 12 taken (some reworded), 1 refused. Best line 67:26, worst 67:19b.',
    'outcomes': [
        {'verse': '67:5a', 'remark': '*sobe sobre* stammers; *sobe acima do poente*', 'outcome': 'taken'},
        {'verse': '67:6b', 'remark': 'object wedged between *faz* and *habitar*', 'outcome': 'taken'},
        {'verse': '67:7b', 'remark': '*com força* colloquial; *com fortaleza*', 'outcome': 'refused',
         'reason': 'row *fortitúdo → força* (as 67:36); the ambiguity reader heard God\'s strength, which is one of the two readings the Latin holds'},
        {'verse': '67:9', 'remark': '*pois também* translationese; *A terra tremeu, e até*', 'outcome': 'taken', 'decision': 'etenim',
         'reason': '*pois até* keeps the "for"; *foi abalada* kept (row *movéri*)'},
        {'verse': '67:14', 'remark': '*a parte de trás* prosaic; *o seu dorso, por trás*', 'outcome': 'taken'},
        {'verse': '67:15', 'remark': '*gordo* comic; *farto*', 'outcome': 'taken', 'decision': 'pinguis'},
        {'verse': '67:16b', 'remark': '*gordo* again; keep the pair', 'outcome': 'taken', 'decision': 'pinguis'},
        {'verse': '67:16b', 'remark': '*suspeitais* + bare object sounds broken; *suspeitais de*', 'outcome': 'taken', 'decision': 'suspicamini'},
        {'verse': '67:17b', 'remark': '*pois também* again; *porque*', 'outcome': 'taken', 'decision': 'etenim',
         'reason': 'the row\'s *pois*'},
        {'verse': '67:19b', 'remark': '*criam* heard as *criar*; *E até os que não acreditavam*', 'outcome': 'taken', 'decision': 'credentes',
         'reason': '*Pois até os que não acreditavam*: the "for" kept'},
        {'verse': '67:25', 'remark': '*entradas* = tickets, starters; *passos*', 'outcome': 'taken', 'decision': 'ingressus'},
        {'verse': '67:28a', 'remark': '*fora de si* heard as anger; *em arrebatamento*', 'outcome': 'taken', 'decision': 'excessu',
         'reason': '*em êxtase*, the Latinist\'s word'},
        {'verse': '67:33b', 'remark': '*sobe sobre* again', 'outcome': 'taken'},
    ],
})
p['audit'].append({
    'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context, blind)',
    'note': '52 ambiguities, 12 unknown words (mostly proper names). Most are the Latin\'s own obscurity and are kept (67:5b, 67:7b, 67:10–11 *ela/nela*, 67:13, 67:14, 67:15, 67:19a, 67:21, 67:23, 67:27, 67:31a, 67:34b). Acted on the ones where the Portuguese added a sense the Latin lacks.',
    'outcomes': [
        {'verse': '67:19b', 'remark': '*criam* heard as *criar*', 'outcome': 'taken', 'decision': 'credentes'},
        {'verse': '67:28a', 'remark': '*fora de si* heard as madness', 'outcome': 'taken', 'decision': 'excessu'},
        {'verse': '67:25', 'remark': '*entradas* as tickets / doorways', 'outcome': 'taken', 'decision': 'ingressus'},
        {'verse': '67:15', 'remark': '*monte gordo* strange or funny', 'outcome': 'taken', 'decision': 'pinguis'},
        {'verse': '67:16b', 'remark': 'the vocative reading of *montes coalhados* inaudible', 'outcome': 'taken', 'decision': 'suspicamini',
         'reason': 'the object reading made explicit'},
        {'verse': '67:5a', 'remark': 'the rubric *(faz-se reverência)* would be heard as text if read aloud', 'outcome': 'refused', 'decision': 'reverentia',
         'reason': 'a rubric is not read aloud; left to the coordinator, as flagged in draft 1'},
        {'verse': '67:31a', 'remark': '*provados com a prata* heard as bribed', 'outcome': 'refused',
         'reason': 'the Latin\'s ablative, left open; *probáre → provar* (row)'},
        {'verse': '67:18', 'remark': '*carro* may sound modern', 'outcome': 'refused', 'decision': 'currus',
         'reason': 'the reader heard *chariot* in context; *carro de guerra* is option 2'},
    ],
})

p['audit'].append({'step': 'checks', 'note': 'Draft 2: hard checks pass. New soft flags: 67:5a +5 (*acima do*), 67:19b first colon +4 (*acreditavam*) — both accepted, the price of the stylist fixes. 67:16b and 67:17b no longer flagged. The rest as draft 1.'})

(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote v2')
