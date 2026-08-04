import { describe, expect, it } from 'vitest'

import {
  type FormationOptionId,
  formationOptions,
  recommendFormation,
  recommendTemplates,
} from '../recommendations'

// The bare slugs the corpus actually ships under content/plan-of-life-templates/.
const shippedTemplates = new Set([
  'beginner-minimum',
  'benedictine',
  'byzantine',
  'carmelite',
  'cursillo',
  'divine-mercy',
  'dominican',
  'franciscan',
  'ignatian',
  'legion-of-mary',
  'little-way',
  'marian-consecration',
  'opus-dei',
  'sacred-heart',
  'salesian',
  'sulpician',
])

describe('recommendTemplates', () => {
  it('defaults a blank profile to the beginner minimum', () => {
    expect(recommendTemplates({}).primary).toBe('beginner-minimum')
  })

  it('leads beginners with the minimum and richer rules as prayer deepens', () => {
    expect(recommendTemplates({ prayerStage: 'new' }).primary).toBe('beginner-minimum')
    expect(recommendTemplates({ prayerStage: 'some' }).primary).toBe('salesian')
    expect(recommendTemplates({ prayerStage: 'experienced' }).primary).toBe('ignatian')
  })

  it('offers the fullest rule only when there is time for it', () => {
    expect(recommendTemplates({ prayerStage: 'experienced', time: 'long' }).primary).toBe(
      'opus-dei',
    )
    expect(recommendTemplates({ prayerStage: 'experienced', time: 'short' }).primary).toBe(
      'ignatian',
    )
  })

  it('always keeps the beginner minimum reachable for the non-beginner', () => {
    for (const prayerStage of ['some', 'experienced'] as const) {
      const rec = recommendTemplates({ prayerStage })
      expect(rec.alsoConsider).toContain('beginner-minimum')
    }
  })

  it('never suggests a template the corpus does not ship', () => {
    const stages = ['new', 'some', 'experienced'] as const
    const times = ['short', 'medium', 'long'] as const
    for (const prayerStage of stages) {
      for (const time of times) {
        const rec = recommendTemplates({ prayerStage, time })
        for (const id of [rec.primary, ...rec.alsoConsider]) {
          expect(shippedTemplates, `${prayerStage}/${time} → ${id}`).toContain(id)
        }
      }
    }
  })

  it('does not repeat the primary among the alternatives', () => {
    const rec = recommendTemplates({ prayerStage: 'experienced', time: 'long' })
    expect(rec.alsoConsider).not.toContain(rec.primary)
  })
})

describe('recommendFormation', () => {
  it('nudges Morrow by default and the Compendium once formed', () => {
    expect(recommendFormation({})).toBe('catechetical-formation')
    expect(recommendFormation({ formationStage: 'new' })).toBe('catechetical-formation')
    expect(recommendFormation({ formationStage: 'formed' })).toBe('compendium')
  })

  it('recommends an id that is actually offered', () => {
    const offered = new Set<FormationOptionId>(formationOptions.map((o) => o.id))
    for (const formationStage of ['new', 'some', 'formed'] as const) {
      expect(offered).toContain(recommendFormation({ formationStage }))
    }
  })
})

describe('formationOptions', () => {
  it('addresses the seeded program by its kind-prefixed corpus id', () => {
    // `seedPractices()` creates practices from the corpus manifest id, which the
    // corpus build kind-prefixes. Enabling a seeded slot with the bare id
    // silently matches nothing, so the enrolment would no-op.
    const morrow = formationOptions.find((o) => o.id === 'catechetical-formation')
    expect(morrow).toMatchObject({
      kind: 'program-enroll',
      practiceId: 'practice/catechetical-formation',
    })
  })

  it('has one entry per option id, with no duplicates', () => {
    const ids = formationOptions.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('points every book option at a prefixed book ref', () => {
    for (const opt of formationOptions) {
      if (opt.kind === 'book') expect(opt.bookId).toMatch(/^book\//)
    }
  })
})
