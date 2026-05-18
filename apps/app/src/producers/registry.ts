import { cccCompendiumProducer } from '@ember/producers'
import type { Producer } from './types'

const producers = new Map<string, Producer>()

export function registerProducer(p: Producer): void {
  producers.set(p.id, p)
}

export function unregisterProducer(id: string): void {
  producers.delete(id)
}

export function getProducer(id: string): Producer | undefined {
  return producers.get(id)
}

registerProducer(cccCompendiumProducer)
