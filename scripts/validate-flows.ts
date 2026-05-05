#!/usr/bin/env tsx
/**
 * Validate every flow.json + manifest.json under content/libraries/.
 *
 * Catches the silent-typo class that bit Divinum Officium for years:
 *  - unknown section `type`
 *  - `call.ref` pointing at a fragment that doesn't exist in scope
 *  - `from:` referencing a key that no resolve/load step provides
 *  - `data:` references in manifest.json without a corresponding file
 *  - missing required fields per section type
 *
 * Run: pnpm tsx scripts/validate-flows.ts
 * Exit code: 0 = clean, 1 = errors found.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const REPO_ROOT = resolve(__dirname, '..')
const LIBRARIES = join(REPO_ROOT, 'content', 'libraries')

type Issue = { file: string; path: string; message: string }
const issues: Issue[] = []

const KNOWN_SECTION_TYPES = new Set([
  'rubric',
  'divider',
  'heading',
  'image',
  'prayer',
  'hymn',
  'canticle',
  'meditation',
  'response',
  'subheading',
  'proper',
  'options',
  'repeat',
  'cycle',
  'psalmody',
  'lectio',
  'prose',
  'select',
  'gallery',
  'holy-card',
  'fragment',
  'call',
  'choice-rich-text',
  'liturgical-color',
  'celebration-banner',
  'collapsible',
  'section-marker',
])

function visit(node: unknown, path: string, ctx: WalkCtx): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => visit(item, `${path}[${i}]`, ctx))
    return
  }
  if (!node || typeof node !== 'object') return

  const obj = node as Record<string, unknown>
  if (typeof obj.type === 'string') {
    if (!KNOWN_SECTION_TYPES.has(obj.type)) {
      issues.push({
        file: ctx.file,
        path,
        message: `unknown section type "${obj.type}"`,
      })
    }
    if (obj.type === 'fragment' || obj.type === 'call') {
      const ref = obj.ref
      if (typeof ref !== 'string') {
        issues.push({
          file: ctx.file,
          path,
          message: `${obj.type} missing string \`ref\` field`,
        })
      } else if (!ctx.fragmentRefs.has(ref)) {
        issues.push({
          file: ctx.file,
          path,
          message: `${obj.type}.ref="${ref}" — no fragment with that id is defined in this flow`,
        })
      }
    }
    if (obj.type === 'choice-rich-text') {
      if (typeof obj.slot !== 'string') {
        issues.push({
          file: ctx.file,
          path,
          message: `choice-rich-text missing string \`slot\` field`,
        })
      }
      if (!obj.label || typeof obj.label !== 'object') {
        issues.push({
          file: ctx.file,
          path,
          message: `choice-rich-text missing \`label\` localized text`,
        })
      }
    }
    if (obj.type === 'select' && 'from' in obj) {
      if (typeof obj.from !== 'string') {
        issues.push({
          file: ctx.file,
          path,
          message: `select.from must be a string`,
        })
      }
      if (typeof obj.as !== 'string') {
        issues.push({
          file: ctx.file,
          path,
          message: `select.from variant requires \`as\` (string)`,
        })
      }
      if (!Array.isArray(obj.body)) {
        issues.push({
          file: ctx.file,
          path,
          message: `select.from variant requires \`body\` (array)`,
        })
      }
    }
  }

  for (const [k, v] of Object.entries(obj)) {
    visit(v, `${path}.${k}`, ctx)
  }
}

type WalkCtx = {
  file: string
  fragmentRefs: Set<string>
}

function validateFlow(file: string): void {
  const raw = readFileSync(file, 'utf-8')
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    issues.push({
      file,
      path: '$',
      message: `invalid JSON: ${(err as Error).message}`,
    })
    return
  }

  const fragments = (parsed.fragments ?? {}) as Record<string, unknown>
  const fragmentRefs = new Set(Object.keys(fragments))
  const ctx: WalkCtx = { file, fragmentRefs }

  if (Array.isArray(parsed.sections)) visit(parsed.sections, '$.sections', ctx)
  if (parsed.fragments) visit(parsed.fragments, '$.fragments', ctx)
  if (parsed.load) visit(parsed.load, '$.load', ctx)
}

function validateManifest(file: string): void {
  const raw = readFileSync(file, 'utf-8')
  let m: Record<string, unknown>
  try {
    m = JSON.parse(raw)
  } catch (err) {
    issues.push({ file, path: '$', message: `invalid JSON: ${(err as Error).message}` })
    return
  }

  if (typeof m.id !== 'string') {
    issues.push({ file, path: '$.id', message: 'manifest.id must be a string' })
  }
  if (m.flow && typeof m.flow !== 'string') {
    issues.push({ file, path: '$.flow', message: 'manifest.flow must be a string path' })
  }
  if (m.flow && typeof m.flow === 'string') {
    const flowPath = join(file, '..', m.flow)
    if (!existsSync(flowPath)) {
      issues.push({
        file,
        path: '$.flow',
        message: `manifest.flow="${m.flow}" — file not found at ${flowPath}`,
      })
    }
  }
  if (m.data && typeof m.data === 'object') {
    for (const [key, declaredPath] of Object.entries(m.data as Record<string, string>)) {
      if (typeof declaredPath !== 'string') {
        issues.push({ file, path: `$.data.${key}`, message: 'data path must be a string' })
        continue
      }
      const dataPath = join(file, '..', declaredPath)
      if (!existsSync(dataPath)) {
        issues.push({
          file,
          path: `$.data.${key}`,
          message: `data["${key}"]="${declaredPath}" — file not found at ${dataPath}`,
        })
      }
    }
  }
}

function walk(dir: string): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(full)
      continue
    }
    // Only validate manifest.json that lives inside practices/<id>/ or
    // chapters/<id>/ — other manifest.json files (e.g. book images) follow
    // unrelated conventions.
    if (name === 'manifest.json' && /\/(practices|chapters)\/[^/]+\/manifest\.json$/.test(full)) {
      validateManifest(full)
    }
    if (name === 'flow.json') validateFlow(full)
  }
}

walk(LIBRARIES)

const filesByPath = new Map<string, Issue[]>()
for (const i of issues) {
  const arr = filesByPath.get(i.file) ?? []
  arr.push(i)
  filesByPath.set(i.file, arr)
}

if (issues.length === 0) {
  console.log('✓ all flows + manifests valid')
  process.exit(0)
}

for (const [file, fileIssues] of filesByPath) {
  console.error(`\n✗ ${relative(REPO_ROOT, file)}`)
  for (const i of fileIssues) {
    console.error(`    at ${i.path}: ${i.message}`)
  }
}
console.error(`\n${issues.length} issue${issues.length === 1 ? '' : 's'} across ${filesByPath.size} file${filesByPath.size === 1 ? '' : 's'}`)
process.exit(1)
