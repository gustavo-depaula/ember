// HTML entity decoder for the subset that appears on vatican.va.
// Numeric entities (&#x201c;, &#8220;) and the named entities we actually see.

const namedEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
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
      const num = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      if (Number.isFinite(num) && num > 0 && num < 0x110000) return String.fromCodePoint(num)
      return ''
    }
    const c = namedEntities[body]
    return c !== undefined ? c : `&${body};`
  })
}

// Fix the stray `Â` mojibake that vatican.va's source embeds before
// typographic punctuation (legacy UTF-8↔Latin-1 round-trip damage from the
// original publishing pipeline). `Â ` → ` ` and isolated `Â` before
// typographic chars is dropped.
export function fixMojibake(text: string): string {
  return text.replace(/Â /g, ' ').replace(/Â(?=[‐-‰ ])/g, '')
}

// Strip Microsoft Office conditional comments and `<o:p>` filler tags that
// litter the source HTML.
export function stripOfficeNoise(html: string): string {
  return html
    .replace(/<!--\[if[^\]]*\]-->/g, '')
    .replace(/<!--\[endif\]-->/g, '')
    .replace(/<\/?o:p[^>]*>/g, '')
}

// Drop the legacy <font> wrappers — book.css owns colors and sizes.
export function stripFontTags(html: string): string {
  return html.replace(/<\/?font[^>]*>/gi, '')
}

// The source uses tables purely for layout (page chrome, side-by-side
// Latin/English prayer columns). Drop the wrapper tags and keep inner content
// inline.
export function stripTableTags(html: string): string {
  return html.replace(/<\/?(?:table|tbody|thead|tfoot|tr|td|th)[^>]*>/gi, '')
}

// Drop alignment attributes and inline styles that fight book.css.
export function stripPresentationalAttrs(html: string): string {
  return html
    .replace(/\s+align="[^"]*"/gi, '')
    .replace(/\s+bgcolor="[^"]*"/gi, '')
    .replace(/\s+border="[^"]*"/gi, '')
    .replace(/\s+cellspacing="[^"]*"/gi, '')
    .replace(/\s+cellpadding="[^"]*"/gi, '')
    .replace(/\s+width="[^"]*"/gi, '')
    .replace(/\s+height="[^"]*"/gi, '')
    .replace(/\s+valign="[^"]*"/gi, '')
    .replace(/\s+bordercolor="[^"]*"/gi, '')
}

// Collapse runs of whitespace in the markup to keep diffs small.
export function collapseWhitespace(html: string): string {
  return html
    .replace(/[ \t\r\n]+/g, ' ')
    .replace(/>\s+</g, '>\n<')
    .trim()
}

// Drop the leftover layout/footnote `<div>` wrappers; book.css uses paragraphs
// and headings. Also collapses sequences of empty `<p>` (often spacers in the
// source) into a single blank line.
export function dropEmptyShells(html: string): string {
  return html
    .replace(/<\/?div[^>]*>/gi, '')
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br />\n<br />')
}
