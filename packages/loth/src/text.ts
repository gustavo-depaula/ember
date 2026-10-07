// The shapes of the text in `content/loth/`.

export type Mark =
  | 'rubric'
  | 'bold'
  | 'italic'
  // A verse number, set raised and red before its verse.
  | 'num'
  // A raised note in red: "(Séc. V)", "em latim".
  | 'note'
  // A pointer to a complementary text (a Latin version, the examination of
  // conscience); `to` is its id.
  | 'link'

// A run of text: plain, or marked. Keys are short because the corpus holds
// hundreds of thousands of these.
export type Seg = string | { m: Mark; t: string; to?: string }
export type Line = Seg[]

export interface Block {
  // A paragraph or stanza, or the title that opens a part of the hour.
  k: 'p' | 'title'
  lines: Line[]
}

export const segText = (seg: Seg): string => (typeof seg === 'string' ? seg : seg.t)
export const lineText = (line: Line): string => line.map(segText).join('')
export const blockText = (block: Block): string => block.lines.map(lineText).join('\n')

/**
 * The letters and digits of a text: what must survive any change of form.
 * The label of a versicle or a response is left out, because the source
 * writes the same one now as "V." and now as "℣.".
 */
export function wordsOf(text: string): string {
  return text
    .normalize('NFC')
    .replace(/(?<![\p{L}\p{N}])[VR]\s?[./](?=\s*[\p{Lu}“"'‘(])/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase()
}

/** The words of a run of blocks, each line and block kept apart. */
export const wordsOfBlocks = (blocks: Block[]): string => wordsOf(blocks.map(blockText).join('\n'))
