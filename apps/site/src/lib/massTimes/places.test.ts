import { describe, expect, it } from 'vitest'
import { locate, locateAll } from './places'

const br = (region: string | null, city: string | null = 'X', postalCode?: string) =>
  locate({ countryCode: 'BR', region, city, postalCode })

describe('locate', () => {
  it('brings every way the directory writes a Brazilian state to one', () => {
    for (const raw of [
      'SP',
      'Sp',
      'São Paulo',
      'Sao Paulo',
      'SP, 19200-000',
      'São Paulo, SP',
      'State of São Paulo',
      'Estado de São Paulo',
    ]) {
      expect(br(raw).region, raw).toEqual({ name: 'São Paulo', slug: 'sao-paulo' })
    }
    expect(br('Recife, PE').region?.name).toBe('Pernambuco')
    expect(br('Uberlândia, Minas Gerais').region?.name).toBe('Minas Gerais')
    expect(br('Río Grande del Sur').region?.name).toBe('Rio Grande do Sul')
    expect(br('Bahía').region?.name).toBe('Bahia')
    expect(br('Brasília, DF, 70297-400').region?.name).toBe('Distrito Federal')
  })

  it('reads the state from the CEP when the region does not name one', () => {
    expect(br(null, 'X', '01310-100').region?.name).toBe('São Paulo')
    expect(br('Caxias do Sul', 'X', '95020-000').region?.name).toBe('Rio Grande do Sul')
    expect(br(null, 'X', '68900-000').region?.name).toBe('Amapá')
    expect(br('Nova Iguaçu').region).toBeUndefined()
  })

  it('frees a city of the state code an importer kept on it', () => {
    expect(br('BA', 'Vitória da Conquista-BA').city).toBe('Vitória da Conquista')
    expect(br('SP', 'São Paulo SP').city).toBe('São Paulo')
    expect(br('SP', 'São Paulo/SP').city).toBe('São Paulo')
    expect(br('RN', 'Ceará-Mirim').city).toBe('Ceará-Mirim')
    expect(br('SP', 'State of São Paulo').city).toBeUndefined()
  })

  it('keeps a region it has no list for as the text it is', () => {
    expect(locate({ countryCode: 'IT', region: 'Lazio, 00100', city: 'Roma' })).toEqual({
      region: { name: 'Lazio', slug: 'lazio' },
      city: 'Roma',
    })
  })
})

describe('locateAll', () => {
  it('gives a church with no state that of its nearest neighbour in the country', () => {
    const recife = { countryCode: 'BR', region: 'PE', city: 'Recife', lat: -8.05, lng: -34.9 }
    const salvador = { countryCode: 'BR', region: 'BA', city: 'Salvador', lat: -12.97, lng: -38.5 }
    const olinda = { countryCode: 'BR', region: null, city: 'Olinda', lat: -8.01, lng: -34.85 }
    const placed = locateAll([recife, salvador, olinda])
    expect(placed.get(olinda)?.region?.name).toBe('Pernambuco')
  })
})
