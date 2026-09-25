import { StyleSheet, type TextStyle, View } from 'react-native'
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg'

import type { BlockTone } from '@/features/explore/bgColor'
import { type BookCoverFormat, compactCoverWidth } from './coverFor'
import { CoverText, coverFonts, coverInk, Glyph, ToneGradient, titleScale } from './parts'

const imprint = 'EMBER LIBRARY'

/**
 * A generated book cover: a bound volume in the book's jewel tone, with the
 * left hinge reflex (spine edge → crease → light streak) over one of eight
 * bindings. Layout is in fractions of the width so one component serves the
 * 72pt shelf and the detail hero. Sketches: docs/design/cover-sketches/.
 */
export function BookCover({
  title,
  author,
  tone,
  format,
  width,
}: {
  title: string
  author?: string
  tone: BlockTone
  format: BookCoverFormat
  width: number
}) {
  const w = width
  const h = Math.round(w * 1.5)
  const compact = w < compactCoverWidth
  const Face = compact ? ClassicFace : faces[format]
  return (
    // Shadow on an outer view: iOS clips a shadow on the view that clips its content.
    <View style={[styles.shadow, { width: w, height: h }]}>
      <View
        style={{
          width: w,
          height: h,
          overflow: 'hidden',
          borderTopLeftRadius: w * 0.012,
          borderBottomLeftRadius: w * 0.012,
          borderTopRightRadius: w * 0.035,
          borderBottomRightRadius: w * 0.035,
        }}
      >
        <Svg
          width={w}
          height={h}
          viewBox="0 0 100 150"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <ToneGradient id="tone" tone={tone} />
          </Defs>
          <Rect width="100" height="150" fill="url(#tone)" />
          {!compact && <Ornament format={format} />}
        </Svg>
        <Face title={title} author={compact ? undefined : author} w={w} tone={tone} />
        <Svg
          width={w}
          height={h}
          viewBox="0 0 100 150"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="hinge" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#000" stopOpacity={0.42} />
              <Stop offset="0.032" stopColor="#000" stopOpacity={0.18} />
              <Stop offset="0.044" stopColor="#fff" stopOpacity={0.16} />
              <Stop offset="0.062" stopColor="#fff" stopOpacity={0.05} />
              <Stop offset="0.074" stopColor="#000" stopOpacity={0.22} />
              <Stop offset="0.095" stopColor="#000" stopOpacity={0.06} />
              <Stop offset="0.13" stopColor="#000" stopOpacity={0} />
              <Stop offset="0.94" stopColor="#000" stopOpacity={0} />
              <Stop offset="1" stopColor="#000" stopOpacity={0.12} />
            </LinearGradient>
            <LinearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#fff" stopOpacity={0.07} />
              <Stop offset="0.35" stopColor="#fff" stopOpacity={0} />
              <Stop offset="0.75" stopColor="#000" stopOpacity={0} />
              <Stop offset="1" stopColor="#000" stopOpacity={0.14} />
            </LinearGradient>
          </Defs>
          <Rect width="100" height="150" fill="url(#sheen)" />
          <Rect width="100" height="150" fill="url(#hinge)" />
        </Svg>
      </View>
    </View>
  )
}

type FaceProps = { title: string; author?: string; w: number; tone: BlockTone }

/** Line art drawn in the 100×150 cover box, under the text. */
function Ornament({ format }: { format: BookCoverFormat }) {
  const gold = coverInk.gold
  const cream = coverInk.cream
  switch (format) {
    case 'classic':
      return (
        <Rect
          x="15"
          y="9.75"
          width="77.5"
          height="133.35"
          fill="none"
          stroke={cream}
          strokeOpacity={0.38}
          strokeWidth={0.5}
        />
      )
    case 'gilt':
      return (
        <G fill="none" stroke={gold}>
          <Rect x="14" y="7.5" width="80" height="135" strokeOpacity={0.75} strokeWidth={0.75} />
          <Rect x="19.5" y="13" width="69" height="124" strokeOpacity={0.45} strokeWidth={0.5} />
          {[
            [14, 7.5],
            [94, 7.5],
            [14, 142.5],
            [94, 142.5],
          ].map(([x, y]) => (
            <Path
              key={`${x}-${y}`}
              d={`M${x} ${y - 4.5}l1.1 3.4 3.4 1.1-3.4 1.1-1.1 3.4-1.1-3.4-3.4-1.1 3.4-1.1z`}
              fill={gold}
              stroke="none"
            />
          ))}
        </G>
      )
    case 'quarter':
      return (
        <G>
          <Rect width="24" height="150" fill="#000" fillOpacity={0.38} />
          <Rect x="24" width="0.5" height="150" fill={gold} fillOpacity={0.6} />
          {[18, 34, 66, 82].map((p) => (
            <G key={p}>
              <Rect y={p * 1.5} width="24" height="1.6" fill="#fff" fillOpacity={0.14} />
              <Rect y={p * 1.5 + 1.6} width="24" height="1.7" fill="#000" fillOpacity={0.3} />
            </G>
          ))}
        </G>
      )
    case 'arch': {
      const arch = (x0: number, x1: number, y0: number, yb: number) => {
        const rx = (x1 - x0) / 2
        const ry = (yb - y0) * 0.28
        return `M${x0} ${yb}V${y0 + ry}A${rx} ${ry} 0 0 1 ${x1} ${y0 + ry}V${yb}Z`
      }
      return (
        <G fill="none">
          <Path d={arch(15, 93, 10.5, 141)} stroke={gold} strokeOpacity={0.6} strokeWidth={0.5} />
          <Path
            d={arch(18, 90, 14.25, 138)}
            stroke={cream}
            strokeOpacity={0.22}
            strokeWidth={0.5}
          />
        </G>
      )
    }
    case 'watermark':
      // A tonal cross bleeding off the top-right edge.
      return <Path d="M58 -6h24v42h36v24H82v60H58V60H22V36h36z" fill="#fff" fillOpacity={0.06} />
    case 'banded':
      return (
        <G>
          <Rect y="45" width="100" height="63" fill={coverInk.paper} />
          <Rect y="42.3" width="100" height="1.2" fill={gold} fillOpacity={0.7} />
          <Rect y="108.9" width="100" height="1.2" fill={gold} fillOpacity={0.7} />
        </G>
      )
    case 'missal':
      return (
        <G fill={gold}>
          {[15, 132.6].map((y) => (
            <G key={y}>
              <Rect x="21" y={y} width="68" height="0.75" />
              <Rect x="21" y={y + 2} width="68" height="0.4" />
            </G>
          ))}
        </G>
      )
    case 'label':
      return null
  }
}

function Imprint({ w, style }: { w: number; style?: TextStyle }) {
  return (
    <CoverText
      lines={1}
      style={[
        {
          fontFamily: coverFonts.caps,
          fontSize: w * 0.032,
          letterSpacing: w * 0.032 * 0.3,
          color: coverInk.cream,
          opacity: 0.7,
        },
        style,
      ]}
    >
      {imprint}
    </CoverText>
  )
}

function ClassicFace({ title, author, w }: FaceProps) {
  const compact = author === undefined
  return (
    <View
      style={[
        styles.abs,
        {
          top: '6.5%',
          bottom: '4.6%',
          left: '15%',
          right: '7.5%',
          alignItems: 'center',
          paddingHorizontal: w * 0.05,
        },
      ]}
    >
      <View style={{ marginTop: w * 0.1 }}>
        <Glyph kind="greek" size={w * 0.1} color={coverInk.gold} />
      </View>
      <View style={[styles.center, { flex: 1, gap: w * 0.04 }]}>
        <CoverText lines={4} style={[titleStyle(w, titleScale(title)), styles.centerText]}>
          {title}
        </CoverText>
        {!compact && (
          <View style={{ width: '28%', height: 1, backgroundColor: coverInk.gold, opacity: 0.7 }} />
        )}
        {author && (
          <CoverText
            lines={2}
            style={{
              fontFamily: coverFonts.body,
              fontSize: w * 0.058,
              color: coverInk.cream,
              opacity: 0.85,
              textAlign: 'center',
            }}
          >
            {author}
          </CoverText>
        )}
      </View>
      <Imprint w={w} style={{ marginBottom: w * 0.06 }} />
    </View>
  )
}

function GiltFace({ title, author, w }: FaceProps) {
  return (
    <>
      <View
        style={[
          styles.abs,
          styles.center,
          { top: 0, bottom: 0, left: '10%', right: 0, paddingHorizontal: w * 0.12, gap: w * 0.05 },
        ]}
      >
        <Glyph kind="pattee" size={w * 0.13} color={coverInk.gold} />
        <CoverText
          lines={4}
          style={{
            fontFamily: coverFonts.capsBold,
            fontSize: w * titleScale(title) * 0.82,
            lineHeight: w * titleScale(title) * 0.82 * 1.2,
            letterSpacing: w * 0.002,
            color: coverInk.gold,
            textAlign: 'center',
          }}
        >
          {title}
        </CoverText>
        {author && (
          <Author w={w} italic>
            {author}
          </Author>
        )}
      </View>
      <View style={[styles.abs, { bottom: '11%', left: '10%', right: 0, alignItems: 'center' }]}>
        <Imprint w={w} style={{ fontSize: w * 0.028, color: coverInk.gold, opacity: 0.75 }} />
      </View>
    </>
  )
}

function LabelFace({ title, author, w }: FaceProps) {
  return (
    <View
      style={[styles.abs, { top: '22%', bottom: 0, left: '9%', right: 0, alignItems: 'center' }]}
    >
      <View
        style={{
          width: '74%',
          backgroundColor: '#EFE4CC',
          borderRadius: w * 0.015,
          paddingVertical: w * 0.07,
          paddingHorizontal: w * 0.05,
          gap: w * 0.035,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(90,60,30,0.35)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: w * 0.01 },
          shadowOpacity: 0.35,
          shadowRadius: w * 0.02,
        }}
      >
        <CoverText
          lines={4}
          style={[
            titleStyle(w, titleScale(title) * 0.88),
            styles.centerText,
            { color: coverInk.text },
          ]}
        >
          {title}
        </CoverText>
        {author && (
          <CoverText
            lines={2}
            style={{
              fontFamily: coverFonts.italic,
              fontSize: w * 0.052,
              color: coverInk.textSoft,
              textAlign: 'center',
            }}
          >
            {author}
          </CoverText>
        )}
      </View>
      <View style={[styles.abs, { bottom: '16%', alignSelf: 'center' }]}>
        <Glyph kind="greek" size={w * 0.1} color={coverInk.gold} />
      </View>
      <View style={[styles.abs, { bottom: '7%', alignSelf: 'center' }]}>
        <Imprint w={w} style={{ fontSize: w * 0.028, opacity: 0.65 }} />
      </View>
    </View>
  )
}

function QuarterFace({ title, author, w }: FaceProps) {
  return (
    <>
      <View
        style={[
          styles.abs,
          {
            top: 0,
            bottom: 0,
            left: '24%',
            right: 0,
            justifyContent: 'center',
            paddingHorizontal: w * 0.07,
            gap: w * 0.05,
          },
        ]}
      >
        <CoverText lines={4} style={titleStyle(w, titleScale(title) * 0.92)}>
          {title}
        </CoverText>
        <View style={{ height: 1, backgroundColor: coverInk.gold, opacity: 0.6 }} />
        {author && (
          <CoverText
            lines={2}
            style={{
              fontFamily: coverFonts.body,
              fontSize: w * 0.058,
              color: coverInk.cream,
              opacity: 0.8,
            }}
          >
            {author}
          </CoverText>
        )}
      </View>
      <View style={[styles.abs, { top: '8%', left: '31%' }]}>
        <Glyph kind="greek" size={w * 0.09} color={coverInk.gold} />
      </View>
      <View style={[styles.abs, { bottom: '6%', left: '31%' }]}>
        <Imprint w={w} style={{ fontSize: w * 0.026, opacity: 0.6 }} />
      </View>
    </>
  )
}

function ArchFace({ title, author, w }: FaceProps) {
  return (
    <>
      <View style={[styles.abs, { top: '18%', left: '8%', right: 0, alignItems: 'center' }]}>
        <Glyph kind="greek" size={w * 0.14} color={coverInk.gold} />
      </View>
      <View
        style={[
          styles.abs,
          styles.center,
          {
            top: '12%',
            bottom: 0,
            left: '11%',
            right: '3%',
            paddingHorizontal: w * 0.14,
            gap: w * 0.045,
          },
        ]}
      >
        <CoverText lines={4} style={[titleStyle(w, titleScale(title) * 0.95), styles.centerText]}>
          {title}
        </CoverText>
        {author && (
          <Author w={w} italic>
            {author}
          </Author>
        )}
      </View>
      <View style={[styles.abs, { bottom: '11%', left: '8%', right: 0, alignItems: 'center' }]}>
        <Imprint w={w} style={{ fontSize: w * 0.028, opacity: 0.65 }} />
      </View>
    </>
  )
}

function WatermarkFace({ title, author, w }: FaceProps) {
  return (
    <>
      <View style={[styles.abs, { top: '8%', left: '16%' }]}>
        <Glyph kind="greek" size={w * 0.09} color={coverInk.gold} />
      </View>
      <View
        style={[
          styles.abs,
          {
            top: 0,
            bottom: '17%',
            left: '16%',
            right: '8%',
            justifyContent: 'flex-end',
            gap: w * 0.035,
          },
        ]}
      >
        <CoverText
          lines={4}
          style={[
            titleStyle(w, titleScale(title) * 1.1),
            { lineHeight: w * titleScale(title) * 1.1 * 1.05 },
          ]}
        >
          {title}
        </CoverText>
        <View style={{ width: '20%', height: 1.5, backgroundColor: coverInk.gold }} />
        {author && (
          <CoverText
            lines={2}
            style={{
              fontFamily: coverFonts.body,
              fontSize: w * 0.054,
              color: coverInk.cream,
              opacity: 0.8,
            }}
          >
            {author}
          </CoverText>
        )}
      </View>
      <View style={[styles.abs, { bottom: '6%', left: '16%' }]}>
        <Imprint w={w} style={{ fontSize: w * 0.026, opacity: 0.55 }} />
      </View>
    </>
  )
}

function BandedFace({ title, author, w }: FaceProps) {
  return (
    <>
      <View style={[styles.abs, { top: '10%', left: '9%', right: 0, alignItems: 'center' }]}>
        <Glyph kind="greek" size={w * 0.12} color={coverInk.gold} />
      </View>
      <View
        style={[
          styles.abs,
          styles.center,
          { top: '30%', height: '42%', left: '17%', right: '10%', gap: w * 0.035 },
        ]}
      >
        <CoverText
          lines={3}
          style={[titleStyle(w, titleScale(title) * 0.92), styles.centerText, { color: '#241A12' }]}
        >
          {title}
        </CoverText>
        {author && (
          <CoverText
            lines={2}
            style={{
              fontFamily: coverFonts.body,
              fontSize: w * 0.052,
              color: '#6B5642',
              textAlign: 'center',
            }}
          >
            {author}
          </CoverText>
        )}
      </View>
      <View style={[styles.abs, { bottom: '10%', left: '9%', right: 0, alignItems: 'center' }]}>
        <Imprint w={w} style={{ fontSize: w * 0.028 }} />
      </View>
    </>
  )
}

function MissalFace({ title, author, w }: FaceProps) {
  const size = w * titleScale(title) * 1.15
  return (
    <>
      <View
        style={[
          styles.abs,
          styles.center,
          { top: '14%', bottom: '14%', left: '14%', right: '4%', gap: w * 0.05 },
        ]}
      >
        <Glyph kind="pattee" size={w * 0.15} color={coverInk.gold} />
        <CoverText
          lines={4}
          style={{
            fontFamily: coverFonts.blackletter,
            fontSize: size,
            lineHeight: size * 1.1,
            color: coverInk.cream,
            textAlign: 'center',
          }}
        >
          {title}
        </CoverText>
        {author && (
          <CoverText
            lines={2}
            style={{
              fontFamily: coverFonts.caps,
              fontSize: w * 0.034,
              letterSpacing: w * 0.034 * 0.14,
              color: coverInk.gold,
              opacity: 0.9,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            {author}
          </CoverText>
        )}
      </View>
      <View style={[styles.abs, { bottom: '14.5%', left: '10%', right: 0, alignItems: 'center' }]}>
        <Imprint w={w} style={{ fontSize: w * 0.026, opacity: 0.6 }} />
      </View>
    </>
  )
}

function Author({ w, italic, children }: { w: number; italic?: boolean; children: string }) {
  return (
    <CoverText
      lines={2}
      style={{
        fontFamily: italic ? coverFonts.italic : coverFonts.body,
        fontSize: w * 0.058,
        color: coverInk.cream,
        opacity: 0.85,
        textAlign: 'center',
      }}
    >
      {children}
    </CoverText>
  )
}

function titleStyle(w: number, scale: number) {
  return {
    fontFamily: coverFonts.title,
    fontSize: w * scale,
    lineHeight: w * scale * 1.12,
    color: coverInk.cream,
  }
}

const faces: Record<BookCoverFormat, (p: FaceProps) => React.JSX.Element> = {
  classic: ClassicFace,
  gilt: GiltFace,
  label: LabelFace,
  quarter: QuarterFace,
  arch: ArchFace,
  watermark: WatermarkFace,
  banded: BandedFace,
  missal: MissalFace,
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  centerText: { textAlign: 'center' },
})
