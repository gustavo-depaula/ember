// biome-ignore-all lint/suspicious/noArrayIndexKey: static mass sections never reorder
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, HeaderFlourish, ManuscriptFrame, ScreenLayout } from '@/components'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { getMassData, type MassForm } from '../content'
import { MassSectionBlock } from './MassSection'

export function MassScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const readingMargin = useReadingMargin()

  const massForm = usePreferencesStore((s) => s.massForm)
  const setMassForm = usePreferencesStore((s) => s.setMassForm)
  const data = getMassData(massForm)

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$md">
        <Pressable onPress={() => router.back()}>
          <XStack alignItems="center" gap="$sm">
            <ChevronLeft size={20} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {t('nav.home')}
            </Text>
          </XStack>
        </Pressable>

        <ManuscriptFrame>
          <YStack
            alignItems="center"
            gap="$xs"
            paddingVertical="$md"
            paddingHorizontal={readingMargin}
          >
            <HeaderFlourish />
            <Text fontFamily="$display" fontSize={36} lineHeight={42} color="$colorBurgundy">
              {data.title}
            </Text>
            <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
              {data.subtitle}
            </Text>
          </YStack>

          <FormToggle value={massForm} onChange={setMassForm} />

          <YStack gap="$md" paddingHorizontal={readingMargin} paddingBottom="$lg">
            {data.sections.map((section, i) => (
              <MassSectionBlock key={`${section.type}-${i}`} section={section} />
            ))}
          </YStack>
        </ManuscriptFrame>
      </YStack>
    </ScreenLayout>
  )
}

function FormToggle({ value, onChange }: { value: MassForm; onChange: (form: MassForm) => void }) {
  const { t } = useTranslation()

  return (
    <XStack gap="$xs" justifyContent="center" paddingVertical="$md" paddingHorizontal="$md">
      <FormToggleButton
        label={t('mass.ordinaryForm')}
        active={value === 'ordinary'}
        onPress={() => onChange('ordinary')}
      />
      <FormToggleButton
        label={t('mass.extraordinaryForm')}
        active={value === 'extraordinary'}
        onPress={() => onChange('extraordinary')}
      />
    </XStack>
  )
}

function FormToggleButton({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <AnimatedPressable onPress={onPress}>
      <YStack
        paddingHorizontal="$md"
        paddingVertical="$sm"
        borderRadius="$md"
        borderWidth={1}
        borderColor={active ? '$accent' : '$borderColor'}
        backgroundColor={active ? '$accent' : 'transparent'}
      >
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color={active ? '$background' : '$colorSecondary'}
        >
          {label}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}
