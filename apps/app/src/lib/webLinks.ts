// A practice's page on the website, and the way back from that page's address
// to the practice. A shared link is the web address: a phone with the app
// installed opens it here (universal link / app link), any other opens the page.

export const siteOrigin = 'https://ember.dpgu.me'

// The website's prayer section in each language. apps/site/src/routes.ts owns
// the URL space; its tests hold these to it, and to app.json's intent filters.
export const practiceWebPaths: Record<string, string> = {
  'en-US': '/prayers',
  'pt-BR': '/pt/oracoes',
}

export function practiceWebUrl(practiceId: string, language: string): string {
  const section = practiceWebPaths[language] ?? practiceWebPaths['en-US']
  // The page's slug is the id without its kind (`practice/rosary` → `rosary`).
  const slug = practiceId.slice(practiceId.indexOf('/') + 1)
  return `${siteOrigin}${section}/${slug}/`
}

/**
 * The practice a website address presents, whether the system hands over the
 * whole URL or its path. A novena's day page (`/prayers/x/day-3/`) leads to the
 * novena: the app opens it at the reader's own day.
 */
export function practiceIdFromWebPath(url: string): string | undefined {
  const path = url.startsWith(siteOrigin) ? url.slice(siteOrigin.length) : url
  for (const section of Object.values(practiceWebPaths)) {
    if (!path.startsWith(`${section}/`)) continue
    const slug = path.slice(section.length + 1).split(/[/?#]/)[0]
    if (slug) return decodeSlug(slug)
  }
  return undefined
}

function decodeSlug(slug: string): string | undefined {
  // A link is typed and pasted by anyone: a malformed escape is no practice,
  // not a crash on launch.
  try {
    return decodeURIComponent(slug)
  } catch {
    return undefined
  }
}
