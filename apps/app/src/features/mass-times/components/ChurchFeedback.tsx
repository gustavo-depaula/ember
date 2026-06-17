import type { CorrectionBody } from '@ember/api'
import { Image } from 'expo-image'
import { Camera, X } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedCheckbox, AnimatedPressable, Typography } from '@/components'
import { lightTap, selectionTick, successBuzz } from '@/lib/haptics'
import { useSubmitCorrection, useUploadAttachment, useVerifyChurch } from '@/lib/mass-times'
import { pickCorrectionPhoto } from '../attachments'
import { ChipButton } from './ChipButton'

const maxPhotos = 3

// Crowd-correction on the detail screen: confirm the times are right (verify), or open an inline form
// to report what's wrong (a free-text note, a photo of the parish bulletin, or flag the church as
// permanently closed). Inline rather than a modal — the app favors in-place disclosure over overlays.
export function ChurchFeedback({ churchId }: { churchId: string }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const verify = useVerifyChurch(churchId)
  const correction = useSubmitCorrection(churchId)
  const upload = useUploadAttachment(churchId)
  const [editing, setEditing] = useState(false)
  const [comment, setComment] = useState('')
  const [closed, setClosed] = useState(false)
  const [photos, setPhotos] = useState<{ key: string; uri: string }[]>([])

  const canSubmit = (closed || comment.trim().length > 0) && !correction.isPending
  const toggleClosed = () => {
    void selectionTick()
    setClosed((v) => !v)
  }

  const addPhoto = async () => {
    if (photos.length >= maxPhotos || upload.isPending) return
    let picked: Awaited<ReturnType<typeof pickCorrectionPhoto>>
    try {
      picked = await pickCorrectionPhoto()
    } catch (err) {
      // Native picker absent until rebuild, or the user denied library access.
      console.warn('[mass-times] photo picker unavailable', err)
      return
    }
    if (!picked) return
    const { uri } = picked
    upload.mutate(picked, {
      // errors surface via the global mutationCache dialog
      onSuccess: (key) => {
        void lightTap()
        setPhotos((p) => [...p, { key, uri }])
      },
    })
  }

  const submit = () => {
    const text = comment.trim()
    const keys = photos.map((p) => p.key)
    const attachmentKeys = keys.length ? keys : undefined
    const body: CorrectionBody = closed
      ? { kind: 'flag_closed', comment: text || undefined, attachmentKeys }
      : { kind: 'note', comment: text, attachmentKeys }
    correction.mutate(body, {
      onSuccess: () => {
        void successBuzz()
        setEditing(false)
        setComment('')
        setClosed(false)
        setPhotos([])
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
          selected={editing}
          soft
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

          <XStack gap="$sm" flexWrap="wrap" alignItems="center">
            {photos.map((photo) => (
              <YStack key={photo.key}>
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: 56, height: 56, borderRadius: 8 }}
                  contentFit="cover"
                />
                <AnimatedPressable
                  onPress={() => setPhotos((p) => p.filter((x) => x.key !== photo.key))}
                  hitSlop={8}
                  accessibilityRole="button"
                  style={{ position: 'absolute', top: -6, right: -6 }}
                >
                  <RemoveBadge />
                </AnimatedPressable>
              </YStack>
            ))}
            {photos.length < maxPhotos ? (
              <ChipButton
                label={upload.isPending ? t('massTimes.photoUploading') : t('massTimes.addPhoto')}
                icon={<Camera size={15} color={theme.color?.val} />}
                onPress={addPhoto}
                disabled={upload.isPending}
              />
            ) : null}
          </XStack>

          <XStack alignItems="center" gap="$sm">
            <AnimatedCheckbox
              checked={closed}
              onToggle={toggleClosed}
              accessibilityLabel={t('massTimes.markClosed')}
              size={22}
              subtle
            />
            <AnimatedPressable onPress={toggleClosed}>
              <Typography variant="interface" fontSize="$3">
                {t('massTimes.markClosed')}
              </Typography>
            </AnimatedPressable>
          </XStack>
          <XStack gap="$sm">
            <ChipButton label={t('massTimes.submit')} onPress={submit} disabled={!canSubmit} />
            <ChipButton label={t('massTimes.cancel')} onPress={() => setEditing(false)} />
          </XStack>
        </YStack>
      ) : null}
    </YStack>
  )
}

function RemoveBadge() {
  const theme = useTheme()
  return (
    <XStack
      width={20}
      height={20}
      borderRadius={10}
      backgroundColor="$background"
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="center"
    >
      <X size={12} color={theme.colorSecondary?.val} />
    </XStack>
  )
}
