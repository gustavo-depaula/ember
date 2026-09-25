import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, G, LinearGradient, Rect, Stop } from 'react-native-svg'

import type { BlockTone } from '@/features/explore/bgColor'
import type { CollectionCoverStyle } from './coverFor'
import { CoverText, coverFonts, coverInk, LaceRect, mixHex, ToneGradient } from './parts'

/**
 * The square covers an art-less collection draws — the object that holds its
 * kind of gathering: a boxed set or slipcase for a shelf of volumes, a packet
 * of holy cards for devotions, a page of the Ordo for a rule of life. Drawn in
 * a 100×100 viewBox with the text laid over as native Text, like the books.
 * Sketches: docs/design/cover-sketches/collections.html.
 */
export function CollectionCover({
  style,
  title,
  tone,
  volumes,
  prayers,
  size,
}: {
  style: CollectionCoverStyle
  title: string
  tone: BlockTone
  volumes?: number
  prayers?: number
  size: number
}) {
  const { t } = useTranslation()
  const count = (() => {
    if (style !== 'packet' && style !== 'ordo' && volumes)
      return t('covers.volumes', { count: volumes })
    if (prayers) return t('covers.prayers', { count: prayers })
    if (volumes) return t('covers.volumes', { count: volumes })
    return undefined
  })()
  const Face = faces[style]
  return (
    <View style={[styles.shadow, { width: size, height: size }]}>
      <Face title={title} tone={tone} count={count?.toUpperCase()} s={size} />
    </View>
  )
}

type FaceProps = { title: string; tone: BlockTone; count?: string; s: number }

const sheenStops = [
  <Stop key="0" offset="0" stopColor="#fff" stopOpacity={0.07} />,
  <Stop key="1" offset="0.4" stopColor="#fff" stopOpacity={0} />,
  <Stop key="2" offset="1" stopColor="#000" stopOpacity={0.14} />,
]

// Rounds a volume's back across its width: dark edges, a light streak.
const spineStops = [
  <Stop key="0" offset="0" stopColor="#000" stopOpacity={0.35} />,
  <Stop key="1" offset="0.35" stopColor="#fff" stopOpacity={0.1} />,
  <Stop key="2" offset="0.6" stopColor="#000" stopOpacity={0.05} />,
  <Stop key="3" offset="1" stopColor="#000" stopOpacity={0.4} />,
]

const numerals = ['I', 'II', 'III', 'IV', 'V']

/** The open side of a slipcase: the volumes' spines in a row, gilt bands and numbers. */
function BoxedFace({ title, tone, count, s }: FaceProps) {
  const slot = { x: 11, y: 9, w: 78, h: 50 }
  const pad = { x: 1.6, top: 2.2 }
  const gap = 1
  const spineW = (slot.w - pad.x * 2 - gap * 4) / 5
  const spineY = slot.y + pad.top
  const spineH = slot.h - pad.top
  const shades = [
    tone.from,
    mixHex(tone.from, '#000000', 0.18),
    mixHex(tone.from, '#ffffff', 0.08),
    mixHex(tone.from, '#000000', 0.26),
    mixHex(tone.from, '#ffffff', 0.12),
  ]
  const spineX = (i: number) => slot.x + pad.x + i * (spineW + gap)
  return (
    <>
      <Svg width={s} height={s} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <ToneGradient id="tone" tone={tone} />
          <LinearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
            {sheenStops}
          </LinearGradient>
          <LinearGradient id="spine" x1="0" y1="0" x2="1" y2="0">
            {spineStops}
          </LinearGradient>
          <LinearGradient id="mouth" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity={0.7} />
            <Stop offset="1" stopColor="#000" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="5" y="3" width="90" height="94" rx="2.4" fill="url(#tone)" />
        <Rect x="5" y="3" width="90" height="94" rx="2.4" fill="url(#sheen)" />
        <Rect {...rectOf(slot)} rx="1.2" fill="#000" fillOpacity={0.5} />
        {shades.map((shade, i) => (
          <G key={numerals[i]}>
            <Rect x={spineX(i)} y={spineY} width={spineW} height={spineH} rx="0.9" fill={shade} />
            <Rect
              x={spineX(i)}
              y={spineY}
              width={spineW}
              height={spineH}
              rx="0.9"
              fill="url(#spine)"
            />
            <Rect
              x={spineX(i) + spineW * 0.12}
              y={spineY + spineH * 0.1}
              width={spineW * 0.76}
              height="0.9"
              fill={coverInk.gold}
              fillOpacity={0.85}
            />
            <Rect
              x={spineX(i) + spineW * 0.12}
              y={spineY + spineH * 0.86 - 0.9}
              width={spineW * 0.76}
              height="0.9"
              fill={coverInk.gold}
              fillOpacity={0.85}
            />
            <Rect
              x={spineX(i) + spineW * 0.14}
              y={spineY + spineH * 0.24}
              width={spineW * 0.72}
              height={spineH * 0.24}
              fill="#140A05"
              fillOpacity={0.55}
              stroke={coverInk.gold}
              strokeOpacity={0.6}
              strokeWidth="0.4"
            />
          </G>
        ))}
        <Rect x={slot.x} y={slot.y} width={slot.w} height="12" rx="1.2" fill="url(#mouth)" />
      </Svg>
      {numerals.map((n, i) => (
        <View
          key={n}
          style={[
            styles.abs,
            styles.center,
            {
              left: (spineX(i) / 100) * s,
              width: (spineW / 100) * s,
              top: ((spineY + spineH * 0.24) / 100) * s,
              height: ((spineH * 0.24) / 100) * s,
            },
          ]}
        >
          <CoverText
            style={{ fontFamily: coverFonts.caps, fontSize: s * 0.04, color: coverInk.gold }}
          >
            {n}
          </CoverText>
        </View>
      ))}
      <View
        style={[
          styles.abs,
          styles.center,
          { left: s * 0.11, right: s * 0.11, top: s * 0.61, bottom: s * 0.08, gap: s * 0.022 },
        ]}
      >
        <CoverText
          lines={2}
          style={[
            styles.title,
            { fontSize: s * 0.11, lineHeight: s * 0.11 * 1.1, color: coverInk.cream },
          ]}
        >
          {title}
        </CoverText>
        {count && (
          <Kicker s={s} color={coverInk.gold} opacity={0.85}>
            {count}
          </Kicker>
        )}
      </View>
    </>
  )
}

/** The closed side of the case, blind-stamped, two volumes riding up out of the mouth. */
function SlipcaseFace({ title, tone, count, s }: FaceProps) {
  const vols = [
    { x: 13, y: 4, fill: mixHex(tone.from, '#000000', 0.22) },
    { x: 50, y: 9, fill: mixHex(tone.from, '#ffffff', 0.15) },
  ]
  const frame = { x: 6 + 88 * 0.09, y: 17 + 80 * 0.11, w: 88 * 0.82, h: 80 * 0.8 }
  return (
    <>
      <Svg width={s} height={s} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <ToneGradient id="tone" tone={tone} />
          <LinearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
            {sheenStops}
          </LinearGradient>
          <LinearGradient id="back" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000" stopOpacity={0.3} />
            <Stop offset="0.08" stopColor="#fff" stopOpacity={0.12} />
            <Stop offset="0.2" stopColor="#000" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="mouth" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#000" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {vols.map((v) => (
          <G key={v.x}>
            <Rect x={v.x} y={v.y} width="37" height="30" rx="1" fill={v.fill} />
            <Rect x={v.x} y={v.y} width="37" height="30" rx="1" fill="url(#back)" />
            <Rect
              x={v.x + 3.7}
              y={v.y + 5.4}
              width="29.6"
              height="0.5"
              fill={coverInk.gold}
              fillOpacity={0.8}
            />
          </G>
        ))}
        <Rect x="6" y="17" width="88" height="80" rx="2.4" fill="url(#tone)" />
        <Rect x="6" y="17" width="88" height="80" rx="2.4" fill="url(#sheen)" />
        <Rect x="6" y="17" width="88" height="5" fill="url(#mouth)" />
        <Rect
          {...rectOf(frame)}
          fill="none"
          stroke={coverInk.gold}
          strokeOpacity={0.45}
          strokeWidth="0.6"
        />
        <Rect
          {...rectOf({ x: frame.x + 2.4, y: frame.y + 2.4, w: frame.w - 4.8, h: frame.h - 4.8 })}
          fill="none"
          stroke={coverInk.gold}
          strokeOpacity={0.2}
          strokeWidth="0.6"
        />
      </Svg>
      <View
        style={[
          styles.abs,
          styles.center,
          { left: s * 0.15, right: s * 0.15, top: s * 0.3, bottom: s * 0.17, gap: s * 0.03 },
        ]}
      >
        <CoverText
          lines={3}
          style={[
            styles.title,
            { fontSize: s * 0.115, lineHeight: s * 0.115 * 1.1, color: coverInk.cream },
          ]}
        >
          {title}
        </CoverText>
        <View
          style={{ width: s * 0.18, height: 1, backgroundColor: coverInk.gold, opacity: 0.7 }}
        />
        {count && (
          <Kicker s={s} color={coverInk.gold} opacity={0.85}>
            {count}
          </Kicker>
        )}
      </View>
    </>
  )
}

/** Holy cards fanned in the hand: two on colored stock behind, the cream one on top. */
function PacketFace({ title, tone, count, s }: FaceProps) {
  const card = { x: 15, y: 13, w: 70, h: 74 }
  const inner = {
    x: card.x + card.w * 0.09,
    y: card.y + card.h * 0.09,
    w: card.w * 0.82,
    h: card.h * 0.82,
  }
  return (
    <>
      <Svg width={s} height={s} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="vellum" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={coverInk.vellum} />
            <Stop offset="1" stopColor="#EFE3C9" />
          </LinearGradient>
        </Defs>
        <G transform="translate(-6.3 1.5) rotate(-15 50 50)">
          <LaceRect {...card} color={tone.to} />
        </G>
        <G transform="translate(7 2.2) rotate(13 50 50)">
          <LaceRect {...card} color={tone.from} />
        </G>
        <LaceRect {...card} color={coverInk.paper} />
        <Rect {...rectOf(inner)} rx="2" fill="url(#vellum)" stroke={tone.from} strokeWidth="1.2" />
        <Rect
          {...rectOf({ x: inner.x + 2.5, y: inner.y + 2.5, w: inner.w - 5, h: inner.h - 5 })}
          rx="1.4"
          fill="none"
          stroke={tone.from}
          strokeOpacity={0.45}
          strokeWidth="0.5"
        />
      </Svg>
      <View
        style={[
          styles.abs,
          styles.center,
          {
            left: (inner.x / 100 + 0.05) * s,
            right: ((100 - inner.x - inner.w) / 100 + 0.05) * s,
            top: (inner.y / 100) * s,
            bottom: ((100 - inner.y - inner.h) / 100) * s,
            gap: s * 0.03,
          },
        ]}
      >
        <CoverText
          lines={3}
          style={[
            styles.title,
            { fontSize: s * 0.105, lineHeight: s * 0.105 * 1.1, color: coverInk.text },
          ]}
        >
          {title}
        </CoverText>
        {count && (
          <Kicker s={s} color={tone.from}>
            {count}
          </Kicker>
        )}
      </View>
    </>
  )
}

const ordoHours = ['MANE', 'MERIDIE', 'VESPERE']

/** A page of the calendar: the tone as a heading band, the day's entries in rubric. */
function OrdoFace({ title, tone, count, s }: FaceProps) {
  const rowY = [73, 80, 87]
  return (
    <>
      <Svg width={s} height={s} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <ToneGradient id="tone" tone={tone} />
          <LinearGradient id="page" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F6EEDC" />
            <Stop offset="1" stopColor="#E9DBBD" />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" rx="4" fill="url(#page)" />
        <Rect width="100" height="20" rx="4" fill="url(#tone)" />
        <Rect y="10" width="100" height="10" fill="url(#tone)" />
        <Rect y="21.8" width="100" height="0.9" fill={tone.from} fillOpacity={0.7} />
        {rowY.map((y, i) => (
          <Rect
            key={y}
            x="40.5"
            y={y - 0.55}
            width={50.5 * [1, 0.8, 0.9][i]}
            height="1.1"
            rx="0.55"
            fill={coverInk.text}
            fillOpacity={0.18}
          />
        ))}
      </Svg>
      <View
        style={[
          styles.abs,
          styles.row,
          { left: s * 0.09, right: s * 0.09, top: 0, height: s * 0.2 },
        ]}
      >
        <Kicker s={s} color={coverInk.cream}>
          ORDO
        </Kicker>
        {count && (
          <Kicker s={s} color={coverInk.cream}>
            {count}
          </Kicker>
        )}
      </View>
      <View
        style={[styles.abs, { left: s * 0.09, right: s * 0.09, top: s * 0.27, height: s * 0.38 }]}
      >
        <CoverText
          lines={3}
          style={{
            fontFamily: coverFonts.title,
            fontSize: s * 0.115,
            lineHeight: s * 0.115 * 1.06,
            color: coverInk.text,
          }}
        >
          {title}
        </CoverText>
      </View>
      {ordoHours.map((h, i) => (
        <View
          key={h}
          style={[
            styles.abs,
            {
              left: s * 0.09,
              top: (rowY[i] / 100) * s - s * 0.024,
              height: s * 0.048,
              justifyContent: 'center',
            },
          ]}
        >
          <Kicker s={s} color={coverInk.rubric} scale={0.034}>
            {h}
          </Kicker>
        </View>
      ))}
    </>
  )
}

const faces: Record<CollectionCoverStyle, (p: FaceProps) => React.JSX.Element> = {
  boxed: BoxedFace,
  slipcase: SlipcaseFace,
  packet: PacketFace,
  ordo: OrdoFace,
}

function Kicker({
  children,
  s,
  color,
  opacity = 1,
  scale = 0.038,
}: {
  children: string
  s: number
  color: string
  opacity?: number
  scale?: number
}) {
  return (
    <CoverText
      lines={1}
      style={{
        fontFamily: coverFonts.caps,
        fontSize: s * scale,
        letterSpacing: s * scale * 0.2,
        color,
        opacity,
      }}
    >
      {children}
    </CoverText>
  )
}

const rectOf = (r: { x: number; y: number; w: number; h: number }) => ({
  x: r.x,
  y: r.y,
  width: r.w,
  height: r.h,
})

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 9,
  },
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: coverFonts.title, textAlign: 'center' },
})
