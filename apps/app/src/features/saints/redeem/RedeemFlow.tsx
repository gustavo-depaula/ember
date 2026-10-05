import { drawCard, type Grant } from '@ember/holy-cards'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  SlideInDown,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'

import { useEventStore } from '@/db/events'
import { lightTap, mediumTap, successBuzz } from '@/lib/haptics'
import { heroCard, SaintCardViewer } from '../components'
import { useSaintsCatalog } from '../data/catalog'
import { useRedeemHolyCard } from '../usePendingHolyCards'
import { useSaintCollect } from '../useSaintCollect'
import { ChooseCard, envelopeRise } from './ChooseCard'
import { Envelope, envelopeCard } from './Envelope'
import { EnvelopeTurn } from './EnvelopeTurn'
import { envelopeDate, howWon, wonFrom } from './envelopeText'

const openDuration = 3200

/**
 * Redeeming one envelope. Tapped, it turns over to the prayer written on its
 * back — the collect of the saint's Mass — and the wax seal there is the
 * Amen: the envelope turns back, its seal breaks, and the card rises out onto
 * the very spot its page shows it, as the page takes over around it.
 */
export function RedeemFlow({
  grant,
  onDone,
  onOpened,
}: {
  grant: Grant
  onDone: () => void
  /** The page has taken over: the card's own screen can replace this one. */
  onOpened: (card: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const { byId } = useSaintsCatalog()
  const [card, setCard] = useState<string | undefined>(() => {
    if (grant.drawn) return drawCard(grant, [...useEventStore.getState().holyCards.values()])
    return grant.choice.length === 1 ? grant.choice[0] : undefined
  })
  const [phase, setPhase] = useState<'reading' | 'opening' | 'card'>('reading')
  const redeem = useRedeemHolyCard()
  const open = useSharedValue(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const saint = card ? byId[card] : undefined
  const collect = useSaintCollect(saint?.proper)
  const lines = collect?.lines ?? (saint?.prayerExcerpt ? [saint.prayerExcerpt] : [])

  const startOpening = () => {
    void successBuzz()
    setPhase('opening')
    open.value = withTiming(1, { duration: openDuration, easing: Easing.inOut(Easing.cubic) })
    timers.current = [
      setTimeout(() => void mediumTap(), openDuration * 0.12),
      setTimeout(() => void lightTap(), openDuration * 0.5),
      setTimeout(() => setPhase('card'), openDuration + 150),
    ]
  }

  const bg = theme.background?.val
  const envelope = {
    width: Math.min(width * 0.74, 300),
    name: saint?.name ?? t('saints.redeem.unnamed'),
    date: envelopeDate(grant),
    note: wonFrom(grant.door, t),
  }
  // The envelope opens where its card, once risen, is centred on the card of
  // the saint's page: it only grows in place from there, and the page takes over.
  const inner = envelopeCard(envelope.width)
  const hero = heroCard(width, height, insets)
  const riseTop = hero.top + hero.height / 2 - inner.height / 2 - inner.top + inner.rise
  const choosing = !grant.drawn && grant.choice.length > 1
  const [chooser, setChooser] = useState<'open' | 'done'>(choosing ? 'open' : 'done')
  const options = grant.choice.flatMap((id) => (byId[id] ? [byId[id]] : []))

  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      {/* Under the envelope, which the chosen card sinks behind. */}
      {phase === 'reading' && chooser === 'open' && (
        <ChooseCard
          options={options}
          title={t(grant.door === 'starter' ? 'saints.redeem.chooseStarter' : 'saints.redeem.pick')}
          note={howWon({ door: grant.door, date: grant.date }, t)}
          envelopeWidth={envelope.width}
          onChoose={(id) => setCard(id)}
          onChosen={() => setChooser('done')}
        />
      )}

      {/* Turned in 3D, this envelope is depth-sorted by iOS over the flat
          opening one: it gives way the instant the opening starts, standing
          exactly where that one does. */}
      {phase === 'reading' && (saint || !choosing) && (
        <Animated.View
          key={saint?.id}
          entering={
            chooser === 'open'
              ? SlideInDown.delay(envelopeRise - 650)
                  .duration(650)
                  .easing(Easing.out(Easing.cubic))
              : undefined
          }
          style={styles.fill}
        >
          <EnvelopeTurn
            envelope={envelope}
            name={envelope.name}
            lines={lines}
            canTurn={!!saint}
            riseTop={riseTop}
            onAmen={() => redeem.mutateAsync({ grant, card })}
            onTurnedBack={startOpening}
            error={redeem.error?.message}
          />
        </Animated.View>
      )}

      {phase !== 'reading' && saint?.cardImage && (
        <View style={[styles.layer, { backgroundColor: bg, paddingTop: riseTop }]}>
          <Envelope
            {...envelope}
            image={saint.cardImage}
            open={open}
            exit={{ dy: 0, scale: hero.width / inner.width }}
          />
        </View>
      )}

      {phase === 'card' && saint && (
        <Animated.View
          entering={FadeIn.duration(400).withCallback((done) => {
            if (done) runOnJS(onOpened)(saint.id)
          })}
          style={StyleSheet.absoluteFill}
        >
          <SaintCardViewer initialId={saint.id} onClose={onDone} />
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center' },
})
