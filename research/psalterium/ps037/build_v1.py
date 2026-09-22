"""Ps 37 draft 1. python3.13 research/psalterium/ps037/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '37:2': 'Senhor, não me {arguas} no vosso furor, * nem me castigueis na vossa ira.',
    '37:3': 'Porque as vossas setas {infixae} em mim: * e {confirmasti} sobre mim a vossa mão.',
    '37:4': 'Não há {sanitas} na minha carne {afacie1} da vossa ira: * não há paz para os meus ossos {afacie2} dos meus pecados.',
    '37:5': 'Porque as minhas iniquidades {supergressae}: * e como um fardo pesado pesaram sobre mim.',
    '37:6': 'Apodreceram e corromperam-se as minhas {cicatrices}, * {afacie3} da minha insensatez.',
    '37:7': 'Tornei-me miserável, e {curvatus} até o fim: * o dia todo eu andava entristecido.',
    '37:8': 'Porque os meus {lumbi} estão cheios de {illusionibus}: * e não há {sanitas8} na minha carne.',
    '37:9': 'Fui afligido, e fui humilhado {nimis}: * {rugiebam} do meu coração.',
    '37:10': 'Senhor, diante de vós está todo o meu desejo: * e o meu gemido não está escondido de vós.',
    '37:11': 'O meu coração está perturbado, abandonou-me o meu {virtus}: * e a luz dos meus olhos, {ipsum} está comigo.',
    '37:12': '{proximi} * contra mim se aproximaram, e {steterunt}.',
    '37:12b': 'E os que estavam junto de mim {steterunt2}: * e faziam violência os que buscavam a minha alma.',
    '37:13': 'E os que procuravam males contra mim falaram vaidades: * e o dia todo meditavam enganos.',
    '37:14': 'Mas eu, como um surdo, não ouvia: * e como um mudo que não abre a sua boca.',
    '37:15': 'E tornei-me como um homem que não ouve: * e que não tem {redargutiones} na sua boca.',
    '37:16': 'Porque em vós, Senhor, esperei: * vós me escutareis, Senhor, meu Deus.',
    '37:17': 'Porque eu disse: {nequando} se alegrem à minha custa os meus inimigos: * e enquanto os meus pés {commoventur}, falaram grandezas contra mim.',
    '37:18': 'Porque eu estou pronto para os flagelos: * e a minha dor está sempre {conspectu}.',
    '37:19': 'Porque {annuntiabo} a minha iniquidade: * e {cogitabo}.',
    '37:20': 'Mas os meus inimigos vivem, e {confirmati}: * e se multiplicaram os que me odeiam injustamente.',
    '37:21': 'Os que retribuem males por bens {detrahebant}: * porque eu seguia a bondade.',
    '37:22': 'Não me abandoneis, Senhor, meu Deus: * não vos afasteis de mim.',
    '37:23': '{intende} auxílio, * Senhor, Deus da minha salvação.',
}

dec('arguas', ['37:2'], 'Dómine, ne in furóre tuo árguas me, * neque in ira tua corrípias me', 'glossary',
    '37:2 = 6:2 word for word (the first and the third Penitential Psalm open alike), so the verse is copied from Ps 6 draft 3 exactly:'
    ' *Senhor, não me repreendais no vosso furor, * nem me castigueis na vossa ira*. D21 (settled): árguere → *repreender*, corrípere →'
    ' *castigar*. The same verse is sung in the Introit of Wednesday in the second week of Lent (missa Tempora/Quad2-3, grep), so the'
    ' two psalms and the Mass stay one text.',
    o('repreendais', {'arguas': 'repreendais'}, 'Ruling: D21, and identical with 6:2.', 'glossary'),
    o('acuseis', {'arguas': 'acuseis'}, 'The Ps 6 agent\'s verb, overruled by D21 (option 1 in Ps 6 too).', 'draft'))

dec('infixae', ['37:3'], 'sagíttæ tuæ infíxæ sunt mihi', 'glossary',
    'infígere (ἐνεπάγησαν, "were fixed"): the row gives *ficar cravado* (9:16a *as nações ficaram cravadas*) and names 37:3 as a place'
    ' to test it. *ficaram cravadas em mim* keeps the passive state and the image. Matos Soares 1932 *se me cravaram* (reflexive, an'
    ' event). *mihi* (dative) → *em mim*.',
    o('ficaram cravadas', {'infixae': 'ficaram cravadas'}, 'Ruling: the row (9:16a).', 'glossary'),
    o('se cravaram', {'infixae': 'se cravaram'}, 'Matos Soares 1932: the reflexive.', 'MS1932'))

dec('confirmare', ['37:3', '37:20'], 'confirmásti super me manum tuam … confirmáti sunt super me', 'word',
    'The psalm says *confirmáre … super me* twice: God has made his hand firm upon me (37:3, ἐπεστήρισας), and my enemies have been'
    ' made firm over me (37:20, κεκραταίωνται ὑπὲρ ἐμέ). One verb for both keeps the Latin\'s echo — the hand that weighs on me and the'
    ' enemies who stand over me. The confirmáre row is open (*confirmar*; 36:17 *sustentar* with persons as object, because *confirmar os'
    ' justos* was heard as attesting); *confirmastes a vossa mão* would be heard the same way. *firmar* is the row\'s own option and'
    ' keeps the root. In 37:20 *super me* is open in the Latin between "over me" and "beyond me"; Douay-Rheims and Matos Soares 1932'
    ' read the comparison (*stronger than I*, *mais fortes que eu*); *se firmaram sobre mim* keeps both.',
    o('firmastes … se firmaram sobre mim', {'confirmasti': 'firmastes', 'confirmati': 'se firmaram sobre mim'},
      'Ruling: one verb for the Latin\'s one verb; super me left open.', 'draft'),
    o('firmastes … se tornaram mais fortes do que eu', {'confirmasti': 'firmastes', 'confirmati': 'se tornaram mais fortes do que eu'},
      'Douay-Rheims and Matos Soares 1932 in 37:20: the comparison; the echo with 37:3 is lost.', 'MS1932'),
    o('fizestes pesar … se fortaleceram sobre mim', {'confirmasti': 'fizestes pesar', 'confirmati': 'se fortaleceram sobre mim'},
      'Explains the hand; two verbs.', 'draft'))

dec('sanitas', ['37:4', '37:8'], 'Non est sánitas in carne mea (×2)', 'word',
    'sánitas (ἴασις): soundness, health. The clause returns word for word in 37:8, so one wording twice. *saúde* is the Latin\'s word'
    ' plainly (Douay-Rheims *health*); Matos Soares 1932 *parte sã* explains it.',
    o('saúde', {'sanitas': 'saúde', 'sanitas8': 'saúde'}, 'Ruling.', 'DRB'),
    o('parte sã', {'sanitas': 'parte sã', 'sanitas8': 'parte sã'}, 'Matos Soares 1932.', 'MS1932'))

dec('afacie', ['37:4', '37:6'], 'a fácie iræ tuæ … a fácie peccatórum meórum … a fácie insipiéntiæ meæ', 'word',
    'a fácie (ἀπὸ προσώπου), three times in three verses: literally "from the face of", in sense "because of" and "in the presence of".'
    ' The glossary\'s *da face de* (1:4, 16:8b) is for something driven off a face and is not Portuguese here (*não há saúde … da face'
    ' da vossa ira*). *diante de* keeps the face in the idiom (to stand before) and holds both senses — faced with your wrath, in sight of'
    ' my sins (Matos Soares 1932 *à vista dos meus pecados*). *por causa de* is what Douay-Rheims and Matos Soares 1932 say in 37:4a and'
    ' 37:6; it closes the idiom on the cause. One rendering for the three, as the Latin has one phrase. Cost: *diante de vós* also'
    ' renders *ante te* in 37:10.',
    o('diante da … diante dos … diante da', {'afacie1': 'diante', 'afacie2': 'diante', 'afacie3': 'diante'},
      'Ruling: the face kept in the idiom; both senses open.', 'draft'),
    o('por causa da … por causa dos … por causa da', {'afacie1': 'por causa', 'afacie2': 'por causa', 'afacie3': 'por causa'},
      'Douay-Rheims, Matos Soares 1932: the cause.', 'DRB'))

dec('supergressae', ['37:5'], 'iniquitátes meæ supergréssæ sunt caput meum', 'word',
    'supergrédi: to step over, go beyond (ὑπερῆραν, "rose above"). The image is of water or a load rising over the head. *ultrapassaram'
    ' a minha cabeça* keeps the Latin\'s going-over; *passaram por cima de* is heard in Brazil as "ignored / ran over"; Matos Soares 1932'
    ' *se elevaram acima da* is the Greek\'s rising.',
    o('ultrapassaram', {'supergressae': 'ultrapassaram a minha cabeça'}, 'Ruling.', 'draft'),
    o('se elevaram acima da', {'supergressae': 'se elevaram acima da minha cabeça'}, 'Matos Soares 1932; the Greek\'s verb.', 'MS1932'),
    o('passaram por cima da', {'supergressae': 'passaram por cima da minha cabeça'}, 'Douay-Rheims "are gone over".', 'DRB'))

dec('cicatrices', ['37:6'], 'Putruérunt et corrúptæ sunt cicatríces meæ', 'word',
    'cicatrix is a scar, or a wound closing (L&S "a scar"); the Greek μώλωπες are weals, bruises. Scars that rot are the Latin\'s picture —'
    ' the old wounds of sin reopened and festering. *cicatrizes* keeps it; Douay-Rheims *sores* and Matos Soares 1932 *chagas* make them'
    ' open wounds. putréscere → *apodrecer*; corrúmpi → *corromper-se* (the family of corrúptio → corrupção, 15:10), bodily here.',
    o('cicatrizes', {'cicatrices': 'cicatrizes'}, 'Ruling: the Latin\'s word.', 'draft'),
    o('chagas', {'cicatrices': 'chagas'}, 'Matos Soares 1932; Douay-Rheims sores.', 'MS1932'))

dec('curvatus', ['37:7'], 'Miser factus sum, et curvátus sum usque in finem', 'grammar',
    'curvátus sum: the passive perfect, a state reached — *fiquei curvado*. usque in finem → *até o fim*, as 15:11 (the in finem row keeps'
    ' *usque in finem* apart from *in finem*, naming 15:11 and 37:7); Douay-Rheims "even to the end"; Matos Soares 1932 explains'
    ' (*continuamente todo encurvado*). miser factus sum → *Tornei-me miserável* (Matos Soares 1932).',
    o('fiquei curvado', {'curvatus': 'fiquei curvado'}, 'Ruling.', 'draft'),
    o('fui encurvado', {'curvatus': 'fui encurvado'}, 'The passive as event.', 'draft'))

dec('lumbi', ['37:8'], 'lumbi mei', 'word',
    'lumbi (ψύαι): the loins, the seat of strength. The organ is named, as renes → *rins* (row, 7:10, 15:7). *lombos* is the Latin\'s word'
    ' and the Portuguese Bible\'s for loins; it is heard also as a cut of meat or the back. *rins* is renes\'s and would merge them;'
    ' *entranhas* (Matos Soares 1932) is viscera.',
    o('lombos', {'lumbi': 'lombos'}, 'Ruling.', 'DRB'),
    o('entranhas', {'lumbi': 'entranhas'}, 'Matos Soares 1932.', 'MS1932'))

dec('illusionibus', ['37:8'], 'impléti sunt illusiónibus', 'ambiguity',
    'illúsio: classical "mocking" (L&S), and the Greek here is ἐμπαιγμῶν, mockeries; in 78:4 *subsannátio et illúsio* it is mockery.'
    ' But L&S gives the ecclesiastical sense "illusion, deceit" citing this very verse (and Isa 66:4), and both Vulgate-family versions'
    ' read it so (Douay-Rheims *illusions*, Matos Soares 1932 *ilusões*). The Latin word holds both; Portuguese has none that does.'
    ' Ruled *ilusões*: the Latin\'s word and the way the Latin psalter has been prayed; the Greek\'s mockery is the option. Watch the'
    ' readers: *lombos cheios de ilusões* is strange in Portuguese as the Latin is strange.',
    o('ilusões', {'illusionibus': 'ilusões'}, 'Ruling: the cognate (DRB, MS1932, L&S on this verse).', 'MS1932'),
    o('zombarias', {'illusionibus': 'zombarias'}, 'The Greek ἐμπαιγμῶν; illúsio at 78:4.', 'draft'))

dec('nimis', ['37:9'], 'humiliátus sum nimis', 'glossary',
    'nimis (ἕως σφόδρα): the row has no single rendering; 118:138 *sem medida* passed every reader (L&S: "beyond measure"), while'
    ' *sobremaneira* was unknown to a blind reader (118:96, 30:12). *muito* is valde\'s. afflígere → *afligir* (row); humiliáre →'
    ' *humilhar* (row). The two perfect passives kept as events, each with its own *fui*, as the Latin repeats *sum*.',
    o('sem medida', {'nimis': 'sem medida'}, 'Ruling: 118:138.', 'glossary'),
    o('muito', {'nimis': 'muito'}, 'valde\'s word.', 'draft'))

dec('rugiebam', ['37:9'], 'rugiébam a gémitu cordis mei', 'grammar',
    'rugíre (ὠρυόμην): to roar, a lion\'s word — kept, not softened to *gemer* (which is gémitus\'s, the same colon). *a gémitu*: from, by'
    ' reason of the groaning. Douay-Rheims *with the groaning*; Matos Soares 1932 turns it (*o gemido … arranca-me rugidos*). 6:8 *a'
    ' furóre* → *pelo furor* is the nearest build.',
    o('eu rugia com o gemido', {'rugiebam': 'eu rugia com o gemido'}, 'Ruling (DRB).', 'DRB'),
    o('eu rugia pelo gemido', {'rugiebam': 'eu rugia pelo gemido'}, '6:8\'s preposition: the cause.', 'draft'))

dec('virtus', ['37:11'], 'derelíquit me virtus mea', 'glossary',
    'virtus of a man\'s own strength → *vigor*: the virtus row\'s proposal (21:16, 29:8), which names 37:11. *poder* stays God\'s;'
    ' *força* is fortitúdo\'s.',
    o('vigor', {'virtus': 'vigor'}, 'Ruling: the row\'s proposal.', 'glossary'),
    o('força', {'virtus': 'força'}, 'Douay-Rheims strength, Matos Soares 1932.', 'MS1932'))

dec('ipsum', ['37:11'], 'et lumen oculórum meórum, et ipsum non est mecum', 'grammar',
    '*et ipsum non* — "even it is not": the Latin names the light twice (noun, then *ipsum*). *nem ela está comigo* is how Portuguese'
    ' says *et … non* with the pronoun; Douay-Rheims *itself*, Matos Soares 1932 *a própria luz … já não está*.',
    o('nem ela', {'ipsum': 'nem ela'}, 'Ruling.', 'draft'),
    o('também ela não', {'ipsum': 'também ela não'}, 'Closer to *et ipsum*, heavier.', 'draft'))

dec('proximi', ['37:12'], 'Amíci mei, et próximi mei *', 'order',
    'The próximus row: a proparoxytone at a cadence wants a word after it. *Os meus amigos e os meus próximos* ends the first colon on'
    ' *próximos*; the Latin\'s own order, possessive after, puts the stress on *meus*, and the double *meus* answers the Latin\'s *mei …'
    ' mei*. The word order is Portuguese (*amigos meus*), a little marked.',
    o('Os amigos meus e os próximos meus', {'proximi': 'Os amigos meus e os próximos meus'}, 'Ruling: the cadence.', 'draft'),
    o('Os meus amigos e os meus próximos', {'proximi': 'Os meus amigos e os meus próximos'}, 'Plain order; proparoxytone at the mediant.', 'draft'))

dec('steterunt', ['37:12', '37:12b'], 'appropinquavérunt, et stetérunt … de longe stetérunt', 'word',
    'stetérunt twice, one verse apart: they came near against me and stood; those near me stood far off. One verb twice. The stare row'
    ' gives *deter-se* where the standing is a halting (1:1), *estar de pé* for standing in God\'s house. *se detiveram* serves both —'
    ' they stopped facing me, they stopped at a distance. Douay-Rheims *stood*; Matos Soares 1932 *puseram-se* (twice).',
    o('se detiveram … se detiveram de longe', {'steterunt': 'se detiveram', 'steterunt2': 'se detiveram de longe'},
      'Ruling: 1:1\'s verb, once for each stetérunt.', 'glossary'),
    o('pararam … pararam de longe', {'steterunt': 'pararam', 'steterunt2': 'pararam de longe'}, 'Plainer.', 'draft'),
    o('se puseram … se puseram de longe', {'steterunt': 'se puseram', 'steterunt2': 'se puseram de longe'}, 'Matos Soares 1932.', 'MS1932'))

dec('redargutiones', ['37:15'], 'non habens in ore suo redargutiónes', 'word',
    'redargútio (ἐλεγμούς): reproof, refutation — the noun of the verb in 37:2 (árguere, ἐλέγξῃς): the psalmist who asked not to be'
    ' rebuked has no rebuke of his own in his mouth. *repreensões* keeps that echo with *repreendais*. Matos Soares 1932 explains'
    ' (*palavras com que replicar*); *réplicas* is the sense "retorts".',
    o('repreensões', {'redargutiones': 'repreensões'}, 'Ruling: the echo with 37:2.', 'draft'),
    o('réplicas', {'redargutiones': 'réplicas'}, 'Retorts (Matos Soares 1932\'s sense).', 'MS1932'))

dec('nequando', ['37:17'], 'Quia dixi: Nequándo supergáudeant mihi inimíci mei', 'glossary',
    'nequándo (μήποτε) → *para que não* (row, 2:12, 27:1), quoted after *I said*: the prayer of 37:16 goes on — [hear me] lest they'
    ' gloat. supergaudére mihi → *alegrar-se à minha custa* (34:19, 34:24; the super me row names 37:17). Matos Soares 1932 makes it a'
    ' wish (*Nunca triunfem*).',
    o('Para que não', {'nequando': 'Para que não'}, 'Ruling: the row.', 'glossary'),
    o('Que nunca', {'nequando': 'Que nunca'}, 'A wish; *quando* heard in *nunca* (Matos Soares 1932).', 'MS1932'))

dec('commoventur', ['37:17'], 'dum commovéntur pedes mei', 'glossary',
    'commovéri (σαλευθῆναι, be shaken): the movéri row → *ser abalado*; 32:8 *commoveántur* → *sejam abalados*. The present kept (*dum'
    ' commovéntur*). Matos Soares 1932 *os meus pés vacilantes*.',
    o('são abalados', {'commoventur': 'são abalados'}, 'Ruling: the row.', 'glossary'),
    o('vacilam', {'commoventur': 'vacilam'}, 'The row\'s option; Matos Soares 1932.', 'MS1932'))

dec('conspectu', ['37:18'], 'et dolor meus in conspéctu meo semper', 'glossary',
    'in conspéctu + genitive → *à vista de* (the conspéctus row; 15:8 *Eu via o Senhor sempre à minha vista*). *diante de mim* is the'
    ' plainer option (Matos Soares 1932), which would be heard beside 37:4\'s *diante de*.',
    o('à minha vista', {'conspectu': 'à minha vista'}, 'Ruling: the row, as 15:8.', 'glossary'),
    o('diante de mim', {'conspectu': 'diante de mim'}, 'Matos Soares 1932.', 'MS1932'))

dec('annuntiabo', ['37:19'], 'iniquitátem meam annuntiábo', 'word',
    'annuntiáre → *anunciar* (9:12, 18:2, 29:10b). To announce one\'s own iniquity is to declare it (Douay-Rheims *declare*); Matos Soares'
    ' 1932 *confessarei* is confitéri\'s verb for sin (31:5b), which the Latin does not use here.',
    o('anunciarei', {'annuntiabo': 'anunciarei'}, 'Ruling.', 'draft'),
    o('confessarei', {'annuntiabo': 'confessarei'}, 'Matos Soares 1932; confitéri\'s word.', 'MS1932'),
    o('declararei', {'annuntiabo': 'declararei'}, 'Douay-Rheims.', 'DRB'))

dec('cogitabo', ['37:19'], 'et cogitábo pro peccáto meo', 'grammar',
    'cogitáre pro (μεριμνήσω ὑπέρ, "be anxious for"): Douay-Rheims keeps *think for*, Matos Soares 1932 *pensarei (sempre) no meu'
    ' pecado*. cogitáre → *pensar em* (row). *pensarei no meu pecado* is what the Portuguese ear accepts; *pro* ("on account of") is'
    ' heard in the care the verb implies. *me inquietarei pelo* says the Greek and leaves the Latin\'s verb.',
    o('pensarei no', {'cogitabo': 'pensarei no meu pecado'}, 'Ruling: the row\'s regency.', 'MS1932'),
    o('pensarei por causa do', {'cogitabo': 'pensarei por causa do meu pecado'}, '*pro* spelt out.', 'draft'),
    o('me inquietarei pelo', {'cogitabo': 'me inquietarei pelo meu pecado'}, 'The Greek\'s sense.', 'draft'))

dec('detrahebant', ['37:21'], 'detrahébant mihi', 'word',
    'detráhere + dative: to take away from someone\'s name, to disparage (ἐνδιέβαλλόν με, slandered me). *me difamavam* is the exact'
    ' Portuguese (dis-fama, taking away the name); *caluniar* is calumniári\'s (71:4, 118:122); Matos Soares 1932 *murmuravam de mim*.'
    ' The Latin\'s mixed tenses kept (*retríbuunt* present, *detrahébant* imperfect).',
    o('me difamavam', {'detrahebant': 'me difamavam'}, 'Ruling.', 'draft'),
    o('falavam mal de mim', {'detrahebant': 'falavam mal de mim'}, 'Plainer.', 'draft'),
    o('murmuravam de mim', {'detrahebant': 'murmuravam de mim'}, 'Matos Soares 1932.', 'MS1932'))

dec('intende', ['37:23'], 'Inténde in adjutórium meum', 'glossary',
    'inténdere → *atender* (D3). *in adjutórium meum*: "unto my help" — *em meu auxílio*, the Portuguese phrase for coming to someone\'s'
    ' aid, without the article (adjutórium → auxílio, row). This is also the colon of 69:2 *Deus, in adjutórium meum inténde*, which'
    ' opens every Hour — it will want the same words (proposed as an open formula row). The Matins antiphon has *Dómine, virtus salútis'
    ' meæ* (Psalmi matutinum, grep), another Latin; so does the Introit of Wednesday of Lent II (Quad2-3).',
    o('Atendei em meu auxílio', {'intende': 'Atendei em meu'}, 'Ruling: D3, with *em meu auxílio*.', 'glossary'),
    o('Atendei ao meu auxílio', {'intende': 'Atendei ao meu'}, 'The verb\'s own regency; heard as "look after my help".', 'draft'),
    o('Vinde em meu auxílio', {'intende': 'Vinde em meu'}, 'The idiom *vir em auxílio*; not inténdere\'s verb.', 'draft'))

choices = {
    '37:2': '= 6:2 (Ps 6 draft 3), copied exactly: D21. The Introit of Quad2-3 sings it.',
    '37:5': 'onus grave gravátæ → *um fardo pesado pesaram*: the Latin\'s echo (grave / graváre) kept as *pesado / pesaram*. *fardo*, not *carga* (Matos Soares 1932): onus is the burden carried.',
    '37:7': 'tota die → *o dia todo* (D24); contristátus → *entristecido* (34:14); ingrédi of walking → *andar* (row, 14:2, 25:1).',
    '37:10': 'ante te → *diante de vós*; the Latin\'s verbless first colon takes *está*. desidérium → *desejo*; gémitus → *gemido* (row).',
    '37:11': 'conturbáre → *perturbar* (row), the state as 6:3; derelínquere → *abandonar* (row), the verb first as in the Latin.',
    '37:12': 'appropinquáre → *aproximar-se* (row): *próximos … aproximaram* echoes as *próximi … appropinquavérunt* does. advérsum me → *contra mim*, the Latin\'s place (second colon).',
    '37:12b': 'juxta me → *junto de mim*; vim fácere → *fazer violência*; quǽrere ánimam → *buscar a minha alma* (quǽrere and ánima mea rows; 34:4).',
    '37:13': 'inquírere mala mihi → *procurar males contra mim* (34:4b *os que pensam em males contra mim*); loqui vanitátes → *falar vaidades* (vánitas row); meditári + accusative → *meditar* (2:1); dolus → *engano* (row).',
    '37:14': '*non apériens*, a participle → *que não abre* (present, as the participle).',
    '37:15': 'factus sum sicut → *tornei-me como*; the two participles as relative clauses. 37:14 and 37:15 both end on *boca* (checks: rhyme flag): the Latin\'s own echo, *os suum … in ore suo*, kept.',
    '37:16': 'D36 *esperar em*; D3 *escutar*; *Senhor, meu Deus* (formula row). *tu exáudies*: the pronoun kept as *vós*.',
    '37:17': 'magna loqui super me → *falar grandezas contra mim* (34:26b; hostile super me → *contra mim*, row).',
    '37:18': 'parátus → *pronto* (row); flagéllum → *flagelo* (row); semper → *sempre*.',
    '37:20': 'iníque → *injustamente* (34:19); odísse in present sense → *odeiam* (24:19); multiplicári → *multiplicar-se*.',
    '37:21': 'retribúere mala pro bonis → *retribuir males por bens* (34:12 *Retribuíam-me males por bens*); bónitas → *bondade* (row).',
    '37:22': 'derelínquere → *abandonar*; *ne discésseris a me* = 21:11 *não vos afasteis de mim*, copied.',
    '37:23': 'Deus salútis meæ → *Deus da minha salvação* (17:47; D6).',
}

audit = [
    {'step': 'source', 'note': 'Latin = DO Psalm37.txt, 23 prayed verses (37:2–37:23 with 37:12b; no 37:1, the titulus, D7). No flex. Uses by grep (ps032/uses.py): the fourth of the Seven Penitential Psalms (Appendix/Septem psalmi paenitentiales); 37:2 the Introit verse and 37:22–23 the Introit of Wednesday in Lent II (missa Tempora/Quad2-3: *Ne derelínquas me … inténde in adjutórium meum, Dómine, virtus salútis meæ* — another Latin at the end); 37:12 a versicle of Passion Sunday (Tempora/Quad5-0); the Matins antiphon *Inténde in adjutórium meum, * Dómine, virtus salútis meæ* (Psalmi matutinum). Not a psalm of the day hours, so no Diurnal Monástico in the parallels. **The Hetzenauer print read is skipped and owed** (handoff).'},
    {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps037.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Counts with ps005/grep_latin.py: sánitas, lumbi, curváre, rugíre, cicatrix, redargútio only here; supergaudére 3 lines, illúsio 2 (78:4 beside subsannátio), usque in finem 2 (15:11). Copied: 37:2 = 6:2 (D21); 37:22b = 21:11b; 37:16 *Senhor, meu Deus*; 37:17 *à minha custa* (34:19, 24); 37:21 *males por bens* (34:12); 37:23 *Deus da minha salvação* (17:47). Glossary applied: D3, D6, D21, D24 (o dia todo), D36 (esperar em), infígere, confirmáre, in finem (usque), ingrédi, affligere, humiliáre, nimis, virtus (vigor), conturbáre, derelínquere, próximus, appropinquáre, stare, quǽrere, vánitas, dolus, meditári, movéri, super me, parátus, flagéllum, conspéctus, cogitáre, iníque, retribúere, bónitas, discédere, inténdere, adjutórium. Latin (= Greek) readings kept against the Hebrew: 37:5 *pesaram sobre mim*, 37:6 *cicatrizes … insensatez*, 37:8 *ilusões*, 37:9 *rugia*, 37:12 *se detiveram*, 37:18 *flagelos*, 37:19 *pensarei*, 37:21 *porque eu seguia a bondade*. Tests for the readers: \'diante da vossa ira\', \'ultrapassaram a minha cabeça\', \'cicatrizes\', \'lombos cheios de ilusões\', \'rugia com o gemido\', \'Os amigos meus e os próximos meus\', \'se detiveram de longe\', \'repreensões\', \'Para que não\', \'me difamavam\', \'Atendei em meu auxílio\'.'},
    {'step': 'checks', 'note': 'Draft 1: hard pass. Length flags accepted: 37:12b first +5 (*se detiveram de longe*, the repeated verb), 37:9 first +4 (*sem medida*, each *fui* kept as the Latin repeats *sum*), 37:17 first +4 / second +3 (the longest verse of the Latin too), 37:6, 37:11, 37:12b second, 37:20 second +3; 37:8 first, 37:16 second, 37:22 first, 37:23 first −3. Rhyme 37:14 / 37:15 (*boca*): the Latin\'s *os suum … in ore suo*. Oxytone cadences where the Latin\'s last word is *me* or *mecum* (37:3, 37:5, 37:17, 37:20, 37:22).'},
]

prayed = {'psalm': 37, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft', 'verses': verses,
          'decisions': decisions, 'choices': choices, 'audit': audit}
(folder / 'prayed.json').write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', len(verses), 'verses,', len(decisions), 'decisions')
