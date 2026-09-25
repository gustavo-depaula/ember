import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

import { PracticeIcon } from '@/components'
import type { BlockTone } from '@/features/explore/bgColor'
import { CoverText, coverFonts, coverInk, Glyph, LaceDots, ToneGradient } from './parts'

/**
 * The square cards an art-less practice tile draws. A practice is a holy card
 * printed on colored stock; a prayer is the cream holy card; a liturgical
 * prayer is a page of the Office. Kind reads before the title: color-led for
 * practices, cream for prayers. Sketches: docs/design/cover-sketches/.
 */
export function PracticeCard({
  title,
  tone,
  icon,
  minutes,
  size,
}: {
  title: string
  tone: BlockTone
  icon?: string
  minutes?: number
  size: number
}) {
  const { t } = useTranslation()
  const s = size
  return (
    <View style={[styles.shadow, { width: s, height: s }]}>
      <Svg width={s} height={s} style={StyleSheet.absoluteFill}>
        <Defs>
          <ToneGradient id="tone" tone={tone} />
        </Defs>
        <LaceDots size={s} color={tone.from} />
        <Rect
          x={s / 32}
          y={s / 32}
          width={s - s / 16}
          height={s - s / 16}
          rx={s * 0.01}
          fill="url(#tone)"
        />
      </Svg>
      <View
        style={[
          styles.inner,
          {
            margin: s * 0.09,
            borderRadius: s * 0.02,
            borderColor: 'rgba(245,239,226,0.7)',
            paddingHorizontal: s * 0.06,
            gap: s * 0.035,
          },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              margin: s * 0.025,
              borderRadius: s * 0.012,
              borderWidth: 1,
              borderColor: 'rgba(245,239,226,0.28)',
            },
          ]}
        />
        {icon && <PracticeIcon name={icon} size={Math.round(s * 0.18)} />}
        <CoverText
          lines={3}
          style={[
            styles.title,
            { fontSize: s * 0.11, lineHeight: s * 0.11 * 1.12, color: coverInk.cream },
          ]}
        >
          {title}
        </CoverText>
        {minutes !== undefined && minutes > 0 && (
          <CoverText
            lines={1}
            style={{
              fontFamily: coverFonts.caps,
              fontSize: s * 0.042,
              letterSpacing: s * 0.042 * 0.18,
              color: coverInk.cream,
              opacity: 0.7,
            }}
          >
            {t('catalog.estimatedTime', { minutes }).toUpperCase()}
          </CoverText>
        )}
      </View>
    </View>
  )
}

export function PrayerCard({
  title,
  tone,
  icon,
  size,
}: {
  title: string
  tone: BlockTone
  icon?: string
  size: number
}) {
  const s = size
  return (
    <View style={[styles.shadow, { width: s, height: s }]}>
      <Svg width={s} height={s} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="vellum" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={coverInk.vellum} />
            <Stop offset="1" stopColor="#EFE3C9" />
          </LinearGradient>
        </Defs>
        <LaceDots size={s} color={coverInk.paper} />
        <Rect
          x={s / 32}
          y={s / 32}
          width={s - s / 16}
          height={s - s / 16}
          rx={s * 0.01}
          fill={coverInk.paper}
        />
        <Rect
          x={s * 0.09}
          y={s * 0.09}
          width={s * 0.82}
          height={s * 0.82}
          rx={s * 0.03}
          fill="url(#vellum)"
          stroke={tone.from}
          strokeWidth={s * 0.015}
        />
        <Rect
          x={s * 0.115}
          y={s * 0.115}
          width={s * 0.77}
          height={s * 0.77}
          rx={s * 0.02}
          fill="none"
          stroke={tone.from}
          strokeOpacity={0.45}
          strokeWidth={1}
        />
      </Svg>
      <View
        style={[
          styles.inner,
          { margin: s * 0.09, borderWidth: 0, paddingHorizontal: s * 0.08, gap: s * 0.035 },
        ]}
      >
        {icon && <PracticeIcon name={icon} size={Math.round(s * 0.18)} />}
        <CoverText
          lines={3}
          style={[
            styles.title,
            { fontSize: s * 0.115, lineHeight: s * 0.115 * 1.12, color: coverInk.text },
          ]}
        >
          {title}
        </CoverText>
      </View>
    </View>
  )
}

export function BreviaryCard({ title, size }: { title: string; size: number }) {
  const s = size
  const initial = Array.from(title.trim())[0] ?? 'O'
  return (
    <View style={[styles.shadow, { width: s, height: s }]}>
      <Svg width={s} height={s} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="page" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={coverInk.paper} />
            <Stop offset="1" stopColor={coverInk.paperDeep} />
          </LinearGradient>
        </Defs>
        <Rect width={s} height={s} rx={s * 0.04} fill="url(#page)" />
        <Rect
          x={s * 0.09}
          y={s * 0.09}
          width={s * 0.82}
          height={1}
          fill={coverInk.rubric}
          fillOpacity={0.7}
        />
        {[1, 0.92, 0.7].map((f, i) => (
          <Rect
            key={f}
            x={s * 0.09}
            y={s * (0.62 + i * 0.047)}
            width={s * 0.82 * f}
            height={s * 0.012}
            rx={s * 0.006}
            fill={coverInk.text}
            fillOpacity={0.18}
          />
        ))}
      </Svg>
      <View
        style={[
          styles.abs,
          { left: s * 0.07, top: s * 0.14, width: s * 0.3, alignItems: 'center' },
        ]}
      >
        <CoverText
          style={{
            fontFamily: coverFonts.blackletter,
            fontSize: s * 0.36,
            lineHeight: s * 0.4,
            color: coverInk.rubric,
          }}
        >
          {initial}
        </CoverText>
      </View>
      <View
        style={[styles.abs, { left: s * 0.4, right: s * 0.07, top: s * 0.16, height: s * 0.4 }]}
      >
        <CoverText
          lines={3}
          style={{
            fontFamily: coverFonts.title,
            fontSize: s * 0.105,
            lineHeight: s * 0.105 * 1.12,
            color: coverInk.text,
          }}
        >
          {title}
        </CoverText>
      </View>
      <View style={[styles.abs, { right: s * 0.09, bottom: s * 0.07 }]}>
        <Glyph kind="pattee" size={s * 0.08} color={coverInk.rubric} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 9,
  },
  inner: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: coverFonts.title, textAlign: 'center' },
  abs: { position: 'absolute' },
})
