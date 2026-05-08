import { useEffect, useMemo, useState } from 'react'
import { type CorpusItem, collectableKinds, useCorpusRefMap } from '@/lib/corpus'
import type { CorpusKind } from '@/types/content'
import styles from './AddItemDialog.module.css'

type KindFilter = CorpusKind | 'all'

const filters: KindFilter[] = ['all', ...collectableKinds]

const filterLabel: Record<KindFilter, string> = {
  all: 'All',
  practice: 'Practices',
  prayer: 'Prayers',
  book: 'Books',
  chapter: 'Chapters',
  collection: 'Collections',
}

const MAX_RESULTS = 50

export function AddItemDialog({
  excludeRefs,
  onClose,
  onPick,
}: {
  excludeRefs: Set<string>
  onClose: () => void
  onPick: (ref: string) => void
}) {
  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const refMap = useCorpusRefMap()

  const filtered: CorpusItem[] = useMemo(() => {
    const q = search.trim().toLowerCase()
    const out: CorpusItem[] = []
    for (const c of refMap.values()) {
      if (excludeRefs.has(c.ref)) continue
      if (kindFilter !== 'all' && c.kind !== kindFilter) continue
      if (q && !c.label.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) continue
      out.push(c)
      if (out.length >= MAX_RESULTS) break
    }
    return out
  }, [refMap, excludeRefs, kindFilter, search])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: modal overlay backdrop */
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Add item</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.controls}>
          <input
            className={styles.search}
            placeholder="Search by name or id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // biome-ignore lint/a11y/noAutofocus: dialog primary input
            autoFocus
          />
          <div className={styles.filters}>
            {filters.map((k) => (
              <button
                key={k}
                type="button"
                className={`${styles.filterBtn} ${kindFilter === k ? styles.filterActive : ''}`}
                onClick={() => setKindFilter(k)}
              >
                {filterLabel[k]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.results}>
          {filtered.length === 0 && <p className={styles.empty}>No matches.</p>}
          {filtered.map((c) => (
            <button
              key={c.ref}
              type="button"
              className={styles.resultRow}
              onClick={() => onPick(c.ref)}
            >
              <span className={styles.resultIcon}>{c.icon}</span>
              <div className={styles.resultBody}>
                <span className={styles.resultLabel}>{c.label}</span>
                <code className={styles.resultRef}>{c.ref}</code>
              </div>
              <span className={styles.resultKind}>{c.kind}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
