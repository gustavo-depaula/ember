export function composeSlotKey(practiceId: string, slotId: string): string {
  return `${practiceId}::${slotId}`
}

export function parseSlotKey(key: string): { practiceId: string; slotId: string } {
  const sep = key.indexOf('::')
  if (sep === -1) return { practiceId: key, slotId: 'default' }
  return { practiceId: key.slice(0, sep), slotId: key.slice(sep + 2) }
}
