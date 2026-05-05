// biome-ignore-all lint/suspicious/noArrayIndexKey: rich-text lines never reorder

import type {
  BilingualRichText,
  BilingualText,
  PickerStyle,
  RichTextLine,
} from '@ember/content-engine'
import { Text, XStack, YStack } from 'tamagui'
import { AnimatedPressable } from '../AnimatedPressable'
import { PrayerText } from '../PrayerText'
import { OptionCard } from './OptionCard'

type Option = {
  id: string
  label: BilingualText
  body: BilingualRichText
  citation?: BilingualText
  introduction?: BilingualText
  conclusion?: BilingualText
  response?: BilingualRichText
  excerpt?: BilingualText
}

/**
 * Per-slot picker rendering for the choice-rich-text primitive.
 *
 * Renders a chip header (Tmp / Snt / Com chips, hidden when only one option),
 * the selected option's citation (if any), and the selected option's body —
 * walking ember-extra's typed segments (text / rubric / reference / italic /
 * response / signOfCross / dropCap) and styling each accordingly.
 */
export function ChoiceRichTextBlock({
  label,
  selectedId,
  options,
  onSelect,
  pickerStyle = 'chips',
}: {
  label: BilingualText
  selectedId: string
  options: Option[]
  onSelect: (optionId: string) => void
  pickerStyle?: PickerStyle
}) {
  const current = options.find((o) => o.id === selectedId) ?? options[0]
  if (!current) return null

  return (
    <YStack gap="$sm">
      <Text
        fontFamily="$heading"
        fontSize="$2"
        color="$accent"
        letterSpacing={1}
        textTransform="uppercase"
      >
        {label.primary}
      </Text>
      {options.length > 1 &&
        (pickerStyle === 'cards' ? (
          <YStack gap="$xs">
            {options.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.label.primary}
                excerpt={opt.excerpt?.primary}
                isSelected={opt.id === current.id}
                onPress={() => onSelect(opt.id)}
              />
            ))}
          </YStack>
        ) : (
          <XStack gap="$xs" flexWrap="wrap">
            {options.map((option) => {
              const isSelected = option.id === current.id
              return (
                <AnimatedPressable
                  key={option.id}
                  onPress={() => onSelect(option.id)}
                  accessibilityRole="tab"
                  accessibilityLabel={option.label.primary}
                  accessibilityState={{ selected: isSelected }}
                >
                  <YStack
                    paddingHorizontal="$sm"
                    paddingVertical="$xxs"
                    borderRadius="$sm"
                    borderWidth={1}
                    borderColor={isSelected ? '$accent' : '$borderColor'}
                    backgroundColor={isSelected ? '$accent' : 'transparent'}
                  >
                    <Text
                      fontFamily="$heading"
                      fontSize="$1"
                      color={isSelected ? '$background' : '$colorSecondary'}
                    >
                      {option.label.primary}
                    </Text>
                  </YStack>
                </AnimatedPressable>
              )
            })}
          </XStack>
        ))}

      {current.citation && (
        <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" letterSpacing={0.5}>
          {current.citation.primary}
        </Text>
      )}

      {current.introduction && (
        <PrayerText color="$colorBurgundy" fontStyle="italic">
          {current.introduction.primary}
        </PrayerText>
      )}

      <RichTextBody body={current.body} />

      {current.conclusion && (
        <PrayerText color="$colorBurgundy" fontStyle="italic">
          {current.conclusion.primary}
        </PrayerText>
      )}

      {current.response && <RichTextBody body={current.response} />}
    </YStack>
  )
}

function RichTextBody({ body }: { body: BilingualRichText }) {
  return (
    <YStack gap="$xs">
      {body.primary.map((line, i) => (
        <FormattedRichTextLine key={i} line={line} />
      ))}
    </YStack>
  )
}

function FormattedRichTextLine({ line }: { line: RichTextLine }) {
  if (line.length === 0) {
    return <YStack height="$xs" />
  }

  // Render the whole line through PrayerText (which applies the user's reading
  // style — font, size, line height). Inner segments are also PrayerText so
  // they inherit the same typography; they only override color/style/weight
  // for the typed segment kind. Plain `<Text>` would silently fall back to
  // Tamagui's default font and break the missal's typography.
  return (
    <PrayerText>
      {line.map((seg, i) => {
        switch (seg.type) {
          case 'rubric':
            return (
              <PrayerText key={i} color="$colorBurgundy" fontStyle="italic">
                {seg.text}
              </PrayerText>
            )
          case 'response':
            return (
              <PrayerText key={i} fontWeight="bold">
                {seg.text}
              </PrayerText>
            )
          case 'signOfCross':
            return (
              <PrayerText key={i} color="$accent">
                {seg.text}
              </PrayerText>
            )
          case 'reference':
            return (
              <PrayerText key={i} color="$colorSecondary" opacity={0.7}>
                {seg.text}
              </PrayerText>
            )
          case 'italic':
            return (
              <PrayerText key={i} fontStyle="italic">
                {seg.text}
              </PrayerText>
            )
          case 'dropCap':
            return (
              <PrayerText key={i} fontFamily="$heading" color="$colorBurgundy">
                {seg.text}
              </PrayerText>
            )
          default:
            return <PrayerText key={i}>{seg.text}</PrayerText>
        }
      })}
    </PrayerText>
  )
}
