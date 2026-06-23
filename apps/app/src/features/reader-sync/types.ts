// Reader Sync — serve Ember prayer content to a Xteink X4 (CrossPoint firmware)
// over the local network as EPUBs, browsable through an OPDS catalog. See
// docs/features/reader-sync.md.

// A corpus image the serializer encountered and wants embedded in the EPUB.
// The packager turns each into an `OEBPS/images/<hash>.<ext>` zip entry whose
// bytes come from `getBlob(hash)`.
export type ImageRef = {
  hash: string
  ext: string
  mime: string
}

export type EpubChapter = {
  // Stable, filename-safe within the EPUB (becomes `<id>.xhtml`).
  id: string
  title: string
  // Body markup only — the packager wraps it in the XHTML document shell.
  xhtml: string
}

export type EpubInput = {
  // Stable id, also the download filename stem (`<id>.epub`).
  id: string
  title: string
  // BCP-47 / content language of the book (`en-US`, `pt-BR`, `la`).
  language: string
  author?: string
  // ISO-8601; defaults applied by the packager when omitted.
  date?: string
  chapters: EpubChapter[]
  images: ImageRef[]
}

// One downloadable EPUB the reader can browse to. `build` is lazy so a heavy
// document is only rendered when the reader actually GETs the file.
export type SyncDocument = {
  id: string
  title: string
  summary?: string
  category: 'daily' | 'library' | 'practice'
  // ISO-8601; drives the OPDS `<updated>` and date-scoped entry id.
  updated: string
  build: () => Promise<EpubInput>
}

export type ServerHandle = {
  url: string
  ip: string
  port: number
  stop: () => Promise<void>
}
