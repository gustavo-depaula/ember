import type {
  BilingualText,
  EngineContext,
  FlowContext,
  PrayerAsset,
  RenderedSection,
} from '@ember/content-engine'
import { resolveFlow } from '@ember/content-engine'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import * as api from '@/fs/contentFs'
import type { FlowDefinition } from '@/types/content'
import styles from './FlowPreview.module.css'

export function FlowPreview({ libraryId, flow }: { libraryId: string; flow: FlowDefinition }) {
  const [previewDate, setPreviewDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [primaryLang, setPrimaryLang] = useState<'en-US' | 'pt-BR' | 'la'>('en-US')
  const [secondaryLang, setSecondaryLang] = useState<'en-US' | 'pt-BR' | 'la' | 'none'>('pt-BR')

  const { data: lib } = useQuery({
    queryKey: ['library', libraryId],
    queryFn: () => api.getLibrary(libraryId),
  })

  const engineContext = useMemo((): EngineContext | undefined => {
    if (!lib) return undefined

    const prayerMap = new Map<string, PrayerAsset>()
    for (const p of lib._prayers) {
      if (!p.id) continue
      prayerMap.set(p.id, {
        title: (p.title ?? {}) as Record<string, string>,
        body: Array.isArray(p.body) ? p.body : [],
      } as PrayerAsset)
    }

    const prayers = new Proxy({} as Record<string, PrayerAsset>, {
      get(_, key: string) {
        return prayerMap.get(key)
      },
      has(_, key: string) {
        return prayerMap.has(key)
      },
    })

    const localizeUI = (text: Record<string, string | undefined>): string => {
      return (
        text[primaryLang] ??
        text['en-US'] ??
        text['pt-BR'] ??
        Object.values(text).find((v) => v) ??
        ''
      )
    }

    const localize = (
      text: string | Record<string, string | undefined>,
    ): { primary: string; secondary?: string } => {
      if (typeof text === 'string') return { primary: text }
      const primary = text[primaryLang] ?? text['en-US'] ?? text['pt-BR'] ?? ''
      const secondary = secondaryLang !== 'none' ? text[secondaryLang] : undefined
      return secondary ? { primary, secondary } : { primary }
    }

    return {
      language: primaryLang,
      contentLanguage: primaryLang,
      localize,
      localizeUI,
      t: (key: string) => key,
      parsePsalmRef: (ref: number | string) =>
        ({
          book: 'psalms',
          chapter: typeof ref === 'number' ? ref : 1,
          numbering: 'hebrew',
        }) as never,
      parseTrackEntry: () => [],
      prayers,
      canticles: {},
      prose: {},
      loadBookChapterText: () => undefined,
      getBookChapterTitle: () => undefined,
    } as EngineContext
  }, [lib, primaryLang, secondaryLang])

  const resolved = useMemo(() => {
    if (!engineContext) return []
    try {
      const ctx: FlowContext = {
        date: new Date(`${previewDate}T12:00:00`),
      }
      return resolveFlow(flow, ctx, engineContext)
    } catch (err) {
      console.error('Flow resolution error:', err)
      return [{ type: 'rubric' as const, label: { primary: `Error: ${err}` } }]
    }
  }, [flow, engineContext, previewDate])

  return (
    <div className={styles.preview}>
      <div className={styles.controls}>
        <label className={styles.control}>
          <span>Date</span>
          <input
            type="date"
            className={styles.controlInput}
            value={previewDate}
            onChange={(e) => setPreviewDate(e.target.value)}
          />
        </label>
        <label className={styles.control}>
          <span>Primary</span>
          <select
            className={styles.controlInput}
            value={primaryLang}
            onChange={(e) => setPrimaryLang(e.target.value as 'en-US' | 'pt-BR' | 'la')}
          >
            <option value="en-US">English</option>
            <option value="pt-BR">Portugues</option>
            <option value="la">Latin</option>
          </select>
        </label>
        <label className={styles.control}>
          <span>Secondary</span>
          <select
            className={styles.controlInput}
            value={secondaryLang}
            onChange={(e) => setSecondaryLang(e.target.value as 'en-US' | 'pt-BR' | 'la' | 'none')}
          >
            <option value="none">None</option>
            <option value="en-US">English</option>
            <option value="pt-BR">Portugues</option>
            <option value="la">Latin</option>
          </select>
        </label>
      </div>

      <div className={styles.rendered}>
        {resolved.length === 0 && (
          <p className={styles.empty}>No sections resolved. Check the flow definition.</p>
        )}
        {resolved.map((sec, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
          <PreviewSection key={idx} section={sec} />
        ))}
      </div>
    </div>
  )
}

// ── Bilingual text rendering (matches app's BilingualBlock) ──

function Bilingual({ text, className }: { text: BilingualText; className?: string }) {
  return (
    <div className={className}>
      <div className={styles.bilingualPrimary}>{text.primary}</div>
      {text.secondary && <div className={styles.bilingualSecondary}>{text.secondary}</div>}
    </div>
  )
}

// ── Section renderer (matches app's SectionBlock) ──

function PreviewSection({ section }: { section: RenderedSection }) {
  switch (section.type) {
    case 'divider':
      return (
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
        </div>
      )

    case 'heading':
      return (
        <div className={styles.heading}>
          {section.text.primary}
          {section.text.secondary && (
            <>
              {' '}
              <span className={styles.bilingualSecondary}>{section.text.secondary}</span>
            </>
          )}
        </div>
      )

    case 'subheading':
      return (
        <div className={styles.subheading}>
          {section.text.primary}
          {section.text.secondary && (
            <>
              {' '}
              <span className={styles.bilingualSecondary}>{section.text.secondary}</span>
            </>
          )}
        </div>
      )

    case 'rubric':
      return <p className={styles.rubric}>{section.label.primary}</p>

    case 'meditation':
      return (
        <div className={styles.meditation}>
          {section.text.primary}
          {section.text.secondary && (
            <div className={styles.bilingualSecondary}>{section.text.secondary}</div>
          )}
        </div>
      )

    case 'prayer':
      return <PrayerBlock section={section} />

    case 'response':
      return (
        <div className={styles.responseBlock}>
          {section.verses.map((v, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
            <div key={i} className={styles.versePair}>
              <div className={styles.versicleRow}>
                <span className={styles.versicleSymbol} aria-hidden>
                  ℣.
                </span>
                <div style={{ flex: 1 }}>
                  <Bilingual text={v.v} />
                </div>
              </div>
              <div className={styles.responseRow}>
                <span className={styles.responseSymbol} aria-hidden>
                  ℟.
                </span>
                <div style={{ flex: 1 }} className={styles.responseText}>
                  <Bilingual text={v.r} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )

    case 'select':
      return <SelectBlock section={section} />

    case 'options':
      return (
        <div className={styles.optionsBlock}>
          <div className={styles.selectLabel}>{section.label.primary}</div>
          {section.options.map((opt) => (
            <div key={opt.id} className={styles.optionGroup}>
              <div className={styles.optionLabel}>{opt.label.primary}</div>
              {opt.sections.map((sub, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
                <PreviewSection key={i} section={sub} />
              ))}
            </div>
          ))}
        </div>
      )

    case 'prose':
      return <Bilingual text={section.text} className={styles.proseBlock} />

    case 'image':
      return (
        <div className={styles.imageBlock}>
          <span className={styles.imagePlaceholder}>[Image: {section.src}]</span>
          {section.caption && <span className={styles.caption}>{section.caption.primary}</span>}
          {section.attribution && (
            <span className={styles.attribution}>{section.attribution.primary}</span>
          )}
        </div>
      )

    case 'psalmody':
      return (
        <div className={styles.psalmBlock}>
          {section.psalms.map((p, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
            <span key={i} className={styles.psalmRef}>
              Psalm{' '}
              {typeof p === 'number'
                ? p
                : `${p.psalm}${p.verseRange ? `:${p.verseRange[0]}-${p.verseRange[1]}` : ''}`}
            </span>
          ))}
        </div>
      )

    case 'reading':
      return (
        <div className={styles.readingBlock}>
          {section.reference.type === 'bible'
            ? `[Reading: ${section.reference.book} ${section.reference.chapter}${section.reference.startVerse ? `:${section.reference.startVerse}` : ''}]`
            : `[Catechism: §${section.reference.startParagraph}–${section.reference.startParagraph + section.reference.count - 1}]`}
        </div>
      )

    case 'proper':
      return (
        <div className={styles.properBlock}>
          [Proper: {section.form.toUpperCase()} {section.slot} — {section.description.primary}]
        </div>
      )

    default:
      return <div className={styles.unknown}>[{(section as { type: string }).type}]</div>
  }
}

// ── Prayer block (matches app's CollapsiblePrayer / PrayerTextBlock) ──

function PrayerBlock({ section }: { section: Extract<RenderedSection, { type: 'prayer' }> }) {
  const [expanded, setExpanded] = useState(true)
  const hasTitle = section.title.primary
  const hasSections = section.sections && section.sections.length > 0

  if (section.speaker) {
    const isPeople = section.speaker === 'people'
    return (
      <div className={`${styles.prayerBlock} ${isPeople ? styles.liturgicalPeople : ''}`}>
        {isPeople && <span className={styles.liturgicalSpeaker}>R.</span>}
        <Bilingual text={section.text} className={isPeople ? styles.liturgicalBold : undefined} />
      </div>
    )
  }

  if (hasTitle) {
    return (
      <div className={styles.prayerBlock}>
        <button
          type="button"
          className={styles.prayerHeader}
          onClick={() => setExpanded(!expanded)}
        >
          <span
            className={styles.prayerChevron}
            style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
          >
            ▸
          </span>
          <span className={styles.prayerTitle}>{section.title.primary}</span>
          {section.count !== undefined && section.count > 1 && (
            <span className={styles.prayerCount}>×{section.count}</span>
          )}
        </button>
        {expanded && (
          <div className={styles.prayerBody}>
            {section.text.primary && <Bilingual text={section.text} />}
            {hasSections &&
              section.sections?.map((sub, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
                <PreviewSection key={i} section={sub} />
              ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.prayerBlock}>
      <Bilingual text={section.text} />
      {section.count !== undefined && section.count > 1 && (
        <span className={styles.prayerCount}>×{section.count}</span>
      )}
    </div>
  )
}

// ── Select block (matches app's SelectBlock with tab buttons) ──

function SelectBlock({ section }: { section: Extract<RenderedSection, { type: 'select' }> }) {
  const selected = section.options.find((o) => o.id === section.selectedId)

  return (
    <div className={styles.selectBlock}>
      {section.label.primary && <div className={styles.selectLabel}>{section.label.primary}</div>}
      <div className={styles.selectTabs}>
        {section.options.map((opt) => (
          <span
            key={opt.id}
            className={`${styles.selectTab} ${opt.id === section.selectedId ? styles.selectTabActive : ''}`}
          >
            {opt.label.primary}
          </span>
        ))}
      </div>
      {selected && (
        <div className={styles.selectContent}>
          {selected.sections.map((sub, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
            <PreviewSection key={i} section={sub} />
          ))}
        </div>
      )}
    </div>
  )
}
