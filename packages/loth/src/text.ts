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
