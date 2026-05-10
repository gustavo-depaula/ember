import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Switch } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { getEntry } from '@/content/contentIndex'
import { getAllFollows } from '@/db/repositories/creators'
import { getPinnedCreatorSummaries, getPinnedItemIdsByCreator } from '@/db/repositories/feedItems'
import { getPreference, setPreference } from '@/db/repositories/preferences'
import { unpinFeedItem, WIFI_ONLY_PREF_KEY } from '@/features/creators/pinning/feedItemPin'
import { localizeContent } from '@/lib/i18n'

async function unpinAllForCreator(creatorId: string): Promise<void> {
  const ids = await getPinnedItemIdsByCreator(creatorId)
  await Promise.all(ids.map((id) => unpinFeedItem(id)))
}

function WifiOnlyToggle() {
  const { t } = useTranslation()
  const [wifiOnly, setWifiOnly] = useState(true)
  useEffect(() => {
    void getPreference(WIFI_ONLY_PREF_KEY).then((v) => setWifiOnly(v !== '0'))
  }, [])
  return (
    <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" padding="$md">
      <XStack justifyContent="space-between" alignItems="center">
        <YStack flex={1} gap={2}>
          <Text fontFamily="$body" fontSize="$2" color="$color">
            {t('creators.storage.wifiOnly')}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('creators.storage.wifiOnlyHint')}
          </Text>
        </YStack>
        <Switch
          value={wifiOnly}
          onValueChange={(value) => {
            setWifiOnly(value)
            void setPreference(WIFI_ONLY_PREF_KEY, value ? '1' : '0')
          }}
        />
      </XStack>
    </YStack>
  )
}

export function CreatorsStorageSection() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { data: summaries = [] } = useQuery({
    queryKey: ['creators', 'storage'],
    queryFn: getPinnedCreatorSummaries,
  })
  const { data: follows = [] } = useQuery({
    queryKey: ['creators', 'follows'],
    queryFn: getAllFollows,
  })
  const unpinAll = useMutation({
    mutationFn: unpinAllForCreator,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })

  const dateFmt = new Intl.DateTimeFormat(i18n.language || 'en-US', { dateStyle: 'medium' })

  if (summaries.length === 0 && follows.length === 0) return null

  return (
    <YStack gap="$md">
      <Text fontFamily="$heading" fontSize="$3" color="$color">
        {t('creators.storage.title')}
      </Text>

      <WifiOnlyToggle />

      {summaries.length > 0 && (
        <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" padding="$md" gap="$sm">
          {summaries.map((s) => {
            const entry = getEntry(s.creatorId)
            const name = entry?.name ? localizeContent(entry.name) : s.creatorId
            const oldest = s.oldestPinnedAt ? dateFmt.format(new Date(s.oldestPinnedAt)) : '—'
            return (
              <YStack key={s.creatorId} gap="$xs">
                <XStack justifyContent="space-between">
                  <Text fontFamily="$heading" fontSize="$2" color="$color">
                    {name}
                  </Text>
                  <Pressable
                    onPress={() => unpinAll.mutate(s.creatorId)}
                    accessibilityRole="button"
                    accessibilityLabel={t('creators.storage.unpinAll')}
                  >
                    <Text fontFamily="$body" fontSize="$1" color="$colorBurgundy">
                      {t('creators.storage.unpinAll')}
                    </Text>
                  </Pressable>
                </XStack>
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {t('creators.storage.summary', { count: s.count, oldest })}
                </Text>
              </YStack>
            )
          })}
        </YStack>
      )}
    </YStack>
  )
}
