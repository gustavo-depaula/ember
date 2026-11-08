import { describe, expect, it } from 'vitest'
import { mapItemsToPrimitives } from './blocks'

describe('mapItemsToPrimitives', () => {
  it('maps section heads, rubrics, dialog, and text with Latin as secondary', () => {
    const vernacular = [
      '#Introit',
      '!Ps 138:17\nv. To me, thy friends, O God, are honourable.\nGlory be to the Father.',
      '',
      'S. Lord, have mercy.\nM. Christ, have mercy.',
      '_',
    ]
    const latin = [
      '#Introitus',
      '!Ps 138:17\nv. Mihi autem nimis honoráti sunt amíci tui, Deus.\nGlória Patri.',
      '',
      'S. Kýrie, eléison.\nM. Christe, eléison.',
      '_',
    ]
    const out = mapItemsToPrimitives(vernacular, latin)

    expect(out[0]).toEqual({
      type: 'heading',
      text: { primary: 'Introit', secondary: 'Introitus', secondaryLanguage: 'la' },
      size: 'h1',
    })
    expect(out[1]).toEqual({
      type: 'rubric',
      text: { primary: 'Ps 138:17' },
    })
    // A lowercase 'v.' opens a paragraph (DO's initial letter), not a versicle.
    expect(out[2]).toMatchObject({
      type: 'text',
      text: {
        primary: 'To me, thy friends, O God, are honourable.\nGlory be to the Father.',
        secondary: 'Mihi autem nimis honoráti sunt amíci tui, Deus.\nGlória Patri.',
        secondaryLanguage: 'la',
      },
    })
    const dialog = out.find((p) => p.type === 'verses' && p.items.length === 2)
    expect(dialog).toMatchObject({
      items: [
        {
          text: {
            primary: 'Lord, have mercy.',
            secondary: 'Kýrie, eléison.',
            secondaryLanguage: 'la',
          },
          role: 'v',
        },
        {
          text: {
            primary: 'Christ, have mercy.',
            secondary: 'Christe, eléison.',
            secondaryLanguage: 'la',
          },
          role: 'r',
        },
      ],
    })
    expect(out[out.length - 1]).toEqual({ type: 'divider' })
  })

  it('reads who speaks from the Latin, where the vernacular letters the server S.', () => {
    // English and Portuguese print the priest as P. and the server as S.; in
    // Latin S. is the priest (Sacerdos) and M. the server.
    const out = mapItemsToPrimitives(
      ['P. I will go in to the altar of God.\nS. To God who giveth joy to my youth.'],
      ['S. Introíbo ad altáre Dei.\nM. Ad Deum, qui lætíficat juventútem meam.'],
    )
    expect(out).toHaveLength(1)
    const verses = out[0] as Extract<(typeof out)[number], { type: 'verses' }>
    expect(verses.items.map((item) => item.role)).toEqual(['v', 'r'])
  })

  it('pairs content lines past blank lines the columns place differently', () => {
    // Prime's chapter office: equal raw line counts, but the vernacular has an
    // extra blank after the rubric and one fewer at the end.
    const vernacular = ['!Pai Nosso em segredo\n\n\nV. Pai Nosso\nV. E não nos deixeis\nR. Amém.\n']
    const latin = ['!Pater Noster secreto\n\nV. Pater noster\nV. Et ne nos\nR. Amen.\n\n']
    const verses = mapItemsToPrimitives(vernacular, latin).find((p) => p.type === 'verses')
    expect(verses).toMatchObject({
      items: [
        { text: { primary: 'Pai Nosso', secondary: 'Pater noster', secondaryLanguage: 'la' } },
        { text: { primary: 'E não nos deixeis', secondary: 'Et ne nos', secondaryLanguage: 'la' } },
        { text: { primary: 'Amém.', secondary: 'Amen.', secondaryLanguage: 'la' } },
      ],
    })
  })

  it('sets an antiphon apart as its own block', () => {
    const out = mapItemsToPrimitives(
      ['Ant. Sede o meu auxiliador * e o meu libertador.\nV. Glória ao Pai.\nR. Como era.'],
      ['Ant. Adiútor meus * et liberátor meus.\nV. Glória Patri.\nR. Sicut erat.'],
    )
    expect(out).toMatchObject([
      {
        type: 'verses',
        items: [
          {
            mark: 'Ant.',
            text: {
              primary: 'Sede o meu auxiliador * e o meu libertador.',
              secondary: 'Adiútor meus * et liberátor meus.',
              secondaryLanguage: 'la',
            },
          },
        ],
      },
      { type: 'verses', items: [{ role: 'v' }, { role: 'r' }] },
    ])
  })

  it('opens a new paragraph at each lowercase v./r. line', () => {
    const out = mapItemsToPrimitives([
      'r. Em Roma, santo Anastácio.\nr. Em Anagni, as santas Virgens.',
    ])
    expect(out).toEqual([
      { type: 'text', markup: 'do', text: { primary: 'Em Roma, santo Anastácio.' } },
      { type: 'text', markup: 'do', text: { primary: 'Em Anagni, as santas Virgens.' } },
    ])
  })

  it('leads a responsory or blessing with its red label', () => {
    const out = mapItemsToPrimitives([
      'R.br. Cristo Filho de Deus vivo.\nBênção. O Senhor nos abençoe.',
    ])
    expect(out).toMatchObject([
      {
        type: 'verses',
        items: [{ mark: '℟.br.', text: { primary: 'Cristo Filho de Deus vivo.' } }],
      },
      { type: 'verses', items: [{ mark: 'Bênção.', text: { primary: 'O Senhor nos abençoe.' } }] },
    ])
  })

  it('pairs stanza by stanza so one longer stanza keeps its neighbours paired', () => {
    const out = mapItemsToPrimitives(
      [
        'v. Da terra és esperança,\nDo céu já és o brilho;\n_\nr. A glória seja ao Pai,\nAgora e sempre. Amém.',
      ],
      [
        'v. Ætérna cæli glória,\nBeáta spes mortálium,\n_\nr. Deo Patri sit glória,\nIn sempitérna sǽcula.\nAmen.',
      ],
    )
    expect(out[0]).toMatchObject({
      type: 'text',
      text: {
        primary: 'Da terra és esperança,\nDo céu já és o brilho;',
        secondary: 'Ætérna cæli glória,\nBeáta spes mortálium,',
        secondaryLanguage: 'la',
      },
    })
    expect(out[2]).toMatchObject({
      type: 'text',
      text: { primary: 'A glória seja ao Pai,\nAgora e sempre. Amém.' },
    })
  })

  it("moves a heading's braced source into a note", () => {
    const out = mapItemsToPrimitives(
      ['#Salmos{Laudes:2 Salmos e antífonas  do Saltério}'],
      ['#Psalmi{Laudes:2 Psalmi et antiphonæ ex Psalterio}'],
    )
    expect(out).toEqual([
      {
        type: 'heading',
        text: { primary: 'Salmos', secondary: 'Psalmi', secondaryLanguage: 'la' },
        size: 'h1',
        note: {
          primary: 'Laudes:2 Salmos e antífonas do Saltério',
          secondary: 'Laudes:2 Psalmi et antiphonæ ex Psalterio',
          secondaryLanguage: 'la',
        },
      },
    ])
  })

  it("prints DO's word-joining underscores as spaces", () => {
    const out = mapItemsToPrimitives(['!Cântico de_Simeão\n_\nAgora, Senhor.'])
    expect(out).toEqual([
      { type: 'rubric', text: { primary: 'Cântico de Simeão' } },
      { type: 'divider' },
      { type: 'text', markup: 'do', text: { primary: 'Agora, Senhor.' } },
    ])
  })

  it('drops inline rubric markers from a rubric line', () => {
    const out = mapItemsToPrimitives(['!/:«Pai Nosso» é dito em segredo:/'])
    expect(out).toEqual([{ type: 'rubric', text: { primary: '«Pai Nosso» é dito em segredo' } }])
  })

  it('falls back to chunk pairing when line structures diverge', () => {
    const out = mapItemsToPrimitives(['One line only.'], ['Linea una.\nLinea altera.'])
    expect(out).toEqual([
      {
        type: 'text',
        markup: 'do',
        text: {
          primary: 'One line only.',
          secondary: 'Linea una.\nLinea altera.',
          secondaryLanguage: 'la',
        },
      },
    ])
  })

  it('renders Latin-only when no vernacular column exists', () => {
    const out = mapItemsToPrimitives(['#Canon', 'Te ígitur, clementíssime Pater.'])
    expect(out).toEqual([
      { type: 'heading', text: { primary: 'Canon' }, size: 'h1' },
      { type: 'text', markup: 'do', text: { primary: 'Te ígitur, clementíssime Pater.' } },
    ])
  })
  it('reads an hour named as a link by its name', () => {
    const out = mapItemsToPrimitives(['!Pule o resto, a menos que ore %Laudes% separadamente.'])
    expect(out).toEqual([
      { type: 'rubric', text: { primary: 'Pule o resto, a menos que ore Laudes separadamente.' } },
    ])
  })

  it("keeps a responsory's repeat on its own line within the response", () => {
    const out = mapItemsToPrimitives(
      [
        'R. I believe that my Redeemer liveth, and that I shall stand up from the earth at the latter day,\n* And in my flesh shall I see God my Saviour.\nV. Whom I shall see for myself.',
      ],
      [
        'R. Credo quod Redémptor meus vivit, et in novíssimo die de terra surrectúrus sum, \n* Et in carne mea vidébo Deum Salvatórem meum.\nV. Quem visúrus sum ego ipse.',
      ],
    )
    expect(out).toHaveLength(1)
    const [block] = out
    expect(block.type).toBe('verses')
    if (block.type !== 'verses') return
    expect(block.items.map((item) => item.role)).toEqual(['r', 'v'])
    expect(block.items[0].text.primary).toBe(
      'I believe that my Redeemer liveth, and that I shall stand up from the earth at the latter day, * And in my flesh shall I see God my Saviour.',
    )
    expect(block.items[0].text.secondary).toMatch(/surrectúrus sum, \* Et in carne mea/)
  })
  it('pairs prayers whose Portuguese sets the Amém on a line of its own', () => {
    const out = mapItemsToPrimitives(
      [
        'v. Compadeça-se de nós Deus omnipotente, e, perdoados os nossos pecados, conduza-nos à vida eterna.\nAmém.\nv. Que o Senhor + omnipotente e misericordioso nos conceda o perdão.\nAmém.',
      ],
      [
        'v. Misereátur nostri omnípotens Deus, et dimíssis peccátis nostris, perdúcat nos ad vitam ætérnam. Amen.\nv. Indulgéntiam, + absolutiónem et remissiónem peccatórum nostrórum tríbuat nobis omnípotens et miséricors Dóminus. Amen.',
      ],
    )
    const texts = out.flatMap((p) => (p.type === 'text' ? [p.text] : []))
    expect(texts).toHaveLength(2)
    expect(texts[0].primary).toMatch(/^Compadeça-se.*\nAmém\.$/s)
    expect(texts[0].secondary).toMatch(/^Misereátur.*Amen\.$/)
    expect(texts[1].primary).toMatch(/^Que o Senhor/)
    expect(texts[1].secondary).toMatch(/^Indulgéntiam/)
  })

  // Lines of the Ordo as Divinum Officium writes them, Portuguese and Latin.
  const pairsOf = (out: ReturnType<typeof mapItemsToPrimitives>) =>
    out.flatMap((p) => {
      if (p.type === 'verses') return p.items.map((it) => [it.text.primary, it.text.secondary])
      if (p.type === 'text' || p.type === 'rubric') return [[p.text.primary, p.text.secondary]]
      return []
    })

  it('pairs a Confiteor the Portuguese runs over three lines with its Latin on one', () => {
    const out = mapItemsToPrimitives(
      [
        '!Profundamente inclinado, o Sacerdote diz o Confíteor:\nP. Eu me confesso a Deus, todo-poderoso: (aqui baterá no peito três vezes, dizendo:)\nPor minha culpa, por minha culpa, por minha tão grande culpa.\nPortanto, rogo à bem-aventurada sempre Virgem Maria que rogueis por mim a Deus, Nosso Senhor.\nS. Compadeça-se de ti o Senhor omnipotente.\n!O Sacerdote responde:\nP. Amém.',
      ],
      [
        '!Deinde iunctis manibus profunde inclinatus facit Confessionem.\nv. Confíteor Deo omnipoténti: mea culpa, mea culpa, mea máxima culpa. Ideo precor beátam Maríam semper Vírginem oráre pro me ad Dóminum, Deum nostrum.\nM. Misereátur tui omnípotens Deus.\n!Sacerdos dicit:\nS. Amen.',
      ],
    )
    const pairs = pairsOf(out)
    expect(pairs[1][0]).toMatch(/^Eu me confesso.*\nPor minha culpa.*\nPortanto, rogo/s)
    expect(pairs[1][1]).toMatch(/^Confíteor Deo/)
    expect(pairs[2]).toEqual([
      'Compadeça-se de ti o Senhor omnipotente.',
      'Misereátur tui omnípotens Deus.',
    ])
  })

  it('keeps pairing past a rubric only the Latin has', () => {
    const out = mapItemsToPrimitives(
      [
        'P. O Senhor esteja convosco.\nS. E com o teu espírito\nv. Continuação do santo Evangelho\nR. Glória a Vós, Senhor.',
      ],
      [
        'V. Dóminus vobíscum.\nR. Et cum spíritu tuo.\n!Et pronuntians: Inítium, sive Sequéntia sancti Evangélii, signat librum.\nv. Sequéntia sancti Evangélii\nR. Glória tibi, Dómine.',
      ],
    )
    expect(pairsOf(out).map(([, la]) => la)).toEqual([
      'Dóminus vobíscum.',
      'Et cum spíritu tuo.',
      'Sequéntia sancti Evangélii',
      'Glória tibi, Dómine.',
    ])
  })

  it('rejoins a sentence a rubric interrupts, the rubric inline as the Latin has it', () => {
    const out = mapItemsToPrimitives(
      [
        'v. Por Ele, com Ele e n’Ele, na unidade do Espírito Santo\n!Eleva um pouco o Cálice com a Hóstia.\npertence, e Vos é dada, toda a honra e glória.\n!Ajoelha-se e levantando-se, diz:\nP. Por todos os séculos dos séculos.\nS. Amém.',
      ],
      [
        'v.Per Ipsum, et cum Ipso, et in Ipso, (Elevans parum Calicem cum Hostia, dicit:) omnis honor, et glória.\n!ponit Hostiam, genuflectit, surgit, et dicit:\nv. Per ómnia sǽcula sæculórum.\nR. Amen.',
      ],
    )
    const pairs = pairsOf(out)
    expect(pairs[0][0]).toBe(
      'Por Ele, com Ele e n’Ele, na unidade do Espírito Santo (Eleva um pouco o Cálice com a Hóstia.) pertence, e Vos é dada, toda a honra e glória.',
    )
    expect(pairs[2]).toEqual(['Por todos os séculos dos séculos.', 'Per ómnia sǽcula sæculórum.'])
  })

  it('keeps a Latin prayer split by a rubric in its order beside its one-line translation', () => {
    const out = mapItemsToPrimitives(
      [
        'P. Que desça sobre vós a bênção do omnipotente Deus: Pai, Filho, + e Espírito Santo.\nS. Amém.',
      ],
      [
        'v. Benedícat vos omnípotens Deus,\n!et versus ad populum, semel tantum benedícens:\nv. Pater, et Fílius, + et Spíritus Sanctus.\nR. Amen.',
      ],
    )
    expect(pairsOf(out)[0][1]).toBe(
      'Benedícat vos omnípotens Deus,\nPater, et Fílius, + et Spíritus Sanctus.',
    )
  })

  it('aligns columns that count alike but place their rubrics differently', () => {
    const out = mapItemsToPrimitives(
      [
        '!Elevando a Hóstia, diz:\nP. Eis o Cordeiro de Deus.\n!Depois diz três vezes:\nS. Senhor, eu não sou digno.',
      ],
      [
        '!genuflectens, accipit Pyxidem, dicit:\nS. Ecce Agnus Dei.\nS. Dómine, non sum dignus.\n!Quibus verbis tertio repetitis.',
      ],
    )
    const spokenPairs = pairsOf(out).filter(([pt]) => !/:$/.test(pt ?? ''))
    expect(spokenPairs).toEqual([
      ['Eis o Cordeiro de Deus.', 'Ecce Agnus Dei.'],
      ['Senhor, eu não sou digno.', 'Dómine, non sum dignus.'],
    ])
  })

  it('reads the words of consecration and a translator’s HTML space without their marks', () => {
    const out = mapItemsToPrimitives(['!!! POIS ISTO É O MEU CORPO.\n#Credo&nbsp;'])
    expect(out).toEqual([
      { type: 'heading', text: { primary: 'POIS ISTO É O MEU CORPO.' }, size: 'h2' },
      { type: 'heading', text: { primary: 'Credo' }, size: 'h1' },
    ])
  })

  it('keeps a line whose Latin reads as its vernacular in a paragraph that differs elsewhere', () => {
    // A reading the translation lacks falls back to the Latin, in another spelling.
    const out = mapItemsToPrimitives(
      ['/:5:/ Et constítuit eis rex annónam.\n/:6:/ Fuérunt ergo inter eos de fíliis Juda.'],
      ['/:5:/ Et constítuit eis rex annónam.\n/:6:/ Fuérunt ergo inter eos de fíliis Iuda.'],
    )
    expect(out[0]).toMatchObject({
      text: {
        secondary:
          '/:5:/ Et constítuit eis rex annónam.\n/:6:/ Fuérunt ergo inter eos de fíliis Iuda.',
      },
    })
  })
})
