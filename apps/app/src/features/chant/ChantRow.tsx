import { useRouter } from 'expo-router'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { localizeContent } from '@/lib/i18n'
import { chantSummary, romanMode, sectionLabel } from './chants'
import type { ChantPlace } from './library'
import { chantHref } from './routes'

/** Where a chant is sung, in a line: the Masses and days that print it, or the book of prayers that holds it. */
export function placesLine(
  places: ChantPlace[] | undefined,
  more: (count: number) => string,
): string {
  if (!places?.length) return ''
  const names = [
    ...new Set(
      places.map(({ book, section }) =>
        book.list === 'chants' ? localizeContent(book.name) : sectionLabel(section),
      ),
    ),
  ]
  const shown = names.slice(0, 2).join(' · ')
  return names.length > 2 ? `${shown} · ${more(names.length - 2)}` : shown
}

/** A chant in a list: its incipit and mode, and where it is sung. Opens the chant on its own sheet. */
export const ChantRow = memo(function ChantRow({
  id,
  places,
}: {
  id: string
  places?: ChantPlace[]
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const { name, mode } = chantSummary(id)
  const where = placesLine(places, (count) => t('chant.more', { count }))
  return (
    <Pressable
      onPress={() => router.push(chantHref(id))}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.openChants', { name })}
    >
      <YStack
        minHeight={44}
        paddingVertical="$sm"
        justifyContent="center"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <XStack alignItems="baseline" gap="$md">
          <Typography flex={1} fontSize="$3" numberOfLines={1}>
            {name}
          </Typography>
          {mode && <Typography variant="annotation">{romanMode(mode)}</Typography>}
        </XStack>
        {where !== '' && (
          <Typography variant="annotation" numberOfLines={1}>
            {where}
          </Typography>
        )}
      </YStack>
    </Pressable>
  )
})
