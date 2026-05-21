// HH:mm parsing for fence times.
//
// Strict semantic validation: hours 0-23, minutes 0-59, exactly one colon.
// Callers needing the singular {hour, minute} shape (RNDA ScheduleSpec,
// expo-notifications triggers) destructure inline.

export function parseHHmm(value: string): { hours: number; minutes: number } | undefined {
  const parts = value.split(':')
  if (parts.length !== 2) return undefined
  const hours = Number.parseInt(parts[0], 10)
  const minutes = Number.parseInt(parts[1], 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return undefined
  return { hours, minutes }
}

export function isValidHHmm(value: string): boolean {
  return parseHHmm(value) !== undefined
}
