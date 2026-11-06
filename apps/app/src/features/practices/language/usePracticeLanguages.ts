import type { ContentLanguage } from '@ember/content-engine'
import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

import type { PageLanguage } from '@/components/prayer/PageLanguage'
import type { PracticeManifest } from '@/content/manifestTypes'
import {
  type BilingualLayout,
  fetchLanguages,
  type LanguageDefaults,
  type LanguageOverride,
  pageLayout,
  patchOverride,
  pinnedOverride,
  prayPatch,
  promotedDefaults,
  resolveLanguages,
} from '@/lib/practiceLanguages'
import { usePreferencesStore } from '@/stores/preferencesStore'

// Wide enough for two columns of prayer: a phone on its side (the prayer page
// turns, `useTurnsWhileFocused`), a tablet, a desktop window.
const columnsMinWidth = 640

function useDefaults(): LanguageDefaults {
  const stance = usePreferencesStore((s) => s.latinStance)
  const vernacular = usePreferencesStore((s) => s.contentLanguage)
  const layout = usePreferencesStore((s) => s.bilingualLayout)
  return useMemo(() => ({ stance, vernacular, layout }), [stance, vernacular, layout])
}

/** The languages a practice is prayed in, as its defaults and its own override give them. */
export function usePracticeLanguages(manifest: PracticeManifest | undefined) {
  const defaults = useDefaults()
  const id = manifest?.id ?? ''
  const override = usePreferencesStore((s) => s.practiceLanguages[id])
  const resolved = useMemo(
    () => resolveLanguages(manifest ?? {}, defaults, override),
    [manifest, defaults, override],
  )
  const traits = manifest ?? {}
  return { resolved, defaults, override, traits }
}

/** The page's languages for the renderer, with `auto` read against the window. */
export function usePracticePageLanguage(manifest: PracticeManifest | undefined): PageLanguage {
  const { resolved } = usePracticeLanguages(manifest)
  const { width, height } = useWindowDimensions()
  const wide = width >= columnsMinWidth || width > height
  return useMemo(() => {
    const fetched = fetchLanguages(resolved)
    return {
      pray: resolved.pray,
      follow: resolved.follow,
      ...fetched,
      layout: pageLayout(resolved.layout, resolved.follow, wide),
    }
  }, [resolved, wide])
}

/** What the language sheet does to a practice's languages. */
export function usePracticeLanguageActions(manifest: PracticeManifest) {
  const { resolved, defaults, override, traits } = usePracticeLanguages(manifest)
  const setPracticeLanguage = usePreferencesStore((s) => s.setPracticeLanguage)
  const setLatinStance = usePreferencesStore((s) => s.setLatinStance)
  const setContentLanguage = usePreferencesStore((s) => s.setContentLanguage)
  const setBilingualLayout = usePreferencesStore((s) => s.setBilingualLayout)

  const patch = (change: LanguageOverride) =>
    setPracticeLanguage(manifest.id, patchOverride(traits, defaults, override, change))

  return {
    resolved,
    defaults,
    choosePray: (lang: ContentLanguage) => patch(prayPatch(resolved, lang)),
    chooseFollow: (lang: ContentLanguage | undefined) => patch({ follow: lang ?? 'none' }),
    chooseLayout: (layout: BilingualLayout) => patch({ layout }),
    swap: () => {
      if (resolved.follow) patch({ pray: resolved.follow, follow: resolved.pray })
    },
    onlyThisPrayer: () => {
      if (!override) setPracticeLanguage(manifest.id, pinnedOverride(resolved))
    },
    everyPrayer: () => {
      if (!override) return
      const next = promotedDefaults(defaults, resolved)
      if (next.stance !== defaults.stance) setLatinStance(next.stance)
      if (next.vernacular !== defaults.vernacular) setContentLanguage(next.vernacular)
      if (next.layout !== defaults.layout) setBilingualLayout(next.layout)
      setPracticeLanguage(manifest.id, undefined)
    },
    restore: () => setPracticeLanguage(manifest.id, undefined),
  }
}
