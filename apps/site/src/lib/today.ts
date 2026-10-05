// "Today" is the day the site was built, in the timezone set in astro.config.
// The site is rebuilt daily, and dated pages (Mass, Office, calendar) carry
// their own date in the URL, so a stale build is only ever a day behind.
const now = new Date()

export const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}
