import json

path = '/Users/gustavo/Documents/prayer/.claude/worktrees/parallel-prancing-avalanche/research/psalterium/ps054/prayed.json'
d = json.load(open(path))
d['version'] = 2
v = d['verses']
v['54:11'] = 'De dia e de noite a cercará por sobre os seus muros a iniquidade: * e no meio dela há fadiga, e injustiça.'
v['54:12'] = 'E não {defecit} das suas praças * a usura, e o engano.'
v['54:20b'] = 'Pois para eles não há {commutatio}, e não temeram a Deus: * estendeu a sua mão {retribuendo}.'

dec = {x['id']: x for x in d['decisions']}


def front(did, label, forms, note, frm):
    opts = dec[did]['options']
    opts[:] = [o for o in opts if o['label'] != label]
    opts.insert(0, {'label': label, 'forms': forms, 'note': note, 'from': frm})


# 54:4
x = dec['declinaverunt']
x['why'] += (' **v2:** all three readers heard *voltaram* first as "came back" (a second time), a sense the Latin has not;'
             ' the reflexive *se voltaram* is "turned against" and nothing else. The price: *iniquitátes* becomes the subject,'
             ' and the object reading (the Greek\'s, DRB\'s *cast*) is kept only in the option *lançaram*. The glossary row'
             ' *declináre a* foresaw 20:12\'s wording here; 20:12 *voltaram males contra vós* carries the same risk — for review.')
front('declinaverunt', 'as iniquidades se voltaram contra mim',
      {'declinaverunt': 'as iniquidades se voltaram contra mim'},
      'v2; the stylist\'s wording; heard as "turned against", not "returned" (all three readers).', 'stylist')
x['options'].append({'label': 'declinaram iniquidades sobre mim',
                     'forms': {'declinaverunt': 'declinaram iniquidades sobre mim'},
                     'note': 'The Latinist (v1). The cognate; in Portuguese *declinar* + object is first "to decline, refuse".',
                     'from': 'latinist'})
for o in x['options']:
    if o['label'] == 'voltaram iniquidades contra mim':
        o['note'] = 'Draft 1; 20:12\'s build. Heard as "came back" by all three readers.'

# 54:8
x = dec['elongavi']
x['options'] = [o for o in x['options'] if o['label'] != 'Eis que me afastei fugindo']
x['options'].append({'label': 'Eis que me afastei, fugindo', 'forms': {'elongavi': 'Eis que me afastei, fugindo'},
                     'note': 'The stylist (v1) and MS1932. afastar is discédere\'s; the Latin\'s *longe* lost.', 'from': 'stylist'})

# 54:12
x = dec['defecit']
for o in x['options']:
    if o['label'] == 'se afastaram':
        o['label'] = 'se apartaram'
        o['forms'] = {'defecit': 'se apartaram'}
        o['note'] = 'The stylist (v1); MS1932 has *se afastaram*. apartar-se is declináre a\'s (glossary), afastar-se discédere\'s.'
        o['from'] = 'stylist'

# 54:14
x = dec['unanimis']
x['why'] += (' **v2:** the stylist and the blind reader both heard *homem de uma só alma* as "a man with a single soul" or'
             ' "a sincere man"; *comigo* is supplied (ἰσόψυχε is "equal-souled", equal to someone), as *Precipitai-os*'
             ' supplies an object against a wrong first hearing. 54:15 repeats *comigo* for the Latin\'s *mecum*.')
front('unanimis', 'de uma só alma comigo', {'unanimis': 'de uma só alma comigo'},
      'v2; the stylist; *with me* supplied against the reading "single-souled".', 'stylist')
for o in x['options']:
    if o['label'] == 'de uma só alma':
        o['note'] = 'Draft 1; úna ánima, bare. Heard as "only one soul" or "sincere".'
x = dec['notus']
x['options'] = [o for o in x['options'] if o['label'] != 'íntimo']
x['options'].insert(1, {'label': 'íntimo', 'forms': {'notus': 'íntimo'},
                        'note': 'The stylist (v1); DRB "my familiar". Says the closeness the Latin word does not say.',
                        'from': 'stylist'})
x['why'] += (' **v2:** the stylist and the blind reader heard "a mere acquaintance". Held: *notus* is as plain as *conhecido*'
             ' (only "known"); the closeness is said beside it by *de uma só alma comigo* and *meu guia*, and 54:15.')

# 54:15
x = dec['qui15']
for o in x['options']:
    if o['label'] == 'Tu que juntamente':
        o['note'] = 'The subject named (D2). The stylist (v1) asked *Tu, que comigo juntamente*.'

# 54:20b
x = dec['retribuendo']
x['why'] += (' **v2:** the Latinist: *in* + ablative gerund is "in the act of repaying" (ἐν τῷ ἀποδιδόναι), not purpose.'
             ' *ao retribuir* is the Portuguese of that build.')
front('retribuendo', 'ao retribuir', {'retribuendo': 'ao retribuir'},
      'v2; the Latinist; "in repaying", the Latin\'s *in* + gerund.', 'latinist')
for o in x['options']:
    if o['label'] == 'para retribuir':
        o['note'] = 'Draft 1; DRB "to repay". Purpose, which the Latin has not.'

# 54:23
x = dec['fluctuatio']
x['options'].append({'label': 'não deixará o justo para sempre vacilar',
                     'forms': {'fluctuatio': 'não deixará o justo para sempre vacilar'},
                     'note': 'The stylist (v1). Tips the colon to "not waver for ever" (but for a while).',
                     'from': 'stylist'})
x['why'] += (' **v2:** the blind reader heard "never", with the weaker "not for ever" possible — which the Latin also allows'
             ' (*non … in ætérnum*); kept open, as 29:7.')

# 54:24b: new decision for viri sanguinum et dolosi
d['decisions'].append({
    'id': 'viri',
    'refs': ['54:24b'],
    'latin': 'Viri sánguinum et dolósi',
    'kind': 'ambiguity',
    'why': ('The Latin lets *dolósi* be a second adjective of *viri* (men of blood and deceitful) or a second group'
            ' (the bloody men and the deceitful). *Os homens de sangue e enganadores* keeps both; the stylist\'s'
            ' second article picks the two groups. The glossary row (D29) foresaw this wording.'),
    'options': [
        {'label': 'Os homens de sangue e enganadores', 'forms': {}, 'note': 'Draft; both readings open.', 'from': 'draft'},
        {'label': 'Os homens de sangue e os enganadores', 'forms': {},
         'note': 'The stylist (v1); two groups.', 'from': 'stylist'}
    ]
})

c = d['choices']
c['54:11'] = ('circumdáre → cercar (glossary). **v2:** the Latin\'s order (*circúmdabit eam super muros ejus iníquitas*),'
              ' the subject last: the stylist heard *a iniquidade a cercará* as article and clitic colliding, and the blind'
              ' reader could not parse it. *por sobre* (the stylist) for *super* of going along the walls; *os seus muros* is'
              ' the city\'s, with *iniquidade* not yet said. labor → fadiga (glossary); injustítia → injustiça. \'há\' supplied'
              ' in the verbless second colon (D2). die ac nocte → \'de dia e de noite\' (31:4, 41:4).')
c['54:12'] = ('usúra → usura (glossary); dolus → engano (glossary). **v2:** *das suas praças* (the stylist) for *dela*, the'
              ' third *-dela* in two verses; *dela* of 54:11b just before says whose.')
c['54:20b'] = ('**v2:** *para eles* before *não há* (the stylist): the verb and its noun no longer split. Who stretches out'
               ' the hand is left open as in the Latin.')
c['54:13b'] = c['54:13b'] + ' The stylist (v1) asked *dito contra mim grandes coisas*; refused (D39).'

a = d['audit']
a.append({'step': 'readers', 'note': 'codex.py not called (Codex out of credits since Ps 37). The coordinator ran the three readers on draft 1 as fresh-context agents; each was claude-opus-5-5 (fresh context).'})
a.append({'step': 'latinist', 'file': 'critic/v1.latinist.json',
          'note': 'claude-opus-5-5 (fresh context). No major; four minors. Passed exercitátio, pusillanímitas, *super óleum*, *non dimidiábunt*, the ejus / illíus of 54:21 and the open *inter multos erant mecum*. One mediant per verse.',
          'outcomes': [
              {'verse': '54:4', 'remark': '*voltaram* is "returned"; *declinaram iniquidades sobre mim*', 'outcome': 'option', 'decision': 'declinaverunt',
               'reason': 'The fault is taken (the stylist\'s *as iniquidades se voltaram contra mim*); his cognate is heard first as "declined, refused" in Portuguese. Kept as an option.'},
              {'verse': '54:10', 'remark': '*contenda* broader than contradíctio; *contradição*', 'outcome': 'refused', 'decision': 'contradictio',
               'reason': 'The glossary row (17:44, 30:21b, 54:10 named): the blind reader of Ps 17 heard *contradições* as inconsistencies. *contradição* is option 2.'},
              {'verse': '54:15', 'remark': 'perfect *ambulávimus* against imperfect *capiébas*; *andamos*', 'outcome': 'refused', 'decision': 'ambulavimus',
               'reason': '*andamos* is heard as present ("we walk"), saying the friendship stands — the opposite of the verse. Tense is grammar (D2). Option 2.'},
              {'verse': '54:20b', 'remark': '*in retribuéndo* is not purpose; *ao retribuir*', 'outcome': 'taken', 'decision': 'retribuendo'}
          ]})
a.append({'step': 'stylist', 'file': 'critic/v1.stylist.json',
          'note': 'claude-opus-5-5 (fresh context). Fourteen remarks on thirteen verses; worst line 54:11, best 54:6. Five taken (54:4, 54:11, 54:12 in part, 54:14 *comigo*, 54:20b); the rest kept as options or refused under rulings.',
          'outcomes': [
              {'verse': '54:3', 'remark': '*Estou entristecido* heavy; *exercício* heard as a workout; *Entristeci-me em meu exercício*', 'outcome': 'option', 'decision': 'sum',
               'reason': 'the three perfect passives say one state (as 6:3–4) and must go alike; *Entristeci-me* alone would break the Latin\'s parallel with *conturbátus sum*. The event reading is option 2. *exercício* kept (decision `exercitatio`).'},
              {'verse': '54:4', 'remark': '*voltaram* heard as "returned"; *as iniquidades se voltaram contra mim*', 'outcome': 'taken', 'decision': 'declinaverunt'},
              {'verse': '54:8', 'remark': '*fui para longe* flat; *me afastei, fugindo*', 'outcome': 'option', 'decision': 'elongavi',
               'reason': 'elongáre keeps the Latin\'s *longe* (glossary row); *afastar-se* is discédere\'s.'},
              {'verse': '54:11', 'remark': '*a iniquidade a cercará sobre os muros dela* stumbles; *a rodeará por sobre os seus muros*', 'outcome': 'taken',
               'reason': '*por sobre* and *os seus muros* taken; *rodear* refused (circuíre\'s; circumdáre → cercar); the Latin\'s order (subject last) removes the a … a.'},
              {'verse': '54:12', 'remark': '*desapareceram* prosaic, a third *-dela*; *não se apartaram de suas praças*', 'outcome': 'option', 'decision': 'defecit',
               'reason': '*das suas praças* taken; *apartar-se* is declináre a\'s (glossary), so the verb stays and his is option 2.'},
              {'verse': '54:13b', 'remark': '*falar grandezas* a calque; *dito contra mim grandes coisas*', 'outcome': 'refused',
               'reason': 'D39 (magna loqui → falar grandezas), settled.'},
              {'verse': '54:14', 'remark': '*de uma só alma* heard as "one soul"; add *comigo*', 'outcome': 'taken', 'decision': 'unanimis'},
              {'verse': '54:14', 'remark': '*conhecido* a mere acquaintance; *íntimo*', 'outcome': 'option', 'decision': 'notus',
               'reason': '*notus* is only "known"; the closeness is said by *de uma só alma comigo* and *meu guia*; 30:12\'s word.'},
              {'verse': '54:15', 'remark': 'bare *Que*, clumsy *juntamente comigo*; *Tu, que comigo juntamente*', 'outcome': 'option', 'decision': 'qui15',
               'reason': 'the Latin runs on from 54:14\'s vocative with a bare relative; after 54:14\'s colon it is heard as one. *Tu* is not in the Latin.'},
              {'verse': '54:20', 'remark': '*que é antes* unfinished; *ele que existe antes dos séculos*', 'outcome': 'option', 'decision': 'ante_saecula',
               'reason': 'D39 keeps *existir* for absolute esse; *est ante* has its complement. MS1932\'s *existe* is option 3.'},
              {'verse': '54:20b', 'remark': '*há … para eles … mudança* split; *para eles não há mudança*', 'outcome': 'taken'},
              {'verse': '54:23', 'remark': '*para sempre não* stumbles; *não deixará o justo para sempre vacilar*', 'outcome': 'option', 'decision': 'fluctuatio',
               'reason': 'his order tips the colon to "not waver for ever" (but for a while); the draft keeps the Latin\'s both, and is 29:7\'s build.'},
              {'verse': '54:24b', 'remark': 'lopsided pair; *os homens de sangue e os enganadores*', 'outcome': 'option', 'decision': 'viri',
               'reason': 'the second article picks two groups where the Latin leaves *dolósi* open; the glossary foresaw the draft\'s wording (D29).'}
          ]})
a.append({'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
          'note': 'claude-opus-5-5 (fresh context). 41 ambiguities, 6 unknown words (exercício in this sense, precipitai-os, contenda, usura, manjares, concórdia). Most are the Latin\'s own obscurities (54:19, 54:20b, 54:21, 54:23), kept open.',
          'outcomes': [
              {'verse': '54:3', 'remark': '*exercício* puzzling, heard as physical exercise', 'outcome': 'refused', 'decision': 'exercitatio',
               'reason': 'the Latin\'s word and Ps 118\'s family (*exercitar-se*); *meditação* collides with meditátio, *provação* says trial. The risk is recorded.'},
              {'verse': '54:4', 'remark': '*voltaram* heard as "came back again"', 'outcome': 'taken', 'decision': 'declinaverunt'},
              {'verse': '54:7', 'remark': 'the futures after the wish sound odd', 'outcome': 'refused', 'decision': 'volabo',
               'reason': 'the Latin\'s futures; the wish was heard.'},
              {'verse': '54:9', 'remark': '*salvou* past beside *aguardava*', 'outcome': 'refused', 'reason': 'the Latin\'s perfect (*salvum me fecit*).'},
              {'verse': '54:10', 'remark': '*dividi-lhes as línguas*: Babel or literal tongues', 'outcome': 'refused', 'decision': 'divide',
               'reason': 'the Latin\'s image, open as there; *confundi* would say Babel.'},
              {'verse': '54:11', 'remark': 'hard to parse; *a … a … dela*', 'outcome': 'taken', 'reason': 'the Latin\'s order, subject last (with the stylist).'},
              {'verse': '54:14', 'remark': '*homem de uma só alma* unclear', 'outcome': 'taken', 'decision': 'unanimis'},
              {'verse': '54:14', 'remark': '*meu conhecido* heard as an acquaintance', 'outcome': 'option', 'decision': 'notus',
               'reason': 'the Latin word is as plain; *íntimo* recorded.'},
              {'verse': '54:15', 'remark': '*manjares* possibly heard as a pudding', 'outcome': 'refused', 'decision': 'cibos',
               'reason': 'heard as shared food — right; *doces manjares* is MS1932\'s.'},
              {'verse': '54:19', 'remark': '*entre muitos estavam comigo* heard as allies', 'outcome': 'refused', 'decision': 'inter_multos',
               'reason': 'the Latin\'s crux, left open on purpose; the Latinist passed it.'},
              {'verse': '54:20b', 'remark': 'the subject of *estendeu* not audible', 'outcome': 'refused', 'reason': 'as the Latin (*exténdit*, no subject).'},
              {'verse': '54:21', 'remark': 'whose covenant, face, heart', 'outcome': 'refused', 'reason': 'the Latin\'s ejus / illíus followed without deciding; the Latinist passed it.'},
              {'verse': '54:23', 'remark': '*para sempre não* allows "not for ever"', 'outcome': 'refused', 'decision': 'fluctuatio',
               'reason': 'the Latin allows it too (*non … in ætérnum*).'},
              {'verse': '54:24b', 'remark': '*homens de sangue* not common', 'outcome': 'refused', 'reason': 'D29; heard rightly as violent men.'}
          ]})
a.append({'step': 'revision', 'version': 2,
          'note': 'v2: 54:4 *as iniquidades se voltaram contra mim* (all three readers; departs from the glossary\'s foreseen 20:12 wording); 54:11 the Latin\'s order, *por sobre os seus muros* (stylist, blind reader); 54:12 *das suas praças* (stylist); 54:14 *de uma só alma comigo* (stylist, blind reader); 54:20b *para eles não há* (stylist) and *ao retribuir* (Latinist). New decision: viri.'})

json.dump(d, open(path, 'w'), ensure_ascii=False, indent=2)
print('ok')
