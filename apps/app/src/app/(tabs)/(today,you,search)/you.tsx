import { useRouter } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { PageFlourish, ScreenLayout, SectionDivider, Typography } from '@/components'
import { LibraryFeed } from '@/features/library'
import { ChronicleDayRow } from '@/features/memoria'
import { FootLink, RuleOfLifeSections, YouMasthead } from '@/features/plan-of-life'
import { useChronicle } from '@/features/plan-of-life/useRuleRecord'
import { useDeferredTabMount } from '@/hooks/useDeferredTabMount'

const flourishDark = require('../../../../assets/textures/notch_you_dark.png')
const flourishLight = require('../../../../assets/textures/notch_you_light.png')
const flourishAspect = 2172 / 457
const flourishLightAspect = 2172 / 386

export default function YouScreen() {
  return useDeferredTabMount() ? <YouPage /> : undefined
}

function YouPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const chronicle = useChronicle()
  const week = chronicle?.dates.slice(0, 7).map(chronicle.dayAt)

  return (
    <ScreenLayout>
      <PageFlourish
        dark={flourishDark}
        light={flourishLight}
        aspectRatio={flourishAspect}
        lightAspectRatio={flourishLightAspect}
      />
      <YStack gap="$lg" paddingTop="$sm" paddingBottom="$lg">
        <XStack alignItems="center" justifyContent="space-between">
          <YouMasthead />
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
          >
            <Settings size={28} color={theme.accent?.val} />
          </Pressable>
        </XStack>

        <RuleOfLifeSections />

        <SectionDivider />

        <LibraryFeed />

        <SectionDivider />

        <YStack>
          <Typography variant="label" paddingBottom="$xs">
            {t('you.chronicle')}
          </Typography>
          {week?.some((day) => day.beads.length || day.extras.length) ? (
            week.map((day) => <ChronicleDayRow key={day.date} day={day} />)
          ) : (
            <Typography tone="muted" fontStyle="italic">
              {t('memoria.emptyState')}
            </Typography>
          )}
          <FootLink
            label={t('you.chronicleSeeAll')}
            chevron
            onPress={() => router.push('/memoria')}
          />
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
