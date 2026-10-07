import { ChevronRight } from 'lucide-react-native'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'

const shownAtFirst = 5

/** A long list opens with its first few; the rest are a tap away. */
export function Capped<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  const { t } = useTranslation()
  const [all, setAll] = useState(false)
  const hidden = items.length - shownAtFirst
  return (
    <YStack>
      {(all ? items : items.slice(0, shownAtFirst)).map(render)}
      {hidden > 0 ? (
        <Pressable
          onPress={() => setAll(!all)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            all ? t('bible.references.fewer') : t('bible.references.more', { count: hidden })
          }
          accessibilityState={{ expanded: all }}
          aria-expanded={all}
        >
          <XStack minHeight={44} alignItems="center">
            <Typography variant="caption" fontSize="$3" color="$colorBurgundy">
              {all ? t('bible.references.fewer') : t('bible.references.more', { count: hidden })}
            </Typography>
          </XStack>
        </Pressable>
      ) : undefined}
    </YStack>
  )
}

/**
 * One thing that cites a verse, as a line that says what it is: its number
 * where it goes by one (a paragraph, an article), its name, and a word above
 * it where the name alone would not place it. A row that leads to a page of
 * its own ends in a chevron; one that opens where it stands turns red.
 */
export function ReferenceRow({
  lead,
  label,
  note,
  onPress,
  expanded,
}: {
  lead?: string
  label: string
  note?: string
  /** Absent for a row that is only read (a day of the Mass). */
  onPress?: () => void
  /** Set for a row that opens in place; absent for one that leads to a page. */
  expanded?: boolean
}) {
  const theme = useTheme()
  const spoken = [note, lead, label].filter(Boolean).join(', ')
  const row = (
    <XStack
      alignItems="center"
      gap="$sm"
      minHeight={44}
      paddingVertical="$xs"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      {lead ? (
        <Typography
          variant="section-title"
          fontSize="$3"
          minWidth={52}
          color={expanded ? '$colorBurgundy' : '$color'}
        >
          {lead}
        </Typography>
      ) : undefined}
      <YStack flex={1}>
        {note ? (
          <Typography variant="annotation" fontSize="$2">
            {note}
          </Typography>
        ) : undefined}
        <Typography fontSize="$3" tone={lead ? 'muted' : 'default'}>
          {label}
        </Typography>
      </YStack>
      {onPress && expanded === undefined ? (
        <ChevronRight size={16} color={theme.colorSecondary.val} />
      ) : undefined}
    </XStack>
  )
  if (!onPress) return row
  if (expanded === undefined) {
    return (
      <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={spoken}>
        {row}
      </Pressable>
    )
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityState={{ expanded }}
      aria-expanded={expanded}
    >
      {row}
    </Pressable>
  )
}
