import type { CorrectionBody } from '@ember/api'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, XStack, YStack } from 'tamagui'
import { AnimatedCheckbox, AnimatedPressable, Typography } from '@/components'
import { selectionTick, successBuzz } from '@/lib/haptics'
import { useSubmitCorrection, useVerifyChurch } from '@/lib/mass-times'
import { OutlineChip } from './OutlineChip'

// Crowd-correction on the detail screen: confirm the times are right (verify), or open an inline form
// to report what's wrong (a free-text note, or flag the church as permanently closed). Inline rather
// than a modal — the app favors in-place disclosure over overlays.
export function ChurchFeedback({ churchId }: { churchId: string }) {
  const { t } = useTranslation()
  const verify = useVerifyChurch(churchId)
  const correction = useSubmitCorrection(churchId)
  const [editing, setEditing] = useState(false)
  const [comment, setComment] = useState('')
  const [closed, setClosed] = useState(false)

  const canSubmit = (closed || comment.trim().length > 0) && !correction.isPending

  const submit = () => {
    const text = comment.trim()
    const body: CorrectionBody = closed
      ? { kind: 'flag_closed', comment: text || undefined }
      : { kind: 'note', comment: text }
    correction.mutate(body, {
      onSuccess: () => {
        void successBuzz()
        setEditing(false)
        setComment('')
        setClosed(false)
      },
    })
  }

  if (correction.isSuccess) {
    return (
      <YStack gap="$sm">
        <Typography variant="label">{t('massTimes.feedbackTitle')}</Typography>
        <Typography variant="annotation">{t('massTimes.correctionThanks')}</Typography>
      </YStack>
    )
  }

  return (
    <YStack gap="$sm">
      <Typography variant="label">{t('massTimes.feedbackTitle')}</Typography>

      <XStack gap="$sm" flexWrap="wrap">
        {verify.isSuccess ? (
          <Typography variant="annotation">
            {t(verify.data?.deduped ? 'massTimes.alreadyVerified' : 'massTimes.verifyThanks')}
          </Typography>
        ) : (
          <ChipButton
            label={t('massTimes.timesCorrect')}
            onPress={() => verify.mutate(undefined, { onSuccess: () => void successBuzz() })}
            disabled={verify.isPending}
          />
        )}
        <ChipButton
          label={t('massTimes.suggestEdit')}
          onPress={() => setEditing((v) => !v)}
          active={editing}
        />
      </XStack>

      {editing ? (
        <YStack gap="$sm">
          <Input
            value={comment}
            onChangeText={setComment}
            placeholder={t('massTimes.commentPlaceholder')}
            multiline
            numberOfLines={3}
            minHeight={80}
            verticalAlign="top"
          />
          <AnimatedPressable
            onPress={() => {
              void selectionTick()
              setClosed((v) => !v)
            }}
          >
            <XStack alignItems="center" gap="$sm">
              <AnimatedCheckbox
                checked={closed}
                onToggle={() => {
                  void selectionTick()
                  setClosed((v) => !v)
                }}
                accessibilityLabel={t('massTimes.markClosed')}
                size={22}
                subtle
              />
              <Typography variant="interface" fontSize="$3">
                {t('massTimes.markClosed')}
              </Typography>
            </XStack>
          </AnimatedPressable>
          <XStack gap="$sm">
            <ChipButton label={t('massTimes.submit')} onPress={submit} disabled={!canSubmit} />
            <ChipButton label={t('massTimes.cancel')} onPress={() => setEditing(false)} />
          </XStack>
        </YStack>
      ) : null}
    </YStack>
  )
}

function ChipButton({
  label,
  onPress,
  disabled,
  active,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <AnimatedPressable onPress={onPress} disabled={disabled} accessibilityRole="button">
      <OutlineChip
        paddingHorizontal="$md"
        paddingVertical="$sm"
        opacity={disabled ? 0.5 : 1}
        backgroundColor={active ? '$backgroundSurface' : 'transparent'}
      >
        <Typography variant="interface" fontSize="$3" color={active ? '$accent' : '$color'}>
          {label}
        </Typography>
      </OutlineChip>
    </AnimatedPressable>
  )
}
