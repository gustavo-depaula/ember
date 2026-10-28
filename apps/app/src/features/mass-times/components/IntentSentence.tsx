import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { selectionTick } from '@/lib/haptics'
import { dayOffset, type Intent, type When, whenChoices } from '../agenda'
import { serviceKindOrder } from '../format'
import type { MassFilter } from '../useMassTimesNearby'
import { useGlassTile } from './glass'

const intents: Intent[] = [...serviceKindOrder, 'visit']

// The list's question as a sentence you complete — "Quero ir à Missa agora" — instead of filter chips:
// people come asking when they can go, not what to narrow down. Each underlined phrase opens its
// choices as a chip row beneath, and choosing one closes it.
export function IntentSentence({
  filter,
  onChange,
}: {
  filter: MassFilter
  onChange: (filter: MassFilter) => void
}) {
  const { t } = useTranslation()
  const [picking, setPicking] = useState<'intent' | 'when' | undefined>(undefined)
  const today = new Date()
  const choices = whenChoices(today)
  // On Saturday and Sunday "on Sunday" is tomorrow or today, and is named so.
  const when = choices.includes(filter.when)
    ? filter.when
    : dayOffset('sunday', today) === 0
      ? 'today'
      : 'tomorrow'

  const choose = (next: MassFilter) => {
    void selectionTick()
    setPicking(undefined)
    onChange(next)
  }

  return (
    <YStack gap="$sm">
      <XStack flexWrap="wrap" alignItems="center" columnGap={7} paddingHorizontal={20}>
        <Typography variant="sacred-title" textAlign="left" fontSize={24} lineHeight={34}>
          {t('massTimes.sentence.start')}
        </Typography>
        <Phrase
          label={t(`massTimes.sentence.intent.${filter.intent}`)}
          open={picking === 'intent'}
          onPress={() => setPicking(picking === 'intent' ? undefined : 'intent')}
        />
        <Phrase
          label={t(`massTimes.sentence.when.${when}`)}
          open={picking === 'when'}
          onPress={() => setPicking(picking === 'when' ? undefined : 'when')}
        />
      </XStack>
      {picking === 'intent' ? (
        <ChipRow
          options={intents.map((intent) => ({
            id: intent,
            label: t(`massTimes.kind.${intent}`),
            selected: filter.intent === intent,
            onPress: () => choose({ ...filter, intent }),
          }))}
        />
      ) : picking === 'when' ? (
        <ChipRow
          options={choices.map((w: When) => ({
            id: w,
            label: t(`massTimes.sentence.when.${w}`),
            selected: when === w,
            onPress: () => choose({ ...filter, when: w }),
          }))}
        />
      ) : null}
    </YStack>
  )
}

// One fill-in of the sentence: the phrase underlined in gold, with a small ▾ saying it can change.
function Phrase({ label, open, onPress }: { label: string; open: boolean; onPress: () => void }) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded: open }}
    >
      <XStack alignItems="center" gap={3}>
        <Typography
          variant="sacred-title"
          textAlign="left"
          fontSize={24}
          lineHeight={34}
          textDecorationLine="underline"
          textDecorationColor={theme.accent?.val}
        >
          {label}
        </Typography>
        <Typography color="$accent" fontSize={12}>
          {open ? '▴' : '▾'}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}

function ChipRow({
  options,
}: {
  options: { id: string; label: string; selected: boolean; onPress: () => void }[]
}) {
  const tile = useGlassTile(true)
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      {options.map(({ id, label, selected, onPress }) => (
        <AnimatedPressable
          key={id}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={label}
        >
          <XStack
            alignItems="center"
            height={32}
            paddingHorizontal="$md"
            borderRadius={16}
            backgroundColor={selected ? '$color' : tile}
          >
            <Typography
              variant="interface"
              fontSize="$2"
              color={selected ? '$background' : '$color'}
            >
              {label}
            </Typography>
          </XStack>
        </AnimatedPressable>
      ))}
    </ScrollView>
  )
}
