// SVG path data taken apart, so a shape can be re-placed point by point.

export type Segment = { command: 'M' | 'L' | 'C' | 'Q' | 'Z'; points: number[] }

const argCount: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, Z: 0 }
const token = /([MmLlHhVvCcSsQqTtZz])|(-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?)/g

/** A path as absolute moves, lines and curves only, so it can be re-placed point by point. */
export function absoluteSegments(d: string): Segment[] {
  const out: Segment[] = []
  let command = ''
  let args: number[] = []
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  // The last control point, which a smooth curve (`S`, `T`) mirrors.
  let controlX = 0
  let controlY = 0
  let previous = ''

  const flush = () => {
    const upper = command.toUpperCase()
    const relative = command !== upper
    const ox = relative ? x : 0
    const oy = relative ? y : 0
    const a = args
    args = []
    switch (upper) {
      case 'M':
        x = startX = a[0] + ox
        y = startY = a[1] + oy
        out.push({ command: 'M', points: [x, y] })
        // Further pairs after a moveto are linetos.
        command = relative ? 'l' : 'L'
        break
      case 'L':
        x = a[0] + ox
        y = a[1] + oy
        out.push({ command: 'L', points: [x, y] })
        break
      case 'H':
        x = a[0] + ox
        out.push({ command: 'L', points: [x, y] })
        break
      case 'V':
        y = a[0] + oy
        out.push({ command: 'L', points: [x, y] })
        break
      case 'C':
      case 'S': {
        const smooth = upper === 'S'
        const mirrors = previous === 'C' || previous === 'S'
        const c1x = smooth ? (mirrors ? 2 * x - controlX : x) : a[0] + ox
        const c1y = smooth ? (mirrors ? 2 * y - controlY : y) : a[1] + oy
        const rest = smooth ? a : a.slice(2)
        controlX = rest[0] + ox
        controlY = rest[1] + oy
        x = rest[2] + ox
        y = rest[3] + oy
        out.push({ command: 'C', points: [c1x, c1y, controlX, controlY, x, y] })
        break
      }
      case 'Q':
      case 'T': {
        const smooth = upper === 'T'
        const mirrors = previous === 'Q' || previous === 'T'
        controlX = smooth ? (mirrors ? 2 * x - controlX : x) : a[0] + ox
        controlY = smooth ? (mirrors ? 2 * y - controlY : y) : a[1] + oy
        const end = smooth ? a : a.slice(2)
        x = end[0] + ox
        y = end[1] + oy
        out.push({ command: 'Q', points: [controlX, controlY, x, y] })
        break
      }
    }
    previous = upper
  }

  for (const match of d.matchAll(token)) {
    if (match[1]) {
      command = match[1]
      if (command === 'Z' || command === 'z') {
        out.push({ command: 'Z', points: [] })
        x = startX
        y = startY
        previous = 'Z'
      }
      continue
    }
    args.push(Number(match[2]))
    if (args.length === argCount[command.toUpperCase()]) flush()
  }
  return out
}

const round = (n: number) => String(Math.round(n * 100) / 100)

/**
 * Path data again, every point passed through `place`. Absolute commands only,
 * so the result can be joined to any other path.
 */
export function placed(
  segments: Segment[],
  place: (x: number, y: number) => [number, number],
): string {
  let d = ''
  for (const { command, points } of segments) {
    d += command
    for (let i = 0; i < points.length; i += 2) {
      const [x, y] = place(points[i], points[i + 1])
      d += `${i ? ' ' : ''}${round(x)} ${round(y)}`
    }
  }
  return d
}
