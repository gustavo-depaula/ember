import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable, InlineRetry, Typography } from '@/components'
import { ToneFill } from '@/features/covers/parts'
import { blockInk, blockLabelInk } from '@/features/explore/bgColor'
import { CardRow } from '@/features/explore/CardRow'
import { localizeContent } from '@/lib/i18n'
import { type ChantBookSection, chantSummary } from './chants'
import { useChantBook, useChantWeek } from './hooks'
import { type ChantDay, gradualeId, sectionOfDay, toneOfSection } from './library'
import { chantPageHref } from './routes'

const todayWidth = 250
const dayWidth = 150
const height = 204

/**
 * The week's Masses, each a card in the day's jewel tone: today wide, with the
 * chants it opens with; the days after it narrow, each with its Introit. A
 * weekday that repeats its Sunday's Mass is left out — it has nothing new to sing.
 */
export function ChantWeek() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const days = useChantWeek()
  const graduale = useChantBook(gradualeId)

  if (days.isError || graduale.isError)
    return (
      <InlineRetry
        onRetry={() => {
          days.refetch()
          graduale.refetch()
        }}
      />
    )
  if (!days.data || !graduale.data) return <YStack height={height} />

  const book = graduale.data
  const pages = days.data
    .map((day) => ({ day, section: sectionOfDay(book, day) }))
    .filter((page): page is { day: ChantDay; section: ChantBookSection } => !!page.section)
    .filter((page, i, all) => i === 0 || page.section.id !== all[i - 1].section.id)

  const dayLabel = (date: Date) =>
    `${date.toLocaleDateString(i18n.language, { weekday: 'short' }).replace('.', '')} ${date.getDate()}`

  return (
    <CardRow>
      {pages.map(({ day, section }, i) => {
        const today = i === 0
        const width = today ? todayWidth : dayWidth
        const title = localizeContent(section.title)
        const label = today ? `${t('chant.today')} · ${dayLabel(day.date)}` : dayLabel(day.date)
        return (
          <AnimatedPressable
            key={section.id}
            onPress={() => router.push(chantPageHref(gradualeId, section.id))}
            accessibilityRole="link"
            accessibilityLabel={`${label}, ${title}`}
          >
            <YStack width={width} height={height} borderRadius={16} style={styles.shadow}>
              <ToneFill
                id={`week-${section.id}`}
                tone={toneOfSection(section)}
                width={width}
                height={height}
                radius={16}
              />
              <YStack flex={1} padding={14} gap={6}>
                <Text fontFamily="$heading" fontSize={11} letterSpacing={1.4} color={blockLabelInk}>
                  {label.toUpperCase()}
                </Text>
                <Typography
                  fontFamily="$title"
                  fontSize={today ? '$3' : '$2'}
                  color={blockInk}
                  numberOfLines={today ? 2 : 3}
                >
                  {title}
                </Typography>
                <YStack flex={1} />
                {today ? (
                  section.chants.slice(0, 3).map((chant) => {
                    const { name, genre } = chantSummary(chant)
                    return (
                      <Text
                        key={chant}
                        numberOfLines={1}
                        fontFamily="$body"
                        fontSize={14}
                        color={blockInk}
                      >
                        {genre && (
                          <Text
                            fontFamily="$heading"
                            fontSize={10}
                            letterSpacing={1}
                            color={blockLabelInk}
                          >
                            {`${t(`chant.genreShort.${genre}`).toUpperCase()}  `}
                          </Text>
                        )}
                        {name}
                      </Text>
                    )
                  })
                ) : (
                  <Text
                    numberOfLines={1}
                    fontFamily="$body"
                    fontStyle="italic"
                    fontSize={14}
                    color={blockInk}
                    opacity={0.88}
                  >
                    {section.chants[0] ? chantSummary(section.chants[0]).name : ''}
                  </Text>
                )}
              </YStack>
            </YStack>
          </AnimatedPressable>
        )
      })}
    </CardRow>
  )
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
})
