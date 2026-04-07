// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder

import type { BilingualText } from '@ember/content-engine'
import { Text, YStack } from 'tamagui'
import { useProperForSlot } from '@/lib/mass-propers'
import { PrayerText } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

const markerPattern =
  /(\bv\.|(?<!\w)V\.|(?<!\w)R\.|(?<!\w)r\.|\+\+|\+|(?<!\w)C\.|(?<!\w)S\.|(?<!\w)J\.)/

type Segment = {
  type: 'text' | 'versicle' | 'response' | 'cross' | 'christ' | 'narrator' | 'crowd' | 'verse-num'
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

  return splitVerseNumbers(segments)
}

// Inline verse numbers like "14Pedro" or "22"Homens" → separate verse-num segments
const verseNumPattern = /(\d{1,3})(?=[A-ZÀ-Üa-zà-ü\u201C\u201D\u201E\u2018\u2019"'"'(])/g

function splitVerseNumbers(segments: Segment[]): Segment[] {
  const result: Segment[] = []
  for (const seg of segments) {
    if (seg.type !== 'text') {
      result.push(seg)
      continue
    }
    let lastIndex = 0
    for (const match of seg.value.matchAll(verseNumPattern)) {
      const before = seg.value.slice(lastIndex, match.index)
      if (before) result.push({ type: 'text', value: before })
      result.push({ type: 'verse-num', value: match[1] })
      lastIndex = match.index + match[1].length
    }
    const after = seg.value.slice(lastIndex)
    if (after) result.push({ type: 'text', value: after })
  }
  return result
}

function FormattedLine({ line }: { line: string }) {
  const segments = parseSegments(line)
  const hasMarkers = segments.some((s) => s.type !== 'text' && s.type !== 'verse-num')
  const hasVerseNums = segments.some((s) => s.type === 'verse-num')

  if (!hasMarkers && !hasVerseNums) {
    return <PrayerText>{line}</PrayerText>
  }

  return (
    <PrayerText>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'versicle':
          case 'response':
          case 'cross':
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
          case 'verse-num':
            return (
              <Text key={i} fontSize={10} color="$colorSecondary" opacity={0.7}>
                {`\u2009${seg.value}\u2009`}
              </Text>
            )
          default:
            return <Text key={i}>{seg.value}</Text>
        }
      })}
    </PrayerText>
  )
}

export function ProperSlot({
  slot,
  form,
  description,
}: {
  slot: string
  form: 'of' | 'ef'
  description: BilingualText
}) {
  const { data: proper, isLoading } = useProperForSlot(slot, form)

  if (isLoading) {
    return (
      <YStack
        backgroundColor="$backgroundSurface"
        borderRadius="$md"
        padding="$md"
        gap="$xs"
        opacity={0.5}
      >
        <YStack backgroundColor="$borderColor" borderRadius="$sm" height={14} width="40%" />
        <YStack backgroundColor="$borderColor" borderRadius="$sm" height={14} width="90%" />
        <YStack backgroundColor="$borderColor" borderRadius="$sm" height={14} width="75%" />
      </YStack>
    )
  }

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
          {description.primary}
        </Text>
      </YStack>
    )
  }

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
      <BilingualBlock
        content={proper.text}
        renderText={(t) => (
          <YStack gap="$xs">
            {t.split('\n').map((line, i) => (
              <FormattedLine key={`${i}`} line={line} />
            ))}
          </YStack>
        )}
      />
    </YStack>
  )
}
