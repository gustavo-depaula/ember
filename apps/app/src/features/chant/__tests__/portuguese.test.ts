import { expect, test } from 'vitest'
import { stressOf, syllablesOf, toneSyllables } from '../portuguese'

const split = (word: string) => syllablesOf(word).join('-')
const stressed = (word: string) => {
  const s = syllablesOf(word)
  return s[stressOf(word, s)]
}

test('splits Portuguese words by its spelling', () => {
  expect(split('tende')).toBe('ten-de')
  expect(split('piedade')).toBe('pi-e-da-de')
  expect(split('misericórdia')).toBe('mi-se-ri-cór-di-a')
  expect(split('Altíssimo')).toBe('Al-tís-si-mo')
  expect(split('Senhor')).toBe('Se-nhor')
  expect(split('olhos')).toBe('o-lhos')
  expect(split('chamado')).toBe('cha-ma-do')
  expect(split('glória')).toBe('gló-ri-a')
  expect(split('padre')).toBe('pa-dre')
  expect(split('terra')).toBe('ter-ra')
  expect(split('nascer')).toBe('nas-cer')
  expect(split('quando')).toBe('quan-do')
  expect(split('guerra')).toBe('guer-ra')
  expect(split('porque')).toBe('por-que')
  expect(split('enquanto')).toBe('en-quan-to')
  expect(split('aquele')).toBe('a-que-le')
  expect(split('seguir')).toBe('se-guir')
  expect(split('água')).toBe('á-gua')
  expect(split('coração')).toBe('co-ra-ção')
  expect(split('mães')).toBe('mães')
  expect(split('Deus')).toBe('Deus')
  expect(split('saúde')).toBe('sa-ú-de')
  expect(split('rainha')).toBe('ra-i-nha')
  expect(split('cair')).toBe('ca-ir')
  expect(split('raiz')).toBe('ra-iz')
  expect(split('pais')).toBe('pais')
  expect(split('poeta')).toBe('po-e-ta')
  expect(split('abrigo')).toBe('a-bri-go')
})

test('finds the stressed syllable', () => {
  expect(stressed('tende')).toBe('ten')
  expect(stressed('Senhor')).toBe('nhor')
  expect(stressed('Altíssimo')).toBe('tís')
  expect(stressed('coração')).toBe('ção')
  expect(stressed('onipotente')).toBe('ten')
  expect(stressed('aqui')).toBe('qui')
  expect(stressed('amam')).toBe('a')
  expect(stressed('louvor')).toBe('vor')
  expect(stressOf('de', ['de'])).toBe(-1)
  expect(stressOf('Deus', ['Deus'])).toBe(0)
})

test('reads a half-verse as jgabc points one', () => {
  const syllables = toneSyllables('Quem habita ao abrigo do Altíssimo,')
  expect(syllables.map((s) => s.syl).join('')).toBe(
    'Quem ha-bi-ta ao a-bri-go do Al-tís-si-mo'.replace(/-/g, ''),
  )
  expect(syllables.at(-1)?.punctuation).toBe(',')
  expect(syllables.filter((s) => s.accent).map((s) => s.sylnospace)).toEqual([
    'Quem',
    'bi',
    'bri',
    'tís',
  ])
  const flexed = toneSyllables('podem cair até dez mil à tua direita: †')
  expect(flexed.at(-1)?.flex).toBe(true)
  expect(
    toneSyllables('hei de livrá-lo')
      .map((s) => s.syl + s.punctuation)
      .join(''),
  ).toBe('hei de livrá-lo')
})

test("sings a psalm in Portuguese on its antiphon's tone", async () => {
  const { readFileSync } = await import('node:fs')
  const { resolve } = await import('node:path')
  const { parseGabc } = await import('../gabc')
  const { pointPsalm, toneOf } = await import('../psalmody')
  const { layoutScore } = await import('../layoutScore')
  const { headers, score } = parseGabc(
    readFileSync(
      resolve(__dirname, '../../../../../../content/chant-propers/an-adhaesit-anima-2141.gabc'),
      'utf8',
    ),
  )
  const tone = toneOf(headers.mode, score)
  expect(tone).toBeDefined()
  if (!tone) return
  const gabc = pointPsalm(
    tone,
    [
      'Dai graças ao Senhor, porque ele é bom! * Eterna é a sua misericórdia!',
      'A casa de Israel agora o diga: * Eterna é a sua misericórdia!',
      'como um enxame de abelhas me atacaram, † como um fogo de espinhos me queimaram, * mas em nome do Senhor os derrotei.',
    ],
    'pt',
  )
  // Every word is sung, each syllable on a note of its own.
  expect(gabc).toContain('mi(')
  expect(gabc.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ')).toContain('Dai graças ao Senhor')
  expect(() => layoutScore(gabc, { width: 360, scale: 1 })).not.toThrow()
})
