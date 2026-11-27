import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, YStack } from 'tamagui'

import { Slab } from '@/components'
import { PageColumn } from '@/components/PageColumn'
import { useWidthClass } from '@/components/pageWidth'
import { SectionDivider } from '@/components/SectionDivider'
import { Split } from '@/components/Split'
import { useBottomClearance } from '@/components/tabAccessory'
import type { PlanOfLifeTemplateManifest } from '@/content/manifestTypes'
import { PrologueProse } from '@/features/collections'
import { artFor } from '@/features/explore/artMap'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { useSlots } from '@/features/plan-of-life'
import { localizeContent } from '@/lib/i18n'

import { customsInRule, withCustoms } from './adopt'
import { TemplateCustoms } from './TemplateCustoms'
import { TemplateHero } from './TemplateHero'
import { TemplateString } from './TemplateString'

/**
 * A tradition's page, alike in onboarding and the plan sheet: its painting and
 * name, the manifesto's opening paragraph, the rule as the string it will make,
 * the customs to pick beside it (when it keeps any), and the one way in
 * (`action`, handed the template with the picked customs joined to its rule),
 * with an optional `footer` under it.
 */
export function TemplateView({
  manifest,
  action,
  footer,
}: {
  manifest: PlanOfLifeTemplateManifest
  action: {
    label: string
    onPress: (template: PlanOfLifeTemplateManifest) => void
    busy?: boolean
  }
  footer?: ReactNode
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const slots = useSlots()
  // Customs the plan keeps already show on; the rest wait to be picked.
  const [chosen, setChosen] = useState(() =>
    customsInRule(manifest, new Set(slots.map((s) => s.practice_id))),
  )
  const toggle = (index: number) =>
    setChosen((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { expanded } = useWidthClass()

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const id = manifest.id
  // The opening paragraph says why; the string beneath shows what it asks.
  const manifesto = localizeContent(manifest.manifesto).split(/\n\s*\n/)[0]

  const proposal = (
    <>
      <TemplateString template={manifest} />
      {manifest.customs?.length ? (
        <TemplateCustoms customs={manifest.customs} chosen={chosen} onToggle={toggle} />
      ) : null}
      <Slab
        label={
          chosen.size
            ? t('templates.adoptWithCustoms', { label: action.label, count: chosen.size })
            : action.label
        }
        onPress={() => action.onPress(withCustoms(manifest, chosen))}
        busy={action.busy}
        testID="template-adopt"
      />
      {footer}
    </>
  )

  return (
    <Animated.ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: theme.background?.val ?? '#000000' }}
      contentContainerStyle={{ paddingBottom: insets.bottom + bottomClearance }}
      contentInsetAdjustmentBehavior="never"
    >
      <TemplateHero
        name={localizeContent(manifest.name)}
        attribution={manifest.attribution ? localizeContent(manifest.attribution) : undefined}
        tone={toneByIndex(toneIndexForId(id))}
        image={artFor(id)}
        measure={expanded ? 'wide' : 'column'}
        scrollY={scrollY}
      />

      <PageColumn
        measure={expanded ? 'wide' : 'column'}
        paddingTop="$lg"
        gap="$lg"
        backgroundColor="$background"
      >
        {expanded ? (
          // The rule beside its reasons: what it asks stays in view, with the
          // way in, while the manifesto is read.
          <Split
            asideSide="right"
            asideWidth={380}
            ruled
            aside={<YStack gap="$lg">{proposal}</YStack>}
          >
            <PrologueProse text={manifesto} />
          </Split>
        ) : (
          <>
            <PrologueProse text={manifesto} />
            <SectionDivider />
            {proposal}
          </>
        )}
      </PageColumn>
    </Animated.ScrollView>
  )
}
