export type Verse = {
  verse: number
  text: string
}

/** A translation read from its publisher, one request per chapter read. */
export type WebBible = {
  /** Books whose chapter count differs from the Douay-Rheims'. */
  chapters?: Record<string, number>
  /** The chapter asked for, with any others that came in the same response. */
  fetchChapters: (book: string, chapter: number) => Promise<Record<number, Verse[]>>
}

export async function fetchOk(url: string, site: string): Promise<Response> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${site}: ${url} answered ${res.status}`)
  return res
}
