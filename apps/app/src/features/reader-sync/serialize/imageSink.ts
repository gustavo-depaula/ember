// Collects the corpus images a document references so the packager can embed
// them as real zip entries. `corpus://<hash>.<ext>` → `images/<hash>.<ext>`;
// any other URI (data:, http) passes through untouched.

import { mimeForPath } from '@/lib/mime'
import type { ImageRef } from '../types'
import type { ImageSink } from './primitivesToXhtml'

export function createImageSink(): { sink: ImageSink; getImages: () => ImageRef[] } {
  const seen = new Map<string, ImageRef>()

  const sink: ImageSink = (src) => {
    if (!src.startsWith('corpus://')) return src
    const path = src.slice('corpus://'.length)
    const dot = path.indexOf('.')
    const hash = dot === -1 ? path : path.slice(0, dot)
    const ext = dot === -1 ? 'jpg' : path.slice(dot + 1)
    if (!seen.has(hash)) {
      seen.set(hash, { hash, ext, mime: mimeForPath(path) })
    }
    return `images/${hash}.${ext}`
  }

  return { sink, getImages: () => Array.from(seen.values()) }
}
