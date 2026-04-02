/**
 * Maps Mass flow proper slot names to Divinum Officium section IDs.
 */

const slotToSection: Record<string, string[]> = {
  introit: ['Introitus'],
  collect: ['Oratio'],
  epistle: ['Lectio'],
  gradual: ['Graduale', 'GradualeP', 'Tractus', 'Sequentia'],
  gospel: ['Evangelium'],
  offertory: ['Offertorium'],
  secret: ['Secreta'],
  preface: ['Prefatio'],
  communion: ['Communio'],
  postcommunion: ['Postcommunio'],
}

export function getSectionIdsForSlot(slot: string): string[] {
  return slotToSection[slot] ?? []
}
