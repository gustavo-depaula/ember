import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text as RNText, StyleSheet, View } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  type ObligationBadge,
  ObligationModal,
  obligationBadges,
} from '@/components'
import { coverFonts, coverInk } from '@/features/covers/parts'
import { jewelTones } from '@/features/explore/bgColor'
import { lightTap } from '@/lib/haptics'
import { useObligations } from '@/lib/liturgical'
import { planCardSize } from './PlanOfLifeCard'

/** The day's fast and abstinence, or none on a day that binds to neither. */
function useBadges(date: Date) {
  const { t } = useTranslation()
  const obligations = useObligations(date)
  return obligations ? obligationBadges(t, obligations) : []
}

/** Opens the obligations' explanation, the same one the calendar's badges open. */
function Explained({ badges, children }: { badges: ObligationBadge[]; children: ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          setOpen(true)
        }}
        accessibilityRole="button"
        accessibilityLabel={badges.map((b) => b.label).join(', ')}
        accessibilityHint={t('obligations.tapToLearnMore')}
      >
        {children}
      </AnimatedPressable>
      <ObligationModal visible={open} badges={badges} onClose={() => setOpen(false)} />
    </>
  )
}

/** The day's fast or abstinence as a card in the row beside the plan of life. */
export function ObligationCard({ date }: { date: Date }) {
  const { t } = useTranslation()
  const badges = useBadges(date)
  if (badges.length === 0) return null

  const caption = badges.length > 1 ? t('obligations.fastAndAbstinence') : (badges[0]?.label ?? '')

  return (
    <Explained badges={badges}>
      <YStack width={planCardSize} gap="$sm">
        <View style={styles.card}>
          <View style={styles.frame}>
            <RNText allowFontScaling={false} style={styles.cross}>
              ✠
            </RNText>
            {badges.map((b) => (
              <View key={b.key} style={styles.entry}>
                <RNText
                  allowFontScaling={false}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[styles.label, badges.length > 1 && styles.labelSmall]}
                >
                  {b.label}
                </RNText>
                <RNText allowFontScaling={false} numberOfLines={2} style={styles.note}>
                  {b.note}
                </RNText>
              </View>
            ))}
          </View>
        </View>
        <Text fontFamily="$heading" fontSize="$2" color="$colorBurgundy" numberOfLines={2}>
          {caption}
        </Text>
      </YStack>
    </Explained>
  )
}

/** The day's fast or abstinence, under the plan of life sheet's title. */
export function ObligationNotice({ date }: { date: Date }) {
  const badges = useBadges(date)
  if (badges.length === 0) return null

  return (
    <Explained badges={badges}>
      <XStack
        alignItems="center"
        gap="$md"
        paddingVertical="$sm"
        paddingHorizontal="$md"
        borderRadius={10}
        borderWidth={1}
        borderColor="$colorBurgundy"
      >
        <Text fontFamily="$heading" fontSize="$4" color="$colorBurgundy">
          ✠
        </Text>
        <YStack flex={1} gap={2}>
          <Text
            fontFamily="$heading"
            fontSize="$1"
            color="$colorBurgundy"
            textTransform="uppercase"
            letterSpacing={2}
          >
            {badges.map((b) => b.label).join(' · ')}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$color">
            {badges.map((b) => b.note).join(' · ')}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$4" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </Explained>
  )
}

const styles = StyleSheet.create({
  card: {
    width: planCardSize,
    height: planCardSize,
    borderRadius: 8,
    padding: 6,
    backgroundColor: jewelTones.red.to,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 9,
  },
  frame: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(232, 201, 122, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  cross: { fontFamily: coverFonts.title, fontSize: 22, lineHeight: 31, color: '#E8796B' },
  entry: { alignItems: 'center', gap: 1 },
  label: {
    fontFamily: coverFonts.title,
    fontSize: 17,
    lineHeight: 20,
    color: coverInk.cream,
    textAlign: 'center',
  },
  labelSmall: { fontSize: 14, lineHeight: 17 },
  note: {
    fontFamily: coverFonts.italic,
    fontSize: 11,
    lineHeight: 13,
    color: '#D9B9A8',
    textAlign: 'center',
  },
})
