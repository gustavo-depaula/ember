import { LocalizedInput } from '@/components/LocalizedInput'
import { iconMap } from '@/lib/icons'
import type { LocalizedText, PracticeManifest, ProgramConfig, SlotDefault } from '@/types/content'
import styles from './ManifestForm.module.css'

export function ManifestForm({
  manifest,
  onChange,
}: {
  manifest: PracticeManifest
  onChange: (m: PracticeManifest) => void
}) {
  function update(patch: Partial<PracticeManifest>) {
    onChange({ ...manifest, ...patch })
  }

  return (
    <div className={styles.form}>
      <div className={styles.columns}>
        {/* Left column: core fields */}
        <div className={styles.column}>
          <Section title="Identity">
            <Field label="ID">
              <input
                className={styles.input}
                value={manifest.id}
                onChange={(e) => update({ id: e.target.value })}
              />
            </Field>
            <LocalizedInput
              label="Name"
              value={manifest.name as LocalizedText}
              onChange={(name) => update({ name: name as PracticeManifest['name'] })}
            />
            <Field label="Icon">
              <div className={styles.iconRow}>
                <input
                  className={styles.input}
                  value={manifest.icon ?? ''}
                  onChange={(e) => update({ icon: e.target.value || undefined })}
                  placeholder="e.g. sunrise, cross, mary"
                />
                {manifest.icon && (
                  <span className={styles.iconPreview}>{iconMap[manifest.icon] ?? '?'}</span>
                )}
              </div>
            </Field>
            <Field label="Estimated Minutes">
              <input
                className={styles.input}
                type="number"
                min={1}
                value={manifest.estimatedMinutes}
                onChange={(e) => update({ estimatedMinutes: Number(e.target.value) || 1 })}
              />
            </Field>
          </Section>

          <Section title="Description">
            <LocalizedInput
              label="Description"
              value={manifest.description as LocalizedText}
              onChange={(v) => update({ description: v as PracticeManifest['description'] })}
              multiline
            />
            <LocalizedInput
              label="History"
              value={manifest.history as LocalizedText}
              onChange={(v) => update({ history: v as PracticeManifest['history'] })}
              multiline
            />
            <LocalizedInput
              label="How to Pray"
              value={manifest.howToPray as LocalizedText}
              onChange={(v) => update({ howToPray: v as PracticeManifest['howToPray'] })}
              multiline
            />
          </Section>
        </div>

        {/* Right column: behavior & scheduling */}
        <div className={styles.column}>
          <Section title="Behavior">
            <Field label="Flow Mode">
              <select
                className={styles.input}
                value={manifest.flowMode}
                onChange={(e) => update({ flowMode: e.target.value as 'scroll' | 'step' })}
              >
                <option value="scroll">Scroll</option>
                <option value="step">Step</option>
              </select>
            </Field>
            <Field label="Completion">
              <select
                className={styles.input}
                value={manifest.completion}
                onChange={(e) => update({ completion: e.target.value as 'flow-end' | 'manual' })}
              >
                <option value="flow-end">Flow End</option>
                <option value="manual">Manual</option>
              </select>
            </Field>
            <Field label="Theme">
              <select
                className={styles.input}
                value={manifest.theme ?? ''}
                onChange={(e) =>
                  update({ theme: (e.target.value || undefined) as 'office' | undefined })
                }
              >
                <option value="">Default</option>
                <option value="office">Office</option>
              </select>
            </Field>
          </Section>

          <Section title="Classification">
            <Field label="Categories">
              <TagInput
                values={manifest.categories}
                onChange={(categories) => update({ categories })}
                placeholder="Add category..."
              />
            </Field>
            <Field label="Tags">
              <TagInput
                values={manifest.tags}
                onChange={(tags) => update({ tags })}
                placeholder="Add tag..."
              />
            </Field>
          </Section>

          <Section title="Schedule Defaults">
            <SlotsEditor
              slots={manifest.defaults?.slots ?? []}
              sortOrder={manifest.defaults?.sortOrder ?? 0}
              onChange={(slots, sortOrder) => update({ defaults: { slots, sortOrder } })}
            />
          </Section>

          <Section title="Program">
            <ProgramEditor config={manifest.program} onChange={(program) => update({ program })} />
          </Section>

          <Section title="Data & Tracks">
            <Field label="Data files">
              <MapEditor
                value={manifest.data ?? {}}
                onChange={(data) =>
                  update({ data: Object.keys(data).length > 0 ? data : undefined })
                }
                placeholder="data-key"
              />
            </Field>
            <Field label="Track files">
              <MapEditor
                value={manifest.tracks ?? {}}
                onChange={(tracks) =>
                  update({ tracks: Object.keys(tracks).length > 0 ? tracks : undefined })
                }
                placeholder="track-name"
              />
            </Field>
          </Section>

          <Section title="Alternative">
            <AlternativeEditor
              value={manifest.alternativeTo}
              onChange={(alternativeTo) => update({ alternativeTo })}
            />
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className={styles.section}>
      <legend className={styles.sectionTitle}>{title}</legend>
      <div className={styles.sectionBody}>{children}</div>
    </fieldset>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </div>
  )
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = e.currentTarget.value.trim()
      if (val && !values.includes(val)) {
        onChange([...values, val])
        e.currentTarget.value = ''
      }
    }
  }

  return (
    <div className={styles.tagContainer}>
      <div className={styles.tags}>
        {values.map((v) => (
          <span key={v} className={styles.tag}>
            {v}
            <button
              type="button"
              className={styles.tagRemove}
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input className={styles.tagInput} placeholder={placeholder} onKeyDown={handleKeyDown} />
    </div>
  )
}

function SlotsEditor({
  slots,
  sortOrder,
  onChange,
}: {
  slots: SlotDefault[]
  sortOrder: number
  onChange: (slots: SlotDefault[], sortOrder: number) => void
}) {
  function updateSlot(idx: number, patch: Partial<SlotDefault>) {
    const next = [...slots]
    const current = next[idx]
    if (current) next[idx] = { ...current, ...patch }
    onChange(next, sortOrder)
  }

  function addSlot() {
    onChange([...slots, { schedule: { type: 'daily' } }], sortOrder)
  }

  function removeSlot(idx: number) {
    onChange(
      slots.filter((_, i) => i !== idx),
      sortOrder,
    )
  }

  return (
    <div className={styles.slotsEditor}>
      <Field label="Sort Order">
        <input
          className={styles.input}
          type="number"
          value={sortOrder}
          onChange={(e) => onChange(slots, Number(e.target.value) || 0)}
        />
      </Field>
      {slots.map((slot, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
        <div key={idx} className={styles.slotCard}>
          <div className={styles.slotHeader}>
            <span className={styles.slotLabel}>Slot {idx + 1}</span>
            <button type="button" className={styles.removeBtn} onClick={() => removeSlot(idx)}>
              ×
            </button>
          </div>
          <div className={styles.slotFields}>
            <Field label="Schedule Type">
              <select
                className={styles.input}
                value={slot.schedule.type}
                onChange={(e) =>
                  updateSlot(idx, {
                    schedule: { type: e.target.value } as SlotDefault['schedule'],
                  })
                }
              >
                <option value="daily">Daily</option>
                <option value="days-of-week">Days of Week</option>
                <option value="day-of-month">Day of Month</option>
                <option value="fixed-program">Fixed Program</option>
              </select>
            </Field>
            <Field label="Tier">
              <select
                className={styles.input}
                value={slot.tier ?? ''}
                onChange={(e) =>
                  updateSlot(idx, {
                    tier: (e.target.value || undefined) as SlotDefault['tier'],
                  })
                }
              >
                <option value="">None</option>
                <option value="essential">Essential</option>
                <option value="ideal">Ideal</option>
                <option value="extra">Extra</option>
              </select>
            </Field>
            <Field label="Time">
              <input
                className={styles.input}
                type="time"
                value={slot.time ?? ''}
                onChange={(e) => updateSlot(idx, { time: e.target.value || undefined })}
              />
            </Field>
            <Field label="Enabled">
              <input
                type="checkbox"
                checked={slot.enabled !== false}
                onChange={(e) => updateSlot(idx, { enabled: e.target.checked })}
              />
            </Field>
          </div>
        </div>
      ))}
      <button type="button" className={styles.addSlotBtn} onClick={addSlot}>
        + Add Slot
      </button>
    </div>
  )
}

function ProgramEditor({
  config,
  onChange,
}: {
  config: ProgramConfig | undefined
  onChange: (c: ProgramConfig | undefined) => void
}) {
  if (!config) {
    return (
      <button
        type="button"
        className={styles.addSlotBtn}
        onClick={() =>
          onChange({
            totalDays: 9,
            progressPolicy: 'continue',
            completionBehavior: 'offer-restart',
          })
        }
      >
        + Enable Program
      </button>
    )
  }

  return (
    <div className={styles.programEditor}>
      <Field label="Total Days">
        <input
          className={styles.input}
          type="number"
          min={1}
          value={config.totalDays}
          onChange={(e) => onChange({ ...config, totalDays: Number(e.target.value) || 1 })}
        />
      </Field>
      <Field label="Per-Day Flows">
        <input
          className={styles.input}
          value={config.perDayFlows ?? ''}
          onChange={(e) => onChange({ ...config, perDayFlows: e.target.value || undefined })}
          placeholder="e.g. day-flows"
        />
      </Field>
      <Field label="Progress Policy">
        <select
          className={styles.input}
          value={config.progressPolicy}
          onChange={(e) =>
            onChange({
              ...config,
              progressPolicy: e.target.value as ProgramConfig['progressPolicy'],
            })
          }
        >
          <option value="continue">Continue</option>
          <option value="wait">Wait</option>
          <option value="restart">Restart</option>
        </select>
      </Field>
      <Field label="Completion Behavior">
        <select
          className={styles.input}
          value={config.completionBehavior}
          onChange={(e) =>
            onChange({
              ...config,
              completionBehavior: e.target.value as ProgramConfig['completionBehavior'],
            })
          }
        >
          <option value="auto-disable">Auto Disable</option>
          <option value="offer-restart">Offer Restart</option>
          <option value="keep">Keep</option>
        </select>
      </Field>
      <button type="button" className={styles.removeBtn} onClick={() => onChange(undefined)}>
        Remove Program
      </button>
    </div>
  )
}

function MapEditor({
  value,
  onChange,
  placeholder,
}: {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
  placeholder: string
}) {
  const entries = Object.entries(value)

  function addEntry() {
    onChange({ ...value, '': '' })
  }

  return (
    <div className={styles.mapEditor}>
      {entries.map(([key, val], idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
        <div key={idx} className={styles.mapRow}>
          <input
            className={styles.mapInput}
            value={key}
            placeholder={placeholder}
            onChange={(e) => {
              const next = { ...value }
              delete next[key]
              next[e.target.value] = val
              onChange(next)
            }}
          />
          <span className={styles.mapArrow}>=</span>
          <input
            className={styles.mapInput}
            value={val}
            placeholder="filename"
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => {
              const next = { ...value }
              delete next[key]
              onChange(next)
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className={styles.addSlotBtn} onClick={addEntry}>
        + Add entry
      </button>
    </div>
  )
}

function AlternativeEditor({
  value,
  onChange,
}: {
  value: PracticeManifest['alternativeTo']
  onChange: (v: PracticeManifest['alternativeTo']) => void
}) {
  if (!value) {
    return (
      <button
        type="button"
        className={styles.addSlotBtn}
        onClick={() =>
          onChange({
            id: '',
            label: { 'en-US': '', 'pt-BR': '' },
            description: { 'en-US': '', 'pt-BR': '' },
          })
        }
      >
        + Set Alternative
      </button>
    )
  }

  return (
    <div className={styles.alternativeEditor}>
      <Field label="Group ID">
        <input
          className={styles.input}
          value={value.id}
          onChange={(e) => onChange({ ...value, id: e.target.value })}
        />
      </Field>
      <LocalizedInput
        label="Label"
        value={value.label as LocalizedText}
        onChange={(label) => onChange({ ...value, label: label as typeof value.label })}
      />
      <LocalizedInput
        label="Description"
        value={value.description as LocalizedText}
        onChange={(description) =>
          onChange({ ...value, description: description as typeof value.description })
        }
        multiline
      />
      <button type="button" className={styles.removeBtn} onClick={() => onChange(undefined)}>
        Remove Alternative
      </button>
    </div>
  )
}
