import { type Href, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import type { PracticeManifest } from '@/content/manifestTypes'
import { FootLink, PrayBar } from '@/features/plan-of-life'
import { useSaintsCatalog } from '@/features/saints'
import { successBuzz } from '@/lib/haptics'
import { CardEnvelope } from './ProgramCardEnvelope'
import {
  EndingHead,
  EndingLink,
  EndingSection,
  EndingStars,
  NextYearSwitch,
  useProgramFeast,
} from './ProgramEnding'

/**
 * After the Amém of a program's last day: what was kept, and what comes next. A novena kept to its
 * eve looks to the feast — tomorrow's Mass, the saint's life — and gives its card, still sealed, to
 * be opened as from Today. A novena dated by its feast is offered again next year rather than
 * restarted now, which would end after the feast; a program with no date can be begun again.
 */
export function ProgramCompleteModal({
  practiceId,
  manifest,
  practiceName,
  showRestart,
  onRestart,
  onDone,
}: {
  /** As the prayer's screen keys its progress. */
  practiceId: string
  manifest: PracticeManifest & { program: NonNullable<PracticeManifest['program']> }
  practiceName: string
  showRestart: boolean
  onRestart: () => void
  onDone: () => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const { program } = manifest
  const feast = useProgramFeast(practiceId, program)
  const { byId } = useSaintsCatalog()
  const cards = [manifest.holyCard ?? []].flat()
  const saint = byId[cards[0] ?? '']
  // A round of a program the calendar brings round (the Ember days): kept, not finished for good.
  const round = !!program.days

  useEffect(() => {
    successBuzz()
  }, [])

  // The modal sits over the prayer; going on replaces the prayer's screen, so back lands on Today.
  const go = (href: Href) => router.replace(href)

  const title = round
    ? t('program.keptWhole')
    : feast?.tomorrow
      ? t('program.ending.eve')
      : t('program.ending.prayedWhole')
  const lede = round
    ? undefined
    : feast?.tomorrow && saint
      ? t('program.ending.eveLede', { count: program.totalDays, name: saint.name })
      : t('program.ending.daysPrayed', { count: program.totalDays })

  return (
    <Modal animationType="fade" visible onRequestClose={onDone}>
      <ScreenLayout>
        <Animated.View entering={FadeInDown.duration(420)}>
          <YStack gap="$xl" paddingVertical="$xl">
            <YStack>
              <EndingHead name={practiceName} title={title} lede={lede} />
              {round ? null : <EndingStars practiceId={practiceId} program={program} />}
            </YStack>

            {feast?.tomorrow ? (
              <EndingSection label={t('program.ending.tomorrow')}>
                <EndingLink
                  title={t('program.ending.mass')}
                  detail={t('program.ending.massDetail')}
                  onPress={() => go('/mass-times')}
                />
                {saint ? (
                  <EndingLink
                    title={saint.name}
                    detail={t('program.ending.saintPage')}
                    onPress={() => go({ pathname: '/saints/[index]', params: { index: saint.id } })}
                  />
                ) : null}
              </EndingSection>
            ) : null}

            <CardEnvelope practiceId={practiceId} cards={cards} won onOpen={go} />
            <NextYearSwitch practiceId={practiceId} program={program} />

            <YStack alignItems="center">
              <PrayBar label={t('program.done')} onPress={onDone} />
              {showRestart && !program.ends ? (
                <FootLink label={t('program.restart')} onPress={onRestart} />
              ) : null}
            </YStack>
          </YStack>
        </Animated.View>
      </ScreenLayout>
    </Modal>
  )
}
