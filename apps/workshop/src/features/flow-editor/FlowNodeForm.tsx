import { LocalizedInput } from '@/components/LocalizedInput'
import type { FlowSection, LocalizedText } from '@/types/content'
import styles from './FlowNodeForm.module.css'

const allTypes = [
  'prayer',
  'heading',
  'subheading',
  'rubric',
  'divider',
  'meditation',
  'image',
  'select',
  'repeat',
  'cycle',
  'options',
  'lectio',
  'proper',
  'prose',
  'psalmody',
  'hymn',
  'canticle',
  'response',
  'fragment',
  'gallery',
  'holy-card',
] as const

function defaultSection(type: string): FlowSection {
  switch (type) {
    case 'prayer':
      return { type: 'prayer', ref: '' }
    case 'heading':
      return { type: 'heading', text: { 'en-US': '', 'pt-BR': '' } }
    case 'subheading':
      return { type: 'subheading', text: { 'en-US': '', 'pt-BR': '' } }
    case 'rubric':
      return { type: 'rubric', text: { 'en-US': '', 'pt-BR': '' } }
    case 'meditation':
      return { type: 'meditation', text: { 'en-US': '', 'pt-BR': '' } }
    case 'divider':
      return { type: 'divider' }
    case 'image':
      return { type: 'image', src: '' }
    case 'select':
      return {
        type: 'select',
        options: [{ id: 'default', label: { 'en-US': 'Default' }, sections: [] }],
      }
    case 'repeat':
      return { type: 'repeat', count: 3, sections: [] }
    case 'cycle':
      return { type: 'cycle', data: '', as: '' }
    case 'options':
      return {
        type: 'options',
        label: { 'en-US': '' },
        options: [{ id: 'default', label: { 'en-US': 'Default' }, sections: [] }],
      }
    case 'lectio':
      return { type: 'lectio', reference: '' }
    case 'proper':
      return { type: 'proper', slot: 'introit', form: 'of', description: { 'en-US': '' } }
    case 'prose':
      return { type: 'prose', file: '' }
    case 'psalmody':
      return { type: 'psalmody', psalms: [] }
    case 'hymn':
      return { type: 'hymn', ref: '' }
    case 'canticle':
      return { type: 'canticle', ref: '' }
    case 'response':
      return { type: 'response', verses: [{ v: { 'en-US': '' }, r: { 'en-US': '' } }] }
    case 'fragment':
      return { type: 'fragment', ref: '' }
    case 'gallery':
      return { type: 'gallery', items: [] }
    case 'holy-card':
      return { type: 'holy-card', image: '' }
    default:
      return { type: 'divider' }
  }
}

export function FlowNodeForm({
  section,
  path,
  onChange,
}: {
  section: FlowSection
  path: number[]
  onChange: (sec: FlowSection) => void
}) {
  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <span className={styles.pathLabel}>{path.join(' › ')}</span>
        <Field label="Type">
          <select
            className={styles.input}
            value={section.type}
            onChange={(e) => onChange(defaultSection(e.target.value))}
          >
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className={styles.body}>
        <NodeFields section={section} onChange={onChange} />
      </div>
    </div>
  )
}

function NodeFields({
  section,
  onChange,
}: {
  section: FlowSection
  onChange: (sec: FlowSection) => void
}) {
  switch (section.type) {
    case 'divider':
      return <p className={styles.hint}>No properties. Visual separator between sections.</p>

    case 'heading':
    case 'subheading':
    case 'rubric':
    case 'meditation':
      return (
        <LocalizedInput
          label="Text"
          value={(section as { text: LocalizedText }).text}
          onChange={(text) => onChange({ ...section, text } as FlowSection)}
          multiline={section.type === 'meditation' || section.type === 'rubric'}
        />
      )

    case 'prayer':
      return <PrayerFields section={section} onChange={onChange} />

    case 'hymn':
    case 'canticle':
      return <RefOrInlineFields section={section} onChange={onChange} type={section.type} />

    case 'image':
      return <ImageFields section={section} onChange={onChange} />

    case 'select':
      return <SelectFields section={section} onChange={onChange} />

    case 'repeat':
      return <RepeatFields section={section} onChange={onChange} />

    case 'cycle':
      return <CycleFields section={section} onChange={onChange} />

    case 'options':
      return <OptionsFields section={section} onChange={onChange} />

    case 'lectio':
      return <LectioFields section={section} onChange={onChange} />

    case 'proper':
      return <ProperFields section={section} onChange={onChange} />

    case 'prose':
      return <ProseFields section={section} onChange={onChange} />

    case 'psalmody':
      return <PsalmodyFields section={section} onChange={onChange} />

    case 'response':
      return <ResponseFields section={section} onChange={onChange} />

    case 'fragment':
      return (
        <Field label="Fragment ref">
          <input
            className={styles.input}
            value={section.ref}
            onChange={(e) => onChange({ ...section, ref: e.target.value })}
            placeholder="fragment-name"
          />
        </Field>
      )

    case 'gallery':
      return <GalleryFields section={section} onChange={onChange} />

    case 'holy-card':
      return <HolyCardFields section={section} onChange={onChange} />

    default:
      return (
        <p className={styles.hint}>Unknown section type: {(section as { type: string }).type}</p>
      )
  }
}

function PrayerFields({
  section,
  onChange,
}: {
  section: FlowSection
  onChange: (s: FlowSection) => void
}) {
  const mode =
    'ref' in section && typeof (section as { ref?: string }).ref === 'string'
      ? 'ref'
      : 'inline' in section
        ? 'inline'
        : 'titled'

  return (
    <>
      <Field label="Mode">
        <div className={styles.radioGroup}>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={mode === 'ref'}
              onChange={() => onChange({ type: 'prayer', ref: '' })}
            />
            Reference
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={mode === 'inline'}
              onChange={() => onChange({ type: 'prayer', inline: { 'en-US': '' } })}
            />
            Inline
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={mode === 'titled'}
              onChange={() => onChange({ type: 'prayer', title: { 'en-US': '' }, sections: [] })}
            />
            Titled (with subsections)
          </label>
        </div>
      </Field>

      {mode === 'ref' && (
        <Field label="Prayer ref">
          <input
            className={styles.input}
            value={(section as { ref: string }).ref}
            onChange={(e) => onChange({ type: 'prayer', ref: e.target.value })}
            placeholder="e.g. our-father or ember-default:sign-of-cross"
          />
        </Field>
      )}

      {mode === 'inline' && (
        <>
          {'speaker' in section && (
            <Field label="Speaker">
              <select
                className={styles.input}
                value={(section as { speaker?: string }).speaker ?? ''}
                onChange={(e) =>
                  onChange({ ...section, speaker: e.target.value || undefined } as FlowSection)
                }
              >
                <option value="">None</option>
                <option value="priest">Priest</option>
                <option value="people">People</option>
                <option value="all">All</option>
              </select>
            </Field>
          )}
          <LocalizedInput
            label="Text"
            value={(section as { inline: LocalizedText }).inline}
            onChange={(inline) => onChange({ ...section, inline } as FlowSection)}
            multiline
          />
        </>
      )}

      {mode === 'titled' && (
        <LocalizedInput
          label="Title"
          value={(section as { title: LocalizedText }).title}
          onChange={(title) => onChange({ ...section, title } as FlowSection)}
        />
      )}
    </>
  )
}

function RefOrInlineFields({
  section,
  onChange,
  type,
}: {
  section: FlowSection
  onChange: (s: FlowSection) => void
  type: string
}) {
  const isRef = 'ref' in section

  return (
    <>
      <Field label="Mode">
        <div className={styles.radioGroup}>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={isRef}
              onChange={() => onChange({ type, ref: '' } as FlowSection)}
            />
            Reference
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={!isRef}
              onChange={() => onChange({ type, inline: { 'en-US': '' } } as FlowSection)}
            />
            Inline
          </label>
        </div>
      </Field>
      {isRef ? (
        <Field label="Ref">
          <input
            className={styles.input}
            value={(section as { ref: string }).ref}
            onChange={(e) => onChange({ type, ref: e.target.value } as FlowSection)}
          />
        </Field>
      ) : (
        <LocalizedInput
          label="Text"
          value={(section as { inline: LocalizedText }).inline}
          onChange={(inline) => onChange({ type, inline } as FlowSection)}
          multiline
        />
      )}
    </>
  )
}

function ImageFields({
  section,
  onChange,
}: {
  section: Extract<FlowSection, { type: 'image' }>
  onChange: (s: FlowSection) => void
}) {
  return (
    <>
      <Field label="Source">
        <input
          className={styles.input}
          value={section.src}
          onChange={(e) => onChange({ ...section, src: e.target.value })}
        />
      </Field>
      <LocalizedInput
        label="Caption"
        value={section.caption ?? {}}
        onChange={(caption) => onChange({ ...section, caption })}
      />
      <LocalizedInput
        label="Attribution"
        value={section.attribution ?? {}}
        onChange={(attribution) => onChange({ ...section, attribution })}
      />
    </>
  )
}

function SelectFields({
  section,
  onChange,
}: {
  section: Extract<FlowSection, { type: 'select' }>
  onChange: (s: FlowSection) => void
}) {
  function updateOption(idx: number, patch: Partial<(typeof section.options)[0]>) {
    const next = [...section.options]
    const current = next[idx]
    if (!current) return
    next[idx] = { ...current, ...patch }
    onChange({ ...section, options: next })
  }

  return (
    <>
      <Field label="Auto-select on">
        <input
          className={styles.input}
          value={Array.isArray(section.on) ? section.on.join(', ') : (section.on ?? '')}
          onChange={(e) => {
            const val = e.target.value.trim()
            if (!val) {
              onChange({ ...section, on: undefined })
              return
            }
            const parts = val
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
            onChange({ ...section, on: parts.length === 1 ? parts[0] : parts })
          }}
          placeholder="e.g. dayOfWeek, timeOfDay, liturgicalSeason"
        />
      </Field>
      <Field label="Bind as variable">
        <input
          className={styles.input}
          value={section.as ?? ''}
          onChange={(e) => onChange({ ...section, as: e.target.value || undefined })}
          placeholder="variable name"
        />
      </Field>
      <LocalizedInput
        label="Label (shows picker if set)"
        value={section.label ?? {}}
        onChange={(label) =>
          onChange({ ...section, label: Object.values(label).some((v) => v) ? label : undefined })
        }
      />
      <Field label="Default option">
        <input
          className={styles.input}
          value={section.default ?? ''}
          onChange={(e) => onChange({ ...section, default: e.target.value || undefined })}
          placeholder="option id"
        />
      </Field>

      <div className={styles.subSection}>
        <span className={styles.subTitle}>Map (context value → option id)</span>
        <MapInput
          value={section.map ?? {}}
          onChange={(map) =>
            onChange({ ...section, map: Object.keys(map).length > 0 ? map : undefined })
          }
          keyPlaceholder="context value"
          valuePlaceholder="option id"
        />
      </div>

      <div className={styles.subSection}>
        <div className={styles.subHeader}>
          <span className={styles.subTitle}>Options</span>
          <button
            type="button"
            className={styles.smallAdd}
            onClick={() =>
              onChange({
                ...section,
                options: [
                  ...section.options,
                  {
                    id: `option-${section.options.length + 1}`,
                    label: { 'en-US': '' },
                    sections: [],
                  },
                ],
              })
            }
          >
            + Add
          </button>
        </div>
        {section.options.map((opt, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
          <div key={idx} className={styles.optionCard}>
            <div className={styles.optionHeader}>
              <input
                className={styles.smallInput}
                value={opt.id}
                onChange={(e) => updateOption(idx, { id: e.target.value })}
                placeholder="option id"
              />
              <button
                type="button"
                className={styles.removeSmall}
                onClick={() =>
                  onChange({ ...section, options: section.options.filter((_, i) => i !== idx) })
                }
              >
                ×
              </button>
            </div>
            <LocalizedInput
              label="Label"
              value={opt.label}
              onChange={(label) => updateOption(idx, { label })}
            />
            <p className={styles.hint}>{opt.sections?.length ?? 0} child sections (edit in tree)</p>
          </div>
        ))}
      </div>
    </>
  )
}

function RepeatFields({
  section,
  onChange,
}: {
  section: FlowSection
  onChange: (s: FlowSection) => void
}) {
  const hasFrom = 'from' in section
  const sec = section as { type: 'repeat'; count?: number; from?: string; sections: FlowSection[] }

  return (
    <>
      <Field label="Mode">
        <div className={styles.radioGroup}>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={!hasFrom}
              onChange={() =>
                onChange({ type: 'repeat', count: sec.count ?? 3, sections: sec.sections })
              }
            />
            Fixed count
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={hasFrom}
              onChange={() =>
                onChange({
                  type: 'repeat',
                  from: '',
                  count: sec.count,
                  sections: sec.sections,
                } as FlowSection)
              }
            />
            From data
          </label>
        </div>
      </Field>
      <Field label="Count">
        <input
          className={styles.input}
          type="number"
          min={1}
          value={sec.count ?? ''}
          onChange={(e) =>
            onChange({ ...section, count: Number(e.target.value) || undefined } as FlowSection)
          }
          placeholder={hasFrom ? 'optional (all entries)' : 'required'}
        />
      </Field>
      {hasFrom && (
        <Field label="From (data key or {{variable}})">
          <input
            className={styles.input}
            value={sec.from ?? ''}
            onChange={(e) => onChange({ ...section, from: e.target.value } as FlowSection)}
            placeholder="e.g. joyful or {{mysteries}}"
          />
        </Field>
      )}
      <p className={styles.hint}>
        Child sections: {sec.sections.length} (edit in tree). Use {'{{ordinal}}'}, {'{{name}}'},
        etc. in children for template substitution.
      </p>
    </>
  )
}

function CycleFields({
  section,
  onChange,
}: {
  section: Extract<FlowSection, { type: 'cycle' }>
  onChange: (s: FlowSection) => void
}) {
  return (
    <>
      <Field label="Data source">
        <input
          className={styles.input}
          value={section.data}
          onChange={(e) => onChange({ ...section, data: e.target.value })}
          placeholder="data file name"
        />
      </Field>
      <Field label="Index key">
        <select
          className={styles.input}
          value={section.key ?? ''}
          onChange={(e) => onChange({ ...section, key: e.target.value || undefined })}
        >
          <option value="">Default (day-of-month)</option>
          <option value="day-of-month">day-of-month</option>
          <option value="day-of-week">day-of-week</option>
          <option value="fixed">fixed</option>
          <option value="program-day">program-day</option>
        </select>
      </Field>
      <Field label="Bind as">
        <input
          className={styles.input}
          value={section.as}
          onChange={(e) => onChange({ ...section, as: e.target.value })}
          placeholder="variable name"
        />
      </Field>
    </>
  )
}

function OptionsFields({
  section,
  onChange,
}: {
  section: FlowSection
  onChange: (s: FlowSection) => void
}) {
  if ('from' in section) {
    const sec = section as {
      type: 'options'
      label: LocalizedText
      from: string
      sections: FlowSection[]
    }
    return (
      <>
        <LocalizedInput
          label="Label"
          value={sec.label}
          onChange={(label) => onChange({ ...section, label } as FlowSection)}
        />
        <Field label="From (resolved data key)">
          <input
            className={styles.input}
            value={sec.from}
            onChange={(e) => onChange({ ...section, from: e.target.value } as FlowSection)}
            placeholder="e.g. meditations"
          />
        </Field>
        <p className={styles.hint}>{sec.sections.length} template sections (edit in tree).</p>
      </>
    )
  }

  const sec = section as Extract<FlowSection, { type: 'options'; options: unknown[] }>
  return (
    <>
      <LocalizedInput
        label="Label"
        value={sec.label}
        onChange={(label) => onChange({ ...section, label } as FlowSection)}
      />
      <p className={styles.hint}>{sec.options.length} options (edit in tree).</p>
    </>
  )
}

function LectioFields({
  section,
  onChange,
}: {
  section: FlowSection
  onChange: (s: FlowSection) => void
}) {
  const isTrack = 'track' in section
  const sec = section as { type: 'lectio'; track?: string; reference?: string }

  return (
    <>
      <Field label="Mode">
        <div className={styles.radioGroup}>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={!isTrack}
              onChange={() => onChange({ type: 'lectio', reference: '' })}
            />
            Scripture reference
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={isTrack}
              onChange={() => onChange({ type: 'lectio', track: '' })}
            />
            Reading track
          </label>
        </div>
      </Field>
      {isTrack ? (
        <Field label="Track name">
          <input
            className={styles.input}
            value={sec.track ?? ''}
            onChange={(e) => onChange({ type: 'lectio', track: e.target.value })}
            placeholder="e.g. ot-readings"
          />
        </Field>
      ) : (
        <Field label="Scripture reference">
          <input
            className={styles.input}
            value={sec.reference ?? ''}
            onChange={(e) => onChange({ type: 'lectio', reference: e.target.value })}
            placeholder="e.g. john 3:16-17 or 1-corinthians 13"
          />
        </Field>
      )}
    </>
  )
}

function ProperFields({
  section,
  onChange,
}: {
  section: Extract<FlowSection, { type: 'proper' }>
  onChange: (s: FlowSection) => void
}) {
  return (
    <>
      <Field label="Form">
        <select
          className={styles.input}
          value={section.form}
          onChange={(e) => onChange({ ...section, form: e.target.value as 'of' | 'ef' })}
        >
          <option value="of">Ordinary Form (OF)</option>
          <option value="ef">Extraordinary Form (EF)</option>
        </select>
      </Field>
      <Field label="Slot">
        <select
          className={styles.input}
          value={section.slot}
          onChange={(e) => onChange({ ...section, slot: e.target.value })}
        >
          <option value="introit">Introit</option>
          <option value="collect">Collect</option>
          <option value="epistle">Epistle</option>
          <option value="gradual">Gradual</option>
          <option value="alleluia">Alleluia</option>
          <option value="tract">Tract</option>
          <option value="sequence">Sequence</option>
          <option value="gospel">Gospel</option>
          <option value="offertory">Offertory</option>
          <option value="secret">Secret</option>
          <option value="communion">Communion</option>
          <option value="postcommunion">Postcommunion</option>
        </select>
      </Field>
      <LocalizedInput
        label="Description"
        value={section.description}
        onChange={(description) => onChange({ ...section, description })}
      />
    </>
  )
}

function ProseFields({
  section,
  onChange,
}: {
  section: FlowSection
  onChange: (s: FlowSection) => void
}) {
  const isFile = 'file' in section
  const sec = section as {
    type: 'prose'
    file?: string
    book?: string
    chapter?: string
    langPolicy?: string
  }

  return (
    <>
      <Field label="Mode">
        <div className={styles.radioGroup}>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={isFile}
              onChange={() => onChange({ type: 'prose', file: '' })}
            />
            File path
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={!isFile}
              onChange={() => onChange({ type: 'prose', book: '', chapter: '' } as FlowSection)}
            />
            Book chapter
          </label>
        </div>
      </Field>
      {isFile ? (
        <Field label="File">
          <input
            className={styles.input}
            value={sec.file ?? ''}
            onChange={(e) => onChange({ type: 'prose', file: e.target.value })}
            placeholder="sections/intro"
          />
        </Field>
      ) : (
        <>
          <Field label="Book ID">
            <input
              className={styles.input}
              value={sec.book ?? ''}
              onChange={(e) => onChange({ ...section, book: e.target.value } as FlowSection)}
              placeholder="e.g. montfort-true-devotion"
            />
          </Field>
          <Field label="Chapter ID">
            <input
              className={styles.input}
              value={sec.chapter ?? ''}
              onChange={(e) => onChange({ ...section, chapter: e.target.value } as FlowSection)}
              placeholder="e.g. preface or {{chapterId}}"
            />
          </Field>
          <Field label="Language Policy">
            <select
              className={styles.input}
              value={sec.langPolicy ?? ''}
              onChange={(e) =>
                onChange({ ...section, langPolicy: e.target.value || undefined } as FlowSection)
              }
            >
              <option value="">Default (active language)</option>
              <option value="active-language">Active Language</option>
              <option value="fallback-content-language">Fallback Content Language</option>
              <option value="book-default">Book Default</option>
            </select>
          </Field>
        </>
      )}
    </>
  )
}

function PsalmodyFields({
  section,
  onChange,
}: {
  section: Extract<FlowSection, { type: 'psalmody' }>
  onChange: (s: FlowSection) => void
}) {
  return (
    <Field label="Psalms (comma-separated numbers or refs)">
      <input
        className={styles.input}
        value={section.psalms.join(', ')}
        onChange={(e) => {
          const psalms = e.target.value
            .split(',')
            .map((s) => {
              const trimmed = s.trim()
              const num = Number(trimmed)
              return Number.isNaN(num) ? trimmed : num
            })
            .filter((v) => v !== '' && v !== 0)
          onChange({ ...section, psalms })
        }}
        placeholder="e.g. 23, 51, 150"
      />
    </Field>
  )
}

function ResponseFields({
  section,
  onChange,
}: {
  section: Extract<FlowSection, { type: 'response' }>
  onChange: (s: FlowSection) => void
}) {
  function updateVerse(idx: number, field: 'v' | 'r', value: LocalizedText) {
    const next = [...section.verses]
    const current = next[idx]
    if (!current) return
    next[idx] = { ...current, [field]: value }
    onChange({ ...section, verses: next })
  }

  return (
    <>
      {section.verses.map((verse, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
        <div key={idx} className={styles.verseCard}>
          <div className={styles.verseHeader}>
            <span className={styles.verseLabel}>Verse {idx + 1}</span>
            <button
              type="button"
              className={styles.removeSmall}
              onClick={() =>
                onChange({ ...section, verses: section.verses.filter((_, i) => i !== idx) })
              }
            >
              ×
            </button>
          </div>
          <LocalizedInput label="V." value={verse.v} onChange={(v) => updateVerse(idx, 'v', v)} />
          <LocalizedInput label="R." value={verse.r} onChange={(r) => updateVerse(idx, 'r', r)} />
        </div>
      ))}
      <button
        type="button"
        className={styles.smallAdd}
        onClick={() =>
          onChange({
            ...section,
            verses: [...section.verses, { v: { 'en-US': '' }, r: { 'en-US': '' } }],
          })
        }
      >
        + Add verse
      </button>
    </>
  )
}

function GalleryFields({
  section,
  onChange,
}: {
  section: Extract<FlowSection, { type: 'gallery' }>
  onChange: (s: FlowSection) => void
}) {
  function updateItem(idx: number, patch: Partial<(typeof section.items)[0]>) {
    const next = [...section.items]
    const current = next[idx]
    if (!current) return
    next[idx] = { ...current, ...patch }
    onChange({ ...section, items: next })
  }

  return (
    <>
      {section.items.map((item, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
        <div key={idx} className={styles.optionCard}>
          <Field label="Source">
            <input
              className={styles.input}
              value={item.src}
              onChange={(e) => updateItem(idx, { src: e.target.value })}
            />
          </Field>
          <LocalizedInput
            label="Title"
            value={item.title ?? {}}
            onChange={(title) => updateItem(idx, { title })}
          />
          <LocalizedInput
            label="Caption"
            value={item.caption ?? {}}
            onChange={(caption) => updateItem(idx, { caption })}
          />
          <button
            type="button"
            className={styles.removeSmall}
            onClick={() =>
              onChange({ ...section, items: section.items.filter((_, i) => i !== idx) })
            }
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className={styles.smallAdd}
        onClick={() => onChange({ ...section, items: [...section.items, { src: '' }] })}
      >
        + Add item
      </button>
    </>
  )
}

function HolyCardFields({
  section,
  onChange,
}: {
  section: Extract<FlowSection, { type: 'holy-card' }>
  onChange: (s: FlowSection) => void
}) {
  return (
    <>
      <Field label="Image">
        <input
          className={styles.input}
          value={section.image}
          onChange={(e) => onChange({ ...section, image: e.target.value })}
        />
      </Field>
      <LocalizedInput
        label="Title"
        value={section.title ?? {}}
        onChange={(title) => onChange({ ...section, title })}
      />
      <LocalizedInput
        label="Attribution"
        value={section.attribution ?? {}}
        onChange={(attribution) => onChange({ ...section, attribution })}
      />
      <LocalizedInput
        label="Prayer"
        value={section.prayer ?? {}}
        onChange={(prayer) => onChange({ ...section, prayer })}
        multiline
      />
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: children always contain an input or select
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

function MapInput({
  value,
  onChange,
  keyPlaceholder,
  valuePlaceholder,
}: {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
  keyPlaceholder: string
  valuePlaceholder: string
}) {
  const entries = Object.entries(value)
  return (
    <div className={styles.mapEditor}>
      {entries.map(([k, v], idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
        <div key={idx} className={styles.mapRow}>
          <input
            className={styles.smallInput}
            value={k}
            placeholder={keyPlaceholder}
            onChange={(e) => {
              const next = { ...value }
              delete next[k]
              next[e.target.value] = v
              onChange(next)
            }}
          />
          <span>→</span>
          <input
            className={styles.smallInput}
            value={v}
            placeholder={valuePlaceholder}
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
          />
          <button
            type="button"
            className={styles.removeSmall}
            onClick={() => {
              const next = { ...value }
              delete next[k]
              onChange(next)
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className={styles.smallAdd}
        onClick={() => onChange({ ...value, '': '' })}
      >
        + Add
      </button>
    </div>
  )
}
