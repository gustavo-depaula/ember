const deg = (a: number) => (a * Math.PI) / 180

export function petalPath(cx: number, cy: number, r: number, angle: number) {
  const a = deg(angle)
  const tipX = cx + Math.cos(a) * r
  const tipY = cy + Math.sin(a) * r
  const perpAngle = a + Math.PI / 2
  const width = r * 0.35
  const cp1x = cx + Math.cos(a) * r * 0.5 + Math.cos(perpAngle) * width
  const cp1y = cy + Math.sin(a) * r * 0.5 + Math.sin(perpAngle) * width
  const cp2x = cx + Math.cos(a) * r * 0.5 - Math.cos(perpAngle) * width
  const cp2y = cy + Math.sin(a) * r * 0.5 - Math.sin(perpAngle) * width
  return `M${cx} ${cy} C${cp1x} ${cp1y} ${cp1x + Math.cos(a) * r * 0.3} ${cp1y + Math.sin(a) * r * 0.3} ${tipX} ${tipY} C${cp2x + Math.cos(a) * r * 0.3} ${cp2y + Math.sin(a) * r * 0.3} ${cp2x} ${cp2y} ${cx} ${cy}Z`
}

export function flowerPaths(cx: number, cy: number, r: number, petalCount = 5) {
  const step = 360 / petalCount
  return Array.from({ length: petalCount }, (_, i) => petalPath(cx, cy, r, i * step - 90))
}

export function leafPath(x: number, y: number, size: number, angle: number) {
  const a = deg(angle)
  const tipX = x + Math.cos(a) * size
  const tipY = y + Math.sin(a) * size
  const perpAngle = a + Math.PI / 2
  const w = size * 0.4
  const cp1x = x + Math.cos(a) * size * 0.5 + Math.cos(perpAngle) * w
  const cp1y = y + Math.sin(a) * size * 0.5 + Math.sin(perpAngle) * w
  const cp2x = x + Math.cos(a) * size * 0.5 - Math.cos(perpAngle) * w
  const cp2y = y + Math.sin(a) * size * 0.5 - Math.sin(perpAngle) * w
  return `M${x} ${y} Q${cp1x} ${cp1y} ${tipX} ${tipY} Q${cp2x} ${cp2y} ${x} ${y}Z`
}

export function tendrilPath(x1: number, y1: number, x2: number, y2: number, curl = 8) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const nx = -dy
  const ny = dx
  const len = Math.sqrt(nx * nx + ny * ny) || 1
  const cpx = mx + (nx / len) * curl
  const cpy = my + (ny / len) * curl
  return `M${x1} ${y1} Q${cpx} ${cpy} ${x2} ${y2}`
}
