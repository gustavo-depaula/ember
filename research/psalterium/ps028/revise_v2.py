"""Ps 28 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps028/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; writes prayed.json with the audit of draft 1 and the revision."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}
verses = data['verses']


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def demote(d, prefix='Draft 1. '):
    o = d['options'][0]
    o['note'] = prefix + o['note'].removeprefix('Ruling: ')


def decision(id, refs, latin, kind, why, options):
    data['decisions'].append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options})


data['version'] = 2
data['status'] = 'reviewed'

# 28:2 — the stylist: 'para o seu nome' sounds explanatory; 'ao seu nome' is the Latin's dative to the letter
d = decisions['nomini']
d['why'] += (' Heard (draft 1): the stylist — «O “para” dá à fórmula um tom explicativo; “glória ao seu nome” sai mais naturalmente na'
             ' oração». Taken: it is also the Latin\'s dative to the letter; the two \'ao\' the draft avoided did not trouble either reader'
             ' (the blind reader heard the name as the Lord\'s).')
d['options'] = [d['options'][1], d['options'][0], d['options'][2]]
d['options'][0]['note'] = 'Ruling (draft 2): the dative to the letter (the stylist; Douay-Rheims).'
d['options'][0]['from'] = 'stylist'
d['options'][1]['note'] = 'Draft 1. the dative\'s sense, without two \'ao\'.'

# 28:5 — the stylist: Líbano (proparoxytone) at the final cadence; his reorder refused
decision('libani5', ['28:5'], 'et confrínget Dóminus cedros Líbani',
         'order',
         'Heard (draft 1): the stylist — «“Líbano” é proparoxítono: deixa duas sílabas depois do acento na terminação» → ‘e os cedros do'
         ' Líbano o Senhor quebrará’. Refused: object before subject and verb is an inversion Portuguese does not make in plain speech,'
         ' and it would break the verse\'s answer to its first colon (‘que quebra os cedros … quebrará os cedros do Líbano’: the same'
         ' order both times). The proparoxytone is a proper name, and the Latin\'s own cadence is one (Líbani). His order is the option.',
         [option('e o Senhor quebrará os cedros do Líbano', {'libani5': 'e o Senhor {confringet} os cedros do Líbano'},
                 'Ruling: the Latin\'s order; the name at the cadence, as the Latin.', 'draft'),
          option('e os cedros do Líbano o Senhor quebrará', {'libani5': 'e os cedros do Líbano o Senhor {confringet}'},
                 'The stylist: the verb at the cadence (oxytone).', 'stylist')])
verses['28:5'] = 'A voz do Senhor {p5} os cedros: * {libani5}:'

# 28:6 — the stylist's worst line (Líbano at the mediant; his fronting taken) and the blind reader's zeugma (copula taken)
verses['28:6'] = '{order6}: * e {sera} como um filho de unicórnios.'
decision('order6', ['28:6'], 'Et commínuet eas tamquam vítulum Líbani',
         'order',
         'Heard (draft 1): the stylist\'s worst line — «“Líbano” deixa duas sílabas átonas na chegada à mediana. A comparação pode'
         ' anteceder o verbo para que o apoio recaia em “esmigalhará”» → ‘E, como a um bezerro do Líbano, os esmigalhará’. Taken: order'
         ' only (D2), and a comparison before its verb is ordinary Portuguese; the mediant falls on an oxytone. The Latin\'s order is the'
         ' option.',
         [option('E, como a um bezerro do Líbano, os esmigalhará', {'order6': 'E, {vitulum} do Líbano, os {comminuet}'},
                 'Ruling (draft 2): the stylist\'s order.', 'stylist'),
          option('E os esmigalhará como a um bezerro do Líbano', {'order6': 'E os {comminuet} {vitulum} do Líbano'},
                 'Draft 1: the Latin\'s order; the mediant on the proparoxytone Líbano.', 'draft')])
decision('sera', ['28:6'], 'et diléctus quemádmodum fílius unicórnium',
         'grammar',
         'The Latin has no verb; its nominative \'diléctus\' cannot be an object of commínuet. Portuguese has no case, and after'
         ' \'esmigalhará\' a bare \'e o amado\' is heard as a second thing crushed. Heard (draft 1): the blind reader — «O amado também será'
         ' esmigalhado» (likely hearing). A wrong first hearing the Latin excludes: a copula is supplied (D2), in the future of the verse'
         ' around it, as Matos Soares 1932 does (\'e o bem amado será como o filho do unicórnio\'). The verbless line is the option.',
         [option('o amado será', {'sera': '{dilectus} será'}, 'Ruling (draft 2): the copula (the blind reader; Matos Soares 1932).', 'ambiguity'),
          option('o amado,', {'sera': '{dilectus},'}, 'Draft 1: verbless, as the Latin; heard as crushed too.', 'draft')])
decisions['dilectus']['why'] += ' In draft 2 a copula follows it (decision sera).'

# 28:9 — the stylist's broken coordination; the blind reader's 'serradas'
d = decisions['revelabit']
d['why'] += (' Heard (draft 1): the stylist — «A passagem de “que prepara” para “e desnudará” soa como uma coordenação quebrada» → ‘e o'
             ' Senhor desnudará’; the blind reader heard the voice, the Lord, or both as its subject. Taken in another form: \'e que'
             ' desnudará\' mends the coordination (two relative clauses) and leaves the subject as open as the Latin, where \'revelábit\''
             ' has no subject and the only nominative is \'Vox\' (Douay-Rheims \'he\', Matos Soares 1932 the voice). Naming the Lord'
             ' decides it; that is the option. The blind reader listed \'desnudará\' as unknown; kept (the sense \'lay bare\' has no plainer'
             ' single verb that is not heard as \'find\' or \'disclose\').')
verses['28:9'] = 'A voz do Senhor {p9} {cervos}, {e_que} {revelabit} {condensa}: * e no seu templo todos {dicent}.'
decision('e_que', ['28:9'], 'et revelábit', 'grammar',
         'See decision revelabit: how the future after the participle is joined.',
         [option('e que', {'e_que': 'e que'}, 'Ruling (draft 2): a second relative; the subject stays open.', 'stylist'),
          option('e o Senhor', {'e_que': 'e o Senhor'}, 'The stylist\'s words: the subject named — decides it.', 'stylist'),
          option('e', {'e_que': 'e'}, 'Draft 1: the bare coordination.', 'draft')])
d = decisions['condensa']
d['why'] += (' Heard (draft 1): the blind reader — «Na audição, “matas serradas”: matas cujas árvores foram cortadas com serra»:'
             ' cerradas / serradas are homophones, the same trap as cervos / servos. Draft 2: \'as matas densas\' — con-densa\'s own root.')
d['options'][0]['note'] = 'Draft 1. dense woods; heard as \'serradas\' (sawn).'
d['options'].insert(0, option('as matas densas', {'condensa': 'as matas densas'},
                              'Ruling (draft 2): the Latin\'s root; no homophone.', 'ambiguity'))

# 28:9 — the Latinist's minor on 'corças'
d = decisions['cervos']
d['why'] += (' Heard (draft 1): the Latinist, minor — «“Corças” especifica fêmeas; “cervos” não exige essa restrição» → \'os cervos\'.'
             ' Refused: the loss is the one this decision names; the homophone is a wrong first hearing in a sung line, and the blind'
             ' reader heard \'corças\' as animals (he listed the word as unknown, the cost). 17:34 has the same ruling.')

# audit
steps = json.loads((folder / 'audit_v2.json').read_text(encoding='utf-8'))
data['audit'].extend(steps)
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
