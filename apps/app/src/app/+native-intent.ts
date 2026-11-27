import { corpusRef, track } from '@/lib/usage'
import { practiceIdFromWebPath } from '@/lib/webLinks'

// The app answers the website's prayer addresses (ios.associatedDomains and
// android.intentFilters in app.json), which are not its own routes: a shared
// `/pt/oracoes/rosary/` opens the Rosary's prayer page.
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string {
  const practiceId = practiceIdFromWebPath(path)
  // What the website and shared links bring in: a prayer's web address, or any
  // web link. The app's own scheme opens here too (the dev client), and is not
  // a link from outside.
  if (practiceId || /^https?:/.test(path)) {
    const id = corpusRef(practiceId, 'practice')
    track('link_opened', { start: initial ? 'cold' : 'warm', ...(id ? { id } : {}) })
  }
  return practiceId ? `/pray/${encodeURIComponent(practiceId)}` : path
}
