/**
 * End-to-end integration test for the prayer/practice merge.
 *
 * Two scenarios:
 *
 *   1. A migrated short prayer (practice/our-father) renders as a full practice
 *      screen. Its single inline-prayer section has no title (the manifest's
 *      `name` is the page header, not a section title), so SectionBlock
 *      renders it as a plain `PrayerTextBlock` — the body text appears
 *      directly.
 *
 *   2. A practice (practice/morning-offering) that ref's other migrated prayers
 *      via `{ type: 'prayer', ref: 'our-father' }` renders them inline — this
 *      is the backward-compat path for the 1099 existing refs in flow.json
 *      files across the corpus. The engine attaches the asset's name as the
 *      section title, so each ref renders as a CollapsiblePrayer row whose
 *      title doubles as the accessible button name.
 */

import { describe, expect, it } from 'vitest'

import { renderApp } from '@/test/renderApp'

// `PrayerLines` runs each line through the `hyphen` library, which interleaves
// soft hyphens (U+00AD) inside words. Strip them before matching so regex
// assertions stay readable.
function withoutSoftHyphens(s: string): string {
  return s.replace(/­/g, '')
}

describe('Prayer/practice merge — end-to-end render', () => {
  it('renders a migrated short prayer (practice/our-father) directly', async () => {
    const { screen } = await renderApp({
      route: '/pray/practice/our-father',
      fixtures: { now: '2026-05-15' },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/pray/[practiceId]'),
        },
      ],
    })

    // PrayerTextBlock renders the inline content directly (no collapsible).
    expect(
      await screen.findByText((content) => withoutSoftHyphens(content).includes('hallowed be thy')),
    ).toBeInTheDocument()
  }, 20_000)

  it('resolves cross-practice prayer refs (morning-offering refs our-father, hail-mary)', async () => {
    // Morning Offering's flow has bare prayer refs:
    //   { type: 'prayer', ref: 'our-father' }
    //   { type: 'prayer', ref: 'hail-mary' }
    // After the merge, `resolvePrayer('our-father')` canonicalizes to
    // `practice/our-father` and reads its inline `flow.sections`. The engine
    // attaches the asset's name as the prayer title, so each ref renders as a
    // collapsible row whose accessible name is the prayer title.
    const { screen } = await renderApp({
      route: '/pray/practice/morning-offering',
      fixtures: { now: '2026-05-15' },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/pray/[practiceId]'),
        },
      ],
    })

    expect(await screen.findByRole('button', { name: /Our Father/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Hail Mary/i })).toBeInTheDocument()
  }, 20_000)
})
