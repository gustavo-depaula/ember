import { formatDistanceToNowStrict, type Locale } from 'date-fns'

export function formatSoftRelative(
  date: Date | number,
  opts: { locale?: Locale; justNow: string; aMomentAgo: string },
): string {
  const diffMs = Date.now() - (typeof date === 'number' ? date : date.getTime())
  if (diffMs < 30_000) return opts.justNow
  if (diffMs < 60_000) return opts.aMomentAgo
  return formatDistanceToNowStrict(date, { locale: opts.locale, addSuffix: true })
}
