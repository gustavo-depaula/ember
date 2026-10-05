import type { Href } from 'expo-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { getEntry } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { PracticeCard } from '@/features/covers'
import { coverFonts, coverInk } from '@/features/covers/parts'
import { jewelTones, toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

// ScreenLayout caps content at 640 and pads $lg (24) each side.
const maxContentWidth = 640
const pagePadding = 24
const gutter = 16
const noticeHeight = 132

/**
 * The lobby's fixed places: Mass times as the notice a parish posts on its
 * door, and beneath it the three things opened most — the Mass, the Bible and
 * the Rosary — as holy cards.
 */
export function Places() {
  const { t } = useTranslation()
  // The Rosary's name comes from the catalog, which warms in after launch.
  useCatalogVersion()
  const { width } = useWindowDimensions()
  const content = Math.min(width, maxContentWidth) - pagePadding * 2
  const cardSize = Math.floor((content - gutter * 2) / 3)

  const cards = [
    {
      key: 'mass',
      title: t('home.holyMass'),
      icon: 'mass',
      tone: toneForKey('mass'),
      href: { pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } },
    },
    {
      key: 'bible',
      title: t('home.bible'),
      icon: 'book',
      tone: jewelTones.marian,
      href: '/bible',
    },
    {
      key: 'rosary',
      title: localizeContent(getEntry('practice/rosary')?.name ?? {}),
      icon: 'rosary',
      tone: jewelTones.red,
      href: { pathname: '/pray/[practiceId]', params: { practiceId: 'rosary' } },
    },
  ] satisfies Array<{ href: Href; [key: string]: unknown }>

  return (
    <YStack gap="$lg">
      <Place href="/mass-times" label={t('massTimes.cardTitle').replace('\n', ' ')}>
        <MassTimesNotice
          title={t('massTimes.cardTitle')}
          subtitle={t('massTimes.exploreTagline')}
          width={content}
        />
      </Place>
      <XStack gap={gutter}>
        {cards.map(({ key, href, title, icon, tone }) => (
          <Place key={key} href={href} label={title}>
            <PracticeCard title={title} tone={tone} icon={icon} size={cardSize} />
          </Place>
        ))}
      </XStack>
    </YStack>
  )
}

function Place({ href, label, children }: { href: Href; label: string; children: ReactNode }) {
  return (
    <ZoomLink href={href}>
      <AnimatedPressable accessibilityRole="link" accessibilityLabel={label}>
        {children}
      </AnimatedPressable>
    </ZoomLink>
  )
}

// A church front on a 48 grid: spire and cross, nave with a rose window and a
// pointed door, two aisles, the ground line.
const churchPaths = [
  'M24 1.5v5M22 3.5h4',
  'M17 44V20l7-13.5L31 20v24',
  'M17 28l-8 4v12M31 28l8 4v12',
  'M21 44v-7q0-4 3-6q3 2 3 6v7',
  'M24 20a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
  'M13 44v-6M35 44v-6',
  'M5 44h38',
]

/** Cream stock under a double rubric rule, the church a faint watermark behind the title. */
function MassTimesNotice({
  title,
  subtitle,
  width,
}: {
  title: string
  subtitle: string
  width: number
}) {
  const height = noticeHeight
  return (
    // Like a generated cover, the notice is a picture: fixed inks in both
    // themes, and type that doesn't follow Dynamic Type.
    <View style={[styles.notice, { width, height }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="stock" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={coverInk.vellum} />
            <Stop offset="1" stopColor={coverInk.paperDeep} />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} rx={3} fill="url(#stock)" />
        <Rect
          x={7}
          y={7}
          width={width - 14}
          height={height - 14}
          fill="none"
          stroke={coverInk.rubric}
          strokeOpacity={0.55}
          strokeWidth={1}
        />
        <Rect
          x={10}
          y={10}
          width={width - 20}
          height={height - 20}
          fill="none"
          stroke={coverInk.rubric}
          strokeOpacity={0.25}
          strokeWidth={0.5}
        />
      </Svg>
      <View style={styles.watermark}>
        <Svg width={84} height={84} viewBox="0 0 48 48">
          {churchPaths.map((d) => (
            <Path
              key={d}
              d={d}
              fill="none"
              stroke={coverInk.rubric}
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>
      <View style={styles.text}>
        <Text allowFontScaling={false} style={styles.title}>
          {title}
        </Text>
        <Text allowFontScaling={false} style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  notice: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 9,
  },
  watermark: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    opacity: 0.3,
  },
  text: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    gap: 5,
  },
  title: {
    fontFamily: coverFonts.title,
    fontSize: 25,
    lineHeight: 29,
    textAlign: 'right',
    color: coverInk.text,
  },
  subtitle: {
    fontFamily: coverFonts.italic,
    fontSize: 15,
    textAlign: 'right',
    color: coverInk.rubric,
  },
})
