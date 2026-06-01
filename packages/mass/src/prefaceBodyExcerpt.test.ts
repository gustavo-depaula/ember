import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { prefaceBodyExcerpts } from './prefaceBodyExcerpt'

const REPO = resolve(__dirname, '../../..')
const PREFACE_DIR = `${REPO}/content/of-library/preface`

function loadPreface(id: string): unknown {
  return JSON.parse(readFileSync(`${PREFACE_DIR}/${id}.json`, 'utf8'))
}

describe('prefaceBodyExcerpts', () => {
  it('Easter I (pf016) — pt-BR snippet contains Páscoa / Cristo', () => {
    const out = prefaceBodyExcerpts(loadPreface('pf016') as { body?: unknown })
    expect(out['pt-BR']).toBeDefined()
    expect(out['pt-BR']?.toLowerCase()).toContain('páscoa')
    expect(out['pt-BR']?.toLowerCase()).toContain('cristo')
    // No leftover boilerplate
    expect(out['pt-BR']?.toLowerCase()).not.toContain('é digno e justo')
  })

  it('Advent I (pf001) — pt-BR snippet contains primeira vez / vinda / salvação', () => {
    const out = prefaceBodyExcerpts(loadPreface('pf001') as { body?: unknown })
    expect(out['pt-BR']).toBeDefined()
    const lower = out['pt-BR']?.toLowerCase()
    // Distinctive Advent I content includes "fragilidade" and "primeira vez"
    expect(lower).toMatch(/fragilidade|primeira vez|salvação/)
    expect(lower).not.toContain('é digno e justo')
  })

  it('Christmas I (pf005) — pt-BR snippet contains encarnação / luz', () => {
    const out = prefaceBodyExcerpts(loadPreface('pf005') as { body?: unknown })
    expect(out['pt-BR']).toBeDefined()
    const lower = out['pt-BR']?.toLowerCase()
    expect(lower).toMatch(/encarnação|luz|filho/)
    expect(lower).not.toContain('é digno e justo')
  })

  it('Common I (pf058) — pt-BR snippet contains renovar / plenitude', () => {
    const out = prefaceBodyExcerpts(loadPreface('pf058') as { body?: unknown })
    expect(out['pt-BR']).toBeDefined()
    const lower = out['pt-BR']?.toLowerCase()
    expect(lower).toMatch(/renovar|plenitude|coisas/)
    expect(lower).not.toContain('é digno e justo')
  })

  it('Defuntos I (pf067) — pt-BR snippet contains vida / morte / ressurreição', () => {
    const out = prefaceBodyExcerpts(loadPreface('pf067') as { body?: unknown })
    expect(out['pt-BR']).toBeDefined()
    const lower = out['pt-BR']?.toLowerCase()
    expect(lower).toMatch(/vida|morte|ressur|esperança/)
    expect(lower).not.toContain('é digno e justo')
  })

  it('English (en-US) — Easter I excerpt contains Easter / Lamb / Passover', () => {
    const out = prefaceBodyExcerpts(loadPreface('pf016') as { body?: unknown })
    expect(out['en-US']).toBeDefined()
    const lower = out['en-US']?.toLowerCase()
    expect(lower).toMatch(/passover|lamb|sacrificed|paschal/)
  })

  it('returns undefined parts when body is missing', () => {
    const out = prefaceBodyExcerpts({ body: undefined })
    expect(out['pt-BR']).toBeUndefined()
    expect(out['en-US']).toBeUndefined()
    expect(out.la).toBeUndefined()
  })

  it('snippet is reasonably short', () => {
    const out = prefaceBodyExcerpts(loadPreface('pf016') as { body?: unknown })
    expect(out['pt-BR']?.length).toBeLessThanOrEqual(200)
  })
})
