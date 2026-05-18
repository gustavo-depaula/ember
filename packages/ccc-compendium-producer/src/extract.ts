import { buildAnchorIndex } from './chapters'
import type { ChapterId } from './types'

export const TOTAL_QUESTIONS = 598

const ANCHOR_INDEX = buildAnchorIndex()

export function chapterForQuestion(qNum: number): ChapterId {
  const entry = ANCHOR_INDEX[String(qNum)]
  if (!entry) throw new Error(`Q${qNum} is outside 1..${TOTAL_QUESTIONS}`)
  return entry.chapter
}

// Q range for a given program day. Days are 0-indexed (matching the
// completionCount cursor used by plan-of-life). The final day may have
// fewer than `qPerDay` questions because 598 isn't a multiple of 6.
export function programDayToQuestionRange(programDay: number, qPerDay: number): [number, number] {
  if (programDay < 0) throw new Error(`programDay must be >= 0 (got ${programDay})`)
  if (qPerDay < 1) throw new Error(`qPerDay must be >= 1 (got ${qPerDay})`)
  const first = programDay * qPerDay + 1
  if (first > TOTAL_QUESTIONS)
    throw new Error(
      `programDay ${programDay} is past the end of the Compendium (${TOTAL_QUESTIONS} Qs at ${qPerDay}/day)`,
    )
  const last = Math.min((programDay + 1) * qPerDay, TOTAL_QUESTIONS)
  return [first, last]
}

export function totalProgramDays(qPerDay: number): number {
  return Math.ceil(TOTAL_QUESTIONS / qPerDay)
}

// Extracts the contiguous HTML for one Q&A out of a cleaned chapter HTML:
// the `<p id="qN">…</p>` paragraph plus every following sibling up to (but
// excluding) the next `<p id="q…">`. Returns the slice with leading/trailing
// whitespace trimmed.
export function extractQuestion(chapterHtml: string, qNum: number): string {
  const startRe = new RegExp(`<p[^>]*\\sid="q${qNum}"[^>]*>`)
  const startMatch = startRe.exec(chapterHtml)
  if (!startMatch) throw new Error(`Q${qNum} not found in chapter HTML`)
  const startIdx = startMatch.index

  const nextStartRe = /<p[^>]*\sid="q\d+"[^>]*>/g
  nextStartRe.lastIndex = startIdx + startMatch[0].length
  const next = nextStartRe.exec(chapterHtml)
  const endIdx = next ? next.index : chapterHtml.length

  return chapterHtml.slice(startIdx, endIdx).trim()
}
