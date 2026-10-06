export type Verse = {
  verse: number
  text: string
}

/** A translation read from its publisher, one chapter per request. */
export type WebBible = {
  /** Books whose chapter count differs from the Douay-Rheims'. */
  chapters?: Record<string, number>
  fetchChapter: (book: string, chapter: number) => Promise<Verse[]>
}

export async function fetchOk(url: string, site: string): Promise<Response> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${site}: ${url} answered ${res.status}`)
  return res
}
