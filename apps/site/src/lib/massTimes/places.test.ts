import { describe, expect, it } from 'vitest'
import { locate, locateAll, stateAbbreviation } from './places'

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

describe('locateAll in Brazil', () => {
  const church = (city: string | null, lat: number, lng: number, region: string | null = null) => ({
    countryCode: 'BR',
    region,
    city,
    lat,
    lng,
  })

  it('puts a church whose city field names its neighbourhood in its municipality', () => {
    const centro = church('Centro', -19.9227, -43.9451, 'MG')
    const betania = church('Betânia', -19.9605, -44.0137, 'MG')
    const aldeota = church('Aldeota', -3.7365, -38.4996)
    const placed = locateAll([centro, betania, aldeota])
    expect(placed.get(centro)).toMatchObject({
      region: { name: 'Minas Gerais', slug: 'minas-gerais' },
      city: 'Belo Horizonte',
    })
    expect(placed.get(betania)?.city).toBe('Belo Horizonte')
    expect(placed.get(aldeota)).toMatchObject({
      region: { name: 'Ceará', slug: 'ceara' },
      city: 'Fortaleza',
    })
  })

  it('reads the city out of an address an importer wrote in its place', () => {
    const fortaleza = church('Fortaleza Ceará', -3.7319, -38.5267)
    const caxias = church('Caxias do Sul | Rio Grande do Sul', -29.1678, -51.1794)
    const valadares = church('Gov. Valadares', -18.8545, -41.9555)
    const placed = locateAll([fortaleza, caxias, valadares])
    expect(placed.get(fortaleza)?.city).toBe('Fortaleza')
    expect(placed.get(caxias)?.city).toBe('Caxias do Sul')
    expect(placed.get(valadares)?.city).toBe('Governador Valadares')
  })

  it('counts the Federal District as Brasília, not the town across the line it shares a name with', () => {
    const planaltina = church('Planaltina', -15.6189, -47.6524)
    expect(locateAll([planaltina]).get(planaltina)).toMatchObject({
      region: { name: 'Distrito Federal', slug: 'distrito-federal' },
      city: 'Brasília',
    })
  })
})

describe('stateAbbreviation', () => {
  it('finds the abbreviation of a state by its page slug', () => {
    expect(stateAbbreviation('BR', 'minas-gerais')).toBe('MG')
    expect(stateAbbreviation('IT', 'lazio')).toBeUndefined()
  })
})

describe('the neighbourhood of a Brazilian church', () => {
  const at = (lat: number, lng: number) => {
    const church = { countryCode: 'BR', region: null, city: null, lat, lng }
    return locateAll([church]).get(church)
  }

  it('is the census bairro where a city has them', () => {
    expect(at(-22.9711, -43.1822)).toMatchObject({
      city: 'Rio de Janeiro',
      neighbourhood: 'Copacabana',
    })
    expect(at(-3.7365, -38.4996)).toMatchObject({ city: 'Fortaleza', neighbourhood: 'Aldeota' })
  })

  it("is São Paulo's district and Brasília's administrative region, which stand for them there", () => {
    expect(at(-23.5674, -46.6908)).toMatchObject({ city: 'São Paulo', neighbourhood: 'Pinheiros' })
    expect(at(-15.8197, -48.1086)).toMatchObject({ city: 'Brasília', neighbourhood: 'Ceilândia' })
  })
})
