"""Append the glossary rows of 118:33–80. Reads glossary.md at run time (another agent appends to it too),
inserts term rows at the end of the Terms table and formula rows at the end of the Formulas table, and
touches three existing rows by exact substring. Run once: python3.13 research/psalterium/ps118/glossary_part2.py"""

import sys
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
text = path.read_text(encoding='utf-8')
if 'supersperáre' in text:
    sys.exit('already applied')

terms = [
    '| supersperáre in | pôr toda a esperança em (*pus toda a esperança nos vossos juízos*) | open | Ps 118:43, 74 (also 81, 114, 147 — only in this psalm); the calque of ἐπελπίζω; one verse after *sperávi* (118:42 → *esperei*). Draft 4 *esperei muito em* (DRB "hoped exceedingly") was heard by the blind reader FIRST as "I waited a long time for", both times; MS1932 has this at 118:74 (with *minha*) |',
    '| intelléctus, *da mihi intelléctum* | entendimento (*Dai-me entendimento, e …*) | open | Ps 118:34, 73 (also 125, 130, 144, 169); one family with 118:27 *Fazei-me entender* (the Greek has that verb here too); MS1932 and DM1962 *inteligência* |',
    '| dedúcere, *deduc me* | guiar (*Guiai-me à vereda*) | open | Ps 118:35; ὁδηγέω; 5:9, 22:3, 42:3, 60:4, 138:10. The cognate fails rule 3 even with its enclitic: *conduzi-me* is also "I behaved myself" (D13 does not rescue it); MS1932 *Guia-me* |',
    '| statúere | firmar (*Firmai o vosso dito para o vosso servo*) | open | Ps 118:38; 39:3 *státuit super petram pedes meos*, 118:106 *státui*; keeps *estabelecer* for constitúere and *confirmar* for confirmáre; will share a word with firmáre |',
    '| vánitas | vaidade | working | Ps 118:37 = Ps 4:3; the blind reader heard conceit about one\'s looks first, emptiness second; option *o que é vão* |',
    '| suspicári | recear (*a minha afronta, que receei*) | open | Ps 118:39; L&S "suspect, apprehend"; DRB *apprehended*; the cognate *suspeitar* loses the dread; kept apart from timére → temer |',
    '| amputáre | cortar | working | Ps 118:39; the image kept; *tirar* is auférre\'s (118:22, 43) |',
    '| jucúndus | agradável | open | Ps 118:39 *os vossos juízos são agradáveis*; 80:3, 103:34, 111:5, 132:1 *quam bonum et quam jucúndum*, 146:1; *suave* is suávis\', *deleitoso* delectáre\'s |',
    '| velle | querer | working | Ps 118:35 *porque foi ela que eu quis*; apart from desideráre → desejar and concupíscere → ansiar por |',
    '| avarítia | avareza | working | Ps 118:36 |',
    '| humílitas / humiliáre | humilhação / humilhar | open | Ps 118:50, 67, 71, 75 (also 92, 107, 153; 9:14, 24:18 *vide humilitátem meam*); one family, as the psalm sets them together; *humildade* is heard as the virtue (but is the Magnificat\'s traditional word — unverified from memory); heard by the blind reader as being brought low first, affliction second |',
    '| a sǽculo | desde sempre | open | Ps 118:52; the mirror of *in sǽculum* → para sempre (89:2 *a sǽculo et usque in sǽculum*; 24:6, 92:2); hangs on either neighbour as the Latin does; option *de outrora* (DM1962) |',
    '| semper | sempre | working | Ps 118:33, 44 |',
    '| deféctio / defícere | desfalecimento / desfalecer | open | Ps 118:53 *O desfalecimento me tomou* (118:81, 82, 123 have the verb); ἀθυμία; heard as a physical faint first; option *desânimo* |',
    '| cantábilis | digno de canto | open | Ps 118:54 (only here); L&S "worthy to be sung"; as laudábilis → digno de louvor; the cognate *cantáveis* is also "vós cantáveis"; DM1962 *cânticos* is the Hebrew\'s noun |',
    '| peregrinátio | peregrinação | working | Ps 118:54; apart from íncola → forasteiro; heard as a religious journey first |',
    '| pórtio | porção | working | Ps 118:57 (141:6); apart from pars → parte (15:5, 72:26) |',
    '| deprecári / deprecátio | suplicar / súplica | open | Ps 118:58 *Supliquei a vossa face* (the face kept; 44:13 *vultum tuum deprecabúntur*); apart from oráre / orátio → oração |',
    '| cogitáre | pensar em | working | Ps 118:59; *considerar* is consideráre\'s |',
    '| convértere | voltar (*voltei os meus pés*, *Voltem-se para mim*) | open | Ps 118:59, 79; *converter* is heard as religious conversion; will have to serve *Convérte nos, Deus* and 125:1 |',
    '| turbáre | perturbar | working | Ps 118:60 *não fui perturbado* (the Latinist wanted the perfect passive kept: major) |',
    '| circumplécti | envolver | open | Ps 118:61 *As cordas dos pecadores me envolveram*; third verb of "around" beside circumdáre → cercar and circuíre → rodear |',
    '| funes | cordas | working | Ps 118:61 |',
    '| justificátio (singular) | justificação | open | Ps 118:62 only: *os juízos da vossa justificação*. NOT the term justificatiónes → preceitos: it stands for δικαιοσύνη. The cognate is kept so that the verse stays distinct from the formula *os juízos da vossa justiça* (118:7, 106, 160, 164); option *da vossa justiça* (the Greek, MS1932). The blind reader could not settle its sense and listed it as unknown |',
    '| párticeps | ter parte com (*Eu tenho parte com todos os que vos temem*) | open | Ps 118:63; understood by the blind reader; the stylist wants *companheiro de* |',
    '| bónitas · *bonitátem fácere cum* | bondade · *usar de bondade com* | open | Ps 118:65, 66, 68; the light verb yields (MS1932), the noun stays so that Teth\'s run on *bon-* is heard |',
    '| disciplína | disciplina | working | Ps 118:66 (παιδεία); heard as keeping rules first |',
    '| sciéntia | o saber | open | Ps 118:66; 18:3, 93:10, 138:6; *ciência* (MS1932) was heard first as science; option *conhecimento* |',
    '| crédere (+ dative) | acreditar em | open | Ps 118:66; *cri* is the Latin\'s length and almost never said; 115:1 *Crédidi* |',
    '| delínquere / delíctum | cometer faltas / falta | open | Ps 118:67; L&S "to be wanting in one\'s duty, commit a fault"; apart from peccáre → pecar; serves 24:7 *as faltas da minha juventude*, 18:13; *delinquir* belongs to the police report |',
    '| coaguláre | coalhar(-se) | working | Ps 118:70 *coalhou-se como leite* — milk, not the Hebrew\'s fat |',
    '| plasmáre | moldar | open | Ps 118:73; the potter\'s verb; apart from fíngere and formáre; DM1962 *plasmaram* is the option |',
    '| cognóscere / novísse | conhecer | working | Ps 118:75 *Conheci, Senhor, que …*, 118:79 |',
    '| fíeri, jussive *Fiat* | *Seja* | open | Ps 118:76, 80 (118:173 next): *Faça-se* (the glossary\'s fazer-se, and the Angelus\') failed the stylist twice; DRB "let … be", MS1932 *Seja*; the row *fíeri, factus est → fazer-se* stands for the perfect |',
    '| miseratiónes | compaixões | open | Ps 118:77, one verse after misericórdia (118:76); two words in the Greek as well (οἰκτιρμοί / ἔλεος); side by side in 24:6, 102:4; 50:3; MS1932 merges them |',
    '| *iniquitátem fácere in* | tratar com iniquidade | open | Ps 118:78 (from the stylist); the light verb yields; *praticar a iniquidade* stays operári\'s |',
    '| ego autem / ego vero | mas eu / eu, porém, | working | Ps 118:69, 70, 78 — the Latin varies and so does the Portuguese |',
]
formulas = [
    '| *secúndum elóquium tuum* (118:41, 58, 76; 116, 133, 170 to come; 118:154 has *propter*, 118:169 *juxta*) | *segundo o vosso dito* | **tested in Ps 118:33–80 and refused by the stylist in all six places where the singular stands** ("a quoted phrase", "bookish", "guardar um dito is to keep a phrase in memory"; he asks for *palavra*). The blind reader understood it everywhere; the Latinist passed it. It stays in the text under D15 — for the main session to revisit; fall-backs *segundo a vossa promessa* (fails 118:67) or the merge into *palavra* (collapses this formula into *secúndum verbum tuum*, 7 verses away at 118:58 / 65) |',
    '| *Da mihi intelléctum, et …* (118:34, 73, 125, 144, 169) | *Dai-me entendimento, e …* | working — Ps 118 |',
    '| *lex tua meditátio mea est* (118:77, 92, 97, 174) | *a vossa lei é a minha meditação* | working — Ps 118 |',
    '| *Qui timent te / timéntes te* (118:63, 74, 79) | *os que vos temem* | working — Ps 118 |',
    '| *in sǽculum et in sǽculum sǽculi* (118:44; 9:6, 44:18, 144:1–2 …) | *para sempre e pelos séculos dos séculos* | open — the two glossary formulas joined; the Latinist twice asked (minor) for the singular *pelo século do século*; MS1932 *pelos séculos e pelos séculos dos séculos* is the option |',
    '| *super judícia justítiæ / justificatiónis tuæ* (118:62, 164) | *pelos juízos da vossa …* | working — Ps 118:62 |',
]

marker = '\n\n## Formulas'
head, tail = text.split(marker, 1)
head = head.rstrip('\n') + '\n' + '\n'.join(terms)
doublets = '\n\n## Doublets'
formulaPart, rest = tail.split(doublets, 1)
formulaPart = formulaPart.rstrip('\n') + '\n' + '\n'.join(formulas)
text = head + marker + formulaPart + doublets + rest

# existing rows: what was "not yet met" is now met
edits = [
    ('Ps 118 (118:35, 118:105; not yet met in a translated verse); τρίβος', 'Ps 118:35 *Guiai-me à vereda dos vossos mandamentos* (118:105 to come) — the blind reader listed *vereda* as unknown, the stylist let it pass; τρίβος'),
    ('Ps 118 (118:40, 75, 144, 172; not yet met in a translated verse); keeps', 'Ps 118:40 *na vossa equidade*, 118:75 *os vossos juízos são equidade* (144, 172 to come) — the blind reader listed *equidade* as unknown; keeps'),
    ('*falas* stands under D2 — the ruling of the set most exposed to the ear |', '*falas* stands under D2 — the ruling of the set most exposed to the ear. **Heard (118:33–80):** the singular *o vosso dito* was refused by the stylist in all six places (118:38, 41, 50, 58, 67, 76), each time for *palavra*; the blind reader understood it everywhere; see the formula row *secúndum elóquium tuum*. 118:42 (*verbum … sermónibus*) decides locally for *uma palavra … nas vossas palavras* |'),
]
for old, new in edits:
    if text.count(old) != 1:
        sys.exit(f'row not found exactly once: {old[:60]}')
    text = text.replace(old, new)

path.write_text(text, encoding='utf-8')
print(len(terms), 'term rows,', len(formulas), 'formula rows, 3 rows updated')
