import { isSameDay, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { CardThumb } from '@/features/home/components/EventPanels'
import { cardFace } from '@/features/home/components/eventCard'
import { GlyphIcon, useHeldCards, useSaintsCatalog } from '@/features/saints'
import { useToday } from '@/hooks/useToday'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { type OfficeNow, useOfficesNow } from './useOfficesNow'

const numerals = ['I', 'II', 'III']
const hours = ['matins', 'lauds', 'prime', 'terce', 'sext', 'none', 'vespers', 'compline'] as const

/**
 * What the Divine Office is, the hours it keeps, and the offices to pray it
 * by, each a tap from its hour now. Opened from an Office holy card, it names
 * the card first: any of the offices wins it.
 */
export function DivineOfficePage({ card }: { card?: { saints: string[]; date: string } }) {
  const { t } = useTranslation()
  return (
    <YStack gap="$lg">
      <YStack gap="$xs">
        <Typography
          variant="label"
          textAlign="center"
          textTransform="uppercase"
          letterSpacing={1.5}
        >
          {t('office.page.kicker')}
        </Typography>
        <Typography variant="sacred-title" fontSize={32} lineHeight={38}>
          {t('office.title')}
        </Typography>
      </YStack>
      {card && card.saints.length > 0 && <CardNote {...card} />}
      <Chapter n={0} title={t('office.page.what')}>
        <Typography variant="interface" fontSize="$4" lineHeight={30} textAlign="justify">
          {t('office.page.whatBody')}
        </Typography>
      </Chapter>
      <Chapter n={1} title={t('office.page.hoursTitle')}>
        <YStack borderTopWidth={1} borderTopColor="$borderColor">
          {hours.map((hour) => (
            <XStack
              key={hour}
              justifyContent="space-between"
              alignItems="baseline"
              gap="$md"
              paddingVertical="$sm"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <Typography variant="interface" fontSize="$3">
                {t(`office.page.hours.${hour}.name`)}
              </Typography>
              <Typography variant="annotation" flexShrink={1} textAlign="right">
                {t(`office.page.hours.${hour}.gloss`)}
              </Typography>
            </XStack>
          ))}
        </YStack>
        <Typography variant="whisper" textAlign="center">
          {t('office.page.hoursNote')}
        </Typography>
      </Chapter>
      <Chapter n={2} title={t('office.page.officesTitle')}>
        <Offices />
      </Chapter>
    </YStack>
  )
}

/** Today's holy-card row, as Today keeps it: the saints the card may be, and how the Office wins it. */
function CardNote({ saints, date }: { saints: string[]; date: string }) {
  const { t } = useTranslation()
  const today = useToday()
  const { byId } = useSaintsCatalog()
  const held = useHeldCards()
  const named = saints.map((id) => byId[id]).filter(Boolean)
  const first = named[0]
  if (!first) return null
  const day = parseISO(date)
  const title = named.map((s) => s.name).reduce((a, b) => t('home.events.or', { a, b }))
  return (
    <YStack
      gap="$sm"
      paddingVertical="$md"
      borderTopWidth={1}
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <XStack justifyContent="space-between" alignItems="baseline" gap="$md">
        <Typography
          variant="label"
          fontSize={11}
          letterSpacing={2}
          textTransform="uppercase"
          color="$colorBurgundy"
        >
          {t(isSameDay(day, today) ? 'office.page.cardToday' : 'office.page.cardLabel')}
        </Typography>
        <Typography variant="annotation" fontStyle="italic">
          {formatLocalized(day, t('program.dayDateFormat'))}
        </Typography>
      </XStack>
      <XStack gap="$md" alignItems="center">
        <YStack flex={1} gap={2}>
          <Typography variant="sacred-title" textAlign="left" fontSize={18} lineHeight={22}>
            {title}
          </Typography>
          <Typography variant="annotation">{t('office.page.cardHow')}</Typography>
          <Typography variant="annotation" fontStyle="italic" paddingTop={4}>
            {t('saints.receive.officeWhy')}
          </Typography>
        </YStack>
        <CardThumb face={cardFace(first, held.has(first.id))} width={42} />
      </XStack>
    </YStack>
  )
}

function Offices() {
  const offices = useOfficesNow()
  return (
    <YStack borderTopWidth={1} borderTopColor="$borderColor">
      {offices.map((office, i) => (
        <OfficeRow key={office.id} office={office} first={i === 0} />
      ))}
    </YStack>
  )
}

function OfficeRow({ office, first }: { office: OfficeNow; first: boolean }) {
  const { t } = useTranslation()
  const router = useRouter()
  const pray = office.hour
    ? t('office.page.prayHour', { hour: office.hour })
    : t('office.page.pray')
  return (
    <AnimatedPressable
      onPress={() =>
        router.push({ pathname: '/pray/[practiceId]', params: { practiceId: office.variant } })
      }
      accessibilityRole="link"
      accessibilityLabel={t('a11y.prayOffice', { name: office.name })}
    >
      <XStack
        gap="$md"
        paddingVertical="$md"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <View width={28} paddingTop={2}>
          <GlyphIcon glyph="book" />
        </View>
        <YStack flex={1} gap={2}>
          <Typography variant="interface" fontSize="$3">
            {office.name}
          </Typography>
          <Typography variant="annotation" color="$colorBurgundy">
            {t(`office.page.offices.${office.id}.kind`)}
          </Typography>
          <Typography variant="annotation" fontStyle="italic" paddingTop={4}>
            {t(`office.page.offices.${office.id}.about`)}
          </Typography>
          <XStack paddingTop="$sm">
            <View
              borderWidth={1}
              borderColor={first ? '$colorBurgundy' : '$accent'}
              backgroundColor={first ? '$colorBurgundy' : 'transparent'}
              borderRadius={14}
              paddingHorizontal={10}
              paddingVertical={3}
            >
              <Typography
                variant="label"
                fontSize={10}
                letterSpacing={1.5}
                textTransform="uppercase"
                color={first ? '$background' : '$accentHover'}
              >
                {office.minutes ? `${pray} · ${office.minutes}` : pray}
              </Typography>
            </View>
          </XStack>
        </YStack>
      </XStack>
    </AnimatedPressable>
  )
}

/** A numbered chapter, as the saint page heads its own. */
function Chapter({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <YStack gap="$md" paddingTop="$md">
      <YStack alignItems="center" gap={2}>
        <Text fontFamily="$heading" fontSize={14} letterSpacing={3} color="$accent">
          {numerals[n]}
        </Text>
        {/* Stretched: shrink-wrapped and centered, Android measures the title
            short and drops its last word to a line that never shows. */}
        <Typography variant="sacred-title" fontSize={22} lineHeight={28} alignSelf="stretch">
          {title}
        </Typography>
      </YStack>
      {children}
    </YStack>
  )
}
