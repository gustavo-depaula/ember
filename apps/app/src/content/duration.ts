import type { PracticeDuration } from './manifestTypes'

/** Minutes a practice takes: one figure, or the span it falls in when what decides it isn't known here. */
export type MinutesSpan = { min: number; max: number }

// What a manifest and its catalog entry say about time. The entry carries an
// office's hours as their span alone.
type Timed = {
  estimatedMinutes?: number
  hourMinutes?: Record<string, number>
  minutesRange?: [number, number]
  duration?: PracticeDuration
}

export type DurationContext = {
  /** The length the plan keeps for a practice whose length is the person's to set. */
  chosen?: number
  /** The hour prayed, by its option id in the flow's hour select. */
  hour?: string
  /** The day it is prayed on, and whether that day is of obligation. */
  date?: Date
  holyDay?: boolean
}

/**
 * How long a practice takes as it is prayed here: the length its person set,
 * the Mass of this day, the hour chosen. Whatever the context leaves open comes
 * back as a span (the breviary with no hour: its shortest hour to its longest).
 */
export function practiceMinutes(
  practice: Timed | undefined,
  { chosen, hour, date, holyDay }: DurationContext = {},
): MinutesSpan | undefined {
  if (!practice) return undefined
  const { duration } = practice
  if (duration?.type === 'chosen') return exactly(chosen ?? duration.default)
  if (duration?.type === 'by-day') {
    if (!date) return { min: duration.weekday, max: duration.sunday }
    return exactly(date.getDay() === 0 || holyDay ? duration.sunday : duration.weekday)
  }
  const ofHour = hour ? practice.hourMinutes?.[hour] : undefined
  if (ofHour !== undefined) return exactly(ofHour)
  const hours = Object.values(practice.hourMinutes ?? {})
  if (hours.length > 0) return { min: Math.min(...hours), max: Math.max(...hours) }
  if (practice.minutesRange) return { min: practice.minutesRange[0], max: practice.minutesRange[1] }
  return practice.estimatedMinutes ? exactly(practice.estimatedMinutes) : undefined
}

/**
 * The label of a length: "15 min", "1h15" from an hour up, "7–27 min" or
 * "40 min–1h15" for a span. Written the same in every language the app has.
 */
export function minutesText(span: MinutesSpan | undefined): string | undefined {
  if (!span) return undefined
  if (span.min === span.max) return lengthText(span.min)
  if (span.max < 60) return `${span.min}–${span.max} min`
  return `${lengthText(span.min)}–${lengthText(span.max)}`
}

function lengthText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const rest = minutes % 60
  return `${Math.floor(minutes / 60)}h${rest ? String(rest).padStart(2, '0') : ''}`
}

const exactly = (minutes: number): MinutesSpan => ({ min: minutes, max: minutes })
