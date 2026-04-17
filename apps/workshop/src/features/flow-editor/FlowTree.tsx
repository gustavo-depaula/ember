import { loc } from '@/lib/localize'
import type { FlowSection, LocalizedText } from '@/types/content'
import styles from './FlowTree.module.css'

function sectionSummary(sec: FlowSection): string {
  const t = (text: unknown) => loc(text as LocalizedText | string | undefined, 50)
  switch (sec.type) {
    case 'prayer':
      if ('ref' in sec) return sec.ref
      if ('inline' in sec) return t((sec as { inline: LocalizedText }).inline)
      if ('title' in sec) return t((sec as { title: LocalizedText }).title)
      return ''
    case 'heading':
    case 'subheading':
    case 'rubric':
    case 'meditation':
      return t((sec as { text: LocalizedText }).text)
    case 'select':
      return `on: ${sec.on ?? 'manual'} (${sec.options.length} options)`
    case 'repeat':
      if ('from' in sec) return `from: ${sec.from} ×${sec.count ?? '∞'}`
      return `×${sec.count}`
    case 'cycle':
      return `data: ${sec.data}, as: ${sec.as}`
    case 'options':
      if ('from' in sec) return `from: ${sec.from}`
      return `${sec.options.length} options`
    case 'lectio':
      if ('track' in sec) return `track: ${sec.track}`
      return `ref: ${(sec as { reference: string }).reference}`
    case 'proper':
      return `${sec.form} / ${sec.slot}`
    case 'prose':
      if ('file' in sec) return sec.file
      if ('book' in sec) return `${sec.book}:${sec.chapter}`
      return ''
    case 'psalmody':
      return sec.psalms.join(', ')
    case 'hymn':
      if ('ref' in sec) return sec.ref
      return 'inline'
    case 'canticle':
      if ('ref' in sec) return sec.ref
      return 'inline'
    case 'response':
      return `${sec.verses.length} verses`
    case 'fragment':
      return sec.ref
    case 'image':
      return sec.src
    case 'gallery':
      return `${sec.items.length} items`
    case 'holy-card':
      return t((sec as { title?: LocalizedText }).title)
    case 'divider':
      return ''
    default:
      return ''
  }
}

const typeBadgeColor: Record<string, string> = {
  prayer: '#2d6a4f',
  heading: '#3d5a80',
  subheading: '#3d5a80',
  rubric: '#b83a3a',
  divider: '#9a8d7f',
  select: '#5b2c6f',
  repeat: '#5b2c6f',
  cycle: '#5b2c6f',
  options: '#5b2c6f',
  meditation: '#6b5d4f',
  lectio: '#c9a84c',
  proper: '#c9a84c',
  prose: '#c9a84c',
  psalmody: '#c9a84c',
  hymn: '#2d6a4f',
  canticle: '#2d6a4f',
  response: '#2d6a4f',
  fragment: '#d4883a',
  image: '#3d5a80',
  gallery: '#3d5a80',
  'holy-card': '#3d5a80',
}

function getChildren(sec: FlowSection): { label?: string; sections: FlowSection[] }[] {
  switch (sec.type) {
    case 'select':
      return sec.options.map((opt) => ({
        label: `${opt.id}: ${loc(opt.label)}`,
        sections: opt.sections ?? [],
      }))
    case 'options':
      if ('options' in sec && Array.isArray(sec.options)) {
        return sec.options.map((opt) => ({
          label: `${opt.id}: ${loc(opt.label)}`,
          sections: opt.sections,
        }))
      }
      if ('sections' in sec) return [{ sections: sec.sections }]
      return []
    case 'repeat':
      return [{ sections: sec.sections }]
    case 'prayer':
      if ('sections' in sec && Array.isArray(sec.sections)) {
        return [{ sections: sec.sections }]
      }
      return []
    case 'cycle':
      if (sec.sections) return [{ sections: sec.sections }]
      return []
    default:
      return []
  }
}

export function FlowTree({
  sections,
  selectedPath,
  onSelect,
  onInsert,
  onRemove,
  onMove,
  basePath = [],
}: {
  sections: FlowSection[]
  selectedPath: number[] | undefined
  onSelect: (path: number[]) => void
  onInsert: (path: number[]) => void
  onRemove: (path: number[]) => void
  onMove: (path: number[], direction: -1 | 1) => void
  basePath?: number[]
}) {
  return (
    <div className={styles.tree}>
      {sections.map((sec, idx) => {
        const path = [...basePath, idx]
        const isSelected =
          selectedPath !== undefined &&
          selectedPath.length === path.length &&
          selectedPath.every((v, i) => v === path[i])
        const children = getChildren(sec)
        const summary = sectionSummary(sec)

        return (
          /* biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list */
          <div key={idx} className={styles.nodeWrapper}>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: contains nested buttons */}
            {/* biome-ignore lint/a11y/useSemanticElements: contains nested interactive elements */}
            <div
              role="button"
              tabIndex={0}
              className={`${styles.node} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelect(path)}
            >
              <span
                className={styles.badge}
                style={{ backgroundColor: typeBadgeColor[sec.type] ?? '#6b5d4f' }}
              >
                {sec.type}
              </span>
              {summary && <span className={styles.summary}>{summary}</span>}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMove(path, -1)
                  }}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMove(path, 1)
                  }}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    onInsert([...basePath, idx + 1])
                  }}
                  title="Insert after"
                >
                  +
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.removeAction}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(path)
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
            {children.map((child, ci) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: read-only rendered list
              <div key={ci} className={styles.childGroup}>
                {child.label && <span className={styles.childLabel}>{child.label}</span>}
                <FlowTree
                  sections={child.sections}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                  onInsert={onInsert}
                  onRemove={onRemove}
                  onMove={onMove}
                  basePath={[...path, ci]}
                />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
