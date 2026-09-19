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

// Whole blocks rather than a hand-picked list. A character the corpus uses but
// the table doesn't carry is measured at the face's fallback advance, which
// means the breaker places that line against a width the screen contradicts —
// and a hand-picked list is exactly the thing that silently falls behind the
// corpus. `º`, `ª`, `§`, `ǽ`, `‒` and every Greek letter were all outside the
// previous list while appearing thousands of times under `content/`.
//
// Ranges are intersected with the face's own cmap below, so a font that has no
// Greek contributes no Greek and the file only grows by what the face really
// covers.
const blocks = [
  [0x0020, 0x00ff], // Basic Latin + Latin-1 Supplement (º ª § £ · ¡ ¿ « »)
  [0x0100, 0x024f], // Latin Extended-A and -B (macrons, breves, ǽ)
  [0x0370, 0x03ff], // Greek and Coptic
  [0x1e00, 0x1eff], // Latin Extended Additional
  [0x1f00, 0x1fff], // Greek Extended (polytonic, in the Fathers)
  [0x2000, 0x206f], // General Punctuation (dashes, the fixed-width spaces)
  [0x20a0, 0x20bf], // Currency symbols
  [0x2100, 0x214f], // Letterlike symbols (℣ ℟ ℞)
  [0x2190, 0x21ff], // Arrows (cross-reference markers in imported articles)
  [0xfb00, 0xfb06], // f-ligatures, which `fontMetrics.ts` substitutes before summing
]

// Default-ignorable formatting characters. Their `hmtx` entry is whatever glyph
// the cmap happens to point at — a third of an em in EB Garamond — while every
// shaper draws them at zero width, so carrying them would put a made-up advance
// into the one place that has to describe what renders.
const ignorable = (cp) =>
  cp === 0x00ad ||
  cp === 0xfeff ||
  (cp >= 0x200b && cp <= 0x200f) ||
  (cp >= 0x2028 && cp <= 0x202e) ||
  (cp >= 0x2060 && cp <= 0x2064)

const codepoints = () => {
  const set = new Set()
  for (const [lo, hi] of blocks) for (let c = lo; c <= hi; c++) if (!ignorable(c)) set.add(c)
  for (const ch of '℞⁂✠✦') set.add(ch.codePointAt(0))
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
  const glyphOf = new Map()
  for (const cp of codepoints()) {
    const g = glyphFor(cp)
    if (!g) continue
    widths[cp] = advances[Math.min(g, advances.length - 1)] ?? 0
    glyphOf.set(cp, g)
  }

  // The f-ligatures a shaper substitutes by default (`liga`), keyed by the
  // Unicode presentation form `fontMetrics.ts` rewrites the sequence to. Some
  // faces map U+FB00–FB04 in their cmap and the loop above already has them;
  // Merriweather, Crimson Pro and Cormorant reach the same glyph only through
  // GSUB, and drawing `ffl` as one glyph there is 37 % of an em narrower than
  // the three letters summed. Resolving the ligature glyph through GSUB and
  // filing its advance under the presentation codepoint makes the runtime
  // substitution exact for every face that has the ligature — and leaves it
  // out for a face that does not, where the letters sum correctly.
  for (const [sequence, cp] of Object.entries(ligatureForms)) {
    if (glyphOf.has(cp)) continue
    const g = ligatureGlyph(b, tables, [...sequence].map(glyphFor))
    if (!g) continue
    widths[cp] = advances[Math.min(g, advances.length - 1)] ?? 0
    glyphOf.set(cp, g)
  }

  return { unitsPerEm, widths, kern: readKerning(b, tables, glyphOf) }
}

const ligatureForms = { ff: 0xfb00, fi: 0xfb01, fl: 0xfb02, ffi: 0xfb03, ffl: 0xfb04 }

// GSUB LigatureSubst (lookup type 4, directly or behind an Extension) under the
// `liga` feature: the ligature glyph for a component sequence, or 0.
function ligatureGlyph(b, tables, components) {
  if (!tables.GSUB || components.some((g) => !g)) return 0
  const u16 = (o) => b.readUInt16BE(o)
  const u32 = (o) => b.readUInt32BE(o)
  const gsub = tables.GSUB.off
  const featureList = gsub + u16(gsub + 6)
  const lookupList = gsub + u16(gsub + 8)
  const ligaLookups = new Set()
  for (let i = 0, n = u16(featureList); i < n; i++) {
    const rec = featureList + 2 + i * 6
    if (b.toString('ascii', rec, rec + 4) !== 'liga') continue
    const feature = featureList + u16(rec + 4)
    for (let j = 0, m = u16(feature + 2); j < m; j++) ligaLookups.add(u16(feature + 4 + j * 2))
  }
  const coverageIndex = (o, g) => {
    if (u16(o) === 1) {
      for (let i = 0, n = u16(o + 2); i < n; i++) if (u16(o + 4 + i * 2) === g) return i
      return -1
    }
    for (let i = 0, n = u16(o + 2); i < n; i++) {
      const r = o + 4 + i * 6
      const start = u16(r)
      if (g >= start && g <= u16(r + 2)) return u16(r + 4) + (g - start)
    }
    return -1
  }
  const [first, ...rest] = components
  for (const li of [...ligaLookups].sort((a, c) => a - c)) {
    const lookup = lookupList + u16(lookupList + 2 + li * 2)
    const type = u16(lookup)
    for (let s = 0, n = u16(lookup + 4); s < n; s++) {
      let st = lookup + u16(lookup + 6 + s * 2)
      let t = type
      if (t === 7) {
        t = u16(st + 2)
        st += u32(st + 4)
      }
      if (t !== 4) continue
      const ci = coverageIndex(st + u16(st + 2), first)
      if (ci < 0 || ci >= u16(st + 4)) continue
      const set = st + u16(st + 6 + ci * 2)
      for (let k = 0, cnt = u16(set); k < cnt; k++) {
        const lig = set + u16(set + 2 + k * 2)
        const compCount = u16(lig + 2) - 1
        if (compCount !== rest.length) continue
        let matches = true
        for (let c = 0; c < compCount; c++) if (u16(lig + 4 + c * 2) !== rest[c]) matches = false
        if (matches) return u16(lig)
      }
    }
  }
  return 0
}

// ---------------------------------------------------------------------------
// Kerning. Every reading face carries its pair adjustments in GPOS only (no
// legacy `kern` table), as a mix of PairPos format 1 (glyph pairs) and format
// 2 (class matrices) subtables under the `kern` feature. A shaper applies them
// by default, so a word the breaker sums from bare advances can differ from
// the word the screen draws by up to a fifth of an em across a line — enough
// for the platform to re-break a line the breaker placed.
//
// Rather than carry the font's own structure, this resolves the final
// adjustment for every ordered pair of codepoints in the table (all lookups
// applied in order; within a lookup the first subtable that covers the pair
// wins, as HarfBuzz does), then re-derives classes from the result: left
// classes are distinct rows, right classes distinct columns. The matrix that
// falls out is small, and the runtime lookup is two class reads and an index.
// ---------------------------------------------------------------------------
function readKerning(b, tables, glyphOf) {
  const empty = { left: [], right: [], rows: [] }
  if (!tables.GPOS) return empty
  const u16 = (o) => b.readUInt16BE(o)
  const i16 = (o) => b.readInt16BE(o)
  const u32 = (o) => b.readUInt32BE(o)

  const gpos = tables.GPOS.off
  const featureList = gpos + u16(gpos + 6)
  const lookupList = gpos + u16(gpos + 8)

  const kernLookups = new Set()
  for (let i = 0, n = u16(featureList); i < n; i++) {
    const rec = featureList + 2 + i * 6
    if (b.toString('ascii', rec, rec + 4) !== 'kern') continue
    const feature = featureList + u16(rec + 4)
    for (let j = 0, m = u16(feature + 2); j < m; j++) kernLookups.add(u16(feature + 4 + j * 2))
  }

  const coverage = (o) => {
    const map = new Map()
    if (u16(o) === 1) {
      for (let i = 0, n = u16(o + 2); i < n; i++) map.set(u16(o + 4 + i * 2), i)
    } else {
      for (let i = 0, n = u16(o + 2); i < n; i++) {
        const r = o + 4 + i * 6
        const start = u16(r)
        const end = u16(r + 2)
        const index = u16(r + 4)
        for (let g = start; g <= end; g++) map.set(g, index + (g - start))
      }
    }
    return map
  }
  const classDef = (o) => {
    const map = new Map()
    if (u16(o) === 1) {
      const start = u16(o + 2)
      for (let i = 0, n = u16(o + 4); i < n; i++) map.set(start + i, u16(o + 6 + i * 2))
    } else {
      for (let i = 0, n = u16(o + 2); i < n; i++) {
        const r = o + 4 + i * 6
        const start = u16(r)
        const end = u16(r + 2)
        const cls = u16(r + 4)
        for (let g = start; g <= end; g++) map.set(g, cls)
      }
    }
    return map
  }
  // A ValueRecord holds one int16 per set bit; xAdvance is bit 2, preceded by
  // xPlacement (bit 0) and yPlacement (bit 1) when those are present.
  const recordSize = (vf) => {
    let n = 0
    for (let bit = 0; bit < 8; bit++) if (vf & (1 << bit)) n++
    return n * 2
  }
  const xAdvance = (o, vf) => {
    if (!(vf & 0x0004)) return 0
    let at = o
    if (vf & 0x0001) at += 2
    if (vf & 0x0002) at += 2
    return i16(at)
  }

  // lookups: Array<Array<subtable>>, in lookup order.
  const lookups = []
  for (const li of [...kernLookups].sort((a, c) => a - c)) {
    const lookup = lookupList + u16(lookupList + 2 + li * 2)
    const type = u16(lookup)
    const subtables = []
    for (let s = 0, n = u16(lookup + 4); s < n; s++) {
      let st = lookup + u16(lookup + 6 + s * 2)
      let t = type
      if (t === 9) {
        // Extension: the real subtable sits at a 32-bit offset.
        t = u16(st + 2)
        st += u32(st + 4)
      }
      if (t !== 2) continue
      const cov = coverage(st + u16(st + 2))
      const vf1 = u16(st + 4)
      const vf2 = u16(st + 6)
      const size1 = recordSize(vf1)
      const pairSize = size1 + recordSize(vf2)
      const value = (o) => xAdvance(o, vf1) + xAdvance(o + size1, vf2)
      if (u16(st) === 1) {
        const pairs = new Map()
        const setCount = u16(st + 8)
        for (const [g1, ci] of cov) {
          if (ci >= setCount) continue
          const ps = st + u16(st + 10 + ci * 2)
          const m = new Map()
          for (let k = 0, cnt = u16(ps); k < cnt; k++) {
            const r = ps + 2 + k * (2 + pairSize)
            m.set(u16(r), value(r + 2))
          }
          pairs.set(g1, m)
        }
        subtables.push({ format: 1, cov, pairs })
      } else {
        const cd1 = classDef(st + u16(st + 8))
        const cd2 = classDef(st + u16(st + 10))
        const c1 = u16(st + 12)
        const c2 = u16(st + 14)
        const matrix = new Int16Array(c1 * c2)
        for (let a = 0; a < c1; a++)
          for (let c = 0; c < c2; c++) matrix[a * c2 + c] = value(st + 16 + (a * c2 + c) * pairSize)
        subtables.push({ format: 2, cov, cd1, cd2, c1, c2, matrix })
      }
    }
    if (subtables.length) lookups.push(subtables)
  }
  if (!lookups.length) return empty

  const resolve = (g1, g2) => {
    let total = 0
    for (const subtables of lookups) {
      for (const sub of subtables) {
        if (!sub.cov.has(g1)) continue
        if (sub.format === 1) {
          const v = sub.pairs.get(g1)?.get(g2)
          if (v === undefined) continue
          total += v
          break
        }
        const k1 = sub.cd1.get(g1) ?? 0
        const k2 = sub.cd2.get(g2) ?? 0
        if (k1 >= sub.c1 || k2 >= sub.c2) continue
        total += sub.matrix[k1 * sub.c2 + k2]
        break
      }
    }
    return total
  }

  // Full pair table over the reading alphabet, then class compression. The
  // alphabet is what en / pt / la / it running text is made of — letters,
  // digits, punctuation, the macron vowels and ligatures of liturgical Latin —
  // rather than every glyph the face ships: Merriweather kerns each of its
  // Vietnamese letters individually against everything, and none of that can
  // occur in a line the breaker will ever set.
  const cps = [...glyphOf.keys()].filter(kernAlphabet)
  const rowOf = new Map() // cp1 -> Map(cp2 -> value), non-zero only
  for (const cp1 of cps) {
    const g1 = glyphOf.get(cp1)
    const row = new Map()
    for (const cp2 of cps) {
      const v = resolve(g1, glyphOf.get(cp2))
      if (v) row.set(cp2, v)
    }
    if (row.size) rowOf.set(cp1, row)
  }
  if (!rowOf.size) return empty

  const columnOf = new Map() // cp2 -> Map(cp1 -> value)
  for (const [cp1, row] of rowOf)
    for (const [cp2, v] of row) {
      let col = columnOf.get(cp2)
      if (!col) columnOf.set(cp2, (col = new Map()))
      col.set(cp1, v)
    }
  const signature = (m) =>
    [...m]
      .sort((a, c) => a[0] - c[0])
      .map(([k, v]) => `${k}:${v}`)
      .join(',')
  const classify = (byCp) => {
    const classOf = new Map()
    const representative = []
    const bySignature = new Map()
    for (const [cp, m] of byCp) {
      const sig = signature(m)
      let cls = bySignature.get(sig)
      if (cls === undefined) {
        cls = representative.length
        bySignature.set(sig, cls)
        representative.push(cp)
      }
      classOf.set(cp, cls)
    }
    return { classOf, representative }
  }
  const left = classify(rowOf)
  const right = classify(columnOf)
  const rows = left.representative.map((cp1) => {
    const row = rowOf.get(cp1)
    let encoded = ''
    for (const cp2 of right.representative) encoded += encodeCell(row.get(cp2) ?? 0)
    return encoded
  })
  const flat = (classOf) => {
    const out = []
    for (const [cp, cls] of [...classOf].sort((a, c) => a[0] - c[0])) out.push(cp, cls)
    return out
  }
  return { left: flat(left.classOf), right: flat(right.classOf), rows }
}

// The characters that can sit next to each other in a line of the corpus's
// languages. Pairs outside this set are not carried; the runtime treats them
// as unkerned and the renderer's headroom absorbs the difference.
function kernAlphabet(cp) {
  if (cp >= 0x20 && cp < 0x7f) return true
  if (cp >= 0xc0 && cp <= 0xff) return cp !== 0xd7 && cp !== 0xf7
  if (cp >= 0x2010 && cp <= 0x2027) return true
  if (cp >= 0xfb00 && cp <= 0xfb04) return true
  return '¡¿«»ºª·§ĀāĒēĪīŌōŪūĂăĔĕĬĭŎŏŬŭŒœŸǼǽǢǣ‰′″'.includes(String.fromCodePoint(cp))
}

// A kerning cell is two characters from a 90-symbol alphabet (printable ASCII
// minus quote, backslash and backtick, so the string embeds verbatim), giving
// 8,100 values centred on zero: ±4,049 font units, which no face approaches.
// Two bytes per cell, stored as Latin-1 by Hermes — a JSON number array costs
// four to five bytes per number in the bytecode and lists an index besides.
const cellAlphabet = (() => {
  let s = ''
  for (let c = 0x21; c < 0x7f; c++) {
    const ch = String.fromCharCode(c)
    if (ch !== "'" && ch !== '"' && ch !== '\\' && ch !== '`') s += ch
  }
  return s
})()
export const cellRadix = cellAlphabet.length
export const cellOffset = Math.floor((cellRadix * cellRadix) / 2)
function encodeCell(value) {
  const n = value + cellOffset
  if (n < 0 || n >= cellRadix * cellRadix) throw new Error(`kern value out of range: ${value}`)
  return cellAlphabet[Math.floor(n / cellRadix)] + cellAlphabet[n % cellRadix]
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
    out[id] ??= {}
    out[id][face] = readMetrics(path)
  }
}
if (!Object.keys(out).length) {
  throw new Error(`build-font-metrics: no fonts resolved. Missing: ${missing.join(', ')}`)
}
if (missing.length) console.warn(`build-font-metrics: skipped ${missing.join(', ')}`)

// Emit compactly: a codepoint-sorted advance list rather than an object, so
// the generated file stays small and diffs stay readable.
const emitFace = (m) => {
  const cps = Object.keys(m.widths).map(Number).sort((a, b) => a - b)
  const k = m.kern
  const kern = `kern: { left: [${k.left.join(',')}], right: [${k.right.join(',')}], rows: [${k.rows.map((r) => `'${r}'`).join(',')}] }`
  return `{ unitsPerEm: ${m.unitsPerEm}, codepoints: [${cps.join(',')}], advances: [${cps.map((c) => m.widths[c]).join(',')}], ${kern} }`
}
const body = Object.entries(out)
  .map(
    ([id, faces]) =>
      `  '${id}': {\n${Object.entries(faces)
        .map(([name, m]) => `    ${name}: ${emitFace(m)},`)
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
  /**
   * GPOS pair kerning over the reading alphabet, resolved per codepoint pair
   * and re-derived into classes (left = distinct rows, right = distinct
   * columns). \`left\` and \`right\` are interleaved \`codepoint, class\` pairs.
   * \`rows[leftClass]\` is a dense row over the right classes, two characters
   * per cell: base-${cellRadix} digits from the alphabet below, offset by
   * ${cellOffset}, in font units.
   */
  kern: { left: number[]; right: number[]; rows: string[] }
}

/** Digit alphabet of the kerning cells, in order. */
export const kernCellAlphabet = ${JSON.stringify(cellAlphabet)}
export const kernCellOffset = ${cellOffset}

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
