import type { FlowDefinition, FlowSection, LocalizedText } from './types'

type StaticSelect = Extract<FlowSection, { type: 'select'; options: unknown }>

export type PinnableSelect = {
  key: string
  label?: LocalizedText
  options: { id: string; label: LocalizedText }[]
}

// The choices a plan slot may fix: top-level selects the flow marks `pin`.
// Nested selects are left out — a pin names what the whole row is.
export function getPinnableSelects(flow: FlowDefinition | undefined): PinnableSelect[] {
  if (!flow) return []
  return flow.sections
    .filter(
      (s): s is StaticSelect & { as: string } =>
        s.type === 'select' && 'options' in s && s.pin === true && typeof s.as === 'string',
    )
    .map((s) => ({
      key: s.as,
      label: s.label,
      options: s.options.filter((o) => o.pin !== false).map((o) => ({ id: o.id, label: o.label })),
    }))
}

// One slot per hour of an office, each pinned and set to the hour's own
// `time` — the list a plan offers to switch on and off. The select's clock
// `map` is no guide here: it answers "which hour is nearest now", so it hands
// Matins midnight. Only an hour select qualifies; the rosary stays one slot.
export function getHourSlots(
  flow: FlowDefinition | undefined,
): { pins: Record<string, string>; time?: string }[] {
  const select = flow?.sections.find(
    (s): s is StaticSelect & { as: string } =>
      s.type === 'select' && 'options' in s && s.pin === true && s.on === 'hour',
  )
  if (!select) return []
  return select.options
    .filter((o) => o.pin !== false)
    .map((o) => ({ pins: { [select.as]: o.id }, time: o.time }))
}

// Labels of the options a slot's pins name, in flow order; pins that no longer
// match an option (renamed in the corpus) are dropped.
export function getPinLabels(
  flow: FlowDefinition | undefined,
  pins: Record<string, string> | undefined,
): LocalizedText[] {
  if (!pins) return []
  return getPinnableSelects(flow).flatMap((select) => {
    const option = select.options.find((o) => o.id === pins[select.key])
    return option ? [option.label] : []
  })
}
