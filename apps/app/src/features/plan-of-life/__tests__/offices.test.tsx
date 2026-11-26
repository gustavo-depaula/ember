import { describe, expect, it } from 'vitest'

import { useEventStore } from '@/db/events'
import { updateSlots } from '@/db/repositories'
import { renderApp } from '@/test/renderApp'

import { planSlots } from '../due'
import { setOfficeHours } from '../offices'

const liturgy = 'practice/liturgy-of-the-hours'
const hoursKept = () =>
  planSlots(useEventStore.getState())
    .filter((s) => s.practice_id === liturgy)
    .map((s) => ({ id: s.id, hour: Object.values(s.pins ?? {})[0], time: s.time }))

describe('choosing the hours of an Office', () => {
  it('adds the hours chosen, each at its own time', async () => {
    await renderApp({ route: '/', routes: [] })
    await setOfficeHours(liturgy, ['lauds', 'vespers', 'compline'])

    expect(hoursKept().map(({ hour, time }) => [hour, time])).toEqual([
      ['lauds', '06:00'],
      ['vespers', '18:00'],
      ['compline', '21:00'],
    ])
  }, 30_000)

  it('changing them keeps the hours still chosen, with the time given them', async () => {
    await renderApp({ route: '/', routes: [] })
    await setOfficeHours(liturgy, ['lauds', 'vespers', 'compline'])
    const lauds = hoursKept().find((h) => h.hour === 'lauds')
    await updateSlots([{ id: lauds?.id ?? '', data: { time: '06:30' } }])

    await setOfficeHours(liturgy, ['lauds', 'compline', 'sext'])

    const after = hoursKept()
    expect(after.map((h) => h.hour).sort()).toEqual(['compline', 'lauds', 'sext'])
    expect(after.find((h) => h.hour === 'lauds')).toEqual({ ...lauds, time: '06:30' })
  }, 30_000)
})
