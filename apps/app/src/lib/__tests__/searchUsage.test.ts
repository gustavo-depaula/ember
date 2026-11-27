import { describe, expect, it } from 'vitest'
import { cleanQuery, searchCounter } from '../searchUsage'
import type { Counts } from '../usage'

function counted() {
  const searches: Counts['search'][] = []
  return { searches, counter: searchCounter('corpus', (props) => searches.push(props)) }
}
const shown = (results: number, ...top: string[]) => ({ results, top })

describe('searchCounter', () => {
  it('counts a word typed through its prefixes once, as it was settled', () => {
    const { searches, counter } = counted()
    counter.settle('ro', shown(400, 'practice/rosary'))
    counter.settle('Rosá', shown(3, 'practice/rosary'))
    counter.settle('rosario', shown(2, 'practice/rosary', 'book/rosary'))
    counter.end()
    expect(searches).toEqual([
      { scope: 'corpus', q: 'rosario', results: '2', top: 'practice/rosary,book/rosary' },
    ])
  })

  it('counts a typo as the word it was corrected to', () => {
    const { searches, counter } = counted()
    counter.settle('rosarion', shown(0))
    counter.settle('rosario', shown(2, 'practice/rosary'))
    counter.end()
    expect(searches.map((s) => s.q)).toEqual(['rosario'])
  })

  it('counts one search and the next, apart', () => {
    const { searches, counter } = counted()
    counter.settle('angelus', shown(1, 'practice/angelus'))
    counter.settle('anima christi', shown(1, 'practice/anima-christi'))
    counter.end()
    expect(searches.map((s) => s.q)).toEqual(['angelus', 'anima christi'])
  })

  it('folds what was opened into the search it came from', () => {
    const { searches, counter } = counted()
    counter.settle('novena', shown(12, 'collection/novenario'))
    counter.open('novena', shown(12, 'collection/novenario'), 'practice/pentecost-novena', 3)
    counter.end()
    expect(searches).toEqual([
      {
        scope: 'corpus',
        q: 'novena',
        results: '12',
        top: 'collection/novenario',
        opened: 'practice/pentecost-novena',
        at: '3',
      },
    ])
  })

  it('counts a search that found nothing', () => {
    const { searches, counter } = counted()
    counter.settle('xyzzy', shown(0))
    counter.end()
    expect(searches).toEqual([{ scope: 'corpus', q: 'xyzzy', results: '0' }])
  })
})

describe('cleanQuery', () => {
  it('keeps words, folded as search folds them', () => {
    expect(cleanQuery('  Nossa   Senhora  ')).toBe('nossa senhora')
    expect(cleanQuery('Missal 1962')).toBe('missal 1962')
  })

  it('drops what is too short or looks personal', () => {
    expect(cleanQuery('a')).toBeUndefined()
    expect(cleanQuery('maria@example.com')).toBeUndefined()
    expect(cleanQuery('11 98765-4321')).toBeUndefined()
    expect(cleanQuery('01310-100')).toBeUndefined()
  })
})
