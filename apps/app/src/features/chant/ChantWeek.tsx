import { type LiturgicalColor, liturgicalColorOf } from '@ember/divinum-officium'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable, InlineRetry, Typography } from '@/components'
import { CardRow } from '@/features/explore/CardRow'
import { localizeContent } from '@/lib/i18n'
import { type ChantBookSection, chantSummary } from './chants'
import { useChant, useChantBook, useChantWeek } from './hooks'
import { leafPalette } from './leaf'
import { type ChantDay, gradualeId, sectionOfDay } from './library'
import { chantPageHref } from './routes'
import { ScoreView } from './ScoreView'

const todayWidth = 264
const dayWidth = 160
const height = 252
const padding = 14

/**
 * The week's Masses, each a leaf of the Graduale: the day in red, the Mass's
 * name, the opening line of its Introit, and a ribbon in the day's colour
 * marking the page. Today's leaf is wide, with the chants it opens with. A
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
    // The row's own padding holds the leaves' shadow and ribbon, which a
    // scroller cuts at its edge; the negative margins give that room back.
    <YStack marginTop={-shadowRoom.top} marginBottom={-shadowRoom.bottom}>
      <CardRow>
        {pages.map(({ day, section }, i) => {
          const today = i === 0
          const width = today ? todayWidth : dayWidth
          const title = localizeContent(section.title)
          const label = today ? `${t('chant.today')} · ${dayLabel(day.date)}` : dayLabel(day.date)
          return (
            <AnimatedPressable
              key={section.id}
              style={{ paddingTop: shadowRoom.top, paddingBottom: shadowRoom.bottom }}
              onPress={() => router.push(chantPageHref(gradualeId, section.id))}
              accessibilityRole="link"
              accessibilityLabel={`${label}, ${title}`}
            >
              <YStack
                width={width}
                height={height}
                borderRadius={radius}
                // Under the paper, for Android, which draws a shadow only beneath a background.
                backgroundColor="#E9DDC2"
                padding={padding}
                gap={6}
                style={styles.shadow}
              >
                <Paper id={`leaf-${section.id}`} width={width} />
                <Ribbon color={liturgicalColorOf(title)} />
                <Text
                  fontFamily="$heading"
                  fontSize={11}
                  letterSpacing={1.4}
                  color={leafPalette.rubric}
                  paddingRight={24}
                >
                  {label.toUpperCase()}
                </Text>
                <Typography
                  fontFamily="$title"
                  fontSize={today ? '$3' : '$1'}
                  color={leafPalette.ink}
                  numberOfLines={today ? 2 : 3}
                >
                  {title}
                </Typography>
                <YStack flex={1} />
                {section.chants[0] && (
                  <Incipit id={section.chants[0]} width={width - padding * 2} label={title} />
                )}
                {(today ? section.chants.slice(0, 3) : section.chants.slice(0, 1)).map((chant) => {
                  const { name, genre } = chantSummary(chant)
                  return (
                    <Text
                      key={chant}
                      numberOfLines={1}
                      fontFamily="$body"
                      fontSize={14}
                      color={leafPalette.ink}
                    >
                      {today && genre && (
                        <Text
                          fontFamily="$heading"
                          fontSize={10}
                          letterSpacing={1}
                          color={leafPalette.rubric}
                        >
                          {`${t(`chant.genreShort.${genre}`).toUpperCase()}  `}
                        </Text>
                      )}
                      {name}
                    </Text>
                  )
                })}
              </YStack>
            </AnimatedPressable>
          )
        })}
      </CardRow>
    </YStack>
  )
}

const radius = 6
const shadowRoom = { top: 4, bottom: 18 }

// Cream paper, lightest where the light falls on it and warmer toward its edges.
function Paper({ id, width }: { id: string; width: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={id} cx="30%" cy="20%" rx="120%" ry="90%">
          <Stop offset="0" stopColor="#F6EEDC" />
          <Stop offset="0.7" stopColor="#E9DDC2" />
          <Stop offset="1" stopColor="#DCCDAC" />
        </RadialGradient>
      </Defs>
      <Rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        rx={radius}
        fill={`url(#${id})`}
        stroke="rgba(120,90,50,0.18)"
        strokeWidth={1}
      />
    </Svg>
  )
}

// The opening line of the Mass's first chant, cut at the leaf's edge.
function Incipit({ id, width, label }: { id: string; width: number; label: string }) {
  const chant = useChant(id).data
  return (
    <View style={{ height: incipitHeight, overflow: 'hidden' }}>
      {chant && (
        <ScoreView
          score={chant.score}
          width={width}
          scale={0.5}
          label={label}
          lines={1}
          palette={leafPalette}
        />
      )}
    </View>
  )
}

const incipitHeight = 46

// What a ribbon of each colour is dyed; a white one is edged so it shows on the paper.
const ribbons: Record<LiturgicalColor, string> = {
  white: '#FAF6EC',
  red: '#A3232C',
  green: '#2F6B47',
  violet: '#5B2C83',
  rose: '#D98AA8',
  black: '#1E1B18',
}

function Ribbon({ color }: { color: LiturgicalColor }) {
  return (
    <View
      style={styles.ribbon}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={12} height={46} viewBox="0 0 12 46">
        <Polygon
          points="0,0 12,0 12,46 6,38 0,46"
          fill={ribbons[color]}
          stroke={color === 'white' ? '#C9BB98' : 'none'}
          strokeWidth={0.8}
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  ribbon: { position: 'absolute', top: -3, right: 16 },
})
