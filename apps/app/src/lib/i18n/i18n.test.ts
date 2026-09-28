import { describe, expect, it } from 'vitest'

import en from './locales/en-US'
import ptBR from './locales/pt-BR'

function getKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...getKeyPaths(v as Record<string, unknown>, path))
    } else {
      keys.push(path)
    }
  }
  return keys.sort()
}

describe('locale key parity', () => {
  it('en and pt-BR have the same set of leaf keys', () => {
    const enKeys = getKeyPaths(en as unknown as Record<string, unknown>)
    const ptBRKeys = getKeyPaths(ptBR as unknown as Record<string, unknown>)

    const onlyInEn = enKeys.filter((k) => !ptBRKeys.includes(k))
    const onlyInPtBR = ptBRKeys.filter((k) => !enKeys.includes(k))

    expect(onlyInEn, `Keys only in en: ${onlyInEn.join(', ')}`).toEqual([])
    expect(onlyInPtBR, `Keys only in pt-BR: ${onlyInPtBR.join(', ')}`).toEqual([])
  })
})
