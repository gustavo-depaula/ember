import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { PrayerText } from './PrayerText'

export function CccReadingBlock({
  reference,
  paragraphs,
}: {
  reference: { type: 'catechism'; startParagraph: number; count: number }
  paragraphs: Array<{ number: number; text: string; section: string }> | undefined
}) {
  const { t } = useTranslation()
  if (!paragraphs || paragraphs.length === 0) return undefined

  const endParagraph = reference.startParagraph + reference.count - 1

  return (
    <YStack gap="$sm">
      <Text fontFamily="$body" fontSize="$2" color="$colorMutedBlue" fontWeight="500">
        {t('office.cccLabel', { start: reference.startParagraph, end: endParagraph })}
      </Text>
      {paragraphs.map((p) => (
        <XStack key={p.number} gap="$sm" alignItems="flex-start">
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$colorMutedBlue"
            fontWeight="600"
            width={36}
          >
            {p.number}
          </Text>
          <PrayerText flex={1}>{p.text}</PrayerText>
        </XStack>
      ))}
    </YStack>
  )
}
