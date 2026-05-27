import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import { Flame, Heart, Key, Settings, Shield } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  PageHeader,
  ScreenLayout,
  SectionDivider,
  Typography,
} from '@/components'
import { flags } from '@/config/flags'
import { useLastConfession } from '@/features/confessio'
import { useCommitments } from '@/features/custody'
import { ShortcutRow } from '@/features/home'
import { EntryRow, getEntryBody, useMemoriaEntries, useOnThisDayEntries } from '@/features/memoria'
import { useActiveIntentionsCount, useActiveThanksgivingsCount } from '@/features/movements'
import { RuleOfLifeSections } from '@/features/plan-of-life'
import { useToday } from '@/hooks/useToday'
import { getDateLocale } from '@/lib/i18n/dateLocale'

// You tab root: who you are across time. The rule-of-life config is the page's
// primary job (front-and-center); beneath it sits the standing interior state —
// the spiritual battle (custody), what you're carrying (intentions, thanks,
// confession cadence), and a peek at your chronicle. Today is "this day"; You is
// "the long arc." Settings lives in the header gear.
export default function YouScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const now = useToday()
  const locale = getDateLocale()

  const intentionsCount = useActiveIntentionsCount()
  const thanksgivingsCount = useActiveThanksgivingsCount()
  const lastConfession = useLastConfession()
  const { data: commitments } = useCommitments({ includeArchived: false })
  const recentEntries = useMemoriaEntries(3)
  const onThisDay = useOnThisDayEntries(now)

  const confessionLabel = (() => {
    if (!lastConfession) return undefined
    const days = differenceInCalendarDays(now, parseISO(lastConfession.date))
    if (days === 0) return t('confessio.homeToday')
    if (days === 1) return t('confessio.homeYesterday')
    return t('confessio.homeSince', { count: days })
  })()

  const activeCommitments = commitments?.length ?? 0

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader
          title={t('nav.you')}
          action={
            <Pressable
              onPress={() => router.push('/settings')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('settings.title')}
            >
              <Settings size={22} color={theme.accent?.val} />
            </Pressable>
          }
        />

        <RuleOfLifeSections />

        {flags.custody && (
          <>
            <SectionDivider />
            <AnimatedPressable
              onPress={() => router.push('/custody')}
              accessibilityRole="link"
              accessibilityLabel={t('custody.title')}
            >
              <XStack
                alignItems="center"
                gap="$md"
                padding="$md"
                borderWidth={0.5}
                borderColor="$borderColor"
                borderRadius="$lg"
                backgroundColor="$backgroundSurface"
              >
                <Shield size={22} color={theme.accent?.val} />
                <YStack flex={1} gap={2}>
                  <Typography variant="label">{t('custody.title')}</Typography>
                  <Typography tone="muted" fontSize="$1">
                    {activeCommitments > 0
                      ? t('you.commitmentsActive', { count: activeCommitments })
                      : t('custody.tagline')}
                  </Typography>
                </YStack>
                <Typography tone="muted">›</Typography>
              </XStack>
            </AnimatedPressable>
          </>
        )}

        <SectionDivider />

        <YStack gap="$sm">
          <Typography variant="label">{t('you.carrying')}</Typography>
          <ShortcutRow
            leading={<Heart size={22} color={theme.accent?.val} />}
            title={t('intentions.title')}
            tagline={t('you.intentionsHint')}
            trailing={<Typography tone="muted">{intentionsCount}</Typography>}
            onPress={() => router.push('/intentions')}
          />
          <ShortcutRow
            leading={<Flame size={22} color={theme.accent?.val} />}
            title={t('gratias.title')}
            tagline={t('you.gratiasHint')}
            trailing={<Typography tone="muted">{thanksgivingsCount}</Typography>}
            onPress={() => router.push('/gratias')}
          />
          <ShortcutRow
            leading={<Key size={22} color={theme.accent?.val} />}
            title={t('confessio.title')}
            tagline={t('you.confessionHint')}
            trailing={
              confessionLabel ? <Typography tone="muted">{confessionLabel}</Typography> : undefined
            }
            onPress={() => router.push('/confessio')}
          />
        </YStack>

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
