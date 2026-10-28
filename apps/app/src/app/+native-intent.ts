import { practiceIdFromWebPath } from '@/lib/webLinks'

// The app answers the website's prayer addresses (ios.associatedDomains and
// android.intentFilters in app.json), which are not its own routes: a shared
// `/pt/oracoes/rosary/` opens the Rosary's prayer page.
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  const practiceId = practiceIdFromWebPath(path)
  return practiceId ? `/pray/${encodeURIComponent(practiceId)}` : path
}
