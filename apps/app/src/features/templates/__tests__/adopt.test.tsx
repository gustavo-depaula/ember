import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import type { PlanOfLifeTemplateManifest } from '@/content/manifestTypes'
import { useEventStore } from '@/db/events'
import { createPracticeWithSlot } from '@/db/repositories'
import { parseSchedule } from '@/features/plan-of-life/schedule'
import { renderApp } from '@/test/renderApp'
import { AdoptSheet } from '../AdoptSheet'
import { adoptTemplate } from '../adopt'

async function template(id: string) {
  const entry = getEntry(`plan-of-life-template/${id}`)
  if (!entry) throw new Error(`no template ${id}`)
  return ensureManifestBody<PlanOfLifeTemplateManifest>(entry.hash)
}

const slots = () => [...useEventStore.getState().slots.values()]
const slotsOf = (practiceId: string) =>
  slots()
    .filter((s) => s.practice_id === practiceId)
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))

describe('adoptTemplate', () => {
  // Boots the real catalog and an empty plan; each test starts from nothing.
  beforeEach(async () => {
    await renderApp({
      route: '/',
      routes: [{ pattern: '/', loader: async () => ({ default: () => null }) }],
    })
  }, 30_000)

  it('adopts every norm of the Opus Dei plan at the template’s hours', async () => {
    const opusDei = await template('opus-dei')
    const { slotKeys } = await adoptTemplate(opusDei)

    expect(slotKeys).toHaveLength(opusDei.practices.length)
    expect(slots()).toHaveLength(14)
    // One practice listed twice keeps two times.
    expect(slotsOf('practice/mental-prayer-opus-dei').map((s) => s.time)).toEqual([
      '07:30',
      '19:00',
    ])
    const confession = slotsOf('practice/confession')[0]
    expect(confession.tier).toBe('essential')
    expect(parseSchedule(confession.schedule).type).not.toBe('daily')
    expect(slots().every((s) => s.enabled === 1 && s.time)).toBe(true)
  }, 30_000)

  it('adopts the Beginner’s Minimum with its tiers, confession essential and monthly', async () => {
    await adoptTemplate(await template('beginner-minimum'))

    expect(slots()).toHaveLength(8)
    expect(slotsOf('practice/angelus').map((s) => s.time)).toEqual(['12:00', '18:00'])
    expect(slotsOf('practice/rosary')[0]).toMatchObject({ tier: 'ideal', time: '20:00' })
    const [confession] = slotsOf('practice/confession')
    expect(confession.tier).toBe('essential')
    expect(parseSchedule(confession.schedule)).toMatchObject({
      type: 'nth-weekday',
      n: [1],
      day: 6,
    })
  }, 30_000)

  it('adds nothing the second time', async () => {
    const beginner = await template('beginner-minimum')
    await adoptTemplate(beginner)
    const again = await adoptTemplate(beginner)

    expect(again.slotKeys).toEqual([])
    expect(slots()).toHaveLength(8)
  }, 30_000)

  it('switches a practice already kept to the tradition’s form instead of adding it again', async () => {
    await createPracticeWithSlot({ id: 'practice/morning-offering' }, { time: '06:00' })

    await adoptTemplate(await template('opus-dei'))

    expect(slotsOf('practice/morning-offering-opus-dei')).toEqual([])
    const [offering] = slotsOf('practice/morning-offering')
    expect(offering.time).toBe('06:00')
    expect(
      useEventStore.getState().practices.get('practice/morning-offering')?.active_variant,
    ).toBe('practice/morning-offering-opus-dei')
  }, 30_000)

  it('adopts only the chosen rows', async () => {
    const beginner = await template('beginner-minimum')
    await adoptTemplate(beginner, new Set([0, 5]))

    expect(
      slots()
        .map((s) => s.practice_id)
        .sort(),
    ).toEqual(['practice/examination-of-conscience', 'practice/morning-offering'])
  }, 30_000)
})

describe('AdoptSheet', () => {
  it('adopts the checked rows through the same function', async () => {
    const onAdopted = vi.fn()
    const { screen, user } = await renderApp({
      route: '/sheet',
      routes: [
        {
          pattern: '/sheet',
          // Loaded once the app has booted, so the catalog is there to read.
          loader: async () => {
            const beginner = await template('beginner-minimum')
            return {
              default: () => (
                <AdoptSheet template={beginner} open onClose={() => {}} onAdopted={onAdopted} />
              ),
            }
          },
        },
      ],
    })

    await user.click(await screen.findByRole('button', { name: 'Add 8 practices' }))

    await expect.poll(() => onAdopted.mock.calls.length).toBe(1)
    expect(slots()).toHaveLength(8)
  }, 30_000)
})
