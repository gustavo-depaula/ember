// biome-ignore-all lint/suspicious/noArrayIndexKey: rich-text lines never reorder

import type {
  BilingualRichText,
  BilingualText,
  PickerStyle,
  RichTextLine,
} from '@ember/content-engine'
import { useEffect, useMemo, useState } from 'react'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { AnimatedPressable } from '../AnimatedPressable'
import { PrayerText } from '../PrayerText'
import { ReadingParagraph } from '../ReadingParagraph'
import { OptionCard } from './OptionCard'
import { ResponseMark, responseMarkScale } from './ResponseMark'
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
  precedingResponse,
}: {
  label: BilingualText
  selectedId?: string
  options: Option[]
  onSelect: (optionId: string) => void
  pickerStyle?: PickerStyle
  hideLabel?: boolean
  // Static people's response rendered between `introduction` and `body`.
  // Used on the Gospel slot for the missal's "℟. Glory to you, O Lord."
  // (the people's response immediately after the priest's announcement).
  // Doesn't replace the slot's own `response` field, which still renders
  // after `conclusion` (the post-body "Praise to you, Lord Jesus Christ").
  precedingResponse?: BilingualText
}) {
  // All option bodies are always built (the picker needs them), so switching is
  // a local toggle — no re-resolution, which is what lets a cached producer emit
  // these slots and still have them switch. onSelect still fires to persist.
  const [localId, setLocalId] = useState(selectedId)
  useEffect(() => setLocalId(selectedId), [selectedId])
  const handleSelect = (id: string) => {
    setLocalId(id)
    onSelect(id)
  }

  const current = localId ? options.find((o) => o.id === localId) : undefined
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
      {precedingResponse && (
        <XStack gap={4} alignItems="baseline">
          <ResponseMark value="℟" width={18} />
          <PrayerText flex={1} fontWeight="600">
            {precedingResponse.primary}
          </PrayerText>
        </XStack>
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
              onPress={() => handleSelect(opt.id)}
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
                  onPress={() => handleSelect(opt.id)}
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

/**
 * One line of missal rich text, justified as a single paragraph.
 *
 * Every typed segment is an inline run: a rubric is burgundy italic, a ℣/℟ mark
 * is set 1.15x and never broken, a reference is muted. justif prices each at
 * its own size and colour, so a line that mixes all three still breaks as one
 * paragraph rather than opting out of justification.
 *
 * A drop cap is the exception the metrics can't cover — it is set in the
 * heading face, which has no generated advance table — so it opens the line as
 * a `lead`, and that line is left to the platform. A drop cap is only ever the
 * line's first letter; one anywhere else is set in the body face.
 */
function FormattedRichTextLine({ line }: { line: RichTextLine }) {
  const reading = useReadingStyle()
  const theme = useTheme()

  const inks = useMemo(
    // Resolved values rather than tokens: a run's `render` is a raw RN style.
    () => ({
      rubric: { color: theme.colorBurgundy?.val as string },
      mark: { color: theme.colorBurgundy?.val as string, lineHeight: reading.lineHeight },
      accent: { color: theme.accent?.val as string },
      reference: { color: theme.colorSecondary?.val as string, opacity: 0.7 },
    }),
    [theme.colorBurgundy, theme.accent, theme.colorSecondary, reading.lineHeight],
  )

  const dropCap = line[0]?.type === 'dropCap' ? line[0].text : undefined
  const segments = useMemo(
    () =>
      line.slice(dropCap === undefined ? 0 : 1).map((seg): StyledSegment => {
        switch (seg.type) {
          case 'rubric':
          case 'dropCap':
            return {
              text: seg.text,
              style: seg.type === 'rubric' ? 'italic' : 'regular',
              render: inks.rubric,
            }
          case 'response':
            return {
              text: seg.text,
              style: 'boldItalic',
              fontSizePx: Math.round(reading.fontSize * responseMarkScale),
              render: inks.mark,
              atomic: true,
            }
          case 'signOfCross':
            return { text: seg.text, style: 'regular', render: inks.accent }
          case 'reference':
            return { text: seg.text, style: 'regular', render: inks.reference }
          case 'italic':
            return { text: seg.text, style: 'italic' }
          default:
            return { text: seg.text, style: 'regular' }
        }
      }),
    [line, dropCap, inks, reading.fontSize],
  )

  if (line.length === 0) return <YStack height="$xs" />
  return (
    <ReadingParagraph
      source={segments}
      lead={
        dropCap === undefined ? undefined : (
          <Text fontFamily="$heading" color="$colorBurgundy">
            {dropCap}
          </Text>
        )
      }
    />
  )
}
