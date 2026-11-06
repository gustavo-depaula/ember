import { ChevronDown } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { translationsFor } from '@/lib/bibleTranslations'
import type { HebrewMarks } from '@/lib/typography/hebrew'
import { type StudyLayout, useBibleStore } from '@/stores/bibleStore'

import { TabLine } from './TabLine'

/** A line the interlinear can add under each word, on or off. */
function Toggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: on }}
    >
      <XStack alignItems="center" gap={6} minHeight={32}>
        <View
          width={7}
          height={7}
          borderRadius={4}
          backgroundColor={on ? '$colorBurgundy' : 'transparent'}
          borderWidth={1}
          borderColor={on ? '$colorBurgundy' : '$colorSecondary'}
        />
        <Typography fontSize="$2" color={on ? '$color' : '$colorSecondary'}>
          {label}
        </Typography>
      </XStack>
    </Pressable>
  )
}

/**
 * The Hebrew pointing, in three stops on one line: the consonants alone, with
 * their vowels, with the cantillation. One control rather than two switches,
 * because each stop includes the one before it.
 */
function MarksControl({
  marks,
  onChoose,
}: {
  marks: HebrewMarks
  onChoose: (marks: HebrewMarks) => void
}) {
  const { t } = useTranslation()
  const levels: HebrewMarks[] = ['letters', 'vowels', 'chant']
  return (
    <XStack accessibilityRole="radiogroup" alignItems="flex-start">
      {levels.map((level, i) => {
        const on = level === marks
        return (
          <Pressable
            key={level}
            onPress={() => onChoose(level)}
            hitSlop={8}
            accessibilityRole="radio"
            accessibilityLabel={t('a11y.hebrewMarks', { level: t(`bible.layout.${level}`) })}
            accessibilityState={{ selected: on }}
          >
            <YStack alignItems="center" gap={4} minWidth={72} minHeight={44}>
              <XStack alignItems="center" height={12} width="100%">
                {/* The rule runs between the stops, not past the ends. */}
                <View
                  flex={1}
                  height={StyleSheet.hairlineWidth}
                  backgroundColor={i ? '$colorSecondary' : 'transparent'}
                />
                <View
                  width={9}
                  height={9}
                  borderRadius={5}
                  borderWidth={1}
                  borderColor={on ? '$colorBurgundy' : '$colorSecondary'}
                  backgroundColor={on ? '$colorBurgundy' : '$background'}
                />
                <View
                  flex={1}
                  height={StyleSheet.hairlineWidth}
                  backgroundColor={i < levels.length - 1 ? '$colorSecondary' : 'transparent'}
                />
              </XStack>
              <Typography fontSize="$2" color={on ? '$color' : '$colorSecondary'}>
                {t(`bible.layout.${level}`)}
              </Typography>
            </YStack>
          </Pressable>
        )
      })}
    </XStack>
  )
}

/**
 * How a page in Greek or Hebrew is laid out: as text, as an interlinear, or
 * beside another edition; and under it, what the chosen layout adds. A Hebrew
 * page also sets how much of its pointing shows. `study` is false while a page
 * has no word data, and then only the pointing can be chosen.
 */
export function StudyLayoutBar({ hebrew, study }: { hebrew: boolean; study: boolean }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const stored = useBibleStore((s) => s.studyLayout)
  const setStored = useBibleStore((s) => s.setStudyLayout)
  // The bar answers from its own copy, at once; the page, which may take a
  // good part of a second to set a thousand words again, follows once the
  // bar's frame has painted. A store update renders synchronously, so
  // without the copy the switch would wait on the page.
  const [layout, setLayout] = useState(stored)
  useEffect(() => setLayout(stored), [stored])
  function choose(change: Partial<StudyLayout>) {
    setLayout((shown) => ({ ...shown, ...change }))
    requestAnimationFrame(() => setTimeout(() => setStored(change), 0))
  }
  const [choosing, setChoosing] = useState(false)
  // Beside the Greek, any edition that is not itself Greek.
  const editions = translationsFor(i18n.language).filter((tr) => tr.language !== 'GRC')
  const parallel = editions.find((tr) => tr.code === layout.parallel) ?? editions[0]
  const modes: StudyLayout['mode'][] = ['text', 'interlinear', 'parallel']

  return (
    <YStack paddingHorizontal="$lg" gap={2}>
      {study ? (
        <TabLine
          tabs={modes.map((mode) => ({
            id: mode,
            label: t(`bible.layout.${mode}`),
            a11yLabel: t('a11y.readingLayout', { layout: t(`bible.layout.${mode}`) }),
          }))}
          selected={layout.mode}
          onSelect={(mode) => choose({ mode })}
          bleed
        />
      ) : undefined}

      {hebrew ? (
        <MarksControl marks={layout.marks} onChoose={(marks) => choose({ marks })} />
      ) : undefined}

      {study && layout.mode === 'interlinear' ? (
        <XStack gap="$lg">
          <Toggle
            label={t('bible.layout.lemma')}
            on={layout.lemma}
            onPress={() => choose({ lemma: !layout.lemma })}
          />
          <Toggle
            label={t('bible.layout.parsing')}
            on={layout.parsing}
            onPress={() => choose({ parsing: !layout.parsing })}
          />
        </XStack>
      ) : undefined}

      {study && layout.mode === 'parallel' ? (
        <YStack>
          <Pressable
            onPress={() => setChoosing(!choosing)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.parallelEdition')}
            accessibilityState={{ expanded: choosing }}
          >
            <XStack alignItems="center" gap={6} minHeight={32}>
              <Typography variant="label" fontSize="$1" letterSpacing={1.5} tone="muted">
                {t('bible.layout.with').toUpperCase()}
              </Typography>
              <Typography fontSize="$2">{parallel?.name}</Typography>
              <ChevronDown size={14} color={theme.colorSecondary.val} />
            </XStack>
          </Pressable>
          {choosing ? (
            <YStack paddingVertical="$xs" accessibilityRole="radiogroup">
              {editions.map((tr) => {
                const selected = tr.code === parallel?.code
                return (
                  <Pressable
                    key={tr.code}
                    onPress={() => {
                      choose({ parallel: tr.code })
                      setChoosing(false)
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={tr.name}
                    accessibilityState={{ selected }}
                  >
                    <Typography
                      fontSize="$3"
                      lineHeight={36}
                      color={selected ? '$colorBurgundy' : '$color'}
                    >
                      {tr.name}
                    </Typography>
                  </Pressable>
                )
              })}
            </YStack>
          ) : undefined}
          <TabLine
            tabs={[
              { id: 'rows', label: t('bible.layout.rows') },
              { id: 'columns', label: t('bible.layout.columns') },
            ]}
            selected={layout.columns ? 'columns' : 'rows'}
            onSelect={(id) => choose({ columns: id === 'columns' })}
            bleed
          />
        </YStack>
      ) : undefined}
    </YStack>
  )
}
