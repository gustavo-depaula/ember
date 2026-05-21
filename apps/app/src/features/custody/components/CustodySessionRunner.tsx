import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { AppState, type AppStateStatus, Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { useKeepAwake } from '@/hooks/useKeepAwake'
import { successBuzz } from '@/lib/haptics'

import { useSessionStore } from '../sessionStore'

import { AnchorPreview } from './AnchorPreview'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function CustodySessionRunner() {
  useKeepAwake()
  const router = useRouter()
  const kind = useSessionStore((s) => s.kind)
  const pause = useSessionStore((s) => s.pause)
  const resume = useSessionStore((s) => s.resume)
  const abort = useSessionStore((s) => s.abort)
  const complete = useSessionStore((s) => s.complete)

  const [, setTick] = useState(0)
  const bellsFiredRef = useRef<Set<number>>(new Set())
  const isForegroundRef = useRef(true)

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      isForegroundRef.current = next === 'active'
    })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    if (kind !== 'running' && kind !== 'paused') return
    const interval = setInterval(() => {
      setTick((t) => t + 1)
      if (kind !== 'running') return
      const s = useSessionStore.getState()
      if (s.kind !== 'running') return
      const elapsed = s.elapsedSeconds()
      if (s.remainingSeconds() <= 0) {
        void complete()
        return
      }
      const checkpoints = [
        Math.floor(s.plannedSeconds / 3),
        Math.floor((s.plannedSeconds * 2) / 3),
        s.plannedSeconds,
      ]
      for (const cp of checkpoints) {
        if (elapsed >= cp && !bellsFiredRef.current.has(cp)) {
          bellsFiredRef.current.add(cp)
          if (isForegroundRef.current) void successBuzz()
        }
      }
    }, 500)
    return () => clearInterval(interval)
  }, [kind, complete])

  if (kind === 'idle') {
    return (
      <YStack alignItems="center" gap="$md" paddingVertical="$xl">
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          No session in progress.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text fontFamily="$body" fontSize="$2" color="$accent">
            ‹ Back
          </Text>
        </Pressable>
      </YStack>
    )
  }

  if (kind === 'completed') {
    return (
      <YStack alignItems="center" gap="$md" paddingVertical="$xl">
        <Text fontFamily="$heading" fontSize="$5" color="$accent">
          Deo gratias
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          Session complete.
        </Text>
        <Pressable
          onPress={() => {
            useSessionStore.setState({ kind: 'idle' })
            router.back()
          }}
        >
          <Text fontFamily="$body" fontSize="$2" color="$accent">
            Continue
          </Text>
        </Pressable>
      </YStack>
    )
  }

  const live = useSessionStore.getState()
  const anchor = live.kind === 'idle' || live.kind === 'completed' ? null : live.anchor
  const remaining = live.remainingSeconds()
  const elapsed = live.elapsedSeconds()

  return (
    <YStack alignItems="center" gap="$xl" paddingVertical="$xl">
      <YStack padding="$lg">{anchor && <AnchorPreview anchor={anchor} />}</YStack>

      <YStack alignItems="center" gap="$sm">
        <Text fontFamily="$heading" fontSize={56} color="$accent">
          {formatTime(remaining)}
        </Text>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {formatTime(elapsed)} elapsed
        </Text>
      </YStack>

      <XStack gap="$md">
        {kind === 'running' ? (
          <Pressable onPress={pause} accessibilityRole="button" accessibilityLabel="Pause">
            <YStack padding="$md" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
              <Text fontFamily="$body" fontSize="$3" color="$color">
                Pause
              </Text>
            </YStack>
          </Pressable>
        ) : (
          <Pressable onPress={resume} accessibilityRole="button" accessibilityLabel="Resume">
            <YStack padding="$md" borderRadius="$md" backgroundColor="$accent">
              <Text fontFamily="$body" fontSize="$3" color="white">
                Resume
              </Text>
            </YStack>
          </Pressable>
        )}
        <Pressable
          onPress={async () => {
            await abort()
            router.back()
          }}
          accessibilityRole="button"
          accessibilityLabel="Stop"
        >
          <YStack padding="$md" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
            <Text fontFamily="$body" fontSize="$3" color="$color">
              Stop
            </Text>
          </YStack>
        </Pressable>
      </XStack>
    </YStack>
  )
}
