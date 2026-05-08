import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../../../..')
const practicesDir = resolve(repoRoot, 'content/practices')
const prayersDir = resolve(repoRoot, 'content/prayers')

type FoundRef = { practice: string; ref: string; expectedFile: string }

function bareId(ref: string): string {
  return ref.startsWith('prayer/') ? ref.slice('prayer/'.length) : ref
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

function listPracticeFlows(): { practice: string; flowPath: string }[] {
  return readdirSync(practicesDir)
    .filter((name) => statSync(resolve(practicesDir, name)).isDirectory())
    .map((name) => ({
      practice: name,
      flowPath: resolve(practicesDir, name, 'flow.json'),
    }))
    .filter(({ flowPath }) => existsSync(flowPath))
}

describe('practice flow.json prayer refs', () => {
  it('every prayer ref resolves to a file in content/prayers/', () => {
    const broken: FoundRef[] = []

    for (const { practice, flowPath } of listPracticeFlows()) {
      const flow = JSON.parse(readFileSync(flowPath, 'utf8'))
      const refs: string[] = []
      collectPrayerRefs(flow, refs)

      for (const ref of refs) {
        const id = bareId(ref)
        const expectedFile = resolve(prayersDir, `${id}.json`)
        if (!existsSync(expectedFile)) {
          broken.push({ practice, ref, expectedFile })
        }
      }
    }

    if (broken.length > 0) {
      const lines = broken.map(
        ({ practice, ref, expectedFile }) =>
          `  ${practice} → "${ref}"  (expected ${expectedFile.replace(`${repoRoot}/`, '')})`,
      )
      throw new Error(
        `Found ${broken.length} unresolved prayer ref(s) in practice flow.json files:\n${lines.join(
          '\n',
        )}`,
      )
    }

    expect(broken).toEqual([])
  })
})
