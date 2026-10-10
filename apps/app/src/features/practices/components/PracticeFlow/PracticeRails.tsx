import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { RailBlock, RailLink, Typography } from '@/components'
import type { OutlineEntry } from '@/components/outline'
import { usePreferencesStore } from '@/stores/preferencesStore'
import type { usePracticeActions } from './PracticeActions'

type Actions = ReturnType<typeof usePracticeActions>

/** Left of the text: where you are in it, and its other forms. */
export function PracticeContentsRail({
  outline,
  actions,
  onJump,
}: {
  outline: OutlineEntry[]
  actions: Actions
  onJump: (id: number) => void
}) {
  const { t } = useTranslation()
  const { group, manifest } = actions
  return (
    <>
      {outline.length > 0 && (
        <RailBlock first title={t('practice.onThisPage')}>
          {outline.map((entry) => (
            <RailLink key={entry.id} label={entry.title} onPress={() => onJump(entry.id)} />
          ))}
        </RailBlock>
      )}
      {group && (
        <RailBlock first={outline.length === 0} title={t('practice.form')}>
          {group.members.map((member) => (
            <RailLink
              key={member.manifest.id}
              label={member.label}
              role="radio"
              selected={member.manifest.id === manifest.id}
              onPress={() => actions.onPickVariant(member.manifest.id)}
            />
          ))}
        </RailBlock>
      )}
    </>
  )
}

/** Right of the text: how it is set, and everything the ⊕ sheet holds on a phone. */
export function PracticeToolsRail({ actions }: { actions: Actions }) {
  const { t } = useTranslation()
  const { manifest, plan, save, pin } = actions
  const step = usePreferencesStore((s) => s.fontSizeStep)
  const setStep = usePreferencesStore((s) => s.setFontSizeStep)
  return (
    <>
      <RailBlock first title={t('readingConfig.reading')}>
        <XStack alignItems="center" gap="$md" marginLeft={-10}>
          <SizeStep
            glyph={15}
            label={`${t('readingConfig.size')} −`}
            onPress={() => setStep(step - 1)}
          />
          <SizeStep
            glyph={24}
            label={`${t('readingConfig.size')} +`}
            onPress={() => setStep(step + 1)}
          />
        </XStack>
        <RailLink label={t('a11y.readingSettings')} onPress={actions.openSettings} />
        {manifest.estimatedMinutes !== undefined && (
          <Typography variant="annotation" paddingTop="$xs">
            {t('catalog.estimatedTime', { minutes: manifest.estimatedMinutes })}
          </Typography>
        )}
      </RailBlock>
      <RailBlock>
        <RailLink
          label={plan.isInPlan ? t('catalog.alreadyInPlan') : t('catalog.addToPlan')}
          selected={plan.isInPlan}
          onPress={actions.onPlan}
        />
        <RailLink
          label={save.saved ? t('library.saved') : t('library.save')}
          selected={save.saved}
          onPress={actions.onSave}
        />
        <RailLink label={t('library.addToCollection')} onPress={actions.onCollection} />
        <RailLink label={t('library.offline')} selected={pin.pinned} onPress={actions.onPin} />
        <RailLink label={t('a11y.sharePractice')} onPress={actions.onShare} />
      </RailBlock>
    </>
  )
}

function SizeStep({
  glyph,
  label,
  onPress,
}: {
  glyph: number
  label: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <YStack width={44} height={44} alignItems="center" justifyContent="center">
        <Typography fontSize={glyph} lineHeight={glyph * 1.4} color="$colorSecondary">
          A
        </Typography>
      </YStack>
    </Pressable>
  )
}
