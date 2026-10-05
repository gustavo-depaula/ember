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

test('the 1962 Mass and the Breviary assemble from the corpus', async () => {
  const mass = await renderPractice('mass-vetus-ordo', 'en-US', { date, parallelLatin: true })
  const text = JSON.stringify(mass?.primitives)
  expect(text).toContain('Introíbo ad altáre Dei')
  expect(text).toContain('I will go in to the altar of God')
})
