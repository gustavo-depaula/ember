import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'
import { Typography } from '@/components/typography'
import type { SaintEntry } from '../data/catalog'
import { useSaintCollect } from '../useSaintCollect'

// The saint's identity — name, feast, patronage. Lives in the sheet's draggable
// (non-scrolling) header so swiping the peek raises the sheet rather than
// scrolling it. The portrait isn't repeated — the holy card above is the hero.
export function SaintEncounterHeader({ saint }: { saint: SaintEntry }) {
  return (
    <YStack alignItems="center" gap="$xs" paddingHorizontal={28} paddingBottom="$md">
      <Typography variant="sacred-title" fontSize={30} lineHeight={36} textAlign="center">
        {saint.name}
      </Typography>
      {saint.feastLabel && (
        <Typography variant="reference" textTransform="uppercase" textAlign="center">
          {saint.feastLabel}
        </Typography>
      )}
      {saint.patronOf && (
        <Typography variant="whisper" textAlign="center">
          {saint.patronOf}
        </Typography>
      )}
    </YStack>
  )
}

// The scrollable body — Life (from Pictorial Lives) and the Collect (from the
// Missal). Each renders only when present, so short saints leave no hollow
// headings. (Related is a designed-but-empty seam for now.)
export function SaintEncounter({ saint }: { saint: SaintEntry }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const collect = useSaintCollect(saint.feast)

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{
        paddingHorizontal: 28,
        paddingTop: 4,
        paddingBottom: insets.bottom + 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {saint.reflection && (
        <YStack gap="$sm">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('saints.encounter.reflection')}
          </Typography>
          <Typography variant="interface" fontSize="$4" lineHeight={28}>
            {saint.reflection}
          </Typography>
        </YStack>
      )}

      {collect && (
        <YStack gap="$sm" paddingTop="$xl">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('saints.encounter.collect')}
          </Typography>
          {collect.lines.map((line) => (
            <Typography key={line} variant="rubric" fontSize="$4" lineHeight={28}>
              {line}
            </Typography>
          ))}
        </YStack>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
