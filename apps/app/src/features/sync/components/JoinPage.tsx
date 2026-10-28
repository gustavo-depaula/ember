import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { getEventCount } from '@/db/events/store'

import { joinAccount } from '../account'
import { type Asking, askToJoin, waitForAnswer } from '../pairing'
import { BigDigits, GoldButton, Lead, QrCode, Quiet, TextAction } from './parts'

type Step =
  | { at: 'asking'; asking: Asking }
  | { at: 'checking'; check: string }
  | { at: 'bringing' }
  | { at: 'done' }
  | { at: 'expired' }
  | { at: 'failed' }

/** The new device's side of a pairing: it shows its code and waits to be let in. */
export function JoinPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const held = useQuery({ queryKey: ['account-join-held'], queryFn: getEventCount, gcTime: 0 })
  // What the device held when the page opened: joining fills the log, and the
  // count read again then would ask an empty device to agree after the fact.
  const [heldBefore, setHeldBefore] = useState<number>()
  if (heldBefore === undefined && held.data !== undefined) setHeldBefore(held.data)
  const [agreed, setAgreed] = useState(false)
  const [step, setStep] = useState<Step>()
  const [attempt, setAttempt] = useState(0)
  const ready = heldBefore !== undefined && (heldBefore === 0 || agreed)

  // Nothing here may depend on `t`: joining brings the account's language with
  // it, and an effect that ran again for that would ask for a second code.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` asks for a new code
  useEffect(() => {
    if (!ready) return
    let stopped = false
    async function pair() {
      const asking = await askToJoin()
      if (stopped) return
      setStep({ at: 'asking', asking })
      const secret = await waitForAnswer(
        asking,
        (check) => setStep({ at: 'checking', check }),
        () => stopped,
      )
      if (stopped) return
      if (!secret) return setStep({ at: 'expired' })
      setStep({ at: 'bringing' })
      await joinAccount(secret)
      setStep({ at: 'done' })
    }
    pair().catch((err: unknown) => {
      if (!stopped) setStep({ at: 'failed' })
      console.warn('[sync] pairing failed', err)
    })
    return () => {
      stopped = true
    }
  }, [ready, attempt])

  const again = () => {
    setStep(undefined)
    setAttempt((n) => n + 1)
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg" flexGrow={1}>
        <PageHeader title={t('account.join.title')} />
        {heldBefore !== undefined && !ready ? (
          <YStack gap="$xl" flexGrow={1} justifyContent="space-between">
            <Lead>{t('account.join.replaces')}</Lead>
            <YStack gap="$lg" paddingBottom="$lg">
              <GoldButton label={t('account.join.continue')} onPress={() => setAgreed(true)} />
              <TextAction label={t('account.join.notNow')} onPress={() => router.back()} />
            </YStack>
          </YStack>
        ) : undefined}
        {step?.at === 'asking' ? <Showing asking={step.asking} /> : undefined}
        {step?.at === 'checking' ? (
          <YStack gap="$lg" paddingTop="$xl">
            <Lead>{t('account.join.checkTitle')}</Lead>
            <BigDigits>{step.check}</BigDigits>
            <Quiet center>{t('account.join.checkHint')}</Quiet>
          </YStack>
        ) : undefined}
        {step?.at === 'bringing' ? (
          <YStack paddingTop="$xl">
            <Lead>{t('account.join.bringing')}</Lead>
          </YStack>
        ) : undefined}
        {step?.at === 'done' ? (
          <YStack gap="$xl" flexGrow={1} justifyContent="space-between">
            <YStack gap="$md" paddingTop="$xl" alignItems="center">
              <Text fontFamily="$body" fontSize={32} color="$accent">
                ✠
              </Text>
              <Text fontFamily="$title" fontSize="$4" color="$color">
                {t('account.join.done')}
              </Text>
              <Quiet center>{t('account.join.doneBody')}</Quiet>
            </YStack>
            <YStack paddingBottom="$lg">
              <GoldButton label={t('account.join.goToday')} onPress={() => router.replace('/')} />
            </YStack>
          </YStack>
        ) : undefined}
        {step?.at === 'expired' || step?.at === 'failed' ? (
          <YStack gap="$lg" paddingTop="$xl">
            <Lead>
              {step.at === 'expired' ? t('account.join.expired') : t('account.couldNotReach')}
            </Lead>
            <GoldButton label={t('account.join.newCode')} onPress={again} />
          </YStack>
        ) : undefined}
      </YStack>
    </ScreenLayout>
  )
}

function Showing({ asking }: { asking: Asking }) {
  const { t } = useTranslation()
  const left = useRef(asking.expiresAt - Date.now())
  const [, tick] = useState(0)
  useEffect(() => {
    const every = setInterval(() => {
      left.current = Math.max(0, asking.expiresAt - Date.now())
      tick((n) => n + 1)
    }, 1000)
    return () => clearInterval(every)
  }, [asking.expiresAt])
  const seconds = Math.ceil(left.current / 1000)
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <YStack gap="$md" alignItems="stretch">
      <Quiet center>{t('account.join.instructions')}</Quiet>
      <QrCode value={asking.qr} size={220} />
      <Quiet center>{t('account.join.orType')}</Quiet>
      <BigDigits>{`${asking.code.slice(0, 4)} ${asking.code.slice(4)}`}</BigDigits>
      <Quiet center>
        {t('account.join.lasts')} · {t('account.join.remaining', { time })}
      </Quiet>
    </YStack>
  )
}
