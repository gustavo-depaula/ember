import { Stack, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { SaintWall } from '@/features/saints/components'
import { useSaintsCatalog } from '@/features/saints/data/catalog'
import { useHeldCards } from '@/features/saints/data/collection'

/** One shelf of the album in full, by month (or by kind, for undated cards). */
export default function SaintShelfScreen() {
  const { shelf } = useLocalSearchParams<{ shelf: string }>()
  const { t } = useTranslation()
  const { saints } = useSaintsCatalog()
  const held = useHeldCards()
  const items = useMemo(() => saints.filter((s) => s.shelf === shelf), [saints, shelf])
  const mine = items.filter((s) => held.has(s.id)).length
  const title = t(`saints.group.shelf.${shelf}`)

  return (
    <View flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title }} />
      <ScreenLayout>
        <SaintWall
          saints={items}
          // A small shelf reads best as one grid; a long one by month.
          grouping={items.length > 36 ? 'calendar' : 'flat'}
          ListHeaderComponent={
            <YStack gap="$xs" paddingTop="$lg">
              <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                {t('saints.metCount', { collected: mine, total: items.length })}
              </Typography>
              <PageHeader title={title} />
            </YStack>
          }
        />
      </ScreenLayout>
    </View>
  )
}
