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
 * heading face, which has no generated advance table — so a line carrying one
 * renders as ordinary wrapped text.
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

  const source = useMemo<StyledSegment[] | undefined>(() => {
    const out: StyledSegment[] = []
    for (const seg of line) {
      switch (seg.type) {
        case 'rubric':
          out.push({ text: seg.text, style: 'italic', render: inks.rubric })
          break
        case 'response':
          out.push({
            text: seg.text,
            style: 'boldItalic',
            fontSizePx: Math.round(reading.fontSize * responseMarkScale),
            render: inks.mark,
            atomic: true,
          })
          break
        case 'signOfCross':
          out.push({ text: seg.text, style: 'regular', render: inks.accent })
          break
        case 'reference':
          out.push({ text: seg.text, style: 'regular', render: inks.reference })
          break
        case 'italic':
          out.push({ text: seg.text, style: 'italic' })
          break
        case 'dropCap':
          return undefined
        default:
          out.push({ text: seg.text, style: 'regular' })
      }
    }
    return out
  }, [line, inks, reading.fontSize])

  // Inner segments are PrayerText so they inherit the reading typography; a
  // plain <Text> would silently fall back to Tamagui's default font.
  const inline = line.map((seg, i) => {
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
  })

  if (line.length === 0) return <YStack height="$xs" />
  if (!source) return <PrayerText>{inline}</PrayerText>
  return <ReadingParagraph source={source} fallback={<>{inline}</>} />
}
