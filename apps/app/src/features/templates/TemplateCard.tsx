import {
  type ArtChoice,
  ArtChoiceCard,
  ArtChoiceFeatureCard,
} from '@/features/explore/ArtChoiceCard'
import { artFor } from '@/features/explore/artMap'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

import type { TemplateListItem } from './hooks'

export function templateName(item: TemplateListItem): string {
  return item.entry.name ? localizeContent(item.entry.name) : item.id
}

/** A tradition as a choice: its school's masterpiece, name, and a line beneath. */
function toChoice(item: TemplateListItem): ArtChoice {
  return {
    title: templateName(item),
    description: item.entry.description ? localizeContent(item.entry.description) : undefined,
    image: artFor(item.id),
    tone: toneByIndex(toneIndexForId(item.id)),
  }
}

export function TemplateCard({ item, selected }: { item: TemplateListItem; selected?: boolean }) {
  return <ArtChoiceCard choice={toChoice(item)} selected={selected} />
}

export function TemplateFeatureCard({ item, marker }: { item: TemplateListItem; marker?: string }) {
  return <ArtChoiceFeatureCard choice={toChoice(item)} marker={marker} />
}
