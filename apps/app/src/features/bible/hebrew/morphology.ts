import type { TFunction } from 'i18next'

import type { MorphFields } from './words'

// The grammarians' names for the verb forms, the same in every language.
// TEHMC's mood refines the imperfect where the form shows it.
function conjugation(fields: MorphFields): string | undefined {
  switch (fields.m) {
    case 'perfect':
      return 'qatal'
    case 'consecutivePerfect':
      return 'weqatal'
    case 'consecutiveImperfect':
      return 'wayyiqtol'
    case 'conjunctionImperfect':
      return 'weyiqtol'
    case 'imperfect':
      if (fields.md === 'jussive') return 'jussive'
      if (fields.md === 'cohortative') return 'cohortative'
      return 'yiqtol'
    case 'imperative':
      return 'imperative'
    case 'infinitive':
      return fields.st === 'absolute' ? 'infinitive absolute' : 'infinitive construct'
    case 'participle':
      return 'participle'
    case 'participlePassive':
      return 'passive participle'
    default:
      return undefined
  }
}

const personDigit: Record<string, string> = { first: '1', second: '2', third: '3' }
const genderLetter: Record<string, string> = { masculine: 'm', feminine: 'f', eitherGender: 'c' }
const numberLetter: Record<string, string> = { singular: 's', plural: 'p', dual: 'd' }

/** `qal` → `Qal`, `hithpael` → `Hithpael`: a stem's name is a proper name. */
export function stemName(stem: string) {
  return stem.slice(0, 1).toUpperCase() + stem.slice(1)
}

/**
 * The grammarians' parsing: "Qal wayyiqtol 3ms", "Hiphil participle ms".
 * Undefined for a word that is not a verb, whose plain words say it all.
 */
export function grammarTerms(fields: MorphFields): string | undefined {
  if (fields.f !== 'verb') return undefined
  const ending = [
    fields.p ? personDigit[fields.p] : '',
    fields.g ? genderLetter[fields.g] : '',
    fields.n ? numberLetter[fields.n] : '',
  ].join('')
  return [fields.s && stemName(fields.s), conjugation(fields), ending].filter(Boolean).join(' ')
}

/**
 * The parsing in plain words, for a reader with no Hebrew grammar: "Qal,
 * simple and active · consecutive imperfect · narrative past · third masculine
 * singular". The part of speech is not among them: the sheet sets it apart as
 * the line's label. TEHMC calls a wayyiqtol "past/present"; it is the form a
 * story is told in, so it says so.
 */
export function describeHebrew(fields: MorphFields, t: TFunction): string[] {
  const say = (group: string, value: string | undefined) =>
    value ? t(`bible.hebrewMorph.${group}.${value}`) : undefined
  const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ')
  const tense =
    fields.m === 'consecutiveImperfect' ? say('tense', 'narrativePast') : say('tense', fields.t)
  return [
    fields.s
      ? join(
          stemName(fields.s),
          t('bible.hebrewMorph.stemMeaning', {
            action: say('action', fields.a),
            voice: say('voice', fields.v),
          }),
        )
      : undefined,
    say('form', fields.m),
    tense,
    join(say('person', fields.p), say('gender', fields.g), say('number', fields.n)),
    say('state', fields.st),
  ].filter((part): part is string => Boolean(part))
}
