import type { Localized, Structure } from '@ember/missal-schema'

/**
 * Structure detection (census contract): scan localized titles/subtitles for
 * keywords. Ported from refine.py's RITE_TITLE_PATTERNS and extended for the
 * new census: mass-with-ashes (Ash Wednesday), Candlemas under
 * mass-with-blessing-and-procession, and vigil-mass (solemnity vigils).
 *
 * Order matters: more specific structures first. Detection by title alone is
 * ambiguous for the Easter Vigil vs Easter morning ("Easter Sunday of the
 * Resurrection" titles both) — the census resolves those via explicit
 * day-id overrides, mirroring refine.py's SPECIAL_DAY_ID_OVERRIDES.
 */
const structurePatterns: Array<[Structure, string[]]> = [
  [
    'easter-vigil',
    [
      'easter vigil',
      'vigilia paschalis',
      'vigilia pascual',
      'vigília pascal',
      'veglia pasquale',
      'veillée pascale',
      'osternacht',
      'holy saturday',
    ],
  ],
  [
    'celebration-of-the-passion' as Structure,
    [
      'good friday',
      'friday of the passion',
      'viernes santo',
      'sexta-feira santa',
      'venerdì santo',
      'vendredi saint',
      'karfreitag',
      'in passione domini',
      'celebratio passionis',
    ],
  ],
  [
    'chrism-mass',
    [
      'chrism mass',
      'missa chrismatis',
      'misa crismal',
      'messa crismale',
      'messe chrismale',
      'chrisam-messe',
      'missa do crisma',
    ],
  ],
  [
    'lords-supper',
    [
      "lord's supper",
      'in cena domini',
      'missa vespertina',
      'misa vespertina de la cena',
      'santa ceia do senhor',
      'messa nella cena del signore',
      'messe en mémoire de la cène',
      'abendmahl',
    ],
  ],
  [
    'mass-with-ashes',
    [
      'ash wednesday',
      'feria iv cinerum',
      'miércoles de ceniza',
      'quarta-feira de cinzas',
      'mercoledì delle ceneri',
      'mercredi des cendres',
      'aschermittwoch',
    ],
  ],
  [
    'mass-with-blessing-and-procession',
    [
      // Palm Sunday
      'palm sunday',
      'dominica in palmis',
      'domingo de ramos',
      'domenica delle palme',
      'dimanche des rameaux',
      'palmsonntag',
      // Candlemas (Feb 2) — blessing of candles + procession
      'presentation of the lord',
      'in praesentatione domini',
      'presentación del señor',
      'apresentação do senhor',
      'presentazione del signore',
      'présentation du seigneur',
      'darstellung des herrn',
    ],
  ],
  [
    'vigil-mass',
    [
      'vigil mass',
      'at the vigil',
      'mass at the vigil',
      'missa da vigília',
      'missa da vigilia',
      'in vigilia',
      'misa de la vigilia',
      'messa della vigilia',
      'messe de la vigile',
      'am vorabend',
      'vigile de la',
    ],
  ],
]

// `celebration-of-the-passion` is named `good-friday` in the schema enum.
const structureAlias: Record<string, Structure> = {
  'celebration-of-the-passion': 'good-friday',
}

export function detectStructure(...haystacks: Array<Localized | undefined>): Structure {
  const parts: string[] = []
  for (const d of haystacks) {
    if (!d) continue
    for (const t of Object.values(d)) if (t) parts.push(t.toLowerCase())
  }
  const haystack = parts.join(' | ')
  if (!haystack) return 'mass'
  for (const [structure, keywords] of structurePatterns) {
    for (const kw of keywords) {
      if (haystack.includes(kw)) return structureAlias[structure] ?? structure
    }
  }
  return 'mass'
}

/**
 * Per-structure: the canonical ordered part keys and the heading patterns
 * identifying each part. Matched case-insensitively against any language's
 * heading text. Ported from refine.py's RITE_PART_PATTERNS.
 */
export const partPatterns: Partial<Record<Structure, Array<[string, string[]]>>> = {
  'mass-with-blessing-and-procession': [
    [
      'commemorationOfTheLordsEntrance',
      [
        "commemoration of the lord's entrance",
        'the commemoration of the lord',
        'first form: the procession',
        'second form: the solemn entrance',
        'third form: the simple entrance',
        'first form: solemn procession',
        'second form: solemn entrance',
        'third form: simple entrance',
        'blessing and procession of palms',
        'conmemoración de la entrada',
        'procissão de ramos',
        'procissão dos ramos',
        "commemorazione dell'ingresso",
        "commémoration de l'entrée",
        'gedenken des einzugs',
        // Candlemas procession forms
        'blessing of candles and procession',
        'bênção das velas',
        'bendición de las candelas',
      ],
    ],
    ['mass', ['at the mass', 'en la misa', 'na missa', 'alla messa', 'à la messe', 'in der messe']],
  ],
  'chrism-mass': [
    [
      'renewalOfPriestlyPromises',
      [
        'renewal of priestly promises',
        'renovación de las promesas',
        'renovação das promessas sacerdotais',
        'rinnovazione delle promesse',
        'renouvellement des engagements',
        'erneuerung der priesterlichen versprechen',
      ],
    ],
    [
      'blessingOfTheOils',
      [
        'blessing of the oil',
        'consecration of the chrism',
        'bendición de los óleos',
        'bênção dos óleos',
        'benedizione degli oli',
        'bénédiction des huiles',
        'ölweihe',
        'weihe des chrisams',
      ],
    ],
  ],
  'lords-supper': [
    [
      'washingOfFeet',
      [
        'washing of feet',
        'lavanda de los pies',
        'lava-pés',
        'lavanda dei piedi',
        'lavement des pieds',
        'fußwaschung',
        'mandatum',
      ],
    ],
    [
      'transferOfTheBlessedSacrament',
      [
        'transfer of the blessed sacrament',
        'translado del santísimo',
        'translação do santíssimo',
        'trasferimento del santissimo',
        'translation du saint-sacrement',
        'übertragung des allerheiligsten',
      ],
    ],
  ],
  'good-friday': [
    [
      'liturgyOfTheWord',
      [
        'first part: liturgy of the word',
        'primera parte: liturgia de la palabra',
        'primeira parte: liturgia da palavra',
        'prima parte: liturgia della parola',
        'première partie: liturgie de la parole',
        'erster teil: wortgottesdienst',
      ],
    ],
    [
      'adorationOfTheCross',
      [
        'second part: the adoration of the holy cross',
        'second part: adoration',
        'segunda parte: la adoración',
        'segunda parte: adoração',
        'seconda parte: adorazione',
        'deuxième partie: adoration',
        'zweiter teil: kreuzverehrung',
      ],
    ],
    [
      'holyCommunion',
      [
        'third part: holy communion',
        'tercera parte: sagrada comunión',
        'terceira parte: sagrada comunhão',
        'terza parte: santa comunione',
        'troisième partie: communion',
        'dritter teil: heilige kommunion',
      ],
    ],
  ],
  'easter-vigil': [
    [
      'serviceOfLight',
      [
        'first part: the service of light',
        'the solemn beginning of the vigil',
        'lucernarium',
        'primera parte: liturgia de la luz',
        'primeira parte: liturgia da luz',
        'prima parte: liturgia della luce',
        'première partie: liturgie de la lumière',
        'erster teil: lichtfeier',
      ],
    ],
    [
      'liturgyOfTheWord',
      [
        'second part: the liturgy of the word',
        'segunda parte: liturgia de la palabra',
        'segunda parte: liturgia da palavra',
        'seconda parte: liturgia della parola',
        'deuxième partie: liturgie de la parole',
        'zweiter teil: wortgottesdienst',
      ],
    ],
    [
      'baptismalLiturgy',
      [
        'third part: baptismal liturgy',
        'third part: the baptismal liturgy',
        'tercera parte: liturgia bautismal',
        'terceira parte: liturgia batismal',
        'terza parte: liturgia battesimale',
        'troisième partie: liturgie baptismale',
        'dritter teil: tauffeier',
      ],
    ],
    [
      'liturgyOfTheEucharist',
      [
        'fourth part: liturgy of the eucharist',
        'cuarta parte: liturgia eucarística',
        'quarta parte: liturgia eucarística',
        'quarta parte: liturgia eucaristica',
        'quatrième partie: liturgie eucharistique',
        'vierter teil: eucharistiefeier',
      ],
    ],
  ],
}

export function assignSectionToPart(structure: Structure, heading: Localized): string | undefined {
  const patterns = partPatterns[structure]
  if (!patterns) return undefined
  const haystack = Object.values(heading)
    .filter((h): h is string => Boolean(h))
    .map((h) => h.toLowerCase())
    .join(' | ')
  for (const [partKey, pats] of patterns) {
    for (const pat of pats) {
      if (haystack.includes(pat)) return partKey
    }
  }
  return undefined
}
