import type { Church } from '@ember/api'
import { describe, expect, it } from 'vitest'
import {
  changeState,
  type LirioRecord,
  lirioChanges,
  toCreated,
  toRecordChange,
} from '../src/lib/lirio'

// A church of ours as the import left it: Sunday Masses, a weekday rule, a first-Friday Mass.
const ours = {
  id: 'senhora-santana-serrinha-ba',
  name: 'Senhora Santana',
  longName: 'Catedral Senhora Santana',
  phoneE164: '+557532613443',
  links: [{ kind: 'instagram', url: 'https://www.instagram.com/catedraldeserrinha/' }],
  services: [
    { id: 'a', kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '07:00' },
    { id: 'b', kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00' },
    { id: 'c', kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE', startTime: '19:30' },
    { id: 'd', kind: 'mass', rrule: 'FREQ=MONTHLY;BYDAY=1FR', startTime: '19:00' },
  ],
} as unknown as Church

const his = (over: Partial<LirioRecord>): LirioRecord => ({
  id: 1813,
  nome: 'Catedral Senhora Santana',
  telefones: ['(75) 3261-3443'],
  instagram: 'catedraldeserrinha',
  missas: { DOM: ['07:00', '09:00'], SEG: ['19:30'], TER: ['19:30'], QUA: ['19:30'] },
  ...over,
})

describe('what Lírio changed', () => {
  it('reads a reformatted phone or a handle written as a URL as no change', () => {
    const after = his({
      telefones: ['+55 75 3261-3443'],
      instagram: 'https://www.instagram.com/catedraldeserrinha/',
    })
    expect(lirioChanges(his({}), after)).toEqual([])
  })

  it('takes a removed time off our weekly rule and leaves the first Friday alone', () => {
    const after = his({ missas: { DOM: ['07:00'], SEG: ['19:30'], QUA: ['19:30'] } })
    const changes = lirioChanges(his({}), after)
    expect(changes.map((c) => c.key)).toEqual(['mass-SU 09:00', 'mass-TU 19:30'])
    expect(changes.map((c) => changeState(ours, c))).toEqual(['ready', 'ready'])

    const services = toRecordChange(ours, changes).services
    expect(services?.map((s) => `${s.rrule} ${s.startTime}`)).toEqual([
      'FREQ=WEEKLY;BYDAY=SU 07:00',
      'FREQ=WEEKLY;BYDAY=MO,WE 19:30',
      'FREQ=MONTHLY;BYDAY=1FR 19:00',
    ])
  })

  it('never takes his weekly Friday for our first-Friday Mass', () => {
    const after = his({ missas: { ...his({}).missas, SEX: ['19:00'] } })
    const [change] = lirioChanges(his({}), after)
    expect(changeState(ours, change)).toBe('narrower')
  })

  it('joins an added day to our rule at the same time', () => {
    const after = his({ missas: { ...his({}).missas, QUI: ['19:30'] } })
    const services = toRecordChange(ours, lirioChanges(his({}), after)).services
    expect(services?.find((s) => s.id === 'c')?.rrule).toBe('FREQ=WEEKLY;BYDAY=MO,TU,WE,TH')
  })

  it('carries a renamed church to our long name and a new handle to the link', () => {
    const after = his({ nome: 'Catedral de Sant’Ana', instagram: '@catedralsantana' })
    const change = toRecordChange(ours, lirioChanges(his({}), after))
    expect(change.fields).toEqual({ longName: 'Catedral de Sant’Ana' })
    expect(change.links).toEqual([
      { kind: 'instagram', url: 'https://www.instagram.com/catedralsantana/' },
    ])
  })

  it('makes a church he added a church of its own, and needs it placed first', () => {
    const record = his({ lat: -11.66, lng: -39.0, cidade: 'Serrinha', uf: 'BA' })
    expect(toCreated(record)).toMatchObject({
      standalone: true,
      city: 'Serrinha',
      region: 'BA',
      phoneE164: '+557532613443',
      services: [
        { rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '07:00' },
        { rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00' },
        { rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE', startTime: '19:30' },
      ],
    })
    expect(toCreated(his({}))).toBeUndefined()
  })
})
