import { describe, expect, it } from 'vitest'
import { matchLineConditional, matchSectionHeader } from './conditions'

// All examples are real lines from the Divinum Officium data files.
describe('matchLineConditional', () => {
  it('parses a bare version condition', () => {
    expect(matchLineConditional('(rubrica 1960) some text')).toEqual({
      stopwords: '',
      expr: 'rubrica 1960',
      scope: '',
      sequel: 'some text',
    })
  })

  it('parses stopword + condition + instruction', () => {
    expect(matchLineConditional('(sed rubrica monastica omittitur)')).toMatchObject({
      stopwords: 'sed',
      expr: 'rubrica monastica',
      scope: 'omittitur',
    })
  })

  it('parses a pure-instruction directive', () => {
    expect(matchLineConditional('(atque dicuntur semper)')).toMatchObject({
      stopwords: 'atque',
      expr: '',
      scope: 'dicuntur semper',
    })
  })

  it('parses deinde dicitur', () => {
    expect(matchLineConditional('(deinde dicitur)')).toMatchObject({
      stopwords: 'deinde',
      expr: '',
      scope: 'dicitur',
    })
  })

  it('parses or-chains with trailing instruction', () => {
    expect(
      matchLineConditional(
        '(atque rubrica 196 aut rubrica 1955 aut rubrica altovadensis omittuntur)',
      ),
    ).toMatchObject({
      stopwords: 'atque',
      expr: 'rubrica 196 aut rubrica 1955 aut rubrica altovadensis',
      scope: 'omittuntur',
    })
  })

  it('keeps regex predicates in the expression', () => {
    expect(matchLineConditional('(sed rubrica ^Trident omittuntur)')).toMatchObject({
      expr: 'rubrica ^Trident',
      scope: 'omittuntur',
    })
  })

  it('parses loco scopes', () => {
    expect(matchLineConditional('(sed rubrica 1570 loco hujus versus dicitur)')).toMatchObject({
      stopwords: 'sed',
      expr: 'rubrica 1570',
      scope: 'loco hujus versus dicitur',
    })
  })

  it('captures the sequel after the directive', () => {
    expect(
      matchLineConditional('(rubrica Ordo Praedicatorum) &versiculum_ante_laudes'),
    ).toMatchObject({
      expr: 'rubrica Ordo Praedicatorum',
      sequel: '&versiculum_ante_laudes',
    })
  })

  it('treats any leading parenthesized phrase as a conditional, like Perl', () => {
    expect(matchLineConditional('(Fit reverentia)')).toMatchObject({ expr: 'Fit reverentia' })
  })

  it('does not match escaped or mid-line parens', () => {
    expect(matchLineConditional('~(rubrica 1960)')).toBeUndefined()
    expect(matchLineConditional('text with (parens) inside')).toBeUndefined()
    expect(matchLineConditional('V. Some verse')).toBeUndefined()
  })
})

describe('matchSectionHeader', () => {
  it('parses plain headers', () => {
    expect(matchSectionHeader('[Ant Vespera 3]')).toEqual({ name: 'Ant Vespera 3' })
  })

  it('parses header conditions', () => {
    expect(matchSectionHeader('[Ant Vespera 3] (nisi rubrica cisterciensis)')).toEqual({
      name: 'Ant Vespera 3',
      condition: 'nisi rubrica cisterciensis',
    })
  })

  it('keeps only the expression of a decorated header condition, like Perl', () => {
    expect(matchSectionHeader('[Lectio Prima] (sed die in Cœna Domini dicitur)')).toEqual({
      name: 'Lectio Prima',
      condition: 'die in Cœna Domini',
    })
  })

  it('requires the line to start with [', () => {
    expect(matchSectionHeader(' [Oratio]')).toBeUndefined()
    expect(matchSectionHeader('v. text [not a header]')).toBeUndefined()
  })

  it('ignores non-header bracket lines', () => {
    expect(matchSectionHeader('[unclosed')).toBeUndefined()
  })
})
