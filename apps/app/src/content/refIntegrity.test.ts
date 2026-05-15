import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../../../..')
const practicesDir = resolve(repoRoot, 'content/practices')

type FoundRef = { practice: string; ref: string; expectedPath: string }

function bareId(ref: string): string {
  if (ref.startsWith('practice/')) return ref.slice('practice/'.length)
  if (ref.startsWith('prayer/')) return ref.slice('prayer/'.length)
  return ref
}

function collectPrayerRefs(node: unknown, into: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectPrayerRefs(item, into)
    return
  }
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>
  if (obj.type === 'prayer' && typeof obj.ref === 'string') {
    into.push(obj.ref)
  }
  for (const value of Object.values(obj)) collectPrayerRefs(value, into)
}

function listPracticeFlows(): { practice: string; flow: unknown }[] {
  const out: { practice: string; flow: unknown }[] = []
  for (const name of readdirSync(practicesDir)) {
    const dir = resolve(practicesDir, name)
    if (!statSync(dir).isDirectory()) continue
    const manifestPath = resolve(dir, 'manifest.json')
    const flowPath = resolve(dir, 'flow.json')
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      if (manifest.flow && typeof manifest.flow === 'object') {
        out.push({ practice: name, flow: manifest.flow })
      }
    }
    if (existsSync(flowPath)) {
      out.push({ practice: name, flow: JSON.parse(readFileSync(flowPath, 'utf8')) })
    }
  }
  return out
}

describe('practice flow prayer refs', () => {
  it('every prayer ref resolves to a practice in content/practices/', () => {
    const broken: FoundRef[] = []

    for (const { practice, flow } of listPracticeFlows()) {
      const refs: string[] = []
      collectPrayerRefs(flow, refs)

      for (const ref of refs) {
        const id = bareId(ref)
        const expectedPath = resolve(practicesDir, id, 'manifest.json')
        if (!existsSync(expectedPath)) {
          broken.push({ practice, ref, expectedPath })
        }
      }
    }

    if (broken.length > 0) {
      const lines = broken.map(
        ({ practice, ref, expectedPath }) =>
          `  ${practice} → "${ref}"  (expected ${expectedPath.replace(`${repoRoot}/`, '')})`,
      )
      throw new Error(
        `Found ${broken.length} unresolved prayer ref(s) in practice flows:\n${lines.join('\n')}`,
      )
    }

    expect(broken).toEqual([])
  })
})
