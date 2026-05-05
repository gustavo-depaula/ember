import { Text, View, YStack } from 'tamagui'
import type { RenderedSection } from '@/content/types'
import {
  CanticleBlock,
  CelebrationBanner,
  ChoiceRichTextBlock,
  CollapsibleBlock,
  CollapsiblePrayer,
  GalleryBlock,
  HolyCardBlock,
  HymnBlock,
  ImageBlock,
  LiturgicalColorBlock,
  LiturgicalPrayerBlock,
  OptionsBlock,
  PrayerTextBlock,
  ProseBlock,
  ResponseBlock,
  SectionMarker,
  SelectBlock,
} from './prayer'
import { RubricLabel } from './RubricLabel'

export function SectionBlock({
  section,
  renderSection,
  onSelectOverride,
}: {
  section: RenderedSection
  renderSection?: (section: RenderedSection, index: number) => React.ReactNode
  onSelectOverride?: (overrideKey: string, nextId: string) => void
}) {
  switch (section.type) {
    case 'rubric':
      return <RubricLabel>{section.label.primary}</RubricLabel>

    case 'liturgical-color':
      return <LiturgicalColorBlock color={section.color} label={section.label} />

    case 'section-marker':
      return <SectionMarker title={section.title} color={section.color} />

    case 'celebration-banner':
      return (
        <CelebrationBanner
          title={section.title}
          color={section.color}
          rank={section.rank}
          cycle={section.cycle}
        />
      )

    case 'collapsible':
      return (
        <CollapsibleBlock
          title={section.title}
          defaultOpen={section.defaultOpen}
          sections={section.sections}
          renderSection={
            renderSection ??
            ((s, i) => (
              <SectionBlock
                key={`${s.type}-${i}`}
                section={s}
                onSelectOverride={onSelectOverride}
              />
            ))
          }
        />
      )

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
          pickerStyle={section.pickerStyle}
          options={section.options.map((o) => ({
            ...o,
            label: o.label.primary,
            excerpt: o.excerpt?.primary,
          }))}
          renderSection={
            renderSection ??
            ((s, i) => (
              <SectionBlock
                key={`${s.type}-${i}`}
                section={s}
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
                onSelectOverride={onSelectOverride}
              />
            ))
          }
        />
      )

    case 'choice-rich-text':
      return (
        <ChoiceRichTextBlock
          label={section.label}
          selectedId={section.selectedId}
          options={section.options}
          pickerStyle={section.pickerStyle}
          onSelect={(nextId) => onSelectOverride?.(section.overrideKey, nextId)}
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
