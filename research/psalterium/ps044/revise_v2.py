"""Draft 2 of Ps 44 from prayed.v1.json after the three readers. Run: python3.13 research/psalterium/ps044/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


# --- address templates (both forms) -------------------------------------------------------------
addr = dec['address']['options']
tu, vos = addr[0]['forms'], addr[1]['forms']
tu['A3'] = 'És {spec3}, † {diffusa}: * por isso Deus te bendisse para sempre.'
vos['A3'] = 'Sois {spec3}, † {diffusa_v}: * por isso Deus vos bendisse para sempre.'
tu['A4'] = 'Cinge a tua espada sobre a tua {femur}, * {potent}.'
# the bare *Cingi* is also "I girded" (D1); the vós form keeps the reflexive, which D13's enclitic allows
vos['A4'] = 'Cingi-vos com a vossa espada sobre a vossa {femur}, * {potent}.'
tu['A9'] = 'Mirra, e {gutta}, e cássia, das tuas vestes, das casas de marfim: * {exq} te deleitaram as filhas dos reis {honor}.'
vos['A9'] = 'Mirra, e {gutta}, e cássia, das vossas vestes, das casas de marfim: * {exq} vos deleitaram as filhas dos reis {honor_v}.'
dec['address']['options'][1]['note'] += ' In 44:4 the vós form keeps the reflexive *Cingi-vos com* — the bare *Cingi a vossa espada* is also "I girded" (D1).'

# --- 44:3 diffusa: the stylist's order refused, kept as an option ---------------------------------
d = dec['diffusa']
d['why'] += (' The stylist asked *nos teus lábios se derramou a graça* (the colon ends on *lábios* before the flex; verb-first "sounds translated"). Refused: '
             'the antiphon *Diffúsa est grátia in lábiis tuis* must be sayable alone and verb-first, and the flex falls on *lábios*, a paroxytone. The '
             'stylist\'s order is option 2; the slot now carries the whole colon so that it can.')
d['options'] = [
    opt('derramou-se a graça nos teus lábios', {'diffusa': 'derramou-se a graça nos teus lábios', 'diffusa_v': 'derramou-se a graça nos vossos lábios'},
        'Ruling: the Latin\'s order; MS1932 *derramou-se*.', 'MS1932'),
    opt('nos teus lábios se derramou a graça', {'diffusa': 'nos teus lábios se derramou a graça', 'diffusa_v': 'nos vossos lábios se derramou a graça'},
        'The stylist\'s order; the antiphon would lose its opening verb.', 'stylist'),
    opt('difundiu-se a graça nos teus lábios', {'diffusa': 'difundiu-se a graça nos teus lábios', 'diffusa_v': 'difundiu-se a graça nos vossos lábios'},
        'The cognate; heard as "spread (news)".', 'draft'),
]

# --- 44:5a prospere --------------------------------------------------------------------------------
d = dec['prospere']
d['why'] += ' Draft 2 takes the stylist\'s *avança próspero*: the adjective for the adverb keeps the root and the three quick imperatives.'
d['options'].insert(0, opt('avança próspero', {'prospere': 'avança próspero', 'prospere_v': 'avançai próspero'},
                           'Ruling (v2): the stylist\'s; the adjective agrees with the one addressee (singular with the *vós* of majesty).', 'stylist'))
d['options'][1]['note'] = 'Draft 1; the stylist: "sounds like a finance report".'
d['options'][1]['label'] = 'avança com prosperidade'

# --- 44:8 prae ------------------------------------------------------------------------------------
d = dec['prae']
d['why'] += (' Draft 2 takes the stylist\'s *acima dos*: *mais que aos* trips the mouth at the end of the longest colon, and above in rank is what *præ* says of an '
             'anointing. 44:3 keeps *mais … que*, where the build is an adjective\'s comparison.')
d['options'] = [d['options'][1], d['options'][0], d['options'][2]]
d['options'][0]['note'] = 'Ruling (v2): the stylist\'s; DRB "above".'
d['options'][0]['from'] = 'stylist'
d['options'][1]['note'] = 'Draft 1: *præ* as in 44:3; the stylist found *que aos* clumsy.'

# --- 44:9 ex quibus ---------------------------------------------------------------------------------
dec_exq = {
    'id': 'exquibus', 'refs': ['44:9'], 'latin': 'ex quibus', 'kind': 'grammar',
    'why': ('*ex quibus* is a relative of place or source; its antecedent is open (the houses, or everything named). Draft 1 *das quais* followed *das tuas vestes, '
            'das casas* and made *das* three times running (the stylist). *de onde* keeps the source and the openness — it can look back to the garments or the houses.'),
    'options': [
        opt('de onde', {'exq': 'de onde'}, 'Ruling (v2): the stylist\'s.', 'stylist'),
        opt('das quais', {'exq': 'das quais'}, 'Draft 1; the relative\'s gender points at the houses.', 'draft'),
    ],
}

# --- 44:9 gutta: keep, add the stylist's option -------------------------------------------------------
d = dec['gutta']
d['why'] += (' The stylist asked *resina*, the ambiguity reader found *gota* puzzling (drop or gout, "drop" listed); the Latin names a drop, and a Latin '
             'reader of the column sees *gutta*. Held; *resina* is the option.')
d['options'].insert(1, opt('resina', {'gutta': 'resina'}, 'The stylist\'s: the Greek\'s thing (στακτή), not the Latin\'s word.', 'stylist'))

# --- 44:9 honor: add the stylist's reason -------------------------------------------------------------
dec['honor']['why'] += ' The stylist asked for the idiom *em tua honra*; refused for the reason above.'

# --- 44:10b vestitu ------------------------------------------------------------------------------------
d = dec['vestitu']
d['why'] += (' Draft 2 takes the stylist\'s *em veste dourada*: *vestido* is heard as a modern dress. *vestítus* here and *vestis* at 21:19 (*veste*) are both ἱματισμός, '
             'so sharing *veste* passes D15\'s test; *vestiménta* (ἱμάτια, 44:9 *vestes*) is the same Greek root, and the number still tells them apart here.')
d['options'] = [d['options'][1], d['options'][0], d['options'][2]]
d['options'][0]['note'] = 'Ruling (v2): the stylist\'s; one root with *vestes* (44:9), as the Greek.'
d['options'][0]['from'] = 'stylist'
d['options'][1]['note'] = 'Draft 1; heard as a modern dress (the stylist).'

# --- varietas ----------------------------------------------------------------------------------------------
d = dec['varietas']
d['why'] += (' All three readers faulted *variedade*: the stylist ("an assortment, never variegated cloth"), the blind reader ("vague"), and the Latinist the '
             'lost plural in 44:14. Draft 2 takes *cores variadas* in both verses: *várietas* of cloth is its many colours (L&S), the Greek is "many-coloured", '
             'and the plural *cores* answers the Latinist too. Cost: *cores* names what the Latin only implies.')
d['options'] = [
    opt('de cores variadas', {'var10': 'cercada de cores variadas', 'var14': 'revestida de cores variadas'}, 'Ruling (v2): the stylist\'s.', 'stylist'),
    opt('de variedade', {'var10': 'cercada de variedade', 'var14': 'revestida de variedade'}, 'Draft 1: the Latin\'s noun; heard as vague.', 'draft'),
    opt('de variedade … de variedades', {'var10': 'cercada de variedade', 'var14': 'revestida de variedades'}, 'The Latinist: the Latin\'s numbers; *variedades* is a variety show.', 'latinist'),
    opt('de bordados', {'var10': 'cercada de bordados', 'var14': 'revestida de bordados'}, 'The craft; supplies it.', 'draft'),
]

# --- 44:12 --------------------------------------------------------------------------------------------------
data['verses']['44:12'] = 'E o Rei {concup}: * porque ele é o Senhor, o teu Deus, e hão de adorá-lo.'
d = dec['concupiscet']
d['why'] += (' The stylist asked *desejará* (plainer); refused: 118:20 sets *concupíscere* and *desideráre* in one verse, so one Portuguese verb cannot serve both. '
             'The Latinist asked *formosura* for *decor* ("comeliness, not radiance"); refused: *formosura* is *spécies*\' (44:5a) and the decor row keeps the three '
             'words of beauty apart; *beleza* merges it with *pulchritúdo* in the same psalm.')
d['options'].append(opt('ansiará pela tua formosura', {'concup': 'ansiará pela tua formosura'}, 'The Latinist\'s; merges *decor* with *spécies* (44:5a).', 'latinist'))

# --- 44:14 ejus -----------------------------------------------------------------------------------------------
data['verses']['44:14'] = '{omnis} {abintus}, * em franjas de ouro, {var14}.'
data['decisions'].append({
    'id': 'ejus', 'refs': ['44:14'], 'latin': 'Omnis glória ejus fíliæ Regis', 'kind': 'grammar',
    'why': ('The Latin (after the Greek αὐτῆς θυγατρός) says "all her glory, of the king\'s daughter" — a resumptive pronoun. The Latinist asked to keep it. '
            'It is grammar, not a word or an image (D2): Portuguese reads the doubled possessor as a correction in mid-sentence; DRB and MS1932 drop it.'),
    'options': [
        opt('Toda a glória da filha do Rei', {'omnis': 'Toda a glória da filha do Rei'}, 'Ruling: the pronoun absorbed.', 'draft'),
        opt('Toda a sua glória, da filha do Rei,', {'omnis': 'Toda a sua glória, da filha do Rei,'}, 'The Latinist\'s: the resumptive kept.', 'latinist'),
    ],
})
dec['abintus']['why'] += ' The stylist asked *vem de dentro* (origin); refused — it adds motion; the blind reader heard *é de dentro* as an inward, spiritual glory.'
for o in dec['abintus']['options']:
    if o['label'] == 'vem de dentro':
        o['note'] = 'The stylist\'s; supplies motion.'
        o['from'] = 'stylist'

# --- 44:13, 44:17, 44:18a: refusals recorded -------------------------------------------------------------------
dec['munera']['why'] += (' The stylist asked *ofertas* for the paroxytone mediant; refused: *oferta* is D41\'s for *pro peccáto* and *offérre*\'s family; the '
                         'Latin\'s own mediant is a proparoxytone. *presentes* stays the option.')
dec['constitues']['why'] += ' The stylist asked *farás* (plainer); refused: *fazer* is *fácere*\'s (the row already refused *fui feito Rei* at 2:6).'
dec['constitues']['options'].append(opt('farás', {'constit': 'farás', 'constit_v': 'fareis'}, 'The stylist\'s; *fácere*\'s verb.', 'stylist'))
d = dec['generatio']
d['why'] += (' The Latinist asked *em toda geração e geração* (minor); refused — it is not a Portuguese phrase, and the formula row (with MS1932) already says '
             'every generation by its doubling.')
d['options'].append(opt('em toda geração e geração', {'gener': 'em toda geração e geração'}, 'The Latinist\'s calque.', 'latinist'))

# --- choices ------------------------------------------------------------------------------------------------------
data['choices']['44:2b'] += (' The blind reader said *pena* may be heard as "pity"; the context (*de um escriba que escreve*) settles it — *o cálamo* is the option.')
data['choices']['44:9'] = data['choices']['44:9'].replace('*ex quibus* → *das quais*, open between the houses and the spices as the Latin is.', '*ex quibus* → *de onde* (decision `exquibus`).')
dec['species']['why'] += ' The spécies row (open, Ps 46:5) proposes exactly this split for 44:5a — aligned.'
data['choices']['44:4'] = 'Draft 2: *Cinge a tua espada* (the stylist): *cingir* takes the sword as its object in Portuguese, as περίζωσαι τὴν ῥομφαίαν does; the Latin\'s middle *accíngere* with an ablative is grammar (D2). The blind reader listed *Cinge-te* as unknown.'
data['choices']['44:5a'] = '*atende* was heard by the blind reader as "pay attention", which it found odd before *avança*; that is one sense the Latin\'s absolute *inténde* has — decision `intende`, held.'
data['choices']['44:6'] = 'The blind reader found *nos corações dos inimigos do Rei* detached; so is the Latin\'s *in corda* — kept (decision `incorda`).'
data['choices']['44:12'] += ' Draft 2: *e hão de adorá-lo* (the stylist: *e o adorarão* blurs its vowels in choir) — order and form only (D2).'
data['choices']['44:15b'] = data['choices']['44:15b'] + ' The blind reader could not tell whose *lhe* and whose *te*; nor can the Latin reader (*ejus … tibi*).'

data['decisions'].append(dec_exq)
data['version'] = 2
data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1, read by claude-opus-5-5 (fresh context; Codex out of credits). No major; four minors. «The translation is faithful and close to the Latin throughout.» One taken (by another route), three refused.',
     'outcomes': [
         {'verse': '44:14', 'remark': 'varietátibus made singular', 'outcome': 'taken', 'decision': 'varietas', 'reason': 'Met by *cores variadas* (plural), which the stylist asked for; the Latinist\'s own *variedades* is option 3.'},
         {'verse': '44:14', 'remark': 'resumptive *ejus* dropped', 'outcome': 'option', 'decision': 'ejus', 'reason': 'Grammar (D2); reads as a mid-sentence correction in Portuguese; DRB and MS1932 drop it.'},
         {'verse': '44:18a', 'remark': '*de geração em geração* drops *omni* → *em toda geração e geração*', 'outcome': 'option', 'decision': 'generatio', 'reason': 'Not Portuguese; the formula row (and MS1932) holds.'},
         {'verse': '44:12', 'remark': '*decor* → *formosura*, not *esplendor*', 'outcome': 'option', 'decision': 'concupiscet', 'reason': '*formosura* is *spécies*\' in 44:5a; the decor row keeps the three words of beauty apart.'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1, read by claude-opus-5-5 (fresh context). Ten verses remarked; best 44:11, worst 44:9. «The psalm keeps the Latin\'s ceremonial shape … It stumbles where literalism produces abstract or foreign-sounding nouns.» Eight taken, seven refused (six kept as options; 44:13 *ofertas* not).',
     'outcomes': [
         {'verse': '44:3', 'remark': 'verb-first sounds translated → *nos teus lábios se derramou a graça*', 'outcome': 'option', 'decision': 'diffusa', 'reason': 'The antiphon *Diffúsa est grátia* must stand alone verb-first; *lábios* is paroxytone.'},
         {'verse': '44:4', 'remark': '*Cinge-te com* foreign → *Cinge a tua espada*', 'outcome': 'taken'},
         {'verse': '44:5a', 'remark': '*com prosperidade* abstract → *avança próspero*', 'outcome': 'taken', 'decision': 'prospere'},
         {'verse': '44:8', 'remark': '*mais que aos* clumsy → *acima dos*', 'outcome': 'taken', 'decision': 'prae'},
         {'verse': '44:9', 'remark': '*gota* baffling → *resina*', 'outcome': 'option', 'decision': 'gutta', 'reason': 'The Latin names the drop; *resina* is the Greek\'s thing.'},
         {'verse': '44:9', 'remark': '*das quais* hard, *das* ×3 → *de onde*', 'outcome': 'taken', 'decision': 'exquibus'},
         {'verse': '44:9', 'remark': '*na tua honra* not idiomatic → *em tua honra*', 'outcome': 'option', 'decision': 'honor', 'reason': 'The idiom settles "in tribute to"; the Latin\'s *in honóre tuo* is open.'},
         {'verse': '44:10b', 'remark': '*vestido* a modern dress → *veste*', 'outcome': 'taken', 'decision': 'vestitu'},
         {'verse': '44:10b', 'remark': '*variedade* abstract → *cores variadas*', 'outcome': 'taken', 'decision': 'varietas'},
         {'verse': '44:12', 'remark': '*ansiará pelo* stiff → *desejará*', 'outcome': 'option', 'decision': 'concupiscet', 'reason': '*desejar* is *desideráre*\'s; 118:20 has both verbs in one verse.'},
         {'verse': '44:12', 'remark': '*e o adorarão* blurs → *e hão de adorá-lo*', 'outcome': 'taken'},
         {'verse': '44:13', 'remark': 'proparoxytone mediant → *ofertas*', 'outcome': 'refused', 'reason': '*oferta(s)* is D41\'s and *offérre*\'s; the Latin\'s own mediant is proparoxytone; *presentes* is the row\'s option.'},
         {'verse': '44:14', 'remark': '*é de dentro* → *vem de dentro*', 'outcome': 'option', 'decision': 'abintus', 'reason': 'Adds motion; the blind reader heard *é de dentro* as inward glory.'},
         {'verse': '44:14', 'remark': '*revestida de variedade* → *cores variadas*', 'outcome': 'taken', 'decision': 'varietas'},
         {'verse': '44:17', 'remark': '*estabelecerás* bureaucratic → *farás*', 'outcome': 'option', 'decision': 'constitues', 'reason': '*fazer* is *fácere*\'s; the row refused *fui feito Rei* (2:6). *constituirás* is the option.'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': ('Draft 1, blind, read by claude-opus-5-5 (fresh context). 30 items, 8 unknown words (escriba, Cinge-te, gota as spice, cássia, mirra, Tiro, dádivas, franjas). '
              'Heard rightly: *derramou-se a graça* (divine grace first), *a tua direita te guiará*, *te ungiu Deus, o teu Deus*, *mais que aos teus companheiros* (above them), '
              '*das quais* (the houses), *pôs-se à tua direita*, *Ouve, filha* (the bride), *após ela* (in procession), *é de dentro* (inward glory). '
              '44:7 *ó Deus* heard as a turn to God, not to the king — the address decision\'s cost, noted there.'),
     'outcomes': [
         {'verse': '44:2b', 'remark': '*pena* may be heard as pity', 'outcome': 'refused', 'reason': 'Context (*de um escriba que escreve*) settles it; *o cálamo* is unknown to most (option).'},
         {'verse': '44:4', 'remark': '*Cinge-te* unknown', 'outcome': 'taken', 'reason': 'Now *Cinge a tua espada* (the stylist\'s).'},
         {'verse': '44:5a', 'remark': '*atende* heard as "pay attention", odd before *avança*', 'outcome': 'refused', 'decision': 'intende', 'reason': 'One sense of the Latin\'s absolute *inténde*; the bow and the road would each supply what the Latin leaves unsaid. For Gustavo.'},
         {'verse': '44:6', 'remark': '*nos corações* detached', 'outcome': 'refused', 'decision': 'incorda', 'reason': 'The Latin\'s *in corda* is as loose.'},
         {'verse': '44:9', 'remark': '*gota* drop or gout; no verb', 'outcome': 'refused', 'decision': 'gutta', 'reason': 'The Latin\'s word and verbless build; *resina* is the option.'},
         {'verse': '44:10b', 'remark': '*cercada de variedade* vague', 'outcome': 'taken', 'decision': 'varietas'},
         {'verse': '44:15b', 'remark': 'whose *lhe*, whose *te*', 'outcome': 'refused', 'reason': 'As open in the Latin (*ejus … tibi*).'},
         {'verse': '44:17', 'remark': 'addressee unclear (king or queen)', 'outcome': 'refused', 'reason': 'The Latin\'s *tuis … tibi* is as open; masculine only in the Hebrew.'},
     ]},
    {'step': 'revision', 'version': 2,
     'note': ('v2: 44:3 order (*nos teus lábios se derramou a graça*), 44:4 *Cinge a tua espada*, 44:5a *avança próspero*, 44:8 *acima dos*, 44:9 *de onde*, '
              '44:10b *em veste dourada*, 44:10b/14 *cores variadas*, 44:12 *e hão de adorá-lo*. New decisions `exquibus`, `ejus`; every refused remark kept as an option except 44:13 *ofertas* (D41).')},
]

(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote prayed.json v2')
