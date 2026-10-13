import { useMutation } from '@tanstack/react-query'
import { requireOptionalNativeModule } from 'expo'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { Input, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'

import { type Answer, answerScanned, answerTyped, readQr } from '../pairing'
import { isRelayError } from '../relay'
import { BigDigits, GoldButton, Lead, Quiet, TextAction } from './parts'

// The camera arrived in a later build than sync did: an install without it
// pairs by typing the code.
const camera =
  Platform.OS !== 'web' && requireOptionalNativeModule('ExpoCamera')
    ? (require('expo-camera') as typeof import('expo-camera'))
    : undefined

/** The signed-in device's side of a pairing: it reads the new device's code and lets it in. */
export function AddDevicePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [typing, setTyping] = useState(!camera)
  const [code, setCode] = useState('')
  const [problem, setProblem] = useState<string>()
  const [answer, setAnswer] = useState<Answer>()
  const [sent, setSent] = useState(false)

  const explain = (err: unknown) =>
    setProblem(
      isRelayError(err) && err.status === 404
        ? t('account.add_.notFound')
        : t('account.couldNotReach'),
    )
  const typed = useMutation({
    mutationFn: () => answerTyped(code),
    onMutate: () => setProblem(undefined),
    onSuccess: setAnswer,
    onError: explain,
  })
  const handOver = useMutation({
    mutationFn: (confirm: () => Promise<void>) => confirm(),
    onSuccess: () => setSent(true),
    onError: explain,
  })
  const digits = code.replace(/\D/g, '')

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg" flexGrow={1}>
        <PageHeader title={t('account.addDevice')} />
        {sent ? (
          <YStack gap="$xl" paddingTop="$xl">
            <Lead>{t('account.add_.sent')}</Lead>
            <GoldButton label={t('account.title')} onPress={() => router.back()} />
          </YStack>
        ) : answer ? (
          <YStack gap="$lg" paddingTop="$lg">
            <Lead>{t('account.add_.matchTitle')}</Lead>
            <BigDigits>{answer.check}</BigDigits>
            <Quiet center>{t('account.add_.matchHint')}</Quiet>
            <GoldButton
              label={t('account.add_.yes')}
              onPress={() => handOver.mutate(answer.confirm)}
              busy={handOver.isPending}
            />
            <TextAction label={t('account.add_.no')} onPress={() => router.back()} />
          </YStack>
        ) : (
          <YStack gap="$lg">
            <Quiet>{t('account.add_.onNew')}</Quiet>
            {camera && !typing ? (
              <Scanner
                camera={camera}
                onScanned={(text) => {
                  const scanned = readQr(text)
                  if (!scanned) return setProblem(t('account.add_.notOurs'))
                  setProblem(undefined)
                  handOver.mutate(() => answerScanned(scanned))
                }}
              />
            ) : (
              <YStack gap="$md">
                <Input
                  unstyled
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  // tamagui's native Input reads only `autoFocusNative`; `autoFocus` is the web's.
                  autoFocus
                  autoFocusNative
                  maxLength={9}
                  placeholder="0000 0000"
                  placeholderTextColor="$borderColor"
                  accessibilityLabel={t('account.add_.codeLabel')}
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$md"
                  fontFamily="$body"
                  fontSize={32}
                  letterSpacing={4}
                  textAlign="center"
                  color="$color"
                />
                <GoldButton
                  label={t('account.add_.next')}
                  onPress={() => digits.length === 8 && typed.mutate()}
                  busy={typed.isPending}
                />
              </YStack>
            )}
            {problem ? <Quiet center>{problem}</Quiet> : undefined}
            {camera && !typing ? (
              <TextAction label={t('account.add_.typeInstead')} onPress={() => setTyping(true)} />
            ) : undefined}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}

function Scanner({
  camera,
  onScanned,
}: {
  camera: typeof import('expo-camera')
  onScanned: (text: string) => void
}) {
  const { t } = useTranslation()
  const [permission, ask] = camera.useCameraPermissions()
  // The camera reports the same code many times a second; one answer is enough.
  const last = useRef('')
  if (!permission) return undefined
  if (!permission.granted) {
    return <GoldButton label={t('account.add_.allowCamera')} onPress={() => ask()} />
  }
  return (
    <YStack gap="$sm">
      <YStack borderRadius="$lg" overflow="hidden" aspectRatio={1} backgroundColor="#000">
        <camera.CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (data === last.current) return
            last.current = data
            onScanned(data)
          }}
        />
      </YStack>
      <Quiet center>{t('account.add_.point')}</Quiet>
    </YStack>
  )
}
