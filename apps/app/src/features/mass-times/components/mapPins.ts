// Stained-glass jewel tones so the directory pins aren't a monotone wall of gold — each church gets a
// stable color hashed from its name (favorites stay the burgundy heart, see below).
const pinPalette = [
  '#C9A84C', // gold
  '#B23A48', // crimson
  '#2F5C9E', // royal blue
  '#2E8B57', // emerald
  '#6A4C93', // violet
  '#D08C34', // amber
  '#2A9D8F', // teal
  '#C45B7C', // rose
  '#3D4EA8', // indigo
  '#4F7942', // forest
]

export function pinColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return pinPalette[Math.abs(hash) % pinPalette.length]
}

// Marks a cluster's marker id apart from a church's.
export const clusterPrefix = 'cluster:'
