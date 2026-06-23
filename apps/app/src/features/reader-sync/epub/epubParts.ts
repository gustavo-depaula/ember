// Builders for the fixed XML/XHTML parts of an EPUB. We ship both an EPUB3 nav
// (`nav.xhtml`) and an EPUB2 NCX (`toc.ncx`) because e-ink EPUB engines are
// inconsistent about which they honor.

import { xmlEscape } from '../serialize/inline'
import type { EpubChapter, EpubInput } from '../types'

// Filename-safe stem within the EPUB for a chapter.
export function chapterFile(ch: EpubChapter, index: number): string {
  const slug = ch.id
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
  return `${String(index + 1).padStart(3, '0')}-${slug || 'chapter'}`
}

export function chapterDocument(ch: EpubChapter): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
<meta charset="utf-8"/>
<title>${xmlEscape(ch.title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
${ch.xhtml}
</body>
</html>`
}

export const containerXml = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`

export function contentOpf(input: EpubInput, files: string[], modified: string): string {
  const uid = `urn:ember:reader-sync:${input.id}`
  const author = input.author ?? 'Ember'
  const date = input.date ?? modified

  const manifestItems = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `<item id="css" href="style.css" media-type="text/css"/>`,
    ...files.map(
      (f, i) => `<item id="ch${i}" href="${f}.xhtml" media-type="application/xhtml+xml"/>`,
    ),
    ...input.images.map(
      (img) =>
        `<item id="img-${img.hash}" href="images/${img.hash}.${img.ext}" media-type="${img.mime}"/>`,
    ),
  ].join('\n    ')

  const spine = files.map((_, i) => `<itemref idref="ch${i}"/>`).join('\n    ')

  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${input.language}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${uid}</dc:identifier>
    <dc:title>${xmlEscape(input.title)}</dc:title>
    <dc:language>${input.language}</dc:language>
    <dc:creator>${xmlEscape(author)}</dc:creator>
    <dc:date>${date}</dc:date>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spine}
  </spine>
</package>`
}

export function navXhtml(input: EpubInput, files: string[]): string {
  const items = input.chapters
    .map((ch, i) => `<li><a href="${files[i]}.xhtml">${xmlEscape(ch.title)}</a></li>`)
    .join('\n      ')
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${input.language}">
<head><meta charset="utf-8"/><title>${xmlEscape(input.title)}</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${xmlEscape(input.title)}</h1>
    <ol>
      ${items}
    </ol>
  </nav>
</body>
</html>`
}

export function tocNcx(input: EpubInput, files: string[]): string {
  const points = input.chapters
    .map(
      (ch, i) => `<navPoint id="np${i}" playOrder="${i + 1}">
      <navLabel><text>${xmlEscape(ch.title)}</text></navLabel>
      <content src="${files[i]}.xhtml"/>
    </navPoint>`,
    )
    .join('\n    ')
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="${input.language}">
  <head>
    <meta name="dtb:uid" content="urn:ember:reader-sync:${input.id}"/>
  </head>
  <docTitle><text>${xmlEscape(input.title)}</text></docTitle>
  <navMap>
    ${points}
  </navMap>
</ncx>`
}
