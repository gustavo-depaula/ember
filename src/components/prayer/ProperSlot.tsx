// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { Text, YStack } from 'tamagui'

import { useTodayCelebration } from '@/features/calendar/hooks'
import { useToday } from '@/hooks/useToday'
import { getProperForSlot } from '@/lib/mass-propers'
import { PrayerText } from '../PrayerText'

const markerPattern =
  /(\bv\.|(?<!\w)V\.|(?<!\w)R\.|(?<!\w)r\.|\+\+|\+|(?<!\w)C\.|(?<!\w)S\.|(?<!\w)J\.)/

type Segment = {
  type: 'text' | 'versicle' | 'response' | 'cross' | 'christ' | 'narrator' | 'crowd'
  value: string
}

function parseSegments(line: string): Segment[] {
  const parts = line.split(markerPattern)
  const segments: Segment[] = []

  for (const part of parts) {
    if (!part) continue
    switch (part) {
      case 'v.':
      case 'V.':
        segments.push({ type: 'versicle', value: '℣.' })
        break
      case 'R.':
      case 'r.':
        segments.push({ type: 'response', value: '℟.' })
        break
      case '++':
        segments.push({ type: 'cross', value: '✠' })
        break
      case '+':
        segments.push({ type: 'cross', value: '†' })
        break
      case 'C.':
        segments.push({ type: 'christ', value: 'C.' })
        break
      case 'S.':
        segments.push({ type: 'narrator', value: 'S.' })
        break
      case 'J.':
        segments.push({ type: 'crowd', value: 'J.' })
        break
      default:
        segments.push({ type: 'text', value: part })
    }
  }

  return segments
}

function FormattedLine({ line, isLatin }: { line: string; isLatin?: boolean }) {
  const segments = parseSegments(line)
  const hasMarkers = segments.some((s) => s.type !== 'text')

  if (!hasMarkers) {
    return isLatin ? (
      <Text fontFamily="$body" fontSize="$2" fontStyle="italic" color="$colorSecondary">
        {line}
      </Text>
    ) : (
      <PrayerText>{line}</PrayerText>
    )
  }

  const Wrapper = isLatin ? Text : PrayerText

  return (
    <Wrapper
      {...(isLatin
        ? { fontFamily: '$body', fontSize: '$2', fontStyle: 'italic', color: '$colorSecondary' }
        : {})}
    >
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'versicle':
          case 'response':
          case 'cross':
            return (
              <Text key={i} color="$accent" fontWeight="bold">
                {seg.value}
              </Text>
            )
          case 'christ':
            return (
              <Text key={i} color="$accent" fontWeight="bold">
                {seg.value}
              </Text>
            )
          case 'crowd':
            return (
              <Text key={i} fontStyle="italic">
                {seg.value}
              </Text>
            )
          default:
            return <Text key={i}>{seg.value}</Text>
        }
      })}
    </Wrapper>
  )
}

export function ProperSlot({ slot, description }: { slot: string; description: string }) {
  const today = useToday()
  const dayCalendar = useTodayCelebration()
  const proper = getProperForSlot(today, slot, dayCalendar)

  if (!proper) {
    return (
      <YStack
        backgroundColor="$backgroundSurface"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        borderStyle="dashed"
        padding="$md"
        alignItems="center"
      >
        <Text fontFamily="$body" fontSize="$2" fontStyle="italic" color="$colorSecondary">
          {description}
        </Text>
      </YStack>
    )
  }

  const lines = proper.text.split('\n')
  const latinLines = proper.latin?.split('\n') ?? []

  return (
    <YStack gap="$sm">
      {proper.citation && (
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color="$accent"
          letterSpacing={1}
          textTransform="uppercase"
        >
          {proper.citation}
        </Text>
      )}
      <YStack gap="$xs">
        {lines.map((line, i) => (
          <FormattedLine key={`t-${i}`} line={line} />
        ))}
      </YStack>
      {latinLines.length > 0 && (
        <YStack gap="$xs" opacity={0.6} paddingTop="$xs">
          {latinLines.map((line, i) => (
            <FormattedLine key={`l-${i}`} line={line} isLatin />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
