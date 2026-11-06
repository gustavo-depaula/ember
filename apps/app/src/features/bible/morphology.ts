import type { TFunction } from 'i18next'

/**
 * Robinson's parsing codes, as the Greek editions' word files carry them
 * (`V-AAI-3S`, `N-GSF`, `P-1NP`, `S-1SNSM`), read into their parts. The words
 * each part names are i18n keys under `bible.morph`, so a parsing is spelled
 * out in the reader's language.
 */
export type Parsing = {
  /** `noun`, `verb`, `article`, `conjunction`… */
  pos: string
  tense?: string
  voice?: string
  mood?: string
  person?: string
  case?: string
  number?: string
  gender?: string
  degree?: string
  /** For a possessive pronoun: whose — the possessor's person and number. */
  possessor?: { person: string; number: string }
}

const indeclinable: Record<string, string> = {
  ADV: 'adverb',
  CONJ: 'conjunction',
  COND: 'conditional',
  PRT: 'particle',
  PREP: 'preposition',
  INJ: 'interjection',
  ARAM: 'aramaic',
  HEB: 'hebrew',
}

const declined: Record<string, string> = {
  N: 'noun',
  A: 'adjective',
  T: 'article',
  P: 'personalPronoun',
  R: 'relativePronoun',
  C: 'reciprocalPronoun',
  D: 'demonstrativePronoun',
  K: 'correlativePronoun',
  I: 'interrogativePronoun',
  X: 'indefinitePronoun',
  Q: 'correlativePronoun',
  F: 'reflexivePronoun',
  S: 'possessivePronoun',
}

const tenses: Record<string, string> = {
  P: 'present',
  I: 'imperfect',
  F: 'future',
  A: 'aorist',
  R: 'perfect',
  L: 'pluperfect',
}

const voices: Record<string, string> = {
  A: 'active',
  M: 'middle',
  P: 'passive',
  E: 'middleOrPassive',
  D: 'middleDeponent',
  O: 'passiveDeponent',
  N: 'middleOrPassiveDeponent',
  Q: 'impersonalActive',
}

const moods: Record<string, string> = {
  I: 'indicative',
  S: 'subjunctive',
  O: 'optative',
  M: 'imperative',
  N: 'infinitive',
  P: 'participle',
  R: 'participle',
}

const cases: Record<string, string> = {
  N: 'nominative',
  G: 'genitive',
  D: 'dative',
  A: 'accusative',
  V: 'vocative',
}

const numbers: Record<string, string> = { S: 'singular', P: 'plural' }
const genders: Record<string, string> = { M: 'masculine', F: 'feminine', N: 'neuter' }
const persons: Record<string, string> = { '1': 'first', '2': 'second', '3': 'third' }
const degrees: Record<string, string> = { C: 'comparative', S: 'superlative' }

/** Case, number and gender, as `NSM`; the gender may be missing (`P-1NS`). */
function inflection(code: string) {
  return {
    case: cases[code[0]],
    number: numbers[code[1]],
    gender: genders[code[2]],
  }
}

function verb(rest: string[]): Parsing | undefined {
  // `2AAI`: a second aorist is an aorist, the 2 a matter of its form.
  const match = /^2?([PIFARL])([AMPEDONQX])([ISONMPR])$/.exec(rest[0] ?? '')
  if (!match) return undefined
  const [, tense, voice, mood] = match
  const parsing: Parsing = {
    pos: 'verb',
    tense: tenses[tense],
    voice: voices[voice],
    mood: moods[mood],
  }
  const ending = rest[1] ?? ''
  if (mood === 'P' || mood === 'R') return { ...parsing, ...inflection(ending) }
  if (mood === 'N') return parsing
  return { ...parsing, person: persons[ending[0]], number: numbers[ending[1]] }
}

/** A parsing code read into its parts; undefined for a code it cannot read. */
export function parseRobinson(code: string): Parsing | undefined {
  const parts = code.trim().toUpperCase().split('-')
  const [head, ...rest] = parts
  if (!head) return undefined
  if (head in indeclinable) {
    const degree = rest.find((part) => part in degrees)
    return { pos: indeclinable[head], degree: degree && degrees[degree] }
  }
  if (head === 'V') return verb(rest)
  const pos = declined[head]
  if (!pos) return undefined
  const [first = '', second = ''] = rest
  // Indeclinable nouns and numerals: a proper name (`N-PRI`), a letter (`N-LI`),
  // a cardinal number (`A-NUI`).
  if (/^(PRI|LI|OI|NUI)$/.test(first)) return { pos }
  if (head === 'S') {
    // `S-1SNSM`: the possessor's person and number, then the possession's case,
    // number and gender.
    return {
      pos,
      possessor: { person: persons[first[0]], number: numbers[first[1]] },
      ...inflection(first.slice(2)),
    }
  }
  if (/^[123]/.test(first)) {
    // Personal and reflexive pronouns name a person before the case: `P-1NS`, `F-3ASM`.
    return { pos, person: persons[first[0]], ...inflection(first.slice(1)) }
  }
  return { pos, ...inflection(first), degree: degrees[second] }
}

/**
 * A parsing spelled out, as a grammar writes it: "aorist active indicative,
 * 3rd person singular"; "noun, genitive plural feminine". `t` is i18next's.
 */
export function describeParsing(
  parsing: Parsing,
  t: TFunction,
  { pos = true }: { pos?: boolean } = {},
) {
  const say = (group: string, value: string | undefined) =>
    value ? t(`bible.morph.${group}.${value}`) : undefined
  const words = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ')
  const verbal = words(
    say('tense', parsing.tense),
    say('voice', parsing.voice),
    say('mood', parsing.mood),
  )
  const possessor =
    parsing.possessor &&
    t('bible.morph.possessor', {
      person: say('person', parsing.possessor.person),
      number: say('number', parsing.possessor.number),
    })
  return [
    !pos || parsing.pos === 'verb' ? undefined : say('pos', parsing.pos),
    verbal,
    words(say('person', parsing.person), parsing.case ? undefined : say('number', parsing.number)),
    words(
      say('case', parsing.case),
      parsing.case ? say('number', parsing.number) : undefined,
      say('gender', parsing.gender),
    ),
    say('degree', parsing.degree),
    possessor,
  ]
    .filter(Boolean)
    .join(', ')
}
