// Cued-mode partitioning. Body lines 1..mastery are visible; the next line
// (mastery + 1) is the target the user must recite before tapping to reveal.
// Returns undefined target when mastery already covers the whole portion —
// mode selection won't pick Cued in that case, but the cards handle it
// defensively.
export function partitionLinesForCued(
  lines: string[],
  mastery: number,
): { visible: string[]; targetLine: string | undefined; targetLineNumber: number | undefined } {
  const clamped = Math.min(Math.max(mastery, 0), lines.length)
  const target = lines[clamped]
  return {
    visible: lines.slice(0, clamped),
    targetLine: target,
    targetLineNumber: target === undefined ? undefined : clamped + 1,
  }
}
