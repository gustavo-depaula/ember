"""Record the final Latinist gate on draft 3 (critic/v3.latinist.json) for Pss 67, 68, 75, 82, 88, 89, 90, 110, 138, 145.

Each of these psalms had a last edit (draft 3) after its gate; the coordinator ran a fresh-context gate on the current
draft. Nothing in the text changes: every remark repeats a question already ruled, or is held as an option.
Idempotent: a step already recorded for critic/v3.latinist.json is replaced.
"""

import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
model = 'claude-opus-5-5 (fresh context, with latin.json)'

gates = {
    67: ('Final gate on draft 3: no major, eight minors, all repeats of settled questions or held as options; no change.', [
        {'verse': '67:10', 'remark': '*segregábis* → *Separareis*: *reservar* shifts toward keeping back', 'outcome': 'option', 'decision': 'segregabis',
         'reason': '*separar* is 67:15 *discérnit*’s word (D42), five verses on; *reservar para* is DRB’s “set aside for”. *Separareis* is option 1.'},
        {'verse': '67:14', 'remark': '*posterióra dorsi* is a noun phrase; *a parte de trás do seu dorso*', 'outcome': 'refused',
         'reason': 'as at the v2 gate: that was draft 1, changed at the stylist’s request; the back, behind, is kept.'},
        {'verse': '67:19a', 'remark': '*levastes cativo* adds a predicate; *tomastes o cativeiro*', 'outcome': 'option', 'decision': 'captivitatem',
         'reason': 'as at the v2 gate: the Pauline form is this verse’s own tradition; *tomastes o cativeiro* is opaque aloud.'},
        {'verse': '67:19b', 'remark': '*étenim* inclusive, not causal; *E até os que não acreditavam*', 'outcome': 'option', 'decision': 'etenim',
         'reason': 'the v2 gate asked the *até* out as an added “even”; this run asks it back. The runs contradict; the row’s bare *pois* (καὶ γάρ) stands. *E até* is the last option.'},
        {'verse': '67:20', 'remark': '*salutárium* plural; *das nossas salvações*', 'outcome': 'option', 'decision': 'salutarium',
         'reason': 'as v1 and v2 (D27: number is grammar here).'},
        {'verse': '67:24', 'remark': '*intingátur* is dip; *tingir-se* is dyed; *seja mergulhado*', 'outcome': 'refused',
         'reason': '*tingir* is the Latin’s own root (*in-tingo*), and the Greek βαφῇ is both “dip” and “dye”; *se tinja no sangue* keeps the foot reddened in the blood, the image of the verse. *seja mergulhado* adds a passive auxiliary and loses the colour.'},
        {'verse': '67:31a', 'remark': '*congregátio* nominative, not a second object; semicolon', 'outcome': 'refused',
         'reason': 'DRB reads it as ours (“the wild beasts of the reeds, the congregation of bulls”); the comma leaves apposition or address open as the Latin does, where a semicolon strands a verbless phrase before *para que*.'},
        {'verse': '67:36', 'remark': '*seja* supplies a mood; *bendito Deus* as 67:20', 'outcome': 'option', 'decision': 'benedictus',
         'reason': 'as v1 and v2: 67:20 has an article and stands verbless; *bendito Deus* is heard as a noun phrase.'},
    ]),
    68: ('Final gate on draft 3: no major, two minors, both repeats held as options; no change.', [
        {'verse': '68:13b', 'remark': 'the verbless Latin; *dirijo* supplies a verb', 'outcome': 'option', 'decision': 'orationem',
         'reason': 'as at v1 and the v2 gate (he calls it defensible): a verbless Portuguese colon is not a sentence; *dirijo-vos* only restates *ad te*. The verbless line is option 3.'},
        {'verse': '68:18', 'remark': '*puer* → *servo* loses the child; *menino*', 'outcome': 'option', 'decision': 'puero',
         'reason': 'in address to God *puer* (παῖς) is the servant (DRB, MS1932); *menino* is heard wrongly in prayer. It is option 1.'},
    ]),
    75: ('Final gate on draft 3: no major, one minor (75:5, the participle, now asked a third way), held as an option; no change.', [
        {'verse': '75:5', 'remark': '*Illúminans tu* participle made finite; *Vós, que iluminais*', 'outcome': 'option', 'decision': 'illuminans',
         'reason': 'the Greek’s finite verb (φωτίζεις σύ) and DRB’s “Thou enlightenest”; supplying it is grammar (D2). The v2 gate asked a gerund, this one a relative, which leaves the verse an anacoluthon before *perturbaram-se*; both are options.'},
    ]),
    82: ('Final gate on draft 3: no remarks — the 82:16 fix passed, and 82:5 *para não serem nação* judged a correct rendering of the idiom.', []),
    88: ('Final gate on draft 3: one major (88:36, the oath formula — the question already held on v1 and v2 and pending for Gustavo with 94:10 and 131:3–5), two minors; no change.', [
        {'verse': '88:36', 'remark': '*Si David méntiar* oath formula resolved into a negative future (MAJOR)', 'outcome': 'pending', 'decision': 'oath36',
         'reason': 'held with its written reason (v1, v2): *se eu mentir a Davi … a sua descendência permanecerá* is heard as a condition with the opposite sense. The ruling on the oath formula is pending for Gustavo across 88:36, 94:10 and 131:3–5; the literal forms are options 1–3.'},
        {'verse': '88:36', 'remark': '*in sancto meo* substantive; *santidade* the Hebrew abstract; *no meu santo*', 'outcome': 'option', 'decision': 'oath36',
         'reason': 'as at the v2 gate: after *jurei*, *pelo meu santo* / *no meu santo* is heard as a saint; DRB “by my holiness”. Both are options.'},
        {'verse': '88:45', 'remark': '*ab* separative with the person; *afastando-o da purificação*', 'outcome': 'option', 'decision': 'em45',
         'reason': 'the v1 gate asked *apartando-o da* (draft 2), the v2 gate refused the added participle and gave *tirando-lhe* (draft 3); this run asks the participle back. The runs contradict; draft 3 stands, draft 2’s form is option 1.'},
        {'verse': '88:4', 'remark': '*dispósui* ordained, *eléctis* dative; *Dispus uma aliança para*', 'outcome': 'option', 'decision': 'disp',
         'reason': 'the *testaméntum* row: *dispónere testaméntum → firmar aliança* (82:6); διεθέμην διαθήκην is making a covenant. *Dispus a aliança* is option 2.'},
    ]),
    89: ('Final gate on draft 3: no major, three minors, all repeats held as options; no change.', [
        {'verse': '89:8', 'remark': '*sǽculum* → *vida* glosses; *o nosso tempo*', 'outcome': 'option', 'decision': 'saeculum8',
         'reason': 'the v1 gate asked *a nossa vida*, the v2 gate and this one *o nosso tempo*; the ambiguity reader heard *tempo* as a schedule. Held; *o nosso tempo* is option 1.'},
        {'verse': '89:5', 'remark': '*coisas* added to the bare neuter *quæ*; *o que é tido por nada, isso*', 'outcome': 'option', 'decision': 'pronihilo',
         'reason': '*coisas* is DRB’s and MS1932’s (“things that are counted nothing”), the neuter made audible; the bare relative form is option 2.'},
        {'verse': '89:10', 'remark': '*in potentátibus* → *se houver forças* abstract; *nos fortes*', 'outcome': 'option', 'decision': 'potentatibus',
         'reason': 'as at the v2 gate: *potentátus* is power, not persons (L&S); *nos fortes* is option 1.'},
    ]),
    90: ('Final gate on draft 3: no remark on the 90:15 change (*libertarei*); two minors, both held as options already in the text’s decisions; no change.', [
        {'verse': '90:6', 'remark': '*negótium* flattened to *coisa*; *o negócio*', 'outcome': 'option', 'decision': 'negotio',
         'reason': '*a coisa* is L&S’s “like πρᾶγμα, a matter, thing”; in Brazil *o negócio* is commerce or slang and turns the line comic. It is option 1 (DRB).'},
        {'verse': '90:16', 'remark': '*longitúdo diérum* a noun phrase; *longura de dias*', 'outcome': 'option', 'decision': 'longitudine',
         'reason': '*longura* is a dictionary word nobody says; the image stays in *longos dias*. It is option 1.'},
    ]),
    110: ('Final gate on draft 3: no remarks — tenses, the Septuagintal *exquisita*, *facientibus eum* and the pointing confirmed.', []),
    138: ('Final gate on draft 3: one major (138:15 *os meum*, held with 101:6 and pending for Gustavo), two minors; the 138:14 change passed; no change.', [
        {'verse': '138:15', 'remark': '*os meum* singular; *os meus ossos* plural (MAJOR)', 'outcome': 'pending', 'decision': 'os',
         'reason': 'held as at v1 and the v2 gate, with Ps 101:6’s ruling on the same collective singular: *o meu osso* is heard as one bone. Flagged for Gustavo with 101:6 — both change together or neither; option 1.'},
        {'verse': '138:6', 'remark': '*ex me*: *o vosso saber de mim* read as knowledge about me; *para mim*', 'outcome': 'option', 'decision': 'exme',
         'reason': 'the v1 gate asked the preposition’s own word (*de mim*, taken), the v2 gate *de mim* moved, this one *para mim*. *de mim* keeps “of / from me” open, as the Latin; *para mim* (DRB) is option 2.'},
        {'verse': '138:16', 'remark': '*imperféctum meum* a substantive; *viram o meu imperfeito*', 'outcome': 'refused', 'decision': 'imperfectum',
         'reason': '*o meu imperfeito* is not Portuguese and is heard as “my flaw”; the neuter as a predicate on *me* is grammar (D2). *imperfeito* stays an option.'},
    ]),
    145: ('Final gate on draft 3: one major (145:4 *suam*, held at the v2 gate and pending for Gustavo), one minor held as the option; the 145:8b change passed; no change.', [
        {'verse': '145:4', 'remark': '*suam* dropped: *voltará à terra*; *à sua terra* (MAJOR)', 'outcome': 'pending', 'decision': 'terram',
         'reason': 'held as at the v2 gate: with *sua* the blind ambiguity reader heard the native land, a wrong sense; without it only a reflexive possessive is lost. Flagged for Gustavo; *voltará à sua terra* is option 1, one touch.'},
        {'verse': '145:7a', 'remark': 'relative chain *Qui* broken; *Que guarda*', 'outcome': 'option', 'decision': 'qui7',
         'reason': 'as v1 and v2 (he calls it defensible): a relative heading a prayed verse is heard as an exclamation. *Que guarda* is option 1.'},
    ]),
}

newOptions = {
    75: ('illuminans', {'label': 'Vós, que iluminais', 'forms': {'illuminans': 'Vós, que iluminais'},
                        'note': 'the v3 gate (minor): the participle as a relative; the verse then hangs, an anacoluthon before *perturbaram-se*', 'from': 'latinist'}),
}

for number, (note, outcomes) in gates.items():
    path = root / f'ps{number:03d}' / 'prayed.json'
    raw = path.read_text(encoding='utf-8')
    p = json.loads(raw)
    p['audit'] = [s for s in p['audit'] if s.get('file') != 'critic/v3.latinist.json']
    p['audit'].append({'step': 'latinist', 'file': 'critic/v3.latinist.json', 'model': model, 'version': p['version'], 'note': note, 'outcomes': outcomes})
    if number in newOptions:
        did, option = newOptions[number]
        decision = next(d for d in p['decisions'] if d['id'] == did)
        if all(o['label'] != option['label'] for o in decision['options']):
            decision['options'].append(option)
    ids = {d['id'] for d in p['decisions']}
    for o in outcomes:
        assert o.get('decision') is None or o['decision'] in ids, (number, o)
    path.write_text(json.dumps(p, ensure_ascii=False, indent=2) + ('\n' if raw.endswith('\n') else ''), encoding='utf-8')
    print(number, p['version'], {k: sum(o['outcome'] == k for o in outcomes) for k in ('taken', 'refused', 'option', 'pending')})
