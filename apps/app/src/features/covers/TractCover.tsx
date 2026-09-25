import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'

import { articleAspect } from './coverFor'
import { CoverText, coverFonts, coverInk } from './parts'

/**
 * A chapter read on its own — an article, a formation guide — as a single
 * printed sheet with its corner turned: the collection as a red kicker, the
 * title, the subtitle in italic, reading time at the foot. Cream like the
 * prayers, but portrait and set in paragraphs rather than lace.
 * Sketches: docs/design/cover-sketches/collections.html (A1).
 */
export function TractCover({
  title,
  subtitle,
  minutes,
  kicker,
  width,
}: {
  title: string
  subtitle?: string
  minutes?: number
  kicker?: string
  width: number
}) {
  const { t } = useTranslation()
  const w = width
  const h = Math.round(w * articleAspect)
  return (
    <View style={[styles.shadow, { width: w, height: h }]}>
      <Svg width={w} height={h} viewBox="0 0 100 130" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sheet" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={coverInk.vellum} />
            <Stop offset="1" stopColor="#ECDFC3" />
          </LinearGradient>
          <LinearGradient id="fold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#D8C8A6" />
            <Stop offset="1" stopColor="#C9B891" />
          </LinearGradient>
        </Defs>
        <Path
          d="M1.4 0H86L100 14.3V128.6Q100 130 98.6 130H1.4Q0 130 0 128.6V1.4Q0 0 1.4 0Z"
          fill="url(#sheet)"
        />
        <Path d="M86 0V13.3Q86 14.3 87 14.3H100Z" fill="url(#fold)" />
        <Rect x="10" y="19.5" width="68" height="0.5" fill={coverInk.rubric} fillOpacity={0.6} />
      </Svg>
      {kicker && (
        <View style={[styles.abs, { left: w * 0.1, right: w * 0.24, top: h * 0.075 }]}>
          <CoverText
            lines={1}
            style={[styles.caps, { fontSize: w * 0.038, color: coverInk.rubric }]}
          >
            {kicker.toUpperCase()}
          </CoverText>
        </View>
      )}
      <View style={[styles.abs, { left: w * 0.1, right: w * 0.1, top: h * 0.2, height: h * 0.4 }]}>
        <CoverText
          lines={4}
          style={{
            fontFamily: coverFonts.title,
            fontSize: w * 0.12,
            lineHeight: w * 0.12 * 1.06,
            color: coverInk.text,
          }}
        >
          {title}
        </CoverText>
      </View>
      {subtitle && (
        <View style={[styles.abs, { left: w * 0.1, right: w * 0.1, top: h * 0.62 }]}>
          <CoverText
            lines={3}
            style={{
              fontFamily: coverFonts.italic,
              fontSize: w * 0.062,
              lineHeight: w * 0.062 * 1.2,
              color: coverInk.textSoft,
            }}
          >
            {subtitle}
          </CoverText>
        </View>
      )}
      {minutes !== undefined && minutes > 0 && (
        <View style={[styles.abs, { left: w * 0.1, right: w * 0.24, bottom: h * 0.065 }]}>
          <CoverText
            lines={1}
            style={[styles.caps, { fontSize: w * 0.036, color: coverInk.textSoft }]}
          >
            {t('covers.minRead', { minutes }).toUpperCase()}
          </CoverText>
        </View>
      )}
      <View style={[styles.abs, { right: w * 0.09, bottom: h * 0.04 }]}>
        <CoverText
          style={{ fontFamily: coverFonts.body, fontSize: w * 0.09, color: coverInk.rubric }}
        >
          ❧
        </CoverText>
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
  abs: { position: 'absolute' },
  caps: { fontFamily: coverFonts.caps, letterSpacing: 0.8 },
})
