"""Ps 37 draft 2 from draft 1 + the three readers. python3.13 research/psalterium/ps037/revise_v2.py (reads prayed.v1.json, writes prayed.json)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
data['version'] = 2
data['status'] = 'reviewed'
decisions = {d['id']: d for d in data['decisions']}


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def first(id, option, why=''):
    """Put a new ruling in front; the old option 0 stays as option 1."""
    d = decisions[id]
    d['options'].insert(0, option)
    if why:
        d['why'] += ' ' + why


def promote(id, index, why):
    d = decisions[id]
    d['options'].insert(0, d['options'].pop(index))
    d['why'] += ' ' + why


def add(id, option, why=''):
    decisions[id]['options'].append(option)
    if why:
        decisions[id]['why'] += ' ' + why


# 37:8 illúsio — Latinist MAJOR and the stylist, the same fix
first('illusionibus', o('escárnios', {'illusionibus': 'escárnios'}, 'Ruling (draft 2): the Latinist (major) and the stylist.', 'latinist'),
      'Heard (draft 1): the Latinist, MAJOR — «In Church Latin \'illusio\' means mockery or derision (from \'illudere\', to mock; LXX'
      ' ἐμπαιγμῶν). Portuguese \'ilusões\' means deceptions or false perceptions» → \'escárnios\'; the stylist the same («as if the loins'
      ' were daydreaming») → \'escárnios\'; the blind reader heard fantasies and was puzzled. Taken: draft 1 leaned on L&S\'s'
      ' ecclesiastical sense, but the Greek, 78:4 and every reader agree, and a wrong first hearing is a fault (D2). *escárnio* is of'
      ' the family the derídere row gives *escarnecer*; illúsio and derísum never meet in a verse (43:14 *subsannatiónem et derísum*,'
      ' 78:4 *subsannátio et illúsio* are near twins — 78:4 will want this word). *ilusões* stays as option 1.')

# 37:12 / 12b stetérunt — Latinist minor ×2; the blind reader heard *detido* (arrested); the stylist stumbled on *se detiveram de longe*
first('steterunt', o('ficaram de pé … ficaram de longe', {'steterunt': 'ficaram de pé', 'steterunt2': 'ficaram de longe'},
                     'Ruling (draft 2): the Latinist\'s fix; one verb, *ficar*, for both stetérunt.', 'latinist'),
      'Heard (draft 1): the Latinist, minor twice — «\'stare\' means to stand. \'Deter-se\' means to stop or halt» → \'e ficaram de pé\','
      ' \'ficaram de longe\'; the blind reader heard *se detiveram* as possibly \'were detained\'; the stylist found *deter-se de longe*'
      ' unidiomatic. Taken: *ficar* twice keeps the Latin\'s one verb; *de pé* is the stare row\'s standing (*estar de pé*); in 12b'
      ' *ficaram de longe* is the natural "stood far off".')

# 37:9 a gémitu — Latinist minor
promote('rugiebam', 1, 'Heard (draft 1): the Latinist, minor — «\'a gemitu\' gives the source or cause … \'com\' turns it into'
        ' accompaniment» → \'pelo gemido\'. Taken: 6:8\'s preposition for *a* + ablative.')
decisions['rugiebam']['options'][0]['note'] = 'Ruling (draft 2): the Latinist; 6:8\'s *pelo*.'
decisions['rugiebam']['options'][0]['from'] = 'latinist'

# 37:12 order — the stylist
promote('proximi', 1, 'Heard (draft 1): the stylist — «Putting both possessives after the noun copies the Latin word order. It'
        ' sounds precious and calqued» → \'Os meus amigos e os meus vizinhos\'. Taken in part: the plain order returns, and the'
        ' proparoxytone *próximos* stands at the mediant (a soft rule, rule 4; the Latin\'s *próximi mei* is itself two words from the'
        ' mark). Refused in part: *vizinhos* is vicínus\'s (30:12) and would drop *próximi*, which the Latin echoes in'
        ' *appropinquavérunt* (*próximos … aproximaram*).')
decisions['proximi']['options'][0]['note'] = 'Ruling (draft 2): the plain order (the stylist); proparoxytone at the mediant accepted.'
add('proximi', o('Os meus amigos e os meus vizinhos', {'proximi': 'Os meus amigos e os meus vizinhos'},
                 'The stylist: vicínus\'s word; loses the echo with *aproximaram*.', 'stylist'))

# 37:17 — the stylist's worst line; the blind reader heard a purpose clause
data['verses']['37:17'] = 'Porque eu disse: {nequando}: * e enquanto os meus pés {commoventur}, falaram {magna} contra mim.'
d = decisions['nequando']
d['options'] = [
    o('Que os meus inimigos não se alegrem à minha custa', {'nequando': 'Que os meus inimigos não se alegrem à minha custa'},
      'Ruling (draft 2): a wish, subject first (the stylist\'s build, the row\'s *à minha custa*).', 'stylist'),
    o('Para que não se alegrem à minha custa os meus inimigos', {'nequando': 'Para que não se alegrem à minha custa os meus inimigos'},
      'Draft 1: the nequándo row; heard as a purpose clause.', 'glossary'),
    o('Que nunca se alegrem à minha custa os meus inimigos', {'nequando': 'Que nunca se alegrem à minha custa os meus inimigos'},
      'Matos Soares 1932 (*Nunca triunfem*): *quando* heard in *nunca*.', 'MS1932'),
    o('Que os meus inimigos não exultem sobre mim', {'nequando': 'Que os meus inimigos não exultem sobre mim'},
      'The Latinist and the stylist: *exultar* is exsultáre\'s; *sobre mim* after a verb of joy is heard "about me" (super me row).', 'stylist'),
]
d['why'] += (' Heard (draft 1): the blind reader took *Para que não* as a purpose clause («I said this so that they would not rejoice;'
             ' what was said is unclear»), and the stylist named 37:17 the worst line («\'Para que não\' as the opening of direct speech is'
             ' awkward … The inverted subject piles the whole colon onto its tail») → \'Que os meus inimigos não exultem sobre mim\'. Taken'
             ' in part: after *eu disse:* the quoted words are a wish, and *Que … não* + subjunctive is the Portuguese of a quoted'
             ' μήποτε-wish; the subject first. So the nequándo row\'s *para que não* holds where the clause depends on a verb (2:12, 27:1),'
             ' not in quoted speech. Refused in part: *exultem sobre mim* — the Latinist also asked it (minor: «\'à minha custa\' … adds a'
             ' nuance of profiting») — is refused for the super me row (29:2, 34:19, 34:24: supergaudére → *alegrar-se à minha custa*;'
             ' *exultar* is exsultáre\'s); the blind reader heard *à minha custa* as gloating first. Option 3.')

dec_magna = {
    'id': 'magna', 'refs': ['37:17'], 'latin': 'super me magna locúti sunt', 'kind': 'glossary',
    'why': 'magna loqui (ἐμεγαλορρημόνησαν, "spoke big") → *falar grandezas*, as 34:26b *os que falam grandezas contra mim* and 11:4'
           ' *que fala grandezas* (magníloquus). Heard (draft 1): the stylist — «\'Falaram grandezas\' is unidiomatic, since \'grandezas\''
           ' suggests quantities or splendours» → \'grandes coisas\'; the blind reader listed *grandezas* (as boasts) unknown. Refused'
           ' here for the two finished places that already say it; the evidence goes to the glossary so the three change together if'
           ' they change.',
    'options': [
        o('grandezas', {'magna': 'grandezas'}, 'Ruling: 34:26b, 11:4.', 'glossary'),
        o('grandes coisas', {'magna': 'grandes coisas'}, 'The stylist.', 'stylist'),
    ],
}
data['decisions'].append(dec_magna)
add('commoventur', o('vacilam', {'commoventur': 'vacilam'}, 'The stylist again (draft 1): «\'São abalados\' is a heavy passive».', 'stylist'),
    'Heard (draft 1): the stylist asked *vacilam*; refused — the Latin\'s passive (commovéntur) and the movéri row; the blind reader'
    ' heard "while I am shaken" rightly.')
decisions['commoventur']['options'] = [x for x in decisions['commoventur']['options'] if not (x['label'] == 'vacilam' and x['from'] == 'MS1932')]

# 37:13 — refused, kept as options
data['verses']['37:13'] = 'E os que procuravam males contra mim falaram {vanitates}: * e o dia todo {meditabantur} enganos.'
data['decisions'].append({
    'id': 'vanitates', 'refs': ['37:13'], 'latin': 'locúti sunt vanitátes', 'kind': 'glossary',
    'why': 'vánitas → *vaidade* (row; 4:3, 30:7, 118:37). Heard (draft 1): the stylist — «Today \'vaidades\' means vanity in the sense of'
           ' pride» → \'coisas vãs\'; the blind reader heard boastful talk first and listed the sense unknown. Refused: *coisas vãs* is'
           ' the glossary\'s for inánia and vana (2:1, 11:3), and this psalm cannot change the row alone; the evidence (now four readers'
           ' across 4, 30, 37) goes to the row.',
    'options': [o('vaidades', {'vanitates': 'vaidades'}, 'Ruling: the row.', 'glossary'),
                o('coisas vãs', {'vanitates': 'coisas vãs'}, 'The stylist; inánia\'s words.', 'stylist')],
})
data['decisions'].append({
    'id': 'meditabantur', 'refs': ['37:13'], 'latin': 'dolos tota die meditabántur', 'kind': 'glossary',
    'why': 'meditári + accusative → *meditar* (row, 2:1 *meditaram coisas vãs*; 35:5 *Meditou a iniquidade*): the Latin uses the one'
           ' verb for the just man\'s meditation and the plotter\'s, and the psalter plays on it. Heard (draft 1): the stylist — «\'meditar\''
           ' is devotional, so \'meditar enganos\' sounds almost self-contradictory» → \'tramavam\'. Refused: *tramar* explains and'
           ' dissolves the Latin\'s verb (D2). The blind reader heard "thought up deceptions" first.',
    'options': [o('meditavam', {'meditabantur': 'meditavam'}, 'Ruling: the row.', 'glossary'),
                o('tramavam', {'meditabantur': 'tramavam'}, 'The stylist.', 'stylist')],
})

# 37:11 article — refused
data['verses']['37:11'] = '{cor} está perturbado, abandonou-me o meu {virtus}: * e a luz dos meus olhos, {ipsum} está comigo.'
data['decisions'].append({
    'id': 'cor', 'refs': ['37:11'], 'latin': 'Cor meum conturbátum est', 'kind': 'grammar',
    'why': 'Heard (draft 1): the stylist — «The article on the opening possessive adds a syllable the breath doesn\'t need» → \'Meu'
           ' coração\'. Refused: the glossary keeps the article before possessives (*o vosso nome*, *a minha alma*) throughout.',
    'options': [o('O meu coração', {'cor': 'O meu coração'}, 'Ruling: the article (glossary).', 'glossary'),
                o('Meu coração', {'cor': 'Meu coração'}, 'The stylist.', 'stylist')],
})

# refused stylist proposals already standing as options: note them
for id, label, why in (
    ('redargutiones', 'réplicas', 'Heard (draft 1): the stylist — «\'Repreensões\' is heavy and sounds like scolding … \'Réplicas\' is the'
     ' plainer faithful word» → \'réplicas\'. Refused: the echo with 37:2 (ἐλέγξῃς … ἐλεγμούς) is the Latin\'s own, and the blind reader'
     ' heard "does not scold / rebuke others", which is within the word (he had no reproof to give back). Option 1.'),
    ('conspectu', 'diante de mim', 'Heard (draft 1): the stylist — «\'Minha … minha\' in quick succession, and \'à minha vista\' is'
     ' slightly stiff» → \'diante de mim\'. Refused: the conspéctus row (15:8), and *diante de* already carries a fácie three times in'
     ' this psalm. Option 1.'),
):
    decisions[id]['why'] += ' ' + why
    for x in decisions[id]['options']:
        if x['label'] == label:
            x['note'] += ' Also the stylist\'s proposal (draft 1).'

add('intende', o('Acudi em meu auxílio', {'intende': 'Acudi em meu'}, 'The stylist; *acudir* is not inténdere\'s verb (D3).', 'stylist'),
    'Heard (draft 1): the stylist — «\'Atender em\' is not a Portuguese construction … \'Acudir em auxílio\' is the natural idiom» →'
    ' \'Acudi em meu auxílio\'. Refused: D3 gives inténdere *atender*, kept apart from the verbs it stands beside, and the blind reader'
    ' heard *Atendei em meu auxílio* first as "come to my help" — the sense arrives. The formula (69:2 opens every Hour) is proposed'
    ' as an open glossary row, so the coordinator can rule it once.')

# the afacie decision: note the blind reader
decisions['afacie']['why'] += (' Heard (draft 1): the blind reader heard *diante de* as "in front of / in the face of" in 37:4 and 37:6,'
                               ' not as cause — one of the two senses kept; the Latinist passed it. Kept.')
decisions['illusionibus']['options'][1]['note'] = 'Draft 1 (DRB, MS1932, L&S on this verse): heard as fantasies by all three readers.'
decisions['lumbi']['why'] += (' Heard (draft 1): the blind reader listed *lombos* unknown and heard "lower back"; the Latinist and the'
                              ' stylist passed it. Kept: the organ the Latin names (rule 5); *entranhas* is the option.')

data['choices']['37:17'] = (data['choices']['37:17'] + ' Draft 2 makes the quoted words a wish (*Que … não*), subject first.')
data['choices']['37:12'] = data['choices']['37:12'] + ' stetérunt → *ficaram de pé* (draft 2).'

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
