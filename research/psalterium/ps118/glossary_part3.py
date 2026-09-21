"""Append the glossary rows of 118:81–128. Reads glossary.md at run time (other agents append to it too),
inserts term rows at the end of the Terms table and formula rows at the end of the Formulas table, and
adds this portion's evidence to existing rows by exact substring — never changing a ruling or a status.
Run once: python3.13 research/psalterium/ps118/glossary_part3.py"""

import sys
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
text = path.read_text(encoding='utf-8')
if 'defícere in' in text:
    sys.exit('already applied')

terms = [
    '| defícere in (+ accusative) | desfalecer à espera de (*A minha alma desfaleceu à espera da vossa salvação*) | open | Ps 118:81, 82, 123 (MS1932). Draft 7 had the bare preposition, *desfalecer por* (DM1962\'s diction; the *por* of *ansiar por*): the blind reader heard 118:81 and 123 rightly, but **118:82 *desfaleceram pelo que dissestes* as cause** ("a reaction to what you said"). Costs: a noun supplied; *espera* beside *esperança* in 118:81. Other places of *defícere in*: 68:4 *defecérunt óculi mei, dum spero in Deum meum* is another build; 83:2 *concupíscit, et déficit ánima mea in átria Dómini* is this one (lists checked with `ps118/grep_latin_part3.py`) |',
    '| exspectáre / exspectátio | aguardar / *o que aguardo* (*Os pecadores me aguardaram*; *não me envergonheis pelo que aguardo*) | open | Ps 118:95, 116; kept apart from speráre → esperar em, spes → esperança, supersperáre (the Greek keeps them apart too: ὑπομένω, προσδοκία). The noun: *expectativa* failed the stylist ("bureaucratic"), *no que aguardo* failed him too (the preposition), *pelo que aguardo* stands; the Latinist (minor) wants the noun, *pela minha expectativa*. 14 verses: 26:14 *Exspécta Dóminum*, 36:34, 38:8, 39:2 *Exspéctans exspectávi Dóminum*, 51:11, 54:9, 68:7, 68:21, 103:11, 103:27, 118:166 *Exspectábam salutáre tuum*, 141:8 — **wants a ruling before Ps 26** |',
    '| permanére / perseveráre | permanecer (both) | open | Ps 118:89, 90, 91: the Greek has διαμένει three times, the Latin varies the third (*persevérat dies*). Drafts 7–9 kept *persevera o dia*; the stylist refused it on his second reading; merged on D15\'s test (one Greek verb, no difference of sense). Option *persevera* |',
    '| odísse / ódio habére | odiar / ter ódio a, object first (*Aos iníquos tive ódio*) | open | Ps 118:104 *odívi* → *odiei*; 118:113, 128 (163 to come) *ódio hábui*. Draft 7 merged them (one Greek verb, ἐμίσησα); the stylist then faulted the proparoxytone cadences *iníquos* / *iníquo* and himself proposed *Aos iníquos tive ódio* — the Latin word for word — so the periphrasis came back for the ear\'s sake. 24:19, 138:22 *ódio iníquo / perfécto óderam* are another build |',
    '| fabulátio | histórias (*Os iníquos me narraram histórias*) | open | Ps 118:85 only (L&S cite this verse: "narration, discourse"; Greek ἀδολεσχίαι). Draft 7 *fábulas* (DRB) was a proparoxytone at the mediant and was heard by the blind reader as moral tales; *coisas frívolas* (MS1932) is the option |',
    '| consummáre (a person) | acabar com (*Por pouco não acabaram comigo*) | open | Ps 118:87; the cognate *consumar* takes no personal object. The echo with *consummátio* (118:96) is lost |',
    '| consummátio | perfeição (*Vi o fim de toda perfeição*) | open | Ps 118:96 (MS1932); *consumação* is first of all a bar bill in Brazil, and the noun of *consumir*; L&S "a finishing, completing". 58:13 *in consummatióne* (twice, the only other verse) will need another word (*acabar*) |',
    '| latus | amplo | working | Ps 118:96 *o vosso mandamento é muito amplo*; family of latitúdo → amplidão |',
    '| ordinátio | ordem (*Pela vossa ordem o dia permanece*) | open | Ps 118:91; both command and arrangement, as the Latin; *ordenação* is holy orders; heard by the blind reader as "because God so orders" |',
    '| super (comparison) | mais que | working | Ps 118:72, 98, 99, 100, 103, 127 |',
    '| senes | anciãos | working | Ps 118:100; also 104:22 *senes ejus*; will share the word with senióres (106:32 *in cáthedra seniórum*) |',
    '| prohibére | reter (*Retive os meus pés de todo caminho mau*) | open | Ps 118:101; DRB "restrained"; *afastar* and *desviar* are taken; 33:14 *Próhibe linguam tuam a malo* and 39:10 are the other places (*retende* is safe at the imperative) |',
    '| fauces | garganta | open | Ps 118:103 *doces à minha garganta*; L&S, and λάρυγξ; every version has *paladar* (the option). 21:16, 68:4 *raucæ factæ sunt fauces meæ*, 136:6a |',
    '| lucérna | lâmpada | working | Ps 118:105 (MS1932, DM1962); 17:29, 131:17; option *candeia* |',
    '| statúere + infinitive | resolver (*Jurei, e resolvi guardar*) | open | Ps 118:106; L&S sense II "decide, determine, resolve" — not the *firmar* of 118:38. *determinei* (MS1932) was heard as giving an order; the stylist\'s *decidi* equals the vós imperative |',
    '| voluntária (neuter plural) | ofertas voluntárias | open | Ps 118:108 *as ofertas voluntárias da minha boca* — the noun supplied with DRB and MS1932 (τὰ ἑκούσια); 53:8 voluntárie → de livre vontade |',
    '| beneplácitum fácere | fazer que agrade (*Fazei que vos agradem, Senhor, as ofertas*) | open | Ps 118:108; placére → agradar (the adjective *agradável* stays jucúndus\'s); draft 7 *Fazei bem aceitas* failed the stylist; his *Aceitai com agrado* drops *fac*. *beneplácitum* as a noun (10 verses; Ps 5:13b leaves *beneplácito* for it) is not settled by this |',
    '| láqueum pónere | pôr um laço | working | Ps 118:110; idiom *armar um laço* is the option; 139:5–6, 141:4 |',
    '| erráre (de) | extraviar-se (de) | open | Ps 118:110 *não me extraviei dos vossos mandamentos* — chosen with 118:176 *Errávi sicut ovis quæ périit* in mind; *errar* is first "to make a mistake"; 57:4, 94:9, 106:4 |',
    '| hereditáte acquírere | adquirir por herança | working | Ps 118:111 |',
    '| fácere (justificatiónes) | cumprir | open | Ps 118:112 *para cumprir os vossos preceitos*; the light verb yields; safe as an infinitive — the vós imperative *cumpri* is a rule-3 trap; 102:18, 149:7 |',
    '| spérnere | desprezar | working | Ps 118:118; shares the word with contémptus → desprezo and contémnere |',
    '| prævaricári, *prævaricántes* | transgressores | open | Ps 118:119 *Tive por transgressores* (παραβαίνοντας); the cognate *prevaricadores* (MS1932, DRB) is a term of administrative law in Brazil; 118:158 *Vidi prævaricántes* next; reputáre → ter por |',
    '| confígere | traspassar (*Traspassai com o vosso temor as minhas carnes*) | open | Ps 118:120 (MS1932; DRB "pierce"); safe at the imperative; the blind reader listed it as unknown but paraphrased it rightly; option *Atravessai*; 31:4 *dum confígitur spina* |',
    '| carnes (plural) | carnes | working | Ps 118:120 *as minhas carnes* |',
    '| fácere judícium | fazer juízo sobre (118:84) / praticar o juízo (118:121) | open | two builds: 118:84 *quando fareis juízo sobre os que me perseguem?* (no reader heard "form an opinion of", which bare *fazer juízo de* would mean); 118:121 *Feci judícium et justítiam* → *Pratiquei o juízo e a justiça* after the stylist heard *Fiz juízo* as forming an opinion. **Collision:** *praticar* is operári\'s verb (*praticar a iniquidade*; 14:2 *operátur justítiam*), and 9:5, 75:9, 105:3 *fáciunt justítiam*, 145:7a will meet this (grep for adjacent words only) — wants a ruling |',
    '| calumniári | caluniar | working | Ps 118:121, 122 — the Latin\'s word, not the Hebrew\'s "oppress"; 71:4, 118:134 *a calúmniis hóminum* next |',
    '| fácere cum (+ person) | tratar (*Tratai o vosso servo segundo a vossa misericórdia*) | open | Ps 118:124 (MS1932); **rule-3 trap: *Agi* is also "I acted"**; 118:65 *bonitátem fácere cum* → usar de bondade com; 108:21 *fac mecum propter nomen tuum*, 85:17 *Fac mecum signum in bonum* |',
    '| scire | conhecer | open | Ps 118:125 *para que eu conheça os vossos testemunhos*; draft 7 *saiba* (apart from cognóscere) failed the stylist as a collocation; the Greek merges them; sciéntia stays *o saber* |',
    '| dissipáre | dissipar | open | Ps 118:126 *dissiparam a vossa lei*; heard by the blind reader as "made the law disappear / destroyed it"; options *desfazer*, DM1962 *violar* (the Hebrew\'s); 9 verses (17:15, 32:10, 34:16, 52:6, 67:2, 67:31b, 140:8, 143:6) |',
    '| tempus faciéndi | *É tempo de agir, Senhor* | open | Ps 118:126; the agent left open as in the Latin (vocative, not the Greek\'s dative); heard as "time for the Lord to act" first |',
    '| tota die | o dia todo | open | Ps 118:97; **the blind reader heard *todo o dia* as "every day"**; 26 verses (24:5, 31:3, 34:28, 36:26, 37:7, 43:9, 43:16, 43:22, 55:2–3 …) |',
    '| quómodo / quam (exclamation) | Como …! | working | Ps 118:97 *Como amei a vossa lei, Senhor!* (DO prints "?"; the verse is an exclamation), 118:103 *Como os vossos ditos são doces*; *Quão* (MS1932) is the option; 132:1 *quam bonum et quam jucúndum* will want it |',
    '| topázion / uter in pruína | topázio / odre na geada | working | Ps 118:127, 118:83 — the Latin\'s readings, not the Hebrew\'s fine gold and smoke |',
    '| **elóquium — evidence from 118:81–128 for whoever reviews D16** | clause kept (118:82, 116); plural *os vossos ditos* kept (118:103); noun *o dito da vossa justiça* (118:123) | open | The **clause** passed the stylist twice and the blind reader; the Latinist, on his third reading only, marked its past tense minor (118:82, 116) — D16\'s named cost. The **plural** *ditos*, which had passed every reader at 118:11, was **refused by the stylist twice at 118:103** ("maxims, popular sayings … a translator\'s choice"). The **noun** at 118:123 was refused by him twice and understood at once by the blind reader. Alternatives for the main session: (a) stand; (b) D16\'s retreat, *palavra*, for the whole term (one touch: label *palavras* of decision `eloquia` in Ps 118); (c) the clause at 118:123 too — *à espera do que disse a vossa justiça* (option in decision `v123b`; it makes justice the speaker) |',
]
formulas = [
    '| *et in verbum tuum supersperávi* (118:81b = 118:114b) | *e pus toda a esperança na vossa palavra* | working — Ps 118; hangs on *supersperáre* |',
    '| *vivífica me secúndum verbum tuum* (118:25b = 118:107b) | *vivificai-me segundo a vossa palavra* | working — Ps 118 |',
    '| *In generatiónem et generatiónem* (118:90; 32:11, 44:18a, 71:5, 78:13, 88:2, 88:5, 99:4b, 101:13, 101:25, 105:31, 134:13, 144:13a, 145:10) | *De geração em geração* | working — Ps 118:90 *De geração em geração é a vossa verdade* (copula supplied; D14\'s build) |',
    '| *Súscipe me secúndum elóquium tuum, et vivam: et non confúndas me ab exspectatióne mea* (118:116) | *Amparai-me segundo o que dissestes, e viverei: e não me envergonheis pelo que aguardo* | open — hangs on D16, D19 and *exspectáre*. From general knowledge, unverified on disk: this is the verse sung at monastic profession, where *súscipe* is understood as "receive"; *Recebei-me* is an option in decision `suscipe` |',
    '| *Lucérna pédibus meis verbum tuum, et lumen sémitis meis* (118:105) | *Lâmpada para os meus pés é a vossa palavra, e luz para as minhas veredas* | working — Ps 118 |',
]

marker = '\n\n## Formulas'
head, tail = text.split(marker, 1)
head = head.rstrip('\n') + '\n' + '\n'.join(terms)
doublets = '\n\n## Doublets'
formulaPart, rest = tail.split(doublets, 1)
formulaPart = formulaPart.rstrip('\n') + '\n' + '\n'.join(formulas)
text = head + marker + formulaPart + doublets + rest

# evidence added to existing rows (appended at the end of the row; rulings and statuses untouched)
edits = [
    ('| in ætérnum | eternamente | working | refrain of 135; kept distinct from *in sǽculum* on purpose |',
     '| in ætérnum | eternamente | working | refrain of 135; kept distinct from *in sǽculum* on purpose. **Ps 118:89, 93, 98, 111, 112** (one slot, decision `in_aeternum`): the Latinist and the blind reader passed it, *Eternamente não esquecerei* (118:93, = never) included; the stylist never named the word, but **four of his proposed lines put *para sempre* in its place** (118:98, 111 twice, 112), and its position in 118:111 had to move twice. Evidence that the ear leans to *para sempre*; merging would cost the distinction from *in sǽculum* (118:44 has that) — for the main session, with Ps 135 in view |'),
    ('MS1932 *tornar-se* is the option |',
     'MS1932 *tornar-se* is the option. Ps 118:83 *factus sum sicut uter* → *me tornei como um odre* (a state that came upon the speaker: *me fiz* would be his own doing), and 118:56 *facta est mihi* → *me aconteceu*: fazer-se cannot serve everywhere |'),
    ('plainer alternative *ajudar* splits the family |',
     'plainer alternative *ajudar* splits the family. Ps 118:86, 117 *auxiliai-me* (safe at the imperative); no reader remarked |'),
    ('the same metonymy as *suscéptor* → amparo |',
     'the same metonymy as *suscéptor* → amparo. **Ps 118:114 *Vós sois o meu auxílio e o meu amparo*: the Latinist asked for *auxiliador … protetor* three times — minor, then MAJOR twice with the text unchanged; refused each time (*protetor* is protéctor\'s; D19)** — the final text stands against the gate there |'),
    ('(*sobremaneira* is the literal) |',
     '(*sobremaneira* is the literal). **118:96:** *sobremaneira* was refused by the stylist and listed as unknown by the blind reader → *é muito amplo* (as D22\'s *valde / veheménter → muito*; σφόδρα) |'),
    ('will share a word with firmáre |',
     'will share a word with firmáre. 118:106 *státui* + infinitive is another sense — see the row *statúere + infinitive* |'),
    ('— both are in it |',
     '— both are in it. 118:107, the first affirmative clause: *Fui humilhado de todo* failed the stylist for position → *Fui de todo humilhado*, which passed |'),
    ('(36:8–9, 73:3, 82:4, 104:15) is not settled by this |',
     '(36:8–9, 73:3, 82:4, 104:15) is not settled by this. **Ps 118:115, found independently: the plural is NOT safe — the vocative *Apartai-vos de mim, malignos* was heard by the blind reader first as "evil spirits or demons"** → *malvados* there too (options *malignos*, *malfeitores*) |'),
    ('(*destruí*). No reader objected |',
     '(*destruí*). No reader objected. **Ps 118:95 *ut pérderent me* → *para me fazer perecer*** — the same rendering, reached independently (118:92 has *periíssem* three verses before). The stylist found it "ceremonious and heavy" and drafts 8–10 had his *para me destruir* (safe as an infinitive); restored in draft 11 for this row\'s sake — if the row is ruled the other way, 118:95 returns to *destruir* in one touch |'),
    ('shares the verb with the transitive *amovére / repéllere* → afastar |',
     'shares the verb with the transitive *amovére / repéllere* → afastar. Ps 118:118 *omnes discedéntes a judíciis tuis* → *todos os que se afastam dos vossos juízos* (reached independently) |'),
    ('decides locally for *uma palavra … nas vossas palavras* |',
     'decides locally for *uma palavra … nas vossas palavras*. **Heard (118:81–128):** the clause passed the stylist twice and the blind reader (118:82 *à espera do que dissestes*, 118:116 *segundo o que dissestes*); the plural *os vossos ditos* was refused by the stylist twice at 118:103; the noun *o dito da vossa justiça* (118:123, decided locally as D16 asks) refused by him twice, understood by the blind reader; the Latinist marked the clause\'s past tense minor on his third reading. See the row *elóquium — evidence from 118:81–128* |'),
    ('collapses this formula into *secúndum verbum tuum*, 7 verses away at 118:58 / 65) |',
     'collapses this formula into *secúndum verbum tuum*, 7 verses away at 118:58 / 65). **118:116:** the formula drew no remark from the stylist (his own proposed line keeps it) nor from the blind reader; the Latinist (draft 10, minor) notes that *dissestes* dates an utterance the noun leaves timeless — D16\'s named cost |'),
    ('See the new row *dirígere at the vós imperative*. |',
     'See the new row *dirígere at the vós imperative*. **Ps 118:128 *dirigébar* → *eu era dirigido para todos os vossos mandamentos*: the passive is kept at the Latinist\'s insistence (major on the middle *eu me dirigia*), against the stylist, who twice called it mechanical.** |'),
    ('(open in Ps 90\'s decisions) |',
     '(open in Ps 90\'s decisions); Ps 118:120 *a judíciis enim tuis tímui* → *pois temi os vossos juízos*, *timóre … tímui* → *temor … temi* |'),
]
for old, new in edits:
    if text.count(old) != 1:
        sys.exit(f'row not found exactly once: {old[:70]}')
    text = text.replace(old, new)

path.write_text(text, encoding='utf-8')
print(len(terms), 'term rows,', len(formulas), 'formula rows,', len(edits), 'rows given evidence')
