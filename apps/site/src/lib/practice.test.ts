import { expect, test } from 'vitest'
import type { Primitive } from '@/content/primitives'
import { appOnlyMarker } from '~/platform/sourceRegistry'
import { renderPractice } from './practice'

const date = new Date(2026, 9, 5)

type Container = Extract<Primitive, { type: 'container' }>

function selectOf(primitives: Primitive[]) {
  const select = primitives.find(
    (p): p is Container => p.type === 'container' && p.behavior.kind === 'select',
  )
  if (select?.behavior.kind !== 'select') throw new Error('no select')
  return select.behavior
}

test('a static page carries every branch of a choice, not only the one the app opens on', async () => {
  const rosary = await renderPractice('rosary', 'en-US', { date })
  const mysteries = selectOf(rosary?.primitives ?? [])
  expect(mysteries.options.map((o) => o.id)).toEqual([
    'joyful',
    'sorrowful',
    'glorious',
    'luminous',
  ])
  for (const option of mysteries.options) {
    expect(option.children.length).toBeGreaterThan(10)
    expect(option.rawSections).toBeUndefined()
  }
})

test('the page language is the primary text and Latin rides beside it', async () => {
  const prayer = await renderPractice('hail-mary', 'pt-BR', { date, parallelLatin: true })
  expect(prayer?.primitives[0]).toMatchObject({
    type: 'text',
    text: {
      primary: expect.stringMatching(/^Ave Maria, cheia de graça/),
      secondary: expect.stringMatching(/^Ave María, grátia plena/),
    },
  })
})

test('text the app fetches from its publisher is never built into a page', async () => {
  const hours = await renderPractice('liturgy-of-the-hours', 'en-US', { date })
  const hour = selectOf(hours?.primitives ?? [])
  expect(hour.options.length).toBeGreaterThan(3)
  for (const option of hour.options) {
    expect(option.children).toEqual([
      { type: 'link', text: { primary: appOnlyMarker }, href: appOnlyMarker },
    ])
  }
})

test('the Brazilian Liturgy of the Hours assembles from the corpus', async () => {
  const hours = await renderPractice('liturgy-of-the-hours', 'pt-BR', { date })
  const hour = selectOf(hours?.primitives ?? [])
  expect(hour.options).toHaveLength(7)
  const text = JSON.stringify(hour.options.find((o) => o.id === 'lauds')?.children)
  expect(text).toContain('Vinde, ó Deus, em meu auxílio.')
  expect(text).not.toContain(appOnlyMarker)
})

test('the 1962 Mass and the Breviary assemble from the corpus', async () => {
  const mass = await renderPractice('mass-vetus-ordo', 'en-US', { date, parallelLatin: true })
  const text = JSON.stringify(mass?.primitives)
  expect(text).toContain('Introíbo ad altáre Dei')
  expect(text).toContain('I will go in to the altar of God')
})

test("the Ember Days read the day's first collect and Gospel from the 1962 missal", async () => {
  // Ember Saturday of Advent, whose Mass has five lessons before the Gospel.
  const saturday = await renderPractice('ember-days', 'en-US', {
    date: new Date(2026, 11, 19),
    parallelLatin: true,
  })
  const text = JSON.stringify(saturday?.primitives)
  expect(text).toContain('Advent Ember Days: Wednesday, December 16')
  expect(text).toContain('Deus, qui cónspicis, quia ex nostra pravitáte afflígimur')
  expect(text).toContain('Sequéntia ++ sancti Evangélii secundum Lucam')
  expect(text).not.toContain('Léctio Isaíæ Prophétæ')

  const otherDay = await renderPractice('ember-days', 'en-US', { date })
  const plain = JSON.stringify(otherDay?.primitives)
  expect(plain).toContain('Advent Ember Days: Wednesday, December 16')
  expect(plain).not.toContain('Gospel')
})
