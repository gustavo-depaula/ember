import { readFileSync } from 'node:fs'
import { discoverAligned } from './discover'
import { parseEstructura } from './estructura'
import { parseHijoBlocks } from './hijo'
import { mergeDay } from './merge'
import type { ParsedCorpus, ParsedFile, RawBlock, SourceLang } from './types'
import { sourceLangs } from './types'

export { discoverAligned } from './discover'
export { collectParts, parseEstructura } from './estructura'
export { parseHijoBlocks } from './hijo'
export { mergeDay } from './merge'
export { cleanText, getText, parseSegments } from './segments'
export * from './types'

/** Parse the whole upstream clone into per-day structured payloads (in memory). */
export function parseCorpus(sourceRoot: string, log: (msg: string) => void = () => {}): ParsedCorpus {
  const files: ParsedFile[] = []

  for (const file of discoverAligned(sourceRoot)) {
    const langBlocks: Partial<Record<SourceLang, RawBlock[]>> = {}
    for (const lang of sourceLangs) {
      const path = file.langPaths[lang]
      if (!path) continue
      langBlocks[lang] = parseHijoBlocks(readFileSync(path, 'utf-8'), lang)
    }

    const days = file.estructuraPath
      ? parseEstructura(readFileSync(file.estructuraPath, 'utf-8')).map((day) =>
          mergeDay(file.category, file.basename, day, langBlocks),
        )
      : []

    const blockCounts: ParsedFile['blockCounts'] = {}
    for (const lang of sourceLangs) {
      const blocks = langBlocks[lang]
      if (blocks) blockCounts[lang] = blocks.length
    }

    files.push({
      category: file.category,
      basename: file.basename,
      languages: sourceLangs.filter((l) => file.langPaths[l] !== undefined),
      blockCounts,
      hasStructure: file.estructuraPath !== undefined,
      days,
    })
    log(`${file.category}/${file.basename}: ${days.length} day(s)`)
  }

  return { files }
}
