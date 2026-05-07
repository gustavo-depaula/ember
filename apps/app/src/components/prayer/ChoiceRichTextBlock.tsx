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
import { ResponseMark } from './ResponseMark'
import { SectionHeading } from './SectionHeading'

type Option = {
  id: string
  label: BilingualText
  body: BilingualRichText
  citation?: BilingualText
  summary?: BilingualText
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
  hideLabel = false,
}: {
  label: BilingualText
  selectedId?: string
  options: Option[]
  onSelect: (optionId: string) => void
  pickerStyle?: PickerStyle
  hideLabel?: boolean
}) {
  const current = selectedId ? options.find((o) => o.id === selectedId) : undefined
  if (options.length === 0) return null

  const renderBody = (opt: Option) => (
    <>
      {opt.citation && (
        <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" letterSpacing={0.5}>
          {opt.citation.primary}
        </Text>
      )}
      {opt.summary && (
        <PrayerText color="$colorBurgundy" fontStyle="italic">
          {opt.summary.primary}
        </PrayerText>
      )}
      {opt.introduction && (
        <PrayerText color="$colorBurgundy" fontStyle="italic">
          {opt.introduction.primary}
        </PrayerText>
      )}
      <RichTextBody body={opt.body} />
      {opt.conclusion && (
        <PrayerText color="$colorBurgundy" fontStyle="italic">
          {opt.conclusion.primary}
        </PrayerText>
      )}
      {opt.response && <RichTextBody body={opt.response} />}
    </>
  )

  return (
    <YStack gap="$sm">
      {!hideLabel && <SectionHeading>{label.primary}</SectionHeading>}
      {pickerStyle === 'cards' ? (
        <YStack gap="$xs">
          {options.map((opt) => (
            <OptionCard
              key={opt.id}
              label={opt.label.primary}
              excerpt={opt.excerpt?.primary}
              isSelected={opt.id === current?.id}
              onPress={() => onSelect(opt.id)}
            />
          ))}
        </YStack>
      ) : (
        options.length > 1 && (
          <XStack gap="$xs" flexWrap="wrap">
            {options.map((opt) => {
              const isSelected = opt.id === current?.id
              return (
                <AnimatedPressable
                  key={opt.id}
                  onPress={() => onSelect(opt.id)}
                  accessibilityRole="tab"
                  accessibilityLabel={opt.label.primary}
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
                      {opt.label.primary}
                    </Text>
                  </YStack>
                </AnimatedPressable>
              )
            })}
          </XStack>
        )
      )}
      {current && renderBody(current)}
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
            return <ResponseMark key={i} value={seg.text} />
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
