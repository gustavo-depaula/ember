import { useRouter } from 'expo-router'
import { ChevronRight, CloudOff, RefreshCw } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { useEventStore } from '@/db/events'

import { useSync } from '../state'

/** The one way into the account: what it is for when there is none, how it stands when there is. */
export function AccountCard() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const loaded = useSync((s) => s.loaded)
  const account = useSync((s) => s.account)
  const state = useSync((s) => s.state)
  const devices = useEventStore((s) => s.devices.size)
  if (!loaded) return undefined

  const behind = state === 'waiting' || state === 'outdated' || state === 'full'
  const status = behind
    ? t(`account.card.${state}`)
    : `${t('account.card.upToDate')} · ${t('account.card.devices', { count: Math.max(devices, 1) })}`
  const Icon = behind ? CloudOff : RefreshCw

  return (
    <AnimatedPressable
      onPress={() => router.push('/account')}
      accessibilityRole="button"
      accessibilityLabel={
        account ? `${t('account.card.yours')}. ${status}` : t('account.card.invite')
      }
    >
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$md"
        alignItems="center"
        shadowColor="#000"
        shadowOpacity={0.06}
        shadowRadius={8}
        shadowOffset={{ width: 0, height: 2 }}
      >
        <YStack
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="$background"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={20} color={behind ? theme.colorSecondary?.val : theme.accent?.val} />
        </YStack>
        <YStack flex={1}>
          <Text fontFamily="$body" fontSize="$2" color="$color">
            {account ? t('account.card.yours') : t('account.card.invite')}
          </Text>
          {account ? (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {status}
            </Text>
          ) : undefined}
        </YStack>
        {account ? (
          <ChevronRight size={20} color={theme.colorSecondary?.val} />
        ) : (
          <Text fontFamily="$heading" fontSize="$2" letterSpacing={1.5} color="$accent">
            {t('account.card.setUp')}
          </Text>
        )}
      </XStack>
    </AnimatedPressable>
  )
}
