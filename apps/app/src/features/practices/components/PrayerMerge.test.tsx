import { describe, expect, it } from 'vitest'

import { renderApp } from '@/test/renderApp'

// `PrayerLines` runs each line through the `hyphen` library, which interleaves
// soft hyphens (U+00AD) inside words. Strip them before matching so regex
// assertions stay readable.
function withoutSoftHyphens(s: string): string {
  return s.replace(/­/g, '')
}

describe('Prayer/practice merge — end-to-end render', () => {
  // A short prayer is a practice with one untitled inline section, so its body
  // renders as plain text rather than a collapsible row.
  it('renders a short prayer (practice/our-father) directly', async () => {
    const { screen } = await renderApp({
      route: '/pray/practice/our-father',
      fixtures: { now: '2026-05-15' },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/(tabs)/(today,you,search)/pray/[practiceId]'),
        },
      ],
    })

    expect(
      await screen.findByText((content) => withoutSoftHyphens(content).includes('hallowed be thy')),
    ).toBeInTheDocument()
  }, 20_000)

  it('resolves cross-practice prayer refs (morning-offering refs our-father, hail-mary)', async () => {
    // Bare refs ('our-father') canonicalize to `practice/our-father`; the
    // engine titles each with the practice name, which becomes the collapsible
    // row's accessible name.
    const { screen } = await renderApp({
      route: '/pray/practice/morning-offering',
      fixtures: { now: '2026-05-15' },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/(tabs)/(today,you,search)/pray/[practiceId]'),
        },
      ],
    })

    expect(await screen.findByRole('button', { name: /Our Father/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Hail Mary/i })).toBeInTheDocument()
  }, 20_000)
})
