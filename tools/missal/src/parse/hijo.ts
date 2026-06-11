import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'
import { classes, cleanText, getText, parseSegments } from './segments'
import type { RawBlock, SourceLang } from './types'

function hijoIndex(el: Element): number | undefined {
  for (const cls of classes(el)) {
    if (cls.startsWith('hijo_')) {
      const n = Number(cls.slice('hijo_'.length))
      return Number.isInteger(n) ? n : undefined
    }
  }
  return undefined
}

/** Parse hijo_N blocks out of a per-language HTML file. */
export function parseHijoBlocks(html: string, lang: SourceLang): RawBlock[] {
  const $ = cheerio.load(html)

  // Anchored first: <div class="<lang> hijo hijo_N">. Some files (plegarias_euc
  // estructura embeds, etc.) omit the language class — fall back to any .hijo.
  let nodes = $(`div.${lang}.hijo`).toArray()
  if (nodes.length === 0) nodes = $('div.hijo').toArray()

  const out: RawBlock[] = []
  for (const node of nodes) {
    const n = hijoIndex(node)
    if (n === undefined) continue
    out.push({
      n,
      text: cleanText(getText(node)),
      segments: parseSegments(node),
    })
  }
  out.sort((a, b) => a.n - b.n)
  return out
}
