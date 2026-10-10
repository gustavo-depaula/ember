import type { ImageSource } from 'expo-image'

import { type SaintEntry, useHeldCards, useSaintsCatalog } from '@/features/saints'

import type { ProgramEvent } from '../programEvents'

/** A card's face as the album shows it: its art once held, till then its sepia print. */
export function cardFace(saint: SaintEntry | undefined, held: boolean): ImageSource | undefined {
  return saint && (held ? saint.cardThumb : saint.printThumb)
}

/** The card a program gives, when the cards drawn so far have it. */
export function useProgramCard(event: ProgramEvent): {
  saint: SaintEntry | undefined
  face: ImageSource | undefined
} {
  const { byId } = useSaintsCatalog()
  const held = useHeldCards()
  const saint = [event.manifest.holyCard ?? []]
    .flat()
    .map((id) => byId[id])
    .find(Boolean)
  return { saint, face: cardFace(saint, !!saint && held.has(saint.id)) }
}
