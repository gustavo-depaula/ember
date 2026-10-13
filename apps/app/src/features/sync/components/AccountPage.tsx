import type { Profile } from '@ember/relay'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronRight, Laptop, MoreHorizontal, Smartphone } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Switch } from 'react-native'
import { Input, Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedCheckbox, confirm, PageHeader, ScreenLayout, SectionDivider } from '@/components'
import { useEventStore } from '@/db/events'
import type { DeviceState } from '@/db/events/state'
import { getDateLocale } from '@/lib/i18n/dateLocale'

import {
  canKeepRecoveryCopy,
  deleteAccount,
  keepOnlyHere,
  loadAccountView,
  removeDevice,
  removeThisDevice,
  saveProfile,
  sendPending,
  startAccount,
} from '../account'
import { nameDevice } from '../device'
import { type Account, useSync } from '../state'
import { GoldButton, Lead, Quiet, TextAction } from './parts'

export function AccountPage() {
  const { t } = useTranslation()
  const loaded = useSync((s) => s.loaded)
  const account = useSync((s) => s.account)
  if (!loaded) return undefined

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg" flexGrow={1}>
        <PageHeader title={t('account.title')} />
        {account ? <SignedIn account={account} /> : <Invitation />}
      </YStack>
    </ScreenLayout>
  )
}

function Invitation() {
  const { t } = useTranslation()
  const router = useRouter()
  const start = useMutation({ mutationFn: startAccount })

  return (
    <YStack gap="$xl" flexGrow={1} justifyContent="space-between">
      <YStack gap="$md">
        <Lead>{t('account.intro')}</Lead>
        <Text fontFamily="$body" fontSize="$3" lineHeight={27} color="$colorSecondary">
          {t('account.private')}
        </Text>
      </YStack>
      <YStack gap="$lg" paddingBottom="$lg">
        <GoldButton
          label={t('account.start')}
          onPress={() => start.mutate()}
          busy={start.isPending}
        />
        <TextAction label={t('account.haveOne')} onPress={() => router.push('/account/join')} />
      </YStack>
    </YStack>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text fontFamily="$heading" fontSize="$3" color="$color">
      {children}
    </Text>
  )
}

function StatusLine() {
  const { t } = useTranslation()
  const state = useSync((s) => s.state)
  const syncedAt = useSync((s) => s.syncedAt)
  const behind = state === 'waiting' || state === 'outdated' || state === 'full'
  const when = syncedAt
    ? Date.now() - syncedAt < 90_000
      ? t('account.justNow')
      : formatDistanceToNow(syncedAt, { addSuffix: true, locale: getDateLocale() })
    : undefined

  return (
    <XStack gap="$sm" alignItems="center" marginTop="$-sm">
      <YStack
        width={8}
        height={8}
        borderRadius={4}
        backgroundColor={behind ? '$colorSecondary' : '$colorGreen'}
      />
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" flex={1}>
        {behind
          ? t(`account.card.${state}`)
          : [t('account.card.upToDate'), when].filter(Boolean).join(' · ')}
      </Text>
    </XStack>
  )
}

function SignedIn({ account }: { account: Account }) {
  const { t } = useTranslation()
  const router = useRouter()
  const view = useQuery({ queryKey: ['account-view', account.device], queryFn: loadAccountView })

  return (
    <YStack gap="$lg">
      <StatusLine />
      <Devices account={account} seen={view.data?.devices} />
      <GoldButton
        label={t('account.addDevice')}
        onPress={() => router.push('/account/add-device')}
      />
      <SectionDivider />
      {view.data ? (
        <AboutYou
          account={account}
          profile={view.data.profile}
          recoverable={view.data.recoverable}
        />
      ) : view.isError ? (
        <Quiet>{t('account.couldNotReach')}</Quiet>
      ) : undefined}
      <SectionDivider />
      <Leaving />
    </YStack>
  )
}

function Devices({
  account,
  seen,
}: {
  account: Account
  seen: { id: string; seenAt: number }[] | undefined
}) {
  const { t } = useTranslation()
  const named = useEventStore((s) => s.devices)
  // The relay knows which devices are still in; the log knows what they are called.
  const devices = [...named.values()]
    .filter((device) => !seen || seen.some((s) => s.id === device.id))
    .sort((a, b) => Number(b.id === account.device) - Number(a.id === account.device))
  const [open, setOpen] = useState<string>()

  return (
    <YStack gap="$md">
      <SectionTitle>{t('account.devices')}</SectionTitle>
      <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" paddingHorizontal="$md">
        {devices.map((device, i) => (
          <DeviceRow
            key={device.id}
            device={device}
            mine={device.id === account.device}
            seenAt={seen?.find((s) => s.id === device.id)?.seenAt}
            first={i === 0}
            open={open === device.id}
            onToggle={() => setOpen(open === device.id ? undefined : device.id)}
          />
        ))}
      </YStack>
    </YStack>
  )
}

function DeviceRow({
  device,
  mine,
  seenAt,
  first,
  open,
  onToggle,
}: {
  device: DeviceState
  mine: boolean
  seenAt: number | undefined
  first: boolean
  open: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [renaming, setRenaming] = useState<string>()
  const rename = useMutation({
    mutationFn: (name: string) => nameDevice(device.id, name),
    onSuccess: () => setRenaming(undefined),
  })
  const remove = useMutation({ mutationFn: () => removeDevice(device.id) })
  const Icon = device.platform === 'web' ? Laptop : Smartphone
  const caption = (() => {
    if (mine) return t('account.thisDevice')
    if (!seenAt) return undefined
    // The relay notes a device at most once an hour, so within the hour it
    // cannot tell a minute ago from fifty.
    if (Date.now() - seenAt < 3_600_000) return t('account.seenThisHour')
    return t('account.lastSeen', {
      when: formatDistanceToNow(seenAt, { addSuffix: true, locale: getDateLocale() }),
    })
  })()

  async function askToRemove() {
    const ok = await confirm({
      title: t('account.removeDeviceTitle', { name: device.name }),
      description: t('account.removeDeviceBody'),
      confirmLabel: t('account.remove'),
      destructive: true,
    })
    if (ok) remove.mutate()
  }

  return (
    <YStack
      paddingVertical="$md"
      gap="$sm"
      borderTopWidth={first ? 0 : 1}
      borderTopColor="$borderColor"
    >
      <XStack gap="$md" alignItems="center">
        <Icon size={20} color={theme.colorSecondary?.val} />
        <YStack flex={1}>
          <Text fontFamily="$body" fontSize="$2" color="$color">
            {device.name}
          </Text>
          {caption ? (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {caption}
            </Text>
          ) : undefined}
        </YStack>
        <Pressable
          onPress={onToggle}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`${device.name}: ${t('account.rename')}`}
          accessibilityState={{ expanded: open }}
        >
          <MoreHorizontal size={20} color={open ? theme.accent?.val : theme.colorSecondary?.val} />
        </Pressable>
      </XStack>
      {open && renaming === undefined ? (
        <XStack gap="$lg" paddingLeft={36}>
          <TextAction label={t('account.rename')} onPress={() => setRenaming(device.name)} />
          {mine ? undefined : (
            <TextAction label={t('account.remove')} onPress={askToRemove} color="$colorBurgundy" />
          )}
        </XStack>
      ) : undefined}
      {open && renaming !== undefined ? (
        <XStack gap="$md" paddingLeft={36} alignItems="center">
          <Input
            unstyled
            value={renaming}
            onChangeText={setRenaming}
            // tamagui's native Input reads only `autoFocusNative`; `autoFocus` is the web's.
            autoFocus
            autoFocusNative
            maxLength={60}
            accessibilityLabel={t('account.deviceName')}
            onSubmitEditing={() => renaming.trim() && rename.mutate(renaming.trim())}
            flex={1}
            fontFamily="$body"
            fontSize="$2"
            color="$color"
            borderBottomWidth={1}
            borderBottomColor="$accent"
            paddingVertical={4}
          />
          <TextAction
            label={t('account.save')}
            onPress={() => renaming.trim() && rename.mutate(renaming.trim())}
          />
        </XStack>
      ) : undefined}
    </YStack>
  )
}

const fields = ['name', 'email', 'phone', 'birthday'] as const

function AboutYou({
  account,
  profile,
  recoverable,
}: {
  account: Account
  profile: Profile
  recoverable: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(profile)
  // On by default: it is kept unless the person says not to.
  const [keepCopy, setKeepCopy] = useState(recoverable || !(profile.email || profile.phone))
  useEffect(() => setDraft(profile), [profile])

  const reachable = Boolean(draft.email || draft.phone)
  const dirty =
    fields.some((field) => (draft[field] ?? '') !== (profile[field] ?? '')) ||
    Boolean(draft.news) !== Boolean(profile.news) ||
    (reachable && canKeepRecoveryCopy && keepCopy !== recoverable)
  const save = useMutation({
    mutationFn: () => saveProfile(draft, keepCopy),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account-view', account.device] }),
  })

  return (
    <YStack gap="$md">
      <YStack>
        <SectionTitle>{t('account.aboutYou')}</SectionTitle>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {t('account.allOptional')}
        </Text>
      </YStack>
      <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" paddingHorizontal="$md">
        {fields.map((field, i) => (
          <YStack
            key={field}
            paddingVertical="$sm"
            borderTopWidth={i === 0 ? 0 : 1}
            borderTopColor="$borderColor"
          >
            <XStack alignItems="center" gap="$md">
              <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                {t(`account.${field}`)}
              </Text>
              <Input
                unstyled
                value={draft[field] ?? ''}
                onChangeText={(value) => setDraft({ ...draft, [field]: value })}
                placeholder={field === 'birthday' ? t('account.birthdayHint') : t('account.add')}
                placeholderTextColor="$accent"
                accessibilityLabel={t(`account.${field}`)}
                autoCapitalize={field === 'name' ? 'words' : 'none'}
                autoCorrect={false}
                keyboardType={
                  field === 'email'
                    ? 'email-address'
                    : field === 'phone'
                      ? 'phone-pad'
                      : field === 'birthday'
                        ? 'numbers-and-punctuation'
                        : 'default'
                }
                maxLength={field === 'birthday' ? 10 : 200}
                flex={1}
                textAlign="right"
                fontFamily="$body"
                fontSize="$2"
                color="$color"
                paddingVertical={8}
              />
            </XStack>
            {field === 'email' && draft.email ? (
              <XStack gap="$sm" alignItems="center" paddingBottom="$sm">
                <AnimatedCheckbox
                  checked={Boolean(draft.news)}
                  onToggle={() => setDraft({ ...draft, news: !draft.news })}
                  accessibilityLabel={t('account.news')}
                />
                <Text fontFamily="$body" fontSize="$2" color="$color">
                  {t('account.news')}
                </Text>
              </XStack>
            ) : undefined}
          </YStack>
        ))}
      </YStack>
      {reachable && canKeepRecoveryCopy ? (
        <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" padding="$md" gap="$sm">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontFamily="$body" fontSize="$2" color="$color">
              {t('account.recovery')}
            </Text>
            <Switch
              value={keepCopy}
              onValueChange={setKeepCopy}
              trackColor={{ true: theme.accent?.val }}
              accessibilityLabel={t('account.recovery')}
            />
          </XStack>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t('account.recoveryHint')}
          </Text>
        </YStack>
      ) : undefined}
      {dirty ? (
        <GoldButton label={t('account.save')} onPress={() => save.mutate()} busy={save.isPending} />
      ) : undefined}
    </YStack>
  )
}

function Leaving() {
  const { t } = useTranslation()
  const theme = useTheme()

  async function removeThis() {
    const ok = await confirm({
      title: t('account.removeThis'),
      description: t('account.removeThisConfirm'),
      confirmLabel: t('account.remove'),
      destructive: true,
    })
    if (!ok) return
    if (!(await sendPending())) {
      const anyway = await confirm({
        title: t('account.unsentTitle'),
        description: t('account.unsentBody'),
        confirmLabel: t('account.removeAnyway'),
        destructive: true,
      })
      if (!anyway) return
    }
    await removeThisDevice()
  }

  async function keepOnly() {
    const ok = await confirm({
      title: t('account.keepOnly'),
      description: t('account.keepOnlyConfirm'),
      confirmLabel: t('account.keepOnlyAction'),
      destructive: true,
    })
    if (ok) await keepOnlyHere()
  }

  async function deleteAll() {
    const ok = await confirm({
      title: t('account.delete'),
      description: t('account.deleteConfirm'),
      confirmLabel: t('account.deleteAction'),
      destructive: true,
    })
    if (ok) await deleteAccount()
  }

  // Each needs the relay: said plainly when it can't be reached, since none of
  // them can be half done.
  const leave = useMutation({
    mutationFn: (action: () => Promise<void>) => action(),
    onError: () =>
      confirm({
        title: t('error.somethingWrong'),
        description: t('account.couldNotReach'),
        singleAction: true,
      }),
  })
  const rows = [
    { label: t('account.removeThis'), hint: t('account.removeThisHint'), action: removeThis },
    { label: t('account.keepOnly'), hint: t('account.keepOnlyHint'), action: keepOnly },
    { label: t('account.delete'), hint: t('account.deleteHint'), action: deleteAll, grave: true },
  ]

  return (
    <YStack gap="$md">
      <SectionTitle>{t('account.leaving')}</SectionTitle>
      <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" paddingHorizontal="$md">
        {rows.map((row, i) => (
          <Pressable
            key={row.label}
            onPress={() => leave.mutate(row.action)}
            disabled={leave.isPending}
            accessibilityRole="button"
            accessibilityLabel={`${row.label}. ${row.hint}`}
          >
            <XStack
              paddingVertical="$md"
              gap="$md"
              alignItems="center"
              borderTopWidth={i === 0 ? 0 : 1}
              borderTopColor="$borderColor"
            >
              <YStack flex={1}>
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  color={row.grave ? '$colorDestructive' : '$color'}
                >
                  {row.label}
                </Text>
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {row.hint}
                </Text>
              </YStack>
              <ChevronRight size={18} color={theme.colorSecondary?.val} />
            </XStack>
          </Pressable>
        ))}
      </YStack>
    </YStack>
  )
}
