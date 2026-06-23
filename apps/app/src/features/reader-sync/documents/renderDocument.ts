// Turns rendered Primitive[] chapters into an EpubInput, sharing one image sink
// across the whole book so a corpus image referenced by several chapters is
// embedded once.

import type { Primitive } from '@/content/primitives'
import { createImageSink } from '../serialize/imageSink'
import { primitivesToXhtml } from '../serialize/primitivesToXhtml'
import type { EpubInput } from '../types'

export function buildEpubInput(opts: {
  id: string
  title: string
  language: string
  author?: string
  date?: string
  chapters: { id: string; title: string; primitives: Primitive[] }[]
}): EpubInput {
  const { sink, getImages } = createImageSink()
  const chapters = opts.chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    xhtml: primitivesToXhtml(ch.primitives, sink),
  }))
  return {
    id: opts.id,
    title: opts.title,
    language: opts.language,
    author: opts.author,
    date: opts.date,
    chapters,
    images: getImages(),
  }
}
