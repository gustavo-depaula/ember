// HTML entity decoder for the subset that appears on vatican.va.
// Numeric entities (&#x201c;, &#8220;) and the named entities we actually see.

const namedEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  middot: '·',
  Aacute: 'Á',
  aacute: 'á',
  Acirc: 'Â',
  acirc: 'â',
  Atilde: 'Ã',
  atilde: 'ã',
  Auml: 'Ä',
  auml: 'ä',
  Ccedil: 'Ç',
  ccedil: 'ç',
  Eacute: 'É',
  eacute: 'é',
  Ecirc: 'Ê',
  ecirc: 'ê',
  Iacute: 'Í',
  iacute: 'í',
  Oacute: 'Ó',
  oacute: 'ó',
  Ocirc: 'Ô',
  ocirc: 'ô',
  Otilde: 'Õ',
  otilde: 'õ',
  Uacute: 'Ú',
  uacute: 'ú',
  Uuml: 'Ü',
  uuml: 'ü',
  Ntilde: 'Ñ',
  ntilde: 'ñ',
  szlig: 'ß',
  euro: '€',
}

export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (_, body: string) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X'
      const num = Number.parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      if (Number.isFinite(num) && num > 0 && num < 0x110000) return String.fromCodePoint(num)
      return ''
    }
    const c = namedEntities[body]
    return c !== undefined ? c : `&${body};`
  })
}

const PRESENTATIONAL_ATTRS_RE =
  /\s+(?:align|bgcolor|border|cellspacing|cellpadding|width|height|valign|bordercolor)="[^"]*"/gi

// The source HTML is laden with publishing-pipeline noise: Microsoft Office
// conditional comments, `<o:p>` tags, layout tables, `<font>` color/size
// wrappers, and legacy Latin-1↔UTF-8 mojibake from before Unicode was
// universally pipeline-safe (a stray `Â` glued onto typographic punctuation).
// None of this carries semantic content; `book.css` styles via standard tags.
export function cleanChapter(html: string): string {
  const stripped = html
    .replace(/<!--\[(?:if[^\]]*|endif)\]-->/g, '')
    .replace(/<\/?o:p[^>]*>/g, '')
    .replace(/<\/?(?:table|tbody|thead|tfoot|tr|td|th)[^>]*>/gi, '')
    .replace(/<\/?font[^>]*>/gi, '')
    .replace(/<\/?div[^>]*>/gi, '')
    .replace(PRESENTATIONAL_ATTRS_RE, '')
  // Entity decode runs first so `&Acirc;` becomes the literal `Â` (for the
  // mojibake strip) and `&nbsp;` becomes a space (for the empty-shell strip).
  return decodeEntities(stripped)
    .replace(/Â /g, ' ')
    .replace(/Â(?=[‐-‰ ])/g, '')
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br />\n<br />')
    .replace(/[ \t\r\n]+/g, ' ')
    .replace(/>\s+</g, '>\n<')
    .replace(/(?:\s*<hr\s*\/?>\s*)+$/i, '')
    .trim()
}
