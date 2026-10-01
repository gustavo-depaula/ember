import { getManifest } from '@/content/resolver'

/**
 * Where browsing opens a practice: a prayer straight into its text, a program
 * (a novena, a course) onto its page of days, where it's begun. Today's rows
 * don't come through here — a day already due opens its prayer.
 */
export function practiceHref(id: string) {
  return getManifest(id)?.program
    ? ({ pathname: '/practices/[manifestId]/program', params: { manifestId: id } } as const)
    : ({ pathname: '/pray/[practiceId]', params: { practiceId: id } } as const)
}
