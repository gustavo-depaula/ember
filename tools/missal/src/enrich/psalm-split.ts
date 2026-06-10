import type { Line, Segment } from '@ember/missal-schema'

/**
 * Responsorial-psalm splitting, ported from refine.py (battle-tested over 23
 * audit cycles): a psalm body arrives as a flat per-language `Line[]` mixing
 * the refrain (anchored by a leading "℟." rubric), optional alternate
 * refrains ("vel" / "Or:" / "O bien:" / "Oppure:" / "Ou:" / "Oder:"), and the
 * verses between refrain repetitions. Output: { primary, alternatives, verses }.
 */

const altMarkers = new Set(['vel', 'or', 'o bien', 'ou', 'oppure', 'oder'])

function isAnchorLine(line: Line): boolean {
  const first = line[0]
  return first?.type === 'rubric' && first.text.includes('℟')
}

function isAltMarkerLine(line: Line): boolean {
  const first = line[0]
  if (first?.type !== 'rubric') return false
  const t = first.text.trim().toLowerCase().replace(/[:.]+$/, '').trim()
  return altMarkers.has(t)
}

function altMarkerLineHasContent(line: Line): boolean {
  return line.length >= 2 && line.slice(1).some((s) => s.type === 'text' || s.type === 'response')
}

function stripAnchorRubric(line: Line): Line {
  const first = line[0]
  if (first?.type === 'rubric' && first.text.includes('℟')) return line.slice(1)
  return [...line]
}

function joinBlockText(block: Line[]): string {
  const parts: string[] = []
  for (const line of block) {
    for (const seg of line) {
      if ((seg.type === 'text' || seg.type === 'response') && seg.text) parts.push(seg.text)
    }
  }
  return parts.join(' ').trim()
}

export interface PsalmSplit {
  primary: Line[]
  alternatives: Line[][]
  verses: Line[][]
}

export function splitPsalmLines(lines: Line[]): PsalmSplit | undefined {
  if (lines.length === 0) return undefined

  const anchors = lines.map((ln, i) => (isAnchorLine(ln) ? i : -1)).filter((i) => i >= 0)
  if (anchors.length === 0) return splitWithoutAnchors(lines)

  const lastAnchor = anchors[anchors.length - 1]

  // Canonical refrain spans from the last anchor to the next alt-marker (or EOF).
  let nextAltAfterLast: number | undefined
  for (let i = lastAnchor + 1; i < lines.length; i++) {
    if (isAltMarkerLine(lines[i])) {
      nextAltAfterLast = i
      break
    }
  }
  const canonicalLen = Math.max(
    1,
    nextAltAfterLast !== undefined ? nextAltAfterLast - lastAnchor : lines.length - lastAnchor,
  )

  const canonicalBlock = lines.slice(lastAnchor, lastAnchor + canonicalLen)
  canonicalBlock[0] = stripAnchorRubric(canonicalBlock[0])
  const canonicalText = joinBlockText(canonicalBlock)

  const nextAnchorOrEof = [...anchors.slice(1), lines.length]
  const primaryLens = anchors.map((anchor, k) => {
    const maxLen = Math.min(canonicalLen, nextAnchorOrEof[k] - anchor)
    // Prefer the shortest length matching the canonical refrain text — handles
    // the first anchor compressed onto a single line.
    for (let len = 1; len <= maxLen; len++) {
      const block = lines.slice(anchor, anchor + len)
      block[0] = stripAnchorRubric(block[0])
      if (joinBlockText(block) === canonicalText) return len
    }
    return maxLen
  })

  const rawAlternatives: Line[][] = []
  const verses: Line[][] = []

  anchors.forEach((anchor, k) => {
    const blockEnd = nextAnchorOrEof[k]
    let i = anchor + primaryLens[k]

    while (i < blockEnd && isAltMarkerLine(lines[i])) {
      const altEnd = altMarkerLineHasContent(lines[i]) ? i + 1 : Math.min(i + 2, blockEnd)
      rawAlternatives.push(lines.slice(i, altEnd))
      i = altEnd
    }

    const verse = lines.slice(i, blockEnd)
    if (verse.length > 0) verses.push(verse)
  })

  // Each anchor block repeats the same alt(s); keep one copy per distinct text.
  const seenAlts = new Map<string, Line[]>()
  for (const alt of rawAlternatives) {
    let bodyOnly = [...alt]
    const firstSeg: Segment | undefined = bodyOnly[0]?.[0]
    if (firstSeg?.type === 'rubric') {
      bodyOnly[0] = bodyOnly[0].slice(1)
      if (bodyOnly[0].length === 0) bodyOnly = bodyOnly.slice(1)
    }
    const key = joinBlockText(bodyOnly)
    if (key && !seenAlts.has(key)) seenAlts.set(key, bodyOnly)
  }

  return { primary: canonicalBlock, alternatives: [...seenAlts.values()], verses }
}

/**
 * No "℟." anchors at all: detect the refrain as the longest leading block
 * whose joined text repeats verbatim later (longer first — short prefixes can
 * falsely match). Verses are the gaps between repetitions.
 */
function splitWithoutAnchors(lines: Line[]): PsalmSplit | undefined {
  for (const refrainLen of [4, 3, 2, 1]) {
    if (lines.length < refrainLen * 2) continue
    const candidate = lines.slice(0, refrainLen)
    const candidateText = joinBlockText(candidate)
    if (!candidateText) continue

    const positions: number[] = []
    let i = 0
    while (i <= lines.length - refrainLen) {
      if (joinBlockText(lines.slice(i, i + refrainLen)) === candidateText) {
        positions.push(i)
        i += refrainLen
      } else {
        i += 1
      }
    }
    if (positions.length < 2) continue

    const verses: Line[][] = []
    positions.forEach((pos, k) => {
      const start = pos + refrainLen
      const end = k + 1 < positions.length ? positions[k + 1] : lines.length
      if (start < end) verses.push(lines.slice(start, end))
    })
    return { primary: [...candidate], alternatives: [], verses }
  }
  return undefined
}
