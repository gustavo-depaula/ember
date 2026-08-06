#!/usr/bin/env node
// Generates apps/app/src/lib/typography/fontMetrics.generated.ts — the advance
// widths the native justifier needs.
//
// React Native exposes no text-measurement API, so Knuth–Plass line breaking
// can't ask the platform how wide a word is. It has to know. These tables are
// read straight out of each reading font's `head` / `hhea` / `hmtx` / `cmap`
// at build time, which is exact: validated against a real text engine over the
// prayer corpus, mean error 0.0002 px at 22 px.
//
//   node scripts/build-font-metrics.mjs
//
// Re-run when readingFonts.ts changes. Fonts come from the installed
// @expo-google-fonts packages, so run it after an install.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '..')

// id -> { face: [npm package, file] }. Mirrors readingFonts.ts, and — this is
// the part that matters — only lists faces the app actually LOADS in
// `_layout.tsx`. Metrics have to describe what gets rendered, not what the
// package happens to ship: EB Garamond loads real italic and bold faces, while
// the other six load Regular only and let the platform synthesize emphasis.
const fonts = {
  'eb-garamond': {
    regular: ['@expo-google-fonts/eb-garamond', '400Regular/EBGaramond_400Regular.ttf'],
    italic: [
      '@expo-google-fonts/eb-garamond',
      '400Regular_Italic/EBGaramond_400Regular_Italic.ttf',
    ],
    bold: ['@expo-google-fonts/eb-garamond', '700Bold/EBGaramond_700Bold.ttf'],
    boldItalic: [
      '@expo-google-fonts/eb-garamond',
      '700Bold_Italic/EBGaramond_700Bold_Italic.ttf',
    ],
  },
  'crimson-pro': {
    regular: ['@expo-google-fonts/crimson-pro', '400Regular/CrimsonPro_400Regular.ttf'],
  },
  lora: { regular: ['@expo-google-fonts/lora', '400Regular/Lora_400Regular.ttf'] },
  'cormorant-garamond': {
    regular: [
      '@expo-google-fonts/cormorant-garamond',
      '400Regular/CormorantGaramond_400Regular.ttf',
    ],
  },
  'libre-baskerville': {
    regular: ['@expo-google-fonts/libre-baskerville', '400Regular/LibreBaskerville_400Regular.ttf'],
  },
  'source-serif-4': {
    regular: ['@expo-google-fonts/source-serif-4', '400Regular/SourceSerif4_400Regular.ttf'],
  },
  merriweather: {
    regular: ['@expo-google-fonts/merriweather', '400Regular/Merriweather_400Regular.ttf'],
  },
}

// The characters the corpus actually uses: ASCII, Latin-1 letters with the
// accents Latin/Portuguese/English need, liturgical marks, and the f-ligatures.
const codepoints = () => {
  const set = new Set()
  for (let c = 0x20; c <= 0x7e; c++) set.add(c)
  for (let c = 0xc0; c <= 0xff; c++) set.add(c)
  for (const ch of '‘’“”–—…†‡℣℟℞·•ᵃᵉŒœÆæ°′″¡¿«»‹›„‚⁂✠') set.add(ch.codePointAt(0))
  for (const ch of 'ﬀﬁﬂﬃﬄ') set.add(ch.codePointAt(0))
  for (const ch of 'āēīōūăĕĭŏŭçñÿŸ') set.add(ch.codePointAt(0))
  return [...set].sort((a, b) => a - b)
}

function readMetrics(path) {
  const b = readFileSync(path)
  const u16 = (o) => b.readUInt16BE(o)
  const i16 = (o) => b.readInt16BE(o)
  const u32 = (o) => b.readUInt32BE(o)

  const tables = {}
  for (let i = 0, n = u16(4); i < n; i++) {
    const o = 12 + i * 16
    tables[b.toString('ascii', o, o + 4)] = { off: u32(o + 8), len: u32(o + 12) }
  }

  const unitsPerEm = u16(tables.head.off + 18)
  const numHMetrics = u16(tables.hhea.off + 34)
  const advances = []
  for (let i = 0; i < numHMetrics; i++) advances.push(u16(tables.hmtx.off + i * 4))

  const cm = tables.cmap.off
  let sub4 = 0
  let sub12 = 0
  for (let i = 0, n = u16(cm + 2); i < n; i++) {
    const rec = cm + 4 + i * 8
    const pid = u16(rec)
    const eid = u16(rec + 2)
    const off = u32(rec + 4)
    if (!((pid === 3 && (eid === 1 || eid === 10)) || pid === 0)) continue
    const fmt = u16(cm + off)
    if (fmt === 4) sub4 = cm + off
    else if (fmt === 12) sub12 = cm + off
  }

  const lookup4 = (sub, cp) => {
    const segX2 = u16(sub + 6)
    const endO = sub + 14
    const startO = endO + segX2 + 2
    const deltaO = startO + segX2
    const rangeO = deltaO + segX2
    for (let i = 0; i < segX2 / 2; i++) {
      if (u16(endO + i * 2) < cp) continue
      const start = u16(startO + i * 2)
      if (start > cp) return 0
      const ro = u16(rangeO + i * 2)
      if (ro === 0) return (cp + i16(deltaO + i * 2)) & 0xffff
      const gi = u16(rangeO + i * 2 + ro + (cp - start) * 2)
      return gi === 0 ? 0 : (gi + i16(deltaO + i * 2)) & 0xffff
    }
    return 0
  }
  const lookup12 = (sub, cp) => {
    for (let lo = 0, hi = u32(sub + 12) - 1; lo <= hi; ) {
      const mid = (lo + hi) >> 1
      const g = sub + 16 + mid * 12
      const s = u32(g)
      const e = u32(g + 4)
      if (cp < s) hi = mid - 1
      else if (cp > e) lo = mid + 1
      else return u32(g + 8) + (cp - s)
    }
    return 0
  }
  const glyphFor = (cp) => {
    if (sub4 && cp <= 0xffff) {
      const g = lookup4(sub4, cp)
      if (g) return g
    }
    return sub12 ? lookup12(sub12, cp) : 0
  }

  const widths = {}
  for (const cp of codepoints()) {
    const g = glyphFor(cp)
    if (!g) continue
    widths[cp] = advances[Math.min(g, advances.length - 1)] ?? 0
  }

  // Kerning is deliberately NOT modelled. These fonts carry pair adjustments
  // in GPOS (no legacy `kern` table), and extracting them expands the class
  // matrices into ~3,000 pairs per face — about 1 MB of generated tables
  // across the seven families. Measured cost of ignoring it, on 36 real
  // justified lines at a 170px measure: 0.72 px mean, 2.03 px worst. A line
  // can therefore sit up to ~2 px short of the right margin. That is a worse
  // trade than the bundle, but the numbers are here so it can be revisited —
  // storing GPOS in its native class form rather than expanded pairs would
  // cost far less than the expansion did.
  return { unitsPerEm, widths }
}

const resolveFont = (pkg, file) => {
  for (const base of [join(repo, 'node_modules'), join(repo, 'apps/app/node_modules')]) {
    const p = join(base, pkg, file)
    if (existsSync(p)) return p
  }
  return undefined
}

const out = {}
const missing = []
for (const [id, faces] of Object.entries(fonts)) {
  for (const [face, [pkg, file]] of Object.entries(faces)) {
    const path = resolveFont(pkg, file)
    if (!path) {
      missing.push(`${id}/${face} (${pkg})`)
      continue
    }
    ;(out[id] ??= {})[face] = readMetrics(path)
  }
}
if (!Object.keys(out).length) {
  throw new Error(`build-font-metrics: no fonts resolved. Missing: ${missing.join(', ')}`)
}
if (missing.length) console.warn(`build-font-metrics: skipped ${missing.join(', ')}`)

// Emit compactly: a codepoint-sorted advance list rather than an object, so
// the generated file stays small and diffs stay readable.
const face = (m) => {
  const cps = Object.keys(m.widths).map(Number).sort((a, b) => a - b)
  return `{ unitsPerEm: ${m.unitsPerEm}, codepoints: [${cps.join(',')}], advances: [${cps.map((c) => m.widths[c]).join(',')}] }`
}
const body = Object.entries(out)
  .map(
    ([id, faces]) =>
      `  '${id}': {\n${Object.entries(faces)
        .map(([name, m]) => `    ${name}: ${face(m)},`)
        .join('\n')}\n  },`,
  )
  .join('\n')

const ts = `// GENERATED by scripts/build-font-metrics.mjs — do not edit.
//
// Advance widths per reading font FACE, in font units (divide by unitsPerEm
// and multiply by the px size). React Native has no text-measurement API, so
// the native justifier reads widths from here instead of asking the platform.
//
// Only faces the app actually loads appear here. Where a face is absent the
// platform synthesizes the emphasis, and the justifier has to decide whether
// it can predict the result — see \`lib/typography/fontMetrics.ts\`.

export type FaceMetrics = {
  unitsPerEm: number
  /** Sorted codepoints, parallel to \`advances\`. */
  codepoints: number[]
  advances: number[]
}

export type FontFaces = {
  regular: FaceMetrics
  italic?: FaceMetrics
  bold?: FaceMetrics
  boldItalic?: FaceMetrics
}

export const fontMetrics: Record<string, FontFaces> = {
${body}
}
`

const dest = join(repo, 'apps/app/src/lib/typography/fontMetrics.generated.ts')
writeFileSync(dest, ts)
console.log(`wrote ${dest} (${ts.length} bytes, ${Object.keys(out).length} fonts)`)
