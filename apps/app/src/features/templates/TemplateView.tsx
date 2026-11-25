import type { ReactNode } from 'react'
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
import { localizeContent } from '@/lib/i18n'

import { ProposedPractices } from './ProposedPractices'
import { TemplateHero } from './TemplateHero'

/**
 * A tradition's page: its painting and name, the manifesto, then the rule it
 * proposes and the one way in (`action`), with an optional `footer` under it.
 * The tradition's own screen opens the cherry-pick sheet from the action;
 * onboarding adopts the whole rule.
 */
export function TemplateView({
  manifest,
  action,
  footer,
}: {
  manifest: PlanOfLifeTemplateManifest
  action: { label: string; onPress: () => void; busy?: boolean }
  footer?: ReactNode
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { expanded } = useWidthClass()

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const id = manifest.id
  const manifesto = localizeContent(manifest.manifesto)

  const proposal = (
    <>
      <ProposedPractices template={manifest} />
      <Slab
        label={action.label}
        onPress={action.onPress}
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
