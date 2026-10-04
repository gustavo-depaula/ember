#!/usr/bin/env python3
"""Author standalone hymn, sequence and canticle practices from Divinum Officium.

The text of each practice is copied out of `content/do/` (MIT) rather than
retyped, so Latin, English and Portuguese stay line-for-line what the Breviary
and Missal already print. The descriptions and names live in SPEC below.

    python3 scripts/import-do-hymns.py --find "dies irae"   # locate an incipit
    python3 scripts/import-do-hymns.py                      # (re)write every practice in SPEC
"""
import json, pathlib, re, sys, unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
DO = ROOT / 'content/do/web/www'
OUT = ROOT / 'content/practices'
LANGS = {'la': 'Latin', 'en-US': 'English', 'pt-BR': 'Portugues'}
# DO's Portuguese Office is not fit to print on its own: lines drop out ("Vos imploro, ó da
# morte" for *Gere curam mei finis*) and doxologies belong to other hymns. Its Portuguese
# Missal is a real hand missal's translation, so only Mass texts take pt-BR from DO.
PORTUGUESE_TREES = {'missa'}


def fold(s):
    """Accent- and ligature-insensitive key: DO prints `Víctimæ pascháli`."""
    s = s.replace('æ', 'ae').replace('Æ', 'Ae').replace('œ', 'oe').replace('Œ', 'Oe')
    s = s.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def sections(path):
    """A DO file as {header: [lines]}, first definition of a header winning."""
    out, name = {}, None
    for line in path.read_text(encoding='utf-8').splitlines():
        m = re.match(r'^\[([^\]]+)\]\s*(\(.*\))?\s*$', line)
        if m:
            name = m.group(1) if not m.group(2) else None
            if name in out:
                name = None
            elif name:
                out[name] = []
        elif name:
            out[name].append(line.rstrip())
    return out


def find(query):
    pat = re.compile(fold(query).lower())
    for sub in ('horas', 'missa'):
        for f in sorted((DO / sub / 'Latin').rglob('*.txt')):
            for name, lines in sections(f).items():
                for i, line in enumerate(lines):
                    if pat.search(fold(line).lower()):
                        print(f'{sub} | {f.relative_to(DO / sub / "Latin")} | [{name}] line {i}: {line[:70]}')
                        break


def latin(s):
    """DO's `æ`/`j` spelling → the `ae`/`i` spelling the corpus prayers use; accents stay."""
    for a, b in (('ǽ', 'aé'), ('Ǽ', 'Aé'), ('æ', 'ae'), ('Æ', 'Ae'), ('œ', 'oe'), ('Œ', 'Oe'), ('j', 'i'), ('J', 'I')):
        s = s.replace(a, b)
    return s


def clean(line):
    line = re.sub(r'\{:[^}]*:\}', '', line)
    line = re.sub(r'^[vV]\. ', '', line)
    line = re.sub(r'^\* ', '', line)
    return line.replace('’', "'").strip()


def stanzas(lines):
    """Hymn lines → list of stanzas (each a list of lines). `_` separates stanzas."""
    out, cur = [], []
    for raw in lines:
        if raw.startswith('_'):
            if cur:
                out.append(cur)
            cur = []
            continue
        if not raw.strip():
            continue
        if raw[0] in '!(':
            continue
        if raw[0] in '@&$#':
            raise ValueError(f'unhandled DO directive: {raw}')
        cur.append(clean(raw))
    if cur:
        out.append(cur)
    return out


def hymn(tree, rel, header, loose=()):
    """{lang: text} for one hymn section. A translation is kept only if it has the Latin's
    stanza count, unless listed in `loose` (a metrical version in another stanza form)."""
    out, report = {}, {}
    for code, folder in LANGS.items():
        if code == 'pt-BR' and tree not in PORTUGUESE_TREES:
            continue
        path = DO / tree / folder / rel
        secs = sections(path) if path.exists() else {}
        if header not in secs:
            report[code] = 'missing'
            continue
        try:
            st = stanzas(secs[header])
        except ValueError as e:
            report[code] = str(e)
            continue
        report[code] = len(st)
        text = '\n\n'.join('\n'.join(s) for s in st)
        out[code] = latin(text) if code == 'la' else text
    n = report.get('la')
    for code in list(out):
        if report[code] != n and code not in loose:
            del out[code]
    return out, report



# Slips in DO's own files, mended so the standalone text is clean.
TYPOS = {
    'la': (('dulces claves,', 'dulces clavos,'),),
    'en-US': (('fruit of sorow', 'fruit of sorrow'),),
}


def tidy(text, code):
    """Drop the marks DO prints for the celebrant: the sign-of-the-cross `+` and the chant asterisk."""
    text = re.sub(r'(?i)\b(b[eé]ne|sanct[ií]) \+ (?=d[ií]c|f[ií]c)', r'\1', text)
    text = re.sub(r' \+\+? ', ' ', text)
    for wrong, right in TYPOS.get(code, ()):
        text = text.replace(wrong, right)
    if code == 'pt-BR':
        text = re.sub(r'\bAmen\b', 'Amém', text)
    text = re.sub(r'\s*\*\s*', ' ', text).replace('’', "'")
    text = re.sub(r'[ \t]+', ' ', text).strip()
    return latin(text) if code == 'la' else text


TAGS = {'V.': 'V', 'V,': 'V', 'v.': 'V', 'R.': 'R', 'Ant.': 'A'}
MARK = re.compile(r'^(V[.,]|v\.|R\.|Ant\.)\s*(.*)$')


def units(lines):
    """A rite section as (tag, text) units: V versicle, R response, A antiphon, H hymn
    stanza or prose paragraph, `_` a break. Rubric lines (`!`) are dropped."""
    def plain(x):
        x = x.strip()
        return bool(x) and x[0] not in '!_#@&$' and not MARK.match(x)

    out, k = [], 0
    while k < len(lines):
        line = lines[k].strip()
        k += 1
        if not line or line[0] == '_':
            if out and out[-1][0] != '_':
                out.append(('_', ''))
            continue
        if line[0] in '!#':
            continue
        if line[0] in '@&$':
            out.append(('X', line))
            continue
        m = MARK.match(line)
        # a lower-case `v.` opens a stanza when verse lines follow it, a versicle otherwise
        if m and not (m.group(1) == 'v.' and k < len(lines) and plain(lines[k])):
            out.append((TAGS[m.group(1)], m.group(2)))
            continue
        stanza = [m.group(2) if m else line]
        while k < len(lines) and plain(lines[k]):
            stanza.append(lines[k].strip())
            k += 1
        out.append(('H', '\n'.join(stanza)))
    return out


def piece(tree, rel, header, starts, stop, extra=0):
    """Flow sections for the run of units that opens at `starts[lang]` and closes `extra`
    units after the Latin unit matching `stop`. A translation is kept only when its
    units carry the same tags, in the same order, as the Latin. A versicle with no
    response after it, or a long one (the Exsultet's paragraphs), is set as prose."""
    def run(code):
        us = [u for u in units(sections(DO / tree / LANGS[code] / rel)[header])]
        a = next(i for i, (_, t) in enumerate(us) if re.search(starts[code], fold(t), re.I))
        return us[a:]

    la = run('la')
    real = [i for i, (tag, _) in enumerate(la) if tag != '_']
    end = next(i for i in real if re.search(stop, fold(la[i][1]), re.I))
    end = real[real.index(end) + extra]
    la = la[:end + 1]
    if any(tag == 'X' for tag, _ in la):
        raise ValueError(f'unexpanded DO macro inside {header}')
    shape = [tag for tag, _ in la if tag != '_']
    texts, report = {'la': [t for tag, t in la if tag != '_']}, {'la': len(shape)}
    for code in starts:
        if code == 'la':
            continue
        other = [u for u in run(code) if u[0] != '_'][:len(shape)]
        if [tag for tag, _ in other] == shape:
            texts[code] = [t for _, t in other]
            report[code] = len(other)
        else:
            report[code] = 'shape differs: ' + ''.join(tag for tag, _ in other)

    def loc(n):
        return {code: tidy(ts[n], code) for code, ts in texts.items()}

    out, verses, n = [], [], 0

    def flush():
        if verses:
            out.append({'type': 'response', 'verses': verses[:]})
            verses.clear()

    for pos, (tag, text) in enumerate(la):
        if tag == '_':
            flush()
            continue
        nxt = la[pos + 1][0] if pos + 1 < len(la) else '_'
        if tag == 'A':
            flush()
            out.append({'type': 'antiphon', 'text': loc(n)})
        elif tag == 'H' or (tag == 'V' and (len(text) > 300 or nxt != 'R')):
            flush()
            out.append({'type': 'prayer', 'inline': loc(n)})
        elif tag == 'V':
            verses.append({'v': loc(n)})
        elif verses and 'v' in verses[-1] and 'r' not in verses[-1]:
            verses[-1]['r'] = loc(n)
        else:
            verses.append({'r': loc(n)})
        n += 1
    flush()
    return out, report


S = 'Psalterium/Special/'
BREVIARY = {
    'en-US': '*Breviarium Romanum*, via [Divinum Officium](https://www.divinumofficium.com)',
    'pt-BR': '*Breviarium Romanum*, via [Divinum Officium](https://www.divinumofficium.com)',
}
MISSAL = {
    'en-US': '*Missale Romanum*, via [Divinum Officium](https://www.divinumofficium.com)',
    'pt-BR': '*Missale Romanum*, via [Divinum Officium](https://www.divinumofficium.com)',
}

# id, name, source (tree, file, section), icon, categories, tags, description (en, pt), history (en, pt)
HYMNS = [
    ('dies-irae', 'Dies irae', ('horas', 'Commune/C9.txt', 'Sequentia'), 'candle', ['purgatory', 'liturgical'], ['hymn', 'sequence', 'dead', 'requiem'],
     ('*Day of wrath, that day* — the sequence of the Requiem Mass: the Last Judgment seen by a sinner who throws himself on the mercy of the Judge.',
      '*Dia de ira, aquele dia* — a sequência da Missa de Réquiem: o Juízo Final visto por um pecador que se lança à misericórdia do Juiz.'),
     ('A thirteenth-century Franciscan poem, traditionally attributed to Thomas of Celano. It is sung in the Mass for the Dead of the 1962 Missal.',
      'Poema franciscano do século XIII, tradicionalmente atribuído a Tomás de Celano. Canta-se na Missa dos Defuntos do Missal de 1962.')),
    ('victimae-paschali', 'Victimae paschali laudes', ('missa', 'Tempora/Pasc0-0.txt', 'Sequentia'), 'sunrise', ['resurrection', 'seasonal', 'liturgical'], ['hymn', 'sequence', 'easter'],
     ('*To the Paschal Victim let Christians offer praise* — the sequence of Easter, in which Mary Magdalene is asked what she saw on the way.',
      '*À Vítima pascal ofereçam os cristãos o seu louvor* — a sequência da Páscoa, na qual se pergunta a Maria Madalena o que ela viu no caminho.'),
     ('An eleventh-century sequence, usually attributed to Wipo of Burgundy. It is sung at Mass on Easter Sunday and through the Octave.',
      'Sequência do século XI, geralmente atribuída a Wipo da Borgonha. Canta-se na Missa do Domingo de Páscoa e durante a Oitava.')),
    ('creator-alme-siderum', 'Creator alme siderum', ('horas', S + 'Major Special.txt', 'Hymnus Adv Vespera'), 'candle', ['seasonal', 'liturgical'], ['hymn', 'advent', 'vespers'],
     ('*Kind Creator of the stars* — the Vespers hymn of Advent, calling on the Redeemer who came once in mercy and will come again as Judge.',
      '*Ó benigno Criador dos astros* — o hino de Vésperas do Advento, que invoca o Redentor que veio uma vez em misericórdia e voltará como Juiz.'),
     ('The seventh-century hymn *Conditor alme siderum*, in the form given to it in the 1632 revision of the Roman Breviary under Urban VIII.',
      'O hino *Conditor alme siderum*, do século VII, na forma que recebeu na revisão do Breviário Romano de 1632, sob Urbano VIII.')),
    ('en-clara-vox', 'En clara vox redarguit', ('horas', S + 'Major Special.txt', 'Hymnus Adv Laudes'), 'sunrise', ['seasonal', 'liturgical'], ['hymn', 'advent', 'lauds'],
     ('*Hark, a clear voice rebukes the dark* — the Lauds hymn of Advent: the herald\'s cry that wakes the soul from sleep.',
      '*Eis que uma voz clara repreende as trevas* — o hino de Laudes do Advento: o brado do arauto que desperta a alma do sono.'),
     ('The ancient hymn *Vox clara ecce intonat*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Vox clara ecce intonat*, na revisão feita para o Breviário Romano em 1632.')),
    ('iesu-redemptor-omnium', 'Iesu, Redemptor omnium', ('horas', 'Sancti/12-25.txt', 'Hymnus Vespera'), 'candle', ['seasonal', 'liturgical'], ['hymn', 'christmas', 'vespers'],
     ('*Jesus, Redeemer of all* — the Vespers hymn of Christmas, sung to the Son begotten of the Father before the light.',
      '*Jesus, Redentor de todos* — o hino de Vésperas do Natal, cantado ao Filho gerado pelo Pai antes da luz.'),
     ('The ancient hymn *Christe, Redemptor omnium*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Christe, Redemptor omnium*, na revisão feita para o Breviário Romano em 1632.')),
    ('a-solis-ortus-cardine', 'A solis ortus cardine', ('horas', 'Sancti/12-25.txt', 'Hymnus Laudes'), 'sunrise', ['seasonal', 'liturgical'], ['hymn', 'christmas', 'lauds'],
     ('*From the rising of the sun* — the Lauds hymn of Christmas: the Maker of the world takes a servant\'s body and lies in a manger.',
      '*Desde onde o sol nasce* — o hino de Laudes do Natal: o Criador do mundo assume um corpo de servo e repousa numa manjedoura.'),
     ('The opening stanzas of the alphabetical hymn on the life of Christ by the fifth-century poet Sedulius.',
      'As primeiras estrofes do hino alfabético sobre a vida de Cristo, do poeta Sedúlio, do século V.')),
    ('crudelis-herodes', 'Crudelis Herodes', ('horas', 'Sancti/01-06.txt', 'Hymnus Vespera'), 'candle', ['seasonal', 'liturgical'], ['hymn', 'epiphany', 'vespers'],
     ('*Cruel Herod, why do you fear?* — the Vespers hymn of the Epiphany: the Magi, the Baptism in the Jordan, and the water made wine at Cana.',
      '*Cruel Herodes, por que temes?* — o hino de Vésperas da Epifania: os Magos, o Batismo no Jordão e a água feita vinho em Caná.'),
     ('Taken from the same alphabetical hymn of Sedulius (fifth century) as *A solis ortus cardine*, where it begins *Hostis Herodes impie*.',
      'Tirado do mesmo hino alfabético de Sedúlio (século V) que *A solis ortus cardine*, onde começa *Hostis Herodes impie*.')),
    ('salvete-flores-martyrum', 'Salvete, flores Martyrum', ('horas', 'Sancti/12-28.txt', 'Hymnus Laudes'), 'flower', ['saints', 'liturgical'], ['hymn', 'christmas', 'martyrs', 'holy-innocents'],
     ('*Hail, flowers of the Martyrs* — the hymn of the Holy Innocents, cut down on the threshold of life like rosebuds by a storm.',
      '*Salve, flores dos Mártires* — o hino dos Santos Inocentes, ceifados no limiar da vida como botões de rosa pela tempestade.'),
     ('From the *Cathemerinon* of Prudentius (fourth–fifth century), the hymn for the Epiphany.',
      'Do *Cathemerinon* de Prudêncio (séculos IV–V), o hino para a Epifania.')),
    ('audi-benigne-conditor', 'Audi, benigne Conditor', ('horas', S + 'Major Special.txt', 'Hymnus Quad Vespera'), 'candle', ['penance', 'seasonal', 'liturgical'], ['hymn', 'lent', 'vespers'],
     ('*Hear, kind Creator, our prayers* — the Vespers hymn of Lent, poured out with tears in the forty days\' fast.',
      '*Ouvi, benigno Criador, as nossas preces* — o hino de Vésperas da Quaresma, derramado com lágrimas no jejum dos quarenta dias.'),
     ('Traditionally attributed to St. Gregory the Great (d. 604).',
      'Tradicionalmente atribuído a São Gregório Magno (†604).')),
    ('o-sol-salutis', 'O sol salutis', ('horas', S + 'Major Special.txt', 'Hymnus Quad Laudes'), 'sunrise', ['penance', 'seasonal', 'liturgical'], ['hymn', 'lent', 'lauds'],
     ('*O Sun of salvation, Jesus* — the Lauds hymn of Lent, asking that the light return to the soul as the day returns to the earth.',
      '*Ó Sol da salvação, Jesus* — o hino de Laudes da Quaresma, pedindo que a luz volte à alma como o dia volta à terra.'),
     ('The ancient hymn *Iam Christe sol iustitiae*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Iam Christe sol iustitiae*, na revisão feita para o Breviário Romano em 1632.')),
    ('ad-regias-agni-dapes', 'Ad regias Agni dapes', ('horas', S + 'Major Special.txt', 'Hymnus Pasch Vespera'), 'eucharist', ['resurrection', 'seasonal', 'liturgical'], ['hymn', 'easter', 'vespers'],
     ('*At the Lamb\'s royal banquet* — the Vespers hymn of Eastertide: robed in white after crossing the Red Sea, we sing to Christ our Pasch.',
      '*Ao régio banquete do Cordeiro* — o hino de Vésperas do Tempo Pascal: vestidos de branco depois de atravessar o Mar Vermelho, cantamos a Cristo, nossa Páscoa.'),
     ('The ancient hymn *Ad cenam Agni providi*, sung by the newly baptized, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Ad cenam Agni providi*, cantado pelos recém-batizados, na revisão feita para o Breviário Romano em 1632.')),
    ('aurora-caelum-purpurat', 'Aurora caelum purpurat', ('horas', S + 'Major Special.txt', 'Hymnus Pasch Laudes'), 'sunrise', ['resurrection', 'seasonal', 'liturgical'], ['hymn', 'easter', 'lauds'],
     ('*Dawn purples the sky* — the Lauds hymn of Eastertide: heaven resounds, the world exults, and hell groans as the King leads the fathers out into light.',
      '*A aurora tinge de púrpura o céu* — o hino de Laudes do Tempo Pascal: o céu ressoa, o mundo exulta e o inferno geme, enquanto o Rei conduz os pais para a luz.'),
     ('The ancient hymn *Aurora lucis rutilat*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Aurora lucis rutilat*, na revisão feita para o Breviário Romano em 1632.')),
    ('salutis-humanae-sator', 'Salutis humanae Sator', ('horas', 'Tempora/Pasc5-4.txt', 'Hymnus Vespera'), 'sun', ['seasonal', 'liturgical'], ['hymn', 'ascension', 'vespers'],
     ('*Author of man\'s salvation* — the Vespers hymn of the Ascension, to Jesus the delight of hearts, who bore our death and now sits at the Father\'s right hand.',
      '*Autor da salvação humana* — o hino de Vésperas da Ascensão, a Jesus, delícia dos corações, que sofreu a nossa morte e agora está sentado à direita do Pai.'),
     ('The ancient hymn *Iesu, nostra redemptio*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Iesu, nostra redemptio*, na revisão feita para o Breviário Romano em 1632.')),
    ('aeterne-rex-altissime', 'Aeterne Rex altissime', ('horas', 'Tempora/Pasc5-4.txt', 'Hymnus Matutinum'), 'sun', ['seasonal', 'liturgical'], ['hymn', 'ascension', 'matins'],
     ('*Eternal King most high* — the Matins hymn of the Ascension: the Redeemer rises above the stars, and heaven, earth and hell bend the knee.',
      '*Ó Rei eterno e altíssimo* — o hino de Matinas da Ascensão: o Redentor sobe acima dos astros, e o céu, a terra e o inferno dobram o joelho.'),
     ('An ancient hymn of the Ascension, in the 1632 revision of the Roman Breviary.',
      'Antigo hino da Ascensão, na revisão do Breviário Romano de 1632.')),
    ('beata-nobis-gaudia', 'Beata nobis gaudia', ('horas', 'Tempora/Pasc7-0.txt', 'Hymnus Laudes'), 'flame', ['holy-spirit', 'seasonal', 'liturgical'], ['hymn', 'pentecost', 'holy-spirit', 'lauds'],
     ('*The circling year brings back our blessed joys* — the Lauds hymn of Pentecost, when the Spirit came down on the disciples in tongues of fire.',
      '*O ciclo do ano nos traz de volta as santas alegrias* — o hino de Laudes de Pentecostes, quando o Espírito desceu sobre os discípulos em línguas de fogo.'),
     ('An ancient hymn, sometimes attributed to St. Hilary of Poitiers.',
      'Hino antigo, por vezes atribuído a Santo Hilário de Poitiers.')),
    ('iam-sol-recedit-igneus', 'Iam sol recedit igneus', ('horas', 'Tempora/Pent01-0.txt', 'Hymnus Vespera'), 'trinity', ['trinity', 'liturgical'], ['hymn', 'trinity', 'vespers', 'evening'],
     ('*Now the fiery sun departs* — the evening hymn to the Trinity: as the day\'s light fails, pour Your unfailing light into our hearts.',
      '*Já o sol ardente se retira* — o hino vespertino à Trindade: quando a luz do dia declina, infundi nos corações a vossa luz que não se apaga.'),
     ('The hymn *O lux beata Trinitas*, attributed to St. Ambrose, as revised for the Roman Breviary in 1632. It is sung at Vespers of Trinity Sunday and of Saturdays.',
      'O hino *O lux beata Trinitas*, atribuído a Santo Ambrósio, na revisão feita para o Breviário Romano em 1632. Canta-se nas Vésperas do Domingo da Santíssima Trindade e dos sábados.')),
    ('lucis-creator-optime', 'Lucis Creator optime', ('horas', S + 'Major Special.txt', 'Hymnus Day0 Vespera'), 'moon', ['daily', 'liturgical'], ['hymn', 'sunday', 'vespers', 'evening'],
     ('*O blest Creator of the light* — the hymn of Sunday Vespers, on the first day of creation when God made the light.',
      '*Ó excelso Criador da luz* — o hino das Vésperas de domingo, sobre o primeiro dia da criação, quando Deus fez a luz.'),
     ('Traditionally attributed to St. Gregory the Great (d. 604). It opens the week\'s cycle of Vespers hymns on the six days of creation.',
      'Tradicionalmente atribuído a São Gregório Magno (†604). Abre o ciclo semanal dos hinos de Vésperas sobre os seis dias da criação.')),
    ('aeterne-rerum-conditor', 'Aeterne rerum Conditor', ('horas', S + 'Major Special.txt', 'Hymnus Day0 Laudes hiemalis'), 'sunrise', ['daily', 'liturgical'], ['hymn', 'sunday', 'lauds', 'morning', 'ambrose'],
     ('*Eternal Maker of all things* — the hymn at cockcrow: the herald of day wakes the sleeper, and at his voice Peter wept away his sin.',
      '*Eterno Criador de todas as coisas* — o hino do cantar do galo: o arauto do dia desperta quem dorme, e à sua voz Pedro chorou o seu pecado.'),
     ('By St. Ambrose of Milan (d. 397), one of the few hymns certainly his: St. Augustine quotes it. It is the hymn of Sunday Lauds in winter.',
      'De Santo Ambrósio de Milão (†397), um dos poucos hinos certamente seus: Santo Agostinho o cita. É o hino das Laudes de domingo no inverno.')),
    ('splendor-paternae-gloriae', 'Splendor paternae gloriae', ('horas', S + 'Major Special.txt', 'Hymnus Day1 Laudes'), 'sunrise', ['daily', 'liturgical'], ['hymn', 'lauds', 'morning', 'ambrose'],
     ('*O splendor of the Father\'s glory* — a morning hymn to Christ, light from light and true Sun, asking for a sober, chaste and faithful day.',
      '*Ó esplendor da glória do Pai* — hino matutino a Cristo, luz da luz e verdadeiro Sol, pedindo um dia sóbrio, casto e fiel.'),
     ('By St. Ambrose of Milan (d. 397). It is the hymn of Monday Lauds.',
      'De Santo Ambrósio de Milão (†397). É o hino das Laudes de segunda-feira.')),
    ('iam-lucis-orto-sidere', 'Iam lucis orto sidere', ('horas', S + 'Prima Special.txt', 'Hymnus Prima'), 'sunrise', ['daily', 'liturgical'], ['hymn', 'prime', 'morning'],
     ('*Now that the daystar has risen* — the hymn of Prime: a prayer at the start of work to be kept from harm in word, sight and deed.',
      '*Já nascido o astro da luz* — o hino de Prima: uma oração ao começar o trabalho, para ser guardado do mal nas palavras, no olhar e nas obras.'),
     ('An ancient hymn of unknown authorship, sung every day at Prime in the Roman Breviary.',
      'Hino antigo, de autor desconhecido, cantado todos os dias na hora de Prima do Breviário Romano.')),
    ('nunc-sancte-nobis-spiritus', 'Nunc, Sancte, nobis, Spiritus', ('horas', S + 'Minor Special.txt', 'Hymnus Tertia'), 'flame', ['daily', 'holy-spirit', 'liturgical'], ['hymn', 'terce', 'holy-spirit'],
     ('*Come now, Holy Spirit* — the hymn of Terce, the third hour, when the Spirit came down upon the Apostles.',
      '*Vinde agora, Espírito Santo* — o hino de Terça, a hora terceira, quando o Espírito desceu sobre os Apóstolos.'),
     ('Traditionally attributed to St. Ambrose. Sung every day at Terce in the Roman Breviary.',
      'Tradicionalmente atribuído a Santo Ambrósio. Cantado todos os dias na hora de Terça do Breviário Romano.')),
    ('rector-potens-verax-deus', 'Rector potens, verax Deus', ('horas', S + 'Minor Special.txt', 'Hymnus Sexta'), 'sun', ['daily', 'liturgical'], ['hymn', 'sext', 'midday'],
     ('*Mighty Ruler, truthful God* — the hymn of Sext, at the heat of noon: quench the flames of strife and give peace of heart.',
      '*Ó Senhor poderoso, Deus da verdade* — o hino de Sexta, no calor do meio-dia: apagai as chamas das discórdias e dai a paz do coração.'),
     ('Traditionally attributed to St. Ambrose. Sung every day at Sext in the Roman Breviary.',
      'Tradicionalmente atribuído a Santo Ambrósio. Cantado todos os dias na hora de Sexta do Breviário Romano.')),
    ('rerum-deus-tenax-vigor', 'Rerum, Deus, tenax vigor', ('horas', S + 'Minor Special.txt', 'Hymnus Nona'), 'sun', ['daily', 'liturgical'], ['hymn', 'none', 'afternoon'],
     ('*O God, the strength that holds all things* — the hymn of None, as the day declines: grant light at evening and a holy death.',
      '*Ó Deus, força que sustenta todas as coisas* — o hino de Noa, quando o dia declina: concedei luz ao entardecer e uma santa morte.'),
     ('Traditionally attributed to St. Ambrose. Sung every day at None in the Roman Breviary.',
      'Tradicionalmente atribuído a Santo Ambrósio. Cantado todos os dias na hora de Noa do Breviário Romano.')),
    ('ut-queant-laxis', 'Ut queant laxis', ('horas', 'Sancti/06-24.txt', 'Hymnus Vespera'), 'prayer', ['saints', 'liturgical'], ['hymn', 'saints', 'john-the-baptist', 'vespers'],
     ('*That your servants may sing with loosened voices* — the Vespers hymn of the Nativity of St. John the Baptist.',
      '*Para que os teus servos possam cantar a plena voz* — o hino de Vésperas da Natividade de São João Batista.'),
     ('Attributed to Paul the Deacon (eighth century). Guido of Arezzo named the notes of the scale — *ut, re, mi, fa, sol, la* — from the first syllables of its opening half-lines.',
      'Atribuído a Paulo Diácono (século VIII). Guido d\'Arezzo deu nome às notas da escala — *ut, ré, mi, fá, sol, lá* — a partir das primeiras sílabas dos seus hemistíquios iniciais.')),
    ('decora-lux-aeternitatis', 'Decora lux aeternitatis', ('horas', 'Sancti/06-29.txt', 'Hymnus Vespera'), 'prayer', ['saints', 'liturgical'], ['hymn', 'saints', 'peter-and-paul', 'apostles', 'vespers'],
     ('*The fair light of eternity* — the Vespers hymn of Sts. Peter and Paul, and of Rome made glorious by the blood of the two princes of the Apostles.',
      '*A formosa luz da eternidade* — o hino de Vésperas de São Pedro e São Paulo, e de Roma, glorificada pelo sangue dos dois príncipes dos Apóstolos.'),
     ('The ancient hymn *Aurea luce et decore roseo*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Aurea luce et decore roseo*, na revisão feita para o Breviário Romano em 1632.')),
    ('quicumque-christum-quaeritis', 'Quicumque Christum quaeritis', ('horas', 'Sancti/08-06.txt', 'Hymnus Vespera'), 'sun', ['seasonal', 'liturgical'], ['hymn', 'transfiguration', 'vespers'],
     ('*All you who seek Christ, lift up your eyes* — the Vespers hymn of the Transfiguration.',
      '*Vós todos que buscais a Cristo, erguei os olhos* — o hino de Vésperas da Transfiguração.'),
     ('From the *Cathemerinon* of Prudentius (fourth–fifth century), the hymn for the Epiphany.',
      'Do *Cathemerinon* de Prudêncio (séculos IV–V), o hino para a Epifania.')),
    ('custodes-hominum', 'Custodes hominum', ('horas', 'Sancti/10-02.txt', 'Hymnus Vespera'), 'angel', ['angels', 'saints', 'liturgical'], ['hymn', 'angels', 'guardian-angel', 'vespers'],
     ('*We sing the Angels, guardians of men* — the Vespers hymn of the Holy Guardian Angels, given by the Father as companions to our frail nature.',
      '*Cantamos os Anjos, guardiães dos homens* — o hino de Vésperas dos Santos Anjos da Guarda, dados pelo Pai como companheiros à nossa frágil natureza.'),
     ('A hymn of the Counter-Reformation period, commonly attributed to St. Robert Bellarmine (d. 1621).',
      'Hino do período da Contrarreforma, comumente atribuído a São Roberto Belarmino (†1621).')),
    ('te-splendor-et-virtus-patris', 'Te, splendor et virtus Patris', ('horas', 'Sancti/05-08.txt', 'Hymnus Vespera'), 'angel', ['angels', 'saints', 'liturgical'], ['hymn', 'angels', 'michael', 'vespers'],
     ('*You, splendor and power of the Father* — the Vespers hymn of St. Michael the Archangel, standard-bearer of salvation.',
      '*A Vós, esplendor e poder do Pai* — o hino de Vésperas de São Miguel Arcanjo, porta-estandarte da salvação.'),
     ('The hymn *Tibi, Christe, splendor Patris*, attributed to Rabanus Maurus (ninth century), as revised for the Roman Breviary in 1632.',
      'O hino *Tibi, Christe, splendor Patris*, atribuído a Rabano Mauro (século IX), na revisão feita para o Breviário Romano em 1632.')),
    ('placare-christe-servulis', 'Placare, Christe, servulis', ('horas', 'Sancti/11-01.txt', 'Hymnus Vespera'), 'prayer', ['saints', 'liturgical'], ['hymn', 'saints', 'all-saints', 'vespers'],
     ('*Be merciful, O Christ, to Your servants* — the Vespers hymn of All Saints, calling in turn on the Virgin, the Angels, the Apostles, the Martyrs and every choir of heaven.',
      '*Sede propício, ó Cristo, aos vossos servos* — o hino de Vésperas de Todos os Santos, que invoca sucessivamente a Virgem, os Anjos, os Apóstolos, os Mártires e todos os coros do céu.'),
     ('The ancient hymn *Christe, Redemptor omnium, conserva tuos famulos*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Christe, Redemptor omnium, conserva tuos famulos*, na revisão feita para o Breviário Romano em 1632.')),
    ('exsultet-orbis-gaudiis', 'Exsultet orbis gaudiis', ('horas', 'Commune/C1.txt', 'Hymnus Vespera'), 'prayer', ['saints', 'liturgical'], ['hymn', 'saints', 'apostles', 'vespers'],
     ('*Let the world exult with joy* — the Vespers hymn of the Apostles, judges of the ages and true lights of the world.',
      '*Exulte o mundo de alegria* — o hino de Vésperas dos Apóstolos, juízes dos séculos e verdadeiras luzes do mundo.'),
     ('The ancient hymn *Exsultet caelum laudibus*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Exsultet caelum laudibus*, na revisão feita para o Breviário Romano em 1632.')),
    ('deus-tuorum-militum', 'Deus, tuorum militum', ('horas', 'Commune/C2.txt', 'Hymnus Vespera'), 'prayer', ['saints', 'liturgical'], ['hymn', 'saints', 'martyrs', 'vespers'],
     ('*O God, the lot, the crown and the reward of Your soldiers* — the Vespers hymn of a Martyr.',
      '*Ó Deus, herança, coroa e prêmio dos vossos soldados* — o hino de Vésperas de um Mártir.'),
     ('An ancient hymn from the Common of One Martyr in the Roman Breviary.',
      'Hino antigo, do Comum de um Mártir no Breviário Romano.')),
    ('sanctorum-meritis', 'Sanctorum meritis', ('horas', 'Commune/C3.txt', 'Hymnus Vespera'), 'prayer', ['saints', 'liturgical'], ['hymn', 'saints', 'martyrs', 'vespers'],
     ('*The glorious joys won by the Saints* — the Vespers hymn of Many Martyrs, the noblest race of conquerors.',
      '*As ínclitas alegrias merecidas pelos Santos* — o hino de Vésperas de Vários Mártires, a mais nobre estirpe de vencedores.'),
     ('An ancient hymn from the Common of Many Martyrs in the Roman Breviary.',
      'Hino antigo, do Comum de Vários Mártires no Breviário Romano.')),
    ('iste-confessor', 'Iste Confessor', ('horas', 'Commune/C4.txt', 'Hymnus Vespera'), 'prayer', ['saints', 'liturgical'], ['hymn', 'saints', 'confessors', 'vespers'],
     ('*This Confessor of the Lord* — the Vespers hymn of Confessors: devout, prudent, humble and chaste, at whose tomb the sick are healed.',
      '*Este Confessor do Senhor* — o hino de Vésperas dos Confessores: piedoso, prudente, humilde e casto, junto a cujo túmulo os enfermos são curados.'),
     ('An eighth-century hymn first written in honour of St. Martin of Tours, in the 1632 revision of the Roman Breviary.',
      'Hino do século VIII, composto primeiramente em honra de São Martinho de Tours, na revisão do Breviário Romano de 1632.')),
    ('iesu-corona-virginum', 'Iesu, corona Virginum', ('horas', 'Commune/C6.txt', 'Hymnus Vespera'), 'flower', ['saints', 'liturgical'], ['hymn', 'saints', 'virgins', 'vespers'],
     ('*Jesus, crown of Virgins* — the Vespers hymn of Virgins, who follow the Lamb wherever He goes.',
      '*Jesus, coroa das Virgens* — o hino de Vésperas das Virgens, que seguem o Cordeiro por onde quer que Ele vá.'),
     ('Traditionally attributed to St. Ambrose.',
      'Tradicionalmente atribuído a Santo Ambrósio.')),
    ('quem-terra-pontus-sidera', 'Quem terra, pontus, sidera', ('horas', 'Commune/C11.txt', 'Hymnus Matutinum'), 'mary', ['marian', 'liturgical'], ['hymn', 'marian', 'matins'],
     ('*Whom earth and sea and stars adore* — the Matins hymn of Our Lady: the womb of Mary bears the One who rules the threefold world.',
      '*Aquele a quem a terra, o mar e os astros adoram* — o hino de Matinas de Nossa Senhora: o seio de Maria traz Aquele que governa o tríplice mundo.'),
     ('Attributed to Venantius Fortunatus (sixth century). The hymn *O gloriosa virginum* is its continuation.',
      'Atribuído a Venâncio Fortunato (século VI). O hino *O gloriosa virginum* é a sua continuação.')),
    ('o-gloriosa-virginum', 'O gloriosa virginum', ('horas', 'Commune/C11.txt', 'Hymnus Laudes'), 'mary', ['marian', 'liturgical'], ['hymn', 'marian', 'lauds'],
     ('*O glorious among virgins* — the Lauds hymn of Our Lady: what Eve took away, Mary gives back through her holy Child.',
      '*Ó gloriosa entre as virgens* — o hino de Laudes de Nossa Senhora: o que Eva tirou, Maria restitui por meio do seu santo Filho.'),
     ('The second part of *Quem terra, pontus, sidera*, attributed to Venantius Fortunatus (sixth century); its older form begins *O gloriosa Domina*.',
      'A segunda parte de *Quem terra, pontus, sidera*, atribuído a Venâncio Fortunato (século VI); a sua forma mais antiga começa *O gloriosa Domina*.')),
    ('caelestis-urbs-ierusalem', 'Caelestis urbs Ierusalem', ('horas', 'Commune/C8.txt', 'Hymnus Vespera'), 'prayer', ['liturgical'], ['hymn', 'church', 'dedication', 'vespers'],
     ('*Heavenly city Jerusalem, blessed vision of peace* — the Vespers hymn for the Dedication of a Church, built in heaven of living stones.',
      '*Celeste cidade de Jerusalém, bem-aventurada visão de paz* — o hino de Vésperas da Dedicação de uma Igreja, edificada no céu com pedras vivas.'),
     ('The ancient hymn *Urbs beata Ierusalem*, as revised for the Roman Breviary in 1632.',
      'O antigo hino *Urbs beata Ierusalem*, na revisão feita para o Breviário Romano em 1632.')),
]


# The English of *Beata nobis gaudia* is rhymed in eight-line stanzas against the Latin's six.
LOOSE = {'beata-nobis-gaudia': ('en-US',)}



def line_of(tree, rel, pattern, code):
    """One logical line of a DO file (joined across `~` continuations), by its opening words."""
    lines = (DO / tree / LANGS[code] / rel).read_text(encoding='utf-8').splitlines()
    k = next(i for i, line in enumerate(lines) if re.search(pattern, fold(line), re.I))
    out = [lines[k]]
    while out[-1].rstrip().endswith('~'):
        k += 1
        out.append(lines[k])
    return clean(' '.join(part.rstrip().rstrip('~').strip() for part in out))


def section_text(tree, rel, header, code):
    lines = [l for l in sections(DO / tree / LANGS[code] / rel)[header] if l.strip() and l[0] not in '!$&@(']
    return tidy(' '.join(clean(l) for l in lines), code)


def both(fn):
    return {code: fn(code) for code in ('la', 'en-US')}


def psalm(n):
    """A psalm or canticle from the DO psalter as a `psalm` section, verse numbers and asterisks off."""
    def verses(code):
        lines = (DO / 'horas' / LANGS[code] / f'Psalterium/Psalmorum/Psalm{n}.txt').read_text(encoding='utf-8').splitlines()
        return [tidy(re.sub(r'^\d+:\d+[a-z]?\s+', '', l).replace('‡', ''), code) for l in lines if re.match(r'^\d+:\d+', l)]

    la, en = verses('la'), verses('en-US')
    if len(la) != len(en):
        raise ValueError(f'psalm {n}: {len(la)} Latin verses, {len(en)} English')
    return {'type': 'psalm', 'verses': [{'text': {'la': a, 'en-US': b}} for a, b in zip(la, en)]}


GLORY_BE = {'type': 'prayer', 'ref': 'glory-be'}


def heading(en, pt, la):
    return {'type': 'subheading', 'text': {'en-US': en, 'pt-BR': pt, 'la': la}}


def crux_fidelis():
    return piece('missa', 'Tempora/Quad6-5.txt', 'Prelude',
                 {'la': r'^crux fidelis', 'en-US': r'^faithful cross', 'pt-BR': r'^o cruz, em que tenho fe'},
                 r'^sempiterna sit', 1)


def improperia():
    # The Portuguese here drops the desert reproach and shifts the rest up a place, so it is left out.
    return piece('missa', 'Tempora/Quad6-5.txt', 'Prelude',
                 {'la': r'^popule meus', 'en-US': r'^o my people'}, r'^deus misereatur', 1)


def exsultet():
    return piece('missa', 'Tempora/Quad6-6.txt', 'Prelude',
                 {'la': r'^exsultet jam', 'en-US': r'^let the angelic', 'pt-BR': r'^exulte de alegria'},
                 r'^o vere beata nox', 1)


def gloria_laus():
    return piece('missa', 'Tempora/Quad6-0.txt', 'Prelude',
                 {'la': r'^gloria, laus', 'en-US': r'^glory, praise', 'pt-BR': r'^gloria, louvor'},
                 r'^gloria, laus', 11)


def gloria_in_excelsis():
    def lined(code):
        text = tidy(line_of('missa', 'Ordo/Ordo.txt', r'^v\. glor(ia|y)( in excelsis| be to god on high| a deus)', code), code)
        return re.sub(r'(?<=[.!]) (?=[A-ZÓÀ-Ý])', '\n', text)

    texts = {code: lined(code) for code in LANGS}
    return [{'type': 'prayer', 'inline': texts}], {code: len(t.split('\n')) for code, t in texts.items()}


def o_antiphons():
    days = [('17', 'O Sapientia'), ('18', 'O Adonai'), ('19', 'O Radix Iesse'), ('20', 'O Clavis David'),
            ('21', 'O Oriens'), ('22', 'O Rex gentium'), ('23', 'O Emmanuel')]
    out = []
    for day, _ in days:
        out.append(heading(f'December {day}', f'{day} de dezembro', f'Die {day} Decembris'))
        out.append({'type': 'antiphon', 'text': both(
            lambda code: section_text('horas', S + 'Major Special.txt', f'Adv Ant {day}', code))})
    return out, {'la': 7, 'en-US': 7}


def o_sacrum_convivium():
    """The antiphon in Latin from the Corpus Christi Office; its versicle and collect, and
    the vernacular, in the wording the corpus already prays at Benediction and in the
    Corpus Christi novena (the devotional form, without the Office's alleluias)."""
    la = section_text('horas', 'Tempora/Pent01-4.txt', 'Ant 3', 'la')
    la = re.sub(r', all[eé]l[uú]ia\.$', '.', la)

    def first_sentence(code):
        flow = json.loads((OUT / 'corpus-christi-novena/flow.json').read_text())
        found = re.search(r'"%s": "((?:O sacred banquet|Ó sagrado banquete)[^"]*?\.) ' % code, json.dumps(flow, ensure_ascii=False))
        return found.group(1)

    benediction = json.loads((OUT / 'tantum-ergo/manifest.json').read_text())['flow']['sections'][0]['inline']
    parts = {code: text.split('\n\n')[-2:] for code, text in benediction.items() if code in LANGS}
    v = {code: p[0].split('\n')[0][3:] for code, p in parts.items()}
    r = {code: p[0].split('\n')[1][3:] for code, p in parts.items()}
    collect = {code: p[1].split('\n', 1)[1] for code, p in parts.items()}
    return [
        {'type': 'antiphon', 'text': {'la': la, 'en-US': first_sentence('en-US'), 'pt-BR': first_sentence('pt-BR')}},
        {'type': 'response', 'verses': [{'v': v, 'r': r}]},
        {'type': 'rubric', 'text': {'en-US': 'Let us pray.', 'pt-BR': 'Oremos.', 'la': 'Oremus.'}},
        {'type': 'prayer', 'inline': collect},
    ], {code: 1 for code in LANGS}


def te_decet_laus():
    return [{'type': 'prayer', 'inline': both(
        lambda code: section_text('horas', 'Psalterium/Common/Prayers.txt', 'Te decet', code))}], {'la': 1, 'en-US': 1}


def penitential_psalms():
    antiphon = {'type': 'antiphon', 'text': {'la': tidy(
        'Ne reminiscáris, Dómine, delícta nostra, vel paréntum nostrórum: neque vindíctam sumas de peccátis nostris.', 'la')}}
    source = sections(DO / 'horas/Latin/Appendix/Septem psalmi paenitentiales.txt')['Septem psalmi paenitentiales']
    if fold(antiphon['text']['la']) not in [fold(tidy(re.sub(r'^Ant\. ', '', l), 'la')) for l in source]:
        raise ValueError('Ne reminiscaris antiphon no longer matches the DO appendix')
    numbers = [int(m.group(1)) for l in source for m in [re.match(r'&psalm\((\d+)\)', l)] if m]
    out = [antiphon]
    for n in numbers:
        out += [heading(f'Psalm {n}', f'Salmo {n}', f'Psalmus {n}'), psalm(n), GLORY_BE]
    return out + [antiphon], {'psalms': numbers}


def canticle(n):
    return lambda: ([psalm(n), GLORY_BE], {'canticle': n})


# id, name (en, pt, la), builder, icon, categories, tags, minutes, description, history, source
PIECES = [
    ('crux-fidelis', ('Crux fidelis', 'Crux fidelis', 'Crux fidelis'), crux_fidelis, 'cross', ['passion', 'seasonal', 'liturgical'], ['hymn', 'cross', 'passion', 'holy-week', 'good-friday'], 8,
     ('*Faithful Cross, above all other, one and only noble tree* — the hymn sung while the Cross is adored on Good Friday: the whole story of the Redemption, from the tree of Eden to the tree of Calvary.',
      '*Ó Cruz fiel, entre todas a única árvore nobre* — o hino cantado durante a adoração da Cruz na Sexta-feira Santa: toda a história da Redenção, da árvore do Éden à árvore do Calvário.'),
     ('The hymn *Pange, lingua, gloriosi lauream certaminis* of Venantius Fortunatus (sixth century), with its stanza *Crux fidelis* repeated as a refrain. St. Thomas Aquinas modelled his Eucharistic *Pange lingua* on it.',
      'O hino *Pange, lingua, gloriosi lauream certaminis*, de Venâncio Fortunato (século VI), com a sua estrofe *Crux fidelis* repetida como refrão. Santo Tomás de Aquino tomou-o por modelo do seu *Pange lingua* eucarístico.'),
     MISSAL),
    ('improperia', ('The Reproaches', 'Impropérios', 'Improperia'), improperia, 'cross', ['passion', 'seasonal', 'liturgical'], ['passion', 'cross', 'holy-week', 'good-friday', 'trisagion'], 8,
     ('*My people, what have I done to you? Answer me* — the reproaches of the crucified Lord to His people, sung during the adoration of the Cross on Good Friday, with the Trisagion in Greek and Latin.',
      '*Povo meu, que te fiz eu? Responde-me* — as queixas do Senhor crucificado ao seu povo, cantadas durante a adoração da Cruz na Sexta-feira Santa, com o Triságio em grego e latim.'),
     ('One of the oldest chants of the Good Friday liturgy; the *Agios o Theos* is kept in Greek as the Roman Church received it from the East.',
      'Um dos cantos mais antigos da liturgia da Sexta-feira Santa; o *Agios o Theos* conserva-se em grego, tal como a Igreja Romana o recebeu do Oriente.'),
     MISSAL),
    ('exsultet', ('Exsultet', 'Exsultet', 'Exsultet'), exsultet, 'candle', ['resurrection', 'seasonal', 'liturgical'], ['easter', 'easter-vigil', 'holy-week', 'paschal-candle'], 10,
     ('*Let the angelic host of heaven now rejoice* — the Easter Proclamation, sung by the deacon before the Paschal candle in the night of the Resurrection: *O happy fault, that merited so great a Redeemer!*',
      '*Exulte já a multidão dos Anjos no céu* — o Precônio Pascal, cantado pelo diácono diante do círio pascal na noite da Ressurreição: *Ó feliz culpa, que mereceu tão grande Redentor!*'),
     ('The ancient *Praeconium paschale* of the Roman Easter Vigil, in use since at least the seventh century. It is given as the Roman Missal carried it until 1955, closing with the old prayer for the Emperor.',
      'O antigo *Praeconium paschale* da Vigília Pascal romana, em uso pelo menos desde o século VII. Vai aqui como o Missal Romano o trazia até 1955, terminando com a antiga oração pelo Imperador.'),
     MISSAL),
    ('gloria-laus', ('Gloria, laus et honor', 'Gloria, laus et honor', 'Gloria, laus et honor'), gloria_laus, 'prayer', ['seasonal', 'liturgical'], ['hymn', 'palm-sunday', 'holy-week', 'procession'], 3,
     ('*Glory, praise and honour to You, Christ, King and Redeemer* — the hymn of the Palm Sunday procession, sung at the church door with the children\'s Hosanna.',
      '*Glória, louvor e honra a Vós, ó Cristo, Rei e Redentor* — o hino da procissão do Domingo de Ramos, cantado à porta da igreja com o Hosana das crianças.'),
     ('Written by Theodulf, Bishop of Orléans (d. 821).',
      'Composto por Teodulfo, bispo de Orléans (†821).'),
     MISSAL),
    ('gloria-in-excelsis', ('Gloria in excelsis Deo', 'Glória a Deus nas alturas', 'Gloria in excelsis Deo'), gloria_in_excelsis, 'sparkles', ['liturgical'], ['hymn', 'mass', 'doxology'], 2,
     ('*Glory to God in the highest* — the Angelic Hymn: the song of the angels at Bethlehem, carried on by the Church in praise of the Father and of the Lamb.',
      '*Glória a Deus nas alturas* — o Hino Angélico: o canto dos anjos em Belém, continuado pela Igreja em louvor do Pai e do Cordeiro.'),
     ('The Greater Doxology, a Greek morning hymn of the first Christian centuries, sung at Mass on Sundays and feasts.',
      'A Grande Doxologia, hino matutino grego dos primeiros séculos cristãos, cantado na Missa aos domingos e festas.'),
     MISSAL),
    ('o-antiphons', ('The O Antiphons', 'Antífonas do Ó', 'Antiphonae maiores'), o_antiphons, 'candle', ['seasonal', 'liturgical'], ['advent', 'antiphon', 'magnificat', 'vespers'], 4,
     ('The seven great antiphons sung at the *Magnificat* from 17 to 23 December, each calling on the Messiah by one of His titles — Wisdom, Adonai, Root of Jesse, Key of David, Dayspring, King of the nations, Emmanuel — and begging Him to come.',
      'As sete antífonas maiores cantadas no *Magnificat* de 17 a 23 de dezembro, cada uma invocando o Messias por um dos seus títulos — Sabedoria, Adonai, Raiz de Jessé, Chave de Davi, Oriente, Rei das nações, Emanuel — e suplicando que Ele venha.'),
     ('Known in the Roman liturgy since at least the eighth century. Read backwards, the initials of the Latin titles spell *ERO CRAS* — "Tomorrow I shall be there".',
      'Conhecidas na liturgia romana pelo menos desde o século VIII. Lidas de trás para a frente, as iniciais dos títulos latinos formam *ERO CRAS* — «Amanhã estarei aí».'),
     BREVIARY),
    ('o-sacrum-convivium', ('O sacrum convivium', 'O sacrum convivium', 'O sacrum convivium'), o_sacrum_convivium, 'eucharist', ['eucharistic', 'devotion'], ['eucharistic', 'antiphon', 'corpus-christi', 'aquinas', 'adoration'], 1,
     ('*O sacred banquet, in which Christ is received* — the antiphon of the Blessed Sacrament, with its versicle and collect: the memory of the Passion, the soul filled with grace, the pledge of glory to come.',
      '*Ó sagrado banquete, em que se recebe Cristo* — a antífona do Santíssimo Sacramento, com o seu versículo e oração: a memória da Paixão, a alma cheia de graça, o penhor da glória futura.'),
     ('The *Magnificat* antiphon of Second Vespers of Corpus Christi, from the Office composed by St. Thomas Aquinas (1264).',
      'A antífona do *Magnificat* das II Vésperas de Corpus Christi, do Ofício composto por Santo Tomás de Aquino (1264).'),
     BREVIARY),
    ('te-decet-laus', ('Te decet laus', 'Te decet laus', 'Te decet laus'), te_decet_laus, 'trinity', ['trinity', 'liturgical'], ['hymn', 'trinity', 'doxology', 'benedictine'], 1,
     ('*To You belongs praise, to You belongs the hymn* — a brief doxology to the Trinity.',
      '*A Vós convém o louvor, a Vós convém o hino* — uma breve doxologia à Santíssima Trindade.'),
     ('The Rule of St. Benedict appoints it to close the night office on Sundays, after the Gospel.',
      'A Regra de São Bento determina que ela encerre o ofício noturno aos domingos, depois do Evangelho.'),
     BREVIARY),
    ('seven-penitential-psalms', ('The Seven Penitential Psalms', 'Os Sete Salmos Penitenciais', 'Septem Psalmi Paenitentiales'), penitential_psalms, 'scroll', ['penance'], ['psalm', 'penitential', 'lent', 'miserere', 'de-profundis'], 20,
     ('Psalms 6, 31, 37, 50, 101, 129 and 142 — the seven psalms of repentance, prayed under the antiphon *Ne reminiscaris*: "Remember not, Lord, our offences."',
      'Os Salmos 6, 31, 37, 50, 101, 129 e 142 — os sete salmos do arrependimento, rezados sob a antífona *Ne reminiscaris*: «Não vos lembreis, Senhor, dos nossos delitos.»'),
     ('Named as a group since the sixth century (Cassiodorus), and long printed in the Roman Breviary to be said in Lent.',
      'Reunidos sob este nome desde o século VI (Cassiodoro), e por muito tempo impressos no Breviário Romano para serem rezados na Quaresma.'),
     BREVIARY),
    ('canticle-of-isaiah', ('Canticle of Isaiah', 'Cântico de Isaías', 'Canticum Isaiae'), canticle(221), 'scroll', ['liturgical'], ['canticle', 'isaiah', 'lauds', 'thanksgiving'], 2,
     ('*I will give thanks to You, O Lord* — the song of the redeemed in Isaiah 12: "You shall draw waters with joy out of the Saviour\'s fountains."',
      '*Eu Vos darei graças, Senhor* — o cântico dos remidos em Isaías 12: «Tirareis água com alegria das fontes do Salvador.»'),
     ('The Old Testament canticle of Monday Lauds in the Roman Breviary.', 'O cântico do Antigo Testamento das Laudes de segunda-feira no Breviário Romano.'), BREVIARY),
    ('canticle-of-hezekiah', ('Canticle of Hezekiah', 'Cântico de Ezequias', 'Canticum Ezechiae'), canticle(222), 'scroll', ['liturgical'], ['canticle', 'isaiah', 'lauds', 'sickness'], 3,
     ('*I said: in the midst of my days I shall go to the gates of hell* — King Hezekiah\'s song on recovering from his sickness (Isaiah 38).',
      '*Eu disse: no meio dos meus dias irei às portas do abismo* — o cântico do rei Ezequias ao recuperar-se da sua doença (Isaías 38).'),
     ('The Old Testament canticle of Tuesday Lauds in the Roman Breviary; it is also sung in the Office of the Dead.', 'O cântico do Antigo Testamento das Laudes de terça-feira no Breviário Romano; canta-se também no Ofício dos Defuntos.'), BREVIARY),
    ('canticle-of-hannah', ('Canticle of Hannah', 'Cântico de Ana', 'Canticum Annae'), canticle(223), 'scroll', ['liturgical'], ['canticle', 'lauds', 'thanksgiving'], 3,
     ('*My heart has rejoiced in the Lord* — the song of Hannah, mother of Samuel (1 Kings 2), which the *Magnificat* echoes: the Lord humbles and He exalts.',
      '*O meu coração exultou no Senhor* — o cântico de Ana, mãe de Samuel (1 Reis 2), de que o *Magnificat* se faz eco: o Senhor humilha e exalta.'),
     ('The Old Testament canticle of Wednesday Lauds in the Roman Breviary.', 'O cântico do Antigo Testamento das Laudes de quarta-feira no Breviário Romano.'), BREVIARY),
    ('canticle-of-moses', ('Canticle of Moses', 'Cântico de Moisés', 'Canticum Moysis'), canticle(224), 'scroll', ['liturgical'], ['canticle', 'exodus', 'lauds', 'easter-vigil'], 4,
     ('*Let us sing to the Lord, for He is gloriously magnified* — the song of Moses and Israel on the far shore of the Red Sea (Exodus 15).',
      '*Cantemos ao Senhor, que gloriosamente se engrandeceu* — o cântico de Moisés e de Israel na outra margem do Mar Vermelho (Êxodo 15).'),
     ('The Old Testament canticle of Thursday Lauds in the Roman Breviary.', 'O cântico do Antigo Testamento das Laudes de quinta-feira no Breviário Romano.'), BREVIARY),
    ('canticle-of-habakkuk', ('Canticle of Habakkuk', 'Cântico de Habacuc', 'Canticum Habacuc'), canticle(225), 'scroll', ['liturgical'], ['canticle', 'lauds', 'passion'], 4,
     ('*O Lord, I have heard Your hearing and was afraid* — the prayer of the prophet Habakkuk (Habakkuk 3): "When Thou art angry, Thou wilt remember mercy."',
      '*Senhor, ouvi a vossa palavra e temi* — a oração do profeta Habacuc (Habacuc 3): «Quando estiverdes irado, lembrar-vos-eis da misericórdia.»'),
     ('The Old Testament canticle of Friday Lauds in the Roman Breviary.', 'O cântico do Antigo Testamento das Laudes de sexta-feira no Breviário Romano.'), BREVIARY),
]


def build_pieces(nxt):
    for pid, (en, pt, la), builder, icon, categories, tags, mins, desc, hist, source in PIECES:
        secs, report = builder()
        print(f'{pid}: {report}')
        order, nxt = sort_order(pid, nxt)
        m = manifest(pid, la, icon, categories, tags, desc, hist, source, mins, order)
        m['name'] = {'en-US': en, 'pt-BR': pt, 'la': la}
        write(pid, m, {'sections': secs})
    return nxt


def minutes(text):
    return max(1, round(len(text.split()) / 60))


def write(pid, manifest, flow):
    d = OUT / pid
    d.mkdir(exist_ok=True)
    for name, obj in (('manifest.json', manifest), ('flow.json', flow)):
        (d / name).write_text(json.dumps(obj, ensure_ascii=False, indent='\t') + '\n', encoding='utf-8')


def manifest(pid, name, icon, categories, tags, desc, hist, source, mins, order):
    return {
        'id': pid,
        'form': 'prayer',
        'icon': icon,
        'name': {'en-US': name, 'pt-BR': name, 'la': name},
        'categories': categories,
        'estimatedMinutes': mins,
        'description': {'en-US': desc[0], 'pt-BR': desc[1]},
        'history': {'en-US': hist[0], 'pt-BR': hist[1]},
        'source': source,
        'flowMode': 'scroll',
        'completion': 'flow-end',
        'tags': tags,
        'defaults': {
            'sortOrder': order,
            'slots': [{'schedule': {'type': 'daily'}, 'tier': 'extra', 'enabled': False}],
        },
        'flow': 'flow.json',
    }


def sort_order(pid, nxt):
    """Keep an already-authored practice's place in the list; a new one goes to the end."""
    path = OUT / pid / 'manifest.json'
    if path.exists():
        return json.loads(path.read_text())['defaults']['sortOrder'], nxt
    return nxt, nxt + 1


def next_order():
    orders = [json.loads(p.read_text()).get('defaults', {}).get('sortOrder', 0) for p in OUT.glob('*/manifest.json')]
    return max(orders) + 1


def build_hymns(nxt):
    for pid, name, (tree, rel, header), icon, categories, tags, desc, hist in HYMNS:
        texts, report = hymn(tree, rel, header, LOOSE.get(pid, ()))
        missing = [c for c in report if c not in texts]
        print(f'{pid}: {report}' + (f'  ** without {missing}' if missing else ''))
        order, nxt = sort_order(pid, nxt)
        source = MISSAL if tree == 'missa' else BREVIARY
        write(pid, manifest(pid, name, icon, categories, tags, desc, hist, source, minutes(texts['la']), order),
              {'sections': [{'type': 'prayer', 'inline': texts}]})
    return nxt


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--find':
        for q in sys.argv[2:]:
            print(f'== {q}')
            find(q)
    else:
        build_pieces(build_hymns(next_order()))
