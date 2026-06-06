/**
 * Strip HTML markup to plain text. Used by the book-reader search and
 * footnote popover (and any other surface that needs to render or scan
 * authored HTML as text).
 *
 * `preserveLineBreaks` keeps paragraph breaks as `\n\n` and `<br>` as `\n` —
 * useful when the downstream surface (`<Text>` on RN) can render newlines.
 * Default false: collapse to single whitespace, suitable for index/search.
 */
export function stripHtml(html: string, opts?: { preserveLineBreaks?: boolean }): string {
  const preserve = opts?.preserveLineBreaks === true
  let s = html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '')

  if (preserve) {
    s = s.replace(/<br\s*\/?>(?!\s*<)/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
  } else {
    s = s
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/?(p|div|h[1-6]|li|blockquote|section)\b[^>]*>/gi, ' ')
  }

  s = s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  return preserve ? s.trim() : s.replace(/\s+/g, ' ').trim()
}
