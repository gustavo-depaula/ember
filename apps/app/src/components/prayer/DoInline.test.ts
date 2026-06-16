import { describe, expect, it } from 'vitest'
import { parseDoInline } from './DoInline'

describe('parseDoInline', () => {
  it('splits a verse number from the verse body', () => {
    expect(parseDoInline('/:24:1:/ Ad te, Dómine, levávi ánimam meam:')).toEqual([
      { kind: 'mark', text: '24:1' },
      { kind: 'body', text: ' Ad te, Dómine, levávi ánimam meam:' },
    ])
  })

  it('marks the mediant asterisk distinctly from body text', () => {
    expect(parseDoInline('viam iustificatiónum tuárum: * et exquíram eam semper.')).toEqual([
      { kind: 'body', text: 'viam iustificatiónum tuárum: ' },
      { kind: 'mediant', text: '*' },
      { kind: 'body', text: ' et exquíram eam semper.' },
    ])
  })

  it('treats Hebrew-letter headings and inline directions as marks', () => {
    expect(parseDoInline('/:(He):/ Legem pone mihi')).toEqual([
      { kind: 'mark', text: '(He)' },
      { kind: 'body', text: ' Legem pone mihi' },
    ])
    expect(parseDoInline('/:(genuflectitur):/')).toEqual([
      { kind: 'mark', text: '(genuflectitur)' },
    ])
  })

  it('handles flexa and genuflection-cross pointing marks', () => {
    expect(parseDoInline('Veníte adorémus †')).toEqual([
      { kind: 'body', text: 'Veníte adorémus ' },
      { kind: 'point', text: '†' },
    ])
    expect(parseDoInline('‡ et procidámus')).toEqual([
      { kind: 'point', text: '‡' },
      { kind: 'body', text: ' et procidámus' },
    ])
  })

  it('extracts small caps', () => {
    expect(parseDoInline('%Dóminus% regnávit')).toEqual([
      { kind: 'smallcaps', text: 'Dóminus' },
      { kind: 'body', text: ' regnávit' },
    ])
  })

  it('returns plain text as a single body run', () => {
    expect(parseDoInline('Deo grátias.')).toEqual([{ kind: 'body', text: 'Deo grátias.' }])
  })

  it('combines a verse number, a Hebrew letter and a mediant in one line', () => {
    expect(parseDoInline('/:118:1:/ /:(Aleph):/ Beáti immaculáti: * qui ámbulant.')).toEqual([
      { kind: 'mark', text: '118:1' },
      { kind: 'body', text: ' ' },
      { kind: 'mark', text: '(Aleph)' },
      { kind: 'body', text: ' Beáti immaculáti: ' },
      { kind: 'mediant', text: '*' },
      { kind: 'body', text: ' qui ámbulant.' },
    ])
  })
})
