import { CircleDashed } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { InlineMarkdown } from '@/components/prayer'
import type { CollectionTodo } from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'

export function TodoCard({ todo }: { todo: CollectionTodo }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const title = localizeContent(todo.title)
  const notes = todo.notes ? localizeContent(todo.notes) : undefined

  return (
    <XStack
      backgroundColor="$background"
      borderRadius="$lg"
      borderWidth={1}
      borderColor="$borderColor"
      borderStyle="dashed"
      gap="$md"
      alignItems="flex-start"
      paddingHorizontal="$md"
      paddingVertical="$sm"
      opacity={0.7}
      accessibilityRole="text"
      accessibilityLabel={`${t('browse.toSource')}: ${title}`}
    >
      <YStack width={24} height={24} alignItems="center" justifyContent="center" marginTop={2}>
        <CircleDashed size={16} color={theme.colorSecondary?.val} />
      </YStack>
      <YStack flex={1} gap={2}>
        <XStack alignItems="center" gap="$sm">
          <Text fontFamily="$heading" fontSize="$3" color="$colorSecondary">
            {title}
          </Text>
        </XStack>
        {notes && (
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
            <InlineMarkdown source={notes} />
          </Text>
        )}
        <Text
          fontFamily="$body"
          fontSize="$1"
          color="$colorSecondary"
          letterSpacing={1}
          textTransform="uppercase"
          opacity={0.7}
        >
          {t('browse.toSource')}
        </Text>
      </YStack>
    </XStack>
  )
}
