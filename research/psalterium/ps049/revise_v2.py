"""Draft 2 of Ps 49: decisions and audit after the v1 readers. Run once: python3.13 research/psalterium/ps049/revise_v2.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}
order = [d['id'] for d in data['decisions']]


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def new(id, refs, latin, kind, why, options, after):
    decisions[id] = {'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}
    order.insert(order.index(after) + 1 if after else 0, id)


def promote(id, label, note=None):
    d = decisions[id]
    i = next(k for k, o in enumerate(d['options']) if o['label'] == label)
    chosen = d['options'].pop(i)
    if note:
        chosen['note'] = note
    d['options'].insert(0, chosen)


new('order1', ['49:1'], 'Deus deórum, Dóminus locútus est', 'order',
    'The stylist heard the opening *O Deus dos deuses* as the vocative *Ó*, re-parsed at *falou*. Putting the verb first (natural Portuguese order, D2) removes the misreading and keeps the Latin order of the names, *Deus deórum* before *Dóminus*. His own line (*Falou o Senhor, o Deus dos deuses*) swaps the two names; not needed.',
    [opt('Falou o Deus dos deuses, o Senhor', {'order1': 'Falou o Deus dos deuses, o Senhor'}, 'Ruling (v2): the stylist\'s verb-first order, the Latin\'s order of the names.', 'stylist'),
     opt('O Deus dos deuses, o Senhor, falou', {'order1': 'O Deus dos deuses, o Senhor, falou'}, 'draft 1, the Latin order; heard as a vocative first.', 'draft'),
     opt('Falou o Senhor, o Deus dos deuses', {'order1': 'Falou o Senhor, o Deus dos deuses'}, 'the stylist\'s line; the names reversed.', 'stylist')],
    None)

promote('manifeste', 'às claras')
decisions['manifeste']['options'].insert(0, opt('abertamente', {'manifeste': 'abertamente'},
    'Ruling (v2): the stylist; ἐμφανῶς, openly. *manifestamente* was unknown to the blind reader and heavy to the stylist.', 'stylist'))
decisions['manifeste']['why'] += ' v2: the blind reader listed *manifestamente* as unknown, and the stylist found it legal; *abertamente* is the plain word for ἐμφανῶς and keeps the sense (openly, not in secret).'
decisions['manifeste']['options'][2]['note'] = 'draft 1; MS1932; unknown to the blind reader.'

new('silebit', ['49:3'], 'Deus noster et non silébit', 'glossary',
    'The silére / tacére row keeps two Latin verbs apart: silére → *ficar em silêncio*, tacére → *calar-se* (49:20 *e eu me calei*). Here the Greek differs too (παρασιωπήσεται / ἐσίγησα). The stylist asks *não se calará* (shorter, oxytone close); refused, because it would make 49:3 and 49:20 one verb where the Latin has two.',
    [opt('ficará em silêncio', {'silebit': 'ficará em silêncio'}, 'Ruling; the row.', 'glossary'),
     opt('se calará', {'silebit': 'se calará'}, 'stylist; tacére\'s verb.', 'stylist')],
    'manifeste')

new('exardescet', ['49:3b'], 'Ignis in conspéctu ejus exardéscet', 'glossary',
    'exardéscere → *inflamar-se* (the row; 38:4 *um fogo se inflamará*); *arder* is concaléscere\'s in 38:4, where the two stand in one verse. The stylist asks *arderá* (plainer); refused for that collision, kept as the option.',
    [opt('se inflamará', {'exardescet': 'se inflamará'}, 'Ruling; the row, 38:4.', 'glossary'),
     opt('arderá', {'exardescet': 'arderá'}, 'stylist; concaléscere\'s verb in 38:4.', 'stylist')],
    'silebit')

decisions['congregate']['why'] += ' v2: the stylist asked *Reuni para ele*; refused, as above (rule 3). *Congregai-lhe* is the option if *para ele* sits awkwardly.'
decisions['ordinant']['why'] += ' v2: the Latinist (minor) asked *ordenam* (ordain, set in order); refused because the blind reader heard the covenant rightly with *firmam*, while *ordenar* is heard first as command. It stays option 2.'

new('autem', ['49:8'], 'holocáusta autem tua in conspéctu meo sunt semper', 'grammar',
    'The blind reader heard *porém* as a contrast that turns the line into a reproach (I do not rebuke you, *but* your holocausts…). The Latin *autem* is here a weak connective: the holocausts are not blamed, they are always before God (DRB *and*). *e* says that.',
    [opt('e os teus holocaustos', {'autem': 'e os teus holocaustos'}, 'Ruling (v2): the ambiguity reader; DRB *and*.', 'ambiguity'),
     opt('os teus holocaustos, porém,', {'autem': 'os teus holocaustos, porém,'}, 'draft 1; heard as a reproach.', 'draft')],
    'conspectu')

new('order9', ['49:9'], 'Non accípiam de domo tua vítulos', 'order',
    'The stylist: the Latin order puts the object last, like an afterthought. Natural order is grammar (D2); taken. His *aceitarei* for *receberei* is refused: accípere → *receber* (the row).',
    [opt('Não receberei bezerros da tua casa', {'order9': 'Não receberei bezerros da tua casa'}, 'Ruling (v2): the stylist\'s order.', 'stylist'),
     opt('Não receberei da tua casa bezerros', {'order9': 'Não receberei da tua casa bezerros'}, 'draft 1, the Latin order.', 'draft'),
     opt('Não aceitarei bezerros da tua casa', {'order9': 'Não aceitarei bezerros da tua casa'}, 'the stylist\'s verb; not accípere\'s row.', 'stylist')],
    'hircus')

new('jumenta', ['49:10'], 'juménta in móntibus et boves', 'glossary',
    'juménta → *os animais* (the row; κτήνη, as 8:8 pécora). The Latinist (minor) asks *o gado*: the row names it as its option, but here *o gado … e os bois* would say cattle twice, since oxen are cattle. Refused, kept as the option.',
    [opt('os animais', {'jumenta': 'os animais'}, 'Ruling; the row.', 'glossary'),
     opt('o gado', {'jumenta': 'o gado'}, 'Latinist; overlaps *os bois*.', 'latinist')],
    'silvarum')

new('orbis', ['49:12'], 'meus est enim orbis terræ', 'glossary',
    'D30 settled *orbis terræ* → *o mundo* (*orbe* unknown to two blind readers). The Latinist (minor) asks *o orbe da terra*; refused under D30.',
    [opt('o mundo', {'orbis': 'o mundo'}, 'Ruling; D30.', 'glossary'),
     opt('o orbe da terra', {'orbis': 'o orbe da terra'}, 'Latinist; D30\'s refused option.', 'latinist')],
    'jumenta')

new('carnes', ['49:13'], 'Numquid manducábo carnes taurórum?', 'grammar',
    'The Latin plural *carnes* is flesh as food; the carnes row has *as carnes* for a man\'s own flesh (118:120). The stylist heard *as carnes dos touros* as a butcher\'s counter; flesh as food is singular in Portuguese. Number is grammar (D2, as D29 did with *sangue*); taken. The singular also matches *o sangue* in the second colon.',
    [opt('a carne', {'carnes': 'a carne'}, 'Ruling (v2): the stylist; MS1932 *a carne dos touros*.', 'stylist'),
     opt('as carnes', {'carnes': 'as carnes'}, 'draft 1; the Latin\'s number.', 'draft')],
    'orbis')

new('enarras', ['49:16'], 'Quare tu enárras justítias meas', 'glossary',
    'enarráre → *narrar* (the row; 18:2 *Os céus narram*). The stylist asks *proclamas* (stronger than a storyteller\'s *narrar*); refused: *proclamar* is prædicáre\'s (the enarráre row). The blind reader listed *narras* as unknown, which is surprising for a common verb; the form stands.',
    [opt('narras', {'enarras': 'narras'}, 'Ruling; the row.', 'glossary'),
     opt('proclamas', {'enarras': 'proclamas'}, 'stylist; prædicáre\'s word.', 'stylist')],
    'hircus')

decisions['peros']['why'] += ' v2: the Latinist (minor) asked *pela tua boca*; refused for the reason above, kept as option 2.'
decisions['portionem']['options'].insert(1, opt('punhas a tua parte', {'portionem': 'punhas a tua parte'}, 'stylist (his worst line): *parte* plainer; pars\'s word (15:5).', 'stylist'))
decisions['portionem']['why'] += ' v2: the stylist named 49:18 the worst line and asked *punhas a tua parte*; the blind reader heard it only roughly as \'you took part\'. Refused for the pórtio row (kept apart from pars → *parte*); *parte* does not make the idiom any more Portuguese — *pôr a parte com* is no more said than *pôr a porção*. Kept as option 2; if Gustavo wants the sense heard plainly, *tomavas a tua parte* is the one to take.'

promote('scandalum', 'punhas tropeço')
decisions['scandalum']['options'].insert(0, opt('punhas um tropeço', {'scandalum': 'punhas um tropeço'}, 'Ruling (v2): the stylist; the article is grammar.', 'stylist'))
decisions['scandalum']['options'][1]['note'] = 'draft 1; the bare noun, clipped to the stylist.'

decisions['inique']['why'] += ' v2: the stylist found *iniquamente* bookish and asked the vocative; the blind reader listed it unknown and heard \'wrongly\'. Refused: the stylist\'s wording takes the other reading of the Latin, which both Vulgate-family witnesses reject; it stays option 2 and the choice between the two readings is for Gustavo.'
decisions['statuam']['options'].insert(1, opt('o porei', {'statuam': 'o porei'}, 'stylist: a neuter *o* as object.', 'stylist'))
decisions['statuam']['why'] += ' v2: the stylist asked for a neuter *o* (*e o porei*) so the ear is not left waiting; refused, because *o* is heard as \'him\' and supplies an object. The Latinist passed the bare form as keeping the Latin\'s ellipsis.'

decisions['rapiat']['refs'] = ['49:22']
decisions['rapiat']['options'] = [
    opt('arrebate … liberte', {'rapiat': 'arrebate', 'eripiat': 'liberte'}, 'Ruling; the rápere and erípere rows.', 'glossary'),
    opt('arrebate … livre', {'rapiat': 'arrebate', 'eripiat': 'livre'}, 'Latinist and stylist; *livrar* is liberáre\'s.', 'latinist'),
    opt('arrebate … arranque', {'rapiat': 'arrebate', 'eripiat': 'arranque'}, 'the erípere row\'s other verb; keeps the snatching image the Latinist wants.', 'draft'),
    opt('ele arrebate … livre', {'rapiat': 'ele arrebate', 'eripiat': 'livre'}, 'stylist: subject supplied.', 'stylist'),
    opt('vos arrebate … vos liberte', {'rapiat': 'vos arrebate', 'eripiat': 'vos liberte'}, 'MS1932, DRB supply the object.', 'MS1932')]
decisions['rapiat']['why'] += ' v2: the Latinist and the stylist both asked *livre* (the stylist also a subject *ele*). Refused: *livrar* is liberáre\'s verb, and the erípere row gives *libertar* where no source is named (24:20, 90:15); the Latinist\'s point, that *liberte* loses the snatch that answers *rápiat*, is fair — the row\'s other verb, *arranque*, keeps it, and is option 3. The subject is left unnamed by the row (the blind reader still heard God).'

decisions['immola']['why'] += ' v2: the blind reader listed *Imola* as unknown; kept — it is the Latin\'s word and the psalm\'s point (a sacrifice of another kind); *Oferece* is one touch away.'

data['decisions'] = [decisions[i] for i in order]
data['audit'].extend([
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5 (fresh context). 5 minor, no major; all refused under glossary rows, each kept as an option.',
     'outcomes': [
        {'verse': '49:5', 'remark': 'ordinant → ordenam', 'outcome': 'option', 'decision': 'ordinant', 'reason': 'ordenar is heard as command; firmar was heard rightly by the blind reader.'},
        {'verse': '49:10', 'remark': 'juménta → o gado', 'outcome': 'option', 'decision': 'jumenta', 'reason': 'the row; o gado overlaps os bois.'},
        {'verse': '49:12', 'remark': 'orbis terræ → o orbe da terra', 'outcome': 'option', 'decision': 'orbis', 'reason': 'D30.'},
        {'verse': '49:16', 'remark': 'per os → pela tua boca', 'outcome': 'option', 'decision': 'peros', 'reason': 'tomar pela boca is not said; DRB, MS1932 have in / na.'},
        {'verse': '49:22', 'remark': 'eripiat → livre (snatch image)', 'outcome': 'option', 'decision': 'rapiat', 'reason': 'livrar is liberáre\'s; the erípere row\'s arrancar, which keeps the image, is added as an option.'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5 (fresh context). 13 remarks; worst line 49:18, best 49:19. 5 taken (order of 49:1 and 49:9, abertamente, a carne, um tropeço), 8 refused and kept as options.',
     'outcomes': [
        {'verse': '49:1', 'remark': 'O heard as vocative; verb first', 'outcome': 'taken', 'reason': ''},
        {'verse': '49:3', 'remark': 'manifestamente → abertamente', 'outcome': 'taken'},
        {'verse': '49:3', 'remark': 'ficará em silêncio → se calará', 'outcome': 'option', 'decision': 'silebit', 'reason': 'silére / tacére kept apart (49:20).'},
        {'verse': '49:3b', 'remark': 'se inflamará → arderá', 'outcome': 'option', 'decision': 'exardescet', 'reason': 'exardéscere row; arder is concaléscere\'s in 38:4.'},
        {'verse': '49:5', 'remark': 'Congregai para ele → Reuni para ele', 'outcome': 'refused', 'reason': 'bare Reuni = I gathered (rule 3); already option 3 of congregate.'},
        {'verse': '49:9', 'remark': 'order; aceitarei', 'outcome': 'taken', 'reason': 'order taken; the verb refused (accípere → receber), kept as option 3 of order9.'},
        {'verse': '49:13', 'remark': 'as carnes → a carne', 'outcome': 'taken'},
        {'verse': '49:16', 'remark': 'narras → proclamas', 'outcome': 'option', 'decision': 'enarras', 'reason': 'enarráre row; proclamar is prædicáre\'s.'},
        {'verse': '49:18', 'remark': 'porção → parte', 'outcome': 'option', 'decision': 'portionem', 'reason': 'pórtio row; parte makes the idiom no more native.'},
        {'verse': '49:20', 'remark': 'punhas tropeço → punhas um tropeço', 'outcome': 'taken'},
        {'verse': '49:21', 'remark': 'iniquamente → ó iníquo', 'outcome': 'option', 'decision': 'inique', 'reason': 'the other reading of iníque; DRB and MS1932 read the adverb.'},
        {'verse': '49:21', 'remark': 'porei → o porei', 'outcome': 'option', 'decision': 'statuam', 'reason': 'o supplies an object heard as him.'},
        {'verse': '49:22', 'remark': 'ele arrebate … livre', 'outcome': 'option', 'decision': 'rapiat', 'reason': 'the rápere row (no subject) and erípere row (libertar).'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5 (fresh context). 30 readings; unknown: manifestamente, holocaustos, plenitude, Imola, narras, iniquamente, arrebate. One taken: 49:8 porém heard as a reproach. manifestamente replaced (with the stylist). holocausto, plenitude, arrebatar are glossary words already recorded as unknown to earlier readers; Imola and iniquamente noted in their decisions. 49:4 separar heard as set apart — the D42 cost; julgar remains the option. 49:5 aliança heard as ring as well as covenant, and firmam heard as sealed — as meant.',
     'outcomes': [
        {'verse': '49:8', 'remark': 'porém heard as a reproach', 'outcome': 'taken'},
        {'verse': '49:3', 'remark': 'manifestamente unknown', 'outcome': 'taken'},
        {'verse': '49:14', 'remark': 'Imola unknown', 'outcome': 'option', 'decision': 'immola', 'reason': 'the Latin\'s sacrificial verb is the point of the line.'},
        {'verse': '49:21', 'remark': 'iniquamente unknown; porei lacks an object', 'outcome': 'option', 'decision': 'statuam', 'reason': 'the Latin has no object; kept open.'},
        {'verse': '49:22', 'remark': 'subject and object of arrebate inaudible', 'outcome': 'option', 'decision': 'rapiat', 'reason': 'the row keeps the Latin\'s ellipsis; the reader still heard God.'},
        {'verse': '49:4', 'remark': 'separar heard as set apart', 'outcome': 'option', 'decision': 'discernere', 'reason': 'D42; julgar is the option.'}]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 49:1 verb first; 49:3 abertamente; 49:8 e for porém; 49:9 natural order; 49:13 a carne; 49:20 um tropeço. New decisions for the refused remarks (silebit, exardescet, jumenta, orbis, enarras) and options added to portionem, statuam, rapiat. prayed.v1.json kept.'}])
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok', len(data['decisions']))
