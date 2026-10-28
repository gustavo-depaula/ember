import { fetchClerusPage, paragraphsOf } from './place'

// A homily or an address in one of Clerus's collections: it opens under one or
// more headings (the day, the occasion), the last of them at `anchor`, and
// runs to the next heading, which can be some pages on.

// A heading is an <h2>, or an <h1> set in the middle of the page.
const heading = /<a Name=\w+>(?:<center>)?<h[12]>.*?<\/h[12]>(?:<\/center>)?/gs

/**
 * What a page holds of the text that opens at `anchor`, or that began on the
 * page before (no anchor): its markup, and whether it ends on this page.
 */
export function talkOnPage(page: string, anchor?: string): { markup: string; ended: boolean } {
  const body = page.split('<hr><center>')[0]
  const from = (() => {
    if (anchor === undefined) return body.search(/<body[^>]*>/i)
    const opening = new RegExp(
      `<a Name=${anchor}>(?:<center>)?<h[12]>.*?</h[12]>(?:</center>)?`,
      's',
    ).exec(body)
    return opening ? opening.index + opening[0].length : -1
  })()
  if (from < 0) return { markup: '', ended: true }
  const rest = body.slice(from)
  const next = [...rest.matchAll(heading)].at(0)
  return next === undefined
    ? { markup: rest, ended: false }
    : { markup: rest.slice(0, next.index), ended: true }
}

/** The page after this one in its work, as the foot of the page links it. */
export function nextPage(page: string): string | undefined {
  return /<a href=(\w+)\.htm><img title=Nach /.exec(page)?.[1]
}

// A homily runs a page or two; an address that never meets a next heading is
// the last of its collection, and is not followed past this.
const pagesAtMost = 6

/** A homily or an address on Clerus, read from the site, in paragraphs. */
export async function fetchClerusTalk(file: string, anchor: string): Promise<string[]> {
  let page = await fetchClerusPage(file)
  let part = talkOnPage(page, anchor)
  let markup = part.markup
  for (let read = 1; !part.ended && read < pagesAtMost; read++) {
    const next = nextPage(page)
    if (next === undefined) break
    page = await fetchClerusPage(next)
    part = talkOnPage(page)
    markup += part.markup
  }
  // The numbers Clerus counts a collection's texts by stand in the text.
  const paragraphs = paragraphsOf(markup.replace(/<a name=\w+><b>\d+<\/b>/g, ''))
  if (paragraphs.length === 0) throw new Error(`Biblia Clerus: nothing at ${file}.htm#${anchor}`)
  return paragraphs
}
