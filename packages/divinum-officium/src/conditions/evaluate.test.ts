import { describe, expect, it } from 'vitest'
import { defaultContext } from './context'
import {
  parseConditional,
  processConditionalLines,
  scopeChunk,
  scopeLine,
  scopeNest,
  scopeNull,
  vero,
} from './evaluate'

const ctx1960 = defaultContext({ version: 'Rubrics 1960 - 1960' })
const ctxDA = defaultContext({ version: 'Divino Afflatu - 1954' })
const ctxMonastic = defaultContext({ version: 'Monastic - 1963' })
const ctxTrident = defaultContext({ version: 'Tridentine - 1570' })

describe('vero', () => {
  it('is true for the empty condition', () => {
    expect(vero('', ctx1960)).toBe(true)
    expect(vero('   ', ctx1960)).toBe(true)
  })

  it('matches rubrica by regex against the version string', () => {
    expect(vero('rubrica 1960', ctx1960)).toBe(true)
    expect(vero('rubrica 1960', ctxDA)).toBe(false)
    expect(vero('rubrica 196', ctx1960)).toBe(true)
    expect(vero('rubrica ^Trident', ctxTrident)).toBe(true)
    expect(vero('rubrica ^Trident', ctx1960)).toBe(false)
  })

  it('supports named predicates', () => {
    expect(vero('rubrica monastica', ctxMonastic)).toBe(true)
    expect(vero('rubrica monastica', ctx1960)).toBe(false)
    expect(vero('rubrica tridentina', ctxTrident)).toBe(true)
  })

  it('negates with nisi until the next aut', () => {
    expect(vero('nisi rubrica 1960', ctx1960)).toBe(false)
    expect(vero('nisi rubrica 1960', ctxDA)).toBe(true)
    expect(vero('nisi rubrica monastica nisi rubrica 1960', ctxDA)).toBe(true)
    // false nisi-branch, rescued by an aut alternative
    expect(vero('nisi rubrica 1960 aut rubrica 196', ctx1960)).toBe(true)
  })

  it('combines with et (and) and aut (or)', () => {
    const ctx = defaultContext({ version: 'Rubrics 1960 - 1960', dayofweek: 2 })
    expect(vero('rubrica 1960 et feria 3', ctx)).toBe(true)
    expect(vero('rubrica 1960 et feria 4', ctx)).toBe(false)
    expect(vero('feria 4 aut feria 3', ctx)).toBe(true)
    expect(vero('feria 4 aut feria 5', ctx)).toBe(false)
  })

  it('defaults the subject to tempore', () => {
    const advent = defaultContext({ dayname: ['Adv2', '', ''] })
    expect(vero('Adventus', advent)).toBe(true)
    expect(vero('paschali', advent)).toBe(false)
    const easterWeek = defaultContext({ dayname: ['Pasc0', '', ''] })
    expect(vero('paschali', easterWeek)).toBe(true)
  })

  it('evaluates die / feria / mense / ad subjects', () => {
    const ctx = defaultContext({
      month: 12,
      day: 25,
      winner: 'Sancti/12-25',
      dayofweek: 4,
      hora: 'Vespera',
    })
    expect(vero('die Nativitatis', ctx)).toBe(true)
    expect(vero('feria 5', ctx)).toBe(true)
    expect(vero('mense 12', ctx)).toBe(true)
    expect(vero('ad Vespera', ctx)).toBe(true)
    expect(vero('ad missam', { ...ctx, missa: true })).toBe(true)
  })
})

describe('parseConditional', () => {
  const pc = (stop: string, expr: string, scope: string) =>
    parseConditional(stop, expr, scope, ctx1960)

  it('computes stopword strength', () => {
    expect(pc('si', '', 'dicitur').strength).toBe(0)
    expect(pc('sed', '', '').strength).toBe(1)
    expect(pc('atque', '', '').strength).toBe(2)
    expect(pc('attamen', '', '').strength).toBe(3)
  })

  it('derives backscope from scope phrase and stopword', () => {
    expect(pc('sed', '', '').backscope).toBe(scopeLine) // implicit
    expect(pc('si', '', '').backscope).toBe(scopeNull) // si has no implicit backscope
    expect(pc('sed', '', 'omittitur').backscope).toBe(scopeChunk)
    expect(pc('sed', '', 'hi versus omittuntur').backscope).toBe(scopeNest)
    expect(pc('sed', '', 'dicitur semper').backscope).toBe(scopeNull) // semper kills implicit
    expect(pc('sed', '', 'loco hujus versus dicitur').backscope).toBe(scopeChunk)
    expect(pc('sed', '', 'loco horum versuum dicuntur').backscope).toBe(scopeNest)
  })

  it('derives forward scope', () => {
    expect(pc('si', '', 'omittitur').forwardscope).toBe(scopeNull)
    expect(pc('si', '', 'dicuntur').forwardscope).toBe(scopeNest)
    expect(pc('sed', '', 'loco hujus versus dicitur').forwardscope).toBe(scopeChunk) // backscope chunk
    expect(pc('sed', '', 'hi versus omittuntur').forwardscope).toBe(scopeNull)
    expect(pc('si', '', 'dicitur').forwardscope).toBe(scopeLine)
    expect(pc('sed', '', '').forwardscope).toBe(scopeLine)
  })
})

describe('processConditionalLines', () => {
  it('keeps plain lines and strips ~ escapes', () => {
    expect(processConditionalLines(['a', '~(b)', 'c'], ctx1960)).toEqual(['a', '(b)', 'c'])
  })

  it('a false line-scoped conditional suppresses only the next line', () => {
    expect(
      processConditionalLines(['a', '(si rubrica monastica dicitur)', 'M', 'b'], ctx1960),
    ).toEqual(['a', 'b'])
    expect(
      processConditionalLines(['a', '(si rubrica monastica dicitur)', 'M', 'b'], ctxMonastic),
    ).toEqual(['a', 'M', 'b'])
  })

  it('a true sed-conditional replaces the preceding line', () => {
    expect(
      processConditionalLines(
        ['a', 'roman line', '(sed rubrica monastica)', 'monastic line'],
        ctxMonastic,
      ),
    ).toEqual(['a', 'monastic line'])
    expect(
      processConditionalLines(
        ['a', 'roman line', '(sed rubrica monastica)', 'monastic line'],
        ctx1960,
      ),
    ).toEqual(['a', 'roman line'])
  })

  it('omittitur removes the preceding chunk and continues affirmatively', () => {
    const lines = ['keep', '', 'v1', 'v2', '(sed rubrica 1960 omittitur)', 'after']
    expect(processConditionalLines(lines, ctx1960)).toEqual(['keep', 'after'])
    expect(processConditionalLines(lines, ctxDA)).toEqual(['keep', '', 'v1', 'v2', 'after'])
  })

  it('hi versus omittuntur removes the whole preceding nest', () => {
    const lines = ['v1', '', 'v2', '(sed rubrica 1960 hi versus omittuntur)', 'after']
    expect(processConditionalLines(lines, ctx1960)).toEqual(['after'])
    expect(processConditionalLines(lines, ctxDA)).toEqual(['v1', '', 'v2', 'after'])
  })

  it('dicuntur opens a nest until a blank line does not end it', () => {
    // forward NEST: gates everything until a stronger conditional
    const lines = [
      '(si rubrica monastica dicuntur)',
      'm1',
      '',
      'm2',
      '(atque dicuntur semper)',
      'always',
    ]
    expect(processConditionalLines(lines, ctx1960)).toEqual(['always'])
    expect(processConditionalLines(lines, ctxMonastic)).toEqual(['m1', '', 'm2', 'always'])
  })

  it('dicitur gates a single following line', () => {
    const lines = ['(si rubrica monastica dicitur)', 'm-only', 'both']
    expect(processConditionalLines(lines, ctx1960)).toEqual(['both'])
    expect(processConditionalLines(lines, ctxMonastic)).toEqual(['m-only', 'both'])
  })

  it('chunk forward scope ends at a blank line', () => {
    const lines = ['x', '(sed rubrica monastica loco hujus versus dicitur)', 'm1', 'm2', '', 'tail']
    // monastic: replaces x with the chunk m1 m2
    expect(processConditionalLines(lines, ctxMonastic)).toEqual(['m1', 'm2', '', 'tail'])
    // non-monastic: keeps x, drops the chunk — including the blank line that
    // terminated the failed chunk (it is processed under the failed frame)
    expect(processConditionalLines(lines, ctx1960)).toEqual(['x', 'tail'])
  })

  it('keeps the sequel of an affirmative conditional on the same line', () => {
    expect(processConditionalLines(['(rubrica 1960) &call', 'x'], ctx1960)).toEqual(['&call', 'x'])
    // false conditional: sequel becomes the gated "next line" and is dropped
    expect(processConditionalLines(['(rubrica monastica) &call', 'x'], ctx1960)).toEqual(['x'])
  })

  it('a stronger conditional rescues from a failed weaker branch', () => {
    const lines = [
      '(si rubrica monastica dicuntur)',
      'm1',
      'm2',
      '(atque rubrica 1960 dicuntur)',
      'r1',
      'tail',
    ]
    expect(processConditionalLines(lines, ctx1960)).toEqual(['r1', 'tail'])
    // For monastic the atque-1960 nest stays open (a dicuntur nest only closes
    // at a stronger conditional), so r1/tail belong to the 1960-only branch.
    expect(processConditionalLines(lines, ctxMonastic)).toEqual(['m1', 'm2'])
  })

  it('handles the alternative-branch idiom (sed … / atque dicuntur semper)', () => {
    const lines = [
      'common',
      '(sed rubrica monastica loco huius versus dicitur)',
      'monastic-version',
      '(atque dicuntur semper)',
      'tail',
    ]
    expect(processConditionalLines(lines, ctxMonastic)).toEqual(['monastic-version', 'tail'])
    expect(processConditionalLines(lines, ctx1960)).toEqual(['common', 'tail'])
  })
})
