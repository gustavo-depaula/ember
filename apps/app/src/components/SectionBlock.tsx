import { Text, View, YStack } from 'tamagui'
import type { RenderedSection } from '@/content/types'
import { OrnamentalRule } from './Ornament'
import {
  CanticleBlock,
  CollapsiblePrayer,
  GalleryBlock,
  HolyCardBlock,
  HymnBlock,
  ImageBlock,
  LiturgicalPrayerBlock,
  OptionsBlock,
  PrayerTextBlock,
  ProseBlock,
  ResponseBlock,
  SelectBlock,
} from './prayer'
import { RubricLabel } from './RubricLabel'

export function SectionBlock({
  section,
  officeTheme = false,
  renderSection,
  onSelectOverride,
}: {
  section: RenderedSection
  officeTheme?: boolean
  renderSection?: (section: RenderedSection, index: number) => React.ReactNode
  onSelectOverride?: (overrideKey: string, nextId: string) => void
}) {
  switch (section.type) {
    case 'rubric':
      return <RubricLabel>{section.label.primary}</RubricLabel>

    case 'prayer':
      if (section.speaker) {
        return <LiturgicalPrayerBlock speaker={section.speaker} text={section.text} />
      }
      if (section.title.primary) {
        return (
          <CollapsiblePrayer
            title={section.title}
            text={section.text}
            count={section.count}
            sections={section.sections}
            renderSection={
              renderSection ??
              ((s, i) => (
                <SectionBlock
                  key={`${s.type}-${i}`}
                  section={s}
                  officeTheme={officeTheme}
                  onSelectOverride={onSelectOverride}
                />
              ))
            }
          />
        )
      }
      return <PrayerTextBlock text={section.text} />

    case 'hymn':
      return <HymnBlock title={section.title} text={section.text} />

    case 'canticle':
      return (
        <CanticleBlock
          title={section.title}
          subtitle={section.subtitle}
          source={section.source}
          text={section.text}
        />
      )

    case 'response':
      return <ResponseBlock verses={section.verses} />

    case 'heading':
      return (
        <Text fontFamily="$heading" fontSize="$4" color="$colorBurgundy" letterSpacing={0.5}>
          {section.text.primary}
        </Text>
      )

    case 'meditation':
      return (
        <Text fontFamily="$body" fontSize="$3" fontStyle="italic" color="$color">
          {section.text.primary}
        </Text>
      )

    case 'divider':
      if (officeTheme) return <OrnamentalRule />
      return (
        <YStack alignItems="center" paddingVertical="$sm">
          <View width="40%" height={0.5} backgroundColor="$accentSubtle" />
        </YStack>
      )

    case 'subheading':
      return (
        <Text
          fontFamily="$heading"
          fontSize="$3"
          color="$colorBurgundy"
          letterSpacing={0.5}
          paddingTop="$sm"
        >
          {section.text.primary}
        </Text>
      )

    case 'image':
      return (
        <ImageBlock src={section.src} caption={section.caption} attribution={section.attribution} />
      )

    case 'options':
      return (
        <OptionsBlock
          label={section.label.primary}
          options={section.options.map((o) => ({ ...o, label: o.label.primary }))}
          renderSection={
            renderSection ??
            ((s, i) => (
              <SectionBlock
                key={`${s.type}-${i}`}
                section={s}
                officeTheme={officeTheme}
                onSelectOverride={onSelectOverride}
              />
            ))
          }
        />
      )

    case 'select':
      return (
        <SelectBlock
          label={section.label.primary}
          selectedId={section.selectedId}
          options={section.options.map((o) => ({ ...o, label: o.label.primary }))}
          onSelect={(nextId) => onSelectOverride?.(section.overrideKey, nextId)}
          renderSection={
            renderSection ??
            ((s, i) => (
              <SectionBlock
                key={`${s.type}-${i}`}
                section={s}
                officeTheme={officeTheme}
                onSelectOverride={onSelectOverride}
              />
            ))
          }
        />
      )

    case 'prose':
      return <ProseBlock text={section.text} />

    case 'gallery':
      return <GalleryBlock items={section.items} />

    case 'holy-card':
      return (
        <HolyCardBlock
          image={section.image}
          title={section.title}
          attribution={section.attribution}
          prayer={section.prayer}
        />
      )

    default:
      return null
  }
}
