"""Ps 26 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps026/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; then add audit_v2.json with ps005/audit_add.py."""
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


def promote(d, index, note):
    o = d['options'].pop(index)
    demote(d)
    o['note'] = note
    d['options'].insert(0, o)


data['version'] = 2
data['status'] = 'reviewed'

# 26:1b — the stylist: 'tremer de alguém' is not Portuguese; 'diante de' is
d = decisions['trepidabo']
d['why'] += (' Heard (draft 1): the stylist — «A regência soa traduzida: em português, trememos de medo, mas diante de alguém» →'
             ' ‘diante de quem tremerei?’. Taken: Matos Soares 1932\'s preposition, already the option; a quo (ἀπὸ τίνος) is the'
             ' source of the fear, which Portuguese says with ‘diante de’. The two questions keep their verbs (temerei / tremerei).')
promote(d, 1, 'Ruling (draft 2): the Portuguese preposition for fearing someone (the stylist; MS1932).')

# 26:3 / 26:3b — the stylist: the subject late, two 'se'; the blind reader: 'postar' unknown
d = decisions['castra']
d['why'] += (' Heard (draft 1): the stylist — «O sujeito demora a chegar, e a sequência dos dois “se” torna a entrada pouco'
             ' desembaraçada» → ‘Se um acampamento se postar contra mim’; the blind reader listed ‘postar’ unknown (and today it is'
             ' heard as posting online). Taken, both: the subject first, and ‘se instalar’ for consístere (to take one\'s stand, settle'
             ' in place — a camp is pitched and stays), the reader\'s own everyday word; he heard an enemy camp set up, which is the'
             ' Latin. 26:3b turns the same way (‘Se uma batalha se levantar contra mim’), so the pair of conditions stays built alike, as'
             ' Si consístant advérsum me … Si exsúrgat advérsum me. The Eastertide responsory (Pasc2-3.txt) still stands alone.')
verses['26:3'] = 'Se {castra} contra mim, * o meu coração não temerá.'
verses['26:3b'] = 'Se uma batalha se levantar contra mim, * {inhoc}.'
d['options'] = [
    option('um acampamento se instalar', {'castra': 'um acampamento se instalar'},
           'Ruling (draft 2): the subject first (the stylist); a known verb for the stand (the blind reader).', 'stylist'),
    option('um acampamento se postar', {'castra': 'um acampamento se postar'},
           'The stylist\'s words: ‘postar’ unknown to the blind reader.', 'stylist'),
    option('acampamentos se instalarem', {'castra': 'acampamentos se instalarem'},
           'The Latin\'s plural form.', 'draft'),
    option('um exército acampado se postar', {'castra': 'um exército acampado se postar'},
           'Douay-Rheims\'s sense, the army supplied.', 'DRB'),
    option('se postar um acampamento (draft 1 order: ‘Se contra mim …’)', {'castra': 'se postar um acampamento'},
           'Draft 1: the Latin\'s order; the subject late.', 'draft'),
]
data['choices']['26:3b'] = data['choices']['26:3b'] + ' Draft 2: natural order, as 26:3 (the pair kept alike).'

# 26:5 — the stylist: 'esconderijo'
d = decisions['abscondito']
d['why'] += (' Heard (draft 1): the stylist — ‘no lugar escondido’ «soa como uma explicação provisória» → ‘no esconderijo da sua'
             ' tenda’. Refused: ‘esconderijo’ is latíbulum\'s (17:12 ‘fez das trevas o seu esconderijo’, glossary), and 30:21'
             ' (in abscóndito faciéi tuæ) will need the same word as here; his word is an option. The blind reader passed the phrase.')
d['options'].append(option('no esconderijo', {'abscondito': 'no esconderijo'},
                           'The stylist\'s word: latíbulum\'s in this psalter (17:12).', 'stylist'))

# 26:6b — the stylist: 'Rodeei' with no object; the blind reader supplied the tent
d = decisions['circuivi']
d['why'] += (' Heard (draft 1): the stylist — «Sem complemento, o verbo deixa no ouvido a pergunta “rodeei o quê?”» → ‘Dei a volta’;'
             ' the blind reader supplied the tent. Taken in substance with the draft\'s option ‘Andei ao redor’: ‘rodear’ is transitive'
             ' in Portuguese, and the Latin has no object here, so the going-round is said intransitively; ‘ao redor’ keeps circum-,'
             ' and the verb stays apart from circumdáre → cercar (25:6). ‘Dei a volta’ is also ‘I turned round’, and is an option.')
promote(d, 1, 'Ruling (draft 2): the going round without an object, as the Latin (the stylist\'s remark).')
d['options'].append(option('Dei a volta', {'circuivi': 'Dei a volta'},
                           'The stylist\'s words; also heard as ‘I turned round’.', 'stylist'))

# 26:6b — the blind reader: 'vítima' heard as someone harmed
d = decisions['hostiam']
d['why'] += (' Heard (draft 1): the blind reader — «Uma pessoa sacrificada ou prejudicada»; he listed ‘imolei’ unknown, so the'
             ' ritual verb did not frame it for him. Kept, with the cost recorded: ‘hóstia’ is heard as the Host, ‘sacrifício’ is'
             ' sacrifícium\'s (115:17 has sacrificábo hóstiam, so the two must differ), and ‘vítima’ after ‘imolei’ is the word'
             ' Portuguese has for what is immolated.')

# 26:4b — the Latinist (minor): the plural 'delícias'
d = decisions['voluptatem']
d['why'] += (' Heard (draft 1): the Latinist, minor — «“Delícias” é semanticamente defensável, mas passa ao plural o substantivo'
             ' singular» → ‘o prazer do Senhor’. Refused: ‘prazer’ is heard first as the senses\' and 25:3 now has ‘achei prazer’'
             ' for complacére; number is grammar (the plural is the idiom); the singular stays the option ‘a delícia’. The blind'
             ' reader heard the good things the Lord gives (food a far second).')
d['options'].append(option('o prazer', {'voluptatem': 'o prazer'},
                           'The Latinist\'s fix (the singular): heard first as the senses\'.', 'latinist'))

# 26:9b — the Latinist's MAJOR, held (D19 / D24)
d = decisions['adjutor']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «“Adjútor” designa aquele que ajuda; “auxílio” substitui essa designação'
             ' pessoal por uma abstração» → ‘auxiliador’. Held, as in 117:7, 118:114, 9:10, 17:3b, 18:15b and 29:11 (D19, D24): the'
             ' glossary ruling; the option stands.')

# 26:10 — the stylist: 'Porque … mas'
data['choices']['26:10'] = data['choices']['26:10'] + (
    ' Draft 2: autem → ‘porém’ after the subject, where the Latin has it (Dóminus autem), at the stylist\'s remark that ‘Porque … mas’'
    ' breaks the sentence; quóniam stays ‘Porque’ (his ‘Pois’ refused, the glossary).')
verses['26:10'] = 'Porque o meu pai e a minha mãe me abandonaram: * o Senhor, porém, me recolheu.'

# 26:11 — the stylist: 'Ponde uma lei para mim'
d = decisions['legem']
d['why'] += (' Heard (draft 1): the stylist — «“Pôr uma lei para alguém” não é uma combinação corrente» → ‘Estabelecei para mim uma'
             ' lei’. Refused: ‘estabelecer’ is constitúere / statúere\'s (refused on the same ground at 24:12); pónere → pôr; the'
             ' blind reader heard ‘give me a rule to follow’, the sense. His line is an option.')
d['options'].append(option('Estabelecei para mim uma lei', {'legem': 'Estabelecei para mim uma lei'},
                           'The stylist\'s words: another Latin verb\'s.', 'stylist'))

# 26:12 — the stylist: the second colon long
data['choices']['26:12'] = data['choices']['26:12'] + (
    ' The stylist asked for ‘pois contra mim se ergueram’ (breath); refused — quóniam → porque, insúrgere → levantar-se (glossary),'
    ' and the length is the Latin\'s. The blind reader heard ‘as almas’ as spirits (ánima → alma, the Latin\'s word; the options'
    ' explain) and the lie turned on itself rightly.')

# 26:13 — the Latinist's MAJOR, held
d = decisions['credo']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «O infinitivo presente “vidére” foi convertido em futuro explícito» → ‘Creio'
             ' ver’. Held: ‘Creio ver’ is Portuguese for ‘I think I see’ (a wrong first hearing, rule 2 against rule 1); the Greek'
             ' πιστεύω τοῦ ἰδεῖν is an articular infinitive of what is looked for, and ‘in the land of the living’ is still to come;'
             ' the stylist chose this as the best line, and the blind reader heard it without a doubt. His words stay the option.')

# 26:14 — the stylist's worst line: 'varonilmente'; the order of the wish
d = decisions['viriliter']
d['why'] += (' Heard (draft 1): the stylist\'s worst line — «“Varonilmente” soa livresco … “porta-te” sugere sobretudo'
             ' comportamento» → ‘age como homem’; the blind reader listed ‘varonilmente’ unknown. Taken in part: ‘como homem’ (the'
             ' vir of the adverb said in a known word; ‘porta-te como homem’ is the current exhortation to courage), with the verb'
             ' kept for 30:25 (‘Portai-vos como homens’; ‘Agi’ is also ‘I acted’). The man is the Latin\'s (vir), not a gloss.')
d['options'].insert(0, option('porta-te como homem', {'viriliter': 'porta-te como homem'},
                              'Ruling (draft 2): the adverb\'s man in a known word; 30:25 can follow.', 'stylist'))
d['options'][1]['note'] = 'Draft 1. Matos Soares 1932: ‘varonilmente’ unknown to the blind reader, bookish to the stylist.'
d['options'].append(option('age como homem', {'viriliter': 'age como homem'},
                           'The stylist\'s words: 30:25 could not follow (‘agi’).', 'stylist'))
verses['26:14'] = '{exspecta}, {viriliter}: * e que o teu coração se fortaleça, e {sustine}.'
data['choices']['26:14'] = data['choices']['26:14'] + (
    ' Draft 2: the jussive as ‘e que o teu coração se fortaleça’ (the stylist: the inverted wish sounded ceremonious).')

# 26:14 — the three hoping verbs (HANDOFF Open 14): no reader remarked; the ruling stands
d = decisions['exspecta']
d['why'] += (' Heard (draft 1): no critic remarked on the pair; the blind reader heard an exhortation to the listener (the Latin\'s'
             ' tu). The three verbs stay apart.')

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
