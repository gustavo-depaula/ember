import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import en from './locales/en-US'
import ptBR from './locales/pt-BR'

const librariesDir = resolve(__dirname, '../../../../../content/libraries')

function getPracticeIds(): string[] {
  const ids = new Set<string>()
  for (const book of readdirSync(librariesDir, { withFileTypes: true })) {
    if (!book.isDirectory()) continue
    const practicesPath = resolve(librariesDir, book.name, 'practices')
    try {
      for (const d of readdirSync(practicesPath, { withFileTypes: true })) {
        if (d.isDirectory()) ids.add(d.name)
      }
    } catch {}
  }
  return Array.from(ids).sort()
}

function getCategorySlugs(): string[] {
  const cats = new Set<string>()
  for (const book of readdirSync(librariesDir, { withFileTypes: true })) {
    if (!book.isDirectory()) continue
    const practicesPath = resolve(librariesDir, book.name, 'practices')
    try {
      for (const d of readdirSync(practicesPath, { withFileTypes: true })) {
        if (!d.isDirectory()) continue
        const manifest = JSON.parse(
          readFileSync(resolve(practicesPath, d.name, 'manifest.json'), 'utf-8'),
        )
        for (const c of manifest.categories ?? []) cats.add(c)
      }
    } catch {}
  }
  return Array.from(cats).sort()
}

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

const practiceUtilityKeys = ['pray', 'noContent', 'threshold']

describe('practice translation keys', () => {
  const practiceIds = getPracticeIds()
  const enKeys = Object.keys(en.practice)
  const ptBRKeys = Object.keys(ptBR.practice)

  it('every practice directory has an en translation key', () => {
    const missing = practiceIds.filter((id) => !enKeys.includes(id))
    expect(missing, `Missing en practice keys: ${missing.join(', ')}`).toEqual([])
  })

  it('every practice directory has a pt-BR translation key', () => {
    const missing = practiceIds.filter((id) => !ptBRKeys.includes(id))
    expect(missing, `Missing pt-BR practice keys: ${missing.join(', ')}`).toEqual([])
  })

  it('no orphaned practice keys', () => {
    const orphans = enKeys.filter(
      (k) => !practiceIds.includes(k) && !practiceUtilityKeys.includes(k),
    )
    expect(orphans, `Orphaned en keys: ${orphans.join(', ')}`).toEqual([])
  })

  it('en and pt-BR practice keys match', () => {
    expect(enKeys.sort()).toEqual(ptBRKeys.sort())
  })
})

describe('category translation keys', () => {
  const categorySlugs = getCategorySlugs()
  const enKeys = Object.keys(en.category)
  const ptBRKeys = Object.keys(ptBR.category)

  it('every category used in manifests has an en translation key', () => {
    const missing = categorySlugs.filter((slug) => !enKeys.includes(slug))
    expect(missing, `Missing en category keys: ${missing.join(', ')}`).toEqual([])
  })

  it('every category used in manifests has a pt-BR translation key', () => {
    const missing = categorySlugs.filter((slug) => !ptBRKeys.includes(slug))
    expect(missing, `Missing pt-BR category keys: ${missing.join(', ')}`).toEqual([])
  })

  it('en and pt-BR category keys match', () => {
    expect(enKeys.sort()).toEqual(ptBRKeys.sort())
  })
})

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
