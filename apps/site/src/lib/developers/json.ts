// Pretty JSON as HTML, for the build's examples and the portal's live consoles alike. Plain
// TypeScript with no imports, so the browser bundle can take it as it is.

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
}

const token = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

/**
 * `text` (already indented JSON) with each token wrapped in a class. `link` may turn a string
 * value into markup of its own (a hash the explorer can follow), given its decoded contents and
 * the key it was last written under.
 */
export function highlightJson(
  text: string,
  link?: (value: string, key?: string) => string | undefined,
): string {
  let out = ''
  let last = 0
  let key: string | undefined
  for (const match of text.matchAll(token)) {
    const [whole, string, colon, literal] = match
    out += escapeHtml(text.slice(last, match.index))
    last = match.index + whole.length
    if (string && colon) {
      key = JSON.parse(string) as string
      out += `<span class="j-key">${escapeHtml(string)}</span>${colon}`
    } else if (string) {
      const linked = link?.(JSON.parse(string) as string, key)
      out += linked ?? `<span class="j-str">${escapeHtml(string)}</span>`
    } else if (literal) out += `<span class="j-lit">${literal}</span>`
    else out += `<span class="j-num">${whole}</span>`
  }
  return out + escapeHtml(text.slice(last))
}
