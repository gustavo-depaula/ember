import { useRouter } from 'expo-router'
import { Flame, Settings, Shield } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  PageFlourish,
  ScreenLayout,
  SectionDivider,
  Typography,
} from '@/components'
import { flags } from '@/config/flags'
import { EntryRow, getEntryBody, useMemoriaEntries, useOnThisDayEntries } from '@/features/memoria'
import { PlanCard, RuleOfLifeSections, YouMasthead } from '@/features/plan-of-life'
import { useToday } from '@/hooks/useToday'
import { getDateLocale } from '@/lib/i18n/dateLocale'

const flourishDark = require('../../../../assets/textures/notch_you_dark.png')
const flourishLight = require('../../../../assets/textures/notch_you_light.png')
const flourishAspect = 2172 / 457
const flourishLightAspect = 2172 / 386

// You tab root: who you are across time. The rule-of-life config is the page's
// primary job (front-and-center). Right below the votive wall sit two doorways —
// the Altar (what you lay before God: intentions, thanks, today's resolution)
// and Custody (the spiritual battle) — then a peek at your chronicle. Today is
// "this day"; You is "the long arc." Settings lives in the header gear.
export default function YouScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const now = useToday()
  const locale = getDateLocale()

  const recentEntries = useMemoriaEntries(3)
  const onThisDay = useOnThisDayEntries(now)

  const interiorCards = (
    <XStack gap="$md">
      <PlanCard
        icon={<Flame size={28} color={theme.accent?.val} />}
        label={t('altar.title')}
        subtitle={t('altar.cardSubtitle')}
        onPress={() => router.push('/altar')}
      />
      {flags.custody && (
        <PlanCard
          icon={<Shield size={28} color={theme.accent?.val} />}
          label={t('custody.title')}
          subtitle={t('you.custodyHint')}
          onPress={() => router.push('/custody')}
        />
      )}
    </XStack>
  )

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

        <RuleOfLifeSections belowWall={interiorCards} />

        <SectionDivider />

        <YStack gap="$sm">
          <Typography variant="label">{t('you.chronicle')}</Typography>
          {recentEntries.length === 0 ? (
            <Typography tone="muted" fontStyle="italic">
              {t('memoria.emptyState')}
            </Typography>
          ) : (
            <>
              {onThisDay.length > 0 && (
                <Typography variant="caption">
                  {t('memoria.onThisDay')} · {getEntryBody(onThisDay[0], t)}
                </Typography>
              )}
              {recentEntries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} locale={locale} />
              ))}
              <AnimatedPressable
                onPress={() => router.push('/memoria')}
                accessibilityRole="link"
                accessibilityLabel={t('you.chronicleSeeAll')}
              >
                <Typography variant="label">{t('you.chronicleSeeAll')}</Typography>
              </AnimatedPressable>
            </>
          )}
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
