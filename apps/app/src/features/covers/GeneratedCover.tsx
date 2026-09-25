import type { BlockTone } from '@/features/explore/bgColor'
import { BookCover } from './BookCover'
import { BreviaryCard, PracticeCard, PrayerCard } from './Cards'
import { CollectionCover } from './CollectionCovers'
import type { TileCover } from './coverFor'
import { TractCover } from './TractCover'

/** Draws the art-less cover a tile names — width is the tile's; books are 1.5× as tall, tracts 1.3×. */
export function GeneratedCover({
  cover,
  title,
  tone,
  width,
}: {
  cover: TileCover
  title: string
  tone: BlockTone
  width: number
}) {
  switch (cover.kind) {
    case 'book':
      return (
        <BookCover
          title={title}
          author={cover.author}
          tone={tone}
          format={cover.format}
          width={width}
        />
      )
    case 'practice':
      return (
        <PracticeCard
          title={title}
          tone={tone}
          icon={cover.icon}
          minutes={cover.minutes}
          size={width}
        />
      )
    case 'prayer':
      return <PrayerCard title={title} tone={tone} icon={cover.icon} size={width} />
    case 'breviary':
      return <BreviaryCard title={title} size={width} />
    case 'collection':
      return (
        <CollectionCover
          style={cover.style}
          title={title}
          tone={tone}
          volumes={cover.volumes}
          prayers={cover.prayers}
          size={width}
        />
      )
    case 'article':
      return (
        <TractCover
          title={title}
          subtitle={cover.subtitle}
          minutes={cover.minutes}
          kicker={cover.kicker}
          width={width}
        />
      )
  }
}
