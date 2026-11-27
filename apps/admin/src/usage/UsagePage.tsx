import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useEffect, useState } from 'react'
import { type UsageFilter, type UsageOf, type UsageTab, usageTabs } from '../../worker/types'
import { CardsTab } from './CardsTab'
import { FeaturesTab } from './FeaturesTab'
import { LibraryTab } from './LibraryTab'
import { MassTab } from './MassTab'
import { OnboardingTab } from './OnboardingTab'
import { OverviewTab } from './OverviewTab'
import { PrayerTab } from './PrayerTab'
import { SearchTab } from './SearchTab'

// How Ember is used, from the counts installs send (lib/usage.ts in the app), a tab to a question:
// is anyone here and do they come back; how the first launch goes; do they pray; where they look
// for Mass; the holy cards; what they read; what they search for; and the rest of the app.
// Each tab has its own address (`/usage/mass`) and reads only its own counts.

const labels: Record<UsageTab, string> = {
  overview: 'Overview',
  onboarding: 'Onboarding',
  prayer: 'Prayer',
  mass: 'Mass times',
  cards: 'Holy cards',
  library: 'Library',
  search: 'Search',
  features: 'Features',
}

const tabAt = (pathname: string): UsageTab =>
  usageTabs.find((tab) => pathname === `/usage/${tab}`) ?? 'overview'

async function fetchUsage<T extends UsageTab>(tab: T, filter: UsageFilter): Promise<UsageOf[T]> {
  const query = new URLSearchParams({
    days: String(filter.days),
    platform: filter.platform,
    language: filter.language,
  })
  const response = await fetch(`/api/usage/${tab}?${query}`)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? response.statusText)
  return data as UsageOf[T]
}

export function UsagePage() {
  const [filter, setFilter] = useState<UsageFilter>({ days: 28, platform: '', language: '' })
  const [tab, setTab] = useState(() => tabAt(location.pathname))
  useEffect(() => {
    const onPop = () => setTab(tabAt(location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const usage = useQuery({
    queryKey: ['usage', tab, filter],
    queryFn: () => fetchUsage(tab, filter),
    // The old counts stay, dimmed, while a new filter's arrive; a new tab starts blank.
    placeholderData: (previous, query) =>
      query?.queryKey[1] === tab ? (previous as UsageOf[UsageTab]) : undefined,
  })
  const set = (change: Partial<UsageFilter>) => setFilter({ ...filter, ...change })

  return (
    <div className="usage">
      <header className="top">
        <h1>Usage</h1>
        <span className="spacer" />
        <div className="segmented">
          {[7, 28, 90].map((days) => (
            <button
              type="button"
              key={days}
              className={filter.days === days ? 'on' : ''}
              onClick={() => set({ days })}
            >
              {days} days
            </button>
          ))}
        </div>
        <select value={filter.platform} onChange={(e) => set({ platform: e.target.value })}>
          <option value="">Every platform</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="web">Web</option>
        </select>
        <select value={filter.language} onChange={(e) => set({ language: e.target.value })}>
          <option value="">Every language</option>
          <option value="pt-BR">Português</option>
          <option value="en-US">English</option>
        </select>
      </header>
      <nav className="usage-tabs" aria-label="Usage">
        {usageTabs.map((t) => (
          <a
            key={t}
            href={`/usage/${t}`}
            className={t === tab ? 'on' : ''}
            aria-current={t === tab ? 'page' : undefined}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
              event.preventDefault()
              history.pushState(null, '', `/usage/${t}`)
              setTab(t)
            }}
          >
            {labels[t]}
          </a>
        ))}
      </nav>
      {(() => {
        if (usage.error) return <p className="error usage-body">{usage.error.message}</p>
        if (!usage.data) return <p className="muted usage-body">Reading the counts…</p>
        return (
          <div className={`usage-body${usage.isPlaceholderData ? ' usage-body--stale' : ''}`}>
            <Tab tab={tab} data={usage.data} />
            <Blind />
          </div>
        )
      })()}
    </div>
  )
}

function Tab({ tab, data }: { tab: UsageTab; data: UsageOf[UsageTab] }): ReactNode {
  switch (tab) {
    case 'overview':
      return <OverviewTab usage={data as UsageOf['overview']} />
    case 'onboarding':
      return <OnboardingTab usage={data as UsageOf['onboarding']} />
    case 'prayer':
      return <PrayerTab usage={data as UsageOf['prayer']} />
    case 'mass':
      return <MassTab usage={data as UsageOf['mass']} />
    case 'cards':
      return <CardsTab usage={data as UsageOf['cards']} />
    case 'library':
      return <LibraryTab usage={data as UsageOf['library']} />
    case 'search':
      return <SearchTab usage={data as UsageOf['search']} />
    case 'features':
      return <FeaturesTab usage={data as UsageOf['features']} />
  }
}

function Blind() {
  return (
    <section className="blind">
      <h2>What this cannot see</h2>
      <p>
        Anyone who switched counting off, and every development build. An install that switches it
        off and on again comes back as a new one, and so does a reinstall; on the web, each browser
        is an install. Days and hours are the device's own clock. Counts from builds before 1.1.0's
        usage update carry no hour and no update, and builds before the analytics update of November
        2026 name no church, card, search or book.
      </p>
    </section>
  )
}
