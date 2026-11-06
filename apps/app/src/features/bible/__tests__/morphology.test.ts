import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'

import { describeParsing, type Parsing, parseRobinson } from '../morphology'

describe('parseRobinson', () => {
  it('reads a finite verb', () => {
    // ἦν, John 1:1
    expect(parseRobinson('V-IAI-3S')).toEqual({
      pos: 'verb',
      tense: 'imperfect',
      voice: 'active',
      mood: 'indicative',
      person: 'third',
      number: 'singular',
    })
  })

  it('reads a second aorist as an aorist', () => {
    // ἐγένετο, John 1:3
    expect(parseRobinson('V-2ADI-3S')).toMatchObject({ tense: 'aorist', voice: 'middleDeponent' })
  })

  it('reads a participle by its case, number and gender, and an infinitive by nothing more', () => {
    expect(parseRobinson('V-PAP-NSM')).toMatchObject({
      mood: 'participle',
      case: 'nominative',
      number: 'singular',
      gender: 'masculine',
    })
    expect(parseRobinson('V-AAN')).toEqual({
      pos: 'verb',
      tense: 'aorist',
      voice: 'active',
      mood: 'infinitive',
    })
  })

  it('reads nouns, articles and adjectives with their degree', () => {
    expect(parseRobinson('N-NSM')).toEqual({
      pos: 'noun',
      case: 'nominative',
      number: 'singular',
      gender: 'masculine',
      degree: undefined,
    })
    expect(parseRobinson('T-GPF')).toMatchObject({ pos: 'article', case: 'genitive' })
    expect(parseRobinson('A-NSM-C')).toMatchObject({ pos: 'adjective', degree: 'comparative' })
  })

  it('reads the person a personal pronoun carries before its case', () => {
    expect(parseRobinson('P-1NS')).toEqual({
      pos: 'personalPronoun',
      person: 'first',
      case: 'nominative',
      number: 'singular',
      gender: undefined,
    })
    expect(parseRobinson('F-3ASM')).toMatchObject({ person: 'third', case: 'accusative' })
  })

  it('reads whose a possessive pronoun says a thing is', () => {
    expect(parseRobinson('S-1SNSM')).toMatchObject({
      pos: 'possessivePronoun',
      possessor: { person: 'first', number: 'singular' },
      case: 'nominative',
      gender: 'masculine',
    })
  })

  it('reads indeclinables, proper names and numerals', () => {
    expect(parseRobinson('CONJ')).toEqual({ pos: 'conjunction', degree: undefined })
    expect(parseRobinson('ADV-C')).toEqual({ pos: 'adverb', degree: 'comparative' })
    expect(parseRobinson('N-PRI')).toEqual({ pos: 'noun' })
    expect(parseRobinson('A-NUI')).toEqual({ pos: 'adjective' })
  })

  it('reads nothing into a code it does not know', () => {
    expect(parseRobinson('')).toBeUndefined()
    expect(parseRobinson('Z-NSM')).toBeUndefined()
    expect(parseRobinson('V-ZZZ-3S')).toBeUndefined()
  })
})

describe('describeParsing', () => {
  const say = (key: string, options?: object) =>
    key === 'bible.morph.possessor'
      ? `${(options as { person: string }).person} ${(options as { number: string }).number} possessor`
      : (key.split('.').at(-1) as string)
  const t = say as unknown as TFunction

  it('writes a verb as a grammar does', () => {
    expect(describeParsing(parseRobinson('V-AAI-3S') as Parsing, t)).toBe(
      'aorist active indicative, third singular',
    )
    expect(describeParsing(parseRobinson('V-PAP-GPM') as Parsing, t)).toBe(
      'present active participle, genitive plural masculine',
    )
  })

  it('names the part of speech of anything not a verb', () => {
    expect(describeParsing(parseRobinson('N-DSF') as Parsing, t)).toBe(
      'noun, dative singular feminine',
    )
    expect(describeParsing(parseRobinson('P-1GS') as Parsing, t)).toBe(
      'personalPronoun, first, genitive singular',
    )
    expect(describeParsing(parseRobinson('S-1SNSM') as Parsing, t)).toBe(
      'possessivePronoun, nominative singular masculine, first singular possessor',
    )
  })
})
