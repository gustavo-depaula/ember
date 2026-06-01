import { describe, expect, it } from 'vitest'
import { prettifyCelebrationTitle } from './prettifyCelebrationTitle'

describe('prettifyCelebrationTitle', () => {
  it('title-cases all-caps pt-BR titles, preserving connectors', () => {
    expect(prettifyCelebrationTitle({ 'pt-BR': 'NATAL DO SENHOR' })['pt-BR']).toBe(
      'Natal do Senhor',
    )
    expect(prettifyCelebrationTitle({ 'pt-BR': 'SAGRADO CORAÇÃO DE JESUS' })['pt-BR']).toBe(
      'Sagrado Coração de Jesus',
    )
    expect(prettifyCelebrationTitle({ 'pt-BR': 'SANTÍSSIMA TRINDADE' })['pt-BR']).toBe(
      'Santíssima Trindade',
    )
  })

  it('strips "<Ordinal> semana " prefix on solemnities falling on weekdays', () => {
    expect(prettifyCelebrationTitle({ 'pt-BR': 'Sexta semana ASCENÇÃO DO SENHOR' })['pt-BR']).toBe(
      'Ascenção do Senhor',
    )
  })

  it('strips "<Season> Season " prefix in en titles', () => {
    expect(
      prettifyCelebrationTitle({ en: 'Easter Season SEVENTH SUNDAY OF EASTER' })['en-US'],
    ).toBe('Seventh Sunday of Easter')
  })

  it('handles hyphenated all-caps words', () => {
    expect(
      prettifyCelebrationTitle({ 'pt-BR': 'ASSUNÇÃO DA BEM-AVENTURADA VIRGEM MARIA' })['pt-BR'],
    ).toBe('Assunção da Bem-Aventurada Virgem Maria')
  })

  it('leaves mixed-case titles alone', () => {
    expect(prettifyCelebrationTitle({ 'pt-BR': 'Anunciação do Senhor' })['pt-BR']).toBe(
      'Anunciação do Senhor',
    )
    expect(prettifyCelebrationTitle({ 'pt-BR': 'Todos os Santos' })['pt-BR']).toBe(
      'Todos os Santos',
    )
  })

  it('renames ember-extra "en" key to "en-US"', () => {
    expect(prettifyCelebrationTitle({ en: 'Easter Sunday' })['en-US']).toBe('Easter Sunday')
    expect(prettifyCelebrationTitle({ en: 'Easter Sunday' })['en']).toBeUndefined()
  })

  it('preserves Latin titles untouched', () => {
    expect(prettifyCelebrationTitle({ la: 'IN NATIVITATE DOMINI' }).la).toBe('IN NATIVITATE DOMINI')
  })
})
