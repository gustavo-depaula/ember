import {
  type ArtChoice,
  ArtChoiceCard,
  ArtChoiceFeatureCard,
} from '@/features/explore/ArtChoiceCard'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
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
    tone: toneForKey(item.id),
  }
}

export function TemplateCard({ item }: { item: TemplateListItem }) {
  return <ArtChoiceCard choice={toChoice(item)} />
}

export function TemplateFeatureCard({ item, marker }: { item: TemplateListItem; marker?: string }) {
  return <ArtChoiceFeatureCard choice={toChoice(item)} marker={marker} />
}
