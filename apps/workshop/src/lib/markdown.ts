import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'

const md = new Marked().use(markedFootnote())

export function parseMarkdown(text: string): string {
  return md.parse(text, { async: false }) as string
}
