import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable, ManuscriptFrame, WatercolorIcon } from '@/components'
import { getPracticeIcon } from '@/db/seed'
import { getPracticeName } from '@/features/plan-of-life/getPracticeName'
import type { NextAction } from '../getNextAction'

export function HeroCTA({ action, onPress }: { action: NextAction; onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress}>
      <ManuscriptFrame light>
        <YStack alignItems="center" gap="$sm" paddingVertical="$sm">
          {action.type === 'office' && <OfficeContent action={action} />}
          {action.type === 'practice' && <PracticeContent action={action} />}
          {action.type === 'allDone' && <AllDoneContent action={action} />}
        </YStack>
      </ManuscriptFrame>
    </AnimatedPressable>
  )
}

const officeIcons: Record<string, 'sunrise' | 'moon' | 'book'> = {
  morning: 'sunrise',
  compline: 'moon',
  evening: 'book',
}

function OfficeContent({ action }: { action: Extract<NextAction, { type: 'office' }> }) {
  const { t } = useTranslation()
  return (
    <>
      <WatercolorIcon name={officeIcons[action.hour] ?? 'book'} size={48} />
      <Text fontFamily="$display" fontSize={32} lineHeight={38} color="$colorBurgundy">
        {action.label}
      </Text>
      <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
        {action.sublabel}
      </Text>
      <Text fontFamily="$heading" fontSize="$2" color="$accent" marginTop="$xs">
        {t('home.begin')}
      </Text>
    </>
  )
}

function PracticeContent({ action }: { action: Extract<NextAction, { type: 'practice' }> }) {
  const { t } = useTranslation()
  return (
    <>
      <Text fontSize={28}>{getPracticeIcon(action.practice.icon)}</Text>
      <Text fontFamily="$heading" fontSize="$4" color="$color">
        {getPracticeName(action.practice, t)}
      </Text>
      <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
        {t('home.nextPractice')}
      </Text>
    </>
  )
}

function AllDoneContent({ action }: { action: Extract<NextAction, { type: 'allDone' }> }) {
  const { t } = useTranslation()
  return (
    <>
      <WatercolorIcon name="cross" size={48} />
      <Text fontFamily="$display" fontSize={28} lineHeight={34} color="$accent">
        {t('home.dayComplete')}
      </Text>
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
        {t('home.practicesAndOffices', {
          practices: action.practiceCount,
          offices: action.officeCount,
        })}
      </Text>
      <Text fontFamily="$script" fontSize="$3" color="$colorSecondary" marginTop="$xs">
        {t('home.restWell')}
      </Text>
    </>
  )
}
