// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  DropCap,
  OrnamentalRule,
  PageBreakOrnament,
  PrayerText,
  RubricLabel,
} from '@/components'
import type { MassOption, MassSection as MassSectionType } from '../content'

export function MassSectionBlock({ section }: { section: MassSectionType }) {
  switch (section.type) {
    case 'heading':
      return (
        <YStack gap="$sm" paddingTop="$md">
          <PageBreakOrnament />
          <Text
            fontFamily="$display"
            fontSize={24}
            lineHeight={30}
            color="$colorBurgundy"
            textAlign="center"
          >
            {section.text}
          </Text>
        </YStack>
      )

    case 'subheading':
      return (
        <Text
          fontFamily="$heading"
          fontSize="$3"
          color="$colorBurgundy"
          letterSpacing={0.5}
          paddingTop="$sm"
        >
          {section.text}
        </Text>
      )

    case 'rubric':
      return <RubricLabel>{section.text}</RubricLabel>

    case 'prayer':
      return (
        <PrayerBlock speaker={section.speaker} latin={section.latin} english={section.english} />
      )

    case 'proper':
      return <ProperSlot description={section.description} />

    case 'options':
      return <OptionsBlock id={section.id} label={section.label} options={section.options} />

    case 'divider':
      return <OrnamentalRule />

    default:
      return undefined
  }
}

function PrayerBlock({
  speaker,
  latin,
  english,
}: {
  speaker: 'priest' | 'people' | 'all'
  latin: string
  english: string
}) {
  const englishLines = english.split('\n')
  const latinLines = latin.split('\n')
  const isPeople = speaker === 'people'

  return (
    <YStack gap="$xs" paddingLeft={isPeople ? '$md' : 0}>
      {isPeople && (
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color="$accent"
          letterSpacing={1.5}
          textTransform="uppercase"
        >
          R.
        </Text>
      )}
      {englishLines.length > 0 && englishLines[0].length > 80 && !isPeople ? (
        <>
          <DropCap text={englishLines[0]} />
          {englishLines.slice(1).map((line, i) => (
            <PrayerText
              key={`en-${i}-${line.slice(0, 20)}`}
              fontWeight={isPeople ? '600' : undefined}
            >
              {line}
            </PrayerText>
          ))}
        </>
      ) : (
        englishLines.map((line, i) => (
          <PrayerText
            key={`en-${i}-${line.slice(0, 20)}`}
            fontWeight={isPeople ? '600' : undefined}
          >
            {line}
          </PrayerText>
        ))
      )}
      <YStack gap="$xs" opacity={0.6} paddingTop="$xs">
        {latinLines.map((line, i) => (
          <Text
            key={`la-${i}-${line.slice(0, 20)}`}
            fontFamily="$body"
            fontSize="$2"
            fontStyle="italic"
            color="$colorSecondary"
          >
            {line}
          </Text>
        ))}
      </YStack>
    </YStack>
  )
}

function ProperSlot({ description }: { description: string }) {
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

function OptionsBlock({ label, options }: { id: string; label: string; options: MassOption[] }) {
  const [selected, setSelected] = useState(0)
  const current = options[selected]

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={0.5}>
        {label}
      </Text>

      <XStack gap="$xs" flexWrap="wrap">
        {options.map((opt, i) => (
          <AnimatedPressable key={opt.id} onPress={() => setSelected(i)}>
            <YStack
              paddingHorizontal="$sm"
              paddingVertical="$xs"
              borderRadius="$sm"
              borderWidth={1}
              borderColor={i === selected ? '$accent' : '$borderColor'}
              backgroundColor={i === selected ? '$accent' : 'transparent'}
            >
              <Text
                fontFamily="$heading"
                fontSize="$1"
                color={i === selected ? '$background' : '$colorSecondary'}
              >
                {opt.label}
              </Text>
            </YStack>
          </AnimatedPressable>
        ))}
      </XStack>

      {current && (
        <YStack gap="$sm">
          {current.sections.map((s, i) => (
            <MassSectionBlock key={`${current.id}-${i}`} section={s} />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
