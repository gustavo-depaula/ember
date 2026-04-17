import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import * as api from '@/fs/contentFs'
import { iconMap } from '@/lib/icons'
import { loc } from '@/lib/localize'
import { useWorkspace } from '@/stores/workspace'
import type { LibraryManifest } from '@/types/content'
import { CreatePracticeDialog } from './CreatePracticeDialog'
import styles from './Sidebar.module.css'

function LibraryItem({
  lib,
  onCreatePractice,
}: {
  lib: LibraryManifest
  onCreatePractice: () => void
}) {
  const selectedLibrary = useWorkspace((s) => s.selectedLibrary)
  const selectLibrary = useWorkspace((s) => s.selectLibrary)
  const expanded = selectedLibrary === lib.id

  return (
    <div className={styles.libGroup}>
      <button
        type="button"
        className={`${styles.libItem} ${expanded ? styles.expanded : ''}`}
        onClick={() => selectLibrary(expanded ? undefined : lib.id)}
      >
        <span className={styles.libChevron}>{expanded ? '▾' : '▸'}</span>
        <div className={styles.libInfo}>
          <span className={styles.libName}>{loc(lib.name)}</span>
          <span className={styles.libMeta}>
            {lib.practices.length} practices
            {lib.prayers.length > 0 && ` · ${lib.prayers.length} prayers`}
            {lib.books && lib.books.length > 0 && ` · ${lib.books.length} books`}
          </span>
        </div>
      </button>
      {expanded && <LibraryContents libraryId={lib.id} onCreatePractice={onCreatePractice} />}
    </div>
  )
}

export function Sidebar() {
  const { data: libraries, isLoading } = useQuery({
    queryKey: ['libraries'],
    queryFn: api.listLibraries,
  })

  const selectedLibrary = useWorkspace((s) => s.selectedLibrary)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>Workshop</h1>
      </div>

      <div className={styles.libraryList}>
        {isLoading && <p className={styles.loading}>Loading...</p>}
        {libraries?.map((lib) => (
          <LibraryItem key={lib.id} lib={lib} onCreatePractice={() => setShowCreate(true)} />
        ))}
      </div>

      {showCreate && selectedLibrary && (
        <CreatePracticeDialog libraryId={selectedLibrary} onClose={() => setShowCreate(false)} />
      )}
    </aside>
  )
}

function LibraryContents({
  libraryId,
  onCreatePractice,
}: {
  libraryId: string
  onCreatePractice: () => void
}) {
  const { data: lib } = useQuery({
    queryKey: ['library', libraryId],
    queryFn: () => api.getLibrary(libraryId),
  })
  const openTab = useWorkspace((s) => s.openTab)

  if (!lib) return null

  return (
    <div className={styles.contents}>
      <div className={styles.contentSection}>
        <div className={styles.contentHeader}>
          <span className={styles.contentTitle}>Practices</span>
          <button
            type="button"
            className={styles.addBtn}
            onClick={onCreatePractice}
            title="New practice"
          >
            +
          </button>
        </div>
        {lib._practices.map((p) => (
          <button
            type="button"
            key={p.id}
            className={styles.entityItem}
            onClick={() => openTab(libraryId, { type: 'practice', id: p.id }, loc(p.name) || p.id)}
          >
            {p.icon && <span className={styles.entityIcon}>{iconMap[p.icon] ?? '📿'}</span>}
            <span className={styles.entityName}>{loc(p.name) || p.id}</span>
          </button>
        ))}
      </div>

      {lib._prayers.length > 0 && (
        <div className={styles.contentSection}>
          <div className={styles.contentHeader}>
            <span className={styles.contentTitle}>Prayers</span>
          </div>
          {lib._prayers
            .filter((p) => p.id != null)
            .map((p) => (
              <button
                type="button"
                key={p.id}
                className={styles.entityItem}
                onClick={() =>
                  openTab(
                    libraryId,
                    { type: 'prayer', id: p.id as string },
                    loc(p.title) || (p.id as string),
                  )
                }
              >
                <span className={styles.entityName}>{loc(p.title) || p.id}</span>
              </button>
            ))}
        </div>
      )}

      {lib._books.length > 0 && (
        <div className={styles.contentSection}>
          <div className={styles.contentHeader}>
            <span className={styles.contentTitle}>Books</span>
          </div>
          {lib._books.map((b) => (
            <button
              type="button"
              key={b.id}
              className={styles.entityItem}
              onClick={() => openTab(libraryId, { type: 'book', id: b.id }, loc(b.name) || b.id)}
            >
              <span className={styles.entityIcon}>📖</span>
              <span className={styles.entityName}>{loc(b.name) || b.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
