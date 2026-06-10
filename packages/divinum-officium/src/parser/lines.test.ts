import { describe, expect, it } from 'vitest'
import { tokenizeLine } from './lines'

describe('tokenizeLine', () => {
  it('tokenizes inclusions', () => {
    expect(tokenizeLine('@Tempora/Pent03-0r')).toEqual({
      kind: 'inclusion',
      file: 'Tempora/Pent03-0r',
      section: '',
      substitutions: '',
    })
    expect(tokenizeLine('@Sancti/12-25:Capitulum Laudes')).toEqual({
      kind: 'inclusion',
      file: 'Sancti/12-25',
      section: 'Capitulum Laudes',
      substitutions: '',
    })
    expect(tokenizeLine('@:Ant Vespera 3:s/;;.*//g')).toEqual({
      kind: 'inclusion',
      file: '',
      section: 'Ant Vespera 3',
      substitutions: 's/;;.*//g',
    })
    expect(tokenizeLine('@')).toEqual({
      kind: 'inclusion',
      file: '',
      section: '',
      substitutions: '',
    })
  })

  it('tokenizes macros and calls', () => {
    expect(tokenizeLine('$Per Dominum')).toEqual({ kind: 'macro', name: 'Per Dominum' })
    expect(tokenizeLine('$rubrica Secreto a Laudibus')).toEqual({
      kind: 'macro',
      name: 'rubrica Secreto a Laudibus',
    })
    expect(tokenizeLine('&Gloria')).toEqual({ kind: 'call', name: 'Gloria', args: '' })
    expect(tokenizeLine('&psalm(66)')).toEqual({ kind: 'call', name: 'psalm', args: '66' })
  })

  it('tokenizes conditionals with their sequel', () => {
    expect(tokenizeLine('(rubrica altovadensis) #Commemoratio officii parvi B.M.V.')).toMatchObject(
      {
        kind: 'conditional',
        directive: { expr: 'rubrica altovadensis', sequel: '#Commemoratio officii parvi B.M.V.' },
      },
    )
  })

  it('tokenizes rubrics, blanks, and text', () => {
    expect(tokenizeLine('!Is 9:6')).toEqual({ kind: 'rubric', text: 'Is 9:6' })
    expect(tokenizeLine('')).toEqual({ kind: 'blank' })
    expect(tokenizeLine('_')).toEqual({ kind: 'blank' })
    expect(tokenizeLine('v. Pater noster, qui es in cælis')).toEqual({
      kind: 'text',
      text: 'v. Pater noster, qui es in cælis',
    })
    expect(tokenizeLine('Dixit Dóminus * Dómino meo: Sede a dextris meis.;;109')).toMatchObject({
      kind: 'text',
    })
  })

  it('keeps escaped lines as text with the tilde intact', () => {
    // The engine strips the leading ~ when assembling (process_conditional_lines).
    expect(tokenizeLine('~(rubrica 1960)')).toEqual({ kind: 'text', text: '~(rubrica 1960)' })
  })
})
