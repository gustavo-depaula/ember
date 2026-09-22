"""Build ps044/prayed.json draft 1. Run: python3.13 research/psalterium/ps044/build_v1.py
The address decision fills whole verses (tu / vós); every other decision's slot sits inside them. A slot whose
wording depends on the address has a `_v` twin, filled by the same option."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent

# verses addressed to the king: (tu, vós)
king = {
    '44:3': ('És {spec3}, † {diffusa} nos teus lábios: * por isso Deus te bendisse para sempre.',
             'Sois {spec3}, † {diffusa} nos vossos lábios: * por isso Deus vos bendisse para sempre.'),
    '44:4': ('Cinge-te com a tua espada sobre a tua {femur}, * {potent}.',
             'Cingi-vos com a vossa espada sobre a vossa {femur}, * {potent}.'),
    '44:5a': ('Com a tua {species}: * {intende}, {prospere}, e reina.',
              'Com a vossa {species_v}: * {intende_v}, {prospere_v}, e reinai.'),
    '44:5b': ('Por causa da verdade, e da mansidão, e da justiça: * e a tua direita te guiará maravilhosamente.',
              'Por causa da verdade, e da mansidão, e da justiça: * e a vossa direita vos guiará maravilhosamente.'),
    '44:6': ('As tuas setas {sag}, os povos cairão debaixo de ti: * {incorda} dos inimigos do Rei.',
             'As vossas setas {sag}, os povos cairão debaixo de vós: * {incorda} dos inimigos do Rei.'),
    '44:7': ('O teu trono, ó Deus, é pelos séculos dos séculos: * {virga}.',
             'O vosso trono, ó Deus, é pelos séculos dos séculos: * {virga_v}.'),
    '44:8': ('Amaste a justiça, e odiaste a iniquidade: * por isso {unxit} com óleo de alegria, {prae} companheiros.',
             'Amastes a justiça, e odiastes a iniquidade: * por isso {unxit_v} com óleo de alegria, {prae_v} companheiros.'),
    '44:9': ('Mirra, e {gutta}, e cássia, das tuas vestes, das casas de marfim: * das quais te deleitaram as filhas dos reis {honor}.',
             'Mirra, e {gutta}, e cássia, das vossas vestes, das casas de marfim: * das quais vos deleitaram as filhas dos reis {honor_v}.'),
    '44:10b': ('A rainha {astitit} à tua direita {vestitu}: * {var10}.',
               'A rainha {astitit} à vossa direita {vestitu}: * {var10}.'),
    '44:15b': ('Serão levadas ao Rei as virgens após ela: * {proximae} te serão trazidas.',
               'Serão levadas ao Rei as virgens após ela: * {proximae} vos serão trazidas.'),
    '44:17': ('Em lugar dos teus pais te nasceram filhos: * tu os {constit} príncipes sobre toda a terra.',
              'Em lugar dos vossos pais vos nasceram filhos: * vós os {constit_v} príncipes sobre toda a terra.'),
    '44:18a': ('Hão de lembrar-se do teu nome: * {gener}.',
               'Hão de lembrar-se do vosso nome: * {gener}.'),
    '44:18b': ('Por isso os povos {confit} para sempre: * e pelos séculos dos séculos.',
               'Por isso os povos {confit_v} para sempre: * e pelos séculos dos séculos.'),
}

slot = lambda vid: 'A' + vid.split(':')[1]

verses = {
    '44:2a': 'O meu coração {eruct} uma boa palavra: * eu digo as minhas obras ao Rei.',
    '44:2b': 'A minha língua é {calamus} de um escriba: * que escreve depressa.',
    '44:3': '{A3}', '44:4': '{A4}', '44:5a': '{A5a}', '44:5b': '{A5b}', '44:6': '{A6}', '44:7': '{A7}',
    '44:8': '{A8}', '44:9': '{A9}', '44:10b': '{A10b}',
    '44:11': 'Ouve, filha, e vê, e inclina o teu ouvido: * e esquece o teu povo e a casa do teu pai.',
    '44:12': 'E o Rei {concup}: * porque ele é o Senhor, o teu Deus, e o adorarão.',
    '44:13': 'E as filhas de Tiro com {munera} * suplicarão o teu rosto: todos os ricos do povo.',
    '44:14': 'Toda a glória da filha do Rei {abintus}, * em franjas de ouro, {var14}.',
    '44:15b': '{A15b}',
    '44:16': 'Serão trazidas com alegria e exultação: * serão levadas ao templo do Rei.',
    '44:17': '{A17}', '44:18a': '{A18a}', '44:18b': '{A18b}',
}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = [
    {
        'id': 'address', 'refs': list(king), 'latin': 'tu, te, tibi, tuus (the king, 44:3–10b, 15b, 17–18b)', 'kind': 'grammar',
        'why': ('D17 left open how the psalmist speaks to the Messiah-king of Ps 44. Ruled *tu*, as rule 3 gives a single human addressee: the psalm is a wedding song '
                'addressed first to the bridegroom (3–10b, 15b, 17–18b) and then to the bride (11–14), and the bride is *tu* beyond question; one poet speaking to '
                'the two partners of one wedding cannot say *vós* to one and *tu* to the other without the Portuguese inventing a rank the Latin does not mark. '
                'MS1932 says *tu* to both. The hard place is 44:7–8, where the king is called *Deus* (Heb 1:8–9 reads it of the Son): *O teu trono, ó Deus* is '
                'the price. It is the psalmist\'s voice, not the praying voice turned to God (D1), so D1 does not reach it; but a Christian reader will feel the '
                '*tu* there, and the whole *vós* text is written as option 2 so that it can be taken in one touch. In the liturgical uses the antiphons are '
                'often turned to Christ or the saint (*Mémores erunt nóminis tui, Dómine*, C1) — those will be adapted where they are used, not here.'),
        'options': [
            opt('tu (the king)', {slot(v): t for v, (t, _) in king.items()}, 'Ruling: rule 3; the bride is *tu*, and one song keeps one address. MS1932.', 'draft'),
            opt('vós (the king)', {slot(v): w for v, (_, w) in king.items()},
                'The king addressed as God is (D1\'s pronoun), from 44:3 to 44:18b; the bride stays *tu*. *Cingi-vos* (44:4) carries an enclitic, so D13 allows it.', 'draft'),
        ],
    },
    {
        'id': 'eructavit', 'refs': ['44:2a'], 'latin': 'Eructávit cor meum verbum bonum', 'kind': 'glossary',
        'why': ('The eructáre row (open) proposes *fazer jorrar* and names this verse: the gush is kept, the belch not (L&S "to belch forth; utter"; ἐξηρεύξατο). '
                'It stands in 18:3 and 118:171 already. The antiphon *Eructávit cor meum verbum bonum* (C11, C6a, the Introit of several virgins — grep) '
                'is sayable alone in this form.'),
        'options': [
            opt('fez jorrar', {'eruct': 'fez jorrar'}, 'Ruling: the row; 18:3, 118:171.', 'glossary'),
            opt('proferiu', {'eruct': 'proferiu'}, 'DRB "uttered"; loses the image.', 'DRB'),
            opt('transbordou em', {'eruct': 'transbordou em'}, 'The overflow, intransitive; changes the build.', 'draft'),
        ],
    },
    {
        'id': 'calamus', 'refs': ['44:2b'], 'latin': 'cálamus scribæ', 'kind': 'word',
        'why': ('*cálamus* is the reed pen. *pena* is the plain word for a writing pen; *cálamo* keeps the reed and is a literary word most will not know. '
                '*de um escriba* for the bare genitive: *é a pena do escriba* would point to one scribe the Latin does not name.'),
        'options': [
            opt('a pena', {'calamus': 'a pena'}, 'Ruling: the plain word; MS1932 *pena*.', 'draft'),
            opt('o cálamo', {'calamus': 'o cálamo'}, 'The Latin\'s word; bookish.', 'draft'),
        ],
    },
    {
        'id': 'speciosus', 'refs': ['44:3'], 'latin': 'Speciósus forma præ fíliis hóminum', 'kind': 'grammar',
        'why': ('The Latin has no verb: an adjective with its ablative of respect and *præ*, "beautiful in form beyond the sons of men" (DRB "above"). '
                'A copula is supplied (D2) and the comparison made with *mais … que*, which Portuguese needs for *præ*. *speciósus* → *formoso* so that '
                '*spécie* (44:5a) → *formosura* echoes it, as the Latin does; *forma* → *de aspecto*. *o mais formoso dos filhos dos homens* makes him one of '
                'them, where *præ* sets him beside them. The antiphon (*Speciósus forma * præ fíliis hóminum*, the Matins of Christmas and the Transfiguration '
                '— 01-01, 08-06, grep) is said from here.'),
        'options': [
            opt('mais formoso de aspecto que', {'spec3': 'mais formoso de aspecto que os filhos dos homens'}, 'Ruling.', 'draft'),
            opt('o mais formoso dos', {'spec3': 'o mais formoso dos filhos dos homens'}, 'The phrase Brazilian ears know; *forma* dropped and *præ* turned into a superlative.', 'draft'),
            opt('formoso de aspecto acima dos', {'spec3': 'formoso de aspecto acima dos filhos dos homens'}, 'DRB "above"; *acima* may be heard in space.', 'DRB'),
        ],
    },
    {
        'id': 'diffusa', 'refs': ['44:3'], 'latin': 'diffúsa est grátia in lábiis tuis', 'kind': 'word',
        'why': ('*diffúndere* occurs only here (grep); the Greek ἐξεχύθη is the verb behind *effúndere* → *derramar* (41:5), so by D15\'s test they may share it. '
                'The verb first, as the Latin, so the antiphon *Diffúsa est grátia in lábiis tuis* reads *Derramou-se a graça nos teus lábios* on its own.'),
        'options': [
            opt('derramou-se a graça', {'diffusa': 'derramou-se a graça'}, 'Ruling; MS1932 *derramou-se*.', 'MS1932'),
            opt('difundiu-se a graça', {'diffusa': 'difundiu-se a graça'}, 'The cognate; heard as "spread (news)".', 'draft'),
            opt('a graça se derramou', {'diffusa': 'a graça se derramou'}, 'Subject first; the mediant then falls on an oxytone.', 'draft'),
        ],
    },
    {
        'id': 'femur', 'refs': ['44:4'], 'latin': 'super femur tuum', 'kind': 'word',
        'why': ('*femur* is the thigh, where the sword hangs (μηρός). The concrete image stays (rule 5). MS1932 *ao teu lado* explains it.'),
        'options': [
            opt('coxa', {'femur': 'coxa'}, 'Ruling: the Latin\'s body part.', 'draft'),
            opt('cintura', {'femur': 'cintura'}, 'Where a sword is worn; another part of the body.', 'draft'),
        ],
    },
    {
        'id': 'potentissime', 'refs': ['44:4'], 'latin': 'potentíssime', 'kind': 'word',
        'why': ('A vocative superlative. *ó poderosíssimo* keeps it, and ends on a proparoxytone, as *potentíssime* does (rule 4 bends to the Latin\'s own cadence). '
                '*ó muito poderoso* is the paroxytone alternative; *potens* → *poderoso* (23:8).'),
        'options': [
            opt('ó poderosíssimo', {'potent': 'ó poderosíssimo'}, 'Ruling; MS1932.', 'MS1932'),
            opt('ó muito poderoso', {'potent': 'ó muito poderoso'}, 'Paroxytone final; the superlative in two words.', 'draft'),
        ],
    },
    {
        'id': 'species', 'refs': ['44:5a'], 'latin': 'Spécie tua et pulchritúdine tua', 'kind': 'word',
        'why': ('Three words of beauty in this psalm: *speciósus / spécies* (3, 5a), *pulchritúdo* (5a), *decor* (12). The decor row keeps *esplendor* for *decor* '
                'and *beleza* for *pulchritúdo*; *spécies* takes *formosura*, the noun of 44:3\'s *formoso*, as the Latin\'s *speciósus … spécie* echo. '
                'The ablative → *Com* (DRB "With"). The versicle and antiphon *Spécie tua et pulchritúdine tua* (Common of Virgins, C6 and after — grep) reads '
                '*Com a tua formosura e a tua beleza*.'),
        'options': [
            opt('formosura … beleza', {'species': 'formosura e a tua beleza', 'species_v': 'formosura e a vossa beleza'}, 'Ruling.', 'draft'),
            opt('beleza … formosura', {'species': 'beleza e a tua formosura', 'species_v': 'beleza e a vossa formosura'}, 'The two words swapped; loses the echo with 44:3.', 'draft'),
        ],
    },
    {
        'id': 'intende', 'refs': ['44:5a'], 'latin': 'inténde', 'kind': 'ambiguity',
        'why': ('*inténde* stands absolute. The Latin verb is "stretch, aim, direct" — a bow, a course, the mind (L&S: *arcum intendere*, *iter intendere*, *animum '
                'intendere*; absolute "to turn one\'s attention, exert oneself"). The Greek ἔντεινον is "bend (the bow)"; DRB takes the course, "set out"; MS1932 '
                '*caminha*. The Latin does not say which. The glossary\'s *atender* (D3) is the verb\'s attending sense, and is the one that keeps the Latin\'s word '
                'and its openness to "be intent"; the bow and the setting-out would each supply what the Latin leaves unsaid. Ruled *atende*, knowing that the ear '
                'will hear "pay heed" first — the readers are asked to test it.'),
        'options': [
            opt('atende', {'intende': 'atende', 'intende_v': 'atendei'}, 'Ruling: the glossary verb (D3); the Latin\'s absolute kept.', 'glossary'),
            opt('estende o arco', {'intende': 'estende o arco', 'intende_v': 'estendei o arco'}, 'The Greek\'s sense (ἔντεινον); supplies the bow.', 'draft'),
            opt('põe-te a caminho', {'intende': 'põe-te a caminho', 'intende_v': 'ponde-vos a caminho'}, 'DRB "set out" (*iter intendere*); supplies the road.', 'DRB'),
        ],
    },
    {
        'id': 'prospere', 'refs': ['44:5a'], 'latin': 'próspere procéde', 'kind': 'word',
        'why': ('*próspere* is an adverb; Portuguese *prosperamente* is heavy and rare. *com prosperidade* keeps the root (117:25 *prosperáre* → *prosperar*). '
                '*procédere* → *avançar* (MS1932).'),
        'options': [
            opt('avança com prosperidade', {'prospere': 'avança com prosperidade', 'prospere_v': 'avançai com prosperidade'}, 'Ruling.', 'draft'),
            opt('avança com êxito', {'prospere': 'avança com êxito', 'prospere_v': 'avançai com êxito'}, 'Plainer; loses the root.', 'draft'),
            opt('avança vitoriosamente', {'prospere': 'avança vitoriosamente', 'prospere_v': 'avançai vitoriosamente'}, 'MS1932; says victory, which *próspere* does not.', 'MS1932'),
        ],
    },
    {
        'id': 'sagittae', 'refs': ['44:6'], 'latin': 'Sagíttæ tuæ acútæ', 'kind': 'grammar',
        'why': ('The Latin has no verb, and the colon is loosely built: *in corda inimicórum Regis* at the end may go with the arrows or with the falling. '
                'A copula is supplied (DRB "are sharp"; D2), and *nos corações* left where the Latin leaves it, unattached. The verbless line is the option.'),
        'options': [
            opt('são agudas', {'sag': 'são agudas'}, 'Ruling: copula supplied (D2).', 'draft'),
            opt('agudas', {'sag': 'agudas'}, 'Verbless, as the Latin.', 'draft'),
        ],
    },
    {
        'id': 'incorda', 'refs': ['44:6'], 'latin': 'in corda inimicórum Regis', 'kind': 'grammar',
        'why': ('*in* with the accusative is motion into. *corda* is plural (the Greek has the singular καρδίᾳ; the Latin is followed). *nos corações* keeps the '
                'preposition light and the phrase unattached, as the Latin. MS1932 supplies a verb (*traspassarão*).'),
        'options': [
            opt('nos corações', {'incorda': 'nos corações'}, 'Ruling.', 'draft'),
            opt('para dentro dos corações', {'incorda': 'para dentro dos corações'}, 'The motion spelt out; heavier.', 'draft'),
            opt('no coração', {'incorda': 'no coração'}, 'MS1932 singular (the Greek\'s number, not the Latin\'s).', 'MS1932'),
        ],
    },
    {
        'id': 'virga', 'refs': ['44:7'], 'latin': 'virga directiónis virga regni tui', 'kind': 'order',
        'why': ('*virga* → *vara* (row, which names 44:7; *cetro* interprets); *diréctio* → *retidão* (row). The Latin sets the predicate first; Portuguese '
                'order puts the subject first and ends on the oxytone *retidão*; both keep *vara … vara*.'),
        'options': [
            opt('a vara do teu reino é vara de retidão', {'virga': 'a vara do teu reino é vara de retidão', 'virga_v': 'a vara do vosso reino é vara de retidão'},
                'Ruling: natural order (D2); DRB and MS1932 order.', 'draft'),
            opt('vara de retidão é a vara do teu reino', {'virga': 'vara de retidão é a vara do teu reino', 'virga_v': 'vara de retidão é a vara do vosso reino'},
                'The Latin\'s order.', 'draft'),
            opt('o cetro do teu reino é cetro de retidão', {'virga': 'o cetro do teu reino é cetro de retidão', 'virga_v': 'o cetro do vosso reino é cetro de retidão'},
                'MS1932, DRB "sceptre"; the row keeps *vara* for 2:9, 22:4, 88:33.', 'MS1932'),
        ],
    },
    {
        'id': 'unxit', 'refs': ['44:8'], 'latin': 'unxit te Deus, Deus tuus', 'kind': 'ambiguity',
        'why': ('*Deus, Deus tuus* can be subject with apposition ("God, thy God, anointed thee", DRB) or vocative + subject ("O God, thy God anointed thee", '
                'MS1932\'s note: *ó Deus, o Messias*, as 44:7\'s vocative). The Latin order *unxit te Deus, Deus tuus* is kept, which reads as apposition but '
                'does not close the other reading as *ó Deus* would.'),
        'options': [
            opt('te ungiu Deus, o teu Deus,', {'unxit': 'te ungiu Deus, o teu Deus,', 'unxit_v': 'vos ungiu Deus, o vosso Deus,'}, 'Ruling: the Latin\'s order.', 'draft'),
            opt('Deus, o teu Deus, te ungiu', {'unxit': 'Deus, o teu Deus, te ungiu', 'unxit_v': 'Deus, o vosso Deus, vos ungiu'}, 'Subject first; apposition only.', 'draft'),
            opt('o teu Deus te ungiu, ó Deus,', {'unxit': 'o teu Deus te ungiu, ó Deus,', 'unxit_v': 'o vosso Deus vos ungiu, ó Deus,'}, 'MS1932: the vocative reading closed in.', 'MS1932'),
        ],
    },
    {
        'id': 'prae', 'refs': ['44:8'], 'latin': 'præ consórtibus tuis', 'kind': 'word',
        'why': ('*præ* as in 44:3 → *mais que*, with *a* so that the companions are heard as those anointed less, not as those who anoint. *consórtes* '
                '(μέτοχοι, sharers) → *companheiros* (DRB "fellows", MS1932). *consortes* is a spouse in Portuguese.'),
        'options': [
            opt('mais que aos teus', {'prae': 'mais que aos teus', 'prae_v': 'mais que aos vossos'}, 'Ruling: *præ* as in 44:3.', 'draft'),
            opt('acima dos teus', {'prae': 'acima dos teus', 'prae_v': 'acima dos vossos'}, 'DRB "above"; spatial.', 'DRB'),
            opt('de preferência aos teus', {'prae': 'de preferência aos teus', 'prae_v': 'de preferência aos vossos'}, 'MS1932; says choice.', 'MS1932'),
        ],
    },
    {
        'id': 'gutta', 'refs': ['44:9'], 'latin': 'Myrrha, et gutta, et cásia', 'kind': 'word',
        'why': ('*gutta* is "drop"; behind it στακτή, the resin that drips from myrrh (DRB "stacte"). The Latin names the drop, not the resin, and the drop is '
                'a concrete thing (rule 5). *gota* may be heard as the disease (gout) — the readers are asked. *aloés* (MS1932) is the Hebrew\'s word.'),
        'options': [
            opt('gota', {'gutta': 'gota'}, 'Ruling: the Latin\'s word.', 'draft'),
            opt('estacte', {'gutta': 'estacte'}, 'DRB, the Greek\'s resin; unknown to most.', 'DRB'),
            opt('aloés', {'gutta': 'aloés'}, 'MS1932, from the Hebrew; refused by rule 1.', 'MS1932'),
        ],
    },
    {
        'id': 'honor', 'refs': ['44:9'], 'latin': 'in honóre tuo', 'kind': 'word',
        'why': ('*honor* → *honra* (row). *na tua honra* keeps the Latin\'s openness (in thy dignity / in thy honouring; ἐν τῇ τιμῇ σου); *em tua honra* would '
                'settle it as "in tribute to thee". DRB "in thy glory" interprets.'),
        'options': [
            opt('na tua honra', {'honor': 'na tua honra', 'honor_v': 'na vossa honra'}, 'Ruling.', 'draft'),
            opt('em tua honra', {'honor': 'em tua honra', 'honor_v': 'em vossa honra'}, 'The idiom "in tribute to"; settles the sense.', 'draft'),
        ],
    },
    {
        'id': 'astitit', 'refs': ['44:10b'], 'latin': 'Ástitit regína a dextris tuis', 'kind': 'glossary',
        'why': ('The astáre row (open) splits: with *a dextris* → *pôr-se à direita de*, and names this verse. Perfect kept (παρέστη). MS1932 *está* makes a '
                'present of it. The versicle *Astitit regína* (Marian feasts, C11 — grep) reads *A rainha pôs-se à tua direita*.'),
        'options': [
            opt('pôs-se', {'astitit': 'pôs-se'}, 'Ruling: the row\'s split.', 'glossary'),
            opt('está', {'astitit': 'está'}, 'MS1932; a present.', 'MS1932'),
            opt('ergueu-se', {'astitit': 'ergueu-se'}, 'The row\'s absolute verb (2:2).', 'glossary'),
        ],
    },
    {
        'id': 'vestitu', 'refs': ['44:10b'], 'latin': 'in vestítu deauráto', 'kind': 'word',
        'why': ('*vestítus* is a third word for clothing, beside *vestiménta* (44:9 → *vestes*); *vestido* keeps it apart and suits a queen. *deaurátus* is gilded, '
                'kept apart from *áureus* (44:14 → *de ouro*).'),
        'options': [
            opt('em vestido dourado', {'vestitu': 'em vestido dourado'}, 'Ruling.', 'draft'),
            opt('em veste dourada', {'vestitu': 'em veste dourada'}, 'Merges with *vestis* (21:18).', 'draft'),
            opt('com manto de ouro', {'vestitu': 'com manto de ouro'}, 'MS1932; a mantle and gold, neither in the Latin.', 'MS1932'),
        ],
    },
    {
        'id': 'varietas', 'refs': ['44:10b', '44:14'], 'latin': 'circúmdata varietáte … circumamícta varietátibus', 'kind': 'word',
        'why': ('*várietas* is many-colouredness (πεποικιλμένη, "embroidered / variegated", in both verses). The Latin names only the variety; *cores* or *bordados* '
                'would say what varies. The singular in both verses: *variedades* is heard as a variety show. *circúmdare* → *cercar* (row); *circumamícta* '
                '(clothed around) → *revestida*.'),
        'options': [
            opt('de variedade', {'var10': 'cercada de variedade', 'var14': 'revestida de variedade'}, 'Ruling: the Latin\'s noun; the plural of 44:14 lost (D29-like).', 'draft'),
            opt('de cores variadas', {'var10': 'cercada de cores variadas', 'var14': 'revestida de cores variadas'}, 'Plain; supplies colour.', 'draft'),
            opt('de bordados', {'var10': 'cercada de bordados', 'var14': 'revestida de bordados'}, 'The Hebrew\'s and the Greek\'s craft; supplies it.', 'draft'),
        ],
    },
    {
        'id': 'concupiscet', 'refs': ['44:12'], 'latin': 'Et concupíscet Rex decórem tuum', 'kind': 'glossary',
        'why': ('*concupíscere* → *ansiar por* (row, open; 118:20, 40, 174); *decor* → *esplendor* (row, open, names 44:12). Both rows kept, so that '
                '*pulchritúdo* (44:5a *beleza*) and *decor* stay two words. MS1932 *cobiçará a tua beleza*.'),
        'options': [
            opt('ansiará pelo teu esplendor', {'concup': 'ansiará pelo teu esplendor'}, 'Ruling: both rows.', 'glossary'),
            opt('desejará o teu esplendor', {'concup': 'desejará o teu esplendor'}, '*desejar* is *desideráre*\'s (41:2).', 'draft'),
            opt('cobiçará a tua beleza', {'concup': 'cobiçará a tua beleza'}, 'MS1932; *cobiçar* failed the stylist in 118:20; *beleza* merges with *pulchritúdo*.', 'MS1932'),
        ],
    },
    {
        'id': 'munera', 'refs': ['44:13'], 'latin': 'in munéribus', 'kind': 'glossary',
        'why': ('*múnera* → *dádivas* (row, open). It ends the first colon on a proparoxytone, as *munéribus* does.'),
        'options': [
            opt('dádivas', {'munera': 'dádivas'}, 'Ruling: the row; MS1932.', 'glossary'),
            opt('presentes', {'munera': 'presentes'}, 'The row\'s option; paroxytone at the mediant.', 'glossary'),
        ],
    },
    {
        'id': 'abintus', 'refs': ['44:14'], 'latin': 'Omnis glória ejus fíliæ Regis ab intus', 'kind': 'word',
        'why': ('*ab intus* (ἔσωθεν) is "from within / within". *é de dentro* keeps the *ab* and supplies only a copula; *está no interior* (MS1932, DRB "within") '
                'loses it; *vem de dentro* adds motion. The pleonastic *ejus* ("her glory, of the king\'s daughter", the Greek\'s αὐτῆς) is grammar and is absorbed.'),
        'options': [
            opt('é de dentro', {'abintus': 'é de dentro'}, 'Ruling.', 'draft'),
            opt('está no interior', {'abintus': 'está no interior'}, 'MS1932; DRB "is within".', 'MS1932'),
            opt('vem de dentro', {'abintus': 'vem de dentro'}, 'Supplies motion.', 'draft'),
        ],
    },
    {
        'id': 'proximae', 'refs': ['44:15b'], 'latin': 'próximæ ejus', 'kind': 'word',
        'why': ('*próximæ* (αἱ πλησίον) are "those near her"; the root is *próximus* → *próximo* (row). *companheiras* (MS1932) would merge with *consórtes* '
                '(44:8, μέτοχοι), a different word in both languages (D15\'s test). *as que lhe são próximas* keeps the root.'),
        'options': [
            opt('as que lhe são próximas', {'proximae': 'as que lhe são próximas'}, 'Ruling.', 'draft'),
            opt('as suas companheiras', {'proximae': 'as suas companheiras'}, 'MS1932; merges with 44:8 *companheiros*.', 'MS1932'),
            opt('as suas vizinhas', {'proximae': 'as suas vizinhas'}, 'DRB "neighbours".', 'DRB'),
        ],
    },
    {
        'id': 'constitues', 'refs': ['44:17'], 'latin': 'constítues eos príncipes', 'kind': 'glossary',
        'why': ('*constitúere* → *estabelecer* (row; 2:6, 8:6). The subject named (*tu os*) so that the pronoun does not open the colon; the antiphon of Apostles '
                '(*Constítues eos príncipes super omnem terram*, C1, and the Gradual of Sts Peter and Paul — grep) is said from this colon. *constituir* is the '
                'row\'s noted idiom and the option.'),
        'options': [
            opt('estabelecerás', {'constit': 'estabelecerás', 'constit_v': 'estabelecereis'}, 'Ruling: the row.', 'glossary'),
            opt('constituirás', {'constit': 'constituirás', 'constit_v': 'constituireis'}, 'The row\'s option (MS1932 at 2:6).', 'glossary'),
        ],
    },
    {
        'id': 'generatio', 'refs': ['44:18a'], 'latin': 'in omni generatióne et generatiónem', 'kind': 'glossary',
        'why': ('The formula row *In generatiónem et generatiónem → De geração em geração* lists 44:18a. Here the Latin adds *omni*, which the formula absorbs '
                '(*de geração em geração* already means every one); MS1932 has the same words. 144:13a has the same Latin and should copy this.'),
        'options': [
            opt('de geração em geração', {'gener': 'de geração em geração'}, 'Ruling: the formula row; MS1932.', 'glossary'),
            opt('em todas as gerações', {'gener': 'em todas as gerações'}, 'Keeps *omni*, loses the doubling.', 'draft'),
        ],
    },
    {
        'id': 'confitebuntur', 'refs': ['44:18b'], 'latin': 'pópuli confitebúntur tibi', 'kind': 'glossary',
        'why': ('*confitéri* to God → *dar graças a* (D5). Here it is said to the king whom 44:7 calls *Deus*; the Latin uses its one verb, and so does this. '
                'DRB "praise", MS1932 *louvarão*; *louvar* is *laudáre*\'s (D5).'),
        'options': [
            opt('te darão graças', {'confit': 'te darão graças', 'confit_v': 'vos darão graças'}, 'Ruling: D5.', 'glossary'),
            opt('te louvarão', {'confit': 'te louvarão', 'confit_v': 'vos louvarão'}, 'MS1932, DRB; *laudáre*\'s verb.', 'MS1932'),
        ],
    },
]

choices = {
    '44:2a': '*dico ego* → *eu digo* (the pronoun is the Latin\'s). *Regi* capitalised as DO has it; *Rei* throughout (6, 12, 14, 15b, 16). *verbum bonum* → *uma boa palavra* (verbum → palavra, D15).',
    '44:2b': 'velóciter → *depressa* (row). The colon break falls before the participle, as the Latin\'s.',
    '44:5b': 'The Latin\'s *et … et … et* kept. *dedúcere* → *guiar* (D22); *déxtera* → *a direita* (row, open). *mirabíliter* → *maravilhosamente* (*mirábilis* → *maravilhoso*, the admirábilis row).',
    '44:7': '*sedes* → *trono* (row, which names 44:7). Vocative *Deus* → *ó Deus*, as 41:2. *in sǽculum sǽculi* → *pelos séculos dos séculos* (D27); the copula supplied. The vocative here is the reason the address decision is the psalm\'s weightiest.',
    '44:8': 'dilígere → *amar*; odísse → *odiar* (rows). *óleum lætítiæ* → *óleo de alegria* (lætítia → alegria). *úngere* → *ungir*.',
    '44:9': 'Verbless, as the Latin: the spices *from* the garments and *from* the ivory houses. *ex quibus* → *das quais*, open between the houses and the spices as the Latin is. *delectáre* → *deleitar* (36:4). The inline (10a) is not reproduced.',
    '44:11': 'The daughter is *tu* (rule 3). *Audi* → *Ouve* (audíre → ouvir; the *tu* imperative has no homograph). *inclina o teu ouvido* is what the inclína row foresaw for 44:11. oblivísci → *esquecer* with a direct object (row).',
    '44:12': '*ipse est Dóminus Deus tuus* → *ele é o Senhor, o teu Deus* (the article before the possessive). *adorábunt eum* → *e o adorarão*, subject left open as the Latin.',
    '44:13': 'deprecári → *suplicar*, with the face as object as in 118:58 (*Supliquei a vossa face*; the row names 44:13). vultus → *rosto*. plebs → *povo* (row). The Latin\'s loose apposition *omnes dívites plebis* kept at the end.',
    '44:14': '*fímbriæ* → *franjas*; *áureus* → *de ouro*.',
    '44:15b': '*addúcere* → *levar* (row, Ps 42), *afférre* → *trazer* (row, 28:1–2): two verbs kept apart, here and in 44:16. *post eam* → *após ela*. The antiphon *Adducéntur Regi vírgines post eam* reads *Serão levadas ao Rei as virgens após ela*.',
    '44:16': 'The two verbs of 44:15b return in the other order, as the Latin. *in lætítia et exsultatióne* → *com alegria e exultação* (rows). *in templum* → *ao templo* (motion).',
    '44:17': '*nati sunt* → *te nasceram*, the Latin\'s perfect (MS1932\'s future is the Hebrew\'s). *Pro pátribus tuis* → *Em lugar dos teus pais*.',
    '44:18a': '*Mémores erunt* → *Hão de lembrar-se de* (memor esse → lembrar-se de); the periphrasis avoids *lembrar-se-ão*. The subject left open as in the Latin.',
    '44:18b': '*in ætérnum: et in sǽculum sǽculi* → *para sempre: e pelos séculos dos séculos* (the row for 9:6).',
}

prayed = {
    'psalm': 44, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft',
    'verses': verses, 'decisions': decisions, 'choices': choices,
    'audit': [
        {'step': 'source', 'note': ('Latin = DO Psalm44.txt, 20 prayed verses (44:2a–44:18b, with 2b, 5b, 10b, 15b, 18b; no 44:1, the titulus, D7). '
                                    'Two inline markers (10a), (15a) inside 44:9 and 44:14, not reproduced. One flex (†) in 44:3. Not in the Diurnal Monástico '
                                    'parallels. Uses (ps032/uses.py): Christmas and Transfiguration Matins antiphon *Speciósus forma* (01-01, 08-06); '
                                    'the Common of Virgins (C6, C6a) — *Spécie tua*, *Diffúsa est grátia*, *Dilexísti justítiam*, *Adducéntur Regi vírgines*, '
                                    '*Audi fília*; Marian feasts (C11) *Astitit regína*, *Eructávit*; the Annunciation and Assumption Masses (missa 03-25, 08-15) '
                                    '*Audi fília*, *Vultum tuum*; the Common of Apostles (C1) and the Gradual of 06-29 *Constítues eos príncipes … Mémores erunt*.')},
        {'step': 'draft', 'note': ('Psalm-level draft from consult/parallels/ps044.md (Latin, LXX, WLC, DRB, MS1932). DO\'s Portuguese not used (D12). '
                                   'Rulings applied: D5 (44:18b), D15 (verbum), D22 (dedúcere), D27 (44:7, 44:18b), D35 (deprecári); open rows followed: '
                                   'eructáre, astáre (split), decor, concupíscere, múnera, virga, sedes, afférre, addúcere, inclína aurem. '
                                   'Address: *tu* to the king and to the bride (rule 3; D17 left Ps 44 to this psalm), with the whole *vós* text as option 2. '
                                   'Hard readings: 44:5a *inténde*, 44:8 *Deus, Deus tuus*, 44:9 *gutta*, 44:14 *ab intus*, *várietas*.')},
        {'step': 'checks', 'note': ('Draft 1: hard pass. Length: 44:18a second colon −8 (*de geração em geração*, the formula row, absorbs *omni* and the Latin\'s '
                                    'long endings), 44:9 first −5 (Portuguese nouns shorter than the Latin\'s ablatives), 44:2a and 44:2b first +4 (*fez jorrar*; '
                                    '*é a pena de um escriba* supplies copula and article), 44:6 first +4 (the supplied copula), 44:3, 44:5a, 44:5b, 44:7, 44:15b, 44:17 '
                                    '+3, 44:3, 44:11, 44:12, 44:18b −3: all accepted. Proparoxytone cadences where the Latin has them too: 44:4 *poderosíssimo* '
                                    '(*potentíssime*), 44:13 mediant *dádivas* (*munéribus*), 44:7 mediant and 44:18b final *séculos* (D27). No rhyme flags.')},
        {'step': 'readers', 'note': 'codex.py not called (Codex out of credits since Ps 37; AGENT-BRIEF step 5). Latinist, stylist and ambiguity readers for draft 1 handed to the coordinator.'},
    ],
}

(here / 'prayed.json').write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote prayed.json')
