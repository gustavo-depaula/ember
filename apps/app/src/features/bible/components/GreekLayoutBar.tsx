import { ChevronDown } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { translationsFor } from '@/lib/bibleTranslations'
import { type GreekLayout, useBibleStore } from '@/stores/bibleStore'

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
 * How a Greek page is laid out: as text, as an interlinear, or beside another
 * edition; and under it, what the chosen layout adds.
 */
export function GreekLayoutBar() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const stored = useBibleStore((s) => s.greekLayout)
  const setStored = useBibleStore((s) => s.setGreekLayout)
  // The bar answers from its own copy, at once; the page, which may take a
  // good part of a second to set a thousand words again, follows once the
  // bar's frame has painted. A store update renders synchronously, so
  // without the copy the switch would wait on the page.
  const [layout, setLayout] = useState(stored)
  useEffect(() => setLayout(stored), [stored])
  function choose(change: Partial<GreekLayout>) {
    setLayout((shown) => ({ ...shown, ...change }))
    requestAnimationFrame(() => setTimeout(() => setStored(change), 0))
  }
  const [choosing, setChoosing] = useState(false)
  // Beside the Greek, any edition that is not itself Greek.
  const editions = translationsFor(i18n.language).filter((tr) => tr.language !== 'GRC')
  const parallel = editions.find((tr) => tr.code === layout.parallel) ?? editions[0]
  const modes: GreekLayout['mode'][] = ['text', 'interlinear', 'parallel']

  return (
    <YStack paddingHorizontal="$lg" gap={2}>
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

      {layout.mode === 'interlinear' ? (
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

      {layout.mode === 'parallel' ? (
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
