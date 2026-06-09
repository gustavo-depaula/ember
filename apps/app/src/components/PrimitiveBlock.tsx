// biome-ignore-all lint/suspicious/noArrayIndexKey: primitive trees never reorder

import { memo, useCallback } from 'react'
import { View, YStack } from 'tamagui'
import type { Primitive } from '@/content/primitives'
import { RenderedCaptureMovementBlock, RenderedOfferingBlock } from '@/features/movements'
import {
  RenderedCaptureResolutionBlock,
  RenderedReviewResolutionBlock,
} from '@/features/resolutions'
import { ProducerHtmlBlock } from './include/ProducerHtmlBlock'
import { CelebrationBanner } from './prayer/CelebrationBanner'
import { ChoiceRichTextBlock } from './prayer/ChoiceRichTextBlock'
import { CollapsibleBlock } from './prayer/CollapsibleBlock'
import { CollapsiblePrayer } from './prayer/CollapsiblePrayer'
import { GalleryBlock } from './prayer/GalleryBlock'
import { HolyCardBlock } from './prayer/HolyCardBlock'
import { ImageBlock } from './prayer/ImageBlock'
import { LiturgicalColorBlock } from './prayer/LiturgicalColorBlock'
import { LiturgicalColorProvider } from './prayer/LiturgicalColorContext'
import { LiturgicalPrayerBlock } from './prayer/LiturgicalPrayerBlock'
import { OptionsBlock } from './prayer/OptionsBlock'
import { PrayerTextBlock } from './prayer/PrayerTextBlock'
import { ProperSlot } from './prayer/ProperSlot'
import { ProseBlock } from './prayer/ProseBlock'
import { SectionHeading } from './prayer/SectionHeading'
import { SectionMarker } from './prayer/SectionMarker'
import { SelectBlock } from './prayer/SelectBlock'
import { Typography } from './typography'
import { VersesBlock } from './VersesBlock'

type Props = {
  primitive: Primitive
  practiceId: string
  onSelectOverride: (overrideKey: string, nextId: string) => void
}

export const PrimitiveBlock = memo(function PrimitiveBlock({
  primitive,
  practiceId,
  onSelectOverride,
}: Props) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: PrimitiveBlock is the const we're defining; it's stable for the lifetime of the module.
  const renderChild = useCallback(
    (child: Primitive, i: number) => (
      <PrimitiveBlock
        key={`${child.type}-${i}`}
        primitive={child}
        practiceId={practiceId}
        onSelectOverride={onSelectOverride}
      />
    ),
    [practiceId, onSelectOverride],
  )

  switch (primitive.type) {
    case 'text':
      return (
        <PrayerTextBlock
          text={primitive.text}
          fontStyle={primitive.style === 'italic' ? 'italic' : undefined}
        />
      )

    case 'heading':
      return <SectionHeading>{primitive.text.primary}</SectionHeading>

    case 'rubric':
      return <Typography variant="rubric">{primitive.text.primary}</Typography>

    case 'divider':
      return (
        <YStack alignItems="center" paddingVertical="$sm">
          <View width="40%" height={0.5} backgroundColor="$accentSubtle" />
        </YStack>
      )

    case 'verses':
      return <VersesBlock {...primitive} />

    case 'image':
      return (
        <ImageBlock
          src={primitive.src}
          caption={primitive.caption}
          attribution={primitive.attribution}
        />
      )

    case 'gallery':
      return (
        <GalleryBlock
          items={primitive.items}
          display={primitive.display}
          caption={primitive.caption}
          weights={primitive.weights}
        />
      )

    case 'holy-card':
      return (
        <HolyCardBlock
          image={primitive.image}
          title={primitive.title}
          attribution={primitive.attribution}
          prayer={primitive.prayer}
        />
      )

    case 'prose':
      if (primitive.blocks) return <ProducerHtmlBlock blocks={primitive.blocks} />
      if (primitive.text) return <ProseBlock text={primitive.text} />
      throw new Error('prose primitive must have either text or blocks')

    case 'callout':
      return renderCallout(primitive)

    case 'container':
      return renderContainer(primitive, renderChild, onSelectOverride, practiceId)

    case 'interaction':
      return renderInteraction(primitive, practiceId)
  }
})

function renderCallout(p: Extract<Primitive, { type: 'callout' }>) {
  switch (p.variant) {
    case 'celebration-banner':
      return (
        <CelebrationBanner
          title={p.title ?? { primary: '' }}
          color={p.color}
          rank={p.rank}
          cycle={p.cycle}
        />
      )
    case 'liturgical-color':
      return <LiturgicalColorBlock color={p.color ?? 'white'} label={p.title ?? { primary: '' }} />
    case 'section-marker':
      return <SectionMarker title={p.title ?? { primary: '' }} color={p.color} />
  }
}

function renderContainer(
  p: Extract<Primitive, { type: 'container' }>,
  renderChild: (c: Primitive, i: number) => React.ReactNode,
  onSelectOverride: (overrideKey: string, nextId: string) => void,
  practiceId: string,
) {
  const { behavior } = p
  const children = p.children ?? []

  switch (behavior.kind) {
    case 'group':
      return <>{children.map(renderChild)}</>

    case 'collapsible':
      return (
        <CollapsibleBlock
          title={behavior.title}
          defaultOpen={behavior.defaultOpen}
          sections={children}
          renderSection={renderChild}
        />
      )

    case 'color-scope':
      return (
        <LiturgicalColorProvider color={behavior.color}>
          {children.map(renderChild)}
        </LiturgicalColorProvider>
      )

    case 'liturgical-prayer':
      return <LiturgicalPrayerBlock speaker={behavior.speaker} text={behavior.text} />

    case 'prayer':
      return (
        <CollapsiblePrayer
          title={behavior.title}
          text={behavior.text}
          count={behavior.count}
          defaultOpen={behavior.defaultOpen}
          sections={children}
          renderSection={renderChild}
        />
      )

    case 'options':
      return (
        <OptionsBlock
          label={behavior.label.primary}
          pickerStyle={behavior.pickerStyle}
          options={behavior.options.map((o) => ({
            id: o.id,
            label: o.label.primary,
            sections: o.children,
            excerpt: o.excerpt?.primary,
          }))}
          renderSection={renderChild}
        />
      )

    case 'select':
      return (
        <SelectBlock
          label={behavior.label.primary}
          overrideKey={behavior.overrideKey}
          selectedId={behavior.selectedId}
          options={behavior.options}
          practiceId={practiceId}
          onSelect={(nextId) => onSelectOverride(behavior.overrideKey, nextId)}
          renderSection={renderChild}
        />
      )

    case 'choice-rich-text':
      return (
        <ChoiceRichTextBlock
          label={behavior.label}
          selectedId={behavior.selectedId}
          pickerStyle={behavior.pickerStyle}
          hideLabel={behavior.hideLabel}
          precedingResponse={behavior.precedingResponse}
          options={behavior.options}
          onSelect={(id) => onSelectOverride(behavior.overrideKey, id)}
        />
      )
  }
}

function renderInteraction(p: Extract<Primitive, { type: 'interaction' }>, practiceId: string) {
  switch (p.kind) {
    case 'proper':
      return <ProperSlot slot={p.slot} form={p.form} description={p.description} />
    case 'offering':
      return (
        <RenderedOfferingBlock
          practiceId={practiceId}
          mode={p.mode}
          show={p.show}
          default={p.default}
          label={p.label?.primary}
        />
      )
    case 'capture-movement':
      return (
        <RenderedCaptureMovementBlock
          kind={p.movement}
          prompt={p.prompt.primary}
          multi={p.multi}
          defaultCadence={p.defaultCadence}
        />
      )
    case 'capture-resolution':
      return (
        <RenderedCaptureResolutionBlock
          forward={p.forward}
          prompt={p.prompt.primary}
          window={p.window}
          prefill={p.prefill}
        />
      )
    case 'review-resolution':
      return (
        <RenderedReviewResolutionBlock
          mode={p.mode}
          resolution={p.resolution}
          prompt={p.prompt?.primary}
          outcomes={p.outcomes}
          allowNotes={p.allowNotes}
        />
      )
  }
}
