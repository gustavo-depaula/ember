// Packages an EpubInput into a valid EPUB (a ZIP with a fixed structure) using
// fflate — pure JS, no native module. `mimetype` is stored first and
// uncompressed, as the spec requires. Image bytes come from the corpus blob
// cache; an image that fails to load is dropped from both the zip and the
// manifest so the package stays valid.

import { strToU8, type Zippable, zipSync } from 'fflate'
import { getBlob } from '@/content/store'
import { epubCss } from '../serialize/styles'
import type { EpubInput } from '../types'
import {
  chapterDocument,
  chapterFile,
  containerXml,
  contentOpf,
  navXhtml,
  tocNcx,
} from './epubParts'

// EPUB3 dcterms:modified must be `YYYY-MM-DDTHH:MM:SSZ` (no milliseconds).
function epubTimestamp(iso?: string): string {
  const base = iso ?? new Date().toISOString()
  return base.replace(/\.\d+Z$/, 'Z')
}

export async function packageEpub(input: EpubInput): Promise<Uint8Array> {
  const fetched = await Promise.all(
    input.images.map(async (img) => {
      try {
        return { img, bytes: await getBlob(img.hash) }
      } catch (err) {
        console.warn(`[reader-sync] dropping image ${img.hash.slice(0, 8)}:`, err)
        return undefined
      }
    }),
  )
  const okImages = fetched.filter((x): x is NonNullable<typeof x> => x !== undefined)

  const effective: EpubInput = { ...input, images: okImages.map((x) => x.img) }
  const modified = epubTimestamp(input.date)
  const files = effective.chapters.map((ch, i) => chapterFile(ch, i))

  const zip: Zippable = {
    // First entry, stored (level 0), per the OCF spec.
    mimetype: [strToU8('application/epub+zip'), { level: 0 }],
    'META-INF/container.xml': strToU8(containerXml),
    'OEBPS/content.opf': strToU8(contentOpf(effective, files, modified)),
    'OEBPS/nav.xhtml': strToU8(navXhtml(effective, files)),
    'OEBPS/toc.ncx': strToU8(tocNcx(effective, files)),
    'OEBPS/style.css': strToU8(epubCss),
  }

  effective.chapters.forEach((ch, i) => {
    zip[`OEBPS/${files[i]}.xhtml`] = strToU8(chapterDocument(ch))
  })
  for (const { img, bytes } of okImages) {
    zip[`OEBPS/images/${img.hash}.${img.ext}`] = bytes
  }

  return zipSync(zip)
}
